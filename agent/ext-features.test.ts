import { existsSync, mkdtempSync, readFileSync, realpathSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { buildProject, cleanup, cli, edit, scaffold, serially, warningCodes } from "./testing/extProject";

// Preview / check features beyond pass-fail: sub-folder rendering, the
// block test page, the plugin lifecycle simulation and its warnings,
// author links, demo media ratios.

const root = realpathSync(mkdtempSync(join(tmpdir(), "agentcms-ext-features-")));

beforeAll(() => {
  process.env.AGENTCMS_HOME = join(root, "home");
});
afterAll(() => cleanup(root));

describe("ext preview / check features", { timeout: 120_000 }, () => {
  it("renders a sub-folder site, a block test page and author links", async () => {
    const project = await scaffold(root, "theme", "feat-theme", ["block"]);
    await buildProject(project);
    const out = join(root, "feat-theme-preview");
    const res = await serially(() => cli(["ext", "preview", project, "--base-path", "/blog", "--out", out]));
    expect(res.code).toBe(0);
    const data = res.body.data;
    expect(data.baseUrl).toBe("http://localhost:4321/blog");
    expect(data.pages.blocks).toBe("block-test.html");
    expect(data.blocks.map((b: { id: string }) => b.id)).toEqual(["feat-theme/callout"]);
    const home = readFileSync(join(out, "index.html"), "utf8");
    expect(home).toContain('<meta name="x-cms-base" content="/blog/"/>');
    // Root-absolute links are rewritten under the sub-folder.
    expect(home).toMatch(/href="\/blog\/guides\/why-a-static-cms\.html"/);
    expect(home).not.toMatch(/href="\/guides\//);
    expect(readFileSync(join(out, "block-test.html"), "utf8")).toContain('<aside class="feat-theme-callout');
    // Demo media keep their ratio on "contain" variants (portrait forest).
    const original = readFileSync(join(out, "media/demo/forest/admin-original.svg"), "utf8");
    expect(original).toContain('width="1333" height="2000"');
  });

  it("simulates the plugin lifecycle and warns about a missing regeneration target", async () => {
    const project = await scaffold(root, "plugin", "feat-index");
    // A plugin that maintains index.json from publish.complete only.
    edit(
      project,
      "src/manifest.tsx",
      "    // To maintain files of your own",
      [
        '    api.addAction("publish.complete", async (...args) => {',
        '      const ctx = args[1] as { posts: Array<{ status: string; title: string }> };',
        '      const { uploadFile } = await import("@agent-cms/runtime");',
        '      await uploadFile({ path: "feat/index.json", content: JSON.stringify(ctx.posts.filter((p) => p.status === "online").map((p) => p.title)) });',
        "    });",
        "",
        "    // To maintain files of your own",
      ].join("\n"),
    );
    await buildProject(project);
    const res = await serially(() => cli(["ext", "check", project]));
    expect(res.body.data.valid).toBe(true);
    expect(warningCodes(res)).toContain("no-regeneration-target");
    const steps = res.body.data.output.lifecycle as Array<{ step: string; added: string[]; changed: string[] }>;
    const publish = steps.find((s) => s.step === "publish")!;
    expect(publish.added).toContain("feat/index.json");
    // Bulk publishing never fires publish.complete: nothing of its own.
    const bulk = steps.find((s) => s.step === "bulk-publish")!;
    expect([...bulk.added, ...bulk.changed]).not.toContain("feat/index.json");
  });

  it("links the author archive from single posts (AuthorView.url)", async () => {
    const project = await scaffold(root, "theme", "feat-author");
    // The scaffold links the author's archive with author.url.
    await buildProject(project);
    const out = join(root, "feat-author-preview");
    const res = await serially(() => cli(["ext", "preview", project, "--out", out]));
    expect(res.code).toBe(0);
    const single = readFileSync(join(out, res.body.data.pages.single), "utf8");
    expect(single).toContain('<a href="/author/ada-writer.html">Ada Writer</a>');
    expect(existsSync(join(out, "author/ada-writer.html"))).toBe(true);
  });

  it("makes the block page the static home, renders empty states, and translates the 404 title", async () => {
    const project = await scaffold(root, "theme", "feat-home", ["block"]);
    await buildProject(project);
    const out = join(root, "feat-home-preview");
    const res = await serially(() => cli(["ext", "preview", project, "--home", "blocks", "--settings", '{"language":"fr"}', "--out", out]));
    expect(res.code).toBe(0);
    expect(res.body.data.notes.join(" ")).toMatch(/static home/);
    expect(readFileSync(join(out, "index.html"), "utf8")).toContain('<aside class="feat-home-callout');
    const notFound = readFileSync(join(out, "404.html"), "utf8");
    expect(notFound).toContain("<title>Page introuvable");
    expect(notFound).toContain("<h1>Page introuvable</h1>");
    const empty = join(root, "feat-home-empty");
    const res2 = await serially(() => cli(["ext", "preview", project, "--demo", "empty", "--out", empty]));
    expect(res2.code).toBe(0);
    expect(readFileSync(join(empty, "index.html"), "utf8")).toContain("Nothing published yet.");
    expect(existsSync(join(empty, "guides/index.html"))).toBe(true);
  });
});
