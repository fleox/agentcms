import { beforeEach, describe, expect, it, vi } from "vitest";
import initSqlJs from "sql.js";
import { clearMirror, createBrowserMirrorConnector } from "../storage/connectors/browserMirror";
import { isEncryptedDatabase } from "./sqliteCrypto";
import { createSqliteFileDocStore, saveSqlitePassphrase, splitConnectorSettings } from "./sqliteFileStore";
import { DocConflictError } from "./types";

// The browser-mirror connector (in-memory in Node) stands in for the
// hosting: two store instances = two editors sharing the same file.
const cfg = { connectorId: "browser-mirror", settings: {}, path: "admin/data/cms.sqlite" };
const mirror = createBrowserMirrorConnector({});

beforeEach(async () => {
  await clearMirror();
  const ls = new Map<string, string>();
  vi.stubGlobal("window", {
    localStorage: {
      getItem: (k: string) => ls.get(k) ?? null,
      setItem: (k: string, v: string) => void ls.set(k, v),
      removeItem: (k: string) => void ls.delete(k),
    },
  });
});

async function readFile() {
  const bytes = await mirror.getBytes!(cfg.path);
  const SQL = await initSqlJs();
  return new SQL.Database(bytes!);
}

const post = (id: string, title: string) => ({ id, type: "post", title, slug: title.toLowerCase(), contentMarkdown: "x" });

describe("sqlite-file doc store", () => {
  it("starts empty, then writes a real SQLite file with one table per collection", async () => {
    const store = createSqliteFileDocStore(cfg);
    await store.ready();
    expect(store.list("posts")).toEqual([]);
    expect(await mirror.getBytes!(cfg.path)).toBeNull();

    await store.write([{ op: "set", collection: "posts", doc: post("P1", "Hello") }]);
    const db = await readFile();
    expect(db.exec("SELECT json_extract(data, '$.title') FROM posts")[0].values).toEqual([["Hello"]]);
    expect(db.exec("SELECT value FROM meta WHERE key = 'format'")[0].values).toEqual([["flexweg-cms"]]);
    db.close();

    const again = createSqliteFileDocStore(cfg);
    await again.ready();
    expect(again.get("posts", "P1")).toMatchObject({ title: "Hello" });
  });

  it("rebases onto another editor's save when they touched other documents", async () => {
    const a = createSqliteFileDocStore(cfg);
    const b = createSqliteFileDocStore(cfg);
    await a.ready();
    await b.ready();
    await a.write([{ op: "set", collection: "posts", doc: post("P1", "From A") }]);
    await b.write([{ op: "set", collection: "posts", doc: post("P2", "From B") }]);
    const fresh = createSqliteFileDocStore(cfg);
    await fresh.ready();
    expect(fresh.list("posts").map((p) => p.id).sort()).toEqual(["P1", "P2"]);
  });

  it("refuses to overwrite a document another editor changed", async () => {
    const a = createSqliteFileDocStore(cfg);
    await a.ready();
    await a.write([{ op: "set", collection: "posts", doc: post("P1", "Original") }]);
    const b = createSqliteFileDocStore(cfg);
    await b.ready();
    await b.write([{ op: "set", collection: "posts", doc: post("P1", "B edit") }]);
    await expect(a.write([{ op: "set", collection: "posts", doc: post("P1", "A edit") }])).rejects.toBeInstanceOf(
      DocConflictError,
    );
    expect(a.get("posts", "P1")).toMatchObject({ title: "Original" });
    await a.refresh();
    expect(a.get("posts", "P1")).toMatchObject({ title: "B edit" });
  });

  it("never writes secrets into the file", async () => {
    const store = createSqliteFileDocStore(cfg);
    await store.ready();
    await store.write([
      { op: "set", collection: "config", doc: { id: "storage", connectorId: "s3", settings: { bucket: "b", secretAccessKey: "SK" } } },
    ]);
    const db = await readFile();
    const raw = JSON.stringify(db.exec("SELECT data FROM config"));
    db.close();
    expect(raw).toContain('\\"bucket\\":\\"b\\"');
    expect(raw).not.toContain("SK");
    // Same browser: merged back.
    const again = createSqliteFileDocStore(cfg);
    await again.ready();
    expect(again.get("config", "storage")).toMatchObject({ settings: { secretAccessKey: "SK" } });
  });

  it("asks for credentials when the connector's secrets are missing", async () => {
    const s3 = createSqliteFileDocStore({
      connectorId: "s3",
      settings: { bucket: "b", accessKeyId: "AK", siteUrl: "https://x", region: "auto" },
      path: "admin/cms.sqlite",
    });
    expect(await s3.identity()).toBeNull();
    expect(await createSqliteFileDocStore(cfg).identity()).toMatchObject({ role: "admin" });
  });

  it("splits connector settings into public and secret parts", () => {
    expect(splitConnectorSettings({ repo: "r", token: "t", nested: { apiKey: "k", a: 1 } })).toEqual({
      publicSettings: { repo: "r", nested: { a: 1 } },
      secrets: { token: "t", nested: { apiKey: "k" } },
    });
  });

  describe("encrypted", () => {
    const enc = { ...cfg, encrypted: true };

    it("writes an unreadable file that only the passphrase opens", async () => {
      saveSqlitePassphrase("correct horse battery staple");
      const store = createSqliteFileDocStore(enc);
      expect(await store.identity()).toMatchObject({ role: "admin" });
      await store.write([{ op: "set", collection: "posts", doc: post("P1", "Secret draft") }]);
      const bytes = (await mirror.getBytes!(cfg.path))!;
      expect(isEncryptedDatabase(bytes)).toBe(true);
      expect(Buffer.from(bytes).toString("latin1")).not.toContain("Secret draft");

      const again = createSqliteFileDocStore(enc);
      await again.ready();
      expect(again.get("posts", "P1")).toMatchObject({ title: "Secret draft" });
    }, 20_000);

    it("asks for the passphrase when missing or wrong", async () => {
      saveSqlitePassphrase("correct horse battery staple");
      const writer = createSqliteFileDocStore(enc);
      await writer.write([{ op: "set", collection: "posts", doc: post("P1", "x") }]);

      saveSqlitePassphrase(null);
      const noPass = createSqliteFileDocStore(enc);
      expect(await noPass.identity()).toBeNull();
      expect(noPass.passphraseProblem()).toBe("missing");

      saveSqlitePassphrase("wrong passphrase!!");
      const wrong = createSqliteFileDocStore(enc);
      expect(await wrong.identity()).toBeNull();
      expect(wrong.passphraseProblem()).toBe("wrong");

      // config.js lost the flag: the encrypted file is still detected.
      const unflagged = createSqliteFileDocStore(cfg);
      expect(await unflagged.identity()).toBeNull();
      expect(unflagged.passphraseProblem()).toBe("wrong");
    }, 20_000);

    it("encrypts an existing plain database on its next save", async () => {
      const plain = createSqliteFileDocStore(cfg);
      await plain.write([{ op: "set", collection: "posts", doc: post("P1", "Before") }]);
      expect(isEncryptedDatabase(await mirror.getBytes!(cfg.path))).toBe(false);
      saveSqlitePassphrase("correct horse battery staple");
      const store = createSqliteFileDocStore(enc);
      await store.ready();
      expect(store.get("posts", "P1")).toMatchObject({ title: "Before" });
      await store.write([{ op: "set", collection: "posts", doc: post("P2", "After") }]);
      expect(isEncryptedDatabase(await mirror.getBytes!(cfg.path))).toBe(true);
    }, 20_000);

    it("turns encryption on, then changes the passphrase (rekey)", async () => {
      const plain = createSqliteFileDocStore(cfg);
      await plain.write([{ op: "set", collection: "posts", doc: post("P1", "Kept") }]);
      expect(plain.isEncrypted()).toBe(false);
      await expect(plain.rekey("short")).rejects.toThrow(/12 characters/);

      await plain.rekey("first passphrase 123");
      expect(plain.isEncrypted()).toBe(true);
      const first = (await mirror.getBytes!(cfg.path))!;
      expect(isEncryptedDatabase(first)).toBe(true);
      // Later saves keep working with the new key.
      await plain.write([{ op: "set", collection: "posts", doc: post("P2", "After") }]);

      await plain.rekey("second passphrase 456");
      const second = (await mirror.getBytes!(cfg.path))!;
      // Fresh salt → a different key.
      expect(Buffer.from(second.slice(12, 28)).equals(Buffer.from(first.slice(12, 28)))).toBe(false);

      saveSqlitePassphrase("first passphrase 123");
      const stale = createSqliteFileDocStore(cfg);
      expect(await stale.identity()).toBeNull();
      expect(stale.passphraseProblem()).toBe("wrong");

      saveSqlitePassphrase("second passphrase 456");
      const fresh = createSqliteFileDocStore(cfg);
      await fresh.ready();
      expect(fresh.list("posts").map((p) => p.title).sort()).toEqual(["After", "Kept"]);
    }, 30_000);
  });
});
