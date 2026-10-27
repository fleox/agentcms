# AgentCMS — Documentation

Authoring guides for **external** plugins and themes — packages that get distributed as a ZIP, dropped into the admin via the **Install** UI (which uploads them to `<admin folder>/plugins/<id>/` or `<admin folder>/themes/<id>/` on the publish target), and loaded at runtime.

External authoring lives alongside the existing in-tree authoring (folders under `src/plugins/` and `src/themes/` — see the main `README.md`). Both styles share the same hook API and theme manifest shape; the difference is purely about how the bundle reaches the admin:

| | In-tree | External |
|---|---|---|
| Location | `src/plugins/<id>/` or `src/themes/<id>/` in this repo | Anywhere, packaged as a `.zip` |
| Build | Bundled into `dist/admin/` by the admin's `npm run build` | The author runs their own `npm run build`; the admin loads the result via `import()` |
| Distribution | Source code committed to this repo | A `.zip` distributed independently of the admin |
| Add / remove | Code change + redeploy of the admin | Upload the ZIP from the admin (Plugins / Themes → Install) |

## Reading order

1. **[creating-a-plugin.md](./creating-a-plugin.md)** — how to author, build, test and ship an external plugin (`npx -y @agent-cms/agentcms@0.2.0 ext new plugin <id>` → `npm run build` → `npm run check` → install).
2. **[creating-a-theme.md](./creating-a-theme.md)** — same, for themes.
3. **[runtime-api-reference.md](./runtime-api-reference.md)** — guided overview of `@agent-cms/runtime`: versions, `pluginApi`, the hook table, exports by area.

The API reference of record is [`types/agentcms-runtime.d.ts`](../types/agentcms-runtime.d.ts), shipped in the `@agent-cms/agentcms` npm package.

## Working examples

Ready-to-build scaffolds live under `external/` in the main repo. External themes are grouped under `external/themes/<id>/` and external plugins under `external/plugins/<id>/`, where `<id>` matches each bundle's `manifest.id`:

- `external/plugins/hello-plugin/` — minimal plugin: head meta tag + dashboard card.
- `external/plugins/agentcms-sliders/` — block plugin: four slider blocks with inspectors, `MediaPicker`, per-page CSS/JS injection.
- `external/plugins/agentcms-multilang/` — the bundled multi-language plugin: `publish.additional`, editor variant provider, term editor section, sitemap / RSS filters.
- `external/themes/minimal-theme/` — minimal theme: six templates, the BaseLayout checklist, a runtime menu loader.
- `external/themes/marketplace-core/` — full theme: app-store style marketplace listing themes + plugins, with custom blocks, settings page, font + palette overrides.

All follow the conventions described in the docs and are good copy-from-here starting points.

## AI authoring skill

The AgentCMS Claude Code plugin (`/plugin marketplace add fleox/agentcms`, then `/plugin install agentcms@agentcms`) ships the **`agentcms-extensions`** skill ([`plugin/skills/agentcms-extensions/`](../plugin/skills/agentcms-extensions/)): it drives the whole workflow — scaffold with `agentcms ext new`, build, `ext check`, `ext preview --screenshots`, `ext install`. Other agents can read its `SKILL.md` directly.

Contributors working inside this repo (in-tree plugins / themes, extending the runtime API) have a separate project skill: [`.claude/skills/extension-internals/SKILL.md`](../.claude/skills/extension-internals/SKILL.md).
