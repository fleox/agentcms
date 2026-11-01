import { readFileSync } from "node:fs";
import { initializeTestEnvironment, assertFails, assertSucceeds } from "@firebase/rules-unit-testing";
import { doc, setDoc } from "firebase/firestore";
// The rules under test are always the ones of the public guide.
const md = readFileSync(new URL("../../../../docs/firebase.md", import.meta.url), "utf8");
const base = /```[a-z]*\n([\s\S]*?)```/.exec(md.split("## Firestore security rules")[1])[1].replace('return "you@example.com";', 'return "boss@example.com";');
const blocks = [...md.matchAll(/<summary><b>((?:Google accounts|Your company)[^<]*)<\/b>[^\n]*\n\n```\n([\s\S]*?)```/g)].map((m) => ({ name: m[1], helper: m[2] }));
const orig = /    function verifiedEmail\(\) \{[\s\S]*?\n    \}\n/.exec(base)[0];
let pass = 0, fail = 0;
const t = async (n, p) => { try { await p; pass++; console.log("ok  ", n); } catch (e) { fail++; console.log("FAIL", n, e.message.split("\n")[0]); } };
let port = 8080;
for (const b of blocks) {
  const rules = base.replace(orig, b.helper.split("\n").map((l) => (l ? "    " + l : l)).join("\n") + "\n");
  const env = await initializeTestEnvironment({ projectId: "v" + port, firestore: { rules, host: "127.0.0.1", port: 8080 } });
  globalThis.__envs = (globalThis.__envs ?? 0) + 1;
  const as = (uid, email, provider) => env.authenticatedContext(uid + port, { email, email_verified: true, firebase: { sign_in_provider: provider } }).firestore();
  const boss = as("boss", "boss@example.com", "password");
  await env.withSecurityRulesDisabled(async (c) => {
    const fs = c.firestore();
    for (const e of ["g@example.com", "p@example.com", "x@other.org"]) await setDoc(doc(fs, "invites/" + e), { role: "editor" });
  });
  const rec = (email) => ({ email, role: "editor", disabled: false, preferences: { adminLocale: "en" }, createdAt: new Date(), createdBy: "x" });
  await t(`[${b.name}] bootstrap admin (password) still works`, assertSucceeds(setDoc(doc(boss, "users/boss" + port), { ...rec("boss@example.com"), role: "admin" })));
  if (/Google/.test(b.name)) {
    await t(`[${b.name}] invited Google account joins`, assertSucceeds(setDoc(doc(as("g", "g@example.com", "google.com"), "users/g" + port), rec("g@example.com"))));
    await t(`[${b.name}] invited password account refused`, assertFails(setDoc(doc(as("p", "p@example.com", "password"), "users/p" + port), rec("p@example.com"))));
  } else {
    await t(`[${b.name}] invited company address joins`, assertSucceeds(setDoc(doc(as("p", "p@example.com", "password"), "users/p" + port), rec("p@example.com"))));
    await t(`[${b.name}] invited outside address refused`, assertFails(setDoc(doc(as("x", "x@other.org", "google.com"), "users/x" + port), rec("x@other.org"))));
  }
  await env.cleanup();
  port++;
}
console.log(`\n${pass} passed, ${fail} failed (${blocks.length} variants)`);
process.exit(fail ? 1 : 0);
