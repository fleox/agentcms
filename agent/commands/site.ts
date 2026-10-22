import { installBrowserEnv } from "../browserEnv";
import { CliError, printResult } from "../output";
import { adminUrlOf } from "../remote";
import { getSite, listSites, putSite, removeSite, renameSite, resolveSite, setDefaultSite, validateAlias } from "../sites";
import type { Command } from "./types";

export const siteCommand: Command = {
  name: "site",
  summary:
    "Manage the registry of sites this computer drives: list, show, use <alias> (default), rename <from> <to>, forget <alias> (local only — nothing is deleted online), add <alias> --admin-url <url> (register an existing site).",
  usage: "site <list|show|use|rename|forget|add> [args] [--site <alias>] [--admin-url <url>] [--site-url <url>] [--data-credential <account>] [--hosting-credential <account>]",
  options: [
    { name: "site", type: "string", description: "Site alias (show)." },
    { name: "admin-url", type: "string", description: "add: URL of the hosted admin, e.g. https://example.com/admin/." },
    { name: "site-url", type: "string", description: "add: public site URL when it isn't the admin's parent folder." },
    { name: "data-credential", type: "string", description: "add: account of the content repo token (Markdown in git)." },
    { name: "hosting-credential", type: "string", description: "add: account used to write to the hosting." },
  ],
  async run({ io, options, positionals }) {
    const [action = "list", a, b] = positionals;
    switch (action) {
      case "list": {
        const { default: def, sites } = listSites();
        const rows = sites.map((s) => ({
          alias: s.alias,
          default: s.alias === def,
          siteUrl: s.siteUrl,
          adminUrl: adminUrlOf(s),
          backend: s.runtime.backend,
          hosting: s.hosting.connectorId || null,
          adminVersion: s.adminVersion ?? null,
        }));
        printResult(io, { default: def, sites: rows }, () =>
          rows.length
            ? rows.map((r) => `${r.default ? "*" : " "} ${r.alias.padEnd(20)} ${r.siteUrl}  [${r.backend} → ${r.hosting ?? "?"}]`).join("\n")
            : "No site registered. Install one with `agentcms install` or register one with `agentcms site add`.",
        );
        return;
      }
      case "show": {
        const site = resolveSite(a ?? (options.site as string | undefined));
        printResult(io, { ...site, adminUrl: adminUrlOf(site) }, () => JSON.stringify(site, null, 2));
        return;
      }
      case "use": {
        if (!a) throw new CliError("usage", "site use needs an alias.", undefined, 2);
        setDefaultSite(a);
        printResult(io, { default: a }, () => `Default site: ${a}`);
        return;
      }
      case "rename": {
        if (!a || !b) throw new CliError("usage", "site rename needs <from> <to>.", undefined, 2);
        renameSite(a, b);
        printResult(io, { from: a, to: b }, () => `Renamed ${a} → ${b}`);
        return;
      }
      case "forget": {
        if (!a) throw new CliError("usage", "site forget needs an alias.", undefined, 2);
        const removed = removeSite(a);
        printResult(io, { alias: a, removed }, () => (removed ? `Forgot ${a} (nothing was deleted online).` : `${a} was not registered.`));
        return;
      }
      case "add": {
        if (!a) throw new CliError("usage", "site add needs an alias.", undefined, 2);
        validateAlias(a);
        if (getSite(a)) throw new CliError("site-exists", `A site named "${a}" already exists.`, "Pick another alias or `site forget` it first.");
        if (typeof options["admin-url"] !== "string") throw new CliError("usage", "site add needs --admin-url.", undefined, 2);
        installBrowserEnv();
        const { siteFromAdminUrl } = await import("../ops/siteAdd");
        const site = await siteFromAdminUrl({
          alias: a,
          adminUrl: options["admin-url"],
          siteUrl: options["site-url"] as string | undefined,
          dataCredential: options["data-credential"] as string | undefined,
          hostingCredential: options["hosting-credential"] as string | undefined,
        });
        putSite(site);
        printResult(io, site, () => `Registered ${a}: ${site.siteUrl} [${site.runtime.backend} → ${site.hosting.connectorId || "unknown hosting"}]`);
        return;
      }
      default:
        throw new CliError("usage", `Unknown action "${action}".`, "Use list, show, use, rename, forget or add.", 2);
    }
  },
};
