import type { CmsRuntimeConfig } from "../../src/lib/runtimeConfig";
import { splitSecrets } from "../../src/services/docstore/markdownLayout";
import { createRemoteGitTransport, joinRepoPath } from "../../src/services/git";
import { decodeDatabase, openDatabaseBytes } from "../../src/services/docstore/sqliteFileStore";
import { hostingConnector, loadSqlWasm } from "./hosting";
import { parseAccount, requireCredential } from "../credentials";
import { CliError } from "../output";
import { fetchHostedAdmin, fetchText, parseConfigJs } from "../remote";
import type { SiteRecord } from "../sites";

// Registers a site installed elsewhere (by hand, the wizard, another
// computer) from its admin URL: config.js tells the backend; the publish
// target is read from the content (git repo) or from config.js (SQLite).

export async function siteFromAdminUrl(opts: {
  alias: string;
  adminUrl: string;
  siteUrl?: string;
  dataCredential?: string;
  hostingCredential?: string;
  passphraseCredential?: string;
}): Promise<SiteRecord> {
  let admin: URL;
  try {
    admin = new URL(opts.adminUrl.endsWith("/") ? opts.adminUrl : opts.adminUrl.replace(/\/index\.html$/, "") + "/");
  } catch {
    throw new CliError("usage", `Invalid admin URL: ${opts.adminUrl}`, undefined, 2);
  }
  const cfg = await fetchText(new URL("config.js", admin).href);
  if (!cfg.ok) throw new CliError("config-missing", `Could not read ${admin.href}config.js (${cfg.error ?? `HTTP ${cfg.status}`}).`);
  const runtime = parseConfigJs(cfg.text) as CmsRuntimeConfig | null;
  if (!runtime || typeof runtime.backend !== "string") {
    throw new CliError("not-installed", "That admin has no configuration yet (config.js is empty).", "Install it first (`agentcms install` or the setup wizard).");
  }

  // Where the admin is served may differ from the public site URL (S3: the
  // admin over the bucket's https endpoint, the site on the http website
  // endpoint). The folder is taken from the admin URL; the public URL comes
  // from --site-url, else the publish target stored in the content, else
  // the admin's parent folder.
  const adminParent = new URL("..", admin).href.replace(/\/+$/, "");
  let siteUrl = (opts.siteUrl ?? adminParent).replace(/\/+$/, "");
  const adminFolder = admin.href.startsWith(siteUrl + "/")
    ? decodeURIComponent(admin.href.slice(siteUrl.length + 1)).replace(/\/+$/, "")
    : decodeURIComponent(admin.href.slice(adminParent.length + 1)).replace(/\/+$/, "");

  let hosting: SiteRecord["hosting"] = { connectorId: "", settings: {} };
  const credentials: SiteRecord["credentials"] = {};
  if (runtime.backend === "markdown-git") {
    const git = runtime.git;
    if (git.provider === "local") throw new CliError("unsupported", "Local-folder git content can't be managed from the CLI.");
    if (!opts.dataCredential) {
      throw new CliError("credential-required", "Markdown-in-git sites need --data-credential (the content repo token) to read the publish target.");
    }
    if (parseAccount(opts.dataCredential).type !== git.provider) throw new CliError("usage", `--data-credential must be a ${git.provider} account.`, undefined, 2);
    credentials.data = opts.dataCredential;
    const token = requireCredential(opts.dataCredential).values.token;
    const transport = createRemoteGitTransport(
      git.provider === "github"
        ? { provider: "github", owner: git.owner ?? "", repo: git.repo ?? "", branch: git.branch, token, apiBaseUrl: git.apiBaseUrl }
        : { provider: "gitlab", project: git.project ?? "", branch: git.branch, token, apiBaseUrl: git.apiBaseUrl },
    );
    const path = joinRepoPath(git.contentDir, ".cms/config/storage.json");
    const entry = (await transport.listTree()).entries.find((e) => e.path === path);
    const raw = entry ? (await transport.readTexts([entry])).get(path) : undefined;
    const stored = raw ? (JSON.parse(raw) as { connectorId?: string; settings?: Record<string, unknown> }) : null;
    if (stored?.connectorId) hosting = { connectorId: stored.connectorId, settings: splitSecrets(stored.settings ?? {}).clean };
    // Same-provider git hosting publishes with the content token.
    if (hosting.connectorId === "git-pages" && hosting.settings.provider === git.provider && !opts.hostingCredential) {
      credentials.hosting = opts.dataCredential;
    }
  } else if (runtime.backend === "firebase") {
    // Sign in like the admin's login screen, then read the publish target
    // from Firestore (config/storage).
    if (opts.dataCredential) {
      if (parseAccount(opts.dataCredential).type !== "firebase") throw new CliError("usage", "--data-credential must be a firebase:<name> account.", undefined, 2);
      credentials.data = opts.dataCredential;
      const { email, password } = requireCredential(opts.dataCredential).values;
      const { resetRuntimeConfigCache } = await import("../../src/lib/runtimeConfig");
      window.__AGENTCMS_CONFIG__ = runtime;
      resetRuntimeConfigCache();
      const { signIn } = await import("../../src/services/auth");
      try {
        await signIn(email, password);
      } catch (err) {
        throw new CliError("firebase-login", `Firebase sign-in failed for ${email}: ${(err as { code?: string }).code ?? (err as Error).message}.`);
      }
      const { getStorageConfig } = await import("../../src/services/storageConfig");
      const stored = await getStorageConfig().catch(() => null);
      if (stored?.connectorId) hosting = { connectorId: stored.connectorId, settings: splitSecrets(stored.settings ?? {}).clean };
    }
  } else if (runtime.backend === "sqlite-file") {
    // Default: the database sits on the hosting itself.
    hosting = { connectorId: runtime.sqlite.connectorId, settings: { siteUrl, ...runtime.sqlite.settings } };
    if (opts.passphraseCredential) {
      parseAccount(opts.passphraseCredential);
      credentials.passphrase = opts.passphraseCredential;
    }
    // With the data location's credential (the hosting's one when the
    // database sits on the hosting), read the real publish target from the
    // database (it may be a separate private location).
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
        const storage = snapshot.config.get("storage") as { connectorId?: string; settings?: Record<string, unknown> } | undefined;
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
  const now = new Date().toISOString();
  return {
    alias: opts.alias,
    siteUrl,
    adminFolder,
    runtime,
    hosting,
    credentials,
    adminVersion: hosted.version ?? undefined,
    installedAt: now,
    updatedAt: now,
  };
}
