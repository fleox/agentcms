# Creating a plugin

An AgentCMS plugin is one ES module (`bundle.js`) plus a `manifest.json`, shipped as a `.zip` and installed from the admin (**Plugins → Install plugin**) — no admin rebuild. It runs **in the browser, inside the admin**: there is no server. A plugin changes what the admin publishes (hooks into the publish pipeline), adds editor blocks, dashboard cards, settings pages and editor panels, and can write extra files to the site.

This guide is for humans and AI agents. The API reference of record is the type file shipped in the npm package: [`types/agentcms-runtime.d.ts`](../types/agentcms-runtime.d.ts) (every export of `@agent-cms/runtime`, documented). [runtime-api-reference.md](./runtime-api-reference.md) is the guided overview and the hook table.

## Quick start

Node.js 20+.

```bash
npx -y @agent-cms/agentcms@0.2.0 ext new plugin my-plugin --with settings,block
cd my-plugin
npm install
npm run build      # tsc + vite build + agentcms ext pack . → my-plugin.zip
npm run check      # validates the package and renders a demo site with the plugin enabled
npm run preview    # full demo site + desktop/mobile screenshots (paths are printed)
```

`--with` is optional: `settings`, `block`, `i18n`, `dashboard-card`. The project gets `@agent-cms/agentcms` as a devDependency — it provides the `agentcms` CLI used by the scripts and the `@agent-cms/runtime` types (mapped in `tsconfig.json`).

Then install it:

- **From the admin**: **Plugins → Install plugin** → pick `my-plugin.zip`. The admin uploads it, registers it and reloads; the plugin is enabled on install.
- **From a terminal / an agent**: `npx -y @agent-cms/agentcms@0.2.0 ext install my-plugin.zip --site <alias>` prints the plan, add `--yes` to apply. `ext list --site <alias>` and `ext uninstall <id> --site <alias> --yes` manage installed extensions.

Uploading a ZIP with the same `id` upgrades in place (no uninstall needed). **Bump `version` on every release** (see below).

`agentcms ext check` is the fastest feedback loop: it imports the bundle the way the admin does, records every registration, round-trips blocks through a headless editor, renders a demo site through the real publisher and reports errors (exit code 1) and warnings, each with a hint. Run it after every change; add `--json` for a machine-readable report.

## Project anatomy

```
my-plugin/
├── manifest.json     install metadata (id, name, version, apiVersion, entry)
├── package.json      scripts: build, check, preview, serve, typecheck
├── tsconfig.json     maps @agent-cms/runtime → node_modules/@agent-cms/agentcms/types/agentcms-runtime.d.ts
├── vite.config.ts    library build → dist/bundle.js (React & co. external)
├── src/manifest.tsx  default-exports the PluginManifest
├── README.md         shipped in the ZIP; also manifest.readme ("Learn more" in the admin)
└── AGENTS.md         notes for coding agents working on the project
```

The ZIP holds `manifest.json`, `bundle.js` and `README.md` at its root. Any other file in it is uploaded too, to `<admin folder>/plugins/<id>/`.

## manifest.json

```json
{ "id": "my-plugin", "name": "My Plugin", "version": "1.0.0", "apiVersion": "1.4.0", "entry": "bundle.js" }
```

| Field | Rule |
|---|---|
| `id` | `^[a-z0-9-]+$`. The admin silently strips other characters and lower-cases it at install, and then **rejects at every boot** a bundle whose `manifest.id` differs from the stored id — so keep it plain and identical in `manifest.json` and the bundle. It is also the i18n namespace, the `pluginConfigs` key and the folder name. |
| `name` | Shown during install. |
| `version` | Used as the cache-buster of the bundle URL (`bundle.js?v=<version>`): re-uploading the same version may leave browsers on the old code. Keep it equal to the bundle manifest's `version` (that one is what the Plugins page shows). |
| `apiVersion` | The lowest runtime API that has everything you use (see the version table in [runtime-api-reference.md](./runtime-api-reference.md#versions)). The admin refuses to install, and skips at boot, a bundle outside `[CMS_API_MIN_VERSION, CMS_API_VERSION]` = `[1.0.0, 1.4.0]`. |
| `entry` | Optional, defaults to `bundle.js`. |

`manifest.json` is read **at install only**. At boot the admin reads the list of installed extensions from its data backend (that is why copying files next to the admin by hand installs nothing).

## The bundle: `PluginManifest`

```tsx
import type { PluginManifest, Post } from "@agent-cms/runtime";
import readme from "../README.md?raw";

const manifest: PluginManifest = {
  id: "my-plugin",
  name: "My Plugin",
  version: "1.0.0",
  description: "One sentence shown on the plugin card.",
  author: "Acme",
  readme,
  register(api) {
    // page.head.extra is SYNCHRONOUS: no async function. Append — never
    // return only your own string, that would wipe other plugins' tags.
    api.addFilter<string>("page.head.extra", (head) =>
      [head, '<meta name="x-my-plugin" content="on" />'].filter(Boolean).join("\n"),
    );
    api.addAction("publish.complete", (post) => {
      console.log("published", (post as Post).id);
    });
  },
};

export default manifest;
```

Fields: `id`, `name`, `version`, `register(api)` (required); `description`, `author`, `readme`, `settings`, `i18n` (optional). There is no `apiVersion` or `enabled` field on the bundle manifest.

### `register(api)` lifecycle

- `register` runs on **every settings change** (any save in Settings, a plugin toggle, a menu edit…): the admin wipes every filter, action, block, card, tab and regeneration target, then calls `register` again for every enabled plugin, then for the active theme. Keep it idempotent and limited to `api.*` calls. Module-level state survives (the module is imported once).
- Hooks registered anywhere else (module top level, a settings page) disappear at the next reset.
- An exception thrown by `register` is only logged to the console and the plugin silently does nothing — run `agentcms ext check`, which reports it.

### `api` (the `pluginApi`)

`api` has exactly: `addFilter`, `addAction`, `registerBlock`, `registerDashboardCard`, `registerRegenerationTarget`, `registerInspectorTab`, `registerTermEditorSection`, `registerEditorVariantProvider`.

- `applyFilters`, `applyFiltersSync` and `doAction` are **not** on `api` (`api.doAction(...)` throws a TypeError). Import them from `@agent-cms/runtime` to fire your own hooks.
- `registerStorageConnector` (custom publish targets) is a top-level import only; `registerRegenerationTarget` exists only on `api`.

## Hooks

The full table (arguments, sync/async, when each fires) is in [runtime-api-reference.md → Hooks](./runtime-api-reference.md#hooks). The rules that bite:

- **Default priority is 10**, lower runs first, ties in registration order. The active theme registers after every plugin.
- **Filters return the value.** Returning `undefined` passes `undefined` on. For string hooks, append to the incoming value.
- **Sync filters** (`page.head.extra`, `page.body.end`, `sitemap.urlset.namespaces`, `sitemap.url.entry`, `sitemap.urls.extra`, `sitemap.index.extra`): an `async` callback returns a Promise and the render **throws** (`Filter "x" must be synchronous`), aborting the publish. Prepare async data earlier (e.g. in `publish.before`, which receives `(post, ctx)`) and keep it in module state.
- **Extra arguments are untyped** (`...args: unknown[]`): narrow them yourself (`rest[0] as BaseLayoutProps`).
- `post.html.body` and `post.template.props` receive `(value, post)` only — **no ctx**. Inside `post.markdown.before` / `post.html.body`, `getCurrentPublishContext()` returns the full `PublishContext` (posts, pages, terms, media, users, settings); it is `null` everywhere else (templates, head/body filters, `post.template.props`). To enrich template props, compute in `post.html.body` and hand the result over through module state.
- An action that throws aborts the remaining handlers **and the publish**. Wrap risky code in `try/catch` and report with `toast.error(...)`.
- `page.head.extra` / `page.body.end` run for every page the admin renders — after `post.html.body` of the same page. A per-page "this page uses my block" flag set in `post.html.body` must be reset at the start of each `post.html.body` **and** after `page.body.end` read it: listing pages (home, categories, authors) never run `post.html.body`, so they would inherit the flag of the previous page.

### Bulk publishing: register a regeneration target

`publish.after`, `publish.complete`, `post.unpublished` and `post.deleted` fire for **single-post** actions only. Bulk publishes, imports and *Regenerate → All HTML* skip them. A plugin that maintains derived files (feeds, indexes, sitemaps…) must also register a regeneration target — it runs after bulk flows, on *Regenerate → Everything*, on theme switch, and appears as its own entry in the Regenerate menu:

```ts
api.registerRegenerationTarget({
  id: "my-plugin",            // also the default i18n namespace
  labelKey: "regenerate.label",
  async run(ctx, log) {
    await rebuildEverything(ctx);
    log({ level: "success", message: "my-plugin: index rebuilt" });
  },
});
```

## Writing files to the site

Use the site-file helpers from `@agent-cms/runtime` — never `fetch` the publish target yourself:

```ts
import { uploadFile, deleteFile, withStorageBatch, getStorageCapabilities } from "@agent-cms/runtime";

await withStorageBatch(async () => {          // one commit on git hostings
  await uploadFile({ path: "feeds/a.xml", content: xmlA });
  await uploadFile({ path: "feeds/b.xml", content: xmlB });
});
if ((await getStorageCapabilities()).list) { /* listFiles() is available */ }
```

- Paths are relative to the site root, **no leading slash**, never containing the sub-folder of a project site. Put plugin output at the site root (e.g. `assets/my-plugin/…`); the admin folder name is user-chosen, don't hard-code `admin/`.
- Errors already raise a translated toast; don't toast them again. A 404 on delete is silent.
- Writes made inside an action handler join the publish's own batch (one commit).
- `getFile` returns text only; `listFiles`, `renameFolder` and friends depend on the target — check `getStorageCapabilities()` first.
- Public JSON written by the core lives under `data/`: `data/menu.json`, `data/posts.json`, `data/authors.json`.

## Settings page

```tsx
import { useState } from "react";
import { useTranslation } from "react-i18next";
import type { PluginManifest, PluginSettingsPageProps } from "@agent-cms/runtime";

interface Config { greeting: string }

function SettingsPage({ config, save }: PluginSettingsPageProps<Config>) {
  const { t } = useTranslation("my-plugin");          // namespace = plugin id
  const [draft, setDraft] = useState(config);
  const [saving, setSaving] = useState(false);
  return (
    <form
      data-form-type="other"
      onSubmit={async (e) => {
        e.preventDefault();
        setSaving(true);
        try { await save(draft); } finally { setSaving(false); }   // the FULL config
      }}
      className="card p-4 space-y-3"
    >
      <label className="label" htmlFor="greeting">{t("greeting")}</label>
      <input id="greeting" className="input" value={draft.greeting}
        onChange={(e) => setDraft({ ...draft, greeting: e.target.value })} />
      <button type="submit" className="btn-primary" disabled={saving}>
        <span>{saving ? t("saving") : t("save")}</span>
      </button>
    </form>
  );
}

const manifest: PluginManifest<Config> = {
  id: "my-plugin", name: "My Plugin", version: "1.0.0",
  register() {},
  settings: { navLabelKey: "title", defaultConfig: { greeting: "hello" }, component: SettingsPage },
  i18n: {
    en: { title: "My Plugin", greeting: "Greeting", save: "Save", saving: "Saving…" },
    fr: { title: "Mon plugin", greeting: "Salutation", save: "Enregistrer", saving: "Enregistrement…" },
  },
};
export default manifest;
```

- Optional `settings.schema` (API ≥ 1.5): `{ "<dot path>": { description, values?, min?, max?, format? } }` documents each setting for AI agents (`agentcms plugins config <id> --schema`); the CLI refuses values outside `values` / `min`–`max`.
- The page lives at `#/settings/plugin/<id>` (a tab of Settings). `config` = `{ ...defaultConfig, ...stored }` — a **shallow** merge: deep-merge nested defaults yourself when you add nested keys in a new version.
- `save(next)` stores `settings.pluginConfigs[<id>]`. Always pass the **whole** config: the document-store backends replace the entry (a partial object wipes other keys), Firebase deep-merges (a removed key stays — clear values with `""` / `null`).
- Save on an explicit action, not on every keystroke: on a git-backed site every save is a commit, and every save re-runs every plugin's `register`.
- Keep `data-form-type="other"` on forms and never swap icons conditionally inside buttons (`{saving ? <A/> : <B/>}`); toggle visibility with `className` instead. Browser extensions that inject DOM into forms otherwise crash React.
- At publish time, read the raw stored config from `ctx.settings.pluginConfigs?.["my-plugin"]` (not merged with defaults) or `baseProps.site.settings.pluginConfigs` in head/body filters.
- Admin UI can only use CSS classes the admin build already contains (its Tailwind scans the admin sources, not your bundle): `card`, `btn-primary`, `btn-secondary`, `btn-ghost`, `btn-danger`, `input`, `label`, `chip` and utilities the admin itself uses. Inject your own `<style>` for anything else.
- `i18n` bundles load into the namespace named after the plugin id; locales are `en fr de es nl pt ko`, missing keys fall back to `en`.

## Editor blocks

A block is a Tiptap node stored in the post's Markdown as an HTML marker, expanded at publish time by your `post.html.body` filter:

```html
<div data-cms-block="my-plugin/callout" data-attrs="<base64 JSON>"></div>
```

```ts
api.registerBlock({
  id: "my-plugin/callout",
  nodeName: "myPluginCallout",     // REQUIRED: ids with a slash are not valid node names
  titleKey: "blocks.callout",
  namespace: "my-plugin",
  icon: CalloutIcon,
  category: "text",                // text | media | layout | embed | advanced
  extensions: [CalloutNode],       // your Tiptap node, name "myPluginCallout"
  insert: (chain) => chain.focus().insertContent({ type: "myPluginCallout", attrs: { attrs: DEFAULTS } }).run(),
  inspector: CalloutInspector,     // optional, Block tab of the editor sidebar
});
api.addFilter<string>("post.html.body", (html) => expandCallouts(html));
```

- Without `nodeName` the editor never recognises the block as active and the inspector never shows (`isActive` is only a fallback).
- `@tiptap/*` is not provided by the admin: install `@tiptap/core` (+ `@tiptap/react` for React node views) 2.x and let Vite bundle it. Never `instanceof`-check editor objects against your copy; compare `node.type.name`.
- Prefix node names (`acmeCallout`): duplicates across plugins break the editor.
- The inspector's `updateAttrs` focuses the editor; for text inputs call `editor.chain().updateAttributes(nodeName, …).run()` yourself.
- Escape every value you put into the published HTML: `post.html.body` output is not sanitised again. DOMPurify strips `<script>`, `<iframe>` and `<style>` from Markdown, so emit those in `post.html.body`, never in the marker.
- New blocks appear in an open editor only after it is reopened.
- `agentcms ext new plugin <id> --with block` scaffolds a complete block; `ext check` round-trips every block through a headless editor.

## Other admin extension points

| Registration | What it adds |
|---|---|
| `api.registerDashboardCard({ id, priority?, component })` | A card on the dashboard. The component takes no props and loads its own data. |
| `api.registerInspectorTab({ id, labelKey, namespace?, forKind?, component })` | A tab in the post / page editor sidebar; `component` gets `{ entity, updateEntity, save }`. |
| `api.registerTermEditorSection({ id, termType?, component })` | A collapsible section in each Categories / Tags row; `component` gets `{ term, updateTerm }`. |
| `api.registerEditorVariantProvider(provider)` | A tab strip above the editor that swaps the whole editor state per variant (the multilang plugin's language tabs). |
| `registerStorageConnector(...)` (top-level import) | A custom publish target. |

Inside React components use `useCmsData()` (live posts, pages, terms, media, settings — `posts`/`pages` are empty in *paginated* mode, use `useAllPosts(type)` there), `useAuth()`, `toast`, `MediaPicker`, `EntityCombobox`, `FontSelect`.

## Build configuration (without the scaffold)

The scaffold's `vite.config.ts` is the reference (themes use the same file):

```ts
import { defineConfig } from "vite";

export default defineConfig({
  // Production JSX runtime even when NODE_ENV isn't "production" in the
  // shell: react/jsx-dev-runtime isn't provided by the admin.
  esbuild: { jsx: "automatic", jsxDev: false },
  define: { "process.env.NODE_ENV": JSON.stringify("production") },
  publicDir: false,
  build: {
    lib: { entry: "src/manifest.tsx", formats: ["es"], fileName: () => "bundle.js" },
    outDir: "dist",
    emptyOutDir: true,
    rollupOptions: {
      external: ["react", "react/jsx-runtime", "react-dom", "react-dom/client", "react-i18next", "@agent-cms/runtime"],
      output: { inlineDynamicImports: true },
    },
  },
});
```

If you write your own:

- No `@vitejs/plugin-react` needed (it would turn dev JSX back on outside production shells — "jsxDEV is not a function" in the admin); `esbuild: { jsx: "automatic", jsxDev: false }` is enough. `agentcms ext check` reports a dev-JSX bundle.
- Library build, `formats: ["es"]`, one file named `bundle.js`, `rollupOptions.output.inlineDynamicImports: true` (the admin loads one file).
- `rollupOptions.external` = exactly `react`, `react/jsx-runtime`, `react-dom`, `react-dom/client`, `react-i18next`, `@agent-cms/runtime` — the admin's import-map provides them. Bundling React gives "Invalid hook call"; externalising anything else (`@tiptap/*`, `lucide-react`, `react-dom/server`…) leaves an import the browser can't resolve.
- `define: { "process.env.NODE_ENV": JSON.stringify("production") }` — library mode doesn't replace it and browsers have no `process`.
- `import.meta.env` doesn't exist at runtime.
- Import from `@agent-cms/runtime` with **named** imports only (the runtime module has no default export).
- CSS/JS as strings: `import css from "./x.css?raw"` (SCSS/PostCSS: `?inline`, with `sass` installed). A plain `import "./x.css"` is emitted as a separate file nobody loads.
- `tsconfig.json`: `"paths": { "@agent-cms/runtime": ["./node_modules/@agent-cms/agentcms/types/agentcms-runtime.d.ts"] }` and `"types": ["vite/client"]` (for `?raw`).
- `npm install` needs `--legacy-peer-deps` if you add `react-i18next` with TypeScript 6 (or ship an `.npmrc` with `legacy-peer-deps=true`).

## Uninstall

**Plugins → Install plugin** lists installed extensions with an **Uninstall** button (or `agentcms ext uninstall <id> --site <alias> --yes`). The registry entry is removed first, then `<admin folder>/plugins/<id>/`. Files your plugin wrote to the site stay — clean them up from your own UI if needed.

## Troubleshooting

| Symptom | Cause / fix |
|---|---|
| Toast "N external bundle(s) failed to load", console `[external] failed to import …` | The bundle throws at import: a bare import the import-map doesn't cover, `process is not defined`, a syntax error. `agentcms ext check` names it. |
| Console `[external] skipping …: apiVersion X outside [min, max]`, or install says `bundle apiVersion … is incompatible` | `apiVersion` newer than the admin (or older than its minimum). |
| Plugin installed, nothing happens | `register` threw (console), or `id` mismatch (the bundle is rejected at boot). |
| "Invalid hook call" / `Cannot read properties of null (reading 'useState')` | React was bundled: fix `external`. |
| `Filter "page.head.extra" must be synchronous` | An `async` callback on a sync filter. |
| Translations show raw keys | `useTranslation("<plugin id>")` must use the plugin id; keys must exist in `i18n.en`. |
| Old code still runs after an upgrade | `version` not bumped in `manifest.json`. |
| Output missing after a bulk publish / import | Only `publish.complete` is hooked: add a regeneration target. |

## Examples

- [`external/plugins/hello-plugin/`](../external/plugins/hello-plugin/) — head tag, `publish.complete`, dashboard card.
- [`external/plugins/agentcms-sliders/`](../external/plugins/agentcms-sliders/) — four editor blocks with inspectors, `MediaPicker`, per-page CSS/JS injection.
- [`external/plugins/agentcms-multilang/`](../external/plugins/agentcms-multilang/) — `publish.additional` / `publish.extraListings`, an editor variant provider, a term editor section, sitemap and RSS filters.
- In-tree plugins (`src/plugins/`, e.g. `agentcms-sitemaps`, `agentcms-rss`) show regeneration targets and settings pages.

AI agents: the `agentcms-extensions` skill of the AgentCMS Claude Code plugin ([`plugin/skills/agentcms-extensions/`](../plugin/skills/agentcms-extensions/)) walks through the whole workflow.
