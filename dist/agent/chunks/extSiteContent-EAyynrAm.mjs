import { createRequire as __acmsRequire } from "node:module";
import { fileURLToPath as __acmsPath } from "node:url";
import { dirname as __acmsDirname } from "node:path";
const require2 = __acmsRequire(import.meta.url);
const __filename = __acmsPath(import.meta.url);
const __dirname = __acmsDirname(__filename);
import { a as installBrowserEnv, r as resolveSite } from "../agentcms.mjs";
import { openSiteStore } from "./siteData-x4KE4wb8.mjs";
import "node:util";
import "node:fs";
import "node:path";
import "node:url";
import "node:os";
import "node:child_process";
import "node:crypto";
import "node:http";
async function snapshotSiteContent(alias) {
  installBrowserEnv();
  const site = resolveSite(alias);
  let content;
  let registry;
  if (site.runtime.backend === "firebase") {
    ({ content, registry } = await snapshotFirebase(site));
  } else {
    const store = await openSiteStore(site);
    const copy = (c) => store.list(c).map((d) => structuredClone(d));
    content = {
      posts: copy("posts"),
      terms: copy("terms"),
      users: copy("users"),
      media: copy("media"),
      settings: copy("settings").find((d) => d.id === "site")
    };
    registry = store.get("config", "externalRegistry");
  }
  let themeBundle = null;
  const active = content.settings?.activeThemeId;
  if (active && active !== "default") {
    const entry = registry?.themes?.find((t) => t.id === active);
    const { readAdminFile, siteHostingReader } = await import("./adminFiles-eC_YWSFG.mjs");
    const file = await readAdminFile(site, entry?.entryPath ?? `themes/${active}/bundle.js`, await siteHostingReader(site)).catch(() => null);
    themeBundle = file?.text ?? null;
  }
  const { resetRuntimeConfigCache } = await import("./runtimeConfig-BNLCrrQo.mjs");
  const { resetDocStore } = await import("./registry-4kb4tftS.mjs").then((n) => n.B);
  window.__AGENTCMS_CONFIG__ = { backend: "local" };
  resetRuntimeConfigCache();
  resetDocStore();
  return { alias: site.alias, content, themeBundle };
}
async function snapshotFirebase(site) {
  const { connectSiteData } = await import("./session-CupQfNeq.mjs");
  await connectSiteData(site);
  const { fetchAllPosts, invalidateAllPostsCache } = await import("./posts-BbdeaoFJ.mjs");
  const { fetchAllTerms } = await import("./taxonomies-Ba1K2S4M.mjs");
  const { listAllMedia } = await import("./media-GYEEBV_v.mjs").then((n) => n.n);
  const { subscribeToUsers } = await import("./users-CRpBJpeM.mjs").then((n) => n.u);
  const { getSettings } = await import("./settings-Dp0KgkFG.mjs");
  const { readBackendRegistryForCli } = await import("./sessionRegistry-W9iF4d3C.mjs");
  invalidateAllPostsCache();
  const users = await new Promise((resolve, reject) => {
    let unsub = null;
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
      }
    );
    if (done) unsub?.();
  });
  const [posts, pages, terms, media, settings, registry] = await Promise.all([
    fetchAllPosts({ type: "post" }),
    fetchAllPosts({ type: "page" }),
    fetchAllTerms(),
    listAllMedia(),
    getSettings(),
    readBackendRegistryForCli()
  ]);
  const docs = (list) => list.map((d) => plain(d));
  return {
    content: {
      posts: docs([...posts, ...pages]),
      terms: docs(terms),
      users: docs(users),
      media: docs(media),
      settings: { ...plain(settings), id: "site" }
    },
    registry: registry ?? void 0
  };
}
function plain(v) {
  if (v == null || typeof v !== "object") return v;
  const t = v;
  if (typeof t.toMillis === "function") return t.toMillis();
  if (v instanceof Date) return v.getTime();
  if (Array.isArray(v)) return v.map(plain);
  return Object.fromEntries(Object.entries(v).map(([k, x]) => [k, plain(x)]));
}
export {
  snapshotSiteContent
};
