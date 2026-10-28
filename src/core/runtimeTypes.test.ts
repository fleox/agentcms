// Sync guard for types/agentcms-runtime.d.ts — the public, self-contained
// declaration file external plugins / themes map `@agent-cms/runtime` to.
//
// Two layers:
//   1. Runtime (vitest): the value export NAMES of the runtime stub
//      (public/runtime/cms-runtime.js — what bundles can import at
//      runtime), of src/core/cmsRuntime.ts (what the admin exposes) and
//      of the curated .d.ts must be identical.
//   2. Compile time (tsc, `npm run typecheck`): every real export must be
//      assignable to its curated declaration, and key interfaces must be
//      mutually assignable, so changing a real signature breaks the build
//      until the .d.ts is updated.
//
// The repo's own `@agent-cms/runtime` alias still points at
// src/core/cmsRuntime.ts; the curated file is imported by relative path.

import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import type * as Real from "./cmsRuntime";
import type * as Curated from "../../types/agentcms-runtime";
import type { PluginManifest as RealPluginManifest } from "../plugins";
import type { ThemeManifest as RealThemeManifest } from "../themes/types";
import type { BlockManifest as RealBlockManifest } from "./blockRegistry";
import type { manifest as realDefaultTheme } from "../themes/default/manifest";
import type { DefaultThemeConfig } from "../themes/default/config";
import type { manifest as realCoreSeo } from "../plugins/core-seo/manifest";
import type { StorageConnector as RealStorageConnector } from "../services/storage/types";
import type * as RealSitemaps from "../plugins/agentcms-sitemaps/generator";
import type { RssLocaleEntry as RealRssLocaleEntry } from "../plugins/agentcms-rss/generator";

const root = resolve(__dirname, "../..");
const read = (rel: string) => readFileSync(resolve(root, rel), "utf8");

function stubExports(src: string): Set<string> {
  return new Set([...src.matchAll(/^export const (\w+)\s*=/gm)].map((m) => m[1]));
}

function cmsRuntimeExports(src: string): Set<string> {
  const names = new Set<string>();
  for (const m of src.matchAll(/^export (?:const|function|class) (\w+)/gm)) names.add(m[1]);
  // `export { a, b as c };` blocks (type-only blocks start with `export type`).
  for (const m of src.matchAll(/^export \{([^}]*)\};?/gm)) {
    for (const raw of m[1].split(",")) {
      const entry = raw.replace(/\/\/.*$/gm, "").trim();
      if (!entry) continue;
      const parts = entry.split(/\s+as\s+/);
      names.add((parts[1] ?? parts[0]).trim());
    }
  }
  return names;
}

function curatedExports(src: string): Set<string> {
  return new Set(
    [...src.matchAll(/^export (?:declare )?(?:const|let|var|function|class|enum) (\w+)/gm)].map(
      (m) => m[1],
    ),
  );
}

function diff(a: Set<string>, b: Set<string>): string[] {
  return [...a].filter((x) => !b.has(x)).sort();
}

describe("types/agentcms-runtime.d.ts value exports", () => {
  const stub = stubExports(read("public/runtime/cms-runtime.js"));
  const runtime = cmsRuntimeExports(read("src/core/cmsRuntime.ts"));
  const curated = curatedExports(read("types/agentcms-runtime.d.ts"));

  it("parses a sane number of exports", () => {
    expect(stub.size).toBeGreaterThan(50);
    expect(runtime.size).toBeGreaterThan(50);
  });

  it("match the runtime stub exactly", () => {
    expect(
      { missingFromDts: diff(stub, curated), notInStub: diff(curated, stub) },
      "types/agentcms-runtime.d.ts must declare exactly the values exported by public/runtime/cms-runtime.js",
    ).toEqual({ missingFromDts: [], notInStub: [] });
  });

  it("match src/core/cmsRuntime.ts named exports exactly", () => {
    expect(
      { missingFromStub: diff(runtime, stub), notInCmsRuntime: diff(stub, runtime) },
      "public/runtime/cms-runtime.js and src/core/cmsRuntime.ts must export the same values",
    ).toEqual({ missingFromStub: [], notInCmsRuntime: [] });
  });
});

// ─── Compile-time checks (never executed) ──────────────────────────────────

// Every value the curated file declares must be produced from the real
// implementation. `typeof Curated` only contains VALUE exports, so a
// missing or extra key is also a compile error here.
//
// No escapes are needed: the stand-ins (Timestamp, AuthUser, I18nInstance,
// ClassValue) are structurally compatible with the real Firebase / i18next /
// clsx types, and the Tiptap stand-ins are `any` (they accept the real
// Editor / ChainedCommands / Extensions in both directions).
export function _curatedValuesFromReal(r: typeof Real): typeof Curated {
  return {
    CMS_API_VERSION: r.CMS_API_VERSION,
    CMS_API_MIN_VERSION: r.CMS_API_MIN_VERSION,
    pluginApi: r.pluginApi,
    applyFilters: r.applyFilters,
    applyFiltersSync: r.applyFiltersSync,
    doAction: r.doAction,
    registerBlock: r.registerBlock,
    registerDashboardCard: r.registerDashboardCard,
    registerInspectorTab: r.registerInspectorTab,
    registerTermEditorSection: r.registerTermEditorSection,
    registerEditorVariantProvider: r.registerEditorVariantProvider,
    registerExternalPlugin: r.registerExternalPlugin,
    registerExternalTheme: r.registerExternalTheme,
    registerStorageConnector: r.registerStorageConnector,
    slugify: r.slugify,
    isValidSlug: r.isValidSlug,
    findAvailableSlug: r.findAvailableSlug,
    buildPostUrl: r.buildPostUrl,
    buildTermUrl: r.buildTermUrl,
    pathToPublicUrl: r.pathToPublicUrl,
    canonicalPath: r.canonicalPath,
    canonicalUrl: r.canonicalUrl,
    detectPathCollision: r.detectPathCollision,
    detectTermSlugCollision: r.detectTermSlugCollision,
    normalizeMediaSlug: r.normalizeMediaSlug,
    basePathFromBaseUrl: r.basePathFromBaseUrl,
    withBasePath: r.withBasePath,
    mediaToView: r.mediaToView,
    pickFormat: r.pickFormat,
    pickMediaUrl: r.pickMediaUrl,
    markdownToPlainText: r.markdownToPlainText,
    renderMarkdown: r.renderMarkdown,
    SocialIcon: r.SocialIcon,
    socialLabel: r.socialLabel,
    postSortMillis: r.postSortMillis,
    renderPageToHtml: r.renderPageToHtml,
    uploadFile: r.uploadFile,
    deleteFile: r.deleteFile,
    deleteFolder: r.deleteFolder,
    renameFile: r.renameFile,
    renameFolder: r.renameFolder,
    createFolder: r.createFolder,
    getFile: r.getFile,
    listFiles: r.listFiles,
    publicUrlFor: r.publicUrlFor,
    fileToBase64: r.fileToBase64,
    getStorageCapabilities: r.getStorageCapabilities,
    withStorageBatch: r.withStorageBatch,
    StorageError: r.StorageError,
    fetchAllPosts: r.fetchAllPosts,
    createPost: r.createPost,
    updatePost: r.updatePost,
    uploadMedia: r.uploadMedia,
    createTerm: r.createTerm,
    updateTerm: r.updateTerm,
    deleteTerm: r.deleteTerm,
    buildRssFeedXml: r.buildRssFeedXml,
    buildAuthorLookup: r.buildAuthorLookup,
    publishPost: r.publishPost,
    buildPublishContext: r.buildPublishContext,
    buildSiteContext: r.buildSiteContext,
    renderHome: r.renderHome,
    publishMenuJson: r.publishMenuJson,
    publishPostsJson: r.publishPostsJson,
    publishAuthorsJson: r.publishAuthorsJson,
    publishProductsJson: r.publishProductsJson,
    deleteProductsJson: r.deleteProductsJson,
    updatePluginConfig: r.updatePluginConfig,
    updateThemeConfig: r.updateThemeConfig,
    toast: r.toast,
    sha256Hex: r.sha256Hex,
    formatDateTime: r.formatDateTime,
    cn: r.cn,
    useCmsData: r.useCmsData,
    useAuth: r.useAuth,
    i18n: r.i18n,
    pickPublicLocale: r.pickPublicLocale,
    setActiveLocale: r.setActiveLocale,
    EntityCombobox: r.EntityCombobox,
    getActiveTheme: r.getActiveTheme,
    useAllPosts: r.useAllPosts,
    getCurrentPublishContext: r.getCurrentPublishContext,
    FontSelect: r.FontSelect,
    MediaPicker: r.MediaPicker,
    logoPath: r.logoPath,
    uploadThemeLogo: r.uploadThemeLogo,
    removeThemeLogo: r.removeThemeLogo,
  };
}

// Mutual assignability of the shared data / contract types: real → curated
// AND curated → real. A failing pair makes `Expect<…>` reject a non-`true`
// type and names the failing direction in the error.
type Mutual<R, C> = [R] extends [C]
  ? [C] extends [R]
    ? true
    : { error: "curated type is not assignable to the real type"; curated: C }
  : { error: "real type is not assignable to the curated type"; real: R };
type Expect<T extends true> = T;

export type _MutualChecks = [
  Expect<Mutual<Real.Post, Curated.Post>>,
  Expect<Mutual<Real.Term, Curated.Term>>,
  Expect<Mutual<Real.Media, Curated.Media>>,
  Expect<Mutual<Real.UserRecord, Curated.UserRecord>>,
  Expect<Mutual<Real.SiteSettings, Curated.SiteSettings>>,
  Expect<Mutual<Real.MenuItem, Curated.MenuItem>>,
  Expect<Mutual<Real.ImageFormatConfig, Curated.ImageFormatConfig>>,
  Expect<Mutual<Real.MediaView, Curated.MediaView>>,
  Expect<Mutual<Real.AuthorView, Curated.AuthorView>>,
  Expect<Mutual<Real.CardPost, Curated.CardPost>>,
  Expect<Mutual<Real.SiteContext, Curated.SiteContext>>,
  Expect<Mutual<Real.BaseLayoutProps, Curated.BaseLayoutProps>>,
  Expect<Mutual<Real.SingleTemplateProps, Curated.SingleTemplateProps>>,
  Expect<Mutual<Real.HomeTemplateProps, Curated.HomeTemplateProps>>,
  Expect<Mutual<Real.CategoryTemplateProps, Curated.CategoryTemplateProps>>,
  Expect<Mutual<Real.AuthorTemplateProps, Curated.AuthorTemplateProps>>,
  Expect<Mutual<Real.NotFoundTemplateProps, Curated.NotFoundTemplateProps>>,
  Expect<Mutual<Real.ArchivesLink, Curated.ArchivesLink>>,
  Expect<Mutual<Real.ResolvedMenuItem, Curated.ResolvedMenuItem>>,
  Expect<Mutual<Real.PublishContext, Curated.PublishContext>>,
  Expect<Mutual<Real.PublishLogEntry, Curated.PublishLogEntry>>,
  Expect<Mutual<Real.PublishLogger, Curated.PublishLogger>>,
  Expect<Mutual<Real.AdditionalRender, Curated.AdditionalRender>>,
  Expect<Mutual<Real.AdditionalListingRender, Curated.AdditionalListingRender>>,
  Expect<Mutual<Real.RenderHomeOptions, Curated.RenderHomeOptions>>,
  Expect<Mutual<Real.RssChannel, Curated.RssChannel>>,
  Expect<Mutual<Real.RssItem, Curated.RssItem>>,
  Expect<Mutual<Real.RssEnclosure, Curated.RssEnclosure>>,
  Expect<Mutual<Real.MenuJson, Curated.MenuJson>>,
  Expect<Mutual<Real.MenuFilterContext, Curated.MenuFilterContext>>,
  Expect<Mutual<Real.ListItem, Curated.ListItem>>,
  Expect<Mutual<Real.ListResponse, Curated.ListResponse>>,
  Expect<Mutual<Real.UploadFileOptions, Curated.UploadFileOptions>>,
  Expect<Mutual<Real.ComboboxOption, Curated.ComboboxOption>>,
  Expect<Mutual<Real.FontOption, Curated.FontOption>>,
  Expect<Mutual<Real.PluginApi, Curated.PluginApi>>,
  Expect<Mutual<Real.RegenerationTarget, Curated.RegenerationTarget>>,
  Expect<Mutual<Real.BlockManifest, Curated.BlockManifest>>,
  Expect<Mutual<Real.DashboardCardManifest, Curated.DashboardCardManifest>>,
  Expect<Mutual<Real.InspectorTabManifest, Curated.InspectorTabManifest>>,
  Expect<Mutual<Real.InspectorTabProps, Curated.InspectorTabProps>>,
  Expect<Mutual<Real.TermEditorSectionManifest, Curated.TermEditorSectionManifest>>,
  Expect<Mutual<Real.TermEditorSectionProps, Curated.TermEditorSectionProps>>,
  Expect<Mutual<Real.EditorVariantProvider, Curated.EditorVariantProvider>>,
  Expect<Mutual<Real.EditorVariant, Curated.EditorVariant>>,
  Expect<Mutual<Real.VariantFields, Curated.VariantFields>>,
  Expect<Mutual<Real.PluginManifest, Curated.PluginManifest>>,
  Expect<Mutual<Real.PluginSettingsPageDef, Curated.PluginSettingsPageDef>>,
  Expect<Mutual<Real.PluginSettingsPageProps, Curated.PluginSettingsPageProps>>,
  Expect<Mutual<Real.ThemeManifest, Curated.ThemeManifest>>,
  Expect<Mutual<Real.ThemeSettingsPageDef, Curated.ThemeSettingsPageDef>>,
  Expect<Mutual<Real.SettingDoc, Curated.SettingDoc>>,
  Expect<Mutual<Real.SettingsSchema, Curated.SettingsSchema>>,
  Expect<Mutual<Real.ThemeSettingsPageProps, Curated.ThemeSettingsPageProps>>,
  Expect<Mutual<RealStorageConnector, Curated.StorageConnector>>,
  Expect<Mutual<RealSitemaps.SitemapsConfig, Curated.SitemapsConfig>>,
  Expect<Mutual<RealSitemaps.SitemapEntity, Curated.SitemapEntity>>,
  Expect<Mutual<RealSitemaps.SitemapExtraUrl, Curated.SitemapExtraUrl>>,
  Expect<Mutual<RealSitemaps.SitemapIndexExtraEntry, Curated.SitemapIndexExtraEntry>>,
  Expect<Mutual<RealSitemaps.NewsLocaleEntry, Curated.NewsLocaleEntry>>,
  Expect<Mutual<RealRssLocaleEntry, Curated.RssLocaleEntry>>,
  Expect<Mutual<RealBlockManifest<{ level: number }>, Curated.BlockManifest<{ level: number }>>>,
  Expect<Mutual<RealPluginManifest<{ a: string }>, Curated.PluginManifest<{ a: string }>>>,
  Expect<Mutual<RealThemeManifest<{ a: string }>, Curated.ThemeManifest<{ a: string }>>>,
];

// Real in-tree manifests must satisfy the curated contracts.
export function _realManifestsFitCurated(
  theme: typeof realDefaultTheme,
  plugin: typeof realCoreSeo,
): [Curated.ThemeManifest<DefaultThemeConfig>, Curated.PluginManifest] {
  return [theme, plugin];
}
