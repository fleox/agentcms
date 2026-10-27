import type { PluginManifest } from "../../src/plugins";
import type { ThemeManifest } from "../../src/themes/types";
import type { SiteSettings, Term, UserRecord, Media } from "../../src/core/types";
import type { PublishContext, PublishLogEntry, PublishLogger } from "../../src/services/publisher";
import type { ExternalManifest } from "../../src/services/externalRegistry";
import { requireCredential } from "../credentials";
import { CliError } from "../output";
import { adminUrlOf, fetchHostedAdmin, fetchText, type HostedAdmin } from "../remote";
import { compareVersions } from "../semver";
import { lockSite, resolveSite, type SiteRecord } from "../sites";
import { readVersionInfo } from "../paths";
import { bootExtensionHost, importExtensionBundle, type HostModules } from "./extHost";

// A headless admin for one registered site: the same data backend
// (Firebase, Markdown in git, SQLite file), the same publish target, the
// same installed plugins and theme (their bundles are fetched from the
// hosted admin and imported through the import-map emulation), the same
// registrations — so every back-office action can run from the CLI with
// the admin's own code.

export interface SiteSession {
  site: SiteRecord;
  host: HostModules;
  hosted: HostedAdmin | null;
  warnings: string[];
  // Re-reads the settings and re-applies plugin + theme registrations
  // (the admin does this on every settings change).
  refresh(): Promise<SiteSettings>;
  settings(): SiteSettings;
  terms(): Promise<Term[]>;
  users(): Promise<UserRecord[]>;
  media(): Promise<Media[]>;
  // A fresh PublishContext (like the admin's Regenerate menu).
  context(opts?: { refreshTerms?: boolean }): Promise<PublishContext>;
  // Collects publisher log entries + toasts for the command's result.
  log: PublishLogger;
  entries: PublishLogEntry[];
  loadedExtensions: { plugins: string[]; themes: string[]; failed: Array<{ id: string; error: string }> };
  close(): void;
}

export interface OpenOptions {
  // Write access to the hosting is needed (publish, regenerate, sync).
  hosting?: boolean;
  // Data writes are about to happen: refuse when the hosted admin stores
  // a newer data format than this CLI understands.
  write?: boolean;
  // Load the site's installed plugins / themes (needed to render).
  extensions?: boolean;
  // Take the site lock for the duration (writes).
  lock?: boolean;
}

function firstValue<T>(subscribe: (cb: (v: T) => void, onErr?: (e: Error) => void) => () => void): Promise<T> {
  return new Promise((resolve, reject) => {
    let unsub: (() => void) | null = null;
    let done = false;
    unsub = subscribe(
      (v) => {
        if (done) return;
        done = true;
        resolve(v);
        queueMicrotask(() => unsub?.());
      },
      (e) => {
        if (done) return;
        done = true;
        reject(e);
      },
    );
    if (done) unsub?.();
  });
}

async function signInBackend(site: SiteRecord, host: HostModules): Promise<void> {
  const runtime = site.runtime;
  if (runtime.backend === "local") {
    throw new CliError("unsupported-backend", `${site.alias} keeps its content in one browser (local mode).`, "Use the admin in that browser.");
  }
  const { resetRuntimeConfigCache } = await import("../../src/lib/runtimeConfig");
  window.__AGENTCMS_CONFIG__ = runtime;
  resetRuntimeConfigCache();
  host.storageRegistry.invalidateActiveStorageConnector();
  (await import("../../src/services/posts")).invalidateAllPostsCache();
  if (runtime.backend === "firebase") {
    if (!site.credentials.data) {
      throw new CliError(
        "credential-required",
        `No Firebase login recorded for ${site.alias}.`,
        "Store the admin account (`agentcms credentials set firebase:<name>`, email + password) and re-register the site with --data-credential firebase:<name>.",
      );
    }
    const { email, password } = requireCredential(site.credentials.data).values;
    const { signInFirebase } = await import("../firebaseSession");
    try {
      await signInFirebase(site.credentials.data, email, password);
    } catch (err) {
      const code = (err as { code?: string }).code ?? "";
      if (code === "auth/quota-exceeded" || code === "auth/too-many-requests") {
        throw new CliError(
          "firebase-rate-limited",
          `Firebase is rate-limiting sign-ins for ${email} (${code}).`,
          "Wait a few minutes before the next command, and group work into fewer commands (several refs per `content publish`, one `menus set`, one `--data` file…). The credentials are fine.",
        );
      }
      if (code === "auth/network-request-failed") {
        throw new CliError("firebase-login", `Could not reach Firebase to sign in ${email}: ${code}.`, "Check the internet connection and retry.");
      }
      throw new CliError("firebase-login", `Firebase sign-in failed for ${email}: ${code || (err as Error).message}.`, "Check the account with `agentcms credentials set " + site.credentials.data + "` (email + password of an admin of this site).");
    }
    return;
  }
  const { openSiteStore } = await import("./siteData");
  await openSiteStore(site);
}

// Publish target with the secrets the site's hosting credential holds
// (docstore sites keep them out of the content; Firebase sites may store
// them in config/storage already).
async function wireHosting(site: SiteRecord, host: HostModules): Promise<void> {
  const { getStorageConfig } = await import("../../src/services/storageConfig");
  const stored = await getStorageConfig().catch(() => null);
  const connectorId = stored?.connectorId ?? site.hosting.connectorId;
  if (!connectorId) throw new CliError("hosting-unknown", `The publish target of ${site.alias} is unknown.`);
  const values = site.credentials.hosting ? requireCredential(site.credentials.hosting).values : {};
  const settings = { ...site.hosting.settings, ...(stored?.settings ?? {}), ...values };
  const instance = host.storageRegistry.instantiateStorageConnector(connectorId, settings);
  host.storageRegistry.registerStorageConnector(instance);
  host.storageRegistry.invalidateActiveStorageConnector();
}

async function readRegistryFor(site: SiteRecord): Promise<ExternalManifest> {
  const { readBackendRegistryForCli } = await import("./sessionRegistry");
  const stored = await readBackendRegistryForCli();
  if (stored) return stored;
  const adminUrl = adminUrlOf(site);
  for (const file of ["external.json", "external.default.json"]) {
    if (!adminUrl) break;
    const res = await fetchText(`${adminUrl}${file}`);
    if (!res.ok) continue;
    try {
      const v = JSON.parse(res.text) as Partial<ExternalManifest>;
      if (Array.isArray(v.plugins) || Array.isArray(v.themes)) return { plugins: v.plugins ?? [], themes: v.themes ?? [] };
    } catch {
      /* next */
    }
  }
  return { plugins: [], themes: [] };
}

// Imports every installed bundle: from the hosted admin when there is
// one (exactly what the admin loads), else from this CLI's own build for
// the bundled ones.
async function loadExtensions(site: SiteRecord, host: HostModules, out: SiteSession["loadedExtensions"]): Promise<void> {
  const { existsSync, readFileSync } = await import("node:fs");
  const { join } = await import("node:path");
  const { distRoot } = await import("../paths");
  const registry = await readRegistryFor(site);
  const adminUrl = adminUrlOf(site);
  host.registry.clearExternalPlugins();
  host.registry.clearExternalThemes();
  for (const [kind, list] of [["plugins", registry.plugins], ["themes", registry.themes]] as const) {
    for (const entry of list) {
      const path = entry.entryPath ?? `${kind}/${entry.id}/bundle.js`;
      try {
        let source: string | null = null;
        if (adminUrl) {
          const res = await fetchText(`${adminUrl}${path.replace(/^\/+/, "")}?v=${encodeURIComponent(entry.version ?? "")}`);
          if (res.ok && !/^\s*</.test(res.text)) source = res.text;
        }
        if (source == null) {
          const local = join(distRoot(), "admin", path);
          if (existsSync(local)) source = readFileSync(local, "utf8");
        }
        if (source == null) throw new Error("bundle not found on the site");
        const { manifest } = await importExtensionBundle(source);
        const m = manifest as { id?: string } | null;
        if (!m || m.id !== entry.id) throw new Error("bundle does not export the expected manifest");
        if (kind === "plugins") {
          host.plugins.loadExternalPluginTranslations(m as PluginManifest);
          host.registry.registerExternalPlugin(m as PluginManifest);
          out.plugins.push(entry.id);
        } else {
          host.themes.loadExternalThemeTranslations(m as ThemeManifest);
          host.registry.registerExternalTheme(m as ThemeManifest);
          out.themes.push(entry.id);
        }
      } catch (err) {
        out.failed.push({ id: `${kind}/${entry.id}`, error: (err as Error).message });
      }
    }
  }
}

// Same pre-0.2.0 id migration as the admin's boot (registry + settings).
async function migrateLegacy(host: HostModules): Promise<void> {
  const { readFileSync, existsSync } = await import("node:fs");
  const { join } = await import("node:path");
  const { distRoot } = await import("../paths");
  const file = join(distRoot(), "admin", "external.default.json");
  if (!existsSync(file)) return;
  const defaults = JSON.parse(readFileSync(file, "utf8")) as ExternalManifest;
  const { migrateLegacyIds } = await import("../../src/services/legacyIds");
  const { readBackendRegistryForCli, writeBackendRegistryForCli } = await import("./sessionRegistry");
  const { getSettings, updateSettings } = await import("../../src/services/settings");
  void host;
  await migrateLegacyIds({ readRegistry: readBackendRegistryForCli, writeRegistry: writeBackendRegistryForCli, defaults, getSettings, updateSettings });
}

export async function openSession(alias: string | undefined, opts: OpenOptions = {}): Promise<SiteSession> {
  const site = resolveSite(alias);
  const host = await bootExtensionHost();
  // Media uploads, favicons and logos use canvas in the browser; the CLI
  // swaps in WASM codecs.
  (await import("./imageNode")).installNodeImageSupport();
  const warnings: string[] = [];
  const info = readVersionInfo();
  const adminUrl = adminUrlOf(site);
  const hosted = adminUrl ? await fetchHostedAdmin(adminUrl) : null;
  if (hosted?.version && compareVersions(hosted.version, info.version) !== 0) {
    warnings.push(
      `The site's admin is ${hosted.version}, this tool is ${info.version}: pages are rendered with ${info.version}'s publisher. Update the hosted admin (deploy-admin) to keep both in step.`,
    );
  }
  if (opts.write && hosted?.dataSchema != null && hosted.dataSchema > info.dataSchema) {
    throw new CliError("data-too-new", `${site.alias} stores data format ${hosted.dataSchema}; this tool only knows ${info.dataSchema}.`, "Update agentcms (the skills) first.");
  }
  const unlock = opts.lock ? lockSite(site.alias) : null;
  try {
    await signInBackend(site, host);
    if (opts.write || opts.extensions) await migrateLegacy(host);
    if (opts.hosting) await wireHosting(site, host);
    const loaded: SiteSession["loadedExtensions"] = { plugins: [], themes: [], failed: [] };
    if (opts.extensions) {
      await loadExtensions(site, host, loaded);
      for (const f of loaded.failed) warnings.push(`Could not load ${f.id}: ${f.error}`);
    }
    const entries: PublishLogEntry[] = [];
    const log: PublishLogger = (e) => entries.push(e);
    const { getSettings } = await import("../../src/services/settings");
    let current: SiteSettings = await getSettings();
    const apply = (s: SiteSettings) => {
      host.plugins.applyPluginRegistration(s.enabledPlugins ?? {});
      host.themes.applyThemeRegistration(s.activeThemeId, s);
    };
    if (opts.extensions) apply(current);
    const session: SiteSession = {
      site,
      host,
      hosted,
      warnings,
      loadedExtensions: loaded,
      entries,
      log,
      settings: () => current,
      async refresh() {
        current = await getSettings();
        if (opts.extensions) apply(current);
        return current;
      },
      async terms() {
        return (await import("../../src/services/taxonomies")).fetchAllTerms();
      },
      async users() {
        const { subscribeToUsers } = await import("../../src/services/users");
        return firstValue<UserRecord[]>((cb, onErr) => subscribeToUsers(cb, onErr));
      },
      async media() {
        return (await import("../../src/services/media")).listAllMedia();
      },
      async context(o) {
        const [terms, users, media] = await Promise.all([session.terms(), session.users(), session.media()]);
        return host.publisher.buildPublishContext({
          terms,
          settings: current,
          users,
          authorLookup: host.users.buildAuthorLookup(users, media),
          refreshTerms: o?.refreshTerms,
        });
      },
      close() {
        unlock?.();
      },
    };
    return session;
  } catch (err) {
    unlock?.();
    throw err;
  }
}
