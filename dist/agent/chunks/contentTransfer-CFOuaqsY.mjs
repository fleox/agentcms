import { createRequire as __acmsRequire } from "node:module";
import { fileURLToPath as __acmsPath } from "node:url";
import { dirname as __acmsDirname } from "node:path";
const require2 = __acmsRequire(import.meta.url);
const __filename = __acmsPath(import.meta.url);
const __dirname = __acmsDirname(__filename);
import { T as Timestamp } from "./index.node-DYLwqGPq.mjs";
import { getBackendKind, isDocStoreBackend } from "./runtimeConfig-BNLCrrQo.mjs";
import { b as getDocStore, f as getStorageConfig } from "./registry-4kb4tftS.mjs";
import { a as splitSecrets } from "./gitStore-BkclOUWu.mjs";
import { f as firebaseStore } from "./externalRegistryStore-CunquHCC.mjs";
import { d as docstoreStore } from "./externalRegistryStore-DQEFD28V.mjs";
import { EMPTY_EXTERNAL_MANIFEST } from "./externalRegistry-DuO0IV8e.mjs";
import { c as listAllMedia } from "./media-GYEEBV_v.mjs";
import { invalidateAllPostsCache, fetchAllPosts } from "./posts-BbdeaoFJ.mjs";
import { getSettings } from "./settings-Dp0KgkFG.mjs";
import { fetchAllTerms } from "./taxonomies-Ba1K2S4M.mjs";
import { s as subscribeToUsers } from "./users-CRpBJpeM.mjs";
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
import "./index-YdkzfKAt.mjs";
import "./toast-CYyyaSAW.mjs";
import "./firebaseClient-BjUVAcKz.mjs";
import "./index-CuB-ym-g.mjs";
import "./index-CjBqWaZn.mjs";
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
import "./index-B4uHS09W.mjs";
import "./types-DAD44Ttj.mjs";
import "./siteFiles-BiyhNAJI.mjs";
import "./batch-ByMaB1s-.mjs";
import "./imageFormats-C1E7toWk.mjs";
import "./themeLogo-D6dzLjqm.mjs";
import "./slug-CZzRNKy4.mjs";
import "./media-K2GXb5Xy.mjs";
import "./pluginRegistry-D4QLSYaL.mjs";
import "./blockRegistry-BotpJ4Ww.mjs";
import "./index--QpyX5Bx.mjs";
import "./dashboardCardRegistry-2rhwfBuU.mjs";
import "./regenerationTargetRegistry-3NmN64mg.mjs";
import "./authorsJsonPublisher-CGxVfkcC.mjs";
import "./markdown-74eSpmsS.mjs";
import "./menuResolver-BEzafl_Y.mjs";
import "./menuPublisher-DdD9o-yi.mjs";
import "./generator-0D1yUMIc.mjs";
import "./index-D5aHWd8R.mjs";
import "./settings-VHERPR8x.mjs";
import "./invites-B26zWfc6.mjs";
const DEFAULT_MANIFEST_BROWSER_PATH = "external.default.json";
const LEGACY_MANIFEST_BROWSER_PATH = "external.json";
let _impl = null;
let _implKind;
function impl() {
  const kind = getBackendKind();
  if (!_impl || kind !== _implKind) {
    _implKind = kind;
    _impl = isDocStoreBackend(kind) ? docstoreStore : firebaseStore;
  }
  return _impl;
}
function readBackendRegistry() {
  return impl().readBackendRegistry();
}
function writeBackendRegistry(manifest) {
  return impl().writeBackendRegistry(manifest);
}
function normaliseManifest(value) {
  if (!value || typeof value !== "object") return null;
  const v = value;
  if (!Array.isArray(v.plugins) && !Array.isArray(v.themes)) return null;
  return {
    plugins: Array.isArray(v.plugins) ? v.plugins : [],
    themes: Array.isArray(v.themes) ? v.themes : []
  };
}
async function fetchManifestFile(relativePath) {
  try {
    const res = await fetch(`./${relativePath}?_t=${Date.now()}`, {
      cache: "no-store"
    });
    if (res.status === 404) return null;
    if (!res.ok) return null;
    const data = await res.json();
    return normaliseManifest(data);
  } catch {
    return null;
  }
}
async function readRegistry() {
  let backend = null;
  try {
    backend = await readBackendRegistry();
  } catch (err) {
    console.warn("[external-registry] backend read failed:", err);
  }
  if (backend) return backend;
  const legacy = await fetchManifestFile(LEGACY_MANIFEST_BROWSER_PATH);
  if (legacy) {
    await writeBackendRegistry(legacy).catch((err) => {
      console.warn(
        "[external-registry] could not migrate legacy file to backend:",
        err
      );
    });
    return legacy;
  }
  const defaults = await fetchManifestFile(DEFAULT_MANIFEST_BROWSER_PATH);
  if (defaults) {
    await writeBackendRegistry(defaults).catch((err) => {
      console.warn(
        "[external-registry] could not seed backend from defaults:",
        err
      );
    });
    return defaults;
  }
  return { ...EMPTY_EXTERNAL_MANIFEST };
}
const EXPORT_FORMAT = "agentcms-export";
function toPlain(value) {
  if (value instanceof Timestamp) return value.toMillis();
  if (value instanceof Date) return value.getTime();
  if (Array.isArray(value)) return value.map(toPlain);
  if (value && typeof value === "object") {
    const out = {};
    for (const [k, v] of Object.entries(value)) if (v !== void 0) out[k] = toPlain(v);
    return out;
  }
  return value;
}
function docs(list) {
  return list.map((d) => toPlain(d));
}
function readUsersOnce() {
  return new Promise((resolve, reject) => {
    let unsubscribe = null;
    let settled = false;
    unsubscribe = subscribeToUsers(
      (users) => {
        if (settled) return;
        settled = true;
        resolve(users);
        queueMicrotask(() => unsubscribe?.());
      },
      reject
    );
  });
}
function isEmptyRegistry(value) {
  const r = value;
  return !r || (r.plugins?.length ?? 0) === 0 && (r.themes?.length ?? 0) === 0;
}
async function exportContent() {
  const [posts, pages, terms, media, users, settings, registry, storage] = await Promise.all([
    fetchAllPosts({ type: "post" }),
    fetchAllPosts({ type: "page" }),
    fetchAllTerms(),
    listAllMedia(),
    readUsersOnce(),
    getSettings(),
    readRegistry().catch(() => null),
    getStorageConfig().catch(() => null)
  ]);
  const config = [];
  if (registry && !isEmptyRegistry(registry)) config.push({ ...toPlain(registry), id: "externalRegistry" });
  if (storage) config.push({ ...splitSecrets(toPlain(storage)).clean, id: "storage" });
  return {
    format: EXPORT_FORMAT,
    version: 1,
    exportedAt: (/* @__PURE__ */ new Date()).toISOString(),
    backend: getBackendKind() ?? "unknown",
    collections: {
      posts: docs([...posts, ...pages]),
      terms: docs(terms),
      media: docs(media),
      users: docs(users),
      settings: [{ ...toPlain(settings), id: "site" }],
      config
    }
  };
}
function canImportContent() {
  return isDocStoreBackend(getBackendKind());
}
async function importContent(data, mode = "merge") {
  if (!canImportContent()) throw new Error("Import is only available on document-store backends.");
  const store = getDocStore();
  await store.ready();
  const mutations = [];
  const counts = {};
  for (const [collection, list] of Object.entries(data.collections)) {
    if (!Array.isArray(list)) continue;
    if (mode === "replace") {
      for (const existing of store.list(collection)) mutations.push({ op: "delete", collection, id: existing.id });
    }
    for (const doc of list) {
      if (!doc || typeof doc.id !== "string") continue;
      if (collection === "config" && doc.id === "externalRegistry" && isEmptyRegistry(doc)) continue;
      mutations.push({ op: "set", collection, doc });
    }
    counts[collection] = list.length;
  }
  await store.write(mutations, { message: `Import content (${data.backend} export of ${data.exportedAt})` });
  invalidateAllPostsCache();
  return counts;
}
export {
  EXPORT_FORMAT,
  canImportContent,
  exportContent,
  importContent
};
