// Documents the attributes of portfolio/bento-gallery for
// `agentcms content blocks portfolio/bento-gallery`.

import type { SettingsSchema } from "@agent-cms/runtime";

export const ATTRS_SCHEMA: SettingsSchema = {
  mainImageUrl: {
    description:
      "Large 8-column image (4:3) of the top row — a full image URL, e.g. a media variant URL from `media upload` (formats.<name>.url) or any external URL. Spans the full row when both sub images are empty. The whole block is hidden when every image URL is empty.",
    format: "URL",
  },
  mainImageAlt: { description: "Alt text of the main image." },
  subTopImageUrl: {
    description: "Upper of the two stacked 4-column images right of the main one — a full image URL, e.g. a media variant URL from `media upload` (formats.<name>.url) or any external URL. Empty = an empty grey cell while the other sub image is set.",
    format: "URL",
  },
  subTopImageAlt: { description: "Alt text of the upper sub image." },
  subTopGrayscale: { description: "Render the upper sub image in grayscale (default true)." },
  subBottomImageUrl: {
    description: "Lower of the two stacked 4-column images — a full image URL, e.g. a media variant URL from `media upload` (formats.<name>.url) or any external URL. Empty = an empty grey cell while the upper sub image is set.",
    format: "URL",
  },
  subBottomImageAlt: { description: "Alt text of the lower sub image." },
  wideImageUrl: {
    description: "Full-width 16:9 image below the top row — a full image URL, e.g. a media variant URL from `media upload` (formats.<name>.url) or any external URL. Empty = no wide row.",
    format: "URL",
  },
  wideImageAlt: { description: "Alt text of the wide image." },
};
