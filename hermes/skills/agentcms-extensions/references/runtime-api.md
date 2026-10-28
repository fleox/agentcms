# `@agent-cms/runtime`

Import with **named imports** (the module has no default export) and `import type` for types:

```ts
import { uploadFile, pickFormat, canonicalUrl, toast } from "@agent-cms/runtime";
import type { ThemeManifest, PluginManifest, Post, CardPost } from "@agent-cms/runtime";
```

The authoritative, documented signatures are in `node_modules/@agent-cms/agentcms/types/agentcms-runtime.d.ts`. A scaffolded project maps it through tsconfig `paths`, so the editor and `tsc` check every call. This page is the map.

Other specifiers the admin provides: `react` (18.3), `react/jsx-runtime`, `react-dom` (`createPortal`, `flushSync`), `react-dom/client` and `react-i18next` (`useTranslation`, `Trans`, `withTranslation`, `I18nextProvider`, `initReactI18next`). That's all: `react-dom/server`, `react/jsx-dev-runtime`, `@tiptap/*`, `lucide-react` and the rest are not provided. Bundle them, or don't use them.

## Registering things

| Export | Use |
|---|---|
| `pluginApi` | The same object your `register(api)` receives |
| `applyFilters(hook, value, ...args)` / `applyFiltersSync(...)` / `doAction(hook, ...args)` | Fire hooks, including your own |
| `registerBlock`, `registerDashboardCard`, `registerInspectorTab`, `registerTermEditorSection`, `registerEditorVariantProvider` | Same as the `api.*` methods. Call them only from `register()`, since registrations are reset on every settings change. |
| `registerStorageConnector({ id, create(settings) })` | Add a publish target (advanced) |
| `CMS_API_VERSION`, `CMS_API_MIN_VERSION` | The admin's extension API range, e.g. `"1.4.0"`, `"1.0.0"` |

`registerRegenerationTarget` only exists as `api.registerRegenerationTarget`.

## URLs and slugs

| Export | Use |
|---|---|
| `slugify(text)`, `isValidSlug(slug)`, `findAvailableSlug(base, isUsed)` | Lower-case ASCII slugs. Hosts are case-sensitive. |
| `buildPostUrl({ post, primaryTerm? })` | Post path, e.g. `news/hello.html` (no leading slash) |
| `buildTermUrl(category)` | Category path, e.g. `news/index.html`. **Throws for tags.** |
| `canonicalUrl(baseUrl, path)` | Absolute URL with `index.html` stripped; `""` without a baseUrl |
| `canonicalPath(path)`, `pathToPublicUrl(baseUrl, path)` | Path without `index.html` / absolute URL without stripping |
| `basePathFromBaseUrl(baseUrl)`, `withBasePath(path, base)` | Sub-folder sites: `"/repo"` / prefix a root-absolute path |
| `detectPathCollision(...)`, `detectTermSlugCollision(...)`, `normalizeMediaSlug(name)` | Collision checks / media folder slugs |

## Content rendering

| Export | Use |
|---|---|
| `renderMarkdown(md)` | Markdown → sanitised HTML (runs no filters) |
| `markdownToPlainText(md, max = 200)` | Excerpts and descriptions |
| `mediaToView(media)`, `pickFormat(view, name?)`, `pickMediaUrl(media, name?)` | Media variants. `pickFormat` falls back to the default, then the largest variant, then `""`. |
| `postSortMillis(post)` | The date used for ordering, in ms |
| `SocialIcon({ network, size?, className? })`, `socialLabel(network)` | Author social links |
| `renderPageToHtml({ base, baseProps, template, templateProps })` | Render a full page through a theme's BaseLayout, with plugins' head/body output and the base path. For plugin-generated pages. |
| `buildRssFeedXml(channel)` | RSS 2.0 XML string |
| `getActiveTheme(activeThemeId)` | The active ThemeManifest (falls back to the default theme) |
| `getCurrentPublishContext()` | Publish context, only inside `post.markdown.before` / `post.html.body`; `null` elsewhere |

## Site files (the active hosting, whatever it is)

| Export | Use |
|---|---|
| `uploadFile({ path, content, encoding?: "utf-8" \| "base64" })` | Write a file. `path` is relative to the site root, no leading slash. |
| `deleteFile(path)`, `deleteFolder(path)` | Delete; a missing file is fine |
| `getFile(path)` | Read a text file |
| `listFiles(page?, perPage?)`, `renameFile`, `renameFolder`, `createFolder` | Optional capabilities: check `getStorageCapabilities()` first |
| `publicUrlFor(path)` | **Async**; public URL of a file |
| `fileToBase64(file)` | Browser `File` → base64 for `uploadFile` |
| `withStorageBatch(async () => { … })` | Group several writes, one commit on git hosts. Scopes nest. |
| `StorageError` | Error class (`status`, `message`). Failures already show a toast. |

## Data (whatever backend the site uses)

| Export | Use |
|---|---|
| `fetchAllPosts({ type: "post" \| "page" })` | Every post or page (cached ~30 s) |
| `createPost(input)`, `updatePost(id, patch)` | Create or patch content. They don't publish: call `publishPost` for that. |
| `createTerm(input)`, `updateTerm(id, patch)`, `deleteTerm(id)` | Categories and tags |
| `uploadMedia(file, uploadedBy, settings?)` | Full image pipeline. Pass `settings` so the active theme's formats are used. |
| `buildAuthorLookup(users, media)` | `(userId) → AuthorView` |
| `updatePluginConfig(id, config)`, `updateThemeConfig(id, config)` | Store a whole config object |

Not exported: deleting posts, listing all media, raw settings writes, user management. In the admin UI use `useCmsData()` for live lists.

## Publishing

| Export | Use |
|---|---|
| `buildPublishContext({ terms, settings, users, authorLookup, posts?, pages?, refreshTerms? })` | Build a `PublishContext` (outside actions, which already receive one) |
| `publishPost(postId, ctx, log)` | Publish one post with the full cascade |
| `buildSiteContext(ctx)` | The `site` object templates receive |
| `renderHome(ctx, { homePath?, currentLocale? })` | Render the home through the active theme, e.g. a localized home |
| `publishMenuJson(settings, posts, pages, terms)` | Rewrite `data/menu.json` |
| `publishPostsJson(..., pathOverride?)`, `publishAuthorsJson(..., pathOverride?)` | Rewrite `data/posts.json` / `data/authors.json` (or a localized copy) |
| `publishProductsJson`, `deleteProductsJson` | Storefront catalogue (specialised) |

## Admin UI helpers (settings pages, inspectors, dashboard cards)

| Export | Use |
|---|---|
| `useCmsData()` | `{ posts, pages, terms, categories, tags, media, users, settings, … }`, live. `posts`/`pages` are empty in "paginated" mode; use `useAllPosts(type)` there. |
| `useAllPosts(type)` | `{ posts, loading }` |
| `useAuth()` | `{ user, record, role, isAdmin, … }`; use `record?.id` as `uploadedBy` |
| `toast.success\|info\|warn\|error(message)` | Notifications |
| `i18n`, `pickPublicLocale(lang)`, `setActiveLocale(locale)` | The admin i18next instance. Templates use `i18n.getFixedT(pickPublicLocale(site.settings.language), ns)`. `setActiveLocale` changes the admin's language: don't call it from publish code. |
| `EntityCombobox`, `FontSelect`, `MediaPicker` | Admin components (a searchable select, a font picker, the media library modal) |
| `logoPath(themeId)`, `uploadThemeLogo(...)`, `removeThemeLogo(themeId)` | Theme logo convention (`theme-assets/<id>-logo.webp`) |
| `sha256Hex(text)`, `formatDateTime(value, locale?)`, `cn(...classes)` | Utilities |

## Main types

The types you meet most:
- **Content:** `Post`, `Term`, `Media`, `SiteSettings`, `MenuItem`, `UserRecord`.
- **Themes:** `ThemeManifest`, `BaseLayoutProps`, `HomeTemplateProps`, `SingleTemplateProps`, `CategoryTemplateProps`, `AuthorTemplateProps`, `NotFoundTemplateProps`, `SiteContext`, `CardPost`, `MediaView`, `AuthorView`, `ResolvedMenuItem`.
- **Plugins:** `PluginManifest`, `PluginApi`, `PluginSettingsPageProps`, `ThemeSettingsPageProps`.
- **Editor:** `BlockManifest`, `DashboardCardManifest`, `InspectorTabManifest`, `TermEditorSectionManifest`, `EditorVariantProvider`.
- **Publishing:** `PublishContext`, `AdditionalRender`, `MenuJson`, `RssChannel`, `RegenerationTarget`.
- **Files:** `UploadFileOptions`.

The types file also lists every hook name (`KnownFilterHook`, `KnownActionHook`).
