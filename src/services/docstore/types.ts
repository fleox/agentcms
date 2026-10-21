// Document-store layer shared by the backends that don't have a query
// engine of their own:
//
//   - "markdown-git" — Markdown + JSON files in a GitHub / GitLab repo
//                      (or a local git clone), see gitStore.ts
//   - "sqlite-file"  — one SQLite file on the user's hosting, see sqliteFileStore.ts
//   - "local"        — this browser's IndexedDB, see localStore.ts
//
// Both load the whole dataset in memory (like the admin's "global"
// pagination mode already does) and expose the same tiny API. The
// domain services in this folder (posts.ts, users.ts, …) mirror the
// exports of services/firebase/* and services/flexweg-sqlite/* on top
// of it, so the top-level dispatchers can route to them unchanged.

export type CollectionName = "posts" | "terms" | "media" | "users" | "settings" | "config";

export const COLLECTIONS: CollectionName[] = ["posts", "terms", "media", "users", "settings", "config"];

// JSON-safe document. Dates are epoch milliseconds (numbers); the
// domain services convert to / from firebase `Timestamp` at the
// boundary, exactly like the SQLite services do. Keys holding
// `undefined` are dropped on write.
export interface StoredDoc {
  id: string;
  [key: string]: unknown;
}

export type DocMutation =
  | { op: "set"; collection: CollectionName; doc: StoredDoc }
  | { op: "delete"; collection: CollectionName; id: string };

export interface DocStoreIdentity {
  uid: string;
  email: string;
  displayName: string;
  // Derived from the storage itself: repo permissions for git, always
  // admin for the single-user local store.
  role: "admin" | "editor";
}

export interface DocStore {
  readonly kind: "markdown-git" | "sqlite-file" | "local";

  // Loads the initial snapshot. Idempotent; every other read awaits it.
  ready(): Promise<void>;

  // Synchronous reads from the in-memory snapshot (call ready() first).
  // Returned docs are frozen copies — never mutate them.
  list(collection: CollectionName): StoredDoc[];
  get(collection: CollectionName, id: string): StoredDoc | undefined;

  // Applies mutations to memory immediately (subscribers notified
  // synchronously), then persists. Writes are serialised. On a persist
  // failure the in-memory state is rolled back, subscribers notified
  // again, and the error rethrown (DocConflictError when someone else
  // changed the same document in the meantime).
  write(mutations: DocMutation[], opts?: { message?: string }): Promise<void>;

  // Fires after any change (local write, rollback, or remote change
  // picked up by polling). While at least one listener is registered
  // the store polls its source (~30 s for git, never for local).
  subscribe(listener: (changed: Set<CollectionName>) => void): () => void;

  // Pull remote changes now.
  refresh(): Promise<void>;

  identity(): Promise<DocStoreIdentity | null>;
}

export class DocConflictError extends Error {
  constructor(
    message: string,
    public readonly collection: CollectionName,
    public readonly id: string,
  ) {
    super(message);
    this.name = "DocConflictError";
  }
}
