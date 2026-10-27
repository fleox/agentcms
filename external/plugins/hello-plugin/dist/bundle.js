import { jsxs as t, jsx as l } from "react/jsx-runtime";
import { useState as s, useEffect as o } from "react";
const r = '# Hello Plugin — AgentCMS external plugin example\n\nDemonstrates how to author a plugin that gets compiled into a single ESM bundle and dropped into an AgentCMS admin via the "Install plugin" upload flow.\n\n## What it does\n\n- Filters `page.head.extra` (a synchronous filter) to inject `<meta name="x-hello-plugin" content="external" />` on every page rendered after install.\n- Subscribes to the `publish.complete` action and `console.log`s the post id (single-post publishes only: bulk publishes, imports and *Regenerate all* don\'t fire it).\n- Registers a small dashboard card showing live updating state (proves React hooks work in external bundles).\n\n## Build\n\n```bash\nnpm install\nnpm run build\n```\n\nType-checks against the shared `@agent-cms/runtime` types (`types/agentcms-runtime.d.ts` in the AgentCMS repo, mapped in `tsconfig.json`), outputs `./dist/bundle.js` and packs `./hello-plugin.zip` next to it. From the repo root, `node dist/agent/agentcms.mjs ext check external/plugins/hello-plugin` validates the package and renders a demo site with the plugin enabled.\n\n## Install\n\n1. In AgentCMS admin → **Plugins** → click **Install plugin**.\n2. Pick `hello-plugin.zip`.\n3. After the upload completes the admin reloads. The new card appears on the dashboard. Pages published (or regenerated) from now on carry the meta tag — run **Regenerate → All HTML** to add it to existing pages.\n\n## File layout\n\n```\nhello-plugin.zip\n├── manifest.json   ← id, name, version, apiVersion, entry\n├── bundle.js       ← ESM, default-exports the PluginManifest\n└── README.md       ← shown via "Learn more" in the plugins list\n```\n\n`manifest.json` controls metadata; `bundle.js` is the single ESM artifact the admin imports at boot. The bundle externalises `react`, `react/jsx-runtime`, `react-dom`, `react-dom/client`, `react-i18next` and `@agent-cms/runtime` — the admin\'s import-map redirects these to live runtime stubs so there is exactly one React instance in the page (required for hooks integrity).\n\nSee `docs/creating-a-plugin.md` in the main repo for the full reference.\n';
function d() {
  const [e, n] = s(0);
  return o(() => {
    const a = window.setInterval(() => n((i) => i + 1), 1e3);
    return () => window.clearInterval(a);
  }, []), /* @__PURE__ */ t("div", { className: "card p-4", children: [
    /* @__PURE__ */ l("p", { className: "text-sm font-semibold", children: "Hello from external plugin" }),
    /* @__PURE__ */ t("p", { className: "text-xs text-surface-500 mt-1 dark:text-surface-400", children: [
      "This card is contributed by an externally-loaded plugin. Tick:",
      " ",
      e
    ] })
  ] });
}
const u = {
  id: "hello-plugin",
  name: "Hello Plugin",
  version: "1.0.1",
  description: "Sample external plugin — injects a meta tag on every published page and shows a dashboard card.",
  author: "AgentCMS",
  readme: r,
  // register() runs again on every settings change: only api.* calls here.
  register(e) {
    e.addFilter(
      "page.head.extra",
      (n) => [n, '<meta name="x-hello-plugin" content="external" />'].filter(Boolean).join(`
`)
    ), e.addAction("publish.complete", (n) => {
      console.log("[hello-plugin] published:", n.id);
    }), e.registerDashboardCard({
      id: "hello-plugin/card",
      priority: 50,
      component: d
    });
  }
};
export {
  u as default
};
