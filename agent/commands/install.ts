import { readFileSync } from "node:fs";
import { installBrowserEnv } from "../browserEnv";
import { CliError, printResult } from "../output";
import { adminUrlOf, secureAdminUrlOf } from "../remote";
import { getSite, lockSite, putSite } from "../sites";
import type { Command } from "./types";

function readPlan(source: string): unknown {
  const text = source === "-" ? readFileSync(0, "utf8") : readFileSync(source, "utf8");
  try {
    return JSON.parse(text);
  } catch (err) {
    throw new CliError("invalid-plan", `The plan is not valid JSON: ${(err as Error).message}`, undefined, 2);
  }
}

const SECRET_FIELDS: Record<string, string> = {
  s3: "access key + secret key",
};

// Markdown content in the repository GitHub/GitLab Pages publishes: its
// whole tree is served, drafts and users.json included.
function publicContentWarning(plan: { backend: string; runtime: unknown; target: { connectorId: string; settings: Record<string, unknown> } }): string[] {
  if (plan.backend !== "markdown-git" || plan.target.connectorId !== "git-pages") return [];
  const git = (plan.runtime as { git?: { provider?: string; owner?: string; repo?: string; project?: string } }).git ?? {};
  const t = plan.target.settings as { provider?: string; owner?: string; repo?: string; project?: string; dir?: string };
  const same = git.provider === t.provider && (git.provider === "gitlab" ? git.project === t.project : git.owner === t.owner && git.repo === t.repo);
  if (!same || (t.dir && t.dir !== "/" && t.dir !== "")) return [];
  return ["the content is in the repository the site is published from: its whole tree is public — drafts, unpublished pages and users.json (editors' emails) included. Use a separate private content repository, or a `docs` publish folder."];
}

export const installCommand: Command = {
  name: "install",
  summary:
    "Install a site from a JSON plan (see `options`): checks access, creates the content store, saves the publish target, uploads theme assets and the admin, registers the site. --dry-run only checks.",
  usage: "install --plan <file|-> [--dry-run] [--overwrite-target]",
  options: [
    { name: "plan", type: "string", description: "Plan file path, or - for stdin." },
    { name: "dry-run", type: "boolean", description: "Validate the plan and test access without writing anything." },
    { name: "overwrite-target", type: "boolean", description: "Replace the publish target already stored in existing content." },
  ],
  async run({ io, options }) {
    if (typeof options.plan !== "string") throw new CliError("usage", "install needs --plan <file|->.", "Run `agentcms options` for the format.", 2);
    installBrowserEnv();
    const { resolvePlan } = await import("../ops/plan");
    const plan = resolvePlan(readPlan(options.plan) as Parameters<typeof resolvePlan>[0]);
    if (getSite(plan.alias)) {
      throw new CliError("site-exists", `A site named "${plan.alias}" is already registered.`, "Use another alias, or `agentcms site forget` it first.");
    }
    const { checkPlan, runInstall } = await import("../ops/install");

    io.err("Checking access…");
    const checks = await checkPlan(plan);
    const stored = checks.data.storedTarget;
    const conflict =
      !!stored &&
      (stored.connectorId !== plan.target.connectorId ||
        String(stored.settings.siteUrl ?? "").replace(/\/+$/, "") !== plan.siteUrl);
    const summary = {
      alias: plan.alias,
      data: plan.backend,
      hosting: plan.hostingType,
      siteUrl: plan.siteUrl,
      adminUrl:
        secureAdminUrlOf({ siteUrl: plan.siteUrl, adminFolder: plan.adminFolder, hosting: plan.publicTarget }) ??
        adminUrlOf({ siteUrl: plan.siteUrl, adminFolder: plan.adminFolder }),
      credentials: plan.credentials,
      checks,
      warnings: publicContentWarning(plan),
    };
    if (!checks.hosting.ok || !checks.data.ok) {
      throw new CliError(
        "check-failed",
        [!checks.data.ok && `Data: ${checks.data.detail}`, !checks.hosting.ok && `Hosting: ${checks.hosting.detail}`].filter(Boolean).join(" — "),
        "Fix the access (token permissions, repo / bucket names, URL) and retry.",
      );
    }
    if (conflict && !options["overwrite-target"]) {
      throw new CliError(
        "content-exists",
        `This content is already set up to publish to ${stored!.connectorId} (${String(stored!.settings.siteUrl ?? "?")}).`,
        "Ask the user: keep that site (register it with `agentcms site add`) or pass --overwrite-target to publish elsewhere.",
      );
    }
    if (options["dry-run"]) {
      printResult(io, { ...summary, dryRun: true, existingContent: checks.data.existing }, () =>
        `Plan OK for ${plan.alias}: ${plan.backend} → ${plan.hostingType} (${plan.siteUrl}). Nothing was written.`,
      );
      return;
    }

    const unlock = lockSite(plan.alias);
    try {
      const outcome = await runInstall(plan, (label) => io.err(`• ${label}`));
      const now = new Date().toISOString();
      putSite({
        alias: plan.alias,
        siteUrl: plan.siteUrl,
        adminFolder: plan.adminFolder,
        runtime: plan.runtime,
        hosting: plan.publicTarget,
        credentials: plan.credentials,
        adminVersion: outcome.adminVersion ?? undefined,
        installedAt: now,
        updatedAt: now,
      });

      const nextSteps: string[] = [];
      if (summary.adminUrl) nextSteps.push(`Open the admin: ${summary.adminUrl}`);
      else nextSteps.push("The admin was not copied to the hosting: run `agentcms serve` to use it locally.");
      if (plan.backend === "markdown-git") {
        nextSteps.push("Each browser asks once for the editor's own git token (Contents read/write on the content repository).");
      } else if (plan.backend === "firebase") {
        nextSteps.push("Editors sign in to the admin with their Firebase email + password (create their accounts in the Firebase console → Authentication).");
      } else {
        nextSteps.push(
          `Each new browser asks once for the ${plan.dataLocation && plan.dataLocation !== plan.target ? "data location" : "hosting"} keys${plan.passphraseAccount ? " and the database passphrase" : ""} (they stay in that browser). No login: protect the admin folder at the hosting level.`,
        );
        if (plan.passphraseAccount) {
          nextSteps.push(
            `The database is encrypted. Have the user save its passphrase in a password manager now: \`agentcms credentials copy ${plan.passphraseAccount}\` puts it on the clipboard. Without it the content can't be opened.`,
          );
        } else if (!plan.dataLocation || plan.dataLocation === plan.target) {
          nextSteps.push("Warning: the database is NOT encrypted and is served by the public site — anyone who guesses its path can download it.");
        } else if (plan.dataLocation.connectorId === "git-pages") {
          nextSteps.push("Warning: the database is NOT encrypted — anyone who can read the repository (public repos: everyone) can download it.");
        }
      }
      if (plan.backend === "markdown-git" && SECRET_FIELDS[plan.target.connectorId]) {
        nextSteps.push(`Publishing from a browser needs the hosting ${SECRET_FIELDS[plan.target.connectorId]} once: admin → Settings → Publish target.`);
      }
      if (plan.target.connectorId === "git-pages") nextSteps.push("Pages hosts take about a minute to serve new commits.");
      if (!checks.data.existing) {
        nextSteps.push(
          `New sites start as "My site", in English, with the default theme and every plugin on (including agentcms-multilang): set the title, description and language (\`agentcms settings set --site ${plan.alias} --title … --language …\`), pick a theme, disable agentcms-multilang for a one-language site, and give the author a public name (\`agentcms users update me --site ${plan.alias} --first-name … --last-name …\`).`,
        );
      }
      for (const w of summary.warnings) nextSteps.push(`Warning: ${w}`);
      nextSteps.push(`Check everything with \`agentcms doctor --site ${plan.alias}\`.`);

      printResult(io, { ...summary, installed: true, files: outcome.files, adminVersion: outcome.adminVersion, notices: outcome.notices, nextSteps }, () =>
        [`Installed ${plan.alias}.`, ...outcome.notices.map((n) => `${n.level}: ${n.message}`), ...nextSteps.map((s) => `- ${s}`)].join("\n"),
      );
    } finally {
      unlock();
    }
  },
};
