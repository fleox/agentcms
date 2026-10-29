<p align="center">
  <img src="https://raw.githubusercontent.com/fleox/agentcms/master/.github/assets/logo.png" width="200" height="200" alt="AgentCMS">
</p>

<p align="center">
  <strong>The static CMS your AI agent can run.</strong><br>
  A WordPress-style admin that runs in the browser and publishes plain HTML to any static host.<br>
  No server, no PHP, no database to patch.
</p>

<p align="center">
  <a href="https://www.npmjs.com/package/@agent-cms/agentcms"><img src="https://img.shields.io/npm/v/@agent-cms/agentcms?color=4f46e5&label=npm" alt="npm version"></a>
  <a href="https://github.com/fleox/agentcms/actions/workflows/ci.yml"><img src="https://github.com/fleox/agentcms/actions/workflows/ci.yml/badge.svg" alt="CI"></a>
  <a href="https://www.npmjs.com/package/@agent-cms/agentcms"><img src="https://img.shields.io/node/v/@agent-cms/agentcms?color=339933" alt="Node.js version"></a>
  <a href="#claude-code"><img src="https://img.shields.io/badge/Claude%20Code-plugin-d97757" alt="Claude Code plugin"></a>
  <a href="https://github.com/fleox/agentcms/blob/master/LICENSE"><img src="https://img.shields.io/badge/license-PolyForm%20Noncommercial-6b7280" alt="License"></a>
</p>

<p align="center">
  <a href="#quick-start">Quick start</a> ·
  <a href="#features">Features</a> ·
  <a href="#themes">Themes</a> ·
  <a href="#how-it-works">How it works</a> ·
  <a href="https://github.com/fleox/agentcms/blob/master/docs/README.md">Docs</a> ·
  <a href="https://github.com/fleox/agentcms/blob/master/changelog.json">Changelog</a>
</p>

<p align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="https://raw.githubusercontent.com/fleox/agentcms/master/.github/assets/editor-dark.jpg">
    <img src="https://raw.githubusercontent.com/fleox/agentcms/master/.github/assets/editor-light.jpg" width="900" alt="The AgentCMS post editor: a long-form article with its featured image, category, tags and excerpt">
  </picture>
</p>

---

## Why AgentCMS

<table>
<tr>
<td width="33%" valign="top">
<h3>🗂️ Nothing to run</h3>
<p>The public site is static files: HTML, CSS and images. There is no server or plugin to patch and no database to secure. It is fast everywhere, and hosting is often free (GitHub Pages, Cloudflare Pages, an S3 bucket).</p>
</td>
<td width="33%" valign="top">
<h3>🔑 Your data, your hosting</h3>
<p>Content lives where you choose. It can be an <b>encrypted SQLite file</b> on your own hosting, <b>Markdown files in git</b>, <b>Firebase</b>, or <b>this browser</b>. There is no AgentCMS service, account or lock-in.</p>
</td>
<td width="33%" valign="top">
<h3>🤖 Agent-native</h3>
<p>Everything the back office does is also a CLI command with JSON output, and ready-made skills cover Claude Code, Codex, Cursor and Hermes. Ask <i>"write and publish an article about…"</i> and your agent does it, with the same rules and the same output as the admin.</p>
</td>
</tr>
</table>

## Quick start

### With an AI agent

<a id="claude-code"></a>**Claude Code**

```text
/plugin marketplace add fleox/agentcms
/plugin install agentcms@agentcms
```

Then just ask:

> *Install a new AgentCMS site on GitHub Pages.*<br>
> *Write and publish an article about our spring opening, with the photos in ~/Pictures/spring.*<br>
> *Switch to the magazine theme with an orange accent, then add a favicon and enable the RSS feed.*

The agent asks where to store the content and where to host the site, then walks you through every token or key. Secrets never go into the chat.

<p align="center">
  <img src="https://raw.githubusercontent.com/fleox/agentcms/master/.github/assets/demo-install.gif" width="820" alt="A real Claude Code session: one sentence, and the agent installs an AgentCMS site on an S3 bucket with an encrypted SQLite database, checks it and gives the URLs">
  <br><sub>A real Claude Code session. The only edit is the ×8 speed-up while the agent works.</sub>
</p>

Once the site exists, the back office is a conversation:

<p align="center">
  <img src="https://raw.githubusercontent.com/fleox/agentcms/master/.github/assets/demo-content.gif" width="820" alt="A real Claude Code session: the agent publishes nine Markdown travel articles with their photos, then switches the site to the magazine theme">
  <br><sub>Same site, a second request: Markdown articles and photos published, then a new theme. Sped up ×16 while the agent works; it ends on the live site.</sub>
</p>

| Agent | Setup |
|---|---|
| **Claude Code** | the plugin above |
| **Hermes Agent** / Python agents | `hermes skills install fleox/agentcms/hermes/skills/agentcms-install` (Python wrapper + task scripts, see [hermes/](https://github.com/fleox/agentcms/blob/master/hermes/README.md)) |
| **Codex, Cursor, Windsurf, any other agent** | point it at [AGENTS.md](https://github.com/fleox/agentcms/blob/master/AGENTS.md) |

### Without an agent

```bash
npx -y @agent-cms/agentcms serve
```

This starts the admin on your computer (Node.js 20+). Open the printed URL and follow the setup wizard: **data → hosting → install**. The wizard can also put the admin itself on your site (`/admin/`), so other editors only need a browser.

More options, including a local build, a hand-made deploy and Firebase, are in [docs/self-hosting.md](https://github.com/fleox/agentcms/blob/master/docs/self-hosting.md).

## Features

**Writing**
- Block editor with a slash inserter, drag-and-drop, columns, embeds (YouTube, Vimeo, X, Spotify), custom HTML and theme blocks
- Posts, pages, categories, tags, authors, menus and a media library with automatic responsive WebP variants
- Drafts, previews, bulk actions and search, plus Markdown and WordPress import

**Publishing**
- One click renders the page *in your browser* and uploads only what changed (content hashing)
- Clean URLs (`/category/post.html`), automatic cleanup of renamed paths, and listings kept in sync
- Every write is one commit on git hosts, so you get one Pages build per action

**SEO and reach**
- Canonicals, Open Graph and Twitter cards, per-term SEO, sitemaps (including News), `robots.txt` and RSS feeds
- **Multi-language sites**: per-language URLs, editor tabs, menus, hreflang, sitemaps and feeds
- Static search, archives and a favicon/PWA generator

**Extensible**
- 5 themes and a dozen plugins included; install more as ZIP packages from the admin without rebuilding it
- WordPress-style hooks (filters and actions) and a typed runtime API
- `agentcms ext` scaffolds, checks, previews (with screenshots) and ships your own plugins and themes

**Safe by design**
- Secrets (git tokens, S3 keys, passphrases) stay in each editor's browser or in the CLI's `0600` credentials file, never in the site or the repo
- SQLite databases are AES-256-GCM encrypted by default
- The admin UI is available in 7 languages: English, French, German, Spanish, Dutch, Portuguese and Korean

## Themes

Every theme below is a real rendering of the bundled demo content, made by the publisher itself.

<table>
<tr>
<td width="50%"><img src="https://raw.githubusercontent.com/fleox/agentcms/master/.github/assets/theme-magazine.jpg" alt="Magazine theme"><p align="center"><b>Magazine</b>: long-form journalism</p></td>
<td width="50%"><img src="https://raw.githubusercontent.com/fleox/agentcms/master/.github/assets/theme-corporate.jpg" alt="Corporate theme"><p align="center"><b>Corporate</b>: lead generation and company sites</p></td>
</tr>
<tr>
<td width="50%"><img src="https://raw.githubusercontent.com/fleox/agentcms/master/.github/assets/theme-storefront.jpg" alt="Storefront theme"><p align="center"><b>Storefront</b>: product catalogs</p></td>
<td width="50%"><img src="https://raw.githubusercontent.com/fleox/agentcms/master/.github/assets/theme-portfolio.jpg" alt="Portfolio theme"><p align="center"><b>Portfolio</b>: designers and photographers</p></td>
</tr>
<tr>
<td width="50%"><img src="https://raw.githubusercontent.com/fleox/agentcms/master/.github/assets/theme-default.jpg" alt="Default theme"><p align="center"><b>Default</b>: a clean blog</p></td>
<td width="50%"><img src="https://raw.githubusercontent.com/fleox/agentcms/master/.github/assets/admin-themes.jpg" alt="Themes page of the admin"><p align="center">Colors, fonts and logo are editable per theme</p></td>
</tr>
</table>

## How it works

<p align="center">
  <img src="https://raw.githubusercontent.com/fleox/agentcms/master/.github/assets/how-it-works.png" width="900" alt="Your data (SQLite file, Markdown in git, Firebase, this browser) is read and written by the admin, in the browser or the CLI; the admin renders static HTML with the theme and publishes only what changed to your hosting (GitHub, Cloudflare or GitLab Pages, Netlify, S3-compatible bucket, ZIP), which serves plain files to visitors">
</p>

The admin is the only runtime. When you click **Publish**, it reads the content and renders the page with the active theme (`renderToStaticMarkup`), right in the browser. It then uploads the HTML, together with every listing that depends on it, through the selected hosting connector. The **data backend** (where content lives) and the **hosting** (where the site is served) are independent choices:

| Data backend | Good for | Accounts |
|---|---|---|
| **SQLite file** *(default)* | One owner, the simplest setup. Encrypted file on your own hosting. | none |
| **Markdown in git** | Teams. Every change is a commit, and editors use their own GitHub / GitLab token. | repository permissions |
| **Firebase** | Real-time multi-editor work. Free tier. [Illustrated setup](https://github.com/fleox/agentcms/blob/master/docs/firebase.md#set-up-the-firebase-project). | Firebase Auth |
| **This browser** | Trying things out, single user. | none |

Hostings: **GitHub Pages**, **Cloudflare Pages**, **GitLab Pages**, any git-deployed host (Netlify, Vercel…), **S3-compatible buckets** (AWS, R2, OVH, Scaleway…), a local folder, or a ZIP to upload yourself. See [docs/publish-targets.md](https://github.com/fleox/agentcms/blob/master/docs/publish-targets.md).

## How AgentCMS compares

| | AgentCMS | WordPress | Static site generators | Headless CMS |
|---|---|---|---|---|
| Visual admin for editors | ✅ | ✅ | ❌ (files + CLI) | ✅ |
| Public site is static files | ✅ | ❌ | ✅ | depends on your front end |
| Server or database to maintain | ❌ | ✅ | ❌ | ✅ (or SaaS) |
| Build pipeline to set up | ❌ | ❌ | ✅ | ✅ |
| Content stays on your own storage | ✅ | ✅ | ✅ | usually SaaS |
| Fully drivable by an AI agent | ✅ | partial | partial | partial |

## The `agentcms` CLI

The same engine the agents use, also available by hand: `npx -y @agent-cms/agentcms help`. Every command supports `--json`, and destructive commands print a plan until you add `--yes`.

<details>
<summary><b>All commands</b></summary>

| Command | What it does |
|---|---|
| `status` | This tool vs the latest release, and every registered site's admin version |
| `options` | Data backends, hostings and the install plan format |
| `credentials set <type>:<name>` | Stores a token / key per account (hidden prompt, `--from-gh`, `--from-aws-profile`, `--from-env`) |
| `install --plan plan.json` | Installs a site (content store, publish target, theme assets, admin); `--dry-run` only checks |
| `site list \| add \| use \| rename \| forget` | The sites this computer manages |
| `doctor --site <alias>` | Health check with a fix for each problem |
| `deploy-admin --site <alias>` | Updates the hosted admin to this release |
| `serve` | Runs the admin locally for the setup wizard |
| `content list \| get \| create \| update \| publish \| unpublish \| delete \| preview \| blocks` | Posts and pages, like the editor (Markdown, blocks, images, SEO, translations) |
| `media list \| upload \| update \| delete` | Media library (the admin's image pipeline, in Node) |
| `terms`, `menus`, `settings`, `users` | Categories & tags, menus, site settings, users and author profiles |
| `plugins list \| enable \| disable \| config \| action` | Plugins and their settings-page buttons |
| `themes list \| activate \| config \| logo` | Themes, their settings and logo |
| `regenerate home \| all \| repair \| assets \| everything` | The admin's Regenerate menu |
| `transfer export \| import`, `stats` | Content export / import, dashboard numbers |
| `ext new \| check \| preview \| pack \| install` | Build, test and ship plugins and themes |

</details>

## Build a plugin or theme

Plugins and themes are standalone projects that build into a single ZIP. You install that ZIP from the admin (**Plugins / Themes → Install**), with no admin rebuild.

```bash
npx -y @agent-cms/agentcms ext new theme my-theme   # or: ext new plugin my-plugin
cd my-theme && npm install
npm run check      # validates it and renders a demo site through the real publisher
npm run preview    # demo site + desktop / mobile screenshots
```

<p align="center">
  <img src="https://raw.githubusercontent.com/fleox/agentcms/master/.github/assets/demo-theme.gif" width="820" alt="Terminal: ext new theme, npm install, build, check and preview, ending on the rendered demo site">
</p>

Guides: [creating a plugin](https://github.com/fleox/agentcms/blob/master/docs/creating-a-plugin.md) · [creating a theme](https://github.com/fleox/agentcms/blob/master/docs/creating-a-theme.md) · [runtime API](https://github.com/fleox/agentcms/blob/master/docs/runtime-api-reference.md). With Claude Code, the `agentcms-extensions` skill drives the whole loop.

## Documentation

| | |
|---|---|
| [Publish targets](https://github.com/fleox/agentcms/blob/master/docs/publish-targets.md) | Every hosting option, its setup and its limits |
| [Self-hosting](https://github.com/fleox/agentcms/blob/master/docs/self-hosting.md) | Setup wizard, local build, deploying and protecting the admin |
| [Firebase](https://github.com/fleox/agentcms/blob/master/docs/firebase.md) | Console setup step by step (screenshots), security rules and indexes |
| [Themes and plugins](https://github.com/fleox/agentcms/blob/master/docs/themes-and-plugins.md) | How they work, and every built-in plugin |
| [Architecture](https://github.com/fleox/agentcms/blob/master/docs/architecture.md) | Publish pipeline, URLs, menus, images, i18n, code layout |
| [AGENTS.md](https://github.com/fleox/agentcms/blob/master/AGENTS.md) | Instructions for AI agents |

## Contributing

Bug reports and ideas are welcome: [open an issue](https://github.com/fleox/agentcms/issues/new/choose). Read [CONTRIBUTING.md](https://github.com/fleox/agentcms/blob/master/CONTRIBUTING.md) before opening a pull request. For security issues, follow [SECURITY.md](https://github.com/fleox/agentcms/blob/master/SECURITY.md) instead of opening a public issue.

```bash
npm install --legacy-peer-deps
npm run dev        # admin at http://localhost:5173
npm test           # Vitest
npm run build      # typecheck + admin + themes + CLI
```

## License

Source-available under the [PolyForm Noncommercial License 1.0.0](https://github.com/fleox/agentcms/blob/master/LICENSE). Personal, hobbyist, educational, research and other noncommercial use is free, and you can fork, modify and redistribute under the same terms.

**Commercial use requires written authorization.** This includes selling the software or hosting it as a paid service. For a commercial license, [open an issue](https://github.com/fleox/agentcms/issues).
