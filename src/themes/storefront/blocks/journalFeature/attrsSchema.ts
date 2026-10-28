// Documents the attributes of storefront/journal-feature for
// `agentcms content blocks storefront/journal-feature` (values are enforced on --attrs).

import type { SettingsSchema } from "@agent-cms/runtime";

export const ATTRS_SCHEMA: SettingsSchema = {
  imageUrl: { description: "Square image on the left of the 2-column section — a full image URL, e.g. a media variant URL from `media upload` (formats.<name>.url) or any external URL. Empty = no image.", format: "URL" },
  imageAlt: { description: "Alt text of the image." },
  eyebrow: { description: "Small uppercase label above the title (empty = hidden)." },
  title: { description: "Serif headline (empty = hidden). The block is hidden when title, subtitle and imageUrl are all empty." },
  titleItalicTail: { description: "Optional second headline line in italics, under title (only shown with a title)." },
  subtitle: { description: "Paragraph under the headline (empty = hidden)." },
  ctaLabel: { description: "Text of the round-arrow link under the subtitle. Shown only when ctaHref is also set." },
  ctaHref: { description: "Target of the link: a site path (\"/shop.html\") or a URL.", format: "site path or URL" },
};
