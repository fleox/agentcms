import type { Post, SeoMeta, Term, TermType } from "../../src/core/types";
import type { PathMove } from "../ops/adminCommon";
import { CliError } from "../output";
import type { Command, CommandContext } from "./types";

// `agentcms terms …` — categories and tags, exactly like the admin's
// Categories & Tags page (TaxonomiesPage): add (explicit slug validated
// + collision-checked, empty slug derived from the name and made
// unique), edit name / slug / SEO (the SEO modal), per-language
// translations (agentcms-multilang's TermTranslationsSection), delete.
//
// Like the admin, saving a term republishes nothing: archives and post
// URLs move on the next regeneration — every write returns a `next`
// hint with the regeneration to run.

function typeOption(v: unknown): TermType | undefined {
  if (v === undefined) return undefined;
  if (v === "category" || v === "tag") return v;
  throw new CliError("usage", `--type is category or tag (got "${String(v)}").`, undefined, 2);
}

async function allEntries(): Promise<Post[]> {
  const { fetchAllPosts, invalidateAllPostsCache } = await import("../../src/services/posts");
  invalidateAllPostsCache();
  const [posts, pages] = await Promise.all([fetchAllPosts({ type: "post" }), fetchAllPosts({ type: "page" })]);
  return [...posts, ...pages];
}

async function freshTerms(): Promise<Term[]> {
  return (await import("../../src/services/taxonomies")).fetchAllTerms();
}

function archivePath(t: Pick<Term, "type" | "slug">): string | null {
  return t.type === "category" && t.slug ? `${t.slug}/index.html` : null;
}

function usage(t: Term, all: Post[]) {
  const using = all.filter((p) => p.primaryTermId === t.id || p.termIds.includes(t.id));
  return using.map((p) => ({ id: p.id, title: p.title, status: p.status, primary: p.primaryTermId === t.id, path: p.lastPublishedPath ?? null }));
}

async function summarize(t: Term, terms: Term[], all: Post[]) {
  const { iso } = await import("../ops/adminCommon");
  const parent = t.parentId ? terms.find((x) => x.id === t.parentId) : undefined;
  return {
    id: t.id,
    type: t.type,
    name: t.name,
    slug: t.slug,
    description: t.description ?? null,
    parent: parent ? parent.slug : t.parentId ?? null,
    seo: t.seo ?? null,
    translations: t.translations ?? null,
    archivePath: archivePath(t),
    posts: usage(t, all).length,
    updatedAt: iso(t.updatedAt),
  };
}

interface TermFields {
  name?: string;
  slug?: string;
  description?: string;
  parent?: string;
  seo?: SeoMeta;
}

async function readFields(options: CommandContext["options"]): Promise<TermFields> {
  const { readJsonOption, readTextOption } = await import("../ops/adminCommon");
  const data = (readJsonOption(options.data, "data") ?? {}) as Record<string, unknown>;
  if (typeof data !== "object" || Array.isArray(data)) throw new CliError("usage", "--data must be a JSON object.", undefined, 2);
  const str = (flag: unknown, key: string) => (typeof flag === "string" ? flag : typeof data[key] === "string" ? (data[key] as string) : undefined);
  const f: TermFields = {
    name: str(options.name, "name"),
    slug: str(options.slug, "slug"),
    description: readTextOption(options.description, "description") ?? (typeof data.description === "string" ? data.description : undefined),
    parent: str(options.parent, "parent"),
  };
  const seoData = (data.seo && typeof data.seo === "object" ? data.seo : {}) as Record<string, unknown>;
  const seo: Record<string, string> = {};
  for (const [flag, key] of [["seo-title", "title"], ["seo-description", "description"], ["seo-image", "ogImage"]] as const) {
    const v = options[flag] !== undefined ? options[flag] : seoData[key];
    if (v !== undefined && v !== null && v !== false) seo[key] = String(v);
  }
  if (Object.keys(seo).length) f.seo = seo as SeoMeta;
  return f;
}

// Same merge as the admin's SEO modal: trimmed, empty values dropped,
// fields not given kept.
function mergeSeo(current: SeoMeta | undefined, patch: SeoMeta): SeoMeta {
  const next: Record<string, string> = { ...(current ?? {}) } as Record<string, string>;
  for (const [k, v] of Object.entries(patch)) {
    const t = String(v ?? "").trim();
    if (t) next[k] = t;
    else delete next[k];
  }
  return next as SeoMeta;
}

async function checkSlug(slug: string, type: TermType, terms: Term[], ignoreId?: string): Promise<void> {
  const { isValidSlug, detectTermSlugCollision } = await import("../../src/core/slug");
  if (!isValidSlug(slug)) throw new CliError("invalid-slug", `Invalid slug "${slug}".`, "Lower-case letters, digits and single dashes (e.g. travel-tips).", 2);
  const owner = detectTermSlugCollision({ type, slug }, terms, ignoreId);
  if (owner) throw new CliError("slug-taken", `The ${type} slug "${slug}" is already used by "${owner.label}".`, "Pick another --slug (or leave it out on create to get a unique one).", 2);
}

function resolveParent(ref: string, type: TermType, terms: Term[], self?: Term): string {
  if (type !== "category") throw new CliError("usage", "Only categories have a parent.", undefined, 2);
  const { findTerm } = requireCommon;
  const parent = findTerm(terms, ref, "category");
  if (!parent) throw new CliError("not-found", `No category "${ref}" to use as parent.`, "List them with `agentcms terms list --type category`.", 2);
  if (self) {
    // No cycles: the parent can't be the term itself or one of its descendants.
    let cur: Term | undefined = parent;
    for (let i = 0; cur && i < terms.length + 1; i++) {
      if (cur.id === self.id) throw new CliError("usage", `"${parent.name}" can't be the parent of "${self.name}" (cycle).`, undefined, 2);
      cur = cur.parentId ? terms.find((t) => t.id === cur!.parentId) : undefined;
    }
  }
  return parent.id;
}

// Loaded once in run() (static import would pull the admin in before
// the browser environment is installed).
let requireCommon: typeof import("../ops/adminCommon");

function multilangLanguages(settings: { enabledPlugins?: Record<string, boolean>; pluginConfigs?: Record<string, unknown> }): string[] | null {
  const cfg = settings.pluginConfigs?.["agentcms-multilang"] as { enabledLanguages?: unknown } | undefined;
  if (!cfg || settings.enabledPlugins?.["agentcms-multilang"] === false) return null;
  return Array.isArray(cfg.enabledLanguages) ? cfg.enabledLanguages.filter((l): l is string => typeof l === "string") : [];
}

async function run({ io, options, positionals }: CommandContext): Promise<number | void> {
  const [action, ref] = positionals;
  requireCommon = await import("../ops/adminCommon");
  const { runAdmin, requireTerm, findTerm, menuReferences, menuRemoveHints, menuLabelHints, reportStaleLinks, pathMoves } = requireCommon;
  const alias = options.site as string | undefined;
  const type = typeOption(options.type);

  switch (action) {
    case "list":
      return runAdmin(io, alias, {}, async () => {
        const [terms, all] = await Promise.all([freshTerms(), allEntries()]);
        const pool = type ? terms.filter((t) => t.type === type) : terms;
        return Promise.all(pool.map((t) => summarize(t, terms, all)));
      }, (rows) => (rows.length ? rows.map((r) => `${r.id}  ${r.type.padEnd(8)} ${r.slug.padEnd(24)} ${r.name}  (${r.posts} post${r.posts === 1 ? "" : "s"})`).join("\n") : "No terms."));

    case "get": {
      if (!ref) throw new CliError("usage", "terms get needs an id, slug or name.", undefined, 2);
      return runAdmin(io, alias, {}, async () => {
        const [terms, all] = await Promise.all([freshTerms(), allEntries()]);
        const t = requireTerm(terms, ref, type);
        return { ...(await summarize(t, terms, all)), usedBy: usage(t, all) };
      }, (r) => [`${r.name} (${r.type}, ${r.slug})${r.archivePath ? ` — archive ${r.archivePath}` : ""}`, ...r.usedBy.map((p) => `  ${p.primary ? "*" : " "} ${p.title} (${p.status})`)].join("\n"));
    }

    case "create": {
      if (!type) throw new CliError("usage", "terms create needs --type category|tag.", undefined, 2);
      const f = await readFields(options);
      const name = f.name?.trim();
      if (!name) throw new CliError("usage", "terms create needs --name.", undefined, 2);
      return runAdmin(io, alias, { write: true, lock: true }, async () => {
        const { slugify, findAvailableSlug, detectTermSlugCollision } = await import("../../src/core/slug");
        const { createTerm, updateTerm } = await import("../../src/services/taxonomies");
        const terms = await freshTerms();
        let slug = f.slug?.trim();
        if (slug) await checkSlug(slug, type, terms);
        else slug = findAvailableSlug(slugify(name) || "term", (s) => Boolean(detectTermSlugCollision({ type, slug: s }, terms)));
        const parentId = f.parent ? resolveParent(f.parent, type, terms) : undefined;
        const id = await createTerm({ type, name, slug, description: f.description?.trim() || undefined, parentId });
        if (f.seo) await updateTerm(id, { seo: mergeSeo(undefined, f.seo) });
        return {
          id,
          type,
          name,
          slug,
          archivePath: archivePath({ type, slug }),
          next: ["Nothing is published yet: the archive appears once a post of this category is published, or with `agentcms regenerate all`."],
        };
      }, (r) => `Created ${r.type} ${r.id} (${r.slug}).`);
    }

    case "update": {
      if (!ref) throw new CliError("usage", "terms update needs an id, slug or name.", undefined, 2);
      const f = await readFields(options);
      const lang = typeof options.lang === "string" ? options.lang.trim() : undefined;
      const remove = !!options.remove;
      const removeArchive = !!options["remove-archive"];
      const oldSlug = typeof options["old-slug"] === "string" ? options["old-slug"].trim() : undefined;
      if (remove && !lang) throw new CliError("usage", "--remove deletes a translation: it needs --lang.", undefined, 2);
      if (lang && (removeArchive || oldSlug !== undefined)) throw new CliError("usage", "--remove-archive / --old-slug don't go with --lang.", undefined, 2);
      return runAdmin(io, alias, { write: true, hosting: removeArchive, lock: true }, async (s) => {
        const { updateTerm } = await import("../../src/services/taxonomies");
        const { isValidSlug, slugify } = await import("../../src/core/slug");
        const terms = await freshTerms();
        const t = requireTerm(terms, ref, type);
        const next: string[] = [];
        if (lang) {
          // agentcms-multilang: translations[lang] = { name, slug, description, seo }.
          const langs = multilangLanguages(s.settings());
          if (langs === null) s.warnings.push("agentcms-multilang is not configured on this site: the translation is stored but nothing renders it.");
          else if (!langs.includes(lang)) s.warnings.push(`"${lang}" is not one of the site's enabled languages (${langs.join(", ") || "none"}): the translation is stored but not published.`);
          const current = { ...((t.translations ?? {}) as Record<string, Record<string, unknown>>) };
          if (remove) {
            if (!current[lang]) throw new CliError("not-found", `${t.name} has no ${lang} translation.`, undefined, 2);
            delete current[lang];
          } else {
            const tr: Record<string, unknown> = { slug: "", name: "", description: "", ...(current[lang] ?? {}) };
            if (f.name !== undefined) tr.name = f.name.trim();
            if (f.slug !== undefined) tr.slug = f.slug.trim();
            if (f.description !== undefined) tr.description = f.description.trim();
            if (f.seo) {
              const seo = mergeSeo(tr.seo as SeoMeta | undefined, f.seo);
              if (Object.keys(seo).length) tr.seo = seo;
              else delete tr.seo;
            }
            if (!tr.name) throw new CliError("usage", `The ${lang} translation needs a --name.`, undefined, 2);
            if (!tr.slug) tr.slug = slugify(String(tr.name));
            if (!isValidSlug(String(tr.slug))) throw new CliError("invalid-slug", `Invalid slug "${tr.slug}".`, "Lower-case letters, digits and single dashes.", 2);
            const clash = terms.find((x) => x.id !== t.id && x.type === t.type && ((x.translations?.[lang] as { slug?: string } | undefined)?.slug === tr.slug));
            if (clash) throw new CliError("slug-taken", `The ${lang} slug "${tr.slug}" is already used by "${clash.name}".`, "Pick another --slug.", 2);
            current[lang] = tr;
          }
          await updateTerm(t.id, { translations: current });
          next.push(t.type === "category" ? "Run `agentcms regenerate everything` to publish the translated archive and post URLs (and the plugin files that list them: sitemaps, RSS feeds, search index)." : "Run `agentcms regenerate everything` so the published pages and plugin files show the translated tag.");
          if (!remove && f.name !== undefined) {
            for (const m of menuLabelHints(s.settings(), "term", t.id, String(current[lang].name), s.site.alias, lang)) {
              next.push(`Menu item ${m.id} (${m.menu}) has ${m.label ? `the ${lang} label "${m.label}"` : `no ${lang} label`}: \`${m.fix}\`.`);
            }
          }
          return { id: t.id, type: t.type, lang, translation: remove ? null : current[lang], next };
        }
        const patch: Parameters<typeof updateTerm>[1] = {};
        if (f.name !== undefined) {
          if (!f.name.trim()) throw new CliError("usage", "--name can't be empty.", undefined, 2);
          patch.name = f.name.trim();
        }
        if (f.slug !== undefined && f.slug.trim() !== t.slug) {
          await checkSlug(f.slug.trim(), t.type, terms, t.id);
          patch.slug = f.slug.trim();
        }
        if (f.description !== undefined) patch.description = f.description.trim();
        if (f.parent !== undefined) patch.parentId = f.parent === "" ? "" : resolveParent(f.parent, t.type, terms, t);
        if (f.seo) patch.seo = mergeSeo(t.seo, f.seo);
        // The archive left behind by a slug change: this one, or an
        // earlier one named with --old-slug.
        let staleArchive: string | null = null;
        if (t.type === "category" && patch.slug) staleArchive = archivePath(t);
        else if (oldSlug !== undefined) {
          if (t.type !== "category") throw new CliError("usage", "--old-slug names an old category archive: tags have none.", undefined, 2);
          if (!isValidSlug(oldSlug)) throw new CliError("invalid-slug", `Invalid --old-slug "${oldSlug}".`, undefined, 2);
          const owner = terms.find((x) => x.type === "category" && x.slug === oldSlug);
          if (owner) throw new CliError("usage", `${oldSlug}/index.html is the live archive of "${owner.name}": nothing to remove.`, undefined, 2);
          staleArchive = `${oldSlug}/index.html`;
        }
        if (oldSlug !== undefined && !removeArchive) throw new CliError("usage", "--old-slug goes with --remove-archive.", undefined, 2);
        if (!Object.keys(patch).length && !(removeArchive && staleArchive)) {
          throw new CliError("usage", "Nothing to update.", "Pass --name, --slug, --description, --parent, --seo-title, --seo-description, --seo-image or --lang (or --remove-archive --old-slug <slug> to delete an old archive).", 2);
        }
        if (removeArchive && !staleArchive) throw new CliError("usage", "--remove-archive deletes the archive left by a slug change: pass a new --slug (or --old-slug <old slug>).", undefined, 2);
        // Where this category's online posts and archive move (on the
        // next `regenerate repair`), for the links stored in configs.
        const moves: PathMove[] = [];
        if (t.type === "category" && patch.slug) {
          const { buildPostUrl } = await import("../../src/core/slug");
          const renamed = { ...t, slug: patch.slug };
          for (const p of await allEntries()) {
            if (p.status !== "online" || p.primaryTermId !== t.id || !p.lastPublishedPath) continue;
            const to = buildPostUrl({ post: p, primaryTerm: renamed });
            if (to !== p.lastPublishedPath) moves.push({ from: p.lastPublishedPath, to });
          }
          moves.push({ from: archivePath(t)!, to: archivePath(renamed) });
        } else if (staleArchive) moves.push({ from: staleArchive, to: archivePath(t) });
        if (Object.keys(patch).length) await updateTerm(t.id, patch);
        let archiveRemoved = false;
        if (removeArchive && staleArchive) {
          const { deleteFile, withStorageBatch } = await import("../../src/services/siteFiles");
          // Explicit batch: on commit hostings a write outside one is only
          // committed after an idle delay — after this process exits.
          await withStorageBatch(() => deleteFile(staleArchive!));
          archiveRemoved = true;
        }
        const after = (await freshTerms()).find((x) => x.id === t.id)!;
        if (patch.slug && t.type === "category") {
          next.push("Run `agentcms regenerate repair` to move this category's posts to their new URLs, then `agentcms regenerate everything` so the archives, listings and plugin files (sitemaps, RSS feeds, search index) use the new URLs.");
          if (!archiveRemoved) next.push(`The old archive ${staleArchive} is still published: delete it with \`agentcms terms update ${after.slug} --type category --remove-archive --old-slug ${t.slug} --site ${s.site.alias}\` (or pass --remove-archive with --slug).`);
        } else if (Object.keys(patch).length) {
          next.push("Run `agentcms regenerate everything` so published pages and plugin files (sitemaps, RSS feeds, search index) show the change (saving a term republishes nothing).");
        }
        // Menu items keep their own label: say which ones no longer match.
        const menuLabels = patch.name ? menuLabelHints(s.settings(), "term", t.id, patch.name, s.site.alias) : [];
        for (const m of menuLabels) next.push(`Menu item "${m.label}" (${m.menu}) points to this ${t.type} under its old label: \`${m.fix}\`.`);
        const links = reportStaleLinks(s, moves);
        return { id: t.id, type: t.type, name: after.name, slug: after.slug, seo: after.seo ?? null, archivePath: archivePath(after), staleArchive, archiveRemoved, menuLabels, staleLinks: links, next };
      }, (r) => [`Updated ${r.type} ${r.id}${"lang" in r ? ` (${r.lang})` : ""}.`, ...r.next.map((n) => `  next: ${n}`)].join("\n"));
    }

    case "delete": {
      if (!ref) throw new CliError("usage", "terms delete needs an id, slug or name.", undefined, 2);
      const detach = !!options.detach;
      const removeArchive = !!options["remove-archive"];
      const moveToRef = typeof options["move-to"] === "string" ? options["move-to"].trim() : undefined;
      if (moveToRef !== undefined && detach) throw new CliError("usage", "--move-to and --detach don't go together: --move-to already removes the term from its posts.", undefined, 2);
      if (moveToRef === "") throw new CliError("usage", "--move-to needs a category (slug, name or id).", undefined, 2);
      const planOf = async () => {
        const [terms, all] = await Promise.all([freshTerms(), allEntries()]);
        const t = requireTerm(terms, ref, type);
        let moveTo: Term | undefined;
        if (moveToRef !== undefined) {
          if (t.type !== "category") throw new CliError("usage", "--move-to moves the posts of a deleted category: this is a tag.", "Use --detach to remove a tag from its posts.", 2);
          moveTo = findTerm(terms, moveToRef, "category");
          if (!moveTo) throw new CliError("not-found", `No category "${moveToRef}" to move the posts to.`, "List them with `agentcms terms list --type category`.", 2);
          if (moveTo.id === t.id) throw new CliError("usage", "--move-to must be another category than the one deleted.", undefined, 2);
        }
        const { buildPostUrl, detectPathCollision } = await import("../../src/core/slug");
        const remaining = terms.filter((x) => x.id !== t.id);
        // What happens to each post that uses the term: new term list,
        // new primary category, and (online ones) the URL it moves to.
        const changes = all
          .filter((p) => p.primaryTermId === t.id || p.termIds.includes(t.id))
          .map((p) => {
            const primary = p.primaryTermId === t.id;
            const newPrimary = primary ? moveTo?.id ?? null : p.primaryTermId ?? null;
            const termIds = p.termIds.filter((id) => id !== t.id);
            if (primary && moveTo && !termIds.includes(moveTo.id)) termIds.unshift(moveTo.id);
            const term = newPrimary ? remaining.find((x) => x.id === newPrimary) : undefined;
            const to = p.status === "online" && p.lastPublishedPath && p.type === "post" ? buildPostUrl({ post: p, primaryTerm: term }) : p.lastPublishedPath ?? null;
            return { post: p, primary, newPrimary, termIds, to };
          });
        const conflicts = moveTo
          ? changes
              .filter((c) => c.primary)
              .map((c) => {
                const path = buildPostUrl({ post: c.post, primaryTerm: moveTo });
                const owner = detectPathCollision(path, all.filter((p) => p.type === "post" && p.primaryTermId !== t.id), all.filter((p) => p.type === "page"), remaining, c.post.id);
                return owner ? { id: c.post.id, title: c.post.title, path, usedBy: `${owner.kind} "${owner.label}"` } : null;
              })
              .filter((x): x is NonNullable<typeof x> => !!x)
          : [];
        return { term: t, moveTo, changes, conflicts, usedBy: usage(t, all), archivePath: archivePath(t), children: terms.filter((x) => x.parentId === t.id).map((x) => x.slug) };
      };
      type Plan = Awaited<ReturnType<typeof planOf>>;
      const moveSummary = (p: Plan) =>
        p.moveTo
          ? {
              to: { id: p.moveTo.id, slug: p.moveTo.slug, name: p.moveTo.name },
              posts: p.changes.map((c) => ({
                id: c.post.id,
                title: c.post.title,
                status: c.post.status,
                change: c.primary ? `category → ${p.moveTo!.slug}` : `loses the ${p.term.type}`,
                ...(c.post.status === "online" ? { from: c.post.lastPublishedPath ?? null, to: c.to } : {}),
              })),
              republish: p.changes.filter((c) => c.post.status === "online").length,
              conflicts: p.conflicts,
            }
          : null;
      // Menu items that point to the deleted term: retarget (with
      // --move-to) or remove.
      const menuHints = (alias: string, p: Plan, items: ReturnType<typeof menuReferences>) =>
        p.moveTo
          ? items.map((m) => `Menu item "${m.label}" (${m.menu}) still points to the deleted ${p.term.type}: \`agentcms menus update ${m.id} --menu ${m.menu} --category ${p.moveTo!.slug} --site ${alias}\` (or \`agentcms menus remove ${m.id} --menu ${m.menu} --site ${alias}\`).`)
          : menuRemoveHints(alias, items);
      if (!options.yes) {
        return runAdmin(io, alias, {}, async (s) => {
          const p = await planOf();
          const menuItems = menuReferences(s.settings(), "term", [p.term.id]);
          const move = moveSummary(p);
          return {
            needsConfirmation: true,
            delete: { id: p.term.id, type: p.term.type, name: p.term.name, slug: p.term.slug },
            usedBy: p.usedBy,
            archivePath: p.archivePath,
            children: p.children,
            menuItems,
            detach,
            move,
            removeArchive,
            notes: [
              p.usedBy.length
                ? move
                  ? `${move.posts.filter((x) => x.change.startsWith("category")).length} post(s) move to "${move.to.name}", the others lose the ${p.term.type}; ${move.republish} online post(s) will be republished (bulk mode, one storage batch).`
                  : detach
                    ? `${p.usedBy.length} post(s) will lose this ${p.term.type} (--detach).`
                    : `${p.usedBy.length} post(s) keep a reference to the deleted ${p.term.type}; add --detach to remove it from them${p.term.type === "category" ? ", or --move-to <category> to move them" : ""}.`
                : "No post uses it.",
              ...(p.conflicts.length ? [`Blocked: ${p.conflicts.map((c) => `${c.path} (${c.title}) is already used by ${c.usedBy}`).join("; ")} — rename those posts first or pick another --move-to.`] : []),
              ...menuHints(s.site.alias, p, menuItems),
              ...(p.archivePath ? [removeArchive ? `${p.archivePath} will be deleted from the site.` : `${p.archivePath} stays published; add --remove-archive to delete it.`] : []),
            ],
          };
        }, (r) => `Would delete ${r.delete.type} "${r.delete.name}". ${r.notes.join(" ")} Nothing changed — re-run with --yes once the user agrees.`);
      }
      const publishes = moveToRef !== undefined;
      return runAdmin(io, alias, { write: true, hosting: removeArchive || publishes, extensions: publishes, lock: true }, async (s) => {
        const p = await planOf();
        if (p.conflicts.length) {
          throw new CliError("slug-taken", `Moving to "${p.moveTo!.name}" would overwrite: ${p.conflicts.map((c) => `${c.path} (${c.usedBy})`).join(", ")}.`, "Rename those posts (`agentcms content update <id> --slug …`) or pick another --move-to. Nothing changed.", 2);
        }
        const menuItems = menuReferences(s.settings(), "term", [p.term.id]);
        const { updatePost } = await import("../../src/services/posts");
        const { deleteTerm } = await import("../../src/services/taxonomies");
        const before = await allEntries();
        const detached: string[] = [];
        const moved: string[] = [];
        if (detach || p.moveTo) {
          for (const c of p.changes) {
            await updatePost(c.post.id, {
              termIds: c.termIds,
              ...(c.primary ? { primaryTermId: c.newPrimary } : {}),
            });
            if (p.moveTo && c.primary) moved.push(c.post.id);
            else detached.push(c.post.id);
          }
        }
        await deleteTerm(p.term.id);
        const { deleteFile, withStorageBatch } = await import("../../src/services/siteFiles");
        let archiveRemoved = false;
        const republished: Array<{ id: string; title: string; ok: boolean; path?: string | null; error?: string }> = [];
        const online = p.changes.filter((c) => c.post.status === "online");
        // Explicit batch: one commit on git hostings, and a write outside
        // one would only be committed after an idle delay — after this
        // process exits.
        await withStorageBatch(async () => {
          if (removeArchive && p.archivePath) {
            await deleteFile(p.archivePath);
            archiveRemoved = true;
          }
          if (p.moveTo && online.length) {
            // `content publish a b c`: the admin's bulk mode — per-entry
            // publish (stale paths cleaned by publishPost), then ONE
            // cascade and every plugin regeneration target.
            const pub = s.host.publisher;
            const ctx = await s.context({ refreshTerms: true });
            ctx.bulkMode = true;
            for (const c of online) {
              try {
                await pub.publishPost(c.post.id, ctx, s.log);
                republished.push({ id: c.post.id, title: c.post.title, ok: true });
              } catch (err) {
                republished.push({ id: c.post.id, title: c.post.title, ok: false, error: (err as Error).message });
              }
            }
            const { listRegenerationTargets } = await import("../../src/core/regenerationTargetRegistry");
            await pub.flushBulkRegeneration(ctx, s.log, listRegenerationTargets());
          }
        });
        const after = await allEntries();
        for (const r of republished) r.path = after.find((x) => x.id === r.id)?.lastPublishedPath ?? null;
        const next: string[] = [];
        // Posts whose primary category is gone move to the root on the
        // next repair (with or without --detach).
        const rootBound = p.moveTo ? [] : p.changes.filter((c) => c.post.status === "online" && c.primary);
        if (rootBound.length) next.push(`Run \`agentcms regenerate repair\` — ${rootBound.length} online post(s) lost their category, so their URL changes.`);
        if (!p.moveTo || !online.length) next.push(`Run \`agentcms regenerate everything\` so the archives, listings and plugin files (sitemaps, RSS feeds, search index) stop listing the deleted ${p.term.type}.`);
        next.push(...menuHints(s.site.alias, p, menuItems));
        if (p.archivePath && !archiveRemoved) next.push(`${p.archivePath} is still published (re-run with --remove-archive, or delete it by hand).`);
        // Links stored in configs to the archive or the moved posts.
        const moves: PathMove[] = p.moveTo ? pathMoves(before, after) : rootBound.filter((c) => c.to && c.to !== c.post.lastPublishedPath).map((c) => ({ from: c.post.lastPublishedPath!, to: c.to }));
        if (p.archivePath) moves.push({ from: p.archivePath, to: p.moveTo ? archivePath(p.moveTo) : null });
        const links = reportStaleLinks(s, moves);
        return {
          deleted: { id: p.term.id, type: p.term.type, name: p.term.name, slug: p.term.slug },
          detached,
          moved,
          movedTo: p.moveTo ? { id: p.moveTo.id, slug: p.moveTo.slug, name: p.moveTo.name } : null,
          republished,
          stillReferencedBy: detach || p.moveTo ? [] : p.usedBy,
          archivePath: p.archivePath,
          archiveRemoved,
          orphanChildren: p.children,
          menuItems,
          staleLinks: links,
          next,
        };
      }, (r) => [`Deleted ${r.deleted.type} "${r.deleted.name}"${r.movedTo ? ` — ${r.moved.length} post(s) moved to "${r.movedTo.name}"` : ""}.`, ...r.next.map((n) => `  next: ${n}`)].join("\n"));
    }

    default:
      throw new CliError("usage", action ? `Unknown terms action "${action}".` : "terms needs an action.", "Actions: list, get, create, update, delete.", 2);
  }
}

export const termsCommand: Command = {
  name: "terms",
  summary:
    "Categories and tags, like the admin's Categories & Tags page: list, get <ref>, create (--type, --name; slug from the name when omitted), update <ref> (name, slug, description, parent, SEO; --remove-archive with a new --slug deletes the old archive, --remove-archive --old-slug <s> one left by an earlier rename; --lang <code> edits the agentcms-multilang translation, --remove drops it), delete <ref> (plan first, --yes; --move-to <category> moves its posts there and republishes the online ones, --detach removes it from its posts, --remove-archive deletes the published archive). Saving a term republishes nothing: run the `next` regeneration; `next` also names menu items whose label no longer matches and warnings name config links to moved pages.",
  usage:
    "terms <list|get|create|update|delete> [<id|slug|name>] --site <alias> [--type category|tag] [--name <n>] [--slug <s>] [--description <t>|@file] [--parent <category>] [--seo-title <t>] [--seo-description <t>] [--seo-image <url>] [--data <json>|@file] [--lang <code>] [--remove] [--remove-archive] [--old-slug <s>] [--detach] [--move-to <category>] [--yes]",
  options: [
    { name: "site", type: "string", description: "Site alias." },
    { name: "type", type: "string", description: "category or tag (required on create; filters list / disambiguates refs)." },
    { name: "name", type: "string", description: "Name (with --lang: the translated name)." },
    { name: "slug", type: "string", description: "Slug (create: default from the name, made unique; with --lang: the translated slug)." },
    { name: "description", type: "string", description: "Description (\"\" clears it)." },
    { name: "parent", type: "string", description: "Parent category (slug, name or id; \"\" removes it). Categories only." },
    { name: "seo-title", type: "string", description: "Archive <title> (\"\" clears it)." },
    { name: "seo-description", type: "string", description: "Archive meta description (\"\" clears it)." },
    { name: "seo-image", type: "string", description: "Archive og:image URL (\"\" clears it)." },
    { name: "data", type: "string", description: "Fields as JSON (or @file.json): name, slug, description, parent, seo{title,description,ogImage}. Flags override it." },
    { name: "lang", type: "string", description: "update: edit translations[<lang>] (agentcms-multilang) instead of the main fields." },
    { name: "remove", type: "boolean", description: "update --lang: delete that translation." },
    { name: "detach", type: "boolean", description: "delete: also remove the term from the posts that use it." },
    { name: "move-to", type: "string", description: "delete (categories): give its posts this category instead (slug, name or id); online ones are republished in bulk mode. Not with --detach." },
    { name: "remove-archive", type: "boolean", description: "delete: also delete the category's published archive (<slug>/index.html). update: delete the archive the slug change leaves behind (with --slug, or --old-slug)." },
    { name: "old-slug", type: "string", description: "update --remove-archive: the slug of an earlier rename whose archive (<old-slug>/index.html) is still published." },
    { name: "yes", type: "boolean", description: "delete: apply (otherwise only the plan)." },
  ],
  run,
};
