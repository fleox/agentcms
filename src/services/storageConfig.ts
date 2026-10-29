// Backend dispatcher for the publish-connector config store.
//
// Records which publish connector is active and its settings
// (Firestore `config/storage` vs the doc store's `config/storage`).
// When absent, the storage layer defaults to the "browser-mirror"
// connector.
//
// Same HOISTED-function + lazy-impl pattern as every other dispatcher
// (TDZ-safety — see services/posts.ts).

import { getBackendKind, isDocStoreBackend } from "../lib/runtimeConfig";
import * as firebase from "./firebase/storageConfig";
import * as docstore from "./docstore/storageConfig";

export interface StorageConfig {
  connectorId: string;
  // Connector-specific settings (repo, bucket, tokens, …). Opaque here;
  // each connector narrows it.
  settings: Record<string, unknown>;
}

let _impl: typeof firebase | typeof docstore | null = null;
// Backend the cached impl belongs to: a process that switches site
// (the agentcms CLI) re-resolves it; the admin never does.
let _implKind: ReturnType<typeof getBackendKind> | undefined;
function impl(): typeof firebase {
  const kind = getBackendKind();
  if (!_impl || kind !== _implKind) {
    _implKind = kind;
    _impl = isDocStoreBackend(kind) ? docstore : firebase;
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
