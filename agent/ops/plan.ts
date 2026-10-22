import { HOSTING_OPTIONS } from "../../src/components/connectors/hostingOptions";
import { splitSecrets } from "../../src/services/docstore/markdownLayout";
import type { FlexwegRuntimeConfig, MarkdownGitRuntimeConfig } from "../../src/lib/runtimeConfig";
import { defaultSqliteLocation, SQLITE_DATA_BRANCH } from "../../src/services/docstore/sqliteLocation";
import { missingFields } from "../../src/services/storage/testConnection";
import type { PublishTarget } from "../../src/services/storage/target";
import { findDataBackend, findHosting } from "../catalog";
import { getCredential, parseAccount, requireCredential } from "../credentials";
import { CliError } from "../output";
import { validateAlias } from "../sites";

// An install plan is what the agent writes after asking the user (data
// first, then hosting). It never contains secrets — only account ids
// of stored credentials. `agentcms options --json` documents the fields.

interface TargetSpec {
  type: string;
  settings?: Record<string, unknown>;
  credential?: string;
}

export interface InstallPlan {
  alias: string;
  data:
    | { backend: "markdown-git"; git: Partial<MarkdownGitRuntimeConfig["git"]>; credential: string }
    | {
        backend: "sqlite-file";
        path: string;
        // Default: encrypted with a passphrase generated at install and
        // stored as passphrase:<alias>. false = plain file.
        encryption?: { credential?: string } | false;
        // Separate private place for the database (private bucket /
        // repo). Default: the hosting itself — on git hostings, its
        // dedicated branch agentcms-data (never published).
        location?: TargetSpec;
      };
  hosting: TargetSpec;
  // Copy the admin onto the hosting (default { folder: "admin" }); false = don't.
  admin?: { folder: string } | false;
}

export interface ResolvedPlan {
  alias: string;
  backend: "markdown-git" | "sqlite-file";
  // config.js content — no secrets.
  runtime: FlexwegRuntimeConfig;
  // Per-browser secrets the stores read from localStorage.
  gitToken?: string;
  sqliteSecrets?: Record<string, unknown>;
  // Encrypted SQLite: the account holding the passphrase, and the
  // passphrase when it already exists (otherwise generated at install).
  passphraseAccount?: string;
  passphrase?: string;
  // Where the SQLite file lives (the hosting unless a separate location).
  dataLocation?: PublishTarget;
  dataLocationType?: string;
  // Full publish target (with secrets) and its public view.
  target: PublishTarget;
  publicTarget: PublishTarget;
  hostingType: string;
  credentials: { data?: string; hosting?: string; passphrase?: string };
  adminFolder: string | null;
  siteUrl: string;
}

const SQLITE_PATH_RE = /^[\w./-]+\.(sqlite|db)$/i;
const SECRET_SETTING_KEYS = ["token", "apiKey", "accessKeyId", "secretAccessKey", "passphrase"];

function fail(message: string, hint?: string): never {
  throw new CliError("invalid-plan", message, hint ?? "Run `agentcms options --json` for the expected fields.", 2);
}

function str(v: unknown): string {
  return typeof v === "string" ? v.trim() : "";
}

export function cleanFolder(folder: string): string {
  return folder.trim().replace(/^\/+|\/+$/g, "");
}

// A hosting / location spec → connector settings with the credential's
// secrets merged in. `field` names the plan field in error messages.
function buildTarget(
  spec: TargetSpec,
  field: string,
  opts: { reuseGitAccount?: string; requireSiteUrl: boolean },
): { target: PublishTarget; account: string; type: string } {
  const type = str(spec?.type);
  const hostingSpec = findHosting(type);
  if (!hostingSpec) fail(`Unknown ${field}.type "${type}".`);
  if (!hostingSpec.cli) fail(`${field} "${type}" can't be set up from the CLI.`, hostingSpec.notes.join(" "));
  const option = HOSTING_OPTIONS.find((o) => o.id === type)!;

  let account = str(spec.credential);
  // Same git provider as the content → the content token publishes too.
  if (!account && hostingSpec.connectorId === "git-pages" && opts.reuseGitAccount) {
    const provider = (option.preset.provider as string) ?? "github";
    if (parseAccount(opts.reuseGitAccount).type === provider) account = opts.reuseGitAccount;
  }
  if (!account) fail(`${field}.credential is required (${hostingSpec.credentialTypes.join(" / ")} account).`);
  const credType = parseAccount(account).type;
  if (!hostingSpec.credentialTypes.includes(credType)) {
    fail(`${field}.credential must be a ${hostingSpec.credentialTypes.join(" / ")} account, got ${credType}.`);
  }

  const settings: Record<string, unknown> = { ...option.preset };
  for (const [k, v] of Object.entries(spec.settings ?? {})) {
    if (v === undefined || v === null) continue;
    if (SECRET_SETTING_KEYS.includes(k)) fail(`${field}.settings.${k} must not be in the plan — store it with \`agentcms credentials set\`.`);
    settings[k] = typeof v === "string" ? v.trim() : v;
  }
  if (typeof settings.siteUrl === "string") settings.siteUrl = settings.siteUrl.replace(/\/+$/, "");
  if (opts.requireSiteUrl && !/^https?:\/\/[^/]+/.test(str(settings.siteUrl))) fail(`${field}.settings.siteUrl must be an http(s) URL.`);
  Object.assign(settings, requireCredential(account).values);
  const missing = missingFields(hostingSpec.connectorId, settings, opts.requireSiteUrl ? [] : ["siteUrl"]);
  if (missing.length) fail(`Missing ${field} settings: ${missing.join(", ")}.`);
  return { target: { connectorId: hostingSpec.connectorId, settings }, account, type };
}

export function resolvePlan(plan: InstallPlan): ResolvedPlan {
  if (!plan || typeof plan !== "object") fail("The plan must be a JSON object.");
  const alias = validateAlias(str(plan.alias));

  const backendSpec = findDataBackend(str(plan.data?.backend));
  if (!backendSpec) fail(`Unknown data backend "${plan.data?.backend}".`);
  if (!backendSpec.cli) fail(`Data backend "${backendSpec.id}" can't be set up from the CLI.`, backendSpec.notes.join(" "));

  const credentials: ResolvedPlan["credentials"] = {};
  let gitToken: string | undefined;
  let gitCfg: MarkdownGitRuntimeConfig["git"] | undefined;
  if (plan.data.backend === "markdown-git") {
    const g = plan.data.git ?? {};
    const provider = g.provider;
    if (provider !== "github" && provider !== "gitlab") fail('data.git.provider must be "github" or "gitlab".');
    if (provider === "github" && (!str(g.owner) || !str(g.repo))) fail("data.git.owner and data.git.repo are required for GitHub.");
    if (provider === "gitlab" && !str(g.project)) fail("data.git.project is required for GitLab.");
    const account = str(plan.data.credential);
    if (!account) fail("data.credential is required (e.g. github:my-login).");
    if (parseAccount(account).type !== provider) fail(`data.credential must be a ${provider} account.`);
    gitToken = requireCredential(account).values.token;
    credentials.data = account;
    gitCfg = {
      provider,
      owner: provider === "github" ? str(g.owner) : undefined,
      repo: provider === "github" ? str(g.repo) : undefined,
      project: provider === "gitlab" ? str(g.project) : undefined,
      branch: str(g.branch) || "main",
      contentDir: cleanFolder(str(g.contentDir)),
      apiBaseUrl: str(g.apiBaseUrl) || undefined,
    };
  } else if (!SQLITE_PATH_RE.test(str(plan.data.path))) {
    fail("data.path must be a relative file path ending in .sqlite or .db, e.g. data/site.sqlite.");
  }

  const hosting = buildTarget(plan.hosting, "hosting", { reuseGitAccount: credentials.data, requireSiteUrl: true });
  credentials.hosting = hosting.account;
  const target = hosting.target;
  const siteUrl = str(target.settings.siteUrl);
  // accessKeyId is not secret for the stores, but nothing needs it in
  // the local registry either.
  const publicView = (t: PublishTarget): PublishTarget => ({
    connectorId: t.connectorId,
    settings: Object.fromEntries(Object.entries(splitSecrets(t.settings).clean).filter(([k]) => k !== "accessKeyId")),
  });

  let runtime: FlexwegRuntimeConfig;
  let sqliteSecrets: Record<string, unknown> | undefined;
  let dataLocation: PublishTarget | undefined;
  let dataLocationType: string | undefined;
  let passphraseAccount: string | undefined;
  let passphrase: string | undefined;
  if (gitCfg) {
    runtime = { backend: "markdown-git", git: gitCfg };
  } else {
    const data = plan.data as Extract<InstallPlan["data"], { backend: "sqlite-file" }>;
    if (data.location) {
      const loc = buildTarget(data.location, "data.location", { requireSiteUrl: false });
      dataLocation = loc.target;
      dataLocationType = loc.type;
      credentials.data = loc.account;
    } else {
      // Git hostings: a dedicated, never-published branch of the same repo.
      dataLocation = defaultSqliteLocation(target);
      dataLocationType = dataLocation === target ? hosting.type : `${hosting.type}, branch ${SQLITE_DATA_BRANCH}`;
    }
    if (data.encryption !== false) {
      passphraseAccount = str(data.encryption?.credential) || `passphrase:${alias}`;
      if (parseAccount(passphraseAccount).type !== "passphrase") fail("data.encryption.credential must be a passphrase account.");
      const stored = getCredential(passphraseAccount)?.values.passphrase;
      // An explicitly named account must exist; the default one is generated.
      if (!stored && data.encryption?.credential) requireCredential(passphraseAccount);
      passphrase = stored;
      credentials.passphrase = passphraseAccount;
    }
    // The location's secrets stay per browser; config.js gets the rest.
    const split = splitSecrets(dataLocation.settings);
    sqliteSecrets = split.secrets ?? {};
    const locationSettings = Object.fromEntries(Object.entries(split.clean).filter(([k]) => k !== "siteUrl"));
    runtime = {
      backend: "sqlite-file",
      sqlite: {
        connectorId: dataLocation.connectorId,
        settings: dataLocation === target ? split.clean : locationSettings,
        path: str(data.path).replace(/^\/+/, ""),
        ...(passphraseAccount ? { encrypted: true } : {}),
      },
    };
  }

  let adminFolder: string | null = "admin";
  if (plan.admin === false) adminFolder = null;
  else if (plan.admin && typeof plan.admin === "object") {
    adminFolder = cleanFolder(str(plan.admin.folder));
    if (!/^[\w.-]+(\/[\w.-]+)*$/.test(adminFolder)) fail("admin.folder must be a relative folder name, e.g. admin.");
  }

  return {
    alias,
    backend: runtime.backend as ResolvedPlan["backend"],
    runtime,
    gitToken,
    sqliteSecrets,
    passphraseAccount,
    passphrase,
    dataLocation,
    dataLocationType,
    target,
    publicTarget: publicView(target),
    hostingType: hosting.type,
    credentials,
    adminFolder,
    siteUrl,
  };
}
