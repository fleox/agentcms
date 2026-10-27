# Pitfalls: mistake, symptom, fix

The tag at the end of each item is the code `ext check` reports for it, when it detects it.

## Packaging and loading

1. **React, react-dom or react-i18next bundled.**
   - Symptom: "Invalid hook call", `null.useState`, or `useTranslation` returning raw keys.
   - Fix: externalise exactly `react`, `react/jsx-runtime`, `react-dom`, `react-dom/client`, `react-i18next`, `@agent-cms/runtime`.
   - `bundled-react`, `bundled-react-dom`, `bundled-react-i18next`
2. **Something external that the admin doesn't provide** (`@tiptap/core`, `lucide-react`, `react-dom/server`, `react/jsx-dev-runtime`).
   - Symptom: the bundle fails to load.
   - Fix: bundle it, and build in production mode.
   - `unresolvable-import`
3. **Development JSX in the bundle** (`jsxDEV`, from `react/jsx-dev-runtime`).
   - Symptom: "jsxDEV is not a function" when a component renders.
   - Fix: `esbuild: { jsx: "automatic", jsxDev: false }` (Vite turns dev JSX on whenever `NODE_ENV` isn't `production`).
   - `jsx-dev`
3b. **No `define` for `process.env.NODE_ENV`.**
   - Symptom: "process is not defined".
   - `process-env`
4. **Code splitting.**
   - Symptom: missing chunks.
   - Fix: `inlineDynamicImports: true`, so the build produces one file.
   - `code-split`, `missing-chunk`
5. **`import runtime from "@agent-cms/runtime"`.**
   - Symptom: the import fails, because the module has no default export.
   - Fix: use named imports.
   - `import-failed`
6. **`api.applyFilters` / `api.doAction`.**
   - Symptom: TypeError, because those are top-level runtime exports.
   - Fix: import them from the runtime.
7. **Id with capitals, `_` or `.`.**
   - Symptom: the admin rewrites the id at install, then rejects the bundle on every load.
   - Fix: use `^[a-z0-9]+(-[a-z0-9]+)*$`, identical everywhere.
   - `manifest-id`, `id-mismatch`
8. **`apiVersion` newer than the site's admin.**
   - Symptom: install refused, or the extension is silently skipped.
   - `api-too-new`, and `api-incompatible` from `ext install`
9. **Version not bumped for an update.**
   - Symptom: browsers keep the old bundle, which is cached by version.
   - Fix: bump it in `manifest.json`, `src/manifest.tsx` and `package.json`.
   - `version-mismatch`
10. **ZIP with a wrapping folder plus `__MACOSX`.**
    - Symptom: "manifest.json missing".
    - Fix: use `npm run build` / `ext pack`.
11. **`import "./style.css"`.**
    - Symptom: unstyled; the file is emitted separately and nobody loads it.
    - Fix: import it with `?raw`, or with `?inline` for SCSS.
12. **`?raw` on SCSS.**
    - Symptom: uncompiled SCSS is published.
    - Fix: use `?inline` with `sass` installed.
13. **Relying on a `theme.css` file in the ZIP.** It is never used; only `cssText` is.
    - `css-missing` when `cssText` is empty

## Hooks

14. **`async` callback on `page.head.extra` / `page.body.end` / sitemap sync filters.**
    - Symptom: the page render throws and publishing fails.
    - Fix: make the callback synchronous; prepare data in `publish.before`.
    - `async-sync-filter`
15. **Returning only your own string from a string filter.**
    - Symptom: other plugins' output disappears.
    - Fix: `return value + yours`.
16. **Expecting `ctx` in `post.html.body` / `post.template.props`.**
    - Symptom: it is `undefined`.
    - Fix: `getCurrentPublishContext()` inside `post.html.body`, or capture data in `publish.before`.
17. **`getCurrentPublishContext()` in templates or head filters.**
    - Symptom: it returns `null`.
18. **Per-page flag set in `post.html.body` and not reset.**
    - Symptom: assets leak onto listing pages.
    - Fix: reset the flag at the start of `post.html.body` and at the end of `page.body.end`.
19. **Relying only on `publish.complete`.**
    - Symptom: output goes stale after imports, multi-publish and Regenerate → All HTML.
    - Fix: also call `api.registerRegenerationTarget`.
20. **Throwing inside an action.**
    - Symptom: the publish that fired it aborts.
    - Fix: try/catch, plus `toast.error`.
21. **Registering outside `register()`.**
    - Symptom: works until the next settings change, then vanishes.
22. **Misspelt hook, or `addAction` on a filter (or the reverse).**
    - Symptom: the callback never runs.
    - `unknown-hook`
23. **`sitemap.urls.extra` without a year check.**
    - Symptom: URLs duplicated in every yearly sitemap.

## Themes and templates

24. **A sentinel missing, or written in another form.**
    - Symptom: SEO, favicon, analytics, embed and noindex output silently missing.
    - `head-sentinel`, `body-sentinel`, `sentinel-left`
25. **Empty `<title>` on the home.** `pageTitle` is `""` on the latest-posts home.
    - Fix: fall back to the site title.
    - `title`
26. **`lang` ignoring `currentLocale`.** Multilingual pages get the wrong language.
    - `html-lang` when `lang` is missing
27. **Home link hard-coded to `/`.**
    - Symptom: localized homes break.
    - Fix: `site.homePath ?? "/index.html"`.
28. **`href={post.url}` on cards.**
    - Symptom: relative links that break in sub-folders.
    - Fix: `"/" + post.url`.
    - `broken-links`, `home-posts`, `category-posts`
29. **`bodyHtml` printed as text, or not rendered.**
    - Fix: `dangerouslySetInnerHTML={{ __html: bodyHtml }}`.
    - `single-body`
30. **`window`, `document`, effects, state or fetch in templates.** They run once at publish time.
    - Symptom: crashes or no-ops.
    - Fix: put that behaviour in runtime JS.
    - `render-console`
31. **`useTranslation()` in templates.**
    - Symptom: renders in the admin user's language.
    - Fix: `i18n.getFixedT(pickPublicLocale(site.settings.language), "theme-<id>")`.
32. **Fetching `/menu.json` or `/posts.json`.**
    - Symptom: 404.
    - Fix: they live in `data/`.
33. **Runtime JS building root-absolute URLs without the base path.**
    - Symptom: 404s on sites hosted in a sub-folder.
    - Fix: read `<meta name="x-cms-base">`.
    - `companion-js-base`
34. **Menus only in static HTML.**
    - Symptom: menu edits need a full regenerate.
    - Fix: ship a `jsText` loader reading `data/menu.json`.
35. **`new Date(post.publishedAt)`.**
    - Symptom: Invalid Date.
    - Fix: `postSortMillis(post)` or `card.dateLabel`.
36. **Requesting undeclared image formats.**
    - Symptom: the 2000 px original is served.
    - Fix: declare `imageFormats` and request those names.
37. **`inputFormats` as MIME types.**
    - Symptom: every upload is refused.
    - Fix: use extensions (`".jpg"`).
    - `image-input`
38. **`admin-*` format names.** These names are reserved.
    - `image-format-reserved`
39. **Expecting `heroHtml` / `listHtml` in your home.** Only built-in themes get them.
    - Fix: render from `posts`.
40. **Expecting `404.html` after a publish.** Only Regenerate → All HTML / Everything writes it.
41. **Expecting pagination or tag archives.** Neither exists.
42. **Stylesheet as `<link href rel>`.**
    - Symptom: the admin's live preview is unstyled.
    - Fix: write `rel` first.
43. **Tailwind purge removes classes used only in runtime JS.**
    - Fix: include `.js` in the `content` globs.
44. **Shallow default merge.** Nested keys added in a new version are missing on old sites.
    - Fix: merge nested defaults yourself.

## Editor blocks

45. **No `nodeName` on a block whose id contains `/`.**
    - Symptom: no inspector; the block is never active.
    - `block-roundtrip`
46. **Duplicate Tiptap node names.**
    - Fix: prefix them with your id.
47. **`insert` without `.run()`.**
    - Symptom: nothing is inserted.
    - `block-roundtrip` (empty)
48. **`parseHTML` / `renderHTML` disagree.**
    - Symptom: the block is lost or changed when the post is reopened.
    - `block-roundtrip`
49. **Marker not replaced at publish.**
    - Symptom: an empty `<div>` on the page.
    - `block-not-rendered`
50. **Unescaped values in the transform.**
    - Symptom: XSS on the public site.
51. **`updateAttrs` on every keystroke.**
    - Symptom: focus jumps back to the editor.
    - Fix: commit on blur, or `editor.chain().updateAttributes(...).run()`.
52. **`instanceof` against your bundled Tiptap or ProseMirror classes.**
    - Symptom: always false.
    - Fix: compare `type.name`.
53. **`<script>` / `<iframe>` stored in Markdown.** DOMPurify strips them.
    - Fix: store a marker and expand it in `post.html.body`.
54. **A new block missing from an open editor.**
    - Fix: reopen the editor.

## Admin UI

55. **Forms without `data-form-type="other"`, or buttons that swap children.**
    - Symptom: random "insertBefore" crashes caused by browser extensions.
56. **Hard-coded English.**
    - Fix: `useTranslation("<namespace>")`, with at least an `en` bundle.
    - `settings-label-missing`, `i18n-en`
57. **Tailwind classes the admin doesn't have.**
    - Symptom: unstyled UI.
    - Fix: use the admin's `.btn`, `.input`, `.label`, `.card`, or inline styles.
58. **`fetch` to the hosting, or upload paths with a leading slash or the admin folder.**
    - Fix: use `uploadFile` with a site-relative path.
59. **Assuming `listFiles` / `renameFolder` exist.**
    - Fix: check `getStorageCapabilities()` first.
60. **Partial config objects passed to `save()`.**
    - Symptom: lost keys.
    - Fix: always save the whole object.
