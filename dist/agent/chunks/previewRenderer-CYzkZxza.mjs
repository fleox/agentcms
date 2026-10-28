import { createRequire as __acmsRequire } from "node:module";
import { fileURLToPath as __acmsPath } from "node:url";
import { dirname as __acmsDirname } from "node:path";
const require2 = __acmsRequire(import.meta.url);
const __filename = __acmsPath(import.meta.url);
const __dirname = __acmsDirname(__filename);
import { r as renderPreviewHtml, g as getActiveTheme, b as buildPostsJson } from "./media-CLjYCc_a.mjs";
import { buildMenuJson } from "./menuPublisher-DrGXU1DZ.mjs";
import { a as absoluteAssets, b as buildAuthorsJson } from "./authorsJsonPublisher-C54IzCxb.mjs";
import { a as applyFilters } from "./pluginRegistry-D4QLSYaL.mjs";
import "./runtimeConfig-2M2d2Pbu.mjs";
import "./firebaseClient-D3fvED27.mjs";
import "./index-B4MbpTF6.mjs";
import "./index.esm2017-C4mMOVmK.mjs";
import "util";
import "crypto";
import "process";
import "tls";
import "fs";
import "os";
import "net";
import "events";
import "stream";
import "./_commonjsHelpers-DtUDk_0l.mjs";
import "path";
import "http2";
import "http";
import "url";
import "dns";
import "zlib";
import "./index-BzGlTM6h.mjs";
import "./siteFiles-DJqhBc65.mjs";
import "./batch-686_kLtP.mjs";
import "./registry-CqDse1x2.mjs";
import "./index-DCzLoAau.mjs";
import "./toast-CYyyaSAW.mjs";
import "./gitStore-JGTWtX_B.mjs";
import "./index-BA9sR5p-.mjs";
import "./types-DAD44Ttj.mjs";
import "../agentcms.mjs";
import "node:util";
import "node:fs";
import "node:path";
import "node:url";
import "node:os";
import "node:child_process";
import "node:http";
import "./index-K8rfbNOg.mjs";
import "buffer";
import "./imageFormats-C1E7toWk.mjs";
import "./themeLogo-ASG0LCVF.mjs";
import "./slug-CZzRNKy4.mjs";
import "./media-K2GXb5Xy.mjs";
import "./blockRegistry-BotpJ4Ww.mjs";
import "./index--QpyX5Bx.mjs";
import "./dashboardCardRegistry-2rhwfBuU.mjs";
import "./externalRegistry-DuO0IV8e.mjs";
import "./markdown-74eSpmsS.mjs";
import "./posts-9fdjvKu4.mjs";
import "./taxonomies-BeUbd-6P.mjs";
import "./users-B96x6_1o.mjs";
import "./menuResolver-BEzafl_Y.mjs";
import "./settings-9I4hJAEM.mjs";
import "./settings-DlkdUVwn.mjs";
import "./regenerationTargetRegistry-3NmN64mg.mjs";
import "./generator-CZk03Fie.mjs";
import "./index-D5aHWd8R.mjs";
async function renderPostPreview(opts) {
  const ctx = buildPreviewContext(opts);
  const html = await renderPreviewHtml(opts.draft, ctx);
  return await postProcessForIframe(html, ctx, opts.settings);
}
function buildPreviewContext(opts) {
  const mediaMap = /* @__PURE__ */ new Map();
  for (const m of opts.media) mediaMap.set(m.id, m);
  const draftAsOnline = {
    ...opts.draft,
    status: "online"
  };
  const patchedPosts = opts.draft.type === "post" ? upsert(opts.posts, draftAsOnline) : opts.posts;
  const patchedPages = opts.draft.type === "page" ? upsert(opts.pages, draftAsOnline) : opts.pages;
  return {
    posts: patchedPosts,
    pages: patchedPages,
    terms: opts.terms,
    media: mediaMap,
    settings: opts.settings,
    users: opts.users,
    authorLookup: opts.authorLookup
  };
}
function upsert(list, item) {
  const idx = list.findIndex((p) => p.id === item.id);
  if (idx === -1) return [item, ...list];
  const next = list.slice();
  next[idx] = item;
  return next;
}
async function postProcessForIframe(html, ctx, settings) {
  const theme = getActiveTheme(settings.activeThemeId);
  let css = theme.cssText;
  if (theme.compileCss && theme.settings) {
    const stored = settings.themeConfigs?.[theme.id];
    const config = {
      ...theme.settings.defaultConfig,
      ...stored ?? {}
    };
    try {
      css = theme.compileCss(config);
    } catch {
    }
  }
  let out = absoluteAssets(html, settings.baseUrl);
  out = out.replace(
    /<link\s+rel="stylesheet"\s+href="[^"]*theme-assets\/[^"]*\.css[^"]*"[^>]*>/g,
    `<style data-cms-preview-css>${css}</style>`
  );
  const bootstrap = await buildPreviewBootstrap(ctx, settings);
  if (theme.jsText) {
    out = out.replace(
      /<script[^>]+src="[^"]*theme-assets\/[^"]+-menu\.js"[^>]*><\/script>/g,
      `<script>${theme.jsText}<\/script>`
    );
  }
  if (theme.jsTextPosts) {
    out = out.replace(
      /<script[^>]+src="[^"]*theme-assets\/[^"]+-posts\.js"[^>]*><\/script>/g,
      `<script>${theme.jsTextPosts}<\/script>`
    );
  }
  out = out.replace(
    /<script[^>]+src="[^"]*theme-assets\/[^"]+\.js"[^>]*><\/script>/g,
    ""
  );
  if (out.includes("<head>")) {
    out = out.replace("<head>", `<head>${bootstrap}`);
  } else {
    out = bootstrap + out;
  }
  return out;
}
async function buildPreviewBootstrap(ctx, settings) {
  const baseMenu = buildMenuJson(settings, ctx.posts, ctx.pages, ctx.terms);
  const filterCtx = {
    settings,
    posts: ctx.posts,
    pages: ctx.pages,
    terms: ctx.terms
  };
  const menuJson = await applyFilters("menu.json.resolved", baseMenu, filterCtx);
  const postsJson = buildPostsJson(
    { ...settings, baseUrl: "" },
    ctx.posts,
    ctx.pages,
    ctx.terms,
    ctx.media
  );
  const authorsJson = buildAuthorsJson(ctx.users, ctx.media, ctx.posts, ctx.pages);
  const payload = {
    menu: menuJson,
    posts: postsJson,
    authors: authorsJson
  };
  const json = JSON.stringify(payload).replace(/<\/script>/g, "<\\/script>");
  return `<script data-cms-preview-bootstrap>(function(){
var data=${json};
var origFetch=window.fetch;
window.fetch=function(input,init){
  var url=typeof input==='string'?input:(input&&input.url)||'';
  if(url.indexOf('/data/menu.json')!==-1){
    return Promise.resolve(new Response(JSON.stringify(data.menu),{headers:{'Content-Type':'application/json'}}));
  }
  if(url.indexOf('/data/posts.json')!==-1){
    return Promise.resolve(new Response(JSON.stringify(data.posts),{headers:{'Content-Type':'application/json'}}));
  }
  if(url.indexOf('/data/authors.json')!==-1){
    return Promise.resolve(new Response(JSON.stringify(data.authors),{headers:{'Content-Type':'application/json'}}));
  }
  return origFetch.apply(this,arguments);
};
})();<\/script>`;
}
export {
  renderPostPreview
};
