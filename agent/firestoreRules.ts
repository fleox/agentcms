// The AgentCMS Firestore security rules, taken from the README (their
// single source of truth) at build time, with the bootstrap admin email
// pinned — what the setup wizard tells the user to paste.
import readme from "../README.md?raw";

export function firestoreRules(email: string): string {
  const section = readme.split("## Firestore security rules")[1] ?? "";
  const m = /```[a-z]*\n([\s\S]*?)```/.exec(section);
  if (!m) throw new Error("Firestore rules not found in README.md");
  return m[1].replace('return "you@example.com";', `return ${JSON.stringify(email.trim().toLowerCase())};`);
}
