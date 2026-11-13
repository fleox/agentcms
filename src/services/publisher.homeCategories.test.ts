import { describe, expect, it } from "vitest";
import { buildHomeCategories, type PublishContext } from "./publisher";
import type { Post, SiteSettings, Term } from "../core/types";

const ts = (ms: number) => ({ toMillis: () => ms, toDate: () => new Date(ms) });

const post = (id: string, termId: string | undefined, day: number, status = "online"): Post =>
  ({
    id,
    type: "post",
    slug: id,
    title: id,
    contentMarkdown: "",
    status,
    termIds: [],
    primaryTermId: termId,
    authorId: "u1",
    createdAt: ts(Date.UTC(2026, 0, day)),
  }) as unknown as Post;

const term = (id: string, name: string, type: "category" | "tag" = "category"): Term =>
  ({ id, type, name, slug: id }) as unknown as Term;

const ctx = (posts: Post[], terms: Term[]): PublishContext =>
  ({
    posts,
    pages: [],
    terms,
    media: new Map(),
    settings: { language: "en", postsPerPage: 2, menus: {} } as unknown as SiteSettings,
    users: [],
    authorLookup: () => undefined,
  }) as PublishContext;

describe("buildHomeCategories", () => {
  const terms = [term("news", "News"), term("blog", "Blog"), term("empty", "Empty"), term("t1", "Tag", "tag")];
  const posts = [
    post("n1", "news", 1),
    post("n2", "news", 5),
    post("n3", "news", 3),
    post("n4", "news", 9, "draft"),
    post("b1", "blog", 2),
    post("x1", undefined, 8),
  ];

  it("returns nothing when the theme doesn't ask", () => {
    expect(buildHomeCategories(ctx(posts, terms), undefined)).toBeUndefined();
    expect(buildHomeCategories(ctx(posts, terms), 0)).toBeUndefined();
  });

  it("gives the newest online posts of each category, by category name, independent of postsPerPage", () => {
    const result = buildHomeCategories(ctx(posts, terms), 3)!;
    expect(result.map((c) => c.term.id)).toEqual(["blog", "news"]);
    const news = result[1];
    expect(news.url).toBe("/news/index.html");
    expect(news.posts.map((p) => p.id)).toEqual(["n2", "n3", "n1"]);
    expect(news.total).toBe(3);
    expect(news.posts[0].url).toBe("news/n2.html");
  });

  it("caps each list at homeCategoryPosts and keeps the total", () => {
    const news = buildHomeCategories(ctx(posts, terms), 1)!.find((c) => c.term.id === "news")!;
    expect(news.posts.map((p) => p.id)).toEqual(["n2"]);
    expect(news.total).toBe(3);
  });
});
