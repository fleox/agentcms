# Marketplace Core — AgentCMS theme

App-store style theme for listing **themes and plugins** for the AgentCMS. Modern Corporate aesthetic with ambient shadows, rounded XL corners, blue primary, and Hanken Grotesk + Inter typography.

## Build & install

```bash
cd external/themes/marketplace-core
npm install --legacy-peer-deps
npm run build
```

This type-checks against the shared `@agent-cms/runtime` types and produces `marketplace-core.zip` at the project root, containing:
- `manifest.json` — install metadata (id, version, apiVersion), read by the admin when the ZIP is installed
- `bundle.js` — ESM module that default-exports the `ThemeManifest`; the stylesheet is embedded as `cssText` and published to `/theme-assets/marketplace-core.css` (through `compileCss`, so Style-tab overrides are baked in) by **Sync theme assets** and on every theme-settings save
- `README.md` — this file

The theme also ships pre-installed with AgentCMS (bundled default); this folder is its source. From the repo root, `node dist/agent/agentcms.mjs ext check external/themes/marketplace-core` validates it and renders a demo site.

Install on your CMS:

1. Open `/admin/#/themes` on your AgentCMS site
2. Click **Install theme** (top right)
3. Drag and drop `marketplace-core.zip`
4. Activate the theme on the Themes page once installed
5. Open `/admin/#/theme-settings` to configure the 5 tabs (Home / Product page / Sidebar / Footer / Style)

## Content model

Each marketplace listing (theme or plugin) is a regular CMS post:

| Post field | Marketplace meaning |
|---|---|
| `title` | Product name (e.g. "Modernist CRM Interface") |
| `excerpt` | One-line tagline |
| `heroMediaId` | Main preview screenshot |
| `primaryTermId` | Category — Themes / Plugins / E-commerce / Analytics / Auth / etc. |
| `tags` | Topical tags |
| `authorId` | Creator (admin user) |
| `contentMarkdown` | Description + theme blocks (new posts are seeded with the 4 product blocks) |

### 9 theme blocks (embed in post / page bodies)

Each block is an editor node (insert it from the `/` menu or the "+" inserter, edit it in the Block tab) stored as a `<div data-cms-block="marketplace-core/<id>" data-attrs="<base64 JSON>"></div>` marker — the theme's `post.html.body` filter expands it at publish time.

Product blocks (single product pages):

- **`marketplace-core/header-buttons`** — Free badge + Download URL + Live Preview URL (right column of the single page hero)
- **`marketplace-core/gallery`** — Thumbnail strip below the hero image, click to swap the main image
- **`marketplace-core/specs`** — 2-column spec table (Version / License / Last Updated / Requires AgentCMS ≥ …)
- **`marketplace-core/features`** — Bento of "Key Features" with icon + title + description per item

Landing blocks (home / about / marketing pages): **`landing-hero`**, **`feature-grid`**, **`feature-row`**, **`stats-bar`**, **`cta-banner`** (all under the `marketplace-core/` namespace).

Authoring tip: the easiest way to populate these is to import the companion content bundle (`demo-content/marketplace-core/`) and edit from the admin afterwards.

## Layout map

### Home
- Hero gradient banner (primary → tertiary)
- Featured Plugins section (2 wide cards, sourced from the configured category)
- New Themes section (3-col grid, sourced from the configured category)
- Recently Updated section (optional, 3-col grid of newest posts across all categories)

### Single product
- Left: hero image (16:10) + thumbnail strip
- Right: category + title + author + excerpt + Free badge + Download/Preview buttons
- Below: Description prose + Specifications table + Key Features bento

### Category archive
- Breadcrumb + title + description + 3-col grid

### Author page
- Profile card (avatar + name + title + bio)
- Filter tabs (All / per-category) — inline JS, no external loader
- 3-col grid of the author's products

### Mobile
- Sidebar collapses to a bottom-nav bar (Home / Themes / Plugins)
- Cards stack to single column
- Hero section keeps the gradient

## Brand customisation

Theme Settings → **Style** tab:
- Palette: color tokens editable via `<input type="color">`
- Typography: Headline font + Body font, picked from the bundled presets

Theme Settings → **Footer** tab: copyright line and the wordmark text (header + footer).

**Save & apply** stores the config and re-uploads the compiled CSS, so palette and font changes are live without a separate *Sync theme assets*.

## License

Use freely — no attribution required.
