# Editor blocks

The post editor is Tiptap **2.x** with `tiptap-markdown` (`html: true`), and posts are stored as Markdown. A block is:

1. A **Tiptap node** in the editor, usually an *atom*. The node lives in your bundle.
2. A **marker** in the stored Markdown, written as raw HTML: an **empty** `<div data-cms-block="<id>/<block>" data-attrs="<base64 JSON>"></div>`. DOMPurify keeps `div` and `data-*` attributes; it strips `<script>`, `<iframe>`, `<style>` and event handlers.
3. A **publish transform**: a `post.html.body` filter that replaces each marker with the real HTML when a page is published.
4. A **BlockManifest** that puts the block in the "+" inserter and the `/` menu, and optionally an **inspector**: the settings panel in the editor's Block tab.

Keeping the rendered HTML out of the stored Markdown means you can change a block's look later and just regenerate the site.

`ext new plugin <id> --with block` (or `ext new theme <id> --with block`) scaffolds a complete working example in `src/callout.ts`. `ext check` inserts every block into a headless editor configured like the admin's, checks the Markdown round trip and `nodeName`, publishes the block in a demo page, and reports what the page shows.

## BlockManifest

```ts
import type { BlockManifest } from "@agent-cms/runtime";

export const calloutBlock: BlockManifest = {
  id: "acme-tools/callout",      // "<extension id>/<block>"; the marker value
  nodeName: "acmeToolsCallout",  // the Tiptap node name. REQUIRED when id contains "/"
  titleKey: "callout.title",     // i18n key…
  namespace: "acme-tools",       // …in this namespace (plugin id, or "theme-<id>" for themes)
  icon: CalloutIcon,             // React component taking { className? }
  category: "text",              // "text" | "media" | "layout" | "embed" | "advanced"
  extensions: [CalloutNode],     // your Tiptap Node(s)
  insert: (chain, ctx) => chain.insertContent({ type: "acmeToolsCallout", attrs: { attrs: DEFAULTS } }).run(),
  isActive: (editor) => editor.isActive("acmeToolsCallout"), // fallback only
  inspector: CalloutInspector,   // optional Block-tab UI
};
```

- **Registration.** Register with `api.registerBlock(calloutBlock)` in a plugin's `register`, or list the block in a theme's `blocks: []` (active only while that theme is active).
- **`nodeName`** is how the admin recognises the selected block. Without it, the admin looks for a node named after the `id`, which can never match a node name containing `/`. The block is then never "active" and its inspector never shows.
- **`insert(chain, ctx)`** must call `.run()`. `ctx.pickMedia?.()` opens the media library and resolves to `{ id, url, alt? } | null`, so an image block can await it.
  - Store the `id` and resolve the media at publish time (`getCurrentPublishContext()?.media.get(id)` → `mediaToView` → `pickFormat` / srcset), falling back to the stored `url`.
  - The `url` is absolute, fixed at upload time. It breaks if the site later moves to another domain or sub-folder; the id doesn't.
  - In `ext check` / `ext preview`, `pickMedia` answers with the demo image `media-harbor`.
- **Asking for a value.** A URL block may ask for it in `insert` with `window.prompt`; the editor runs in the browser. Otherwise insert a sample value the user edits in the inspector.
- **Insert something visible.** A block that starts empty (e.g. an image grid with no images) shows nothing in the editor, and `ext check` warns `block-empty-output`. Ask for content in `insert` (`await ctx.pickMedia()`) or insert sample content the user then edits.
- **Node names** must be unique across every block of every extension: prefix them with your camel-cased id.
- **When changes take effect.** The editor reads block extensions when it opens. After installing, enabling or switching, users must reopen the editor (navigate away and back).
- **Unavailable blocks.** If the block's plugin is disabled or its theme inactive, the marker stays in the Markdown and is published as an empty, invisible `<div>`. Editing and saving such a post in the editor will probably drop the marker.

## The Tiptap node

```ts
import { Node, mergeAttributes } from "@tiptap/core";

const NODE_NAME = "acmeToolsCallout";
const BLOCK_ID = "acme-tools/callout";

export const CalloutNode = Node.create({
  name: NODE_NAME,
  group: "block",
  atom: true,
  selectable: true,
  draggable: true,
  addAttributes() {
    return {
      // ONE attribute holding all block data as an object, stored base64.
      attrs: {
        default: DEFAULTS,
        parseHTML: (el: HTMLElement) => decodeAttrs(el.getAttribute("data-attrs")),
        renderHTML: (a: { attrs?: CalloutAttrs }) => ({ "data-attrs": encodeAttrs(a.attrs ?? DEFAULTS) }),
      },
    };
  },
  parseHTML() { return [{ tag: `div[data-cms-block="${BLOCK_ID}"]` }]; },
  renderHTML({ HTMLAttributes }) { return ["div", mergeAttributes(HTMLAttributes, { "data-cms-block": BLOCK_ID })]; },
  addNodeView() {
    // What the editor shows. Plain DOM keeps the bundle small; a React
    // node view (ReactNodeViewRenderer from @tiptap/react) also works.
    return ({ node }) => {
      const dom = document.createElement("div");
      const paint = (a: CalloutAttrs) => { dom.innerHTML = previewHtml(a); };
      paint(node.attrs.attrs);
      return { dom, update(next) { if (next.type.name !== NODE_NAME) return false; paint(next.attrs.attrs); return true; } };
    };
  },
});
```

**Encoding.** Use UTF-8-safe base64 JSON: `btoa` alone throws on non-Latin-1 text.

```ts
export function encodeAttrs(a: object): string {
  const bytes = new TextEncoder().encode(JSON.stringify(a));
  let bin = ""; for (const b of bytes) bin += String.fromCharCode(b);
  return btoa(bin);
}
export function decodeAttrs(v: string | null): CalloutAttrs {
  if (!v) return { ...DEFAULTS };
  try { return { ...DEFAULTS, ...JSON.parse(new TextDecoder().decode(Uint8Array.from(atob(v), (c) => c.charCodeAt(0)))) }; }
  catch { return { ...DEFAULTS }; }
}
```

Merging with `DEFAULTS` gives fields you add in later versions a value in old posts.

**Bundled Tiptap.**
- `@tiptap/core` (and `@tiptap/react` for React node views) has **no import-map entry**. Install it as a devDependency, Tiptap **2.x** only, and let Vite bundle it: about 200 KB, the cost of a block.
- Tiptap identifies extensions by their config, so a bundled copy works with the admin's editor.
- **Never `instanceof`-check** editor objects against your copy's classes. Compare `node.type.name` or use `editor.isActive(name)` instead.

**Styling inside the editor.** Node views and inspectors render inside the admin: use the admin's classes (`.btn`, `.input`, `.label`, `.card`), inline styles, or a `<style>` you inject.

## Inspector

```ts
function CalloutInspector({ attrs, updateAttrs, editor }: { attrs: Record<string, unknown>; updateAttrs(p: Record<string, unknown>): void; editor: any }) {
  const a = { ...DEFAULTS, ...(attrs.attrs as Partial<CalloutAttrs>) };
  const [text, setText] = useState(a.text);
  useEffect(() => setText(a.text), [a.text]);
  // A select can commit right away…
  // updateAttrs({ attrs: { ...a, tone } })
  // …but updateAttrs focuses the editor, which steals focus from text fields:
  // keep text in local state and commit on blur, or use
  // editor.chain().updateAttributes(NODE_NAME, { attrs: { ...a, text } }).run()   (no focus)
}
```

- `attrs` is the node's attributes. With the pattern above you read `attrs.attrs`.
- Always write the whole object back: `updateAttrs({ attrs: { ...a, ...patch } })`.
- **Types.** With the one-`attrs` pattern, type the manifest as `BlockManifest<{ attrs: MyAttrs }>`. Inspector props are then `{ attrs: { attrs: MyAttrs }, updateAttrs(p: Partial<{ attrs: MyAttrs }>) }`.
- **Picking media in an inspector:** render the runtime's `MediaPicker` as a modal. It calls `onPick(media: Media)` with the full media (id, formats) and `onClose()`.
  ```tsx
  const [picking, setPicking] = useState<number | null>(null);
  {picking !== null && <MediaPicker onPick={(m) => { setSlot(picking, { id: m.id, url: pickMediaUrl(m, "large"), alt: m.alt ?? "" }); setPicking(null); }} onClose={() => setPicking(null)} />}
  ```
- The Block tab opens automatically when the selected block has an inspector.

## Publish transform

```ts
const MARKER = /<div\s+([^>]*data-cms-block="acme-tools\/callout"[^>]*)>\s*<\/div>/g;

api.addFilter<string>("post.html.body", (html) =>
  html.replace(MARKER, (_m, attrsHtml: string) => {
    const a = decodeAttrs(/data-attrs="([^"]*)"/.exec(attrsHtml)?.[1] ?? null);
    return `<aside class="acme-callout acme-callout--${a.tone}"><p>${escapeHtml(a.text)}</p></aside>`;
  }),
);
```

- **Escape every value** you output (`& < > "`); nothing sanitises after this filter. Validate enums (tones, sizes) against a whitelist.
- **Anything can be emitted here, including `<iframe>` and `<script>`** (maps, videos), because the sanitiser already ran. Validate URLs (https only, known hosts) and think about privacy: a map or video iframe sets third-party cookies, so prefer privacy-friendly embed URLs or a click-to-load placeholder.
- **Labels in the output** (e.g. a default heading) use the site's language: see "Which translator where" in themes.md.
- **Look up other content** (a list of posts, a media item) with `getCurrentPublishContext()` inside this filter (`{ posts, pages, terms, media, settings, users, authorLookup }`). It returns `null` in some renders (e.g. localized pages of multilingual plugins), so degrade gracefully.
- **Block CSS on the public site:**
  - A theme block puts it in the theme's CSS. This is always the best place.
  - A plugin block with a few lines of CSS: prepend one `<style>` to the transformed body when the page contains the block. That's the simplest, and the scaffold does it.
  - A plugin block with bigger CSS, or a script: use the per-page flag pattern (plugins.md, "Adding to pages") and emit them from `page.head.extra` / `page.body.end`.
- **Interactive blocks** (sliders, tabs) need JS on the public page. Emit a `<script>` through `page.body.end`, or for themes ship it in a runtime JS file.
- **Media:** `MediaView` / `pickFormat` don't apply to raw media ids found in a marker. Store the URL you got from `ctx.pickMedia()`, or resolve the media from `getCurrentPublishContext().media.get(id)` with `mediaToView` + `pickFormat`.

## Checklist

- [ ] `nodeName` matches `Node.create({ name })`.
- [ ] The marker is an empty `<div>`, `parseHTML` matches it, and `renderHTML` writes it.
- [ ] `insert` calls `.run()`.
- [ ] The transform escapes its output and handles missing or old attributes.
- [ ] The block's `titleKey` exists in your `en` i18n bundle.
- [ ] `npm run check` shows the block's `markdown` and `published` sections, and the published section contains your HTML, not the marker.
