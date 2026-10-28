# Plugins

A plugin adds behaviour to any site, whatever its theme. Typical jobs:
- add tags or scripts to every page;
- write extra files such as feeds, indexes or JSON;
- add editor blocks, a settings page or dashboard cards;
- react to publishing.

## PluginManifest

```tsx
import type { PluginManifest } from "@agent-cms/runtime";
import readme from "../README.md?raw";

const manifest: PluginManifest<MyConfig> = {
  id: "acme-tools",             // = manifest.json id; also the i18n namespace and config key
  name: "Acme Tools",
  version: "1.0.0",             // keep = manifest.json version
  description: "One sentence.",
  author: "Acme",
  readme,                       // Markdown shown by "Learn more"
  settings: { navLabelKey: "settings.navLabel", defaultConfig: DEFAULT_CONFIG, component: SettingsPage, schema: SETTINGS_SCHEMA },
  i18n: { en: {…}, fr: {…} },  // optional; locales en fr de es nl pt ko
  register(api) {
    api.addFilter<string>("page.head.extra", (head) => head + '<meta name="x" content="y" />');
    api.addAction("publish.complete", async (post, ctx) => { … });
    api.registerBlock(myBlock);
    api.registerDashboardCard({ id: "acme-tools/stats", component: StatsCard });
    api.registerRegenerationTarget({ id: "acme-tools", labelKey: "regen.label", run: async (ctx, log) => { … } });
  },
};
export default manifest;
```

### Lifecycle of `register(api)`

- `register` runs **every time the site settings change**: at admin load, after any settings save (including your own settings page), after enabling or disabling a plugin, after editing a menu.
- Before each run the admin wipes **every** registration: filters, actions, blocks, cards, tabs, regeneration targets. Then it re-registers, in this order:
  1. built-in must-use plugins;
  2. enabled plugins, built-ins before installed ones;
  3. the active theme.
- So `register` must be synchronous, idempotent and side-effect free: only `api.*` calls. Never register anything at module top level or from a component, because the next reset wipes it.
- Module-level variables in your bundle survive resets; the bundle is imported once per admin load.
- A plugin is enabled unless `settings.enabledPlugins[id] === false`, so a freshly installed plugin is active after the admin reloads.
- An exception in `register` only goes to the console and the plugin silently does nothing. Wrap risky code yourself.

### `api` (PluginApi)

`addFilter(hook, fn, priority = 10)`, `addAction(hook, fn, priority = 10)`, `registerBlock`, `registerDashboardCard`, `registerRegenerationTarget`, `registerInspectorTab`, `registerTermEditorSection`, `registerEditorVariantProvider`.
- Lower priority runs first; ties run in registration order.
- To fire your own hooks, import `applyFilters`, `applyFiltersSync` or `doAction` from `@agent-cms/runtime`; they are not on `api`.
- There is no `removeFilter`.

The full hook catalogue, with arguments and timing, is in hooks.md.

## Settings page

```tsx
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast, type PluginSettingsPageProps } from "@agent-cms/runtime";

export function SettingsPage({ config, save }: PluginSettingsPageProps<MyConfig>) {
  const { t } = useTranslation("acme-tools");
  const [draft, setDraft] = useState(config);
  const [saving, setSaving] = useState(false);
  useEffect(() => setDraft(config), [config]);
  return (
    <form data-form-type="other" className="max-w-xl space-y-4"
      onSubmit={async (e) => { e.preventDefault(); setSaving(true); try { await save(draft); toast.success(t("saved")); } finally { setSaving(false); } }}>
      <label className="block space-y-1">
        <span className="text-sm font-medium">{t("message")}</span>
        <input className="input w-full" value={draft.message} onChange={(e) => setDraft({ ...draft, message: e.target.value })} />
      </label>
      <button type="submit" className="btn-primary" disabled={saving}><span>{t("save")}</span></button>
    </form>
  );
}
```

- **Route.** The page is shown at `#/settings/plugin/<id>`, only while the plugin is enabled. Its tab label is `t(navLabelKey)` in your namespace.
- **Props.**
  - `config` is `defaultConfig` **shallow**-merged with the stored value. Merge nested objects yourself.
  - `save(next)` stores the **whole** object under `settings.pluginConfigs[<id>]`. Always pass the full config. To clear a value, set it to `null` or `""`; don't delete the key (on Firebase sites, missing keys are not removed).
- **Document the settings** (API ≥ 1.5): `schema` maps each setting's dot path to `{ description, values?, min?, max?, format? }` (`SettingsSchema` from `@agent-cms/runtime`). `agentcms plugins config <id> --schema` shows it to agents, and the CLI refuses values outside `values` / `min`–`max`, so list **every** accepted value. Mark bookkeeping fields "Managed by the plugin — don't set." Older admins ignore it.
- **Reading config at publish time.** In filters and actions use `baseProps.site.settings.pluginConfigs?.["<id>"]` (head/body filters) or `ctx.settings.pluginConfigs?.["<id>"]` (actions, `publish.additional`, regeneration targets). It is the raw stored value: merge it with your defaults.
- **Applying a change to the site.** Saving changes nothing on already-published pages.
  - Files you generate: call your own generator from the settings page after `save`.
  - Output you inject into pages (head/body filters, `post.html.body`): pages must be re-rendered. Plugins can't trigger that. Tell the user to run **Themes → Regenerate → All HTML pages**, or **Everything** to also rerun regeneration targets. Say "the admin's Regenerate menu"; the labels are translated in the admin's language.
- **Admin UI rules.**
  - Use `data-form-type="other"` on forms and a stable button DOM.
  - Translate visible strings.
  - Only classes present in the admin's CSS work. The verified list is in SKILL.md (golden rules). For anything else use inline styles, or inject a `<style>` once.
- **Admin data.** Hooks available in settings pages and cards: `useCmsData()` (`{ posts, pages, terms, categories, tags, media, users, settings }`), `useAllPosts(type)`, `useAuth()`. UI pieces: `EntityCombobox`, `FontSelect`, `MediaPicker`.

## i18n

The admin uses i18next 23 with `interpolation.escapeValue: false`, so escape interpolated values yourself before they reach HTML. Plurals use the `_one` / `_other` key suffixes (`count` option).

`i18n: { en: {...}, fr: {...} }` is loaded into the namespace `<plugin id>`:
- Components call `useTranslation("<id>")`.
- Block `titleKey`s are resolved in `namespace: "<id>"`.
- Regeneration target labels use the target's `i18nNamespace`, which defaults to its id.

English is the fallback. Admin locales are `en`, `fr`, `de`, `es`, `nl`, `pt` and `ko`.

**Strings you put on the public site** must use the **site's** language, not the admin user's:

```ts
import { i18n, pickPublicLocale } from "@agent-cms/runtime";
const tFor = (lang?: string) => i18n.getFixedT(pickPublicLocale(lang || "en"), "<plugin-id>");
```

Where to get the language:
- in `page.head.extra` / `page.body.end`: `baseProps.currentLocale || baseProps.site.settings.language`;
- in `post.html.body`: `((args[1] as PublishContext | undefined) ?? getCurrentPublishContext())?.settings.language`. A multilingual plugin passes the per-language context as the third argument, see hooks.md. It can be null, so fall back to your `en` strings;
- in actions and regeneration targets: `ctx.settings.language`.

Inside a plain-DOM node view (no React), use `i18n.t(key, { ns: "<plugin-id>" })`. Log messages (`log({ … })`) are shown in the admin: English is fine.

## Writing files to the site

```ts
import { uploadFile, deleteFile, withStorageBatch, getStorageCapabilities, pathToPublicUrl } from "@agent-cms/runtime";

await withStorageBatch(async () => {          // one commit on git-hosted sites
  await uploadFile({ path: "feeds/all.json", content: JSON.stringify(data) });
  await uploadFile({ path: "img/x.png", content: base64, encoding: "base64" });
  await deleteFile("feeds/old.json");          // 404 is fine
});
```

- **Paths.** They are relative to the site root, with no leading slash and never the sub-folder. Files land wherever the site is hosted; you never talk to the hosting directly, and you never `fetch` it.
- **Admin folder.** Don't write into it: its name is chosen by the user.
- **Errors** already raise a translated toast, so don't add another.
- **Optional operations.** `listFiles`, `renameFolder` and `deleteFolder` depend on the hosting. Check `getStorageCapabilities()` first.
- **URLs inside the files you generate:**
  - For the site's own pages and scripts (a search index, a JSON for a widget), write root-absolute URLs that include the sub-folder: `withBasePath("/" + buildPostUrl({ post, primaryTerm }), basePathFromBaseUrl(ctx.settings.baseUrl))`. They work without a site URL.
  - For outside consumers (RSS readers, crawlers, sitemaps), write absolute URLs with `pathToPublicUrl(ctx.settings.baseUrl, path)`, and skip silently when `baseUrl` is empty.
- **`ctx.posts` / `ctx.pages` include drafts.** Filter on `status === "online"` before publishing anything. `ctx.posts` holds type "post", `ctx.pages` holds pages.
- **Remember your paths.** Store what you wrote (e.g. `lastPublishedPath` in your config via `updatePluginConfig`), so a rename can delete the old file.

### Keeping generated files up to date

- `publish.complete`, `post.unpublished` and `post.deleted` give you `(post, ctx)` after each single publish, unpublish or delete, with `ctx` already showing the new state.
- They **do not fire** during bulk operations (import, multi-select publish) or Regenerate → All HTML.
- So every generator must also be registered as a regeneration target:

```ts
api.registerRegenerationTarget({
  id: "acme-tools",
  labelKey: "regen.label",          // in your namespace
  descriptionKey: "regen.description",
  priority: 200,
  run: async (ctx, log) => {
    log({ level: "info", message: "Rebuilding the feed…" });
    await buildFeed(ctx);
  },
});
```

The admin runs regeneration targets after bulk publish, bulk unpublish, bulk delete and imports, on Regenerate → Everything, when the theme changes, and from the Regenerate menu, where yours appears as its own entry. `ext preview` and `ext check` run them too.

`ext check` simulates publish → unpublish → delete → bulk publish and lists, per step, what your plugin changed (`data.output.lifecycle`). Check that your files change at **every** step. It warns `no-regeneration-target` when you react to lifecycle actions without a target.

Catch errors inside your handlers: a throwing action aborts the publish that triggered it.

## Adding to pages

- **`<head>` / end of `<body>`:** use the synchronous filters `page.head.extra` / `page.body.end`. They receive `(html, baseProps)`, where `baseProps` holds `{ site, pageTitle, pageDescription, ogImage, currentPath, currentLocale }`. Return `html + yours`.
- **Page body:** use `post.html.body` `(html, post)`. It runs only on single posts/pages and the static home page. Escape whatever you output; it is not sanitised afterwards.
- **Something at the top (or bottom) of every post, whatever the theme:** prepend (or append) in `post.html.body`, and check `post.type === "post"`, because the filter also runs for pages and the static home page. Run after block transforms with a higher priority (e.g. 20) if you measure the text.
- **Per-page assets** (CSS/JS only when a page uses your feature):
  - Set a module-level flag in `post.html.body`.
  - Reset the flag **once per page**, in your earliest `post.html.body` filter (lowest priority). Resetting in each of several filters wipes what an earlier one set.
  - Read the flag in `page.head.extra` / `page.body.end`, then reset it at the end of `page.body.end`, the last per-page call. Listing pages never run `post.html.body`, so a flag that isn't reset leaks into them.
- **Public JavaScript from a plugin** (banners, widgets…): plugins have no `jsText`.
  - Inline the script with `page.body.end` (`import code from "./runtime/widget.js?raw"`). It is always in sync with the HTML.
  - Uploading a file is only safe if every page that references it was regenerated after the upload.
  - Escaping in inline code: write `<\/script>` for any `</script>` in the code.
  - For inline JSON (`<script type="application/json">`), replace `<` with `\u003c`, and U+2028 / U+2029 with `\u2028` / `\u2029`.
  - Wrap the script in an IIFE and fail silently.
- **Base path in your public JS:** same as themes. Read `<meta name="x-cms-base">` and prefix every root-absolute URL you build (themes.md, "Base path"). It also matters for visitor state: sites hosted in sub-folders of one domain (`user.github.io/a`, `/b`) share `localStorage` and cookies, so key your storage with the base path.
- **The admin's live preview** renders pages with your head/body output in an iframe and **runs scripts**. It is recognisable by `document.querySelector("script[data-cms-preview-bootstrap]")`. Skip banners or analytics there.
- **Plain text from Markdown:** `markdownToPlainText(md, max)` renders the Markdown and strips the tags. Block markers carry no text, so they vanish.
- **Extra pages** rendered with the active theme: build them with `renderPageToHtml({ base: getActiveTheme(ctx.settings.activeThemeId).templates.base, baseProps: { site: buildSiteContext(ctx), pageTitle, currentPath }, template: MyPage, templateProps })` and upload the result. Every plugin and the base-path rewriting then apply to your page too.

## Dashboard cards

`api.registerDashboardCard({ id: "<id>/<card>", priority?: 100, component })`. The component takes **no props**; it fetches and renders its own data with `useCmsData()` etc. Cards appear under the dashboard's stat cards.

## Other editor extension points

- **Inspector tab** (API 1.2+): `api.registerInspectorTab({ id, labelKey, namespace?, forKind?: "post"|"page"|"all", badge?, priority?, component })`. It adds a tab next to Document/Block in the post editor. `component` receives `{ entity: Post, updateEntity(patch), save() }`. Store plugin data in `post.translations` (an opaque record), merging it with the existing value.
- **Term editor section** (API 1.2+): `api.registerTermEditorSection({ id, termType?: "category"|"tag"|"all", priority?, component })`. It adds an expandable section in each Categories/Tags row. `component` receives `{ term, updateTerm(patch) }`, and the row's Save persists the patch.
- **Editor variant provider** (API 1.3+): `api.registerEditorVariantProvider({ id, listVariants, loadFields, saveFields, … })`. It adds a tab strip that swaps the whole editor state per variant, the way multilingual editing works. Advanced; read the types file.
- **Publish connector** (API 1.4+): `registerStorageConnector({ id, create(settings) })` adds a new hosting target. Advanced; read the types file.

## Build setup (what `ext new` generates)

`vite.config.ts`:
```ts
import { defineConfig } from "vite";
export default defineConfig({
  // jsxDev: false — otherwise a shell with NODE_ENV≠production makes
  // Vite emit jsxDEV calls (react/jsx-dev-runtime), which crash in the admin.
  esbuild: { jsx: "automatic", jsxDev: false },
  define: { "process.env.NODE_ENV": JSON.stringify("production") },
  publicDir: false,
  build: {
    lib: { entry: "src/manifest.tsx", formats: ["es"], fileName: () => "bundle.js" },
    outDir: "dist", emptyOutDir: true, minify: true, sourcemap: false,
    rollupOptions: {
      external: ["react", "react/jsx-runtime", "react-dom", "react-dom/client", "react-i18next", "@agent-cms/runtime"],
      output: { inlineDynamicImports: true },
    },
  },
});
```

`tsconfig.json` maps the runtime types:
```json
{ "compilerOptions": { "target": "ES2022", "module": "ESNext", "moduleResolution": "Bundler", "lib": ["ES2022", "DOM", "DOM.Iterable"],
  "jsx": "react-jsx", "strict": true, "noEmit": true, "skipLibCheck": true, "isolatedModules": true, "types": ["vite/client"],
  "paths": { "@agent-cms/runtime": ["./node_modules/@agent-cms/agentcms/types/agentcms-runtime.d.ts"] } },
  "include": ["src"] }
```

`package.json`:
- **devDependencies:** `@agent-cms/agentcms` (types + CLI), `vite`, `typescript` and `@types/react`, plus `@tiptap/core` for blocks. React itself is **not** needed: it comes from the admin at runtime.
- **Scripts:** `build` = `tsc --noEmit && vite build && agentcms ext pack .`, plus `check`, `preview` and `serve`.

`manifest.json` (install metadata, at the ZIP root; the admin reads only these fields and ignores any other):
```json
{ "id": "acme-tools", "name": "Acme Tools", "version": "1.0.0", "apiVersion": "1.6.0", "entry": "bundle.js", "kind": "plugin" }
```

`apiVersion` is the extension API the code needs. 1.6.0 is the current one (the scaffold writes it); older admins refuse newer values. What each version added:

| Version | Added |
|---|---|
| 1.1 | Runtime helpers |
| 1.2 | `applyFilters` / `doAction` exports, inspector tabs, term sections, translations, `publish.additional` / `publish.extraListings` |
| 1.3 | Editor variants |
| 1.4 | Hosting-agnostic file API, `withStorageBatch`, `registerStorageConnector`, base path helpers, `publish.before(post, ctx)` |
| 1.5 | `settings.schema` (documented settings for `config --schema`) |
| 1.6 | `search.index.locales` filter (per-language search indexes), `BlockManifest.attrsSchema` (documented block attributes) |

Assets:
- Import CSS and other text with `?raw` (or `?inline` for SCSS).
- Small images can be imported as data URLs (`?inline`).
- Larger files can ship in the project's `assets/` folder; they are packed and uploaded to `<admin>/plugins/<id>/assets/…`. The admin folder name varies, so don't hard-code that URL in published pages: upload public assets to the site root yourself instead.
