#!/usr/bin/env node
import { createRequire as __acmsRequire } from "node:module";
import { fileURLToPath as __acmsPath } from "node:url";
import { dirname as __acmsDirname } from "node:path";
const require2 = __acmsRequire(import.meta.url);
const __filename = __acmsPath(import.meta.url);
const __dirname = __acmsDirname(__filename);
import { parseArgs } from "node:util";
import { existsSync, readFileSync, statSync, mkdirSync, writeFileSync, chmodSync, renameSync, openSync, writeSync, closeSync, unlinkSync, rmSync, readdirSync, createReadStream } from "node:fs";
import { join, resolve, dirname, basename, extname, sep, normalize } from "node:path";
import { fileURLToPath } from "node:url";
import { homedir, tmpdir } from "node:os";
import { spawnSync, execFileSync } from "node:child_process";
import { createServer } from "node:http";
class CliError extends Error {
  constructor(code, message, hint, exitCode = 1) {
    super(message);
    this.code = code;
    this.hint = hint;
    this.exitCode = exitCode;
  }
}
function createIo(json) {
  return {
    json,
    out: (text) => process.stdout.write(text.endsWith("\n") ? text : text + "\n"),
    err: (text) => process.stderr.write(text.endsWith("\n") ? text : text + "\n")
  };
}
function printResult(io, data, human) {
  if (io.json) io.out(JSON.stringify({ ok: true, data }));
  else io.out(human());
}
function knownError(error) {
  if (error instanceof Error && error.name === "DocConflictError") {
    return new CliError("conflict", `The content changed elsewhere while this command ran (${error.collection ?? "?"}/${error.id ?? "?"}); nothing of this write was saved.`, "Run the same command again (it reloads the latest content). Happens when another editor, agent or a deploy commit to the same repository wrote at the same time.");
  }
  if (error instanceof Error && error.name === "SqlitePassphraseError") {
    const reason = error.reason;
    return reason === "missing" ? new CliError("passphrase-required", "This database is encrypted and the site has no passphrase credential.", "Store it (`! agentcms credentials set passphrase:<alias>`), then register the site with `--passphrase-credential passphrase:<alias>` (`site forget` + `site add`, or `site credentials`).") : new CliError("passphrase-wrong", "Wrong passphrase: the database could not be decrypted.", "Store the right one: `! agentcms credentials set <the site's passphrase account>` (see `site show`).");
  }
  return null;
}
function printError(io, error) {
  const e = error instanceof CliError ? error : knownError(error) ?? new CliError(
    "internal",
    error instanceof Error ? error.message : String(error),
    "Unexpected error. Retry once; if it persists, report it with the command and this output at https://github.com/fleox/agentcms/issues."
  );
  if (io.json) {
    io.out(JSON.stringify({ ok: false, error: { code: e.code, message: e.message, ...e.hint ? { hint: e.hint } : {} } }));
  } else {
    io.err(`Error: ${e.message}${e.hint ? `
Hint: ${e.hint}` : ""}`);
  }
  return e.exitCode;
}
const output = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  CliError,
  createIo,
  printError,
  printResult
}, Symbol.toStringTag, { value: "Module" }));
function distRoot() {
  if (process.env.AGENTCMS_DIST) return resolve(process.env.AGENTCMS_DIST);
  const here = dirname(fileURLToPath(import.meta.url));
  const bundled = true;
  return bundled ? resolve(here, "..") : resolve(here, "..", "dist");
}
function readVersionInfo() {
  const file2 = join(distRoot(), "version.json");
  if (!existsSync(file2)) {
    throw new Error(`${file2} is missing — run \`npm run build\` first.`);
  }
  return JSON.parse(readFileSync(file2, "utf8"));
}
const paths = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  distRoot,
  readVersionInfo
}, Symbol.toStringTag, { value: "Module" }));
class MemoryStorage {
  data = /* @__PURE__ */ new Map();
  get length() {
    return this.data.size;
  }
  key(index) {
    return [...this.data.keys()][index] ?? null;
  }
  getItem(key) {
    return this.data.get(key) ?? null;
  }
  setItem(key, value) {
    this.data.set(key, String(value));
  }
  removeItem(key) {
    this.data.delete(key);
  }
  clear() {
    this.data.clear();
  }
}
let installed = false;
function installBrowserEnv() {
  if (installed) return;
  installed = true;
  const g = globalThis;
  for (const name of ["localStorage", "sessionStorage"]) {
    Object.defineProperty(globalThis, name, { value: new MemoryStorage(), configurable: true, writable: true });
  }
  if (typeof g.window === "undefined") {
    Object.defineProperty(globalThis, "window", { value: globalThis, configurable: true, writable: true });
  }
}
function homeDir() {
  return resolve(process.env.AGENTCMS_HOME || join(homedir(), ".agentcms"));
}
function homePath(...parts) {
  return join(homeDir(), ...parts);
}
function readJsonFile(file2, fallback) {
  if (!existsSync(file2)) return fallback;
  return JSON.parse(readFileSync(file2, "utf8"));
}
function writeJsonFile(file2, value, mode = 420) {
  mkdirSync(dirname(file2), { recursive: true, mode: 448 });
  const tmp = `${file2}.${process.pid}.tmp`;
  writeFileSync(tmp, JSON.stringify(value, null, 2) + "\n", { mode });
  chmodSync(tmp, mode);
  renameSync(tmp, file2);
}
function isWorldReadable(file2) {
  if (process.platform === "win32" || !existsSync(file2)) return false;
  return (statSync(file2).mode & 63) !== 0;
}
const CREDENTIAL_TYPES = {
  github: {
    fields: ["token"],
    label: "GitHub personal access token",
    howTo: "https://github.com/settings/personal-access-tokens/new — fine-grained, 'Only select repositories' (content + site repos), Repository permissions: Contents Read and write, Pages Read and write (optional, lets the site be published automatically), Metadata Read-only."
  },
  gitlab: {
    fields: ["token"],
    label: "GitLab access token",
    howTo: "GitLab project → Settings → Access tokens (or user Preferences → Access tokens): scope `api`, role Developer or higher."
  },
  s3: {
    fields: ["accessKeyId", "secretAccessKey"],
    label: "S3 access key pair",
    howTo: "AWS IAM user with s3:GetObject/PutObject/DeleteObject/ListBucket on the bucket, or OVHcloud Public Cloud → Object Storage → S3 users. Import an existing aws CLI profile with --from-aws-profile."
  },
  firebase: {
    fields: ["email", "password"],
    label: "Firebase admin login (email + password)",
    howTo: "The email and password of an administrator of the site's Firebase project (the account used to sign in to the admin). The CLI signs in with Firebase Auth exactly like the admin login screen."
  },
  passphrase: {
    fields: ["passphrase"],
    label: "SQLite database passphrase",
    howTo: "Generated by `agentcms install` (or `credentials set passphrase:<name> --generate`). Each browser asks for it once; copy it with `agentcms credentials copy passphrase:<name>` into a password manager."
  }
};
const ACCOUNT_RE = /^([a-z0-9-]+):([A-Za-z0-9._@-]{1,100})$/;
function file$1() {
  return homePath("credentials.json");
}
function load$1() {
  return readJsonFile(file$1(), { version: 1, accounts: {} });
}
function save$1(data) {
  writeJsonFile(file$1(), data, 384);
}
function parseAccount(account) {
  const m = ACCOUNT_RE.exec(account);
  if (!m || !CREDENTIAL_TYPES[m[1]]) {
    throw new CliError(
      "invalid-account",
      `Invalid account "${account}".`,
      `Use <type>:<name> with type one of ${Object.keys(CREDENTIAL_TYPES).join(", ")} — e.g. github:my-login.`,
      2
    );
  }
  return { type: m[1], name: m[2] };
}
function setCredential(account, values) {
  const { type } = parseAccount(account);
  const missing = CREDENTIAL_TYPES[type].fields.filter((f) => !values[f]?.trim());
  if (missing.length) throw new CliError("missing-fields", `Missing ${missing.join(", ")} for ${account}.`);
  const data = load$1();
  const entry = {
    type,
    values: Object.fromEntries(CREDENTIAL_TYPES[type].fields.map((f) => [f, values[f].trim()])),
    updatedAt: (/* @__PURE__ */ new Date()).toISOString()
  };
  data.accounts[account] = entry;
  save$1(data);
  return entry;
}
function removeCredential(account) {
  const data = load$1();
  if (!data.accounts[account]) return false;
  delete data.accounts[account];
  save$1(data);
  return true;
}
function getCredential(account) {
  parseAccount(account);
  const path = file$1();
  if (isWorldReadable(path)) chmodSync(path, 384);
  return load$1().accounts[account] ?? null;
}
function requireCredential(account) {
  const cred = getCredential(account);
  if (!cred) {
    const { type } = parseAccount(account);
    throw new CliError(
      "credential-missing",
      `No stored credential for ${account}.`,
      `Ask the user to run \`agentcms credentials set ${account}\` in their own terminal (input is hidden). ${CREDENTIAL_TYPES[type].howTo}`
    );
  }
  return cred;
}
function listCredentials() {
  return Object.entries(load$1().accounts).map(([account, c]) => ({
    account,
    type: c.type,
    fields: Object.keys(c.values),
    updatedAt: c.updatedAt
  }));
}
const credentials = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  CREDENTIAL_TYPES,
  getCredential,
  listCredentials,
  parseAccount,
  removeCredential,
  requireCredential,
  setCredential
}, Symbol.toStringTag, { value: "Module" }));
const ALIAS_RE = /^[a-z0-9][a-z0-9-]{0,62}$/;
function file() {
  return homePath("sites.json");
}
function load() {
  return readJsonFile(file(), { version: 1, default: null, sites: {} });
}
function save(data) {
  writeJsonFile(file(), data);
}
function validateAlias(alias) {
  if (!ALIAS_RE.test(alias)) {
    throw new CliError("invalid-alias", `Invalid site alias "${alias}".`, "Lower-case letters, digits and dashes, e.g. my-blog.", 2);
  }
  return alias;
}
function listSites() {
  const data = load();
  return { default: data.default, sites: Object.values(data.sites).sort((a, b) => a.alias.localeCompare(b.alias)) };
}
function getSite(alias) {
  return load().sites[alias] ?? null;
}
function putSite(site) {
  const data = load();
  data.sites[site.alias] = { ...site, updatedAt: (/* @__PURE__ */ new Date()).toISOString() };
  save(data);
}
function removeSite(alias) {
  const data = load();
  if (!data.sites[alias]) return false;
  delete data.sites[alias];
  if (data.default === alias) data.default = null;
  save(data);
  return true;
}
function renameSite(from, to) {
  validateAlias(to);
  const data = load();
  const site = data.sites[from];
  if (!site) throw siteNotFound(from, data);
  if (data.sites[to]) throw new CliError("site-exists", `A site named "${to}" already exists.`);
  delete data.sites[from];
  data.sites[to] = { ...site, alias: to, updatedAt: (/* @__PURE__ */ new Date()).toISOString() };
  if (data.default === from) data.default = to;
  save(data);
}
function setDefaultSite(alias) {
  const data = load();
  if (!data.sites[alias]) throw siteNotFound(alias, data);
  data.default = alias;
  save(data);
}
function findProjectSite(cwd = process.cwd()) {
  let dir = resolve(cwd);
  for (; ; ) {
    const candidate = join(dir, "agentcms.json");
    if (existsSync(candidate)) {
      const alias = JSON.parse(readFileSync(candidate, "utf8")).site;
      if (typeof alias === "string" && alias) return { alias, file: candidate };
    }
    const parent = dirname(dir);
    if (parent === dir) return null;
    dir = parent;
  }
}
function siteNotFound(alias, data) {
  const known = Object.keys(data.sites);
  return new CliError(
    "site-not-found",
    `No site named "${alias}".`,
    known.length ? `Known sites: ${known.join(", ")}.` : "No site registered yet — run `agentcms install` or `agentcms site add`."
  );
}
function resolveSite(explicit) {
  const data = load();
  const chosen = explicit || process.env.AGENTCMS_SITE?.trim() || findProjectSite()?.alias;
  if (chosen) {
    const site = data.sites[chosen];
    if (!site) throw siteNotFound(chosen, data);
    return site;
  }
  const all = Object.values(data.sites);
  if (all.length === 1) return all[0];
  if (all.length === 0) throw siteNotFound("(none)", data);
  if (data.default && data.sites[data.default]) return data.sites[data.default];
  throw new CliError(
    "site-required",
    `Several sites are registered: ${all.map((s) => s.alias).join(", ")}.`,
    "Ask the user which one, then pass --site <alias>.",
    2
  );
}
function lockSite(alias) {
  const dir = homePath("locks");
  mkdirSync(dir, { recursive: true, mode: 448 });
  const path = join(dir, `${alias}.lock`);
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const fd = openSync(path, "wx");
      writeSync(fd, String(process.pid));
      closeSync(fd);
      return () => {
        try {
          unlinkSync(path);
        } catch {
        }
      };
    } catch (err) {
      if (err.code !== "EEXIST") throw err;
      const pid = Number(readFileSync(path, "utf8"));
      if (pid && isAlive(pid)) {
        throw new CliError("site-busy", `Another agentcms process (pid ${pid}) is working on "${alias}".`, "Wait for it to finish.");
      }
      unlinkSync(path);
    }
  }
  throw new CliError("site-busy", `Could not lock "${alias}".`);
}
function isAlive(pid) {
  try {
    process.kill(pid, 0);
    return true;
  } catch (err) {
    return err.code === "EPERM";
  }
}
const compactDataCommand = {
  name: "compact-data",
  summary: "Shrink the git history of a SQLite site's data branch (e.g. agentcms-data) to one commit with the current database. GitHub only. Prints the plan unless --yes.",
  usage: "compact-data [--site <alias>] [--yes]",
  options: [
    { name: "site", type: "string", description: "Site alias." },
    { name: "yes", type: "boolean", description: "Apply — only after the user confirmed." }
  ],
  async run({ io, options }) {
    const site = resolveSite(options.site);
    const runtime = site.runtime;
    if (runtime.backend !== "sqlite-file" || runtime.sqlite.connectorId !== "git-pages") {
      throw new CliError("not-applicable", `${site.alias} doesn't keep a SQLite database in git — nothing to compact.`);
    }
    const s = runtime.sqlite.settings;
    if (s.provider !== "github") throw new CliError("unsupported", "Compaction is only implemented for GitHub repositories.");
    const account = site.credentials.data ?? site.credentials.hosting;
    if (!account) throw new CliError("credential-required", `No credential recorded for the data of ${site.alias}.`);
    const token = requireCredential(account).values.token;
    installBrowserEnv();
    const { createRemoteGitTransport, joinRepoPath } = await import("./chunks/index-BA9sR5p-.mjs").then((n) => n.i);
    const transport = createRemoteGitTransport({
      provider: "github",
      owner: s.owner ?? "",
      repo: s.repo ?? "",
      branch: s.branch ?? "",
      token,
      apiBaseUrl: s.apiBaseUrl
    });
    const tree = await transport.listTree();
    if (!tree.headSha) throw new CliError("empty", "The data branch doesn't exist yet.");
    const dbPath = joinRepoPath(s.dir ?? "", runtime.sqlite.path);
    const foreign = tree.entries.filter((e) => e.path !== dbPath && e.path !== ".gitkeep");
    if (foreign.length) {
      throw new CliError(
        "shared-branch",
        `Branch ${s.branch} also holds ${foreign.length} other file(s) (${foreign.slice(0, 3).map((e) => e.path).join(", ")}…) — compaction would drop their history too.`,
        "Only a dedicated data branch can be compacted."
      );
    }
    const api = (s.apiBaseUrl || "https://api.github.com").replace(/\/+$/, "");
    const res = await fetch(`${api}/repos/${s.owner}/${s.repo}/commits?sha=${encodeURIComponent(s.branch ?? "")}&per_page=1`, {
      headers: { Authorization: `Bearer ${token}`, Accept: "application/vnd.github+json" }
    });
    const last = /[?&]page=(\d+)>; rel="last"/.exec(res.headers.get("link") ?? "");
    const commits = res.ok ? last ? Number(last[1]) : 1 : null;
    const size = tree.entries.find((e) => e.path === dbPath)?.size ?? null;
    const plan = { site: site.alias, repo: `${s.owner}/${s.repo}`, branch: s.branch, commits, databaseBytes: size, files: tree.entries.map((e) => e.path) };
    if (!options.yes) {
      printResult(
        io,
        { needsConfirmation: true, ...plan },
        () => `${site.alias}: ${plan.repo}@${plan.branch} has ${commits ?? "?"} commit(s); compaction keeps 1 (database ${size ?? "?"} bytes). Nothing was changed. Re-run with --yes once the user agrees.`
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
        files.push({ path: entry.path, content: Buffer.from(await transport.readBytes(entry)).toString("base64"), encoding: "base64" });
      }
      await transport.resetBranch(files, { message: "Compact data history — AgentCMS", expectedHeadSha: tree.headSha });
      printResult(io, { ...plan, compacted: true }, () => `${site.alias}: ${plan.branch} compacted from ${commits ?? "?"} commits to 1.`);
    } finally {
      unlock();
    }
  }
};
function fromEnv(names, fields) {
  if (names.length !== fields.length) {
    throw new CliError("usage", `--from-env needs ${fields.length} variable name(s) (${fields.join(", ")}), comma-separated.`, void 0, 2);
  }
  return Object.fromEntries(
    fields.map((field, i) => {
      const value = process.env[names[i]];
      if (!value) throw new CliError("env-missing", `Environment variable ${names[i]} is empty or not set.`);
      return [field, value];
    })
  );
}
function fromGh(host) {
  try {
    const args = ["auth", "token", ...host ? ["--hostname", host] : []];
    const token = execFileSync("gh", args, { encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] }).trim();
    if (!token) throw new Error("empty");
    return { token };
  } catch {
    throw new CliError(
      "gh-unavailable",
      "Could not read a token from the GitHub CLI.",
      "Install gh and run `gh auth login`, or create a fine-grained token and use `credentials set` without --from-gh."
    );
  }
}
function parseIni(text) {
  const out = {};
  let section = null;
  for (const raw of text.split(/\r?\n/)) {
    const line = raw.trim();
    if (!line || line.startsWith("#") || line.startsWith(";")) continue;
    const s = /^\[([^\]]+)\]$/.exec(line);
    if (s) {
      section = out[s[1].trim()] = {};
      continue;
    }
    const kv = /^([^=]+?)\s*=\s*(.*)$/.exec(line);
    if (kv && section) section[kv[1].trim()] = kv[2].trim();
  }
  return out;
}
function fromAwsProfile(profile) {
  const file2 = process.env.AWS_SHARED_CREDENTIALS_FILE || join(homedir(), ".aws", "credentials");
  if (!existsSync(file2)) throw new CliError("aws-missing", `No aws credentials file at ${file2}.`, "Run `aws configure` first.");
  const section = parseIni(readFileSync(file2, "utf8"))[profile];
  if (!section?.aws_access_key_id || !section.aws_secret_access_key) {
    throw new CliError("aws-profile-missing", `Profile "${profile}" has no access key pair in ${file2}.`);
  }
  return { accessKeyId: section.aws_access_key_id, secretAccessKey: section.aws_secret_access_key };
}
async function promptHidden(question) {
  const stdin = process.stdin;
  if (!stdin.isTTY) {
    throw new CliError(
      "needs-terminal",
      "No terminal to type the secret in.",
      "Ask the user to run this command themselves in their terminal (in Claude Code: prefix it with `!`), or pass --from-env / --from-gh / --from-aws-profile."
    );
  }
  process.stderr.write(question);
  stdin.setRawMode(true);
  stdin.resume();
  stdin.setEncoding("utf8");
  return new Promise((resolve2, reject) => {
    let value = "";
    const done = (err) => {
      stdin.setRawMode(false);
      stdin.pause();
      stdin.off("data", onData);
      process.stderr.write("\n");
      if (err) reject(err);
      else resolve2(value);
    };
    const onData = (chunk) => {
      for (const ch of chunk) {
        if (ch === "\r" || ch === "\n") return done();
        if (ch === "") return done(new CliError("cancelled", "Cancelled."));
        if (ch === "" || ch === "\b") value = value.slice(0, -1);
        else value += ch;
      }
    };
    stdin.on("data", onData);
  });
}
function copyToClipboard(text) {
  const candidates = process.platform === "darwin" ? [["pbcopy", []]] : process.platform === "win32" ? [["clip", []]] : [
    ["wl-copy", []],
    ["xclip", ["-selection", "clipboard"]],
    ["xsel", ["--clipboard", "--input"]]
  ];
  for (const [cmd, args] of candidates) {
    const res = spawnSync(cmd, args, { input: text, stdio: ["pipe", "ignore", "ignore"] });
    if (res.status === 0) return cmd;
  }
  throw new CliError("no-clipboard", "No clipboard tool found (pbcopy, clip, wl-copy, xclip or xsel).", "Install one, or read the value from ~/.agentcms/credentials.json yourself.");
}
function sessionFile(account) {
  return homePath("sessions", `${account.replace(/[^a-z0-9._-]+/gi, "_")}.json`);
}
function forgetFirebaseSession(account) {
  const f = sessionFile(account);
  if (existsSync(f)) rmSync(f, { force: true });
}
function filePersistence(account, email) {
  const file2 = sessionFile(account);
  const saved = readJsonFile(file2, null);
  const items = saved && saved.email === email ? { ...saved.items } : {};
  const flush = () => {
    if (Object.keys(items).length) writeJsonFile(file2, { email, items }, 384);
    else forgetFirebaseSession(account);
  };
  return class FileSessionPersistence {
    static type = "LOCAL";
    type = "LOCAL";
    async _isAvailable() {
      return true;
    }
    async _set(key, value) {
      items[key] = value;
      flush();
    }
    async _get(key) {
      return items[key] ?? null;
    }
    async _remove(key) {
      delete items[key];
      flush();
    }
    _addListener() {
    }
    _removeListener() {
    }
  };
}
async function signInFirebase(account, email, password) {
  const { getRuntimeConfig } = await import("./chunks/runtimeConfig-2M2d2Pbu.mjs");
  const config = getRuntimeConfig();
  if (config?.backend !== "firebase") throw new Error("signInFirebase: the active backend is not Firebase.");
  const { getApps, initializeApp } = await import("./chunks/index-B4MbpTF6.mjs");
  const { initializeAuth, getAuth, signInWithEmailAndPassword, signOut } = await import("./chunks/index-BzGlTM6h.mjs");
  const app = getApps()[0] ?? initializeApp(config.firebase);
  let auth;
  try {
    auth = initializeAuth(app, { persistence: filePersistence(account, email.trim()) });
  } catch {
    auth = getAuth(app);
  }
  await auth.authStateReady();
  const current = auth.currentUser;
  if (current && current.email?.toLowerCase() === email.trim().toLowerCase()) {
    try {
      await current.getIdToken();
      return;
    } catch {
    }
  }
  if (current) await signOut(auth).catch(() => {
  });
  await signInWithEmailAndPassword(auth, email.trim(), password);
}
const firebaseSession = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  forgetFirebaseSession,
  signInFirebase
}, Symbol.toStringTag, { value: "Module" }));
const MAGIC = new TextEncoder().encode("ACMSENC1");
const HEADER = MAGIC.length + 4 + 16 + 12;
const PBKDF2_ITERATIONS = 6e5;
class SqlitePassphraseError extends Error {
  constructor(reason) {
    super(reason === "missing" ? "This database is encrypted: enter its passphrase." : "Wrong passphrase for this database.");
    this.reason = reason;
    this.name = "SqlitePassphraseError";
  }
}
function isEncryptedDatabase(bytes) {
  return !!bytes && bytes.length >= HEADER && MAGIC.every((b, i) => bytes[i] === b);
}
const keyCache = /* @__PURE__ */ new Map();
function hex(bytes) {
  return [...bytes].map((b) => b.toString(16).padStart(2, "0")).join("");
}
function deriveKey(passphrase, salt, iterations) {
  const id = `${iterations}:${hex(salt)}:${passphrase}`;
  let key = keyCache.get(id);
  if (!key) {
    key = (async () => {
      const material = await crypto.subtle.importKey("raw", new TextEncoder().encode(passphrase.normalize("NFC")), "PBKDF2", false, ["deriveKey"]);
      return crypto.subtle.deriveKey(
        { name: "PBKDF2", hash: "SHA-256", salt, iterations },
        material,
        { name: "AES-GCM", length: 256 },
        false,
        ["encrypt", "decrypt"]
      );
    })();
    key.catch(() => keyCache.delete(id));
    keyCache.set(id, key);
  }
  return key;
}
function encryptionParams(bytes) {
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  return {
    iterations: view.getUint32(MAGIC.length),
    salt: bytes.slice(MAGIC.length + 4, MAGIC.length + 20)
  };
}
async function encryptDatabase(plain, passphrase, params) {
  if (!passphrase) throw new SqlitePassphraseError("missing");
  const salt = params?.salt ?? crypto.getRandomValues(new Uint8Array(16));
  const iterations = params?.iterations ?? PBKDF2_ITERATIONS;
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const key = await deriveKey(passphrase, salt, iterations);
  const cipher = new Uint8Array(await crypto.subtle.encrypt({ name: "AES-GCM", iv }, key, plain));
  const out = new Uint8Array(HEADER + cipher.length);
  out.set(MAGIC, 0);
  new DataView(out.buffer).setUint32(MAGIC.length, iterations);
  out.set(salt, MAGIC.length + 4);
  out.set(iv, MAGIC.length + 20);
  out.set(cipher, HEADER);
  return out;
}
async function decryptDatabase(bytes, passphrase) {
  if (!passphrase) throw new SqlitePassphraseError("missing");
  const { salt, iterations } = encryptionParams(bytes);
  const iv = bytes.slice(MAGIC.length + 20, HEADER);
  const key = await deriveKey(passphrase, salt, iterations);
  try {
    return new Uint8Array(await crypto.subtle.decrypt({ name: "AES-GCM", iv }, key, bytes.slice(HEADER)));
  } catch {
    throw new SqlitePassphraseError("wrong");
  }
}
function generatePassphrase() {
  const alphabet = "abcdefghjkmnpqrstuvwxyz23456789";
  const pick = crypto.getRandomValues(new Uint8Array(30));
  const chars = [...pick].map((b) => alphabet[b % alphabet.length]);
  return Array.from({ length: 6 }, (_, i) => chars.slice(i * 5, i * 5 + 5).join("")).join("-");
}
const credentialsCommand = {
  name: "credentials",
  summary: "Store, list, copy or remove access tokens / keys per account (<type>:<name>). `set` reads the secret from --from-env, --from-gh, --from-aws-profile, --generate (passphrases) or a hidden prompt the USER types in; `copy` puts it on the clipboard without printing it.",
  usage: "credentials <set|list|copy|remove|types> [<type>:<name>] [--from-env VAR[,VAR]] [--from-gh] [--from-aws-profile <name>] [--generate] [--field <name>]",
  options: [
    { name: "from-env", type: "string", description: "Read the value(s) from these environment variables (comma-separated, in field order)." },
    { name: "from-gh", type: "boolean", description: "github: take the token of the signed-in GitHub CLI (gh auth token)." },
    { name: "from-aws-profile", type: "string", description: "s3: import the key pair of this aws CLI profile." },
    { name: "generate", type: "boolean", description: "passphrase: generate a strong random passphrase." },
    { name: "field", type: "string", description: "copy: which field (default: the first, e.g. token / passphrase)." }
  ],
  async run({ io, options, positionals }) {
    const [action = "list", account] = positionals;
    if (action === "types") {
      printResult(
        io,
        CREDENTIAL_TYPES,
        () => Object.entries(CREDENTIAL_TYPES).map(([type2, c]) => `${type2}: ${c.label} (${c.fields.join(", ")})
  ${c.howTo}`).join("\n")
      );
      return;
    }
    if (action === "list") {
      const { sites } = listSites();
      const list2 = listCredentials().map((c) => ({
        ...c,
        usedBy: sites.filter((s) => s.credentials.data === c.account || s.credentials.hosting === c.account || s.credentials.passphrase === c.account).map((s) => s.alias)
      }));
      printResult(
        io,
        list2,
        () => list2.length ? list2.map((c) => `${c.account}  (${c.fields.join(", ")})${c.usedBy.length ? `  used by ${c.usedBy.join(", ")}` : ""}`).join("\n") : "No stored credentials."
      );
      return;
    }
    if (!account) throw new CliError("usage", `credentials ${action} needs an account, e.g. github:my-login.`, void 0, 2);
    const { type } = parseAccount(account);
    if (action === "remove") {
      const removed = removeCredential(account);
      forgetFirebaseSession(account);
      printResult(io, { account, removed }, () => removed ? `Removed ${account}.` : `${account} was not stored.`);
      return;
    }
    if (action === "copy") {
      const cred = requireCredential(account);
      const field = typeof options.field === "string" ? options.field : CREDENTIAL_TYPES[type].fields[0];
      if (!cred.values[field]) throw new CliError("usage", `${account} has no field "${field}".`, `Fields: ${Object.keys(cred.values).join(", ")}.`, 2);
      const tool = copyToClipboard(cred.values[field]);
      printResult(io, { account, field, copied: true, tool }, () => `Copied ${field} of ${account} to the clipboard.`);
      return;
    }
    if (action !== "set") throw new CliError("usage", `Unknown action "${action}".`, "Use set, list, copy, remove or types.", 2);
    const spec = CREDENTIAL_TYPES[type];
    let values;
    if (options.generate) {
      if (type !== "passphrase") throw new CliError("usage", "--generate only applies to passphrase accounts.", void 0, 2);
      values = { passphrase: generatePassphrase() };
    } else if (typeof options["from-env"] === "string") values = fromEnv(options["from-env"].split(",").map((s) => s.trim()), spec.fields);
    else if (options["from-gh"]) {
      if (type !== "github") throw new CliError("usage", "--from-gh only applies to github accounts.", void 0, 2);
      values = fromGh();
    } else if (typeof options["from-aws-profile"] === "string") {
      if (type !== "s3") throw new CliError("usage", "--from-aws-profile only applies to s3 accounts.", void 0, 2);
      values = fromAwsProfile(options["from-aws-profile"]);
    } else {
      io.err(`${spec.label} for ${account}. ${spec.howTo}`);
      values = {};
      for (const field of spec.fields) values[field] = await promptHidden(`${field}: `);
    }
    const saved = setCredential(account, values);
    forgetFirebaseSession(account);
    printResult(io, { account, type, fields: Object.keys(saved.values) }, () => `Stored ${account} (${Object.keys(saved.values).join(", ")}).`);
  }
};
function parse(v) {
  const m = /^v?(\d+)\.(\d+)\.(\d+)(?:-([0-9A-Za-z.-]+))?/.exec(v.trim());
  if (!m) throw new Error(`Invalid version: ${v}`);
  return [Number(m[1]), Number(m[2]), Number(m[3]), m[4] ?? ""];
}
function compareVersions(a, b) {
  const pa = parse(a);
  const pb = parse(b);
  for (let i = 0; i < 3; i++) {
    if (pa[i] !== pb[i]) return pa[i] < pb[i] ? -1 : 1;
  }
  if (pa[3] === pb[3]) return 0;
  if (!pa[3]) return 1;
  if (!pb[3]) return -1;
  return pa[3] < pb[3] ? -1 : 1;
}
async function fetchText(url, fetchImpl = fetch) {
  try {
    const u = new URL(url);
    u.searchParams.set("agentcms", String(Date.now()));
    const res = await fetchImpl(u.href, { cache: "no-store", redirect: "follow", signal: AbortSignal.timeout(15e3) });
    const text = await res.text();
    return { ok: res.ok, status: res.status, contentType: res.headers.get("content-type") ?? "", text };
  } catch (err) {
    return { ok: false, status: 0, contentType: "", text: "", error: err.message };
  }
}
function publicUrlOf(site) {
  const target = site.hosting?.settings?.siteUrl;
  return (typeof target === "string" && /^https?:\/\//.test(target) ? target : site.siteUrl).replace(/\/+$/, "");
}
function secureAdminUrlOf(site) {
  const admin = adminUrlOf(site);
  if (!admin || site.hosting?.connectorId !== "s3") return null;
  if (admin.startsWith("https://")) return admin.endsWith("/") ? `${admin}index.html` : admin;
  if (/^http:\/\/(localhost|127\.0\.0\.1|\[::1\])(:\d+)?\//.test(admin)) return null;
  const s = site.hosting.settings ?? {};
  if (!s.bucket) return null;
  const endpoint = (s.endpoint || (s.region ? `https://s3.${s.region}.amazonaws.com` : "https://s3.amazonaws.com")).replace(/\/+$/, "");
  if (!endpoint.startsWith("https://")) return null;
  const path = [String(s.prefix ?? "").replace(/^\/+|\/+$/g, ""), site.adminFolder].filter(Boolean).join("/");
  const pathStyle = s.bucket.includes(".");
  const base = pathStyle ? `${endpoint}/${s.bucket}` : endpoint.replace("https://", `https://${s.bucket}.`);
  return `${base}/${path}/index.html`;
}
function adminUrlOf(site) {
  return site.adminFolder ? `${site.siteUrl.replace(/\/+$/, "")}/${site.adminFolder}/` : null;
}
function parseConfigJs(source) {
  const m = /window\.__(?:AGENTCMS|FLEXWEG)_CONFIG__\s*=\s*([\s\S]*?);?\s*$/.exec(source.trim());
  if (!m) throw new Error("config.js does not set window.__AGENTCMS_CONFIG__");
  const value = JSON.parse(m[1].trim().replace(/;$/, ""));
  return value && typeof value === "object" ? value : null;
}
function findSecretKeys(value, path = "") {
  if (!value || typeof value !== "object") return [];
  return Object.entries(value).flatMap(([k, v]) => {
    const here = path ? `${path}.${k}` : k;
    if (/^(token|apiKey|secretAccessKey|accessToken|password|sqliteToken)$/.test(k) && typeof v === "string" && v) {
      if (k === "apiKey" && path === "firebase") return [];
      return [here];
    }
    return findSecretKeys(v, here);
  });
}
async function fetchHostedAdmin(adminUrl, fetchImpl = fetch) {
  const res = await fetchText(`${adminUrl}admin-files.json`, fetchImpl);
  const none = { version: null, dataSchema: null, apiVersion: null, apiMinVersion: null, files: [] };
  if (!res.ok) return { ...none, error: res.error ?? `HTTP ${res.status}` };
  try {
    const m = JSON.parse(res.text);
    return {
      version: m.version ?? null,
      dataSchema: m.dataSchema ?? null,
      apiVersion: m.apiVersion ?? null,
      apiMinVersion: m.apiMinVersion ?? null,
      files: m.files ?? []
    };
  } catch {
    return { ...none, error: "admin-files.json is not valid JSON" };
  }
}
function readChangelog() {
  try {
    const data = JSON.parse(readFileSync(join(distRoot(), "..", "changelog.json"), "utf8"));
    return data.versions ?? [];
  } catch {
    return [];
  }
}
function changesBetween(entries, from, to) {
  const list2 = entries.filter((e) => compareVersions(e.version, from) > 0 && compareVersions(e.version, to) <= 0);
  return {
    versions: list2.map((e) => e.version),
    breaking: list2.some((e) => e.breaking),
    changes: list2.flatMap((e) => e.changes.map((c) => `${e.version}: ${c}`)),
    actions: [...new Set(list2.flatMap((e) => e.actions))]
  };
}
const remote = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  adminUrlOf,
  changesBetween,
  fetchHostedAdmin,
  fetchText,
  findSecretKeys,
  parseConfigJs,
  publicUrlOf,
  readChangelog,
  secureAdminUrlOf
}, Symbol.toStringTag, { value: "Module" }));
const deployAdminCommand = {
  name: "deploy-admin",
  summary: "Update a site's hosted admin (and optionally its theme assets) to this release. Prints the plan unless --yes is given; refuses downgrades below the stored data format.",
  usage: "deploy-admin [--site <alias> | --all] [--theme-assets] [--yes] [--allow-downgrade]",
  options: [
    { name: "site", type: "string", description: "Site alias." },
    { name: "all", type: "boolean", description: "Every registered site with a hosted admin (each listed separately)." },
    { name: "theme-assets", type: "boolean", description: "Also upload theme CSS / loaders (changelog action sync-theme-assets)." },
    { name: "yes", type: "boolean", description: "Apply — only after the user confirmed the plan." },
    { name: "allow-downgrade", type: "boolean", description: "Allow installing an older admin than the hosted one." }
  ],
  async run({ io, options }) {
    const info = readVersionInfo();
    const sites = options.all ? listSites().sites.filter((s) => s.adminFolder) : [resolveSite(options.site)];
    if (sites.length === 0) throw new CliError("no-sites", "No registered site has a hosted admin.");
    installBrowserEnv();
    const { adminOps, applyOps, hostingConnector, themeAssetOps } = await import("./chunks/hosting-D9KnbC3T.mjs");
    const { collectToasts, settleHosting } = await import("./chunks/install-B9sCv3gx.mjs");
    const plans = [];
    for (const site of sites) {
      const adminUrl = adminUrlOf(site);
      if (!adminUrl) throw new CliError("not-hosted", `${site.alias} has no hosted admin.`);
      if (!site.hosting.connectorId) throw new CliError("hosting-unknown", `The hosting of ${site.alias} is unknown.`, "Re-register it with `agentcms site add … --hosting-credential`.");
      if (!site.credentials.hosting) throw new CliError("credential-required", `No hosting credential recorded for ${site.alias}.`, "Re-register the site with --hosting-credential.");
      const hosted = await fetchHostedAdmin(adminUrl);
      const plan = {
        alias: site.alias,
        adminUrl,
        from: hosted.version,
        to: info.version,
        files: adminOps(site.adminFolder, site.runtime).ops.length + (options["theme-assets"] ? themeAssetOps().length : 0),
        themeAssets: !!options["theme-assets"],
        changes: hosted.version ? changesBetween(readChangelog(), hosted.version, info.version) : null
      };
      if (hosted.dataSchema !== null && hosted.dataSchema > info.dataSchema) {
        plan.refused = `the hosted admin stores data format ${hosted.dataSchema}, this release only knows ${info.dataSchema} — update agentcms instead`;
      } else if (hosted.version && compareVersions(hosted.version, info.version) > 0 && !options["allow-downgrade"]) {
        plan.refused = `the hosted admin (${hosted.version}) is newer than this release — update agentcms, or pass --allow-downgrade`;
      }
      plans.push(plan);
    }
    if (!options.yes) {
      printResult(
        io,
        { needsConfirmation: true, plans },
        () => [
          ...plans.map(
            (p) => p.refused ? `${p.alias}: refused — ${p.refused}` : `${p.alias}: admin ${p.from ?? "(none)"} → ${p.to}, ${p.files} files${p.changes?.breaking ? " — BREAKING changes" : ""}`
          ),
          "Nothing was changed. Re-run with --yes once the user agrees."
        ].join("\n")
      );
      return;
    }
    const results = [];
    for (const [i, site] of sites.entries()) {
      const plan = plans[i];
      if (plan.refused) {
        results.push({ alias: site.alias, deployed: false, reason: plan.refused });
        continue;
      }
      const unlock = lockSite(site.alias);
      const toasts = collectToasts();
      try {
        const cred = requireCredential(site.credentials.hosting);
        const target = { connectorId: site.hosting.connectorId, settings: { ...site.hosting.settings, ...cred.values } };
        const { ops } = adminOps(site.adminFolder, site.runtime);
        if (options["theme-assets"]) ops.unshift(...themeAssetOps());
        io.err(`• ${site.alias}: uploading ${ops.length} files…`);
        await applyOps(hostingConnector(target), ops);
        await settleHosting(target);
        putSite({ ...site, adminVersion: info.version });
        const pending = (plan.changes?.actions ?? []).filter((a) => a !== "deploy-admin" && !(a === "sync-theme-assets" && plan.themeAssets));
        results.push({ alias: site.alias, deployed: true, from: plan.from, to: info.version, files: ops.length, pendingActions: pending, notices: toasts.notices });
      } catch (err) {
        results.push({ alias: site.alias, deployed: false, reason: err.message });
      } finally {
        toasts.stop();
        unlock();
      }
    }
    printResult(
      io,
      { results },
      () => results.map((r) => r.deployed ? `${r.alias}: admin ${r.from ?? "(none)"} → ${r.to}` : `${r.alias}: not deployed — ${r.reason}`).join("\n")
    );
    if (results.some((r) => !r.deployed)) return 1;
  }
};
async function runDoctor(site, opts = {}) {
  const f = opts.fetchImpl ?? fetch;
  const checks = [];
  const add = (c) => checks.push(c);
  const info = readVersionInfo();
  const siteUrl = site.siteUrl.replace(/\/+$/, "");
  const secureAdmin = secureAdminUrlOf(site);
  add(
    secureAdmin && !siteUrl.startsWith("https://") ? { id: "https", status: "ok", message: `The public site is plain HTTP; open the admin over HTTPS: ${secureAdmin}` } : siteUrl.startsWith("https://") || /^http:\/\/(localhost|127\.0\.0\.1|\[::1\])(:\d+)?(\/|$)/.test(siteUrl) ? { id: "https", status: "ok", message: siteUrl.startsWith("https://") ? "Site served over HTTPS." : "Local site (a secure context for browsers)." } : {
      id: "https",
      status: "warn",
      message: `${siteUrl} is plain HTTP.`,
      fix: "Use the host's HTTPS URL (S3: the bucket's https endpoint) — the admin can't sign requests on http pages."
    }
  );
  const pagesHost = site.hosting?.connectorId === "git-pages";
  const home = await fetchText(`${publicUrlOf(site)}/`, f);
  add(
    home.ok ? /\/theme-assets\//.test(home.text ?? "") ? { id: "site", status: "ok", message: `Home page reachable (${home.status}).` } : {
      id: "site",
      status: "warn",
      message: "The home page answers but isn't an AgentCMS page (no theme stylesheet): another site's page, a README, or a host that hasn't served the new files yet.",
      fix: `${pagesHost ? "Pages hosts take a minute or two after a commit: wait, then re-run doctor. " : ""}Otherwise publish something or run \`agentcms regenerate everything --site ${site.alias}\`.`
    } : home.status === 404 ? { id: "site", status: "warn", message: "No home page yet (404).", fix: `Publish a post or run \`agentcms regenerate everything --site ${site.alias}\`.` } : { id: "site", status: "fail", message: `Site not reachable: ${home.error ?? `HTTP ${home.status}`}.`, fix: "Check siteUrl, DNS, and that the host serves the bucket / repo (GitHub Pages enabled, S3 website hosting on)." }
  );
  const hostingCredForDeploy = site.credentials.hosting ? getCredential(site.credentials.hosting) : null;
  if (home.ok && hostingCredForDeploy && site.hosting.connectorId) {
    try {
      installBrowserEnv();
      const { hostingConnector } = await import("./chunks/hosting-D9KnbC3T.mjs");
      const connector = hostingConnector({ connectorId: site.hosting.connectorId, settings: { ...site.hosting.settings, ...hostingCredForDeploy.values } });
      const bytes = connector.getBytes ? await connector.getBytes("index.html") : null;
      if (bytes) {
        const norm = (t) => t.replace(/\s+/g, " ").trim();
        const latest = new TextDecoder().decode(bytes);
        add(
          norm(latest) === norm(home.text) ? { id: "deployment", status: "ok", message: "The site serves the latest home page written to the hosting." } : {
            id: "deployment",
            status: "warn",
            message: "The site still serves an older home page than the one on the hosting: a deployment is pending (Pages build running or queued, or a CDN cache).",
            fix: `${pagesHost ? "Each command that writes is one commit and one build; builds queue up after bursts of commands. " : ""}Wait a minute or two, then re-run doctor before checking the live pages. If it never catches up, look at the host's build / deployment log.`
          }
        );
      }
    } catch {
    }
  }
  if (home.ok) {
    const missing = await fetchText(`${publicUrlOf(site)}/agentcms-doctor-missing-page.html`, f);
    const own = await fetchText(`${publicUrlOf(site)}/404.html`, f);
    if (own.ok && missing.status === 404) {
      const norm = (t) => t.replace(/\s+/g, " ").trim();
      add(
        norm(missing.text) === norm(own.text) ? { id: "not-found-page", status: "ok", message: "Missing pages show this site's 404 page." } : {
          id: "not-found-page",
          status: "warn",
          message: "Missing pages show another page than this site's 404.html (the hosting's error page belongs to another site or the bucket root).",
          fix: site.hosting.connectorId === "s3" ? "A bucket has a single error document: give the site its own bucket (or point the bucket's error document at this site's 404.html if it is the main site)." : "Check the host's custom 404 setting."
        }
      );
    }
  }
  if (site.runtime.backend === "markdown-git" && home.ok) {
    const dir = String(site.runtime.git.contentDir ?? "").replace(/^\/+|\/+$/g, "");
    const probe = await fetchText(`${publicUrlOf(site)}/${dir ? `${dir}/` : ""}settings/site.json`, f);
    add(
      probe.ok && /^\s*\{/.test(probe.text) ? { id: "content-exposure", status: "warn", message: "The content repository is served by the public site: drafts and users.json (editors' emails) are downloadable.", fix: "Move the content to a separate private repository (`transfer export` → new site), or publish the site from a `docs` folder." } : { id: "content-exposure", status: "ok", message: "Content files are not served by the public site." }
    );
  }
  const css = await fetchText(`${siteUrl}/theme-assets/default.css`, f);
  add(
    css.ok && css.contentType.includes("text/css") ? { id: "theme-assets", status: "ok", message: "Theme stylesheet served as text/css." } : {
      id: "theme-assets",
      status: "fail",
      message: css.ok ? `theme-assets/default.css has type "${css.contentType}".` : `theme-assets/default.css missing (${css.error ?? css.status}).`,
      fix: `${pagesHost && !css.ok ? "Just installed or deployed? Pages hosts take a minute or two after a commit: wait, then re-run doctor. If it persists: " : ""}\`agentcms deploy-admin --site ${site.alias} --theme-assets --yes\` (after confirming with the user), or Themes → Sync theme assets in the admin.`
    }
  );
  const adminUrl = adminUrlOf(site);
  if (!adminUrl) {
    add({ id: "admin", status: "skip", message: "Admin not hosted on this site." });
  } else {
    const index = await fetchText(`${adminUrl}index.html`, f);
    if (!index.ok || !index.contentType.includes("text/html")) {
      add({
        id: "admin",
        status: "fail",
        message: `Admin page ${adminUrl} not served (${index.error ?? `HTTP ${index.status}`}${index.ok ? `, type ${index.contentType}` : ""}).`,
        fix: `\`agentcms deploy-admin --site ${site.alias}\`; on GitHub Pages wait a minute after a commit.`
      });
    } else {
      const openAt = secureAdmin ?? adminUrl;
      add({ id: "admin", status: "ok", message: `Admin served; open it at ${openAt}.` });
      const hosted = await fetchHostedAdmin(adminUrl, f);
      const refs = [...index.text.matchAll(/(?:src|href)="\.\/([^"?#]+)"/g)].map((m) => m[1]);
      const missing = refs.filter((r) => r !== "config.js" && !hosted.files.includes(r));
      const script = refs.find((r) => r.startsWith("assets/") && r.endsWith(".js"));
      const bundle = script ? await fetchText(`${adminUrl}${script}`, f) : null;
      if (!hosted.version || missing.length || bundle && (!bundle.ok || !/javascript/.test(bundle.contentType))) {
        add({
          id: "admin-files",
          status: "fail",
          message: !hosted.version ? "admin-files.json missing — the admin was copied by hand or is incomplete." : missing.length ? `index.html references files of another build: ${missing.join(", ")}.` : `Admin bundle ${script} ${bundle.ok ? `served as "${bundle.contentType}" (must be JavaScript)` : `missing (${bundle.status})`}.`,
          fix: `\`agentcms deploy-admin --site ${site.alias}\` re-uploads a consistent build with the right content types.`
        });
      } else {
        add({ id: "admin-files", status: "ok", message: `Admin ${hosted.version}: files consistent, bundle served as JavaScript.` });
        add(
          compareVersions(hosted.version, info.version) >= 0 ? { id: "admin-version", status: "ok", message: `Admin ${hosted.version} is up to date.` } : { id: "admin-version", status: "warn", message: `Admin ${hosted.version} is older than ${info.version}.`, fix: `Offer \`agentcms deploy-admin --site ${site.alias}\`.` }
        );
      }
      const cfg = await fetchText(`${adminUrl}config.js`, f);
      try {
        if (!cfg.ok) throw new Error(cfg.error ?? `HTTP ${cfg.status}`);
        const runtime = parseConfigJs(cfg.text);
        const secrets = findSecretKeys(runtime);
        if (secrets.length) {
          add({ id: "config-js", status: "fail", message: `config.js publishes secrets: ${secrets.join(", ")}.`, fix: "Revoke those keys now, then redeploy the admin (config.js is regenerated without secrets)." });
        } else if (!runtime || runtime.backend !== site.runtime.backend) {
          add({ id: "config-js", status: "fail", message: `config.js backend is ${String(runtime?.backend ?? "empty")}, expected ${site.runtime.backend}.`, fix: `\`agentcms deploy-admin --site ${site.alias}\`.` });
        } else {
          add({ id: "config-js", status: "ok", message: `config.js: ${site.runtime.backend}, no secrets.` });
        }
      } catch (err) {
        add({ id: "config-js", status: "fail", message: `config.js unreadable: ${err.message}.`, fix: `\`agentcms deploy-admin --site ${site.alias}\`.` });
      }
    }
  }
  if (site.runtime.backend === "sqlite-file") {
    const path = site.runtime.sqlite.path;
    const db = await fetchText(`${siteUrl}/${path}`, f);
    if (!db.ok) add({ id: "database-exposure", status: "ok", message: `Database not served by the public site (${db.status || db.error}).` });
    else if (db.text.startsWith("ACMSENC1")) add({ id: "database-exposure", status: "ok", message: "Database served publicly but encrypted." });
    else
      add({
        id: "database-exposure",
        status: "fail",
        message: `Anyone can download the unencrypted database at ${siteUrl}/${path} (drafts, settings).`,
        fix: "Turn on encryption (reinstall with data.encryption, or store the database in a separate private location) and block the path at the host if possible."
      });
  }
  for (const [role, account] of Object.entries(site.credentials)) {
    if (!account) continue;
    add(
      getCredential(account) ? { id: `credential-${role}`, status: "ok", message: `${role} credential ${account} stored.` } : { id: `credential-${role}`, status: "warn", message: `${role} credential ${account} is not stored on this computer.`, fix: `Ask the user to run \`agentcms credentials set ${account}\`.` }
    );
  }
  const s = site.hosting.settings;
  const hostingCred = site.credentials.hosting ? getCredential(site.credentials.hosting) : null;
  if (site.hosting.connectorId === "git-pages" && s.provider === "github" && (s.host ?? "github-pages") === "github-pages" && hostingCred) {
    const api = String(s.apiBaseUrl || "https://api.github.com").replace(/\/+$/, "");
    try {
      const res = await f(`${api}/repos/${s.owner}/${s.repo}/pages`, {
        headers: { Authorization: `Bearer ${hostingCred.values.token}`, Accept: "application/vnd.github+json" },
        signal: AbortSignal.timeout(15e3)
      });
      if (res.ok) add({ id: "github-pages", status: "ok", message: `GitHub Pages enabled for ${s.owner}/${s.repo}.` });
      else if (res.status === 404)
        add({
          id: "github-pages",
          status: "fail",
          message: `GitHub Pages is not enabled for ${s.owner}/${s.repo}.`,
          fix: `https://github.com/${s.owner}/${s.repo}/settings/pages → Source: Deploy from a branch → ${String(s.branch ?? "main")} / root. (Free plans need a public repo.)`
        });
      else add({ id: "github-pages", status: "warn", message: `Could not read the Pages settings (HTTP ${res.status}) — the token may lack the Pages permission.` });
    } catch (err) {
      add({ id: "github-pages", status: "warn", message: `Could not reach the GitHub API: ${err.message}.` });
    }
  }
  if (opts.deep && (site.runtime.backend === "sqlite-file" || site.runtime.backend === "markdown-git")) {
    try {
      installBrowserEnv();
      const { openSiteStore } = await import("./chunks/siteData-DWZHwmvt.mjs");
      const store = await openSiteStore(site);
      await store.ready();
      add({ id: "data-access", status: "ok", message: `Content readable (${store.list("posts").length} posts and pages).` });
    } catch (err) {
      const { CliError: CliError2 } = await Promise.resolve().then(() => output);
      const reason = err.name === "SqlitePassphraseError" ? err.reason : null;
      add({
        id: "data-access",
        status: "fail",
        message: reason === "wrong" ? "Wrong passphrase: the database can't be decrypted." : reason === "missing" ? "The database is encrypted and no passphrase credential is recorded." : `Content not readable: ${err.message}`,
        fix: err instanceof CliError2 && err.hint ? err.hint : `Check the site's credentials (\`agentcms site show ${site.alias}\`), store the right secret with \`! agentcms credentials set <account>\`, attach it with \`agentcms site credentials ${site.alias} …\`.`
      });
    }
  }
  if (opts.deep) {
    if (!hostingCred) {
      add({ id: "hosting-access", status: "skip", message: "No hosting credential to test." });
    } else {
      installBrowserEnv();
      const { testStorageConnection } = await import("./chunks/registry-Df5_x1nj.mjs").then((n) => n.z);
      const res = await testStorageConnection(site.hosting.connectorId, { ...site.hosting.settings, ...hostingCred.values });
      add(
        res.ok ? { id: "hosting-access", status: "ok", message: `Hosting writable: ${res.detail}.` } : { id: "hosting-access", status: "fail", message: `Hosting access failed: ${res.detail}.`, fix: "Check the credential's permissions / expiry, then `agentcms credentials set` it again." }
      );
    }
  }
  return checks;
}
const doctorCommand = {
  name: "doctor",
  summary: "Health check of a site (--deep also opens the content and tests write access): HTTPS, home page, pending deployment (served home vs the hosting's), theme assets, hosted admin (consistent build, JavaScript content type, version), config.js without secrets, stored credentials, GitHub Pages.",
  usage: "doctor [--site <alias>] [--deep]",
  options: [
    { name: "site", type: "string", description: "Site alias." },
    { name: "deep", type: "boolean", description: "Also test write access to the hosting (writes and deletes a probe file on file hosts)." }
  ],
  async run({ io, options }) {
    const site = resolveSite(options.site);
    const checks = await runDoctor(site, { deep: !!options.deep });
    const failed = checks.filter((c) => c.status === "fail").length;
    const warned = checks.filter((c) => c.status === "warn").length;
    printResult(
      io,
      { site: site.alias, healthy: failed === 0, failed, warned, checks },
      () => [
        `${site.alias} — ${failed ? `${failed} problem(s)` : "healthy"}${warned ? `, ${warned} warning(s)` : ""}`,
        ...checks.map((c) => `  [${c.status}] ${c.id}: ${c.message}${c.fix ? `
         fix: ${c.fix}` : ""}`)
      ].join("\n")
    );
    if (failed) return 1;
  }
};
function parseJsonOption(name, value) {
  if (value == null || value === "") return void 0;
  try {
    const parsed = JSON.parse(String(value));
    if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) return parsed;
  } catch {
  }
  throw new CliError("usage", `--${name} must be a JSON object.`, `Example: --${name} '{"key":"value"}'`, 2);
}
function list(value) {
  return value ? String(value).split(",").map((s) => s.trim()).filter(Boolean) : [];
}
async function loadAll(paths2) {
  const [{ readExtensionPackage, bundleSource }, { importExtensionBundle }] = await Promise.all([
    import("./chunks/extPackage-4FSerswt.mjs"),
    import("./chunks/extHost-DE9tKm2a.mjs")
  ]);
  const out = [];
  for (const p of paths2) {
    const pkg = await readExtensionPackage(p);
    const code = bundleSource(pkg);
    if (code == null) throw new CliError("no-bundle", `${p}: ${pkg.entry} not found.`, pkg.sourceType === "project" ? "Build it first (npm run build)." : void 0);
    const { manifest } = await importExtensionBundle(code);
    const m = manifest;
    if (!m || typeof m.id !== "string") throw new CliError("no-export", `${p}: the bundle exports no manifest.`, "Run `agentcms ext check` on it.");
    out.push({ kind: m.templates ? "theme" : "plugin", id: m.id, manifest: m, pkg });
  }
  return out;
}
async function check({ io, options, positionals }) {
  const target = positionals[1];
  if (!target) throw new CliError("usage", "ext check needs a path: the project folder, an unpacked package or the .zip.", void 0, 2);
  const kind = options.kind;
  if (kind && kind !== "plugin" && kind !== "theme") throw new CliError("usage", "--kind is plugin or theme.", void 0, 2);
  const { readExtensionPackage } = await import("./chunks/extPackage-4FSerswt.mjs");
  const { checkExtension } = await import("./chunks/extCheck-C9gAAP6I.mjs");
  const pkg = await readExtensionPackage(target);
  const report = await checkExtension(pkg, {
    kind,
    previewDir: options["keep-preview"] || options.out ? resolve(String(options["keep-preview"] || options.out)) : void 0
  });
  printResult(io, report, () => {
    const lines = [
      `${report.valid ? "PASS" : "FAIL"}  ${report.kind ?? "?"} ${report.id ?? "?"} ${report.version ?? ""} (apiVersion ${report.apiVersion ?? "?"}, admin API ${report.hostApi.version})`,
      ...report.errors.map((e) => `  error  [${e.code}] ${e.message}${e.hint ? `
         → ${e.hint}` : ""}`),
      ...report.warnings.map((w) => `  warn   [${w.code}] ${w.message}${w.hint ? `
         → ${w.hint}` : ""}`)
    ];
    if (report.registered) {
      const r = report.registered;
      const parts = [
        r.filters.length && `filters: ${r.filters.map((f) => f.hook).join(", ")}`,
        r.actions.length && `actions: ${r.actions.map((a) => a.hook).join(", ")}`,
        r.blocks.length && `blocks: ${r.blocks.join(", ")}`,
        r.dashboardCards.length && `dashboard cards: ${r.dashboardCards.join(", ")}`
      ].filter(Boolean);
      if (parts.length) lines.push(`  registers ${parts.join("; ")}`);
    }
    for (const b of report.blocks ?? []) {
      lines.push(`  block ${b.id}: stored as ${b.markdown ? JSON.stringify(b.markdown.slice(0, 90)) + (b.markdown.length > 90 ? "…" : "") : "(nothing)"}`);
    }
    if (report.output) {
      if (report.output.added.length) lines.push(`  adds ${report.output.added.length} file(s): ${report.output.added.slice(0, 12).join(", ")}${report.output.added.length > 12 ? ", …" : ""}`);
      if (report.output.changed.length) lines.push(`  changes ${report.output.changed.length} file(s): ${report.output.changed.slice(0, 12).join(", ")}${report.output.changed.length > 12 ? ", …" : ""}`);
      for (const st of report.output.lifecycle ?? []) {
        const parts = [
          st.added.length && `adds ${st.added.join(", ")}`,
          st.changed.length && `changes ${st.changed.join(", ")}`,
          st.removed.length && `removes ${st.removed.join(", ")}`
        ].filter(Boolean);
        lines.push(`  on ${st.step}: ${parts.length ? parts.join("; ") : "nothing of its own"}`);
      }
      if (report.output.previewDir) lines.push(`  demo site kept in ${report.output.previewDir}`);
    }
    return lines.join("\n");
  });
  return report.valid ? 0 : 1;
}
async function freePort(from) {
  const { createServer: createServer2 } = await import("node:net");
  for (let p = from; p < from + 50; p++) {
    const free = await new Promise((resolve2) => {
      const srv = createServer2();
      srv.once("error", () => resolve2(false));
      srv.listen(p, "127.0.0.1", () => srv.close(() => resolve2(true)));
    });
    if (free) return p;
  }
  return from;
}
async function preview({ io, options, positionals }) {
  const paths2 = positionals.slice(1);
  const exts = await loadAll(paths2);
  const { renderPreview } = await import("./chunks/extPreview-DBjmr0_2.mjs");
  const port = options.port !== void 0 ? Number(options.port) : await freePort(4321);
  if (!Number.isInteger(port) || port < 1 || port > 65535) throw new CliError("usage", `Invalid port: ${options.port}`, void 0, 2);
  const outDir = resolve(String(options.out ?? join(tmpdir(), `agentcms-preview-${exts.map((e) => e.id).join("+") || "default"}`)));
  let content;
  let siteAlias;
  let siteTheme = null;
  if (options.site) {
    const { snapshotSiteContent } = await import("./chunks/extSiteContent-BVfMHUhY.mjs");
    const snap = await snapshotSiteContent(String(options.site));
    content = snap.content;
    siteAlias = snap.alias;
    if (snap.themeBundle && !exts.some((e) => e.kind === "theme") && !options.theme) {
      const { importExtensionBundle } = await import("./chunks/extHost-DE9tKm2a.mjs");
      const { manifest } = await importExtensionBundle(snap.themeBundle);
      const m = manifest;
      if (m?.id && m.templates) siteTheme = { kind: "theme", id: m.id, manifest: m };
    }
  }
  const rawBase = options["base-path"] ? String(options["base-path"]) : "";
  if (rawBase && !/^\/?[a-z0-9._~-]+(?:\/[a-z0-9._~-]+)*\/?$/i.test(rawBase)) {
    throw new CliError("usage", `Invalid --base-path "${rawBase}".`, "Example: --base-path /blog", 2);
  }
  const basePath = rawBase ? "/" + rawBase.replace(/^\/+|\/+$/g, "") : "";
  const baseUrl = `http://localhost:${port}${basePath}`;
  if (options.home && options.home !== "blocks") throw new CliError("usage", `--home takes "blocks".`, `Use --settings '{"homeMode":"static-page","homePageId":"page-about"}' for another page.`, 2);
  if (options.demo && options.demo !== "empty" && options.demo !== "full") throw new CliError("usage", `--demo is "full" or "empty".`, void 0, 2);
  const res = await renderPreview({
    outDir,
    baseUrl,
    extensions: [...exts.map(({ kind, id, manifest }) => ({ kind, id, manifest })), ...siteTheme ? [siteTheme] : []],
    themeId: options.theme ?? siteTheme?.id,
    enablePlugins: list(options.enable),
    themeConfig: parseJsonOption("theme-config", options["theme-config"]),
    pluginConfigs: parseJsonOption("plugin-configs", options["plugin-configs"]),
    settings: parseJsonOption("settings", options.settings),
    content,
    blockPage: true,
    home: options.home === "blocks" ? "blocks" : void 0,
    demo: options.demo === "empty" ? "empty" : "full"
  });
  let server = null;
  let screenshots = null;
  if (options.screenshots || options.serve) {
    const { startAdminServer: startAdminServer2 } = await Promise.resolve().then(() => serve);
    try {
      server = await startAdminServer2(res.outDir, "127.0.0.1", port, basePath);
    } catch (e) {
      if (e.code === "EADDRINUSE") throw new CliError("port-busy", `Port ${port} is in use.`, "Pass --port <n> (links in the preview use that port).");
      throw e;
    }
  }
  if (options.screenshots) {
    const { screenshotPages, setScreenshotColorScheme } = await import("./chunks/extScreenshot-X5xiH1-8.mjs");
    setScreenshotColorScheme(options["color-scheme"]);
    screenshots = await screenshotPages(baseUrl, res.pages, join(res.outDir, ".screenshots"), options["screenshot-js"] ? String(options["screenshot-js"]) : void 0, options["max-height"] ? Number(options["max-height"]) : void 0);
  }
  const data = {
    ...res,
    site: siteAlias ?? null,
    url: options.serve ? `${baseUrl}/` : null,
    screenshots: screenshots ? { browser: screenshots.browser, files: screenshots.shots, errors: screenshots.errors, ...screenshots.browser ? {} : { hint: "No Chrome / Chromium / Edge found; set CHROME_PATH." } } : null
  };
  if (!options.serve && server) await new Promise((r) => server.close(() => r()));
  printResult(
    io,
    data,
    () => [
      `Preview of ${res.themeId}${res.plugins.length ? ` + ${res.plugins.join(", ")}` : ""}: ${res.files.length} files in ${res.outDir}`,
      ...Object.entries(res.pages).filter(([, p]) => p).map(([k, p]) => `  ${k.padEnd(9)} ${p}`),
      ...res.issues.map((i) => `  ${i.level}  ${i.message}`),
      ...res.notes.map((n) => `  note  ${n}`),
      ...screenshots?.shots.map((s) => `  screenshot ${s.file}`) ?? [],
      ...screenshots && !screenshots.browser ? ["  (no Chrome / Chromium / Edge found for screenshots; set CHROME_PATH)"] : [],
      options.serve ? `Serving at ${baseUrl}/ — Ctrl+C to stop.` : ""
    ].filter(Boolean).join("\n")
  );
  if (options.serve && server) {
    await new Promise((r) => {
      const stop = () => server.close(() => r());
      process.once("SIGINT", stop);
      process.once("SIGTERM", stop);
    });
  }
  return res.issues.some((i) => i.level === "error") ? 1 : 0;
}
async function pack({ io, options, positionals }) {
  const target = positionals[1] ?? ".";
  const { readExtensionPackage } = await import("./chunks/extPackage-4FSerswt.mjs");
  const { writeExtensionZip } = await import("./chunks/extZip-Cl-j_KR5.mjs");
  const pkg = await readExtensionPackage(target);
  if (pkg.sourceType === "zip") throw new CliError("usage", "ext pack takes a project or unpacked folder, not a .zip.", void 0, 2);
  if (!pkg.manifest?.id) throw new CliError("manifest-id", "manifest.json has no id.");
  if (!pkg.files.has(pkg.entry)) throw new CliError("no-bundle", `${pkg.entry} not found.`, pkg.sourceType === "project" ? "Build first: `vite build` (the bundle goes to dist/)." : void 0);
  const out = resolve(String(options.out ?? join(pkg.source, `${pkg.manifest.id}.zip`)));
  mkdirSync(dirname(out), { recursive: true });
  const bytes = await writeExtensionZip(pkg.files);
  writeFileSync(out, bytes);
  const files = [...pkg.files.keys()].sort();
  printResult(io, { zip: out, bytes: bytes.length, files }, () => `Packed ${basename(out)} (${files.length} files, ${(bytes.length / 1024).toFixed(1)} KB): ${files.join(", ")}`);
}
async function scaffold({ io, options, positionals }) {
  const [, kind, id] = positionals;
  if (kind !== "plugin" && kind !== "theme") throw new CliError("usage", "ext new needs plugin or theme, then an id: ext new theme my-theme", void 0, 2);
  if (!id) throw new CliError("usage", `ext new ${kind} needs an id (lower-case, dashes), e.g. ext new ${kind} my-${kind}.`, void 0, 2);
  const { scaffoldExtension } = await import("./chunks/extScaffold-eHk76S2a.mjs");
  const dir = resolve(String(options.dir ?? id));
  if (existsSync(dir) && (await import("node:fs")).readdirSync(dir).length > 0 && !options.force) {
    throw new CliError("dir-not-empty", `${dir} already exists and is not empty.`, "Pick another --dir (or --force to write into it).", 2);
  }
  const res = scaffoldExtension({
    kind,
    id,
    dir,
    name: options.name,
    description: options.description,
    author: options.author,
    features: list(options.with)
  });
  printResult(io, res, () => [`Created ${kind} "${id}" in ${dir}:`, ...res.files.map((f) => `  ${f}`), "", ...res.next].join("\n"));
}
async function install(ctx) {
  const { installExtensionCommand } = await import("./chunks/extInstall-BZIDL3Np.mjs");
  return installExtensionCommand(ctx);
}
const extCommand = {
  name: "ext",
  summary: "Build, test and ship plugins and themes: new <plugin|theme> <id> (scaffold a project), check <path> (validate + render a demo site, exit 1 on errors), preview <path…> (render a full demo site locally; --serve, --screenshots, --site <alias> for a site's real content), pack <project> (ZIP for the admin's Install button), install <zip> --site <alias> (upload to a site; plan first, --yes to apply), list --site <alias>, uninstall <id> --site <alias>.",
  usage: "ext new <plugin|theme> <id> [--with <features>] [--dir <path>] [--name <name>] [--description <text>] [--author <name>] [--force] | ext check <path> [--kind <plugin|theme>] [--out <dir>] | ext preview <path…> [--theme <id>] [--enable <ids>] [--settings <json>] [--theme-config <json>] [--plugin-configs <json>] [--site <alias>] [--out <dir>] [--port <n>] [--base-path </dir>] [--home blocks] [--demo empty] [--screenshots] [--screenshot-js <code>] [--max-height <px>] [--color-scheme light|dark] [--serve] | ext pack <project> [--out <zip>] | ext install <zip|folder> --site <alias> [--activate] [--no-regenerate] [--yes] | ext list --site <alias> | ext uninstall <id> --site <alias> [--yes]",
  options: [
    { name: "dir", type: "string", description: "new: target folder (default: ./<id>)." },
    { name: "name", type: "string", description: "new: display name." },
    { name: "description", type: "string", description: "new: one-sentence description." },
    { name: "author", type: "string", description: "new: author shown in the admin." },
    { name: "with", type: "string", description: "new: optional parts, comma-separated — plugins: settings, block, i18n, dashboard-card; themes: settings, block (themes always include a menu loader)." },
    { name: "force", type: "boolean", description: "new: write into a non-empty folder." },
    { name: "kind", type: "string", description: "check: expected kind (plugin or theme)." },
    { name: "keep-preview", type: "string", description: "check: keep the rendered demo site in this folder (--out works too)." },
    { name: "out", type: "string", description: "preview: output folder (default: a temp folder). pack: ZIP path (default: <project>/<id>.zip)." },
    { name: "theme", type: "string", description: 'preview: theme to activate (default: the theme given, else "default").' },
    { name: "enable", type: "string", description: "preview: also enable these bundled plugins (comma-separated ids, e.g. core-seo,agentcms-sitemaps)." },
    { name: "theme-config", type: "string", description: "preview: JSON merged into the theme's config." },
    { name: "plugin-configs", type: "string", description: "preview: JSON { <plugin-id>: config } merged into plugin configs." },
    { name: "settings", type: "string", description: 'preview: JSON merged into the site settings (e.g. {"language":"fr"}).' },
    { name: "serve", type: "boolean", description: "preview: keep serving the site on http://localhost:<port>/ until stopped." },
    { name: "port", type: "string", description: "preview: port used in links and by --serve (default 4321)." },
    { name: "base-path", type: "string", description: "preview: render and serve the site as if hosted in a sub-folder, e.g. /blog (tests base-path handling)." },
    { name: "home", type: "string", description: 'preview: "blocks" makes the block test page (every editor block) the static home page — to design a landing page.' },
    { name: "demo", type: "string", description: 'preview: "empty" renders the demo site without posts or menus (empty states); default "full".' },
    { name: "screenshot-js", type: "string", description: "preview: JavaScript run in every page before its screenshot (after load), e.g. to click a consent button or open the menu. Async code is awaited." },
    { name: "screenshots", type: "boolean", description: "preview: PNG screenshots (desktop + mobile) of each kind of page with a local Chrome/Chromium/Edge." },
    { name: "site", type: "string", description: "preview: render a registered site's real content (read-only copy). install/list/uninstall: the site." },
    { name: "color-scheme", type: "string", description: "screenshots: prefers-color-scheme of the captures, light (default) or dark." },
    { name: "max-height", type: "string", description: "preview --screenshots: cap each capture's height in CSS px (default: the whole page, up to 6000)." },
    { name: "activate", type: "boolean", description: "install: also activate it (theme: make it the active theme; plugin: enable it), then regenerate the whole site." },
    { name: "no-regenerate", type: "boolean", description: "install: don't regenerate the site (by default it is regenerated when the package is activated, or upgrades the active theme / an enabled plugin)." },
    { name: "yes", type: "boolean", description: "install/uninstall: apply (without it, only print the plan)." }
  ],
  async run(ctx) {
    const action = ctx.positionals[0];
    switch (action) {
      case "check":
        return check(ctx);
      case "preview":
        return preview(ctx);
      case "pack":
        return pack(ctx);
      case "new":
        return scaffold(ctx);
      case "install":
      case "list":
      case "uninstall":
        return install(ctx);
      default:
        throw new CliError("usage", action ? `Unknown ext action "${action}".` : "ext needs an action.", "Actions: new, check, preview, pack, install, list, uninstall.", 2);
    }
  }
};
function kindOption(v, fallback) {
  if (v === void 0) return fallback;
  if (v === "post" || v === "page") return v;
  throw new CliError("usage", `--type is post or page (got "${String(v)}").`, void 0, 2);
}
async function allEntries$3() {
  const { fetchAllPosts, invalidateAllPostsCache } = await import("./chunks/posts-D28k7tn_.mjs");
  invalidateAllPostsCache();
  const [posts, pages2] = await Promise.all([fetchAllPosts({ type: "post" }), fetchAllPosts({ type: "page" })]);
  return [...posts, ...pages2];
}
async function summarize$3(p, terms) {
  const { iso } = await import("./chunks/adminCommon-DK5a9uhY.mjs");
  const cat = p.primaryTermId ? terms.find((t) => t.id === p.primaryTermId) : void 0;
  return {
    id: p.id,
    type: p.type,
    title: p.title,
    slug: p.slug,
    status: p.status,
    category: cat ? cat.slug : null,
    tags: p.termIds.map((id) => terms.find((t) => t.id === id)).filter((t) => !!t && t.type === "tag").map((t) => t.slug),
    path: p.lastPublishedPath ?? null,
    // Translations (agentcms-multilang): published path per language.
    ...p.lastPublishedPathsByLocale && Object.keys(p.lastPublishedPathsByLocale).length ? { localePaths: p.lastPublishedPathsByLocale } : {},
    updatedAt: iso(p.updatedAt),
    publishedAt: iso(p.publishedAt)
  };
}
async function readFields$1(options) {
  const { readTextOption, readJsonOption, listOption, dateOption } = await import("./chunks/adminCommon-DK5a9uhY.mjs");
  const data = readJsonOption(options.data, "data") ?? {};
  if (typeof data !== "object" || Array.isArray(data)) throw new CliError("usage", "--data must be a JSON object.", void 0, 2);
  const str = (v) => typeof v === "string" ? v : void 0;
  const f = {
    title: str(options.title) ?? str(data.title),
    slug: str(options.slug) ?? str(data.slug),
    body: readTextOption(options.body, "body") ?? str(data.body) ?? str(data.contentMarkdown),
    author: str(options.author) ?? str(data.author) ?? str(data.authorId)
  };
  const excerpt = options.excerpt !== void 0 ? String(options.excerpt) : data.excerpt;
  if (excerpt !== void 0) f.excerpt = excerpt === null || excerpt === "" ? null : String(excerpt);
  const category = options.category !== void 0 ? String(options.category) : data.category;
  if (category !== void 0) f.category = category === null || category === "" ? null : String(category);
  const tags = listOption(options.tags) ?? (Array.isArray(data.tags) ? data.tags.map(String) : void 0);
  if (tags) f.tags = tags;
  const hero = options.hero !== void 0 ? String(options.hero) : data.hero ?? data.heroMediaId;
  if (hero !== void 0) f.hero = hero === null || hero === "" ? null : String(hero);
  const seo = { ...data.seo ?? {} };
  if (options["seo-title"] !== void 0) seo.title = String(options["seo-title"]);
  if (options["seo-description"] !== void 0) seo.description = String(options["seo-description"]);
  if (options["seo-image"] !== void 0) seo.ogImage = String(options["seo-image"]);
  if (Object.keys(seo).length) f.seo = Object.fromEntries(Object.entries(seo).filter(([, v]) => v !== "" && v != null));
  f.createdAt = dateOption(options["created-at"] ?? data.createdAt, "created-at");
  f.publishedAt = dateOption(options["published-at"] ?? data.publishedAt, "published-at");
  return f;
}
async function resolveTerms(f, existing, createMissing, type) {
  const { fetchAllTerms, createTerm } = await import("./chunks/taxonomies-D8XKYfUh.mjs");
  const { findTerm } = await import("./chunks/adminCommon-DK5a9uhY.mjs");
  const { slugify, findAvailableSlug } = await import("./chunks/slug-CZzRNKy4.mjs");
  let terms = await fetchAllTerms();
  const createdTerms = [];
  const ensure = async (ref, t) => {
    const found = findTerm(terms, ref, t);
    if (found) return found;
    if (!createMissing) {
      throw new CliError("not-found", `No ${t} "${ref}".`, `Create it (\`agentcms terms create --type ${t} --name "${ref}"\`) or pass --create-terms.`, 2);
    }
    const base = slugify(ref) || t;
    const slug = findAvailableSlug(base, (s) => terms.some((x) => x.type === t && x.slug === s));
    await createTerm({ type: t, name: ref, slug });
    createdTerms.push({ type: t, name: ref, slug });
    terms = await fetchAllTerms();
    return findTerm(terms, slug, t);
  };
  if (type === "page" && (f.category || f.tags && f.tags.length)) {
    throw new CliError("usage", "Pages have no category or tags.", void 0, 2);
  }
  let primary = existing?.primaryTermId ?? void 0;
  let tagIds = (existing?.termIds ?? []).filter((id) => terms.find((t) => t.id === id)?.type === "tag");
  if (f.category !== void 0) primary = f.category === null ? void 0 : (await ensure(f.category, "category")).id;
  if (f.tags !== void 0) {
    tagIds = [];
    for (const tag of f.tags) tagIds.push((await ensure(tag, "tag")).id);
  }
  const termIds = primary ? [primary, ...tagIds.filter((id) => id !== primary)] : tagIds;
  return { primaryTermId: primary, termIds, terms, createdTerms };
}
async function checkSlug$1(slug, type, primaryTermId, ignoreId, all, terms) {
  const { isValidSlug, buildPostUrl, detectPathCollision } = await import("./chunks/slug-CZzRNKy4.mjs");
  if (!isValidSlug(slug)) throw new CliError("invalid-slug", `Invalid slug "${slug}".`, "Lower-case letters, digits and single dashes (e.g. my-post).", 2);
  const term = primaryTermId ? terms.find((t) => t.id === primaryTermId) : void 0;
  const path = buildPostUrl({ post: { type, slug }, primaryTerm: term });
  const owner = detectPathCollision(path, all.filter((p) => p.type === "post"), all.filter((p) => p.type === "page"), terms, ignoreId);
  if (owner) throw new CliError("slug-taken", `${path} is already used by ${owner.kind} "${owner.label}".`, "Pick another --slug.", 2);
}
async function resolveMediaId(ref) {
  const { listAllMedia } = await import("./chunks/media-9UyLuwBC.mjs").then((n) => n.n);
  const media = await listAllMedia();
  const m = media.find((x) => x.id === ref) ?? media.find((x) => x.name === ref);
  if (!m) throw new CliError("not-found", `No media "${ref}".`, "Upload it first (`agentcms media upload <file>`) and use its id.", 2);
  return m.id;
}
async function resolveAuthor(ref) {
  const { subscribeToUsers } = await import("./chunks/users-Cm3m3K0y.mjs").then((n) => n.u);
  const users = await new Promise((res, rej) => {
    const un = subscribeToUsers((u2) => {
      res(u2);
      queueMicrotask(() => un());
    }, rej);
  });
  const u = users.find((x) => x.id === ref) ?? users.find((x) => x.email?.toLowerCase() === ref.toLowerCase());
  if (!u) throw new CliError("not-found", `No user "${ref}".`, "List them with `agentcms users list`.", 2);
  return u.id;
}
function decodeB64Json(v) {
  try {
    return JSON.parse(Buffer.from(v, "base64").toString("utf8"));
  } catch {
    return null;
  }
}
function encodeB64Json(v) {
  return Buffer.from(JSON.stringify(v), "utf8").toString("base64");
}
async function run$c({ io, options, positionals }) {
  const [action, ...refs] = positionals;
  const { runAdmin, findPost, currentUserId, menuReferences, menuRemoveHints, pathMoves, reportStaleLinks } = await import("./chunks/adminCommon-DK5a9uhY.mjs");
  const alias = options.site;
  const type = kindOption(options.type);
  switch (action) {
    case "list":
      return runAdmin(io, alias, {}, async () => {
        const terms = await (await import("./chunks/taxonomies-D8XKYfUh.mjs")).fetchAllTerms();
        let all = await allEntries$3();
        if (type) all = all.filter((p) => p.type === type);
        if (options.status) all = all.filter((p) => p.status === options.status);
        if (options.category) {
          const { requireTerm } = await import("./chunks/adminCommon-DK5a9uhY.mjs");
          const cat = requireTerm(terms, String(options.category), "category");
          all = all.filter((p) => p.primaryTermId === cat.id);
        }
        if (options.search) {
          const tokens = String(options.search).toLowerCase().split(/\s+/).filter(Boolean);
          all = all.filter((p) => tokens.every((t) => `${p.title} ${p.slug} ${p.excerpt ?? ""}`.toLowerCase().includes(t)));
        }
        return Promise.all(all.map((p) => summarize$3(p, terms)));
      }, (rows) => rows.length ? rows.map((r) => `${r.id}  ${r.type.padEnd(4)} ${r.status.padEnd(6)} ${r.title}${r.path ? `  → ${r.path}` : ""}`).join("\n") : "No entries.");
    case "get": {
      if (!refs[0]) throw new CliError("usage", "content get needs an id or slug.", void 0, 2);
      return runAdmin(io, alias, {}, async () => {
        const terms = await (await import("./chunks/taxonomies-D8XKYfUh.mjs")).fetchAllTerms();
        const p = findPost(await allEntries$3(), refs[0], type);
        const { iso } = await import("./chunks/adminCommon-DK5a9uhY.mjs");
        return {
          ...await summarize$3(p, terms),
          excerpt: p.excerpt ?? null,
          heroMediaId: p.heroMediaId ?? null,
          authorId: p.authorId,
          seo: p.seo ?? null,
          createdAt: iso(p.createdAt),
          translations: p.translations ?? null,
          body: p.contentMarkdown
        };
      }, (r) => `${r.title} (${r.type}, ${r.status})

${r.body}`);
    }
    case "create": {
      const kind = kindOption(options.type, "post");
      const f = await readFields$1(options);
      if (!f.title) throw new CliError("usage", "content create needs --title.", void 0, 2);
      return runAdmin(io, alias, { write: true, hosting: !!options.publish, extensions: !!options.publish, lock: true }, async (s) => {
        const { slugify, findAvailableSlug, buildPostUrl } = await import("./chunks/slug-CZzRNKy4.mjs");
        const all = await allEntries$3();
        const heroMediaId = f.hero ? await resolveMediaId(f.hero) : void 0;
        const authorId = f.author ? await resolveAuthor(f.author) : await currentUserId();
        const { primaryTermId, termIds, terms, createdTerms } = await resolveTerms(f, null, !!options["create-terms"], kind);
        let slug = f.slug;
        if (slug) await checkSlug$1(slug, kind, primaryTermId, void 0, all, terms);
        else {
          const term = primaryTermId ? terms.find((t) => t.id === primaryTermId) : void 0;
          const { detectPathCollision } = await import("./chunks/slug-CZzRNKy4.mjs");
          slug = findAvailableSlug(
            slugify(f.title) || kind,
            (cand) => !!detectPathCollision(buildPostUrl({ post: { type: kind, slug: cand }, primaryTerm: term }), all.filter((p) => p.type === "post"), all.filter((p) => p.type === "page"), terms)
          );
        }
        const { createPost } = await import("./chunks/posts-D28k7tn_.mjs");
        const id = await createPost({
          type: kind,
          title: f.title,
          slug,
          contentMarkdown: f.body ?? "",
          excerpt: f.excerpt ?? void 0,
          heroMediaId,
          authorId,
          termIds,
          primaryTermId,
          seo: f.seo,
          createdAt: f.createdAt,
          publishedAt: f.publishedAt
        });
        let published = null;
        if (options.publish) {
          const ctx = await s.context();
          await s.host.publisher.publishPost(id, ctx, s.log, f.publishedAt ? { publishedAt: f.publishedAt } : void 0);
          published = (await allEntries$3()).find((p) => p.id === id)?.lastPublishedPath ?? null;
        }
        return { id, type: kind, slug, status: options.publish ? "online" : "draft", path: published, createdTerms };
      }, (r) => `Created ${r.type} ${r.id} (${r.slug}) — ${r.status}${r.path ? ` at ${r.path}` : ""}`);
    }
    case "update": {
      if (!refs[0]) throw new CliError("usage", "content update needs an id or slug.", void 0, 2);
      const f = await readFields$1(options);
      const lang = options.lang;
      return runAdmin(io, alias, { write: true, hosting: true, extensions: true, lock: true }, async (s) => {
        const all = await allEntries$3();
        const p = findPost(all, refs[0], type);
        const { updatePost } = await import("./chunks/posts-D28k7tn_.mjs");
        let createdTerms = [];
        if (lang && options.remove) {
          if (!p.translations?.[lang]) throw new CliError("not-found", `${p.title} has no ${lang} translation.`, void 0, 2);
          const rest = { ...p.translations ?? {} };
          delete rest[lang];
          await updatePost(p.id, { translations: rest });
        } else if (lang) {
          const tr = { ...p.translations?.[lang] ?? {} };
          if (f.title !== void 0) tr.title = f.title;
          if (f.slug !== void 0) tr.slug = f.slug;
          if (f.body !== void 0) tr.contentMarkdown = f.body;
          if (f.excerpt !== void 0) tr.excerpt = f.excerpt ?? void 0;
          if (f.seo !== void 0) tr.seo = f.seo;
          if (!tr.title) throw new CliError("usage", `The ${lang} translation needs a --title.`, void 0, 2);
          const { isValidSlug, slugify } = await import("./chunks/slug-CZzRNKy4.mjs");
          if (!tr.slug) tr.slug = slugify(String(tr.title));
          if (!isValidSlug(String(tr.slug))) throw new CliError("invalid-slug", `Invalid slug "${tr.slug}".`, void 0, 2);
          await updatePost(p.id, { translations: { ...p.translations ?? {}, [lang]: tr } });
          if (p.type === "post" && p.primaryTermId) {
            const cat = (await s.terms()).find((t) => t.id === p.primaryTermId);
            const catTr = cat?.translations?.[lang];
            if (cat && !catTr?.slug && !catTr?.name) {
              s.warnings.push(`Its category "${cat.name}" has no ${lang} translation, so this ${lang} version is not published. Translate the category first: \`agentcms terms update ${cat.slug} --lang ${lang} --name "…" --slug "…" --site ${s.site.alias}\`, then republish.`);
            }
          }
        } else {
          const heroMediaId = f.hero === void 0 ? void 0 : f.hero === null ? null : await resolveMediaId(f.hero);
          const authorId = f.author ? await resolveAuthor(f.author) : void 0;
          const resolved = await resolveTerms(f, p, !!options["create-terms"], p.type);
          createdTerms = resolved.createdTerms;
          const { primaryTermId, termIds, terms } = resolved;
          const slug = f.slug ?? p.slug;
          if (f.slug !== void 0 || f.category !== void 0) await checkSlug$1(slug, p.type, primaryTermId, p.id, all, terms);
          await updatePost(p.id, {
            title: f.title,
            slug: f.slug,
            contentMarkdown: f.body,
            excerpt: f.excerpt,
            heroMediaId,
            termIds: f.category !== void 0 || f.tags !== void 0 ? termIds : void 0,
            primaryTermId: f.category !== void 0 ? primaryTermId ?? null : void 0,
            seo: f.seo ? { ...p.seo ?? {}, ...f.seo } : void 0,
            authorId,
            createdAt: f.createdAt,
            publishedAt: f.publishedAt
          });
        }
        let republished = false;
        if (p.status === "online" && !options["no-publish"]) {
          const ctx = await s.context();
          await s.host.publisher.publishPost(p.id, ctx, s.log, f.publishedAt && !lang ? { publishedAt: f.publishedAt } : void 0);
          republished = true;
        }
        const fresh = await allEntries$3();
        const after = fresh.find((x) => x.id === p.id);
        const staleLinks = reportStaleLinks(s, pathMoves([p], fresh));
        return { id: p.id, type: p.type, status: after.status, republished, path: after.lastPublishedPath ?? null, localePaths: after.lastPublishedPathsByLocale ?? {}, lang: lang ?? null, createdTerms, staleLinks };
      }, (r) => `Updated ${r.type} ${r.id}${r.lang ? ` (${r.lang})` : ""}${r.republished ? ` — republished at ${r.path}` : ""}`);
    }
    case "publish":
    case "unpublish": {
      if (!refs.length) throw new CliError("usage", `content ${action} needs one or more ids / slugs.`, void 0, 2);
      return runAdmin(io, alias, { write: true, hosting: true, extensions: true, lock: true }, async (s) => {
        const all = await allEntries$3();
        const targets = refs.map((r) => findPost(all, r, type));
        const ctx = await s.context();
        const pub = s.host.publisher;
        const done = [];
        const one = async (p) => {
          try {
            if (action === "publish") await pub.publishPost(p.id, ctx, s.log, options["published-at"] ? { publishedAt: new Date(String(options["published-at"])) } : void 0);
            else await pub.unpublishPost(p.id, ctx, s.log);
            done.push({ id: p.id, title: p.title, ok: true });
          } catch (err) {
            done.push({ id: p.id, title: p.title, ok: false, error: err.message });
          }
        };
        if (targets.length === 1) await one(targets[0]);
        else {
          const { withStorageBatch } = await import("./chunks/siteFiles-BbBoVJww.mjs").then((n) => n.s);
          await withStorageBatch(async () => {
            ctx.bulkMode = true;
            for (const p of targets) await one(p);
            const { listRegenerationTargets } = await import("./chunks/regenerationTargetRegistry-3NmN64mg.mjs");
            await pub.flushBulkRegeneration(ctx, s.log, listRegenerationTargets());
          });
        }
        const fresh = await allEntries$3();
        reportStaleLinks(s, pathMoves(targets, fresh));
        return done.map((d) => {
          const p = fresh.find((x) => x.id === d.id);
          return { ...d, status: p?.status, path: p?.lastPublishedPath ?? null, localePaths: p?.lastPublishedPathsByLocale ?? {} };
        });
      }, (rows) => rows.map((r) => `${r.ok ? "✓" : "✗"} ${r.title} — ${r.ok ? r.status + (r.path ? ` at ${r.path}` : "") : r.error}`).join("\n"));
    }
    case "delete": {
      if (!refs.length) throw new CliError("usage", "content delete needs one or more ids / slugs.", void 0, 2);
      if (!options.yes) {
        return runAdmin(io, alias, {}, async (s) => {
          const all = await allEntries$3();
          const targets = refs.map((r) => findPost(all, r, type));
          const menuItems = menuReferences(s.settings(), "post", targets.map((p) => p.id));
          return {
            needsConfirmation: true,
            delete: targets.map((p) => ({ id: p.id, type: p.type, title: p.title, status: p.status, path: p.lastPublishedPath ?? null })),
            menuItems,
            notes: menuRemoveHints(s.site.alias, menuItems)
          };
        }, (r) => [`Would delete ${r.delete.length} entr${r.delete.length === 1 ? "y" : "ies"}: ${r.delete.map((d) => d.title).join(", ")} (published files removed too).`, ...r.notes, "Nothing changed — re-run with --yes once the user agrees."].join(" "));
      }
      return runAdmin(io, alias, { write: true, hosting: true, extensions: true, lock: true }, async (s) => {
        const all = await allEntries$3();
        const targets = refs.map((r) => findPost(all, r, type));
        const ctx = await s.context();
        const { deletePost } = await import("./chunks/posts-D28k7tn_.mjs");
        const many = targets.length > 1;
        if (many) ctx.bulkMode = true;
        const out = [];
        for (const p of targets) {
          try {
            await s.host.publisher.deletePostAndUnpublish(p.id, ctx, s.log);
            await deletePost(p.id);
            const removedPaths = [p.lastPublishedPath, ...p.previousPublishedPaths ?? [], ...Object.values(p.lastPublishedPathsByLocale ?? {})].filter((x) => !!x);
            out.push({ id: p.id, title: p.title, ok: true, removedPaths });
          } catch (err) {
            out.push({ id: p.id, title: p.title, ok: false, error: err.message });
          }
        }
        if (many) {
          const { listRegenerationTargets } = await import("./chunks/regenerationTargetRegistry-3NmN64mg.mjs");
          await s.host.publisher.flushBulkRegeneration(ctx, s.log, listRegenerationTargets());
        }
        reportStaleLinks(s, pathMoves(targets.filter((p) => out.some((o) => o.id === p.id && o.ok)), await allEntries$3()));
        return out;
      }, (rows) => rows.map((r) => `${r.ok ? "✓ deleted" : "✗"} ${r.title}${r.error ? ` — ${r.error}` : ""}`).join("\n"));
    }
    case "preview": {
      if (!refs[0]) throw new CliError("usage", "content preview needs an id or slug.", void 0, 2);
      const out = resolve(
        options.out !== void 0 ? String(options.out) : join(tmpdir(), "agentcms-preview", `preview-${refs[0].replace(/[^a-z0-9-]/gi, "_")}.html`)
      );
      return runAdmin(io, alias, { extensions: true }, async (s) => {
        const all = await allEntries$3();
        const p = findPost(all, refs[0], type);
        const f = await readFields$1(options);
        const draft = {
          ...p,
          ...f.title !== void 0 ? { title: f.title } : {},
          ...f.body !== void 0 ? { contentMarkdown: f.body } : {},
          ...f.excerpt !== void 0 ? { excerpt: f.excerpt ?? void 0 } : {}
        };
        const { renderPostPreview } = await import("./chunks/previewRenderer-DpERRjPd.mjs");
        const [terms, users, media] = await Promise.all([s.terms(), s.users(), s.media()]);
        const html = await renderPostPreview({
          draft,
          posts: all.filter((x) => x.type === "post"),
          pages: all.filter((x) => x.type === "page"),
          terms,
          media,
          settings: s.settings(),
          users,
          authorLookup: s.host.users.buildAuthorLookup(users, media)
        });
        const siteUrl = (s.settings().baseUrl || s.site.siteUrl || "").replace(/\/+$/, "");
        const file2 = siteUrl && !/<base\s/i.test(html) ? html.replace(/<head([^>]*)>/i, `<head$1><base href="${siteUrl}/">`) : html;
        mkdirSync(dirname(out), { recursive: true });
        writeFileSync(out, file2);
        let screenshots = null;
        if (options.screenshots) {
          const m = await import("./chunks/extScreenshot-X5xiH1-8.mjs");
          m.setScreenshotColorScheme(options["color-scheme"]);
          screenshots = await m.screenshotFile(out);
          screenshots = { ...screenshots, shots: screenshots.shots.map((sh) => ({ ...sh, file: resolve(sh.file) })) };
        }
        return {
          id: p.id,
          file: out,
          bytes: file2.length,
          screenshotsDir: options.screenshots ? join(dirname(out), ".screenshots") : null,
          screenshots,
          note: "Styles, images and the logo load from the live site; menus and other runtime widgets may stay empty in a file preview (the browser blocks their requests from file://). Check the published page with `agentcms site screenshot <path>`."
        };
      }, (r) => [`Preview of ${r.id}: ${r.file}`, ...(r.screenshots?.shots ?? []).map((sh) => `  ${sh.viewport}: ${sh.file}`), ...(r.screenshots?.errors ?? []).map((e) => `  screenshot error: ${e}`)].join("\n"));
    }
    case "blocks": {
      return runAdmin(io, alias, { extensions: true }, async (s) => {
        const { tryBlocks } = await import("./chunks/extBlocks-BM6tQ2F9.mjs");
        const all = s.host.blocks.listBlocks();
        let wanted = refs[0] ? all.filter((b) => b.id === refs[0]) : all;
        if (refs[0] && !wanted.length) {
          for (const theme of s.host.themes.listThemes()) {
            const found = (theme.blocks ?? []).filter((b) => b.id === refs[0]);
            if (found.length) {
              wanted = found;
              s.warnings.push(`${refs[0]} belongs to the theme ${theme.id}, which is not active: the marker renders only while ${theme.id} is the active theme.`);
              break;
            }
          }
        }
        if (refs[0] && !wanted.length) throw new CliError("not-found", `No block "${refs[0]}" on this site.`, "List them with `agentcms content blocks` (blocks of the active theme and plugins; an installed theme's blocks by id).", 2);
        const harbor = (await s.media())[0];
        const trials = await tryBlocks(wanted, harbor ? { id: harbor.id, url: s.host.cmsRuntime.pickMediaUrl(harbor), alt: harbor.alt ?? "" } : void 0);
        const rawAttrs = options.attrs === void 0 ? null : (await import("./chunks/adminCommon-DK5a9uhY.mjs")).readJsonOption(options.attrs, "attrs");
        if (rawAttrs !== null && (typeof rawAttrs !== "object" || Array.isArray(rawAttrs))) throw new CliError("usage", "--attrs must be a JSON object.", void 0, 2);
        const custom = rawAttrs;
        const { describeSettings, schemaErrors } = await import("./chunks/settingsSchema-DP7hBiko.mjs");
        return wanted.map((b) => {
          const t = trials.find((x) => x.id === b.id);
          let markdown = t?.markdown ?? null;
          const enc = markdown ? /data-attrs="([^"]*)"/.exec(markdown)?.[1] : void 0;
          const sample = enc ? decodeB64Json(enc) : null;
          let attrs = sample;
          const schema = b.attrsSchema;
          if (custom && markdown && enc) {
            attrs = { ...attrs, ...custom };
            const invalid = schemaErrors(schema, attrs, sample);
            if (invalid.length) throw new CliError("invalid-value", `${b.id}: ${invalid.join(" ")}`, `See \`agentcms content blocks ${b.id}\` (attrsSchema).`, 2);
            if (schema) {
              const unknown = Object.keys(custom).filter((k) => !(sample && typeof sample === "object" && k in sample) && !schema[k]);
              if (unknown.length) s.warnings.push(`${b.id}: unknown attribute(s) ${unknown.join(", ")} (kept, but the block ignores them).`);
            }
            markdown = markdown.replace(`data-attrs="${enc}"`, `data-attrs="${encodeB64Json(attrs)}"`);
          }
          return {
            id: b.id,
            category: b.category,
            title: s.host.cmsRuntime.i18n.t(b.titleKey, { ns: b.namespace }),
            markdown,
            attrs,
            // What each attribute does and accepts (when the block documents it).
            ...schema ? { attrsSchema: describeSettings(sample ?? {}, schema) } : {},
            ...t?.issues.length ? { issues: t.issues } : {}
          };
        });
      }, (rows) => rows.map((r) => `${r.id} (${r.category}) — ${r.title}
  ${r.markdown ?? "(inserts nothing by default)"}`).join("\n"));
    }
    default:
      throw new CliError("usage", action ? `Unknown content action "${action}".` : "content needs an action.", "Actions: list, get, create, update, publish, unpublish, delete, preview, blocks.", 2);
  }
}
const contentCommand = {
  name: "content",
  summary: "Posts and pages, like the admin's editor: list, get <id|slug>, create (draft; --publish to put it online), update <id|slug> (an online entry is republished, like Save; warnings name theme / plugin settings and menu URLs that still link to a moved page, with the fixing command), publish / unpublish <id|slug…> (several = bulk mode, one cascade), delete <id|slug…> (plan first, --yes), preview <id|slug> (HTML file: --out <file>, default in the system temp folder; --screenshots = desktop + phone PNGs in .screenshots/ next to it, absolute paths in the result), blocks [<block id>] (the editor blocks this site offers, as the Markdown to write; --attrs <json> fills a block's attributes).",
  usage: "content <list|get|create|update|publish|unpublish|delete|preview|blocks> [ids…] --site <alias> [--type post|page] [--status draft|online] [--search <q>] [--title <t>] [--slug <s>] [--body <md>|@file|-] [--excerpt <t>] [--category <slug|name>] [--tags a,b] [--create-terms] [--hero <media id>] [--author <user id|email>] [--seo-title <t>] [--seo-description <t>] [--seo-image <url>] [--created-at <iso>] [--published-at <iso>] [--data <json>|@file] [--lang <code> [--remove]] [--publish] [--no-publish] [--out <file>] [--screenshots] [--color-scheme light|dark] [--attrs <json>] [--yes]",
  options: [
    { name: "site", type: "string", description: "Site alias." },
    { name: "type", type: "string", description: "post or page (create: default post)." },
    { name: "status", type: "string", description: "list: draft or online." },
    { name: "search", type: "string", description: "list: words that must all appear in title, slug or excerpt." },
    { name: "category", type: "string", description: `list: filter. create/update: the post's category (slug, name or id; "" removes it).` },
    { name: "title", type: "string", description: "Title." },
    { name: "slug", type: "string", description: "Slug (default: from the title, made unique)." },
    { name: "body", type: "string", description: "Markdown body: text, @file.md, or - for stdin." },
    { name: "excerpt", type: "string", description: 'Excerpt ("" clears it).' },
    { name: "tags", type: "string", description: "Comma-separated tags (slug, name or id); replaces the post's tags." },
    { name: "create-terms", type: "boolean", description: "Create missing categories / tags instead of failing." },
    { name: "hero", type: "string", description: 'Featured image: media id ("" removes it).' },
    { name: "author", type: "string", description: "Author: user id or email (default on create: the signed-in user)." },
    { name: "seo-title", type: "string", description: "SEO title." },
    { name: "seo-description", type: "string", description: "SEO description." },
    { name: "seo-image", type: "string", description: "og:image URL." },
    { name: "created-at", type: "string", description: "Creation date (ISO 8601) — drives the ordering." },
    { name: "published-at", type: "string", description: "Publication date (ISO 8601)." },
    { name: "data", type: "string", description: "All fields as JSON (or @file.json): title, slug, body, excerpt, category, tags[], hero, author, seo{title,description,ogImage}, createdAt, publishedAt. Flags override it." },
    { name: "color-scheme", type: "string", description: "screenshots: prefers-color-scheme of the captures, light (default) or dark." },
    { name: "lang", type: "string", description: "update: edit the translation in this language (agentcms-multilang) instead of the main text." },
    { name: "remove", type: "boolean", description: "update --lang: delete that translation (an online entry is republished, which removes its page)." },
    { name: "publish", type: "boolean", description: "create: publish right away." },
    { name: "no-publish", type: "boolean", description: "update: don't republish an online entry (its public page stays as it was)." },
    { name: "out", type: "string", description: "preview: output HTML file (default: <temp>/agentcms-preview/preview-<ref>.html)." },
    { name: "screenshots", type: "boolean", description: "preview: desktop + phone PNGs with a local Chrome, written to .screenshots/ next to the --out file (absolute paths in the result)." },
    { name: "yes", type: "boolean", description: "delete: apply (otherwise only the plan)." },
    { name: "attrs", type: "string", description: "blocks <id>: JSON merged into the block's default attributes; prints the Markdown marker with them encoded." }
  ],
  run: run$c
};
async function run$b({ io, options, positionals }) {
  const what = positionals[0];
  if (!what) throw new CliError("usage", "regenerate needs what to regenerate.", "home, all, repair, assets, everything, targets, or a target id (see `regenerate targets`).", 2);
  const { runAdmin } = await import("./chunks/adminCommon-DK5a9uhY.mjs");
  const alias = options.site;
  const readOnly = what === "targets";
  return runAdmin(io, alias, readOnly ? { extensions: true } : { write: true, hosting: true, extensions: true, lock: true }, async (s) => (
    // One storage batch: one commit on git hostings, everything written
    // before the command returns.
    (await import("./chunks/siteFiles-BbBoVJww.mjs").then((n) => n.s)).withStorageBatch(async () => {
      const { listRegenerationTargets } = await import("./chunks/regenerationTargetRegistry-3NmN64mg.mjs");
      const targets = listRegenerationTargets();
      const pub = s.host.publisher;
      const started = Date.now();
      const runTargets = async (list2, ctx) => {
        for (const t of list2) {
          try {
            await t.run(ctx, s.log);
          } catch (err) {
            s.log({ level: "error", message: `Plugin "${t.id}" regen failed: ${err.message}` });
          }
        }
      };
      const syncAssets = async () => {
        const { syncThemeAssets } = await import("./chunks/themeSync-CKwVwkUo.mjs");
        await syncThemeAssets(s.host.themes.listThemes(), s.settings().themeConfigs, s.log);
      };
      switch (what) {
        case "targets":
          return { targets: targets.map((t) => ({ id: t.id, priority: t.priority ?? 100 })) };
        case "home": {
          await pub.regenerateHomeOnly(await s.context(), s.log);
          break;
        }
        case "all": {
          await pub.regenerateAll(await s.context({ refreshTerms: true }), s.log);
          break;
        }
        case "repair": {
          const ctx = await s.context({ refreshTerms: true });
          const before = [...ctx.posts, ...ctx.pages].map((p) => ({ ...p }));
          const res = await pub.repairPublishPaths(ctx, s.log);
          const { fetchAllPosts, invalidateAllPostsCache } = await import("./chunks/posts-D28k7tn_.mjs");
          invalidateAllPostsCache();
          const after = [...await fetchAllPosts({ type: "post" }), ...await fetchAllPosts({ type: "page" })];
          const m = await import("./chunks/adminCommon-DK5a9uhY.mjs");
          const staleLinks = m.reportStaleLinks(s, m.pathMoves(before, after));
          return { what, ...res, staleLinks, seconds: Math.round((Date.now() - started) / 1e3) };
        }
        case "assets": {
          await syncAssets();
          break;
        }
        case "everything": {
          await (await import("./chunks/regenerateAll-CFmyfRui.mjs")).regenerateEverything(s);
          break;
        }
        default: {
          const t = targets.find((x) => x.id === what);
          if (!t) {
            throw new CliError("unknown-target", `"${what}" is not a regeneration of this site.`, `Use home, all, repair, assets, everything${targets.length ? ` or one of: ${targets.map((x) => x.id).join(", ")}` : ""}.`, 2);
          }
          await runTargets([t], await s.context());
        }
      }
      return { what, seconds: Math.round((Date.now() - started) / 1e3) };
    })
  ), (r) => "targets" in r && r.targets ? r.targets.length ? r.targets.map((t) => `${t.id}`).join("\n") : "No plugin regeneration target." : `Regenerated ${"what" in r ? r.what : ""} in ${"seconds" in r ? r.seconds : 0}s.`);
}
const regenerateCommand = {
  name: "regenerate",
  summary: "The admin's Regenerate menu: home (home page), all (every HTML page), repair (fix moved URLs), assets (theme CSS/JS), everything (assets + all pages + every plugin target), <target-id> (one plugin's files, e.g. agentcms-sitemaps), targets (list them). Needed after changing settings, menus, terms, plugins or themes — saving those doesn't republish pages.",
  usage: "regenerate <home|all|repair|assets|everything|targets|<target-id>> --site <alias>",
  options: [{ name: "site", type: "string", description: "Site alias." }],
  run: run$b
};
function typeOption(v) {
  if (v === void 0) return void 0;
  if (v === "category" || v === "tag") return v;
  throw new CliError("usage", `--type is category or tag (got "${String(v)}").`, void 0, 2);
}
async function allEntries$2() {
  const { fetchAllPosts, invalidateAllPostsCache } = await import("./chunks/posts-D28k7tn_.mjs");
  invalidateAllPostsCache();
  const [posts, pages2] = await Promise.all([fetchAllPosts({ type: "post" }), fetchAllPosts({ type: "page" })]);
  return [...posts, ...pages2];
}
async function freshTerms() {
  return (await import("./chunks/taxonomies-D8XKYfUh.mjs")).fetchAllTerms();
}
function archivePath(t) {
  return t.type === "category" && t.slug ? `${t.slug}/index.html` : null;
}
function usage(t, all) {
  const using = all.filter((p) => p.primaryTermId === t.id || p.termIds.includes(t.id));
  return using.map((p) => ({ id: p.id, title: p.title, status: p.status, primary: p.primaryTermId === t.id, path: p.lastPublishedPath ?? null }));
}
async function summarize$2(t, terms, all) {
  const { iso } = await import("./chunks/adminCommon-DK5a9uhY.mjs");
  const parent = t.parentId ? terms.find((x) => x.id === t.parentId) : void 0;
  return {
    id: t.id,
    type: t.type,
    name: t.name,
    slug: t.slug,
    description: t.description ?? null,
    parent: parent ? parent.slug : t.parentId ?? null,
    seo: t.seo ?? null,
    translations: t.translations ?? null,
    archivePath: archivePath(t),
    posts: usage(t, all).length,
    updatedAt: iso(t.updatedAt)
  };
}
async function readFields(options) {
  const { readJsonOption, readTextOption } = await import("./chunks/adminCommon-DK5a9uhY.mjs");
  const data = readJsonOption(options.data, "data") ?? {};
  if (typeof data !== "object" || Array.isArray(data)) throw new CliError("usage", "--data must be a JSON object.", void 0, 2);
  const str = (flag, key) => typeof flag === "string" ? flag : typeof data[key] === "string" ? data[key] : void 0;
  const f = {
    name: str(options.name, "name"),
    slug: str(options.slug, "slug"),
    description: readTextOption(options.description, "description") ?? (typeof data.description === "string" ? data.description : void 0),
    parent: str(options.parent, "parent")
  };
  const seoData = data.seo && typeof data.seo === "object" ? data.seo : {};
  const seo = {};
  for (const [flag, key] of [["seo-title", "title"], ["seo-description", "description"], ["seo-image", "ogImage"]]) {
    const v = options[flag] !== void 0 ? options[flag] : seoData[key];
    if (v !== void 0 && v !== null && v !== false) seo[key] = String(v);
  }
  if (Object.keys(seo).length) f.seo = seo;
  return f;
}
function mergeSeo(current, patch) {
  const next = { ...current ?? {} };
  for (const [k, v] of Object.entries(patch)) {
    const t = String(v ?? "").trim();
    if (t) next[k] = t;
    else delete next[k];
  }
  return next;
}
async function checkSlug(slug, type, terms, ignoreId) {
  const { isValidSlug, detectTermSlugCollision } = await import("./chunks/slug-CZzRNKy4.mjs");
  if (!isValidSlug(slug)) throw new CliError("invalid-slug", `Invalid slug "${slug}".`, "Lower-case letters, digits and single dashes (e.g. travel-tips).", 2);
  const owner = detectTermSlugCollision({ type, slug }, terms, ignoreId);
  if (owner) throw new CliError("slug-taken", `The ${type} slug "${slug}" is already used by "${owner.label}".`, "Pick another --slug (or leave it out on create to get a unique one).", 2);
}
function resolveParent(ref, type, terms, self) {
  if (type !== "category") throw new CliError("usage", "Only categories have a parent.", void 0, 2);
  const { findTerm } = requireCommon;
  const parent = findTerm(terms, ref, "category");
  if (!parent) throw new CliError("not-found", `No category "${ref}" to use as parent.`, "List them with `agentcms terms list --type category`.", 2);
  if (self) {
    let cur = parent;
    for (let i = 0; cur && i < terms.length + 1; i++) {
      if (cur.id === self.id) throw new CliError("usage", `"${parent.name}" can't be the parent of "${self.name}" (cycle).`, void 0, 2);
      cur = cur.parentId ? terms.find((t) => t.id === cur.parentId) : void 0;
    }
  }
  return parent.id;
}
let requireCommon;
function multilangLanguages(settings) {
  const cfg = settings.pluginConfigs?.["agentcms-multilang"];
  if (!cfg || settings.enabledPlugins?.["agentcms-multilang"] === false) return null;
  return Array.isArray(cfg.enabledLanguages) ? cfg.enabledLanguages.filter((l) => typeof l === "string") : [];
}
async function run$a({ io, options, positionals }) {
  const [action, ref] = positionals;
  requireCommon = await import("./chunks/adminCommon-DK5a9uhY.mjs");
  const { runAdmin, requireTerm, findTerm, menuReferences, menuRemoveHints, menuLabelHints, reportStaleLinks, pathMoves } = requireCommon;
  const alias = options.site;
  const type = typeOption(options.type);
  switch (action) {
    case "list":
      return runAdmin(io, alias, {}, async () => {
        const [terms, all] = await Promise.all([freshTerms(), allEntries$2()]);
        const pool = type ? terms.filter((t) => t.type === type) : terms;
        return Promise.all(pool.map((t) => summarize$2(t, terms, all)));
      }, (rows) => rows.length ? rows.map((r) => `${r.id}  ${r.type.padEnd(8)} ${r.slug.padEnd(24)} ${r.name}  (${r.posts} post${r.posts === 1 ? "" : "s"})`).join("\n") : "No terms.");
    case "get": {
      if (!ref) throw new CliError("usage", "terms get needs an id, slug or name.", void 0, 2);
      return runAdmin(io, alias, {}, async () => {
        const [terms, all] = await Promise.all([freshTerms(), allEntries$2()]);
        const t = requireTerm(terms, ref, type);
        return { ...await summarize$2(t, terms, all), usedBy: usage(t, all) };
      }, (r) => [`${r.name} (${r.type}, ${r.slug})${r.archivePath ? ` — archive ${r.archivePath}` : ""}`, ...r.usedBy.map((p) => `  ${p.primary ? "*" : " "} ${p.title} (${p.status})`)].join("\n"));
    }
    case "create": {
      if (!type) throw new CliError("usage", "terms create needs --type category|tag.", void 0, 2);
      const f = await readFields(options);
      const name = f.name?.trim();
      if (!name) throw new CliError("usage", "terms create needs --name.", void 0, 2);
      return runAdmin(io, alias, { write: true, lock: true }, async (session) => {
        const { slugify, findAvailableSlug, detectTermSlugCollision } = await import("./chunks/slug-CZzRNKy4.mjs");
        const { createTerm, updateTerm } = await import("./chunks/taxonomies-D8XKYfUh.mjs");
        const terms = await freshTerms();
        let slug = f.slug?.trim();
        if (slug) await checkSlug(slug, type, terms);
        else slug = findAvailableSlug(slugify(name) || "term", (s) => Boolean(detectTermSlugCollision({ type, slug: s }, terms)));
        const parentId = f.parent ? resolveParent(f.parent, type, terms) : void 0;
        const id = await createTerm({ type, name, slug, description: f.description?.trim() || void 0, parentId });
        if (f.seo) await updateTerm(id, { seo: mergeSeo(void 0, f.seo) });
        return {
          id,
          type,
          name,
          slug,
          archivePath: archivePath({ type, slug }),
          next: [`Nothing is published yet: the archive appears once a post of this category is published, or with \`agentcms regenerate all --site ${session.site.alias}\`.`]
        };
      }, (r) => `Created ${r.type} ${r.id} (${r.slug}).`);
    }
    case "update": {
      if (!ref) throw new CliError("usage", "terms update needs an id, slug or name.", void 0, 2);
      const f = await readFields(options);
      const lang = typeof options.lang === "string" ? options.lang.trim() : void 0;
      const remove = !!options.remove;
      const removeArchive = !!options["remove-archive"];
      const oldSlug = typeof options["old-slug"] === "string" ? options["old-slug"].trim() : void 0;
      if (remove && !lang) throw new CliError("usage", "--remove deletes a translation: it needs --lang.", void 0, 2);
      if (lang && (removeArchive || oldSlug !== void 0)) throw new CliError("usage", "--remove-archive / --old-slug don't go with --lang.", void 0, 2);
      return runAdmin(io, alias, { write: true, hosting: removeArchive, lock: true }, async (s) => {
        const { updateTerm } = await import("./chunks/taxonomies-D8XKYfUh.mjs");
        const { isValidSlug, slugify } = await import("./chunks/slug-CZzRNKy4.mjs");
        const terms = await freshTerms();
        const t = requireTerm(terms, ref, type);
        const next = [];
        if (lang) {
          const langs = multilangLanguages(s.settings());
          if (remove) ;
          else if (langs === null) s.warnings.push("agentcms-multilang is not configured on this site: the translation is stored but nothing renders it.");
          else if (!langs.includes(lang)) s.warnings.push(`"${lang}" is not one of the site's enabled languages (${langs.join(", ") || "none"}): the translation is stored but not published.`);
          const current = { ...t.translations ?? {} };
          if (remove) {
            if (!current[lang]) throw new CliError("not-found", `${t.name} has no ${lang} translation.`, void 0, 2);
            delete current[lang];
          } else {
            const tr = { slug: "", name: "", description: "", ...current[lang] ?? {} };
            if (f.name !== void 0) tr.name = f.name.trim();
            if (f.slug !== void 0) tr.slug = f.slug.trim();
            if (f.description !== void 0) tr.description = f.description.trim();
            if (f.seo) {
              const seo = mergeSeo(tr.seo, f.seo);
              if (Object.keys(seo).length) tr.seo = seo;
              else delete tr.seo;
            }
            if (!tr.name) throw new CliError("usage", `The ${lang} translation needs a --name.`, void 0, 2);
            if (!tr.slug) tr.slug = slugify(String(tr.name));
            if (!isValidSlug(String(tr.slug))) throw new CliError("invalid-slug", `Invalid slug "${tr.slug}".`, "Lower-case letters, digits and single dashes.", 2);
            const clash = terms.find((x) => x.id !== t.id && x.type === t.type && x.translations?.[lang]?.slug === tr.slug);
            if (clash) throw new CliError("slug-taken", `The ${lang} slug "${tr.slug}" is already used by "${clash.name}".`, "Pick another --slug.", 2);
            current[lang] = tr;
          }
          await updateTerm(t.id, { translations: current });
          next.push(t.type === "category" ? `Run \`agentcms regenerate everything --site ${s.site.alias}\` to publish the translated archive and post URLs (and the plugin files that list them: sitemaps, RSS feeds, search index).` : `Run \`agentcms regenerate everything --site ${s.site.alias}\` so the published pages and plugin files show the translated tag.`);
          if (!remove && f.name !== void 0) {
            for (const m of menuLabelHints(s.settings(), "term", t.id, String(current[lang].name), s.site.alias, lang)) {
              next.push(`Menu item ${m.id} (${m.menu}) has ${m.label ? `the ${lang} label "${m.label}"` : `no ${lang} label`}: \`${m.fix}\`.`);
            }
          }
          return { id: t.id, type: t.type, lang, translation: remove ? null : current[lang], next };
        }
        const patch = {};
        if (f.name !== void 0) {
          if (!f.name.trim()) throw new CliError("usage", "--name can't be empty.", void 0, 2);
          patch.name = f.name.trim();
        }
        if (f.slug !== void 0 && f.slug.trim() !== t.slug) {
          await checkSlug(f.slug.trim(), t.type, terms, t.id);
          patch.slug = f.slug.trim();
        }
        if (f.description !== void 0) patch.description = f.description.trim();
        if (f.parent !== void 0) patch.parentId = f.parent === "" ? "" : resolveParent(f.parent, t.type, terms, t);
        if (f.seo) patch.seo = mergeSeo(t.seo, f.seo);
        let staleArchive = null;
        if (t.type === "category" && patch.slug) staleArchive = archivePath(t);
        else if (oldSlug !== void 0) {
          if (t.type !== "category") throw new CliError("usage", "--old-slug names an old category archive: tags have none.", void 0, 2);
          if (!isValidSlug(oldSlug)) throw new CliError("invalid-slug", `Invalid --old-slug "${oldSlug}".`, void 0, 2);
          const owner = terms.find((x) => x.type === "category" && x.slug === oldSlug);
          if (owner) throw new CliError("usage", `${oldSlug}/index.html is the live archive of "${owner.name}": nothing to remove.`, void 0, 2);
          staleArchive = `${oldSlug}/index.html`;
        }
        if (oldSlug !== void 0 && !removeArchive) throw new CliError("usage", "--old-slug goes with --remove-archive.", void 0, 2);
        if (!Object.keys(patch).length && !(removeArchive && staleArchive)) {
          throw new CliError("usage", "Nothing to update.", "Pass --name, --slug, --description, --parent, --seo-title, --seo-description, --seo-image or --lang (or --remove-archive --old-slug <slug> to delete an old archive).", 2);
        }
        if (removeArchive && !staleArchive) throw new CliError("usage", "--remove-archive deletes the archive left by a slug change: pass a new --slug (or --old-slug <old slug>).", void 0, 2);
        const moves = [];
        if (t.type === "category" && patch.slug) {
          const { buildPostUrl } = await import("./chunks/slug-CZzRNKy4.mjs");
          const renamed = { ...t, slug: patch.slug };
          for (const p of await allEntries$2()) {
            if (p.status !== "online" || p.primaryTermId !== t.id || !p.lastPublishedPath) continue;
            const to = buildPostUrl({ post: p, primaryTerm: renamed });
            if (to !== p.lastPublishedPath) moves.push({ from: p.lastPublishedPath, to });
          }
          moves.push({ from: archivePath(t), to: archivePath(renamed) });
        } else if (staleArchive) moves.push({ from: staleArchive, to: archivePath(t) });
        if (Object.keys(patch).length) await updateTerm(t.id, patch);
        let archiveRemoved = false;
        if (removeArchive && staleArchive) {
          const { deleteFile, withStorageBatch } = await import("./chunks/siteFiles-BbBoVJww.mjs").then((n) => n.s);
          await withStorageBatch(() => deleteFile(staleArchive));
          archiveRemoved = true;
        }
        const after = (await freshTerms()).find((x) => x.id === t.id);
        if (patch.slug && t.type === "category") {
          next.push(`Run \`agentcms regenerate repair --site ${s.site.alias}\` to move this category's posts to their new URLs, then \`agentcms regenerate everything --site ${s.site.alias}\` so the archives, listings and plugin files (sitemaps, RSS feeds, search index) use the new URLs.`);
          if (!archiveRemoved) next.push(`The old archive ${staleArchive} is still published: delete it with \`agentcms terms update ${after.slug} --type category --remove-archive --old-slug ${t.slug} --site ${s.site.alias}\` (or pass --remove-archive with --slug).`);
        } else if (Object.keys(patch).length) {
          next.push(`Run \`agentcms regenerate everything --site ${s.site.alias}\` so published pages and plugin files (sitemaps, RSS feeds, search index) show the change (saving a term republishes nothing).`);
        }
        const menuLabels = patch.name ? menuLabelHints(s.settings(), "term", t.id, patch.name, s.site.alias) : [];
        for (const m of menuLabels) next.push(`Menu item "${m.label}" (${m.menu}) points to this ${t.type} under its old label: \`${m.fix}\`.`);
        const links = reportStaleLinks(s, moves);
        return { id: t.id, type: t.type, name: after.name, slug: after.slug, seo: after.seo ?? null, archivePath: archivePath(after), staleArchive, archiveRemoved, menuLabels, staleLinks: links, next };
      }, (r) => [`Updated ${r.type} ${r.id}${"lang" in r ? ` (${r.lang})` : ""}.`, ...r.next.map((n) => `  next: ${n}`)].join("\n"));
    }
    case "delete": {
      if (!ref) throw new CliError("usage", "terms delete needs an id, slug or name.", void 0, 2);
      const detach = !!options.detach;
      const removeArchive = !!options["remove-archive"];
      const moveToRef = typeof options["move-to"] === "string" ? options["move-to"].trim() : void 0;
      if (moveToRef !== void 0 && detach) throw new CliError("usage", "--move-to and --detach don't go together: --move-to already removes the term from its posts.", void 0, 2);
      if (moveToRef === "") throw new CliError("usage", "--move-to needs a category (slug, name or id).", void 0, 2);
      const planOf = async () => {
        const [terms, all] = await Promise.all([freshTerms(), allEntries$2()]);
        const t = requireTerm(terms, ref, type);
        let moveTo;
        if (moveToRef !== void 0) {
          if (t.type !== "category") throw new CliError("usage", "--move-to moves the posts of a deleted category: this is a tag.", "Use --detach to remove a tag from its posts.", 2);
          moveTo = findTerm(terms, moveToRef, "category");
          if (!moveTo) throw new CliError("not-found", `No category "${moveToRef}" to move the posts to.`, "List them with `agentcms terms list --type category`.", 2);
          if (moveTo.id === t.id) throw new CliError("usage", "--move-to must be another category than the one deleted.", void 0, 2);
        }
        const { buildPostUrl, detectPathCollision } = await import("./chunks/slug-CZzRNKy4.mjs");
        const remaining = terms.filter((x) => x.id !== t.id);
        const changes = all.filter((p) => p.primaryTermId === t.id || p.termIds.includes(t.id)).map((p) => {
          const primary = p.primaryTermId === t.id;
          const newPrimary = primary ? moveTo?.id ?? null : p.primaryTermId ?? null;
          const termIds = p.termIds.filter((id) => id !== t.id);
          if (primary && moveTo && !termIds.includes(moveTo.id)) termIds.unshift(moveTo.id);
          const term = newPrimary ? remaining.find((x) => x.id === newPrimary) : void 0;
          const to = p.status === "online" && p.lastPublishedPath && p.type === "post" ? buildPostUrl({ post: p, primaryTerm: term }) : p.lastPublishedPath ?? null;
          return { post: p, primary, newPrimary, termIds, to };
        });
        const conflicts = moveTo ? changes.filter((c) => c.primary).map((c) => {
          const path = buildPostUrl({ post: c.post, primaryTerm: moveTo });
          const owner = detectPathCollision(path, all.filter((p) => p.type === "post" && p.primaryTermId !== t.id), all.filter((p) => p.type === "page"), remaining, c.post.id);
          return owner ? { id: c.post.id, title: c.post.title, path, usedBy: `${owner.kind} "${owner.label}"` } : null;
        }).filter((x) => !!x) : [];
        return { term: t, moveTo, changes, conflicts, usedBy: usage(t, all), archivePath: archivePath(t), children: terms.filter((x) => x.parentId === t.id).map((x) => x.slug) };
      };
      const moveSummary = (p) => p.moveTo ? {
        to: { id: p.moveTo.id, slug: p.moveTo.slug, name: p.moveTo.name },
        posts: p.changes.map((c) => ({
          id: c.post.id,
          title: c.post.title,
          status: c.post.status,
          change: c.primary ? `category → ${p.moveTo.slug}` : `loses the ${p.term.type}`,
          ...c.post.status === "online" ? { from: c.post.lastPublishedPath ?? null, to: c.to } : {}
        })),
        republish: p.changes.filter((c) => c.post.status === "online").length,
        conflicts: p.conflicts
      } : null;
      const menuHints = (alias2, p, items) => p.moveTo ? items.map((m) => `Menu item "${m.label}" (${m.menu}) still points to the deleted ${p.term.type}: \`agentcms menus update ${m.id} --menu ${m.menu} --category ${p.moveTo.slug} --site ${alias2}\` (or \`agentcms menus remove ${m.id} --menu ${m.menu} --site ${alias2}\`).`) : menuRemoveHints(alias2, items);
      if (!options.yes) {
        return runAdmin(io, alias, {}, async (s) => {
          const p = await planOf();
          const menuItems = menuReferences(s.settings(), "term", [p.term.id]);
          const move = moveSummary(p);
          return {
            needsConfirmation: true,
            delete: { id: p.term.id, type: p.term.type, name: p.term.name, slug: p.term.slug },
            usedBy: p.usedBy,
            archivePath: p.archivePath,
            children: p.children,
            menuItems,
            detach,
            move,
            removeArchive,
            notes: [
              p.usedBy.length ? move ? `${move.posts.filter((x) => x.change.startsWith("category")).length} post(s) move to "${move.to.name}", the others lose the ${p.term.type}; ${move.republish} online post(s) will be republished (bulk mode, one storage batch).` : detach ? `${p.usedBy.length} post(s) will lose this ${p.term.type} (--detach).` : `${p.usedBy.length} post(s) keep a reference to the deleted ${p.term.type}; add --detach to remove it from them${p.term.type === "category" ? ", or --move-to <category> to move them" : ""}.` : "No post uses it.",
              ...p.conflicts.length ? [`Blocked: ${p.conflicts.map((c) => `${c.path} (${c.title}) is already used by ${c.usedBy}`).join("; ")} — rename those posts first or pick another --move-to.`] : [],
              ...menuHints(s.site.alias, p, menuItems),
              ...p.archivePath ? [removeArchive ? `${p.archivePath} will be deleted from the site.` : `${p.archivePath} (if it was published) stays online; add --remove-archive to delete it.`] : []
            ]
          };
        }, (r) => `Would delete ${r.delete.type} "${r.delete.name}". ${r.notes.join(" ")} Nothing changed — re-run with --yes once the user agrees.`);
      }
      const publishes = moveToRef !== void 0;
      return runAdmin(io, alias, { write: true, hosting: removeArchive || publishes, extensions: publishes, lock: true }, async (s) => {
        const p = await planOf();
        if (p.conflicts.length) {
          throw new CliError("slug-taken", `Moving to "${p.moveTo.name}" would overwrite: ${p.conflicts.map((c) => `${c.path} (${c.usedBy})`).join(", ")}.`, "Rename those posts (`agentcms content update <id> --slug …`) or pick another --move-to. Nothing changed.", 2);
        }
        const menuItems = menuReferences(s.settings(), "term", [p.term.id]);
        const { updatePost } = await import("./chunks/posts-D28k7tn_.mjs");
        const { deleteTerm } = await import("./chunks/taxonomies-D8XKYfUh.mjs");
        const before = await allEntries$2();
        const detached = [];
        const moved = [];
        if (detach || p.moveTo) {
          for (const c of p.changes) {
            await updatePost(c.post.id, {
              termIds: c.termIds,
              ...c.primary ? { primaryTermId: c.newPrimary } : {}
            });
            if (p.moveTo && c.primary) moved.push(c.post.id);
            else detached.push(c.post.id);
          }
        }
        await deleteTerm(p.term.id);
        const { deleteFile, withStorageBatch } = await import("./chunks/siteFiles-BbBoVJww.mjs").then((n) => n.s);
        let archiveRemoved = false;
        const republished = [];
        const online = p.changes.filter((c) => c.post.status === "online");
        await withStorageBatch(async () => {
          if (removeArchive && p.archivePath) {
            await deleteFile(p.archivePath);
            archiveRemoved = true;
          }
          if (p.moveTo && online.length) {
            const pub = s.host.publisher;
            const ctx = await s.context({ refreshTerms: true });
            ctx.bulkMode = true;
            for (const c of online) {
              try {
                await pub.publishPost(c.post.id, ctx, s.log);
                republished.push({ id: c.post.id, title: c.post.title, ok: true });
              } catch (err) {
                republished.push({ id: c.post.id, title: c.post.title, ok: false, error: err.message });
              }
            }
            const { listRegenerationTargets } = await import("./chunks/regenerationTargetRegistry-3NmN64mg.mjs");
            await pub.flushBulkRegeneration(ctx, s.log, listRegenerationTargets());
          }
        });
        const after = await allEntries$2();
        for (const r of republished) r.path = after.find((x) => x.id === r.id)?.lastPublishedPath ?? null;
        const next = [];
        const rootBound = p.moveTo ? [] : p.changes.filter((c) => c.post.status === "online" && c.primary);
        if (rootBound.length) next.push(`Run \`agentcms regenerate repair --site ${s.site.alias}\` — ${rootBound.length} online post(s) lost their category, so their URL changes.`);
        if (!p.moveTo || !online.length) next.push(`Run \`agentcms regenerate everything --site ${s.site.alias}\` so the archives, listings and plugin files (sitemaps, RSS feeds, search index) stop listing the deleted ${p.term.type}.`);
        next.push(...menuHints(s.site.alias, p, menuItems));
        if (p.archivePath && !archiveRemoved) next.push(`${p.archivePath} is still published (re-run with --remove-archive, or delete it by hand).`);
        const moves = p.moveTo ? pathMoves(before, after) : rootBound.filter((c) => c.to && c.to !== c.post.lastPublishedPath).map((c) => ({ from: c.post.lastPublishedPath, to: c.to }));
        if (p.archivePath) moves.push({ from: p.archivePath, to: p.moveTo ? archivePath(p.moveTo) : null });
        const links = reportStaleLinks(s, moves);
        return {
          deleted: { id: p.term.id, type: p.term.type, name: p.term.name, slug: p.term.slug },
          detached,
          moved,
          movedTo: p.moveTo ? { id: p.moveTo.id, slug: p.moveTo.slug, name: p.moveTo.name } : null,
          republished,
          stillReferencedBy: detach || p.moveTo ? [] : p.usedBy,
          archivePath: p.archivePath,
          archiveRemoved,
          orphanChildren: p.children,
          menuItems,
          staleLinks: links,
          next
        };
      }, (r) => [`Deleted ${r.deleted.type} "${r.deleted.name}"${r.movedTo ? ` — ${r.moved.length} post(s) moved to "${r.movedTo.name}"` : ""}.`, ...r.next.map((n) => `  next: ${n}`)].join("\n"));
    }
    default:
      throw new CliError("usage", action ? `Unknown terms action "${action}".` : "terms needs an action.", "Actions: list, get, create, update, delete.", 2);
  }
}
const termsCommand = {
  name: "terms",
  summary: "Categories and tags, like the admin's Categories & Tags page: list, get <ref>, create (--type, --name; slug from the name when omitted), update <ref> (name, slug, description, parent, SEO; --remove-archive with a new --slug deletes the old archive, --remove-archive --old-slug <s> one left by an earlier rename; --lang <code> edits the agentcms-multilang translation, --remove drops it), delete <ref> (plan first, --yes; --move-to <category> moves its posts there and republishes the online ones, --detach removes it from its posts, --remove-archive deletes the published archive). Saving a term republishes nothing: run the `next` regeneration; `next` also names menu items whose label no longer matches and warnings name config links to moved pages.",
  usage: "terms <list|get|create|update|delete> [<id|slug|name>] --site <alias> [--type category|tag] [--name <n>] [--slug <s>] [--description <t>|@file] [--parent <category>] [--seo-title <t>] [--seo-description <t>] [--seo-image <url>] [--data <json>|@file] [--lang <code>] [--remove] [--remove-archive] [--old-slug <s>] [--detach] [--move-to <category>] [--yes]",
  options: [
    { name: "site", type: "string", description: "Site alias." },
    { name: "type", type: "string", description: "category or tag (required on create; filters list / disambiguates refs)." },
    { name: "name", type: "string", description: "Name (with --lang: the translated name)." },
    { name: "slug", type: "string", description: "Slug (create: default from the name, made unique; with --lang: the translated slug)." },
    { name: "description", type: "string", description: 'Description ("" clears it).' },
    { name: "parent", type: "string", description: 'Parent category (slug, name or id; "" removes it). Categories only.' },
    { name: "seo-title", type: "string", description: 'Archive <title> ("" clears it).' },
    { name: "seo-description", type: "string", description: 'Archive meta description ("" clears it).' },
    { name: "seo-image", type: "string", description: 'Archive og:image URL ("" clears it).' },
    { name: "data", type: "string", description: "Fields as JSON (or @file.json): name, slug, description, parent, seo{title,description,ogImage}. Flags override it." },
    { name: "lang", type: "string", description: "update: edit translations[<lang>] (agentcms-multilang) instead of the main fields." },
    { name: "remove", type: "boolean", description: "update --lang: delete that translation." },
    { name: "detach", type: "boolean", description: "delete: also remove the term from the posts that use it." },
    { name: "move-to", type: "string", description: "delete (categories): give its posts this category instead (slug, name or id); online ones are republished in bulk mode. Not with --detach." },
    { name: "remove-archive", type: "boolean", description: "delete: also delete the category's published archive (<slug>/index.html). update: delete the archive the slug change leaves behind (with --slug, or --old-slug)." },
    { name: "old-slug", type: "string", description: "update --remove-archive: the slug of an earlier rename whose archive (<old-slug>/index.html) is still published." },
    { name: "yes", type: "boolean", description: "delete: apply (otherwise only the plan)." }
  ],
  run: run$a
};
async function loadCorpus() {
  const { fetchAllPosts, invalidateAllPostsCache } = await import("./chunks/posts-D28k7tn_.mjs");
  const { fetchAllTerms } = await import("./chunks/taxonomies-D8XKYfUh.mjs");
  invalidateAllPostsCache();
  const [posts, pages2, terms] = await Promise.all([fetchAllPosts({ type: "post" }), fetchAllPosts({ type: "page" }), fetchAllTerms()]);
  return { posts, pages: pages2, terms };
}
function newId() {
  return typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}
async function describe(item, c) {
  const { resolveMenuItems } = await import("./chunks/menuResolver-BEzafl_Y.mjs");
  const href = resolveMenuItems([{ ...item, children: void 0 }], c)[0].href;
  let target;
  if (item.externalUrl !== void 0) target = { kind: "external", url: item.externalUrl };
  else if (item.ref?.kind === "post") {
    const p = [...c.posts, ...c.pages].find((x) => x.id === item.ref?.id);
    target = p ? { kind: p.type, id: p.id, title: p.title, slug: p.slug, status: p.status, ...p.status !== "online" ? { problem: "not online: the link leads to a missing page" } : {} } : { kind: "post", id: item.ref.id ?? null, problem: "missing: the post or page no longer exists (href #)" };
  } else if (item.ref?.kind === "term") {
    const t = c.terms.find((x) => x.id === item.ref?.id);
    target = t ? { kind: t.type, id: t.id, name: t.name, slug: t.slug, ...t.type !== "category" ? { problem: "tags have no archive (href #)" } : {} } : { kind: "category", id: item.ref.id ?? null, problem: "missing: the category no longer exists (href #)" };
  } else target = { kind: "home" };
  const children = item.children ? await Promise.all(item.children.map((ch) => describe(ch, c))) : [];
  const { children: _raw, ...rest } = item;
  return { ...rest, ...item.children ? { children } : {}, target: { ...target, href } };
}
function normalizeItem(raw, c, where, findPost, findTerm) {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) throw new CliError("invalid-menu", `${where}: an item must be an object.`, void 0, 2);
  const o = raw;
  const label = typeof o.label === "string" ? o.label : "";
  if (!label.trim()) throw new CliError("invalid-menu", `${where}: "label" is required.`, void 0, 2);
  const item = { id: typeof o.id === "string" && o.id ? o.id : newId(), label };
  const kinds = ["post", "category", "home", "url", "ref", "externalUrl"].filter((k) => o[k] !== void 0 && o[k] !== false);
  if (kinds.length > 1) throw new CliError("invalid-menu", `${where}: give one target (${kinds.join(" + ")} given).`, void 0, 2);
  const all = [...c.posts, ...c.pages];
  const url = o.url ?? o.externalUrl;
  if (url !== void 0) {
    if (typeof url !== "string" || !url.trim()) throw new CliError("invalid-menu", `${where}: the url must be a non-empty string.`, void 0, 2);
    item.externalUrl = url.trim();
  } else if (o.post !== void 0) {
    item.ref = { kind: "post", id: findPost(all, String(o.post)).id };
  } else if (o.category !== void 0) {
    const t = findTerm(c.terms, String(o.category), "category");
    if (!t) throw new CliError("not-found", `${where}: no category "${String(o.category)}".`, "List them with `agentcms terms list --type category`.", 2);
    item.ref = { kind: "term", id: t.id };
  } else if (o.ref !== void 0) {
    const ref = o.ref;
    if (!ref || typeof ref !== "object" || !["post", "term", "home"].includes(String(ref.kind))) {
      throw new CliError("invalid-menu", `${where}: ref.kind must be post, term or home.`, void 0, 2);
    }
    const kind = ref.kind;
    if (kind === "home") item.ref = { kind: "home" };
    else {
      if (typeof ref.id !== "string" || !ref.id) throw new CliError("invalid-menu", `${where}: ref.id is required for a ${kind}.`, void 0, 2);
      if (kind === "post") item.ref = { kind, id: findPost(all, ref.id).id };
      else {
        const t = findTerm(c.terms, ref.id, "category");
        if (!t) throw new CliError("not-found", `${where}: no category "${ref.id}".`, void 0, 2);
        item.ref = { kind, id: t.id };
      }
    }
  } else {
    item.ref = { kind: "home" };
  }
  if (o.translations !== void 0) {
    const tr = o.translations;
    if (!tr || typeof tr !== "object" || Array.isArray(tr)) throw new CliError("invalid-menu", `${where}: translations must be { "<lang>": { "label": "…" } }.`, void 0, 2);
    const clean = {};
    for (const [lang, v] of Object.entries(tr)) {
      const l = typeof v === "string" ? v : v?.label;
      if (l !== void 0 && typeof l !== "string") throw new CliError("invalid-menu", `${where}: translations.${lang}.label must be a string.`, void 0, 2);
      if (l && l.trim()) clean[lang] = { label: l };
    }
    if (Object.keys(clean).length) item.translations = clean;
  }
  if (o.children !== void 0) {
    if (!Array.isArray(o.children)) throw new CliError("invalid-menu", `${where}: children must be an array.`, void 0, 2);
    if (o.children.length) item.children = o.children.map((ch, i) => normalizeItem(ch, c, `${where}.children[${i}]`, findPost, findTerm));
  }
  return item;
}
function menuOption(v) {
  if (v === "header" || v === "footer") return v;
  throw new CliError("usage", `--menu is header or footer${v === void 0 ? "" : ` (got "${String(v)}")`}.`, void 0, 2);
}
function findItemIndex(list2, ref, menu) {
  const byId = list2.findIndex((i) => i.id === ref);
  if (byId >= 0) return byId;
  const byLabel = list2.map((i, n) => [i, n]).filter(([i]) => i.label.toLowerCase() === ref.toLowerCase());
  if (byLabel.length === 1) return byLabel[0][1];
  if (byLabel.length > 1) throw new CliError("ambiguous", `${byLabel.length} ${menu} items are labelled "${ref}".`, "Use the item id (see `agentcms menus get`).", 2);
  const pos = Number(ref);
  if (Number.isInteger(pos) && pos >= 1 && pos <= list2.length) return pos - 1;
  throw new CliError("not-found", `No ${menu} item "${ref}".`, "Use an id, a label or a 1-based position (see `agentcms menus get`).", 2);
}
function findItemDeep(list2, ref, menu) {
  const byId = (items) => {
    for (const it of items) {
      if (it.id === ref) return it;
      const hit = it.children ? byId(it.children) : void 0;
      if (hit) return hit;
    }
    return void 0;
  };
  return byId(list2) ?? list2[findItemIndex(list2, ref, menu)];
}
function positionOption(v, length) {
  if (v === void 0) return void 0;
  const n = Number(v);
  if (!Number.isInteger(n) || n < 1) throw new CliError("usage", `--position is a 1-based position (got "${String(v)}").`, void 0, 2);
  return Math.min(n, length + 1) - 1;
}
async function run$9({ io, options, positionals }) {
  const [action, ref] = positionals;
  const common = await import("./chunks/adminCommon-DK5a9uhY.mjs");
  const { runAdmin, findPost, findTerm, readJsonOption } = common;
  const alias = options.site;
  const describeAll = async (menus, c) => ({
    header: await Promise.all((menus.header ?? []).map((i) => describe(i, c))),
    footer: await Promise.all((menus.footer ?? []).map((i) => describe(i, c)))
  });
  const write = (compute) => runAdmin(io, alias, { write: true, hosting: true, extensions: true, lock: true }, async (s) => {
    const settings = s.settings();
    const c = { ...await loadCorpus(), settings };
    const current = { header: settings.menus?.header ?? [], footer: settings.menus?.footer ?? [] };
    const nextMenus = await compute(current, c);
    const { updateSettings } = await import("./chunks/settings-CEBDXaTg.mjs");
    const { publishMenuJson, MENU_JSON_PATH } = await import("./chunks/menuPublisher-CNZxyV6S.mjs");
    await updateSettings({ menus: nextMenus });
    const patched = { ...settings, menus: nextMenus };
    const { withStorageBatch } = await import("./chunks/siteFiles-BbBoVJww.mjs").then((n) => n.s);
    await withStorageBatch(() => publishMenuJson(patched, c.posts, c.pages, c.terms));
    await s.refresh();
    const described = await describeAll(nextMenus, c);
    const problems = [...described.header, ...described.footer].filter((i) => i.target.problem).map((i) => `${i.label}: ${i.target.problem}`);
    for (const p of problems) s.warnings.push(p);
    return { ...described, published: MENU_JSON_PATH };
  }, (r) => `Saved the menus (header ${r.header.length}, footer ${r.footer.length} items) and published ${r.published}.`);
  switch (action) {
    case "get":
      return runAdmin(io, alias, {}, async (s) => {
        const settings = s.settings();
        const c = { ...await loadCorpus(), settings };
        return describeAll({ header: settings.menus?.header ?? [], footer: settings.menus?.footer ?? [] }, c);
      }, (r) => ["header", "footer"].map((m) => [`${m}:`, ...r[m].length ? r[m].map((i, n) => `  ${n + 1}. ${i.label} → ${i.target.href}${i.target.problem ? `  (${i.target.problem})` : ""}  [${i.id}]`) : ["  (empty)"]].join("\n")).join("\n"));
    case "set": {
      const data = readJsonOption(options.data, "data");
      if (!data || typeof data !== "object" || Array.isArray(data)) throw new CliError("usage", `menus set needs --data '{"header":[…],"footer":[…]}' (or @file.json).`, "A menu left out keeps its current items.", 2);
      for (const k of Object.keys(data)) if (k !== "header" && k !== "footer") throw new CliError("invalid-menu", `Unknown key "${k}" (only header and footer).`, void 0, 2);
      for (const m of ["header", "footer"]) if (data[m] !== void 0 && !Array.isArray(data[m])) throw new CliError("invalid-menu", `${m} must be an array of items.`, void 0, 2);
      return write((current, c) => ({
        header: data.header ? data.header.map((i, n) => normalizeItem(i, c, `header[${n}]`, findPost, findTerm)) : current.header,
        footer: data.footer ? data.footer.map((i, n) => normalizeItem(i, c, `footer[${n}]`, findPost, findTerm)) : current.footer
      }));
    }
    case "add": {
      const menu = menuOption(options.menu);
      const raw = { label: options.label };
      if (options.post !== void 0) raw.post = options.post;
      if (options.category !== void 0) raw.category = options.category;
      if (options.url !== void 0) raw.url = options.url;
      if (options.home) raw.home = true;
      return write((current, c) => {
        const item = normalizeItem(raw, c, "item", findPost, findTerm);
        const list2 = [...current[menu]];
        list2.splice(positionOption(options.position, list2.length) ?? list2.length, 0, item);
        return { ...current, [menu]: list2 };
      });
    }
    case "remove": {
      const menu = menuOption(options.menu);
      if (!ref) throw new CliError("usage", "menus remove needs an item id, label or position.", void 0, 2);
      return write((current) => {
        const list2 = [...current[menu]];
        list2.splice(findItemIndex(list2, ref, menu), 1);
        return { ...current, [menu]: list2 };
      });
    }
    case "move": {
      const menu = menuOption(options.menu);
      if (!ref) throw new CliError("usage", "menus move needs an item id, label or position.", void 0, 2);
      if (options.position === void 0) throw new CliError("usage", "menus move needs --position <n> (1-based).", void 0, 2);
      return write((current) => {
        const list2 = [...current[menu]];
        const [item] = list2.splice(findItemIndex(list2, ref, menu), 1);
        list2.splice(positionOption(options.position, list2.length), 0, item);
        return { ...current, [menu]: list2 };
      });
    }
    case "update": {
      const menu = menuOption(options.menu);
      if (!ref) throw new CliError("usage", "menus update needs an item id, label or position.", void 0, 2);
      const lang = typeof options.lang === "string" ? options.lang.trim() : void 0;
      const label = typeof options.label === "string" ? options.label : void 0;
      const targets = ["post", "category", "url", "home"].filter((k) => options[k] !== void 0 && options[k] !== false);
      if (targets.length > 1) throw new CliError("usage", `Give one target (${targets.map((t) => `--${t}`).join(" + ")} given).`, void 0, 2);
      if (lang !== void 0) {
        if (!lang) throw new CliError("usage", "--lang needs a language code.", void 0, 2);
        if (label === void 0) throw new CliError("usage", '--lang sets a translated label: it needs --label ("" removes the translation).', void 0, 2);
      } else if (label !== void 0 && !label.trim()) throw new CliError("invalid-menu", "--label can't be empty.", void 0, 2);
      if (label === void 0 && !targets.length) throw new CliError("usage", "Nothing to update.", "Pass --label (with --lang <code> for a translation), or a new target: --post, --category, --url or --home.", 2);
      return write((current, c) => {
        const list2 = JSON.parse(JSON.stringify(current[menu]));
        const item = findItemDeep(list2, ref, menu);
        if (label !== void 0) {
          if (lang) {
            const tr = { ...item.translations ?? {} };
            if (label.trim()) tr[lang] = { label };
            else delete tr[lang];
            if (Object.keys(tr).length) item.translations = tr;
            else delete item.translations;
          } else item.label = label;
        }
        if (targets.length) {
          const raw = { label: item.label, [targets[0]]: options[targets[0]] };
          const target = normalizeItem(raw, c, "item", findPost, findTerm);
          delete item.ref;
          delete item.externalUrl;
          if (target.externalUrl !== void 0) item.externalUrl = target.externalUrl;
          else item.ref = target.ref;
        }
        return { ...current, [menu]: list2 };
      });
    }
    default:
      throw new CliError("usage", action ? `Unknown menus action "${action}".` : "menus needs an action.", "Actions: get, set, add, update, remove, move.", 2);
  }
}
const menusCommand = {
  name: "menus",
  summary: "Header and footer menus, like the admin's Menus page: get (each item with its resolved target and link), set --data (the whole { header, footer }; items { label, post|category|home|url } or the stored { ref, externalUrl } shape), add / remove / move one item, update <item> (--label, --lang <code> --label for a translated label, or a new target --post|--category|--url|--home; nested items by id). Saving publishes data/menu.json (no page regeneration needed).",
  usage: "menus <get|set|add|update|remove|move> [<item id|label|position>] --site <alias> [--data <json>|@file] [--menu header|footer] [--label <t>] [--lang <code>] [--post <id|slug>] [--category <slug|name>] [--url <url>] [--home] [--position <n>]",
  options: [
    { name: "site", type: "string", description: "Site alias." },
    { name: "data", type: "string", description: "set: { header?: [...], footer?: [...] } as JSON or @file.json (a menu left out is kept)." },
    { name: "menu", type: "string", description: "add / update / remove / move: header or footer." },
    { name: "label", type: "string", description: `add / update: the item's label (update --lang: the translated label, "" removes it).` },
    { name: "lang", type: "string", description: "update: set the label of this language (translations[<lang>].label)." },
    { name: "post", type: "string", description: "add / update: link to a post or page (id or slug)." },
    { name: "category", type: "string", description: "add / update: link to a category archive (slug, name or id)." },
    { name: "url", type: "string", description: "add / update: external (or site-relative) URL." },
    { name: "home", type: "boolean", description: "add / update: link to the home page (add: the default)." },
    { name: "position", type: "string", description: "add / move: 1-based position (add default: at the end)." }
  ],
  run: run$9
};
const SECTIONS = ["site", "editor", "performance", "target"];
const SECRET_KEYS = /* @__PURE__ */ new Set(["token", "apiKey", "accessKeyId", "secretAccessKey", "accessToken", "password", "sqliteToken", "passphrase"]);
const LENGTH_RE = /^\d+(\.\d+)?(px|rem|em|pt|%)$/;
const LANG_RE = /^[A-Za-z]{2,3}(-[A-Za-z0-9]{1,8})*$/;
function mask(settings) {
  return Object.fromEntries(Object.entries(settings).map(([k, v]) => [k, SECRET_KEYS.has(k) && v ? "(set)" : v]));
}
async function pages() {
  const { fetchAllPosts, invalidateAllPostsCache } = await import("./chunks/posts-D28k7tn_.mjs");
  invalidateAllPostsCache();
  return fetchAllPosts({ type: "page" });
}
async function backend$1() {
  return (await import("./chunks/runtimeConfig-2M2d2Pbu.mjs")).getBackendKind();
}
async function readSection(section, settings, s) {
  switch (section) {
    case "site": {
      const { pickPublicLocale } = await import("./chunks/index-DCzLoAau.mjs").then((n) => n.e);
      const home = settings.homePageId ? (await pages()).find((p) => p.id === settings.homePageId) : void 0;
      return {
        title: settings.title,
        description: settings.description,
        language: settings.language,
        publicLocale: pickPublicLocale(settings.language),
        baseUrl: settings.baseUrl,
        postsPerPage: settings.postsPerPage,
        homeMode: settings.homeMode,
        homePageId: settings.homePageId ?? null,
        homePage: home ? { id: home.id, title: home.title, slug: home.slug, status: home.status } : null,
        discourageIndexing: settings.discourageIndexing === true,
        activeThemeId: settings.activeThemeId
      };
    }
    case "editor": {
      const { EDITOR_FONT_OPTIONS, DEFAULT_EDITOR_SIZES } = await import("./chunks/editorFonts-CO-y6ab0.mjs");
      return { ...settings.editorStyle ?? {}, fonts: EDITOR_FONT_OPTIONS.map((f) => f.name), defaults: DEFAULT_EDITOR_SIZES };
    }
    case "performance": {
      const kind = await backend$1();
      return { backend: kind, paginationMode: settings.paginationMode ?? "global", applicable: kind === "firebase" };
    }
    case "target": {
      const { readPublishTarget, targetSiteUrl } = await import("./chunks/target-C4nVAQvD.mjs");
      const stored = await readPublishTarget();
      const merged = { ...s.site.hosting.settings, ...stored.settings };
      const siteUrl = targetSiteUrl({ connectorId: stored.connectorId, settings: merged });
      const base = (settings.baseUrl ?? "").replace(/\/+$/, "");
      return {
        connectorId: stored.connectorId,
        settings: mask(merged),
        siteUrl: siteUrl || null,
        credential: s.site.credentials.hosting ?? null,
        baseUrlMismatch: siteUrl && base && siteUrl !== base ? { baseUrl: base, targetSiteUrl: siteUrl, fix: `agentcms settings set --base-url ${siteUrl}` } : null
      };
    }
  }
}
function boolValue(v, name) {
  if (v === void 0) return void 0;
  if (v === true || v === "true" || v === "yes" || v === "1") return true;
  if (v === false || v === "false" || v === "no" || v === "0") return false;
  throw new CliError("usage", `--${name} is true or false (got "${String(v)}").`, void 0, 2);
}
async function readInput(options) {
  const { readJsonOption, readTextOption } = await import("./chunks/adminCommon-DK5a9uhY.mjs");
  const data = readJsonOption(options.data, "data") ?? {};
  if (typeof data !== "object" || Array.isArray(data)) throw new CliError("usage", "--data must be a JSON object.", void 0, 2);
  const known = ["title", "description", "language", "baseUrl", "postsPerPage", "homeMode", "homePage", "homePageId", "discourageIndexing", "editorStyle", "paginationMode"];
  for (const k of Object.keys(data)) if (!known.includes(k)) throw new CliError("usage", `--data: unknown setting "${k}".`, `Known: ${known.join(", ")}.`, 2);
  const pick = (flag, key) => flag !== void 0 ? flag : data[key];
  const str = (v, name) => {
    if (v === void 0) return void 0;
    if (typeof v !== "string") throw new CliError("usage", `${name} must be a string.`, void 0, 2);
    return v;
  };
  const input = {
    title: str(pick(options.title, "title"), "title"),
    description: str(readTextOption(options.description, "description") ?? data.description, "description"),
    language: str(pick(options.language, "language"), "language"),
    baseUrl: str(pick(options["base-url"], "baseUrl"), "baseUrl"),
    homePage: str(pick(options["home-page"], "homePage") ?? data.homePageId, "homePage")
  };
  const ppp = pick(options["posts-per-page"], "postsPerPage");
  if (ppp !== void 0) {
    const n = typeof ppp === "number" ? ppp : Number(String(ppp));
    if (!Number.isInteger(n) || n < 1) throw new CliError("invalid-setting", `postsPerPage must be a whole number ≥ 1 (got "${String(ppp)}").`, void 0, 2);
    input.postsPerPage = n;
  }
  const mode = pick(options["home-mode"], "homeMode");
  if (mode !== void 0) {
    if (mode !== "latest-posts" && mode !== "static-page") throw new CliError("invalid-setting", `homeMode is latest-posts or static-page (got "${String(mode)}").`, void 0, 2);
    input.homeMode = mode;
  }
  input.discourageIndexing = boolValue(pick(options["discourage-indexing"], "discourageIndexing"), "discourage-indexing");
  const pm = pick(options["pagination-mode"], "paginationMode");
  if (pm !== void 0) {
    if (pm !== "global" && pm !== "paginated") throw new CliError("invalid-setting", `paginationMode is global or paginated (got "${String(pm)}").`, void 0, 2);
    input.paginationMode = pm;
  }
  const es = { ...data.editorStyle && typeof data.editorStyle === "object" ? data.editorStyle : {} };
  for (const [flag, key] of [["editor-font", "fontFamily"], ["editor-body-size", "bodySize"], ["editor-h1-size", "h1Size"], ["editor-h2-size", "h2Size"], ["editor-h3-size", "h3Size"]]) {
    if (options[flag] !== void 0) es[key] = options[flag];
  }
  if (Object.keys(es).length) input.editorStyle = es;
  return input;
}
async function run$8({ io, options, positionals }) {
  const [action, sub] = positionals;
  const { runAdmin, findPost } = await import("./chunks/adminCommon-DK5a9uhY.mjs");
  const alias = options.site;
  switch (action) {
    case "get": {
      const wanted = sub ?? options.section ?? "all";
      if (wanted !== "all" && !SECTIONS.includes(wanted)) throw new CliError("usage", `Unknown section "${wanted}".`, "site, editor, performance, target or all.", 2);
      return runAdmin(io, alias, {}, async (s) => {
        const settings = s.settings();
        const out = {};
        for (const sec of wanted === "all" ? SECTIONS : [wanted]) out[sec] = await readSection(sec, settings, s);
        return out;
      }, (r) => JSON.stringify(r, null, 2));
    }
    case "set": {
      const input = await readInput(options);
      if (!Object.values(input).some((v) => v !== void 0)) {
        throw new CliError("usage", "Nothing to set.", "Pass --title, --description, --language, --base-url, --posts-per-page, --home-mode, --home-page, --discourage-indexing, --editor-*, --pagination-mode or --data.", 2);
      }
      if (input.title !== void 0 && !input.title.trim()) throw new CliError("invalid-setting", "The site title can't be empty.", void 0, 2);
      if (input.language !== void 0 && !LANG_RE.test(input.language.trim())) throw new CliError("invalid-setting", `"${input.language}" is not a BCP-47 language tag.`, "e.g. en, fr, fr-FR, pt-BR.", 2);
      if (input.baseUrl !== void 0 && input.baseUrl.trim() && !/^https?:\/\/[^\s/]+/.test(input.baseUrl.trim())) {
        throw new CliError("invalid-setting", `"${input.baseUrl}" is not an http(s) URL.`, 'e.g. https://www.example.com (or "" to clear it).', 2);
      }
      if (input.editorStyle) {
        const { EDITOR_FONT_OPTIONS, SYSTEM_FONT_NAME } = await import("./chunks/editorFonts-CO-y6ab0.mjs");
        const f = input.editorStyle.fontFamily;
        if (f !== void 0 && f !== "" && !EDITOR_FONT_OPTIONS.some((o) => o.name === f)) {
          throw new CliError("invalid-setting", `Unknown editor font "${f}".`, `One of: ${EDITOR_FONT_OPTIONS.map((o) => o.name).join(", ")}.`, 2);
        }
        if (f === SYSTEM_FONT_NAME) input.editorStyle.fontFamily = "";
        for (const k of ["bodySize", "h1Size", "h2Size", "h3Size"]) {
          const v = input.editorStyle[k];
          if (v !== void 0 && typeof v !== "string") throw new CliError("invalid-setting", `editorStyle.${k} must be a string.`, void 0, 2);
          if (v && v.trim() && !LENGTH_RE.test(v.trim())) throw new CliError("invalid-setting", `editorStyle.${k} "${v}" is not a CSS length.`, "e.g. 16px, 1.125rem.", 2);
        }
      }
      return runAdmin(io, alias, { write: true, lock: true }, async (s) => {
        const { updateSettings } = await import("./chunks/settings-CEBDXaTg.mjs");
        const settings = s.settings();
        const kind = await backend$1();
        const changed = [];
        const next = [];
        const notes = [];
        const site = {};
        if (input.title !== void 0) site.title = input.title.trim();
        if (input.description !== void 0) site.description = input.description;
        if (input.language !== void 0) site.language = input.language.trim();
        if (input.baseUrl !== void 0) site.baseUrl = input.baseUrl.trim();
        if (input.postsPerPage !== void 0) site.postsPerPage = input.postsPerPage;
        if (input.discourageIndexing !== void 0) site.discourageIndexing = input.discourageIndexing;
        const homeMode = input.homeMode ?? settings.homeMode;
        let homePageId = settings.homePageId;
        if (input.homePage !== void 0) {
          if (input.homePage === "") homePageId = void 0;
          else {
            const page = findPost(await pages(), input.homePage, "page");
            if (page.status !== "online") notes.push(`"${page.title}" is a draft: publish it (\`agentcms content publish ${page.id}\`) or the home has no content.`);
            homePageId = page.id;
          }
        }
        if (input.homeMode !== void 0 || input.homePage !== void 0) {
          if (homeMode === "static-page" && !homePageId) {
            throw new CliError("invalid-setting", "A static-page home needs a page.", "Add --home-page <page id|slug> (see `agentcms content list --type page`).", 2);
          }
          if (input.homePage && homeMode !== "static-page") notes.push("--home-page only applies with --home-mode static-page: ignored.");
          site.homeMode = homeMode;
          site.homePageId = homeMode === "static-page" ? homePageId : void 0;
        }
        const editorPatch = {};
        if (input.editorStyle) {
          const merged = { ...settings.editorStyle ?? {}, ...input.editorStyle };
          const clean = {};
          if (merged.fontFamily) clean.fontFamily = merged.fontFamily;
          for (const k of ["bodySize", "h1Size", "h2Size", "h3Size"]) if (merged[k]?.trim()) clean[k] = merged[k].trim();
          editorPatch.editorStyle = Object.keys(clean).length ? clean : void 0;
        }
        let indexes = null;
        if (input.paginationMode !== void 0) {
          if (kind !== "firebase") {
            throw new CliError("not-applicable", `The pagination mode only exists on Firebase sites (this one is ${kind}).`, "Document-store backends keep everything in memory; nothing to set.", 2);
          }
          const { invalidateCachedReady, pingPaginatedQueries } = await import("./chunks/firestoreSetup-COoE4jom.mjs");
          invalidateCachedReady();
          if (input.paginationMode === "paginated") {
            const res = await pingPaginatedQueries().catch((e) => ({ ready: false, missingIndexes: [], unexpectedError: { code: "error", message: e.message } }));
            indexes = res;
            if (!res.ready) notes.push("Paginated mode needs two Firestore composite indexes that are not ready yet — the admin's lists fail until they exist (see `indexes`).");
          }
        }
        for (const [k, v] of Object.entries(site)) if (JSON.stringify(v) !== JSON.stringify(settings[k])) changed.push(k);
        if ("editorStyle" in editorPatch && JSON.stringify(editorPatch.editorStyle ?? null) !== JSON.stringify(settings.editorStyle ?? null)) changed.push("editorStyle");
        if (input.paginationMode !== void 0 && input.paginationMode !== (settings.paginationMode ?? "global")) changed.push("paginationMode");
        if (Object.keys(site).length) await updateSettings(site);
        if ("editorStyle" in editorPatch) await updateSettings(editorPatch);
        if (input.paginationMode !== void 0) await updateSettings({ paginationMode: input.paginationMode });
        await s.refresh();
        const has = (...keys) => keys.some((k) => changed.includes(k));
        const sitewide = has("discourageIndexing", "baseUrl", "language");
        if (has("homeMode", "homePageId")) next.push("agentcms regenerate repair");
        if (sitewide) next.push("agentcms regenerate everything");
        else if (has("homeMode", "homePageId", "title", "description", "postsPerPage")) next.push("agentcms regenerate all");
        if (has("paginationMode")) notes.push("Reload the admin in the browser for the new pagination mode.");
        if (has("editorStyle")) notes.push("Editor typography only changes the admin's editor canvas; nothing to regenerate.");
        const after = s.settings();
        const ml = after.pluginConfigs?.["agentcms-multilang"];
        const mlOn = after.enabledPlugins?.["agentcms-multilang"] !== false;
        const lang = (after.language || "").toLowerCase();
        if (mlOn && lang && (ml?.primaryLanguage ?? "en").toLowerCase() !== lang) {
          const others = (ml?.enabledLanguages ?? []).filter((l) => l.toLowerCase() !== lang);
          notes.push(
            others.length ? `agentcms-multilang's primary language is "${ml?.primaryLanguage ?? "en"}", not "${after.language}": \`agentcms plugins config agentcms-multilang --merge '{"primaryLanguage":"${after.language}","enabledLanguages":${JSON.stringify(others)}}'\`.` : `agentcms-multilang is enabled with primary language "${ml?.primaryLanguage ?? "en"}" and no other language. For a site in one language, disable it (\`agentcms plugins disable agentcms-multilang\`) or set \`{"primaryLanguage":"${after.language}"}\`.`
          );
        }
        return {
          changed,
          site: await readSection("site", after, s),
          editor: after.editorStyle ?? {},
          ...input.paginationMode !== void 0 ? { paginationMode: after.paginationMode ?? "global", indexes } : {},
          notes,
          next
        };
      }, (r) => [r.changed.length ? `Saved: ${r.changed.join(", ")}.` : "Nothing changed.", ...r.notes.map((n) => `  note: ${n}`), ...r.next.map((n) => `  next: ${n}`)].join("\n"));
    }
    case "target": {
      const what = sub ?? "show";
      if (what === "show") {
        return runAdmin(io, alias, {}, async (s) => readSection("target", s.settings(), s), (r) => `${r.connectorId}${r.siteUrl ? ` → ${r.siteUrl}` : ""}${r.baseUrlMismatch ? `
  note: settings.baseUrl is ${r.baseUrlMismatch.baseUrl} — fix: ${r.baseUrlMismatch.fix}` : ""}`);
      }
      if (what === "test") {
        return runAdmin(io, alias, {}, async (s) => {
          const { getStorageConfig } = await import("./chunks/registry-Df5_x1nj.mjs").then((n) => n.C);
          const { testStorageConnection } = await import("./chunks/registry-Df5_x1nj.mjs").then((n) => n.z);
          const { requireCredential: requireCredential2 } = await Promise.resolve().then(() => credentials);
          const stored = await getStorageConfig().catch(() => null);
          const connectorId = stored?.connectorId ?? s.site.hosting.connectorId;
          if (!connectorId) throw new CliError("hosting-unknown", `The publish target of ${s.site.alias} is unknown.`);
          const values = s.site.credentials.hosting ? requireCredential2(s.site.credentials.hosting).values : {};
          const settings = { ...s.site.hosting.settings, ...stored?.settings ?? {}, ...values };
          const res = await testStorageConnection(connectorId, settings);
          if (!res.ok) throw new CliError("connection-failed", `${connectorId}: ${res.detail}`, s.site.credentials.hosting ? `Check the account with \`agentcms credentials set ${s.site.credentials.hosting}\`.` : "Record the hosting credential with `agentcms site add … --hosting-credential <account>`.");
          return { connectorId, ok: true, detail: res.detail };
        }, (r) => `✓ ${r.connectorId}: ${r.detail}`);
      }
      throw new CliError("usage", `Unknown target action "${what}".`, "settings target [show|test].", 2);
    }
    default:
      throw new CliError("usage", action ? `Unknown settings action "${action}".` : "settings needs an action.", "Actions: get, set, target.", 2);
  }
}
const settingsCommand = {
  name: "settings",
  summary: "Settings → General, like the admin: get [site|editor|performance|target|all], set (title, description, language, base URL, posts per page, home mode + page, discourage indexing, editor typography, pagination mode on Firebase), target [show|test] (publish target without secrets / Test connection). Saving republishes nothing: run the `next` regeneration.",
  usage: "settings <get [section]|set|target [show|test]> --site <alias> [--section site|editor|performance|target|all] [--title <t>] [--description <t>|@file] [--language <bcp47>] [--base-url <url>] [--posts-per-page <n>] [--home-mode latest-posts|static-page] [--home-page <page id|slug>] [--discourage-indexing true|false] [--editor-font <name>] [--editor-body-size <len>] [--editor-h1-size <len>] [--editor-h2-size <len>] [--editor-h3-size <len>] [--pagination-mode global|paginated] [--data <json>|@file]",
  options: [
    { name: "site", type: "string", description: "Site alias." },
    { name: "section", type: "string", description: "get: site, editor, performance, target or all (default)." },
    { name: "title", type: "string", description: "Site title." },
    { name: "description", type: "string", description: "Site description (text, @file or -)." },
    { name: "language", type: "string", description: "Public site language (BCP-47: en, fr-FR…) — <html lang>." },
    { name: "base-url", type: "string", description: 'Public base URL (https://…; "" clears it). Drives canonicals, sitemaps, RSS, sub-folder links.' },
    { name: "posts-per-page", type: "string", description: "Posts per listing page (≥ 1)." },
    { name: "home-mode", type: "string", description: "latest-posts or static-page." },
    { name: "home-page", type: "string", description: 'The page shown as home in static-page mode (id or slug; "" clears it).' },
    { name: "discourage-indexing", type: "string", description: "true: noindex on every page + robots.txt Disallow (after regeneration); false: indexable." },
    { name: "editor-font", type: "string", description: 'Admin editor font (see `settings get editor`; "" = system).' },
    { name: "editor-body-size", type: "string", description: 'Admin editor body size (CSS length; "" = default).' },
    { name: "editor-h1-size", type: "string", description: "Admin editor H1 size." },
    { name: "editor-h2-size", type: "string", description: "Admin editor H2 size." },
    { name: "editor-h3-size", type: "string", description: "Admin editor H3 size." },
    { name: "pagination-mode", type: "string", description: "Firebase only: global or paginated (needs composite indexes)." },
    { name: "data", type: "string", description: "Settings as JSON (or @file.json): title, description, language, baseUrl, postsPerPage, homeMode, homePage, discourageIndexing, editorStyle{fontFamily,bodySize,h1Size,h2Size,h3Size}, paginationMode. Flags override it." }
  ],
  run: run$8
};
const ACTIONS = {
  "agentcms-sitemaps": ["robots", "stylesheets", "regenerate"],
  "agentcms-rss": ["stylesheet", "regenerate"],
  "agentcms-search": ["regenerate"],
  "agentcms-archives": ["regenerate"],
  "agentcms-favicon": ["set", "remove", "manifest"],
  "agentcms-import": ["init", "list", "scan", "run"]
};
function nextSteps(id, alias) {
  const all = `agentcms regenerate all --site ${alias}`;
  switch (id) {
    case "agentcms-sitemaps":
    case "agentcms-rss":
    case "agentcms-search":
      return [`agentcms regenerate ${id} --site ${alias}`];
    case "agentcms-archives":
      return [`agentcms regenerate ${id} --site ${alias}`, all];
    case "agentcms-favicon":
    case "agentcms-import":
      return [];
    // Languages change URLs, listings, sitemaps, feeds and search indexes.
    case "agentcms-multilang":
      return [`agentcms regenerate everything --site ${alias}`];
    default:
      return [all];
  }
}
async function muPlugins() {
  return (await import("./chunks/media-9UyLuwBC.mjs").then((n) => n.h)).listMuPlugins();
}
async function pluginRows(s) {
  const { readBackendRegistryForCli } = await import("./chunks/sessionRegistry-gjzuaydG.mjs");
  const registry = await readBackendRegistryForCli().catch(() => null) ?? { plugins: [] };
  const enabled = s.settings().enabledPlugins ?? {};
  const rows = /* @__PURE__ */ new Map();
  const add = (m, kind, installed2) => rows.set(m.id, {
    id: m.id,
    name: m.name,
    version: m.version,
    kind,
    installed: installed2,
    enabled: kind === "must-use" || enabled[m.id] !== false,
    loaded: true,
    hasSettings: !!m.settings,
    actions: ACTIONS[m.id] ?? [],
    description: m.description ?? null
  });
  for (const m of await muPlugins()) add(m, "must-use", "bundled");
  for (const m of s.host.plugins.PLUGINS) add(m, "regular", "bundled");
  const failed = new Map(s.loadedExtensions.failed.map((f) => [f.id, f.error]));
  for (const m of s.host.registry.listExternalPlugins()) add(m, "regular", "external");
  for (const entry of registry.plugins) {
    const row = rows.get(entry.id);
    if (row) {
      row.installed = "external";
      continue;
    }
    rows.set(entry.id, {
      id: entry.id,
      name: entry.id,
      version: entry.version ?? "",
      kind: "regular",
      installed: "external",
      enabled: enabled[entry.id] !== false,
      loaded: false,
      hasSettings: false,
      actions: [],
      description: null,
      error: failed.get(`plugins/${entry.id}`) ?? "not loaded"
    });
  }
  return [...rows.values()];
}
async function findPlugin(s, id) {
  if (!id) throw new CliError("usage", "Which plugin? Give its id.", "List them with `agentcms plugins list`.", 2);
  const mu = (await muPlugins()).find((m) => m.id === id);
  if (mu) return { manifest: mu, mu: true };
  const regular = s.host.registry.listExternalPlugins().find((m) => m.id === id) ?? s.host.plugins.PLUGINS.find((m) => m.id === id);
  if (regular) return { manifest: regular, mu: false };
  const failed = s.loadedExtensions.failed.find((f) => f.id === `plugins/${id}`);
  if (failed) throw new CliError("plugin-not-loaded", `Plugin "${id}" is installed but could not be loaded: ${failed.error}`, "Check the site's admin (`agentcms doctor`), or reinstall it (`agentcms ext install`).");
  throw new CliError("not-found", `No plugin "${id}" on this site.`, "List them with `agentcms plugins list`; install one with `agentcms ext install`.", 2);
}
function currentConfig(stored, defaults) {
  return { ...defaults ?? {}, ...stored ?? {} };
}
function pluginConfigOf(s, m) {
  return currentConfig(s.settings().pluginConfigs?.[m.id], m.settings?.defaultConfig);
}
async function savePluginConfig(s, id, next) {
  const { updatePluginConfig } = await import("./chunks/settings-CEBDXaTg.mjs");
  await updatePluginConfig(id, next);
  return s.refresh();
}
async function corpus() {
  const { fetchAllPosts, invalidateAllPostsCache } = await import("./chunks/posts-D28k7tn_.mjs");
  invalidateAllPostsCache();
  const [posts, pages2] = await Promise.all([fetchAllPosts({ type: "post" }), fetchAllPosts({ type: "page" })]);
  return { posts, pages: pages2 };
}
async function refreshMenuJson$1(s) {
  const { publishMenuJson } = await import("./chunks/menuPublisher-CNZxyV6S.mjs");
  const { posts, pages: pages2 } = await corpus();
  try {
    await publishMenuJson(s.settings(), posts, pages2, await s.terms());
  } catch (err) {
    s.log({ level: "warn", message: `menu.json republish failed: ${err.message}` });
  }
}
async function batched$1(fn) {
  const { withStorageBatch } = await import("./chunks/siteFiles-BbBoVJww.mjs").then((n) => n.s);
  return withStorageBatch(fn);
}
function requireBaseUrl(s, id) {
  const baseUrl = s.settings().baseUrl;
  if (!baseUrl) throw new CliError("base-url-missing", `${id} needs the site URL (settings.baseUrl).`, `Set it with \`agentcms settings set --data '{"baseUrl":"https://…"}' --site ${s.site.alias}\`.`);
  return baseUrl;
}
async function resolveRssTerms(s, cfg) {
  const { findTerm } = await import("./chunks/adminCommon-DK5a9uhY.mjs");
  const terms = await s.terms();
  const idOf = (ref) => {
    const t = typeof ref === "string" ? findTerm(terms, ref, "category") : void 0;
    if (!t) throw new CliError("not-found", `No category "${String(ref)}" (agentcms-rss).`, "List them with `agentcms terms list --type category`.", 2);
    return t.id;
  };
  const out = { ...cfg };
  const site = out.site;
  if (site && Array.isArray(site.excludedTermIds)) out.site = { ...site, excludedTermIds: site.excludedTermIds.map(idOf) };
  if (Array.isArray(out.categoryFeeds)) {
    out.categoryFeeds = out.categoryFeeds.map((f) => ({ itemCount: 20, addToFooter: false, ...f, termId: idOf(f.termId) }));
  }
  return out;
}
const PWA_KEYS = ["pwaName", "pwaShortName", "pwaThemeColor", "pwaBackgroundColor", "pwaDisplay"];
function pwaInput(cfg, settings) {
  const title = settings.title ?? "";
  return {
    name: String(cfg.pwaName || title),
    shortName: String(cfg.pwaShortName || (title ? title.slice(0, 12) : "")),
    themeColor: String(cfg.pwaThemeColor ?? "#ffffff"),
    backgroundColor: String(cfg.pwaBackgroundColor ?? "#ffffff"),
    display: cfg.pwaDisplay ?? "standalone"
  };
}
async function readPwaOption(value) {
  const { readJsonOption } = await import("./chunks/adminCommon-DK5a9uhY.mjs");
  const raw = readJsonOption(value, "pwa");
  if (raw === void 0) return {};
  if (typeof raw !== "object" || raw === null || Array.isArray(raw)) throw new CliError("usage", "--pwa must be a JSON object.", void 0, 2);
  const out = {};
  for (const [k, v] of Object.entries(raw)) {
    const key = k.startsWith("pwa") ? k : `pwa${k[0].toUpperCase()}${k.slice(1)}`;
    if (!PWA_KEYS.includes(key)) throw new CliError("usage", `--pwa: unknown field "${k}".`, "Fields: name, shortName, themeColor, backgroundColor, display (standalone|browser|fullscreen|minimal-ui).", 2);
    out[key] = v;
  }
  return out;
}
const IMAGE_MIME = { ".png": "image/png", ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".webp": "image/webp", ".gif": "image/gif", ".svg": "image/svg+xml" };
function imageFileFromDisk(path, allowed) {
  const file2 = resolve(path);
  if (!existsSync(file2) || !statSync(file2).isFile()) throw new CliError("not-found", `${path} does not exist.`, void 0, 2);
  const type = IMAGE_MIME[extname(file2).toLowerCase()];
  if (!type || !allowed.includes(type)) throw new CliError("usage", `${basename(file2)}: unsupported image type.`, `Use ${allowed.map((t) => t.replace("image/", "")).join(", ")}.`, 2);
  return new File([readFileSync(file2)], basename(file2), { type });
}
function classify(name) {
  const ext = extname(name).slice(1).toLowerCase();
  if (/^readme\.md$/i.test(name)) return null;
  if (ext === "md") return "markdown";
  if (ext === "xml") return "xml";
  if (["jpg", "jpeg", "png", "webp", "svg", "gif"].includes(ext)) return "image";
  if (/^_terms\.json$/i.test(name)) return "markdown";
  return null;
}
function bundleFromDisk(path) {
  const root = resolve(path);
  if (!existsSync(root)) throw new CliError("not-found", `${path} does not exist.`, void 0, 2);
  const files = [];
  const walk = (p) => {
    if (statSync(p).isDirectory()) {
      for (const e of readdirSync(p).sort()) if (!e.startsWith(".") && e !== "node_modules") walk(join(p, e));
    } else files.push(p);
  };
  walk(root);
  const bundle = { source: "drop", markdown: [], xml: [], images: [], ignored: [] };
  for (const f of files) {
    const name = basename(f);
    const kind = classify(name);
    if (kind === "markdown") bundle.markdown.push({ name, content: readFileSync(f, "utf8") });
    else if (kind === "xml") bundle.xml.push({ name, content: readFileSync(f, "utf8") });
    else if (kind === "image") bundle.images.push({ filename: name, blob: new File([readFileSync(f)], name, { type: IMAGE_MIME[extname(name).toLowerCase()] }) });
    else bundle.ignored.push(name);
  }
  return bundle;
}
function summarizeScan(summary, statusMode) {
  return {
    entries: summary.entries.map((e) => ({
      source: e.source.sourceName,
      type: e.source.type,
      title: e.source.title,
      slug: e.finalSlug,
      slugWasModified: e.slugWasModified,
      category: e.source.categoryName ?? null,
      tags: e.source.tags,
      sourceStatus: e.source.status,
      willPublish: statusMode === "online" || statusMode === "from-source" && e.source.status === "online",
      translations: Object.keys(e.source.translations ?? {})
    })),
    categoriesToCreate: summary.categoriesToCreate.map((t) => t.name),
    tagsToCreate: summary.tagsToCreate.map((t) => t.name),
    imagesToUpload: summary.imagesToUpload,
    wordpressAttachments: summary.wpAttachmentsToFetch.length,
    termTranslations: summary.termTranslations.length,
    errors: summary.warnings.filter((w) => w.level === "error"),
    warnings: summary.warnings.filter((w) => w.level !== "error")
  };
}
async function importOptions(s, m, options) {
  const { DEFAULT_IMPORT_OPTIONS } = await import("./chunks/media-9UyLuwBC.mjs").then((n) => n.i);
  const stored = pluginConfigOf(s, m).options ?? {};
  const opts = { ...DEFAULT_IMPORT_OPTIONS, ...stored };
  if (options.status !== void 0) {
    const v = String(options.status);
    if (!["draft", "online", "from-source"].includes(v)) throw new CliError("usage", `--status is draft, online or from-source (got "${v}").`, void 0, 2);
    opts.statusMode = v;
  }
  if (options.category !== void 0) opts.defaultCategory = String(options.category);
  if (options["keep-files"]) opts.moveProcessedFiles = false;
  return opts;
}
async function runImportAction(options, s, m, action, arg) {
  const imp = await import("./chunks/media-9UyLuwBC.mjs").then((n) => n.i);
  if (action === "init") {
    await batched$1(() => imp.initializeFolder());
    return { action, folder: imp.IMPORT_FOLDER };
  }
  if (action === "list") {
    const { getStorageCapabilities } = await import("./chunks/siteFiles-BbBoVJww.mjs").then((n) => n.s);
    if (!(await getStorageCapabilities()).list) throw new CliError("unsupported", "This hosting can't list files, so the import folder can't be read.", "Import from a local folder instead: `plugins action agentcms-import scan <path>`.");
    const listing = await imp.listImportFolder();
    return { action, folder: imp.IMPORT_FOLDER, markdown: listing.markdownFiles.map((f) => f.path), xml: listing.xmlFiles.map((f) => f.path), images: listing.imageFiles.map((f) => f.path) };
  }
  const fromHosting = !!options["from-hosting"];
  if (!arg && !fromHosting) throw new CliError("usage", `import ${action} needs a local folder (.md + images) or a WordPress .xml export — or --from-hosting for the site's ${imp.IMPORT_FOLDER}/ folder.`, void 0, 2);
  const bundle = fromHosting ? await imp.buildBundleFromFolder() : bundleFromDisk(arg);
  if (bundle.markdown.length === 0 && bundle.xml.length === 0) throw new CliError("no-sources", "No Markdown or WordPress XML file found to import.", void 0, 2);
  const opts = await importOptions(s, m, options);
  const { currentUserId } = await import("./chunks/adminCommon-DK5a9uhY.mjs");
  const { posts, pages: pages2 } = await corpus();
  const scanCtx = { posts, pages: pages2, terms: await s.terms(), media: await s.media(), users: await s.users(), importerUserId: await currentUserId() };
  const summary = imp.scanBundle(bundle, scanCtx, opts);
  const scan = { ...summarizeScan(summary, opts.statusMode), ignored: bundle.ignored ?? [], options: opts };
  if (action === "scan" || !options.yes) {
    return { action, needsConfirmation: action === "run", ...scan };
  }
  if (scan.errors.length) {
    throw new CliError("import-errors", `The scan found ${scan.errors.length} blocking error(s): ${scan.errors.map((e) => `${e.source}: ${e.message}`).join("; ")}`, "Fix the sources (see `plugins action agentcms-import scan`).");
  }
  const progress = [];
  const out = await batched$1(
    () => imp.runImport({ ctx: scanCtx, options: opts, bundle, summary, settings: s.settings(), onProgress: (msg) => progress.push(msg) })
  );
  return {
    action,
    created: out.createdPostIds,
    published: out.publishedPostIds,
    terms: out.createdTermIds,
    media: out.uploadedMediaIds,
    warnings: out.warnings,
    errors: out.errors,
    progress
  };
}
async function runTarget(s, id) {
  const { listRegenerationTargets } = await import("./chunks/regenerationTargetRegistry-3NmN64mg.mjs");
  const target = listRegenerationTargets().find((t) => t.id === id);
  if (!target) throw new CliError("unknown-target", `${id} registered no regeneration (is it enabled?).`, `Enable it with \`agentcms plugins enable ${id}\`.`);
  const ctx = await s.context();
  await batched$1(() => target.run(ctx, s.log));
}
async function pluginAction(options, s, m, action, arg) {
  const known = ACTIONS[m.id] ?? [];
  if (!action || !known.includes(action)) {
    throw new CliError("usage", action ? `"${action}" is not an action of ${m.id}.` : `Which ${m.id} action?`, known.length ? `Actions of ${m.id}: ${known.join(", ")}.` : `${m.id} has no settings-page action (see \`plugins config ${m.id}\`).`, 2);
  }
  const alias = s.site.alias;
  switch (m.id) {
    case "agentcms-sitemaps": {
      const baseUrl = requireBaseUrl(s, m.id);
      const gen = await import("./chunks/generator-CAsNhwGF.mjs");
      if (action === "regenerate") {
        await runTarget(s, m.id);
        return { action };
      }
      let config = pluginConfigOf(s, m);
      if (action === "robots") {
        if (options["default-robots"]) {
          config = { ...config, robotsTxt: gen.defaultRobotsTxt(baseUrl, config.newsEnabled) };
          await savePluginConfig(s, m.id, config);
        }
        await batched$1(() => gen.regenerateRobotsTxt({ config, baseUrl, discourageIndexing: s.settings().discourageIndexing === true }));
        return { action, uploaded: ["robots.txt"] };
      }
      const res = await batched$1(() => gen.regenerateStylesheets({ settings: s.settings(), config }));
      return { action, ...res };
    }
    case "agentcms-rss": {
      requireBaseUrl(s, m.id);
      if (action === "regenerate") {
        await runTarget(s, m.id);
        return { action };
      }
      const gen = await import("./chunks/generator-BE3-TLX4.mjs");
      await batched$1(() => gen.regenerateStylesheet({ settings: s.settings() }));
      return { action, uploaded: ["rss.xsl"] };
    }
    case "agentcms-search":
    case "agentcms-archives":
      await runTarget(s, m.id);
      return { action };
    case "agentcms-favicon": {
      const gen = await import("./chunks/generator-DQlMwbpp.mjs");
      const { DEFAULT_FAVICON_CONFIG } = await import("./chunks/media-9UyLuwBC.mjs").then((n) => n.S);
      const cfg = pluginConfigOf(s, m);
      const draft = { ...cfg, ...await readPwaOption(options.pwa) };
      const regen = [`agentcms regenerate all --site ${alias}`];
      if (action === "set") {
        if (!arg) throw new CliError("usage", "favicon set needs an image file (PNG, JPEG or WebP; square, 512 px or more).", void 0, 2);
        const file2 = imageFileFromDisk(arg, ["image/png", "image/jpeg", "image/webp", "image/svg+xml"]);
        if (file2.type === "image/svg+xml") throw new CliError("unsupported", "The CLI can't rasterize SVG favicons.", "Convert the logo to a 512×512 PNG and pass that, or upload the SVG from the admin.", 2);
        const result = await batched$1(() => gen.generateAndUploadFavicons({ file: file2, pwa: pwaInput(draft, s.settings()) }));
        const next = { ...draft, enabled: true, uploadedAt: Date.now(), ...result };
        await savePluginConfig(s, m.id, next);
        return { action, folder: gen.FAVICON_FOLDER, files: result, next: regen };
      }
      if (action === "remove") {
        await batched$1(() => gen.removeAllFavicons());
        const next = { ...DEFAULT_FAVICON_CONFIG, ...Object.fromEntries(PWA_KEYS.map((k) => [k, draft[k]])) };
        await savePluginConfig(s, m.id, next);
        return { action, removed: gen.FAVICON_FOLDER, next: regen };
      }
      let regenerated = false;
      if (cfg.hasManifest || cfg.enabled) {
        await batched$1(() => gen.regenerateManifest({ pwa: pwaInput(draft, s.settings()) }));
        regenerated = true;
      }
      await savePluginConfig(s, m.id, { ...draft, uploadedAt: cfg.enabled ? Date.now() : draft.uploadedAt });
      return { action, regenerated, pwa: pwaInput(draft, s.settings()) };
    }
    case "agentcms-import":
      return runImportAction(options, s, m, action, arg);
  }
  return { action };
}
async function applyConfig(s, m, prev, next) {
  const effects = [];
  switch (m.id) {
    case "agentcms-rss": {
      const gen = await import("./chunks/generator-BE3-TLX4.mjs");
      const resolved = await resolveRssTerms(s, next);
      return batched$1(async () => {
        const cleanup = await gen.cleanupRemovedFeeds({ prevConfig: prev, nextConfig: resolved });
        for (const d of cleanup.deleted) effects.push(`deleted ${d}`);
        await savePluginConfig(s, m.id, cleanup.nextConfig);
        await refreshMenuJson$1(s);
        effects.push("published data/menu.json");
        return { saved: cleanup.nextConfig, effects };
      });
    }
    case "agentcms-favicon": {
      const changed = PWA_KEYS.some((k) => JSON.stringify(prev[k]) !== JSON.stringify(next[k]));
      if (changed && (prev.hasManifest || prev.enabled)) {
        const gen = await import("./chunks/generator-DQlMwbpp.mjs");
        await batched$1(() => gen.regenerateManifest({ pwa: pwaInput(next, s.settings()) }));
        next = { ...next, uploadedAt: prev.enabled ? Date.now() : next.uploadedAt };
        effects.push(`uploaded ${gen.FAVICON_FOLDER}/site.webmanifest`);
      }
      break;
    }
    case "agentcms-import": {
      const o = next.options ?? {};
      if (o.statusMode !== void 0 && !["draft", "online", "from-source"].includes(String(o.statusMode))) {
        throw new CliError("usage", `options.statusMode is draft, online or from-source (got "${String(o.statusMode)}").`, void 0, 2);
      }
      break;
    }
  }
  await savePluginConfig(s, m.id, next);
  return { saved: next, effects };
}
async function run$7({ io, options, positionals }) {
  const [action, id, sub, arg] = positionals;
  const { runAdmin } = await import("./chunks/adminCommon-DK5a9uhY.mjs");
  const alias = options.site;
  const write = { write: true, hosting: true, extensions: true, lock: true };
  switch (action) {
    case "list":
      return runAdmin(
        io,
        alias,
        { extensions: true },
        (s) => pluginRows(s),
        (rows) => rows.map((r) => `${r.enabled ? "●" : "○"} ${r.id.padEnd(22)} ${r.version.padEnd(8)} ${r.kind === "must-use" ? "must-use" : r.enabled ? "enabled" : "disabled"}${r.installed === "external" ? " (installed)" : ""}${r.hasSettings ? "  config" : ""}${r.actions.length ? `  actions: ${r.actions.join(", ")}` : ""}${r.loaded ? "" : `  NOT LOADED: ${r.error}`}`).join("\n") + "\n(install / uninstall a plugin ZIP: agentcms ext install|uninstall)"
      );
    case "enable":
    case "disable":
      return runAdmin(io, alias, { write: true, extensions: true, lock: true }, async (s) => {
        const { manifest, mu } = await findPlugin(s, id);
        if (mu) throw new CliError("must-use", `${manifest.id} is a must-use plugin: it is always active.`, void 0, 2);
        const enabledPlugins = s.settings().enabledPlugins ?? {};
        const current = enabledPlugins[manifest.id] !== false;
        const wanted = action === "enable";
        if (current !== wanted) {
          const { updateSettings } = await import("./chunks/settings-CEBDXaTg.mjs");
          await updateSettings({ enabledPlugins: { ...enabledPlugins, [manifest.id]: wanted } });
          await s.refresh();
        }
        const warnings = [];
        if (wanted && manifest.id === "agentcms-search") warnings.push(...await searchTriggerWarnings(s));
        return {
          id: manifest.id,
          enabled: wanted,
          changed: current !== wanted,
          warnings,
          // Toggling a plugin doesn't republish: its head / body output and
          // its files follow on the next regeneration.
          next: current !== wanted ? [`agentcms regenerate everything --site ${s.site.alias}`] : []
        };
      }, (r) => `${r.id} ${r.enabled ? "enabled" : "disabled"}${r.changed ? "" : " (already)"}${r.next.length ? `
Regenerate the site for it to show: ${r.next.join(" ; ")}` : ""}${r.warnings.map((w) => `
  warning: ${w}`).join("")}`);
    case "config": {
      const { readConfigRequest } = await import("./chunks/configEdit-BtaThQg1.mjs");
      const req = readConfigRequest(options);
      const readOnly = req.mode === "get" || req.mode === "schema";
      return runAdmin(io, alias, readOnly ? { extensions: true } : write, async (s) => {
        const { manifest, mu } = await findPlugin(s, id);
        if (!manifest.settings) throw new CliError("no-settings", `${manifest.id} has no settings.`, void 0, 2);
        const defaults = manifest.settings.defaultConfig;
        if (req.mode === "schema") {
          const { describeSettings } = await import("./chunks/configEdit-BtaThQg1.mjs");
          return { id: manifest.id, documented: !!manifest.settings.schema, settings: describeSettings(defaults, manifest.settings.schema), defaultConfig: defaults, actions: ACTIONS[manifest.id] ?? [] };
        }
        const prev = pluginConfigOf(s, manifest);
        if (req.mode === "get") return { id: manifest.id, config: prev, stored: s.settings().pluginConfigs?.[manifest.id] ?? null };
        const { deepMerge, shapeWarnings, changedKeys, schemaErrors } = await import("./chunks/configEdit-BtaThQg1.mjs");
        const { keepManaged } = await import("./chunks/configEdit-BtaThQg1.mjs");
        const next = req.mode === "set" ? keepManaged(prev, req.value, manifest.settings.schema) : deepMerge(prev, req.value);
        const invalid = schemaErrors(manifest.settings.schema, next, prev);
        if (invalid.length) throw new CliError("invalid-value", `${manifest.id}: ${invalid.join(" ")}`, `See \`agentcms plugins config ${manifest.id} --schema\`.`, 2);
        const warnings = shapeWarnings(defaults, req.value, manifest.id, manifest.settings.schema);
        if (!mu && s.settings().enabledPlugins?.[manifest.id] === false) warnings.push(`${manifest.id} is disabled: the settings are saved but have no effect until \`agentcms plugins enable ${manifest.id}\`.`);
        const { saved, effects } = await applyConfig(s, manifest, prev, next);
        return { id: manifest.id, config: saved, changed: changedKeys(prev, saved), effects, warnings, next: nextSteps(manifest.id, s.site.alias) };
      }, (r) => {
        if ("settings" in r && Array.isArray(r.settings)) {
          return r.settings.map((f) => `${f.path} (${f.type}, default ${JSON.stringify(f.default)})${f.values ? ` — one of ${f.values.map((v) => JSON.stringify(v)).join(" | ")}` : ""}${f.format ? ` — ${f.format}` : ""}${f.description ? `
    ${f.description}` : ""}`).join("\n");
        }
        if (!("changed" in r) || !r.changed) return JSON.stringify(r.config, null, 2);
        return [`Saved ${r.id} (${r.changed.length ? r.changed.join(", ") : "no change"}).`, ...r.effects.map((e) => `  ${e}`), ...r.warnings.map((w) => `  warning: ${w}`), ...r.next.length ? [`Then: ${r.next.join(" ; ")}`] : []].join("\n");
      });
    }
    case "action": {
      const readOnly = id === "agentcms-import" && (sub === "list" || sub === "scan" || sub === "run" && !options.yes);
      return runAdmin(io, alias, readOnly ? { hosting: true, extensions: true } : write, async (s) => {
        const { manifest, mu } = await findPlugin(s, id);
        if (!mu && s.settings().enabledPlugins?.[manifest.id] === false) {
          throw new CliError("plugin-disabled", `${manifest.id} is disabled.`, `Enable it first: \`agentcms plugins enable ${manifest.id}\`.`);
        }
        const out = { id: manifest.id, ...await pluginAction(options, s, manifest, sub, arg) };
        return out;
      }, (r) => {
        if (r.needsConfirmation) return `${humanScan(r)}
Nothing imported — re-run with --yes once the user agrees.`;
        if (r.action === "scan") return humanScan(r);
        const next = r.next ?? [];
        return `${r.id} ${String(r.action)}: done.${next.length ? `
Then: ${next.join(" ; ")}` : ""}`;
      });
    }
    default:
      throw new CliError("usage", action ? `Unknown plugins action "${action}".` : "plugins needs an action.", "Actions: list, enable, disable, config, action.", 2);
  }
}
function humanScan(r) {
  const entries = r.entries ?? [];
  const errors = r.errors ?? [];
  return [
    `${entries.length} entr${entries.length === 1 ? "y" : "ies"} to import:`,
    ...entries.map((e) => `  ${e.type} ${e.slug} — ${e.title}${e.willPublish ? " (published)" : ""}`),
    `categories to create: ${r.categoriesToCreate.join(", ") || "none"}; tags: ${r.tagsToCreate.join(", ") || "none"}; images: ${r.imagesToUpload.length}`,
    ...errors.map((e) => `  error: ${e.source}: ${e.message}`)
  ].join("\n");
}
async function searchTriggerWarnings(s) {
  const { publicUrlOf: publicUrlOf2 } = await Promise.resolve().then(() => remote);
  const url = `${publicUrlOf2(s.site)}/`;
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(8e3), cache: "no-store" });
    if (!res.ok) return [];
    const html = await res.text();
    if (/\sdata-cms-search(?=[\s=>/])/.test(html)) return [];
    return [
      'The active theme has no search button ([data-cms-search]) on the home page, so visitors can\'t open the search. Add one to the custom code\'s `bodyEnd`, keeping what is already there (`plugins config agentcms-custom-code --get`), e.g. <button type="button" data-cms-search aria-label="Search" style="position:fixed;right:1rem;bottom:1rem;z-index:50;padding:.6rem .9rem;border:0;border-radius:999px;background:#111;color:#fff">Search</button> — then `regenerate all`.'
    ];
  } catch {
    return [];
  }
}
const pluginsCommand = {
  name: "plugins",
  summary: "The admin's Plugins page and plugin settings: list; enable|disable <id> (then regenerate); config <id> (--get, --schema = default config, --set <json> replaces, --merge <json> deep-merges; runs the settings page's side effects); action <id> <action> = the settings page buttons — agentcms-sitemaps robots [--default-robots]|stylesheets|regenerate, agentcms-rss stylesheet|regenerate, agentcms-search|agentcms-archives regenerate, agentcms-favicon set <image> [--pwa json]|remove|manifest [--pwa json], agentcms-import scan|run <folder|wp.xml> [--status draft|online|from-source] [--category <name>] (run: plan first, --yes) or init|list (the hosting's _cms-import/ folder, --from-hosting). Plugin ZIPs: `ext install`.",
  usage: "plugins <list|enable|disable|config|action> [<id>] [<action>] [<path>] --site <alias> [--get|--schema|--set <json>|@file|--merge <json>|@file] [--default-robots] [--pwa <json>] [--status draft|online|from-source] [--category <name>] [--from-hosting] [--keep-files] [--yes]",
  options: [
    { name: "site", type: "string", description: "Site alias." },
    { name: "get", type: "boolean", description: "config: print the current config (stored merged over defaults) — the default." },
    { name: "schema", type: "boolean", description: "config: print the plugin's default config (every key it knows)." },
    { name: "set", type: "string", description: "config: replace the whole config with this JSON object (or @file.json)." },
    { name: "merge", type: "string", description: "config: deep-merge this JSON object into the current config (arrays are replaced)." },
    { name: "default-robots", type: "boolean", description: "action agentcms-sitemaps robots: reset robots.txt to the default text first." },
    { name: "pwa", type: "string", description: "action agentcms-favicon set|manifest: PWA manifest fields as JSON {name, shortName, themeColor, backgroundColor, display}." },
    { name: "status", type: "string", description: "action agentcms-import: draft, online (publish everything) or from-source (each file's status)." },
    { name: "category", type: "string", description: "action agentcms-import: category name for entries without one." },
    { name: "from-hosting", type: "boolean", description: "action agentcms-import scan|run: read the site's _cms-import/ folder instead of a local path." },
    { name: "keep-files", type: "boolean", description: "action agentcms-import run --from-hosting: don't move processed files to an archive folder." },
    { name: "yes", type: "boolean", description: "action agentcms-import run: import (otherwise only the dry-run summary)." }
  ],
  run: run$7
};
const plugins = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  currentConfig,
  imageFileFromDisk,
  pluginRows,
  pluginsCommand
}, Symbol.toStringTag, { value: "Module" }));
const LOGO = { width: 480, height: 144, fit: "contain" };
function dedupe(list2) {
  const byId = /* @__PURE__ */ new Map();
  for (const t of list2) if (!byId.has(t.id)) byId.set(t.id, t);
  return [...byId.values()];
}
function logoSlot(theme) {
  const d = theme.settings?.defaultConfig;
  if (!d) return null;
  if ("logoEnabled" in d) return "top";
  const brand = d.brand;
  if (brand && typeof brand === "object" && "logoEnabled" in brand) return "brand";
  return null;
}
async function themeRows(s) {
  const { readBackendRegistryForCli } = await import("./chunks/sessionRegistry-gjzuaydG.mjs");
  const registry = await readBackendRegistryForCli().catch(() => null) ?? { themes: [] };
  const external = new Set(registry.themes.map((e) => e.id));
  const active = s.settings().activeThemeId;
  const rows = dedupe(s.host.themes.listThemes()).map((t) => ({
    id: t.id,
    name: t.name,
    version: t.version,
    active: t.id === active,
    installed: external.has(t.id) ? "external" : "bundled",
    loaded: true,
    hasSettings: !!t.settings,
    logo: logoSlot(t) !== null,
    description: t.description ?? null
  }));
  for (const e of registry.themes) {
    if (rows.some((r) => r.id === e.id)) continue;
    const failed = s.loadedExtensions.failed.find((f) => f.id === `themes/${e.id}`);
    rows.push({ id: e.id, name: e.id, version: e.version ?? "", active: e.id === active, installed: "external", loaded: false, hasSettings: false, logo: false, description: null, error: failed?.error ?? "not loaded" });
  }
  return rows;
}
function findTheme(s, id) {
  if (!id) throw new CliError("usage", "Which theme? Give its id.", "List them with `agentcms themes list`.", 2);
  const theme = s.host.themes.listThemes().find((t) => t.id === id);
  if (theme) return theme;
  const failed = s.loadedExtensions.failed.find((f) => f.id === `themes/${id}`);
  if (failed) throw new CliError("theme-not-loaded", `Theme "${id}" is installed but could not be loaded: ${failed.error}`, "Check the site's admin (`agentcms doctor`), or reinstall it (`agentcms ext install`).");
  throw new CliError("not-found", `No theme "${id}" on this site.`, "List them with `agentcms themes list`; install one with `agentcms ext install`.", 2);
}
function themeConfigOf(s, theme) {
  const stored = s.settings().themeConfigs?.[theme.id];
  return { ...theme.settings?.defaultConfig ?? {}, ...stored ?? {} };
}
async function batched(fn) {
  const { withStorageBatch } = await import("./chunks/siteFiles-BbBoVJww.mjs").then((n) => n.s);
  return withStorageBatch(fn);
}
function cssVariablesOf(css) {
  const block = /:root\s*\{([^}]*)\}/.exec(css ?? "")?.[1] ?? "";
  const out = {};
  for (const m of block.matchAll(/(--[\w-]+)\s*:\s*([^;]+);?/g)) {
    const v = m[2].trim();
    const rgb = /^(\d{1,3})\s+(\d{1,3})\s+(\d{1,3})$/.exec(v);
    out[m[1]] = rgb ? "#" + rgb.slice(1).map((n) => Number(n).toString(16).padStart(2, "0")).join("") : v;
  }
  return out;
}
async function saveThemeConfig(s, theme, next) {
  const { updateThemeConfig } = await import("./chunks/settings-CEBDXaTg.mjs");
  await updateThemeConfig(theme.id, next);
  await s.refresh();
  if (!theme.compileCss || !theme.settings) return null;
  let css;
  try {
    css = theme.compileCss({ ...theme.settings.defaultConfig, ...next });
  } catch (err) {
    s.log({ level: "warn", message: `compileCss for "${theme.id}" failed: ${err.message} — the stylesheet was not updated.` });
    return null;
  }
  const { uploadFile } = await import("./chunks/siteFiles-BbBoVJww.mjs").then((n) => n.s);
  const path = `theme-assets/${theme.id}.css`;
  await uploadFile({ path, content: css });
  return path;
}
async function refreshMenuJson(s) {
  const { publishMenuJson } = await import("./chunks/menuPublisher-CNZxyV6S.mjs");
  const { fetchAllPosts, invalidateAllPostsCache } = await import("./chunks/posts-D28k7tn_.mjs");
  invalidateAllPostsCache();
  const [posts, pages2] = await Promise.all([fetchAllPosts({ type: "post" }), fetchAllPosts({ type: "page" })]);
  try {
    await publishMenuJson(s.settings(), posts, pages2, await s.terms());
  } catch (err) {
    s.log({ level: "warn", message: `menu.json republish failed: ${err.message}` });
  }
}
function logoState(cfg, slot) {
  if (slot === "brand") {
    const b = cfg.brand ?? {};
    return [b.logoEnabled, b.logoUpdatedAt, b.wordmark];
  }
  return [cfg.logoEnabled, cfg.logoUpdatedAt];
}
async function run$6({ io, options, positionals }) {
  const [action, id, arg] = positionals;
  const { runAdmin } = await import("./chunks/adminCommon-DK5a9uhY.mjs");
  const alias = options.site;
  const write = { write: true, hosting: true, extensions: true, lock: true };
  switch (action) {
    case "list":
      return runAdmin(
        io,
        alias,
        { extensions: true },
        (s) => themeRows(s),
        (rows) => rows.map((r) => `${r.active ? "●" : "○"} ${r.id.padEnd(18)} ${r.version.padEnd(8)}${r.active ? " active" : ""}${r.installed === "external" ? " (installed)" : ""}${r.hasSettings ? "  config" : ""}${r.logo ? "  logo" : ""}${r.loaded ? "" : `  NOT LOADED: ${r.error}`}`).join("\n") + "\n(install / uninstall a theme ZIP: agentcms ext install|uninstall)"
      );
    case "activate": {
      if (!id) throw new CliError("usage", "themes activate needs a theme id.", "List them with `agentcms themes list`.", 2);
      if (!options.yes) {
        return runAdmin(io, alias, { extensions: true }, async (s) => {
          const theme = findTheme(s, id);
          const { fetchAllPosts } = await import("./chunks/posts-D28k7tn_.mjs");
          const [posts, pages2] = await Promise.all([fetchAllPosts({ type: "post" }), fetchAllPosts({ type: "page" })]);
          const online = [...posts, ...pages2].filter((p) => p.status === "online").length;
          const plan = {
            needsConfirmation: true,
            from: s.settings().activeThemeId,
            to: theme.id,
            alreadyActive: theme.id === s.settings().activeThemeId,
            rewrites: { onlineEntries: online, steps: ["theme assets of every installed theme", "every online post and page", "home, category and author pages, 404.html, menu/posts/authors JSON", "every plugin regeneration target"] }
          };
          return plan;
        }, (p) => p.alreadyActive ? `${p.to} is already the active theme.` : `Switching ${p.from} → ${p.to} regenerates the whole site (${p.rewrites.onlineEntries} online entries, listings, assets, plugin files).
Nothing changed — re-run with --yes once the user agrees.`);
      }
      return runAdmin(io, alias, write, async (s) => {
        const theme = findTheme(s, id);
        const from = s.settings().activeThemeId;
        const started = Date.now();
        await batched(async () => {
          const { updateSettings } = await import("./chunks/settings-CEBDXaTg.mjs");
          await updateSettings({ activeThemeId: theme.id });
          const settings = await s.refresh();
          const { syncThemeAssets } = await import("./chunks/themeSync-CKwVwkUo.mjs");
          await syncThemeAssets(dedupe(s.host.themes.listThemes()), settings.themeConfigs, s.log);
          const ctx = await s.context();
          await s.host.publisher.regenerateAll(ctx, s.log);
          const { listRegenerationTargets } = await import("./chunks/regenerationTargetRegistry-3NmN64mg.mjs");
          for (const target of listRegenerationTargets()) {
            try {
              await target.run(ctx, s.log);
            } catch (err) {
              s.log({ level: "error", message: `Plugin "${target.id}" regen failed: ${err.message}` });
            }
          }
        });
        const { planMediaRegeneration } = await import("./chunks/mediaRegenerate-B19oeaI-.mjs");
        const needCrop = planMediaRegeneration(await s.media(), s.settings()).filter((m) => m.formats.length).length;
        const next = needCrop ? [`agentcms media regenerate --site ${s.site.alias} --yes`, `agentcms regenerate all --site ${s.site.alias}`] : [];
        return { from, to: theme.id, seconds: Math.round((Date.now() - started) / 1e3), mediaMissingFormats: needCrop, next };
      }, (r) => `Theme switched ${r.from} → ${r.to}; site regenerated in ${r.seconds}s.${r.next.length ? `
${r.mediaMissingFormats} media lack ${r.to}'s image formats: ${r.next.join(" ; ")}` : ""}`);
    }
    case "config": {
      const { readConfigRequest } = await import("./chunks/configEdit-BtaThQg1.mjs");
      const req = readConfigRequest(options);
      const readOnly = req.mode === "get" || req.mode === "schema";
      return runAdmin(io, alias, readOnly ? { extensions: true } : write, async (s) => {
        const theme = findTheme(s, id);
        if (!theme.settings) throw new CliError("no-settings", `Theme ${theme.id} has no settings.`, void 0, 2);
        const defaults = theme.settings.defaultConfig;
        if (req.mode === "schema") {
          const { describeSettings } = await import("./chunks/configEdit-BtaThQg1.mjs");
          return { id: theme.id, documented: !!theme.settings.schema, settings: describeSettings(defaults, theme.settings.schema), defaultConfig: defaults, cssVariables: cssVariablesOf(theme.cssText) };
        }
        const prev = themeConfigOf(s, theme);
        if (req.mode === "get") return { id: theme.id, config: prev, stored: s.settings().themeConfigs?.[theme.id] ?? null };
        const { deepMerge, shapeWarnings, changedKeys, schemaErrors } = await import("./chunks/configEdit-BtaThQg1.mjs");
        const { keepManaged } = await import("./chunks/configEdit-BtaThQg1.mjs");
        let next = req.mode === "set" ? keepManaged(prev, { ...req.value }, theme.settings.schema) : deepMerge(prev, req.value);
        if ("cssUpdatedAt" in defaults && JSON.stringify(prev.style) !== JSON.stringify(next.style)) next = { ...next, cssUpdatedAt: Date.now() };
        const invalid = schemaErrors(theme.settings.schema, next, prev);
        if (invalid.length) throw new CliError("invalid-value", `${theme.id}: ${invalid.join(" ")}`, `See \`agentcms themes config ${theme.id} --schema\`.`, 2);
        const warnings = shapeWarnings(defaults, req.value, theme.id, theme.settings.schema);
        const active = theme.id === s.settings().activeThemeId;
        if (!active) warnings.push(`${theme.id} is not the active theme (${s.settings().activeThemeId}): saved for when it is.`);
        const effects = [];
        await batched(async () => {
          let catalogMove = null;
          if (theme.id === "storefront" && JSON.stringify(prev.catalog) !== JSON.stringify(next.catalog) && next.catalog && typeof next.catalog === "object") {
            const cat = next.catalog;
            const slug = String(cat.slug || "catalog.html").replace(/^\/+/, "");
            const oldPath = String(prev.catalog?.lastPublishedPath ?? "");
            next = { ...next, catalog: { ...cat, slug, lastPublishedPath: slug } };
            catalogMove = [oldPath, slug];
          }
          const css = await saveThemeConfig(s, theme, next);
          if (css) effects.push(`uploaded ${css}`);
          if (catalogMove) {
            const { cleanupOldCatalogPath } = await import("./chunks/catalogPublisher-DSvY00CW.mjs");
            await cleanupOldCatalogPath(catalogMove[0], catalogMove[1]);
            if (catalogMove[0] && catalogMove[0] !== catalogMove[1]) effects.push(`deleted ${catalogMove[0]}`);
          }
          const slot = logoSlot(theme);
          if (catalogMove || JSON.stringify(logoState(prev, slot)) !== JSON.stringify(logoState(next, slot))) {
            await refreshMenuJson(s);
            effects.push("published data/menu.json");
          }
        });
        const changed = changedKeys(prev, next);
        const styleOnly = changed.length > 0 && changed.every((k) => ["style", "cssUpdatedAt"].includes(k));
        const layout = changed.filter((k) => !["style", "cssUpdatedAt", "catalog"].includes(k));
        const homeOnly = layout.length > 0 && layout.every((k) => k === "home");
        const nextSteps2 = styleOnly || !layout.length ? [] : [`agentcms regenerate ${homeOnly ? "home" : "all"} --site ${s.site.alias}`];
        if (theme.id === "storefront" && next.catalog && changed.includes("catalog")) nextSteps2.push(`agentcms regenerate storefront/catalog --site ${s.site.alias}`);
        const note = changed.includes("cssUpdatedAt") && active ? `The new CSS is live. Visitors with a cached copy get it once pages link the new version: \`agentcms regenerate all --site ${s.site.alias}\` (optional).` : null;
        return { id: theme.id, config: next, changed: changedKeys(prev, next), effects, warnings, next: active ? nextSteps2 : [], note };
      }, (r) => {
        if ("settings" in r && Array.isArray(r.settings)) {
          return r.settings.map((f) => `${f.path} (${f.type}, default ${JSON.stringify(f.default)})${f.values ? ` — one of ${f.values.map((v) => JSON.stringify(v)).join(" | ")}` : ""}${f.format ? ` — ${f.format}` : ""}${f.description ? `
    ${f.description}` : ""}`).join("\n");
        }
        if (!("changed" in r) || !r.changed) return JSON.stringify(r.config, null, 2);
        return [`Saved ${r.id} (${r.changed.length ? r.changed.join(", ") : "no change"}).`, ...r.effects.map((e) => `  ${e}`), ...r.warnings.map((w) => `  warning: ${w}`), ...r.next.length ? [`Pages pick up layout changes on the next regeneration: ${r.next.join(" ; ")}`] : []].join("\n");
      });
    }
    case "logo": {
      const remove = !!options.remove;
      if (!remove && !arg) throw new CliError("usage", "themes logo needs <id> <image> (PNG, JPEG or WebP), or <id> --remove.", void 0, 2);
      return runAdmin(io, alias, write, async (s) => {
        const theme = findTheme(s, id);
        const slot = logoSlot(theme);
        if (!slot) throw new CliError("no-logo", `Theme ${theme.id} has no logo setting.`, void 0, 2);
        const { uploadThemeLogo, removeThemeLogo, logoPath } = await import("./chunks/themeLogo-BOYKDlfb.mjs").then((n) => n.t);
        const prev = themeConfigOf(s, theme);
        const file2 = remove ? null : (await Promise.resolve().then(() => plugins)).imageFileFromDisk(arg, ["image/png", "image/jpeg", "image/webp"]);
        const effects = [];
        const state = remove ? { logoEnabled: false, logoUpdatedAt: theme.id === "storefront" ? Date.now() : 0 } : { logoEnabled: true, logoUpdatedAt: Date.now() };
        const next = slot === "brand" ? { ...prev, brand: { ...prev.brand ?? {}, ...state } } : { ...prev, ...state };
        await batched(async () => {
          if (file2) await uploadThemeLogo({ themeId: theme.id, file: file2, ...LOGO });
          else await removeThemeLogo(theme.id);
          effects.push(`${file2 ? "uploaded" : "deleted"} ${logoPath(theme.id)}`);
          const css = await saveThemeConfig(s, theme, next);
          if (css) effects.push(`uploaded ${css}`);
          await refreshMenuJson(s);
          effects.push("published data/menu.json");
        });
        const warnings = theme.id === s.settings().activeThemeId ? [] : [`${theme.id} is not the active theme: the logo shows once it is.`];
        return { id: theme.id, logo: file2 ? logoPath(theme.id) : null, ...state, effects, warnings };
      }, (r) => [`${r.id} logo ${r.logo ? `uploaded to ${r.logo}` : "removed"}.`, ...r.effects.map((e) => `  ${e}`), ...r.warnings.map((w) => `  warning: ${w}`)].join("\n"));
    }
    case "sync-assets":
      return runAdmin(io, alias, write, async (s) => {
        const { syncThemeAssets } = await import("./chunks/themeSync-CKwVwkUo.mjs");
        const themes = dedupe(s.host.themes.listThemes());
        await batched(() => syncThemeAssets(themes, s.settings().themeConfigs, s.log));
        return { themes: themes.map((t) => t.id) };
      }, (r) => `Theme assets uploaded for ${r.themes.join(", ")}.`);
    default:
      throw new CliError("usage", action ? `Unknown themes action "${action}".` : "themes needs an action.", "Actions: list, activate, config, logo, sync-assets.", 2);
  }
}
const themesCommand = {
  name: "themes",
  summary: "The admin's Themes page and theme settings: list; activate <id> (switches and regenerates the whole site — plan first, --yes); config <id> (--get, --schema = default config, --set <json> replaces, --merge <json> deep-merges; recompiles theme-assets/<id>.css, republishes menu.json for logo / storefront catalog changes — layout changes need `regenerate all`); logo <id> <image> | logo <id> --remove; sync-assets (= regenerate assets). The storefront catalog page is `regenerate storefront/catalog`. Theme ZIPs: `ext install`.",
  usage: "themes <list|activate|config|logo|sync-assets> [<id>] [<image>] --site <alias> [--get|--schema|--set <json>|@file|--merge <json>|@file] [--remove] [--yes]",
  options: [
    { name: "site", type: "string", description: "Site alias." },
    { name: "get", type: "boolean", description: "config: print the current config (stored merged over defaults) — the default." },
    { name: "schema", type: "boolean", description: "config: print the theme's default config (every key it knows)." },
    { name: "set", type: "string", description: "config: replace the whole config with this JSON object (or @file.json)." },
    { name: "merge", type: "string", description: "config: deep-merge this JSON object into the current config (arrays are replaced)." },
    { name: "remove", type: "boolean", description: "logo: delete the logo instead of uploading one." },
    { name: "yes", type: "boolean", description: "activate: switch and regenerate (otherwise only the plan)." }
  ],
  run: run$6
};
const MIME_BY_EXT = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
  ".gif": "image/gif",
  ".svg": "image/svg+xml",
  ".avif": "image/avif"
};
let formatSpecs = {};
async function loadFormatSpecs(s) {
  const { ADMIN_FORMATS } = await import("./chunks/imageFormats-C1E7toWk.mjs");
  let theme = {};
  try {
    theme = s.host.themes.getActiveTheme(s.settings().activeThemeId ?? "default").imageFormats?.formats ?? {};
  } catch {
    theme = {};
  }
  formatSpecs = {};
  for (const [name, f] of Object.entries(theme)) formatSpecs[name] = { fit: f.fit ?? "cover", adminOnly: false };
  for (const [name, f] of Object.entries(ADMIN_FORMATS)) formatSpecs[name] = { fit: f.fit ?? "cover", adminOnly: true };
}
function parseTranslations(raw, file2) {
  if (raw === void 0 || raw === null) return void 0;
  if (typeof raw !== "object" || Array.isArray(raw)) throw new CliError("usage", `--data: "translations" of ${file2} must be an object { "<lang>": { "alt", "caption" } }.`, void 0, 2);
  const out = {};
  for (const [lang, v] of Object.entries(raw)) {
    const t = v ?? {};
    const entry = {};
    if (t.alt) entry.alt = String(t.alt);
    if (t.caption) entry.caption = String(t.caption);
    if (entry.alt || entry.caption) out[lang] = entry;
  }
  return Object.keys(out).length ? out : void 0;
}
async function summarize$1(m) {
  const { pickMediaUrl } = await import("./chunks/media-K2GXb5Xy.mjs");
  const { iso } = await import("./chunks/adminCommon-DK5a9uhY.mjs");
  const formats = {};
  for (const [name, v] of Object.entries(m.formats ?? {})) formats[name] = { url: v.url, width: v.width, height: v.height, bytes: v.bytes, ...formatSpecs[name] ?? {} };
  return {
    id: m.id,
    name: m.name,
    alt: m.alt ?? null,
    caption: m.caption ?? null,
    translations: m.translations ?? {},
    contentType: m.contentType,
    size: m.size,
    url: pickMediaUrl(m) || null,
    defaultFormat: m.defaultFormat ?? null,
    formats,
    storageBase: m.storageBase ?? m.storagePath ?? null,
    uploadedAt: iso(m.uploadedAt),
    uploadedBy: m.uploadedBy || null
  };
}
function requireMedia(all, ref) {
  const m = all.find((x) => x.id === ref) ?? (all.filter((x) => x.name === ref).length === 1 ? all.find((x) => x.name === ref) : void 0);
  if (!m) throw new CliError("not-found", `No media "${ref}".`, "List them with `agentcms media list` (use the id).", 2);
  return m;
}
function findMediaUsages(m, entries, users, terms) {
  const needles = [m.storageBase, m.storagePath, m.url, ...Object.values(m.formats ?? {}).map((v) => v.url)].filter((s) => !!s);
  const mentions = (text) => !!text && needles.some((n) => text.includes(n));
  const out = [];
  for (const p of entries) {
    const where = [];
    if (p.heroMediaId === m.id) where.push("featured image");
    if (mentions(p.contentMarkdown)) where.push("body");
    if (mentions(p.seo?.ogImage)) where.push("SEO image");
    if (p.translations && mentions(JSON.stringify(p.translations))) where.push("translation");
    if (where.length) out.push({ kind: p.type, id: p.id, label: p.title, where });
  }
  for (const u of users) if (u.avatarMediaId === m.id) out.push({ kind: "user", id: u.id, label: u.email || u.id, where: ["avatar"] });
  for (const t of terms) {
    if (mentions(t.seo?.ogImage) || t.translations && mentions(JSON.stringify(t.translations))) out.push({ kind: "term", id: t.id, label: t.name, where: ["SEO image"] });
  }
  return out;
}
async function allEntries$1() {
  const { fetchAllPosts, invalidateAllPostsCache } = await import("./chunks/posts-D28k7tn_.mjs");
  invalidateAllPostsCache();
  const [posts, pages2] = await Promise.all([fetchAllPosts({ type: "post" }), fetchAllPosts({ type: "page" })]);
  return [...posts, ...pages2];
}
async function run$5({ io, options, positionals }) {
  const [action, ...refs] = positionals;
  const { runAdmin } = await import("./chunks/adminCommon-DK5a9uhY.mjs");
  const alias = options.site;
  const str = (v) => v === void 0 || v === false ? void 0 : String(v);
  switch (action) {
    case "list":
      return runAdmin(io, alias, { extensions: true }, async (s) => {
        await loadFormatSpecs(s);
        let all = await s.media();
        if (options.search) {
          const tokens = String(options.search).toLowerCase().split(/\s+/).filter(Boolean);
          all = all.filter((m) => tokens.every((t) => `${m.name} ${m.alt ?? ""} ${m.caption ?? ""}`.toLowerCase().includes(t)));
        }
        return Promise.all(all.map(summarize$1));
      }, (rows) => rows.length ? rows.map((r) => `${r.id}  ${r.name}${r.alt ? `  "${r.alt}"` : ""}  ${r.url ?? ""}`).join("\n") : "No media.");
    case "get": {
      if (!refs[0]) throw new CliError("usage", "media get needs a media id.", void 0, 2);
      return runAdmin(io, alias, { extensions: true }, async (s) => {
        await loadFormatSpecs(s);
        const m = requireMedia(await s.media(), refs[0]);
        const usages = findMediaUsages(m, await allEntries$1(), await s.users(), await s.terms());
        return { ...await summarize$1(m), usages };
      }, (r) => [
        `${r.name} (${r.id})${r.alt ? ` — alt: ${r.alt}` : ""}`,
        ...Object.entries(r.formats).map(([n, f]) => `  ${n.padEnd(15)} ${f.width}×${f.height}  ${f.url}`),
        r.usages.length ? `Used by: ${r.usages.map((u) => `${u.kind} "${u.label}" (${u.where.join(", ")})`).join("; ")}` : "Not referenced."
      ].join("\n"));
    }
    case "upload": {
      const items = refs.map((f) => ({ path: resolve(f), alt: str(options.alt), caption: str(options.caption) }));
      if (options.data !== void 0) {
        const { readJsonOption } = await import("./chunks/adminCommon-DK5a9uhY.mjs");
        const raw = readJsonOption(options.data, "data");
        const base = typeof options.data === "string" && options.data.startsWith("@") ? dirname(resolve(options.data.slice(1))) : process.cwd();
        const list2 = Array.isArray(raw) ? raw : null;
        if (!list2 || list2.some((x) => !x || typeof x !== "object" || typeof x.file !== "string")) {
          throw new CliError("usage", '--data must be a JSON array of { "file", "alt", "caption" }.', `e.g. --data '[{"file":"fjord.jpg","alt":"…"}]' or --data @media.json`, 2);
        }
        for (const x of list2) {
          items.push({ path: resolve(base, x.file), alt: x.alt === void 0 ? str(options.alt) : String(x.alt), caption: x.caption === void 0 ? str(options.caption) : String(x.caption), translations: parseTranslations(x.translations, x.file) });
        }
      }
      if (!items.length) throw new CliError("usage", "media upload needs one or more image files.", 'e.g. `agentcms media upload photo.jpg --alt "…"`, or --data @media.json for one alt text per file.', 2);
      const files = items.map((x) => x.path);
      for (const f of files) {
        if (!existsSync(f) || !statSync(f).isFile()) throw new CliError("not-found", `${f} does not exist.`, void 0, 2);
      }
      return runAdmin(io, alias, { write: true, hosting: true, extensions: true, lock: true }, async (s) => {
        const { uploadMedia, updateMedia, validateMediaFile, listAllMedia } = await import("./chunks/media-9UyLuwBC.mjs").then((n) => n.n);
        const { withStorageBatch } = await import("./chunks/siteFiles-BbBoVJww.mjs").then((n) => n.s);
        const { currentUserId } = await import("./chunks/adminCommon-DK5a9uhY.mjs");
        const settings = s.settings();
        await loadFormatSpecs(s);
        let inputFormats;
        try {
          inputFormats = s.host.themes.getActiveTheme(settings.activeThemeId ?? "default").imageFormats?.inputFormats;
        } catch {
          inputFormats = void 0;
        }
        const prepared = files.map((path) => {
          const name = basename(path);
          const file2 = new File([readFileSync(path)], name, { type: MIME_BY_EXT[extname(name).toLowerCase()] ?? "" });
          const v = validateMediaFile(file2, inputFormats);
          if (!v.ok) throw new CliError("invalid-media", v.reason, `Accepted: ${(inputFormats ?? [".jpg", ".jpeg", ".png", ".webp", ".gif"]).join(", ")} (the active theme decides).`, 2);
          return file2;
        });
        const uploadedBy = await currentUserId();
        const out = [];
        await withStorageBatch(async () => {
          for (const [i, file2] of prepared.entries()) {
            try {
              const created = await uploadMedia(file2, uploadedBy, settings);
              const { alt, caption, translations } = items[i];
              if (alt !== void 0 || caption !== void 0 || translations) await updateMedia(created.id, { alt, caption, ...translations ? { translations } : {} });
              const fresh = (await listAllMedia()).find((m) => m.id === created.id) ?? created;
              const sum = await summarize$1(fresh);
              out.push({ file: files[i], ok: true, id: created.id, url: sum.url, formats: sum.formats });
            } catch (err) {
              out.push({ file: files[i], ok: false, error: err.message });
            }
          }
        });
        return out;
      }, (rows) => rows.map((r) => r.ok ? `✓ ${basename(r.file)} → ${r.id}  ${r.url}` : `✗ ${basename(r.file)} — ${r.error}`).join("\n"));
    }
    case "update": {
      if (!refs[0]) throw new CliError("usage", "media update needs a media id.", void 0, 2);
      const alt = str(options.alt);
      const caption = str(options.caption);
      if (alt === void 0 && caption === void 0) throw new CliError("usage", 'media update needs --alt and/or --caption ("" clears).', void 0, 2);
      const lang = str(options.lang);
      if (lang !== void 0 && !/^[a-z]{2,3}(-[a-z0-9]{2,8})?$/i.test(lang)) throw new CliError("usage", `--lang must be a language code (e.g. en, pt-br), not "${lang}".`, void 0, 2);
      return runAdmin(io, alias, { write: true, lock: true }, async (s) => {
        const m = requireMedia(await s.media(), refs[0]);
        const { updateMedia, listAllMedia } = await import("./chunks/media-9UyLuwBC.mjs").then((n) => n.n);
        if (lang) {
          const tr = { ...m.translations?.[lang] ?? {} };
          if (alt !== void 0) tr.alt = alt;
          if (caption !== void 0) tr.caption = caption;
          if (!tr.alt) delete tr.alt;
          if (!tr.caption) delete tr.caption;
          const translations = { ...m.translations ?? {} };
          if (tr.alt || tr.caption) translations[lang] = tr;
          else delete translations[lang];
          await updateMedia(m.id, { translations });
        } else {
          await updateMedia(m.id, { alt, caption });
        }
        const fresh = (await listAllMedia()).find((x) => x.id === m.id) ?? m;
        return { id: m.id, lang: lang ?? null, alt: fresh.alt ?? null, caption: fresh.caption ?? null, translations: fresh.translations ?? {}, note: `Published pages keep the old alt text until they are republished (\`agentcms regenerate all --site ${s.site.alias}\`).` };
      }, (r) => `Updated ${r.id}${r.lang ? ` (${r.lang})` : ""}: alt=${JSON.stringify(r.lang ? r.translations[r.lang]?.alt ?? null : r.alt)} caption=${JSON.stringify(r.lang ? r.translations[r.lang]?.caption ?? null : r.caption)}
${r.note}`);
    }
    case "regenerate": {
      const allFormats = !!options["all-formats"];
      const plan = async (s) => {
        const all = await s.media();
        const targets = refs.length ? refs.map((r) => requireMedia(all, r)) : all;
        const { planMediaRegeneration } = await import("./chunks/mediaRegenerate-B19oeaI-.mjs");
        return { targets, plan: planMediaRegeneration(targets, s.settings(), { all: allFormats }) };
      };
      const theme = (s) => s.settings().activeThemeId ?? "default";
      if (!options.yes) {
        return runAdmin(io, alias, { extensions: true }, async (s) => {
          const { plan: p } = await plan(s);
          const todo = p.filter((x) => x.formats.length);
          return { needsConfirmation: todo.length > 0, theme: theme(s), media: todo, upToDate: p.filter((x) => !x.formats.length && !x.skipped).length, skipped: p.filter((x) => x.skipped) };
        }, (r) => r.media.length ? [`${r.media.length} media need ${r.theme}'s formats:`, ...r.media.map((m) => `  ${m.id} ${m.name}: ${m.formats.join(", ")}`), ...r.skipped.map((m) => `  skip ${m.id} ${m.name}: ${m.skipped}`), "Nothing changed — re-run with --yes once the user agrees."].join("\n") : `Every media already has ${r.theme}'s formats.${r.skipped.length ? ` (${r.skipped.length} skipped)` : ""}`);
      }
      return runAdmin(io, alias, { write: true, hosting: true, extensions: true, lock: true }, async (s) => {
        const { targets, plan: p } = await plan(s);
        const { regenerateMediaFormats } = await import("./chunks/mediaRegenerate-B19oeaI-.mjs");
        const { withStorageBatch } = await import("./chunks/siteFiles-BbBoVJww.mjs").then((n) => n.s);
        const out = [];
        await withStorageBatch(async () => {
          for (const item of p) {
            if (!item.formats.length) continue;
            const media = targets.find((m) => m.id === item.id);
            try {
              const done = await regenerateMediaFormats(media, item.formats, s.settings());
              out.push({ id: media.id, name: media.name, ok: true, formats: done });
            } catch (err) {
              out.push({ id: media.id, name: media.name, ok: false, formats: [], error: err.message });
            }
          }
        });
        return {
          theme: theme(s),
          regenerated: out,
          skipped: p.filter((x) => x.skipped),
          next: out.some((x) => x.ok) ? [`agentcms regenerate all --site ${s.site.alias}`] : []
        };
      }, (r) => [
        ...r.regenerated.map((m) => m.ok ? `✓ ${m.name}: ${m.formats.join(", ")}` : `✗ ${m.name} — ${m.error}`),
        ...r.regenerated.length ? [] : [`Every media already has ${r.theme}'s formats.`],
        ...r.next.map((n) => `Then: ${n} (pages pick the new sizes when re-rendered).`)
      ].join("\n"));
    }
    case "delete": {
      if (!refs.length) throw new CliError("usage", "media delete needs one or more media ids.", void 0, 2);
      const inspect = async (s) => {
        const all = await s.media();
        const targets = refs.map((r) => requireMedia(all, r));
        const [entries, users, terms] = await Promise.all([allEntries$1(), s.users(), s.terms()]);
        return targets.map((m) => ({ media: m, usages: findMediaUsages(m, entries, users, terms) }));
      };
      const NOTE = "Published pages keep the URLs they were rendered with: they show a broken image until republished (`agentcms regenerate all`) or edited.";
      if (!options.yes) {
        return runAdmin(io, alias, {}, async (s) => {
          const found = await inspect(s);
          return {
            needsConfirmation: true,
            delete: found.map(({ media, usages }) => ({ id: media.id, name: media.name, folder: media.storageBase ?? media.storagePath ?? null, usages })),
            note: NOTE
          };
        }, (r) => [
          `Would delete ${r.delete.length} media (files on the publish target and the record):`,
          ...r.delete.map((d) => `  ${d.id} ${d.name}${d.usages.length ? ` — still used by ${d.usages.map((u) => `${u.kind} "${u.label}" (${u.where.join(", ")})`).join("; ")}` : ""}`),
          r.note,
          "Nothing changed — re-run with --yes once the user agrees."
        ].join("\n"));
      }
      return runAdmin(io, alias, { write: true, hosting: true, lock: true }, async (s) => {
        const found = await inspect(s);
        const { deleteMedia } = await import("./chunks/media-9UyLuwBC.mjs").then((n) => n.n);
        const { withStorageBatch } = await import("./chunks/siteFiles-BbBoVJww.mjs").then((n) => n.s);
        const out = [];
        for (const { media, usages } of found) {
          try {
            await withStorageBatch(() => deleteMedia(media));
            out.push({ id: media.id, name: media.name, ok: true, usages });
          } catch (err) {
            out.push({ id: media.id, name: media.name, ok: false, usages, error: err.message });
          }
        }
        return { deleted: out, note: out.some((d) => d.usages.length) ? NOTE : null };
      }, (r) => [...r.deleted.map((d) => `${d.ok ? "✓ deleted" : "✗"} ${d.name}${d.error ? ` — ${d.error}` : ""}${d.usages.length ? ` (was used by ${d.usages.length} item(s))` : ""}`), ...r.note ? [r.note] : []].join("\n"));
    }
    default:
      throw new CliError("usage", action ? `Unknown media action "${action}".` : "media needs an action.", "Actions: list, get, upload, update, delete, regenerate.", 2);
  }
}
const mediaCommand = {
  name: "media",
  summary: "The Media library: list [--search], get <id> (variants, URLs, where it is used), upload <file…> (the admin's pipeline: the active theme's variants + admin formats, then the record; --alt / --caption, or --data @media.json for one alt / caption per file; one commit per command), update <id> --alt/--caption [--lang <code>] (per-language alt / caption for multilang sites), delete <id…> (files + record; plan first, --yes; warns about posts / avatars still using it), regenerate [id…] (after a theme switch: re-crops media to the active theme's formats from their high-resolution copy; plan first, --yes; then `regenerate all`).",
  usage: "media <list|get|upload|update|delete|regenerate> [ids|files…] --site <alias> [--search <q>] [--alt <text>] [--caption <text>] [--lang <code>] [--data <json>|@file] [--all-formats] [--yes]",
  options: [
    { name: "site", type: "string", description: "Site alias." },
    { name: "search", type: "string", description: "list: words that must all appear in the name, alt or caption." },
    { name: "alt", type: "string", description: 'upload/update: alternative text ("" clears).' },
    { name: "caption", type: "string", description: 'upload/update: caption ("" clears).' },
    { name: "lang", type: "string", description: 'update: set the alt text / caption of this language (agentcms-multilang) instead of the primary one; "" clears a field.' },
    { name: "data", type: "string", description: 'upload: JSON array (or @file.json) of { "file", "alt", "caption", "translations": { "<lang>": { "alt", "caption" } } } — one alt text / caption per file (and per language); paths are relative to the JSON file. All files go up in one commit.' },
    { name: "all-formats", type: "boolean", description: "regenerate: redo every format of the active theme, not only the missing / wrong-size ones." },
    { name: "yes", type: "boolean", description: "delete / regenerate: apply (otherwise only the plan)." }
  ],
  run: run$5
};
const LOCALES = ["en", "fr", "de", "es", "nl", "pt", "ko"];
const NETWORKS = ["twitter", "linkedin", "instagram", "mastodon", "bluesky", "github", "website"];
async function backend() {
  const { getBackendKind } = await import("./chunks/runtimeConfig-2M2d2Pbu.mjs");
  return getBackendKind() ?? "unknown";
}
function summarize(u, entries) {
  const own = entries.filter((p) => p.authorId === u.id);
  return {
    id: u.id,
    email: u.email,
    firstName: u.firstName ?? null,
    lastName: u.lastName ?? null,
    title: u.title ?? null,
    // The name shown on posts and the author page: first + last name,
    // else the account's display name. Empty = posts show no byline.
    publicName: [u.firstName, u.lastName].filter((x) => x && x.trim()).join(" ").trim() || u.displayName?.trim() || null,
    role: u.role,
    disabled: !!u.disabled,
    posts: own.length,
    onlinePosts: own.filter((p) => p.status === "online").length
  };
}
function detail(u, entries) {
  return {
    ...summarize(u, entries),
    displayName: u.displayName ?? null,
    bio: u.bio ?? null,
    avatarMediaId: u.avatarMediaId ?? null,
    socials: u.socials ?? {},
    adminLocale: u.preferences?.adminLocale ?? null
  };
}
async function allEntries() {
  const { fetchAllPosts, invalidateAllPostsCache } = await import("./chunks/posts-D28k7tn_.mjs");
  invalidateAllPostsCache();
  const [posts, pages2] = await Promise.all([fetchAllPosts({ type: "post" }), fetchAllPosts({ type: "page" })]);
  return { posts, pages: pages2, all: [...posts, ...pages2] };
}
async function selfAuthUser() {
  const { isDocStoreBackend, getBackendKind } = await import("./chunks/runtimeConfig-2M2d2Pbu.mjs");
  if (isDocStoreBackend(getBackendKind())) {
    const { getDocStore } = await import("./chunks/registry-Df5_x1nj.mjs").then((n) => n.B);
    const id = await getDocStore().identity();
    if (!id) throw new CliError("not-signed-in", "The site's content store did not identify a user.");
    return { uid: id.uid, email: id.email, displayName: id.displayName };
  }
  const { getAuthClient } = await import("./chunks/firebaseClient-D3fvED27.mjs").then((n) => n.a8);
  const u = getAuthClient().currentUser;
  if (!u) throw new CliError("not-signed-in", "Not signed in to Firebase.");
  return { uid: u.uid, email: u.email, displayName: u.displayName };
}
async function ensureSelf() {
  const me = await selfAuthUser();
  const { ensureSelfUserRecord } = await import("./chunks/users-Cm3m3K0y.mjs").then((n) => n.u);
  await ensureSelfUserRecord(me);
  return me.uid;
}
function findUser(users, ref, selfId) {
  const id = ref === "me" ? selfId : ref;
  const u = users.find((x) => x.id === id) ?? users.find((x) => x.email && x.email.toLowerCase() === ref.toLowerCase());
  if (!u) {
    throw new CliError(
      "not-found",
      ref === "me" ? "The signed-in user has no record on this site yet." : `No user "${ref}".`,
      ref === "me" ? "Any write command (e.g. `users update me …` or `users locale <code>`) creates it, like the admin's first sign-in." : "List them with `agentcms users list`.",
      2
    );
  }
  return u;
}
function parseSocials(value) {
  const out = {};
  for (const item of value.split(/\s+/).filter(Boolean)) {
    const eq = item.indexOf("=");
    const network = eq < 0 ? item : item.slice(0, eq);
    if (!NETWORKS.includes(network)) throw new CliError("usage", `--social: unknown network "${network}".`, `Networks: ${NETWORKS.join(", ")}.`, 2);
    let rest = eq < 0 ? "" : item.slice(eq + 1);
    let visible = true;
    const flag = /,(visible|hidden)$/.exec(rest);
    if (flag) {
      visible = flag[1] === "visible";
      rest = rest.slice(0, -flag[0].length);
    }
    out[network] = rest ? { url: rest, visible } : null;
  }
  return out;
}
async function readProfile(options, current) {
  const { readJsonOption, readTextOption } = await import("./chunks/adminCommon-DK5a9uhY.mjs");
  const data = readJsonOption(options.data, "data") ?? {};
  if (typeof data !== "object" || Array.isArray(data)) throw new CliError("usage", "--data must be a JSON object.", void 0, 2);
  const patch = {};
  const pick = (flag, key, text = false) => {
    const v = options[flag] !== void 0 ? text ? readTextOption(options[flag], flag) : String(options[flag]) : data[key];
    if (v === void 0) return;
    patch[key] = v === null || v === "" ? null : String(v).trim() || null;
  };
  pick("first-name", "firstName");
  pick("last-name", "lastName");
  pick("title", "title");
  pick("bio", "bio", true);
  pick("avatar", "avatarMediaId");
  if (data.socials !== void 0) {
    if (data.socials !== null && (typeof data.socials !== "object" || Array.isArray(data.socials))) throw new CliError("usage", "--data socials must be an object { network: { url, visible } }.", void 0, 2);
    patch.socials = data.socials ?? null;
  }
  if (options.social !== void 0) {
    const base = { ...patch.socials ?? current.socials ?? {} };
    for (const [network, entry] of Object.entries(parseSocials(String(options.social)))) {
      if (entry) base[network] = entry;
      else delete base[network];
    }
    patch.socials = base;
  }
  return patch;
}
function refuseNoAccounts(kind, what) {
  if (kind === "sqlite-file" || kind === "local") {
    throw new CliError(
      "unsupported-backend",
      `${what} doesn't apply to this site: its ${kind === "sqlite-file" ? "SQLite file" : "local store"} has no accounts — whoever can open it is the admin.`,
      kind === "sqlite-file" ? "Control access through who holds the hosting credentials (and the passphrase)." : void 0,
      2
    );
  }
}
async function run$4({ io, options, positionals }) {
  const [action, ...refs] = positionals;
  const { runAdmin } = await import("./chunks/adminCommon-DK5a9uhY.mjs");
  const alias = options.site;
  const writeOpen = { write: true, lock: true };
  const loadUsers = async (s) => s.users();
  switch (action) {
    case "list":
      return runAdmin(io, alias, {}, async (s) => {
        const [users, { all }, me, kind] = await Promise.all([loadUsers(s), allEntries(), selfAuthUser(), backend()]);
        return {
          backend: kind,
          you: { id: me.uid, email: me.email, hasRecord: users.some((u) => u.id === me.uid) },
          users: users.map((u) => summarize(u, all))
        };
      }, (r) => [
        ...r.users.length ? r.users.map((u) => `${u.id}  ${u.email.padEnd(28)} ${u.role.padEnd(6)}${u.disabled ? " disabled" : ""}  ${[u.firstName, u.lastName].filter(Boolean).join(" ")}  (${u.posts} entries)`) : ["No user records."],
        `Signed in as ${r.you.email ?? r.you.id}${r.you.hasRecord ? "" : " (no record yet — created by the first write, like the admin's first sign-in)"}.`
      ].join("\n"));
    case "get": {
      const ref = refs[0] ?? "me";
      return runAdmin(io, alias, {}, async (s) => {
        const [users, { all }, me] = await Promise.all([loadUsers(s), allEntries(), selfAuthUser()]);
        if (ref === "me" && !users.some((u) => u.id === me.uid)) {
          const own = all.filter((p) => p.authorId === me.uid);
          return {
            id: me.uid,
            email: me.email ?? "",
            hasRecord: false,
            firstName: null,
            lastName: null,
            title: null,
            publicName: me.displayName ?? null,
            role: null,
            disabled: false,
            posts: own.length,
            onlinePosts: own.filter((p) => p.status === "online").length,
            bio: null,
            avatarMediaId: null,
            socials: {},
            note: "No profile stored yet. `agentcms users update me --first-name … --last-name … --bio …` creates it."
          };
        }
        return { ...detail(findUser(users, ref, me.uid), all), hasRecord: true };
      }, (u) => `${u.email} (${u.id})${u.role ? ` — ${u.role}` : ""}${u.disabled ? ", disabled" : ""}
${[u.firstName, u.lastName].filter(Boolean).join(" ")}${u.title ? `, ${u.title}` : ""}${u.bio ? `
${u.bio}` : ""}${"note" in u && u.note ? `
${u.note}` : ""}`);
    }
    case "update": {
      const ref = refs[0];
      if (!ref) throw new CliError("usage", 'users update needs a user id, email or "me".', void 0, 2);
      return runAdmin(io, alias, { write: true, hosting: true, extensions: true, lock: true }, async (s) => {
        const selfId = await ensureSelf();
        const users = await loadUsers(s);
        const user = findUser(users, ref, selfId);
        const patch = await readProfile(options, user);
        if (!Object.keys(patch).length) throw new CliError("usage", "Nothing to change.", "Pass --first-name, --last-name, --title, --bio, --avatar, --social or --data.", 2);
        const media = await s.media();
        if (patch.avatarMediaId && !media.some((m) => m.id === patch.avatarMediaId)) {
          throw new CliError("not-found", `No media "${patch.avatarMediaId}".`, 'Upload it with `agentcms media upload` and pass its id ("" removes the avatar).', 2);
        }
        const { setUserProfile, getUserRecord, buildAuthorLookup } = await import("./chunks/users-Cm3m3K0y.mjs").then((n) => n.u);
        await setUserProfile(user.id, patch);
        const fresh = await getUserRecord(user.id) ?? user;
        const nextUsers = users.map((u) => u.id === user.id ? fresh : u);
        const { posts, pages: pages2, all } = await allEntries();
        const published = [];
        const { withStorageBatch } = await import("./chunks/siteFiles-BbBoVJww.mjs").then((n) => n.s);
        await withStorageBatch(async () => {
          const { publishAuthorsJson, AUTHORS_JSON_PATH } = await import("./chunks/authorsJsonPublisher-J3yJczhe.mjs").then((n) => n.f);
          try {
            await publishAuthorsJson(nextUsers, media, posts, pages2);
            published.push(AUTHORS_JSON_PATH);
          } catch (err) {
            s.log({ level: "error", message: `authors.json refresh failed: ${err.message}` });
          }
          if (all.some((p) => p.status === "online" && p.authorId === user.id)) {
            try {
              const ctx = await s.host.publisher.buildPublishContext({
                terms: await s.terms(),
                settings: s.settings(),
                users: nextUsers,
                authorLookup: buildAuthorLookup(nextUsers, media)
              });
              await s.host.publisher.publishAuthorArchive(user.id, ctx, s.log);
              const { buildAuthorUrl } = await import("./chunks/slug-CZzRNKy4.mjs");
              published.push(buildAuthorUrl(fresh, nextUsers));
            } catch (err) {
              s.log({ level: "error", message: `Author archive refresh failed: ${err.message}` });
            }
          }
        });
        const named = ["firstName", "lastName"].some((k) => k in patch) && all.some((p) => p.status === "online" && p.authorId === user.id);
        return { ...detail(fresh, all), changed: Object.keys(patch), published, next: named ? [`agentcms regenerate all --site ${s.site.alias}`] : [] };
      }, (r) => `Updated ${r.email}: ${r.changed.join(", ")}${r.published.length ? ` — republished ${r.published.join(", ")}` : ""}`);
    }
    case "role": {
      const [ref, role] = refs;
      if (!ref || role !== "admin" && role !== "editor") throw new CliError("usage", "users role <id|email> admin|editor", void 0, 2);
      return runAdmin(io, alias, writeOpen, async (s) => {
        const kind = await backend();
        refuseNoAccounts(kind, "A role");
        const selfId = await ensureSelf();
        const users = await loadUsers(s);
        const user = findUser(users, ref, selfId);
        if (kind === "firebase" && role === "editor" && user.role === "admin") {
          const otherAdmins = users.filter((u) => u.id !== user.id && u.role === "admin" && !u.disabled);
          if (!otherAdmins.length) throw new CliError("last-admin", `${user.email} is the only active admin of ${s.site.alias}.`, "Make another user admin first.", 2);
          if (user.id === selfId && !options.force) throw new CliError("self-demote", "This would remove your own admin rights (the account this computer signs in with).", "Re-run with --force if that is really intended.", 2);
        }
        const { setUserRole } = await import("./chunks/users-Cm3m3K0y.mjs").then((n) => n.u);
        await setUserRole(user.id, role);
        return {
          id: user.id,
          email: user.email,
          role,
          note: kind === "markdown-git" ? "Informational on Markdown-in-git sites: the effective role follows the account's repository permission (admin = repo admin) at its next sign-in." : null
        };
      }, (r) => `${r.email} is now ${r.role}.${r.note ? `
${r.note}` : ""}`);
    }
    case "disable":
    case "enable": {
      const ref = refs[0];
      if (!ref) throw new CliError("usage", `users ${action} needs a user id or email.`, void 0, 2);
      return runAdmin(io, alias, writeOpen, async (s) => {
        const kind = await backend();
        refuseNoAccounts(kind, "Disabling an account");
        const selfId = await ensureSelf();
        const user = findUser(await loadUsers(s), ref, selfId);
        const { setUserDisabled } = await import("./chunks/users-Cm3m3K0y.mjs").then((n) => n.u);
        await setUserDisabled(user.id, action === "disable");
        return {
          id: user.id,
          email: user.email,
          disabled: action === "disable",
          note: kind === "markdown-git" ? "The admin refuses a disabled user; their repository access is unchanged (remove them from the repo to revoke it)." : null
        };
      }, (r) => `${r.email} ${r.disabled ? "disabled" : "enabled"}.${r.note ? `
${r.note}` : ""}`);
    }
    case "delete": {
      const ref = refs[0];
      if (!ref) throw new CliError("usage", "users delete needs a user id or email.", void 0, 2);
      const noteFor = (kind) => kind === "firebase" ? "Only the user record is removed: the Firebase Auth account stays (delete it in the Firebase Console), and signing in again recreates the record." : kind === "markdown-git" ? "Only the user record is removed: the account keeps its repository access, and signing in again recreates the record." : "Only the user record is removed (this site has no accounts).";
      if (!options.yes) {
        return runAdmin(io, alias, {}, async (s) => {
          const [users, { all }, me, kind] = await Promise.all([loadUsers(s), allEntries(), selfAuthUser(), backend()]);
          const user = findUser(users, ref, me.uid);
          return { needsConfirmation: true, delete: summarize(user, all), note: noteFor(kind) };
        }, (r) => `Would delete the record of ${r.delete.email} (${r.delete.posts} entries keep them as author). ${r.note}
Nothing changed — re-run with --yes once the user agrees.`);
      }
      return runAdmin(io, alias, writeOpen, async (s) => {
        const kind = await backend();
        const me = await selfAuthUser();
        const user = findUser(await loadUsers(s), ref, me.uid);
        const { deleteUserRecord } = await import("./chunks/users-Cm3m3K0y.mjs").then((n) => n.u);
        await deleteUserRecord(user.id);
        return { id: user.id, email: user.email, deleted: true, note: noteFor(kind) };
      }, (r) => `Deleted the record of ${r.email}. ${r.note}`);
    }
    case "locale": {
      const code = refs[0];
      if (!code || !LOCALES.includes(code)) throw new CliError("usage", "users locale <code>", `The admin's languages: ${LOCALES.join(", ")}.`, 2);
      return runAdmin(io, alias, writeOpen, async () => {
        const selfId = await ensureSelf();
        const { setUserPreferences, getUserRecord } = await import("./chunks/users-Cm3m3K0y.mjs").then((n) => n.u);
        await setUserPreferences(selfId, { adminLocale: code });
        const rec = await getUserRecord(selfId);
        return { id: selfId, email: rec?.email ?? null, adminLocale: rec?.preferences?.adminLocale ?? code };
      }, (r) => `Admin language of ${r.email ?? r.id}: ${r.adminLocale} (applies at the next admin load).`);
    }
    default:
      throw new CliError("usage", action ? `Unknown users action "${action}".` : "users needs an action.", "Actions: list, get, update, role, disable, enable, delete, locale.", 2);
  }
}
const usersCommand = {
  name: "users",
  summary: "The Users page: list, get [<id|email|me>], update <id|email|me> (public author profile; republishes data/authors.json and the author's archive), role <id|email> admin|editor, disable / enable <id|email>, delete <id|email> (the record only; plan first, --yes), locale <code> (the signed-in user's admin language).",
  usage: 'users <list|get|update|role|disable|enable|delete|locale> [<id|email|me>] [admin|editor|<locale>] --site <alias> [--first-name <t>] [--last-name <t>] [--title <t>] [--bio <text>|@file|-] [--avatar <media id>|""] [--social "<network>=<url>[,hidden] …"] [--data <json>|@file] [--yes]',
  options: [
    { name: "site", type: "string", description: "Site alias." },
    { name: "first-name", type: "string", description: 'update: first name ("" clears).' },
    { name: "last-name", type: "string", description: 'update: last name ("" clears).' },
    { name: "title", type: "string", description: 'update: job title shown under the name ("" clears).' },
    { name: "bio", type: "string", description: 'update: bio — text, @file, or - for stdin ("" clears).' },
    { name: "avatar", type: "string", description: 'update: avatar media id ("" removes it).' },
    {
      name: "social",
      type: "string",
      description: `update: space-separated network=url entries merged into the profile (",hidden" keeps it off the public page, "network=" removes it). Networks: ${NETWORKS.join(", ")}. Repeatable.`,
      multiple: true
    },
    { name: "data", type: "string", description: "update: fields as JSON (or @file.json): firstName, lastName, title, bio, avatarMediaId, socials { network: { url, visible } } (replaces all). Flags override it." },
    { name: "yes", type: "boolean", description: "delete: apply (otherwise only the plan)." },
    { name: "force", type: "boolean", description: "role: allow demoting your own account (never the last admin)." }
  ],
  run: run$4
};
function readExport(file2) {
  const path = resolve(file2);
  if (!existsSync(path)) throw new CliError("not-found", `${path} does not exist.`, void 0, 2);
  let data;
  try {
    data = JSON.parse(readFileSync(path, "utf8"));
  } catch (err) {
    throw new CliError("invalid-export", `${path} is not JSON: ${err.message}`, void 0, 2);
  }
  const ok = !!data && typeof data === "object" && data.format === "agentcms-export" && data.version === 1 && typeof data.collections === "object";
  if (!ok) throw new CliError("invalid-export", `${path} is not an AgentCMS export.`, "Make one with `agentcms transfer export --out <file>` (or Settings → Data backend → Export).", 2);
  return data;
}
function counts(data) {
  return Object.fromEntries(Object.entries(data.collections).map(([k, v]) => [k, Array.isArray(v) ? v.length : 0]));
}
function withoutTarget(data) {
  const config = (data.collections.config ?? []).filter((d) => d.id !== "storage");
  return { ...data, collections: { ...data.collections, config } };
}
async function run$3({ io, options, positionals }) {
  const [action, file2] = positionals;
  const { runAdmin } = await import("./chunks/adminCommon-DK5a9uhY.mjs");
  const alias = options.site;
  switch (action) {
    case "export": {
      const out = resolve(String(options.out ?? file2 ?? `agentcms-export-${(/* @__PURE__ */ new Date()).toISOString().slice(0, 10)}.json`));
      return runAdmin(io, alias, {}, async (s) => {
        const { exportContent } = await import("./chunks/contentTransfer-Das1DPA3.mjs");
        const data = await exportContent();
        if (!data.collections.config?.some((d) => d.id === "externalRegistry")) {
          const { fallbackRegistry, siteHostingReader } = await import("./chunks/adminFiles-DaySk4Kz.mjs");
          const registry = await fallbackRegistry(s.site, await siteHostingReader(s.site));
          if (registry.plugins.length || registry.themes.length) (data.collections.config ??= []).push({ ...registry, id: "externalRegistry" });
        }
        mkdirSync(dirname(out), { recursive: true });
        const text = JSON.stringify(data, null, 2);
        writeFileSync(out, text);
        return { file: out, bytes: text.length, backend: data.backend, counts: counts(data), note: "Secrets (tokens, keys) are not in the file; media files stay on the publish target." };
      }, (r) => `Exported ${Object.entries(r.counts).map(([k, n]) => `${n} ${k}`).join(", ")} to ${r.file}`);
    }
    case "import": {
      if (!file2) throw new CliError("usage", "transfer import needs the export file.", "agentcms transfer import <file.json> --mode merge|replace --site <alias>", 2);
      const mode = String(options.mode ?? "merge");
      if (mode !== "merge" && mode !== "replace") throw new CliError("usage", `--mode is merge or replace (got "${mode}").`, void 0, 2);
      const raw = readExport(file2);
      const keepTarget = !!options["keep-target"];
      const data = keepTarget ? withoutTarget(raw) : raw;
      const next = (a) => `agentcms regenerate everything --site ${a}`;
      const check2 = async () => {
        const { canImportContent } = await import("./chunks/contentTransfer-Das1DPA3.mjs");
        if (!canImportContent()) {
          throw new CliError("unsupported-backend", "Import only works on Markdown-in-git and SQLite-file sites.", "Firebase sites can be exported, not imported into.", 2);
        }
      };
      const targetWarning = async () => {
        const incoming = (data.collections.config ?? []).find((d) => d.id === "storage");
        if (!incoming) return null;
        const { getStorageConfig } = await import("./chunks/registry-Df5_x1nj.mjs").then((n) => n.C);
        const current = await getStorageConfig().catch(() => null);
        const same = current && current.connectorId === incoming.connectorId && JSON.stringify(current.settings ?? {}) === JSON.stringify({ ...current.settings ?? {}, ...incoming.settings ?? {} });
        return same ? null : `The file replaces this site's publish target with the exported one (${incoming.connectorId ?? "?"}). Pass --keep-target to keep the current one.`;
      };
      if (!options.yes) {
        return runAdmin(io, alias, {}, async (s) => {
          await check2();
          const { getDocStore } = await import("./chunks/registry-Df5_x1nj.mjs").then((n) => n.B);
          const store = getDocStore();
          await store.ready();
          const current = Object.fromEntries(Object.keys(data.collections).map((c) => [c, store.list(c).length]));
          return {
            needsConfirmation: true,
            mode,
            from: { backend: data.backend, exportedAt: data.exportedAt },
            incoming: counts(data),
            current,
            warning: await targetWarning(),
            note: mode === "replace" ? "replace empties every collection present in the file first (posts, terms, media records, users, settings…) — documents not in the file are lost." : "merge overwrites documents with the same id and keeps the others.",
            next: next(s.site.alias)
          };
        }, (r) => [
          `Would import (${r.mode}) ${Object.entries(r.incoming).map(([k, n]) => `${n} ${k}`).join(", ")} — this site has ${Object.entries(r.current).map(([k, n]) => `${n} ${k}`).join(", ")}.`,
          r.note,
          ...r.warning ? [r.warning] : [],
          "Nothing changed — re-run with --yes once the user agrees."
        ].join("\n"));
      }
      return runAdmin(io, alias, { write: true, lock: true }, async (s) => {
        await check2();
        const warning = await targetWarning();
        const { importContent } = await import("./chunks/contentTransfer-Das1DPA3.mjs");
        const imported = await importContent(data, mode);
        return {
          imported,
          mode,
          publishTargetReplaced: !!warning,
          note: "Nothing was republished: the public site still shows the previous content.",
          next: next(s.site.alias)
        };
      }, (r) => `Imported (${r.mode}) ${Object.entries(r.imported).map(([k, n]) => `${n} ${k}`).join(", ")}.
${r.note} Next: ${r.next}`);
    }
    default:
      throw new CliError("usage", action ? `Unknown transfer action "${action}".` : "transfer needs an action.", "Actions: export, import.", 2);
  }
}
const transferCommand = {
  name: "transfer",
  summary: "Settings → Data backend → Export / Import: export (every backend → one JSON file, no secrets, no media files), import <file> --mode merge|replace (Markdown-in-git / SQLite-file sites, ids kept, one write; plan first, --yes; republishes nothing → then `regenerate everything`).",
  usage: "transfer <export|import> [<file>] --site <alias> [--out <file>] [--mode merge|replace] [--keep-target] [--yes]",
  options: [
    { name: "site", type: "string", description: "Site alias." },
    { name: "out", type: "string", description: "export: output file (default agentcms-export-<date>.json)." },
    { name: "mode", type: "string", description: "import: merge (same ids overwritten, others kept; default) or replace (collections in the file emptied first)." },
    { name: "keep-target", type: "boolean", description: "import: keep this site's publish target instead of the one in the file." },
    { name: "yes", type: "boolean", description: "import: apply (otherwise only the plan)." }
  ],
  run: run$3
};
async function run$2({ io, options }) {
  const { runAdmin } = await import("./chunks/adminCommon-DK5a9uhY.mjs");
  return runAdmin(io, options.site, {}, async (s) => {
    const { fetchAllPosts, invalidateAllPostsCache } = await import("./chunks/posts-D28k7tn_.mjs");
    invalidateAllPostsCache();
    const [posts, pages2, terms, media, users] = await Promise.all([
      fetchAllPosts({ type: "post" }),
      fetchAllPosts({ type: "page" }),
      s.terms(),
      s.media(),
      s.users()
    ]);
    const split = (list2) => ({
      total: list2.length,
      online: list2.filter((p) => p.status === "online").length,
      draft: list2.filter((p) => p.status !== "online").length
    });
    return {
      posts: split(posts),
      pages: split(pages2),
      terms: { total: terms.length, categories: terms.filter((t) => t.type === "category").length, tags: terms.filter((t) => t.type === "tag").length },
      media: media.length,
      users: users.length
    };
  }, (r) => [
    `Posts  ${r.posts.total} (${r.posts.online} online, ${r.posts.draft} draft)`,
    `Pages  ${r.pages.total} (${r.pages.online} online, ${r.pages.draft} draft)`,
    `Terms  ${r.terms.total} (${r.terms.categories} categories, ${r.terms.tags} tags)`,
    `Media  ${r.media}`,
    `Users  ${r.users}`
  ].join("\n"));
}
const statsCommand = {
  name: "stats",
  summary: "The dashboard's numbers: posts and pages (total / online / draft), terms (categories / tags), media, users.",
  usage: "stats --site <alias>",
  options: [{ name: "site", type: "string", description: "Site alias." }],
  run: run$2
};
const TEXT = /* @__PURE__ */ new Set([".html", ".htm", ".css", ".js", ".mjs", ".json", ".xml", ".txt", ".svg", ".md", ".webmanifest", ".xsl", ".csv"]);
const PROTECTED = [/^admin(\/|$)/, /^theme-assets\//, /^data\/(menu|posts|authors|products)\.json$/, /\.sqlite$/, /(^|\/)config\.js$/];
function cleanPath(raw) {
  const p = raw.replace(/^\/+/, "");
  if (!p || p.split("/").some((seg) => seg === ".." || seg === ".")) throw new CliError("usage", `Invalid path "${raw}".`, "Use a path relative to the site, e.g. robots.txt or old/index.html.", 2);
  return p;
}
async function run$1({ io, options, positionals }) {
  const [action, a, b] = positionals;
  const alias = options.site;
  const { runAdmin, confirmOrPlan } = await import("./chunks/adminCommon-DK5a9uhY.mjs");
  switch (action) {
    case "list":
      return runAdmin(io, alias, { hosting: true }, async () => {
        const files = await import("./chunks/siteFiles-BbBoVJww.mjs").then((n) => n.s);
        const caps = await files.getStorageCapabilities();
        if (!caps.list) throw new CliError("unsupported", `The ${caps.connectorId} hosting can't list its files.`);
        const prefix = a ? cleanPath(a) : "";
        const out = [];
        for (let page = 1; page < 200; page++) {
          const res = await files.listFiles(page, 500);
          for (const it of res.items) if (it.type === "file" && it.path.startsWith(prefix)) out.push({ path: it.path, size: it.size ?? null });
          if (res.items.length < res.per_page || res.total !== void 0 && page * res.per_page >= res.total) break;
        }
        return { prefix, count: out.length, files: out };
      }, (r) => r.count ? r.files.map((f) => `${f.path}${f.size != null ? `  ${f.size} B` : ""}`).join("\n") : "No files.");
    case "put": {
      if (!a) throw new CliError("usage", "files put needs a local file (and optionally the path on the site).", "e.g. agentcms files put ./google1234.html", 2);
      if (!existsSync(a)) throw new CliError("not-found", `${a} does not exist.`, void 0, 2);
      const target = cleanPath(b ?? a.split("/").pop());
      if (PROTECTED.some((re) => re.test(target))) throw new CliError("protected", `${target} is managed by the CMS.`, "Change it through its command (deploy-admin, themes, regenerate…).", 2);
      return runAdmin(io, alias, { write: true, hosting: true, lock: true }, async () => {
        const files = await import("./chunks/siteFiles-BbBoVJww.mjs").then((n) => n.s);
        const bytes = readFileSync(a);
        const text = TEXT.has(extname(target).toLowerCase());
        await files.withStorageBatch(
          () => files.uploadFile(text ? { path: target, content: bytes.toString("utf8") } : { path: target, content: bytes.toString("base64"), encoding: "base64" })
        );
        return { path: target, bytes: bytes.length, url: await files.publicUrlFor(target) };
      }, (r) => `Uploaded ${r.path} (${r.bytes} B) → ${r.url}`);
    }
    case "delete": {
      const paths2 = positionals.slice(1).map(cleanPath);
      if (!paths2.length) throw new CliError("usage", "files delete needs one or more paths.", void 0, 2);
      const blocked = paths2.filter((p) => PROTECTED.some((re) => re.test(p)));
      if (blocked.length) throw new CliError("protected", `${blocked.join(", ")}: managed by the CMS.`, "Use the matching command instead (unpublish content, deploy-admin…).", 2);
      if (!await confirmOrPlan(io, !!options.yes, { delete: paths2 }, () => `Would delete ${paths2.join(", ")} from the site.`)) return;
      return runAdmin(io, alias, { write: true, hosting: true, lock: true }, async () => {
        const files = await import("./chunks/siteFiles-BbBoVJww.mjs").then((n) => n.s);
        await files.withStorageBatch(async () => {
          for (const p of paths2) await files.deleteFile(p);
        });
        return { deleted: paths2 };
      }, (r) => `Deleted ${r.deleted.join(", ")}.`);
    }
    default:
      throw new CliError("usage", action ? `Unknown files action "${action}".` : "files needs an action.", "Actions: list [prefix], put <local file> [site path], delete <path…> --yes.", 2);
  }
}
const filesCommand = {
  name: "files",
  summary: "Files on the hosting, relative to the site's folder: list [prefix], put <local file> [site path] (e.g. a search-engine verification file), delete <path…> (plan first, --yes; e.g. a stray old page). The CMS's own files (admin, theme assets, data/*.json, database) are protected — use their commands.",
  usage: "files <list|put|delete> [args] --site <alias> [--yes]",
  options: [
    { name: "site", type: "string", description: "Site alias." },
    { name: "yes", type: "boolean", description: "delete: apply (otherwise only the plan)." }
  ],
  run: run$1
};
function readPlan(source) {
  const text = source === "-" ? readFileSync(0, "utf8") : readFileSync(source, "utf8");
  try {
    return JSON.parse(text);
  } catch (err) {
    throw new CliError("invalid-plan", `The plan is not valid JSON: ${err.message}`, void 0, 2);
  }
}
const SECRET_FIELDS = {
  s3: "access key + secret key"
};
function publicContentWarning(plan) {
  if (plan.backend !== "markdown-git" || plan.target.connectorId !== "git-pages") return [];
  const git = plan.runtime.git ?? {};
  const t = plan.target.settings;
  const same = git.provider === t.provider && (git.provider === "gitlab" ? git.project === t.project : git.owner === t.owner && git.repo === t.repo);
  if (!same || t.dir && t.dir !== "/" && t.dir !== "") return [];
  return ["the content is in the repository the site is published from: its whole tree is public — drafts, unpublished pages and users.json (editors' emails) included. Use a separate private content repository, or a `docs` publish folder."];
}
const installCommand = {
  name: "install",
  summary: "Install a site from a JSON plan (see `options`): checks access, creates the content store, saves the publish target, uploads theme assets and the admin, registers the site. --dry-run only checks.",
  usage: "install --plan <file|-> [--dry-run] [--overwrite-target]",
  options: [
    { name: "plan", type: "string", description: "Plan file path, or - for stdin." },
    { name: "dry-run", type: "boolean", description: "Validate the plan and test access without writing anything." },
    { name: "overwrite-target", type: "boolean", description: "Replace the publish target already stored in existing content." }
  ],
  async run({ io, options }) {
    if (typeof options.plan !== "string") throw new CliError("usage", "install needs --plan <file|->.", "Run `agentcms options` for the format.", 2);
    installBrowserEnv();
    const { resolvePlan } = await import("./chunks/plan-CeXlCTev.mjs").then((n) => n.p);
    const plan = resolvePlan(readPlan(options.plan));
    if (getSite(plan.alias)) {
      throw new CliError("site-exists", `A site named "${plan.alias}" is already registered.`, "Use another alias, or `agentcms site forget` it first.");
    }
    const { checkPlan, runInstall } = await import("./chunks/install-B9sCv3gx.mjs");
    io.err("Checking access…");
    const checks = await checkPlan(plan);
    const stored = checks.data.storedTarget;
    const conflict = !!stored && (stored.connectorId !== plan.target.connectorId || String(stored.settings.siteUrl ?? "").replace(/\/+$/, "") !== plan.siteUrl);
    const summary = {
      alias: plan.alias,
      data: plan.backend,
      hosting: plan.hostingType,
      siteUrl: plan.siteUrl,
      adminUrl: secureAdminUrlOf({ siteUrl: plan.siteUrl, adminFolder: plan.adminFolder, hosting: plan.publicTarget }) ?? adminUrlOf({ siteUrl: plan.siteUrl, adminFolder: plan.adminFolder }),
      credentials: plan.credentials,
      checks,
      warnings: publicContentWarning(plan)
    };
    if (!checks.hosting.ok || !checks.data.ok) {
      throw new CliError(
        "check-failed",
        [!checks.data.ok && `Data: ${checks.data.detail}`, !checks.hosting.ok && `Hosting: ${checks.hosting.detail}`].filter(Boolean).join(" — "),
        "Fix the access (token permissions, repo / bucket names, URL) and retry."
      );
    }
    if (conflict && !options["overwrite-target"]) {
      throw new CliError(
        "content-exists",
        `This content is already set up to publish to ${stored.connectorId} (${String(stored.settings.siteUrl ?? "?")}).`,
        "Ask the user: keep that site (register it with `agentcms site add`) or pass --overwrite-target to publish elsewhere."
      );
    }
    if (options["dry-run"]) {
      printResult(
        io,
        { ...summary, dryRun: true, existingContent: checks.data.existing },
        () => `Plan OK for ${plan.alias}: ${plan.backend} → ${plan.hostingType} (${plan.siteUrl}). Nothing was written.`
      );
      return;
    }
    const unlock = lockSite(plan.alias);
    try {
      const outcome = await runInstall(plan, (label) => io.err(`• ${label}`));
      const now = (/* @__PURE__ */ new Date()).toISOString();
      putSite({
        alias: plan.alias,
        siteUrl: plan.siteUrl,
        adminFolder: plan.adminFolder,
        runtime: plan.runtime,
        hosting: plan.publicTarget,
        credentials: plan.credentials,
        adminVersion: outcome.adminVersion ?? void 0,
        installedAt: now,
        updatedAt: now
      });
      const nextSteps2 = [];
      if (summary.adminUrl) nextSteps2.push(`Open the admin: ${summary.adminUrl}`);
      else nextSteps2.push("The admin was not copied to the hosting: run `agentcms serve` to use it locally.");
      if (plan.backend === "markdown-git") {
        nextSteps2.push("Each browser asks once for the editor's own git token (Contents read/write on the content repository).");
      } else if (plan.backend === "firebase") {
        nextSteps2.push("Editors sign in to the admin with their Firebase email + password (create their accounts in the Firebase console → Authentication).");
      } else {
        nextSteps2.push(
          `Each new browser asks once for the ${plan.dataLocation && plan.dataLocation !== plan.target ? "data location" : "hosting"} keys${plan.passphraseAccount ? " and the database passphrase" : ""} (they stay in that browser). No login: protect the admin folder at the hosting level.`
        );
        if (plan.passphraseAccount) {
          nextSteps2.push(
            `The database is encrypted. Have the user save its passphrase in a password manager now: \`agentcms credentials copy ${plan.passphraseAccount}\` puts it on the clipboard. Without it the content can't be opened.`
          );
        } else if (!plan.dataLocation || plan.dataLocation === plan.target) {
          nextSteps2.push("Warning: the database is NOT encrypted and is served by the public site — anyone who guesses its path can download it.");
        } else if (plan.dataLocation.connectorId === "git-pages") {
          nextSteps2.push("Warning: the database is NOT encrypted — anyone who can read the repository (public repos: everyone) can download it.");
        }
      }
      if (plan.backend === "markdown-git" && SECRET_FIELDS[plan.target.connectorId]) {
        nextSteps2.push(`Publishing from a browser needs the hosting ${SECRET_FIELDS[plan.target.connectorId]} once: admin → Settings → Publish target.`);
      }
      if (plan.target.connectorId === "git-pages") nextSteps2.push("Pages hosts take about a minute to serve new commits.");
      if (!checks.data.existing) {
        nextSteps2.push(
          `New sites start as "My site", in English, with the default theme and every plugin on (including agentcms-multilang): set the title, description and language (\`agentcms settings set --site ${plan.alias} --title … --language …\`), pick a theme, disable agentcms-multilang for a one-language site, and give the author a public name (\`agentcms users update me --site ${plan.alias} --first-name … --last-name …\`).`
        );
      }
      for (const w of summary.warnings) nextSteps2.push(`Warning: ${w}`);
      nextSteps2.push(`Check everything with \`agentcms doctor --site ${plan.alias}\`.`);
      printResult(
        io,
        { ...summary, installed: true, files: outcome.files, adminVersion: outcome.adminVersion, notices: outcome.notices, nextSteps: nextSteps2 },
        () => [`Installed ${plan.alias}.`, ...outcome.notices.map((n) => `${n.level}: ${n.message}`), ...nextSteps2.map((s) => `- ${s}`)].join("\n")
      );
    } finally {
      unlock();
    }
  }
};
const DATA_BACKENDS = [
  {
    id: "sqlite-file",
    summary: "One SQLite file stored on the site's own hosting.",
    goodFor: "One owner, simplest setup, no other account.",
    cli: true,
    fields: [
      { key: "path", required: true, description: "File path on the hosting (or in the separate location).", example: "data/site.sqlite" },
      {
        key: "encryption",
        required: false,
        description: 'Default: encrypted with a passphrase generated at install, stored as passphrase:<alias>. { credential: "passphrase:<name>" } to use an existing one, false for a plain file.'
      },
      {
        key: "location",
        required: false,
        description: "Separate PRIVATE place for the database: { type, settings, credential } like hosting (e.g. a private S3 / R2 bucket, a private GitHub repo via git-other). Default: the hosting itself — for git hostings, the dedicated branch agentcms-data of the same repo (never published, no site rebuild on save)."
      }
    ],
    credentialTypes: ["passphrase"],
    notes: [
      "A static host serves the database file like any page: keep it encrypted (default) and/or in a separate private location.",
      "No login screen: anyone who can open the admin and has the passphrase can edit; each browser asks for the keys + passphrase once.",
      "Losing the passphrase means losing the content: have the user save it (`agentcms credentials copy passphrase:<alias>`)."
    ]
  },
  {
    id: "markdown-git",
    summary: "Posts as Markdown files in a GitHub or GitLab repository; every change is a commit.",
    goodFor: "Several editors or computers, full history.",
    cli: true,
    fields: [
      { key: "git.provider", required: true, description: "github | gitlab", example: "github" },
      { key: "git.owner", required: false, description: "GitHub user or organisation (github).", example: "my-login" },
      { key: "git.repo", required: false, description: "GitHub repository name (github).", example: "my-site-content" },
      { key: "git.project", required: false, description: "GitLab project path (gitlab).", example: "group/my-site-content" },
      { key: "git.branch", required: false, description: "Branch.", default: "main" },
      { key: "git.contentDir", required: false, description: 'Folder inside the repo ("" = root).', default: "" },
      { key: "git.apiBaseUrl", required: false, description: "Self-hosted GitHub Enterprise / GitLab API URL." }
    ],
    credentialTypes: ["github", "gitlab"],
    notes: ["Each editor signs in to the admin with their own token; repository permission = role."]
  },
  {
    id: "firebase",
    summary: "Firestore + Firebase Auth.",
    goodFor: "Real-time multi-editor with email/password logins.",
    cli: true,
    fields: [
      { key: "firebase.apiKey", required: true, description: "Web app config apiKey (public — Firebase console → Project settings → Your apps)." },
      { key: "firebase.authDomain", required: true, description: "e.g. <project>.firebaseapp.com" },
      { key: "firebase.projectId", required: true, description: "Project id." },
      { key: "firebase.appId", required: true, description: "Web app id." },
      { key: "firebase.storageBucket", required: false, description: "From the web app config." },
      { key: "firebase.messagingSenderId", required: false, description: "From the web app config." },
      { key: "credential", required: true, description: "firebase:<name> account (email + password of the bootstrap admin)." }
    ],
    credentialTypes: ["firebase"],
    notes: [
      "The project needs Authentication → Email/Password enabled, a user for the admin, Firestore created, and the AgentCMS Firestore rules published with that email pinned (README → Firestore rules). The CLI checks all of it before installing.",
      "Like the setup wizard, the publish target's keys are stored in Firestore config/storage (readable by the site's editors)."
    ]
  },
  {
    id: "local",
    summary: "Data kept in one browser (IndexedDB).",
    goodFor: "Trying it out on one computer.",
    cli: false,
    fields: [],
    credentialTypes: [],
    notes: ["Browser-only by nature: run `agentcms serve` and use the setup wizard."]
  }
];
const SITE_URL = {
  key: "siteUrl",
  required: true,
  description: "Public URL the site is served at.",
  example: "https://my-login.github.io/my-site"
};
const gitFields = (provider) => [
  ...provider === "github" ? [
    { key: "owner", required: true, description: "GitHub user or organisation.", example: "my-login" },
    { key: "repo", required: true, description: "Repository holding the published site.", example: "my-site" }
  ] : [{ key: "project", required: true, description: "GitLab project path.", example: "group/my-site" }],
  { key: "branch", required: false, description: "Branch the host publishes.", default: "main" },
  { key: "dir", required: false, description: "Repo folder holding the site.", default: provider === "gitlab" ? "public" : "" },
  { key: "apiBaseUrl", required: false, description: "Self-hosted API URL." },
  SITE_URL
];
const HOSTINGS = [
  {
    id: "github-pages",
    connectorId: "git-pages",
    summary: "GitHub Pages — free hosting from a GitHub repository.",
    cli: true,
    fields: gitFields("github"),
    credentialTypes: ["github"],
    notes: [
      "siteUrl is https://<owner>.github.io/<repo> (or https://<owner>.github.io for a <owner>.github.io repo).",
      "GitHub Pages is enabled automatically when the token has the Pages permission; otherwise Settings → Pages → Deploy from a branch → main / root.",
      "Free plans need a public repository for Pages."
    ]
  },
  {
    id: "cloudflare-pages",
    connectorId: "git-pages",
    summary: "Cloudflare Pages connected to a GitHub repository.",
    cli: true,
    fields: gitFields("github"),
    credentialTypes: ["github"],
    notes: ["Connect the repo once in the Cloudflare dashboard (Workers & Pages → Create → Pages → Connect to Git), no build command, output directory = repo root."]
  },
  {
    id: "gitlab-pages",
    connectorId: "git-pages",
    summary: "GitLab Pages.",
    cli: true,
    fields: gitFields("gitlab"),
    credentialTypes: ["gitlab"],
    notes: ["A minimal .gitlab-ci.yml is committed with the first publish."]
  },
  {
    id: "git-other",
    connectorId: "git-pages",
    summary: "Any host that deploys a GitHub repository (Netlify, Vercel…).",
    cli: true,
    fields: gitFields("github"),
    credentialTypes: ["github"],
    notes: []
  },
  {
    id: "s3",
    connectorId: "s3",
    summary: "S3-compatible bucket (AWS, OVHcloud, Scaleway, Cloudflare R2, MinIO…).",
    cli: true,
    fields: [
      { key: "endpoint", required: false, description: "S3 API endpoint (empty = AWS).", example: "https://s3.eu-west-par.io.cloud.ovh.net" },
      { key: "region", required: true, description: "Region.", example: "eu-west-par" },
      { key: "bucket", required: true, description: "Bucket name.", example: "my-site" },
      { key: "prefix", required: false, description: "Key prefix inside the bucket.", default: "" },
      { key: "publicRead", required: false, description: "Send the public-read ACL (OVHcloud / Scaleway buckets without a bucket policy).", default: false },
      { key: "forcePathStyle", required: false, description: "Path-style URLs (default: off on AWS, on elsewhere)." },
      SITE_URL
    ],
    credentialTypes: ["s3"],
    notes: [
      "The bucket needs CORS allowing GET/PUT/DELETE/HEAD from the admin's origin(s) and static website hosting with index.html.",
      "Host the admin on the bucket's HTTPS endpoint — signing requests needs a secure context."
    ]
  },
  {
    id: "local-folder",
    connectorId: "local-folder",
    summary: "A folder on this computer (browser File System Access).",
    cli: false,
    fields: [],
    credentialTypes: [],
    notes: ["Browser-only: use `agentcms serve` and the setup wizard."]
  },
  {
    id: "zip",
    connectorId: "browser-mirror",
    summary: "ZIP download to upload by hand.",
    cli: false,
    fields: [],
    credentialTypes: [],
    notes: ["Browser-only: use `agentcms serve` and the setup wizard."]
  }
];
function findHosting(id) {
  return HOSTINGS.find((h) => h.id === id);
}
function findDataBackend(id) {
  return DATA_BACKENDS.find((d) => d.id === id);
}
const PLAN_EXAMPLE = {
  alias: "my-blog",
  data: { backend: "markdown-git", git: { provider: "github", owner: "my-login", repo: "my-blog-content", branch: "main" }, credential: "github:my-login" },
  hosting: { type: "github-pages", settings: { owner: "my-login", repo: "my-blog", siteUrl: "https://my-login.github.io/my-blog" } },
  admin: { folder: "admin" }
};
const optionsCommand = {
  name: "options",
  summary: "List data backends, hostings, credential types and the install plan format — ask the user about data first, then hosting.",
  usage: "options",
  options: [
    { name: "firebase-rules", type: "string", description: "Print the Firestore security rules to publish for a Firebase site, with this email pinned as bootstrap admin." }
  ],
  async run({ io, options }) {
    if (options["firebase-rules"]) {
      const { firestoreRules } = await import("./chunks/firestoreRules-Cx95dsqP.mjs");
      const email = String(options["firebase-rules"]);
      const rules = firestoreRules(email);
      printResult(io, { email, rules, where: "Firebase console → Firestore Database → Rules → paste → Publish (or `firebase deploy --only firestore:rules` with the rules in firestore.rules)." }, () => rules);
      return;
    }
    const data = {
      order: ["data", "hosting"],
      dataBackends: DATA_BACKENDS,
      hostings: HOSTINGS,
      credentialTypes: CREDENTIAL_TYPES,
      planExample: PLAN_EXAMPLE,
      planNotes: [
        "Secrets never go in the plan: store them first with `agentcms credentials set <type>:<name>` and reference the account id.",
        "hosting.credential may be omitted for git hostings on the same provider as markdown-git content (the content token is reused).",
        "admin: false skips copying the admin onto the hosting.",
        "SQLite is encrypted by default (passphrase generated and stored as passphrase:<alias>); data.location keeps the file in a separate private place.",
        "Entries with cli: false need the setup wizard: `agentcms serve`."
      ]
    };
    printResult(
      io,
      data,
      () => [
        "1. Where is the content stored?",
        ...DATA_BACKENDS.map((d) => `   ${d.id.padEnd(14)} ${d.summary}${d.cli ? "" : "  (wizard only)"}`),
        "",
        "2. Where is the site hosted?",
        ...HOSTINGS.map((h) => `   ${h.id.padEnd(17)} ${h.summary}${h.cli ? "" : "  (wizard only)"}`),
        "",
        "Plan example (agentcms install --plan plan.json):",
        JSON.stringify(PLAN_EXAMPLE, null, 2)
      ].join("\n")
    );
  }
};
const MIME = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".wasm": "application/wasm",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".gif": "image/gif",
  ".ico": "image/x-icon",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
  ".txt": "text/plain; charset=utf-8",
  ".zip": "application/zip"
};
const NO_CACHE = /* @__PURE__ */ new Set(["/index.html", "/config.js", "/admin-files.json", "/external.default.json"]);
function resolveRequestPath(root, url, prefix = "") {
  let pathname;
  try {
    pathname = decodeURIComponent(new URL(url, "http://localhost").pathname);
  } catch {
    return null;
  }
  if (prefix) {
    if (pathname === prefix) pathname = prefix + "/";
    if (!pathname.startsWith(prefix + "/")) return null;
    pathname = pathname.slice(prefix.length);
  }
  if (pathname.endsWith("/")) pathname += "index.html";
  const file2 = normalize(join(root, pathname));
  if (file2 !== root && !file2.startsWith(root.endsWith(sep) ? root : root + sep)) return null;
  return file2;
}
function startAdminServer(root, host, port, prefix = "") {
  const server = createServer((req, res) => {
    if (req.method !== "GET" && req.method !== "HEAD") {
      res.writeHead(405).end();
      return;
    }
    const file2 = resolveRequestPath(root, req.url ?? "/", prefix);
    if (!file2 || !existsSync(file2) || !statSync(file2).isFile()) {
      res.writeHead(404, { "content-type": "text/plain; charset=utf-8" }).end("Not found");
      return;
    }
    const rel = "/" + file2.slice(root.length).split(sep).filter(Boolean).join("/");
    res.writeHead(200, {
      "content-type": MIME[extname(file2).toLowerCase()] ?? "application/octet-stream",
      "cache-control": NO_CACHE.has(rel) ? "no-store" : "no-cache",
      "x-content-type-options": "nosniff"
    });
    if (req.method === "HEAD") res.end();
    else createReadStream(file2).pipe(res);
  });
  return new Promise((resolve2, reject) => {
    server.once("error", reject);
    server.listen(port, host, () => {
      server.off("error", reject);
      resolve2(server);
    });
  });
}
const MAX_PORT_TRIES = 20;
const serveCommand = {
  name: "serve",
  summary: "Serve the admin on this computer (127.0.0.1) to run the setup wizard or work locally. Runs until stopped.",
  usage: "serve [--port <n>]",
  options: [{ name: "port", type: "string", description: "First port to try (the next free one is used).", default: "4173" }],
  async run({ io, options }) {
    const root = join(distRoot(), "admin");
    if (!existsSync(join(root, "index.html"))) {
      throw new CliError("admin-missing", `No built admin in ${root}.`, "Run `npm run build` (from a clone) or use the npm package.");
    }
    const first = Number(options.port ?? 4173);
    if (!Number.isInteger(first) || first < 1 || first > 65535) {
      throw new CliError("usage", `Invalid port: ${options.port}`, void 0, 2);
    }
    const host = "127.0.0.1";
    let server = null;
    let port = first;
    for (; port < first + MAX_PORT_TRIES && port <= 65535; port++) {
      try {
        server = await startAdminServer(root, host, port);
        break;
      } catch (e) {
        if (e.code !== "EADDRINUSE") throw e;
      }
    }
    if (!server) throw new CliError("port-busy", `Ports ${first}-${port - 1} are all in use.`, "Pass --port <n>.");
    const url = `http://localhost:${port}/`;
    printResult(io, { url, root }, () => `Admin running at ${url}
Press Ctrl+C to stop.`);
    await new Promise((resolve2) => {
      const stop = () => server.close(() => resolve2());
      process.once("SIGINT", stop);
      process.once("SIGTERM", stop);
    });
  }
};
const serve = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  resolveRequestPath,
  serveCommand,
  startAdminServer
}, Symbol.toStringTag, { value: "Module" }));
function missingCredentials(site) {
  const out = [];
  const c = site.credentials;
  const set = `\`agentcms site credentials ${site.alias} --<role>-credential <account>\``;
  if (site.runtime.backend === "sqlite-file") {
    if (!c.data && !c.hosting) out.push(`No credential can open the database: add a hosting (or data location) credential with ${set}.`);
    if (site.runtime.sqlite.encrypted && !c.passphrase) out.push(`The database is encrypted and no passphrase credential is recorded: store it (\`! agentcms credentials set passphrase:${site.alias}\`) then ${set}.`);
  }
  if (site.runtime.backend === "firebase" && !c.data) out.push(`Firebase sites need the admin login: \`! agentcms credentials set firebase:<name>\` then ${set}.`);
  if (!c.hosting && site.runtime.backend !== "local") out.push(`No hosting credential: publishing commands will fail until one is added with ${set}.`);
  return out;
}
const siteCommand = {
  name: "site",
  summary: "Manage the registry of sites this computer drives: list, show, use <alias> (default), rename <from> <to>, forget <alias> (local only — nothing is deleted online), add <alias> --admin-url <url> (register an existing site; warns about missing credentials), credentials <alias> --data-credential|--hosting-credential|--passphrase-credential <account> (attach accounts to a registered site), screenshot [path…] (PNG captures of the live public site, desktop + mobile; default: the home page).",
  usage: "site <list|show|use|rename|forget|add|credentials|screenshot> [args] [--site <alias>] [--admin-url <url>] [--site-url <url>] [--data-credential <account>] [--hosting-credential <account>] [--passphrase-credential <account>] [--out <dir>] [--max-height <px>] [--color-scheme light|dark] [--screenshot-js <code>]",
  options: [
    { name: "site", type: "string", description: "Site alias (show, screenshot)." },
    { name: "out", type: "string", description: "screenshot: folder for the PNGs (default: <system temp>/agentcms-screenshots/<alias>; absolute paths in the result)." },
    { name: "screenshot-js", type: "string", description: `screenshot: JavaScript run in each page before the capture (await allowed), e.g. 'document.querySelector("[data-cms-search]")?.click()'.` },
    { name: "color-scheme", type: "string", description: "screenshots: prefers-color-scheme of the captures, light (default) or dark." },
    { name: "max-height", type: "string", description: "screenshot: cap each capture's height in CSS px (default: the whole page, up to 6000). Use the viewport height (800 desktop / 844 mobile) for above-the-fold only." },
    { name: "admin-url", type: "string", description: "add: URL of the hosted admin, e.g. https://example.com/admin/." },
    { name: "site-url", type: "string", description: "add: public site URL when it isn't the admin's parent folder." },
    { name: "data-credential", type: "string", description: "add / credentials: account of the content repo token (Markdown in git) or of the SQLite data location." },
    { name: "hosting-credential", type: "string", description: "add / credentials: account used to write to the hosting." },
    { name: "passphrase-credential", type: "string", description: "add / credentials: passphrase account of an encrypted SQLite database." }
  ],
  async run({ io, options, positionals }) {
    const [action = "list", a, b] = positionals;
    switch (action) {
      case "list": {
        const { default: def, sites } = listSites();
        const rows = sites.map((s) => ({
          alias: s.alias,
          default: s.alias === def,
          siteUrl: s.siteUrl,
          publicUrl: publicUrlOf(s),
          adminUrl: secureAdminUrlOf(s) ?? adminUrlOf(s),
          backend: s.runtime.backend,
          hosting: s.hosting.connectorId || null,
          adminVersion: s.adminVersion ?? null
        }));
        printResult(
          io,
          { default: def, sites: rows },
          () => rows.length ? rows.map((r) => `${r.default ? "*" : " "} ${r.alias.padEnd(20)} ${r.publicUrl}  [${r.backend} → ${r.hosting ?? "?"}]`).join("\n") : "No site registered. Install one with `agentcms install` or register one with `agentcms site add`."
        );
        return;
      }
      case "show": {
        const site = resolveSite(a ?? options.site);
        printResult(io, { ...site, publicUrl: publicUrlOf(site), adminUrl: secureAdminUrlOf(site) ?? adminUrlOf(site) }, () => JSON.stringify(site, null, 2));
        return;
      }
      case "use": {
        if (!a) throw new CliError("usage", "site use needs an alias.", void 0, 2);
        setDefaultSite(a);
        printResult(io, { default: a }, () => `Default site: ${a}`);
        return;
      }
      case "rename": {
        if (!a || !b) throw new CliError("usage", "site rename needs <from> <to>.", void 0, 2);
        renameSite(a, b);
        printResult(io, { from: a, to: b }, () => `Renamed ${a} → ${b}`);
        return;
      }
      case "forget": {
        if (!a) throw new CliError("usage", "site forget needs an alias.", void 0, 2);
        const removed = removeSite(a);
        printResult(io, { alias: a, removed }, () => removed ? `Forgot ${a} (nothing was deleted online).` : `${a} was not registered.`);
        return;
      }
      case "add": {
        if (!a) throw new CliError("usage", "site add needs an alias.", void 0, 2);
        validateAlias(a);
        if (getSite(a)) throw new CliError("site-exists", `A site named "${a}" already exists.`, "Pick another alias or `site forget` it first.");
        if (typeof options["admin-url"] !== "string") throw new CliError("usage", "site add needs --admin-url.", void 0, 2);
        installBrowserEnv();
        const { siteFromAdminUrl } = await import("./chunks/siteAdd-xd_Ns6hQ.mjs");
        const site = await siteFromAdminUrl({
          alias: a,
          adminUrl: options["admin-url"],
          siteUrl: options["site-url"],
          dataCredential: options["data-credential"],
          hostingCredential: options["hosting-credential"],
          passphraseCredential: options["passphrase-credential"]
        });
        putSite(site);
        const warnings = missingCredentials(site);
        printResult(io, { ...site, warnings }, () => [`Registered ${a}: ${site.siteUrl} [${site.runtime.backend} → ${site.hosting.connectorId || "unknown hosting"}]`, ...warnings.map((w) => `  warning: ${w}`)].join("\n"));
        return;
      }
      case "credentials": {
        const site = resolveSite(a ?? options.site);
        const { parseAccount: parseAccount2, getCredential: getCredential2 } = await Promise.resolve().then(() => credentials);
        const roles = { data: "data-credential", hosting: "hosting-credential", passphrase: "passphrase-credential" };
        const next = { ...site.credentials };
        let changed = false;
        for (const [role, flag] of Object.entries(roles)) {
          const v = options[flag];
          if (typeof v !== "string") continue;
          if (v === "") delete next[role];
          else {
            parseAccount2(v);
            if (!getCredential2(v)) throw new CliError("credential-missing", `${v} is not stored on this computer.`, `Store it first: \`! agentcms credentials set ${v}\`.`, 2);
            next[role] = v;
          }
          changed = true;
        }
        if (!changed) throw new CliError("usage", 'site credentials needs --data-credential, --hosting-credential and/or --passphrase-credential ("" removes one).', void 0, 2);
        const updated = { ...site, credentials: next, updatedAt: (/* @__PURE__ */ new Date()).toISOString() };
        putSite(updated);
        const warnings = missingCredentials(updated);
        printResult(io, { alias: site.alias, credentials: next, warnings }, () => [`${site.alias}: ${JSON.stringify(next)}`, ...warnings.map((w) => `  warning: ${w}`)].join("\n"));
        return;
      }
      case "screenshot": {
        const site = resolveSite(options.site);
        const paths2 = positionals.slice(1);
        const pages2 = {};
        for (const raw of paths2.length ? paths2 : [""]) {
          const path = raw.replace(/^https?:\/\/[^/]+\/?/, "").replace(/^\/+/, "");
          const label = path.replace(/\.html?$/, "").replace(/[^a-z0-9-]+/gi, "_").replace(/^_+|_+$/g, "") || "home";
          pages2[label] = path;
        }
        const { resolve: resolve2 } = await import("node:path");
        const { screenshotPages, setScreenshotColorScheme } = await import("./chunks/extScreenshot-X5xiH1-8.mjs");
        setScreenshotColorScheme(options["color-scheme"]);
        const outDir = resolve2(String(options.out ?? join(tmpdir(), "agentcms-screenshots", site.alias)));
        const base = publicUrlOf(site);
        const r = await screenshotPages(base, Object.fromEntries(Object.entries(pages2).map(([k, v]) => [k, v || "./"])), outDir, options["screenshot-js"], options["max-height"] ? Number(options["max-height"]) : void 0);
        if (!r.browser) throw new CliError("no-browser", "No Chrome / Chromium / Edge found for screenshots.", "Install Google Chrome, or set CHROME_PATH.");
        printResult(
          io,
          { site: site.alias, publicUrl: base, ...r },
          () => [...r.shots.map((s) => `${s.page} (${s.viewport}): ${s.file}`), ...r.errors.map((e) => `  error: ${e}`)].join("\n")
        );
        return r.errors.length ? 1 : 0;
      }
      default:
        throw new CliError("usage", `Unknown action "${action}".`, "Use list, show, use, rename, forget, add, credentials or screenshot.", 2);
    }
  }
};
function registryLatestUrl(name) {
  return `https://registry.npmjs.org/${name.replace("/", "%2f")}/latest`;
}
async function fetchLatestVersion(fetchImpl = fetch, name = readVersionInfo().name) {
  try {
    const res = await fetchImpl(registryLatestUrl(name), { signal: AbortSignal.timeout(5e3) });
    if (!res.ok) return null;
    const body = await res.json();
    return typeof body.version === "string" ? body.version : null;
  } catch {
    return null;
  }
}
const versionCommand = {
  name: "version",
  summary: "Show this tool's version, the admin API version and (with --check) whether a newer release exists.",
  usage: "version [--check]",
  options: [{ name: "check", type: "boolean", description: "Ask the npm registry for the latest release." }],
  async run({ io, options }) {
    const info = readVersionInfo();
    const data = { ...info };
    if (options.check) {
      const latest = await fetchLatestVersion();
      data.latest = latest;
      data.updateAvailable = latest ? compareVersions(latest, info.version) > 0 : null;
    }
    printResult(io, data, () => {
      const lines = [`agentcms ${info.version} (admin API ${info.apiVersion}, data schema ${info.dataSchema})`];
      if (options.check) {
        if (!data.latest) lines.push("Could not reach the npm registry to check for updates.");
        else if (data.updateAvailable) lines.push(`Update available: ${data.latest}`);
        else lines.push("This is the latest release.");
      }
      return lines.join("\n");
    });
  }
};
async function siteStatus(site, version, dataSchema) {
  const adminUrl = adminUrlOf(site);
  const base = { alias: site.alias, siteUrl: site.siteUrl, adminUrl };
  if (!adminUrl) return { ...base, adminVersion: null, state: "not-hosted" };
  const hosted = await fetchHostedAdmin(adminUrl);
  if (!hosted.version) return { ...base, adminVersion: null, state: "unreachable", error: hosted.error };
  if (hosted.version !== site.adminVersion) putSite({ ...site, adminVersion: hosted.version });
  const cmp = compareVersions(hosted.version, version);
  if (cmp === 0) return { ...base, adminVersion: hosted.version, state: "current" };
  if (cmp > 0) return { ...base, adminVersion: hosted.version, state: "newer" };
  return {
    ...base,
    adminVersion: hosted.version,
    state: "update",
    update: changesBetween(readChangelog(), hosted.version, version),
    blockedByDataSchema: hosted.dataSchema !== null && hosted.dataSchema > dataSchema
  };
}
const statusCommand = {
  name: "status",
  summary: "Versions overview — run it first. Compares this tool and its skills with the latest release, and every registered site's hosted admin with this release (what changed, what to run).",
  usage: "status [--site <alias>]",
  options: [{ name: "site", type: "string", description: "Only this site (default: every registered site)." }],
  async run({ io, options }) {
    const info = readVersionInfo();
    const sites = typeof options.site === "string" ? [resolveSite(options.site)] : listSites().sites;
    const [latest, statuses] = await Promise.all([
      fetchLatestVersion(),
      Promise.all(sites.map((s) => siteStatus(s, info.version, info.dataSchema)))
    ]);
    const toolUpdate = latest && compareVersions(latest, info.version) > 0 ? changesBetween(readChangelog(), info.version, latest) : null;
    const releaseNotes = {};
    for (const s of statuses) {
      if (!s.update) continue;
      for (const line of s.update.changes) {
        const [v, ...rest] = line.split(": ");
        (releaseNotes[v] ??= []).includes(rest.join(": ")) || releaseNotes[v].push(rest.join(": "));
      }
    }
    const sitesOut = statuses.map((s) => s.update ? { ...s, update: { versions: s.update.versions, breaking: s.update.breaking, actions: s.update.actions } } : s);
    const data = {
      tool: { version: info.version, latest, updateAvailable: latest ? compareVersions(latest, info.version) > 0 : null },
      // Release notes of the newer tool are only known once it's installed;
      // `changes` is filled when this package already ships them.
      toolUpdate,
      sites: sitesOut,
      releaseNotes,
      advice: [
        ...latest && compareVersions(latest, info.version) > 0 ? [`agentcms ${latest} is available (this is ${info.version}): offer to update the skills first (Claude Code: /plugin marketplace update agentcms, then /reload-plugins).`] : [],
        ...statuses.filter((s) => s.state === "update").map(
          (s) => s.blockedByDataSchema ? `${s.alias}: hosted admin ${s.adminVersion} stores data in a newer format than this tool — update the tool, never downgrade.` : `${s.alias}: admin ${s.adminVersion} → ${info.version} available${s.update?.breaking ? " (BREAKING — read the changes)" : ""}: offer \`agentcms deploy-admin --site ${s.alias}\`.`
        ),
        ...statuses.filter((s) => s.state === "newer").map((s) => `${s.alias}: hosted admin ${s.adminVersion} is newer than this tool — update the tool before deploying.`),
        ...statuses.filter((s) => s.state === "unreachable").map((s) => `${s.alias}: admin not reachable (${s.error}) — run \`agentcms doctor --site ${s.alias}\`.`)
      ]
    };
    printResult(
      io,
      data,
      () => [
        `agentcms ${info.version}${data.tool.updateAvailable ? ` — ${latest} available` : latest ? " (latest)" : ""}`,
        ...statuses.map((s) => `  ${s.alias.padEnd(20)} admin ${s.adminVersion ?? "-"}  ${s.state}${s.error ? ` (${s.error})` : ""}`),
        ...data.advice.length ? ["", ...data.advice.map((a) => `- ${a}`)] : []
      ].join("\n")
    );
  }
};
const helpCommand = {
  name: "help",
  summary: "List commands and their options (--json gives a machine-readable list).",
  usage: "help [<command>]",
  options: [],
  async run({ io, positionals }) {
    const wanted = positionals[0];
    const list2 = wanted ? COMMANDS.filter((c) => c.name === wanted) : COMMANDS;
    const { version } = readVersionInfo();
    const data = {
      name: "agentcms",
      version,
      globalOptions: GLOBAL_OPTIONS,
      commands: list2.map(({ name, summary, usage: usage2, options }) => ({ name, summary, usage: usage2, options }))
    };
    printResult(
      io,
      data,
      () => [
        `agentcms ${version} — install and manage AgentCMS sites from a terminal or an AI agent.`,
        "",
        "Usage: agentcms <command> [options] [--json]",
        "",
        ...list2.flatMap((c) => [
          `  ${c.usage}`,
          `      ${c.summary}`,
          ...c.options.map((o) => `      --${o.name}${o.type === "string" ? " <value>" : ""}  ${o.description}`)
        ]),
        "",
        "Global options:",
        ...GLOBAL_OPTIONS.map((o) => `  --${o.name}  ${o.description}`)
      ].join("\n")
    );
  }
};
const GLOBAL_OPTIONS = [
  { name: "json", type: "boolean", description: "Print one JSON object on stdout: { ok, data } or { ok: false, error }." },
  { name: "help", type: "boolean", description: "Show the command's usage and options instead of running it." }
];
const COMMANDS = [
  helpCommand,
  versionCommand,
  statusCommand,
  optionsCommand,
  credentialsCommand,
  siteCommand,
  installCommand,
  deployAdminCommand,
  doctorCommand,
  compactDataCommand,
  extCommand,
  contentCommand,
  regenerateCommand,
  termsCommand,
  menusCommand,
  settingsCommand,
  pluginsCommand,
  themesCommand,
  mediaCommand,
  usersCommand,
  transferCommand,
  statsCommand,
  filesCommand,
  serveCommand
];
function findCommand(name) {
  return COMMANDS.find((c) => c.name === name);
}
async function main(argv, io) {
  const json = argv.includes("--json");
  const out = createIo(json);
  try {
    const [name = "help", ...rest] = argv.filter((a) => a !== "--json");
    if (name === "--help" || name === "-h") return await run("help", rest, out) ?? 0;
    if (name === "--version" || name === "-v") return await run("version", rest, out) ?? 0;
    return await run(name, rest, out) ?? 0;
  } catch (error) {
    return printError(out, error);
  }
}
async function run(name, args, io) {
  const command = findCommand(name);
  if (!command) {
    throw new CliError(
      "unknown-command",
      `Unknown command "${name}".`,
      `Available: ${COMMANDS.map((c) => c.name).join(", ")}. Run \`agentcms help\`.`,
      2
    );
  }
  let parsed;
  try {
    parsed = parseArgs({
      args,
      allowPositionals: true,
      strict: true,
      options: Object.fromEntries(
        [...command.options, ...GLOBAL_OPTIONS].map((o) => [o.name, { type: o.type, ..."multiple" in o && o.multiple ? { multiple: true } : {} }])
      )
    });
  } catch (e) {
    throw new CliError("usage", e.message, `Usage: agentcms ${command.usage}`, 2);
  }
  if (parsed.values.help && command.name !== "help") return run("help", [command.name], io);
  return command.run({
    io,
    // Repeated options arrive joined with a space.
    options: Object.fromEntries(
      Object.entries(parsed.values).map(([k, v]) => [k, Array.isArray(v) ? v.join(" ") : v])
    ),
    positionals: parsed.positionals
  });
}
const [major] = process.versions.node.split(".").map(Number);
if (major < 20) {
  process.stderr.write(`agentcms needs Node.js 20 or newer (found ${process.versions.node}).
`);
  process.exit(1);
}
main(process.argv.slice(2)).then((code) => {
  process.stdout.write("", () => process.exit(code));
});
export {
  CliError as C,
  SqlitePassphraseError as S,
  installBrowserEnv as a,
  requireCredential as b,
  readVersionInfo as c,
  compareVersions as d,
  adminUrlOf as e,
  fetchHostedAdmin as f,
  generatePassphrase as g,
  secureAdminUrlOf as h,
  isEncryptedDatabase as i,
  distRoot as j,
  fetchText as k,
  lockSite as l,
  parseConfigJs as m,
  parseAccount as n,
  findDataBackend as o,
  printResult as p,
  getCredential as q,
  resolveSite as r,
  setCredential as s,
  findHosting as t,
  encryptionParams as u,
  validateAlias as v,
  decryptDatabase as w,
  encryptDatabase as x,
  paths as y,
  firebaseSession as z
};
