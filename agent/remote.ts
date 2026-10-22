import { readFileSync } from "node:fs";
import { join } from "node:path";
import { distRoot } from "./paths";
import { compareVersions } from "./semver";
import type { SiteRecord } from "./sites";

// Read-only HTTP probes of a hosted site — what visitors and the
// browser admin actually get. No credentials involved.

export interface FetchResult {
  ok: boolean;
  status: number;
  contentType: string;
  text: string;
  error?: string;
}

export async function fetchText(url: string, fetchImpl: typeof fetch = fetch): Promise<FetchResult> {
  try {
    const u = new URL(url);
    u.searchParams.set("agentcms", String(Date.now()));
    const res = await fetchImpl(u.href, { cache: "no-store", redirect: "follow", signal: AbortSignal.timeout(15000) });
    const text = await res.text();
    return { ok: res.ok, status: res.status, contentType: res.headers.get("content-type") ?? "", text };
  } catch (err) {
    return { ok: false, status: 0, contentType: "", text: "", error: (err as Error).message };
  }
}

export function adminUrlOf(site: Pick<SiteRecord, "siteUrl" | "adminFolder">): string | null {
  return site.adminFolder ? `${site.siteUrl.replace(/\/+$/, "")}/${site.adminFolder}/` : null;
}

// window.__FLEXWEG_CONFIG__ = {...}; → the object (null when empty).
export function parseConfigJs(source: string): Record<string, unknown> | null {
  const m = /window\.__FLEXWEG_CONFIG__\s*=\s*([\s\S]*?);?\s*$/.exec(source.trim());
  if (!m) throw new Error("config.js does not set window.__FLEXWEG_CONFIG__");
  const value = JSON.parse(m[1].trim().replace(/;$/, "")) as unknown;
  return value && typeof value === "object" ? (value as Record<string, unknown>) : null;
}

// Secret-looking keys that must never be published in config.js.
export function findSecretKeys(value: unknown, path = ""): string[] {
  if (!value || typeof value !== "object") return [];
  return Object.entries(value as Record<string, unknown>).flatMap(([k, v]) => {
    const here = path ? `${path}.${k}` : k;
    if (/^(token|apiKey|secretAccessKey|accessToken|password|sqliteToken)$/.test(k) && typeof v === "string" && v) {
      // Firebase web apiKey is public by design.
      if (k === "apiKey" && path === "firebase") return [];
      return [here];
    }
    return findSecretKeys(v, here);
  });
}

export interface HostedAdmin {
  version: string | null;
  dataSchema: number | null;
  files: string[];
  error?: string;
}

export async function fetchHostedAdmin(adminUrl: string, fetchImpl: typeof fetch = fetch): Promise<HostedAdmin> {
  const res = await fetchText(`${adminUrl}admin-files.json`, fetchImpl);
  if (!res.ok) return { version: null, dataSchema: null, files: [], error: res.error ?? `HTTP ${res.status}` };
  try {
    const m = JSON.parse(res.text) as { version?: string; dataSchema?: number; files?: string[] };
    return { version: m.version ?? null, dataSchema: m.dataSchema ?? null, files: m.files ?? [] };
  } catch {
    return { version: null, dataSchema: null, files: [], error: "admin-files.json is not valid JSON" };
  }
}

export interface ChangelogEntry {
  version: string;
  date: string;
  breaking: boolean;
  changes: string[];
  actions: string[];
}

export function readChangelog(): ChangelogEntry[] {
  try {
    const data = JSON.parse(readFileSync(join(distRoot(), "..", "changelog.json"), "utf8")) as { versions?: ChangelogEntry[] };
    return data.versions ?? [];
  } catch {
    return [];
  }
}

// Entries newer than `from` up to and including `to`.
export function changesBetween(entries: ChangelogEntry[], from: string, to: string) {
  const list = entries.filter((e) => compareVersions(e.version, from) > 0 && compareVersions(e.version, to) <= 0);
  return {
    versions: list.map((e) => e.version),
    breaking: list.some((e) => e.breaking),
    changes: list.flatMap((e) => e.changes.map((c) => `${e.version}: ${c}`)),
    actions: [...new Set(list.flatMap((e) => e.actions))],
  };
}
