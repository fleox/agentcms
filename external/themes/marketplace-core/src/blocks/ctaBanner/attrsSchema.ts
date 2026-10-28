import type { SettingsSchema } from "@agent-cms/runtime";

// What each attribute of marketplace-core/cta-banner does (shown by
// `agentcms content blocks`). Keep in sync with render.ts.
export const ATTRS_SCHEMA: SettingsSchema = {
  headline: { description: "Banner headline (h2). Required: empty = the whole block is hidden." },
  body: { description: "Short paragraph under the headline. Empty = hidden." },
  primaryCta: {
    description: "Primary (filled) button: { label, href }. href is a URL or site path (\"/contact.html\"). Hidden unless both label and href are set.",
    format: "object",
  },
  secondaryCta: {
    description: "Secondary (ghost) button: { label, href }. Same rules as primaryCta.",
    format: "object",
  },
};
