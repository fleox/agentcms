import { mkdirSync, mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { installBrowserEnv } from "./browserEnv";
import { main } from "./cli";
import type { Io } from "./output";
import { createFakeS3 } from "./testing/fakeS3";

// `plugins` and `themes` against a SQLite site on an in-memory S3:
// list / enable / disable / config (with each settings page's side
// effects) / settings-page actions, theme switch, config, logo.

const s3 = createFakeS3({ accessKeyId: "AKID" });
const root = mkdtempSync(join(tmpdir(), "agentcms-pt-"));
const BUCKET = "pt";

async function run(args: string[]) {
  const stdout: string[] = [];
  const io: Io = { json: true, out: (t) => stdout.push(t), err: () => {} };
  const code = await main([...args, "--site", "pt", "--json"], io);
  return { code, body: JSON.parse(stdout.at(-1) ?? "{}") as { ok: boolean; data?: any; error?: { code: string; message: string } } };
}
const has = (key: string) => s3.keys(BUCKET).includes(key);
const text = (key: string) => new TextDecoder().decode(s3.object(BUCKET, key)!.body);

async function png(path: string, w: number, h: number): Promise<string> {
  const { encodeImage } = await import("./ops/imageNode");
  const data = new Uint8Array(w * h * 4);
  for (let i = 0; i < data.length; i += 4) data.set([200, 40, (i / 4) % 255, 255], i);
  writeFileSync(path, await encodeImage({ data, width: w, height: h }, "image/png", 1));
  return path;
}

beforeAll(async () => {
  // Like the published CLI: in-tree plugins / themes come from their
  // built bundles (dist/admin), not from the dev-only static imports.
  vi.stubEnv("DEV", false);
  installBrowserEnv();
  vi.stubGlobal("fetch", s3.fetch);
  process.env.AGENTCMS_HOME = join(root, "home");
  process.env.PT_AK = "AKID";
  process.env.PT_SK = "SECRET";
  s3.createBucket(BUCKET, { public: true });
  const plan = join(root, "plan.json");
  writeFileSync(
    plan,
    JSON.stringify({
      alias: "pt",
      data: { backend: "sqlite-file", path: "data/site.sqlite", encryption: false },
      hosting: { type: "s3", settings: { endpoint: s3.endpoint, region: "fake-1", bucket: BUCKET, publicRead: true, siteUrl: s3.websiteUrl(BUCKET) }, credential: "s3:main" },
    }),
  );
  const stdout: string[] = [];
  const io: Io = { json: true, out: (t) => stdout.push(t), err: () => {} };
  expect(await main(["credentials", "set", "s3:main", "--from-env", "PT_AK,PT_SK", "--json"], io)).toBe(0);
  expect(await main(["install", "--plan", plan, "--json"], io)).toBe(0);
  const post = await run(["content", "create", "--title", "Hello world", "--body", "First post.", "--category", "News", "--create-terms", "--publish"]);
  expect(post.body.ok).toBe(true);
}, 120_000);

afterAll(() => {
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
});

describe("plugins", () => {
  it("lists regular, must-use and installed plugins", async () => {
    const res = await run(["plugins", "list"]);
    expect(res.body.ok).toBe(true);
    const rows = res.body.data.result as Array<{ id: string; kind: string; installed: string; enabled: boolean; loaded: boolean; hasSettings: boolean }>;
    expect(new Set(rows.map((r) => r.id)).size).toBe(rows.length);
    // The bundled plugins came from dist/admin, as in the published CLI.
    expect((await import("../src/plugins")).PLUGINS).toHaveLength(0);
    expect(rows.find((r) => r.id === "agentcms-favicon")).toMatchObject({ kind: "must-use", enabled: true, hasSettings: true });
    expect(rows.find((r) => r.id === "agentcms-rss")).toMatchObject({ kind: "regular", installed: "external", enabled: true, loaded: true });
  }, 60_000);

  it("enables and disables like the Plugins page, never a must-use plugin", async () => {
    const off = await run(["plugins", "disable", "agentcms-search"]);
    expect(off.body.data.result).toMatchObject({ id: "agentcms-search", enabled: false, changed: true });
    expect(off.body.data.result.next[0]).toContain("regenerate everything");
    expect((await run(["plugins", "list"])).body.data.result.find((r: { id: string }) => r.id === "agentcms-search").enabled).toBe(false);
    expect((await run(["plugins", "action", "agentcms-search", "regenerate"])).body.error?.code).toBe("plugin-disabled");
    expect((await run(["plugins", "enable", "agentcms-search"])).body.data.result).toMatchObject({ enabled: true, changed: true });
    expect((await run(["plugins", "disable", "agentcms-favicon"])).body.error?.code).toBe("must-use");
  }, 60_000);

  it("reads, replaces and merges a config with the settings page's side effects (rss)", async () => {
    const schema = await run(["plugins", "config", "agentcms-rss", "--schema"]);
    expect(schema.body.data.result.defaultConfig).toHaveProperty("categoryFeeds");
    const merged = await run(["plugins", "config", "agentcms-rss", "--merge", '{"site":{"enabled":true},"categoryFeeds":[{"termId":"news","addToFooter":true}],"bogus":1}']);
    expect(merged.body.ok).toBe(true);
    expect(merged.body.data.result.effects).toContain("published data/menu.json");
    expect(merged.body.data.result.warnings.join(" ")).toContain('"bogus"');
    expect(merged.body.data.result.config.categoryFeeds[0]).toMatchObject({ itemCount: 20, addToFooter: true });
    expect(merged.body.data.result.config.categoryFeeds[0].termId).not.toBe("news");
    expect(merged.body.data.result.config.site).toMatchObject({ enabled: true, itemCount: 20 });
    // The footer link of the feed is in menu.json right away.
    expect(text("data/menu.json")).toContain("news.xml");

    expect((await run(["plugins", "action", "agentcms-rss", "regenerate"])).body.ok).toBe(true);
    expect(has("rss.xml")).toBe(true);
    expect(has("news/news.xml")).toBe(true);
    expect((await run(["plugins", "action", "agentcms-rss", "stylesheet"])).body.ok).toBe(true);
    expect(has("rss.xsl")).toBe(true);

    // Removing the feed / disabling the site feed deletes their files.
    const get = await run(["plugins", "config", "agentcms-rss"]);
    const cfg = get.body.data.result.config;
    const set = await run(["plugins", "config", "agentcms-rss", "--set", JSON.stringify({ ...cfg, site: { ...cfg.site, enabled: false }, categoryFeeds: [] })]);
    expect(set.body.data.result.effects).toEqual(expect.arrayContaining(["deleted news/news.xml", "deleted rss.xml"]));
    expect(has("news/news.xml")).toBe(false);
    expect(has("rss.xml")).toBe(false);
    expect(text("data/menu.json")).not.toContain("news.xml");
  }, 60_000);

  it("runs the sitemaps, search and archives buttons", async () => {
    expect((await run(["plugins", "action", "agentcms-sitemaps", "robots", "--default-robots"])).body.ok).toBe(true);
    expect(text("robots.txt")).toContain("Sitemap:");
    expect((await run(["plugins", "action", "agentcms-sitemaps", "stylesheets"])).body.data.result.uploaded).toContain("sitemaps/sitemap.xsl");
    expect((await run(["plugins", "action", "agentcms-sitemaps", "regenerate"])).body.ok).toBe(true);
    expect(text("sitemaps/sitemap-index.xml")).toContain("<sitemapindex");
    expect((await run(["plugins", "action", "agentcms-search", "regenerate"])).body.ok).toBe(true);
    expect(text("search-index.json")).toContain("Hello world");
    expect((await run(["plugins", "action", "agentcms-archives", "regenerate"])).body.ok).toBe(true);
    expect(has("archives/index.html")).toBe(true);
    expect((await run(["plugins", "action", "agentcms-archives", "nope"])).body.error?.code).toBe("usage");
  }, 60_000);

  it("generates, updates and removes favicons", async () => {
    const icon = await png(join(root, "icon.png"), 64, 64);
    const set = await run(["plugins", "action", "agentcms-favicon", "set", icon, "--pwa", '{"name":"Pt Site"}']);
    expect(set.body.ok).toBe(true);
    for (const f of ["favicon.ico", "favicon-96x96.png", "apple-touch-icon.png", "web-app-manifest-512x512.png", "site.webmanifest"]) expect(has(`favicon/${f}`)).toBe(true);
    expect(JSON.parse(text("favicon/site.webmanifest")).name).toBe("Pt Site");
    expect((await run(["plugins", "config", "agentcms-favicon"])).body.data.result.config).toMatchObject({ enabled: true, hasIco: true, pwaName: "Pt Site" });

    expect((await run(["plugins", "action", "agentcms-favicon", "manifest", "--pwa", '{"shortName":"Pt","themeColor":"#112233"}'])).body.data.result.regenerated).toBe(true);
    expect(JSON.parse(text("favicon/site.webmanifest"))).toMatchObject({ short_name: "Pt", theme_color: "#112233" });
    // A PWA field changed through config also rewrites the manifest.
    const cfg = await run(["plugins", "config", "agentcms-favicon", "--merge", '{"pwaName":"Renamed"}']);
    expect(cfg.body.data.result.effects).toContain("uploaded favicon/site.webmanifest");
    expect(JSON.parse(text("favicon/site.webmanifest")).name).toBe("Renamed");

    expect((await run(["plugins", "action", "agentcms-favicon", "remove"])).body.ok).toBe(true);
    expect(s3.keys(BUCKET).some((k) => k.startsWith("favicon/"))).toBe(false);
    expect((await run(["plugins", "config", "agentcms-favicon"])).body.data.result.config).toMatchObject({ enabled: false, hasIco: false, pwaName: "Renamed" });
  }, 60_000);

  it("imports a local Markdown folder with an image: scan, plan, run", async () => {
    const dir = join(root, "import");
    mkdirSync(join(dir, "images"), { recursive: true });
    await png(join(dir, "images", "cover.png"), 40, 30);
    writeFileSync(join(dir, "README.md"), "# not content");
    writeFileSync(join(dir, "imported.md"), "---\ntitle: Imported story\ncategory: Travel\ntags: [alps]\nheroImage: cover.png\n---\n\nBody with ![cover](cover.png).\n");

    const scan = await run(["plugins", "action", "agentcms-import", "scan", dir, "--status", "online"]);
    expect(scan.body.data.result).toMatchObject({ categoriesToCreate: ["Travel"], tagsToCreate: ["alps"], errors: [] });
    expect(scan.body.data.result.entries).toEqual([expect.objectContaining({ title: "Imported story", slug: "imported-story", willPublish: true })]);
    expect(scan.body.data.result.imagesToUpload).toHaveLength(1);

    const plan = await run(["plugins", "action", "agentcms-import", "run", dir, "--status", "online"]);
    expect(plan.body.data.result.needsConfirmation).toBe(true);
    expect((await run(["content", "list"])).body.data.result).toHaveLength(1);

    const done = await run(["plugins", "action", "agentcms-import", "run", dir, "--status", "online", "--yes"]);
    expect(done.body.data.result).toMatchObject({ errors: [] });
    expect(done.body.data.result.created).toHaveLength(1);
    expect(done.body.data.result.published).toHaveLength(1);
    expect(done.body.data.result.media).toHaveLength(1);
    expect(has("travel/imported-story.html")).toBe(true);
    expect(text("travel/imported-story.html")).toContain("Imported story");
    expect(s3.keys(BUCKET).filter((k) => k.startsWith("media/") && k.includes("cover")).length).toBeGreaterThan(2);
  }, 120_000);

  it("scans a WordPress export (namespaces + CDATA, no browser DOM)", async () => {
    const xml = join(root, "wordpress.xml");
    writeFileSync(
      xml,
      `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:content="http://purl.org/rss/1.0/modules/content/" xmlns:wp="http://wordpress.org/export/1.2/" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:excerpt="http://wordpress.org/export/1.2/excerpt/">
<channel><title>Old blog</title>
<wp:category><wp:category_nicename>recipes</wp:category_nicename><wp:category_parent></wp:category_parent><wp:cat_name><![CDATA[Recipes]]></wp:cat_name></wp:category>
<item><title>Soup &amp; bread</title><dc:creator>admin</dc:creator>
<content:encoded><![CDATA[<p>Hot <strong>soup</strong> & <em>bread</em>.</p>]]></content:encoded>
<excerpt:encoded><![CDATA[Warm]]></excerpt:encoded>
<wp:post_name>soup-and-bread</wp:post_name><wp:post_type>post</wp:post_type><wp:status>publish</wp:status><wp:post_date>2019-02-03 10:00:00</wp:post_date>
<category domain="category" nicename="recipes"><![CDATA[Recipes]]></category><category domain="post_tag" nicename="winter"><![CDATA[Winter]]></category></item>
</channel></rss>`,
    );
    const scan = await run(["plugins", "action", "agentcms-import", "scan", xml]);
    expect(scan.body.data.result.errors).toEqual([]);
    expect(scan.body.data.result.entries).toEqual([expect.objectContaining({ title: "Soup & bread", slug: "soup-and-bread", type: "post", category: "Recipes", tags: ["Winter"] })]);
  }, 60_000);
});

describe("themes", () => {
  it("lists themes and saves a config with its stylesheet", async () => {
    const list = await run(["themes", "list"]);
    const rows = list.body.data.result as Array<{ id: string; active: boolean; hasSettings: boolean; logo: boolean }>;
    expect(rows.find((r) => r.id === "default")).toMatchObject({ active: true, hasSettings: true, logo: true });
    expect(rows.find((r) => r.id === "magazine")).toMatchObject({ active: false });
    expect(new Set(rows.map((r) => r.id)).size).toBe(rows.length);

    const schema = (await run(["themes", "config", "default", "--schema"])).body.data.result;
    expect(schema.defaultConfig).toHaveProperty("style");
    // (CSS imports are empty under vitest: the parser is unit-tested.)
    expect(schema).toHaveProperty("cssVariables");
    const saved = await run(["themes", "config", "default", "--merge", '{"style":{"vars":{"--color-bg":"#123456"}}}']);
    expect(saved.body.data.result.effects).toContain("uploaded theme-assets/default.css");
    // Style only: the CSS is live, nothing to regenerate.
    expect(saved.body.data.result.next).toEqual([]);
    expect(text("theme-assets/default.css")).toContain("#123456");
  }, 60_000);

  it("uploads and removes a logo (menu.json branding)", async () => {
    const logo = await png(join(root, "logo.png"), 300, 100);
    const up = await run(["themes", "logo", "default", logo]);
    expect(up.body.data.result).toMatchObject({ logo: "theme-assets/default-logo.webp", logoEnabled: true });
    const webp = s3.object(BUCKET, "theme-assets/default-logo.webp")!.body;
    expect(new TextDecoder().decode(webp.slice(8, 12))).toBe("WEBP");
    expect(JSON.parse(text("data/menu.json")).branding.logoUrl).toContain("/theme-assets/default-logo.webp?v=");

    expect((await run(["themes", "logo", "default", "--remove"])).body.data.result).toMatchObject({ logo: null, logoEnabled: false });
    expect(has("theme-assets/default-logo.webp")).toBe(false);
    expect(JSON.parse(text("data/menu.json")).branding).toBeUndefined();
  }, 60_000);

  it("switches theme only with --yes, regenerating the whole site", async () => {
    const plan = await run(["themes", "activate", "magazine"]);
    expect(plan.body.data.result).toMatchObject({ needsConfirmation: true, from: "default", to: "magazine" });
    expect(text("news/hello-world.html")).toContain("theme-assets/default.css");

    const res = await run(["themes", "activate", "magazine", "--yes"]);
    expect(res.body.data.result).toMatchObject({ from: "default", to: "magazine" });
    expect(has("theme-assets/magazine.css")).toBe(true);
    for (const page of ["news/hello-world.html", "travel/imported-story.html", "index.html", "news/index.html"]) {
      expect(text(page)).toContain("theme-assets/magazine.css");
    }
    expect((await run(["themes", "list"])).body.data.result.find((r: { id: string }) => r.id === "magazine").active).toBe(true);
    expect((await run(["themes", "sync-assets"])).body.data.result.themes).toContain("magazine");
  }, 120_000);
});
