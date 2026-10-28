// Documents the settings of the search plugin for
// `agentcms plugins config agentcms-search --schema` (descriptions read by
// agents; min/max are enforced by the CLI on --set / --merge).

import type { SettingsSchema } from "@agent-cms/runtime";

export const SETTINGS_SCHEMA: SettingsSchema = {
  indexExcerpt: {
    description:
      "Index each entry's excerpt (or the first 200 characters of its body when it has none) in /search-index.json, besides the title (always indexed).",
  },
  indexCategory: { description: "Index each post's category name, so searching a category finds its posts." },
  indexTags: { description: "Index each post's tag names." },
  includePages: { description: "Index online static pages too, not only posts." },
  excludedTermIds: {
    description:
      "Posts whose primary category is in this list are left out of the index: an array of category term ids (see `agentcms terms list --type category`). Empty = no exclusion.",
    format: "array of category ids",
  },
  minQueryLength: {
    description: "Characters a visitor must type before the search modal shows results.",
    min: 1,
    max: 10,
  },
  maxResults: {
    description: "Maximum number of results the search modal shows at once.",
    min: 1,
    max: 100,
  },
  lastIndexHash: { description: "Managed by the plugin — don't set. Hash of the last uploaded search-index.json." },
  lastRuntimeHash: { description: "Managed by the plugin — don't set. Hash of the last uploaded /search.js." },
  lastLocalePaths: {
    description:
      "Managed by the plugin — don't set. Per-language indexes (<lang>/search-index.json, written for agentcms-multilang's languages) uploaded on the last pass; one that is no longer produced gets deleted.",
  },
  lastIndexedAt: { description: "Managed by the plugin — don't set. Time (epoch ms) of the last index upload." },
};
