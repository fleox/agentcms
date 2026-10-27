import { existsSync, readdirSync, readFileSync } from "node:fs";
import { builtinModules } from "node:module";
import { join } from "node:path";
import { distRoot } from "./paths";

// The published package ships dist/agent only (no node_modules): a
// runtime require() / import of a non-builtin package from the bundle
// works in this repo and crashes for every npm user.

const BUILTINS = new Set(builtinModules.flatMap((m) => [m, `node:${m}`]));

describe("dist/agent bundle", () => {
  const dir = join(distRoot(), "agent");
  it.skipIf(!existsSync(dir))("requires no package outside the bundle", () => {
    // extScaffold holds the generated projects' sources as text.
    const chunks = readdirSync(join(dir, "chunks")).filter((f) => !f.startsWith("extScaffold-"));
    const files = [join(dir, "agentcms.mjs"), ...chunks.map((f) => join(dir, "chunks", f))];
    const offenders: string[] = [];
    for (const file of files) {
      const code = readFileSync(file, "utf8");
      // Rollup output uses double quotes; single-quoted matches are JSDoc.
      for (const m of code.matchAll(/\brequire\d*\(\s*"([^"./][^"]*)"\s*\)|^import\s[^;]*?from\s+"([^"./][^"]*)";?$|\bimport\(\s*"([^"./][^"]*)"\s*\)/gm)) {
        const spec = m[1] ?? m[2] ?? m[3];
        if (!BUILTINS.has(spec) && !BUILTINS.has(spec.split("/")[0])) offenders.push(`${file.slice(dir.length + 1)}: ${spec}`);
      }
    }
    expect(offenders).toEqual([]);
  });
});
