// Documents the settings of the corporate theme for
// `agentcms themes config corporate --schema` (descriptions read by agents;
// `values` and min/max are enforced by the CLI on --set / --merge).

import type { SettingsSchema } from "@agent-cms/runtime";
import { FONT_PRESETS } from "./style";

const HERO = "Home hero (full-width image with a navy gradient):";
const FEATURED = "Featured posts grid of the home page:";
const TESTIMONIALS = "Testimonials section of the home page:";
const SIDEBAR = "Sidebar of every single-post page:";

export const SETTINGS_SCHEMA: SettingsSchema = {
  logoEnabled: {
    description:
      "Managed by the theme — don't set: use `themes logo corporate <image>` (or --remove). True once a logo is uploaded; the header then shows it instead of the text wordmark.",
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
      "Overrides of the theme's Material 3 color variables, baked into theme-assets/corporate.css, e.g. {\"--color-primary\":\"#0b1f3a\"}; keys are the --color-* entries of cssVariables in --schema. Give hex colors (#rgb or #rrggbb): they are converted to the RGB triplets the CSS uses. An empty value reverts to the default.",
    format: "map of CSS variable → hex color",
  },
  "style.fontSans": {
    description: "The theme's single Google Font, used for every text (--font-sans).",
    values: Object.keys(FONT_PRESETS.sans),
  },
  "home.showHero": {
    description:
      "Show the hero at the top of the home page. All home.* settings are ignored when Settings → Home mode is a static page (its body is the home).",
  },
  "home.hero.imageUrl": {
    description: `${HERO} background image URL (Media library or external). Empty = a solid navy hero.`,
    format: "URL",
  },
  "home.hero.imageAlt": { description: `${HERO} alt text of the background image.` },
  "home.hero.eyebrow": { description: `${HERO} small uppercase label above the headline.` },
  "home.hero.title": { description: `${HERO} headline.` },
  "home.hero.subtitle": { description: `${HERO} paragraph under the headline.` },
  "home.hero.primaryCtaLabel": { description: `${HERO} label of the primary button (empty hides it).` },
  "home.hero.primaryCtaHref": { description: `${HERO} link of the primary button.`, format: "URL, site path or #anchor" },
  "home.hero.secondaryCtaLabel": { description: `${HERO} label of the secondary button (empty hides it).` },
  "home.hero.secondaryCtaHref": { description: `${HERO} link of the secondary button.`, format: "URL, site path or #anchor" },
  "home.featuredPosts.enabled": { description: `${FEATURED} show the section below the hero.` },
  "home.featuredPosts.title": { description: `${FEATURED} section heading.` },
  "home.featuredPosts.subtitle": { description: `${FEATURED} lede under the heading.` },
  "home.featuredPosts.mode": {
    description: `${FEATURED} newest online posts of the whole site ("all") or of one category ("category", see categoryId).`,
    values: ["all", "category"],
  },
  "home.featuredPosts.categoryId": {
    description: `${FEATURED} category term id used when mode is "category". Empty or without posts = falls back to all posts.`,
    format: "category term id",
  },
  "home.featuredPosts.count": {
    description: `${FEATURED} number of post cards (the settings page offers 1 to 12).`,
    min: 1,
  },
  "home.testimonials.enabled": { description: `${TESTIMONIALS} show the section below the featured posts.` },
  "home.testimonials.eyebrow": { description: `${TESTIMONIALS} optional small label above the heading.` },
  "home.testimonials.title": { description: `${TESTIMONIALS} section heading.` },
  "home.testimonials.subtitle": { description: `${TESTIMONIALS} lede under the heading.` },
  "home.testimonials.variant": {
    description: `${TESTIMONIALS} frosted cards on a light surface ("glass") or a navy section ("navy").`,
    values: ["glass", "navy"],
  },
  "home.testimonials.items": {
    description: `${TESTIMONIALS} the quotes, an array of { quote, authorName, authorTitle?, rating? (1-5 stars, default 5), authorAvatarUrl? (URL; empty = initials), authorAvatarAlt? }. Replaces the three placeholder testimonials.`,
    format: "array of { quote, authorName, authorTitle, rating, authorAvatarUrl, authorAvatarAlt }",
  },
  "single.showAuthorBio": { description: `${SIDEBAR} author card (avatar, name, role, bio, social links).` },
  "single.showPopularArticles": {
    description: `${SIDEBAR} popular articles card (3 related posts, filled at runtime from data/posts.json).`,
  },
  "single.popularArticlesTitle": {
    description: `${SIDEBAR} heading of the popular articles card. Empty = the theme's default in the site language.`,
  },
  "single.showCta": { description: `${SIDEBAR} navy call-to-action card at the bottom.` },
  "single.ctaTitle": {
    description: `${SIDEBAR} heading of the CTA card. Empty = the site title (when the site has a description) or "Get started".`,
  },
  "single.ctaButtonLabel": { description: `${SIDEBAR} button label of the CTA card. Empty = "Get started".` },
  "single.ctaButtonHref": {
    description: `${SIDEBAR} button link of the CTA card. Empty = /contact.html.`,
    format: "URL or site path",
  },
};
