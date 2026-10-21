import { Timestamp } from "firebase/firestore";
import { getRuntimeConfig } from "../../lib/runtimeConfig";
import { createDocStore, emptySnapshot, type Snapshot } from "./core";
import { createGitDocStore } from "./gitStore";
import { createLocalDocStore } from "./localStore";
import { createSqliteFileDocStore } from "./sqliteFileStore";
import type { DocStore, DocStoreIdentity } from "./types";

export * from "./types";

// Active document store, created lazily from the runtime config the
// first time a docstore-backed service is called (same lazy pattern as
// the dispatchers — never at module init).

let active: DocStore | null = null;

export function getDocStore(): DocStore {
  if (active) return active;
  const config = getRuntimeConfig();
  if (config?.backend === "markdown-git") active = createGitDocStore(config.git);
  else if (config?.backend === "sqlite-file") active = createSqliteFileDocStore(config.sqlite);
  else if (config?.backend === "local") active = createLocalDocStore();
  else throw new Error("No document store for the active backend.");
  return active;
}

// Tests: install a specific store (typically createMemoryDocStore()).
export function setDocStoreForTests(store: DocStore | null): void {
  active = store;
}

// In-memory store — tests, and a safe fallback nobody persists to.
export function createMemoryDocStore(
  seed?: Partial<Record<keyof Snapshot, Array<{ id: string; [k: string]: unknown }>>>,
  identity: DocStoreIdentity | null = { uid: "local", email: "", displayName: "Local", role: "admin" },
): DocStore {
  return createDocStore({
    kind: "local",
    async load() {
      const s = emptySnapshot();
      for (const [c, docs] of Object.entries(seed ?? {})) {
        for (const d of docs ?? []) s[c as keyof Snapshot].set(d.id, d);
      }
      return s;
    },
    async persist() {},
    async identity() {
      return identity;
    },
  });
}

// ─── Boundary helpers for the domain services ───────────────────────────

export function toMillis(value: unknown): number | undefined {
  if (value == null) return undefined;
  if (typeof value === "number") return value;
  if (value instanceof Timestamp) return value.toMillis();
  if (value instanceof Date) return value.getTime();
  if (typeof value === "string") {
    const ms = Date.parse(value);
    return Number.isNaN(ms) ? undefined : ms;
  }
  // serverTimestamp() sentinel and friends → "now".
  return Date.now();
}

export function toTimestamp(value: unknown): Timestamp | undefined {
  const ms = toMillis(value);
  return ms === undefined ? undefined : Timestamp.fromMillis(ms);
}

// Collision-free ids without a server: 20 chars like Firestore auto-ids.
export function newDocId(): string {
  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  const bytes = crypto.getRandomValues(new Uint8Array(20));
  return [...bytes].map((b) => alphabet[b % alphabet.length]).join("");
}
