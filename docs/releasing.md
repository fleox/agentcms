# Releasing AgentCMS

One repository (`fleox/agentcms`) is the single source for everything users and agents download:

| Channel | What it serves | Updated by |
|---|---|---|
| `dist/` on `master` and on each `vX.Y.Z` tag | Built admin, theme assets, the `agentcms` CLI, `version.json` | `npm run build`, committed |
| npm package `@agent-cms/agentcms` (command `agentcms`) | Same `dist/` subset + the agent skills (`plugin/`) + `changelog.json` | `release.yml`, on tag |
| Claude Code marketplace (`.claude-plugin/marketplace.json` → `plugin/`) | The agent skills | Users run `/plugin marketplace update agentcms` |
| GitHub Release | Release notes generated from `changelog.json` | `release.yml`, on tag |

## Versions

- **`package.json` `version`** is the only version you edit. `npm version` copies it into `plugin/.claude-plugin/plugin.json`, every skill's `metadata.version` and every pinned `npx -y agentcms@x.y.z` command (`scripts/sync-version.mjs`). Skills always call the CLI release they were written for.
- **`agentcms.minSkillsVersion`** (package.json): raise it when skills older than this would misbehave with the new dist (renamed command, changed JSON shape).
- **`agentcms.dataSchema`** (package.json): raise it when stored content changes in a way an older admin cannot read. Agents then refuse to downgrade a site's admin below it.
- `dist/version.json` is generated from these at build time — never edit it by hand.

## Cutting a release

1. Add an entry at the top of `changelog.json` (English): `version`, `date`, `breaking`, `changes[]`, `actions[]` (`deploy-admin`, `regenerate-all`, `sync-theme-assets` — what an existing hosted site needs after the update).
2. Commit everything else first (the working tree must be clean).
3. Optional but recommended: `npm run smoke:scaffold` (network) — packs the package, scaffolds every `agentcms ext new` variant and runs a real `npm install` + build + `ext check` against the tarball. The release workflow runs it too, before publishing.
4. `npm version patch|minor|major` — bumps the version, syncs plugin + skills, **rebuilds `dist/`** (it embeds the version), commits all of it and tags `vX.Y.Z`, so the tagged commit passes the "committed dist/ matches the sources" check.
5. `git push --follow-tags` — `release.yml` re-checks everything, publishes to npm with provenance and creates the GitHub Release.

## One-time npm setup

1. Create the package with a first manual publish from a clean, committed build: `npm login`, then `npm publish --access public`. Then push the `v0.1.0` tag: the release workflow sees the version is already on npm, skips publishing and creates the GitHub Release.
2. On npmjs.com → package `@agent-cms/agentcms` → Settings → **Trusted publishing**: add GitHub Actions, repository `fleox/agentcms`, workflow `release.yml`. From then on the workflow publishes without any stored npm token.
3. Optionally enable "Require two-factor authentication and disallow tokens".

## Checks (CI)

`npm run check:skills` fails when:

- plugin / skill / package versions differ, or a skill pins another `@agent-cms/agentcms@` version;
- a skill calls an `agentcms` command that `help --json` doesn't list;
- a `SKILL.md` uses non-portable frontmatter keys or its `name` differs from its folder;
- skill text isn't English;
- `changelog.json` has no entry for the current version.
