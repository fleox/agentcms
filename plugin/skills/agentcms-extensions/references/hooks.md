# Hooks

Register with `api.addFilter(hook, fn, priority = 10)` / `api.addAction(hook, fn, priority = 10)` inside `register(api)`.
- Lower priority runs first; ties keep registration order: plugins first, then the active theme.
- **Filters** receive the current value plus extra arguments, and must return the value, possibly modified. The next filter gets what you return, so never return `undefined`.
- **Actions** receive arguments; their return value is ignored. Handlers run one after another and are awaited. A throwing handler aborts the remaining ones **and** the operation that fired them, so catch your errors.
- Extra arguments are typed `unknown`: cast them (`const [post, ctx] = args as [Post, PublishContext]`).
- **SYNC** hooks are applied without awaiting. A callback that returns a Promise (any `async` function) throws and breaks the page render.

`ext check` warns about any hook name below that you misspell, or that you register with the wrong kind (`addAction` on a filter or the reverse). It reports an error for an async callback on a SYNC hook.

## Core filters

| Hook | Kind | Value → return | Extra args | When |
|---|---|---|---|---|
| `post.markdown.before` | async | Markdown string | `post` | Before each single post/page (and static home page) Markdown is rendered |
| `post.html.body` | async | body HTML (already sanitised) | `post` | Right after Markdown → HTML, same pages. **Output is not sanitised again: escape what you inject.** This is where editor-block markers become HTML. |
| `post.template.props` | async | single-template props `{ site, post, bodyHtml, author, hero, primaryTerm, tags }` | `post` | Before the single template renders; add or alter props (single pages only) |
| `page.head.extra` | **SYNC** | string to inject in `<head>` (starts as `""`) | `baseProps` | Every page the core renders (single, home, category, author, 404) and the admin preview |
| `page.body.end` | **SYNC** | string to inject before `</body>` (starts as `""`) | `baseProps` | Same pages, same moment |
| `menu.json.resolved` | async | `{ header, footer, branding? }` | `{ settings, posts, pages, terms }` | Before `data/menu.json` is uploaded (after publishes, menu saves, regenerations) |
| `publish.additional` | async | `{ path, html }[]` (path without leading slash) | `post`, `ctx` | After a post is rendered (publish and regenerate-all). Return extra files to upload with it, e.g. translations. On publish, the core deletes paths listed in `post.lastPublishedPathsByLocale` that you no longer return. You must write that field yourself with `updatePost`. |
| `publish.extraListings` | async | `{ path, html }[]` | `ctx` | When listings (home + categories) are regenerated. Return extra listing pages. There is no cleanup: delete your own orphans. |

`baseProps` = `{ site, pageTitle, pageDescription?, ogImage?, currentPath, currentLocale? }` (type `BaseLayoutProps` without `children`).

`post.html.body` gets `(html, post)` from the core. When a multilingual plugin renders a translation, it adds a third argument: a `PublishContext` whose `settings.language` is the page's language. Use `(args[1] as PublishContext | undefined) ?? getCurrentPublishContext()`. With `site.settings` you can read the plugin configs (`site.settings.pluginConfigs?.["<id>"]`).

**String filters:** append, don't replace. Write `return head + mine` or `[head, mine].filter(Boolean).join("\n")`. Returning only your string erases what other plugins added.

**Publish context outside actions.** `post.html.body` and `post.template.props` don't receive `ctx`. Inside `post.markdown.before` / `post.html.body` (only there), `getCurrentPublishContext()` from the runtime returns `{ posts, pages, terms, media (Map), settings, users, authorLookup }`. Everywhere else it returns `null`: templates, head/body filters, `post.template.props`. Prepare what you need in `publish.before` or `post.html.body` and keep it in module state.

## Core actions

All receive `ctx: PublishContext` = `{ posts, pages, terms, media: Map<id, Media>, settings, users, authorLookup(id) → AuthorView, bulkMode? }`.

| Hook | Args | When |
|---|---|---|
| `publish.before` | `(post, ctx)` | Start of each publish, also in bulk mode, and for each post during regenerate-all. Use it to prepare data for the render. |
| `regenerate.listings.before` | `(ctx)` | Before home + category pages are regenerated |
| `publish.after` | `(post, ctx)` | End of a single (non-bulk) publish, immediately followed by `publish.complete` |
| `publish.complete` | `(post, ctx)` | End of a single publish. `ctx` already shows the post online at its new path. |
| `post.unpublished` | `(post, ctx)` | After a single unpublish. `post` is the pre-unpublish object; `ctx` shows it as a draft. |
| `post.deleted` | `(post, ctx)` | After a single delete (drafts included). The post is already gone from `ctx`. |

⚠ `publish.after`, `publish.complete`, `post.unpublished` and `post.deleted` **do not fire** in bulk mode (import, multi-select publish) or during Regenerate → All HTML. If your plugin maintains files from these actions, also register a regeneration target (`api.registerRegenerationTarget`). The admin runs targets after bulk operations, on Regenerate → Everything and on theme change.

### Order inside one publish

1. `publish.before(post, ctx)`
2. Delete the post's stale paths.
3. Render, in this order:
   1. `post.markdown.before`
   2. Markdown → sanitised HTML
   3. `post.html.body`
   4. `post.template.props`
   5. `page.head.extra`
   6. `page.body.end`
   7. Template → HTML
   8. Base-path rewrite
4. Upload the page if it changed.
5. `publish.additional` → upload the extra files.
6. Mark the post online.
7. `regenerate.listings.before` → home → every category archive → `publish.extraListings`.
8. The author archive.
9. `menu.json.resolved` → `data/menu.json`, then `data/posts.json` and `data/authors.json`.
10. `publish.after`, then `publish.complete`.

All of this is one batch, so on git-hosted sites it makes one commit. Files your handlers upload during it join the same commit.

## Hooks fired by bundled plugins (only while that plugin is enabled)

| Hook | Kind | Value | Extra args | Fired by |
|---|---|---|---|---|
| `sitemap.urlset.namespaces` | SYNC | `Record<attr, uri>` | `{ kind: "year", baseUrl }` | Sitemaps, once per yearly sitemap |
| `sitemap.url.entry` | SYNC | `""` → extra inner XML for one `<url>` (escaped) | `{ entity, baseUrl, path, lastmodMs }` | Sitemaps, per URL |
| `sitemap.urls.extra` | SYNC | `{ path, lastmodMs?, extraInnerXml? }[]` | `{ posts, pages, terms, settings, year, scope }` | Sitemaps, **once per year**. Filter on `year`, or every yearly file gets your URLs. |
| `sitemap.index.extra` | SYNC | `{ path, lastmodMs? }[]` | `{ settings }` | Sitemaps index |
| `sitemap.news.locales` | async | `{ language, path, entities }[]` | `{ posts, pages, terms, settings, config }` | Sitemaps, when News is enabled |
| `rss.site.locales` | async | `{ language, path, channelTitle, channelDescription, channelLink, items }[]` | `{ posts, terms, mediaMap, settings, config, baseUrl, xslHref }` | RSS |

## Hooks that do not exist

These don't exist; don't use them:
- tag-archive, author or 404 template-props filters;
- `publish.error`, `media.uploaded`, `settings.saved`, `term.saved`, `menu.saved`;
- any hook around theme asset sync.

To react to settings, read them where you need them: in filters through `baseProps.site.settings`, in actions through `ctx.settings`.
