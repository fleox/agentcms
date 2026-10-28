import { mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { Script } from "node:vm";
import type { PluginManifest } from "../../src/plugins";
import type { ThemeManifest } from "../../src/themes/types";
import type { BlockManifest } from "../../src/core/blockRegistry";
import { blockOutput, blockTestMarkdown, tryBlocks, type BlockTrial } from "./extBlocks";
import { compareVersions as compareSemver } from "../semver";
import { bootExtensionHost, IMPORT_MAP_SPECIFIERS, importExtensionBundle } from "./extHost";
import { bundleSource, type ExtensionPackage } from "./extPackage";
import { listFiles, renderPreview, type LoadedExtension, type PreviewResult } from "./extPreview";
import { schemaErrors } from "./settingsSchema";

// `agentcms ext check`: everything the admin would do with the package
// (install-time validation, boot-time import + registration, publish-
// time rendering), run locally, plus the conventions a working
// extension relies on. Errors = it will not work; warnings = it will
// work but something is likely wrong.

export interface CheckIssue {
  level: "error" | "warn";
  code: string;
  message: string;
  hint?: string;
}

export interface Registrations {
  filters: Array<{ hook: string; priority: number; async: boolean }>;
  actions: Array<{ hook: string; priority: number }>;
  blocks: string[];
  dashboardCards: string[];
  inspectorTabs: string[];
  termEditorSections: string[];
  editorVariantProviders: string[];
  regenerationTargets: string[];
  storageConnectors: string[];
}

export interface CheckReport {
  valid: boolean;
  kind: "plugin" | "theme" | null;
  id: string | null;
  name: string | null;
  version: string | null;
  apiVersion: string | null;
  hostApi: { version: string; min: string };
  package: { source: string; sourceType: string; files: Array<{ path: string; bytes: number }>; bytes: number };
  errors: CheckIssue[];
  warnings: CheckIssue[];
  registered: Registrations | null;
  // settings.schema (API 1.5): documented settings, null when absent.
  settingsSchema: { documented: number; paths: string[] } | null;
  // Editor blocks: inserted in an editor configured like the admin's,
  // round-tripped through Markdown, then published in a demo page.
  blocks: Array<{ id: string; markdown: string | null; published: string | null }>;
  // Files the extension adds to (or changes in) the published site
  // compared with the same demo site without it (plugins), or the
  // rendered demo site (themes).
  output: {
    previewDir: string | null;
    pages: PreviewResult["pages"] | null;
    added: string[];
    changed: string[];
    // Plugins: what the plugin itself (beyond the core) adds / changes /
    // removes at each simulated step: publish, unpublish, delete, bulk publish.
    lifecycle: Array<{ step: string; description: string; added: string[]; changed: string[]; removed: string[] }>;
  } | null;
}

export const ID_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const SEMVER = /^\d+\.\d+\.\d+(?:[-+][0-9A-Za-z.-]+)?$/;
export const ADMIN_LOCALES = ["en", "fr", "de", "es", "nl", "pt", "ko"];
const BLOCK_CATEGORIES = ["text", "media", "layout", "embed", "advanced"];
const TEMPLATE_KEYS = ["base", "home", "single", "category", "author", "notFound"] as const;

// Hooks the core (and the bundled plugins) fire. A callback on any
// other name never runs — almost always a typo.
export const KNOWN_FILTERS = [
  "post.markdown.before",
  "post.html.body",
  "post.template.props",
  "page.head.extra",
  "page.body.end",
  "menu.json.resolved",
  "publish.additional",
  "publish.extraListings",
  "sitemap.urlset.namespaces",
  "sitemap.url.entry",
  "sitemap.urls.extra",
  "sitemap.index.extra",
  "sitemap.news.locales",
  "search.index.locales",
  "rss.site.locales",
];
// Filters applied with applyFiltersSync: an async callback throws.
export const SYNC_FILTERS = [
  "page.head.extra",
  "page.body.end",
  "sitemap.urlset.namespaces",
  "sitemap.url.entry",
  "sitemap.urls.extra",
  "sitemap.index.extra",
];
export const KNOWN_ACTIONS = [
  "publish.before",
  "publish.after",
  "publish.complete",
  "post.unpublished",
  "post.deleted",
  "regenerate.listings.before",
];

const PROBE_HEAD = '<meta name="agentcms-check" content="head-extra"/>';
const PROBE_BODY = "<!--agentcms-check:body-end-->";

function emptyRegistrations(): Registrations {
  return {
    filters: [],
    actions: [],
    blocks: [],
    dashboardCards: [],
    inspectorTabs: [],
    termEditorSections: [],
    editorVariantProviders: [],
    regenerationTargets: [],
    storageConnectors: [],
  };
}

const isAsync = (fn: unknown) => typeof fn === "function" && fn.constructor?.name === "AsyncFunction";

// A pluginApi stand-in that records what register() asks for without
// touching the real registries.
function recordingApi(rec: Registrations, issues: CheckIssue[], blockManifests: BlockManifest[]) {
  const named = (list: string[], what: string) => (m: unknown) => {
    const id = (m as { id?: unknown })?.id;
    if (typeof id !== "string" || !id) issues.push({ level: "error", code: "registration-without-id", message: `${what} registered without an id.` });
    list.push(String(id));
    return m;
  };
  return {
    addFilter(hook: string, fn: unknown, priority = 10) {
      rec.filters.push({ hook, priority, async: isAsync(fn) });
      if (typeof fn !== "function") issues.push({ level: "error", code: "filter-not-function", message: `addFilter("${hook}") was given a ${typeof fn}, not a function.` });
    },
    addAction(hook: string, fn: unknown, priority = 10) {
      rec.actions.push({ hook, priority });
      if (typeof fn !== "function") issues.push({ level: "error", code: "action-not-function", message: `addAction("${hook}") was given a ${typeof fn}, not a function.` });
    },
    registerBlock: (m: unknown) => {
      named(rec.blocks, "A block")(m);
      blockManifests.push(m as BlockManifest);
      checkBlock(m, issues);
    },
    registerDashboardCard: (m: unknown) => {
      named(rec.dashboardCards, "A dashboard card")(m);
      if (typeof (m as { component?: unknown })?.component !== "function") {
        issues.push({ level: "error", code: "card-component", message: `Dashboard card "${(m as { id?: string })?.id}" has no component.` });
      }
    },
    registerInspectorTab: named(rec.inspectorTabs, "An inspector tab"),
    registerTermEditorSection: named(rec.termEditorSections, "A term editor section"),
    registerEditorVariantProvider: named(rec.editorVariantProviders, "An editor variant provider"),
    registerRegenerationTarget: named(rec.regenerationTargets, "A regeneration target"),
    registerStorageConnector: named(rec.storageConnectors, "A storage connector"),
  };
}

function checkBlock(m: unknown, issues: CheckIssue[]): void {
  const b = m as Record<string, unknown>;
  const id = String(b?.id ?? "?");
  if (typeof b?.id === "string" && !b.id.includes("/")) {
    issues.push({ level: "warn", code: "block-id-namespace", message: `Block id "${id}" is not namespaced.`, hint: 'Use "<your-id>/<block>" so it never collides with core/* or another extension.' });
  }
  if (typeof b?.titleKey !== "string") issues.push({ level: "error", code: "block-title", message: `Block "${id}" has no titleKey.` });
  if (typeof b?.insert !== "function") issues.push({ level: "error", code: "block-insert", message: `Block "${id}" has no insert(chain, ctx) function.` });
  if (!BLOCK_CATEGORIES.includes(String(b?.category))) {
    issues.push({ level: "error", code: "block-category", message: `Block "${id}" category "${String(b?.category)}" is not one of ${BLOCK_CATEGORIES.join(", ")}.` });
  }
  if (b?.icon == null) issues.push({ level: "warn", code: "block-icon", message: `Block "${id}" has no icon.` });
  if (b?.extensions != null && !Array.isArray(b.extensions)) issues.push({ level: "error", code: "block-extensions", message: `Block "${id}" extensions must be an array of Tiptap extensions.` });
  if (b?.isActive != null && typeof b.isActive !== "function") issues.push({ level: "error", code: "block-is-active", message: `Block "${id}" isActive must be a function.` });
}

function getPath(obj: unknown, path: string): unknown {
  return path.split(".").reduce<unknown>((o, k) => (o && typeof o === "object" ? (o as Record<string, unknown>)[k] : undefined), obj);
}

function checkI18nAndSettings(m: PluginManifest | ThemeManifest, issues: CheckIssue[], namespace: string): void {
  const i18n = m.i18n as Record<string, unknown> | undefined;
  if (i18n != null) {
    if (typeof i18n !== "object") issues.push({ level: "error", code: "i18n-shape", message: "i18n must be { <locale>: { …keys } }." });
    else {
      for (const loc of Object.keys(i18n)) {
        if (!ADMIN_LOCALES.includes(loc)) issues.push({ level: "warn", code: "i18n-locale", message: `i18n locale "${loc}" is not an admin locale (${ADMIN_LOCALES.join(", ")}); it is never used.` });
      }
      if (!i18n.en) issues.push({ level: "warn", code: "i18n-en", message: "i18n has no \"en\" bundle — English is the fallback for every other locale." });
    }
  }
  const s = m.settings as Record<string, unknown> | undefined;
  if (s == null) return;
  if (typeof s.navLabelKey !== "string") issues.push({ level: "error", code: "settings-nav-label", message: "settings.navLabelKey is missing." });
  if (typeof s.component !== "function") issues.push({ level: "error", code: "settings-component", message: "settings.component must be a React component." });
  if (s.defaultConfig === undefined) issues.push({ level: "warn", code: "settings-default", message: "settings.defaultConfig is undefined — the page gets no config on a fresh site." });
  if (typeof s.navLabelKey === "string" && i18n?.en && getPath(i18n.en, s.navLabelKey) === undefined) {
    issues.push({ level: "warn", code: "settings-label-missing", message: `settings.navLabelKey "${s.navLabelKey}" is not in i18n.en — the menu shows the raw key.`, hint: `Namespace: "${namespace}".` });
  }
  // settings.schema (API 1.5): shown by `config --schema`, enforced on
  // --set / --merge — the defaults themselves must pass it.
  if (s.schema !== undefined) {
    const schema = s.schema as Record<string, { description?: unknown; values?: unknown }>;
    if (typeof schema !== "object" || schema === null || Array.isArray(schema)) {
      issues.push({ level: "error", code: "settings-schema", message: "settings.schema must be an object keyed by setting path." });
    } else {
      for (const [path, d] of Object.entries(schema)) {
        if (!d || typeof d.description !== "string" || !d.description.trim()) issues.push({ level: "warn", code: "settings-schema-description", message: `settings.schema["${path}"] has no description.` });
        if (d?.values !== undefined && !Array.isArray(d.values)) issues.push({ level: "error", code: "settings-schema", message: `settings.schema["${path}"].values must be an array.` });
      }
      for (const e of schemaErrors(schema as never, s.defaultConfig)) {
        issues.push({ level: "error", code: "settings-schema-default", message: `defaultConfig fails its own schema: ${e}`, hint: "Add the default to `values` (or widen min / max)." });
      }
    }
  }
}

// Bare specifiers / relative chunks imported by the bundle.
function bundleImports(code: string): string[] {
  const found = new Set<string>();
  const re = /(?:\bimport\s*(?:[\w*{}\s,$]+\s*from\s*)?|\bexport\s*(?:[\w*{}\s,$]+\s*)from\s*|\bimport\s*\(\s*)(["'])([^"'\n]+)\1/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(code))) found.add(m[2]);
  return [...found];
}

function staticBundleChecks(code: string, pkg: ExtensionPackage, issues: CheckIssue[]): void {
  for (const spec of bundleImports(code)) {
    if (spec in IMPORT_MAP_SPECIFIERS) continue;
    if (spec.startsWith("./") || spec.startsWith("../")) {
      const target = spec.replace(/^\.\//, "");
      issues.push(
        pkg.files.has(target)
          ? { level: "warn", code: "code-split", message: `The bundle imports a separate chunk (${spec}).`, hint: "Set build.rollupOptions.output.inlineDynamicImports: true so everything ships in one file." }
          : { level: "error", code: "missing-chunk", message: `The bundle imports ${spec}, which is not in the package.`, hint: "Set inlineDynamicImports: true (one bundle file)." },
      );
      continue;
    }
    if (/^(https?:|data:)/.test(spec)) continue;
    issues.push({
      level: "error",
      code: "unresolvable-import",
      message: `The bundle imports "${spec}", which the admin's import-map does not provide — the browser cannot load it.`,
      hint: `Bundle it (remove it from rollupOptions.external) — only ${Object.keys(IMPORT_MAP_SPECIFIERS).join(", ")} are provided by the admin.`,
    });
  }
  if (/__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED\s*=/.test(code)) {
    issues.push({ level: "error", code: "bundled-react", message: "The bundle contains its own copy of React — hooks will crash (\"Invalid hook call\").", hint: 'Add "react", "react/jsx-runtime", "react-dom", "react-dom/client" to rollupOptions.external.' });
  }
  if (/Target container is not a DOM element/.test(code)) {
    issues.push({ level: "error", code: "bundled-react-dom", message: "The bundle contains its own copy of react-dom.", hint: 'Add "react-dom" and "react-dom/client" to rollupOptions.external.' });
  }
  if (/pass in an i18next instance by using initReactI18next/.test(code)) {
    issues.push({ level: "error", code: "bundled-react-i18next", message: "The bundle contains its own copy of react-i18next — useTranslation() won't see the admin's translations.", hint: 'Add "react-i18next" to rollupOptions.external.' });
  }
  if (/\bjsxDEV\b/.test(code)) {
    issues.push({ level: "error", code: "jsx-dev", message: "The bundle was built with React's development JSX transform (jsxDEV / react/jsx-dev-runtime) — the admin only provides react/jsx-runtime, so every component throws \"jsxDEV is not a function\".", hint: 'Set esbuild: { jsx: "automatic", jsxDev: false } in vite.config.ts (or build with NODE_ENV=production).' });
  }
  if (/\bprocess\.env\.NODE_ENV\b/.test(code)) {
    issues.push({ level: "error", code: "process-env", message: "The bundle still reads process.env.NODE_ENV — it throws \"process is not defined\" in the browser.", hint: 'Add define: { "process.env.NODE_ENV": JSON.stringify("production") } to the Vite config.' });
  }
  if (/\bimport\.meta\.env\b/.test(code)) {
    issues.push({ level: "warn", code: "import-meta-env", message: "The bundle reads import.meta.env, which is undefined in the admin." });
  }
  if (code.length > 1_500_000) {
    issues.push({ level: "warn", code: "bundle-size", message: `bundle is ${(code.length / 1e6).toFixed(1)} MB — every admin page load downloads it.`, hint: "Check that React, the runtime and big libraries are not bundled; minify." });
  }
}

function checkCompanionScript(name: string, text: unknown, issues: CheckIssue[]): void {
  if (text == null) return;
  if (typeof text !== "string") {
    issues.push({ level: "error", code: "companion-js", message: `${name} must be a string (import it with ?raw).` });
    return;
  }
  try {
    new Script(text);
  } catch (err) {
    const msg = (err as Error).message;
    if (!/import|export/.test(msg)) issues.push({ level: "error", code: "companion-js-syntax", message: `${name} has a syntax error: ${msg}` });
  }
  if (/fetch\(\s*["'`]\//.test(text) && !/x-cms-base/.test(text)) {
    issues.push({ level: "warn", code: "companion-js-base", message: `${name} fetches root-absolute URLs without reading <meta name="x-cms-base"> — it breaks on sites hosted in a sub-folder.`, hint: 'Prefix paths with document.querySelector(\'meta[name="x-cms-base"]\')?.content ?? "".' });
  }
}

function checkTheme(t: ThemeManifest, issues: CheckIssue[]): void {
  const templates = (t.templates ?? {}) as Record<string, unknown>;
  for (const key of TEMPLATE_KEYS) {
    if (typeof templates[key] !== "function" && typeof (templates[key] as { $$typeof?: unknown })?.$$typeof !== "symbol") {
      issues.push({ level: "error", code: "template-missing", message: `templates.${key} is missing or not a React component.` });
    }
  }
  if (typeof t.cssText !== "string" || !t.cssText.trim()) {
    issues.push({ level: "error", code: "css-missing", message: "cssText is empty — Sync theme assets uploads nothing and every page's stylesheet 404s.", hint: 'import cssText from "./theme.css?raw" (or ?inline for SCSS) and set it on the manifest.' });
  }
  if (typeof t.scssEntry !== "string") {
    issues.push({ level: "warn", code: "scss-entry", message: "scssEntry is missing (required by the ThemeManifest type; use the CSS file name)." });
  }
  const f = t.imageFormats as ThemeManifest["imageFormats"];
  if (f) {
    if (!["webp", "jpeg", "png"].includes(String(f.outputFormat))) issues.push({ level: "error", code: "image-output", message: `imageFormats.outputFormat "${String(f.outputFormat)}" must be webp, jpeg or png.` });
    if (typeof f.quality !== "number" || f.quality < 1 || f.quality > 100) issues.push({ level: "error", code: "image-quality", message: "imageFormats.quality must be 1–100." });
    if (!f.formats || typeof f.formats !== "object" || !Object.keys(f.formats).length) issues.push({ level: "error", code: "image-formats", message: "imageFormats.formats must declare at least one format." });
    else {
      for (const [name, v] of Object.entries(f.formats)) {
        if (!(v?.width > 0) || !(v?.height > 0)) issues.push({ level: "error", code: "image-format-size", message: `imageFormats.formats.${name} needs positive width and height.` });
        if (name.startsWith("admin-")) issues.push({ level: "error", code: "image-format-reserved", message: `imageFormats.formats.${name}: "admin-*" names are reserved.` });
      }
      if (f.defaultFormat && !(f.defaultFormat in f.formats)) issues.push({ level: "error", code: "image-default", message: `imageFormats.defaultFormat "${f.defaultFormat}" is not one of the formats.` });
    }
    if (!Array.isArray(f.inputFormats)) issues.push({ level: "warn", code: "image-input", message: 'imageFormats.inputFormats should list the accepted file extensions, e.g. [".jpg", ".jpeg", ".png", ".webp", ".gif"].' });
    else if (f.inputFormats.some((x) => typeof x !== "string" || !x.startsWith("."))) {
      issues.push({ level: "error", code: "image-input", message: `imageFormats.inputFormats must be file extensions with a dot (".jpg"), got ${JSON.stringify(f.inputFormats)} — uploads would all be refused.` });
    }
  }
  if (t.compileCss != null) {
    if (typeof t.compileCss !== "function") issues.push({ level: "error", code: "compile-css", message: "compileCss must be a function (config) => css string." });
    else if (!t.settings) issues.push({ level: "warn", code: "compile-css-unused", message: "compileCss is only called for themes with a settings page (settings.defaultConfig)." });
    else {
      try {
        const out = t.compileCss(t.settings.defaultConfig);
        if (typeof out !== "string" || !out.trim()) issues.push({ level: "error", code: "compile-css-output", message: "compileCss(defaultConfig) did not return CSS text." });
      } catch (err) {
        issues.push({ level: "error", code: "compile-css-throws", message: `compileCss(defaultConfig) threw: ${(err as Error).message}` });
      }
    }
  }
  checkCompanionScript("jsText", t.jsText, issues);
  checkCompanionScript("jsTextPosts", t.jsTextPosts, issues);
  for (const b of t.blocks ?? []) checkBlock(b, issues);
  if (t.register != null && typeof t.register !== "function") issues.push({ level: "error", code: "theme-register", message: "register must be a function (api, ctx?) => void." });
}

function linkTargets(html: string): string[] {
  const out: string[] = [];
  const re = /\s(?:href|src)="(\/[^"#?]*)/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(html))) if (!m[1].startsWith("//")) out.push(m[1]);
  return out;
}

const textOf = (html: string) => html.replace(/<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>/g, " ").replace(/<[^>]+>/g, " ").replace(/&amp;/g, "&").replace(/&#x27;|&#39;/g, "'").replace(/&quot;/g, '"');

function checkRenderedSite(theme: ThemeManifest, res: PreviewResult, issues: CheckIssue[]): void {
  const html = (path: string | undefined) => (path ? readFileSync(join(res.outDir, path), "utf8") : null);
  const pages = Object.entries(res.pages).filter(([, p]) => p) as Array<[string, string]>;
  const files = new Set(res.files);
  const broken = new Map<string, Set<string>>();
  for (const [label, path] of pages) {
    const doc = html(path);
    if (doc == null) {
      issues.push({ level: "error", code: "page-missing", message: `The ${label} page was not rendered.` });
      continue;
    }
    const where = `${label} page (${path})`;
    if (!doc.includes(PROBE_HEAD)) {
      issues.push({ level: "error", code: "head-sentinel", message: `${where}: plugin <head> tags are dropped — BaseLayout lacks the head sentinel.`, hint: 'Put <meta name="x-cms-head-extra" /> inside <head> in BaseLayout.' });
    }
    if (!doc.includes(PROBE_BODY)) {
      issues.push({ level: "error", code: "body-sentinel", message: `${where}: plugin body-end scripts are dropped — BaseLayout lacks the body-end sentinel.`, hint: 'Put <script type="application/x-cms-body-end" /> just before </body> in BaseLayout.' });
    }
    if (!/<html[^>]*\slang="[^"]+"/.test(doc)) issues.push({ level: "error", code: "html-lang", message: `${where}: <html> has no lang attribute.`, hint: "lang={currentLocale || site.settings.language || \"en\"}" });
    if (!/<meta charSet="utf-8"|<meta charset="utf-8"/i.test(doc)) issues.push({ level: "warn", code: "charset", message: `${where}: no <meta charSet="utf-8" />.` });
    if (!/<meta name="viewport"/.test(doc)) issues.push({ level: "warn", code: "viewport", message: `${where}: no viewport meta — the site won't be responsive on phones.` });
    if (!/<title>[^<]+<\/title>/.test(doc)) issues.push({ level: "error", code: "title", message: `${where}: empty or missing <title>.`, hint: "Render pageTitle in BaseLayout." });
    if (!doc.includes(`/theme-assets/${theme.id}.css`) && !doc.includes(res.themeId + ".css")) {
      issues.push({ level: "error", code: "stylesheet", message: `${where}: no stylesheet link to /theme-assets/${theme.id}.css.`, hint: 'Use <link rel="stylesheet" href={"/" + site.themeCssPath} />.' });
    }
    if (label !== "notFound" && !/<link rel="canonical"/.test(doc)) {
      issues.push({ level: "warn", code: "canonical", message: `${where}: no <link rel="canonical">.`, hint: "canonicalUrl(site.settings.baseUrl, currentPath) in BaseLayout." });
    }
    if (/<meta name="x-cms-head-extra"|application\/x-cms-body-end/.test(doc)) {
      issues.push({ level: "error", code: "sentinel-left", message: `${where}: a sentinel survived rendering (wrong form?).`, hint: 'Exactly <meta name="x-cms-head-extra" /> and <script type="application/x-cms-body-end" />.' });
    }
    for (const target of linkTargets(doc)) {
      const file = target.replace(/^\/+/, "");
      const candidates = [file, file.endsWith("/") || file === "" ? `${file}index.html` : `${file}/index.html`];
      if (!candidates.some((c) => files.has(c))) {
        const set = broken.get(target) ?? new Set<string>();
        set.add(path);
        broken.set(target, set);
      }
    }
  }
  const single = html(res.pages.single);
  if (single) {
    const text = textOf(single);
    if (!text.includes("Why a static CMS?")) issues.push({ level: "error", code: "single-title", message: "The single template does not show the post title." });
    if (!text.includes("Faster first byte") || !single.includes("<h2")) {
      issues.push({ level: "error", code: "single-body", message: "The single template does not render the post body.", hint: "Render bodyHtml with <div dangerouslySetInnerHTML={{ __html: bodyHtml }} />." });
    }
    if (!single.includes("/media/demo/harbor/")) issues.push({ level: "warn", code: "single-hero", message: "The single template shows no hero image for a post that has one (props.hero)." });
  }
  const home = html(res.pages.home);
  if (home && !/why-a-static-cms\.html|choosing-where-to-host\.html|version-2-is-out\.html/.test(home)) {
    issues.push({ level: "warn", code: "home-posts", message: "The home page links to no post (props.posts / heroHtml / listHtml).", hint: "Ignore if the theme loads posts at runtime or is meant for a static home page." });
  }
  const category = html(res.pages.category);
  if (category && !textOf(category).includes("Guides")) issues.push({ level: "warn", code: "category-name", message: "The category archive does not show the category name (props.term.name)." });
  if (category && !/why-a-static-cms\.html/.test(category)) issues.push({ level: "warn", code: "category-posts", message: "The category archive lists none of its posts (props.posts)." });
  const author = html(res.pages.author);
  if (author && !textOf(author).includes("Ada Writer")) issues.push({ level: "warn", code: "author-name", message: "The author archive does not show the author's name (props.author.displayName)." });
  if (broken.size) {
    const list = [...broken.entries()].slice(0, 15).map(([t, from]) => `${t} (from ${[...from].slice(0, 3).join(", ")})`);
    issues.push({ level: "warn", code: "broken-links", message: `${broken.size} root-absolute link(s) point to files the site doesn't have: ${list.join("; ")}${broken.size > 15 ? "; …" : ""}.`, hint: "Fine for pages the user must create (e.g. /contact.html); otherwise build URLs from props." });
  }
}

export interface CheckOptions {
  // Keep the rendered demo site there instead of a temp folder.
  previewDir?: string;
  // Expected kind (from the command line).
  kind?: "plugin" | "theme";
}

export async function checkExtension(pkg: ExtensionPackage, opts: CheckOptions = {}): Promise<CheckReport> {
  const host = await bootExtensionHost();
  const hostApi = { version: host.cmsRuntime.CMS_API_VERSION, min: host.cmsRuntime.CMS_API_MIN_VERSION };
  const issues: CheckIssue[] = [];
  const files = [...pkg.files.entries()].map(([path, buf]) => ({ path, bytes: buf.length })).sort((a, b) => a.path.localeCompare(b.path));
  const report: CheckReport = {
    valid: false,
    kind: null,
    id: null,
    name: null,
    version: null,
    apiVersion: null,
    hostApi,
    package: { source: pkg.source, sourceType: pkg.sourceType, files, bytes: files.reduce((n, f) => n + f.bytes, 0) },
    errors: [],
    warnings: [],
    registered: null,
    settingsSchema: null,
    blocks: [],
    output: null,
  };
  const done = () => {
    report.errors = issues.filter((i) => i.level === "error");
    report.warnings = issues.filter((i) => i.level === "warn");
    report.valid = report.errors.length === 0;
    return report;
  };

  // ── manifest.json (what the install dialog validates) ──
  const mj = pkg.manifest;
  if (pkg.manifestText == null) {
    issues.push({ level: "error", code: "no-manifest", message: "manifest.json is missing at the package root.", hint: "The ZIP root must hold manifest.json and the bundle." });
    return done();
  }
  if (!mj) {
    issues.push({ level: "error", code: "manifest-json", message: "manifest.json is not a JSON object." });
    return done();
  }
  report.id = typeof mj.id === "string" ? mj.id : null;
  report.name = typeof mj.name === "string" ? mj.name : null;
  report.version = typeof mj.version === "string" ? mj.version : null;
  report.apiVersion = typeof mj.apiVersion === "string" ? mj.apiVersion : null;
  if (!report.id) issues.push({ level: "error", code: "manifest-id", message: "manifest.json has no id." });
  else if (!ID_PATTERN.test(report.id)) {
    issues.push({ level: "error", code: "manifest-id", message: `id "${report.id}" must be lower-case letters, digits and single dashes.`, hint: "The admin strips other characters, so the bundle's id would no longer match." });
  }
  if (!report.name) issues.push({ level: "error", code: "manifest-name", message: "manifest.json has no name." });
  if (!report.version) issues.push({ level: "error", code: "manifest-version", message: "manifest.json has no version." });
  else if (!SEMVER.test(report.version)) issues.push({ level: "warn", code: "manifest-version", message: `version "${report.version}" is not semver (x.y.z).` });
  if (!report.apiVersion) {
    issues.push({ level: "error", code: "manifest-api", message: "manifest.json has no apiVersion.", hint: `Use "${hostApi.version}" (the API you build against).` });
  } else if (!SEMVER.test(report.apiVersion)) {
    issues.push({ level: "error", code: "manifest-api", message: `apiVersion "${report.apiVersion}" is not x.y.z.` });
  } else if (compareSemver(report.apiVersion, hostApi.version) > 0) {
    issues.push({ level: "error", code: "api-too-new", message: `apiVersion ${report.apiVersion} is newer than this admin's API ${hostApi.version} — the admin refuses to install it.`, hint: "Lower apiVersion, or update the site's admin." });
  } else if (compareSemver(report.apiVersion, hostApi.min) < 0) {
    issues.push({ level: "error", code: "api-too-old", message: `apiVersion ${report.apiVersion} is older than the oldest supported API ${hostApi.min}.` });
  }
  if (mj.kind != null && mj.kind !== "plugin" && mj.kind !== "theme") issues.push({ level: "warn", code: "manifest-kind", message: `kind "${String(mj.kind)}" is neither "plugin" nor "theme".` });
  for (const p of pkg.ignored) issues.push({ level: "warn", code: "zip-extra", message: `ZIP entry ${p} is outside the package root and is ignored.` });
  if (pkg.files.has("manifest.json") && !pkg.files.has("README.md")) {
    issues.push({ level: "warn", code: "readme", message: "No README.md in the package.", hint: "Ship one and set manifest.readme (import readme from \"../README.md?raw\") so the admin's \"Learn more\" works." });
  }

  // ── bundle ──
  const code = bundleSource(pkg);
  if (code == null) {
    issues.push({ level: "error", code: "no-bundle", message: `The entry file ${pkg.entry} is not in the package.`, hint: pkg.sourceType === "project" ? "Build first (npm run build)." : undefined });
    return done();
  }
  staticBundleChecks(code, pkg, issues);
  if (issues.some((i) => i.code === "unresolvable-import" || i.code === "missing-chunk")) return done();

  let loaded: Awaited<ReturnType<typeof importExtensionBundle>>;
  try {
    loaded = await importExtensionBundle(code);
  } catch (err) {
    issues.push({ level: "error", code: "import-failed", message: `Importing the bundle failed: ${(err as Error).stack ?? (err as Error).message}`, hint: "This is what the admin's loader would hit at boot." });
    return done();
  }
  const m = loaded.manifest as (PluginManifest & ThemeManifest) | null;
  if (!m || typeof m !== "object" || typeof (m as { id?: unknown }).id !== "string") {
    issues.push({ level: "error", code: "no-export", message: "The bundle exports no manifest object.", hint: "export default manifest (an object with id, name, version, …)." });
    return done();
  }
  if (report.id && m.id !== report.id) {
    issues.push({ level: "error", code: "id-mismatch", message: `The bundle's manifest id "${m.id}" differs from manifest.json id "${report.id}" — the admin rejects it.` });
  }
  if (report.version && m.version !== report.version) {
    issues.push({ level: "warn", code: "version-mismatch", message: `The bundle says version ${String(m.version)}, manifest.json says ${report.version}.` });
  }
  if (typeof m.name !== "string" || !m.name) issues.push({ level: "error", code: "bundle-name", message: "The bundle's manifest has no name." });
  const kind: "plugin" | "theme" = m.templates ? "theme" : "plugin";
  report.kind = kind;
  if (opts.kind && opts.kind !== kind) issues.push({ level: "error", code: "kind", message: `Expected a ${opts.kind}, the bundle is a ${kind}.` });
  if (mj.kind && mj.kind !== kind) issues.push({ level: "warn", code: "manifest-kind", message: `manifest.json kind "${mj.kind}" but the bundle is a ${kind}.` });

  const schema = (m.settings as { schema?: Record<string, unknown> } | undefined)?.schema;
  if (schema && typeof schema === "object") report.settingsSchema = { documented: Object.keys(schema).length, paths: Object.keys(schema) };
  else if (m.settings) issues.push({ level: "warn", code: "settings-undocumented", message: "settings has no schema: agents get the defaults without explanations from `config --schema`.", hint: "Add settings.schema (API 1.5): { \"<path>\": { description, values?, min?, max?, format? } }." });
  const rec = emptyRegistrations();
  report.registered = rec;
  const blockManifests: BlockManifest[] = [];
  if (kind === "plugin") {
    if (typeof m.register !== "function") {
      issues.push({ level: "error", code: "register", message: "A plugin must have register(api)." });
      return done();
    }
    if (m.readme != null && typeof m.readme !== "string") issues.push({ level: "error", code: "readme-type", message: "readme must be a string (import it with ?raw)." });
    checkI18nAndSettings(m, issues, m.id);
    try {
      m.register(recordingApi(rec, issues, blockManifests) as never);
    } catch (err) {
      issues.push({ level: "error", code: "register-throws", message: `register(api) threw: ${(err as Error).stack ?? (err as Error).message}` });
    }
  } else {
    checkTheme(m, issues);
    checkI18nAndSettings(m, issues, `theme-${m.id}`);
    if (typeof m.register === "function") {
      try {
        m.register(recordingApi(rec, issues, blockManifests) as never, { settings: { ...host.defaultSettings, activeThemeId: m.id } });
      } catch (err) {
        issues.push({ level: "error", code: "register-throws", message: `register(api) threw: ${(err as Error).stack ?? (err as Error).message}` });
      }
    }
    for (const b of m.blocks ?? []) {
      rec.blocks.push(String((b as { id?: string }).id));
      blockManifests.push(b);
    }
  }
  // Block attribute docs (API 1.6), read by `content blocks <id>`.
  for (const b of blockManifests) {
    const schema = (b as { attrsSchema?: Record<string, { description?: unknown }> }).attrsSchema;
    if (schema === undefined) {
      issues.push({ level: "warn", code: "block-undocumented", message: `Block ${b.id} has no attrsSchema: agents writing its marker can't tell what each attribute does.`, hint: "Add attrsSchema (API 1.6): { \"<attr>\": { description, values?, min?, max?, format? } }." });
    } else if (typeof schema !== "object" || schema === null) {
      issues.push({ level: "error", code: "block-attrs-schema", message: `Block ${b.id}: attrsSchema must be an object keyed by attribute.` });
    } else {
      for (const [k, d] of Object.entries(schema)) {
        if (!d || typeof d.description !== "string" || !d.description.trim()) issues.push({ level: "warn", code: "block-attrs-description", message: `Block ${b.id}: attrsSchema["${k}"] has no description.` });
      }
    }
  }
  for (const f of rec.filters) {
    if (!KNOWN_FILTERS.includes(f.hook)) {
      issues.push({ level: "warn", code: "unknown-hook", message: `addFilter("${f.hook}"): no code fires this filter${KNOWN_ACTIONS.includes(f.hook) ? " (it is an ACTION — use addAction)" : ""}.`, hint: `Known filters: ${KNOWN_FILTERS.join(", ")}.` });
    }
    if (f.async && SYNC_FILTERS.includes(f.hook)) {
      issues.push({ level: "error", code: "async-sync-filter", message: `addFilter("${f.hook}") got an async function — this filter runs synchronously and a Promise throws at render time.`, hint: "Make the callback synchronous; prepare async data in a publish.before action." });
    }
  }
  for (const a of rec.actions) {
    if (!KNOWN_ACTIONS.includes(a.hook)) {
      issues.push({ level: "warn", code: "unknown-hook", message: `addAction("${a.hook}"): no code fires this action${KNOWN_FILTERS.includes(a.hook) ? " (it is a FILTER — use addFilter and return the value)" : ""}.`, hint: `Known actions: ${KNOWN_ACTIONS.join(", ")}.` });
    }
  }
  const dup = rec.blocks.filter((b, i) => rec.blocks.indexOf(b) !== i);
  if (dup.length) issues.push({ level: "error", code: "block-duplicate", message: `Block ids registered twice: ${[...new Set(dup)].join(", ")}.` });

  // ── render: the demo site, as the admin would publish it ──
  if (issues.some((i) => i.level === "error" && ["register-throws", "template-missing", "id-mismatch"].includes(i.code))) return done();
  // Blocks read their labels / sample text from the bundle's i18n.
  if (kind === "plugin") host.plugins.loadExternalPluginTranslations(m);
  else host.themes.loadExternalThemeTranslations(m);
  let trials: BlockTrial[] = [];
  const insertable = blockManifests.filter((b) => b && typeof b.insert === "function");
  if (insertable.length) {
    try {
      trials = await tryBlocks(insertable);
    } catch (err) {
      issues.push({ level: "error", code: "block-editor", message: `Could not run the blocks in an editor: ${(err as Error).message}` });
    }
    for (const t of trials) for (const i of t.issues) issues.push({ level: i.level, code: "block-roundtrip", message: `Block ${t.id}: ${i.message}` });
    for (const t of trials) if (t.isActiveAfterInsert === false) issues.push({ level: "warn", code: "block-is-active", message: `Block ${t.id}: isActive(editor) is false right after inserting it — the inspector's Block tab won't show its settings.` });
  }
  const blockMarkdown = blockTestMarkdown(trials);
  const extraPosts = blockMarkdown ? [{ id: "page-block-test", type: "page", title: "Block test", slug: "block-test", contentMarkdown: blockMarkdown, authorId: "author-ada", termIds: [], status: "online", createdAt: Date.UTC(2026, 0, 2), updatedAt: Date.UTC(2026, 0, 2) }] : undefined;
  const tmp = mkdtempSync(join(tmpdir(), "agentcms-check-"));
  const ext: LoadedExtension = { kind, id: m.id, manifest: m };
  const probe = (api: { addFilter: (h: string, fn: (v: string) => string, p?: number) => void }) => {
    api.addFilter("page.head.extra", (v) => `${v}${PROBE_HEAD}`, 1_000_000);
    api.addFilter("page.body.end", (v) => `${v}${PROBE_BODY}`, 1_000_000);
  };
  try {
    const previewDir = opts.previewDir ?? join(tmp, "site");
    // Plugins: render the same site without the plugin FIRST (React
    // prints each development warning once per process, so the order
    // matters for telling the plugin's own warnings apart).
    const simulate = kind === "plugin";
    const base = kind === "plugin" ? await renderPreview({ outDir: join(tmp, "baseline"), baseUrl: "http://localhost:4321", extensions: [], afterRegister: probe, extraPosts, lifecycle: simulate }) : null;
    const res = await renderPreview({ outDir: previewDir, baseUrl: "http://localhost:4321", extensions: [ext], afterRegister: probe, extraPosts, lifecycle: simulate });
    if (extraPosts) {
      const page = res.files.includes("block-test.html") ? readFileSync(join(res.outDir, "block-test.html"), "utf8") : null;
      for (const t of trials.filter((x) => x.markdown)) {
        let published: string | null = null;
        if (page) {
          const marker = new RegExp(`<div[^>]*data-cms-block="${t.id.replace(/[.*+?^${}()|[\]\\/]/g, "\\$&")}"[^>]*>\\s*</div>`);
          const own = blockOutput(page, t.id);
          published = own === null ? null : own.trim().slice(0, 3000);
          if (own !== null && !/<(img|iframe|svg|video|picture|canvas|input|button)\b/i.test(own) && !own.replace(/<style[\s\S]*?<\/style>|<script[\s\S]*?<\/script>/gi, "").replace(/<[^>]+>/g, "").trim()) {
            issues.push({
              level: "warn",
              code: "block-empty-output",
              message: `Block ${t.id}: right after insert() (the editor's "+" menu, with ctx.pickMedia answering a demo image), the published page shows nothing for it.`,
              hint: "Fine if it needs content first — but then ask for it in insert() (ctx.pickMedia, window.prompt) or insert sample content, so the editor and the check show something.",
            });
          }
          if (marker.test(page)) {
            issues.push({ level: "warn", code: "block-not-rendered", message: `Block ${t.id}: its empty marker <div data-cms-block="${t.id}"> reaches the published page unchanged.`, hint: "Replace it in a post.html.body filter (or render visible HTML from renderHTML)." });
          }
        }
        report.blocks.push({ id: t.id, markdown: t.markdown, published });
      }
    }
    let added = res.files;
    let changed: string[] = [];
    if (kind === "theme") {
      for (const i of res.issues) issues.push({ level: i.level, code: `render-${i.source}`, message: i.message });
      checkRenderedSite(m, res, issues);
    } else if (base) {
      // Only what the plugin adds (files, changes, console errors) is reported.
      const known = new Set(base.issues.map((i) => i.message));
      for (const i of res.issues) if (!known.has(i.message)) issues.push({ level: i.level, code: `render-${i.source}`, message: i.message });
      const baseFiles = new Set(base.files);
      added = res.files.filter((f) => !baseFiles.has(f));
      // JSON snapshots carry a generatedAt timestamp — not a change.
      const norm = (dir: string, f: string) => readFileSync(join(dir, f), "utf8").replace(/"generatedAt":"[^"]*"/g, "");
      changed = res.files.filter((f) => baseFiles.has(f) && norm(res.outDir, f) !== norm(base.outDir, f));
    }
    const steps = res.lifecycle.map((step) => {
      const core = base?.lifecycle.find((b) => b.step === step.step);
      const minus = (mine: string[], theirs: string[] | undefined) => mine.filter((f) => !(theirs ?? []).includes(f));
      return {
        step: step.step,
        description: step.description,
        added: minus(step.added, core?.added),
        changed: minus(step.changed, core?.changed),
        removed: minus(step.removed, core?.removed),
      };
    });
    report.output = { previewDir: opts.previewDir ? res.outDir : null, pages: res.pages, added, changed, lifecycle: steps };
    if (kind === "plugin") {
      const lifecycleActions = rec.actions.filter((a) => ["publish.complete", "publish.after", "post.unpublished", "post.deleted"].includes(a.hook));
      if (lifecycleActions.length && rec.regenerationTargets.length === 0) {
        issues.push({
          level: "warn",
          code: "no-regeneration-target",
          message: `The plugin reacts to ${[...new Set(lifecycleActions.map((a) => a.hook))].join(", ")} but registers no regeneration target — bulk publishing, imports and Regenerate never fire those actions, so its output goes stale.`,
          hint: "api.registerRegenerationTarget({ id, labelKey, run: async (ctx, log) => { …rebuild… } }).",
        });
      }
    }
  } catch (err) {
    issues.push({ level: "error", code: "render-failed", message: `Rendering the demo site failed: ${(err as Error).stack ?? (err as Error).message}` });
  } finally {
    rmSync(tmp, { recursive: true, force: true });
  }
  return done();
}

export { listFiles };
