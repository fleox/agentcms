# Firebase backend

Everything a site that keeps its content in Firebase needs: the console setup, illustrated screen by screen, the Firestore security rules and the indexes. The other backends (SQLite file, Markdown in git, this browser) need none of this.

**On this page:** [Set up the Firebase project](#set-up-the-firebase-project) · [Sign-in methods](#sign-in-methods) · [Inviting editors](#inviting-editors) · [Firestore security rules](#firestore-security-rules) · [Firestore indexes](#firestore-indexes) · [Updating the rules](#updating-firestore-security-rules)

## Set up the Firebase project

About ten minutes in the [Firebase console](https://console.firebase.google.com), once per site. You need a Google account. At the end you have everything AgentCMS asks for: the six web-app config values and the bootstrap admin's email and password.

<p align="center">
  <img src="https://raw.githubusercontent.com/fleox/agentcms/master/.github/assets/firebase-setup.gif" width="820" alt="Slideshow of the 23 Firebase console screens, from creating the project to publishing the security rules">
  <br><sub>The whole setup at a glance. Open each phase below for the screenshots in full size.</sub>
</p>

| Phase | What you do | Steps |
|---|---|---|
| 1️⃣ [Create the project](#1-create-the-project) | A new Firebase project, without Analytics | 1–5 |
| 2️⃣ [Firestore](#2-firestore) | A Firestore database in production mode | 6–11 |
| 3️⃣ [Authentication](#3-authentication) | Email/password sign-in and the bootstrap admin | 12–18 |
| 4️⃣ [Web app](#4-web-app) | The six public config values | 19–22 |
| 5️⃣ [Security rules](#5-security-rules) | The AgentCMS rules, with your admin email | 23 |
| ➕ [Sign-in methods](#sign-in-methods) *(optional)* | Email link and / or Google, on top of the password | — |
| 6️⃣ [Connect AgentCMS](#6-connect-agentcms) | Setup wizard, agent or CLI | — |

### 1. Create the project

<details open>
<summary><b>Show the 5 steps</b></summary>
<br>

**Step 1.** Open the Firebase console and click **Get started by setting up a Firebase project**.

<a href="https://raw.githubusercontent.com/fleox/agentcms/master/.github/assets/firebase/step-01.jpg"><img src="https://raw.githubusercontent.com/fleox/agentcms/master/.github/assets/firebase/step-01.jpg" width="720" alt="Step 1: Open the Firebase console and click Get started by setting up a Firebase project."></a>

**Step 2.** Name the project and click **Continue**.

<a href="https://raw.githubusercontent.com/fleox/agentcms/master/.github/assets/firebase/step-02.jpg"><img src="https://raw.githubusercontent.com/fleox/agentcms/master/.github/assets/firebase/step-02.jpg" width="720" alt="Step 2: Name the project and click Continue."></a>

**Step 3.** Untick **Google Analytics** (not needed) and click **Create project**.

<a href="https://raw.githubusercontent.com/fleox/agentcms/master/.github/assets/firebase/step-03.jpg"><img src="https://raw.githubusercontent.com/fleox/agentcms/master/.github/assets/firebase/step-03.jpg" width="720" alt="Step 3: Untick Google Analytics (not needed) and click Create project."></a>

**Step 4.** When the project is ready, click **Continue**.

<a href="https://raw.githubusercontent.com/fleox/agentcms/master/.github/assets/firebase/step-04.jpg"><img src="https://raw.githubusercontent.com/fleox/agentcms/master/.github/assets/firebase/step-04.jpg" width="720" alt="Step 4: When the project is ready, click Continue."></a>

**Step 5.** Open the project from the list.

<a href="https://raw.githubusercontent.com/fleox/agentcms/master/.github/assets/firebase/step-05.jpg"><img src="https://raw.githubusercontent.com/fleox/agentcms/master/.github/assets/firebase/step-05.jpg" width="720" alt="Step 5: Open the project from the list."></a>

</details>

### 2. Firestore

<details>
<summary><b>Show the 6 steps</b></summary>
<br>

**Step 6.** In the sidebar: **Databases & Storage → Firestore**.

<a href="https://raw.githubusercontent.com/fleox/agentcms/master/.github/assets/firebase/step-06.jpg"><img src="https://raw.githubusercontent.com/fleox/agentcms/master/.github/assets/firebase/step-06.jpg" width="720" alt="Step 6: In the sidebar: Databases &amp; Storage → Firestore."></a>

**Step 7.** Click **Create database**.

<a href="https://raw.githubusercontent.com/fleox/agentcms/master/.github/assets/firebase/step-07.jpg"><img src="https://raw.githubusercontent.com/fleox/agentcms/master/.github/assets/firebase/step-07.jpg" width="720" alt="Step 7: Click Create database."></a>

**Step 8.** Leave the database ID empty, pick **Standard edition**, click **Next**.

<a href="https://raw.githubusercontent.com/fleox/agentcms/master/.github/assets/firebase/step-08.jpg"><img src="https://raw.githubusercontent.com/fleox/agentcms/master/.github/assets/firebase/step-08.jpg" width="720" alt="Step 8: Leave the database ID empty, pick Standard edition, click Next."></a>

**Step 9.** Choose the location (it can't be changed later), click **Next**.

<a href="https://raw.githubusercontent.com/fleox/agentcms/master/.github/assets/firebase/step-09.jpg"><img src="https://raw.githubusercontent.com/fleox/agentcms/master/.github/assets/firebase/step-09.jpg" width="720" alt="Step 9: Choose the location (it can't be changed later), click Next."></a>

> [!WARNING]
> The location is permanent. Pick the region closest to your editors and visitors.

**Step 10.** Select **Start in production mode** and click **Create**.

<a href="https://raw.githubusercontent.com/fleox/agentcms/master/.github/assets/firebase/step-10.jpg"><img src="https://raw.githubusercontent.com/fleox/agentcms/master/.github/assets/firebase/step-10.jpg" width="720" alt="Step 10: Select Start in production mode and click Create."></a>

**Step 11.** The database is ready. Leave it empty: AgentCMS creates its collections.

<a href="https://raw.githubusercontent.com/fleox/agentcms/master/.github/assets/firebase/step-11.jpg"><img src="https://raw.githubusercontent.com/fleox/agentcms/master/.github/assets/firebase/step-11.jpg" width="720" alt="Step 11: The database is ready. Leave it empty: AgentCMS creates its collections."></a>

> [!TIP]
> Firestore has no schema: don't create any collection. AgentCMS creates them the first time it saves.

</details>

### 3. Authentication

<details>
<summary><b>Show the 7 steps</b></summary>
<br>

**Step 12.** In the sidebar: **Security → Authentication**.

<a href="https://raw.githubusercontent.com/fleox/agentcms/master/.github/assets/firebase/step-12.jpg"><img src="https://raw.githubusercontent.com/fleox/agentcms/master/.github/assets/firebase/step-12.jpg" width="720" alt="Step 12: In the sidebar: Security → Authentication."></a>

**Step 13.** Click **Get started**.

<a href="https://raw.githubusercontent.com/fleox/agentcms/master/.github/assets/firebase/step-13.jpg"><img src="https://raw.githubusercontent.com/fleox/agentcms/master/.github/assets/firebase/step-13.jpg" width="720" alt="Step 13: Click Get started."></a>

**Step 14.** In **Sign-in method**, choose **Email/Password**.

<a href="https://raw.githubusercontent.com/fleox/agentcms/master/.github/assets/firebase/step-14.jpg"><img src="https://raw.githubusercontent.com/fleox/agentcms/master/.github/assets/firebase/step-14.jpg" width="720" alt="Step 14: In Sign-in method, choose Email/Password."></a>

**Step 15.** Turn **Enable** on and click **Save**.

<a href="https://raw.githubusercontent.com/fleox/agentcms/master/.github/assets/firebase/step-15.jpg"><img src="https://raw.githubusercontent.com/fleox/agentcms/master/.github/assets/firebase/step-15.jpg" width="720" alt="Step 15: Turn Enable on and click Save."></a>

**Step 16.** Email/Password is now **Enabled**.

<a href="https://raw.githubusercontent.com/fleox/agentcms/master/.github/assets/firebase/step-16.jpg"><img src="https://raw.githubusercontent.com/fleox/agentcms/master/.github/assets/firebase/step-16.jpg" width="720" alt="Step 16: Email/Password is now Enabled."></a>

**Step 17.** Open the **Users** tab and click **Add user**.

<a href="https://raw.githubusercontent.com/fleox/agentcms/master/.github/assets/firebase/step-17.jpg"><img src="https://raw.githubusercontent.com/fleox/agentcms/master/.github/assets/firebase/step-17.jpg" width="720" alt="Step 17: Open the Users tab and click Add user."></a>

**Step 18.** Create the **bootstrap admin**: the email and password you'll sign in to AgentCMS with.

<a href="https://raw.githubusercontent.com/fleox/agentcms/master/.github/assets/firebase/step-18.jpg"><img src="https://raw.githubusercontent.com/fleox/agentcms/master/.github/assets/firebase/step-18.jpg" width="720" alt="Step 18: Create the bootstrap admin: the email and password you'll sign in to AgentCMS with."></a>

> [!IMPORTANT]
> Note this email and password. The email goes into the security rules (phase 5), and you sign in to AgentCMS with both.

</details>

### 4. Web app

<details>
<summary><b>Show the 4 steps</b></summary>
<br>

**Step 19.** Gear icon → **Project settings**.

<a href="https://raw.githubusercontent.com/fleox/agentcms/master/.github/assets/firebase/step-20-1.jpg"><img src="https://raw.githubusercontent.com/fleox/agentcms/master/.github/assets/firebase/step-20-1.jpg" width="720" alt="Step 19: Gear icon → Project settings."></a>

**Step 20.** Under **Your apps**, click the **</>** (Web) icon.

<a href="https://raw.githubusercontent.com/fleox/agentcms/master/.github/assets/firebase/step-20-3.jpg"><img src="https://raw.githubusercontent.com/fleox/agentcms/master/.github/assets/firebase/step-20-3.jpg" width="720" alt="Step 20: Under Your apps, click the &lt;/&gt; (Web) icon."></a>

**Step 21.** Give it a nickname and click **Register app** (skip Firebase Hosting).

<a href="https://raw.githubusercontent.com/fleox/agentcms/master/.github/assets/firebase/step-20-4.jpg"><img src="https://raw.githubusercontent.com/fleox/agentcms/master/.github/assets/firebase/step-20-4.jpg" width="720" alt="Step 21: Give it a nickname and click Register app (skip Firebase Hosting)."></a>

**Step 22.** Copy the six **firebaseConfig** values: AgentCMS asks for them.

<a href="https://raw.githubusercontent.com/fleox/agentcms/master/.github/assets/firebase/step-20-5.jpg"><img src="https://raw.githubusercontent.com/fleox/agentcms/master/.github/assets/firebase/step-20-5.jpg" width="720" alt="Step 22: Copy the six firebaseConfig values: AgentCMS asks for them."></a>

> [!NOTE]
> These values are public by design: they end up in the admin's `config.js`. Your data is protected by the security rules, not by these values.

</details>

### 5. Security rules

<details>
<summary><b>Show the 1 steps</b></summary>
<br>

**Step 23.** **Firestore → Rules**: paste the AgentCMS rules with your admin email, then **Publish**.

Print the rules with your admin email already in place, then paste them over the default rules:

```bash
npx -y @agent-cms/agentcms options --firebase-rules you@example.com --json   # data.rules
```

Or copy them from [Firestore security rules](#firestore-security-rules) below and replace `you@example.com` (lowercase).

<a href="https://raw.githubusercontent.com/fleox/agentcms/master/.github/assets/firebase/step-19.jpg"><img src="https://raw.githubusercontent.com/fleox/agentcms/master/.github/assets/firebase/step-19.jpg" width="720" alt="Step 23: Firestore → Rules: paste the AgentCMS rules with your admin email, then Publish."></a>

</details>

### 6. Connect AgentCMS

Pick one:

- **With an AI agent**: ask *"Install a new AgentCMS site with Firebase"*. The agent asks for the six config values, then has you store the admin login yourself (`agentcms credentials set firebase:<name>`, hidden prompt).
- **Setup wizard** (`npx -y @agent-cms/agentcms serve`, or an admin you host): choose **Firebase** on the *Data* step, paste the six values and sign in with the bootstrap admin. The wizard checks the project, the sign-in and the rules before going further.
- **CLI install plan**: the `data` part of the plan:

  ```json
  "data": {
    "backend": "firebase",
    "credential": "firebase:<name>",
    "firebase": { "apiKey": "…", "authDomain": "…", "projectId": "…", "storageBucket": "…", "messagingSenderId": "…", "appId": "…" },
    "signInMethods": ["password", "emailLink", "google"]
  }
  ```

  `signInMethods` is optional (default: password only) — see [Sign-in methods](#sign-in-methods).

> [!CAUTION]
> If the rules still contain `you@example.com`, nobody gets admin rights: the wizard and the CLI stop with a message that gives the email to pin. Other sign-in errors are listed in [Self-hosting](self-hosting.md).

## Sign-in methods

The bootstrap admin always signs in with **email + password** (the setup wizard and the `agentcms` CLI use it). For the other editors, the login screen can also offer two password-free methods. Pick them in the setup wizard (*Sign-in methods*) or with `signInMethods` in the install plan; they are saved in the admin's `config.js` (public — it only decides which buttons show).

| Method | What the editor does | Good for | Email verified |
|---|---|---|---|
| **Email + password** | Types an email and a password | The admin account, the CLI and agents, people without a Google account | **No** — the admin sends a verification email at first sign-in |
| **Email link** | Types an email, clicks the one-time link Firebase emails them | Occasional editors: nothing to remember, nothing to leak | Yes, by Firebase |
| **Google account** | Clicks *Continue with Google* and picks their account | Teams on Gmail / Google Workspace | Yes, by Firebase |

> [!IMPORTANT]
> Whatever the method, **signing in grants nothing by itself**: only the bootstrap admin and the addresses an admin [invited](#inviting-editors) get a role. Anyone else who signs in sees *"No access to this site"*.

### Turning a method on

All three are enabled in **Firebase console → Authentication → Sign-in method → Add new provider**:

1. **Email + password** — *Email/Password* → **Enable** (already done in [step 15](#3-authentication)).
2. **Email link** — open *Email/Password* again and also turn on **Email link (passwordless sign-in)** → **Save**.
3. **Google** — *Google* → **Enable**, choose the *Project support email* → **Save**.

On an installed site, change the list with `npx -y @agent-cms/agentcms site sign-in-methods password,emailLink,google --site <alias>` (rewrites the hosted admin's `config.js`; without a list it shows the current methods).

Then, for the email link and Google, add the domain the admin is served from to **Authentication → Settings → Authorized domains → Add domain**: e.g. `my-login.github.io`, `my-site.pages.dev`, `www.example.com` (without `https://` or a path). `localhost` and `<project>.firebaseapp.com` are there by default. Without it, sign-in fails with *"This domain isn't allowed to sign in"*.

> [!TIP]
> With the password method, Firebase lets **anyone** create an account with the site's public `apiKey`. The rules keep those accounts out, but you can also stop them from being created: **Authentication → Settings → User actions → untick "Enable create (sign-up)"** (the admin still adds accounts in *Users → Add user*). Leave it on if editors may create their own password account after you invite them.

### What each editor does the first time

- **Email + password**: you invite their address, create the account in **Authentication → Users → Add user** with the same email, and send them the password. At first sign-in the admin asks them to verify their email (one click in the email Firebase sends), then they're in.
- **Email link**: you invite their address. They type it on the login screen, click *Email me a sign-in link*, open the email **in the same browser**, and they're in. (In another browser, the admin asks them to type the address again.)
- **Google**: you invite their Gmail / Workspace address. They click *Continue with Google* and pick that account.

## Inviting editors

In the admin: **Users → Invitations**: type the address, pick *Editor* or *Administrator*, **Invite**. The list shows each invitation as *pending* until the person's first sign-in, then *joined*. Revoking an invitation stops a person who hasn't joined yet; for someone who already joined, disable or delete their account on the same page.

From the CLI or an agent:

```bash
npx -y @agent-cms/agentcms users invite anna@example.com --role editor --site <alias>
npx -y @agent-cms/agentcms users invites --site <alias>
npx -y @agent-cms/agentcms users uninvite anna@example.com --site <alias>
```

Invitations are stored in Firestore (`invites/<email>`, written by admins only). The role is applied once, at the person's first sign-in; change it later on the Users page.

### Restricting the rules further (optional)

The [rules below](#firestore-security-rules) work unchanged for the three methods: they only look at the signed-in email and whether it is verified. To narrow them, edit the two helpers at the top:

<details>
<summary><b>Google accounts only</b> (refuse password and email-link sign-ins for everyone but the bootstrap admin)</summary>

```
function verifiedEmail() {
  return isSignedIn()
    && request.auth.token.email != null
    && request.auth.token.email_verified == true
    && (request.auth.token.firebase.sign_in_provider == "google.com"
        || request.auth.token.email.lower() == bootstrapAdminEmail());
}
```
</details>

<details>
<summary><b>Your company's domain only</b> (e.g. a Google Workspace)</summary>

```
function verifiedEmail() {
  return isSignedIn()
    && request.auth.token.email != null
    && request.auth.token.email_verified == true
    && (request.auth.token.email.lower().matches(".*@example[.]com$")
        || request.auth.token.email.lower() == bootstrapAdminEmail());
}
```

With this, an invitation is still needed: the domain check only narrows who can be invited.
</details>

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

    // Verified address of the caller (Google and email-link sign-ins are
    // verified by Firebase; password accounts after the verification email).
    function verifiedEmail() {
      return isSignedIn()
        && request.auth.token.email != null
        && request.auth.token.email_verified == true;
    }

    // An admin invited this address (invites/{lower-case email}).
    function inviteOfCaller() {
      return /databases/$(database)/documents/invites/$(request.auth.token.email.lower());
    }

    function isInvited() {
      return verifiedEmail() && exists(inviteOfCaller());
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

    // ─── invites/{email} ──────────────────────────────────────────────────
    // Who may join, and with which role. Written by admins (Users page);
    // an invited, verified address may read its own invitation.
    match /invites/{email} {
      allow read: if isAdmin()
        || (verifiedEmail() && request.auth.token.email.lower() == email);
      allow create, update: if isAdmin()
        && email == email.lower()
        && request.resource.data.role in ["admin", "editor"];
      allow delete: if isAdmin();
    }

    // ─── users/{uid} ──────────────────────────────────────────────────────
    // - Any signed-in editor can read the list (Users page + author lookup).
    // - First login: self-create only for the bootstrap admin or an
    //   INVITED, verified address — with the role of its invitation.
    //   Any other account (whatever the sign-in method: password, email
    //   link, Google) gets no record and no access.
    // - Self update: only profile fields and `preferences.adminLocale`.
    // - Role/disabled changes: admin only.
    match /users/{uid} {
      allow read: if isEditor();

      allow create: if verifiedEmail()
        && request.auth.uid == uid
        && request.resource.data.email == request.auth.token.email.lower()
        && request.resource.data.disabled == false
        && (
          (isBootstrapAdmin() && request.resource.data.role == "admin")
          || (!isBootstrapAdmin() && isInvited()
              && request.resource.data.role == get(inviteOfCaller()).data.role)
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
- **Invitations, whatever the sign-in method**: Firebase lets anyone create an account with the public `apiKey` (password sign-up), and with Google or email-link sign-in anyone can sign in in one click. So signing in proves nothing on its own: a `users/{uid}` record — and therefore any access — is only created for the bootstrap admin or for an address listed in `invites/` by an admin, with the invitation's role, once the address is verified. Everyone else stays locked out.
- **Verified addresses only**: Google and email-link sign-ins are verified by Firebase. Password accounts start unverified; the admin shows them a "verify your email" screen that sends the verification email.
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

> [!WARNING]
> **Sites installed before AgentCMS 0.3.11 must update their rules.** The previous rules let *any* signed-in Firebase account create its own editor record — and anyone can create an account with the site's public `apiKey`. Publish the current rules (`npx -y @agent-cms/agentcms options --firebase-rules <bootstrap admin email> --json` prints them with your email in place), then open **Users**: invite your real editors and disable any account you don't recognise. `agentcms doctor --site <alias> --deep` reports `firestore-rules: fail` until the rules are updated. Existing editors keep their access: their records already exist.

The example Firestore rules above lock the `preferences.adminLocale` field to a closed list:

```
&& request.resource.data.preferences.adminLocale in ["en", "fr", "de", "es", "nl", "pt", "ko"]
```

If you upgraded from an older deployment that allowed only `["en", "fr"]`, copy the updated list into your Firebase Console → Firestore → Rules tab; otherwise users won't be able to save the new locales.
