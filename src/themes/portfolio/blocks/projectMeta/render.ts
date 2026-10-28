import { decodeAttrs, encodeAttrs, escapeAttr, escapeText } from "../util";

export interface ProjectMetaAttrs {
  // Each row = a "label / value" pair shown in the meta column.
  // Common labels: SERVICES, YEAR, AWARDS, CLIENT, LOCATION.
  // The label is rendered in label-sm uppercase; the value is body-md
  // with multi-line support via newlines.
  rows: { label: string; value: string }[];
}

export interface ProjectMetaRenderResult {
  html: string;
}

export const DEFAULT_PROJECT_META_ATTRS: ProjectMetaAttrs = {
  rows: [
    { label: "SERVICES", value: "Creative Direction\nArt Direction" },
    { label: "YEAR", value: "2024" },
    { label: "AWARDS", value: "Gold Design Circle" },
  ],
};

// Renders the meta column block as a 3-up grid on desktop, stacked on
// mobile. Designed to drop into the right column of a single-post
// body — when the user wants to override the auto-rendered meta in
// SingleTemplate's left aside, they delete it from the sidebar and
// place a project-meta block in the body.
export function renderProjectMeta(attrs: ProjectMetaAttrs): ProjectMetaRenderResult {
  const rows = (attrs.rows ?? []).filter((r) => r.label || r.value);
  if (rows.length === 0) return { html: "" };
  const cells = rows
    .map((r) => {
      const valueLines = r.value
        .split(/\r?\n/)
        .map((line) => line.trim())
        .filter(Boolean)
        .map((line) => escapeText(line))
        .join("<br/>");
      return `<div class="flex flex-col gap-2"><span class="font-sans text-label-sm uppercase tracking-widest text-secondary">${escapeText(r.label)}</span><p class="font-sans text-body-md text-on-surface">${valueLines}</p></div>`;
    })
    .join("");
  return {
    html: `<aside class="portfolio-project-meta max-w-container-max mx-auto px-margin-edge-mobile md:px-margin-edge py-section-gap-mobile md:py-section-gap grid grid-cols-1 md:grid-cols-${Math.min(rows.length, 4)} gap-gutter" data-attrs="${escapeAttr(encodeAttrs({ rows }))}">${cells}</aside>`,
  };
}

const PROJECT_META_MARKER_REGEX =
  /<div\s+([^>]*data-cms-block="portfolio\/project-meta"[^>]*)>\s*<\/div>/g;

export function transformProjectMeta(bodyHtml: string): string {
  return bodyHtml.replace(PROJECT_META_MARKER_REGEX, (full, raw) => {
    const m = raw.match(/data-attrs=(?:"([^"]*)"|'([^']*)'|([^\s>]+))/);
    const enc = m ? m[1] ?? m[2] ?? m[3] ?? "" : "";
    const attrs = decodeAttrs<ProjectMetaAttrs>(enc, DEFAULT_PROJECT_META_ATTRS);
    return renderProjectMeta(attrs).html || full;
  });
}

// Labels recognised as the project's year in a project-meta row
// (compared upper-cased, accents stripped).
const YEAR_LABELS = new Set([
  "YEAR", "ANNÉE", "AN", "DATE", "JAHR", "AÑO", "ANO", "JAAR", "연도", "년도",
].map(normalizeLabel));

function normalizeLabel(label: string): string {
  return label
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toUpperCase();
}

// Returns the year carried by the first portfolio/project-meta block
// found in `sources` (rendered body HTML — the rendered aside keeps its
// rows in `data-attrs` — or the raw Markdown marker), or "" when there
// is none. A row counts when its label is a "year" word (YEAR, ANNÉE,
// JAHR, …) and its value is non-empty; the first value line is returned
// verbatim (so "2025–2027" stays a range).
export function extractProjectMetaYear(...sources: (string | undefined | null)[]): string {
  const re =
    /<(?:aside|div)\s+([^>]*(?:class="portfolio-project-meta[^"]*"|data-cms-block="portfolio\/project-meta")[^>]*)>/g;
  for (const src of sources) {
    if (!src) continue;
    for (const match of src.matchAll(re)) {
      const raw = match[1];
      const m = raw.match(/data-attrs=(?:"([^"]*)"|'([^']*)'|([^\s>]+))/);
      const enc = m ? m[1] ?? m[2] ?? m[3] ?? "" : "";
      if (!enc) continue;
      const attrs = decodeAttrs<ProjectMetaAttrs | null>(enc, null);
      for (const row of attrs?.rows ?? []) {
        if (!row || typeof row.label !== "string" || typeof row.value !== "string") continue;
        if (!YEAR_LABELS.has(normalizeLabel(row.label))) continue;
        const first = row.value.split(/\r?\n/).map((l) => l.trim()).find(Boolean);
        if (first) return first;
      }
    }
  }
  return "";
}
