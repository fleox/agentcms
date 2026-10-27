import { createRequire as __acmsRequire } from "node:module";
import { fileURLToPath as __acmsPath } from "node:url";
import { dirname as __acmsDirname } from "node:path";
const require2 = __acmsRequire(import.meta.url);
const __filename = __acmsPath(import.meta.url);
const __dirname = __acmsDirname(__filename);
import { g as getDocStore } from "./registry-DClFwwHa.mjs";
import "./index-BVQJP7xk.mjs";
import "./toast-CYyyaSAW.mjs";
import "./types-DAD44Ttj.mjs";
import "./runtimeConfig-DyVDQuHr.mjs";
import "./firebaseClient-BTpUMbPI.mjs";
import "util";
import "crypto";
import "process";
import "tls";
import "fs";
import "os";
import "net";
import "events";
import "stream";
import "./_commonjsHelpers-DtUDk_0l.mjs";
import "path";
import "http2";
import "http";
import "url";
import "dns";
import "zlib";
import "./gitStore-2dU0WJGr.mjs";
import "../agentcms.mjs";
import "node:util";
import "node:fs";
import "node:path";
import "node:url";
import "node:os";
import "node:child_process";
import "node:http";
import "./index-K8rfbNOg.mjs";
import "buffer";
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
export {
  EXTERNAL_REGISTRY_DOC_ID,
  readBackendRegistry,
  writeBackendRegistry
};
