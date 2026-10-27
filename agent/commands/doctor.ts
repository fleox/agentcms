import { getCredential } from "../credentials";
import { printResult } from "../output";
import { readVersionInfo } from "../paths";
import { adminUrlOf, secureAdminUrlOf, fetchHostedAdmin, fetchText, findSecretKeys, parseConfigJs } from "../remote";
import { compareVersions } from "../semver";
import { resolveSite, type SiteRecord } from "../sites";
import { installBrowserEnv } from "../browserEnv";
import type { Command } from "./types";

// Health check of one site, from the outside (what visitors and the
// browser admin get) plus the credentials this computer holds. Every
// failing check carries a `fix` the agent can propose.

export interface Check {
  id: string;
  status: "ok" | "warn" | "fail" | "skip";
  message: string;
  fix?: string;
}

export async function runDoctor(site: SiteRecord, opts: { deep?: boolean; fetchImpl?: typeof fetch } = {}): Promise<Check[]> {
  const f = opts.fetchImpl ?? fetch;
  const checks: Check[] = [];
  const add = (c: Check) => checks.push(c);
  const info = readVersionInfo();
  const siteUrl = site.siteUrl.replace(/\/+$/, "");

  const secureAdmin = secureAdminUrlOf(site);
  add(
    secureAdmin && !siteUrl.startsWith("https://")
      ? { id: "https", status: "ok", message: `The public site is plain HTTP; open the admin over HTTPS: ${secureAdmin}` }
      : siteUrl.startsWith("https://") || /^http:\/\/(localhost|127\.0\.0\.1|\[::1\])(:\d+)?(\/|$)/.test(siteUrl)
      ? { id: "https", status: "ok", message: siteUrl.startsWith("https://") ? "Site served over HTTPS." : "Local site (a secure context for browsers)." }
      : {
          id: "https",
          status: "warn",
          message: `${siteUrl} is plain HTTP.`,
          fix: "Use the host's HTTPS URL (S3: the bucket's https endpoint) — the admin can't sign requests on http pages.",
        },
  );

  const pagesHost = site.hosting?.connectorId === "git-pages";
  const home = await fetchText(`${siteUrl}/`, f);
  add(
    home.ok
      ? /\/theme-assets\//.test(home.text ?? "")
        ? { id: "site", status: "ok", message: `Home page reachable (${home.status}).` }
        : {
            id: "site",
            status: "warn",
            message: "The home page answers but isn't an AgentCMS page (no theme stylesheet): another site's page, a README, or a host that hasn't served the new files yet.",
            fix: `${pagesHost ? "Pages hosts take a minute or two after a commit: wait, then re-run doctor. " : ""}Otherwise publish something or run \`agentcms regenerate everything --site ${site.alias}\`.`,
          }
      : home.status === 404
        ? { id: "site", status: "warn", message: "No home page yet (404).", fix: "Publish a post or run Regenerate → Everything in the admin." }
        : { id: "site", status: "fail", message: `Site not reachable: ${home.error ?? `HTTP ${home.status}`}.`, fix: "Check siteUrl, DNS, and that the host serves the bucket / repo (GitHub Pages enabled, S3 website hosting on)." },
  );

  const css = await fetchText(`${siteUrl}/theme-assets/default.css`, f);
  add(
    css.ok && css.contentType.includes("text/css")
      ? { id: "theme-assets", status: "ok", message: "Theme stylesheet served as text/css." }
      : {
          id: "theme-assets",
          status: "fail",
          message: css.ok ? `theme-assets/default.css has type "${css.contentType}".` : `theme-assets/default.css missing (${css.error ?? css.status}).`,
          fix: `${pagesHost && !css.ok ? "Just installed or deployed? Pages hosts take a minute or two after a commit: wait, then re-run doctor. If it persists: " : ""}\`agentcms deploy-admin --site ${site.alias} --theme-assets --yes\` (after confirming with the user), or Themes → Sync theme assets in the admin.`,
        },
  );

  const adminUrl = adminUrlOf(site);
  if (!adminUrl) {
    add({ id: "admin", status: "skip", message: "Admin not hosted on this site." });
  } else {
    const index = await fetchText(adminUrl, f);
    if (!index.ok || !index.contentType.includes("text/html")) {
      add({
        id: "admin",
        status: "fail",
        message: `Admin page ${adminUrl} not served (${index.error ?? `HTTP ${index.status}`}${index.ok ? `, type ${index.contentType}` : ""}).`,
        fix: `\`agentcms deploy-admin --site ${site.alias}\`; on GitHub Pages wait a minute after a commit.`,
      });
    } else {
      add({ id: "admin", status: "ok", message: `Admin page served at ${adminUrl}.` });
      const hosted = await fetchHostedAdmin(adminUrl, f);
      const refs = [...index.text.matchAll(/(?:src|href)="\.\/([^"?#]+)"/g)].map((m) => m[1]);
      const missing = refs.filter((r) => r !== "config.js" && !hosted.files.includes(r));
      const script = refs.find((r) => r.startsWith("assets/") && r.endsWith(".js"));
      const bundle = script ? await fetchText(`${adminUrl}${script}`, f) : null;
      if (!hosted.version || missing.length || (bundle && (!bundle.ok || !/javascript/.test(bundle.contentType)))) {
        add({
          id: "admin-files",
          status: "fail",
          message: !hosted.version
            ? "admin-files.json missing — the admin was copied by hand or is incomplete."
            : missing.length
              ? `index.html references files of another build: ${missing.join(", ")}.`
              : `Admin bundle ${script} ${bundle!.ok ? `served as "${bundle!.contentType}" (must be JavaScript)` : `missing (${bundle!.status})`}.`,
          fix: `\`agentcms deploy-admin --site ${site.alias}\` re-uploads a consistent build with the right content types.`,
        });
      } else {
        add({ id: "admin-files", status: "ok", message: `Admin ${hosted.version}: files consistent, bundle served as JavaScript.` });
        add(
          compareVersions(hosted.version, info.version) >= 0
            ? { id: "admin-version", status: "ok", message: `Admin ${hosted.version} is up to date.` }
            : { id: "admin-version", status: "warn", message: `Admin ${hosted.version} is older than ${info.version}.`, fix: `Offer \`agentcms deploy-admin --site ${site.alias}\`.` },
        );
      }
      const cfg = await fetchText(`${adminUrl}config.js`, f);
      try {
        if (!cfg.ok) throw new Error(cfg.error ?? `HTTP ${cfg.status}`);
        const runtime = parseConfigJs(cfg.text);
        const secrets = findSecretKeys(runtime);
        if (secrets.length) {
          add({ id: "config-js", status: "fail", message: `config.js publishes secrets: ${secrets.join(", ")}.`, fix: "Revoke those keys now, then redeploy the admin (config.js is regenerated without secrets)." });
        } else if (!runtime || runtime.backend !== site.runtime.backend) {
          add({ id: "config-js", status: "fail", message: `config.js backend is ${String(runtime?.backend ?? "empty")}, expected ${site.runtime.backend}.`, fix: `\`agentcms deploy-admin --site ${site.alias}\`.` });
        } else {
          add({ id: "config-js", status: "ok", message: `config.js: ${site.runtime.backend}, no secrets.` });
        }
      } catch (err) {
        add({ id: "config-js", status: "fail", message: `config.js unreadable: ${(err as Error).message}.`, fix: `\`agentcms deploy-admin --site ${site.alias}\`.` });
      }
    }
  }

  // A SQLite database on a public host must not be readable.
  if (site.runtime.backend === "sqlite-file") {
    const path = site.runtime.sqlite.path;
    const db = await fetchText(`${siteUrl}/${path}`, f);
    if (!db.ok) add({ id: "database-exposure", status: "ok", message: `Database not served by the public site (${db.status || db.error}).` });
    else if (db.text.startsWith("ACMSENC1")) add({ id: "database-exposure", status: "ok", message: "Database served publicly but encrypted." });
    else
      add({
        id: "database-exposure",
        status: "fail",
        message: `Anyone can download the unencrypted database at ${siteUrl}/${path} (drafts, settings).`,
        fix: "Turn on encryption (reinstall with data.encryption, or store the database in a separate private location) and block the path at the host if possible.",
      });
  }

  // Credentials held by this computer.
  for (const [role, account] of Object.entries(site.credentials)) {
    if (!account) continue;
    add(
      getCredential(account)
        ? { id: `credential-${role}`, status: "ok", message: `${role} credential ${account} stored.` }
        : { id: `credential-${role}`, status: "warn", message: `${role} credential ${account} is not stored on this computer.`, fix: `Ask the user to run \`agentcms credentials set ${account}\`.` },
    );
  }

  // GitHub Pages switched on?
  const s = site.hosting.settings;
  const hostingCred = site.credentials.hosting ? getCredential(site.credentials.hosting) : null;
  if (site.hosting.connectorId === "git-pages" && s.provider === "github" && (s.host ?? "github-pages") === "github-pages" && hostingCred) {
    const api = String(s.apiBaseUrl || "https://api.github.com").replace(/\/+$/, "");
    try {
      const res = await f(`${api}/repos/${s.owner}/${s.repo}/pages`, {
        headers: { Authorization: `Bearer ${hostingCred.values.token}`, Accept: "application/vnd.github+json" },
        signal: AbortSignal.timeout(15000),
      });
      if (res.ok) add({ id: "github-pages", status: "ok", message: `GitHub Pages enabled for ${s.owner}/${s.repo}.` });
      else if (res.status === 404)
        add({
          id: "github-pages",
          status: "fail",
          message: `GitHub Pages is not enabled for ${s.owner}/${s.repo}.`,
          fix: `https://github.com/${s.owner}/${s.repo}/settings/pages → Source: Deploy from a branch → ${String(s.branch ?? "main")} / root. (Free plans need a public repo.)`,
        });
      else add({ id: "github-pages", status: "warn", message: `Could not read the Pages settings (HTTP ${res.status}) — the token may lack the Pages permission.` });
    } catch (err) {
      add({ id: "github-pages", status: "warn", message: `Could not reach the GitHub API: ${(err as Error).message}.` });
    }
  }

  if (opts.deep) {
    if (!hostingCred) {
      add({ id: "hosting-access", status: "skip", message: "No hosting credential to test." });
    } else {
      installBrowserEnv();
      const { testStorageConnection } = await import("../../src/services/storage/testConnection");
      const res = await testStorageConnection(site.hosting.connectorId, { ...site.hosting.settings, ...hostingCred.values });
      add(
        res.ok
          ? { id: "hosting-access", status: "ok", message: `Hosting writable: ${res.detail}.` }
          : { id: "hosting-access", status: "fail", message: `Hosting access failed: ${res.detail}.`, fix: "Check the credential's permissions / expiry, then `agentcms credentials set` it again." },
      );
    }
  }
  return checks;
}

export const doctorCommand: Command = {
  name: "doctor",
  summary:
    "Health check of a site: HTTPS, home page, theme assets, hosted admin (consistent build, JavaScript content type, version), config.js without secrets, stored credentials, GitHub Pages. --deep also tests write access.",
  usage: "doctor [--site <alias>] [--deep]",
  options: [
    { name: "site", type: "string", description: "Site alias." },
    { name: "deep", type: "boolean", description: "Also test write access to the hosting (writes and deletes a probe file on file hosts)." },
  ],
  async run({ io, options }) {
    const site = resolveSite(options.site as string | undefined);
    const checks = await runDoctor(site, { deep: !!options.deep });
    const failed = checks.filter((c) => c.status === "fail").length;
    const warned = checks.filter((c) => c.status === "warn").length;
    printResult(io, { site: site.alias, healthy: failed === 0, failed, warned, checks }, () =>
      [
        `${site.alias} — ${failed ? `${failed} problem(s)` : "healthy"}${warned ? `, ${warned} warning(s)` : ""}`,
        ...checks.map((c) => `  [${c.status}] ${c.id}: ${c.message}${c.fix ? `\n         fix: ${c.fix}` : ""}`),
      ].join("\n"),
    );
    if (failed) return 1;
  },
};
