// SQLite implementation of the publish-connector config store
// (`config` table, key="storage"). Same exposure as the Flexweg API key:
// readable by any authenticated user.

import { sqlExec, sqlQuery } from "./client";
import type { StorageConfig } from "../storageConfig";

const CONFIG_KEY = "storage";

export async function getStorageConfig(): Promise<StorageConfig | null> {
  const { rows } = await sqlQuery<{ value: string }>(
    "SELECT value FROM config WHERE key = ?",
    [CONFIG_KEY],
  );
  if (rows.length === 0) return null;
  let data: Partial<StorageConfig>;
  try {
    data = JSON.parse(rows[0].value) as Partial<StorageConfig>;
  } catch {
    return null;
  }
  if (!data.connectorId) return null;
  return { connectorId: data.connectorId, settings: data.settings ?? {} };
}

export async function setStorageConfig(next: StorageConfig): Promise<void> {
  const payload = JSON.stringify({ connectorId: next.connectorId, settings: next.settings ?? {} });
  await sqlExec(
    `INSERT INTO config (key, value) VALUES (?, ?)
     ON CONFLICT(key) DO UPDATE SET value = excluded.value`,
    [CONFIG_KEY, payload],
  );
}
