import { beforeEach, describe, expect, it, vi } from "vitest";
import type { Post, SiteSettings, Term } from "../../core/types";

const uploads = new Map<string, string>();
vi.mock("@agent-cms/runtime", async () => {
  const slug = await import("../../core/slug");
  const registry = await import("../../core/pluginRegistry");
  const basePath = await import("../../core/basePath");
  return {
    ...slug,
    applyFilters: registry.applyFilters,
    applyFiltersSync: registry.applyFiltersSync,
    basePathFromBaseUrl: basePath.basePathFromBaseUrl,
    pickPublicLocale: () => "en",
    uploadFile: async ({ path, content }: { path: string; content: string }) => {
      uploads.set(path, content);
    },
    deleteFile: async () => {
      throw new Error("404");
    },
  };
});

import { DEFAULT_SITEMAPS_CONFIG, defaultRobotsTxt, isStaticHomePage, regenerateRobotsTxt, regenerateSitemaps } from "./generator";

const ts = (iso: string) => ({ toMillis: () => Date.parse(iso) });
const entity = (id: string, type: "post" | "page", slug: string): Post =>
  ({
    id,
    type,
    slug,
    title: slug,
    contentMarkdown: "",
    status: "online",
    termIds: [],
    createdAt: ts("2026-03-01T00:00:00Z"),
    updatedAt: ts("2026-03-02T00:00:00Z"),
  }) as unknown as Post;

const baseSettings = {
  baseUrl: "https://example.com",
  title: "Site",
  language: "en",
  homeMode: "latest-posts",
} as SiteSettings;

const posts = [entity("p1", "post", "hello")];
const pages = [entity("home", "page", "home"), entity("about", "page", "about")];

function locs(xml: string): string[] {
  return [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
}

beforeEach(() => uploads.clear());

describe("agentcms-sitemaps — static-page home", () => {
  it("lists the static home page once, as the site root, never as /<slug>.html", async () => {
    await regenerateSitemaps({
      posts,
      pages,
      terms: [],
      settings: { ...baseSettings, homeMode: "static-page", homePageId: "home" },
      config: DEFAULT_SITEMAPS_CONFIG,
    });
    expect(locs(uploads.get("sitemaps/sitemap-2026.xml") ?? "")).toEqual([
      "https://example.com/hello.html",
      "https://example.com/",
      "https://example.com/about.html",
    ]);
  });

  it("keeps every page at its own URL on a latest-posts home (unchanged output)", async () => {
    await regenerateSitemaps({
      posts,
      pages,
      terms: [],
      settings: { ...baseSettings, homePageId: "home" },
      config: DEFAULT_SITEMAPS_CONFIG,
    });
    expect(locs(uploads.get("sitemaps/sitemap-2026.xml") ?? "")).toEqual([
      "https://example.com/hello.html",
      "https://example.com/home.html",
      "https://example.com/about.html",
    ]);
  });

  it("isStaticHomePage mirrors the publisher's home binding", () => {
    const s = { ...baseSettings, homeMode: "static-page" as const, homePageId: "home" };
    expect(isStaticHomePage(pages[0], s)).toBe(true);
    expect(isStaticHomePage(pages[1], s)).toBe(false);
    expect(isStaticHomePage(pages[0], { ...s, homeMode: "latest-posts" })).toBe(false);
  });
});

describe("agentcms-sitemaps — archives sitemap", () => {
  const cat = (id: string, slug: string) => ({ id, type: "category", slug, name: slug }) as unknown as Term;
  const inCat = (id: string, slug: string, termId: string, updated: string): Post =>
    ({ ...entity(id, "post", slug), primaryTermId: termId, termIds: [termId], updatedAt: ts(updated) }) as Post;

  it("lists the home and each category with online posts, dated by their newest post", async () => {
    await regenerateSitemaps({
      posts: [inCat("a", "a", "c1", "2026-04-01T00:00:00Z"), inCat("b", "b", "c1", "2026-05-01T00:00:00Z"), { ...inCat("c", "c", "c2", "2026-06-01T00:00:00Z"), status: "draft" } as Post],
      pages,
      terms: [cat("c1", "guides"), cat("c2", "empty")],
      settings: baseSettings,
      config: DEFAULT_SITEMAPS_CONFIG,
    });
    const xml = uploads.get("sitemaps/sitemap-archives.xml") ?? "";
    expect(locs(xml)).toEqual(["https://example.com/", "https://example.com/guides/"]);
    expect(xml).toContain("<lastmod>2026-05-01</lastmod>");
    expect(locs(uploads.get("sitemaps/sitemap-index.xml") ?? "")).toContain("https://example.com/sitemaps/sitemap-archives.xml");
  });

  it("does not repeat a static home already listed, and is off when disabled", async () => {
    const terms = [cat("c1", "guides")];
    const list = [inCat("a", "a", "c1", "2026-04-01T00:00:00Z")];
    await regenerateSitemaps({ posts: list, pages, terms, settings: { ...baseSettings, homeMode: "static-page", homePageId: "home" }, config: DEFAULT_SITEMAPS_CONFIG });
    expect(locs(uploads.get("sitemaps/sitemap-archives.xml") ?? "")).toEqual(["https://example.com/guides/"]);
    uploads.clear();
    await regenerateSitemaps({ posts: list, pages, terms, settings: baseSettings, config: { ...DEFAULT_SITEMAPS_CONFIG, archivesEnabled: false } });
    expect(uploads.has("sitemaps/sitemap-archives.xml")).toBe(false);
    expect(uploads.get("sitemaps/sitemap-index.xml")).not.toContain("sitemap-archives");
  });
});

describe("robots.txt", () => {
  it("replaces a stored default from before sub-folder support, keeps real custom ones", async () => {
    const baseUrl = "https://example.com/blog";
    const legacy = defaultRobotsTxt(baseUrl, false).replace("Disallow: /blog/admin/", "Disallow: /admin/");
    await regenerateRobotsTxt({ config: { ...DEFAULT_SITEMAPS_CONFIG, robotsTxt: legacy }, baseUrl });
    expect(uploads.get("robots.txt")).toContain("Disallow: /blog/admin/");
    const custom = "User-agent: *\nDisallow: /private/\n";
    await regenerateRobotsTxt({ config: { ...DEFAULT_SITEMAPS_CONFIG, robotsTxt: custom }, baseUrl });
    expect(uploads.get("robots.txt")).toBe(custom);
  });
});
