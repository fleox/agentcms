// Document-store implementation of the site settings service
// ("markdown-git" / "local" backends). Settings live as a single doc
// with id "site" in the `settings` collection. Mirrors the function
// signatures of services/firebase/settings.ts so the top-level
// dispatcher can swap impls based on backend.
//
// Plugin / theme configs are nested maps inside the doc
// (pluginConfigs[pluginId], themeConfigs[themeId]); updates use the
// same read-merge-write semantic as the SQLite impl — the named
// plugin/theme config is replaced wholesale, siblings are untouched.

import { DEFAULT_SITE_SETTINGS } from "../firebase/settings";
import type { SiteSettings } from "../../core/types";
import { getDocStore } from "./index";

// Re-export for dispatcher transparency.
export { DEFAULT_SITE_SETTINGS };

const SETTINGS_ID = "site";

function readDoc(): Partial<SiteSettings> {
  const doc = getDocStore().get("settings", SETTINGS_ID);
  if (!doc) return {};
  // Store docs are frozen; hand callers a mutable copy like Firestore does.
  const { id: _id, ...data } = structuredClone(doc) as Record<string, unknown>;
  return data as Partial<SiteSettings>;
}

async function writeDoc(data: Partial<SiteSettings>, message: string): Promise<void> {
  await getDocStore().write(
    [{ op: "set", collection: "settings", doc: { ...data, id: SETTINGS_ID } }],
    { message },
  );
}

function merged(): SiteSettings {
  return { ...DEFAULT_SITE_SETTINGS, ...readDoc() };
}

export function subscribeToSettings(
  onChange: (settings: SiteSettings) => void,
  onError?: (err: Error) => void,
): () => void {
  const store = getDocStore();
  let active = true;
  let loaded = false;
  const emit = () => {
    if (!active || !loaded) return;
    try {
      onChange(merged());
    } catch (err) {
      onError?.(err as Error);
    }
  };
  const unsub = store.subscribe((changed) => {
    if (changed.has("settings")) emit();
  });
  store.ready().then(
    () => {
      loaded = true;
      emit();
    },
    (err) => {
      if (active) onError?.(err as Error);
    },
  );
  return () => {
    active = false;
    unsub();
  };
}

export async function getSettings(): Promise<SiteSettings> {
  await getDocStore().ready();
  return merged();
}

// Top-level merge — mirrors Firestore's setDoc({...}, { merge: true })
// at the document root. `undefined` means "clear this field" (Firestore
// deleteField()), so the key is dropped from the merged doc.
export async function updateSettings(patch: Partial<SiteSettings>): Promise<void> {
  await getDocStore().ready();
  const next: Record<string, unknown> = { ...readDoc() };
  for (const [key, value] of Object.entries(patch)) {
    if (value === undefined) delete next[key];
    else next[key] = value;
  }
  await writeDoc(next as Partial<SiteSettings>, "Update site settings");
}

// Nested-map merge on pluginConfigs: other plugins' configs are
// untouched, the named plugin's config is replaced wholesale.
export async function updatePluginConfig<T>(pluginId: string, config: T): Promise<void> {
  await getDocStore().ready();
  const current = readDoc();
  const pluginConfigs = { ...(current.pluginConfigs ?? {}) } as Record<string, unknown>;
  pluginConfigs[pluginId] = config;
  await writeDoc({ ...current, pluginConfigs }, `Update ${pluginId} plugin settings`);
}

export async function updateThemeConfig<T>(themeId: string, config: T): Promise<void> {
  await getDocStore().ready();
  const current = readDoc();
  const themeConfigs = { ...(current.themeConfigs ?? {}) } as Record<string, unknown>;
  themeConfigs[themeId] = config;
  await writeDoc({ ...current, themeConfigs }, `Update ${themeId} theme settings`);
}
