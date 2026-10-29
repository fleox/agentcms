import type { SiteSettings } from "../core/types";

// Secondary languages enabled in the multilang plugin's stored config.
// Empty when the plugin is disabled or has no secondary language — core
// screens (menus, media library) then hide their per-language inputs.
//
// Plugins are enabled by default: PluginsPage's toggle stores `false`
// only when the user explicitly disables one, so we check `=== false`.
// The config is read as an opaque blob: core UI can't take a hard
// dependency on a plugin's TypeScript surface.
export function getEnabledLanguages(settings: SiteSettings): string[] {
  if (settings.enabledPlugins?.["agentcms-multilang"] === false) return [];
  const config = settings.pluginConfigs?.["agentcms-multilang"] as
    | { enabledLanguages?: unknown }
    | undefined;
  const raw = config?.enabledLanguages;
  if (!Array.isArray(raw)) return [];
  return raw.filter((l): l is string => typeof l === "string" && l.length > 0);
}
