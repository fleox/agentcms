// Document-store implementation of the media service, shared by the
// "markdown-git" and "local" backends. The image-processing pipeline
// (services/imageProcessing.ts) is browser-side and stays unchanged —
// only the metadata CRUD goes to the doc store. The actual file uploads
// to the publish target go through services/siteFiles.ts which is
// backend-agnostic. `uploadedAt` is already epoch millis in the domain
// type, so no Timestamp conversion is needed here.

import { getDocStore, newDocId, type StoredDoc } from "./index";
import { deleteFile, deleteFolder, publicUrlFor, uploadFile } from "../siteFiles";
import { ADMIN_FORMATS } from "../imageFormats";
import {
  blobToBase64,
  extensionForMime,
  mergeFormats,
  processImage,
  validateInputExtension,
} from "../imageProcessing";
import { getActiveTheme } from "../../themes";
import { normalizeMediaSlug } from "../../core/slug";
import type {
  ImageFormatConfig,
  Media,
  MediaVariant,
  SiteSettings,
} from "../../core/types";

export const MAX_MEDIA_SIZE_BYTES = 25 * 1024 * 1024;

// Mirrors firebase/media.ts. Kept loose enough to cover the common
// photo formats; the canvas decode does the real safety check.
const DEFAULT_INPUT_FORMATS = [".jpg", ".jpeg", ".png", ".webp", ".gif"];

const COLLECTION = "media" as const;

function docToMedia(d: StoredDoc): Media {
  const media: Media = {
    id: d.id,
    name: (d.name as string) ?? "",
    contentType: (d.contentType as string) ?? "",
    size: typeof d.size === "number" ? d.size : 0,
    uploadedAt: typeof d.uploadedAt === "number" ? d.uploadedAt : 0,
    uploadedBy: (d.uploadedBy as string) ?? "",
  };
  if (d.storageBase) media.storageBase = d.storageBase as string;
  if (d.formats && typeof d.formats === "object") {
    // Deep copy: snapshot docs are frozen, callers may mutate the result.
    media.formats = JSON.parse(JSON.stringify(d.formats)) as Record<string, MediaVariant>;
  }
  if (d.defaultFormat) media.defaultFormat = d.defaultFormat as string;
  if (d.alt) media.alt = d.alt as string;
  if (d.caption) media.caption = d.caption as string;
  if (d.storagePath) media.storagePath = d.storagePath as string;
  if (d.url) media.url = d.url as string;
  return media;
}

function listMedia(): Media[] {
  return getDocStore()
    .list(COLLECTION)
    .map(docToMedia)
    .sort((a, b) => b.uploadedAt - a.uploadedAt);
}

export interface ValidationOk {
  ok: true;
}
export interface ValidationFail {
  ok: false;
  reason: string;
}

export function validateMediaFile(
  file: File,
  inputFormats: string[] = DEFAULT_INPUT_FORMATS,
): ValidationOk | ValidationFail {
  if (file.size > MAX_MEDIA_SIZE_BYTES) {
    return {
      ok: false,
      reason: `"${file.name}" is too large (${(file.size / 1024 / 1024).toFixed(1)} MB > ${(MAX_MEDIA_SIZE_BYTES / 1024 / 1024).toFixed(0)} MB).`,
    };
  }
  const reason = validateInputExtension(file.name, inputFormats);
  if (reason) return { ok: false, reason };
  return { ok: true };
}

export function subscribeToMedia(
  onChange: (items: Media[]) => void,
  onError?: (err: Error) => void,
): () => void {
  let cancelled = false;
  let unsubscribe: (() => void) | null = null;
  const emit = () => {
    try {
      onChange(listMedia());
    } catch (err) {
      onError?.(err as Error);
    }
  };
  try {
    const store = getDocStore();
    store.ready().then(
      () => {
        if (cancelled) return;
        unsubscribe = store.subscribe((changed) => {
          if (changed.has(COLLECTION)) emit();
        });
        emit();
      },
      (err) => {
        if (!cancelled) onError?.(err as Error);
      },
    );
  } catch (err) {
    onError?.(err as Error);
  }
  return () => {
    cancelled = true;
    unsubscribe?.();
  };
}

export async function listAllMedia(): Promise<Media[]> {
  await getDocStore().ready();
  return listMedia();
}

function buildStorageBase(filename: string): string {
  const now = new Date();
  const yyyy = now.getFullYear();
  const mm = String(now.getMonth() + 1).padStart(2, "0");
  const slug = normalizeMediaSlug(filename);
  return `media/${yyyy}/${mm}/${slug}`;
}

function resolveImageFormatConfig(settings: SiteSettings | undefined): ImageFormatConfig | undefined {
  try {
    const theme = getActiveTheme(settings?.activeThemeId ?? "default");
    return theme.imageFormats;
  } catch {
    return undefined;
  }
}

// Mirrors firebase/media.ts.uploadMedia — pipelined, browser-side
// variant generation, the storage facade for the uploads, doc store for
// the metadata (one write = one commit on the git backend).
export async function uploadMedia(
  file: File,
  uploadedBy: string,
  settings?: SiteSettings,
): Promise<Media> {
  const themeConfig = resolveImageFormatConfig(settings);
  const validation = validateMediaFile(file, themeConfig?.inputFormats ?? DEFAULT_INPUT_FORMATS);
  if (!validation.ok) throw new Error(validation.reason);

  const merged = mergeFormats(ADMIN_FORMATS, themeConfig);
  const variants = await processImage(file, {
    formats: merged.formats,
    outputMime: merged.outputMime,
    quality: merged.quality,
  });
  const ext = extensionForMime(merged.outputMime);

  const storageBase = buildStorageBase(file.name);
  const id = newDocId();
  const formats: Record<string, MediaVariant> = {};
  let totalBytes = 0;

  for (const variant of variants) {
    const path = `${storageBase}/${variant.name}.${ext}`;
    const content = await blobToBase64(variant.blob);
    await uploadFile({ path, content, encoding: "base64" });
    const url = await publicUrlFor(path);
    formats[variant.name] = {
      url,
      width: variant.width,
      height: variant.height,
      bytes: variant.bytes,
    };
    totalBytes += variant.bytes;
  }

  const media: Media = {
    id,
    name: file.name,
    contentType: merged.outputMime,
    size: totalBytes,
    storageBase,
    formats,
    defaultFormat: merged.defaultFormat,
    uploadedAt: Date.now(),
    uploadedBy,
  };
  const store = getDocStore();
  await store.ready();
  await store.write([{ op: "set", collection: COLLECTION, doc: { ...media } }], {
    message: `Upload media: ${file.name}`,
  });
  return media;
}

export async function updateMedia(
  id: string,
  patch: Partial<Pick<Media, "alt" | "caption">>,
): Promise<void> {
  if (patch.alt === undefined && patch.caption === undefined) return;
  const store = getDocStore();
  await store.ready();
  const existing = store.get(COLLECTION, id);
  if (!existing) throw new Error(`Media not found: ${id}`);
  const next: StoredDoc = { ...existing };
  if (patch.alt !== undefined) next.alt = patch.alt;
  if (patch.caption !== undefined) next.caption = patch.caption;
  await store.write([{ op: "set", collection: COLLECTION, doc: next }], {
    message: `Update media: ${(existing.name as string) || id}`,
  });
}

// Wipes the published artifacts first (best-effort), then drops the
// metadata doc — same order as the other impls.
export async function deleteMedia(media: Media): Promise<void> {
  try {
    if (media.storageBase) {
      await deleteFolder(media.storageBase);
    } else if (media.storagePath) {
      await deleteFile(media.storagePath);
    }
  } catch (err) {
    console.warn("Media files delete failed (continuing):", err);
  }
  const store = getDocStore();
  await store.ready();
  if (!store.get(COLLECTION, media.id)) return;
  await store.write([{ op: "delete", collection: COLLECTION, id: media.id }], {
    message: `Delete media: ${media.name || media.id}`,
  });
}
