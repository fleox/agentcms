import { createRequire as __acmsRequire } from "node:module";
import { fileURLToPath as __acmsPath } from "node:url";
import { dirname as __acmsDirname } from "node:path";
const require2 = __acmsRequire(import.meta.url);
const __filename = __acmsPath(import.meta.url);
const __dirname = __acmsDirname(__filename);
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
  "HTMLBRElement"
];
async function withDom(fn) {
  const { Window } = await import("./index-Dx5OJr2e.mjs");
  const win = new Window({ url: "http://localhost/", settings: { disableJavaScriptEvaluation: true, disableJavaScriptFileLoading: true, disableCSSFileLoading: true } });
  const g = globalThis;
  const saved = /* @__PURE__ */ new Map();
  for (const key of DOM_KEYS) {
    const value = win[key];
    if (value === void 0) continue;
    saved.set(key, Object.getOwnPropertyDescriptor(globalThis, key));
    Object.defineProperty(globalThis, key, {
      value: typeof value === "function" && /^[a-z]/.test(key) ? value.bind(win) : value,
      configurable: true,
      writable: true
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
function blockTestMarkdown(trials) {
  return trials.filter((t) => t.markdown).map((t) => `## Block test: ${t.id}

<div data-agentcms-block-test="${t.id}"></div>

${t.markdown}`).join("\n\n");
}
function blockOutput(page, id) {
  const start = page.indexOf(`data-agentcms-block-test="${id}"`);
  if (start < 0) return null;
  const from = page.indexOf(">", start) + 1;
  const after = page.slice(from);
  const next = after.search(/<h2[^>]*>Block test: |<\/main>|data-agentcms-block-test=/);
  let own = next >= 0 ? after.slice(0, next) : after;
  own = own.replace(/^\s*<\/div>/, "");
  return own;
}
async function tryBlocks(blocks, media = { id: "media-harbor", url: "http://localhost:4321/media/demo/harbor/admin-original.svg", alt: "Boats in a harbor at sunrise" }) {
  if (blocks.length === 0) return [];
  return withDom(async () => {
    const [{ Editor }, { default: StarterKit }, { default: Link }, { default: Image }, { Markdown }] = await Promise.all([
      import("./index-i8xnXeXY.mjs").then((n) => n.y),
      import("./index-Bu1FzAzq.mjs"),
      import("./index-B_bi21ns.mjs"),
      import("./index-BnZ3EMJY.mjs"),
      import("./tiptap-markdown.es-7O1Oec69.mjs")
    ]);
    const blockExtensions = blocks.flatMap((b) => Array.isArray(b.extensions) ? b.extensions : []).filter((e, i, a) => a.indexOf(e) === i);
    const make = () => new Editor({
      extensions: [StarterKit, Link.configure({ openOnClick: false, autolink: true }), Image, Markdown.configure({ html: true, transformPastedText: true, breaks: false }), ...blockExtensions],
      content: ""
    });
    const markdownOf = (e) => e.storage.markdown.getMarkdown();
    const trials = [];
    let editor;
    try {
      editor = make();
    } catch (err) {
      return blocks.map((b) => ({ id: b.id, markdown: null, isActiveAfterInsert: null, issues: [{ level: "error", message: `The editor could not start with the blocks' extensions: ${err.message}` }] }));
    }
    for (const block of blocks) {
      const trial = { id: block.id, markdown: null, isActiveAfterInsert: null, issues: [] };
      trials.push(trial);
      try {
        editor.commands.setContent("");
        const pickMedia = async () => ({ ...media });
        await Promise.resolve(block.insert(editor.chain(), { pickMedia }));
        const md = markdownOf(editor).trim();
        trial.markdown = md;
        if (!md) {
          trial.issues.push({ level: "error", message: `insert() left the document empty — nothing would be saved (did it call .run()?).` });
          continue;
        }
        const created = /* @__PURE__ */ new Set();
        editor.state.doc.descendants((n) => {
          if (!["doc", "paragraph", "text"].includes(n.type.name)) created.add(n.type.name);
        });
        const expected = block.nodeName ?? (block.id.startsWith("core/") ? block.id.slice(5).replace(/-/g, "") : block.id);
        if (created.size && !created.has(expected)) {
          trial.issues.push({
            level: block.inspector ? "error" : "warn",
            message: `inserts node "${[...created].join(", ")}" but the admin looks for "${expected}"${block.nodeName ? "" : " (no nodeName)"} — the editor never treats it as the active block${block.inspector ? ", so its inspector never shows" : ""}. Set nodeName: "${[...created][0]}".`
          });
        }
        if (block.isActive) {
          try {
            trial.isActiveAfterInsert = !!block.isActive(editor);
          } catch (err) {
            trial.issues.push({ level: "error", message: `isActive(editor) threw: ${err.message}` });
          }
        }
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
        trial.issues.push({ level: "error", message: `insert() threw: ${err.stack ?? err.message}` });
      }
    }
    editor.destroy();
    return trials;
  });
}
export {
  blockOutput,
  blockTestMarkdown,
  tryBlocks
};
