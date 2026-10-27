import { mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { installBrowserEnv } from "./browserEnv";
import { main } from "./cli";
import type { Io } from "./output";
import { createFakeGithub } from "./testing/fakeGithub";

// On a git hosting every `plugins` / `themes` write is ONE commit made
// before the command returns (nothing left in the admin's deferred
// implicit batch, which the CLI would lose on exit).

const TOKEN = "ghp_pt_token";
const gh = createFakeGithub({ login: "me", token: TOKEN });
const root = mkdtempSync(join(tmpdir(), "agentcms-ptgh-"));

async function run(args: string[]) {
  const stdout: string[] = [];
  const io: Io = { json: true, out: (t) => stdout.push(t), err: () => {} };
  const code = await main([...args, "--json"], io);
  return { code, body: JSON.parse(stdout.at(-1) ?? "{}") as { ok: boolean; data?: any; error?: { code: string } } };
}

beforeAll(async () => {
  vi.stubEnv("DEV", false);
  installBrowserEnv();
  vi.stubGlobal("fetch", gh.fetch);
  process.env.AGENTCMS_HOME = join(root, "home");
  process.env.PTGH_TOKEN = TOKEN;
  gh.createRepo("me/content", { private: true });
  gh.createRepo("me/site");
  expect((await run(["credentials", "set", "github:me", "--from-env", "PTGH_TOKEN"])).code).toBe(0);
  const plan = join(root, "plan.json");
  writeFileSync(
    plan,
    JSON.stringify({
      alias: "gh",
      data: { backend: "markdown-git", git: { provider: "github", owner: "me", repo: "content" }, credential: "github:me" },
      hosting: { type: "github-pages", settings: { owner: "me", repo: "site", siteUrl: "https://me.github.io/site" } },
    }),
  );
  expect((await run(["install", "--plan", plan])).code).toBe(0);
}, 120_000);

afterAll(() => {
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
});

it("commits each action once, before returning", async () => {
  const commits = () => gh.commits("me/site").length;
  let before = commits();
  expect((await run(["plugins", "action", "agentcms-sitemaps", "stylesheets", "--site", "gh"])).body.ok).toBe(true);
  expect(commits()).toBe(before + 1);
  expect(gh.files("me/site").has("sitemaps/sitemap.xsl")).toBe(true);

  before = commits();
  expect((await run(["themes", "config", "default", "--merge", '{"style":{"vars":{"--color-bg":"#abcdef"}}}', "--site", "gh"])).body.ok).toBe(true);
  expect(commits()).toBe(before + 1);
  expect(gh.files("me/site").get("theme-assets/default.css")).toContain("#abcdef");
  // The setting itself is one commit in the content repo.
  expect(gh.files("me/content").get("settings/site.json")).toContain("#abcdef");
}, 120_000);
