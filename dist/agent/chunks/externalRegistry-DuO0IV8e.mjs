import { createRequire as __acmsRequire } from "node:module";
import { fileURLToPath as __acmsPath } from "node:url";
import { dirname as __acmsDirname } from "node:path";
const require2 = __acmsRequire(import.meta.url);
const __filename = __acmsPath(import.meta.url);
const __dirname = __acmsDirname(__filename);
const externalPlugins = [];
const externalThemes = [];
const listeners = /* @__PURE__ */ new Set();
function notify() {
  for (const fn of listeners) fn();
}
function subscribeToExternalRegistry(fn) {
  listeners.add(fn);
  return () => {
    listeners.delete(fn);
  };
}
function registerExternalPlugin(manifest) {
  const idx = externalPlugins.findIndex((m) => m.id === manifest.id);
  if (idx >= 0) externalPlugins[idx] = manifest;
  else externalPlugins.push(manifest);
  notify();
}
function registerExternalTheme(manifest) {
  const idx = externalThemes.findIndex((m) => m.id === manifest.id);
  if (idx >= 0) externalThemes[idx] = manifest;
  else externalThemes.push(manifest);
  notify();
}
function unregisterExternalPlugin(id) {
  const idx = externalPlugins.findIndex((m) => m.id === id);
  if (idx >= 0) {
    externalPlugins.splice(idx, 1);
    notify();
  }
}
function unregisterExternalTheme(id) {
  const idx = externalThemes.findIndex((m) => m.id === id);
  if (idx >= 0) {
    externalThemes.splice(idx, 1);
    notify();
  }
}
function listExternalPlugins() {
  return externalPlugins;
}
function listExternalThemes() {
  return externalThemes;
}
function clearExternalPlugins() {
  if (externalPlugins.length === 0) return;
  externalPlugins.length = 0;
  notify();
}
function clearExternalThemes() {
  if (externalThemes.length === 0) return;
  externalThemes.length = 0;
  notify();
}
const EMPTY_EXTERNAL_MANIFEST = {
  plugins: [],
  themes: []
};
export {
  EMPTY_EXTERNAL_MANIFEST,
  clearExternalPlugins,
  clearExternalThemes,
  listExternalPlugins,
  listExternalThemes,
  registerExternalPlugin,
  registerExternalTheme,
  subscribeToExternalRegistry,
  unregisterExternalPlugin,
  unregisterExternalTheme
};
