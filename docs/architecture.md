# Architecture

How the admin turns content into a static site: the publish pipeline, URLs, menus, images, translations and the code layout. Contributor notes live in [CLAUDE.md](../CLAUDE.md) and [AGENTS.md](../AGENTS.md).

## Overview

```
              ┌────────────────────────────┐
              │  Admin SPA (e.g. /admin/)  │
              │  (React + TypeScript)      │
              └─────┬────────────┬─────────┘
                    │            │
        Data backend              Publish target
        (SQLite file, Markdown    (git repo, S3 bucket,
         in git, Firebase or       local folder or ZIP:
         this browser)             HTML, CSS, images)
                    │            │
                    ▼            ▼
              ┌──────────────────────────┐
              │  Public static site at / │
              │  index.html              │
              │  category/article.html   │
              │  theme-assets/*.css      │
              │  media/yyyy/mm/*.webp    │
              └──────────────────────────┘
```

Posts are stored as Markdown in the data backend. When an admin clicks **Publish**, the SPA:

1. Loads the active theme (React components + a pre-compiled CSS bundle).
2. Converts Markdown to safe HTML.
3. Renders the active template tree to a static HTML string (`react-dom/server.renderToStaticMarkup`).
4. Writes the file to its target path through the active publish connector (one commit per publish on git targets).
5. Re-uploads any pages whose listing depends on the change (home, category archive).

## Project layout

```
agentcms/
├── src/
│   ├── core/            CMS-wide infrastructure (types, slug, render, markdown, plugin registry, runtime API)
│   ├── services/        Data backends (firebase/, docstore/), publish connectors (storage/), git layer, publisher
│   ├── context/         React contexts (auth, data, theme)
│   ├── components/      Admin UI building blocks
│   ├── pages/           Admin pages (one file per route) + the setup wizard
│   ├── themes/          Public-site themes (one folder per theme)
│   │   ├── default/     Default theme — SCSS-based, base/home/single/category/author/404 + components
│   │   ├── magazine/    Magazine theme — Tailwind + Material 3 palette, editorial/long-form layout
│   │   ├── corporate/   Corporate theme — Tailwind, lead-gen blocks
│   │   ├── portfolio/   Portfolio theme
│   │   └── storefront/  Storefront theme
│   ├── plugins/         WordPress-style plugins, toggleable via /admin/#/plugins
│   │   ├── core-seo/          Built-in SEO plugin (Twitter cards + generator hint)
│   │   ├── agentcms-sitemaps/ Built-in plugin: yearly sitemaps, sitemap-index, optional News, robots.txt
│   │   ├── agentcms-rss/      Built-in plugin: RSS feed at /rss.xml + per-category feeds
│   │   ├── agentcms-archives/ Built-in plugin: static archive pages under /archives/
│   │   └── agentcms-search/   Built-in plugin: static search-index.json + runtime modal for [data-cms-search] triggers
│   ├── mu-plugins/      Must-use plugins — same API as plugins/, but always active (cannot be disabled)
│   │   ├── agentcms-favicon/     Favicon generator (PNG, ICO, SVG, PWA manifest)
│   │   ├── agentcms-blocks/      Extra editor blocks (Custom HTML, Columns, …)
│   │   ├── agentcms-custom-code/ Site-wide HTML/CSS/JS injection (head + body end)
│   │   ├── agentcms-embeds/      YouTube / Vimeo / Twitter / Spotify embed blocks
│   │   ├── agentcms-metrics/     Dashboard card with content counts
│   │   └── agentcms-import/      Markdown / WordPress import
│   ├── i18n/            Admin UI translations (en, fr, de, es, nl, pt, ko)
│   └── lib/             Small utilities (runtime config, toasts, admin folder detection)
├── agent/               The agentcms CLI (published to npm as @agent-cms/agentcms)
├── plugin/              Claude Code plugin + agent skills
├── hermes/              Hermes Agent skills (generated from plugin/skills) + Python scripts
├── external/            External plugin / theme sources and scaffolds
├── scripts/
│   ├── build-theme-tailwind.mjs Compiles each Tailwind-based theme's CSS before vite build (prebuild + predev)
│   └── build-themes.mjs         Copies theme.compiled.css or compiles theme.scss into dist/theme-assets/<id>.css
└── public/
```

## URL strategy

- Top-level pages: `/<page-slug>.html`
- Posts without a category: `/<post-slug>.html`
- Posts with a category: `/<category-slug>/<post-slug>.html`
- Category archives: `/<category-slug>/index.html`
- Home: `/index.html`
- 404 fallback: `/404.html`

Tags do not appear in URLs. All slugs are lower-case ASCII, dash-separated.

## Slug uniqueness

Two posts / pages / categories must never share the same public URL — static hosts are case-sensitive and a duplicate would silently overwrite the other on the next publish.

- **Auto-generated slugs (new entities)**: when the title produces a slug already in use, the admin appends `-2`, `-3`, … until the resulting path is free. You never think about it for the common case.
- **User-edited slugs**: validated live against existing entities. If you type a slug that collides, an inline error appears under the field naming the conflicting entity, and the **Save** button is disabled.

Collision is computed against the **final URL path**, not just the raw slug:

| Entity A | Entity B | Same slug? | Same path? | Collision? |
|---|---|---|---|---|
| Post `news` (no category) | Page `news` | yes | both `/news.html` | **yes** |
| Post `2026` in `news` | Post `2026` in `events` | yes | `/news/2026.html` vs `/events/2026.html` | no |
| Post `news` (no category) | Category `news` | yes | `/news.html` vs `/news/index.html` | no |
| Tag `news` | Category `news` | yes | tag has no public URL | no |

Helpers live in [src/core/slug.ts](../src/core/slug.ts): `findAvailableSlug`, `detectPathCollision`, `detectTermSlugCollision`.

## Stale path cleanup

Each `Post` carries two fields used by the publisher to keep the public site free of orphaned files:

- `lastPublishedPath` — the path the post is currently live at on the publish target.
- `previousPublishedPaths[]` — paths the publisher tried but **failed** to delete during a previous publish (e.g. a transient API error).

On every publish, before uploading the new file, the publisher attempts to delete every entry in `[lastPublishedPath, ...previousPublishedPaths]` that isn't the new path. Failed deletions (non-404) are persisted back into `previousPublishedPaths` and retried on the next publish.

This guarantees:
- Changing a post's slug or primary category never leaves the old URL accessible.
- A transient publish-target hiccup is recovered automatically next publish.
- Unpublishing wipes every known historical path, not just the most recent one.

## Error handling & toasts

Every publish-target request goes through a single error funnel (`performRequest` in `src/services/storage/http.ts`) that surfaces failures both as thrown `StorageError`s (so calling code can react locally — e.g. retry buttons on the upload card) **and** as flash toasts in the top-right corner of the admin. Toasts include translated, status-aware messages (`storage.errors.*` in the i18n bundles), prefixed with the action that failed:

| Status | Toast message |
|---|---|
| 401 / 403 | "Authentication failed. Check the publish target credentials in Settings." |
| 404 | "Target not found on the publish target." (suppressed for delete calls — 404 is treated as success) |
| 413 | "File too large for the publish target." |
| 429 | "Too many requests, please retry in a moment." |
| 5xx | "Publish target server error ({{status}}). Please retry." |
| Network / CORS | "Network error or CORS blocked. Check your connection." |
| 501 | "Not supported by the "{{connector}}" publish target." |
| Other | Generic message including the status and any error detail returned by the target. |

To emit a toast from anywhere in the codebase:

```ts
import { toast } from "../lib/toast";

toast.success("Saved.");
toast.error("Something broke.");
toast.warn("Heads up.");
toast.info("FYI.");
```

Toasts auto-dismiss after 3.5 s (info / success), 5 s (warn) or 6 s (error). Pass a custom `durationMs` (or `0` for sticky) when needed: `showToast({ level: "error", message, durationMs: 0 })`.

## Dynamic menus

The header / footer menus configured under **Menus** in the admin are loaded **at runtime** by every published page, not baked into the HTML. This means changing a menu item, adding a new page to the menu, or moving a category around does **not** require regenerating every page on the site — the change becomes visible on the next page load anywhere.

### How it works

1. Saving in `MenusPage` (or any publish/unpublish that may have moved a referenced post / term) triggers `publishMenuJson`, which writes a small `data/menu.json` file to the public site with the resolved menu structure.
2. The active theme's `BaseLayout` ships a `<script src="/theme-assets/<id>-menu.js" defer>`. That loader fetches `/data/menu.json` on `DOMContentLoaded` and populates every `[data-cms-menu="header|footer"]` container present on the page.
3. The default theme's loader also wires the burger toggle (`aria-expanded` flip + class toggle for the off-canvas overlay) and sets `aria-current="page"` on the link whose href matches the current URL (so themes can style the active item via CSS).

### Per-language menu labels

Each menu item carries an optional `translations: Record<<lang>, { label? }>` map (edited inline in `MenusPage` when at least one secondary language is enabled in `agentcms-multilang`). The resolver projects non-empty entries into a `labels` map on each resolved item in `data/menu.json`:

```json
{ "id": "…", "label": "Care", "href": "/care/", "labels": { "fr": "Soins" } }
```

Every theme's runtime menu loader reads `document.documentElement.lang` (set per-page by `BaseLayout` based on `currentLocale`), looks up `item.labels[lang]`, and falls back to `item.label` for any locale without an override. A region-stripped fallback handles `<html lang="en-US">` → `en`. On mono-lingual sites the `labels` field is omitted entirely to keep `menu.json` small.

After adding labels: click **Save & generate** on the Menus page (writes the new `menu.json`), then **Regenerate ▾ → Sync theme assets** if the per-language loader code is newer than what's currently on the public site.

### DOM contract for new themes

Any theme that wants dynamic menus exposes empty containers and a companion JS file (declared via `jsText` on the manifest):

```html
<nav class="…" data-cms-menu="header"><ul></ul></nav>
<nav class="…" data-cms-menu="footer"><ul></ul></nav>
```

The loader fills the inner `<ul>`. If `data/menu.json` is unreachable, the containers stay empty and the loader hides them via the `hidden` attribute — no error UI, no empty space.

### Failure mode

A failed menu.json publish toasts an error (the same error funnel as everything else) but **does not** abort the surrounding action (post publish / save). The data backend remains the source of truth; the next successful publish retries the menu upload.

## Image handling

When a user uploads an image, the admin runs the file entirely through a browser-side pipeline (no server):

1. Validates the extension against the active theme's `inputFormats`.
2. Decodes the file via `createImageBitmap`.
3. For each variant declared by the active theme **plus** three admin-only formats (`admin-thumb`, `admin-preview`, `admin-original`), renders a resized canvas and re-encodes it as WebP (or whatever `outputFormat` the theme picked).
4. Uploads each variant to the publish target under `media/<yyyy>/<mm>/<slug>-<hex>/<variant>.webp`.
5. Persists a single `media/{id}` Firestore document referencing every variant by name.

The uploaded source file is **not stored verbatim**. Instead, the pipeline produces an `admin-original` variant: the source resized so the longest axis is capped at 2000 px (no crop, ratio preserved, never upscaled) and re-encoded at quality 90 — purpose-built as a high-fidelity source for future re-crops, not for display. This keeps storage bounded while preserving enough resolution that adding a new theme variant later can regenerate from `admin-original` rather than upscaling a smaller display variant.

A single `ImageFormat` may carry an optional `quality` override on the 0..100 scale. The `admin-original` format uses this to bump from the theme's global quality (default 80) to 90 without affecting display variants. Other variants honour the override transparently if they want it.

### Declaring image formats in a theme

Themes export an `imageFormats` field on their manifest:

```ts
// src/themes/<id>/manifest.ts
export const manifest: ThemeManifest = {
  id: "my-theme",
  // …
  imageFormats: {
    inputFormats: [".jpg", ".jpeg", ".png", ".webp"],
    outputFormat: "webp",
    quality: 80,
    formats: {
      small:  { width: 480,  height: 480, fit: "cover" },
      medium: { width: 800,  height: 800, fit: "cover" },
      large:  { width: 1600, height: 900, fit: "cover" },
    },
    defaultFormat: "medium",
  },
};
```

`fit: "cover"` crops the source to fill the box; `fit: "contain"` shrinks the source to fit inside without cropping (no upscaling).

### Using formats in templates

Theme code receives `MediaView` objects from the publisher. Pick a format with the helper:

```tsx
import { pickFormat } from "../../../core/media";

<img src={pickFormat(hero, "large")} alt={hero.alt ?? ""} />
<img src={pickFormat(hero)} />          // uses defaultFormat (e.g. "medium")
```

`pickFormat` falls back through a chain: requested format → `defaultFormat` → largest available → empty string. This means switching to a theme that asks for a format an old upload doesn't have still renders the image at the next-best size, never broken. For new uploads the chain naturally lands on `admin-original` (2000 px) when nothing else fits — so re-cropping headroom exists for any theme variant up to that bound.

### Storage layout & cleanup

```
media/
  2026/
    05/
      photo-de-vacances-a3f7b2/
        admin-thumb.webp
        admin-preview.webp
        admin-original.webp
        small.webp
        medium.webp
        large.webp
```

Filenames are normalised (lower-case ASCII, dash-separated) and suffixed with a 6-character random hex string to guarantee uniqueness across uploads. Deleting a media item triggers a single `DELETE /files/delete-folder` call that wipes the whole asset folder atomically.

### Backward compatibility

Media uploaded before the multi-variant pipeline keeps its original `{ url, storagePath }` shape. The helpers (`pickFormat`, `pickMediaUrl`, `mediaToView`) read either shape transparently — no migration step required.

Media uploaded between the multi-variant rollout and the `admin-original` addition will not have the `admin-original` key in their `formats` map; nothing breaks (the existing fallback chain handles it) but those assets cannot be re-cropped at full headroom — only the variants that exist on disk are available.

## Internationalisation

The admin UI ships with translations for seven locales:

| Code | Language | |
|---|---|---|
| `en` | English | 🇬🇧 |
| `fr` | Français | 🇫🇷 |
| `de` | Deutsch | 🇩🇪 |
| `es` | Español | 🇪🇸 |
| `nl` | Nederlands | 🇳🇱 |
| `pt` | Português | 🇵🇹 |
| `ko` | 한국어 | 🇰🇷 |

Each user picks their preferred admin language from the **Topbar** language selector or in **Settings → Profile**. The choice is saved on the user's Firestore profile (so it follows them across devices) and in `localStorage` (so reloads don't flash the wrong language). English is the source of truth — `src/i18n/en.json` is the canonical bundle and i18next falls back to it for any missing key in the other locales, so the admin never breaks if a translation is incomplete.

Plugins / mu-plugins / themes ship their own bundled translations alongside their manifest. They're loaded into a dedicated i18next namespace named after the plugin or theme id (e.g. `theme-default`, `agentcms-rss`). All seven admin locales are supported across every built-in plugin and theme.

The site language for the public output is configured separately in **Settings → Site → Site language** (BCP-47), and is injected as `<html lang="…">` on every published page. The bundled `agentcms-sitemaps` plugin also localises the styled sitemap-viewer (the HTML rendering of the XML sitemaps in a browser) for the same seven languages — pick the right one when you upload the XSL stylesheets.

### Multi-language public sites (`agentcms-multilang`)

For sites that publish content in more than one language, install the bundled `agentcms-multilang` plugin (shipped under `external/plugins/agentcms-multilang/`, pre-installed on a fresh deployment via `external.default.json`). It turns AgentCMS into a fully multilingual CMS while keeping the static-publishing model:

- **Per-language URL layout** — primary language at root (`/news/hello.html`), secondary languages prefixed (`/fr/actualites/bonjour.html`). Configure the primary language and the list of secondary languages under **Settings → Multi-language**.
- **Per-post / per-page editor** — when at least one secondary language is enabled, the post editor grows a language tab strip above the canvas. Switching tabs swaps the full editor state (title, slug, body, blocks, excerpt, SEO) for the selected language while keeping the same Tiptap instance alive (so blocks and drag-and-drop survive language switches).
- **Per-term name + slug + description + SEO** — categories and tags expose the per-language fields inline on the Categories & Tags page (chevron to expand). Empty fields fall back to the primary language.
- **Per-language menu labels** — the Menus page renders one extra input per secondary language under each item's primary label. Filled-in values get projected into `data/menu.json` as a `labels` map; the runtime menu loader picks the right one based on `<html lang>`.
- **SEO** — every localised page emits its own `<title>`, `<meta name="description">`, `og:locale` + alternates, and a clean canonical (no `/index.html` suffix). Reciprocal `<link rel="alternate" hreflang="…">` tags are emitted in the head of every variant (including the primary). The sitemap entries carry `<xhtml:link rel="alternate" hreflang="…">` alternates, and `agentcms-rss` emits one feed per locale.
- **Per-locale homes + category archives + author archives** — each locale gets its own `/<lang>/index.html`, `/<lang>/<category>/index.html`, etc. The publisher resolves them through a "shadow context" pass so themes don't need any multilang-specific code — they just render whatever props the publisher hands them.

The plugin is backend-agnostic (works on every data backend). Configure it under **Plugins → Multi-language → Settings**.

### Per-term SEO meta tags

Every category and tag carries an optional `Term.seo = { title?, description?, ogImage? }` block, edited via the **SEO** button on each row of the Categories & Tags page (between the slug input and Save). On the category archive page:

- `term.seo.title` (or the term name as fallback) drives the `<title>` element
- `term.seo.description` (or the term description as fallback) drives `<meta name="description">`
- `term.seo.ogImage` drives `<meta property="og:image">`

When `agentcms-multilang` is enabled, the per-language SEO overrides live inside the expanded translations section on each row (one collapsible block per secondary language carries the localized `seoTitle` + `seoDescription`).

### Discourage search engines from indexing

A WordPress-style toggle lives under **Settings → Site → Search-engine indexing → Discourage search engines from indexing this site**. When enabled:

- Every published HTML page receives `<meta name="robots" content="noindex,nofollow">`
- The bundled `agentcms-sitemaps` plugin forces `robots.txt` to `User-agent: *\nDisallow: /`, overriding any user-supplied robots content

Use it during the staging phase of a new site so search engines don't index draft URLs. Toggle it off (and click **Regenerate ▾ → Everything**) before going live.

## Tests

```bash
npm test          # runs the Vitest suite once
npm run typecheck # TypeScript strict mode
```

Critical units have unit tests:

- `core/slug` — URL building, slugification, validation.
- `core/pluginRegistry` — filter/action ordering, sync vs. async semantics.
