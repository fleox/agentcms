import { createRequire as __acmsRequire } from "node:module";
import { fileURLToPath as __acmsPath } from "node:url";
import { dirname as __acmsDirname } from "node:path";
const require2 = __acmsRequire(import.meta.url);
const __filename = __acmsPath(import.meta.url);
const __dirname = __acmsDirname(__filename);
import { a as installBrowserEnv, r as resolveSite } from "../agentcms.mjs";
import { openSiteStore } from "./siteData-aCvalF46.mjs";
import "node:util";
import "node:fs";
import "node:path";
import "node:url";
import "node:os";
import "node:child_process";
import "node:http";
async function snapshotSiteContent(alias) {
  installBrowserEnv();
  const site = resolveSite(alias);
  const store = await openSiteStore(site);
  const copy = (c) => store.list(c).map((d) => structuredClone(d));
  const content = {
    posts: copy("posts"),
    terms: copy("terms"),
    users: copy("users"),
    media: copy("media"),
    settings: copy("settings").find((d) => d.id === "site")
  };
  let themeBundle = null;
  const active = content.settings?.activeThemeId;
  if (active && active !== "default") {
    const registry = store.get("config", "externalRegistry");
    const entry = registry?.themes?.find((t) => t.id === active);
    const { readAdminFile, siteHostingReader } = await import("./adminFiles-BLXkISkC.mjs");
    const file = await readAdminFile(site, entry?.entryPath ?? `themes/${active}/bundle.js`, await siteHostingReader(site)).catch(() => null);
    themeBundle = file?.text ?? null;
  }
  const { resetRuntimeConfigCache } = await import("./runtimeConfig-2M2d2Pbu.mjs");
  const { resetDocStore } = await import("./registry-CqDse1x2.mjs").then((n) => n.B);
  window.__AGENTCMS_CONFIG__ = { backend: "local" };
  resetRuntimeConfigCache();
  resetDocStore();
  return { alias: site.alias, content, themeBundle };
}
export {
  snapshotSiteContent
};
