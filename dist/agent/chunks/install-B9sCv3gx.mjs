import { createRequire as __acmsRequire } from "node:module";
import { fileURLToPath as __acmsPath } from "node:url";
import { dirname as __acmsDirname } from "node:path";
const require2 = __acmsRequire(import.meta.url);
const __filename = __acmsPath(import.meta.url);
const __dirname = __acmsDirname(__filename);
import { s as saveSqliteConnectorSecrets, a as saveSqlitePassphrase, g as getDocStore, t as testStorageConnection, o as openDatabaseBytes, b as githubPagesCheck, r as resetDocStore, i as invalidateActiveStorageConnector } from "./registry-Df5_x1nj.mjs";
import { s as setGitToken } from "./gitStore-JGTWtX_B.mjs";
import { g as generatePassphrase, s as setCredential, i as isEncryptedDatabase, S as SqlitePassphraseError } from "../agentcms.mjs";
import { e as ensurePublishBranch } from "./plan-CeXlCTev.mjs";
import { j as joinRepoPath, c as createRemoteGitTransport } from "./index-BA9sR5p-.mjs";
import { resetRuntimeConfigCache } from "./runtimeConfig-2M2d2Pbu.mjs";
import { savePublishTarget } from "./target-C4nVAQvD.mjs";
import { subscribeToToasts } from "./toast-CYyyaSAW.mjs";
import { loadSqlWasm, themeAssetOps, adminOps, applyOps, hostingConnector } from "./hosting-D9KnbC3T.mjs";
import "./index-DCzLoAau.mjs";
import "./firebaseClient-D3fvED27.mjs";
import "./index-B4MbpTF6.mjs";
import "./index.esm2017-C4mMOVmK.mjs";
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
import "./index-BzGlTM6h.mjs";
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
import "./settings-CEBDXaTg.mjs";
import "./settings-DlkdUVwn.mjs";
import "./batch-D8J83Ok2.mjs";
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
  return { hosting, data };
}
async function checkFirebase(plan) {
  activate(plan.runtime);
  const login = plan.firebaseLogin;
  try {
    const { signIn } = await import("./auth-CBT30JNb.mjs");
    await signIn(login.email, login.password);
  } catch (err) {
    const code = err.code ?? "";
    const hint = /invalid-credential|wrong-password|user-not-found/.test(code) ? "wrong email or password" : /operation-not-allowed/.test(code) ? "Email/Password sign-in is disabled (Firebase console → Authentication → Sign-in method)" : code || err.message;
    return { ok: false, detail: `Firebase sign-in failed for ${login.email}: ${hint}`, existing: false };
  }
  const { doc, getDoc } = await import("./index-usQnUYGT.mjs");
  const { collections, configDocs, getDb } = await import("./firebaseClient-D3fvED27.mjs").then((n) => n.a8);
  try {
    await getDoc(doc(getDb(), collections.config, configDocs.admin));
  } catch (err) {
    const code = err.code ?? "";
    if (code === "permission-denied") {
      const { getAuthClient } = await import("./firebaseClient-D3fvED27.mjs").then((n) => n.a8);
      const user = getAuthClient().currentUser;
      if (user && !user.emailVerified) {
        const { sendEmailVerification } = await import("./index-BzGlTM6h.mjs");
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
  const { getStorageConfig } = await import("./registry-Df5_x1nj.mjs").then((n) => n.C);
  const stored = await getStorageConfig().catch(() => null);
  const { getDoc: gd } = await import("./index-usQnUYGT.mjs");
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
      const { signIn } = await import("./auth-CBT30JNb.mjs");
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
