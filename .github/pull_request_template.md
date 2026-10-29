## What and why

<!-- What does this change, and which issue does it address? -->

## Checklist

- [ ] Tests added or updated (unit, or `agent/e2e-*.test.ts` for the CLI)
- [ ] `npm run build`, `npm test`, `npm run check:skills` and `npm run check:hermes` pass, and the rebuilt `dist/` / `hermes/skills/` are committed
- [ ] New UI strings go through `t()` in every locale of `src/i18n/`
- [ ] Skills in `plugin/skills/` updated if the CLI or the admin's behaviour changed
- [ ] `changelog.json` entry for user-visible changes
