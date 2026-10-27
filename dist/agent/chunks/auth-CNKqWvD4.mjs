import { createRequire as __acmsRequire } from "node:module";
import { fileURLToPath as __acmsPath } from "node:url";
import { dirname as __acmsDirname } from "node:path";
const require2 = __acmsRequire(import.meta.url);
const __filename = __acmsPath(import.meta.url);
const __dirname = __acmsDirname(__filename);
import { getBackendKind, isDocStoreBackend } from "./runtimeConfig-2M2d2Pbu.mjs";
import { sendPasswordResetEmail, signInWithEmailAndPassword, signOut as signOut$3, onAuthStateChanged } from "./index-BzGlTM6h.mjs";
import "./index.esm2017-C4mMOVmK.mjs";
import { g as getDoc, d as doc, a5 as getDb, a4 as collections, a6 as configDocs, a7 as getAuthClient } from "./firebaseClient-D3fvED27.mjs";
import { g as getDocStore } from "./registry-0V3j22df.mjs";
import "./index-B4MbpTF6.mjs";
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
import "./index-DCzLoAau.mjs";
import "./toast-CYyyaSAW.mjs";
import "./gitStore-ueM10Bby.mjs";
import "./index-BA9sR5p-.mjs";
import "./types-DAD44Ttj.mjs";
import "../agentcms.mjs";
import "node:util";
import "node:fs";
import "node:path";
import "node:url";
import "node:os";
import "node:child_process";
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
    default:
      return "auth.errors.generic";
  }
}
const firebase = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  authErrorKey: authErrorKey$2,
  probeBootstrapAdmin: probeBootstrapAdmin$2,
  sendResetEmail: sendResetEmail$2,
  signIn: signIn$2,
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
  notifyAuthChanged,
  probeBootstrapAdmin: probeBootstrapAdmin$1,
  resetDocStoreAuthForTests,
  sendResetEmail: sendResetEmail$1,
  setDocStoreSignOutHandler,
  signIn: signIn$1,
  signOut: signOut$1,
  subscribeToAuth: subscribeToAuth$1
}, Symbol.toStringTag, { value: "Module" }));
let _impl = null;
function impl() {
  if (!_impl) {
    const kind = getBackendKind();
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
export {
  authErrorKey,
  probeBootstrapAdmin,
  sendResetEmail,
  signIn,
  signOut,
  subscribeToAuth
};
