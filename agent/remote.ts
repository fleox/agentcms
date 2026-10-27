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

// The public address of the published site: the publish target's site
// URL. It can differ from `siteUrl` (where the admin is reached), e.g. an
// S3 website endpoint (http) next to an admin served over the bucket's
// HTTPS endpoint.
export function publicUrlOf(site: Pick<SiteRecord, "siteUrl" | "hosting">): string {
  const target = (site.hosting?.settings as { siteUrl?: unknown } | undefined)?.siteUrl;
  return (typeof target === "string" && /^https?:\/\//.test(target) ? target : site.siteUrl).replace(/\/+$/, "");
}

// Browsers only allow the admin's request signing (WebCrypto) on secure
// pages. An S3 website endpoint is plain http, so the admin must be opened
// through the bucket's HTTPS REST endpoint instead. null when the admin URL is already https / local, or
// when this isn't an S3 hosting.
export function secureAdminUrlOf(site: Pick<SiteRecord, "siteUrl" | "adminFolder" | "hosting">): string | null {
  const admin = adminUrlOf(site);
  if (!admin || site.hosting?.connectorId !== "s3") return null;
  // The REST endpoint has no index documents: name the page.
  if (admin.startsWith("https://")) return admin.endsWith("/") ? `${admin}index.html` : admin;
  if (/^http:\/\/(localhost|127\.0\.0\.1|\[::1\])(:\d+)?\//.test(admin)) return null;
  const s = (site.hosting.settings ?? {}) as { bucket?: string; endpoint?: string; region?: string; prefix?: string };
  if (!s.bucket) return null;
  const endpoint = (s.endpoint || (s.region ? `https://s3.${s.region}.amazonaws.com` : "https://s3.amazonaws.com")).replace(/\/+$/, "");
  if (!endpoint.startsWith("https://")) return null;
  const path = [String(s.prefix ?? "").replace(/^\/+|\/+$/g, ""), site.adminFolder].filter(Boolean).join("/");
  // Virtual-hosted even when the API calls force path-style: some hosts
  // (OVH) reject anonymous path-style GETs. Dotted names break the TLS
  // wildcard, so those fall back to path-style.
  const pathStyle = s.bucket.includes(".");
  const base = pathStyle ? `${endpoint}/${s.bucket}` : endpoint.replace("https://", `https://${s.bucket}.`);
  return `${base}/${path}/index.html`;
}

export function adminUrlOf(site: Pick<SiteRecord, "siteUrl" | "adminFolder">): string | null {
  return site.adminFolder ? `${site.siteUrl.replace(/\/+$/, "")}/${site.adminFolder}/` : null;
}

// window.__AGENTCMS_CONFIG__ = {...}; → the object (null when empty).
export function parseConfigJs(source: string): Record<string, unknown> | null {
  // __FLEXWEG_CONFIG__: admins older than 0.2.0 (read only, to register
  // and then update them).
  const m = /window\.__(?:AGENTCMS|FLEXWEG)_CONFIG__\s*=\s*([\s\S]*?);?\s*$/.exec(source.trim());
  if (!m) throw new Error("config.js does not set window.__AGENTCMS_CONFIG__");
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
  // Extension API of the hosted admin (admin-files.json since 0.2.0).
  apiVersion: string | null;
  apiMinVersion: string | null;
  files: string[];
  error?: string;
}

export async function fetchHostedAdmin(adminUrl: string, fetchImpl: typeof fetch = fetch): Promise<HostedAdmin> {
  const res = await fetchText(`${adminUrl}admin-files.json`, fetchImpl);
  const none = { version: null, dataSchema: null, apiVersion: null, apiMinVersion: null, files: [] };
  if (!res.ok) return { ...none, error: res.error ?? `HTTP ${res.status}` };
  try {
    const m = JSON.parse(res.text) as { version?: string; dataSchema?: number; apiVersion?: string; apiMinVersion?: string; files?: string[] };
    return {
      version: m.version ?? null,
      dataSchema: m.dataSchema ?? null,
      apiVersion: m.apiVersion ?? null,
      apiMinVersion: m.apiMinVersion ?? null,
      files: m.files ?? [],
    };
  } catch {
    return { ...none, error: "admin-files.json is not valid JSON" };
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
