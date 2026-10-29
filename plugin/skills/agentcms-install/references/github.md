# GitHub - content repo, GitHub Pages hosting, token

## Repositories

- **Content** (Markdown backend): a repository holding posts as `.md` files. Make it **private** - it contains drafts.
- **Site** (GitHub Pages): a repository the admin publishes HTML into. On free GitHub plans Pages only works on **public** repositories.
- Use two repositories, the content one **private**. Pages serves the whole published repository: content kept in it (even in a `content/` folder) is public — drafts, unpublished pages and `users.json` with the editors' emails. `install` and `doctor` (`content-exposure`) warn about it. If the user insists on one repository, publish the site from a `docs` folder (`hosting.settings.dir: "docs"`) so the content folder isn't served.
- An empty repository is fine: the first install commit creates the branch.
- Everything in the site repository is public on the site, including a `README.md` GitHub created: remove it with `agentcms files delete README.md --site <alias> --yes` if the user doesn't want it served.

If `gh` is installed and signed in (`gh auth status`), offer to create them:

```bash
gh repo create <owner>/<site-repo> --public --description "Website published by AgentCMS"
gh repo create <owner>/<content-repo> --private --description "AgentCMS content"
```

Otherwise send the user to https://github.com/new (once per repository) and ask for the owner and the names.

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

Then they store it themselves: `! npx -y @agent-cms/agentcms@0.3.7 credentials set github:<login>` and paste it at the hidden prompt.

**Option B - reuse the GitHub CLI login** (broader `repo` scope, quickest):

```bash
npx -y @agent-cms/agentcms@0.3.7 credentials set github:<login> --from-gh --json
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
