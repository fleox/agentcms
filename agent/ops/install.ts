import { getDocStore, resetDocStore } from "../../src/services/docstore";
import { setGitToken } from "../../src/services/docstore/gitStore";
import {
  openDatabaseBytes,
  saveSqliteConnectorSecrets,
  saveSqlitePassphrase,
} from "../../src/services/docstore/sqliteFileStore";
import { generatePassphrase, isEncryptedDatabase, SqlitePassphraseError } from "../../src/services/docstore/sqliteCrypto";
import { setCredential } from "../credentials";
import { ensurePublishBranch } from "../../src/services/docstore/sqliteLocation";
import { createRemoteGitTransport, joinRepoPath } from "../../src/services/git";
import { resetRuntimeConfigCache, type CmsRuntimeConfig, type MarkdownGitRuntimeConfig } from "../../src/lib/runtimeConfig";
import { invalidateActiveStorageConnector } from "../../src/services/storage/registry";
import { savePublishTarget } from "../../src/services/storage/target";
import { testStorageConnection } from "../../src/services/storage/testConnection";
import { subscribeToToasts } from "../../src/lib/toast";
import { githubPagesCheck } from "../../src/services/storage/connectors/gitPages";
import { adminOps, applyOps, hostingConnector, loadSqlWasm, themeAssetOps } from "./hosting";
import type { ResolvedPlan } from "./plan";

// Same steps as the setup wizard's installDocStore (src/pages/setup/
// installers.ts), driven from Node: content store → publish target →
// theme assets + admin copied onto the hosting in ONE batch.

export interface CheckReport {
  hosting: { ok: boolean; detail: string };
  data: { ok: boolean; detail: string; existing: boolean; storedTarget?: { connectorId: string; settings: Record<string, unknown> } | null };
}

// Toasts raised by src/ code (connector errors, GitHub Pages enabled or
// how to enable it…) become notices in the command's result.
export function collectToasts(): { notices: { level: string; message: string }[]; stop: () => void } {
  const notices: { level: string; message: string }[] = [];
  const stop = subscribeToToasts((t) => notices.push({ level: t.level, message: t.message }));
  return { notices, stop };
}

// The connector enables GitHub Pages in the background after a commit;
// wait for it so its notice is part of the result.
export async function settleHosting(target: { connectorId: string; settings: Record<string, unknown> }): Promise<void> {
  const s = target.settings;
  if (target.connectorId === "git-pages" && s.provider === "github") {
    await githubPagesCheck(String(s.owner ?? ""), String(s.repo ?? ""))?.catch(() => {});
  }
}

function gitTransport(git: MarkdownGitRuntimeConfig["git"], token: string) {
  return createRemoteGitTransport(
    git.provider === "github"
      ? { provider: "github", owner: git.owner ?? "", repo: git.repo ?? "", branch: git.branch, token, apiBaseUrl: git.apiBaseUrl }
      : { provider: "gitlab", project: git.project ?? "", branch: git.branch, token, apiBaseUrl: git.apiBaseUrl },
  );
}

// Side-effect free, except the probe file file-based hosts write + delete.
export async function checkPlan(plan: ResolvedPlan): Promise<CheckReport> {
  const hosting = await testStorageConnection(plan.target.connectorId, plan.target.settings);
  let data: CheckReport["data"];
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
          const stored = raw ? (JSON.parse(raw) as { connectorId?: string; settings?: Record<string, unknown> }) : null;
          storedTarget = stored?.connectorId ? { connectorId: stored.connectorId, settings: stored.settings ?? {} } : null;
        }
        data = {
          ok: true,
          detail: `${perms.login} → ${transport.label}`,
          existing: tree.entries.some((e) => e.path.startsWith(joinRepoPath(git.contentDir, ".cms/"))),
          storedTarget,
        };
      }
    } catch (err) {
      data = { ok: false, detail: (err as Error).message, existing: false };
    }
  } else {
    // The database lives on the hosting, or in its separate location.
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
      const message = err instanceof SqlitePassphraseError ? `wrong passphrase in ${plan.passphraseAccount}` : (err as Error).message;
      data = { ok: false, detail: message, existing: false };
    }
  }
  return { hosting, data };
}

function activate(runtime: CmsRuntimeConfig): void {
  window.__AGENTCMS_CONFIG__ = runtime;
  resetRuntimeConfigCache();
  resetDocStore();
  invalidateActiveStorageConnector();
}


export interface InstallOutcome {
  adminVersion: string | null;
  files: number;
  notices: { level: string; message: string }[];
}

export async function runInstall(plan: ResolvedPlan, onStep: (label: string) => void): Promise<InstallOutcome> {
  const toasts = collectToasts();
  try {
    activate(plan.runtime);
    if (plan.runtime.backend === "markdown-git") setGitToken(plan.runtime.git, plan.gitToken ?? null);
    if (plan.runtime.backend === "sqlite-file") {
      saveSqliteConnectorSecrets(plan.sqliteSecrets ?? {});
      if (plan.passphraseAccount) {
        // Stored BEFORE the first encrypted save, so it can't be lost.
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
    let adminVersion: string | null = null;
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
