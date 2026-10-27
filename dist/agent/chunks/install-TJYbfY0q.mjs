import { createRequire as __acmsRequire } from "node:module";
import { fileURLToPath as __acmsPath } from "node:url";
import { dirname as __acmsDirname } from "node:path";
const require2 = __acmsRequire(import.meta.url);
const __filename = __acmsPath(import.meta.url);
const __dirname = __acmsDirname(__filename);
import { s as setStorageConfig, i as invalidateActiveStorageConnector, a as saveSqliteConnectorSecrets, b as saveSqlitePassphrase, g as getDocStore, t as testStorageConnection, o as openDatabaseBytes, c as githubPagesCheck, r as resetDocStore } from "./registry-DClFwwHa.mjs";
import { s as setGitToken } from "./gitStore-2dU0WJGr.mjs";
import { g as generatePassphrase, s as setCredential, i as isEncryptedDatabase, S as SqlitePassphraseError } from "../agentcms.mjs";
import { e as ensurePublishBranch } from "./plan-v_cPgEaJ.mjs";
import { j as joinRepoPath, c as createRemoteGitTransport } from "./index-BVQJP7xk.mjs";
import { resetRuntimeConfigCache } from "./runtimeConfig-DyVDQuHr.mjs";
import { getSettings, updateSettings } from "./settings-rfzR10i9.mjs";
import { subscribeToToasts } from "./toast-CYyyaSAW.mjs";
import { loadSqlWasm, themeAssetOps, adminOps, applyOps, hostingConnector } from "./hosting-DLKOgr4B.mjs";
import "./firebaseClient-BTpUMbPI.mjs";
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
import "./index-K8rfbNOg.mjs";
import "buffer";
import "./types-DAD44Ttj.mjs";
import "node:util";
import "node:fs";
import "node:path";
import "node:url";
import "node:os";
import "node:child_process";
import "node:http";
import "./settings-DMAjCSQM.mjs";
import "./batch-XEvRH-T7.mjs";
function targetSiteUrl(target) {
  const raw = typeof target.settings.siteUrl === "string" ? target.settings.siteUrl.trim().replace(/\/+$/, "") : "";
  return /^https?:\/\//.test(raw) ? raw : "";
}
async function savePublishTarget(target, opts = {}) {
  const clean = {};
  for (const [k, v] of Object.entries(target.settings)) {
    if (v === void 0) continue;
    clean[k] = typeof v === "string" ? v.trim() : v;
  }
  await setStorageConfig({ connectorId: target.connectorId, settings: clean });
  invalidateActiveStorageConnector();
  await adoptSiteUrl(target, opts.siteUrl ?? "ifEmpty");
}
async function adoptSiteUrl(target, mode) {
  const siteUrl = targetSiteUrl(target);
  if (!siteUrl) return;
  try {
    const settings = await getSettings();
    const current = (settings.baseUrl ?? "").replace(/\/+$/, "");
    if (current === siteUrl) return;
    if (!current || mode === "always") await updateSettings({ baseUrl: siteUrl });
  } catch (err) {
    console.warn("[storage] could not adopt the publish target URL as base URL:", err);
  }
}
function collectToasts() {
  const notices = [];
  const stop = subscribeToToasts((t) => notices.push({ level: t.level, message: t.message }));
  return { notices, stop };
}
async function settleHosting(target) {
  const s = target.settings;
  if (target.connectorId === "git-pages" && s.provider === "github") {
    await githubPagesCheck(String(s.owner ?? ""), String(s.repo ?? ""))?.catch(() => {
    });
  }
}
function gitTransport(git, token) {
  return createRemoteGitTransport(
    git.provider === "github" ? { provider: "github", owner: git.owner ?? "", repo: git.repo ?? "", branch: git.branch, token, apiBaseUrl: git.apiBaseUrl } : { provider: "gitlab", project: git.project ?? "", branch: git.branch, token, apiBaseUrl: git.apiBaseUrl }
  );
}
async function checkPlan(plan) {
  const hosting = await testStorageConnection(plan.target.connectorId, plan.target.settings);
  let data;
  if (plan.runtime.backend === "markdown-git") {
    const git = plan.runtime.git;
    try {
      const transport = gitTransport(git, plan.gitToken ?? "");
      const perms = await transport.permissions();
      if (!perms.canWrite) {
        data = { ok: false, detail: `${perms.login}: read-only access to ${transport.label}`, existing: false };
      } else {
        const tree = await transport.listTree();
        const storagePath = joinRepoPath(git.contentDir, ".cms/config/storage.json");
        const entry = tree.entries.find((e) => e.path === storagePath);
        let storedTarget = null;
        if (entry) {
          const raw = (await transport.readTexts([entry])).get(entry.path);
          const stored = raw ? JSON.parse(raw) : null;
          storedTarget = stored?.connectorId ? { connectorId: stored.connectorId, settings: stored.settings ?? {} } : null;
        }
        data = {
          ok: true,
          detail: `${perms.login} → ${transport.label}`,
          existing: tree.entries.some((e) => e.path.startsWith(joinRepoPath(git.contentDir, ".cms/"))),
          storedTarget
        };
      }
    } catch (err) {
      data = { ok: false, detail: err.message, existing: false };
    }
  } else {
    const location = plan.dataLocation ?? plan.target;
    try {
      if (location !== plan.target) {
        const res = await testStorageConnection(location.connectorId, location.settings, { ignore: ["siteUrl"] });
        if (!res.ok) throw new Error(`data location: ${res.detail}`);
      }
      const connector = hostingConnector(location);
      if (!connector.getBytes) throw new Error(`${location.connectorId} can't hold a SQLite file`);
      const path = plan.runtime.backend === "sqlite-file" ? plan.runtime.sqlite.path : "";
      const bytes = await connector.getBytes(path);
      const where = `${path}${location !== plan.target ? ` (${plan.dataLocationType})` : ""}`;
      if (!bytes) {
        data = { ok: true, detail: `new ${plan.passphraseAccount ? "encrypted " : ""}database at ${where}`, existing: false };
      } else if (isEncryptedDatabase(bytes)) {
        if (!plan.passphrase) throw new Error(`an encrypted database already exists at ${where}: store its passphrase as ${plan.passphraseAccount ?? "passphrase:<alias>"} (and set data.encryption)`);
        await openDatabaseBytes(bytes, plan.passphrase);
        data = { ok: true, detail: `existing encrypted database at ${where}`, existing: true };
      } else {
        data = { ok: true, detail: `existing database at ${where}${plan.passphraseAccount ? " — encrypted from its next save" : ""}`, existing: true };
      }
    } catch (err) {
      const message = err instanceof SqlitePassphraseError ? `wrong passphrase in ${plan.passphraseAccount}` : err.message;
      data = { ok: false, detail: message, existing: false };
    }
  }
  return { hosting, data };
}
function activate(runtime) {
  window.__AGENTCMS_CONFIG__ = runtime;
  resetRuntimeConfigCache();
  resetDocStore();
  invalidateActiveStorageConnector();
}
async function runInstall(plan, onStep) {
  const toasts = collectToasts();
  try {
    activate(plan.runtime);
    if (plan.runtime.backend === "markdown-git") setGitToken(plan.runtime.git, plan.gitToken ?? null);
    if (plan.runtime.backend === "sqlite-file") {
      saveSqliteConnectorSecrets(plan.sqliteSecrets ?? {});
      if (plan.passphraseAccount) {
        if (!plan.passphrase) {
          plan.passphrase = generatePassphrase();
          setCredential(plan.passphraseAccount, { passphrase: plan.passphrase });
          onStep(`Generated the database passphrase (stored as ${plan.passphraseAccount})`);
        }
        saveSqlitePassphrase(plan.passphrase);
      }
      loadSqlWasm();
      await ensurePublishBranch(plan.target);
    }
    onStep("Opening the content store");
    await getDocStore().ready();
    onStep("Saving the publish target and site URL");
    await savePublishTarget(plan.target, { siteUrl: "always" });
    const ops = themeAssetOps();
    let adminVersion = null;
    if (plan.adminFolder) {
      const admin = adminOps(plan.adminFolder, plan.runtime);
      ops.push(...admin.ops);
      adminVersion = admin.manifest.version;
    }
    onStep(`Uploading ${ops.length} files (theme assets${plan.adminFolder ? " + admin" : ""})`);
    await applyOps(hostingConnector(plan.target), ops);
    await settleHosting(plan.target);
    return { adminVersion, files: ops.length, notices: toasts.notices };
  } finally {
    toasts.stop();
  }
}
export {
  checkPlan,
  collectToasts,
  runInstall,
  settleHosting
};
