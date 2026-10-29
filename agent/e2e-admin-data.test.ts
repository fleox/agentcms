import { mkdirSync, mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { installBrowserEnv } from "./browserEnv";
import { main } from "./cli";
import { decodeImage, encodeImage, installNodeImageSupport, type RgbaImage } from "./ops/imageNode";
import type { Io } from "./output";
import { createFakeGithub } from "./testing/fakeGithub";
import { planFit } from "../src/services/imageProcessing";
import { ADMIN_FORMATS } from "../src/services/imageFormats";

// media / users / transfer / stats against two Markdown-in-git sites on
// an in-memory GitHub (+ Pages): real image pipeline (WASM), media on
// the hosting, author profile cascade, export → import into a second
// site, dashboard numbers.

const TOKEN = "ghp_admin_data";
const gh = createFakeGithub({ login: "me", token: TOKEN });
const root = mkdtempSync(join(tmpdir(), "agentcms-admin-data-"));

async function run(args: string[]) {
  const stdout: string[] = [];
  const io: Io = { json: true, out: (t) => stdout.push(t), err: () => {} };
  const code = await main([...args, "--json"], io);
  return { code, body: JSON.parse(stdout.at(-1) ?? "{}") as { ok: boolean; data?: any; error?: { code: string; message: string } } };
}

async function install(alias: string, content: string, site: string) {
  gh.createRepo(`me/${content}`, { private: true });
  gh.createRepo(`me/${site}`);
  const planFile = join(root, `${alias}.json`);
  writeFileSync(
    planFile,
    JSON.stringify({
      alias,
      data: { backend: "markdown-git", git: { provider: "github", owner: "me", repo: content }, credential: "github:me" },
      hosting: { type: "github-pages", settings: { owner: "me", repo: site, siteUrl: `https://me.github.io/${site}` } },
    }),
  );
  const res = await run(["install", "--plan", planFile]);
  expect(res.body.ok).toBe(true);
}

function gradient(width: number, height: number): RgbaImage {
  const data = new Uint8Array(width * height * 4);
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const o = (y * width + x) * 4;
      data[o] = (x * 255) / width;
      data[o + 1] = (y * 255) / height;
      data[o + 2] = 120;
      data[o + 3] = 255;
    }
  }
  return { data, width, height };
}

async function fetchBytes(url: string): Promise<Uint8Array | null> {
  const res = await gh.fetch(url);
  return res.ok ? new Uint8Array(await res.arrayBuffer()) : null;
}

beforeAll(async () => {
  installBrowserEnv();
  installNodeImageSupport();
  vi.stubGlobal("fetch", gh.fetch);
  process.env.AGENTCMS_HOME = join(root, "home");
  process.env.E2E_ADMIN_DATA_TOKEN = TOKEN;
  expect((await run(["credentials", "set", "github:me", "--from-env", "E2E_ADMIN_DATA_TOKEN"])).code).toBe(0);
  await install("blog", "content", "site");
  await install("copy", "content2", "site2");
  await install("pics", "content3", "site3");
}, 120_000);

afterAll(() => {
  vi.unstubAllGlobals();
});

describe("media, users, transfer, stats (fake GitHub)", () => {
  let mediaId = "";
  let jpegId = "";

  it("uploads images through the theme's variants and edits alt / caption", async () => {
    const png = join(root, "Hero Shot.png");
    writeFileSync(png, await encodeImage(gradient(1200, 800), "image/png", 100));
    const jpg = join(root, "portrait.jpg");
    writeFileSync(jpg, await encodeImage(gradient(300, 500), "image/jpeg", 85));
    const bad = join(root, "doc.pdf");
    writeFileSync(bad, "%PDF-1.4");

    const refused = await run(["media", "upload", bad, "--site", "blog"]);
    expect(refused.code).toBe(2);
    expect(refused.body.error?.code).toBe("invalid-media");

    const before = gh.commits("me/site").length;
    const res = await run(["media", "upload", png, jpg, "--site", "blog", "--alt", "A gradient", "--caption", "Made in a test"]);
    expect(res.code).toBe(0);
    const rows = res.body.data.result as Array<{ ok: boolean; id: string; url: string; formats: Record<string, { url: string; width: number; height: number }> }>;
    expect(rows.map((r) => r.ok)).toEqual([true, true]);
    // One commit for the whole command (one Pages build).
    expect(gh.commits("me/site").length).toBe(before + 1);
    [mediaId, jpegId] = rows.map((r) => r.id);

    // The default theme's formats + the admin ones, at planFit's sizes.
    const theme = { small: { width: 480, height: 480, fit: "cover" as const }, medium: { width: 800, height: 800, fit: "cover" as const }, large: { width: 1600, height: 900, fit: "cover" as const } };
    const all = { ...ADMIN_FORMATS, ...theme };
    expect(Object.keys(rows[0].formats).sort()).toEqual(Object.keys(all).sort());
    for (const [name, f] of Object.entries(rows[0].formats)) {
      const url = f.url;
      expect(url).toMatch(new RegExp(`^https://me\\.github\\.io/site/media/\\d{4}/\\d{2}/hero-shot-[0-9a-f]{6}/${name}\\.webp$`));
      const bytes = await fetchBytes(url);
      expect(bytes, url).not.toBeNull();
      const img = await decodeImage(bytes!);
      const plan = planFit(1200, 800, all[name as keyof typeof all]);
      expect([img.width, img.height], name).toEqual([plan.canvasWidth, plan.canvasHeight]);
      expect([f.width, f.height], name).toEqual([plan.canvasWidth, plan.canvasHeight]);
    }
    expect(rows[0].url).toBe(rows[0].formats.medium.url);

    const got = await run(["media", "get", mediaId, "--site", "blog"]);
    expect(got.body.data.result).toMatchObject({ id: mediaId, name: "Hero Shot.png", alt: "A gradient", caption: "Made in a test", defaultFormat: "medium", usages: [] });
    expect(got.body.data.result.formats["admin-original"]).toMatchObject({ width: 1200, height: 800 });
    // The media record is in the content repo.
    const mediaJson = JSON.parse(gh.files("me/content").get("media.json")!);
    expect(JSON.stringify(mediaJson)).toContain(mediaId);

    expect((await run(["media", "update", jpegId, "--site", "blog", "--alt", "Portrait"])).body.data.result).toMatchObject({ alt: "Portrait", caption: "Made in a test" });
    const listed = await run(["media", "list", "--site", "blog", "--search", "portrait"]);
    expect(listed.body.data.result.map((m: { id: string }) => m.id)).toEqual([jpegId]);
  }, 120_000);

  it("uploads several files with their own alt texts (--data), then re-crops missing formats (media regenerate)", async () => {
    const dir = join(root, "batch");
    mkdirSync(dir, { recursive: true });
    writeFileSync(join(dir, "fjord.png"), await encodeImage(gradient(1000, 700), "image/png", 100));
    writeFileSync(join(dir, "dune.png"), await encodeImage(gradient(900, 600), "image/png", 100));
    writeFileSync(join(dir, "media.json"), JSON.stringify([{ file: "fjord.png", alt: "A fjord", caption: "Norway" }, { file: "dune.png", alt: "A dune" }]));
    const before = gh.commits("me/site3").length;
    const up = await run(["media", "upload", "--data", `@${join(dir, "media.json")}`, "--site", "pics"]);
    expect(up.code).toBe(0);
    const [fjord, dune] = up.body.data.result as Array<{ ok: boolean; id: string }>;
    expect([fjord.ok, dune.ok]).toEqual([true, true]);
    expect(gh.commits("me/site3").length).toBe(before + 1);
    expect((await run(["media", "get", fjord.id, "--site", "pics"])).body.data.result).toMatchObject({ alt: "A fjord", caption: "Norway" });
    expect((await run(["media", "get", dune.id, "--site", "pics"])).body.data.result).toMatchObject({ alt: "A dune" });

    // Every format of the active theme is there.
    expect((await run(["media", "regenerate", "--site", "pics"])).body.data.result).toMatchObject({ needsConfirmation: false, media: [], upToDate: 2 });

    // Simulate media uploaded under another theme: "large" missing,
    // "medium" at another size.
    const media = JSON.parse(gh.files("me/content3").get("media.json")!) as Array<{ id: string; formats: Record<string, { width: number; height: number }> }>;
    const doc = media.find((m) => m.id === fjord.id)!;
    delete doc.formats.large;
    doc.formats.medium = { ...doc.formats.medium, width: 640, height: 480 };
    gh.writeFiles("me/content3", { "media.json": JSON.stringify(media, null, 2) });

    const plan = await run(["media", "regenerate", "--site", "pics"]);
    expect(plan.body.data.result).toMatchObject({ needsConfirmation: true, theme: "default", media: [{ id: fjord.id, formats: ["medium", "large"] }], upToDate: 1 });
    const done = await run(["media", "regenerate", "--site", "pics", "--yes"]);
    expect(done.code).toBe(0);
    expect(done.body.data.result.regenerated).toEqual([expect.objectContaining({ id: fjord.id, ok: true, formats: ["medium", "large"] })]);
    expect(done.body.data.result.next).toEqual(["agentcms regenerate all --site pics"]);
    const fresh = (await run(["media", "get", fjord.id, "--site", "pics"])).body.data.result;
    expect(fresh.formats.large).toMatchObject({ width: 1600, height: 900 });
    expect(fresh.formats.medium).toMatchObject({ width: 800, height: 800 });
    const img = await decodeImage((await fetchBytes(fresh.formats.large.url))!);
    expect([img.width, img.height]).toEqual([1600, 900]);
    expect((await run(["media", "regenerate", "--site", "pics"])).body.data.result.media).toEqual([]);
  }, 120_000);

  it("publishes the alt text / caption of each language (multilang)", async () => {
    const pics = (args: string[]) => run([...args, "--site", "pics"]);
    expect((await pics(["plugins", "config", "agentcms-multilang", "--merge", '{"primaryLanguage":"en","enabledLanguages":["fr"]}'])).code).toBe(0);
    const dir = join(root, "multilang");
    mkdirSync(dir, { recursive: true });
    writeFileSync(join(dir, "dawn.png"), await encodeImage(gradient(400, 300), "image/png", 100));
    writeFileSync(join(dir, "media.json"), JSON.stringify([{ file: "dawn.png", alt: "A tent at dawn", caption: "Photo: Ana", translations: { fr: { alt: "Une tente au lever du jour" } } }]));
    const [up] = (await pics(["media", "upload", "--data", `@${join(dir, "media.json")}`])).body.data.result as Array<{ id: string }>;
    expect((await pics(["media", "get", up.id])).body.data.result.translations).toEqual({ fr: { alt: "Une tente au lever du jour" } });
    const upd = await pics(["media", "update", up.id, "--lang", "fr", "--caption", "Photo : Ana"]);
    expect(upd.body.data.result).toMatchObject({ lang: "fr", alt: "A tent at dawn", translations: { fr: { alt: "Une tente au lever du jour", caption: "Photo : Ana" } } });
    expect((await pics(["media", "update", up.id, "--lang", "not a lang", "--alt", "x"])).body.error?.code).toBe("usage");

    expect((await pics(["content", "create", "--title", "Dawn", "--body", "Text.", "--category", "Trips", "--create-terms", "--hero", up.id])).code).toBe(0);
    expect((await pics(["terms", "update", "trips", "--type", "category", "--lang", "fr", "--name", "Voyages", "--slug", "voyages"])).code).toBe(0);
    expect((await pics(["content", "update", "dawn", "--lang", "fr", "--title", "Aube", "--body", "Texte."])).code).toBe(0);
    expect((await pics(["content", "publish", "dawn"])).code).toBe(0);
    const en = gh.files("me/site3").get("trips/dawn.html")!;
    const fr = gh.files("me/site3").get("fr/voyages/aube.html")!;
    expect(en).toContain('alt="A tent at dawn"');
    expect(en).toContain("Photo: Ana");
    expect(fr).toContain('alt="Une tente au lever du jour"');
    expect(fr).toContain("Photo : Ana");
    expect(fr).not.toContain("A tent at dawn");
    // The localised category archive too.
    expect(gh.files("me/site3").get("fr/voyages/index.html")).not.toContain("A tent at dawn");

    // "" clears a field; an empty translation is removed.
    await pics(["media", "update", up.id, "--lang", "fr", "--caption", ""]);
    expect((await pics(["media", "update", up.id, "--lang", "fr", "--alt", ""])).body.data.result.translations).toEqual({});
  }, 120_000);

  it("updates an author profile and republishes authors.json + the author archive", async () => {
    const post = await run(["content", "create", "--site", "blog", "--title", "Hello world", "--body", "First post.", "--hero", mediaId, "--publish"]);
    expect(post.code).toBe(0);

    const before = await run(["users", "list", "--site", "blog"]);
    expect(before.body.data.result.you).toMatchObject({ email: expect.any(String) });

    const res = await run([
      "users", "update", "me", "--site", "blog",
      "--first-name", "Ada", "--last-name", "Lovelace", "--title", "Editor", "--bio", "Writes things.",
      "--avatar", jpegId, "--social", "github=https://github.com/ada twitter=https://x.com/ada,hidden",
    ]);
    expect(res.code).toBe(0);
    const r = res.body.data.result;
    expect(r).toMatchObject({ firstName: "Ada", lastName: "Lovelace", title: "Editor", bio: "Writes things.", avatarMediaId: jpegId, onlinePosts: 1 });
    expect(r.socials).toEqual({ github: { url: "https://github.com/ada", visible: true }, twitter: { url: "https://x.com/ada", visible: false } });
    expect(r.published[0]).toBe("data/authors.json");
    expect(r.published).toHaveLength(2);

    const site = gh.files("me/site");
    const authors = site.get("data/authors.json")!;
    expect(authors).toContain("Ada Lovelace");
    expect(authors).toContain("Writes things.");
    const archive = site.get(r.published[1])!;
    expect(archive).toContain("Ada Lovelace");
    expect(archive).toContain("Hello world");

    // Socials merge; "network=" removes one.
    const merged = await run(["users", "update", "me", "--site", "blog", "--social", "twitter="]);
    expect(merged.body.data.result.socials).toEqual({ github: { url: "https://github.com/ada", visible: true } });

    // Media usage report + plan before delete.
    const plan = await run(["media", "delete", mediaId, jpegId, "--site", "blog"]);
    expect(plan.body.data.result).toMatchObject({ needsConfirmation: true });
    const usages = Object.fromEntries((plan.body.data.result.delete as Array<{ id: string; usages: Array<{ kind: string; where: string[] }> }>).map((d) => [d.id, d.usages]));
    expect(usages[mediaId]).toEqual([expect.objectContaining({ kind: "post", where: ["featured image"] })]);
    expect(usages[jpegId]).toEqual([expect.objectContaining({ kind: "user", where: ["avatar"] })]);
  }, 120_000);

  it("changes role, disabled flag and admin language", async () => {
    const list = await run(["users", "list", "--site", "blog"]);
    const me = list.body.data.result.you.id as string;
    expect((await run(["users", "role", me, "editor", "--site", "blog"])).body.data.result).toMatchObject({ role: "editor", note: expect.stringContaining("repository permission") });
    expect((await run(["users", "get", me, "--site", "blog"])).body.data.result.role).toBe("editor");
    expect((await run(["users", "role", me, "admin", "--site", "blog"])).code).toBe(0);
    expect((await run(["users", "disable", me, "--site", "blog"])).body.data.result.disabled).toBe(true);
    expect((await run(["users", "get", me, "--site", "blog"])).body.data.result.disabled).toBe(true);
    expect((await run(["users", "enable", me, "--site", "blog"])).body.data.result.disabled).toBe(false);
    expect((await run(["users", "locale", "fr", "--site", "blog"])).body.data.result.adminLocale).toBe("fr");
    expect((await run(["users", "get", "me", "--site", "blog"])).body.data.result.adminLocale).toBe("fr");
    expect((await run(["users", "locale", "xx", "--site", "blog"])).code).toBe(2);
  }, 60_000);

  it("reports the dashboard numbers", async () => {
    const stats = await run(["stats", "--site", "blog"]);
    expect(stats.body.data.result).toEqual({
      posts: { total: 1, online: 1, draft: 0 },
      pages: { total: 0, online: 0, draft: 0 },
      terms: expect.objectContaining({ total: expect.any(Number) }),
      media: 2,
      users: 1,
    });
  }, 60_000);

  it("exports a site and imports it into another (merge, then replace)", async () => {
    const out = join(root, "export.json");
    const exp = await run(["transfer", "export", "--site", "blog", "--out", out]);
    expect(exp.code).toBe(0);
    const text = readFileSync(out, "utf8");
    expect(text).not.toContain(TOKEN);
    expect(exp.body.data.result.counts).toMatchObject({ posts: 1, media: 2, users: 1 });
    // The plugins / themes the site runs travel with it, even when no
    // registry was stored yet (the hosted admin's defaults).
    const exported = JSON.parse(text);
    const reg = exported.collections.config.find((d: { id: string }) => d.id === "externalRegistry");
    expect(reg.plugins.length).toBeGreaterThan(0);
    // An export carrying an EMPTY registry (older CLI) never unloads the
    // target's plugins.
    const emptyReg = join(root, "empty-registry.json");
    writeFileSync(emptyReg, JSON.stringify({ ...exported, collections: { config: [{ id: "externalRegistry", plugins: [], themes: [] }] } }));
    expect((await run(["transfer", "import", emptyReg, "--site", "copy", "--mode", "merge", "--keep-target", "--yes"])).code).toBe(0);
    expect((await run(["plugins", "list", "--site", "copy"])).body.data.result.some((p: { id: string }) => p.id === "agentcms-sitemaps")).toBe(true);

    // Something only the second site has.
    expect((await run(["content", "create", "--site", "copy", "--title", "Local only"])).code).toBe(0);

    const plan = await run(["transfer", "import", out, "--site", "copy", "--mode", "merge"]);
    expect(plan.body.data.result).toMatchObject({ needsConfirmation: true });
    expect(plan.body.data.result.warning).toContain("--keep-target");

    const merged = await run(["transfer", "import", out, "--site", "copy", "--mode", "merge", "--keep-target", "--yes"]);
    expect(merged.code).toBe(0);
    expect(merged.body.data.result).toMatchObject({ mode: "merge", publishTargetReplaced: false, next: "agentcms regenerate everything --site copy" });
    let stats = (await run(["stats", "--site", "copy"])).body.data.result;
    expect(stats).toMatchObject({ posts: { total: 2 }, media: 2, users: 1 });
    // The second site still publishes to its own repo.
    const storage = JSON.parse(gh.files("me/content2").get(".cms/config/storage.json")!);
    expect(storage.settings.repo).toBe("site2");

    expect((await run(["transfer", "import", out, "--site", "copy", "--mode", "replace", "--keep-target", "--yes"])).code).toBe(0);
    stats = (await run(["stats", "--site", "copy"])).body.data.result;
    const source = (await run(["stats", "--site", "blog"])).body.data.result;
    expect(stats).toEqual(source);
  }, 120_000);

  it("deletes media: folder removed from the hosting, record gone", async () => {
    const got = await run(["media", "get", mediaId, "--site", "blog"]);
    const folder = got.body.data.result.storageBase as string;
    expect([...gh.files("me/site").keys()].some((p) => p.startsWith(`${folder}/`))).toBe(true);
    const res = await run(["media", "delete", mediaId, "--site", "blog", "--yes"]);
    expect(res.code).toBe(0);
    expect(res.body.data.result.deleted[0]).toMatchObject({ ok: true });
    expect(res.body.data.result.note).toContain("regenerate");
    expect([...gh.files("me/site").keys()].some((p) => p.startsWith(`${folder}/`))).toBe(false);
    expect((await run(["media", "list", "--site", "blog"])).body.data.result.map((m: { id: string }) => m.id)).toEqual([jpegId]);
    expect((await run(["media", "get", mediaId, "--site", "blog"])).body.error?.code).toBe("not-found");

    const planDel = await run(["users", "delete", "me", "--site", "blog"]);
    expect(planDel.body.data.result).toMatchObject({ needsConfirmation: true });
    expect((await run(["users", "delete", "me", "--site", "blog", "--yes"])).body.data.result.deleted).toBe(true);
    expect((await run(["users", "list", "--site", "blog"])).body.data.result.users).toHaveLength(0);
  }, 120_000);
});
