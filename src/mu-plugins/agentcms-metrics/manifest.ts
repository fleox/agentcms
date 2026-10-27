import type { PluginManifest } from "../../plugins";
import { en, fr, de, es, nl, pt, ko } from "./i18n";
import { FirestoreCard } from "./FirestoreCard";
import readme from "./README.md?raw";

const PLUGIN_ID = "agentcms-metrics";

export const manifest: PluginManifest = {
  id: PLUGIN_ID,
  name: "Metrics",
  version: "1.0.0",
  author: "AgentCMS",
  description:
    "Adds a content card to the admin dashboard: document counts per collection.",
  readme,
  i18n: { en, fr, de, es, nl, pt, ko },
  register(api) {
    api.registerDashboardCard({
      id: `${PLUGIN_ID}/firestore`,
      priority: 20,
      component: FirestoreCard,
    });
  },
};
