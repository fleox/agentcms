import { createRequire as __acmsRequire } from "node:module";
import { fileURLToPath as __acmsPath } from "node:url";
import { dirname as __acmsDirname } from "node:path";
const require2 = __acmsRequire(import.meta.url);
const __filename = __acmsPath(import.meta.url);
const __dirname = __acmsDirname(__filename);
const SYSTEM_STACK = "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif";
const SYSTEM_FONT_NAME = "System";
const EDITOR_FONTS = [
  {
    name: SYSTEM_FONT_NAME,
    fallback: "sans-serif",
    stack: SYSTEM_STACK
  },
  {
    name: "Inter",
    fallback: "sans-serif",
    stack: `Inter, ${SYSTEM_STACK}`,
    googleHref: "https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap"
  },
  {
    name: "EB Garamond",
    fallback: "serif",
    stack: `'EB Garamond', Garamond, 'Times New Roman', Times, serif`,
    googleHref: "https://fonts.googleapis.com/css2?family=EB+Garamond:wght@400;700&display=swap"
  },
  {
    name: "Tinos",
    fallback: "serif",
    stack: `Tinos, 'Times New Roman', Times, serif`,
    googleHref: "https://fonts.googleapis.com/css2?family=Tinos:wght@400;700&display=swap"
  },
  {
    name: "Merriweather",
    fallback: "serif",
    stack: "Merriweather, Georgia, 'Times New Roman', serif",
    googleHref: "https://fonts.googleapis.com/css2?family=Merriweather:wght@400;700&display=swap"
  },
  {
    name: "Playfair Display",
    fallback: "serif",
    stack: "'Playfair Display', Georgia, 'Times New Roman', serif",
    googleHref: "https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700&display=swap"
  }
];
const EDITOR_FONT_OPTIONS = EDITOR_FONTS.map((f) => ({
  name: f.name,
  fallback: f.fallback,
  googleHref: f.googleHref
}));
const DEFAULT_EDITOR_SIZES = {
  body: "0.875rem",
  h1: "1.25rem",
  h2: "1.125rem",
  h3: "1rem"
};
export {
  DEFAULT_EDITOR_SIZES,
  EDITOR_FONTS,
  EDITOR_FONT_OPTIONS,
  SYSTEM_FONT_NAME
};
