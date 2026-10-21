// Document-store backend storage for the external (plugins / themes)
// registry ("markdown-git" / "local" backends). Persists the manifest
// as doc id "externalRegistry" in the `config` collection. Read by the
// dispatcher in the top-level services/externalRegistryStore.ts — same
// readBackendRegistry / writeBackendRegistry contract as the Firebase
// and SQLite impls.

import { getDocStore } from "./index";
import type { ExternalManifest } from "../externalRegistry";

// Same id as the Firestore doc for symmetry (the Firebase impl exports
// it too, so the dispatcher's `typeof firebase` shape is satisfied).
export const EXTERNAL_REGISTRY_DOC_ID = "externalRegistry";

function normaliseManifest(value: unknown): ExternalManifest | null {
  if (!value || typeof value !== "object") return null;
  const v = value as Partial<ExternalManifest>;
  if (!Array.isArray(v.plugins) && !Array.isArray(v.themes)) return null;
  return {
    plugins: Array.isArray(v.plugins) ? [...v.plugins] : [],
    themes: Array.isArray(v.themes) ? [...v.themes] : [],
  };
}

// Returns null when absent (fresh install) so the dispatcher's
// orchestration falls through to the legacy / defaults files.
export async function readBackendRegistry(): Promise<ExternalManifest | null> {
  const store = getDocStore();
  await store.ready();
  return normaliseManifest(store.get("config", EXTERNAL_REGISTRY_DOC_ID));
}

export async function writeBackendRegistry(manifest: ExternalManifest): Promise<void> {
  await getDocStore().write(
    [
      {
        op: "set",
        collection: "config",
        doc: {
          id: EXTERNAL_REGISTRY_DOC_ID,
          plugins: manifest.plugins,
          themes: manifest.themes,
        },
      },
    ],
    { message: "Update installed plugins and themes" },
  );
}
