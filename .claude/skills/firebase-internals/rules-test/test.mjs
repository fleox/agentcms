import { readFileSync } from "node:fs";
import { initializeTestEnvironment, assertFails, assertSucceeds } from "@firebase/rules-unit-testing";
import { doc, getDoc, setDoc, deleteDoc, collection, getDocs } from "firebase/firestore";

// The rules under test are always the ones of the public guide.
const md = readFileSync(new URL("../../../../docs/firebase.md", import.meta.url), "utf8");
const rules = /```[a-z]*\n([\s\S]*?)```/.exec(md.split("## Firestore security rules")[1])[1].replace('return "you@example.com";', 'return "boss@example.com";');

const env = await initializeTestEnvironment({ projectId: "agentcms-rules-test", firestore: { rules, host: "127.0.0.1", port: 8080 } });
const as = (uid, email, verified = true, provider = "google.com") =>
  env.authenticatedContext(uid, { email, email_verified: verified, firebase: { sign_in_provider: provider } }).firestore();
const base = (email, role) => ({ email, role, disabled: false, preferences: { adminLocale: "en" }, createdAt: new Date(), createdBy: "x" });
let pass = 0, fail = 0;
async function t(name, p) { try { await p; pass++; console.log("ok  ", name); } catch (e) { fail++; console.log("FAIL", name, "-", e.message.split("\n")[0]); } }

const boss = as("boss", "boss@example.com");
const stranger = as("eve", "eve@evil.test");
const anna = as("anna", "anna@example.com");
const annaUnverified = as("anna2", "anna@example.com", false, "password");
const bob = as("bob", "bob@example.com");

await t("bootstrap admin creates own admin record", assertSucceeds(setDoc(doc(boss, "users/boss"), base("boss@example.com", "admin"))));
await t("bootstrap admin passes the config/admin probe", assertSucceeds(getDoc(doc(boss, "config/admin"))));
await t("stranger (Google) cannot create an editor record", assertFails(setDoc(doc(stranger, "users/eve"), base("eve@evil.test", "editor"))));
await t("stranger cannot read posts", assertFails(getDocs(collection(stranger, "posts"))));
await t("stranger cannot invite itself", assertFails(setDoc(doc(stranger, "invites/eve@evil.test"), { role: "editor" })));
await t("admin invites anna as editor", assertSucceeds(setDoc(doc(boss, "invites/anna@example.com"), { role: "editor", invitedBy: "boss" })));
await t("admin invites bob as admin", assertSucceeds(setDoc(doc(boss, "invites/bob@example.com"), { role: "admin" })));
await t("admin can't write an upper-case invite id", assertFails(setDoc(doc(boss, "invites/Bob@Example.com"), { role: "editor" })));
await t("admin can't invite with a bogus role", assertFails(setDoc(doc(boss, "invites/x@example.com"), { role: "owner" })));
await t("stranger cannot read anna's invite", assertFails(getDoc(doc(stranger, "invites/anna@example.com"))));
await t("anna reads her own invite", assertSucceeds(getDoc(doc(anna, "invites/anna@example.com"))));
await t("unverified anna (password) cannot create her record", assertFails(setDoc(doc(annaUnverified, "users/anna2"), base("anna@example.com", "editor"))));
await t("anna cannot take the admin role", assertFails(setDoc(doc(anna, "users/anna"), base("anna@example.com", "admin"))));
await t("anna creates her editor record", assertSucceeds(setDoc(doc(anna, "users/anna"), base("anna@example.com", "editor"))));
await t("anna (editor) writes a post", assertSucceeds(setDoc(doc(anna, "posts/p1"), { title: "Hi" })));
await t("anna cannot invite people", assertFails(setDoc(doc(anna, "invites/friend@example.com"), { role: "editor" })));
await t("anna cannot read the invite list", assertFails(getDocs(collection(anna, "invites"))));
await t("bob gets the invited admin role", assertSucceeds(setDoc(doc(bob, "users/bob"), base("bob@example.com", "admin"))));
await t("bob (admin) lists invites", assertSucceeds(getDocs(collection(bob, "invites"))));
await t("bob (admin) revokes an invite", assertSucceeds(deleteDoc(doc(bob, "invites/anna@example.com"))));
await t("bob (admin) is not the bootstrap admin", assertFails(getDoc(doc(bob, "config/admin"))));
await t("stranger still locked out after all this", assertFails(getDoc(doc(stranger, "posts/p1"))));

await env.cleanup();
console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
