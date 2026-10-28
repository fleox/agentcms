// Documents the attributes of the corporate/hero-split block for
// `agentcms content blocks corporate/hero-split` (read by agents).

import type { SettingsSchema } from "@agent-cms/runtime";

export const ATTRS_SCHEMA: SettingsSchema = {
  eyebrow: { description: "Small uppercase label above the headline. Empty = hidden." },
  title: {
    description: "Main headline (the page's <h1>, navy on the light background). The block renders nothing when title and subtitle are both empty.",
  },
  subtitle: { description: "Lede paragraph under the headline. Empty = hidden." },
  primaryCtaLabel: { description: "Primary (filled) button text. The button shows only when both label and link are set." },
  primaryCtaHref: { description: "Primary button link: site path (/contact.html) or absolute URL.", format: "URL" },
  secondaryCtaLabel: { description: "Secondary (outlined) button text. The button shows only when both label and link are set." },
  secondaryCtaHref: { description: "Secondary button link: site path or absolute URL.", format: "URL" },
  imageUrl: {
    description:
      "Decorative image faded (10% opacity) into the right half. Absolute URL or site path (e.g. a media variant URL from `media upload` → formats.<name>.url). Empty = text-only hero.",
    format: "URL",
  },
  imageAlt: { description: "Alt text of the decorative image." },
};
