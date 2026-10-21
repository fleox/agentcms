import i18n from "../../i18n";
import { toast } from "../../lib/toast";
import { getBackendKind, isDocStoreBackend } from "../../lib/runtimeConfig";
import { getStorageConfig } from "../storageConfig";
import { browserMirrorFactory } from "./connectors/browserMirror";
import { flexwegConnector } from "./connectors/flexweg";
import { gitPagesFactory } from "./connectors/gitPages";
import { localFolderFactory } from "./connectors/localFolder";
import { phpBridgeFactory } from "./connectors/phpBridge";
import { s3Factory } from "./connectors/s3";
import { StorageError, type StorageConnector } from "./types";

// Registry of publish connectors + resolution of the active one.
//
// A connector is registered either as a ready instance (Flexweg reads
// its own credentials from `config/flexweg`) or as a factory that
// builds an instance from the `settings` stored in `config/storage`
// (repo + token, bucket + keys, …).

export const DEFAULT_CONNECTOR_ID = flexwegConnector.id;

export interface StorageConnectorFactory<S = Record<string, unknown>> {
  id: string;
  create(settings: S): StorageConnector;
}

type Entry = StorageConnector | StorageConnectorFactory;

// Built-ins. Factories are typed on their own settings; the registry
// stores them erased (settings come back from storage untyped).
const connectors = new Map<string, Entry>(
  [
    flexwegConnector,
    gitPagesFactory,
    s3Factory,
    phpBridgeFactory,
    browserMirrorFactory,
    localFolderFactory,
  ].map((e) => [e.id, e as Entry]),
);

function isFactory(entry: Entry): entry is StorageConnectorFactory {
  return typeof (entry as StorageConnectorFactory).create === "function";
}

export function registerStorageConnector(entry: Entry): void {
  connectors.set(entry.id, entry);
  // A re-registration (e.g. an external connector upgraded at runtime)
  // must not keep serving the previous instance.
  if (active && active.id === entry.id) active = null;
}

// Connector used when none is stored: Flexweg for the Flexweg-era
// backends (pre-connector installs), the in-browser ZIP mirror for the
// document-store backends (never silently publish to an unconfigured
// remote).
export function defaultConnectorId(): string {
  return isDocStoreBackend(getBackendKind()) ? "browser-mirror" : DEFAULT_CONNECTOR_ID;
}

export function listStorageConnectorIds(): string[] {
  return [...connectors.keys()];
}

// Builds a connector instance for arbitrary settings — used by the
// setup wizard / Settings "Test connection" before anything is saved.
export function instantiateStorageConnector(id: string, settings: Record<string, unknown>): StorageConnector {
  const entry = connectors.get(id);
  if (!entry) {
    throw new StorageError(i18n.t("flexweg.errors.unknownConnector", { connector: id }), 501);
  }
  return isFactory(entry) ? entry.create(settings) : entry;
}

// The active connector is read once per session from the data backend
// and cached — the choice only changes from Settings, which calls
// invalidateActiveStorageConnector() after writing.
let active: { id: string; connector: Promise<StorageConnector> } | null = null;

async function resolveActive(): Promise<StorageConnector> {
  let config: Awaited<ReturnType<typeof getStorageConfig>> = null;
  try {
    config = await getStorageConfig();
  } catch (err) {
    // Deployments running older Firestore rules (written before the
    // generic `config/{docId}` match) can't read `config/storage`.
    // Those installs predate connectors, so Flexweg is the right answer.
    console.warn("[storage] could not read storage config, defaulting to Flexweg:", err);
  }
  const id = config?.connectorId ?? defaultConnectorId();
  try {
    return instantiateStorageConnector(id, config?.settings ?? {});
  } catch (err) {
    toast.error((err as Error).message);
    throw err;
  }
}

export async function getActiveStorageConnector(): Promise<StorageConnector> {
  if (!active) {
    const connector = resolveActive();
    active = { id: "", connector };
    connector.then(
      (c) => {
        if (active?.connector === connector) active.id = c.id;
      },
      () => {
        // Don't cache failures — the next call retries.
        if (active?.connector === connector) active = null;
      },
    );
  }
  return active.connector;
}

export function invalidateActiveStorageConnector(): void {
  active = null;
}
