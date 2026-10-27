import { existsSync, readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import mozjpegDecFactory from "@jsquash/jpeg/codec/dec/mozjpeg_dec.js";
import mozjpegEncFactory from "@jsquash/jpeg/codec/enc/mozjpeg_enc.js";
import { defaultOptions as jpegDefaults } from "@jsquash/jpeg/meta.js";
import { decode as pngDecodeWasm, encode as pngEncodeWasm, initSync as initPngSync } from "@jsquash/png/codec/pkg/squoosh_png.js";
import { initSync as initResizeSync, resize as resizeWasm } from "@jsquash/resize/lib/resize/pkg/squoosh_resize.js";
import webpDecFactory from "@jsquash/webp/codec/dec/webp_dec.js";
import webpEncFactory from "@jsquash/webp/codec/enc/webp_enc_simd.js";
import { defaultOptions as webpDefaults } from "@jsquash/webp/meta.js";
import { distRoot } from "../paths";
import { JSQUASH_WASM, type JsquashWasmName } from "../vendor/jsquashWasm";
import { planFit, setImageProcessor, type ProcessImageOptions, type ProcessedVariant } from "../../src/services/imageProcessing";
import { setFaviconRasterizer, type SquarePngRequest } from "../../src/mu-plugins/agentcms-favicon/generator";
import { setThemeLogoResizer } from "../../src/services/themeLogo";

// Node implementation of the admin's image pipeline (createImageBitmap +
// OffscreenCanvas + convertToBlob in the browser), so the CLI can run
// uploadMedia and the favicon generator unchanged. Codecs are the
// squoosh WASM builds from @jsquash/*: their .wasm files are vendored
// into dist/agent/vendor/wasm (the npm package has no node_modules) and
// compiled once per process.
//
// Behaviour mirrors the browser: JPEG EXIF orientation is applied
// (createImageBitmap's default), dimensions come from planFit, PNG
// output is lossless (quality ignored, like canvas), JPEG output is
// flattened over black (what canvas does with transparent pixels).

declare const __AGENTCMS_BUNDLED__: boolean | undefined;

export interface RgbaImage {
  data: Uint8Array;
  width: number;
  height: number;
}

// ─── WASM loading ──────────────────────────────────────────────────

// Bundled: dist/agent/vendor/wasm/<name>, found from this module's own
// file (the entry or a chunks/ file, whichever Rollup put it in), with
// distRoot() as the fallback. From source: the package in node_modules.
export function wasmPath(name: JsquashWasmName, bundled = isBundled()): string {
  if (!bundled) return createRequire(import.meta.url).resolve(JSQUASH_WASM[name]);
  const here = dirname(fileURLToPath(import.meta.url));
  const candidates = [join(here, "vendor", "wasm", name), join(here, "..", "vendor", "wasm", name)];
  return candidates.find((file) => existsSync(file)) ?? join(distRoot(), "agent", "vendor", "wasm", name);
}

function isBundled(): boolean {
  return typeof __AGENTCMS_BUNDLED__ !== "undefined" && __AGENTCMS_BUNDLED__;
}

const compiled = new Map<JsquashWasmName, WebAssembly.Module>();
function wasmModule(name: JsquashWasmName): WebAssembly.Module {
  let mod = compiled.get(name);
  if (!mod) {
    const file = wasmPath(name);
    let bytes: Buffer;
    try {
      bytes = readFileSync(file);
    } catch {
      throw new Error(`Image codec ${file} is missing — the agentcms install is incomplete (rebuild with \`npm run build\`).`);
    }
    mod = new WebAssembly.Module(new Uint8Array(bytes));
    compiled.set(name, mod);
  }
  return mod;
}

// Emscripten codecs (webp, mozjpeg): instantiate from our compiled module
// instead of letting them fetch / read the .wasm next to their JS.
interface EmscriptenCodec {
  decode?(data: Uint8Array, ...rest: unknown[]): { data: Uint8ClampedArray; width: number; height: number } | null;
  encode?(data: Uint8Array, width: number, height: number, options: unknown): Uint8Array | null;
}
type EmscriptenFactory = (overrides: Record<string, unknown>) => Promise<EmscriptenCodec>;

const codecs = new Map<JsquashWasmName, Promise<EmscriptenCodec>>();
function emscripten(name: JsquashWasmName, factory: unknown): Promise<EmscriptenCodec> {
  let p = codecs.get(name);
  if (!p) {
    const mod = wasmModule(name);
    p = (factory as EmscriptenFactory)({
      noInitialRun: true,
      instantiateWasm: (imports: WebAssembly.Imports, callback: (i: WebAssembly.Instance) => void) => {
        const instance = new WebAssembly.Instance(mod, imports);
        callback(instance);
        return instance.exports;
      },
    });
    codecs.set(name, p);
  }
  return p;
}

let wasmBindgenReady = false;
function initWasmBindgen(): void {
  if (wasmBindgenReady) return;
  initPngSync(wasmModule("squoosh_png_bg.wasm"));
  initResizeSync(wasmModule("squoosh_resize_bg.wasm"));
  wasmBindgenReady = true;
}

// The codecs build their results with `new ImageData(...)`.
function ensureImageData(): void {
  const g = globalThis as Record<string, unknown>;
  if (typeof g.ImageData !== "undefined") return;
  g.ImageData = class ImageData {
    constructor(
      public data: Uint8ClampedArray,
      public width: number,
      public height: number,
    ) {}
  };
}

// ─── Decode ────────────────────────────────────────────────────────

export type SourceKind = "jpeg" | "png" | "webp" | "gif" | "svg" | "unknown";

export function sniffImage(bytes: Uint8Array): SourceKind {
  const ascii = (from: number, to: number) => String.fromCharCode(...bytes.subarray(from, to));
  if (bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) return "jpeg";
  if (bytes[0] === 0x89 && ascii(1, 4) === "PNG") return "png";
  if (ascii(0, 4) === "RIFF" && ascii(8, 12) === "WEBP") return "webp";
  if (ascii(0, 4) === "GIF8") return "gif";
  const head = new TextDecoder().decode(bytes.subarray(0, 512)).trimStart().toLowerCase();
  if (head.startsWith("<svg") || (head.startsWith("<?xml") && head.includes("<svg"))) return "svg";
  return "unknown";
}

function toRgba(img: { data: ArrayLike<number> & { buffer: ArrayBufferLike; byteOffset: number; byteLength: number }; width: number; height: number }): RgbaImage {
  return { data: new Uint8Array(img.data.buffer, img.data.byteOffset, img.data.byteLength).slice(), width: img.width, height: img.height };
}

export async function decodeImage(bytes: Uint8Array): Promise<RgbaImage> {
  ensureImageData();
  const kind = sniffImage(bytes);
  switch (kind) {
    case "jpeg": {
      const codec = await emscripten("mozjpeg_dec.wasm", mozjpegDecFactory);
      // true = apply the EXIF orientation (phone photos).
      const img = codec.decode!(bytes, true);
      if (!img) throw new Error("Could not decode the JPEG image.");
      return toRgba(img);
    }
    case "webp": {
      const codec = await emscripten("webp_dec.wasm", webpDecFactory);
      const img = codec.decode!(bytes);
      if (!img) throw new Error("Could not decode the WebP image (animated WebP isn't supported).");
      return toRgba(img);
    }
    case "png": {
      initWasmBindgen();
      return toRgba(pngDecodeWasm(bytes) as unknown as { data: Uint8ClampedArray; width: number; height: number });
    }
    case "gif":
      return decodeGifFirstFrame(bytes);
    case "svg":
      throw new Error("SVG images can't be rasterized by the agentcms CLI — convert the file to PNG first.");
    default:
      throw new Error("Unsupported image format — use JPEG, PNG, WebP or GIF.");
  }
}

// ─── Resize ────────────────────────────────────────────────────────

function crop(img: RgbaImage, x: number, y: number, w: number, h: number): RgbaImage {
  if (x === 0 && y === 0 && w === img.width && h === img.height) return img;
  const out = new Uint8Array(w * h * 4);
  for (let row = 0; row < h; row++) {
    const start = ((y + row) * img.width + x) * 4;
    out.set(img.data.subarray(start, start + w * 4), row * w * 4);
  }
  return { data: out, width: w, height: h };
}

// Lanczos3 in linear light with premultiplied alpha.
export function resizeImage(img: RgbaImage, width: number, height: number): RgbaImage {
  if (img.width === width && img.height === height) return img;
  initWasmBindgen();
  const out = resizeWasm(img.data, img.width, img.height, width, height, 3, true, true);
  return { data: new Uint8Array(out.buffer, out.byteOffset, out.byteLength), width, height };
}

// Same crop + scale as ctx.drawImage(bitmap, plan.src…, 0, 0, plan.draw…).
function renderPlan(img: RgbaImage, plan: ReturnType<typeof planFit>): RgbaImage {
  const x = clampInt(Math.round(plan.srcX), 0, img.width - 1);
  const y = clampInt(Math.round(plan.srcY), 0, img.height - 1);
  const w = clampInt(Math.round(plan.srcWidth), 1, img.width - x);
  const h = clampInt(Math.round(plan.srcHeight), 1, img.height - y);
  return resizeImage(crop(img, x, y, w, h), Math.max(1, plan.drawWidth), Math.max(1, plan.drawHeight));
}

function clampInt(v: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, v));
}

// Paints the image over an opaque color (alpha → 255).
function flatten(img: RgbaImage, [r, g, b]: [number, number, number]): RgbaImage {
  const d = img.data;
  const out = new Uint8Array(d.length);
  for (let i = 0; i < d.length; i += 4) {
    const a = d[i + 3] / 255;
    out[i] = Math.round(d[i] * a + r * (1 - a));
    out[i + 1] = Math.round(d[i + 1] * a + g * (1 - a));
    out[i + 2] = Math.round(d[i + 2] * a + b * (1 - a));
    out[i + 3] = 255;
  }
  return { data: out, width: img.width, height: img.height };
}

function parseHexColor(color: string): [number, number, number] {
  const m = /^#?([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(color.trim());
  if (!m) return [255, 255, 255];
  const hex = m[1].length === 3 ? [...m[1]].map((c) => c + c).join("") : m[1];
  return [parseInt(hex.slice(0, 2), 16), parseInt(hex.slice(2, 4), 16), parseInt(hex.slice(4, 6), 16)];
}

// ─── Encode ────────────────────────────────────────────────────────

// `quality` is 0..1 like canvas.convertToBlob.
export async function encodeImage(img: RgbaImage, mime: string, quality: number): Promise<Uint8Array> {
  const q = Math.round(Math.max(0, Math.min(1, quality)) * 100);
  switch (mime) {
    case "image/webp": {
      const codec = await emscripten("webp_enc_simd.wasm", webpEncFactory);
      const out = codec.encode!(img.data, img.width, img.height, { ...webpDefaults, quality: q });
      if (!out) throw new Error("WebP encoding failed.");
      return new Uint8Array(out);
    }
    case "image/jpeg": {
      const codec = await emscripten("mozjpeg_enc.wasm", mozjpegEncFactory);
      const flat = flatten(img, [0, 0, 0]);
      const out = codec.encode!(flat.data, flat.width, flat.height, { ...jpegDefaults, quality: q });
      if (!out) throw new Error("JPEG encoding failed.");
      return new Uint8Array(out);
    }
    case "image/png":
      initWasmBindgen();
      return new Uint8Array(pngEncodeWasm(img.data, img.width, img.height, 8));
    default:
      throw new Error(`Unsupported output format "${mime}" — use image/webp, image/jpeg or image/png.`);
  }
}

// ─── Admin entry points ────────────────────────────────────────────

function normalizeQuality(value: number): number {
  if (!Number.isFinite(value)) return 0.8;
  return Math.max(0, Math.min(1, value > 1 ? value / 100 : value));
}

export async function processImageNode(file: Blob, opts: ProcessImageOptions): Promise<ProcessedVariant[]> {
  const source = await decodeImage(new Uint8Array(await file.arrayBuffer()));
  const globalQuality = normalizeQuality(opts.quality);
  const variants: ProcessedVariant[] = [];
  for (const [name, format] of Object.entries(opts.formats)) {
    const plan = planFit(source.width, source.height, format);
    const pixels = renderPlan(source, plan);
    const quality = format.quality !== undefined ? normalizeQuality(format.quality) : globalQuality;
    const bytes = await encodeImage(pixels, opts.outputMime, quality);
    const blob = new Blob([bytes as BlobPart], { type: opts.outputMime });
    variants.push({ name, blob, width: plan.canvasWidth, height: plan.canvasHeight, bytes: blob.size });
  }
  return variants;
}

export async function renderFaviconSquares(file: Blob, requests: SquarePngRequest[]): Promise<Blob[]> {
  const source = await decodeImage(new Uint8Array(await file.arrayBuffer()));
  const out: Blob[] = [];
  for (const r of requests) {
    // Cover crop to a centered square, upscaling allowed (like the canvas path).
    const plan = planFit(source.width, source.height, { width: r.size, height: r.size, fit: "cover" });
    let pixels = renderPlan(source, plan);
    if (r.background) pixels = flatten(pixels, parseHexColor(r.background));
    out.push(new Blob([(await encodeImage(pixels, "image/png", 1)) as BlobPart], { type: "image/png" }));
  }
  return out;
}

// Theme logos (services/themeLogo.ts): a width × height WebP. "cover"
// crops the centre to fill the box; "contain" scales the whole image
// into it (up or down, like drawImage) on a transparent letterbox.
export async function renderThemeLogo(file: Blob, width: number, height: number, fit: "cover" | "contain", quality: number): Promise<Blob> {
  const source = await decodeImage(new Uint8Array(await file.arrayBuffer()));
  let pixels: RgbaImage;
  if (fit === "cover") {
    const scale = Math.max(width / source.width, height / source.height);
    const sw = clampInt(Math.round(width / scale), 1, source.width);
    const sh = clampInt(Math.round(height / scale), 1, source.height);
    const sx = Math.floor((source.width - sw) / 2);
    const sy = Math.floor((source.height - sh) / 2);
    pixels = resizeImage(crop(source, sx, sy, sw, sh), width, height);
  } else {
    const scale = Math.min(width / source.width, height / source.height);
    const dw = clampInt(Math.round(source.width * scale), 1, width);
    const dh = clampInt(Math.round(source.height * scale), 1, height);
    const inner = resizeImage(source, dw, dh);
    const out = new Uint8Array(width * height * 4);
    const dx = Math.floor((width - dw) / 2);
    const dy = Math.floor((height - dh) / 2);
    for (let row = 0; row < dh; row++) {
      out.set(inner.data.subarray(row * dw * 4, (row + 1) * dw * 4), ((dy + row) * width + dx) * 4);
    }
    pixels = { data: out, width, height };
  }
  return new Blob([(await encodeImage(pixels, "image/webp", quality)) as BlobPart], { type: "image/webp" });
}

let installed = false;

// Routes processImage (uploadMedia) and the favicon generator to the
// implementations above. Idempotent.
export function installNodeImageSupport(): void {
  if (installed) return;
  installed = true;
  ensureImageData();
  setImageProcessor(processImageNode);
  setFaviconRasterizer(renderFaviconSquares);
  setThemeLogoResizer(renderThemeLogo);
}

// ─── GIF (first frame) ─────────────────────────────────────────────

// Minimal GIF87a/89a decoder: the first image frame, composited on a
// transparent canvas of the logical screen size (what createImageBitmap
// returns for an animated GIF).
export function decodeGifFirstFrame(bytes: Uint8Array): RgbaImage {
  const fail = (): never => {
    throw new Error("Could not decode the GIF image — convert it to PNG first.");
  };
  if (bytes.length < 13) fail();
  const u16 = (o: number) => bytes[o] | (bytes[o + 1] << 8);
  const width = u16(6);
  const height = u16(8);
  if (!width || !height) fail();
  const flags = bytes[10];
  let pos = 13;
  let globalTable: Uint8Array | null = null;
  if (flags & 0x80) {
    const size = 3 * (1 << ((flags & 7) + 1));
    globalTable = bytes.subarray(pos, pos + size);
    pos += size;
  }
  let transparent = -1;
  while (pos < bytes.length) {
    const block = bytes[pos++];
    if (block === 0x21) {
      const label = bytes[pos++];
      if (label === 0xf9 && bytes[pos] >= 4) {
        if (bytes[pos + 1] & 1) transparent = bytes[pos + 4];
      }
      // Skip the extension's sub-blocks.
      while (pos < bytes.length && bytes[pos] !== 0) pos += bytes[pos] + 1;
      pos++;
    } else if (block === 0x2c) {
      const left = u16(pos);
      const top = u16(pos + 2);
      const fw = u16(pos + 4);
      const fh = u16(pos + 6);
      const fflags = bytes[pos + 8];
      pos += 9;
      let table = globalTable;
      if (fflags & 0x80) {
        const size = 3 * (1 << ((fflags & 7) + 1));
        table = bytes.subarray(pos, pos + size);
        pos += size;
      }
      if (!table) fail();
      const minCodeSize = bytes[pos++];
      const chunks: number[] = [];
      while (pos < bytes.length && bytes[pos] !== 0) {
        const len = bytes[pos];
        for (let i = 1; i <= len; i++) chunks.push(bytes[pos + i]);
        pos += len + 1;
      }
      const indices = lzwDecode(Uint8Array.from(chunks), minCodeSize, fw * fh);
      const out = new Uint8Array(width * height * 4);
      const interlaced = (fflags & 0x40) !== 0;
      const rows = interlaced ? interlacedRows(fh) : null;
      for (let i = 0; i < Math.min(indices.length, fw * fh); i++) {
        const idx = indices[i];
        if (idx === transparent) continue;
        const fx = i % fw;
        const fy = rows ? rows[Math.floor(i / fw)] : Math.floor(i / fw);
        const x = left + fx;
        const y = top + fy;
        if (x >= width || y >= height) continue;
        const o = (y * width + x) * 4;
        out[o] = table![idx * 3] ?? 0;
        out[o + 1] = table![idx * 3 + 1] ?? 0;
        out[o + 2] = table![idx * 3 + 2] ?? 0;
        out[o + 3] = 255;
      }
      return { data: out, width, height };
    } else if (block === 0x3b) {
      break;
    } else {
      fail();
    }
  }
  return fail();
}

function interlacedRows(height: number): number[] {
  const rows: number[] = [];
  for (const [start, step] of [[0, 8], [4, 8], [2, 4], [1, 2]]) {
    for (let y = start; y < height; y += step) rows.push(y);
  }
  return rows;
}

function lzwDecode(data: Uint8Array, minCodeSize: number, pixelCount: number): Uint8Array {
  const clear = 1 << minCodeSize;
  const eoi = clear + 1;
  const out = new Uint8Array(pixelCount);
  let outPos = 0;
  const prefix = new Int32Array(4096);
  const suffix = new Uint8Array(4096);
  const firstChar = new Uint8Array(4096);
  for (let i = 0; i < clear; i++) {
    prefix[i] = -1;
    suffix[i] = i;
    firstChar[i] = i;
  }
  let codeSize = minCodeSize + 1;
  let next = eoi + 1;
  let prev = -1;
  let bitBuf = 0;
  let bitCount = 0;
  let bytePos = 0;
  const stack = new Uint8Array(4096);
  while (outPos < pixelCount) {
    while (bitCount < codeSize) {
      if (bytePos >= data.length) return out;
      bitBuf |= data[bytePos++] << bitCount;
      bitCount += 8;
    }
    const code = bitBuf & ((1 << codeSize) - 1);
    bitBuf >>>= codeSize;
    bitCount -= codeSize;
    if (code === clear) {
      codeSize = minCodeSize + 1;
      next = eoi + 1;
      prev = -1;
      continue;
    }
    if (code === eoi) break;
    let cur: number;
    if (code < next) cur = code;
    else if (code === next && prev !== -1) cur = prev;
    else break; // corrupt stream
    // Emit the string for `cur` (reversed through the stack).
    let sp = 0;
    for (let c = cur; c !== -1; c = prefix[c]) stack[sp++] = suffix[c];
    if (code === next) {
      // KwKwK case: string(prev) + first(prev).
      for (let i = sp - 1; i >= 0 && outPos < pixelCount; i--) out[outPos++] = stack[i];
      if (outPos < pixelCount) out[outPos++] = firstChar[prev];
    } else {
      for (let i = sp - 1; i >= 0 && outPos < pixelCount; i--) out[outPos++] = stack[i];
    }
    if (prev !== -1 && next < 4096) {
      prefix[next] = prev;
      suffix[next] = code === next ? firstChar[prev] : firstChar[cur];
      firstChar[next] = firstChar[prev];
      next++;
      if (next === 1 << codeSize && codeSize < 12) codeSize++;
    }
    prev = code;
  }
  return out;
}
