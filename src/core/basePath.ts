// Sub-folder deployments (e.g. GitHub Pages project sites served at
// `https://user.github.io/repo/`).
//
// Themes and plugins emit root-absolute links (`/theme-assets/x.css`,
// `/news/post.html`, `/index.html`). On a site served from `/repo/`
// those 404. Instead of making every template base-aware, the base path
// is derived from `settings.baseUrl`'s pathname and applied ONCE to the
// final HTML by renderPageToHtml (applyBasePathToHtml). Client-side
// loaders read the injected `<meta name="x-cms-base">` to prefix the
// URLs they build at runtime.
//
// Upload paths never change: the publish target's root IS the site
// root, whatever URL it is served from.

export const BASE_META_NAME = "x-cms-base";

// "https://user.github.io/repo/" → "/repo" ; "https://site.com" → "".
// No trailing slash; empty string means "served from the domain root".
export function basePathFromBaseUrl(baseUrl: string | undefined | null): string {
  if (!baseUrl) return "";
  let pathname: string;
  try {
    pathname = new URL(baseUrl).pathname;
  } catch {
    return "";
  }
  const trimmed = pathname.replace(/\/+$/, "");
  return trimmed === "" ? "" : trimmed.startsWith("/") ? trimmed : `/${trimmed}`;
}

// Prefixes a root-absolute path with the base path. Relative paths,
// absolute URLs, protocol-relative URLs and already-prefixed paths pass
// through unchanged.
export function withBasePath(path: string, basePath: string): string {
  if (!basePath || !path.startsWith("/") || path.startsWith("//")) return path;
  if (path === basePath || path.startsWith(basePath + "/")) return path;
  return basePath + path;
}

// Attributes whose value is a single URL.
const URL_ATTR_RE = /(\s(?:href|src|action|poster|data-src|data-href)=)(["'])(\/[^"']*)\2/gi;
// srcset="a.webp 1x, /b.webp 2x" — rewrite every candidate.
const SRCSET_RE = /(\s(?:srcset|imagesrcset)=)(["'])([^"']*)\2/gi;

function rewriteSrcset(value: string, basePath: string): string {
  return value
    .split(",")
    .map((candidate) => {
      const match = candidate.match(/^(\s*)(\S+)(.*)$/);
      if (!match) return candidate;
      return match[1] + withBasePath(match[2], basePath) + match[3];
    })
    .join(",");
}

// Rewrites root-absolute URL attributes and injects the base meta right
// after <head>. No-op when basePath is empty, so pages of root-served
// sites stay byte-identical (and keep their lastPublishedHash).
export function applyBasePathToHtml(html: string, basePath: string): string {
  if (!basePath) return html;
  let out = html.replace(
    URL_ATTR_RE,
    (_, attr: string, quote: string, value: string) =>
      `${attr}${quote}${withBasePath(value, basePath)}${quote}`,
  );
  out = out.replace(
    SRCSET_RE,
    (_, attr: string, quote: string, value: string) =>
      `${attr}${quote}${rewriteSrcset(value, basePath)}${quote}`,
  );
  const meta = `<meta name="${BASE_META_NAME}" content="${basePath}/"/>`;
  out = out.replace(/<head(\s[^>]*)?>/i, (head) => head + meta);
  return out;
}

// The site's own assets as root-relative URLs. Media URLs are stored
// absolute (`<site URL>/media/…`), so a page opened from another address
// of the same site — the https endpoint of an http site, a custom domain
// in front — would load them from the stored origin, and browsers block
// http images on an https page. Links (href) and meta values stay
// absolute: canonical, hreflang and og:image need the full URL.
export function siteRelativeUrl(url: string, baseUrl: string | undefined | null): string {
  const origin = siteOrigin(baseUrl);
  return origin && url.startsWith(origin + "/") ? url.slice(origin.length) : url;
}

function siteOrigin(baseUrl: string | undefined | null): string {
  if (!baseUrl) return "";
  try {
    const u = new URL(baseUrl);
    return u.protocol === "http:" || u.protocol === "https:" ? u.origin : "";
  } catch {
    return "";
  }
}

const ASSET_ATTR_RE = /(\s(?:src|poster|data-src)=)(["'])([^"']*)\2/gi;
const ASSET_SRCSET_RE = /(\s(?:srcset|imagesrcset)=)(["'])([^"']*)\2/gi;

export function siteRelativeAssets(html: string, baseUrl: string | undefined | null): string {
  const origin = siteOrigin(baseUrl);
  if (!origin || !html.includes(origin + "/")) return html;
  const rel = (v: string) => siteRelativeUrl(v, baseUrl);
  return html
    .replace(ASSET_ATTR_RE, (_, attr: string, q: string, v: string) => `${attr}${q}${rel(v)}${q}`)
    .replace(ASSET_SRCSET_RE, (_, attr: string, q: string, v: string) =>
      `${attr}${q}${v.split(",").map((c) => c.replace(/^(\s*)(\S+)/, (_m, sp: string, u: string) => sp + rel(u))).join(",")}${q}`,
    );
}

// The reverse, for the admin's preview iframe (served from the admin's
// address, not the site's): root-relative asset URLs go back to the
// site's origin so preview images keep loading.
export function absoluteAssets(html: string, baseUrl: string | undefined | null): string {
  const origin = siteOrigin(baseUrl);
  if (!origin) return html;
  const abs = (v: string) => (v.startsWith("/") && !v.startsWith("//") ? origin + v : v);
  return html
    .replace(ASSET_ATTR_RE, (_, attr: string, q: string, v: string) => `${attr}${q}${abs(v)}${q}`)
    .replace(ASSET_SRCSET_RE, (_, attr: string, q: string, v: string) =>
      `${attr}${q}${v.split(",").map((c) => c.replace(/^(\s*)(\S+)/, (_m, sp: string, u: string) => sp + abs(u))).join(",")}${q}`,
    );
}
