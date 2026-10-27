# Hello Plugin — AgentCMS external plugin example

Demonstrates how to author a plugin that gets compiled into a single ESM bundle and dropped into an AgentCMS admin via the "Install plugin" upload flow.

## What it does

- Filters `page.head.extra` (a synchronous filter) to inject `<meta name="x-hello-plugin" content="external" />` on every page rendered after install.
- Subscribes to the `publish.complete` action and `console.log`s the post id (single-post publishes only: bulk publishes, imports and *Regenerate all* don't fire it).
- Registers a small dashboard card showing live updating state (proves React hooks work in external bundles).

## Build

```bash
npm install
npm run build
```

Type-checks against the shared `@agent-cms/runtime` types (`types/agentcms-runtime.d.ts` in the AgentCMS repo, mapped in `tsconfig.json`), outputs `./dist/bundle.js` and packs `./hello-plugin.zip` next to it. From the repo root, `node dist/agent/agentcms.mjs ext check external/plugins/hello-plugin` validates the package and renders a demo site with the plugin enabled.

## Install

1. In AgentCMS admin → **Plugins** → click **Install plugin**.
2. Pick `hello-plugin.zip`.
3. After the upload completes the admin reloads. The new card appears on the dashboard. Pages published (or regenerated) from now on carry the meta tag — run **Regenerate → All HTML** to add it to existing pages.

## File layout

```
hello-plugin.zip
├── manifest.json   ← id, name, version, apiVersion, entry
├── bundle.js       ← ESM, default-exports the PluginManifest
└── README.md       ← shown via "Learn more" in the plugins list
```

`manifest.json` controls metadata; `bundle.js` is the single ESM artifact the admin imports at boot. The bundle externalises `react`, `react/jsx-runtime`, `react-dom`, `react-dom/client`, `react-i18next` and `@agent-cms/runtime` — the admin's import-map redirects these to live runtime stubs so there is exactly one React instance in the page (required for hooks integrity).

See `docs/creating-a-plugin.md` in the main repo for the full reference.
