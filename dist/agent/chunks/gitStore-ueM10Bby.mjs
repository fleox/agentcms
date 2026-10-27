import { createRequire as __acmsRequire } from "node:module";
import { fileURLToPath as __acmsPath } from "node:url";
import { dirname as __acmsDirname } from "node:path";
const require2 = __acmsRequire(import.meta.url);
const __filename = __acmsPath(import.meta.url);
const __dirname = __acmsDirname(__filename);
import { i as instance } from "./index-DCzLoAau.mjs";
import { j as joinRepoPath, G as GitConflictError, l as loadFolderHandle, e as ensureFolderPermission, a as createLocalFsTransport, c as createRemoteGitTransport } from "./index-BA9sR5p-.mjs";
const COLLECTIONS = ["posts", "terms", "media", "users", "settings", "config"];
class DocConflictError extends Error {
  constructor(message, collection, id) {
    super(message);
    this.collection = collection;
    this.id = id;
    this.name = "DocConflictError";
  }
}
function emptySnapshot() {
  return Object.fromEntries(COLLECTIONS.map((c) => [c, /* @__PURE__ */ new Map()]));
}
function cloneSnapshot(s) {
  return Object.fromEntries(COLLECTIONS.map((c) => [c, new Map(s[c])]));
}
function normalizeDoc(value) {
  if (Array.isArray(value)) return Object.freeze(value.map(normalizeDoc));
  if (value && typeof value === "object" && Object.getPrototypeOf(value) === Object.prototype) {
    const out = {};
    for (const [k, v] of Object.entries(value)) if (v !== void 0) out[k] = normalizeDoc(v);
    return Object.freeze(out);
  }
  return value;
}
function applyMutations(base, mutations) {
  const next = cloneSnapshot(base);
  const changed = /* @__PURE__ */ new Set();
  for (const m of mutations) {
    if (m.op === "set") next[m.collection].set(m.doc.id, normalizeDoc(m.doc));
    else next[m.collection].delete(m.id);
    changed.add(m.collection);
  }
  return { next, changed };
}
function diffCollections(a, b) {
  const changed = /* @__PURE__ */ new Set();
  for (const c of COLLECTIONS) {
    if (a[c].size !== b[c].size) {
      changed.add(c);
      continue;
    }
    for (const [id, doc] of a[c]) {
      const other = b[c].get(id);
      if (!other || JSON.stringify(other) !== JSON.stringify(doc)) {
        changed.add(c);
        break;
      }
    }
  }
  return changed;
}
function createDocStore(backend) {
  let snapshot = emptySnapshot();
  let loading = null;
  let queue = Promise.resolve();
  let pending = 0;
  const listeners = /* @__PURE__ */ new Set();
  let timer = null;
  function notify(changed) {
    if (changed.size === 0) return;
    for (const l of [...listeners]) {
      try {
        l(changed);
      } catch (err) {
        console.error("[docstore] listener failed:", err);
      }
    }
  }
  function ready() {
    if (!loading) {
      loading = backend.load().then(
        (s) => {
          snapshot = s;
          notify(new Set(COLLECTIONS));
        },
        (err) => {
          loading = null;
          throw err;
        }
      );
    }
    return loading;
  }
  async function refresh() {
    await ready();
    if (!backend.poll || pending > 0) return;
    const fresh = await backend.poll();
    if (!fresh || pending > 0) return;
    const changed = diffCollections(snapshot, fresh);
    snapshot = fresh;
    notify(changed);
  }
  function startPolling() {
    if (timer || !backend.poll) return;
    timer = setInterval(() => {
      refresh().catch((err) => console.warn("[docstore] poll failed:", err));
    }, backend.pollIntervalMs ?? 3e4);
  }
  function stopPolling() {
    if (timer) clearInterval(timer);
    timer = null;
  }
  return {
    kind: backend.kind,
    ready,
    refresh,
    identity: () => backend.identity(),
    list(collection) {
      return [...snapshot[collection].values()];
    },
    get(collection, id) {
      return snapshot[collection].get(id);
    },
    async write(mutations, opts) {
      await ready();
      if (mutations.length === 0) return;
      const before = snapshot;
      const { next, changed } = applyMutations(before, mutations);
      snapshot = next;
      notify(changed);
      pending++;
      const run = queue.then(() => backend.persist(mutations, before, next, opts?.message ?? "Update content"));
      queue = run.catch(() => void 0);
      try {
        await run;
      } catch (err) {
        const reverted = cloneSnapshot(snapshot);
        for (const m of mutations) {
          const id = m.op === "set" ? m.doc.id : m.id;
          const original = before[m.collection].get(id);
          if (original) reverted[m.collection].set(id, original);
          else reverted[m.collection].delete(id);
        }
        snapshot = reverted;
        notify(changed);
        throw err;
      } finally {
        pending--;
      }
    },
    subscribe(listener) {
      listeners.add(listener);
      startPolling();
      return () => {
        listeners.delete(listener);
        if (listeners.size === 0) stopPolling();
      };
    }
  };
}
const FENCE = "---";
const RESERVED = /^(?:true|false|null|yes|no|on|off|~|y|n)$/i;
const NUMERIC = /^[-+]?(?:\d[\d_]*)?(?:\.\d+)?(?:e[-+]?\d+)?$|^0x[0-9a-f]+$|^\.(?:inf|nan)$/i;
const PLAIN = /^[\p{L}\p{N}][\p{L}\p{N} _.,!?()&'/+-]*$/u;
function isPlainSafe(s) {
  return s.length > 0 && s.trim() === s && PLAIN.test(s) && !RESERVED.test(s) && !NUMERIC.test(s) && !s.includes(": ") && !s.includes(" #");
}
function stringifyValue(value) {
  if (typeof value === "string") return isPlainSafe(value) ? value : JSON.stringify(value);
  if (value === null) return "null";
  return JSON.stringify(value);
}
function stringifyFrontmatter(data, body) {
  const lines = [FENCE];
  for (const [key, value] of Object.entries(data)) {
    if (value === void 0) continue;
    lines.push(`${key}: ${stringifyValue(value)}`);
  }
  lines.push(FENCE, "");
  return lines.join("\n") + "\n" + body;
}
function parseScalar(raw) {
  const v = raw.trim();
  if (v === "") return "";
  if (v.startsWith('"')) {
    try {
      return JSON.parse(v);
    } catch {
      return v.replace(/^"|"$/g, "");
    }
  }
  if (v.startsWith("'") && v.endsWith("'") && v.length >= 2) return v.slice(1, -1).replace(/''/g, "'");
  if (v.startsWith("{") || v.startsWith("[")) {
    try {
      return JSON.parse(v);
    } catch {
      if (v.startsWith("[") && v.endsWith("]")) {
        const inner = v.slice(1, -1).trim();
        return inner ? inner.split(",").map((part) => parseScalar(part)) : [];
      }
      return v;
    }
  }
  if (/^(?:true|yes|on)$/i.test(v)) return true;
  if (/^(?:false|no|off)$/i.test(v)) return false;
  if (/^(?:null|~)$/i.test(v)) return null;
  if (/^-?(?:0|[1-9]\d*)(?:\.\d+)?$/.test(v)) return Number(v);
  return v;
}
function stripComment(line) {
  let single = false;
  let double = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === "\\" && double) {
      i++;
      continue;
    }
    if (ch === "'" && !double) single = !single;
    else if (ch === '"' && !single) double = !double;
    else if (ch === "#" && !single && !double && (i === 0 || /\s/.test(line[i - 1]))) return line.slice(0, i);
  }
  return line;
}
function parseYaml(text) {
  const out = {};
  const lines = text.split(/\r?\n/);
  for (let i = 0; i < lines.length; i++) {
    const line = stripComment(lines[i]).replace(/\s+$/, "");
    if (!line.trim() || /^\s/.test(line)) continue;
    const colon = line.indexOf(":");
    if (colon === -1) continue;
    const key = line.slice(0, colon).trim().replace(/^["']|["']$/g, "");
    const rest = line.slice(colon + 1).trim();
    if (rest !== "") {
      out[key] = parseScalar(rest);
      continue;
    }
    const items = [];
    const map = {};
    let kind = null;
    while (i + 1 < lines.length) {
      const next = stripComment(lines[i + 1]).replace(/\s+$/, "");
      if (!next.trim()) {
        i++;
        continue;
      }
      if (!/^\s/.test(next)) break;
      const trimmed = next.trim();
      if (trimmed.startsWith("- ") || trimmed === "-") {
        kind = kind ?? "list";
        items.push(parseScalar(trimmed.slice(1)));
      } else {
        const c = trimmed.indexOf(":");
        if (c > 0) {
          kind = kind ?? "map";
          map[trimmed.slice(0, c).trim()] = parseScalar(trimmed.slice(c + 1));
        }
      }
      i++;
    }
    out[key] = kind === "list" ? items : kind === "map" ? map : null;
  }
  return out;
}
function parseFrontmatter(text) {
  const normalized = text.replace(/^﻿/, "");
  if (!/^---\r?\n/.test(normalized)) return { data: {}, body: normalized };
  const afterOpen = normalized.replace(/^---\r?\n/, "");
  const end = /(?:^|\r?\n)---[ \t]*(?:\r?\n|$)/.exec(afterOpen);
  if (!end) return { data: {}, body: normalized };
  const yaml = afterOpen.slice(0, end.index);
  let body = afterOpen.slice(end.index + end[0].length);
  body = body.replace(/^\r?\n/, "");
  return { data: parseYaml(yaml), body };
}
const POST_DIRS = { post: "posts", page: "pages" };
const PUBLISH_FIELDS = [
  "lastPublishedPath",
  "lastPublishedHash",
  "previousPublishedPaths",
  "lastPublishedPathsByLocale"
];
const DATE_FIELDS = ["createdAt", "updatedAt", "publishedAt"];
const FRONT_ORDER = ["id", "type", "title", "slug", "status"];
const SECRET_KEYS = /* @__PURE__ */ new Set(["apiKey", "token", "secretAccessKey", "accessToken", "password", "sqliteToken"]);
const LANG_RE = /^[a-z]{2,3}(?:-[A-Za-z0-9]{2,8})?$/;
const LIST_FILES = {
  terms: "terms.json",
  media: "media.json",
  users: "users.json"
};
const DOC_DIRS = {
  settings: "settings",
  config: ".cms/config"
};
const PUBLISH_STATE_FILE = ".cms/publish-state.json";
function sortById(docs) {
  return [...docs].sort((a, b) => a.id < b.id ? -1 : a.id > b.id ? 1 : 0);
}
function json(value) {
  return JSON.stringify(value, null, 2) + "\n";
}
function isPlainObject(v) {
  return !!v && typeof v === "object" && !Array.isArray(v);
}
function splitSecrets(value) {
  const clean = {};
  const secrets = {};
  for (const [k, v] of Object.entries(value)) {
    if (SECRET_KEYS.has(k) && v !== "" && v != null) {
      secrets[k] = v;
    } else if (isPlainObject(v)) {
      const inner = splitSecrets(v);
      clean[k] = inner.clean;
      if (inner.secrets) secrets[k] = inner.secrets;
    } else {
      clean[k] = v;
    }
  }
  return { clean, secrets: Object.keys(secrets).length ? secrets : null };
}
function mergeDeep(base, extra) {
  const out = { ...base };
  for (const [k, v] of Object.entries(extra)) {
    out[k] = isPlainObject(v) && isPlainObject(out[k]) ? mergeDeep(out[k], v) : v;
  }
  return out;
}
function mergeSecrets(snapshot, secrets) {
  for (const [key, extra] of Object.entries(secrets)) {
    const [collection, id] = key.split("/");
    const doc = snapshot[collection]?.get(id);
    if (doc) snapshot[collection].set(id, mergeDeep(doc, extra));
  }
}
function toIso(ms) {
  return typeof ms === "number" ? new Date(ms).toISOString() : ms;
}
function fromIso(v) {
  if (typeof v === "string" && /^\d{4}-\d{2}-\d{2}/.test(v)) {
    const ms = Date.parse(v);
    if (!Number.isNaN(ms)) return ms;
  }
  return v;
}
function postFiles(post, base) {
  const files = /* @__PURE__ */ new Map();
  const front = {};
  const rest = { ...post };
  delete rest.contentMarkdown;
  for (const f of PUBLISH_FIELDS) delete rest[f];
  const inlineTranslations = {};
  if (isPlainObject(rest.translations)) {
    for (const [lang, t] of Object.entries(rest.translations)) {
      if (LANG_RE.test(lang) && isPlainObject(t) && typeof t.contentMarkdown === "string") {
        const { contentMarkdown, ...tFront } = t;
        files.set(`${base}.${lang}.md`, stringifyFrontmatter(tFront, contentMarkdown));
      } else {
        inlineTranslations[lang] = t;
      }
    }
  }
  delete rest.translations;
  for (const key of FRONT_ORDER) if (key in rest) front[key] = rest[key];
  for (const [key, value] of Object.entries(rest)) {
    if (FRONT_ORDER.includes(key)) continue;
    front[key] = DATE_FIELDS.includes(key) ? toIso(value) : value;
  }
  if (Object.keys(inlineTranslations).length) front.translations = inlineTranslations;
  files.set(`${base}.md`, stringifyFrontmatter(front, typeof post.contentMarkdown === "string" ? post.contentMarkdown : ""));
  return files;
}
function preferredBase(post) {
  const dir = post.type === "page" ? POST_DIRS.page : POST_DIRS.post;
  const slug = typeof post.slug === "string" && post.slug.trim() ? post.slug.trim() : "";
  return `${dir}/${slug || String(post.id).toLowerCase()}`;
}
function assignBases(posts, prev) {
  const next = /* @__PURE__ */ new Map();
  const taken = /* @__PURE__ */ new Set();
  const pending = [];
  for (const post of posts) {
    const preferred = preferredBase(post);
    const old = prev.get(post.id);
    const suffixed = `${preferred}--${post.id.toLowerCase()}`;
    if (old && (old === preferred || old === suffixed) && !taken.has(old)) {
      next.set(post.id, old);
      taken.add(old);
    } else {
      pending.push(post);
    }
  }
  for (const post of pending) {
    const preferred = preferredBase(post);
    const base = taken.has(preferred) ? `${preferred}--${post.id.toLowerCase()}` : preferred;
    next.set(post.id, base);
    taken.add(base);
  }
  return next;
}
function snapshotToFiles(snapshot, prevIndex) {
  const files = /* @__PURE__ */ new Map();
  const secrets = {};
  const posts = sortById(snapshot.posts.values());
  const index = assignBases(posts, prevIndex);
  const publishState = {};
  for (const post of posts) {
    for (const [path, content] of postFiles(post, index.get(post.id))) files.set(path, content);
    const state = {};
    for (const f of PUBLISH_FIELDS) if (post[f] !== void 0) state[f] = post[f];
    if (Object.keys(state).length) publishState[post.id] = state;
  }
  if (Object.keys(publishState).length) files.set(PUBLISH_STATE_FILE, json(publishState));
  for (const [collection, file] of Object.entries(LIST_FILES)) {
    const docs = sortById(snapshot[collection].values());
    if (docs.length) files.set(file, json(docs));
  }
  for (const [collection, dir] of Object.entries(DOC_DIRS)) {
    for (const doc of sortById(snapshot[collection].values())) {
      let payload = doc;
      if (collection === "config") {
        const split = splitSecrets(doc);
        payload = split.clean;
        if (split.secrets) secrets[`${collection}/${doc.id}`] = split.secrets;
      }
      files.set(`${dir}/${encodeURIComponent(doc.id)}.json`, json(payload));
    }
  }
  return { files, index, secrets };
}
function parseJson(text, path) {
  try {
    return JSON.parse(text);
  } catch {
    console.warn(`[docstore] ignoring malformed JSON: ${path}`);
    return null;
  }
}
function filesToSnapshot(files) {
  const snapshot = emptySnapshot();
  const index = /* @__PURE__ */ new Map();
  const mains = /* @__PURE__ */ new Map();
  const sidecars = [];
  for (const [path, text] of files) {
    const m = /^(posts|pages)\/(.+)\.md$/.exec(path);
    if (!m) continue;
    const name = m[2];
    if (name.includes("/")) continue;
    const parts = name.split(".");
    if (parts.length >= 2 && LANG_RE.test(parts[parts.length - 1]) && files.has(`${m[1]}/${parts.slice(0, -1).join(".")}.md`)) {
      sidecars.push({ base: `${m[1]}/${parts.slice(0, -1).join(".")}`, lang: parts[parts.length - 1], text });
      continue;
    }
    const { data, body } = parseFrontmatter(text);
    const doc = {};
    for (const [k, v] of Object.entries(data)) doc[k] = DATE_FIELDS.includes(k) ? fromIso(v) : v;
    if (typeof doc.id !== "string" || !doc.id) doc.id = `${m[1]}-${name}`;
    if (doc.type !== "post" && doc.type !== "page") doc.type = m[1] === "pages" ? "page" : "post";
    if (typeof doc.slug !== "string") doc.slug = name;
    if (typeof doc.title !== "string") doc.title = String(doc.title ?? name);
    doc.contentMarkdown = body;
    mains.set(`${m[1]}/${name}`, doc);
  }
  for (const { base, lang, text } of sidecars) {
    const doc = mains.get(base);
    if (!doc) continue;
    const { data, body } = parseFrontmatter(text);
    const translations = isPlainObject(doc.translations) ? { ...doc.translations } : {};
    translations[lang] = { ...data, contentMarkdown: body };
    doc.translations = translations;
  }
  const publishState = files.has(PUBLISH_STATE_FILE) ? parseJson(files.get(PUBLISH_STATE_FILE), PUBLISH_STATE_FILE) : null;
  for (const [base, doc] of mains) {
    const id = doc.id;
    if (snapshot.posts.has(id)) {
      console.warn(`[docstore] duplicate post id ${id} in ${base}.md — ignored`);
      continue;
    }
    const state = publishState?.[id];
    snapshot.posts.set(id, state ? { ...doc, ...state } : doc);
    index.set(id, base);
  }
  for (const [collection, file] of Object.entries(LIST_FILES)) {
    const list = files.has(file) ? parseJson(files.get(file), file) : null;
    if (!Array.isArray(list)) continue;
    for (const doc of list) {
      if (isPlainObject(doc) && typeof doc.id === "string") snapshot[collection].set(doc.id, doc);
    }
  }
  for (const [collection, dir] of Object.entries(DOC_DIRS)) {
    for (const [path, text] of files) {
      const m = new RegExp(`^${dir.replace(/\./g, "\\.")}/([^/]+)\\.json$`).exec(path);
      if (!m) continue;
      const doc = parseJson(text, path);
      if (!isPlainObject(doc)) continue;
      const id = typeof doc.id === "string" ? doc.id : decodeURIComponent(m[1]);
      snapshot[collection].set(id, { ...doc, id });
    }
  }
  return { snapshot, index };
}
function isLayoutFile(path) {
  return /^(posts|pages)\/[^/]+\.md$/.test(path) || Object.values(LIST_FILES).includes(path) || path === PUBLISH_STATE_FILE || Object.values(DOC_DIRS).some((dir) => new RegExp(`^${dir.replace(/\./g, "\\.")}/[^/]+\\.json$`).test(path));
}
const LOCAL_CONTENT_HANDLE_KEY = "content-folder";
const MAX_REBASES = 3;
function repoId(cfg) {
  if (cfg.provider === "github") return `github:${cfg.owner}/${cfg.repo}`;
  if (cfg.provider === "gitlab") return `gitlab:${cfg.project}`;
  return "local";
}
function readLs(key) {
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}
function writeLs(key, value) {
  try {
    if (value === null) window.localStorage.removeItem(key);
    else window.localStorage.setItem(key, value);
  } catch {
  }
}
function getGitToken(cfg) {
  return readLs(`agentcms.gitToken:${repoId(cfg)}`);
}
function setGitToken(cfg, token) {
  writeLs(`agentcms.gitToken:${repoId(cfg)}`, token?.trim() || null);
}
function readSecrets(cfg) {
  try {
    return JSON.parse(readLs(`agentcms.gitSecrets:${repoId(cfg)}`) ?? "{}");
  } catch {
    return {};
  }
}
function writeSecrets(cfg, secrets) {
  writeLs(`agentcms.gitSecrets:${repoId(cfg)}`, JSON.stringify(secrets));
}
function docKey(m) {
  return [m.collection, m.op === "set" ? m.doc.id : m.id];
}
function applyOnto(base, mutations) {
  const next = Object.fromEntries(Object.entries(base).map(([c, m]) => [c, new Map(m)]));
  for (const m of mutations) {
    if (m.op === "set") next[m.collection].set(m.doc.id, m.doc);
    else next[m.collection].delete(m.id);
  }
  return next;
}
function createGitDocStore(cfg) {
  const contentDir = (cfg.contentDir ?? "").replace(/^\/+|\/+$/g, "");
  const rel = (path) => contentDir ? path.slice(contentDir.length + 1) : path;
  const inContent = (path) => !contentDir || path.startsWith(contentDir + "/");
  let transport = null;
  let identityPromise = null;
  let state = null;
  let stale = false;
  async function openTransport() {
    if (transport) return transport;
    if (cfg.provider === "local") {
      const handle = await loadFolderHandle(LOCAL_CONTENT_HANDLE_KEY);
      if (!handle || !await ensureFolderPermission(handle)) return null;
      transport = createLocalFsTransport(handle);
      return transport;
    }
    const token = getGitToken(cfg);
    if (!token) return null;
    transport = cfg.provider === "github" ? createRemoteGitTransport({
      provider: "github",
      owner: cfg.owner ?? "",
      repo: cfg.repo ?? "",
      branch: cfg.branch,
      token,
      apiBaseUrl: cfg.apiBaseUrl
    }) : createRemoteGitTransport({
      provider: "gitlab",
      project: cfg.project ?? "",
      branch: cfg.branch,
      token,
      apiBaseUrl: cfg.apiBaseUrl
    });
    return transport;
  }
  async function requireTransport() {
    const t = await openTransport();
    if (!t) throw new Error(instance.t("docstore.errors.notConnected"));
    return t;
  }
  async function loadRemote() {
    const t = await requireTransport();
    const tree = await t.listTree();
    const entries = tree.entries.filter((e) => inContent(e.path) && isLayoutFile(rel(e.path)));
    const texts = await t.readTexts(entries);
    const files = /* @__PURE__ */ new Map();
    for (const [path, text] of texts) files.set(rel(path), text);
    const { snapshot, index } = filesToSnapshot(files);
    mergeSecrets(snapshot, readSecrets(cfg));
    return { head: tree.headSha, files, index, snapshot };
  }
  async function persist(mutations, before, after, message) {
    const t = await requireTransport();
    if (!state) state = await loadRemote();
    let target = after;
    for (let attempt = 0; ; attempt++) {
      const { files, index, secrets } = snapshotToFiles(target, state.index);
      writeSecrets(cfg, secrets);
      const changes = [];
      for (const [path, content] of files) {
        if (state.files.get(path) !== content) changes.push({ type: "put", path: joinRepoPath(contentDir, path), content });
      }
      for (const path of state.files.keys()) {
        if (!files.has(path)) changes.push({ type: "delete", path: joinRepoPath(contentDir, path) });
      }
      if (changes.length === 0) return;
      try {
        const head = await t.commit(changes, { message: `${message} — AgentCMS`, expectedHeadSha: state.head });
        state = { head, files, index, snapshot: target };
        return;
      } catch (err) {
        if (!(err instanceof GitConflictError) || attempt >= MAX_REBASES) throw err;
      }
      const remote = await loadRemote();
      for (const m of mutations) {
        const [collection, id] = docKey(m);
        const base = JSON.stringify(before[collection].get(id) ?? null);
        const theirs = JSON.stringify(remote.snapshot[collection].get(id) ?? null);
        if (base !== theirs) {
          state = remote;
          stale = true;
          throw new DocConflictError(instance.t("docstore.errors.conflict"), collection, id);
        }
      }
      state = remote;
      stale = true;
      target = applyOnto(remote.snapshot, mutations);
    }
  }
  const store = createDocStore({
    kind: "markdown-git",
    pollIntervalMs: cfg.provider === "local" ? 1e4 : 3e4,
    async load() {
      state = await loadRemote();
      stale = false;
      return state.snapshot;
    },
    persist,
    async poll() {
      const t = await openTransport();
      if (!t || !state) return null;
      const head = await t.headSha();
      if (head === state.head && !stale) return null;
      state = await loadRemote();
      stale = false;
      return state.snapshot;
    },
    identity() {
      if (!identityPromise) {
        identityPromise = (async () => {
          const t = await openTransport();
          if (!t) return null;
          try {
            const p = await t.permissions();
            if (!p.canWrite) return null;
            const email = cfg.provider === "github" ? `${p.login}@users.noreply.github.com` : cfg.provider === "gitlab" ? `${p.login}@users.noreply.gitlab.com` : "local@localhost";
            return {
              uid: `${t.kind}:${p.login}`,
              email,
              displayName: p.login,
              role: p.isAdmin ? "admin" : "editor"
            };
          } catch {
            return null;
          }
        })();
        identityPromise.then((id) => {
          if (!id) {
            identityPromise = null;
            transport = null;
          }
        });
      }
      return identityPromise;
    }
  });
  return Object.assign(store, {
    resetSession() {
      transport = null;
      identityPromise = null;
      state = null;
      stale = false;
    }
  });
}
const gitStore = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  LOCAL_CONTENT_HANDLE_KEY,
  createGitDocStore,
  getGitToken,
  setGitToken
}, Symbol.toStringTag, { value: "Module" }));
export {
  COLLECTIONS as C,
  DocConflictError as D,
  splitSecrets as a,
  createGitDocStore as b,
  createDocStore as c,
  gitStore as d,
  emptySnapshot as e,
  getGitToken as g,
  mergeSecrets as m,
  setGitToken as s
};
