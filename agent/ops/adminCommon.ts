import { existsSync, readFileSync } from "node:fs";
import type { MenuItem, Post, Term } from "../../src/core/types";
import type { PublishLogEntry } from "../../src/services/publisher";
import { installBrowserEnv } from "../browserEnv";
import { CliError, printResult, type Io } from "../output";
import { openSession, type OpenOptions, type SiteSession } from "./session";

// Shared plumbing of the site-administration commands (content, terms,
// media, menus, settings, plugins, themes, regenerate, users…): open a
// headless admin session on the site, run the action with the admin's
// own services, and report what happened — publisher log, toasts and
// warnings included — as one JSON result.

export interface AdminResult<T> {
  site: string;
  result: T;
  log: PublishLogEntry[];
  notices: Array<{ level: string; message: string }>;
  warnings: string[];
}

export async function runAdmin<T>(
  io: Io,
  alias: string | undefined,
  open: OpenOptions,
  work: (s: SiteSession) => Promise<T>,
  human: (r: T) => string,
): Promise<number> {
  installBrowserEnv();
  const session = await openSession(alias, open);
  const { subscribeToToasts } = await import("../../src/lib/toast");
  const notices: AdminResult<T>["notices"] = [];
  const stop = subscribeToToasts((t) => notices.push({ level: t.level, message: t.message }));
  try {
    const result = await work(session);
    // Writes made outside withStorageBatch are staged in an implicit
    // batch committed after 1.5 s idle (git hostings): commit it now,
    // before the process exits.
    await (await import("../../src/services/storage/batch")).flushImplicitBatch();
    const errors = session.entries.filter((e) => e.level === "error").length + notices.filter((n) => n.level === "error").length;
    const data: AdminResult<T> = {
      site: session.site.alias,
      result,
      log: session.entries.filter((e) => e.level !== "info"),
      notices,
      warnings: session.warnings,
    };
    printResult(io, data, () =>
      [
        human(result),
        ...data.log.map((e) => `  ${e.level}: ${e.message}`),
        ...notices.filter((n) => n.level === "error" || n.level === "warn").map((n) => `  ${n.level}: ${n.message}`),
        ...session.warnings.map((w) => `  note: ${w}`),
      ].join("\n"),
    );
    return errors ? 1 : 0;
  } finally {
    stop();
    session.close();
  }
}

// The signed-in identity (Firebase user, git account, SQLite owner).
export async function currentUserId(): Promise<string> {
  const { getBackendKind, isDocStoreBackend } = await import("../../src/lib/runtimeConfig");
  if (isDocStoreBackend(getBackendKind())) {
    const { getDocStore } = await import("../../src/services/docstore");
    const id = await getDocStore().identity();
    if (!id) throw new CliError("not-signed-in", "The site's content store did not identify a user.");
    return id.uid;
  }
  const { getAuthClient } = await import("../../src/services/firebaseClient");
  const user = getAuthClient().currentUser;
  if (!user) throw new CliError("not-signed-in", "Not signed in to Firebase.");
  return user.uid;
}

// `--x value`, `--x @file` (file contents) or `--x -` (stdin).
export function readTextOption(value: unknown, name: string): string | undefined {
  if (value === undefined || value === false) return undefined;
  const v = String(value);
  if (v === "-") return readFileSync(0, "utf8");
  if (v.startsWith("@")) {
    const file = v.slice(1);
    if (!existsSync(file)) throw new CliError("not-found", `--${name}: ${file} does not exist.`, undefined, 2);
    return readFileSync(file, "utf8");
  }
  return v;
}

export function readJsonOption(value: unknown, name: string): unknown {
  const text = readTextOption(value, name);
  if (text === undefined) return undefined;
  try {
    return JSON.parse(text);
  } catch (err) {
    throw new CliError("usage", `--${name} is not valid JSON: ${(err as Error).message}`, `Example: --${name} '{"key":"value"}' or --${name} @file.json`, 2);
  }
}

export function listOption(value: unknown): string[] | undefined {
  if (value === undefined || value === false) return undefined;
  return String(value).split(",").map((s) => s.trim()).filter(Boolean);
}

export function dateOption(value: unknown, name: string): Date | undefined {
  if (value === undefined || value === false) return undefined;
  const d = new Date(String(value));
  if (Number.isNaN(d.getTime())) throw new CliError("usage", `--${name}: "${value}" is not a date (use ISO 8601, e.g. 2026-10-27T09:00:00Z).`, undefined, 2);
  return d;
}

// Finds a post or page by id, slug, or "<category>/<slug>" path.
export function findPost(all: Post[], ref: string, type?: "post" | "page"): Post {
  const pool = type ? all.filter((p) => p.type === type) : all;
  const byId = pool.find((p) => p.id === ref);
  if (byId) return byId;
  const clean = ref.replace(/^\/+/, "").replace(/\.html$/, "");
  const matches = pool.filter((p) => p.slug === clean || (p.lastPublishedPath ?? "").replace(/\.html$/, "") === clean);
  if (matches.length === 1) return matches[0];
  if (matches.length > 1) {
    throw new CliError("ambiguous", `"${ref}" matches ${matches.length} entries: ${matches.map((m) => `${m.id} (${m.type})`).join(", ")}.`, "Use the id, or --type post|page.", 2);
  }
  throw new CliError("not-found", `No ${type ?? "post or page"} "${ref}".`, "List them with `agentcms content list`.", 2);
}

// Finds a term by id, slug or (case-insensitive) name.
export function findTerm(terms: Term[], ref: string, type?: "category" | "tag"): Term | undefined {
  const pool = type ? terms.filter((t) => t.type === type) : terms;
  return (
    pool.find((t) => t.id === ref) ??
    pool.find((t) => t.slug === ref) ??
    pool.find((t) => t.name.toLowerCase() === ref.toLowerCase())
  );
}

export function requireTerm(terms: Term[], ref: string, type?: "category" | "tag"): Term {
  if (!type) {
    // A category and a tag may share a slug or a name: don't pick one.
    const cat = findTerm(terms, ref, "category");
    const tag = findTerm(terms, ref, "tag");
    if (cat && tag && cat.id !== tag.id && ref !== cat.id && ref !== tag.id) {
      throw new CliError("ambiguous", `"${ref}" is both a category and a tag.`, "Add --type category or --type tag (or use the id).", 2);
    }
  }
  const t = findTerm(terms, ref, type);
  if (!t) throw new CliError("not-found", `No ${type ?? "term"} "${ref}".`, `List them with \`agentcms terms list${type ? ` --type ${type}` : ""}\`, or create it with \`agentcms terms create\`.`, 2);
  return t;
}

// Menu items (header / footer, nested) that point to one of `ids`.
export function menuReferences(
  settings: { menus?: Record<string, MenuItem[] | undefined> } | null | undefined,
  kind: "post" | "term",
  ids: string[],
): Array<{ menu: string; id: string; label: string; targetId: string }> {
  const out: Array<{ menu: string; id: string; label: string; targetId: string }> = [];
  const walk = (menu: string, items: MenuItem[] | undefined) => {
    for (const it of items ?? []) {
      if (it.ref?.kind === kind && it.ref.id && ids.includes(it.ref.id)) out.push({ menu, id: it.id, label: it.label, targetId: it.ref.id });
      walk(menu, it.children);
    }
  };
  for (const [menu, items] of Object.entries(settings?.menus ?? {})) walk(menu, items);
  return out;
}

export function menuRemoveHints(alias: string, refs: Array<{ menu: string; id: string; label: string }>): string[] {
  return refs.map((m) => `Menu item "${m.label}" (${m.menu}) still points to it: \`agentcms menus remove ${m.id} --menu ${m.menu} --site ${alias}\`.`);
}

export function toMillis(v: unknown): number | null {
  if (v == null) return null;
  if (typeof v === "number") return v;
  const o = v as { toMillis?: () => number };
  if (typeof o.toMillis === "function") return o.toMillis();
  if (v instanceof Date) return v.getTime();
  return null;
}

export function iso(v: unknown): string | null {
  const ms = toMillis(v);
  return ms == null ? null : new Date(ms).toISOString();
}

export async function confirmOrPlan<T>(io: Io, yes: boolean, plan: T, human: () => string): Promise<boolean> {
  if (yes) return true;
  printResult(io, { needsConfirmation: true, plan }, () => `${human()}\nNothing changed — re-run with --yes once the user agrees.`);
  return false;
}

// ─── Menu labels that no longer match their target ─────────────────────

// Menu items (any depth) pointing to `id` whose label (or, with `lang`,
// translations[lang].label) differs from `newLabel` — with the exact
// `menus update` command that aligns each one.
export function menuLabelHints(
  settings: { menus?: Record<string, MenuItem[] | undefined> } | null | undefined,
  kind: "post" | "term",
  id: string,
  newLabel: string,
  alias: string,
  lang?: string,
): Array<{ menu: string; id: string; label: string; fix: string }> {
  const out: Array<{ menu: string; id: string; label: string; fix: string }> = [];
  const walk = (menu: string, items: MenuItem[] | undefined) => {
    for (const it of items ?? []) {
      if (it.ref?.kind === kind && it.ref.id === id) {
        const current = lang ? it.translations?.[lang]?.label ?? "" : it.label;
        if (current !== newLabel) {
          out.push({
            menu,
            id: it.id,
            label: current,
            fix: `agentcms menus update ${it.id} --menu ${menu}${lang ? ` --lang ${lang}` : ""} --label ${shellQuote(newLabel)} --site ${alias}`,
          });
        }
      }
      walk(menu, it.children);
    }
  };
  for (const [menu, items] of Object.entries(settings?.menus ?? {})) walk(menu, items);
  return out;
}

// ─── Links stored in configs that point to moved / removed pages ───────
//
// Theme and plugin settings pages (promo links, CTA targets…) and menus'
// external URLs store plain strings: unlike menu refs they don't follow
// a page that moves or disappears. After an action that moved (from →
// to) or removed (to: null) published paths, `staleLinks` finds the
// stored strings that still point to an old path and builds the exact
// command that fixes each one.

export interface PathMove {
  from: string;
  to: string | null;
}

export interface StaleLink {
  where: "theme" | "plugin" | "menu";
  // Theme id, plugin id or menu name.
  owner: string;
  // Config key path ("home.promoHref", "cards[1].href") or menu item id.
  key: string;
  value: string;
  from: string;
  to: string | null;
  // The value with the old path replaced (null: the page is gone).
  suggested: string | null;
  fix: string;
}

// Paths that moved or disappeared between two snapshots of the entries
// (main path + per-language paths). Paths still published by an entry
// afterwards are not stale.
export function pathMoves(before: Post[], after: Post[]): PathMove[] {
  const live = new Set<string>();
  for (const a of after) {
    if (a.status !== "online") continue;
    if (a.lastPublishedPath) live.add(a.lastPublishedPath);
    for (const p of Object.values(a.lastPublishedPathsByLocale ?? {})) if (p) live.add(p);
  }
  const out: PathMove[] = [];
  const add = (from: string | undefined | null, to: string | undefined | null) => {
    if (!from || from === to || live.has(from) || out.some((m) => m.from === from)) return;
    out.push({ from, to: to || null });
  };
  for (const b of before) {
    const a = after.find((x) => x.id === b.id);
    const online = a && a.status === "online";
    add(b.lastPublishedPath, online ? a.lastPublishedPath : null);
    for (const [lang, p] of Object.entries(b.lastPublishedPathsByLocale ?? {})) add(p, online ? a.lastPublishedPathsByLocale?.[lang] : null);
  }
  return out;
}

function escapeRe(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

// Matches a link to `path` inside a string: "/path.html", "path.html",
// "/path" (no extension), "https://host[/base]/path.html"; for an
// index.html also "/dir/" and "/dir". Group 1 = what precedes the link,
// group 2 = origin + base path.
function linkRegex(path: string, basePath: string): RegExp | null {
  const p = path.replace(/^\/+/, "");
  let pat: string;
  if (/(^|\/)index\.html$/.test(p)) {
    const dir = p.replace(/\/?index\.html$/, "");
    if (!dir) return null; // the home never moves
    pat = `${escapeRe(dir)}(?:\\/(?:index\\.html)?)?`;
  } else {
    const stem = p.replace(/\.html$/, "");
    if (!stem) return null;
    pat = `${escapeRe(stem)}(?:\\.html)?`;
  }
  const base = basePath ? `(?:${escapeRe(basePath)})?` : "";
  return new RegExp(`(^|[\\s"'(=])((?:https?:\\/\\/[^\\/\\s"'<>]+)?${base})\\/?${pat}(?=$|[?#\\s"')<])`, "g");
}

function linkForm(path: string): string {
  const p = path.replace(/^\/+/, "");
  if (p === "index.html") return "";
  return p.replace(/(^|\/)index\.html$/, "$1");
}

export function shellQuote(s: string): string {
  return /^[A-Za-z0-9_@%+=:,./-]+$/.test(s) ? s : `'${s.replace(/'/g, `'\\''`)}'`;
}

type Seg = string | number;

function keyPath(segs: Seg[]): string {
  return segs.map((s, i) => (typeof s === "number" ? `[${s}]` : i ? `.${s}` : s)).join("");
}

// The smallest `--merge` object that sets `segs` to `value` (merges
// replace arrays: an array on the way is sent whole).
function mergePatch(node: unknown, segs: Seg[], value: unknown): unknown {
  if (!segs.length) return value;
  if (Array.isArray(node)) {
    const copy = JSON.parse(JSON.stringify(node)) as unknown[];
    let cur: unknown = copy;
    for (let i = 0; i < segs.length - 1; i++) cur = (cur as Record<Seg, unknown>)[segs[i]];
    (cur as Record<Seg, unknown>)[segs[segs.length - 1]] = value;
    return copy;
  }
  const [head, ...rest] = segs;
  return { [head]: mergePatch((node as Record<Seg, unknown> | undefined)?.[head], rest, value) };
}

export function staleLinks(
  settings: { baseUrl?: string; themeConfigs?: Record<string, unknown>; pluginConfigs?: Record<string, unknown>; menus?: Record<string, MenuItem[] | undefined> } | null | undefined,
  moves: PathMove[],
  alias: string,
): StaleLink[] {
  if (!settings || !moves.length) return [];
  let basePath = "";
  try {
    basePath = new URL(settings.baseUrl ?? "").pathname.replace(/\/+$/, "");
  } catch {
    basePath = "";
  }
  const rules = moves.map((m) => ({ m, re: linkRegex(m.from, basePath) })).filter((r): r is { m: PathMove; re: RegExp } => !!r.re);
  if (!rules.length) return [];
  // Old path(s) found in `value` → the value with every known new path in.
  const check = (value: string): { hits: PathMove[]; suggested: string | null } => {
    const hits: PathMove[] = [];
    let next: string | null = value;
    for (const { m, re } of rules) {
      re.lastIndex = 0;
      if (!re.test(value)) continue;
      hits.push(m);
      if (next !== null && m.to) next = next.replace(re, (_all, lead: string, prefix: string) => `${lead}${prefix}/${linkForm(m.to!)}`);
      else next = null;
    }
    return { hits, suggested: next };
  };
  const out: StaleLink[] = [];
  const scanConfig = (where: "theme" | "plugin", owner: string, root: unknown) => {
    const walk = (node: unknown, segs: Seg[]) => {
      if (typeof node === "string") {
        const { hits, suggested } = check(node);
        if (!hits.length) return;
        const key = keyPath(segs);
        const merge = JSON.stringify(mergePatch(root, segs, suggested ?? "<new URL>"));
        const cmd = `agentcms ${where === "theme" ? "themes" : "plugins"} config ${owner} --merge ${shellQuote(merge)} --site ${alias}`;
        for (const h of hits) {
          out.push({
            where,
            owner,
            key,
            value: node,
            from: h.from,
            to: h.to,
            suggested,
            fix: cmd,
          });
        }
        return;
      }
      if (Array.isArray(node)) node.forEach((v, i) => walk(v, [...segs, i]));
      else if (node && typeof node === "object") for (const [k, v] of Object.entries(node)) walk(v, [...segs, k]);
    };
    walk(root, []);
  };
  for (const [id, cfg] of Object.entries(settings.themeConfigs ?? {})) scanConfig("theme", id, cfg);
  for (const [id, cfg] of Object.entries(settings.pluginConfigs ?? {})) scanConfig("plugin", id, cfg);
  const walkMenu = (menu: string, items: MenuItem[] | undefined) => {
    for (const it of items ?? []) {
      if (typeof it.externalUrl === "string") {
        const { hits, suggested } = check(it.externalUrl);
        for (const h of hits) {
          out.push({
            where: "menu",
            owner: menu,
            key: it.id,
            value: it.externalUrl,
            from: h.from,
            to: h.to,
            suggested,
            fix: suggested
              ? `agentcms menus update ${it.id} --menu ${menu} --url ${shellQuote(suggested)} --site ${alias}`
              : `agentcms menus update ${it.id} --menu ${menu} --url <new URL> --site ${alias} (or \`agentcms menus remove ${it.id} --menu ${menu} --site ${alias}\`)`,
          });
        }
      }
      walkMenu(menu, it.children);
    }
  };
  for (const [menu, items] of Object.entries(settings.menus ?? {})) walkMenu(menu, items);
  return out;
}

export function staleLinkMessage(l: StaleLink): string {
  const where = l.where === "menu" ? `Menu item ${l.key} (${l.owner}) URL` : `${l.where === "theme" ? "Theme" : "Plugin"} ${l.owner} setting "${l.key}"`;
  return `${where} links to /${l.from}, which ${l.to ? `moves to /${linkForm(l.to)}` : "is no longer published"}: \`${l.fix}\``;
}

// staleLinks on the session's current settings, each one also added to
// the command's warnings.
export function reportStaleLinks(s: SiteSession, moves: PathMove[]): StaleLink[] {
  const links = staleLinks(s.settings(), moves, s.site.alias);
  for (const l of links) s.warnings.push(staleLinkMessage(l));
  return links;
}
