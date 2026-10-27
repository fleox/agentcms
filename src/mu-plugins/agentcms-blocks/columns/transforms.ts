import { COLUMNS_BASELINE_STYLE_TAG } from "../styles";
import {
  applyEdits,
  getAttr,
  hasAttr,
  isVoidElement,
  rebuildOpenTag,
  scanTags,
} from "../htmlScan";

export const COLUMNS_BLOCK_ID = "agentcms-blocks/columns";

// Per-page detection flag read by the page.head.extra filter to decide
// whether to inject the baseline CSS (same pattern as agentcms-embeds /
// agentcms-sliders). The publish pipeline renders one page at a time
// (post.html.body → page.head.extra → page.body.end), so a module-level
// flag is safe. It is reset at the start of every transformColumnsHtml
// call AND consumed by page.body.end (the last per-page hook): listing
// pages (categories, authors, non-static homes) never run
// post.html.body, so without the second reset they would inherit the
// flag of the single page rendered just before them.
let detected = false;

// Transforms the post body's columns markers into the published
// markup. Two markers per columns block:
//
//   <div data-cms-block="agentcms-blocks/columns" data-cols="N" [data-widths style]>
//     <div data-cms-column>...</div>
//     <div data-cms-column>...</div>
//   </div>
//
// Becomes:
//
//   <div class="cms-columns cms-columns-cols-N" [data-widths style]>
//     <div class="cms-column">...</div>
//     <div class="cms-column">...</div>
//   </div>
//
// Inner content (paragraphs, headings, embeds, theme blocks) stays
// untouched — the theme / agentcms-embeds filters run AFTER ours
// (priority 5 vs 10) and pick up the nested markers.
//
// String-based (htmlScan.ts) rather than DOMParser so it works the
// same in the browser and in the headless CLI (Node, no DOMParser) —
// the DOMParser version left the markers in place on CLI publishes.
// Only the marker tags are rewritten; every other byte is preserved.
export function transformColumnsHtml(html: string): string {
  detected = false;
  if (!html.includes(COLUMNS_BLOCK_ID)) return html;

  const tokens = scanTags(html);
  const edits: Array<{ start: number; end: number; text: string }> = [];
  // Stack of open elements; `columns` marks a transformed container so
  // its DIRECT child column wrappers can be recognised (a nested
  // columns block gets its own entry and is processed independently).
  const stack: Array<{ name: string; columns: boolean }> = [];

  for (const tok of tokens) {
    if (tok.kind === "close") {
      const idx = findLastIndex(stack, (e) => e.name === tok.name);
      if (idx !== -1) stack.length = idx;
      continue;
    }
    const parent = stack[stack.length - 1];
    let isColumns = false;
    if (tok.name === "div" && getAttr(tok, "data-cms-block") === COLUMNS_BLOCK_ID) {
      isColumns = true;
      detected = true;
      const cols = sanitizeCols(getAttr(tok, "data-cols") ?? "2");
      edits.push({
        start: tok.start,
        end: tok.end,
        text: rebuildOpenTag(tok, {
          remove: ["data-cms-block", "data-cols"],
          addClasses: ["cms-columns", `cms-columns-cols-${cols}`],
        }),
      });
    } else if (tok.name === "div" && parent?.columns && hasAttr(tok, "data-cms-column")) {
      edits.push({
        start: tok.start,
        end: tok.end,
        text: rebuildOpenTag(tok, { remove: ["data-cms-column"], addClasses: ["cms-column"] }),
      });
    }
    if (!tok.selfClosing && !isVoidElement(tok.name)) {
      stack.push({ name: tok.name, columns: isColumns });
    }
  }

  return applyEdits(html, edits);
}

// Returns the head <style> block when at least one columns block was
// processed for the page being rendered.
export function getDetectedColumnsStyles(): string {
  return detected ? COLUMNS_BASELINE_STYLE_TAG : "";
}

// Called from page.body.end (the last per-page hook): clears the flag
// so the next page starts clean.
export function consumeColumnsDetection(): void {
  detected = false;
}

function sanitizeCols(value: string | null): number {
  const n = Number.parseInt(value ?? "", 10);
  if (!Number.isFinite(n)) return 2;
  return Math.max(1, Math.min(4, n));
}

function findLastIndex<T>(arr: T[], pred: (v: T) => boolean): number {
  for (let i = arr.length - 1; i >= 0; i--) if (pred(arr[i])) return i;
  return -1;
}

// Test-only helper: lets unit tests reset module state between
// cases. Not exported through the plugin manifest.
export function _resetForTests(): void {
  detected = false;
}
