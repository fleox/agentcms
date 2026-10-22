import { createRequire } from "node:module";
import { join } from "node:path";
import { distRoot } from "../paths";

// Stand-in for `import("sql.js")` inside the CLI bundle (aliased in
// vite.agent.config.ts). sql.js is a UMD/CommonJS file that doesn't
// survive bundling, so the build copies it verbatim to
// dist/agent/vendor/sql-wasm.cjs and it is loaded with require().

const load = createRequire(import.meta.url);
const initSqlJs = load(join(distRoot(), "agent", "vendor", "sql-wasm.cjs"));

export default initSqlJs;
