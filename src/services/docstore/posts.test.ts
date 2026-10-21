import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { DocumentData, QueryDocumentSnapshot } from "firebase/firestore";
import { createMemoryDocStore, setDocStoreForTests, type DocStore } from "./index";
import * as docstorePosts from "./posts";
import type { Post } from "../../core/types";

// Type-level drift guard: every firebase export must exist here with an
// assignable signature (the dispatcher types itself on the firebase impl).
const _posts: typeof import("../firebase/posts") = docstorePosts;
void _posts;

const {
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
  updatePost,
} = docstorePosts;

let store: DocStore;

const seed = [
  { id: "p1", type: "post", title: "One", slug: "one", contentMarkdown: "", authorId: "u", termIds: [], status: "online", createdAt: 1000, updatedAt: 1000 },
  { id: "p2", type: "post", title: "Two", slug: "two", contentMarkdown: "", authorId: "u", termIds: [], status: "draft", createdAt: 3000, updatedAt: 3000 },
  { id: "p3", type: "post", title: "Three", slug: "three", contentMarkdown: "", authorId: "u", termIds: [], status: "draft", createdAt: 2000, updatedAt: 2000 },
  { id: "g1", type: "page", title: "About", slug: "about", contentMarkdown: "", authorId: "u", termIds: [], status: "online", createdAt: 500, updatedAt: 500 },
];

function nextEmit<T>(subscribe: (cb: (v: T) => void) => () => void): Promise<T> {
  return new Promise((resolve) => {
    const unsub = subscribe((v) => {
      queueMicrotask(() => unsub());
      resolve(v);
    });
  });
}

beforeEach(() => {
  invalidateAllPostsCache();
  store = createMemoryDocStore({ posts: seed });
  setDocStoreForTests(store);
});

afterEach(() => {
  setDocStoreForTests(null);
  vi.restoreAllMocks();
});

describe("docstore posts", () => {
  it("subscribeToPosts emits every post + page sorted createdAt desc", async () => {
    const posts = await nextEmit<Post[]>((cb) => subscribeToPosts(cb));
    expect(posts.map((p) => p.id)).toEqual(["p2", "p3", "p1", "g1"]);
    expect(posts[0].createdAt?.toMillis()).toBe(3000);
  });

  it("createPost is visible to subscribers and stored as JSON-safe data", async () => {
    const seen: Post[][] = [];
    const unsub = subscribeToPosts((p) => seen.push(p));
    await store.ready();
    const writeSpy = vi.spyOn(store, "write");
    const id = await createPost({
      type: "post",
      title: "New",
      slug: "new",
      authorId: "u",
      termIds: ["t1"],
      seo: { title: "S" },
      translations: { fr: { title: "Nouveau" } },
      createdAt: new Date(5000),
    });
    expect(writeSpy).toHaveBeenCalledTimes(1);
    expect(writeSpy.mock.calls[0][1]?.message).toBe("Create post: New");
    const last = seen[seen.length - 1];
    expect(last[0].id).toBe(id);
    expect(last[0].status).toBe("draft");
    expect(last[0].termIds).toEqual(["t1"]);
    expect(last[0].translations).toEqual({ fr: { title: "Nouveau" } });
    const raw = store.get("posts", id)!;
    expect(raw.createdAt).toBe(5000);
    expect(typeof raw.updatedAt).toBe("number");
    expect(raw.seo).toEqual({ title: "S" });
    unsub();
  });

  it("updatePost patches, clears nulls and drops empty maps in one write", async () => {
    await updatePost("p1", { excerpt: "x", translations: { fr: { a: 1 } } });
    const writeSpy = vi.spyOn(store, "write");
    await updatePost("p1", {
      title: "Uno",
      excerpt: null,
      translations: {},
      publishedAt: new Date(9000),
    });
    expect(writeSpy).toHaveBeenCalledTimes(1);
    const raw = store.get("posts", "p1")!;
    expect(raw.title).toBe("Uno");
    expect(raw.excerpt).toBeUndefined();
    expect(raw.translations).toBeUndefined();
    expect(raw.publishedAt).toBe(9000);
    expect(raw.updatedAt as number).toBeGreaterThan(1000);
    await expect(updatePost("missing", { title: "x" })).rejects.toThrow();
  });

  it("markPostOnline / markPostDraft keep the publish-state semantics", async () => {
    await updatePost("p2", { lastPublishedPathsByLocale: { fr: "fr/two.html" } });
    await markPostOnline("p2", {
      lastPublishedPath: "two.html",
      lastPublishedHash: "h",
      previousPublishedPaths: ["old.html"],
      publishedAt: new Date(7000),
    });
    let [post] = (await fetchAllPosts({ type: "post" })).filter((p) => p.id === "p2");
    expect(post.status).toBe("online");
    expect(post.lastPublishedPath).toBe("two.html");
    expect(post.lastPublishedHash).toBe("h");
    expect(post.previousPublishedPaths).toEqual(["old.html"]);
    expect(post.publishedAt?.toMillis()).toBe(7000);

    await markPostOnline("p2", { lastPublishedPath: "two.html", lastPublishedHash: "h2" });
    [post] = (await fetchAllPosts({ type: "post" })).filter((p) => p.id === "p2");
    expect(post.previousPublishedPaths).toBeUndefined();
    expect(post.publishedAt!.toMillis()).toBeGreaterThan(7000);

    await markPostDraft("p2");
    [post] = (await fetchAllPosts({ type: "post" })).filter((p) => p.id === "p2");
    expect(post.status).toBe("draft");
    expect(post.lastPublishedPath).toBeUndefined();
    expect(post.lastPublishedHash).toBeUndefined();
    expect(post.previousPublishedPaths).toBeUndefined();
    expect(post.publishedAt).toBeDefined();
    expect(post.lastPublishedPathsByLocale).toEqual({ fr: "fr/two.html" });
    expect(store.get("posts", "p2")!.previousPublishedPaths).toEqual([]);
  });

  it("deletePost removes the doc in one write; missing id is a no-op", async () => {
    const writeSpy = vi.spyOn(store, "write");
    await deletePost("p1");
    expect(writeSpy).toHaveBeenCalledTimes(1);
    expect(store.get("posts", "p1")).toBeUndefined();
    await deletePost("p1");
    expect(writeSpy).toHaveBeenCalledTimes(1);
  });

  it("fetchAllPosts filters by type, sorts, caches and invalidates on write", async () => {
    expect((await fetchAllPosts({ type: "post" })).map((p) => p.id)).toEqual(["p2", "p3", "p1"]);
    expect((await fetchAllPosts({ type: "page" })).map((p) => p.id)).toEqual(["g1"]);
    await createPost({ type: "page", title: "Contact", slug: "contact", authorId: "u" });
    expect(await fetchAllPosts({ type: "page" })).toHaveLength(2);
    primeAllPostsCache([]);
    expect(await fetchAllPosts({ type: "page" })).toEqual([]);
  });

  it("countPosts counts by type and status", async () => {
    expect(await countPosts({ type: "post" })).toBe(3);
    expect(await countPosts({ type: "post", status: "draft" })).toBe(2);
    expect(await countPosts({ type: "page", status: "draft" })).toBe(0);
  });

  it("subscribeToPostsPaginated pages with cursors", async () => {
    const page1 = await nextEmit<docstorePosts.PaginatedQueryResult>((cb) =>
      subscribeToPostsPaginated({ type: "post", pageSize: 2 }, cb),
    );
    expect(page1.posts.map((p) => p.id)).toEqual(["p2", "p3"]);
    expect(page1.nextCursor).toBeDefined();
    const page2 = await nextEmit<docstorePosts.PaginatedQueryResult>((cb) =>
      subscribeToPostsPaginated({ type: "post", pageSize: 2, cursor: page1.nextCursor }, cb),
    );
    expect(page2.posts.map((p) => p.id)).toEqual(["p1"]);
    expect(page2.nextCursor).toBeUndefined();
    const drafts = await nextEmit<docstorePosts.PaginatedQueryResult>((cb) =>
      subscribeToPostsPaginated({ type: "post", status: "draft", pageSize: 10 }, cb),
    );
    expect(drafts.posts.map((p) => p.id)).toEqual(["p2", "p3"]);
  });

  it("paging is stable across equal createdAt values", async () => {
    store = createMemoryDocStore({
      posts: ["a", "b", "c"].map((id) => ({ ...seed[0], id, createdAt: 1000 })),
    });
    setDocStoreForTests(store);
    const ids: string[] = [];
    let cursor: QueryDocumentSnapshot<DocumentData> | undefined;
    for (let i = 0; i < 3; i++) {
      const page = await nextEmit<docstorePosts.PaginatedQueryResult>((cb) =>
        subscribeToPostsPaginated({ type: "post", pageSize: 1, cursor }, cb),
      );
      ids.push(...page.posts.map((p) => p.id));
      cursor = page.nextCursor;
    }
    expect(ids.sort()).toEqual(["a", "b", "c"]);
    expect(cursor).toBeUndefined();
  });

  it("subscriptions re-emit on writes and stop after unsubscribe", async () => {
    const listener = vi.fn();
    const unsub = subscribeToPosts(listener);
    await store.ready();
    await Promise.resolve();
    const before = listener.mock.calls.length;
    await updatePost("p1", { title: "x" });
    expect(listener.mock.calls.length).toBe(before + 1);
    unsub();
    await updatePost("p1", { title: "y" });
    expect(listener.mock.calls.length).toBe(before + 1);
  });
});
