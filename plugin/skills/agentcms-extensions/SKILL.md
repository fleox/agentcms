---
name: agentcms-extensions
description: Create, test and ship AgentCMS plugins and themes - scaffold a project, write templates / hooks / editor blocks / settings pages, validate the bundle exactly as the admin loads it, render a demo site (with screenshots), pack the ZIP and install it on a site. Use when the user wants a new theme or plugin for AgentCMS, wants to change or debug one, or asks how AgentCMS extensions work.
license: PolyForm-Noncommercial-1.0.0
metadata:
  version: "0.3.12"
  repository: "https://github.com/fleox/agentcms"
---

# Build AgentCMS plugins and themes

**Language:** talk to the user in their language; code, comments, files and these instructions stay in English.

## How AgentCMS runs extensions (read this first)

AgentCMS is a static CMS. Its admin is a single-page app that runs **in the browser**; there is no server. When an editor publishes, the admin renders every page with the active **theme**'s React templates (`react-dom/server` `renderToStaticMarkup`, in the browser) and uploads plain HTML/CSS/JSON to the site's hosting (GitHub/GitLab/Cloudflare Pages, an S3 bucket…). Visitors only ever get those static files.

An extension is **one ES module** (`bundle.js`) plus a `manifest.json`, packed in a ZIP:

- The admin uploads the ZIP's files to `<admin folder>/plugins/<id>/` or `<admin folder>/themes/<id>/` on the hosting and records it in the site's data.
- At every admin load it `import()`s `bundle.js` and reads its **default export**: a `PluginManifest` or a `ThemeManifest`.
- The bundle gets React, react-dom, react-i18next and the CMS API (`@agent-cms/runtime`) from the admin through an **import map**. These must stay **external** at build time: a bundled copy of React crashes every hook. Everything else you import is bundled.
- **Plugins** register hooks (filters/actions), editor blocks, dashboard cards and settings pages. `register(api)` re-runs on a freshly reset registry after **every** settings change, so it must only register things.
- **Themes** provide six templates (`base`, `home`, `single`, `category`, `author`, `notFound`), their CSS (`cssText`, uploaded to `theme-assets/<id>.css`), optional runtime JS (menus from `data/menu.json`), image formats, editor blocks and a settings page. Templates are **pure functions of their props**: no effects, no fetch, no `window`/`document`.
- Content is Markdown. Custom editor blocks are stored in it as empty marker `<div data-cms-block="<id>/<block>" data-attrs="…">`, which a `post.html.body` filter turns into HTML at publish time.

The extension never knows which data backend or hosting the site uses: it only talks to the runtime API, so the same ZIP works on every site.

## The toolchain: `agentcms ext`

Every command is `npx -y @agent-cms/agentcms@0.3.12 ext <action> … --json` (Node.js 20.6+, 22+ for screenshots). `--help` after any command prints its usage. Inside a scaffolded project the same CLI is a dev dependency, so use its npm scripts: `npm run build`, `npm run check`, `npm run preview`, `npm run serve`. For JSON, add `-s` so npm prints nothing else: `npm run -s check -- --json`.

| Action | What it does |
|---|---|
| `ext new plugin\|theme <id> [--with …] [--dir <path>] [--name "…"] [--description "…"] [--author "…"] [--force]` | Scaffolds a complete, working project: Vite config, strict TypeScript wired to the runtime's types, manifest, README, AGENTS.md. `--with` adds optional parts: plugins `settings,block,i18n,dashboard-card`; themes `settings,block`. Themes always include a menu loader. `--force` writes into a non-empty folder. |
| `ext check <project\|folder\|zip>` | Validates the package the way the admin installs, loads and publishes it: manifest.json, bundle imports (no bundled React, no unresolvable import), the default export, the hooks it registers, each editor block (inserted in a headless editor configured like the admin's, round-tripped through Markdown, then published), and a full demo site rendered by the real publisher, with HTML checks for themes. For plugins it also simulates publish → unpublish → delete → bulk publish and reports, per step, the files the plugin itself added, changed or removed (`data.output.lifecycle`). `--out <dir>` keeps the rendered demo site. Exit code 1 when `data.valid` is false. |
| `ext preview <path…> [--theme <id>] [--enable <ids>] [--screenshots] [--serve] [--port <n>] [--base-path /blog] [--out <dir>] [--site <alias>] [--settings '{…}'] [--theme-config '{…}'] [--plugin-configs '{…}']` | Renders a complete demo site into a folder. It contains home, posts, a page, category and author archives, 404, `data/*.json`, plugin outputs, and `block-test.html` with each of your editor blocks. Demo images come in landscape, portrait, panorama and square. `--screenshots` saves full-page desktop and phone PNGs of every kind of page using a local Chrome/Chromium/Edge. `--serve` serves the site on http://localhost:4321/. `--base-path /blog` renders and serves it as a site hosted in a sub-folder. `--home blocks` makes the block test page the static home page, for designing a landing page made of blocks. `--demo empty` renders without posts or menus, for empty states. `--screenshot-js "<code>"` runs code in each page before its screenshot. `--site <alias>` renders a registered site's real content instead (read-only). `--settings`, `--theme-config` and `--plugin-configs` override configuration (JSON). |
| `ext pack <project>` | Writes `<id>.zip` for the admin's **Install** button. `npm run build` already does this. |
| `ext install <zip> --site <alias> [--activate] [--no-regenerate] [--yes]` | Uploads the package to a registered site and records it. It always checks first and only prints the plan without `--yes`. When the package is activated, or upgrades the active theme / an enabled plugin, the whole site is regenerated with it in the same command (`--no-regenerate` skips that). |
| `ext list --site <alias>` / `ext uninstall <id> --site <alias> [--yes]` | Lists or removes a site's installed extensions. |

## Workflow

1. **Understand the request.** Is it a *theme* (how the public site looks: markup, CSS, layouts) or a *plugin* (behaviour: extra tags or files, editor blocks, admin pages)? A new look is a theme. Adding something to any theme is a plugin. Pick an id: lower-case letters, digits and single dashes, globally unique (e.g. `acme-blog`). `core-*`, `agentcms-*` and `default` are reserved.
2. **Scaffold.**
   ```bash
   npx -y @agent-cms/agentcms@0.3.12 ext new theme acme-blog --with settings --json
   cd acme-blog && npm install
   ```
   Only add `--with block` when the user wants an editor block: it bundles Tiptap (~200 KB).
3. **Read the scaffold**, then the reference for what you are building:
   - [references/themes.md](references/themes.md): templates, props, CSS, settings, runtime JS, images, base path.
   - [references/plugins.md](references/plugins.md): register lifecycle, settings pages, i18n, writing files, dashboard cards, regeneration.
   - [references/hooks.md](references/hooks.md): every filter and action, with arguments and timing.
   - [references/blocks.md](references/blocks.md): editor blocks, inspectors, Markdown markers, publish transforms.
   - [references/runtime-api.md](references/runtime-api.md): everything `@agent-cms/runtime` exports. The authoritative signatures with doc comments are in `node_modules/@agent-cms/agentcms/types/agentcms-runtime.d.ts`.
   - [references/pitfalls.md](references/pitfalls.md): mistakes that break extensions, with their symptom. Skim it before you finish.
4. **Implement.** Keep the scaffold's structure, build settings and conventions (see the golden rules below).
5. **Verify after every meaningful change:**
   ```bash
   npm run build && npm run -s check -- --json
   ```
   Fix every error (each one has a `hint`) and read every warning. Then render the site:
   ```bash
   npm run -s preview -- --json
   ```
   If you can view images, open the files listed in `data.screenshots.files` (desktop and mobile of home, single, page, category, author, 404, block test page) and judge the design like a user would: layout, contrast, spacing, broken images, overflow on the phone. Otherwise read the HTML files in `data.outDir`. Iterate until it is right.
   - Test the settings: `--theme-config '{"…":"…"}'` / `--plugin-configs '{"<id>":{…}}'`, `--settings '{"language":"fr"}'`.
   - Demo content ids, for `--settings` such as `{"homeMode":"static-page","homePageId":"page-about"}`:
     - pages: `page-about`, `page-block-test`;
     - posts: `post-why-static` (hero, category, tags), `post-hosting`, `post-release`, `post-design`, `post-no-image` (no image, no category), plus the draft `post-draft`;
     - categories: `cat-guides`, `cat-news`;
     - author: `author-ada`.
   - Test empty states: `--demo empty`. For a landing page, use `--home blocks`.
   - Test sub-folder hosting: `npm run -s preview -- --base-path /blog --json`; every link and fetched URL must stay under `/blog/`.
   - Plugins: read `data.output.lifecycle` from the check; every file your plugin maintains must be updated at each step, **including `bulk-publish`**.
   - Before each capture the page is scrolled to the bottom and back, so scroll-triggered reveals (IntersectionObserver fade-ins) are visible; the shot is taken at the top. `--max-height <px>` caps the height (e.g. 800 for above the fold only).
   - Screenshots show each page in that state. To capture another state (consent accepted, menu open), add `--screenshot-js "document.querySelector('[data-accept]').click()"`, run once per state with a different `--out`. Full-page captures place `position: fixed` elements wherever the viewport was, often mid-page; that's an artefact of the capture.
   - Offer `npm run serve` so the user can browse the demo site themselves and click through runtime behaviour.
6. **Ship.** `npm run build` leaves `<id>.zip` in the project. Then either:
   - the user installs it in their admin (**Plugins** or **Themes** → **Install**, drop the ZIP; installing a ZIP whose version is newer upgrades in place); or
   - for a site this computer manages (`npx -y @agent-cms/agentcms@0.3.12 site list --json`):
     ```bash
     npx -y @agent-cms/agentcms@0.3.12 ext install acme-blog.zip --site <alias> --json          # plan only
     npx -y @agent-cms/agentcms@0.3.12 ext install acme-blog.zip --site <alias> --activate --yes --json
     ```
     The plan answer has `data.needsConfirmation: true` (nothing written). Show the plan and get the user's go before `--yes`. With `--activate` (or when upgrading the active theme), every page (and `404.html`) is regenerated in the same command: `data.regenerated` reports it; otherwise relay `data.next`. The CLI reads the bundle straight from the hosting, so a Pages host or CDN still serving the old version doesn't matter; visitors see the new pages after the host's next deployment (about a minute, more after bursts of commits: `doctor` reports a pending deployment). Works on every backend the CLI manages (Firebase, Markdown in git, SQLite file); Firebase sites sign in with their `firebase:<name>` login, so group installs to stay under Firebase's sign-in rate limit.
   - After switching to a theme with other image formats, `media regenerate --site <alias>` (plan, then `--yes`) re-crops existing media to them; then `regenerate all`.
   - Before testing a theme on a live site, `ext preview <project> --site <alias> --screenshots` shows it with the site's real content and the plugins it uses (sitemaps, RSS, archives, search…), without touching the site.
7. **Releases.** Bump `version` in all three places together: `manifest.json`, `src/manifest.tsx` and `package.json` (the admin cache-busts the bundle with that version), rebuild, check, reinstall.

## Golden rules

- **Externals are exactly** `react`, `react/jsx-runtime`, `react-dom`, `react-dom/client`, `react-i18next`, `@agent-cms/runtime`. Keep `define: { "process.env.NODE_ENV": JSON.stringify("production") }`, `esbuild: { jsx: "automatic", jsxDev: false }` and `inlineDynamicImports: true` (one file). Never import `react-dom/server`, `react/jsx-dev-runtime`, `firebase` or admin internals.
- **Named imports only** from `@agent-cms/runtime` (it has no default export). `applyFilters` / `applyFiltersSync` / `doAction` are runtime exports, not methods of `api`. `api.registerRegenerationTarget` exists only on `api`.
- **Same `id` everywhere**: `manifest.json`, the bundle's manifest, folder names, i18n namespace (`<id>` for plugins, `theme-<id>` for themes), block ids `<id>/<block>`.
- `apiVersion` in manifest.json is the extension API you build against (the scaffold sets the current one). An admin refuses anything newer than what it supports.
- **Themes:** BaseLayout keeps `<meta name="x-cms-head-extra" />` in `<head>` and `<script type="application/x-cms-body-end" />` before `</body>`, with nothing changed in them. Fall back to the site title when `pageTitle` is empty (latest-posts home). Use `lang={currentLocale || site.settings.language || "en"}` and home links to `site.homePath ?? "/index.html"`. Link the stylesheet as `<link rel="stylesheet" href={"/" + site.themeCssPath} />`. Write `"/" + card.url` (CardPost urls have no leading slash, `category.url` has one). Templates stay pure.
- **Plugins:** `page.head.extra` / `page.body.end` (and the sitemap filters) are **synchronous**; never pass an `async` function. Always return the incoming value, extended (`head + mine`), never only your own string. If you react to `publish.complete`, also register a regeneration target, because bulk publishing and Regenerate don't fire it.
- **Root-absolute URLs** (`/x/y.html`) in `href`/`src` are rewritten automatically for sites hosted in a sub-folder. URLs built at runtime in JS must be prefixed with `<meta name="x-cms-base">` (see themes.md). Write files with `uploadFile({ path: "no/leading/slash.json", content })` from the runtime, inside `withStorageBatch` when you write several.
- **Admin UI** (settings pages, inspectors, dashboard cards): every `<form>` gets `data-form-type="other"`; buttons keep a stable DOM (no `{saving ? <A/> : <B/>}`); user-facing strings go through `useTranslation("<namespace>")` with at least an `en` bundle. Only classes the admin's own CSS contains work. Safe ones:
  - components: `.btn-primary .btn-secondary .btn-ghost .btn-danger` (each includes `.btn`), `.input .label .card .chip`
  - layout: `flex grid gap-2/3/4 space-y-1…6 items-center justify-between w-full max-w-xl max-w-2xl p-4 mt-2 mt-4 mb-2 md:grid-cols-1/2/3 hidden block rounded`
  - text: `text-xs text-sm text-lg text-xl font-medium font-semibold`, and muted text with `text-surface-300…600`

  Use inline styles for anything else.
- Blocks need `nodeName` (the Tiptap node name), a marker that is an **empty** `<div>`, attrs stored base64-encoded in `data-attrs`, and a `post.html.body` transform that **escapes** what it outputs (it is not sanitised afterwards).

## When the CLI can't run

If Node/npm is unavailable (e.g. a chat without a shell), write the project by hand following the reference files: the Vite config in [references/plugins.md](references/plugins.md) (“Build setup”), the manifests, and the templates in [references/themes.md](references/themes.md). Tell the user to run `npm install && npm run build` and then `npx -y @agent-cms/agentcms@0.3.12 ext check .` before installing the ZIP.

## Debugging an installed extension

- **Bundle not loading** (the admin shows "N external bundle(s) failed to load"): run `ext check` on the same ZIP. Common causes are a bundled React, an import the import map doesn't provide, an id mismatch, or an apiVersion newer than the site's admin (`npx -y @agent-cms/agentcms@0.3.12 status --json` shows the site's admin version).
- **Plugin output missing on pages:** the theme lacks a sentinel (`ext check` on the theme), the plugin is disabled, or the pages were published before the plugin was installed (Regenerate → Everything).
- **Block has no inspector:** `nodeName` is missing or wrong; `ext check` reports it.
- **Theme CSS changes not visible:** Themes → Sync theme assets (saving the theme's settings page also re-uploads it), then hard-refresh the browser.
