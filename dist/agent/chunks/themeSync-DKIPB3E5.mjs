import { createRequire as __acmsRequire } from "node:module";
import { fileURLToPath as __acmsPath } from "node:url";
import { dirname as __acmsDirname } from "node:path";
const require2 = __acmsRequire(import.meta.url);
const __filename = __acmsPath(import.meta.url);
const __dirname = __acmsDirname(__filename);
import { u as uploadFile, l as listThemes } from "./cmsRuntime-BPl14cnG.mjs";
import "./_commonjsHelpers-DtUDk_0l.mjs";
import "./index-BVQJP7xk.mjs";
import "./toast-CYyyaSAW.mjs";
import "./types-DAD44Ttj.mjs";
import "./pluginRegistry-QJmy4wOS.mjs";
import "./blockRegistry-B2pxChw-.mjs";
import "./index-BxoBV_0U.mjs";
import "./dashboardCardRegistry-2rhwfBuU.mjs";
import "./regenerationTargetRegistry-3NmN64mg.mjs";
import "./externalRegistry-DuO0IV8e.mjs";
import "./users-Q0J4JiL0.mjs";
import "./runtimeConfig-DyVDQuHr.mjs";
import "./firebaseClient-BTpUMbPI.mjs";
import "util";
import "crypto";
import "process";
import "tls";
import "fs";
import "os";
import "net";
import "events";
import "stream";
import "path";
import "http2";
import "http";
import "url";
import "dns";
import "zlib";
import "./registry-DClFwwHa.mjs";
import "./gitStore-2dU0WJGr.mjs";
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
import "./markdown-74eSpmsS.mjs";
import "./batch-XEvRH-T7.mjs";
import "./posts-CGVGvxZH.mjs";
import "./settings-rfzR10i9.mjs";
import "./settings-DMAjCSQM.mjs";
import "./index-i8xnXeXY.mjs";
async function syncThemeAssets(themes = listThemes(), themeConfigs, log = () => {
}) {
  for (const theme of themes) {
    if (!theme.cssText) {
      log({
        level: "warn",
        message: `Theme "${theme.id}" has no embedded CSS, skipping.`
      });
    } else {
      const cssPath = `theme-assets/${theme.id}.css`;
      let cssContent = theme.cssText;
      if (theme.compileCss && theme.settings) {
        const stored = themeConfigs?.[theme.id];
        const resolvedConfig = {
          ...theme.settings.defaultConfig,
          ...stored ?? {}
        };
        try {
          cssContent = theme.compileCss(resolvedConfig);
        } catch (err) {
          console.error(`[themes] compileCss for "${theme.id}" failed:`, err);
        }
      }
      log({ level: "info", message: `Uploading ${cssPath}…` });
      await uploadFile({ path: cssPath, content: cssContent });
    }
    if (theme.jsText) {
      const jsPath = `theme-assets/${theme.id}-menu.js`;
      log({ level: "info", message: `Uploading ${jsPath}…` });
      await uploadFile({ path: jsPath, content: theme.jsText });
    }
    if (theme.jsTextPosts) {
      const jsPath = `theme-assets/${theme.id}-posts.js`;
      log({ level: "info", message: `Uploading ${jsPath}…` });
      await uploadFile({ path: jsPath, content: theme.jsTextPosts });
    }
    const jsTextCatalog = theme.jsTextCatalog;
    if (jsTextCatalog) {
      const jsPath = `theme-assets/${theme.id}-catalog.js`;
      log({ level: "info", message: `Uploading ${jsPath}…` });
      await uploadFile({ path: jsPath, content: jsTextCatalog });
    }
    const jsTextFilters = theme.jsTextFilters;
    if (jsTextFilters) {
      const jsPath = `theme-assets/${theme.id}-filters.js`;
      log({ level: "info", message: `Uploading ${jsPath}…` });
      await uploadFile({ path: jsPath, content: jsTextFilters });
    }
  }
  log({ level: "success", message: "Theme assets synced." });
}
export {
  syncThemeAssets
};
