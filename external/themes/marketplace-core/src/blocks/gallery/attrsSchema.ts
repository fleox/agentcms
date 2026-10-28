import type { SettingsSchema } from "@agent-cms/runtime";

// What each attribute of marketplace-core/gallery does (shown by
// `agentcms content blocks`). Keep in sync with render.ts.
export const ATTRS_SCHEMA: SettingsSchema = {
  images: {
    description: "Product gallery: [{ url, alt }]. url = Image URL: a media URL (from `agentcms media upload` → `formats.<name>.url`, e.g. `formats.large.url`) or a site path / absolute URL (the editor picks the \"large\" format). Nothing renders in the body: the images fill the thumbnail strip under the product page's hero image and a lightbox (hero + images). Only works on the theme's single template; items without url are skipped, empty list = no gallery.",
    format: "array of objects",
  },
};
