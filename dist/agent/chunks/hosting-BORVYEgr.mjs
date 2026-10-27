import { createRequire as __acmsRequire } from "node:module";
import { fileURLToPath as __acmsPath } from "node:url";
import { dirname as __acmsDirname } from "node:path";
const require2 = __acmsRequire(import.meta.url);
const __filename = __acmsPath(import.meta.url);
const __dirname = __acmsDirname(__filename);
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import { f as emptySnapshot, C as COLLECTIONS, e as createDocStore, u as missingFields, D as DocConflictError, v as mergeSecrets, w as instantiateStorageConnector, q as splitSecrets, x as buildConfigJsSource } from "./registry-BqcVo77s.mjs";
import { i as instance, S as StorageError, b as bytesToBase64 } from "./index-CSmlfI0R.mjs";
import { i as isEncryptedDatabase, e as encryptionParams, d as decryptDatabase, S as SqlitePassphraseError, c as encryptDatabase, h as distRoot, C as CliError } from "../agentcms.mjs";
import { c as cleanFolder } from "./plan-Dgd-OmrD.mjs";
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
      for (const doc of snapshot[collection].values()) stmt.run([doc.id, JSON.stringify(doc)]);
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
  for (const doc of snapshot.config.values()) {
    const split = splitSecrets(doc);
    if (split.secrets) {
      secrets[`config/${doc.id}`] = split.secrets;
      clean.config.set(doc.id, split.clean);
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
if (typeof window !== "undefined" && typeof window.addEventListener === "function") {
  window.addEventListener("beforeunload", (e) => {
  });
}
const ADMIN_MANIFEST = "admin-files.json";
const MANIFEST = ADMIN_MANIFEST;
function missingIndexReferences(indexHtml, files) {
  const known = /* @__PURE__ */ new Set([...files, "config.js", MANIFEST]);
  const refs = [...indexHtml.matchAll(/(?:src|href)="\.\/([^"?#]+)"/g)].map((m) => m[1]);
  return refs.filter((ref) => !known.has(ref));
}
function hostingConnector(target) {
  return instantiateStorageConnector(target.connectorId, target.settings);
}
const putOp = (path, bytes) => ({
  type: "put",
  path,
  content: Buffer.from(bytes).toString("base64"),
  encoding: "base64"
});
function readLocalAdminManifest() {
  const file = join(distRoot(), "admin", ADMIN_MANIFEST);
  try {
    return JSON.parse(readFileSync(file, "utf8"));
  } catch {
    throw new CliError("admin-missing", `No admin build at ${file}.`, "Run `npm run build` in a clone, or use the npm package.");
  }
}
function adminOps(folder, runtime) {
  const dir = cleanFolder(folder);
  const root = join(distRoot(), "admin");
  const manifest = readLocalAdminManifest();
  const index = readFileSync(join(root, "index.html"));
  const missing = missingIndexReferences(index.toString("utf8"), manifest.files);
  if (missing.length) {
    throw new CliError("admin-inconsistent", `dist/admin/index.html references files missing from the build: ${missing.join(", ")}.`, "Rebuild (`npm run build`).");
  }
  const files = [...manifest.files.filter((f) => f !== "index.html"), "index.html"];
  const ops = files.map((f) => putOp(`${dir}/${f}`, readFileSync(join(root, f))));
  ops.push({ type: "put", path: `${dir}/${ADMIN_MANIFEST}`, content: JSON.stringify(manifest, null, 2) + "\n" });
  ops.push({ type: "put", path: `${dir}/config.js`, content: buildConfigJsSource(runtime) });
  return { ops, manifest };
}
function themeAssetOps() {
  const root = join(distRoot(), "theme-assets");
  const walk = (dir) => readdirSync(dir).flatMap((name) => {
    const abs = join(dir, name);
    return statSync(abs).isDirectory() ? walk(abs) : [abs];
  });
  return walk(root).filter((abs) => !abs.endsWith(".DS_Store")).sort().map((abs) => putOp(`theme-assets/${relative(root, abs).split("\\").join("/")}`, readFileSync(abs)));
}
async function applyOps(connector, ops, onProgress) {
  if (connector.commitBatch) {
    await connector.commitBatch(ops);
    return;
  }
  for (const op of ops) {
    if (op.type === "put") await connector.put(op);
    else if (op.type === "delete") await connector.delete(op.path);
    else if (connector.deletePrefix) await connector.deletePrefix(op.path);
  }
}
function loadSqlWasm() {
  const assets = join(distRoot(), "admin", "assets");
  const wasm = readdirSync(assets).find((f) => /^sql-wasm.*\.wasm$/.test(f));
  if (!wasm) throw new CliError("admin-missing", `sql.js WASM not found in ${assets}.`);
  setSqlJsWasmBinary(new Uint8Array(readFileSync(join(assets, wasm))));
}
const hosting = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  adminOps,
  applyOps,
  hostingConnector,
  loadSqlWasm,
  readLocalAdminManifest,
  themeAssetOps
}, Symbol.toStringTag, { value: "Module" }));
export {
  saveSqlitePassphrase as a,
  adminOps as b,
  createSqliteFileDocStore as c,
  applyOps as d,
  decodeDatabase as e,
  hosting as f,
  hostingConnector as h,
  loadSqlWasm as l,
  openDatabaseBytes as o,
  saveSqliteConnectorSecrets as s,
  themeAssetOps as t
};
