// Documents the attributes of the corporate/services-grid block for
// `agentcms content blocks corporate/services-grid` (read by agents).

import type { SettingsSchema } from "@agent-cms/runtime";

export const ATTRS_SCHEMA: SettingsSchema = {
  eyebrow: { description: "Small uppercase label above the section heading. Empty = hidden." },
  title: {
    description: "Section heading (<h2>). The block renders nothing when it is empty and no service has a title or description.",
  },
  subtitle: { description: "Paragraph under the section heading. Empty = hidden." },
  services: {
    description:
      "Service cards in a 3-column grid (wraps after 3): [{ icon, title, description, ctaLabel, ctaHref, accent }]. icon = a Material Symbols Outlined glyph name (analytics, cloud_sync, security…; default auto_awesome, empty = no icon); title / description = card text (cards with neither are skipped); ctaLabel + ctaHref = link at the bottom of the card (both needed; href = site path or absolute URL); accent = true for the dark navy highlighted card (the sample flags the middle one).",
    format: "array of objects",
  },
};
