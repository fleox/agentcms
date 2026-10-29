import { createRequire as __acmsRequire } from "node:module";
import { fileURLToPath as __acmsPath } from "node:url";
import { dirname as __acmsDirname } from "node:path";
const require2 = __acmsRequire(import.meta.url);
const __filename = __acmsPath(import.meta.url);
const __dirname = __acmsDirname(__filename);
import { a as splitSecrets } from "./gitStore-Bmv5JU5m.mjs";
import { c as createRemoteGitTransport } from "./index-CPPISFvW.mjs";
import { c as resolveGitPagesToken, u as missingFields } from "./registry-DMuFJNAR.mjs";
import { v as validateAlias, o as findDataBackend, n as parseAccount, b as requireCredential, q as getCredential, C as CliError, t as findHosting } from "../agentcms.mjs";
const gitHost = (host) => (connectorId, s) => connectorId === "git-pages" && (s.host ?? "github-pages") === host;
const HOSTING_OPTIONS = [
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
const SQLITE_DATA_BRANCH = "agentcms-data";
function defaultSqliteLocation(target) {
  if (target.connectorId !== "git-pages") return target;
  const settings = Object.fromEntries(Object.entries(target.settings).filter(([k]) => k !== "siteUrl" && k !== "dir"));
  return { connectorId: "git-pages", settings: { ...settings, host: "other", dir: "", branch: SQLITE_DATA_BRANCH } };
}
async function ensurePublishBranch(target) {
  if (target.connectorId !== "git-pages") return;
  const s = target.settings;
  const token = resolveGitPagesToken(s);
  const transport = createRemoteGitTransport(
    s.provider === "gitlab" ? { provider: "gitlab", project: s.project ?? "", branch: s.branch, token, apiBaseUrl: s.apiBaseUrl } : { provider: "github", owner: s.owner ?? "", repo: s.repo ?? "", branch: s.branch, token, apiBaseUrl: s.apiBaseUrl }
  );
  if (await transport.headSha()) return;
  await transport.commit([{ type: "put", path: ".gitkeep", content: "" }], { message: "Initialize site — AgentCMS" });
}
const SQLITE_PATH_RE = /^[\w./-]+\.(sqlite|db)$/i;
const SECRET_SETTING_KEYS = ["token", "apiKey", "accessKeyId", "secretAccessKey", "passphrase"];
function fail(message, hint) {
  throw new CliError("invalid-plan", message, hint ?? "Run `agentcms options --json` for the expected fields.", 2);
}
function str(v) {
  return typeof v === "string" ? v.trim() : "";
}
function cleanFolder(folder) {
  return folder.trim().replace(/^\/+|\/+$/g, "");
}
function buildTarget(spec, field, opts) {
  const type = str(spec?.type);
  const hostingSpec = findHosting(type);
  if (!hostingSpec) fail(`Unknown ${field}.type "${type}".`);
  if (!hostingSpec.cli) fail(`${field} "${type}" can't be set up from the CLI.`, hostingSpec.notes.join(" "));
  const option = HOSTING_OPTIONS.find((o) => o.id === type);
  let account = str(spec.credential);
  if (!account && hostingSpec.connectorId === "git-pages" && opts.reuseGitAccount) {
    const provider = option.preset.provider ?? "github";
    if (parseAccount(opts.reuseGitAccount).type === provider) account = opts.reuseGitAccount;
  }
  if (!account) fail(`${field}.credential is required (${hostingSpec.credentialTypes.join(" / ")} account).`);
  const credType = parseAccount(account).type;
  if (!hostingSpec.credentialTypes.includes(credType)) {
    fail(`${field}.credential must be a ${hostingSpec.credentialTypes.join(" / ")} account, got ${credType}.`);
  }
  const settings = { ...option.preset };
  for (const [k, v] of Object.entries(spec.settings ?? {})) {
    if (v === void 0 || v === null) continue;
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
function resolvePlan(plan2) {
  if (!plan2 || typeof plan2 !== "object") fail("The plan must be a JSON object.");
  const alias = validateAlias(str(plan2.alias));
  const backendSpec = findDataBackend(str(plan2.data?.backend));
  if (!backendSpec) fail(`Unknown data backend "${plan2.data?.backend}".`);
  if (!backendSpec.cli) fail(`Data backend "${backendSpec.id}" can't be set up from the CLI.`, backendSpec.notes.join(" "));
  const credentials = {};
  let gitToken;
  let gitCfg;
  let firebaseCfg;
  let firebaseLogin;
  if (plan2.data.backend === "markdown-git") {
    const g = plan2.data.git ?? {};
    const provider = g.provider;
    if (provider !== "github" && provider !== "gitlab") fail('data.git.provider must be "github" or "gitlab".');
    if (provider === "github" && (!str(g.owner) || !str(g.repo))) fail("data.git.owner and data.git.repo are required for GitHub.");
    if (provider === "gitlab" && !str(g.project)) fail("data.git.project is required for GitLab.");
    const account = str(plan2.data.credential);
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
  } else if (plan2.data.backend === "firebase") {
    const fb = plan2.data.firebase ?? {};
    for (const k of ["apiKey", "authDomain", "projectId", "appId"]) if (!str(fb[k])) fail(`data.firebase.${k} is required (Firebase console → Project settings → Your apps → config).`);
    const account = str(plan2.data.credential);
    if (!account) fail("data.credential is required (e.g. firebase:my-project).");
    if (parseAccount(account).type !== "firebase") fail("data.credential must be a firebase account (email + password).");
    const v = requireCredential(account).values;
    firebaseLogin = { email: v.email, password: v.password };
    credentials.data = account;
    firebaseCfg = Object.fromEntries(
      ["apiKey", "authDomain", "projectId", "storageBucket", "messagingSenderId", "appId", "measurementId"].filter((k) => str(fb[k])).map((k) => [k, str(fb[k])])
    );
  } else if (!SQLITE_PATH_RE.test(str(plan2.data.path))) {
    fail("data.path must be a relative file path ending in .sqlite or .db, e.g. data/site.sqlite.");
  }
  const hosting = buildTarget(plan2.hosting, "hosting", { reuseGitAccount: credentials.data, requireSiteUrl: true });
  credentials.hosting = hosting.account;
  const target = hosting.target;
  const siteUrl = str(target.settings.siteUrl);
  const publicView = (t) => ({
    connectorId: t.connectorId,
    settings: Object.fromEntries(Object.entries(splitSecrets(t.settings).clean).filter(([k]) => k !== "accessKeyId"))
  });
  let runtime;
  let sqliteSecrets;
  let dataLocation;
  let dataLocationType;
  let passphraseAccount;
  let passphrase;
  if (gitCfg) {
    runtime = { backend: "markdown-git", git: gitCfg };
  } else if (firebaseCfg) {
    runtime = { backend: "firebase", firebase: firebaseCfg };
  } else {
    const data = plan2.data;
    if (data.location) {
      const loc = buildTarget(data.location, "data.location", { requireSiteUrl: false });
      dataLocation = loc.target;
      dataLocationType = loc.type;
      credentials.data = loc.account;
    } else {
      dataLocation = defaultSqliteLocation(target);
      dataLocationType = dataLocation === target ? hosting.type : `${hosting.type}, branch ${SQLITE_DATA_BRANCH}`;
    }
    if (data.encryption !== false) {
      passphraseAccount = str(data.encryption?.credential) || `passphrase:${alias}`;
      if (parseAccount(passphraseAccount).type !== "passphrase") fail("data.encryption.credential must be a passphrase account.");
      const stored = getCredential(passphraseAccount)?.values.passphrase;
      if (!stored && data.encryption?.credential) requireCredential(passphraseAccount);
      passphrase = stored;
      credentials.passphrase = passphraseAccount;
    }
    const split = splitSecrets(dataLocation.settings);
    sqliteSecrets = split.secrets ?? {};
    const locationSettings = Object.fromEntries(Object.entries(split.clean).filter(([k]) => k !== "siteUrl"));
    runtime = {
      backend: "sqlite-file",
      sqlite: {
        connectorId: dataLocation.connectorId,
        settings: dataLocation === target ? split.clean : locationSettings,
        path: str(data.path).replace(/^\/+/, ""),
        ...passphraseAccount ? { encrypted: true } : {}
      }
    };
  }
  let adminFolder = "admin";
  if (plan2.admin === false) adminFolder = null;
  else if (plan2.admin && typeof plan2.admin === "object") {
    adminFolder = cleanFolder(str(plan2.admin.folder));
    if (!/^[\w.-]+(\/[\w.-]+)*$/.test(adminFolder)) fail("admin.folder must be a relative folder name, e.g. admin.");
  }
  return {
    alias,
    backend: runtime.backend,
    runtime,
    gitToken,
    firebaseLogin,
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
    siteUrl
  };
}
const plan = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  cleanFolder,
  resolvePlan
}, Symbol.toStringTag, { value: "Module" }));
export {
  cleanFolder as c,
  ensurePublishBranch as e,
  plan as p
};
