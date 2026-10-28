// Documents the settings of the magazine theme for
// `agentcms themes config magazine --schema` (descriptions read by agents;
// `values` and min/max are enforced by the CLI on --set / --merge).

import type { SettingsSchema } from "@agent-cms/runtime";
import { FONT_PRESETS } from "./style";

const SIDEBAR_VARIANTS = ["most-read", "promo", "none"];
const PROMO = "Promo card of the home sidebar (shown when sidebarTop or sidebarBottom is \"promo\"; the slot is hidden when both promoImageUrl and promoTitle are empty):";

export const SETTINGS_SCHEMA: SettingsSchema = {
  logoEnabled: {
    description:
      "Managed by the theme — don't set: use `themes logo magazine <image>` (or --remove). True once a logo is uploaded; the header then shows it instead of the text wordmark.",
  },
  logoUpdatedAt: {
    description: "Managed by the theme — don't set. Cache-busting ?v= value of the logo URL in data/menu.json.",
  },
  cssUpdatedAt: {
    description:
      "Managed by the theme — don't set. Cache-busting ?v= value of the theme CSS link; existing pages keep the old one until they are regenerated.",
  },
  "style.vars": {
    description:
      "Overrides of the theme's Material 3 color variables, baked into theme-assets/magazine.css, e.g. {\"--color-primary\":\"#1a1a1a\"}; keys are the --color-* entries of cssVariables in --schema. Give hex colors (#rgb or #rrggbb): they are converted to the RGB triplets the CSS uses. An empty value reverts to the default.",
    format: "map of CSS variable → hex color",
  },
  "style.fontSerif": {
    description: "Google Font for headlines and article text (--font-serif).",
    values: Object.keys(FONT_PRESETS.serif),
  },
  "style.fontSans": {
    description: "Google Font for navigation, labels and metadata (--font-sans).",
    values: Object.keys(FONT_PRESETS.sans),
  },
  "home.mostReadCount": {
    description: "Number of posts in the \"Most read\" sidebar widget of the home page (the newest online posts).",
    min: 1,
    max: 10,
  },
  "home.sidebarTop": {
    description:
      "Widget in the top slot of the home sidebar: the most-read list, the promo card, or nothing. Ignored when the home is a static page.",
    values: SIDEBAR_VARIANTS,
  },
  "home.sidebarBottom": {
    description:
      "Widget in the bottom slot of the home sidebar (not rendered twice when it equals sidebarTop). Ignored when the home is a static page.",
    values: SIDEBAR_VARIANTS,
  },
  "home.promoImageUrl": { description: `${PROMO} image URL (Media library or external).`, format: "URL" },
  "home.promoImageAlt": { description: `${PROMO} alt text of the image.` },
  "home.promoEyebrow": { description: `${PROMO} small label above the heading.` },
  "home.promoTitle": { description: `${PROMO} heading.` },
  "home.promoHref": { description: `${PROMO} link target when the card is clicked.`, format: "URL or site path" },
  "home.featuredLabel": {
    description: "Text of the badge on the home hero's featured post. Empty = the theme's default in the site language.",
  },
  "home.latestHeading": {
    description: "Heading of the latest-posts list on the home page. Empty = the theme's default in the site language.",
  },
  "home.mostReadHeading": {
    description: "Heading of the \"Most read\" widget. Empty = the theme's default in the site language.",
  },
  "header.brandPosition": {
    description:
      "Header layout on every page: wordmark centered (burger left, search right) or left-aligned next to the burger. Needs a full regeneration.",
    values: ["centered", "left"],
  },
  "header.showSearch": {
    description:
      "Show the search button in the header of every page (opens the agentcms-search modal; inert without that plugin). Needs a full regeneration.",
  },
};
