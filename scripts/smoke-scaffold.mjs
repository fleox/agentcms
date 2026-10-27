// Release smoke test: what a user gets from npm. Packs this repo
// (`npm pack`), scaffolds every `ext new` variant with the local CLI,
// points each project's @agent-cms/agentcms at the tarball, then runs a
// REAL `npm install` (registry, network) + build + check. Catches
// missing devDependencies / peer issues that the offline unit tests
// (which link the repo's node_modules) can't see.
// Usage: npm run build && node scripts/smoke-scaffold.mjs

import { execFileSync } from "node:child_process";
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const work = mkdtempSync(join(tmpdir(), "agentcms-smoke-"));
const run = (cmd, args, cwd) => execFileSync(cmd, args, { cwd, encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] });
const VARIANTS = [
  ["theme", "smoke-theme", "settings,block"],
  ["theme", "smoke-bare-theme", ""],
  ["plugin", "smoke-plugin", "settings,block,i18n,dashboard-card"],
  ["plugin", "smoke-bare-plugin", ""],
];
let failed = 0;
try {
  const tarball = join(work, run("npm", ["pack", "--silent", "--pack-destination", work], root).trim().split("\n").pop());
  console.log(`[smoke] packed ${tarball}`);
  for (const [kind, id, features] of VARIANTS) {
    const dir = join(work, id);
    try {
      run(process.execPath, [join(root, "dist/agent/agentcms.mjs"), "ext", "new", kind, id, "--dir", dir, ...(features ? ["--with", features] : []), "--json"], work);
      const pkgFile = join(dir, "package.json");
      const pkg = JSON.parse(readFileSync(pkgFile, "utf8"));
      pkg.devDependencies["@agent-cms/agentcms"] = `file:${tarball}`;
      writeFileSync(pkgFile, JSON.stringify(pkg, null, 2) + "\n");
      run("npm", ["install", "--no-audit", "--no-fund", "--silent"], dir);
      run("npm", ["run", "-s", "build"], dir);
      const report = JSON.parse(run("npm", ["run", "-s", "check", "--", "--json"], dir)).data;
      if (!report.valid || report.warnings.length) throw new Error(`check: ${JSON.stringify([...report.errors, ...report.warnings])}`);
      console.log(`[smoke] ${kind} ${id}: install + build + check OK`);
    } catch (err) {
      failed++;
      console.error(`[smoke] ${kind} ${id} FAILED:\n${err.stdout ?? ""}${err.stderr ?? ""}${err.message}`);
    }
  }
} finally {
  rmSync(work, { recursive: true, force: true });
}
if (failed) process.exit(1);
