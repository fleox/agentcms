import { mkdirSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import type { Post, SeoMeta, Term } from "../../src/core/types";
import { CliError } from "../output";
import type { Command, CommandContext } from "./types";

// `agentcms content …` — posts and pages, exactly like the admin's
// editor and lists: create (draft), update (an online entry is
// republished, as "Save" does), publish / unpublish / delete (one or
// many — several use the admin's bulk mode: one cascade at the end),
// preview (the editor's Preview, as an HTML file).

type Kind = "post" | "page";

function kindOption(v: unknown, fallback?: Kind): Kind | undefined {
  if (v === undefined) return fallback;
  if (v === "post" || v === "page") return v;
  throw new CliError("usage", `--type is post or page (got "${String(v)}").`, undefined, 2);
}

async function allEntries(): Promise<Post[]> {
  const { fetchAllPosts, invalidateAllPostsCache } = await import("../../src/services/posts");
  invalidateAllPostsCache();
  const [posts, pages] = await Promise.all([fetchAllPosts({ type: "post" }), fetchAllPosts({ type: "page" })]);
  return [...posts, ...pages];
}

async function summarize(p: Post, terms: Term[]) {
  const { iso } = await import("../ops/adminCommon");
  const cat = p.primaryTermId ? terms.find((t) => t.id === p.primaryTermId) : undefined;
  return {
    id: p.id,
    type: p.type,
    title: p.title,
    slug: p.slug,
    status: p.status,
    category: cat ? cat.slug : null,
    tags: p.termIds.map((id) => terms.find((t) => t.id === id)).filter((t): t is Term => !!t && t.type === "tag").map((t) => t.slug),
    path: p.lastPublishedPath ?? null,
    // Translations (agentcms-multilang): published path per language.
    ...(p.lastPublishedPathsByLocale && Object.keys(p.lastPublishedPathsByLocale).length ? { localePaths: p.lastPublishedPathsByLocale } : {}),
    updatedAt: iso(p.updatedAt),
    publishedAt: iso(p.publishedAt),
  };
}

// Fields an agent can set, from flags and/or --data JSON (flags win).
interface EntryFields {
  title?: string;
  slug?: string;
  body?: string;
  excerpt?: string | null;
  category?: string | null;
  tags?: string[];
  hero?: string | null;
  author?: string;
  seo?: SeoMeta;
  createdAt?: Date;
  publishedAt?: Date;
}

async function readFields(options: CommandContext["options"]): Promise<EntryFields> {
  const { readTextOption, readJsonOption, listOption, dateOption } = await import("../ops/adminCommon");
  const data = (readJsonOption(options.data, "data") ?? {}) as Record<string, unknown>;
  if (typeof data !== "object" || Array.isArray(data)) throw new CliError("usage", "--data must be a JSON object.", undefined, 2);
  const str = (v: unknown) => (typeof v === "string" ? v : undefined);
  const f: EntryFields = {
    title: str(options.title) ?? str(data.title),
    slug: str(options.slug) ?? str(data.slug),
    body: readTextOption(options.body, "body") ?? str(data.body) ?? str(data.contentMarkdown),
    author: str(options.author) ?? str(data.author) ?? str(data.authorId),
  };
  const excerpt = options.excerpt !== undefined ? String(options.excerpt) : data.excerpt;
  if (excerpt !== undefined) f.excerpt = excerpt === null || excerpt === "" ? null : String(excerpt);
  const category = options.category !== undefined ? String(options.category) : data.category;
  if (category !== undefined) f.category = category === null || category === "" ? null : String(category);
  const tags = listOption(options.tags) ?? (Array.isArray(data.tags) ? data.tags.map(String) : undefined);
  if (tags) f.tags = tags;
  const hero = options.hero !== undefined ? String(options.hero) : data.hero ?? data.heroMediaId;
  if (hero !== undefined) f.hero = hero === null || hero === "" ? null : String(hero);
  const seo: SeoMeta = { ...((data.seo as SeoMeta) ?? {}) };
  if (options["seo-title"] !== undefined) seo.title = String(options["seo-title"]);
  if (options["seo-description"] !== undefined) seo.description = String(options["seo-description"]);
  if (options["seo-image"] !== undefined) seo.ogImage = String(options["seo-image"]);
  if (Object.keys(seo).length) f.seo = Object.fromEntries(Object.entries(seo).filter(([, v]) => v !== "" && v != null)) as SeoMeta;
  f.createdAt = dateOption(options["created-at"] ?? data.createdAt, "created-at");
  f.publishedAt = dateOption(options["published-at"] ?? data.publishedAt, "published-at");
  return f;
}

// Category + tags → { primaryTermId, termIds }; creates missing tags
// (and categories) only with --create-terms.
async function resolveTerms(f: EntryFields, existing: Post | null, createMissing: boolean, type: Kind) {
  const { fetchAllTerms, createTerm } = await import("../../src/services/taxonomies");
  const { findTerm } = await import("../ops/adminCommon");
  const { slugify, findAvailableSlug } = await import("../../src/core/slug");
  let terms = await fetchAllTerms();
  const createdTerms: Array<{ type: "category" | "tag"; name: string; slug: string }> = [];
  const ensure = async (ref: string, t: "category" | "tag"): Promise<Term> => {
    const found = findTerm(terms, ref, t);
    if (found) return found;
    if (!createMissing) {
      throw new CliError("not-found", `No ${t} "${ref}".`, `Create it (\`agentcms terms create --type ${t} --name "${ref}"\`) or pass --create-terms.`, 2);
    }
    const base = slugify(ref) || t;
    const slug = findAvailableSlug(base, (s) => terms.some((x) => x.type === t && x.slug === s));
    await createTerm({ type: t, name: ref, slug });
    createdTerms.push({ type: t, name: ref, slug });
    terms = await fetchAllTerms();
    return findTerm(terms, slug, t)!;
  };
  if (type === "page" && (f.category || (f.tags && f.tags.length))) {
    throw new CliError("usage", "Pages have no category or tags.", undefined, 2);
  }
  let primary = existing?.primaryTermId ?? undefined;
  let tagIds = (existing?.termIds ?? []).filter((id) => terms.find((t) => t.id === id)?.type === "tag");
  if (f.category !== undefined) primary = f.category === null ? undefined : (await ensure(f.category, "category")).id;
  if (f.tags !== undefined) {
    tagIds = [];
    for (const tag of f.tags) tagIds.push((await ensure(tag, "tag")).id);
  }
  const termIds = primary ? [primary, ...tagIds.filter((id) => id !== primary)] : tagIds;
  return { primaryTermId: primary, termIds, terms, createdTerms };
}

async function checkSlug(slug: string, type: Kind, primaryTermId: string | undefined, ignoreId: string | undefined, all: Post[], terms: Term[]): Promise<void> {
  const { isValidSlug, buildPostUrl, detectPathCollision } = await import("../../src/core/slug");
  if (!isValidSlug(slug)) throw new CliError("invalid-slug", `Invalid slug "${slug}".`, "Lower-case letters, digits and single dashes (e.g. my-post).", 2);
  const term = primaryTermId ? terms.find((t) => t.id === primaryTermId) : undefined;
  const path = buildPostUrl({ post: { type, slug }, primaryTerm: term });
  const owner = detectPathCollision(path, all.filter((p) => p.type === "post"), all.filter((p) => p.type === "page"), terms, ignoreId);
  if (owner) throw new CliError("slug-taken", `${path} is already used by ${owner.kind} "${owner.label}".`, "Pick another --slug.", 2);
}

async function resolveMediaId(ref: string): Promise<string> {
  const { listAllMedia } = await import("../../src/services/media");
  const media = await listAllMedia();
  const m = media.find((x) => x.id === ref) ?? media.find((x) => x.name === ref);
  if (!m) throw new CliError("not-found", `No media "${ref}".`, "Upload it first (`agentcms media upload <file>`) and use its id.", 2);
  return m.id;
}

async function resolveAuthor(ref: string): Promise<string> {
  const { subscribeToUsers } = await import("../../src/services/users");
  const users = await new Promise<Array<{ id: string; email: string }>>((res, rej) => {
    const un = subscribeToUsers((u) => {
      res(u);
      queueMicrotask(() => un());
    }, rej);
  });
  const u = users.find((x) => x.id === ref) ?? users.find((x) => x.email?.toLowerCase() === ref.toLowerCase());
  if (!u) throw new CliError("not-found", `No user "${ref}".`, "List them with `agentcms users list`.", 2);
  return u.id;
}

// Block attributes are UTF-8 JSON in base64 (data-attrs), the
// convention of every AgentCMS block.
function decodeB64Json(v: string): unknown {
  try {
    return JSON.parse(Buffer.from(v, "base64").toString("utf8"));
  } catch {
    return null;
  }
}
function encodeB64Json(v: unknown): string {
  return Buffer.from(JSON.stringify(v), "utf8").toString("base64");
}
async function run({ io, options, positionals }: CommandContext): Promise<number | void> {
  const [action, ...refs] = positionals;
  const { runAdmin, findPost, currentUserId, menuReferences, menuRemoveHints, pathMoves, reportStaleLinks } = await import("../ops/adminCommon");
  const alias = options.site as string | undefined;
  const type = kindOption(options.type);

  switch (action) {
    case "list":
      return runAdmin(io, alias, {}, async () => {
        const terms = await (await import("../../src/services/taxonomies")).fetchAllTerms();
        let all = await allEntries();
        if (type) all = all.filter((p) => p.type === type);
        if (options.status) all = all.filter((p) => p.status === options.status);
        if (options.category) {
          const { requireTerm } = await import("../ops/adminCommon");
          const cat = requireTerm(terms, String(options.category), "category");
          all = all.filter((p) => p.primaryTermId === cat.id);
        }
        if (options.search) {
          const tokens = String(options.search).toLowerCase().split(/\s+/).filter(Boolean);
          all = all.filter((p) => tokens.every((t) => `${p.title} ${p.slug} ${p.excerpt ?? ""}`.toLowerCase().includes(t)));
        }
        return Promise.all(all.map((p) => summarize(p, terms)));
      }, (rows) => (rows.length ? rows.map((r) => `${r.id}  ${r.type.padEnd(4)} ${r.status.padEnd(6)} ${r.title}${r.path ? `  → ${r.path}` : ""}`).join("\n") : "No entries."));

    case "get": {
      if (!refs[0]) throw new CliError("usage", "content get needs an id or slug.", undefined, 2);
      return runAdmin(io, alias, {}, async () => {
        const terms = await (await import("../../src/services/taxonomies")).fetchAllTerms();
        const p = findPost(await allEntries(), refs[0], type);
        const { iso } = await import("../ops/adminCommon");
        return {
          ...(await summarize(p, terms)),
          excerpt: p.excerpt ?? null,
          heroMediaId: p.heroMediaId ?? null,
          authorId: p.authorId,
          seo: p.seo ?? null,
          createdAt: iso(p.createdAt),
          translations: p.translations ?? null,
          body: p.contentMarkdown,
        };
      }, (r) => `${r.title} (${r.type}, ${r.status})\n\n${r.body}`);
    }

    case "create": {
      const kind = kindOption(options.type, "post")!;
      const f = await readFields(options);
      if (!f.title) throw new CliError("usage", "content create needs --title.", undefined, 2);
      return runAdmin(io, alias, { write: true, hosting: !!options.publish, extensions: !!options.publish, lock: true }, async (s) => {
        const { slugify, findAvailableSlug, buildPostUrl } = await import("../../src/core/slug");
        const all = await allEntries();
        const { primaryTermId, termIds, terms, createdTerms } = await resolveTerms(f, null, !!options["create-terms"], kind);
        let slug = f.slug;
        if (slug) await checkSlug(slug, kind, primaryTermId, undefined, all, terms);
        else {
          // Like the editor's auto-slug: deduplicated silently.
          const term = primaryTermId ? terms.find((t) => t.id === primaryTermId) : undefined;
          const { detectPathCollision } = await import("../../src/core/slug");
          slug = findAvailableSlug(slugify(f.title!) || kind, (cand) =>
            !!detectPathCollision(buildPostUrl({ post: { type: kind, slug: cand }, primaryTerm: term }), all.filter((p) => p.type === "post"), all.filter((p) => p.type === "page"), terms),
          );
        }
        const { createPost } = await import("../../src/services/posts");
        const id = await createPost({
          type: kind,
          title: f.title!,
          slug,
          contentMarkdown: f.body ?? "",
          excerpt: f.excerpt ?? undefined,
          heroMediaId: f.hero ? await resolveMediaId(f.hero) : undefined,
          authorId: f.author ? await resolveAuthor(f.author) : await currentUserId(),
          termIds,
          primaryTermId,
          seo: f.seo,
          createdAt: f.createdAt,
          publishedAt: f.publishedAt,
        });
        let published: string | null = null;
        if (options.publish) {
          const ctx = await s.context();
          await s.host.publisher.publishPost(id, ctx, s.log, f.publishedAt ? { publishedAt: f.publishedAt } : undefined);
          published = (await allEntries()).find((p) => p.id === id)?.lastPublishedPath ?? null;
        }
        return { id, type: kind, slug, status: options.publish ? "online" : "draft", path: published, createdTerms };
      }, (r) => `Created ${r.type} ${r.id} (${r.slug}) — ${r.status}${r.path ? ` at ${r.path}` : ""}`);
    }

    case "update": {
      if (!refs[0]) throw new CliError("usage", "content update needs an id or slug.", undefined, 2);
      const f = await readFields(options);
      const lang = options.lang as string | undefined;
      return runAdmin(io, alias, { write: true, hosting: true, extensions: true, lock: true }, async (s) => {
        const all = await allEntries();
        const p = findPost(all, refs[0], type);
        const { updatePost } = await import("../../src/services/posts");
        let createdTerms: Array<{ type: "category" | "tag"; name: string; slug: string }> = [];
        if (lang) {
          // A translation (agentcms-multilang): post.translations[lang].
          const tr = { ...((p.translations?.[lang] as Record<string, unknown>) ?? {}) };
          if (f.title !== undefined) tr.title = f.title;
          if (f.slug !== undefined) tr.slug = f.slug;
          if (f.body !== undefined) tr.contentMarkdown = f.body;
          if (f.excerpt !== undefined) tr.excerpt = f.excerpt ?? undefined;
          if (f.seo !== undefined) tr.seo = f.seo;
          if (!tr.title) throw new CliError("usage", `The ${lang} translation needs a --title.`, undefined, 2);
          const { isValidSlug, slugify } = await import("../../src/core/slug");
          if (!tr.slug) tr.slug = slugify(String(tr.title));
          if (!isValidSlug(String(tr.slug))) throw new CliError("invalid-slug", `Invalid slug "${tr.slug}".`, undefined, 2);
          await updatePost(p.id, { translations: { ...(p.translations ?? {}), [lang]: tr } });
        } else {
          const resolved = await resolveTerms(f, p, !!options["create-terms"], p.type);
          createdTerms = resolved.createdTerms;
          const { primaryTermId, termIds, terms } = resolved;
          const slug = f.slug ?? p.slug;
          if (f.slug !== undefined || f.category !== undefined) await checkSlug(slug, p.type, primaryTermId, p.id, all, terms);
          await updatePost(p.id, {
            title: f.title,
            slug: f.slug,
            contentMarkdown: f.body,
            excerpt: f.excerpt,
            heroMediaId: f.hero === undefined ? undefined : f.hero === null ? null : await resolveMediaId(f.hero),
            termIds: f.category !== undefined || f.tags !== undefined ? termIds : undefined,
            primaryTermId: f.category !== undefined ? primaryTermId ?? null : undefined,
            seo: f.seo ? { ...(p.seo ?? {}), ...f.seo } : undefined,
            authorId: f.author ? await resolveAuthor(f.author) : undefined,
            createdAt: f.createdAt,
            publishedAt: f.publishedAt,
          });
        }
        // Like the editor's Save: an online entry is republished.
        let republished = false;
        if (p.status === "online" && !options["no-publish"]) {
          const ctx = await s.context();
          await s.host.publisher.publishPost(p.id, ctx, s.log, f.publishedAt && !lang ? { publishedAt: f.publishedAt } : undefined);
          republished = true;
        }
        const fresh = await allEntries();
        const after = fresh.find((x) => x.id === p.id)!;
        // Links stored in theme / plugin configs and menu URLs don't follow
        // a page that moved: name them, with the command that fixes each.
        const staleLinks = reportStaleLinks(s, pathMoves([p], fresh));
        return { id: p.id, type: p.type, status: after.status, republished, path: after.lastPublishedPath ?? null, localePaths: after.lastPublishedPathsByLocale ?? {}, lang: lang ?? null, createdTerms, staleLinks };
      }, (r) => `Updated ${r.type} ${r.id}${r.lang ? ` (${r.lang})` : ""}${r.republished ? ` — republished at ${r.path}` : ""}`);
    }

    case "publish":
    case "unpublish": {
      if (!refs.length) throw new CliError("usage", `content ${action} needs one or more ids / slugs.`, undefined, 2);
      return runAdmin(io, alias, { write: true, hosting: true, extensions: true, lock: true }, async (s) => {
        const all = await allEntries();
        const targets = refs.map((r) => findPost(all, r, type));
        const ctx = await s.context();
        const pub = s.host.publisher;
        const done: Array<{ id: string; title: string; ok: boolean; error?: string }> = [];
        const one = async (p: Post) => {
          try {
            if (action === "publish") await pub.publishPost(p.id, ctx, s.log, options["published-at"] ? { publishedAt: new Date(String(options["published-at"])) } : undefined);
            else await pub.unpublishPost(p.id, ctx, s.log);
            done.push({ id: p.id, title: p.title, ok: true });
          } catch (err) {
            done.push({ id: p.id, title: p.title, ok: false, error: (err as Error).message });
          }
        };
        if (targets.length === 1) await one(targets[0]);
        else {
          // The admin's bulk mode: per-entry work, then ONE cascade and
          // every plugin regeneration target — in one storage batch (one
          // commit on git hostings).
          const { withStorageBatch } = await import("../../src/services/siteFiles");
          await withStorageBatch(async () => {
            ctx.bulkMode = true;
            for (const p of targets) await one(p);
            const { listRegenerationTargets } = await import("../../src/core/regenerationTargetRegistry");
            await pub.flushBulkRegeneration(ctx, s.log, listRegenerationTargets());
          });
        }
        const fresh = await allEntries();
        reportStaleLinks(s, pathMoves(targets, fresh));
        return done.map((d) => {
          const p = fresh.find((x) => x.id === d.id);
          return { ...d, status: p?.status, path: p?.lastPublishedPath ?? null, localePaths: p?.lastPublishedPathsByLocale ?? {} };
        });
      }, (rows) => rows.map((r) => `${r.ok ? "✓" : "✗"} ${r.title} — ${r.ok ? r.status + (r.path ? ` at ${r.path}` : "") : r.error}`).join("\n"));
    }

    case "delete": {
      if (!refs.length) throw new CliError("usage", "content delete needs one or more ids / slugs.", undefined, 2);
      if (!options.yes) {
        return runAdmin(io, alias, {}, async (s) => {
          const all = await allEntries();
          const targets = refs.map((r) => findPost(all, r, type));
          const menuItems = menuReferences(s.settings(), "post", targets.map((p) => p.id));
          return {
            needsConfirmation: true,
            delete: targets.map((p) => ({ id: p.id, type: p.type, title: p.title, status: p.status, path: p.lastPublishedPath ?? null })),
            menuItems,
            notes: menuRemoveHints(s.site.alias, menuItems),
          };
        }, (r) => [`Would delete ${r.delete.length} entr${r.delete.length === 1 ? "y" : "ies"}: ${r.delete.map((d) => d.title).join(", ")} (published files removed too).`, ...r.notes, "Nothing changed — re-run with --yes once the user agrees."].join(" "));
      }
      return runAdmin(io, alias, { write: true, hosting: true, extensions: true, lock: true }, async (s) => {
        const all = await allEntries();
        const targets = refs.map((r) => findPost(all, r, type));
        const ctx = await s.context();
        const { deletePost } = await import("../../src/services/posts");
        const many = targets.length > 1;
        if (many) ctx.bulkMode = true;
        const out: Array<{ id: string; title: string; ok: boolean; removedPaths?: string[]; error?: string }> = [];
        for (const p of targets) {
          try {
            await s.host.publisher.deletePostAndUnpublish(p.id, ctx, s.log);
            await deletePost(p.id);
            const removedPaths = [p.lastPublishedPath, ...(p.previousPublishedPaths ?? []), ...Object.values(p.lastPublishedPathsByLocale ?? {})].filter((x): x is string => !!x);
            out.push({ id: p.id, title: p.title, ok: true, removedPaths });
          } catch (err) {
            out.push({ id: p.id, title: p.title, ok: false, error: (err as Error).message });
          }
        }
        if (many) {
          const { listRegenerationTargets } = await import("../../src/core/regenerationTargetRegistry");
          await s.host.publisher.flushBulkRegeneration(ctx, s.log, listRegenerationTargets());
        }
        reportStaleLinks(s, pathMoves(targets.filter((p) => out.some((o) => o.id === p.id && o.ok)), await allEntries()));
        return out;
      }, (rows) => rows.map((r) => `${r.ok ? "✓ deleted" : "✗"} ${r.title}${r.error ? ` — ${r.error}` : ""}`).join("\n"));
    }

    case "preview": {
      if (!refs[0]) throw new CliError("usage", "content preview needs an id or slug.", undefined, 2);
      // Default: a temp folder, not the current directory (the
      // screenshots go next to the file, in .screenshots/).
      const out = resolve(
        options.out !== undefined
          ? String(options.out)
          : join(tmpdir(), "agentcms-preview", `preview-${refs[0].replace(/[^a-z0-9-]/gi, "_")}.html`),
      );
      return runAdmin(io, alias, { extensions: true }, async (s) => {
        const all = await allEntries();
        const p = findPost(all, refs[0], type);
        // Unsaved changes can be previewed too: same flags as update.
        const f = await readFields(options);
        const draft: Post = {
          ...p,
          ...(f.title !== undefined ? { title: f.title } : {}),
          ...(f.body !== undefined ? { contentMarkdown: f.body } : {}),
          ...(f.excerpt !== undefined ? { excerpt: f.excerpt ?? undefined } : {}),
        };
        const { renderPostPreview } = await import("../../src/services/previewRenderer");
        const [terms, users, media] = await Promise.all([s.terms(), s.users(), s.media()]);
        const html = await renderPostPreview({
          draft,
          posts: all.filter((x) => x.type === "post"),
          pages: all.filter((x) => x.type === "page"),
          terms,
          media,
          settings: s.settings(),
          users,
          authorLookup: s.host.users.buildAuthorLookup(users, media),
        } as Parameters<typeof renderPostPreview>[0]);
        // Opened from disk, the page's root paths (/theme-assets/…, media)
        // would point at file:///: resolve them against the public site.
        const siteUrl = (s.settings().baseUrl || s.site.siteUrl || "").replace(/\/+$/, "");
        const file = siteUrl && !/<base\s/i.test(html) ? html.replace(/<head([^>]*)>/i, `<head$1><base href="${siteUrl}/">`) : html;
        mkdirSync(dirname(out), { recursive: true });
        writeFileSync(out, file);
        let screenshots: Awaited<ReturnType<typeof import("../ops/extScreenshot").screenshotFile>> | null = null;
        if (options.screenshots) {
          const m = await import("../ops/extScreenshot");
          screenshots = await m.screenshotFile(out);
          // Absolute PNG paths (they sit in .screenshots/ next to the file).
          screenshots = { ...screenshots, shots: screenshots.shots.map((sh) => ({ ...sh, file: resolve(sh.file) })) };
        }
        return {
          id: p.id,
          file: out,
          bytes: file.length,
          screenshotsDir: options.screenshots ? join(dirname(out), ".screenshots") : null,
          screenshots,
          note: "Styles, images and the logo load from the live site; menus and other runtime widgets may stay empty in a file preview (the browser blocks their requests from file://). Check the published page with `agentcms site screenshot <path>`.",
        };
      }, (r) => [`Preview of ${r.id}: ${r.file}`, ...(r.screenshots?.shots ?? []).map((sh) => `  ${sh.viewport}: ${sh.file}`), ...(r.screenshots?.errors ?? []).map((e) => `  screenshot error: ${e}`)].join("\n"));
    }

    case "blocks": {
      // Every editor block this site offers (core, plugins, active theme),
      // inserted with its defaults in a headless editor like the admin's:
      // the exact Markdown to put in a body, with its attributes decoded.
      return runAdmin(io, alias, { extensions: true }, async (s) => {
        const { tryBlocks } = await import("../ops/extBlocks");
        const all = s.host.blocks.listBlocks();
        const wanted = refs[0] ? all.filter((b) => b.id === refs[0]) : all;
        if (refs[0] && !wanted.length) throw new CliError("not-found", `No block "${refs[0]}" on this site.`, "List them with `agentcms content blocks`.", 2);
        const harbor = (await s.media())[0];
        const trials = await tryBlocks(wanted, harbor ? { id: harbor.id, url: s.host.cmsRuntime.pickMediaUrl(harbor), alt: harbor.alt ?? "" } : undefined);
        const rawAttrs = options.attrs === undefined ? null : (await import("../ops/adminCommon")).readJsonOption(options.attrs, "attrs");
        if (rawAttrs !== null && (typeof rawAttrs !== "object" || Array.isArray(rawAttrs))) throw new CliError("usage", "--attrs must be a JSON object.", undefined, 2);
        const custom = rawAttrs as Record<string, unknown> | null;
        return wanted.map((b) => {
          const t = trials.find((x) => x.id === b.id);
          let markdown = t?.markdown ?? null;
          const enc = markdown ? /data-attrs="([^"]*)"/.exec(markdown)?.[1] : undefined;
          let attrs: unknown = enc ? decodeB64Json(enc) : null;
          if (custom && markdown && enc) {
            attrs = { ...(attrs as object), ...custom };
            markdown = markdown.replace(`data-attrs="${enc}"`, `data-attrs="${encodeB64Json(attrs)}"`);
          }
          return {
            id: b.id,
            category: b.category,
            title: s.host.cmsRuntime.i18n.t(b.titleKey, { ns: b.namespace }),
            markdown,
            attrs,
            ...(t?.issues.length ? { issues: t.issues } : {}),
          };
        });
      }, (rows) => rows.map((r) => `${r.id} (${r.category}) — ${r.title}\n  ${r.markdown ?? "(inserts nothing by default)"}`).join("\n"));
    }

    default:
      throw new CliError("usage", action ? `Unknown content action "${action}".` : "content needs an action.", "Actions: list, get, create, update, publish, unpublish, delete, preview, blocks.", 2);
  }
}

export const contentCommand: Command = {
  name: "content",
  summary:
    "Posts and pages, like the admin's editor: list, get <id|slug>, create (draft; --publish to put it online), update <id|slug> (an online entry is republished, like Save; warnings name theme / plugin settings and menu URLs that still link to a moved page, with the fixing command), publish / unpublish <id|slug…> (several = bulk mode, one cascade), delete <id|slug…> (plan first, --yes), preview <id|slug> (HTML file: --out <file>, default in the system temp folder; --screenshots = desktop + phone PNGs in .screenshots/ next to it, absolute paths in the result), blocks [<block id>] (the editor blocks this site offers, as the Markdown to write; --attrs <json> fills a block's attributes).",
  usage:
    "content <list|get|create|update|publish|unpublish|delete|preview|blocks> [ids…] --site <alias> [--type post|page] [--status draft|online] [--search <q>] [--title <t>] [--slug <s>] [--body <md>|@file|-] [--excerpt <t>] [--category <slug|name>] [--tags a,b] [--create-terms] [--hero <media id>] [--author <user id|email>] [--seo-title <t>] [--seo-description <t>] [--seo-image <url>] [--created-at <iso>] [--published-at <iso>] [--data <json>|@file] [--lang <code>] [--publish] [--no-publish] [--out <file>] [--screenshots] [--attrs <json>] [--yes]",
  options: [
    { name: "site", type: "string", description: "Site alias." },
    { name: "type", type: "string", description: "post or page (create: default post)." },
    { name: "status", type: "string", description: "list: draft or online." },
    { name: "search", type: "string", description: "list: words that must all appear in title, slug or excerpt." },
    { name: "category", type: "string", description: "list: filter. create/update: the post's category (slug, name or id; \"\" removes it)." },
    { name: "title", type: "string", description: "Title." },
    { name: "slug", type: "string", description: "Slug (default: from the title, made unique)." },
    { name: "body", type: "string", description: "Markdown body: text, @file.md, or - for stdin." },
    { name: "excerpt", type: "string", description: "Excerpt (\"\" clears it)." },
    { name: "tags", type: "string", description: "Comma-separated tags (slug, name or id); replaces the post's tags." },
    { name: "create-terms", type: "boolean", description: "Create missing categories / tags instead of failing." },
    { name: "hero", type: "string", description: "Featured image: media id (\"\" removes it)." },
    { name: "author", type: "string", description: "Author: user id or email (default on create: the signed-in user)." },
    { name: "seo-title", type: "string", description: "SEO title." },
    { name: "seo-description", type: "string", description: "SEO description." },
    { name: "seo-image", type: "string", description: "og:image URL." },
    { name: "created-at", type: "string", description: "Creation date (ISO 8601) — drives the ordering." },
    { name: "published-at", type: "string", description: "Publication date (ISO 8601)." },
    { name: "data", type: "string", description: "All fields as JSON (or @file.json): title, slug, body, excerpt, category, tags[], hero, author, seo{title,description,ogImage}, createdAt, publishedAt. Flags override it." },
    { name: "lang", type: "string", description: "update: edit the translation in this language (agentcms-multilang) instead of the main text." },
    { name: "publish", type: "boolean", description: "create: publish right away." },
    { name: "no-publish", type: "boolean", description: "update: don't republish an online entry (its public page stays as it was)." },
    { name: "out", type: "string", description: "preview: output HTML file (default: <temp>/agentcms-preview/preview-<ref>.html)." },
    { name: "screenshots", type: "boolean", description: "preview: desktop + phone PNGs with a local Chrome, written to .screenshots/ next to the --out file (absolute paths in the result)." },
    { name: "yes", type: "boolean", description: "delete: apply (otherwise only the plan)." },
    { name: "attrs", type: "string", description: "blocks <id>: JSON merged into the block's default attributes; prints the Markdown marker with them encoded." },
  ],
  run,
};
