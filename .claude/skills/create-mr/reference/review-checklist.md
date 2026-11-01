# Auto-review checklist (AgentCMS)

What Claude looks for during Step 6 of `/create-mr`. Findings are sorted into
five buckets; each finding becomes a single `AskUserQuestion`.

## 1. Bugs

- Null / undefined access on plugin config, optional media formats, legacy
  media without `formats`, posts without a `lastPublishedPath`.
- Unhandled promise rejections, especially around deferred storage commits.
- Races between a mutation and the next subscription emission (see
  `useOptimisticEntities`), or a listener started before its document exists
  (`firebase-internals`).
- `PostEditPage` slug invariants (`justHydratedRef`, `setSlugDirty(true)` at the
  top of `handleSave`, `collisionMessage` hidden while saving).
- Path collisions compared on the raw slug instead of the final URL path, or
  `detectPathCollision` called without `ignoreId`.
- Docstore writes in a loop: one user action = one `write()` with a `message`.
- Epoch ms vs Firebase `Timestamp` at the docstore boundary.
- Code behaving differently from the bundle: Rollup constant-argument gotcha
  in AGENTS.md. Try changed options with `node dist/agent/agentcms.mjs`.

## 2. Architecture

- Feature code calling `firebase/*` or `docstore/*` directly instead of the
  top-level dispatcher.
- Dispatcher exports that aren't hoisted `function` declarations (TDZ through
  the `themes/index.ts` import cycle), or a cached impl that ignores backend
  changes.
- New docstore exports without the `typeof import("../firebase/x")` guard.
- `fetch` against a publish target from feature code: go through
  `services/siteFiles.ts`; new HTTP connectors go through `performRequest`.
- Connector features used without checking `getStorageCapabilities()`.
- New mutating `publisher.ts` entry point not wrapped in `withStorageBatch`;
  a URL move that bypasses `publishPost` and its stale-path cleanup.
- Theme components with hooks, admin context or data reads: they take
  serializable props only. New themes keep both body/head sentinels.
- In-tree plugins or themes importing `src/` modules with state instead of
  `@agent-cms/runtime`.
- Admin assets uploaded without `withAdminBase()` or an explicit folder.
- Runtime scripts that build root paths without the `x-cms-base` helpers.

## 3. Style / conventions

- `strict` TypeScript: no needless `any`, types from `src/core/types.ts`; themes
  import from `../../types`.
- Code matches the surrounding naming, comment density and idiom.
- UI strings through `t()`, in all 7 locales when new.
- Slugs: lower-case ASCII, through `slugify` / `isValidSlug`.
- Forms carry `data-form-type="other"`; submit buttons use the stable `<span>`
  wrapper with `className`-toggled icons, never `{saving ? <A /> : <B />}`.
- Admin images showing a public media URL use `RemoteImage`.
- Dead code, unused imports, magic numbers without a name.

## 4. Documentation

- Comments in English, only when the *why* is non-obvious. Never describe the
  current task or fix in a comment.
- **Skills follow the code** (`plugin/skills/`, then `npm run hermes:build`).
- User-visible change: entry in `changelog.json` with its `actions`.
- New CLI option: `options`, `usage`, the skill.
- Runtime or hook change: the checklists of `extension-internals`.
- Bundled plugin / theme change: version bump in every place it is stamped.
- CLAUDE.md, README or docs/ when architecture or behaviour described there
  changed. README links stay absolute (`repo-presentation`).

## 5. Security

- Secrets in `config.js`, a repo, the SQLite file, a plan, a log or a `--json`
  answer. They belong in per-browser storage or `~/.agentcms/credentials.json`.
- Firestore rules: can an account grant itself access? Remember the `apiKey` is
  public. Rules changes run the emulator harness (`firebase-internals`).
- Encrypted SQLite: file format, salt kept, fresh IV per save, and no save that
  downgrades an encrypted file.
- Rendered HTML not passing through `core/markdown.ts` (DOMPurify).
- Path traversal in connectors, ZIP extraction (`externalUpload`, `extZip`) and
  ids used as folder names: `manifest.json` ids are sanitised, bundle ids
  cross-checked.
- Private content exposed: public content repository, data files in a served
  folder.

## Severity grading

For each finding, pick one of:

- **Critical** — actively broken (bug bucket) or actively dangerous
  (security bucket). Default to "Apply".
- **Major** — design issue that will hurt soon (architecture bucket). Default
  to "Apply" unless the user objects.
- **Minor** — style nit, missing comment, magic number (style /
  documentation buckets). Surface as a batch at the end so the user can
  bulk-skip if pressed for time.

Always show the finding's line + the proposed fix in chat before asking —
the user must be able to evaluate the trade-off in seconds.
