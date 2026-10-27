import { createRequire as __acmsRequire } from "node:module";
import { fileURLToPath as __acmsPath } from "node:url";
import { dirname as __acmsDirname } from "node:path";
const require2 = __acmsRequire(import.meta.url);
const __filename = __acmsPath(import.meta.url);
const __dirname = __acmsDirname(__filename);
import { registerBlock } from "./blockRegistry-BotpJ4Ww.mjs";
import { registerDashboardCard } from "./dashboardCardRegistry-2rhwfBuU.mjs";
import { registerRegenerationTarget } from "./regenerationTargetRegistry-3NmN64mg.mjs";
const tabs = /* @__PURE__ */ new Map();
const subscribers$2 = /* @__PURE__ */ new Set();
const snapshotCache$1 = /* @__PURE__ */ new Map();
function notify$2() {
  snapshotCache$1.clear();
  for (const cb of subscribers$2) cb();
}
function registerInspectorTab(manifest) {
  if (tabs.has(manifest.id)) {
    console.warn(`Inspector tab "${manifest.id}" already registered. Overwriting.`);
  }
  tabs.set(manifest.id, manifest);
  notify$2();
}
function resetInspectorTabs() {
  tabs.clear();
  notify$2();
}
const sections = /* @__PURE__ */ new Map();
const subscribers$1 = /* @__PURE__ */ new Set();
const snapshotCache = /* @__PURE__ */ new Map();
function notify$1() {
  snapshotCache.clear();
  for (const cb of subscribers$1) cb();
}
function registerTermEditorSection(manifest) {
  if (sections.has(manifest.id)) {
    console.warn(`Term editor section "${manifest.id}" already registered. Overwriting.`);
  }
  sections.set(manifest.id, manifest);
  notify$1();
}
function resetTermEditorSections() {
  sections.clear();
  notify$1();
}
const providers = /* @__PURE__ */ new Map();
const subscribers = /* @__PURE__ */ new Set();
function notify() {
  for (const cb of subscribers) cb();
}
function registerEditorVariantProvider(manifest) {
  if (providers.has(manifest.id)) {
    console.warn(`Editor variant provider "${manifest.id}" already registered. Overwriting.`);
  }
  providers.set(manifest.id, manifest);
  notify();
}
function resetEditorVariantProviders() {
  providers.clear();
  notify();
}
const filters = /* @__PURE__ */ new Map();
const actions = /* @__PURE__ */ new Map();
let registrationCounter = 0;
function sortByPriority(entries) {
  return [...entries].sort((a, b) => a.priority - b.priority || a.order - b.order);
}
function addFilter(hook, fn, priority = 10) {
  const list = filters.get(hook) ?? [];
  list.push({ fn, priority, order: registrationCounter++ });
  filters.set(hook, list);
}
function removeFilter(hook, fn) {
  const list = filters.get(hook);
  if (!list) return;
  filters.set(
    hook,
    list.filter((entry) => entry.fn !== fn)
  );
}
async function applyFilters(hook, value, ...args) {
  const list = filters.get(hook);
  if (!list || list.length === 0) return value;
  let current = value;
  for (const entry of sortByPriority(list)) {
    current = await entry.fn(current, ...args);
  }
  return current;
}
function applyFiltersSync(hook, value, ...args) {
  const list = filters.get(hook);
  if (!list || list.length === 0) return value;
  let current = value;
  for (const entry of sortByPriority(list)) {
    const next = entry.fn(current, ...args);
    if (next instanceof Promise) {
      throw new Error(`Filter "${hook}" must be synchronous; got a Promise.`);
    }
    current = next;
  }
  return current;
}
function addAction(hook, fn, priority = 10) {
  const list = actions.get(hook) ?? [];
  list.push({ fn, priority, order: registrationCounter++ });
  actions.set(hook, list);
}
function removeAction(hook, fn) {
  const list = actions.get(hook);
  if (!list) return;
  actions.set(
    hook,
    list.filter((entry) => entry.fn !== fn)
  );
}
async function doAction(hook, ...args) {
  const list = actions.get(hook);
  if (!list || list.length === 0) return;
  for (const entry of sortByPriority(list)) {
    await entry.fn(...args);
  }
}
function resetRegistry() {
  filters.clear();
  actions.clear();
  registrationCounter = 0;
}
function listHooks() {
  return {
    filters: [...filters.keys()],
    actions: [...actions.keys()]
  };
}
const pluginApi = {
  addFilter,
  addAction,
  registerBlock,
  registerDashboardCard,
  registerRegenerationTarget,
  registerInspectorTab,
  registerTermEditorSection,
  registerEditorVariantProvider
};
const pluginRegistry = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  addAction,
  addFilter,
  applyFilters,
  applyFiltersSync,
  doAction,
  listHooks,
  pluginApi,
  removeAction,
  removeFilter,
  resetRegistry
}, Symbol.toStringTag, { value: "Module" }));
export {
  applyFilters as a,
  applyFiltersSync as b,
  registerTermEditorSection as c,
  doAction as d,
  registerInspectorTab as e,
  resetRegistry as f,
  resetInspectorTabs as g,
  resetTermEditorSections as h,
  resetEditorVariantProviders as i,
  pluginRegistry as j,
  pluginApi as p,
  registerEditorVariantProvider as r
};
