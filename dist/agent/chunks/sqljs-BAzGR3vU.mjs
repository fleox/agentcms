import { createRequire as __acmsRequire } from "node:module";
import { fileURLToPath as __acmsPath } from "node:url";
import { dirname as __acmsDirname } from "node:path";
const require2 = __acmsRequire(import.meta.url);
const __filename = __acmsPath(import.meta.url);
const __dirname = __acmsDirname(__filename);
import { createRequire } from "node:module";
import { join } from "node:path";
import { d as distRoot } from "../agentcms.mjs";
import "node:util";
import "node:fs";
import "node:url";
import "node:child_process";
import "node:os";
import "node:http";
const load = createRequire(import.meta.url);
const initSqlJs = load(join(distRoot(), "agent", "vendor", "sql-wasm.cjs"));
export {
  initSqlJs as default
};
