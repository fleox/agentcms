import type { SettingsSchema } from "@agent-cms/runtime";

// What each attribute of marketplace-core/landing-hero does (shown by
// `agentcms content blocks`). Keep in sync with render.ts.
export const ATTRS_SCHEMA: SettingsSchema = {
  eyebrow: { description: "Small label above the headline. Empty = hidden." },
  headline: { description: "Hero headline, rendered as the page's h1. Required: empty = the whole block is hidden." },
  subhead: { description: "Paragraph under the headline. Empty = hidden." },
  primaryCta: {
    description: "Primary (filled) button: { label, href }. href is a URL or site path. Hidden unless both label and href are set.",
    format: "object",
  },
  secondaryCta: {
    description: "Secondary (outlined) button: { label, href }. Same rules as primaryCta.",
    format: "object",
  },
  imageUrl: { description: "Image URL: a media URL (from `agentcms media upload` → `formats.<name>.url`, e.g. `formats.large.url`) or a site path / absolute URL. Shown in the right column; empty = text only.", format: "media URL" },
  imageAlt: { description: "Image alt text. Empty = the headline." },
};
