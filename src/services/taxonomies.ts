// Backend dispatcher for the taxonomies (terms) service.
//
// IMPORTANT: dispatched function exports are HOISTED FUNCTION
// declarations (not `const x = impl.x`), and `impl()` is resolved
// lazily on first call. Reason: `core/flexwegRuntime.ts` reads several
// dispatcher exports at module-init inside an object literal, and a
// circular import path through `themes/index.ts` means this module's
// body hasn't necessarily run when flexwegRuntime's body does. Using
// hoisted function bindings + lazy impl resolution avoids the TDZ
// ("can't access lexical declaration X before initialization") crash.

import { getBackendKind, isDocStoreBackend } from "../lib/runtimeConfig";
import * as firebase from "./firebase/taxonomies";
import * as sqlite from "./flexweg-sqlite/taxonomies";
import * as docstore from "./docstore/taxonomies";

let _impl: typeof firebase | typeof sqlite | typeof docstore | null = null;
function impl(): typeof firebase {
  if (!_impl) {
    const kind = getBackendKind();
    _impl = kind === "flexweg-sqlite" ? sqlite : isDocStoreBackend(kind) ? docstore : firebase;
  }
  return _impl as typeof firebase;
}

export function subscribeToTerms(
  ...args: Parameters<typeof firebase.subscribeToTerms>
): ReturnType<typeof firebase.subscribeToTerms> {
  return impl().subscribeToTerms(...args);
}
export function fetchAllTerms(
  ...args: Parameters<typeof firebase.fetchAllTerms>
): ReturnType<typeof firebase.fetchAllTerms> {
  return impl().fetchAllTerms(...args);
}
export function createTerm(
  ...args: Parameters<typeof firebase.createTerm>
): ReturnType<typeof firebase.createTerm> {
  return impl().createTerm(...args);
}
export function updateTerm(
  ...args: Parameters<typeof firebase.updateTerm>
): ReturnType<typeof firebase.updateTerm> {
  return impl().updateTerm(...args);
}
export function deleteTerm(
  ...args: Parameters<typeof firebase.deleteTerm>
): ReturnType<typeof firebase.deleteTerm> {
  return impl().deleteTerm(...args);
}

export type { CreateTermInput } from "./firebase/taxonomies";
