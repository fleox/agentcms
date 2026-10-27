import { installBrowserEnv } from "../browserEnv";
import { CliError, printResult } from "../output";
import { adminUrlOf, fetchHostedAdmin, fetchText } from "../remote";
import { compareVersions } from "../semver";
import { lockSite, resolveSite, type SiteRecord } from "../sites";
import type { CommandContext } from "../commands/types";
import type { BatchOp } from "../../src/services/storage/types";
import type { ExternalEntry, ExternalManifest } from "../../src/services/externalRegistry";

// `ext install | list | uninstall --site <alias>`: what the admin's
// Plugins / Themes → Install dialog does (services/externalUpload.ts),
// from the CLI — files go to <admin>/<plugins|themes>/<id>/ on the
// hosting in one batch (one commit on git hosts), then the entry is
// written to the site's registry in its content store. Without --yes
// only the plan is printed.

type Kind = "plugins" | "themes";

const TEXT = new Set(["js", "mjs", "json", "css", "html", "txt", "md", "svg", "xml"]);

function hostedApiCheck(hosted: Awaited<ReturnType<typeof fetchHostedAdmin>>, apiVersion: string, cliApi: { version: string; min: string }, cliVersion: string): string | null {
  const max = hosted.apiVersion ?? (hosted.version && hosted.version === cliVersion ? cliApi.version : null);
  const min = hosted.apiMinVersion ?? (max ? cliApi.min : null);
  if (!max) return null;
  if (compareVersions(apiVersion, max) > 0) return `the site's admin (${hosted.version}) loads extension API ≤ ${max}, this package needs ${apiVersion} — update the admin first (agentcms deploy-admin)`;
  if (min && compareVersions(apiVersion, min) < 0) return `apiVersion ${apiVersion} is older than the admin's minimum ${min}`;
  return null;
}

async function readSiteRegistry(site: SiteRecord): Promise<{ registry: ExternalManifest; seeded: boolean }> {
  const { readBackendRegistry } = await import("../../src/services/docstore/externalRegistryStore");
  const stored = await readBackendRegistry();
  if (stored) return { registry: stored, seeded: false };
  // Same fallback as the admin's first boot: the build's defaults.
  const adminUrl = adminUrlOf(site);
  for (const file of ["external.json", "external.default.json"]) {
    if (!adminUrl) break;
    const res = await fetchText(`${adminUrl}${file}`);
    if (!res.ok) continue;
    try {
      const v = JSON.parse(res.text) as Partial<ExternalManifest>;
      if (Array.isArray(v.plugins) || Array.isArray(v.themes)) {
        return { registry: { plugins: v.plugins ?? [], themes: v.themes ?? [] }, seeded: true };
      }
    } catch {
      /* next */
    }
  }
  return { registry: { plugins: [], themes: [] }, seeded: true };
}

export async function installExtensionCommand({ io, options, positionals }: CommandContext): Promise<number | void> {
  const [action, arg] = positionals;
  installBrowserEnv();
  const site = resolveSite(options.site as string | undefined);
  const adminUrl = adminUrlOf(site);

  if (action === "list") {
    const { openSiteStore } = await import("./siteData");
    await openSiteStore(site);
    const { registry } = await readSiteRegistry(site);
    const { getDocStore } = await import("../../src/services/docstore");
    const settings = getDocStore().get("settings", "site") as { activeThemeId?: string; enabledPlugins?: Record<string, boolean> } | undefined;
    const data = {
      site: site.alias,
      activeTheme: settings?.activeThemeId ?? "default",
      plugins: registry.plugins.map((e) => ({ ...e, enabled: settings?.enabledPlugins?.[e.id] !== false })),
      themes: registry.themes.map((e) => ({ ...e, active: (settings?.activeThemeId ?? "default") === e.id })),
    };
    printResult(io, data, () =>
      [
        `${site.alias} — active theme: ${data.activeTheme}`,
        "Plugins:",
        ...data.plugins.map((p) => `  ${p.enabled ? "on " : "off"} ${p.id} ${p.version} (api ${p.apiVersion})`),
        "Themes:",
        ...data.themes.map((t) => `  ${t.active ? "*" : " "} ${t.id} ${t.version} (api ${t.apiVersion})`),
      ].join("\n"),
    );
    return;
  }

  if (!site.adminFolder || !adminUrl) throw new CliError("not-hosted", `${site.alias} has no hosted admin.`, "Extensions are installed next to the hosted admin.");
  const { siteHostingTarget, openSiteStore } = await import("./siteData");
  const target = siteHostingTarget(site);
  const { readVersionInfo } = await import("../paths");
  const info = readVersionInfo();

  if (action === "uninstall") {
    const id = arg;
    if (!id) throw new CliError("usage", "ext uninstall needs the extension id.", undefined, 2);
    await openSiteStore(site);
    const { registry } = await readSiteRegistry(site);
    const kind: Kind | null = registry.plugins.some((e) => e.id === id) ? "plugins" : registry.themes.some((e) => e.id === id) ? "themes" : null;
    if (!kind) throw new CliError("not-installed", `${id} is not installed on ${site.alias}.`, "See `agentcms ext list --site <alias>`.");
    const { getDocStore } = await import("../../src/services/docstore");
    const settings = getDocStore().get("settings", "site") as { activeThemeId?: string } | undefined;
    if (kind === "themes" && settings?.activeThemeId === id) {
      throw new CliError("theme-active", `${id} is the active theme of ${site.alias}.`, "Activate another theme in the admin (then regenerate) before uninstalling it.");
    }
    const folder = `${site.adminFolder}/${kind}/${id}`;
    const plan = { site: site.alias, action: "uninstall", kind: kind === "plugins" ? "plugin" : "theme", id, deletes: `${folder}/` };
    if (!options.yes) {
      printResult(io, { needsConfirmation: true, plan }, () => `${site.alias}: would remove ${plan.kind} ${id} (registry entry + ${folder}/). Nothing changed — re-run with --yes once the user agrees.`);
      return;
    }
    const unlock = lockSite(site.alias);
    try {
      const { writeBackendRegistry } = await import("../../src/services/docstore/externalRegistryStore");
      // Registry first: a half-deleted folder must never stay referenced.
      await writeBackendRegistry({ ...registry, [kind]: registry[kind].filter((e) => e.id !== id) });
      const { applyOps, hostingConnector } = await import("./hosting");
      const connector = hostingConnector(target);
      await applyOps(connector, [{ type: "deletePrefix", path: folder }]);
    } finally {
      unlock();
    }
    printResult(io, { uninstalled: true, ...plan, next: ["Reload the admin. Pages published with this extension keep its output until they are regenerated (Regenerate → Everything)."] }, () => `Removed ${id} from ${site.alias}.`);
    return;
  }

  if (action !== "install") throw new CliError("usage", `Unknown action ${action}.`, undefined, 2);
  if (!arg) throw new CliError("usage", "ext install needs the package: its .zip, project folder or unpacked folder.", undefined, 2);
  const { readExtensionPackage } = await import("./extPackage");
  const { checkExtension } = await import("./extCheck");
  const pkg = await readExtensionPackage(arg);
  const report = await checkExtension(pkg);
  if (!report.valid) {
    printResult(io, { installed: false, reason: "check-failed", check: report }, () =>
      ["Not installed: `ext check` found errors:", ...report.errors.map((e) => `  [${e.code}] ${e.message}`)].join("\n"),
    );
    return 1;
  }
  const id = report.id!;
  const kind: Kind = report.kind === "theme" ? "themes" : "plugins";
  const hosted = await fetchHostedAdmin(adminUrl);
  const refused = hostedApiCheck(hosted, report.apiVersion!, report.hostApi, info.version);
  if (refused) throw new CliError("api-incompatible", `Not installed: ${refused}.`);

  await openSiteStore(site);
  const { registry, seeded } = await readSiteRegistry(site);
  const existing = registry[kind].find((e) => e.id === id);
  const other = (kind === "plugins" ? registry.themes : registry.plugins).find((e) => e.id === id);
  if (other) throw new CliError("id-taken", `A ${kind === "plugins" ? "theme" : "plugin"} with id ${id} is already installed.`, "Pick another id.");
  const folder = `${site.adminFolder}/${kind}/${id}`;
  const files = [...pkg.files.keys()].sort();
  const entry: ExternalEntry = { id, version: report.version!, apiVersion: report.apiVersion!, entryPath: `${kind}/${id}/${pkg.entry}` };
  const plan = {
    site: site.alias,
    adminUrl,
    action: existing ? "upgrade" : "install",
    kind: report.kind,
    id,
    from: existing?.version ?? null,
    to: entry.version,
    folder: `${folder}/`,
    files,
    activate: !!options.activate,
    warnings: report.warnings,
  };
  if (!options.yes) {
    printResult(io, { needsConfirmation: true, plan }, () =>
      [
        `${site.alias}: ${plan.action} ${plan.kind} ${id} ${plan.from ? `${plan.from} → ` : ""}${plan.to} — ${files.length} files into ${folder}/${plan.activate ? ", then activate it" : ""}.`,
        ...report.warnings.map((w) => `  warn [${w.code}] ${w.message}`),
        "Nothing changed — re-run with --yes once the user agrees.",
      ].join("\n"),
    );
    return;
  }

  const unlock = lockSite(site.alias);
  const { collectToasts, settleHosting } = await import("./install");
  const toasts = collectToasts();
  try {
    const { applyOps, hostingConnector } = await import("./hosting");
    const connector = hostingConnector(target);
    const ops: BatchOp[] = [];
    if (existing) ops.push({ type: "deletePrefix", path: folder });
    for (const f of files) {
      const buf = pkg.files.get(f)!;
      const ext = f.split(".").pop()?.toLowerCase() ?? "";
      ops.push(TEXT.has(ext) ? { type: "put", path: `${folder}/${f}`, content: buf.toString("utf8") } : { type: "put", path: `${folder}/${f}`, content: buf.toString("base64"), encoding: "base64" });
    }
    let activated: string | null = null;
    if (options.activate && kind === "themes") {
      // The theme's CSS + runtime scripts, with the site's saved config
      // baked in — what "Sync theme assets" uploads.
      const { importExtensionBundle } = await import("./extHost");
      const { bundleSource } = await import("./extPackage");
      const { manifest } = await importExtensionBundle(bundleSource(pkg)!);
      const theme = manifest as import("../../src/themes/types").ThemeManifest;
      const { getDocStore } = await import("../../src/services/docstore");
      const settings = (getDocStore().get("settings", "site") ?? {}) as { themeConfigs?: Record<string, unknown> };
      let css = theme.cssText;
      if (theme.compileCss && theme.settings) css = theme.compileCss({ ...(theme.settings.defaultConfig as object), ...((settings.themeConfigs?.[id] as object) ?? {}) });
      ops.push({ type: "put", path: `theme-assets/${id}.css`, content: css });
      if (theme.jsText) ops.push({ type: "put", path: `theme-assets/${id}-menu.js`, content: theme.jsText });
      if (theme.jsTextPosts) ops.push({ type: "put", path: `theme-assets/${id}-posts.js`, content: theme.jsTextPosts });
    }
    io.err(`• ${site.alias}: uploading ${files.length} files to ${folder}/…`);
    await applyOps(connector, ops);
    await settleHosting(target);
    const { writeBackendRegistry } = await import("../../src/services/docstore/externalRegistryStore");
    const next: ExternalManifest = {
      plugins: [...registry.plugins],
      themes: [...registry.themes],
    };
    const i = next[kind].findIndex((e) => e.id === id);
    if (i >= 0) next[kind][i] = entry;
    else next[kind].push(entry);
    await writeBackendRegistry(next);
    if (options.activate) {
      const { updateSettings, getSettings } = await import("../../src/services/settings");
      if (kind === "themes") {
        await updateSettings({ activeThemeId: id });
        activated = `theme ${id} is now the active theme`;
      } else {
        const s = await getSettings();
        await updateSettings({ enabledPlugins: { ...s.enabledPlugins, [id]: true } });
        activated = `plugin ${id} is enabled`;
      }
    }
    const nextSteps = [
      `Reload the admin (${adminUrl}) so it loads the new bundle.`,
      kind === "themes"
        ? activated
          ? "Then Regenerate → Everything so every page is re-rendered with the new theme."
          : "Activate it in Themes, then Regenerate → Everything."
        : "Its hooks run on the next publish; Regenerate → Everything applies it to existing pages.",
    ];
    printResult(io, { installed: true, ...plan, seededRegistry: seeded, activated, next: nextSteps, notices: toasts.notices }, () =>
      [`${plan.action === "upgrade" ? "Upgraded" : "Installed"} ${plan.kind} ${id} ${plan.to} on ${site.alias}.${activated ? ` ${activated}.` : ""}`, ...nextSteps].join("\n"),
    );
  } finally {
    toasts.stop();
    unlock();
  }
}
