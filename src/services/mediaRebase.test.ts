import { describe, expect, it, vi } from "vitest";
vi.mock("./media", () => ({ setMediaFormats: vi.fn() }));
vi.mock("./siteFiles", () => ({ publicUrlFor: vi.fn(), uploadFile: vi.fn() }));
vi.mock("./storage/registry", () => ({ getActiveStorageConnector: vi.fn() }));
vi.mock("../themes", () => ({ getActiveTheme: vi.fn() }));
import { rebaseMediaFormats } from "./mediaRegenerate";
import type { Media } from "../core/types";

describe("rebaseMediaFormats", () => {
  const media = {
    id: "m",
    formats: {
      large: { url: "https://me.github.io/site/media/a/large.webp", width: 1, height: 1 },
      thumb: { url: "https://cdn.example.com/media/a/thumb.webp", width: 1, height: 1 },
    },
  } as unknown as Media;

  it("rewrites legacy media (no folder) only under the previous target URL", () => {
    expect(rebaseMediaFormats(media, "https://me.github.io/site/", "https://example.com")).toEqual({
      large: { url: "https://example.com/media/a/large.webp", width: 1, height: 1 },
    });
    expect(rebaseMediaFormats(media, "https://me.github.io/si", "https://example.com")).toBeNull();
  });

  it("rebuilds every variant from its folder, whatever URL it was stored with", () => {
    const m = { ...media, storageBase: "media/a" } as Media;
    expect(rebaseMediaFormats(m, null, "https://example.com/")).toEqual({
      large: { url: "https://example.com/media/a/large.webp", width: 1, height: 1 },
      thumb: { url: "https://example.com/media/a/thumb.webp", width: 1, height: 1 },
    });
    const done = { ...m, formats: { large: { url: "https://example.com/media/a/large.webp", width: 1, height: 1 } } } as unknown as Media;
    expect(rebaseMediaFormats(done, null, "https://example.com")).toBeNull();
  });
});
