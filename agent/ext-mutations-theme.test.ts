import { mkdtempSync, realpathSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { buildProject, cleanup, cli, edit, errorCodes, scaffold, serially } from "./testing/extProject";

// `ext check` catches each typical theme mistake: one fresh scaffold
// per case, ONE edit, rebuild, expect the matching error code.

const root = realpathSync(mkdtempSync(join(tmpdir(), "agentcms-mut-theme-")));
let n = 0;

beforeAll(() => {
  process.env.AGENTCMS_HOME = join(root, "home");
});
afterAll(() => cleanup(root));

async function mutated(apply: (project: string) => void) {
  const project = await scaffold(root, "theme", `mut-theme-${++n}`, ["settings", "block"]);
  apply(project);
  await buildProject(project);
  const res = await serially(() => cli(["ext", "check", project]));
  return { res, codes: errorCodes(res), messages: (res.body.data.errors as Array<{ code: string; message: string }>).map((e) => `${e.code}: ${e.message}`) };
}

const BASE = "src/templates/BaseLayout.tsx";

describe("ext check on a broken theme", { timeout: 90_000 }, () => {
  it.concurrent("missing head sentinel → head-sentinel", async () => {
    const { res, codes } = await mutated((p) => edit(p, BASE, '<meta name="x-cms-head-extra" />', ""));
    expect(codes).toContain("head-sentinel");
    expect(codes).not.toContain("body-sentinel");
    expect(res.code).toBe(1);
  });

  it.concurrent("missing body-end sentinel → body-sentinel", async () => {
    const { codes } = await mutated((p) => edit(p, BASE, '<script type="application/x-cms-body-end" />', ""));
    expect(codes).toContain("body-sentinel");
    expect(codes).not.toContain("head-sentinel");
  });

  it.concurrent("a missing template → template-missing", async () => {
    const { codes } = await mutated((p) => edit(p, "src/manifest.tsx", "notFound: NotFoundTemplate,", ""));
    expect(codes).toEqual(["template-missing"]);
  });

  it.concurrent("single template ignoring bodyHtml → single-body", async () => {
    const { codes } = await mutated((p) => edit(p, "src/templates/SingleTemplate.tsx", "dangerouslySetInnerHTML={{ __html: bodyHtml }}", ""));
    expect(codes).toContain("single-body");
  });

  it.concurrent("inputFormats as MIME types → image-input", async () => {
    const { codes } = await mutated((p) => edit(p, "src/manifest.tsx", '[".jpg", ".jpeg", ".png", ".webp", ".gif"]', '["image/jpeg", "image/png"]'));
    expect(codes).toEqual(["image-input"]);
  });

  it.concurrent("empty cssText → css-missing", async () => {
    const { codes } = await mutated((p) => edit(p, "src/manifest.tsx", /\n  cssText,\n/, '\n  cssText: "",\n'));
    expect(codes).toContain("css-missing");
  });

  it.concurrent("block with an inspector but no nodeName → block-roundtrip error naming nodeName", async () => {
    const { codes, messages } = await mutated((p) => edit(p, "src/callout.tsx", "nodeName: NODE_NAME,", ""));
    expect(codes).toContain("block-roundtrip");
    expect(messages.find((m) => m.startsWith("block-roundtrip"))).toMatch(/nodeName/);
  });

  it.concurrent("insert() without .run() → block-roundtrip (empty document)", async () => {
    const { codes, messages } = await mutated((p) => edit(p, "src/callout.tsx", "} } }).run(),", "} } }),"));
    expect(codes).toContain("block-roundtrip");
    expect(messages.find((m) => m.startsWith("block-roundtrip"))).toMatch(/empty/);
  });
});
