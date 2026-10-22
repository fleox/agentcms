---
name: agentcms-install
description: Install a new AgentCMS site (static CMS) for the user - pick where content is stored (SQLite file, Markdown in GitHub/GitLab, Firebase, this browser), then where the site is hosted (GitHub/GitLab/Cloudflare Pages, S3/OVH bucket, Flexweg, own server, local folder, ZIP), and get the admin running. Use when the user wants to create, set up or install an AgentCMS / Flexweg CMS site.
license: PolyForm-Noncommercial-1.0.0
metadata:
  version: "0.1.0"
  repository: "https://github.com/fleox/agentcms"
---

# Install an AgentCMS site

AgentCMS is a static CMS: an admin web app (React, runs in the browser) stores content in a **data backend** and publishes plain HTML to a **hosting** target. Nothing runs on the server. This skill takes the user from nothing to a working admin.

**Language:** talk to the user in their language. Keep commands, file contents and these instructions in English.

## Step 0 - Check versions (always first)

Run:

```bash
npx -y agentcms@0.1.0 version --check --json
```

- `data.updateAvailable: true` -> tell the user a newer AgentCMS exists (`data.latest`) and offer to update these skills first: in Claude Code run `/plugin marketplace update agentcms` then `/reload-plugins`. Continue with the current version if they decline.
- The command fails with a 404 / network error -> the package isn't reachable. Fall back to a clone: `git clone --depth 1 https://github.com/fleox/agentcms` and use `node agentcms/dist/agent/agentcms.mjs` in place of `npx -y agentcms@0.1.0` below.

## Step 1 - Ask where the content is stored

Ask this first, hosting comes after. Explain each option in one sentence:

| Choice | Good for | Needs |
|---|---|---|
| **SQLite file** on the hosting | One owner, simplest, no account anywhere else | Nothing extra. No login: protecting `/admin` is the owner's job (host-level password, obscure folder) |
| **Markdown in a Git repo** (GitHub / GitLab) | Several editors / computers, history of every change | A repo + a personal access token per editor |
| **Firebase** (Firestore + Auth) | Real-time multi-editor with real logins | A Firebase project (free tier is fine) |
| **This browser** | Trying it out, single user on one computer | Nothing; data stays in this browser only |

## Step 2 - Ask where the site is hosted

Offer only targets that fit the data choice (no ZIP with SQLite): GitHub Pages, GitLab Pages, Cloudflare Pages, Netlify / other git host, S3-compatible bucket (AWS, OVH, R2...), Flexweg, own server (PHP bridge), local folder, ZIP download. Pre-select the obvious one (Markdown on GitHub -> GitHub Pages).

## Step 3 - Run the setup wizard

Start the admin on this computer **in the background** (it keeps running):

```bash
npx -y agentcms@0.1.0 serve --json
```

It prints `{"ok":true,"data":{"url":"http://localhost:4173/"}}`. Ask the user to open that URL and follow the wizard with the choices from steps 1 and 2. On the last step, keep **"Host the admin on this site"** checked: the wizard copies the admin to `<site URL>/admin/` so it works from anywhere afterwards.

While they fill the forms, help them find each value (repository owner/name, token permissions, bucket endpoint and region, site public URL). If they already use a provider CLI on this machine (`gh`, `aws`, `wrangler`, `firebase`), offer to create the repository / bucket / project for them and give them the exact values to paste.

## Secrets - non-negotiable

- Never ask the user to paste a token, password or secret key into the chat, and never print one. They type secrets directly into the wizard (or into a command they run themselves).
- If you create a key with a CLI, copy it to the clipboard (`pbcopy` / `xclip` / `clip`) instead of displaying it, and tell the user where to paste it.
- Tokens never go into `config.js`, a repo or a file you commit.

## Step 4 - Finish

When the wizard shows the done card: stop the background `serve` process, give the user the public site URL and the hosted admin URL, and remind them that each new browser asks for its access token once (tokens are stored per browser).
