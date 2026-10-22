#!/usr/bin/env node
import { parseArgs } from "node:util";
import { existsSync, readFileSync, statSync, createReadStream } from "node:fs";
import { join, resolve, dirname, sep, extname, normalize } from "node:path";
import { fileURLToPath } from "node:url";
import { createServer } from "node:http";
class CliError extends Error {
  constructor(code, message, hint, exitCode = 1) {
    super(message);
    this.code = code;
    this.hint = hint;
    this.exitCode = exitCode;
  }
}
function createIo(json) {
  return {
    json,
    out: (text) => process.stdout.write(text.endsWith("\n") ? text : text + "\n"),
    err: (text) => process.stderr.write(text.endsWith("\n") ? text : text + "\n")
  };
}
function printResult(io, data, human) {
  if (io.json) io.out(JSON.stringify({ ok: true, data }));
  else io.out(human());
}
function printError(io, error) {
  const e = error instanceof CliError ? error : new CliError("internal", error instanceof Error ? error.message : String(error));
  if (io.json) {
    io.out(JSON.stringify({ ok: false, error: { code: e.code, message: e.message, ...e.hint ? { hint: e.hint } : {} } }));
  } else {
    io.err(`Error: ${e.message}${e.hint ? `
Hint: ${e.hint}` : ""}`);
  }
  return e.exitCode;
}
function distRoot() {
  if (process.env.AGENTCMS_DIST) return resolve(process.env.AGENTCMS_DIST);
  const here = dirname(fileURLToPath(import.meta.url));
  const bundled = true;
  return bundled ? resolve(here, "..") : resolve(here, "..", "dist");
}
function readVersionInfo() {
  const file = join(distRoot(), "version.json");
  if (!existsSync(file)) {
    throw new Error(`${file} is missing — run \`npm run build\` first.`);
  }
  return JSON.parse(readFileSync(file, "utf8"));
}
const MIME = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".wasm": "application/wasm",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".gif": "image/gif",
  ".ico": "image/x-icon",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
  ".txt": "text/plain; charset=utf-8",
  ".zip": "application/zip"
};
const NO_CACHE = /* @__PURE__ */ new Set(["/index.html", "/config.js", "/admin-files.json", "/external.default.json"]);
function resolveRequestPath(root, url) {
  let pathname;
  try {
    pathname = decodeURIComponent(new URL(url, "http://localhost").pathname);
  } catch {
    return null;
  }
  if (pathname.endsWith("/")) pathname += "index.html";
  const file = normalize(join(root, pathname));
  if (file !== root && !file.startsWith(root.endsWith(sep) ? root : root + sep)) return null;
  return file;
}
function startAdminServer(root, host, port) {
  const server = createServer((req, res) => {
    if (req.method !== "GET" && req.method !== "HEAD") {
      res.writeHead(405).end();
      return;
    }
    const file = resolveRequestPath(root, req.url ?? "/");
    if (!file || !existsSync(file) || !statSync(file).isFile()) {
      res.writeHead(404, { "content-type": "text/plain; charset=utf-8" }).end("Not found");
      return;
    }
    const rel = "/" + file.slice(root.length).split(sep).filter(Boolean).join("/");
    res.writeHead(200, {
      "content-type": MIME[extname(file).toLowerCase()] ?? "application/octet-stream",
      "cache-control": NO_CACHE.has(rel) ? "no-store" : "no-cache",
      "x-content-type-options": "nosniff"
    });
    if (req.method === "HEAD") res.end();
    else createReadStream(file).pipe(res);
  });
  return new Promise((resolve2, reject) => {
    server.once("error", reject);
    server.listen(port, host, () => {
      server.off("error", reject);
      resolve2(server);
    });
  });
}
const MAX_PORT_TRIES = 20;
const serveCommand = {
  name: "serve",
  summary: "Serve the admin on this computer (127.0.0.1) to run the setup wizard or work locally. Runs until stopped.",
  usage: "serve [--port <n>]",
  options: [{ name: "port", type: "string", description: "First port to try (the next free one is used).", default: "4173" }],
  async run({ io, options }) {
    const root = join(distRoot(), "admin");
    if (!existsSync(join(root, "index.html"))) {
      throw new CliError("admin-missing", `No built admin in ${root}.`, "Run `npm run build` (from a clone) or use the npm package.");
    }
    const first = Number(options.port ?? 4173);
    if (!Number.isInteger(first) || first < 1 || first > 65535) {
      throw new CliError("usage", `Invalid port: ${options.port}`, void 0, 2);
    }
    const host = "127.0.0.1";
    let server = null;
    let port = first;
    for (; port < first + MAX_PORT_TRIES && port <= 65535; port++) {
      try {
        server = await startAdminServer(root, host, port);
        break;
      } catch (e) {
        if (e.code !== "EADDRINUSE") throw e;
      }
    }
    if (!server) throw new CliError("port-busy", `Ports ${first}-${port - 1} are all in use.`, "Pass --port <n>.");
    const url = `http://localhost:${port}/`;
    printResult(io, { url, root }, () => `Admin running at ${url}
Press Ctrl+C to stop.`);
    await new Promise((resolve2) => {
      const stop = () => server.close(() => resolve2());
      process.once("SIGINT", stop);
      process.once("SIGTERM", stop);
    });
  }
};
function parse(v) {
  const m = /^v?(\d+)\.(\d+)\.(\d+)(?:-([0-9A-Za-z.-]+))?/.exec(v.trim());
  if (!m) throw new Error(`Invalid version: ${v}`);
  return [Number(m[1]), Number(m[2]), Number(m[3]), m[4] ?? ""];
}
function compareVersions(a, b) {
  const pa = parse(a);
  const pb = parse(b);
  for (let i = 0; i < 3; i++) {
    if (pa[i] !== pb[i]) return pa[i] < pb[i] ? -1 : 1;
  }
  if (pa[3] === pb[3]) return 0;
  if (!pa[3]) return 1;
  if (!pb[3]) return -1;
  return pa[3] < pb[3] ? -1 : 1;
}
const REGISTRY_URL = "https://registry.npmjs.org/agentcms/latest";
async function fetchLatestVersion(fetchImpl = fetch) {
  try {
    const res = await fetchImpl(REGISTRY_URL, { signal: AbortSignal.timeout(5e3) });
    if (!res.ok) return null;
    const body = await res.json();
    return typeof body.version === "string" ? body.version : null;
  } catch {
    return null;
  }
}
const versionCommand = {
  name: "version",
  summary: "Show this tool's version, the admin API version and (with --check) whether a newer release exists.",
  usage: "version [--check]",
  options: [{ name: "check", type: "boolean", description: "Ask the npm registry for the latest release." }],
  async run({ io, options }) {
    const info = readVersionInfo();
    const data = { ...info };
    if (options.check) {
      const latest = await fetchLatestVersion();
      data.latest = latest;
      data.updateAvailable = latest ? compareVersions(latest, info.version) > 0 : null;
    }
    printResult(io, data, () => {
      const lines = [`agentcms ${info.version} (admin API ${info.apiVersion}, data schema ${info.dataSchema})`];
      if (options.check) {
        if (!data.latest) lines.push("Could not reach the npm registry to check for updates.");
        else if (data.updateAvailable) lines.push(`Update available: ${data.latest}`);
        else lines.push("This is the latest release.");
      }
      return lines.join("\n");
    });
  }
};
const helpCommand = {
  name: "help",
  summary: "List commands and their options (--json gives a machine-readable list).",
  usage: "help [<command>]",
  options: [],
  async run({ io, positionals }) {
    const wanted = positionals[0];
    const list = wanted ? COMMANDS.filter((c) => c.name === wanted) : COMMANDS;
    const { version } = readVersionInfo();
    const data = {
      name: "agentcms",
      version,
      globalOptions: GLOBAL_OPTIONS,
      commands: list.map(({ name, summary, usage, options }) => ({ name, summary, usage, options }))
    };
    printResult(
      io,
      data,
      () => [
        `agentcms ${version} — install and manage AgentCMS sites from a terminal or an AI agent.`,
        "",
        "Usage: agentcms <command> [options] [--json]",
        "",
        ...list.flatMap((c) => [
          `  ${c.usage}`,
          `      ${c.summary}`,
          ...c.options.map((o) => `      --${o.name}${o.type === "string" ? " <value>" : ""}  ${o.description}`)
        ]),
        "",
        "Global options:",
        ...GLOBAL_OPTIONS.map((o) => `  --${o.name}  ${o.description}`)
      ].join("\n")
    );
  }
};
const GLOBAL_OPTIONS = [
  { name: "json", type: "boolean", description: "Print one JSON object on stdout: { ok, data } or { ok: false, error }." }
];
const COMMANDS = [helpCommand, versionCommand, serveCommand];
function findCommand(name) {
  return COMMANDS.find((c) => c.name === name);
}
async function main(argv, io) {
  const json = argv.includes("--json");
  const out = createIo(json);
  try {
    const [name = "help", ...rest] = argv.filter((a) => a !== "--json");
    if (name === "--help" || name === "-h") return await run("help", rest, out) ?? 0;
    if (name === "--version" || name === "-v") return await run("version", rest, out) ?? 0;
    return await run(name, rest, out) ?? 0;
  } catch (error) {
    return printError(out, error);
  }
}
async function run(name, args, io) {
  const command = findCommand(name);
  if (!command) {
    throw new CliError(
      "unknown-command",
      `Unknown command "${name}".`,
      `Available: ${COMMANDS.map((c) => c.name).join(", ")}. Run \`agentcms help\`.`,
      2
    );
  }
  let parsed;
  try {
    parsed = parseArgs({
      args,
      allowPositionals: true,
      strict: true,
      options: Object.fromEntries(
        [...command.options, ...GLOBAL_OPTIONS].map((o) => [o.name, { type: o.type }])
      )
    });
  } catch (e) {
    throw new CliError("usage", e.message, `Usage: agentcms ${command.usage}`, 2);
  }
  return command.run({
    io,
    options: parsed.values,
    positionals: parsed.positionals
  });
}
const [major] = process.versions.node.split(".").map(Number);
if (major < 20) {
  process.stderr.write(`agentcms needs Node.js 20 or newer (found ${process.versions.node}).
`);
  process.exit(1);
}
main(process.argv.slice(2)).then((code) => {
  process.exitCode = code;
});
