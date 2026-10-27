import { describe, expect, it, vi } from "vitest";
import type { Post, SiteSettings } from "../../core/types";

vi.mock("@agent-cms/runtime", async () => {
  const slug = await import("../../core/slug");
  return {
    ...slug,
    i18n: { getResource: () => undefined },
    pickPublicLocale: () => "en",
    markdownToPlainText: (md: string) => md,
    sha256Hex: async () => "",
    uploadFile: async () => undefined,
  };
});

import { buildIndex } from "./generator";
import { DEFAULT_SEARCH_CONFIG } from "./config";

const page = (id: string, slug: string): Post =>
  ({ id, type: "page", slug, title: slug, contentMarkdown: "", status: "online", termIds: [] }) as unknown as Post;

const pages = [page("home", "home"), page("about", "about")];
const config = { ...DEFAULT_SEARCH_CONFIG, includePages: true };

describe("agentcms-search buildIndex — static-page home", () => {
  it("links the static home page to the home (the runtime renders href=\"/\")", () => {
    const settings = { language: "en", homeMode: "static-page", homePageId: "home" } as SiteSettings;
    const index = buildIndex({ posts: [], pages, terms: [], settings, config });
    const urls = Object.fromEntries(index.items.map((i) => [i.id, i.url]));
    expect(urls).toEqual({ home: "", about: "about.html" });
  });

  it("keeps the page URL on a latest-posts home", () => {
    const settings = { language: "en", homeMode: "latest-posts", homePageId: "home" } as SiteSettings;
    const index = buildIndex({ posts: [], pages, terms: [], settings, config });
    expect(index.items.map((i) => i.url).sort()).toEqual(["about.html", "home.html"]);
  });
});
