import { createRequire as __acmsRequire } from "node:module";
import { fileURLToPath as __acmsPath } from "node:url";
import { dirname as __acmsDirname } from "node:path";
const require2 = __acmsRequire(import.meta.url);
const __filename = __acmsPath(import.meta.url);
const __dirname = __acmsDirname(__filename);
import { C as CliError, b as requireCredential } from "../agentcms.mjs";
import "node:util";
import "node:fs";
import "node:path";
import "node:url";
import "node:os";
import "node:child_process";
import "node:crypto";
import "node:http";
async function openSiteStore(site) {
  const runtime = site.runtime;
  if (runtime.backend === "firebase") {
    throw new CliError("unsupported-backend", `${site.alias} keeps its content in Firebase, which the CLI can't open.`, "Use the admin instead (Plugins / Themes → Install, then upload the ZIP).");
  }
  if (runtime.backend === "local") {
    throw new CliError("unsupported-backend", `${site.alias} keeps its content in one browser (local mode).`, "Use the admin in that browser.");
  }
  const account = site.credentials.data ?? (runtime.backend === "sqlite-file" ? site.credentials.hosting : null);
  if (!account) {
    throw new CliError("credential-required", `No data credential recorded for ${site.alias}.`, "Re-register it: `agentcms site add <alias> --admin-url <url> --data-credential <account>`.");
  }
  const { resetRuntimeConfigCache } = await import("./runtimeConfig-BNLCrrQo.mjs");
  const { getDocStore, resetDocStore, setDocStoreForTests } = await import("./registry-Bhq3fghS.mjs").then((n) => n.B);
  const { invalidateActiveStorageConnector } = await import("./registry-Bhq3fghS.mjs").then((n) => n.D);
  const values = requireCredential(account).values;
  setDocStoreForTests(null);
  if (runtime.backend === "markdown-git") {
    const { setGitToken } = await import("./gitStore-BkclOUWu.mjs").then((n) => n.d);
    if (runtime.git.provider === "local") throw new CliError("unsupported", "Local-folder git content can't be managed from the CLI.");
    setGitToken(runtime.git, values.token ?? null);
  } else {
    const { saveSqliteConnectorSecrets, saveSqlitePassphrase } = await import("./registry-Bhq3fghS.mjs").then((n) => n.A);
    const { loadSqlWasm } = await import("./hosting-B5zmtdAT.mjs");
    loadSqlWasm();
    saveSqliteConnectorSecrets(values);
    if (site.credentials.passphrase) saveSqlitePassphrase(requireCredential(site.credentials.passphrase).values.passphrase);
  }
  window.__AGENTCMS_CONFIG__ = runtime;
  resetRuntimeConfigCache();
  resetDocStore();
  invalidateActiveStorageConnector();
  (await import("./posts-RGcbBKyd.mjs")).invalidateAllPostsCache();
  const store = getDocStore();
  await store.ready();
  return store;
}
function siteHostingTarget(site) {
  if (!site.hosting.connectorId) throw new CliError("hosting-unknown", `The hosting of ${site.alias} is unknown.`, "Re-register it with `agentcms site add … --hosting-credential`.");
  if (!site.credentials.hosting) throw new CliError("credential-required", `No hosting credential recorded for ${site.alias}.`, "Re-register the site with --hosting-credential.");
  const cred = requireCredential(site.credentials.hosting);
  return { connectorId: site.hosting.connectorId, settings: { ...site.hosting.settings, ...cred.values } };
}
export {
  openSiteStore,
  siteHostingTarget
};
