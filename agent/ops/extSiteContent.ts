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
  // The site's active theme bundle (read from the hosting), so a plugin
  // previews inside the theme the site really uses.
  let themeBundle: string | null = null;
  const active = (content.settings as { activeThemeId?: string } | undefined)?.activeThemeId;
  if (active && active !== "default") {
    const registry = store.get("config", "externalRegistry") as { themes?: Array<{ id: string; entryPath?: string }> } | undefined;
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
