// Auth glue for the document-store backends ("markdown-git" / "local").
// Exposes the same shape as services/firebase/auth.ts so the top-level
// dispatcher (services/auth.ts) can swap impls based on backend.
//
// There is no password login: identity comes from the store itself
// (`getDocStore().identity()` — the git provider's token owner, or the
// single local user). The access-token screen stores the token through
// the git layer, then calls `notifyAuthChanged()` so subscribers
// re-resolve the identity. Sign-out runs an injectable handler (the git
// layer clears its token) and emits `null`.

import type { User as FirebaseUser } from "firebase/auth";
import { getDocStore, type DocStoreIdentity } from "./index";

type FirebaseUserLike = Pick<FirebaseUser, "uid" | "email" | "displayName">;

// Same subset of FirebaseUser the SQLite impl hands to AuthContext
// (uid / email / displayName). Cast through `unknown` because the
// remaining FirebaseUser fields are never read outside the auth layer.
function toFirebaseShape(identity: DocStoreIdentity): FirebaseUser {
  const view: FirebaseUserLike = {
    uid: identity.uid,
    email: identity.email,
    displayName: identity.displayName,
  };
  return view as unknown as FirebaseUser;
}

const subscribers = new Set<(user: FirebaseUser | null) => void>();
let cachedUser: FirebaseUser | null = null;
let resolvedOnce = false;
let resolveInflight: Promise<void> | null = null;
let signOutHandler: (() => void | Promise<void>) | null = null;

function emit(): void {
  for (const cb of Array.from(subscribers)) {
    try {
      cb(cachedUser);
    } catch (err) {
      console.error("subscribeToAuth listener threw", err);
    }
  }
}

async function resolveIdentity(): Promise<void> {
  if (resolveInflight) return resolveInflight;
  resolveInflight = (async () => {
    try {
      const identity = await getDocStore().identity();
      cachedUser = identity ? toFirebaseShape(identity) : null;
    } catch (err) {
      console.warn("[docstore-auth] identity lookup failed:", err);
      cachedUser = null;
    } finally {
      resolvedOnce = true;
      resolveInflight = null;
      emit();
    }
  })();
  return resolveInflight;
}

// Registered by the git layer (clears the stored access token). The
// local store has nothing to clear, so the default is a no-op.
export function setDocStoreSignOutHandler(fn: (() => void | Promise<void>) | null): void {
  signOutHandler = fn;
}

// Re-reads the identity and notifies subscribers. Called by the token
// login page after storing a token (and by anything that changes who
// the store acts as).
export async function notifyAuthChanged(): Promise<void> {
  // Chain behind an in-flight lookup so the new state always wins.
  if (resolveInflight) await resolveInflight;
  await resolveIdentity();
}

export function subscribeToAuth(onChange: (user: FirebaseUser | null) => void): () => void {
  subscribers.add(onChange);
  if (!resolvedOnce && !resolveInflight) {
    void resolveIdentity();
  } else if (resolvedOnce && !resolveInflight) {
    // Already resolved — emit on the next tick to match Firebase's
    // behaviour (callback never fires synchronously).
    const snapshot = cachedUser;
    setTimeout(() => {
      if (subscribers.has(onChange)) onChange(snapshot);
    }, 0);
  }
  return () => {
    subscribers.delete(onChange);
  };
}

export async function signIn(_email: string, _password: string): Promise<FirebaseUser> {
  throw new Error("Sign-in is handled by the access-token screen for this backend.");
}

export async function signOut(): Promise<void> {
  if (signOutHandler) await signOutHandler();
  cachedUser = null;
  resolvedOnce = true;
  emit();
}

export async function sendResetEmail(_email: string): Promise<void> {
  throw new Error("Password reset by email is not available for this backend.");
}

// The admin role flows from the storage permissions (repo access for
// git, always admin locally) — the identity IS the bootstrap answer.
export async function probeBootstrapAdmin(): Promise<boolean> {
  const identity = await getDocStore().identity();
  return identity?.role === "admin";
}

// Maps provider / store errors to the same i18n keys as the other impls
// (git provider errors carry an HTTP `status`, like SqliteApiError).
export function authErrorKey(err: unknown): string {
  const e = err as { status?: number; code?: string; message?: string } | null;
  if (!e) return "auth.errors.generic";
  const status = e.status;
  if (status === 401) return "auth.errors.invalidCredentials";
  if (status === 403) return "auth.errors.userDisabled";
  if (status === 409) return "auth.errors.invalidCredentials";
  if (status === 429) return "auth.errors.tooManyRequests";
  if (status === 400) return "auth.errors.invalidEmail";
  if (status === 0 || (typeof status === "undefined" && e.message?.includes("Failed to fetch"))) {
    return "auth.errors.networkFailed";
  }
  return "auth.errors.generic";
}

// Tests only: forget the cached identity and handlers.
export function resetDocStoreAuthForTests(): void {
  subscribers.clear();
  cachedUser = null;
  resolvedOnce = false;
  resolveInflight = null;
  signOutHandler = null;
}
