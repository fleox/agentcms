import { createRequire as __acmsRequire } from "node:module";
import { fileURLToPath as __acmsPath } from "node:url";
import { dirname as __acmsDirname } from "node:path";
const require2 = __acmsRequire(import.meta.url);
const __filename = __acmsPath(import.meta.url);
const __dirname = __acmsDirname(__filename);
import { e as adminUrlOf, k as fetchText } from "../agentcms.mjs";
import "node:util";
import "node:fs";
import "node:path";
import "node:url";
import "node:os";
import "node:child_process";
import "node:http";
async function siteHostingReader(site) {
  try {
    const { siteHostingTarget } = await import("./siteData-Ce1sKj4P.mjs");
    const { hostingConnector } = await import("./hosting-CTlA-J0b.mjs");
    return hostingConnector(siteHostingTarget(site));
  } catch {
    return null;
  }
}
async function readAdminFile(site, relPath, reader, opts = {}) {
  const rel = relPath.replace(/^\/+/, "");
  const accept = opts.accept ?? (() => true);
  if (reader?.getBytes && site.adminFolder) {
    try {
      const bytes = await reader.getBytes(`${site.adminFolder}/${rel}`);
      if (bytes) {
        const text = new TextDecoder().decode(bytes);
        if (accept(text)) return { text, source: "hosting" };
      }
    } catch {
    }
  }
  const adminUrl = adminUrlOf(site);
  if (adminUrl) {
    const q = opts.cacheKey ? `?v=${encodeURIComponent(opts.cacheKey)}` : "";
    const res = await fetchText(`${adminUrl}${rel}${q}`);
    if (res.ok && !/^\s*</.test(res.text) && accept(res.text)) return { text: res.text, source: "site" };
  }
  const { existsSync, readFileSync } = await import("node:fs");
  const { join } = await import("node:path");
  const { distRoot } = await import("../agentcms.mjs").then((n) => n.y);
  const local = join(distRoot(), "admin", rel);
  if (existsSync(local)) {
    const text = readFileSync(local, "utf8");
    if (accept(text)) return { text, source: "local" };
  }
  return null;
}
function parseRegistry(text) {
  try {
    const v = JSON.parse(text);
    if (Array.isArray(v.plugins) || Array.isArray(v.themes)) return { plugins: v.plugins ?? [], themes: v.themes ?? [] };
  } catch {
  }
  return null;
}
async function fallbackRegistry(site, reader) {
  for (const file of ["external.json", "external.default.json"]) {
    const f = await readAdminFile(site, file, reader, { accept: (t) => parseRegistry(t) != null });
    if (f) return parseRegistry(f.text);
  }
  return { plugins: [], themes: [] };
}
const bundledCache = /* @__PURE__ */ new Map();
async function loadBundledPluginManifests(skip = /* @__PURE__ */ new Set(), kind = "plugins") {
  let all = bundledCache.get(kind);
  if (!all) {
    all = importBundled(kind);
    bundledCache.set(kind, all);
  }
  return (await all).filter((e) => !skip.has(e.id)).map((e) => e.manifest);
}
async function importBundled(kind) {
  const { existsSync, readFileSync } = await import("node:fs");
  const { join } = await import("node:path");
  const { distRoot } = await import("../agentcms.mjs").then((n) => n.y);
  const { importExtensionBundle } = await import("./extHost-l9QNBuO-.mjs");
  const root = join(distRoot(), "admin");
  const file = join(root, "external.default.json");
  if (!existsSync(file)) return [];
  const registry = parseRegistry(readFileSync(file, "utf8"));
  const out = [];
  for (const entry of registry?.[kind] ?? []) {
    const bundle = join(root, entry.entryPath ?? `${kind}/${entry.id}/bundle.js`);
    if (!existsSync(bundle)) continue;
    try {
      const { manifest } = await importExtensionBundle(readFileSync(bundle, "utf8"));
      if (manifest?.id === entry.id) out.push({ id: entry.id, manifest });
    } catch {
    }
  }
  return out;
}
export {
  fallbackRegistry,
  loadBundledPluginManifests,
  readAdminFile,
  siteHostingReader
};
