import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createMemoryDocStore, setDocStoreForTests, type DocStore } from "./index";
import * as docstoreTaxonomies from "./taxonomies";
import type { Term } from "../../core/types";

// Type-level drift guard against the firebase impl.
const _taxonomies: typeof import("../firebase/taxonomies") = docstoreTaxonomies;
void _taxonomies;

const { createTerm, deleteTerm, fetchAllTerms, subscribeToTerms, updateTerm } = docstoreTaxonomies;

let store: DocStore;

beforeEach(() => {
  store = createMemoryDocStore({
    terms: [
      { id: "t1", type: "category", name: "Zebra", slug: "zebra", createdAt: 1000, updatedAt: 1000 },
      { id: "t2", type: "tag", name: "Apple", slug: "apple", createdAt: 1000, updatedAt: 1000 },
    ],
    posts: [
      { id: "p1", type: "post", title: "P", slug: "p", contentMarkdown: "", authorId: "u", termIds: ["t1"], primaryTermId: "t1", status: "draft", createdAt: 1, updatedAt: 1 },
    ],
  });
  setDocStoreForTests(store);
});

afterEach(() => {
  setDocStoreForTests(null);
  vi.restoreAllMocks();
});

describe("docstore taxonomies", () => {
  it("subscribeToTerms emits sorted by name and re-emits on create", async () => {
    const seen: Term[][] = [];
    const unsub = subscribeToTerms((t) => seen.push(t));
    await store.ready();
    await Promise.resolve();
    expect(seen[0].map((t) => t.name)).toEqual(["Apple", "Zebra"]);
    expect(seen[0][0].createdAt?.toMillis()).toBe(1000);

    const writeSpy = vi.spyOn(store, "write");
    const id = await createTerm({ type: "category", name: "Mango", slug: "mango", description: "" });
    expect(writeSpy).toHaveBeenCalledTimes(1);
    expect(writeSpy.mock.calls[0][1]?.message).toBe("Create category: Mango");
    expect(seen[seen.length - 1].map((t) => t.id)).toEqual(["t2", id, "t1"]);
    expect(store.get("terms", id)!.description).toBeUndefined();
    unsub();
  });

  it("updateTerm patches fields, clears empty seo / translations, one write", async () => {
    await updateTerm("t1", { seo: { title: "Z" }, translations: { fr: { name: "Zèbre" } } });
    let [t1] = (await fetchAllTerms()).filter((t) => t.id === "t1");
    expect(t1.seo).toEqual({ title: "Z" });
    expect(t1.translations).toEqual({ fr: { name: "Zèbre" } });

    const writeSpy = vi.spyOn(store, "write");
    await updateTerm("t1", { name: "Zed", slug: "zed", seo: {}, translations: {} });
    expect(writeSpy).toHaveBeenCalledTimes(1);
    [t1] = (await fetchAllTerms()).filter((t) => t.id === "t1");
    expect(t1.name).toBe("Zed");
    expect(t1.slug).toBe("zed");
    expect(t1.seo).toBeUndefined();
    expect(t1.translations).toBeUndefined();
    expect(t1.updatedAt!.toMillis()).toBeGreaterThan(1000);
    await expect(updateTerm("missing", { name: "x" })).rejects.toThrow();
  });

  it("deleteTerm removes only the term (no cascade, like the other impls)", async () => {
    const writeSpy = vi.spyOn(store, "write");
    await deleteTerm("t1");
    expect(writeSpy).toHaveBeenCalledTimes(1);
    expect(store.get("terms", "t1")).toBeUndefined();
    expect(store.get("posts", "p1")!.termIds).toEqual(["t1"]);
    await deleteTerm("t1");
    expect(writeSpy).toHaveBeenCalledTimes(1);
  });
});
