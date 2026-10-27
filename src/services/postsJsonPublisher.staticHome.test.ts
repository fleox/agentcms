import { describe, expect, it } from "vitest";
import { buildPostsJson } from "./postsJsonPublisher";
import type { Post, SiteSettings } from "../core/types";

const page = (id: string, slug: string): Post =>
  ({
    id,
    type: "page",
    slug,
    title: slug,
    contentMarkdown: "",
    status: "online",
    termIds: [],
    authorId: "u1",
  }) as unknown as Post;

const settings = (extra: Partial<SiteSettings>): SiteSettings =>
  ({ language: "en", homeMode: "latest-posts", ...extra }) as SiteSettings;

describe("buildPostsJson — static-page home", () => {
  const pages = [page("home", "home"), page("about", "about")];
  it("links the static home page to index.html (its <slug>.html is never published)", () => {
    const json = buildPostsJson(settings({ homeMode: "static-page", homePageId: "home" }), [], pages, [], []);
    const urls = Object.fromEntries(json.posts.map((e) => [e.id, e.url]));
    expect(urls).toEqual({ home: "index.html", about: "about.html" });
  });
  it("is unchanged on a latest-posts home", () => {
    const json = buildPostsJson(settings({ homePageId: "home" }), [], pages, [], []);
    expect(json.posts.map((e) => e.url).sort()).toEqual(["about.html", "home.html"]);
  });
});
