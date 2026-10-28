// Documents the attributes of the corporate/stats-grid block for
// `agentcms content blocks corporate/stats-grid` (read by agents).

import type { SettingsSchema } from "@agent-cms/runtime";

export const ATTRS_SCHEMA: SettingsSchema = {
  eyebrow: { description: "Small uppercase label above the section heading. Empty = hidden." },
  title: {
    description: "Section heading (<h2>). The block renders nothing when it is empty and no stat has a value or label.",
  },
  subtitle: { description: "Paragraph under the section heading. Empty = hidden." },
  stats: {
    description:
      "Key figures in a 1–4 column grid (4+ items = 4 columns): [{ value, label }]. value = the big figure as text (\"500+\", \"30%\", \"24/7\"); label = the caption under it. Items with neither are skipped.",
    format: "array of objects",
  },
};
