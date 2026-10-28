# Creating a theme

A theme decides what the published site looks like. It is a set of React components that the admin renders **to static HTML, in the browser**, at publish time (`renderToStaticMarkup`), plus the site's stylesheet and optional runtime scripts. Like a plugin, it ships as a `.zip` (`manifest.json` + `bundle.js`) installed from the admin (**Themes → Install theme**) — no admin rebuild. Exactly one theme is active; its templates render every page.

This guide is for humans and AI agents. The API reference of record is [`types/agentcms-runtime.d.ts`](../types/agentcms-runtime.d.ts) (all props, manifests and helpers, documented); [runtime-api-reference.md](./runtime-api-reference.md) is the guided overview. Read [creating-a-plugin.md](./creating-a-plugin.md) for what themes share with plugins (manifest.json rules, hooks, settings pages, blocks, build config).

## Quick start

Node.js 20+.

```bash
npx -y @agent-cms/agentcms@0.2.0 ext new theme my-theme --with settings,menu-loader
cd my-theme
npm install
npm run build      # tsc + vite build + agentcms ext pack . → my-theme.zip
npm run check      # validates the package and renders a demo site with the theme active
npm run preview    # full demo site + desktop/mobile screenshots — look at them
npm run serve      # the demo site on http://localhost:4321/
```

`--with` is optional: `settings`, `block`, `menu-loader`. `agentcms ext check` renders every kind of page (home, posts, pages, category, author, 404, block test) through the real publisher and flags missing titles, sentinels, canonicals, `<html lang>`, broken links, unstyled pages, async sync-filters and more. `ext preview --site <alias>` renders a registered site's real content (read-only copy) with your theme.

Install: **Themes → Install theme** → pick `my-theme.zip`, then **Activate** (or `npx -y @agent-cms/agentcms@0.2.0 ext install my-theme.zip --site <alias> --activate`, plan first, `--yes` to apply). Activation uploads the theme assets and regenerates every page. Re-uploading a higher `version` upgrades in place.

## The bundle: `ThemeManifest`

```tsx
import type { ThemeManifest } from "@agent-cms/runtime";
import cssText from "./theme.css?raw";
import menuLoader from "./runtime/menu-loader.js?raw";
import { BaseLayout } from "./templates/BaseLayout";
// …

const manifest: ThemeManifest = {
  id: "my-theme",                 // = manifest.json id
  name: "My Theme",
  version: "1.0.0",               // keep equal to manifest.json version
  description: "One sentence for the theme card.",
  scssEntry: "theme.css",         // informational only
  cssText,                        // → theme-assets/my-theme.css
  jsText: menuLoader,             // → theme-assets/my-theme-menu.js
  templates: {
    base: BaseLayout, home: HomeTemplate, single: SingleTemplate,
    category: CategoryTemplate, author: AuthorTemplate, notFound: NotFoundTemplate,
  },
};
export default manifest;
```

| Field | Notes |
|---|---|
| `id`, `name`, `version` | Same rules as plugins (`^[a-z0-9-]+$`, bump `version` every release). The i18n namespace is `theme-<id>`; the stylesheet is `theme-assets/<id>.css`. |
| `cssText` | **Required.** The CSS as a string — the only CSS that reaches the site. *Sync theme assets* uploads it (or `compileCss(config)`) to `theme-assets/<id>.css`. A `theme.css` file inside the ZIP is never published. |
| `jsText`, `jsTextPosts` | Optional runtime scripts, uploaded as `theme-assets/<id>-menu.js` and `theme-assets/<id>-posts.js`. Nothing loads them for you: BaseLayout must reference them. |
| `templates` | All six: `base`, `home`, `single`, `category`, `author`, `notFound`. |
| `imageFormats` | Image variants generated at upload: `{ inputFormats: [".jpg", ".jpeg", ".png", ".webp"], outputFormat: "webp", quality: 80, formats: { card: { width: 800, height: 500, fit: "cover" }, … }, defaultFormat: "card" }`. `inputFormats` are file extensions. Names starting with `admin-` are reserved. |
| `defaultPostMarkdown` | `{ post?, page? }` — seed Markdown for new posts / pages (e.g. block markers). |
| `settings` | Theme settings page (`navLabelKey`, `defaultConfig`, `component`, optional `schema` — API ≥ 1.5, documents each setting for `agentcms themes config <id> --schema`) at `#/theme-settings`, shown while the theme is active. |
| `compileCss` | `(config) => css` — bakes the user's settings into the published stylesheet. Called only when `settings` is declared too. |
| `i18n` | Translations, namespace `theme-<id>`. |
| `blocks` | Editor blocks registered while the theme is active. |
| `register` | `(api, ctx?: { settings })` — hooks, exactly like a plugin's `register`, registered after every plugin. |

## Which template renders which file

| File (site path) | Template | Written |
|---|---|---|
| `index.html` | `home` | after every single publish / unpublish, on Regenerate |
| `<category>/<post>.html`, `<post>.html` (no category), `<page>.html` | `single` (posts **and** pages: branch on `post.type`) | on publish |
| `<category>/index.html` | `category` (every category, even empty) | with the home |
| `author/<slug>.html` | `author` | after a publish by that author, on Regenerate |
| `404.html` | `notFound` | **only** by *Regenerate → All HTML / Everything* and theme activation |

There are **no tag archives** (`buildTermUrl` throws for a tag) and **no pagination**: the home lists the newest `settings.postsPerPage` posts, a category or author page lists all of its posts. A page chosen as the static home renders inside `home`, not as its own file.

## Props

Every template receives `site: SiteContext` (`settings`, `resolvedMenus`, `themeCssPath`, `themeConfig`, `homePath?`) plus:

| Template | Props |
|---|---|
| `single` | `post`, `bodyHtml` (sanitised and already transformed by `post.html.body` filters — render with `dangerouslySetInnerHTML`), `author?`, `hero?` (MediaView), `primaryTerm?`, `tags`. Extended by `post.template.props` filters. |
| `home` | `posts: CardPost[]`, `staticPage?: { post, bodyHtml }` (set when Settings → General uses a static page as the home — render it instead of the list), `archivesLink?`. `heroHtml` / `listHtml` / `mostReadHtml` / `promoCardHtml` are only filled for the built-in `default` and `magazine` themes. |
| `category` | `term`, `posts`, `categoryRssUrl?`, `archivesLink?`, `allCategories?`, `popularTags?` |
| `author` | `author: AuthorView`, `posts` |
| `notFound` | `site` only (`message` is never passed). |

`BaseLayout` gets `site`, `pageTitle`, `pageDescription?`, `ogImage?`, `currentPath` (site path of the page, e.g. `news/hello.html`), `currentLocale?` and `children` (the rendered template).

| Page | `pageTitle` |
|---|---|
| single | `post.seo.title` or `post.title` |
| home, latest posts | **`""`** — fall back to the site title |
| home, static page | the page's SEO title or title |
| category | the term's SEO title or name |
| author | the author's display name |
| 404 | `"Page not found"` |

Pitfalls:

- `CardPost.url` has **no leading slash** (`news/hello.html`) while `card.category.url` has one (`/news/index.html`): link posts with `href={"/" + card.url}`.
- Dates are timestamp objects: `post.publishedAt?.toMillis()`, or `card.dateLabel` (already formatted in the site language). Never `new Date(post.publishedAt)`.
- Images: `pickFormat(view, "card")` returns the URL of a format, falling back to `default`, then the largest variant (often the 2000 px original). Request the format names your theme declares; tolerate `""`.
- Templates are pure functions of their props: no `window` / `document`, no effects or state (static markup drops them), no data fetching, no `useCmsData`. Interactivity comes from runtime scripts (`jsText`) or plugin scripts.
- Public strings must use the **site** language, not the admin user's: `const t = i18n.getFixedT(pickPublicLocale(site.settings.language), "theme-my-theme")` (both from `@agent-cms/runtime`). `useTranslation()` in a template renders in the admin's language.
- Related posts aren't passed to `single`: render a placeholder and fill it at runtime from `data/posts.json` (`jsTextPosts`), like the built-in themes.

## BaseLayout checklist

```tsx
import { canonicalUrl, type BaseLayoutProps } from "@agent-cms/runtime";

export function BaseLayout({ site, pageTitle, pageDescription, ogImage, currentPath, currentLocale, children }: BaseLayoutProps) {
  const siteTitle = site.settings.title;
  const title = pageTitle ? `${pageTitle} — ${siteTitle}` : siteTitle;
  const canonical = canonicalUrl(site.settings.baseUrl, currentPath);   // "" until the site URL is set
  return (
    <html lang={currentLocale || site.settings.language || "en"}>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>{title}</title>
        {pageDescription && <meta name="description" content={pageDescription} />}
        {canonical && <link rel="canonical" href={canonical} />}
        {ogImage && <meta property="og:image" content={ogImage} />}
        <link rel="stylesheet" href={`/${site.themeCssPath}`} />
        <script defer src="/theme-assets/my-theme-menu.js" />
        <meta name="x-cms-head-extra" />
      </head>
      <body>
        <a href={site.homePath ?? "/index.html"}>{siteTitle}</a>
        <nav data-cms-menu="header"><ul /></nav>
        <main>{children}</main>
        <script type="application/x-cms-body-end" />
      </body>
    </html>
  );
}
```

- **Both sentinels, unmodified.** `<meta name="x-cms-head-extra" />` (in `<head>`) is replaced by the `page.head.extra` output — favicon, SEO, hreflang, custom code and the *discourage indexing* `noindex` meta. `<script type="application/x-cms-body-end" />` (end of `<body>`) is replaced by `page.body.end` output — search, language switcher, embeds, custom code. Without them those features silently vanish.
- `<title>` falls back to the site title (the latest-posts home passes `pageTitle: ""`).
- `<html lang>` from `currentLocale` first (multilingual sites), then `site.settings.language`.
- Canonical through `canonicalUrl(baseUrl, currentPath)`: it strips `index.html` so directory pages get the clean `…/news/` form; emit it only when non-empty.
- Stylesheet: `href={"/" + site.themeCssPath}`, with `rel` **before** `href` (the editor preview inlines `<link rel="stylesheet" href=…>` and misses other orders). Cache-busting (`?v=…`) is up to the theme.
- Home links: `site.homePath ?? "/index.html"` (localized homes set `homePath`).
- `<!doctype html>` is added by the renderer; don't emit it.
- Write root-absolute links (`/news/`, `/theme-assets/…`) in `href`, `src`, `action`, `poster`, `srcset`, `data-src`, `data-href`: on sub-folder sites (e.g. GitHub project Pages) the publisher rewrites exactly these attributes and injects `<meta name="x-cms-base" content="/repo/">`. Inline styles, CSS files, JSON and other `data-*` attributes are not rewritten.

## Menus and runtime scripts

Menus are edited in the admin and published as **`data/menu.json`** (`{ header, footer, branding? }`, items `{ id, label, href, children?, labels? }`) without republishing every page. Two ways to render them:

1. **Static**: render `site.resolvedMenus.header` / `.footer` (resolved at publish time). Simple, but a menu edit shows up only after pages are regenerated.
2. **Runtime loader** (what the built-in themes do): emit empty `[data-cms-menu="header"]` / `[data-cms-menu="footer"]` containers, ship a loader as `jsText`, reference it from BaseLayout (`/theme-assets/<id>-menu.js`), and have it fetch `/data/menu.json` — through the `x-cms-base` meta, so sub-folder sites work. `item.labels[<lang>]` carries translated labels; `branding.logoUrl` the uploaded theme logo. `ext new theme <id> --with menu-loader` scaffolds one; [`external/themes/minimal-theme/src/runtime/menu-loader.js`](../external/themes/minimal-theme/src/runtime/menu-loader.js) and `src/themes/default/menu-loader.js` are references. Doing both (static HTML, refreshed by the loader) works too.

Other public JSON written by the publisher: `data/posts.json` (newest 100 online posts and pages; `url` without a leading slash) and `data/authors.json`.

## CSS

- **Plain CSS**: `import cssText from "./theme.css?raw"`.
- **SCSS / PostCSS**: `import cssText from "./theme.scss?inline"` with `sass` installed (`?raw` would ship uncompiled SCSS).
- **Tailwind**: run the Tailwind CLI before `vite build`, writing **outside** `dist/` (e.g. `src/theme.compiled.css`, the build empties `dist/`), then `?raw`-import that file. Include `.js` in the `content` globs when runtime scripts add class names.
- Never `import "./theme.css"` without a suffix — library mode emits it as a separate file the admin never uses.
- Scope your selectors (a class prefix) so a theme switch doesn't leave collisions.
- Load web fonts with `@import url(...)` at the top of the CSS, so `compileCss` can swap them without republishing HTML.

### `compileCss` and theme settings

```ts
compileCss: (config: MyConfig) => `${cssText}\n:root{--my-primary:${config.primary};}`,
```

The admin calls `compileCss({ ...defaultConfig, ...storedConfig })` when it uploads `theme-assets/<id>.css`: *Sync theme assets*, theme activation, the editor preview and — since AgentCMS 0.2.0 — every save of the theme's settings page (`save(next)` stores the config, then re-uploads the CSS). It is ignored when the theme has no `settings`. If it throws, the baseline `cssText` is uploaded. The CSS path never changes, so browsers may keep a cached copy; append a version (`?v=<config.cssUpdatedAt>`) in BaseLayout if that matters.

Theme settings pages follow the plugin rules (full config on `save`, shallow default merge, `<form data-form-type="other">`, stable-DOM buttons, admin CSS classes only); translations come from the `theme-<id>` namespace. At publish time the merged config is `site.themeConfig`. For a logo, `uploadThemeLogo({ themeId, file, width, height })` writes `theme-assets/<id>-logo.webp`; store `{ logoEnabled: true, logoUpdatedAt }` in the config and `data/menu.json` gets `branding.logoUrl`.

## Theme blocks and hooks

`blocks` and `register(api)` work exactly like a plugin's `registerBlock` and hooks ([creating-a-plugin.md → Editor blocks](./creating-a-plugin.md#editor-blocks)): markers in the Markdown, expanded by the theme's `post.html.body` filter, `nodeName` required, Tiptap bundled. Block renderers that need other posts call `getCurrentPublishContext()` inside `post.html.body` (it is `null` outside `post.markdown.before` / `post.html.body`). A home made of blocks = a static page chosen as the home in Settings → General.

## Activation, uninstall

Activating a theme saves `activeThemeId`, syncs the assets of every installed theme and regenerates every page (including `404.html`) and every plugin regeneration target. Uninstalling the active theme falls back to the first available theme (the built-in `default`): switch first if you care which one.

## Troubleshooting

| Symptom | Cause / fix |
|---|---|
| Unstyled pages | `cssText` empty, `<link>` not pointing at `/${site.themeCssPath}`, or *Sync theme assets* not run since install. In the editor preview: `rel` must come before `href`. |
| Plugin tags / noindex missing | The head sentinel is missing or altered. |
| Empty menus | Containers without a loader, or a loader fetching `/menu.json` instead of `/data/menu.json`. |
| `<title>` empty on the home | No fallback for `pageTitle: ""`. |
| 404s on a GitHub project site | Root paths built at runtime without the `x-cms-base` prefix, or links in attributes the publisher doesn't rewrite. |
| Strings in the admin's language | `useTranslation()` in a template; use `i18n.getFixedT(pickPublicLocale(site.settings.language), "theme-<id>")`. |
| Style changes not live | Theme without `settings` (so `compileCss` is skipped), or a cached stylesheet. |
| No `404.html` | Only *Regenerate → All HTML* / activation write it. |

## Examples

- [`external/themes/minimal-theme/`](../external/themes/minimal-theme/) — the six templates with the BaseLayout checklist, static-page home, static menus refreshed by a runtime loader.
- [`external/themes/marketplace-core/`](../external/themes/marketplace-core/) — full theme: nine editor blocks, settings page with `compileCss` (palette + fonts), `defaultPostMarkdown`, publish-time block transforms.
- In-tree themes (`src/themes/default`, `magazine`, `corporate`, `storefront`, `portfolio`) for runtime loaders, logos and Tailwind pipelines.

AI agents: the `agentcms-extensions` skill of the AgentCMS Claude Code plugin ([`plugin/skills/agentcms-extensions/`](../plugin/skills/agentcms-extensions/)) walks through the whole workflow.
