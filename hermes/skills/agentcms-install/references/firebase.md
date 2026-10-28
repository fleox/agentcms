# Firebase - Firestore content, email/password logins

Firebase keeps the content in Firestore and signs editors in with Firebase Authentication. Free tier is enough for most sites. The user needs a Google account.

## What the user does in the Firebase console (https://console.firebase.google.com)

Guide them step by step; none of it can be scripted without the `firebase` CLI.

1. **Create a project**. Google Analytics is not needed.
2. **Build → Authentication → Get started → Sign-in method → Email/Password → Enable.**
3. **Authentication → Users → Add user**: the admin's email and a strong password. This is the bootstrap administrator.
4. **Build → Firestore Database → Create database**: production mode, a region near the visitors.
5. **Firestore → Rules**: paste the AgentCMS rules with the admin email pinned, then **Publish**. Print them with:
   ```bash
   python3 <skill dir>/scripts/agentcms.py options --firebase-rules <admin email> --json
   ```
   Paste `data.rules`. If the `firebase` CLI is installed and signed in, `firebase deploy --only firestore:rules` with the rules saved as `firestore.rules` works too.
6. **Project settings (gear) → General → Your apps → Web app (</>)**: register an app with no hosting, then copy the `firebaseConfig` values. They are public (they end up in the site's config.js), so they can go in the plan.

## Credentials

The admin login is a secret: the user stores it themselves.

```bash
python3 <skill dir>/scripts/agentcms.py credentials set firebase:<name>
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
  }
}
```

Pair it with any hosting (GitHub Pages, S3, …) as usual.

## What `install --dry-run` checks, and the fixes

- **Sign-in fails:** wrong email or password, or Email/Password not enabled (step 2).
- **"not verified yet":** the bootstrap rules require a verified email. The CLI has just sent the verification email; the user clicks its link, then you retry.
- **"Firestore refused the admin probe":** the rules aren't published, or pin another email (step 5).
- **"Firestore unreachable":** the database wasn't created (step 4).
- **`content-exists`:** this project already publishes a site. Register it with `site add` (agentcms-manage) instead of installing over it.

Like the setup wizard, the publish target's keys (S3 secret, git token) are stored in Firestore `config/storage`, readable by the site's signed-in editors. Prefer a key limited to this site's bucket or repository.

## Editors

Create more editors in Authentication → Users. They appear in the admin's Users page after their first sign-in; the bootstrap admin can promote them there, or with `agentcms users role` (agentcms-admin).
