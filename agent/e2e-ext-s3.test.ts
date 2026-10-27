import { mkdtempSync, realpathSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { installBrowserEnv } from "./browserEnv";
import { createFakeS3 } from "./testing/fakeS3";
import { buildProject, cleanup, cli, scaffold } from "./testing/extProject";

// `ext install` on an encrypted-SQLite site hosted on an in-memory S3:
// files under admin/themes/<id>/, the registry entry + activation in the
// database itself, and the refusal when the hosted admin's extension API
// is older than the package's.

const s3 = createFakeS3({ accessKeyId: "AKID" });
const root = realpathSync(mkdtempSync(join(tmpdir(), "agentcms-ext-s3-")));
let theme: string;
const text = (key: string) => new TextDecoder().decode(s3.object("shop", key)!.body);

async function dbDoc(collection: string, id: string) {
  const { resolveSite } = await import("./sites");
  const { openSiteStore } = await import("./ops/siteData");
  const store = await openSiteStore(resolveSite("shop"));
  return store.get(collection as never, id) as any;
}

beforeAll(async () => {
  installBrowserEnv();
  vi.stubGlobal("fetch", s3.fetch);
  process.env.AGENTCMS_HOME = join(root, "home");
  process.env.E2E_AK = "AKID";
  process.env.E2E_SK = "SECRET-KEY";
  theme = await scaffold(root, "theme", "acme-shop", ["settings"]);
  await buildProject(theme);
  expect((await cli(["credentials", "set", "s3:main", "--from-env", "E2E_AK,E2E_SK"])).code).toBe(0);
  s3.createBucket("shop", { public: true });
  const plan = join(root, "plan.json");
  writeFileSync(
    plan,
    JSON.stringify({
      alias: "shop",
      data: { backend: "sqlite-file", path: "data/site.sqlite" },
      hosting: { type: "s3", settings: { endpoint: s3.endpoint, region: "fake-1", bucket: "shop", publicRead: true, siteUrl: s3.websiteUrl("shop") }, credential: "s3:main" },
    }),
  );
  expect((await cli(["install", "--plan", plan])).body).toMatchObject({ ok: true, data: { installed: true } });
}, 120_000);

afterAll(() => {
  vi.unstubAllGlobals();
  cleanup(root);
});

describe("ext install on SQLite + S3", () => {
  it("installs and activates a theme; the registry lives in the encrypted database", async () => {
    const before = text("data/site.sqlite");
    const res = await cli(["ext", "install", theme, "--site", "shop", "--activate", "--yes"]);
    expect(res.body.error).toBeUndefined();
    expect(res.body.data).toMatchObject({ installed: true, action: "install", kind: "theme", id: "acme-shop" });
    expect(s3.keys("shop")).toEqual(expect.arrayContaining(["admin/themes/acme-shop/bundle.js", "admin/themes/acme-shop/manifest.json", "theme-assets/acme-shop.css", "theme-assets/acme-shop-menu.js"]));
    // compileCss(defaultConfig) output, not an empty file.
    expect(text("theme-assets/acme-shop.css")).toContain(".acme-shop");
    const db = text("data/site.sqlite");
    expect(db).not.toBe(before);
    expect(db.startsWith("ACMSENC1")).toBe(true);
    expect(db).not.toContain("acme-shop");

    expect((await dbDoc("config", "externalRegistry")).themes).toContainEqual(expect.objectContaining({ id: "acme-shop", version: "1.0.0" }));
    expect((await dbDoc("settings", "site")).activeThemeId).toBe("acme-shop");
    expect((await cli(["ext", "list", "--site", "shop"])).body.data).toMatchObject({ activeTheme: "acme-shop" });
  }, 60_000);

  it("refuses a package whose apiVersion the hosted admin does not load", async () => {
    const manifest = s3.object("shop", "admin/admin-files.json")!;
    const original = manifest.body;
    const parsed = JSON.parse(new TextDecoder().decode(original));
    manifest.body = new TextEncoder().encode(JSON.stringify({ ...parsed, apiVersion: "1.0.0", apiMinVersion: "1.0.0" }));
    try {
      const res = await cli(["ext", "install", theme, "--site", "shop", "--yes"]);
      expect(res.body.error?.code).toBe("api-incompatible");
      expect(res.body.error?.message).toContain("1.0.0");
    } finally {
      manifest.body = original;
    }
  }, 60_000);
});
