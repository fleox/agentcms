import { createRequire as __acmsRequire } from "node:module";
import { fileURLToPath as __acmsPath } from "node:url";
import { dirname as __acmsDirname } from "node:path";
const require2 = __acmsRequire(import.meta.url);
const __filename = __acmsPath(import.meta.url);
const __dirname = __acmsDirname(__filename);
import { g as getDoc, s as setDoc, d as doc, a as getDb, c as configDocs, b as collections, e as sqlQuery, f as sqlExec, h as getDocStore, i as getBackendKind, j as isDocStoreBackend, o as onSnapshot, k as settingsDocs, l as deleteField, m as sqlVersion, S as SqliteApiError, n as setFlexwegConfig, D as DEFAULT_FLEXWEG_API_BASE_URL, p as setGitToken, q as saveSqliteConnectorSecrets, r as saveSqlitePassphrase, t as testStorageConnection, u as openDatabaseBytes, v as githubPagesCheck, w as resetRuntimeConfigCache, x as resetDocStore } from "./registry-C9TSnZ77.mjs";
import { g as generatePassphrase, s as setCredential, i as isEncryptedDatabase, S as SqlitePassphraseError } from "../agentcms.mjs";
import { e as ensurePublishBranch } from "./plan-BrM8ztEp.mjs";
import { j as joinRepoPath, s as subscribeToToasts, c as createRemoteGitTransport } from "./index-BG05qslv.mjs";
import { loadSqlWasm, themeAssetOps, adminOps, applyOps, hostingConnector } from "./hosting-BftlDdsL.mjs";
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
import "buffer";
import "node:util";
import "node:fs";
import "node:path";
import "node:url";
import "node:os";
import "node:child_process";
import "node:http";
const storageDocRef = () => doc(getDb(), collections.config, configDocs.storage);
async function getStorageConfig$2() {
  const snap = await getDoc(storageDocRef());
  if (!snap.exists()) return null;
  const data = snap.data();
  if (!data?.connectorId) return null;
  return { connectorId: data.connectorId, settings: data.settings ?? {} };
}
async function setStorageConfig$3(next) {
  await setDoc(storageDocRef(), { connectorId: next.connectorId, settings: next.settings ?? {} });
}
const firebase$1 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  getStorageConfig: getStorageConfig$2,
  setStorageConfig: setStorageConfig$3
}, Symbol.toStringTag, { value: "Module" }));
const CONFIG_KEY = "storage";
async function getStorageConfig$1() {
  const { rows } = await sqlQuery(
    "SELECT value FROM config WHERE key = ?",
    [CONFIG_KEY]
  );
  if (rows.length === 0) return null;
  let data;
  try {
    data = JSON.parse(rows[0].value);
  } catch {
    return null;
  }
  if (!data.connectorId) return null;
  return { connectorId: data.connectorId, settings: data.settings ?? {} };
}
async function setStorageConfig$2(next) {
  const payload = JSON.stringify({ connectorId: next.connectorId, settings: next.settings ?? {} });
  await sqlExec(
    `INSERT INTO config (key, value) VALUES (?, ?)
     ON CONFLICT(key) DO UPDATE SET value = excluded.value`,
    [CONFIG_KEY, payload]
  );
}
const sqlite$1 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  getStorageConfig: getStorageConfig$1,
  setStorageConfig: setStorageConfig$2
}, Symbol.toStringTag, { value: "Module" }));
const CONFIG_ID = "storage";
async function getStorageConfig() {
  const store = getDocStore();
  await store.ready();
  const data = store.get("config", CONFIG_ID);
  if (!data?.connectorId) return null;
  return { connectorId: data.connectorId, settings: { ...data.settings ?? {} } };
}
async function setStorageConfig$1(next) {
  await getDocStore().write(
    [
      {
        op: "set",
        collection: "config",
        doc: { id: CONFIG_ID, connectorId: next.connectorId, settings: next.settings ?? {} }
      }
    ],
    { message: "Update publish storage settings" }
  );
}
const docstore$1 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  getStorageConfig,
  setStorageConfig: setStorageConfig$1
}, Symbol.toStringTag, { value: "Module" }));
let _impl$1 = null;
function impl$1() {
  if (!_impl$1) {
    const kind = getBackendKind();
    _impl$1 = kind === "flexweg-sqlite" ? sqlite$1 : isDocStoreBackend(kind) ? docstore$1 : firebase$1;
  }
  return _impl$1;
}
function setStorageConfig(...args) {
  return impl$1().setStorageConfig(...args);
}
const siteSettingsRef = () => doc(getDb(), collections.settings, settingsDocs.site);
const DEFAULT_SITE_SETTINGS = {
  title: "My site",
  description: "",
  language: "en",
  baseUrl: "",
  activeThemeId: "default",
  enabledPlugins: {
    "core-seo": true,
    "flexweg-sitemaps": true,
    "flexweg-rss": true,
    "flexweg-archives": true,
    // Off by default — a one-shot migration tool. Users enable it
    // when they need to import a batch and disable it afterward.
    "flexweg-import": false
  },
  homeMode: "latest-posts",
  postsPerPage: 10,
  menus: { header: [], footer: [] },
  pluginConfigs: {},
  themeConfigs: {},
  paginationMode: "global"
};
function subscribeToSettings$2(onChange, onError) {
  return onSnapshot(
    siteSettingsRef(),
    (snap) => {
      const data = snap.data();
      onChange({ ...DEFAULT_SITE_SETTINGS, ...data ?? {} });
    },
    onError
  );
}
async function getSettings$3() {
  const snap = await getDoc(siteSettingsRef());
  const data = snap.exists() ? snap.data() : {};
  return { ...DEFAULT_SITE_SETTINGS, ...data };
}
async function updateSettings$3(patch) {
  const sanitized = {};
  for (const [key, value] of Object.entries(patch)) {
    sanitized[key] = value === void 0 ? deleteField() : value;
  }
  await setDoc(siteSettingsRef(), sanitized, { merge: true });
}
async function updatePluginConfig$2(pluginId, config) {
  await setDoc(
    siteSettingsRef(),
    { pluginConfigs: { [pluginId]: config } },
    { merge: true }
  );
}
async function updateThemeConfig$2(themeId, config) {
  await setDoc(
    siteSettingsRef(),
    { themeConfigs: { [themeId]: config } },
    { merge: true }
  );
}
const firebase = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  DEFAULT_SITE_SETTINGS,
  getSettings: getSettings$3,
  subscribeToSettings: subscribeToSettings$2,
  updatePluginConfig: updatePluginConfig$2,
  updateSettings: updateSettings$3,
  updateThemeConfig: updateThemeConfig$2
}, Symbol.toStringTag, { value: "Module" }));
const POLL_INTERVAL_MS = 4e3;
const subscribers = /* @__PURE__ */ new Set();
let currentVersion = null;
let pollerTimer = null;
let pollerInflight = false;
async function poll() {
  if (pollerInflight) return;
  pollerInflight = true;
  try {
    const info = await sqlVersion();
    if (currentVersion === null) {
      currentVersion = info.version;
      return;
    }
    if (info.version !== currentVersion) {
      currentVersion = info.version;
      const snapshot = Array.from(subscribers);
      for (const sub of snapshot) {
        try {
          const data = await sub.fetch();
          sub.onChange(data);
        } catch (err) {
          if (sub.onError) sub.onError(err);
        }
      }
    }
  } catch (err) {
    if (err instanceof SqliteApiError && (err.status === 401 || err.status === 403)) {
      const snapshot = Array.from(subscribers);
      for (const sub of snapshot) {
        if (sub.onError) sub.onError(err);
      }
    }
  } finally {
    pollerInflight = false;
  }
}
function startPoller() {
  if (pollerTimer !== null) return;
  poll();
  pollerTimer = setInterval(poll, POLL_INTERVAL_MS);
}
function stopPoller() {
  if (pollerTimer === null) return;
  clearInterval(pollerTimer);
  pollerTimer = null;
  currentVersion = null;
}
function subscribeWithPolling(fetch, onChange, onError) {
  const sub = { fetch, onChange, onError };
  subscribers.add(sub);
  startPoller();
  fetch().then(onChange).catch((err) => {
    if (onError) onError(err);
    else console.error("subscribeWithPolling initial fetch failed", err);
  });
  return () => {
    subscribers.delete(sub);
    if (subscribers.size === 0) stopPoller();
  };
}
function notifyPotentialChange() {
  setTimeout(() => {
    poll();
  }, 50);
}
const SETTINGS_KEY = "site";
function readBlob(value) {
  if (!value) return {};
  try {
    const v = JSON.parse(value);
    return v && typeof v === "object" ? v : {};
  } catch {
    return {};
  }
}
async function readRow() {
  const { rows } = await sqlQuery(
    "SELECT value FROM settings WHERE key = ?",
    [SETTINGS_KEY]
  );
  if (rows.length === 0) return {};
  return readBlob(rows[0].value);
}
async function writeRow(data) {
  await sqlExec(
    `INSERT INTO settings (key, value) VALUES (?, ?)
     ON CONFLICT(key) DO UPDATE SET value = excluded.value`,
    [SETTINGS_KEY, JSON.stringify(data)]
  );
}
function subscribeToSettings$1(onChange, onError) {
  return subscribeWithPolling(
    async () => {
      const data = await readRow();
      return { ...DEFAULT_SITE_SETTINGS, ...data };
    },
    onChange,
    onError
  );
}
async function getSettings$2() {
  const data = await readRow();
  return { ...DEFAULT_SITE_SETTINGS, ...data };
}
async function updateSettings$2(patch) {
  const current = await readRow();
  const next = { ...current };
  for (const [key, value] of Object.entries(patch)) {
    if (value === void 0) {
      delete next[key];
    } else {
      next[key] = value;
    }
  }
  await writeRow(next);
  notifyPotentialChange();
}
async function updatePluginConfig$1(pluginId, config) {
  const current = await readRow();
  const pluginConfigs = { ...current.pluginConfigs ?? {} };
  pluginConfigs[pluginId] = config;
  await writeRow({ ...current, pluginConfigs });
  notifyPotentialChange();
}
async function updateThemeConfig$1(themeId, config) {
  const current = await readRow();
  const themeConfigs = { ...current.themeConfigs ?? {} };
  themeConfigs[themeId] = config;
  await writeRow({ ...current, themeConfigs });
  notifyPotentialChange();
}
const sqlite = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  DEFAULT_SITE_SETTINGS,
  getSettings: getSettings$2,
  subscribeToSettings: subscribeToSettings$1,
  updatePluginConfig: updatePluginConfig$1,
  updateSettings: updateSettings$2,
  updateThemeConfig: updateThemeConfig$1
}, Symbol.toStringTag, { value: "Module" }));
const SETTINGS_ID = "site";
function readDoc() {
  const doc2 = getDocStore().get("settings", SETTINGS_ID);
  if (!doc2) return {};
  const { id: _id, ...data } = structuredClone(doc2);
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
function subscribeToSettings(onChange, onError) {
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
async function updatePluginConfig(pluginId, config) {
  await getDocStore().ready();
  const current = readDoc();
  const pluginConfigs = { ...current.pluginConfigs ?? {} };
  pluginConfigs[pluginId] = config;
  await writeDoc({ ...current, pluginConfigs }, `Update ${pluginId} plugin settings`);
}
async function updateThemeConfig(themeId, config) {
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
  subscribeToSettings,
  updatePluginConfig,
  updateSettings: updateSettings$1,
  updateThemeConfig
}, Symbol.toStringTag, { value: "Module" }));
let _impl = null;
function impl() {
  if (!_impl) {
    const kind = getBackendKind();
    _impl = kind === "flexweg-sqlite" ? sqlite : isDocStoreBackend(kind) ? docstore : firebase;
  }
  return _impl;
}
function getSettings(...args) {
  return impl().getSettings(...args);
}
function updateSettings(...args) {
  return impl().updateSettings(...args);
}
function targetSiteUrl(target) {
  const raw = typeof target.settings.siteUrl === "string" ? target.settings.siteUrl.trim().replace(/\/+$/, "") : "";
  return /^https?:\/\//.test(raw) ? raw : "";
}
async function savePublishTarget(target, opts = {}) {
  if (target.connectorId === "flexweg") {
    const s = target.settings;
    await setFlexwegConfig({
      apiKey: (s.apiKey ?? "").trim(),
      siteUrl: (s.siteUrl ?? "").trim(),
      apiBaseUrl: (s.apiBaseUrl ?? "").trim() || DEFAULT_FLEXWEG_API_BASE_URL
    });
    await setStorageConfig({ connectorId: "flexweg", settings: {} });
  } else {
    const clean = {};
    for (const [k, v] of Object.entries(target.settings)) {
      if (v === void 0) continue;
      clean[k] = typeof v === "string" ? v.trim() : v;
    }
    await setStorageConfig({ connectorId: target.connectorId, settings: clean });
  }
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
function collectToasts() {
  const notices = [];
  const stop = subscribeToToasts((t) => notices.push({ level: t.level, message: t.message }));
  return { notices, stop };
}
async function settleHosting(target) {
  const s = target.settings;
  if (target.connectorId === "git-pages" && s.provider === "github") {
    await githubPagesCheck(String(s.owner ?? ""), String(s.repo ?? ""))?.catch(() => {
    });
  }
}
function gitTransport(git, token) {
  return createRemoteGitTransport(
    git.provider === "github" ? { provider: "github", owner: git.owner ?? "", repo: git.repo ?? "", branch: git.branch, token, apiBaseUrl: git.apiBaseUrl } : { provider: "gitlab", project: git.project ?? "", branch: git.branch, token, apiBaseUrl: git.apiBaseUrl }
  );
}
async function checkPlan(plan) {
  const hosting = await testStorageConnection(plan.target.connectorId, plan.target.settings);
  let data;
  if (plan.runtime.backend === "markdown-git") {
    const git = plan.runtime.git;
    try {
      const transport = gitTransport(git, plan.gitToken ?? "");
      const perms = await transport.permissions();
      if (!perms.canWrite) {
        data = { ok: false, detail: `${perms.login}: read-only access to ${transport.label}`, existing: false };
      } else {
        const tree = await transport.listTree();
        const storagePath = joinRepoPath(git.contentDir, ".cms/config/storage.json");
        const entry = tree.entries.find((e) => e.path === storagePath);
        let storedTarget = null;
        if (entry) {
          const raw = (await transport.readTexts([entry])).get(entry.path);
          const stored = raw ? JSON.parse(raw) : null;
          storedTarget = stored?.connectorId ? { connectorId: stored.connectorId, settings: stored.settings ?? {} } : null;
        }
        data = {
          ok: true,
          detail: `${perms.login} → ${transport.label}`,
          existing: tree.entries.some((e) => e.path.startsWith(joinRepoPath(git.contentDir, ".cms/"))),
          storedTarget
        };
      }
    } catch (err) {
      data = { ok: false, detail: err.message, existing: false };
    }
  } else {
    const location = plan.dataLocation ?? plan.target;
    try {
      if (location !== plan.target) {
        const res = await testStorageConnection(location.connectorId, location.settings, { ignore: ["siteUrl"] });
        if (!res.ok) throw new Error(`data location: ${res.detail}`);
      }
      const connector = hostingConnector(location);
      if (!connector.getBytes) throw new Error(`${location.connectorId} can't hold a SQLite file`);
      const path = plan.runtime.backend === "sqlite-file" ? plan.runtime.sqlite.path : "";
      const bytes = await connector.getBytes(path);
      const where = `${path}${location !== plan.target ? ` (${plan.dataLocationType})` : ""}`;
      if (!bytes) {
        data = { ok: true, detail: `new ${plan.passphraseAccount ? "encrypted " : ""}database at ${where}`, existing: false };
      } else if (isEncryptedDatabase(bytes)) {
        if (!plan.passphrase) throw new Error(`an encrypted database already exists at ${where}: store its passphrase as ${plan.passphraseAccount ?? "passphrase:<alias>"} (and set data.encryption)`);
        await openDatabaseBytes(bytes, plan.passphrase);
        data = { ok: true, detail: `existing encrypted database at ${where}`, existing: true };
      } else {
        data = { ok: true, detail: `existing database at ${where}${plan.passphraseAccount ? " — encrypted from its next save" : ""}`, existing: true };
      }
    } catch (err) {
      const message = err instanceof SqlitePassphraseError ? `wrong passphrase in ${plan.passphraseAccount}` : err.message;
      data = { ok: false, detail: message, existing: false };
    }
  }
  return { hosting, data };
}
function activate(runtime) {
  window.__FLEXWEG_CONFIG__ = runtime;
  resetRuntimeConfigCache();
  resetDocStore();
}
async function runInstall(plan, onStep) {
  const toasts = collectToasts();
  try {
    activate(plan.runtime);
    if (plan.runtime.backend === "markdown-git") setGitToken(plan.runtime.git, plan.gitToken ?? null);
    if (plan.runtime.backend === "sqlite-file") {
      saveSqliteConnectorSecrets(plan.sqliteSecrets ?? {});
      if (plan.passphraseAccount) {
        if (!plan.passphrase) {
          plan.passphrase = generatePassphrase();
          setCredential(plan.passphraseAccount, { passphrase: plan.passphrase });
          onStep(`Generated the database passphrase (stored as ${plan.passphraseAccount})`);
        }
        saveSqlitePassphrase(plan.passphrase);
      }
      loadSqlWasm();
      await ensurePublishBranch(plan.target);
    }
    onStep("Opening the content store");
    await getDocStore().ready();
    onStep("Saving the publish target and site URL");
    await savePublishTarget(plan.target, { siteUrl: "always" });
    const ops = themeAssetOps();
    let adminVersion = null;
    if (plan.adminFolder) {
      const admin = adminOps(plan.adminFolder, plan.runtime);
      ops.push(...admin.ops);
      adminVersion = admin.manifest.version;
    }
    onStep(`Uploading ${ops.length} files (theme assets${plan.adminFolder ? " + admin" : ""})`);
    await applyOps(hostingConnector(plan.target), ops);
    await settleHosting(plan.target);
    return { adminVersion, files: ops.length, notices: toasts.notices };
  } finally {
    toasts.stop();
  }
}
export {
  checkPlan,
  collectToasts,
  runInstall,
  settleHosting
};
