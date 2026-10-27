import type { MenuItem, Post, SiteSettings, Term } from "../../src/core/types";
import { CliError } from "../output";
import type { Command, CommandContext } from "./types";

// `agentcms menus …` — the header and footer menus, like the admin's
// Menus page: get (each item with what it points to), set (the whole
// { header, footer }), and add / remove / move conveniences. Saving
// does exactly what the Menus page's Save does: updateSettings({ menus })
// then publishMenuJson (which runs the `menu.json.resolved` filter —
// RSS footer links… — and uploads data/menu.json). Published pages
// load their menus from that file, so no page is regenerated.
//
// Item input (set --data, add flags) accepts the stored shape
//   { id?, label, ref: { kind: "post"|"term"|"home", id? }, externalUrl?, children?, translations? }
// or friendly targets converted on save:
//   { label, post: "<id|slug>" }  (posts and pages)
//   { label, category: "<slug|name|id>" }
//   { label, home: true }
//   { label, url: "https://…" }
// `target` (the resolved description `menus get` adds) is ignored, so
// the output of get can be edited and sent back as is.

type MenuName = "header" | "footer";

interface Corpus {
  posts: Post[];
  pages: Post[];
  terms: Term[];
  // Static home page → its link is the home (index.html).
  settings?: Pick<SiteSettings, "homeMode" | "homePageId">;
}

async function loadCorpus(): Promise<Corpus> {
  const { fetchAllPosts, invalidateAllPostsCache } = await import("../../src/services/posts");
  const { fetchAllTerms } = await import("../../src/services/taxonomies");
  invalidateAllPostsCache();
  const [posts, pages, terms] = await Promise.all([fetchAllPosts({ type: "post" }), fetchAllPosts({ type: "page" }), fetchAllTerms()]);
  return { posts, pages, terms };
}

function newId(): string {
  return typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

// Describes what an item points to (and whether the link works).
interface MenuTarget {
  kind: string;
  href: string;
  problem?: string;
  [key: string]: unknown;
}
type DescribedItem = Omit<MenuItem, "children"> & { target: MenuTarget; children?: DescribedItem[] };

async function describe(item: MenuItem, c: Corpus): Promise<DescribedItem> {
  const { resolveMenuItems } = await import("../../src/core/menuResolver");
  const href = resolveMenuItems([{ ...item, children: undefined }], c)[0].href;
  let target: Record<string, unknown>;
  if (item.externalUrl !== undefined) target = { kind: "external", url: item.externalUrl };
  else if (item.ref?.kind === "post") {
    const p = [...c.posts, ...c.pages].find((x) => x.id === item.ref?.id);
    target = p
      ? { kind: p.type, id: p.id, title: p.title, slug: p.slug, status: p.status, ...(p.status !== "online" ? { problem: "not online: the link leads to a missing page" } : {}) }
      : { kind: "post", id: item.ref.id ?? null, problem: "missing: the post or page no longer exists (href #)" };
  } else if (item.ref?.kind === "term") {
    const t = c.terms.find((x) => x.id === item.ref?.id);
    target = t
      ? { kind: t.type, id: t.id, name: t.name, slug: t.slug, ...(t.type !== "category" ? { problem: "tags have no archive (href #)" } : {}) }
      : { kind: "category", id: item.ref.id ?? null, problem: "missing: the category no longer exists (href #)" };
  } else target = { kind: "home" };
  const children: DescribedItem[] = item.children ? await Promise.all(item.children.map((ch) => describe(ch, c))) : [];
  const { children: _raw, ...rest } = item;
  void _raw;
  return { ...rest, ...(item.children ? { children } : {}), target: { ...(target as { kind: string }), href } };
}

// Validates one input item and converts friendly refs to the stored shape.
function normalizeItem(raw: unknown, c: Corpus, where: string, findPost: typeof import("../ops/adminCommon").findPost, findTerm: typeof import("../ops/adminCommon").findTerm): MenuItem {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) throw new CliError("invalid-menu", `${where}: an item must be an object.`, undefined, 2);
  const o = raw as Record<string, unknown>;
  const label = typeof o.label === "string" ? o.label : "";
  if (!label.trim()) throw new CliError("invalid-menu", `${where}: "label" is required.`, undefined, 2);
  const item: MenuItem = { id: typeof o.id === "string" && o.id ? o.id : newId(), label };
  const kinds = ["post", "category", "home", "url", "ref", "externalUrl"].filter((k) => o[k] !== undefined && o[k] !== false);
  if (kinds.length > 1) throw new CliError("invalid-menu", `${where}: give one target (${kinds.join(" + ")} given).`, undefined, 2);
  const all = [...c.posts, ...c.pages];
  const url = o.url ?? o.externalUrl;
  if (url !== undefined) {
    if (typeof url !== "string" || !url.trim()) throw new CliError("invalid-menu", `${where}: the url must be a non-empty string.`, undefined, 2);
    item.externalUrl = url.trim();
  } else if (o.post !== undefined) {
    item.ref = { kind: "post", id: findPost(all, String(o.post)).id };
  } else if (o.category !== undefined) {
    const t = findTerm(c.terms, String(o.category), "category");
    if (!t) throw new CliError("not-found", `${where}: no category "${String(o.category)}".`, "List them with `agentcms terms list --type category`.", 2);
    item.ref = { kind: "term", id: t.id };
  } else if (o.ref !== undefined) {
    const ref = o.ref as { kind?: unknown; id?: unknown };
    if (!ref || typeof ref !== "object" || !["post", "term", "home"].includes(String(ref.kind))) {
      throw new CliError("invalid-menu", `${where}: ref.kind must be post, term or home.`, undefined, 2);
    }
    const kind = ref.kind as "post" | "term" | "home";
    if (kind === "home") item.ref = { kind: "home" };
    else {
      if (typeof ref.id !== "string" || !ref.id) throw new CliError("invalid-menu", `${where}: ref.id is required for a ${kind}.`, undefined, 2);
      if (kind === "post") item.ref = { kind, id: findPost(all, ref.id).id };
      else {
        const t = findTerm(c.terms, ref.id, "category");
        if (!t) throw new CliError("not-found", `${where}: no category "${ref.id}".`, undefined, 2);
        item.ref = { kind, id: t.id };
      }
    }
  } else {
    // `home: true`, or no target at all (the admin's default for a new item).
    item.ref = { kind: "home" };
  }
  if (o.translations !== undefined) {
    const tr = o.translations as Record<string, unknown>;
    if (!tr || typeof tr !== "object" || Array.isArray(tr)) throw new CliError("invalid-menu", `${where}: translations must be { "<lang>": { "label": "…" } }.`, undefined, 2);
    const clean: NonNullable<MenuItem["translations"]> = {};
    for (const [lang, v] of Object.entries(tr)) {
      const l = typeof v === "string" ? v : (v as { label?: unknown } | null)?.label;
      if (l !== undefined && typeof l !== "string") throw new CliError("invalid-menu", `${where}: translations.${lang}.label must be a string.`, undefined, 2);
      if (l && l.trim()) clean[lang] = { label: l };
    }
    if (Object.keys(clean).length) item.translations = clean;
  }
  if (o.children !== undefined) {
    if (!Array.isArray(o.children)) throw new CliError("invalid-menu", `${where}: children must be an array.`, undefined, 2);
    if (o.children.length) item.children = o.children.map((ch, i) => normalizeItem(ch, c, `${where}.children[${i}]`, findPost, findTerm));
  }
  return item;
}

function menuOption(v: unknown): MenuName {
  if (v === "header" || v === "footer") return v;
  throw new CliError("usage", `--menu is header or footer${v === undefined ? "" : ` (got "${String(v)}")`}.`, undefined, 2);
}

function findItemIndex(list: MenuItem[], ref: string, menu: MenuName): number {
  const byId = list.findIndex((i) => i.id === ref);
  if (byId >= 0) return byId;
  const byLabel = list.map((i, n) => [i, n] as const).filter(([i]) => i.label.toLowerCase() === ref.toLowerCase());
  if (byLabel.length === 1) return byLabel[0][1];
  if (byLabel.length > 1) throw new CliError("ambiguous", `${byLabel.length} ${menu} items are labelled "${ref}".`, "Use the item id (see `agentcms menus get`).", 2);
  const pos = Number(ref);
  if (Number.isInteger(pos) && pos >= 1 && pos <= list.length) return pos - 1;
  throw new CliError("not-found", `No ${menu} item "${ref}".`, "Use an id, a label or a 1-based position (see `agentcms menus get`).", 2);
}

// Top-level item by id, label or position; nested items by id.
function findItemDeep(list: MenuItem[], ref: string, menu: MenuName): MenuItem {
  const byId = (items: MenuItem[]): MenuItem | undefined => {
    for (const it of items) {
      if (it.id === ref) return it;
      const hit = it.children ? byId(it.children) : undefined;
      if (hit) return hit;
    }
    return undefined;
  };
  return byId(list) ?? list[findItemIndex(list, ref, menu)];
}

function positionOption(v: unknown, length: number): number | undefined {
  if (v === undefined) return undefined;
  const n = Number(v);
  if (!Number.isInteger(n) || n < 1) throw new CliError("usage", `--position is a 1-based position (got "${String(v)}").`, undefined, 2);
  return Math.min(n, length + 1) - 1;
}

async function run({ io, options, positionals }: CommandContext): Promise<number | void> {
  const [action, ref] = positionals;
  const common = await import("../ops/adminCommon");
  const { runAdmin, findPost, findTerm, readJsonOption } = common;
  const alias = options.site as string | undefined;

  const describeAll = async (menus: SiteSettings["menus"], c: Corpus) => ({
    header: await Promise.all((menus.header ?? []).map((i) => describe(i, c))),
    footer: await Promise.all((menus.footer ?? []).map((i) => describe(i, c))),
  });

  // Every write: compute the new menus from the current ones, then the
  // Menus page's Save.
  const write = (compute: (current: SiteSettings["menus"], c: Corpus) => SiteSettings["menus"] | Promise<SiteSettings["menus"]>) =>
    runAdmin(io, alias, { write: true, hosting: true, extensions: true, lock: true }, async (s) => {
      const settings = s.settings();
      const c = { ...(await loadCorpus()), settings };
      const current = { header: settings.menus?.header ?? [], footer: settings.menus?.footer ?? [] };
      const nextMenus = await compute(current, c);
      const { updateSettings } = await import("../../src/services/settings");
      const { publishMenuJson, MENU_JSON_PATH } = await import("../../src/services/menuPublisher");
      await updateSettings({ menus: nextMenus });
      const patched: SiteSettings = { ...settings, menus: nextMenus };
      // Explicit batch: on commit hostings a write outside one is only
      // committed after an idle delay — after this process exits.
      const { withStorageBatch } = await import("../../src/services/siteFiles");
      await withStorageBatch(() => publishMenuJson(patched, c.posts, c.pages, c.terms));
      await s.refresh();
      const described = await describeAll(nextMenus, c);
      const problems = [...described.header, ...described.footer].filter((i) => i.target.problem).map((i) => `${i.label}: ${i.target.problem}`);
      for (const p of problems) s.warnings.push(p);
      return { ...described, published: MENU_JSON_PATH };
    }, (r) => `Saved the menus (header ${r.header.length}, footer ${r.footer.length} items) and published ${r.published}.`);

  switch (action) {
    case "get":
      return runAdmin(io, alias, {}, async (s) => {
        const settings = s.settings();
        const c = { ...(await loadCorpus()), settings };
        return describeAll({ header: settings.menus?.header ?? [], footer: settings.menus?.footer ?? [] }, c);
      }, (r) =>
        (["header", "footer"] as const)
          .map((m) => [`${m}:`, ...(r[m].length ? r[m].map((i, n) => `  ${n + 1}. ${i.label} → ${i.target.href}${i.target.problem ? `  (${i.target.problem})` : ""}  [${i.id}]`) : ["  (empty)"])].join("\n"))
          .join("\n"));

    case "set": {
      const data = readJsonOption(options.data, "data") as Record<string, unknown> | undefined;
      if (!data || typeof data !== "object" || Array.isArray(data)) throw new CliError("usage", "menus set needs --data '{\"header\":[…],\"footer\":[…]}' (or @file.json).", "A menu left out keeps its current items.", 2);
      for (const k of Object.keys(data)) if (k !== "header" && k !== "footer") throw new CliError("invalid-menu", `Unknown key "${k}" (only header and footer).`, undefined, 2);
      for (const m of ["header", "footer"] as const) if (data[m] !== undefined && !Array.isArray(data[m])) throw new CliError("invalid-menu", `${m} must be an array of items.`, undefined, 2);
      return write((current, c) => ({
        header: data.header ? (data.header as unknown[]).map((i, n) => normalizeItem(i, c, `header[${n}]`, findPost, findTerm)) : current.header,
        footer: data.footer ? (data.footer as unknown[]).map((i, n) => normalizeItem(i, c, `footer[${n}]`, findPost, findTerm)) : current.footer,
      }));
    }

    case "add": {
      const menu = menuOption(options.menu);
      const raw: Record<string, unknown> = { label: options.label };
      if (options.post !== undefined) raw.post = options.post;
      if (options.category !== undefined) raw.category = options.category;
      if (options.url !== undefined) raw.url = options.url;
      if (options.home) raw.home = true;
      return write((current, c) => {
        const item = normalizeItem(raw, c, "item", findPost, findTerm);
        const list = [...current[menu]];
        list.splice(positionOption(options.position, list.length) ?? list.length, 0, item);
        return { ...current, [menu]: list };
      });
    }

    case "remove": {
      const menu = menuOption(options.menu);
      if (!ref) throw new CliError("usage", "menus remove needs an item id, label or position.", undefined, 2);
      return write((current) => {
        const list = [...current[menu]];
        list.splice(findItemIndex(list, ref, menu), 1);
        return { ...current, [menu]: list };
      });
    }

    case "move": {
      const menu = menuOption(options.menu);
      if (!ref) throw new CliError("usage", "menus move needs an item id, label or position.", undefined, 2);
      if (options.position === undefined) throw new CliError("usage", "menus move needs --position <n> (1-based).", undefined, 2);
      return write((current) => {
        const list = [...current[menu]];
        const [item] = list.splice(findItemIndex(list, ref, menu), 1);
        list.splice(positionOption(options.position, list.length)!, 0, item);
        return { ...current, [menu]: list };
      });
    }

    case "update": {
      // One item edited in place (the Menus page's row editor): label,
      // per-language label, target. Nested items are found by id.
      const menu = menuOption(options.menu);
      if (!ref) throw new CliError("usage", "menus update needs an item id, label or position.", undefined, 2);
      const lang = typeof options.lang === "string" ? options.lang.trim() : undefined;
      const label = typeof options.label === "string" ? options.label : undefined;
      const targets = (["post", "category", "url", "home"] as const).filter((k) => options[k] !== undefined && options[k] !== false);
      if (targets.length > 1) throw new CliError("usage", `Give one target (${targets.map((t) => `--${t}`).join(" + ")} given).`, undefined, 2);
      if (lang !== undefined) {
        if (!lang) throw new CliError("usage", "--lang needs a language code.", undefined, 2);
        if (label === undefined) throw new CliError("usage", "--lang sets a translated label: it needs --label (\"\" removes the translation).", undefined, 2);
      } else if (label !== undefined && !label.trim()) throw new CliError("invalid-menu", "--label can't be empty.", undefined, 2);
      if (label === undefined && !targets.length) throw new CliError("usage", "Nothing to update.", "Pass --label (with --lang <code> for a translation), or a new target: --post, --category, --url or --home.", 2);
      return write((current, c) => {
        const list = JSON.parse(JSON.stringify(current[menu])) as MenuItem[];
        const item = findItemDeep(list, ref, menu);
        if (label !== undefined) {
          if (lang) {
            const tr = { ...(item.translations ?? {}) };
            if (label.trim()) tr[lang] = { label };
            else delete tr[lang];
            if (Object.keys(tr).length) item.translations = tr;
            else delete item.translations;
          } else item.label = label;
        }
        if (targets.length) {
          const raw: Record<string, unknown> = { label: item.label, [targets[0]]: options[targets[0]] };
          const target = normalizeItem(raw, c, "item", findPost, findTerm);
          delete item.ref;
          delete item.externalUrl;
          if (target.externalUrl !== undefined) item.externalUrl = target.externalUrl;
          else item.ref = target.ref;
        }
        return { ...current, [menu]: list };
      });
    }

    default:
      throw new CliError("usage", action ? `Unknown menus action "${action}".` : "menus needs an action.", "Actions: get, set, add, update, remove, move.", 2);
  }
}

export const menusCommand: Command = {
  name: "menus",
  summary:
    "Header and footer menus, like the admin's Menus page: get (each item with its resolved target and link), set --data (the whole { header, footer }; items { label, post|category|home|url } or the stored { ref, externalUrl } shape), add / remove / move one item, update <item> (--label, --lang <code> --label for a translated label, or a new target --post|--category|--url|--home; nested items by id). Saving publishes data/menu.json (no page regeneration needed).",
  usage:
    "menus <get|set|add|update|remove|move> [<item id|label|position>] --site <alias> [--data <json>|@file] [--menu header|footer] [--label <t>] [--lang <code>] [--post <id|slug>] [--category <slug|name>] [--url <url>] [--home] [--position <n>]",
  options: [
    { name: "site", type: "string", description: "Site alias." },
    { name: "data", type: "string", description: "set: { header?: [...], footer?: [...] } as JSON or @file.json (a menu left out is kept)." },
    { name: "menu", type: "string", description: "add / update / remove / move: header or footer." },
    { name: "label", type: "string", description: "add / update: the item's label (update --lang: the translated label, \"\" removes it)." },
    { name: "lang", type: "string", description: "update: set the label of this language (translations[<lang>].label)." },
    { name: "post", type: "string", description: "add / update: link to a post or page (id or slug)." },
    { name: "category", type: "string", description: "add / update: link to a category archive (slug, name or id)." },
    { name: "url", type: "string", description: "add / update: external (or site-relative) URL." },
    { name: "home", type: "boolean", description: "add / update: link to the home page (add: the default)." },
    { name: "position", type: "string", description: "add / move: 1-based position (add default: at the end)." },
  ],
  run,
};
