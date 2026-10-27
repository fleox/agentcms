// Marketplace Core — block helpers. Mirrors the bundled themes'
// blocks/util.ts pattern: base64-encoded JSON in `data-attrs`. The
// editor nodes (createBlockNode.tsx + blocks/*/manifest.tsx) write the
// markers; the theme's `post.html.body` filter turns them into HTML at
// publish time.

export const THEME_BLOCK_NAMESPACE = "marketplace-core";

export function encodeAttrs<T>(value: T): string {
  if (value === undefined || value === null) return "";
  try {
    // btoa/atob exist in browsers and in Node >= 16 (agentcms ext check).
    return btoa(unescape(encodeURIComponent(JSON.stringify(value))));
  } catch {
    return "";
  }
}

export function decodeAttrs<T>(encoded: string | undefined | null, fallback: T): T {
  if (!encoded || typeof encoded !== "string") return fallback;
  try {
    return JSON.parse(decodeURIComponent(escape(atob(encoded)))) as T;
  } catch {
    return fallback;
  }
}

export function escapeAttr(value: unknown): string {
  if (typeof value !== "string") return "";
  return value
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

export function escapeText(value: unknown): string {
  if (typeof value !== "string") return "";
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

// Tiptap node name — `marketplace` prefix so this theme's nodes
// don't collide with other themes' atom nodes when both are
// transiently loaded.
export function nodeNameFor(blockSubId: string): string {
  return `marketplace${blockSubId.charAt(0).toUpperCase()}${blockSubId.slice(1)}`;
}
