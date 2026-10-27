import type { Database, SqlJsStatic } from "sql.js";
import {
  decryptDatabase,
  encryptDatabase,
  encryptionParams,
  isEncryptedDatabase,
  SqlitePassphraseError,
  type EncryptionParams,
} from "./sqliteCrypto";
import i18n from "../../i18n";
import type { SqliteFileRuntimeConfig } from "../../lib/runtimeConfig";
import { instantiateStorageConnector } from "../storage/registry";
import { missingFields } from "../storage/testConnection";
import { StorageError, type StorageConnector } from "../storage/types";
import { bytesToBase64 } from "../git/encoding";
import { createDocStore, emptySnapshot, type Snapshot } from "./core";
import { mergeSecrets, splitSecrets, type SecretBag } from "./markdownLayout";
import { COLLECTIONS, DocConflictError, type DocMutation, type DocStore } from "./types";

// "sqlite-file" document store: the whole dataset lives in ONE SQLite
// file on the user's own hosting (e.g. admin/data/cms.sqlite), read and
// rewritten through a publish connector (git repo, S3,
// local folder…) and opened in the browser with sql.js.
//
// No accounts: whoever can open the admin can edit — protecting it
// (e.g. a password on /admin at the hosting level) is the site owner's
// job. Secrets never go into the file: the connector's own credentials
// stay in each browser (localStorage), and secret fields of config docs
// (publish target keys) are split out like the git store does.
//
// Format: one table per collection, `(id TEXT PRIMARY KEY, data TEXT)`
// with the doc as JSON — readable with any SQLite tool
// (`SELECT json_extract(data, '$.title') FROM posts`). Every save
// rewrites the file; before writing, the remote file's hash is checked
// against the one we loaded: changed → the other editor's version is
// reloaded and our change rebased onto it, or refused (DocConflictError)
// when it touched the same document.

export type SqliteFileConfig = SqliteFileRuntimeConfig["sqlite"];
export { SqlitePassphraseError };

const FORMAT_VERSION = "1";
const MAX_REBASES = 3;

// ─── Per-browser secrets ─────────────────────────────────────────────────

const CONNECTOR_SECRETS_KEY = "agentcms.sqliteConnectorSecrets";
const DOC_SECRETS_KEY = "agentcms.sqliteDocSecrets";
const PASSPHRASE_KEY = "agentcms.sqlitePassphrase";

function readJson<T>(key: string, fallback: T): T {
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function writeJson(key: string, value: unknown): void {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Storage blocked — secrets won't survive a reload.
  }
}

// Splits connector settings into what can be published (config.js) and
// what stays in this browser.
export function splitConnectorSettings(settings: Record<string, unknown>): {
  publicSettings: Record<string, unknown>;
  secrets: Record<string, unknown>;
} {
  const { clean, secrets } = splitSecrets(settings);
  return { publicSettings: clean, secrets: secrets ?? {} };
}

export function saveSqliteConnectorSecrets(secrets: Record<string, unknown>): void {
  writeJson(CONNECTOR_SECRETS_KEY, secrets);
}

// Passphrase of an encrypted database, kept in this browser only.
export function getSqlitePassphrase(): string | null {
  try {
    return window.localStorage.getItem(PASSPHRASE_KEY);
  } catch {
    return null;
  }
}

export function saveSqlitePassphrase(passphrase: string | null): void {
  try {
    if (passphrase) window.localStorage.setItem(PASSPHRASE_KEY, passphrase);
    else window.localStorage.removeItem(PASSPHRASE_KEY);
  } catch {
    // Storage blocked — the passphrase won't survive a reload.
  }
}

// Plain SQLite bytes of a database file, decrypting it when needed.
// Returns the encryption parameters to reuse when saving it again.
export async function openDatabaseBytes(
  bytes: Uint8Array,
  passphrase: string | null,
): Promise<{ plain: Uint8Array; params: EncryptionParams | null }> {
  if (!isEncryptedDatabase(bytes)) return { plain: bytes, params: null };
  return { plain: await decryptDatabase(bytes, passphrase), params: encryptionParams(bytes) };
}

export function connectorSettingsWithSecrets(cfg: SqliteFileConfig): Record<string, unknown> {
  return { ...cfg.settings, ...readJson<Record<string, unknown>>(CONNECTOR_SECRETS_KEY, {}) };
}

// ─── sql.js ──────────────────────────────────────────────────────────────

let sqlPromise: Promise<SqlJsStatic> | null = null;
let nodeWasmBinary: Uint8Array | null = null;

// Node only (the agentcms CLI): the WASM bytes to use instead of letting
// sql.js resolve its file next to itself, which a bundle can't do.
export function setSqlJsWasmBinary(bytes: Uint8Array): void {
  nodeWasmBinary = bytes;
}

// Lazy: the ~1 MB WASM only loads for this backend.
function loadSql(): Promise<SqlJsStatic> {
  if (!sqlPromise) {
    sqlPromise = (async () => {
      const { default: initSqlJs } = await import("sql.js");
      const isBrowser = typeof window !== "undefined" && typeof document !== "undefined";
      // Node: tests load the WASM from node_modules, the CLI passes its bytes.
      if (!isBrowser) return initSqlJs(nodeWasmBinary ? { wasmBinary: nodeWasmBinary.slice().buffer as ArrayBuffer } : undefined);
      const { default: wasmUrl } = await import("sql.js/dist/sql-wasm.wasm?url");
      return initSqlJs({ locateFile: () => wasmUrl });
    })().catch((err) => {
      sqlPromise = null;
      throw err;
    });
  }
  return sqlPromise;
}

export async function decodeDatabase(bytes: Uint8Array): Promise<Snapshot> {
  const SQL = await loadSql();
  const db: Database = new SQL.Database(bytes);
  try {
    const snapshot = emptySnapshot();
    const tables = new Set(
      (db.exec("SELECT name FROM sqlite_master WHERE type = 'table'")[0]?.values ?? []).map((r) => String(r[0])),
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

export async function encodeDatabase(snapshot: Snapshot): Promise<Uint8Array> {
  const SQL = await loadSql();
  const db: Database = new SQL.Database();
  try {
    db.run("CREATE TABLE meta (key TEXT PRIMARY KEY, value TEXT NOT NULL)");
    db.run("INSERT INTO meta VALUES ('format', 'agentcms'), ('version', ?), ('savedAt', ?)", [
      FORMAT_VERSION,
      new Date().toISOString(),
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

async function hashBytes(bytes: Uint8Array | null): Promise<string> {
  if (!bytes) return "missing";
  const digest = await crypto.subtle.digest("SHA-256", bytes as BufferSource);
  return [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

// Secret fields of config docs (publish target keys) are kept out of
// the file and merged back from this browser.
function stripDocSecrets(snapshot: Snapshot): { clean: Snapshot; secrets: SecretBag } {
  const clean = Object.fromEntries(COLLECTIONS.map((c) => [c, new Map(snapshot[c])])) as Snapshot;
  const secrets: SecretBag = {};
  for (const doc of snapshot.config.values()) {
    const split = splitSecrets(doc);
    if (split.secrets) {
      secrets[`config/${doc.id}`] = split.secrets;
      clean.config.set(doc.id, split.clean as typeof doc);
    }
  }
  return { clean, secrets };
}

function applyOnto(base: Snapshot, mutations: DocMutation[]): Snapshot {
  const next = Object.fromEntries(COLLECTIONS.map((c) => [c, new Map(base[c])])) as Snapshot;
  for (const m of mutations) {
    if (m.op === "set") next[m.collection].set(m.doc.id, m.doc);
    else next[m.collection].delete(m.id);
  }
  return next;
}

export interface SqliteFileDocStore extends DocStore {
  resetSession(): void;
  // Why the last load couldn't open an encrypted file, if it couldn't.
  passphraseProblem(): "missing" | "wrong" | null;
  // The file is (or will be, on next save) encrypted.
  isEncrypted(): boolean;
  // Re-saves the database encrypted with a NEW passphrase (fresh salt):
  // turns encryption on for a plain file, or changes the passphrase.
  // Other browsers are asked for the new one on their next load.
  rekey(passphrase: string): Promise<void>;
}

export function createSqliteFileDocStore(cfg: SqliteFileConfig): SqliteFileDocStore {
  let lastHash: string | null = null;
  let connector: StorageConnector | null = null;
  // Salt / iterations of the encrypted file as loaded (kept on save).
  let cryptoParams: EncryptionParams | null = null;
  let passphraseProblem: "missing" | "wrong" | null = null;
  let encrypted = !!cfg.encrypted;
  // After a rebase our file carries changes the core hasn't seen yet.
  let stale = false;

  function open(): StorageConnector {
    if (!connector) connector = instantiateStorageConnector(cfg.connectorId, connectorSettingsWithSecrets(cfg));
    return connector;
  }

  async function readRemote(): Promise<{ snapshot: Snapshot; hash: string }> {
    const c = open();
    if (!c.getBytes) throw new StorageError(i18n.t("docstore.errors.sqliteUnsupported", { connector: cfg.connectorId }), 501);
    const bytes = await c.getBytes(cfg.path);
    let snapshot = emptySnapshot();
    if (bytes) {
      const opened = await openDatabaseBytes(bytes, getSqlitePassphrase());
      if (opened.params) cryptoParams = opened.params;
      snapshot = await decodeDatabase(opened.plain);
    }
    mergeSecrets(snapshot, readJson<SecretBag>(DOC_SECRETS_KEY, {}));
    return { snapshot, hash: await hashBytes(bytes) };
  }

  async function writeRemote(snapshot: Snapshot): Promise<void> {
    const { clean, secrets } = stripDocSecrets(snapshot);
    writeJson(DOC_SECRETS_KEY, secrets);
    const plain = await encodeDatabase(clean);
    // An encrypted file stays encrypted even if config.js lost the flag.
    const encrypt = encrypted || cryptoParams !== null;
    const bytes = encrypt ? await encryptDatabase(plain, getSqlitePassphrase() ?? "", cryptoParams ?? undefined) : plain;
    await open().put({ path: cfg.path, content: bytesToBase64(bytes), encoding: "base64" });
    lastHash = await hashBytes(bytes);
  }

  const store = createDocStore({
    kind: "sqlite-file",
    pollIntervalMs: 60_000,

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
        // Someone else saved meanwhile: rebase unless they touched one
        // of the documents we're writing.
        for (const m of mutations) {
          const id = m.op === "set" ? m.doc.id : m.id;
          const base = JSON.stringify(before[m.collection].get(id) ?? null);
          const theirs = JSON.stringify(remote.snapshot[m.collection].get(id) ?? null);
          if (base !== theirs) {
            lastHash = remote.hash;
            stale = true;
            throw new DocConflictError(i18n.t("docstore.errors.conflict"), m.collection, id);
          }
        }
        if (attempt >= MAX_REBASES) throw new DocConflictError(i18n.t("docstore.errors.conflict"), mutations[0].collection, "");
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
      // Opening the file proves the passphrase (an encrypted file is
      // detected even when config.js lost the flag).
      try {
        await store.ready();
        passphraseProblem = null;
      } catch (err) {
        if (err instanceof SqlitePassphraseError) {
          passphraseProblem = err.reason;
          return null;
        }
        // Other load errors surface in the admin as usual.
      }
      return { uid: "admin", email: "admin@localhost", displayName: "Admin", role: "admin" };
    },
  });

  return Object.assign(store, {
    passphraseProblem: () => passphraseProblem,
    isEncrypted: () => encrypted || cryptoParams !== null,
    async rekey(passphrase: string) {
      if (passphrase.trim().length < 12) throw new Error("The passphrase must be at least 12 characters long.");
      await store.ready();
      // Latest remote content, opened with the current passphrase.
      const remote = await readRemote();
      const previous = getSqlitePassphrase();
      saveSqlitePassphrase(passphrase.trim());
      const previousParams = cryptoParams;
      cryptoParams = null;
      try {
        encrypted = true;
        await writeRemote(remote.snapshot);
        // Keep the salt of what we just wrote for the next saves.
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
    },
  });
}
