import type { SettingsSchema } from "@agent-cms/runtime";

// What each attribute of marketplace-core/feature-row does (shown by
// `agentcms content blocks`). Keep in sync with render.ts.
export const ATTRS_SCHEMA: SettingsSchema = {
  imagePosition: {
    description: "Side of the image (copy goes on the other side). Alternate it between consecutive rows; anything but \"left\" renders as \"right\".",
    values: ["left", "right"],
  },
  eyebrow: { description: "Small label above the headline. Empty = hidden." },
  headline: { description: "Row headline (h2). Required: empty = the whole block is hidden." },
  body: { description: "Paragraph under the headline. Empty = hidden." },
  bullets: {
    description: "Checklist under the body: [\"text\", …], each shown with a check icon. Empty strings are skipped; empty list = hidden.",
    format: "array of strings",
  },
  ctaLabel: { description: "Text of the arrow link under the copy. Hidden unless ctaHref is set too." },
  ctaHref: { description: "Target of the link: URL or site path.", format: "URL or site path" },
  imageUrl: { description: "Image URL: a media URL (from `agentcms media upload` → `formats.<name>.url`, e.g. `formats.large.url`) or a site path / absolute URL. Empty = no image column.", format: "media URL" },
  imageAlt: { description: "Image alt text. Empty = the headline." },
};
