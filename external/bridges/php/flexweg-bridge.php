<?php
/**
 * Flexweg CMS — self-hosted publish bridge.
 *
 * One file that implements the Flexweg Files API contract over the local
 * filesystem, so any PHP host (shared hosting, VPS, NAS…) can be a
 * publish target for the CMS admin. The admin runs in the browser and
 * can't speak FTP / SFTP; it talks to this script over HTTPS instead.
 *
 * Install:
 *   1. Create a folder next to your site files, e.g. /cms-bridge/, and
 *      upload this file into it.
 *   2. Copy flexweg-bridge.config.example.php to
 *      flexweg-bridge.config.php in the same folder and set API_KEY
 *      (32+ random characters) and, if needed, SITE_ROOT / ALLOWED_ORIGINS.
 *   3. In the CMS: publish target "Self-hosted (PHP bridge)", API URL =
 *      https://your-site.tld/cms-bridge/flexweg-bridge.php
 *
 * Security model:
 *   - Every request needs the X-API-Key header (constant-time compare).
 *   - Writes are confined to SITE_ROOT, never inside the bridge folder.
 *   - Server-executable files (.php, .phtml, .htaccess, .user.ini, CGI
 *     scripts…) are refused, so a leaked key can deface the static site
 *     but can't run code on the server.
 *   - Serve it over HTTPS only.
 *
 * Requires PHP 7.4+.
 */

declare(strict_types=1);

// ─── Configuration ───────────────────────────────────────────────────────

$config = [
    // Shared secret entered in the CMS. REQUIRED.
    'API_KEY' => '',
    // Folder the site is served from. Default: parent of the bridge folder.
    'SITE_ROOT' => dirname(__DIR__),
    // Origins allowed to call the bridge (the admin's origin), e.g.
    // ['https://admin.example.com', 'http://localhost:5173']. Empty = any
    // origin (the API key is still required).
    'ALLOWED_ORIGINS' => [],
    // Max decoded upload size in bytes.
    'MAX_UPLOAD_BYTES' => 50 * 1024 * 1024,
];
$configFile = __DIR__ . '/flexweg-bridge.config.php';
if (is_file($configFile)) {
    $overrides = require $configFile;
    if (is_array($overrides)) $config = array_merge($config, $overrides);
}

const FORBIDDEN_EXTENSIONS = [
    'php', 'php3', 'php4', 'php5', 'php7', 'php8', 'phtml', 'pht', 'phar', 'phps',
    'cgi', 'pl', 'py', 'rb', 'sh', 'bash', 'asp', 'aspx', 'jsp', 'shtml', 'htaccess', 'htpasswd',
];
const FORBIDDEN_NAMES = ['.htaccess', '.htpasswd', '.user.ini', 'php.ini', 'web.config'];

// ─── HTTP helpers ────────────────────────────────────────────────────────

function respond(int $status, $payload): void
{
    http_response_code($status);
    if (is_string($payload)) {
        header('Content-Type: text/plain; charset=utf-8');
        echo $payload;
    } else {
        header('Content-Type: application/json; charset=utf-8');
        echo json_encode($payload, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);
    }
    exit;
}

function fail(int $status, string $message): void
{
    respond($status, ['success' => false, 'error' => $message]);
}

function cors(array $config): void
{
    $origin = $_SERVER['HTTP_ORIGIN'] ?? '';
    $allowed = $config['ALLOWED_ORIGINS'];
    if ($origin !== '' && (count($allowed) === 0 || in_array($origin, $allowed, true))) {
        header('Access-Control-Allow-Origin: ' . $origin);
        header('Vary: Origin');
    }
    header('Access-Control-Allow-Methods: GET, POST, DELETE, OPTIONS');
    header('Access-Control-Allow-Headers: X-API-Key, Content-Type');
    header('Access-Control-Max-Age: 86400');
}

function route(): string
{
    if (!empty($_SERVER['PATH_INFO'])) return rtrim($_SERVER['PATH_INFO'], '/');
    // Hosts without PATH_INFO (some nginx setups): find "/files/…" in the URI.
    $uri = parse_url($_SERVER['REQUEST_URI'] ?? '', PHP_URL_PATH) ?: '';
    $pos = strpos($uri, '/files/');
    return $pos === false ? '' : rtrim(substr($uri, $pos), '/');
}

function body(): array
{
    $raw = file_get_contents('php://input');
    $data = json_decode($raw === false ? '' : $raw, true);
    return is_array($data) ? $data : [];
}

// ─── Path safety ─────────────────────────────────────────────────────────

/** Normalises a client path ("a/b.html") or fails. Never returns "..". */
function clean_path(string $path): string
{
    if (strpos($path, "\0") !== false || strpos($path, '\\') !== false) fail(400, 'Invalid path.');
    $parts = [];
    foreach (explode('/', $path) as $seg) {
        if ($seg === '' || $seg === '.') continue;
        if ($seg === '..') fail(400, 'Invalid path.');
        $parts[] = $seg;
    }
    if (count($parts) === 0) fail(400, 'Empty path.');
    return implode('/', $parts);
}

function site_root(array $config): string
{
    $root = realpath($config['SITE_ROOT']);
    if ($root === false || !is_dir($root)) fail(500, 'SITE_ROOT does not exist.');
    return $root;
}

function bridge_dir(): string
{
    return realpath(__DIR__) ?: __DIR__;
}

function is_inside(string $path, string $dir): bool
{
    return $path === $dir || strpos($path, $dir . DIRECTORY_SEPARATOR) === 0;
}

/** Absolute target for a client path, refusing anything outside SITE_ROOT or inside the bridge. */
function target(array $config, string $path): string
{
    $root = site_root($config);
    $abs = $root . DIRECTORY_SEPARATOR . str_replace('/', DIRECTORY_SEPARATOR, clean_path($path));
    // Resolve the deepest existing ancestor to defeat symlink escapes.
    $probe = $abs;
    while (!file_exists($probe) && $probe !== dirname($probe)) $probe = dirname($probe);
    $real = realpath($probe);
    if ($real === false || !is_inside($real, $root)) fail(403, 'Path outside the site root.');
    if (is_inside($abs, bridge_dir()) || ($real !== $root && is_inside($real, bridge_dir()))) {
        fail(403, 'The bridge folder is not accessible through the API.');
    }
    return $abs;
}

function assert_writable_name(string $abs): void
{
    $name = strtolower(basename($abs));
    $ext = strtolower(pathinfo($name, PATHINFO_EXTENSION));
    if (in_array($name, FORBIDDEN_NAMES, true) || in_array($ext, FORBIDDEN_EXTENSIONS, true)) {
        fail(403, 'This file type is not allowed.');
    }
    // "x.php.html" style double extensions some servers still execute.
    foreach (explode('.', $name) as $i => $piece) {
        if ($i > 0 && in_array($piece, FORBIDDEN_EXTENSIONS, true)) fail(403, 'This file type is not allowed.');
    }
}

function rrmdir(string $dir): void
{
    $it = new RecursiveIteratorIterator(
        new RecursiveDirectoryIterator($dir, FilesystemIterator::SKIP_DOTS),
        RecursiveIteratorIterator::CHILD_FIRST
    );
    foreach ($it as $file) {
        $file->isDir() && !$file->isLink() ? rmdir($file->getPathname()) : unlink($file->getPathname());
    }
    rmdir($dir);
}

function rel(string $root, string $abs): string
{
    return str_replace(DIRECTORY_SEPARATOR, '/', ltrim(substr($abs, strlen($root)), DIRECTORY_SEPARATOR));
}

// ─── Request handling ────────────────────────────────────────────────────

cors($config);
if (($_SERVER['REQUEST_METHOD'] ?? '') === 'OPTIONS') {
    http_response_code(204);
    exit;
}

$key = (string) $config['API_KEY'];
if (strlen($key) < 16) fail(500, 'Bridge not configured: set API_KEY (16+ characters).');
if (!hash_equals($key, (string) ($_SERVER['HTTP_X_API_KEY'] ?? ''))) fail(401, 'Invalid API key.');

$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';
$route = route();

switch ("$method $route") {
    case 'POST /files/upload': {
        $b = body();
        $abs = target($config, (string) ($b['path'] ?? ''));
        assert_writable_name($abs);
        $content = (string) ($b['content'] ?? '');
        if (($b['encoding'] ?? 'utf-8') === 'base64') {
            $content = base64_decode($content, true);
            if ($content === false) fail(400, 'Invalid base64 content.');
        }
        if (strlen($content) > (int) $config['MAX_UPLOAD_BYTES']) fail(413, 'File too large.');
        if (!is_dir(dirname($abs)) && !mkdir(dirname($abs), 0755, true)) fail(500, 'Could not create folder.');
        // Write-then-rename so readers never see a half-written file.
        $tmp = $abs . '.tmp-' . bin2hex(random_bytes(4));
        if (file_put_contents($tmp, $content, LOCK_EX) === false || !rename($tmp, $abs)) {
            @unlink($tmp);
            fail(500, 'Write failed.');
        }
        respond(200, ['success' => true, 'path' => clean_path((string) $b['path'])]);
    }

    case 'GET /files/get': {
        $abs = target($config, (string) ($_GET['path'] ?? ''));
        if (!is_file($abs)) fail(404, 'File not found.');
        header('Cache-Control: no-store');
        respond(200, (string) file_get_contents($abs));
    }

    case 'DELETE /files/delete': {
        $abs = target($config, (string) ($_GET['path'] ?? ''));
        if (!is_file($abs)) fail(404, 'File not found.');
        if (!unlink($abs)) fail(500, 'Delete failed.');
        respond(200, ['success' => true]);
    }

    case 'DELETE /files/delete-folder': {
        $abs = target($config, (string) ($_GET['path'] ?? ''));
        if ($abs === site_root($config)) fail(403, 'Refusing to delete the site root.');
        if (!is_dir($abs)) fail(404, 'Folder not found.');
        rrmdir($abs);
        respond(200, ['success' => true]);
    }

    case 'POST /files/create-folder': {
        $abs = target($config, (string) (body()['path'] ?? ''));
        if (!is_dir($abs) && !mkdir($abs, 0755, true)) fail(500, 'Could not create folder.');
        respond(200, ['success' => true]);
    }

    case 'POST /files/rename':
    case 'POST /files/rename-folder': {
        $b = body();
        $from = target($config, (string) ($b['old_path'] ?? ''));
        $to = target($config, (string) ($b['new_path'] ?? ''));
        if (!file_exists($from)) fail(404, 'Source not found.');
        if (is_file($from)) assert_writable_name($to);
        if (!is_dir(dirname($to)) && !mkdir(dirname($to), 0755, true)) fail(500, 'Could not create folder.');
        if (!rename($from, $to)) fail(500, 'Rename failed.');
        respond(200, ['success' => true]);
    }

    case 'GET /files/list': {
        $root = site_root($config);
        $bridge = bridge_dir();
        $page = max(1, (int) ($_GET['page'] ?? 1));
        $perPage = min(1000, max(1, (int) ($_GET['per_page'] ?? 100)));
        $items = [];
        $it = new RecursiveIteratorIterator(
            new RecursiveCallbackFilterIterator(
                new RecursiveDirectoryIterator($root, FilesystemIterator::SKIP_DOTS),
                function ($file) use ($bridge) {
                    $name = $file->getFilename();
                    return $name[0] !== '.' && !is_inside($file->getPathname(), $bridge);
                }
            ),
            RecursiveIteratorIterator::SELF_FIRST
        );
        foreach ($it as $file) {
            $items[] = [
                'path' => rel($root, $file->getPathname()),
                'type' => $file->isDir() ? 'folder' : 'file',
                'size' => $file->isDir() ? 0 : $file->getSize(),
            ];
        }
        usort($items, function ($a, $b) { return strcmp($a['path'], $b['path']); });
        respond(200, [
            'items' => array_slice($items, ($page - 1) * $perPage, $perPage),
            'page' => $page,
            'per_page' => $perPage,
            'total' => count($items),
        ]);
    }

    default:
        fail(404, 'Unknown endpoint.');
}
