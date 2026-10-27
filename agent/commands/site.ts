import { tmpdir } from "node:os";
import { join } from "node:path";
import { installBrowserEnv } from "../browserEnv";
import { CliError, printResult } from "../output";
import { adminUrlOf, publicUrlOf, secureAdminUrlOf } from "../remote";
import { getSite, listSites, putSite, removeSite, renameSite, resolveSite, setDefaultSite, validateAlias } from "../sites";
import type { Command } from "./types";

export const siteCommand: Command = {
  name: "site",
  summary:
    "Manage the registry of sites this computer drives: list, show, use <alias> (default), rename <from> <to>, forget <alias> (local only — nothing is deleted online), add <alias> --admin-url <url> (register an existing site), screenshot [path…] (PNG captures of the live public site, desktop + mobile; default: the home page).",
  usage: "site <list|show|use|rename|forget|add|screenshot> [args] [--site <alias>] [--admin-url <url>] [--site-url <url>] [--data-credential <account>] [--hosting-credential <account>] [--passphrase-credential <account>]",
  options: [
    { name: "site", type: "string", description: "Site alias (show, screenshot)." },
    { name: "out", type: "string", description: "screenshot: folder for the PNGs (default: <system temp>/agentcms-screenshots/<alias>; absolute paths in the result)." },
    { name: "screenshot-js", type: "string", description: "screenshot: JavaScript run in each page before the capture (await allowed), e.g. 'document.querySelector(\"[data-cms-search]\")?.click()'." },
    { name: "max-height", type: "string", description: "screenshot: cap each capture's height in CSS px (default: the whole page, up to 6000). Use the viewport height (800 desktop / 844 mobile) for above-the-fold only." },
    { name: "admin-url", type: "string", description: "add: URL of the hosted admin, e.g. https://example.com/admin/." },
    { name: "site-url", type: "string", description: "add: public site URL when it isn't the admin's parent folder." },
    { name: "data-credential", type: "string", description: "add: account of the content repo token (Markdown in git) or of the SQLite data location." },
    { name: "hosting-credential", type: "string", description: "add: account used to write to the hosting." },
    { name: "passphrase-credential", type: "string", description: "add: passphrase account of an encrypted SQLite database." },
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
          publicUrl: publicUrlOf(s),
          adminUrl: secureAdminUrlOf(s) ?? adminUrlOf(s),
          backend: s.runtime.backend,
          hosting: s.hosting.connectorId || null,
          adminVersion: s.adminVersion ?? null,
        }));
        printResult(io, { default: def, sites: rows }, () =>
          rows.length
            ? rows.map((r) => `${r.default ? "*" : " "} ${r.alias.padEnd(20)} ${r.publicUrl}  [${r.backend} → ${r.hosting ?? "?"}]`).join("\n")
            : "No site registered. Install one with `agentcms install` or register one with `agentcms site add`.",
        );
        return;
      }
      case "show": {
        const site = resolveSite(a ?? (options.site as string | undefined));
        printResult(io, { ...site, publicUrl: publicUrlOf(site), adminUrl: secureAdminUrlOf(site) ?? adminUrlOf(site) }, () => JSON.stringify(site, null, 2));
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
          passphraseCredential: options["passphrase-credential"] as string | undefined,
        });
        putSite(site);
        printResult(io, site, () => `Registered ${a}: ${site.siteUrl} [${site.runtime.backend} → ${site.hosting.connectorId || "unknown hosting"}]`);
        return;
      }
      case "screenshot": {
        const site = resolveSite(options.site as string | undefined);
        const paths = positionals.slice(1);
        const pages: Record<string, string> = {};
        for (const raw of paths.length ? paths : [""]) {
          const path = raw.replace(/^https?:\/\/[^/]+\/?/, "").replace(/^\/+/, "");
          const label = path.replace(/\.html?$/, "").replace(/[^a-z0-9-]+/gi, "_").replace(/^_+|_+$/g, "") || "home";
          pages[label] = path;
        }
        const { resolve } = await import("node:path");
        const { screenshotPages } = await import("../ops/extScreenshot");
        // Default: the system temp folder, never the user's project.
        const outDir = resolve(String(options.out ?? join(tmpdir(), "agentcms-screenshots", site.alias)));
        const base = publicUrlOf(site);
        // Empty paths are the site root ("<base>/").
        const r = await screenshotPages(base, Object.fromEntries(Object.entries(pages).map(([k, v]) => [k, v || "./"])) as Record<string, string>, outDir, options["screenshot-js"] as string | undefined, options["max-height"] ? Number(options["max-height"]) : undefined);
        if (!r.browser) throw new CliError("no-browser", "No Chrome / Chromium / Edge found for screenshots.", "Install Google Chrome, or set CHROME_PATH.");
        printResult(io, { site: site.alias, publicUrl: base, ...r }, () =>
          [...r.shots.map((s) => `${s.page} (${s.viewport}): ${s.file}`), ...r.errors.map((e) => `  error: ${e}`)].join("\n"),
        );
        return r.errors.length ? 1 : 0;
      }
      default:
        throw new CliError("usage", `Unknown action "${action}".`, "Use list, show, use, rename, forget, add or screenshot.", 2);
    }
  },
};
