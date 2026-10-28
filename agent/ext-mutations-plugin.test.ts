import { mkdtempSync, readFileSync, realpathSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { buildProject, cleanup, cli, edit, errorCodes, linkPackages, scaffold, serially, warningCodes } from "./testing/extProject";

// `ext check` catches each typical plugin mistake: one fresh scaffold
// per case, ONE edit (source + rebuild, or manifest.json), expect the
// matching error / warning code.

const root = realpathSync(mkdtempSync(join(tmpdir(), "agentcms-mut-plugin-")));
let n = 0;

beforeAll(() => {
  process.env.AGENTCMS_HOME = join(root, "home");
});
afterAll(() => cleanup(root));

async function mutated(apply: (project: string) => void, { rebuild = true } = {}) {
  const project = await scaffold(root, "plugin", `mut-plugin-${++n}`, ["settings", "block", "i18n", "dashboard-card"]);
  if (!rebuild) await buildProject(project);
  apply(project);
  if (rebuild) await buildProject(project);
  const res = await serially(() => cli(["ext", "check", project]));
  return {
    project,
    res,
    codes: errorCodes(res),
    warnings: warningCodes(res),
    messages: [...res.body.data.errors, ...res.body.data.warnings].map((e: { code: string; message: string }) => `${e.code}: ${e.message}`),
  };
}

const MANIFEST = "src/manifest.tsx";
const VITE = "vite.config.ts";

describe("ext check on a broken plugin", { timeout: 90_000 }, () => {
  it.concurrent("async page.head.extra filter → async-sync-filter", async () => {
    const { codes } = await mutated((p) => edit(p, MANIFEST, 'api.addFilter<string>("page.head.extra", (head, ...args) => {', 'api.addFilter<string>("page.head.extra", async (head, ...args) => {'));
    expect(codes).toContain("async-sync-filter");
  });

  it.concurrent("React bundled → bundled-react", async () => {
    const { codes, project } = await mutated((p) => {
      linkPackages(p, ["react"]);
      edit(p, VITE, '        "react",\n        "react/jsx-runtime",\n', "");
    });
    expect(readFileSync(join(project, "dist", "bundle.js"), "utf8")).not.toMatch(/from\s*"react"/);
    expect(codes).toContain("bundled-react");
    expect(codes).not.toContain("unresolvable-import");
  });

  it.concurrent("process.env.NODE_ENV left in the bundle → process-env", async () => {
    const { codes } = await mutated((p) => {
      edit(p, VITE, /  define: \{\n[^}]*\},\n/, "");
      edit(p, MANIFEST, "const PLUGIN_ID =", 'if (process.env.NODE_ENV !== "production") console.warn("dev build");\n\nconst PLUGIN_ID =');
    });
    expect(codes).toContain("process-env");
  });

  // Without jsxDev: false, Vite uses React's dev transform whenever
  // NODE_ENV isn't "production" — as here, under vitest (NODE_ENV=test).
  it.concurrent("development JSX transform → jsx-dev", async () => {
    expect(process.env.NODE_ENV).not.toBe("production");
    const { codes } = await mutated((p) => {
      linkPackages(p, ["react"]);
      edit(p, VITE, ", jsxDev: false", "");
    });
    expect(codes).toContain("jsx-dev");
  });

  it.concurrent("bare import left external → unresolvable-import", async () => {
    const { codes, messages } = await mutated((p) => edit(p, VITE, '        "@agent-cms/runtime",\n', '        "@agent-cms/runtime",\n        "@tiptap/core",\n'));
    expect(codes).toEqual(["unresolvable-import"]);
    expect(messages[0]).toContain("@tiptap/core");
  });

  it.concurrent("hooks on the wrong kind of name → unknown-hook warnings", async () => {
    const { res, codes, warnings, messages } = await mutated((p) =>
      edit(p, MANIFEST, "    // To maintain files of your own", '    api.addAction("page.head.extra", () => {});\n    api.addFilter("publish.complete", (v: unknown) => v);\n\n    // To maintain files of your own'),
    );
    expect(codes).toEqual([]);
    expect(res.body.data.valid).toBe(true);
    expect(warnings.filter((c) => c === "unknown-hook")).toHaveLength(2);
    expect(messages.join("\n")).toMatch(/addAction\("page\.head\.extra"\).*FILTER/);
    expect(messages.join("\n")).toMatch(/addFilter\("publish\.complete"\).*ACTION/);
  });

  it.concurrent("manifest.json id ≠ bundle id → id-mismatch", async () => {
    const { codes } = await mutated((p) => edit(p, "manifest.json", /"id": "[^"]+"/, '"id": "someone-else"'), { rebuild: false });
    expect(codes).toEqual(["id-mismatch"]);
  });

  it.concurrent("defaults outside the settings schema → settings-schema-default", async () => {
    const { codes } = await mutated((p) => edit(p, "src/config.ts", '  message: { description: "Content of the meta tag." },', '  message: { description: "Content of the meta tag.", values: ["hi", "bye"] },'));
    expect(codes).toEqual(["settings-schema-default"]);
  });

  it.concurrent("apiVersion newer than the admin's → api-too-new", async () => {
    const { codes } = await mutated((p) => edit(p, "manifest.json", /"apiVersion": "[^"]+"/, '"apiVersion": "9.0.0"'), { rebuild: false });
    expect(codes).toEqual(["api-too-new"]);
  });
});
