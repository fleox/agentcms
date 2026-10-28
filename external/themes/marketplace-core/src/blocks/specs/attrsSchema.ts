import type { SettingsSchema } from "@agent-cms/runtime";

// What each attribute of marketplace-core/specs does (shown by
// `agentcms content blocks`). Keep in sync with render.ts.
export const ATTRS_SCHEMA: SettingsSchema = {
  heading: { description: "Section heading (h3) above the table. Empty = hidden." },
  rows: {
    description: "Specification rows: [{ label, value }] (e.g. { label: \"Version\", value: \"1.2.0\" }). Rows with both empty are skipped; no row = the whole block is hidden.",
    format: "array of objects",
  },
};
