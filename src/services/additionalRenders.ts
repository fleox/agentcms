// Upload + orphan cleanup for the plugin-driven `publish.additional`
// renders (multilang translations, …). Shared by `publishPost` and
// `regenerateAll` so a full regeneration cleans up variants a plugin
// stopped returning exactly like a single publish does — otherwise a
// variant dropped by the plugin (language disabled, translation removed,
// page turned into a per-locale home) stays on the public site forever:
// the plugin overwrites `lastPublishedPathsByLocale` with the new set
// during the filter call, so the old path is no longer tracked anywhere.
//
// Kept in its own module (only depends on the storage facade) so it can
// be unit-tested without loading the whole publisher.

import type { AdditionalRender, PublishLogger } from "./publisher";
import { deleteFile, uploadFile } from "./siteFiles";

export interface AdditionalRendersResult {
  // Paths uploaded this pass.
  uploaded: string[];
  // Orphans whose deletion failed (non-404) — the caller persists them in
  // `previousPublishedPaths` so the next publish retries them.
  failedDeletions: string[];
}

export async function uploadAdditionalRenders(args: {
  additional: AdditionalRender[];
  // The entity's primary path: never re-uploaded nor deleted from here.
  primaryPath: string;
  // `post.lastPublishedPathsByLocale` as it was BEFORE the filter ran.
  previousByLocale: Record<string, string> | undefined;
  log: PublishLogger;
}): Promise<AdditionalRendersResult> {
  const { additional, primaryPath, previousByLocale, log } = args;
  const uploaded: string[] = [];
  for (const entry of additional) {
    if (!entry.path || entry.path === primaryPath) continue;
    log({ level: "info", message: `Uploading ${entry.path}…` });
    await uploadFile({ path: entry.path, content: entry.html });
    uploaded.push(entry.path);
  }
  const failedDeletions: string[] = [];
  for (const orphan of Object.values(previousByLocale ?? {})) {
    if (!orphan || orphan === primaryPath) continue;
    if (uploaded.includes(orphan)) continue;
    try {
      await deleteFile(orphan);
      log({ level: "info", message: `Deleted stale additional ${orphan}` });
    } catch (err) {
      log({ level: "warn", message: `Could not delete ${orphan}: ${(err as Error).message}` });
      failedDeletions.push(orphan);
    }
  }
  return { uploaded, failedDeletions };
}
