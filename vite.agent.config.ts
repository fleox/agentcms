import { defineConfig } from "vite";

// Builds the `agentcms` CLI (agent/bin.ts) into ONE self-contained Node
// file, dist/agent/agentcms.mjs — every dependency is inlined so the npm
// package needs no runtime dependencies and `npx agentcms` starts fast.
export default defineConfig({
  // public/ belongs to the admin build — keep it out of dist/agent/.
  publicDir: false,
  define: {
    __AGENTCMS_BUNDLED__: "true",
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
        inlineDynamicImports: true,
        banner: "#!/usr/bin/env node",
      },
    },
  },
});
