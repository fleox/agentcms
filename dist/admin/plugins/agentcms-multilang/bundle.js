import { canonicalUrl as R, getActiveTheme as X, renderMarkdown as Ee, applyFilters as Ue, mediaToView as ue, markdownToPlainText as de, renderPageToHtml as pe, renderHome as De, updatePost as V, updatePluginConfig as Fe, getStorageCapabilities as Oe, deleteFolder as He, deleteFile as K, pathToPublicUrl as Q, publishPostsJson as _e, publishAuthorsJson as ze, useCmsData as he, toast as W, isValidSlug as me, fetchAllPosts as ae } from "@agent-cms/runtime";
import { jsxs as T, jsx as p } from "react/jsx-runtime";
import { useState as se } from "react";
import { useTranslation as fe } from "react-i18next";
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
}, je = "# agentcms-multilang\n\nMulti-language support for AgentCMS — translated posts, pages, categories and tags, hreflang SEO, per-language sitemaps and RSS feeds, and a public language switcher.\n\n## What it does\n\n- **Language tabs in the editor**: an editor *variant provider* adds a tab strip above the post / page editor, one tab per language (★ = primary). Switching tab swaps the whole editor — title, slug, content (blocks included), excerpt and SEO — so every language gets the same authoring experience. Translation tabs appear once the post has been saved once.\n- **Term translations**: a collapsible section in each row of **Categories / Tags** holds the per-language `name`, `slug`, description and SEO.\n- **URL strategy**: the primary language lives at the site root (`site.com/news/hello.html`); every other enabled language lives under its own prefix (`site.com/fr/actualites/bonjour.html`), with its own home (`/fr/index.html`, optionally a static page per language) and category archives. The page that drives a language's home (its per-language home page, else the site's static home page) is published only at that home — never also as `/fr/<slug>.html` — and sitemaps / hreflang list it as `/fr/`, like the core does for the primary static home.\n- **SEO**: `<link rel=\"alternate\" hreflang=\"…\">` for every language plus `x-default`, `og:locale` and `og:locale:alternate` on every published page, and `<html lang>` per page (`BaseLayoutProps.currentLocale`). The canonical link stays the theme's job: the publisher hands the theme the localized `currentPath`, so a theme that emits `canonicalUrl(baseUrl, currentPath)` gets the right per-language canonical.\n- **Sitemaps** (with `agentcms-sitemaps` enabled): `<xhtml:link rel=\"alternate\">` entries inside each `<url>`, the translated URLs in the yearly sitemaps, and — when News is enabled — one `sitemaps/sitemap-news-<lang>.xml` per secondary language, referenced from the index.\n- **RSS** (with `agentcms-rss` enabled and its site feed on): one `/<lang>/rss.xml` per secondary language, through the RSS plugin's `rss.site.locales` filter. Legacy `/<lang>/feed.xml` and per-category `/<lang>/<slug>/<slug>.xml` files from versions ≤ 1.6.1 are deleted on the next publish.\n- **Search** (with `agentcms-search` enabled): one `/<lang>/search-index.json` per secondary language (translated titles, excerpts, categories and URLs, UI strings in that language), through the search plugin's `search.index.locales` filter. The search modal on `/<lang>/` pages loads it.\n- **Image alt text and caption per language**: the media library shows one alt / caption pair per secondary language (`Media.translations[lang]`, also `agentcms media update <id> --lang <code>`). Featured images, cards and home blocks of a language's pages use them; an empty field falls back to the primary language's. Images inside a body keep the alt text written in each translation's Markdown.\n- **Site title and description per language** (`siteTexts`, optional): replace the site title / description of Settings → General on that language's pages (header, footer, `<title>`, data JSON) and as its RSS channel title.\n- **Removing a language**: the plugin remembers the languages it published (`lastPublishedLanguages`); after a language leaves the list, the next listing pass (any publish, or **Regenerate → Everything**) deletes its whole `/<lang>/` tree — folder delete when the hosting supports it, else the known files.\n- **Language switcher**: a small script injected through `page.body.end` fills `[data-cms-langswitch=\"header\"]` and `[data-cms-langswitch=\"footer\"]` containers with links to the current page's alternates (toggles in the plugin settings). The in-tree themes (default, magazine, corporate, storefront, portfolio) ship these containers; other themes just add an empty `<div data-cms-langswitch=\"header\"></div>`.\n\n## Requirements\n\n- AgentCMS admin with runtime API **1.4.0** or newer (the plugin uses `registerEditorVariantProvider`, `publish.before(post, ctx)`, `regenerate.listings.before` and `sitemap.news.locales`).\n- The plugin ships pre-installed with AgentCMS (bundled default); this folder is its source.\n\n## Build and install (from source)\n\n1. `npm install --legacy-peer-deps`\n2. `npm run build` — type-checks, produces `dist/bundle.js` + `agentcms-multilang.zip`\n3. In the admin, **Plugins** → **Install plugin** → drop the ZIP (same id = in-place upgrade).\n4. Open **Settings → Multi-language** and pick the primary language + additional languages.\n\n## Workflow\n\n1. Write the post in the primary language with the standard editor and save it.\n2. Click a language tab above the editor and fill the title, slug, content, excerpt and SEO for that language. Save.\n3. Publish. The publisher renders the primary version and every translation in one pass (`publish.additional`), each at its own path; removed translations are deleted from the site.\n\n## Storage\n\n- Per-post translations live on `Post.translations[<lang>]` (`{ slug, title, contentMarkdown, excerpt, seo }`).\n- Per-term translations live on `Term.translations[<lang>]` (`{ slug, name, description, seo }`).\n- Published translation paths are tracked in `Post.lastPublishedPathsByLocale` (orphan cleanup).\n- Plugin config (languages, primary, per-language home page, per-language site texts, switcher toggles, published-languages bookkeeping) lives in `settings.pluginConfigs[\"agentcms-multilang\"]`.\n\nAll storage flows through the standard backend dispatcher — it works the same on every data backend (Firebase, SQLite file, Markdown in git, this browser).\n\n## Theme compatibility\n\nTranslated pages render through the **active theme exactly as the primary publisher does** — same templates, BaseLayout and CSS. Themes should:\n\n- use `currentLocale` for `<html lang>` and `site.homePath ?? \"/index.html\"` for home links;\n- render translated menu labels from `item.labels[<lang>]` in their menu loader (the bundled loaders do);\n- add `[data-cms-langswitch]` containers where the switcher should appear.\n\nBlock markers in translated content go through the same `post.html.body` filters as the primary render. Those filters receive a per-language publish context as an extra third argument (`ctx.settings.language` = the target language), because `getCurrentPublishContext()` is only set during the core's own renders.\n\n## Known limitations\n\n- Theme-specific rich homes (e.g. magazine's hero / sidebar widgets) are not replicated in secondary languages. Pick a **static page** as the home of each language for full control.\n- `post.markdown.before` and `post.template.props` filters don't run for translated renders.\n- The archives plugin's per-language pages (`/<lang>/archives/…`) don't use the translated site texts yet.\n- Adding a language needs **Regenerate → Everything** (translations, homes, archives, data JSON, feeds, sitemaps, search).\n- Concurrent edits to one post's translations are last-write-wins (one document / row per post).\n", Be = { title: "Multi-language", intro: "Configure additional languages. Each enabled language gets its own URL prefix and per-post translations.", save: "Save settings", saving: "Saving…", saved: "Saved.", primaryLanguage: { title: "Primary language", help: "Pages in this language live at the root URL (no language prefix). All other languages render under /<lang>/.", siteHint: 'Site language is currently "{{lang}}".' }, enabledLanguages: { title: "Additional languages", help: "Click a language to toggle it. Enabled languages appear in the editor's Translations tab + on the public site under /<lang>/." }, homePages: { title: "Home page per language", help: "Optional: pick a static page (in the corresponding language) to render at /<lang>/. Leave empty for a basic latest-posts list.", none: "— Latest posts —" }, siteTexts: { title: "Site title and description per language", help: "Optional: shown instead of the site title and description (Settings → General) on the pages of each language — header, footer, page titles, RSS channel. Leave empty to keep the primary-language texts. Apply with Regenerate → Everything.", siteTitle: "Site title", siteDescription: "Site description" }, switcher: { title: "Language switcher", help: "Show a language switcher on the public site. Themes must include a [data-cms-langswitch] container in their Header / Footer for the switcher to appear (built-in themes already do).", header: "Show switcher in the site header", footer: "Show switcher in the site footer" } }, qe = { label: "Multi-language files", description: "Per-language data files (/<lang>/data/*.json) + removal of the files of languages no longer enabled" }, Ge = { label: "Translations", noLanguages: "No additional languages are configured for this site.", configureLanguages: "Configure languages", editPrimaryInMain: "Edit the primary language in the main editor (title, slug, content above).", save: "Save translations", saving: "Saving…", saved: "Translations saved.", duplicate: "Duplicate from primary", invalidSlug: "Invalid slug for {{lang}}.", fields: { title: "Title", slug: "Slug", slugHelp: "Lower-case ASCII + dashes only.", excerpt: "Excerpt", content: "Content (Markdown)", contentHelp: "Plain Markdown. Theme blocks (Hero, embeds, etc.) embedded in the primary language do NOT replicate automatically — paste your translated body here.", seo: "SEO", seoTitle: "SEO title", seoDescription: "Meta description" } }, Je = { title: "Translations", name: "Name", slug: "Slug", invalidSlug: "Invalid slug", seoTitle: "SEO meta title", seoDescription: "SEO meta description", noLanguages: "Enable secondary languages in the Multi-language plugin settings to translate this term." }, Ve = {
  settings: Be,
  regenerationTarget: qe,
  tab: Ge,
  termSection: Je
}, Ke = { title: "Multilingue", intro: "Configurez les langues supplémentaires. Chaque langue activée obtient son préfixe d'URL et des traductions par contenu.", save: "Sauvegarder", saving: "Sauvegarde…", saved: "Sauvegardé.", primaryLanguage: { title: "Langue principale", help: "Les pages dans cette langue se trouvent à la racine du site (sans préfixe). Les autres langues sont sous /<lang>/.", siteHint: "La langue du site est actuellement « {{lang}} »." }, enabledLanguages: { title: "Langues supplémentaires", help: "Cliquez une langue pour l'activer. Les langues activées apparaissent dans l'onglet Traductions de l'éditeur et sur le site public sous /<lang>/." }, homePages: { title: "Page d'accueil par langue", help: "Optionnel : choisissez une page statique (dans la langue correspondante) pour servir d'accueil à /<lang>/. Sinon, une liste des derniers articles est rendue.", none: "— Derniers articles —" }, siteTexts: { title: "Titre et description du site par langue", help: "Optionnel : affichés à la place du titre et de la description du site (Réglages → Général) sur les pages de chaque langue — en-tête, pied de page, titres des pages, canal RSS. Laissez vide pour garder les textes de la langue principale. Appliquez avec Régénérer → Tout.", siteTitle: "Titre du site", siteDescription: "Description du site" }, switcher: { title: "Sélecteur de langue", help: "Affiche un sélecteur de langue sur le site public. Les thèmes doivent intégrer un conteneur [data-cms-langswitch] dans leur Header / Footer pour que le sélecteur apparaisse (les thèmes intégrés le font déjà).", header: "Afficher le sélecteur dans l'en-tête du site", footer: "Afficher le sélecteur dans le pied de page du site" } }, We = { label: "Fichiers multilingues", description: "Fichiers de données par langue (/<lang>/data/*.json) + suppression des fichiers des langues retirées" }, Xe = { label: "Traductions", noLanguages: "Aucune langue supplémentaire n'est configurée.", configureLanguages: "Configurer les langues", editPrimaryInMain: "Modifiez la langue principale dans l'éditeur (titre, slug, contenu ci-dessus).", save: "Sauvegarder les traductions", saving: "Sauvegarde…", saved: "Traductions sauvegardées.", duplicate: "Dupliquer depuis la langue principale", invalidSlug: "Slug invalide pour {{lang}}.", fields: { title: "Titre", slug: "Slug", slugHelp: "Caractères ASCII minuscules + tirets uniquement.", excerpt: "Extrait", content: "Contenu (Markdown)", contentHelp: "Markdown simple. Les blocs de thème (Hero, embeds, etc.) intégrés dans la langue principale ne sont PAS répliqués automatiquement — collez votre contenu traduit ici.", seo: "SEO", seoTitle: "Titre SEO", seoDescription: "Méta description" } }, Qe = { title: "Traductions", name: "Nom", slug: "Slug", invalidSlug: "Slug invalide", seoTitle: "Titre meta SEO", seoDescription: "Description meta SEO", noLanguages: "Activez des langues secondaires dans les réglages du plugin Multilingue pour traduire ce terme." }, Ye = {
  settings: Ke,
  regenerationTarget: We,
  tab: Xe,
  termSection: Qe
}, O = {
  primaryLanguage: "en",
  enabledLanguages: [],
  homePages: {},
  menuTranslations: {},
  showHeaderSwitcher: !0,
  showFooterSwitcher: !1,
  siteTexts: {}
}, z = "agentcms-multilang";
function w(n) {
  var t;
  const e = (t = n.pluginConfigs) == null ? void 0 : t[z];
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
function b(n, e) {
  return n.primaryLanguage === e;
}
function D(n, e, t) {
  var o, r, l;
  const a = b(t, e) || (o = t.siteTexts) == null ? void 0 : o[e], s = (r = a == null ? void 0 : a.title) == null ? void 0 : r.trim(), i = (l = a == null ? void 0 : a.description) == null ? void 0 : l.trim();
  return {
    ...n,
    language: e,
    ...s ? { title: s } : {},
    ...i ? { description: i } : {}
  };
}
function H(n) {
  const { post: e, trans: t, primaryTermTrans: a, primaryTermSlug: s, language: i, config: o } = n, r = b(o, i) ? "" : `${i}/`;
  if (e.type === "page")
    return `${r}${t.slug}.html`;
  const l = (a == null ? void 0 : a.slug) ?? s;
  return l ? `${r}${l}/${t.slug}.html` : `${r}${t.slug}.html`;
}
function Y(n, e, t, a) {
  if (n.type !== "category")
    throw new Error(`buildLocalizedTermUrl: term type "${n.type}" is not supported (categories only).`);
  return `${b(a, t) ? "" : `${t}/`}${e.slug}/index.html`;
}
function _(n, e) {
  return b(e, n) ? "index.html" : `${n}/index.html`;
}
function Ze(n, e, t) {
  var a;
  if (!b(e, t)) {
    const s = (a = e.homePages) == null ? void 0 : a[t];
    if (s) return s;
  }
  if (n.homeMode === "static-page" && n.homePageId) return n.homePageId;
}
function Z(n, e, t, a) {
  if (!e || n.type !== "page") return !1;
  const s = Ze(e, t, a);
  return !!s && s === n.id;
}
function ye(n) {
  return Z(n.post, n.settings, n.config, n.language) ? _(n.language, n.config) : H(n);
}
function $(n, e) {
  const t = n.translations, a = t == null ? void 0 : t[e];
  return !a || !a.slug || !a.title ? null : a;
}
function P(n, e) {
  const t = n.translations, a = t == null ? void 0 : t[e];
  return !a || !a.slug || !a.name ? null : a;
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
function k(n) {
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
function J(n, e, t) {
  const a = e.replace(/\/+$/, "");
  if (!a) return "";
  const s = [];
  for (const o of n.alternates) {
    const r = R(a, o.path);
    s.push(
      `<link rel="alternate" hreflang="${k(o.language)}" href="${k(r)}" />`
    );
  }
  const i = n.alternates.find((o) => o.language === t.primaryLanguage);
  if (i) {
    const o = R(a, i.path);
    s.push(`<link rel="alternate" hreflang="x-default" href="${k(o)}" />`);
  }
  s.push(
    `<meta property="og:locale" content="${k(ie(n.current.language))}" />`
  );
  for (const o of n.alternates)
    o.language !== n.current.language && s.push(
      `<meta property="og:locale:alternate" content="${k(ie(o.language))}" />`
    );
  return s.join(`
`);
}
function be(n, e, t) {
  const a = e.replace(/\/+$/, "");
  if (!a || n.alternates.length === 0) return "";
  const s = [];
  for (const o of n.alternates) {
    const r = R(a, o.path);
    s.push(
      `    <xhtml:link rel="alternate" hreflang="${k(o.language)}" href="${k(r)}"/>`
    );
  }
  const i = n.alternates.find((o) => o.language === t.primaryLanguage);
  if (i) {
    const o = R(a, i.path);
    s.push(
      `    <xhtml:link rel="alternate" hreflang="x-default" href="${k(o)}"/>`
    );
  }
  return s.join(`
`);
}
function q(n, e, t, a) {
  const s = [];
  for (const i of [t.primaryLanguage, ...t.enabledLanguages]) {
    if (s.some((g) => g.language === i)) continue;
    const o = i === t.primaryLanguage ? j(n) : $(n, i);
    if (!o) continue;
    const r = n.primaryTermId ? e.find((g) => g.id === n.primaryTermId) : void 0, l = r ? i === t.primaryLanguage ? B(r) : P(r, i) ?? void 0 : void 0;
    if (r && !l && !b(t, i)) continue;
    const u = ye({
      post: n,
      trans: o,
      primaryTermTrans: l,
      primaryTermSlug: r == null ? void 0 : r.slug,
      language: i,
      config: t,
      settings: a
    });
    s.push({ language: i, path: u });
  }
  return s;
}
function we(n, e) {
  const t = [];
  for (const a of [e.primaryLanguage, ...e.enabledLanguages]) {
    if (t.some((i) => i.language === a)) continue;
    const s = a === e.primaryLanguage ? B(n) : P(n, a);
    s && n.type === "category" && t.push({ language: a, path: Y(n, s, a, e) });
  }
  return t;
}
function ve(n) {
  const e = [];
  for (const t of [n.primaryLanguage, ...n.enabledLanguages])
    e.some((a) => a.language === t) || e.push({ language: t, path: _(t, n) });
  return e;
}
function ee(n) {
  return (n.baseUrl || "").replace(/\/+$/, "");
}
const E = /* @__PURE__ */ new Map();
function C(n, e, t, a, s) {
  E.clear();
  const i = ee(a);
  if (!i) return;
  for (const r of [...n, ...e]) {
    if (r.status !== "online") continue;
    const l = q(r, t, s, a);
    if (l.length !== 0)
      for (const u of l) {
        const g = J(
          { current: { path: u.path, language: u.language }, alternates: l },
          i,
          s
        );
        E.set(u.path, g);
      }
  }
  for (const r of t) {
    if (r.type !== "category") continue;
    const l = we(r, s);
    if (l.length !== 0)
      for (const u of l) {
        const g = J(
          { current: { path: u.path, language: u.language }, alternates: l },
          i,
          s
        );
        E.set(u.path, g);
      }
  }
  const o = ve(s);
  for (const r of o) {
    const l = J(
      { current: { path: r.path, language: r.language }, alternates: o },
      i,
      s
    );
    E.set(r.path, l);
  }
}
function et(n) {
  const e = n.replace(/^\/+/, "");
  return E.get(e) ?? E.get(`/${e}`) ?? "";
}
const U = /* @__PURE__ */ new Map();
function M(n, e, t, a, s) {
  U.clear();
  for (const o of [...n, ...e]) {
    if (o.status !== "online") continue;
    const r = q(o, t, a, s);
    if (r.length !== 0)
      for (const l of r)
        U.set(l.path, { language: l.language, alternates: r });
  }
  for (const o of t) {
    if (o.type !== "category") continue;
    const r = we(o, a);
    if (r.length !== 0)
      for (const l of r)
        U.set(l.path, { language: l.language, alternates: r });
  }
  const i = ve(a);
  for (const o of i)
    U.set(o.path, { language: o.language, alternates: i });
}
function tt(n) {
  const e = n.replace(/^\/+/, "");
  return U.get(e) ?? U.get(`/${e}`) ?? null;
}
function nt(n, e, t) {
  var s;
  if (b(t, e)) return n;
  const a = (s = n.translations) == null ? void 0 : s[e];
  return a ? { ...n, alt: a.alt || n.alt, caption: a.caption || n.caption } : n;
}
function G(n, e, t) {
  if (b(t, e)) return n;
  let a = !1;
  const s = /* @__PURE__ */ new Map();
  for (const [i, o] of n) {
    const r = nt(o, e, t);
    r !== o && (a = !0), s.set(i, r);
  }
  return a ? s : n;
}
function Le(n) {
  var a;
  const e = X(n.settings.activeThemeId);
  if (!e.settings) return;
  const t = (a = n.settings.themeConfigs) == null ? void 0 : a[e.id];
  return {
    ...e.settings.defaultConfig,
    ...t ?? {}
  };
}
function at(n, e, t) {
  const a = b(t, e), s = a ? "" : `${e}/`, i = D(n.settings, e, t), o = n.terms.map((g) => {
    if (g.type !== "category") return g;
    const d = a ? B(g) : P(g, e);
    return d ? {
      ...g,
      name: d.name,
      // Prefix with language code so buildPostUrl produces
      // <lang>/<term-slug>/<post-slug>.html for posts and
      // <lang>/<term-slug>/index.html for the archive itself.
      slug: `${s}${d.slug}`,
      description: d.description
    } : g;
  }), r = (g) => {
    const d = a ? j(g) : $(g, e);
    if (!d) return null;
    const h = g.type !== "post" || !g.primaryTermId;
    return {
      ...g,
      title: d.title,
      slug: h ? `${s}${d.slug}` : d.slug,
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
    terms: o,
    // Alt texts / captions in the target language.
    media: G(n.media, e, t)
  };
}
async function st(n) {
  var r;
  const { language: e, ctx: t, config: a } = n, s = (r = a.homePages) == null ? void 0 : r[e], i = s ? { ...t.settings, homeMode: "static-page", homePageId: s } : t.settings, o = at({ ...t, settings: i }, e, a);
  return De(o, {
    homePath: _(e, a),
    currentLocale: e
  });
}
async function it(n) {
  var N, I, F;
  const { post: e, trans: t, termTrans: a, language: s, ctx: i, config: o } = n, r = X(i.settings.activeThemeId), l = {
    settings: D(i.settings, s, o),
    resolvedMenus: { header: [], footer: [] },
    themeCssPath: `theme-assets/${i.settings.activeThemeId}.css`,
    themeConfig: Le(i),
    homePath: b(o, s) ? "/index.html" : `/${s}/index.html`
  }, u = G(i.media, s, o), g = { ...i, settings: l.settings, media: u };
  let d = Ee(t.contentMarkdown);
  d = await Ue("post.html.body", d, e, g);
  const h = i.terms.filter((A) => e.termIds.includes(A.id) && A.type === "tag"), v = e.primaryTermId ? i.terms.find((A) => A.id === e.primaryTermId && A.type === "category") : void 0, c = i.authorLookup(e.authorId), m = e.heroMediaId ? ue(u.get(e.heroMediaId)) : void 0, f = ((N = t.seo) == null ? void 0 : N.description) ?? de(t.contentMarkdown, 160);
  let y = v;
  if (v && a) {
    const Ae = b(o, s) ? "" : `${s}/`;
    y = {
      ...v,
      name: a.name,
      slug: `${Ae}${a.slug}`,
      description: a.description
    };
  }
  const S = H({
    post: e,
    trans: t,
    primaryTermTrans: a,
    primaryTermSlug: v == null ? void 0 : v.slug,
    language: s,
    config: o
  }), L = {
    site: l,
    post: {
      ...e,
      title: t.title,
      slug: t.slug,
      contentMarkdown: t.contentMarkdown,
      excerpt: t.excerpt,
      seo: t.seo
    },
    bodyHtml: d,
    author: c,
    hero: m,
    primaryTerm: y,
    tags: h
  }, x = {
    site: l,
    pageTitle: ((I = t.seo) == null ? void 0 : I.title) ?? t.title,
    pageDescription: f || void 0,
    ogImage: (F = t.seo) == null ? void 0 : F.ogImage,
    currentPath: S,
    currentLocale: s
  };
  return pe({
    base: r.templates.base,
    baseProps: x,
    template: r.templates.single,
    templateProps: L
  });
}
function rt(n) {
  var f, y, S;
  const { term: e, termTrans: t, language: a, ctx: s, config: i } = n, o = X(s.settings.activeThemeId), r = {
    settings: D(s.settings, a, i),
    resolvedMenus: { header: [], footer: [] },
    themeCssPath: `theme-assets/${s.settings.activeThemeId}.css`,
    themeConfig: Le(s),
    homePath: b(i, a) ? "/index.html" : `/${a}/index.html`
  }, l = {
    ...e,
    name: t.name,
    slug: t.slug,
    description: t.description
  }, u = b(i, a), g = u ? "" : `${a}/`, d = G(s.media, a, i), h = s.posts.filter((L) => L.status === "online" && L.primaryTermId === e.id).filter((L) => u ? !0 : $(L, a) !== null).map((L) => {
    const x = u ? j(L) : $(L, a), N = H({
      post: L,
      trans: x,
      primaryTermTrans: t,
      primaryTermSlug: e.slug,
      language: a,
      config: i
    }), I = L.heroMediaId ? ue(d.get(L.heroMediaId)) : void 0;
    return {
      ...L,
      title: x.title,
      slug: x.slug,
      excerpt: x.excerpt,
      url: N,
      hero: I,
      category: {
        name: t.name,
        url: `/${g}${t.slug}/index.html`
      }
    };
  }), v = {
    site: r,
    term: l,
    posts: h,
    categoryRssUrl: void 0,
    archivesLink: void 0,
    allCategories: [],
    popularTags: []
  }, c = Y(e, t, a, i), m = {
    site: r,
    pageTitle: ((f = t.seo) == null ? void 0 : f.title) || t.name,
    pageDescription: ((y = t.seo) == null ? void 0 : y.description) || t.description,
    ogImage: (S = t.seo) == null ? void 0 : S.ogImage,
    currentPath: c,
    currentLocale: a
  };
  return pe({
    base: o.templates.base,
    baseProps: m,
    template: o.templates.category,
    templateProps: v
  });
}
async function ot(n, e, t) {
  const a = w(t.settings);
  if (a.enabledLanguages.length === 0) {
    if (e.lastPublishedPathsByLocale && Object.keys(e.lastPublishedPathsByLocale).length > 0)
      try {
        await V(e.id, { lastPublishedPathsByLocale: {} });
      } catch {
      }
    return n;
  }
  C(t.posts, t.pages, t.terms, t.settings, a), M(t.posts, t.pages, t.terms, a, t.settings);
  const s = [...n], i = {}, o = e.primaryTermId ? t.terms.find((r) => r.id === e.primaryTermId && r.type === "category") : void 0;
  for (const r of a.enabledLanguages) {
    if (b(a, r) || Z(e, t.settings, a, r)) continue;
    const l = $(e, r);
    if (!l) continue;
    const u = o ? P(o, r) : void 0;
    if (o && !u) continue;
    const g = H({
      post: e,
      trans: l,
      primaryTermTrans: u ?? void 0,
      primaryTermSlug: o == null ? void 0 : o.slug,
      language: r,
      config: a
    }), d = await it({
      post: e,
      trans: l,
      termTrans: u ?? void 0,
      language: r,
      ctx: t,
      config: a
    });
    s.push({ path: g, html: d }), i[r] = g;
  }
  try {
    await V(e.id, { lastPublishedPathsByLocale: i });
  } catch {
  }
  return s;
}
const lt = /^[a-z]{2,3}(-[a-z0-9]{2,8})*$/i;
function te(n) {
  const e = [];
  for (const t of n.enabledLanguages)
    t === n.primaryLanguage || e.includes(t) || e.push(t);
  return e;
}
function ct(n, e) {
  const t = new Set(te(n)), a = [...n.lastPublishedLanguages ?? []];
  if (!n.lastPublishedLanguages)
    for (const o of [...e.posts, ...e.pages])
      for (const r of Object.keys(o.lastPublishedPathsByLocale ?? {})) a.push(r);
  const s = new Set(
    e.terms.filter((o) => o.type === "category").map((o) => o.slug.toLowerCase())
  ), i = [];
  for (const o of a)
    i.includes(o) || t.has(o) || o === n.primaryLanguage || !lt.test(o) || s.has(o.toLowerCase()) || i.push(o);
  return i;
}
function gt(n, e) {
  var a;
  const t = /* @__PURE__ */ new Set([
    `${n}/index.html`,
    `${n}/data/posts.json`,
    `${n}/data/authors.json`,
    `${n}/search-index.json`,
    `${n}/rss.xml`,
    `${n}/feed.xml`,
    `${n}/archives/index.html`
  ]);
  for (const s of e.terms) {
    if (s.type !== "category") continue;
    const i = P(s, n);
    i && (t.add(`${n}/${i.slug}/index.html`), t.add(`${n}/${i.slug}/${i.slug}.xml`));
  }
  for (const s of [...e.posts, ...e.pages]) {
    const i = (a = s.lastPublishedPathsByLocale) == null ? void 0 : a[n];
    i && t.add(i);
  }
  return [...t];
}
function re(n) {
  return [`sitemaps/sitemap-news-${n}.xml`];
}
function ut(n, e) {
  return !!n && n.length === e.length && n.every((t, a) => t === e[a]);
}
async function dt() {
  try {
    const n = await Oe();
    return n.model !== "files" || n.deletePrefix || n.list;
  } catch {
    return !1;
  }
}
async function pt(n, e, t) {
  let a = !1;
  if (t)
    try {
      await He(n), a = !0;
    } catch {
    }
  const s = a ? re(n) : [
    ...gt(n, e),
    ...re(n)
  ];
  for (const i of s)
    try {
      await K(i);
    } catch {
    }
}
async function Se(n, e) {
  var s;
  const t = ct(e, n), a = te(e);
  if (t.length > 0) {
    const i = await dt();
    for (const o of t)
      await pt(o, n, i);
  }
  if (t.length > 0 || !ut(e.lastPublishedLanguages, a)) {
    const o = { ...((s = n.settings.pluginConfigs) == null ? void 0 : s[z]) ?? {}, lastPublishedLanguages: a };
    try {
      await Fe(z, o), n.settings = {
        ...n.settings,
        pluginConfigs: { ...n.settings.pluginConfigs ?? {}, [z]: o }
      };
    } catch {
    }
  }
  return t;
}
async function ht(n, e) {
  const t = w(e.settings);
  if (await Se(e, t), t.enabledLanguages.length === 0) return n;
  C(e.posts, e.pages, e.terms, e.settings, t), M(e.posts, e.pages, e.terms, t, e.settings);
  const a = [...n];
  for (const s of t.enabledLanguages) {
    if (b(t, s)) continue;
    const i = _(s, t), o = await st({ language: s, ctx: e, config: t });
    a.push({ path: i, html: o });
    for (const r of e.terms) {
      if (r.type !== "category") continue;
      const l = P(r, s);
      if (!l) continue;
      const u = Y(r, l, s, t), g = rt({ term: r, termTrans: l, language: s, ctx: e, config: t });
      a.push({ path: u, html: g });
    }
  }
  return a;
}
function mt(n) {
  return { ...n, "xmlns:xhtml": "http://www.w3.org/1999/xhtml" };
}
function ft(n, e) {
  if (!e.entity) return n;
  const t = e.settings ? w(e.settings) : vt(), a = e.terms ?? Lt();
  if (!t || !a || t.enabledLanguages.length === 0) return n;
  const s = q(e.entity, a, t, e.settings ?? Pe);
  if (s.length === 0) return n;
  const i = e.baseUrl.replace(/\/+$/, "");
  return n + be(
    { current: { path: e.path, language: t.primaryLanguage }, alternates: s },
    i,
    t
  ) + `
`;
}
function yt(n, e) {
  var i, o, r, l, u, g;
  const t = w(e.settings);
  if (t.enabledLanguages.length === 0) return n;
  const a = ee(e.settings);
  if (!a) return n;
  const s = [...n];
  for (const d of [...e.posts, ...e.pages]) {
    if (d.status !== "online") continue;
    const h = ((o = (i = d.createdAt) == null ? void 0 : i.toMillis) == null ? void 0 : o.call(i)) ?? ((l = (r = d.publishedAt) == null ? void 0 : r.toMillis) == null ? void 0 : l.call(r)) ?? Date.now();
    if (new Date(h).getUTCFullYear() !== e.year) continue;
    const v = q(d, e.terms, t, e.settings);
    if (v.length !== 0)
      for (const c of v)
        b(t, c.language) || s.push({
          path: c.path,
          lastmodMs: ((g = (u = d.updatedAt) == null ? void 0 : u.toMillis) == null ? void 0 : g.call(u)) ?? h,
          extraInnerXml: be(
            { current: { path: c.path, language: c.language }, alternates: v },
            a,
            t
          )
        });
  }
  return s;
}
function bt(n, e) {
  var i;
  const t = (i = e.settings.pluginConfigs) == null ? void 0 : i["agentcms-sitemaps"];
  if (!(t != null && t.newsEnabled)) return n;
  const a = w(e.settings);
  if (a.enabledLanguages.length === 0) return n;
  const s = [...n];
  for (const o of a.enabledLanguages)
    b(a, o) || s.push({ path: `sitemaps/sitemap-news-${o}.xml` });
  return s;
}
function wt(n, e) {
  var r, l, u, g, d, h, v, c;
  const t = w(e.settings);
  if (t.enabledLanguages.length === 0 || !ee(e.settings)) return n;
  const s = e.config.newsWindowDays || 2, i = Date.now() - s * 24 * 60 * 60 * 1e3, o = [...n];
  for (const m of t.enabledLanguages) {
    if (b(t, m)) continue;
    const f = [];
    for (const y of [...e.posts, ...e.pages]) {
      if (y.status !== "online") continue;
      const S = ((l = (r = y.updatedAt) == null ? void 0 : r.toMillis) == null ? void 0 : l.call(r)) ?? ((g = (u = y.publishedAt) == null ? void 0 : u.toMillis) == null ? void 0 : g.call(u)) ?? ((h = (d = y.createdAt) == null ? void 0 : d.toMillis) == null ? void 0 : h.call(d)) ?? Date.now();
      if (S < i) continue;
      const L = $(y, m);
      if (!L) continue;
      const x = y.primaryTermId ? e.terms.find((F) => F.id === y.primaryTermId && F.type === "category") : void 0, N = x ? P(x, m) ?? void 0 : void 0, I = ye({
        post: y,
        trans: L,
        primaryTermTrans: N,
        primaryTermSlug: x == null ? void 0 : x.slug,
        language: m,
        config: t,
        settings: e.settings
      });
      f.push({
        path: I,
        title: L.title,
        createdAtMs: ((c = (v = y.createdAt) == null ? void 0 : v.toMillis) == null ? void 0 : c.call(v)) ?? S,
        updatedAtMs: S
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
let Te = null, xe = null, Pe = null;
function ke(n) {
  Te = n;
}
function $e(n) {
  xe = n;
}
function Ce(n) {
  Pe = n;
}
function vt() {
  return Te;
}
function Lt() {
  return xe;
}
const St = 20;
function Tt(n) {
  return `${n}/rss.xml`;
}
function xt(n) {
  return `${n}/feed.xml`;
}
function Pt(n, e) {
  return `${n}/${e}/${e}.xml`;
}
function kt(n) {
  const e = w(n.settings);
  if (e.enabledLanguages.length === 0) return [];
  const t = [];
  for (const a of e.enabledLanguages) {
    if (b(e, a)) continue;
    const s = Ct(n.posts, n.terms, a, e, n.baseUrl);
    t.push({
      language: a,
      path: Tt(a),
      ...$t(n.settings, a, e),
      channelLink: Q(n.baseUrl, _(a, e)),
      items: s
    });
  }
  return t;
}
function $t(n, e, t) {
  var o, r;
  const a = (o = t.siteTexts) == null ? void 0 : o[e], s = D(n, e, t);
  return {
    channelTitle: (r = a == null ? void 0 : a.title) != null && r.trim() ? s.title : `${n.title || "Site"} (${Nt(e)})`,
    channelDescription: s.description || s.title || ""
  };
}
async function Me(n) {
  const e = w(n.settings);
  for (const t of e.enabledLanguages)
    if (!b(e, t)) {
      try {
        await K(xt(t));
      } catch {
      }
      for (const a of n.terms) {
        if (a.type !== "category") continue;
        const s = P(a, t);
        if (s)
          try {
            await K(Pt(t, s.slug));
          } catch {
          }
      }
    }
}
function Ct(n, e, t, a, s) {
  return n.filter((i) => i.status === "online").map((i) => Mt(i, e, t, a, s)).filter((i) => i !== null).sort((i, o) => o.pubDateMs - i.pubDateMs).slice(0, St);
}
function Mt(n, e, t, a, s) {
  var h, v, c, m, f, y;
  const i = $(n, t);
  if (!i) return null;
  const o = n.primaryTermId ? e.find((S) => S.id === n.primaryTermId && S.type === "category") : void 0, r = o ? P(o, t) : void 0;
  if (o && !r) return null;
  const l = H({
    post: n,
    trans: i,
    primaryTermTrans: r ?? void 0,
    primaryTermSlug: o == null ? void 0 : o.slug,
    language: t,
    config: a
  }), u = Q(s, l), g = (i.excerpt && i.excerpt.trim().length > 0 ? i.excerpt : de(i.contentMarkdown, 300)).trim(), d = ((v = (h = n.publishedAt) == null ? void 0 : h.toMillis) == null ? void 0 : v.call(h)) ?? ((m = (c = n.updatedAt) == null ? void 0 : c.toMillis) == null ? void 0 : m.call(c)) ?? ((y = (f = n.createdAt) == null ? void 0 : f.toMillis) == null ? void 0 : y.call(f)) ?? Date.now();
  return {
    title: i.title,
    link: u,
    guid: u,
    description: g,
    pubDateMs: d,
    category: r == null ? void 0 : r.name
  };
}
function Nt(n) {
  try {
    const e = new Intl.DisplayNames([n], { type: "language" }).of(n);
    return e ? e.charAt(0).toLocaleUpperCase(n) + e.slice(1) : n;
  } catch {
    return n.toUpperCase();
  }
}
function Ne(n, e, t) {
  const a = b(t, e), s = a ? "" : `${e}/`, i = n.terms.map((r) => {
    if (r.type !== "category") return r;
    const l = a ? B(r) : P(r, e);
    return l ? {
      ...r,
      name: l.name,
      slug: `${s}${l.slug}`,
      description: l.description
    } : r;
  }), o = (r) => {
    const l = a ? j(r) : $(r, e);
    if (!l) return null;
    const u = r.type !== "post" || !r.primaryTermId, g = Z(r, n.settings, t, e) ? `${s}index` : u ? `${s}${l.slug}` : l.slug;
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
async function ne(n) {
  const e = w(n.settings);
  if (e.enabledLanguages.length !== 0)
    for (const t of e.enabledLanguages) {
      if (b(e, t)) continue;
      const a = Ne(n, t, e), s = { ...D(n.settings, t, e), homePageId: void 0 }, i = G(n.media, t, e), o = `${t}/data/posts.json`, r = `${t}/data/authors.json`;
      try {
        await _e(
          s,
          a.posts,
          a.pages,
          a.terms,
          i,
          o
        );
      } catch {
      }
      try {
        await ze(
          n.users,
          i,
          a.posts,
          a.pages,
          r
        );
      } catch {
      }
    }
}
function It(n) {
  const e = w(n.settings), t = [];
  for (const a of te(e)) {
    const s = Ne(n, a, e), i = new Set(
      n.terms.filter((r) => r.type === "category" && !P(r, a)).map((r) => r.id)
    ), o = s.posts.filter(
      (r) => !r.primaryTermId || !i.has(r.primaryTermId)
    );
    t.push({
      language: a,
      path: `${a}/search-index.json`,
      posts: o,
      pages: s.pages,
      terms: s.terms,
      // homePageId cleared: the language's home page already carries
      // its `<lang>/index` slug (→ linked as `<lang>/`); the core's
      // static-home mapping would send it to the primary home.
      settings: { ...D(n.settings, a, e), homePageId: void 0 }
    });
  }
  return t;
}
const oe = ["en", "fr", "de", "es", "nl", "pt", "ko"];
function At({ config: n, save: e }) {
  const { t } = fe("agentcms-multilang"), { settings: a, pages: s } = he(), [i, o] = se({
    ...O,
    ...n
  }), [r, l] = se(!1);
  async function u() {
    l(!0);
    try {
      await e(i), W.success(t("settings.saved"));
    } catch (c) {
      W.error(c.message || "Save failed");
    } finally {
      l(!1);
    }
  }
  function g(c) {
    o((m) => {
      const y = m.enabledLanguages.includes(c) ? m.enabledLanguages.filter((S) => S !== c) : [...m.enabledLanguages, c];
      return { ...m, enabledLanguages: y };
    });
  }
  function d(c, m) {
    o((f) => ({
      ...f,
      homePages: { ...f.homePages ?? {}, [c]: m || "" }
    }));
  }
  function h(c, m, f) {
    o((y) => {
      var S;
      return {
        ...y,
        siteTexts: {
          ...y.siteTexts ?? {},
          [c]: { ...((S = y.siteTexts) == null ? void 0 : S[c]) ?? {}, [m]: f }
        }
      };
    });
  }
  const v = (a.language || "en").split("-")[0];
  return /* @__PURE__ */ T("div", { className: "space-y-6", children: [
    /* @__PURE__ */ T("div", { children: [
      /* @__PURE__ */ p("h2", { className: "font-semibold text-lg", children: t("settings.title") }),
      /* @__PURE__ */ p("p", { className: "text-sm text-surface-500 dark:text-surface-400", children: t("settings.intro") })
    ] }),
    /* @__PURE__ */ T("section", { className: "card p-4 space-y-3", children: [
      /* @__PURE__ */ p("h3", { className: "font-medium", children: t("settings.primaryLanguage.title") }),
      /* @__PURE__ */ p("p", { className: "text-xs text-surface-500 dark:text-surface-400", children: t("settings.primaryLanguage.help") }),
      /* @__PURE__ */ T("div", { className: "flex flex-wrap gap-2", children: [
        /* @__PURE__ */ p(
          "select",
          {
            className: "input max-w-[200px]",
            value: i.primaryLanguage,
            onChange: (c) => o({ ...i, primaryLanguage: c.target.value }),
            children: oe.map((c) => /* @__PURE__ */ p("option", { value: c, children: c.toUpperCase() }, c))
          }
        ),
        /* @__PURE__ */ p("span", { className: "text-[11px] text-surface-500 self-center", children: t("settings.primaryLanguage.siteHint", { lang: v }) })
      ] })
    ] }),
    /* @__PURE__ */ T("section", { className: "card p-4 space-y-3", children: [
      /* @__PURE__ */ p("h3", { className: "font-medium", children: t("settings.enabledLanguages.title") }),
      /* @__PURE__ */ p("p", { className: "text-xs text-surface-500 dark:text-surface-400", children: t("settings.enabledLanguages.help") }),
      /* @__PURE__ */ p("div", { className: "flex flex-wrap gap-2", children: oe.filter((c) => c !== i.primaryLanguage).map((c) => {
        const m = i.enabledLanguages.includes(c);
        return /* @__PURE__ */ p(
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
    i.enabledLanguages.length > 0 && /* @__PURE__ */ T("section", { className: "card p-4 space-y-3", children: [
      /* @__PURE__ */ p("h3", { className: "font-medium", children: t("settings.homePages.title") }),
      /* @__PURE__ */ p("p", { className: "text-xs text-surface-500 dark:text-surface-400", children: t("settings.homePages.help") }),
      /* @__PURE__ */ p("div", { className: "space-y-2", children: i.enabledLanguages.map((c) => {
        var m;
        return /* @__PURE__ */ T("div", { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ p("span", { className: "text-[10px] uppercase font-semibold w-8", children: c }),
          /* @__PURE__ */ T(
            "select",
            {
              className: "input flex-1",
              value: ((m = i.homePages) == null ? void 0 : m[c]) ?? "",
              onChange: (f) => d(c, f.target.value),
              children: [
                /* @__PURE__ */ p("option", { value: "", children: t("settings.homePages.none") }),
                s.filter((f) => f.status === "online").map((f) => /* @__PURE__ */ p("option", { value: f.id, children: f.title }, f.id))
              ]
            }
          )
        ] }, c);
      }) })
    ] }),
    i.enabledLanguages.length > 0 && /* @__PURE__ */ T("section", { className: "card p-4 space-y-3", children: [
      /* @__PURE__ */ p("h3", { className: "font-medium", children: t("settings.siteTexts.title") }),
      /* @__PURE__ */ p("p", { className: "text-xs text-surface-500 dark:text-surface-400", children: t("settings.siteTexts.help") }),
      /* @__PURE__ */ p("div", { className: "space-y-3", children: i.enabledLanguages.map((c) => {
        var m, f, y, S;
        return /* @__PURE__ */ T("div", { className: "flex items-start gap-2", children: [
          /* @__PURE__ */ p("span", { className: "text-[10px] uppercase font-semibold w-8 pt-2", children: c }),
          /* @__PURE__ */ T("div", { className: "flex-1 space-y-2", children: [
            /* @__PURE__ */ p(
              "input",
              {
                type: "text",
                className: "input w-full",
                "aria-label": `${t("settings.siteTexts.siteTitle")} (${c})`,
                placeholder: a.title || t("settings.siteTexts.siteTitle"),
                value: ((f = (m = i.siteTexts) == null ? void 0 : m[c]) == null ? void 0 : f.title) ?? "",
                onChange: (L) => h(c, "title", L.target.value)
              }
            ),
            /* @__PURE__ */ p(
              "textarea",
              {
                className: "input w-full",
                rows: 2,
                "aria-label": `${t("settings.siteTexts.siteDescription")} (${c})`,
                placeholder: a.description || t("settings.siteTexts.siteDescription"),
                value: ((S = (y = i.siteTexts) == null ? void 0 : y[c]) == null ? void 0 : S.description) ?? "",
                onChange: (L) => h(c, "description", L.target.value)
              }
            )
          ] })
        ] }, c);
      }) })
    ] }),
    i.enabledLanguages.length > 0 && /* @__PURE__ */ T("section", { className: "card p-4 space-y-3", children: [
      /* @__PURE__ */ p("h3", { className: "font-medium", children: t("settings.switcher.title") }),
      /* @__PURE__ */ p("p", { className: "text-xs text-surface-500 dark:text-surface-400", children: t("settings.switcher.help") }),
      /* @__PURE__ */ T("label", { className: "flex items-center gap-2 text-sm", children: [
        /* @__PURE__ */ p(
          "input",
          {
            type: "checkbox",
            checked: i.showHeaderSwitcher ?? !0,
            onChange: (c) => o({ ...i, showHeaderSwitcher: c.target.checked })
          }
        ),
        /* @__PURE__ */ p("span", { children: t("settings.switcher.header") })
      ] }),
      /* @__PURE__ */ T("label", { className: "flex items-center gap-2 text-sm", children: [
        /* @__PURE__ */ p(
          "input",
          {
            type: "checkbox",
            checked: i.showFooterSwitcher ?? !1,
            onChange: (c) => o({ ...i, showFooterSwitcher: c.target.checked })
          }
        ),
        /* @__PURE__ */ p("span", { children: t("settings.switcher.footer") })
      ] })
    ] }),
    /* @__PURE__ */ p("div", { className: "flex gap-2", children: /* @__PURE__ */ p(
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
function Et({ term: n, updateTerm: e }) {
  const { t } = fe("agentcms-multilang"), { settings: a } = he(), s = w(a);
  if (s.enabledLanguages.length === 0)
    return /* @__PURE__ */ p("p", { className: "text-xs text-surface-500 dark:text-surface-400", children: t("termSection.noLanguages") });
  const i = n.translations ?? {};
  function o(r, l) {
    const u = {
      ...i,
      [r]: { ...i[r] ?? le(), ...l }
    };
    e({ translations: u });
  }
  return /* @__PURE__ */ T("div", { className: "space-y-2", children: [
    /* @__PURE__ */ p("p", { className: "text-[11px] uppercase tracking-wide font-semibold text-surface-500 dark:text-surface-400", children: t("termSection.title") }),
    s.enabledLanguages.map((r) => {
      const l = i[r] ?? le(), u = l.slug && !me(l.slug), g = l.seo ?? {};
      function d(h) {
        o(r, { seo: { ...g, ...h } });
      }
      return /* @__PURE__ */ T("div", { className: "space-y-2 border-t border-surface-200 dark:border-surface-700 pt-2 first:border-t-0 first:pt-0", children: [
        /* @__PURE__ */ T("div", { className: "flex flex-wrap items-start gap-2", children: [
          /* @__PURE__ */ p("span", { className: "text-[10px] uppercase font-semibold w-8 pt-2 text-surface-500", children: r }),
          /* @__PURE__ */ p(
            "input",
            {
              type: "text",
              className: "input flex-1 min-w-[120px]",
              placeholder: t("termSection.name"),
              value: l.name,
              onChange: (h) => o(r, { name: h.target.value })
            }
          ),
          /* @__PURE__ */ T("div", { className: "flex-1 min-w-[120px]", children: [
            /* @__PURE__ */ p(
              "input",
              {
                type: "text",
                className: "input",
                placeholder: t("termSection.slug"),
                value: l.slug,
                onChange: (h) => o(r, { slug: h.target.value })
              }
            ),
            u && /* @__PURE__ */ p("p", { className: "text-[10px] text-red-600 mt-0.5", children: t("termSection.invalidSlug") })
          ] })
        ] }),
        /* @__PURE__ */ T("div", { className: "pl-10 space-y-1", children: [
          /* @__PURE__ */ p(
            "input",
            {
              type: "text",
              className: "input w-full",
              placeholder: t("termSection.seoTitle"),
              value: g.title ?? "",
              onChange: (h) => d({ title: h.target.value })
            }
          ),
          /* @__PURE__ */ p(
            "textarea",
            {
              className: "input w-full min-h-[60px] resize-y",
              placeholder: t("termSection.seoDescription"),
              value: g.description ?? "",
              onChange: (h) => d({ description: h.target.value })
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
function Ie(n, e, t) {
  if (t)
    return {
      title: n.title,
      slug: n.slug,
      contentMarkdown: n.contentMarkdown,
      excerpt: n.excerpt,
      seo: n.seo
    };
  const a = n.translations, s = a == null ? void 0 : a[e];
  return !s || !s.title ? null : {
    title: s.title ?? "",
    slug: s.slug ?? "",
    contentMarkdown: s.contentMarkdown ?? "",
    excerpt: s.excerpt,
    seo: s.seo
  };
}
function ce(n, e, t) {
  if (t) return "★";
  const a = Ie(n, e, !1);
  return a && a.slug && a.title ? "" : "○";
}
const Ut = {
  id: "agentcms-multilang/languages",
  priority: 50,
  listVariants(n, e) {
    const t = w(e.settings);
    if (t.enabledLanguages.length === 0) return [];
    const a = [], s = /* @__PURE__ */ new Set();
    a.push({
      id: t.primaryLanguage,
      label: t.primaryLanguage.toUpperCase(),
      badge: ce(n, t.primaryLanguage, !0),
      primary: !0
    }), s.add(t.primaryLanguage);
    for (const i of t.enabledLanguages)
      s.has(i) || (s.add(i), a.push({
        id: i,
        label: i.toUpperCase(),
        badge: ce(n, i, !1),
        primary: !1
      }));
    return a;
  },
  loadFields(n, e, t) {
    const a = w(t.settings), s = b(a, e);
    return Ie(n, e, s);
  },
  validate(n, e, t, a) {
    const s = w(a.settings);
    return b(s, e) ? null : t.title.trim() ? me(t.slug) ? null : `Invalid slug for ${e.toUpperCase()}.` : `Title required for ${e.toUpperCase()}.`;
  },
  async saveFields(n, e, t, a) {
    const s = w(a.settings);
    if (b(s, e))
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
      await V(n.id, { translations: r });
    } catch (l) {
      throw W.error(l.message), l;
    }
  },
  getSlugPathPrefix(n, e, t, a) {
    var g;
    const s = w(a.settings), i = b(s, e) ? "" : `${e}/`;
    if (n.type !== "post" || !n.primaryTermId) return i;
    const o = a.terms.find((d) => d.id === n.primaryTermId);
    if (!o) return i;
    const r = o.translations, u = !b(s, e) && ((g = r == null ? void 0 : r[e]) == null ? void 0 : g.slug) || o.slug;
    return `${i}${u}/`;
  }
}, Dt = `
.cms-langswitch{display:inline-flex;align-items:center;gap:6px;font-size:12px;line-height:1;letter-spacing:0.05em;}
.cms-langswitch a,.cms-langswitch span{padding:4px 8px;border-radius:4px;text-decoration:none;color:inherit;text-transform:uppercase;font-weight:600;}
.cms-langswitch a{opacity:0.55;}
.cms-langswitch a:hover{opacity:1;}
.cms-langswitch__current{background:currentColor;color:transparent;position:relative;}
.cms-langswitch__current::after{content:attr(data-label);position:absolute;inset:0;display:flex;align-items:center;justify-content:center;color:var(--cms-langswitch-on,white);mix-blend-mode:difference;}
`.replace(/\s+/g, " ").trim();
function Ft(n) {
  return n.replace(/[<>&\u2028\u2029]/g, (e) => e === "<" ? "\\u003c" : e === ">" ? "\\u003e" : e === "&" ? "\\u0026" : e === "\u2028" ? "\\u2028" : "\\u2029");
}
function Ot(n) {
  const { config: e, settings: t, currentPath: a } = n;
  if (e.enabledLanguages.length === 0 || !e.showHeaderSwitcher && !e.showFooterSwitcher) return "";
  const s = tt(a);
  if (!s || s.alternates.length < 2) return "";
  const i = (t.baseUrl || "").replace(/\/+$/, ""), o = s.alternates.map((h) => ({
    lang: h.language,
    label: h.language.toUpperCase(),
    href: i ? Q(i, h.path) : `/${h.path.replace(/^\/+/, "")}`
  })), r = s.language, l = e.primaryLanguage, u = {
    current: r,
    primary: l,
    items: o,
    showHeader: e.showHeaderSwitcher !== !1,
    showFooter: e.showFooterSwitcher === !0
  };
  return `<script>${`
(function(){
  try {
    var D = ${Ft(JSON.stringify(u))};
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
      s.textContent = ${JSON.stringify(Dt)};
      document.head.appendChild(s);
    }
    if (document.readyState !== 'loading') paint();
    else document.addEventListener('DOMContentLoaded', paint);
  } catch (e) {}
})();`}<\/script>`;
}
async function Ht(n, e) {
  const t = w(e.settings);
  ke(t), $e(e.terms), Ce(e.settings), C(e.posts, e.pages, e.terms, e.settings, t), M(e.posts, e.pages, e.terms, t, e.settings), await Me(e), await ne(e);
}
async function ge(n, e) {
  const t = w(e.settings);
  ke(t), $e(e.terms), Ce(e.settings), C(e.posts, e.pages, e.terms, e.settings, t), M(e.posts, e.pages, e.terms, t, e.settings), await Me(e), await ne(e);
}
async function _t() {
  try {
    const n = window, e = n == null ? void 0 : n.__AGENTCMS_LIVE_SETTINGS__;
    if (!e) return;
    const t = w(e);
    if (t.enabledLanguages.length === 0) return;
    const [a, s] = await Promise.all([
      ae({ type: "post" }),
      ae({ type: "page" })
    ]);
    C(a, s, [], e, t), M(a, s, [], t, e);
  } catch {
  }
}
const qt = {
  id: "agentcms-multilang",
  name: "Multi-language",
  version: "1.6.7",
  description: "Multi-language site support — translated posts/pages/terms, hreflang SEO, per-language sitemap entries, per-language RSS feeds.",
  author: "AgentCMS",
  readme: je,
  i18n: { en: Ve, fr: Ye },
  settings: {
    navLabelKey: "settings.title",
    defaultConfig: O,
    component: At,
    schema: Re
  },
  register(n) {
    n.addFilter("publish.additional", async (e, t, a) => ot(
      e,
      t,
      a
    )), n.addFilter("publish.extraListings", async (e, t) => ht(
      e,
      t
    )), n.addAction("publish.before", async (e, t) => {
      const a = t, s = w(a.settings);
      C(a.posts, a.pages, a.terms, a.settings, s), M(a.posts, a.pages, a.terms, s, a.settings);
    }), n.addAction("regenerate.listings.before", async (e) => {
      const t = e, a = w(t.settings);
      C(t.posts, t.pages, t.terms, t.settings, a), M(t.posts, t.pages, t.terms, a, t.settings);
    }), n.addAction("publish.complete", async (e, t) => {
      await Ht(e, t);
    }), n.addAction("post.unpublished", async (e, t) => {
      await ge(e, t);
    }), n.addAction("post.deleted", async (e, t) => {
      await ge(e, t);
    }), n.addFilter("page.head.extra", (e, ...t) => {
      const a = t[0];
      if (!(a != null && a.currentPath)) return e;
      const s = et(a.currentPath);
      return s ? e + (e ? `
` : "") + s : e;
    }), n.addFilter("page.body.end", (e, ...t) => {
      var o;
      const a = t[0];
      if (!(a != null && a.currentPath) || !((o = a == null ? void 0 : a.site) != null && o.settings)) return e;
      const s = w(a.site.settings), i = Ot({
        config: s,
        settings: a.site.settings,
        currentPath: a.currentPath
      });
      return i ? e + (e ? `
` : "") + i : e;
    }), n.addFilter(
      "sitemap.urlset.namespaces",
      (e) => mt(e)
    ), n.addFilter("sitemap.url.entry", (e, ...t) => {
      const a = t[0];
      return ft(e, a);
    }), n.addFilter("sitemap.urls.extra", (e, ...t) => {
      const a = t[0];
      return yt(
        e,
        a
      );
    }), n.addFilter("sitemap.index.extra", (e, ...t) => {
      const a = t[0];
      return bt(
        e,
        a
      );
    }), n.addFilter("sitemap.news.locales", (e, ...t) => {
      const a = t[0];
      return wt(
        e,
        a
      );
    }), n.addFilter("rss.site.locales", (e, ...t) => {
      const a = t[0];
      return a ? [
        ...e,
        ...kt(a)
      ] : e;
    }), n.addFilter("search.index.locales", (e, ...t) => {
      const a = t[0];
      return a != null && a.settings ? [...e, ...It(a)] : e;
    }), n.registerRegenerationTarget({
      id: "agentcms-multilang",
      labelKey: "regenerationTarget.label",
      descriptionKey: "regenerationTarget.description",
      priority: 150,
      run: async (e, t) => {
        const a = w(e.settings), s = await Se(e, a);
        s.length > 0 && t({ level: "info", message: `Multi-language: deleted the files of ${s.join(", ")}.` }), await ne(e), t({ level: "success", message: "Multi-language: per-language data files regenerated." });
      }
    }), n.registerEditorVariantProvider(Ut), n.registerTermEditorSection({
      id: "agentcms-multilang/term-translations",
      termType: "all",
      priority: 50,
      component: Et
    }), _t();
  }
};
export {
  qt as default
};
