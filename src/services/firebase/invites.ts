import { collection, deleteDoc, doc, getDoc, onSnapshot, serverTimestamp, setDoc } from "firebase/firestore";
import type { UserRole } from "../../core/types";
import { collections, getDb } from "../firebaseClient";

// Invitations (Firebase backend only): an admin lists the email
// addresses allowed to join. On first sign-in — password, email link
// or Google — the rules let a VERIFIED address create its users/{uid}
// record only with the role of its invitation. Anyone else who signs
// in gets no access. Document id = lower-case email.

// First sign-in of an address that has no record and can't get one:
// not verified yet (password accounts), or not invited by an admin.
export class AccountAccessError extends Error {
  constructor(public readonly reason: "unverified" | "not-invited") {
    super(reason === "unverified" ? "Email address not verified yet." : "This address has not been invited to this site.");
    this.name = "AccountAccessError";
  }
}

export interface Invite {
  email: string;
  role: UserRole;
  invitedBy?: string;
}

export function normalizeInviteEmail(email: string): string {
  return email.trim().toLowerCase();
}

export function subscribeToInvites(onChange: (invites: Invite[]) => void, onError?: (err: Error) => void): () => void {
  return onSnapshot(
    collection(getDb(), collections.invites),
    (snap) => onChange(snap.docs.map((d) => ({ email: d.id, ...(d.data() as Omit<Invite, "email">) })).sort((a, b) => a.email.localeCompare(b.email))),
    (err) => onError?.(err),
  );
}

export async function createInvite(email: string, role: UserRole, invitedBy: string): Promise<void> {
  const id = normalizeInviteEmail(email);
  await setDoc(doc(getDb(), collections.invites, id), { role, invitedBy, createdAt: serverTimestamp() });
}

export async function deleteInvite(email: string): Promise<void> {
  await deleteDoc(doc(getDb(), collections.invites, normalizeInviteEmail(email)));
}

// The invitation of the signed-in address (the rules let an invitee read
// their own), or null.
export async function readOwnInvite(email: string): Promise<Invite | null> {
  try {
    const snap = await getDoc(doc(getDb(), collections.invites, normalizeInviteEmail(email)));
    return snap.exists() ? { email: snap.id, ...(snap.data() as Omit<Invite, "email">) } : null;
  } catch (err) {
    if ((err as { code?: string }).code === "permission-denied") return null;
    throw err;
  }
}
