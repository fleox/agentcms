---
name: agentcms-install
description: Install a new AgentCMS site (static CMS) for the user - ask where content is stored (SQLite file, Markdown in GitHub/GitLab, Firebase, this browser), then where the site is hosted (GitHub/GitLab/Cloudflare Pages, S3 or OVH bucket, Flexweg), help create or import the needed tokens and keys, and install everything with the agentcms CLI. Use when the user wants to create, set up or install an AgentCMS / Flexweg CMS site.
license: PolyForm-Noncommercial-1.0.0
metadata:
  version: "0.1.0"
  repository: "https://github.com/fleox/agentcms"
---

# Install an AgentCMS site

AgentCMS is a static CMS: an admin web app (runs in the browser) keeps content in a **data backend** and publishes plain HTML to a **hosting** target. Nothing runs on the server. The `agentcms` CLI installs a site end to end and keeps a registry of every site this computer manages.

**Language:** talk to the user in their language. Keep commands, file contents and these instructions in English.

Every command below is `npx -y @agent-cms/agentcms@0.1.0 <command> --json` (Node.js 20+). Output is one JSON object: `{"ok":true,"data":...}` or `{"ok":false,"error":{"code","message","hint"}}` - when `ok` is false, read `hint` and act on it. If npx can't fetch the package (404 / offline), clone `https://github.com/fleox/agentcms` and use `node agentcms/dist/agent/agentcms.mjs` the same way.

## Step 0 - Versions and existing sites

```bash
npx -y @agent-cms/agentcms@0.1.0 status --json
```

- `data.tool.updateAvailable: true` -> a newer AgentCMS exists. Offer to update these skills first (Claude Code: `/plugin marketplace update agentcms`, then `/reload-plugins`), then continue.
- `data.sites` lists sites already registered on this computer. If the user actually wants to change one of them, switch to the `agentcms-manage` skill.

## Step 1 - Ask where the content is stored

Ask this first; hosting comes after. Run `npx -y @agent-cms/agentcms@0.1.0 options --json` and present `data.dataBackends` in one sentence each:

- **SQLite file** - one owner, simplest, no other account. Encrypted with a passphrase by default (a static host serves the file like any page); can also live in a separate private bucket / repo. No login screen: anyone with the admin URL, the keys and the passphrase can edit.
- **Markdown in a Git repo** (GitHub / GitLab) - several editors or computers, full history; each editor uses their own token.
- **Firebase** - real-time, email/password logins. Wizard only (see "Wizard fallback").
- **This browser** - quick try on one computer. Wizard only.

## Step 2 - Ask where the site is hosted

Present the entries of `data.hostings` with `cli: true` that fit the data choice. Pre-select the obvious one (Markdown on GitHub -> GitHub Pages). Then open the matching guide and follow it - it says what to create, what the user must click, and what you can automate with tools already installed (`gh`, `aws`, `glab`, `wrangler`):

| Hosting | Guide |
|---|---|
| GitHub Pages / Cloudflare Pages / other git host | [references/github.md](references/github.md) (+ [references/cloudflare.md](references/cloudflare.md)) |
| GitLab Pages | [references/gitlab.md](references/gitlab.md) |
| S3-compatible bucket (AWS, OVHcloud, Scaleway, R2...) | [references/s3.md](references/s3.md) |
| Flexweg | [references/flexweg.md](references/flexweg.md) |

Markdown content on GitHub/GitLab also needs the content repository: [references/github.md](references/github.md) / [references/gitlab.md](references/gitlab.md).

## Step 3 - Credentials (never through the chat)

Secrets are stored per **account** (`github:<login>`, `s3:<name>`, `flexweg:<name>`, `php-bridge:<name>`, `gitlab:<name>`), not per site - check `npx -y @agent-cms/agentcms@0.1.0 credentials list --json` first and reuse an account that is already there.

To add one, use the first option that applies:

1. Import from a tool the user is signed in to: `npx -y @agent-cms/agentcms@0.1.0 credentials set github:<login> --from-gh --json`, `npx -y @agent-cms/agentcms@0.1.0 credentials set s3:<name> --from-aws-profile <profile> --json`.
2. Otherwise ask the user to run it **themselves** - in Claude Code they type `! npx -y @agent-cms/agentcms@0.1.0 credentials set <account>` - and type the secret at the hidden prompt.
3. Or an environment variable the user set: `--from-env VAR` (`--from-env KEY_ID,SECRET` for S3).

SQLite passphrase: nothing to do before installing - `install` generates a strong one and stores it as `passphrase:<alias>`. To reuse an existing database, store its passphrase first (`! npx -y @agent-cms/agentcms@0.1.0 credentials set passphrase:<alias>`).

Rules: never ask for a token, password or secret key in the chat; never print one; never put one in a plan file, `config.js`, a repo or a commit. When you create a key with a CLI, send it straight into `credentials set` (environment variable or pipe), or copy it to the clipboard (`pbcopy` / `xclip` / `clip`) - never display it.

## Step 4 - Write the plan, dry-run it

Write `agentcms-plan.json` (no secrets - only account ids), following `data.planExample` from `options`:

```json
{
  "alias": "my-blog",
  "data": { "backend": "markdown-git", "git": { "provider": "github", "owner": "my-login", "repo": "my-blog-content", "branch": "main" }, "credential": "github:my-login" },
  "hosting": { "type": "github-pages", "settings": { "owner": "my-login", "repo": "my-blog", "siteUrl": "https://my-login.github.io/my-blog" } },
  "admin": { "folder": "admin" }
}
```

- `alias`: short name for this site (lower-case, dashes). Ask the user if they manage several sites.
- SQLite: `"data": { "backend": "sqlite-file", "path": "data/site.sqlite" }` - the file is encrypted and lives on the hosting (on git hostings: on the unpublished branch `agentcms-data` of the same repo). Add `"location": { "type": "s3", "settings": { ... }, "credential": "s3:<name>" }` to keep it in a separate private bucket (or a private GitHub repo with `"type": "git-other"`), see [references/s3.md](references/s3.md). Only set `"encryption": false` if the user insists and the file is not publicly served.
- `hosting.credential` can be omitted when the hosting is on the same git provider as the content.
- Keep `"admin": { "folder": "admin" }` so the admin is reachable at `<site URL>/admin/` from any computer.

Then:

```bash
npx -y @agent-cms/agentcms@0.1.0 install --plan agentcms-plan.json --dry-run --json
```

Fix whatever `error.hint` says (token permissions, repo or bucket names, URL). Error `content-exists` means the content repo already publishes somewhere else: ask the user whether to keep that site (register it with `agentcms-manage`) or publish elsewhere (`--overwrite-target`).

## Step 5 - Install, check, hand over

Show the user a one-line summary (data -> hosting -> site URL) and ask for a go. Then:

```bash
npx -y @agent-cms/agentcms@0.1.0 install --plan agentcms-plan.json --json
npx -y @agent-cms/agentcms@0.1.0 doctor --site <alias> --json
```

- Relay `data.notices` (for example "GitHub Pages enabled" or how to enable it) and `data.nextSteps`.
- For every doctor check with `status: "fail"`, propose its `fix`. Pages hosts need about a minute before the admin URL answers - re-run doctor after waiting.
- Give the user the site URL and the admin URL, and remind them each new browser asks once for its access token or hosting keys (they are stored per browser, never online).
- **Encrypted SQLite**: the passphrase is the only key to the content. Before finishing, run `npx -y @agent-cms/agentcms@0.1.0 credentials copy passphrase:<alias> --json` (it goes to the clipboard, never to the chat) and ask the user to save it in their password manager now; the admin asks for it once per browser.
- The plan file holds no secrets; offer to delete it or keep it for reference.

## Wizard fallback (Firebase, this browser, local folder, ZIP)

```bash
npx -y @agent-cms/agentcms@0.1.0 serve --json
```

Run it in the background; it prints `data.url` (http://localhost:4173/). The user opens it and follows the setup wizard with the choices from steps 1 and 2 - keep "Host the admin on this site" checked. Help them find each value; secrets go into the wizard, not the chat. Stop the process when the wizard shows its done card, then register the site: `npx -y @agent-cms/agentcms@0.1.0 site add <alias> --admin-url <admin URL> --json` (see `agentcms-manage`).
