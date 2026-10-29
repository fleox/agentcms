import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { setCredential } from "../credentials";
import { resolvePlan, type InstallPlan } from "./plan";

process.env.AGENTCMS_HOME = mkdtempSync(join(tmpdir(), "agentcms-plan-"));
setCredential("github:me", { token: "ghp_content" });
setCredential("s3:ovh", { accessKeyId: "AKID", secretAccessKey: "SECRET" });
setCredential("firebase:proj", { email: "boss@example.com", password: "pw" });

const gitPlan = (over: Partial<InstallPlan> = {}): InstallPlan => ({
  alias: "blog",
  data: { backend: "markdown-git", git: { provider: "github", owner: "me", repo: "content" }, credential: "github:me" },
  hosting: { type: "github-pages", settings: { owner: "me", repo: "site", siteUrl: "https://me.github.io/site/" } },
  ...over,
});

describe("resolvePlan", () => {
  const firebasePlan = (signInMethods?: unknown): InstallPlan => ({
    alias: "fb",
    data: {
      backend: "firebase",
      firebase: { apiKey: "k", authDomain: "p.firebaseapp.com", projectId: "p", appId: "a" },
      credential: "firebase:proj",
      ...(signInMethods !== undefined ? { signInMethods: signInMethods as string[] } : {}),
    },
    hosting: { type: "github-pages", settings: { owner: "me", repo: "site", siteUrl: "https://me.github.io/site" }, credential: "github:me" },
  });

  it("firebase: sign-in methods go to config.js, password always included", async () => {
    expect(resolvePlan(firebasePlan()).runtime).not.toHaveProperty("signInMethods");
    expect(resolvePlan(firebasePlan(["google"])).runtime).toMatchObject({ signInMethods: ["password", "google"] });
    expect(() => resolvePlan(firebasePlan(["sms"]))).toThrow(/signInMethods/);
    const { buildConfigJsSource } = await import("../../src/lib/runtimeConfig");
    expect(buildConfigJsSource(resolvePlan(firebasePlan(["emailLink", "google"])).runtime)).toContain('"signInMethods"');
    expect(buildConfigJsSource(resolvePlan(firebasePlan(["password"])).runtime)).not.toContain("signInMethods");
  });

  it("markdown-git + GitHub Pages reuses the content token, keeps it out of config.js", () => {
    const r = resolvePlan(gitPlan());
    expect(r.runtime).toEqual({
      backend: "markdown-git",
      git: { provider: "github", owner: "me", repo: "content", project: undefined, branch: "main", contentDir: "", apiBaseUrl: undefined },
    });
    expect(r.gitToken).toBe("ghp_content");
    expect(r.credentials).toEqual({ data: "github:me", hosting: "github:me" });
    expect(r.target.settings).toMatchObject({ host: "github-pages", provider: "github", branch: "main", token: "ghp_content", siteUrl: "https://me.github.io/site" });
    expect(JSON.stringify(r.publicTarget)).not.toContain("ghp_content");
    expect(JSON.stringify(r.runtime)).not.toContain("ghp_content");
    expect(r.adminFolder).toBe("admin");
  });

  it("sqlite-file on S3: secrets split from config.js", () => {
    const r = resolvePlan({
      alias: "shop",
      data: { backend: "sqlite-file", path: "/data/site.sqlite" },
      hosting: { type: "s3", settings: { region: "eu-west-par", bucket: "b", siteUrl: "https://b.example.com", publicRead: true }, credential: "s3:ovh" },
      admin: false,
    });
    expect(r.runtime).toMatchObject({ backend: "sqlite-file", sqlite: { connectorId: "s3", path: "data/site.sqlite" } });
    expect(JSON.stringify(r.runtime)).not.toContain("SECRET");
    expect(r.sqliteSecrets).toEqual({ secretAccessKey: "SECRET" });
    expect(r.publicTarget.settings).not.toHaveProperty("accessKeyId");
    expect(r.adminFolder).toBeNull();
  });

  it("rejects secrets, wizard-only choices and bad values", () => {
    expect(() => resolvePlan(gitPlan({ hosting: { type: "github-pages", settings: { owner: "me", repo: "s", siteUrl: "https://x", token: "t" } } }))).toThrow(
      /must not be in the plan/,
    );
    expect(() => resolvePlan(gitPlan({ hosting: { type: "zip" } }))).toThrow(/can't be set up from the CLI/);
    expect(() => resolvePlan({ ...gitPlan(), data: { backend: "sqlite-file", path: "site.txt" } } as InstallPlan)).toThrow(/\.sqlite or \.db/);
    expect(() => resolvePlan(gitPlan({ hosting: { type: "s3", settings: { region: "r", bucket: "b", siteUrl: "https://b" }, credential: "github:me" } }))).toThrow(
      /must be a s3 account/,
    );
    expect(() => resolvePlan(gitPlan({ hosting: { type: "github-pages", settings: { owner: "me", repo: "s", siteUrl: "ftp://x" } } }))).toThrow(/http\(s\) URL/);
    expect(() => resolvePlan(gitPlan({ alias: "Bad Alias" }))).toThrow(/Invalid site alias/);
    expect(() =>
      resolvePlan(gitPlan({ data: { backend: "markdown-git", git: { provider: "github", owner: "me", repo: "c" }, credential: "github:nobody" } })),
    ).toThrow(/No stored credential/);
  });
});
