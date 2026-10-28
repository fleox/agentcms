import { Timestamp } from "firebase/firestore";
import { isDocStoreBackend, getBackendKind } from "../lib/runtimeConfig";
import { getDocStore, type CollectionName, type DocMutation, type StoredDoc } from "./docstore";
import { splitSecrets } from "./docstore/markdownLayout";
import { readRegistry } from "./externalRegistryStore";
import { listAllMedia } from "./media";
import { fetchAllPosts, invalidateAllPostsCache } from "./posts";
import { getSettings } from "./settings";
import { getStorageConfig } from "./storageConfig";
import { fetchAllTerms } from "./taxonomies";
import { subscribeToUsers } from "./users";

// Backend-to-backend content transfer. Exports everything the admin
// owns (posts, pages, terms, media metadata, user profiles, settings,
// installed externals, publish target) from ANY backend as one JSON
// file, and imports such a file into a document-store backend
// (Markdown-in-git or local) with ids preserved — so references between
// posts, terms, media and authors keep working.
//
// Not transferred: media binaries (they stay on the publish target —
// their URLs keep working as long as that target is online) and
// secrets (API keys / tokens are stripped; re-enter them in Settings).

export const EXPORT_FORMAT = "agentcms-export";

export interface ContentExport {
  format: typeof EXPORT_FORMAT;
  version: 1;
  exportedAt: string;
  backend: string;
  collections: Partial<Record<CollectionName, StoredDoc[]>>;
}

// Timestamps → epoch ms; undefined dropped. Everything else is JSON already.
function toPlain(value: unknown): unknown {
  if (value instanceof Timestamp) return value.toMillis();
  if (value instanceof Date) return value.getTime();
  if (Array.isArray(value)) return value.map(toPlain);
  if (value && typeof value === "object") {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(value)) if (v !== undefined) out[k] = toPlain(v);
    return out;
  }
  return value;
}

function docs<T extends { id: string }>(list: T[]): StoredDoc[] {
  return list.map((d) => toPlain(d) as StoredDoc);
}

function readUsersOnce(): Promise<Array<{ id: string }>> {
  return new Promise((resolve, reject) => {
    let unsubscribe: (() => void) | null = null;
    let settled = false;
    unsubscribe = subscribeToUsers(
      (users) => {
        if (settled) return;
        settled = true;
        resolve(users as Array<{ id: string }>);
        queueMicrotask(() => unsubscribe?.());
      },
      reject,
    );
  });
}

function isEmptyRegistry(value: unknown): boolean {
  const r = value as { plugins?: unknown[]; themes?: unknown[] } | null;
  return !r || ((r.plugins?.length ?? 0) === 0 && (r.themes?.length ?? 0) === 0);
}

export async function exportContent(): Promise<ContentExport> {
  const [posts, pages, terms, media, users, settings, registry, storage] = await Promise.all([
    fetchAllPosts({ type: "post" }),
    fetchAllPosts({ type: "page" }),
    fetchAllTerms(),
    listAllMedia(),
    readUsersOnce(),
    getSettings(),
    readRegistry().catch(() => null),
    getStorageConfig().catch(() => null),
  ]);
  const config: StoredDoc[] = [];
  // An empty registry means "nothing read" (e.g. a headless export before
  // the admin ever stored one), never "no plugins": leave it out so an
  // import keeps the target's plugins and theme.
  if (registry && !isEmptyRegistry(registry)) config.push({ ...(toPlain(registry) as Record<string, unknown>), id: "externalRegistry" });
  if (storage) config.push({ ...(splitSecrets(toPlain(storage) as Record<string, unknown>).clean), id: "storage" });
  return {
    format: EXPORT_FORMAT,
    version: 1,
    exportedAt: new Date().toISOString(),
    backend: getBackendKind() ?? "unknown",
    collections: {
      posts: docs([...posts, ...pages]),
      terms: docs(terms),
      media: docs(media),
      users: docs(users),
      settings: [{ ...(toPlain(settings) as Record<string, unknown>), id: "site" }],
      config,
    },
  };
}

export function isContentExport(value: unknown): value is ContentExport {
  return (
    !!value &&
    typeof value === "object" &&
    (value as ContentExport).format === EXPORT_FORMAT &&
    (value as ContentExport).version === 1 &&
    typeof (value as ContentExport).collections === "object"
  );
}

export function canImportContent(): boolean {
  return isDocStoreBackend(getBackendKind());
}

// Merge: docs with the same id are overwritten, others kept. Replace:
// the collections present in the file are emptied first. Either way
// it's ONE write (one commit on git).
export async function importContent(
  data: ContentExport,
  mode: "merge" | "replace" = "merge",
): Promise<Record<string, number>> {
  if (!canImportContent()) throw new Error("Import is only available on document-store backends.");
  const store = getDocStore();
  await store.ready();
  const mutations: DocMutation[] = [];
  const counts: Record<string, number> = {};
  for (const [collection, list] of Object.entries(data.collections) as Array<[CollectionName, StoredDoc[]]>) {
    if (!Array.isArray(list)) continue;
    if (mode === "replace") {
      for (const existing of store.list(collection)) mutations.push({ op: "delete", collection, id: existing.id });
    }
    for (const doc of list) {
      if (!doc || typeof doc.id !== "string") continue;
      // Exports made before this check could carry an empty registry:
      // importing it would unload every plugin and theme of the site.
      if (collection === "config" && doc.id === "externalRegistry" && isEmptyRegistry(doc)) continue;
      mutations.push({ op: "set", collection, doc });
    }
    counts[collection] = list.length;
  }
  await store.write(mutations, { message: `Import content (${data.backend} export of ${data.exportedAt})` });
  invalidateAllPostsCache();
  return counts;
}
