# Themes

A theme decides what every published page looks like. The admin imports your bundle, takes its default export (a `ThemeManifest`), renders pages with its templates at publish time and uploads `cssText` as `theme-assets/<id>.css`.

## ThemeManifest

```tsx
import type { ThemeManifest } from "@agent-cms/runtime";
import cssText from "./theme.css?raw";          // plain CSS → string
import menuLoader from "./menu-loader.js?raw";  // runtime JS → string

const manifest: ThemeManifest<MyConfig> = {
  id: "acme-blog",                 // = manifest.json id
  name: "Acme Blog",
  version: "1.0.0",                // keep = manifest.json version
  description: "…",
  scssEntry: "theme.css",          // required by the type, unused for external themes
  cssText,                         // REQUIRED: the published stylesheet
  jsText: menuLoader,              // optional → theme-assets/<id>-menu.js
  jsTextPosts: postsLoader,        // optional → theme-assets/<id>-posts.js
  imageFormats: { … },             // optional, see "Images"
  templates: { base, home, single, category, author, notFound }, // all six REQUIRED
  settings: { navLabelKey, defaultConfig, component }, // optional page at /theme-settings
  compileCss: (config) => string,  // optional: bake the config into the CSS (needs settings)
  i18n: { en: {…}, fr: {…} },     // optional, namespace "theme-<id>"
  blocks: [ /* BlockManifest */ ], // optional editor blocks, active while the theme is
  register(api, ctx) { … },        // optional hooks, run after the plugins' while active
  defaultPostMarkdown: { post?: "…", page?: "…" }, // optional seed for NEW posts/pages
};
export default manifest;
```

The admin also shows `readme` (Markdown, `import readme from "../README.md?raw"`) if you add it to the object. Only the **active** theme's blocks and `register()` run. The theme's settings are stored under `settings.themeConfigs[<id>]` and survive theme switches.

## Which template renders which file

| File (site root) | Template | Notes |
|---|---|---|
| `index.html` | `home` | Latest posts, or a chosen page when Settings → Home is "static page" |
| `<category>/<slug>.html` (posts with a category), `<slug>.html` (other posts, all pages) | `single` | Posts **and** pages: branch on `post.type` |
| `<category-slug>/index.html` | `category` | One per category, even empty ones |
| `author/<slug>.html` | `author` | Authors with at least one published post |
| `404.html` | `notFound` | Written only by Regenerate → All HTML / Everything |

There are no tag archives and no pagination. The home gets the newest `settings.postsPerPage` posts (never pages). Category and author pages get all their posts, newest first. If you need pagination, do it client-side in runtime JS.

## Props

Every template gets `site: SiteContext` plus its own props. `BaseLayout` gets `BaseLayoutProps` and the page as `children`.

**SiteContext**

| Field | Contents |
|---|---|
| `settings` | `{ title, description, language, baseUrl, activeThemeId, enabledPlugins, homeMode, homePageId?, postsPerPage, menus, pluginConfigs?, themeConfigs?, discourageIndexing? }` |
| `resolvedMenus` | `{ header: ResolvedMenuItem[], footer: ResolvedMenuItem[] }` with items `{ id, label, href, children?, labels? }`, where `href` is root-absolute or an external URL |
| `themeCssPath` | `"theme-assets/<id>.css"`, with **no leading slash** |
| `themeConfig` | Your settings merged over `defaultConfig` (shallow). `undefined` without `settings`; cast it to your type. |
| `homePath` | Set by multilingual plugins on localized pages. Use `site.homePath ?? "/index.html"` for every home link. |

**BaseLayoutProps**: `{ site, pageTitle, pageDescription?, ogImage?, currentPath, currentLocale?, children }`

| Page | `pageTitle` | `pageDescription` | `ogImage` | `currentPath` |
|---|---|---|---|---|
| single | `post.seo.title ?? post.title` | SEO description or the first 160 characters of the body | SEO image or `hero` "large" | `news/hello.html` |
| home (latest posts) | **`""`** | site description | — | `index.html` |
| home (static page) | page SEO title or title | page SEO description, excerpt or site description | page SEO image | `index.html` |
| category | `term.seo.title \|\| term.name` | `term.seo.description \|\| term.description` | `term.seo.ogImage` | `guides/index.html` |
| author | display name | bio | — | `author/ada.html` |
| 404 | `"Page not found"` | — | — | `404.html` |

- **single**: `{ post: Post, bodyHtml: string, author?: AuthorView, hero?: MediaView, primaryTerm?: Term, tags: Term[] }`. `bodyHtml` is sanitised HTML already processed by the `post.html.body` filters: render it with `dangerouslySetInnerHTML`. No related posts are provided. Render a placeholder and fill it at runtime from `data/posts.json` if you want them.
- **home**: `{ posts: CardPost[], staticPage?: { post, bodyHtml }, archivesLink?: { href, label } }`. `heroHtml`, `listHtml`, `mostReadHtml` and `promoCardHtml` are only filled for built-in themes, never for yours. When `staticPage` is set, render its `bodyHtml` (a page made of blocks is the usual way to build a landing page).
- **category**: `{ term, posts: CardPost[], categoryRssUrl?, archivesLink?, allCategories?: Term[], popularTags?: Term[] }`.
- **author**: `{ author: AuthorView, posts: CardPost[] }`.
- **notFound**: only `{ site }`.
- **Static home page:** the page's title is not rendered for you. Show `staticPage.post.title` if your design wants a heading; landing pages made of blocks usually don't.

**CardPost** = `Post & { url, hero?: MediaView, category?: { name, url }, dateLabel? }`
- ⚠ `url` has **no leading slash** (`"news/a.html"`), so write `href={"/" + post.url}`.
- `category.url` already starts with `/`.
- `dateLabel` is already formatted in the site language.
- Don't print `contentMarkdown` in listings.

**AuthorView** = `{ id, displayName, url?, title?, bio?, avatar?: MediaView, socials?: { network, url }[] }`.
- `url` is the root-absolute address of the author's archive page (`/author/ada-writer.html`), so a post can link its author with `author.url`.
- `SocialIcon` / `socialLabel` from the runtime render the icons.

**Post** fields you use: `id, type ("post"|"page"), title, slug, excerpt?, contentMarkdown, heroMediaId?, authorId, termIds, primaryTermId?, seo?, createdAt?, publishedAt?, updatedAt?`. Dates are Timestamp-like objects: use `postSortMillis(post)` or `post.publishedAt?.toMillis?.()`, never `new Date(post.publishedAt)`.

## BaseLayout: required pattern

```tsx
import { canonicalUrl, type BaseLayoutProps } from "@agent-cms/runtime";

export function BaseLayout({ site, pageTitle, pageDescription, ogImage, currentPath, currentLocale, children }: BaseLayoutProps) {
  const lang = currentLocale || site.settings.language || "en";
  const siteTitle = site.settings.title || "";
  const title = !pageTitle ? siteTitle : pageTitle.includes(siteTitle) ? pageTitle : `${pageTitle} — ${siteTitle}`;
  const canonical = site.settings.baseUrl && currentPath ? canonicalUrl(site.settings.baseUrl, currentPath) : undefined;
  return (
    <html lang={lang}>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>{title}</title>
        {pageDescription && <meta name="description" content={pageDescription} />}
        {canonical && <link rel="canonical" href={canonical} />}
        {ogImage && <meta property="og:image" content={ogImage} />}
        <link rel="stylesheet" href={`/${site.themeCssPath}`} />
        <script src="/theme-assets/acme-blog-menu.js" defer />
        <meta name="x-cms-head-extra" />
      </head>
      <body>
        {/* header with data-cms-menu="header", main, footer … */}
        {children}
        <script type="application/x-cms-body-end" />
      </body>
    </html>
  );
}
```

- **The two sentinels are mandatory and must be written exactly as shown.** After rendering, the admin replaces them with what plugins add: SEO tags, favicons, analytics, hreflang, embed scripts, the `noindex` meta when the site discourages indexing. Without them those plugins silently do nothing. `ext check` verifies both on every page.
- Write `rel` before `href` on the stylesheet link: the admin's live preview looks for that exact form.
- `extraHead` exists in the props type but the core never sets it. Plugins' head markup always goes through the sentinel.
- **Purity:** "pure" means no browser APIs (`window`, `document`, `localStorage`), no effects, no state, no fetch. Computing with `Date`, `Intl` or plain functions is fine, e.g. `new Date().getFullYear()` for a copyright line, which is fixed at publish time.
- React is 18.3. Use its attribute spellings: `fetchPriority` triggers a warning there; write `fetchpriority` (with a cast) or leave it out.
- The admin never injects your runtime scripts: reference them yourself (`/theme-assets/<id>-menu.js`).
- `canonicalUrl` strips `index.html` and returns `""` without a `baseUrl`, so emit the tag conditionally.

## Menus and other runtime data

Published HTML stays stable; things that change often are read at runtime from JSON files the admin rewrites on every publish. All of them live under `data/`:

| File | Shape |
|---|---|
| `data/menu.json` | `{ header: Item[], footer: Item[], branding?: { logoUrl } }`, with Item `{ id, label, href, children?, labels?: { <lang>: label } }` |
| `data/posts.json` | `{ generatedAt, posts: [{ id, type, title, url (no leading slash), excerpt, publishedAt (ms), dateLabel, primaryTermId?, category?: { name, url }, hero? (URL) }] }`: the newest 100 posts and pages |
| `data/authors.json` | `{ generatedAt, authors: { [id]: { id, displayName, title?, bio?, avatar?, url, socials? } } }` |

Recommended menu pattern (what `ext new theme` generates):
1. Render the menu statically from `site.resolvedMenus` inside `<nav data-cms-menu="header"><ul>…</ul></nav>`, so it works without JS.
2. Ship a small loader as `jsText`, uploaded as `theme-assets/<id>-menu.js`. It refetches `data/menu.json` and replaces the `<ul>`, so menu edits appear without regenerating every page. The same loader wires the mobile burger.

If you only rendered menus statically, every menu edit would need Regenerate → Everything.

**Base path (sites hosted in a sub-folder, e.g. GitHub project pages).** After rendering, the admin prefixes root-absolute URLs (`/…`) in `href`, `src`, `action`, `poster`, `data-src`, `data-href`, `srcset` and `imagesrcset`, and adds `<meta name="x-cms-base" content="/repo/">`. Nothing else is rewritten: not inline styles, CSS `url()`, JSON or JS. Every runtime script must prefix its own URLs:

```js
var meta = document.querySelector('meta[name="x-cms-base"]');
var BASE = (meta && meta.getAttribute("content")) || "/";
if (BASE.charAt(BASE.length - 1) !== "/") BASE += "/";
function withBase(url) {
  if (!url || BASE === "/" || /^([a-z][a-z0-9+.-]*:|\/\/|#)/i.test(url) || url.indexOf(BASE) === 0) return url;
  return BASE + url.replace(/^\//, "");
}
fetch(withBase("/data/menu.json")).then(function (r) { return r.json(); }).then(render);
```

Runtime scripts are classic scripts (wrap them in an IIFE), loaded with `defer`, and must fail silently, since the static markup is already there.

**One-page sites and anchors.** A menu item can point to a section of the home (`/index.html#menu`), and blocks can carry `id` attributes as targets. Don't mark such links `aria-current="page"`: the scaffold's loader skips links that have a hash. Add `scroll-margin-top` to the targets when the header is sticky.

## CSS

- `cssText` is the only stylesheet that reaches the site. "Sync theme assets" uploads it (in the admin: Themes → Sync, Regenerate → Theme assets / Everything, theme activation). A `theme.css` file inside the ZIP is never used.
- **Plain CSS:** `import cssText from "./theme.css?raw"`.
- **SCSS / PostCSS:** `import cssText from "./theme.scss?inline"`, with `sass` installed. `?raw` would ship uncompiled SCSS.
- **Tailwind:** compile to a file before `vite build` (e.g. `tailwindcss -i src/theme.css -o src/theme.compiled.css --minify`), then `?raw` the output. The `content` glob must include your templates **and** your runtime `.js` files.
- Never `import "./x.css"` for side effects: library builds emit it as a separate file nobody loads.
- Prefix your classes (e.g. `acme-…`) and use CSS custom properties for colours and spacing, so `compileCss` can override them.
- Fonts: load them with `@import url(...)` at the top of the CSS, which lets `compileCss` swap them without republishing HTML.
- Every published page shares one stylesheet URL. Browsers may keep an old copy after a sync; tell users to hard-refresh, or add your own `?v=` (e.g. a `cssUpdatedAt` saved in your config).

## Settings page and `compileCss`

```ts
settings: { navLabelKey: "settings.navLabel", defaultConfig: DEFAULT_CONFIG, component: SettingsPage },
compileCss: (config) => baseCss + `\n:root{--acme-accent:${safeColor(config.colors.accent)}}\n`,
```

- The page is rendered at `#/theme-settings` while the theme is active. It receives `{ config, save }`: `config` is `defaultConfig` shallow-merged with the stored value, and `save(next)` stores the **whole** object.
- `compileCss(config)` runs on every theme-asset sync **and when the settings page saves**, which re-uploads `theme-assets/<id>.css`. Return `baseCss` unchanged for the default config, and sanitise user values before writing them into CSS.
- At publish time the same config is available as `site.themeConfig`, so templates can switch layouts with it. Changes that affect markup need Regenerate → All HTML.
- Merge nested defaults yourself (`{ ...DEFAULT.colors, ...config.colors }`): config saved by an older version lacks the keys you add later.
- Settings-page forms follow the admin UI rules in SKILL.md (`data-form-type="other"`, stable button DOM, translated strings).

## Images

```ts
imageFormats: {
  inputFormats: [".jpg", ".jpeg", ".png", ".webp", ".gif"], // FILE EXTENSIONS with a dot
  outputFormat: "webp",
  quality: 80,
  defaultFormat: "medium",
  formats: {
    small:  { width: 480,  height: 320, fit: "cover" },
    medium: { width: 960,  height: 640, fit: "cover" },
    large:  { width: 1600, height: 900, fit: "cover" },
  },
},
```

- Every upload made while your theme is active gets these variants, plus `admin-thumb`, `admin-preview` and `admin-original` (2000 px). The `admin-*` names are reserved.
- In templates use `pickFormat(media, "medium")`. It falls back to the media's default format, then the largest variant (often the 2000 px original), then `""`.
- Media uploaded under another theme lacks your format names, so always tolerate the fallback.
- `og:image` defaults to the hero's `"large"` variant, so declare a `large` format. Any other names are yours to choose (`hero`, `square`, `thumb`…).
- **Responsive images:** every variant in `MediaView.formats[name]` carries `{ url, width, height }`. Build `srcset` from variants that share the same crop: either all `cover` with the same ratio, or all `contain`. Mixing a 1:1 crop with a 3:2 original in one `srcset` makes the browser swap shapes.

```tsx
const set = ["small", "medium", "large"].map((n) => hero?.formats[n]).filter(Boolean) as Array<{ url: string; width: number }>;
<img src={pickFormat(hero, "medium")} srcSet={set.map((v) => `${v.url} ${v.width}w`).join(", ")} sizes="(min-width: 960px) 960px, 100vw" alt={hero?.alt ?? ""} />
```

- **A photo's true ratio** comes from the `admin-original` variant (`hero.formats["admin-original"]`, a `contain` fit). Use it to drive ratio-aware layouts such as masonry or portrait/landscape tiles.

## Screenshots and hover

The preview's screenshots have no hover: `(hover: hover)` is false, so hover-reveal designs show their touch/default state. Make sure that state looks right too. Lazy images are loaded before each capture.

## Fonts chosen in the settings

1. Put the font `@import url(…)` as the **first line** of your CSS.
2. Let the user pick a font with the runtime's `FontSelect`: `options: { name, fallback, googleHref }[]`, `value` (a name), `onChange(name)`. Store the name in your config.
3. In `compileCss(config)`, swap that first `@import` for the chosen font's `googleHref`, and append a `:root{ --font: "<name>", <fallback> }` override:

```ts
const FONTS: FontOption[] = [{ name: "Inter", fallback: "system-ui, sans-serif", googleHref: "https://fonts.googleapis.com/css2?family=Inter:wght@400;600&display=swap" }, …];
compileCss: (config) => {
  const font = FONTS.find((f) => f.name === config.font) ?? FONTS[0];
  return cssText.replace(/@import\s*(url\()?["'][^"']+["']\)?;/, `@import url("${font.googleHref}");`) + `
:root{--acme-font:"${font.name}",${font.fallback}}
`;
},
```

Pages keep their HTML; only the CSS changes.

## Public strings and languages

Templates render in the **site** language, not the admin user's. Avoid `useTranslation()` in templates. Use:

```ts
import { i18n, pickPublicLocale } from "@agent-cms/runtime";
const t = i18n.getFixedT(pickPublicLocale(site.settings.language), "theme-acme-blog");
```

The admin's languages are `en`, `fr`, `de`, `es`, `nl`, `pt` and `ko`. On multilingual sites, `currentLocale` (BaseLayout only) is the page's language. Other templates don't receive it: keep their fixed strings few, or put them in BaseLayout. Runtime scripts can read `<html lang>`.

i18next runs with `escapeValue: false`, but React escapes text in templates anyway. The core translates its own `pageTitle` for the 404 page into the site language.

The scaffold ships `src/publicT.ts` (`publicT(site, locale?)` on the `public.*` keys of `src/i18n.ts`). Put every label of the public site there.

Which translator where:

| Where | Language | How |
|---|---|---|
| Templates (public pages) | site | `publicT(site)` / `i18n.getFixedT(pickPublicLocale(site.settings.language), "theme-<id>")` |
| BaseLayout and its header/footer | the page's (multilingual) | `currentLocale \|\| site.settings.language` |
| `post.html.body` transforms (block labels) | site | `((args[1] as PublishContext \| undefined) ?? getCurrentPublishContext())?.settings.language`, with fallback `"en"` |
| Settings pages, inspectors, React node views | admin user's | `useTranslation("theme-<id>")` |
| Plain-DOM node views, block `insert` sample text | admin user's | `i18n.t(key, { ns: "theme-<id>" })` |

## Blocks and hooks in a theme

- `blocks: [...]` adds editor blocks while the theme is active (see blocks.md).
- `register(api, { settings })` adds hooks, typically `api.addFilter("post.html.body", html => renderMyBlocks(html))`.
- A landing page is best built as a page made of your blocks and set as the static home.
- `defaultPostMarkdown` can pre-insert block markers in new posts.

## Checklist before shipping a theme

- [ ] `npm run check` passes with no errors.
- [ ] All six templates handle missing data: posts with no hero image, no category, no excerpt, no author; empty categories; a site without menus.
- [ ] The phone screenshots have no horizontal overflow and the menu is usable on mobile.
- [ ] Contrast is readable, headings follow a hierarchy, images have `alt`, links are distinguishable, and there is a dark-mode decision.
- [ ] Runtime scripts use the base path and fail silently.
- [ ] The version is the same in `manifest.json`, `src/manifest.tsx` and `package.json`.
