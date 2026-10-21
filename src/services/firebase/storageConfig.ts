import { doc, getDoc, setDoc } from "firebase/firestore";
import { collections, configDocs, getDb } from "../firebaseClient";
import type { StorageConfig } from "../storageConfig";

// Firestore implementation of the publish-connector config store
// (`config/storage`). Covered by the generic `config/{docId}` rule:
// readable by editors (the publisher needs it), writable by admins.

const storageDocRef = () => doc(getDb(), collections.config, configDocs.storage);

export async function getStorageConfig(): Promise<StorageConfig | null> {
  const snap = await getDoc(storageDocRef());
  if (!snap.exists()) return null;
  const data = snap.data() as Partial<StorageConfig> | undefined;
  if (!data?.connectorId) return null;
  return { connectorId: data.connectorId, settings: data.settings ?? {} };
}

export async function setStorageConfig(next: StorageConfig): Promise<void> {
  await setDoc(storageDocRef(), { connectorId: next.connectorId, settings: next.settings ?? {} });
}
