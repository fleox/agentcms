import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { installBrowserEnv } from "./browserEnv";
import { cli, siteCli, writePlan } from "./testing/adminCli";
import { createFakeGithub } from "./testing/fakeGithub";

// Content and term moves on a Markdown-in-git site + GitHub Pages
// (in-memory GitHub): category rename / delete with --move-to and
// --remove-archive, plugin files after the suggested regenerations,
// menu labels and `menus update`, links stored in theme / plugin
// configs and menu URLs, preview output location.

const TOKEN = "ghp_links_token";
const gh = createFakeGithub({ login: "me", token: TOKEN });
const root = mkdtempSync(join(tmpdir(), "agentcms-admin-links-"));
const { run, ok } = siteCli("links");

const site = () => gh.files("me/site");
const terms = () => JSON.parse(gh.files("me/content").get("terms.json") ?? "[]") as Array<Record<string, any>>;
const pluginFiles = () => [...site().keys()].filter((k) => /^sitemaps\/.*\.xml$|^rss\.xml$|^search-index\.json$/.test(k));

beforeAll(async () => {
  installBrowserEnv();
  vi.stubGlobal("fetch", gh.fetch);
  process.env.AGENTCMS_HOME = join(root, "home");
  process.env.E2E_GH_TOKEN = TOKEN;
  gh.createRepo("me/content", { private: true });
  gh.createRepo("me/site");
  expect((await cli(["credentials", "set", "github:me", "--from-env", "E2E_GH_TOKEN"])).code).toBe(0);
  const plan = writePlan(root, "plan", {
    alias: "links",
    data: { backend: "markdown-git", git: { provider: "github", owner: "me", repo: "content" }, credential: "github:me" },
    hosting: { type: "github-pages", settings: { owner: "me", repo: "site", siteUrl: "https://me.github.io/site" } },
  });
  expect((await cli(["install", "--plan", plan])).body).toMatchObject({ ok: true, data: { installed: true } });
  for (const id of ["agentcms-sitemaps", "agentcms-rss", "agentcms-search"]) await ok(["plugins", "enable", id]);

  await ok(["terms", "create", "--type", "category", "--name", "Saisons"]);
  await ok(["terms", "create", "--type", "category", "--name", "Recettes"]);
  await ok(["content", "create", "--title", "Octobre au marché", "--slug", "octobre-au-marche", "--category", "saisons", "--publish"]);
  await ok(["content", "create", "--title", "Soupe", "--category", "saisons", "--publish"]);
  await ok(["content", "create", "--title", "Tarte", "--category", "saisons", "--publish"]);
  await ok(["menus", "set", "--data", JSON.stringify({
    header: [{ label: "Saisons", category: "saisons" }],
    footer: [{ label: "Soupe", url: "https://me.github.io/site/saisons/soupe.html" }],
  })]);
  await ok(["regenerate", "everything"]);
}, 120_000);

afterAll(() => {
  vi.unstubAllGlobals();
});

describe("links stored in configs", () => {
  it("names theme settings and menu URLs that point to a moved page, with the fixing command", async () => {
    await ok(["themes", "config", "default", "--merge", JSON.stringify({ promo: { href: "/saisons/octobre-au-marche.html", cards: [{ href: "/site/saisons/octobre-au-marche" }] } })]);
    const upd = await ok(["content", "update", "octobre-au-marche", "--category", "recettes"]);
    expect(upd.result.path).toBe("recettes/octobre-au-marche.html");
    expect(site().has("saisons/octobre-au-marche.html")).toBe(false);
    const links = upd.result.staleLinks;
    const href = links.find((l: { key: string }) => l.key === "promo.href");
    expect(href).toMatchObject({ where: "theme", owner: "default", from: "saisons/octobre-au-marche.html", to: "recettes/octobre-au-marche.html", suggested: "/recettes/octobre-au-marche.html" });
    expect(href.fix).toBe(`agentcms themes config default --merge '{"promo":{"href":"/recettes/octobre-au-marche.html"}}' --site links`);
    // Arrays are replaced by --merge: the whole array is sent; the base
    // path (/site) of the site URL is kept.
    const card = links.find((l: { key: string }) => l.key === "promo.cards[0].href");
    expect(card.suggested).toBe("/site/recettes/octobre-au-marche.html");
    expect(card.fix).toContain(`'{"promo":{"cards":[{"href":"/site/recettes/octobre-au-marche.html"}]}}'`);
    expect(upd.warnings.join(" ")).toContain("promo.href");

    // Running the suggested fix clears the warning.
    await ok(["themes", "config", "default", "--merge", JSON.stringify({ promo: { href: href.suggested, cards: [{ href: card.suggested }] } })]);
    const un = await ok(["content", "unpublish", "recettes/octobre-au-marche"]);
    expect(un.warnings.filter((w: string) => w.includes("is no longer published"))).toHaveLength(2);
    expect(un.warnings.join(" ")).toContain("<new URL>");
    await ok(["content", "publish", "octobre-au-marche"]);
  }, 120_000);
});

describe("terms update: slug rename", () => {
  it("suggests repair + everything, removes the old archive, names menu labels and menu URLs", async () => {
    expect(site().has("saisons/index.html")).toBe(true);
    const ren = await ok(["terms", "update", "saisons", "--slug", "les-saisons", "--name", "Les saisons", "--remove-archive"]);
    expect(ren.result).toMatchObject({ slug: "les-saisons", staleArchive: "saisons/index.html", archiveRemoved: true });
    const next = ren.result.next.join(" ");
    expect(next).toContain("regenerate repair");
    expect(next).toContain("regenerate everything");
    expect(site().has("saisons/index.html")).toBe(false);
    // The header item kept its old label.
    expect(ren.result.menuLabels).toEqual([expect.objectContaining({ menu: "header", label: "Saisons" })]);
    expect(ren.result.menuLabels[0].fix).toBe(`agentcms menus update ${ren.result.menuLabels[0].id} --menu header --label 'Les saisons' --site links`);
    // The footer's hand-written URL to a post of the category.
    expect(ren.result.staleLinks).toEqual([expect.objectContaining({ where: "menu", owner: "footer", to: "les-saisons/soupe.html", suggested: "https://me.github.io/site/les-saisons/soupe.html" })]);

    await ok(["regenerate", "repair"]);
    await ok(["regenerate", "everything"]);
    expect(site().has("les-saisons/soupe.html")).toBe(true);
    expect(site().has("les-saisons/index.html")).toBe(true);
    // Every plugin file follows (sitemaps, RSS, search index).
    expect(pluginFiles().length).toBeGreaterThan(0);
    for (const f of pluginFiles()) expect(site().get(f), f).not.toMatch(/\/saisons\//);
    expect(pluginFiles().some((f) => site().get(f)!.includes("/les-saisons/"))).toBe(true);

    // Renamed without --remove-archive: the hint names the exact command.
    const again = await ok(["terms", "update", "les-saisons", "--slug", "saison"]);
    expect(again.result.archiveRemoved).toBe(false);
    const hint = again.result.next.find((n: string) => n.includes("--old-slug"));
    expect(hint).toContain("agentcms terms update saison --type category --remove-archive --old-slug les-saisons --site links");
    expect(site().has("les-saisons/index.html")).toBe(true);
    const rm = await ok(["terms", "update", "saison", "--type", "category", "--remove-archive", "--old-slug", "les-saisons"]);
    expect(rm.result).toMatchObject({ archiveRemoved: true, staleArchive: "les-saisons/index.html" });
    expect(site().has("les-saisons/index.html")).toBe(false);
    expect((await run(["terms", "update", "saison", "--remove-archive", "--old-slug", "recettes"])).code).toBe(2);
    expect((await run(["terms", "update", "saison", "--remove-archive"])).code).toBe(2);
    expect((await run(["terms", "update", "saison", "--old-slug", "x"])).code).toBe(2);
    await ok(["regenerate", "repair"]);
  }, 120_000);
});

describe("menus update", () => {
  it("edits one item: label, translated label, target", async () => {
    const id = (await ok(["menus", "get"])).result.header[0].id;
    await ok(["menus", "update", id, "--menu", "header", "--label", "Les saisons"]);
    await ok(["menus", "update", "Les saisons", "--menu", "header", "--lang", "en", "--label", "Seasons"]);
    let item = (await ok(["menus", "get"])).result.header[0];
    expect(item).toMatchObject({ id, label: "Les saisons", translations: { en: { label: "Seasons" } }, target: { kind: "category", slug: "saison" } });
    expect(JSON.parse(site().get("data/menu.json")!).header[0]).toMatchObject({ label: "Les saisons", labels: { en: "Seasons" } });
    await ok(["menus", "update", "1", "--menu", "header", "--category", "recettes"]);
    await ok(["menus", "update", id, "--menu", "header", "--lang", "en", "--label", ""]);
    item = (await ok(["menus", "get"])).result.header[0];
    expect(item.target).toMatchObject({ kind: "category", slug: "recettes", href: "/recettes/index.html" });
    expect(item.translations).toBeUndefined();
    const f = (await ok(["menus", "get"])).result.footer[0];
    await ok(["menus", "update", f.id, "--menu", "footer", "--url", "/saison/soupe.html"]);
    expect((await ok(["menus", "get"])).result.footer[0]).toMatchObject({ externalUrl: "/saison/soupe.html", label: "Soupe" });
    await ok(["menus", "update", f.id, "--menu", "footer", "--home"]);
    expect((await ok(["menus", "get"])).result.footer[0].externalUrl).toBeUndefined();
    await ok(["menus", "update", f.id, "--menu", "footer", "--url", "/saison/soupe.html"]);

    expect((await run(["menus", "update", id, "--menu", "header"])).code).toBe(2);
    expect((await run(["menus", "update", id, "--menu", "header", "--label", ""])).body.error?.code).toBe("invalid-menu");
    expect((await run(["menus", "update", id, "--menu", "header", "--url", "/x", "--home"])).code).toBe(2);
    expect((await run(["menus", "update", id, "--menu", "header", "--lang", "fr"])).code).toBe(2);
    expect((await run(["menus", "update", "nothing", "--menu", "header", "--label", "X"])).body.error?.code).toBe("not-found");
  }, 60_000);
});

describe("terms delete --move-to", () => {
  it("validates, plans, moves the posts and republishes them in one batch", async () => {
    expect((await run(["terms", "delete", "saison", "--move-to", "recettes", "--detach"])).code).toBe(2);
    expect((await run(["terms", "delete", "saison", "--move-to", "nope"])).body.error?.code).toBe("not-found");
    expect((await run(["terms", "delete", "saison", "--move-to", "saison"])).code).toBe(2);
    await ok(["terms", "create", "--type", "tag", "--name", "Hiver"]);
    expect((await run(["terms", "delete", "hiver", "--move-to", "recettes"])).code).toBe(2);

    // A post of the target category with the same slug blocks the move.
    const clash = await ok(["content", "create", "--title", "Tarte", "--slug", "tarte", "--category", "recettes"]);
    const blocked = await ok(["terms", "delete", "saison", "--move-to", "recettes"]);
    expect(blocked.result.move.conflicts).toEqual([expect.objectContaining({ path: "recettes/tarte.html" })]);
    expect((await run(["terms", "delete", "saison", "--move-to", "recettes", "--yes"])).body.error?.code).toBe("slug-taken");
    await ok(["content", "delete", clash.result.id, "--yes"]);

    const plan = await ok(["terms", "delete", "saison", "--move-to", "recettes", "--remove-archive"]);
    expect(plan.result).toMatchObject({ needsConfirmation: true, move: { to: { slug: "recettes" }, republish: 2, conflicts: [] } });
    expect(plan.result.move.posts).toEqual(
      expect.arrayContaining([expect.objectContaining({ title: "Soupe", change: "category → recettes", from: "saison/soupe.html", to: "recettes/soupe.html" })]),
    );
    expect(site().has("saison/soupe.html")).toBe(true);

    const before = gh.commits("me/site").length;
    const del = await ok(["terms", "delete", "saison", "--move-to", "recettes", "--remove-archive", "--yes"]);
    expect(del.result).toMatchObject({ movedTo: { slug: "recettes" }, stillReferencedBy: [], archiveRemoved: true });
    expect(del.result.moved).toHaveLength(2);
    expect(del.result.republished.every((r: { ok: boolean }) => r.ok)).toBe(true);
    // Archive removal + republish + cascade + plugin targets: one commit.
    expect(gh.commits("me/site").length - before).toBe(1);
    expect(site().has("recettes/soupe.html")).toBe(true);
    expect(site().has("saison/soupe.html")).toBe(false);
    expect(site().has("saison/tarte.html")).toBe(false);
    expect(site().has("saison/index.html")).toBe(false);
    expect(terms().some((t) => t.slug === "saison")).toBe(false);
    for (const f of pluginFiles()) expect(site().get(f), f).not.toMatch(/\/saison\//);
    const posts = (await ok(["content", "list", "--category", "recettes"])).result;
    expect(posts.map((p: { slug: string }) => p.slug).sort()).toEqual(["octobre-au-marche", "soupe", "tarte"]);
    // The footer URL still points to the old path.
    expect(del.result.staleLinks).toEqual([expect.objectContaining({ where: "menu", owner: "footer", from: "saison/soupe.html", to: "recettes/soupe.html", suggested: "/recettes/soupe.html" })]);
    // No regeneration left to run.
    expect(del.result.next.join(" ")).not.toContain("regenerate");
  }, 120_000);

  it("plain delete suggests everything (and repair when posts lose their category)", async () => {
    await ok(["terms", "create", "--type", "category", "--name", "Vide"]);
    const empty = await ok(["terms", "delete", "vide", "--yes"]);
    expect(empty.result.next.join(" ")).toContain("regenerate everything");
    const del = await ok(["terms", "delete", "recettes", "--yes", "--detach"]);
    const next = del.result.next.join(" ");
    expect(next).toContain("regenerate repair");
    expect(next).toContain("regenerate everything");
  }, 60_000);
});

describe("content preview", () => {
  it("writes to the temp folder by default, not the current directory", async () => {
    const prev = await ok(["content", "preview", "soupe"]);
    expect(prev.result.file.startsWith(join(tmpdir(), "agentcms-preview"))).toBe(true);
    expect(prev.result.screenshotsDir).toBeNull();
    const help = await cli(["help", "content"]);
    expect(JSON.stringify(help.body)).toContain(".screenshots/ next to the --out file");
  }, 60_000);
});
