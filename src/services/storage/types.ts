// Contract every PUBLISH connector implements (Flexweg, GitHub Pages,
// S3, …). A publish connector is where rendered output goes — HTML,
// CSS, media variants, JSON data files. It never stores source data:
// that's the data backend's job (services/firebase, services/flexweg-sqlite, …).
//
// Feature code never talks to a connector directly — it goes through
// the facade in services/flexwegApi.ts (uploadFile, deleteFile, …),
// which resolves the active connector, emulates missing capabilities
// and routes writes into a batch when one is open (see ./batch.ts).

export type StorageAction =
  | "upload"
  | "delete"
  | "rename"
  | "get"
  | "list"
  | "createFolder"
  | "renameFolder"
  | "deleteFolder"
  | "storageLimits"
  | "commit";

// Single error class for every connector. `status` is the HTTP status
// when there is one (501 is used for "capability not supported").
export class StorageError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly body?: string,
  ) {
    super(message);
    this.name = "StorageError";
  }
}

// How a connector applies writes:
//   - "files"      → each put/delete hits the target immediately (Flexweg, S3, …)
//   - "commit"     → writes are grouped into one commit (GitHub / GitLab / Cloudflare Pages via git)
//   - "deployment" → the whole site is re-deployed as a snapshot (Cloudflare Direct Upload, ZIP)
export type PublishModel = "files" | "commit" | "deployment";

export interface StorageCapabilities {
  // Paginated listing of every file on the target.
  list: boolean;
  // Native single-file rename. Emulated with get + put + delete otherwise.
  rename: boolean;
  renameFolder: boolean;
  // Explicit folders exist on the target. When false, createFolder is a no-op.
  folders: boolean;
  // Native recursive folder delete. Emulated with list + delete otherwise.
  deletePrefix: boolean;
  // Quota / plan usage endpoint (dashboard storage card).
  storageLimits: boolean;
}

export interface PutInput {
  path: string;
  // UTF-8 text, or base64 when encoding === "base64".
  content: string;
  encoding?: "utf-8" | "base64";
}

export type BatchOp =
  | ({ type: "put" } & PutInput)
  | { type: "delete"; path: string }
  | { type: "deletePrefix"; path: string };

export interface ListItem {
  path: string;
  type: "file" | "folder";
  size?: number;
  url?: string;
  depth?: number;
}

export interface ListResponse {
  items: ListItem[];
  page: number;
  per_page: number;
  total?: number;
}

// Shape of Flexweg's GET /files/storage-limits. Kept as the generic
// quota shape so the dashboard card works with any connector that can
// report usage.
export interface StorageLimitsResponse {
  success: boolean;
  plan: { name: string; type: string };
  usage: {
    files: {
      current: number;
      limit: number;
      percentage: number;
      available: number;
    };
    storage: {
      current: number;
      current_formatted: string;
      limit: number;
      limit_formatted: string;
      percentage: number;
      available: number;
      available_formatted: string;
    };
  };
  warnings: {
    files_near_limit: boolean;
    storage_near_limit: boolean;
  };
}

export interface StorageConnector {
  id: string;
  model: PublishModel;
  capabilities: StorageCapabilities;

  put(input: PutInput, signal?: AbortSignal): Promise<void>;
  get(path: string): Promise<string>;
  // Raw bytes; null when the file doesn't exist (no error toast — used
  // to probe for files that may legitimately be missing, e.g. a SQLite
  // database on first install).
  getBytes?(path: string): Promise<Uint8Array | null>;
  // MUST resolve (not throw) when the file is already gone.
  delete(path: string, signal?: AbortSignal): Promise<void>;
  publicUrl(path: string): Promise<string>;

  deletePrefix?(path: string): Promise<void>;
  rename?(oldPath: string, newPath: string): Promise<void>;
  renameFolder?(oldPath: string, newPath: string): Promise<void>;
  createFolder?(path: string): Promise<void>;
  list?(page: number, perPage: number): Promise<ListResponse>;
  storageLimits?(): Promise<StorageLimitsResponse>;

  // Required for "commit" / "deployment" models: applies every op
  // collected during a withStorageBatch() scope in one go. Ops are
  // already de-duplicated (last write per path wins).
  commitBatch?(ops: BatchOp[]): Promise<void>;
}
