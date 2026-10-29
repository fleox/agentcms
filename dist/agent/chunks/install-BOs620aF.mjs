import { createRequire as __acmsRequire } from "node:module";
import { fileURLToPath as __acmsPath } from "node:url";
import { dirname as __acmsDirname } from "node:path";
const require2 = __acmsRequire(import.meta.url);
const __filename = __acmsPath(import.meta.url);
const __dirname = __acmsDirname(__filename);
import { s as saveSqliteConnectorSecrets, a as saveSqlitePassphrase, g as getDocStore, t as testStorageConnection, o as openDatabaseBytes, b as githubPagesCheck, r as resetDocStore, c as resolveGitPagesToken, i as invalidateActiveStorageConnector } from "./registry-Bhq3fghS.mjs";
import { s as setGitToken } from "./gitStore-BkclOUWu.mjs";
import { g as generatePassphrase, s as setCredential, i as isEncryptedDatabase, S as SqlitePassphraseError } from "../agentcms.mjs";
import { e as ensurePublishBranch } from "./plan-CtfNVo2s.mjs";
import { j as joinRepoPath, c as createRemoteGitTransport } from "./index-B4uHS09W.mjs";
import { resetRuntimeConfigCache } from "./runtimeConfig-BNLCrrQo.mjs";
import { savePublishTarget } from "./target-CYRKjWK5.mjs";
import { subscribeToToasts } from "./toast-CYyyaSAW.mjs";
import { loadSqlWasm, themeAssetOps, adminOps, applyOps, hostingConnector } from "./hosting-B5zmtdAT.mjs";
import "./index-YdkzfKAt.mjs";
import "./index.node-DYLwqGPq.mjs";
import "./index.esm2017-BUfxW6Jp.mjs";
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
import "./firebaseClient-BjUVAcKz.mjs";
import "./index-CuB-ym-g.mjs";
import "./index-CjBqWaZn.mjs";
import "./index-K8rfbNOg.mjs";
import "buffer";
import "./types-DAD44Ttj.mjs";
import "node:util";
import "node:fs";
import "node:path";
import "node:url";
import "node:os";
import "node:child_process";
import "node:crypto";
import "node:http";
import "./settings-B145vJbM.mjs";
import "./settings-VHERPR8x.mjs";
import "./batch-C9qX5FMx.mjs";
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
          detail: `${perms.login} → ${transport.label}${git.contentDir ? `, folder "${git.contentDir}"` : " (repository root)"}`,
          existing: tree.entries.some((e) => e.path.startsWith(joinRepoPath(git.contentDir, ".cms/"))),
          storedTarget
        };
      }
    } catch (err) {
      data = { ok: false, detail: err.message, existing: false };
    }
  } else if (plan.runtime.backend === "firebase") {
    data = await checkFirebase(plan);
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
  const repos = await repoVisibility(plan);
  return { hosting, data, repos, repoProblems: repoProblems(plan, repos) };
}
const PAGES_NEEDS_PUBLIC = /* @__PURE__ */ new Set(["github-pages", "gitlab-pages"]);
async function repoVisibility(plan) {
  const out = [];
  const probe = async (role, transport) => {
    const repo = transport.label.replace(/@[^@]*$/, "");
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
    const s = plan.target.settings;
    const token = resolveGitPagesToken(s);
    await probe(
      "site",
      createRemoteGitTransport(
        s.provider === "gitlab" ? { provider: "gitlab", project: s.project ?? "", branch: s.branch, token, apiBaseUrl: s.apiBaseUrl } : { provider: "github", owner: s.owner ?? "", repo: s.repo ?? "", branch: s.branch, token, apiBaseUrl: s.apiBaseUrl }
      )
    );
  }
  return out;
}
function repoProblems(plan, repos) {
  const content = repos.find((r) => r.role === "content");
  const site = repos.find((r) => r.role === "site");
  const problems = [];
  if (content?.visibility === "public" && site?.visibility === "private") {
    problems.push({
      code: "repos-swapped",
      blocking: true,
      message: `The repositories look swapped: the content repository ${content.repo} is public and the site repository ${site.repo} is private. The content (drafts, editors' emails) must be private; the site repository is the one that gets published.`
    });
    return problems;
  }
  if (content?.visibility === "public") {
    problems.push({
      code: "content-public",
      blocking: true,
      message: `The content repository ${content.repo} is public: drafts, unpublished pages and users.json (editors' emails) would be readable by anyone. Make it private (repository Settings → General → Danger Zone → Change visibility).`
    });
  }
  if (site?.visibility === "private" && PAGES_NEEDS_PUBLIC.has(plan.hostingType)) {
    problems.push({
      code: "site-private",
      blocking: false,
      message: `The site repository ${site.repo} is private: ${plan.hostingType === "gitlab-pages" ? "GitLab Pages must be visible to everyone in the project's Pages settings" : "GitHub Pages only works on private repositories with a paid plan (Pro, Team, Enterprise)"}. On a free plan, make it public.`
    });
  }
  return problems;
}
async function checkFirebase(plan) {
  activate(plan.runtime);
  const login = plan.firebaseLogin;
  try {
    const { signIn } = await import("./auth-AtkRi2ef.mjs");
    await signIn(login.email, login.password);
  } catch (err) {
    const code = err.code ?? "";
    const hint = /invalid-credential|wrong-password|user-not-found/.test(code) ? "wrong email or password" : /operation-not-allowed/.test(code) ? "Email/Password sign-in is disabled (Firebase console → Authentication → Sign-in method)" : code || err.message;
    return { ok: false, detail: `Firebase sign-in failed for ${login.email}: ${hint}`, existing: false };
  }
  const { doc, getDoc } = await import("./index-gaX3m4ss.mjs");
  const { collections, configDocs, getDb } = await import("./firebaseClient-BjUVAcKz.mjs");
  try {
    await getDoc(doc(getDb(), collections.config, configDocs.admin));
  } catch (err) {
    const code = err.code ?? "";
    if (code === "permission-denied") {
      const { getAuthClient } = await import("./firebaseClient-BjUVAcKz.mjs");
      const user = getAuthClient().currentUser;
      if (user && !user.emailVerified) {
        const { sendEmailVerification } = await import("./index-CjBqWaZn.mjs");
        await sendEmailVerification(user).catch(() => {
        });
        return {
          ok: false,
          detail: `${login.email} is not verified yet: a verification email was just sent — the user clicks its link, then retry. (If it still fails afterwards, publish the rules: \`agentcms options --firebase-rules ${login.email}\`.)`,
          existing: false
        };
      }
      return {
        ok: false,
        detail: `Firestore refused the admin probe: publish the AgentCMS rules with ${login.email} pinned (\`agentcms options --firebase-rules ${login.email}\` prints them; Firebase console → Firestore → Rules).`,
        existing: false
      };
    }
    return {
      ok: false,
      detail: `Firestore unreachable: ${code || err.message} (is Firestore created in this project?)`,
      existing: false
    };
  }
  const { getStorageConfig } = await import("./registry-Bhq3fghS.mjs").then((n) => n.C);
  const stored = await getStorageConfig().catch(() => null);
  const { getDoc: gd } = await import("./index-gaX3m4ss.mjs");
  const settingsSnap = await gd(doc(getDb(), collections.settings, "site")).catch(() => null);
  return {
    ok: true,
    detail: `${login.email} → Firebase project ${String(plan.runtime.firebase.projectId)}`,
    existing: !!settingsSnap?.exists?.() || !!stored,
    storedTarget: stored?.connectorId ? { connectorId: stored.connectorId, settings: stored.settings ?? {} } : null
  };
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
    if (plan.runtime.backend === "firebase") {
      onStep("Signing in to Firebase");
      const { signIn } = await import("./auth-AtkRi2ef.mjs");
      await signIn(plan.firebaseLogin.email, plan.firebaseLogin.password);
    } else {
      onStep("Opening the content store");
      await getDocStore().ready();
    }
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
