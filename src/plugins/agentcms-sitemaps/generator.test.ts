import { beforeEach, describe, expect, it, vi } from "vitest";
import type { Post, SiteSettings } from "../../core/types";

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

import { DEFAULT_SITEMAPS_CONFIG, isStaticHomePage, regenerateSitemaps } from "./generator";

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
