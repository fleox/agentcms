// Documents the attributes of the default/categories-pills block for
// `agentcms content blocks default/categories-pills` (read by agents).

import type { SettingsSchema } from "../../../../core/types";

export const ATTRS_SCHEMA: SettingsSchema = {
  title: { description: "Heading above the links (e.g. \"Explore topics\"). Empty = no heading. Every category is listed (alphabetically, tags excluded); no category = block hidden." },
  style: { description: "Presentation of the category links: pills (default) or list.", values: ["pills", "list"] },
};
