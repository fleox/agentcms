import { createRequire as __acmsRequire } from "node:module";
import { fileURLToPath as __acmsPath } from "node:url";
import { dirname as __acmsDirname } from "node:path";
const require2 = __acmsRequire(import.meta.url);
const __filename = __acmsPath(import.meta.url);
const __dirname = __acmsDirname(__filename);
async function impl() {
  const { getBackendKind, isDocStoreBackend } = await import("./runtimeConfig-2M2d2Pbu.mjs");
  return isDocStoreBackend(getBackendKind()) ? import("./externalRegistryStore-BHcFYDgP.mjs").then((n) => n.d) : import("./externalRegistryStore-D_PPqoiO.mjs").then((n) => n.f);
}
async function readBackendRegistryForCli() {
  return (await impl()).readBackendRegistry();
}
async function writeBackendRegistryForCli(manifest) {
  await (await impl()).writeBackendRegistry(manifest);
}
export {
  readBackendRegistryForCli,
  writeBackendRegistryForCli
};
