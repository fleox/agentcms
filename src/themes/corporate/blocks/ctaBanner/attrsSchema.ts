// Documents the attributes of the corporate/cta-banner block for
// `agentcms content blocks corporate/cta-banner` (read by agents).

import type { SettingsSchema } from "@agent-cms/runtime";

export const ATTRS_SCHEMA: SettingsSchema = {
  variant: {
    description:
      "Look of the banner: navy = wide navy card with accent glows (default, also used for any unknown value), indigo = narrower solid indigo card.",
    values: ["navy", "indigo"],
  },
  title: {
    description: "Banner headline (<h2>). The block renders nothing when title and subtitle are both empty.",
  },
  subtitle: { description: "Paragraph under the headline. Empty = hidden." },
  primaryCtaLabel: { description: "Primary button text. The button shows only when both label and link are set." },
  primaryCtaHref: { description: "Primary button link: site path (/contact.html) or absolute URL.", format: "URL" },
  secondaryCtaLabel: { description: "Secondary button text. The button shows only when both label and link are set." },
  secondaryCtaHref: { description: "Secondary button link: site path or absolute URL.", format: "URL" },
};
