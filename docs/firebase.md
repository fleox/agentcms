# Firebase backend

Firestore security rules and indexes for sites that use the Firebase data backend. The other backends (SQLite file, Markdown in git, this browser) need none of this.

## Firestore security rules

Paste the following into **Firebase Console → Firestore → Rules** and replace `you@example.com` with the address you'll use as bootstrap administrator. The rules are now the **only** place the admin email lives — the SetupForm no longer writes it into `/admin/config.js`, and `VITE_ADMIN_EMAIL` is a deprecated legacy fallback only used by older deployments mid-migration.

```
rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {

    // ─── Helpers ──────────────────────────────────────────────────────────
    // Bootstrap admin: email pinned here. The single source of truth.
    function bootstrapAdminEmail() {
      return "you@example.com";
    }

    function isSignedIn() {
      return request.auth != null;
    }

    // Bootstrap admin: signed in, email matches the pinned address,
    // AND email is verified. The email_verified check matters because
    // Firebase Email/Password sign-in returns `email_verified: false`
    // by default — these rules pin verification server-side so an
    // unverified token can never act as bootstrap admin.
    function isBootstrapAdmin() {
      return isSignedIn()
        && request.auth.token.email != null
        && request.auth.token.email_verified == true
        && request.auth.token.email.lower() == bootstrapAdminEmail();
    }

    // Reads /users/{uid} for the caller. Returns null if no record yet.
    function selfRecord() {
      return exists(/databases/$(database)/documents/users/$(request.auth.uid))
        ? get(/databases/$(database)/documents/users/$(request.auth.uid)).data
        : null;
    }

    function isDisabled() {
      let rec = selfRecord();
      return !isBootstrapAdmin() && rec != null && rec.disabled == true;
    }

    function isAdmin() {
      let rec = selfRecord();
      return isBootstrapAdmin() || (rec != null && rec.role == "admin" && rec.disabled != true);
    }

    function isEditor() {
      let rec = selfRecord();
      return isBootstrapAdmin()
        || (rec != null && (rec.role == "admin" || rec.role == "editor") && rec.disabled != true);
    }

    // ─── users/{uid} ──────────────────────────────────────────────────────
    // - Any signed-in editor can read the list (Users page + author lookup).
    // - First login: self-create allowed if uid matches and role is "editor".
    // - Self update: only `preferences.adminLocale` may change.
    // - Role/disabled changes: admin only.
    match /users/{uid} {
      allow read: if isEditor();

      // Self-create on first login. Regular users may only create
      // themselves with role "editor". The bootstrap admin (verified
      // email + matching pinned address) may self-create with role
      // "admin" so the UI shows admin features immediately, no manual
      // promotion step needed. Either branch enforces email match and
      // disabled=false.
      allow create: if isSignedIn()
        && request.auth.uid == uid
        && request.resource.data.email == request.auth.token.email.lower()
        && request.resource.data.disabled == false
        && (
          (isBootstrapAdmin() && request.resource.data.role == "admin")
          || (!isBootstrapAdmin() && request.resource.data.role == "editor")
        );

      allow update: if isAdmin()
        || (
          isSignedIn()
          && request.auth.uid == uid
          && !isDisabled()
          && request.resource.data.diff(resource.data).affectedKeys()
              .hasOnly(["preferences", "firstName", "lastName", "bio", "avatarMediaId"])
          && (
            !("preferences" in request.resource.data.diff(resource.data).affectedKeys())
            || request.resource.data.preferences.adminLocale in ["en", "fr", "de", "es", "nl", "pt", "ko"]
          )
        );

      allow delete: if isAdmin();
    }

    // ─── posts/{id} (posts + pages) ───────────────────────────────────────
    match /posts/{id} {
      allow read, write: if isEditor();
    }

    // ─── terms/{id} (categories + tags) ───────────────────────────────────
    match /terms/{id} {
      allow read, write: if isEditor();
    }

    // ─── media/{id} ───────────────────────────────────────────────────────
    match /media/{id} {
      allow read, write: if isEditor();
    }

    // ─── settings/site ────────────────────────────────────────────────────
    match /settings/{docId} {
      allow read: if isEditor();
      allow write: if isEditor();
    }

    // ─── config/admin ─────────────────────────────────────────────────────
    // Empty placeholder probed by the admin client to detect bootstrap-
    // admin status WITHOUT carrying the email in /admin/config.js. The
    // doc itself doesn't need to exist — what matters is the rule: a
    // get() succeeds only when isBootstrapAdmin() returns true.
    match /config/admin {
      allow read: if isBootstrapAdmin();
      allow write: if isAdmin();
    }

    // ─── config/storage + other config docs ──────────────────────────────
    // Publish target — read by every editor (publisher needs it), write admin-only.
    // The `docId != "admin"` guard ensures editors do not read the probe
    // doc above (Firestore rules OR-merge across all matching paths, so
    // without this guard editors would silently pass the bootstrap probe).
    match /config/{docId} {
      allow read: if docId != "admin" && isEditor();
      allow write: if docId != "admin" && isAdmin();
    }

    // ─── Default deny ─────────────────────────────────────────────────────
    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```

### How the rules work

- **Bootstrap admin**: a user whose email matches `bootstrapAdminEmail()` is treated as admin even without a `users/{uid}` document. This solves the chicken-and-egg problem of the first login (no record exists yet to grant the admin role).
- **Self-create on first login**: any signed-in user can create their own `users/{uid}` document, but only with `role: "editor"` and `disabled: false` — this prevents privilege escalation. The admin promotes editors via the Users page afterwards.
- **Self update is restricted to profile fields**: a regular user can change their own `preferences` (admin language), `firstName`, `lastName`, `bio`, and `avatarMediaId` — the editable surface of the **Settings → Profile** form. They cannot touch their own role or disabled flag. Admins can update any field on any record.
- **`config/*` docs require admin to write**: editors can read the publish target in `config/storage` (the publisher needs it), but only admins can change it. `config/admin` is excluded so editors can't pass the bootstrap probe.
- **Each rule call performs one extra read** via `selfRecord()`. Acceptable for an internal tool; if you need to optimize later, switch to [Firebase Auth custom claims](https://firebase.google.com/docs/auth/admin/custom-claims) (requires an admin SDK backend to set them).

If you want only admins to manage themes/plugins/menus, change `allow write: if isEditor();` to `allow write: if isAdmin();` on `match /settings/{docId}`.

## Firestore indexes

**You only need this section if you have a very large site** and want to switch the admin to **Server-side paginated** mode in **Settings → General → Performance**.

The default mode is **Standard**, which subscribes to the entire `posts` collection in one shot (`orderBy(createdAt)` on a single field — already covered by Firestore's automatic single-field index). No setup needed; works on the free Spark plan out of the box. List pages, search, dashboard counts and pickers all run from the in-memory snapshot. Recommended ceiling: ~5 000 posts before the initial fetch starts to feel slow.

The **Server-side paginated** mode subscribes to one cursor-paginated page at a time. This requires the two composite indexes documented below. The admin's [`FirestoreSetupGate`](../src/components/FirestoreSetupGate.tsx) detects the indexes the moment you flip the toggle and walks you through creating them with one click — so even Option 3 below (the admin-guided flow) needs no terminal access.

### Indexes to create

| Use case | Fields | Order |
|---|---|---|
| All posts/pages, paginated | `type` (asc), `createdAt` (desc) | desc on `createdAt` |
| Posts/pages by status, paginated | `type` (asc), `status` (asc), `createdAt` (desc) | desc on `createdAt` |

### Option 1 — gcloud CLI (recommended)

Install the [gcloud CLI](https://cloud.google.com/sdk/docs/install), authenticate (`gcloud auth login`), then set the active project:

```bash
gcloud config set project <YOUR_FIREBASE_PROJECT_ID>
```

Create the two indexes:

```bash
# Index 1: type + createdAt — covers the "all" tab
gcloud firestore indexes composite create \
  --collection-group=posts \
  --query-scope=COLLECTION \
  --field-config=field-path=type,order=ASCENDING \
  --field-config=field-path=createdAt,order=DESCENDING

# Index 2: type + status + createdAt — covers the draft / online tabs
gcloud firestore indexes composite create \
  --collection-group=posts \
  --query-scope=COLLECTION \
  --field-config=field-path=type,order=ASCENDING \
  --field-config=field-path=status,order=ASCENDING \
  --field-config=field-path=createdAt,order=DESCENDING
```

Each command finishes synchronously and reports the index id. The index itself takes 1–5 minutes to build on the backend depending on collection size — Firebase Console → Firestore → Indexes shows the progress.

### Option 2 — `firestore.indexes.json` (Firebase CLI)

Drop the following at your project root, then run `firebase deploy --only firestore:indexes`:

```json
{
  "indexes": [
    {
      "collectionGroup": "posts",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "type", "order": "ASCENDING" },
        { "fieldPath": "createdAt", "order": "DESCENDING" }
      ]
    },
    {
      "collectionGroup": "posts",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "type", "order": "ASCENDING" },
        { "fieldPath": "status", "order": "ASCENDING" },
        { "fieldPath": "createdAt", "order": "DESCENDING" }
      ]
    }
  ],
  "fieldOverrides": []
}
```

### Option 3 — let the admin guide you (zero config, recommended for non-CLI users)

When you flip the toggle to **Server-side paginated** in **Settings → General → Performance**, the admin SPA pings the two composite-index queries on the next render. If the indexes are missing it shows a setup screen with direct one-click links to the Firebase Console. Each link opens the index-creation form pre-filled — you click "Create" inside Firebase, wait 1–5 minutes for the build, then click "Retry" in the admin. Once both indexes report ready, the gate disappears.

This works on Firestore's **free tier (Spark plan)** without any additional configuration. The detection result is cached in `localStorage` so subsequent reloads skip the ping.

In **Standard** mode (the default) the gate is a pure pass-through — no ping, no setup screen. You only see this flow if you actually opt into paginated mode.

### Verifying

After the indexes finish building (status: `READY` in the console), the post / page list pages load in under a second regardless of corpus size, and the dashboard's stat cards return their counts via aggregation queries (single read each).

## Updating Firestore security rules

The example Firestore rules above lock the `preferences.adminLocale` field to a closed list:

```
&& request.resource.data.preferences.adminLocale in ["en", "fr", "de", "es", "nl", "pt", "ko"]
```

If you upgraded from an older deployment that allowed only `["en", "fr"]`, copy the updated list into your Firebase Console → Firestore → Rules tab; otherwise users won't be able to save the new locales.
