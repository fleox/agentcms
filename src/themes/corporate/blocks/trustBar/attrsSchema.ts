// Documents the attributes of the corporate/trust-bar block for
// `agentcms content blocks corporate/trust-bar` (read by agents).

import type { SettingsSchema } from "@agent-cms/runtime";

export const ATTRS_SCHEMA: SettingsSchema = {
  label: { description: "Small uppercase label above the logo row (e.g. \"Trusted by industry leaders\"). Empty = no label." },
  logos: {
    description:
      "Logo row, shown greyscale and faded until hovered: [{ imageUrl, imageAlt, href }]. imageUrl = logo image URL (absolute or site path, e.g. a media variant URL from `media upload` → formats.<name>.url; logos without it are skipped, and the block renders nothing when none has one); imageAlt = alt text (the company name); href = optional link opened in a new tab (empty = static logo).",
    format: "array of objects",
  },
};
