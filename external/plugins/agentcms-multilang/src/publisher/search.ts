import type { Post, SearchLocaleEntry, SiteSettings, Term } from "@agent-cms/runtime";
import { getMultilangConfig, localizeSettings } from "../core/config";
import { getTermTranslation } from "../core/urls";
import { buildLocalizedDataCtx } from "./localizedJson";
import { publishedSecondaryLanguages } from "./languageCleanup";

// Filter handler for `search.index.locales` fired by agentcms-search on
// every index pass. Returns one entry per secondary language: the
// language's shadow corpus (translated titles / excerpts / category
// names, slugs that make the core `buildPostUrl` emit the localised
// URL — same shadow view as `<lang>/data/posts.json`) to be indexed
// into `<lang>/search-index.json`. agentcms-search applies its own
// config (excerpts, categories, tags, pages, exclusions), bakes that
// language's UI strings and deletes the index of a language that is no
// longer returned.
export function buildSearchLocales(args: {
  posts: Post[];
  pages: Post[];
  terms: Term[];
  settings: SiteSettings;
}): SearchLocaleEntry[] {
  const config = getMultilangConfig(args.settings);
  const entries: SearchLocaleEntry[] = [];
  for (const language of publishedSecondaryLanguages(config)) {
    const shadow = buildLocalizedDataCtx(args, language, config);
    // Only entries that are actually published in this language: a
    // post whose category has no translation isn't (computeAdditional
    // skips it), and its shadow URL would point at the primary tree.
    const untranslatedCategories = new Set(
      args.terms
        .filter((t) => t.type === "category" && !getTermTranslation(t, language))
        .map((t) => t.id),
    );
    const posts = shadow.posts.filter(
      (p) => !p.primaryTermId || !untranslatedCategories.has(p.primaryTermId),
    );
    entries.push({
      language,
      path: `${language}/search-index.json`,
      posts,
      pages: shadow.pages,
      terms: shadow.terms,
      // homePageId cleared: the language's home page already carries
      // its `<lang>/index` slug (→ linked as `<lang>/`); the core's
      // static-home mapping would send it to the primary home.
      settings: { ...localizeSettings(args.settings, language, config), homePageId: undefined },
    });
  }
  return entries;
}
