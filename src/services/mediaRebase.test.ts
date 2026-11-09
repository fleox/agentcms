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

  it("rewrites only the variants under the previous target URL", () => {
    expect(rebaseMediaFormats(media, "https://me.github.io/site/", "https://example.com")).toEqual({
      large: { url: "https://example.com/media/a/large.webp", width: 1, height: 1 },
    });
  });

  it("returns null when nothing matches (no partial prefix match)", () => {
    expect(rebaseMediaFormats(media, "https://me.github.io/si", "https://example.com")).toBeNull();
  });
});
