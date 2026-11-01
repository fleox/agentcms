# Conventional Commits — type, scope, subject

The skill writes commit messages and PR titles in this exact format:

```
<type>(<scope>): <subject>

<body — optional, bullet list>
```

Never add a `Co-Authored-By: Claude` or "Generated with Claude Code" line.

## Type

| Type       | When                                                                  |
|------------|-----------------------------------------------------------------------|
| `feat`     | A new user-visible feature                                            |
| `fix`      | A bug fix                                                             |
| `refactor` | Same behavior, cleaner code                                           |
| `perf`     | Performance-only change with no behavior change                       |
| `style`    | Formatting, whitespace (rare — usually folded into `chore`)           |
| `docs`     | Documentation only (CLAUDE.md, README, code comments)                 |
| `test`     | Adding or modifying tests                                             |
| `build`    | Build system, deps, lockfile, `dist/` refreshes                       |
| `ci`       | CI/CD config (.github/workflows)                                      |
| `chore`    | Routine maintenance, no production impact                             |
| `revert`   | Revert a previous commit                                              |

When in doubt between `feat` and `refactor`: if a user could notice the change
in the UI or API, it's `feat` (or `fix` if it was broken). Otherwise `refactor`.

## Scope

A short noun that points at the area touched. Pick one — never multiple.
Scopes that fit this repo:

- `admin` — admin UI pages and components
- `editor` — post / page editor, blocks
- `publish` — publisher, menus, posts/authors JSON
- `storage` — publish connectors (git Pages, S3, local folder, ZIP)
- `docstore` — SQLite file / Markdown-in-git / local data backends
- `firebase` — Firebase data backend
- `setup` — first-run setup wizard
- `themes` — in-tree and external themes
- `plugins` — in-tree, must-use and external plugins
- `runtime` — @agent-cms/runtime API for external bundles
- `agent` or `cli` — the agentcms CLI
- `install` — the install command and its skill
- `media` — media library and image pipeline
- `skills` — Claude Code plugin and skills
- `i18n` — translations
- `release` — versioning, CI, npm publishing

Omit the scope if a single label doesn't fit cleanly. Better no scope than a
misleading one.

## Subject

- Imperative mood ("add", "fix", "rename" — not "added", "fixes", "renaming").
- ≤ 72 characters total including the `<type>(<scope>):` prefix.
- No trailing period.
- Lowercase first letter (after the colon).

## Body

Optional, but encouraged for anything non-trivial:

```
feat(cli): site sign-in-methods for Firebase sites

- Show the methods of a site, or change them
- Rewrite only the hosted admin's config.js
- Keep password: the CLI signs in with it
- List the console steps in `next`
```

- Wrap at 72 chars.
- Use bullets, not paragraphs, unless context truly warrants prose.
- Reference issues / PRs in a trailing `Refs:` or `Closes #N` line.

## What to AVOID

- Mixing two concerns in one commit: never do
  `feat(cli): add a command and fix an unrelated bug` — split into two.
- Generic subjects: "fix bug", "update files", "wip" — useless in `git log`.
- Translating "what the user said" verbatim: the message describes the *code
  change*, not the request that prompted it.
