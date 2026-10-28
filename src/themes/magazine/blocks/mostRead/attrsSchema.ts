// Documents the attributes of magazine/most-read for
// `agentcms content blocks magazine/most-read` (values are enforced on --attrs).

import type { SettingsSchema } from "@agent-cms/runtime";

export const ATTRS_SCHEMA: SettingsSchema = {
  count: {
    description: "Number of numbered items (01, 02…) listing the newest online posts, excluding the current page. Clamped to 1–10 (default 4).",
    min: 1,
    max: 10,
  },
  source: {
    description: "Where the items come from. Only \"latest\" (newest online posts) exists today.",
    values: ["latest"],
  },
  showHeading: {
    description:
      "Show the \"Most Read\" heading above the list (localised, or the theme setting home.mostReadHeading). Off when absent.",
  },
};
