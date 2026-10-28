// Documents the attributes of storefront/product-gallery for
// `agentcms content blocks storefront/product-gallery` (values are enforced on --attrs).

import type { SettingsSchema } from "@agent-cms/runtime";

export const ATTRS_SCHEMA: SettingsSchema = {
  images: {
    description: "Gallery images: [{ url, alt }], url = a full image URL, e.g. a media variant URL from `media upload` (formats.<name>.url) or any external URL. Items without url are skipped; no images = the block is hidden.",
    format: "array of objects",
  },
  primaryFeatured: {
    description: "true = the first image is shown large with the others as a 4-column thumbnail strip below (needs 2+ images); false = uniform 2/3-column grid.",
  },
};
