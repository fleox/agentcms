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
  const store = await openSiteStore(site);
  const copy = (c: Parameters<typeof store.list>[0]) => store.list(c).map((d) => structuredClone(d) as StoredDoc);
  const content = {
    posts: copy("posts"),
    terms: copy("terms"),
    users: copy("users"),
    media: copy("media"),
    settings: copy("settings").find((d) => d.id === "site"),
  };
  // Back to an inert config: the preview runs on an in-memory store.
  const { resetRuntimeConfigCache } = await import("../../src/lib/runtimeConfig");
  const { resetDocStore } = await import("../../src/services/docstore");
  window.__AGENTCMS_CONFIG__ = { backend: "local" };
  resetRuntimeConfigCache();
  resetDocStore();
  return { alias: site.alias, content };
}
