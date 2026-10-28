// Documents the attributes of storefront/categories-bento for
// `agentcms content blocks storefront/categories-bento` (values are enforced on --attrs).

import type { SettingsSchema } from "@agent-cms/runtime";

export const ATTRS_SCHEMA: SettingsSchema = {
  eyebrow: { description: "Small uppercase label above the section title (empty = hidden)." },
  title: { description: "Serif section title (sample \"Curated collections\"; empty = hidden)." },
  subtitle: { description: "Paragraph under the title (empty = hidden). The header row is omitted when title, subtitle and viewAllLabel are all empty." },
  viewAllLabel: { description: "Text of the \"view all\" link right of the header. Shown only when viewAllHref is also set." },
  viewAllHref: { description: "Target of the \"view all\" link: a site path (\"/shop.html\") or a URL.", format: "site path or URL" },
  cards: {
    description:
      "Bento cards on a 12-column grid: [{ imageUrl, imageAlt, label, ctaLabel, ctaHref, size }]. imageUrl = background image (a full image URL, e.g. a media variant URL from `media upload` (formats.<name>.url) or any external URL); label = serif card title (empty = none); ctaLabel + ctaHref = arrow link at the bottom, shown only when both are set (a site path (\"/shop.html\") or a URL); size = \"large\" (8 columns) or \"small\" (4 columns, also used for any other value) — alternate large/small per row of 12. No cards = the block is hidden.",
    format: "array of objects",
  },
};
