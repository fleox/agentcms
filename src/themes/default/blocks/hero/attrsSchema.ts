// Documents the attributes of the default/hero block for
// `agentcms content blocks default/hero` (read by agents).

import type { SettingsSchema } from "../../../../core/types";

export const ATTRS_SCHEMA: SettingsSchema = {
  featuredPostId: {
    description:
      "Post to feature: \"latest\" (default) = the newest online post other than the current page, or a post id (from `content list`). A draft or unknown id falls back to latest. The featured post is excluded from list blocks on the same page; no online post = block hidden.",
    format: "\"latest\" or post id",
  },
  variant: {
    description:
      "Layout: image-overlay = title over the post's hero image (default), split-left / split-right = image beside the text on that side, minimal = text only, no image.",
    values: ["image-overlay", "split-left", "split-right", "minimal"],
  },
  showCategory: {
    description: "Show the post's primary category as a link above the title (default true).",
    values: [true, false],
  },
};
