// Documents the attributes of the default/category-posts block for
// `agentcms content blocks default/category-posts` (read by agents).

import type { SettingsSchema } from "../../../../core/types";

export const ATTRS_SCHEMA: SettingsSchema = {
  categoryId: {
    description: "Category term id (from `terms list`): shows the newest online posts whose primary category it is. Required — empty, unknown or not a category = block hidden.",
    format: "category term id",
  },
  title: { description: "Heading above the list. Empty = the category name." },
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
  seeMoreLabel: { description: "Text of the \"see more\" link in the header. Empty = no link." },
  seeMoreUrl: { description: "Target of the \"see more\" link: site path or absolute URL. Empty = the category archive.", format: "URL" },
};
