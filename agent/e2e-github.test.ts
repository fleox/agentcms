import { mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { installBrowserEnv } from "./browserEnv";
import { main } from "./cli";
import type { Io } from "./output";
import { createFakeGithub } from "./testing/fakeGithub";

// Markdown content on GitHub + GitHub Pages hosting, against an
// in-memory GitHub: install → doctor → deploy-admin → site add.

const TOKEN = "ghp_e2e_token";
const gh = createFakeGithub({ login: "me", token: TOKEN });

async function run(args: string[]) {
  const stdout: string[] = [];
  const io: Io = { json: true, out: (t) => stdout.push(t), err: () => {} };
  const code = await main([...args, "--json"], io);
  return { code, body: JSON.parse(stdout.at(-1) ?? "{}") as { ok: boolean; data?: any; error?: { code: string; message: string } } };
}

describe("install markdown-git + GitHub Pages (fake GitHub)", () => {
  const root = mkdtempSync(join(tmpdir(), "agentcms-gh-"));

  beforeAll(() => {
    installBrowserEnv();
    vi.stubGlobal("fetch", gh.fetch);
    process.env.AGENTCMS_HOME = join(root, "home");
    gh.createRepo("me/content", { private: true });
    gh.createRepo("me/site");
  });

  afterAll(() => {
    vi.unstubAllGlobals();
  });

  it("installs, publishes the admin in one commit and keeps the token out of every repo", async () => {
    process.env.E2E_GH_TOKEN = TOKEN;
    expect((await run(["credentials", "set", "github:me", "--from-env", "E2E_GH_TOKEN"])).code).toBe(0);
    const planFile = join(root, "plan.json");
    writeFileSync(
      planFile,
      JSON.stringify({
        alias: "blog",
        data: { backend: "markdown-git", git: { provider: "github", owner: "me", repo: "content" }, credential: "github:me" },
        hosting: { type: "github-pages", settings: { owner: "me", repo: "site", siteUrl: "https://me.github.io/site" } },
      }),
    );

    const dry = await run(["install", "--plan", planFile, "--dry-run"]);
    expect(dry.body).toMatchObject({ ok: true, data: { checks: { data: { ok: true, existing: false }, hosting: { ok: true } } } });
    expect(gh.repo("me/content").refs.size).toBe(0);

    const res = await run(["install", "--plan", planFile]);
    expect(res.body).toMatchObject({ ok: true, data: { installed: true, credentials: { data: "github:me", hosting: "github:me" } } });
    // GitHub Pages got switched on, and the notice says so.
    expect(gh.repo("me/site").pages).toBe(true);
    expect(res.body.data.notices.length).toBeGreaterThan(0);

    const content = gh.files("me/content");
    const storage = JSON.parse(content.get(".cms/config/storage.json")!);
    expect(storage).toMatchObject({ connectorId: "git-pages", settings: { owner: "me", repo: "site", siteUrl: "https://me.github.io/site" } });
    const site = gh.files("me/site");
    expect(site.has("admin/index.html")).toBe(true);
    expect(site.has("theme-assets/default.css")).toBe(true);
    expect(site.has(".nojekyll")).toBe(true);
    expect(site.get("admin/config.js")).toContain('"backend": "markdown-git"');
    // Bootstrap + one publish commit for the whole admin + theme assets.
    expect(gh.commits("me/site")).toHaveLength(2);
    for (const files of [content, site]) for (const text of files.values()) expect(text).not.toContain(TOKEN);
    expect(readFileSync(join(root, "home", "sites.json"), "utf8")).not.toContain(TOKEN);

    const doctor = await run(["doctor", "--site", "blog"]);
    const byId = Object.fromEntries((doctor.body.data.checks as { id: string; status: string }[]).map((c) => [c.id, c.status]));
    expect(byId).toMatchObject({ https: "ok", "theme-assets": "ok", admin: "ok", "admin-files": "ok", "config-js": "ok", "github-pages": "ok" });

    // Same version hosted → deploy-admin plans a no-op-sized update; --yes adds no commit when nothing changed.
    const before = gh.commits("me/site").length;
    expect((await run(["deploy-admin", "--site", "blog", "--yes"])).code).toBe(0);
    expect(gh.commits("me/site").length).toBe(before);

    // Another computer registers the same site from its admin URL.
    const added = await run(["site", "add", "blog-2", "--admin-url", "https://me.github.io/site/admin/", "--data-credential", "github:me"]);
    expect(added.body.data).toMatchObject({
      runtime: { backend: "markdown-git" },
      hosting: { connectorId: "git-pages", settings: { repo: "site" } },
      credentials: { data: "github:me", hosting: "github:me" },
      adminVersion: expect.any(String),
    });
  }, 60_000);

  it("refuses to take over content that already publishes elsewhere", async () => {
    const planFile = join(root, "plan2.json");
    writeFileSync(
      planFile,
      JSON.stringify({
        alias: "other",
        data: { backend: "markdown-git", git: { provider: "github", owner: "me", repo: "content" }, credential: "github:me" },
        hosting: { type: "github-pages", settings: { owner: "me", repo: "site", siteUrl: "https://elsewhere.example.com" } },
      }),
    );
    expect((await run(["install", "--plan", planFile, "--dry-run"])).body.error?.code).toBe("content-exists");
  });

  it("keeps an encrypted SQLite database on a dedicated, unpublished branch", async () => {
    gh.createRepo("me/notes");
    const planFile = join(root, "plan-sqlite.json");
    writeFileSync(
      planFile,
      JSON.stringify({
        alias: "notes",
        data: { backend: "sqlite-file", path: "data/site.sqlite" },
        hosting: { type: "github-pages", settings: { owner: "me", repo: "notes", siteUrl: "https://me.github.io/notes" }, credential: "github:me" },
      }),
    );
    const res = await run(["install", "--plan", planFile]);
    expect(res.body).toMatchObject({ ok: true, data: { installed: true, credentials: { passphrase: "passphrase:notes" } } });
    expect(res.body.data.checks.data.detail).toContain("branch agentcms-data");

    // The published branch was created first and stays the default one.
    expect(gh.repo("me/notes").defaultBranch).toBe("main");
    expect(gh.repo("me/notes").pages).toBe(true);
    const site = gh.files("me/notes", "main");
    expect(site.has("admin/index.html")).toBe(true);
    expect([...site.keys()].some((p) => p.endsWith(".sqlite"))).toBe(false);
    const data = gh.files("me/notes", "agentcms-data");
    expect(data.get("data/site.sqlite")?.startsWith("ACMSENC1")).toBe(true);
    expect(data.has(".nojekyll")).toBe(false);

    const configJs = site.get("admin/config.js")!;
    expect(configJs).toContain('"branch": "agentcms-data"');
    expect(configJs).toContain('"encrypted": true');
    expect(configJs).not.toContain(TOKEN);

    const doctor = await run(["doctor", "--site", "notes"]);
    const byId = Object.fromEntries((doctor.body.data.checks as { id: string; status: string }[]).map((c) => [c.id, c.status]));
    expect(byId).toMatchObject({ "database-exposure": "ok", "github-pages": "ok", admin: "ok", "config-js": "ok" });

    // Compaction: the data branch shrinks to one commit, the site branch is untouched.
    const siteCommits = gh.commits("me/notes", "main").length;
    expect(gh.commits("me/notes", "agentcms-data").length).toBeGreaterThan(1);
    const planned = await run(["compact-data", "--site", "notes"]);
    expect(planned.body.data).toMatchObject({ needsConfirmation: true, branch: "agentcms-data" });
    expect(planned.body.data.commits).toBeGreaterThan(1);
    const before = gh.files("me/notes", "agentcms-data").get("data/site.sqlite");
    expect((await run(["compact-data", "--site", "notes", "--yes"])).body.data.compacted).toBe(true);
    expect(gh.commits("me/notes", "agentcms-data")).toHaveLength(1);
    expect(gh.files("me/notes", "agentcms-data").get("data/site.sqlite")).toBe(before);
    expect(gh.commits("me/notes", "main")).toHaveLength(siteCommits);

    // The site's own branch can never be compacted.
    expect((await run(["compact-data", "--site", "blog"])).body.error?.code).toBe("not-applicable");
  }, 60_000);
});
