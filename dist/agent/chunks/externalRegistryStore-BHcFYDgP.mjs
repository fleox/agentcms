import { createRequire as __acmsRequire } from "node:module";
import { fileURLToPath as __acmsPath } from "node:url";
import { dirname as __acmsDirname } from "node:path";
const require2 = __acmsRequire(import.meta.url);
const __filename = __acmsPath(import.meta.url);
const __dirname = __acmsDirname(__filename);
import { g as getDocStore } from "./registry-DMuFJNAR.mjs";
const EXTERNAL_REGISTRY_DOC_ID = "externalRegistry";
function normaliseManifest(value) {
  if (!value || typeof value !== "object") return null;
  const v = value;
  if (!Array.isArray(v.plugins) && !Array.isArray(v.themes)) return null;
  return {
    plugins: Array.isArray(v.plugins) ? [...v.plugins] : [],
    themes: Array.isArray(v.themes) ? [...v.themes] : []
  };
}
async function readBackendRegistry() {
  const store = getDocStore();
  await store.ready();
  return normaliseManifest(store.get("config", EXTERNAL_REGISTRY_DOC_ID));
}
async function writeBackendRegistry(manifest) {
  await getDocStore().write(
    [
      {
        op: "set",
        collection: "config",
        doc: {
          id: EXTERNAL_REGISTRY_DOC_ID,
          plugins: manifest.plugins,
          themes: manifest.themes
        }
      }
    ],
    { message: "Update installed plugins and themes" }
  );
}
const docstoreStore = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  EXTERNAL_REGISTRY_DOC_ID,
  readBackendRegistry,
  writeBackendRegistry
}, Symbol.toStringTag, { value: "Module" }));
export {
  docstoreStore as d
};
