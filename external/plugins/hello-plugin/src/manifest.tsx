// External plugin sample. Demonstrates:
//   - Hooking page.head.extra (a SYNC filter) to add a meta tag to every
//     page rendered from now on
//   - Subscribing to publish.complete to log activity
//   - Contributing a dashboard card with its own React component
//
// Build: `npm run build` type-checks, produces ./dist/bundle.js (the
// runtime-loaded ESM module) and packs ./hello-plugin.zip for the
// admin's "Install plugin" button.

import { useEffect, useState } from "react";
import type { PluginManifest, Post } from "@agent-cms/runtime";
import readme from "../README.md?raw";

// Tiny dashboard card showing how external plugins contribute UI.
// Admin-side markup can only use CSS classes the admin already ships
// (`card`, `btn`, `input`, utilities used by the admin itself): the
// admin's Tailwind build never scans this bundle.
function HelloCard() {
  const [tick, setTick] = useState(0);
  useEffect(() => {
    const id = window.setInterval(() => setTick((n) => n + 1), 1000);
    return () => window.clearInterval(id);
  }, []);
  return (
    <div className="card p-4">
      <p className="text-sm font-semibold">Hello from external plugin</p>
      <p className="text-xs text-surface-500 mt-1 dark:text-surface-400">
        This card is contributed by an externally-loaded plugin. Tick:{" "}
        {tick}
      </p>
    </div>
  );
}

const manifest: PluginManifest = {
  id: "hello-plugin",
  name: "Hello Plugin",
  version: "1.0.1",
  description:
    "Sample external plugin — injects a meta tag on every published page and shows a dashboard card.",
  author: "AgentCMS",
  readme,
  // register() runs again on every settings change: only api.* calls here.
  register(api) {
    // SYNC filter (no async function): append to what other plugins
    // already produced — never return only your own string.
    api.addFilter<string>("page.head.extra", (head) =>
      [head, '<meta name="x-hello-plugin" content="external" />'].filter(Boolean).join("\n"),
    );
    // Action: log every single-post publish. Not fired for bulk
    // publishes, imports or "Regenerate all" — plugins that maintain
    // derived files also register api.registerRegenerationTarget(...).
    api.addAction("publish.complete", (post) => {
      // eslint-disable-next-line no-console
      console.log("[hello-plugin] published:", (post as Post).id);
    });
    // Dashboard card — same registry as built-in cards.
    api.registerDashboardCard({
      id: "hello-plugin/card",
      priority: 50,
      component: HelloCard,
    });
  },
};

export default manifest;
