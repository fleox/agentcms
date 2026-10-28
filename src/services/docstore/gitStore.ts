import i18n from "../../i18n";
import type { MarkdownGitRuntimeConfig } from "../../lib/runtimeConfig";
import {
  createLocalFsTransport,
  createRemoteGitTransport,
  ensureFolderPermission,
  GitConflictError,
  joinRepoPath,
  loadFolderHandle,
  type GitChange,
  type GitTransport,
} from "../git";
import { createDocStore, type Snapshot } from "./core";
import { filesToSnapshot, isLayoutFile, mergeSecrets, snapshotToFiles, type LayoutIndex, type SecretBag } from "./markdownLayout";
import { DocConflictError, type CollectionName, type DocMutation, type DocStore, type DocStoreIdentity } from "./types";

// "markdown-git" document store: content lives as Markdown + JSON files
// (layout in markdownLayout.ts) in a GitHub / GitLab repo — read and
// committed through their REST APIs — or in a local folder that is a
// git clone (File System Access API).
//
// Each write() is one commit, guarded by the head it was based on. When
// someone else pushed in between, the store reloads the remote state
// and checks the documents it is writing: untouched remotely → the
// change is rebased onto the new head and committed again; modified
// remotely → DocConflictError, the local change is rolled back and the
// remote version shows up.
//
// Access tokens are per editor and per browser (localStorage), never in
// config.js nor in the repo. Secrets inside config docs (publish target
// keys) are kept the same way — see markdownLayout.ts.

export type GitContentConfig = MarkdownGitRuntimeConfig["git"];

export const LOCAL_CONTENT_HANDLE_KEY = "content-folder";
const MAX_REBASES = 3;

function repoId(cfg: GitContentConfig): string {
  if (cfg.provider === "github") return `github:${cfg.owner}/${cfg.repo}`;
  if (cfg.provider === "gitlab") return `gitlab:${cfg.project}`;
  return "local";
}

// ─── Per-browser token + secret storage ──────────────────────────────────

function readLs(key: string): string | null {
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

function writeLs(key: string, value: string | null): void {
  try {
    if (value === null) window.localStorage.removeItem(key);
    else window.localStorage.setItem(key, value);
  } catch {
    // Storage blocked — the token simply won't survive a reload.
  }
}

export function getGitToken(cfg: GitContentConfig): string | null {
  return readLs(`agentcms.gitToken:${repoId(cfg)}`);
}

export function setGitToken(cfg: GitContentConfig, token: string | null): void {
  writeLs(`agentcms.gitToken:${repoId(cfg)}`, token?.trim() || null);
}

function readSecrets(cfg: GitContentConfig): SecretBag {
  try {
    return JSON.parse(readLs(`agentcms.gitSecrets:${repoId(cfg)}`) ?? "{}") as SecretBag;
  } catch {
    return {};
  }
}

function writeSecrets(cfg: GitContentConfig, secrets: SecretBag): void {
  // Secrets of config docs that are still present win; docs that lost
  // their secrets (field cleared) drop them.
  writeLs(`agentcms.gitSecrets:${repoId(cfg)}`, JSON.stringify(secrets));
}

// ─── Store ───────────────────────────────────────────────────────────────

interface RemoteState {
  head: string;
  // Layout files, keyed by path relative to the content dir.
  files: Map<string, string>;
  index: LayoutIndex;
  snapshot: Snapshot;
}

function docKey(m: DocMutation): [CollectionName, string] {
  return [m.collection, m.op === "set" ? m.doc.id : m.id];
}

function applyOnto(base: Snapshot, mutations: DocMutation[]): Snapshot {
  const next = Object.fromEntries(Object.entries(base).map(([c, m]) => [c, new Map(m)])) as Snapshot;
  for (const m of mutations) {
    if (m.op === "set") next[m.collection].set(m.doc.id, m.doc);
    else next[m.collection].delete(m.id);
  }
  return next;
}

export interface GitDocStore extends DocStore {
  // Drops the cached transport / identity / remote state — call after
  // the user entered a new token or re-granted folder access, then
  // notify auth subscribers.
  resetSession(): void;
}

export function isGitDocStore(store: DocStore): store is GitDocStore {
  return typeof (store as Partial<GitDocStore>).resetSession === "function";
}

export function createGitDocStore(cfg: GitContentConfig): GitDocStore {
  const contentDir = (cfg.contentDir ?? "").replace(/^\/+|\/+$/g, "");
  const rel = (path: string) => (contentDir ? path.slice(contentDir.length + 1) : path);
  const inContent = (path: string) => !contentDir || path.startsWith(contentDir + "/");

  let transport: GitTransport | null = null;
  let identityPromise: Promise<DocStoreIdentity | null> | null = null;
  let state: RemoteState | null = null;
  // Set after a rebase: our head contains remote changes the core's
  // snapshot hasn't seen yet, so the next poll must reload regardless.
  let stale = false;

  async function openTransport(): Promise<GitTransport | null> {
    if (transport) return transport;
    if (cfg.provider === "local") {
      const handle = await loadFolderHandle(LOCAL_CONTENT_HANDLE_KEY);
      if (!handle || !(await ensureFolderPermission(handle, false))) return null;
      transport = createLocalFsTransport(handle);
      return transport;
    }
    const token = getGitToken(cfg);
    if (!token) return null;
    transport =
      cfg.provider === "github"
        ? createRemoteGitTransport({
            provider: "github",
            owner: cfg.owner ?? "",
            repo: cfg.repo ?? "",
            branch: cfg.branch,
            token,
            apiBaseUrl: cfg.apiBaseUrl,
          })
        : createRemoteGitTransport({
            provider: "gitlab",
            project: cfg.project ?? "",
            branch: cfg.branch,
            token,
            apiBaseUrl: cfg.apiBaseUrl,
          });
    return transport;
  }

  async function requireTransport(): Promise<GitTransport> {
    const t = await openTransport();
    if (!t) throw new Error(i18n.t("docstore.errors.notConnected"));
    return t;
  }

  async function loadRemote(): Promise<RemoteState> {
    const t = await requireTransport();
    const tree = await t.listTree();
    const entries = tree.entries.filter((e) => inContent(e.path) && isLayoutFile(rel(e.path)));
    const texts = await t.readTexts(entries);
    const files = new Map<string, string>();
    for (const [path, text] of texts) files.set(rel(path), text);
    const { snapshot, index } = filesToSnapshot(files);
    mergeSecrets(snapshot, readSecrets(cfg));
    return { head: tree.headSha, files, index, snapshot };
  }

  async function persist(mutations: DocMutation[], before: Snapshot, after: Snapshot, message: string): Promise<void> {
    const t = await requireTransport();
    if (!state) state = await loadRemote();
    let target = after;
    for (let attempt = 0; ; attempt++) {
      const { files, index, secrets } = snapshotToFiles(target, state.index);
      writeSecrets(cfg, secrets);
      const changes: GitChange[] = [];
      for (const [path, content] of files) {
        if (state.files.get(path) !== content) changes.push({ type: "put", path: joinRepoPath(contentDir, path), content });
      }
      for (const path of state.files.keys()) {
        if (!files.has(path)) changes.push({ type: "delete", path: joinRepoPath(contentDir, path) });
      }
      if (changes.length === 0) return;
      try {
        // Content commits change no published file (publishing is its own
        // commit): "[skip ci]" spares a Pages / CI build when the content
        // shares the site's repository.
        const head = await t.commit(changes, { message: `${message} — AgentCMS [skip ci]`, expectedHeadSha: state.head });
        state = { head, files, index, snapshot: target };
        return;
      } catch (err) {
        if (!(err instanceof GitConflictError) || attempt >= MAX_REBASES) throw err;
      }
      // Someone else committed. Rebase only if none of OUR documents
      // changed remotely since the snapshot we edited.
      const remote = await loadRemote();
      for (const m of mutations) {
        const [collection, id] = docKey(m);
        const base = JSON.stringify(before[collection].get(id) ?? null);
        const theirs = JSON.stringify(remote.snapshot[collection].get(id) ?? null);
        if (base !== theirs) {
          state = remote;
          stale = true;
          throw new DocConflictError(i18n.t("docstore.errors.conflict"), collection, id);
        }
      }
      state = remote;
      stale = true;
      target = applyOnto(remote.snapshot, mutations);
    }
  }

  const store = createDocStore({
    kind: "markdown-git",
    pollIntervalMs: cfg.provider === "local" ? 10_000 : 30_000,

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
            const email =
              cfg.provider === "github"
                ? `${p.login}@users.noreply.github.com`
                : cfg.provider === "gitlab"
                  ? `${p.login}@users.noreply.gitlab.com`
                  : "local@localhost";
            return {
              uid: `${t.kind}:${p.login}`,
              email,
              displayName: p.login,
              role: p.isAdmin ? "admin" : "editor",
            } satisfies DocStoreIdentity;
          } catch {
            return null;
          }
        })();
        identityPromise.then((id) => {
          // Don't cache "signed out" — a token entered later must be picked up.
          if (!id) {
            identityPromise = null;
            transport = null;
          }
        });
      }
      return identityPromise;
    },
  });

  return Object.assign(store, {
    resetSession() {
      transport = null;
      identityPromise = null;
      state = null;
      stale = false;
    },
  });
}
