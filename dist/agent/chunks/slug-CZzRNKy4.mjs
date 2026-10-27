import { createRequire as __acmsRequire } from "node:module";
import { fileURLToPath as __acmsPath } from "node:url";
import { dirname as __acmsDirname } from "node:path";
const require2 = __acmsRequire(import.meta.url);
const __filename = __acmsPath(import.meta.url);
const __dirname = __acmsDirname(__filename);
const SPELLED = { œ: "oe", Œ: "oe", æ: "ae", Æ: "ae", ß: "ss", ø: "o", Ø: "o", đ: "d", Đ: "d", ł: "l", Ł: "l", þ: "th", Þ: "th", ð: "d", Ð: "d" };
function slugify(input) {
  return input.replace(/[œŒæÆßøØđĐłŁþÞðÐ]/g, (c) => SPELLED[c] ?? c).normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 96);
}
function isValidSlug(slug) {
  return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug);
}
function buildPostUrl({ post, primaryTerm }) {
  const postSlug = post.slug.trim();
  if (!postSlug) throw new Error("Post slug is required to build its URL.");
  if (post.type === "page") {
    return `${postSlug}.html`;
  }
  if (primaryTerm && primaryTerm.type === "category") {
    const termSlug = primaryTerm.slug.trim();
    if (!termSlug) throw new Error("Primary category slug is required to build the post URL.");
    return `${termSlug}/${postSlug}.html`;
  }
  return `${postSlug}.html`;
}
function authorBaseSlug(user) {
  const fullName = [user.firstName, user.lastName].filter(Boolean).join(" ").trim();
  const candidate = fullName || user.displayName?.trim() || user.email?.split("@")[0] || user.id;
  return slugify(candidate) || user.id.slice(0, 8);
}
function buildAuthorUrl(user, others) {
  const base = authorBaseSlug(user);
  const collision = others.some((u) => u.id !== user.id && authorBaseSlug(u) === base);
  const slug = collision ? `${base}-${user.id.slice(0, 6)}` : base;
  return `author/${slug}.html`;
}
function buildTermUrl(term) {
  const slug = term.slug.trim();
  if (!slug) throw new Error("Term slug is required to build its URL.");
  if (term.type !== "category") {
    throw new Error("Only categories produce a public archive URL.");
  }
  return `${slug}/index.html`;
}
const HOME_PATH = "index.html";
function isStaticHomePage(post, settings) {
  return !!settings && post.type === "page" && settings.homeMode === "static-page" && !!settings.homePageId && settings.homePageId === post.id;
}
const NOT_FOUND_PATH = "404.html";
const SITEMAP_PATH = "sitemap.xml";
function pathToPublicUrl(baseUrl, path) {
  const cleanBase = baseUrl.replace(/\/+$/, "");
  const cleanPath = path.replace(/^\/+/, "");
  return `${cleanBase}/${cleanPath}`;
}
function canonicalPath(path) {
  return path.replace(/(^|\/)index\.html$/i, (_, sep) => sep);
}
function canonicalUrl(baseUrl, path) {
  if (!baseUrl) return "";
  const cleanBase = baseUrl.replace(/\/+$/, "");
  const cleanPath = canonicalPath(path.replace(/^\/+/, ""));
  return `${cleanBase}/${cleanPath}`;
}
function findAvailableSlug(base, isUsed) {
  if (!base) base = "untitled";
  if (!isUsed(base)) return base;
  for (let i = 2; i < 1e3; i++) {
    const candidate = `${base}-${i}`;
    if (!isUsed(candidate)) return candidate;
  }
  return `${base}-${Date.now()}`;
}
function detectPathCollision(candidatePath, posts, pages, terms, ignoreId) {
  for (const post of posts) {
    if (post.id === ignoreId) continue;
    const term = post.primaryTermId ? terms.find((t) => t.id === post.primaryTermId) : void 0;
    let p;
    try {
      p = buildPostUrl({ post, primaryTerm: term });
    } catch {
      continue;
    }
    if (p === candidatePath) {
      return { kind: "post", id: post.id, label: post.title || post.slug, path: p };
    }
  }
  for (const page of pages) {
    if (page.id === ignoreId) continue;
    let p;
    try {
      p = buildPostUrl({ post: page });
    } catch {
      continue;
    }
    if (p === candidatePath) {
      return { kind: "page", id: page.id, label: page.title || page.slug, path: p };
    }
  }
  for (const term of terms) {
    if (term.id === ignoreId) continue;
    if (term.type !== "category") continue;
    let p;
    try {
      p = buildTermUrl(term);
    } catch {
      continue;
    }
    if (p === candidatePath) {
      return { kind: "category", id: term.id, label: term.name || term.slug, path: p };
    }
  }
  return null;
}
function detectTermSlugCollision(candidate, terms, ignoreId) {
  for (const term of terms) {
    if (term.id === ignoreId) continue;
    if (term.type !== candidate.type) continue;
    if (term.slug !== candidate.slug) continue;
    return {
      kind: "category",
      id: term.id,
      label: term.name || term.slug,
      path: term.slug
    };
  }
  return null;
}
function normalizeMediaSlug(filename) {
  const lastDot = filename.lastIndexOf(".");
  const stem = lastDot > 0 ? filename.slice(0, lastDot) : filename;
  const base = slugify(stem) || "media";
  return `${base}-${randomHexSuffix(6)}`;
}
function randomHexSuffix(length) {
  if (typeof crypto !== "undefined" && typeof crypto.getRandomValues === "function") {
    const bytes = new Uint8Array(Math.ceil(length / 2));
    crypto.getRandomValues(bytes);
    return Array.from(bytes).map((b) => b.toString(16).padStart(2, "0")).join("").slice(0, length);
  }
  return Math.random().toString(16).slice(2, 2 + length);
}
export {
  HOME_PATH,
  NOT_FOUND_PATH,
  SITEMAP_PATH,
  buildAuthorUrl,
  buildPostUrl,
  buildTermUrl,
  canonicalPath,
  canonicalUrl,
  detectPathCollision,
  detectTermSlugCollision,
  findAvailableSlug,
  isStaticHomePage,
  isValidSlug,
  normalizeMediaSlug,
  pathToPublicUrl,
  slugify
};
