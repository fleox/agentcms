// Documents the attributes of the corporate/feature-stack block for
// `agentcms content blocks corporate/feature-stack` (read by agents).

import type { SettingsSchema } from "@agent-cms/runtime";

export const ATTRS_SCHEMA: SettingsSchema = {
  eyebrow: { description: "Small uppercase label above the section heading. Empty = hidden." },
  title: {
    description: "Section heading (<h2>). The block renders nothing when it is empty and no feature has a title or description.",
  },
  subtitle: { description: "Paragraph under the section heading. Empty = hidden." },
  alternate: {
    description: "true (default) = the image switches side on every other row (right, left, right…); false = image always on the right. A row's imagePosition overrides it.",
    values: [true, false],
  },
  features: {
    description:
      "Image + text rows: [{ icon, eyebrow, title, description, ctaLabel, ctaHref, imageUrl, imageAlt, imagePosition }]. icon = a Material Symbols Outlined glyph name (rocket_launch, insights…; default auto_awesome, empty = no icon); eyebrow = small label above the row title; title / description = row text (rows with neither are skipped); ctaLabel + ctaHref = text link (both needed; href = site path or absolute URL); imageUrl = 16:9 image URL (absolute or site path, e.g. a media variant URL from `media upload` → formats.<name>.url; empty = text only); imageAlt = alt text (defaults to the title); imagePosition = \"left\" or \"right\" to pin the image side, omit for the alternate rule.",
    format: "array of objects",
  },
};
