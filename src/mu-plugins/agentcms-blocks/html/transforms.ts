import { HTML_BLOCK_ID } from "./extension";
import { applyEdits, findMatchingClose, getAttr, scanTags } from "../htmlScan";

// Decodes the base64-JSON `data-attrs` payload back to the original
// code string. Mirrors encodeAttrs in extension.tsx — kept here as
// a local helper so the publish-time pipeline can run without
// importing the editor-side React module (avoids dragging React /
// lucide / Tiptap into the public site's runtime path).
function decodeCode(raw: string | null | undefined): string {
  if (!raw) return "";
  try {
    // atob + TextDecoder exist in browsers and in Node >= 16; Buffer
    // is the fallback for older Node runtimes. Never keyed on
    // `typeof window` — the CLI installs an in-memory window.
    let json: string;
    if (typeof globalThis.atob === "function" && typeof TextDecoder !== "undefined") {
      const bin = globalThis.atob(raw);
      const bytes = new Uint8Array(bin.length);
      for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
      json = new TextDecoder("utf-8").decode(bytes);
    } else {
      json = Buffer.from(raw, "base64").toString("utf-8");
    }
    const obj = JSON.parse(json) as { code?: unknown };
    return typeof obj.code === "string" ? obj.code : "";
  } catch {
    return "";
  }
}

// Replaces every Custom HTML marker in the rendered post body with
// the raw code the user entered. A tag scanner (not a bare regex)
// finds each marker's matching close tag, so the replacement stays
// correct when the marker sits inside a columns container or other
// nested block.
//
// Important: scripts in the user's code reach the published page
// verbatim. They DON'T execute inside the publisher — the body is
// handled as a string, scripts only run when a real browser loads
// the published file. This is the
// intended behaviour for a "Custom HTML" block: the user wants
// their JS to run on visitors' pages.
//
// DOMPurify in core/markdown.ts runs BEFORE this filter and would
// strip raw <script> tags from markdown. We sidestep that by
// storing the code base64-encoded inside `data-attrs` (DOMPurify
// keeps `data-*` attributes); the actual scripts only re-emerge at
// this point in the pipeline, after sanitisation has finished.
export function transformHtmlBlocks(html: string): string {
  if (!html.includes(HTML_BLOCK_ID)) return html;

  // String-based (htmlScan.ts), not DOMParser: the headless CLI has no
  // DOMParser and the DOMParser version left the markers in place
  // there. Each marker element (open tag → matching close, normally
  // empty) is replaced by the user's code; every other byte is kept.
  const tokens = scanTags(html);
  const edits: Array<{ start: number; end: number; text: string }> = [];
  for (let i = 0; i < tokens.length; i++) {
    const tok = tokens[i];
    if (tok.kind !== "open" || tok.name !== "div") continue;
    if (getAttr(tok, "data-cms-block") !== HTML_BLOCK_ID) continue;
    const closeIdx = findMatchingClose(tokens, i);
    const end = closeIdx === -1 ? tok.end : tokens[closeIdx].end;
    // Empty marker → stripped so no stray div is published.
    edits.push({ start: tok.start, end, text: decodeCode(decodeEntities(getAttr(tok, "data-attrs") ?? "")) });
    if (closeIdx !== -1) i = closeIdx;
  }
  return applyEdits(html, edits);
}

// Base64 never contains entities, but a serializer may still encode
// characters defensively; undo the few that can appear.
function decodeEntities(v: string): string {
  return v.replace(/&#x2B;|&#43;|&plus;/gi, "+").replace(/&#x2F;|&#47;|&sol;/gi, "/").replace(/&#x3D;|&#61;|&equals;/gi, "=").replace(/&amp;/g, "&");
}
