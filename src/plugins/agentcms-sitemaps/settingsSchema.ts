// Documents the settings of the sitemaps plugin for
// `agentcms plugins config agentcms-sitemaps --schema` (descriptions read
// by agents; `values` and min/max are enforced by the CLI on --set / --merge).

import type { SettingsSchema } from "@agent-cms/runtime";

export const SETTINGS_SCHEMA: SettingsSchema = {
  contentTypes: {
    description:
      "What the yearly sitemaps (/sitemaps/sitemap-<year>.xml) list: online posts only, or posts and pages.",
    values: ["posts", "posts-pages"],
  },
  newsEnabled: {
    description:
      "Also publish a Google News sitemap (/sitemaps/sitemap-news.xml, posts only) referenced from the index. The default robots.txt then lists it too; re-run the robots and stylesheets actions after toggling.",
  },
  newsWindowDays: {
    description: "News sitemap window: posts modified within this many days are listed. Google recommends 2.",
    min: 1,
    max: 30,
  },
  robotsTxt: {
    description:
      "Full text of /robots.txt. Empty = a generated default pointing at /sitemaps/sitemap-index.xml (and the News sitemap when enabled). Ignored while settings.discourageIndexing is on (robots.txt then disallows everything). Upload it with `plugins action agentcms-sitemaps robots`.",
    format: "robots.txt text",
  },
};
