import type { ExternalManifest } from "../../src/services/externalRegistry";

// The installed-extensions registry as stored in the site's data backend
// (Firestore settings/externalRegistry or docstore config/externalRegistry),
// without the admin's browser-only fallbacks (relative fetches).

async function impl() {
  const { getBackendKind, isDocStoreBackend } = await import("../../src/lib/runtimeConfig");
  return isDocStoreBackend(getBackendKind())
    ? import("../../src/services/docstore/externalRegistryStore")
    : import("../../src/services/firebase/externalRegistryStore");
}

export async function readBackendRegistryForCli(): Promise<ExternalManifest | null> {
  return (await impl()).readBackendRegistry();
}

export async function writeBackendRegistryForCli(manifest: ExternalManifest): Promise<void> {
  await (await impl()).writeBackendRegistry(manifest);
}
