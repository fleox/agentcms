# Security policy

## Supported versions

Security fixes go into the latest release only. Update with `npx -y @agent-cms/agentcms@latest status`, then `deploy-admin --site <alias> --yes` for each hosted admin.

## Reporting a vulnerability

Please **do not open a public issue.** Report it privately through [GitHub's private vulnerability reporting](https://github.com/fleox/agentcms/security/advisories/new) and include:

- the affected version and the data backend / hosting involved
- the steps to reproduce, and what an attacker can achieve
- a proof of concept if you have one (no real credentials, please)

You will get an answer within a few days. Once a fix is released, the advisory is published with credit to you, unless you prefer to stay anonymous.

## Scope and design notes

AgentCMS has no server. The admin runs in the browser (or in the `agentcms` CLI), and the public site is static files. Useful context for a report:

- Hosting tokens, S3 keys and SQLite passphrases are kept in each editor's browser (`localStorage`) or in the CLI's `~/.agentcms/credentials.json` (mode `0600`). They are never written to `config.js`, the content repository or the SQLite file.
- A SQLite database served by a static host is public unless it is encrypted (AES-256-GCM, PBKDF2-SHA256 600k, the default) or stored in a separate private location.
- In Firebase mode, the security rules in [docs/firebase.md](docs/firebase.md) are what protect the data. The Firebase web config in `config.js` is public by design.
- In Firebase mode, the publish target's credentials are readable by any signed-in editor (a documented limitation for internal teams).
- Hiding the admin folder name only obscures it; it is not a security boundary.
