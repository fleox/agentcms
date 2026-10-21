// Document-store implementation of the terms (categories + tags)
// service, shared by the "markdown-git" and "local" backends. Mirrors
// the function signatures of services/firebase/taxonomies.ts so the
// top-level dispatcher can swap impls based on backend.
//
// Docs are stored camelCase with plain JSON values (seo, translations)
// and dates as epoch millis, converted to `Timestamp` at the boundary.
// Like the other impls, deleteTerm does NOT touch posts that reference
// the term — the publisher / editor already tolerate dangling ids.

import { getDocStore, newDocId, toTimestamp, type StoredDoc } from "./index";
import type { SeoMeta, Term, TermType } from "../../core/types";

const COLLECTION = "terms" as const;

function hasSeo(seo: unknown): seo is SeoMeta {
  if (!seo || typeof seo !== "object") return false;
  const s = seo as SeoMeta;
  return !!(s.title || s.description || s.ogImage);
}

function docToTerm(d: StoredDoc): Term {
  const term: Term = {
    id: d.id,
    type: d.type as TermType,
    name: (d.name as string) ?? "",
    slug: (d.slug as string) ?? "",
    createdAt: toTimestamp(d.createdAt ?? 0),
    updatedAt: toTimestamp(d.updatedAt ?? d.createdAt ?? 0),
  };
  if (d.description) term.description = d.description as string;
  if (d.parentId) term.parentId = d.parentId as string;
  if (d.lastPublishedPath) term.lastPublishedPath = d.lastPublishedPath as string;
  if (d.translations && typeof d.translations === "object" && Object.keys(d.translations).length > 0) {
    // Deep copy: snapshot docs are frozen, callers may mutate the result.
    term.translations = JSON.parse(JSON.stringify(d.translations)) as Record<string, unknown>;
  }
  if (hasSeo(d.seo)) term.seo = { ...d.seo };
  return term;
}

// name asc, code-unit order (same as Firestore's orderBy / SQLite's
// default BINARY collation).
function compareName(a: Term, b: Term): number {
  return a.name < b.name ? -1 : a.name > b.name ? 1 : 0;
}

function listTerms(): Term[] {
  return getDocStore().list(COLLECTION).map(docToTerm).sort(compareName);
}

function label(d: StoredDoc): string {
  return `${d.type === "tag" ? "tag" : "category"}: ${(d.name as string) || d.id}`;
}

export function subscribeToTerms(
  onChange: (terms: Term[]) => void,
  onError?: (err: Error) => void,
): () => void {
  let cancelled = false;
  let unsubscribe: (() => void) | null = null;
  const emit = () => {
    try {
      onChange(listTerms());
    } catch (err) {
      onError?.(err as Error);
    }
  };
  try {
    const store = getDocStore();
    store.ready().then(
      () => {
        if (cancelled) return;
        unsubscribe = store.subscribe((changed) => {
          if (changed.has(COLLECTION)) emit();
        });
        emit();
      },
      (err) => {
        if (!cancelled) onError?.(err as Error);
      },
    );
  } catch (err) {
    onError?.(err as Error);
  }
  return () => {
    cancelled = true;
    unsubscribe?.();
  };
}

export async function fetchAllTerms(): Promise<Term[]> {
  await getDocStore().ready();
  return listTerms();
}

export interface CreateTermInput {
  type: TermType;
  name: string;
  slug: string;
  description?: string;
  parentId?: string;
}

export async function createTerm(input: CreateTermInput): Promise<string> {
  const id = newDocId();
  const now = Date.now();
  const doc: StoredDoc = {
    id,
    type: input.type,
    name: input.name,
    slug: input.slug,
    createdAt: now,
    updatedAt: now,
  };
  if (input.description) doc.description = input.description;
  if (input.parentId) doc.parentId = input.parentId;
  const store = getDocStore();
  await store.ready();
  await store.write([{ op: "set", collection: COLLECTION, doc }], {
    message: `Create ${label(doc)}`,
  });
  return id;
}

export async function updateTerm(
  id: string,
  patch: Partial<Pick<Term, "name" | "slug" | "description" | "parentId" | "translations" | "seo">>,
): Promise<void> {
  const store = getDocStore();
  await store.ready();
  const existing = store.get(COLLECTION, id);
  if (!existing) throw new Error(`Term not found: ${id}`);
  const next: StoredDoc = { ...existing };
  const assign = (key: string, value: unknown, keep: boolean) => {
    if (value === undefined) return;
    if (value === null || !keep) delete next[key];
    else next[key] = value;
  };
  assign("name", patch.name, true);
  assign("slug", patch.slug, true);
  assign("description", patch.description, !!patch.description);
  assign("parentId", patch.parentId, !!patch.parentId);
  assign(
    "translations",
    patch.translations,
    !!patch.translations && Object.keys(patch.translations).length > 0,
  );
  // Empty SEO block = cleared, like the SQLite impl.
  assign("seo", patch.seo, hasSeo(patch.seo));
  next.updatedAt = Date.now();
  await store.write([{ op: "set", collection: COLLECTION, doc: next }], {
    message: `Update ${label(next)}`,
  });
}

// Deleting a missing term is a no-op (like Firestore's deleteDoc).
export async function deleteTerm(id: string): Promise<void> {
  const store = getDocStore();
  await store.ready();
  const existing = store.get(COLLECTION, id);
  if (!existing) return;
  await store.write([{ op: "delete", collection: COLLECTION, id }], {
    message: `Delete ${label(existing)}`,
  });
}
