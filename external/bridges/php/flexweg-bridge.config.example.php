<?php
// Copy to flexweg-bridge.config.php (same folder as flexweg-bridge.php)
// and fill in. Keep this file out of version control.
return [
    // 32+ random characters, e.g. the output of: openssl rand -hex 24
    'API_KEY' => 'change-me',

    // Folder your site is served from. Defaults to the parent of the
    // bridge folder (bridge in /public_html/cms-bridge/ → /public_html).
    // 'SITE_ROOT' => '/home/user/public_html',

    // Origin(s) of the CMS admin. Leave empty to accept any origin.
    // 'ALLOWED_ORIGINS' => ['https://admin.example.com'],

    // 'MAX_UPLOAD_BYTES' => 50 * 1024 * 1024,
];
