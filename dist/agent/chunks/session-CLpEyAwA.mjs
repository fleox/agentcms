import { createRequire as __acmsRequire } from "node:module";
import { fileURLToPath as __acmsPath } from "node:url";
import { dirname as __acmsDirname } from "node:path";
const require2 = __acmsRequire(import.meta.url);
const __filename = __acmsPath(import.meta.url);
const __dirname = __acmsDirname(__filename);
import { r as resolveSite, b as readVersionInfo, d as adminUrlOf, f as fetchHostedAdmin, c as compareVersions, C as CliError, l as lockSite, h as requireCredential } from "../agentcms.mjs";
import { bootExtensionHost, importExtensionBundle } from "./extHost-Dwc-imen.mjs";
import "node:util";
import "node:fs";
import "node:path";
import "node:url";
import "node:os";
import "node:child_process";
import "node:http";
import "node:module";
function firstValue(subscribe) {
  return new Promise((resolve, reject) => {
    let unsub = null;
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
      }
    );
    if (done) unsub?.();
  });
}
async function signInBackend(site, host) {
  const runtime = site.runtime;
  if (runtime.backend === "local") {
    throw new CliError("unsupported-backend", `${site.alias} keeps its content in one browser (local mode).`, "Use the admin in that browser.");
  }
  const { resetRuntimeConfigCache } = await import("./runtimeConfig-2M2d2Pbu.mjs");
  window.__AGENTCMS_CONFIG__ = runtime;
  resetRuntimeConfigCache();
  host.storageRegistry.invalidateActiveStorageConnector();
  (await import("./posts-BwMIoSkg.mjs")).invalidateAllPostsCache();
  if (runtime.backend === "firebase") {
    if (!site.credentials.data) {
      throw new CliError(
        "credential-required",
        `No Firebase login recorded for ${site.alias}.`,
        "Store the admin account (`agentcms credentials set firebase:<name>`, email + password) and re-register the site with --data-credential firebase:<name>."
      );
    }
    const { email, password } = requireCredential(site.credentials.data).values;
    const { signInFirebase } = await import("../agentcms.mjs").then((n) => n.y);
    try {
      await signInFirebase(site.credentials.data, email, password);
    } catch (err) {
      const code = err.code ?? "";
      if (code === "auth/quota-exceeded" || code === "auth/too-many-requests") {
        throw new CliError(
          "firebase-rate-limited",
          `Firebase is rate-limiting sign-ins for ${email} (${code}).`,
          "Wait a few minutes before the next command, and group work into fewer commands (several refs per `content publish`, one `menus set`, one `--data` file…). The credentials are fine."
        );
      }
      if (code === "auth/network-request-failed") {
        throw new CliError("firebase-login", `Could not reach Firebase to sign in ${email}: ${code}.`, "Check the internet connection and retry.");
      }
      throw new CliError("firebase-login", `Firebase sign-in failed for ${email}: ${code || err.message}.`, "Check the account with `agentcms credentials set " + site.credentials.data + "` (email + password of an admin of this site).");
    }
    return;
  }
  const { openSiteStore } = await import("./siteData-C7jj_ArF.mjs");
  await openSiteStore(site);
}
async function wireHosting(site, host) {
  const { getStorageConfig } = await import("./registry-B41SEnnT.mjs").then((n) => n.C);
  const stored = await getStorageConfig().catch(() => null);
  const connectorId = stored?.connectorId ?? site.hosting.connectorId;
  if (!connectorId) throw new CliError("hosting-unknown", `The publish target of ${site.alias} is unknown.`);
  const values = site.credentials.hosting ? requireCredential(site.credentials.hosting).values : {};
  const settings = { ...site.hosting.settings, ...stored?.settings ?? {}, ...values };
  const { hostingConnector } = await import("./hosting-DTywukoL.mjs");
  const instance = hostingConnector({ connectorId, settings });
  host.storageRegistry.registerStorageConnector(instance);
  host.storageRegistry.invalidateActiveStorageConnector();
}
async function readRegistryFor(site, reader) {
  const { readBackendRegistryForCli } = await import("./sessionRegistry-DvJjkPlB.mjs");
  const stored = await readBackendRegistryForCli();
  if (stored) return stored;
  const { fallbackRegistry } = await import("./adminFiles-DpUDTP4Y.mjs");
  return fallbackRegistry(site, reader);
}
async function loadExtensions(site, host, out, warnings) {
  const { readAdminFile, siteHostingReader } = await import("./adminFiles-DpUDTP4Y.mjs");
  const reader = await siteHostingReader(site);
  const registry = await readRegistryFor(site, reader);
  host.registry.clearExternalPlugins();
  host.registry.clearExternalThemes();
  for (const [kind, list] of [["plugins", registry.plugins], ["themes", registry.themes]]) {
    for (const entry of list) {
      const path = entry.entryPath ?? `${kind}/${entry.id}/bundle.js`;
      try {
        const file = await readAdminFile(site, path, reader, { cacheKey: entry.version });
        if (!file) throw new Error("bundle not found on the site");
        const { manifest } = await importExtensionBundle(file.text);
        const m = manifest;
        if (!m || m.id !== entry.id) throw new Error("bundle does not export the expected manifest");
        if (entry.version && m.version && m.version !== entry.version) {
          warnings.push(
            `${kind === "plugins" ? "Plugin" : "Theme"} ${entry.id}: the site's registry says ${entry.version} but the bundle read from the ${file.source === "hosting" ? "hosting" : file.source === "site" ? "site" : "CLI build"} is ${m.version}. Pages render with ${m.version}; reinstall the package (ext install) if that's wrong.`
          );
        }
        if (kind === "plugins") {
          host.plugins.loadExternalPluginTranslations(m);
          host.registry.registerExternalPlugin(m);
          out.plugins.push(entry.id);
        } else {
          host.themes.loadExternalThemeTranslations(m);
          host.registry.registerExternalTheme(m);
          out.themes.push(entry.id);
        }
      } catch (err) {
        out.failed.push({ id: `${kind}/${entry.id}`, error: err.message });
      }
    }
  }
}
async function migrateLegacy(host) {
  const { readFileSync, existsSync } = await import("node:fs");
  const { join } = await import("node:path");
  const { distRoot } = await import("../agentcms.mjs").then((n) => n.x);
  const file = join(distRoot(), "admin", "external.default.json");
  if (!existsSync(file)) return;
  const defaults = JSON.parse(readFileSync(file, "utf8"));
  const { migrateLegacyIds } = await import("./legacyIds-BjAqh705.mjs");
  const { readBackendRegistryForCli, writeBackendRegistryForCli } = await import("./sessionRegistry-DvJjkPlB.mjs");
  const { getSettings, updateSettings } = await import("./settings-DZuDcOE5.mjs");
  await migrateLegacyIds({ readRegistry: readBackendRegistryForCli, writeRegistry: writeBackendRegistryForCli, defaults, getSettings, updateSettings });
}
async function openSession(alias, opts = {}) {
  const site = resolveSite(alias);
  const host = await bootExtensionHost();
  (await import("./imageNode-CiYHF8gS.mjs")).installNodeImageSupport();
  const warnings = [];
  const info = readVersionInfo();
  const adminUrl = adminUrlOf(site);
  const hosted = adminUrl ? await fetchHostedAdmin(adminUrl) : null;
  if (hosted?.version && compareVersions(hosted.version, info.version) !== 0) {
    warnings.push(
      `The site's admin is ${hosted.version}, this tool is ${info.version}: pages are rendered with ${info.version}'s publisher. Update the hosted admin (deploy-admin) to keep both in step.`
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
    const loaded = { plugins: [], themes: [], failed: [] };
    if (opts.extensions) {
      await loadExtensions(site, host, loaded, warnings);
      for (const f of loaded.failed) warnings.push(`Could not load ${f.id}: ${f.error}`);
    }
    const entries = [];
    const log = (e) => entries.push(e);
    const { getSettings } = await import("./settings-DZuDcOE5.mjs");
    let current = await getSettings();
    const apply = (s) => {
      host.plugins.applyPluginRegistration(s.enabledPlugins ?? {});
      host.themes.applyThemeRegistration(s.activeThemeId, s);
    };
    if (opts.extensions) apply(current);
    const session = {
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
        return (await import("./taxonomies-CjlJL2MS.mjs")).fetchAllTerms();
      },
      async users() {
        const { subscribeToUsers } = await import("./users-D6P4Wv2E.mjs").then((n) => n.u);
        return firstValue((cb, onErr) => subscribeToUsers(cb, onErr));
      },
      async media() {
        return (await import("./media-x49mFUWY.mjs").then((n) => n.n)).listAllMedia();
      },
      async context(o) {
        const [terms, users, media] = await Promise.all([session.terms(), session.users(), session.media()]);
        return host.publisher.buildPublishContext({
          terms,
          settings: current,
          users,
          authorLookup: host.users.buildAuthorLookup(users, media),
          refreshTerms: o?.refreshTerms
        });
      },
      close() {
        unlock?.();
      }
    };
    return session;
  } catch (err) {
    unlock?.();
    throw err;
  }
}
export {
  openSession
};
