import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { basename, extname, join, resolve } from "node:path";
import type { PluginManifest } from "../../src/plugins";
import type { SiteSettings } from "../../src/core/types";
import type { SiteSession } from "../ops/session";
import { CliError } from "../output";
import type { Command, CommandContext } from "./types";

// `agentcms plugins …` — the admin's Plugins page and every plugin
// settings page, with the same calls:
//   list                         regular + must-use + installed plugins
//   enable|disable <id>          PluginsPage toggle (enabledPlugins)
//   config <id>                  the settings page's Save (--get, --schema,
//                                --set <json> full replace, --merge <json>),
//                                with each page's side effects
//   action <id> <action>         the settings page's buttons
// Installing / uninstalling a plugin ZIP is `agentcms ext install|uninstall`.

export interface PluginRow {
  id: string;
  name: string;
  version: string;
  kind: "regular" | "must-use";
  installed: "bundled" | "external";
  enabled: boolean;
  loaded: boolean;
  hasSettings: boolean;
  actions: string[];
  description: string | null;
  error?: string;
}

// The buttons of each settings page (see `plugins action`).
const ACTIONS: Record<string, string[]> = {
  "agentcms-sitemaps": ["robots", "stylesheets", "regenerate"],
  "agentcms-rss": ["stylesheet", "regenerate"],
  "agentcms-search": ["regenerate"],
  "agentcms-archives": ["regenerate"],
  "agentcms-favicon": ["set", "remove", "manifest"],
  "agentcms-import": ["init", "list", "scan", "run"],
};

// What to run after a config change for it to show on the public site
// (plugin saves don't republish pages).
function nextSteps(id: string, alias: string): string[] {
  const all = `agentcms regenerate all --site ${alias}`;
  switch (id) {
    case "agentcms-sitemaps":
    case "agentcms-rss":
    case "agentcms-search":
      return [`agentcms regenerate ${id} --site ${alias}`];
    case "agentcms-archives":
      return [`agentcms regenerate ${id} --site ${alias}`, all];
    case "agentcms-favicon":
    case "agentcms-import":
      return [];
    default:
      return [all];
  }
}

async function muPlugins(): Promise<PluginManifest[]> {
  return (await import("../../src/mu-plugins")).listMuPlugins();
}

export async function pluginRows(s: SiteSession): Promise<PluginRow[]> {
  const { readBackendRegistryForCli } = await import("../ops/sessionRegistry");
  const registry = (await readBackendRegistryForCli().catch(() => null)) ?? { plugins: [], themes: [] };
  const enabled = s.settings().enabledPlugins ?? {};
  const rows = new Map<string, PluginRow>();
  const add = (m: PluginManifest, kind: PluginRow["kind"], installed: PluginRow["installed"]) =>
    rows.set(m.id, {
      id: m.id,
      name: m.name,
      version: m.version,
      kind,
      installed,
      enabled: kind === "must-use" || enabled[m.id] !== false,
      loaded: true,
      hasSettings: !!m.settings,
      actions: ACTIONS[m.id] ?? [],
      description: m.description ?? null,
    });
  for (const m of await muPlugins()) add(m, "must-use", "bundled");
  for (const m of s.host.plugins.PLUGINS) add(m, "regular", "bundled");
  const failed = new Map(s.loadedExtensions.failed.map((f) => [f.id, f.error]));
  for (const m of s.host.registry.listExternalPlugins()) add(m, "regular", "external");
  for (const entry of registry.plugins) {
    const row = rows.get(entry.id);
    if (row) {
      row.installed = "external";
      continue;
    }
    rows.set(entry.id, {
      id: entry.id,
      name: entry.id,
      version: entry.version ?? "",
      kind: "regular",
      installed: "external",
      enabled: enabled[entry.id] !== false,
      loaded: false,
      hasSettings: false,
      actions: [],
      description: null,
      error: failed.get(`plugins/${entry.id}`) ?? "not loaded",
    });
  }
  return [...rows.values()];
}

async function findPlugin(s: SiteSession, id: string | undefined): Promise<{ manifest: PluginManifest; mu: boolean }> {
  if (!id) throw new CliError("usage", "Which plugin? Give its id.", "List them with `agentcms plugins list`.", 2);
  const mu = (await muPlugins()).find((m) => m.id === id);
  if (mu) return { manifest: mu, mu: true };
  const regular = s.host.registry.listExternalPlugins().find((m) => m.id === id) ?? s.host.plugins.PLUGINS.find((m) => m.id === id);
  if (regular) return { manifest: regular, mu: false };
  const failed = s.loadedExtensions.failed.find((f) => f.id === `plugins/${id}`);
  if (failed) throw new CliError("plugin-not-loaded", `Plugin "${id}" is installed but could not be loaded: ${failed.error}`, "Check the site's admin (`agentcms doctor`), or reinstall it (`agentcms ext install`).");
  throw new CliError("not-found", `No plugin "${id}" on this site.`, "List them with `agentcms plugins list`; install one with `agentcms ext install`.", 2);
}

export function currentConfig<T = Record<string, unknown>>(stored: unknown, defaults: unknown): T {
  return { ...((defaults as object) ?? {}), ...((stored as object) ?? {}) } as T;
}

function pluginConfigOf<T = Record<string, unknown>>(s: SiteSession, m: PluginManifest): T {
  return currentConfig<T>(s.settings().pluginConfigs?.[m.id], m.settings?.defaultConfig);
}

async function savePluginConfig(s: SiteSession, id: string, next: unknown): Promise<SiteSettings> {
  const { updatePluginConfig } = await import("../../src/services/settings");
  await updatePluginConfig(id, next);
  return s.refresh();
}

async function corpus() {
  const { fetchAllPosts, invalidateAllPostsCache } = await import("../../src/services/posts");
  invalidateAllPostsCache();
  const [posts, pages] = await Promise.all([fetchAllPosts({ type: "post" }), fetchAllPosts({ type: "page" })]);
  return { posts, pages };
}

// The settings page's own menu.json refresh, with the just-saved config.
async function refreshMenuJson(s: SiteSession): Promise<void> {
  const { publishMenuJson } = await import("../../src/services/menuPublisher");
  const { posts, pages } = await corpus();
  try {
    await publishMenuJson(s.settings(), posts, pages, await s.terms());
  } catch (err) {
    s.log({ level: "warn", message: `menu.json republish failed: ${(err as Error).message}` });
  }
}

// One commit on git hostings, and nothing left staged when the CLI exits.
async function batched<T>(fn: () => Promise<T>): Promise<T> {
  const { withStorageBatch } = await import("../../src/services/siteFiles");
  return withStorageBatch(fn);
}

function requireBaseUrl(s: SiteSession, id: string): string {
  const baseUrl = s.settings().baseUrl;
  if (!baseUrl) throw new CliError("base-url-missing", `${id} needs the site URL (settings.baseUrl).`, `Set it with \`agentcms settings set --data '{"baseUrl":"https://…"}' --site ${s.site.alias}\`.`);
  return baseUrl;
}

// rss: category feeds / exclusions may name categories by slug or name.
async function resolveRssTerms(s: SiteSession, cfg: Record<string, unknown>): Promise<Record<string, unknown>> {
  const { findTerm } = await import("../ops/adminCommon");
  const terms = await s.terms();
  const idOf = (ref: unknown) => {
    const t = typeof ref === "string" ? findTerm(terms, ref, "category") : undefined;
    if (!t) throw new CliError("not-found", `No category "${String(ref)}" (agentcms-rss).`, "List them with `agentcms terms list --type category`.", 2);
    return t.id;
  };
  const out = { ...cfg };
  const site = out.site as { excludedTermIds?: unknown[] } | undefined;
  if (site && Array.isArray(site.excludedTermIds)) out.site = { ...site, excludedTermIds: site.excludedTermIds.map(idOf) };
  if (Array.isArray(out.categoryFeeds)) {
    out.categoryFeeds = (out.categoryFeeds as Array<Record<string, unknown>>).map((f) => ({ itemCount: 20, addToFooter: false, ...f, termId: idOf(f.termId) }));
  }
  return out;
}

const PWA_KEYS = ["pwaName", "pwaShortName", "pwaThemeColor", "pwaBackgroundColor", "pwaDisplay"] as const;

function pwaInput(cfg: Record<string, unknown>, settings: SiteSettings) {
  const title = settings.title ?? "";
  return {
    name: String(cfg.pwaName || title),
    shortName: String(cfg.pwaShortName || (title ? title.slice(0, 12) : "")),
    themeColor: String(cfg.pwaThemeColor ?? "#ffffff"),
    backgroundColor: String(cfg.pwaBackgroundColor ?? "#ffffff"),
    display: (cfg.pwaDisplay ?? "standalone") as "standalone",
  };
}

// --pwa '{"name":…,"shortName":…,"themeColor":…,"backgroundColor":…,"display":…}'
// (or the config's own pwa* keys).
async function readPwaOption(value: unknown): Promise<Record<string, unknown>> {
  const { readJsonOption } = await import("../ops/adminCommon");
  const raw = readJsonOption(value, "pwa");
  if (raw === undefined) return {};
  if (typeof raw !== "object" || raw === null || Array.isArray(raw)) throw new CliError("usage", "--pwa must be a JSON object.", undefined, 2);
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(raw)) {
    const key = k.startsWith("pwa") ? k : `pwa${k[0].toUpperCase()}${k.slice(1)}`;
    if (!(PWA_KEYS as readonly string[]).includes(key)) throw new CliError("usage", `--pwa: unknown field "${k}".`, "Fields: name, shortName, themeColor, backgroundColor, display (standalone|browser|fullscreen|minimal-ui).", 2);
    out[key] = v;
  }
  return out;
}

const IMAGE_MIME: Record<string, string> = { ".png": "image/png", ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".webp": "image/webp", ".gif": "image/gif", ".svg": "image/svg+xml" };

export function imageFileFromDisk(path: string, allowed: string[]): File {
  const file = resolve(path);
  if (!existsSync(file) || !statSync(file).isFile()) throw new CliError("not-found", `${path} does not exist.`, undefined, 2);
  const type = IMAGE_MIME[extname(file).toLowerCase()];
  if (!type || !allowed.includes(type)) throw new CliError("usage", `${basename(file)}: unsupported image type.`, `Use ${allowed.map((t) => t.replace("image/", "")).join(", ")}.`, 2);
  return new File([readFileSync(file)], basename(file), { type });
}

// ─── import (agentcms-import) ──────────────────────────────────────

type ImportBundle = import("../../src/mu-plugins/agentcms-import/importer").ImportBundle;

// What the admin's drop zone does with a dropped folder: every file at
// any depth, classified by name (README.md skipped).
function classify(name: string): "markdown" | "xml" | "image" | null {
  const ext = extname(name).slice(1).toLowerCase();
  if (/^readme\.md$/i.test(name)) return null;
  if (ext === "md") return "markdown";
  if (ext === "xml") return "xml";
  if (["jpg", "jpeg", "png", "webp", "svg", "gif"].includes(ext)) return "image";
  if (/^_terms\.json$/i.test(name)) return "markdown";
  return null;
}

function bundleFromDisk(path: string): ImportBundle & { ignored: string[] } {
  const root = resolve(path);
  if (!existsSync(root)) throw new CliError("not-found", `${path} does not exist.`, undefined, 2);
  const files: string[] = [];
  const walk = (p: string) => {
    if (statSync(p).isDirectory()) {
      for (const e of readdirSync(p).sort()) if (!e.startsWith(".") && e !== "node_modules") walk(join(p, e));
    } else files.push(p);
  };
  walk(root);
  const bundle: ImportBundle & { ignored: string[] } = { source: "drop", markdown: [], xml: [], images: [], ignored: [] };
  for (const f of files) {
    const name = basename(f);
    const kind = classify(name);
    if (kind === "markdown") bundle.markdown.push({ name, content: readFileSync(f, "utf8") });
    else if (kind === "xml") bundle.xml.push({ name, content: readFileSync(f, "utf8") });
    else if (kind === "image") bundle.images.push({ filename: name, blob: new File([readFileSync(f)], name, { type: IMAGE_MIME[extname(name).toLowerCase()] }) });
    else bundle.ignored.push(name);
  }
  return bundle;
}

function summarizeScan(summary: import("../../src/mu-plugins/agentcms-import/importer").DryRunSummary, statusMode: string) {
  return {
    entries: summary.entries.map((e) => ({
      source: e.source.sourceName,
      type: e.source.type,
      title: e.source.title,
      slug: e.finalSlug,
      slugWasModified: e.slugWasModified,
      category: e.source.categoryName ?? null,
      tags: e.source.tags,
      sourceStatus: e.source.status,
      willPublish: statusMode === "online" || (statusMode === "from-source" && e.source.status === "online"),
      translations: Object.keys(e.source.translations ?? {}),
    })),
    categoriesToCreate: summary.categoriesToCreate.map((t) => t.name),
    tagsToCreate: summary.tagsToCreate.map((t) => t.name),
    imagesToUpload: summary.imagesToUpload,
    wordpressAttachments: summary.wpAttachmentsToFetch.length,
    termTranslations: summary.termTranslations.length,
    errors: summary.warnings.filter((w) => w.level === "error"),
    warnings: summary.warnings.filter((w) => w.level !== "error"),
  };
}

async function importOptions(s: SiteSession, m: PluginManifest, options: CommandContext["options"]) {
  const { DEFAULT_IMPORT_OPTIONS } = await import("../../src/mu-plugins/agentcms-import/importer");
  const stored = pluginConfigOf<{ options?: Record<string, unknown> }>(s, m).options ?? {};
  const opts = { ...DEFAULT_IMPORT_OPTIONS, ...stored } as typeof DEFAULT_IMPORT_OPTIONS;
  if (options.status !== undefined) {
    const v = String(options.status);
    if (!["draft", "online", "from-source"].includes(v)) throw new CliError("usage", `--status is draft, online or from-source (got "${v}").`, undefined, 2);
    opts.statusMode = v as typeof opts.statusMode;
  }
  if (options.category !== undefined) opts.defaultCategory = String(options.category);
  if (options["keep-files"]) opts.moveProcessedFiles = false;
  return opts;
}

async function runImportAction(options: CommandContext["options"], s: SiteSession, m: PluginManifest, action: string, arg: string | undefined) {
  const imp = await import("../../src/mu-plugins/agentcms-import/importer");
  if (action === "init") {
    await batched(() => imp.initializeFolder());
    return { action, folder: imp.IMPORT_FOLDER };
  }
  if (action === "list") {
    const { getStorageCapabilities } = await import("../../src/services/siteFiles");
    if (!(await getStorageCapabilities()).list) throw new CliError("unsupported", "This hosting can't list files, so the import folder can't be read.", "Import from a local folder instead: `plugins action agentcms-import scan <path>`.");
    const listing = await imp.listImportFolder();
    return { action, folder: imp.IMPORT_FOLDER, markdown: listing.markdownFiles.map((f) => f.path), xml: listing.xmlFiles.map((f) => f.path), images: listing.imageFiles.map((f) => f.path) };
  }
  const fromHosting = !!options["from-hosting"];
  if (!arg && !fromHosting) throw new CliError("usage", `import ${action} needs a local folder (.md + images) or a WordPress .xml export — or --from-hosting for the site's ${imp.IMPORT_FOLDER}/ folder.`, undefined, 2);
  const bundle: ImportBundle & { ignored?: string[] } = fromHosting ? await imp.buildBundleFromFolder() : bundleFromDisk(arg!);
  if (bundle.markdown.length === 0 && bundle.xml.length === 0) throw new CliError("no-sources", "No Markdown or WordPress XML file found to import.", undefined, 2);
  const opts = await importOptions(s, m, options);
  const { currentUserId } = await import("../ops/adminCommon");
  const { posts, pages } = await corpus();
  const scanCtx = { posts, pages, terms: await s.terms(), media: await s.media(), users: await s.users(), importerUserId: await currentUserId() };
  const summary = imp.scanBundle(bundle, scanCtx, opts);
  const scan = { ...summarizeScan(summary, opts.statusMode), ignored: bundle.ignored ?? [], options: opts };
  if (action === "scan" || !options.yes) {
    return { action, needsConfirmation: action === "run", ...scan };
  }
  if (scan.errors.length) {
    throw new CliError("import-errors", `The scan found ${scan.errors.length} blocking error(s): ${scan.errors.map((e) => `${e.source}: ${e.message}`).join("; ")}`, "Fix the sources (see `plugins action agentcms-import scan`).");
  }
  const progress: string[] = [];
  const out = await batched(() =>
    imp.runImport({ ctx: scanCtx, options: opts, bundle, summary, settings: s.settings(), onProgress: (msg) => progress.push(msg) }),
  );
  return {
    action,
    created: out.createdPostIds,
    published: out.publishedPostIds,
    terms: out.createdTermIds,
    media: out.uploadedMediaIds,
    warnings: out.warnings,
    errors: out.errors,
    progress,
  };
}

// ─── actions ───────────────────────────────────────────────────────

async function runTarget(s: SiteSession, id: string): Promise<void> {
  const { listRegenerationTargets } = await import("../../src/core/regenerationTargetRegistry");
  const target = listRegenerationTargets().find((t) => t.id === id);
  if (!target) throw new CliError("unknown-target", `${id} registered no regeneration (is it enabled?).`, `Enable it with \`agentcms plugins enable ${id}\`.`);
  const ctx = await s.context();
  await batched(() => target.run(ctx, s.log));
}

async function pluginAction(options: CommandContext["options"], s: SiteSession, m: PluginManifest, action: string | undefined, arg: string | undefined): Promise<Record<string, unknown>> {
  const known = ACTIONS[m.id] ?? [];
  if (!action || !known.includes(action)) {
    throw new CliError("usage", action ? `"${action}" is not an action of ${m.id}.` : `Which ${m.id} action?`, known.length ? `Actions of ${m.id}: ${known.join(", ")}.` : `${m.id} has no settings-page action (see \`plugins config ${m.id}\`).`, 2);
  }
  const alias = s.site.alias;
  switch (m.id) {
    case "agentcms-sitemaps": {
      const baseUrl = requireBaseUrl(s, m.id);
      const gen = await import("../../src/plugins/agentcms-sitemaps/generator");
      if (action === "regenerate") {
        await runTarget(s, m.id);
        return { action };
      }
      let config = pluginConfigOf<import("../../src/plugins/agentcms-sitemaps/generator").SitemapsConfig>(s, m);
      if (action === "robots") {
        // "Insert default" + "Save & regenerate robots".
        if (options["default-robots"]) {
          config = { ...config, robotsTxt: gen.defaultRobotsTxt(baseUrl, config.newsEnabled) };
          await savePluginConfig(s, m.id, config);
        }
        await batched(() => gen.regenerateRobotsTxt({ config, baseUrl, discourageIndexing: s.settings().discourageIndexing === true }));
        return { action, uploaded: ["robots.txt"] };
      }
      const res = await batched(() => gen.regenerateStylesheets({ settings: s.settings(), config }));
      return { action, ...res };
    }
    case "agentcms-rss": {
      requireBaseUrl(s, m.id);
      if (action === "regenerate") {
        await runTarget(s, m.id);
        return { action };
      }
      const gen = await import("../../src/plugins/agentcms-rss/generator");
      await batched(() => gen.regenerateStylesheet({ settings: s.settings() }));
      return { action, uploaded: ["rss.xsl"] };
    }
    case "agentcms-search":
    case "agentcms-archives":
      await runTarget(s, m.id);
      return { action };
    case "agentcms-favicon": {
      const gen = await import("../../src/mu-plugins/agentcms-favicon/generator");
      const { DEFAULT_FAVICON_CONFIG } = await import("../../src/mu-plugins/agentcms-favicon/SettingsPage");
      const cfg = pluginConfigOf<typeof DEFAULT_FAVICON_CONFIG & Record<string, unknown>>(s, m);
      const draft = { ...cfg, ...(await readPwaOption(options.pwa)) } as typeof cfg;
      const regen = [`agentcms regenerate all --site ${alias}`];
      if (action === "set") {
        if (!arg) throw new CliError("usage", "favicon set needs an image file (PNG, JPEG or WebP; square, 512 px or more).", undefined, 2);
        const file = imageFileFromDisk(arg, ["image/png", "image/jpeg", "image/webp", "image/svg+xml"]);
        if (file.type === "image/svg+xml") throw new CliError("unsupported", "The CLI can't rasterize SVG favicons.", "Convert the logo to a 512×512 PNG and pass that, or upload the SVG from the admin.", 2);
        const result = await batched(() => gen.generateAndUploadFavicons({ file, pwa: pwaInput(draft, s.settings()) }));
        const next = { ...draft, enabled: true, uploadedAt: Date.now(), ...result };
        await savePluginConfig(s, m.id, next);
        return { action, folder: gen.FAVICON_FOLDER, files: result, next: regen };
      }
      if (action === "remove") {
        await batched(() => gen.removeAllFavicons());
        const next = { ...DEFAULT_FAVICON_CONFIG, ...Object.fromEntries(PWA_KEYS.map((k) => [k, draft[k]])) };
        await savePluginConfig(s, m.id, next);
        return { action, removed: gen.FAVICON_FOLDER, next: regen };
      }
      // manifest: "Save PWA manifest".
      let regenerated = false;
      if (cfg.hasManifest || cfg.enabled) {
        await batched(() => gen.regenerateManifest({ pwa: pwaInput(draft, s.settings()) }));
        regenerated = true;
      }
      await savePluginConfig(s, m.id, { ...draft, uploadedAt: cfg.enabled ? Date.now() : draft.uploadedAt });
      return { action, regenerated, pwa: pwaInput(draft, s.settings()) };
    }
    case "agentcms-import":
      return runImportAction(options, s, m, action, arg);
  }
  return { action };
}

// ─── config side effects ───────────────────────────────────────────

async function applyConfig(s: SiteSession, m: PluginManifest, prev: Record<string, unknown>, next: Record<string, unknown>): Promise<{ saved: Record<string, unknown>; effects: string[] }> {
  const effects: string[] = [];
  switch (m.id) {
    case "agentcms-rss": {
      const gen = await import("../../src/plugins/agentcms-rss/generator");
      type Rss = import("../../src/plugins/agentcms-rss/generator").RssConfig;
      const resolved = (await resolveRssTerms(s, next)) as unknown as Rss;
      return batched(async () => {
        const cleanup = await gen.cleanupRemovedFeeds({ prevConfig: prev as unknown as Rss, nextConfig: resolved });
        for (const d of cleanup.deleted) effects.push(`deleted ${d}`);
        await savePluginConfig(s, m.id, cleanup.nextConfig);
        await refreshMenuJson(s);
        effects.push("published data/menu.json");
        return { saved: cleanup.nextConfig as unknown as Record<string, unknown>, effects };
      });
    }
    case "agentcms-favicon": {
      const changed = PWA_KEYS.some((k) => JSON.stringify(prev[k]) !== JSON.stringify(next[k]));
      if (changed && (prev.hasManifest || prev.enabled)) {
        const gen = await import("../../src/mu-plugins/agentcms-favicon/generator");
        await batched(() => gen.regenerateManifest({ pwa: pwaInput(next, s.settings()) }));
        next = { ...next, uploadedAt: prev.enabled ? Date.now() : next.uploadedAt };
        effects.push(`uploaded ${gen.FAVICON_FOLDER}/site.webmanifest`);
      }
      break;
    }
    case "agentcms-import": {
      const o = (next.options ?? {}) as Record<string, unknown>;
      if (o.statusMode !== undefined && !["draft", "online", "from-source"].includes(String(o.statusMode))) {
        throw new CliError("usage", `options.statusMode is draft, online or from-source (got "${String(o.statusMode)}").`, undefined, 2);
      }
      break;
    }
  }
  await savePluginConfig(s, m.id, next);
  return { saved: next, effects };
}

// ─── command ───────────────────────────────────────────────────────

async function run({ io, options, positionals }: CommandContext): Promise<number | void> {
  const [action, id, sub, arg] = positionals;
  const { runAdmin } = await import("../ops/adminCommon");
  const alias = options.site as string | undefined;
  const write = { write: true, hosting: true, extensions: true, lock: true };

  switch (action) {
    case "list":
      return runAdmin(io, alias, { extensions: true }, (s) => pluginRows(s), (rows) =>
        rows
          .map((r) => `${r.enabled ? "●" : "○"} ${r.id.padEnd(22)} ${r.version.padEnd(8)} ${r.kind === "must-use" ? "must-use" : r.enabled ? "enabled" : "disabled"}${r.installed === "external" ? " (installed)" : ""}${r.hasSettings ? "  config" : ""}${r.actions.length ? `  actions: ${r.actions.join(", ")}` : ""}${r.loaded ? "" : `  NOT LOADED: ${r.error}`}`)
          .join("\n") + "\n(install / uninstall a plugin ZIP: agentcms ext install|uninstall)",
      );

    case "enable":
    case "disable":
      return runAdmin(io, alias, { write: true, extensions: true, lock: true }, async (s) => {
        const { manifest, mu } = await findPlugin(s, id);
        if (mu) throw new CliError("must-use", `${manifest.id} is a must-use plugin: it is always active.`, undefined, 2);
        const enabledPlugins = s.settings().enabledPlugins ?? {};
        const current = enabledPlugins[manifest.id] !== false;
        const wanted = action === "enable";
        if (current !== wanted) {
          // PluginsPage.toggle.
          const { updateSettings } = await import("../../src/services/settings");
          await updateSettings({ enabledPlugins: { ...enabledPlugins, [manifest.id]: wanted } });
          await s.refresh();
        }
        const warnings: string[] = [];
        if (wanted && manifest.id === "agentcms-search") warnings.push(...(await searchTriggerWarnings(s)));
        return {
          id: manifest.id,
          enabled: wanted,
          changed: current !== wanted,
          warnings,
          // Toggling a plugin doesn't republish: its head / body output and
          // its files follow on the next regeneration.
          next: current !== wanted ? [`agentcms regenerate everything --site ${s.site.alias}`] : [],
        };
      }, (r) => `${r.id} ${r.enabled ? "enabled" : "disabled"}${r.changed ? "" : " (already)"}${r.next.length ? `\nRegenerate the site for it to show: ${r.next.join(" ; ")}` : ""}${r.warnings.map((w) => `\n  warning: ${w}`).join("")}`);

    case "config": {
      const { readConfigRequest } = await import("../ops/configEdit");
      const req = readConfigRequest(options);
      const readOnly = req.mode === "get" || req.mode === "schema";
      return runAdmin(io, alias, readOnly ? { extensions: true } : write, async (s) => {
        const { manifest, mu } = await findPlugin(s, id);
        if (!manifest.settings) throw new CliError("no-settings", `${manifest.id} has no settings.`, undefined, 2);
        const defaults = manifest.settings.defaultConfig as Record<string, unknown>;
        if (req.mode === "schema") {
          const { describeSettings } = await import("../ops/configEdit");
          return { id: manifest.id, documented: !!manifest.settings.schema, settings: describeSettings(defaults, manifest.settings.schema), defaultConfig: defaults, actions: ACTIONS[manifest.id] ?? [] };
        }
        const prev = pluginConfigOf(s, manifest);
        if (req.mode === "get") return { id: manifest.id, config: prev, stored: s.settings().pluginConfigs?.[manifest.id] ?? null };
        const { deepMerge, shapeWarnings, changedKeys, schemaErrors } = await import("../ops/configEdit");
        const next = req.mode === "set" ? req.value : deepMerge(prev, req.value);
        const invalid = schemaErrors(manifest.settings.schema, next, prev);
        if (invalid.length) throw new CliError("invalid-value", `${manifest.id}: ${invalid.join(" ")}`, `See \`agentcms plugins config ${manifest.id} --schema\`.`, 2);
        const warnings = shapeWarnings(defaults, req.value, manifest.id);
        if (!mu && s.settings().enabledPlugins?.[manifest.id] === false) warnings.push(`${manifest.id} is disabled: the settings are saved but have no effect until \`agentcms plugins enable ${manifest.id}\`.`);
        const { saved, effects } = await applyConfig(s, manifest, prev, next);
        return { id: manifest.id, config: saved, changed: changedKeys(prev, saved), effects, warnings, next: nextSteps(manifest.id, s.site.alias) };
      }, (r) => {
        if ("settings" in r && Array.isArray(r.settings)) {
          return r.settings
            .map((f) => `${f.path} (${f.type}, default ${JSON.stringify(f.default)})${f.values ? ` — one of ${f.values.map((v) => JSON.stringify(v)).join(" | ")}` : ""}${f.format ? ` — ${f.format}` : ""}${f.description ? `\n    ${f.description}` : ""}`)
            .join("\n");
        }
        if (!("changed" in r) || !r.changed) return JSON.stringify(r.config, null, 2);
        return [`Saved ${r.id} (${r.changed.length ? r.changed.join(", ") : "no change"}).`, ...r.effects.map((e) => `  ${e}`), ...r.warnings.map((w) => `  warning: ${w}`), ...(r.next.length ? [`Then: ${r.next.join(" ; ")}`] : [])].join("\n");
      });
    }

    case "action": {
      const readOnly = id === "agentcms-import" && (sub === "list" || sub === "scan" || (sub === "run" && !options.yes));
      return runAdmin(io, alias, readOnly ? { hosting: true, extensions: true } : write, async (s) => {
        const { manifest, mu } = await findPlugin(s, id);
        if (!mu && s.settings().enabledPlugins?.[manifest.id] === false) {
          throw new CliError("plugin-disabled", `${manifest.id} is disabled.`, `Enable it first: \`agentcms plugins enable ${manifest.id}\`.`);
        }
        const out: Record<string, unknown> = { id: manifest.id, ...(await pluginAction(options, s, manifest, sub, arg)) };
        return out;
      }, (r) => {
        if (r.needsConfirmation) return `${humanScan(r)}\nNothing imported — re-run with --yes once the user agrees.`;
        if (r.action === "scan") return humanScan(r);
        const next = (r.next as string[] | undefined) ?? [];
        return `${r.id} ${String(r.action)}: done.${next.length ? `\nThen: ${next.join(" ; ")}` : ""}`;
      });
    }

    default:
      throw new CliError("usage", action ? `Unknown plugins action "${action}".` : "plugins needs an action.", "Actions: list, enable, disable, config, action.", 2);
  }
}

function humanScan(r: Record<string, unknown>): string {
  const entries = (r.entries as Array<{ type: string; title: string; slug: string; willPublish: boolean }>) ?? [];
  const errors = (r.errors as Array<{ source: string; message: string }>) ?? [];
  return [
    `${entries.length} entr${entries.length === 1 ? "y" : "ies"} to import:`,
    ...entries.map((e) => `  ${e.type} ${e.slug} — ${e.title}${e.willPublish ? " (published)" : ""}`),
    `categories to create: ${(r.categoriesToCreate as string[]).join(", ") || "none"}; tags: ${(r.tagsToCreate as string[]).join(", ") || "none"}; images: ${(r.imagesToUpload as unknown[]).length}`,
    ...errors.map((e) => `  error: ${e.source}: ${e.message}`),
  ].join("\n");
}

// The search plugin only opens from a `[data-cms-search]` element of the
// theme. Look at the published home page: when the theme has none, the
// search is enabled but invisible — say how to add one.
async function searchTriggerWarnings(s: { site: { siteUrl: string; hosting: unknown } }): Promise<string[]> {
  const { publicUrlOf } = await import("../remote");
  const url = `${publicUrlOf(s.site as Parameters<typeof publicUrlOf>[0])}/`;
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(8000), cache: "no-store" });
    if (!res.ok) return [];
    const html = await res.text();
    if (/\sdata-cms-search(?=[\s=>/])/.test(html)) return [];
    return [
      "The active theme has no search button ([data-cms-search]) on the home page, so visitors can't open the search. " +
        "Add one to the custom code's `bodyEnd`, keeping what is already there (`plugins config agentcms-custom-code --get`), e.g. " +
        '<button type="button" data-cms-search aria-label="Search" style="position:fixed;right:1rem;bottom:1rem;z-index:50;padding:.6rem .9rem;border:0;border-radius:999px;background:#111;color:#fff">Search</button>' +
        " — then `regenerate all`.",
    ];
  } catch {
    return [];
  }
}

export const pluginsCommand: Command = {
  name: "plugins",
  summary:
    "The admin's Plugins page and plugin settings: list; enable|disable <id> (then regenerate); config <id> (--get, --schema = default config, --set <json> replaces, --merge <json> deep-merges; runs the settings page's side effects); action <id> <action> = the settings page buttons — agentcms-sitemaps robots [--default-robots]|stylesheets|regenerate, agentcms-rss stylesheet|regenerate, agentcms-search|agentcms-archives regenerate, agentcms-favicon set <image> [--pwa json]|remove|manifest [--pwa json], agentcms-import scan|run <folder|wp.xml> [--status draft|online|from-source] [--category <name>] (run: plan first, --yes) or init|list (the hosting's _cms-import/ folder, --from-hosting). Plugin ZIPs: `ext install`.",
  usage:
    "plugins <list|enable|disable|config|action> [<id>] [<action>] [<path>] --site <alias> [--get|--schema|--set <json>|@file|--merge <json>|@file] [--default-robots] [--pwa <json>] [--status draft|online|from-source] [--category <name>] [--from-hosting] [--keep-files] [--yes]",
  options: [
    { name: "site", type: "string", description: "Site alias." },
    { name: "get", type: "boolean", description: "config: print the current config (stored merged over defaults) — the default." },
    { name: "schema", type: "boolean", description: "config: print the plugin's default config (every key it knows)." },
    { name: "set", type: "string", description: "config: replace the whole config with this JSON object (or @file.json)." },
    { name: "merge", type: "string", description: "config: deep-merge this JSON object into the current config (arrays are replaced)." },
    { name: "default-robots", type: "boolean", description: "action agentcms-sitemaps robots: reset robots.txt to the default text first." },
    { name: "pwa", type: "string", description: "action agentcms-favicon set|manifest: PWA manifest fields as JSON {name, shortName, themeColor, backgroundColor, display}." },
    { name: "status", type: "string", description: "action agentcms-import: draft, online (publish everything) or from-source (each file's status)." },
    { name: "category", type: "string", description: "action agentcms-import: category name for entries without one." },
    { name: "from-hosting", type: "boolean", description: "action agentcms-import scan|run: read the site's _cms-import/ folder instead of a local path." },
    { name: "keep-files", type: "boolean", description: "action agentcms-import run --from-hosting: don't move processed files to an archive folder." },
    { name: "yes", type: "boolean", description: "action agentcms-import run: import (otherwise only the dry-run summary)." },
  ],
  run,
};
