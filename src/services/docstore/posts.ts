// Document-store implementation of the posts service (shared by the
// "markdown-git" and "local" backends). Mirrors the function signatures
// of services/firebase/posts.ts so the top-level dispatcher can swap
// impls based on backend.
//
// The `posts` collection covers BOTH posts and pages (discriminated by
// `type`). Docs are stored camelCase with plain JSON values (termIds,
// seo, translations, …) and dates as epoch millis; docToPost converts
// them back to firebase `Timestamp`s at the boundary, like the SQLite
// impl does. The whole collection lives in memory, so queries (sort,
// filter, paging, counts) are plain array operations.

import type { DocumentData, QueryDocumentSnapshot } from "firebase/firestore";
import { getDocStore, newDocId, toTimestamp, type StoredDoc } from "./index";
import type { Post, PostStatus, PostType, SeoMeta } from "../../core/types";

const COLLECTION = "posts" as const;

function isNonEmptyObject(v: unknown): v is Record<string, unknown> {
  return !!v && typeof v === "object" && !Array.isArray(v) && Object.keys(v).length > 0;
}

function docToPost(d: StoredDoc): Post {
  const post: Post = {
    id: d.id,
    type: d.type as PostType,
    title: (d.title as string) ?? "",
    slug: (d.slug as string) ?? "",
    contentMarkdown: (d.contentMarkdown as string) ?? "",
    authorId: (d.authorId as string) ?? "",
    termIds: Array.isArray(d.termIds) ? [...(d.termIds as string[])] : [],
    status: (d.status as PostStatus) ?? "draft",
    createdAt: toTimestamp(d.createdAt ?? 0),
    updatedAt: toTimestamp(d.updatedAt ?? d.createdAt ?? 0),
  };
  if (d.excerpt) post.excerpt = d.excerpt as string;
  if (d.heroMediaId) post.heroMediaId = d.heroMediaId as string;
  if (d.primaryTermId) post.primaryTermId = d.primaryTermId as string;
  if (d.seo && typeof d.seo === "object") post.seo = { ...(d.seo as SeoMeta) };
  if (d.publishedAt) post.publishedAt = toTimestamp(d.publishedAt);
  if (d.lastPublishedPath) post.lastPublishedPath = d.lastPublishedPath as string;
  if (Array.isArray(d.previousPublishedPaths) && d.previousPublishedPaths.length > 0) {
    post.previousPublishedPaths = [...(d.previousPublishedPaths as string[])];
  }
  if (d.lastPublishedHash) post.lastPublishedHash = d.lastPublishedHash as string;
  if (d.legacyUrl) post.legacyUrl = d.legacyUrl as string;
  if (isNonEmptyObject(d.translations)) {
    // Deep copy: snapshot docs are frozen, callers may mutate the result.
    post.translations = JSON.parse(JSON.stringify(d.translations)) as Record<string, unknown>;
  }
  if (isNonEmptyObject(d.lastPublishedPathsByLocale)) {
    post.lastPublishedPathsByLocale = { ...(d.lastPublishedPathsByLocale as Record<string, string>) };
  }
  return post;
}

function createdMillis(p: Post): number {
  return p.createdAt?.toMillis?.() ?? 0;
}

// createdAt desc, id desc as a stable tie-breaker (paging needs a total
// order so a cursor never skips or repeats posts sharing a timestamp).
function compareCreatedDesc(a: Post, b: Post): number {
  const diff = createdMillis(b) - createdMillis(a);
  if (diff !== 0) return diff;
  return a.id < b.id ? 1 : a.id > b.id ? -1 : 0;
}

async function readAll(): Promise<Post[]> {
  const store = getDocStore();
  await store.ready();
  return store.list(COLLECTION).map(docToPost).sort(compareCreatedDesc);
}

async function requireDoc(id: string): Promise<StoredDoc> {
  const store = getDocStore();
  await store.ready();
  const existing = store.get(COLLECTION, id);
  if (!existing) throw new Error(`Post not found: ${id}`);
  return existing;
}

function label(d: StoredDoc): string {
  return `${d.type === "page" ? "page" : "post"}: ${(d.title as string) || d.id}`;
}

// Re-runs `compute` whenever the store reports a change to `posts`.
// Emits once after the initial load (like onSnapshot's first callback),
// then synchronously on every local write / rollback / remote pull.
function subscribeToStore<T>(
  compute: () => T,
  onChange: (data: T) => void,
  onError?: (err: Error) => void,
): () => void {
  let cancelled = false;
  let unsubscribe: (() => void) | null = null;
  const emit = () => {
    try {
      onChange(compute());
    } catch (err) {
      onError?.(err as Error);
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
        if (!cancelled) onError?.(err as Error);
      },
    );
  } catch (err) {
    onError?.(err as Error);
  }
  return () => {
    cancelled = true;
    unsubscribe?.();
  };
}

// ─── Global subscription (paginationMode = "global") ─────────────────
//
// Every post AND page ordered by `createdAt` desc — matches the
// Firebase shape (consumers filter by `type` in memory).
export function subscribeToPosts(
  onChange: (posts: Post[]) => void,
  onError?: (err: Error) => void,
): () => void {
  return subscribeToStore(
    () => {
      const posts = getDocStore().list(COLLECTION).map(docToPost).sort(compareCreatedDesc);
      primeAllPostsCache(posts);
      return posts;
    },
    onChange,
    onError,
  );
}

export interface CreatePostInput {
  type: PostType;
  title: string;
  slug: string;
  contentMarkdown?: string;
  excerpt?: string;
  heroMediaId?: string;
  authorId: string;
  termIds?: string[];
  primaryTermId?: string;
  seo?: SeoMeta;
  createdAt?: Date;
  publishedAt?: Date;
  translations?: Record<string, unknown>;
}

// The store applies the write to memory before persisting, so the new
// post is readable (and subscribers notified) before this resolves —
// the "create then navigate" flow never sees a missing post.
export async function createPost(input: CreatePostInput): Promise<string> {
  const id = newDocId();
  const now = Date.now();
  const doc: StoredDoc = {
    id,
    type: input.type,
    title: input.title,
    slug: input.slug,
    contentMarkdown: input.contentMarkdown ?? "",
    authorId: input.authorId,
    termIds: input.termIds ?? [],
    status: "draft",
    createdAt: input.createdAt ? input.createdAt.getTime() : now,
    updatedAt: now,
  };
  if (input.excerpt) doc.excerpt = input.excerpt;
  if (input.heroMediaId) doc.heroMediaId = input.heroMediaId;
  if (input.primaryTermId) doc.primaryTermId = input.primaryTermId;
  if (input.seo) doc.seo = input.seo;
  if (input.publishedAt) doc.publishedAt = input.publishedAt.getTime();
  if (isNonEmptyObject(input.translations)) doc.translations = input.translations;
  const store = getDocStore();
  await store.ready();
  const write = store.write([{ op: "set", collection: COLLECTION, doc }], {
    message: `Create ${label(doc)}`,
  });
  invalidateAllPostsCache();
  await write;
  invalidateAllPostsCache();
  return id;
}

export interface UpdatePostInput {
  authorId?: string;
  title?: string;
  slug?: string;
  contentMarkdown?: string;
  excerpt?: string | null;
  heroMediaId?: string | null;
  termIds?: string[];
  primaryTermId?: string | null;
  seo?: SeoMeta;
  createdAt?: Date;
  publishedAt?: Date;
  translations?: Record<string, unknown> | null;
  lastPublishedPathsByLocale?: Record<string, string> | null;
}

const UPDATABLE_FIELDS: ReadonlyArray<keyof UpdatePostInput> = [
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
  "lastPublishedPathsByLocale",
];

// Applies a partial patch: undefined = untouched, null = cleared (same
// as the SQLite NULL column), empty translation maps are dropped.
export async function updatePost(id: string, patch: UpdatePostInput): Promise<void> {
  const existing = await requireDoc(id);
  const next: StoredDoc = { ...existing };
  for (const key of UPDATABLE_FIELDS) {
    const value = patch[key];
    if (value === undefined) continue;
    if (value === null) {
      delete next[key];
    } else if (value instanceof Date) {
      next[key] = value.getTime();
    } else if (
      (key === "translations" || key === "lastPublishedPathsByLocale") &&
      !isNonEmptyObject(value)
    ) {
      delete next[key];
    } else {
      next[key] = value;
    }
  }
  next.updatedAt = Date.now();
  await writeAndInvalidate(next, `Update ${label(next)}`);
}

export async function markPostOnline(
  id: string,
  fields: {
    lastPublishedPath: string;
    lastPublishedHash: string;
    previousPublishedPaths?: string[];
    publishedAt?: Date;
  },
): Promise<void> {
  const existing = await requireDoc(id);
  const now = Date.now();
  const next: StoredDoc = {
    ...existing,
    status: "online",
    publishedAt: fields.publishedAt ? fields.publishedAt.getTime() : now,
    lastPublishedPath: fields.lastPublishedPath,
    lastPublishedHash: fields.lastPublishedHash,
    previousPublishedPaths: fields.previousPublishedPaths ?? [],
    updatedAt: now,
  };
  await writeAndInvalidate(next, `Publish ${label(next)}`);
}

// Keeps `publishedAt` and `lastPublishedPathsByLocale` (plugin-managed),
// exactly like the other impls.
export async function markPostDraft(id: string): Promise<void> {
  const existing = await requireDoc(id);
  const next: StoredDoc = {
    ...existing,
    status: "draft",
    previousPublishedPaths: [],
    updatedAt: Date.now(),
  };
  delete next.lastPublishedPath;
  delete next.lastPublishedHash;
  await writeAndInvalidate(next, `Unpublish ${label(next)}`);
}

// Deleting a missing post is a no-op (like Firestore's deleteDoc) — no
// empty commit on the git backend.
export async function deletePost(id: string): Promise<void> {
  const store = getDocStore();
  await store.ready();
  const existing = store.get(COLLECTION, id);
  if (existing) {
    const write = store.write([{ op: "delete", collection: COLLECTION, id }], {
      message: `Delete ${label(existing)}`,
    });
    invalidateAllPostsCache();
    await write;
  }
  invalidateAllPostsCache();
}

async function writeAndInvalidate(doc: StoredDoc, message: string): Promise<void> {
  const write = getDocStore().write([{ op: "set", collection: COLLECTION, doc }], { message });
  // Invalidate before AND after: readers during the persist round-trip
  // must not get a pre-write cached corpus.
  invalidateAllPostsCache();
  await write;
  invalidateAllPostsCache();
}

// ─── Paginated query API ─────────────────────────────────────────────
//
// Mirrors firebase/posts.ts's subscribeToPostsPaginated with in-memory
// paging over the full list. Like the SQLite impl, the cursor typed as
// `QueryDocumentSnapshot` is a synthetic stub — consumers only pass it
// back, never call its methods. It records the (createdAt, id) of the
// last post of the previous page; the next page starts strictly after
// it in the (createdAt desc, id desc) order.

export interface PaginatedQueryOpts {
  type: PostType;
  status?: PostStatus;
  pageSize: number;
  cursor?: QueryDocumentSnapshot<DocumentData>;
}

export interface PaginatedQueryResult {
  posts: Post[];
  nextCursor?: QueryDocumentSnapshot<DocumentData>;
}

interface DocStoreCursor {
  __docStoreCursor: true;
  createdAtMillis: number;
  id: string;
}

function makeCursor(post: Post): QueryDocumentSnapshot<DocumentData> {
  const stub: DocStoreCursor = { __docStoreCursor: true, createdAtMillis: createdMillis(post), id: post.id };
  return stub as unknown as QueryDocumentSnapshot<DocumentData>;
}

function readCursor(cursor: QueryDocumentSnapshot<DocumentData> | undefined): DocStoreCursor | null {
  const stub = cursor as unknown as Partial<DocStoreCursor> | undefined;
  return stub?.__docStoreCursor && typeof stub.createdAtMillis === "number" && typeof stub.id === "string"
    ? (stub as DocStoreCursor)
    : null;
}

function computePage(all: Post[], opts: PaginatedQueryOpts): PaginatedQueryResult {
  let matching = all.filter((p) => p.type === opts.type && (!opts.status || p.status === opts.status));
  const cursor = readCursor(opts.cursor);
  if (cursor) {
    // Compare against a minimal Post-shaped boundary built from the cursor.
    const boundary = {
      id: cursor.id,
      createdAt: { toMillis: () => cursor.createdAtMillis },
    } as unknown as Post;
    matching = matching.filter((p) => compareCreatedDesc(boundary, p) < 0);
  }
  const posts = matching.slice(0, opts.pageSize);
  const hasNext = matching.length > opts.pageSize;
  return {
    posts,
    nextCursor: hasNext && posts.length > 0 ? makeCursor(posts[posts.length - 1]) : undefined,
  };
}

export function subscribeToPostsPaginated(
  opts: PaginatedQueryOpts,
  onChange: (result: PaginatedQueryResult) => void,
  onError?: (err: Error) => void,
): () => void {
  return subscribeToStore(
    () => computePage(getDocStore().list(COLLECTION).map(docToPost).sort(compareCreatedDesc), opts),
    onChange,
    onError,
  );
}

// ─── One-shot full-corpus fetch with cache ───────────────────────────
//
// Same contract as firebase/posts.ts.fetchAllPosts: returns just the
// requested `type` (post or page), ordered createdAt desc, cached for
// 30 s with in-flight dedup, invalidated on every write. Reading the
// in-memory snapshot is cheap; the cache is kept so primeAllPostsCache
// and the TTL behave identically across backends.

interface CacheEntry {
  corpus: Post[];
  expiresAt: number;
  fromSubscription: boolean;
}

const CACHE_TTL_MS = 30_000;
let cache: CacheEntry | null = null;
let inFlight: Promise<Post[]> | null = null;

function filterFromCorpus(corpus: Post[], type: PostType): Post[] {
  return corpus
    .filter((p) => p.type === type)
    .sort((a, b) => {
      const am = a.createdAt?.toMillis?.() ?? 0;
      const bm = b.createdAt?.toMillis?.() ?? 0;
      return bm - am;
    });
}

export async function fetchAllPosts(opts: { type: PostType }): Promise<Post[]> {
  const now = Date.now();
  if (cache && cache.expiresAt > now) {
    return filterFromCorpus(cache.corpus, opts.type);
  }
  if (inFlight) {
    const corpus = await inFlight;
    return filterFromCorpus(corpus, opts.type);
  }
  inFlight = (async () => {
    try {
      const corpus = await readAll();
      cache = {
        corpus,
        expiresAt: Date.now() + CACHE_TTL_MS,
        fromSubscription: false,
      };
      return corpus;
    } finally {
      inFlight = null;
    }
  })();
  const corpus = await inFlight;
  return filterFromCorpus(corpus, opts.type);
}

// Called from subscribeToPosts to keep the cache fresh while a global
// subscription is active — the subscription re-primes on every change,
// so the TTL is effectively infinite.
export function primeAllPostsCache(corpus: Post[]): void {
  cache = {
    corpus,
    expiresAt: Number.POSITIVE_INFINITY,
    fromSubscription: true,
  };
}

export function invalidateAllPostsCache(): void {
  cache = null;
}

// ─── Aggregation ─────────────────────────────────────────────────────

export async function countPosts(opts: {
  type: PostType;
  status?: PostStatus;
}): Promise<number> {
  const store = getDocStore();
  await store.ready();
  return store
    .list(COLLECTION)
    .filter((d) => d.type === opts.type && (!opts.status || (d.status ?? "draft") === opts.status)).length;
}
