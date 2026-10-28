// Documents the settings of the archives plugin for
// `agentcms plugins config agentcms-archives --schema` (descriptions read
// by agents; `values` are enforced by the CLI on --set / --merge).

import type { SettingsSchema } from "@agent-cms/runtime";

export const SETTINGS_SCHEMA: SettingsSchema = {
  drillDown: {
    description:
      "Sub-pages under each year archive: none (year pages only), month (/archives/<year>/<mm>/) or ISO week (/archives/<year>/W<ww>/). Changing it needs a full archives regeneration, which rebuilds /archives/ from scratch.",
    values: ["none", "month", "week"],
  },
  includePages: {
    description: "List static pages in the archives too (by publication date), not only posts.",
  },
  showCounts: {
    description: "Show the number of entries next to each period, e.g. \"2025 (12)\".",
  },
  addArchivesLinkToHome: {
    description:
      "Add a \"See full archives\" link below the home page's post list. Shows after the home is regenerated.",
  },
  addArchivesLinkToCategory: {
    description:
      "Add a \"See full archives\" link below every category archive's post list. Shows after the category pages are regenerated.",
  },
};
