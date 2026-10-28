// Documents the portfolio theme's settings for
// `agentcms themes config portfolio --schema` (keys = dot paths in
// `settings.themeConfigs.portfolio`). `values` lists are closed: the CLI
// refuses anything else, so keep them in sync with config.ts / style.ts.

import type { SettingsSchema } from "@agent-cms/runtime";
import { FONT_PRESETS, THEME_VAR_SPECS } from "./style";

// Either font slot accepts any preset name (style.ts merges both buckets).
const FONT_NAMES = [...Object.keys(FONT_PRESETS.serif), ...Object.keys(FONT_PRESETS.sans)];

export const SETTINGS_SCHEMA: SettingsSchema = {
  "home.heroHeadline": {
    description: "Large display headline above the home project grid. Empty (with an empty intro) hides the hero text section.",
  },
  "home.heroIntro": {
    description: "Intro paragraph under the home headline. Empty (with an empty headline) hides the hero text section.",
  },
  "home.variant": {
    description:
      "Project grid layout on the home and category archives: staggered = 4-column grid with vertical offsets, masonry = asymmetric 12-column masonry, standard = uniform 4-column grid.",
    values: ["staggered", "masonry", "standard"],
  },
  "home.cardLimit": {
    description: "Maximum number of project cards on the home grid (newest first). 0 = every online post.",
    min: 0,
  },
  "home.showFilters": {
    description: "Show category filter chips above the home grid; the public filters loader shows / hides cards per category client-side.",
  },
  "single.showHero": {
    description: "Show the full-bleed hero image (the post's featured image) at the top of every project page.",
  },
  "single.heroGrayscale": {
    description: "Render the project hero photo in black and white (the original look). false = the photo's own colours.",
  },
  "single.showNextProject": {
    description: "Next-project teaser toggle. Not read by the templates yet — the teaser comes from the portfolio/next-project block in the post body.",
  },
  "single.defaultServicesLabel": {
    description: "Default 'Services' label for the project meta column. Not read by the templates yet (the portfolio/project-meta block carries its own labels).",
  },
  "single.defaultYearLabel": {
    description: "Default 'Year' label for the project meta column. Not read by the templates yet (the portfolio/project-meta block carries its own labels).",
  },
  "single.defaultAwardsLabel": {
    description: "Default 'Awards' label for the project meta column. Not read by the templates yet (the portfolio/project-meta block carries its own labels).",
  },
  "author.showExperience": {
    description: "Show the 'Select Experience' list on author archive pages.",
  },
  "author.showRecognition": {
    description: "Show the 'Recognition' list on author archive pages.",
  },
  "footer.copyright": {
    description: "Footer copyright line. Empty = '© <year> <site title>. All rights reserved.'",
  },
  "brand.wordmark": {
    description: "Wordmark text in the header and footer. Empty = the site title in uppercase.",
  },
  "brand.logoEnabled": {
    description: "Managed by the theme — don't set. True once a logo image is uploaded (use `agentcms themes logo portfolio <image>` / `--remove`); the header then swaps the wordmark for the image via data/menu.json.",
  },
  "brand.logoUpdatedAt": {
    description: "Managed by the theme — don't set. Upload time of the logo (epoch ms), used as its cache-busting ?v= value.",
  },
  "style.vars": {
    description: `CSS variable overrides for the palette, keyed by variable name: ${THEME_VAR_SPECS.map((s) => s.name).join(", ")}. Values are hex colors (#rrggbb or #rgb, converted to RGB triplets in the CSS); empty or missing = theme default. Live once theme-assets/portfolio.css is re-uploaded.`,
    format: "map of CSS variable name → hex color",
  },
  "style.fontSerif": {
    description: "Heading (display) font, loaded from Google Fonts. Any preset name works in either slot.",
    values: FONT_NAMES,
  },
  "style.fontSans": {
    description: "Body font, loaded from Google Fonts. Any preset name works in either slot.",
    values: FONT_NAMES,
  },
  cssUpdatedAt: {
    description: "Managed by the theme — don't set. Time of the last theme CSS upload (epoch ms), baked into the stylesheet link as ?v= on the next publish.",
  },
};
