// Documents the attributes of the default/cta block for
// `agentcms content blocks default/cta` (read by agents).

import type { SettingsSchema } from "../../../../core/types";

export const ATTRS_SCHEMA: SettingsSchema = {
  title: { description: "Heading of the call-to-action box. The block renders nothing when title and description are both empty." },
  description: { description: "Paragraph under the heading. Empty = hidden." },
  buttonLabel: { description: "Button text. The button shows only when both label and URL are set." },
  buttonUrl: { description: "Button link: site path or absolute URL.", format: "URL" },
  variant: { description: "Color scheme: light (default) or dark.", values: ["light", "dark"] },
};
