// Documents the settings of the RSS plugin for
// `agentcms plugins config agentcms-rss --schema` (descriptions read by
// agents; `values` and min/max are enforced by the CLI on --set / --merge).

import type { SettingsSchema } from "@agent-cms/runtime";

export const SETTINGS_SCHEMA: SettingsSchema = {
  "site.enabled": {
    description:
      "Publish the site-wide RSS 2.0 feed at /rss.xml (latest online posts). Turning it off deletes /rss.xml (and the per-language feeds) on save. Needs settings.baseUrl.",
  },
  "site.itemCount": {
    description: "Number of most recent online posts in /rss.xml.",
    min: 1,
    max: 100,
  },
  "site.excludedTermIds": {
    description:
      "Categories whose posts are left out of /rss.xml: an array of category term ids (the CLI also accepts category slugs or names and stores the ids). Empty = every post.",
    format: "array of category ids",
  },
  "site.addToFooter": {
    description: "Add an \"RSS\" link to /rss.xml at the end of the footer menu (data/menu.json, republished on save).",
  },
  "site.lastPublishedPath": {
    description: "Managed by the plugin — don't set. Path of the last uploaded site feed, used to delete it when the feed is turned off.",
  },
  "site.lastLocalePaths": {
    description: "Managed by the plugin — don't set. Per-language feed files (e.g. /<lang>/rss.xml from multilang) to clean up later.",
  },
  categoryFeeds: {
    description:
      "One feed per category, published at /<category-slug>/<category-slug>.xml: an array of { termId, itemCount (1-100, default 20), addToFooter (adds \"RSS — <category>\" to the footer) }. termId is a category id (the CLI also accepts a slug or name). Each item's lastPublishedPath is managed by the plugin — don't set it. Feeds removed from the array get their file deleted on save.",
    format: "array of { termId, itemCount, addToFooter }",
  },
};
