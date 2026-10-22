import { existsSync, readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

// The CLI runs either bundled (dist/agent/agentcms.mjs, inside the npm
// package or a clone) or from source (agent/*.ts under vitest). Both
// layouts resolve to the same dist/ folder.

declare const __AGENTCMS_BUNDLED__: boolean | undefined;

export function distRoot(): string {
  if (process.env.AGENTCMS_DIST) return resolve(process.env.AGENTCMS_DIST);
  const here = dirname(fileURLToPath(import.meta.url));
  const bundled = typeof __AGENTCMS_BUNDLED__ !== "undefined" && __AGENTCMS_BUNDLED__;
  return bundled ? resolve(here, "..") : resolve(here, "..", "dist");
}

export interface VersionInfo {
  name: string;
  version: string;
  apiVersion: string;
  apiMinVersion: string;
  minSkillsVersion: string;
  dataSchema: number;
  repository: string;
}

export function readVersionInfo(): VersionInfo {
  const file = join(distRoot(), "version.json");
  if (!existsSync(file)) {
    throw new Error(`${file} is missing — run \`npm run build\` first.`);
  }
  return JSON.parse(readFileSync(file, "utf8")) as VersionInfo;
}
