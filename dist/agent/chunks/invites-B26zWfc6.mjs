import { createRequire as __acmsRequire } from "node:module";
import { fileURLToPath as __acmsPath } from "node:url";
import { dirname as __acmsDirname } from "node:path";
const require2 = __acmsRequire(import.meta.url);
const __filename = __acmsPath(import.meta.url);
const __dirname = __acmsDirname(__filename);
import { a9 as deleteDoc, d as doc, aQ as setDoc, aP as serverTimestamp, a as getDoc } from "./index.node-DYLwqGPq.mjs";
import { collections, getDb } from "./firebaseClient-BjUVAcKz.mjs";
import "./index.esm2017-BUfxW6Jp.mjs";
import "util";
import "crypto";
import "process";
import "tls";
import "fs";
import "os";
import "net";
import "events";
import "stream";
import "./_commonjsHelpers-DtUDk_0l.mjs";
import "path";
import "http2";
import "http";
import "url";
import "dns";
import "zlib";
import "./index-CuB-ym-g.mjs";
import "./index-CjBqWaZn.mjs";
import "./runtimeConfig-BNLCrrQo.mjs";
class AccountAccessError extends Error {
  constructor(reason) {
    super(reason === "unverified" ? "Email address not verified yet." : "This address has not been invited to this site.");
    this.reason = reason;
    this.name = "AccountAccessError";
  }
}
function normalizeInviteEmail(email) {
  return email.trim().toLowerCase();
}
async function createInvite(email, role, invitedBy) {
  const id = normalizeInviteEmail(email);
  await setDoc(doc(getDb(), collections.invites, id), { role, invitedBy, createdAt: serverTimestamp() });
}
async function deleteInvite(email) {
  await deleteDoc(doc(getDb(), collections.invites, normalizeInviteEmail(email)));
}
async function readOwnInvite(email) {
  try {
    const snap = await getDoc(doc(getDb(), collections.invites, normalizeInviteEmail(email)));
    return snap.exists() ? { email: snap.id, ...snap.data() } : null;
  } catch (err) {
    if (err.code === "permission-denied") return null;
    throw err;
  }
}
export {
  AccountAccessError,
  createInvite,
  deleteInvite,
  normalizeInviteEmail,
  readOwnInvite
};
