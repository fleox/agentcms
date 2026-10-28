// Marketplace Core — AgentCMS external theme.
//
// Build: `npm install --legacy-peer-deps && npm run build` produces
// `dist/bundle.js` + `marketplace-core.zip`. Upload the ZIP via
// /admin/#/themes → "Install theme" to register the theme.

import cssText from "./theme.css?raw";
import { BaseLayout } from "./templates/BaseLayout";
import { HomeTemplate } from "./templates/HomeTemplate";
import { SingleTemplate } from "./templates/SingleTemplate";
import { CategoryTemplate } from "./templates/CategoryTemplate";
import { AuthorTemplate } from "./templates/AuthorTemplate";
import { NotFoundTemplate } from "./templates/NotFoundTemplate";
import { en, fr, de, es, nl, pt, ko } from "./i18n";
import { i18n as runtimeI18n, getCurrentPublishContext } from "@agent-cms/runtime";
import { transformBodyHtml } from "./blocks/transforms";
import { encodeAttrs } from "./blocks/util";
import type { MarketplaceThemeConfig } from "./config";
import { DEFAULT_MARKETPLACE_CONFIG } from "./config";
import { buildCustomCss } from "./style";
import { MarketplaceSettingsPage } from "./SettingsPage";
import { SETTINGS_SCHEMA } from "./settingsSchema";
import { headerButtonsBlock } from "./blocks/headerButtons/manifest";
import { DEFAULT_HEADER_BUTTONS } from "./blocks/headerButtons/render";
import { galleryBlock } from "./blocks/gallery/manifest";
import { DEFAULT_GALLERY } from "./blocks/gallery/render";
import { specsBlock } from "./blocks/specs/manifest";
import { DEFAULT_SPECS } from "./blocks/specs/render";
import { featuresBlock } from "./blocks/features/manifest";
import { DEFAULT_FEATURES } from "./blocks/features/render";
import { landingHeroBlock } from "./blocks/landingHero/manifest";
import { featureGridBlock } from "./blocks/featureGrid/manifest";
import { featureRowBlock } from "./blocks/featureRow/manifest";
import { statsBarBlock } from "./blocks/statsBar/manifest";
import { ctaBannerBlock } from "./blocks/ctaBanner/manifest";
import type { ThemeManifest } from "@agent-cms/runtime";

// Seed markdown auto-inserted at the top of every new POST (not
// pages — pages stay empty). User opens a new product post and sees
// 4 placeholder cards: Download buttons, Gallery, Specs, Features.
// They can edit them via the Block inspector or delete any block
// they don't need. Slash-command re-inserts a deleted block later.
const DEFAULT_POST_MARKDOWN = [
  `<div data-cms-block="marketplace-core/header-buttons" data-attrs="${encodeAttrs(DEFAULT_HEADER_BUTTONS)}"></div>`,
  `<div data-cms-block="marketplace-core/gallery" data-attrs="${encodeAttrs(DEFAULT_GALLERY)}"></div>`,
  `<div data-cms-block="marketplace-core/specs" data-attrs="${encodeAttrs(DEFAULT_SPECS)}"></div>`,
  `<div data-cms-block="marketplace-core/features" data-attrs="${encodeAttrs(DEFAULT_FEATURES)}"></div>`,
  "",
  "## Description",
  "",
  "Write the long-form description of your theme or plugin here. Markdown is supported.",
  "",
].join("\n\n");

// Theme manifest with an extension property for the per-post default
// markdown — same convention as storefront's defaultPostMarkdown.
type ManifestWithSeed = ThemeManifest<MarketplaceThemeConfig> & {
  defaultPostMarkdown?: { post?: string; page?: string };
};

const manifest: ManifestWithSeed = {
  id: "marketplace-core",
  name: "Marketplace Core",
  version: "1.7.3",
  description:
    "App-store style theme for listing themes / plugins. Modern Corporate aesthetic with ambient shadows and rounded XL corners.",
  scssEntry: "theme.css",
  cssText,
  i18n: { en, fr, de, es, nl, pt, ko },
  defaultPostMarkdown: { post: DEFAULT_POST_MARKDOWN },
  settings: {
    navLabelKey: "title",
    defaultConfig: DEFAULT_MARKETPLACE_CONFIG,
    component: MarketplaceSettingsPage,
    schema: SETTINGS_SCHEMA,
  },
  compileCss: (config) => buildCustomCss(cssText, config.style),
  imageFormats: {
    inputFormats: [".jpg", ".jpeg", ".png", ".webp"],
    outputFormat: "webp",
    quality: 82,
    formats: {
      small: { width: 480, height: 300, fit: "cover" },
      medium: { width: 800, height: 500, fit: "cover" },
      large: { width: 1600, height: 1000, fit: "cover" },
    },
    defaultFormat: "medium",
  },
  templates: {
    base: BaseLayout,
    home: HomeTemplate,
    single: SingleTemplate,
    category: CategoryTemplate,
    author: AuthorTemplate,
    notFound: NotFoundTemplate,
  },
  blocks: [
    // Product blocks — used on single product pages.
    headerButtonsBlock,
    galleryBlock,
    specsBlock,
    featuresBlock,
    // Landing blocks — used on home / about / marketing pages
    // (added in v1.3.0).
    landingHeroBlock,
    featureGridBlock,
    featureRowBlock,
    statsBarBlock,
    ctaBannerBlock,
  ],
  register(api) {
    // Transform marketplace-core/* block markers into rich HTML at
    // publish time. Other themes' markers pass through untouched.
    //
    // The core calls `post.html.body` with (html, post) only. The full
    // publish context is reachable through getCurrentPublishContext()
    // — valid during post.markdown.before / post.html.body only (null
    // in templates, head filters and post.template.props). The
    // multilang plugin's localized renders have no current context but
    // pass a per-language shadow ctx as a third argument, so both
    // sources are read for the locale of the code-block Copy labels.
    api.addFilter<string>("post.html.body", (html, postRaw, shadowRaw) => {
      const ctx = getCurrentPublishContext() as TemplatePropsCtx | null;
      const shadow = shadowRaw as { settings?: { language?: string } } | undefined;
      const language = shadow?.settings?.language || ctx?.settings?.language || "en";
      const lang = language.toLowerCase().split("-")[0];
      const copyLabel =
        (runtimeI18n.getResource(lang, "theme-marketplace-core", "publicBaked.codeBlock.copy") as
          | string
          | undefined) ?? "Copy";
      const copiedLabel =
        (runtimeI18n.getResource(lang, "theme-marketplace-core", "publicBaked.codeBlock.copied") as
          | string
          | undefined) ?? "Copied";
      // Doc pager: resolve prev/next siblings now, while the publish
      // context is available, and hand them to the post.template.props
      // filter below (it runs right after, for the same post, without a
      // ctx). Doc layout only applies to posts without a hero that have
      // a category — matches the dispatch in SingleTemplate.tsx.
      const post = postRaw as TemplatePropsPost;
      pendingSiblings =
        ctx && post && !post.heroMediaId && post.primaryTermId
          ? { postId: post.id, siblings: resolveDocSiblings(ctx, post.id, post.primaryTermId) }
          : null;
      return transformBodyHtml(html, copyLabel, copiedLabel);
    });
    api.addFilter<unknown>("post.template.props", (props, postRaw) => {
      const post = postRaw as TemplatePropsPost;
      const pending = pendingSiblings;
      pendingSiblings = null;
      if (!pending || pending.postId !== post?.id) return props;
      return {
        ...(props as Record<string, unknown>),
        docSiblings: pending.siblings,
      };
    });
  },
};

// Siblings computed by the post.html.body filter for the post being
// rendered, consumed (once) by post.template.props. The publisher
// renders one page at a time, so a single slot is enough; the post id
// check keeps a stale value from leaking into another page.
let pendingSiblings: { postId: string; siblings: DocSibling[] } | null = null;

type DocSibling = { id: string; title: string; url: string };

// Local minimal shape of what resolveDocSiblings reads from the
// publish context — narrower than PublishContext so a partial
// context still works.
interface TemplatePropsCtx {
  posts: Array<{
    id: string;
    type: "post" | "page";
    title: string;
    slug: string;
    status: "draft" | "online";
    primaryTermId?: string;
    createdAt?: { toMillis?: () => number };
  }>;
  terms: Array<{ id: string; slug: string; type: "category" | "tag" }>;
  settings?: { language?: string };
}
interface TemplatePropsPost {
  id: string;
  heroMediaId?: string;
  primaryTermId?: string;
}

function resolveDocSiblings(
  ctx: TemplatePropsCtx,
  currentPostId: string,
  primaryTermId: string,
): DocSibling[] {
  if (!ctx?.posts) return [];
  const primaryTerm = ctx.terms.find((t) => t.id === primaryTermId);
  if (!primaryTerm) return [];
  // Include the current post even if its status is still "draft" —
  // covers first-publish renders where markPostOnline runs after the
  // template render. All other siblings must be online so drafts
  // don't surface as prev/next.
  return ctx.posts
    .filter(
      (p) =>
        p.type === "post" &&
        p.primaryTermId === primaryTermId &&
        (p.id === currentPostId || p.status === "online"),
    )
    .sort((a, b) => {
      const ams = a.createdAt?.toMillis?.() ?? 0;
      const bms = b.createdAt?.toMillis?.() ?? 0;
      return ams - bms;
    })
    .map((p) => {
      // Posts without a category live at the site root
      // (`<slug>.html`); doc posts always have a primary category,
      // hence the `<term.slug>/<post.slug>.html` join. (Multilang's
      // localized renders don't run post.template.props, so
      // translated doc pages render without the pager.)
      return {
        id: p.id,
        title: p.title,
        url: `${primaryTerm.slug}/${p.slug}.html`,
      };
    });
}

export default manifest;
