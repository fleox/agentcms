---
name: agentcms-manage
description: Check, repair and update existing AgentCMS sites - list the sites this computer manages, register one installed elsewhere, check their health (admin, theme assets, config.js, GitHub Pages, credentials), detect when a newer AgentCMS release or newer skills exist, and offer to update hosted admins. Use when the user asks about one of their AgentCMS / AgentCMS sites, says something is broken, or wants to update.
license: PolyForm-Noncommercial-1.0.0
metadata:
  version: "0.3.5"
  repository: "https://github.com/fleox/agentcms"
---

# Manage AgentCMS sites

This skill covers the sites themselves (registry, health, updates). To change a site's content or settings — posts, pages, media, menus, themes, plugins, regeneration — use the `agentcms-admin` skill.

**Language:** talk to the user in their language; keep commands and files in English.

Every command is `npx -y @agent-cms/agentcms@0.3.5 <command> --json` (Node.js 20+); read `error.hint` whenever `ok` is false. Fallback without npm: `node agentcms/dist/agent/agentcms.mjs` from a clone of https://github.com/fleox/agentcms.

## Always start with status

```bash
npx -y @agent-cms/agentcms@0.3.5 status --json
```

It compares this tool (= these skills, same release) with the latest release, and each registered site's hosted admin with this release.

- `data.tool.updateAvailable: true` -> tell the user AgentCMS `data.tool.latest` exists and offer to update the skills **before anything else**: Claude Code `/plugin marketplace update agentcms` then `/reload-plugins`; other agents re-read the skills from the repository. The new skills pin the new CLI, which then sees the new admin.
- A site with `state: "update"` -> summarise the `releaseNotes` of its `update.versions` (breaking ones first, `update.breaking`), then **offer** `deploy-admin` (below). Never update silently.
- `state: "newer"` -> the hosted admin is newer than this tool: update the skills / tool first, never deploy an older admin.
- `state: "unreachable"` -> run `doctor` for that site.
- `data.advice` already phrases these; relay it.

## Which site?

One computer can manage many sites. `npx -y @agent-cms/agentcms@0.3.5 site list --json` lists them.

- Commands take `--site <alias>`; always pass it. Without it the tool uses `AGENTCMS_SITE` (environment), the folder's `agentcms.json` (`{ "site": "<alias>" }`), the only site, or the default chosen with `site use` (shared by every process on this computer) - otherwise it fails with `site-required`: ask the user which site.
- Always say which site you are working on before changing anything ("Working on **my-blog** (https://...)").
- Never move on to another site without telling the user.

Registry commands: `site show <alias>`, `site use <alias>`, `site rename <from> <to>`, `site forget <alias>` (local only - nothing is deleted online).

## Register a site installed elsewhere

(Setup wizard, another computer, by hand.)

```bash
npx -y @agent-cms/agentcms@0.3.5 site add <alias> --admin-url https://example.com/admin/ --data-credential github:<login> --hosting-credential <account> --json
```

- `--data-credential` is required for Markdown-in-git sites (to read where the site publishes) and for Firebase sites (`firebase:<name>` = the admin's email + password, stored by the user with `! npx -y @agent-cms/agentcms@0.3.5 credentials set firebase:<name>`): the CLI signs in like the admin and reads the publish target from Firestore.
- `--hosting-credential` is needed to update the hosted admin later; for git hostings on the same account as the content it defaults to the data credential.
- SQLite sites: `--hosting-credential` (or `--data-credential` when the database sits in a separate location) opens the database and reads the real publish target from it; an encrypted database also needs `--passphrase-credential passphrase:<name>` (store it first with `credentials set`).
- S3 sites: pass the admin URL the user opens (the bucket's https address, or the http website one); the public site URL is read from the content. `--site-url` overrides it.
- The result lists `warnings` for credentials the CLI will need and doesn't have. Add or change accounts later with `site credentials <alias> --hosting-credential <account> --passphrase-credential <account>` (no need to forget and re-add the site).
- Errors `passphrase-required` / `passphrase-wrong`: store the right passphrase and attach it with `site credentials`. `doctor --site <alias> --deep` opens the content to prove the credentials work.
- Missing credential -> see "Credentials" in the `agentcms-install` skill (the user stores secrets themselves; never in the chat).

## Health check

```bash
npx -y @agent-cms/agentcms@0.3.5 doctor --site <alias> --json
```

Add `--deep` to also test write access (writes then deletes a probe file on file hosts). For each check with `status: "fail"` or `"warn"`, explain it in plain words and propose its `fix`. Common ones:

- `admin` / `admin-files` failing right after a deploy on GitHub/GitLab/Cloudflare Pages: wait a minute, re-run.
- `admin-files`: bundle "served as application/xml" or missing -> the admin was copied partially; propose `deploy-admin`.
- `config-js` publishes secrets -> urgent: tell the user to revoke those keys first, then redeploy.
- `database-exposure` fails -> the SQLite database is downloadable in clear text: propose moving to an encrypted database or a separate private location (reinstall with a new alias, then the user migrates content with Settings -> Data backend -> export / import).
- `github-pages` not enabled -> give the user the settings link from `fix`.
- `credential-*` missing -> the user stores it again with `credentials set`.

## Update a hosted admin

1. Plan only (writes nothing; the JSON answer carries `data.needsConfirmation: true`):
   ```bash
   npx -y @agent-cms/agentcms@0.3.5 deploy-admin --site <alias> --json
   ```
   Show `from -> to`, the number of files and the changes (breaking first). If a plan has `refused`, explain why and stop for that site.
2. After the user agrees:
   ```bash
   npx -y @agent-cms/agentcms@0.3.5 deploy-admin --site <alias> --yes --json
   ```
   Add `--theme-assets` when the changes list the `sync-theme-assets` action. `--all` plans / updates every hosted site (list them all to the user first).
3. Run the `pendingActions` (`regenerate-all` → `agentcms regenerate everything --site <alias>`; `sync-theme-assets` → `agentcms regenerate assets`) and run `doctor` again.

## SQLite sites: encryption and history

- **Not encrypted yet** (`doctor` -> `database-exposure` fail, or the user asks): in the admin, Settings -> Data backend -> **Encrypt the database**. The admin generates a passphrase; the user saves it in their password manager, ticks the confirmation and applies. Other browsers then ask for it once. Store it for the CLI too: `! npx -y @agent-cms/agentcms@0.3.5 credentials set passphrase:<alias>`.
- **Change the passphrase** (leaked, editor left): same place, **Change the passphrase**. Old git commits still hold versions encrypted with the old one - compact the history afterwards (below).
- **Data branch history** (database kept in git, e.g. `agentcms-data`): every save adds a full copy of the encrypted file. When the repository grows, or after a passphrase change:
  ```bash
  npx -y @agent-cms/agentcms@0.3.5 compact-data --site <alias> --json
  ```
  shows the commit count; after the user agrees, re-run with `--yes` to keep one commit. GitHub only; branches holding anything else than the database are refused.

Downgrades are refused (`--allow-downgrade` only on the user's explicit request), and an admin is never replaced by one that can't read the site's data format.
