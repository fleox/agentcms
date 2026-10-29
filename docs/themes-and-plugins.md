# Themes and plugins

How themes and plugins work inside the admin, and what every built-in plugin does. To build your own as a standalone project, see [creating-a-plugin.md](creating-a-plugin.md) and [creating-a-theme.md](creating-a-theme.md).

## Creating a new theme

You can start from either built-in theme:

- **`default/`** — SCSS-based pipeline. Variables + manual `@layer` blocks.
- **`magazine/`** — Tailwind-based pipeline. `tailwind.config.cjs` + `theme.css` with `@tailwind` directives + Material 3 palette as RGB triplets.

Steps:

1. Copy `src/themes/default/` (SCSS) or `src/themes/magazine/` (Tailwind) to `src/themes/<your-theme-id>/`.
2. Update `manifest.ts` with a unique `id`, `name`, `version`.
3. Edit `templates/*.tsx` and the stylesheet as needed. Components receive only serialisable props — don't import Firestore hooks from theme code.
4. Register the theme by appending `<your-theme-id>Manifest` to `THEMES` in `src/themes/index.ts`.
5. Run `npm run build`, then sync theme assets from the admin.

For Tailwind themes, `scripts/build-theme-tailwind.mjs` runs before Vite (wired into `prebuild` and `predev`) and compiles each theme's `tailwind.config.cjs` + `theme.css` into `theme.compiled.css`, which the manifest then `?inline`-imports. For iterative work, run `npx tailwindcss -c <config> -i <input> -o <output> --watch` in a separate terminal — Vite HMR picks up the rewritten file. SCSS themes go through the Sass pipeline in `build-themes.mjs` instead.

The active theme is selected per-site in **Themes**. Switching activates a "Regenerate site" workflow that re-publishes every online post.

### Theme settings page

Each theme can ship its own configuration page reachable at `/admin/#/theme-settings`. The sidebar entry **Theme settings** appears automatically when the active theme declares one — switch themes and the entry follows.

```ts
import type { ThemeManifest, ThemeSettingsPageProps } from "../types";

interface MyThemeConfig {
  accentColor: string;
}

const DEFAULT_CONFIG: MyThemeConfig = { accentColor: "#476558" };

function MyThemeSettingsPage({ config, save }: ThemeSettingsPageProps<MyThemeConfig>) {
  // `config` is already merged with defaultConfig.
  // `save(next)` writes the whole blob to settings/site.themeConfigs.<id>.
  return (
    <input
      value={config.accentColor}
      onChange={(e) => save({ ...config, accentColor: e.target.value })}
    />
  );
}

export const manifest: ThemeManifest<MyThemeConfig> = {
  id: "my-theme",
  // …
  settings: {
    navLabelKey: "title",        // i18n key in the theme's namespace
    defaultConfig: DEFAULT_CONFIG,
    component: MyThemeSettingsPage,
  },
  i18n: {
    en: { title: "My theme settings", colorLabel: "Accent color" },
    fr: { title: "Réglages du thème", colorLabel: "Couleur d'accent" },
  },
};
```

Storage lives at `settings/site.themeConfigs.<theme-id>` in Firestore — same real-time subscription as the rest of the admin. Inside theme components rendered at publish time, the resolved config is exposed as `site.themeConfig` on `SiteContext`.

Translations are loaded into a dedicated i18next namespace named `theme-<id>` so settings pages call `useTranslation("theme-<id>")` without colliding with admin keys.

Tabs inside the settings page are a theme concern — render a tab strip in your component the way the default theme does (single `useState` for the active tab + conditional sections).

### Default theme — Logo upload

The default theme exposes a **General** tab with a logo upload. Workflow:

1. Admin opens **Theme settings → General** and uploads a JPG / PNG / WebP image.
2. The image is resized client-side (canvas, no server) into a 480 × 144 WebP and pushed to `theme-assets/default-logo.webp` on the publish target.
3. The theme config saves `{ logoEnabled: true, logoUpdatedAt: <ms> }` and the admin re-publishes `data/menu.json` with a new `branding.logoUrl` (the URL is cache-busted via `?v=<logoUpdatedAt>`).
4. The runtime `menu-loader.js` already loaded on every published page picks up the branding block on the next page load and replaces the text wordmark inside `[data-cms-brand]` with an `<img>`.

So a logo change pushes only **one** small JSON file (`menu.json`) plus the logo binary — no need to re-publish every post HTML. Removing the logo runs the same flow with `logoEnabled: false` and best-effort deletes the WebP file.

### Default theme — Style tab (colors, fonts, spacing, radius)

The **Style** tab in the default theme's settings page lets admins customize the entire design token set without re-rendering posts. Click **Save & apply** to push a regenerated CSS file to the publish target.

Editable surface (22 tokens + 2 fonts):

- **Surfaces**: `--color-bg`, `--color-surface`, `--color-surface-{low,mid,high,highest}` — page background and tonal layers
- **Foreground**: `--color-on-surface`, `--color-on-surface-variant`, `--color-on-surface-muted` — text colors
- **Outlines**: `--color-outline`, `--color-outline-variant`
- **Accent**: `--color-primary`, `--color-on-primary`, `--color-secondary`, `--color-secondary-container`, `--color-on-secondary-container`
- **Spacing & layout**: `--container-max`, `--gutter`, `--section-gap`
- **Corner radius**: `--radius-{sm,,lg,xl}`
- **Typography**: serif and sans-serif Google Fonts, picked from a curated list (Newsreader, Lora, Playfair Display, EB Garamond, Source Serif 4, Cormorant Garamond / Inter, Plus Jakarta Sans, Outfit, Manrope, DM Sans, Work Sans)

How it works under the hood:

1. The original compiled CSS is bundled into the admin via Vite's `?inline` import (`manifest.cssText`).
2. The fonts are loaded via `@import url(...)` at the **top of the SCSS file** (not the HTML), so swapping fonts means rewriting one line in the CSS and re-uploading — no HTML republish.
3. `buildCustomCss(baseCssText, style)` (in `src/themes/default/style.ts`) takes the bundled CSS, replaces the `@import url(...)` with the URL for the chosen font pair, and appends a new `:root { ... }` block with the user's variable overrides. Cascade resolves later declarations as winners on equal specificity.
4. The result is uploaded over `theme-assets/default.css` — the same path every published page references. Browsers may serve a cached copy until a hard refresh.
5. **`compileCss` hook on the manifest** wires this transformation into the **Themes → Sync theme assets** flow so syncing won't wipe customizations: the bundled CSS is the *baseline*, the regenerator is the *live state*.

Reset to defaults: clears the `style` config and pushes the baseline CSS untouched.

## Creating a plugin

Plugins are bundled into the admin and toggled on/off per site in **Plugins** (the **Plugins** tab on `/admin/#/plugins`). Each plugin exports a manifest with a `register(api)` function that hooks into the registry. Optionally, a plugin can also ship its own settings page and translations.

```ts
// src/plugins/my-plugin/manifest.ts
import type { PluginManifest } from "../index";

export const manifest: PluginManifest = {
  id: "my-plugin",
  name: "My plugin",
  version: "1.0.0",
  description: "What it does.",
  register(api) {
    api.addFilter<string>("page.head.extra", (head) => head + "<meta name=\"x\" />");
    api.addAction("publish.complete", (post, ctx) => {
      console.log("published", post, "site has", ctx.posts.length, "posts");
    });
  },
};
```

Then add it to `PLUGINS` in `src/plugins/index.ts`.

### Available hooks

| Hook | Type | Payload |
|---|---|---|
| `post.markdown.before` | filter | `(markdown, post)` — modify Markdown before rendering. |
| `post.html.body` | filter | `(html, post)` — modify rendered post HTML. |
| `post.template.props` | filter | `(props, post)` — modify the props passed to the active template. |
| `page.head.extra` | filter (sync) | `(html, baseProps)` — inject extra `<head>` markup. |
| `page.body.end` | filter (sync) | `(html, baseProps)` — inject extra markup right before `</body>`. Use for tracking scripts, deferred widgets, etc. |
| `menu.json.resolved` | filter | `(menu, ctx)` — mutate the resolved `{ header, footer }` shape just before `data/menu.json` is uploaded. `ctx` exposes `settings`, `posts`, `pages`, `terms`. |
| `publish.before` | action | `(post, ctx)` |
| `publish.after` | action | `(post, ctx)` |
| `publish.complete` | action | `(post, ctx)` — fires after the post is uploaded and listings refreshed. |
| `post.unpublished` | action | `(post, ctx)` — fires after `unpublishPost` wipes the post's files. |
| `post.deleted` | action | `(post, ctx)` — fires after `deletePostAndUnpublish` removes the post. |

`ctx` is a `PublishContext` (exported from `src/services/publisher.ts`) containing the up-to-date `posts`, `pages`, `terms`, `media`, and `settings` snapshots — already patched to reflect the just-completed transition. Plugins can read it to recompute derived files (sitemaps, search indexes, RSS feeds, …).

### Plugin settings pages

A plugin can expose a config page reachable at `/admin/#/settings/plugin/<plugin-id>`. The plugins list shows a **Configure** link on the matching card, and a tab is added to the Settings layout's tab strip for every enabled plugin that declares one.

```ts
import type { PluginManifest, PluginSettingsPageProps } from "../index";

interface MyConfig {
  greeting: string;
}

const DEFAULT_CONFIG: MyConfig = { greeting: "hello" };

function MySettingsPage({ config, save }: PluginSettingsPageProps<MyConfig>) {
  // `config` is already merged with `defaultConfig` — every field is set.
  // `save(next)` writes the whole blob to settings/site.pluginConfigs.<id>.
  return (
    <input
      value={config.greeting}
      onChange={(e) => save({ ...config, greeting: e.target.value })}
    />
  );
}

export const manifest: PluginManifest<MyConfig> = {
  id: "my-plugin",
  // …
  settings: {
    navLabelKey: "title",   // i18n key in the plugin's namespace
    defaultConfig: DEFAULT_CONFIG,
    component: MySettingsPage,
  },
};
```

The config blob is stored under `settings/site.pluginConfigs.<plugin-id>` in Firestore, so the same real-time subscription that drives the rest of the admin reaches plugin settings — no extra listeners. Inside an action-hook handler, read the live config from `ctx.settings.pluginConfigs?.[<plugin-id>]`.

### Plugin translations

Plugins ship their own translations as a manifest field. They land in a dedicated i18next namespace named after the plugin id, so plugin UI uses `useTranslation('<plugin-id>')` without colliding with admin keys:

```ts
// src/plugins/my-plugin/manifest.ts
export const manifest: PluginManifest = {
  // …
  i18n: {
    en: { title: "My plugin", help: "Does something useful." },
    fr: { title: "Mon plugin", help: "Fait quelque chose d'utile." },
  },
};

// inside the settings page component
const { t } = useTranslation("my-plugin");
return <h2>{t("title")}</h2>;
```

Bundles are loaded once at module import and persist regardless of plugin enable state — translations are cheap and orthogonal to the runtime hook registration.

## Must-use plugins (mu-plugins)

A plugin placed under `src/mu-plugins/` instead of `src/plugins/` is **always active** — there is no enable / disable toggle in the admin and no entry in `settings.enabledPlugins`. Use this folder for behaviour the site cannot meaningfully run without (favicons, future features that ship as plugins for code organisation but aren't optional for users). The mechanism mirrors WordPress's [must-use plugins](https://wordpress.org/documentation/article/must-use-plugins/) directory.

The manifest shape, hook API, settings page support, and i18n bundles are **identical** to regular plugins — a must-use plugin is just a plugin that lives in a different folder. To convert between the two, move the folder and update the import in `src/mu-plugins/index.ts` or `src/plugins/index.ts`.

```ts
// src/mu-plugins/my-mu-plugin/manifest.ts
import type { PluginManifest } from "../../plugins";

export const manifest: PluginManifest = {
  id: "my-mu-plugin",
  name: "My must-use plugin",
  version: "1.0.0",
  register(api) {
    api.addFilter<string>("page.head.extra", (head) => head + "<meta name=\"x\" />");
  },
};
```

Then add it to `MU_PLUGINS` in `src/mu-plugins/index.ts`. The plugin loader registers MU plugins **before** regular plugins on every `applyPluginRegistration()` pass, regardless of the enabled-flags map; settings pages declared by MU plugins appear in the **Settings** tab strip alongside regular-plugin tabs.

In the admin at `/admin/#/plugins`, two tabs split the UI:

- **Plugins** — regular plugins, with the standard Enable / Disable button.
- **Must-use** — MU plugins. Each card shows a discreet **Must-use** badge and no toggle. Configure / Learn more remain available.

## Built-in plugins

### `core-seo`

Adds Twitter Card meta tags and a `<meta name="generator">` hint to every published page. Hooks into `page.head.extra`. No settings — toggle it off in **Plugins** if you don't want the extra markup.

### `agentcms-sitemaps`

Generates and maintains the public site's sitemaps and `robots.txt`. Configure under **Settings → Sitemaps** (tab visible only when the plugin is enabled).

Files produced on the public site (relative to your `baseUrl`):

- `sitemap-<year>.xml` — one per year that has at least one online post (and page, when configured). Built from `createdAt`; `<lastmod>` reflects `updatedAt`.
- `sitemap-index.xml` — index referencing every yearly sitemap that's currently populated, plus the News sitemap when enabled.
- `sitemap-news.xml` — Google News urlset of articles modified within the configured window (default 2 days, range 1–30). Optional.
- `sitemap-news-<lang>.xml` — per-language Google News urlset, ONE per enabled secondary language when both News (in this plugin) AND the `agentcms-multilang` plugin (with at least one secondary language) are active. Each file lists only the translated URLs of recent posts that have a translation in that locale, with `<news:language>` set to the locale code. Referenced from `sitemap-index.xml`. When News is toggled off in this plugin's settings, ALL per-language news sitemaps disappear from the index too — they're built and indexed together via the `sitemap.news.locales` hook so file payloads and `<sitemap>` references can never drift out of sync.
- `robots.txt` — user-supplied; defaults to `User-agent: *` + `Allow: /` + `Disallow: /admin/` + a `Sitemap:` line per generated sitemap. The `Disallow: /admin/` line keeps the admin SPA out of search-engine indexes (the admin's `index.html` also ships with `<meta name="robots" content="noindex, nofollow, noarchive">` as a fallback for crawlers that ignore robots.txt).
- `sitemap.xsl` and `sitemap-news.xsl` — XSL stylesheets referenced by every sitemap file via an `<?xml-stylesheet?>` processing instruction. When a browser opens a sitemap URL, these transform the raw XML into a styled HTML table for human inspection. Crawlers ignore the PI entirely. Labels honor `settings.language` (English / French baked in).

Configuration options:

- **Content types** — sitemaps include posts only, or posts and pages.
- **Generate sitemap-news.xml** — toggle. When enabled, sets the News window in days.
- **robots.txt content** — full editable textarea. **Insert default** repopulates with the auto-generated body. **Save & regenerate robots.txt** persists the config and re-uploads `robots.txt` in one click.
- **Upload stylesheets** — uploads `sitemap.xsl` (and `sitemap-news.xsl` when News is enabled) to the public site root. Run this once after installing the plugin, and again whenever the public site language changes.
- **Force regenerate sitemaps** — re-derives every yearly sitemap, the index, the News sitemap, the XSL stylesheets, and `robots.txt` from the current corpus. Use after toggling content types or after a bulk import.

Incremental regeneration is automatic: every `publish.complete`, `post.unpublished`, and `post.deleted` rebuilds the year sitemap that contains the touched post, plus the index, plus News. Years that empty out have their sitemap deleted from the public site so the index never points to a stale file.

The lifecycle hooks **do not** re-upload the XSL stylesheets — those change rarely. After installing the plugin or changing `settings.language`, click **Upload stylesheets** (or **Force regenerate**) once to refresh them; subsequent content publishes don't pay that cost.

### `agentcms-rss`

Generates RSS 2.0 feeds for the site and optionally per category. Configure under **Settings → RSS feeds**.

Files produced on the public site (relative to your `baseUrl`):

- `rss.xml` — site-wide feed of the latest online posts (count configurable, default 20). Categories can be excluded individually.
- `<category-slug>/<category-slug>.xml` — one per category feed enabled via the settings page. Slugs match the category archive folder so a reader can guess the URL from `/<category>/`.
- `rss.xsl` — shared stylesheet referenced by every feed file via an `<?xml-stylesheet?>` PI. Renders feeds as a styled HTML table when a human opens the URL in a browser; RSS readers ignore the PI and parse XML directly.

Configuration options:

- **Site feed** — toggle on/off, item count (1–100), excluded categories (multi-select), "Show in footer" checkbox.
- **Category feeds** — pick a category from an autocomplete combobox to add a new feed; per-feed item count + footer toggle. Removing a feed deletes its file on the next save.
- **Save settings** — persists the config, deletes files for disabled or removed feeds, and re-publishes `data/menu.json` so the footer toggles take effect immediately.
- **Upload stylesheet** — uploads `rss.xsl` only. Run after a public-language change.
- **Force regenerate all feeds** — saves config + uploads XSL + regenerates every enabled feed + re-publishes the menu.

Incremental regeneration is automatic on every `publish.complete`, `post.unpublished`, and `post.deleted`: only the impacted feeds are rebuilt — the site feed (when the post's category isn't excluded) and the matching category feed (when one exists for `post.primaryTermId`). The plugin persists `lastPublishedPath` after each upload so a later category-slug rename can clean up the old file. The XSL is **not** re-uploaded by lifecycle hooks; refresh it via **Upload stylesheet** or **Force regenerate**.

Item descriptions use `post.excerpt` when set, otherwise the first ~300 characters of the markdown rendered to plaintext. Sort order is `publishedAt DESC` (with `updatedAt` / `createdAt` fallbacks).

Cover images: when a post has a `heroMediaId`, the item gets an RSS 2.0 `<enclosure url="..." length="..." type="..."/>` element. Most modern readers (Feedly, Inoreader, NetNewsWire, Reeder) display this as the article thumbnail. Variant selection prefers `large`, falls back to the asset's `defaultFormat`, then any available variant — same chain as the publisher's `og:image`. Legacy single-URL media is supported transparently. `length` is the variant's stored byte count (`0` when unknown, which readers tolerate); `type` is the asset's `contentType` or guessed from the URL extension.

Footer items injected by this plugin appear at the **end** of the resolved footer in `data/menu.json`. Labels are auto-generated: `RSS` for the site feed, `RSS — <category name>` for per-category feeds. To control placement or labels manually, leave the addToFooter checkboxes off and add custom items via **Menus** with the feed URL as an external link.

### `agentcms-favicon` (must-use)

Lives under `src/mu-plugins/` — always active, cannot be disabled in the admin (every site benefits from a favicon by default).

Generates the full set of favicon files plus a Progressive Web App manifest from a single uploaded image. Configure under **Settings → Favicons**.

Files produced under `/favicon/` on the public site:

- `favicon-96x96.png` — modern browser favicon (96×96)
- `apple-touch-icon.png` — iOS home-screen icon (180×180, white background to avoid Safari masking transparency)
- `web-app-manifest-192x192.png` and `web-app-manifest-512x512.png` — PWA install icons (purpose: maskable)
- `favicon.ico` — multi-size legacy icon (16/32/48 PNG payloads packed via a pure-JS encoder under `src/mu-plugins/agentcms-favicon/icoEncoder.ts`)
- `favicon.svg` — vector variant. Only generated when the source upload is itself an SVG (passthrough); skipped silently for raster sources since rasterizing a PNG into SVG produces fake-vector output.
- `site.webmanifest` — PWA manifest JSON

Generation happens entirely in the admin browser via `createImageBitmap` + canvas resize (cover-crop to square). Source image accepts PNG, JPG, WebP and SVG.

Configuration options:

- **Upload + replace** — file picker with live preview of the largest generated PNG.
- **Status grid** — checklist showing which favicon files are currently published.
- **PWA manifest** — `name` (default `settings.title`), `short_name` (default first 12 chars), `theme_color`, `background_color`, `display` mode (`standalone` / `browser` / `fullscreen` / `minimal-ui`).
- **Save & regenerate manifest** — pushes only `site.webmanifest` (no need to re-process the source image when only colors / names change).
- **Remove all** — wipes every file under `/favicon/`.

Head injection happens automatically via the `page.head.extra` filter — every published page receives the appropriate `<link rel="icon">` / `<link rel="apple-touch-icon">` / `<link rel="manifest">` tags plus a `<meta name="theme-color">` when PWA is configured. Tags only emit for files actually present on the site (the per-format flags in the plugin config drive this), so partial setups don't produce broken links. Cache-busting via `?v=<uploadedAt>` ensures browsers pick up replacements without manual refresh.

### `agentcms-blocks` (must-use)

Lives under `src/mu-plugins/` — always active. Ships first-party editor blocks the post / page editor relies on:

- **Custom HTML** — paste arbitrary HTML into a block. Inspector hosts a CodeMirror-backed editor with line numbers, syntax highlighting, and a fullscreen modal for long blobs.
- **Columns** — multi-column layout block (configurable count) for side-by-side content.

Disabling these would silently strip blocks from existing posts on the next render — they're must-use to prevent that footgun. New blocks belong in this plugin (or in their own dedicated plugin if they're optional).

### `agentcms-custom-code` (must-use)

Lives under `src/mu-plugins/` — always active. Configure under **Settings → Custom code**.

Two free-form code zones injected into every published page:

- **Head** — appended to the bottom of `<head>`. Use for analytics (Google Analytics, Plausible), web fonts, custom `<style>` overrides.
- **Body end** — appended just before `</body>`. Use for deferred scripts (chat widgets, late analytics) that need the DOM parsed.

Both editors share the CodeMirror component used by the Custom HTML block (lazy-loaded so the bundle ships only once). Code is injected **as-is** — no sanitisation. A broken `<script>` can take down the whole site until you fix it; the editor surfaces a warning to that effect.

Hooks: `page.head.extra` and `page.body.end`. Reading the live config from the resolved `BaseLayoutProps` keeps the filter handlers stateless.

### `agentcms-embeds` (must-use)

Lives under `src/mu-plugins/` — always active. Adds editor blocks for **YouTube**, **Vimeo**, **Twitter / X**, and **Spotify**. Each block is an atom Tiptap node that round-trips through Markdown as `<div data-cms-embed="<provider>" data-id="<x>" data-url="<y>"></div>`, so embeds survive editor saves without losing the source URL.

At publish time the publisher rewrites each marker into the provider's actual iframe / blockquote (via the `post.html.body` filter), and per-page detection injects a single `<style>` tag plus any provider-specific scripts (Twitter's `widgets.js` is the only one needing JS today — YouTube / Vimeo / Spotify are iframe-only). Pages without embeds pay zero overhead.

Adding a new provider = one entry in [src/mu-plugins/agentcms-embeds/providers.ts](../src/mu-plugins/agentcms-embeds/providers.ts) + one i18n key pair. Disabling this plugin would silently strip embeds from existing posts on the next render — must-use to prevent that footgun.

## Plugin / theme architecture

The CMS now ships every plugin (except mu-plugins) and every theme except `default` as **separate ESM bundles** loaded at runtime — same mechanism as user-installed externals. This means admins can uninstall any of the bundled plugins/themes they don't want, with the same UI used for third-party installs.

**Three categories**:

- **Mu-plugins** (`src/mu-plugins/`) — bundled into the admin SPA, always-on. These are foundational pieces (favicon, custom code injection, embeds, blocks, metrics, **agentcms-import**) that the admin can't meaningfully run without. Cannot be uninstalled or disabled.
- **In-tree externalised plugins / themes** — source lives in `src/plugins/<id>/` and `src/themes/<id>/`. At `npm run build` time, [scripts/build-bundled-externals.mjs](scripts/build-bundled-externals.mjs) compiles each into its own ESM bundle under `dist/admin/plugins/<id>/` (or `dist/admin/themes/<id>/`) and lists them in `dist/admin/external.json`. The admin loads them at boot via the runtime loader. Includes: `core-seo`, `agentcms-sitemaps`, `agentcms-rss`, `agentcms-archives`, `agentcms-search`, `magazine` theme, `corporate` theme.
- **User-uploaded externals** — third-party plugins/themes installed via the admin's upload UI. Same runtime mechanism.

The **`default` theme** stays bundled inside the admin SPA as a fallback — when a user uninstalls every external theme, the admin falls back to `default` so the public site never ends up unrendered.

**Restoring bundled defaults**: if a user uninstalls a plugin/theme that was bundled with their admin version (e.g. `core-seo`) and later wants it back, the **Plugins / Themes → Install** modal shows a "Bundled defaults available" section with a one-click **Restore** button. This reads `dist/admin/external.default.json` (a build-time snapshot of what shipped) and re-adds the missing entries to the runtime registry. Only the registry is touched; the bundle files are already on the site from the most recent admin deploy.

**Where the runtime registry lives**: the **list of currently-loaded externals** is stored in the data backend (Firestore `settings/externalRegistry`, or the `config/externalRegistry` document on the other backends), NOT as a file on the site. This means the entire `dist/admin/` folder is fully re-deployable — re-uploading the build (e.g. for an admin upgrade) never overwrites the user's install/uninstall state. The on-disk `external.default.json` is the immutable baseline (what shipped with the build); the legacy on-disk `external.json` is read-only-from-the-CMS and exists only as a one-time migration source for installs that pre-date the Firestore move.

**Boot fallback chain**: on every cold load, the registry resolves in this order — Firestore → legacy `/admin/external.json` → `/admin/external.default.json`. The first non-empty result is materialised back into Firestore so subsequent boots short-circuit at the Firestore step.

## External plugins & themes

In addition to in-tree plugins (committed under `src/plugins/`) and in-tree themes (under `src/themes/`), the admin supports **external** packages that ship as a `.zip`, install via an in-admin upload UI, and load at runtime — no rebuild of the admin required.

- **Install** — admin **Plugins** / **Themes** → click **Install plugin** / **Install theme** → pick a `.zip`. The admin extracts client-side, uploads the contents to `<admin folder>/plugins/<id>/` or `<admin folder>/themes/<id>/` on the publish target, adds an entry to the external registry in the data backend, and reloads. The new entry appears alongside the built-ins.
- **Uninstall** — same modal lists installed external entries with an **Uninstall** button. The entry is removed from the registry, then the files are deleted from the publish target.
- **Upgrade** — upload a newer ZIP with the same `id`: the old folder is replaced in place. Copying files next to the admin by hand is not enough, since the registry lives in the data backend.

External bundles use the **same hook API and manifest shapes** as in-tree plugins/themes. The admin's `index.html` ships an [import-map](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/script/type/importmap) that redirects `react`, `react-dom`, `react-i18next`, and `@agent-cms/runtime` to runtime stubs in `/admin/runtime/` — bundles externalise these specifiers at build time and at runtime get redirected to the live admin instance, guaranteeing one React copy across admin and bundle (required for hooks integrity).

Authoring docs and ready-to-build scaffolds:

- [docs/creating-a-plugin.md](creating-a-plugin.md) — full guide for external plugin authoring.
- [docs/creating-a-theme.md](creating-a-theme.md) — full guide for external theme authoring.
- [docs/runtime-api-reference.md](runtime-api-reference.md) — public API surface (`@agent-cms/runtime` exports, hook list, manifest shapes).
- [external/plugins/hello-plugin/](../external/plugins/hello-plugin/) — minimal plugin scaffold (head meta tag + dashboard card).
- [external/plugins/agentcms-multilang/](../external/plugins/agentcms-multilang/) — reference multi-language plugin. Per-locale URLs, per-language editor tabs (post title / slug / body / SEO), per-term name + slug + description + SEO, per-language menu labels, hreflang + canonical reciprocity, sitemap `<xhtml:link>` alternates, per-language RSS feeds. Built and bundled into `dist/admin/plugins/agentcms-multilang/` by `npm run build`; pre-installed on fresh deployments via `external.default.json`. See the [authoring guide](creating-a-plugin.md) for the variant-provider pattern used here.
- [external/themes/minimal-theme/](../external/themes/minimal-theme/) — minimal theme scaffold (six templates + hand-written CSS).
- [external/themes/marketplace-core/](../external/themes/marketplace-core/) — full marketplace theme (custom blocks, settings page, palette + font overrides).

Compatibility: external bundles declare an `apiVersion` in their `manifest.json`; the admin checks it against `[CMS_API_MIN_VERSION, CMS_API_VERSION]` at install + at every boot, and skips out-of-range bundles with a console warning. Browser support: import-maps are native in Chrome 89+, Firefox 108+, Safari 16.4+ (covers virtually every admin user).
