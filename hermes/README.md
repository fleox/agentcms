# AgentCMS for Hermes Agent

Skills and Python scripts that let [Hermes Agent](https://hermes-agent.nousresearch.com) (and any agent that prefers Python) install and run AgentCMS sites: create a site on S3 / GitHub / GitLab / Cloudflare Pages, write and publish content, manage media, menus, settings, plugins and themes, update hosted admins, and build plugins and themes.

| Skill | Use it to |
|---|---|
| [`agentcms-install`](skills/agentcms-install/SKILL.md) | install a new site (data backend + hosting + credentials) |
| [`agentcms-manage`](skills/agentcms-manage/SKILL.md) | check, repair, register and update existing sites |
| [`agentcms-admin`](skills/agentcms-admin/SKILL.md) | everything the back office does: content, media, menus, settings, plugins, themes, regeneration |
| [`agentcms-extensions`](skills/agentcms-extensions/SKILL.md) | create, test and ship plugins and themes |

## Install

One skill (repeat for each):

```bash
hermes skills install fleox/agentcms/hermes/skills/agentcms-admin
```

Or subscribe to the repository as a tap (its skills live in `hermes/skills/`, not the default `skills/`):

```bash
hermes skills tap add fleox/agentcms
# then set the path in ~/.hermes/skills/.hub/taps.json:
#   {"repo": "fleox/agentcms", "path": "hermes/skills/"}
hermes skills search agentcms
```

From a clone, without the hub: add the folder to `~/.hermes/config.yaml`:

```yaml
skills:
  external_dirs:
    - /path/to/agentcms/hermes/skills
```

## Requirements

- **Python 3.9+** — the scripts use the standard library only.
- **Node.js 20.6+** (22+ for screenshots) — the AgentCMS engine (rendering, publishing, data backends) is the [`@agent-cms/agentcms`](https://www.npmjs.com/package/@agent-cms/agentcms) npm package. The scripts run it with `npx`, pinned to the version of the skills; the first call downloads it. Without Node.js they answer `node-missing` with how to install it.
- `AGENTCMS_CMD` overrides the engine command, e.g. `AGENTCMS_CMD="node /path/to/agentcms/dist/agent/agentcms.mjs"` for a clone.

## The scripts

Every skill ships `scripts/agentcms.py`, a dependency-free wrapper of the CLI:

```bash
python3 scripts/agentcms.py status
python3 scripts/agentcms.py content list --site blog --status online
```

It adds `--json` and prints the CLI's JSON object (`{"ok": true, "data": …}` or `{"ok": false, "error": {"code", "message", "hint"}}`); progress goes to stderr; the exit code is the CLI's. From Python:

```python
import sys; sys.path.insert(0, "<skill dir>/scripts")
from agentcms import run, result, AgentcmsError

try:
    posts = result(run("content", "list", "--status", "online", site="blog"))
except AgentcmsError as err:
    print(err.code, err.message, err.hint)   # act on the hint
```

Task helpers (each prints one JSON object; `--help` for options):

| Script | Skill | What it does |
|---|---|---|
| `publish_markdown.py` | admin | Publishes a Markdown file with front matter (title, category, tags, hero image, SEO, translation): uploads its local images in one command (reusing ones already in the library), creates or updates the entry by slug, publishes it. |
| `upload_media.py` | admin | Uploads files / folders in one command with an alt text per image (`--alts alts.json`), lists images still missing a real description. |
| `site_report.py` | install, manage | `status` + `doctor` + `stats` for one or every site: versions, pending updates, problems with their fix, content counts. |
| `update_sites.py` | manage | Plans hosted admin updates, then (`--yes`) deploys, runs the release's actions (regeneration) and re-checks each site. |

## Secrets

Never in the chat. The user types them in their own terminal (`python3 scripts/agentcms.py credentials set github:<login>` asks at a hidden prompt), or keeps them in environment variables (e.g. `~/.hermes/.env`) that the agent passes by name: `credentials set s3:<name> --from-env S3_KEY_ID,S3_SECRET`. They are stored in `~/.agentcms/credentials.json` (mode 0600), never in a site, a repo or a plan file.

## Maintenance (this repository)

`hermes/skills/` is generated — don't edit it. The skills' text comes from [`plugin/skills/`](../plugin/skills) (the single source, shared with Claude Code and other agents); the scripts from [`hermes/python/`](python). `npm run hermes:build` regenerates the folder (the release script runs it), `npm run check:hermes` verifies it is up to date and runs the Python tests ([`hermes/tests/`](tests), a fake engine — no network).
