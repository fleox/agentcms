import { mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { installBrowserEnv } from "./browserEnv";
import { main } from "./cli";
import { decodeImage, encodeImage, installNodeImageSupport } from "./ops/imageNode";
import type { Io } from "./output";
import { createFakeS3 } from "./testing/fakeS3";

// media / users / transfer / stats on an encrypted SQLite site on an
// in-memory S3 (a "files" connector: no commits, writes land at once).

const s3 = createFakeS3({ accessKeyId: "AKID" });
const root = mkdtempSync(join(tmpdir(), "agentcms-admin-data-s3-"));

async function run(args: string[]) {
  const stdout: string[] = [];
  const io: Io = { json: true, out: (t) => stdout.push(t), err: () => {} };
  const code = await main([...args, "--json"], io);
  return { code, body: JSON.parse(stdout.at(-1) ?? "{}") as { ok: boolean; data?: any; error?: { code: string; message: string } } };
}

beforeAll(async () => {
  installBrowserEnv();
  installNodeImageSupport();
  vi.stubGlobal("fetch", s3.fetch);
  process.env.AGENTCMS_HOME = join(root, "home");
  process.env.E2E_AD_AK = "AKID";
  process.env.E2E_AD_SK = "SECRET-KEY";
  expect((await run(["credentials", "set", "s3:main", "--from-env", "E2E_AD_AK,E2E_AD_SK"])).code).toBe(0);
  s3.createBucket("shop", { public: true });
  const planFile = join(root, "shop.json");
  writeFileSync(
    planFile,
    JSON.stringify({
      alias: "shop",
      data: { backend: "sqlite-file", path: "data/site.sqlite" },
      hosting: { type: "s3", settings: { endpoint: s3.endpoint, region: "fake-1", bucket: "shop", publicRead: true, siteUrl: s3.websiteUrl("shop") }, credential: "s3:main" },
    }),
  );
  expect((await run(["install", "--plan", planFile])).body.ok).toBe(true);
}, 60_000);

afterAll(() => {
  vi.unstubAllGlobals();
});

describe("SQLite site (fake S3)", () => {
  it("uploads and deletes media, refuses account actions, round-trips an export", async () => {
    const png = join(root, "logo.png");
    const data = new Uint8Array(64 * 64 * 4).fill(200);
    writeFileSync(png, await encodeImage({ data, width: 64, height: 64 }, "image/png", 100));
    const up = await run(["media", "upload", png, "--site", "shop", "--alt", "Logo"]);
    expect(up.code).toBe(0);
    const row = up.body.data.result[0];
    const key = new URL(row.formats.small.url).pathname.replace(/^\//, "");
    const img = await decodeImage(s3.object("shop", key)!.body);
    expect([img.width, img.height]).toEqual([480, 480]); // cover: fills the box
    const thumb = await decodeImage(s3.object("shop", new URL(row.formats["admin-original"].url).pathname.slice(1))!.body);
    expect([thumb.width, thumb.height]).toEqual([64, 64]); // contain: never upscaled
    // The database stays encrypted after the write.
    expect(new TextDecoder().decode(s3.object("shop", "data/site.sqlite")!.body.slice(0, 8))).toBe("ACMSENC1");

    // No accounts on a SQLite file.
    const role = await run(["users", "role", "me", "editor", "--site", "shop"]);
    expect(role.body.error?.code).toBe("unsupported-backend");
    expect((await run(["users", "disable", "me", "--site", "shop"])).body.error?.code).toBe("unsupported-backend");
    // …but the author profile works.
    expect((await run(["users", "update", "me", "--site", "shop", "--first-name", "Owner"])).body.data.result.firstName).toBe("Owner");

    const out = join(root, "shop-export.json");
    expect((await run(["transfer", "export", "--site", "shop", "--out", out])).code).toBe(0);
    const before = (await run(["stats", "--site", "shop"])).body.data.result;
    expect(before).toMatchObject({ media: 1, users: 1 });
    expect((await run(["content", "create", "--site", "shop", "--title", "Extra"])).code).toBe(0);
    expect((await run(["stats", "--site", "shop"])).body.data.result.posts.total).toBe(1);
    expect((await run(["transfer", "import", out, "--site", "shop", "--mode", "replace", "--yes"])).body.data.result.publishTargetReplaced).toBe(false);
    expect((await run(["stats", "--site", "shop"])).body.data.result).toEqual(before);

    const prefix = row.formats.small.url.replace(/\/small\.webp$/, "").replace(`${s3.websiteUrl("shop")}/`, "");
    expect(s3.keys("shop").some((k) => k.startsWith(`${prefix}/`))).toBe(true);
    expect((await run(["media", "delete", row.id, "--site", "shop", "--yes"])).code).toBe(0);
    expect(s3.keys("shop").some((k) => k.startsWith(`${prefix}/`))).toBe(false);
    expect((await run(["stats", "--site", "shop"])).body.data.result.media).toBe(0);
  }, 120_000);

  it("lists, uploads and deletes site files; protects the CMS's own", async () => {
    const local = join(root, "google1234.html");
    writeFileSync(local, "google-site-verification: google1234.html");
    const put = await run(["files", "put", local, "--site", "shop"]);
    expect(put.body.data.result).toMatchObject({ path: "google1234.html" });
    expect(s3.keys("shop")).toContain("google1234.html");
    const list = await run(["files", "list", "google", "--site", "shop"]);
    expect(list.body.data.result.files.map((f: { path: string }) => f.path)).toEqual(["google1234.html"]);
    const plan = await run(["files", "delete", "google1234.html", "--site", "shop"]);
    expect(plan.body.data).toMatchObject({ needsConfirmation: true });
    expect(s3.keys("shop")).toContain("google1234.html");
    expect((await run(["files", "delete", "google1234.html", "--site", "shop", "--yes"])).code).toBe(0);
    expect(s3.keys("shop")).not.toContain("google1234.html");
    expect((await run(["files", "delete", "admin/index.html", "--site", "shop", "--yes"])).body.error?.code).toBe("protected");
    expect((await run(["files", "put", local, "../x.html", "--site", "shop"])).code).toBe(2);
  }, 60_000);
});
