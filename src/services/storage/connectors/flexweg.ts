import i18n from "../../../i18n";
import { toast } from "../../../lib/toast";
import { getFlexwegConfig, type FlexwegConfig } from "../../flexwegConfig";
import { performRequest } from "../http";
import {
  StorageError,
  type ListResponse,
  type StorageConnector,
  type StorageLimitsResponse,
} from "../types";

// Flexweg Files API connector (`/api/v1/files/*`, X-API-Key header).
// Credentials come from the data backend (Firestore `config/flexweg` or
// the SQLite `config` table) and are resolved on every call, exactly as
// before the connector layer existed.
//
// The same HTTP contract is implemented by the self-hosted PHP bridge
// (external/bridges/php/), so createFilesApiConnector() also backs the
// "php-bridge" connector with credentials from `config/storage`.

type LoadConfig = () => Promise<FlexwegConfig | null>;

function authHeaders(config: FlexwegConfig): HeadersInit {
  return {
    "X-API-Key": config.apiKey,
    "Content-Type": "application/json",
  };
}

// Encodes a slash-delimited path for use as a query string value while
// keeping the slashes literal. `URLSearchParams` would encode `/` as
// `%2F`, and the Flexweg `/files/delete` endpoint does NOT decode that
// back into a path separator — it returns 200 OK but the file isn't
// actually deleted, leaving orphans on storage forever. Encoding each
// segment individually keeps spaces / unicode safe while preserving the
// literal slashes the API needs. (Lesson #6 of the SQLite migration —
// originally surfaced on the Notion port.)
function encodePathForQuery(p: string): string {
  return p.split("/").map(encodeURIComponent).join("/");
}

export function createFilesApiConnector(id: string, loadConfig: LoadConfig): StorageConnector {
  async function requireConfig(): Promise<FlexwegConfig> {
    const config = await loadConfig();
    if (!config) {
      const message = i18n.t("flexweg.errors.configMissing");
      toast.error(message);
      throw new Error(message);
    }
    return config;
  }

  return {
    id,
    model: "files",
    capabilities: {
      list: true,
      rename: true,
      renameFolder: true,
      folders: true,
      deletePrefix: true,
      storageLimits: true,
    },

    async put(input, signal) {
      const config = await requireConfig();
      const body: Record<string, unknown> = { path: input.path, content: input.content };
      // The API only requires `encoding` when sending base64. Sending `utf-8`
      // explicitly is harmless and clarifies intent.
      if (input.encoding) body.encoding = input.encoding;
      await performRequest("upload", () =>
        fetch(`${config.apiBaseUrl}/files/upload`, {
          method: "POST",
          headers: authHeaders(config),
          body: JSON.stringify(body),
          signal,
        }),
      );
    },

    async get(path) {
      const config = await requireConfig();
      // Cache-bust both layers: `_t` query param defeats CDN / proxy
      // caching, `cache: "no-store"` defeats the browser cache. Files on
      // Flexweg can change at any time (especially admin manifests), and a
      // stale read here cascades into data loss when the caller writes
      // back the result. Always read fresh.
      const url = `${config.apiBaseUrl}/files/get?${new URLSearchParams({
        path,
        _t: String(Date.now()),
      })}`;
      const res = await performRequest("get", () =>
        fetch(url, { method: "GET", headers: { "X-API-Key": config.apiKey }, cache: "no-store" }),
      );
      return res.text();
    },

    async getBytes(path) {
      const config = await requireConfig();
      const url = `${config.apiBaseUrl}/files/get?${new URLSearchParams({ path, _t: String(Date.now()) })}`;
      const res = await fetch(url, { method: "GET", headers: { "X-API-Key": config.apiKey }, cache: "no-store" }).catch(
        (err) => performRequest("get", () => Promise.reject(err)),
      );
      if (res.status === 404) return null;
      const ok = res.ok ? res : await performRequest("get", async () => res);
      return new Uint8Array(await ok.arrayBuffer());
    },

    async delete(path, signal) {
      const config = await requireConfig();
      const url = `${config.apiBaseUrl}/files/delete?path=${encodePathForQuery(path)}`;
      try {
        await performRequest("delete", () =>
          fetch(url, { method: "DELETE", headers: { "X-API-Key": config.apiKey }, signal }),
        );
      } catch (err) {
        // Treat 404 as success: the file was already gone, the desired state is reached.
        if (err instanceof StorageError && err.status === 404) return;
        throw err;
      }
    },

    async deletePrefix(path) {
      const config = await requireConfig();
      // Same `%2F` gotcha as delete — keep slashes literal.
      const url = `${config.apiBaseUrl}/files/delete-folder?path=${encodePathForQuery(path)}`;
      try {
        await performRequest("deleteFolder", () =>
          fetch(url, { method: "DELETE", headers: { "X-API-Key": config.apiKey } }),
        );
      } catch (err) {
        if (err instanceof StorageError && err.status === 404) return;
        throw err;
      }
    },

    async rename(oldPath, newPath) {
      const config = await requireConfig();
      await performRequest("rename", () =>
        fetch(`${config.apiBaseUrl}/files/rename`, {
          method: "POST",
          headers: authHeaders(config),
          body: JSON.stringify({ old_path: oldPath, new_path: newPath }),
        }),
      );
    },

    async renameFolder(oldPath, newPath) {
      const config = await requireConfig();
      await performRequest("renameFolder", () =>
        fetch(`${config.apiBaseUrl}/files/rename-folder`, {
          method: "POST",
          headers: authHeaders(config),
          body: JSON.stringify({ old_path: oldPath, new_path: newPath }),
        }),
      );
    },

    async createFolder(path) {
      const config = await requireConfig();
      await performRequest("createFolder", () =>
        fetch(`${config.apiBaseUrl}/files/create-folder`, {
          method: "POST",
          headers: authHeaders(config),
          body: JSON.stringify({ path }),
        }),
      );
    },

    async list(page, perPage) {
      const config = await requireConfig();
      const url = `${config.apiBaseUrl}/files/list?${new URLSearchParams({
        page: String(page),
        per_page: String(perPage),
      })}`;
      const res = await performRequest("list", () =>
        fetch(url, { method: "GET", headers: { "X-API-Key": config.apiKey } }),
      );
      return (await res.json()) as ListResponse;
    },

    // Documented at https://documentation.flexweg.com/api-reference/storage.
    async storageLimits() {
      const config = await requireConfig();
      const res = await performRequest("storageLimits", () =>
        fetch(`${config.apiBaseUrl}/files/storage-limits`, {
          method: "GET",
          headers: { "X-API-Key": config.apiKey },
        }),
      );
      return (await res.json()) as StorageLimitsResponse;
    },

    // The user-supplied siteUrl frequently includes the app subfolder
    // (e.g. `https://your-site.flexweg.com/admin`). Naïvely joining
    // `${siteUrl}/${path}` where path is something like `admin/media/x.png`
    // produces a doubled-subfolder URL (`/admin/admin/media/x.png`) that
    // 404s. Strip to origin before joining so the result is always a
    // well-formed public URL regardless of what the user typed.
    // (Lesson #5 of the SQLite migration.)
    async publicUrl(path) {
      const config = await requireConfig();
      const cleaned = path.replace(/^\/+/, "");
      try {
        const origin = new URL(config.siteUrl).origin;
        return `${origin.replace(/\/+$/, "")}/${cleaned}`;
      } catch {
        // Malformed siteUrl — fall back to the raw join.
        return `${config.siteUrl.replace(/\/+$/, "")}/${cleaned}`;
      }
    },
  };
}

export const flexwegConnector = createFilesApiConnector("flexweg", getFlexwegConfig);
