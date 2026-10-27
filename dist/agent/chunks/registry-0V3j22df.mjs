import { createRequire as __acmsRequire } from "node:module";
import { fileURLToPath as __acmsPath } from "node:url";
import { dirname as __acmsDirname } from "node:path";
const require2 = __acmsRequire(import.meta.url);
const __filename = __acmsPath(import.meta.url);
const __dirname = __acmsDirname(__filename);
import { i as instance } from "./index-DCzLoAau.mjs";
import { toast } from "./toast-CYyyaSAW.mjs";
import { getRuntimeConfig, getBackendKind, isDocStoreBackend } from "./runtimeConfig-2M2d2Pbu.mjs";
import { g as getDoc, $ as setDoc, d as doc, a6 as configDocs, a4 as collections, a5 as getDb, T as Timestamp } from "./firebaseClient-D3fvED27.mjs";
import { c as createDocStore, e as emptySnapshot, g as getGitToken, C as COLLECTIONS, D as DocConflictError, m as mergeSecrets, a as splitSecrets, b as createGitDocStore } from "./gitStore-ueM10Bby.mjs";
import { i as isEncryptedDatabase, t as encryptionParams, u as decryptDatabase, S as SqlitePassphraseError, w as encryptDatabase } from "../agentcms.mjs";
import "./index-K8rfbNOg.mjs";
import { c as createRemoteGitTransport, j as joinRepoPath, b as bytesToBase64, d as base64ToBytes, f as base64ToUtf8, l as loadFolderHandle, e as ensureFolderPermission, a as createLocalFsTransport, m as mapLimit, p as performRequest } from "./index-BA9sR5p-.mjs";
import { StorageError } from "./types-DAD44Ttj.mjs";
import "./index-B4MbpTF6.mjs";
import "./index-BzGlTM6h.mjs";
import "./index.esm2017-C4mMOVmK.mjs";
const storageDocRef = () => doc(getDb(), collections.config, configDocs.storage);
async function getStorageConfig$2() {
  const snap = await getDoc(storageDocRef());
  if (!snap.exists()) return null;
  const data = snap.data();
  if (!data?.connectorId) return null;
  return { connectorId: data.connectorId, settings: data.settings ?? {} };
}
async function setStorageConfig$2(next) {
  await setDoc(storageDocRef(), { connectorId: next.connectorId, settings: next.settings ?? {} });
}
const firebase = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  getStorageConfig: getStorageConfig$2,
  setStorageConfig: setStorageConfig$2
}, Symbol.toStringTag, { value: "Module" }));
function createKvStore(dbName, storeName = "kv") {
  const memory = /* @__PURE__ */ new Map();
  let dbPromise = null;
  function db() {
    if (!dbPromise) {
      dbPromise = new Promise((resolve) => {
        try {
          if (typeof indexedDB === "undefined") return resolve(null);
          const req = indexedDB.open(dbName, 1);
          req.onupgradeneeded = () => req.result.createObjectStore(storeName);
          req.onsuccess = () => resolve(req.result);
          req.onerror = () => resolve(null);
          req.onblocked = () => resolve(null);
        } catch {
          resolve(null);
        }
      });
    }
    return dbPromise;
  }
  function run(mode, fn) {
    return db().then(
      (d) => new Promise((resolve, reject) => {
        if (!d) return resolve(void 0);
        const tx = d.transaction(storeName, mode);
        const req = fn(tx.objectStore(storeName));
        tx.oncomplete = () => resolve(req ? req.result : void 0);
        tx.onerror = () => reject(tx.error);
        tx.onabort = () => reject(tx.error);
      })
    );
  }
  return {
    async get(key) {
      if (!await db()) return memory.get(key);
      return run("readonly", (s) => s.get(key));
    },
    async set(key, value) {
      if (!await db()) return void memory.set(key, value);
      await run("readwrite", (s) => void s.put(value, key));
    },
    async delete(key) {
      if (!await db()) return void memory.delete(key);
      await run("readwrite", (s) => void s.delete(key));
    },
    async keys() {
      if (!await db()) return [...memory.keys()];
      return (await run("readonly", (s) => s.getAllKeys()) ?? []).map(String);
    },
    async entries() {
      if (!await db()) return [...memory.entries()];
      const out = [];
      await run("readonly", (s) => {
        const req = s.openCursor();
        req.onsuccess = () => {
          const cursor = req.result;
          if (!cursor) return;
          out.push([String(cursor.key), cursor.value]);
          cursor.continue();
        };
      });
      return out;
    },
    async clear() {
      if (!await db()) return void memory.clear();
      await run("readwrite", (s) => void s.clear());
    }
  };
}
const kv = createKvStore("agentcms-local-data", "docs");
const keyOf = (collection, id) => `${collection}/${id}`;
function createLocalDocStore() {
  return createDocStore({
    kind: "local",
    async load() {
      const snapshot = emptySnapshot();
      for (const [key, doc2] of await kv.entries()) {
        const slash = key.indexOf("/");
        const collection = key.slice(0, slash);
        if (snapshot[collection]) snapshot[collection].set(doc2.id, doc2);
      }
      return snapshot;
    },
    async persist(mutations) {
      for (const m of mutations) {
        if (m.op === "set") await kv.set(keyOf(m.collection, m.doc.id), m.doc);
        else await kv.delete(keyOf(m.collection, m.id));
      }
    },
    async identity() {
      return { uid: "local", email: "local@localhost", displayName: "Local admin", role: "admin" };
    }
  });
}
function gitlabCi(dir, branch) {
  const copy = dir === "public" ? '    - echo "Publishing public/"' : `    - rm -rf public && cp -r ${dir} public`;
  return [
    "# Generated by AgentCMS — publishes the static site with GitLab Pages.",
    "# Safe to edit: the CMS only creates this file when the repo has none.",
    "pages:",
    "  stage: deploy",
    "  script:",
    copy,
    "  artifacts:",
    "    paths:",
    "      - public",
    "  rules:",
    `    - if: $CI_COMMIT_BRANCH == "${branch}"`,
    ""
  ].join("\n");
}
function resolveGitPagesToken(settings) {
  if (settings.token) return settings.token;
  const runtime = getRuntimeConfig();
  if (runtime?.backend === "markdown-git" && runtime.git.provider === settings.provider) {
    return getGitToken(runtime.git) ?? "";
  }
  return "";
}
const pagesChecks = /* @__PURE__ */ new Map();
function githubPagesCheck(owner, repo) {
  return pagesChecks.get(`${owner}/${repo}`) ?? null;
}
function ensureGithubPages(settings, token, dir) {
  const key = `${settings.owner}/${settings.repo}`;
  let check = pagesChecks.get(key);
  if (!check) {
    check = enableGithubPages(settings, token, dir, key);
    pagesChecks.set(key, check);
  }
  return check;
}
async function enableGithubPages(settings, token, dir, key) {
  const api = (settings.apiBaseUrl || "https://api.github.com").replace(/\/+$/, "");
  const url = `${api}/repos/${encodeURIComponent(settings.owner ?? "")}/${encodeURIComponent(settings.repo ?? "")}/pages`;
  const headers = { Authorization: `Bearer ${token}`, Accept: "application/vnd.github+json" };
  try {
    const current = await fetch(url, { headers, cache: "no-store" });
    if (current.ok) return;
    const created = await fetch(url, {
      method: "POST",
      headers: { ...headers, "Content-Type": "application/json" },
      body: JSON.stringify({ source: { branch: settings.branch, path: dir === "docs" ? "/docs" : "/" } })
    });
    if (created.ok) {
      toast.success(instance.t("connectors.pages.enabled"));
      return;
    }
  } catch {
  }
  toast.info(
    instance.t("connectors.pages.enableHint", {
      repo: key,
      branch: settings.branch,
      folder: dir === "docs" ? "/docs" : "/ (root)"
    })
  );
}
function createGitPagesConnector(settings) {
  const token = resolveGitPagesToken(settings);
  let dir = String(settings.dir ?? "").replace(/^\/+|\/+$/g, "");
  if (settings.host === "gitlab-pages" && !dir) dir = "public";
  const transport = createRemoteGitTransport(
    settings.provider === "github" ? {
      provider: "github",
      owner: settings.owner ?? "",
      repo: settings.repo ?? "",
      branch: settings.branch,
      token,
      apiBaseUrl: settings.apiBaseUrl
    } : {
      provider: "gitlab",
      project: settings.project ?? "",
      branch: settings.branch,
      token,
      apiBaseUrl: settings.apiBaseUrl
    }
  );
  const siteUrl = (settings.siteUrl ?? "").replace(/\/+$/, "");
  const repoPath = (path) => joinRepoPath(dir, path);
  const sitePath = (path) => dir ? path.slice(dir.length + 1) : path;
  const inSite = (path) => !dir || path.startsWith(dir + "/");
  let cache = null;
  async function tree() {
    const head = await transport.headSha();
    if (cache && cache.head === head) return cache;
    const listed = await transport.listTree();
    cache = { head: listed.headSha, files: new Map(listed.entries.map((e) => [e.path, e])) };
    return cache;
  }
  function hostExtras(files) {
    if (settings.host === "github-pages") {
      const marker = repoPath(".nojekyll");
      return files.has(marker) ? [] : [{ type: "put", path: marker, content: "" }];
    }
    if (settings.host === "gitlab-pages") {
      return files.has(".gitlab-ci.yml") ? [] : [{ type: "put", path: ".gitlab-ci.yml", content: gitlabCi(dir, settings.branch) }];
    }
    return [];
  }
  async function commitBatch(ops) {
    const { files } = await tree();
    const changes = [];
    let count = 0;
    for (const op of ops) {
      if (op.type === "deletePrefix") {
        const prefix = repoPath(op.path) + "/";
        for (const path of files.keys()) {
          if (path.startsWith(prefix)) changes.push({ type: "delete", path });
        }
      } else if (op.type === "delete") {
        if (files.has(repoPath(op.path))) changes.push({ type: "delete", path: repoPath(op.path) });
      } else {
        changes.push({ type: "put", path: repoPath(op.path), content: op.content, encoding: op.encoding });
        count++;
      }
    }
    changes.push(...hostExtras(files));
    const deleted = changes.filter((c) => c.type === "delete").length;
    const summary = [count && `${count} updated`, deleted && `${deleted} removed`].filter(Boolean).join(", ");
    await transport.commit(changes, { message: `Publish site${summary ? ` (${summary})` : ""} — AgentCMS` });
    cache = null;
    if (settings.host === "github-pages" && settings.provider === "github") {
      void ensureGithubPages(settings, token, dir);
    }
  }
  return {
    id: "git-pages",
    model: "commit",
    capabilities: {
      list: true,
      rename: false,
      renameFolder: false,
      folders: false,
      deletePrefix: true
    },
    // Outside a batch every write is its own commit — correct, just noisy.
    put: (input) => commitBatch([{ type: "put", ...input }]),
    delete: (path) => commitBatch([{ type: "delete", path }]),
    deletePrefix: (path) => commitBatch([{ type: "deletePrefix", path }]),
    commitBatch,
    async get(path) {
      const { files } = await tree();
      const entry = files.get(repoPath(path));
      if (!entry) throw new StorageError(`File not found: ${path}`, 404);
      const texts = await transport.readTexts([entry]);
      const text = texts.get(entry.path);
      if (text === void 0) throw new StorageError(`File not found: ${path}`, 404);
      return text;
    },
    async getBytes(path) {
      const { files } = await tree();
      const entry = files.get(repoPath(path));
      return entry ? transport.readBytes(entry) : null;
    },
    async list(page, perPage) {
      const { files } = await tree();
      const all = [...files.values()].filter((e) => inSite(e.path)).map((e) => ({ path: sitePath(e.path), type: "file", size: e.size, url: `${siteUrl}/${sitePath(e.path)}` })).sort((a, b) => a.path < b.path ? -1 : 1);
      return { items: all.slice((page - 1) * perPage, page * perPage), page, per_page: perPage, total: all.length };
    },
    async publicUrl(path) {
      return `${siteUrl}/${path.replace(/^\/+/, "")}`;
    }
  };
}
const gitPagesFactory = {
  id: "git-pages",
  create: createGitPagesConnector
};
const PROBE_PATH = ".agentcms-probe.txt";
const REQUIRED = {
  "git-pages": (s) => [...s.provider === "gitlab" ? ["project"] : ["owner", "repo"], "branch", "siteUrl"],
  s3: () => ["bucket", "accessKeyId", "secretAccessKey", "siteUrl"]
};
function missingFields(connectorId, settings, ignore = []) {
  const required = (REQUIRED[connectorId]?.(settings) ?? []).filter((k) => !ignore.includes(k));
  return required.filter((k) => typeof settings[k] !== "string" || !settings[k].trim());
}
async function testStorageConnection(connectorId, settings, opts = {}) {
  const missing = missingFields(connectorId, settings, opts.ignore);
  if (missing.length) return { ok: false, detail: `missing: ${missing.join(", ")}` };
  try {
    if (connectorId === "git-pages") {
      const s = settings;
      const token = resolveGitPagesToken(s);
      const transport = createRemoteGitTransport(
        s.provider === "github" ? { provider: "github", owner: s.owner ?? "", repo: s.repo ?? "", branch: s.branch, token, apiBaseUrl: s.apiBaseUrl } : { provider: "gitlab", project: s.project ?? "", branch: s.branch, token, apiBaseUrl: s.apiBaseUrl }
      );
      const perms = await transport.permissions();
      if (!perms.canWrite) return { ok: false, detail: `${perms.login}: read-only access` };
      return { ok: true, detail: `${perms.login} → ${transport.label}` };
    }
    const connector = instantiateStorageConnector(connectorId, settings);
    if (connectorId === "browser-mirror") return { ok: true, detail: "browser" };
    await connector.put({ path: PROBE_PATH, content: `AgentCMS connection test ${(/* @__PURE__ */ new Date()).toISOString()}
` });
    const echoed = await connector.get(PROBE_PATH).catch(() => null);
    await connector.delete(PROBE_PATH);
    if (echoed === null) return { ok: false, detail: "write succeeded but read-back failed" };
    return { ok: true, detail: await connector.publicUrl("") };
  } catch (err) {
    const status = err instanceof StorageError ? ` (${err.status})` : "";
    return { ok: false, detail: `${err.message}${status}` };
  }
}
const testConnection = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  PROBE_PATH,
  missingFields,
  testStorageConnection
}, Symbol.toStringTag, { value: "Module" }));
const FORMAT_VERSION = "1";
const MAX_REBASES = 3;
const CONNECTOR_SECRETS_KEY = "agentcms.sqliteConnectorSecrets";
const DOC_SECRETS_KEY = "agentcms.sqliteDocSecrets";
const PASSPHRASE_KEY = "agentcms.sqlitePassphrase";
function readJson(key, fallback) {
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}
function writeJson(key, value) {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
  }
}
function saveSqliteConnectorSecrets(secrets) {
  writeJson(CONNECTOR_SECRETS_KEY, secrets);
}
function getSqlitePassphrase() {
  try {
    return window.localStorage.getItem(PASSPHRASE_KEY);
  } catch {
    return null;
  }
}
function saveSqlitePassphrase(passphrase) {
  try {
    if (passphrase) window.localStorage.setItem(PASSPHRASE_KEY, passphrase);
    else window.localStorage.removeItem(PASSPHRASE_KEY);
  } catch {
  }
}
async function openDatabaseBytes(bytes, passphrase) {
  if (!isEncryptedDatabase(bytes)) return { plain: bytes, params: null };
  return { plain: await decryptDatabase(bytes, passphrase), params: encryptionParams(bytes) };
}
function connectorSettingsWithSecrets(cfg) {
  return { ...cfg.settings, ...readJson(CONNECTOR_SECRETS_KEY, {}) };
}
let sqlPromise = null;
let nodeWasmBinary = null;
function setSqlJsWasmBinary(bytes) {
  nodeWasmBinary = bytes;
}
function loadSql() {
  if (!sqlPromise) {
    sqlPromise = (async () => {
      const { default: initSqlJs } = await import("./sqljs-3zAzmS-z.mjs");
      const isBrowser = typeof window !== "undefined" && typeof document !== "undefined";
      if (!isBrowser) return initSqlJs(nodeWasmBinary ? { wasmBinary: nodeWasmBinary.slice().buffer } : void 0);
      const { default: wasmUrl } = await import("./sql-wasm-GjJDiefO.mjs");
      return initSqlJs({ locateFile: () => wasmUrl });
    })().catch((err) => {
      sqlPromise = null;
      throw err;
    });
  }
  return sqlPromise;
}
async function decodeDatabase(bytes) {
  const SQL = await loadSql();
  const db = new SQL.Database(bytes);
  try {
    const snapshot = emptySnapshot();
    const tables = new Set(
      (db.exec("SELECT name FROM sqlite_master WHERE type = 'table'")[0]?.values ?? []).map((r) => String(r[0]))
    );
    for (const collection of COLLECTIONS) {
      if (!tables.has(collection)) continue;
      for (const [id, data] of db.exec(`SELECT id, data FROM "${collection}"`)[0]?.values ?? []) {
        try {
          snapshot[collection].set(String(id), { ...JSON.parse(String(data)), id: String(id) });
        } catch {
          console.warn(`[sqlite-file] skipping malformed row ${collection}/${id}`);
        }
      }
    }
    return snapshot;
  } finally {
    db.close();
  }
}
async function encodeDatabase(snapshot) {
  const SQL = await loadSql();
  const db = new SQL.Database();
  try {
    db.run("CREATE TABLE meta (key TEXT PRIMARY KEY, value TEXT NOT NULL)");
    db.run("INSERT INTO meta VALUES ('format', 'agentcms'), ('version', ?), ('savedAt', ?)", [
      FORMAT_VERSION,
      (/* @__PURE__ */ new Date()).toISOString()
    ]);
    db.run("BEGIN");
    for (const collection of COLLECTIONS) {
      db.run(`CREATE TABLE "${collection}" (id TEXT PRIMARY KEY, data TEXT NOT NULL)`);
      const stmt = db.prepare(`INSERT INTO "${collection}" (id, data) VALUES (?, ?)`);
      for (const doc2 of snapshot[collection].values()) stmt.run([doc2.id, JSON.stringify(doc2)]);
      stmt.free();
    }
    db.run("COMMIT");
    return db.export();
  } finally {
    db.close();
  }
}
async function hashBytes(bytes) {
  if (!bytes) return "missing";
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, "0")).join("");
}
function stripDocSecrets(snapshot) {
  const clean = Object.fromEntries(COLLECTIONS.map((c) => [c, new Map(snapshot[c])]));
  const secrets = {};
  for (const doc2 of snapshot.config.values()) {
    const split = splitSecrets(doc2);
    if (split.secrets) {
      secrets[`config/${doc2.id}`] = split.secrets;
      clean.config.set(doc2.id, split.clean);
    }
  }
  return { clean, secrets };
}
function applyOnto(base, mutations) {
  const next = Object.fromEntries(COLLECTIONS.map((c) => [c, new Map(base[c])]));
  for (const m of mutations) {
    if (m.op === "set") next[m.collection].set(m.doc.id, m.doc);
    else next[m.collection].delete(m.id);
  }
  return next;
}
function createSqliteFileDocStore(cfg) {
  let lastHash = null;
  let connector = null;
  let cryptoParams = null;
  let passphraseProblem = null;
  let encrypted = !!cfg.encrypted;
  let stale = false;
  function open() {
    if (!connector) connector = instantiateStorageConnector(cfg.connectorId, connectorSettingsWithSecrets(cfg));
    return connector;
  }
  async function readRemote() {
    const c = open();
    if (!c.getBytes) throw new StorageError(instance.t("docstore.errors.sqliteUnsupported", { connector: cfg.connectorId }), 501);
    const bytes = await c.getBytes(cfg.path);
    let snapshot = emptySnapshot();
    if (bytes) {
      const opened = await openDatabaseBytes(bytes, getSqlitePassphrase());
      if (opened.params) cryptoParams = opened.params;
      snapshot = await decodeDatabase(opened.plain);
    }
    mergeSecrets(snapshot, readJson(DOC_SECRETS_KEY, {}));
    return { snapshot, hash: await hashBytes(bytes) };
  }
  async function writeRemote(snapshot) {
    const { clean, secrets } = stripDocSecrets(snapshot);
    writeJson(DOC_SECRETS_KEY, secrets);
    const plain = await encodeDatabase(clean);
    const encrypt = encrypted || cryptoParams !== null;
    const bytes = encrypt ? await encryptDatabase(plain, getSqlitePassphrase() ?? "", cryptoParams ?? void 0) : plain;
    await open().put({ path: cfg.path, content: bytesToBase64(bytes), encoding: "base64" });
    lastHash = await hashBytes(bytes);
  }
  const store = createDocStore({
    kind: "sqlite-file",
    pollIntervalMs: 6e4,
    async load() {
      const remote = await readRemote();
      lastHash = remote.hash;
      stale = false;
      return remote.snapshot;
    },
    async persist(mutations, before, after) {
      let target = after;
      for (let attempt = 0; ; attempt++) {
        const remote = await readRemote();
        if (lastHash === null || remote.hash === lastHash) {
          await writeRemote(target);
          return;
        }
        for (const m of mutations) {
          const id = m.op === "set" ? m.doc.id : m.id;
          const base = JSON.stringify(before[m.collection].get(id) ?? null);
          const theirs = JSON.stringify(remote.snapshot[m.collection].get(id) ?? null);
          if (base !== theirs) {
            lastHash = remote.hash;
            stale = true;
            throw new DocConflictError(instance.t("docstore.errors.conflict"), m.collection, id);
          }
        }
        if (attempt >= MAX_REBASES) throw new DocConflictError(instance.t("docstore.errors.conflict"), mutations[0].collection, "");
        lastHash = remote.hash;
        stale = true;
        target = applyOnto(remote.snapshot, mutations);
      }
    },
    async poll() {
      const remote = await readRemote();
      if (remote.hash === lastHash && !stale) return null;
      lastHash = remote.hash;
      stale = false;
      return remote.snapshot;
    },
    // No accounts: a single implicit admin, available as soon as this
    // browser has the connector's secrets (the access screen asks for
    // them otherwise).
    async identity() {
      if (missingFields(cfg.connectorId, connectorSettingsWithSecrets(cfg), ["siteUrl"]).length > 0) return null;
      if (encrypted && !getSqlitePassphrase()) {
        passphraseProblem = "missing";
        return null;
      }
      try {
        await store.ready();
        passphraseProblem = null;
      } catch (err) {
        if (err instanceof SqlitePassphraseError) {
          passphraseProblem = err.reason;
          return null;
        }
      }
      return { uid: "admin", email: "admin@localhost", displayName: "Admin", role: "admin" };
    }
  });
  return Object.assign(store, {
    passphraseProblem: () => passphraseProblem,
    isEncrypted: () => encrypted || cryptoParams !== null,
    async rekey(passphrase) {
      if (passphrase.trim().length < 12) throw new Error("The passphrase must be at least 12 characters long.");
      await store.ready();
      const remote = await readRemote();
      const previous = getSqlitePassphrase();
      saveSqlitePassphrase(passphrase.trim());
      const previousParams = cryptoParams;
      cryptoParams = null;
      try {
        encrypted = true;
        await writeRemote(remote.snapshot);
        await readRemote();
      } catch (err) {
        saveSqlitePassphrase(previous);
        cryptoParams = previousParams;
        encrypted = !!cfg.encrypted;
        throw err;
      }
    },
    resetSession() {
      connector = null;
      cryptoParams = null;
      passphraseProblem = null;
      lastHash = null;
      stale = false;
    }
  });
}
const sqliteFileStore = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  SqlitePassphraseError,
  connectorSettingsWithSecrets,
  createSqliteFileDocStore,
  decodeDatabase,
  encodeDatabase,
  getSqlitePassphrase,
  openDatabaseBytes,
  saveSqliteConnectorSecrets,
  saveSqlitePassphrase,
  setSqlJsWasmBinary
}, Symbol.toStringTag, { value: "Module" }));
let active$1 = null;
function getDocStore() {
  if (active$1) return active$1;
  const config = getRuntimeConfig();
  if (config?.backend === "markdown-git") active$1 = createGitDocStore(config.git);
  else if (config?.backend === "sqlite-file") active$1 = createSqliteFileDocStore(config.sqlite);
  else if (config?.backend === "local") active$1 = createLocalDocStore();
  else throw new Error("No document store for the active backend.");
  return active$1;
}
function resetDocStore() {
  active$1 = null;
}
function setDocStoreForTests(store) {
  active$1 = store;
}
function createMemoryDocStore(seed, identity = { uid: "local", email: "", displayName: "Local", role: "admin" }) {
  return createDocStore({
    kind: "local",
    async load() {
      const s = emptySnapshot();
      for (const [c, docs] of Object.entries(seed ?? {})) {
        for (const d of docs ?? []) s[c].set(d.id, d);
      }
      return s;
    },
    async persist() {
    },
    async identity() {
      return identity;
    }
  });
}
function toMillis(value) {
  if (value == null) return void 0;
  if (typeof value === "number") return value;
  if (value instanceof Timestamp) return value.toMillis();
  if (value instanceof Date) return value.getTime();
  if (typeof value === "string") {
    const ms = Date.parse(value);
    return Number.isNaN(ms) ? void 0 : ms;
  }
  return Date.now();
}
function toTimestamp(value) {
  const ms = toMillis(value);
  return ms === void 0 ? void 0 : Timestamp.fromMillis(ms);
}
function newDocId() {
  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  const bytes = crypto.getRandomValues(new Uint8Array(20));
  return [...bytes].map((b) => alphabet[b % alphabet.length]).join("");
}
const index = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  COLLECTIONS,
  DocConflictError,
  createMemoryDocStore,
  getDocStore,
  newDocId,
  resetDocStore,
  setDocStoreForTests,
  toMillis,
  toTimestamp
}, Symbol.toStringTag, { value: "Module" }));
const CONFIG_ID = "storage";
async function getStorageConfig$1() {
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
const docstore = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  getStorageConfig: getStorageConfig$1,
  setStorageConfig: setStorageConfig$1
}, Symbol.toStringTag, { value: "Module" }));
let _impl = null;
function impl() {
  if (!_impl) {
    const kind = getBackendKind();
    _impl = isDocStoreBackend(kind) ? docstore : firebase;
  }
  return _impl;
}
function getStorageConfig(...args) {
  return impl().getStorageConfig(...args);
}
function setStorageConfig(...args) {
  return impl().setStorageConfig(...args);
}
const storageConfig = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  getStorageConfig,
  setStorageConfig
}, Symbol.toStringTag, { value: "Module" }));
const mirror = createKvStore("agentcms-site-mirror", "files");
function createBrowserMirrorConnector(settings) {
  const siteUrl = (settings.siteUrl ?? "").replace(/\/+$/, "");
  const norm = (path) => path.replace(/^\/+/, "");
  return {
    id: "browser-mirror",
    model: "files",
    capabilities: {
      list: true,
      rename: false,
      renameFolder: false,
      folders: false,
      deletePrefix: true
    },
    async put(input) {
      await mirror.set(norm(input.path), {
        content: input.content,
        encoding: input.encoding === "base64" ? "base64" : "utf-8",
        updatedAt: Date.now()
      });
    },
    async get(path) {
      const file = await mirror.get(norm(path));
      if (!file) throw new StorageError(`File not found: ${path}`, 404);
      return file.encoding === "base64" ? base64ToUtf8(file.content) : file.content;
    },
    async getBytes(path) {
      const file = await mirror.get(norm(path));
      if (!file) return null;
      return file.encoding === "base64" ? base64ToBytes(file.content) : new TextEncoder().encode(file.content);
    },
    delete: (path) => mirror.delete(norm(path)),
    async deletePrefix(path) {
      const prefix = norm(path).replace(/\/+$/, "") + "/";
      for (const key of await mirror.keys()) if (key.startsWith(prefix)) await mirror.delete(key);
    },
    async list(page, perPage) {
      const all = (await mirror.keys()).sort().map((path) => ({ path, type: "file", url: siteUrl ? `${siteUrl}/${path}` : `/${path}` }));
      return { items: all.slice((page - 1) * perPage, page * perPage), page, per_page: perPage, total: all.length };
    },
    async publicUrl(path) {
      return siteUrl ? `${siteUrl}/${norm(path)}` : `/${norm(path)}`;
    }
  };
}
const browserMirrorFactory = {
  id: "browser-mirror",
  create: createBrowserMirrorConnector
};
const LOCAL_PUBLISH_HANDLE_KEY = "publish-target";
function createLocalFolderConnector(settings) {
  const siteUrl = (settings.siteUrl ?? "").replace(/\/+$/, "");
  let transport = null;
  async function open() {
    if (transport) return transport;
    const handle = await loadFolderHandle(LOCAL_PUBLISH_HANDLE_KEY);
    if (!handle || !await ensureFolderPermission(handle)) {
      const message = instance.t("storage.errors.folderAccess");
      toast.error(message);
      throw new StorageError(message, 403);
    }
    transport = createLocalFsTransport(handle);
    return transport;
  }
  async function entry(path) {
    const tree = await (await open()).listTree();
    return tree.entries.find((e) => e.path === path.replace(/^\/+/, ""));
  }
  return {
    id: "local-folder",
    model: "files",
    capabilities: {
      list: true,
      rename: false,
      renameFolder: false,
      folders: false,
      deletePrefix: true
    },
    async put(input) {
      await (await open()).commit([{ type: "put", ...input, path: input.path.replace(/^\/+/, "") }], { message: "" });
    },
    async get(path) {
      const e = await entry(path);
      const text = e ? (await (await open()).readTexts([e])).get(e.path) : void 0;
      if (text === void 0) throw new StorageError(`File not found: ${path}`, 404);
      return text;
    },
    async getBytes(path) {
      const e = await entry(path);
      return e ? (await open()).readBytes(e) : null;
    },
    async delete(path) {
      await (await open()).commit([{ type: "delete", path: path.replace(/^\/+/, "") }], { message: "" });
    },
    async deletePrefix(path) {
      const t = await open();
      const prefix = path.replace(/^\/+|\/+$/g, "") + "/";
      const doomed = (await t.listTree()).entries.filter((e) => e.path.startsWith(prefix));
      await t.commit(doomed.map((e) => ({ type: "delete", path: e.path })), { message: "" });
    },
    async list(page, perPage) {
      const all = (await (await open()).listTree()).entries.map((e) => ({
        path: e.path,
        type: "file",
        size: e.size,
        url: siteUrl ? `${siteUrl}/${e.path}` : `/${e.path}`
      }));
      return { items: all.slice((page - 1) * perPage, page * perPage), page, per_page: perPage, total: all.length };
    },
    async publicUrl(path) {
      const clean = path.replace(/^\/+/, "");
      return siteUrl ? `${siteUrl}/${clean}` : `/${clean}`;
    }
  };
}
const localFolderFactory = {
  id: "local-folder",
  create: createLocalFolderConnector
};
const TYPES = {
  html: "text/html; charset=utf-8",
  htm: "text/html; charset=utf-8",
  css: "text/css; charset=utf-8",
  js: "text/javascript; charset=utf-8",
  mjs: "text/javascript; charset=utf-8",
  json: "application/json; charset=utf-8",
  webmanifest: "application/manifest+json; charset=utf-8",
  xml: "application/xml; charset=utf-8",
  xsl: "application/xslt+xml; charset=utf-8",
  txt: "text/plain; charset=utf-8",
  md: "text/markdown; charset=utf-8",
  svg: "image/svg+xml",
  png: "image/png",
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  gif: "image/gif",
  webp: "image/webp",
  avif: "image/avif",
  ico: "image/x-icon",
  pdf: "application/pdf",
  woff: "font/woff",
  woff2: "font/woff2",
  ttf: "font/ttf",
  otf: "font/otf",
  mp4: "video/mp4",
  webm: "video/webm",
  mp3: "audio/mpeg",
  zip: "application/zip"
};
function contentTypeFor(path) {
  const ext = path.split(".").pop()?.toLowerCase() ?? "";
  return TYPES[ext] ?? "application/octet-stream";
}
function cacheControlFor(path) {
  return /\.(html?|json|xml|xsl|txt|css|js|mjs|webmanifest)$/i.test(path) ? "no-cache" : "public, max-age=86400";
}
const enc = new TextEncoder();
function hex(buffer) {
  return [...new Uint8Array(buffer)].map((b) => b.toString(16).padStart(2, "0")).join("");
}
async function sha256Hex(data) {
  return hex(await crypto.subtle.digest("SHA-256", enc.encode(data)));
}
async function hmac(key, data) {
  const cryptoKey = await crypto.subtle.importKey(
    "raw",
    key,
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  return crypto.subtle.sign("HMAC", cryptoKey, enc.encode(data));
}
function rfc3986(value) {
  return encodeURIComponent(value).replace(/[!'()*]/g, (c) => `%${c.charCodeAt(0).toString(16).toUpperCase()}`);
}
function amzDates(date) {
  const amzDate = date.toISOString().replace(/[:-]|\.\d{3}/g, "");
  return { amzDate, dateStamp: amzDate.slice(0, 8) };
}
async function signRequest(args) {
  const url = new URL(args.url);
  const { amzDate, dateStamp } = amzDates(args.date ?? /* @__PURE__ */ new Date());
  const headers = { ...args.headers, "x-amz-date": amzDate };
  const signed = { host: url.host };
  for (const [k, v] of Object.entries(headers)) signed[k.toLowerCase()] = String(v).trim().replace(/\s+/g, " ");
  const names = Object.keys(signed).sort();
  const canonicalHeaders = names.map((n) => `${n}:${signed[n]}
`).join("");
  const signedHeaders = names.join(";");
  const query = [...url.searchParams.entries()].map(([k, v]) => [rfc3986(k), rfc3986(v)]).sort(([a, av], [b, bv]) => a < b ? -1 : a > b ? 1 : av < bv ? -1 : av > bv ? 1 : 0).map(([k, v]) => `${k}=${v}`).join("&");
  const canonicalRequest = [
    args.method.toUpperCase(),
    url.pathname || "/",
    query,
    canonicalHeaders,
    signedHeaders,
    args.payloadHash
  ].join("\n");
  const { accessKeyId, secretAccessKey, region, service } = args.credentials;
  const scope = `${dateStamp}/${region}/${service}/aws4_request`;
  const stringToSign = ["AWS4-HMAC-SHA256", amzDate, scope, await sha256Hex(canonicalRequest)].join("\n");
  let key = await hmac(enc.encode(`AWS4${secretAccessKey}`), dateStamp);
  key = await hmac(key, region);
  key = await hmac(key, service);
  key = await hmac(key, "aws4_request");
  const signature = hex(await hmac(key, stringToSign));
  return {
    ...headers,
    Authorization: `AWS4-HMAC-SHA256 Credential=${accessKeyId}/${scope}, SignedHeaders=${signedHeaders}, Signature=${signature}`
  };
}
const UNSIGNED = "UNSIGNED-PAYLOAD";
function encodeKey(key) {
  return key.split("/").map(rfc3986).join("/");
}
function decodeXml(s) {
  return s.replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&apos;/g, "'").replace(/&amp;/g, "&");
}
function createS3Connector(settings) {
  const endpoint = (settings.endpoint || `https://s3.${settings.region}.amazonaws.com`).replace(/\/+$/, "");
  let endpointUrl;
  try {
    endpointUrl = new URL(endpoint);
  } catch {
    throw new StorageError(`Invalid S3 endpoint: ${endpoint}`, 400);
  }
  const pathStyle = settings.forcePathStyle ?? !endpointUrl.hostname.endsWith("amazonaws.com");
  const bucketBase = pathStyle ? `${endpoint}/${rfc3986(settings.bucket)}` : `${endpointUrl.protocol}//${settings.bucket}.${endpointUrl.host}`;
  const prefix = (settings.prefix ?? "").replace(/^\/+|\/+$/g, "");
  const siteUrl = (settings.siteUrl ?? "").replace(/\/+$/, "");
  const credentials = {
    accessKeyId: settings.accessKeyId,
    secretAccessKey: settings.secretAccessKey,
    region: settings.region || "us-east-1",
    service: "s3"
  };
  const keyFor = (path) => prefix ? `${prefix}/${path.replace(/^\/+/, "")}` : path.replace(/^\/+/, "");
  const pathFor = (key) => prefix ? key.slice(prefix.length + 1) : key;
  async function send(action, method, url, init = {}) {
    const headers = await signRequest({
      method,
      url,
      headers: { "x-amz-content-sha256": UNSIGNED, ...init.headers ?? {} },
      payloadHash: UNSIGNED,
      credentials
    });
    return performRequest(
      action,
      () => fetch(url, { method, headers, body: init.body, signal: init.signal, cache: init.cache })
    );
  }
  async function listKeys(under) {
    const out = [];
    let token;
    do {
      const params = new URLSearchParams({ "list-type": "2", "max-keys": "1000" });
      if (under) params.set("prefix", under);
      if (token) params.set("continuation-token", token);
      const res = await send("list", "GET", `${bucketBase}/?${params}`, { cache: "no-store" });
      const xml = await res.text();
      for (const block of xml.match(/<Contents>[\s\S]*?<\/Contents>/g) ?? []) {
        const key = block.match(/<Key>([\s\S]*?)<\/Key>/)?.[1];
        const size = Number(block.match(/<Size>(\d+)<\/Size>/)?.[1] ?? 0);
        if (key) out.push({ key: decodeXml(key), size });
      }
      const truncated = /<IsTruncated>true<\/IsTruncated>/.test(xml);
      token = truncated ? decodeXml(xml.match(/<NextContinuationToken>([\s\S]*?)<\/NextContinuationToken>/)?.[1] ?? "") : void 0;
    } while (token);
    return out;
  }
  async function deleteKey(key, signal) {
    try {
      await send("delete", "DELETE", `${bucketBase}/${encodeKey(key)}`, { signal });
    } catch (err) {
      if (err instanceof StorageError && err.status === 404) return;
      throw err;
    }
  }
  return {
    id: "s3",
    model: "files",
    capabilities: {
      list: true,
      rename: false,
      renameFolder: false,
      folders: false,
      deletePrefix: true
    },
    async put(input, signal) {
      const body = input.encoding === "base64" ? base64ToBytes(input.content) : input.content;
      await send("upload", "PUT", `${bucketBase}/${encodeKey(keyFor(input.path))}`, {
        headers: {
          "content-type": contentTypeFor(input.path),
          "cache-control": cacheControlFor(input.path),
          ...settings.publicRead ? { "x-amz-acl": "public-read" } : {}
        },
        body,
        signal
      });
    },
    async get(path) {
      const res = await send("get", "GET", `${bucketBase}/${encodeKey(keyFor(path))}`, { cache: "no-store" });
      return res.text();
    },
    async getBytes(path) {
      const url = `${bucketBase}/${encodeKey(keyFor(path))}`;
      const headers = await signRequest({
        method: "GET",
        url,
        headers: { "x-amz-content-sha256": UNSIGNED },
        payloadHash: UNSIGNED,
        credentials
      });
      const res = await fetch(url, { headers, cache: "no-store" }).catch(
        (err) => performRequest("get", () => Promise.reject(err))
      );
      if (res.status === 404 || res.status === 403) {
        return null;
      }
      const ok = res.ok ? res : await performRequest("get", async () => res);
      return new Uint8Array(await ok.arrayBuffer());
    },
    delete: (path, signal) => deleteKey(keyFor(path), signal),
    async deletePrefix(path) {
      const keys = await listKeys(keyFor(path).replace(/\/+$/, "") + "/");
      await mapLimit(keys, 6, (k) => deleteKey(k.key));
    },
    async list(page, perPage) {
      const all = (await listKeys(prefix ? `${prefix}/` : "")).map((k) => ({ path: pathFor(k.key), type: "file", size: k.size, url: `${siteUrl}/${pathFor(k.key)}` }));
      return { items: all.slice((page - 1) * perPage, page * perPage), page, per_page: perPage, total: all.length };
    },
    async publicUrl(path) {
      return `${siteUrl}/${path.replace(/^\/+/, "")}`;
    }
  };
}
const s3Factory = {
  id: "s3",
  create: createS3Connector
};
const DEFAULT_CONNECTOR_ID = "browser-mirror";
const connectors = new Map(
  [
    gitPagesFactory,
    s3Factory,
    browserMirrorFactory,
    localFolderFactory
  ].map((e) => [e.id, e])
);
function isFactory(entry) {
  return typeof entry.create === "function";
}
function registerStorageConnector(entry) {
  connectors.set(entry.id, entry);
  if (active && active.id === entry.id) active = null;
}
function defaultConnectorId() {
  return DEFAULT_CONNECTOR_ID;
}
function listStorageConnectorIds() {
  return [...connectors.keys()];
}
function instantiateStorageConnector(id, settings) {
  const entry = connectors.get(id);
  if (!entry) {
    throw new StorageError(instance.t("storage.errors.unknownConnector", { connector: id }), 501);
  }
  return isFactory(entry) ? entry.create(settings) : entry;
}
let active = null;
async function resolveActive() {
  let config = null;
  try {
    config = await getStorageConfig();
  } catch (err) {
    console.warn("[storage] could not read storage config, using the default target:", err);
  }
  const id = config?.connectorId ?? defaultConnectorId();
  try {
    return instantiateStorageConnector(id, config?.settings ?? {});
  } catch (err) {
    toast.error(err.message);
    throw err;
  }
}
async function getActiveStorageConnector() {
  if (!active) {
    const connector = resolveActive();
    active = { id: "", connector };
    connector.then(
      (c) => {
        if (active?.connector === connector) active.id = c.id;
      },
      () => {
        if (active?.connector === connector) active = null;
      }
    );
  }
  return active.connector;
}
function invalidateActiveStorageConnector() {
  active = null;
}
const registry = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  DEFAULT_CONNECTOR_ID,
  defaultConnectorId,
  getActiveStorageConnector,
  instantiateStorageConnector,
  invalidateActiveStorageConnector,
  listStorageConnectorIds,
  registerStorageConnector
}, Symbol.toStringTag, { value: "Module" }));
export {
  saveSqlitePassphrase as a,
  githubPagesCheck as b,
  getActiveStorageConnector as c,
  setStorageConfig as d,
  getStorageConfig as e,
  defaultConnectorId as f,
  getDocStore as g,
  decodeDatabase as h,
  invalidateActiveStorageConnector as i,
  instantiateStorageConnector as j,
  setSqlJsWasmBinary as k,
  resolveGitPagesToken as l,
  missingFields as m,
  newDocId as n,
  openDatabaseBytes as o,
  toTimestamp as p,
  toMillis as q,
  resetDocStore as r,
  saveSqliteConnectorSecrets as s,
  testStorageConnection as t,
  registerStorageConnector as u,
  testConnection as v,
  sqliteFileStore as w,
  index as x,
  storageConfig as y,
  registry as z
};
