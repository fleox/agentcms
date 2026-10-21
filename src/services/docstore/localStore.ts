import { createKvStore } from "../storage/kvStore";
import { createDocStore, emptySnapshot } from "./core";
import type { CollectionName, DocStore, StoredDoc } from "./types";

// "local" document store: single-user content kept in this browser's
// IndexedDB. No login, no server, works offline — meant for an admin
// running on the user's own machine (npm run dev, or dist/admin opened
// from a local web server). Nobody else writes the data, so no polling.
//
// Data is tied to this browser profile: use Settings → Export to back
// it up or move it to another backend.

const kv = createKvStore<StoredDoc>("flexweg-local-data", "docs");

const keyOf = (collection: CollectionName, id: string) => `${collection}/${id}`;

export function createLocalDocStore(): DocStore {
  return createDocStore({
    kind: "local",

    async load() {
      const snapshot = emptySnapshot();
      for (const [key, doc] of await kv.entries()) {
        const slash = key.indexOf("/");
        const collection = key.slice(0, slash) as CollectionName;
        if (snapshot[collection]) snapshot[collection].set(doc.id, doc);
      }
      return snapshot;
    },

    async persist(mutations) {
      for (const m of mutations) {
        if (m.op === "set") await kv.set(keyOf(m.collection, m.doc.id), m.doc);
        else await kv.delete(keyOf(m.collection, m.id));
      }
    },

    async identity() {
      return { uid: "local", email: "local@localhost", displayName: "Local admin", role: "admin" };
    },
  });
}
