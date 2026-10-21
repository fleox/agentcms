import { describe, expect, it } from "vitest";
import { emptySnapshot, type Snapshot } from "./core";
import { filesToSnapshot, isLayoutFile, mergeSecrets, PUBLISH_STATE_FILE, snapshotToFiles } from "./markdownLayout";
import type { StoredDoc } from "./types";

function snap(seed: Partial<Record<keyof Snapshot, StoredDoc[]>>): Snapshot {
  const s = emptySnapshot();
  for (const [c, docs] of Object.entries(seed)) for (const d of docs ?? []) s[c as keyof Snapshot].set(d.id, d);
  return s;
}

const post: StoredDoc = {
  id: "P1",
  type: "post",
  title: "Hello: world",
  slug: "hello",
  status: "online",
  contentMarkdown: "# Hi\n\nBody",
  termIds: ["T1"],
  primaryTermId: "T1",
  authorId: "github:fred",
  seo: { title: "SEO" },
  createdAt: Date.UTC(2026, 0, 2),
  updatedAt: Date.UTC(2026, 0, 3),
  lastPublishedPath: "news/hello.html",
  lastPublishedHash: "abc",
  translations: {
    fr: { title: "Bonjour", slug: "bonjour", contentMarkdown: "# Salut" },
    weird_key: { foo: 1 },
  },
};

describe("markdown layout", () => {
  it("writes posts as Markdown with sidecars and publish state apart", () => {
    const { files } = snapshotToFiles(snap({ posts: [post] }), new Map());
    expect([...files.keys()].sort()).toEqual([PUBLISH_STATE_FILE, "posts/hello.fr.md", "posts/hello.md"]);
    const main = files.get("posts/hello.md")!;
    expect(main).toContain("createdAt: \"2026-01-02T00:00:00.000Z\"");
    expect(main).not.toContain("lastPublishedPath");
    expect(main).not.toContain("Bonjour");
    expect(main.endsWith("# Hi\n\nBody")).toBe(true);
    expect(JSON.parse(files.get(PUBLISH_STATE_FILE)!)).toEqual({
      P1: { lastPublishedPath: "news/hello.html", lastPublishedHash: "abc" },
    });
  });

  it("round-trips the full snapshot", () => {
    const original = snap({
      posts: [post, { id: "G1", type: "page", title: "About", slug: "about", status: "draft", contentMarkdown: "" }],
      terms: [{ id: "T1", type: "category", name: "News", slug: "news" }],
      media: [{ id: "M1", formats: { large: { url: "https://x/y.webp" } } }],
      users: [{ id: "github:fred", firstName: "Fred" }],
      settings: [{ id: "site", title: "My site", pluginConfigs: { a: { b: 1 } } }],
      config: [{ id: "externalRegistry", plugins: [], themes: [] }],
    });
    const { files, index } = snapshotToFiles(original, new Map());
    const { snapshot, index: readIndex } = filesToSnapshot(files);
    expect(readIndex).toEqual(index);
    for (const c of Object.keys(original) as Array<keyof Snapshot>) {
      expect(Object.fromEntries(snapshot[c])).toEqual(Object.fromEntries(original[c]));
    }
  });

  it("keeps file names stable and resolves slug collisions", () => {
    const a = { ...post, id: "A", translations: undefined, lastPublishedPath: undefined, lastPublishedHash: undefined };
    const b = { ...a, id: "B" };
    const first = snapshotToFiles(snap({ posts: [a, b] }), new Map());
    expect([...first.index.values()].sort()).toEqual(["posts/hello", "posts/hello--b"]);
    // Renaming A's slug frees "hello"; B keeps its suffixed name (no churn).
    const second = snapshotToFiles(snap({ posts: [{ ...a, slug: "renamed" }, b] }), first.index);
    expect(second.index.get("A")).toBe("posts/renamed");
    expect(second.index.get("B")).toBe("posts/hello--b");
  });

  it("keeps secrets out of the repo and merges them back", () => {
    const config = {
      id: "storage",
      connectorId: "git-pages",
      settings: { repo: "site", token: "ghp_secret" },
    };
    const { files, secrets } = snapshotToFiles(snap({ config: [config] }), new Map());
    const written = files.get(".cms/config/storage.json")!;
    expect(written).not.toContain("ghp_secret");
    expect(secrets).toEqual({ "config/storage": { settings: { token: "ghp_secret" } } });
    const { snapshot } = filesToSnapshot(files);
    mergeSecrets(snapshot, secrets);
    expect(snapshot.config.get("storage")).toEqual(config);
  });

  it("accepts hand-made posts without id / type", () => {
    const { snapshot } = filesToSnapshot(new Map([["posts/my-note.md", "---\ntitle: My note\n---\n\nText"]]));
    expect(snapshot.posts.get("posts-my-note")).toMatchObject({
      type: "post",
      slug: "my-note",
      title: "My note",
      contentMarkdown: "Text",
    });
  });

  it("only claims its own files", () => {
    expect(isLayoutFile("posts/a.md")).toBe(true);
    expect(isLayoutFile(".cms/config/storage.json")).toBe(true);
    expect(isLayoutFile("README.md")).toBe(false);
    expect(isLayoutFile("posts/sub/a.md")).toBe(false);
  });
});
