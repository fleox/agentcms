import type { DocStore } from "../../src/services/docstore/types";
import { requireCredential } from "../credentials";
import { CliError } from "../output";
import type { SiteRecord } from "../sites";

// Opens a registered site's content store (Markdown in git or SQLite
// file) with the credentials recorded for it — the same store the
// admin uses in the browser. Firebase content is only reachable from
// the admin (no CLI login).

export async function openSiteStore(site: SiteRecord): Promise<DocStore> {
  const runtime = site.runtime;
  if (runtime.backend === "firebase") {
    throw new CliError("unsupported-backend", `${site.alias} keeps its content in Firebase, which the CLI can't open.`, "Use the admin instead (Plugins / Themes → Install, then upload the ZIP).");
  }
  if (runtime.backend === "local") {
    throw new CliError("unsupported-backend", `${site.alias} keeps its content in one browser (local mode).`, "Use the admin in that browser.");
  }
  // A SQLite file kept on the hosting itself (the default) has no data
  // credential of its own: the hosting one opens it (as in compact-data).
  const account = site.credentials.data ?? (runtime.backend === "sqlite-file" ? site.credentials.hosting : null);
  if (!account) {
    throw new CliError("credential-required", `No data credential recorded for ${site.alias}.`, "Re-register it: `agentcms site add <alias> --admin-url <url> --data-credential <account>`.");
  }
  const { resetRuntimeConfigCache } = await import("../../src/lib/runtimeConfig");
  const { getDocStore, resetDocStore, setDocStoreForTests } = await import("../../src/services/docstore");
  const { invalidateActiveStorageConnector } = await import("../../src/services/storage/registry");
  const values = requireCredential(account).values;
  setDocStoreForTests(null);
  if (runtime.backend === "markdown-git") {
    const { setGitToken } = await import("../../src/services/docstore/gitStore");
    if (runtime.git.provider === "local") throw new CliError("unsupported", "Local-folder git content can't be managed from the CLI.");
    setGitToken(runtime.git, values.token ?? null);
  } else {
    const { saveSqliteConnectorSecrets, saveSqlitePassphrase } = await import("../../src/services/docstore/sqliteFileStore");
    const { loadSqlWasm } = await import("./hosting");
    loadSqlWasm();
    saveSqliteConnectorSecrets(values);
    if (site.credentials.passphrase) saveSqlitePassphrase(requireCredential(site.credentials.passphrase).values.passphrase);
  }
  window.__AGENTCMS_CONFIG__ = runtime;
  resetRuntimeConfigCache();
  resetDocStore();
  invalidateActiveStorageConnector();
  // A preview / check run earlier in this process may have cached its own corpus.
  (await import("../../src/services/posts")).invalidateAllPostsCache();
  const store = getDocStore();
  await store.ready();
  return store;
}

// The publish target with its secrets, from the site's hosting credential.
export function siteHostingTarget(site: SiteRecord): { connectorId: string; settings: Record<string, unknown> } {
  if (!site.hosting.connectorId) throw new CliError("hosting-unknown", `The hosting of ${site.alias} is unknown.`, "Re-register it with `agentcms site add … --hosting-credential`.");
  if (!site.credentials.hosting) throw new CliError("credential-required", `No hosting credential recorded for ${site.alias}.`, "Re-register the site with --hosting-credential.");
  const cred = requireCredential(site.credentials.hosting);
  return { connectorId: site.hosting.connectorId, settings: { ...site.hosting.settings, ...cred.values } };
}
