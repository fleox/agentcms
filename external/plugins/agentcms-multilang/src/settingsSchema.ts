// Documents the settings of the multi-language plugin for
// `agentcms plugins config agentcms-multilang --schema` (descriptions read
// by agents).

import type { SettingsSchema } from "@agent-cms/runtime";

export const SETTINGS_SCHEMA: SettingsSchema = {
  primaryLanguage: {
    description:
      "Language of the main content, published at the root (no prefix). Must equal the site language (`settings get site` → language; its base code, e.g. \"en\" for \"en-US\"): set both together, then `regenerate everything`.",
    format: "language code (en, fr, es-MX…)",
  },
  enabledLanguages: {
    description:
      "The OTHER languages the site publishes, each under /<lang>/ with per-entry translations — don't repeat primaryLanguage. Array of language codes in display order (the admin offers en, fr, de, es, nl, pt, ko; any BCP-47 code works). Changing it needs `regenerate everything`.",
    format: "array of language codes",
  },
  homePages: {
    description:
      "Optional home page per secondary language: { \"<lang>\": \"<page id>\" } renders that online page (with its translation) at /<lang>/. A missing or empty entry uses the site's own home (the static home page's translation, or the latest posts).",
    format: "map of language code → page id",
  },
  menuTranslations: {
    description:
      "Legacy, not read by the plugin — don't set. Menu labels per language go on the menu items (`translations: { \"fr\": { \"label\": \"…\" } }` with `menus set`).",
  },
  showHeaderSwitcher: {
    description:
      "Show the language switcher in the site header (themes provide a [data-cms-langswitch] container; built-in themes do). Only shown when enabledLanguages is not empty.",
  },
  showFooterSwitcher: {
    description: "Show the language switcher in the site footer too. Only shown when enabledLanguages is not empty.",
  },
};
