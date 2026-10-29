---
name: agentcms-admin
description: "Run an AgentCMS site like its back office does - write, edit, publish, unpublish and delete posts and pages (Markdown, editor blocks, images, categories, tags, SEO, translations), upload media, edit menus, site settings, categories and tags, users and author profiles, enable / disable / configure plugins (sitemaps, RSS, search, archives, favicon, custom code, import, multilang), switch and configure themes (logo, colors, layout), and run every regeneration. Use when the user wants to change content or settings of one of their AgentCMS sites, or asks to publish / regenerate."
version: 0.3.8
author: AgentCMS
license: PolyForm-Noncommercial-1.0.0
platforms: [macos, linux, windows]
metadata:
  hermes:
    tags: [AgentCMS, CMS, Static site, Publishing, Content]
    related_skills: [agentcms-install, agentcms-manage, agentcms-extensions]
---

# Administer an AgentCMS site

**Language:** talk to the user in their language. Commands, files and these instructions stay in English. Write the site's **content** in the site's language: see `settings get site`.

Every command is `python3 ${HERMES_SKILL_DIR}/scripts/agentcms.py <command> … --site <alias> --json` (Node.js 20.6+). Without npm, set `AGENTCMS_CMD="node <clone>/dist/agent/agentcms.mjs"` (the wrapper then runs that build).
- The output is one JSON object on stdout, `{ ok, data: { site, result, log, notices, warnings } }`. Progress lines go to stderr: don't merge the two streams when you parse the JSON.
- When `ok` is false, act on `error.hint`.
- `--help` after a command prints all its options.
- **Always pass `--site <alias>`.** `site use` sets a default shared by every process on this computer: another agent or terminal can change it between two of your commands. Check `data.site` in each result.

## Running the commands (Hermes)

Every `agentcms <command>` below runs through this skill's Python wrapper: `python3 ${HERMES_SKILL_DIR}/scripts/agentcms.py <command> …`. It adds `--json`, prints the CLI's JSON object (`{"ok": true, "data": …}` or `{"ok": false, "error": {code, message, hint}}`) and exits with the CLI's code. In the reference files, `python3 <skill dir>/scripts/agentcms.py` means the same command with this skill's directory.

- **Requirements:** Python 3.9+ (stdlib only) and **Node.js 20.6+**: the AgentCMS engine is the `@agent-cms/agentcms` npm package, fetched by `npx` on first use and pinned to the version of these skills. Without Node.js the wrapper answers `node-missing` with how to install it. `AGENTCMS_CMD` overrides the engine command (e.g. `node /path/to/agentcms.mjs` from a clone).
- **From Python:** `sys.path.insert(0, "${HERMES_SKILL_DIR}/scripts")`, then `from agentcms import run, AgentcmsError` — `run("content", "list", site="blog")` returns `data` and raises `AgentcmsError(code, message, hint)` when `ok` is false.
- **Plans:** a command that needs `--yes` and didn't get it writes nothing and answers `needsConfirmation: true` (on `data`, or on `data.result` for admin commands) — test it with `needs_confirmation(data)` from the wrapper. The sentence "re-run with --yes" only exists in the human output, never match on text.
- **Secrets** never go through the chat. The user either types them in their own terminal (`python3 ${HERMES_SKILL_DIR}/scripts/agentcms.py credentials set <account>` asks at a hidden prompt), or puts them in environment variables (e.g. in `~/.hermes/.env`) that you pass by name: `credentials set <account> --from-env VAR` (`--from-env KEY_ID,SECRET` for S3).
- **Helpers** in `${HERMES_SKILL_DIR}/scripts/` (each prints one JSON object; `--help` for options):
  - `publish_markdown.py`: Publish a Markdown file (with front matter) to an AgentCMS site.
  - `upload_media.py`: Upload images to an AgentCMS site's media library in ONE command (one commit).

## How it works

- **Same code as the admin.** The CLI signs in to the site exactly like the back office: Firebase account, git token, or the SQLite file's keys and passphrase. It then runs the admin's own code headless, with the site's installed plugins and active theme. Everything you do is what an editor clicking in the admin would do, with the same rules and the same published output.
- **Sites and credentials.** A site must be registered on this computer: `python3 ${HERMES_SKILL_DIR}/scripts/agentcms.py site list --json`. To register one, see the `agentcms-manage` skill.
  - Firebase sites need the admin login stored as `firebase:<name>`. The user types it: `python3 ${HERMES_SKILL_DIR}/scripts/agentcms.py credentials set firebase:<name>`.
  - Never ask for a password or key in the chat.
- **Saving and publishing are different.** A post or page is a **draft** until published. Publishing renders its page and refreshes the home, category and author pages, `data/menu.json`, sitemaps, feeds and the search index.
- **Editing an online entry republishes it** (`content update`), like the editor's Save button. Use `--no-publish` to keep the published version unchanged.
- **Many other saves change nothing on the public site.** Settings, categories and tags, enabling a plugin, plugin or theme layout config, favicon all need a regeneration. Every command returns the exact one in `data.result.next`; run it, or tell the user why not.
- **Confirmation.** Destructive or site-wide commands only print a plan without `--yes`: delete content, media, terms or users, `themes activate`, `transfer import`, `plugins action agentcms-import run`. Show the plan and get the user's go before re-running with `--yes`. In JSON a plan is marked by `needsConfirmation: true` (in `data.result`; on `data` for `deploy-admin`, `ext install`, `compact-data`): nothing was written. Detect plans by that field, never by the human text.
- **Identify the site.** Say which site you are working on ("Working on **my-blog** (https://...)"). Never switch sites silently.

## Commands at a glance

| Back-office area | Command |
|---|---|
| Posts, pages, editor, preview | `content list / get / create / update / publish / unpublish / delete / preview / blocks` |
| Media library | `media list / get / upload / update / delete` |
| Categories & tags | `terms list / get / create / update / delete` |
| Menus | `menus get / set / add / remove / move` |
| Settings → General | `settings get / set / target show / target test` |
| Plugins page + plugin settings and buttons | `plugins list / enable / disable / config / action` |
| Themes page + theme settings, logo | `themes list / activate / config / logo / sync-assets` |
| Regenerate menu | `regenerate home / all / repair / assets / everything / targets / <target-id>` |
| Users | `users list / get / update / role / disable / enable / delete / locale` |
| Data export / import | `transfer export / import` |
| Dashboard | `stats` |
| Other files on the hosting (verification file, stray old page) | `files list / put / delete` |
| Install plugin / theme ZIPs | `ext install / list / uninstall` (see `agentcms-extensions`) |

Details, examples and every option: [references/content.md](references/content.md) (writing, blocks, images, SEO, translations, publishing) and [references/site.md](references/site.md) (settings, menus, terms, plugins, themes, users, regeneration, transfer).

## Typical workflows

**Write and publish an article**
1. Read the site language with `settings get site`. List existing categories and tags with `terms list`.
2. Upload images if needed: `media upload photo.jpg --alt "…"`. Keep the returned `id` and `url`.
3. Write the Markdown to a file, then:
   ```bash
   python3 ${HERMES_SKILL_DIR}/scripts/agentcms.py content create --site <alias> --title "…" --body @article.md --category "…" --tags "a,b" --hero <media id> --excerpt "…" --seo-description "…" --json
   ```
   This creates a draft. Preview it with `content preview <id> --screenshots` and look at the PNGs if you can read images. Publish when the user agrees: `content publish <id>`, or `--publish` on create.
   With `--create-terms`, missing categories and tags are created; `result.createdTerms` lists them. Tell the user.

**Change the look**
- Switch theme: `themes activate <id>` (plan), then `--yes`.
- Colors and fonts: `themes config <id> --schema`, then `themes config <id> --merge '{…}'`. The CSS is re-uploaded right away.
- Logo: `themes logo <id> logo.png`. Use a wide, trimmed image (about 3:1, at least 480 px wide, transparent background); it is fitted into 480×144.
- Layout options: run `regenerate all` afterwards.

**Site settings**
- `settings set --title … --description … --language fr --base-url https://…`, then the `next` regeneration.
- Static home page: `settings set --home-mode static-page --home-page <page>`, then `regenerate repair` and `regenerate all`.

**Navigation:** `menus set --data '{"header":[{"label":"Home","home":true},{"label":"News","category":"news"},{"label":"About","post":"about"}],"footer":[…]}'`. Takes effect at once.

**SEO and discovery**
- Sitemaps: `plugins enable agentcms-sitemaps`, then `regenerate agentcms-sitemaps` (needs `settings set --base-url`). It also writes `robots.txt`; `plugins action agentcms-sitemaps robots --default-robots` resets it. Crawlers only read `robots.txt` at the domain root: on a site in a sub-folder, say so to the user.
- RSS: `plugins config agentcms-rss --merge '{"site":{"enabled":true,"addToFooter":true}}'`, then `regenerate agentcms-rss`. `addToFooter` adds the footer link itself: don't add one to the menus too.
- Favicon: `plugins action agentcms-favicon set icon.png`, then `regenerate all`.
- Analytics: `plugins config agentcms-custom-code --merge '{"head":"<script …>"}'`, then `regenerate all`.

**Import existing content:** `plugins action agentcms-import scan <folder|export.xml>` shows a dry-run summary. Then `plugins action agentcms-import run <same> --status draft|online --yes`.

**After many changes, or when unsure:** `regenerate everything` rebuilds the whole site (theme files, every page, every plugin's files).

**Check the result.** After publishing or regenerating, look at the live site, not only the JSON:
1. `site screenshot <path…> --out shots` captures published pages (desktop + mobile; no path = the home page). Look at the PNGs if you can read images.
   - `--max-height 800` keeps only the top of each page; full pages can be very tall.
   - `--screenshot-js` runs code before the capture, e.g. to open the search: `'document.querySelector("[data-cms-search]")?.click(); await new Promise(r => setTimeout(r, 500))'`. To open the mobile menu, click the theme's burger button (`[aria-controls]` or `button[aria-label*="menu" i]`).
2. Or fetch them (`curl -s <site URL>/<path>`) and check the title, the content and the links.
3. Static hosts and CDNs can serve the previous version for a minute after an upload (GitHub / Cloudflare Pages rebuild after each commit, and builds queue up after many commands). `doctor` reports a pending deployment (`deployment` check); wait until it is ok before judging the live pages.

## Rules

- Prefer the narrowest regeneration the result's `next` asks for; `everything` is always correct but slower.
- Check before you write: list or get existing entries and terms, so you don't create duplicates (slugs must be unique per URL).
- Before deleting a post, page or category, read the plan: `menuItems` lists the menu entries that still point to it. Remove them with `menus remove <id> --menu <menu>`, or the menu keeps a dead link.
- Keep the user's voice. Ask before deleting, unpublishing or overwriting someone else's text.
- Images: always set `--alt`. Upload JPEG, PNG, WebP or GIF (convert SVG and HEIC first, e.g. `sips -s format jpeg` on macOS). The site makes its own resized variants.
- **Git sites:** every command is one commit to the published site and one Pages build (content saves on Markdown sites are separate commits marked `[skip ci]`); avoid loops of tiny commands when one command can take several items (`content publish a b c`, `media upload --data @media.json`).
- **SQLite sites:** one writer at a time, and the CLI locks the site while it writes. If the user is editing in the admin at the same time, a save can hit a conflict. Retry, or ask them to reload the admin.
- **Version mismatch:** if `warnings` say the hosted admin and this tool differ, offer `deploy-admin` (see `agentcms-manage`).
- **Firebase sites:** the CLI keeps the sign-in between commands, but Firebase still rate-limits bursts. If a command fails with `firebase-rate-limited`, wait a few minutes. Prefer one command over many small ones.
- **Setting up a site for someone:** review what an earlier test may have left: `settings get site` (`discourageIndexing` must be false on a live site), `themes config <id> --get` (placeholder texts), the logo (`themes list` → `logo`), demo posts (`content list`).
