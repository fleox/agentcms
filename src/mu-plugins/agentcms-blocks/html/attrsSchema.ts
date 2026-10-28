// Documents the attributes of the agentcms-blocks/html block for
// `agentcms content blocks agentcms-blocks/html` (read by agents).

import type { SettingsSchema } from "../../../core/types";

export const ATTRS_SCHEMA: SettingsSchema = {
  code: {
    description:
      "Raw HTML (scripts, styles, iframes included) published verbatim in place of the marker, after sanitisation — scripts run in visitors' browsers. Empty = nothing published.",
    format: "HTML",
  },
};
