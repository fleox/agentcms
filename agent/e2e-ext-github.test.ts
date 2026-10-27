import { mkdirSync, mkdtempSync, readFileSync, realpathSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { installBrowserEnv } from "./browserEnv";
import { createFakeGithub } from "./testing/fakeGithub";
import { buildProject, cleanup, cli, edit, scaffold } from "./testing/extProject";

// `ext install | list | uninstall | preview --site` against a Markdown-
// in-git site on an in-memory GitHub + Pages: files under
// admin/<plugins|themes>/<id>/ in one commit, registry entry in the
// content repo (.cms/config/externalRegistry.json), upgrades, theme
// activation, uninstall rules.

const TOKEN = "ghp_ext_token";
const gh = createFakeGithub({ login: "me", token: TOKEN });
const root = realpathSync(mkdtempSync(join(tmpdir(), "agentcms-ext-gh-")));
let theme: string;
let plugin: string;

const registry = () => JSON.parse(gh.files("me/content").get(".cms/config/externalRegistry.json") ?? "null");
const siteFiles = () => [...gh.files("me/site").keys()];

beforeAll(async () => {
  installBrowserEnv();
  vi.stubGlobal("fetch", gh.fetch);
  process.env.AGENTCMS_HOME = join(root, "home");
  process.env.E2E_GH_TOKEN = TOKEN;
  gh.createRepo("me/content", { private: true });
  gh.createRepo("me/site");

  theme = await scaffold(root, "theme", "acme-blog", ["settings", "block"]);
  plugin = await scaffold(root, "plugin", "acme-tools", []);
  // v1 ships an extra file that v2 drops: an upgrade must remove it.
  mkdirSync(join(plugin, "assets"));
  writeFileSync(join(plugin, "assets", "old.txt"), "v1 only\n");
  await Promise.all([buildProject(theme), buildProject(plugin)]);

  expect((await cli(["credentials", "set", "github:me", "--from-env", "E2E_GH_TOKEN"])).code).toBe(0);
  const planFile = join(root, "plan.json");
  writeFileSync(
    planFile,
    JSON.stringify({
      alias: "blog",
      data: { backend: "markdown-git", git: { provider: "github", owner: "me", repo: "content" }, credential: "github:me" },
      hosting: { type: "github-pages", settings: { owner: "me", repo: "site", siteUrl: "https://me.github.io/site" } },
    }),
  );
  const res = await cli(["install", "--plan", planFile]);
  expect(res.body).toMatchObject({ ok: true, data: { installed: true } });
}, 120_000);

afterAll(() => {
  vi.unstubAllGlobals();
  cleanup(root);
});

describe("ext install / list / uninstall on markdown-git + GitHub Pages", () => {
  it("plans without --yes, installs with --yes, lists, upgrades", async () => {
    const zip = (await cli(["ext", "pack", plugin])).body.data.zip as string;
    const commits = gh.commits("me/site").length;

    const plan = await cli(["ext", "install", zip, "--site", "blog"]);
    expect(plan.body.data).toMatchObject({
      needsConfirmation: true,
      plan: { action: "install", kind: "plugin", id: "acme-tools", to: "1.0.0", folder: "admin/plugins/acme-tools/" },
    });
    expect(plan.body.data.plan.files).toEqual(expect.arrayContaining(["manifest.json", "bundle.js", "assets/old.txt"]));
    expect(gh.commits("me/site")).toHaveLength(commits);
    expect(registry()).toBeNull();

    const done = await cli(["ext", "install", zip, "--site", "blog", "--yes"]);
    expect(done.body).toMatchObject({ ok: true, data: { installed: true, action: "install" } });
    expect(siteFiles()).toEqual(expect.arrayContaining(["admin/plugins/acme-tools/bundle.js", "admin/plugins/acme-tools/manifest.json", "admin/plugins/acme-tools/assets/old.txt"]));
    expect(gh.commits("me/site")).toHaveLength(commits + 1);
    expect(registry().plugins).toContainEqual({ id: "acme-tools", version: "1.0.0", apiVersion: expect.any(String), entryPath: "plugins/acme-tools/bundle.js" });
    // The registry was seeded from the hosted admin's defaults.
    expect(registry().plugins.length).toBeGreaterThan(1);
    expect(registry().themes.length).toBeGreaterThan(0);
    for (const text of gh.files("me/content").values()) expect(text).not.toContain(TOKEN);

    const listed = await cli(["ext", "list", "--site", "blog"]);
    expect(listed.body.data.plugins).toContainEqual(expect.objectContaining({ id: "acme-tools", version: "1.0.0" }));
    expect(listed.body.data.activeTheme).toBe("default");

    // v1.1.0 without assets/old.txt.
    for (const f of ["manifest.json", "src/manifest.tsx"]) edit(plugin, f, /"?version"?: "1\.0\.0"/, f.endsWith(".json") ? '"version": "1.1.0"' : 'version: "1.1.0"');
    cleanup(join(plugin, "assets"));
    await buildProject(plugin);
    const upgrade = await cli(["ext", "install", plugin, "--site", "blog", "--yes"]);
    expect(upgrade.body.data).toMatchObject({ installed: true, action: "upgrade", from: "1.0.0", to: "1.1.0" });
    expect(siteFiles()).toContain("admin/plugins/acme-tools/bundle.js");
    expect(siteFiles()).not.toContain("admin/plugins/acme-tools/assets/old.txt");
    expect(registry().plugins.filter((e: { id: string }) => e.id === "acme-tools")).toEqual([expect.objectContaining({ version: "1.1.0" })]);
  }, 120_000);

  it("installs + activates a theme, refuses to uninstall it while active", async () => {
    const res = await cli(["ext", "install", theme, "--site", "blog", "--activate", "--yes"]);
    expect(res.body.data).toMatchObject({ installed: true, kind: "theme", activated: expect.stringContaining("acme-blog") });
    const files = gh.files("me/site");
    expect(files.has("admin/themes/acme-blog/bundle.js")).toBe(true);
    expect(files.get("theme-assets/acme-blog.css")).toContain(".acme-blog");
    expect(files.has("theme-assets/acme-blog-menu.js")).toBe(true);
    expect(JSON.parse(gh.files("me/content").get("settings/site.json")!).activeThemeId).toBe("acme-blog");
    expect(registry().themes).toContainEqual(expect.objectContaining({ id: "acme-blog", entryPath: "themes/acme-blog/bundle.js" }));

    const listed = await cli(["ext", "list", "--site", "blog"]);
    expect(listed.body.data.activeTheme).toBe("acme-blog");
    expect(listed.body.data.themes).toContainEqual(expect.objectContaining({ id: "acme-blog", active: true }));

    expect((await cli(["ext", "uninstall", "acme-blog", "--site", "blog", "--yes"])).body.error?.code).toBe("theme-active");
    expect((await cli(["ext", "uninstall", "nope", "--site", "blog", "--yes"])).body.error?.code).toBe("not-installed");
  }, 120_000);

  it("uninstalls an inactive extension: plan first, then registry + files", async () => {
    const plan = await cli(["ext", "uninstall", "acme-tools", "--site", "blog"]);
    expect(plan.body.data).toMatchObject({ needsConfirmation: true, plan: { kind: "plugin", id: "acme-tools" } });
    expect(siteFiles()).toContain("admin/plugins/acme-tools/bundle.js");

    const res = await cli(["ext", "uninstall", "acme-tools", "--site", "blog", "--yes"]);
    expect(res.body.data).toMatchObject({ uninstalled: true });
    expect(siteFiles().some((p) => p.startsWith("admin/plugins/acme-tools/"))).toBe(false);
    expect(registry().plugins.some((e: { id: string }) => e.id === "acme-tools")).toBe(false);
    expect((await cli(["ext", "list", "--site", "blog"])).body.data.plugins.some((e: { id: string }) => e.id === "acme-tools")).toBe(false);
  }, 60_000);

  it("refuses a package that fails ext check", async () => {
    const broken = join(root, "broken");
    mkdirSync(broken);
    writeFileSync(join(broken, "manifest.json"), JSON.stringify({ id: "broken", name: "Broken", version: "1.0.0", apiVersion: "1.0.0" }));
    writeFileSync(join(broken, "bundle.js"), 'import x from "left-pad"; export default x;');
    const res = await cli(["ext", "install", broken, "--site", "blog", "--yes"]);
    expect(res.code).toBe(1);
    expect(res.body.data).toMatchObject({ installed: false, reason: "check-failed" });
    expect(siteFiles().some((p) => p.includes("/broken/"))).toBe(false);
  }, 60_000);

  it("ext preview --site renders the site's real content", async () => {
    const { resolveSite } = await import("./sites");
    const { openSiteStore } = await import("./ops/siteData");
    const store = await openSiteStore(resolveSite("blog"));
    const now = Date.UTC(2026, 5, 1);
    await store.write(
      [{ op: "set", collection: "posts", doc: { id: "p-hello", type: "post", title: "Hello from the real site", slug: "hello-real", contentMarkdown: "Real **content**.", status: "online", termIds: [], authorId: "", createdAt: now, updatedAt: now, publishedAt: now } }],
      { message: "test post" },
    );
    const out = join(root, "preview-site");
    const res = await cli(["ext", "preview", theme, "--site", "blog", "--out", out]);
    expect(res.body).toMatchObject({ ok: true, data: { site: "blog", themeId: "acme-blog" } });
    expect(res.body.data.files).toContain("hello-real.html");
    expect(readFileSync(join(out, "hello-real.html"), "utf8")).toContain("Hello from the real site");
    expect(readFileSync(join(out, "index.html"), "utf8")).toContain("Hello from the real site");
    // Read-only: nothing written back to the content repo or the site.
    expect(gh.files("me/site").has("hello-real.html")).toBe(false);
  }, 60_000);
});
