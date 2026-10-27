import { existsSync, readFileSync } from "node:fs";
import { extname } from "node:path";
import { CliError } from "../output";
import type { Command, CommandContext } from "./types";

// `agentcms files` — the site's files on the hosting, through the same
// storage facade as the admin (paths are relative to the site's folder,
// e.g. "google1234.html", "old-category/index.html"). For what the CMS
// doesn't generate itself: a search-engine verification file, a stray
// file left by an older version… Generated files are better changed
// through their command (content, regenerate…): the next regeneration
// rewrites them anyway.

const TEXT = new Set([".html", ".htm", ".css", ".js", ".mjs", ".json", ".xml", ".txt", ".svg", ".md", ".webmanifest", ".xsl", ".csv"]);

// Files the CMS owns: deleting them breaks the site or the admin.
const PROTECTED = [/^admin(\/|$)/, /^theme-assets\//, /^data\/(menu|posts|authors|products)\.json$/, /\.sqlite$/, /(^|\/)config\.js$/];

function cleanPath(raw: string): string {
  const p = raw.replace(/^\/+/, "");
  if (!p || p.split("/").some((seg) => seg === ".." || seg === ".")) throw new CliError("usage", `Invalid path "${raw}".`, "Use a path relative to the site, e.g. robots.txt or old/index.html.", 2);
  return p;
}

async function run({ io, options, positionals }: CommandContext): Promise<number | void> {
  const [action, a, b] = positionals;
  const alias = options.site as string | undefined;
  const { runAdmin, confirmOrPlan } = await import("../ops/adminCommon");
  switch (action) {
    case "list":
      return runAdmin(io, alias, { hosting: true }, async () => {
        const files = await import("../../src/services/siteFiles");
        const caps = await files.getStorageCapabilities();
        if (!caps.list) throw new CliError("unsupported", `The ${caps.connectorId} hosting can't list its files.`);
        const prefix = a ? cleanPath(a) : "";
        const out: Array<{ path: string; size: number | null }> = [];
        for (let page = 1; page < 200; page++) {
          const res = await files.listFiles(page, 500);
          for (const it of res.items) if (it.type === "file" && it.path.startsWith(prefix)) out.push({ path: it.path, size: it.size ?? null });
          if (res.items.length < res.per_page || (res.total !== undefined && page * res.per_page >= res.total)) break;
        }
        return { prefix, count: out.length, files: out };
      }, (r) => (r.count ? r.files.map((f) => `${f.path}${f.size != null ? `  ${f.size} B` : ""}`).join("\n") : "No files."));

    case "put": {
      if (!a) throw new CliError("usage", "files put needs a local file (and optionally the path on the site).", "e.g. agentcms files put ./google1234.html", 2);
      if (!existsSync(a)) throw new CliError("not-found", `${a} does not exist.`, undefined, 2);
      const target = cleanPath(b ?? a.split("/").pop()!);
      if (PROTECTED.some((re) => re.test(target))) throw new CliError("protected", `${target} is managed by the CMS.`, "Change it through its command (deploy-admin, themes, regenerate…).", 2);
      return runAdmin(io, alias, { write: true, hosting: true, lock: true }, async () => {
        const files = await import("../../src/services/siteFiles");
        const bytes = readFileSync(a);
        const text = TEXT.has(extname(target).toLowerCase());
        await files.withStorageBatch(() =>
          files.uploadFile(text ? { path: target, content: bytes.toString("utf8") } : { path: target, content: bytes.toString("base64"), encoding: "base64" }),
        );
        return { path: target, bytes: bytes.length, url: await files.publicUrlFor(target) };
      }, (r) => `Uploaded ${r.path} (${r.bytes} B) → ${r.url}`);
    }

    case "delete": {
      const paths = positionals.slice(1).map(cleanPath);
      if (!paths.length) throw new CliError("usage", "files delete needs one or more paths.", undefined, 2);
      const blocked = paths.filter((p) => PROTECTED.some((re) => re.test(p)));
      if (blocked.length) throw new CliError("protected", `${blocked.join(", ")}: managed by the CMS.`, "Use the matching command instead (unpublish content, deploy-admin…).", 2);
      if (!(await confirmOrPlan(io, !!options.yes, { delete: paths }, () => `Would delete ${paths.join(", ")} from the site.`))) return;
      return runAdmin(io, alias, { write: true, hosting: true, lock: true }, async () => {
        const files = await import("../../src/services/siteFiles");
        await files.withStorageBatch(async () => {
          for (const p of paths) await files.deleteFile(p);
        });
        return { deleted: paths };
      }, (r) => `Deleted ${r.deleted.join(", ")}.`);
    }

    default:
      throw new CliError("usage", action ? `Unknown files action "${action}".` : "files needs an action.", "Actions: list [prefix], put <local file> [site path], delete <path…> --yes.", 2);
  }
}

export const filesCommand: Command = {
  name: "files",
  summary:
    "Files on the hosting, relative to the site's folder: list [prefix], put <local file> [site path] (e.g. a search-engine verification file), delete <path…> (plan first, --yes; e.g. a stray old page). The CMS's own files (admin, theme assets, data/*.json, database) are protected — use their commands.",
  usage: "files <list|put|delete> [args] --site <alias> [--yes]",
  options: [
    { name: "site", type: "string", description: "Site alias." },
    { name: "yes", type: "boolean", description: "delete: apply (otherwise only the plan)." },
  ],
  run,
};
