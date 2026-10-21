import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { collection, getCountFromServer } from "firebase/firestore";
import { Database, Loader2, RefreshCw } from "lucide-react";
import { collections, getDb } from "../../services/firebaseClient";
import { countPosts } from "../../services/posts";
import { fetchAllTerms } from "../../services/taxonomies";
import { listAllMedia } from "../../services/media";
import { subscribeToUsers } from "../../services/users";
import { getBackendKind } from "../../lib/runtimeConfig";

interface Counts {
  posts: number;
  pages: number;
  terms: number;
  media: number;
  users: number;
  total: number;
}

type LoadState =
  | { kind: "loading" }
  | { kind: "ok"; counts: Counts }
  | { kind: "error" };

// Firestore counts via getCountFromServer aggregation queries — one
// read per call, regardless of corpus size. countPosts already
// type-filters internally; the other collections need no filter.
// Other backends have no aggregation queries: they list through the
// dispatchers (in memory for the document stores, one query each for
// SQLite) and count client-side.
function countUsers(): Promise<number> {
  return new Promise((resolve, reject) => {
    let unsubscribe: (() => void) | null = null;
    let settled = false;
    unsubscribe = subscribeToUsers(
      (users) => {
        if (settled) return;
        settled = true;
        resolve(users.length);
        // The first snapshot may arrive synchronously, before
        // subscribeToUsers returned the unsubscribe function.
        queueMicrotask(() => unsubscribe?.());
      },
      (err) => reject(err),
    );
  });
}

async function loadCountsGeneric(): Promise<Counts> {
  const [posts, pages, terms, media, users] = await Promise.all([
    countPosts({ type: "post" }),
    countPosts({ type: "page" }),
    fetchAllTerms().then((list) => list.length),
    listAllMedia().then((list) => list.length),
    countUsers(),
  ]);
  return { posts, pages, terms, media, users, total: posts + pages + terms + media + users };
}

async function loadCounts(): Promise<Counts> {
  if (getBackendKind() !== "firebase") return loadCountsGeneric();
  const db = getDb();
  const ref = (name: string) => collection(db, name);
  const [posts, pages, termsSnap, mediaSnap, usersSnap] = await Promise.all([
    countPosts({ type: "post" }),
    countPosts({ type: "page" }),
    getCountFromServer(ref(collections.terms)),
    getCountFromServer(ref(collections.media)),
    getCountFromServer(ref(collections.users)),
  ]);
  const terms = termsSnap.data().count;
  const media = mediaSnap.data().count;
  const users = usersSnap.data().count;
  return {
    posts,
    pages,
    terms,
    media,
    users,
    total: posts + pages + terms + media + users,
  };
}

export function FirestoreCard() {
  const { t } = useTranslation("flexweg-metrics");
  const [state, setState] = useState<LoadState>({ kind: "loading" });
  const [reloadKey, setReloadKey] = useState(0);
  const isFirebase = getBackendKind() === "firebase";

  useEffect(() => {
    let cancelled = false;
    setState({ kind: "loading" });
    void loadCounts()
      .then((counts) => {
        if (!cancelled) setState({ kind: "ok", counts });
      })
      .catch(() => {
        if (!cancelled) setState({ kind: "error" });
      });
    return () => {
      cancelled = true;
    };
  }, [reloadKey]);

  return (
    <div className="card p-4 space-y-3">
      <div className="flex items-center justify-between gap-2">
        <h3 className="flex items-center gap-2 text-sm font-semibold text-surface-900 dark:text-surface-50">
          <Database className="h-4 w-4 text-surface-500" />
          {t(isFirebase ? "firestore.title" : "firestore.titleContent")}
        </h3>
        {state.kind === "ok" && (
          <button
            type="button"
            className="btn-ghost text-xs"
            onClick={() => setReloadKey((k) => k + 1)}
            aria-label={t("common.refresh")}
            title={t("common.refresh")}
          >
            <RefreshCw className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      {state.kind === "loading" && (
        <div className="flex items-center gap-2 text-xs text-surface-500 dark:text-surface-400">
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
          {t("common.loading")}
        </div>
      )}

      {state.kind === "error" && (
        <p className="text-sm text-red-600 dark:text-red-400">{t("firestore.error")}</p>
      )}

      {state.kind === "ok" && (
        <div className="space-y-2">
          <Row label={t("firestore.posts")} value={state.counts.posts} />
          <Row label={t("firestore.pages")} value={state.counts.pages} />
          <Row label={t("firestore.terms")} value={state.counts.terms} />
          <Row label={t("firestore.media")} value={state.counts.media} />
          <Row label={t("firestore.users")} value={state.counts.users} />
          <div className="pt-2 border-t border-surface-200 dark:border-surface-700">
            <Row label={t("firestore.total")} value={state.counts.total} bold />
          </div>
          {isFirebase && (
            <p className="text-xs text-surface-500 dark:text-surface-400 pt-1">
              {t("firestore.freeTierNote")}
            </p>
          )}
        </div>
      )}
    </div>
  );
}

function Row({ label, value, bold }: { label: string; value: number; bold?: boolean }) {
  return (
    <div className="flex items-baseline justify-between gap-2 text-sm">
      <span className={bold ? "font-semibold" : "text-surface-600 dark:text-surface-300"}>
        {label}
      </span>
      <span className="tabular-nums font-medium text-surface-900 dark:text-surface-50">
        {value}
      </span>
    </div>
  );
}
