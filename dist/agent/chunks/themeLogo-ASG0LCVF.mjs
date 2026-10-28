import { createRequire as __acmsRequire } from "node:module";
import { fileURLToPath as __acmsPath } from "node:url";
import { dirname as __acmsDirname } from "node:path";
const require2 = __acmsRequire(import.meta.url);
const __filename = __acmsPath(import.meta.url);
const __dirname = __acmsDirname(__filename);
import { b as bytesToBase64 } from "./index-BA9sR5p-.mjs";
import { u as uploadFile, d as deleteFile } from "./siteFiles-DJqhBc65.mjs";
let imageProcessor = null;
function setImageProcessor(impl) {
  imageProcessor = impl;
}
function validateInputExtension(filename, allowed) {
  const lower = filename.toLowerCase();
  const dot = lower.lastIndexOf(".");
  const ext = dot >= 0 ? lower.slice(dot) : "";
  const matches = allowed.map((e) => e.startsWith(".") ? e.toLowerCase() : `.${e.toLowerCase()}`);
  if (!matches.includes(ext)) {
    return `Unsupported file type "${ext}". Accepted: ${matches.join(", ")}.`;
  }
  return null;
}
function planFit(sourceWidth, sourceHeight, format) {
  const fit = format.fit ?? "cover";
  const targetW = format.width;
  const targetH = format.height;
  const sourceRatio = sourceWidth / sourceHeight;
  const targetRatio = targetW / targetH;
  if (fit === "cover") {
    let srcW = sourceWidth;
    let srcH = sourceHeight;
    let srcX = 0;
    let srcY = 0;
    if (sourceRatio > targetRatio) {
      srcW = sourceHeight * targetRatio;
      srcX = (sourceWidth - srcW) / 2;
    } else {
      srcH = sourceWidth / targetRatio;
      srcY = (sourceHeight - srcH) / 2;
    }
    return {
      canvasWidth: targetW,
      canvasHeight: targetH,
      srcX,
      srcY,
      srcWidth: srcW,
      srcHeight: srcH,
      drawWidth: targetW,
      drawHeight: targetH
    };
  }
  const scale = Math.min(targetW / sourceWidth, targetH / sourceHeight, 1);
  const drawW = Math.round(sourceWidth * scale);
  const drawH = Math.round(sourceHeight * scale);
  return {
    canvasWidth: drawW,
    canvasHeight: drawH,
    srcX: 0,
    srcY: 0,
    srcWidth: sourceWidth,
    srcHeight: sourceHeight,
    drawWidth: drawW,
    drawHeight: drawH
  };
}
function normalizeQuality(value) {
  if (!Number.isFinite(value)) return 0.8;
  return Math.max(0, Math.min(1, value > 1 ? value / 100 : value));
}
async function processImage(file, opts) {
  if (imageProcessor) return imageProcessor(file, opts);
  const bitmap = await createImageBitmap(file);
  try {
    const globalQuality = normalizeQuality(opts.quality);
    const variants = [];
    for (const [name, format] of Object.entries(opts.formats)) {
      const plan = planFit(bitmap.width, bitmap.height, format);
      const canvas = createCanvas(plan.canvasWidth, plan.canvasHeight);
      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("2D canvas context unavailable.");
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";
      ctx.drawImage(
        bitmap,
        plan.srcX,
        plan.srcY,
        plan.srcWidth,
        plan.srcHeight,
        0,
        0,
        plan.drawWidth,
        plan.drawHeight
      );
      const variantQuality = format.quality !== void 0 ? normalizeQuality(format.quality) : globalQuality;
      const blob = await canvasToBlob(canvas, opts.outputMime, variantQuality);
      if (!blob) throw new Error(`Failed to encode variant "${name}".`);
      variants.push({
        name,
        blob,
        width: plan.canvasWidth,
        height: plan.canvasHeight,
        bytes: blob.size
      });
    }
    return variants;
  } finally {
    bitmap.close?.();
  }
}
function createCanvas(width, height) {
  if (typeof OffscreenCanvas !== "undefined") {
    return new OffscreenCanvas(width, height);
  }
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  return canvas;
}
function canvasToBlob(canvas, type, quality) {
  if ("convertToBlob" in canvas) {
    return canvas.convertToBlob({ type, quality });
  }
  return new Promise(
    (resolve) => canvas.toBlob((b) => resolve(b), type, quality)
  );
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
        reject(new Error("Unexpected FileReader result type"));
        return;
      }
      const idx = result.indexOf(",");
      resolve(idx >= 0 ? result.slice(idx + 1) : result);
    };
    reader.onerror = () => reject(reader.error ?? new Error("Failed to read blob"));
    reader.readAsDataURL(blob);
  });
}
function extensionForMime(mime) {
  switch (mime) {
    case "image/webp":
      return "webp";
    case "image/jpeg":
      return "jpg";
    case "image/png":
      return "png";
    default:
      return "bin";
  }
}
function mergeFormats(admin, themeConfig) {
  const themeFormats = themeConfig?.formats ?? {};
  const merged = { ...admin, ...themeFormats };
  const outputFormat = themeConfig?.outputFormat ?? "webp";
  const outputMime = `image/${outputFormat === "jpeg" ? "jpeg" : outputFormat}`;
  const quality = themeConfig?.quality ?? 80;
  const defaultFormat = themeConfig?.defaultFormat ?? (themeFormats["medium"] ? "medium" : Object.keys(themeFormats)[0] ?? "admin-preview");
  return { formats: merged, outputMime, quality, defaultFormat };
}
let logoResizer = null;
function setThemeLogoResizer(impl) {
  logoResizer = impl;
}
function logoPath(themeId) {
  return `theme-assets/${themeId}-logo.webp`;
}
async function resizeImageToWebp(file, width, height, fit, quality = 0.9) {
  if (logoResizer) return logoResizer(file, width, height, fit, quality);
  const bitmap = await createImageBitmap(file);
  const canvas = typeof OffscreenCanvas !== "undefined" ? new OffscreenCanvas(width, height) : Object.assign(document.createElement("canvas"), { width, height });
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas 2D context unavailable.");
  ctx.clearRect(0, 0, width, height);
  if (fit === "cover") {
    const scale = Math.max(width / bitmap.width, height / bitmap.height);
    const sw = width / scale;
    const sh = height / scale;
    const sx = (bitmap.width - sw) / 2;
    const sy = (bitmap.height - sh) / 2;
    ctx.drawImage(bitmap, sx, sy, sw, sh, 0, 0, width, height);
  } else {
    const scale = Math.min(width / bitmap.width, height / bitmap.height);
    const dw = bitmap.width * scale;
    const dh = bitmap.height * scale;
    const dx = (width - dw) / 2;
    const dy = (height - dh) / 2;
    ctx.drawImage(bitmap, 0, 0, bitmap.width, bitmap.height, dx, dy, dw, dh);
  }
  bitmap.close?.();
  if ("convertToBlob" in canvas) {
    return canvas.convertToBlob({ type: "image/webp", quality });
  }
  return await new Promise((resolve, reject) => {
    canvas.toBlob(
      (b) => b ? resolve(b) : reject(new Error("Failed to encode WebP.")),
      "image/webp",
      quality
    );
  });
}
async function uploadThemeLogo(args) {
  const blob = await resizeImageToWebp(
    args.file,
    args.width,
    args.height,
    args.fit ?? "contain"
  );
  const base64 = await blobToBase64(blob);
  await uploadFile({
    path: logoPath(args.themeId),
    content: base64,
    encoding: "base64"
  });
}
async function removeThemeLogo(themeId) {
  await deleteFile(logoPath(themeId));
}
const themeLogo = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  logoPath,
  removeThemeLogo,
  setThemeLogoResizer,
  uploadThemeLogo
}, Symbol.toStringTag, { value: "Module" }));
export {
  planFit as a,
  blobToBase64 as b,
  setThemeLogoResizer as c,
  extensionForMime as e,
  logoPath as l,
  mergeFormats as m,
  processImage as p,
  removeThemeLogo as r,
  setImageProcessor as s,
  themeLogo as t,
  uploadThemeLogo as u,
  validateInputExtension as v
};
