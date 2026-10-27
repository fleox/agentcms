import { defineConfig } from "vite";

// Same external-plugin build config as hello-plugin — single ESM
// bundle that default-exports the manifest, with React + cms-runtime
// externalised so they resolve to the live admin instances at runtime.
export default defineConfig({
  // JSX → react/jsx-runtime calls (external, provided by the admin).
  // jsxDev: false — otherwise Vite emits react/jsx-dev-runtime calls
  // whenever NODE_ENV isn't "production" in the shell, and the admin
  // (which doesn't map that module) fails with "jsxDEV is not a function".
  esbuild: { jsx: "automatic", jsxDev: false },
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
