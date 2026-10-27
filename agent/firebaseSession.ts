import { existsSync, rmSync } from "node:fs";
import { homePath, readJsonFile, writeJsonFile } from "./home";

// Firebase sign-in for the site-administration commands, with the
// session kept between runs: ~/.agentcms/sessions/<account>.json (mode
// 0600, like credentials.json) holds what the Firebase SDK would keep in
// a browser (the user record + its refresh token). A command then reuses
// the session and at most refreshes its ID token, instead of signing in
// again — Firebase rate-limits password sign-ins (auth/quota-exceeded
// after a few dozen quick commands).

interface SavedSession {
  email: string;
  items: Record<string, unknown>;
}

function sessionFile(account: string): string {
  return homePath("sessions", `${account.replace(/[^a-z0-9._-]+/gi, "_")}.json`);
}

export function forgetFirebaseSession(account: string): void {
  const f = sessionFile(account);
  if (existsSync(f)) rmSync(f, { force: true });
}

// A Firebase Auth persistence backed by the session file — the same
// shape as the SDK's React Native persistence (getReactNativePersistence).
// The Node build of the SDK only offers in-memory persistence.
function filePersistence(account: string, email: string) {
  const file = sessionFile(account);
  const saved = readJsonFile<SavedSession | null>(file, null);
  const items: Record<string, unknown> = saved && saved.email === email ? { ...saved.items } : {};
  const flush = () => {
    if (Object.keys(items).length) writeJsonFile(file, { email, items } satisfies SavedSession, 0o600);
    else forgetFirebaseSession(account);
  };
  return class FileSessionPersistence {
    static type = "LOCAL" as const;
    readonly type = "LOCAL" as const;
    async _isAvailable(): Promise<boolean> {
      return true;
    }
    async _set(key: string, value: unknown): Promise<void> {
      items[key] = value;
      flush();
    }
    async _get<T>(key: string): Promise<T | null> {
      return (items[key] as T | undefined) ?? null;
    }
    async _remove(key: string): Promise<void> {
      delete items[key];
      flush();
    }
    _addListener(): void {}
    _removeListener(): void {}
  };
}

export async function signInFirebase(account: string, email: string, password: string): Promise<void> {
  const { getRuntimeConfig } = await import("../src/lib/runtimeConfig");
  const config = getRuntimeConfig();
  if (config?.backend !== "firebase") throw new Error("signInFirebase: the active backend is not Firebase.");
  const { getApps, initializeApp } = await import("firebase/app");
  const { initializeAuth, getAuth, signInWithEmailAndPassword, signOut } = await import("firebase/auth");
  type Persistence = NonNullable<Parameters<typeof initializeAuth>[1]>["persistence"];
  const app = getApps()[0] ?? initializeApp(config.firebase);
  // The instance getAuthClient() (getAuth) returns afterwards.
  let auth;
  try {
    auth = initializeAuth(app, { persistence: filePersistence(account, email.trim()) as unknown as Persistence });
  } catch {
    auth = getAuth(app); // already initialised in this process
  }
  await auth.authStateReady();
  const current = auth.currentUser;
  if (current && current.email?.toLowerCase() === email.trim().toLowerCase()) {
    try {
      await current.getIdToken();
      return;
    } catch {
      // Revoked / expired refresh token, changed password: sign in again.
    }
  }
  if (current) await signOut(auth).catch(() => {});
  await signInWithEmailAndPassword(auth, email.trim(), password);
}
