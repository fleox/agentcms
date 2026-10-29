import { createRequire as __acmsRequire } from "node:module";
import { fileURLToPath as __acmsPath } from "node:url";
import { dirname as __acmsDirname } from "node:path";
const require2 = __acmsRequire(import.meta.url);
const __filename = __acmsPath(import.meta.url);
const __dirname = __acmsDirname(__filename);
import "./media-DBWNis_N.mjs";
import { d as deleteFile } from "./siteFiles-BUa7uiPX.mjs";
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
import "./imageFormats-C1E7toWk.mjs";
import "./themeLogo-DGirrYrc.mjs";
import "./index-nsargUYh.mjs";
import "./index-BrUfg5nb.mjs";
import "./toast-CYyyaSAW.mjs";
import "./types-DAD44Ttj.mjs";
import "./slug-CZzRNKy4.mjs";
import "./media-K2GXb5Xy.mjs";
import "../agentcms.mjs";
import "node:util";
import "node:fs";
import "node:path";
import "node:url";
import "node:os";
import "node:child_process";
import "node:http";
import "./registry-QpZDUKmd.mjs";
import "./gitStore-Bk2sNl6t.mjs";
import "./index-K8rfbNOg.mjs";
import "buffer";
import "./batch-CaQZLk71.mjs";
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
async function cleanupOldCatalogPath(oldPath, newPath) {
  if (!oldPath || oldPath === newPath) return;
  try {
    await deleteFile(oldPath);
  } catch {
  }
}
export {
  cleanupOldCatalogPath
};
