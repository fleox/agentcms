// Document-store implementation of the publish-connector config store
// ("markdown-git" / "local" backends). Doc id "storage" in the `config`
// collection. Readable by any signed-in user (secrets
// are kept per browser, not in the doc).

import { getDocStore } from "./index";
import type { StorageConfig } from "../storageConfig";

const CONFIG_ID = "storage";

export async function getStorageConfig(): Promise<StorageConfig | null> {
  const store = getDocStore();
  await store.ready();
  const data = store.get("config", CONFIG_ID) as Partial<StorageConfig> | undefined;
  if (!data?.connectorId) return null;
  return { connectorId: data.connectorId, settings: { ...(data.settings ?? {}) } };
}

export async function setStorageConfig(next: StorageConfig): Promise<void> {
  await getDocStore().write(
    [
      {
        op: "set",
        collection: "config",
        doc: { id: CONFIG_ID, connectorId: next.connectorId, settings: next.settings ?? {} },
      },
    ],
    { message: "Update publish storage settings" },
  );
}
