# Cloudflare Pages (from a GitHub repository)

AgentCMS commits the site into a GitHub repository; Cloudflare Pages deploys it on every commit.

1. Set up the GitHub site repository and token exactly as in [github.md](github.md) (the repository can stay private - Cloudflare reads it through its GitHub app).
2. The user connects it once in the Cloudflare dashboard: Workers & Pages -> Create -> Pages -> **Connect to Git** -> pick the repository -> Framework preset: None, Build command: *(empty)*, Build output directory: `/` -> Save and Deploy.
3. Site URL: `https://<project>.pages.dev`, or the custom domain added under the project's Custom domains.

Plan fragment:

```json
"hosting": { "type": "cloudflare-pages", "settings": { "owner": "<owner>", "repo": "<site-repo>", "branch": "main", "siteUrl": "https://<project>.pages.dev" } }
```

`wrangler` can't link a Git repository, so step 2 stays manual; give the user the exact clicks.
