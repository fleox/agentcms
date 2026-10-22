import { spawn, spawnSync, type ChildProcess } from "node:child_process";
import { copyFileSync, existsSync, mkdirSync, mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { createServer } from "node:net";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { installBrowserEnv } from "./browserEnv";
import { main } from "./cli";
import type { Io } from "./output";

// End to end on a real server: the PHP bridge under `php -S`, SQLite
// data on that same hosting — install, doctor, deploy-admin, status.
// Uses the committed dist/ (admin build). Skipped when php is missing.

const hasPhp = spawnSync("php", ["-v"]).status === 0;
const repo = join(__dirname, "..");

function capture(): Io & { stdout: string[] } {
  const stdout: string[] = [];
  return { json: true, stdout, out: (t) => stdout.push(t), err: () => {} };
}

async function run(args: string[]): Promise<{ code: number; body: { ok: boolean; data?: Record<string, unknown>; error?: { code: string; message: string } } }> {
  const io = capture();
  const code = await main([...args, "--json"], io);
  return { code, body: JSON.parse(io.stdout.at(-1) ?? "{}") };
}

function freePort(): Promise<number> {
  return new Promise((resolve) => {
    const srv = createServer().listen(0, "127.0.0.1", () => {
      const { port } = srv.address() as { port: number };
      srv.close(() => resolve(port));
    });
  });
}

describe.skipIf(!hasPhp)("install on a PHP-bridge host (e2e)", () => {
  const root = mkdtempSync(join(tmpdir(), "agentcms-e2e-"));
  const www = join(root, "www");
  let php: ChildProcess;
  let base = "";

  beforeAll(async () => {
    installBrowserEnv();
    process.env.AGENTCMS_HOME = join(root, "home");
    mkdirSync(join(www, "cms-bridge"), { recursive: true });
    copyFileSync(join(repo, "external/bridges/php/flexweg-bridge.php"), join(www, "cms-bridge/flexweg-bridge.php"));
    writeFileSync(join(www, "cms-bridge/flexweg-bridge.config.php"), "<?php\nreturn ['API_KEY' => 'e2e-bridge-key-0123456789abcdef0123'];\n");
    const port = await freePort();
    base = `http://127.0.0.1:${port}`;
    php = spawn("php", ["-S", `127.0.0.1:${port}`, "-t", www], { stdio: "ignore" });
    for (let i = 0; i < 50; i++) {
      if (await fetch(`${base}/cms-bridge/flexweg-bridge.php`).then(() => true, () => false)) break;
      await new Promise((r) => setTimeout(r, 100));
    }
  });

  afterAll(() => {
    php?.kill();
  });

  it("installs, checks and updates a site", async () => {
    process.env.E2E_BRIDGE_KEY = "e2e-bridge-key-0123456789abcdef0123";
    expect((await run(["credentials", "set", "php-bridge:e2e", "--from-env", "E2E_BRIDGE_KEY"])).code).toBe(0);

    const planFile = join(root, "plan.json");
    writeFileSync(
      planFile,
      JSON.stringify({
        alias: "e2e",
        data: { backend: "sqlite-file", path: "data/site.sqlite" },
        hosting: { type: "own-server", settings: { apiBaseUrl: `${base}/cms-bridge/flexweg-bridge.php`, siteUrl: base }, credential: "php-bridge:e2e" },
      }),
    );

    const dry = await run(["install", "--plan", planFile, "--dry-run"]);
    expect(dry.body.ok).toBe(true);
    expect(existsSync(join(www, "data/site.sqlite"))).toBe(false);

    const installed = await run(["install", "--plan", planFile]);
    expect(installed.body).toMatchObject({ ok: true, data: { installed: true, adminUrl: `${base}/admin/` } });
    expect(existsSync(join(www, "data/site.sqlite"))).toBe(true);
    expect(existsSync(join(www, "theme-assets/default.css"))).toBe(true);
    const configJs = readFileSync(join(www, "admin/config.js"), "utf8");
    expect(configJs).toContain('"backend": "sqlite-file"');
    expect(configJs).not.toContain("e2e-bridge-key");

    const again = await run(["install", "--plan", planFile]);
    expect(again.body.error?.code).toBe("site-exists");

    const doctor = await run(["doctor", "--site", "e2e"]);
    expect(doctor.body.data?.healthy).toBe(true);

    // An older hosted admin → status proposes deploy-admin, which only plans without --yes.
    const manifestPath = join(www, "admin/admin-files.json");
    writeFileSync(manifestPath, readFileSync(manifestPath, "utf8").replace(/"version": "[^"]+"/, '"version": "0.0.1"'));
    const status = await run(["status"]);
    expect((status.body.data?.sites as { state: string }[])[0].state).toBe("update");
    const planned = await run(["deploy-admin", "--site", "e2e"]);
    expect(planned.body.data?.needsConfirmation).toBe(true);
    expect(readFileSync(manifestPath, "utf8")).toContain("0.0.1");
    const deployed = await run(["deploy-admin", "--site", "e2e", "--yes"]);
    expect(deployed.code).toBe(0);
    expect(readFileSync(manifestPath, "utf8")).not.toContain("0.0.1");
    expect(((await run(["status"])).body.data?.sites as { state: string }[])[0].state).toBe("current");

    // Registering the same site from its URL gives the same backend + hosting.
    const added = await run(["site", "add", "e2e-copy", "--admin-url", `${base}/admin/`, "--hosting-credential", "php-bridge:e2e"]);
    expect(added.body.data).toMatchObject({ siteUrl: base, adminFolder: "admin", hosting: { connectorId: "php-bridge" } });
  }, 120_000);
});
