import { createRequire as __acmsRequire } from "node:module";
import { fileURLToPath as __acmsPath } from "node:url";
import { dirname as __acmsDirname } from "node:path";
const require2 = __acmsRequire(import.meta.url);
const __filename = __acmsPath(import.meta.url);
const __dirname = __acmsDirname(__filename);
import { getSettings, updateSettings } from "./settings-CEBDXaTg.mjs";
import { d as setStorageConfig, e as getStorageConfig, f as defaultConnectorId, i as invalidateActiveStorageConnector } from "./registry-Df5_x1nj.mjs";
import "./runtimeConfig-2M2d2Pbu.mjs";
import "./settings-DlkdUVwn.mjs";
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
async function readPublishTarget() {
  const stored = await getStorageConfig().catch(() => null);
  return { connectorId: stored?.connectorId ?? defaultConnectorId(), settings: stored?.settings ?? {} };
}
function targetSiteUrl(target) {
  const raw = typeof target.settings.siteUrl === "string" ? target.settings.siteUrl.trim().replace(/\/+$/, "") : "";
  return /^https?:\/\//.test(raw) ? raw : "";
}
async function savePublishTarget(target, opts = {}) {
  const clean = {};
  for (const [k, v] of Object.entries(target.settings)) {
    if (v === void 0) continue;
    clean[k] = typeof v === "string" ? v.trim() : v;
  }
  await setStorageConfig({ connectorId: target.connectorId, settings: clean });
  invalidateActiveStorageConnector();
  await adoptSiteUrl(target, opts.siteUrl ?? "ifEmpty");
}
async function adoptSiteUrl(target, mode) {
  const siteUrl = targetSiteUrl(target);
  if (!siteUrl) return;
  try {
    const settings = await getSettings();
    const current = (settings.baseUrl ?? "").replace(/\/+$/, "");
    if (current === siteUrl) return;
    if (!current || mode === "always") await updateSettings({ baseUrl: siteUrl });
  } catch (err) {
    console.warn("[storage] could not adopt the publish target URL as base URL:", err);
  }
}
export {
  readPublishTarget,
  savePublishTarget,
  targetSiteUrl
};
