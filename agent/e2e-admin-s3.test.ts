import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { installBrowserEnv } from "./browserEnv";
import { cli, siteCli, writePlan } from "./testing/adminCli";
import { createFakeS3 } from "./testing/fakeS3";

// Site administration from the CLI on an encrypted SQLite-file site on
// an S3-compatible bucket (in-memory S3 with website hosting): content,
// regenerate, terms, menus and settings. The database stays encrypted
// (data is checked back through the CLI) and every page lands in the
// bucket.

const s3 = createFakeS3({ accessKeyId: "AKID" });
const root = mkdtempSync(join(tmpdir(), "agentcms-admin-s3-"));
const { run, ok } = siteCli("shop");
const text = (key: string) => {
  const o = s3.object("shop", key);
  return o ? new TextDecoder().decode(o.body) : undefined;
};
const has = (key: string) => s3.object("shop", key) !== undefined;

beforeAll(async () => {
  installBrowserEnv();
  vi.stubGlobal("fetch", s3.fetch);
  process.env.AGENTCMS_HOME = join(root, "home");
  process.env.E2E_AK = "AKID";
  process.env.E2E_SK = "SECRET-KEY";
  expect((await cli(["credentials", "set", "s3:main", "--from-env", "E2E_AK,E2E_SK"])).code).toBe(0);
  s3.createBucket("shop", { public: true });
  const plan = writePlan(root, "shop", {
    alias: "shop",
    data: { backend: "sqlite-file", path: "data/site.sqlite" },
    hosting: {
      type: "s3",
      settings: { endpoint: s3.endpoint, region: "fake-1", bucket: "shop", publicRead: true, siteUrl: s3.websiteUrl("shop") },
      credential: "s3:main",
    },
  });
  expect((await cli(["install", "--plan", plan])).body).toMatchObject({ ok: true, data: { installed: true } });
}, 60_000);

afterAll(() => {
  vi.unstubAllGlobals();
});

describe("site administration on an encrypted SQLite file (fake S3)", () => {
  it("content: create, publish, update, bulk, unpublish, delete", async () => {
    const dbBefore = text("data/site.sqlite");
    const a = await ok(["content", "create", "--title", "Blue Mug", "--body", "A mug.", "--category", "Mugs", "--create-terms", "--publish"]);
    expect(a.result).toMatchObject({ slug: "blue-mug", status: "online", path: "mugs/blue-mug.html" });
    expect(text("mugs/blue-mug.html")).toContain("Blue Mug");
    expect(text("index.html")).toContain("Blue Mug");
    // The database was rewritten, still encrypted.
    const db = text("data/site.sqlite")!;
    expect(db).not.toBe(dbBefore);
    expect(db.startsWith("ACMSENC1")).toBe(true);
    expect(db).not.toContain("Blue Mug");

    await ok(["content", "update", "blue-mug", "--body", "A blue mug."]);
    expect(text("mugs/blue-mug.html")).toContain("A blue mug.");
    expect((await ok(["content", "get", "blue-mug"])).result).toMatchObject({ body: "A blue mug.", category: "mugs" });

    await ok(["content", "create", "--title", "Red Mug", "--category", "mugs"]);
    await ok(["content", "create", "--title", "Green Mug", "--category", "mugs"]);
    const bulk = await ok(["content", "publish", "red-mug", "green-mug"]);
    expect(bulk.result.every((r: { ok: boolean }) => r.ok)).toBe(true);
    expect(has("mugs/red-mug.html") && has("mugs/green-mug.html")).toBe(true);
    expect(text("index.html")).toContain("Green Mug");

    await ok(["content", "unpublish", "red-mug"]);
    expect(has("mugs/red-mug.html")).toBe(false);
    expect((await ok(["content", "delete", "green-mug"])).result.needsConfirmation).toBe(true);
    await ok(["content", "delete", "green-mug", "--yes"]);
    expect(has("mugs/green-mug.html")).toBe(false);
    expect((await ok(["content", "list"])).result.map((p: { slug: string }) => p.slug).sort()).toEqual(["blue-mug", "red-mug"]);
  }, 60_000);

  it("terms + regenerate: rename a category, repair, delete with --detach", async () => {
    const created = await ok(["terms", "create", "--type", "tag", "--name", "Ceramic"]);
    expect(created.result.slug).toBe("ceramic");
    await ok(["terms", "update", "mugs", "--slug", "cups", "--seo-title", "Cups"]);
    expect((await ok(["terms", "get", "cups"])).result).toMatchObject({ name: "Mugs", seo: { title: "Cups" }, posts: 2 });
    expect((await ok(["regenerate", "repair"])).result.repaired).toBe(1);
    expect(has("cups/blue-mug.html")).toBe(true);
    expect(has("mugs/blue-mug.html")).toBe(false);
    await ok(["regenerate", "all"]);
    expect(text("cups/index.html")).toContain("Cups");

    const del = await ok(["terms", "delete", "cups", "--yes", "--detach"]);
    expect(del.result).toMatchObject({ archiveRemoved: false, archivePath: "cups/index.html" });
    expect(del.result.detached).toHaveLength(2);
    expect(has("cups/index.html")).toBe(true);
    expect((await ok(["content", "get", "blue-mug"])).result.category).toBeNull();
    await ok(["regenerate", "repair"]);
    expect(has("blue-mug.html")).toBe(true);
  }, 60_000);

  it("menus + settings", async () => {
    const set = await ok(["menus", "set", "--data", JSON.stringify({ header: [{ label: "Home", home: true }, { label: "Mug", post: "blue-mug" }] })]);
    expect(set.result.header[1].target).toMatchObject({ kind: "post", href: "/blue-mug.html", status: "online" });
    expect(JSON.parse(text("data/menu.json")!).header.map((i: { href: string }) => i.href)).toEqual(["/index.html", "/blue-mug.html"]);

    const res = await ok(["settings", "set", "--title", "Mug Shop", "--base-url", s3.websiteUrl("shop")]);
    expect(res.result.changed).toEqual(["title"]);
    expect((await ok(["settings", "get", "--section", "site"])).result.site.title).toBe("Mug Shop");
    expect((await run(["settings", "set", "--pagination-mode", "global"])).body.error?.code).toBe("not-applicable");

    const target = await ok(["settings", "target", "show"]);
    expect(target.result).toMatchObject({ connectorId: "s3", settings: { bucket: "shop" }, credential: "s3:main" });
    expect(JSON.stringify(target)).not.toContain("SECRET-KEY");
    expect((await ok(["settings", "target", "test"])).result.ok).toBe(true);
    expect(has(".agentcms-probe.txt")).toBe(false);

    await ok(["regenerate", "home"]);
    expect(text("index.html")).toContain("Mug Shop");
  }, 60_000);
});
