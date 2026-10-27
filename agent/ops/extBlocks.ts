import type { BlockManifest } from "../../src/core/blockRegistry";

// Editor-block round trip, in the same editor configuration as the
// admin's post editor (StarterKit + Link + Image + tiptap-markdown with
// html: true + the blocks' own extensions), on an emulated DOM:
//
//   insert(chain) → Markdown the post would store → parsed back into the
//   same document → stable Markdown.
//
// The Markdown is then published inside a demo post by the caller, to
// check the publish-time transform.

export interface BlockTrial {
  id: string;
  markdown: string | null;
  isActiveAfterInsert: boolean | null;
  issues: Array<{ level: "error" | "warn"; message: string }>;
}

// DOM globals Tiptap / ProseMirror / tiptap-markdown read. Installed
// only for the duration of the trial (the CLI's window === globalThis).
const DOM_KEYS = [
  "document",
  "Node",
  "Element",
  "HTMLElement",
  "HTMLDivElement",
  "HTMLTemplateElement",
  "Text",
  "Comment",
  "DocumentFragment",
  "MutationObserver",
  "getSelection",
  "Selection",
  "Range",
  "DOMParser",
  "XMLSerializer",
  "getComputedStyle",
  "requestAnimationFrame",
  "cancelAnimationFrame",
  "Event",
  "CustomEvent",
  "KeyboardEvent",
  "MouseEvent",
  "InputEvent",
  "FocusEvent",
  "ClipboardEvent",
  "DragEvent",
  "CompositionEvent",
  "UIEvent",
  "NodeFilter",
  "ShadowRoot",
  "HTMLInputElement",
  "HTMLImageElement",
  "DOMRect",
  "ResizeObserver",
  "IntersectionObserver",
  "addEventListener",
  "removeEventListener",
  "dispatchEvent",
  "HTMLAnchorElement",
  "HTMLParagraphElement",
  "SVGElement",
  "HTMLBRElement",
];

async function withDom<T>(fn: () => Promise<T>): Promise<T> {
  const { Window } = await import("happy-dom");
  const win = new Window({ url: "http://localhost/", settings: { disableJavaScriptEvaluation: true, disableJavaScriptFileLoading: true, disableCSSFileLoading: true } });
  const g = globalThis as Record<string, unknown>;
  const saved = new Map<string, PropertyDescriptor | undefined>();
  for (const key of DOM_KEYS) {
    const value = (win as unknown as Record<string, unknown>)[key];
    if (value === undefined) continue;
    saved.set(key, Object.getOwnPropertyDescriptor(globalThis, key));
    Object.defineProperty(globalThis, key, {
      value: typeof value === "function" && /^[a-z]/.test(key) ? (value as (...a: unknown[]) => unknown).bind(win) : value,
      configurable: true,
      writable: true,
    });
  }
  try {
    return await fn();
  } finally {
    for (const [key, desc] of saved) {
      if (desc) Object.defineProperty(globalThis, key, desc);
      else delete g[key];
    }
    await win.happyDOM.abort();
    win.close();
  }
}

// What ctx.pickMedia() resolves to during a trial: a demo media of the
// rendered site (its id resolves at publish time).
export interface TrialMedia {
  id: string;
  url: string;
  alt?: string;
}

// Markdown of the block test page: each block after a heading and an
// empty delimiter div (kept by the sanitiser, ignored by themes), so
// each block's own output can be cut out of the published page.
export function blockTestMarkdown(trials: Array<{ id: string; markdown: string | null }>): string {
  return trials
    .filter((t) => t.markdown)
    .map((t) => `## Block test: ${t.id}\n\n<div data-agentcms-block-test="${t.id}"></div>\n\n${t.markdown}`)
    .join("\n\n");
}

// The published HTML of one block on the block test page.
export function blockOutput(page: string, id: string): string | null {
  const start = page.indexOf(`data-agentcms-block-test="${id}"`);
  if (start < 0) return null;
  const from = page.indexOf(">", start) + 1;
  const after = page.slice(from);
  const next = after.search(/<h2[^>]*>Block test: |<\/main>|data-agentcms-block-test=/);
  let own = next >= 0 ? after.slice(0, next) : after;
  // Drop the "</div>" closing the delimiter.
  own = own.replace(/^\s*<\/div>/, "");
  return own;
}

export async function tryBlocks(blocks: BlockManifest[], media: TrialMedia = { id: "media-harbor", url: "http://localhost:4321/media/demo/harbor/admin-original.svg", alt: "Boats in a harbor at sunrise" }): Promise<BlockTrial[]> {
  if (blocks.length === 0) return [];
  return withDom(async () => {
    const [{ Editor }, { default: StarterKit }, { default: Link }, { default: Image }, { Markdown }] = await Promise.all([
      import("@tiptap/core"),
      import("@tiptap/starter-kit"),
      import("@tiptap/extension-link"),
      import("@tiptap/extension-image"),
      import("tiptap-markdown"),
    ]);
    const blockExtensions = blocks.flatMap((b) => (Array.isArray(b.extensions) ? b.extensions : [])).filter((e, i, a) => a.indexOf(e) === i);
    const make = () =>
      new Editor({
        extensions: [StarterKit, Link.configure({ openOnClick: false, autolink: true }), Image, Markdown.configure({ html: true, transformPastedText: true, breaks: false }), ...(blockExtensions as never[])],
        content: "",
      });
    const markdownOf = (e: InstanceType<typeof Editor>) => (e.storage as { markdown: { getMarkdown(): string } }).markdown.getMarkdown();
    const trials: BlockTrial[] = [];
    let editor: InstanceType<typeof Editor>;
    try {
      editor = make();
    } catch (err) {
      return blocks.map((b) => ({ id: b.id, markdown: null, isActiveAfterInsert: null, issues: [{ level: "error", message: `The editor could not start with the blocks' extensions: ${(err as Error).message}` }] }));
    }
    for (const block of blocks) {
      const trial: BlockTrial = { id: block.id, markdown: null, isActiveAfterInsert: null, issues: [] };
      trials.push(trial);
      try {
        editor.commands.setContent("");
        const pickMedia = async () => ({ ...media });
        await Promise.resolve(block.insert(editor.chain() as never, { pickMedia }));
        const md = markdownOf(editor).trim();
        trial.markdown = md;
        if (!md) {
          trial.issues.push({ level: "error", message: `insert() left the document empty — nothing would be saved (did it call .run()?).` });
          continue;
        }
        // The node(s) the insert created, vs the name the admin uses to
        // find this block (nodeName ?? id): the Block tab and the
        // inspector only appear when they match.
        const created = new Set<string>();
        editor.state.doc.descendants((n) => {
          if (!["doc", "paragraph", "text"].includes(n.type.name)) created.add(n.type.name);
        });
        const expected = block.nodeName ?? (block.id.startsWith("core/") ? block.id.slice(5).replace(/-/g, "") : block.id);
        if (created.size && !created.has(expected)) {
          trial.issues.push({
            level: block.inspector ? "error" : "warn",
            message: `inserts node "${[...created].join(", ")}" but the admin looks for "${expected}"${block.nodeName ? "" : " (no nodeName)"} — the editor never treats it as the active block${block.inspector ? ", so its inspector never shows" : ""}. Set nodeName: "${[...created][0]}".`,
          });
        }
        if (block.isActive) {
          try {
            trial.isActiveAfterInsert = !!block.isActive(editor as never);
          } catch (err) {
            trial.issues.push({ level: "error", message: `isActive(editor) threw: ${(err as Error).message}` });
          }
        }
        // Round trip: what the post stores must load back identically.
        const json = JSON.stringify(editor.getJSON());
        const again = make();
        try {
          again.commands.setContent(md);
          const md2 = markdownOf(again).trim();
          if (JSON.stringify(again.getJSON()) !== json) {
            trial.issues.push({ level: "error", message: "The stored Markdown does not load back into the same block (parseHTML / renderHTML don't match) — the block is lost or changed when the post is reopened." });
          } else if (md2 !== md) {
            trial.issues.push({ level: "warn", message: "Saving the reopened post changes its Markdown (unstable serialisation)." });
          }
        } finally {
          again.destroy();
        }
      } catch (err) {
        trial.issues.push({ level: "error", message: `insert() threw: ${(err as Error).stack ?? (err as Error).message}` });
      }
    }
    editor.destroy();
    return trials;
  });
}
