import { existsSync, mkdtempSync, readdirSync, readFileSync, realpathSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { buildProject, cleanup, cli, REPO, scaffold, typecheck } from "./testing/extProject";

// `agentcms ext`: the four scaffold variants build, type-check, pack
// deterministically and pass `ext check` with no error or warning — on
// the project folder and on the ZIP. Plus: every bundled extension in
// dist/admin passes, and `ext preview` renders the expected pages.

const VARIANTS = [
  { kind: "plugin", id: "acme-tools", features: ["settings", "block", "i18n", "dashboard-card"] },
  { kind: "plugin", id: "bare-plugin", features: [] },
  { kind: "theme", id: "acme-blog", features: ["settings", "block"] },
  { kind: "theme", id: "bare-theme", features: [] },
] as const;

const root = realpathSync(mkdtempSync(join(tmpdir(), "agentcms-ext-")));
const projects = new Map<string, string>();

beforeAll(async () => {
  process.env.AGENTCMS_HOME = join(root, "home");
  for (const v of VARIANTS) projects.set(v.id, await scaffold(root, v.kind, v.id, [...v.features]));
  await Promise.all([...projects.values()].map((p) => buildProject(p)));
}, 120_000);

afterAll(() => cleanup(root));

describe("ext new → build → pack → check", () => {
  it("rejects bad ids and unknown features", async () => {
    expect((await cli(["ext", "new", "plugin", "Bad_Id", "--dir", join(root, "x")])).body.error?.code).toBe("usage");
    expect((await cli(["ext", "new", "plugin", "agentcms-foo", "--dir", join(root, "x")])).body.error?.code).toBe("usage");
    expect((await cli(["ext", "new", "theme", "my-theme", "--with", "dashboard-card", "--dir", join(root, "x")])).body.error?.code).toBe("usage");
    expect((await cli(["ext", "new", "theme", "acme-blog", "--dir", projects.get("acme-blog")!])).body.error?.code).toBe("dir-not-empty");
  });

  for (const v of VARIANTS) {
    it(`${v.kind} ${v.id} (${v.features.join(", ") || "no features"}) passes on the project and on its ZIP`, async () => {
      const project = projects.get(v.id)!;
      expect(existsSync(join(project, "dist", "bundle.js"))).toBe(true);

      const packed = await cli(["ext", "pack", project]);
      expect(packed.body.ok).toBe(true);
      const zip = packed.body.data.zip as string;
      expect(zip).toBe(join(project, `${v.id}.zip`));
      expect(packed.body.data.files).toEqual(expect.arrayContaining(["manifest.json", "bundle.js", "README.md"]));

      for (const target of [project, zip]) {
        const res = await cli(["ext", "check", target, "--kind", v.kind]);
        const report = res.body.data;
        expect({ target, errors: report.errors, warnings: report.warnings }).toEqual({ target, errors: [], warnings: [] });
        expect(res.code).toBe(0);
        expect(report).toMatchObject({ valid: true, kind: v.kind, id: v.id, version: "1.0.0" });
        if (v.kind === "plugin") {
          expect(report.registered.filters.map((f: { hook: string }) => f.hook)).toContain("page.head.extra");
          // Lifecycle simulation ran (publish, unpublish, delete, bulk publish).
          expect(report.output.lifecycle.map((st: { step: string }) => st.step)).toEqual(["publish", "unpublish", "delete", "bulk-publish"]);
        }
        if (v.features.includes("dashboard-card" as never)) expect(report.registered.dashboardCards).toEqual([`${v.id}/stats`]);
        if (v.features.includes("block" as never)) {
          expect(report.blocks).toHaveLength(1);
          const [block] = report.blocks;
          expect(block.id).toBe(`${v.id}/callout`);
          expect(block.markdown).toContain(`data-cms-block="${v.id}/callout"`);
          expect(block.published).toContain(`<aside class="${v.id}-callout`);
        } else {
          expect(report.blocks).toEqual([]);
        }
        if (v.kind === "theme") expect(report.output.pages).toMatchObject({ home: "index.html", single: "guides/why-a-static-cms.html", category: "guides/index.html" });
      }
    }, 60_000);
  }

  it("packs deterministically", async () => {
    const project = projects.get("acme-tools")!;
    const a = await cli(["ext", "pack", project, "--out", join(root, "a.zip")]);
    await cli(["ext", "pack", project, "--out", join(root, "b.zip")]);
    expect(a.body.data.bytes).toBeGreaterThan(0);
    expect(readFileSync(join(root, "a.zip")).equals(readFileSync(join(root, "b.zip")))).toBe(true);
  });

  it.each(VARIANTS.map((v) => [v.id]))("%s type-checks against types/agentcms-runtime.d.ts", async (id) => {
    const res = await typecheck(projects.get(id)!);
    expect(res.output).toBe("");
    expect(res.ok).toBe(true);
  }, 90_000);
});

describe("ext preview", () => {
  it("renders the full demo site with a scaffolded theme", async () => {
    const out = join(root, "preview-blog");
    const res = await cli(["ext", "preview", projects.get("acme-blog")!, "--out", out]);
    expect(res.code).toBe(0);
    const data = res.body.data;
    expect(data.themeId).toBe("acme-blog");
    expect(data.files).toEqual(
      expect.arrayContaining([
        "index.html",
        "404.html",
        "about.html",
        "guides/index.html",
        "guides/why-a-static-cms.html",
        "author/ada-writer.html",
        "data/menu.json",
        "theme-assets/acme-blog.css",
        "theme-assets/acme-blog-menu.js",
      ]),
    );
    expect(data.issues.filter((i: { level: string }) => i.level === "error")).toEqual([]);
    expect(readFileSync(join(out, "theme-assets", "acme-blog.css"), "utf8").length).toBeGreaterThan(100);
  }, 60_000);

  it("refuses to wipe a folder it did not create", async () => {
    const res = await cli(["ext", "preview", projects.get("bare-plugin")!, "--out", REPO]);
    expect(res.body.error?.code).toBe("out-not-empty");
  });
});

describe("bundled extensions (dist/admin)", () => {
  const bundled = ["plugins", "themes"].flatMap((kind) => {
    const dir = join(REPO, "dist", "admin", kind);
    return existsSync(dir) ? readdirSync(dir).map((id) => [`${kind}/${id}`, join(dir, id)] as const) : [];
  });

  it("are all present", () => {
    expect(bundled.length).toBeGreaterThan(5);
  });

  it.each(bundled)("%s passes ext check", async (_name, dir) => {
    const res = await cli(["ext", "check", dir]);
    expect(res.body.data.errors).toEqual([]);
    expect(res.body.data.valid).toBe(true);
  }, 60_000);
});
