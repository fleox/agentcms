#!/usr/bin/env node
import { createRequire as __acmsRequire } from "node:module";
import { fileURLToPath as __acmsPath } from "node:url";
import { dirname as __acmsDirname } from "node:path";
const require2 = __acmsRequire(import.meta.url);
const __filename = __acmsPath(import.meta.url);
const __dirname = __acmsDirname(__filename);
import { parseArgs } from "node:util";
import { existsSync, readFileSync, mkdirSync, writeFileSync, chmodSync, renameSync, statSync, openSync, writeSync, closeSync, unlinkSync, createReadStream } from "node:fs";
import { join, resolve, dirname, basename, sep, extname, normalize } from "node:path";
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
function printError(io, error) {
  const e = error instanceof CliError ? error : new CliError(
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
  const chosen = explicit || findProjectSite()?.alias;
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
    const { createRemoteGitTransport, joinRepoPath } = await import("./chunks/index-BVQJP7xk.mjs").then((n) => n.r);
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
        usedBy: sites.filter((s) => s.credentials.data === c.account || s.credentials.hosting === c.account).map((s) => s.alias)
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
function adminUrlOf(site) {
  return site.adminFolder ? `${site.siteUrl.replace(/\/+$/, "")}/${site.adminFolder}/` : null;
}
function parseConfigJs(source) {
  const m = /window\.__AGENTCMS_CONFIG__\s*=\s*([\s\S]*?);?\s*$/.exec(source.trim());
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
    const { adminOps, applyOps, hostingConnector, themeAssetOps } = await import("./chunks/hosting-DLKOgr4B.mjs");
    const { collectToasts, settleHosting } = await import("./chunks/install-TJYbfY0q.mjs");
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
  add(
    siteUrl.startsWith("https://") || /^http:\/\/(localhost|127\.0\.0\.1|\[::1\])(:\d+)?(\/|$)/.test(siteUrl) ? { id: "https", status: "ok", message: siteUrl.startsWith("https://") ? "Site served over HTTPS." : "Local site (a secure context for browsers)." } : {
      id: "https",
      status: "warn",
      message: `${siteUrl} is plain HTTP.`,
      fix: "Use the host's HTTPS URL (S3: the bucket's https endpoint) — the admin can't sign requests on http pages."
    }
  );
  const home = await fetchText(`${siteUrl}/`, f);
  add(
    home.ok ? { id: "site", status: "ok", message: `Home page reachable (${home.status}).` } : home.status === 404 ? { id: "site", status: "warn", message: "No home page yet (404).", fix: "Publish a post or run Regenerate → Everything in the admin." } : { id: "site", status: "fail", message: `Site not reachable: ${home.error ?? `HTTP ${home.status}`}.`, fix: "Check siteUrl, DNS, and that the host serves the bucket / repo (GitHub Pages enabled, S3 website hosting on)." }
  );
  const css = await fetchText(`${siteUrl}/theme-assets/default.css`, f);
  add(
    css.ok && css.contentType.includes("text/css") ? { id: "theme-assets", status: "ok", message: "Theme stylesheet served as text/css." } : {
      id: "theme-assets",
      status: "fail",
      message: css.ok ? `theme-assets/default.css has type "${css.contentType}".` : `theme-assets/default.css missing (${css.error ?? css.status}).`,
      fix: `\`agentcms deploy-admin --site ${site.alias} --theme-assets --yes\` (after confirming with the user), or Themes → Sync theme assets in the admin.`
    }
  );
  const adminUrl = adminUrlOf(site);
  if (!adminUrl) {
    add({ id: "admin", status: "skip", message: "Admin not hosted on this site." });
  } else {
    const index = await fetchText(adminUrl, f);
    if (!index.ok || !index.contentType.includes("text/html")) {
      add({
        id: "admin",
        status: "fail",
        message: `Admin page ${adminUrl} not served (${index.error ?? `HTTP ${index.status}`}${index.ok ? `, type ${index.contentType}` : ""}).`,
        fix: `\`agentcms deploy-admin --site ${site.alias}\`; on GitHub Pages wait a minute after a commit.`
      });
    } else {
      add({ id: "admin", status: "ok", message: `Admin page served at ${adminUrl}.` });
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
  if (opts.deep) {
    if (!hostingCred) {
      add({ id: "hosting-access", status: "skip", message: "No hosting credential to test." });
    } else {
      installBrowserEnv();
      const { testStorageConnection } = await import("./chunks/registry-DClFwwHa.mjs").then((n) => n.q);
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
  summary: "Health check of a site: HTTPS, home page, theme assets, hosted admin (consistent build, JavaScript content type, version), config.js without secrets, stored credentials, GitHub Pages. --deep also tests write access.",
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
    import("./chunks/extHost-C1s5fNiy.mjs")
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
  const { checkExtension } = await import("./chunks/extCheck-DU12uj8R.mjs");
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
async function preview({ io, options, positionals }) {
  const paths2 = positionals.slice(1);
  const exts = await loadAll(paths2);
  const { renderPreview } = await import("./chunks/extPreview-Dkzz4WZ0.mjs");
  const port = Number(options.port ?? 4321);
  if (!Number.isInteger(port) || port < 1 || port > 65535) throw new CliError("usage", `Invalid port: ${options.port}`, void 0, 2);
  const outDir = resolve(String(options.out ?? join(tmpdir(), `agentcms-preview-${exts.map((e) => e.id).join("+") || "default"}`)));
  let content;
  let siteAlias;
  if (options.site) {
    const { snapshotSiteContent } = await import("./chunks/extSiteContent-DP5gC6c4.mjs");
    const snap = await snapshotSiteContent(String(options.site));
    content = snap.content;
    siteAlias = snap.alias;
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
    extensions: exts.map(({ kind, id, manifest }) => ({ kind, id, manifest })),
    themeId: options.theme,
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
    const { screenshotPages } = await import("./chunks/extScreenshot-D5CCgm5-.mjs");
    screenshots = await screenshotPages(baseUrl, res.pages, join(res.outDir, ".screenshots"), options["screenshot-js"] ? String(options["screenshot-js"]) : void 0);
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
  const { scaffoldExtension } = await import("./chunks/extScaffold-CWU1HCsR.mjs");
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
  const { installExtensionCommand } = await import("./chunks/extInstall-BiYwdEsp.mjs");
  return installExtensionCommand(ctx);
}
const extCommand = {
  name: "ext",
  summary: "Build, test and ship plugins and themes: new <plugin|theme> <id> (scaffold a project), check <path> (validate + render a demo site, exit 1 on errors), preview <path…> (render a full demo site locally; --serve, --screenshots, --site <alias> for a site's real content), pack <project> (ZIP for the admin's Install button), install <zip> --site <alias> (upload to a site; plan first, --yes to apply), list --site <alias>, uninstall <id> --site <alias>.",
  usage: "ext new <plugin|theme> <id> [--with <features>] [--dir <path>] [--name <name>] [--description <text>] [--author <name>] [--force] | ext check <path> [--kind <plugin|theme>] [--out <dir>] | ext preview <path…> [--theme <id>] [--enable <ids>] [--settings <json>] [--theme-config <json>] [--plugin-configs <json>] [--site <alias>] [--out <dir>] [--port <n>] [--base-path </dir>] [--home blocks] [--demo empty] [--screenshots] [--screenshot-js <code>] [--serve] | ext pack <project> [--out <zip>] | ext install <zip|folder> --site <alias> [--activate] [--yes] | ext list --site <alias> | ext uninstall <id> --site <alias> [--yes]",
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
    { name: "activate", type: "boolean", description: "install: also activate it (theme: make it the active theme; plugin: enable it)." },
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
    const { resolvePlan } = await import("./chunks/plan-v_cPgEaJ.mjs").then((n) => n.p);
    const plan = resolvePlan(readPlan(options.plan));
    if (getSite(plan.alias)) {
      throw new CliError("site-exists", `A site named "${plan.alias}" is already registered.`, "Use another alias, or `agentcms site forget` it first.");
    }
    const { checkPlan, runInstall } = await import("./chunks/install-TJYbfY0q.mjs");
    io.err("Checking access…");
    const checks = await checkPlan(plan);
    const stored = checks.data.storedTarget;
    const conflict = !!stored && (stored.connectorId !== plan.target.connectorId || String(stored.settings.siteUrl ?? "").replace(/\/+$/, "") !== plan.siteUrl);
    const summary = {
      alias: plan.alias,
      data: plan.backend,
      hosting: plan.hostingType,
      siteUrl: plan.siteUrl,
      adminUrl: adminUrlOf({ siteUrl: plan.siteUrl, adminFolder: plan.adminFolder }),
      credentials: plan.credentials,
      checks
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
      const nextSteps = [];
      if (summary.adminUrl) nextSteps.push(`Open the admin: ${summary.adminUrl}`);
      else nextSteps.push("The admin was not copied to the hosting: run `agentcms serve` to use it locally.");
      if (plan.backend === "markdown-git") {
        nextSteps.push("Each browser asks once for the editor's own git token (Contents read/write on the content repository).");
      } else {
        nextSteps.push(
          `Each new browser asks once for the ${plan.dataLocation && plan.dataLocation !== plan.target ? "data location" : "hosting"} keys${plan.passphraseAccount ? " and the database passphrase" : ""} (they stay in that browser). No login: protect the admin folder at the hosting level.`
        );
        if (plan.passphraseAccount) {
          nextSteps.push(
            `The database is encrypted. Have the user save its passphrase in a password manager now: \`agentcms credentials copy ${plan.passphraseAccount}\` puts it on the clipboard. Without it the content can't be opened.`
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
      nextSteps.push(`Check everything with \`agentcms doctor --site ${plan.alias}\`.`);
      printResult(
        io,
        { ...summary, installed: true, files: outcome.files, adminVersion: outcome.adminVersion, notices: outcome.notices, nextSteps },
        () => [`Installed ${plan.alias}.`, ...outcome.notices.map((n) => `${n.level}: ${n.message}`), ...nextSteps.map((s) => `- ${s}`)].join("\n")
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
    cli: false,
    fields: [],
    credentialTypes: [],
    notes: ["Not scriptable yet: run `agentcms serve` and use the setup wizard."]
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
  options: [],
  async run({ io }) {
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
const siteCommand = {
  name: "site",
  summary: "Manage the registry of sites this computer drives: list, show, use <alias> (default), rename <from> <to>, forget <alias> (local only — nothing is deleted online), add <alias> --admin-url <url> (register an existing site).",
  usage: "site <list|show|use|rename|forget|add> [args] [--site <alias>] [--admin-url <url>] [--site-url <url>] [--data-credential <account>] [--hosting-credential <account>] [--passphrase-credential <account>]",
  options: [
    { name: "site", type: "string", description: "Site alias (show)." },
    { name: "admin-url", type: "string", description: "add: URL of the hosted admin, e.g. https://example.com/admin/." },
    { name: "site-url", type: "string", description: "add: public site URL when it isn't the admin's parent folder." },
    { name: "data-credential", type: "string", description: "add: account of the content repo token (Markdown in git) or of the SQLite data location." },
    { name: "hosting-credential", type: "string", description: "add: account used to write to the hosting." },
    { name: "passphrase-credential", type: "string", description: "add: passphrase account of an encrypted SQLite database." }
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
          adminUrl: adminUrlOf(s),
          backend: s.runtime.backend,
          hosting: s.hosting.connectorId || null,
          adminVersion: s.adminVersion ?? null
        }));
        printResult(
          io,
          { default: def, sites: rows },
          () => rows.length ? rows.map((r) => `${r.default ? "*" : " "} ${r.alias.padEnd(20)} ${r.siteUrl}  [${r.backend} → ${r.hosting ?? "?"}]`).join("\n") : "No site registered. Install one with `agentcms install` or register one with `agentcms site add`."
        );
        return;
      }
      case "show": {
        const site = resolveSite(a ?? options.site);
        printResult(io, { ...site, adminUrl: adminUrlOf(site) }, () => JSON.stringify(site, null, 2));
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
        const { siteFromAdminUrl } = await import("./chunks/siteAdd-I271jDRJ.mjs");
        const site = await siteFromAdminUrl({
          alias: a,
          adminUrl: options["admin-url"],
          siteUrl: options["site-url"],
          dataCredential: options["data-credential"],
          hostingCredential: options["hosting-credential"],
          passphraseCredential: options["passphrase-credential"]
        });
        putSite(site);
        printResult(io, site, () => `Registered ${a}: ${site.siteUrl} [${site.runtime.backend} → ${site.hosting.connectorId || "unknown hosting"}]`);
        return;
      }
      default:
        throw new CliError("usage", `Unknown action "${action}".`, "Use list, show, use, rename, forget or add.", 2);
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
    const data = {
      tool: { version: info.version, latest, updateAvailable: latest ? compareVersions(latest, info.version) > 0 : null },
      // Release notes of the newer tool are only known once it's installed;
      // `changes` is filled when this package already ships them.
      toolUpdate,
      sites: statuses,
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
      commands: list2.map(({ name, summary, usage, options }) => ({ name, summary, usage, options }))
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
        [...command.options, ...GLOBAL_OPTIONS].map((o) => [o.name, { type: o.type }])
      )
    });
  } catch (e) {
    throw new CliError("usage", e.message, `Usage: agentcms ${command.usage}`, 2);
  }
  if (parsed.values.help && command.name !== "help") return run("help", [command.name], io);
  return command.run({
    io,
    options: parsed.values,
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
  process.exitCode = code;
});
export {
  CliError as C,
  SqlitePassphraseError as S,
  installBrowserEnv as a,
  readVersionInfo as b,
  compareVersions as c,
  distRoot as d,
  adminUrlOf as e,
  fetchHostedAdmin as f,
  generatePassphrase as g,
  fetchText as h,
  isEncryptedDatabase as i,
  parseConfigJs as j,
  parseAccount as k,
  lockSite as l,
  requireCredential as m,
  findDataBackend as n,
  getCredential as o,
  printResult as p,
  findHosting as q,
  resolveSite as r,
  setCredential as s,
  encryptionParams as t,
  decryptDatabase as u,
  validateAlias as v,
  encryptDatabase as w,
  paths as x
};
