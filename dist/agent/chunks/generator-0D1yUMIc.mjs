import { createRequire as __acmsRequire } from "node:module";
import { fileURLToPath as __acmsPath } from "node:url";
import { dirname as __acmsDirname } from "node:path";
const require2 = __acmsRequire(import.meta.url);
const __filename = __acmsPath(import.meta.url);
const __dirname = __acmsDirname(__filename);
import { u as uploadFile, a as deleteFolder, d as deleteFile } from "./siteFiles-BiyhNAJI.mjs";
import { b as bytesToBase64 } from "./index-B4uHS09W.mjs";
import "./batch-ByMaB1s-.mjs";
import "./registry-4kb4tftS.mjs";
import "./index-YdkzfKAt.mjs";
import "./toast-CYyyaSAW.mjs";
import "./runtimeConfig-BNLCrrQo.mjs";
import "./index.node-DYLwqGPq.mjs";
import "./index.esm2017-BUfxW6Jp.mjs";
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
import "./firebaseClient-BjUVAcKz.mjs";
import "./index-CuB-ym-g.mjs";
import "./index-CjBqWaZn.mjs";
import "./gitStore-BkclOUWu.mjs";
import "../agentcms.mjs";
import "node:util";
import "node:fs";
import "node:path";
import "node:url";
import "node:os";
import "node:child_process";
import "node:crypto";
import "node:http";
import "./index-K8rfbNOg.mjs";
import "buffer";
import "./types-DAD44Ttj.mjs";
function encodeIco(images) {
  if (images.length === 0) throw new Error("encodeIco: at least one image required.");
  const headerSize = 6;
  const entrySize = 16;
  const dirSize = headerSize + entrySize * images.length;
  const totalDataSize = images.reduce((acc, img) => acc + img.png.length, 0);
  const out = new Uint8Array(dirSize + totalDataSize);
  const view = new DataView(out.buffer);
  view.setUint16(0, 0, true);
  view.setUint16(2, 1, true);
  view.setUint16(4, images.length, true);
  let dataOffset = dirSize;
  images.forEach((img, i) => {
    const entryOffset = headerSize + i * entrySize;
    const widthByte = img.size >= 256 ? 0 : img.size;
    const heightByte = img.size >= 256 ? 0 : img.size;
    out[entryOffset + 0] = widthByte;
    out[entryOffset + 1] = heightByte;
    out[entryOffset + 2] = 0;
    out[entryOffset + 3] = 0;
    view.setUint16(entryOffset + 4, 1, true);
    view.setUint16(entryOffset + 6, 32, true);
    view.setUint32(entryOffset + 8, img.png.length, true);
    view.setUint32(entryOffset + 12, dataOffset, true);
    out.set(img.png, dataOffset);
    dataOffset += img.png.length;
  });
  return out;
}
const FAVICON_FOLDER = "favicon";
const FAVICON_FILES = {
  png96: "favicon-96x96.png",
  apple: "apple-touch-icon.png",
  manifest192: "web-app-manifest-192x192.png",
  manifest512: "web-app-manifest-512x512.png",
  ico: "favicon.ico",
  svg: "favicon.svg",
  manifest: "site.webmanifest"
};
let rasterizer = null;
function setFaviconRasterizer(impl) {
  rasterizer = impl;
}
function makeCanvas(width, height) {
  if (typeof OffscreenCanvas !== "undefined") {
    return new OffscreenCanvas(width, height);
  }
  return Object.assign(document.createElement("canvas"), { width, height });
}
async function canvasToBlob(canvas, mime, quality) {
  if ("convertToBlob" in canvas) {
    return canvas.convertToBlob({ type: mime, quality });
  }
  return await new Promise((resolve, reject) => {
    canvas.toBlob(
      (b) => b ? resolve(b) : reject(new Error("Failed to encode image.")),
      mime,
      quality
    );
  });
}
function blobToBase64(blob) {
  if (typeof FileReader === "undefined") {
    return blob.arrayBuffer().then((buf) => bytesToBase64(new Uint8Array(buf)));
  }
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result;
      if (typeof result !== "string") {
        reject(new Error("Unexpected FileReader result."));
        return;
      }
      const idx = result.indexOf(",");
      resolve(idx >= 0 ? result.slice(idx + 1) : result);
    };
    reader.onerror = () => reject(reader.error ?? new Error("FileReader failed."));
    reader.readAsDataURL(blob);
  });
}
async function blobToText(blob) {
  if (typeof FileReader === "undefined") return blob.text();
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result ?? ""));
    reader.onerror = () => reject(reader.error ?? new Error("FileReader failed."));
    reader.readAsText(blob);
  });
}
function renderSquare(bitmap, size, background) {
  const canvas = makeCanvas(size, size);
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas 2D context unavailable.");
  if (background) {
    ctx.fillStyle = background;
    ctx.fillRect(0, 0, size, size);
  } else {
    ctx.clearRect(0, 0, size, size);
  }
  const scale = Math.max(size / bitmap.width, size / bitmap.height);
  const sw = size / scale;
  const sh = size / scale;
  const sx = (bitmap.width - sw) / 2;
  const sy = (bitmap.height - sh) / 2;
  ctx.drawImage(bitmap, sx, sy, sw, sh, 0, 0, size, size);
  return canvas;
}
async function squareToPngBlob(bitmap, size, background) {
  const canvas = renderSquare(bitmap, size, background);
  return canvasToBlob(canvas, "image/png");
}
async function renderWithCanvas(file, requests) {
  const bitmap = await createImageBitmap(file);
  try {
    const out = [];
    for (const r of requests) out.push(await squareToPngBlob(bitmap, r.size, r.background));
    return out;
  } finally {
    bitmap.close?.();
  }
}
async function blobToBytes(blob) {
  const buf = await blob.arrayBuffer();
  return new Uint8Array(buf);
}
function favPath(file) {
  return `${FAVICON_FOLDER}/${file}`;
}
function buildSiteWebmanifest(input) {
  const manifest = {
    name: input.name,
    short_name: input.shortName,
    icons: [
      {
        src: FAVICON_FILES.manifest192,
        sizes: "192x192",
        type: "image/png",
        purpose: "maskable"
      },
      {
        src: FAVICON_FILES.manifest512,
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable"
      }
    ],
    theme_color: input.themeColor,
    background_color: input.backgroundColor,
    display: input.display
  };
  return JSON.stringify(manifest, null, 2);
}
async function generateAndUploadFavicons(args) {
  const isSvgSource = args.file.type === "image/svg+xml";
  const requests = [
    { size: 96, background: null },
    { size: 180, background: "#ffffff" },
    { size: 192, background: null },
    { size: 512, background: null },
    { size: 16, background: null },
    { size: 32, background: null },
    { size: 48, background: null }
  ];
  const [png96, appleTouch, manifest192, manifest512, ico16, ico32, ico48] = rasterizer ? await rasterizer(args.file, requests) : await renderWithCanvas(args.file, requests);
  const icoEntries = [
    { size: 16, png: await blobToBytes(ico16) },
    { size: 32, png: await blobToBytes(ico32) },
    { size: 48, png: await blobToBytes(ico48) }
  ];
  const icoBytes = encodeIco(icoEntries);
  const icoBlob = new Blob([icoBytes], { type: "image/x-icon" });
  await uploadFile({
    path: favPath(FAVICON_FILES.png96),
    content: await blobToBase64(png96),
    encoding: "base64"
  });
  await uploadFile({
    path: favPath(FAVICON_FILES.apple),
    content: await blobToBase64(appleTouch),
    encoding: "base64"
  });
  await uploadFile({
    path: favPath(FAVICON_FILES.manifest192),
    content: await blobToBase64(manifest192),
    encoding: "base64"
  });
  await uploadFile({
    path: favPath(FAVICON_FILES.manifest512),
    content: await blobToBase64(manifest512),
    encoding: "base64"
  });
  await uploadFile({
    path: favPath(FAVICON_FILES.ico),
    content: await blobToBase64(icoBlob),
    encoding: "base64"
  });
  let hasSvg = false;
  if (isSvgSource) {
    const svgText = await blobToText(args.file);
    await uploadFile({
      path: favPath(FAVICON_FILES.svg),
      content: svgText,
      encoding: "utf-8"
    });
    hasSvg = true;
  }
  await uploadFile({
    path: favPath(FAVICON_FILES.manifest),
    content: buildSiteWebmanifest(args.pwa),
    encoding: "utf-8"
  });
  return {
    hasIco: true,
    hasSvg,
    hasPng96: true,
    hasAppleTouch: true,
    hasManifest192: true,
    hasManifest512: true,
    hasManifest: true
  };
}
async function regenerateManifest(args) {
  await uploadFile({
    path: favPath(FAVICON_FILES.manifest),
    content: buildSiteWebmanifest(args.pwa),
    encoding: "utf-8"
  });
}
async function removeAllFavicons() {
  try {
    await deleteFolder(FAVICON_FOLDER);
    return;
  } catch {
  }
  for (const file of Object.values(FAVICON_FILES)) {
    try {
      await deleteFile(favPath(file));
    } catch {
    }
  }
}
export {
  FAVICON_FILES,
  FAVICON_FOLDER,
  generateAndUploadFavicons,
  regenerateManifest,
  removeAllFavicons,
  setFaviconRasterizer
};
