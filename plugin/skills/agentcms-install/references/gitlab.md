# GitLab - content repo, GitLab Pages hosting, token

- Projects: one private project for content (Markdown backend), one for the site (GitLab Pages). Create them on https://gitlab.com/projects/new, or with `glab repo create <group>/<name> --private` / `--public` when `glab` is installed and signed in.
- Token: project access token (Settings -> Access tokens) or personal token (Preferences -> Access tokens) with scope **`api`** and role **Developer** or higher on both projects. The user stores it: `! npx -y @agent-cms/agentcms@0.2.0 credentials set gitlab:<name>`.
- GitLab Pages needs the site in a folder: AgentCMS publishes into `public/` and commits a minimal `.gitlab-ci.yml` with the first publish.
- Site URL: `https://<group>.gitlab.io/<project>` (or the custom domain from Deploy -> Pages).

Plan fragments:

```json
"data": { "backend": "markdown-git", "git": { "provider": "gitlab", "project": "<group>/<content-project>", "branch": "main" }, "credential": "gitlab:<name>" },
"hosting": { "type": "gitlab-pages", "settings": { "project": "<group>/<site-project>", "branch": "main", "siteUrl": "https://<group>.gitlab.io/<site-project>" } }
```

Self-managed GitLab: add `"apiBaseUrl": "https://gitlab.example.com/api/v4"` to both `git` and `hosting.settings`.
