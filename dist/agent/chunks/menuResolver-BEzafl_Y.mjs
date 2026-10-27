import { createRequire as __acmsRequire } from "node:module";
import { fileURLToPath as __acmsPath } from "node:url";
import { dirname as __acmsDirname } from "node:path";
const require2 = __acmsRequire(import.meta.url);
const __filename = __acmsPath(import.meta.url);
const __dirname = __acmsDirname(__filename);
import { isStaticHomePage, buildPostUrl, buildTermUrl } from "./slug-CZzRNKy4.mjs";
function resolveMenuItems(items, ctx) {
  return items.map((item) => {
    const resolved = {
      id: item.id,
      label: item.label,
      href: resolveMenuHref(item, ctx)
    };
    if (item.children) resolved.children = resolveMenuItems(item.children, ctx);
    const labels = pickLabelOverrides(item.translations);
    if (labels) resolved.labels = labels;
    return resolved;
  });
}
function pickLabelOverrides(translations) {
  if (!translations) return void 0;
  const out = {};
  for (const [lang, entry] of Object.entries(translations)) {
    const label = entry?.label?.trim();
    if (label) out[lang] = label;
  }
  return Object.keys(out).length > 0 ? out : void 0;
}
function resolveMenuHref(item, ctx) {
  if (item.externalUrl) return item.externalUrl;
  if (!item.ref) return "#";
  if (item.ref.kind === "home") return "/index.html";
  if (item.ref.kind === "post") {
    const post = [...ctx.posts, ...ctx.pages].find((p) => p.id === item.ref?.id);
    if (!post) return "#";
    if (isStaticHomePage(post, ctx.settings)) return "/index.html";
    const primaryTermId = "primaryTermId" in post ? post.primaryTermId : void 0;
    const term = primaryTermId ? ctx.terms.find((t) => t.id === primaryTermId) : void 0;
    return `/${buildPostUrl({ post, primaryTerm: term })}`;
  }
  if (item.ref.kind === "term") {
    const term = ctx.terms.find((t) => t.id === item.ref?.id);
    if (!term || term.type !== "category") return "#";
    return `/${buildTermUrl(term)}`;
  }
  return "#";
}
export {
  resolveMenuItems
};
