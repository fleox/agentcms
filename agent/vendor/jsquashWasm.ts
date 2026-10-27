// WASM codecs used by agent/ops/imageNode.ts. The build copies each one
// (vite.agent.config.ts, `vendorJsquashWasm`) to dist/agent/vendor/wasm/
// <name>; from source (vitest) they are read from node_modules.
// Pure data: also imported by the Vite config.
export const JSQUASH_WASM = {
  "webp_dec.wasm": "@jsquash/webp/codec/dec/webp_dec.wasm",
  // Node ≥ 16 always has WASM SIMD: the plain encoder isn't shipped.
  "webp_enc_simd.wasm": "@jsquash/webp/codec/enc/webp_enc_simd.wasm",
  "mozjpeg_dec.wasm": "@jsquash/jpeg/codec/dec/mozjpeg_dec.wasm",
  "mozjpeg_enc.wasm": "@jsquash/jpeg/codec/enc/mozjpeg_enc.wasm",
  "squoosh_png_bg.wasm": "@jsquash/png/codec/pkg/squoosh_png_bg.wasm",
  "squoosh_resize_bg.wasm": "@jsquash/resize/lib/resize/pkg/squoosh_resize_bg.wasm",
} as const;

export type JsquashWasmName = keyof typeof JSQUASH_WASM;
