import type { FlexwegRuntimeConfig } from "../../src/lib/runtimeConfig";
import { splitSecrets } from "../../src/services/docstore/markdownLayout";
import { createRemoteGitTransport, joinRepoPath } from "../../src/services/git";
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
}): Promise<SiteRecord> {
  let admin: URL;
  try {
    admin = new URL(opts.adminUrl.endsWith("/") ? opts.adminUrl : opts.adminUrl.replace(/\/index\.html$/, "") + "/");
  } catch {
    throw new CliError("usage", `Invalid admin URL: ${opts.adminUrl}`, undefined, 2);
  }
  const cfg = await fetchText(new URL("config.js", admin).href);
  if (!cfg.ok) throw new CliError("config-missing", `Could not read ${admin.href}config.js (${cfg.error ?? `HTTP ${cfg.status}`}).`);
  const runtime = parseConfigJs(cfg.text) as FlexwegRuntimeConfig | null;
  if (!runtime || typeof runtime.backend !== "string") {
    throw new CliError("not-installed", "That admin has no configuration yet (config.js is empty).", "Install it first (`agentcms install` or the setup wizard).");
  }

  const siteUrl = (opts.siteUrl ?? new URL("..", admin).href).replace(/\/+$/, "");
  if (!admin.href.startsWith(siteUrl + "/")) throw new CliError("usage", `The admin URL is not under the site URL ${siteUrl}.`, "Pass --site-url.", 2);
  const adminFolder = decodeURIComponent(admin.href.slice(siteUrl.length + 1)).replace(/\/+$/, "");

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
  } else if (runtime.backend === "sqlite-file") {
    hosting = { connectorId: runtime.sqlite.connectorId, settings: { ...runtime.sqlite.settings, siteUrl } };
  }
  if (opts.hostingCredential) {
    parseAccount(opts.hostingCredential);
    credentials.hosting = opts.hostingCredential;
  }

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
