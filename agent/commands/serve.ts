import { createReadStream, existsSync, statSync } from "node:fs";
import { createServer, type Server } from "node:http";
import { extname, join, normalize, sep } from "node:path";
import { CliError, printResult } from "../output";
import { distRoot } from "../paths";
import type { Command } from "./types";

// Serves the built admin on this machine (127.0.0.1 only) so a user can
// run the setup wizard without cloning or building the repo. The wizard
// can then copy the admin onto the chosen hosting.

const MIME: Record<string, string> = {
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
  ".zip": "application/zip",
};

// Files that must never be cached: they change per install / per build.
const NO_CACHE = new Set(["/index.html", "/config.js", "/admin-files.json", "/external.default.json"]);

export function resolveRequestPath(root: string, url: string): string | null {
  let pathname: string;
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

export function startAdminServer(root: string, host: string, port: number): Promise<Server> {
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
      "x-content-type-options": "nosniff",
    });
    if (req.method === "HEAD") res.end();
    else createReadStream(file).pipe(res);
  });
  return new Promise((resolve, reject) => {
    server.once("error", reject);
    server.listen(port, host, () => {
      server.off("error", reject);
      resolve(server);
    });
  });
}

const MAX_PORT_TRIES = 20;

export const serveCommand: Command = {
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
      throw new CliError("usage", `Invalid port: ${options.port}`, undefined, 2);
    }
    const host = "127.0.0.1";
    let server: Server | null = null;
    let port = first;
    for (; port < first + MAX_PORT_TRIES && port <= 65535; port++) {
      try {
        server = await startAdminServer(root, host, port);
        break;
      } catch (e) {
        if ((e as NodeJS.ErrnoException).code !== "EADDRINUSE") throw e;
      }
    }
    if (!server) throw new CliError("port-busy", `Ports ${first}-${port - 1} are all in use.`, "Pass --port <n>.");
    const url = `http://localhost:${port}/`;
    printResult(io, { url, root }, () => `Admin running at ${url}\nPress Ctrl+C to stop.`);
    await new Promise<void>((resolve) => {
      const stop = () => server!.close(() => resolve());
      process.once("SIGINT", stop);
      process.once("SIGTERM", stop);
    });
  },
};
