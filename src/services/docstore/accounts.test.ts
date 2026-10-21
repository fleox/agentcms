import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { User as FirebaseUser } from "firebase/auth";
import { Timestamp } from "firebase/firestore";
import { createMemoryDocStore, setDocStoreForTests, type DocStore, type DocStoreIdentity } from "./index";
import * as docstoreUsers from "./users";
import * as docstoreAuth from "./auth";

// Type-level drift checks: the docstore impls must be assignable to the
// Firebase impls the dispatchers type themselves on.
const _u: typeof import("../firebase/users") = docstoreUsers;
const _a: typeof import("../firebase/auth") = docstoreAuth;
void _u;
void _a;

const fred: DocStoreIdentity = { uid: "github:fred", email: "Fred@Example.com", displayName: "Fred", role: "admin" };

let identity: DocStoreIdentity | null;
let store: DocStore;

function install(seed?: Parameters<typeof createMemoryDocStore>[0]) {
  const base = createMemoryDocStore(seed, null);
  store = { ...base, identity: async () => identity };
  setDocStoreForTests(store);
}

function asUser(i: DocStoreIdentity): FirebaseUser {
  return { uid: i.uid, email: i.email, displayName: i.displayName } as unknown as FirebaseUser;
}

const flush = () => new Promise((r) => setTimeout(r, 5));

beforeEach(() => {
  identity = fred;
  docstoreAuth.resetDocStoreAuthForTests();
  install();
});

afterEach(() => {
  setDocStoreForTests(null);
});

describe("docstore users", () => {
  it("creates the self record with the identity role", async () => {
    const rec = await docstoreUsers.ensureSelfUserRecord(asUser(fred));
    expect(rec).toMatchObject({
      id: "github:fred",
      email: "fred@example.com",
      role: "admin",
      disabled: false,
      displayName: "Fred",
      preferences: { adminLocale: "en" },
      createdBy: "github:fred",
    });
    expect(rec.createdAt).toBeInstanceOf(Timestamp);
    // Stored as epoch ms, never as a Timestamp.
    expect(typeof store.get("users", "github:fred")?.createdAt).toBe("number");
  });

  it("refreshes the stored role from the identity and keeps profile fields", async () => {
    install({
      users: [
        { id: "github:fred", email: "fred@example.com", role: "editor", disabled: false, firstName: "Frédéric", createdAt: 1000 },
      ],
    });
    const rec = await docstoreUsers.ensureSelfUserRecord(asUser(fred));
    expect(rec.role).toBe("admin");
    expect(rec.firstName).toBe("Frédéric");
    expect(rec.createdAt?.toMillis()).toBe(1000);
  });

  it("does not write when the record is already current", async () => {
    await docstoreUsers.ensureSelfUserRecord(asUser(fred));
    const spy = vi.spyOn(store, "write");
    await docstoreUsers.ensureSelfUserRecord(asUser(fred));
    expect(spy).not.toHaveBeenCalled();
  });

  it("editor identity lands as editor", async () => {
    identity = { ...fred, uid: "github:bob", email: "bob@x.io", role: "editor" };
    const rec = await docstoreUsers.ensureSelfUserRecord(asUser(identity));
    expect(rec.role).toBe("editor");
  });

  it("lists users sorted by email and streams changes", async () => {
    install({
      users: [
        { id: "b", email: "zed@x.io", role: "editor", disabled: false },
        { id: "a", email: "amy@x.io", role: "editor", disabled: false },
      ],
    });
    const seen: string[][] = [];
    const unsub = docstoreUsers.subscribeToUsers((users) => seen.push(users.map((u) => u.email)));
    await flush();
    await docstoreUsers.setUserDisabled("b", true);
    unsub();
    expect(seen[0]).toEqual(["amy@x.io", "zed@x.io"]);
    expect(seen.length).toBe(2);
    expect((await docstoreUsers.getUserRecord("b"))?.disabled).toBe(true);
  });

  it("profile patch clears empty fields and cleans socials; preferences merge", async () => {
    install({
      users: [{ id: "a", email: "a@x.io", role: "editor", disabled: false, bio: "old", title: "T" }],
    });
    await docstoreUsers.setUserProfile("a", {
      bio: "",
      firstName: "Ann",
      socials: { linkedin: { url: " https://linkedin.com/a ", visible: true }, twitter: { url: "", visible: true } },
    });
    await docstoreUsers.setUserPreferences("a", { adminLocale: "fr" });
    const rec = await docstoreUsers.getUserRecord("a");
    expect(rec?.bio).toBeUndefined();
    expect(rec?.title).toBe("T");
    expect(rec?.firstName).toBe("Ann");
    expect(rec?.socials).toEqual({ linkedin: { url: "https://linkedin.com/a", visible: true } });
    expect(rec?.preferences?.adminLocale).toBe("fr");
    await docstoreUsers.setUserRole("a", "admin");
    expect((await docstoreUsers.getUserRecord("a"))?.role).toBe("admin");
    await docstoreUsers.deleteUserRecord("a");
    expect(await docstoreUsers.getUserRecord("a")).toBeNull();
  });

  it("buildAuthorLookup never leaks email", () => {
    const lookup = docstoreUsers.buildAuthorLookup(
      [
        { id: "a", email: "a@x.io", role: "editor", disabled: false },
        { id: "b", email: "b@x.io", role: "editor", disabled: false, firstName: "Bea" },
      ],
      [],
    );
    expect(lookup("a")).toBeUndefined();
    expect(lookup("b")?.displayName).toBe("Bea");
  });

  it("syncUsersFromApi is a harmless no-op", async () => {
    await docstoreUsers.ensureSelfUserRecord(asUser(fred));
    const spy = vi.spyOn(store, "write");
    expect((await docstoreUsers.syncUsersFromApi()).map((u) => u.id)).toEqual(["github:fred"]);
    expect(spy).not.toHaveBeenCalled();
  });
});

describe("docstore auth", () => {
  it("emits the identity user, null after signOut, then the new identity after notifyAuthChanged", async () => {
    const handler = vi.fn();
    docstoreAuth.setDocStoreSignOutHandler(handler);
    const seen: Array<{ uid: string; email: string | null } | null> = [];
    const unsub = docstoreAuth.subscribeToAuth((u) => seen.push(u ? { uid: u.uid, email: u.email } : null));
    await flush();
    expect(seen).toEqual([{ uid: "github:fred", email: "Fred@Example.com" }]);

    await docstoreAuth.signOut();
    expect(handler).toHaveBeenCalledOnce();
    expect(seen[seen.length - 1]).toBeNull();

    identity = { uid: "gitlab:42", email: "ann@x.io", displayName: "Ann", role: "editor" };
    await docstoreAuth.notifyAuthChanged();
    expect(seen[seen.length - 1]).toEqual({ uid: "gitlab:42", email: "ann@x.io" });
    unsub();
  });

  it("late subscribers get the cached state asynchronously", async () => {
    docstoreAuth.subscribeToAuth(() => {});
    await flush();
    const cb = vi.fn();
    docstoreAuth.subscribeToAuth(cb);
    expect(cb).not.toHaveBeenCalled();
    await flush();
    expect(cb.mock.calls[0][0]).toMatchObject({ uid: "github:fred", displayName: "Fred" });
  });

  it("emits null when the store has no identity", async () => {
    identity = null;
    const cb = vi.fn();
    docstoreAuth.subscribeToAuth(cb);
    await flush();
    expect(cb).toHaveBeenCalledWith(null);
  });

  it("probeBootstrapAdmin follows the identity role; signIn / reset are unsupported", async () => {
    expect(await docstoreAuth.probeBootstrapAdmin()).toBe(true);
    identity = { ...fred, role: "editor" };
    expect(await docstoreAuth.probeBootstrapAdmin()).toBe(false);
    identity = null;
    expect(await docstoreAuth.probeBootstrapAdmin()).toBe(false);
    await expect(docstoreAuth.signIn("a", "b")).rejects.toThrow(/access-token screen/);
    await expect(docstoreAuth.sendResetEmail("a")).rejects.toThrow();
    expect(docstoreAuth.authErrorKey({ status: 401 })).toBe("auth.errors.invalidCredentials");
    expect(docstoreAuth.authErrorKey(null)).toBe("auth.errors.generic");
  });
});
