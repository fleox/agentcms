import { createRequire as __acmsRequire } from "node:module";
import { fileURLToPath as __acmsPath } from "node:url";
import { dirname as __acmsDirname } from "node:path";
const require2 = __acmsRequire(import.meta.url);
const __filename = __acmsPath(import.meta.url);
const __dirname = __acmsDirname(__filename);
import { d as getActiveStorageConnector } from "./registry-Bhq3fghS.mjs";
import "./index-YdkzfKAt.mjs";
import "./toast-CYyyaSAW.mjs";
import "./runtimeConfig-BNLCrrQo.mjs";
import "./index.node-DYLwqGPq.mjs";
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
import "./firebaseClient-BjUVAcKz.mjs";
import "./index-CuB-ym-g.mjs";
import "./index-CjBqWaZn.mjs";
import "./gitStore-BkclOUWu.mjs";
import "./index-B4uHS09W.mjs";
import "./types-DAD44Ttj.mjs";
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
let open = null;
function normalizePrefix(path) {
  return path.replace(/^\/+|\/+$/g, "");
}
function isUnder(path, prefix) {
  return path === prefix || path.startsWith(prefix + "/");
}
function currentBatch() {
  return open;
}
function stagePut(batch, input) {
  batch.files.set(input.path, { type: "put", ...input });
}
function stageDelete(batch, path) {
  batch.files.set(path, { type: "delete", path });
}
function stageDeletePrefix(batch, path) {
  const prefix = normalizePrefix(path);
  for (const key of [...batch.files.keys()]) {
    if (isUnder(key, prefix)) batch.files.delete(key);
  }
  batch.prefixes.add(prefix);
}
function readStaged(batch, path) {
  const op = batch.files.get(path);
  if (op?.type === "put") {
    if (op.encoding !== "base64") return { kind: "content", content: op.content };
    const bytes = Uint8Array.from(atob(op.content), (c) => c.charCodeAt(0));
    return { kind: "content", content: new TextDecoder().decode(bytes) };
  }
  if (op?.type === "delete") return { kind: "deleted" };
  for (const prefix of batch.prefixes) {
    if (isUnder(path, prefix)) return { kind: "deleted" };
  }
  return null;
}
function collectOps(batch) {
  const ops = [];
  for (const path of batch.prefixes) ops.push({ type: "deletePrefix", path });
  for (const op of batch.files.values()) ops.push(op);
  return ops;
}
const IMPLICIT_IDLE_MS = 1500;
let implicit = null;
function scheduleImplicitFlush() {
  if (!implicit) return;
  if (implicit.timer) clearTimeout(implicit.timer);
  implicit.timer = setTimeout(() => void flushImplicitBatch(), IMPLICIT_IDLE_MS);
}
function implicitBatchFor(connector) {
  if (!implicit || implicit.connector !== connector) {
    implicit = { connector, depth: 0, files: /* @__PURE__ */ new Map(), prefixes: /* @__PURE__ */ new Set(), timer: null, flushing: null };
  }
  scheduleImplicitFlush();
  return implicit;
}
function pendingImplicitBatch() {
  return implicit;
}
async function flushImplicitBatch() {
  const batch = implicit;
  if (!batch) return;
  if (batch.timer) clearTimeout(batch.timer);
  implicit = null;
  const ops = collectOps(batch);
  if (ops.length === 0) return;
  try {
    await batch.connector.commitBatch(ops);
  } catch (err) {
    console.error("[storage] deferred commit failed:", err);
  }
}
if (typeof window !== "undefined" && typeof window.addEventListener === "function") {
  window.addEventListener("beforeunload", (e) => {
    if (implicit && (implicit.files.size > 0 || implicit.prefixes.size > 0)) {
      void flushImplicitBatch();
      e.preventDefault();
    }
  });
}
async function withStorageBatch(fn) {
  const connector = await getActiveStorageConnector();
  if (!connector.commitBatch) return fn();
  await flushImplicitBatch();
  if (!open) open = { connector, depth: 0, files: /* @__PURE__ */ new Map(), prefixes: /* @__PURE__ */ new Set() };
  const batch = open;
  batch.depth++;
  let failed = false;
  let error;
  let result;
  try {
    result = await fn();
  } catch (err) {
    failed = true;
    error = err;
  }
  batch.depth--;
  if (batch.depth === 0) {
    open = null;
    const ops = collectOps(batch);
    if (ops.length > 0) {
      try {
        await batch.connector.commitBatch(ops);
      } catch (commitErr) {
        if (!failed) throw commitErr;
        console.error("[storage] batch commit failed after an earlier error:", commitErr);
      }
    }
  }
  if (failed) throw error;
  return result;
}
export {
  IMPLICIT_IDLE_MS,
  currentBatch,
  flushImplicitBatch,
  implicitBatchFor,
  pendingImplicitBatch,
  readStaged,
  stageDelete,
  stageDeletePrefix,
  stagePut,
  withStorageBatch
};
