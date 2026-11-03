---
name: agent-cli-internals
description: Contributor notes for the agentcms CLI (agent/), the distributed agent skills (plugin/skills), the generated Hermes skills + Python scripts (hermes/), releases, and how to QA the whole product with AI agents on real test sites. Invoke when changing agent/ commands or ops, a skill, hermes/, the release flow, or when asked to test / validate AgentCMS end to end in this repository.
---

# agentcms CLI, skills and QA — contributor notes (this repo)

Read [CLAUDE.md](../../../CLAUDE.md) ("Agent distribution") and [AGENTS.md](../../../AGENTS.md) first. Don't commit, push or publish unless the user asked in this conversation (pushing a tag publishes to npm). For extension code (plugins, themes, runtime API, hooks, `settings.schema` / `attrsSchema`) see [`extension-internals`](../extension-internals/SKILL.md); for the Firebase rules, invitations and sign-in methods see [`firebase-internals`](../firebase-internals/SKILL.md).

## Three audiences, one source

| Folder | For | Rule |
|---|---|---|
| `agent/` | the `agentcms` CLI (npm `@agent-cms/agentcms`, bundled to `dist/agent/agentcms.mjs`) | every command `--json` → one `{ok,data}` / `{ok:false,error:{code,message,hint}}` |
| `plugin/skills/` | Claude Code + any agent (AGENTS.md) | **the source of truth**: 100% English, pinned `npx -y @agent-cms/agentcms@<version>`, `check:skills` verifies commands exist |
| `hermes/` | Hermes Agent / Python agents | **generated** by `scripts/build-hermes.mjs` from `plugin/skills/` + `hermes/python/*.py` — never edit `hermes/skills/` |

A behaviour change in `agent/` or the admin it reproduces → update `plugin/skills/` in the same change → `npm run hermes:build`. Add a CLI option to `options`, `usage` and the skill. Record user-visible changes in `changelog.json` (`actions`: deploy-admin / regenerate-all / sync-theme-assets).

## CLI architecture you must know

- **Sessions** (`agent/ops/session.ts` `openSession`): activate the site's runtime config, sign in like the admin, run the legacy-id migration, wire the hosting, import the site's plugin/theme bundles, apply registrations. Commands go through `adminCommon.runAdmin` (flushes the implicit storage batch, reports log + toasts).
- **Bundles and registry come from the HOSTING, not the served site** (`agent/ops/adminFiles.ts` `readAdminFile`: hosting connector `getBytes` → served admin → the CLI's own `dist/admin`). Pages hosts / CDNs serve old files for minutes after a commit; reading the served copy rendered pages with stale bundles. Registry alignment (`migrateLegacy`) uses the HOSTED admin's `external.default.json`, never the CLI's newer one.
- **Build connectors with `hostingConnector()`** (`agent/ops/hosting.ts`, built-in factories). `registerStorageConnector(instance)` replaces the factory in the registry, so `instantiateStorageConnector` would hand a second site the first site's connector when two sites are handled in one process (tests, `ext install` + regeneration).
- **Imported modules are never freed**: cache bundle imports per process (`loadBundledPluginManifests`) or tests run out of memory. `extHost` deletes each bundle copy right after importing it, so an interrupted command leaves nothing in the temp folder.
- **One process can change backend**: `ext install` renders a demo on an in-memory docstore, then writes to a Firebase site. Dispatchers re-resolve when `getBackendKind()` changes; never cache a backend choice in new code.
- **Errors**: throw `CliError(code, message, hint)`; known admin errors are mapped in `agent/output.ts` `knownError` (`passphrase-required/-wrong`, `conflict`). An `internal` code reaching an agent is a bug: map it.
- **`--set` vs `--merge`** (`plugins|themes config`): `--set` = `deepMerge(defaults, keepManaged(prev, value))`, so keys left out return to their default and plugins never see a missing key (the raw replace crashed agentcms-rss in 0.3.8). `--merge` changes only the given keys; skills recommend it.
- **Changing a site's public config** without a redeploy: rewrite only `<adminFolder>/config.js` through `hostingConnector` + `applyOps` + `buildConfigJsSource`, then `putSite` (see `site sign-in-methods`). The served file can lag behind on Pages hosts.
- **Repeatable options**: `multiple: true` joins the values with a space in `options` (fine for space-separated syntaxes like `users update --social`); `multiple: "list"` also keeps each value apart in `ctx.lists[name]` — use it whenever a value may contain spaces (`content --field label="New today"`).
- **Plans**: a command that needs `--yes` answers `needsConfirmation: true`. Skills test that field, never the human "re-run with --yes" text, which only exists without `--json`.
- **`next` hints are commands an agent runs**: always include `--site <alias>`, never admin UI wording ("Regenerate → Everything").
- Writes on git hostings: one storage batch = one commit = one Pages build. Data-branch (`agentcms-data`) and Markdown content commits carry `[skip ci]` (Cloudflare / Netlify would otherwise build every save).
- Empty GitHub repositories refuse blob uploads before the first commit: `src/services/git/github.ts` calls `bootstrapBranch` before uploading anything. Keep that order.
- Rollup gotcha (dynamic import + constant-argument call sites): see AGENTS.md. After building, try changed options with `node dist/agent/agentcms.mjs`.

## Install: what real users taught us

- **One question per message**, each answer checked before the next. Markdown + Pages is explained as **exactly two repositories**: content (private), site (public). A list of three things to create confused a real user.
- `install` checks repository visibility before writing anything (`repoProblems` in `agent/ops/install.ts`, listed in `data.repos`): `repos-swapped` and `content-public` block (`--allow-public-content` overrides the second), `site-private` warns.
- **The SQLite passphrase is a blocking step.** `install` returns a separate `savePassphrase` block (ACTION REQUIRED banner in text mode). The user stores it in a password manager, then proves it with `credentials verify <account>`: TTY only, clears the clipboard first, hidden prompt, constant-time compare, code `mismatch` on failure. Nothing can recover a lost passphrase.
- Secrets never go through the chat, a plan, `config.js`, a repo or a commit: only `~/.agentcms/credentials.json`, entered by the user.
- `install` is never run on the maintainer's Firebase project.

## Tests

- In-memory fakes: `agent/testing/fakeGithub.ts` (git API + Pages; `writeFiles()` commits directly, `holdPages(repo, true)` simulates a Pages build still running), `fakeS3.ts`. E2E files `agent/e2e-*.test.ts` run real commands through `main()`.
- **Memory budget of e2e files**: every publish on `fakeGithub` keeps the whole commit in memory, and `agent/e2e-admin-github.test.ts` is close to the default heap limit (one more scenario with publishes made the worker die with "JavaScript heap out of memory", while it passed with `--max-old-space-size=8000`). Add new scenarios in their own file (e.g. `agent/e2e-admin-fields.test.ts` copies the setup), prefer drafts and publish once.
- `agent/testing/tmpdirSetup.ts` (vitest `globalSetup`) points every temp folder of a run at one directory removed at the end: workers are killed without their own cleanups, and leaked `agentcms-*` folders once filled the disk. New tests use `os.tmpdir()`, nothing else.
- Python: `hermes/tests/` with `fake_engine.py` (`AGENTCMS_CMD` → records calls, scripted answers).
- Before handing over: `npm run build` (typecheck + dist), `npx vitest run`, `npm run check:skills`, `npm run check:hermes`, `npm run smoke:scaffold` (network). CI rejects a stale `dist/` or `hermes/skills/`.
- Never run `npm run build` while other agents run tests against `dist/` (they read half-written bundles).

## Hermes (hermes/)

- `hermes/python/agentcms.py`: stdlib-only wrapper (Python 3.9+): `run(*args, site=)` → `data`, raises `AgentcmsError(code, message, hint)`; CLI mode adds `--json`; interactive `credentials set` and `serve` get the terminal. Engine = `AGENTCMS_CMD` or `npx -y @agent-cms/agentcms@<VERSION>` (placeholder `__AGENTCMS_VERSION__` filled by the generator); `node-missing` / `node-too-old` explain how to install Node.
- Task helpers (`publish_markdown.py`, `upload_media.py`, `site_report.py`, `update_sites.py`) chain CLI commands; keep them stdlib-only, one JSON object on stdout, and add tests with the fake engine.
- `scripts/build-hermes.mjs` rewrites commands (`npx …` → `python3 ${HERMES_SKILL_DIR}/scripts/agentcms.py …` in SKILL.md, `python3 <skill dir>/scripts/agentcms.py …` in references), Claude-only phrases, adds Hermes frontmatter (`metadata.hermes.tags/related_skills`) and a "Running the commands (Hermes)" section. New Claude-specific wording in a skill needs a rewrite rule there.

## Releases

**Each release needs the user's explicit go.** Full reference: [docs/releasing.md](../../../docs/releasing.md).

1. Add the `changelog.json` entry (English, newest first; `actions`: deploy-admin / regenerate-all / sync-theme-assets).
2. Run `npm run build`, `npx vitest run`, `npm run check:skills`, `npm run check:hermes`.
3. Commit everything: `git add -A && git commit -m "<type>(<scope>): …"`. The tree must be clean.
4. `npm version patch|minor` syncs plugin.json, skills metadata and pinned commands, rebuilds dist, regenerates hermes, then commits and tags. The version commit's message is just the number.
5. `git push --follow-tags origin master` triggers `release.yml`: tests, stale-`dist/` check, `smoke:scaffold`, npm trusted publishing, GitHub Release.
6. Verify **from outside the repo** (`cd /tmp`): `npx -y @agent-cms/agentcms@<v> version --json`. Inside the repo, npx fails with `agentcms: command not found`. Allow a few minutes for npm.
7. Check CI + Release. `gh` isn't installed on the maintainer's machine: use `https://api.github.com/repos/fleox/agentcms/actions/runs`, and tolerate empty answers when polling.
8. If `actions` lists deploy-admin / regenerate-all: `deploy-admin --all --yes` + `regenerate everything` on the test sites (retry once on `conflict` when content and site share a repo). Deploy only what the user asked for.

Traps:

- Commits and PRs carry **no Claude attribution** (no `Co-Authored-By`, no "Generated with"). Rewriting history to remove it is the user's call, and they run the force-push.
- CI rejects a stale `dist/`. Beyond `src/` and `agent/`, these also change it: `docs/firebase.md` (the rules are embedded in the CLI) and anything else imported `?raw`.
- Versions in `dist/agent` chunks are hashed, so a release renames many files: a large `git status` is normal.
- Raise `agentcms.minSkillsVersion` / `dataSchema` only when the rules in AGENTS.md say so.

## QA with AI agents (how the product was validated)

When asked to test everything, run **one background agent per scenario**, each on its OWN site, using only the distributed skills and the published package (`npx -y @agent-cms/agentcms@<released>`), like a real user:

- Scenarios that found real bugs: fresh install S3 + encrypted SQLite (sub-folder of a shared bucket); Markdown-in-git + GitHub Pages, bilingual + a custom plugin; Cloudflare Pages upgrade path + theme switching; Firebase site administration (never `install` on the Firebase project); extension authoring end to end (theme + block plugin + dashboard card, sub-folder site); "second computer" (`AGENTCMS_HOME=<tmp>`, `site add`, credentials via `--from-env` read inside one command, export / import).
- Shared rules file for the agents: skills only; shell **function** `a() { npx … "$@"; }` (zsh doesn't split variables); never print secrets; only their site; **always `--site`** (`site use` is global — one agent once wrote into another's site); content in the site's language, look at every image before writing alt text; wait for Pages deployments (`doctor` `deployment`); verify online with `doctor`, `site screenshot` (look at the PNGs) and curl of sitemaps / feeds / data JSON; final report = what was built, bugs (command, output, expected), doc problems, impossible things.
- Then: verify each reported bug in the code before fixing; fix in core / CLI / skills; add e2e tests on the fakes; delegate independent fixes (a theme, a plugin) to parallel agents with **disjoint file ownership** and "no git, no version bump, no `npm run build`"; finally redeploy the local build to every test site (`node dist/agent/agentcms.mjs deploy-admin --site X --yes` + `regenerate everything` + `doctor --deep`) and check the fixed behaviours live before releasing.
- Test sites registered on the maintainer's machine (aliases): `qa-s3`, `sqlitedemo`, `blind2` (S3 bucket `public-test` sub-folders — shared bucket ⇒ `not-found-page` warning is expected), `fbsite` (Firebase, bucket root; current rules, email + password and email link, an invited second address for real join tests), `cftest` (Cloudflare Pages via GitHub), `prana` (GitHub Pages + Markdown in the same public repo ⇒ `content-exposure` warning expected). Credentials live in `~/.agentcms/credentials.json` only.
