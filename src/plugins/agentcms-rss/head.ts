import { pathToPublicUrl, type BaseLayoutProps } from "@agent-cms/runtime";
import { DEFAULT_RSS_CONFIG, SITE_RSS_PATH, categoryFeedPath, type RssConfig } from "./generator";

const PLUGIN_ID = "agentcms-rss";

function escapeAttr(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function alternateLink(title: string, href: string): string {
  return `<link rel="alternate" type="application/rss+xml" title="${escapeAttr(title)}" href="${escapeAttr(href)}" />`;
}

// `<link rel="alternate" type="application/rss+xml">` tags for feed
// auto-discovery, injected through the sync `page.head.extra` filter.
//
// - Site feed: on every page while it is enabled.
// - Category feed: on a category archive (`<slug>/index.html`) when a
//   feed for that category has been uploaded — its recorded
//   `lastPublishedPath` is exactly `<slug>/<slug>.xml`, so the match
//   needs no term lookup (the head filter only receives BaseLayoutProps).
//
// Hrefs are absolute (pathToPublicUrl on settings.baseUrl), so a site in
// a sub-folder keeps its prefix and the base-path rewrite leaves them
// alone. Returns "" when baseUrl is empty or no feed applies, so pages of
// sites without RSS stay byte-identical.
export function buildFeedDiscoveryLinks(
  props: Pick<BaseLayoutProps, "site" | "pageTitle" | "currentPath">,
): string {
  const settings = props.site.settings;
  const baseUrl = (settings.baseUrl || "").replace(/\/+$/, "");
  if (!baseUrl) return "";
  const stored = (settings.pluginConfigs ?? {})[PLUGIN_ID] as Partial<RssConfig> | undefined;
  const config: RssConfig = { ...DEFAULT_RSS_CONFIG, ...(stored ?? {}) };
  const siteTitle = settings.title || "Site";
  const links: string[] = [];

  if (config.site?.enabled) {
    links.push(alternateLink(siteTitle, pathToPublicUrl(baseUrl, SITE_RSS_PATH)));
  }

  const match = /^([a-z0-9-]+)\/index\.html$/.exec(props.currentPath || "");
  if (match) {
    const feedPath = categoryFeedPath(match[1]);
    const hasFeed = (config.categoryFeeds ?? []).some((f) => f.lastPublishedPath === feedPath);
    if (hasFeed) {
      const name = props.pageTitle || match[1];
      links.push(alternateLink(`${siteTitle} — ${name}`, pathToPublicUrl(baseUrl, feedPath)));
    }
  }

  return links.join("\n");
}
