// Documents the marketplace-core theme's settings for
// `agentcms themes config marketplace-core --schema` (keys = dot paths in
// `settings.themeConfigs["marketplace-core"]`). `values` lists are closed:
// the CLI refuses anything else, so keep them in sync with config.ts /
// style.ts.

import type { SettingsSchema } from "@agent-cms/runtime";
import { FONT_PRESETS } from "./style";

// Either font slot accepts any preset name (style.ts merges both buckets).
const FONT_NAMES = [...Object.keys(FONT_PRESETS.sans), ...Object.keys(FONT_PRESETS.serif)];

const SIDEBAR_ITEMS =
  "array of { icon, label, href, translations? }: icon = Material Symbols name (empty = no icon), href = root-absolute path (prefixed with /<lang> on secondary-language pages) or absolute URL, translations = optional { <lang>: { label?, href? } } overrides keyed by 2-letter language code (multilang).";

export const SETTINGS_SCHEMA: SettingsSchema = {
  // ─── Home ───
  "home.heroEyebrow": { description: "Small uppercase line above the home hero headline. Empty hides it." },
  "home.heroHeadline": { description: "Home hero headline. The hero shows when the headline or the intro is set." },
  "home.heroIntro": { description: "Home hero intro paragraph. The hero shows when the headline or the intro is set." },
  "home.featuredCategorySlug": {
    description: "Category whose posts feed the first home section ('Featured Plugins'), linked to /<slug>/index.html. Empty or a 0 count hides the section.",
    format: "category slug (top-level URL segment)",
  },
  "home.featuredHeading": { description: "Heading of the featured section." },
  "home.featuredCount": { description: "Number of cards in the featured section. 0 hides it.", min: 0 },
  "home.newCategorySlug": {
    description: "Category whose posts feed the second home section ('New Themes'), linked to /<slug>/index.html. Empty or a 0 count hides the section.",
    format: "category slug (top-level URL segment)",
  },
  "home.newHeading": { description: "Heading of the second home section." },
  "home.newCount": { description: "Number of cards in the second home section. 0 hides it.", min: 0 },
  "home.showRecentlyUpdated": { description: "Show a third home section with the latest posts across all categories." },
  "home.recentlyUpdatedHeading": { description: "Heading of the recently updated section." },
  "home.recentlyUpdatedCount": { description: "Number of cards in the recently updated section.", min: 0 },

  // ─── Single ───
  "single.descriptionLabel": { description: "'Description' section label. Not read by the templates yet." },
  "single.specificationsLabel": { description: "'Specifications' section label. Not read by the templates yet (the specs block carries its own title)." },
  "single.featuresLabel": { description: "'Key Features' section label. Not read by the templates yet (the features block carries its own title)." },
  "single.downloadLabel": { description: "'Download' button label. Not read by the templates yet (the header-buttons block carries its own labels)." },
  "single.previewLabel": { description: "'Live Preview' button label. Not read by the templates yet (the header-buttons block carries its own labels)." },
  "single.freeBadgeLabel": { description: "'Free' badge label. Not read by the templates yet." },
  "single.showSpecs": { description: "Specifications block toggle. Not read by the templates yet." },
  "single.showFeatures": { description: "Key features block toggle. Not read by the templates yet." },

  // ─── Sidebar (desktop left navigation) ───
  "sidebar.heading": { description: "Heading of the sidebar's top group ('Discover')." },
  "sidebar.topItems": { description: `Links of the sidebar's top group: ${SIDEBAR_ITEMS} Empty array hides the group.`, format: "array of objects" },
  "sidebar.categoriesHeading": { description: "Heading of the sidebar's categories group." },
  "sidebar.categoriesItems": { description: `Links of the sidebar's categories group: ${SIDEBAR_ITEMS} Empty array hides the group.`, format: "array of objects" },
  "sidebar.docsHeading": { description: "Heading of the sidebar's documentation group." },
  "sidebar.docsItems": { description: `Links of the sidebar's documentation group: ${SIDEBAR_ITEMS} Empty array hides the group.`, format: "array of objects" },
  "sidebar.headingTranslations": {
    description: "Per-language sidebar headings: { <lang>: { heading?, categoriesHeading?, docsHeading? } } keyed by 2-letter language code; missing entries fall back to the primary headings.",
    format: "map of language code → headings",
  },

  // ─── Footer / brand ───
  "footer.copyright": { description: "Footer copyright line. Empty = '© <year> <site title>.'" },
  "brand.wordmark": { description: "Wordmark text in the header and footer. Empty = the site title." },

  // ─── Style ───
  "style.vars": {
    description:
      "CSS variable overrides keyed by variable name (the settings page edits --color-primary, --color-secondary, --color-tertiary, --color-background, --color-on-surface; any --color-* variable of theme.css works). --color-* values are hex colors (converted to RGB triplets); other variables are written verbatim. Empty or missing = theme default. Live once theme-assets/marketplace-core.css is re-uploaded.",
    format: "map of CSS variable name → hex color",
  },
  "style.fontHeadline": {
    description: "Headline font, loaded from Google Fonts. Any preset name works in either slot.",
    values: FONT_NAMES,
  },
  "style.fontBody": {
    description: "Body font, loaded from Google Fonts. Any preset name works in either slot.",
    values: FONT_NAMES,
  },
};
