import { createRequire as __acmsRequire } from "node:module";
import { fileURLToPath as __acmsPath } from "node:url";
import { dirname as __acmsDirname } from "node:path";
const require2 = __acmsRequire(import.meta.url);
const __filename = __acmsPath(import.meta.url);
const __dirname = __acmsDirname(__filename);
import { a as splitSecrets } from "./gitStore-B73bVtQE.mjs";
import { c as createRemoteGitTransport, j as joinRepoPath } from "./index-CSdeWPb1.mjs";
import { o as openDatabaseBytes, j as decodeDatabase } from "./registry-DtIHQIc1.mjs";
import { loadSqlWasm, hostingConnector } from "./hosting-Clz31E-S.mjs";
import { C as CliError, k as fetchText, m as parseConfigJs, n as parseAccount, b as requireCredential, f as fetchHostedAdmin } from "../agentcms.mjs";
import "./index-CqPWXpW_.mjs";
import "./toast-CYyyaSAW.mjs";
import "./types-DAD44Ttj.mjs";
import "./runtimeConfig-2M2d2Pbu.mjs";
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
import "node:fs";
import "node:path";
import "./batch-D8QeLwrl.mjs";
import "node:util";
import "node:url";
import "node:os";
import "node:child_process";
import "node:crypto";
import "node:http";
import "./plan-C2vZ1uAm.mjs";
async function siteFromAdminUrl(opts) {
  let admin;
  try {
    admin = new URL(opts.adminUrl.endsWith("/") ? opts.adminUrl : opts.adminUrl.replace(/\/index\.html$/, "") + "/");
  } catch {
    throw new CliError("usage", `Invalid admin URL: ${opts.adminUrl}`, void 0, 2);
  }
  const cfg = await fetchText(new URL("config.js", admin).href);
  if (!cfg.ok) throw new CliError("config-missing", `Could not read ${admin.href}config.js (${cfg.error ?? `HTTP ${cfg.status}`}).`);
  const runtime = parseConfigJs(cfg.text);
  if (!runtime || typeof runtime.backend !== "string") {
    throw new CliError("not-installed", "That admin has no configuration yet (config.js is empty).", "Install it first (`agentcms install` or the setup wizard).");
  }
  const adminParent = new URL("..", admin).href.replace(/\/+$/, "");
  let siteUrl = (opts.siteUrl ?? adminParent).replace(/\/+$/, "");
  const adminFolder = admin.href.startsWith(siteUrl + "/") ? decodeURIComponent(admin.href.slice(siteUrl.length + 1)).replace(/\/+$/, "") : decodeURIComponent(admin.href.slice(adminParent.length + 1)).replace(/\/+$/, "");
  let hosting = { connectorId: "", settings: {} };
  const credentials = {};
  if (runtime.backend === "markdown-git") {
    const git = runtime.git;
    if (git.provider === "local") throw new CliError("unsupported", "Local-folder git content can't be managed from the CLI.");
    if (!opts.dataCredential) {
      throw new CliError("credential-required", "Markdown-in-git sites need --data-credential (the content repo token) to read the publish target.");
    }
    if (parseAccount(opts.dataCredential).type !== git.provider) throw new CliError("usage", `--data-credential must be a ${git.provider} account.`, void 0, 2);
    credentials.data = opts.dataCredential;
    const token = requireCredential(opts.dataCredential).values.token;
    const transport = createRemoteGitTransport(
      git.provider === "github" ? { provider: "github", owner: git.owner ?? "", repo: git.repo ?? "", branch: git.branch, token, apiBaseUrl: git.apiBaseUrl } : { provider: "gitlab", project: git.project ?? "", branch: git.branch, token, apiBaseUrl: git.apiBaseUrl }
    );
    const path = joinRepoPath(git.contentDir, ".cms/config/storage.json");
    const entry = (await transport.listTree()).entries.find((e) => e.path === path);
    const raw = entry ? (await transport.readTexts([entry])).get(path) : void 0;
    const stored = raw ? JSON.parse(raw) : null;
    if (stored?.connectorId) hosting = { connectorId: stored.connectorId, settings: splitSecrets(stored.settings ?? {}).clean };
    if (hosting.connectorId === "git-pages" && hosting.settings.provider === git.provider && !opts.hostingCredential) {
      credentials.hosting = opts.dataCredential;
    }
  } else if (runtime.backend === "firebase") {
    if (opts.dataCredential) {
      if (parseAccount(opts.dataCredential).type !== "firebase") throw new CliError("usage", "--data-credential must be a firebase:<name> account.", void 0, 2);
      credentials.data = opts.dataCredential;
      const { email, password } = requireCredential(opts.dataCredential).values;
      const { resetRuntimeConfigCache } = await import("./runtimeConfig-2M2d2Pbu.mjs");
      window.__AGENTCMS_CONFIG__ = runtime;
      resetRuntimeConfigCache();
      const { signIn } = await import("./auth-BLBk24Gz.mjs");
      try {
        await signIn(email, password);
      } catch (err) {
        throw new CliError("firebase-login", `Firebase sign-in failed for ${email}: ${err.code ?? err.message}.`);
      }
      const { getStorageConfig } = await import("./registry-DtIHQIc1.mjs").then((n) => n.C);
      const stored = await getStorageConfig().catch(() => null);
      if (stored?.connectorId) hosting = { connectorId: stored.connectorId, settings: splitSecrets(stored.settings ?? {}).clean };
    }
  } else if (runtime.backend === "sqlite-file") {
    hosting = { connectorId: runtime.sqlite.connectorId, settings: { siteUrl, ...runtime.sqlite.settings } };
    if (opts.passphraseCredential) {
      parseAccount(opts.passphraseCredential);
      credentials.passphrase = opts.passphraseCredential;
    }
    const locationCredential = opts.dataCredential ?? opts.hostingCredential;
    if (locationCredential) {
      if (opts.dataCredential) credentials.data = opts.dataCredential;
      loadSqlWasm();
      const location = { connectorId: runtime.sqlite.connectorId, settings: { ...runtime.sqlite.settings, ...requireCredential(locationCredential).values } };
      const bytes = await hostingConnector(location).getBytes?.(runtime.sqlite.path);
      if (bytes) {
        const passphrase = opts.passphraseCredential ? requireCredential(opts.passphraseCredential).values.passphrase : null;
        const { plain } = await openDatabaseBytes(bytes, passphrase);
        const snapshot = await decodeDatabase(plain);
        const storage = snapshot.config.get("storage");
        if (storage?.connectorId) {
          hosting = { connectorId: storage.connectorId, settings: splitSecrets(storage.settings ?? {}).clean };
        }
      }
    }
  }
  if (opts.hostingCredential) {
    parseAccount(opts.hostingCredential);
    credentials.hosting = opts.hostingCredential;
  }
  const storedSiteUrl = typeof hosting.settings.siteUrl === "string" ? hosting.settings.siteUrl.replace(/\/+$/, "") : "";
  if (!opts.siteUrl && storedSiteUrl && storedSiteUrl !== siteUrl) siteUrl = storedSiteUrl;
  hosting = { ...hosting, settings: { ...hosting.settings, siteUrl } };
  const hosted = await fetchHostedAdmin(admin.href);
  const now = (/* @__PURE__ */ new Date()).toISOString();
  return {
    alias: opts.alias,
    siteUrl,
    adminFolder,
    runtime,
    hosting,
    credentials,
    adminVersion: hosted.version ?? void 0,
    installedAt: now,
    updatedAt: now
  };
}
export {
  siteFromAdminUrl
};
