import { beforeAll, describe, expect, it, vi } from "vitest";

// Route the real dispatchers to the document-store implementations.
beforeAll(() => {
  vi.stubGlobal("window", { __FLEXWEG_CONFIG__: { backend: "local" }, localStorage: undefined });
});

import { createMemoryDocStore, setDocStoreForTests } from "./docstore";
import { exportContent, importContent, isContentExport } from "./contentTransfer";

describe("content transfer", () => {
  it("exports every collection and re-imports it with ids preserved", async () => {
    setDocStoreForTests(
      createMemoryDocStore({
        posts: [
          { id: "P1", type: "post", title: "Hello", slug: "hello", status: "online", contentMarkdown: "x", termIds: ["T1"], primaryTermId: "T1", authorId: "U1", createdAt: 1, updatedAt: 2 },
          { id: "G1", type: "page", title: "About", slug: "about", status: "draft", contentMarkdown: "", termIds: [], authorId: "U1", createdAt: 3, updatedAt: 3 },
        ],
        terms: [{ id: "T1", type: "category", name: "News", slug: "news" }],
        media: [{ id: "M1", name: "a.webp", uploadedAt: 5, formats: {} }],
        users: [{ id: "U1", email: "a@b.c", role: "admin", disabled: false, createdAt: 1 }],
        settings: [{ id: "site", title: "Site" }],
        config: [{ id: "storage", connectorId: "s3", settings: { bucket: "b", secretAccessKey: "SK" } }],
      }),
    );
    const data = await exportContent();
    expect(isContentExport(JSON.parse(JSON.stringify(data)))).toBe(true);
    expect(data.collections.posts?.map((p) => p.id).sort()).toEqual(["G1", "P1"]);
    // Timestamps became numbers; secrets stripped.
    expect(typeof data.collections.posts?.find((p) => p.id === "P1")?.createdAt).toBe("number");
    expect(JSON.stringify(data)).not.toContain("SK");

    const target = createMemoryDocStore();
    setDocStoreForTests(target);
    const counts = await importContent(data);
    expect(counts.posts).toBe(2);
    expect(target.get("posts", "P1")).toMatchObject({ primaryTermId: "T1", authorId: "U1", createdAt: 1 });
    expect(target.get("terms", "T1")).toMatchObject({ slug: "news" });
    expect(target.get("config", "storage")).toMatchObject({ connectorId: "s3", settings: { bucket: "b" } });
  });

  it("replace mode empties the imported collections first", async () => {
    const target = createMemoryDocStore({ terms: [{ id: "OLD", type: "tag", name: "Old", slug: "old" }] });
    setDocStoreForTests(target);
    await importContent(
      { format: "flexweg-cms-export", version: 1, exportedAt: "", backend: "test", collections: { terms: [{ id: "NEW", type: "tag", name: "New", slug: "new" }] } },
      "replace",
    );
    expect(target.list("terms").map((t) => t.id)).toEqual(["NEW"]);
  });
});
