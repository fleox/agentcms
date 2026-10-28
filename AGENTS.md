# AGENTS.md

Instructions for AI agents (Claude Code, Codex, Cursor, Windsurf, …) working with this repository.

## If the user wants to install or manage an AgentCMS site

Do not clone or build this repo for that. Use the agent skills and the `agentcms` CLI:

- **Claude Code**: `/plugin marketplace add fleox/agentcms`, then `/plugin install agentcms@agentcms`; the `agentcms-install` skill sets up a new site, `agentcms-manage` checks / repairs / updates existing ones, `agentcms-admin` runs a site's back office (content, media, menus, settings, plugins, themes, regeneration), `agentcms-extensions` builds new plugins and themes.
- **Other agents**: read and follow [plugin/skills/agentcms-install/SKILL.md](plugin/skills/agentcms-install/SKILL.md) (new site) or [plugin/skills/agentcms-manage/SKILL.md](plugin/skills/agentcms-manage/SKILL.md) (existing sites), [plugin/skills/agentcms-admin/SKILL.md](plugin/skills/agentcms-admin/SKILL.md) (content and settings of a site), [plugin/skills/agentcms-extensions/SKILL.md](plugin/skills/agentcms-extensions/SKILL.md) (new plugins / themes). Every command it uses is `npx -y @agent-cms/agentcms@<version> <command> --json` (Node.js 20+), which downloads the matching release from npm.
- **Hermes Agent** (and other Python-first agents): install the skills from [hermes/](hermes/README.md) (`hermes skills install fleox/agentcms/hermes/skills/agentcms-admin`, …). Same instructions, commands run through `scripts/agentcms.py`, a stdlib-only Python wrapper of the CLI (Node.js 20.6+ still runs the engine), plus task scripts (`publish_markdown.py`, `upload_media.py`, `site_report.py`, `update_sites.py`).
- Talk to the user in their language. Never ask for secrets (tokens, passwords, secret keys) in the chat — the user types them into the admin or into a command they run themselves.

## If you are developing this repository

Read [CLAUDE.md](CLAUDE.md) (architecture, conventions) and follow these maintenance rules:

- **Skills follow the code.** When you change the setup wizard / installers (`src/pages/setup/`), data backends, publish connectors, hosting options, `agent/` commands or a back-office behaviour the CLI reproduces (publish cascades, settings-page side effects of plugins / themes), update the matching skills under `plugin/skills/` in the same change. Skills are 100% English.
- **Hermes skills are generated**: never edit `hermes/skills/`; change `plugin/skills/` (text) or `hermes/python/` (scripts), then `npm run hermes:build`. `npm run check:hermes` (CI) rejects a stale folder and runs the Python tests.
- **Every `agentcms` command a skill calls must exist** — `npm run check:skills` verifies it against `agentcms help --json`.
- **Record user-visible changes in `changelog.json`** (English, newest first), including `breaking` and the `actions` a hosted site needs after updating (`deploy-admin`, `regenerate-all`, `sync-theme-assets`).
- **Raise `agentcms.minSkillsVersion`** in package.json when older skills would break with the new dist, and **`agentcms.dataSchema`** when stored content changes incompatibly.
- **Rebuild and commit `dist/`** (`npm run build`) — CI rejects a stale `dist/`.
- **CLI code runs from the bundle, tests run from source.** Rollup tracks parameter values from *static* call sites only. A function taken out of a dynamic import (`const { fn } = await import("../ops/x")`) and also called inside its own module with a constant argument loses the branches on that parameter in `dist/agent`: `--screenshot-js` was silently dropped this way. Call such functions as `m.fn(...)`, or route the exported function and the internal caller through a private helper (see `shoot()` in `agent/ops/extScreenshot.ts`). After building, try changed options with `node dist/agent/agentcms.mjs`.
- Releases: [docs/releasing.md](docs/releasing.md).
