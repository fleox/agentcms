import { createRequire as __acmsRequire } from "node:module";
import { fileURLToPath as __acmsPath } from "node:url";
import { dirname as __acmsDirname } from "node:path";
const require2 = __acmsRequire(import.meta.url);
const __filename = __acmsPath(import.meta.url);
const __dirname = __acmsDirname(__filename);
import { a as splitSecrets } from "./markdownLayout-DDqv_pCV.mjs";
import { z as missingFields } from "./registry-C6BuhuyI.mjs";
import { v as validateAlias, f as findHosting, a as findDataBackend, p as parseAccount, r as requireCredential, C as CliError } from "../agentcms.mjs";
import "util";
import "crypto";
import "process";
import "tls";
import "fs";
import "os";
import "net";
import "events";
import "stream";
import "path";
import "http2";
import "http";
import "url";
import "dns";
import "zlib";
import "buffer";
import "node:util";
import "node:fs";
import "node:path";
import "node:url";
import "node:child_process";
import "node:os";
import "node:http";
const gitHost = (host) => (connectorId, s) => connectorId === "git-pages" && (s.host ?? "github-pages") === host;
const HOSTING_OPTIONS = [
  {
    id: "flexweg",
    connectorId: "flexweg",
    preset: {},
    hiddenFields: [],
    matches: (c) => c === "flexweg"
  },
  {
    id: "github-pages",
    connectorId: "git-pages",
    preset: { host: "github-pages", provider: "github", branch: "main" },
    hiddenFields: ["host", "provider"],
    matches: gitHost("github-pages")
  },
  {
    id: "cloudflare-pages",
    connectorId: "git-pages",
    preset: { host: "cloudflare-pages", provider: "github", branch: "main" },
    hiddenFields: ["host"],
    matches: gitHost("cloudflare-pages")
  },
  {
    id: "gitlab-pages",
    connectorId: "git-pages",
    preset: { host: "gitlab-pages", provider: "gitlab", branch: "main", dir: "public" },
    hiddenFields: ["host", "provider"],
    matches: gitHost("gitlab-pages")
  },
  {
    id: "git-other",
    connectorId: "git-pages",
    preset: { host: "other", provider: "github", branch: "main" },
    hiddenFields: ["host"],
    matches: gitHost("other")
  },
  {
    id: "s3",
    connectorId: "s3",
    preset: { region: "auto" },
    hiddenFields: [],
    matches: (c) => c === "s3"
  },
  {
    id: "own-server",
    connectorId: "php-bridge",
    preset: {},
    hiddenFields: [],
    matches: (c) => c === "php-bridge"
  },
  {
    id: "local-folder",
    connectorId: "local-folder",
    preset: {},
    hiddenFields: [],
    matches: (c) => c === "local-folder"
  },
  {
    id: "zip",
    connectorId: "browser-mirror",
    preset: {},
    hiddenFields: [],
    matches: (c) => c === "browser-mirror"
  }
];
const SQLITE_PATH_RE = /^[\w./-]+\.(sqlite|db)$/i;
function fail(message, hint) {
  throw new CliError("invalid-plan", message, hint ?? "Run `agentcms options --json` for the expected fields.", 2);
}
function str(v) {
  return typeof v === "string" ? v.trim() : "";
}
function cleanFolder(folder) {
  return folder.trim().replace(/^\/+|\/+$/g, "");
}
function resolvePlan(plan) {
  if (!plan || typeof plan !== "object") fail("The plan must be a JSON object.");
  const alias = validateAlias(str(plan.alias));
  const hostingType = str(plan.hosting?.type);
  const hostingSpec = findHosting(hostingType);
  if (!hostingSpec) fail(`Unknown hosting type "${hostingType}".`);
  if (!hostingSpec.cli) fail(`Hosting "${hostingType}" can't be set up from the CLI.`, hostingSpec.notes.join(" "));
  const option = HOSTING_OPTIONS.find((o) => o.id === hostingType);
  const backendSpec = findDataBackend(str(plan.data?.backend));
  if (!backendSpec) fail(`Unknown data backend "${plan.data?.backend}".`);
  if (!backendSpec.cli) fail(`Data backend "${backendSpec.id}" can't be set up from the CLI.`, backendSpec.notes.join(" "));
  if (plan.data.backend === "sqlite-file" && !hostingSpec.cli) fail("SQLite needs a hosting the CLI can write to.");
  const credentials = {};
  let gitToken;
  let gitCfg;
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
      owner: provider === "github" ? str(g.owner) : void 0,
      repo: provider === "github" ? str(g.repo) : void 0,
      project: provider === "gitlab" ? str(g.project) : void 0,
      branch: str(g.branch) || "main",
      contentDir: cleanFolder(str(g.contentDir)),
      apiBaseUrl: str(g.apiBaseUrl) || void 0
    };
  } else if (!SQLITE_PATH_RE.test(str(plan.data.path))) {
    fail("data.path must be a relative file path ending in .sqlite or .db, e.g. data/site.sqlite.");
  }
  let hostingAccount = str(plan.hosting.credential);
  if (!hostingAccount && hostingSpec.connectorId === "git-pages" && credentials.data) {
    const provider = option.preset.provider ?? "github";
    if (parseAccount(credentials.data).type === provider) hostingAccount = credentials.data;
  }
  if (!hostingAccount) fail(`hosting.credential is required (${hostingSpec.credentialTypes.join(" / ")} account).`);
  const hostingType2 = parseAccount(hostingAccount).type;
  if (!hostingSpec.credentialTypes.includes(hostingType2)) {
    fail(`hosting.credential must be a ${hostingSpec.credentialTypes.join(" / ")} account, got ${hostingType2}.`);
  }
  credentials.hosting = hostingAccount;
  const secretValues = requireCredential(hostingAccount).values;
  const settings = { ...option.preset };
  for (const [k, v] of Object.entries(plan.hosting.settings ?? {})) {
    if (v === void 0 || v === null) continue;
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
  const target = { connectorId: hostingSpec.connectorId, settings };
  const { clean } = splitSecrets(settings);
  const publicSettings = Object.fromEntries(Object.entries(clean).filter(([k]) => k !== "accessKeyId"));
  const publicTarget = { connectorId: hostingSpec.connectorId, settings: publicSettings };
  let runtime;
  let sqliteSecrets;
  if (gitCfg) {
    runtime = { backend: "markdown-git", git: gitCfg };
  } else {
    const split = splitSecrets(settings);
    sqliteSecrets = split.secrets ?? {};
    runtime = {
      backend: "sqlite-file",
      sqlite: { connectorId: hostingSpec.connectorId, settings: split.clean, path: str(plan.data.path).replace(/^\/+/, "") }
    };
  }
  let adminFolder = "admin";
  if (plan.admin === false) adminFolder = null;
  else if (plan.admin && typeof plan.admin === "object") {
    adminFolder = cleanFolder(str(plan.admin.folder));
    if (!/^[\w.-]+(\/[\w.-]+)*$/.test(adminFolder)) fail("admin.folder must be a relative folder name, e.g. admin.");
  }
  return {
    alias,
    backend: runtime.backend,
    runtime,
    gitToken,
    sqliteSecrets,
    target,
    publicTarget,
    hostingType,
    credentials,
    adminFolder,
    siteUrl: str(settings.siteUrl)
  };
}
export {
  cleanFolder,
  resolvePlan
};
