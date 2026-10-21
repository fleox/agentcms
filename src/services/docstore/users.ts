// Document-store implementation of the users service ("markdown-git" /
// "local" backends). Records live in the `users` collection, one doc
// per uid, dates as epoch ms (converted to `Timestamp` on read).
//
// Who can sign in — and with which role — is decided by the storage
// itself (repo permissions for git, always admin for the single-user
// local store), surfaced through `getDocStore().identity()`. The
// stored records are therefore a profile directory: the CURRENT user's
// role is always identity.role (refreshed by ensureSelfUserRecord on
// login), the stored role of OTHER users is informational.
//
// Every write is a git commit on the git backend, so mutators only
// write when something actually changed.

import type { User as FirebaseUser } from "firebase/auth";
import type {
  AdminLocale,
  SocialEntry,
  SocialNetwork,
  UserPreferences,
  UserRecord,
  UserRole,
} from "../../core/types";
import { getDocStore, toMillis, toTimestamp, type StoredDoc } from "./index";

// Backend-independent constants / pure helpers: re-exported from the
// Firebase impl so the three backends can never drift apart.
export {
  USER_ROLES,
  resolveDisplayName,
  resolvePublicDisplayName,
  buildAuthorLookup,
} from "../firebase/users";
import { USER_ROLES } from "../firebase/users";

// Mirrors firebase/users.ts.UserProfilePatch.
export interface UserProfilePatch {
  firstName?: string | null;
  lastName?: string | null;
  title?: string | null;
  bio?: string | null;
  avatarMediaId?: string | null;
  socials?: Partial<Record<SocialNetwork, SocialEntry>> | null;
}

function docToUser(doc: StoredDoc): UserRecord {
  // Store docs are frozen; hand callers a mutable copy like Firestore does.
  const data = structuredClone(doc) as Record<string, unknown>;
  const record = { ...data } as unknown as UserRecord;
  record.role = (data.role as UserRole) ?? USER_ROLES.editor;
  record.disabled = !!data.disabled;
  const createdAt = toTimestamp(data.createdAt);
  if (createdAt) record.createdAt = createdAt;
  else delete (record as { createdAt?: unknown }).createdAt;
  return record;
}

function userToDoc(record: UserRecord): StoredDoc {
  const { createdAt, ...rest } = record;
  return { ...rest, createdAt: toMillis(createdAt) } as StoredDoc;
}

function readUser(uid: string): UserRecord | null {
  const doc = getDocStore().get("users", uid);
  return doc ? docToUser(doc) : null;
}

function listUsers(): UserRecord[] {
  return getDocStore()
    .list("users")
    .map(docToUser)
    .sort((a, b) => (a.email ?? "").localeCompare(b.email ?? ""));
}

async function writeUser(record: UserRecord, message: string): Promise<void> {
  await getDocStore().write([{ op: "set", collection: "users", doc: userToDoc(record) }], { message });
}

// Subscribe to the `users` collection: emits once loaded, then on every
// change touching it.
function watchUsers<T>(read: () => T, onChange: (v: T) => void, onError?: (err: Error) => void): () => void {
  const store = getDocStore();
  let active = true;
  let loaded = false;
  const emit = () => {
    if (!active || !loaded) return;
    try {
      onChange(read());
    } catch (err) {
      onError?.(err as Error);
    }
  };
  const unsub = store.subscribe((changed) => {
    if (changed.has("users")) emit();
  });
  store.ready().then(
    () => {
      loaded = true;
      emit();
    },
    (err) => {
      if (active) onError?.(err as Error);
    },
  );
  return () => {
    active = false;
    unsub();
  };
}

export function subscribeToUsers(
  onChange: (users: UserRecord[]) => void,
  onError?: (err: Error) => void,
): () => void {
  return watchUsers(listUsers, onChange, onError);
}

export async function getUserRecord(uid: string): Promise<UserRecord | null> {
  await getDocStore().ready();
  return readUser(uid);
}

export function subscribeToUserRecord(
  uid: string,
  onChange: (record: UserRecord | null) => void,
  onError?: (err: Error) => void,
): () => void {
  return watchUsers(() => readUser(uid), onChange, onError);
}

// Called from AuthContext on each sign-in. Creates the record on first
// login, otherwise refreshes the identity-owned fields (email, role).
// CMS-only fields (names, bio, avatar, socials, preferences, disabled)
// are preserved. Writes nothing when the record is already current.
// AuthContext can call this twice in a row at sign-in (StrictMode /
// re-subscription). Both calls would pass the "exists?" check before
// the first write lands and produce two commits — share the in-flight
// promise per uid instead.
const ensuring = new Map<string, Promise<UserRecord>>();

export function ensureSelfUserRecord(authUser: FirebaseUser): Promise<UserRecord> {
  const pending = ensuring.get(authUser.uid);
  if (pending) return pending;
  const run = ensureSelfUserRecordNow(authUser).finally(() => ensuring.delete(authUser.uid));
  ensuring.set(authUser.uid, run);
  return run;
}

async function ensureSelfUserRecordNow(authUser: FirebaseUser): Promise<UserRecord> {
  const store = getDocStore();
  await store.ready();
  const identity = await store.identity();
  const existing = readUser(authUser.uid);
  const role: UserRole =
    identity && identity.uid === authUser.uid ? identity.role : existing?.role ?? USER_ROLES.editor;
  const email = (authUser.email ?? "").toLowerCase();

  if (existing) {
    if (existing.email === email && existing.role === role) return existing;
    const next: UserRecord = { ...existing, email, role };
    await writeUser(next, `Update user ${email || authUser.uid}`);
    return readUser(authUser.uid) ?? next;
  }

  const created: UserRecord = {
    id: authUser.uid,
    email,
    role,
    disabled: false,
    preferences: { adminLocale: "en" as AdminLocale },
    createdAt: toTimestamp(Date.now()),
    createdBy: authUser.uid,
  };
  if (authUser.displayName) created.displayName = authUser.displayName;
  await writeUser(created, `Add user ${email || authUser.uid}`);
  return readUser(authUser.uid) ?? created;
}

// Informational for other users: their effective role comes from the
// storage permissions at their next sign-in.
export async function setUserRole(uid: string, role: UserRole): Promise<void> {
  if (role !== USER_ROLES.admin && role !== USER_ROLES.editor) {
    throw new Error("Invalid role.");
  }
  await getDocStore().ready();
  const current = readUser(uid);
  if (!current) throw new Error(`User ${uid} not found.`);
  if (current.role === role) return;
  await writeUser({ ...current, role }, `Set role of ${current.email || uid} to ${role}`);
}

export async function setUserDisabled(uid: string, disabled: boolean): Promise<void> {
  await getDocStore().ready();
  const current = readUser(uid);
  if (!current) throw new Error(`User ${uid} not found.`);
  if (current.disabled === Boolean(disabled)) return;
  await writeUser(
    { ...current, disabled: Boolean(disabled) },
    `${disabled ? "Disable" : "Enable"} user ${current.email || uid}`,
  );
}

// Merges under `preferences.*` so future preference fields survive
// partial updates. No-op when the record doesn't exist (like SQLite).
export async function setUserPreferences(uid: string, prefs: Partial<UserPreferences>): Promise<void> {
  if (!prefs.adminLocale) return;
  await getDocStore().ready();
  const current = readUser(uid);
  if (!current) return;
  const base: UserPreferences = current.preferences ?? { adminLocale: "en" as AdminLocale };
  if (base.adminLocale === prefs.adminLocale && current.preferences) return;
  await writeUser(
    { ...current, preferences: { ...base, adminLocale: prefs.adminLocale } },
    `Update preferences of ${current.email || uid}`,
  );
}

// Empty strings / null clear the field (Firestore deleteField()).
export async function setUserProfile(uid: string, patch: UserProfilePatch): Promise<void> {
  await getDocStore().ready();
  const current = readUser(uid);
  if (!current) throw new Error(`User ${uid} not found.`);
  const next = { ...current } as UserRecord & Record<string, unknown>;
  let touched = false;
  for (const key of ["firstName", "lastName", "title", "bio", "avatarMediaId"] as const) {
    if (!(key in patch)) continue;
    touched = true;
    const value = patch[key];
    if (value === null || value === undefined || value === "") delete next[key];
    else next[key] = value;
  }
  if ("socials" in patch) {
    touched = true;
    const value = patch.socials;
    // Drop entries with empty URLs (mirror firebase/users.ts cleanup).
    const cleaned: Partial<Record<SocialNetwork, SocialEntry>> = {};
    for (const [network, entry] of Object.entries(value ?? {}) as Array<[SocialNetwork, SocialEntry]>) {
      if (entry && typeof entry.url === "string" && entry.url.trim().length > 0) {
        cleaned[network] = { url: entry.url.trim(), visible: !!entry.visible };
      }
    }
    if (Object.keys(cleaned).length > 0) next.socials = cleaned;
    else delete next.socials;
  }
  if (!touched) return;
  await writeUser(next, `Update profile of ${current.email || uid}`);
}

export async function deleteUserRecord(uid: string): Promise<void> {
  await getDocStore().ready();
  const current = readUser(uid);
  if (!current) return;
  await getDocStore().write([{ op: "delete", collection: "users", id: uid }], {
    message: `Remove user ${current.email || uid}`,
  });
}

// SQLite-only in spirit (pulls accounts from the auth API). Accounts
// here come from the storage permissions, so there is nothing to sync:
// returns the current directory so callers behave identically.
export async function syncUsersFromApi(): Promise<UserRecord[]> {
  await getDocStore().ready();
  return listUsers();
}
