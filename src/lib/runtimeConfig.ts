// Runtime configuration resolver. Picks the data backend + its
// credentials from one of two sources, in order:
//
//   1. window.__AGENTCMS_CONFIG__ — set synchronously by /admin/config.js
//      before the bundle loads (written by the setup wizard or the CLI
//      next to the admin on its hosting), or the same object saved in
//      this browser's localStorage.
//
//   2. import.meta.env.VITE_FIREBASE_* — populated by Vite at build time
//      from the developer's local .env, OR served by Vite during `npm run
//      dev`. This covers the legacy / dev path where the developer
//      already has credentials in .env and never sees the SetupForm.
//      Only relevant for the Firebase backend.
//
// Both code paths converge on the same CmsRuntimeConfig shape; the
// rest of the codebase only ever reads through `getRuntimeConfig()` and
// stays oblivious to which source provided the values.

import type { FirebaseOptions } from "firebase/app";

declare global {
  interface Window {
    // Set by /admin/config.js before the main bundle loads. May be null
    // when the admin is freshly deployed without baked-in env values.
    // Accepts the modern discriminated shape OR a legacy shape (no
    // `backend` field — pre-SQLite-migration config.js files).
    __AGENTCMS_CONFIG__?: CmsRuntimeConfig | LegacyFirebaseConfig | null;
  }
}

// The backend discriminator. "firebase" is Firestore + Firebase Auth;
// the other three are document-store backends (services/docstore/).
export type BackendKind = "firebase" | "sqlite-file" | "markdown-git" | "local";

// Backends implemented by the shared document-store layer
// (services/docstore/) rather than a dedicated service folder.
export function isDocStoreBackend(kind: BackendKind | null): kind is "sqlite-file" | "markdown-git" | "local" {
  return kind === "sqlite-file" || kind === "markdown-git" || kind === "local";
}

// Sign-in methods the Firebase login screen offers (each one also has to
// be enabled in Firebase console → Authentication → Sign-in method).
export type FirebaseSignInMethod = "password" | "emailLink" | "google";
export const FIREBASE_SIGN_IN_METHODS: readonly FirebaseSignInMethod[] = ["password", "emailLink", "google"];

export interface FirebaseRuntimeConfig {
  backend: "firebase";
  firebase: FirebaseOptions;
  // Default ["password"]. Public: it only decides which buttons show.
  signInMethods?: FirebaseSignInMethod[];
  // Optional. Legacy field — modern admin builds detect the bootstrap
  // admin via a Firestore probe (`config/admin` rule) instead of
  // exposing the email publicly. Kept as an opt-in fallback so older
  // deployments that still have an `adminEmail` baked into config.js
  // keep working until they migrate the Firestore rules + redeploy.
  adminEmail?: string;
}

// Content stored as Markdown + JSON files in a git repo (GitHub /
// GitLab, through their APIs) or in a local folder that is a git clone
// (File System Access API). Only repo coordinates live here — each
// editor's access token stays in their own browser (localStorage), so
// this config is safe to ship in the public config.js.
export interface MarkdownGitRuntimeConfig {
  backend: "markdown-git";
  git: {
    provider: "github" | "gitlab" | "local";
    owner?: string;
    repo?: string;
    project?: string;
    branch: string;
    apiBaseUrl?: string;
    // Repo sub-folder holding the content ("" = repo root).
    contentDir: string;
  };
}

// A SQLite database FILE stored on the user's own hosting (through any
// publish connector: git repo, S3, local folder),
// opened in the browser with sql.js. No accounts — access control is
// the hosting's job (e.g. password-protect /admin). Secret settings of
// the connector (tokens, keys) are NOT here: each browser keeps them in
// localStorage, so config.js stays safe to publish.
export interface SqliteFileRuntimeConfig {
  backend: "sqlite-file";
  sqlite: {
    connectorId: string;
    settings: Record<string, unknown>;
    // Path of the database file on that target, e.g. "admin/data/cms.sqlite".
    path: string;
    // The file is encrypted with a passphrase each browser enters once
    // (services/docstore/sqliteCrypto.ts). Not a secret itself.
    encrypted?: boolean;
  };
}

// Single-user content stored in this browser (IndexedDB). No login.
export interface LocalRuntimeConfig {
  backend: "local";
}

export type CmsRuntimeConfig =
  | FirebaseRuntimeConfig
  | MarkdownGitRuntimeConfig
  | SqliteFileRuntimeConfig
  | LocalRuntimeConfig;

// Backward-compat shape: pre-SQLite-migration config.js files just had
// `{ firebase, adminEmail? }` at the top level with no `backend`
// discriminator. We treat them as FirebaseRuntimeConfig on read.
interface LegacyFirebaseConfig {
  firebase: FirebaseOptions;
  adminEmail?: string;
}

const FIREBASE_FIELDS = [
  "apiKey",
  "authDomain",
  "projectId",
  "storageBucket",
  "messagingSenderId",
  "appId",
] as const;

type FirebaseField = (typeof FIREBASE_FIELDS)[number];

// Maps a Firebase config field name to the env var that supplies it.
// Used both for build-time resolution and for the SetupForm's "missing
// fields" diagnostic.
export const ENV_KEY_BY_FIELD: Record<FirebaseField, string> = {
  apiKey: "VITE_FIREBASE_API_KEY",
  authDomain: "VITE_FIREBASE_AUTH_DOMAIN",
  projectId: "VITE_FIREBASE_PROJECT_ID",
  storageBucket: "VITE_FIREBASE_STORAGE_BUCKET",
  messagingSenderId: "VITE_FIREBASE_MESSAGING_SENDER_ID",
  appId: "VITE_FIREBASE_APP_ID",
};

function nonEmpty(s: unknown): s is string {
  return typeof s === "string" && s.trim().length > 0;
}

function looksLikeFirebaseShape(raw: unknown): raw is FirebaseRuntimeConfig {
  if (!raw || typeof raw !== "object") return false;
  const r = raw as Partial<FirebaseRuntimeConfig>;
  // Accept missing `backend` for backward compatibility with config.js
  // files generated before the backend choice was introduced.
  if (r.backend !== undefined && r.backend !== "firebase") return false;
  const fb = r.firebase;
  if (!fb) return false;
  for (const field of FIREBASE_FIELDS) {
    if (!nonEmpty((fb as Record<string, unknown>)[field])) return false;
  }
  // adminEmail is optional — modern setups omit it (Firestore rules
  // probe handles bootstrap-admin detection); legacy setups keep it.
  return true;
}

function looksLikeMarkdownGitShape(raw: unknown): raw is MarkdownGitRuntimeConfig {
  if (!raw || typeof raw !== "object") return false;
  const r = raw as Partial<MarkdownGitRuntimeConfig>;
  if (r.backend !== "markdown-git" || !r.git || typeof r.git !== "object") return false;
  const g = r.git;
  if (!nonEmpty(g.branch) && g.provider !== "local") return false;
  if (g.provider === "github") return nonEmpty(g.owner) && nonEmpty(g.repo);
  if (g.provider === "gitlab") return nonEmpty(g.project);
  return g.provider === "local";
}

function looksLikeSqliteFileShape(raw: unknown): raw is SqliteFileRuntimeConfig {
  if (!raw || typeof raw !== "object") return false;
  const r = raw as Partial<SqliteFileRuntimeConfig>;
  return (
    r.backend === "sqlite-file" &&
    !!r.sqlite &&
    nonEmpty(r.sqlite.connectorId) &&
    nonEmpty(r.sqlite.path) &&
    !!r.sqlite.settings &&
    typeof r.sqlite.settings === "object"
  );
}

// Admins running locally (or on a host where config.js can't be
// written) keep their runtime config in localStorage instead. Same
// shape as window.__AGENTCMS_CONFIG__; config.js wins when both exist.
export const LOCAL_RUNTIME_CONFIG_KEY = "agentcms.runtimeConfig";

function readFromLocalStorage(): unknown {
  try {
    const raw = window.localStorage.getItem(LOCAL_RUNTIME_CONFIG_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function saveLocalRuntimeConfig(config: CmsRuntimeConfig | null): void {
  try {
    if (config) window.localStorage.setItem(LOCAL_RUNTIME_CONFIG_KEY, JSON.stringify(config));
    else window.localStorage.removeItem(LOCAL_RUNTIME_CONFIG_KEY);
  } catch {
    // Storage blocked — the caller falls back to config.js.
  }
  cached = undefined;
}

function readFromGlobal(): CmsRuntimeConfig | null {
  if (typeof window === "undefined") return null;
  const fromScript = window.__AGENTCMS_CONFIG__;
  const raw = fromScript && typeof fromScript === "object" ? fromScript : readFromLocalStorage();
  if (!raw || typeof raw !== "object") return null;
  if (looksLikeMarkdownGitShape(raw)) return raw;
  if (looksLikeSqliteFileShape(raw)) return raw;
  if ((raw as { backend?: string }).backend === "local") return { backend: "local" };
  // Firebase configs written before the `backend` field existed have
  // no discriminator.
  if (looksLikeFirebaseShape(raw)) {
    // Normalize: add `backend: "firebase"` so callers can rely on the
    // discriminator even when the source omitted it.
    const methods = (raw as { signInMethods?: unknown }).signInMethods;
    const signInMethods = Array.isArray(methods)
      ? (methods.filter((m) => FIREBASE_SIGN_IN_METHODS.includes(m as FirebaseSignInMethod)) as FirebaseSignInMethod[])
      : undefined;
    return {
      backend: "firebase",
      firebase: raw.firebase,
      adminEmail: raw.adminEmail,
      ...(signInMethods?.length ? { signInMethods } : {}),
    };
  }
  return null;
}

function readFromImportMetaEnv(): CmsRuntimeConfig | null {
  const env = import.meta.env;
  const firebase: Partial<FirebaseOptions> = {};
  for (const field of FIREBASE_FIELDS) {
    const v = env[ENV_KEY_BY_FIELD[field]];
    if (!nonEmpty(v)) return null;
    (firebase as Record<string, string>)[field] = v;
  }
  // adminEmail is optional — VITE_ADMIN_EMAIL is the legacy fallback
  // used by the email-comparison bootstrap detection. Modern setups
  // can leave it unset; the rules-based probe takes over.
  const adminEmail = env.VITE_ADMIN_EMAIL;
  return {
    backend: "firebase",
    firebase: firebase as FirebaseOptions,
    ...(nonEmpty(adminEmail) ? { adminEmail } : {}),
  };
}

let cached: CmsRuntimeConfig | null | undefined;

export function getRuntimeConfig(): CmsRuntimeConfig | null {
  if (cached !== undefined) return cached;
  cached = readFromGlobal() ?? readFromImportMetaEnv();
  return cached;
}

// Test / setup-flow helper: drops the cache so the next call
// re-evaluates the resolver. Used by the SetupForm's "Save & reload"
// path to verify the just-uploaded config.js without a full page
// reload (when feasible).
export function resetRuntimeConfigCache(): void {
  cached = undefined;
}

// Convenience: which backend is active? Returns null when the
// resolver couldn't produce a complete config (i.e. the SetupForm is
// about to render).
export function getBackendKind(): BackendKind | null {
  return getRuntimeConfig()?.backend ?? null;
}

// Returns the env var names that would need to be set if we were
// going the .env route. Useful for the "missing fields" diagnostic
// on the pre-setup error screen and in the SetupForm. Only relevant
// for the Firebase backend — the others have no .env fallback.
export function getMissingFirebaseFields(): string[] {
  const fromGlobal = readFromGlobal();
  if (fromGlobal && fromGlobal.backend === "firebase") return [];
  const env = import.meta.env;
  return FIREBASE_FIELDS.filter((f) => !nonEmpty(env[ENV_KEY_BY_FIELD[f]])).map(
    (f) => ENV_KEY_BY_FIELD[f],
  );
}

// Serialises a runtime config back into the JS source code for
// <admin folder>/config.js. It executes synchronously before the bundle
// on the next load and the resolver picks the values up via
// readFromGlobal(). Never contains a secret: Firebase web config is
// public, git / SQLite-file configs hold locations only (tokens and
// keys stay in each browser).
//
// FIREBASE: adminEmail is intentionally stripped from the serialised
// output even when present in the input. The modern bootstrap-admin
// flow uses a Firestore probe (`config/admin` rule) and pinned email
// in the rules, so writing the admin email into the public config.js
// would re-introduce the privacy issue we just solved.
export function buildConfigJsSource(config: CmsRuntimeConfig): string {
  const banner =
    "// Generated by AgentCMS first-run setup. Do not edit by hand —\n" +
    "// re-run the admin setup form to update.\n";
  let serialisable: object;
  if (config.backend === "firebase") {
    serialisable = {
      backend: config.backend,
      firebase: config.firebase,
      ...(config.signInMethods?.length && config.signInMethods.join() !== "password" ? { signInMethods: config.signInMethods } : {}),
    };
  } else if (config.backend === "markdown-git") {
    // Repo coordinates only — tokens never leave the editor's browser.
    serialisable = { backend: config.backend, git: config.git };
  } else if (config.backend === "sqlite-file") {
    // Location only; connector secrets stay in each browser.
    serialisable = { backend: config.backend, sqlite: config.sqlite };
  } else {
    serialisable = { backend: config.backend };
  }
  return `${banner}window.__AGENTCMS_CONFIG__ = ${JSON.stringify(serialisable, null, 2)};\n`;
}

// Sign-in methods of the active Firebase config (default: password).
export function getSignInMethods(): FirebaseSignInMethod[] {
  const config = getRuntimeConfig();
  const methods = config?.backend === "firebase" ? config.signInMethods : undefined;
  return methods?.length ? methods : ["password"];
}
