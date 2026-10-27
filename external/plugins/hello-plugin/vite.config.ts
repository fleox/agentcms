import { defineConfig } from "vite";

// External-plugin build config. Three things matter here:
//
//   1. Library mode: we emit a single ESM bundle (bundle.js) that
//      default-exports the plugin manifest. The admin imports() this
//      file at boot.
//
//   2. Externalised dependencies: react, react-i18next and
//      @agent-cms/runtime are NOT bundled — at runtime the import-map
//      in /admin/index.html redirects each bare specifier to a stub
//      under /admin/runtime/ that hands back the live admin instance.
//      This is what guarantees a single React copy across admin and
//      plugin (required for hooks integrity).
//
//   3. No code-splitting: Rollup might otherwise emit chunks like
//      `react-vendor-<hash>.js`, but our admin only loads `bundle.js`.
//      `output.inlineDynamicImports: true` collapses everything into
//      one file.
//
// Output goes to dist/, then scripts/pack.mjs zips it for upload.

export default defineConfig({
  // JSX → react/jsx-runtime calls (external, provided by the admin).
  // jsxDev: false — otherwise Vite emits react/jsx-dev-runtime calls
  // whenever NODE_ENV isn't "production" in the shell, and the admin
  // (which doesn't map that module) fails with "jsxDEV is not a function".
  esbuild: { jsx: "automatic", jsxDev: false },
  // Vite lib mode doesn't replace `process.env.NODE_ENV` at build time
  // (only app mode does). Any externalised dep that ships a React-style
  // dev/prod branch throws "process is not defined" in the browser
  // without this. Hard-code "production".
  define: {
    "process.env.NODE_ENV": JSON.stringify("production"),
  },
  build: {
    lib: {
      entry: "src/manifest.tsx",
      formats: ["es"],
      fileName: () => "bundle.js",
    },
    outDir: "dist",
    emptyOutDir: true,
    sourcemap: false,
    rollupOptions: {
      external: [
        "react",
        "react/jsx-runtime",
        "react-dom",
        "react-dom/client",
        "react-i18next",
        "@agent-cms/runtime",
      ],
      output: {
        inlineDynamicImports: true,
      },
    },
  },
});
