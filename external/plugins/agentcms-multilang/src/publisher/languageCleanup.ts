import {
  deleteFile,
  deleteFolder,
  getStorageCapabilities,
  updatePluginConfig,
  type Post,
  type PublishContext,
} from "@agent-cms/runtime";
import { getTermTranslation } from "../core/urls";
import { PLUGIN_ID, type MultilangConfig } from "../types";

// Removing a language from `enabledLanguages` stops every per-language
// render, but the files already on the publish target (home, category
// archives, archives plugin pages, data JSON, feeds, search index…)
// stay online — nothing tracks them any more. This module remembers
// which secondary languages were published (`lastPublishedLanguages`
// in the plugin config) and, on the next listing pass, deletes the
// `<lang>/` tree of every language that dropped out. Per-post
// translations are also removed by the core (orphan diff on
// `post.lastPublishedPathsByLocale` in publishPost / regenerateAll);
// deleting their paths here too makes a listings-only pass enough.

// Language-code shape accepted for deletion. Guards `deleteFolder`
// against anything that isn't obviously a `<lang>/` prefix (an empty
// string would be the site root).
const LANG_CODE = /^[a-z]{2,3}(-[a-z0-9]{2,8})*$/i;

// Secondary languages currently published: enabled minus the primary,
// de-duplicated, in declared order.
export function publishedSecondaryLanguages(config: MultilangConfig): string[] {
  const out: string[] = [];
  for (const lang of config.enabledLanguages) {
    if (lang === config.primaryLanguage || out.includes(lang)) continue;
    out.push(lang);
  }
  return out;
}

// Languages whose `<lang>/` tree must be deleted: recorded as published
// (config bookkeeping, or — before any bookkeeping — referenced by a
// post's per-locale paths)
// but no longer enabled. Never the primary language, never a code that
// collides with a top-level folder of the primary site (a category slug
// like `tv` lives at `tv/index.html`).
export function languagesToRemove(
  config: MultilangConfig,
  ctx: Pick<PublishContext, "posts" | "pages" | "terms">,
): string[] {
  const enabled = new Set(publishedSecondaryLanguages(config));
  const candidates: string[] = [...(config.lastPublishedLanguages ?? [])];
  // No bookkeeping yet (site published before this module existed):
  // bootstrap from the languages the posts were last published in.
  // Once recorded, the config list alone decides — post maps keep a
  // removed language until each post is republished, and re-deleting
  // its tree on every pass until then would be wasted work.
  if (!config.lastPublishedLanguages) {
    for (const p of [...ctx.posts, ...ctx.pages]) {
      for (const lang of Object.keys(p.lastPublishedPathsByLocale ?? {})) candidates.push(lang);
    }
  }
  const reserved = new Set(
    ctx.terms.filter((t) => t.type === "category").map((t) => t.slug.toLowerCase()),
  );
  const out: string[] = [];
  for (const lang of candidates) {
    if (out.includes(lang)) continue;
    if (enabled.has(lang) || lang === config.primaryLanguage) continue;
    if (!LANG_CODE.test(lang) || reserved.has(lang.toLowerCase())) continue;
    out.push(lang);
  }
  return out;
}

// Files a removed language is known to have on the publish target —
// the fallback when the connector can't delete a whole folder. Archive
// pages deeper than the archives index can't be enumerated without the
// archives plugin's bookkeeping; they go with deleteFolder only.
export function knownLanguagePaths(
  language: string,
  ctx: Pick<PublishContext, "posts" | "pages" | "terms">,
): string[] {
  const paths = new Set<string>([
    `${language}/index.html`,
    `${language}/data/posts.json`,
    `${language}/data/authors.json`,
    `${language}/search-index.json`,
    `${language}/rss.xml`,
    `${language}/feed.xml`,
    `${language}/archives/index.html`,
  ]);
  for (const term of ctx.terms) {
    if (term.type !== "category") continue;
    const trans = getTermTranslation(term, language);
    if (!trans) continue;
    paths.add(`${language}/${trans.slug}/index.html`);
    paths.add(`${language}/${trans.slug}/${trans.slug}.xml`);
  }
  for (const p of [...ctx.posts, ...ctx.pages] as Post[]) {
    const path = p.lastPublishedPathsByLocale?.[language];
    if (path) paths.add(path);
  }
  return [...paths];
}

// Files of a language that live outside its `<lang>/` folder.
function outsideFolderPaths(language: string): string[] {
  return [`sitemaps/sitemap-news-${language}.xml`];
}

function sameList(a: string[] | undefined, b: string[]): boolean {
  return !!a && a.length === b.length && a.every((x, i) => x === b[i]);
}

async function canDeleteFolder(): Promise<boolean> {
  try {
    const caps = await getStorageCapabilities();
    // Commit / deployment targets stage a prefix delete; "files"
    // targets need a native prefix delete or a listing to emulate it.
    return caps.model !== "files" || caps.deletePrefix || caps.list;
  } catch {
    return false;
  }
}

async function deleteLanguageFiles(
  language: string,
  ctx: PublishContext,
  folder: boolean,
): Promise<void> {
  let done = false;
  if (folder) {
    try {
      await deleteFolder(language);
      done = true;
    } catch {
      // Fall back to the known paths below.
    }
  }
  const paths = done ? outsideFolderPaths(language) : [
    ...knownLanguagePaths(language, ctx),
    ...outsideFolderPaths(language),
  ];
  for (const path of paths) {
    try {
      await deleteFile(path);
    } catch {
      // best-effort — 404 is already silent in deleteFile
    }
  }
}

// Deletes the published files of every removed language, then records
// the languages published now. Called at the start of every listing
// pass (computeExtraListings), so `regenerate everything` — or any
// publish — cleans up after a language removal. Persists only when the
// recorded list changes; patches `ctx.settings` so a second listing
// pass in the same action doesn't redo the work. Returns the removed
// languages (for tests / logs).
export async function cleanupRemovedLanguages(
  ctx: PublishContext,
  config: MultilangConfig,
): Promise<string[]> {
  const removed = languagesToRemove(config, ctx);
  const current = publishedSecondaryLanguages(config);
  if (removed.length > 0) {
    const folder = await canDeleteFolder();
    for (const language of removed) {
      await deleteLanguageFiles(language, ctx, folder);
    }
  }
  if (removed.length > 0 || !sameList(config.lastPublishedLanguages, current)) {
    const stored = (ctx.settings.pluginConfigs?.[PLUGIN_ID] ?? {}) as Partial<MultilangConfig>;
    const next = { ...stored, lastPublishedLanguages: current };
    try {
      await updatePluginConfig(PLUGIN_ID, next);
      ctx.settings = {
        ...ctx.settings,
        pluginConfigs: { ...(ctx.settings.pluginConfigs ?? {}), [PLUGIN_ID]: next },
      };
    } catch {
      // best-effort — the next pass retries (deletions are idempotent)
    }
  }
  return removed;
}
