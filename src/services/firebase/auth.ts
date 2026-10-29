import {
  GoogleAuthProvider,
  isSignInWithEmailLink,
  onAuthStateChanged,
  sendEmailVerification,
  sendPasswordResetEmail,
  sendSignInLinkToEmail,
  signInWithEmailAndPassword,
  signInWithEmailLink,
  signInWithPopup,
  signOut as fbSignOut,
  type User as FirebaseUser,
} from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { collections, configDocs, getAuthClient, getDb } from "../firebaseClient";

export function subscribeToAuth(onChange: (user: FirebaseUser | null) => void): () => void {
  return onAuthStateChanged(getAuthClient(), onChange);
}

export async function signIn(email: string, password: string): Promise<FirebaseUser> {
  const cred = await signInWithEmailAndPassword(getAuthClient(), email.trim(), password);
  return cred.user;
}

// "Continue with Google": a popup (redirects lose their state when the
// browser blocks third-party storage). The provider must be enabled in
// Firebase console and the admin's domain listed in Authorized domains.
export async function signInWithGoogle(): Promise<FirebaseUser> {
  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({ prompt: "select_account" });
  const cred = await signInWithPopup(getAuthClient(), provider);
  return cred.user;
}

// Email link ("passwordless"): Firebase emails a one-time link back to
// this admin page. The address is kept in this browser to finish the
// sign-in without asking again (another browser asks for it).
const EMAIL_FOR_LINK_KEY = "agentcms.emailForSignIn";

function adminReturnUrl(): string {
  return `${window.location.origin}${window.location.pathname}`;
}

export async function sendSignInLink(email: string): Promise<void> {
  const address = email.trim();
  await sendSignInLinkToEmail(getAuthClient(), address, { url: adminReturnUrl(), handleCodeInApp: true });
  try {
    window.localStorage.setItem(EMAIL_FOR_LINK_KEY, address);
  } catch {
    // Storage blocked: the page asks for the address when the link opens.
  }
}

export function isEmailSignInLink(): boolean {
  return typeof window !== "undefined" && isSignInWithEmailLink(getAuthClient(), window.location.href);
}

export function emailForSignInLink(): string | null {
  try {
    return window.localStorage.getItem(EMAIL_FOR_LINK_KEY);
  } catch {
    return null;
  }
}

export async function completeEmailLinkSignIn(email: string): Promise<FirebaseUser> {
  const cred = await signInWithEmailLink(getAuthClient(), email.trim(), window.location.href);
  try {
    window.localStorage.removeItem(EMAIL_FOR_LINK_KEY);
  } catch {
    // ignore
  }
  // Drop the one-time code from the address bar (keeps the hash route).
  window.history.replaceState(null, "", adminReturnUrl() + window.location.hash);
  return cred.user;
}

// Password accounts start unverified: the rules only grant access to a
// verified address, so the waiting screen can resend the email.
export async function sendVerificationEmail(): Promise<void> {
  const user = getAuthClient().currentUser;
  if (user) await sendEmailVerification(user, { url: adminReturnUrl() });
}

export async function reloadCurrentUser(): Promise<FirebaseUser | null> {
  const user = getAuthClient().currentUser;
  if (!user) return null;
  await user.reload();
  // Refresh the ID token so Firestore sees email_verified right away.
  await user.getIdToken(true);
  return getAuthClient().currentUser;
}

export async function signOut(): Promise<void> {
  return fbSignOut(getAuthClient());
}

export async function sendResetEmail(email: string): Promise<void> {
  return sendPasswordResetEmail(getAuthClient(), email.trim());
}

// Probes whether the currently-signed-in user is the bootstrap admin
// by attempting to read `config/admin` — a doc whose Firestore rules
// grant read ONLY to the user whose email matches the rules-pinned
// bootstrap admin email.
//
// Why this exists: it lets the client identify the bootstrap admin
// without carrying the admin email in the public `/admin/config.js`.
// The rules stay the source of truth; the client is just asking
// "am I that user?" via a permission probe.
//
// Returns true on read success, false on permission-denied. Other
// errors (network, etc.) propagate so callers can decide whether to
// retry — we don't silently treat them as "not admin" because that
// would mask transient failures and degrade UX.
export async function probeBootstrapAdmin(): Promise<boolean> {
  try {
    await getDoc(doc(getDb(), collections.config, configDocs.admin));
    return true;
  } catch (err) {
    const code = (err as { code?: string })?.code ?? "";
    if (code === "permission-denied") return false;
    throw err;
  }
}

// Maps Firebase Auth error codes to translation keys consumed by the admin UI.
// Returning a key (not a translated string) lets callers run i18next with the
// active locale at render time.
export function authErrorKey(err: unknown): string {
  const e = err as { code?: string; message?: string } | null;
  const code = e?.code ?? "";
  switch (code) {
    case "auth/invalid-email":
      return "auth.errors.invalidEmail";
    case "auth/invalid-credential":
    case "auth/wrong-password":
    case "auth/user-not-found":
      return "auth.errors.invalidCredentials";
    case "auth/too-many-requests":
      return "auth.errors.tooManyRequests";
    case "auth/user-disabled":
      return "auth.errors.userDisabled";
    case "auth/network-request-failed":
      return "auth.errors.networkFailed";
    case "auth/popup-closed-by-user":
    case "auth/cancelled-popup-request":
      return "auth.errors.popupClosed";
    case "auth/popup-blocked":
      return "auth.errors.popupBlocked";
    case "auth/unauthorized-domain":
    case "auth/unauthorized-continue-uri":
      return "auth.errors.unauthorizedDomain";
    case "auth/operation-not-allowed":
      return "auth.errors.methodDisabled";
    case "auth/invalid-action-code":
    case "auth/expired-action-code":
      return "auth.errors.linkExpired";
    default:
      return "auth.errors.generic";
  }
}
