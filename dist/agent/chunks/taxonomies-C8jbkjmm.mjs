import { createRequire as __acmsRequire } from "node:module";
import { fileURLToPath as __acmsPath } from "node:url";
import { dirname as __acmsDirname } from "node:path";
const require2 = __acmsRequire(import.meta.url);
const __filename = __acmsPath(import.meta.url);
const __dirname = __acmsDirname(__filename);
import { getBackendKind, isDocStoreBackend } from "./runtimeConfig-2M2d2Pbu.mjs";
import { $ as setDoc, J as deleteDoc, Z as query, Y as orderBy, P as getDocs, X as onSnapshot, a1 as updateDoc, _ as serverTimestamp, d as doc, a4 as collections, a5 as getDb, z as collection } from "./firebaseClient-D3fvED27.mjs";
import { v as newDocId, g as getDocStore, w as toTimestamp } from "./registry-QpZDUKmd.mjs";
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
const termsCollection = () => collection(getDb(), collections.terms);
const termDoc = (id) => doc(getDb(), collections.terms, id);
function newId() {
  if (typeof crypto !== "undefined" && crypto.randomUUID) return crypto.randomUUID();
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}
function subscribeToTerms$2(onChange, onError) {
  const q = query(termsCollection(), orderBy("name", "asc"));
  return onSnapshot(
    q,
    (snap) => onChange(snap.docs.map((d) => ({ id: d.id, ...d.data() }))),
    onError
  );
}
async function fetchAllTerms$2() {
  const q = query(termsCollection(), orderBy("name", "asc"));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}
async function createTerm$2(input) {
  const id = newId();
  const data = {
    type: input.type,
    name: input.name,
    slug: input.slug,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  };
  if (input.description) data.description = input.description;
  if (input.parentId) data.parentId = input.parentId;
  await setDoc(termDoc(id), data);
  return id;
}
async function updateTerm$2(id, patch) {
  const update = { updatedAt: serverTimestamp() };
  for (const [key, value] of Object.entries(patch)) {
    if (value === void 0) continue;
    update[key] = value;
  }
  await updateDoc(termDoc(id), update);
}
async function deleteTerm$2(id) {
  await deleteDoc(termDoc(id));
}
const firebase = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  createTerm: createTerm$2,
  deleteTerm: deleteTerm$2,
  fetchAllTerms: fetchAllTerms$2,
  subscribeToTerms: subscribeToTerms$2,
  updateTerm: updateTerm$2
}, Symbol.toStringTag, { value: "Module" }));
const COLLECTION = "terms";
function hasSeo(seo) {
  if (!seo || typeof seo !== "object") return false;
  const s = seo;
  return !!(s.title || s.description || s.ogImage);
}
function docToTerm(d) {
  const term = {
    id: d.id,
    type: d.type,
    name: d.name ?? "",
    slug: d.slug ?? "",
    createdAt: toTimestamp(d.createdAt ?? 0),
    updatedAt: toTimestamp(d.updatedAt ?? d.createdAt ?? 0)
  };
  if (d.description) term.description = d.description;
  if (d.parentId) term.parentId = d.parentId;
  if (d.lastPublishedPath) term.lastPublishedPath = d.lastPublishedPath;
  if (d.translations && typeof d.translations === "object" && Object.keys(d.translations).length > 0) {
    term.translations = JSON.parse(JSON.stringify(d.translations));
  }
  if (hasSeo(d.seo)) term.seo = { ...d.seo };
  return term;
}
function compareName(a, b) {
  return a.name < b.name ? -1 : a.name > b.name ? 1 : 0;
}
function listTerms() {
  return getDocStore().list(COLLECTION).map(docToTerm).sort(compareName);
}
function label(d) {
  return `${d.type === "tag" ? "tag" : "category"}: ${d.name || d.id}`;
}
function subscribeToTerms$1(onChange, onError) {
  let cancelled = false;
  let unsubscribe = null;
  const emit = () => {
    try {
      onChange(listTerms());
    } catch (err) {
      onError?.(err);
    }
  };
  try {
    const store = getDocStore();
    store.ready().then(
      () => {
        if (cancelled) return;
        unsubscribe = store.subscribe((changed) => {
          if (changed.has(COLLECTION)) emit();
        });
        emit();
      },
      (err) => {
        if (!cancelled) onError?.(err);
      }
    );
  } catch (err) {
    onError?.(err);
  }
  return () => {
    cancelled = true;
    unsubscribe?.();
  };
}
async function fetchAllTerms$1() {
  await getDocStore().ready();
  return listTerms();
}
async function createTerm$1(input) {
  const id = newDocId();
  const now = Date.now();
  const doc2 = {
    id,
    type: input.type,
    name: input.name,
    slug: input.slug,
    createdAt: now,
    updatedAt: now
  };
  if (input.description) doc2.description = input.description;
  if (input.parentId) doc2.parentId = input.parentId;
  const store = getDocStore();
  await store.ready();
  await store.write([{ op: "set", collection: COLLECTION, doc: doc2 }], {
    message: `Create ${label(doc2)}`
  });
  return id;
}
async function updateTerm$1(id, patch) {
  const store = getDocStore();
  await store.ready();
  const existing = store.get(COLLECTION, id);
  if (!existing) throw new Error(`Term not found: ${id}`);
  const next = { ...existing };
  const assign = (key, value, keep) => {
    if (value === void 0) return;
    if (value === null || !keep) delete next[key];
    else next[key] = value;
  };
  assign("name", patch.name, true);
  assign("slug", patch.slug, true);
  assign("description", patch.description, !!patch.description);
  assign("parentId", patch.parentId, !!patch.parentId);
  assign(
    "translations",
    patch.translations,
    !!patch.translations && Object.keys(patch.translations).length > 0
  );
  assign("seo", patch.seo, hasSeo(patch.seo));
  next.updatedAt = Date.now();
  await store.write([{ op: "set", collection: COLLECTION, doc: next }], {
    message: `Update ${label(next)}`
  });
}
async function deleteTerm$1(id) {
  const store = getDocStore();
  await store.ready();
  const existing = store.get(COLLECTION, id);
  if (!existing) return;
  await store.write([{ op: "delete", collection: COLLECTION, id }], {
    message: `Delete ${label(existing)}`
  });
}
const docstore = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  createTerm: createTerm$1,
  deleteTerm: deleteTerm$1,
  fetchAllTerms: fetchAllTerms$1,
  subscribeToTerms: subscribeToTerms$1,
  updateTerm: updateTerm$1
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
function subscribeToTerms(...args) {
  return impl().subscribeToTerms(...args);
}
function fetchAllTerms(...args) {
  return impl().fetchAllTerms(...args);
}
function createTerm(...args) {
  return impl().createTerm(...args);
}
function updateTerm(...args) {
  return impl().updateTerm(...args);
}
function deleteTerm(...args) {
  return impl().deleteTerm(...args);
}
export {
  createTerm,
  deleteTerm,
  fetchAllTerms,
  subscribeToTerms,
  updateTerm
};
