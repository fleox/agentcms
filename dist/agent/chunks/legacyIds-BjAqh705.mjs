import { createRequire as __acmsRequire } from "node:module";
import { fileURLToPath as __acmsPath } from "node:url";
import { dirname as __acmsDirname } from "node:path";
const require2 = __acmsRequire(import.meta.url);
const __filename = __acmsPath(import.meta.url);
const __dirname = __acmsDirname(__filename);
const LEGACY = "flexweg-";
const CURRENT = "agentcms-";
function currentId(id) {
  return id.startsWith(LEGACY) ? CURRENT + id.slice(LEGACY.length) : id;
}
function migrateRegistry(registry, defaults) {
  let changed = false;
  const out = { plugins: [], themes: [] };
  for (const kind of ["plugins", "themes"]) {
    const seen = /* @__PURE__ */ new Set();
    for (const entry of registry[kind]) {
      let next = entry;
      if (entry.id.startsWith(LEGACY)) {
        const replacement = defaults[kind].find((d) => d.id === currentId(entry.id));
        if (replacement) {
          next = replacement;
          changed = true;
        }
      } else {
        const path = (e) => e.entryPath ?? `${kind}/${e.id}/bundle.js`;
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
function renameKeys(map) {
  if (!map) return null;
  let changed = false;
  const out = {};
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
function migrateSettings(settings) {
  const enabled = renameKeys(settings.enabledPlugins);
  const configs = renameKeys(settings.pluginConfigs);
  if (!enabled && !configs) return null;
  return {
    ...enabled ? { enabledPlugins: enabled } : {},
    ...configs ? { pluginConfigs: configs } : {}
  };
}
async function migrateLegacyIds(io) {
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
export {
  currentId,
  migrateLegacyIds,
  migrateRegistry,
  migrateSettings
};
