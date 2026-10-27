import { describe, expect, it, vi } from "vitest";
import type { SiteSettings } from "../../core/types";

vi.mock("@agent-cms/runtime", async () => {
  const slug = await import("../../core/slug");
  return { ...slug };
});

import { buildFeedDiscoveryLinks } from "./head";

function props(opts: {
  baseUrl?: string;
  rss?: unknown;
  currentPath?: string;
  pageTitle?: string;
  title?: string;
}) {
  const settings = {
    baseUrl: opts.baseUrl ?? "https://example.com/blind2",
    title: opts.title ?? "Blind & Co",
    language: "fr",
    pluginConfigs: opts.rss === undefined ? {} : { "agentcms-rss": opts.rss },
  } as unknown as SiteSettings;
  return {
    site: { settings, resolvedMenus: { header: [], footer: [] }, themeCssPath: "" },
    pageTitle: opts.pageTitle ?? "",
    currentPath: opts.currentPath ?? "index.html",
  };
}

const siteOn = { site: { enabled: true, itemCount: 20, excludedTermIds: [], addToFooter: false } };

describe("agentcms-rss feed auto-discovery links", () => {
  it("emits nothing when the plugin has no enabled feed (byte-identical pages)", () => {
    expect(buildFeedDiscoveryLinks(props({}))).toBe("");
    expect(
      buildFeedDiscoveryLinks(props({ rss: { site: { ...siteOn.site, enabled: false }, categoryFeeds: [] } })),
    ).toBe("");
  });

  it("emits nothing when baseUrl is empty", () => {
    expect(buildFeedDiscoveryLinks(props({ baseUrl: "", rss: { ...siteOn, categoryFeeds: [] } }))).toBe("");
  });

  it("links the site feed with an absolute, sub-folder-aware URL", () => {
    expect(buildFeedDiscoveryLinks(props({ rss: { ...siteOn, categoryFeeds: [] } }))).toBe(
      '<link rel="alternate" type="application/rss+xml" title="Blind &amp; Co" href="https://example.com/blind2/rss.xml" />',
    );
  });

  it("adds the category feed on its archive page", () => {
    const rss = {
      ...siteOn,
      categoryFeeds: [{ termId: "t1", itemCount: 20, addToFooter: false, lastPublishedPath: "news/news.xml" }],
    };
    const html = buildFeedDiscoveryLinks(
      props({ rss, currentPath: "news/index.html", pageTitle: "Actualités" }),
    );
    expect(html.split("\n")).toEqual([
      '<link rel="alternate" type="application/rss+xml" title="Blind &amp; Co" href="https://example.com/blind2/rss.xml" />',
      '<link rel="alternate" type="application/rss+xml" title="Blind &amp; Co — Actualités" href="https://example.com/blind2/news/news.xml" />',
    ]);
    // Other categories / posts: site feed only.
    expect(buildFeedDiscoveryLinks(props({ rss, currentPath: "sport/index.html" })).split("\n")).toHaveLength(1);
    expect(buildFeedDiscoveryLinks(props({ rss, currentPath: "news/post.html" })).split("\n")).toHaveLength(1);
  });

  it("links a category feed even when the site feed is off", () => {
    const rss = {
      site: { ...siteOn.site, enabled: false },
      categoryFeeds: [{ termId: "t1", itemCount: 20, addToFooter: false, lastPublishedPath: "news/news.xml" }],
    };
    expect(buildFeedDiscoveryLinks(props({ rss, currentPath: "news/index.html", pageTitle: "News" }))).toBe(
      '<link rel="alternate" type="application/rss+xml" title="Blind &amp; Co — News" href="https://example.com/blind2/news/news.xml" />',
    );
  });
});
