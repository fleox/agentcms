// Documents the attributes of magazine/promo-card for
// `agentcms content blocks magazine/promo-card` (values are enforced on --attrs).

import type { SettingsSchema } from "@agent-cms/runtime";

export const ATTRS_SCHEMA: SettingsSchema = {
  imageUrl: {
    description:
      "Square background image: a full image URL, e.g. a media variant URL from `media upload` (formats.<name>.url) or any external URL. The whole card is hidden when both imageUrl and title are empty.",
    format: "URL",
  },
  imageAlt: { description: "Alt text of the image (empty = the title)." },
  title: { description: "Headline over the image's gradient (empty = no headline)." },
  eyebrow: {
    description:
      "Small uppercase label above the title. Empty string = no label; a missing key = the localised \"Promoted\".",
  },
  href: {
    description: "Click target of the whole card: a URL or a site path (\"/contact.html\"). Empty = not a link.",
    format: "URL or site path",
  },
};
