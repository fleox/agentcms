import type { ExternalManifest } from "../../src/services/externalRegistry";
import type { StorageConnector } from "../../src/services/storage/types";
import { adminUrlOf, fetchText } from "../remote";
import type { SiteRecord } from "../sites";

// Files of a site's hosted admin (extension bundles, external.default.json),
// read the way that always gives the current version:
//   1. straight from the hosting (the repo head / the bucket) — what was
//      last written, even while a Pages host is still building or a CDN
//      still serves an older copy;
//   2. the served admin (sites without a hosting credential);
//   3. this tool's own build (bundled files of an admin not served yet).

export type AdminFileSource = "hosting" | "site" | "local";

export interface AdminFile {
  text: string;
  source: AdminFileSource;
}

// The site's hosting connector, or null when it can't be built here (no
// hosting credential recorded, unknown connector).
export async function siteHostingReader(site: SiteRecord): Promise<StorageConnector | null> {
  try {
    const { siteHostingTarget } = await import("./siteData");
    const { hostingConnector } = await import("./hosting");
    return hostingConnector(siteHostingTarget(site));
  } catch {
    return null;
  }
}

export async function readAdminFile(
  site: SiteRecord,
  relPath: string,
  reader: StorageConnector | null,
  opts: { cacheKey?: string; accept?: (text: string) => boolean } = {},
): Promise<AdminFile | null> {
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
      /* next source */
    }
  }
  const adminUrl = adminUrlOf(site);
  if (adminUrl) {
    const q = opts.cacheKey ? `?v=${encodeURIComponent(opts.cacheKey)}` : "";
    const res = await fetchText(`${adminUrl}${rel}${q}`);
    // Static hosts answer missing files with an HTML 404 / SPA page.
    if (res.ok && !/^\s*</.test(res.text) && accept(res.text)) return { text: res.text, source: "site" };
  }
  const { existsSync, readFileSync } = await import("node:fs");
  const { join } = await import("node:path");
  const { distRoot } = await import("../paths");
  const local = join(distRoot(), "admin", rel);
  if (existsSync(local)) {
    const text = readFileSync(local, "utf8");
    if (accept(text)) return { text, source: "local" };
  }
  return null;
}

function parseRegistry(text: string): ExternalManifest | null {
  try {
    const v = JSON.parse(text) as Partial<ExternalManifest>;
    if (Array.isArray(v.plugins) || Array.isArray(v.themes)) return { plugins: v.plugins ?? [], themes: v.themes ?? [] };
  } catch {
    /* not a registry */
  }
  return null;
}

// What the admin falls back to on its first boot when the content store
// has no registry yet: a legacy external.json, else the build's defaults.
export async function fallbackRegistry(site: SiteRecord, reader: StorageConnector | null): Promise<ExternalManifest> {
  for (const file of ["external.json", "external.default.json"]) {
    const f = await readAdminFile(site, file, reader, { accept: (t) => parseRegistry(t) != null });
    if (f) return parseRegistry(f.text)!;
  }
  return { plugins: [], themes: [] };
}

// The plugins bundled with this CLI's admin build (external.default.json),
// imported like the admin loads them — for local renders (ext preview /
// check) that have no hosted admin to read them from.
export async function loadBundledPluginManifests(skip: Set<string> = new Set()): Promise<unknown[]> {
  const { existsSync, readFileSync } = await import("node:fs");
  const { join } = await import("node:path");
  const { distRoot } = await import("../paths");
  const { importExtensionBundle } = await import("./extHost");
  const root = join(distRoot(), "admin");
  const file = join(root, "external.default.json");
  if (!existsSync(file)) return [];
  const registry = parseRegistry(readFileSync(file, "utf8"));
  const out: unknown[] = [];
  for (const entry of registry?.plugins ?? []) {
    if (skip.has(entry.id)) continue;
    const bundle = join(root, entry.entryPath ?? `plugins/${entry.id}/bundle.js`);
    if (!existsSync(bundle)) continue;
    try {
      const { manifest } = await importExtensionBundle(readFileSync(bundle, "utf8"));
      if ((manifest as { id?: string } | null)?.id === entry.id) out.push(manifest);
    } catch {
      /* a broken bundled plugin must not stop a preview */
    }
  }
  return out;
}
