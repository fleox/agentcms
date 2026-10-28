// Documents the attributes of the corporate/testimonials block for
// `agentcms content blocks corporate/testimonials` (read by agents).

import type { SettingsSchema } from "@agent-cms/runtime";

export const ATTRS_SCHEMA: SettingsSchema = {
  variant: {
    description:
      "Look of the section: glass = frosted cards on a light surface (default, also used for any unknown value), navy = navy section with darker cards.",
    values: ["glass", "navy"],
  },
  eyebrow: { description: "Small uppercase label above the section heading. Empty = hidden." },
  title: {
    description: "Section heading (<h2>). The block renders nothing when it is empty and no testimonial has a quote or author name.",
  },
  subtitle: { description: "Paragraph under the section heading. Empty = hidden." },
  testimonials: {
    description:
      "Testimonial cards (1–3 columns depending on count): [{ quote, authorName, authorTitle, authorAvatarUrl, authorAvatarAlt, rating }]. quote = text without quote marks; authorName = name (cards with neither quote nor name are skipped); authorTitle = role / company line (empty = hidden); authorAvatarUrl = avatar image URL (absolute or site path, e.g. a media variant URL; empty = initials of the name); authorAvatarAlt = avatar alt text (defaults to the name); rating = number of filled stars 1–5 (rounded and clamped to 0–5, default 5).",
    format: "array of objects",
  },
};
