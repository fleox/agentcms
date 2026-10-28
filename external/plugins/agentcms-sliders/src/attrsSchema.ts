import type { SettingsSchema } from "@agent-cms/runtime";
import type { SliderKind } from "./sliders";

// What each attribute of the four slider blocks does (shown by
// `agentcms content blocks agentcms-sliders/<kind>`). Keep in sync with
// the renderers in sliders.ts and the runtime in runtime/slider.{js,css}.

const IMG =
  "a media URL (from `agentcms media upload` → `formats.<name>.url`, e.g. `formats.large.url`) or a site path / absolute URL";

const autoplay = { description: "Advance slides automatically." };
const interval = {
  description: "Autoplay delay in milliseconds (values under 1500 are raised to 1500 by the runtime).",
  min: 1500,
};
const showDots = { description: "Show the dot navigation (only when there are 2+ slides)." };
const showArrows = { description: "Show previous / next arrows (only when there are 2+ slides)." };
const loop = { description: "Wrap around from the last slide to the first." };

export const ATTRS_SCHEMAS: Record<SliderKind, SettingsSchema> = {
  image: {
    slides: {
      description: `Slides: [{ src, alt?, caption?, link? }]. src = ${IMG} (the editor picks "large"); caption = optional text shown with the slide; link = URL or site path wrapping the image. Empty list = nothing rendered.`,
      format: "array of objects",
    },
    autoplay,
    interval,
    showDots,
    showArrows,
    loop,
    aspectRatio: {
      description: "Slide aspect ratio (images are cropped to fill).",
      values: ["16/9", "4/3", "1/1", "21/9"],
    },
  },
  hero: {
    slides: {
      description: `Full-width slides: [{ backgroundSrc, eyebrow?, title?, subtitle?, ctaLabel?, ctaHref?, overlay }]. backgroundSrc = ${IMG} (background image); title renders as h2; the button needs both ctaLabel and ctaHref (URL or site path); overlay = "none" | "light" | "dark" tint over the image for text contrast. Empty list = nothing rendered.`,
      format: "array of objects",
    },
    height: {
      description: "Slide height: short = 50vh, medium = 70vh, tall = 100vh.",
      values: ["short", "medium", "tall"],
    },
    align: { description: "Horizontal alignment of the slide text.", values: ["left", "center", "right"] },
    autoplay,
    interval,
    showDots,
    showArrows,
  },
  card: {
    slides: {
      description: `Cards: [{ imageSrc?, imageAlt?, title?, text?, link?, linkLabel? }]. imageSrc = ${IMG} (the editor picks "medium"); title renders as h3; link = URL or site path of the card's link, whose text is linkLabel (empty = the URL itself). Empty list = nothing rendered.`,
      format: "array of objects",
    },
    perView: {
      description: "Cards visible at once on desktop (always 1 on mobile).",
      values: [1, 2, 3, 4],
    },
    autoplay,
    interval,
    showDots,
    showArrows,
    loop,
  },
  logo: {
    logos: {
      description: `Logos scrolling continuously: [{ src, alt?, link? }]. src = ${IMG} (the editor picks "medium"); link = URL or site path wrapping the logo. Empty list = nothing rendered.`,
      format: "array of objects",
    },
    speed: {
      description: "Scroll speed (one loop: slow = 60 s, normal = 35 s, fast = 18 s).",
      values: ["slow", "normal", "fast"],
    },
    grayscale: { description: "Show logos in grayscale (color on hover)." },
    height: { description: "Logo height in pixels (clamped to 20–120).", min: 20, max: 120 },
  },
};
