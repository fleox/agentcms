import { createRequire as __acmsRequire } from "node:module";
import { fileURLToPath as __acmsPath } from "node:url";
import { dirname as __acmsDirname } from "node:path";
const require2 = __acmsRequire(import.meta.url);
const __filename = __acmsPath(import.meta.url);
const __dirname = __acmsDirname(__filename);
import { withStorageBatch, stageDelete, stageDeletePrefix, currentBatch, pendingImplicitBatch, readStaged, stagePut, implicitBatchFor } from "./batch-686_kLtP.mjs";
import { u as unsupported, b as bytesToBase64 } from "./index-BA9sR5p-.mjs";
import { c as getActiveStorageConnector } from "./registry-CqDse1x2.mjs";
import { StorageError } from "./types-DAD44Ttj.mjs";
const IMAGE_RE = /\.(webp|png|jpe?g|gif|avif|svg|ico)$/i;
const MIME = {
  webp: "image/webp",
  png: "image/png",
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  gif: "image/gif",
  avif: "image/avif",
  svg: "image/svg+xml",
  ico: "image/x-icon"
};
const byPath = /* @__PURE__ */ new Map();
function normalize(path) {
  return path.replace(/^\/+/, "");
}
function rememberUploadedImage(path, base64) {
  if (typeof URL === "undefined" || typeof URL.createObjectURL !== "function") return;
  const clean = normalize(path);
  if (!IMAGE_RE.test(clean)) return;
  try {
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
    const ext = clean.split(".").pop().toLowerCase();
    const previous = byPath.get(clean);
    if (previous) URL.revokeObjectURL(previous);
    byPath.set(clean, URL.createObjectURL(new Blob([bytes], { type: MIME[ext] ?? "application/octet-stream" })));
  } catch {
  }
}
function localImageFor(src) {
  if (!src || byPath.size === 0) return null;
  let pathname = src;
  try {
    pathname = new URL(src, "http://x").pathname;
  } catch {
  }
  pathname = decodeURIComponent(pathname);
  for (const [path, url] of byPath) {
    if (pathname === `/${path}` || pathname.endsWith(`/${path}`)) return url;
  }
  return null;
}
async function getStorageCapabilities() {
  const connector = await getActiveStorageConnector();
  return { ...connector.capabilities, connectorId: connector.id, model: connector.model };
}
async function batchForWrite() {
  const batch = currentBatch();
  if (batch) return { batch, connector: null };
  const connector = await getActiveStorageConnector();
  return { batch: connector.commitBatch ? implicitBatchFor(connector) : null, connector };
}
async function uploadFile(opts) {
  const input = { path: opts.path, content: opts.content, encoding: opts.encoding };
  if (opts.encoding === "base64") rememberUploadedImage(opts.path, opts.content);
  const { batch, connector } = await batchForWrite();
  if (batch) {
    stagePut(batch, input);
    return;
  }
  await connector.put(input, opts.signal);
}
function fileToBase64(file) {
  if (typeof FileReader === "undefined") {
    return file.arrayBuffer().then((buf) => bytesToBase64(new Uint8Array(buf)));
  }
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result;
      if (typeof result !== "string") {
        reject(new Error("Unexpected FileReader result type"));
        return;
      }
      const idx = result.indexOf(",");
      resolve(idx >= 0 ? result.slice(idx + 1) : result);
    };
    reader.onerror = () => reject(reader.error ?? new Error("Failed to read file"));
    reader.readAsDataURL(file);
  });
}
async function deleteFile(path, signal) {
  const { batch, connector } = await batchForWrite();
  if (batch) {
    stageDelete(batch, path);
    return;
  }
  await connector.delete(path, signal);
}
async function getFile(path) {
  for (const batch of [currentBatch(), pendingImplicitBatch()]) {
    if (!batch) continue;
    const staged = readStaged(batch, path);
    if (staged?.kind === "content") return staged.content;
    if (staged?.kind === "deleted") throw new StorageError(`File not found: ${path}`, 404);
  }
  const connector = await getActiveStorageConnector();
  return connector.get(path);
}
async function renameFile(oldPath, newPath) {
  const connector = await getActiveStorageConnector();
  if (connector.rename && !currentBatch()) {
    await connector.rename(oldPath, newPath);
    return;
  }
  const content = await getFile(oldPath);
  await uploadFile({ path: newPath, content });
  await deleteFile(oldPath);
}
async function listFiles(page = 1, perPage = 100) {
  const connector = await getActiveStorageConnector();
  if (!connector.list) throw unsupported("list", connector.id);
  return connector.list(page, perPage);
}
async function createFolder(path) {
  const connector = await getActiveStorageConnector();
  if (!connector.capabilities.folders || !connector.createFolder) return;
  await connector.createFolder(path);
}
async function renameFolder(oldPath, newPath) {
  const connector = await getActiveStorageConnector();
  if (!connector.renameFolder) throw unsupported("renameFolder", connector.id);
  await connector.renameFolder(oldPath, newPath);
}
async function deleteFolder(path) {
  const { batch, connector: direct } = await batchForWrite();
  if (batch) {
    stageDeletePrefix(batch, path);
    return;
  }
  const connector = direct;
  if (connector.deletePrefix) {
    await connector.deletePrefix(path);
    return;
  }
  if (!connector.list) throw unsupported("deleteFolder", connector.id);
  const prefix = path.replace(/^\/+|\/+$/g, "") + "/";
  const perPage = 100;
  const targets = [];
  for (let page = 1; ; page++) {
    const res = await connector.list(page, perPage);
    for (const item of res.items) {
      if (item.type === "file" && item.path.replace(/^\/+/, "").startsWith(prefix)) {
        targets.push(item.path);
      }
    }
    if (res.items.length < perPage) break;
    if (res.total !== void 0 && page * perPage >= res.total) break;
  }
  for (const target of targets) await connector.delete(target);
}
async function publicUrlFor(path) {
  const connector = await getActiveStorageConnector();
  return connector.publicUrl(path);
}
const siteFiles = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  StorageError,
  createFolder,
  deleteFile,
  deleteFolder,
  fileToBase64,
  getFile,
  getStorageCapabilities,
  listFiles,
  publicUrlFor,
  renameFile,
  renameFolder,
  uploadFile,
  withStorageBatch
}, Symbol.toStringTag, { value: "Module" }));
export {
  deleteFolder as a,
  listFiles as b,
  getFile as c,
  deleteFile as d,
  createFolder as e,
  fileToBase64 as f,
  getStorageCapabilities as g,
  renameFile as h,
  localImageFor as l,
  publicUrlFor as p,
  renameFolder as r,
  siteFiles as s,
  uploadFile as u
};
