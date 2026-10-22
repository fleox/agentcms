import { createRequire as __acmsRequire } from "node:module";
import { fileURLToPath as __acmsPath } from "node:url";
import { dirname as __acmsDirname } from "node:path";
const require2 = __acmsRequire(import.meta.url);
const __filename = __acmsPath(import.meta.url);
const __dirname = __acmsDirname(__filename);
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import { E as buildConfigJsSource, F as createFilesApiConnector, G as instantiateStorageConnector, H as setSqlJsWasmBinary } from "./registry-BU0AVXwQ.mjs";
import { d as distRoot, C as CliError } from "../agentcms.mjs";
import { c as cleanFolder } from "./plan-BhnegERT.mjs";
import "util";
import "crypto";
import "process";
import "tls";
import "fs";
import "os";
import "net";
import "events";
import "stream";
import "path";
import "http2";
import "http";
import "url";
import "dns";
import "zlib";
import "buffer";
import "node:util";
import "node:url";
import "node:child_process";
import "node:os";
import "node:http";
if (typeof window !== "undefined" && typeof window.addEventListener === "function") {
  window.addEventListener("beforeunload", (e) => {
  });
}
const ADMIN_MANIFEST = "admin-files.json";
const MANIFEST = ADMIN_MANIFEST;
function missingIndexReferences(indexHtml, files) {
  const known = /* @__PURE__ */ new Set([...files, "config.js", MANIFEST]);
  const refs = [...indexHtml.matchAll(/(?:src|href)="\.\/([^"?#]+)"/g)].map((m) => m[1]);
  return refs.filter((ref) => !known.has(ref));
}
function hostingConnector(target) {
  if (target.connectorId === "flexweg") {
    const s = target.settings;
    return createFilesApiConnector("flexweg", async () => ({
      apiKey: s.apiKey ?? "",
      siteUrl: s.siteUrl ?? "",
      apiBaseUrl: s.apiBaseUrl || "https://www.flexweg.com/api/v1"
    }));
  }
  return instantiateStorageConnector(target.connectorId, target.settings);
}
const putOp = (path, bytes) => ({
  type: "put",
  path,
  content: Buffer.from(bytes).toString("base64"),
  encoding: "base64"
});
function readLocalAdminManifest() {
  const file = join(distRoot(), "admin", ADMIN_MANIFEST);
  try {
    return JSON.parse(readFileSync(file, "utf8"));
  } catch {
    throw new CliError("admin-missing", `No admin build at ${file}.`, "Run `npm run build` in a clone, or use the npm package.");
  }
}
function adminOps(folder, runtime) {
  const dir = cleanFolder(folder);
  const root = join(distRoot(), "admin");
  const manifest = readLocalAdminManifest();
  const index = readFileSync(join(root, "index.html"));
  const missing = missingIndexReferences(index.toString("utf8"), manifest.files);
  if (missing.length) {
    throw new CliError("admin-inconsistent", `dist/admin/index.html references files missing from the build: ${missing.join(", ")}.`, "Rebuild (`npm run build`).");
  }
  const files = [...manifest.files.filter((f) => f !== "index.html"), "index.html"];
  const ops = files.map((f) => putOp(`${dir}/${f}`, readFileSync(join(root, f))));
  ops.push({ type: "put", path: `${dir}/${ADMIN_MANIFEST}`, content: JSON.stringify(manifest, null, 2) + "\n" });
  ops.push({ type: "put", path: `${dir}/config.js`, content: buildConfigJsSource(runtime) });
  return { ops, manifest };
}
function themeAssetOps() {
  const root = join(distRoot(), "theme-assets");
  const walk = (dir) => readdirSync(dir).flatMap((name) => {
    const abs = join(dir, name);
    return statSync(abs).isDirectory() ? walk(abs) : [abs];
  });
  return walk(root).filter((abs) => !abs.endsWith(".DS_Store")).sort().map((abs) => putOp(`theme-assets/${relative(root, abs).split("\\").join("/")}`, readFileSync(abs)));
}
async function applyOps(connector, ops, onProgress) {
  if (connector.commitBatch) {
    await connector.commitBatch(ops);
    return;
  }
  for (const op of ops) {
    if (op.type === "put") await connector.put(op);
    else if (op.type === "delete") await connector.delete(op.path);
    else if (connector.deletePrefix) await connector.deletePrefix(op.path);
  }
}
function loadSqlWasm() {
  const assets = join(distRoot(), "admin", "assets");
  const wasm = readdirSync(assets).find((f) => /^sql-wasm.*\.wasm$/.test(f));
  if (!wasm) throw new CliError("admin-missing", `sql.js WASM not found in ${assets}.`);
  setSqlJsWasmBinary(new Uint8Array(readFileSync(join(assets, wasm))));
}
export {
  adminOps,
  applyOps,
  hostingConnector,
  loadSqlWasm,
  readLocalAdminManifest,
  themeAssetOps
};
