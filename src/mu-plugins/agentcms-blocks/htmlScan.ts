// Minimal, DOM-free HTML tag scanner shared by the publish-time
// transforms of agentcms-blocks.
//
// Why not DOMParser: the publish pipeline also runs headless in Node
// (the agentcms CLI — `content publish`, `regenerate`, `ext preview`),
// where no global DOMParser exists. A DOMParser-based transform
// silently returned the body untouched there, so the published page
// kept the raw `data-cms-block` markers and the baseline CSS was
// never injected (columns stacked on every theme). A string scanner
// behaves identically in the browser and in Node, and it leaves every
// byte outside the rewritten tags untouched (no re-serialisation).
//
// Scope: well-formed-ish HTML as produced by marked + DOMPurify.
// Quoted attribute values may contain `>`; comments, CDATA, doctype
// and raw-text elements (script / style / textarea / title) are
// skipped so tag-like text inside them is never matched.

export interface HtmlAttr {
  name: string; // lower-cased
  value: string | null; // decoded quotes removed; null = boolean attr
  raw: string; // original source of the attribute (without leading space)
}

export interface OpenTagToken {
  kind: "open";
  name: string; // lower-cased
  attrs: HtmlAttr[];
  selfClosing: boolean;
  start: number;
  end: number; // exclusive
}

export interface CloseTagToken {
  kind: "close";
  name: string;
  start: number;
  end: number;
}

export type TagToken = OpenTagToken | CloseTagToken;

const VOID_ELEMENTS = new Set([
  "area", "base", "br", "col", "embed", "hr", "img", "input", "link",
  "meta", "param", "source", "track", "wbr",
]);
const RAW_TEXT_ELEMENTS = new Set(["script", "style", "textarea", "title"]);

const ATTR_RE = /([^\s"'>/=]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'=<>`]+)))?/y;

// Parses the attribute section of an opening tag (`  a="b" c`).
export function parseAttrs(src: string): HtmlAttr[] {
  const out: HtmlAttr[] = [];
  let i = 0;
  while (i < src.length) {
    const ch = src[i];
    if (/\s/.test(ch) || ch === "/") {
      i++;
      continue;
    }
    ATTR_RE.lastIndex = i;
    const m = ATTR_RE.exec(src);
    if (!m) {
      i++;
      continue;
    }
    const value = m[2] ?? m[3] ?? m[4] ?? null;
    out.push({ name: m[1].toLowerCase(), value, raw: m[0] });
    i = ATTR_RE.lastIndex;
  }
  return out;
}

export function getAttr(tag: OpenTagToken, name: string): string | null | undefined {
  const a = tag.attrs.find((x) => x.name === name);
  return a ? a.value : undefined;
}

export function hasAttr(tag: OpenTagToken, name: string): boolean {
  return tag.attrs.some((x) => x.name === name);
}

// Scans `html` and returns every opening / closing tag in document
// order, with source offsets.
export function scanTags(html: string): TagToken[] {
  const tokens: TagToken[] = [];
  const len = html.length;
  let i = 0;
  while (i < len) {
    const lt = html.indexOf("<", i);
    if (lt === -1) break;
    if (html.startsWith("<!--", lt)) {
      const endC = html.indexOf("-->", lt + 4);
      i = endC === -1 ? len : endC + 3;
      continue;
    }
    if (html[lt + 1] === "!" || html[lt + 1] === "?") {
      const gt = html.indexOf(">", lt);
      i = gt === -1 ? len : gt + 1;
      continue;
    }
    const isClose = html[lt + 1] === "/";
    const nameStart = isClose ? lt + 2 : lt + 1;
    const nameMatch = /^[a-zA-Z][^\s/>]*/.exec(html.slice(nameStart, nameStart + 64));
    if (!nameMatch) {
      i = lt + 1;
      continue;
    }
    const name = nameMatch[0].toLowerCase();
    // Find the closing `>` while honouring quoted attribute values.
    let j = nameStart + nameMatch[0].length;
    let quote: string | null = null;
    while (j < len) {
      const c = html[j];
      if (quote) {
        if (c === quote) quote = null;
      } else if (c === '"' || c === "'") {
        quote = c;
      } else if (c === ">") {
        break;
      }
      j++;
    }
    if (j >= len) break; // unterminated tag — stop scanning
    const end = j + 1;
    if (isClose) {
      tokens.push({ kind: "close", name, start: lt, end });
      i = end;
      continue;
    }
    const inner = html.slice(nameStart + nameMatch[0].length, j);
    const selfClosing = /\/\s*$/.test(inner);
    tokens.push({
      kind: "open",
      name,
      attrs: parseAttrs(inner),
      selfClosing,
      start: lt,
      end,
    });
    i = end;
    if (RAW_TEXT_ELEMENTS.has(name) && !selfClosing) {
      // Skip to the matching close tag without tokenising the content.
      const closeRe = new RegExp(`</${name}\\s*>`, "ig");
      closeRe.lastIndex = end;
      const cm = closeRe.exec(html);
      if (!cm) break;
      tokens.push({ kind: "close", name, start: cm.index, end: cm.index + cm[0].length });
      i = cm.index + cm[0].length;
    }
  }
  return tokens;
}

export function isVoidElement(name: string): boolean {
  return VOID_ELEMENTS.has(name);
}

// Given the index of an opening tag token, returns the index of its
// matching close token (or -1 when the element is never closed).
export function findMatchingClose(tokens: TagToken[], openIndex: number): number {
  const open = tokens[openIndex];
  if (open.kind !== "open" || open.selfClosing || isVoidElement(open.name)) return -1;
  let depth = 0;
  for (let k = openIndex + 1; k < tokens.length; k++) {
    const t = tokens[k];
    if (t.name !== open.name) continue;
    if (t.kind === "open") {
      if (!t.selfClosing) depth++;
    } else if (depth === 0) {
      return k;
    } else {
      depth--;
    }
  }
  return -1;
}

function escapeAttr(value: string): string {
  return value.replace(/&/g, "&amp;").replace(/"/g, "&quot;");
}

// Rebuilds an opening tag: drops `remove` attributes, merges
// `addClasses` into the class attribute (kept first), keeps every
// other attribute verbatim.
export function rebuildOpenTag(
  tag: OpenTagToken,
  opts: { remove?: string[]; addClasses?: string[] },
): string {
  const remove = new Set((opts.remove ?? []).map((n) => n.toLowerCase()));
  const existingClass = getAttr(tag, "class");
  const classes = [
    ...(existingClass ?? "").split(/\s+/).filter(Boolean),
    ...(opts.addClasses ?? []),
  ].filter((c, idx, arr) => arr.indexOf(c) === idx);
  const parts: string[] = [];
  if (classes.length > 0) parts.push(`class="${escapeAttr(classes.join(" "))}"`);
  for (const a of tag.attrs) {
    if (a.name === "class" || remove.has(a.name)) continue;
    parts.push(a.raw);
  }
  return `<${tag.name}${parts.length ? " " + parts.join(" ") : ""}${tag.selfClosing ? " /" : ""}>`;
}

// Applies non-overlapping [start, end) → text replacements.
export function applyEdits(
  html: string,
  edits: Array<{ start: number; end: number; text: string }>,
): string {
  if (edits.length === 0) return html;
  const sorted = [...edits].sort((a, b) => a.start - b.start);
  let out = "";
  let pos = 0;
  for (const e of sorted) {
    if (e.start < pos) continue; // overlapping edit — keep the first
    out += html.slice(pos, e.start) + e.text;
    pos = e.end;
  }
  return out + html.slice(pos);
}
