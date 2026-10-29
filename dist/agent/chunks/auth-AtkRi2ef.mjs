import { createRequire as __acmsRequire } from "node:module";
import { fileURLToPath as __acmsPath } from "node:url";
import { dirname as __acmsDirname } from "node:path";
const require2 = __acmsRequire(import.meta.url);
const __filename = __acmsPath(import.meta.url);
const __dirname = __acmsDirname(__filename);
import { getBackendKind, isDocStoreBackend } from "./runtimeConfig-BNLCrrQo.mjs";
import { signInWithEmailLink, isSignInWithEmailLink, sendPasswordResetEmail, sendSignInLinkToEmail, sendEmailVerification, signInWithEmailAndPassword, GoogleAuthProvider, signInWithPopup, signOut as signOut$3, onAuthStateChanged } from "./index-CjBqWaZn.mjs";
import "./index.esm2017-BUfxW6Jp.mjs";
import { a as getDoc, d as doc } from "./index.node-DYLwqGPq.mjs";
import { getAuthClient, getDb, collections, configDocs } from "./firebaseClient-BjUVAcKz.mjs";
import { g as getDocStore } from "./registry-Bhq3fghS.mjs";
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
import "./index-CuB-ym-g.mjs";
import "./index-YdkzfKAt.mjs";
import "./toast-CYyyaSAW.mjs";
import "./gitStore-BkclOUWu.mjs";
import "./index-B4uHS09W.mjs";
import "./types-DAD44Ttj.mjs";
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
function subscribeToAuth$2(onChange) {
  return onAuthStateChanged(getAuthClient(), onChange);
}
async function signIn$2(email, password) {
  const cred = await signInWithEmailAndPassword(getAuthClient(), email.trim(), password);
  return cred.user;
}
async function signInWithGoogle$2() {
  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({ prompt: "select_account" });
  const cred = await signInWithPopup(getAuthClient());
  return cred.user;
}
const EMAIL_FOR_LINK_KEY = "agentcms.emailForSignIn";
function adminReturnUrl() {
  return `${window.location.origin}${window.location.pathname}`;
}
async function sendSignInLink$2(email) {
  const address = email.trim();
  await sendSignInLinkToEmail(getAuthClient(), address, { url: adminReturnUrl(), handleCodeInApp: true });
  try {
    window.localStorage.setItem(EMAIL_FOR_LINK_KEY, address);
  } catch {
  }
}
function isEmailSignInLink$2() {
  return typeof window !== "undefined" && isSignInWithEmailLink(getAuthClient(), window.location.href);
}
function emailForSignInLink$2() {
  try {
    return window.localStorage.getItem(EMAIL_FOR_LINK_KEY);
  } catch {
    return null;
  }
}
async function completeEmailLinkSignIn$2(email) {
  const cred = await signInWithEmailLink(getAuthClient(), email.trim(), window.location.href);
  try {
    window.localStorage.removeItem(EMAIL_FOR_LINK_KEY);
  } catch {
  }
  window.history.replaceState(null, "", adminReturnUrl() + window.location.hash);
  return cred.user;
}
async function sendVerificationEmail$2() {
  const user = getAuthClient().currentUser;
  if (user) await sendEmailVerification(user, { url: adminReturnUrl() });
}
async function reloadCurrentUser$2() {
  const user = getAuthClient().currentUser;
  if (!user) return null;
  await user.reload();
  await user.getIdToken(true);
  return getAuthClient().currentUser;
}
async function signOut$2() {
  return signOut$3(getAuthClient());
}
async function sendResetEmail$2(email) {
  return sendPasswordResetEmail(getAuthClient(), email.trim());
}
async function probeBootstrapAdmin$2() {
  try {
    await getDoc(doc(getDb(), collections.config, configDocs.admin));
    return true;
  } catch (err) {
    const code = err?.code ?? "";
    if (code === "permission-denied") return false;
    throw err;
  }
}
function authErrorKey$2(err) {
  const e = err;
  const code = e?.code ?? "";
  switch (code) {
    case "auth/invalid-email":
      return "auth.errors.invalidEmail";
    case "auth/invalid-credential":
    case "auth/wrong-password":
    case "auth/user-not-found":
      return "auth.errors.invalidCredentials";
    case "auth/too-many-requests":
      return "auth.errors.tooManyRequests";
    case "auth/user-disabled":
      return "auth.errors.userDisabled";
    case "auth/network-request-failed":
      return "auth.errors.networkFailed";
    case "auth/popup-closed-by-user":
    case "auth/cancelled-popup-request":
      return "auth.errors.popupClosed";
    case "auth/popup-blocked":
      return "auth.errors.popupBlocked";
    case "auth/unauthorized-domain":
    case "auth/unauthorized-continue-uri":
      return "auth.errors.unauthorizedDomain";
    case "auth/operation-not-allowed":
      return "auth.errors.methodDisabled";
    case "auth/invalid-action-code":
    case "auth/expired-action-code":
      return "auth.errors.linkExpired";
    default:
      return "auth.errors.generic";
  }
}
const firebase = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  authErrorKey: authErrorKey$2,
  completeEmailLinkSignIn: completeEmailLinkSignIn$2,
  emailForSignInLink: emailForSignInLink$2,
  isEmailSignInLink: isEmailSignInLink$2,
  probeBootstrapAdmin: probeBootstrapAdmin$2,
  reloadCurrentUser: reloadCurrentUser$2,
  sendResetEmail: sendResetEmail$2,
  sendSignInLink: sendSignInLink$2,
  sendVerificationEmail: sendVerificationEmail$2,
  signIn: signIn$2,
  signInWithGoogle: signInWithGoogle$2,
  signOut: signOut$2,
  subscribeToAuth: subscribeToAuth$2
}, Symbol.toStringTag, { value: "Module" }));
function toFirebaseShape(identity) {
  const view = {
    uid: identity.uid,
    email: identity.email,
    displayName: identity.displayName
  };
  return view;
}
const subscribers = /* @__PURE__ */ new Set();
let cachedUser = null;
let resolvedOnce = false;
let resolveInflight = null;
let signOutHandler = null;
function emit() {
  for (const cb of Array.from(subscribers)) {
    try {
      cb(cachedUser);
    } catch (err) {
      console.error("subscribeToAuth listener threw", err);
    }
  }
}
async function resolveIdentity() {
  if (resolveInflight) return resolveInflight;
  resolveInflight = (async () => {
    try {
      const identity = await getDocStore().identity();
      cachedUser = identity ? toFirebaseShape(identity) : null;
    } catch (err) {
      console.warn("[docstore-auth] identity lookup failed:", err);
      cachedUser = null;
    } finally {
      resolvedOnce = true;
      resolveInflight = null;
      emit();
    }
  })();
  return resolveInflight;
}
function setDocStoreSignOutHandler(fn) {
  signOutHandler = fn;
}
async function notifyAuthChanged() {
  if (resolveInflight) await resolveInflight;
  await resolveIdentity();
}
function subscribeToAuth$1(onChange) {
  subscribers.add(onChange);
  if (!resolvedOnce && !resolveInflight) {
    void resolveIdentity();
  } else if (resolvedOnce && !resolveInflight) {
    const snapshot = cachedUser;
    setTimeout(() => {
      if (subscribers.has(onChange)) onChange(snapshot);
    }, 0);
  }
  return () => {
    subscribers.delete(onChange);
  };
}
async function signIn$1(_email, _password) {
  throw new Error("Sign-in is handled by the access-token screen for this backend.");
}
async function signOut$1() {
  if (signOutHandler) await signOutHandler();
  cachedUser = null;
  resolvedOnce = true;
  emit();
}
async function sendResetEmail$1(_email) {
  throw new Error("Password reset by email is not available for this backend.");
}
const FIREBASE_ONLY = "Only available with the Firebase backend.";
async function signInWithGoogle$1() {
  throw new Error(FIREBASE_ONLY);
}
async function sendSignInLink$1(_email) {
  throw new Error(FIREBASE_ONLY);
}
function isEmailSignInLink$1() {
  return false;
}
function emailForSignInLink$1() {
  return null;
}
async function completeEmailLinkSignIn$1(_email) {
  throw new Error(FIREBASE_ONLY);
}
async function sendVerificationEmail$1() {
  throw new Error(FIREBASE_ONLY);
}
async function reloadCurrentUser$1() {
  return cachedUser;
}
async function probeBootstrapAdmin$1() {
  const identity = await getDocStore().identity();
  return identity?.role === "admin";
}
function authErrorKey$1(err) {
  const e = err;
  if (!e) return "auth.errors.generic";
  const status = e.status;
  if (status === 401) return "auth.errors.invalidCredentials";
  if (status === 403) return "auth.errors.userDisabled";
  if (status === 409) return "auth.errors.invalidCredentials";
  if (status === 429) return "auth.errors.tooManyRequests";
  if (status === 400) return "auth.errors.invalidEmail";
  if (status === 0 || typeof status === "undefined" && e.message?.includes("Failed to fetch")) {
    return "auth.errors.networkFailed";
  }
  return "auth.errors.generic";
}
function resetDocStoreAuthForTests() {
  subscribers.clear();
  cachedUser = null;
  resolvedOnce = false;
  resolveInflight = null;
  signOutHandler = null;
}
const docstore = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  authErrorKey: authErrorKey$1,
  completeEmailLinkSignIn: completeEmailLinkSignIn$1,
  emailForSignInLink: emailForSignInLink$1,
  isEmailSignInLink: isEmailSignInLink$1,
  notifyAuthChanged,
  probeBootstrapAdmin: probeBootstrapAdmin$1,
  reloadCurrentUser: reloadCurrentUser$1,
  resetDocStoreAuthForTests,
  sendResetEmail: sendResetEmail$1,
  sendSignInLink: sendSignInLink$1,
  sendVerificationEmail: sendVerificationEmail$1,
  setDocStoreSignOutHandler,
  signIn: signIn$1,
  signInWithGoogle: signInWithGoogle$1,
  signOut: signOut$1,
  subscribeToAuth: subscribeToAuth$1
}, Symbol.toStringTag, { value: "Module" }));
let _impl = null;
let _implKind;
function impl() {
  const kind = getBackendKind();
  if (!_impl || kind !== _implKind) {
    _implKind = kind;
    _impl = isDocStoreBackend(kind) ? docstore : firebase;
  }
  return _impl;
}
function subscribeToAuth(...args) {
  return impl().subscribeToAuth(...args);
}
function signIn(...args) {
  return impl().signIn(...args);
}
function signOut(...args) {
  return impl().signOut(...args);
}
function sendResetEmail(...args) {
  return impl().sendResetEmail(...args);
}
function probeBootstrapAdmin(...args) {
  return impl().probeBootstrapAdmin(...args);
}
function authErrorKey(...args) {
  return impl().authErrorKey(...args);
}
function signInWithGoogle(...args) {
  return impl().signInWithGoogle(...args);
}
function sendSignInLink(...args) {
  return impl().sendSignInLink(...args);
}
function isEmailSignInLink(...args) {
  return impl().isEmailSignInLink(...args);
}
function emailForSignInLink(...args) {
  return impl().emailForSignInLink(...args);
}
function completeEmailLinkSignIn(...args) {
  return impl().completeEmailLinkSignIn(...args);
}
function sendVerificationEmail(...args) {
  return impl().sendVerificationEmail(...args);
}
function reloadCurrentUser(...args) {
  return impl().reloadCurrentUser(...args);
}
export {
  authErrorKey,
  completeEmailLinkSignIn,
  emailForSignInLink,
  isEmailSignInLink,
  probeBootstrapAdmin,
  reloadCurrentUser,
  sendResetEmail,
  sendSignInLink,
  sendVerificationEmail,
  signIn,
  signInWithGoogle,
  signOut,
  subscribeToAuth
};
