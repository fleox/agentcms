import { HOSTING_OPTIONS } from "../../src/components/connectors/hostingOptions";
import { splitSecrets } from "../../src/services/docstore/markdownLayout";
import type { FlexwegRuntimeConfig, MarkdownGitRuntimeConfig } from "../../src/lib/runtimeConfig";
import { missingFields } from "../../src/services/storage/testConnection";
import type { PublishTarget } from "../../src/services/storage/target";
import { findDataBackend, findHosting } from "../catalog";
import { parseAccount, requireCredential } from "../credentials";
import { CliError } from "../output";
import { validateAlias } from "../sites";

// An install plan is what the agent writes after asking the user (data
// first, then hosting). It never contains secrets — only account ids
// of stored credentials. `agentcms options --json` documents the fields.

export interface InstallPlan {
  alias: string;
  data:
    | { backend: "markdown-git"; git: Partial<MarkdownGitRuntimeConfig["git"]>; credential: string }
    | { backend: "sqlite-file"; path: string };
  hosting: { type: string; settings?: Record<string, unknown>; credential?: string };
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
  // Full publish target (with secrets) and its public view.
  target: PublishTarget;
  publicTarget: PublishTarget;
  hostingType: string;
  credentials: { data?: string; hosting?: string };
  adminFolder: string | null;
  siteUrl: string;
}

const SQLITE_PATH_RE = /^[\w./-]+\.(sqlite|db)$/i;

function fail(message: string, hint?: string): never {
  throw new CliError("invalid-plan", message, hint ?? "Run `agentcms options --json` for the expected fields.", 2);
}

function str(v: unknown): string {
  return typeof v === "string" ? v.trim() : "";
}

export function cleanFolder(folder: string): string {
  return folder.trim().replace(/^\/+|\/+$/g, "");
}

export function resolvePlan(plan: InstallPlan): ResolvedPlan {
  if (!plan || typeof plan !== "object") fail("The plan must be a JSON object.");
  const alias = validateAlias(str(plan.alias));

  // ── hosting ──
  const hostingType = str(plan.hosting?.type);
  const hostingSpec = findHosting(hostingType);
  if (!hostingSpec) fail(`Unknown hosting type "${hostingType}".`);
  if (!hostingSpec.cli) fail(`Hosting "${hostingType}" can't be set up from the CLI.`, hostingSpec.notes.join(" "));
  const option = HOSTING_OPTIONS.find((o) => o.id === hostingType)!;

  // ── data ──
  const backendSpec = findDataBackend(str(plan.data?.backend));
  if (!backendSpec) fail(`Unknown data backend "${plan.data?.backend}".`);
  if (!backendSpec.cli) fail(`Data backend "${backendSpec.id}" can't be set up from the CLI.`, backendSpec.notes.join(" "));
  if (plan.data.backend === "sqlite-file" && !hostingSpec.cli) fail("SQLite needs a hosting the CLI can write to.");

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

  // ── hosting settings + credential ──
  let hostingAccount = str(plan.hosting.credential);
  // Same git provider as the content → the content token publishes too.
  if (!hostingAccount && hostingSpec.connectorId === "git-pages" && credentials.data) {
    const provider = (option.preset.provider as string) ?? "github";
    if (parseAccount(credentials.data).type === provider) hostingAccount = credentials.data;
  }
  if (!hostingAccount) fail(`hosting.credential is required (${hostingSpec.credentialTypes.join(" / ")} account).`);
  const hostingType2 = parseAccount(hostingAccount).type;
  if (!hostingSpec.credentialTypes.includes(hostingType2)) {
    fail(`hosting.credential must be a ${hostingSpec.credentialTypes.join(" / ")} account, got ${hostingType2}.`);
  }
  credentials.hosting = hostingAccount;
  const secretValues = requireCredential(hostingAccount).values;

  const settings: Record<string, unknown> = { ...option.preset };
  for (const [k, v] of Object.entries(plan.hosting.settings ?? {})) {
    if (v === undefined || v === null) continue;
    if (["token", "apiKey", "accessKeyId", "secretAccessKey"].includes(k)) {
      fail(`hosting.settings.${k} must not be in the plan — store it with \`agentcms credentials set\`.`);
    }
    settings[k] = typeof v === "string" ? v.trim() : v;
  }
  if (typeof settings.siteUrl === "string") settings.siteUrl = settings.siteUrl.replace(/\/+$/, "");
  if (!/^https?:\/\/[^/]+/.test(str(settings.siteUrl))) fail("hosting.settings.siteUrl must be an http(s) URL.");
  Object.assign(settings, secretValues);
  const missing = missingFields(hostingSpec.connectorId, settings);
  if (missing.length) fail(`Missing hosting settings: ${missing.join(", ")}.`);

  const target: PublishTarget = { connectorId: hostingSpec.connectorId, settings };
  const { clean } = splitSecrets(settings);
  // accessKeyId is not secret for the stores, but nothing needs it in
  // the local registry either.
  const publicSettings = Object.fromEntries(Object.entries(clean).filter(([k]) => k !== "accessKeyId"));
  const publicTarget: PublishTarget = { connectorId: hostingSpec.connectorId, settings: publicSettings };

  // ── runtime (config.js) ──
  let runtime: FlexwegRuntimeConfig;
  let sqliteSecrets: Record<string, unknown> | undefined;
  if (gitCfg) {
    runtime = { backend: "markdown-git", git: gitCfg };
  } else {
    const split = splitSecrets(settings);
    sqliteSecrets = split.secrets ?? {};
    runtime = {
      backend: "sqlite-file",
      sqlite: { connectorId: hostingSpec.connectorId, settings: split.clean, path: str((plan.data as { path: string }).path).replace(/^\/+/, "") },
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
    target,
    publicTarget,
    hostingType,
    credentials,
    adminFolder,
    siteUrl: str(settings.siteUrl),
  };
}
