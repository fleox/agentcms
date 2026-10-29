// Backend dispatcher for the auth service.
//
// Picks the implementation based on the active runtime backend at
// module-load time. The choice is fixed for the lifetime of the page —
// switching backend requires a reload (the Settings page handles that).
//
// In the document-store backends, `sendResetEmail` throws (no
// email-based reset) and `probeBootstrapAdmin` reflects the role the
// store grants the current identity (e.g. repo permissions on git).
//
// IMPORTANT: dispatched function exports are HOISTED FUNCTION
// declarations (not `const x = impl.x`), and `impl()` is resolved
// lazily on first call. Reason: `core/cmsRuntime.ts` reads several
// dispatcher exports at module-init inside an object literal, and a
// circular import path through `themes/index.ts` means this module's
// body hasn't necessarily run when cmsRuntime's body does. Using
// hoisted function bindings + lazy impl resolution avoids the TDZ
// ("can't access lexical declaration X before initialization") crash.

import { getBackendKind, isDocStoreBackend } from "../lib/runtimeConfig";
import * as firebase from "./firebase/auth";
import * as docstore from "./docstore/auth";

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
  return _impl as typeof firebase;
}

export function subscribeToAuth(
  ...args: Parameters<typeof firebase.subscribeToAuth>
): ReturnType<typeof firebase.subscribeToAuth> {
  return impl().subscribeToAuth(...args);
}
export function signIn(
  ...args: Parameters<typeof firebase.signIn>
): ReturnType<typeof firebase.signIn> {
  return impl().signIn(...args);
}
export function signOut(
  ...args: Parameters<typeof firebase.signOut>
): ReturnType<typeof firebase.signOut> {
  return impl().signOut(...args);
}
export function sendResetEmail(
  ...args: Parameters<typeof firebase.sendResetEmail>
): ReturnType<typeof firebase.sendResetEmail> {
  return impl().sendResetEmail(...args);
}
export function probeBootstrapAdmin(
  ...args: Parameters<typeof firebase.probeBootstrapAdmin>
): ReturnType<typeof firebase.probeBootstrapAdmin> {
  return impl().probeBootstrapAdmin(...args);
}
export function authErrorKey(
  ...args: Parameters<typeof firebase.authErrorKey>
): ReturnType<typeof firebase.authErrorKey> {
  return impl().authErrorKey(...args);
}
export function signInWithGoogle(
  ...args: Parameters<typeof firebase.signInWithGoogle>
): ReturnType<typeof firebase.signInWithGoogle> {
  return impl().signInWithGoogle(...args);
}
export function sendSignInLink(
  ...args: Parameters<typeof firebase.sendSignInLink>
): ReturnType<typeof firebase.sendSignInLink> {
  return impl().sendSignInLink(...args);
}
export function isEmailSignInLink(
  ...args: Parameters<typeof firebase.isEmailSignInLink>
): ReturnType<typeof firebase.isEmailSignInLink> {
  return impl().isEmailSignInLink(...args);
}
export function emailForSignInLink(
  ...args: Parameters<typeof firebase.emailForSignInLink>
): ReturnType<typeof firebase.emailForSignInLink> {
  return impl().emailForSignInLink(...args);
}
export function completeEmailLinkSignIn(
  ...args: Parameters<typeof firebase.completeEmailLinkSignIn>
): ReturnType<typeof firebase.completeEmailLinkSignIn> {
  return impl().completeEmailLinkSignIn(...args);
}
export function sendVerificationEmail(
  ...args: Parameters<typeof firebase.sendVerificationEmail>
): ReturnType<typeof firebase.sendVerificationEmail> {
  return impl().sendVerificationEmail(...args);
}
export function reloadCurrentUser(
  ...args: Parameters<typeof firebase.reloadCurrentUser>
): ReturnType<typeof firebase.reloadCurrentUser> {
  return impl().reloadCurrentUser(...args);
}
