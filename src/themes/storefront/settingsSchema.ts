// Documents the storefront theme's settings for
// `agentcms themes config storefront --schema` (keys = dot paths in
// `settings.themeConfigs.storefront`). `values` lists are closed: the CLI
// refuses anything else, so keep them in sync with config.ts / style.ts.
//
// The default home sections (hero, bento, trending, category rows, shop
// info, journal) only render when `settings.homeMode` is not
// "static-page"; a static home page renders its own blocks instead.

import type { SettingsSchema } from "@agent-cms/runtime";
import { FONT_PRESETS, THEME_VAR_SPECS } from "./style";

// Either font slot accepts any preset name (style.ts merges both buckets).
const FONT_NAMES = [...Object.keys(FONT_PRESETS.serif), ...Object.keys(FONT_PRESETS.sans)];

const LINK = "Root-absolute site path (e.g. /catalog.html) or absolute URL.";

export const SETTINGS_SCHEMA: SettingsSchema = {
  logoEnabled: {
    description: "Managed by the theme — don't set. True once a logo image is uploaded (use `agentcms themes logo storefront <image>` / `--remove`); the header then swaps the wordmark for the image via data/menu.json.",
  },
  logoUpdatedAt: {
    description: "Managed by the theme — don't set. Upload time of the logo (epoch ms), used as its cache-busting ?v= value.",
  },
  "style.vars": {
    description: `CSS variable overrides for the palette, keyed by variable name: ${THEME_VAR_SPECS.map((s) => s.name).join(", ")}. Values are hex colors (#rrggbb or #rgb, converted to RGB triplets in the CSS); empty or missing = theme default. Live once theme-assets/storefront.css is re-uploaded.`,
    format: "map of CSS variable name → hex color",
  },
  "style.fontSerif": {
    description: "Heading font (serif slot), loaded from Google Fonts. Any preset name works in either slot.",
    values: FONT_NAMES,
  },
  "style.fontSans": {
    description: "Body font (sans slot), loaded from Google Fonts. Any preset name works in either slot.",
    values: FONT_NAMES,
  },
  cssUpdatedAt: {
    description: "Managed by the theme — don't set. Time of the last theme CSS upload (epoch ms), baked into the stylesheet link as ?v= on the next publish.",
  },

  // ─── Home: hero ───
  "home.showHero": { description: "Show the full-width hero (image + headline + CTAs) at the top of the default home." },
  "home.hero.imageUrl": { description: "Hero background image. Empty = no image (the hero is skipped when title, subtitle and image are all empty).", format: "image URL" },
  "home.hero.imageAlt": { description: "Alt text of the hero image." },
  "home.hero.eyebrow": { description: "Small uppercase line above the hero title. Empty hides it." },
  "home.hero.title": { description: "Hero headline (first line)." },
  "home.hero.titleItalicTail": { description: "Second headline line, rendered in italics. Empty hides it." },
  "home.hero.subtitle": { description: "Paragraph under the hero headline." },
  "home.hero.primaryCtaLabel": { description: "Primary hero button label; the button shows only when label and link are both set." },
  "home.hero.primaryCtaHref": { description: `Primary hero button link. ${LINK}`, format: "URL" },
  "home.hero.secondaryCtaLabel": { description: "Secondary hero button label; the button shows only when label and link are both set." },
  "home.hero.secondaryCtaHref": { description: `Secondary hero button link. ${LINK}`, format: "URL" },

  // ─── Home: curated collections (bento) ───
  "home.bento.enabled": { description: "Show the 'curated collections' bento grid on the default home." },
  "home.bento.eyebrow": { description: "Small uppercase line above the bento title. Empty hides it." },
  "home.bento.title": { description: "Bento section title." },
  "home.bento.subtitle": { description: "Bento section subtitle." },
  "home.bento.viewAllLabel": { description: "'View all' link label next to the bento title; shown only when label and link are both set." },
  "home.bento.viewAllHref": { description: `'View all' link target. ${LINK}`, format: "URL" },
  "home.bento.cards": {
    description:
      'Bento cards, in order: array of { imageUrl, imageAlt, label, ctaLabel, ctaHref, size } where size is "large" (8 columns) or "small" (4 columns); two cards per row (large + small) give the bento rhythm. A card CTA shows only when ctaLabel and ctaHref are set.',
    format: "array of objects",
  },

  // ─── Home: trending products ───
  "home.trending.enabled": { description: "Show the trending products grid (4 columns of product cards with prices from each post's product-info block)." },
  "home.trending.eyebrow": { description: "Small uppercase line above the trending title." },
  "home.trending.title": { description: "Trending section title." },
  "home.trending.mode": {
    description: "Source of the trending products: all = newest online posts, category = newest posts of home.trending.categoryId (falls back to all when the category has none).",
    values: ["all", "category"],
  },
  "home.trending.categoryId": { description: "Category used when home.trending.mode is \"category\". Empty = all posts.", format: "term id (category)" },
  "home.trending.count": { description: "Number of trending product cards (0 still shows one card).", min: 0 },

  // ─── Home: per-category rows ───
  "home.categoryRows": {
    description:
      'Extra product rows under trending, in order: array of { enabled, eyebrow, title, categoryId, count, layout, viewAllLabel, viewAllHref }. categoryId = category term id (empty = all posts), count = products in the row (1 to 20), layout = "grid" (4 columns) or "slider" (horizontal slider), viewAllHref empty = the category archive URL. Rows with no matching products are skipped.',
    format: "array of objects",
  },

  // ─── Home: shop info ───
  "home.storeInfo.enabled": { description: "Show the physical shop section (photo or map placeholder + address + hours + directions button)." },
  "home.storeInfo.eyebrow": { description: "Small uppercase line above the shop section title." },
  "home.storeInfo.title": { description: "Shop section title." },
  "home.storeInfo.imageUrl": { description: "Photo of the shop. Empty = a stylized 'View map' placeholder card.", format: "image URL" },
  "home.storeInfo.imageAlt": { description: "Alt text of the shop photo." },
  "home.storeInfo.addressLabel": { description: "Heading above the address." },
  "home.storeInfo.address": { description: "Shop address; line breaks (\\n) render as separate lines." },
  "home.storeInfo.hoursLabel": { description: "Heading above the opening hours." },
  "home.storeInfo.hours": { description: "Opening hours, one string per row (e.g. \"Mon – Fri: 9:00 – 19:00\").", format: "array of strings" },
  "home.storeInfo.ctaLabel": { description: "Directions button label; the button shows only when label and link are both set." },
  "home.storeInfo.ctaHref": { description: "Directions button link, typically a Google Maps URL.", format: "URL" },

  // ─── Home: journal feature ───
  "home.journal.enabled": { description: "Show the journal feature (image + copy + CTA) at the bottom of the default home." },
  "home.journal.imageUrl": { description: "Journal feature image. Empty = no image.", format: "image URL" },
  "home.journal.imageAlt": { description: "Alt text of the journal image." },
  "home.journal.eyebrow": { description: "Small uppercase line above the journal title." },
  "home.journal.title": { description: "Journal feature title (first line)." },
  "home.journal.titleItalicTail": { description: "Second title line, rendered in italics. Empty hides it." },
  "home.journal.subtitle": { description: "Journal feature paragraph." },
  "home.journal.ctaLabel": { description: "Journal button label; the button shows only when label and link are both set." },
  "home.journal.ctaHref": { description: `Journal button link. ${LINK}`, format: "URL" },

  // ─── Home: reviews ───
  "home.reviews.enabled": { description: "Home reviews carousel toggle. Not rendered by the home template yet — put a storefront/reviews-list block in a page instead." },
  "home.reviews.eyebrow": { description: "Eyebrow of the home reviews section. Not rendered yet (see home.reviews.enabled)." },
  "home.reviews.title": { description: "Title of the home reviews section. Not rendered yet (see home.reviews.enabled)." },
  "home.reviews.items": {
    description: "Home reviews: array of { authorInitials, authorName, authorRole, rating (1-5), text, dateLabel }. Not rendered yet (see home.reviews.enabled).",
    format: "array of objects",
  },

  // ─── Single product page ───
  "single.showAuthorBio": { description: "Show the author bio card under product pages (filled client-side from data/authors.json)." },
  "single.showRelatedProducts": { description: "Show the related products row (up to 4 products of the same category, filled client-side) under product pages." },
  "single.relatedTitle": { description: "Heading of the related products row. Empty = the translated default ('Curated pairings')." },
  "single.showCareKit": { description: "Show the care-kit sidebar next to the product body (off = the body takes the full width)." },
  "single.careKitTitle": { description: "Care-kit sidebar title." },
  "single.careKitDescription": { description: "Care-kit sidebar paragraph. Empty hides it." },
  "single.careKitItems": { description: "Care-kit bullet list, one string per item. Empty array hides the list.", format: "array of strings" },

  // ─── Product defaults ───
  "productDefaults.currency": {
    description: "Currency of every price (cards, product pages, catalog, products.json) when a product-info block doesn't set its own. Formatted with the site language.",
    format: "ISO 4217 code (EUR, USD, GBP…)",
  },
  "productDefaults.ctaLabel": { description: "Product page button label when a product-info block doesn't set its own." },
  "productDefaults.ctaHref": { description: `Product page button link when a product-info block doesn't set its own. ${LINK}`, format: "URL" },
  "productDefaults.inquiryOnly": { description: "Inquiry-only mode: hide every price on cards and product pages (request-a-quote shops)." },

  // ─── Catalog page ───
  "catalog.enabled": {
    description: "Publish the catalog page (client-side filtered list of every online product) and data/products.json, regenerated on every publish. Off stops regenerating them (already published files stay).",
  },
  "catalog.slug": {
    description: "Path of the catalog page, relative to the site root, no leading slash, ending in .html (e.g. catalog.html or shop/catalog.html). Changing it deletes the page at the old path.",
    format: "site path ending in .html",
  },
  "catalog.pageTitle": { description: "Catalog page <title> and breadcrumb label. Empty = translated 'Catalog' heading." },
  "catalog.pageHeading": { description: "Catalog page H1. Empty = translated default heading." },
  "catalog.pageSubtitle": { description: "Paragraph under the catalog heading, also used as the page meta description." },
  "catalog.addToMenu": { description: "Append a link to the catalog page at the end of the header menu (data/menu.json) while the catalog is enabled." },
  "catalog.menuLabel": { description: "Label of the catalog menu link. Empty = 'Catalog'." },
  "catalog.filters.showSearch": { description: "Show the search box on the catalog page." },
  "catalog.filters.showCategoryFilter": { description: "Show the category filter on the catalog page." },
  "catalog.filters.showTagFilter": { description: "Show the tag filter on the catalog page." },
  "catalog.filters.showPriceRange": { description: "Show the price range filter on the catalog page." },
  "catalog.filters.showStockFilter": { description: "Show the stock status filter on the catalog page." },
  "catalog.filters.showSortBy": { description: "Show the sort dropdown on the catalog page." },
  "catalog.initialColumns": { description: "Number of product columns the catalog grid starts with.", values: [2, 3, 4] },
  "catalog.lastPublishedPath": {
    description: "Managed by the theme — don't set. Path the catalog page was last uploaded to, so a slug change deletes the old file.",
  },
  "catalog.jsonLastGeneratedAt": {
    description: "Managed by the theme — don't set. Time of the last forced catalog + products.json regeneration (epoch ms), shown in the settings page.",
  },

  // ─── Footer ───
  "footer.showSocials": { description: "Show the social icons row under the footer wordmark (currently decorative placeholder links)." },
  "footer.tagline": { description: "Brand tagline under the footer wordmark. Empty = the site description from Settings → General." },
};
