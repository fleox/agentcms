// Writes dist/admin/admin-files.json — the list of every file of the
// built admin. The admin uses it to copy ITSELF onto a publish target
// ("Host the admin on this site" in the setup wizard / Settings), since a
// browser can't list the folder it was served from. config.js is left
// out: it is generated per site at deploy time. No timestamp: the build
// must be reproducible so CI can check the committed dist/ is up to date.

import { readdirSync, statSync, writeFileSync, readFileSync } from "node:fs";
import { join, relative, resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const adminDir = join(root, "dist", "admin");
const MANIFEST = "admin-files.json";
const SKIP = new Set(["config.js", MANIFEST]);

function walk(dir, out) {
  for (const name of readdirSync(dir)) {
    const abs = join(dir, name);
    if (statSync(abs).isDirectory()) walk(abs, out);
    else out.push(relative(adminDir, abs).split("\\").join("/"));
  }
  return out;
}

const files = walk(adminDir, []).filter((f) => !SKIP.has(f)).sort();
const { version } = JSON.parse(readFileSync(join(root, "package.json"), "utf8"));
writeFileSync(
  join(adminDir, MANIFEST),
  JSON.stringify({ version, files }, null, 2) + "\n",
);
console.log(`[admin-manifest] ${files.length} files listed in dist/admin/${MANIFEST}`);
