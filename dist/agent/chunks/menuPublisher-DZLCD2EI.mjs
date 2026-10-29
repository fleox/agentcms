import { createRequire as __acmsRequire } from "node:module";
import { fileURLToPath as __acmsPath } from "node:url";
import { dirname as __acmsDirname } from "node:path";
const require2 = __acmsRequire(import.meta.url);
const __filename = __acmsPath(import.meta.url);
const __dirname = __acmsDirname(__filename);
import { a as applyFilters } from "./pluginRegistry-D4QLSYaL.mjs";
import { resolveMenuItems } from "./menuResolver-BEzafl_Y.mjs";
import { u as uploadFile } from "./siteFiles-DcXWyoy2.mjs";
import "./blockRegistry-BotpJ4Ww.mjs";
import "./index--QpyX5Bx.mjs";
import "./dashboardCardRegistry-2rhwfBuU.mjs";
import "./regenerationTargetRegistry-3NmN64mg.mjs";
import "./slug-CZzRNKy4.mjs";
import "./batch-C9qX5FMx.mjs";
import "./registry-Bhq3fghS.mjs";
import "./index-YdkzfKAt.mjs";
import "./toast-CYyyaSAW.mjs";
import "./runtimeConfig-BNLCrrQo.mjs";
import "./index.node-DYLwqGPq.mjs";
import "./index.esm2017-BUfxW6Jp.mjs";
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
import "./firebaseClient-BjUVAcKz.mjs";
import "./index-CuB-ym-g.mjs";
import "./index-CjBqWaZn.mjs";
import "./gitStore-BkclOUWu.mjs";
import "./index-B4uHS09W.mjs";
import "./types-DAD44Ttj.mjs";
import "../agentcms.mjs";
import "node:util";
import "node:fs";
import "node:path";
import "node:url";
import "node:os";
import "node:child_process";
import "node:crypto";
import "node:http";
import "./index-K8rfbNOg.mjs";
import "buffer";
const MENU_JSON_PATH = "data/menu.json";
function resolveBranding(settings) {
  const themeId = settings.activeThemeId;
  const raw = settings.themeConfigs?.[themeId];
  const config = raw?.logoEnabled !== void 0 ? raw : raw?.brand;
  if (!config?.logoEnabled) return void 0;
  const v = config.logoUpdatedAt ?? 0;
  return {
    logoUrl: `/theme-assets/${themeId}-logo.webp?v=${v}`
  };
}
function buildMenuJson(settings, posts, pages, terms) {
  const ctx = { posts, pages, terms, settings };
  return {
    header: resolveMenuItems(settings.menus.header ?? [], ctx),
    footer: resolveMenuItems(settings.menus.footer ?? [], ctx),
    branding: resolveBranding(settings)
  };
}
async function publishMenuJson(settings, posts, pages, terms) {
  const menu = buildMenuJson(settings, posts, pages, terms);
  const filterCtx = { settings, posts, pages, terms };
  const final = await applyFilters("menu.json.resolved", menu, filterCtx);
  await uploadFile({
    path: MENU_JSON_PATH,
    content: JSON.stringify(final),
    encoding: "utf-8"
  });
}
export {
  MENU_JSON_PATH,
  buildMenuJson,
  publishMenuJson
};
