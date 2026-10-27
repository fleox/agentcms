import { getSettings, updateSettings } from "../settings";
import { getStorageConfig, setStorageConfig } from "../storageConfig";
import { defaultConnectorId, invalidateActiveStorageConnector } from "./registry";

// Read / write the active publish target as one `{ connectorId, settings }`
// value (stored in `config/storage`).

export interface PublishTarget {
  connectorId: string;
  settings: Record<string, unknown>;
}

export async function readPublishTarget(): Promise<PublishTarget> {
  const stored = await getStorageConfig().catch(() => null);
  return { connectorId: stored?.connectorId ?? defaultConnectorId(), settings: stored?.settings ?? {} };
}

// Public URL a target serves the site at ("" when unknown).
export function targetSiteUrl(target: PublishTarget): string {
  const raw = typeof target.settings.siteUrl === "string" ? target.settings.siteUrl.trim().replace(/\/+$/, "") : "";
  return /^https?:\/\//.test(raw) ? raw : "";
}

// "ifEmpty" (default): fill settings.baseUrl only when it's empty —
// never overwrite a value the admin set (custom domain…).
// "always": the setup wizard, where picking a hosting means the site
// is served there (an existing Firebase project may still carry the
// URL of a previous hosting).
export async function savePublishTarget(
  target: PublishTarget,
  opts: { siteUrl?: "ifEmpty" | "always" } = {},
): Promise<void> {
  const clean: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(target.settings)) {
    if (v === undefined) continue;
    clean[k] = typeof v === "string" ? v.trim() : v;
  }
  await setStorageConfig({ connectorId: target.connectorId, settings: clean });
  invalidateActiveStorageConnector();
  await adoptSiteUrl(target, opts.siteUrl ?? "ifEmpty");
}

// The site's public URL (settings.baseUrl) drives absolute URLs —
// sitemaps, RSS, canonicals — and sub-folder link rewriting. When it's
// still empty, take the one just entered for the publish target so a
// fresh GitHub Pages / bucket setup works without a second trip to
// Settings → General. Never overwrites a value the admin set.
async function adoptSiteUrl(target: PublishTarget, mode: "ifEmpty" | "always"): Promise<void> {
  const siteUrl = targetSiteUrl(target);
  if (!siteUrl) return;
  try {
    const settings = await getSettings();
    const current = (settings.baseUrl ?? "").replace(/\/+$/, "");
    if (current === siteUrl) return;
    if (!current || mode === "always") await updateSettings({ baseUrl: siteUrl });
  } catch (err) {
    console.warn("[storage] could not adopt the publish target URL as base URL:", err);
  }
}
