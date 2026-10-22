import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { defineConfig, type Plugin } from "vite";

// Builds the `agentcms` CLI (agent/bin.ts) into ONE self-contained Node
// entry, dist/agent/agentcms.mjs (+ lazy chunks) — every dependency is
// inlined so the npm package needs no runtime dependencies.
const CJS_SHIM = [
  'import { createRequire as __acmsRequire } from "node:module";',
  'import { fileURLToPath as __acmsPath } from "node:url";',
  'import { dirname as __acmsDirname } from "node:path";',
  "const require = __acmsRequire(import.meta.url);",
  "const __filename = __acmsPath(import.meta.url);",
  "const __dirname = __acmsDirname(__filename);",
].join("\n");

// sql.js can't be bundled (UMD wrapper): ship its CommonJS build as is,
// loaded by agent/vendor/sqljs.ts.
function vendorSqlJs(): Plugin {
  return {
    name: "agentcms-vendor-sqljs",
    generateBundle() {
      this.emitFile({
        type: "asset",
        fileName: "vendor/sql-wasm.cjs",
        source: readFileSync(fileURLToPath(new URL("./node_modules/sql.js/dist/sql-wasm.js", import.meta.url))),
      });
    },
  };
}

export default defineConfig({
  plugins: [vendorSqlJs()],
  // public/ belongs to the admin build — keep it out of dist/agent/.
  publicDir: false,
  define: {
    __AGENTCMS_BUNDLED__: "true",
  },
  resolve: {
    alias: [
      // Exact match only: "sql.js/dist/sql-wasm.wasm?url" stays as is.
      { find: /^sql\.js$/, replacement: fileURLToPath(new URL("./agent/vendor/sqljs.ts", import.meta.url)) },
      { find: "@flexweg/cms-runtime", replacement: fileURLToPath(new URL("./src/core/flexwegRuntime.ts", import.meta.url)) },
    ],
  },
  ssr: {
    noExternal: true,
  },
  build: {
    ssr: "agent/bin.ts",
    target: "node20",
    outDir: "dist/agent",
    emptyOutDir: true,
    minify: false,
    sourcemap: false,
    rollupOptions: {
      output: {
        format: "es",
        entryFileNames: "agentcms.mjs",
        // Commands load the admin's modules on demand, so `help` /
        // `version` / `status` start instantly.
        chunkFileNames: "chunks/[name]-[hash].mjs",
        // CommonJS deps (sql.js…) expect __dirname / require, which ES
        // modules don't have.
        banner: (chunk) => (chunk.isEntry ? "#!/usr/bin/env node\n" : "") + CJS_SHIM,
      },
    },
  },
});
