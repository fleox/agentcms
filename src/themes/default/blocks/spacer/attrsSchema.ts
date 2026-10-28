// Documents the attributes of the default/spacer block for
// `agentcms content blocks default/spacer` (read by agents).

import type { SettingsSchema } from "../../../../core/types";

export const ATTRS_SCHEMA: SettingsSchema = {
  size: { description: "Height of the vertical space: sm, md (default) or lg.", values: ["sm", "md", "lg"] },
  divider: { description: "Draw a horizontal rule in the middle of the space (default false).", values: [true, false] },
};
