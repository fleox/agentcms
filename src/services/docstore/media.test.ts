import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

// The binary pipeline is out of scope here — stub the storage facade and the
// theme registry (heavy import graph) so only the metadata CRUD runs.
vi.mock("../siteFiles", () => ({
  deleteFile: vi.fn(async () => undefined),
  deleteFolder: vi.fn(async () => undefined),
  publicUrlFor: vi.fn(async (p: string) => `https://example.test/${p}`),
  uploadFile: vi.fn(async () => undefined),
}));
vi.mock("../../themes", () => ({ getActiveTheme: () => ({}) }));

import { createMemoryDocStore, setDocStoreForTests, type DocStore } from "./index";
import * as docstoreMedia from "./media";
import { deleteFolder } from "../siteFiles";
import type { Media } from "../../core/types";

// Type-level drift guard against the firebase impl.
const _media: typeof import("../firebase/media") = docstoreMedia;
void _media;

const { deleteMedia, listAllMedia, subscribeToMedia, updateMedia, MAX_MEDIA_SIZE_BYTES } = docstoreMedia;

let store: DocStore;

beforeEach(() => {
  store = createMemoryDocStore({
    media: [
      { id: "m1", name: "a.jpg", contentType: "image/webp", size: 10, uploadedAt: 1000, uploadedBy: "u", storageBase: "media/2026/01/a-abc123", formats: { thumb: { url: "u1", width: 1, height: 1, bytes: 10 } } },
      { id: "m2", name: "b.jpg", contentType: "image/webp", size: 10, uploadedAt: 2000, uploadedBy: "u" },
    ],
  });
  setDocStoreForTests(store);
});

afterEach(() => {
  setDocStoreForTests(null);
  vi.clearAllMocks();
});

describe("docstore media", () => {
  it("keeps the shared size limit", () => {
    expect(MAX_MEDIA_SIZE_BYTES).toBe(25 * 1024 * 1024);
  });

  it("lists and subscribes sorted by uploadedAt desc", async () => {
    expect((await listAllMedia()).map((m) => m.id)).toEqual(["m2", "m1"]);
    const items = await new Promise<Media[]>((resolve) => {
      const unsub = subscribeToMedia((m) => {
        queueMicrotask(unsub);
        resolve(m);
      });
    });
    expect(items[1].formats?.thumb.url).toBe("u1");
  });

  it("updateMedia patches alt / caption in one write, no-op on empty patch", async () => {
    const writeSpy = vi.spyOn(store, "write");
    await updateMedia("m1", {});
    expect(writeSpy).not.toHaveBeenCalled();
    await updateMedia("m1", { alt: "Alt", caption: "Cap" });
    expect(writeSpy).toHaveBeenCalledTimes(1);
    const [, m1] = await listAllMedia();
    expect(m1.alt).toBe("Alt");
    expect(m1.caption).toBe("Cap");
  });

  it("deleteMedia wipes the published folder then the doc", async () => {
    const [, m1] = await listAllMedia();
    await deleteMedia(m1);
    expect(deleteFolder).toHaveBeenCalledWith("media/2026/01/a-abc123");
    expect(store.get("media", "m1")).toBeUndefined();
  });
});
