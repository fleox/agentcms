import { defineConfig } from "vite";

// External theme build config. Same shape as the plugin example —
// library mode + single ESM bundle + externalised runtime deps.
//
// CSS: the manifest imports src/theme.css with `?raw`, so the CSS is a
// string inside bundle.js (manifest.cssText) — that string is what
// "Sync theme assets" uploads to /theme-assets/<id>.css. Never
// `import "./theme.css"` (lib mode would emit a separate file the admin
// never loads). Building the CSS with SCSS/PostCSS? Use `?inline`.

export default defineConfig({
  // JSX → react/jsx-runtime calls (external, provided by the admin).
  // jsxDev: false — otherwise Vite emits react/jsx-dev-runtime calls
  // whenever NODE_ENV isn't "production" in the shell, and the admin
  // (which doesn't map that module) fails with "jsxDEV is not a function".
  esbuild: { jsx: "automatic", jsxDev: false },
  // Vite lib mode doesn't replace `process.env.NODE_ENV` at build time
  // (only app mode does). Any externalised dep that ships a React-style
  // dev/prod branch (most of React's ecosystem) throws "process is not
  // defined" in the browser without this. Hard-code "production"
  // because external bundles only ship production builds.
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
