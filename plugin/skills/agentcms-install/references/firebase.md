# Firebase - Firestore content, email/password logins

Firebase keeps the content in Firestore and signs editors in with Firebase Authentication. Free tier is enough for most sites. The user needs a Google account.

## What the user does in the Firebase console (https://console.firebase.google.com)

Guide them step by step; none of it can be scripted without the `firebase` CLI. An illustrated walkthrough with a screenshot of every screen is at https://github.com/fleox/agentcms/blob/master/docs/firebase.md (send the user there if they get lost in the console).

1. **Create a project** (Get started → name → Continue). Google Analytics is not needed.
2. **Databases & Storage → Firestore → Create database**: Standard edition, a location near the visitors (it can't be changed later), **production mode**.
3. **Security → Authentication → Get started → Sign-in method → Email/Password → Enable → Save.**
4. **Authentication → Users → Add user**: the admin's email and a strong password. This is the bootstrap administrator.
5. **Firestore → Rules**: paste the AgentCMS rules with the admin email pinned, then **Publish**. Print them with:
   ```bash
   npx -y @agent-cms/agentcms@0.3.10 options --firebase-rules <admin email> --json
   ```
   Paste `data.rules`. If the `firebase` CLI is installed and signed in, `firebase deploy --only firestore:rules` with the rules saved as `firestore.rules` works too.
6. **Project settings (gear) → General → Your apps → Web app (</>)**: register an app with no hosting, then copy the `firebaseConfig` values. They are public (they end up in the site's config.js), so they can go in the plan.

## Credentials

The admin login is a secret: the user stores it themselves.

```bash
! npx -y @agent-cms/agentcms@0.3.10 credentials set firebase:<name>
```

It prompts for email and password (hidden).

## Plan fragment

```json
"data": {
  "backend": "firebase",
  "credential": "firebase:<name>",
  "firebase": {
    "apiKey": "…", "authDomain": "<project>.firebaseapp.com", "projectId": "<project>",
    "storageBucket": "<project>.firebasestorage.app", "messagingSenderId": "…", "appId": "…"
  },
  "signInMethods": ["password", "emailLink", "google"]
}
```

`signInMethods` (optional, default `["password"]`): which buttons the admin's login screen shows. Password is always on (the bootstrap admin and the CLI use it). Ask the user which ones their editors should use, one question:
- **Email link** - no password, Firebase emails a one-time link. Console: Authentication → Sign-in method → Email/Password → also turn on *Email link (passwordless sign-in)*.
- **Google** - *Continue with Google*. Console: Sign-in method → Add new provider → Google → Enable.
- For both: Authentication → Settings → **Authorized domains → Add domain** with the site's host (e.g. `my-login.github.io`), or sign-in fails with `auth/unauthorized-domain`.

Pair it with any hosting (GitHub Pages, S3, …) as usual.

## What `install --dry-run` checks, and the fixes

- **Sign-in fails:** wrong email or password, or Email/Password not enabled (step 2).
- **"not verified yet":** the bootstrap rules require a verified email. The CLI has just sent the verification email; the user clicks its link, then you retry.
- **"Firestore refused the admin probe":** the rules aren't published, or pin another email (step 5).
- **"Firestore unreachable":** the database wasn't created (step 4).
- **`content-exists`:** this project already publishes a site. Register it with `site add` (agentcms-manage) instead of installing over it.

Like the setup wizard, the publish target's keys (S3 secret, git token) are stored in Firestore `config/storage`, readable by the site's signed-in editors. Prefer a key limited to this site's bucket or repository.

## Editors - invitations

Signing in grants nothing by itself (anyone can create a Firebase account with the public apiKey, and Google / email-link sign-in is one click): only the bootstrap admin and **invited** addresses get a role. After install, invite the editors the user names:

```bash
npx -y @agent-cms/agentcms@0.3.10 users invite <email> --role editor --site <alias> --json   # or --role admin
```

Password accounts must also be created in Authentication → Users → Add user (same email); they verify their email at first sign-in. Email-link and Google editors need nothing else. Illustrated guide: https://github.com/fleox/agentcms/blob/master/docs/firebase.md#sign-in-methods
