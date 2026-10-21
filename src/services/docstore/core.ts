import { COLLECTIONS, type CollectionName, type DocMutation, type DocStore, type DocStoreIdentity, type StoredDoc } from "./types";

// Shared in-memory engine behind every DocStore: snapshot, optimistic
// writes with rollback, serialised persistence, change notification and
// subscriber-driven polling. Concrete stores only provide I/O.

export type Snapshot = Record<CollectionName, Map<string, StoredDoc>>;

export interface DocStoreBackend {
  kind: DocStore["kind"];
  load(): Promise<Snapshot>;
  // Persists `mutations`. `before` is the snapshot they were applied
  // to, `after` the result — stores that write whole files (git) use
  // them to diff.
  persist(mutations: DocMutation[], before: Snapshot, after: Snapshot, message: string): Promise<void>;
  // Returns a fresh snapshot when the source changed since the last
  // load / persist, null otherwise. Omit for sources nobody else writes.
  poll?(): Promise<Snapshot | null>;
  pollIntervalMs?: number;
  identity(): Promise<DocStoreIdentity | null>;
}

export function emptySnapshot(): Snapshot {
  return Object.fromEntries(COLLECTIONS.map((c) => [c, new Map()])) as Snapshot;
}

function cloneSnapshot(s: Snapshot): Snapshot {
  return Object.fromEntries(COLLECTIONS.map((c) => [c, new Map(s[c])])) as Snapshot;
}

// Drops undefined keys (recursively in plain objects) and freezes, so a
// caller can never mutate the snapshot through a returned reference.
export function normalizeDoc<T>(value: T): T {
  if (Array.isArray(value)) return Object.freeze(value.map(normalizeDoc)) as unknown as T;
  if (value && typeof value === "object" && Object.getPrototypeOf(value) === Object.prototype) {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(value)) if (v !== undefined) out[k] = normalizeDoc(v);
    return Object.freeze(out) as T;
  }
  return value;
}

function applyMutations(base: Snapshot, mutations: DocMutation[]): { next: Snapshot; changed: Set<CollectionName> } {
  const next = cloneSnapshot(base);
  const changed = new Set<CollectionName>();
  for (const m of mutations) {
    if (m.op === "set") next[m.collection].set(m.doc.id, normalizeDoc(m.doc));
    else next[m.collection].delete(m.id);
    changed.add(m.collection);
  }
  return { next, changed };
}

function diffCollections(a: Snapshot, b: Snapshot): Set<CollectionName> {
  const changed = new Set<CollectionName>();
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

export function createDocStore(backend: DocStoreBackend): DocStore {
  let snapshot: Snapshot = emptySnapshot();
  let loading: Promise<void> | null = null;
  let queue: Promise<unknown> = Promise.resolve();
  let pending = 0;
  const listeners = new Set<(changed: Set<CollectionName>) => void>();
  let timer: ReturnType<typeof setInterval> | null = null;

  function notify(changed: Set<CollectionName>) {
    if (changed.size === 0) return;
    for (const l of [...listeners]) {
      try {
        l(changed);
      } catch (err) {
        console.error("[docstore] listener failed:", err);
      }
    }
  }

  function ready(): Promise<void> {
    if (!loading) {
      loading = backend.load().then(
        (s) => {
          snapshot = s;
          notify(new Set(COLLECTIONS));
        },
        (err) => {
          loading = null;
          throw err;
        },
      );
    }
    return loading;
  }

  async function refresh(): Promise<void> {
    await ready();
    // Never swap the snapshot under an in-flight write — its rollback
    // base would be wrong. The next tick catches up.
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
    }, backend.pollIntervalMs ?? 30_000);
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
      // Optimistic: visible to readers right away (the editor navigates
      // to a freshly created post before the persist round-trip ends).
      const before = snapshot;
      const { next, changed } = applyMutations(before, mutations);
      snapshot = next;
      notify(changed);
      pending++;
      const run = queue.then(() => backend.persist(mutations, before, next, opts?.message ?? "Update content"));
      queue = run.catch(() => undefined);
      try {
        await run;
      } catch (err) {
        // Roll back only these mutations — later optimistic writes
        // queued behind this one stay applied.
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
    },
  };
}
