import { testFlexwegConnection } from "../../lib/setupApi";
import { createRemoteGitTransport } from "../git";
import { getStorageConfig } from "../storageConfig";
import { resolveGitPagesToken, type GitPagesSettings } from "./connectors/gitPages";
import { defaultConnectorId, instantiateStorageConnector } from "./registry";
import { StorageError } from "./types";

// "Test connection" for the setup wizard and Settings → Publish target.
// Proves the credentials work WITHOUT side effects on the public site
// where possible: git targets only check repo permissions (a probe
// commit would trigger a Pages build), file targets write + delete a
// tiny probe file.

export const PROBE_PATH = ".flexweg-cms-probe.txt";

export interface ConnectionTestResult {
  ok: boolean;
  // Short technical detail for the UI (login, bucket, …) or the error.
  detail: string;
}

// Fields without which a connector can't even attempt a request.
const REQUIRED: Record<string, (s: Record<string, unknown>) => string[]> = {
  flexweg: () => ["apiKey", "siteUrl"],
  "git-pages": (s) => [...(s.provider === "gitlab" ? ["project"] : ["owner", "repo"]), "branch", "siteUrl"],
  s3: () => ["bucket", "accessKeyId", "secretAccessKey", "siteUrl"],
  "php-bridge": () => ["apiBaseUrl", "apiKey", "siteUrl"],
};

// `ignore`: fields irrelevant for the caller (a SQLite database location
// has no public site URL).
export function missingFields(connectorId: string, settings: Record<string, unknown>, ignore: string[] = []): string[] {
  const required = (REQUIRED[connectorId]?.(settings) ?? []).filter((k) => !ignore.includes(k));
  return required.filter((k) => typeof settings[k] !== "string" || !(settings[k] as string).trim());
}

export async function testStorageConnection(
  connectorId: string,
  settings: Record<string, unknown>,
  opts: { ignore?: string[] } = {},
): Promise<ConnectionTestResult> {
  const missing = missingFields(connectorId, settings, opts.ignore);
  if (missing.length) return { ok: false, detail: `missing: ${missing.join(", ")}` };
  try {
    if (connectorId === "flexweg") {
      // Uses the typed credentials (the stored ones may not exist yet —
      // setup wizard) and a read-only endpoint, like the original setup.
      const fw = {
        apiKey: String(settings.apiKey ?? "").trim(),
        siteUrl: String(settings.siteUrl ?? "").trim(),
        apiBaseUrl: String(settings.apiBaseUrl ?? "").trim() || "https://www.flexweg.com/api/v1",
      };
      await testFlexwegConnection(fw);
      return { ok: true, detail: fw.siteUrl };
    }
    if (connectorId === "git-pages") {
      const s = settings as unknown as GitPagesSettings;
      const token = resolveGitPagesToken(s);
      const transport = createRemoteGitTransport(
        s.provider === "github"
          ? { provider: "github", owner: s.owner ?? "", repo: s.repo ?? "", branch: s.branch, token, apiBaseUrl: s.apiBaseUrl }
          : { provider: "gitlab", project: s.project ?? "", branch: s.branch, token, apiBaseUrl: s.apiBaseUrl },
      );
      const perms = await transport.permissions();
      if (!perms.canWrite) return { ok: false, detail: `${perms.login}: read-only access` };
      return { ok: true, detail: `${perms.login} → ${transport.label}` };
    }
    const connector = instantiateStorageConnector(connectorId, settings);
    if (connectorId === "browser-mirror") return { ok: true, detail: "browser" };
    await connector.put({ path: PROBE_PATH, content: `Flexweg CMS connection test ${new Date().toISOString()}\n` });
    const echoed = await connector.get(PROBE_PATH).catch(() => null);
    await connector.delete(PROBE_PATH);
    if (echoed === null) return { ok: false, detail: "write succeeded but read-back failed" };
    return { ok: true, detail: await connector.publicUrl("") };
  } catch (err) {
    const status = err instanceof StorageError ? ` (${err.status})` : "";
    return { ok: false, detail: `${(err as Error).message}${status}` };
  }
}

// Current target as stored, for Settings to pre-fill its form.
export async function readStorageSettings(): Promise<{ connectorId: string; settings: Record<string, unknown> }> {
  const config = await getStorageConfig().catch(() => null);
  return { connectorId: config?.connectorId ?? defaultConnectorId(), settings: config?.settings ?? {} };
}
