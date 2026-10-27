import { createRequire as __acmsRequire } from "node:module";
import { fileURLToPath as __acmsPath } from "node:url";
import { dirname as __acmsDirname } from "node:path";
const require2 = __acmsRequire(import.meta.url);
const __filename = __acmsPath(import.meta.url);
const __dirname = __acmsDirname(__filename);
import { j as getDoc, a as onSnapshot, s as setDoc, c as doc, m as settingsDocs, e as collections, f as getDb, k as deleteField } from "./firebaseClient-BTpUMbPI.mjs";
const siteSettingsRef = () => doc(getDb(), collections.settings, settingsDocs.site);
const DEFAULT_SITE_SETTINGS = {
  title: "My site",
  description: "",
  language: "en",
  baseUrl: "",
  activeThemeId: "default",
  enabledPlugins: {
    "core-seo": true,
    "agentcms-sitemaps": true,
    "agentcms-rss": true,
    "agentcms-archives": true,
    // Off by default — a one-shot migration tool. Users enable it
    // when they need to import a batch and disable it afterward.
    "agentcms-import": false
  },
  homeMode: "latest-posts",
  postsPerPage: 10,
  menus: { header: [], footer: [] },
  pluginConfigs: {},
  themeConfigs: {},
  paginationMode: "global"
};
function subscribeToSettings(onChange, onError) {
  return onSnapshot(
    siteSettingsRef(),
    (snap) => {
      const data = snap.data();
      onChange({ ...DEFAULT_SITE_SETTINGS, ...data ?? {} });
    },
    onError
  );
}
async function getSettings() {
  const snap = await getDoc(siteSettingsRef());
  const data = snap.exists() ? snap.data() : {};
  return { ...DEFAULT_SITE_SETTINGS, ...data };
}
async function updateSettings(patch) {
  const sanitized = {};
  for (const [key, value] of Object.entries(patch)) {
    sanitized[key] = value === void 0 ? deleteField() : value;
  }
  await setDoc(siteSettingsRef(), sanitized, { merge: true });
}
async function updatePluginConfig(pluginId, config) {
  await setDoc(
    siteSettingsRef(),
    { pluginConfigs: { [pluginId]: config } },
    { merge: true }
  );
}
async function updateThemeConfig(themeId, config) {
  await setDoc(
    siteSettingsRef(),
    { themeConfigs: { [themeId]: config } },
    { merge: true }
  );
}
const firebase = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  DEFAULT_SITE_SETTINGS,
  getSettings,
  subscribeToSettings,
  updatePluginConfig,
  updateSettings,
  updateThemeConfig
}, Symbol.toStringTag, { value: "Module" }));
export {
  DEFAULT_SITE_SETTINGS as D,
  firebase as f
};
