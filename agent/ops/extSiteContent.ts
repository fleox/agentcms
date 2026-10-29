import { installBrowserEnv } from "../browserEnv";
import { resolveSite } from "../sites";
import type { StoredDoc } from "../../src/services/docstore/types";
import { openSiteStore } from "./siteData";

// `ext preview --site <alias>`: a read-only copy of a site's real
// content (posts, pages, terms, media records, users, settings). The
// preview renders it into a local folder — nothing is written back to
// the site, and media URLs keep pointing at the live site.

export async function snapshotSiteContent(alias: string) {
  installBrowserEnv();
  const site = resolveSite(alias);
  let content: { posts: StoredDoc[]; terms: StoredDoc[]; users: StoredDoc[]; media: StoredDoc[]; settings: StoredDoc | undefined };
  let registry: { themes?: Array<{ id: string; entryPath?: string }> } | undefined;
  if (site.runtime.backend === "firebase") {
    ({ content, registry } = await snapshotFirebase(site));
  } else {
    const store = await openSiteStore(site);
    const copy = (c: Parameters<typeof store.list>[0]) => store.list(c).map((d) => structuredClone(d) as StoredDoc);
    content = {
      posts: copy("posts"),
      terms: copy("terms"),
      users: copy("users"),
      media: copy("media"),
      settings: copy("settings").find((d) => d.id === "site"),
    };
    registry = store.get("config", "externalRegistry") as typeof registry;
  }
  // The site's active theme bundle (read from the hosting), so a plugin
  // previews inside the theme the site really uses.
  let themeBundle: string | null = null;
  const active = (content.settings as { activeThemeId?: string } | undefined)?.activeThemeId;
  if (active && active !== "default") {
    const entry = registry?.themes?.find((t) => t.id === active);
    const { readAdminFile, siteHostingReader } = await import("./adminFiles");
    const file = await readAdminFile(site, entry?.entryPath ?? `themes/${active}/bundle.js`, await siteHostingReader(site)).catch(() => null);
    themeBundle = file?.text ?? null;
  }
  // Back to an inert config: the preview runs on an in-memory store.
  const { resetRuntimeConfigCache } = await import("../../src/lib/runtimeConfig");
  const { resetDocStore } = await import("../../src/services/docstore");
  window.__AGENTCMS_CONFIG__ = { backend: "local" };
  resetRuntimeConfigCache();
  resetDocStore();
  return { alias: site.alias, content, themeBundle };
}

// Firebase content, read through the same services as the admin, as
// docstore documents (dates in epoch ms) for the in-memory preview store.
async function snapshotFirebase(site: ReturnType<typeof resolveSite>) {
  const { connectSiteData } = await import("./session");
  await connectSiteData(site);
  const { fetchAllPosts, invalidateAllPostsCache } = await import("../../src/services/posts");
  const { fetchAllTerms } = await import("../../src/services/taxonomies");
  const { listAllMedia } = await import("../../src/services/media");
  const { subscribeToUsers } = await import("../../src/services/users");
  const { getSettings } = await import("../../src/services/settings");
  const { readBackendRegistryForCli } = await import("./sessionRegistry");
  invalidateAllPostsCache();
  const users = await new Promise<unknown[]>((resolve, reject) => {
    let unsub: (() => void) | null = null;
    let done = false;
    unsub = subscribeToUsers(
      (list) => {
        if (done) return;
        done = true;
        resolve(list);
        queueMicrotask(() => unsub?.());
      },
      (e) => {
        if (!done) reject(e);
        done = true;
      },
    );
    if (done) unsub?.();
  });
  const [posts, pages, terms, media, settings, registry] = await Promise.all([
    fetchAllPosts({ type: "post" }),
    fetchAllPosts({ type: "page" }),
    fetchAllTerms(),
    listAllMedia(),
    getSettings(),
    readBackendRegistryForCli(),
  ]);
  const docs = (list: unknown[]) => list.map((d) => plain(d) as StoredDoc);
  return {
    content: {
      posts: docs([...posts, ...pages]),
      terms: docs(terms),
      users: docs(users),
      media: docs(media),
      settings: { ...(plain(settings) as object), id: "site" } as StoredDoc,
    },
    registry: (registry ?? undefined) as { themes?: Array<{ id: string; entryPath?: string }> } | undefined,
  };
}

// Firestore Timestamps → epoch ms (the docstore's date format), deep.
function plain(v: unknown): unknown {
  if (v == null || typeof v !== "object") return v;
  const t = v as { toMillis?: () => number };
  if (typeof t.toMillis === "function") return t.toMillis();
  if (v instanceof Date) return v.getTime();
  if (Array.isArray(v)) return v.map(plain);
  return Object.fromEntries(Object.entries(v as Record<string, unknown>).map(([k, x]) => [k, plain(x)]));
}
