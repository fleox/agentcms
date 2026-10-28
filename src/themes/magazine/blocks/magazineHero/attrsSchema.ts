// Documents the attributes of magazine/hero-split for
// `agentcms content blocks magazine/hero-split` (values are enforced on --attrs).

import type { SettingsSchema } from "@agent-cms/runtime";

export const ATTRS_SCHEMA: SettingsSchema = {
  featuredPostId: {
    description:
      "Big 8-column featured article (large image, title, excerpt). \"latest\" = newest online post; otherwise the id of an online post (an unknown or offline id falls back to the newest).",
    format: "\"latest\" or post id",
  },
  secondary1PostId: {
    description:
      "Top-right card with image + category + title. \"auto\" = next newest online post not already shown; otherwise the id of an online post (unknown/offline id = auto).",
    format: "\"auto\" or post id",
  },
  secondary2PostId: {
    description:
      "Bottom-right text-only card with category, title and author byline. \"auto\" = next newest online post not already shown; otherwise an online post id (unknown/offline id = auto).",
    format: "\"auto\" or post id",
  },
  showCategory: { description: "Show the primary category name above each title (default true)." },
  showAuthor: { description: "Show the author name under the bottom-right card (default true)." },
  showFeaturedBadge: {
    description:
      "Overlay a \"FEATURED\" badge on the featured image (localised, or the theme setting home.featuredLabel). Only shown when the post has a featured image. Default true.",
  },
};
