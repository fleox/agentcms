import { existsSync, readFileSync, statSync } from "node:fs";
import { basename, extname, resolve } from "node:path";
import type { Media, Post, Term, UserRecord } from "../../src/core/types";
import { CliError } from "../output";
import type { SiteSession } from "../ops/session";
import type { Command, CommandContext } from "./types";

// `agentcms media …` — the admin's Media library: list / get, upload
// (the admin's pipeline: every variant of the ACTIVE theme + the admin
// formats, WebP by default, uploaded to the publish target, then the
// media document), update (alt / caption), delete (the asset folder on
// the publish target + the document; plan first). Media has no publish
// cascade: published pages keep the URLs they were rendered with.

const MIME_BY_EXT: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
  ".gif": "image/gif",
  ".svg": "image/svg+xml",
  ".avif": "image/avif",
};

// How each format is made (active theme + the admin's own), so agents can
// pick a variant: "cover" = cropped to exactly width×height, "contain" =
// the whole image, proportional, within width×height. admin-* formats are
// the media library's own (thumbnails, re-crop source): don't use them in
// content.
let formatSpecs: Record<string, { fit: "cover" | "contain"; adminOnly: boolean }> = {};

async function loadFormatSpecs(s: { settings(): { activeThemeId?: string }; host: { themes: { getActiveTheme(id: string): { imageFormats?: { formats?: Record<string, { fit?: "cover" | "contain" }> } } } } }) {
  const { ADMIN_FORMATS } = await import("../../src/services/imageFormats");
  let theme: Record<string, { fit?: "cover" | "contain" }> = {};
  try {
    theme = s.host.themes.getActiveTheme(s.settings().activeThemeId ?? "default").imageFormats?.formats ?? {};
  } catch {
    theme = {};
  }
  formatSpecs = {};
  for (const [name, f] of Object.entries(theme)) formatSpecs[name] = { fit: f.fit ?? "cover", adminOnly: false };
  for (const [name, f] of Object.entries(ADMIN_FORMATS)) formatSpecs[name] = { fit: f.fit ?? "cover", adminOnly: true };
}

async function summarize(m: Media) {
  const { pickMediaUrl } = await import("../../src/core/media");
  const { iso } = await import("../ops/adminCommon");
  const formats: Record<string, { url: string; width: number; height: number; bytes: number; fit?: "cover" | "contain"; adminOnly?: boolean }> = {};
  for (const [name, v] of Object.entries(m.formats ?? {})) formats[name] = { url: v.url, width: v.width, height: v.height, bytes: v.bytes, ...(formatSpecs[name] ?? {}) };
  return {
    id: m.id,
    name: m.name,
    alt: m.alt ?? null,
    caption: m.caption ?? null,
    contentType: m.contentType,
    size: m.size,
    url: pickMediaUrl(m) || null,
    defaultFormat: m.defaultFormat ?? null,
    formats,
    storageBase: m.storageBase ?? m.storagePath ?? null,
    uploadedAt: iso(m.uploadedAt),
    uploadedBy: m.uploadedBy || null,
  };
}

function requireMedia(all: Media[], ref: string): Media {
  const m = all.find((x) => x.id === ref) ?? (all.filter((x) => x.name === ref).length === 1 ? all.find((x) => x.name === ref) : undefined);
  if (!m) throw new CliError("not-found", `No media "${ref}".`, "List them with `agentcms media list` (use the id).", 2);
  return m;
}

export interface MediaUsage {
  kind: "post" | "page" | "user" | "term";
  id: string;
  label: string;
  where: string[];
}

// Where an asset is referenced: featured image, Markdown body (its
// variant URLs or folder), SEO image, translations, author avatars,
// term SEO images.
export function findMediaUsages(m: Media, entries: Post[], users: UserRecord[], terms: Term[]): MediaUsage[] {
  const needles = [m.storageBase, m.storagePath, m.url, ...Object.values(m.formats ?? {}).map((v) => v.url)].filter((s): s is string => !!s);
  const mentions = (text: string | undefined | null) => !!text && needles.some((n) => text.includes(n));
  const out: MediaUsage[] = [];
  for (const p of entries) {
    const where: string[] = [];
    if (p.heroMediaId === m.id) where.push("featured image");
    if (mentions(p.contentMarkdown)) where.push("body");
    if (mentions(p.seo?.ogImage)) where.push("SEO image");
    if (p.translations && mentions(JSON.stringify(p.translations))) where.push("translation");
    if (where.length) out.push({ kind: p.type, id: p.id, label: p.title, where });
  }
  for (const u of users) if (u.avatarMediaId === m.id) out.push({ kind: "user", id: u.id, label: u.email || u.id, where: ["avatar"] });
  for (const t of terms) {
    if (mentions(t.seo?.ogImage) || (t.translations && mentions(JSON.stringify(t.translations)))) out.push({ kind: "term", id: t.id, label: t.name, where: ["SEO image"] });
  }
  return out;
}

async function allEntries(): Promise<Post[]> {
  const { fetchAllPosts, invalidateAllPostsCache } = await import("../../src/services/posts");
  invalidateAllPostsCache();
  const [posts, pages] = await Promise.all([fetchAllPosts({ type: "post" }), fetchAllPosts({ type: "page" })]);
  return [...posts, ...pages];
}

async function run({ io, options, positionals }: CommandContext): Promise<number | void> {
  const [action, ...refs] = positionals;
  const { runAdmin } = await import("../ops/adminCommon");
  const alias = options.site as string | undefined;
  const str = (v: unknown) => (v === undefined || v === false ? undefined : String(v));

  switch (action) {
    case "list":
      return runAdmin(io, alias, { extensions: true }, async (s) => {
        await loadFormatSpecs(s);
        let all = await s.media();
        if (options.search) {
          const tokens = String(options.search).toLowerCase().split(/\s+/).filter(Boolean);
          all = all.filter((m) => tokens.every((t) => `${m.name} ${m.alt ?? ""} ${m.caption ?? ""}`.toLowerCase().includes(t)));
        }
        return Promise.all(all.map(summarize));
      }, (rows) => (rows.length ? rows.map((r) => `${r.id}  ${r.name}${r.alt ? `  "${r.alt}"` : ""}  ${r.url ?? ""}`).join("\n") : "No media."));

    case "get": {
      if (!refs[0]) throw new CliError("usage", "media get needs a media id.", undefined, 2);
      return runAdmin(io, alias, { extensions: true }, async (s) => {
        await loadFormatSpecs(s);
        const m = requireMedia(await s.media(), refs[0]);
        const usages = findMediaUsages(m, await allEntries(), await s.users(), await s.terms());
        return { ...(await summarize(m)), usages };
      }, (r) =>
        [
          `${r.name} (${r.id})${r.alt ? ` — alt: ${r.alt}` : ""}`,
          ...Object.entries(r.formats).map(([n, f]) => `  ${n.padEnd(15)} ${f.width}×${f.height}  ${f.url}`),
          r.usages.length ? `Used by: ${r.usages.map((u) => `${u.kind} "${u.label}" (${u.where.join(", ")})`).join("; ")}` : "Not referenced.",
        ].join("\n"));
    }

    case "upload": {
      if (!refs.length) throw new CliError("usage", "media upload needs one or more image files.", "e.g. `agentcms media upload photo.jpg --alt \"…\"`", 2);
      const files = refs.map((f) => resolve(f));
      for (const f of files) {
        if (!existsSync(f) || !statSync(f).isFile()) throw new CliError("not-found", `${f} does not exist.`, undefined, 2);
      }
      const alt = str(options.alt);
      const caption = str(options.caption);
      return runAdmin(io, alias, { write: true, hosting: true, extensions: true, lock: true }, async (s) => {
        const { uploadMedia, updateMedia, validateMediaFile, listAllMedia } = await import("../../src/services/media");
        const { withStorageBatch } = await import("../../src/services/siteFiles");
        const { currentUserId } = await import("../ops/adminCommon");
        const settings = s.settings();
        await loadFormatSpecs(s);
        // The admin validates with the active theme's accepted inputs.
        let inputFormats: string[] | undefined;
        try {
          inputFormats = s.host.themes.getActiveTheme(settings.activeThemeId ?? "default").imageFormats?.inputFormats;
        } catch {
          inputFormats = undefined;
        }
        const prepared = files.map((path) => {
          const name = basename(path);
          const file = new File([readFileSync(path)], name, { type: MIME_BY_EXT[extname(name).toLowerCase()] ?? "" });
          const v = validateMediaFile(file, inputFormats);
          if (!v.ok) throw new CliError("invalid-media", v.reason, `Accepted: ${(inputFormats ?? [".jpg", ".jpeg", ".png", ".webp", ".gif"]).join(", ")} (the active theme decides).`, 2);
          return file;
        });
        const uploadedBy = await currentUserId();
        const out: Array<{ file: string; ok: boolean; id?: string; url?: string | null; formats?: Awaited<ReturnType<typeof summarize>>["formats"]; error?: string }> = [];
        // One file after the other, like the admin.
        for (const [i, file] of prepared.entries()) {
          try {
            // One commit per file on git hostings (the admin defers to an idle commit).
            const created = await withStorageBatch(() => uploadMedia(file, uploadedBy, settings));
            if (alt !== undefined || caption !== undefined) await updateMedia(created.id, { alt, caption });
            const fresh = (await listAllMedia()).find((m) => m.id === created.id) ?? created;
            const sum = await summarize(fresh);
            out.push({ file: files[i], ok: true, id: created.id, url: sum.url, formats: sum.formats });
          } catch (err) {
            out.push({ file: files[i], ok: false, error: (err as Error).message });
          }
        }
        return out;
      }, (rows) => rows.map((r) => (r.ok ? `✓ ${basename(r.file)} → ${r.id}  ${r.url}` : `✗ ${basename(r.file)} — ${r.error}`)).join("\n"));
    }

    case "update": {
      if (!refs[0]) throw new CliError("usage", "media update needs a media id.", undefined, 2);
      const alt = str(options.alt);
      const caption = str(options.caption);
      if (alt === undefined && caption === undefined) throw new CliError("usage", "media update needs --alt and/or --caption (\"\" clears).", undefined, 2);
      return runAdmin(io, alias, { write: true, lock: true }, async (s) => {
        const m = requireMedia(await s.media(), refs[0]);
        const { updateMedia, listAllMedia } = await import("../../src/services/media");
        await updateMedia(m.id, { alt, caption });
        const fresh = (await listAllMedia()).find((x) => x.id === m.id) ?? m;
        return { id: m.id, alt: fresh.alt ?? null, caption: fresh.caption ?? null, note: "Published pages keep the old alt text until they are republished (`agentcms regenerate all`)." };
      }, (r) => `Updated ${r.id}: alt=${JSON.stringify(r.alt)} caption=${JSON.stringify(r.caption)}\n${r.note}`);
    }

    case "delete": {
      if (!refs.length) throw new CliError("usage", "media delete needs one or more media ids.", undefined, 2);
      const inspect = async (s: SiteSession) => {
        const all = await s.media();
        const targets = refs.map((r) => requireMedia(all, r));
        const [entries, users, terms] = await Promise.all([allEntries(), s.users(), s.terms()]);
        return targets.map((m) => ({ media: m, usages: findMediaUsages(m, entries, users, terms) }));
      };
      const NOTE = "Published pages keep the URLs they were rendered with: they show a broken image until republished (`agentcms regenerate all`) or edited.";
      if (!options.yes) {
        return runAdmin(io, alias, {}, async (s) => {
          const found = await inspect(s);
          return {
            needsConfirmation: true,
            delete: found.map(({ media, usages }) => ({ id: media.id, name: media.name, folder: media.storageBase ?? media.storagePath ?? null, usages })),
            note: NOTE,
          };
        }, (r) =>
          [
            `Would delete ${r.delete.length} media (files on the publish target and the record):`,
            ...r.delete.map((d) => `  ${d.id} ${d.name}${d.usages.length ? ` — still used by ${d.usages.map((u) => `${u.kind} "${u.label}" (${u.where.join(", ")})`).join("; ")}` : ""}`),
            r.note,
            "Nothing changed — re-run with --yes once the user agrees.",
          ].join("\n"));
      }
      return runAdmin(io, alias, { write: true, hosting: true, lock: true }, async (s) => {
        const found = await inspect(s);
        const { deleteMedia } = await import("../../src/services/media");
        const { withStorageBatch } = await import("../../src/services/siteFiles");
        const out: Array<{ id: string; name: string; ok: boolean; usages: MediaUsage[]; error?: string }> = [];
        for (const { media, usages } of found) {
          try {
            await withStorageBatch(() => deleteMedia(media));
            out.push({ id: media.id, name: media.name, ok: true, usages });
          } catch (err) {
            out.push({ id: media.id, name: media.name, ok: false, usages, error: (err as Error).message });
          }
        }
        return { deleted: out, note: out.some((d) => d.usages.length) ? NOTE : null };
      }, (r) => [...r.deleted.map((d) => `${d.ok ? "✓ deleted" : "✗"} ${d.name}${d.error ? ` — ${d.error}` : ""}${d.usages.length ? ` (was used by ${d.usages.length} item(s))` : ""}`), ...(r.note ? [r.note] : [])].join("\n"));
    }

    default:
      throw new CliError("usage", action ? `Unknown media action "${action}".` : "media needs an action.", "Actions: list, get, upload, update, delete.", 2);
  }
}

export const mediaCommand: Command = {
  name: "media",
  summary:
    "The Media library: list [--search], get <id> (variants, URLs, where it is used), upload <file…> (the admin's pipeline: the active theme's variants + admin formats, then the record; --alt / --caption), update <id> --alt/--caption, delete <id…> (files + record; plan first, --yes; warns about posts / avatars still using it).",
  usage: "media <list|get|upload|update|delete> [ids|files…] --site <alias> [--search <q>] [--alt <text>] [--caption <text>] [--yes]",
  options: [
    { name: "site", type: "string", description: "Site alias." },
    { name: "search", type: "string", description: "list: words that must all appear in the name, alt or caption." },
    { name: "alt", type: "string", description: "upload/update: alternative text (\"\" clears)." },
    { name: "caption", type: "string", description: "upload/update: caption (\"\" clears)." },
    { name: "yes", type: "boolean", description: "delete: apply (otherwise only the plan)." },
  ],
  run,
};
