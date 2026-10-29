import { createRequire as __acmsRequire } from "node:module";
import { fileURLToPath as __acmsPath } from "node:url";
import { dirname as __acmsDirname } from "node:path";
const require2 = __acmsRequire(import.meta.url);
const __filename = __acmsPath(import.meta.url);
const __dirname = __acmsDirname(__filename);
import { getBackendKind, isDocStoreBackend } from "./runtimeConfig-2M2d2Pbu.mjs";
import { a2 as where, O as getCountFromServer, Z as query, _ as serverTimestamp, $ as setDoc, J as deleteDoc, P as getDocs, a1 as updateDoc, X as onSnapshot, Y as orderBy, z as collection, a4 as collections, a5 as getDb, d as doc, a0 as startAfter, W as limit } from "./firebaseClient-D3fvED27.mjs";
import { g as getDocStore, v as newDocId, w as toTimestamp } from "./registry-DMuFJNAR.mjs";
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
import "./gitStore-Bmv5JU5m.mjs";
import "./index-CPPISFvW.mjs";
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
const postsCollection = () => collection(getDb(), collections.posts);
const postDoc = (id) => doc(getDb(), collections.posts, id);
function newId() {
  if (typeof crypto !== "undefined" && crypto.randomUUID) return crypto.randomUUID();
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}
function subscribeToPosts$2(onChange, onError) {
  return onSnapshot(
    query(postsCollection(), orderBy("createdAt", "desc")),
    (snap) => {
      const posts = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      primeAllPostsCache$2(posts);
      onChange(posts);
    },
    onError
  );
}
async function createPost$2(input) {
  const id = newId();
  const data = {
    type: input.type,
    title: input.title,
    slug: input.slug,
    contentMarkdown: input.contentMarkdown ?? "",
    authorId: input.authorId,
    termIds: input.termIds ?? [],
    status: "draft",
    createdAt: input.createdAt ?? serverTimestamp(),
    updatedAt: serverTimestamp()
  };
  if (input.excerpt) data.excerpt = input.excerpt;
  if (input.heroMediaId) data.heroMediaId = input.heroMediaId;
  if (input.primaryTermId) data.primaryTermId = input.primaryTermId;
  if (input.seo) data.seo = input.seo;
  if (input.publishedAt) data.publishedAt = input.publishedAt;
  if (input.translations && Object.keys(input.translations).length > 0) {
    data.translations = input.translations;
  }
  await setDoc(postDoc(id), data);
  invalidateAllPostsCache$2();
  return id;
}
async function updatePost$2(id, patch) {
  const update = { updatedAt: serverTimestamp() };
  for (const [key, value] of Object.entries(patch)) {
    if (value === void 0) continue;
    update[key] = value;
  }
  await updateDoc(postDoc(id), update);
  invalidateAllPostsCache$2();
}
async function markPostOnline$2(id, fields) {
  await updateDoc(postDoc(id), {
    status: "online",
    publishedAt: fields.publishedAt ?? serverTimestamp(),
    lastPublishedPath: fields.lastPublishedPath,
    lastPublishedHash: fields.lastPublishedHash,
    previousPublishedPaths: fields.previousPublishedPaths ?? [],
    updatedAt: serverTimestamp()
  });
  invalidateAllPostsCache$2();
}
async function markPostDraft$2(id) {
  await updateDoc(postDoc(id), {
    status: "draft",
    lastPublishedPath: null,
    lastPublishedHash: null,
    previousPublishedPaths: [],
    updatedAt: serverTimestamp()
  });
  invalidateAllPostsCache$2();
}
async function deletePost$2(id) {
  await deleteDoc(postDoc(id));
  invalidateAllPostsCache$2();
}
function buildPaginatedQuery(opts) {
  const constraints = [where("type", "==", opts.type)];
  if (opts.status) constraints.push(where("status", "==", opts.status));
  constraints.push(orderBy("createdAt", "desc"));
  if (opts.cursor) constraints.push(startAfter(opts.cursor));
  constraints.push(limit(opts.pageSize));
  return query(postsCollection(), ...constraints);
}
function subscribeToPostsPaginated$2(opts, onChange, onError) {
  return onSnapshot(
    buildPaginatedQuery(opts),
    (snap) => {
      const posts = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      const nextCursor = snap.docs.length === opts.pageSize ? snap.docs[snap.docs.length - 1] : void 0;
      onChange({ posts, nextCursor });
    },
    onError
  );
}
const CACHE_TTL_MS$1 = 3e4;
let cache$1 = null;
let inFlight$1 = null;
function filterFromCorpus$1(corpus, type) {
  return corpus.filter((p) => p.type === type).sort((a, b) => {
    const am = a.createdAt?.toMillis?.() ?? 0;
    const bm = b.createdAt?.toMillis?.() ?? 0;
    return bm - am;
  });
}
async function fetchAllPosts$2(opts) {
  const now = Date.now();
  if (cache$1 && cache$1.expiresAt > now) {
    return filterFromCorpus$1(cache$1.corpus, opts.type);
  }
  if (inFlight$1) {
    const corpus2 = await inFlight$1;
    return filterFromCorpus$1(corpus2, opts.type);
  }
  inFlight$1 = (async () => {
    try {
      const snap = await getDocs(query(postsCollection()));
      const corpus2 = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      cache$1 = {
        corpus: corpus2,
        expiresAt: Date.now() + CACHE_TTL_MS$1,
        fromSubscription: false
      };
      return corpus2;
    } finally {
      inFlight$1 = null;
    }
  })();
  const corpus = await inFlight$1;
  return filterFromCorpus$1(corpus, opts.type);
}
function primeAllPostsCache$2(corpus) {
  cache$1 = {
    corpus,
    // Far-future expiry — the subscription itself owns freshness.
    expiresAt: Number.POSITIVE_INFINITY,
    fromSubscription: true
  };
}
function invalidateAllPostsCache$2() {
  cache$1 = null;
}
async function countPosts$2(opts) {
  const constraints = [where("type", "==", opts.type)];
  if (opts.status) constraints.push(where("status", "==", opts.status));
  const snap = await getCountFromServer(query(postsCollection(), ...constraints));
  return snap.data().count;
}
const firebase = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  countPosts: countPosts$2,
  createPost: createPost$2,
  deletePost: deletePost$2,
  fetchAllPosts: fetchAllPosts$2,
  invalidateAllPostsCache: invalidateAllPostsCache$2,
  markPostDraft: markPostDraft$2,
  markPostOnline: markPostOnline$2,
  primeAllPostsCache: primeAllPostsCache$2,
  subscribeToPosts: subscribeToPosts$2,
  subscribeToPostsPaginated: subscribeToPostsPaginated$2,
  updatePost: updatePost$2
}, Symbol.toStringTag, { value: "Module" }));
const COLLECTION = "posts";
function isNonEmptyObject(v) {
  return !!v && typeof v === "object" && !Array.isArray(v) && Object.keys(v).length > 0;
}
function docToPost(d) {
  const post = {
    id: d.id,
    type: d.type,
    title: d.title ?? "",
    slug: d.slug ?? "",
    contentMarkdown: d.contentMarkdown ?? "",
    authorId: d.authorId ?? "",
    termIds: Array.isArray(d.termIds) ? [...d.termIds] : [],
    status: d.status ?? "draft",
    createdAt: toTimestamp(d.createdAt ?? 0),
    updatedAt: toTimestamp(d.updatedAt ?? d.createdAt ?? 0)
  };
  if (d.excerpt) post.excerpt = d.excerpt;
  if (d.heroMediaId) post.heroMediaId = d.heroMediaId;
  if (d.primaryTermId) post.primaryTermId = d.primaryTermId;
  if (d.seo && typeof d.seo === "object") post.seo = { ...d.seo };
  if (d.publishedAt) post.publishedAt = toTimestamp(d.publishedAt);
  if (d.lastPublishedPath) post.lastPublishedPath = d.lastPublishedPath;
  if (Array.isArray(d.previousPublishedPaths) && d.previousPublishedPaths.length > 0) {
    post.previousPublishedPaths = [...d.previousPublishedPaths];
  }
  if (d.lastPublishedHash) post.lastPublishedHash = d.lastPublishedHash;
  if (d.legacyUrl) post.legacyUrl = d.legacyUrl;
  if (isNonEmptyObject(d.translations)) {
    post.translations = JSON.parse(JSON.stringify(d.translations));
  }
  if (isNonEmptyObject(d.lastPublishedPathsByLocale)) {
    post.lastPublishedPathsByLocale = { ...d.lastPublishedPathsByLocale };
  }
  return post;
}
function createdMillis(p) {
  return p.createdAt?.toMillis?.() ?? 0;
}
function compareCreatedDesc(a, b) {
  const diff = createdMillis(b) - createdMillis(a);
  if (diff !== 0) return diff;
  return a.id < b.id ? 1 : a.id > b.id ? -1 : 0;
}
async function readAll() {
  const store = getDocStore();
  await store.ready();
  return store.list(COLLECTION).map(docToPost).sort(compareCreatedDesc);
}
async function requireDoc(id) {
  const store = getDocStore();
  await store.ready();
  const existing = store.get(COLLECTION, id);
  if (!existing) throw new Error(`Post not found: ${id}`);
  return existing;
}
function label(d) {
  return `${d.type === "page" ? "page" : "post"}: ${d.title || d.id}`;
}
function subscribeToStore(compute, onChange, onError) {
  let cancelled = false;
  let unsubscribe = null;
  const emit = () => {
    try {
      onChange(compute());
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
function subscribeToPosts$1(onChange, onError) {
  return subscribeToStore(
    () => {
      const posts = getDocStore().list(COLLECTION).map(docToPost).sort(compareCreatedDesc);
      primeAllPostsCache$1(posts);
      return posts;
    },
    onChange,
    onError
  );
}
async function createPost$1(input) {
  const id = newDocId();
  const now = Date.now();
  const doc2 = {
    id,
    type: input.type,
    title: input.title,
    slug: input.slug,
    contentMarkdown: input.contentMarkdown ?? "",
    authorId: input.authorId,
    termIds: input.termIds ?? [],
    status: "draft",
    createdAt: input.createdAt ? input.createdAt.getTime() : now,
    updatedAt: now
  };
  if (input.excerpt) doc2.excerpt = input.excerpt;
  if (input.heroMediaId) doc2.heroMediaId = input.heroMediaId;
  if (input.primaryTermId) doc2.primaryTermId = input.primaryTermId;
  if (input.seo) doc2.seo = input.seo;
  if (input.publishedAt) doc2.publishedAt = input.publishedAt.getTime();
  if (isNonEmptyObject(input.translations)) doc2.translations = input.translations;
  const store = getDocStore();
  await store.ready();
  const write = store.write([{ op: "set", collection: COLLECTION, doc: doc2 }], {
    message: `Create ${label(doc2)}`
  });
  invalidateAllPostsCache$1();
  await write;
  invalidateAllPostsCache$1();
  return id;
}
const UPDATABLE_FIELDS = [
  "title",
  "authorId",
  "slug",
  "contentMarkdown",
  "excerpt",
  "heroMediaId",
  "termIds",
  "primaryTermId",
  "seo",
  "createdAt",
  "publishedAt",
  "translations",
  "lastPublishedPathsByLocale"
];
async function updatePost$1(id, patch) {
  const existing = await requireDoc(id);
  const next = { ...existing };
  for (const key of UPDATABLE_FIELDS) {
    const value = patch[key];
    if (value === void 0) continue;
    if (value === null) {
      delete next[key];
    } else if (value instanceof Date) {
      next[key] = value.getTime();
    } else if ((key === "translations" || key === "lastPublishedPathsByLocale") && !isNonEmptyObject(value)) {
      delete next[key];
    } else {
      next[key] = value;
    }
  }
  next.updatedAt = Date.now();
  await writeAndInvalidate(next, `Update ${label(next)}`);
}
async function markPostOnline$1(id, fields) {
  const existing = await requireDoc(id);
  const now = Date.now();
  const next = {
    ...existing,
    status: "online",
    publishedAt: fields.publishedAt ? fields.publishedAt.getTime() : now,
    lastPublishedPath: fields.lastPublishedPath,
    lastPublishedHash: fields.lastPublishedHash,
    previousPublishedPaths: fields.previousPublishedPaths ?? [],
    updatedAt: now
  };
  await writeAndInvalidate(next, `Publish ${label(next)}`);
}
async function markPostDraft$1(id) {
  const existing = await requireDoc(id);
  const next = {
    ...existing,
    status: "draft",
    previousPublishedPaths: [],
    updatedAt: Date.now()
  };
  delete next.lastPublishedPath;
  delete next.lastPublishedHash;
  await writeAndInvalidate(next, `Unpublish ${label(next)}`);
}
async function deletePost$1(id) {
  const store = getDocStore();
  await store.ready();
  const existing = store.get(COLLECTION, id);
  if (existing) {
    const write = store.write([{ op: "delete", collection: COLLECTION, id }], {
      message: `Delete ${label(existing)}`
    });
    invalidateAllPostsCache$1();
    await write;
  }
  invalidateAllPostsCache$1();
}
async function writeAndInvalidate(doc2, message) {
  const write = getDocStore().write([{ op: "set", collection: COLLECTION, doc: doc2 }], { message });
  invalidateAllPostsCache$1();
  await write;
  invalidateAllPostsCache$1();
}
function makeCursor(post) {
  const stub = { __docStoreCursor: true, createdAtMillis: createdMillis(post), id: post.id };
  return stub;
}
function readCursor(cursor) {
  const stub = cursor;
  return stub?.__docStoreCursor && typeof stub.createdAtMillis === "number" && typeof stub.id === "string" ? stub : null;
}
function computePage(all, opts) {
  let matching = all.filter((p) => p.type === opts.type && (!opts.status || p.status === opts.status));
  const cursor = readCursor(opts.cursor);
  if (cursor) {
    const boundary = {
      id: cursor.id,
      createdAt: { toMillis: () => cursor.createdAtMillis }
    };
    matching = matching.filter((p) => compareCreatedDesc(boundary, p) < 0);
  }
  const posts = matching.slice(0, opts.pageSize);
  const hasNext = matching.length > opts.pageSize;
  return {
    posts,
    nextCursor: hasNext && posts.length > 0 ? makeCursor(posts[posts.length - 1]) : void 0
  };
}
function subscribeToPostsPaginated$1(opts, onChange, onError) {
  return subscribeToStore(
    () => computePage(getDocStore().list(COLLECTION).map(docToPost).sort(compareCreatedDesc), opts),
    onChange,
    onError
  );
}
const CACHE_TTL_MS = 3e4;
let cache = null;
let inFlight = null;
function filterFromCorpus(corpus, type) {
  return corpus.filter((p) => p.type === type).sort((a, b) => {
    const am = a.createdAt?.toMillis?.() ?? 0;
    const bm = b.createdAt?.toMillis?.() ?? 0;
    return bm - am;
  });
}
async function fetchAllPosts$1(opts) {
  const now = Date.now();
  if (cache && cache.expiresAt > now) {
    return filterFromCorpus(cache.corpus, opts.type);
  }
  if (inFlight) {
    const corpus2 = await inFlight;
    return filterFromCorpus(corpus2, opts.type);
  }
  inFlight = (async () => {
    try {
      const corpus2 = await readAll();
      cache = {
        corpus: corpus2,
        expiresAt: Date.now() + CACHE_TTL_MS,
        fromSubscription: false
      };
      return corpus2;
    } finally {
      inFlight = null;
    }
  })();
  const corpus = await inFlight;
  return filterFromCorpus(corpus, opts.type);
}
function primeAllPostsCache$1(corpus) {
  cache = {
    corpus,
    expiresAt: Number.POSITIVE_INFINITY,
    fromSubscription: true
  };
}
function invalidateAllPostsCache$1() {
  cache = null;
}
async function countPosts$1(opts) {
  const store = getDocStore();
  await store.ready();
  return store.list(COLLECTION).filter((d) => d.type === opts.type && (!opts.status || (d.status ?? "draft") === opts.status)).length;
}
const docstore = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  countPosts: countPosts$1,
  createPost: createPost$1,
  deletePost: deletePost$1,
  fetchAllPosts: fetchAllPosts$1,
  invalidateAllPostsCache: invalidateAllPostsCache$1,
  markPostDraft: markPostDraft$1,
  markPostOnline: markPostOnline$1,
  primeAllPostsCache: primeAllPostsCache$1,
  subscribeToPosts: subscribeToPosts$1,
  subscribeToPostsPaginated: subscribeToPostsPaginated$1,
  updatePost: updatePost$1
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
function subscribeToPosts(...args) {
  return impl().subscribeToPosts(...args);
}
function createPost(...args) {
  return impl().createPost(...args);
}
function updatePost(...args) {
  return impl().updatePost(...args);
}
function markPostOnline(...args) {
  return impl().markPostOnline(...args);
}
function markPostDraft(...args) {
  return impl().markPostDraft(...args);
}
function deletePost(...args) {
  return impl().deletePost(...args);
}
function subscribeToPostsPaginated(...args) {
  return impl().subscribeToPostsPaginated(...args);
}
function fetchAllPosts(...args) {
  return impl().fetchAllPosts(...args);
}
function primeAllPostsCache(...args) {
  return impl().primeAllPostsCache(...args);
}
function invalidateAllPostsCache(...args) {
  return impl().invalidateAllPostsCache(...args);
}
function countPosts(...args) {
  return impl().countPosts(...args);
}
export {
  countPosts,
  createPost,
  deletePost,
  fetchAllPosts,
  invalidateAllPostsCache,
  markPostDraft,
  markPostOnline,
  primeAllPostsCache,
  subscribeToPosts,
  subscribeToPostsPaginated,
  updatePost
};
