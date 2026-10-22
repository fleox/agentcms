# Own server (PHP bridge)

Browsers can't speak FTP/SFTP, so a small PHP script on the server receives the files: `external/bridges/php/flexweg-bridge.php` in the AgentCMS repository. Any PHP 7.4+ host works.

1. Create the bridge config with a fresh random key and store the same key as a credential, in ONE shell command so the key is never displayed:
   ```bash
   KEY=$(openssl rand -hex 24) && \
   printf "<?php\nreturn ['API_KEY' => '%s'];\n" "$KEY" > flexweg-bridge.config.php && \
   KEY="$KEY" npx -y agentcms@0.1.0 credentials set php-bridge:<name> --from-env KEY --json
   ```
   Optional keys in that file: `SITE_ROOT` (folder the site is written into, default: the parent of the bridge folder) and `ALLOWED_ORIGINS`.
2. Download the bridge next to it:
   ```bash
   curl -fsSLO https://raw.githubusercontent.com/fleox/agentcms/v0.1.0/external/bridges/php/flexweg-bridge.php
   ```
3. Upload both files into a folder of the web root, e.g. `/cms-bridge/`. If the user has SSH/SFTP access configured, offer `scp` / `sftp` / `lftp`; otherwise they use their FTP client. Delete the local config file afterwards (it holds the key).

The bridge refuses PHP / .htaccess uploads, stays inside `SITE_ROOT` and never writes into its own folder. Prefer HTTPS for the bridge URL.

Plan fragment:

```json
"hosting": { "type": "own-server", "settings": { "apiBaseUrl": "https://example.com/cms-bridge/flexweg-bridge.php", "siteUrl": "https://example.com" }, "credential": "php-bridge:<name>" }
```
