import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { getDocStore } from "../../src/services/docstore";
import { setGitToken } from "../../src/services/docstore/gitStore";
import { saveSqliteConnectorSecrets, setSqlJsWasmBinary } from "../../src/services/docstore/sqliteFileStore";
import { createRemoteGitTransport, joinRepoPath } from "../../src/services/git";
import { resetRuntimeConfigCache, type FlexwegRuntimeConfig, type MarkdownGitRuntimeConfig } from "../../src/lib/runtimeConfig";
import { savePublishTarget } from "../../src/services/storage/target";
import { testStorageConnection } from "../../src/services/storage/testConnection";
import { subscribeToToasts } from "../../src/lib/toast";
import { githubPagesCheck } from "../../src/services/storage/connectors/gitPages";
import { CliError } from "../output";
import { distRoot } from "../paths";
import { adminOps, applyOps, hostingConnector, themeAssetOps } from "./hosting";
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
    // The database lives on the hosting itself.
    try {
      const connector = hostingConnector(plan.target);
      if (!connector.getBytes) throw new Error(`${plan.target.connectorId} can't hold a SQLite file`);
      const path = plan.runtime.backend === "sqlite-file" ? plan.runtime.sqlite.path : "";
      const existing = (await connector.getBytes(path)) !== null;
      data = { ok: true, detail: existing ? `existing database at ${path}` : `new database at ${path}`, existing };
    } catch (err) {
      data = { ok: false, detail: (err as Error).message, existing: false };
    }
  }
  return { hosting, data };
}

function activate(runtime: FlexwegRuntimeConfig): void {
  window.__FLEXWEG_CONFIG__ = runtime;
  resetRuntimeConfigCache();
}

function loadSqlWasm(): void {
  const assets = join(distRoot(), "admin", "assets");
  const wasm = readdirSync(assets).find((f) => /^sql-wasm.*\.wasm$/.test(f));
  if (!wasm) throw new CliError("admin-missing", `sql.js WASM not found in ${assets}.`);
  setSqlJsWasmBinary(new Uint8Array(readFileSync(join(assets, wasm))));
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
      loadSqlWasm();
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
