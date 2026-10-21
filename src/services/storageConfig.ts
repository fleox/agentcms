// Backend dispatcher for the publish-connector config store.
//
// Records which publish connector is active and its settings
// (Firestore `config/storage` vs SQLite `config` table key "storage").
// When absent, the storage layer defaults to the "flexweg" connector,
// whose credentials keep living in `config/flexweg` — so installs that
// predate connectors need no migration.
//
// Same HOISTED-function + lazy-impl pattern as every other dispatcher
// (TDZ-safety — see services/posts.ts).

import { getBackendKind, isDocStoreBackend } from "../lib/runtimeConfig";
import * as firebase from "./firebase/storageConfig";
import * as sqlite from "./flexweg-sqlite/storageConfig";
import * as docstore from "./docstore/storageConfig";

export interface StorageConfig {
  connectorId: string;
  // Connector-specific settings (repo, bucket, tokens, …). Opaque here;
  // each connector narrows it.
  settings: Record<string, unknown>;
}

let _impl: typeof firebase | typeof sqlite | typeof docstore | null = null;
function impl(): typeof firebase {
  if (!_impl) {
    const kind = getBackendKind();
    _impl = kind === "flexweg-sqlite" ? sqlite : isDocStoreBackend(kind) ? docstore : firebase;
  }
  return _impl as typeof firebase;
}

export function getStorageConfig(
  ...args: Parameters<typeof firebase.getStorageConfig>
): ReturnType<typeof firebase.getStorageConfig> {
  return impl().getStorageConfig(...args);
}
export function setStorageConfig(
  ...args: Parameters<typeof firebase.setStorageConfig>
): ReturnType<typeof firebase.setStorageConfig> {
  return impl().setStorageConfig(...args);
}
