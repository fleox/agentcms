import { printResult } from "../output";
import { readVersionInfo } from "../paths";
import { adminUrlOf, changesBetween, fetchHostedAdmin, readChangelog } from "../remote";
import { compareVersions } from "../semver";
import { listSites, putSite, resolveSite, type SiteRecord } from "../sites";
import type { Command } from "./types";
import { fetchLatestVersion } from "./version";

// The "is anything out of date?" overview agents run first: this tool +
// skills (same release) vs npm, and every hosted admin vs this release.

export interface SiteStatus {
  alias: string;
  siteUrl: string;
  adminUrl: string | null;
  adminVersion: string | null;
  error?: string;
  // "current" | "update" (deploy-admin proposed) | "newer" (hosted admin is
  // newer than this tool — update the tool/skills first) | "not-hosted" | "unreachable"
  state: "current" | "update" | "newer" | "not-hosted" | "unreachable";
  update?: ReturnType<typeof changesBetween>;
  blockedByDataSchema?: boolean;
}

export async function siteStatus(site: SiteRecord, version: string, dataSchema: number): Promise<SiteStatus> {
  const adminUrl = adminUrlOf(site);
  const base = { alias: site.alias, siteUrl: site.siteUrl, adminUrl };
  if (!adminUrl) return { ...base, adminVersion: null, state: "not-hosted" };
  const hosted = await fetchHostedAdmin(adminUrl);
  if (!hosted.version) return { ...base, adminVersion: null, state: "unreachable", error: hosted.error };
  if (hosted.version !== site.adminVersion) putSite({ ...site, adminVersion: hosted.version });
  const cmp = compareVersions(hosted.version, version);
  if (cmp === 0) return { ...base, adminVersion: hosted.version, state: "current" };
  if (cmp > 0) return { ...base, adminVersion: hosted.version, state: "newer" };
  return {
    ...base,
    adminVersion: hosted.version,
    state: "update",
    update: changesBetween(readChangelog(), hosted.version, version),
    blockedByDataSchema: hosted.dataSchema !== null && hosted.dataSchema > dataSchema,
  };
}

export const statusCommand: Command = {
  name: "status",
  summary:
    "Versions overview — run it first. Compares this tool and its skills with the latest release, and every registered site's hosted admin with this release (what changed, what to run).",
  usage: "status [--site <alias>]",
  options: [{ name: "site", type: "string", description: "Only this site (default: every registered site)." }],
  async run({ io, options }) {
    const info = readVersionInfo();
    const sites = typeof options.site === "string" ? [resolveSite(options.site)] : listSites().sites;
    const [latest, statuses] = await Promise.all([
      fetchLatestVersion(),
      Promise.all(sites.map((s) => siteStatus(s, info.version, info.dataSchema))),
    ]);
    const toolUpdate = latest && compareVersions(latest, info.version) > 0 ? changesBetween(readChangelog(), info.version, latest) : null;
    // Release notes once (not repeated per site): version → changes, for
    // every version some site would get with deploy-admin.
    const releaseNotes: Record<string, string[]> = {};
    for (const s of statuses) {
      if (!s.update) continue;
      for (const line of s.update.changes) {
        const [v, ...rest] = line.split(": ");
        (releaseNotes[v] ??= []).includes(rest.join(": ")) || releaseNotes[v].push(rest.join(": "));
      }
    }
    const sitesOut = statuses.map((s) => (s.update ? { ...s, update: { versions: s.update.versions, breaking: s.update.breaking, actions: s.update.actions } } : s));
    const data = {
      tool: { version: info.version, latest, updateAvailable: latest ? compareVersions(latest, info.version) > 0 : null },
      // Release notes of the newer tool are only known once it's installed;
      // `changes` is filled when this package already ships them.
      toolUpdate,
      sites: sitesOut,
      releaseNotes,
      advice: [
        ...(latest && compareVersions(latest, info.version) > 0
          ? [`agentcms ${latest} is available (this is ${info.version}): offer to update the skills first (Claude Code: /plugin marketplace update agentcms, then /reload-plugins).`]
          : []),
        ...statuses.filter((s) => s.state === "update").map((s) =>
          s.blockedByDataSchema
            ? `${s.alias}: hosted admin ${s.adminVersion} stores data in a newer format than this tool — update the tool, never downgrade.`
            : `${s.alias}: admin ${s.adminVersion} → ${info.version} available${s.update?.breaking ? " (BREAKING — read the changes)" : ""}: offer \`agentcms deploy-admin --site ${s.alias}\`.`,
        ),
        ...statuses.filter((s) => s.state === "newer").map((s) => `${s.alias}: hosted admin ${s.adminVersion} is newer than this tool — update the tool before deploying.`),
        ...statuses.filter((s) => s.state === "unreachable").map((s) => `${s.alias}: admin not reachable (${s.error}) — run \`agentcms doctor --site ${s.alias}\`.`),
      ],
    };
    printResult(io, data, () =>
      [
        `agentcms ${info.version}${data.tool.updateAvailable ? ` — ${latest} available` : latest ? " (latest)" : ""}`,
        ...statuses.map((s) => `  ${s.alias.padEnd(20)} admin ${s.adminVersion ?? "-"}  ${s.state}${s.error ? ` (${s.error})` : ""}`),
        ...(data.advice.length ? ["", ...data.advice.map((a) => `- ${a}`)] : []),
      ].join("\n"),
    );
  },
};
