import { createRequire as __acmsRequire } from "node:module";
import { fileURLToPath as __acmsPath } from "node:url";
import { dirname as __acmsDirname } from "node:path";
const require2 = __acmsRequire(import.meta.url);
const __filename = __acmsPath(import.meta.url);
const __dirname = __acmsDirname(__filename);
import "./media-x49mFUWY.mjs";
import { d as deleteFile } from "./siteFiles-D207OaeL.mjs";
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
import "./themeLogo-DZLpUhvn.mjs";
import "./index-BA9sR5p-.mjs";
import "./index-DCzLoAau.mjs";
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
import "./registry-B41SEnnT.mjs";
import "./gitStore-ueM10Bby.mjs";
import "./index-K8rfbNOg.mjs";
import "buffer";
import "./batch-BGzHdUjc.mjs";
import "./pluginRegistry-D4QLSYaL.mjs";
import "./blockRegistry-BotpJ4Ww.mjs";
import "./index--QpyX5Bx.mjs";
import "./dashboardCardRegistry-2rhwfBuU.mjs";
import "./regenerationTargetRegistry-3NmN64mg.mjs";
import "./externalRegistry-DuO0IV8e.mjs";
import "./authorsJsonPublisher-OsQuYFnl.mjs";
import "./users-D6P4Wv2E.mjs";
import "./markdown-74eSpmsS.mjs";
import "./posts-BwMIoSkg.mjs";
import "./taxonomies-CjlJL2MS.mjs";
import "./menuResolver-BEzafl_Y.mjs";
import "./menuPublisher-Bi2lvz6b.mjs";
import "./settings-DZuDcOE5.mjs";
import "./settings-DlkdUVwn.mjs";
import "./generator-DePwKO9n.mjs";
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
