import { createRequire as __acmsRequire } from "node:module";
import { fileURLToPath as __acmsPath } from "node:url";
import { dirname as __acmsDirname } from "node:path";
const require2 = __acmsRequire(import.meta.url);
const __filename = __acmsPath(import.meta.url);
const __dirname = __acmsDirname(__filename);
import { existsSync, readdirSync, rmSync, mkdirSync, writeFileSync, readFileSync, statSync } from "node:fs";
import { resolve, join, dirname, normalize, sep, relative } from "node:path";
import { format } from "node:util";
import { createHash } from "node:crypto";
import { C as CliError } from "../agentcms.mjs";
import { bootExtensionHost } from "./extHost-B7psJqHS.mjs";
import "node:url";
import "node:os";
import "node:child_process";
import "node:http";
import "node:module";
const DAY = 864e5;
const T0 = Date.UTC(2026, 0, 15, 9, 0, 0);
const FIXTURE_AUTHOR_ID = "author-ada";
const FIXTURE_MEDIA = [
  // Mixed aspect ratios on purpose: landscape, portrait, panorama, square.
  { id: "media-harbor", slug: "harbor", alt: "Boats in a harbor at sunrise", caption: "Morning in the harbor.", hue: 205, width: 3e3, height: 2e3 },
  { id: "media-forest", slug: "forest", alt: "A path through a pine forest", hue: 130, width: 2e3, height: 3e3 },
  { id: "media-city", slug: "city", alt: "City skyline at night", caption: "The city after dark.", hue: 265, width: 4200, height: 1400 },
  { id: "media-desk", slug: "desk", alt: "A desk with a notebook and a laptop", hue: 30, width: 2400, height: 2400 },
  { id: "media-avatar", slug: "ada", alt: "Portrait of Ada Writer", hue: 340, width: 800, height: 800 }
];
const LONG_BODY = `Static sites are fast, cheap to host and hard to break. This article walks through the ideas behind a CMS that publishes **plain HTML** and nothing else.

## Why static

A page that is already rendered needs no database, no server-side runtime and no cache warm-up. It is just a file.

- Faster first byte
- Nothing to patch on the server
- Any host works: GitHub Pages, an S3 bucket, a USB stick

### A numbered list

1. Write in the editor
2. Click **Publish**
3. The admin renders the page *in your browser* and uploads it

> "The best server is the one you don't run."
> — Someone who was paged at 3 a.m.

![Boats in a harbor at sunrise](MEDIA:media-harbor:large)

## Some code

Inline \`code\` and a fenced block:

\`\`\`ts
export function greet(name: string): string {
  return \`Hello, \${name}!\`;
}
\`\`\`

## A table

| Host | Price | Custom domain |
| --- | --- | --- |
| GitHub Pages | Free | Yes |
| S3 + CDN | Pay as you go | Yes |

Read more on [the project page](https://github.com/fleox/agentcms) or go back to the [about page](/about.html).

---

That's all for now.`;
function post(id, title, slug, day, body, extra = {}) {
  return {
    id,
    type: "post",
    title,
    slug,
    contentMarkdown: body,
    authorId: FIXTURE_AUTHOR_ID,
    termIds: [],
    status: "online",
    createdAt: T0 + day * DAY,
    updatedAt: T0 + day * DAY + 36e5,
    publishedAt: T0 + day * DAY,
    ...extra
  };
}
function fixtureDocs() {
  const terms = [
    { id: "cat-guides", type: "category", name: "Guides", slug: "guides", description: "Step-by-step guides.", createdAt: T0 },
    { id: "cat-news", type: "category", name: "News", slug: "news", description: "What changed recently.", createdAt: T0 },
    { id: "tag-static", type: "tag", name: "Static sites", slug: "static-sites", createdAt: T0 },
    { id: "tag-hosting", type: "tag", name: "Hosting", slug: "hosting", createdAt: T0 },
    { id: "tag-design", type: "tag", name: "Design", slug: "design", createdAt: T0 }
  ];
  const posts = [
    post("post-why-static", "Why a static CMS?", "why-a-static-cms", 9, LONG_BODY, {
      excerpt: "Plain HTML, any host, nothing to patch: the case for publishing static files.",
      heroMediaId: "media-harbor",
      termIds: ["cat-guides", "tag-static", "tag-hosting"],
      primaryTermId: "cat-guides",
      seo: { title: "Why a static CMS? A practical answer", description: "The case for publishing plain HTML." }
    }),
    post("post-hosting", "Choosing where to host", "choosing-where-to-host", 7, "Every host that serves files works.\n\n## GitHub Pages\n\nFree, with a custom domain.\n\n## S3-compatible buckets\n\nCheap and fast behind a CDN.", {
      heroMediaId: "media-city",
      termIds: ["cat-guides", "tag-hosting"],
      primaryTermId: "cat-guides"
    }),
    post("post-release", "Version 2 is out", "version-2-is-out", 5, "A short news item with **bold** text and a [link](https://example.com).", {
      heroMediaId: "media-forest",
      termIds: ["cat-news", "tag-static"],
      primaryTermId: "cat-news",
      excerpt: "What's new in this release."
    }),
    post("post-design", "Designing a readable article page", "designing-a-readable-article-page", 3, 'Line length, contrast and rhythm matter more than fonts.\n\n- Keep lines under 75 characters\n- Use real headings\n\n<div class="note"><p>Raw HTML in Markdown is kept (and sanitised).</p></div>', {
      heroMediaId: "media-desk",
      termIds: ["cat-news", "tag-design"],
      primaryTermId: "cat-news"
    }),
    post("post-no-image", "A post without an image or category", "a-post-without-an-image", 1, "Themes must handle posts with no hero image, no category and no excerpt."),
    {
      ...post("post-draft", "An unpublished draft", "an-unpublished-draft", 0, "Drafts are never rendered."),
      status: "draft",
      termIds: ["cat-news"],
      primaryTermId: "cat-news"
    },
    {
      ...post("page-about", "About", "about", 0, "This site is a preview generated by **agentcms ext preview**.\n\n## Contact\n\nWrite to hello@example.com."),
      type: "page"
    }
  ];
  const users = [
    {
      id: FIXTURE_AUTHOR_ID,
      email: "ada@example.com",
      firstName: "Ada",
      lastName: "Writer",
      title: "Editor",
      bio: "Writes about the web, static sites and typography.",
      avatarMediaId: "media-avatar",
      socials: { github: { url: "https://github.com/fleox/agentcms", visible: true } },
      role: "admin",
      disabled: false,
      createdAt: T0
    }
  ];
  return { posts, terms, users };
}
const FIXTURE_MENUS = {
  header: [
    { id: "m-home", label: "Home", ref: { kind: "home" } },
    { id: "m-guides", label: "Guides", ref: { kind: "term", id: "cat-guides" } },
    { id: "m-news", label: "News", ref: { kind: "term", id: "cat-news" } },
    { id: "m-about", label: "About", ref: { kind: "post", id: "page-about" } }
  ],
  footer: [
    { id: "f-about", label: "About", ref: { kind: "post", id: "page-about" } },
    { id: "f-src", label: "Source", externalUrl: "https://github.com/fleox/agentcms" }
  ]
};
function placeholderSvg(width, height, hue, label) {
  const w = Math.max(1, Math.round(width));
  const h = Math.max(1, Math.round(height));
  const font = Math.max(9, Math.round(Math.min(w, h) / 22));
  const r = Math.round(Math.min(w, h) * 0.09);
  const id = `g${hue}${w}x${h}`;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}"><defs><linearGradient id="${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="hsl(${hue} 55% 72%)"/><stop offset="1" stop-color="hsl(${(hue + 30) % 360} 45% 38%)"/></linearGradient></defs><rect width="${w}" height="${h}" fill="url(#${id})"/><circle cx="${Math.round(w * 0.72)}" cy="${Math.round(h * 0.3)}" r="${r}" fill="hsl(${(hue + 180) % 360} 80% 88%)" opacity=".85"/><path d="M0 ${Math.round(h * 0.68)} Q ${Math.round(w * 0.25)} ${Math.round(h * 0.5)} ${Math.round(w * 0.5)} ${Math.round(h * 0.66)} T ${w} ${Math.round(h * 0.6)} V ${h} H 0 Z" fill="hsl(${hue} 30% 30%)" opacity=".8"/><path d="M0 ${Math.round(h * 0.82)} Q ${Math.round(w * 0.35)} ${Math.round(h * 0.7)} ${Math.round(w * 0.7)} ${Math.round(h * 0.84)} T ${w} ${Math.round(h * 0.78)} V ${h} H 0 Z" fill="hsl(${hue} 30% 18%)"/><text x="${Math.round(font * 0.8)}" y="${h - Math.round(font * 0.8)}" fill="#fff" fill-opacity=".85" font-family="sans-serif" font-size="${font}">${label} ${w}×${h}</text></svg>`;
}
const PREVIEW_CONNECTOR_ID = "agentcms-cli-preview";
function safeJoin(root, path) {
  const abs = normalize(join(root, path.replace(/^\/+/, "")));
  if (abs !== root && !abs.startsWith(root + sep)) {
    throw new Error(`Refusing to write outside the preview folder: ${path}`);
  }
  return abs;
}
function folderConnector(root, baseUrl) {
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
        const { StorageError } = await import("./types-DAD44Ttj.mjs");
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
      const items = listFiles(root).map((p) => ({ path: p, type: "file" }));
      return { items: items.slice((page - 1) * perPage, page * perPage), page, per_page: perPage, total: items.length };
    }
  };
}
function snapshot(root) {
  const out = /* @__PURE__ */ new Map();
  for (const f of listFiles(root)) {
    if (f === ".agentcms-preview" || f.startsWith(".screenshots/")) continue;
    out.set(f, createHash("sha1").update(readFileSync(join(root, f), "utf8").replace(/"generatedAt":"[^"]*"/g, "")).digest("hex"));
  }
  return out;
}
function diff(before, after) {
  const added = [];
  const changed = [];
  const removed = [];
  for (const [f, h] of after) {
    if (!before.has(f)) added.push(f);
    else if (before.get(f) !== h) changed.push(f);
  }
  for (const f of before.keys()) if (!after.has(f)) removed.push(f);
  return { added, changed, removed };
}
function listFiles(root) {
  const out = [];
  const walk = (dir) => {
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
function demoMedia(theme, baseUrl, write) {
  const formats = {
    ...theme.imageFormats?.formats ?? {},
    "admin-thumb": { width: 240, height: 240, fit: "cover" },
    "admin-preview": { width: 800, height: 800, fit: "contain" },
    "admin-original": { width: 2e3, height: 2e3, fit: "contain" }
  };
  const defaultFormat = theme.imageFormats?.defaultFormat ?? Object.keys(theme.imageFormats?.formats ?? {})[0] ?? "admin-original";
  return FIXTURE_MEDIA.map((m) => {
    const variants = {};
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
      uploadedBy: "author-ada"
    };
  });
}
function interceptConsole(issues) {
  const original = { error: console.error, warn: console.warn, log: console.log, info: console.info, debug: console.debug };
  const seen = /* @__PURE__ */ new Set();
  const fmt = (args) => format(...args.map((a) => a instanceof Error ? a.stack || a.message : a)).slice(0, 2e3);
  const push = (level, args) => {
    let message = fmt(args);
    const reactWarning = /^Warning: /.test(message);
    if (reactWarning) message = message.replace(/^Warning: /, "React: ");
    const key = `${level}:${message}`;
    if (seen.has(key)) return;
    seen.add(key);
    issues.push({ level: reactWarning ? "warn" : level, source: "console", message });
  };
  console.error = (...args) => push("error", args);
  console.warn = (...args) => push("warn", args);
  console.log = (...args) => process.stderr.write(fmt(args) + "\n");
  console.info = console.log;
  console.debug = console.log;
  return () => Object.assign(console, original);
}
function registerExtensions(host, extensions) {
  for (const ext of extensions) {
    if (ext.kind === "plugin") {
      host.plugins.loadExternalPluginTranslations(ext.manifest);
      host.registry.registerExternalPlugin(ext.manifest);
    } else {
      host.themes.loadExternalThemeTranslations(ext.manifest);
      host.registry.registerExternalTheme(ext.manifest);
    }
  }
}
async function renderPreview(opts) {
  const host = await bootExtensionHost();
  const outDir = resolve(opts.outDir);
  const baseUrl = opts.baseUrl.replace(/\/+$/, "");
  if (opts.clean !== false && existsSync(outDir)) {
    const marker = join(outDir, ".agentcms-preview");
    if (readdirSync(outDir).length > 0 && !existsSync(marker)) {
      throw new CliError("out-not-empty", `${outDir} is not empty and was not created by ext preview.`, "Pick an empty or new folder with --out.", 2);
    }
    rmSync(outDir, { recursive: true, force: true });
  }
  mkdirSync(outDir, { recursive: true });
  writeFileSync(join(outDir, ".agentcms-preview"), "Generated by `agentcms ext preview` — safe to delete.\n");
  const issues = [];
  const restoreConsole = interceptConsole(issues);
  const unsubscribeToasts = (await import("./toast-CYyyaSAW.mjs")).subscribeToToasts((t) => {
    if (t.level === "error" || t.level === "warn") issues.push({ level: t.level, source: "toast", message: t.message });
  });
  try {
    host.registry.clearExternalPlugins();
    host.registry.clearExternalThemes();
    const { loadBundledPluginManifests } = await import("./adminFiles-BLXkISkC.mjs");
    for (const m of await loadBundledPluginManifests(new Set(opts.extensions.map((e) => e.id)))) {
      host.plugins.loadExternalPluginTranslations(m);
      host.registry.registerExternalPlugin(m);
    }
    for (const m of await loadBundledPluginManifests(new Set(opts.extensions.map((e) => e.id)), "themes")) {
      host.themes.loadExternalThemeTranslations(m);
      host.registry.registerExternalTheme(m);
    }
    registerExtensions(host, opts.extensions);
    const themes = opts.extensions.filter((e) => e.kind === "theme");
    const themeId = opts.themeId ?? (themes.length === 1 ? themes[0].id : themes.length === 0 ? "default" : void 0);
    if (!themeId) {
      throw new CliError("theme-required", "Several themes were given.", "Pick the one to activate with --theme <id>.", 2);
    }
    const theme = host.themes.listThemes().find((t) => t.id === themeId);
    if (!theme) {
      throw new CliError("unknown-theme", `Theme "${themeId}" is not available.`, `Available: ${host.themes.listThemes().map((t) => t.id).join(", ")}.`, 2);
    }
    const write = (path, text) => {
      const abs = safeJoin(outDir, path);
      mkdirSync(dirname(abs), { recursive: true });
      writeFileSync(abs, text);
    };
    const fixture = opts.content ?? { ...fixtureDocs(), media: demoMedia(theme, baseUrl, write) };
    const harbor = fixture.media.find((m) => m.id === "media-harbor");
    if (opts.demo === "empty" && !opts.content) fixture.posts = fixture.posts.filter((p2) => p2.type === "page");
    const posts = [...fixture.posts, ...opts.extraPosts ?? []].map(
      (p2) => typeof p2.contentMarkdown === "string" ? { ...p2, contentMarkdown: p2.contentMarkdown.replace(/MEDIA:media-harbor:large/g, harbor ? host.cmsRuntime.pickMediaUrl(harbor, "large") : "") } : p2
    );
    const pluginIds = [
      ...opts.extensions.filter((e) => e.kind === "plugin").map((e) => e.id),
      ...opts.enablePlugins ?? []
    ];
    const baseSettings = fixture.settings ?? {};
    const enabledPlugins = { ...baseSettings.enabledPlugins ?? {} };
    if (!opts.content) for (const id of ["core-seo", "agentcms-sitemaps", "agentcms-rss", "agentcms-archives", "agentcms-search", "agentcms-multilang", "agentcms-import"]) enabledPlugins[id] = false;
    for (const id of pluginIds) enabledPlugins[id] = true;
    const settings = {
      ...host.defaultSettings,
      ...opts.content ? {} : { title: "Preview site", description: "A demo site rendered by agentcms ext preview.", menus: opts.demo === "empty" ? { header: [], footer: [] } : FIXTURE_MENUS },
      ...baseSettings,
      ...opts.settings,
      baseUrl,
      activeThemeId: themeId,
      enabledPlugins,
      themeConfigs: {
        ...baseSettings.themeConfigs ?? {},
        ...opts.themeConfig ? { [themeId]: { ...(baseSettings.themeConfigs ?? {})[themeId], ...opts.themeConfig } } : {}
      },
      pluginConfigs: { ...baseSettings.pluginConfigs ?? {}, ...opts.pluginConfigs ?? {} }
    };
    const store = host.docstore.createMemoryDocStore({
      posts,
      terms: fixture.terms,
      users: fixture.users,
      media: fixture.media,
      settings: [{ ...settings, id: "site" }],
      config: [{ id: "storage", connectorId: PREVIEW_CONNECTOR_ID, settings: {} }]
    });
    host.docstore.setDocStoreForTests(store);
    (await import("./posts-9fdjvKu4.mjs")).invalidateAllPostsCache();
    await store.ready();
    host.storageRegistry.registerStorageConnector(folderConnector(outDir, baseUrl));
    host.storageRegistry.invalidateActiveStorageConnector();
    host.plugins.applyPluginRegistration(enabledPlugins);
    host.themes.applyThemeRegistration(themeId, settings);
    opts.afterRegister?.(host.pluginRegistry.pluginApi);
    const log = (e) => {
      if (e.level === "error" || e.level === "warn") issues.push({ level: e.level, source: "publisher", message: e.message });
    };
    let blocks = [];
    if (opts.blockPage) {
      const prefixes = opts.extensions.map((e) => `${e.id}/`);
      const mine = host.blocks.listBlocks().filter((b) => prefixes.some((p2) => b.id.startsWith(p2)));
      if (mine.length) {
        const { tryBlocks } = await import("./extBlocks-BM6tQ2F9.mjs");
        const { blockTestMarkdown } = await import("./extBlocks-BM6tQ2F9.mjs");
        const harbor2 = FIXTURE_MEDIA.find((m) => m.id === "media-harbor");
        const siteMedia = opts.content?.media[0];
        const media2 = siteMedia ? { id: siteMedia.id, url: host.cmsRuntime.pickMediaUrl(siteMedia), alt: siteMedia.alt ?? "" } : { id: harbor2.id, url: `${baseUrl}/media/demo/${harbor2.slug}/admin-original.svg`, alt: harbor2.alt };
        blocks = (await tryBlocks(mine, media2)).map(({ id, markdown, issues: issues2 }) => ({ id, markdown, issues: issues2 }));
        const body = blockTestMarkdown(blocks);
        if (body) {
          await store.write(
            [{ op: "set", collection: "posts", doc: { id: "page-block-test", type: "page", title: "Block test", slug: "block-test", contentMarkdown: body, authorId: "author-ada", termIds: [], status: "online", createdAt: Date.UTC(2026, 0, 2), updatedAt: Date.UTC(2026, 0, 2) } }],
            { message: "Block test page" }
          );
          (await import("./posts-9fdjvKu4.mjs")).invalidateAllPostsCache();
        }
      }
    }
    const notes = [];
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
    const users = store.list("users");
    const media = store.list("media");
    const terms = store.list("terms");
    const ctx = await host.publisher.buildPublishContext({
      terms,
      settings,
      users,
      authorLookup: host.users.buildAuthorLookup(users, media)
    });
    await host.publisher.regenerateAll(ctx, log);
    const { listRegenerationTargets } = await import("./regenerationTargetRegistry-3NmN64mg.mjs");
    const targetLog = (e) => {
      if (/^\[[^\]]+\] skipped\b/.test(e.message)) return;
      log(e);
    };
    for (const target of listRegenerationTargets()) {
      try {
        await target.run(ctx, targetLog);
      } catch (err) {
        issues.push({ level: "error", source: "publisher", message: `Regeneration target "${target.id}" failed: ${err.stack ?? err.message}` });
      }
    }
    const lifecycle = [];
    if (opts.lifecycle) {
      const draft = ctx.posts.find((x) => x.status === "draft");
      const online = ctx.posts.filter((x) => x.status === "online");
      const steps = [];
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
          }
        });
      }
      for (const s of steps) {
        const before = snapshot(outDir);
        try {
          await s.run();
        } catch (err) {
          issues.push({ level: "error", source: "publisher", message: `Lifecycle step "${s.step}" failed: ${err.stack ?? err.message}` });
        }
        lifecycle.push({ step: s.step, description: s.description, ...diff(before, snapshot(outDir)) });
      }
    }
    const files = listFiles(outDir).filter((f) => f !== ".agentcms-preview" && !f.startsWith(".screenshots/"));
    const pick = (re) => files.find((f) => re.test(f));
    const p = (slug, type) => slug ? files.find((f) => f.endsWith(`/${slug}.html`) || f === `${slug}.html`) : files.find((f) => f.startsWith(type));
    const firstPost = posts.find((x) => x.type === "post" && x.status === "online" && x.primaryTermId);
    const homePageId = settings.homeMode === "static-page" ? settings.homePageId : null;
    const firstPage = posts.find((x) => x.type === "page" && x.status === "online" && x.id !== homePageId && files.some((f) => f.endsWith(`${x.slug}.html`)));
    const cat = fixture.terms.find((t) => t.type === "category");
    return {
      outDir,
      baseUrl,
      themeId,
      // What actually ran: loaded plugins that are on (a missing flag
      // means on, like in the admin) + the must-use ones.
      plugins: host.plugins.listPlugins().filter((p2) => enabledPlugins[p2.id] !== false).map((p2) => p2.id),
      files,
      pages: {
        home: "index.html",
        single: p(firstPost?.slug, "post"),
        page: p(firstPage?.slug, "page"),
        category: cat ? pick(new RegExp(`^${cat.slug}/index\\.html$`)) : void 0,
        author: pick(/^author(s)?\//),
        notFound: pick(/^404\.html$/) ?? "404.html",
        ...files.includes("block-test.html") ? { blocks: "block-test.html" } : {}
      },
      issues,
      notes,
      blocks,
      lifecycle
    };
  } finally {
    restoreConsole();
    unsubscribeToasts();
  }
}
export {
  PREVIEW_CONNECTOR_ID,
  folderConnector,
  listFiles,
  registerExtensions,
  renderPreview
};
