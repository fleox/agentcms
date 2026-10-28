// Documents the settings of the default theme for
// `agentcms themes config default --schema` (descriptions read by agents;
// `values` and min/max are enforced by the CLI on --set / --merge).

import type { SettingsSchema } from "../types";
import { FONT_PRESETS } from "./style";

// The font pickers offer every curated font in either slot (a sans face
// can drive the "serif" slot and vice versa).
const FONT_NAMES = [...Object.keys(FONT_PRESETS.serif), ...Object.keys(FONT_PRESETS.sans)];

export const SETTINGS_SCHEMA: SettingsSchema = {
  logoEnabled: {
    description:
      "Managed by the theme — don't set: use `themes logo default <image>` (or --remove). True once a logo is uploaded to theme-assets/default-logo.webp; the header then shows it instead of the text wordmark.",
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
      "Overrides of the theme's CSS variables, baked into theme-assets/default.css, e.g. {\"--color-primary\":\"#1a1a1a\",\"--radius\":\"0.5rem\"}; keys and defaults are listed in cssVariables of --schema. --color-* take a color, --weight-* a font weight (100-900 by steps of 100), --container-max / --gutter / --section-gap / --radius* a CSS length. An empty value reverts to the default.",
    format: "map of CSS variable → value (hex color, font weight or CSS length)",
  },
  "style.fontSerif": {
    description:
      "Google Font of the --font-serif slot (headings and reading text). Any curated font is accepted in either slot.",
    values: FONT_NAMES,
  },
  "style.fontSans": {
    description:
      "Google Font of the --font-sans slot (navigation, metadata, labels). Any curated font is accepted in either slot.",
    values: FONT_NAMES,
  },
  "home.heroVariant": {
    description:
      "Layout of the featured (latest) post at the top of the home page, same variants as the Hero block. Ignored when Settings → Home mode is a static page.",
    values: ["image-overlay", "split-left", "split-right", "minimal"],
  },
  "home.listVariant": {
    description:
      "Layout of the latest-posts list below the hero on the home page (postsPerPage − 1 posts), same variants as the Posts list block. Ignored when the home is a static page.",
    values: ["cards", "list", "compact", "numbered", "slider"],
  },
  "home.listColumns": {
    description: "Number of columns of the home posts list; only used by the \"cards\" variant.",
    min: 1,
    max: 4,
  },
};
