// Backend dispatcher for the media service.
//
// Both impls share the same MAX_MEDIA_SIZE_BYTES limit + validator.
// `validateMediaFile` is a pure predicate with no I/O, so either
// backend's copy works — we route through the dispatcher anyway to keep
// the indirection consistent and let either backend tighten the rules
// independently in the future.
//
// IMPORTANT: dispatched function exports are HOISTED FUNCTION
// declarations (not `const x = impl.x`), and `impl()` is resolved
// lazily on first call. Reason: `core/cmsRuntime.ts` reads several
// dispatcher exports at module-init inside an object literal, and a
// circular import path through `themes/index.ts` means this module's
// body hasn't necessarily run when cmsRuntime's body does. Using
// hoisted function bindings + lazy impl resolution avoids the TDZ
// ("can't access lexical declaration X before initialization") crash.
// Constants stay as direct re-exports from the firebase impl (identical
// value in the docstore impl).

import { getBackendKind, isDocStoreBackend } from "../lib/runtimeConfig";
import * as firebase from "./firebase/media";
import * as docstore from "./docstore/media";

let _impl: typeof firebase | typeof docstore | null = null;
// Backend the cached impl belongs to: a process that switches site
// (the agentcms CLI) re-resolves it; the admin never does.
let _implKind: ReturnType<typeof getBackendKind> | undefined;
function impl(): typeof firebase {
  const kind = getBackendKind();
  if (!_impl || kind !== _implKind) {
    _implKind = kind;
    _impl = isDocStoreBackend(kind) ? docstore : firebase;
  }
  // Both backends expose the same public surface (verified at
  // type-check time by the type re-exports below). firebase is used as
  // the canonical type because it's the larger surface.
  return _impl as typeof firebase;
}

// Constants: re-export directly from firebase (identical value in
// SQLite impl). Direct re-export is a live binding too, but the value
// is hoisted at module-record creation, so no TDZ.
export { MAX_MEDIA_SIZE_BYTES, validateMediaFile } from "./firebase/media";

// Pass-through wrappers — hoisted function declarations.
export function subscribeToMedia(
  ...args: Parameters<typeof firebase.subscribeToMedia>
): ReturnType<typeof firebase.subscribeToMedia> {
  return impl().subscribeToMedia(...args);
}
export function listAllMedia(
  ...args: Parameters<typeof firebase.listAllMedia>
): ReturnType<typeof firebase.listAllMedia> {
  return impl().listAllMedia(...args);
}
export function uploadMedia(
  ...args: Parameters<typeof firebase.uploadMedia>
): ReturnType<typeof firebase.uploadMedia> {
  return impl().uploadMedia(...args);
}
export function setMediaFormats(
  ...args: Parameters<typeof firebase.setMediaFormats>
): ReturnType<typeof firebase.setMediaFormats> {
  return impl().setMediaFormats(...args);
}

export function updateMedia(
  ...args: Parameters<typeof firebase.updateMedia>
): ReturnType<typeof firebase.updateMedia> {
  return impl().updateMedia(...args);
}
export function deleteMedia(
  ...args: Parameters<typeof firebase.deleteMedia>
): ReturnType<typeof firebase.deleteMedia> {
  return impl().deleteMedia(...args);
}

export type { ValidationOk, ValidationFail } from "./firebase/media";
