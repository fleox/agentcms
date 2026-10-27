# agentcms-multilang

Multi-language support for AgentCMS — translated posts, pages, categories and tags, hreflang SEO, per-language sitemaps and RSS feeds, and a public language switcher.

## What it does

- **Language tabs in the editor**: an editor *variant provider* adds a tab strip above the post / page editor, one tab per language (★ = primary). Switching tab swaps the whole editor — title, slug, content (blocks included), excerpt and SEO — so every language gets the same authoring experience. Translation tabs appear once the post has been saved once.
- **Term translations**: a collapsible section in each row of **Categories / Tags** holds the per-language `name`, `slug`, description and SEO.
- **URL strategy**: the primary language lives at the site root (`site.com/news/hello.html`); every other enabled language lives under its own prefix (`site.com/fr/actualites/bonjour.html`), with its own home (`/fr/index.html`, optionally a static page per language) and category archives.
- **SEO**: `<link rel="alternate" hreflang="…">` for every language plus `x-default`, `og:locale` and `og:locale:alternate` on every published page, and `<html lang>` per page (`BaseLayoutProps.currentLocale`). The canonical link stays the theme's job: the publisher hands the theme the localized `currentPath`, so a theme that emits `canonicalUrl(baseUrl, currentPath)` gets the right per-language canonical.
- **Sitemaps** (with `agentcms-sitemaps` enabled): `<xhtml:link rel="alternate">` entries inside each `<url>`, the translated URLs in the yearly sitemaps, and — when News is enabled — one `sitemaps/sitemap-news-<lang>.xml` per secondary language, referenced from the index.
- **RSS** (with `agentcms-rss` enabled and its site feed on): one `/<lang>/rss.xml` per secondary language, through the RSS plugin's `rss.site.locales` filter. Legacy `/<lang>/feed.xml` and per-category `/<lang>/<slug>/<slug>.xml` files from versions ≤ 1.6.1 are deleted on the next publish.
- **Language switcher**: a small script injected through `page.body.end` fills `[data-cms-langswitch="header"]` and `[data-cms-langswitch="footer"]` containers with links to the current page's alternates (toggles in the plugin settings). The in-tree themes (default, magazine, corporate, storefront, portfolio) ship these containers; other themes just add an empty `<div data-cms-langswitch="header"></div>`.

## Requirements

- AgentCMS admin with runtime API **1.4.0** or newer (the plugin uses `registerEditorVariantProvider`, `publish.before(post, ctx)`, `regenerate.listings.before` and `sitemap.news.locales`).
- The plugin ships pre-installed with AgentCMS (bundled default); this folder is its source.

## Build and install (from source)

1. `npm install --legacy-peer-deps`
2. `npm run build` — type-checks, produces `dist/bundle.js` + `agentcms-multilang.zip`
3. In the admin, **Plugins** → **Install plugin** → drop the ZIP (same id = in-place upgrade).
4. Open **Settings → Multi-language** and pick the primary language + additional languages.

## Workflow

1. Write the post in the primary language with the standard editor and save it.
2. Click a language tab above the editor and fill the title, slug, content, excerpt and SEO for that language. Save.
3. Publish. The publisher renders the primary version and every translation in one pass (`publish.additional`), each at its own path; removed translations are deleted from the site.

## Storage

- Per-post translations live on `Post.translations[<lang>]` (`{ slug, title, contentMarkdown, excerpt, seo }`).
- Per-term translations live on `Term.translations[<lang>]` (`{ slug, name, description, seo }`).
- Published translation paths are tracked in `Post.lastPublishedPathsByLocale` (orphan cleanup).
- Plugin config (languages, primary, per-language home page, menu label overrides, switcher toggles) lives in `settings.pluginConfigs["agentcms-multilang"]`.

All storage flows through the standard backend dispatcher — it works the same on every data backend (Firebase, SQLite file, Markdown in git, this browser).

## Theme compatibility

Translated pages render through the **active theme exactly as the primary publisher does** — same templates, BaseLayout and CSS. Themes should:

- use `currentLocale` for `<html lang>` and `site.homePath ?? "/index.html"` for home links;
- render translated menu labels from `item.labels[<lang>]` in their menu loader (the bundled loaders do);
- add `[data-cms-langswitch]` containers where the switcher should appear.

Block markers in translated content go through the same `post.html.body` filters as the primary render. Those filters receive a per-language publish context as an extra third argument (`ctx.settings.language` = the target language), because `getCurrentPublishContext()` is only set during the core's own renders.

## Known limitations

- Theme-specific rich homes (e.g. magazine's hero / sidebar widgets) are not replicated in secondary languages. Pick a **static page** as the home of each language for full control.
- `post.markdown.before` and `post.template.props` filters don't run for translated renders.
- Concurrent edits to one post's translations are last-write-wins (one document / row per post).
