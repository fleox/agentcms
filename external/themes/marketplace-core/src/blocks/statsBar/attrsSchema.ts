import type { SettingsSchema } from "@agent-cms/runtime";

// What each attribute of marketplace-core/stats-bar does (shown by
// `agentcms content blocks`). Keep in sync with render.ts.
export const ATTRS_SCHEMA: SettingsSchema = {
  items: {
    description: "Stats in one strip (2 columns on mobile): [{ value, label }]. value = the big text (\"10k\", \"MIT\", \"∞\"), label = the caption under it. Items with both empty are skipped; no item = the whole block is hidden.",
    format: "array of objects",
  },
};
