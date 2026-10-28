import type { SiteSettings } from "@agent-cms/runtime";
import { DEFAULT_MULTILANG_CONFIG, PLUGIN_ID, type MultilangConfig } from "../types";

// Reads the live MultilangConfig from site settings. Merges with the
// defaults so callers can rely on every field being defined. Used at
// publish time + by the settings page.
export function getMultilangConfig(settings: SiteSettings): MultilangConfig {
  const raw = settings.pluginConfigs?.[PLUGIN_ID] as Partial<MultilangConfig> | undefined;
  return {
    ...DEFAULT_MULTILANG_CONFIG,
    // Default the primary language to the site's BCP-47 language tag
    // so a fresh install picks the right value without manual setup.
    primaryLanguage: raw?.primaryLanguage || (settings.language || "en").split("-")[0],
    enabledLanguages: raw?.enabledLanguages ?? [],
    homePages: raw?.homePages ?? {},
    menuTranslations: raw?.menuTranslations ?? {},
    showHeaderSwitcher: raw?.showHeaderSwitcher ?? DEFAULT_MULTILANG_CONFIG.showHeaderSwitcher,
    showFooterSwitcher: raw?.showFooterSwitcher ?? DEFAULT_MULTILANG_CONFIG.showFooterSwitcher,
    siteTexts: raw?.siteTexts ?? {},
    ...(raw?.lastPublishedLanguages ? { lastPublishedLanguages: raw.lastPublishedLanguages } : {}),
  };
}

// True when the language is the site's primary language (which lives
// at the root URL with no language prefix).
export function isPrimaryLanguage(config: MultilangConfig, language: string): boolean {
  return config.primaryLanguage === language;
}

// All languages active on the site: primary + enabled secondaries.
// Order: primary first, then enabled in declared order.
export function allLanguages(config: MultilangConfig): string[] {
  const seen = new Set<string>([config.primaryLanguage]);
  const out = [config.primaryLanguage];
  for (const lang of config.enabledLanguages) {
    if (seen.has(lang)) continue;
    seen.add(lang);
    out.push(lang);
  }
  return out;
}

// Site settings as seen by a page of `language`: `language` set to the
// target locale (drives theme i18n, `<html lang>`, Intl formats) and,
// for a secondary language, the translated site title / description
// from `config.siteTexts[language]` when set. The primary language
// keeps Settings → General untouched.
export function localizeSettings(
  settings: SiteSettings,
  language: string,
  config: MultilangConfig,
): SiteSettings {
  const texts = isPrimaryLanguage(config, language) ? undefined : config.siteTexts?.[language];
  const title = texts?.title?.trim();
  const description = texts?.description?.trim();
  return {
    ...settings,
    language,
    ...(title ? { title } : {}),
    ...(description ? { description } : {}),
  };
}
