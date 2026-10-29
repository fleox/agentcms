# Self-hosting the admin

How to get the admin running without an agent: the setup wizard, a local build, deploying and updating the admin, and keeping it private. With an AI agent, start from the [README](../README.md#quick-start) instead.

## Setup

The easiest path is the agent / CLI install from the [README](../README.md#quick-start), or the in-app setup wizard. There are two ways to get the admin running:

- **No-build path** — use a pre-built admin (`npx -y @agent-cms/agentcms serve`, or the `dist/admin/` folder of a release served from any static host or `npm run preview`), open it, and follow the **first-run setup wizard**. Best when handing the admin to a non-technical user — they don't need to clone the repo.
- **Local build path** — clone the repo, optionally fill `.env` with Firebase credentials, run `npm run dev` / `npm run build`. Best when you're iterating on theme or plugin code. *`.env` only pre-configures the Firebase backend; the other backends go through the wizard.*

Both paths converge on the same runtime: the wizard saves the runtime config in the browser and, when the admin is hosted on the publish target, writes a populated `config.js` next to it, so the next load boots exactly like a build with `.env` baked in. The single command `npm run build` covers both — there is no separate "portable" build target.

### The setup wizard

The wizard asks two independent questions, then installs:

1. **Data** — SQLite file (default), Markdown in a Git repository, Firebase, or this browser. Firebase asks for the 6 web-app config fields + the bootstrap admin email and password, signs in and checks the pinned Firestore rules (see below). Markdown asks for the repository and your access token and checks write access (an already-initialised content repo is detected and its publish target reused).
2. **Hosting** — where the site is published: GitHub Pages, Cloudflare Pages, GitLab Pages, another git host, an S3-compatible bucket, a local folder, or a ZIP download. The connection is tested before you can continue. With SQLite, this step also asks where the database file goes (path, encryption passphrase, optional separate private location).
3. **Install** — saves the publish target, prepares the content store, syncs the theme assets, and — when *Also host the admin on this site* is ticked — copies the admin itself plus a `config.js` into a folder of the target (default `admin`). Otherwise the runtime config stays in this browser and the wizard offers `config.js` as a download for the folder where you host the admin.

`config.js` never contains secrets (tokens, S3 keys, the SQLite passphrase). The Firebase web config it may contain is public by design.

### Path A — Local build with `.env` (Firebase)

1. Clone the repo and install dependencies:

   ```bash
   npm install --legacy-peer-deps
   ```

2. Optionally copy the env template and fill in your Firebase project credentials (skip this to use the setup wizard instead):

   ```bash
   cp .env.example .env
   ```

   Variables:

   - `VITE_FIREBASE_API_KEY`, `VITE_FIREBASE_AUTH_DOMAIN`, `VITE_FIREBASE_PROJECT_ID`, `VITE_FIREBASE_STORAGE_BUCKET`, `VITE_FIREBASE_MESSAGING_SENDER_ID`, `VITE_FIREBASE_APP_ID`
   - `VITE_ADMIN_EMAIL` (**optional, legacy**) — email of the bootstrap administrator. The current bootstrap-admin flow detects the admin via a Firestore rules probe (`config/admin`), so this env var is not required. Existing dev environments that have it set continue to work as a backward-compat fallback. The pinned admin email **must** still be set in your Firestore security rules.

3. Start the dev server:

   ```bash
   npm run dev
   ```

   The admin runs on `http://localhost:5173`.

4. Configure Firestore security rules (see [Firestore security rules](firebase.md#firestore-security-rules) below).

5. Sign in with the bootstrap admin email/password (created in Firebase Auth), open **Settings**, fill in the site title, language (BCP-47, e.g. `en` or `fr-FR`) and public site URL, and choose a publish target under **Settings → Publish target** (until then, the site is rendered into the in-browser ZIP mirror).

### Path B — No-build deployment (setup wizard)

1. Get a built admin: `npx -y @agent-cms/agentcms serve` runs one locally; otherwise run `npm run build` once and use `dist/admin/` (it ships with `config.js` set to a null stub), served from any static host or with `npm run preview`.

2. **Firebase only** — before opening the wizard, configure the Firestore security rules with the bootstrap admin email you'll use (see [Firestore security rules](firebase.md#firestore-security-rules) below) and create that user in **Firebase Console → Authentication → Users → Add user**. Without the rules, the wizard stops with a message giving the email to pin.

3. Open the admin and follow the wizard (Terms → Data → Hosting → Install, see above). Each failure mode has a specific error message: invalid Firebase credentials, mismatched admin email, Firestore rules not yet configured, repository without write access, publish target that doesn't answer, wrong SQLite passphrase…

4. To make the admin available to other editors, keep *Also host the admin on this site* ticked on the Install step (or later: **Settings → Publish target → Admin on this site**), or upload `dist/admin/` plus the downloaded `config.js` to any static host yourself.

## Building & deploying

```bash
npm run build
```

This produces (among others — `dist/agent/` holds the CLI) two folders inside `dist/`, each mapping 1:1 to a path on the public site:

```
dist/
├── admin/                  → the admin, e.g. /admin/ on your hosting
│   ├── index.html
│   ├── admin-files.json    file list used to copy the admin onto a publish target
│   └── assets/
└── theme-assets/           → /theme-assets/ (site root)
    └── <theme-id>.css      one CSS file per theme directory
```

The split mirrors the public site layout: every published page contains a `<link rel="stylesheet" href="/theme-assets/<id>.css">` pointing to the site root, **never** to `/admin/...`. Keeping `theme-assets/` at the top level of `dist/` makes the deployment story obvious: drop each folder where its name says it belongs.

**First deploy** — the setup wizard (*Also host the admin on this site*) or `npx -y @agent-cms/agentcms install` copies the admin onto the publish target and uploads the theme assets for you. You can also upload `dist/admin/` (plus the `config.js` downloaded from the wizard) to any static host by hand; the theme CSS is pushed by the wizard / **Themes → Sync theme assets**, so `dist/theme-assets/` rarely needs a manual upload.

**Subsequent deploys** — update the hosted admin with **Settings → Publish target → Admin on this site → Deploy / update the admin** or `agentcms deploy-admin --site <alias> --yes` (or re-upload `dist/admin/` by hand), then open **Themes → Sync theme assets** to push the new theme CSS to the public root. The CSS is embedded inside the admin bundle (Vite `?inline`), so the sync button always uploads the version that shipped with the current admin — no need to manually re-upload `dist/theme-assets/`.

After that, every publish action from the admin writes HTML/asset files directly to the publish target — no further deploys required for content updates.

## Renaming the admin folder for obscurity

By default the admin SPA is deployed to `/admin/` on the site. You can rename that folder to anything you want — for example a random-looking string like `/erf34f654GH3/` — to make it slightly harder for crawlers and casual scanners to find it.

The admin auto-detects its folder name from the URL on every load (via `window.location.pathname`) and uses it as the prefix for the plugin / theme uploads (`plugins/<id>/`, `themes/<id>/`). No code change, no rebuild — host the admin under the new folder (pick it on the wizard's *Also host the admin on this site* step or in **Settings → Publish target → Admin on this site**, or move the folder on your hosting) and re-open the admin from the new URL.

Two rules:

- **Don't deploy at the site root.** Mixing admin assets (`config.js`, plugin folders, theme bundles) with the public site's HTML pages is a footgun that's easier to prevent than to recover from — the wizard never writes `config.js` at the site root. Always put the admin under a subfolder, even if you don't care about obscurity.
- **Clean up the old folder.** After moving the admin, delete the previous folder from the hosting: leftover files would still be reachable via direct URL.

Note that this is **security through obscurity** — the random folder name only stops naive HTTP-level crawlers. The real protection of the admin is still: the `<meta name="robots">` tag, `Disallow: /admin/` in `robots.txt`, the bootstrap admin email + password, and the Firestore security rules. Adjust your `robots.txt` to match the new folder name when renaming, otherwise crawlers ignore the disallow rule.

## Admin privacy

The admin SPA at `/admin/` is internal-only — it should not appear in search results. Two layers keep it out of indexes:

1. **`/admin/index.html` ships with three meta tags**: `<meta name="robots" content="noindex, nofollow, noarchive">`, the same with `name="googlebot"`, and `<meta name="google" content="notranslate">`. These cover crawlers that read meta but ignore robots.txt.
2. **`robots.txt` defaults to `Disallow: /admin/`** when the bundled `agentcms-sitemaps` plugin generates it. Crawlers that honour robots.txt skip the path entirely.

If you've customised `robots.txt`, make sure to keep the `Disallow: /admin/` line. The plugin's **Insert default** button re-injects it.

`/admin/config.js` carries the Firebase web config — which is **public by design** (security comes from Firestore rules + the auth-domain allowlist in Firebase Console, not from the secrecy of these values). The bootstrap admin email is **no longer written into `config.js`**; the client detects bootstrap-admin status via a Firestore probe on `config/admin` whose rule grants read access only to the matching pinned email with `email_verified == true`. The pinned email lives only in the Firestore rules. Publish-target secrets (git tokens, S3 keys) and the SQLite passphrase are **never** in `config.js` either: on the SQLite, Markdown and local backends they stay in each editor's browser; in Firebase mode the publish target settings live in Firestore at `config/storage`, readable only after a successful Firebase Auth sign-in.

Legacy deployments may still have an `adminEmail` field in their `/admin/config.js` (older builds wrote it there). The current admin reads it as an opt-in fallback for backward compatibility but never writes it back — re-running the SetupForm or replacing `config.js` with the new shape removes the field permanently. After updating the Firestore rules to the current template (with the `config/admin` probe rule + `email_verified` check), legacy callers are fully covered by the rules-driven path.

## Limitations

- In Firebase mode the publish target settings (including its token / keys) sit in Firestore `config/storage`. Any signed-in editor can read them via devtools — fine for an internal tool, do not deploy this pattern to a multi-tenant or public-facing app.
- The SQLite-file backend has no user accounts: protect the admin folder at the hosting level.
- The publisher serialises uploads to avoid hitting API rate limits; very large sites (hundreds of pages) take a while when "Regenerate site" runs.
- Without the bundled `agentcms-multilang` plugin, content is single-language per site (the public language). Admins choose their own UI language separately.
