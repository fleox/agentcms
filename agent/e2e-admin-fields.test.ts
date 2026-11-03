import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { installBrowserEnv } from "./browserEnv";
import { cli, siteCli, writePlan } from "./testing/adminCli";
import { createFakeGithub } from "./testing/fakeGithub";

// Custom fields (Post.fields) from the CLI on a Markdown-in-git site
// (content repo + GitHub Pages hosting, in-memory GitHub): stored in the
// front matter, merged by --field, typed by --data, published in
// data/posts.json.

const TOKEN = "ghp_admin_token";
const gh = createFakeGithub({ login: "me", token: TOKEN });
const root = mkdtempSync(join(tmpdir(), "agentcms-fields-gh-"));
const { run, ok } = siteCli("blog");

const site = () => gh.files("me/site");
const content = () => gh.files("me/content");

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

describe("custom fields on markdown-git + GitHub Pages", () => {
  it("sets, merges and removes custom fields", async () => {
    // A draft: each update only writes the content repo.
    await ok(["content", "create", "--title", "Fields", "--slug", "fields-demo", "--category", "news", "--create-terms", "--field", "featured=true"]);
    await ok(["content", "update", "fields-demo", "--field", "header-photo=true", "--field", "label=New: today", "--field", "price=4.5"]);
    expect(content().get("posts/fields-demo.md")).toContain('fields: {"featured":true,"header-photo":true,"label":"New: today","price":4.5}');
    // --field only changes the keys it names; "key=" removes one; --data types exactly.
    await ok(["content", "update", "fields-demo", "--field", "label=", "--field", "featured=", "--data", JSON.stringify({ fields: { code: "007", tags: ["a", "b"] } })]);
    expect((await ok(["content", "get", "fields-demo"])).result.fields).toEqual({ "header-photo": true, price: 4.5, code: "007", tags: ["a", "b"] });
    expect((await run(["content", "update", "fields-demo", "--field", "Header Photo=1"])).body.error?.code).toBe("usage");
    expect((await run(["content", "update", "fields-demo", "--lang", "fr", "--title", "Deux", "--field", "a=1"])).body.error?.message).toMatch(/not to one translation/);
    // Published: the fields reach data/posts.json.
    await ok(["content", "publish", "fields-demo"]);
    const posts = JSON.parse(site().get("data/posts.json")!).posts as Array<{ url: string; fields?: unknown }>;
    expect(posts.find((p) => p.url === "news/fields-demo.html")?.fields).toEqual({ "header-photo": true, price: 4.5, code: "007", tags: ["a", "b"] });
    await ok(["content", "delete", "fields-demo", "--yes"]);
  }, 60_000);
});
