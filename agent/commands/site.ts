import { tmpdir } from "node:os";
import { join } from "node:path";
import { installBrowserEnv } from "../browserEnv";
import { CliError, printResult } from "../output";
import { adminUrlOf, publicUrlOf, secureAdminUrlOf } from "../remote";
import { getSite, listSites, putSite, removeSite, renameSite, resolveSite, setDefaultSite, validateAlias } from "../sites";
import type { Command } from "./types";

// What the CLI will need to manage this site and isn't recorded.
function missingCredentials(site: import("../sites").SiteRecord): string[] {
  const out: string[] = [];
  const c = site.credentials;
  const set = `\`agentcms site credentials ${site.alias} --<role>-credential <account>\``;
  if (site.runtime.backend === "sqlite-file") {
    if (!c.data && !c.hosting) out.push(`No credential can open the database: add a hosting (or data location) credential with ${set}.`);
    if (site.runtime.sqlite.encrypted && !c.passphrase) out.push(`The database is encrypted and no passphrase credential is recorded: store it (\`! agentcms credentials set passphrase:${site.alias}\`) then ${set}.`);
  }
  if (site.runtime.backend === "firebase" && !c.data) out.push(`Firebase sites need the admin login: \`! agentcms credentials set firebase:<name>\` then ${set}.`);
  if (!c.hosting && site.runtime.backend !== "local") out.push(`No hosting credential: publishing commands will fail until one is added with ${set}.`);
  return out;
}

export const siteCommand: Command = {
  name: "site",
  summary:
    "Manage the registry of sites this computer drives: list, show, use <alias> (default), rename <from> <to>, forget <alias> (local only — nothing is deleted online), add <alias> --admin-url <url> (register an existing site; warns about missing credentials), credentials <alias> --data-credential|--hosting-credential|--passphrase-credential <account> (attach accounts to a registered site), sign-in-methods [password,emailLink,google] --site <alias> (Firebase: the login screen's methods; rewrites the hosted config.js; no argument = show), screenshot [path…] (PNG captures of the live public site, desktop + mobile; default: the home page).",
  usage: "site <list|show|use|rename|forget|add|credentials|sign-in-methods|screenshot> [args] [--site <alias>] [--admin-url <url>] [--site-url <url>] [--data-credential <account>] [--hosting-credential <account>] [--passphrase-credential <account>] [--out <dir>] [--max-height <px>] [--color-scheme light|dark] [--screenshot-js <code>]",
  options: [
    { name: "site", type: "string", description: "Site alias (show, sign-in-methods, screenshot)." },
    { name: "out", type: "string", description: "screenshot: folder for the PNGs (default: <system temp>/agentcms-screenshots/<alias>; absolute paths in the result)." },
    { name: "screenshot-js", type: "string", description: "screenshot: JavaScript run in each page before the capture (await allowed), e.g. 'document.querySelector(\"[data-cms-search]\")?.click()'." },
    { name: "color-scheme", type: "string", description: "screenshots: prefers-color-scheme of the captures, light (default) or dark." },
    { name: "max-height", type: "string", description: "screenshot: cap each capture's height in CSS px (default: the whole page, up to 6000). Use the viewport height (800 desktop / 844 mobile) for above-the-fold only." },
    { name: "admin-url", type: "string", description: "add: URL of the hosted admin, e.g. https://example.com/admin/." },
    { name: "site-url", type: "string", description: "add: public site URL when it isn't the admin's parent folder." },
    { name: "data-credential", type: "string", description: "add / credentials: account of the content repo token (Markdown in git) or of the SQLite data location." },
    { name: "hosting-credential", type: "string", description: "add / credentials: account used to write to the hosting." },
    { name: "passphrase-credential", type: "string", description: "add / credentials: passphrase account of an encrypted SQLite database." },
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
        const warnings = missingCredentials(site);
        printResult(io, { ...site, warnings }, () => [`Registered ${a}: ${site.siteUrl} [${site.runtime.backend} → ${site.hosting.connectorId || "unknown hosting"}]`, ...warnings.map((w) => `  warning: ${w}`)].join("\n"));
        return;
      }
      case "credentials": {
        // Attach (or change) the accounts a registered site uses.
        const site = resolveSite(a ?? (options.site as string | undefined));
        const { parseAccount, getCredential } = await import("../credentials");
        const roles = { data: "data-credential", hosting: "hosting-credential", passphrase: "passphrase-credential" } as const;
        const next = { ...site.credentials };
        let changed = false;
        for (const [role, flag] of Object.entries(roles) as Array<[keyof typeof roles, string]>) {
          const v = options[flag];
          if (typeof v !== "string") continue;
          if (v === "") delete next[role];
          else {
            parseAccount(v);
            if (!getCredential(v)) throw new CliError("credential-missing", `${v} is not stored on this computer.`, `Store it first: \`! agentcms credentials set ${v}\`.`, 2);
            next[role] = v;
          }
          changed = true;
        }
        if (!changed) throw new CliError("usage", "site credentials needs --data-credential, --hosting-credential and/or --passphrase-credential (\"\" removes one).", undefined, 2);
        const updated = { ...site, credentials: next, updatedAt: new Date().toISOString() };
        putSite(updated);
        const warnings = missingCredentials(updated);
        printResult(io, { alias: site.alias, credentials: next, warnings }, () => [`${site.alias}: ${JSON.stringify(next)}`, ...warnings.map((w) => `  warning: ${w}`)].join("\n"));
        return;
      }
      case "sign-in-methods": {
        // Firebase: which buttons the admin's login screen shows. Lives in
        // the hosted config.js (public): rewrite only that file.
        const site = resolveSite(options.site as string | undefined);
        if (site.runtime.backend !== "firebase") {
          throw new CliError("unsupported-backend", `${site.alias} doesn't use Firebase: it has no sign-in methods to choose.`, undefined, 2);
        }
        const { FIREBASE_SIGN_IN_METHODS } = await import("../../src/lib/runtimeConfig");
        const current = site.runtime.signInMethods?.length ? site.runtime.signInMethods : ["password"];
        if (!a) {
          printResult(io, { alias: site.alias, signInMethods: current, available: FIREBASE_SIGN_IN_METHODS }, () => `${site.alias}: ${current.join(", ")}`);
          return;
        }
        const wanted = a.split(",").map((m) => m.trim()).filter(Boolean);
        const bad = wanted.filter((m) => !(FIREBASE_SIGN_IN_METHODS as readonly string[]).includes(m));
        if (bad.length) throw new CliError("usage", `Unknown sign-in method(s): ${bad.join(", ")}.`, `Use a comma-separated list of ${FIREBASE_SIGN_IN_METHODS.join(", ")}.`, 2);
        // Password always: the bootstrap admin and this CLI sign in with it.
        const methods = FIREBASE_SIGN_IN_METHODS.filter((m) => m === "password" || wanted.includes(m));
        const runtime = { ...site.runtime, ...(methods.length > 1 ? { signInMethods: methods } : {}) };
        if (methods.length === 1) delete (runtime as { signInMethods?: unknown }).signInMethods;
        let configJs: string | null = null;
        if (site.adminFolder) {
          if (!site.credentials.hosting) {
            throw new CliError("credential-required", `No hosting credential recorded for ${site.alias}: config.js can't be updated.`, `\`agentcms site credentials ${site.alias} --hosting-credential <account>\`.`);
          }
          installBrowserEnv();
          const { requireCredential } = await import("../credentials");
          const { buildConfigJsSource } = await import("../../src/lib/runtimeConfig");
          const { applyOps, hostingConnector } = await import("../ops/hosting");
          const { settleHosting } = await import("../ops/install");
          const target = { connectorId: site.hosting.connectorId, settings: { ...site.hosting.settings, ...requireCredential(site.credentials.hosting).values } };
          configJs = `${site.adminFolder.replace(/^\/+|\/+$/g, "")}/config.js`;
          await applyOps(hostingConnector(target), [{ type: "put", path: configJs, content: buildConfigJsSource(runtime) }]);
          await settleHosting(target);
        }
        putSite({ ...site, runtime, updatedAt: new Date().toISOString() });
        const next = methods.filter((m) => m !== "password").length
          ? [
              "Enable the same methods in Firebase console → Authentication → Sign-in method (Email link: inside Email/Password; Google: Add new provider).",
              `Add the admin's domain (${new URL(secureAdminUrlOf(site) ?? adminUrlOf(site) ?? site.siteUrl).host}) to Authentication → Settings → Authorized domains.`,
              `Only invited addresses get access: \`agentcms users invite <email> --site ${site.alias}\`.`,
            ]
          : [];
        printResult(
          io,
          { alias: site.alias, signInMethods: methods, updated: configJs, next },
          () => [`${site.alias}: ${methods.join(", ")}${configJs ? ` (${configJs} updated)` : " (no hosted admin: saved in the registry only)"}`, ...next.map((n) => `- ${n}`)].join("\n"),
        );
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
        const { screenshotPages, setScreenshotColorScheme } = await import("../ops/extScreenshot");
    setScreenshotColorScheme(options["color-scheme"]);
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
        throw new CliError("usage", `Unknown action "${action}".`, "Use list, show, use, rename, forget, add, credentials, sign-in-methods or screenshot.", 2);
    }
  },
};
