import { canonicalUrl as z, getActiveTheme as J, renderMarkdown as ke, applyFilters as Ce, markdownToPlainText as re, renderPageToHtml as ie, renderHome as Me, updatePost as oe, pathToPublicUrl as G, deleteFile as Q, publishPostsJson as $e, publishAuthorsJson as Ie, useCmsData as le, toast as B, isValidSlug as ce, fetchAllPosts as Y } from "@agent-cms/runtime";
import { jsxs as L, jsx as m } from "react/jsx-runtime";
import { useState as Z } from "react";
import { useTranslation as ue } from "react-i18next";
const Ne = '# agentcms-multilang\n\nMulti-language support for AgentCMS — translated posts, pages, categories and tags, hreflang SEO, per-language sitemaps and RSS feeds, and a public language switcher.\n\n## What it does\n\n- **Language tabs in the editor**: an editor *variant provider* adds a tab strip above the post / page editor, one tab per language (★ = primary). Switching tab swaps the whole editor — title, slug, content (blocks included), excerpt and SEO — so every language gets the same authoring experience. Translation tabs appear once the post has been saved once.\n- **Term translations**: a collapsible section in each row of **Categories / Tags** holds the per-language `name`, `slug`, description and SEO.\n- **URL strategy**: the primary language lives at the site root (`site.com/news/hello.html`); every other enabled language lives under its own prefix (`site.com/fr/actualites/bonjour.html`), with its own home (`/fr/index.html`, optionally a static page per language) and category archives. The page that drives a language\'s home (its per-language home page, else the site\'s static home page) is published only at that home — never also as `/fr/<slug>.html` — and sitemaps / hreflang list it as `/fr/`, like the core does for the primary static home.\n- **SEO**: `<link rel="alternate" hreflang="…">` for every language plus `x-default`, `og:locale` and `og:locale:alternate` on every published page, and `<html lang>` per page (`BaseLayoutProps.currentLocale`). The canonical link stays the theme\'s job: the publisher hands the theme the localized `currentPath`, so a theme that emits `canonicalUrl(baseUrl, currentPath)` gets the right per-language canonical.\n- **Sitemaps** (with `agentcms-sitemaps` enabled): `<xhtml:link rel="alternate">` entries inside each `<url>`, the translated URLs in the yearly sitemaps, and — when News is enabled — one `sitemaps/sitemap-news-<lang>.xml` per secondary language, referenced from the index.\n- **RSS** (with `agentcms-rss` enabled and its site feed on): one `/<lang>/rss.xml` per secondary language, through the RSS plugin\'s `rss.site.locales` filter. Legacy `/<lang>/feed.xml` and per-category `/<lang>/<slug>/<slug>.xml` files from versions ≤ 1.6.1 are deleted on the next publish.\n- **Language switcher**: a small script injected through `page.body.end` fills `[data-cms-langswitch="header"]` and `[data-cms-langswitch="footer"]` containers with links to the current page\'s alternates (toggles in the plugin settings). The in-tree themes (default, magazine, corporate, storefront, portfolio) ship these containers; other themes just add an empty `<div data-cms-langswitch="header"></div>`.\n\n## Requirements\n\n- AgentCMS admin with runtime API **1.4.0** or newer (the plugin uses `registerEditorVariantProvider`, `publish.before(post, ctx)`, `regenerate.listings.before` and `sitemap.news.locales`).\n- The plugin ships pre-installed with AgentCMS (bundled default); this folder is its source.\n\n## Build and install (from source)\n\n1. `npm install --legacy-peer-deps`\n2. `npm run build` — type-checks, produces `dist/bundle.js` + `agentcms-multilang.zip`\n3. In the admin, **Plugins** → **Install plugin** → drop the ZIP (same id = in-place upgrade).\n4. Open **Settings → Multi-language** and pick the primary language + additional languages.\n\n## Workflow\n\n1. Write the post in the primary language with the standard editor and save it.\n2. Click a language tab above the editor and fill the title, slug, content, excerpt and SEO for that language. Save.\n3. Publish. The publisher renders the primary version and every translation in one pass (`publish.additional`), each at its own path; removed translations are deleted from the site.\n\n## Storage\n\n- Per-post translations live on `Post.translations[<lang>]` (`{ slug, title, contentMarkdown, excerpt, seo }`).\n- Per-term translations live on `Term.translations[<lang>]` (`{ slug, name, description, seo }`).\n- Published translation paths are tracked in `Post.lastPublishedPathsByLocale` (orphan cleanup).\n- Plugin config (languages, primary, per-language home page, menu label overrides, switcher toggles) lives in `settings.pluginConfigs["agentcms-multilang"]`.\n\nAll storage flows through the standard backend dispatcher — it works the same on every data backend (Firebase, SQLite file, Markdown in git, this browser).\n\n## Theme compatibility\n\nTranslated pages render through the **active theme exactly as the primary publisher does** — same templates, BaseLayout and CSS. Themes should:\n\n- use `currentLocale` for `<html lang>` and `site.homePath ?? "/index.html"` for home links;\n- render translated menu labels from `item.labels[<lang>]` in their menu loader (the bundled loaders do);\n- add `[data-cms-langswitch]` containers where the switcher should appear.\n\nBlock markers in translated content go through the same `post.html.body` filters as the primary render. Those filters receive a per-language publish context as an extra third argument (`ctx.settings.language` = the target language), because `getCurrentPublishContext()` is only set during the core\'s own renders.\n\n## Known limitations\n\n- Theme-specific rich homes (e.g. magazine\'s hero / sidebar widgets) are not replicated in secondary languages. Pick a **static page** as the home of each language for full control.\n- `post.markdown.before` and `post.template.props` filters don\'t run for translated renders.\n- Concurrent edits to one post\'s translations are last-write-wins (one document / row per post).\n', Ae = { title: "Multi-language", intro: "Configure additional languages. Each enabled language gets its own URL prefix and per-post translations.", save: "Save settings", saving: "Saving…", saved: "Saved.", primaryLanguage: { title: "Primary language", help: "Pages in this language live at the root URL (no language prefix). All other languages render under /<lang>/.", siteHint: 'Site language is currently "{{lang}}".' }, enabledLanguages: { title: "Additional languages", help: "Click a language to toggle it. Enabled languages appear in the editor's Translations tab + on the public site under /<lang>/." }, homePages: { title: "Home page per language", help: "Optional: pick a static page (in the corresponding language) to render at /<lang>/. Leave empty for a basic latest-posts list.", none: "— Latest posts —" }, switcher: { title: "Language switcher", help: "Show a language switcher on the public site. Themes must include a [data-cms-langswitch] container in their Header / Footer for the switcher to appear (built-in themes already do).", header: "Show switcher in the site header", footer: "Show switcher in the site footer" } }, Ee = { label: "Translations", noLanguages: "No additional languages are configured for this site.", configureLanguages: "Configure languages", editPrimaryInMain: "Edit the primary language in the main editor (title, slug, content above).", save: "Save translations", saving: "Saving…", saved: "Translations saved.", duplicate: "Duplicate from primary", invalidSlug: "Invalid slug for {{lang}}.", fields: { title: "Title", slug: "Slug", slugHelp: "Lower-case ASCII + dashes only.", excerpt: "Excerpt", content: "Content (Markdown)", contentHelp: "Plain Markdown. Theme blocks (Hero, embeds, etc.) embedded in the primary language do NOT replicate automatically — paste your translated body here.", seo: "SEO", seoTitle: "SEO title", seoDescription: "Meta description" } }, Ue = { title: "Translations", name: "Name", slug: "Slug", invalidSlug: "Invalid slug", seoTitle: "SEO meta title", seoDescription: "SEO meta description", noLanguages: "Enable secondary languages in the Multi-language plugin settings to translate this term." }, De = {
  settings: Ae,
  tab: Ee,
  termSection: Ue
}, He = { title: "Multilingue", intro: "Configurez les langues supplémentaires. Chaque langue activée obtient son préfixe d'URL et des traductions par contenu.", save: "Sauvegarder", saving: "Sauvegarde…", saved: "Sauvegardé.", primaryLanguage: { title: "Langue principale", help: "Les pages dans cette langue se trouvent à la racine du site (sans préfixe). Les autres langues sont sous /<lang>/.", siteHint: "La langue du site est actuellement « {{lang}} »." }, enabledLanguages: { title: "Langues supplémentaires", help: "Cliquez une langue pour l'activer. Les langues activées apparaissent dans l'onglet Traductions de l'éditeur et sur le site public sous /<lang>/." }, homePages: { title: "Page d'accueil par langue", help: "Optionnel : choisissez une page statique (dans la langue correspondante) pour servir d'accueil à /<lang>/. Sinon, une liste des derniers articles est rendue.", none: "— Derniers articles —" }, switcher: { title: "Sélecteur de langue", help: "Affiche un sélecteur de langue sur le site public. Les thèmes doivent intégrer un conteneur [data-cms-langswitch] dans leur Header / Footer pour que le sélecteur apparaisse (les thèmes intégrés le font déjà).", header: "Afficher le sélecteur dans l'en-tête du site", footer: "Afficher le sélecteur dans le pied de page du site" } }, Fe = { label: "Traductions", noLanguages: "Aucune langue supplémentaire n'est configurée.", configureLanguages: "Configurer les langues", editPrimaryInMain: "Modifiez la langue principale dans l'éditeur (titre, slug, contenu ci-dessus).", save: "Sauvegarder les traductions", saving: "Sauvegarde…", saved: "Traductions sauvegardées.", duplicate: "Dupliquer depuis la langue principale", invalidSlug: "Slug invalide pour {{lang}}.", fields: { title: "Titre", slug: "Slug", slugHelp: "Caractères ASCII minuscules + tirets uniquement.", excerpt: "Extrait", content: "Contenu (Markdown)", contentHelp: "Markdown simple. Les blocs de thème (Hero, embeds, etc.) intégrés dans la langue principale ne sont PAS répliqués automatiquement — collez votre contenu traduit ici.", seo: "SEO", seoTitle: "Titre SEO", seoDescription: "Méta description" } }, _e = { title: "Traductions", name: "Nom", slug: "Slug", invalidSlug: "Slug invalide", seoTitle: "Titre meta SEO", seoDescription: "Description meta SEO", noLanguages: "Activez des langues secondaires dans les réglages du plugin Multilingue pour traduire ce terme." }, ze = {
  settings: He,
  tab: Fe,
  termSection: _e
}, H = {
  primaryLanguage: "en",
  enabledLanguages: [],
  homePages: {},
  menuTranslations: {},
  showHeaderSwitcher: !0,
  showFooterSwitcher: !1
}, Oe = "agentcms-multilang";
function b(n) {
  var t;
  const e = (t = n.pluginConfigs) == null ? void 0 : t[Oe];
  return {
    ...H,
    // Default the primary language to the site's BCP-47 language tag
    // so a fresh install picks the right value without manual setup.
    primaryLanguage: (e == null ? void 0 : e.primaryLanguage) || (n.language || "en").split("-")[0],
    enabledLanguages: (e == null ? void 0 : e.enabledLanguages) ?? [],
    homePages: (e == null ? void 0 : e.homePages) ?? {},
    menuTranslations: (e == null ? void 0 : e.menuTranslations) ?? {},
    showHeaderSwitcher: (e == null ? void 0 : e.showHeaderSwitcher) ?? H.showHeaderSwitcher,
    showFooterSwitcher: (e == null ? void 0 : e.showFooterSwitcher) ?? H.showFooterSwitcher
  };
}
function y(n, e) {
  return n.primaryLanguage === e;
}
function F(n) {
  const { post: e, trans: t, primaryTermTrans: a, primaryTermSlug: s, language: r, config: o } = n, i = y(o, r) ? "" : `${r}/`;
  if (e.type === "page")
    return `${i}${t.slug}.html`;
  const l = (a == null ? void 0 : a.slug) ?? s;
  return l ? `${i}${l}/${t.slug}.html` : `${i}${t.slug}.html`;
}
function V(n, e, t, a) {
  if (n.type !== "category")
    throw new Error(`buildLocalizedTermUrl: term type "${n.type}" is not supported (categories only).`);
  return `${y(a, t) ? "" : `${t}/`}${e.slug}/index.html`;
}
function _(n, e) {
  return y(e, n) ? "index.html" : `${n}/index.html`;
}
function Re(n, e, t) {
  var a;
  if (!y(e, t)) {
    const s = (a = e.homePages) == null ? void 0 : a[t];
    if (s) return s;
  }
  if (n.homeMode === "static-page" && n.homePageId) return n.homePageId;
}
function W(n, e, t, a) {
  if (!e || n.type !== "page") return !1;
  const s = Re(e, t, a);
  return !!s && s === n.id;
}
function ge(n) {
  return W(n.post, n.settings, n.config, n.language) ? _(n.language, n.config) : F(n);
}
function $(n, e) {
  const t = n.translations, a = t == null ? void 0 : t[e];
  return !a || !a.slug || !a.title ? null : a;
}
function k(n, e) {
  const t = n.translations, a = t == null ? void 0 : t[e];
  return !a || !a.slug || !a.name ? null : a;
}
function O(n) {
  return {
    slug: n.slug,
    title: n.title,
    contentMarkdown: n.contentMarkdown,
    excerpt: n.excerpt,
    seo: n.seo
  };
}
function R(n) {
  return {
    slug: n.slug,
    name: n.name,
    description: n.description,
    seo: n.seo
  };
}
function ee(n) {
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
function M(n) {
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
function q(n, e, t) {
  const a = e.replace(/\/+$/, "");
  if (!a) return "";
  const s = [];
  for (const o of n.alternates) {
    const i = z(a, o.path);
    s.push(
      `<link rel="alternate" hreflang="${M(o.language)}" href="${M(i)}" />`
    );
  }
  const r = n.alternates.find((o) => o.language === t.primaryLanguage);
  if (r) {
    const o = z(a, r.path);
    s.push(`<link rel="alternate" hreflang="x-default" href="${M(o)}" />`);
  }
  s.push(
    `<meta property="og:locale" content="${M(ee(n.current.language))}" />`
  );
  for (const o of n.alternates)
    o.language !== n.current.language && s.push(
      `<meta property="og:locale:alternate" content="${M(ee(o.language))}" />`
    );
  return s.join(`
`);
}
function de(n, e, t) {
  const a = e.replace(/\/+$/, "");
  if (!a || n.alternates.length === 0) return "";
  const s = [];
  for (const o of n.alternates) {
    const i = z(a, o.path);
    s.push(
      `    <xhtml:link rel="alternate" hreflang="${M(o.language)}" href="${M(i)}"/>`
    );
  }
  const r = n.alternates.find((o) => o.language === t.primaryLanguage);
  if (r) {
    const o = z(a, r.path);
    s.push(
      `    <xhtml:link rel="alternate" hreflang="x-default" href="${M(o)}"/>`
    );
  }
  return s.join(`
`);
}
function j(n, e, t, a) {
  const s = [];
  for (const r of [t.primaryLanguage, ...t.enabledLanguages]) {
    if (s.some((c) => c.language === r)) continue;
    const o = r === t.primaryLanguage ? O(n) : $(n, r);
    if (!o) continue;
    const i = n.primaryTermId ? e.find((c) => c.id === n.primaryTermId) : void 0, l = i ? r === t.primaryLanguage ? R(i) : k(i, r) ?? void 0 : void 0;
    if (i && !l && !y(t, r)) continue;
    const u = ge({
      post: n,
      trans: o,
      primaryTermTrans: l,
      primaryTermSlug: i == null ? void 0 : i.slug,
      language: r,
      config: t,
      settings: a
    });
    s.push({ language: r, path: u });
  }
  return s;
}
function pe(n, e) {
  const t = [];
  for (const a of [e.primaryLanguage, ...e.enabledLanguages]) {
    if (t.some((r) => r.language === a)) continue;
    const s = a === e.primaryLanguage ? R(n) : k(n, a);
    s && n.type === "category" && t.push({ language: a, path: V(n, s, a, e) });
  }
  return t;
}
function he(n) {
  const e = [];
  for (const t of [n.primaryLanguage, ...n.enabledLanguages])
    e.some((a) => a.language === t) || e.push({ language: t, path: _(t, n) });
  return e;
}
function K(n) {
  return (n.baseUrl || "").replace(/\/+$/, "");
}
const U = /* @__PURE__ */ new Map();
function N(n, e, t, a, s) {
  U.clear();
  const r = K(a);
  if (!r) return;
  for (const i of [...n, ...e]) {
    if (i.status !== "online") continue;
    const l = j(i, t, s, a);
    if (l.length !== 0)
      for (const u of l) {
        const c = q(
          { current: { path: u.path, language: u.language }, alternates: l },
          r,
          s
        );
        U.set(u.path, c);
      }
  }
  for (const i of t) {
    if (i.type !== "category") continue;
    const l = pe(i, s);
    if (l.length !== 0)
      for (const u of l) {
        const c = q(
          { current: { path: u.path, language: u.language }, alternates: l },
          r,
          s
        );
        U.set(u.path, c);
      }
  }
  const o = he(s);
  for (const i of o) {
    const l = q(
      { current: { path: i.path, language: i.language }, alternates: o },
      r,
      s
    );
    U.set(i.path, l);
  }
}
function je(n) {
  const e = n.replace(/^\/+/, "");
  return U.get(e) ?? U.get(`/${e}`) ?? "";
}
const D = /* @__PURE__ */ new Map();
function A(n, e, t, a, s) {
  D.clear();
  for (const o of [...n, ...e]) {
    if (o.status !== "online") continue;
    const i = j(o, t, a, s);
    if (i.length !== 0)
      for (const l of i)
        D.set(l.path, { language: l.language, alternates: i });
  }
  for (const o of t) {
    if (o.type !== "category") continue;
    const i = pe(o, a);
    if (i.length !== 0)
      for (const l of i)
        D.set(l.path, { language: l.language, alternates: i });
  }
  const r = he(a);
  for (const o of r)
    D.set(o.path, { language: o.language, alternates: r });
}
function qe(n) {
  const e = n.replace(/^\/+/, "");
  return D.get(e) ?? D.get(`/${e}`) ?? null;
}
function me(n) {
  var a;
  const e = J(n.settings.activeThemeId);
  if (!e.settings) return;
  const t = (a = n.settings.themeConfigs) == null ? void 0 : a[e.id];
  return {
    ...e.settings.defaultConfig,
    ...t ?? {}
  };
}
function Be(n, e, t) {
  const a = y(t, e), s = a ? "" : `${e}/`, r = { ...n.settings, language: e }, o = n.terms.map((c) => {
    if (c.type !== "category") return c;
    const d = a ? R(c) : k(c, e);
    return d ? {
      ...c,
      name: d.name,
      // Prefix with language code so buildPostUrl produces
      // <lang>/<term-slug>/<post-slug>.html for posts and
      // <lang>/<term-slug>/index.html for the archive itself.
      slug: `${s}${d.slug}`,
      description: d.description
    } : c;
  }), i = (c) => {
    const d = a ? O(c) : $(c, e);
    if (!d) return null;
    const p = c.type !== "post" || !c.primaryTermId;
    return {
      ...c,
      title: d.title,
      slug: p ? `${s}${d.slug}` : d.slug,
      contentMarkdown: d.contentMarkdown,
      excerpt: d.excerpt,
      seo: d.seo
    };
  }, l = n.posts.map(i).filter((c) => c !== null), u = n.pages.map(i).filter((c) => c !== null);
  return {
    ...n,
    settings: r,
    posts: l,
    pages: u,
    terms: o
  };
}
async function Je(n) {
  var i;
  const { language: e, ctx: t, config: a } = n, s = (i = a.homePages) == null ? void 0 : i[e], r = s ? { ...t.settings, homeMode: "static-page", homePageId: s } : t.settings, o = Be({ ...t, settings: r }, e, a);
  return Me(o, {
    homePath: _(e, a),
    currentLocale: e
  });
}
async function Ge(n) {
  var P, T, I, C, X;
  const { post: e, trans: t, termTrans: a, language: s, ctx: r, config: o } = n, i = J(r.settings.activeThemeId), l = {
    settings: { ...r.settings, language: s },
    resolvedMenus: { header: [], footer: [] },
    themeCssPath: `theme-assets/${r.settings.activeThemeId}.css`,
    themeConfig: me(r),
    homePath: y(o, s) ? "/index.html" : `/${s}/index.html`
  }, u = { ...r, settings: { ...r.settings, language: s } };
  let c = ke(t.contentMarkdown);
  c = await Ce("post.html.body", c, e, u);
  const d = r.terms.filter((E) => e.termIds.includes(E.id) && E.type === "tag"), p = e.primaryTermId ? r.terms.find((E) => E.id === e.primaryTermId && E.type === "category") : void 0, g = r.authorLookup(e.authorId), h = e.heroMediaId ? r.media.get(e.heroMediaId) : void 0, f = ((P = t.seo) == null ? void 0 : P.description) ?? re(t.contentMarkdown, 160);
  let S = p;
  if (p && a) {
    const Pe = y(o, s) ? "" : `${s}/`;
    S = {
      ...p,
      name: a.name,
      slug: `${Pe}${a.slug}`,
      description: a.description
    };
  }
  const v = F({
    post: e,
    trans: t,
    primaryTermTrans: a,
    primaryTermSlug: p == null ? void 0 : p.slug,
    language: s,
    config: o
  }), w = {
    site: l,
    post: {
      ...e,
      title: t.title,
      slug: t.slug,
      contentMarkdown: t.contentMarkdown,
      excerpt: t.excerpt,
      seo: t.seo
    },
    bodyHtml: c,
    author: g,
    hero: h ? {
      alt: h.alt,
      caption: h.caption,
      default: ((I = (T = h.formats) == null ? void 0 : T[h.defaultFormat ?? ""]) == null ? void 0 : I.url) ?? h.url ?? "",
      formats: h.formats ?? {}
    } : void 0,
    primaryTerm: S,
    tags: d
  }, x = {
    site: l,
    pageTitle: ((C = t.seo) == null ? void 0 : C.title) ?? t.title,
    pageDescription: f || void 0,
    ogImage: (X = t.seo) == null ? void 0 : X.ogImage,
    currentPath: v,
    currentLocale: s
  };
  return ie({
    base: i.templates.base,
    baseProps: x,
    template: i.templates.single,
    templateProps: w
  });
}
function Ve(n) {
  var f, S, v;
  const { term: e, termTrans: t, language: a, ctx: s, config: r } = n, o = J(s.settings.activeThemeId), i = {
    settings: { ...s.settings, language: a },
    resolvedMenus: { header: [], footer: [] },
    themeCssPath: `theme-assets/${s.settings.activeThemeId}.css`,
    themeConfig: me(s),
    homePath: y(r, a) ? "/index.html" : `/${a}/index.html`
  }, l = {
    ...e,
    name: t.name,
    slug: t.slug,
    description: t.description
  }, u = y(r, a), c = u ? "" : `${a}/`, d = s.posts.filter((w) => w.status === "online" && w.primaryTermId === e.id).filter((w) => u ? !0 : $(w, a) !== null).map((w) => {
    var I, C;
    const x = u ? O(w) : $(w, a), P = F({
      post: w,
      trans: x,
      primaryTermTrans: t,
      primaryTermSlug: e.slug,
      language: a,
      config: r
    }), T = w.heroMediaId ? s.media.get(w.heroMediaId) : void 0;
    return {
      ...w,
      title: x.title,
      slug: x.slug,
      excerpt: x.excerpt,
      url: P,
      hero: T ? {
        alt: T.alt,
        caption: T.caption,
        default: ((C = (I = T.formats) == null ? void 0 : I[T.defaultFormat ?? ""]) == null ? void 0 : C.url) ?? T.url ?? "",
        formats: T.formats ?? {}
      } : void 0,
      category: {
        name: t.name,
        url: `/${c}${t.slug}/index.html`
      }
    };
  }), p = {
    site: i,
    term: l,
    posts: d,
    categoryRssUrl: void 0,
    archivesLink: void 0,
    allCategories: [],
    popularTags: []
  }, g = V(e, t, a, r), h = {
    site: i,
    pageTitle: ((f = t.seo) == null ? void 0 : f.title) || t.name,
    pageDescription: ((S = t.seo) == null ? void 0 : S.description) || t.description,
    ogImage: (v = t.seo) == null ? void 0 : v.ogImage,
    currentPath: g,
    currentLocale: a
  };
  return ie({
    base: o.templates.base,
    baseProps: h,
    template: o.templates.category,
    templateProps: p
  });
}
async function We(n, e, t) {
  const a = b(t.settings);
  if (a.enabledLanguages.length === 0) return n;
  N(t.posts, t.pages, t.terms, t.settings, a), A(t.posts, t.pages, t.terms, a, t.settings);
  const s = [...n], r = {}, o = e.primaryTermId ? t.terms.find((i) => i.id === e.primaryTermId && i.type === "category") : void 0;
  for (const i of a.enabledLanguages) {
    if (y(a, i) || W(e, t.settings, a, i)) continue;
    const l = $(e, i);
    if (!l) continue;
    const u = o ? k(o, i) : void 0;
    if (o && !u) continue;
    const c = F({
      post: e,
      trans: l,
      primaryTermTrans: u ?? void 0,
      primaryTermSlug: o == null ? void 0 : o.slug,
      language: i,
      config: a
    }), d = await Ge({
      post: e,
      trans: l,
      termTrans: u ?? void 0,
      language: i,
      ctx: t,
      config: a
    });
    s.push({ path: c, html: d }), r[i] = c;
  }
  try {
    await oe(e.id, { lastPublishedPathsByLocale: r });
  } catch {
  }
  return s;
}
async function Ke(n, e) {
  const t = b(e.settings);
  if (t.enabledLanguages.length === 0) return n;
  N(e.posts, e.pages, e.terms, e.settings, t), A(e.posts, e.pages, e.terms, t, e.settings);
  const a = [...n];
  for (const s of t.enabledLanguages) {
    if (y(t, s)) continue;
    const r = _(s, t), o = await Je({ language: s, ctx: e, config: t });
    a.push({ path: r, html: o });
    for (const i of e.terms) {
      if (i.type !== "category") continue;
      const l = k(i, s);
      if (!l) continue;
      const u = V(i, l, s, t), c = Ve({ term: i, termTrans: l, language: s, ctx: e, config: t });
      a.push({ path: u, html: c });
    }
  }
  return a;
}
function Xe(n) {
  return { ...n, "xmlns:xhtml": "http://www.w3.org/1999/xhtml" };
}
function Qe(n, e) {
  if (!e.entity) return n;
  const t = e.settings ? b(e.settings) : tt(), a = e.terms ?? nt();
  if (!t || !a || t.enabledLanguages.length === 0) return n;
  const s = j(e.entity, a, t, e.settings ?? be);
  if (s.length === 0) return n;
  const r = e.baseUrl.replace(/\/+$/, "");
  return n + de(
    { current: { path: e.path, language: t.primaryLanguage }, alternates: s },
    r,
    t
  ) + `
`;
}
function Ye(n, e) {
  var r, o, i, l, u, c;
  const t = b(e.settings);
  if (t.enabledLanguages.length === 0) return n;
  const a = K(e.settings);
  if (!a) return n;
  const s = [...n];
  for (const d of [...e.posts, ...e.pages]) {
    if (d.status !== "online") continue;
    const p = ((o = (r = d.createdAt) == null ? void 0 : r.toMillis) == null ? void 0 : o.call(r)) ?? ((l = (i = d.publishedAt) == null ? void 0 : i.toMillis) == null ? void 0 : l.call(i)) ?? Date.now();
    if (new Date(p).getUTCFullYear() !== e.year) continue;
    const g = j(d, e.terms, t, e.settings);
    if (g.length !== 0)
      for (const h of g)
        y(t, h.language) || s.push({
          path: h.path,
          lastmodMs: ((c = (u = d.updatedAt) == null ? void 0 : u.toMillis) == null ? void 0 : c.call(u)) ?? p,
          extraInnerXml: de(
            { current: { path: h.path, language: h.language }, alternates: g },
            a,
            t
          )
        });
  }
  return s;
}
function Ze(n, e) {
  var r;
  const t = (r = e.settings.pluginConfigs) == null ? void 0 : r["agentcms-sitemaps"];
  if (!(t != null && t.newsEnabled)) return n;
  const a = b(e.settings);
  if (a.enabledLanguages.length === 0) return n;
  const s = [...n];
  for (const o of a.enabledLanguages)
    y(a, o) || s.push({ path: `sitemaps/sitemap-news-${o}.xml` });
  return s;
}
function et(n, e) {
  var i, l, u, c, d, p, g, h;
  const t = b(e.settings);
  if (t.enabledLanguages.length === 0 || !K(e.settings)) return n;
  const s = e.config.newsWindowDays || 2, r = Date.now() - s * 24 * 60 * 60 * 1e3, o = [...n];
  for (const f of t.enabledLanguages) {
    if (y(t, f)) continue;
    const S = [];
    for (const v of [...e.posts, ...e.pages]) {
      if (v.status !== "online") continue;
      const w = ((l = (i = v.updatedAt) == null ? void 0 : i.toMillis) == null ? void 0 : l.call(i)) ?? ((c = (u = v.publishedAt) == null ? void 0 : u.toMillis) == null ? void 0 : c.call(u)) ?? ((p = (d = v.createdAt) == null ? void 0 : d.toMillis) == null ? void 0 : p.call(d)) ?? Date.now();
      if (w < r) continue;
      const x = $(v, f);
      if (!x) continue;
      const P = v.primaryTermId ? e.terms.find((C) => C.id === v.primaryTermId && C.type === "category") : void 0, T = P ? k(P, f) ?? void 0 : void 0, I = ge({
        post: v,
        trans: x,
        primaryTermTrans: T,
        primaryTermSlug: P == null ? void 0 : P.slug,
        language: f,
        config: t,
        settings: e.settings
      });
      S.push({
        path: I,
        title: x.title,
        createdAtMs: ((h = (g = v.createdAt) == null ? void 0 : g.toMillis) == null ? void 0 : h.call(g)) ?? w,
        updatedAtMs: w
      });
    }
    o.push({
      language: f,
      path: `sitemaps/sitemap-news-${f}.xml`,
      entities: S
    });
  }
  return o;
}
let fe = null, ye = null, be = null;
function we(n) {
  fe = n;
}
function ve(n) {
  ye = n;
}
function Le(n) {
  be = n;
}
function tt() {
  return fe;
}
function nt() {
  return ye;
}
const at = 20;
function st(n) {
  return `${n}/rss.xml`;
}
function rt(n) {
  return `${n}/feed.xml`;
}
function it(n, e) {
  return `${n}/${e}/${e}.xml`;
}
function ot(n) {
  const e = b(n.settings);
  if (e.enabledLanguages.length === 0) return [];
  const t = [];
  for (const a of e.enabledLanguages) {
    if (y(e, a)) continue;
    const s = lt(n.posts, n.terms, a, e, n.baseUrl);
    t.push({
      language: a,
      path: st(a),
      channelTitle: `${n.settings.title || "Site"} — ${a.toUpperCase()}`,
      channelLink: G(n.baseUrl, _(a, e)),
      channelDescription: n.settings.description || n.settings.title || "",
      items: s
    });
  }
  return t;
}
async function Se(n) {
  const e = b(n.settings);
  for (const t of e.enabledLanguages)
    if (!y(e, t)) {
      try {
        await Q(rt(t));
      } catch {
      }
      for (const a of n.terms) {
        if (a.type !== "category") continue;
        const s = k(a, t);
        if (s)
          try {
            await Q(it(t, s.slug));
          } catch {
          }
      }
    }
}
function lt(n, e, t, a, s) {
  return n.filter((r) => r.status === "online").map((r) => ct(r, e, t, a, s)).filter((r) => r !== null).sort((r, o) => o.pubDateMs - r.pubDateMs).slice(0, at);
}
function ct(n, e, t, a, s) {
  var p, g, h, f, S, v;
  const r = $(n, t);
  if (!r) return null;
  const o = n.primaryTermId ? e.find((w) => w.id === n.primaryTermId && w.type === "category") : void 0, i = o ? k(o, t) : void 0;
  if (o && !i) return null;
  const l = F({
    post: n,
    trans: r,
    primaryTermTrans: i ?? void 0,
    primaryTermSlug: o == null ? void 0 : o.slug,
    language: t,
    config: a
  }), u = G(s, l), c = (r.excerpt && r.excerpt.trim().length > 0 ? r.excerpt : re(r.contentMarkdown, 300)).trim(), d = ((g = (p = n.publishedAt) == null ? void 0 : p.toMillis) == null ? void 0 : g.call(p)) ?? ((f = (h = n.updatedAt) == null ? void 0 : h.toMillis) == null ? void 0 : f.call(h)) ?? ((v = (S = n.createdAt) == null ? void 0 : S.toMillis) == null ? void 0 : v.call(S)) ?? Date.now();
  return {
    title: r.title,
    link: u,
    guid: u,
    description: c,
    pubDateMs: d,
    category: i == null ? void 0 : i.name
  };
}
function ut(n, e, t) {
  const a = y(t, e), s = a ? "" : `${e}/`, r = n.terms.map((i) => {
    if (i.type !== "category") return i;
    const l = a ? R(i) : k(i, e);
    return l ? {
      ...i,
      name: l.name,
      slug: `${s}${l.slug}`,
      description: l.description
    } : i;
  }), o = (i) => {
    const l = a ? O(i) : $(i, e);
    if (!l) return null;
    const u = i.type !== "post" || !i.primaryTermId, c = W(i, n.settings, t, e) ? `${s}index` : u ? `${s}${l.slug}` : l.slug;
    return {
      ...i,
      title: l.title,
      slug: c,
      contentMarkdown: l.contentMarkdown,
      excerpt: l.excerpt,
      seo: l.seo
    };
  };
  return {
    posts: n.posts.map(o).filter((i) => i !== null),
    pages: n.pages.map(o).filter((i) => i !== null),
    terms: r
  };
}
async function Te(n) {
  const e = b(n.settings);
  if (e.enabledLanguages.length !== 0)
    for (const t of e.enabledLanguages) {
      if (y(e, t)) continue;
      const a = ut(n, t, e), s = { ...n.settings, language: t, homePageId: void 0 }, r = `${t}/data/posts.json`, o = `${t}/data/authors.json`;
      try {
        await $e(
          s,
          a.posts,
          a.pages,
          a.terms,
          n.media,
          r
        );
      } catch {
      }
      try {
        await Ie(
          n.users,
          n.media,
          a.posts,
          a.pages,
          o
        );
      } catch {
      }
    }
}
const te = ["en", "fr", "de", "es", "nl", "pt", "ko"];
function gt({ config: n, save: e }) {
  const { t } = ue("agentcms-multilang"), { settings: a, pages: s } = le(), [r, o] = Z({
    ...H,
    ...n
  }), [i, l] = Z(!1);
  async function u() {
    l(!0);
    try {
      await e(r), B.success(t("settings.saved"));
    } catch (g) {
      B.error(g.message || "Save failed");
    } finally {
      l(!1);
    }
  }
  function c(g) {
    o((h) => {
      const S = h.enabledLanguages.includes(g) ? h.enabledLanguages.filter((v) => v !== g) : [...h.enabledLanguages, g];
      return { ...h, enabledLanguages: S };
    });
  }
  function d(g, h) {
    o((f) => ({
      ...f,
      homePages: { ...f.homePages ?? {}, [g]: h || "" }
    }));
  }
  const p = (a.language || "en").split("-")[0];
  return /* @__PURE__ */ L("div", { className: "space-y-6", children: [
    /* @__PURE__ */ L("div", { children: [
      /* @__PURE__ */ m("h2", { className: "font-semibold text-lg", children: t("settings.title") }),
      /* @__PURE__ */ m("p", { className: "text-sm text-surface-500 dark:text-surface-400", children: t("settings.intro") })
    ] }),
    /* @__PURE__ */ L("section", { className: "card p-4 space-y-3", children: [
      /* @__PURE__ */ m("h3", { className: "font-medium", children: t("settings.primaryLanguage.title") }),
      /* @__PURE__ */ m("p", { className: "text-xs text-surface-500 dark:text-surface-400", children: t("settings.primaryLanguage.help") }),
      /* @__PURE__ */ L("div", { className: "flex flex-wrap gap-2", children: [
        /* @__PURE__ */ m(
          "select",
          {
            className: "input max-w-[200px]",
            value: r.primaryLanguage,
            onChange: (g) => o({ ...r, primaryLanguage: g.target.value }),
            children: te.map((g) => /* @__PURE__ */ m("option", { value: g, children: g.toUpperCase() }, g))
          }
        ),
        /* @__PURE__ */ m("span", { className: "text-[11px] text-surface-500 self-center", children: t("settings.primaryLanguage.siteHint", { lang: p }) })
      ] })
    ] }),
    /* @__PURE__ */ L("section", { className: "card p-4 space-y-3", children: [
      /* @__PURE__ */ m("h3", { className: "font-medium", children: t("settings.enabledLanguages.title") }),
      /* @__PURE__ */ m("p", { className: "text-xs text-surface-500 dark:text-surface-400", children: t("settings.enabledLanguages.help") }),
      /* @__PURE__ */ m("div", { className: "flex flex-wrap gap-2", children: te.filter((g) => g !== r.primaryLanguage).map((g) => {
        const h = r.enabledLanguages.includes(g);
        return /* @__PURE__ */ m(
          "button",
          {
            type: "button",
            onClick: () => c(g),
            className: "text-xs px-3 py-1.5 rounded uppercase font-medium " + (h ? "bg-surface-900 text-surface-50 dark:bg-surface-100 dark:text-surface-900" : "bg-surface-100 text-surface-700 dark:bg-surface-800 dark:text-surface-300"),
            children: g
          },
          g
        );
      }) })
    ] }),
    r.enabledLanguages.length > 0 && /* @__PURE__ */ L("section", { className: "card p-4 space-y-3", children: [
      /* @__PURE__ */ m("h3", { className: "font-medium", children: t("settings.homePages.title") }),
      /* @__PURE__ */ m("p", { className: "text-xs text-surface-500 dark:text-surface-400", children: t("settings.homePages.help") }),
      /* @__PURE__ */ m("div", { className: "space-y-2", children: r.enabledLanguages.map((g) => {
        var h;
        return /* @__PURE__ */ L("div", { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ m("span", { className: "text-[10px] uppercase font-semibold w-8", children: g }),
          /* @__PURE__ */ L(
            "select",
            {
              className: "input flex-1",
              value: ((h = r.homePages) == null ? void 0 : h[g]) ?? "",
              onChange: (f) => d(g, f.target.value),
              children: [
                /* @__PURE__ */ m("option", { value: "", children: t("settings.homePages.none") }),
                s.filter((f) => f.status === "online").map((f) => /* @__PURE__ */ m("option", { value: f.id, children: f.title }, f.id))
              ]
            }
          )
        ] }, g);
      }) })
    ] }),
    r.enabledLanguages.length > 0 && /* @__PURE__ */ L("section", { className: "card p-4 space-y-3", children: [
      /* @__PURE__ */ m("h3", { className: "font-medium", children: t("settings.switcher.title") }),
      /* @__PURE__ */ m("p", { className: "text-xs text-surface-500 dark:text-surface-400", children: t("settings.switcher.help") }),
      /* @__PURE__ */ L("label", { className: "flex items-center gap-2 text-sm", children: [
        /* @__PURE__ */ m(
          "input",
          {
            type: "checkbox",
            checked: r.showHeaderSwitcher ?? !0,
            onChange: (g) => o({ ...r, showHeaderSwitcher: g.target.checked })
          }
        ),
        /* @__PURE__ */ m("span", { children: t("settings.switcher.header") })
      ] }),
      /* @__PURE__ */ L("label", { className: "flex items-center gap-2 text-sm", children: [
        /* @__PURE__ */ m(
          "input",
          {
            type: "checkbox",
            checked: r.showFooterSwitcher ?? !1,
            onChange: (g) => o({ ...r, showFooterSwitcher: g.target.checked })
          }
        ),
        /* @__PURE__ */ m("span", { children: t("settings.switcher.footer") })
      ] })
    ] }),
    /* @__PURE__ */ m("div", { className: "flex gap-2", children: /* @__PURE__ */ m(
      "button",
      {
        type: "button",
        className: "btn-primary",
        onClick: u,
        disabled: i,
        children: t(i ? "settings.saving" : "settings.save")
      }
    ) })
  ] });
}
function dt({ term: n, updateTerm: e }) {
  const { t } = ue("agentcms-multilang"), { settings: a } = le(), s = b(a);
  if (s.enabledLanguages.length === 0)
    return /* @__PURE__ */ m("p", { className: "text-xs text-surface-500 dark:text-surface-400", children: t("termSection.noLanguages") });
  const r = n.translations ?? {};
  function o(i, l) {
    const u = {
      ...r,
      [i]: { ...r[i] ?? ne(), ...l }
    };
    e({ translations: u });
  }
  return /* @__PURE__ */ L("div", { className: "space-y-2", children: [
    /* @__PURE__ */ m("p", { className: "text-[11px] uppercase tracking-wide font-semibold text-surface-500 dark:text-surface-400", children: t("termSection.title") }),
    s.enabledLanguages.map((i) => {
      const l = r[i] ?? ne(), u = l.slug && !ce(l.slug), c = l.seo ?? {};
      function d(p) {
        o(i, { seo: { ...c, ...p } });
      }
      return /* @__PURE__ */ L("div", { className: "space-y-2 border-t border-surface-200 dark:border-surface-700 pt-2 first:border-t-0 first:pt-0", children: [
        /* @__PURE__ */ L("div", { className: "flex flex-wrap items-start gap-2", children: [
          /* @__PURE__ */ m("span", { className: "text-[10px] uppercase font-semibold w-8 pt-2 text-surface-500", children: i }),
          /* @__PURE__ */ m(
            "input",
            {
              type: "text",
              className: "input flex-1 min-w-[120px]",
              placeholder: t("termSection.name"),
              value: l.name,
              onChange: (p) => o(i, { name: p.target.value })
            }
          ),
          /* @__PURE__ */ L("div", { className: "flex-1 min-w-[120px]", children: [
            /* @__PURE__ */ m(
              "input",
              {
                type: "text",
                className: "input",
                placeholder: t("termSection.slug"),
                value: l.slug,
                onChange: (p) => o(i, { slug: p.target.value })
              }
            ),
            u && /* @__PURE__ */ m("p", { className: "text-[10px] text-red-600 mt-0.5", children: t("termSection.invalidSlug") })
          ] })
        ] }),
        /* @__PURE__ */ L("div", { className: "pl-10 space-y-1", children: [
          /* @__PURE__ */ m(
            "input",
            {
              type: "text",
              className: "input w-full",
              placeholder: t("termSection.seoTitle"),
              value: c.title ?? "",
              onChange: (p) => d({ title: p.target.value })
            }
          ),
          /* @__PURE__ */ m(
            "textarea",
            {
              className: "input w-full min-h-[60px] resize-y",
              placeholder: t("termSection.seoDescription"),
              value: c.description ?? "",
              onChange: (p) => d({ description: p.target.value })
            }
          )
        ] })
      ] }, i);
    })
  ] });
}
function ne() {
  return { slug: "", name: "", description: "" };
}
function xe(n, e, t) {
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
function ae(n, e, t) {
  if (t) return "★";
  const a = xe(n, e, !1);
  return a && a.slug && a.title ? "" : "○";
}
const pt = {
  id: "agentcms-multilang/languages",
  priority: 50,
  listVariants(n, e) {
    const t = b(e.settings);
    if (t.enabledLanguages.length === 0) return [];
    const a = [], s = /* @__PURE__ */ new Set();
    a.push({
      id: t.primaryLanguage,
      label: t.primaryLanguage.toUpperCase(),
      badge: ae(n, t.primaryLanguage, !0),
      primary: !0
    }), s.add(t.primaryLanguage);
    for (const r of t.enabledLanguages)
      s.has(r) || (s.add(r), a.push({
        id: r,
        label: r.toUpperCase(),
        badge: ae(n, r, !1),
        primary: !1
      }));
    return a;
  },
  loadFields(n, e, t) {
    const a = b(t.settings), s = y(a, e);
    return xe(n, e, s);
  },
  validate(n, e, t, a) {
    const s = b(a.settings);
    return y(s, e) ? null : t.title.trim() ? ce(t.slug) ? null : `Invalid slug for ${e.toUpperCase()}.` : `Title required for ${e.toUpperCase()}.`;
  },
  async saveFields(n, e, t, a) {
    const s = b(a.settings);
    if (y(s, e))
      return;
    const r = n.translations ?? {}, o = {
      title: t.title,
      slug: t.slug,
      contentMarkdown: t.contentMarkdown
    };
    if (t.excerpt && (o.excerpt = t.excerpt), t.seo) {
      const l = {};
      t.seo.title && (l.title = t.seo.title), t.seo.description && (l.description = t.seo.description), t.seo.ogImage && (l.ogImage = t.seo.ogImage), Object.keys(l).length > 0 && (o.seo = l);
    }
    const i = { ...r, [e]: o };
    try {
      await oe(n.id, { translations: i });
    } catch (l) {
      throw B.error(l.message), l;
    }
  },
  getSlugPathPrefix(n, e, t, a) {
    var c;
    const s = b(a.settings), r = y(s, e) ? "" : `${e}/`;
    if (n.type !== "post" || !n.primaryTermId) return r;
    const o = a.terms.find((d) => d.id === n.primaryTermId);
    if (!o) return r;
    const i = o.translations, u = !y(s, e) && ((c = i == null ? void 0 : i[e]) == null ? void 0 : c.slug) || o.slug;
    return `${r}${u}/`;
  }
}, ht = `
.cms-langswitch{display:inline-flex;align-items:center;gap:6px;font-size:12px;line-height:1;letter-spacing:0.05em;}
.cms-langswitch a,.cms-langswitch span{padding:4px 8px;border-radius:4px;text-decoration:none;color:inherit;text-transform:uppercase;font-weight:600;}
.cms-langswitch a{opacity:0.55;}
.cms-langswitch a:hover{opacity:1;}
.cms-langswitch__current{background:currentColor;color:transparent;position:relative;}
.cms-langswitch__current::after{content:attr(data-label);position:absolute;inset:0;display:flex;align-items:center;justify-content:center;color:var(--cms-langswitch-on,white);mix-blend-mode:difference;}
`.replace(/\s+/g, " ").trim();
function mt(n) {
  return n.replace(/[<>&\u2028\u2029]/g, (e) => e === "<" ? "\\u003c" : e === ">" ? "\\u003e" : e === "&" ? "\\u0026" : e === "\u2028" ? "\\u2028" : "\\u2029");
}
function ft(n) {
  const { config: e, settings: t, currentPath: a } = n;
  if (e.enabledLanguages.length === 0 || !e.showHeaderSwitcher && !e.showFooterSwitcher) return "";
  const s = qe(a);
  if (!s || s.alternates.length < 2) return "";
  const r = (t.baseUrl || "").replace(/\/+$/, ""), o = s.alternates.map((p) => ({
    lang: p.language,
    label: p.language.toUpperCase(),
    href: r ? G(r, p.path) : `/${p.path.replace(/^\/+/, "")}`
  })), i = s.language, l = e.primaryLanguage, u = {
    current: i,
    primary: l,
    items: o,
    showHeader: e.showHeaderSwitcher !== !1,
    showFooter: e.showFooterSwitcher === !0
  };
  return `<script>${`
(function(){
  try {
    var D = ${mt(JSON.stringify(u))};
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
      s.textContent = ${JSON.stringify(ht)};
      document.head.appendChild(s);
    }
    if (document.readyState !== 'loading') paint();
    else document.addEventListener('DOMContentLoaded', paint);
  } catch (e) {}
})();`}<\/script>`;
}
async function yt(n, e) {
  const t = b(e.settings);
  we(t), ve(e.terms), Le(e.settings), N(e.posts, e.pages, e.terms, e.settings, t), A(e.posts, e.pages, e.terms, t, e.settings), await Se(e), await Te(e);
}
async function se(n, e) {
  const t = b(e.settings);
  we(t), ve(e.terms), Le(e.settings), N(e.posts, e.pages, e.terms, e.settings, t), A(e.posts, e.pages, e.terms, t, e.settings), await Se(e), await Te(e);
}
async function bt() {
  try {
    const n = window, e = n == null ? void 0 : n.__AGENTCMS_LIVE_SETTINGS__;
    if (!e) return;
    const t = b(e);
    if (t.enabledLanguages.length === 0) return;
    const [a, s] = await Promise.all([
      Y({ type: "post" }),
      Y({ type: "page" })
    ]);
    N(a, s, [], e, t), A(a, s, [], t, e);
  } catch {
  }
}
const Tt = {
  id: "agentcms-multilang",
  name: "Multi-language",
  version: "1.6.4",
  description: "Multi-language site support — translated posts/pages/terms, hreflang SEO, per-language sitemap entries, per-language RSS feeds.",
  author: "AgentCMS",
  readme: Ne,
  i18n: { en: De, fr: ze },
  settings: {
    navLabelKey: "settings.title",
    defaultConfig: H,
    component: gt
  },
  register(n) {
    n.addFilter("publish.additional", async (e, t, a) => We(
      e,
      t,
      a
    )), n.addFilter("publish.extraListings", async (e, t) => Ke(
      e,
      t
    )), n.addAction("publish.before", async (e, t) => {
      const a = t, s = b(a.settings);
      N(a.posts, a.pages, a.terms, a.settings, s), A(a.posts, a.pages, a.terms, s, a.settings);
    }), n.addAction("regenerate.listings.before", async (e) => {
      const t = e, a = b(t.settings);
      N(t.posts, t.pages, t.terms, t.settings, a), A(t.posts, t.pages, t.terms, a, t.settings);
    }), n.addAction("publish.complete", async (e, t) => {
      await yt(e, t);
    }), n.addAction("post.unpublished", async (e, t) => {
      await se(e, t);
    }), n.addAction("post.deleted", async (e, t) => {
      await se(e, t);
    }), n.addFilter("page.head.extra", (e, ...t) => {
      const a = t[0];
      if (!(a != null && a.currentPath)) return e;
      const s = je(a.currentPath);
      return s ? e + (e ? `
` : "") + s : e;
    }), n.addFilter("page.body.end", (e, ...t) => {
      var o;
      const a = t[0];
      if (!(a != null && a.currentPath) || !((o = a == null ? void 0 : a.site) != null && o.settings)) return e;
      const s = b(a.site.settings), r = ft({
        config: s,
        settings: a.site.settings,
        currentPath: a.currentPath
      });
      return r ? e + (e ? `
` : "") + r : e;
    }), n.addFilter(
      "sitemap.urlset.namespaces",
      (e) => Xe(e)
    ), n.addFilter("sitemap.url.entry", (e, ...t) => {
      const a = t[0];
      return Qe(e, a);
    }), n.addFilter("sitemap.urls.extra", (e, ...t) => {
      const a = t[0];
      return Ye(
        e,
        a
      );
    }), n.addFilter("sitemap.index.extra", (e, ...t) => {
      const a = t[0];
      return Ze(
        e,
        a
      );
    }), n.addFilter("sitemap.news.locales", (e, ...t) => {
      const a = t[0];
      return et(
        e,
        a
      );
    }), n.addFilter("rss.site.locales", (e, ...t) => {
      const a = t[0];
      return a ? [
        ...e,
        ...ot(a)
      ] : e;
    }), n.registerEditorVariantProvider(pt), n.registerTermEditorSection({
      id: "agentcms-multilang/term-translations",
      termType: "all",
      priority: 50,
      component: dt
    }), bt();
  }
};
export {
  Tt as default
};
