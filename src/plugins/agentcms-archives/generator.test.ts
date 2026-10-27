import { beforeEach, describe, expect, it, vi } from "vitest";
import type { Post, SiteSettings } from "../../core/types";

const ops: string[] = [];
vi.mock("@agent-cms/runtime", async () => {
  const slug = await import("../../core/slug");
  return {
    ...slug,
    i18n: { getFixedT: () => (key: string) => key },
    pickPublicLocale: () => "en",
    getActiveTheme: () => ({ templates: { base: () => null } }),
    buildSiteContext: (ctx: { settings: SiteSettings }) => ({
      settings: ctx.settings,
      resolvedMenus: { header: [], footer: [] },
      themeCssPath: "theme-assets/default.css",
    }),
    renderPageToHtml: () => "<!doctype html><html></html>",
    uploadFile: async ({ path }: { path: string }) => {
      ops.push(`put ${path}`);
    },
    deleteFile: async (path: string) => {
      ops.push(`delete ${path}`);
    },
    deleteFolder: async (path: string) => {
      ops.push(`deleteFolder ${path}`);
    },
  };
});

import { forceRegenerate, forceRegenerateSummary } from "./generator";

const settings = {
  baseUrl: "https://example.com",
  title: "Site",
  language: "en",
  pluginConfigs: { "agentcms-archives": { drillDown: "none" } },
} as unknown as SiteSettings;

const ts = (iso: string) => ({ toMillis: () => Date.parse(iso), toDate: () => new Date(iso) });
const post = (id: string, iso: string): Post =>
  ({
    id,
    type: "post",
    slug: id,
    title: id,
    contentMarkdown: "",
    status: "online",
    termIds: [],
    publishedAt: ts(iso),
    createdAt: ts(iso),
    updatedAt: ts(iso),
  }) as unknown as Post;

beforeEach(() => {
  ops.length = 0;
});

describe("agentcms-archives forceRegenerate — truthful counts", () => {
  it("does not count the folder wipe as a removed file on an empty site", async () => {
    const result = await forceRegenerate({ posts: [], pages: [], terms: [], settings });
    expect(result.deleted).toEqual([]);
    expect(result.wipedFolders).toEqual(["archives/"]);
    expect(result.uploaded).toEqual(["archives/index.html"]);
    expect(forceRegenerateSummary(result)).toBe(
      "Archives: 1 page(s) uploaded (rebuilt archives/).",
    );
    // The wipe still runs before the uploads (stale periods go away).
    expect(ops[0]).toBe("deleteFolder archives");
  });

  it("reports no removals on a stable site", async () => {
    const result = await forceRegenerate({
      posts: [post("a", "2025-03-01T00:00:00Z"), post("b", "2026-03-01T00:00:00Z")],
      pages: [],
      terms: [],
      settings,
    });
    expect(result.deleted).toEqual([]);
    expect(result.uploaded.length).toBe(3);
    expect(forceRegenerateSummary(result)).not.toContain("removed");
  });

  it("still mentions real per-file removals", () => {
    expect(
      forceRegenerateSummary({ uploaded: ["archives/index.html"], deleted: ["archives/2024/index.html"] }),
    ).toBe("Archives: 1 page(s) uploaded, 1 removed.");
  });
});
