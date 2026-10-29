import { createRequire as __acmsRequire } from "node:module";
import { fileURLToPath as __acmsPath } from "node:url";
import { dirname as __acmsDirname } from "node:path";
const require2 = __acmsRequire(import.meta.url);
const __filename = __acmsPath(import.meta.url);
const __dirname = __acmsDirname(__filename);
import { u as uploadFile } from "./siteFiles-BUa7uiPX.mjs";
import { l as listThemes } from "./media-DBWNis_N.mjs";
import "./batch-CaQZLk71.mjs";
import "./registry-QpZDUKmd.mjs";
import "./index-BrUfg5nb.mjs";
import "./toast-CYyyaSAW.mjs";
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
import "./gitStore-Bk2sNl6t.mjs";
import "./index-nsargUYh.mjs";
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
import "./themeLogo-DGirrYrc.mjs";
import "./slug-CZzRNKy4.mjs";
import "./media-K2GXb5Xy.mjs";
import "./pluginRegistry-D4QLSYaL.mjs";
import "./blockRegistry-BotpJ4Ww.mjs";
import "./index--QpyX5Bx.mjs";
import "./dashboardCardRegistry-2rhwfBuU.mjs";
import "./regenerationTargetRegistry-3NmN64mg.mjs";
import "./externalRegistry-DuO0IV8e.mjs";
import "./authorsJsonPublisher-zUCxnyk7.mjs";
import "./users-DgyPyBti.mjs";
import "./markdown-74eSpmsS.mjs";
import "./posts-C__YnFuY.mjs";
import "./taxonomies-C8jbkjmm.mjs";
import "./menuResolver-BEzafl_Y.mjs";
import "./menuPublisher-OnJPVcP-.mjs";
import "./settings-DM9UACGC.mjs";
import "./settings-DlkdUVwn.mjs";
import "./generator-CKfdj3mW.mjs";
import "./index-D5aHWd8R.mjs";
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
