---
name: repo-presentation
description: How the AgentCMS public presentation is built and kept up to date — the README (GitHub and npm page), docs/ layout, screenshots, terminal demo GIFs, logo, social preview and the illustrated Firebase guide. Invoke when changing the README, adding or refreshing an image or demo, or restructuring docs/ in this repository.
---

# GitHub and npm presentation — contributor notes (this repo)

Read [CLAUDE.md](../../../CLAUDE.md) first. Don't commit or push unless asked. Everything public is in English.

## The README is two pages

`README.md` is both the GitHub page and the npm page, and npm renders it away from the repo. So:

- **Links and images must be absolute** (`https://github.com/fleox/agentcms/blob/master/…`, `https://raw.githubusercontent.com/fleox/agentcms/master/.github/assets/…`). A relative link breaks on npm.
- Dark/light images use `<picture>` with `prefers-color-scheme`.
- The README is a landing page: Why → Quick start → Features → Themes → How it works. Details belong in `docs/`.
- The README ships in the npm tarball, but only at publish: a README fix reaches npm with the next release.

## Layout

| Path | Content |
|---|---|
| `docs/README.md` | Index of the documentation; add new pages here |
| `docs/self-hosting.md`, `firebase.md`, `publish-targets.md`, `architecture.md`, `themes-and-plugins.md` | User guides |
| `docs/creating-a-plugin.md`, `creating-a-theme.md`, `runtime-api-reference.md`, `releasing.md` | Developers |
| `.github/assets/` | Logo, social preview, screenshots, GIFs, `firebase/` steps |
| `.github/demos/` | VHS tapes and render scripts (`out/` is git-ignored) |
| `CONTRIBUTING.md`, `SECURITY.md`, `.github/ISSUE_TEMPLATE/`, `.github/pull_request_template.md` | Community files |

`docs/firebase.md` is also a build input: see [`firebase-internals`](../firebase-internals/SKILL.md) before editing it.

## Screenshots

Use real output, never mock-ups:

- Themes and site pages: render a demo with `agentcms ext preview`, or capture a live site with `agentcms site screenshot --site <alias>`. `agent/ops/extScreenshot.ts` drives a local Chrome over the DevTools protocol.
- Admin screens: headless Chrome on `npm run dev` or a deployed test admin, with `--color-scheme` or the DevTools protocol for the dark version.
- Look at every image before using it (a broken demo image shipped once). JPG for screenshots, PNG for what needs transparency.
- `.github/assets/how-it-works.png` is the README's diagram.

## Terminal demos

Tools: `vhs`, `ffmpeg`, `bc`. All tapes use 1200×680, Catppuccin Mocha.

- **Scripted** (`theme.tape`): `.github/demos/render.sh theme` records it and appends the still of the result to `demo-theme.gif`.
- **Real agent sessions** (`install.tape`, `content.tape`): real Claude Code runs with the agentcms plugin in a clean folder. Not reproducible as is: review the recording, note when the prompt was sent and when the agent finished, then:

  ```bash
  .github/demos/compose.sh .github/demos/out/content.mp4 .github/assets/demo-content.gif <sent s> <done s> 9 16 <live screenshot>
  ```

  It keeps real time until the prompt is sent, speeds up the agent's work with a visible `speed-label-8/16.png`, holds the final answer, then shows the result. Never present a sped-up part as real time.
- Recordings must not show tokens, private paths or personal accounts. Use a demo site.

## Logo and social preview

- `.github/assets/logo.png`: transparent background, 200 px in the README header.
- The admin's logo is separate (sidebar, sign-in, setup wizard, tab icon): changing it is a user-visible change that needs a rebuild, a changelog entry and `deploy-admin` in `actions`.
- `social-preview.png` must be uploaded by the maintainer in GitHub → Settings → Social preview.

## Illustrated Firebase guide

`.github/assets/firebase/step-*.jpg` are annotated console captures with personal data **blurred**, and `firebase-setup.gif` is the slideshow. GitHub Markdown has no steppers, so each stage of the guide is a `<details>` block listing its numbered captures.

## Writing rules

- Say what the product does today; describe nothing planned.
- The licence is **PolyForm Noncommercial**: say "source available", never "open source".
- No Claude attribution anywhere (commits, PRs, docs).
