import { createRequire as __acmsRequire } from "node:module";
import { fileURLToPath as __acmsPath } from "node:url";
import { dirname as __acmsDirname } from "node:path";
const require2 = __acmsRequire(import.meta.url);
const __filename = __acmsPath(import.meta.url);
const __dirname = __acmsDirname(__filename);
import { i as instance } from "./index-CqPWXpW_.mjs";
import { toast } from "./toast-CYyyaSAW.mjs";
import { StorageError } from "./types-DAD44Ttj.mjs";
const DB_NAME$1 = "agentcms-git-blobs";
const STORE$1 = "texts";
const memory = /* @__PURE__ */ new Map();
let dbPromise = null;
function openDb$1() {
  if (dbPromise) return dbPromise;
  dbPromise = new Promise((resolve) => {
    try {
      if (typeof indexedDB === "undefined") return resolve(null);
      const req = indexedDB.open(DB_NAME$1, 1);
      req.onupgradeneeded = () => req.result.createObjectStore(STORE$1);
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => resolve(null);
      req.onblocked = () => resolve(null);
    } catch {
      resolve(null);
    }
  });
  return dbPromise;
}
async function getCachedTexts(shas) {
  const out = /* @__PURE__ */ new Map();
  const missing = [];
  for (const sha of shas) {
    const hit = memory.get(sha);
    if (hit !== void 0) out.set(sha, hit);
    else missing.push(sha);
  }
  if (missing.length === 0) return out;
  const db = await openDb$1();
  if (!db) return out;
  await new Promise((resolve) => {
    try {
      const tx = db.transaction(STORE$1, "readonly");
      const store = tx.objectStore(STORE$1);
      for (const sha of missing) {
        const req = store.get(sha);
        req.onsuccess = () => {
          if (typeof req.result === "string") {
            out.set(sha, req.result);
            memory.set(sha, req.result);
          }
        };
      }
      tx.oncomplete = () => resolve();
      tx.onerror = () => resolve();
      tx.onabort = () => resolve();
    } catch {
      resolve();
    }
  });
  return out;
}
async function putCachedTexts(entries) {
  for (const [sha, text] of entries) memory.set(sha, text);
  const db = await openDb$1();
  if (!db || entries.size === 0) return;
  await new Promise((resolve) => {
    try {
      const tx = db.transaction(STORE$1, "readwrite");
      const store = tx.objectStore(STORE$1);
      for (const [sha, text] of entries) store.put(text, sha);
      tx.oncomplete = () => resolve();
      tx.onerror = () => resolve();
      tx.onabort = () => resolve();
    } catch {
      resolve();
    }
  });
}
function bytesToBase64(bytes) {
  let binary = "";
  const chunk = 32768;
  for (let i = 0; i < bytes.length; i += chunk) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunk));
  }
  return btoa(binary);
}
function base64ToBytes(base64) {
  const binary = atob(base64.replace(/\s+/g, ""));
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}
function utf8ToBase64(text) {
  return bytesToBase64(new TextEncoder().encode(text));
}
function base64ToUtf8(base64) {
  return new TextDecoder().decode(base64ToBytes(base64));
}
function changeToBytes(change) {
  return change.encoding === "base64" ? base64ToBytes(change.content) : new TextEncoder().encode(change.content);
}
function actionLabel(action) {
  return instance.t(`storage.actions.${action}`);
}
function extractDetail(body) {
  if (!body) return "";
  let text = body.trim();
  try {
    const parsed = JSON.parse(text);
    text = parsed.error ?? parsed.message ?? text;
  } catch {
  }
  if (text.length > 240) text = text.slice(0, 240) + "…";
  return text;
}
function buildErrorMessage(action, status, body) {
  const label = actionLabel(action);
  const detail = extractDetail(body);
  switch (status) {
    case 401:
    case 403:
      return instance.t("storage.errors.auth", { action: label });
    case 404:
      return instance.t("storage.errors.notFound", { action: label });
    case 413:
      return instance.t("storage.errors.tooLarge", { action: label });
    case 429:
      return instance.t("storage.errors.rateLimited", { action: label });
    case 500:
    case 502:
    case 503:
    case 504:
      return instance.t("storage.errors.serverError", { action: label, status });
    default:
      return instance.t("storage.errors.generic", {
        action: label,
        status,
        detail: detail ? `: ${detail}` : ""
      });
  }
}
async function performRequest(action, fetcher) {
  let res;
  try {
    res = await fetcher();
  } catch (err) {
    if (err?.name === "AbortError") throw err;
    toast.error(instance.t("storage.errors.network", { action: actionLabel(action) }));
    throw err;
  }
  if (res.ok) return res;
  const body = await res.text().catch(() => "");
  const isSilenced = (action === "delete" || action === "deleteFolder") && res.status === 404;
  const message = buildErrorMessage(action, res.status, body);
  if (!isSilenced) toast.error(message);
  throw new StorageError(message, res.status, body);
}
function unsupported(action, connectorId) {
  const message = instance.t("storage.errors.unsupported", {
    action: actionLabel(action),
    connector: connectorId
  });
  toast.error(message);
  return new StorageError(message, 501);
}
async function gitFetch(action, url, init, allow = []) {
  let res;
  try {
    res = await fetch(url, init);
  } catch (err) {
    return performRequest(action, () => Promise.reject(err));
  }
  if (res.ok || allow.includes(res.status)) return res;
  return performRequest(action, async () => res);
}
async function mapLimit(items, limit, worker) {
  const results = new Array(items.length);
  let next = 0;
  async function lane() {
    while (next < items.length) {
      const i = next++;
      results[i] = await worker(items[i]);
    }
  }
  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, lane));
  return results;
}
class GitConflictError extends Error {
  constructor(message, currentHeadSha) {
    super(message);
    this.currentHeadSha = currentHeadSha;
    this.name = "GitConflictError";
  }
}
const TREE_CHUNK = 300;
const GRAPHQL_BATCH = 50;
const MAX_REF_RETRIES = 3;
function createGitHubTransport(cfg) {
  const api = (cfg.apiBaseUrl || "https://api.github.com").replace(/\/+$/, "");
  const graphqlUrl = api.endsWith("/api/v3") ? api.replace(/\/api\/v3$/, "/api/graphql") : `${api}/graphql`;
  const repoUrl = `${api}/repos/${encodeURIComponent(cfg.owner)}/${encodeURIComponent(cfg.repo)}`;
  const refPath = `heads/${cfg.branch.split("/").map(encodeURIComponent).join("/")}`;
  const headers = {
    Authorization: `Bearer ${cfg.token}`,
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28"
  };
  const jsonHeaders = { ...headers, "Content-Type": "application/json" };
  async function getJson(url, action = "get") {
    const res = await gitFetch(action, url, { headers, cache: "no-store" });
    return await res.json();
  }
  async function postJson(url, body, method = "POST") {
    const res = await gitFetch("commit", url, { method, headers: jsonHeaders, body: JSON.stringify(body) });
    return await res.json();
  }
  async function headSha() {
    const res = await gitFetch("get", `${repoUrl}/git/ref/${refPath}`, { headers, cache: "no-store" }, [404, 409]);
    if (!res.ok) return "";
    const data = await res.json();
    if (Array.isArray(data)) return "";
    return data.object?.sha ?? "";
  }
  async function treeShaOf(commitSha) {
    const commit2 = await getJson(`${repoUrl}/git/commits/${commitSha}`);
    return commit2.tree.sha;
  }
  async function walk(treeSha, prefix, out) {
    const data = await getJson(`${repoUrl}/git/trees/${treeSha}`, "list");
    for (const item of data.tree) {
      const path = prefix + item.path;
      if (item.type === "blob") out.push({ path, sha: item.sha, size: item.size });
      else if (item.type === "tree") await walk(item.sha, path + "/", out);
    }
  }
  async function listTreeAt(head) {
    if (!head) return { headSha: "", entries: [] };
    const treeSha = await treeShaOf(head);
    const data = await getJson(
      `${repoUrl}/git/trees/${treeSha}?recursive=1`,
      "list"
    );
    if (!data.truncated) {
      return {
        headSha: head,
        entries: data.tree.filter((t) => t.type === "blob").map((t) => ({ path: t.path, sha: t.sha, size: t.size }))
      };
    }
    const entries = [];
    await walk(treeSha, "", entries);
    return { headSha: head, entries };
  }
  async function readBlobBase64(sha) {
    const blob = await getJson(`${repoUrl}/git/blobs/${sha}`);
    return blob.content;
  }
  async function graphqlTexts(shas) {
    const out = /* @__PURE__ */ new Map();
    for (let i = 0; i < shas.length; i += GRAPHQL_BATCH) {
      const batch = shas.slice(i, i + GRAPHQL_BATCH);
      const fields = batch.map((sha, j) => `b${j}: object(oid: "${sha}") { ... on Blob { text isBinary isTruncated } }`).join("\n");
      const query = `query($owner: String!, $name: String!) { repository(owner: $owner, name: $name) { ${fields} } }`;
      try {
        const res = await fetch(graphqlUrl, {
          method: "POST",
          headers: jsonHeaders,
          body: JSON.stringify({ query, variables: { owner: cfg.owner, name: cfg.repo } })
        });
        if (!res.ok) continue;
        const json = await res.json();
        const repo = json.data?.repository;
        if (!repo) continue;
        batch.forEach((sha, j) => {
          const blob = repo[`b${j}`];
          if (blob && !blob.isBinary && !blob.isTruncated && typeof blob.text === "string") {
            out.set(sha, blob.text);
          }
        });
      } catch {
      }
    }
    return out;
  }
  async function readTexts(entries) {
    const shas = [...new Set(entries.map((e) => e.sha))];
    const bySha = await getCachedTexts(shas);
    const missing = shas.filter((sha) => !bySha.has(sha));
    const fetched = /* @__PURE__ */ new Map();
    if (missing.length > 0) {
      const viaGraphql = await graphqlTexts(missing);
      for (const [sha, text] of viaGraphql) fetched.set(sha, text);
      const rest = missing.filter((sha) => !fetched.has(sha));
      await mapLimit(rest, 6, async (sha) => {
        fetched.set(sha, base64ToUtf8(await readBlobBase64(sha)));
      });
      await putCachedTexts(fetched);
    }
    const out = /* @__PURE__ */ new Map();
    for (const e of entries) {
      const text = bySha.get(e.sha) ?? fetched.get(e.sha);
      if (text !== void 0) out.set(e.path, text);
    }
    return out;
  }
  async function readBytes(entry) {
    return base64ToBytes(await readBlobBase64(entry.sha));
  }
  async function bootstrapBranch(message) {
    const repo = await getJson(repoUrl);
    const defaultRes = repo.default_branch ? await gitFetch(
      "get",
      `${repoUrl}/git/ref/heads/${encodeURIComponent(repo.default_branch)}`,
      { headers, cache: "no-store" },
      [404, 409]
    ) : null;
    if (!defaultRes || !defaultRes.ok) {
      const created = await postJson(
        `${repoUrl}/contents/.gitkeep`,
        { message, content: "", branch: cfg.branch },
        "PUT"
      );
      return created.commit.sha;
    }
    const tree = await postJson(`${repoUrl}/git/trees`, {
      tree: [{ path: ".gitkeep", mode: "100644", type: "blob", content: "" }]
    });
    const commit2 = await postJson(`${repoUrl}/git/commits`, {
      message,
      tree: tree.sha,
      parents: []
    });
    await postJson(`${repoUrl}/git/refs`, { ref: `refs/heads/${cfg.branch}`, sha: commit2.sha });
    return commit2.sha;
  }
  async function commit(changes, opts) {
    const blobShas = /* @__PURE__ */ new Map();
    for (let attempt = 0; ; attempt++) {
      let head = await headSha();
      if (opts.expectedHeadSha !== void 0 && head !== opts.expectedHeadSha) {
        throw new GitConflictError(`Branch ${cfg.branch} moved`, head);
      }
      if (!head) head = await bootstrapBranch("Initialize branch — AgentCMS");
      for (const change of changes) {
        if (change.type === "put" && change.encoding === "base64" && !blobShas.has(change.path)) {
          const blob = await postJson(`${repoUrl}/git/blobs`, {
            content: change.content,
            encoding: "base64"
          });
          blobShas.set(change.path, blob.sha);
        }
      }
      const baseTree = await treeShaOf(head);
      let existing = null;
      if (changes.some((c) => c.type === "delete")) {
        existing = new Set((await listTreeAt(head)).entries.map((e) => e.path));
      }
      const items = [];
      for (const change of changes) {
        if (change.type === "delete") {
          if (existing?.has(change.path)) {
            items.push({ path: change.path, mode: "100644", type: "blob", sha: null });
          }
        } else if (change.encoding === "base64") {
          items.push({ path: change.path, mode: "100644", type: "blob", sha: blobShas.get(change.path) });
        } else {
          items.push({ path: change.path, mode: "100644", type: "blob", content: change.content });
        }
      }
      let tree = baseTree;
      for (let i = 0; i < items.length; i += TREE_CHUNK) {
        const res = await postJson(`${repoUrl}/git/trees`, {
          base_tree: tree,
          tree: items.slice(i, i + TREE_CHUNK)
        });
        tree = res.sha;
      }
      if (tree === baseTree) return head;
      const created = await postJson(`${repoUrl}/git/commits`, {
        message: opts.message,
        tree,
        parents: [head]
      });
      const update = await gitFetch(
        "commit",
        `${repoUrl}/git/refs/${refPath}`,
        { method: "PATCH", headers: jsonHeaders, body: JSON.stringify({ sha: created.sha, force: false }) },
        [409, 422]
      );
      if (update.ok) return created.sha;
      if (opts.expectedHeadSha !== void 0) {
        throw new GitConflictError(`Branch ${cfg.branch} moved`, await headSha());
      }
      if (attempt >= MAX_REF_RETRIES) {
        throw new GitConflictError(`Branch ${cfg.branch} kept moving`, await headSha());
      }
    }
  }
  async function resetBranch(files, opts) {
    const items = [];
    for (const f of files) {
      const blob = await postJson(`${repoUrl}/git/blobs`, { content: f.content, encoding: "base64" });
      items.push({ path: f.path, mode: "100644", type: "blob", sha: blob.sha });
    }
    const tree = await postJson(`${repoUrl}/git/trees`, { tree: items });
    const created = await postJson(`${repoUrl}/git/commits`, { message: opts.message, tree: tree.sha, parents: [] });
    const head = await headSha();
    if (head !== opts.expectedHeadSha) throw new GitConflictError(`Branch ${cfg.branch} moved`, head);
    await gitFetch("commit", `${repoUrl}/git/refs/${refPath}`, {
      method: "PATCH",
      headers: jsonHeaders,
      body: JSON.stringify({ sha: created.sha, force: true })
    });
    return created.sha;
  }
  async function permissions() {
    const [user, repo] = await Promise.all([
      getJson(`${api}/user`),
      getJson(repoUrl)
    ]);
    const p = repo.permissions ?? {};
    const visibility = repo.visibility === "public" || repo.visibility === "private" || repo.visibility === "internal" ? repo.visibility : typeof repo.private === "boolean" ? repo.private ? "private" : "public" : void 0;
    return { login: user.login, canWrite: !!(p.push || p.maintain || p.admin), isAdmin: !!(p.admin || p.maintain), visibility };
  }
  return {
    kind: "github",
    label: `${cfg.owner}/${cfg.repo}@${cfg.branch}`,
    headSha,
    listTree: async () => listTreeAt(await headSha()),
    readTexts,
    readBytes,
    commit,
    permissions,
    resetBranch
  };
}
const MAX_RETRIES = 3;
const WRITE_LEVEL = 30;
const ADMIN_LEVEL = 40;
function createGitLabTransport(cfg) {
  const api = (cfg.apiBaseUrl || "https://gitlab.com/api/v4").replace(/\/+$/, "");
  const projectUrl = `${api}/projects/${encodeURIComponent(cfg.project)}`;
  const headers = { Authorization: `Bearer ${cfg.token}` };
  const jsonHeaders = { ...headers, "Content-Type": "application/json" };
  const pathsByHead = /* @__PURE__ */ new Map();
  async function getJson(url, action = "get") {
    const res = await gitFetch(action, url, { headers, cache: "no-store" });
    return await res.json();
  }
  async function headSha() {
    const res = await gitFetch(
      "get",
      `${projectUrl}/repository/branches/${encodeURIComponent(cfg.branch)}`,
      { headers, cache: "no-store" },
      [404]
    );
    if (!res.ok) return "";
    const data = await res.json();
    return data.commit?.id ?? "";
  }
  async function listTreeAt(head) {
    if (!head) return { headSha: "", entries: [] };
    const entries = [];
    for (let page = 1; ; page++) {
      const url = `${projectUrl}/repository/tree?${new URLSearchParams({
        ref: head,
        recursive: "true",
        per_page: "100",
        page: String(page)
      })}`;
      const res = await gitFetch("list", url, { headers, cache: "no-store" });
      const items = await res.json();
      for (const item of items) {
        if (item.type === "blob") entries.push({ path: item.path, sha: item.id });
      }
      const nextPage = res.headers.get("x-next-page");
      if (!nextPage || items.length === 0) break;
    }
    pathsByHead.set(head, new Set(entries.map((e) => e.path)));
    return { headSha: head, entries };
  }
  async function rawBlob(sha) {
    return gitFetch("get", `${projectUrl}/repository/blobs/${sha}/raw`, { headers });
  }
  async function readTexts(entries) {
    const shas = [...new Set(entries.map((e) => e.sha))];
    const bySha = await getCachedTexts(shas);
    const missing = shas.filter((sha) => !bySha.has(sha));
    const fetched = /* @__PURE__ */ new Map();
    await mapLimit(missing, 6, async (sha) => {
      fetched.set(sha, await (await rawBlob(sha)).text());
    });
    await putCachedTexts(fetched);
    const out = /* @__PURE__ */ new Map();
    for (const e of entries) {
      const text = bySha.get(e.sha) ?? fetched.get(e.sha);
      if (text !== void 0) out.set(e.path, text);
    }
    return out;
  }
  async function readBytes(entry) {
    return new Uint8Array(await (await rawBlob(entry.sha)).arrayBuffer());
  }
  async function existingPaths(head) {
    if (!head) return /* @__PURE__ */ new Set();
    return pathsByHead.get(head) ?? new Set((await listTreeAt(head)).entries.map((e) => e.path));
  }
  async function defaultBranch() {
    const project = await getJson(projectUrl);
    return project.default_branch || void 0;
  }
  async function commit(changes, opts) {
    for (let attempt = 0; ; attempt++) {
      const head = await headSha();
      if (opts.expectedHeadSha !== void 0 && head !== opts.expectedHeadSha) {
        throw new GitConflictError(`Branch ${cfg.branch} moved`, head);
      }
      const existing = await existingPaths(head);
      const actions = [];
      const after = new Set(existing);
      for (const change of changes) {
        if (change.type === "delete") {
          if (!existing.has(change.path)) continue;
          actions.push({ action: "delete", file_path: change.path });
          after.delete(change.path);
        } else {
          actions.push({
            action: existing.has(change.path) ? "update" : "create",
            file_path: change.path,
            encoding: "base64",
            content: change.encoding === "base64" ? change.content : utf8ToBase64(change.content)
          });
          after.add(change.path);
        }
      }
      if (actions.length === 0) return head;
      const body = {
        branch: cfg.branch,
        commit_message: opts.message,
        actions
      };
      if (!head) {
        const base = await defaultBranch();
        if (base && base !== cfg.branch) body.start_branch = base;
      }
      const res = await gitFetch(
        "commit",
        `${projectUrl}/repository/commits`,
        { method: "POST", headers: jsonHeaders, body: JSON.stringify(body) },
        // 400 = create/update mismatch: someone added / removed a file
        // since our listing. Refresh and retry.
        [400]
      );
      if (res.ok) {
        const created = await res.json();
        pathsByHead.set(created.id, after);
        return created.id;
      }
      pathsByHead.delete(head);
      if (opts.expectedHeadSha !== void 0 || attempt >= MAX_RETRIES) {
        throw new GitConflictError(`Commit on ${cfg.branch} rejected: ${await res.text()}`, await headSha());
      }
    }
  }
  async function permissions() {
    const [user, project] = await Promise.all([
      getJson(`${api}/user`),
      getJson(projectUrl)
    ]);
    const level = Math.max(
      project.permissions?.project_access?.access_level ?? 0,
      project.permissions?.group_access?.access_level ?? 0
    );
    const v = project.visibility;
    const visibility = v === "public" || v === "private" || v === "internal" ? v : void 0;
    return { login: user.username, canWrite: level >= WRITE_LEVEL, isAdmin: level >= ADMIN_LEVEL, visibility };
  }
  return {
    kind: "gitlab",
    label: `${cfg.project}@${cfg.branch}`,
    headSha,
    listTree: async () => listTreeAt(await headSha()),
    readTexts,
    readBytes,
    commit,
    permissions
  };
}
const IGNORED = /* @__PURE__ */ new Set([".git", "node_modules", ".DS_Store", "Thumbs.db"]);
async function ensureFolderPermission(handle, request) {
  const dir = handle;
  const desc = { mode: "readwrite" };
  if (await dir.queryPermission?.(desc) === "granted") return true;
  return false;
}
function fingerprint(entries) {
  let h = 2166136261;
  for (const e of entries) {
    const line = `${e.path}\0${e.sha}
`;
    for (let i = 0; i < line.length; i++) {
      h ^= line.charCodeAt(i);
      h = Math.imul(h, 16777619);
    }
  }
  return `local-${entries.length}-${(h >>> 0).toString(16)}`;
}
function createLocalFsTransport(handle) {
  const root = handle;
  const files = /* @__PURE__ */ new Map();
  async function walk(dir, prefix, out) {
    for await (const [name, child] of dir.entries()) {
      if (IGNORED.has(name)) continue;
      const path = prefix + name;
      if (child.kind === "directory") {
        await walk(child, path + "/", out);
      } else {
        const file = await child.getFile();
        files.set(path, child);
        out.push({ path, sha: `${file.size}:${file.lastModified}`, size: file.size });
      }
    }
  }
  async function listTree() {
    files.clear();
    const entries = [];
    await walk(root, "", entries);
    entries.sort((a, b) => a.path < b.path ? -1 : a.path > b.path ? 1 : 0);
    return { headSha: fingerprint(entries), entries };
  }
  async function fileHandle(path) {
    const cached = files.get(path);
    if (cached) return cached;
    const parts = path.split("/");
    let dir = root;
    for (const part of parts.slice(0, -1)) dir = await dir.getDirectoryHandle(part);
    return dir.getFileHandle(parts[parts.length - 1]);
  }
  async function readTexts(entries) {
    const out = /* @__PURE__ */ new Map();
    for (const e of entries) {
      try {
        out.set(e.path, await (await (await fileHandle(e.path)).getFile()).text());
      } catch {
      }
    }
    return out;
  }
  async function readBytes(entry) {
    const file = await (await fileHandle(entry.path)).getFile();
    return new Uint8Array(await file.arrayBuffer());
  }
  async function writeFile(path, bytes) {
    const parts = path.split("/");
    let dir = root;
    for (const part of parts.slice(0, -1)) dir = await dir.getDirectoryHandle(part, { create: true });
    const file = await dir.getFileHandle(parts[parts.length - 1], { create: true });
    const writable = await file.createWritable();
    await writable.write(bytes);
    await writable.close();
    files.set(path, file);
  }
  async function removeFile(path) {
    const parts = path.split("/");
    try {
      let dir = root;
      for (const part of parts.slice(0, -1)) dir = await dir.getDirectoryHandle(part);
      await dir.removeEntry(parts[parts.length - 1]);
    } catch {
    }
    files.delete(path);
  }
  async function commit(changes, opts) {
    if (opts.expectedHeadSha !== void 0) {
      const current = (await listTree()).headSha;
      if (current !== opts.expectedHeadSha) throw new GitConflictError("Folder changed on disk", current);
    }
    for (const change of changes) {
      if (change.type === "delete") await removeFile(change.path);
      else await writeFile(change.path, changeToBytes(change));
    }
    return (await listTree()).headSha;
  }
  return {
    kind: "local",
    label: root.name,
    headSha: async () => (await listTree()).headSha,
    listTree,
    readTexts,
    readBytes,
    commit,
    permissions: async () => ({
      login: "local",
      canWrite: await ensureFolderPermission(handle),
      isAdmin: true
    })
  };
}
const DB_NAME = "agentcms-folder-handles";
const STORE = "handles";
function openDb() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, 1);
    req.onupgradeneeded = () => req.result.createObjectStore(STORE);
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}
async function loadFolderHandle(key) {
  try {
    const db = await openDb();
    return await new Promise((resolve) => {
      const req = db.transaction(STORE, "readonly").objectStore(STORE).get(key);
      req.onsuccess = () => resolve(req.result ?? null);
      req.onerror = () => resolve(null);
    });
  } catch {
    return null;
  }
}
function createRemoteGitTransport(cfg) {
  return cfg.provider === "github" ? createGitHubTransport(cfg) : createGitLabTransport(cfg);
}
function joinRepoPath(dir, path) {
  const d = dir.replace(/^\/+|\/+$/g, "");
  const p = path.replace(/^\/+/, "");
  return d ? `${d}/${p}` : p;
}
const index = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  GitConflictError,
  createLocalFsTransport,
  createRemoteGitTransport,
  ensureFolderPermission,
  joinRepoPath,
  loadFolderHandle
}, Symbol.toStringTag, { value: "Module" }));
export {
  GitConflictError as G,
  createLocalFsTransport as a,
  bytesToBase64 as b,
  createRemoteGitTransport as c,
  base64ToBytes as d,
  ensureFolderPermission as e,
  base64ToUtf8 as f,
  index as i,
  joinRepoPath as j,
  loadFolderHandle as l,
  mapLimit as m,
  performRequest as p,
  unsupported as u
};
