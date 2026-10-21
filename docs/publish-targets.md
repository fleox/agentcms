# Publish targets & data backends

Flexweg CMS separates two independent choices. The first-run setup wizard asks them in order — **1. Data** (where content lives, plus that backend's credentials), **2. Hosting** (where the site is published, tested before you can continue), **3. Install** (summary, then everything is created) — and both can be changed later in **Settings**:

| | What it decides | Options |
|---|---|---|
| **Data model** | How posts, pages, terms, media metadata, users and settings are stored | **SQLite** · **Markdown in a Git repo** · Firebase · **This browser (local)** |
| **Publish target** | Where the rendered static site (HTML, CSS, media, JSON) is uploaded | Flexweg · **Git repo** (GitHub Pages, Cloudflare Pages, GitLab Pages, Netlify…) · **S3-compatible bucket** · **Your own server (PHP bridge)** · **Download as ZIP** · **Local folder** |

The admin is a static SPA: it runs entirely in the browser, renders the site there and pushes the files through the publish target's API. Nothing needs a server of its own, which is also the main constraint: every target must be reachable from a browser (CORS) — FTP/SFTP aren't, hence the PHP bridge.

Some combinations have requirements: SQLite (Flexweg service) needs a Flexweg account (even if you publish elsewhere); the local backend is single-user and tied to one browser; local folders need Chrome or Edge.

---

## Publish targets

### Flexweg

The original target. API key + site URL, entered in the wizard or **Settings → Publish target**. Stored in `config/flexweg` (Firestore) or the SQLite `config` table.

### Git repository — GitHub Pages / Cloudflare Pages / GitLab Pages

Every publish becomes **one commit** in a repo; the host rebuilds the site from it. Settings:

- **Hosting** — GitHub Pages, Cloudflare Pages, GitLab Pages, or Other.
- **Provider / repo / branch** — `owner` + `repo` on GitHub, `group/project` on GitLab.
- **Folder in the repo** — where the site files go (`""` = repo root).
- **Access token** — leave empty when content is on the same provider (markdown-git backend): each editor then publishes with their own token. Otherwise:
  - GitHub: a *fine-grained* token, only this repository, permission **Contents: read and write**.
  - GitLab: a token with the **api** scope, Developer role or higher.
- **Public site URL** — e.g. `https://user.github.io/repo`. A sub-folder URL is fine: links are rewritten automatically (see *Sub-folder sites*).

Host specifics:

- **GitHub Pages** — Settings → Pages → *Deploy from a branch*, pick the branch and `/` or `/docs` (set the CMS folder to `""` or `docs` accordingly). The CMS adds a `.nojekyll` file so files are served verbatim. Publishing from a private repo needs a paid GitHub plan.
- **Cloudflare Pages** — create a project connected to the repo, **no build command**, output directory = the CMS folder. Works with private repos on the free plan. The free plan allows 500 builds / month: that's why each publish is a single commit.
- **GitLab Pages** — the folder defaults to `public`; the CMS creates a minimal `.gitlab-ci.yml` (only if the repo has none) that publishes it.
- **Other** — Netlify, Vercel, a server running `git pull`… anything that deploys from a repo.

The token needs write access but publishing never force-pushes: if someone else pushed meanwhile, the CMS rebases its commit.

### S3-compatible bucket

AWS S3, Cloudflare R2, Backblaze B2, OVHcloud, Scaleway, Wasabi, MinIO… Requests are signed (SigV4) in the browser.

- **Endpoint** — empty for AWS (built from the region); R2: `https://<account-id>.r2.cloudflarestorage.com`; MinIO: your server URL.
- **Region** — `auto` for R2.
- **Access key** — create one restricted to this bucket.
- **Public site URL** — the bucket website URL or your CDN domain.

The bucket needs a **CORS rule** allowing the admin's origin:

```json
[
  {
    "AllowedOrigins": ["https://admin.example.com"],
    "AllowedMethods": ["GET", "PUT", "DELETE"],
    "AllowedHeaders": ["authorization", "content-type", "cache-control", "x-amz-*"],
    "ExposeHeaders": ["ETag"],
    "MaxAgeSeconds": 3000
  }
]
```

…and **static website hosting** (or a CDN rule) so `/news/` serves `/news/index.html` — plain object endpoints don't resolve index documents. HTML / CSS / JS / JSON are uploaded with `Cache-Control: no-cache`, media with one day of caching.

### Your own server (PHP bridge)

Browsers can't speak FTP/SFTP. `external/bridges/php/flexweg-bridge.php` is a single PHP 7.4+ file implementing the Flexweg Files API over the server's filesystem:

1. Create a folder next to the site files (e.g. `/public_html/cms-bridge/`) and upload `flexweg-bridge.php` into it.
2. Copy `flexweg-bridge.config.example.php` to `flexweg-bridge.config.php` and set `API_KEY` (e.g. `openssl rand -hex 24`). Optionally `SITE_ROOT` (default: parent of the bridge folder) and `ALLOWED_ORIGINS`.
3. In the CMS: target **Your own server**, URL `https://example.com/cms-bridge/flexweg-bridge.php`, same API key.

The bridge only writes inside `SITE_ROOT`, never inside its own folder, and refuses server-executable files (`.php`, `.phtml`, `.htaccess`, `.user.ini`, CGI scripts, double extensions…): a leaked key can deface the static site but can't run code. Serve it over HTTPS only.

### Download as ZIP

The rendered site is kept in this browser (IndexedDB). **Settings → Publish target → Download site (ZIP)** exports it; upload it anywhere by hand (Netlify Drop, an FTP client…). The mirror is per browser: run **Regenerate → Everything** before exporting to be sure it's complete.

### Local folder

Writes the site straight into a folder on this computer (Chrome / Edge, File System Access API) — serve it with a local web server or push it with your own tools. Browsers drop the folder permission on reload: use **Reconnect folder** in Settings when publishing reports it.

### Sub-folder sites

When **Settings → General → Base URL** has a path (`https://user.github.io/repo`), every root-absolute URL in the published HTML (`/theme-assets/…`, `/news/a.html`, `srcset` entries…) is prefixed with `/repo` after rendering, and the page gets `<meta name="x-cms-base" content="/repo/">` that the themes' runtime loaders read. Sites served from the domain root are byte-identical to before. Theme authors don't need to change anything; runtime scripts that build URLs should read the meta (see the in-tree loaders).

### Hosting the admin on the site

The admin can live on the publish target itself — e.g. `https://user.github.io/my-site/admin/` — so every editor opens it there:

- **During setup**: on the *Install* step, keep *Also host the admin on this site* ticked (offered for every target except Flexweg, where the admin is uploaded as before, and ZIP). The running admin copies its own files (listed at build time in `admin-files.json`) plus a `config.js` into the chosen folder (default `admin`), in one commit on git targets.
- **Later / after an upgrade**: **Settings → Publish target → Admin on this site → Deploy / update the admin**.
- **config.js holds no secrets** — repo coordinates or the public part of the database location only. Each editor still signs in with their own token / credentials, kept in their browser.
- When the admin already runs from the site, the wizard simply rewrites its `config.js` in place.
- Only possible from a built admin (`npm run build`, `npm run preview` or a deployed copy), not `npm run dev`.

### GitHub Pages activation

GitHub Pages has to be switched on once per repository. After the first publish the CMS tries it through the API — this needs the token's **Pages: read and write** permission (fine-grained tokens can be edited to add it). Without it, a message tells you where to click: repository **Settings → Pages → Deploy from a branch → `main` / `(root)`**.

### Site URL

Absolute URLs (sitemaps, RSS, canonicals, `og:image`) and sub-folder rewriting use **Settings → General → Public site URL**. When it is still empty, saving a publish target fills it with the target's public site URL — it never overwrites a value you set.

### Switching target

Save the new target in **Settings → Publish target**, then run **Regenerate → Everything** (and **Sync theme assets**). Media variants uploaded earlier keep their old absolute URLs: they keep working as long as the old target stays online; re-upload them otherwise.

---

## Data backends

### SQLite

Choosing SQLite in step 1 needs no configuration: the database is stored **on the hosting chosen in step 2**. Two variants:

- **A SQLite file on that hosting** (default) — described below.
- **Flexweg's SQLite service** — only when the hosting is Flexweg: tick *Use Flexweg's SQLite service* to get a Flexweg-managed database with built-in user accounts (email + password).

#### SQLite file

The whole content lives in **one SQLite file** (default `<admin folder>/data/cms.sqlite`) on the hosting — your own server through the PHP bridge (FTP/SFTP hosting), an S3-compatible bucket, a Git repository, Flexweg, or a local folder. The admin downloads it, opens it in the browser with sql.js (SQLite compiled to WebAssembly, loaded only for this backend) and uploads it again on every save.

- **No user accounts.** Anyone who can open the admin can edit. Protecting it is the site owner's job — e.g. a password on `/admin` at the hosting level, which also protects the database file when it sits in the admin folder. If the file is served publicly, drafts are readable.
- **Credentials stay in each browser.** The location's secret settings (bridge key, token, secret key) are never written to `config.js` nor into the database; a new browser shows a *Connect to the database* screen asking for them once. Signing out forgets them.
- **Several editors**: before each save the admin checks the remote file hasn't changed. If someone else saved meanwhile, their version is merged when they touched other items, and the save is refused (their version shown) when they touched the same item. Changes from others are picked up every minute.
- **Readable with any SQLite tool**: one table per collection (`posts`, `terms`, `media`, `users`, `settings`, `config`) with the document as JSON — `SELECT json_extract(data, '$.title') FROM posts`.
- With a Git repository as location, every save is a commit: use a repository or branch that doesn't trigger a site build, or prefer the Markdown backend.

### Markdown in a Git repository

Content lives as plain files in a GitHub / GitLab repository (or a local clone), under a content folder (`content/` by default):

```
content/
├── posts/<slug>.md            front matter + Markdown body
├── posts/<slug>.<lang>.md     translation sidecar (multilang plugin)
├── pages/<slug>.md
├── terms.json                 categories + tags
├── media.json                 media metadata (files live on the publish target)
├── users.json                 author profiles
├── settings/site.json
├── .cms/config/<id>.json      CMS config (installed externals, publish target — secrets stripped)
└── .cms/publish-state.json    where each post is live (kept out of the .md files)
```

- **Sign-in** — each editor uses their own personal access token (same permissions as above). Their repository permission is their CMS role: write = editor, admin / maintainer = admin. The token stays in that browser only.
- **Every save is a commit.** Other editors' changes show up within ~30 s. If two people edit the *same* item, the second save is refused and the first version is shown; edits to different items are merged automatically.
- **Use a private repository** — drafts are stored there. The site itself can go to another (public) repo, a bucket, etc.
- **Secrets** (publish target keys) are never committed: they stay in each admin's browser and must be entered once per browser in Settings — except for git publish targets on the same provider, which reuse each editor's token.
- **Hand edits work**: front matter is YAML, files without `id` / `type` are accepted, other files in the repo are ignored.
- **Local clone** — pick the clone's folder instead of a remote (Chrome / Edge). Sync with your usual git client; the CMS only reads and writes files.

The runtime config (repo coordinates, no token) is saved in the browser. Download **config.js** at the end of the wizard and put it in the admin folder of your hosting so the next editors skip the wizard and only enter their token.

### This browser (local)

Single user, no login, nothing to configure — content is stored in this browser's IndexedDB. Ideal for an admin running on your own machine (`npm run dev`, or `dist/admin/` served locally). Back it up with **Settings → Data backend → Export content**.

### Moving content between backends

**Settings → Data backend → Export content (JSON)** works on every backend. On a Markdown or local backend, **Import content** loads such a file with ids preserved (posts keep their categories, media and authors). Typical migration: export from Firebase / SQLite → switch backend → import → **Regenerate → Everything**. Media files are not copied; secrets are not exported.

---

## For developers

- Publish connectors: `src/services/storage/` (contract in `types.ts`, built-ins in `connectors/`). Feature code keeps using `uploadFile` & co. from `services/flexwegApi.ts`. Plugins can add targets with `registerStorageConnector({ id, create(settings) })` from `@flexweg/cms-runtime` (API ≥ 1.4) — see `docs/runtime-api-reference.md`.
- Shared git layer: `src/services/git/` (GitHub, GitLab, local folder behind one `GitTransport`).
- Document-store backends: `src/services/docstore/` (`core.ts` engine, `gitStore.ts`, `localStore.ts`, domain services mirroring `services/firebase/*`).
