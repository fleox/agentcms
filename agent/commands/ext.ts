import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { basename, dirname, join, resolve } from "node:path";
import { CliError, printResult } from "../output";
import type { Command, CommandContext } from "./types";

// `agentcms ext …` — build, test and ship AgentCMS plugins and themes.
// Everything except install / list / uninstall runs locally: the admin's
// own runtime, loader and publisher are reused in Node (ops/extHost.ts),
// so a bundle that passes `ext check` behaves the same in the admin.

function parseJsonOption(name: string, value: unknown): Record<string, unknown> | undefined {
  if (value == null || value === "") return undefined;
  try {
    const parsed = JSON.parse(String(value));
    if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) return parsed as Record<string, unknown>;
  } catch {
    /* fall through */
  }
  throw new CliError("usage", `--${name} must be a JSON object.`, `Example: --${name} '{"key":"value"}'`, 2);
}

function list(value: unknown): string[] {
  return value ? String(value).split(",").map((s) => s.trim()).filter(Boolean) : [];
}

async function loadAll(paths: string[]) {
  const [{ readExtensionPackage, bundleSource }, { importExtensionBundle }] = await Promise.all([
    import("../ops/extPackage"),
    import("../ops/extHost"),
  ]);
  const out = [];
  for (const p of paths) {
    const pkg = await readExtensionPackage(p);
    const code = bundleSource(pkg);
    if (code == null) throw new CliError("no-bundle", `${p}: ${pkg.entry} not found.`, pkg.sourceType === "project" ? "Build it first (npm run build)." : undefined);
    const { manifest } = await importExtensionBundle(code);
    const m = manifest as { id?: string; templates?: unknown } | null;
    if (!m || typeof m.id !== "string") throw new CliError("no-export", `${p}: the bundle exports no manifest.`, "Run `agentcms ext check` on it.");
    out.push({ kind: (m.templates ? "theme" : "plugin") as "plugin" | "theme", id: m.id, manifest: m as never, pkg });
  }
  return out;
}

async function check({ io, options, positionals }: CommandContext) {
  const target = positionals[1];
  if (!target) throw new CliError("usage", "ext check needs a path: the project folder, an unpacked package or the .zip.", undefined, 2);
  const kind = options.kind as string | undefined;
  if (kind && kind !== "plugin" && kind !== "theme") throw new CliError("usage", "--kind is plugin or theme.", undefined, 2);
  const { readExtensionPackage } = await import("../ops/extPackage");
  const { checkExtension } = await import("../ops/extCheck");
  const pkg = await readExtensionPackage(target);
  const report = await checkExtension(pkg, {
    kind: kind as "plugin" | "theme" | undefined,
    previewDir: options["keep-preview"] || options.out ? resolve(String(options["keep-preview"] || options.out)) : undefined,
  });
  printResult(io, report, () => {
    const lines = [
      `${report.valid ? "PASS" : "FAIL"}  ${report.kind ?? "?"} ${report.id ?? "?"} ${report.version ?? ""} (apiVersion ${report.apiVersion ?? "?"}, admin API ${report.hostApi.version})`,
      ...report.errors.map((e) => `  error  [${e.code}] ${e.message}${e.hint ? `\n         → ${e.hint}` : ""}`),
      ...report.warnings.map((w) => `  warn   [${w.code}] ${w.message}${w.hint ? `\n         → ${w.hint}` : ""}`),
    ];
    if (report.registered) {
      const r = report.registered;
      const parts = [
        r.filters.length && `filters: ${r.filters.map((f) => f.hook).join(", ")}`,
        r.actions.length && `actions: ${r.actions.map((a) => a.hook).join(", ")}`,
        r.blocks.length && `blocks: ${r.blocks.join(", ")}`,
        r.dashboardCards.length && `dashboard cards: ${r.dashboardCards.join(", ")}`,
      ].filter(Boolean);
      if (parts.length) lines.push(`  registers ${parts.join("; ")}`);
    }
    for (const b of report.blocks ?? []) {
      lines.push(`  block ${b.id}: stored as ${b.markdown ? JSON.stringify(b.markdown.slice(0, 90)) + (b.markdown.length > 90 ? "…" : "") : "(nothing)"}`);
    }
    if (report.output) {
      if (report.output.added.length) lines.push(`  adds ${report.output.added.length} file(s): ${report.output.added.slice(0, 12).join(", ")}${report.output.added.length > 12 ? ", …" : ""}`);
      if (report.output.changed.length) lines.push(`  changes ${report.output.changed.length} file(s): ${report.output.changed.slice(0, 12).join(", ")}${report.output.changed.length > 12 ? ", …" : ""}`);
      for (const st of report.output.lifecycle ?? []) {
        const parts = [
          st.added.length && `adds ${st.added.join(", ")}`,
          st.changed.length && `changes ${st.changed.join(", ")}`,
          st.removed.length && `removes ${st.removed.join(", ")}`,
        ].filter(Boolean);
        lines.push(`  on ${st.step}: ${parts.length ? parts.join("; ") : "nothing of its own"}`);
      }
      if (report.output.previewDir) lines.push(`  demo site kept in ${report.output.previewDir}`);
    }
    return lines.join("\n");
  });
  return report.valid ? 0 : 1;
}

async function freePort(from: number): Promise<number> {
  const { createServer } = await import("node:net");
  for (let p = from; p < from + 50; p++) {
    const free = await new Promise<boolean>((resolve) => {
      const srv = createServer();
      srv.once("error", () => resolve(false));
      srv.listen(p, "127.0.0.1", () => srv.close(() => resolve(true)));
    });
    if (free) return p;
  }
  return from;
}

async function preview({ io, options, positionals }: CommandContext) {
  const paths = positionals.slice(1);
  const exts = await loadAll(paths);
  const { renderPreview } = await import("../ops/extPreview");
  // Links in the rendered pages carry the port: pick it before rendering.
  // Without --port, the first free one from 4321 (other previews may run).
  const port = options.port !== undefined ? Number(options.port) : await freePort(4321);
  if (!Number.isInteger(port) || port < 1 || port > 65535) throw new CliError("usage", `Invalid port: ${options.port}`, undefined, 2);
  const outDir = resolve(String(options.out ?? join(tmpdir(), `agentcms-preview-${exts.map((e) => e.id).join("+") || "default"}`)));
  let content;
  let siteAlias: string | undefined;
  let siteTheme: { kind: "theme"; id: string; manifest: never } | null = null;
  if (options.site) {
    const { snapshotSiteContent } = await import("../ops/extSiteContent");
    const snap = await snapshotSiteContent(String(options.site));
    content = snap.content;
    siteAlias = snap.alias;
    // Previewing a plugin: render it inside the site's own theme.
    if (snap.themeBundle && !exts.some((e) => e.kind === "theme") && !options.theme) {
      const { importExtensionBundle } = await import("../ops/extHost");
      const { manifest } = await importExtensionBundle(snap.themeBundle);
      const m = manifest as { id?: string; templates?: unknown } | null;
      if (m?.id && m.templates) siteTheme = { kind: "theme" as const, id: m.id, manifest: m as never };
    }
  }
  const rawBase = options["base-path"] ? String(options["base-path"]) : "";
  if (rawBase && !/^\/?[a-z0-9._~-]+(?:\/[a-z0-9._~-]+)*\/?$/i.test(rawBase)) {
    throw new CliError("usage", `Invalid --base-path "${rawBase}".`, "Example: --base-path /blog", 2);
  }
  const basePath = rawBase ? "/" + rawBase.replace(/^\/+|\/+$/g, "") : "";
  const baseUrl = `http://localhost:${port}${basePath}`;
  if (options.home && options.home !== "blocks") throw new CliError("usage", `--home takes "blocks".`, 'Use --settings \'{"homeMode":"static-page","homePageId":"page-about"}\' for another page.', 2);
  if (options.demo && options.demo !== "empty" && options.demo !== "full") throw new CliError("usage", `--demo is "full" or "empty".`, undefined, 2);
  const res = await renderPreview({
    outDir,
    baseUrl,
    extensions: [...exts.map(({ kind, id, manifest }) => ({ kind, id, manifest })), ...(siteTheme ? [siteTheme] : [])],
    themeId: (options.theme as string | undefined) ?? siteTheme?.id,
    enablePlugins: list(options.enable),
    themeConfig: parseJsonOption("theme-config", options["theme-config"]),
    pluginConfigs: parseJsonOption("plugin-configs", options["plugin-configs"]),
    settings: parseJsonOption("settings", options.settings),
    content,
    blockPage: true,
    home: options.home === "blocks" ? "blocks" : undefined,
    demo: options.demo === "empty" ? "empty" : "full",
  });
  let server: import("node:http").Server | null = null;
  let screenshots: Awaited<ReturnType<typeof import("../ops/extScreenshot").screenshotPages>> | null = null;
  if (options.screenshots || options.serve) {
    const { startAdminServer } = await import("./serve");
    try {
      server = await startAdminServer(res.outDir, "127.0.0.1", port, basePath);
    } catch (e) {
      if ((e as NodeJS.ErrnoException).code === "EADDRINUSE") throw new CliError("port-busy", `Port ${port} is in use.`, "Pass --port <n> (links in the preview use that port).");
      throw e;
    }
  }
  if (options.screenshots) {
    const { screenshotPages, setScreenshotColorScheme } = await import("../ops/extScreenshot");
    setScreenshotColorScheme(options["color-scheme"]);
    screenshots = await screenshotPages(baseUrl, res.pages, join(res.outDir, ".screenshots"), options["screenshot-js"] ? String(options["screenshot-js"]) : undefined, options["max-height"] ? Number(options["max-height"]) : undefined);
  }
  const data = {
    ...res,
    site: siteAlias ?? null,
    url: options.serve ? `${baseUrl}/` : null,
    screenshots: screenshots
      ? { browser: screenshots.browser, files: screenshots.shots, errors: screenshots.errors, ...(screenshots.browser ? {} : { hint: "No Chrome / Chromium / Edge found; set CHROME_PATH." }) }
      : null,
  };
  if (!options.serve && server) await new Promise<void>((r) => server!.close(() => r()));
  printResult(io, data, () =>
    [
      `Preview of ${res.themeId}${res.plugins.length ? ` + ${res.plugins.join(", ")}` : ""}: ${res.files.length} files in ${res.outDir}`,
      ...Object.entries(res.pages).filter(([, p]) => p).map(([k, p]) => `  ${k.padEnd(9)} ${p}`),
      ...res.issues.map((i) => `  ${i.level}  ${i.message}`),
      ...res.notes.map((n) => `  note  ${n}`),
      ...(screenshots?.shots.map((s) => `  screenshot ${s.file}`) ?? []),
      ...(screenshots && !screenshots.browser ? ["  (no Chrome / Chromium / Edge found for screenshots; set CHROME_PATH)"] : []),
      options.serve ? `Serving at ${baseUrl}/ — Ctrl+C to stop.` : "",
    ].filter(Boolean).join("\n"),
  );
  if (options.serve && server) {
    await new Promise<void>((r) => {
      const stop = () => server!.close(() => r());
      process.once("SIGINT", stop);
      process.once("SIGTERM", stop);
    });
  }
  return res.issues.some((i) => i.level === "error") ? 1 : 0;
}

async function pack({ io, options, positionals }: CommandContext) {
  const target = positionals[1] ?? ".";
  const { readExtensionPackage } = await import("../ops/extPackage");
  const { writeExtensionZip } = await import("../ops/extZip");
  const pkg = await readExtensionPackage(target);
  if (pkg.sourceType === "zip") throw new CliError("usage", "ext pack takes a project or unpacked folder, not a .zip.", undefined, 2);
  if (!pkg.manifest?.id) throw new CliError("manifest-id", "manifest.json has no id.");
  if (!pkg.files.has(pkg.entry)) throw new CliError("no-bundle", `${pkg.entry} not found.`, pkg.sourceType === "project" ? "Build first: `vite build` (the bundle goes to dist/)." : undefined);
  const out = resolve(String(options.out ?? join(pkg.source, `${pkg.manifest.id}.zip`)));
  mkdirSync(dirname(out), { recursive: true });
  const bytes = await writeExtensionZip(pkg.files);
  writeFileSync(out, bytes);
  const files = [...pkg.files.keys()].sort();
  printResult(io, { zip: out, bytes: bytes.length, files }, () => `Packed ${basename(out)} (${files.length} files, ${(bytes.length / 1024).toFixed(1)} KB): ${files.join(", ")}`);
}

async function scaffold({ io, options, positionals }: CommandContext) {
  const [, kind, id] = positionals;
  if (kind !== "plugin" && kind !== "theme") throw new CliError("usage", "ext new needs plugin or theme, then an id: ext new theme my-theme", undefined, 2);
  if (!id) throw new CliError("usage", `ext new ${kind} needs an id (lower-case, dashes), e.g. ext new ${kind} my-${kind}.`, undefined, 2);
  const { scaffoldExtension } = await import("../ops/extScaffold");
  const dir = resolve(String(options.dir ?? id));
  if (existsSync(dir) && (await import("node:fs")).readdirSync(dir).length > 0 && !options.force) {
    throw new CliError("dir-not-empty", `${dir} already exists and is not empty.`, "Pick another --dir (or --force to write into it).", 2);
  }
  const res = scaffoldExtension({
    kind,
    id,
    dir,
    name: options.name as string | undefined,
    description: options.description as string | undefined,
    author: options.author as string | undefined,
    features: list(options.with),
  });
  printResult(io, res, () => [`Created ${kind} "${id}" in ${dir}:`, ...res.files.map((f) => `  ${f}`), "", ...res.next].join("\n"));
}

async function install(ctx: CommandContext) {
  const { installExtensionCommand } = await import("../ops/extInstall");
  return installExtensionCommand(ctx);
}

export const extCommand: Command = {
  name: "ext",
  summary:
    "Build, test and ship plugins and themes: new <plugin|theme> <id> (scaffold a project), check <path> (validate + render a demo site, exit 1 on errors), preview <path…> (render a full demo site locally; --serve, --screenshots, --site <alias> for a site's real content), pack <project> (ZIP for the admin's Install button), install <zip> --site <alias> (upload to a site; plan first, --yes to apply), list --site <alias>, uninstall <id> --site <alias>.",
  usage:
    "ext new <plugin|theme> <id> [--with <features>] [--dir <path>] [--name <name>] [--description <text>] [--author <name>] [--force] | ext check <path> [--kind <plugin|theme>] [--out <dir>] | ext preview <path…> [--theme <id>] [--enable <ids>] [--settings <json>] [--theme-config <json>] [--plugin-configs <json>] [--site <alias>] [--out <dir>] [--port <n>] [--base-path </dir>] [--home blocks] [--demo empty] [--screenshots] [--screenshot-js <code>] [--max-height <px>] [--color-scheme light|dark] [--serve] | ext pack <project> [--out <zip>] | ext install <zip|folder> --site <alias> [--activate] [--no-regenerate] [--yes] | ext list --site <alias> | ext uninstall <id> --site <alias> [--yes]",
  options: [
    { name: "dir", type: "string", description: "new: target folder (default: ./<id>)." },
    { name: "name", type: "string", description: "new: display name." },
    { name: "description", type: "string", description: "new: one-sentence description." },
    { name: "author", type: "string", description: "new: author shown in the admin." },
    { name: "with", type: "string", description: "new: optional parts, comma-separated — plugins: settings, block, i18n, dashboard-card; themes: settings, block (themes always include a menu loader)." },
    { name: "force", type: "boolean", description: "new: write into a non-empty folder." },
    { name: "kind", type: "string", description: "check: expected kind (plugin or theme)." },
    { name: "keep-preview", type: "string", description: "check: keep the rendered demo site in this folder (--out works too)." },
    { name: "out", type: "string", description: "preview: output folder (default: a temp folder). pack: ZIP path (default: <project>/<id>.zip)." },
    { name: "theme", type: "string", description: "preview: theme to activate (default: the theme given, else \"default\")." },
    { name: "enable", type: "string", description: "preview: also enable these bundled plugins (comma-separated ids, e.g. core-seo,agentcms-sitemaps)." },
    { name: "theme-config", type: "string", description: "preview: JSON merged into the theme's config." },
    { name: "plugin-configs", type: "string", description: "preview: JSON { <plugin-id>: config } merged into plugin configs." },
    { name: "settings", type: "string", description: "preview: JSON merged into the site settings (e.g. {\"language\":\"fr\"})." },
    { name: "serve", type: "boolean", description: "preview: keep serving the site on http://localhost:<port>/ until stopped." },
    { name: "port", type: "string", description: "preview: port used in links and by --serve (default 4321)." },
    { name: "base-path", type: "string", description: "preview: render and serve the site as if hosted in a sub-folder, e.g. /blog (tests base-path handling)." },
    { name: "home", type: "string", description: "preview: \"blocks\" makes the block test page (every editor block) the static home page — to design a landing page." },
    { name: "demo", type: "string", description: "preview: \"empty\" renders the demo site without posts or menus (empty states); default \"full\"." },
    { name: "screenshot-js", type: "string", description: "preview: JavaScript run in every page before its screenshot (after load), e.g. to click a consent button or open the menu. Async code is awaited." },
    { name: "screenshots", type: "boolean", description: "preview: PNG screenshots (desktop + mobile) of each kind of page with a local Chrome/Chromium/Edge." },
    { name: "site", type: "string", description: "preview: render a registered site's real content (read-only copy). install/list/uninstall: the site." },
    { name: "color-scheme", type: "string", description: "screenshots: prefers-color-scheme of the captures, light (default) or dark." },
    { name: "max-height", type: "string", description: "preview --screenshots: cap each capture's height in CSS px (default: the whole page, up to 6000)." },
    { name: "activate", type: "boolean", description: "install: also activate it (theme: make it the active theme; plugin: enable it), then regenerate the whole site." },
    { name: "no-regenerate", type: "boolean", description: "install: don't regenerate the site (by default it is regenerated when the package is activated, or upgrades the active theme / an enabled plugin)." },
    { name: "yes", type: "boolean", description: "install/uninstall: apply (without it, only print the plan)." },
  ],
  async run(ctx) {
    const action = ctx.positionals[0];
    switch (action) {
      case "check":
        return check(ctx);
      case "preview":
        return preview(ctx);
      case "pack":
        return pack(ctx);
      case "new":
        return scaffold(ctx);
      case "install":
      case "list":
      case "uninstall":
        return install(ctx);
      default:
        throw new CliError("usage", action ? `Unknown ext action "${action}".` : "ext needs an action.", "Actions: new, check, preview, pack, install, list, uninstall.", 2);
    }
  },
};
