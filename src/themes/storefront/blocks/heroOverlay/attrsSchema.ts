// Documents the attributes of storefront/hero-overlay for
// `agentcms content blocks storefront/hero-overlay` (values are enforced on --attrs).

import type { SettingsSchema } from "@agent-cms/runtime";

export const ATTRS_SCHEMA: SettingsSchema = {
  imageUrl: { description: "Full-bleed background image of the hero (loaded eagerly) — a full image URL, e.g. a media variant URL from `media upload` (formats.<name>.url) or any external URL. Empty = no image.", format: "URL" },
  imageAlt: { description: "Alt text of the image." },
  eyebrow: { description: "Small uppercase label above the title (empty = hidden)." },
  title: { description: "Serif headline (empty = hidden). The block is hidden when title, subtitle and imageUrl are all empty." },
  titleItalicTail: { description: "Optional second headline line in italics, under title (only shown with a title)." },
  subtitle: { description: "Paragraph under the headline (empty = hidden)." },
  primaryCtaLabel: { description: "Filled primary button text. The button shows only when primaryCtaHref is also set." },
  primaryCtaHref: { description: "Target of the primary button: a site path (\"/shop.html\") or a URL.", format: "site path or URL" },
  secondaryCtaLabel: { description: "Outlined secondary button text. Shown only when secondaryCtaHref is also set." },
  secondaryCtaHref: { description: "Target of the secondary button: a site path (\"/shop.html\") or a URL.", format: "site path or URL" },
};
