import { createRequire as __acmsRequire } from "node:module";
import { fileURLToPath as __acmsPath } from "node:url";
import { dirname as __acmsDirname } from "node:path";
const require2 = __acmsRequire(import.meta.url);
const __filename = __acmsPath(import.meta.url);
const __dirname = __acmsDirname(__filename);
import { a as installBrowserEnv, r as resolveSite, e as adminUrlOf, p as printResult, C as CliError, l as lockSite, f as fetchHostedAdmin, h as secureAdminUrlOf, d as compareVersions } from "../agentcms.mjs";
import "node:util";
import "node:fs";
import "node:path";
import "node:url";
import "node:os";
import "node:child_process";
import "node:crypto";
import "node:http";
const TEXT = /* @__PURE__ */ new Set(["js", "mjs", "json", "css", "html", "txt", "md", "svg", "xml"]);
function hostedApiCheck(hosted, apiVersion, cliApi, cliVersion) {
  const max = hosted.apiVersion ?? (hosted.version && hosted.version === cliVersion ? cliApi.version : null);
  const min = hosted.apiMinVersion ?? (max ? cliApi.min : null);
  if (!max) return null;
  if (compareVersions(apiVersion, max) > 0) return `the site's admin (${hosted.version}) loads extension API ≤ ${max}, this package needs ${apiVersion} — update the admin first (agentcms deploy-admin)`;
  if (min && compareVersions(apiVersion, min) < 0) return `apiVersion ${apiVersion} is older than the admin's minimum ${min}`;
  return null;
}
async function readSiteRegistry(site) {
  const { readBackendRegistryForCli } = await import("./sessionRegistry-dNsxWJXX.mjs");
  const stored = await readBackendRegistryForCli();
  if (stored) return { registry: stored, seeded: false };
  const { fallbackRegistry, siteHostingReader } = await import("./adminFiles-CQ4zdfWf.mjs");
  return { registry: await fallbackRegistry(site, await siteHostingReader(site)), seeded: true };
}
async function siteSettings() {
  const { getSettings } = await import("./settings-DPwLbbxb.mjs");
  return await getSettings();
}
async function connectSiteData(site) {
  const { connectSiteData: connect } = await import("./session-CWJ_kaiG.mjs");
  await connect(site);
}
async function siteHostingTargetFor(site) {
  const { siteHostingTargetFor: resolve } = await import("./session-CWJ_kaiG.mjs");
  return resolve(site);
}
async function installExtensionCommand({ io, options, positionals }) {
  const [action, arg] = positionals;
  installBrowserEnv();
  const site = resolveSite(options.site);
  const adminUrl = adminUrlOf(site);
  if (action === "list") {
    await connectSiteData(site);
    const { registry: registry2 } = await readSiteRegistry(site);
    const settings = await siteSettings();
    const data = {
      site: site.alias,
      activeTheme: settings?.activeThemeId ?? "default",
      plugins: registry2.plugins.map((e) => ({ ...e, enabled: settings?.enabledPlugins?.[e.id] !== false })),
      themes: registry2.themes.map((e) => ({ ...e, active: (settings?.activeThemeId ?? "default") === e.id }))
    };
    printResult(
      io,
      data,
      () => [
        `${site.alias} — active theme: ${data.activeTheme}`,
        "Plugins:",
        ...data.plugins.map((p) => `  ${p.enabled ? "on " : "off"} ${p.id} ${p.version} (api ${p.apiVersion})`),
        "Themes:",
        ...data.themes.map((t) => `  ${t.active ? "*" : " "} ${t.id} ${t.version} (api ${t.apiVersion})`)
      ].join("\n")
    );
    return;
  }
  if (!site.adminFolder || !adminUrl) throw new CliError("not-hosted", `${site.alias} has no hosted admin.`, "Extensions are installed next to the hosted admin.");
  const { readVersionInfo } = await import("../agentcms.mjs").then((n) => n.y);
  const info = readVersionInfo();
  if (action === "uninstall") {
    const id2 = arg;
    if (!id2) throw new CliError("usage", "ext uninstall needs the extension id.", void 0, 2);
    await connectSiteData(site);
    const target2 = await siteHostingTargetFor(site);
    const { registry: registry2 } = await readSiteRegistry(site);
    const kind2 = registry2.plugins.some((e) => e.id === id2) ? "plugins" : registry2.themes.some((e) => e.id === id2) ? "themes" : null;
    if (!kind2) throw new CliError("not-installed", `${id2} is not installed on ${site.alias}.`, "See `agentcms ext list --site <alias>`.");
    const settings = await siteSettings();
    if (kind2 === "themes" && settings?.activeThemeId === id2) {
      throw new CliError("theme-active", `${id2} is the active theme of ${site.alias}.`, `Switch to another theme first: \`agentcms themes activate <id> --site ${site.alias} --yes\`.`);
    }
    const folder2 = `${site.adminFolder}/${kind2}/${id2}`;
    const plan2 = { site: site.alias, action: "uninstall", kind: kind2 === "plugins" ? "plugin" : "theme", id: id2, deletes: `${folder2}/` };
    if (!options.yes) {
      printResult(io, { needsConfirmation: true, plan: plan2 }, () => `${site.alias}: would remove ${plan2.kind} ${id2} (registry entry + ${folder2}/). Nothing changed — re-run with --yes once the user agrees.`);
      return;
    }
    const unlock2 = lockSite(site.alias);
    try {
      const { writeBackendRegistryForCli: writeBackendRegistry } = await import("./sessionRegistry-dNsxWJXX.mjs");
      await writeBackendRegistry({ ...registry2, [kind2]: registry2[kind2].filter((e) => e.id !== id2) });
      const { applyOps, hostingConnector } = await import("./hosting-Clz31E-S.mjs");
      const connector = hostingConnector(target2);
      await applyOps(connector, [{ type: "deletePrefix", path: folder2 }]);
    } finally {
      unlock2();
    }
    printResult(io, { uninstalled: true, ...plan2, next: [`Pages published with this extension keep its output until they are regenerated: \`agentcms regenerate everything --site ${site.alias}\`.`, "Browsers that already opened the admin drop it after a reload."] }, () => `Removed ${id2} from ${site.alias}.`);
    return;
  }
  if (action !== "install") throw new CliError("usage", `Unknown action ${action}.`, void 0, 2);
  if (!arg) throw new CliError("usage", "ext install needs the package: its .zip, project folder or unpacked folder.", void 0, 2);
  const { readExtensionPackage } = await import("./extPackage-4xwZnrUQ.mjs");
  const { checkExtension } = await import("./extCheck-iFt7IjPC.mjs");
  const pkg = await readExtensionPackage(arg);
  const report = await checkExtension(pkg);
  if (!report.valid) {
    printResult(
      io,
      { installed: false, reason: "check-failed", check: report },
      () => ["Not installed: `ext check` found errors:", ...report.errors.map((e) => `  [${e.code}] ${e.message}`)].join("\n")
    );
    return 1;
  }
  const id = report.id;
  const kind = report.kind === "theme" ? "themes" : "plugins";
  const hosted = await fetchHostedAdmin(adminUrl);
  const refused = hostedApiCheck(hosted, report.apiVersion, report.hostApi, info.version);
  if (refused) throw new CliError("api-incompatible", `Not installed: ${refused}.`);
  await connectSiteData(site);
  const target = await siteHostingTargetFor(site);
  const { registry, seeded } = await readSiteRegistry(site);
  const existing = registry[kind].find((e) => e.id === id);
  const other = (kind === "plugins" ? registry.themes : registry.plugins).find((e) => e.id === id);
  if (other) throw new CliError("id-taken", `A ${kind === "plugins" ? "theme" : "plugin"} with id ${id} is already installed.`, "Pick another id.");
  const folder = `${site.adminFolder}/${kind}/${id}`;
  const files = [...pkg.files.keys()].sort();
  const entry = { id, version: report.version, apiVersion: report.apiVersion, entryPath: `${kind}/${id}/${pkg.entry}` };
  const plan = {
    site: site.alias,
    // The address the admin is opened at (S3: the bucket's https endpoint).
    adminUrl: secureAdminUrlOf(site) ?? adminUrl,
    action: existing ? "upgrade" : "install",
    kind: report.kind,
    id,
    from: existing?.version ?? null,
    to: entry.version,
    folder: `${folder}/`,
    files,
    activate: !!options.activate,
    warnings: report.warnings
  };
  if (!options.yes) {
    printResult(
      io,
      { needsConfirmation: true, plan },
      () => [
        `${site.alias}: ${plan.action} ${plan.kind} ${id} ${plan.from ? `${plan.from} → ` : ""}${plan.to} — ${files.length} files into ${folder}/${plan.activate ? ", then activate it" : ""}.`,
        ...report.warnings.map((w) => `  warn [${w.code}] ${w.message}`),
        "Nothing changed — re-run with --yes once the user agrees."
      ].join("\n")
    );
    return;
  }
  const unlock = lockSite(site.alias);
  const { collectToasts, settleHosting } = await import("./install-BcThJoDF.mjs");
  const toasts = collectToasts();
  try {
    const { applyOps, hostingConnector } = await import("./hosting-Clz31E-S.mjs");
    const connector = hostingConnector(target);
    const ops = [];
    if (existing) ops.push({ type: "deletePrefix", path: folder });
    for (const f of files) {
      const buf = pkg.files.get(f);
      const ext = f.split(".").pop()?.toLowerCase() ?? "";
      ops.push(TEXT.has(ext) ? { type: "put", path: `${folder}/${f}`, content: buf.toString("utf8") } : { type: "put", path: `${folder}/${f}`, content: buf.toString("base64"), encoding: "base64" });
    }
    let activated = null;
    if (options.activate && kind === "themes") {
      const { importExtensionBundle } = await import("./extHost-Dj47FMGv.mjs");
      const { bundleSource } = await import("./extPackage-4xwZnrUQ.mjs");
      const { manifest } = await importExtensionBundle(bundleSource(pkg));
      const theme = manifest;
      const settings = await siteSettings() ?? {};
      let css = theme.cssText;
      if (theme.compileCss && theme.settings) css = theme.compileCss({ ...theme.settings.defaultConfig, ...settings.themeConfigs?.[id] ?? {} });
      ops.push({ type: "put", path: `theme-assets/${id}.css`, content: css });
      if (theme.jsText) ops.push({ type: "put", path: `theme-assets/${id}-menu.js`, content: theme.jsText });
      if (theme.jsTextPosts) ops.push({ type: "put", path: `theme-assets/${id}-posts.js`, content: theme.jsTextPosts });
    }
    io.err(`• ${site.alias}: uploading ${files.length} files to ${folder}/…`);
    await applyOps(connector, ops);
    await settleHosting(target);
    const { writeBackendRegistryForCli: writeBackendRegistry } = await import("./sessionRegistry-dNsxWJXX.mjs");
    const next = {
      plugins: [...registry.plugins],
      themes: [...registry.themes]
    };
    const i = next[kind].findIndex((e) => e.id === id);
    if (i >= 0) next[kind][i] = entry;
    else next[kind].push(entry);
    await writeBackendRegistry(next);
    if (options.activate) {
      const { updateSettings, getSettings } = await import("./settings-DPwLbbxb.mjs");
      if (kind === "themes") {
        await updateSettings({ activeThemeId: id });
        activated = `theme ${id} is now the active theme`;
      } else {
        const s = await getSettings();
        await updateSettings({ enabledPlugins: { ...s.enabledPlugins, [id]: true } });
        activated = `plugin ${id} is enabled`;
      }
    }
    const current = await siteSettings() ?? {};
    const inUse = kind === "themes" ? current.activeThemeId === id : current.enabledPlugins?.[id] !== false;
    const affectsPages = !!activated || inUse;
    let regenerated = null;
    let mediaMissingFormats = 0;
    if (affectsPages && !options["no-regenerate"]) {
      io.err(`• ${site.alias}: regenerating the whole site with ${id} ${entry.version}…`);
      const { openSession } = await import("./session-CWJ_kaiG.mjs");
      const { subscribeToToasts } = await import("./toast-CYyyaSAW.mjs");
      const errors = [];
      const stopToasts = subscribeToToasts((t) => {
        if (t.level === "error") errors.push(t.message);
      });
      const s = await openSession(site.alias, { write: true, hosting: true, extensions: true });
      try {
        const { regenerateEverything } = await import("./regenerateAll-B-btE5PT.mjs");
        const r = await regenerateEverything(s);
        await (await import("./batch-D8QeLwrl.mjs")).flushImplicitBatch();
        for (const e of s.entries) if (e.level === "error") errors.push(e.message);
        for (const w of s.warnings) toasts.notices.push({ level: "warn", message: w });
        regenerated = { seconds: r.seconds, errors };
        if (kind === "themes" && activated) {
          const { planMediaRegeneration } = await import("./mediaRegenerate-CQN5Ax2s.mjs");
          mediaMissingFormats = planMediaRegeneration(await s.media(), s.settings()).filter((m) => m.formats.length).length;
        }
      } finally {
        stopToasts();
        s.close();
      }
    }
    const regenCmd = `agentcms regenerate everything --site ${site.alias}`;
    const nextSteps = [];
    if (regenerated) {
      nextSteps.push(`Site regenerated with ${id} ${entry.version}${regenerated.errors.length ? ` (${regenerated.errors.length} error(s): see regenerated.errors)` : ""}.`);
    } else if (affectsPages) {
      nextSteps.push(`Run \`${regenCmd}\` to re-render every page with ${id} ${entry.version}.`);
    } else if (kind === "themes") {
      nextSteps.push(`Not active: \`agentcms themes activate ${id} --site ${site.alias} --yes\` switches to it and regenerates the site.`);
    } else {
      nextSteps.push(`Disabled on this site: \`agentcms plugins enable ${id} --site ${site.alias}\`, then \`${regenCmd}\`.`);
    }
    if (mediaMissingFormats) nextSteps.push(`${mediaMissingFormats} media lack ${id}'s image formats: \`agentcms media regenerate --site ${site.alias} --yes\`, then \`agentcms regenerate all --site ${site.alias}\`.`);
    nextSteps.push(`Browsers that already opened the admin (${plan.adminUrl}) load the new bundle after a reload.`);
    printResult(
      io,
      { installed: true, ...plan, seededRegistry: seeded, activated, regenerated, next: nextSteps, notices: toasts.notices },
      () => [`${plan.action === "upgrade" ? "Upgraded" : "Installed"} ${plan.kind} ${id} ${plan.to} on ${site.alias}.${activated ? ` ${activated}.` : ""}`, ...nextSteps].join("\n")
    );
    return regenerated?.errors.length ? 1 : void 0;
  } finally {
    toasts.stop();
    unlock();
  }
}
export {
  installExtensionCommand
};
