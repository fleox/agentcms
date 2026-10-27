# Runtime API reference

What a plugin or theme bundle can use, in one guided page. The **reference of record** is the type file shipped in the npm package — [`types/agentcms-runtime.d.ts`](../types/agentcms-runtime.d.ts): every export of `@agent-cms/runtime` with its signature and documentation, kept in sync with the admin by `src/core/runtimeTypes.test.ts`. Map it in your project's `tsconfig.json`:

```json
{
  "compilerOptions": {
    "types": ["vite/client"],
    "paths": { "@agent-cms/runtime": ["./node_modules/@agent-cms/agentcms/types/agentcms-runtime.d.ts"] }
  }
}
```

(`agentcms ext new` does it for you, with `@agent-cms/agentcms` as a devDependency.)

## How `@agent-cms/runtime` resolves

Bundles never ship the admin's code. They keep six bare specifiers **external** at build time; at runtime the admin's import-map points each to a small stub under `<admin>/runtime/` that hands back the live admin instance:

| Specifier | Provides |
|---|---|
| `react`, `react/jsx-runtime` | React 18.3 (no `use`, `useOptimistic`, `useActionState`) |
| `react-dom`, `react-dom/client` | `createPortal`, `flushSync`; `createRoot`, `hydrateRoot` |
| `react-i18next` | `useTranslation`, `Trans`, `withTranslation`, `I18nextProvider` — sharing the admin's i18next |
| `@agent-cms/runtime` | everything below |

Everything else (`@tiptap/*`, `lucide-react`, `react-dom/server`, `react/jsx-dev-runtime`, date libraries…) is **not** mapped: bundle it, and build with the production JSX runtime. Use **named imports only** — `import runtime from "@agent-cms/runtime"` fails (no default export). Type-only imports: `import type { Post } from "@agent-cms/runtime"`.

## Versions

`manifest.json`'s `apiVersion` must be within `[CMS_API_MIN_VERSION, CMS_API_VERSION]` (exported constants) — currently `[1.0.0, 1.4.0]` — or the admin refuses the install and skips the bundle at boot. Declare the **lowest** version that has everything you use:

| API | Adds |
|---|---|
| 1.0.0 | filters, actions, blocks, dashboard cards, the theme manifest |
| 1.1.0 | core helpers (slugs, URLs, media, Markdown), site files, data CRUD, publisher helpers, `MediaPicker`, `EntityCombobox`, `FontSelect` |
| 1.2.0 | `applyFilters` / `applyFiltersSync` / `doAction` exports, `updateTerm` / `deleteTerm`, inspector tabs, term editor sections, `translations` fields, `publish.additional` / `publish.extraListings`, sitemap filters, `currentLocale`, `buildRssFeedXml` |
| 1.3.0 | `registerEditorVariantProvider` |
| 1.4.0 | publish connectors (site files routed to the active target, `getStorageCapabilities`, `withStorageBatch`, `StorageError`, `registerStorageConnector`), `basePathFromBaseUrl` / `withBasePath`, `publish.before(post, ctx)`, `regenerate.listings.before`, `sitemap.news.locales` |

The loader does not gate features by `apiVersion`; an older admin simply lacks the function (`api.registerEditorVariantProvider` is `undefined` before 1.3).

## `pluginApi` (the `api` passed to `register`)

| Member | Notes |
|---|---|
| `addFilter<T>(hook, fn, priority = 10)` | `fn(value, ...args)` returns the next value. Lower priority runs first. |
| `addAction(hook, fn, priority = 10)` | `fn(...args)`, awaited in order. A throw aborts the remaining handlers and the caller. |
| `registerBlock(manifest)` | Editor block — `nodeName` is required for ids with a slash. |
| `registerDashboardCard({ id, priority?, component })` | priority default 100. |
| `registerRegenerationTarget({ id, labelKey, run(ctx, log), i18nNamespace?, descriptionKey?, priority? })` | Runs after bulk publishes / imports, on *Regenerate → Everything*, on theme switch, and from its own Regenerate entry. **Only** on `api`. |
| `registerInspectorTab(manifest)` | Editor sidebar tab, `{ entity, updateEntity, save }`. |
| `registerTermEditorSection(manifest)` | Categories / Tags row section, `{ term, updateTerm }`. |
| `registerEditorVariantProvider(provider)` | Tab strip above the editor swapping the editor state per variant. |

Not on `api`: `applyFilters`, `applyFiltersSync`, `doAction` (top-level imports, to fire your own hooks), `registerStorageConnector` (top-level), `removeFilter` (doesn't exist publicly). Everything is wiped and re-registered on every settings change — register inside `register()` only.

## Hooks

Filters must return the (possibly modified) value; extra args are untyped — narrow them. **SYNC** filters run inside the render: an `async` callback throws and aborts the publish. `addFilter` accepts any string, so plugins can define their own hooks (`KnownFilterHook` / `KnownActionHook` in the types list the built-in ones).

### Filters

| Hook | Kind | Arguments | When |
|---|---|---|---|
| `post.markdown.before` | async | `(markdown, post)` | Every single post / page render and the static-page home, before Markdown → HTML. |
| `post.html.body` | async | `(html, post)` — **no ctx** | Right after Markdown → HTML (sanitised). Theme and plugin block markers are expanded here; the output is not sanitised again. `getCurrentPublishContext()` gives the full ctx. Also run by the multilang plugin for translated renders (with a shadow ctx as a 3rd argument). |
| `post.template.props` | async | `(props, post)` — **no ctx** | Single template only, after `post.html.body`. `getCurrentPublishContext()` is already `null`. |
| `page.head.extra` | **SYNC** | `("", baseProps)` | Every rendered page; output replaces `<meta name="x-cms-head-extra" />`. Append to the incoming string. |
| `page.body.end` | **SYNC** | `("", baseProps)` | Every rendered page, last per-page hook; replaces `<script type="application/x-cms-body-end"></script>`. |
| `menu.json.resolved` | async | `(menu: MenuJson, { settings, posts, pages, terms })` | Before `data/menu.json` is uploaded (and in the editor preview). |
| `publish.additional` | async | `([], post, ctx)` → `{ path, html }[]` | During `publishPost` and per post in *Regenerate all*: extra files per post. Paths no longer returned are deleted by diffing `post.lastPublishedPathsByLocale` — which the plugin must write itself (`updatePost`). |
| `publish.extraListings` | async | `([], ctx)` → `{ path, html }[]` | With every listing refresh (home + categories). No cleanup: the plugin deletes its own orphans. |
| `sitemap.urlset.namespaces` | SYNC | `(ns: Record<string,string>, { kind, baseUrl })` | `agentcms-sitemaps`, per yearly sitemap. |
| `sitemap.url.entry` | SYNC | `("", { entity, baseUrl, path, lastmodMs })` | Per `<url>`: return extra (escaped) inner XML. |
| `sitemap.urls.extra` | SYNC | `(SitemapExtraUrl[], { posts, pages, terms, settings, year, scope })` | Once **per year** with the same data — filter on `year` or URLs repeat in every file. |
| `sitemap.index.extra` | SYNC | `(SitemapIndexExtraEntry[], { settings })` | Extra `<sitemap>` references. |
| `sitemap.news.locales` | async | `(NewsLocaleEntry[], { posts, pages, terms, settings, config })` | When News is enabled: extra per-language news sitemaps. |
| `rss.site.locales` | async | `(RssLocaleEntry[], { posts, terms, mediaMap, settings, config, baseUrl, xslHref })` | `agentcms-rss`, site feed: extra per-language feeds. |

The sitemap and RSS filters fire only when those (bundled) plugins are enabled.

### Actions

| Hook | Arguments | When |
|---|---|---|
| `publish.before` | `(post, ctx)` | Start of every post publish — also in bulk mode and per post in *Regenerate all*. Good place to prepare data for sync filters. |
| `regenerate.listings.before` | `(ctx)` | Before the home / categories are re-rendered. |
| `publish.after`, `publish.complete` | `(post, ctx)` | End of a **single** publish, after the listings, author page and `data/*.json` refresh (back to back). |
| `post.unpublished` | `(post, ctx)` | End of a single unpublish (`post` = the pre-unpublish object). |
| `post.deleted` | `(post, ctx)` | End of a single delete (also for drafts). |

`ctx` (`PublishContext`: `posts`, `pages`, `terms`, `media` (a `Map`), `settings`, `users`, `authorLookup`, `bulkMode?`) is already patched to show the site **after** the action. `publish.after` / `publish.complete` / `post.unpublished` / `post.deleted` are **skipped** by bulk publishes, imports and *Regenerate → All HTML* — pair them with `api.registerRegenerationTarget`.

Order inside one publish: `publish.before` → stale-path cleanup → `post.markdown.before` → `post.html.body` → `post.template.props` → `page.head.extra` → `page.body.end` → upload → `publish.additional` → listings (`regenerate.listings.before`, home, categories, `publish.extraListings`) → author page → `data/menu.json`, `data/posts.json`, `data/authors.json` → `publish.after` → `publish.complete`. All in one storage batch (one commit on git targets).

There is no hook for tag archives (they don't exist), the 404 / category / author template props, theme asset sync, media upload or settings save.

## Exports by area

One line per group — signatures in the type file.

- **Hooks & registries**: `pluginApi`, `applyFilters`, `applyFiltersSync`, `doAction`, `registerBlock`, `registerDashboardCard`, `registerInspectorTab`, `registerTermEditorSection`, `registerEditorVariantProvider`, `registerStorageConnector`, `registerExternalPlugin`, `registerExternalTheme` (the loader's; bundles don't need them), `CMS_API_VERSION`, `CMS_API_MIN_VERSION`.
- **URLs & slugs**: `slugify`, `isValidSlug`, `findAvailableSlug`, `buildPostUrl` (no leading slash), `buildTermUrl` (throws for tags), `pathToPublicUrl`, `canonicalPath`, `canonicalUrl` (strips `index.html`; `""` without a base URL), `detectPathCollision`, `detectTermSlugCollision`, `normalizeMediaSlug`, `basePathFromBaseUrl`, `withBasePath`.
- **Content helpers**: `mediaToView`, `pickFormat`, `pickMediaUrl`, `renderMarkdown` (no filters), `markdownToPlainText`, `postSortMillis`, `SocialIcon`, `socialLabel`, `renderPageToHtml` (full page pipeline with sentinels, base path and doctype — for plugin-rendered pages through the active theme's `base`), `buildRssFeedXml`.
- **Site files** (the active publish target): `uploadFile({ path, content, encoding? })`, `deleteFile`, `deleteFolder`, `renameFile`, `renameFolder`, `createFolder`, `getFile` (text, throws a 404 `StorageError`), `listFiles`, `publicUrlFor` (async), `fileToBase64`, `getStorageCapabilities` (async: `list`, `rename`, `folders`, `deletePrefix`, `connectorId`, `model`), `withStorageBatch` (one commit; scopes nest; commits even if `fn` throws), `StorageError` (`status`, `501` = unsupported). Paths have no leading slash.
- **Data** (the active backend): `fetchAllPosts({ type })`, `createPost`, `updatePost` (can't change status / publish bookkeeping), `uploadMedia(file, userId, settings)` (pass `settings` so the active theme's formats are used), `createTerm`, `updateTerm`, `deleteTerm`, `buildAuthorLookup`.
- **Publisher**: `publishPost`, `buildPublishContext`, `buildSiteContext`, `renderHome`, `publishMenuJson` (always `data/menu.json`), `publishPostsJson` / `publishAuthorsJson` (optional path override), `publishProductsJson`, `deleteProductsJson`. Unpublish / delete / regenerate-all are not exported.
- **Settings**: `updatePluginConfig(id, config)`, `updateThemeConfig(id, config)` — always the full config.
- **Admin UI**: `useCmsData`, `useAuth`, `useAllPosts`, `toast`, `MediaPicker`, `EntityCombobox`, `FontSelect`, `cn`, `formatDateTime`, `sha256Hex`, `i18n` (`getFixedT`, `getResource`, …), `pickPublicLocale`, `setActiveLocale` (admin language — not for publish code).
- **Themes**: `getActiveTheme`, `getCurrentPublishContext` (non-null only during `post.markdown.before` / `post.html.body`), `logoPath`, `uploadThemeLogo`, `removeThemeLogo`.

## Public files written by the core

| Path | Content |
|---|---|
| `index.html`, `<category>/index.html`, `<category>/<post>.html`, `<page>.html`, `author/<slug>.html`, `404.html` | Theme-rendered pages (`404.html` only on *Regenerate all* / theme activation). |
| `data/menu.json` | `{ header, footer, branding? }` — items `{ id, label, href, children?, labels? }`. |
| `data/posts.json` | `{ generatedAt, posts: [{ id, type, title, url, excerpt, publishedAt, dateLabel, primaryTermId?, category?, hero? }] }` — newest 100, `url` without leading slash. |
| `data/authors.json` | `{ generatedAt, authors: { [id]: { id, displayName, title?, bio?, avatar?, url, socials? } } }` |
| `theme-assets/<id>.css`, `<id>-menu.js`, `<id>-posts.js`, `<id>-logo.webp` | Theme assets (*Sync theme assets*, activation, theme-settings save). |

## Sentinels and base path

A theme's `BaseLayout` must contain, unmodified, `<meta name="x-cms-head-extra" />` in `<head>` and `<script type="application/x-cms-body-end" />` at the end of `<body>` — replaced by the `page.head.extra` / `page.body.end` output (and the *discourage indexing* meta). On sub-folder sites the publisher prefixes root-absolute values of `href`, `src`, `action`, `poster`, `data-src`, `data-href`, `srcset`, `imagesrcset` and injects `<meta name="x-cms-base" content="/repo/">`; runtime scripts must prefix the URLs they build (fetches of `/data/*.json` included) with that meta's value. Use `withBasePath(path, basePathFromBaseUrl(settings.baseUrl))` for URLs written at publish time into places that aren't rewritten (JSON, inline scripts).

## Custom publish targets (API 1.4)

`registerStorageConnector({ id, create(settings) })` adds a target: `create` returns a `StorageConnector` with `put`, `get`, `delete`, `publicUrl` (required) and optional `getBytes`, `list`, `deletePrefix`, `rename`, `renameFolder`, `createFolder`, `commitBatch`, advertised through `capabilities` and `model` (`"files"` | `"commit"` | `"deployment"`). `delete` must resolve when the file is already gone. The built-in Settings form only knows the in-tree connectors, so ship a settings page that stores the target's configuration.
