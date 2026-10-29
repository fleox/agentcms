# GitHub - content repo, GitHub Pages hosting, token

## Repositories - exactly two, one private, one public

Markdown content + GitHub Pages always uses **two** repositories. Never mention a third one (the admin is not a repository: it is copied into the site repository's `admin/` folder). Explain it to the user with this table, in their language, before asking for anything:

| | **Content** repository | **Site** repository |
|---|---|---|
| Holds | the posts as `.md` files, drafts, settings, editors' emails | the generated HTML pages + the admin (`admin/` folder) |
| Visibility | **Private** | **Public** (free GitHub plans only publish public repositories) |
| Example name | `my-blog-content` | `my-blog` → `https://<owner>.github.io/my-blog` |
| Plan field | `data.git.repo` | `hosting.settings.repo` |

Ask for them **one at a time** and check each answer before the next question - users easily swap them:

1. "What is the name of the **private** repository for the content?" → check it: `npx -y @agent-cms/agentcms@0.3.9 install --plan agentcms-plan.json --dry-run --json` once the plan has it, or simply confirm with the user that GitHub shows a **Private** badge next to its name.
2. "What is the name of the **public** repository for the website?" → same check (**Public** badge).
3. Repeat both names back with their role ("content: `me/my-blog-content` (private) - site: `me/my-blog` (public)") and get a yes before writing the plan.

The dry run then verifies it for real: its `data.repos` lists each repository with its role and visibility, and it stops with `repos-swapped` (content public, site private: swap `data.git.repo` and `hosting.settings.repo`) or `content-public` (make the content repository private: Settings → General → Danger Zone → Change visibility). Use `--allow-public-content` only if the user explicitly wants their drafts public.

- Creating the repositories: empty repositories are fine, and so is "Add a README file" - the install creates the first commit either way. A README in the site repository is served by the site; remove it later with `agentcms files delete README.md --site <alias> --yes` if the user doesn't want it.
- If `gh` is installed and signed in (`gh auth status`), offer to create both, so the visibility can't be wrong:

  ```bash
  gh repo create <owner>/<site-repo> --public --description "Website published by AgentCMS"
  gh repo create <owner>/<content-repo> --private --description "AgentCMS content"
  ```

  Otherwise send the user to https://github.com/new **twice** - once with *Private*, once with *Public* - and ask for each name as above.
- One repository for both is possible but exposes the content (Pages serves the whole repository: drafts, unpublished pages, `users.json`). If the user insists, publish the site from a `docs` folder (`hosting.settings.dir: "docs"`); `install` and `doctor` (`content-exposure`) warn about it.

## Token

The same token can serve the content and the site.

**Option A - fine-grained token (recommended, least privilege).** Send the user to:

```
https://github.com/settings/personal-access-tokens/new?name=AgentCMS&description=AgentCMS%20content%20and%20site&contents=write&pages=write&metadata=read
```

If GitHub ignores the query parameters, they set by hand:
- Resource owner: the account or organisation owning the repos.
- Repository access: **Only select repositories** -> the content repo + the site repo.
- Permissions -> Repository: **Contents: Read and write**, **Pages: Read and write** (lets AgentCMS switch Pages on), Metadata: Read-only (automatic).
- Expiration: their choice (note the date - the site stops publishing when it expires).

Then they store it themselves: `! npx -y @agent-cms/agentcms@0.3.9 credentials set github:<login>` and paste it at the hidden prompt.

**Option B - reuse the GitHub CLI login** (broader `repo` scope, quickest):

```bash
npx -y @agent-cms/agentcms@0.3.9 credentials set github:<login> --from-gh --json
```

Each editor of a Markdown site later signs in to the admin with **their own** token (same permissions on the content repo); write access = editor, admin access = admin.

## Site URL

- Repository `<owner>/<repo>` -> `https://<owner>.github.io/<repo>`
- Repository named `<owner>.github.io` -> `https://<owner>.github.io`
- Custom domain configured in the repo's Pages settings -> that domain (`https://www.example.com`).

## Plan fragment

```json
"hosting": { "type": "github-pages", "settings": { "owner": "<owner>", "repo": "<site-repo>", "branch": "main", "siteUrl": "https://<owner>.github.io/<site-repo>" } }
```

Omit `hosting.credential` when the content is also on GitHub with the same account (its token is reused).

## SQLite data on a GitHub Pages site

With the SQLite backend, the database goes into the **same repository** on a dedicated branch, `agentcms-data`, that Pages never publishes: saving content doesn't rebuild the site and the file isn't served by it. It is encrypted, so a public repository is fine - but keep the passphrase safe: anyone who has it and can read the repo can read the content. Nothing to configure; the install creates the branch (after `main`, so `main` stays the default branch).

## GitHub Pages switch

The first install commit tries to enable Pages through the API (needs the Pages permission). If the install notices say it could not, or `doctor` reports `github-pages: fail`, the user opens `https://github.com/<owner>/<site-repo>/settings/pages` -> Source: **Deploy from a branch** -> `main` / `(root)` -> Save. The first build takes about a minute.

GitHub may show a "Start trial" banner for GitHub Enterprise on the Pages page of a private repo: that's the public-repo requirement, not something to buy - make the site repository public instead.
