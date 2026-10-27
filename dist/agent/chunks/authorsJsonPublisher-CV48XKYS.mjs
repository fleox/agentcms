import { createRequire as __acmsRequire } from "node:module";
import { fileURLToPath as __acmsPath } from "node:url";
import { dirname as __acmsDirname } from "node:path";
const require2 = __acmsRequire(import.meta.url);
const __filename = __acmsPath(import.meta.url);
const __dirname = __acmsDirname(__filename);
import { mediaToView, pickFormat } from "./media-K2GXb5Xy.mjs";
import { buildAuthorUrl } from "./slug-CZzRNKy4.mjs";
import { r as resolvePublicDisplayName, S as SOCIAL_NETWORKS } from "./users-CWcF8Vrg.mjs";
import { p as publicUrlFor, u as uploadFile } from "./siteFiles-CIBz6FxK.mjs";
const BASE_META_NAME = "x-cms-base";
function basePathFromBaseUrl(baseUrl) {
  if (!baseUrl) return "";
  let pathname;
  try {
    pathname = new URL(baseUrl).pathname;
  } catch {
    return "";
  }
  const trimmed = pathname.replace(/\/+$/, "");
  return trimmed === "" ? "" : trimmed.startsWith("/") ? trimmed : `/${trimmed}`;
}
function withBasePath(path, basePath) {
  if (!basePath || !path.startsWith("/") || path.startsWith("//")) return path;
  if (path === basePath || path.startsWith(basePath + "/")) return path;
  return basePath + path;
}
const URL_ATTR_RE = /(\s(?:href|src|action|poster|data-src|data-href)=)(["'])(\/[^"']*)\2/gi;
const SRCSET_RE = /(\s(?:srcset|imagesrcset)=)(["'])([^"']*)\2/gi;
function rewriteSrcset(value, basePath) {
  return value.split(",").map((candidate) => {
    const match = candidate.match(/^(\s*)(\S+)(.*)$/);
    if (!match) return candidate;
    return match[1] + withBasePath(match[2], basePath) + match[3];
  }).join(",");
}
function applyBasePathToHtml(html, basePath) {
  if (!basePath) return html;
  let out = html.replace(
    URL_ATTR_RE,
    (_, attr, quote, value) => `${attr}${quote}${withBasePath(value, basePath)}${quote}`
  );
  out = out.replace(
    SRCSET_RE,
    (_, attr, quote, value) => `${attr}${quote}${rewriteSrcset(value, basePath)}${quote}`
  );
  const meta = `<meta name="${BASE_META_NAME}" content="${basePath}/"/>`;
  out = out.replace(/<head(\s[^>]*)?>/i, (head) => head + meta);
  return out;
}
function siteRelativeUrl(url, baseUrl) {
  const origin = siteOrigin(baseUrl);
  return origin && url.startsWith(origin + "/") ? url.slice(origin.length) : url;
}
function siteOrigin(baseUrl) {
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
function siteRelativeAssets(html, baseUrl) {
  const origin = siteOrigin(baseUrl);
  if (!origin || !html.includes(origin + "/")) return html;
  const rel = (v) => siteRelativeUrl(v, baseUrl);
  return html.replace(ASSET_ATTR_RE, (_, attr, q, v) => `${attr}${q}${rel(v)}${q}`).replace(
    ASSET_SRCSET_RE,
    (_, attr, q, v) => `${attr}${q}${v.split(",").map((c) => c.replace(/^(\s*)(\S+)/, (_m, sp, u) => sp + rel(u))).join(",")}${q}`
  );
}
function absoluteAssets(html, baseUrl) {
  const origin = siteOrigin(baseUrl);
  if (!origin) return html;
  const abs = (v) => v.startsWith("/") && !v.startsWith("//") ? origin + v : v;
  return html.replace(ASSET_ATTR_RE, (_, attr, q, v) => `${attr}${q}${abs(v)}${q}`).replace(
    ASSET_SRCSET_RE,
    (_, attr, q, v) => `${attr}${q}${v.split(",").map((c) => c.replace(/^(\s*)(\S+)/, (_m, sp, u) => sp + abs(u))).join(",")}${q}`
  );
}
const AUTHORS_JSON_PATH = "data/authors.json";
function buildAuthorsJson(users, media, posts, pages, baseUrl) {
  const mediaMap = media instanceof Map ? media : new Map(media.map((m) => [m.id, m]));
  const referenced = /* @__PURE__ */ new Set();
  for (const post of [...posts, ...pages]) {
    if (post.status !== "online") continue;
    if (post.authorId) referenced.add(post.authorId);
  }
  const authors = {};
  for (const user of users) {
    if (!referenced.has(user.id)) continue;
    const displayName = resolvePublicDisplayName(user);
    if (!displayName) continue;
    const heroView = user.avatarMediaId ? mediaToView(mediaMap.get(user.avatarMediaId)) : void 0;
    const avatar = heroView ? siteRelativeUrl(pickFormat(heroView, "medium"), baseUrl) : "";
    const socials = [];
    if (user.socials) {
      for (const network of SOCIAL_NETWORKS) {
        const entry = user.socials[network];
        if (!entry || !entry.visible) continue;
        if (typeof entry.url !== "string" || !entry.url.trim()) continue;
        socials.push({ network, url: entry.url.trim() });
      }
    }
    authors[user.id] = {
      id: user.id,
      displayName,
      title: user.title,
      bio: user.bio,
      avatar: avatar || void 0,
      url: buildAuthorUrl(user, users),
      socials: socials.length > 0 ? socials : void 0
    };
  }
  return {
    generatedAt: (/* @__PURE__ */ new Date()).toISOString(),
    authors
  };
}
async function publishAuthorsJson(users, media, posts, pages, pathOverride) {
  const blob = buildAuthorsJson(users, media, posts, pages, await publicUrlFor(""));
  await uploadFile({
    path: pathOverride ?? AUTHORS_JSON_PATH,
    content: JSON.stringify(blob),
    encoding: "utf-8"
  });
}
const authorsJsonPublisher = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  AUTHORS_JSON_PATH,
  buildAuthorsJson,
  publishAuthorsJson
}, Symbol.toStringTag, { value: "Module" }));
export {
  absoluteAssets as a,
  buildAuthorsJson as b,
  basePathFromBaseUrl as c,
  applyBasePathToHtml as d,
  siteRelativeUrl as e,
  authorsJsonPublisher as f,
  publishAuthorsJson as p,
  siteRelativeAssets as s,
  withBasePath as w
};
