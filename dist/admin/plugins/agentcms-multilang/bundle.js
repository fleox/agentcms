import { canonicalUrl as _, getActiveTheme as J, renderMarkdown as Se, applyFilters as Te, markdownToPlainText as se, renderPageToHtml as re, renderHome as xe, updatePost as ie, pathToPublicUrl as G, deleteFile as X, publishPostsJson as Pe, publishAuthorsJson as ke, useCmsData as oe, toast as B, isValidSlug as le, fetchAllPosts as Q } from "@agent-cms/runtime";
import { jsxs as L, jsx as m } from "react/jsx-runtime";
import { useState as Y } from "react";
import { useTranslation as ce } from "react-i18next";
const Ce = '# agentcms-multilang\n\nMulti-language support for AgentCMS — translated posts, pages, categories and tags, hreflang SEO, per-language sitemaps and RSS feeds, and a public language switcher.\n\n## What it does\n\n- **Language tabs in the editor**: an editor *variant provider* adds a tab strip above the post / page editor, one tab per language (★ = primary). Switching tab swaps the whole editor — title, slug, content (blocks included), excerpt and SEO — so every language gets the same authoring experience. Translation tabs appear once the post has been saved once.\n- **Term translations**: a collapsible section in each row of **Categories / Tags** holds the per-language `name`, `slug`, description and SEO.\n- **URL strategy**: the primary language lives at the site root (`site.com/news/hello.html`); every other enabled language lives under its own prefix (`site.com/fr/actualites/bonjour.html`), with its own home (`/fr/index.html`, optionally a static page per language) and category archives.\n- **SEO**: `<link rel="alternate" hreflang="…">` for every language plus `x-default`, `og:locale` and `og:locale:alternate` on every published page, and `<html lang>` per page (`BaseLayoutProps.currentLocale`). The canonical link stays the theme\'s job: the publisher hands the theme the localized `currentPath`, so a theme that emits `canonicalUrl(baseUrl, currentPath)` gets the right per-language canonical.\n- **Sitemaps** (with `agentcms-sitemaps` enabled): `<xhtml:link rel="alternate">` entries inside each `<url>`, the translated URLs in the yearly sitemaps, and — when News is enabled — one `sitemaps/sitemap-news-<lang>.xml` per secondary language, referenced from the index.\n- **RSS** (with `agentcms-rss` enabled and its site feed on): one `/<lang>/rss.xml` per secondary language, through the RSS plugin\'s `rss.site.locales` filter. Legacy `/<lang>/feed.xml` and per-category `/<lang>/<slug>/<slug>.xml` files from versions ≤ 1.6.1 are deleted on the next publish.\n- **Language switcher**: a small script injected through `page.body.end` fills `[data-cms-langswitch="header"]` and `[data-cms-langswitch="footer"]` containers with links to the current page\'s alternates (toggles in the plugin settings). The in-tree themes (default, magazine, corporate, storefront, portfolio) ship these containers; other themes just add an empty `<div data-cms-langswitch="header"></div>`.\n\n## Requirements\n\n- AgentCMS admin with runtime API **1.4.0** or newer (the plugin uses `registerEditorVariantProvider`, `publish.before(post, ctx)`, `regenerate.listings.before` and `sitemap.news.locales`).\n- The plugin ships pre-installed with AgentCMS (bundled default); this folder is its source.\n\n## Build and install (from source)\n\n1. `npm install --legacy-peer-deps`\n2. `npm run build` — type-checks, produces `dist/bundle.js` + `agentcms-multilang.zip`\n3. In the admin, **Plugins** → **Install plugin** → drop the ZIP (same id = in-place upgrade).\n4. Open **Settings → Multi-language** and pick the primary language + additional languages.\n\n## Workflow\n\n1. Write the post in the primary language with the standard editor and save it.\n2. Click a language tab above the editor and fill the title, slug, content, excerpt and SEO for that language. Save.\n3. Publish. The publisher renders the primary version and every translation in one pass (`publish.additional`), each at its own path; removed translations are deleted from the site.\n\n## Storage\n\n- Per-post translations live on `Post.translations[<lang>]` (`{ slug, title, contentMarkdown, excerpt, seo }`).\n- Per-term translations live on `Term.translations[<lang>]` (`{ slug, name, description, seo }`).\n- Published translation paths are tracked in `Post.lastPublishedPathsByLocale` (orphan cleanup).\n- Plugin config (languages, primary, per-language home page, menu label overrides, switcher toggles) lives in `settings.pluginConfigs["agentcms-multilang"]`.\n\nAll storage flows through the standard backend dispatcher — it works the same on every data backend (Firebase, SQLite file, Markdown in git, this browser).\n\n## Theme compatibility\n\nTranslated pages render through the **active theme exactly as the primary publisher does** — same templates, BaseLayout and CSS. Themes should:\n\n- use `currentLocale` for `<html lang>` and `site.homePath ?? "/index.html"` for home links;\n- render translated menu labels from `item.labels[<lang>]` in their menu loader (the bundled loaders do);\n- add `[data-cms-langswitch]` containers where the switcher should appear.\n\nBlock markers in translated content go through the same `post.html.body` filters as the primary render. Those filters receive a per-language publish context as an extra third argument (`ctx.settings.language` = the target language), because `getCurrentPublishContext()` is only set during the core\'s own renders.\n\n## Known limitations\n\n- Theme-specific rich homes (e.g. magazine\'s hero / sidebar widgets) are not replicated in secondary languages. Pick a **static page** as the home of each language for full control.\n- `post.markdown.before` and `post.template.props` filters don\'t run for translated renders.\n- Concurrent edits to one post\'s translations are last-write-wins (one document / row per post).\n', Me = { title: "Multi-language", intro: "Configure additional languages. Each enabled language gets its own URL prefix and per-post translations.", save: "Save settings", saving: "Saving…", saved: "Saved.", primaryLanguage: { title: "Primary language", help: "Pages in this language live at the root URL (no language prefix). All other languages render under /<lang>/.", siteHint: 'Site language is currently "{{lang}}".' }, enabledLanguages: { title: "Additional languages", help: "Click a language to toggle it. Enabled languages appear in the editor's Translations tab + on the public site under /<lang>/." }, homePages: { title: "Home page per language", help: "Optional: pick a static page (in the corresponding language) to render at /<lang>/. Leave empty for a basic latest-posts list.", none: "— Latest posts —" }, switcher: { title: "Language switcher", help: "Show a language switcher on the public site. Themes must include a [data-cms-langswitch] container in their Header / Footer for the switcher to appear (built-in themes already do).", header: "Show switcher in the site header", footer: "Show switcher in the site footer" } }, $e = { label: "Translations", noLanguages: "No additional languages are configured for this site.", configureLanguages: "Configure languages", editPrimaryInMain: "Edit the primary language in the main editor (title, slug, content above).", save: "Save translations", saving: "Saving…", saved: "Translations saved.", duplicate: "Duplicate from primary", invalidSlug: "Invalid slug for {{lang}}.", fields: { title: "Title", slug: "Slug", slugHelp: "Lower-case ASCII + dashes only.", excerpt: "Excerpt", content: "Content (Markdown)", contentHelp: "Plain Markdown. Theme blocks (Hero, embeds, etc.) embedded in the primary language do NOT replicate automatically — paste your translated body here.", seo: "SEO", seoTitle: "SEO title", seoDescription: "Meta description" } }, Ne = { title: "Translations", name: "Name", slug: "Slug", invalidSlug: "Invalid slug", seoTitle: "SEO meta title", seoDescription: "SEO meta description", noLanguages: "Enable secondary languages in the Multi-language plugin settings to translate this term." }, Ie = {
  settings: Me,
  tab: $e,
  termSection: Ne
}, Ae = { title: "Multilingue", intro: "Configurez les langues supplémentaires. Chaque langue activée obtient son préfixe d'URL et des traductions par contenu.", save: "Sauvegarder", saving: "Sauvegarde…", saved: "Sauvegardé.", primaryLanguage: { title: "Langue principale", help: "Les pages dans cette langue se trouvent à la racine du site (sans préfixe). Les autres langues sont sous /<lang>/.", siteHint: "La langue du site est actuellement « {{lang}} »." }, enabledLanguages: { title: "Langues supplémentaires", help: "Cliquez une langue pour l'activer. Les langues activées apparaissent dans l'onglet Traductions de l'éditeur et sur le site public sous /<lang>/." }, homePages: { title: "Page d'accueil par langue", help: "Optionnel : choisissez une page statique (dans la langue correspondante) pour servir d'accueil à /<lang>/. Sinon, une liste des derniers articles est rendue.", none: "— Derniers articles —" }, switcher: { title: "Sélecteur de langue", help: "Affiche un sélecteur de langue sur le site public. Les thèmes doivent intégrer un conteneur [data-cms-langswitch] dans leur Header / Footer pour que le sélecteur apparaisse (les thèmes intégrés le font déjà).", header: "Afficher le sélecteur dans l'en-tête du site", footer: "Afficher le sélecteur dans le pied de page du site" } }, Ee = { label: "Traductions", noLanguages: "Aucune langue supplémentaire n'est configurée.", configureLanguages: "Configurer les langues", editPrimaryInMain: "Modifiez la langue principale dans l'éditeur (titre, slug, contenu ci-dessus).", save: "Sauvegarder les traductions", saving: "Sauvegarde…", saved: "Traductions sauvegardées.", duplicate: "Dupliquer depuis la langue principale", invalidSlug: "Slug invalide pour {{lang}}.", fields: { title: "Titre", slug: "Slug", slugHelp: "Caractères ASCII minuscules + tirets uniquement.", excerpt: "Extrait", content: "Contenu (Markdown)", contentHelp: "Markdown simple. Les blocs de thème (Hero, embeds, etc.) intégrés dans la langue principale ne sont PAS répliqués automatiquement — collez votre contenu traduit ici.", seo: "SEO", seoTitle: "Titre SEO", seoDescription: "Méta description" } }, Ue = { title: "Traductions", name: "Nom", slug: "Slug", invalidSlug: "Slug invalide", seoTitle: "Titre meta SEO", seoDescription: "Description meta SEO", noLanguages: "Activez des langues secondaires dans les réglages du plugin Multilingue pour traduire ce terme." }, De = {
  settings: Ae,
  tab: Ee,
  termSection: Ue
}, H = {
  primaryLanguage: "en",
  enabledLanguages: [],
  homePages: {},
  menuTranslations: {},
  showHeaderSwitcher: !0,
  showFooterSwitcher: !1
}, Fe = "agentcms-multilang";
function w(n) {
  var t;
  const e = (t = n.pluginConfigs) == null ? void 0 : t[Fe];
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
function O(n, e) {
  return y(e, n) ? "index.html" : `${n}/index.html`;
}
function $(n, e) {
  const t = n.translations, a = t == null ? void 0 : t[e];
  return !a || !a.slug || !a.title ? null : a;
}
function k(n, e) {
  const t = n.translations, a = t == null ? void 0 : t[e];
  return !a || !a.slug || !a.name ? null : a;
}
function z(n) {
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
function Z(n) {
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
    const i = _(a, o.path);
    s.push(
      `<link rel="alternate" hreflang="${M(o.language)}" href="${M(i)}" />`
    );
  }
  const r = n.alternates.find((o) => o.language === t.primaryLanguage);
  if (r) {
    const o = _(a, r.path);
    s.push(`<link rel="alternate" hreflang="x-default" href="${M(o)}" />`);
  }
  s.push(
    `<meta property="og:locale" content="${M(Z(n.current.language))}" />`
  );
  for (const o of n.alternates)
    o.language !== n.current.language && s.push(
      `<meta property="og:locale:alternate" content="${M(Z(o.language))}" />`
    );
  return s.join(`
`);
}
function ue(n, e, t) {
  const a = e.replace(/\/+$/, "");
  if (!a || n.alternates.length === 0) return "";
  const s = [];
  for (const o of n.alternates) {
    const i = _(a, o.path);
    s.push(
      `    <xhtml:link rel="alternate" hreflang="${M(o.language)}" href="${M(i)}"/>`
    );
  }
  const r = n.alternates.find((o) => o.language === t.primaryLanguage);
  if (r) {
    const o = _(a, r.path);
    s.push(
      `    <xhtml:link rel="alternate" hreflang="x-default" href="${M(o)}"/>`
    );
  }
  return s.join(`
`);
}
function j(n, e, t) {
  const a = [];
  for (const s of [t.primaryLanguage, ...t.enabledLanguages]) {
    if (a.some((c) => c.language === s)) continue;
    const r = s === t.primaryLanguage ? z(n) : $(n, s);
    if (!r) continue;
    const o = n.primaryTermId ? e.find((c) => c.id === n.primaryTermId) : void 0, i = o ? s === t.primaryLanguage ? R(o) : k(o, s) ?? void 0 : void 0;
    if (o && !i && !y(t, s)) continue;
    const l = F({
      post: n,
      trans: r,
      primaryTermTrans: i,
      primaryTermSlug: o == null ? void 0 : o.slug,
      language: s,
      config: t
    });
    a.push({ language: s, path: l });
  }
  return a;
}
function ge(n, e) {
  const t = [];
  for (const a of [e.primaryLanguage, ...e.enabledLanguages]) {
    if (t.some((r) => r.language === a)) continue;
    const s = a === e.primaryLanguage ? R(n) : k(n, a);
    s && n.type === "category" && t.push({ language: a, path: V(n, s, a, e) });
  }
  return t;
}
function de(n) {
  const e = [];
  for (const t of [n.primaryLanguage, ...n.enabledLanguages])
    e.some((a) => a.language === t) || e.push({ language: t, path: O(t, n) });
  return e;
}
function W(n) {
  return (n.baseUrl || "").replace(/\/+$/, "");
}
const U = /* @__PURE__ */ new Map();
function I(n, e, t, a, s) {
  U.clear();
  const r = W(a);
  if (!r) return;
  for (const i of [...n, ...e]) {
    if (i.status !== "online") continue;
    const l = j(i, t, s);
    if (l.length !== 0)
      for (const c of l) {
        const u = q(
          { current: { path: c.path, language: c.language }, alternates: l },
          r,
          s
        );
        U.set(c.path, u);
      }
  }
  for (const i of t) {
    if (i.type !== "category") continue;
    const l = ge(i, s);
    if (l.length !== 0)
      for (const c of l) {
        const u = q(
          { current: { path: c.path, language: c.language }, alternates: l },
          r,
          s
        );
        U.set(c.path, u);
      }
  }
  const o = de(s);
  for (const i of o) {
    const l = q(
      { current: { path: i.path, language: i.language }, alternates: o },
      r,
      s
    );
    U.set(i.path, l);
  }
}
function He(n) {
  const e = n.replace(/^\/+/, "");
  return U.get(e) ?? U.get(`/${e}`) ?? "";
}
const D = /* @__PURE__ */ new Map();
function A(n, e, t, a) {
  D.clear();
  for (const r of [...n, ...e]) {
    if (r.status !== "online") continue;
    const o = j(r, t, a);
    if (o.length !== 0)
      for (const i of o)
        D.set(i.path, { language: i.language, alternates: o });
  }
  for (const r of t) {
    if (r.type !== "category") continue;
    const o = ge(r, a);
    if (o.length !== 0)
      for (const i of o)
        D.set(i.path, { language: i.language, alternates: o });
  }
  const s = de(a);
  for (const r of s)
    D.set(r.path, { language: r.language, alternates: s });
}
function _e(n) {
  const e = n.replace(/^\/+/, "");
  return D.get(e) ?? D.get(`/${e}`) ?? null;
}
function pe(n) {
  var a;
  const e = J(n.settings.activeThemeId);
  if (!e.settings) return;
  const t = (a = n.settings.themeConfigs) == null ? void 0 : a[e.id];
  return {
    ...e.settings.defaultConfig,
    ...t ?? {}
  };
}
function Oe(n, e, t) {
  const a = y(t, e), s = a ? "" : `${e}/`, r = { ...n.settings, language: e }, o = n.terms.map((u) => {
    if (u.type !== "category") return u;
    const d = a ? R(u) : k(u, e);
    return d ? {
      ...u,
      name: d.name,
      // Prefix with language code so buildPostUrl produces
      // <lang>/<term-slug>/<post-slug>.html for posts and
      // <lang>/<term-slug>/index.html for the archive itself.
      slug: `${s}${d.slug}`,
      description: d.description
    } : u;
  }), i = (u) => {
    const d = a ? z(u) : $(u, e);
    if (!d) return null;
    const p = u.type !== "post" || !u.primaryTermId;
    return {
      ...u,
      title: d.title,
      slug: p ? `${s}${d.slug}` : d.slug,
      contentMarkdown: d.contentMarkdown,
      excerpt: d.excerpt,
      seo: d.seo
    };
  }, l = n.posts.map(i).filter((u) => u !== null), c = n.pages.map(i).filter((u) => u !== null);
  return {
    ...n,
    settings: r,
    posts: l,
    pages: c,
    terms: o
  };
}
async function ze(n) {
  var i;
  const { language: e, ctx: t, config: a } = n, s = (i = a.homePages) == null ? void 0 : i[e], r = s ? { ...t.settings, homeMode: "static-page", homePageId: s } : t.settings, o = Oe({ ...t, settings: r }, e, a);
  return xe(o, {
    homePath: O(e, a),
    currentLocale: e
  });
}
async function Re(n) {
  var P, T, N, C, K;
  const { post: e, trans: t, termTrans: a, language: s, ctx: r, config: o } = n, i = J(r.settings.activeThemeId), l = {
    settings: { ...r.settings, language: s },
    resolvedMenus: { header: [], footer: [] },
    themeCssPath: `theme-assets/${r.settings.activeThemeId}.css`,
    themeConfig: pe(r),
    homePath: y(o, s) ? "/index.html" : `/${s}/index.html`
  }, c = { ...r, settings: { ...r.settings, language: s } };
  let u = Se(t.contentMarkdown);
  u = await Te("post.html.body", u, e, c);
  const d = r.terms.filter((E) => e.termIds.includes(E.id) && E.type === "tag"), p = e.primaryTermId ? r.terms.find((E) => E.id === e.primaryTermId && E.type === "category") : void 0, g = r.authorLookup(e.authorId), h = e.heroMediaId ? r.media.get(e.heroMediaId) : void 0, f = ((P = t.seo) == null ? void 0 : P.description) ?? se(t.contentMarkdown, 160);
  let S = p;
  if (p && a) {
    const Le = y(o, s) ? "" : `${s}/`;
    S = {
      ...p,
      name: a.name,
      slug: `${Le}${a.slug}`,
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
  }), b = {
    site: l,
    post: {
      ...e,
      title: t.title,
      slug: t.slug,
      contentMarkdown: t.contentMarkdown,
      excerpt: t.excerpt,
      seo: t.seo
    },
    bodyHtml: u,
    author: g,
    hero: h ? {
      alt: h.alt,
      caption: h.caption,
      default: ((N = (T = h.formats) == null ? void 0 : T[h.defaultFormat ?? ""]) == null ? void 0 : N.url) ?? h.url ?? "",
      formats: h.formats ?? {}
    } : void 0,
    primaryTerm: S,
    tags: d
  }, x = {
    site: l,
    pageTitle: ((C = t.seo) == null ? void 0 : C.title) ?? t.title,
    pageDescription: f || void 0,
    ogImage: (K = t.seo) == null ? void 0 : K.ogImage,
    currentPath: v,
    currentLocale: s
  };
  return re({
    base: i.templates.base,
    baseProps: x,
    template: i.templates.single,
    templateProps: b
  });
}
function je(n) {
  var f, S, v;
  const { term: e, termTrans: t, language: a, ctx: s, config: r } = n, o = J(s.settings.activeThemeId), i = {
    settings: { ...s.settings, language: a },
    resolvedMenus: { header: [], footer: [] },
    themeCssPath: `theme-assets/${s.settings.activeThemeId}.css`,
    themeConfig: pe(s),
    homePath: y(r, a) ? "/index.html" : `/${a}/index.html`
  }, l = {
    ...e,
    name: t.name,
    slug: t.slug,
    description: t.description
  }, c = y(r, a), u = c ? "" : `${a}/`, d = s.posts.filter((b) => b.status === "online" && b.primaryTermId === e.id).filter((b) => c ? !0 : $(b, a) !== null).map((b) => {
    var N, C;
    const x = c ? z(b) : $(b, a), P = F({
      post: b,
      trans: x,
      primaryTermTrans: t,
      primaryTermSlug: e.slug,
      language: a,
      config: r
    }), T = b.heroMediaId ? s.media.get(b.heroMediaId) : void 0;
    return {
      ...b,
      title: x.title,
      slug: x.slug,
      excerpt: x.excerpt,
      url: P,
      hero: T ? {
        alt: T.alt,
        caption: T.caption,
        default: ((C = (N = T.formats) == null ? void 0 : N[T.defaultFormat ?? ""]) == null ? void 0 : C.url) ?? T.url ?? "",
        formats: T.formats ?? {}
      } : void 0,
      category: {
        name: t.name,
        url: `/${u}${t.slug}/index.html`
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
  return re({
    base: o.templates.base,
    baseProps: h,
    template: o.templates.category,
    templateProps: p
  });
}
async function qe(n, e, t) {
  const a = w(t.settings);
  if (a.enabledLanguages.length === 0) return n;
  I(t.posts, t.pages, t.terms, t.settings, a), A(t.posts, t.pages, t.terms, a);
  const s = [...n], r = {}, o = e.primaryTermId ? t.terms.find((i) => i.id === e.primaryTermId && i.type === "category") : void 0;
  for (const i of a.enabledLanguages) {
    if (y(a, i)) continue;
    const l = $(e, i);
    if (!l) continue;
    const c = o ? k(o, i) : void 0;
    if (o && !c) continue;
    const u = F({
      post: e,
      trans: l,
      primaryTermTrans: c ?? void 0,
      primaryTermSlug: o == null ? void 0 : o.slug,
      language: i,
      config: a
    }), d = await Re({
      post: e,
      trans: l,
      termTrans: c ?? void 0,
      language: i,
      ctx: t,
      config: a
    });
    s.push({ path: u, html: d }), r[i] = u;
  }
  try {
    await ie(e.id, { lastPublishedPathsByLocale: r });
  } catch {
  }
  return s;
}
async function Be(n, e) {
  const t = w(e.settings);
  if (t.enabledLanguages.length === 0) return n;
  I(e.posts, e.pages, e.terms, e.settings, t), A(e.posts, e.pages, e.terms, t);
  const a = [...n];
  for (const s of t.enabledLanguages) {
    if (y(t, s)) continue;
    const r = O(s, t), o = await ze({ language: s, ctx: e, config: t });
    a.push({ path: r, html: o });
    for (const i of e.terms) {
      if (i.type !== "category") continue;
      const l = k(i, s);
      if (!l) continue;
      const c = V(i, l, s, t), u = je({ term: i, termTrans: l, language: s, ctx: e, config: t });
      a.push({ path: c, html: u });
    }
  }
  return a;
}
function Je(n) {
  return { ...n, "xmlns:xhtml": "http://www.w3.org/1999/xhtml" };
}
function Ge(n, e) {
  if (!e.entity) return n;
  const t = Xe(), a = Qe();
  if (!t || !a) return n;
  const s = j(e.entity, a, t);
  if (s.length === 0) return n;
  const r = e.baseUrl.replace(/\/+$/, "");
  return n + ue(
    { current: { path: e.path, language: t.primaryLanguage }, alternates: s },
    r,
    t
  ) + `
`;
}
function Ve(n, e) {
  var r, o, i, l, c, u;
  const t = w(e.settings);
  if (t.enabledLanguages.length === 0) return n;
  const a = W(e.settings);
  if (!a) return n;
  const s = [...n];
  for (const d of [...e.posts, ...e.pages]) {
    if (d.status !== "online") continue;
    const p = ((o = (r = d.createdAt) == null ? void 0 : r.toMillis) == null ? void 0 : o.call(r)) ?? ((l = (i = d.publishedAt) == null ? void 0 : i.toMillis) == null ? void 0 : l.call(i)) ?? Date.now();
    if (new Date(p).getUTCFullYear() !== e.year) continue;
    const g = j(d, e.terms, t);
    if (g.length !== 0)
      for (const h of g)
        y(t, h.language) || s.push({
          path: h.path,
          lastmodMs: ((u = (c = d.updatedAt) == null ? void 0 : c.toMillis) == null ? void 0 : u.call(c)) ?? p,
          extraInnerXml: ue(
            { current: { path: h.path, language: h.language }, alternates: g },
            a,
            t
          )
        });
  }
  return s;
}
function We(n, e) {
  var r;
  const t = (r = e.settings.pluginConfigs) == null ? void 0 : r["agentcms-sitemaps"];
  if (!(t != null && t.newsEnabled)) return n;
  const a = w(e.settings);
  if (a.enabledLanguages.length === 0) return n;
  const s = [...n];
  for (const o of a.enabledLanguages)
    y(a, o) || s.push({ path: `sitemaps/sitemap-news-${o}.xml` });
  return s;
}
function Ke(n, e) {
  var i, l, c, u, d, p, g, h;
  const t = w(e.settings);
  if (t.enabledLanguages.length === 0 || !W(e.settings)) return n;
  const s = e.config.newsWindowDays || 2, r = Date.now() - s * 24 * 60 * 60 * 1e3, o = [...n];
  for (const f of t.enabledLanguages) {
    if (y(t, f)) continue;
    const S = [];
    for (const v of [...e.posts, ...e.pages]) {
      if (v.status !== "online") continue;
      const b = ((l = (i = v.updatedAt) == null ? void 0 : i.toMillis) == null ? void 0 : l.call(i)) ?? ((u = (c = v.publishedAt) == null ? void 0 : c.toMillis) == null ? void 0 : u.call(c)) ?? ((p = (d = v.createdAt) == null ? void 0 : d.toMillis) == null ? void 0 : p.call(d)) ?? Date.now();
      if (b < r) continue;
      const x = $(v, f);
      if (!x) continue;
      const P = v.primaryTermId ? e.terms.find((C) => C.id === v.primaryTermId && C.type === "category") : void 0, T = P ? k(P, f) ?? void 0 : void 0, N = F({
        post: v,
        trans: x,
        primaryTermTrans: T,
        primaryTermSlug: P == null ? void 0 : P.slug,
        language: f,
        config: t
      });
      S.push({
        path: N,
        title: x.title,
        createdAtMs: ((h = (g = v.createdAt) == null ? void 0 : g.toMillis) == null ? void 0 : h.call(g)) ?? b,
        updatedAtMs: b
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
let he = null, me = null;
function fe(n) {
  he = n;
}
function ye(n) {
  me = n;
}
function Xe() {
  return he;
}
function Qe() {
  return me;
}
const Ye = 20;
function Ze(n) {
  return `${n}/rss.xml`;
}
function et(n) {
  return `${n}/feed.xml`;
}
function tt(n, e) {
  return `${n}/${e}/${e}.xml`;
}
function nt(n) {
  const e = w(n.settings);
  if (e.enabledLanguages.length === 0) return [];
  const t = [];
  for (const a of e.enabledLanguages) {
    if (y(e, a)) continue;
    const s = at(n.posts, n.terms, a, e, n.baseUrl);
    t.push({
      language: a,
      path: Ze(a),
      channelTitle: `${n.settings.title || "Site"} — ${a.toUpperCase()}`,
      channelLink: G(n.baseUrl, O(a, e)),
      channelDescription: n.settings.description || n.settings.title || "",
      items: s
    });
  }
  return t;
}
async function be(n) {
  const e = w(n.settings);
  for (const t of e.enabledLanguages)
    if (!y(e, t)) {
      try {
        await X(et(t));
      } catch {
      }
      for (const a of n.terms) {
        if (a.type !== "category") continue;
        const s = k(a, t);
        if (s)
          try {
            await X(tt(t, s.slug));
          } catch {
          }
      }
    }
}
function at(n, e, t, a, s) {
  return n.filter((r) => r.status === "online").map((r) => st(r, e, t, a, s)).filter((r) => r !== null).sort((r, o) => o.pubDateMs - r.pubDateMs).slice(0, Ye);
}
function st(n, e, t, a, s) {
  var p, g, h, f, S, v;
  const r = $(n, t);
  if (!r) return null;
  const o = n.primaryTermId ? e.find((b) => b.id === n.primaryTermId && b.type === "category") : void 0, i = o ? k(o, t) : void 0;
  if (o && !i) return null;
  const l = F({
    post: n,
    trans: r,
    primaryTermTrans: i ?? void 0,
    primaryTermSlug: o == null ? void 0 : o.slug,
    language: t,
    config: a
  }), c = G(s, l), u = (r.excerpt && r.excerpt.trim().length > 0 ? r.excerpt : se(r.contentMarkdown, 300)).trim(), d = ((g = (p = n.publishedAt) == null ? void 0 : p.toMillis) == null ? void 0 : g.call(p)) ?? ((f = (h = n.updatedAt) == null ? void 0 : h.toMillis) == null ? void 0 : f.call(h)) ?? ((v = (S = n.createdAt) == null ? void 0 : S.toMillis) == null ? void 0 : v.call(S)) ?? Date.now();
  return {
    title: r.title,
    link: c,
    guid: c,
    description: u,
    pubDateMs: d,
    category: i == null ? void 0 : i.name
  };
}
function rt(n, e, t) {
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
    const l = a ? z(i) : $(i, e);
    if (!l) return null;
    const c = i.type !== "post" || !i.primaryTermId;
    return {
      ...i,
      title: l.title,
      slug: c ? `${s}${l.slug}` : l.slug,
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
async function we(n) {
  const e = w(n.settings);
  if (e.enabledLanguages.length !== 0)
    for (const t of e.enabledLanguages) {
      if (y(e, t)) continue;
      const a = rt(n, t, e), s = { ...n.settings, language: t }, r = `${t}/data/posts.json`, o = `${t}/data/authors.json`;
      try {
        await Pe(
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
        await ke(
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
const ee = ["en", "fr", "de", "es", "nl", "pt", "ko"];
function it({ config: n, save: e }) {
  const { t } = ce("agentcms-multilang"), { settings: a, pages: s } = oe(), [r, o] = Y({
    ...H,
    ...n
  }), [i, l] = Y(!1);
  async function c() {
    l(!0);
    try {
      await e(r), B.success(t("settings.saved"));
    } catch (g) {
      B.error(g.message || "Save failed");
    } finally {
      l(!1);
    }
  }
  function u(g) {
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
            children: ee.map((g) => /* @__PURE__ */ m("option", { value: g, children: g.toUpperCase() }, g))
          }
        ),
        /* @__PURE__ */ m("span", { className: "text-[11px] text-surface-500 self-center", children: t("settings.primaryLanguage.siteHint", { lang: p }) })
      ] })
    ] }),
    /* @__PURE__ */ L("section", { className: "card p-4 space-y-3", children: [
      /* @__PURE__ */ m("h3", { className: "font-medium", children: t("settings.enabledLanguages.title") }),
      /* @__PURE__ */ m("p", { className: "text-xs text-surface-500 dark:text-surface-400", children: t("settings.enabledLanguages.help") }),
      /* @__PURE__ */ m("div", { className: "flex flex-wrap gap-2", children: ee.filter((g) => g !== r.primaryLanguage).map((g) => {
        const h = r.enabledLanguages.includes(g);
        return /* @__PURE__ */ m(
          "button",
          {
            type: "button",
            onClick: () => u(g),
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
        onClick: c,
        disabled: i,
        children: t(i ? "settings.saving" : "settings.save")
      }
    ) })
  ] });
}
function ot({ term: n, updateTerm: e }) {
  const { t } = ce("agentcms-multilang"), { settings: a } = oe(), s = w(a);
  if (s.enabledLanguages.length === 0)
    return /* @__PURE__ */ m("p", { className: "text-xs text-surface-500 dark:text-surface-400", children: t("termSection.noLanguages") });
  const r = n.translations ?? {};
  function o(i, l) {
    const c = {
      ...r,
      [i]: { ...r[i] ?? te(), ...l }
    };
    e({ translations: c });
  }
  return /* @__PURE__ */ L("div", { className: "space-y-2", children: [
    /* @__PURE__ */ m("p", { className: "text-[11px] uppercase tracking-wide font-semibold text-surface-500 dark:text-surface-400", children: t("termSection.title") }),
    s.enabledLanguages.map((i) => {
      const l = r[i] ?? te(), c = l.slug && !le(l.slug), u = l.seo ?? {};
      function d(p) {
        o(i, { seo: { ...u, ...p } });
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
            c && /* @__PURE__ */ m("p", { className: "text-[10px] text-red-600 mt-0.5", children: t("termSection.invalidSlug") })
          ] })
        ] }),
        /* @__PURE__ */ L("div", { className: "pl-10 space-y-1", children: [
          /* @__PURE__ */ m(
            "input",
            {
              type: "text",
              className: "input w-full",
              placeholder: t("termSection.seoTitle"),
              value: u.title ?? "",
              onChange: (p) => d({ title: p.target.value })
            }
          ),
          /* @__PURE__ */ m(
            "textarea",
            {
              className: "input w-full min-h-[60px] resize-y",
              placeholder: t("termSection.seoDescription"),
              value: u.description ?? "",
              onChange: (p) => d({ description: p.target.value })
            }
          )
        ] })
      ] }, i);
    })
  ] });
}
function te() {
  return { slug: "", name: "", description: "" };
}
function ve(n, e, t) {
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
function ne(n, e, t) {
  if (t) return "★";
  const a = ve(n, e, !1);
  return a && a.slug && a.title ? "" : "○";
}
const lt = {
  id: "agentcms-multilang/languages",
  priority: 50,
  listVariants(n, e) {
    const t = w(e.settings);
    if (t.enabledLanguages.length === 0) return [];
    const a = [], s = /* @__PURE__ */ new Set();
    a.push({
      id: t.primaryLanguage,
      label: t.primaryLanguage.toUpperCase(),
      badge: ne(n, t.primaryLanguage, !0),
      primary: !0
    }), s.add(t.primaryLanguage);
    for (const r of t.enabledLanguages)
      s.has(r) || (s.add(r), a.push({
        id: r,
        label: r.toUpperCase(),
        badge: ne(n, r, !1),
        primary: !1
      }));
    return a;
  },
  loadFields(n, e, t) {
    const a = w(t.settings), s = y(a, e);
    return ve(n, e, s);
  },
  validate(n, e, t, a) {
    const s = w(a.settings);
    return y(s, e) ? null : t.title.trim() ? le(t.slug) ? null : `Invalid slug for ${e.toUpperCase()}.` : `Title required for ${e.toUpperCase()}.`;
  },
  async saveFields(n, e, t, a) {
    const s = w(a.settings);
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
      await ie(n.id, { translations: i });
    } catch (l) {
      throw B.error(l.message), l;
    }
  },
  getSlugPathPrefix(n, e, t, a) {
    var u;
    const s = w(a.settings), r = y(s, e) ? "" : `${e}/`;
    if (n.type !== "post" || !n.primaryTermId) return r;
    const o = a.terms.find((d) => d.id === n.primaryTermId);
    if (!o) return r;
    const i = o.translations, c = !y(s, e) && ((u = i == null ? void 0 : i[e]) == null ? void 0 : u.slug) || o.slug;
    return `${r}${c}/`;
  }
}, ct = `
.cms-langswitch{display:inline-flex;align-items:center;gap:6px;font-size:12px;line-height:1;letter-spacing:0.05em;}
.cms-langswitch a,.cms-langswitch span{padding:4px 8px;border-radius:4px;text-decoration:none;color:inherit;text-transform:uppercase;font-weight:600;}
.cms-langswitch a{opacity:0.55;}
.cms-langswitch a:hover{opacity:1;}
.cms-langswitch__current{background:currentColor;color:transparent;position:relative;}
.cms-langswitch__current::after{content:attr(data-label);position:absolute;inset:0;display:flex;align-items:center;justify-content:center;color:var(--cms-langswitch-on,white);mix-blend-mode:difference;}
`.replace(/\s+/g, " ").trim();
function ut(n) {
  return n.replace(/[<>&\u2028\u2029]/g, (e) => e === "<" ? "\\u003c" : e === ">" ? "\\u003e" : e === "&" ? "\\u0026" : e === "\u2028" ? "\\u2028" : "\\u2029");
}
function gt(n) {
  const { config: e, settings: t, currentPath: a } = n;
  if (e.enabledLanguages.length === 0 || !e.showHeaderSwitcher && !e.showFooterSwitcher) return "";
  const s = _e(a);
  if (!s || s.alternates.length < 2) return "";
  const r = (t.baseUrl || "").replace(/\/+$/, ""), o = s.alternates.map((p) => ({
    lang: p.language,
    label: p.language.toUpperCase(),
    href: r ? G(r, p.path) : `/${p.path.replace(/^\/+/, "")}`
  })), i = s.language, l = e.primaryLanguage, c = {
    current: i,
    primary: l,
    items: o,
    showHeader: e.showHeaderSwitcher !== !1,
    showFooter: e.showFooterSwitcher === !0
  };
  return `<script>${`
(function(){
  try {
    var D = ${ut(JSON.stringify(c))};
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
      s.textContent = ${JSON.stringify(ct)};
      document.head.appendChild(s);
    }
    if (document.readyState !== 'loading') paint();
    else document.addEventListener('DOMContentLoaded', paint);
  } catch (e) {}
})();`}<\/script>`;
}
async function dt(n, e) {
  const t = w(e.settings);
  fe(t), ye(e.terms), I(e.posts, e.pages, e.terms, e.settings, t), A(e.posts, e.pages, e.terms, t), await be(e), await we(e);
}
async function ae(n, e) {
  const t = w(e.settings);
  fe(t), ye(e.terms), I(e.posts, e.pages, e.terms, e.settings, t), A(e.posts, e.pages, e.terms, t), await be(e), await we(e);
}
async function pt() {
  try {
    const n = window, e = n == null ? void 0 : n.__AGENTCMS_LIVE_SETTINGS__;
    if (!e) return;
    const t = w(e);
    if (t.enabledLanguages.length === 0) return;
    const [a, s] = await Promise.all([
      Q({ type: "post" }),
      Q({ type: "page" })
    ]);
    I(a, s, [], e, t), A(a, s, [], t);
  } catch {
  }
}
const bt = {
  id: "agentcms-multilang",
  name: "Multi-language",
  version: "1.6.3",
  description: "Multi-language site support — translated posts/pages/terms, hreflang SEO, per-language sitemap entries, per-language RSS feeds.",
  author: "AgentCMS",
  readme: Ce,
  i18n: { en: Ie, fr: De },
  settings: {
    navLabelKey: "settings.title",
    defaultConfig: H,
    component: it
  },
  register(n) {
    n.addFilter("publish.additional", async (e, t, a) => qe(
      e,
      t,
      a
    )), n.addFilter("publish.extraListings", async (e, t) => Be(
      e,
      t
    )), n.addAction("publish.before", async (e, t) => {
      const a = t, s = w(a.settings);
      I(a.posts, a.pages, a.terms, a.settings, s), A(a.posts, a.pages, a.terms, s);
    }), n.addAction("regenerate.listings.before", async (e) => {
      const t = e, a = w(t.settings);
      I(t.posts, t.pages, t.terms, t.settings, a), A(t.posts, t.pages, t.terms, a);
    }), n.addAction("publish.complete", async (e, t) => {
      await dt(e, t);
    }), n.addAction("post.unpublished", async (e, t) => {
      await ae(e, t);
    }), n.addAction("post.deleted", async (e, t) => {
      await ae(e, t);
    }), n.addFilter("page.head.extra", (e, ...t) => {
      const a = t[0];
      if (!(a != null && a.currentPath)) return e;
      const s = He(a.currentPath);
      return s ? e + (e ? `
` : "") + s : e;
    }), n.addFilter("page.body.end", (e, ...t) => {
      var o;
      const a = t[0];
      if (!(a != null && a.currentPath) || !((o = a == null ? void 0 : a.site) != null && o.settings)) return e;
      const s = w(a.site.settings), r = gt({
        config: s,
        settings: a.site.settings,
        currentPath: a.currentPath
      });
      return r ? e + (e ? `
` : "") + r : e;
    }), n.addFilter(
      "sitemap.urlset.namespaces",
      (e) => Je(e)
    ), n.addFilter("sitemap.url.entry", (e, ...t) => {
      const a = t[0];
      return Ge(e, a);
    }), n.addFilter("sitemap.urls.extra", (e, ...t) => {
      const a = t[0];
      return Ve(
        e,
        a
      );
    }), n.addFilter("sitemap.index.extra", (e, ...t) => {
      const a = t[0];
      return We(
        e,
        a
      );
    }), n.addFilter("sitemap.news.locales", (e, ...t) => {
      const a = t[0];
      return Ke(
        e,
        a
      );
    }), n.addFilter("rss.site.locales", (e, ...t) => {
      const a = t[0];
      return a ? [
        ...e,
        ...nt(a)
      ] : e;
    }), n.registerEditorVariantProvider(lt), n.registerTermEditorSection({
      id: "agentcms-multilang/term-translations",
      termType: "all",
      priority: 50,
      component: ot
    }), pt();
  }
};
export {
  bt as default
};
