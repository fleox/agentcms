import { existsSync, mkdtempSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { installBrowserEnv } from "./browserEnv";
import { cli, siteCli, writePlan } from "./testing/adminCli";
import { createFakeGithub } from "./testing/fakeGithub";

// Site administration from the CLI on a Markdown-in-git site (content
// repo + GitHub Pages hosting, in-memory GitHub): content, regenerate,
// terms, menus and settings, checked against the content repo and the
// published files.

const TOKEN = "ghp_admin_token";
const gh = createFakeGithub({ login: "me", token: TOKEN });
const root = mkdtempSync(join(tmpdir(), "agentcms-admin-gh-"));
const { run, ok } = siteCli("blog");

const site = () => gh.files("me/site");
const content = () => gh.files("me/content");
const terms = () => JSON.parse(content().get("terms.json") ?? "[]") as Array<Record<string, any>>;
const settingsDoc = () => JSON.parse(content().get("settings/site.json") ?? "{}");

beforeAll(async () => {
  installBrowserEnv();
  vi.stubGlobal("fetch", gh.fetch);
  process.env.AGENTCMS_HOME = join(root, "home");
  process.env.E2E_GH_TOKEN = TOKEN;
  gh.createRepo("me/content", { private: true });
  gh.createRepo("me/site");
  expect((await cli(["credentials", "set", "github:me", "--from-env", "E2E_GH_TOKEN"])).code).toBe(0);
  const plan = writePlan(root, "plan", {
    alias: "blog",
    data: { backend: "markdown-git", git: { provider: "github", owner: "me", repo: "content" }, credential: "github:me" },
    hosting: { type: "github-pages", settings: { owner: "me", repo: "site", siteUrl: "https://me.github.io/site" } },
  });
  expect((await cli(["install", "--plan", plan])).body).toMatchObject({ ok: true, data: { installed: true } });
}, 60_000);

afterAll(() => {
  vi.unstubAllGlobals();
});

describe("content on markdown-git + GitHub Pages", () => {
  it("creates, lists, gets, updates and publishes", async () => {
    const draft = await ok(["content", "create", "--title", "Hello World", "--body", "First **post**.", "--category", "News", "--create-terms"]);
    expect(draft).toMatchObject({ site: "blog", result: { type: "post", slug: "hello-world", status: "draft", path: null } });
    expect(content().get("posts/hello-world.md")).toContain("First **post**.");
    expect(terms().find((t) => t.slug === "news")).toMatchObject({ type: "category", name: "News" });
    expect(site().has("news/hello-world.html")).toBe(false);

    const live = await ok(["content", "create", "--title", "Second", "--body", "Two.", "--category", "news", "--tags", "alpha,beta", "--create-terms", "--publish"]);
    expect(live.result).toMatchObject({ slug: "second", status: "online", path: "news/second.html" });
    expect(site().get("news/second.html")).toContain("Second");
    expect(site().get("index.html")).toContain("Second");
    expect(site().has("news/index.html")).toBe(true);

    // Explicit slug: validated, not rewritten.
    const bad = await run(["content", "create", "--title", "X", "--slug", "Bad Slug"]);
    expect(bad.code).toBe(2);
    expect(bad.body.error?.code).toBe("invalid-slug");
    const taken = await run(["content", "create", "--title", "X", "--slug", "second", "--category", "news"]);
    expect(taken.body.error?.code).toBe("slug-taken");
    // Missing term without --create-terms.
    expect((await run(["content", "create", "--title", "X", "--category", "nope"])).body.error?.code).toBe("not-found");

    const list = await ok(["content", "list"]);
    expect(list.result.map((r: { slug: string }) => r.slug).sort()).toEqual(["hello-world", "second"]);
    const online = await ok(["content", "list", "--status", "online"]);
    expect(online.result).toHaveLength(1);
    expect(online.result[0]).toMatchObject({ slug: "second", category: "news", tags: ["alpha", "beta"], path: "news/second.html" });
    expect((await ok(["content", "list", "--search", "hello"])).result).toHaveLength(1);

    const got = await ok(["content", "get", "hello-world"]);
    expect(got.result).toMatchObject({ title: "Hello World", body: "First **post**.", status: "draft", category: "news" });
    expect((await run(["content", "get", "missing"])).body.error?.code).toBe("not-found");

    // Draft update: saved, not published.
    const upd = await ok(["content", "update", "hello-world", "--title", "Hello again"]);
    expect(upd.result).toMatchObject({ status: "draft", republished: false });
    expect(content().get("posts/hello-world.md")).toContain("Hello again");

    const pub = await ok(["content", "publish", "hello-world"]);
    expect(pub.result).toEqual([expect.objectContaining({ ok: true, status: "online", path: "news/hello-world.html" })]);
    expect(site().get("news/hello-world.html")).toContain("Hello again");
    expect(site().get("index.html")).toContain("Hello again");

    // Online update = Save: republished in place.
    const upd2 = await ok(["content", "update", "second", "--body", "Changed body."]);
    expect(upd2.result).toMatchObject({ republished: true, path: "news/second.html" });
    expect(site().get("news/second.html")).toContain("Changed body.");
    // --no-publish keeps the public page as it was.
    await ok(["content", "update", "second", "--body", "Quiet change.", "--no-publish"]);
    expect(site().get("news/second.html")).toContain("Changed body.");
    await ok(["content", "publish", "second"]);
    expect(site().get("news/second.html")).toContain("Quiet change.");

    // Slug change: the old file goes away.
    await ok(["content", "update", "second", "--slug", "second-renamed"]);
    expect(site().has("news/second.html")).toBe(false);
    expect(site().has("news/second-renamed.html")).toBe(true);

    // Translation (stored in post.translations).
    await ok(["content", "update", "hello-world", "--lang", "fr", "--title", "Bonjour", "--body", "Salut."]);
    expect((await ok(["content", "get", "hello-world"])).result.translations.fr).toMatchObject({ title: "Bonjour", slug: "bonjour", contentMarkdown: "Salut." });
  }, 60_000);

  it("publishes several entries in bulk mode with one cascade", async () => {
    await ok(["content", "create", "--title", "Third", "--category", "news"]);
    await ok(["content", "create", "--title", "Fourth", "--category", "news"]);
    const before = gh.commits("me/site").length;
    const res = await ok(["content", "publish", "third", "fourth"]);
    expect(res.result.map((r: { ok: boolean }) => r.ok)).toEqual([true, true]);
    expect(site().has("news/third.html")).toBe(true);
    expect(site().has("news/fourth.html")).toBe(true);
    const home = site().get("index.html")!;
    expect(home).toContain("Third");
    expect(home).toContain("Fourth");
    // The whole bulk operation (entries + cascade) is one commit.
    expect(gh.commits("me/site").length - before).toBe(1);
  }, 60_000);

  it("documents block attributes and checks --attrs against them", async () => {
    const [spacer] = (await ok(["content", "blocks", "default/spacer"])).result;
    expect(spacer.attrsSchema).toContainEqual(expect.objectContaining({ path: "size", values: ["sm", "md", "lg"], description: expect.any(String) }));
    expect((await run(["content", "blocks", "default/spacer", "--attrs", '{"size":"xl"}'])).body.error?.code).toBe("invalid-value");
    const [lg] = (await ok(["content", "blocks", "default/spacer", "--attrs", '{"size":"lg"}'])).result;
    expect(lg.attrs).toMatchObject({ size: "lg" });
    expect(lg.markdown).toContain('data-cms-block="default/spacer"');
  }, 60_000);

  it("unpublishing deletes the translated pages too", async () => {
    await ok(["plugins", "config", "agentcms-multilang", "--merge", '{"primaryLanguage":"en","enabledLanguages":["fr"]}']);
    // Without a translated category the fr version isn't published: warned.
    const warned = await run(["content", "update", "hello-world", "--lang", "fr", "--title", "Bonjour", "--body", "Salut."]);
    expect(warned.body.data.warnings.join(" ")).toContain("has no fr translation");
    await ok(["terms", "update", "news", "--type", "category", "--lang", "fr", "--name", "Actus", "--slug", "actus"]);
    await ok(["content", "publish", "hello-world"]);
    expect(site().has("fr/actus/bonjour.html")).toBe(true);
    // Removing the translation republishes without it.
    await ok(["content", "update", "hello-world", "--lang", "fr", "--remove"]);
    expect(site().has("fr/actus/bonjour.html")).toBe(false);
    await ok(["content", "update", "hello-world", "--lang", "fr", "--title", "Bonjour", "--body", "Salut."]);
    expect(site().has("fr/actus/bonjour.html")).toBe(true);
    await ok(["content", "unpublish", "hello-world"]);
    expect(site().has("fr/actus/bonjour.html")).toBe(false);
    await ok(["content", "publish", "hello-world"]);
    await ok(["plugins", "config", "agentcms-multilang", "--merge", '{"enabledLanguages":[]}']);
  }, 60_000);

  it("unpublishes, previews and deletes (plan first)", async () => {
    const un = await ok(["content", "unpublish", "hello-world"]);
    expect(un.result[0]).toMatchObject({ ok: true, status: "draft", path: null });
    expect(site().has("news/hello-world.html")).toBe(false);
    expect(site().get("index.html")).not.toContain("Hello again");

    const out = join(root, "preview.html");
    const prev = await ok(["content", "preview", "hello-world", "--out", out, "--title", "Unsaved title"]);
    expect(prev.result).toMatchObject({ file: out });
    expect(readFileSync(out, "utf8")).toContain("Unsaved title");
    expect(content().get("posts/hello-world.md")).not.toContain("Unsaved title");

    const plan = await ok(["content", "delete", "fourth"]);
    expect(plan.result).toMatchObject({ needsConfirmation: true, delete: [{ title: "Fourth", status: "online", path: "news/fourth.html" }] });
    expect(site().has("news/fourth.html")).toBe(true);
    const del = await ok(["content", "delete", "fourth", "--yes"]);
    expect(del.result).toEqual([expect.objectContaining({ ok: true, title: "Fourth" })]);
    expect(site().has("news/fourth.html")).toBe(false);
    expect(content().has("posts/fourth.md")).toBe(false);
    expect(site().get("index.html")).not.toContain("Fourth");
    expect(existsSync(out)).toBe(true);
  }, 60_000);
});

describe("regenerate", () => {
  it("runs every entry of the Regenerate menu", async () => {
    const targets = await ok(["regenerate", "targets"]);
    const ids = targets.result.targets.map((t: { id: string }) => t.id);
    expect(Array.isArray(ids)).toBe(true);

    expect((await ok(["regenerate", "home"])).result).toMatchObject({ what: "home" });
    expect(site().has("index.html")).toBe(true);
    expect((await ok(["regenerate", "all"])).result).toMatchObject({ what: "all" });
    expect(site().has("news/index.html")).toBe(true);
    expect((await ok(["regenerate", "repair"])).result).toMatchObject({ what: "repair", repaired: 0 });
    expect((await ok(["regenerate", "assets"])).result).toMatchObject({ what: "assets" });
    expect(site().has("theme-assets/default.css")).toBe(true);
    expect((await ok(["regenerate", "everything"])).result).toMatchObject({ what: "everything" });
    if (ids.length) expect((await ok(["regenerate", ids[0]])).result).toMatchObject({ what: ids[0] });
    if (ids.includes("agentcms-sitemaps")) expect(site().has("sitemaps/sitemap-index.xml")).toBe(true);

    // Publication dates survive republishing and every regeneration.
    const dated = await ok(["content", "create", "--title", "Back Dated", "--body", "Old.", "--published-at", "2025-03-04T10:00:00Z", "--publish"]);
    const dateOf = async () => (await ok(["content", "get", dated.result.id])).result.publishedAt;
    expect(await dateOf()).toBe("2025-03-04T10:00:00.000Z");
    await ok(["content", "update", dated.result.id, "--body", "Edited."]);
    await ok(["regenerate", "all"]);
    await ok(["regenerate", "repair"]);
    expect(await dateOf()).toBe("2025-03-04T10:00:00.000Z");
    await ok(["content", "update", dated.result.id, "--published-at", "2024-01-02T00:00:00Z"]);
    await ok(["regenerate", "all"]);
    expect(await dateOf()).toBe("2024-01-02T00:00:00.000Z");

    const unknown = await run(["regenerate", "nope"]);
    expect(unknown.code).toBe(2);
    expect(unknown.body.error?.code).toBe("unknown-target");
    expect((await cli(["regenerate"])).code).toBe(2);
  }, 60_000);
});

describe("terms", () => {
  it("creates with the admin's slug rules", async () => {
    const a = await ok(["terms", "create", "--type", "category", "--name", "Travel Tips", "--description", "Go places", "--seo-title", "Travel"]);
    expect(a.result).toMatchObject({ type: "category", slug: "travel-tips", archivePath: "travel-tips/index.html" });
    expect(a.result.next.length).toBeGreaterThan(0);
    // Same name → silently deduplicated.
    expect((await ok(["terms", "create", "--type", "category", "--name", "Travel Tips"])).result.slug).toBe("travel-tips-2");
    // A tag may reuse a category slug (different URL space).
    expect((await ok(["terms", "create", "--type", "tag", "--name", "Travel Tips"])).result.slug).toBe("travel-tips");
    const stored = terms().find((t) => t.slug === "travel-tips" && t.type === "category")!;
    expect(stored).toMatchObject({ name: "Travel Tips", description: "Go places", seo: { title: "Travel" } });

    const taken = await run(["terms", "create", "--type", "category", "--name", "X", "--slug", "travel-tips"]);
    expect(taken).toMatchObject({ code: 2, body: { error: { code: "slug-taken" } } });
    expect((await run(["terms", "create", "--type", "category", "--name", "X", "--slug", "Not Valid"])).body.error?.code).toBe("invalid-slug");
    expect((await run(["terms", "create", "--name", "X"])).code).toBe(2);
    expect((await run(["terms", "create", "--type", "nope", "--name", "X"])).code).toBe(2);

    // Parent (categories only, no cycles).
    const child = await ok(["terms", "create", "--type", "category", "--name", "Europe", "--parent", "travel-tips"]);
    expect(terms().find((t) => t.id === child.result.id)!.parentId).toBe(stored.id);
    expect((await run(["terms", "update", "travel-tips", "--type", "category", "--parent", "europe"])).body.error?.message).toContain("cycle");
  }, 60_000);

  it("lists, gets and updates (SEO, translations, slug)", async () => {
    const cats = await ok(["terms", "list", "--type", "category"]);
    const news = cats.result.find((t: { slug: string }) => t.slug === "news");
    expect(news).toMatchObject({ type: "category", name: "News", archivePath: "news/index.html", posts: 3 });
    expect(cats.result.every((t: { type: string }) => t.type === "category")).toBe(true);
    const got = await ok(["terms", "get", "News"]);
    expect(got.result.usedBy).toHaveLength(3);
    expect(got.result.usedBy.every((u: { primary: boolean }) => u.primary)).toBe(true);
    expect((await run(["terms", "get", "nothing"])).body.error?.code).toBe("not-found");

    // SEO: merged like the SEO modal (unset fields kept, "" clears).
    await ok(["terms", "update", "travel-tips", "--type", "category", "--seo-description", "All about travel", "--seo-image", "https://x.test/a.png"]);
    let t = terms().find((x) => x.slug === "travel-tips" && x.type === "category")!;
    expect(t.seo).toEqual({ title: "Travel", description: "All about travel", ogImage: "https://x.test/a.png" });
    await ok(["terms", "update", "travel-tips", "--type", "category", "--seo-title", ""]);
    t = terms().find((x) => x.slug === "travel-tips" && x.type === "category")!;
    expect(t.seo).toEqual({ description: "All about travel", ogImage: "https://x.test/a.png" });

    // Translation (agentcms-multilang shape).
    const tr = await ok(["terms", "update", "travel-tips", "--type", "category", "--lang", "fr", "--name", "Conseils voyage", "--seo-title", "Voyage"]);
    expect(tr.result.translation).toEqual({ name: "Conseils voyage", slug: "conseils-voyage", description: "", seo: { title: "Voyage" } });
    expect(tr.warnings.length).toBeGreaterThan(0);
    t = terms().find((x) => x.slug === "travel-tips" && x.type === "category")!;
    expect(t.translations.fr).toMatchObject({ name: "Conseils voyage", slug: "conseils-voyage" });
    const clash = await run(["terms", "update", "europe", "--lang", "fr", "--name", "X", "--slug", "conseils-voyage"]);
    expect(clash.body.error?.code).toBe("slug-taken");
    await ok(["terms", "update", "travel-tips", "--type", "category", "--lang", "fr", "--remove"]);
    expect(terms().find((x) => x.slug === "travel-tips" && x.type === "category")!.translations).toBeUndefined();
    expect((await run(["terms", "update", "travel-tips", "--type", "category"])).body.error?.message).toContain("Nothing to update");

    // Slug change: posts move on `regenerate repair`; the old archive stays.
    const ren = await ok(["terms", "update", "news", "--slug", "actualites", "--name", "Actualités"]);
    expect(ren.result).toMatchObject({ slug: "actualites", name: "Actualités", staleArchive: "news/index.html" });
    expect(ren.result.next.join(" ")).toContain("regenerate repair");
    expect(site().has("actualites/third.html")).toBe(false);
    const rep = await ok(["regenerate", "repair"]);
    expect(rep.result.repaired).toBe(2);
    expect(site().has("actualites/third.html")).toBe(true);
    expect(site().has("news/third.html")).toBe(false);
    expect(site().has("actualites/index.html")).toBe(true);
    expect((await run(["terms", "update", "actualites", "--slug", "travel-tips"])).body.error?.code).toBe("slug-taken");
  }, 60_000);

  it("deletes: plan, references, --detach, --remove-archive", async () => {
    const plan = await ok(["terms", "delete", "actualites"]);
    expect(plan.result).toMatchObject({ needsConfirmation: true, delete: { slug: "actualites" }, archivePath: "actualites/index.html" });
    expect(plan.result.usedBy).toHaveLength(3);
    expect(terms().some((t) => t.slug === "actualites")).toBe(true);

    // A tag deleted without --detach: posts keep the stale reference.
    const tag = await ok(["terms", "delete", "alpha", "--type", "tag", "--yes"]);
    expect(tag.result).toMatchObject({ deleted: { slug: "alpha" }, detached: [], archivePath: null });
    expect(tag.result.stillReferencedBy).toHaveLength(1);
    expect(terms().some((t) => t.slug === "alpha")).toBe(false);

    const del = await ok(["terms", "delete", "actualites", "--yes", "--detach", "--remove-archive"]);
    expect(del.result).toMatchObject({ archiveRemoved: true, stillReferencedBy: [] });
    expect(del.result.detached).toHaveLength(3);
    expect(del.result.next.join(" ")).toContain("regenerate repair");
    expect(site().has("actualites/index.html")).toBe(false);
    const posts = (await ok(["content", "list", "--type", "post"])).result;
    expect(posts.every((p: { category: string | null }) => p.category === null)).toBe(true);
    // The posts move to the root on repair.
    await ok(["regenerate", "repair"]);
    expect(site().has("third.html")).toBe(true);
  }, 60_000);
});

describe("menus", () => {
  it("sets the menus from friendly refs and publishes data/menu.json", async () => {
    await ok(["content", "create", "--type", "page", "--title", "About", "--body", "About us.", "--publish"]);
    const set = await ok([
      "menus",
      "set",
      "--data",
      JSON.stringify({
        header: [
          { label: "Home", home: true },
          { label: "About", post: "about", translations: { fr: { label: "À propos" } } },
          { label: "Travel", category: "travel-tips" },
          { label: "Draft", post: "hello-world" },
        ],
        footer: [{ label: "GitHub", url: "https://github.com/me" }],
      }),
    ]);
    expect(set.result.published).toBe("data/menu.json");
    expect(set.result.header.map((i: { target: { href: string } }) => i.target.href)).toEqual(["/index.html", "/about.html", "/travel-tips/index.html", "/hello-world.html"]);
    expect(set.result.header[3].target.problem).toContain("not online");
    expect(set.warnings.join(" ")).toContain("Draft");
    const stored = settingsDoc().menus;
    expect(stored.header[1]).toMatchObject({ label: "About", ref: { kind: "post" }, translations: { fr: { label: "À propos" } } });
    expect(stored.header.every((i: { id: string }) => typeof i.id === "string" && i.id.length > 0)).toBe(true);
    const menuJson = JSON.parse(site().get("data/menu.json")!);
    expect(menuJson.header.map((i: { href: string }) => i.href)).toContain("/about.html");
    expect(menuJson.header[1].labels).toEqual({ fr: "À propos" });
    expect(menuJson.footer[0]).toMatchObject({ label: "GitHub", href: "https://github.com/me" });

    // get → editable as is (round trip keeps ids).
    const got = await ok(["menus", "get"]);
    expect(got.result.header[2].target).toMatchObject({ kind: "category", slug: "travel-tips", href: "/travel-tips/index.html" });
    const again = await ok(["menus", "set", "--data", JSON.stringify({ header: got.result.header })]);
    expect(again.result.header.map((i: { id: string }) => i.id)).toEqual(got.result.header.map((i: { id: string }) => i.id));
    expect(again.result.footer).toHaveLength(1);
  }, 60_000);

  it("adds, moves and removes items; rejects invalid input", async () => {
    await ok(["menus", "add", "--menu", "footer", "--label", "Legal", "--url", "/legal.html", "--position", "1"]);
    let footer = (await ok(["menus", "get"])).result.footer;
    expect(footer.map((i: { label: string }) => i.label)).toEqual(["Legal", "GitHub"]);
    await ok(["menus", "move", "Legal", "--menu", "footer", "--position", "2"]);
    footer = (await ok(["menus", "get"])).result.footer;
    expect(footer.map((i: { label: string }) => i.label)).toEqual(["GitHub", "Legal"]);
    await ok(["menus", "remove", "GitHub", "--menu", "footer"]);
    expect(JSON.parse(site().get("data/menu.json")!).footer.map((i: { label: string }) => i.label)).toEqual(["Legal"]);

    const noLabel = await run(["menus", "set", "--data", JSON.stringify({ header: [{ home: true }] })]);
    expect(noLabel).toMatchObject({ code: 2, body: { error: { code: "invalid-menu" } } });
    expect((await run(["menus", "set", "--data", JSON.stringify({ header: [{ label: "X", post: "nope" }] })])).body.error?.code).toBe("not-found");
    expect((await run(["menus", "set", "--data", JSON.stringify({ header: [{ label: "X", post: "about", url: "https://x" }] })])).body.error?.code).toBe("invalid-menu");
    expect((await run(["menus", "set", "--data", JSON.stringify({ sidebar: [] })])).body.error?.code).toBe("invalid-menu");
    expect((await run(["menus", "add", "--label", "X"])).code).toBe(2);
    expect((await run(["menus", "remove", "nothing", "--menu", "header"])).body.error?.code).toBe("not-found");

    // Delete plans name the menu items that still point to the entry.
    expect((await run(["terms", "delete", "travel-tips"])).body.error?.code).toBe("ambiguous");
    const termPlan = await ok(["terms", "delete", "travel-tips", "--type", "category"]);
    expect(termPlan.result.menuItems).toEqual([expect.objectContaining({ menu: "header", label: "Travel" })]);
    expect(termPlan.result.notes.join(" ")).toContain("agentcms menus remove");
    const pagePlan = await ok(["content", "delete", "about", "--type", "page"]);
    expect(pagePlan.result.menuItems).toEqual([expect.objectContaining({ menu: "header", label: "About" })]);
  }, 60_000);
});

describe("settings", () => {
  it("gets every section without secrets", async () => {
    const all = await ok(["settings", "get"]);
    expect(Object.keys(all.result).sort()).toEqual(["editor", "performance", "site", "target"]);
    expect(all.result.site).toMatchObject({ baseUrl: "https://me.github.io/site", homeMode: "latest-posts", discourageIndexing: false });
    expect(all.result.performance).toMatchObject({ backend: "markdown-git", applicable: false });
    expect(all.result.target).toMatchObject({ connectorId: "git-pages", siteUrl: "https://me.github.io/site", baseUrlMismatch: null });
    expect(all.result.editor.fonts).toContain("Inter");
    expect(JSON.stringify(all)).not.toContain(TOKEN);
    expect(Object.keys((await ok(["settings", "get", "site"])).result)).toEqual(["site"]);
    expect((await run(["settings", "get", "nope"])).code).toBe(2);

    const target = await ok(["settings", "target"]);
    expect(target.result.settings).toMatchObject({ owner: "me", repo: "site" });
    expect(JSON.stringify(target)).not.toContain(TOKEN);
    const test = await ok(["settings", "target", "test"]);
    expect(test.result).toMatchObject({ ok: true, connectorId: "git-pages" });
  }, 60_000);

  it("sets site fields with the admin's validation and says what to regenerate", async () => {
    const res = await ok(["settings", "set", "--title", "My Blog", "--posts-per-page", "5", "--description", "Notes"]);
    expect(res.result.changed.sort()).toEqual(["description", "postsPerPage", "title"]);
    expect(res.result.next).toEqual(["agentcms regenerate all"]);
    expect(settingsDoc()).toMatchObject({ title: "My Blog", postsPerPage: 5, description: "Notes" });
    // Saving republishes nothing.
    expect(site().get("index.html")).not.toContain("My Blog");

    for (const [args, code] of [
      [["--posts-per-page", "0"], "invalid-setting"],
      [["--title", ""], "invalid-setting"],
      [["--language", "not a lang"], "invalid-setting"],
      [["--base-url", "ftp://x"], "invalid-setting"],
      [["--home-mode", "static-page"], "invalid-setting"],
      [["--home-mode", "weird"], "invalid-setting"],
      [["--editor-body-size", "big"], "invalid-setting"],
      [["--editor-font", "Comic"], "invalid-setting"],
      [["--discourage-indexing", "maybe"], "usage"],
      [["--pagination-mode", "paginated"], "not-applicable"],
      [["--data", '{"colour":"red"}'], "usage"],
      [[], "usage"],
    ] as const) {
      const r = await run(["settings", "set", ...args]);
      expect(r.code, args.join(" ")).toBe(2);
      expect(r.body.error?.code, args.join(" ")).toBe(code);
    }

    const home = await ok(["settings", "set", "--home-mode", "static-page", "--home-page", "about"]);
    expect(home.result.site).toMatchObject({ homeMode: "static-page", homePage: { slug: "about", status: "online" } });
    expect(home.result.next[0]).toContain("regenerate repair");
    await ok(["regenerate", "repair"]);
    await ok(["regenerate", "all"]);
    expect(site().get("index.html")).toContain("About us.");
    expect(site().has("about.html")).toBe(false);
    const back = await ok(["settings", "set", "--data", JSON.stringify({ homeMode: "latest-posts" })]);
    expect(back.result.site).toMatchObject({ homeMode: "latest-posts", homePageId: null });
    expect(settingsDoc().homePageId).toBeUndefined();

    const idx = await ok(["settings", "set", "--discourage-indexing", "true", "--language", "fr-FR"]);
    expect(idx.result.next.join(" ")).toContain("regenerate everything");
    expect(settingsDoc()).toMatchObject({ discourageIndexing: true, language: "fr-FR" });
    await ok(["regenerate", "all"]);
    expect(site().get("third.html")).toContain('content="noindex');

    const ed = await ok(["settings", "set", "--editor-font", "Inter", "--editor-body-size", "18px"]);
    expect(ed.result).toMatchObject({ changed: ["editorStyle"], next: [], editor: { fontFamily: "Inter", bodySize: "18px" } });
    await ok(["settings", "set", "--editor-font", "", "--editor-body-size", ""]);
    expect(settingsDoc().editorStyle).toBeUndefined();
  }, 60_000);
});
