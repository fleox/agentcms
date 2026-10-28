// Documents the attributes of the default/posts-list block for
// `agentcms content blocks default/posts-list` (read by agents).

import type { SettingsSchema } from "../../../../core/types";

export const ATTRS_SCHEMA: SettingsSchema = {
  title: { description: "Heading above the list. Empty = no heading." },
  query: {
    description:
      "Which posts: latest = newest online posts (default), by-tag = posts carrying tagId, by-author = posts by authorId. Without the matching id the filter is ignored (latest). The current page is always excluded; no match = block hidden.",
    values: ["latest", "by-tag", "by-author"],
  },
  tagId: { description: "Term id (a tag, from `terms list`) used by query by-tag.", format: "term id" },
  authorId: { description: "User id (from `users list`) used by query by-author.", format: "user id" },
  count: { description: "Maximum number of posts shown (clamped to 1–24).", min: 1, max: 24 },
  variant: {
    description: "Layout of the items: cards = image cards in a grid (default; uses columns), list = rows with a small image and excerpt, compact = title + date links, numbered = 01/02/… ranked titles, slider = horizontal scroller of image cards.",
    values: ["cards", "list", "compact", "numbered", "slider"],
  },
  columns: {
    description: "Grid columns of the cards variant (clamped to 1–4; default 2). Ignored by the other variants.",
    min: 1,
    max: 4,
  },
  showExcerpt: { description: "Show the post excerpts in the cards and list variants (default true).", values: [true, false] },
  excludeUsed: {
    description: "Skip posts already shown by an earlier block of the page (or featured by a hero) so a post never appears twice (default true).",
    values: [true, false],
  },
  seeMoreLabel: { description: "Text of the \"see more\" link in the header. The link shows only when both label and URL are set." },
  seeMoreUrl: { description: "Target of the \"see more\" link: site path or absolute URL.", format: "URL" },
};
