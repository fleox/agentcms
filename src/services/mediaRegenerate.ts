// Re-crops existing media for the active theme: after a theme switch,
// media uploaded under the previous theme lack the new theme's formats
// (templates then fall back to another size — wrong crop, grey bands).
// The source is the high-fidelity `admin-original` variant every upload
// keeps for exactly this (else the largest variant available).

import { ADMIN_FORMATS } from "./imageFormats";
import { blobToBase64, extensionForMime, mergeFormats, processImage } from "./imageProcessing";
import { publicUrlFor, uploadFile } from "./siteFiles";
import { getActiveStorageConnector } from "./storage/registry";
import { setMediaFormats } from "./media";
import { getActiveTheme } from "../themes";
import type { ImageFormat, Media, MediaVariant, SiteSettings } from "../core/types";

export interface MediaRegenPlan {
  id: string;
  name: string;
  // Theme formats to (re)generate.
  formats: string[];
  // Why nothing can be done (legacy single-file media, no source).
  skipped?: string;
}

function themeFormats(settings: SiteSettings | undefined) {
  let config;
  try {
    config = getActiveTheme(settings?.activeThemeId ?? "default").imageFormats;
  } catch {
    config = undefined;
  }
  const merged = mergeFormats(ADMIN_FORMATS, config);
  const own = Object.keys(config?.formats ?? {});
  return { merged, own };
}

// A stored variant matches its spec when it exists and, for cropped
// formats, has the exact size (a "contain" fit depends on the source).
function isStale(variant: MediaVariant | undefined, spec: ImageFormat): boolean {
  if (!variant) return true;
  if ((spec.fit ?? "cover") === "cover" && variant.width && variant.height) {
    return variant.width !== spec.width || variant.height !== spec.height;
  }
  return false;
}

function sourceVariant(media: Media): string | null {
  const formats = media.formats ?? {};
  if (formats["admin-original"]) return "admin-original";
  let best: string | null = null;
  let area = 0;
  for (const [name, v] of Object.entries(formats)) {
    const a = (v.width ?? 0) * (v.height ?? 0);
    if (a > area) {
      area = a;
      best = name;
    }
  }
  return best;
}

export function planMediaRegeneration(media: Media[], settings: SiteSettings | undefined, opts: { all?: boolean } = {}): MediaRegenPlan[] {
  const { merged, own } = themeFormats(settings);
  return media.map((m) => {
    if (!m.storageBase || !m.formats) return { id: m.id, name: m.name, formats: [], skipped: "legacy single-file media (no variants to re-crop from)" };
    if (!sourceVariant(m)) return { id: m.id, name: m.name, formats: [], skipped: "no source variant" };
    const formats = own.filter((name) => opts.all || isStale(m.formats?.[name], merged.formats[name]));
    return { id: m.id, name: m.name, formats };
  });
}

async function readVariantBytes(media: Media, name: string): Promise<Uint8Array> {
  const variant = media.formats![name];
  const ext = variant.url.split("?")[0].split(".").pop() ?? "webp";
  const path = `${media.storageBase}/${name}.${ext}`;
  // From the hosting itself when the connector can (a fresh upload may
  // not be served yet on Pages hosts / CDNs), else over HTTP.
  const connector = await getActiveStorageConnector();
  if (connector.getBytes) {
    const bytes = await connector.getBytes(path);
    if (bytes) return bytes;
  }
  const res = await fetch(variant.url, { cache: "no-store" });
  if (!res.ok) throw new Error(`could not read ${name} (HTTP ${res.status})`);
  return new Uint8Array(await res.arrayBuffer());
}

// Generates the planned formats of one media, uploads them next to its
// other variants and records them. Returns the regenerated names.
export async function regenerateMediaFormats(media: Media, formatNames: string[], settings: SiteSettings | undefined): Promise<string[]> {
  if (!formatNames.length || !media.storageBase) return [];
  const { merged } = themeFormats(settings);
  const source = sourceVariant(media);
  if (!source) throw new Error("no source variant");
  const bytes = await readVariantBytes(media, source);
  const sourceMime = media.contentType || "image/webp";
  const file = new File([bytes as BlobPart], `${source}.${extensionForMime(sourceMime)}`, { type: sourceMime });
  const wanted: Record<string, ImageFormat> = {};
  for (const name of formatNames) if (merged.formats[name]) wanted[name] = merged.formats[name];
  const variants = await processImage(file, { formats: wanted, outputMime: merged.outputMime, quality: merged.quality });
  const ext = extensionForMime(merged.outputMime);
  const out: Record<string, MediaVariant> = {};
  for (const v of variants) {
    const path = `${media.storageBase}/${v.name}.${ext}`;
    await uploadFile({ path, content: await blobToBase64(v.blob), encoding: "base64" });
    out[v.name] = { url: await publicUrlFor(path), width: v.width, height: v.height, bytes: v.bytes };
  }
  const all = { ...(media.formats ?? {}), ...out };
  const size = Object.values(all).reduce((n, v) => n + (v.bytes ?? 0), 0);
  await setMediaFormats(media.id, out, size);
  return Object.keys(out);
}
