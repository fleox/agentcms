---
name: extension-internals
description: Contributor notes for plugins, themes and the extension API INSIDE the AgentCMS repo — in-tree plugins (src/plugins, src/mu-plugins), in-tree themes (src/themes), the bundled-externals build (scripts/build-bundled-externals.mjs), extending @agent-cms/runtime (cmsRuntime.ts, the runtime stub, types/agentcms-runtime.d.ts, CMS_API_VERSION) and adding a hook. Invoke when changing any of those in this repository. For authoring a standalone plugin or theme, use the distributed skill plugin/skills/agentcms-extensions instead.
---

# AgentCMS extensions — contributor notes (this repo)

This skill covers what is specific to working **inside** the AgentCMS repository. Authoring itself (manifest shapes, hooks, templates, blocks, settings pages, build config, `agentcms ext new|check|preview|pack|install`) is documented in:

- the distributed authoring skill: [`plugin/skills/agentcms-extensions/SKILL.md`](../../../plugin/skills/agentcms-extensions/SKILL.md) — follow it for any plugin / theme code, in-tree or not;
- [`docs/creating-a-plugin.md`](../../../docs/creating-a-plugin.md), [`docs/creating-a-theme.md`](../../../docs/creating-a-theme.md), [`docs/runtime-api-reference.md`](../../../docs/runtime-api-reference.md);
- the API contract of record: [`types/agentcms-runtime.d.ts`](../../../types/agentcms-runtime.d.ts).

Read [CLAUDE.md](../../../CLAUDE.md) and [AGENTS.md](../../../AGENTS.md) first. Don't commit unless asked. For the `agentcms` CLI, the distributed skills, the Hermes skills and multi-agent QA runs, see [`agent-cli-internals`](../agent-cli-internals/SKILL.md).

## Where extensions live

| Kind | Source | Shipped as | Registered |
|---|---|---|---|
| MU plugins (always on) | `src/mu-plugins/<id>/`, listed in `src/mu-plugins/index.ts` | compiled into the admin bundle | first, on every `applyPluginRegistration()`, no enable flag |
| In-tree plugins | `src/plugins/<id>/` (core-seo, agentcms-sitemaps, agentcms-rss, agentcms-archives, agentcms-search) | separate ESM bundle `dist/admin/plugins/<id>/bundle.js` | dev: static `PLUGINS` array; prod: the external loader |
| `default` theme | `src/themes/default/` | compiled into the admin (fallback theme) | always in `THEMES` |
| Other in-tree themes | `src/themes/<id>/` (magazine, corporate, storefront, portfolio) | `dist/admin/themes/<id>/bundle.js` | dev: `DEV_THEMES`; prod: the external loader |
| Bundled external sources | `external/plugins/agentcms-multilang/`, `external/themes/marketplace-core/` | built by the root build from `srcDir` **and** buildable standalone (own `package.json`) | external loader (pre-installed via `external.default.json`) |
| Examples only | `external/plugins/hello-plugin/`, `external/plugins/agentcms-sliders/`, `external/themes/minimal-theme/` | their own `npm run build` → `<id>.zip` (committed with `dist/bundle.js`) | installed by hand |

`src/plugins/index.ts` and `src/themes/index.ts` keep static imports of every in-tree manifest but gate the arrays on `import.meta.env.DEV`: in `npm run dev` they register directly (HMR works); in production the arrays are empty, Rollup tree-shakes the manifests, and the admin loads them like any user-installed external. So a change to an in-tree plugin/theme is only visible in a production build after `npm run build`.

In-tree code imports admin internals through `@agent-cms/runtime` (the root `tsconfig.json` aliases it to `src/core/cmsRuntime.ts`). Plugins/themes must not import other `src/` modules directly when they ship as externals — that would bundle a second copy of the module (separate state). Exception: pure, stateless helpers and types.

### The bundled-externals build

`npm run build` = `vite build` → `scripts/build-themes.mjs` (theme CSS → `dist/theme-assets/`) → **`scripts/build-bundled-externals.mjs`** → `scripts/pack-bundled-zips.mjs` → `scripts/write-admin-manifest.mjs` → CLI build → `scripts/write-version.mjs`. `prebuild` / `predev` run `scripts/build-theme-tailwind.mjs` (Tailwind themes: `theme.css` → `theme.compiled.css`).

`build-bundled-externals.mjs`:

- builds each entry of its hard-coded `PLUGINS` / `THEMES` arrays with the root Vite (alias `@agent-cms/runtime` → `src/core/cmsRuntime.ts`, `EXTERNAL_DEPS` = the six import-map specifiers, `define process.env`, one `bundle.js`), into `dist/admin/{plugins,themes}/<id>/`;
- writes a `manifest.json` per entry from the **hard-coded `{ id, name, version }` metadata** plus its own `CMS_API_VERSION` constant, copies the theme CSS next to themes, and writes `dist/admin/external.default.json` (the immutable baseline used to seed fresh installs and by **Restore** in the install modal);
- `srcDir` points an entry at `external/<kind>/<id>/src` (multilang, marketplace-core).

Rules:

- **Any change to a bundled entry's code — even documentation-only metadata like `settings.schema` / `attrsSchema` — needs a version bump**, because the manifest.json stamp and the CLI's registry alignment use it. One bump per release is enough: if the entry was already bumped since the last published version, don't bump again. List the bumped versions in the changelog entry ("Bundled versions: …").
- **The hard-coded `version` must equal the source manifest's `version`** (and, for the `external/` entries, `manifest.json` + `package.json` of that folder). The admin's Plugins/Themes page shows the bundle's version; the loader cache-busts with the registry version (`?v=<version>`) — a mismatch shows a wrong version and an unchanged registry version keeps browsers on the old bundle. Bump all of them together on every change to an entry.
- Adding a new in-tree plugin/theme to the distribution = add its manifest to the DEV array in `src/plugins/index.ts` / `src/themes/index.ts` **and** an entry here (+ a `README.md` next to its source, packed into `dist/packs/<kind>/<id>.zip` by `pack-bundled-zips.mjs`).
- `dist/packs/{plugins,themes}/<id>.zip` are committed install links for bundled entries; they are regenerated from `external.default.json` — delete stale ones by hand when an entry is renamed or removed.
- The build must stay reproducible (fixed ZIP dates, no timestamps): CI rebuilds and rejects a committed `dist/` that differs. Rebuild and commit `dist/` with any change to these sources.
- A bundled `external/` entry must also build and pass checks standalone: `cd external/<kind>/<id> && npm run build` (type-checks against `types/agentcms-runtime.d.ts` via its `tsconfig.json` paths) and `node dist/agent/agentcms.mjs ext check external/<kind>/<id>`. Commit its refreshed `dist/bundle.js` and `<id>.zip`.

## Extending the runtime API

Adding (or changing) something plugins/themes can import from `@agent-cms/runtime`:

1. **`src/core/cmsRuntime.ts`** — add it to the `runtime` object (`window.__AGENTCMS_RUNTIME__`) **and** to the named `export { … }` block.
2. **`public/runtime/cms-runtime.js`** — `export const name = R.name;` (bundles import this stub at runtime through the import-map).
3. **`types/agentcms-runtime.d.ts`** — `export declare function …` with a doc comment; add/adjust the interfaces it uses. Self-contained: only `react` types may be imported; Firebase / Tiptap / i18next types are structural stand-ins.
4. **`src/core/runtimeTypes.test.ts`** — add the value to `_curatedValuesFromReal` (compile-time: the real export must be assignable to the curated declaration), and a `Mutual<Real.X, Curated.X>` check for any new shared interface. The vitest part checks that the three value-export lists (stub, cmsRuntime.ts, .d.ts) are identical. Run `npm run typecheck` and `npx vitest run src/core/runtimeTypes.test.ts`.
5. **Version**: a new export / hook / optional field is a **minor** bump of `CMS_API_VERSION` in `cmsRuntime.ts` (append a line to the version history comment above it) — and of the `CMS_API_VERSION` constant at the top of `scripts/build-bundled-externals.mjs` (stamped on every bundled `manifest.json`), the header of `types/agentcms-runtime.d.ts` ("Describes CMS runtime API **x.y.z**") and the version table in `docs/runtime-api-reference.md`. Removing or changing something incompatibly is a **major** bump and needs `CMS_API_MIN_VERSION` raised (old bundles stop loading) — avoid it. `scripts/write-admin-manifest.mjs` reads both constants from `cmsRuntime.ts` into `dist/admin/admin-files.json` (`apiVersion`, `apiMinVersion`), which `agentcms ext install` checks bundles against.
6. **Docs + skill**: `docs/runtime-api-reference.md` (exports by area), the authoring docs if it changes how to write extensions, and `plugin/skills/agentcms-extensions/` (AGENTS.md rule: skills follow the code). CLAUDE.md keeps the list of runtime exports in "In-tree plugins / themes are built as externals" — update it too.
7. A new **bare specifier** (another shared library) needs, in addition: an import-map entry in `index.html`, a stub in `public/runtime/`, `EXTERNAL_DEPS` in `build-bundled-externals.mjs`, the externals list of the scaffold (`agent/ops/extScaffold.ts` `VITE_CONFIG`), the CLI's import-map emulation (`agent/ops/extHost.ts`) and every example `vite.config.ts` under `external/`. Prefer adding a function to `@agent-cms/runtime` instead.

## Documenting settings and blocks for agents (API ≥ 1.5 / 1.6)

Agents configure extensions through the CLI, so every bundled extension documents what it accepts:

- **`settings.schema`** (`SettingsSchema` on plugin / theme `settings`, API 1.5): `{ "<dot path>": { description, values?, min?, max?, format? } }` in a `settingsSchema.ts` next to the manifest. `agentcms plugins|themes config <id> --schema` lists every leaf of `defaultConfig` with these docs; `--set` / `--merge` refuse CHANGED values outside `values` / `min`–`max` and non-hex colors where `format` says "hex color" (`agent/ops/settingsSchema.ts`). Fields the extension manages itself (timestamps, logo flags, published paths) get a description starting with **"Managed by the plugin — don't set."** / **"Managed by the theme — don't set."**: `--set` keeps them (`keepManaged`).
- **`attrsSchema`** (`BlockManifest`, API 1.6): same shape, keyed by marker attribute, in an `attrsSchema.ts` next to the block manifest. `agentcms content blocks <id>` shows it and refuses `--attrs` outside closed lists. Arrays get one entry describing the item shape (`format: "array of objects"`).
- **`values` must list EVERY value the code accepts** (unions, inspector options, render fallbacks) — a missing value blocks legit content. Use min/max only where the code clamps. Read the render code, not just the inspector.
- Render code: an empty string the user leaves in an attribute must fall back to the default (`attrs.x || default`, not `??`), because `content blocks --attrs` merges over the block's inserted sample (which often has `""`).
- `ext check` validates both (`settings-schema-default`: defaults must pass their own schema; `block-undocumented`, `settings-undocumented` warnings). Theme "config not read by any template": say so in the description instead of documenting a promise.

## Adding a hook

1. Fire it: `applyFilters` / `applyFiltersSync` (only when it must run inside a synchronous render) / `doAction` in the core (usually `src/services/publisher.ts` or `src/core/render.tsx`). Actions take `(payload, ctx)` with `ctx` = the `PublishContext` (patched to the post-action state for lifecycle actions), so handlers need no ad-hoc fetching. Consider bulk mode (`ctx.bulkMode`): per-entity lifecycle actions are skipped there and plugins rely on regeneration targets.
2. **`agent/ops/extCheck.ts`** — add the name to `KNOWN_FILTERS` or `KNOWN_ACTIONS` (and to `SYNC_FILTERS` when fired with `applyFiltersSync`), otherwise `agentcms ext check` warns `unknown-hook` / misses `async-sync-filter`. (Coordinate with whoever owns `agent/` in the current change.)
3. **`types/agentcms-runtime.d.ts`** — add it to `KnownFilterHook` / `KnownActionHook` with its arguments in the doc comment, plus payload interfaces if any (and mutual checks in `runtimeTypes.test.ts` when the payload type exists in `src/`).
4. **Docs** — the hook tables in `docs/runtime-api-reference.md`, the hook list in CLAUDE.md ("Plugin system"), and the distributed skill.
5. Bump the minor `CMS_API_VERSION` (see above) so bundles can declare they need it.

Hooks fired by a bundled plugin (e.g. `sitemap.*` in `src/plugins/agentcms-sitemaps/generator.ts`, `rss.site.locales` in `agentcms-rss`, `search.index.locales` in `agentcms-search` — API 1.6) follow the same steps. The per-language pattern (`sitemap.news.locales`, `rss.site.locales`, `search.index.locales`): the generic plugin fires a filter with `(entries[], { posts, pages, terms, settings, config })`, agentcms-multilang returns one `{ language, path, … }` per enabled language with its translated corpus, the generic plugin writes them and deletes the paths it no longer receives (track them in a "Managed by the plugin" config key).

## Multi-language rules (agentcms-multilang)

- Localized renders go through a shadow ctx; use `localizeSettings(settings, lang, config)` (translated `siteTexts.title/description`) for anything that shows the site title / description — plugins that build their own context (archives) read `pluginConfigs["agentcms-multilang"].siteTexts[lang]` themselves.
- A post translation is published only when its category is translated in that language (`computeAdditional.ts`).
- Removing a language: `lastPublishedLanguages` drives `cleanupRemovedLanguages` (deleteFolder `<lang>/` when the target can, else known paths). Never delete the primary language or a code equal to a category slug.
- The core deletes `lastPublishedPathsByLocale` paths on unpublish / delete (`publisher.ts`) and orphaned ones on publish / regenerate-all.

## Checks before handing over

```bash
npm run typecheck
npx vitest run src
node dist/agent/agentcms.mjs ext check external/plugins/<id>      # or external/themes/<id>
npm run build && npm run check:skills && npm run check:hermes    # when dist/ must be refreshed
```

`npx vite build --config vite.agent.config.ts` rebuilds only the CLI (enough to run `ext check` after changing `agent/` or the runtime).
