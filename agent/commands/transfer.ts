import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import type { ContentExport } from "../../src/services/contentTransfer";
import { CliError } from "../output";
import type { Command, CommandContext } from "./types";

// `agentcms transfer …` — Settings → Data backend → Export / Import:
// one JSON file with posts, pages, terms, media records, user profiles,
// settings, installed extensions and the publish target (secrets
// stripped; media binaries stay on the publish target). Import goes
// into a document-store site (Markdown in git, SQLite file) with ids
// preserved, in one write — and, like the admin, republishes nothing.

function readExport(file: string): ContentExport {
  const path = resolve(file);
  if (!existsSync(path)) throw new CliError("not-found", `${path} does not exist.`, undefined, 2);
  let data: unknown;
  try {
    data = JSON.parse(readFileSync(path, "utf8"));
  } catch (err) {
    throw new CliError("invalid-export", `${path} is not JSON: ${(err as Error).message}`, undefined, 2);
  }
  const ok = !!data && typeof data === "object" && (data as ContentExport).format === "agentcms-export" && (data as ContentExport).version === 1 && typeof (data as ContentExport).collections === "object";
  if (!ok) throw new CliError("invalid-export", `${path} is not an AgentCMS export.`, "Make one with `agentcms transfer export --out <file>` (or Settings → Data backend → Export).", 2);
  return data as ContentExport;
}

function counts(data: ContentExport): Record<string, number> {
  return Object.fromEntries(Object.entries(data.collections).map(([k, v]) => [k, Array.isArray(v) ? v.length : 0]));
}

// Leaves this site's own publish target alone (the file carries the
// source site's).
function withoutTarget(data: ContentExport): ContentExport {
  const config = (data.collections.config ?? []).filter((d) => d.id !== "storage");
  return { ...data, collections: { ...data.collections, config } };
}

async function run({ io, options, positionals }: CommandContext): Promise<number | void> {
  const [action, file] = positionals;
  const { runAdmin } = await import("../ops/adminCommon");
  const alias = options.site as string | undefined;

  switch (action) {
    case "export": {
      const out = resolve(String(options.out ?? file ?? `agentcms-export-${new Date().toISOString().slice(0, 10)}.json`));
      return runAdmin(io, alias, {}, async (s) => {
        const { exportContent } = await import("../../src/services/contentTransfer");
        const data = await exportContent();
        // No registry stored yet (the admin seeds it on first boot): export
        // the one the site actually runs — the hosted admin's defaults —
        // so an import elsewhere gets the same plugins and theme.
        if (!data.collections.config?.some((d) => d.id === "externalRegistry")) {
          const { fallbackRegistry, siteHostingReader } = await import("../ops/adminFiles");
          const registry = await fallbackRegistry(s.site, await siteHostingReader(s.site));
          if (registry.plugins.length || registry.themes.length) (data.collections.config ??= []).push({ ...registry, id: "externalRegistry" } as never);
        }
        mkdirSync(dirname(out), { recursive: true });
        const text = JSON.stringify(data, null, 2);
        writeFileSync(out, text);
        return { file: out, bytes: text.length, backend: data.backend, counts: counts(data), note: "Secrets (tokens, keys) are not in the file; media files stay on the publish target." };
      }, (r) => `Exported ${Object.entries(r.counts).map(([k, n]) => `${n} ${k}`).join(", ")} to ${r.file}`);
    }

    case "import": {
      if (!file) throw new CliError("usage", "transfer import needs the export file.", "agentcms transfer import <file.json> --mode merge|replace --site <alias>", 2);
      const mode = String(options.mode ?? "merge");
      if (mode !== "merge" && mode !== "replace") throw new CliError("usage", `--mode is merge or replace (got "${mode}").`, undefined, 2);
      const raw = readExport(file);
      const keepTarget = !!options["keep-target"];
      const data = keepTarget ? withoutTarget(raw) : raw;
      const next = (a: string) => `agentcms regenerate everything --site ${a}`;
      const check = async () => {
        const { canImportContent } = await import("../../src/services/contentTransfer");
        if (!canImportContent()) {
          throw new CliError("unsupported-backend", "Import only works on Markdown-in-git and SQLite-file sites.", "Firebase sites can be exported, not imported into.", 2);
        }
      };
      const targetWarning = async () => {
        const incoming = (data.collections.config ?? []).find((d) => d.id === "storage") as { connectorId?: string; settings?: Record<string, unknown> } | undefined;
        if (!incoming) return null;
        const { getStorageConfig } = await import("../../src/services/storageConfig");
        const current = await getStorageConfig().catch(() => null);
        const same = current && current.connectorId === incoming.connectorId && JSON.stringify(current.settings ?? {}) === JSON.stringify({ ...(current.settings ?? {}), ...(incoming.settings ?? {}) });
        return same ? null : `The file replaces this site's publish target with the exported one (${incoming.connectorId ?? "?"}). Pass --keep-target to keep the current one.`;
      };
      if (!options.yes) {
        return runAdmin(io, alias, {}, async (s) => {
          await check();
          const { getDocStore } = await import("../../src/services/docstore");
          const store = getDocStore();
          await store.ready();
          const current = Object.fromEntries(Object.keys(data.collections).map((c) => [c, store.list(c as Parameters<typeof store.list>[0]).length]));
          return {
            needsConfirmation: true,
            mode,
            from: { backend: data.backend, exportedAt: data.exportedAt },
            incoming: counts(data),
            current,
            warning: await targetWarning(),
            note:
              mode === "replace"
                ? "replace empties every collection present in the file first (posts, terms, media records, users, settings…) — documents not in the file are lost."
                : "merge overwrites documents with the same id and keeps the others.",
            next: next(s.site.alias),
          };
        }, (r) =>
          [
            `Would import (${r.mode}) ${Object.entries(r.incoming).map(([k, n]) => `${n} ${k}`).join(", ")} — this site has ${Object.entries(r.current).map(([k, n]) => `${n} ${k}`).join(", ")}.`,
            r.note,
            ...(r.warning ? [r.warning] : []),
            "Nothing changed — re-run with --yes once the user agrees.",
          ].join("\n"));
      }
      return runAdmin(io, alias, { write: true, lock: true }, async (s) => {
        await check();
        const warning = await targetWarning();
        const { importContent } = await import("../../src/services/contentTransfer");
        const imported = await importContent(data, mode);
        return {
          imported,
          mode,
          publishTargetReplaced: !!warning,
          note: "Nothing was republished: the public site still shows the previous content.",
          next: next(s.site.alias),
        };
      }, (r) => `Imported (${r.mode}) ${Object.entries(r.imported).map(([k, n]) => `${n} ${k}`).join(", ")}.\n${r.note} Next: ${r.next}`);
    }

    default:
      throw new CliError("usage", action ? `Unknown transfer action "${action}".` : "transfer needs an action.", "Actions: export, import.", 2);
  }
}

export const transferCommand: Command = {
  name: "transfer",
  summary:
    "Settings → Data backend → Export / Import: export (every backend → one JSON file, no secrets, no media files), import <file> --mode merge|replace (Markdown-in-git / SQLite-file sites, ids kept, one write; plan first, --yes; republishes nothing → then `regenerate everything`).",
  usage: "transfer <export|import> [<file>] --site <alias> [--out <file>] [--mode merge|replace] [--keep-target] [--yes]",
  options: [
    { name: "site", type: "string", description: "Site alias." },
    { name: "out", type: "string", description: "export: output file (default agentcms-export-<date>.json)." },
    { name: "mode", type: "string", description: "import: merge (same ids overwritten, others kept; default) or replace (collections in the file emptied first)." },
    { name: "keep-target", type: "boolean", description: "import: keep this site's publish target instead of the one in the file." },
    { name: "yes", type: "boolean", description: "import: apply (otherwise only the plan)." },
  ],
  run,
};
