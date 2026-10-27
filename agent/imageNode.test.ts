import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { distRoot } from "./paths";
import {
  decodeGifFirstFrame,
  decodeImage,
  encodeImage,
  installNodeImageSupport,
  wasmPath,
  type RgbaImage,
} from "./ops/imageNode";
import { JSQUASH_WASM, type JsquashWasmName } from "./vendor/jsquashWasm";
import { processImage } from "../src/services/imageProcessing";
import type { ImageFormat } from "../src/core/types";

const uploads = new Map<string, { content: string; encoding?: string }>();
vi.mock("../src/services/siteFiles", () => ({
  uploadFile: async (o: { path: string; content: string; encoding?: string }) => {
    uploads.set(o.path, { content: o.content, encoding: o.encoding });
  },
  deleteFile: async () => {},
  deleteFolder: async () => {},
}));

// A noisy RGBA gradient (noise makes lossy quality visible in the size).
function gradient(width: number, height: number, alpha = false): RgbaImage {
  const data = new Uint8Array(width * height * 4);
  let seed = 7;
  const rnd = () => ((seed = (seed * 1103515245 + 12345) & 0x7fffffff) % 32);
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const o = (y * width + x) * 4;
      data[o] = Math.min(255, Math.round((x / width) * 220) + rnd());
      data[o + 1] = Math.min(255, Math.round((y / height) * 220) + rnd());
      data[o + 2] = 128 + rnd();
      data[o + 3] = alpha ? Math.round((x / width) * 255) : 255;
    }
  }
  return { data, width, height };
}

const magic = (b: Uint8Array) => ({
  png: b[0] === 0x89 && b[1] === 0x50 && b[2] === 0x4e && b[3] === 0x47,
  jpeg: b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff,
  webp: String.fromCharCode(...b.subarray(0, 4)) === "RIFF" && String.fromCharCode(...b.subarray(8, 12)) === "WEBP",
});

const bytesOf = async (blob: Blob) => new Uint8Array(await blob.arrayBuffer());

const FORMATS: Record<string, ImageFormat> = {
  small: { width: 480, height: 320, fit: "cover" },
  square: { width: 150, height: 150, fit: "cover" },
  box: { width: 400, height: 400, fit: "contain" },
  "admin-original": { width: 2000, height: 2000, fit: "contain", quality: 90 },
};

beforeAll(() => installNodeImageSupport());

describe("Node image processor", () => {
  it.each(["image/webp", "image/jpeg", "image/png"])("processImage → %s honours planFit", async (mime) => {
    const png = await encodeImage(gradient(1200, 800), "image/png", 1);
    const file = new File([png as BlobPart], "photo.png", { type: "image/png" });
    const variants = await processImage(file, { formats: FORMATS, outputMime: mime, quality: 80 });

    expect(variants.map((v) => v.name)).toEqual(Object.keys(FORMATS));
    const dims = Object.fromEntries(variants.map((v) => [v.name, [v.width, v.height]]));
    expect(dims).toEqual({
      small: [480, 320], // cover: exact box
      square: [150, 150],
      box: [400, 267], // contain: ratio kept
      "admin-original": [1200, 800], // contain: never upscaled
    });
    for (const v of variants) {
      const bytes = await bytesOf(v.blob);
      expect(v.bytes).toBe(bytes.length);
      expect(v.blob.type).toBe(mime);
      expect(magic(bytes)[mime.slice(6) as "png" | "jpeg" | "webp"]).toBe(true);
      const decoded = await decodeImage(bytes);
      expect([decoded.width, decoded.height]).toEqual([v.width, v.height]);
    }
  });

  it("decodes JPEG and WebP sources too (and cover-crops a portrait)", async () => {
    for (const mime of ["image/jpeg", "image/webp"]) {
      const src = await encodeImage(gradient(600, 900), mime, 0.9);
      const [v] = await processImage(new File([src as BlobPart], "x"), {
        formats: { small: { width: 300, height: 200, fit: "cover" } },
        outputMime: "image/webp",
        quality: 80,
      });
      expect([v.width, v.height]).toEqual([300, 200]);
    }
  });

  it.each(["image/webp", "image/jpeg"])("%s: lower quality gives smaller files", async (mime) => {
    const png = await encodeImage(gradient(800, 600), "image/png", 1);
    const file = new File([png as BlobPart], "x.png");
    const run = async (quality: number) =>
      (await processImage(file, { formats: { m: { width: 800, height: 600, fit: "cover" } }, outputMime: mime, quality }))[0].bytes;
    const low = await run(20);
    const high = await run(95);
    expect(low).toBeGreaterThan(0);
    expect(low).toBeLessThan(high);
    // Per-format quality overrides the global one.
    const [v] = await processImage(file, {
      formats: { m: { width: 800, height: 600, fit: "cover", quality: 20 } },
      outputMime: mime,
      quality: 95,
    });
    expect(v.bytes).toBe(low);
  });

  it("applies the JPEG EXIF orientation (rotated phone photos)", async () => {
    const jpeg = await encodeImage(gradient(300, 200), "image/jpeg", 0.9);
    // APP1 "Exif" segment, big-endian TIFF, IFD0 with Orientation = 6 (90° CW).
    const tiff = [0x4d, 0x4d, 0, 42, 0, 0, 0, 8, 0, 1, 0x01, 0x12, 0, 3, 0, 0, 0, 1, 0, 6, 0, 0, 0, 0, 0, 0, 0, 0];
    const payload = [0x45, 0x78, 0x69, 0x66, 0, 0, ...tiff];
    const len = payload.length + 2;
    const app1 = [0xff, 0xe1, len >> 8, len & 0xff, ...payload];
    const rotated = new Uint8Array([...jpeg.subarray(0, 2), ...app1, ...jpeg.subarray(2)]);
    const decoded = await decodeImage(rotated);
    expect([decoded.width, decoded.height]).toEqual([200, 300]);
  });

  it("decodes the first frame of a GIF", async () => {
    // 4×2 GIF, 4-colour table, index 3 transparent, uncompressed LZW
    // (a clear code before each pixel keeps the code size at 3 bits).
    const pixels = [0, 1, 2, 3, 3, 2, 1, 0];
    const codes: number[] = [];
    for (const p of pixels) codes.push(4, p);
    codes.push(5);
    const packed: number[] = [];
    let buf = 0;
    let n = 0;
    for (const c of codes) {
      buf |= c << n;
      n += 3;
      while (n >= 8) {
        packed.push(buf & 0xff);
        buf >>= 8;
        n -= 8;
      }
    }
    if (n > 0) packed.push(buf & 0xff);
    const gif = new Uint8Array([
      ...[0x47, 0x49, 0x46, 0x38, 0x39, 0x61], 4, 0, 2, 0, 0x81, 0, 0,
      ...[255, 0, 0, 0, 255, 0, 0, 0, 255, 9, 9, 9],
      ...[0x21, 0xf9, 4, 1, 0, 0, 3, 0],
      ...[0x2c, 0, 0, 0, 0, 4, 0, 2, 0, 0],
      2, packed.length, ...packed, 0,
      0x3b,
    ]);
    const img = decodeGifFirstFrame(gif);
    expect([img.width, img.height]).toEqual([4, 2]);
    expect([...img.data.subarray(0, 16)]).toEqual([255, 0, 0, 255, 0, 255, 0, 255, 0, 0, 255, 255, 0, 0, 0, 0]);
    expect([...img.data.subarray(28, 32)]).toEqual([255, 0, 0, 255]);
    // Through processImage like any other source.
    const [v] = await processImage(new File([gif as BlobPart], "a.gif"), {
      formats: { s: { width: 2, height: 1, fit: "cover" } },
      outputMime: "image/png",
      quality: 80,
    });
    expect([v.width, v.height]).toEqual([2, 1]);
  });

  it("refuses SVG and unknown inputs with a clear message", async () => {
    const svg = new File(['<svg xmlns="http://www.w3.org/2000/svg"/>'], "a.svg", { type: "image/svg+xml" });
    const opts = { formats: FORMATS, outputMime: "image/webp", quality: 80 };
    await expect(processImage(svg, opts)).rejects.toThrow(/SVG/);
    await expect(processImage(new File(["hello"], "a.png"), opts)).rejects.toThrow(/Unsupported image format/);
  });
});

describe("Node favicon generation", () => {
  it("produces every PNG + a valid multi-size ICO", async () => {
    const { generateAndUploadFavicons, FAVICON_FILES } = await import("../src/mu-plugins/agentcms-favicon/generator");
    uploads.clear();
    const src = await encodeImage(gradient(640, 480, true), "image/png", 1);
    const result = await generateAndUploadFavicons({
      file: new File([src as BlobPart], "logo.png", { type: "image/png" }),
      pwa: { name: "Site", shortName: "S", themeColor: "#000000", backgroundColor: "#ffffff", display: "standalone" },
    });
    expect(result).toMatchObject({ hasIco: true, hasSvg: false, hasPng96: true, hasManifest: true });

    const file = (name: string) => Buffer.from(uploads.get(`favicon/${name}`)!.content, "base64");
    const sizes: Array<[string, number]> = [
      [FAVICON_FILES.png96, 96],
      [FAVICON_FILES.apple, 180],
      [FAVICON_FILES.manifest192, 192],
      [FAVICON_FILES.manifest512, 512],
    ];
    for (const [name, size] of sizes) {
      const bytes = new Uint8Array(file(name));
      expect(magic(bytes).png).toBe(true);
      const img = await decodeImage(bytes);
      expect([img.width, img.height]).toEqual([size, size]);
      // The Apple icon is flattened on white; the others keep transparency.
      // (source alpha ramps 0 → 255 left to right; the crop starts at x = 80).
      const alpha0 = img.data[3];
      if (name === FAVICON_FILES.apple) expect(alpha0).toBe(255);
      else expect(alpha0).toBeLessThan(64);
    }

    const ico = new Uint8Array(file(FAVICON_FILES.ico));
    const view = new DataView(ico.buffer, ico.byteOffset, ico.byteLength);
    expect([view.getUint16(0, true), view.getUint16(2, true), view.getUint16(4, true)]).toEqual([0, 1, 3]);
    for (let i = 0; i < 3; i++) {
      const e = 6 + i * 16;
      const size = ico[e];
      expect(size).toBe([16, 32, 48][i]);
      const len = view.getUint32(e + 8, true);
      const off = view.getUint32(e + 12, true);
      const png = ico.subarray(off, off + len);
      expect(magic(png).png).toBe(true);
      expect((await decodeImage(png)).width).toBe(size);
    }
    expect(JSON.parse(uploads.get(`favicon/${FAVICON_FILES.manifest}`)!.content).name).toBe("Site");
  });
});

describe("vendored WASM codecs", () => {
  const names = Object.keys(JSQUASH_WASM) as JsquashWasmName[];

  it("resolve next to the bundle when bundled", () => {
    for (const name of names) {
      expect(wasmPath(name, true)).toBe(join(distRoot(), "agent", "vendor", "wasm", name));
      expect(existsSync(wasmPath(name, false))).toBe(true);
    }
  });

  it.skipIf(!existsSync(join(distRoot(), "agent")))("are copied into dist/agent by the build", () => {
    for (const name of names) {
      const built = wasmPath(name, true);
      expect(existsSync(built), built).toBe(true);
      expect(readFileSync(built).equals(readFileSync(wasmPath(name, false)))).toBe(true);
    }
  });
});
