import type { SettingsSchema } from "@agent-cms/runtime";

// What each attribute of marketplace-core/feature-grid does (shown by
// `agentcms content blocks`). Keep in sync with render.ts.
export const ATTRS_SCHEMA: SettingsSchema = {
  heading: { description: "Section heading (h2) above the cards. Empty = hidden." },
  subhead: { description: "Paragraph under the heading. Empty = hidden." },
  items: {
    description: "Cards, 3 per row on desktop: [{ icon, title, body }]. icon = a Material Symbols Outlined icon name (\"bolt\", \"language\", \"shield\"…; empty = \"bolt\"); title is required (items without one are skipped); body = optional 1-2 sentences. No item with a title = the whole block is hidden.",
    format: "array of objects",
  },
};
