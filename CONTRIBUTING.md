# Contributing to AgentCMS

Thanks for your interest! Bug reports, ideas and pull requests are welcome.

## Reporting a bug or asking for a feature

Use the [issue forms](https://github.com/fleox/agentcms/issues/new/choose). For a bug, give:

- the AgentCMS version (`npx -y @agent-cms/agentcms version`)
- the data backend and the hosting you use
- what you did, what you expected, and what happened, including the exact error or the `--json` output of the command

Never paste tokens, keys, passphrases or a `credentials.json` file into an issue.

Security problems go through [SECURITY.md](SECURITY.md), not public issues.

## Development setup

Requirements: Node.js 20+ (22+ for screenshots), npm.

```bash
git clone https://github.com/fleox/agentcms.git
cd agentcms
npm install --legacy-peer-deps   # react-i18next declares an optional peer on TypeScript 5; the install is safe
npm run dev                      # admin at http://localhost:5173 (pick "This browser" in the wizard to try it without any account)
```

| Command | What it does |
|---|---|
| `npm test` | Vitest, single run (`npx vitest run path/to/file.test.ts` for one file) |
| `npm run typecheck` | TypeScript strict mode, admin + CLI |
| `npm run build` | Admin, themes, bundled plugins, the `agentcms` CLI and `dist/version.json` |
| `npm run check:skills` | Agent skills vs CLI commands and versions |
| `npm run check:hermes` | Generated Hermes skills are up to date + Python tests |

Read [CLAUDE.md](CLAUDE.md) for the architecture (it is written for humans too), and [AGENTS.md](AGENTS.md) if you touch the CLI, the skills or the release flow.

## Pull requests

1. Open an issue first for anything bigger than a small fix, so we can agree on the approach.
2. Keep the change focused. Add or update tests: unit tests next to the code, end-to-end CLI tests in `agent/e2e-*.test.ts` (they run on in-memory GitHub / S3 fakes, with no network).
3. Run `npm run build`, `npm test`, `npm run check:skills` and `npm run check:hermes`. CI rejects a `dist/` or `hermes/skills/` that is out of date, so commit the rebuilt files.
4. User-visible changes get an entry in `changelog.json`.

Conventions:

- Code, comments, docs and agent skills are in **English**. UI strings go through `t()` and are added to every locale in `src/i18n/` (English is the source).
- Slugs are lowercase ASCII with dashes.
- Theme components only receive serializable props. The publisher resolves everything before rendering.
- Publish-target code goes through the `services/siteFiles.ts` facade, never `fetch` directly.
- Every `<form>` carries `data-form-type="other"`, and save buttons use the stable-DOM icon pattern (see CLAUDE.md, "Form crash prevention").

## License of contributions

AgentCMS is source-available under the [PolyForm Noncommercial License 1.0.0](LICENSE). By opening a pull request, you agree that your contribution is licensed under the same terms, and that the copyright holder may also distribute it under a commercial license.
