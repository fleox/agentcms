// Images the admin just uploaded, kept as in-memory blob URLs for the
// session. On hosts that publish with a delay (GitHub / GitLab /
// Cloudflare Pages build after each commit, CDNs…) the public URL 404s
// for a minute; admin previews use the local copy meanwhile so a fresh
// upload shows instantly instead of as a broken image.

const IMAGE_RE = /\.(webp|png|jpe?g|gif|avif|svg|ico)$/i;
const MIME: Record<string, string> = {
  webp: "image/webp",
  png: "image/png",
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  gif: "image/gif",
  avif: "image/avif",
  svg: "image/svg+xml",
  ico: "image/x-icon",
};

// Site-relative path ("media/2026/10/x/small.webp") → blob URL.
const byPath = new Map<string, string>();

function normalize(path: string): string {
  return path.replace(/^\/+/, "");
}

export function rememberUploadedImage(path: string, base64: string): void {
  if (typeof URL === "undefined" || typeof URL.createObjectURL !== "function") return;
  const clean = normalize(path);
  if (!IMAGE_RE.test(clean)) return;
  try {
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
    const ext = clean.split(".").pop()!.toLowerCase();
    const previous = byPath.get(clean);
    if (previous) URL.revokeObjectURL(previous);
    byPath.set(clean, URL.createObjectURL(new Blob([bytes], { type: MIME[ext] ?? "application/octet-stream" })));
  } catch {
    // Not valid base64 — nothing to cache.
  }
}

// Local copy for a public URL (or path), if this session uploaded it.
// Matches on the path suffix, so it works whatever the site's base URL
// or sub-folder is.
export function localImageFor(src: string | undefined | null): string | null {
  if (!src || byPath.size === 0) return null;
  let pathname = src;
  try {
    pathname = new URL(src, "http://x").pathname;
  } catch {
    // Keep as-is.
  }
  pathname = decodeURIComponent(pathname);
  for (const [path, url] of byPath) {
    if (pathname === `/${path}` || pathname.endsWith(`/${path}`)) return url;
  }
  return null;
}
