import type { SettingsSchema } from "@agent-cms/runtime";

// What each attribute of marketplace-core/features does (shown by
// `agentcms content blocks`). Keep in sync with render.ts.
export const ATTRS_SCHEMA: SettingsSchema = {
  heading: { description: "Section heading (h3) above the list. Empty = hidden." },
  items: {
    description: "Feature tiles (icon + short title, for product pages): [{ icon, title }]. icon = a Material Symbols Outlined icon name (\"bolt\", \"palette\", \"devices\"…; empty = \"bolt\"); items without a title are skipped. No item with a title = the whole block (heading included) is hidden.",
    format: "array of objects",
  },
};
