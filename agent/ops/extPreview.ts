import { existsSync, mkdirSync, readFileSync, readdirSync, rmSync, statSync, writeFileSync } from "node:fs";
import { dirname, join, normalize, relative, resolve, sep } from "node:path";
import { format } from "node:util";
import { createHash } from "node:crypto";
import type { PluginManifest } from "../../src/plugins";
import type { ThemeManifest } from "../../src/themes/types";
import type { Media, SiteSettings } from "../../src/core/types";
import type { StoredDoc } from "../../src/services/docstore/types";
import type { StorageConnector } from "../../src/services/storage/types";
import { CliError } from "../output";
import { bootExtensionHost, type HostModules } from "./extHost";
import { FIXTURE_MEDIA, FIXTURE_MENUS, fixtureDocs, placeholderSvg } from "./extFixture";

// Renders a complete public site in a local folder with the admin's own
// publisher (regenerate everything: posts, pages, home, archives, 404,
// menu.json, posts.json, plugin outputs like sitemaps / RSS) — the
// exact HTML the admin would upload, without any site or account.

export const PREVIEW_CONNECTOR_ID = "agentcms-cli-preview";

export interface LoadedExtension {
  kind: "plugin" | "theme";
  id: string;
  manifest: PluginManifest | ThemeManifest;
}

export interface PreviewIssue {
  level: "error" | "warn";
  source: string;
  message: string;
}

export interface PreviewOptions {
  outDir: string;
  baseUrl: string;
  extensions: LoadedExtension[];
  // Theme to activate (defaults to the only theme among `extensions`,
  // else the admin's "default" theme).
  themeId?: string;
  // Extra built-in / bundled plugins to enable, by id.
  enablePlugins?: string[];
  // Overrides merged into the theme config / plugin configs.
  themeConfig?: Record<string, unknown>;
  pluginConfigs?: Record<string, unknown>;
  settings?: Partial<SiteSettings>;
  // Replace the demo content with another dataset (e.g. a site's).
  content?: { posts: StoredDoc[]; terms: StoredDoc[]; users: StoredDoc[]; media: StoredDoc[]; settings?: StoredDoc };
  clean?: boolean;
  // Extra posts / pages added to the content (e.g. a page using a block).
  extraPosts?: StoredDoc[];
  // Adds a "block-test.html" page using every editor block of the
  // given extensions (inserted the way the editor would).
  blockPage?: boolean;
  // "blocks": the block test page becomes the static home page.
  home?: "blocks";
  // "empty": no posts, no menus (categories and the About page stay) —
  // to check empty states.
  demo?: "full" | "empty";
  // After the full regeneration, runs publish → unpublish → delete →
  // bulk publish on demo posts and reports the files each step touched.
  lifecycle?: boolean;
  // Runs right after every plugin / theme registration (same pluginApi).
  afterRegister?: (api: HostModules["pluginRegistry"]["pluginApi"]) => void;
}

export interface PreviewResult {
  outDir: string;
  baseUrl: string;
  themeId: string;
  plugins: string[];
  files: string[];
  pages: { home: string; single?: string; page?: string; category?: string; author?: string; notFound: string; blocks?: string };
  issues: PreviewIssue[];
  notes: string[];
  // Editor blocks put on block-test.html (blockPage).
  blocks: Array<{ id: string; markdown: string | null; issues: Array<{ level: "error" | "warn"; message: string }> }>;
  // One entry per simulated step (lifecycle).
  lifecycle: LifecycleStep[];
}

function safeJoin(root: string, path: string): string {
  const abs = normalize(join(root, path.replace(/^\/+/, "")));
  if (abs !== root && !abs.startsWith(root + sep)) {
    throw new Error(`Refusing to write outside the preview folder: ${path}`);
  }
  return abs;
}

// A publish connector writing into a local folder.
export function folderConnector(root: string, baseUrl: string): StorageConnector {
  const base = baseUrl.replace(/\/+$/, "");
  return {
    id: PREVIEW_CONNECTOR_ID,
    model: "files",
    capabilities: { list: true, rename: false, renameFolder: false, folders: false, deletePrefix: true },
    async put({ path, content, encoding }) {
      const abs = safeJoin(root, path);
      mkdirSync(dirname(abs), { recursive: true });
      writeFileSync(abs, encoding === "base64" ? Buffer.from(content, "base64") : content);
    },
    async get(path) {
      const abs = safeJoin(root, path);
      if (!existsSync(abs)) {
        const { StorageError } = await import("../../src/services/storage/types");
        throw new StorageError(`${path} not found`, 404);
      }
      return readFileSync(abs, "utf8");
    },
    async getBytes(path) {
      const abs = safeJoin(root, path);
      return existsSync(abs) ? new Uint8Array(readFileSync(abs)) : null;
    },
    async delete(path) {
      rmSync(safeJoin(root, path), { force: true });
    },
    async deletePrefix(path) {
      rmSync(safeJoin(root, path), { recursive: true, force: true });
    },
    async publicUrl(path) {
      return `${base}/${path.replace(/^\/+/, "")}`;
    },
    async list(page, perPage) {
      const items = listFiles(root).map((p) => ({ path: p, type: "file" as const }));
      return { items: items.slice((page - 1) * perPage, page * perPage), page, per_page: perPage, total: items.length };
    },
  };
}

export interface LifecycleStep {
  step: "publish" | "unpublish" | "delete" | "bulk-publish";
  description: string;
  added: string[];
  changed: string[];
  removed: string[];
}

function snapshot(root: string): Map<string, string> {
  const out = new Map<string, string>();
  for (const f of listFiles(root)) {
    if (f === ".agentcms-preview" || f.startsWith(".screenshots/")) continue;
    // JSON snapshots carry a generatedAt timestamp — not a change.
    out.set(f, createHash("sha1").update(readFileSync(join(root, f), "utf8").replace(/"generatedAt":"[^"]*"/g, "")).digest("hex"));
  }
  return out;
}

function diff(before: Map<string, string>, after: Map<string, string>) {
  const added: string[] = [];
  const changed: string[] = [];
  const removed: string[] = [];
  for (const [f, h] of after) {
    if (!before.has(f)) added.push(f);
    else if (before.get(f) !== h) changed.push(f);
  }
  for (const f of before.keys()) if (!after.has(f)) removed.push(f);
  return { added, changed, removed };
}

export function listFiles(root: string): string[] {
  const out: string[] = [];
  const walk = (dir: string) => {
    if (!existsSync(dir)) return;
    for (const name of readdirSync(dir)) {
      const abs = join(dir, name);
      if (statSync(abs).isDirectory()) walk(abs);
      else out.push(relative(root, abs).split(sep).join("/"));
    }
  };
  walk(root);
  return out.sort();
}

// Media docs for the demo content: one placeholder SVG per format the
// active theme declares (+ the admin's own formats), written under
// media/demo/<slug>/<format>.svg like the real pipeline's folders.
function demoMedia(theme: ThemeManifest, baseUrl: string, write: (path: string, text: string) => void): StoredDoc[] {
  // Same variants as the admin's image pipeline: the theme's formats plus
  // the admin ones. "cover" = exactly width×height (cropped); "contain" =
  // fits inside the box keeping the source ratio, never upscaled.
  const formats: Record<string, { width: number; height: number; fit?: string }> = {
    ...(theme.imageFormats?.formats ?? {}),
    "admin-thumb": { width: 240, height: 240, fit: "cover" },
    "admin-preview": { width: 800, height: 800, fit: "contain" },
    "admin-original": { width: 2000, height: 2000, fit: "contain" },
  };
  const defaultFormat = theme.imageFormats?.defaultFormat ?? Object.keys(theme.imageFormats?.formats ?? {})[0] ?? "admin-original";
  return FIXTURE_MEDIA.map((m) => {
    const variants: Record<string, { url: string; width: number; height: number; bytes: number }> = {};
    for (const [name, f] of Object.entries(formats)) {
      let { width, height } = f;
      if (f.fit === "contain") {
        const scale = Math.min(1, f.width / m.width, f.height / m.height);
        width = Math.round(m.width * scale);
        height = Math.round(m.height * scale);
      }
      const path = `media/demo/${m.slug}/${name}.svg`;
      const svg = placeholderSvg(width, height, m.hue, m.slug);
      write(path, svg);
      variants[name] = { url: `${baseUrl}/${path}`, width, height, bytes: svg.length };
    }
    return {
      id: m.id,
      name: `${m.slug}.svg`,
      contentType: "image/svg+xml",
      size: 0,
      storageBase: `media/demo/${m.slug}`,
      formats: variants,
      defaultFormat,
      alt: m.alt,
      caption: m.caption,
      uploadedAt: Date.UTC(2026, 0, 1),
      uploadedBy: "author-ada",
    };
  });
}

function interceptConsole(issues: PreviewIssue[]): () => void {
  const original = { error: console.error, warn: console.warn, log: console.log, info: console.info, debug: console.debug };
  const seen = new Set<string>();
  const fmt = (args: unknown[]) => format(...args.map((a) => (a instanceof Error ? a.stack || a.message : a))).slice(0, 2000);
  const push = (level: PreviewIssue["level"], args: unknown[]) => {
    let message = fmt(args);
    // React development warnings (unknown DOM prop, missing key…): the
    // admin runs React's production build, which doesn't print them.
    const reactWarning = /^Warning: /.test(message);
    if (reactWarning) message = message.replace(/^Warning: /, "React: ");
    const key = `${level}:${message}`;
    if (seen.has(key)) return;
    seen.add(key);
    issues.push({ level: reactWarning ? "warn" : level, source: "console", message });
  };
  console.error = (...args: unknown[]) => push("error", args);
  console.warn = (...args: unknown[]) => push("warn", args);
  // Extension console.log output would corrupt --json stdout.
  console.log = (...args: unknown[]) => process.stderr.write(fmt(args) + "\n");
  console.info = console.log;
  console.debug = console.log;
  return () => Object.assign(console, original);
}

export function registerExtensions(host: HostModules, extensions: LoadedExtension[]): void {
  for (const ext of extensions) {
    if (ext.kind === "plugin") {
      host.plugins.loadExternalPluginTranslations(ext.manifest as PluginManifest);
      host.registry.registerExternalPlugin(ext.manifest as PluginManifest);
    } else {
      host.themes.loadExternalThemeTranslations(ext.manifest as ThemeManifest);
      host.registry.registerExternalTheme(ext.manifest as ThemeManifest);
    }
  }
}

export async function renderPreview(opts: PreviewOptions): Promise<PreviewResult> {
  const host = await bootExtensionHost();
  const outDir = resolve(opts.outDir);
  const baseUrl = opts.baseUrl.replace(/\/+$/, "");
  if (opts.clean !== false && existsSync(outDir)) {
    // Only ever wipe a folder this command created (or an empty one).
    const marker = join(outDir, ".agentcms-preview");
    if (readdirSync(outDir).length > 0 && !existsSync(marker)) {
      throw new CliError("out-not-empty", `${outDir} is not empty and was not created by ext preview.`, "Pick an empty or new folder with --out.", 2);
    }
    rmSync(outDir, { recursive: true, force: true });
  }
  mkdirSync(outDir, { recursive: true });
  writeFileSync(join(outDir, ".agentcms-preview"), "Generated by `agentcms ext preview` — safe to delete.\n");

  const issues: PreviewIssue[] = [];
  const restoreConsole = interceptConsole(issues);
  const unsubscribeToasts = (await import("../../src/lib/toast")).subscribeToToasts((t) => {
    if (t.level === "error" || t.level === "warn") issues.push({ level: t.level, source: "toast", message: t.message });
  });
  try {
    host.registry.clearExternalPlugins();
    host.registry.clearExternalThemes();
    // The plugins every admin ships (SEO, sitemaps, RSS, archives,
    // search…), so a site's content renders with the plugins it uses.
    // The extension under test wins over a bundled copy of itself.
    const { loadBundledPluginManifests } = await import("./adminFiles");
    for (const m of await loadBundledPluginManifests(new Set(opts.extensions.map((e) => e.id)))) {
      host.plugins.loadExternalPluginTranslations(m as PluginManifest);
      host.registry.registerExternalPlugin(m as PluginManifest);
    }
    // Bundled themes too, so --theme <bundled id> works (a plugin tried
    // inside magazine, corporate…).
    for (const m of await loadBundledPluginManifests(new Set(opts.extensions.map((e) => e.id)), "themes")) {
      host.themes.loadExternalThemeTranslations(m as ThemeManifest);
      host.registry.registerExternalTheme(m as ThemeManifest);
    }
    registerExtensions(host, opts.extensions);
    const themes = opts.extensions.filter((e) => e.kind === "theme");
    const themeId = opts.themeId ?? (themes.length === 1 ? themes[0].id : themes.length === 0 ? "default" : undefined);
    if (!themeId) {
      throw new CliError("theme-required", "Several themes were given.", "Pick the one to activate with --theme <id>.", 2);
    }
    const theme = host.themes.listThemes().find((t) => t.id === themeId);
    if (!theme) {
      throw new CliError("unknown-theme", `Theme "${themeId}" is not available.`, `Available: ${host.themes.listThemes().map((t) => t.id).join(", ")}.`, 2);
    }

    const write = (path: string, text: string) => {
      const abs = safeJoin(outDir, path);
      mkdirSync(dirname(abs), { recursive: true });
      writeFileSync(abs, text);
    };
    const fixture: { posts: StoredDoc[]; terms: StoredDoc[]; users: StoredDoc[]; media: StoredDoc[]; settings?: StoredDoc } =
      opts.content ?? { ...fixtureDocs(), media: demoMedia(theme, baseUrl, write) };
    const harbor = fixture.media.find((m) => m.id === "media-harbor") as Media | undefined;
    if (opts.demo === "empty" && !opts.content) fixture.posts = fixture.posts.filter((p) => p.type === "page");
    const posts = [...fixture.posts, ...(opts.extraPosts ?? [])].map((p) =>
      typeof p.contentMarkdown === "string"
        ? { ...p, contentMarkdown: p.contentMarkdown.replace(/MEDIA:media-harbor:large/g, harbor ? host.cmsRuntime.pickMediaUrl(harbor, "large") : "") }
        : p,
    );

    const pluginIds = [
      ...opts.extensions.filter((e) => e.kind === "plugin").map((e) => e.id),
      ...(opts.enablePlugins ?? []),
    ];
    const baseSettings = (fixture.settings ?? {}) as Partial<SiteSettings>;
    const enabledPlugins: Record<string, boolean> = { ...(baseSettings.enabledPlugins ?? {}) };
    // Bundled optional plugins stay off unless asked for: the preview
    // shows the extension under test, not the whole default set.
    if (!opts.content) for (const id of ["core-seo", "agentcms-sitemaps", "agentcms-rss", "agentcms-archives", "agentcms-search", "agentcms-multilang", "agentcms-import"]) enabledPlugins[id] = false;
    for (const id of pluginIds) enabledPlugins[id] = true;
    const settings: SiteSettings = {
      ...host.defaultSettings,
      ...(opts.content ? {} : { title: "Preview site", description: "A demo site rendered by agentcms ext preview.", menus: (opts.demo === "empty" ? { header: [], footer: [] } : FIXTURE_MENUS) as SiteSettings["menus"] }),
      ...baseSettings,
      ...opts.settings,
      baseUrl,
      activeThemeId: themeId,
      enabledPlugins,
      themeConfigs: {
        ...(baseSettings.themeConfigs ?? {}),
        ...(opts.themeConfig ? { [themeId]: { ...((baseSettings.themeConfigs ?? {})[themeId] as object), ...opts.themeConfig } } : {}),
      },
      pluginConfigs: { ...(baseSettings.pluginConfigs ?? {}), ...(opts.pluginConfigs ?? {}) },
    } as SiteSettings;

    const store = host.docstore.createMemoryDocStore({
      posts,
      terms: fixture.terms,
      users: fixture.users,
      media: fixture.media,
      settings: [{ ...settings, id: "site" } as unknown as StoredDoc],
      config: [{ id: "storage", connectorId: PREVIEW_CONNECTOR_ID, settings: {} }],
    });
    host.docstore.setDocStoreForTests(store);
    // fetchAllPosts caches the corpus for 30 s: a previous render's
    // posts (another check / preview in this process) must not leak in.
    (await import("../../src/services/posts")).invalidateAllPostsCache();
    await store.ready();
    host.storageRegistry.registerStorageConnector(folderConnector(outDir, baseUrl));
    host.storageRegistry.invalidateActiveStorageConnector();

    host.plugins.applyPluginRegistration(enabledPlugins);
    host.themes.applyThemeRegistration(themeId, settings);
    opts.afterRegister?.(host.pluginRegistry.pluginApi);

    const log = (e: { level: string; message: string }) => {
      if (e.level === "error" || e.level === "warn") issues.push({ level: e.level, source: "publisher", message: e.message });
    };
    let blocks: PreviewResult["blocks"] = [];
    if (opts.blockPage) {
      const prefixes = opts.extensions.map((e) => `${e.id}/`);
      const mine = host.blocks.listBlocks().filter((b) => prefixes.some((p) => b.id.startsWith(p)));
      if (mine.length) {
        const { tryBlocks } = await import("./extBlocks");
        const { blockTestMarkdown } = await import("./extBlocks");
        const harbor = FIXTURE_MEDIA.find((m) => m.id === "media-harbor")!;
        const siteMedia = opts.content?.media[0] as Media | undefined;
        const media = siteMedia
          ? { id: siteMedia.id, url: host.cmsRuntime.pickMediaUrl(siteMedia), alt: siteMedia.alt ?? "" }
          : { id: harbor.id, url: `${baseUrl}/media/demo/${harbor.slug}/admin-original.svg`, alt: harbor.alt };
        blocks = (await tryBlocks(mine, media)).map(({ id, markdown, issues }) => ({ id, markdown, issues }));
        const body = blockTestMarkdown(blocks);
        if (body) {
          await store.write(
            [{ op: "set", collection: "posts", doc: { id: "page-block-test", type: "page", title: "Block test", slug: "block-test", contentMarkdown: body, authorId: "author-ada", termIds: [], status: "online", createdAt: Date.UTC(2026, 0, 2), updatedAt: Date.UTC(2026, 0, 2) } }],
            { message: "Block test page" },
          );
          (await import("../../src/services/posts")).invalidateAllPostsCache();
        }
      }
    }
    const notes: string[] = [];
    if (opts.home === "blocks") {
      if (blocks.some((b) => b.markdown)) {
        settings.homeMode = "static-page";
        settings.homePageId = "page-block-test";
        notes.push("The block test page is the static home page: see the home screenshots.");
      } else {
        notes.push("--home blocks: no editor block to put on the home page.");
      }
    }
    await host.themeSync.syncThemeAssets([theme], settings.themeConfigs, log);
    const users = store.list("users") as unknown as Parameters<HostModules["users"]["buildAuthorLookup"]>[0];
    const media = store.list("media") as unknown as Media[];
    const terms = store.list("terms") as unknown as Parameters<HostModules["publisher"]["buildPublishContext"]>[0]["terms"];
    const ctx = await host.publisher.buildPublishContext({
      terms,
      settings,
      users,
      authorLookup: host.users.buildAuthorLookup(users, media),
    });
    // Same as the admin's Regenerate → Everything: every page, then
    // every plugin regeneration target (sitemaps, feeds, indexes…).
    await host.publisher.regenerateAll(ctx, log);
    const { listRegenerationTargets } = await import("../../src/core/regenerationTargetRegistry");
    // "[plugin] skipped — no favicons uploaded yet / site URL not set"
    // notices describe the demo site's state, not the extension.
    const targetLog = (e: { level: string; message: string }) => {
      if (/^\[[^\]]+\] skipped\b/.test(e.message)) return;
      log(e);
    };
    for (const target of listRegenerationTargets()) {
      try {
        await target.run(ctx, targetLog);
      } catch (err) {
        issues.push({ level: "error", source: "publisher", message: `Regeneration target "${target.id}" failed: ${(err as Error).stack ?? (err as Error).message}` });
      }
    }

    const lifecycle: LifecycleStep[] = [];
    if (opts.lifecycle) {
      // A draft to publish, a published post to unpublish, another to delete.
      const draft = ctx.posts.find((x) => x.status === "draft");
      const online = ctx.posts.filter((x) => x.status === "online");
      const steps: Array<{ step: LifecycleStep["step"]; description: string; run: () => Promise<void> }> = [];
      if (draft) {
        steps.push({ step: "publish", description: `Publish the draft "${draft.title}"`, run: () => host.publisher.publishPost(draft.id, ctx, log) });
        steps.push({ step: "unpublish", description: `Unpublish "${draft.title}" again`, run: () => host.publisher.unpublishPost(draft.id, ctx, log) });
      }
      const victim = online[online.length - 1];
      if (victim) steps.push({ step: "delete", description: `Delete "${victim.title}"`, run: () => host.publisher.deletePostAndUnpublish(victim.id, ctx, log) });
      if (draft) {
        steps.push({
          step: "bulk-publish",
          description: `Bulk-publish "${draft.title}" (lifecycle actions skipped, then the bulk flush runs every regeneration target)`,
          run: async () => {
            ctx.bulkMode = true;
            await host.publisher.publishPost(draft.id, ctx, log);
            await host.publisher.flushBulkRegeneration(ctx, targetLog, listRegenerationTargets());
          },
        });
      }
      for (const s of steps) {
        const before = snapshot(outDir);
        try {
          await s.run();
        } catch (err) {
          issues.push({ level: "error", source: "publisher", message: `Lifecycle step "${s.step}" failed: ${(err as Error).stack ?? (err as Error).message}` });
        }
        lifecycle.push({ step: s.step, description: s.description, ...diff(before, snapshot(outDir)) });
      }
    }

    const files = listFiles(outDir).filter((f) => f !== ".agentcms-preview" && !f.startsWith(".screenshots/"));
    const pick = (re: RegExp) => files.find((f) => re.test(f));
    const p = (slug: string | undefined, type: string) =>
      slug ? files.find((f) => f.endsWith(`/${slug}.html`) || f === `${slug}.html`) : files.find((f) => f.startsWith(type));
    const firstPost = posts.find((x) => x.type === "post" && x.status === "online" && x.primaryTermId);
    // Not the static home page: it is published as index.html.
    const homePageId = settings.homeMode === "static-page" ? settings.homePageId : null;
    const firstPage = posts.find((x) => x.type === "page" && x.status === "online" && x.id !== homePageId && files.some((f) => f.endsWith(`${x.slug}.html`)));
    const cat = fixture.terms.find((t) => t.type === "category");
    return {
      outDir,
      baseUrl,
      themeId,
      // What actually ran: loaded plugins that are on (a missing flag
      // means on, like in the admin) + the must-use ones.
      plugins: host.plugins.listPlugins().filter((p) => enabledPlugins[p.id] !== false).map((p) => p.id),
      files,
      pages: {
        home: "index.html",
        single: p(firstPost?.slug as string | undefined, "post"),
        page: p(firstPage?.slug as string | undefined, "page"),
        category: cat ? pick(new RegExp(`^${cat.slug}/index\\.html$`)) : undefined,
        author: pick(/^author(s)?\//),
        notFound: pick(/^404\.html$/) ?? "404.html",
        ...(files.includes("block-test.html") ? { blocks: "block-test.html" } : {}),
      },
      issues,
      notes,
      blocks,
      lifecycle,
    };
  } finally {
    restoreConsole();
    unsubscribeToasts();
  }
}
