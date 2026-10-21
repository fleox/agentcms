import { emptySnapshot, type Snapshot } from "./core";
import { parseFrontmatter, stringifyFrontmatter } from "./frontmatter";
import type { CollectionName, StoredDoc } from "./types";

// File layout of the Markdown content repo (paths relative to the
// content dir). Pure functions: snapshot ⇄ files.
//
//   posts/<slug>.md            one post per file, frontmatter + Markdown body
//   posts/<slug>.<lang>.md     per-language translation sidecar
//   pages/<slug>.md            same for pages
//   terms.json                 categories + tags
//   media.json                 media metadata (binaries live on the publish target)
//   users.json                 public author profiles
//   settings/<id>.json         site settings (settings/site.json, …)
//   .cms/config/<id>.json      CMS config docs, secrets stripped (see below)
//   .cms/publish-state.json    where each post is live + content hashes
//
// Publish bookkeeping lives in .cms/publish-state.json, not in the .md
// files, so publishing never touches content files (clean history).
//
// Secrets (API keys, tokens) are NEVER written to the repo: they are
// split out of config docs and kept in the editor's browser.

const POST_DIRS = { post: "posts", page: "pages" } as const;
const PUBLISH_FIELDS = [
  "lastPublishedPath",
  "lastPublishedHash",
  "previousPublishedPaths",
  "lastPublishedPathsByLocale",
] as const;
const DATE_FIELDS = ["createdAt", "updatedAt", "publishedAt"] as const;
const FRONT_ORDER = ["id", "type", "title", "slug", "status"];
const SECRET_KEYS = new Set(["apiKey", "token", "secretAccessKey", "accessToken", "password", "sqliteToken"]);
const LANG_RE = /^[a-z]{2,3}(?:-[A-Za-z0-9]{2,8})?$/;
const LIST_FILES: Partial<Record<CollectionName, string>> = {
  terms: "terms.json",
  media: "media.json",
  users: "users.json",
};
const DOC_DIRS: Partial<Record<CollectionName, string>> = {
  settings: "settings",
  config: ".cms/config",
};
export const PUBLISH_STATE_FILE = ".cms/publish-state.json";

// Post id → file base path without extension ("posts/hello-world").
// Carried between writes so a post keeps its file name until its slug
// changes (no renames on unrelated edits).
export type LayoutIndex = Map<string, string>;

// `${collection}/${id}` → stripped secret values, as a nested partial doc.
export type SecretBag = Record<string, Record<string, unknown>>;

function sortById(docs: Iterable<StoredDoc>): StoredDoc[] {
  return [...docs].sort((a, b) => (a.id < b.id ? -1 : a.id > b.id ? 1 : 0));
}

function json(value: unknown): string {
  return JSON.stringify(value, null, 2) + "\n";
}

function isPlainObject(v: unknown): v is Record<string, unknown> {
  return !!v && typeof v === "object" && !Array.isArray(v);
}

// Splits secret keys out of a doc (recursively). Returns the cleaned doc
// and the removed values (or null when there were none).
export function splitSecrets(value: Record<string, unknown>): { clean: Record<string, unknown>; secrets: Record<string, unknown> | null } {
  const clean: Record<string, unknown> = {};
  const secrets: Record<string, unknown> = {};
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

function mergeDeep(base: Record<string, unknown>, extra: Record<string, unknown>): Record<string, unknown> {
  const out: Record<string, unknown> = { ...base };
  for (const [k, v] of Object.entries(extra)) {
    out[k] = isPlainObject(v) && isPlainObject(out[k]) ? mergeDeep(out[k] as Record<string, unknown>, v) : v;
  }
  return out;
}

export function mergeSecrets(snapshot: Snapshot, secrets: SecretBag): void {
  for (const [key, extra] of Object.entries(secrets)) {
    const [collection, id] = key.split("/") as [CollectionName, string];
    const doc = snapshot[collection]?.get(id);
    if (doc) snapshot[collection].set(id, mergeDeep(doc, extra) as StoredDoc);
  }
}

// ─── Posts ⇄ Markdown ────────────────────────────────────────────────────

function toIso(ms: unknown): unknown {
  return typeof ms === "number" ? new Date(ms).toISOString() : ms;
}

function fromIso(v: unknown): unknown {
  if (typeof v === "string" && /^\d{4}-\d{2}-\d{2}/.test(v)) {
    const ms = Date.parse(v);
    if (!Number.isNaN(ms)) return ms;
  }
  return v;
}

function postFiles(post: StoredDoc, base: string): Map<string, string> {
  const files = new Map<string, string>();
  const front: Record<string, unknown> = {};
  const rest: Record<string, unknown> = { ...post };
  delete rest.contentMarkdown;
  for (const f of PUBLISH_FIELDS) delete rest[f];

  const inlineTranslations: Record<string, unknown> = {};
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
    front[key] = (DATE_FIELDS as readonly string[]).includes(key) ? toIso(value) : value;
  }
  if (Object.keys(inlineTranslations).length) front.translations = inlineTranslations;
  files.set(`${base}.md`, stringifyFrontmatter(front, typeof post.contentMarkdown === "string" ? post.contentMarkdown : ""));
  return files;
}

function preferredBase(post: StoredDoc): string {
  const dir = post.type === "page" ? POST_DIRS.page : POST_DIRS.post;
  const slug = typeof post.slug === "string" && post.slug.trim() ? post.slug.trim() : "";
  return `${dir}/${slug || String(post.id).toLowerCase()}`;
}

function assignBases(posts: StoredDoc[], prev: LayoutIndex): LayoutIndex {
  const next: LayoutIndex = new Map();
  const taken = new Set<string>();
  const pending: StoredDoc[] = [];
  // Keep existing names whose slug didn't change.
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

// ─── Snapshot → files ────────────────────────────────────────────────────

export function snapshotToFiles(
  snapshot: Snapshot,
  prevIndex: LayoutIndex,
): { files: Map<string, string>; index: LayoutIndex; secrets: SecretBag } {
  const files = new Map<string, string>();
  const secrets: SecretBag = {};

  const posts = sortById(snapshot.posts.values());
  const index = assignBases(posts, prevIndex);
  const publishState: Record<string, Record<string, unknown>> = {};
  for (const post of posts) {
    for (const [path, content] of postFiles(post, index.get(post.id)!)) files.set(path, content);
    const state: Record<string, unknown> = {};
    for (const f of PUBLISH_FIELDS) if (post[f] !== undefined) state[f] = post[f];
    if (Object.keys(state).length) publishState[post.id] = state;
  }
  if (Object.keys(publishState).length) files.set(PUBLISH_STATE_FILE, json(publishState));

  for (const [collection, file] of Object.entries(LIST_FILES) as Array<[CollectionName, string]>) {
    const docs = sortById(snapshot[collection].values());
    if (docs.length) files.set(file, json(docs));
  }
  for (const [collection, dir] of Object.entries(DOC_DIRS) as Array<[CollectionName, string]>) {
    for (const doc of sortById(snapshot[collection].values())) {
      let payload: Record<string, unknown> = doc;
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

// ─── Files → snapshot ────────────────────────────────────────────────────

function parseJson(text: string, path: string): unknown {
  try {
    return JSON.parse(text);
  } catch {
    console.warn(`[docstore] ignoring malformed JSON: ${path}`);
    return null;
  }
}

export function filesToSnapshot(files: Map<string, string>): { snapshot: Snapshot; index: LayoutIndex } {
  const snapshot = emptySnapshot();
  const index: LayoutIndex = new Map();
  const mains = new Map<string, Record<string, unknown>>(); // base → doc
  const sidecars: Array<{ base: string; lang: string; text: string }> = [];

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
    const doc: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(data)) doc[k] = (DATE_FIELDS as readonly string[]).includes(k) ? fromIso(v) : v;
    // Hand-made files may omit id / type — derive stable defaults.
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

  const publishState = files.has(PUBLISH_STATE_FILE)
    ? (parseJson(files.get(PUBLISH_STATE_FILE)!, PUBLISH_STATE_FILE) as Record<string, Record<string, unknown>> | null)
    : null;
  for (const [base, doc] of mains) {
    const id = doc.id as string;
    if (snapshot.posts.has(id)) {
      console.warn(`[docstore] duplicate post id ${id} in ${base}.md — ignored`);
      continue;
    }
    const state = publishState?.[id];
    snapshot.posts.set(id, (state ? { ...doc, ...state } : doc) as StoredDoc);
    index.set(id, base);
  }

  for (const [collection, file] of Object.entries(LIST_FILES) as Array<[CollectionName, string]>) {
    const list = files.has(file) ? parseJson(files.get(file)!, file) : null;
    if (!Array.isArray(list)) continue;
    for (const doc of list) {
      if (isPlainObject(doc) && typeof doc.id === "string") snapshot[collection].set(doc.id, doc as StoredDoc);
    }
  }
  for (const [collection, dir] of Object.entries(DOC_DIRS) as Array<[CollectionName, string]>) {
    for (const [path, text] of files) {
      const m = new RegExp(`^${dir.replace(/\./g, "\\.")}/([^/]+)\\.json$`).exec(path);
      if (!m) continue;
      const doc = parseJson(text, path);
      if (!isPlainObject(doc)) continue;
      const id = typeof doc.id === "string" ? doc.id : decodeURIComponent(m[1]);
      snapshot[collection].set(id, { ...doc, id } as StoredDoc);
    }
  }
  return { snapshot, index };
}

// Files this layout owns — everything else in the repo is left alone.
export function isLayoutFile(path: string): boolean {
  return (
    /^(posts|pages)\/[^/]+\.md$/.test(path) ||
    Object.values(LIST_FILES).includes(path) ||
    path === PUBLISH_STATE_FILE ||
    Object.values(DOC_DIRS).some((dir) => new RegExp(`^${dir!.replace(/\./g, "\\.")}/[^/]+\\.json$`).test(path))
  );
}
