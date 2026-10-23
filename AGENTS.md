# AGENTS.md

Instructions for AI agents (Claude Code, Codex, Cursor, Windsurf, …) working with this repository.

## If the user wants to install or manage an AgentCMS site

Do not clone or build this repo for that. Use the agent skills and the `agentcms` CLI:

- **Claude Code**: `/plugin marketplace add fleox/agentcms`, then `/plugin install agentcms@agentcms`; the `agentcms-install` skill sets up a new site, `agentcms-manage` checks / repairs / updates existing ones.
- **Other agents**: read and follow [plugin/skills/agentcms-install/SKILL.md](plugin/skills/agentcms-install/SKILL.md) (new site) or [plugin/skills/agentcms-manage/SKILL.md](plugin/skills/agentcms-manage/SKILL.md) (existing sites). Every command it uses is `npx -y @agent-cms/agentcms@<version> <command> --json` (Node.js 20+), which downloads the matching release from npm.
- Talk to the user in their language. Never ask for secrets (tokens, passwords, secret keys) in the chat — the user types them into the admin or into a command they run themselves.

## If you are developing this repository

Read [CLAUDE.md](CLAUDE.md) (architecture, conventions) and follow these maintenance rules:

- **Skills follow the code.** When you change the setup wizard / installers (`src/pages/setup/`), data backends, publish connectors, hosting options or `agent/` commands, update the matching skills under `plugin/skills/` in the same change. Skills are 100% English.
- **Every `agentcms` command a skill calls must exist** — `npm run check:skills` verifies it against `agentcms help --json`.
- **Record user-visible changes in `changelog.json`** (English, newest first), including `breaking` and the `actions` a hosted site needs after updating (`deploy-admin`, `regenerate-all`, `sync-theme-assets`).
- **Raise `agentcms.minSkillsVersion`** in package.json when older skills would break with the new dist, and **`agentcms.dataSchema`** when stored content changes incompatibly.
- **Rebuild and commit `dist/`** (`npm run build`) — CI rejects a stale `dist/`.
- Releases: [docs/releasing.md](docs/releasing.md).
