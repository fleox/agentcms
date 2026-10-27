// Registry upkeep run at every boot. (1) The bundled entries' versions
// follow the deployed admin (see migrateRegistry). (2) One-time migration
// of sites created before 0.2.0, when the bundled
// plugins were named "flexweg-*" (now "agentcms-*"). Their bundles import
// "@flexweg/cms-runtime", which no longer exists, so they can't load.
//
//   - registry entries "flexweg-x" → the bundled "agentcms-x" entry
//     (when this build ships one; unknown legacy entries are kept);
//   - settings.enabledPlugins / pluginConfigs keys "flexweg-x" →
//     "agentcms-x" (existing new keys win).
//
// Idempotent and write-free when there is nothing to migrate. Run at
// admin boot (externalLoader) and by the agentcms CLI's site session.

import type { SiteSettings } from "../core/types";
import type { ExternalEntry, ExternalManifest } from "./externalRegistry";

const LEGACY = "flexweg-";
const CURRENT = "agentcms-";

export function currentId(id: string): string {
  return id.startsWith(LEGACY) ? CURRENT + id.slice(LEGACY.length) : id;
}

export function migrateRegistry(registry: ExternalManifest, defaults: ExternalManifest): ExternalManifest | null {
  let changed = false;
  const out: ExternalManifest = { plugins: [], themes: [] };
  for (const kind of ["plugins", "themes"] as const) {
    const seen = new Set<string>();
    for (const entry of registry[kind]) {
      let next: ExternalEntry = entry;
      if (entry.id.startsWith(LEGACY)) {
        const replacement = defaults[kind].find((d) => d.id === currentId(entry.id));
        if (replacement) {
          next = replacement;
          changed = true;
        }
      } else {
        // A bundled entry after an admin update: the bundle files on the
        // site were replaced by this build's, but the registry still
        // carries the old version — which the loader uses to cache-bust
        // (`?v=`), so browsers would keep the old bundle.
        const path = (e: ExternalEntry) => e.entryPath ?? `${kind}/${e.id}/bundle.js`;
        const bundled = defaults[kind].find((d) => d.id === entry.id && path(d) === path(entry));
        if (bundled && (bundled.version !== entry.version || bundled.apiVersion !== entry.apiVersion)) {
          next = { ...entry, version: bundled.version, apiVersion: bundled.apiVersion };
          changed = true;
        }
      }
      if (seen.has(next.id)) {
        changed = true;
        continue;
      }
      seen.add(next.id);
      out[kind].push(next);
    }
  }
  return changed ? out : null;
}

function renameKeys<T>(map: Record<string, T> | undefined): Record<string, T> | null {
  if (!map) return null;
  let changed = false;
  const out: Record<string, T> = {};
  for (const [k, v] of Object.entries(map)) {
    if (!k.startsWith(LEGACY)) out[k] = v;
  }
  for (const [k, v] of Object.entries(map)) {
    if (!k.startsWith(LEGACY)) continue;
    changed = true;
    const next = currentId(k);
    if (!(next in out)) out[next] = v;
  }
  return changed ? out : null;
}

export function migrateSettings(settings: Pick<SiteSettings, "enabledPlugins" | "pluginConfigs">): Partial<SiteSettings> | null {
  const enabled = renameKeys(settings.enabledPlugins);
  const configs = renameKeys(settings.pluginConfigs);
  if (!enabled && !configs) return null;
  return {
    ...(enabled ? { enabledPlugins: enabled } : {}),
    ...(configs ? { pluginConfigs: configs } : {}),
  };
}

// Applies both migrations through the given storage functions.
export async function migrateLegacyIds(io: {
  readRegistry: () => Promise<ExternalManifest | null>;
  writeRegistry: (m: ExternalManifest) => Promise<void>;
  defaults: ExternalManifest;
  getSettings: () => Promise<SiteSettings>;
  updateSettings: (patch: Partial<SiteSettings>) => Promise<void>;
}): Promise<{ registry: boolean; settings: boolean }> {
  const result = { registry: false, settings: false };
  const registry = await io.readRegistry();
  if (registry) {
    const next = migrateRegistry(registry, io.defaults);
    if (next) {
      await io.writeRegistry(next);
      result.registry = true;
    }
  }
  const patch = migrateSettings(await io.getSettings());
  if (patch) {
    await io.updateSettings(patch);
    result.settings = true;
  }
  return result;
}
