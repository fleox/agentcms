import type { EditorStyle, Post, SiteSettings } from "../../src/core/types";
import { CliError } from "../output";
import type { Command, CommandContext } from "./types";

// `agentcms settings …` — Settings → General, like the admin's
// SettingsPage: get (site, editor typography, performance, publish
// target), set (the Site section's fields, editor typography and — on
// Firebase only — the pagination mode), target (the publish target
// without its secrets) and target test (the admin's Test connection
// with the credentials this CLI holds for the site).
//
// Like the admin, saving settings republishes nothing: the result's
// `next` lists the regeneration the change needs. Saving a new publish
// target is out of scope (use `agentcms install` / `site add`).

type Section = "site" | "editor" | "performance" | "target";
const SECTIONS: Section[] = ["site", "editor", "performance", "target"];
const SECRET_KEYS = new Set(["token", "apiKey", "accessKeyId", "secretAccessKey", "accessToken", "password", "sqliteToken", "passphrase"]);
const LENGTH_RE = /^\d+(\.\d+)?(px|rem|em|pt|%)$/;
const LANG_RE = /^[A-Za-z]{2,3}(-[A-Za-z0-9]{1,8})*$/;

function mask(settings: Record<string, unknown>): Record<string, unknown> {
  return Object.fromEntries(Object.entries(settings).map(([k, v]) => [k, SECRET_KEYS.has(k) && v ? "(set)" : v]));
}

async function pages(): Promise<Post[]> {
  const { fetchAllPosts, invalidateAllPostsCache } = await import("../../src/services/posts");
  invalidateAllPostsCache();
  return fetchAllPosts({ type: "page" });
}

async function backend() {
  return (await import("../../src/lib/runtimeConfig")).getBackendKind();
}

async function readSection(section: Section, settings: SiteSettings, s: import("../ops/session").SiteSession) {
  switch (section) {
    case "site": {
      const { pickPublicLocale } = await import("../../src/i18n");
      const home = settings.homePageId ? (await pages()).find((p) => p.id === settings.homePageId) : undefined;
      return {
        title: settings.title,
        description: settings.description,
        language: settings.language,
        publicLocale: pickPublicLocale(settings.language),
        baseUrl: settings.baseUrl,
        postsPerPage: settings.postsPerPage,
        homeMode: settings.homeMode,
        homePageId: settings.homePageId ?? null,
        homePage: home ? { id: home.id, title: home.title, slug: home.slug, status: home.status } : null,
        discourageIndexing: settings.discourageIndexing === true,
        activeThemeId: settings.activeThemeId,
      };
    }
    case "editor": {
      const { EDITOR_FONT_OPTIONS, DEFAULT_EDITOR_SIZES } = await import("../../src/core/editorFonts");
      return { ...(settings.editorStyle ?? {}), fonts: EDITOR_FONT_OPTIONS.map((f) => f.name), defaults: DEFAULT_EDITOR_SIZES };
    }
    case "performance": {
      const kind = await backend();
      return { backend: kind, paginationMode: settings.paginationMode ?? "global", applicable: kind === "firebase" };
    }
    case "target": {
      const { readPublishTarget, targetSiteUrl } = await import("../../src/services/storage/target");
      const stored = await readPublishTarget();
      const merged = { ...s.site.hosting.settings, ...stored.settings };
      const siteUrl = targetSiteUrl({ connectorId: stored.connectorId, settings: merged });
      const base = (settings.baseUrl ?? "").replace(/\/+$/, "");
      return {
        connectorId: stored.connectorId,
        settings: mask(merged),
        siteUrl: siteUrl || null,
        credential: s.site.credentials.hosting ?? null,
        baseUrlMismatch: siteUrl && base && siteUrl !== base ? { baseUrl: base, targetSiteUrl: siteUrl, fix: `agentcms settings set --base-url ${siteUrl}` } : null,
      };
    }
  }
}

interface SetInput {
  title?: string;
  description?: string;
  language?: string;
  baseUrl?: string;
  postsPerPage?: number;
  homeMode?: "latest-posts" | "static-page";
  homePage?: string;
  discourageIndexing?: boolean;
  editorStyle?: EditorStyle;
  paginationMode?: "global" | "paginated";
}

function boolValue(v: unknown, name: string): boolean | undefined {
  if (v === undefined) return undefined;
  if (v === true || v === "true" || v === "yes" || v === "1") return true;
  if (v === false || v === "false" || v === "no" || v === "0") return false;
  throw new CliError("usage", `--${name} is true or false (got "${String(v)}").`, undefined, 2);
}

async function readInput(options: CommandContext["options"]): Promise<SetInput> {
  const { readJsonOption, readTextOption } = await import("../ops/adminCommon");
  const data = (readJsonOption(options.data, "data") ?? {}) as Record<string, unknown>;
  if (typeof data !== "object" || Array.isArray(data)) throw new CliError("usage", "--data must be a JSON object.", undefined, 2);
  const known = ["title", "description", "language", "baseUrl", "postsPerPage", "homeMode", "homePage", "homePageId", "discourageIndexing", "editorStyle", "paginationMode"];
  for (const k of Object.keys(data)) if (!known.includes(k)) throw new CliError("usage", `--data: unknown setting "${k}".`, `Known: ${known.join(", ")}.`, 2);
  const pick = (flag: unknown, key: string) => (flag !== undefined ? flag : data[key]);
  const str = (v: unknown, name: string) => {
    if (v === undefined) return undefined;
    if (typeof v !== "string") throw new CliError("usage", `${name} must be a string.`, undefined, 2);
    return v;
  };
  const input: SetInput = {
    title: str(pick(options.title, "title"), "title"),
    description: str(readTextOption(options.description, "description") ?? data.description, "description"),
    language: str(pick(options.language, "language"), "language"),
    baseUrl: str(pick(options["base-url"], "baseUrl"), "baseUrl"),
    homePage: str(pick(options["home-page"], "homePage") ?? data.homePageId, "homePage"),
  };
  const ppp = pick(options["posts-per-page"], "postsPerPage");
  if (ppp !== undefined) {
    const n = typeof ppp === "number" ? ppp : Number(String(ppp));
    if (!Number.isInteger(n) || n < 1) throw new CliError("invalid-setting", `postsPerPage must be a whole number ≥ 1 (got "${String(ppp)}").`, undefined, 2);
    input.postsPerPage = n;
  }
  const mode = pick(options["home-mode"], "homeMode");
  if (mode !== undefined) {
    if (mode !== "latest-posts" && mode !== "static-page") throw new CliError("invalid-setting", `homeMode is latest-posts or static-page (got "${String(mode)}").`, undefined, 2);
    input.homeMode = mode;
  }
  input.discourageIndexing = boolValue(pick(options["discourage-indexing"], "discourageIndexing"), "discourage-indexing");
  const pm = pick(options["pagination-mode"], "paginationMode");
  if (pm !== undefined) {
    if (pm !== "global" && pm !== "paginated") throw new CliError("invalid-setting", `paginationMode is global or paginated (got "${String(pm)}").`, undefined, 2);
    input.paginationMode = pm;
  }
  const es = { ...((data.editorStyle && typeof data.editorStyle === "object" ? data.editorStyle : {}) as Record<string, unknown>) };
  for (const [flag, key] of [["editor-font", "fontFamily"], ["editor-body-size", "bodySize"], ["editor-h1-size", "h1Size"], ["editor-h2-size", "h2Size"], ["editor-h3-size", "h3Size"]] as const) {
    if (options[flag] !== undefined) es[key] = options[flag];
  }
  if (Object.keys(es).length) input.editorStyle = es as EditorStyle;
  return input;
}

async function run({ io, options, positionals }: CommandContext): Promise<number | void> {
  const [action, sub] = positionals;
  const { runAdmin, findPost } = await import("../ops/adminCommon");
  const alias = options.site as string | undefined;

  switch (action) {
    case "get": {
      const wanted = (sub ?? (options.section as string | undefined) ?? "all") as Section | "all";
      if (wanted !== "all" && !SECTIONS.includes(wanted)) throw new CliError("usage", `Unknown section "${wanted}".`, "site, editor, performance, target or all.", 2);
      return runAdmin(io, alias, {}, async (s) => {
        const settings = s.settings();
        const out: Partial<Record<Section, unknown>> = {};
        for (const sec of wanted === "all" ? SECTIONS : [wanted]) out[sec] = await readSection(sec, settings, s);
        return out;
      }, (r) => JSON.stringify(r, null, 2));
    }

    case "set": {
      const input = await readInput(options);
      if (!Object.values(input).some((v) => v !== undefined)) {
        throw new CliError("usage", "Nothing to set.", "Pass --title, --description, --language, --base-url, --posts-per-page, --home-mode, --home-page, --discourage-indexing, --editor-*, --pagination-mode or --data.", 2);
      }
      // Validation like the Settings page (plus format checks a form gets for free).
      if (input.title !== undefined && !input.title.trim()) throw new CliError("invalid-setting", "The site title can't be empty.", undefined, 2);
      if (input.language !== undefined && !LANG_RE.test(input.language.trim())) throw new CliError("invalid-setting", `"${input.language}" is not a BCP-47 language tag.`, "e.g. en, fr, fr-FR, pt-BR.", 2);
      if (input.baseUrl !== undefined && input.baseUrl.trim() && !/^https?:\/\/[^\s/]+/.test(input.baseUrl.trim())) {
        throw new CliError("invalid-setting", `"${input.baseUrl}" is not an http(s) URL.`, "e.g. https://www.example.com (or \"\" to clear it).", 2);
      }
      if (input.editorStyle) {
        const { EDITOR_FONT_OPTIONS, SYSTEM_FONT_NAME } = await import("../../src/core/editorFonts");
        const f = input.editorStyle.fontFamily;
        if (f !== undefined && f !== "" && !EDITOR_FONT_OPTIONS.some((o) => o.name === f)) {
          throw new CliError("invalid-setting", `Unknown editor font "${f}".`, `One of: ${EDITOR_FONT_OPTIONS.map((o) => o.name).join(", ")}.`, 2);
        }
        if (f === SYSTEM_FONT_NAME) input.editorStyle.fontFamily = "";
        for (const k of ["bodySize", "h1Size", "h2Size", "h3Size"] as const) {
          const v = input.editorStyle[k];
          if (v !== undefined && typeof v !== "string") throw new CliError("invalid-setting", `editorStyle.${k} must be a string.`, undefined, 2);
          if (v && v.trim() && !LENGTH_RE.test(v.trim())) throw new CliError("invalid-setting", `editorStyle.${k} "${v}" is not a CSS length.`, "e.g. 16px, 1.125rem.", 2);
        }
      }
      return runAdmin(io, alias, { write: true, lock: true }, async (s) => {
        const { updateSettings } = await import("../../src/services/settings");
        const settings = s.settings();
        const kind = await backend();
        const changed: string[] = [];
        const next: string[] = [];
        const notes: string[] = [];

        // Site section (saveSite).
        const site: Partial<SiteSettings> = {};
        if (input.title !== undefined) site.title = input.title.trim();
        if (input.description !== undefined) site.description = input.description;
        if (input.language !== undefined) site.language = input.language.trim();
        if (input.baseUrl !== undefined) site.baseUrl = input.baseUrl.trim();
        if (input.postsPerPage !== undefined) site.postsPerPage = input.postsPerPage;
        if (input.discourageIndexing !== undefined) site.discourageIndexing = input.discourageIndexing;
        const homeMode = input.homeMode ?? settings.homeMode;
        let homePageId: string | undefined = settings.homePageId;
        if (input.homePage !== undefined) {
          if (input.homePage === "") homePageId = undefined;
          else {
            const page = findPost(await pages(), input.homePage, "page");
            if (page.status !== "online") notes.push(`"${page.title}" is a draft: publish it (\`agentcms content publish ${page.id}\`) or the home has no content.`);
            homePageId = page.id;
          }
        }
        if (input.homeMode !== undefined || input.homePage !== undefined) {
          if (homeMode === "static-page" && !homePageId) {
            throw new CliError("invalid-setting", "A static-page home needs a page.", "Add --home-page <page id|slug> (see `agentcms content list --type page`).", 2);
          }
          if (input.homePage && homeMode !== "static-page") notes.push("--home-page only applies with --home-mode static-page: ignored.");
          site.homeMode = homeMode;
          // Like saveSite: the page is only kept in static-page mode.
          site.homePageId = homeMode === "static-page" ? homePageId : undefined;
        }
        const editorPatch: Partial<SiteSettings> = {};
        if (input.editorStyle) {
          // saveEditorStyle: trimmed, empties dropped, undefined when empty.
          const merged = { ...(settings.editorStyle ?? {}), ...input.editorStyle };
          const clean: EditorStyle = {};
          if (merged.fontFamily) clean.fontFamily = merged.fontFamily;
          for (const k of ["bodySize", "h1Size", "h2Size", "h3Size"] as const) if (merged[k]?.trim()) clean[k] = merged[k]!.trim();
          editorPatch.editorStyle = Object.keys(clean).length ? clean : undefined;
        }
        let indexes: unknown = null;
        if (input.paginationMode !== undefined) {
          if (kind !== "firebase") {
            throw new CliError("not-applicable", `The pagination mode only exists on Firebase sites (this one is ${kind}).`, "Document-store backends keep everything in memory; nothing to set.", 2);
          }
          const { invalidateCachedReady, pingPaginatedQueries } = await import("../../src/services/firestoreSetup");
          invalidateCachedReady();
          if (input.paginationMode === "paginated") {
            const res = await pingPaginatedQueries().catch((e: Error) => ({ ready: false, missingIndexes: [], unexpectedError: { code: "error", message: e.message } }));
            indexes = res;
            if (!res.ready) notes.push("Paginated mode needs two Firestore composite indexes that are not ready yet — the admin's lists fail until they exist (see `indexes`).");
          }
        }

        for (const [k, v] of Object.entries(site)) if (JSON.stringify(v) !== JSON.stringify((settings as unknown as Record<string, unknown>)[k])) changed.push(k);
        if ("editorStyle" in editorPatch && JSON.stringify(editorPatch.editorStyle ?? null) !== JSON.stringify(settings.editorStyle ?? null)) changed.push("editorStyle");
        if (input.paginationMode !== undefined && input.paginationMode !== (settings.paginationMode ?? "global")) changed.push("paginationMode");

        // One write per admin section saved, as the Save buttons do.
        if (Object.keys(site).length) await updateSettings(site);
        if ("editorStyle" in editorPatch) await updateSettings(editorPatch);
        if (input.paginationMode !== undefined) await updateSettings({ paginationMode: input.paginationMode });
        await s.refresh();

        const has = (...keys: string[]) => keys.some((k) => changed.includes(k));
        // One unambiguous list, in order. Base URL, language and indexing
        // also reach the plugins' files (robots.txt, sitemaps, feeds,
        // search): `everything` covers pages + those in one go.
        const sitewide = has("discourageIndexing", "baseUrl", "language");
        if (has("homeMode", "homePageId")) next.push("agentcms regenerate repair");
        if (sitewide) next.push("agentcms regenerate everything");
        else if (has("homeMode", "homePageId", "title", "description", "postsPerPage")) next.push("agentcms regenerate all");
        if (has("paginationMode")) notes.push("Reload the admin in the browser for the new pagination mode.");
        if (has("editorStyle")) notes.push("Editor typography only changes the admin's editor canvas; nothing to regenerate.");
        const after = s.settings();
        // agentcms-multilang publishes its primary language at the root:
        // it must be the site language.
        const ml = after.pluginConfigs?.["agentcms-multilang"] as { primaryLanguage?: string; enabledLanguages?: string[] } | undefined;
        const mlOn = after.enabledPlugins?.["agentcms-multilang"] !== false;
        const lang = (after.language || "").toLowerCase();
        if (mlOn && lang && (ml?.primaryLanguage ?? "en").toLowerCase() !== lang) {
          const others = (ml?.enabledLanguages ?? []).filter((l) => l.toLowerCase() !== lang);
          notes.push(
            others.length
              ? `agentcms-multilang's primary language is "${ml?.primaryLanguage ?? "en"}", not "${after.language}": \`agentcms plugins config agentcms-multilang --merge '{"primaryLanguage":"${after.language}","enabledLanguages":${JSON.stringify(others)}}'\`.`
              : `agentcms-multilang is enabled with primary language "${ml?.primaryLanguage ?? "en"}" and no other language. For a site in one language, disable it (\`agentcms plugins disable agentcms-multilang\`) or set \`{"primaryLanguage":"${after.language}"}\`.`,
          );
        }
        return {
          changed,
          site: await readSection("site", after, s),
          editor: after.editorStyle ?? {},
          ...(input.paginationMode !== undefined ? { paginationMode: after.paginationMode ?? "global", indexes } : {}),
          notes,
          next,
        };
      }, (r) => [r.changed.length ? `Saved: ${r.changed.join(", ")}.` : "Nothing changed.", ...r.notes.map((n) => `  note: ${n}`), ...r.next.map((n) => `  next: ${n}`)].join("\n"));
    }

    case "target": {
      const what = sub ?? "show";
      if (what === "show") {
        return runAdmin(io, alias, {}, async (s) => readSection("target", s.settings(), s), (r) => `${r.connectorId}${r.siteUrl ? ` → ${r.siteUrl}` : ""}${r.baseUrlMismatch ? `\n  note: settings.baseUrl is ${r.baseUrlMismatch.baseUrl} — fix: ${r.baseUrlMismatch.fix}` : ""}`);
      }
      if (what === "test") {
        return runAdmin(io, alias, {}, async (s) => {
          const { getStorageConfig } = await import("../../src/services/storageConfig");
          const { testStorageConnection } = await import("../../src/services/storage/testConnection");
          const { requireCredential } = await import("../credentials");
          const stored = await getStorageConfig().catch(() => null);
          const connectorId = stored?.connectorId ?? s.site.hosting.connectorId;
          if (!connectorId) throw new CliError("hosting-unknown", `The publish target of ${s.site.alias} is unknown.`);
          // The same settings the session wires for publishing.
          const values = s.site.credentials.hosting ? requireCredential(s.site.credentials.hosting).values : {};
          const settings = { ...s.site.hosting.settings, ...(stored?.settings ?? {}), ...values };
          const res = await testStorageConnection(connectorId, settings);
          if (!res.ok) throw new CliError("connection-failed", `${connectorId}: ${res.detail}`, s.site.credentials.hosting ? `Check the account with \`agentcms credentials set ${s.site.credentials.hosting}\`.` : "Record the hosting credential with `agentcms site add … --hosting-credential <account>`.");
          return { connectorId, ok: true, detail: res.detail };
        }, (r) => `✓ ${r.connectorId}: ${r.detail}`);
      }
      throw new CliError("usage", `Unknown target action "${what}".`, "settings target [show|test].", 2);
    }

    default:
      throw new CliError("usage", action ? `Unknown settings action "${action}".` : "settings needs an action.", "Actions: get, set, target.", 2);
  }
}

export const settingsCommand: Command = {
  name: "settings",
  summary:
    "Settings → General, like the admin: get [site|editor|performance|target|all], set (title, description, language, base URL, posts per page, home mode + page, discourage indexing, editor typography, pagination mode on Firebase), target [show|test] (publish target without secrets / Test connection). Saving republishes nothing: run the `next` regeneration.",
  usage:
    "settings <get [section]|set|target [show|test]> --site <alias> [--section site|editor|performance|target|all] [--title <t>] [--description <t>|@file] [--language <bcp47>] [--base-url <url>] [--posts-per-page <n>] [--home-mode latest-posts|static-page] [--home-page <page id|slug>] [--discourage-indexing true|false] [--editor-font <name>] [--editor-body-size <len>] [--editor-h1-size <len>] [--editor-h2-size <len>] [--editor-h3-size <len>] [--pagination-mode global|paginated] [--data <json>|@file]",
  options: [
    { name: "site", type: "string", description: "Site alias." },
    { name: "section", type: "string", description: "get: site, editor, performance, target or all (default)." },
    { name: "title", type: "string", description: "Site title." },
    { name: "description", type: "string", description: "Site description (text, @file or -)." },
    { name: "language", type: "string", description: "Public site language (BCP-47: en, fr-FR…) — <html lang>." },
    { name: "base-url", type: "string", description: "Public base URL (https://…; \"\" clears it). Drives canonicals, sitemaps, RSS, sub-folder links." },
    { name: "posts-per-page", type: "string", description: "Posts per listing page (≥ 1)." },
    { name: "home-mode", type: "string", description: "latest-posts or static-page." },
    { name: "home-page", type: "string", description: "The page shown as home in static-page mode (id or slug; \"\" clears it)." },
    { name: "discourage-indexing", type: "string", description: "true: noindex on every page + robots.txt Disallow (after regeneration); false: indexable." },
    { name: "editor-font", type: "string", description: "Admin editor font (see `settings get editor`; \"\" = system)." },
    { name: "editor-body-size", type: "string", description: "Admin editor body size (CSS length; \"\" = default)." },
    { name: "editor-h1-size", type: "string", description: "Admin editor H1 size." },
    { name: "editor-h2-size", type: "string", description: "Admin editor H2 size." },
    { name: "editor-h3-size", type: "string", description: "Admin editor H3 size." },
    { name: "pagination-mode", type: "string", description: "Firebase only: global or paginated (needs composite indexes)." },
    { name: "data", type: "string", description: "Settings as JSON (or @file.json): title, description, language, baseUrl, postsPerPage, homeMode, homePage, discourageIndexing, editorStyle{fontFamily,bodySize,h1Size,h2Size,h3Size}, paginationMode. Flags override it." },
  ],
  run,
};
