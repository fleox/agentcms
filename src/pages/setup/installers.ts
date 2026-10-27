import { signInWithEmailAndPassword } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import {
  buildConfigJsSource,
  resetRuntimeConfigCache,
  saveLocalRuntimeConfig,
  type FirebaseRuntimeConfig,
  type CmsRuntimeConfig,
  type MarkdownGitRuntimeConfig,
} from "../../lib/runtimeConfig";
import { getDocStore } from "../../services/docstore";
import { LOCAL_CONTENT_HANDLE_KEY, setGitToken } from "../../services/docstore/gitStore";
import { collections, configDocs, getAuthClient, getDb, initFirebaseFromSetup } from "../../services/firebaseClient";
import { withStorageBatch } from "../../services/siteFiles";
import { createRemoteGitTransport, joinRepoPath, loadFolderHandle } from "../../services/git";
import { savePublishTarget, type PublishTarget } from "../../services/storage/target";
import { instantiateStorageConnector } from "../../services/storage/registry";
import { testStorageConnection } from "../../services/storage/testConnection";
import {
  openDatabaseBytes,
  saveSqliteConnectorSecrets,
  saveSqlitePassphrase,
  splitConnectorSettings,
} from "../../services/docstore/sqliteFileStore";
import { isEncryptedDatabase, SqlitePassphraseError } from "../../services/docstore/sqliteCrypto";
import { ensurePublishBranch } from "../../services/docstore/sqliteLocation";
import { syncThemeAssets } from "../../services/themeSync";
import { adminUrlOn, currentAdminFolderOn, deployAdmin, uploadConfigJsTo } from "../../services/adminDeploy";

// Setup logic without UI. The wizard is: 1. data backend (+ its
// credentials, verified on "Continue") → 2. hosting (publish target,
// tested on "Continue") → 3. install (everything below).
//
// Failures throw SetupError so the wizard can render a precise message.

export type SetupErrorKind =
  | "missingFields"
  | "firebaseAuth"
  | "firebaseAuthInvalidCredential"
  | "wrongAdminEmail"
  | "rulesNotPinned"
  | "firestoreRules"
  | "firestoreOther"
  | "generic";

export class SetupError extends Error {
  constructor(
    public readonly kind: SetupErrorKind,
    public readonly detail?: string,
  ) {
    super(detail ?? kind);
    this.name = "SetupError";
  }
}

export interface SetupForm {
  // Firebase web-app config
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
  // Firebase admin account
  adminEmail: string;
  adminPassword: string;
}

export type GitContent = MarkdownGitRuntimeConfig["git"];

export interface Progress {
  step: (label: string) => void;
  done: (label: string) => void;
}

type T = (key: string, opts?: Record<string, unknown>) => string;

export interface InstallResult {
  runtime: CmsRuntimeConfig;
  // true → config.js now lives in the admin folder on the hosting and
  // the admin reloads by itself; false → the config is in this browser
  // and the wizard offers config.js as a download.
  configUploaded: boolean;
  // Set when the admin was copied onto the publish target.
  adminUrl?: string;
}

export interface InstallOptions {
  // Copy the admin itself into this folder of the publish target.
  hostAdminFolder?: string | null;
}

// After the publish target is saved (so uploads go to it): copies the
// admin there when asked, or — when this admin already runs from the
// target — drops config.js next to it.
async function hostAdmin(
  runtime: CmsRuntimeConfig,
  target: PublishTarget | null,
  opts: InstallOptions,
  p: Progress,
  t: T,
): Promise<{ configUploaded: boolean; adminUrl?: string }> {
  if (!target) return { configUploaded: false };
  if (opts.hostAdminFolder) {
    const label = t("setup.adminHosting.deploying");
    p.step(label);
    await deployAdmin(opts.hostAdminFolder, runtime, (done, total) => p.step(`${label} ${done}/${total}`));
    p.done(label);
    return { configUploaded: true, adminUrl: adminUrlOn(target, opts.hostAdminFolder) ?? undefined };
  }
  const folder = currentAdminFolderOn(target);
  if (folder) {
    p.step(t("setup.steps.uploadConfig"));
    await uploadConfigJsTo(folder, runtime);
    p.done(t("setup.steps.uploadConfig"));
    return { configUploaded: true };
  }
  return { configUploaded: false };
}

// ─── Validation ──────────────────────────────────────────────────────────

const EMAIL_RE = /.+@.+\..+/;

export function firebaseFieldsComplete(f: SetupForm): boolean {
  return (
    [f.apiKey, f.authDomain, f.projectId, f.storageBucket, f.messagingSenderId, f.appId, f.adminEmail, f.adminPassword].every(
      Boolean,
    ) && EMAIL_RE.test(f.adminEmail)
  );
}

function firebaseRuntime(f: SetupForm): FirebaseRuntimeConfig {
  return {
    backend: "firebase",
    firebase: {
      apiKey: f.apiKey,
      authDomain: f.authDomain,
      projectId: f.projectId,
      storageBucket: f.storageBucket,
      messagingSenderId: f.messagingSenderId,
      appId: f.appId,
    },
  };
}

// Same mapping as the pre-refactor SetupForm.
function authErrorKey(err: unknown): string {
  const code = (err as { code?: string })?.code ?? "";
  switch (code) {
    case "auth/invalid-credential":
    case "auth/wrong-password":
      return "setup.errors.firebaseAuthInvalidCredential";
    case "auth/user-not-found":
      return "setup.errors.firebaseAuthUserNotFound";
    case "auth/invalid-email":
      return "setup.errors.firebaseAuthInvalidEmail";
    case "auth/api-key-not-valid":
    case "auth/invalid-api-key":
      return "setup.errors.firebaseInvalidApiKey";
    case "auth/network-request-failed":
      return "setup.errors.firebaseNetwork";
    case "auth/too-many-requests":
      return "setup.errors.firebaseTooManyRequests";
    case "auth/operation-not-allowed":
      return "setup.errors.firebaseOperationNotAllowed";
    case "auth/user-disabled":
      return "setup.errors.firebaseUserDisabled";
    default:
      return "setup.errors.firebaseAuthGeneric";
  }
}

// ─── Step 1 checks (run on "Continue") ───────────────────────────────────

// Initialises the SDK, signs the admin in, checks the email and the
// pinned Firestore rules. No writes — the user can still go back.
export async function verifyFirebase(f: SetupForm, t: T): Promise<void> {
  if (!firebaseFieldsComplete(f)) throw new SetupError("missingFields");
  initFirebaseFromSetup(firebaseRuntime(f));
  try {
    await signInWithEmailAndPassword(getAuthClient(), f.adminEmail, f.adminPassword);
  } catch (err) {
    const key = authErrorKey(err);
    if (key === "setup.errors.firebaseAuthInvalidCredential") throw new SetupError("firebaseAuthInvalidCredential");
    const fbErr = err as { code?: string; message?: string };
    let detail = t(key);
    if (key === "setup.errors.firebaseAuthGeneric") {
      if (fbErr.code) detail += ` [${fbErr.code}]`;
      if (fbErr.message) detail += `: ${fbErr.message}`;
    }
    throw new SetupError("firebaseAuth", detail);
  }
  if ((getAuthClient().currentUser?.email ?? "").toLowerCase() !== f.adminEmail) {
    throw new SetupError("wrongAdminEmail");
  }
  try {
    await getDoc(doc(getDb(), collections.config, configDocs.admin));
  } catch (err) {
    if ((err as { code?: string })?.code === "permission-denied") throw new SetupError("rulesNotPinned", f.adminEmail);
    throw err;
  }
}

// Markdown in git: checks repo write access and detects a repo another
// editor already set up (its publish target is then reused as-is).
export async function verifyGitContent(git: GitContent, token: string, t: T): Promise<PublishTarget | null> {
  if (git.provider === "local") {
    if (!(await loadFolderHandle(LOCAL_CONTENT_HANDLE_KEY))) throw new SetupError("generic", t("setup.docstore.folderRequired"));
    return null;
  }
  if (!token.trim() || (git.provider === "github" ? !git.owner || !git.repo : !git.project)) {
    throw new SetupError("missingFields");
  }
  const transport = createRemoteGitTransport(
    git.provider === "github"
      ? { provider: "github", owner: git.owner ?? "", repo: git.repo ?? "", branch: git.branch, token, apiBaseUrl: git.apiBaseUrl }
      : { provider: "gitlab", project: git.project ?? "", branch: git.branch, token, apiBaseUrl: git.apiBaseUrl },
  );
  let perms;
  try {
    perms = await transport.permissions();
  } catch {
    throw new SetupError("generic", t("gitAccess.failed"));
  }
  if (!perms.canWrite) throw new SetupError("generic", t("gitAccess.failed"));
  const tree = await transport.listTree();
  const storagePath = joinRepoPath(git.contentDir, ".cms/config/storage.json");
  const entry = tree.entries.find((e) => e.path === storagePath);
  if (!entry) return null;
  const raw = (await transport.readTexts([entry])).get(entry.path);
  const stored = raw ? (JSON.parse(raw) as { connectorId?: string; settings?: Record<string, unknown> }) : null;
  return stored?.connectorId ? { connectorId: stored.connectorId, settings: stored.settings ?? {} } : null;
}

// SQLite file on the user's hosting (or a separate private location):
// the location must accept a write (probe file) and, if a database
// already exists there, it is reused — an encrypted one must open with
// the passphrase typed in the wizard. Returns true when one was found.
export async function verifySqliteFile(location: PublishTarget, path: string, t: T, passphrase?: string | null): Promise<boolean> {
  if (!/^[\w./-]+\.(sqlite|db)$/i.test(path.trim())) throw new SetupError("missingFields");
  const res = await testStorageConnection(location.connectorId, location.settings, { ignore: ["siteUrl"] });
  if (!res.ok) throw new SetupError("generic", `${t("connectors.testFailed")} — ${res.detail}`);
  const connector = instantiateStorageConnector(location.connectorId, location.settings);
  if (!connector.getBytes) throw new SetupError("generic", t("docstore.errors.sqliteUnsupported", { connector: location.connectorId }));
  const bytes = await connector.getBytes(path.trim().replace(/^\/+/, ""));
  if (bytes && isEncryptedDatabase(bytes)) {
    try {
      await openDatabaseBytes(bytes, passphrase ?? null);
    } catch (err) {
      if (err instanceof SqlitePassphraseError) {
        throw new SetupError("generic", t(err.reason === "wrong" ? "sqliteAccess.passphraseWrong" : "setup.sqliteFile.existingEncrypted"));
      }
      throw err;
    }
  }
  return bytes !== null;
}

// ─── Step 3: install ─────────────────────────────────────────────────────

function activate(runtime: CmsRuntimeConfig): void {
  window.__AGENTCMS_CONFIG__ = runtime;
  resetRuntimeConfigCache();
}

// Saves the runtime config for future boots in this browser (config.js
// next to a hosted admin is written by hostAdmin()).
function persistRuntime(runtime: CmsRuntimeConfig): void {
  saveLocalRuntimeConfig(runtime);
}

async function saveTarget(target: PublishTarget | null, p: Progress, t: T, onPermissionDenied?: () => SetupError) {
  if (!target) return;
  p.step(t("setup.install.saveTarget"));
  try {
    await savePublishTarget(target, { siteUrl: "always" });
  } catch (err) {
    if ((err as { code?: string })?.code === "permission-denied" && onPermissionDenied) throw onPermissionDenied();
    throw new SetupError("firestoreOther", (err as Error).message);
  }
  p.done(t("setup.install.saveTarget"));
}

async function syncThemes(p: Progress, t: T) {
  p.step(t("setup.steps.syncThemes"));
  try {
    await withStorageBatch(() => syncThemeAssets(undefined, undefined));
  } catch (err) {
    // Non-fatal: "Sync theme assets" in Themes retries it.
    console.error("[setup] theme assets sync failed:", err);
  }
  p.done(t("setup.steps.syncThemes"));
}

// Firebase: the admin is already signed in (verifyFirebase).
export async function installFirebase(
  f: SetupForm,
  target: PublishTarget,
  p: Progress,
  t: T,
  opts: InstallOptions = {},
): Promise<InstallResult> {
  const runtime = firebaseRuntime(f);
  activate(runtime);
  await saveTarget(target, p, t, () => new SetupError("firestoreRules", f.adminEmail));
  persistRuntime(runtime);
  await syncThemes(p, t);
  const hosted = await hostAdmin(runtime, target, opts, p, t);
  return { runtime, ...hosted };
}

export type DocStoreInput =
  | { backend: "local" }
  | { backend: "markdown-git"; git: GitContent; token: string }
  // passphrase set → the file is encrypted with it (sqliteCrypto.ts).
  | { backend: "sqlite-file"; location: PublishTarget; path: string; passphrase?: string | null };

// Markdown in git / SQLite file / this browser. `target` null = reuse
// the publish target already stored in the content.
export async function installDocStore(
  input: DocStoreInput,
  target: PublishTarget | null,
  p: Progress,
  t: T,
  opts: InstallOptions & { reusedTarget?: PublishTarget | null } = {},
): Promise<InstallResult> {
  let runtime: CmsRuntimeConfig;
  if (input.backend === "local") {
    runtime = { backend: "local" };
  } else if (input.backend === "sqlite-file") {
    // Connector secrets stay in this browser; the rest goes to config.js.
    const { publicSettings, secrets } = splitConnectorSettings(input.location.settings);
    saveSqliteConnectorSecrets(secrets);
    const passphrase = input.passphrase?.trim() || null;
    saveSqlitePassphrase(passphrase);
    runtime = {
      backend: "sqlite-file",
      sqlite: {
        connectorId: input.location.connectorId,
        settings: publicSettings,
        path: input.path.trim().replace(/^\/+/, ""),
        ...(passphrase ? { encrypted: true } : {}),
      },
    };
  } else {
    const git = input.git;
    runtime = {
          backend: "markdown-git",
          git: {
            ...git,
            owner: git.provider === "github" ? git.owner?.trim() : undefined,
            repo: git.provider === "github" ? git.repo?.trim() : undefined,
            project: git.provider === "gitlab" ? git.project?.trim() : undefined,
            branch: git.branch.trim() || "main",
            contentDir: git.contentDir.trim().replace(/^\/+|\/+$/g, ""),
            apiBaseUrl: git.apiBaseUrl?.trim() || undefined,
          },
        };
    if (runtime.git.provider !== "local") setGitToken(runtime.git, input.token);
  }
  activate(runtime);
  try {
    // SQLite on a dedicated branch of a git hosting: the published branch
    // must exist first (an empty repo's first branch becomes its default).
    if (input.backend === "sqlite-file" && target) await ensurePublishBranch(target);
    p.step(t("setup.docstore.steps.content"));
    await getDocStore().ready();
    p.done(t("setup.docstore.steps.content"));
    await saveTarget(target, p, t);
    persistRuntime(runtime);
    await syncThemes(p, t);
    const hosted = await hostAdmin(runtime, target ?? opts.reusedTarget ?? null, opts, p, t);
    return { runtime, ...hosted };
  } catch (err) {
    // Leave the browser in setup mode so the user can retry.
    saveLocalRuntimeConfig(null);
    window.__AGENTCMS_CONFIG__ = null;
    resetRuntimeConfigCache();
    throw err;
  }
}

export function downloadConfigJs(runtime: CmsRuntimeConfig): void {
  const blob = new Blob([buildConfigJsSource(runtime)], { type: "text/javascript" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "config.js";
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 10_000);
}
