import { createRequire as __acmsRequire } from "node:module";
import { fileURLToPath as __acmsPath } from "node:url";
import { dirname as __acmsDirname } from "node:path";
const require2 = __acmsRequire(import.meta.url);
const __filename = __acmsPath(import.meta.url);
const __dirname = __acmsDirname(__filename);
import { getBackendKind, isDocStoreBackend } from "./runtimeConfig-2M2d2Pbu.mjs";
import { D as DEFAULT_SITE_SETTINGS, f as firebase } from "./settings-DlkdUVwn.mjs";
import { g as getDocStore } from "./registry-QpZDUKmd.mjs";
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
import "./index-BrUfg5nb.mjs";
import "./toast-CYyyaSAW.mjs";
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
const SETTINGS_ID = "site";
function readDoc() {
  const doc = getDocStore().get("settings", SETTINGS_ID);
  if (!doc) return {};
  const { id: _id, ...data } = structuredClone(doc);
  return data;
}
async function writeDoc(data, message) {
  await getDocStore().write(
    [{ op: "set", collection: "settings", doc: { ...data, id: SETTINGS_ID } }],
    { message }
  );
}
function merged() {
  return { ...DEFAULT_SITE_SETTINGS, ...readDoc() };
}
function subscribeToSettings$1(onChange, onError) {
  const store = getDocStore();
  let active = true;
  let loaded = false;
  const emit = () => {
    if (!active || !loaded) return;
    try {
      onChange(merged());
    } catch (err) {
      onError?.(err);
    }
  };
  const unsub = store.subscribe((changed) => {
    if (changed.has("settings")) emit();
  });
  store.ready().then(
    () => {
      loaded = true;
      emit();
    },
    (err) => {
      if (active) onError?.(err);
    }
  );
  return () => {
    active = false;
    unsub();
  };
}
async function getSettings$1() {
  await getDocStore().ready();
  return merged();
}
async function updateSettings$1(patch) {
  await getDocStore().ready();
  const next = { ...readDoc() };
  for (const [key, value] of Object.entries(patch)) {
    if (value === void 0) delete next[key];
    else next[key] = value;
  }
  await writeDoc(next, "Update site settings");
}
async function updatePluginConfig$1(pluginId, config) {
  await getDocStore().ready();
  const current = readDoc();
  const pluginConfigs = { ...current.pluginConfigs ?? {} };
  pluginConfigs[pluginId] = config;
  await writeDoc({ ...current, pluginConfigs }, `Update ${pluginId} plugin settings`);
}
async function updateThemeConfig$1(themeId, config) {
  await getDocStore().ready();
  const current = readDoc();
  const themeConfigs = { ...current.themeConfigs ?? {} };
  themeConfigs[themeId] = config;
  await writeDoc({ ...current, themeConfigs }, `Update ${themeId} theme settings`);
}
const docstore = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  DEFAULT_SITE_SETTINGS,
  getSettings: getSettings$1,
  subscribeToSettings: subscribeToSettings$1,
  updatePluginConfig: updatePluginConfig$1,
  updateSettings: updateSettings$1,
  updateThemeConfig: updateThemeConfig$1
}, Symbol.toStringTag, { value: "Module" }));
let _impl = null;
let _implKind;
function impl() {
  const kind = getBackendKind();
  if (!_impl || kind !== _implKind) {
    _implKind = kind;
    _impl = isDocStoreBackend(kind) ? docstore : firebase;
  }
  return _impl;
}
function subscribeToSettings(...args) {
  return impl().subscribeToSettings(...args);
}
function getSettings(...args) {
  return impl().getSettings(...args);
}
function updateSettings(...args) {
  return impl().updateSettings(...args);
}
function updatePluginConfig(pluginId, config) {
  return impl().updatePluginConfig(pluginId, config);
}
function updateThemeConfig(themeId, config) {
  return impl().updateThemeConfig(themeId, config);
}
export {
  DEFAULT_SITE_SETTINGS,
  getSettings,
  subscribeToSettings,
  updatePluginConfig,
  updateSettings,
  updateThemeConfig
};
