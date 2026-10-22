import { createRemoteGitTransport } from "../git";
import { resolveGitPagesToken, type GitPagesSettings } from "../storage/connectors/gitPages";
import type { PublishTarget } from "../storage/target";

// Where a SQLite database goes by default. On a git host (GitHub /
// GitLab / Cloudflare Pages…) it lives in the SAME repository but on a
// dedicated branch that is never published: saving content doesn't
// rebuild the site and the file isn't served by it (it stays encrypted
// in a public repo). Other hosts keep it next to the site.

export const SQLITE_DATA_BRANCH = "agentcms-data";

export function defaultSqliteLocation(target: PublishTarget): PublishTarget {
  if (target.connectorId !== "git-pages") return target;
  const settings = Object.fromEntries(Object.entries(target.settings).filter(([k]) => k !== "siteUrl" && k !== "dir"));
  // host "other": no .nojekyll / CI file / Pages switch on the data branch.
  return { connectorId: "git-pages", settings: { ...settings, host: "other", dir: "", branch: SQLITE_DATA_BRANCH } };
}

// The first commit to an EMPTY repository makes its branch the default
// one. Create the published branch first, so the data branch never
// becomes the repository's default branch.
export async function ensurePublishBranch(target: PublishTarget): Promise<void> {
  if (target.connectorId !== "git-pages") return;
  const s = target.settings as unknown as GitPagesSettings;
  const token = resolveGitPagesToken(s);
  const transport = createRemoteGitTransport(
    s.provider === "gitlab"
      ? { provider: "gitlab", project: s.project ?? "", branch: s.branch, token, apiBaseUrl: s.apiBaseUrl }
      : { provider: "github", owner: s.owner ?? "", repo: s.repo ?? "", branch: s.branch, token, apiBaseUrl: s.apiBaseUrl },
  );
  if (await transport.headSha()) return;
  await transport.commit([{ type: "put", path: ".gitkeep", content: "" }], { message: "Initialize site — AgentCMS" });
}
