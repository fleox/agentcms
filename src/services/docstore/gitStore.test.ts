import { beforeEach, describe, expect, it, vi } from "vitest";
import type { GitChange, GitCommitOptions, GitTransport } from "../git/types";

// In-memory remote with real optimistic-concurrency semantics.
const remote = vi.hoisted(() => ({ files: new Map<string, string>(), head: 0, commits: 0 }));

vi.mock("../git", async (importOriginal) => {
  const actual = await importOriginal<typeof import("../git")>();
  const transport: GitTransport = {
    kind: "github",
    label: "test",
    headSha: async () => `c${remote.head}`,
    listTree: async () => ({
      headSha: `c${remote.head}`,
      entries: [...remote.files.keys()].map((path) => ({ path, sha: `${path}@${remote.files.get(path)!.length}` })),
    }),
    readTexts: async (entries) => new Map(entries.map((e) => [e.path, remote.files.get(e.path)!])),
    readBytes: async () => new Uint8Array(),
    async commit(changes: GitChange[], opts: GitCommitOptions) {
      if (opts.expectedHeadSha !== undefined && opts.expectedHeadSha !== `c${remote.head}`) {
        throw new actual.GitConflictError("moved", `c${remote.head}`);
      }
      for (const c of changes) {
        if (c.type === "delete") remote.files.delete(c.path);
        else remote.files.set(c.path, c.content);
      }
      remote.head++;
      remote.commits++;
      return `c${remote.head}`;
    },
    permissions: async () => ({ login: "fred", canWrite: true, isAdmin: false }),
  };
  return { ...actual, createRemoteGitTransport: () => transport };
});

import { createGitDocStore, setGitToken } from "./gitStore";
import { DocConflictError } from "./types";

const cfg = { provider: "github" as const, owner: "me", repo: "content", branch: "main", contentDir: "content" };

// Another editor pushing directly to the repo.
function remoteEdit(path: string, content: string) {
  remote.files.set(path, content);
  remote.head++;
}

beforeEach(() => {
  remote.files.clear();
  remote.head = 0;
  remote.commits = 0;
  const ls = new Map<string, string>();
  vi.stubGlobal("window", {
    localStorage: {
      getItem: (k: string) => ls.get(k) ?? null,
      setItem: (k: string, v: string) => void ls.set(k, v),
      removeItem: (k: string) => void ls.delete(k),
    },
  });
  setGitToken(cfg, "ghp_test");
});

const post = (id: string, title: string) => ({
  id,
  type: "post",
  title,
  slug: title.toLowerCase(),
  status: "draft",
  contentMarkdown: `# ${title}`,
});

describe("git doc store", () => {
  it("is signed out without a token", async () => {
    setGitToken(cfg, null);
    expect(await createGitDocStore(cfg).identity()).toBeNull();
  });

  it("derives identity from repo permissions", async () => {
    expect(await createGitDocStore(cfg).identity()).toEqual({
      uid: "github:fred",
      email: "fred@users.noreply.github.com",
      displayName: "fred",
      role: "editor",
    });
  });

  it("commits one write as one commit under the content dir", async () => {
    const store = createGitDocStore(cfg);
    await store.ready();
    await store.write(
      [
        { op: "set", collection: "posts", doc: post("P1", "Hello") },
        { op: "set", collection: "terms", doc: { id: "T1", type: "category", name: "News", slug: "news" } },
      ],
      { message: "Create post" },
    );
    expect(remote.commits).toBe(1);
    expect([...remote.files.keys()].sort()).toEqual(["content/posts/hello.md", "content/terms.json"]);
  });

  it("rebases when someone else changed other documents", async () => {
    const store = createGitDocStore(cfg);
    await store.ready();
    await store.write([{ op: "set", collection: "posts", doc: post("P1", "Hello") }]);
    remoteEdit("content/posts/other.md", "---\nid: P2\ntitle: Other\n---\n\nTheirs");
    await store.write([{ op: "set", collection: "posts", doc: { ...post("P1", "Hello"), contentMarkdown: "Mine" } }]);
    expect(remote.files.get("content/posts/hello.md")).toContain("Mine");
    expect(remote.files.get("content/posts/other.md")).toContain("Theirs");
    // The rebased head carries their post — the next refresh surfaces it.
    await store.refresh();
    expect(store.get("posts", "P2")).toMatchObject({ title: "Other" });
  });

  it("refuses and rolls back when the same document changed remotely", async () => {
    const store = createGitDocStore(cfg);
    await store.ready();
    await store.write([{ op: "set", collection: "posts", doc: post("P1", "Hello") }]);
    const theirs = remote.files.get("content/posts/hello.md")!.replace("# Hello", "Their edit");
    remoteEdit("content/posts/hello.md", theirs);
    await expect(
      store.write([{ op: "set", collection: "posts", doc: { ...post("P1", "Hello"), contentMarkdown: "Mine" } }]),
    ).rejects.toBeInstanceOf(DocConflictError);
    expect(remote.files.get("content/posts/hello.md")).toContain("Their edit");
    expect(store.get("posts", "P1")).toMatchObject({ contentMarkdown: "# Hello" });
  });

  it("picks up remote changes on refresh", async () => {
    const store = createGitDocStore(cfg);
    await store.ready();
    const seen: string[] = [];
    store.subscribe((changed) => seen.push(...changed));
    remoteEdit("content/settings/site.json", JSON.stringify({ id: "site", title: "Remote title" }));
    await store.refresh();
    expect(store.get("settings", "site")).toMatchObject({ title: "Remote title" });
    expect(seen).toContain("settings");
  });

  it("never commits secrets", async () => {
    const store = createGitDocStore(cfg);
    await store.ready();
    await store.write([
      { op: "set", collection: "config", doc: { id: "storage", connectorId: "s3", settings: { secretAccessKey: "SK" } } },
    ]);
    expect(remote.files.get("content/.cms/config/storage.json")).not.toContain("SK");
    // A fresh session in the same browser gets the secret back.
    const again = createGitDocStore(cfg);
    await again.ready();
    expect(again.get("config", "storage")).toMatchObject({ settings: { secretAccessKey: "SK" } });
  });
});
