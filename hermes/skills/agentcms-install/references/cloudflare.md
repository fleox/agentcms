# Cloudflare Pages (from a GitHub repository)

AgentCMS commits the site into a GitHub repository; Cloudflare Pages deploys it on every commit.

1. Set up the GitHub site repository and token exactly as in [github.md](github.md) (the repository can stay private - Cloudflare reads it through its GitHub app).
2. The user connects it once in the Cloudflare dashboard: Workers & Pages -> Create -> Pages -> **Connect to Git** -> pick the repository -> Framework preset: None, Build command: *(empty)*, Build output directory: `/` -> Save and Deploy.
   The repository must have a commit first, or Cloudflare has no branch to offer: run `install` before this step (with `siteUrl` = `https://<repo name>.pages.dev`, the default project name), then send the user to Cloudflare.
3. Right after, the user turns off preview deployments: project -> Settings -> Builds & deployments -> Branch control -> Preview branches: **None**. Otherwise every other branch is deployed too, including `agentcms-data` (the SQLite file would be served on a preview URL, and every save would start a build).
4. Site URL: `https://<project>.pages.dev`, or the custom domain added under the project's Custom domains. If the project name differs from the plan, `settings set --base-url <URL>` then `regenerate everything`.

Cloudflare Pages redirects `page.html` to `page` (308). Links and pages keep working; nothing to do.

Every command that writes is one commit, and Cloudflare builds commits one after the other: after a burst of commands the live site can lag several minutes (check `doctor`'s `deployment`). Database saves on `agentcms-data` are committed with `[skip ci]` so they don't queue builds; group content changes into fewer commands (`content publish a b c`, `media upload --data`).

Plan fragment:

```json
"hosting": { "type": "cloudflare-pages", "settings": { "owner": "<owner>", "repo": "<site-repo>", "branch": "main", "siteUrl": "https://<project>.pages.dev" } }
```

`wrangler` can't link a Git repository, so step 2 stays manual; give the user the exact clicks.
