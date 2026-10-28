// Documents the attributes of portfolio/storytelling for
// `agentcms content blocks portfolio/storytelling`.

import type { SettingsSchema } from "@agent-cms/runtime";

export const ATTRS_SCHEMA: SettingsSchema = {
  eyebrow: { description: "Small uppercase label above the headline (empty = hidden)." },
  headline: {
    description: "Italic serif headline of the text column (empty = hidden). The block is hidden when headline, body and imageUrl are all empty.",
  },
  body: { description: "Paragraph under the headline, plain text (empty = hidden)." },
  step1Label: { description: "Label of the first process step, e.g. \"01. RESEARCH\". A step is hidden when its label and text are both empty." },
  step1Text: { description: "Text of the first process step." },
  step2Label: { description: "Label of the second process step, e.g. \"02. EXECUTION\"." },
  step2Text: { description: "Text of the second process step." },
  imageUrl: {
    description: "Portrait (4:5) image in the right column — a full image URL, e.g. a media variant URL from `media upload` (formats.<name>.url) or any external URL. Empty = text only.",
    format: "URL",
  },
  imageAlt: { description: "Alt text of the image." },
};
