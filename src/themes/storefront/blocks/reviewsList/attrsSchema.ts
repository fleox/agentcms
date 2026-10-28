// Documents the attributes of storefront/reviews-list for
// `agentcms content blocks storefront/reviews-list` (values are enforced on --attrs).

import type { SettingsSchema } from "@agent-cms/runtime";

export const ATTRS_SCHEMA: SettingsSchema = {
  eyebrow: { description: "Small uppercase label above the section title (empty = hidden)." },
  title: { description: "Serif section title (sample \"Client impressions\"; empty = hidden)." },
  writeReviewLabel: { description: "Text of the \"write a review\" link in the header. Shown only when writeReviewHref is also set." },
  writeReviewHref: { description: "Target of that link: a site path (\"/shop.html\") or a URL (or mailto:).", format: "site path or URL" },
  reviews: {
    description:
      "Review cards (2 columns on desktop): [{ authorName, authorRole, authorInitials, authorAvatarUrl, rating, text, dateLabel }]. authorAvatarUrl = round avatar (a full image URL, e.g. a media variant URL from `media upload` (formats.<name>.url) or any external URL); empty = a circle with authorInitials (empty = first 2 letters of authorName). rating = stars from 0 to 5, halves allowed (4.5). text = quote; dateLabel = free text (\"March 2025\"). Reviews with neither text nor authorName are skipped; none = the block is hidden.",
    format: "array of objects",
  },
};
