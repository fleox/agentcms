import type { ThemeManifest } from "../../src/themes/types";
import type { SiteSession } from "../ops/session";
import { CliError } from "../output";
import type { Command, CommandContext } from "./types";

// `agentcms themes …` — the admin's Themes page and theme settings, with
// the same calls:
//   list                     bundled + installed themes, the active one
//   activate <id>            "Switch & regenerate" (plan first, --yes)
//   config <id>              the settings page's Save (--get, --schema,
//                            --set, --merge) + the stylesheet recompiled
//   logo <id> <image>        logo upload (--remove deletes it)
//   sync-assets              "Sync theme assets"
// Installing / uninstalling a theme ZIP is `agentcms ext install|uninstall`.

const LOGO = { width: 480, height: 144, fit: "contain" as const };

interface ThemeRow {
  id: string;
  name: string;
  version: string;
  active: boolean;
  installed: "bundled" | "external";
  loaded: boolean;
  hasSettings: boolean;
  logo: boolean;
  description: string | null;
  error?: string;
}

function dedupe(list: ThemeManifest[]): ThemeManifest[] {
  const byId = new Map<string, ThemeManifest>();
  for (const t of list) if (!byId.has(t.id)) byId.set(t.id, t);
  return [...byId.values()];
}

// Where the theme keeps { logoEnabled, logoUpdatedAt }: top level
// (default, magazine, corporate, storefront) or under brand (portfolio).
function logoSlot(theme: ThemeManifest): "top" | "brand" | null {
  const d = theme.settings?.defaultConfig as Record<string, unknown> | undefined;
  if (!d) return null;
  if ("logoEnabled" in d) return "top";
  const brand = d.brand as Record<string, unknown> | undefined;
  if (brand && typeof brand === "object" && "logoEnabled" in brand) return "brand";
  return null;
}

async function themeRows(s: SiteSession): Promise<ThemeRow[]> {
  const { readBackendRegistryForCli } = await import("../ops/sessionRegistry");
  const registry = (await readBackendRegistryForCli().catch(() => null)) ?? { plugins: [], themes: [] };
  const external = new Set(registry.themes.map((e) => e.id));
  const active = s.settings().activeThemeId;
  const rows: ThemeRow[] = dedupe(s.host.themes.listThemes()).map((t) => ({
    id: t.id,
    name: t.name,
    version: t.version,
    active: t.id === active,
    installed: external.has(t.id) ? "external" : "bundled",
    loaded: true,
    hasSettings: !!t.settings,
    logo: logoSlot(t) !== null,
    description: (t as { description?: string }).description ?? null,
  }));
  for (const e of registry.themes) {
    if (rows.some((r) => r.id === e.id)) continue;
    const failed = s.loadedExtensions.failed.find((f) => f.id === `themes/${e.id}`);
    rows.push({ id: e.id, name: e.id, version: e.version ?? "", active: e.id === active, installed: "external", loaded: false, hasSettings: false, logo: false, description: null, error: failed?.error ?? "not loaded" });
  }
  return rows;
}

function findTheme(s: SiteSession, id: string | undefined): ThemeManifest {
  if (!id) throw new CliError("usage", "Which theme? Give its id.", "List them with `agentcms themes list`.", 2);
  const theme = s.host.themes.listThemes().find((t) => t.id === id);
  if (theme) return theme;
  const failed = s.loadedExtensions.failed.find((f) => f.id === `themes/${id}`);
  if (failed) throw new CliError("theme-not-loaded", `Theme "${id}" is installed but could not be loaded: ${failed.error}`, "Check the site's admin (`agentcms doctor`), or reinstall it (`agentcms ext install`).");
  throw new CliError("not-found", `No theme "${id}" on this site.`, "List them with `agentcms themes list`; install one with `agentcms ext install`.", 2);
}

function themeConfigOf(s: SiteSession, theme: ThemeManifest): Record<string, unknown> {
  const stored = (s.settings().themeConfigs as Record<string, unknown> | undefined)?.[theme.id];
  return { ...((theme.settings?.defaultConfig as object) ?? {}), ...((stored as object) ?? {}) };
}

async function batched<T>(fn: () => Promise<T>): Promise<T> {
  const { withStorageBatch } = await import("../../src/services/siteFiles");
  return withStorageBatch(fn);
}

// ThemeSettingsRoute.saveThemeConfig: persist, then recompile the
// stylesheet for themes that bake their settings into it.
// The CSS custom properties a theme declares in its first :root block —
// the names `style.vars` overrides (e.g. "--color-primary": "#000000").
export function cssVariablesOf(css: string): Record<string, string> {
  const block = /:root\s*\{([^}]*)\}/.exec(css ?? "")?.[1] ?? "";
  const out: Record<string, string> = {};
  for (const m of block.matchAll(/(--[\w-]+)\s*:\s*([^;]+);?/g)) {
    const v = m[2].trim();
    // Tailwind themes store colors as "r g b" triplets; their compileCss
    // takes hex (like the admin's color pickers), so show hex.
    const rgb = /^(\d{1,3})\s+(\d{1,3})\s+(\d{1,3})$/.exec(v);
    out[m[1]] = rgb ? "#" + rgb.slice(1).map((n) => Number(n).toString(16).padStart(2, "0")).join("") : v;
  }
  return out;
}

async function saveThemeConfig(s: SiteSession, theme: ThemeManifest, next: Record<string, unknown>): Promise<string | null> {
  const { updateThemeConfig } = await import("../../src/services/settings");
  await updateThemeConfig(theme.id, next);
  await s.refresh();
  if (!theme.compileCss || !theme.settings) return null;
  let css: string;
  try {
    css = theme.compileCss({ ...(theme.settings.defaultConfig as object), ...next });
  } catch (err) {
    s.log({ level: "warn", message: `compileCss for "${theme.id}" failed: ${(err as Error).message} — the stylesheet was not updated.` });
    return null;
  }
  const { uploadFile } = await import("../../src/services/siteFiles");
  const path = `theme-assets/${theme.id}.css`;
  await uploadFile({ path, content: css });
  return path;
}

async function refreshMenuJson(s: SiteSession): Promise<void> {
  const { publishMenuJson } = await import("../../src/services/menuPublisher");
  const { fetchAllPosts, invalidateAllPostsCache } = await import("../../src/services/posts");
  invalidateAllPostsCache();
  const [posts, pages] = await Promise.all([fetchAllPosts({ type: "post" }), fetchAllPosts({ type: "page" })]);
  try {
    await publishMenuJson(s.settings(), posts, pages, await s.terms());
  } catch (err) {
    s.log({ level: "warn", message: `menu.json republish failed: ${(err as Error).message}` });
  }
}

function logoState(cfg: Record<string, unknown>, slot: "top" | "brand" | null): unknown {
  if (slot === "brand") {
    const b = (cfg.brand ?? {}) as Record<string, unknown>;
    return [b.logoEnabled, b.logoUpdatedAt, b.wordmark];
  }
  return [cfg.logoEnabled, cfg.logoUpdatedAt];
}

async function run({ io, options, positionals }: CommandContext): Promise<number | void> {
  const [action, id, arg] = positionals;
  const { runAdmin } = await import("../ops/adminCommon");
  const alias = options.site as string | undefined;
  const write = { write: true, hosting: true, extensions: true, lock: true };

  switch (action) {
    case "list":
      return runAdmin(io, alias, { extensions: true }, (s) => themeRows(s), (rows) =>
        rows
          .map((r) => `${r.active ? "●" : "○"} ${r.id.padEnd(18)} ${r.version.padEnd(8)}${r.active ? " active" : ""}${r.installed === "external" ? " (installed)" : ""}${r.hasSettings ? "  config" : ""}${r.logo ? "  logo" : ""}${r.loaded ? "" : `  NOT LOADED: ${r.error}`}`)
          .join("\n") + "\n(install / uninstall a theme ZIP: agentcms ext install|uninstall)",
      );

    case "activate": {
      if (!id) throw new CliError("usage", "themes activate needs a theme id.", "List them with `agentcms themes list`.", 2);
      if (!options.yes) {
        // The plan needs the site read-only; print it and stop.
        return runAdmin(io, alias, { extensions: true }, async (s) => {
          const theme = findTheme(s, id);
          const { fetchAllPosts } = await import("../../src/services/posts");
          const [posts, pages] = await Promise.all([fetchAllPosts({ type: "post" }), fetchAllPosts({ type: "page" })]);
          const online = [...posts, ...pages].filter((p) => p.status === "online").length;
          const plan = {
            needsConfirmation: true,
            from: s.settings().activeThemeId,
            to: theme.id,
            alreadyActive: theme.id === s.settings().activeThemeId,
            rewrites: { onlineEntries: online, steps: ["theme assets of every installed theme", "every online post and page", "home, category and author pages, 404.html, menu/posts/authors JSON", "every plugin regeneration target"] },
          };
          return plan;
        }, (p) => (p.alreadyActive ? `${p.to} is already the active theme.` : `Switching ${p.from} → ${p.to} regenerates the whole site (${p.rewrites.onlineEntries} online entries, listings, assets, plugin files).\nNothing changed — re-run with --yes once the user agrees.`));
      }
      return runAdmin(io, alias, write, async (s) => {
        const theme = findTheme(s, id);
        const from = s.settings().activeThemeId;
        const started = Date.now();
        await batched(async () => {
          // ThemesPage.handleConfirmThemeChange, after the admin's settings
          // echo re-applied the registrations for the new theme.
          const { updateSettings } = await import("../../src/services/settings");
          await updateSettings({ activeThemeId: theme.id });
          const settings = await s.refresh();
          const { syncThemeAssets } = await import("../../src/services/themeSync");
          await syncThemeAssets(dedupe(s.host.themes.listThemes()), settings.themeConfigs, s.log);
          const ctx = await s.context();
          await s.host.publisher.regenerateAll(ctx, s.log);
          const { listRegenerationTargets } = await import("../../src/core/regenerationTargetRegistry");
          for (const target of listRegenerationTargets()) {
            try {
              await target.run(ctx, s.log);
            } catch (err) {
              s.log({ level: "error", message: `Plugin "${target.id}" regen failed: ${(err as Error).message}` });
            }
          }
        });
        // Media uploaded under another theme lack this one's formats.
        const { planMediaRegeneration } = await import("../../src/services/mediaRegenerate");
        const needCrop = planMediaRegeneration(await s.media(), s.settings()).filter((m) => m.formats.length).length;
        const next = needCrop ? [`agentcms media regenerate --site ${s.site.alias} --yes`, `agentcms regenerate all --site ${s.site.alias}`] : [];
        return { from, to: theme.id, seconds: Math.round((Date.now() - started) / 1000), mediaMissingFormats: needCrop, next };
      }, (r) => `Theme switched ${r.from} → ${r.to}; site regenerated in ${r.seconds}s.${r.next.length ? `\n${r.mediaMissingFormats} media lack ${r.to}'s image formats: ${r.next.join(" ; ")}` : ""}`);
    }

    case "config": {
      const { readConfigRequest } = await import("../ops/configEdit");
      const req = readConfigRequest(options);
      const readOnly = req.mode === "get" || req.mode === "schema";
      return runAdmin(io, alias, readOnly ? { extensions: true } : write, async (s) => {
        const theme = findTheme(s, id);
        if (!theme.settings) throw new CliError("no-settings", `Theme ${theme.id} has no settings.`, undefined, 2);
        const defaults = theme.settings.defaultConfig as Record<string, unknown>;
        if (req.mode === "schema") {
          const { describeSettings } = await import("../ops/configEdit");
          return { id: theme.id, documented: !!theme.settings.schema, settings: describeSettings(defaults, theme.settings.schema), defaultConfig: defaults, cssVariables: cssVariablesOf(theme.cssText) };
        }
        const prev = themeConfigOf(s, theme);
        if (req.mode === "get") return { id: theme.id, config: prev, stored: (s.settings().themeConfigs as Record<string, unknown> | undefined)?.[theme.id] ?? null };
        const { deepMerge, shapeWarnings, changedKeys, schemaErrors } = await import("../ops/configEdit");
        const { keepManaged } = await import("../ops/configEdit");
        let next = req.mode === "set" ? keepManaged(prev, { ...req.value }, theme.settings.schema) : deepMerge(prev, req.value);
        // Like the settings pages: a style change bumps cssUpdatedAt, the
        // ?v= of the stylesheet link (returning visitors get the new CSS
        // once pages are regenerated).
        if ("cssUpdatedAt" in defaults && JSON.stringify(prev.style) !== JSON.stringify(next.style)) next = { ...next, cssUpdatedAt: Date.now() };
        const invalid = schemaErrors(theme.settings.schema, next, prev);
        if (invalid.length) throw new CliError("invalid-value", `${theme.id}: ${invalid.join(" ")}`, `See \`agentcms themes config ${theme.id} --schema\`.`, 2);
        const warnings = shapeWarnings(defaults, req.value, theme.id, theme.settings.schema);
        const active = theme.id === s.settings().activeThemeId;
        if (!active) warnings.push(`${theme.id} is not the active theme (${s.settings().activeThemeId}): saved for when it is.`);
        const effects: string[] = [];
        await batched(async () => {
          // storefront Catalog tab: normalised slug, old page removed.
          let catalogMove: [string, string] | null = null;
          if (theme.id === "storefront" && JSON.stringify(prev.catalog) !== JSON.stringify(next.catalog) && next.catalog && typeof next.catalog === "object") {
            const cat = next.catalog as Record<string, unknown>;
            const slug = String(cat.slug || "catalog.html").replace(/^\/+/, "");
            const oldPath = String((prev.catalog as Record<string, unknown> | undefined)?.lastPublishedPath ?? "");
            next = { ...next, catalog: { ...cat, slug, lastPublishedPath: slug } };
            catalogMove = [oldPath, slug];
          }
          const css = await saveThemeConfig(s, theme, next);
          if (css) effects.push(`uploaded ${css}`);
          if (catalogMove) {
            const { cleanupOldCatalogPath } = await import("../../src/themes/storefront/services/catalogPublisher");
            await cleanupOldCatalogPath(catalogMove[0], catalogMove[1]);
            if (catalogMove[0] && catalogMove[0] !== catalogMove[1]) effects.push(`deleted ${catalogMove[0]}`);
          }
          const slot = logoSlot(theme);
          if (catalogMove || JSON.stringify(logoState(prev, slot)) !== JSON.stringify(logoState(next, slot))) {
            await refreshMenuJson(s);
            effects.push("published data/menu.json");
          }
        });
        // Style-only changes are live once the CSS is re-uploaded; layout
        // options are baked into the pages.
        const changed = changedKeys(prev, next);
        const styleOnly = changed.length > 0 && changed.every((k) => ["style", "cssUpdatedAt"].includes(k));
        const layout = changed.filter((k) => !["style", "cssUpdatedAt", "catalog"].includes(k));
        const homeOnly = layout.length > 0 && layout.every((k) => k === "home");
        const nextSteps = styleOnly || !layout.length ? [] : [`agentcms regenerate ${homeOnly ? "home" : "all"} --site ${s.site.alias}`];
        if (theme.id === "storefront" && next.catalog && changed.includes("catalog")) nextSteps.push(`agentcms regenerate storefront/catalog --site ${s.site.alias}`);
        const note = changed.includes("cssUpdatedAt") && active ? `The new CSS is live. Visitors with a cached copy get it once pages link the new version: \`agentcms regenerate all --site ${s.site.alias}\` (optional).` : null;
        return { id: theme.id, config: next, changed: changedKeys(prev, next), effects, warnings, next: active ? nextSteps : [], note };
      }, (r) => {
        if ("settings" in r && Array.isArray(r.settings)) {
          return r.settings
            .map((f) => `${f.path} (${f.type}, default ${JSON.stringify(f.default)})${f.values ? ` — one of ${f.values.map((v) => JSON.stringify(v)).join(" | ")}` : ""}${f.format ? ` — ${f.format}` : ""}${f.description ? `\n    ${f.description}` : ""}`)
            .join("\n");
        }
        if (!("changed" in r) || !r.changed) return JSON.stringify(r.config, null, 2);
        return [`Saved ${r.id} (${r.changed.length ? r.changed.join(", ") : "no change"}).`, ...r.effects.map((e) => `  ${e}`), ...r.warnings.map((w) => `  warning: ${w}`), ...(r.next.length ? [`Pages pick up layout changes on the next regeneration: ${r.next.join(" ; ")}`] : [])].join("\n");
      });
    }

    case "logo": {
      const remove = !!options.remove;
      if (!remove && !arg) throw new CliError("usage", "themes logo needs <id> <image> (PNG, JPEG or WebP), or <id> --remove.", undefined, 2);
      return runAdmin(io, alias, write, async (s) => {
        const theme = findTheme(s, id);
        const slot = logoSlot(theme);
        if (!slot) throw new CliError("no-logo", `Theme ${theme.id} has no logo setting.`, undefined, 2);
        const { uploadThemeLogo, removeThemeLogo, logoPath } = await import("../../src/services/themeLogo");
        const prev = themeConfigOf(s, theme);
        const file = remove ? null : (await import("./plugins")).imageFileFromDisk(arg!, ["image/png", "image/jpeg", "image/webp"]);
        const effects: string[] = [];
        const state = remove
          ? { logoEnabled: false, logoUpdatedAt: theme.id === "storefront" ? Date.now() : 0 }
          : { logoEnabled: true, logoUpdatedAt: Date.now() };
        const next = slot === "brand" ? { ...prev, brand: { ...((prev.brand as object) ?? {}), ...state } } : { ...prev, ...state };
        await batched(async () => {
          if (file) await uploadThemeLogo({ themeId: theme.id, file, ...LOGO });
          else await removeThemeLogo(theme.id);
          effects.push(`${file ? "uploaded" : "deleted"} ${logoPath(theme.id)}`);
          const css = await saveThemeConfig(s, theme, next);
          if (css) effects.push(`uploaded ${css}`);
          await refreshMenuJson(s);
          effects.push("published data/menu.json");
        });
        const warnings = theme.id === s.settings().activeThemeId ? [] : [`${theme.id} is not the active theme: the logo shows once it is.`];
        return { id: theme.id, logo: file ? logoPath(theme.id) : null, ...state, effects, warnings };
      }, (r) => [`${r.id} logo ${r.logo ? `uploaded to ${r.logo}` : "removed"}.`, ...r.effects.map((e) => `  ${e}`), ...r.warnings.map((w) => `  warning: ${w}`)].join("\n"));
    }

    case "sync-assets":
      return runAdmin(io, alias, write, async (s) => {
        const { syncThemeAssets } = await import("../../src/services/themeSync");
        const themes = dedupe(s.host.themes.listThemes());
        await batched(() => syncThemeAssets(themes, s.settings().themeConfigs, s.log));
        return { themes: themes.map((t) => t.id) };
      }, (r) => `Theme assets uploaded for ${r.themes.join(", ")}.`);

    default:
      throw new CliError("usage", action ? `Unknown themes action "${action}".` : "themes needs an action.", "Actions: list, activate, config, logo, sync-assets.", 2);
  }
}

export const themesCommand: Command = {
  name: "themes",
  summary:
    "The admin's Themes page and theme settings: list; activate <id> (switches and regenerates the whole site — plan first, --yes); config <id> (--get, --schema = default config, --set <json> replaces, --merge <json> deep-merges; recompiles theme-assets/<id>.css, republishes menu.json for logo / storefront catalog changes — layout changes need `regenerate all`); logo <id> <image> | logo <id> --remove; sync-assets (= regenerate assets). The storefront catalog page is `regenerate storefront/catalog`. Theme ZIPs: `ext install`.",
  usage: "themes <list|activate|config|logo|sync-assets> [<id>] [<image>] --site <alias> [--get|--schema|--set <json>|@file|--merge <json>|@file] [--remove] [--yes]",
  options: [
    { name: "site", type: "string", description: "Site alias." },
    { name: "get", type: "boolean", description: "config: print the current config (stored merged over defaults) — the default." },
    { name: "schema", type: "boolean", description: "config: print the theme's default config (every key it knows)." },
    { name: "set", type: "string", description: "config: replace the whole config with this JSON object (or @file.json)." },
    { name: "merge", type: "string", description: "config: deep-merge this JSON object into the current config (arrays are replaced)." },
    { name: "remove", type: "boolean", description: "logo: delete the logo instead of uploading one." },
    { name: "yes", type: "boolean", description: "activate: switch and regenerate (otherwise only the plan)." },
  ],
  run,
};
