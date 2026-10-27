# Runtime API reference

The public surface external plugins and themes use. All exports below come from `@agent-cms/runtime` — externalised at build time, redirected at runtime by the admin's import-map to a stub that hands back the live admin instance.

## Versioning

```ts
import {
  CMS_API_VERSION,        // current version of the runtime API
  CMS_API_MIN_VERSION,    // oldest version still supported
} from "@agent-cms/runtime";
```

`apiVersion` in your `manifest.json` is compared against `[CMS_API_MIN_VERSION, CMS_API_VERSION]` at install time + at every boot. Out-of-range bundles are skipped with a console warning.

The current contract is `1.4.0` (minimum `1.0.0`). Breaking changes bump the major; new optional fields bump the minor. Bundles built against `1.x` keep working as long as the admin advertises `MIN <= 1.x <= CURRENT`.

## pluginApi

```ts
import { pluginApi } from "@agent-cms/runtime";
```

Exposes:

| Method | Description |
|---|---|
| `addFilter<T>(hook, fn, priority?)` | Register a filter handler. `fn(value, ...args) => value`. Priority defaults to `100`; lower runs first. |
| `addAction(hook, fn, priority?)` | Register an action handler. `fn(...args) => void \| Promise<void>`. |
| `applyFilters<T>(hook, value, ...args) => Promise<T>` | Run every async filter for the hook in priority order, threading the value through. |
| `applyFiltersSync<T>(hook, value, ...args) => T` | Sync variant — used by hooks that run inside `renderToStaticMarkup`. |
| `doAction(hook, ...args) => Promise<void>` | Fire every async action for the hook. |
| `registerBlock(manifest)` | Register an editor block (Tiptap node + inserter entry). |
| `registerDashboardCard(manifest)` | Register a card on the admin dashboard. |

The same `pluginApi` powers in-tree plugins. External plugins call it inside their manifest's `register(api)` callback exactly like in-tree plugins do.

## Hooks

### Filters

| Hook | Type | Payload |
|---|---|---|
| `post.markdown.before` | async | `(markdown: string, post: Post) => string` — modify Markdown before rendering. |
| `post.html.body` | async | `(html: string, post: Post) => string` — modify rendered post HTML. Themes use this to resolve their block markers. |
| `post.template.props` | async | `(props, post) => props` — modify props passed to the active template. |
| `page.head.extra` | sync | `(html: string, baseProps) => string` — inject extra `<head>` markup. Replaces the `<meta name="x-cms-head-extra" />` sentinel. |
| `page.body.end` | sync | `(html: string, baseProps) => string` — inject markup before `</body>`. Replaces the `<script type="application/x-cms-body-end" />` sentinel. |
| `menu.json.resolved` | async | `(menu, ctx) => menu` — mutate the resolved `{ header, footer }` shape just before `/menu.json` is uploaded. |

### Actions

| Hook | Payload |
|---|---|
| `publish.before` | `(post, ctx)` |
| `publish.after` | `(post, ctx)` |
| `publish.complete` | `(post, ctx)` — fires after upload + listings refresh. |
| `post.unpublished` | `(post, ctx)` — fires after `unpublishPost` wipes the post's files. |
| `post.deleted` | `(post, ctx)` — fires after `deletePostAndUnpublish` removes the post. |

`ctx` is a `PublishContext` with up-to-date `posts`, `pages`, `terms`, `media`, and `settings` snapshots. Already patched to reflect the just-completed transition (`ctx.posts` shows what the public site looks like AFTER the action). Plugins use it to recompute derived files (sitemaps, search indexes, RSS feeds, …).

## Block manifest

```ts
api.registerBlock({
  id: "my-plugin/callout",
  titleKey: "callout.title",
  namespace: "my-plugin",          // i18n namespace for titleKey
  icon: AlertCircle,               // any React component
  category: "text",                // text | media | layout | embed | advanced
  insert: (chain, ctx) => chain.insertContent('<div data-cms-callout>...').run(),
  extensions: [CalloutNode],       // optional Tiptap extensions
  isActive: (editor) => editor.isActive("callout"),
  inspector: CalloutInspector,     // optional React component for the Block tab
});
```

See `src/core/blockRegistry.ts` for the full type. Blocks must be registered inside the manifest's `register(api)` callback so they're cleaned up on plugin disable.

## Dashboard card manifest

```ts
api.registerDashboardCard({
  id: "my-plugin/card",
  priority: 50,
  component: MyCard,
});
```

`MyCard` takes no props. The card fetches its own data and manages its own loading / error / empty states. Lower priority renders first.

## PluginManifest shape

```ts
import type { PluginManifest, PluginSettingsPageProps } from "@agent-cms/runtime";

interface PluginManifest<TConfig = unknown> {
  id: string;                      // matches manifest.json id
  name: string;
  version: string;
  description?: string;
  author?: string;
  readme?: string;                 // markdown; rendered in "Learn more"
  register: (api: PluginApi) => void;
  settings?: {
    navLabelKey: string;           // i18n key resolved against the plugin namespace
    defaultConfig: TConfig;
    component: ComponentType<PluginSettingsPageProps<TConfig>>;
  };
  i18n?: Record<string, Record<string, unknown>>;
}
```

## ThemeManifest shape

```ts
interface ThemeManifest<TConfig = unknown> {
  id: string;
  name: string;
  version: string;
  description?: string;
  scssEntry: string;               // path of the original entry, informational
  cssText: string;                 // compiled CSS — uploaded verbatim
  jsText?: string;                 // optional menu-loader JS
  jsTextPosts?: string;            // optional posts-loader JS
  templates: {
    base: ComponentType<BaseLayoutProps>;
    home: ComponentType<HomeTemplateProps & { site: SiteContext }>;
    single: ComponentType<SingleTemplateProps & { site: SiteContext }>;
    category: ComponentType<CategoryTemplateProps & { site: SiteContext }>;
    author: ComponentType<AuthorTemplateProps & { site: SiteContext }>;
    notFound: ComponentType<NotFoundTemplateProps & { site: SiteContext }>;
  };
  imageFormats?: ImageFormatConfig;
  settings?: ThemeSettingsPageDef<TConfig>;
  i18n?: Record<string, Record<string, unknown>>;
  compileCss?: (config: TConfig) => string;
  blocks?: BlockManifest[];
  register?: (api: PluginApi) => void;
}
```

The `BaseLayoutProps`, `SiteContext`, `*TemplateProps` types match the in-tree theme types in `src/themes/types.ts`. External theme authors typically copy those types into their own `src/types/` folder so the bundle is self-contained.

## Publish target (site file helpers)

`uploadFile`, `deleteFile`, `deleteFolder`, `getFile`, `renameFile`, `renameFolder`, `createFolder`, `listFiles` and `publicUrlFor` write to — and read from — the **active publish target** chosen by the site owner (git-backed Pages, S3-compatible bucket, local folder, ZIP download, …). Same signatures on every target; the admin emulates what a target lacks (`deleteFolder` via list + delete, `renameFile` via get + put + delete, `createFolder` is a no-op on object stores).

API ≥ 1.4 adds:

```ts
import { getStorageCapabilities, withStorageBatch, StorageError } from "@agent-cms/runtime";

const caps = await getStorageCapabilities();
// { connectorId, model: "files" | "commit" | "deployment",
//   list, rename, renameFolder, folders, deletePrefix }
if (caps.list) { /* safe to call listFiles */ }

// Group writes: on "commit" / "deployment" targets they land as ONE
// commit / deployment when the outermost scope exits. Pass-through on
// "files" targets. Core publish entry points (publishPost,
// regenerateAll, …) already run inside a batch.
await withStorageBatch(async () => {
  await uploadFile({ path: "feeds/a.xml", content: a });
  await uploadFile({ path: "feeds/b.xml", content: b });
});
```

- `StorageError` (`status`, `body`) is thrown for every target failure. `status === 501` means "not supported by this target".
- Inside a batch, writes are not live until commit: `getFile` sees the staged content (read-your-writes), but the public URL may still serve the previous version for a moment on git-backed targets.
- Check `caps.list` before calling `listFiles` — it throws a 501 `StorageError` (with a toast) otherwise.

### Custom publish targets (API ≥ 1.4)

A plugin can add a publish target. Implement the `StorageConnector` contract (`put`, `get`, `delete`, `publicUrl` mandatory; `list`, `deletePrefix`, `rename`, `getBytes`, `commitBatch` optional and advertised through `capabilities` / `model`) and register a factory that builds it from the settings stored in `config/storage`:

```ts
import { registerStorageConnector } from "@agent-cms/runtime";

registerStorageConnector({
  id: "my-host",
  create(settings: { endpoint: string; token: string; siteUrl: string }) {
    return {
      id: "my-host",
      model: "files",
      capabilities: { list: false, rename: false, renameFolder: false, folders: false, deletePrefix: false },
      async put({ path, content, encoding }) { /* upload */ },
      async get(path) { /* return UTF-8 text */ return ""; },
      async delete(path) { /* must resolve when already gone */ },
      async publicUrl(path) { return `${settings.siteUrl}/${path}`; },
    };
  },
});
```

Register from your plugin's `register()` — external bundles load before the first publish. Selecting the target is done in Settings by an admin; the built-in form only knows the in-tree connectors, so a plugin shipping a connector should also ship a settings page that calls `updatePluginConfig` / writes `config/storage` via its own UI.

### Sub-folder deployments (API ≥ 1.4)

`basePathFromBaseUrl(settings.baseUrl)` returns `"/repo"` for `https://user.github.io/repo` (`""` at the domain root) and `withBasePath(path, base)` prefixes root-absolute paths. Published HTML is rewritten automatically; use these only for URLs you build outside the HTML (generated JSON, inline scripts). Client-side scripts read `<meta name="x-cms-base">` instead.

## React + i18next imports

External bundles use these like normal — they get redirected at runtime:

```ts
import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import type { ComponentType } from "react";
```

What they must NOT do: bundle their own copy. Always externalise these in `vite.config.ts`. The import-map handles the rest.

## What's NOT exposed

- `services/*` — admin-internal data-backend and publish-connector code (beyond the helpers re-exported above). Plugins should stay pure: they react to hooks but shouldn't reach into the admin's storage layer directly.
- `core/types.ts` — internal types live under their own paths. External authors copy the relevant subset.
- `lucide-react` icons — bundle them yourself (icons are pure SVG components, no shared state, duplication is harmless).

## Sentinels for theme authors

Two markers MUST appear in your `BaseLayout` for plugin output to land:

```html
<head>
  <!-- ... your tags ... -->
  <meta name="x-cms-head-extra" />
</head>
<body>
  <!-- ... your content ... -->
  <script type="application/x-cms-body-end" />
</body>
```

`core/render.tsx` does a string replace on these post-`renderToStaticMarkup`. Without them, plugins like `agentcms-favicon`, `agentcms-rss`, `core-seo` and `agentcms-custom-code` silently no-op on your theme.
