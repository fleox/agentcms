// Documents the attributes of the corporate/contact-info block for
// `agentcms content blocks corporate/contact-info` (read by agents).

import type { SettingsSchema } from "@agent-cms/runtime";

export const ATTRS_SCHEMA: SettingsSchema = {
  heading: { description: "Card heading (e.g. \"Contact information\"). Empty = hidden." },
  addressLines: {
    description:
      "Address row (location icon, titled \"Address\"). Plain text, \\n = line break. Empty = row hidden. The block renders nothing when address, phone, email and socials are all empty.",
  },
  phoneLines: { description: "Phone row (titled \"Phone\"). Plain text, \\n = line break (not a tel: link). Empty = row hidden." },
  emailLines: { description: "Email row (titled \"Email\"). Plain text, \\n = line break (not a mailto: link). Empty = row hidden." },
  socialsLabel: { description: "Small uppercase label above the social icons. Empty = hidden." },
  socials: {
    description:
      "Round social icon links under the card: [{ icon, href, ariaLabel }]. icon = a Material Symbols Outlined glyph name (share, language, hub, mail…; brand logos are not in that font; default share); href = link opened in a new tab (absolute URL; default #); ariaLabel = accessible name (e.g. \"LinkedIn\"). Entries with neither icon nor href are skipped; empty array = no socials strip.",
    format: "array of objects",
  },
};
