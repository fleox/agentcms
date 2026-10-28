import { canonicalUrl as z, getActiveTheme as W, renderMarkdown as Ae, applyFilters as Ee, markdownToPlainText as ue, renderPageToHtml as de, renderHome as Ue, updatePost as J, updatePluginConfig as De, getStorageCapabilities as Fe, deleteFolder as Oe, deleteFile as V, pathToPublicUrl as X, publishPostsJson as He, publishAuthorsJson as _e, useCmsData as pe, toast as K, isValidSlug as he, fetchAllPosts as se } from "@agent-cms/runtime";
import { jsxs as L, jsx as h } from "react/jsx-runtime";
import { useState as ae } from "react";
import { useTranslation as me } from "react-i18next";
const Re = {
  primaryLanguage: {
    description: 'Language of the main content, published at the root (no prefix). Must equal the site language (`settings get site` → language; its base code, e.g. "en" for "en-US"): set both together, then `regenerate everything`.',
    format: "language code (en, fr, es-MX…)"
  },
  enabledLanguages: {
    description: "The OTHER languages the site publishes, each under /<lang>/ with per-entry translations — don't repeat primaryLanguage. Array of language codes in display order (the admin offers en, fr, de, es, nl, pt, ko; any BCP-47 code works). Changing it needs `regenerate everything` (all pages + every plugin target: translations, per-language homes / archives / data JSON / feeds / sitemaps / search indexes). A removed language's whole /<lang>/ tree is deleted on that pass (in fact on the next listing pass — any publish).",
    format: "array of language codes"
  },
  homePages: {
    description: `Optional home page per secondary language: { "<lang>": "<page id>" } renders that online page (with its translation) at /<lang>/. A missing or empty entry uses the site's own home (the static home page's translation, or the latest posts).`,
    format: "map of language code → page id"
  },
  siteTexts: {
    description: 'Optional site title and description per secondary language: { "<lang>": { "title": "…", "description": "…" } }. Replace settings.title / settings.description on that language\'s pages (header, footer, <title>, og:site_name, data JSON) and as its RSS channel title (otherwise "<site title> (<Language>)"). Empty or missing = the primary texts. Needs `regenerate everything`.',
    format: "map of language code → { title?, description? }"
  },
  menuTranslations: {
    description: 'Legacy, not read by the plugin — don\'t set. Menu labels per language go on the menu items (`translations: { "fr": { "label": "…" } }` with `menus set`).'
  },
  showHeaderSwitcher: {
    description: "Show the language switcher in the site header (themes provide a [data-cms-langswitch] container; built-in themes do). Only shown when enabledLanguages is not empty."
  },
  showFooterSwitcher: {
    description: "Show the language switcher in the site footer too. Only shown when enabledLanguages is not empty."
  },
  lastPublishedLanguages: {
    description: "Managed by the plugin — don't set. Secondary languages published on the last listing pass; a language that leaves enabledLanguages has its /<lang>/ tree deleted on the next pass."
  }
}, ze = '# agentcms-multilang\n\nMulti-language support for AgentCMS — translated posts, pages, categories and tags, hreflang SEO, per-language sitemaps and RSS feeds, and a public language switcher.\n\n## What it does\n\n- **Language tabs in the editor**: an editor *variant provider* adds a tab strip above the post / page editor, one tab per language (★ = primary). Switching tab swaps the whole editor — title, slug, content (blocks included), excerpt and SEO — so every language gets the same authoring experience. Translation tabs appear once the post has been saved once.\n- **Term translations**: a collapsible section in each row of **Categories / Tags** holds the per-language `name`, `slug`, description and SEO.\n- **URL strategy**: the primary language lives at the site root (`site.com/news/hello.html`); every other enabled language lives under its own prefix (`site.com/fr/actualites/bonjour.html`), with its own home (`/fr/index.html`, optionally a static page per language) and category archives. The page that drives a language\'s home (its per-language home page, else the site\'s static home page) is published only at that home — never also as `/fr/<slug>.html` — and sitemaps / hreflang list it as `/fr/`, like the core does for the primary static home.\n- **SEO**: `<link rel="alternate" hreflang="…">` for every language plus `x-default`, `og:locale` and `og:locale:alternate` on every published page, and `<html lang>` per page (`BaseLayoutProps.currentLocale`). The canonical link stays the theme\'s job: the publisher hands the theme the localized `currentPath`, so a theme that emits `canonicalUrl(baseUrl, currentPath)` gets the right per-language canonical.\n- **Sitemaps** (with `agentcms-sitemaps` enabled): `<xhtml:link rel="alternate">` entries inside each `<url>`, the translated URLs in the yearly sitemaps, and — when News is enabled — one `sitemaps/sitemap-news-<lang>.xml` per secondary language, referenced from the index.\n- **RSS** (with `agentcms-rss` enabled and its site feed on): one `/<lang>/rss.xml` per secondary language, through the RSS plugin\'s `rss.site.locales` filter. Legacy `/<lang>/feed.xml` and per-category `/<lang>/<slug>/<slug>.xml` files from versions ≤ 1.6.1 are deleted on the next publish.\n- **Search** (with `agentcms-search` enabled): one `/<lang>/search-index.json` per secondary language (translated titles, excerpts, categories and URLs, UI strings in that language), through the search plugin\'s `search.index.locales` filter. The search modal on `/<lang>/` pages loads it.\n- **Site title and description per language** (`siteTexts`, optional): replace the site title / description of Settings → General on that language\'s pages (header, footer, `<title>`, data JSON) and as its RSS channel title.\n- **Removing a language**: the plugin remembers the languages it published (`lastPublishedLanguages`); after a language leaves the list, the next listing pass (any publish, or **Regenerate → Everything**) deletes its whole `/<lang>/` tree — folder delete when the hosting supports it, else the known files.\n- **Language switcher**: a small script injected through `page.body.end` fills `[data-cms-langswitch="header"]` and `[data-cms-langswitch="footer"]` containers with links to the current page\'s alternates (toggles in the plugin settings). The in-tree themes (default, magazine, corporate, storefront, portfolio) ship these containers; other themes just add an empty `<div data-cms-langswitch="header"></div>`.\n\n## Requirements\n\n- AgentCMS admin with runtime API **1.4.0** or newer (the plugin uses `registerEditorVariantProvider`, `publish.before(post, ctx)`, `regenerate.listings.before` and `sitemap.news.locales`).\n- The plugin ships pre-installed with AgentCMS (bundled default); this folder is its source.\n\n## Build and install (from source)\n\n1. `npm install --legacy-peer-deps`\n2. `npm run build` — type-checks, produces `dist/bundle.js` + `agentcms-multilang.zip`\n3. In the admin, **Plugins** → **Install plugin** → drop the ZIP (same id = in-place upgrade).\n4. Open **Settings → Multi-language** and pick the primary language + additional languages.\n\n## Workflow\n\n1. Write the post in the primary language with the standard editor and save it.\n2. Click a language tab above the editor and fill the title, slug, content, excerpt and SEO for that language. Save.\n3. Publish. The publisher renders the primary version and every translation in one pass (`publish.additional`), each at its own path; removed translations are deleted from the site.\n\n## Storage\n\n- Per-post translations live on `Post.translations[<lang>]` (`{ slug, title, contentMarkdown, excerpt, seo }`).\n- Per-term translations live on `Term.translations[<lang>]` (`{ slug, name, description, seo }`).\n- Published translation paths are tracked in `Post.lastPublishedPathsByLocale` (orphan cleanup).\n- Plugin config (languages, primary, per-language home page, per-language site texts, switcher toggles, published-languages bookkeeping) lives in `settings.pluginConfigs["agentcms-multilang"]`.\n\nAll storage flows through the standard backend dispatcher — it works the same on every data backend (Firebase, SQLite file, Markdown in git, this browser).\n\n## Theme compatibility\n\nTranslated pages render through the **active theme exactly as the primary publisher does** — same templates, BaseLayout and CSS. Themes should:\n\n- use `currentLocale` for `<html lang>` and `site.homePath ?? "/index.html"` for home links;\n- render translated menu labels from `item.labels[<lang>]` in their menu loader (the bundled loaders do);\n- add `[data-cms-langswitch]` containers where the switcher should appear.\n\nBlock markers in translated content go through the same `post.html.body` filters as the primary render. Those filters receive a per-language publish context as an extra third argument (`ctx.settings.language` = the target language), because `getCurrentPublishContext()` is only set during the core\'s own renders.\n\n## Known limitations\n\n- Theme-specific rich homes (e.g. magazine\'s hero / sidebar widgets) are not replicated in secondary languages. Pick a **static page** as the home of each language for full control.\n- `post.markdown.before` and `post.template.props` filters don\'t run for translated renders.\n- The archives plugin\'s per-language pages (`/<lang>/archives/…`) don\'t use the translated site texts yet.\n- Adding a language needs **Regenerate → Everything** (translations, homes, archives, data JSON, feeds, sitemaps, search).\n- Concurrent edits to one post\'s translations are last-write-wins (one document / row per post).\n', je = { title: "Multi-language", intro: "Configure additional languages. Each enabled language gets its own URL prefix and per-post translations.", save: "Save settings", saving: "Saving…", saved: "Saved.", primaryLanguage: { title: "Primary language", help: "Pages in this language live at the root URL (no language prefix). All other languages render under /<lang>/.", siteHint: 'Site language is currently "{{lang}}".' }, enabledLanguages: { title: "Additional languages", help: "Click a language to toggle it. Enabled languages appear in the editor's Translations tab + on the public site under /<lang>/." }, homePages: { title: "Home page per language", help: "Optional: pick a static page (in the corresponding language) to render at /<lang>/. Leave empty for a basic latest-posts list.", none: "— Latest posts —" }, siteTexts: { title: "Site title and description per language", help: "Optional: shown instead of the site title and description (Settings → General) on the pages of each language — header, footer, page titles, RSS channel. Leave empty to keep the primary-language texts. Apply with Regenerate → Everything.", siteTitle: "Site title", siteDescription: "Site description" }, switcher: { title: "Language switcher", help: "Show a language switcher on the public site. Themes must include a [data-cms-langswitch] container in their Header / Footer for the switcher to appear (built-in themes already do).", header: "Show switcher in the site header", footer: "Show switcher in the site footer" } }, Be = { label: "Multi-language files", description: "Per-language data files (/<lang>/data/*.json) + removal of the files of languages no longer enabled" }, qe = { label: "Translations", noLanguages: "No additional languages are configured for this site.", configureLanguages: "Configure languages", editPrimaryInMain: "Edit the primary language in the main editor (title, slug, content above).", save: "Save translations", saving: "Saving…", saved: "Translations saved.", duplicate: "Duplicate from primary", invalidSlug: "Invalid slug for {{lang}}.", fields: { title: "Title", slug: "Slug", slugHelp: "Lower-case ASCII + dashes only.", excerpt: "Excerpt", content: "Content (Markdown)", contentHelp: "Plain Markdown. Theme blocks (Hero, embeds, etc.) embedded in the primary language do NOT replicate automatically — paste your translated body here.", seo: "SEO", seoTitle: "SEO title", seoDescription: "Meta description" } }, Ge = { title: "Translations", name: "Name", slug: "Slug", invalidSlug: "Invalid slug", seoTitle: "SEO meta title", seoDescription: "SEO meta description", noLanguages: "Enable secondary languages in the Multi-language plugin settings to translate this term." }, Je = {
  settings: je,
  regenerationTarget: Be,
  tab: qe,
  termSection: Ge
}, Ve = { title: "Multilingue", intro: "Configurez les langues supplémentaires. Chaque langue activée obtient son préfixe d'URL et des traductions par contenu.", save: "Sauvegarder", saving: "Sauvegarde…", saved: "Sauvegardé.", primaryLanguage: { title: "Langue principale", help: "Les pages dans cette langue se trouvent à la racine du site (sans préfixe). Les autres langues sont sous /<lang>/.", siteHint: "La langue du site est actuellement « {{lang}} »." }, enabledLanguages: { title: "Langues supplémentaires", help: "Cliquez une langue pour l'activer. Les langues activées apparaissent dans l'onglet Traductions de l'éditeur et sur le site public sous /<lang>/." }, homePages: { title: "Page d'accueil par langue", help: "Optionnel : choisissez une page statique (dans la langue correspondante) pour servir d'accueil à /<lang>/. Sinon, une liste des derniers articles est rendue.", none: "— Derniers articles —" }, siteTexts: { title: "Titre et description du site par langue", help: "Optionnel : affichés à la place du titre et de la description du site (Réglages → Général) sur les pages de chaque langue — en-tête, pied de page, titres des pages, canal RSS. Laissez vide pour garder les textes de la langue principale. Appliquez avec Régénérer → Tout.", siteTitle: "Titre du site", siteDescription: "Description du site" }, switcher: { title: "Sélecteur de langue", help: "Affiche un sélecteur de langue sur le site public. Les thèmes doivent intégrer un conteneur [data-cms-langswitch] dans leur Header / Footer pour que le sélecteur apparaisse (les thèmes intégrés le font déjà).", header: "Afficher le sélecteur dans l'en-tête du site", footer: "Afficher le sélecteur dans le pied de page du site" } }, Ke = { label: "Fichiers multilingues", description: "Fichiers de données par langue (/<lang>/data/*.json) + suppression des fichiers des langues retirées" }, We = { label: "Traductions", noLanguages: "Aucune langue supplémentaire n'est configurée.", configureLanguages: "Configurer les langues", editPrimaryInMain: "Modifiez la langue principale dans l'éditeur (titre, slug, contenu ci-dessus).", save: "Sauvegarder les traductions", saving: "Sauvegarde…", saved: "Traductions sauvegardées.", duplicate: "Dupliquer depuis la langue principale", invalidSlug: "Slug invalide pour {{lang}}.", fields: { title: "Titre", slug: "Slug", slugHelp: "Caractères ASCII minuscules + tirets uniquement.", excerpt: "Extrait", content: "Contenu (Markdown)", contentHelp: "Markdown simple. Les blocs de thème (Hero, embeds, etc.) intégrés dans la langue principale ne sont PAS répliqués automatiquement — collez votre contenu traduit ici.", seo: "SEO", seoTitle: "Titre SEO", seoDescription: "Méta description" } }, Xe = { title: "Traductions", name: "Nom", slug: "Slug", invalidSlug: "Slug invalide", seoTitle: "Titre meta SEO", seoDescription: "Description meta SEO", noLanguages: "Activez des langues secondaires dans les réglages du plugin Multilingue pour traduire ce terme." }, Qe = {
  settings: Ve,
  regenerationTarget: Ke,
  tab: We,
  termSection: Xe
}, O = {
  primaryLanguage: "en",
  enabledLanguages: [],
  homePages: {},
  menuTranslations: {},
  showHeaderSwitcher: !0,
  showFooterSwitcher: !1,
  siteTexts: {}
}, R = "agentcms-multilang";
function v(n) {
  var t;
  const e = (t = n.pluginConfigs) == null ? void 0 : t[R];
  return {
    ...O,
    // Default the primary language to the site's BCP-47 language tag
    // so a fresh install picks the right value without manual setup.
    primaryLanguage: (e == null ? void 0 : e.primaryLanguage) || (n.language || "en").split("-")[0],
    enabledLanguages: (e == null ? void 0 : e.enabledLanguages) ?? [],
    homePages: (e == null ? void 0 : e.homePages) ?? {},
    menuTranslations: (e == null ? void 0 : e.menuTranslations) ?? {},
    showHeaderSwitcher: (e == null ? void 0 : e.showHeaderSwitcher) ?? O.showHeaderSwitcher,
    showFooterSwitcher: (e == null ? void 0 : e.showFooterSwitcher) ?? O.showFooterSwitcher,
    siteTexts: (e == null ? void 0 : e.siteTexts) ?? {},
    ...e != null && e.lastPublishedLanguages ? { lastPublishedLanguages: e.lastPublishedLanguages } : {}
  };
}
function w(n, e) {
  return n.primaryLanguage === e;
}
function F(n, e, t) {
  var o, r, l;
  const s = w(t, e) || (o = t.siteTexts) == null ? void 0 : o[e], a = (r = s == null ? void 0 : s.title) == null ? void 0 : r.trim(), i = (l = s == null ? void 0 : s.description) == null ? void 0 : l.trim();
  return {
    ...n,
    language: e,
    ...a ? { title: a } : {},
    ...i ? { description: i } : {}
  };
}
function H(n) {
  const { post: e, trans: t, primaryTermTrans: s, primaryTermSlug: a, language: i, config: o } = n, r = w(o, i) ? "" : `${i}/`;
  if (e.type === "page")
    return `${r}${t.slug}.html`;
  const l = (s == null ? void 0 : s.slug) ?? a;
  return l ? `${r}${l}/${t.slug}.html` : `${r}${t.slug}.html`;
}
function Q(n, e, t, s) {
  if (n.type !== "category")
    throw new Error(`buildLocalizedTermUrl: term type "${n.type}" is not supported (categories only).`);
  return `${w(s, t) ? "" : `${t}/`}${e.slug}/index.html`;
}
function _(n, e) {
  return w(e, n) ? "index.html" : `${n}/index.html`;
}
function Ye(n, e, t) {
  var s;
  if (!w(e, t)) {
    const a = (s = e.homePages) == null ? void 0 : s[t];
    if (a) return a;
  }
  if (n.homeMode === "static-page" && n.homePageId) return n.homePageId;
}
function Y(n, e, t, s) {
  if (!e || n.type !== "page") return !1;
  const a = Ye(e, t, s);
  return !!a && a === n.id;
}
function fe(n) {
  return Y(n.post, n.settings, n.config, n.language) ? _(n.language, n.config) : H(n);
}
function M(n, e) {
  const t = n.translations, s = t == null ? void 0 : t[e];
  return !s || !s.slug || !s.title ? null : s;
}
function P(n, e) {
  const t = n.translations, s = t == null ? void 0 : t[e];
  return !s || !s.slug || !s.name ? null : s;
}
function j(n) {
  return {
    slug: n.slug,
    title: n.title,
    contentMarkdown: n.contentMarkdown,
    excerpt: n.excerpt,
    seo: n.seo
  };
}
function B(n) {
  return {
    slug: n.slug,
    name: n.name,
    description: n.description,
    seo: n.seo
  };
}
function ie(n) {
  const e = n.replace("-", "_");
  return e.includes("_") ? e : {
    en: "en_US",
    fr: "fr_FR",
    es: "es_ES",
    de: "de_DE",
    nl: "nl_NL",
    pt: "pt_PT",
    ko: "ko_KR",
    it: "it_IT",
    ja: "ja_JP"
  }[e] ?? `${e}_${e.toUpperCase()}`;
}
function C(n) {
  return n.replace(/[&<>"']/g, (e) => {
    switch (e) {
      case "&":
        return "&amp;";
      case "<":
        return "&lt;";
      case ">":
        return "&gt;";
      case '"':
        return "&quot;";
      default:
        return "&apos;";
    }
  });
}
function G(n, e, t) {
  const s = e.replace(/\/+$/, "");
  if (!s) return "";
  const a = [];
  for (const o of n.alternates) {
    const r = z(s, o.path);
    a.push(
      `<link rel="alternate" hreflang="${C(o.language)}" href="${C(r)}" />`
    );
  }
  const i = n.alternates.find((o) => o.language === t.primaryLanguage);
  if (i) {
    const o = z(s, i.path);
    a.push(`<link rel="alternate" hreflang="x-default" href="${C(o)}" />`);
  }
  a.push(
    `<meta property="og:locale" content="${C(ie(n.current.language))}" />`
  );
  for (const o of n.alternates)
    o.language !== n.current.language && a.push(
      `<meta property="og:locale:alternate" content="${C(ie(o.language))}" />`
    );
  return a.join(`
`);
}
function ye(n, e, t) {
  const s = e.replace(/\/+$/, "");
  if (!s || n.alternates.length === 0) return "";
  const a = [];
  for (const o of n.alternates) {
    const r = z(s, o.path);
    a.push(
      `    <xhtml:link rel="alternate" hreflang="${C(o.language)}" href="${C(r)}"/>`
    );
  }
  const i = n.alternates.find((o) => o.language === t.primaryLanguage);
  if (i) {
    const o = z(s, i.path);
    a.push(
      `    <xhtml:link rel="alternate" hreflang="x-default" href="${C(o)}"/>`
    );
  }
  return a.join(`
`);
}
function q(n, e, t, s) {
  const a = [];
  for (const i of [t.primaryLanguage, ...t.enabledLanguages]) {
    if (a.some((g) => g.language === i)) continue;
    const o = i === t.primaryLanguage ? j(n) : M(n, i);
    if (!o) continue;
    const r = n.primaryTermId ? e.find((g) => g.id === n.primaryTermId) : void 0, l = r ? i === t.primaryLanguage ? B(r) : P(r, i) ?? void 0 : void 0;
    if (r && !l && !w(t, i)) continue;
    const u = fe({
      post: n,
      trans: o,
      primaryTermTrans: l,
      primaryTermSlug: r == null ? void 0 : r.slug,
      language: i,
      config: t,
      settings: s
    });
    a.push({ language: i, path: u });
  }
  return a;
}
function be(n, e) {
  const t = [];
  for (const s of [e.primaryLanguage, ...e.enabledLanguages]) {
    if (t.some((i) => i.language === s)) continue;
    const a = s === e.primaryLanguage ? B(n) : P(n, s);
    a && n.type === "category" && t.push({ language: s, path: Q(n, a, s, e) });
  }
  return t;
}
function we(n) {
  const e = [];
  for (const t of [n.primaryLanguage, ...n.enabledLanguages])
    e.some((s) => s.language === t) || e.push({ language: t, path: _(t, n) });
  return e;
}
function Z(n) {
  return (n.baseUrl || "").replace(/\/+$/, "");
}
const U = /* @__PURE__ */ new Map();
function I(n, e, t, s, a) {
  U.clear();
  const i = Z(s);
  if (!i) return;
  for (const r of [...n, ...e]) {
    if (r.status !== "online") continue;
    const l = q(r, t, a, s);
    if (l.length !== 0)
      for (const u of l) {
        const g = G(
          { current: { path: u.path, language: u.language }, alternates: l },
          i,
          a
        );
        U.set(u.path, g);
      }
  }
  for (const r of t) {
    if (r.type !== "category") continue;
    const l = be(r, a);
    if (l.length !== 0)
      for (const u of l) {
        const g = G(
          { current: { path: u.path, language: u.language }, alternates: l },
          i,
          a
        );
        U.set(u.path, g);
      }
  }
  const o = we(a);
  for (const r of o) {
    const l = G(
      { current: { path: r.path, language: r.language }, alternates: o },
      i,
      a
    );
    U.set(r.path, l);
  }
}
function Ze(n) {
  const e = n.replace(/^\/+/, "");
  return U.get(e) ?? U.get(`/${e}`) ?? "";
}
const D = /* @__PURE__ */ new Map();
function A(n, e, t, s, a) {
  D.clear();
  for (const o of [...n, ...e]) {
    if (o.status !== "online") continue;
    const r = q(o, t, s, a);
    if (r.length !== 0)
      for (const l of r)
        D.set(l.path, { language: l.language, alternates: r });
  }
  for (const o of t) {
    if (o.type !== "category") continue;
    const r = be(o, s);
    if (r.length !== 0)
      for (const l of r)
        D.set(l.path, { language: l.language, alternates: r });
  }
  const i = we(s);
  for (const o of i)
    D.set(o.path, { language: o.language, alternates: i });
}
function et(n) {
  const e = n.replace(/^\/+/, "");
  return D.get(e) ?? D.get(`/${e}`) ?? null;
}
function ve(n) {
  var s;
  const e = W(n.settings.activeThemeId);
  if (!e.settings) return;
  const t = (s = n.settings.themeConfigs) == null ? void 0 : s[e.id];
  return {
    ...e.settings.defaultConfig,
    ...t ?? {}
  };
}
function tt(n, e, t) {
  const s = w(t, e), a = s ? "" : `${e}/`, i = F(n.settings, e, t), o = n.terms.map((g) => {
    if (g.type !== "category") return g;
    const d = s ? B(g) : P(g, e);
    return d ? {
      ...g,
      name: d.name,
      // Prefix with language code so buildPostUrl produces
      // <lang>/<term-slug>/<post-slug>.html for posts and
      // <lang>/<term-slug>/index.html for the archive itself.
      slug: `${a}${d.slug}`,
      description: d.description
    } : g;
  }), r = (g) => {
    const d = s ? j(g) : M(g, e);
    if (!d) return null;
    const p = g.type !== "post" || !g.primaryTermId;
    return {
      ...g,
      title: d.title,
      slug: p ? `${a}${d.slug}` : d.slug,
      contentMarkdown: d.contentMarkdown,
      excerpt: d.excerpt,
      seo: d.seo
    };
  }, l = n.posts.map(r).filter((g) => g !== null), u = n.pages.map(r).filter((g) => g !== null);
  return {
    ...n,
    settings: i,
    posts: l,
    pages: u,
    terms: o
  };
}
async function nt(n) {
  var r;
  const { language: e, ctx: t, config: s } = n, a = (r = s.homePages) == null ? void 0 : r[e], i = a ? { ...t.settings, homeMode: "static-page", homePageId: a } : t.settings, o = tt({ ...t, settings: i }, e, s);
  return Ue(o, {
    homePath: _(e, s),
    currentLocale: e
  });
}
async function st(n) {
  var k, x, N, $, ne;
  const { post: e, trans: t, termTrans: s, language: a, ctx: i, config: o } = n, r = W(i.settings.activeThemeId), l = {
    settings: F(i.settings, a, o),
    resolvedMenus: { header: [], footer: [] },
    themeCssPath: `theme-assets/${i.settings.activeThemeId}.css`,
    themeConfig: ve(i),
    homePath: w(o, a) ? "/index.html" : `/${a}/index.html`
  }, u = { ...i, settings: l.settings };
  let g = Ae(t.contentMarkdown);
  g = await Ee("post.html.body", g, e, u);
  const d = i.terms.filter((E) => e.termIds.includes(E.id) && E.type === "tag"), p = e.primaryTermId ? i.terms.find((E) => E.id === e.primaryTermId && E.type === "category") : void 0, S = i.authorLookup(e.authorId), c = e.heroMediaId ? i.media.get(e.heroMediaId) : void 0, m = ((k = t.seo) == null ? void 0 : k.description) ?? ue(t.contentMarkdown, 160);
  let f = p;
  if (p && s) {
    const Ie = w(o, a) ? "" : `${a}/`;
    f = {
      ...p,
      name: s.name,
      slug: `${Ie}${s.slug}`,
      description: s.description
    };
  }
  const b = H({
    post: e,
    trans: t,
    primaryTermTrans: s,
    primaryTermSlug: p == null ? void 0 : p.slug,
    language: a,
    config: o
  }), y = {
    site: l,
    post: {
      ...e,
      title: t.title,
      slug: t.slug,
      contentMarkdown: t.contentMarkdown,
      excerpt: t.excerpt,
      seo: t.seo
    },
    bodyHtml: g,
    author: S,
    hero: c ? {
      alt: c.alt,
      caption: c.caption,
      default: ((N = (x = c.formats) == null ? void 0 : x[c.defaultFormat ?? ""]) == null ? void 0 : N.url) ?? c.url ?? "",
      formats: c.formats ?? {}
    } : void 0,
    primaryTerm: f,
    tags: d
  }, T = {
    site: l,
    pageTitle: (($ = t.seo) == null ? void 0 : $.title) ?? t.title,
    pageDescription: m || void 0,
    ogImage: (ne = t.seo) == null ? void 0 : ne.ogImage,
    currentPath: b,
    currentLocale: a
  };
  return de({
    base: r.templates.base,
    baseProps: T,
    template: r.templates.single,
    templateProps: y
  });
}
function at(n) {
  var m, f, b;
  const { term: e, termTrans: t, language: s, ctx: a, config: i } = n, o = W(a.settings.activeThemeId), r = {
    settings: F(a.settings, s, i),
    resolvedMenus: { header: [], footer: [] },
    themeCssPath: `theme-assets/${a.settings.activeThemeId}.css`,
    themeConfig: ve(a),
    homePath: w(i, s) ? "/index.html" : `/${s}/index.html`
  }, l = {
    ...e,
    name: t.name,
    slug: t.slug,
    description: t.description
  }, u = w(i, s), g = u ? "" : `${s}/`, d = a.posts.filter((y) => y.status === "online" && y.primaryTermId === e.id).filter((y) => u ? !0 : M(y, s) !== null).map((y) => {
    var N, $;
    const T = u ? j(y) : M(y, s), k = H({
      post: y,
      trans: T,
      primaryTermTrans: t,
      primaryTermSlug: e.slug,
      language: s,
      config: i
    }), x = y.heroMediaId ? a.media.get(y.heroMediaId) : void 0;
    return {
      ...y,
      title: T.title,
      slug: T.slug,
      excerpt: T.excerpt,
      url: k,
      hero: x ? {
        alt: x.alt,
        caption: x.caption,
        default: (($ = (N = x.formats) == null ? void 0 : N[x.defaultFormat ?? ""]) == null ? void 0 : $.url) ?? x.url ?? "",
        formats: x.formats ?? {}
      } : void 0,
      category: {
        name: t.name,
        url: `/${g}${t.slug}/index.html`
      }
    };
  }), p = {
    site: r,
    term: l,
    posts: d,
    categoryRssUrl: void 0,
    archivesLink: void 0,
    allCategories: [],
    popularTags: []
  }, S = Q(e, t, s, i), c = {
    site: r,
    pageTitle: ((m = t.seo) == null ? void 0 : m.title) || t.name,
    pageDescription: ((f = t.seo) == null ? void 0 : f.description) || t.description,
    ogImage: (b = t.seo) == null ? void 0 : b.ogImage,
    currentPath: S,
    currentLocale: s
  };
  return de({
    base: o.templates.base,
    baseProps: c,
    template: o.templates.category,
    templateProps: p
  });
}
async function it(n, e, t) {
  const s = v(t.settings);
  if (s.enabledLanguages.length === 0) {
    if (e.lastPublishedPathsByLocale && Object.keys(e.lastPublishedPathsByLocale).length > 0)
      try {
        await J(e.id, { lastPublishedPathsByLocale: {} });
      } catch {
      }
    return n;
  }
  I(t.posts, t.pages, t.terms, t.settings, s), A(t.posts, t.pages, t.terms, s, t.settings);
  const a = [...n], i = {}, o = e.primaryTermId ? t.terms.find((r) => r.id === e.primaryTermId && r.type === "category") : void 0;
  for (const r of s.enabledLanguages) {
    if (w(s, r) || Y(e, t.settings, s, r)) continue;
    const l = M(e, r);
    if (!l) continue;
    const u = o ? P(o, r) : void 0;
    if (o && !u) continue;
    const g = H({
      post: e,
      trans: l,
      primaryTermTrans: u ?? void 0,
      primaryTermSlug: o == null ? void 0 : o.slug,
      language: r,
      config: s
    }), d = await st({
      post: e,
      trans: l,
      termTrans: u ?? void 0,
      language: r,
      ctx: t,
      config: s
    });
    a.push({ path: g, html: d }), i[r] = g;
  }
  try {
    await J(e.id, { lastPublishedPathsByLocale: i });
  } catch {
  }
  return a;
}
const rt = /^[a-z]{2,3}(-[a-z0-9]{2,8})*$/i;
function ee(n) {
  const e = [];
  for (const t of n.enabledLanguages)
    t === n.primaryLanguage || e.includes(t) || e.push(t);
  return e;
}
function ot(n, e) {
  const t = new Set(ee(n)), s = [...n.lastPublishedLanguages ?? []];
  if (!n.lastPublishedLanguages)
    for (const o of [...e.posts, ...e.pages])
      for (const r of Object.keys(o.lastPublishedPathsByLocale ?? {})) s.push(r);
  const a = new Set(
    e.terms.filter((o) => o.type === "category").map((o) => o.slug.toLowerCase())
  ), i = [];
  for (const o of s)
    i.includes(o) || t.has(o) || o === n.primaryLanguage || !rt.test(o) || a.has(o.toLowerCase()) || i.push(o);
  return i;
}
function lt(n, e) {
  var s;
  const t = /* @__PURE__ */ new Set([
    `${n}/index.html`,
    `${n}/data/posts.json`,
    `${n}/data/authors.json`,
    `${n}/search-index.json`,
    `${n}/rss.xml`,
    `${n}/feed.xml`,
    `${n}/archives/index.html`
  ]);
  for (const a of e.terms) {
    if (a.type !== "category") continue;
    const i = P(a, n);
    i && (t.add(`${n}/${i.slug}/index.html`), t.add(`${n}/${i.slug}/${i.slug}.xml`));
  }
  for (const a of [...e.posts, ...e.pages]) {
    const i = (s = a.lastPublishedPathsByLocale) == null ? void 0 : s[n];
    i && t.add(i);
  }
  return [...t];
}
function re(n) {
  return [`sitemaps/sitemap-news-${n}.xml`];
}
function ct(n, e) {
  return !!n && n.length === e.length && n.every((t, s) => t === e[s]);
}
async function gt() {
  try {
    const n = await Fe();
    return n.model !== "files" || n.deletePrefix || n.list;
  } catch {
    return !1;
  }
}
async function ut(n, e, t) {
  let s = !1;
  if (t)
    try {
      await Oe(n), s = !0;
    } catch {
    }
  const a = s ? re(n) : [
    ...lt(n, e),
    ...re(n)
  ];
  for (const i of a)
    try {
      await V(i);
    } catch {
    }
}
async function Le(n, e) {
  var a;
  const t = ot(e, n), s = ee(e);
  if (t.length > 0) {
    const i = await gt();
    for (const o of t)
      await ut(o, n, i);
  }
  if (t.length > 0 || !ct(e.lastPublishedLanguages, s)) {
    const o = { ...((a = n.settings.pluginConfigs) == null ? void 0 : a[R]) ?? {}, lastPublishedLanguages: s };
    try {
      await De(R, o), n.settings = {
        ...n.settings,
        pluginConfigs: { ...n.settings.pluginConfigs ?? {}, [R]: o }
      };
    } catch {
    }
  }
  return t;
}
async function dt(n, e) {
  const t = v(e.settings);
  if (await Le(e, t), t.enabledLanguages.length === 0) return n;
  I(e.posts, e.pages, e.terms, e.settings, t), A(e.posts, e.pages, e.terms, t, e.settings);
  const s = [...n];
  for (const a of t.enabledLanguages) {
    if (w(t, a)) continue;
    const i = _(a, t), o = await nt({ language: a, ctx: e, config: t });
    s.push({ path: i, html: o });
    for (const r of e.terms) {
      if (r.type !== "category") continue;
      const l = P(r, a);
      if (!l) continue;
      const u = Q(r, l, a, t), g = at({ term: r, termTrans: l, language: a, ctx: e, config: t });
      s.push({ path: u, html: g });
    }
  }
  return s;
}
function pt(n) {
  return { ...n, "xmlns:xhtml": "http://www.w3.org/1999/xhtml" };
}
function ht(n, e) {
  if (!e.entity) return n;
  const t = e.settings ? v(e.settings) : bt(), s = e.terms ?? wt();
  if (!t || !s || t.enabledLanguages.length === 0) return n;
  const a = q(e.entity, s, t, e.settings ?? xe);
  if (a.length === 0) return n;
  const i = e.baseUrl.replace(/\/+$/, "");
  return n + ye(
    { current: { path: e.path, language: t.primaryLanguage }, alternates: a },
    i,
    t
  ) + `
`;
}
function mt(n, e) {
  var i, o, r, l, u, g;
  const t = v(e.settings);
  if (t.enabledLanguages.length === 0) return n;
  const s = Z(e.settings);
  if (!s) return n;
  const a = [...n];
  for (const d of [...e.posts, ...e.pages]) {
    if (d.status !== "online") continue;
    const p = ((o = (i = d.createdAt) == null ? void 0 : i.toMillis) == null ? void 0 : o.call(i)) ?? ((l = (r = d.publishedAt) == null ? void 0 : r.toMillis) == null ? void 0 : l.call(r)) ?? Date.now();
    if (new Date(p).getUTCFullYear() !== e.year) continue;
    const S = q(d, e.terms, t, e.settings);
    if (S.length !== 0)
      for (const c of S)
        w(t, c.language) || a.push({
          path: c.path,
          lastmodMs: ((g = (u = d.updatedAt) == null ? void 0 : u.toMillis) == null ? void 0 : g.call(u)) ?? p,
          extraInnerXml: ye(
            { current: { path: c.path, language: c.language }, alternates: S },
            s,
            t
          )
        });
  }
  return a;
}
function ft(n, e) {
  var i;
  const t = (i = e.settings.pluginConfigs) == null ? void 0 : i["agentcms-sitemaps"];
  if (!(t != null && t.newsEnabled)) return n;
  const s = v(e.settings);
  if (s.enabledLanguages.length === 0) return n;
  const a = [...n];
  for (const o of s.enabledLanguages)
    w(s, o) || a.push({ path: `sitemaps/sitemap-news-${o}.xml` });
  return a;
}
function yt(n, e) {
  var r, l, u, g, d, p, S, c;
  const t = v(e.settings);
  if (t.enabledLanguages.length === 0 || !Z(e.settings)) return n;
  const a = e.config.newsWindowDays || 2, i = Date.now() - a * 24 * 60 * 60 * 1e3, o = [...n];
  for (const m of t.enabledLanguages) {
    if (w(t, m)) continue;
    const f = [];
    for (const b of [...e.posts, ...e.pages]) {
      if (b.status !== "online") continue;
      const y = ((l = (r = b.updatedAt) == null ? void 0 : r.toMillis) == null ? void 0 : l.call(r)) ?? ((g = (u = b.publishedAt) == null ? void 0 : u.toMillis) == null ? void 0 : g.call(u)) ?? ((p = (d = b.createdAt) == null ? void 0 : d.toMillis) == null ? void 0 : p.call(d)) ?? Date.now();
      if (y < i) continue;
      const T = M(b, m);
      if (!T) continue;
      const k = b.primaryTermId ? e.terms.find(($) => $.id === b.primaryTermId && $.type === "category") : void 0, x = k ? P(k, m) ?? void 0 : void 0, N = fe({
        post: b,
        trans: T,
        primaryTermTrans: x,
        primaryTermSlug: k == null ? void 0 : k.slug,
        language: m,
        config: t,
        settings: e.settings
      });
      f.push({
        path: N,
        title: T.title,
        createdAtMs: ((c = (S = b.createdAt) == null ? void 0 : S.toMillis) == null ? void 0 : c.call(S)) ?? y,
        updatedAtMs: y
      });
    }
    o.push({
      language: m,
      path: `sitemaps/sitemap-news-${m}.xml`,
      entities: f
    });
  }
  return o;
}
let Se = null, Te = null, xe = null;
function Pe(n) {
  Se = n;
}
function ke(n) {
  Te = n;
}
function $e(n) {
  xe = n;
}
function bt() {
  return Se;
}
function wt() {
  return Te;
}
const vt = 20;
function Lt(n) {
  return `${n}/rss.xml`;
}
function St(n) {
  return `${n}/feed.xml`;
}
function Tt(n, e) {
  return `${n}/${e}/${e}.xml`;
}
function xt(n) {
  const e = v(n.settings);
  if (e.enabledLanguages.length === 0) return [];
  const t = [];
  for (const s of e.enabledLanguages) {
    if (w(e, s)) continue;
    const a = kt(n.posts, n.terms, s, e, n.baseUrl);
    t.push({
      language: s,
      path: Lt(s),
      ...Pt(n.settings, s, e),
      channelLink: X(n.baseUrl, _(s, e)),
      items: a
    });
  }
  return t;
}
function Pt(n, e, t) {
  var o, r;
  const s = (o = t.siteTexts) == null ? void 0 : o[e], a = F(n, e, t);
  return {
    channelTitle: (r = s == null ? void 0 : s.title) != null && r.trim() ? a.title : `${n.title || "Site"} (${Ct(e)})`,
    channelDescription: a.description || a.title || ""
  };
}
async function Ce(n) {
  const e = v(n.settings);
  for (const t of e.enabledLanguages)
    if (!w(e, t)) {
      try {
        await V(St(t));
      } catch {
      }
      for (const s of n.terms) {
        if (s.type !== "category") continue;
        const a = P(s, t);
        if (a)
          try {
            await V(Tt(t, a.slug));
          } catch {
          }
      }
    }
}
function kt(n, e, t, s, a) {
  return n.filter((i) => i.status === "online").map((i) => $t(i, e, t, s, a)).filter((i) => i !== null).sort((i, o) => o.pubDateMs - i.pubDateMs).slice(0, vt);
}
function $t(n, e, t, s, a) {
  var p, S, c, m, f, b;
  const i = M(n, t);
  if (!i) return null;
  const o = n.primaryTermId ? e.find((y) => y.id === n.primaryTermId && y.type === "category") : void 0, r = o ? P(o, t) : void 0;
  if (o && !r) return null;
  const l = H({
    post: n,
    trans: i,
    primaryTermTrans: r ?? void 0,
    primaryTermSlug: o == null ? void 0 : o.slug,
    language: t,
    config: s
  }), u = X(a, l), g = (i.excerpt && i.excerpt.trim().length > 0 ? i.excerpt : ue(i.contentMarkdown, 300)).trim(), d = ((S = (p = n.publishedAt) == null ? void 0 : p.toMillis) == null ? void 0 : S.call(p)) ?? ((m = (c = n.updatedAt) == null ? void 0 : c.toMillis) == null ? void 0 : m.call(c)) ?? ((b = (f = n.createdAt) == null ? void 0 : f.toMillis) == null ? void 0 : b.call(f)) ?? Date.now();
  return {
    title: i.title,
    link: u,
    guid: u,
    description: g,
    pubDateMs: d,
    category: r == null ? void 0 : r.name
  };
}
function Ct(n) {
  try {
    const e = new Intl.DisplayNames([n], { type: "language" }).of(n);
    return e ? e.charAt(0).toLocaleUpperCase(n) + e.slice(1) : n;
  } catch {
    return n.toUpperCase();
  }
}
function Me(n, e, t) {
  const s = w(t, e), a = s ? "" : `${e}/`, i = n.terms.map((r) => {
    if (r.type !== "category") return r;
    const l = s ? B(r) : P(r, e);
    return l ? {
      ...r,
      name: l.name,
      slug: `${a}${l.slug}`,
      description: l.description
    } : r;
  }), o = (r) => {
    const l = s ? j(r) : M(r, e);
    if (!l) return null;
    const u = r.type !== "post" || !r.primaryTermId, g = Y(r, n.settings, t, e) ? `${a}index` : u ? `${a}${l.slug}` : l.slug;
    return {
      ...r,
      title: l.title,
      slug: g,
      contentMarkdown: l.contentMarkdown,
      excerpt: l.excerpt,
      seo: l.seo
    };
  };
  return {
    posts: n.posts.map(o).filter((r) => r !== null),
    pages: n.pages.map(o).filter((r) => r !== null),
    terms: i
  };
}
async function te(n) {
  const e = v(n.settings);
  if (e.enabledLanguages.length !== 0)
    for (const t of e.enabledLanguages) {
      if (w(e, t)) continue;
      const s = Me(n, t, e), a = { ...F(n.settings, t, e), homePageId: void 0 }, i = `${t}/data/posts.json`, o = `${t}/data/authors.json`;
      try {
        await He(
          a,
          s.posts,
          s.pages,
          s.terms,
          n.media,
          i
        );
      } catch {
      }
      try {
        await _e(
          n.users,
          n.media,
          s.posts,
          s.pages,
          o
        );
      } catch {
      }
    }
}
function Mt(n) {
  const e = v(n.settings), t = [];
  for (const s of ee(e)) {
    const a = Me(n, s, e), i = new Set(
      n.terms.filter((r) => r.type === "category" && !P(r, s)).map((r) => r.id)
    ), o = a.posts.filter(
      (r) => !r.primaryTermId || !i.has(r.primaryTermId)
    );
    t.push({
      language: s,
      path: `${s}/search-index.json`,
      posts: o,
      pages: a.pages,
      terms: a.terms,
      // homePageId cleared: the language's home page already carries
      // its `<lang>/index` slug (→ linked as `<lang>/`); the core's
      // static-home mapping would send it to the primary home.
      settings: { ...F(n.settings, s, e), homePageId: void 0 }
    });
  }
  return t;
}
const oe = ["en", "fr", "de", "es", "nl", "pt", "ko"];
function Nt({ config: n, save: e }) {
  const { t } = me("agentcms-multilang"), { settings: s, pages: a } = pe(), [i, o] = ae({
    ...O,
    ...n
  }), [r, l] = ae(!1);
  async function u() {
    l(!0);
    try {
      await e(i), K.success(t("settings.saved"));
    } catch (c) {
      K.error(c.message || "Save failed");
    } finally {
      l(!1);
    }
  }
  function g(c) {
    o((m) => {
      const b = m.enabledLanguages.includes(c) ? m.enabledLanguages.filter((y) => y !== c) : [...m.enabledLanguages, c];
      return { ...m, enabledLanguages: b };
    });
  }
  function d(c, m) {
    o((f) => ({
      ...f,
      homePages: { ...f.homePages ?? {}, [c]: m || "" }
    }));
  }
  function p(c, m, f) {
    o((b) => {
      var y;
      return {
        ...b,
        siteTexts: {
          ...b.siteTexts ?? {},
          [c]: { ...((y = b.siteTexts) == null ? void 0 : y[c]) ?? {}, [m]: f }
        }
      };
    });
  }
  const S = (s.language || "en").split("-")[0];
  return /* @__PURE__ */ L("div", { className: "space-y-6", children: [
    /* @__PURE__ */ L("div", { children: [
      /* @__PURE__ */ h("h2", { className: "font-semibold text-lg", children: t("settings.title") }),
      /* @__PURE__ */ h("p", { className: "text-sm text-surface-500 dark:text-surface-400", children: t("settings.intro") })
    ] }),
    /* @__PURE__ */ L("section", { className: "card p-4 space-y-3", children: [
      /* @__PURE__ */ h("h3", { className: "font-medium", children: t("settings.primaryLanguage.title") }),
      /* @__PURE__ */ h("p", { className: "text-xs text-surface-500 dark:text-surface-400", children: t("settings.primaryLanguage.help") }),
      /* @__PURE__ */ L("div", { className: "flex flex-wrap gap-2", children: [
        /* @__PURE__ */ h(
          "select",
          {
            className: "input max-w-[200px]",
            value: i.primaryLanguage,
            onChange: (c) => o({ ...i, primaryLanguage: c.target.value }),
            children: oe.map((c) => /* @__PURE__ */ h("option", { value: c, children: c.toUpperCase() }, c))
          }
        ),
        /* @__PURE__ */ h("span", { className: "text-[11px] text-surface-500 self-center", children: t("settings.primaryLanguage.siteHint", { lang: S }) })
      ] })
    ] }),
    /* @__PURE__ */ L("section", { className: "card p-4 space-y-3", children: [
      /* @__PURE__ */ h("h3", { className: "font-medium", children: t("settings.enabledLanguages.title") }),
      /* @__PURE__ */ h("p", { className: "text-xs text-surface-500 dark:text-surface-400", children: t("settings.enabledLanguages.help") }),
      /* @__PURE__ */ h("div", { className: "flex flex-wrap gap-2", children: oe.filter((c) => c !== i.primaryLanguage).map((c) => {
        const m = i.enabledLanguages.includes(c);
        return /* @__PURE__ */ h(
          "button",
          {
            type: "button",
            onClick: () => g(c),
            className: "text-xs px-3 py-1.5 rounded uppercase font-medium " + (m ? "bg-surface-900 text-surface-50 dark:bg-surface-100 dark:text-surface-900" : "bg-surface-100 text-surface-700 dark:bg-surface-800 dark:text-surface-300"),
            children: c
          },
          c
        );
      }) })
    ] }),
    i.enabledLanguages.length > 0 && /* @__PURE__ */ L("section", { className: "card p-4 space-y-3", children: [
      /* @__PURE__ */ h("h3", { className: "font-medium", children: t("settings.homePages.title") }),
      /* @__PURE__ */ h("p", { className: "text-xs text-surface-500 dark:text-surface-400", children: t("settings.homePages.help") }),
      /* @__PURE__ */ h("div", { className: "space-y-2", children: i.enabledLanguages.map((c) => {
        var m;
        return /* @__PURE__ */ L("div", { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ h("span", { className: "text-[10px] uppercase font-semibold w-8", children: c }),
          /* @__PURE__ */ L(
            "select",
            {
              className: "input flex-1",
              value: ((m = i.homePages) == null ? void 0 : m[c]) ?? "",
              onChange: (f) => d(c, f.target.value),
              children: [
                /* @__PURE__ */ h("option", { value: "", children: t("settings.homePages.none") }),
                a.filter((f) => f.status === "online").map((f) => /* @__PURE__ */ h("option", { value: f.id, children: f.title }, f.id))
              ]
            }
          )
        ] }, c);
      }) })
    ] }),
    i.enabledLanguages.length > 0 && /* @__PURE__ */ L("section", { className: "card p-4 space-y-3", children: [
      /* @__PURE__ */ h("h3", { className: "font-medium", children: t("settings.siteTexts.title") }),
      /* @__PURE__ */ h("p", { className: "text-xs text-surface-500 dark:text-surface-400", children: t("settings.siteTexts.help") }),
      /* @__PURE__ */ h("div", { className: "space-y-3", children: i.enabledLanguages.map((c) => {
        var m, f, b, y;
        return /* @__PURE__ */ L("div", { className: "flex items-start gap-2", children: [
          /* @__PURE__ */ h("span", { className: "text-[10px] uppercase font-semibold w-8 pt-2", children: c }),
          /* @__PURE__ */ L("div", { className: "flex-1 space-y-2", children: [
            /* @__PURE__ */ h(
              "input",
              {
                type: "text",
                className: "input w-full",
                "aria-label": `${t("settings.siteTexts.siteTitle")} (${c})`,
                placeholder: s.title || t("settings.siteTexts.siteTitle"),
                value: ((f = (m = i.siteTexts) == null ? void 0 : m[c]) == null ? void 0 : f.title) ?? "",
                onChange: (T) => p(c, "title", T.target.value)
              }
            ),
            /* @__PURE__ */ h(
              "textarea",
              {
                className: "input w-full",
                rows: 2,
                "aria-label": `${t("settings.siteTexts.siteDescription")} (${c})`,
                placeholder: s.description || t("settings.siteTexts.siteDescription"),
                value: ((y = (b = i.siteTexts) == null ? void 0 : b[c]) == null ? void 0 : y.description) ?? "",
                onChange: (T) => p(c, "description", T.target.value)
              }
            )
          ] })
        ] }, c);
      }) })
    ] }),
    i.enabledLanguages.length > 0 && /* @__PURE__ */ L("section", { className: "card p-4 space-y-3", children: [
      /* @__PURE__ */ h("h3", { className: "font-medium", children: t("settings.switcher.title") }),
      /* @__PURE__ */ h("p", { className: "text-xs text-surface-500 dark:text-surface-400", children: t("settings.switcher.help") }),
      /* @__PURE__ */ L("label", { className: "flex items-center gap-2 text-sm", children: [
        /* @__PURE__ */ h(
          "input",
          {
            type: "checkbox",
            checked: i.showHeaderSwitcher ?? !0,
            onChange: (c) => o({ ...i, showHeaderSwitcher: c.target.checked })
          }
        ),
        /* @__PURE__ */ h("span", { children: t("settings.switcher.header") })
      ] }),
      /* @__PURE__ */ L("label", { className: "flex items-center gap-2 text-sm", children: [
        /* @__PURE__ */ h(
          "input",
          {
            type: "checkbox",
            checked: i.showFooterSwitcher ?? !1,
            onChange: (c) => o({ ...i, showFooterSwitcher: c.target.checked })
          }
        ),
        /* @__PURE__ */ h("span", { children: t("settings.switcher.footer") })
      ] })
    ] }),
    /* @__PURE__ */ h("div", { className: "flex gap-2", children: /* @__PURE__ */ h(
      "button",
      {
        type: "button",
        className: "btn-primary",
        onClick: u,
        disabled: r,
        children: t(r ? "settings.saving" : "settings.save")
      }
    ) })
  ] });
}
function It({ term: n, updateTerm: e }) {
  const { t } = me("agentcms-multilang"), { settings: s } = pe(), a = v(s);
  if (a.enabledLanguages.length === 0)
    return /* @__PURE__ */ h("p", { className: "text-xs text-surface-500 dark:text-surface-400", children: t("termSection.noLanguages") });
  const i = n.translations ?? {};
  function o(r, l) {
    const u = {
      ...i,
      [r]: { ...i[r] ?? le(), ...l }
    };
    e({ translations: u });
  }
  return /* @__PURE__ */ L("div", { className: "space-y-2", children: [
    /* @__PURE__ */ h("p", { className: "text-[11px] uppercase tracking-wide font-semibold text-surface-500 dark:text-surface-400", children: t("termSection.title") }),
    a.enabledLanguages.map((r) => {
      const l = i[r] ?? le(), u = l.slug && !he(l.slug), g = l.seo ?? {};
      function d(p) {
        o(r, { seo: { ...g, ...p } });
      }
      return /* @__PURE__ */ L("div", { className: "space-y-2 border-t border-surface-200 dark:border-surface-700 pt-2 first:border-t-0 first:pt-0", children: [
        /* @__PURE__ */ L("div", { className: "flex flex-wrap items-start gap-2", children: [
          /* @__PURE__ */ h("span", { className: "text-[10px] uppercase font-semibold w-8 pt-2 text-surface-500", children: r }),
          /* @__PURE__ */ h(
            "input",
            {
              type: "text",
              className: "input flex-1 min-w-[120px]",
              placeholder: t("termSection.name"),
              value: l.name,
              onChange: (p) => o(r, { name: p.target.value })
            }
          ),
          /* @__PURE__ */ L("div", { className: "flex-1 min-w-[120px]", children: [
            /* @__PURE__ */ h(
              "input",
              {
                type: "text",
                className: "input",
                placeholder: t("termSection.slug"),
                value: l.slug,
                onChange: (p) => o(r, { slug: p.target.value })
              }
            ),
            u && /* @__PURE__ */ h("p", { className: "text-[10px] text-red-600 mt-0.5", children: t("termSection.invalidSlug") })
          ] })
        ] }),
        /* @__PURE__ */ L("div", { className: "pl-10 space-y-1", children: [
          /* @__PURE__ */ h(
            "input",
            {
              type: "text",
              className: "input w-full",
              placeholder: t("termSection.seoTitle"),
              value: g.title ?? "",
              onChange: (p) => d({ title: p.target.value })
            }
          ),
          /* @__PURE__ */ h(
            "textarea",
            {
              className: "input w-full min-h-[60px] resize-y",
              placeholder: t("termSection.seoDescription"),
              value: g.description ?? "",
              onChange: (p) => d({ description: p.target.value })
            }
          )
        ] })
      ] }, r);
    })
  ] });
}
function le() {
  return { slug: "", name: "", description: "" };
}
function Ne(n, e, t) {
  if (t)
    return {
      title: n.title,
      slug: n.slug,
      contentMarkdown: n.contentMarkdown,
      excerpt: n.excerpt,
      seo: n.seo
    };
  const s = n.translations, a = s == null ? void 0 : s[e];
  return !a || !a.title ? null : {
    title: a.title ?? "",
    slug: a.slug ?? "",
    contentMarkdown: a.contentMarkdown ?? "",
    excerpt: a.excerpt,
    seo: a.seo
  };
}
function ce(n, e, t) {
  if (t) return "★";
  const s = Ne(n, e, !1);
  return s && s.slug && s.title ? "" : "○";
}
const At = {
  id: "agentcms-multilang/languages",
  priority: 50,
  listVariants(n, e) {
    const t = v(e.settings);
    if (t.enabledLanguages.length === 0) return [];
    const s = [], a = /* @__PURE__ */ new Set();
    s.push({
      id: t.primaryLanguage,
      label: t.primaryLanguage.toUpperCase(),
      badge: ce(n, t.primaryLanguage, !0),
      primary: !0
    }), a.add(t.primaryLanguage);
    for (const i of t.enabledLanguages)
      a.has(i) || (a.add(i), s.push({
        id: i,
        label: i.toUpperCase(),
        badge: ce(n, i, !1),
        primary: !1
      }));
    return s;
  },
  loadFields(n, e, t) {
    const s = v(t.settings), a = w(s, e);
    return Ne(n, e, a);
  },
  validate(n, e, t, s) {
    const a = v(s.settings);
    return w(a, e) ? null : t.title.trim() ? he(t.slug) ? null : `Invalid slug for ${e.toUpperCase()}.` : `Title required for ${e.toUpperCase()}.`;
  },
  async saveFields(n, e, t, s) {
    const a = v(s.settings);
    if (w(a, e))
      return;
    const i = n.translations ?? {}, o = {
      title: t.title,
      slug: t.slug,
      contentMarkdown: t.contentMarkdown
    };
    if (t.excerpt && (o.excerpt = t.excerpt), t.seo) {
      const l = {};
      t.seo.title && (l.title = t.seo.title), t.seo.description && (l.description = t.seo.description), t.seo.ogImage && (l.ogImage = t.seo.ogImage), Object.keys(l).length > 0 && (o.seo = l);
    }
    const r = { ...i, [e]: o };
    try {
      await J(n.id, { translations: r });
    } catch (l) {
      throw K.error(l.message), l;
    }
  },
  getSlugPathPrefix(n, e, t, s) {
    var g;
    const a = v(s.settings), i = w(a, e) ? "" : `${e}/`;
    if (n.type !== "post" || !n.primaryTermId) return i;
    const o = s.terms.find((d) => d.id === n.primaryTermId);
    if (!o) return i;
    const r = o.translations, u = !w(a, e) && ((g = r == null ? void 0 : r[e]) == null ? void 0 : g.slug) || o.slug;
    return `${i}${u}/`;
  }
}, Et = `
.cms-langswitch{display:inline-flex;align-items:center;gap:6px;font-size:12px;line-height:1;letter-spacing:0.05em;}
.cms-langswitch a,.cms-langswitch span{padding:4px 8px;border-radius:4px;text-decoration:none;color:inherit;text-transform:uppercase;font-weight:600;}
.cms-langswitch a{opacity:0.55;}
.cms-langswitch a:hover{opacity:1;}
.cms-langswitch__current{background:currentColor;color:transparent;position:relative;}
.cms-langswitch__current::after{content:attr(data-label);position:absolute;inset:0;display:flex;align-items:center;justify-content:center;color:var(--cms-langswitch-on,white);mix-blend-mode:difference;}
`.replace(/\s+/g, " ").trim();
function Ut(n) {
  return n.replace(/[<>&\u2028\u2029]/g, (e) => e === "<" ? "\\u003c" : e === ">" ? "\\u003e" : e === "&" ? "\\u0026" : e === "\u2028" ? "\\u2028" : "\\u2029");
}
function Dt(n) {
  const { config: e, settings: t, currentPath: s } = n;
  if (e.enabledLanguages.length === 0 || !e.showHeaderSwitcher && !e.showFooterSwitcher) return "";
  const a = et(s);
  if (!a || a.alternates.length < 2) return "";
  const i = (t.baseUrl || "").replace(/\/+$/, ""), o = a.alternates.map((p) => ({
    lang: p.language,
    label: p.language.toUpperCase(),
    href: i ? X(i, p.path) : `/${p.path.replace(/^\/+/, "")}`
  })), r = a.language, l = e.primaryLanguage, u = {
    current: r,
    primary: l,
    items: o,
    showHeader: e.showHeaderSwitcher !== !1,
    showFooter: e.showFooterSwitcher === !0
  };
  return `<script>${`
(function(){
  try {
    var D = ${Ut(JSON.stringify(u))};
    function render(host) {
      var html = '<div class="cms-langswitch" role="navigation" aria-label="Language">';
      for (var i = 0; i < D.items.length; i++) {
        var it = D.items[i];
        if (it.lang === D.current) {
          html += '<span class="cms-langswitch__current" data-label="' + it.label + '" aria-current="true">' + it.label + '</span>';
        } else {
          html += '<a href="' + it.href + '" hreflang="' + it.lang + '" rel="alternate">' + it.label + '</a>';
        }
      }
      html += '</div>';
      host.innerHTML = html;
      host.removeAttribute('data-cms-langswitch-empty');
    }
    function paint() {
      if (D.showHeader) {
        var h = document.querySelector('[data-cms-langswitch="header"]');
        if (h) render(h);
      }
      if (D.showFooter) {
        var f = document.querySelector('[data-cms-langswitch="footer"]');
        if (f) render(f);
      }
      var s = document.createElement('style');
      s.setAttribute('data-cms-langswitch-css', '');
      s.textContent = ${JSON.stringify(Et)};
      document.head.appendChild(s);
    }
    if (document.readyState !== 'loading') paint();
    else document.addEventListener('DOMContentLoaded', paint);
  } catch (e) {}
})();`}<\/script>`;
}
async function Ft(n, e) {
  const t = v(e.settings);
  Pe(t), ke(e.terms), $e(e.settings), I(e.posts, e.pages, e.terms, e.settings, t), A(e.posts, e.pages, e.terms, t, e.settings), await Ce(e), await te(e);
}
async function ge(n, e) {
  const t = v(e.settings);
  Pe(t), ke(e.terms), $e(e.settings), I(e.posts, e.pages, e.terms, e.settings, t), A(e.posts, e.pages, e.terms, t, e.settings), await Ce(e), await te(e);
}
async function Ot() {
  try {
    const n = window, e = n == null ? void 0 : n.__AGENTCMS_LIVE_SETTINGS__;
    if (!e) return;
    const t = v(e);
    if (t.enabledLanguages.length === 0) return;
    const [s, a] = await Promise.all([
      se({ type: "post" }),
      se({ type: "page" })
    ]);
    I(s, a, [], e, t), A(s, a, [], t, e);
  } catch {
  }
}
const jt = {
  id: "agentcms-multilang",
  name: "Multi-language",
  version: "1.6.6",
  description: "Multi-language site support — translated posts/pages/terms, hreflang SEO, per-language sitemap entries, per-language RSS feeds.",
  author: "AgentCMS",
  readme: ze,
  i18n: { en: Je, fr: Qe },
  settings: {
    navLabelKey: "settings.title",
    defaultConfig: O,
    component: Nt,
    schema: Re
  },
  register(n) {
    n.addFilter("publish.additional", async (e, t, s) => it(
      e,
      t,
      s
    )), n.addFilter("publish.extraListings", async (e, t) => dt(
      e,
      t
    )), n.addAction("publish.before", async (e, t) => {
      const s = t, a = v(s.settings);
      I(s.posts, s.pages, s.terms, s.settings, a), A(s.posts, s.pages, s.terms, a, s.settings);
    }), n.addAction("regenerate.listings.before", async (e) => {
      const t = e, s = v(t.settings);
      I(t.posts, t.pages, t.terms, t.settings, s), A(t.posts, t.pages, t.terms, s, t.settings);
    }), n.addAction("publish.complete", async (e, t) => {
      await Ft(e, t);
    }), n.addAction("post.unpublished", async (e, t) => {
      await ge(e, t);
    }), n.addAction("post.deleted", async (e, t) => {
      await ge(e, t);
    }), n.addFilter("page.head.extra", (e, ...t) => {
      const s = t[0];
      if (!(s != null && s.currentPath)) return e;
      const a = Ze(s.currentPath);
      return a ? e + (e ? `
` : "") + a : e;
    }), n.addFilter("page.body.end", (e, ...t) => {
      var o;
      const s = t[0];
      if (!(s != null && s.currentPath) || !((o = s == null ? void 0 : s.site) != null && o.settings)) return e;
      const a = v(s.site.settings), i = Dt({
        config: a,
        settings: s.site.settings,
        currentPath: s.currentPath
      });
      return i ? e + (e ? `
` : "") + i : e;
    }), n.addFilter(
      "sitemap.urlset.namespaces",
      (e) => pt(e)
    ), n.addFilter("sitemap.url.entry", (e, ...t) => {
      const s = t[0];
      return ht(e, s);
    }), n.addFilter("sitemap.urls.extra", (e, ...t) => {
      const s = t[0];
      return mt(
        e,
        s
      );
    }), n.addFilter("sitemap.index.extra", (e, ...t) => {
      const s = t[0];
      return ft(
        e,
        s
      );
    }), n.addFilter("sitemap.news.locales", (e, ...t) => {
      const s = t[0];
      return yt(
        e,
        s
      );
    }), n.addFilter("rss.site.locales", (e, ...t) => {
      const s = t[0];
      return s ? [
        ...e,
        ...xt(s)
      ] : e;
    }), n.addFilter("search.index.locales", (e, ...t) => {
      const s = t[0];
      return s != null && s.settings ? [...e, ...Mt(s)] : e;
    }), n.registerRegenerationTarget({
      id: "agentcms-multilang",
      labelKey: "regenerationTarget.label",
      descriptionKey: "regenerationTarget.description",
      priority: 150,
      run: async (e, t) => {
        const s = v(e.settings), a = await Le(e, s);
        a.length > 0 && t({ level: "info", message: `Multi-language: deleted the files of ${a.join(", ")}.` }), await te(e), t({ level: "success", message: "Multi-language: per-language data files regenerated." });
      }
    }), n.registerEditorVariantProvider(At), n.registerTermEditorSection({
      id: "agentcms-multilang/term-translations",
      termType: "all",
      priority: 50,
      component: It
    }), Ot();
  }
};
export {
  jt as default
};
