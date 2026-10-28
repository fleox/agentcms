// Documents the attributes of the corporate/hero-overlay block for
// `agentcms content blocks corporate/hero-overlay` (read by agents).

import type { SettingsSchema } from "@agent-cms/runtime";

export const ATTRS_SCHEMA: SettingsSchema = {
  imageUrl: {
    description:
      "Full-width background image behind a navy gradient. Absolute URL or site path (e.g. a media variant URL from `media upload` → formats.<name>.url). Empty = solid navy gradient. The block renders nothing when imageUrl, title and subtitle are all empty.",
    format: "URL",
  },
  imageAlt: { description: "Alt text of the background image." },
  eyebrow: { description: "Small uppercase pill label above the headline. Empty = hidden." },
  title: { description: "Main headline (the page's <h1>). Empty = hidden." },
  subtitle: { description: "Lede paragraph under the headline. Empty = hidden." },
  primaryCtaLabel: { description: "Primary (filled) button text. The button shows only when both label and link are set." },
  primaryCtaHref: { description: "Primary button link: site path (/contact.html) or absolute URL.", format: "URL" },
  secondaryCtaLabel: { description: "Secondary (outlined) button text. The button shows only when both label and link are set." },
  secondaryCtaHref: { description: "Secondary button link: site path or absolute URL.", format: "URL" },
};
