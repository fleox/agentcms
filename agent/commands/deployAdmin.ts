import { installBrowserEnv } from "../browserEnv";
import { requireCredential } from "../credentials";
import { CliError, printResult } from "../output";
import { readVersionInfo } from "../paths";
import { adminUrlOf, changesBetween, fetchHostedAdmin, readChangelog } from "../remote";
import { compareVersions } from "../semver";
import { listSites, lockSite, putSite, resolveSite, type SiteRecord } from "../sites";
import type { Command } from "./types";

// Updates the hosted admin to this release. Without --yes it only prints
// what would happen (for the agent to confirm with the user), then the
// same command with --yes applies it — one commit per site on git hosts.

interface DeployPlan {
  alias: string;
  adminUrl: string;
  from: string | null;
  to: string;
  files: number;
  themeAssets: boolean;
  changes: ReturnType<typeof changesBetween> | null;
  refused?: string;
}

type DeployResult =
  | { alias: string; deployed: false; reason: string }
  | { alias: string; deployed: true; from: string | null; to: string; files: number; pendingActions: string[]; notices: { level: string; message: string }[] };

export const deployAdminCommand: Command = {
  name: "deploy-admin",
  summary:
    "Update a site's hosted admin (and optionally its theme assets) to this release. Prints the plan unless --yes is given; refuses downgrades below the stored data format.",
  usage: "deploy-admin [--site <alias> | --all] [--theme-assets] [--yes] [--allow-downgrade]",
  options: [
    { name: "site", type: "string", description: "Site alias." },
    { name: "all", type: "boolean", description: "Every registered site with a hosted admin (each listed separately)." },
    { name: "theme-assets", type: "boolean", description: "Also upload theme CSS / loaders (changelog action sync-theme-assets)." },
    { name: "yes", type: "boolean", description: "Apply — only after the user confirmed the plan." },
    { name: "allow-downgrade", type: "boolean", description: "Allow installing an older admin than the hosted one." },
  ],
  async run({ io, options }) {
    const info = readVersionInfo();
    const sites: SiteRecord[] = options.all ? listSites().sites.filter((s) => s.adminFolder) : [resolveSite(options.site as string | undefined)];
    if (sites.length === 0) throw new CliError("no-sites", "No registered site has a hosted admin.");
    installBrowserEnv();
    const { adminOps, applyOps, hostingConnector, themeAssetOps } = await import("../ops/hosting");
    const { collectToasts, settleHosting } = await import("../ops/install");

    const plans: DeployPlan[] = [];
    for (const site of sites) {
      const adminUrl = adminUrlOf(site);
      if (!adminUrl) throw new CliError("not-hosted", `${site.alias} has no hosted admin.`);
      if (!site.hosting.connectorId) throw new CliError("hosting-unknown", `The hosting of ${site.alias} is unknown.`, "Re-register it with `agentcms site add … --hosting-credential`.");
      if (!site.credentials.hosting) throw new CliError("credential-required", `No hosting credential recorded for ${site.alias}.`, "Re-register the site with --hosting-credential.");
      const hosted = await fetchHostedAdmin(adminUrl);
      const plan: DeployPlan = {
        alias: site.alias,
        adminUrl,
        from: hosted.version,
        to: info.version,
        files: adminOps(site.adminFolder!, site.runtime).ops.length + (options["theme-assets"] ? themeAssetOps().length : 0),
        themeAssets: !!options["theme-assets"],
        changes: hosted.version ? changesBetween(readChangelog(), hosted.version, info.version) : null,
      };
      if (hosted.dataSchema !== null && hosted.dataSchema > info.dataSchema) {
        plan.refused = `the hosted admin stores data format ${hosted.dataSchema}, this release only knows ${info.dataSchema} — update agentcms instead`;
      } else if (hosted.version && compareVersions(hosted.version, info.version) > 0 && !options["allow-downgrade"]) {
        plan.refused = `the hosted admin (${hosted.version}) is newer than this release — update agentcms, or pass --allow-downgrade`;
      }
      plans.push(plan);
    }

    if (!options.yes) {
      printResult(io, { needsConfirmation: true, plans }, () =>
        [
          ...plans.map((p) =>
            p.refused
              ? `${p.alias}: refused — ${p.refused}`
              : `${p.alias}: admin ${p.from ?? "(none)"} → ${p.to}, ${p.files} files${p.changes?.breaking ? " — BREAKING changes" : ""}`,
          ),
          "Nothing was changed. Re-run with --yes once the user agrees.",
        ].join("\n"),
      );
      return;
    }

    const results: DeployResult[] = [];
    for (const [i, site] of sites.entries()) {
      const plan = plans[i];
      if (plan.refused) {
        results.push({ alias: site.alias, deployed: false, reason: plan.refused });
        continue;
      }
      const unlock = lockSite(site.alias);
      const toasts = collectToasts();
      try {
        const cred = requireCredential(site.credentials.hosting!);
        const target = { connectorId: site.hosting.connectorId, settings: { ...site.hosting.settings, ...cred.values } };
        const { ops } = adminOps(site.adminFolder!, site.runtime);
        if (options["theme-assets"]) ops.unshift(...themeAssetOps());
        io.err(`• ${site.alias}: uploading ${ops.length} files…`);
        await applyOps(hostingConnector(target), ops);
        await settleHosting(target);
        putSite({ ...site, adminVersion: info.version });
        const pending = (plan.changes?.actions ?? []).filter((a) => a !== "deploy-admin" && !(a === "sync-theme-assets" && plan.themeAssets));
        results.push({ alias: site.alias, deployed: true, from: plan.from, to: info.version, files: ops.length, pendingActions: pending, notices: toasts.notices });
      } catch (err) {
        results.push({ alias: site.alias, deployed: false, reason: (err as Error).message });
      } finally {
        toasts.stop();
        unlock();
      }
    }
    printResult(io, { results }, () =>
      results
        .map((r) => (r.deployed ? `${r.alias}: admin ${r.from ?? "(none)"} → ${r.to}` : `${r.alias}: not deployed — ${r.reason}`))
        .join("\n"),
    );
    if (results.some((r) => !r.deployed)) return 1;
  },
};
