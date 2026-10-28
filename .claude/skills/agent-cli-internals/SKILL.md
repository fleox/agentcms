---
name: agent-cli-internals
description: Contributor notes for the agentcms CLI (agent/), the distributed agent skills (plugin/skills), the generated Hermes skills + Python scripts (hermes/), releases, and how to QA the whole product with AI agents on real test sites. Invoke when changing agent/ commands or ops, a skill, hermes/, the release flow, or when asked to test / validate AgentCMS end to end in this repository.
---

# agentcms CLI, skills and QA — contributor notes (this repo)

Read [CLAUDE.md](../../../CLAUDE.md) ("Agent distribution") and [AGENTS.md](../../../AGENTS.md) first. Don't commit, push or publish unless the user asked in this conversation (pushing a tag publishes to npm). For extension code (plugins, themes, runtime API, hooks, `settings.schema` / `attrsSchema`) see [`extension-internals`](../extension-internals/SKILL.md).

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
- **Imported modules are never freed**: cache bundle imports per process (`loadBundledPluginManifests`) or tests run out of memory.
- **Errors**: throw `CliError(code, message, hint)`; known admin errors are mapped in `agent/output.ts` `knownError` (`passphrase-required/-wrong`, `conflict`). An `internal` code reaching an agent is a bug: map it.
- **`next` hints are commands an agent runs**: always include `--site <alias>`, never admin UI wording ("Regenerate → Everything").
- Writes on git hostings: one storage batch = one commit = one Pages build. Data-branch (`agentcms-data`) and Markdown content commits carry `[skip ci]` (Cloudflare / Netlify would otherwise build every save).
- Rollup gotcha (dynamic import + constant-argument call sites): see AGENTS.md. After building, try changed options with `node dist/agent/agentcms.mjs`.

## Tests

- In-memory fakes: `agent/testing/fakeGithub.ts` (git API + Pages; `writeFiles()` commits directly, `holdPages(repo, true)` simulates a Pages build still running), `fakeS3.ts`. E2E files `agent/e2e-*.test.ts` run real commands through `main()`.
- Python: `hermes/tests/` with `fake_engine.py` (`AGENTCMS_CMD` → records calls, scripted answers).
- Before handing over: `npm run build` (typecheck + dist), `npx vitest run`, `npm run check:skills`, `npm run check:hermes`, `npm run smoke:scaffold` (network). CI rejects a stale `dist/` or `hermes/skills/`.
- Never run `npm run build` while other agents run tests against `dist/` (they read half-written bundles).

## Hermes (hermes/)

- `hermes/python/agentcms.py`: stdlib-only wrapper (Python 3.9+): `run(*args, site=)` → `data`, raises `AgentcmsError(code, message, hint)`; CLI mode adds `--json`; interactive `credentials set` and `serve` get the terminal. Engine = `AGENTCMS_CMD` or `npx -y @agent-cms/agentcms@<VERSION>` (placeholder `__AGENTCMS_VERSION__` filled by the generator); `node-missing` / `node-too-old` explain how to install Node.
- Task helpers (`publish_markdown.py`, `upload_media.py`, `site_report.py`, `update_sites.py`) chain CLI commands; keep them stdlib-only, one JSON object on stdout, and add tests with the fake engine.
- `scripts/build-hermes.mjs` rewrites commands (`npx …` → `python3 ${HERMES_SKILL_DIR}/scripts/agentcms.py …` in SKILL.md, `python3 <skill dir>/scripts/agentcms.py …` in references), Claude-only phrases, adds Hermes frontmatter (`metadata.hermes.tags/related_skills`) and a "Running the commands (Hermes)" section. New Claude-specific wording in a skill needs a rewrite rule there.

## Releases

`changelog.json` entry → commit → `npm version patch|minor` (sync-version: plugin.json, skills metadata, pinned commands; rebuild dist; regenerate hermes; commit + annotated tag) → `git push --follow-tags origin master` (only with the user's go) → `release.yml` publishes to npm (trusted publishing) and creates the GitHub Release → verify `npx -y @agent-cms/agentcms@<v> version --json` (npm can lag a minute). Hosted test sites then need `deploy-admin --all --yes` + `regenerate everything` (retry once on `conflict` when content and site share a repo).

## QA with AI agents (how the product was validated)

When asked to test everything, run **one background agent per scenario**, each on its OWN site, using only the distributed skills and the published package (`npx -y @agent-cms/agentcms@<released>`), like a real user:

- Scenarios that found real bugs: fresh install S3 + encrypted SQLite (sub-folder of a shared bucket); Markdown-in-git + GitHub Pages, bilingual + a custom plugin; Cloudflare Pages upgrade path + theme switching; Firebase site administration (never `install` on the Firebase project); extension authoring end to end (theme + block plugin + dashboard card, sub-folder site); "second computer" (`AGENTCMS_HOME=<tmp>`, `site add`, credentials via `--from-env` read inside one command, export / import).
- Shared rules file for the agents: skills only; shell **function** `a() { npx … "$@"; }` (zsh doesn't split variables); never print secrets; only their site; **always `--site`** (`site use` is global — one agent once wrote into another's site); content in the site's language, look at every image before writing alt text; wait for Pages deployments (`doctor` `deployment`); verify online with `doctor`, `site screenshot` (look at the PNGs) and curl of sitemaps / feeds / data JSON; final report = what was built, bugs (command, output, expected), doc problems, impossible things.
- Then: verify each reported bug in the code before fixing; fix in core / CLI / skills; add e2e tests on the fakes; delegate independent fixes (a theme, a plugin) to parallel agents with **disjoint file ownership** and "no git, no version bump, no `npm run build`"; finally redeploy the local build to every test site (`node dist/agent/agentcms.mjs deploy-admin --site X --yes` + `regenerate everything` + `doctor --deep`) and check the fixed behaviours live before releasing.
- Test sites registered on the maintainer's machine (aliases): `qa-s3`, `sqlitedemo`, `blind2` (S3 bucket `public-test` sub-folders — shared bucket ⇒ `not-found-page` warning is expected), `fbsite` (Firebase, bucket root), `cftest` (Cloudflare Pages via GitHub), `prana` (GitHub Pages + Markdown in the same public repo ⇒ `content-exposure` warning expected). Credentials live in `~/.agentcms/credentials.json` only.
