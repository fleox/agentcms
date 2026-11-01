---
name: firebase-internals
description: Contributor notes for the Firebase backend of AgentCMS — Firestore security rules (docs/firebase.md is their single source), invitations, sign-in methods (password, email link, Google), the first sign-in flow, and how to test rules on the emulator. Invoke when changing src/services/firebase/, src/context/AuthContext.tsx, src/pages/LoginPage.tsx, the Users page invitations, the Firestore rules, or the `doctor` firestore-rules check, or when securing or debugging a Firebase site in this repository.
---

# Firebase backend — contributor notes (this repo)

Read [CLAUDE.md](../../../CLAUDE.md) first. User-facing guide: [docs/firebase.md](../../../docs/firebase.md). Don't commit unless asked. Never run `agentcms install` on the maintainer's Firebase project.

## The threat that shapes everything

A Firebase site's `apiKey` is public (it sits in `config.js`), so **anyone can create a Firebase account on the project**. Signing in proves nothing: authorization must come from Firestore data the rules control. Before 0.3.11 the rules let any signed-in account create its own editor record, which an emulator test confirmed. Don't reintroduce a path where an account grants itself access.

## Who gets in

| Address | Condition | Role |
|---|---|---|
| Bootstrap admin | Verified, equals the email pinned in the rules (never in `config.js`) | `admin` |
| Invited | Verified, `invites/{lower-case email}` exists | The invitation's `role` |
| Anyone else | | No record, no access |

- `invites/{email}` = `{ role, invitedBy?, createdAt }`. Admins read and write them; an invitee reads only their own. Ids must be lower-case: always go through `normalizeInviteEmail` (`src/services/firebase/invites.ts`).
- `ensureSelfUserRecord` (`src/services/firebase/users.ts`) runs at each sign-in. It returns an existing record, throws `AccountAccessError("unverified")` for an unverified address, tries `role: admin` (only the bootstrap admin passes), then on `permission-denied` reads the invitation and creates the record, or throws `AccountAccessError("not-invited")`.
- Existing records keep working when rules change: only record **creation** needs an invitation.
- Invitations exist on Firebase only. On the docstore backends the role comes from storage permissions.

## First sign-in: the race to remember

`AuthContext` must not subscribe to `users/{uid}` before the record exists. A listener started too early gets `permission-denied` and shows "Missing or insufficient permissions" even though the join succeeded (the 0.3.12 bug; reloading hid it). The subscription is therefore gated on `hasRecord`, and later `permission-denied` errors from it are ignored.

Same family: reading one's own missing record is denied by the rules, so `ensureSelfUserRecord` treats that as "no record yet". When adding a listener or read in the sign-in path, test a **brand-new invited account**, not a reload.

`accessIssue` + `retryAccess` route to `AccountAccessPage` (`src/pages/LoginPage.tsx`) from `App.tsx`: resend the verification email, or explain the address isn't invited.

## Sign-in methods

- Config: `signInMethods?: ("password" | "emailLink" | "google")[]` in the Firebase runtime config (`src/lib/runtimeConfig.ts`), read through `getSignInMethods()`. It isn't secret. `buildConfigJsSource` writes it only when it isn't just password.
- Enabling a method takes two steps: the admin's `config.js` (what the login screen offers) **and** Firebase console → Authentication → Sign-in method, plus the admin's domain in Authorized domains. Otherwise login fails with `auth/operation-not-allowed` or `auth/unauthorized-domain` (mapped in `authErrorKey`). Google also needs the provider's support email, and the email link needs Email/Password enabled with "Email link" ticked.
- Set at install (`data.signInMethods`, setup wizard checkboxes), changed later with `agentcms site sign-in-methods <list> --site <alias>`, which rewrites only `<adminFolder>/config.js` and updates the registry. **Password always stays**: the CLI signs in with `firebase:<name>` email + password.
- `sendSignInLink` returns to `adminReturnUrl()`. The address waits in localStorage (`agentcms.emailForSignIn`); a link opened in another browser asks for it. `completeEmailLinkSignIn` removes the one-time code from the URL and keeps the hash route.
- Google uses a popup on purpose: redirects lose their state when third-party storage is blocked.
- The email link and Google give a verified address straight away. Password accounts start unverified and must also be created in Authentication → Users.
- New auth functions need a stub in `src/services/docstore/auth.ts` and an export in the `src/services/auth.ts` dispatcher (the docstore tests pin signatures to the Firebase impl).

## Firestore rules

**`docs/firebase.md`, section "## Firestore security rules", is the single source.** The first code block there is what users publish:

- `agent/firestoreRules.ts` imports the file `?raw` and pins the email for `agentcms options --firebase-rules <email>`, so **any edit of docs/firebase.md changes `dist/agent`: rebuild and commit `dist/`**, or CI fails (this happened once).
- Keep the heading text and `return "you@example.com";` exactly: extraction relies on both.
- New collection = add it to `collections` in `src/services/firebaseClient.ts` **and** a rule in the doc.
- Changing the rules on released sites needs a migration note in "Updating Firestore security rules", a changelog entry, and usually a new `doctor --deep` check.
- `doctor --deep` reports `firestore-rules` by reading `invites` as the signed-in admin: `permission-denied` means the published rules are older than 0.3.11.
- The Google-only and company-domain variants replace the `verifiedEmail()` helper. They live in `<details>` under "Restricting the rules further".

### Testing rules on the emulator

Run this after **any** rules change. The harness in [`rules-test/`](rules-test/) reads the rules from docs/firebase.md:

- `test.mjs`: 22 scenarios (bootstrap admin, stranger, invitations, unverified account, role escalation, revocation).
- `variants.mjs`: the Google-only and company-domain variants.

Run it in place: its `.gitignore` covers `node_modules` and the emulator logs.

```bash
export PATH="/opt/homebrew/opt/openjdk@21/bin:$PATH"   # the emulator needs Java 21+
cd .claude/skills/firebase-internals/rules-test
npm install --legacy-peer-deps
npx firebase emulators:exec --only firestore --project agentcms-rules-test "node test.mjs"
npx firebase emulators:exec --only firestore --project agentcms-rules-test "node variants.mjs"
```

`PERMISSION_DENIED` lines in the output are the expected refusals: read the final `N passed, 0 failed` line. Add a scenario to `test.mjs` for each new rule, including the refusal.

## Securing a live site

1. `agentcms doctor --site <alias> --deep`.
2. `agentcms options --firebase-rules <bootstrap email> --json`; the **user** publishes the rules in the console, because the CLI has no rights there.
3. `agentcms users list --site <alias>`: check for unknown accounts, disable them.
4. `agentcms users invite <email> --role editor --site <alias>`.
5. `deploy-admin --site <alias> --yes` + `regenerate everything`, then `doctor --deep` again.

Test a change in the join flow with a real second address on `fbsite`.

## Checks before handing over

```bash
npm run typecheck && npx vitest run src
npm run build          # needed whenever docs/firebase.md changed
npm run check:skills
```

Update `plugin/skills/agentcms-install/references/firebase.md`, `agentcms-manage` and `agentcms-admin` when the behaviour changes, and the `auth`, `users.invites`, `setup.signInMethods` keys in all 7 locales.
