// Writes dist/version.json — what agents compare to decide whether the
// skills, the downloaded dist/ or a hosted admin are out of date:
//   version          release of this repo / npm package (package.json)
//   apiVersion       runtime API exposed to plugins & themes
//   minSkillsVersion oldest skills that still work with this dist
//   dataSchema       format of stored content; bumped when an older admin
//                    could no longer read data written by this one
// The last two live under "agentcms" in package.json.

import { chmodSync, readFileSync, writeFileSync } from "node:fs";
import { join, resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const pkg = JSON.parse(readFileSync(join(root, "package.json"), "utf8"));
const runtime = readFileSync(join(root, "src", "core", "flexwegRuntime.ts"), "utf8");
const api = (name) => {
  const m = new RegExp(`export const ${name} = "([^"]+)"`).exec(runtime);
  if (!m) throw new Error(`[version] ${name} not found in src/core/flexwegRuntime.ts`);
  return m[1];
};

const info = {
  name: pkg.name,
  version: pkg.version,
  apiVersion: api("FLEXWEG_API_VERSION"),
  apiMinVersion: api("FLEXWEG_API_MIN_VERSION"),
  minSkillsVersion: pkg.agentcms.minSkillsVersion,
  dataSchema: pkg.agentcms.dataSchema,
  repository: "github:fleox/agentcms",
};
writeFileSync(join(root, "dist", "version.json"), JSON.stringify(info, null, 2) + "\n");
// The npm bin entry; executable so `./dist/agent/agentcms.mjs` works in a clone.
chmodSync(join(root, "dist", "agent", "agentcms.mjs"), 0o755);
console.log(`[version] dist/version.json → ${info.version}`);
