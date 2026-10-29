import { createRequire as __acmsRequire } from "node:module";
import { fileURLToPath as __acmsPath } from "node:url";
import { dirname as __acmsDirname } from "node:path";
const require2 = __acmsRequire(import.meta.url);
const __filename = __acmsPath(import.meta.url);
const __dirname = __acmsDirname(__filename);
import "./index-CuB-ym-g.mjs";
import { aw as initializeFirestore, at as getFirestore } from "./index.node-DYLwqGPq.mjs";
import { getAuth } from "./index-CjBqWaZn.mjs";
import { i as initializeApp, g as getApps } from "./index.esm2017-BUfxW6Jp.mjs";
import { getRuntimeConfig, getMissingFirebaseFields, resetRuntimeConfigCache } from "./runtimeConfig-BNLCrrQo.mjs";
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
function getAdminEmail() {
  const config = getRuntimeConfig();
  if (!config || config.backend !== "firebase") return "";
  const v = config.adminEmail;
  return typeof v === "string" ? v.trim().toLowerCase() : "";
}
function getMissingFirebaseEnvVars() {
  return getMissingFirebaseFields();
}
let cachedDb = null;
let cachedAuth = null;
let cachedApp = null;
function getApp() {
  if (cachedApp) return cachedApp;
  const config = getRuntimeConfig();
  if (!config) {
    throw new Error(
      "Firebase config not available. The runtime resolver returned null — either fill .env or complete the in-admin setup form."
    );
  }
  if (config.backend !== "firebase") {
    throw new Error(
      `Firebase service called while active backend is "${config.backend}". Dispatcher bug — fix the calling code to read through services/<name>.ts, not services/firebase/<name>.ts directly.`
    );
  }
  cachedApp = getApps()[0] ?? initializeApp(config.firebase);
  return cachedApp;
}
function getDb() {
  if (cachedDb) return cachedDb;
  try {
    cachedDb = initializeFirestore(getApp(), { ignoreUndefinedProperties: true });
  } catch {
    cachedDb = getFirestore(getApp());
  }
  return cachedDb;
}
function getAuthClient() {
  if (cachedAuth) return cachedAuth;
  cachedAuth = getAuth(getApp());
  return cachedAuth;
}
function initFirebaseFromSetup(config) {
  if (config.backend !== "firebase") {
    throw new Error(
      `initFirebaseFromSetup called with non-Firebase config (backend="${config.backend}"). Use the SQLite install helper for that backend.`
    );
  }
  if (typeof window !== "undefined") {
    window.__AGENTCMS_CONFIG__ = config;
  }
  resetRuntimeConfigCache();
  if (cachedApp) return;
  cachedApp = initializeApp(config.firebase);
}
const collections = {
  posts: "posts",
  terms: "terms",
  media: "media",
  config: "config",
  users: "users",
  settings: "settings",
  // invites/{lower-case email} → { role } — who may join (rules).
  invites: "invites"
};
const configDocs = {
  // Active publish connector `{ connectorId, settings }`. Absent on
  // a fresh install — the resolver then defaults to "browser-mirror".
  storage: "storage",
  // Empty placeholder doc whose Firestore rules grant read ONLY to the
  // bootstrap admin (the email pinned in `bootstrapAdminEmail()` of the
  // rules). The client probes this doc to detect bootstrap-admin status
  // without needing to know the email itself — keeps the email out of
  // the public `/admin/config.js`.
  admin: "admin"
};
const settingsDocs = {
  site: "site"
};
export {
  collections,
  configDocs,
  getAdminEmail,
  getAuthClient,
  getDb,
  getMissingFirebaseEnvVars,
  initFirebaseFromSetup,
  settingsDocs
};
