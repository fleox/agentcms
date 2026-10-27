# Minimal Theme — AgentCMS external theme example

A deliberately small theme that shows the contract every AgentCMS theme follows. It is compiled into one ES module (`bundle.js`) and installed from the admin (**Themes → Install theme**) — no admin rebuild.

## What it shows

- The six required templates: `base`, `home`, `single`, `category`, `author`, `notFound`, typed with the shared `@agent-cms/runtime` types.
- `BaseLayout` essentials: a `<title>` that falls back to the site title (the latest-posts home passes an empty `pageTitle`), `<html lang>` from `currentLocale`, a canonical URL via `canonicalUrl()`, the stylesheet from `site.themeCssPath`, home links through `site.homePath`, and the two plugin sentinels (`<meta name="x-cms-head-extra" />`, `<script type="application/x-cms-body-end" />`).
- A home that renders either the static page chosen in Settings (`staticPage`) or the latest posts.
- Menus rendered at publish time from `site.resolvedMenus`, refreshed in the browser from `/data/menu.json` by a tiny runtime loader (`src/runtime/menu-loader.js`, shipped as `jsText` → `/theme-assets/minimal-theme-menu.js`). The loader honours `<meta name="x-cms-base">`, so sub-folder sites work.
- A hand-written stylesheet (`src/theme.css`) imported with `?raw` as `cssText`.

## Build and test

```bash
npm install
npm run build     # type-check + dist/bundle.js + minimal-theme.zip
```

From the AgentCMS repo root you can validate it and render a demo site:

```bash
node dist/agent/agentcms.mjs ext check external/themes/minimal-theme
node dist/agent/agentcms.mjs ext preview external/themes/minimal-theme --screenshots
```

## Install

1. Admin → **Themes** → **Install theme** → pick `minimal-theme.zip`.
2. After the reload, **Activate** it. Activation syncs theme assets (CSS + menu loader) and regenerates every page.

Re-uploading a ZIP with a higher `version` upgrades in place.

## Package layout

```
minimal-theme.zip
├── manifest.json   ← id, name, version, apiVersion, entry
├── bundle.js       ← ESM, default-exports the ThemeManifest (CSS embedded as cssText)
└── README.md
```

See `docs/creating-a-theme.md` in the AgentCMS repo for the full guide.
