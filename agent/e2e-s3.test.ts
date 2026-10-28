import { mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { installBrowserEnv } from "./browserEnv";
import { main } from "./cli";
import { getCredential } from "./credentials";
import type { Io } from "./output";
import { createFakeS3 } from "./testing/fakeS3";

// SQLite data on S3-compatible buckets, against an in-memory S3 that also
// serves public buckets as websites: encrypted database on the public
// site, plain database (flagged by doctor), and a database kept in a
// separate private bucket. install → doctor → deploy-admin → site add.

const s3 = createFakeS3({ accessKeyId: "AKID" });

async function run(args: string[]) {
  const stdout: string[] = [];
  const io: Io = { json: true, out: (t) => stdout.push(t), err: () => {} };
  const code = await main([...args, "--json"], io);
  return { code, body: JSON.parse(stdout.at(-1) ?? "{}") as { ok: boolean; data?: any; error?: { code: string; message: string } } };
}

const root = mkdtempSync(join(tmpdir(), "agentcms-s3-"));
function plan(name: string, body: unknown): string {
  const file = join(root, `${name}.json`);
  writeFileSync(file, JSON.stringify(body));
  return file;
}
const hosting = (bucket: string) => ({
  type: "s3",
  settings: { endpoint: s3.endpoint, region: "fake-1", bucket, publicRead: true, siteUrl: s3.websiteUrl(bucket) },
  credential: "s3:main",
});
const checks = (body: { data?: any }) =>
  Object.fromEntries((body.data.checks as { id: string; status: string }[]).map((c) => [c.id, c.status]));

beforeAll(async () => {
  installBrowserEnv();
  vi.stubGlobal("fetch", s3.fetch);
  process.env.AGENTCMS_HOME = join(root, "home");
  process.env.E2E_AK = "AKID";
  process.env.E2E_SK = "SECRET-KEY";
  expect((await run(["credentials", "set", "s3:main", "--from-env", "E2E_AK,E2E_SK"])).code).toBe(0);
});

afterAll(() => {
  vi.unstubAllGlobals();
});

describe("SQLite on S3 (fake S3)", () => {
  it("encrypts the database by default and keeps every secret off the bucket", async () => {
    s3.createBucket("shop", { public: true });
    const file = plan("shop", { alias: "shop", data: { backend: "sqlite-file", path: "data/site.sqlite" }, hosting: hosting("shop") });

    const dry = await run(["install", "--plan", file, "--dry-run"]);
    expect(dry.body.data.checks.data.detail).toContain("new encrypted database");
    expect(getCredential("passphrase:shop")).toBeNull();

    const res = await run(["install", "--plan", file]);
    expect(res.body).toMatchObject({ ok: true, data: { installed: true, credentials: { hosting: "s3:main", passphrase: "passphrase:shop" } } });
    const passphrase = getCredential("passphrase:shop")!.values.passphrase;
    expect(passphrase).toMatch(/^[a-z2-9-]{35}$/);
    expect(res.body.data.nextSteps.join(" ")).toContain("credentials copy passphrase:shop");

    const db = s3.object("shop", "data/site.sqlite")!;
    expect(new TextDecoder().decode(db.body.slice(0, 8))).toBe("ACMSENC1");
    const configJs = new TextDecoder().decode(s3.object("shop", "admin/config.js")!.body);
    expect(configJs).toContain('"encrypted": true');
    for (const key of s3.keys("shop")) {
      const text = Buffer.from(s3.object("shop", key)!.body).toString("latin1");
      expect(text).not.toContain("SECRET-KEY");
      expect(text).not.toContain(passphrase);
    }

    const doctor = await run(["doctor", "--site", "shop"]);
    expect(checks(doctor.body)).toMatchObject({
      "database-exposure": "ok",
      admin: "ok",
      "admin-files": "ok",
      "config-js": "ok",
      "theme-assets": "ok",
      "credential-hosting": "ok",
      "credential-passphrase": "ok",
    });

    // Older hosted admin → status proposes an update; deploy-admin plans, then applies.
    const manifest = s3.object("shop", "admin/admin-files.json")!;
    manifest.body = new TextEncoder().encode(new TextDecoder().decode(manifest.body).replace(/"version": "[^"]+"/, '"version": "0.0.1"'));
    expect((await run(["status", "--site", "shop"])).body.data.sites[0].state).toBe("update");
    expect((await run(["deploy-admin", "--site", "shop"])).body.data.needsConfirmation).toBe(true);
    expect((await run(["deploy-admin", "--site", "shop", "--yes"])).code).toBe(0);
    expect((await run(["status", "--site", "shop"])).body.data.sites[0].state).toBe("current");

    // The same database can't be taken over without its passphrase.
    const other = plan("other", {
      alias: "other",
      data: { backend: "sqlite-file", path: "data/site.sqlite" },
      hosting: hosting("shop"),
    });
    expect((await run(["install", "--plan", other, "--dry-run"])).body.error?.code).toBe("check-failed");

    // Registering it from another computer: the passphrase errors say
    // what to do, credentials can be attached later, doctor --deep proves them.
    const admin = `${s3.websiteUrl("shop")}/admin/`;
    expect((await run(["site", "add", "shop2", "--admin-url", admin, "--hosting-credential", "s3:main"])).body.error?.code).toBe("passphrase-required");
    process.env.E2E_WRONG_PASS = "not-the-passphrase";
    expect((await run(["credentials", "set", "passphrase:wrong", "--from-env", "E2E_WRONG_PASS"])).code).toBe(0);
    expect((await run(["site", "add", "shop2", "--admin-url", admin, "--hosting-credential", "s3:main", "--passphrase-credential", "passphrase:wrong"])).body.error?.code).toBe("passphrase-wrong");
    const added = await run(["site", "add", "shop2", "--admin-url", admin, "--hosting-credential", "s3:main", "--passphrase-credential", "passphrase:shop"]);
    expect(added.body.data).toMatchObject({ siteUrl: s3.websiteUrl("shop"), warnings: [] });
    const wrong = await run(["site", "credentials", "shop2", "--passphrase-credential", "passphrase:wrong"]);
    expect(wrong.body.data.credentials.passphrase).toBe("passphrase:wrong");
    expect(checks((await run(["doctor", "--site", "shop2", "--deep"])).body)["data-access"]).toBe("fail");
    expect((await run(["content", "list", "--site", "shop2"])).body.error?.code).toBe("passphrase-wrong");
    await run(["site", "credentials", "shop2", "--passphrase-credential", "passphrase:shop"]);
    expect(checks((await run(["doctor", "--site", "shop2", "--deep"])).body)["data-access"]).toBe("ok");
    const none = await run(["site", "credentials", "shop2", "--passphrase-credential", ""]);
    expect(none.body.data.warnings.join(" ")).toContain("encrypted");
    await run(["site", "forget", "shop2"]);
  }, 60_000);

  it("flags a plain database served by the public site", async () => {
    s3.createBucket("plain", { public: true });
    const file = plan("plain", {
      alias: "plain",
      data: { backend: "sqlite-file", path: "data/site.sqlite", encryption: false },
      hosting: hosting("plain"),
    });
    const res = await run(["install", "--plan", file]);
    expect(res.body.data.nextSteps.join(" ")).toContain("NOT encrypted");
    const doctor = await run(["doctor", "--site", "plain"]);
    expect(checks(doctor.body)["database-exposure"]).toBe("fail");
    expect(doctor.code).toBe(1);
  }, 60_000);

  it("keeps the database in a separate private bucket", async () => {
    s3.createBucket("vault");
    s3.createBucket("blog", { public: true });
    const file = plan("blog", {
      alias: "blog",
      data: {
        backend: "sqlite-file",
        path: "blog.sqlite",
        encryption: false,
        location: { type: "s3", settings: { endpoint: s3.endpoint, region: "fake-1", bucket: "vault" }, credential: "s3:main" },
      },
      hosting: hosting("blog"),
    });
    const res = await run(["install", "--plan", file]);
    expect(res.body).toMatchObject({ ok: true, data: { credentials: { data: "s3:main", hosting: "s3:main" } } });
    expect(s3.keys("vault")).toEqual(["blog.sqlite"]);
    expect(s3.keys("blog")).not.toContain("blog.sqlite");
    const configJs = new TextDecoder().decode(s3.object("blog", "admin/config.js")!.body);
    expect(configJs).toContain('"bucket": "vault"');
    expect(checks((await run(["doctor", "--site", "blog"])).body)["database-exposure"]).toBe("ok");

    // Another computer: the publish target is read from the database.
    const added = await run(["site", "add", "blog-2", "--admin-url", `${s3.websiteUrl("blog")}/admin/`, "--data-credential", "s3:main", "--hosting-credential", "s3:main"]);
    expect(added.body.data).toMatchObject({ hosting: { connectorId: "s3", settings: { bucket: "blog" } }, credentials: { data: "s3:main" } });
  }, 60_000);
});
