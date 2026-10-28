// Documents the settings of the custom code plugin for
// `agentcms plugins config agentcms-custom-code --schema` (descriptions
// read by agents).

import type { SettingsSchema } from "../../core/types";

export const SETTINGS_SCHEMA: SettingsSchema = {
  head: {
    description:
      "Raw HTML appended at the end of every published page's <head> (analytics, fonts, <style> overrides). Injected as-is, not sanitised; other code here (from the user or other tools) must be kept when adding to it. Shows after `regenerate all`.",
    format: "HTML",
  },
  bodyEnd: {
    description:
      "Raw HTML inserted just before </body> of every published page (chat widgets, deferred scripts, e.g. a [data-cms-search] button). Injected as-is; keep what is already there when adding to it. Shows after `regenerate all`.",
    format: "HTML",
  },
};
