import { decodeAttrs, escapeAttr, escapeText } from "../util";

// Bento gallery — tight 12-col grid that fits whatever column it is
// dropped into (post prose column, page body, full width):
//   - col-span-8 main image (4:3)
//   - col-span-4 stacked sub images, stretched to the main image's height
//   - col-span-12 wide image (16:9)
// Every cell is an aspect-ratio box with an absolutely-positioned
// cover image, so the grid never depends on the images' intrinsic
// heights (the prose `img { height: auto }` rule used to collapse the
// images inside fixed-height cells and leave tall empty panels).
// Mobile stacks every image at 4:3.
export interface BentoGalleryAttrs {
  mainImageUrl: string;
  mainImageAlt: string;
  subTopImageUrl: string;
  subTopImageAlt: string;
  // Apply grayscale filter to sub-top (matches the mockup).
  subTopGrayscale: boolean;
  subBottomImageUrl: string;
  subBottomImageAlt: string;
  wideImageUrl: string;
  wideImageAlt: string;
}

export interface BentoGalleryRenderResult {
  html: string;
}

export const DEFAULT_BENTO_GALLERY_ATTRS: BentoGalleryAttrs = {
  mainImageUrl: "",
  mainImageAlt: "",
  subTopImageUrl: "",
  subTopImageAlt: "",
  subTopGrayscale: true,
  subBottomImageUrl: "",
  subBottomImageAlt: "",
  wideImageUrl: "",
  wideImageAlt: "",
};

const IMG_CLASSES =
  "absolute inset-0 w-full h-full object-cover transition-transform duration-500 hover:scale-[1.02]";

function cell(url: string, alt: string, boxClasses: string, grayscale = false): string {
  const inner = url
    ? `<img src="${escapeAttr(url)}" alt="${escapeAttr(alt)}" class="${IMG_CLASSES}${grayscale ? " grayscale" : ""}" loading="lazy"/>`
    : "";
  return `<div class="portfolio-bento-cell relative overflow-hidden bg-surface-container ${boxClasses}">${inner}</div>`;
}

export function renderBentoGallery(attrs: BentoGalleryAttrs): BentoGalleryRenderResult {
  const hasAny =
    attrs.mainImageUrl ||
    attrs.subTopImageUrl ||
    attrs.subBottomImageUrl ||
    attrs.wideImageUrl;
  if (!hasAny) return { html: "" };

  const hasSubs = Boolean(attrs.subTopImageUrl || attrs.subBottomImageUrl);
  const hasTopRow = Boolean(attrs.mainImageUrl || hasSubs);

  // Main image spans the full row when there are no sub images.
  const mainCol = attrs.mainImageUrl || hasSubs
    ? cell(
        attrs.mainImageUrl,
        attrs.mainImageAlt,
        hasSubs ? "aspect-[4/3] md:col-span-8" : "aspect-[4/3] md:col-span-12",
      )
    : "";
  const subCol = hasSubs
    ? `<div class="md:col-span-4 grid grid-cols-1 md:grid-rows-2 gap-4 md:gap-6">${cell(
        attrs.subTopImageUrl,
        attrs.subTopImageAlt,
        "aspect-[4/3] md:aspect-auto",
        attrs.subTopGrayscale,
      )}${cell(attrs.subBottomImageUrl, attrs.subBottomImageAlt, "aspect-[4/3] md:aspect-auto")}</div>`
    : "";
  const wideCol = attrs.wideImageUrl
    ? cell(attrs.wideImageUrl, attrs.wideImageAlt, "aspect-[4/3] md:aspect-[16/9] md:col-span-12")
    : "";

  return {
    html: `<section class="portfolio-bento my-12 md:my-16"><div class="grid grid-cols-1 md:grid-cols-12 gap-4 md:gap-6">${hasTopRow ? mainCol + subCol : ""}${wideCol}</div></section>`,
  };
}

const BENTO_GALLERY_MARKER_REGEX =
  /<div\s+([^>]*data-cms-block="portfolio\/bento-gallery"[^>]*)>\s*<\/div>/g;

export function transformBentoGallery(bodyHtml: string): string {
  return bodyHtml.replace(BENTO_GALLERY_MARKER_REGEX, (full, raw) => {
    const m = raw.match(/data-attrs=(?:"([^"]*)"|'([^']*)'|([^\s>]+))/);
    const enc = m ? m[1] ?? m[2] ?? m[3] ?? "" : "";
    const attrs = decodeAttrs<BentoGalleryAttrs>(enc, DEFAULT_BENTO_GALLERY_ATTRS);
    return renderBentoGallery(attrs).html || full;
  });
}

// Trivial escape suppression — included so the file uses both
// escape helpers and stays consistent with sibling render files.
escapeText;
