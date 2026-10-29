import { createRequire as __acmsRequire } from "node:module";
import { fileURLToPath as __acmsPath } from "node:url";
import { dirname as __acmsDirname } from "node:path";
const require2 = __acmsRequire(import.meta.url);
const __filename = __acmsPath(import.meta.url);
const __dirname = __acmsDirname(__filename);
import { readFileSync, existsSync } from "node:fs";
import { a as installBrowserEnv, p as printResult, C as CliError } from "../agentcms.mjs";
import { openSession } from "./session-CdJucxK2.mjs";
import "node:util";
import "node:path";
import "node:url";
import "node:os";
import "node:child_process";
import "node:http";
import "./extHost-l9QNBuO-.mjs";
import "node:module";
async function runAdmin(io, alias, open, work, human) {
  installBrowserEnv();
  const session = await openSession(alias, open);
  const { subscribeToToasts } = await import("./toast-CYyyaSAW.mjs");
  const notices = [];
  const stop = subscribeToToasts((t) => notices.push({ level: t.level, message: t.message }));
  try {
    const result = await work(session);
    await (await import("./batch-CaQZLk71.mjs")).flushImplicitBatch();
    const errors = session.entries.filter((e) => e.level === "error").length + notices.filter((n) => n.level === "error").length;
    const data = {
      site: session.site.alias,
      result,
      log: session.entries.filter((e) => e.level !== "info"),
      notices,
      warnings: session.warnings
    };
    printResult(
      io,
      data,
      () => [
        human(result),
        ...data.log.map((e) => `  ${e.level}: ${e.message}`),
        ...notices.filter((n) => n.level === "error" || n.level === "warn").map((n) => `  ${n.level}: ${n.message}`),
        ...session.warnings.map((w) => `  note: ${w}`)
      ].join("\n")
    );
    return errors ? 1 : 0;
  } finally {
    stop();
    session.close();
  }
}
async function currentUserId() {
  const { getBackendKind, isDocStoreBackend } = await import("./runtimeConfig-2M2d2Pbu.mjs");
  if (isDocStoreBackend(getBackendKind())) {
    const { getDocStore } = await import("./registry-QpZDUKmd.mjs").then((n) => n.B);
    const id = await getDocStore().identity();
    if (!id) throw new CliError("not-signed-in", "The site's content store did not identify a user.");
    return id.uid;
  }
  const { getAuthClient } = await import("./firebaseClient-D3fvED27.mjs").then((n) => n.a8);
  const user = getAuthClient().currentUser;
  if (!user) throw new CliError("not-signed-in", "Not signed in to Firebase.");
  return user.uid;
}
function readTextOption(value, name) {
  if (value === void 0 || value === false) return void 0;
  const v = String(value);
  if (v === "-") return readFileSync(0, "utf8");
  if (v.startsWith("@")) {
    const file = v.slice(1);
    if (!existsSync(file)) throw new CliError("not-found", `--${name}: ${file} does not exist.`, void 0, 2);
    return readFileSync(file, "utf8");
  }
  return v;
}
function readJsonOption(value, name) {
  const text = readTextOption(value, name);
  if (text === void 0) return void 0;
  try {
    return JSON.parse(text);
  } catch (err) {
    throw new CliError("usage", `--${name} is not valid JSON: ${err.message}`, `Example: --${name} '{"key":"value"}' or --${name} @file.json`, 2);
  }
}
function listOption(value) {
  if (value === void 0 || value === false) return void 0;
  return String(value).split(",").map((s) => s.trim()).filter(Boolean);
}
function dateOption(value, name) {
  if (value === void 0 || value === false) return void 0;
  const d = new Date(String(value));
  if (Number.isNaN(d.getTime())) throw new CliError("usage", `--${name}: "${value}" is not a date (use ISO 8601, e.g. 2026-10-27T09:00:00Z).`, void 0, 2);
  return d;
}
function findPost(all, ref, type) {
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
function findTerm(terms, ref, type) {
  const pool = type ? terms.filter((t) => t.type === type) : terms;
  return pool.find((t) => t.id === ref) ?? pool.find((t) => t.slug === ref) ?? pool.find((t) => t.name.toLowerCase() === ref.toLowerCase());
}
function requireTerm(terms, ref, type) {
  if (!type) {
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
function menuReferences(settings, kind, ids) {
  const out = [];
  const walk = (menu, items) => {
    for (const it of items ?? []) {
      if (it.ref?.kind === kind && it.ref.id && ids.includes(it.ref.id)) out.push({ menu, id: it.id, label: it.label, targetId: it.ref.id });
      walk(menu, it.children);
    }
  };
  for (const [menu, items] of Object.entries(settings?.menus ?? {})) walk(menu, items);
  return out;
}
function menuRemoveHints(alias, refs) {
  return refs.map((m) => `Menu item "${m.label}" (${m.menu}) still points to it: \`agentcms menus remove ${m.id} --menu ${m.menu} --site ${alias}\`.`);
}
function toMillis(v) {
  if (v == null) return null;
  if (typeof v === "number") return v;
  const o = v;
  if (typeof o.toMillis === "function") return o.toMillis();
  if (v instanceof Date) return v.getTime();
  return null;
}
function iso(v) {
  const ms = toMillis(v);
  return ms == null ? null : new Date(ms).toISOString();
}
async function confirmOrPlan(io, yes, plan, human) {
  if (yes) return true;
  printResult(io, { needsConfirmation: true, plan }, () => `${human()}
Nothing changed — re-run with --yes once the user agrees.`);
  return false;
}
function menuLabelHints(settings, kind, id, newLabel, alias, lang) {
  const out = [];
  const walk = (menu, items) => {
    for (const it of items ?? []) {
      if (it.ref?.kind === kind && it.ref.id === id) {
        const current = lang ? it.translations?.[lang]?.label ?? "" : it.label;
        if (current !== newLabel) {
          out.push({
            menu,
            id: it.id,
            label: current,
            fix: `agentcms menus update ${it.id} --menu ${menu}${lang ? ` --lang ${lang}` : ""} --label ${shellQuote(newLabel)} --site ${alias}`
          });
        }
      }
      walk(menu, it.children);
    }
  };
  for (const [menu, items] of Object.entries(settings?.menus ?? {})) walk(menu, items);
  return out;
}
function pathMoves(before, after) {
  const live = /* @__PURE__ */ new Set();
  for (const a of after) {
    if (a.status !== "online") continue;
    if (a.lastPublishedPath) live.add(a.lastPublishedPath);
    for (const p of Object.values(a.lastPublishedPathsByLocale ?? {})) if (p) live.add(p);
  }
  const out = [];
  const add = (from, to) => {
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
function escapeRe(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
function linkRegex(path, basePath) {
  const p = path.replace(/^\/+/, "");
  let pat;
  if (/(^|\/)index\.html$/.test(p)) {
    const dir = p.replace(/\/?index\.html$/, "");
    if (!dir) return null;
    pat = `${escapeRe(dir)}(?:\\/(?:index\\.html)?)?`;
  } else {
    const stem = p.replace(/\.html$/, "");
    if (!stem) return null;
    pat = `${escapeRe(stem)}(?:\\.html)?`;
  }
  const base = basePath ? `(?:${escapeRe(basePath)})?` : "";
  return new RegExp(`(^|[\\s"'(=])((?:https?:\\/\\/[^\\/\\s"'<>]+)?${base})\\/?${pat}(?=$|[?#\\s"')<])`, "g");
}
function linkForm(path) {
  const p = path.replace(/^\/+/, "");
  if (p === "index.html") return "";
  return p.replace(/(^|\/)index\.html$/, "$1");
}
function shellQuote(s) {
  return /^[A-Za-z0-9_@%+=:,./-]+$/.test(s) ? s : `'${s.replace(/'/g, `'\\''`)}'`;
}
function keyPath(segs) {
  return segs.map((s, i) => typeof s === "number" ? `[${s}]` : i ? `.${s}` : s).join("");
}
function mergePatch(node, segs, value) {
  if (!segs.length) return value;
  if (Array.isArray(node)) {
    const copy = JSON.parse(JSON.stringify(node));
    let cur = copy;
    for (let i = 0; i < segs.length - 1; i++) cur = cur[segs[i]];
    cur[segs[segs.length - 1]] = value;
    return copy;
  }
  const [head, ...rest] = segs;
  return { [head]: mergePatch(node?.[head], rest, value) };
}
function staleLinks(settings, moves, alias) {
  if (!settings || !moves.length) return [];
  let basePath = "";
  try {
    basePath = new URL(settings.baseUrl ?? "").pathname.replace(/\/+$/, "");
  } catch {
    basePath = "";
  }
  const rules = moves.map((m) => ({ m, re: linkRegex(m.from, basePath) })).filter((r) => !!r.re);
  if (!rules.length) return [];
  const check = (value) => {
    const hits = [];
    let next = value;
    for (const { m, re } of rules) {
      re.lastIndex = 0;
      if (!re.test(value)) continue;
      hits.push(m);
      if (next !== null && m.to) next = next.replace(re, (_all, lead, prefix) => `${lead}${prefix}/${linkForm(m.to)}`);
      else next = null;
    }
    return { hits, suggested: next };
  };
  const out = [];
  const scanConfig = (where, owner, root) => {
    const walk = (node, segs) => {
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
            fix: cmd
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
  const walkMenu = (menu, items) => {
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
            fix: suggested ? `agentcms menus update ${it.id} --menu ${menu} --url ${shellQuote(suggested)} --site ${alias}` : `agentcms menus update ${it.id} --menu ${menu} --url <new URL> --site ${alias} (or \`agentcms menus remove ${it.id} --menu ${menu} --site ${alias}\`)`
          });
        }
      }
      walkMenu(menu, it.children);
    }
  };
  for (const [menu, items] of Object.entries(settings.menus ?? {})) walkMenu(menu, items);
  return out;
}
function staleLinkMessage(l) {
  const where = l.where === "menu" ? `Menu item ${l.key} (${l.owner}) URL` : `${l.where === "theme" ? "Theme" : "Plugin"} ${l.owner} setting "${l.key}"`;
  return `${where} links to /${l.from}, which ${l.to ? `moves to /${linkForm(l.to)}` : "is no longer published"}: \`${l.fix}\``;
}
function reportStaleLinks(s, moves) {
  const links = staleLinks(s.settings(), moves, s.site.alias);
  for (const l of links) s.warnings.push(staleLinkMessage(l));
  return links;
}
export {
  confirmOrPlan,
  currentUserId,
  dateOption,
  findPost,
  findTerm,
  iso,
  listOption,
  menuLabelHints,
  menuReferences,
  menuRemoveHints,
  pathMoves,
  readJsonOption,
  readTextOption,
  reportStaleLinks,
  requireTerm,
  runAdmin,
  shellQuote,
  staleLinkMessage,
  staleLinks,
  toMillis
};
