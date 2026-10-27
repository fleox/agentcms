import { buildConfigJsSource, type CmsRuntimeConfig } from "../lib/runtimeConfig";
import { bytesToBase64 } from "./git/encoding";
import { uploadFile, withStorageBatch } from "./siteFiles";
import type { PublishTarget } from "./storage/target";

// Hosting the admin itself on the publish target (GitHub / GitLab /
// Cloudflare Pages, S3, own server…). The running admin copies its own
// files — listed at build time in admin-files.json — into a folder of
// the target, plus a config.js describing the site, so the admin is then
// reachable at <site URL>/<folder>/ for every editor.
//
// config.js never holds secrets (tokens / keys stay in each browser),
// so publishing it next to the admin is safe.

export const DEFAULT_ADMIN_FOLDER = "admin";
export const ADMIN_MANIFEST = "admin-files.json";
const MANIFEST = ADMIN_MANIFEST;

export interface AdminManifest {
  version: string;
  dataSchema?: number;
  files: string[];
}

export function cleanFolder(folder: string): string {
  return folder.trim().replace(/^\/+|\/+$/g, "");
}

export function adminUrlOn(target: PublishTarget, folder: string): string | null {
  const siteUrl = typeof target.settings.siteUrl === "string" ? target.settings.siteUrl.trim().replace(/\/+$/, "") : "";
  return siteUrl ? `${siteUrl}/${cleanFolder(folder)}/` : null;
}

// When this admin is already served from the target (e.g. opened at
// https://user.github.io/site/admin/), returns its folder relative to
// the site root — config.js can then be written next to it directly.
export function currentAdminFolderOn(target: PublishTarget): string | null {
  const siteUrl = typeof target.settings.siteUrl === "string" ? target.settings.siteUrl.trim().replace(/\/+$/, "") : "";
  if (!siteUrl || typeof window === "undefined") return null;
  const here = new URL(".", window.location.href).href.replace(/\/+$/, "");
  if (here === siteUrl || !here.startsWith(siteUrl + "/")) return null;
  return cleanFolder(decodeURIComponent(here.slice(siteUrl.length + 1)));
}

// Self-hosting needs the build manifest — missing under `npm run dev`.
export async function readAdminManifest(): Promise<AdminManifest | null> {
  try {
    const res = await fetch(new URL(MANIFEST, document.baseURI).href, { cache: "no-store" });
    if (!res.ok) return null;
    const data = (await res.json()) as AdminManifest;
    return Array.isArray(data.files) ? data : null;
  } catch {
    return null;
  }
}

export async function uploadConfigJsTo(folder: string, runtime: CmsRuntimeConfig): Promise<void> {
  await uploadFile({ path: `${cleanFolder(folder)}/config.js`, content: buildConfigJsSource(runtime) });
}

// Fresh copy of an admin file — the query string defeats any cache
// layer that ignores `cache: "no-store"` (a stale index.html pointing
// at a previous build's bundle would break the deployed admin).
async function fetchAdminFile(file: string, bust: string): Promise<Uint8Array> {
  const url = new URL(file, document.baseURI);
  url.searchParams.set("v", bust);
  const res = await fetch(url.href, { cache: "no-store" });
  if (!res.ok) throw new Error(`Could not read admin file ${file} (${res.status})`);
  return new Uint8Array(await res.arrayBuffer());
}

// Every ./assets/… or ./runtime/… file index.html loads must be part of
// the copy; otherwise index.html and the manifest come from different
// builds (outdated tab / cache) and the deployed admin would not boot.
export function missingIndexReferences(indexHtml: string, files: string[]): string[] {
  // config.js is generated at deploy time, never part of the manifest.
  const known = new Set([...files, "config.js", MANIFEST]);
  const refs = [...indexHtml.matchAll(/(?:src|href)="\.\/([^"?#]+)"/g)].map((m) => m[1]);
  return refs.filter((ref) => !known.has(ref));
}

// Copies every admin file + config.js into `folder` on the ACTIVE publish
// target, as one batch (one commit on git targets). `onProgress` gets
// (done, total) while files are fetched.
export async function deployAdmin(
  folder: string,
  runtime: CmsRuntimeConfig,
  onProgress?: (done: number, total: number) => void,
): Promise<{ files: number; version: string }> {
  const manifest = await readAdminManifest();
  if (!manifest) throw new Error("admin-files.json not found — deploy from a built admin (npm run build / preview), not npm run dev.");
  const dir = cleanFolder(folder) || DEFAULT_ADMIN_FOLDER;
  const bust = String(Date.now());

  // Check consistency BEFORE uploading anything.
  const indexBytes = await fetchAdminFile("index.html", bust);
  const missing = missingIndexReferences(new TextDecoder().decode(indexBytes), manifest.files);
  if (missing.length > 0) {
    throw new Error(
      `This admin's files don't match its build (${missing.join(", ")}). Reload this page (Cmd/Ctrl + Shift + R) and try again.`,
    );
  }

  await withStorageBatch(async () => {
    let done = 0;
    // index.html last: on "files" targets, a deployment cut halfway must
    // not leave an index.html pointing at bundles that aren't there yet.
    const ordered = [...manifest.files.filter((f) => f !== "index.html"), "index.html"];
    for (const file of ordered) {
      const bytes = file === "index.html" ? indexBytes : await fetchAdminFile(file, bust);
      await uploadFile({ path: `${dir}/${file}`, content: bytesToBase64(bytes), encoding: "base64" });
      onProgress?.(++done, ordered.length);
    }
    await uploadFile({ path: `${dir}/${MANIFEST}`, content: JSON.stringify(manifest, null, 2) + "\n" });
    await uploadConfigJsTo(dir, runtime);
  });
  return { files: manifest.files.length, version: manifest.version };
}
