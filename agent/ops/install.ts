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
import { githubPagesCheck, resolveGitPagesToken, type GitPagesSettings } from "../../src/services/storage/connectors/gitPages";
import { adminOps, applyOps, hostingConnector, loadSqlWasm, themeAssetOps } from "./hosting";
import type { ResolvedPlan } from "./plan";

// Same steps as the setup wizard's installDocStore (src/pages/setup/
// installers.ts), driven from Node: content store → publish target →
// theme assets + admin copied onto the hosting in ONE batch.

export interface RepoInfo {
  role: "content" | "site";
  repo: string;
  visibility: "public" | "private" | "internal" | "unknown";
}

export interface CheckReport {
  hosting: { ok: boolean; detail: string };
  // Content and site repositories with their visibility (git backends /
  // git hostings only), checked before anything is written.
  repos: RepoInfo[];
  repoProblems: { code: "repos-swapped" | "content-public" | "site-private"; message: string; blocking: boolean }[];
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
          detail: `${perms.login} → ${transport.label}${git.contentDir ? `, folder "${git.contentDir}"` : " (repository root)"}`,
          existing: tree.entries.some((e) => e.path.startsWith(joinRepoPath(git.contentDir, ".cms/"))),
          storedTarget,
        };
      }
    } catch (err) {
      data = { ok: false, detail: (err as Error).message, existing: false };
    }
  } else if (plan.runtime.backend === "firebase") {
    data = await checkFirebase(plan);
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
  const repos = await repoVisibility(plan);
  return { hosting, data, repos, repoProblems: repoProblems(plan, repos) };
}

// Pages hostings that serve the repository themselves (Cloudflare Pages
// and other hosts build from a private repo through their own app).
const PAGES_NEEDS_PUBLIC = new Set(["github-pages", "gitlab-pages"]);

async function repoVisibility(plan: ResolvedPlan): Promise<RepoInfo[]> {
  const out: RepoInfo[] = [];
  const probe = async (role: RepoInfo["role"], transport: ReturnType<typeof createRemoteGitTransport>) => {
    const repo = transport.label.replace(/@[^@]*$/, "");
    // One repository for both (site published from a docs folder): the
    // content-exposure warning of `install` covers it.
    if (out.some((r) => r.repo === repo)) {
      out.splice(0, out.length);
      return;
    }
    try {
      out.push({ role, repo, visibility: (await transport.permissions()).visibility ?? "unknown" });
    } catch {
      out.push({ role, repo, visibility: "unknown" });
    }
  };
  if (plan.runtime.backend === "markdown-git") await probe("content", gitTransport(plan.runtime.git, plan.gitToken ?? ""));
  if (plan.target.connectorId === "git-pages") {
    const s = plan.target.settings as unknown as GitPagesSettings;
    const token = resolveGitPagesToken(s);
    await probe(
      "site",
      createRemoteGitTransport(
        s.provider === "gitlab"
          ? { provider: "gitlab", project: s.project ?? "", branch: s.branch, token, apiBaseUrl: s.apiBaseUrl }
          : { provider: "github", owner: s.owner ?? "", repo: s.repo ?? "", branch: s.branch, token, apiBaseUrl: s.apiBaseUrl },
      ),
    );
  }
  return out;
}

function repoProblems(plan: ResolvedPlan, repos: RepoInfo[]): CheckReport["repoProblems"] {
  const content = repos.find((r) => r.role === "content");
  const site = repos.find((r) => r.role === "site");
  const problems: CheckReport["repoProblems"] = [];
  if (content?.visibility === "public" && site?.visibility === "private") {
    problems.push({
      code: "repos-swapped",
      blocking: true,
      message: `The repositories look swapped: the content repository ${content.repo} is public and the site repository ${site.repo} is private. The content (drafts, editors' emails) must be private; the site repository is the one that gets published.`,
    });
    return problems;
  }
  if (content?.visibility === "public") {
    problems.push({
      code: "content-public",
      blocking: true,
      message: `The content repository ${content.repo} is public: drafts, unpublished pages and users.json (editors' emails) would be readable by anyone. Make it private (repository Settings → General → Danger Zone → Change visibility).`,
    });
  }
  if (site?.visibility === "private" && PAGES_NEEDS_PUBLIC.has(plan.hostingType)) {
    problems.push({
      code: "site-private",
      blocking: false,
      message: `The site repository ${site.repo} is private: ${plan.hostingType === "gitlab-pages" ? "GitLab Pages must be visible to everyone in the project's Pages settings" : "GitHub Pages only works on private repositories with a paid plan (Pro, Team, Enterprise)"}. On a free plan, make it public.`,
    });
  }
  return problems;
}

// The setup wizard's verifyFirebase: sign in, then the rules-pinned
// config/admin probe proves the rules are published for this email.
async function checkFirebase(plan: ResolvedPlan): Promise<CheckReport["data"]> {
  activate(plan.runtime);
  const login = plan.firebaseLogin!;
  try {
    const { signIn } = await import("../../src/services/auth");
    await signIn(login.email, login.password);
  } catch (err) {
    const code = (err as { code?: string }).code ?? "";
    const hint = /invalid-credential|wrong-password|user-not-found/.test(code)
      ? "wrong email or password"
      : /operation-not-allowed/.test(code)
        ? "Email/Password sign-in is disabled (Firebase console → Authentication → Sign-in method)"
        : code || (err as Error).message;
    return { ok: false, detail: `Firebase sign-in failed for ${login.email}: ${hint}`, existing: false };
  }
  const { doc, getDoc } = await import("firebase/firestore");
  const { collections, configDocs, getDb } = await import("../../src/services/firebaseClient");
  try {
    await getDoc(doc(getDb(), collections.config, configDocs.admin));
  } catch (err) {
    const code = (err as { code?: string }).code ?? "";
    if (code === "permission-denied") {
      // The rules require a verified email for the bootstrap admin.
      const { getAuthClient } = await import("../../src/services/firebaseClient");
      const user = getAuthClient().currentUser;
      if (user && !user.emailVerified) {
        const { sendEmailVerification } = await import("firebase/auth");
        await sendEmailVerification(user).catch(() => {});
        return {
          ok: false,
          detail: `${login.email} is not verified yet: a verification email was just sent — the user clicks its link, then retry. (If it still fails afterwards, publish the rules: \`agentcms options --firebase-rules ${login.email}\`.)`,
          existing: false,
        };
      }
      return {
        ok: false,
        detail: `Firestore refused the admin probe: publish the AgentCMS rules with ${login.email} pinned (\`agentcms options --firebase-rules ${login.email}\` prints them; Firebase console → Firestore → Rules).`,
        existing: false,
      };
    }
    return {
      ok: false,
      detail: `Firestore unreachable: ${code || (err as Error).message} (is Firestore created in this project?)`,
      existing: false,
    };
  }
  const { getStorageConfig } = await import("../../src/services/storageConfig");
  const stored = await getStorageConfig().catch(() => null);
  const { getDoc: gd } = await import("firebase/firestore");
  const settingsSnap = await gd(doc(getDb(), collections.settings, "site")).catch(() => null);
  return {
    ok: true,
    detail: `${login.email} → Firebase project ${String((plan.runtime as { firebase: { projectId: string } }).firebase.projectId)}`,
    existing: !!settingsSnap?.exists?.() || !!stored,
    storedTarget: stored?.connectorId ? { connectorId: stored.connectorId, settings: stored.settings ?? {} } : null,
  };
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

    if (plan.runtime.backend === "firebase") {
      onStep("Signing in to Firebase");
      const { signIn } = await import("../../src/services/auth");
      await signIn(plan.firebaseLogin!.email, plan.firebaseLogin!.password);
    } else {
      onStep("Opening the content store");
      await getDocStore().ready();
    }
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
