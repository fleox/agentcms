import { createRequire as __acmsRequire } from "node:module";
import { fileURLToPath as __acmsPath } from "node:url";
import { dirname as __acmsDirname } from "node:path";
const require2 = __acmsRequire(import.meta.url);
const __filename = __acmsPath(import.meta.url);
const __dirname = __acmsDirname(__filename);
import { a as getDoc, aQ as setDoc, d as doc } from "./index.node-DYLwqGPq.mjs";
import { collections, getDb } from "./firebaseClient-BjUVAcKz.mjs";
const EXTERNAL_REGISTRY_DOC_ID = "externalRegistry";
function registryDocRef() {
  return doc(getDb(), collections.settings, EXTERNAL_REGISTRY_DOC_ID);
}
function normaliseManifest(value) {
  if (!value || typeof value !== "object") return null;
  const v = value;
  if (!Array.isArray(v.plugins) && !Array.isArray(v.themes)) return null;
  return {
    plugins: Array.isArray(v.plugins) ? v.plugins : [],
    themes: Array.isArray(v.themes) ? v.themes : []
  };
}
async function readBackendRegistry() {
  const snap = await getDoc(registryDocRef());
  if (!snap.exists()) return null;
  return normaliseManifest(snap.data());
}
async function writeBackendRegistry(manifest) {
  await setDoc(registryDocRef(), {
    plugins: manifest.plugins,
    themes: manifest.themes
  });
}
const firebaseStore = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  EXTERNAL_REGISTRY_DOC_ID,
  readBackendRegistry,
  writeBackendRegistry
}, Symbol.toStringTag, { value: "Module" }));
export {
  firebaseStore as f
};
