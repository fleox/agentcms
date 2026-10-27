import { mkdirSync, mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { main } from "./cli";
import { resolveRequestPath, startAdminServer } from "./commands/serve";
import { fetchLatestVersion, registryLatestUrl } from "./commands/version";
import type { Io } from "./output";
import { compareVersions } from "./semver";

function capture(json = true): Io & { stdout: string[]; stderr: string[] } {
  const stdout: string[] = [];
  const stderr: string[] = [];
  return { json, stdout, stderr, out: (t) => stdout.push(t), err: (t) => stderr.push(t) };
}

const dist = mkdtempSync(join(tmpdir(), "agentcms-dist-"));
mkdirSync(join(dist, "admin", "assets"), { recursive: true });
writeFileSync(join(dist, "admin", "index.html"), "<!doctype html><title>admin</title>");
writeFileSync(join(dist, "admin", "assets", "app.js"), "export {}");
writeFileSync(
  join(dist, "version.json"),
  JSON.stringify({
    name: "agentcms",
    version: "0.1.0",
    apiVersion: "1.4.0",
    apiMinVersion: "1.0.0",
    minSkillsVersion: "0.1.0",
    dataSchema: 1,
    repository: "github:fleox/agentcms",
  }),
);
process.env.AGENTCMS_DIST = dist;

describe("agentcms cli", () => {
  it("prints a machine-readable command list", async () => {
    const io = capture();
    expect(await main(["help", "--json"], io)).toBe(0);
    const body = JSON.parse(io.stdout[0]);
    expect(body.ok).toBe(true);
    expect(body.data.version).toBe("0.1.0");
    expect(body.data.commands.map((c: { name: string }) => c.name)).toEqual([
      "help",
      "version",
      "status",
      "options",
      "credentials",
      "site",
      "install",
      "deploy-admin",
      "doctor",
      "compact-data",
      "ext",
      "content",
      "regenerate",
      "terms",
      "menus",
      "settings",
      "plugins",
      "themes",
      "media",
      "users",
      "transfer",
      "stats",
      "files",
      "serve",
    ]);
  });

  it("reports versions", async () => {
    const io = capture();
    expect(await main(["version", "--json"], io)).toBe(0);
    expect(JSON.parse(io.stdout[0]).data).toMatchObject({ version: "0.1.0", apiVersion: "1.4.0", dataSchema: 1 });
  });

  it("returns a JSON error with exit code 2 for unknown commands and options", async () => {
    let io = capture();
    expect(await main(["nope", "--json"], io)).toBe(2);
    expect(JSON.parse(io.stdout[0])).toMatchObject({ ok: false, error: { code: "unknown-command" } });
    io = capture();
    expect(await main(["version", "--bogus", "--json"], io)).toBe(2);
    expect(JSON.parse(io.stdout[0]).error.code).toBe("usage");
  });

  it("prints plain text without --json", async () => {
    const io = capture(false);
    await main(["version"], io);
    expect(io.stdout[0]).toMatch(/^agentcms 0\.1\.0 \(admin API 1\.4\.0/);
  });
});

describe("fetchLatestVersion", () => {
  it("reads the npm registry, null on failure", async () => {
    const ok = (async () => new Response(JSON.stringify({ version: "0.2.0" }))) as unknown as typeof fetch;
    const down = (async () => {
      throw new TypeError("offline");
    }) as unknown as typeof fetch;
    const missing = (async () => new Response("{}", { status: 404 })) as unknown as typeof fetch;
    expect(await fetchLatestVersion(ok)).toBe("0.2.0");
    expect(await fetchLatestVersion(down)).toBeNull();
    expect(await fetchLatestVersion(missing)).toBeNull();
  });
});

describe("registryLatestUrl", () => {
  it("encodes scoped package names", () => {
    expect(registryLatestUrl("@agent-cms/agentcms")).toBe("https://registry.npmjs.org/@agent-cms%2fagentcms/latest");
    expect(registryLatestUrl("plain")).toBe("https://registry.npmjs.org/plain/latest");
  });
});

describe("compareVersions", () => {
  it("orders releases and prereleases", () => {
    expect(compareVersions("0.2.0", "0.1.9")).toBe(1);
    expect(compareVersions("1.0.0", "1.0.0")).toBe(0);
    expect(compareVersions("1.0.0-rc.1", "1.0.0")).toBe(-1);
    expect(compareVersions("v1.2.3", "1.10.0")).toBe(-1);
  });
});

describe("serve", () => {
  const root = join(dist, "admin");

  it("never resolves outside the admin folder", () => {
    expect(resolveRequestPath(root, "/")).toBe(join(root, "index.html"));
    expect(resolveRequestPath(root, "/assets/app.js")).toBe(join(root, "assets", "app.js"));
    expect(resolveRequestPath(root, "/../version.json")).toBe(join(root, "version.json"));
    expect(resolveRequestPath(root, "/..%2fversion.json")).toBeNull();
  });

  it("serves files with the right type and 404s the rest", async () => {
    const server = await startAdminServer(root, "127.0.0.1", 0);
    const { port } = server.address() as { port: number };
    try {
      const index = await fetch(`http://127.0.0.1:${port}/`);
      expect(index.status).toBe(200);
      expect(index.headers.get("content-type")).toContain("text/html");
      expect(index.headers.get("cache-control")).toBe("no-store");
      const js = await fetch(`http://127.0.0.1:${port}/assets/app.js`);
      expect(js.headers.get("content-type")).toContain("text/javascript");
      expect((await fetch(`http://127.0.0.1:${port}/missing.js`)).status).toBe(404);
      expect((await fetch(`http://127.0.0.1:${port}/..%2fversion.json`)).status).toBe(404);
    } finally {
      server.close();
    }
  });
});
