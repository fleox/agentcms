import { installBrowserEnv } from "../browserEnv";
import { requireCredential } from "../credentials";
import { CliError, printResult } from "../output";
import { lockSite, resolveSite } from "../sites";
import type { Command } from "./types";

// A SQLite database kept in git is fully rewritten on every save, and an
// encrypted file doesn't delta-compress: the data branch grows by the
// whole database each time. Compaction replaces the branch with ONE
// commit holding the current file (old encrypted versions are useless).

export const compactDataCommand: Command = {
  name: "compact-data",
  summary:
    "Shrink the git history of a SQLite site's data branch (e.g. agentcms-data) to one commit with the current database. GitHub only. Prints the plan unless --yes.",
  usage: "compact-data [--site <alias>] [--yes]",
  options: [
    { name: "site", type: "string", description: "Site alias." },
    { name: "yes", type: "boolean", description: "Apply — only after the user confirmed." },
  ],
  async run({ io, options }) {
    const site = resolveSite(options.site as string | undefined);
    const runtime = site.runtime;
    if (runtime.backend !== "sqlite-file" || runtime.sqlite.connectorId !== "git-pages") {
      throw new CliError("not-applicable", `${site.alias} doesn't keep a SQLite database in git — nothing to compact.`);
    }
    const s = runtime.sqlite.settings as { provider?: string; owner?: string; repo?: string; branch?: string; apiBaseUrl?: string; dir?: string };
    if (s.provider !== "github") throw new CliError("unsupported", "Compaction is only implemented for GitHub repositories.");
    const account = site.credentials.data ?? site.credentials.hosting;
    if (!account) throw new CliError("credential-required", `No credential recorded for the data of ${site.alias}.`);
    const token = requireCredential(account).values.token;

    installBrowserEnv();
    const { createRemoteGitTransport, joinRepoPath } = await import("../../src/services/git");
    const transport = createRemoteGitTransport({
      provider: "github",
      owner: s.owner ?? "",
      repo: s.repo ?? "",
      branch: s.branch ?? "",
      token,
      apiBaseUrl: s.apiBaseUrl,
    });
    const tree = await transport.listTree();
    if (!tree.headSha) throw new CliError("empty", "The data branch doesn't exist yet.");
    const dbPath = joinRepoPath(s.dir ?? "", runtime.sqlite.path);
    // Never compact a branch that holds anything else (e.g. the site).
    const foreign = tree.entries.filter((e) => e.path !== dbPath && e.path !== ".gitkeep");
    if (foreign.length) {
      throw new CliError(
        "shared-branch",
        `Branch ${s.branch} also holds ${foreign.length} other file(s) (${foreign.slice(0, 3).map((e) => e.path).join(", ")}…) — compaction would drop their history too.`,
        "Only a dedicated data branch can be compacted.",
      );
    }

    // Commit count through the API's pagination (per_page=1 → last page = count).
    const api = (s.apiBaseUrl || "https://api.github.com").replace(/\/+$/, "");
    const res = await fetch(`${api}/repos/${s.owner}/${s.repo}/commits?sha=${encodeURIComponent(s.branch ?? "")}&per_page=1`, {
      headers: { Authorization: `Bearer ${token}`, Accept: "application/vnd.github+json" },
    });
    const last = /[?&]page=(\d+)>; rel="last"/.exec(res.headers.get("link") ?? "");
    const commits = res.ok ? (last ? Number(last[1]) : 1) : null;
    const size = tree.entries.find((e) => e.path === dbPath)?.size ?? null;
    const plan = { site: site.alias, repo: `${s.owner}/${s.repo}`, branch: s.branch, commits, databaseBytes: size, files: tree.entries.map((e) => e.path) };

    if (!options.yes) {
      printResult(io, { needsConfirmation: true, ...plan }, () =>
        `${site.alias}: ${plan.repo}@${plan.branch} has ${commits ?? "?"} commit(s); compaction keeps 1 (database ${size ?? "?"} bytes). Nothing was changed. Re-run with --yes once the user agrees.`,
      );
      return;
    }
    if (commits !== null && commits <= 1) {
      printResult(io, { ...plan, compacted: false }, () => "Already a single commit.");
      return;
    }
    const unlock = lockSite(site.alias);
    try {
      const files = [];
      for (const entry of tree.entries) {
        files.push({ path: entry.path, content: Buffer.from(await transport.readBytes(entry)).toString("base64"), encoding: "base64" as const });
      }
      await transport.resetBranch!(files, { message: "Compact data history — AgentCMS", expectedHeadSha: tree.headSha });
      printResult(io, { ...plan, compacted: true }, () => `${site.alias}: ${plan.branch} compacted from ${commits ?? "?"} commits to 1.`);
    } finally {
      unlock();
    }
  },
};
