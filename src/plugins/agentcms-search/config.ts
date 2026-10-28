// Plugin config for agentcms-search.
//
// Stored at `settings.pluginConfigs["agentcms-search"]`. Lifecycle
// handlers and the SettingsPage merge this with DEFAULT_SEARCH_CONFIG
// before reading any field, so an unconfigured site behaves
// predictably — every toggle defaults to a sensible "minimal but
// useful" search experience.

export interface SearchConfig {
  // ─── What gets indexed ──────────────────────────────────────────
  // Title is always indexed (no toggle — the bare minimum for any
  // useful search). The flags below additively widen the index.
  indexExcerpt: boolean;
  indexCategory: boolean;
  indexTags: boolean;
  // Include static pages (in addition to posts) in the index.
  includePages: boolean;
  // Term ids whose posts are skipped at indexing time. Empty = no
  // exclusions.
  excludedTermIds: string[];

  // ─── Runtime behavior (baked into the JSON meta block) ──────────
  // Below this many characters typed, the modal shows nothing.
  minQueryLength: number;
  // Hard cap on the number of results displayed at once.
  maxResults: number;

  // ─── Bookkeeping ────────────────────────────────────────────────
  // Hash of the most recently uploaded search-index.json. Skip
  // re-uploads when the freshly built index hashes to the same value.
  lastIndexHash?: string;
  // Hash of the most recently uploaded /search.js. Skips re-uploading
  // the runtime when the bundled file hasn't changed (i.e. on every
  // ordinary publish, only the index changes).
  lastRuntimeHash?: string;
  // Per-language index files (`<lang>/search-index.json`) written on
  // the last pass through the `search.index.locales` filter. A path
  // that drops out (language removed, multilang disabled) is deleted.
  lastLocalePaths?: string[];
  // Epoch ms of the last successful index upload — surfaced in the
  // settings page so the user has a "last regenerated" indicator.
  lastIndexedAt?: number;
}

export const DEFAULT_SEARCH_CONFIG: SearchConfig = {
  indexExcerpt: true,
  indexCategory: true,
  indexTags: false,
  includePages: false,
  excludedTermIds: [],
  minQueryLength: 2,
  maxResults: 20,
};

export const PLUGIN_ID = "agentcms-search";

// Public-site paths owned by the plugin. Hardcoded — making them
// configurable would mean every theme-side `<script src="...">` injection
// had to read the config too, complicating things for no real benefit.
export const SEARCH_INDEX_PATH = "search-index.json";
export const SEARCH_RUNTIME_PATH = "search.js";

// Index of a page's language, for the runtime <script> tag
// (`data-cms-search-index`). A page rendered for a secondary language
// (agentcms-multilang: `currentLocale` set AND `currentPath` under
// `<locale>/`) reads `<locale>/search-index.json`; anything else
// (primary pages, unilingual sites) → null = the root index.
export function localeIndexPathFor(
  props: { currentLocale?: string; currentPath?: string } | undefined,
): string | null {
  const locale = props?.currentLocale?.trim();
  if (!locale || !/^[a-z0-9-]+$/i.test(locale)) return null;
  const path = (props?.currentPath ?? "").replace(/^\/+/, "");
  if (!path.startsWith(`${locale}/`)) return null;
  return `${locale}/${SEARCH_INDEX_PATH}`;
}
