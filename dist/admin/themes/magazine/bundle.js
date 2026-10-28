import { jsx as d, jsxs as g, Fragment as Je } from "react/jsx-runtime";
import { uploadFile as Jr, i18n as ee, pickPublicLocale as te, canonicalUrl as Gr, pickFormat as Y, buildTermUrl as Et, SocialIcon as Kr, socialLabel as Gt, useCmsData as Zr, logoPath as Yr, FontSelect as Kt, toast as D, uploadThemeLogo as Xr, removeThemeLogo as Qr, fetchAllPosts as Zt, publishMenuJson as ei, useAllPosts as Ln, postSortMillis as ne, buildPostUrl as ot, mediaToView as Pn, getCurrentPublishContext as ti } from "@agent-cms/runtime";
import R, { forwardRef as At, createElement as Ze, useState as K, useRef as ni, createRef as ri, memo as ii, createContext as On, version as Yt, useContext as ai } from "react";
import { useTranslation as q } from "react-i18next";
import oi, { flushSync as si } from "react-dom";
const st = [
  // Surfaces
  { name: "--color-background", type: "color", group: "surfaces", labelKey: "vars.background", defaultValue: "#f8f9fa" },
  { name: "--color-surface", type: "color", group: "surfaces", labelKey: "vars.surface", defaultValue: "#f8f9fa" },
  { name: "--color-surface-container-low", type: "color", group: "surfaces", labelKey: "vars.surfaceLow", defaultValue: "#f3f4f5" },
  { name: "--color-surface-container", type: "color", group: "surfaces", labelKey: "vars.surfaceMid", defaultValue: "#edeeef" },
  { name: "--color-surface-container-high", type: "color", group: "surfaces", labelKey: "vars.surfaceHigh", defaultValue: "#e7e8e9" },
  // Foreground
  { name: "--color-on-surface", type: "color", group: "foreground", labelKey: "vars.onSurface", defaultValue: "#191c1d" },
  { name: "--color-on-surface-variant", type: "color", group: "foreground", labelKey: "vars.onSurfaceVariant", defaultValue: "#444748" },
  // Outlines
  { name: "--color-outline", type: "color", group: "outlines", labelKey: "vars.outline", defaultValue: "#747878" },
  { name: "--color-outline-variant", type: "color", group: "outlines", labelKey: "vars.outlineVariant", defaultValue: "#c4c7c7" },
  // Accent
  { name: "--color-primary", type: "color", group: "accent", labelKey: "vars.primary", defaultValue: "#000000" },
  { name: "--color-on-primary", type: "color", group: "accent", labelKey: "vars.onPrimary", defaultValue: "#ffffff" },
  { name: "--color-primary-container", type: "color", group: "accent", labelKey: "vars.primaryContainer", defaultValue: "#1c1b1b" },
  { name: "--color-on-primary-container", type: "color", group: "accent", labelKey: "vars.onPrimaryContainer", defaultValue: "#858383" },
  { name: "--color-secondary", type: "color", group: "accent", labelKey: "vars.secondary", defaultValue: "#43617c" }
], li = [
  "surfaces",
  "foreground",
  "outlines",
  "accent"
], W = {
  serif: {
    Newsreader: "Newsreader:ital,wght@0,400;0,500;0,600;0,700;0,800;1,400",
    Lora: "Lora:ital,wght@0,400;0,500;0,600;0,700;1,400",
    "Playfair Display": "Playfair+Display:ital,wght@0,400;0,500;0,600;0,700;1,400",
    "EB Garamond": "EB+Garamond:ital,wght@0,400;0,500;0,600;0,700;1,400",
    "IBM Plex Serif": "IBM+Plex+Serif:ital,wght@0,400;0,500;0,600;0,700;1,400",
    Spectral: "Spectral:ital,wght@0,400;0,500;0,600;0,700;1,400"
  },
  sans: {
    "Work Sans": "Work+Sans:wght@400;500;600;700",
    Inter: "Inter:wght@400;500;600;700",
    Manrope: "Manrope:wght@400;500;600;700",
    "IBM Plex Sans": "IBM+Plex+Sans:wght@400;500;600;700",
    "Plus Jakarta Sans": "Plus+Jakarta+Sans:wght@400;500;600;700",
    Outfit: "Outfit:wght@400;500;600;700"
  }
}, be = "Newsreader", ye = "Work Sans", Se = {
  vars: {},
  fontSerif: be,
  fontSans: ye
}, Bn = [
  {
    id: "editorial",
    swatch: ["--color-background", "--color-surface-container", "--color-primary", "--color-secondary"],
    vars: {},
    fontSerif: be,
    fontSans: ye
  },
  {
    id: "news",
    swatch: ["--color-background", "--color-surface-container", "--color-primary", "--color-secondary"],
    vars: {
      "--color-background": "#fafaf7",
      "--color-surface": "#fafaf7",
      "--color-surface-container-low": "#f0efe9",
      "--color-surface-container": "#e6e4dd",
      "--color-surface-container-high": "#dcd9d1",
      "--color-on-surface": "#0a0a0a",
      "--color-on-surface-variant": "#2c2c2c",
      "--color-outline": "#6b6b6b",
      "--color-outline-variant": "#c4c4c4",
      "--color-primary": "#8b0000",
      "--color-on-primary": "#ffffff",
      "--color-primary-container": "#4a0000",
      "--color-on-primary-container": "#d4a8a8",
      "--color-secondary": "#6b0000"
    },
    fontSerif: "Playfair Display",
    fontSans: "IBM Plex Sans"
  },
  {
    id: "literary",
    swatch: ["--color-background", "--color-surface-container", "--color-primary", "--color-secondary"],
    vars: {
      "--color-background": "#faf8f3",
      "--color-surface": "#faf8f3",
      "--color-surface-container-low": "#f0eee8",
      "--color-surface-container": "#e6e3da",
      "--color-surface-container-high": "#dcd8cd",
      "--color-on-surface": "#2a2520",
      "--color-on-surface-variant": "#5a5046",
      "--color-outline": "#8c8276",
      "--color-outline-variant": "#cfc8bd",
      "--color-primary": "#5a3a2a",
      "--color-on-primary": "#faf8f3",
      "--color-primary-container": "#3a2418",
      "--color-on-primary-container": "#a8907c",
      "--color-secondary": "#7a4d36"
    },
    fontSerif: "EB Garamond",
    fontSans: "Manrope"
  },
  {
    id: "modernist",
    swatch: ["--color-background", "--color-surface-container", "--color-primary", "--color-secondary"],
    vars: {
      "--color-background": "#f7f7fa",
      "--color-surface": "#f7f7fa",
      "--color-surface-container-low": "#eeeef2",
      "--color-surface-container": "#e3e3eb",
      "--color-surface-container-high": "#d8d8e3",
      "--color-on-surface": "#14152b",
      "--color-on-surface-variant": "#3a3b50",
      "--color-outline": "#6c6d80",
      "--color-outline-variant": "#b8b9c8",
      "--color-primary": "#2929d1",
      "--color-on-primary": "#ffffff",
      "--color-primary-container": "#1a1aa8",
      "--color-on-primary-container": "#9494d4",
      "--color-secondary": "#4b41e1"
    },
    fontSerif: "Spectral",
    fontSans: "Outfit"
  },
  {
    id: "boutique",
    swatch: ["--color-background", "--color-surface-container", "--color-primary", "--color-secondary"],
    vars: {
      "--color-background": "#fcfaf4",
      "--color-surface": "#fcfaf4",
      "--color-surface-container-low": "#f3f0e8",
      "--color-surface-container": "#ebe6d9",
      "--color-surface-container-high": "#e0d9c8",
      "--color-on-surface": "#1a1612",
      "--color-on-surface-variant": "#46403a",
      "--color-outline": "#8a8478",
      "--color-outline-variant": "#cfc8b8",
      "--color-primary": "#1a1612",
      "--color-on-primary": "#fcfaf4",
      "--color-primary-container": "#332b22",
      "--color-on-primary-container": "#a8a094",
      "--color-secondary": "#b8581d"
    },
    fontSerif: "Lora",
    fontSans: "Plus Jakarta Sans"
  }
];
function Fn(r, e) {
  var i;
  const t = (i = r.vars) == null ? void 0 : i[e];
  if (t && t.trim()) return t.trim();
  const n = st.find((a) => a.name === e);
  return n ? n.defaultValue : "";
}
function ci(r) {
  var e;
  for (const t of Bn) {
    if (t.fontSerif !== r.fontSerif || t.fontSans !== r.fontSans) continue;
    let n = !0;
    for (const i of st) {
      const a = ((e = t.vars[i.name]) == null ? void 0 : e.trim()) || i.defaultValue, o = Fn(r, i.name);
      if (a !== o) {
        n = !1;
        break;
      }
    }
    if (n) return t.id;
  }
  return null;
}
function di(r, e) {
  const t = W.serif[r] ?? W.serif[be], n = W.sans[e] ?? W.sans[ye];
  return `https://fonts.googleapis.com/css2?family=${t}&family=${n}&display=swap`;
}
function ui() {
  return `https://fonts.googleapis.com/css2?${[
    ...Object.keys(W.serif),
    ...Object.keys(W.sans)
  ].map((t) => `family=${t.replace(/ /g, "+")}`).join("&")}&display=swap`;
}
function Xt(r) {
  return W.serif[r] !== void 0 ? "serif" : "sans-serif";
}
function hi(r) {
  const e = r.trim(), t = /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.exec(e);
  if (!t) return e;
  const n = t[1];
  if (n.length === 3) {
    const s = parseInt(n[0] + n[0], 16), l = parseInt(n[1] + n[1], 16), c = parseInt(n[2] + n[2], 16);
    return `${s} ${l} ${c}`;
  }
  const i = parseInt(n.slice(0, 2), 16), a = parseInt(n.slice(2, 4), 16), o = parseInt(n.slice(4, 6), 16);
  return `${i} ${a} ${o}`;
}
function Qt(r) {
  return `"${r.replace(/"/g, '\\"')}"`;
}
function Hn(r, e) {
  const t = {};
  for (const [u, p] of Object.entries(e.vars ?? {}))
    p && p.trim() && (t[u] = p.trim());
  const n = e.fontSerif || be, i = e.fontSans || ye, a = n !== be || i !== ye, o = Object.keys(t).length > 0;
  if (!a && !o) return r;
  let s = r;
  if (a) {
    const u = di(n, i);
    s = s.replace(
      /@import\s*(?:url\(\s*)?"https:\/\/fonts\.googleapis\.com[^"]*"(?:\s*\))?\s*;/,
      `@import url("${u}");`
    );
  }
  const l = new Map(st.map((u) => [u.name, u])), c = Object.entries(t).map(([u, p]) => {
    const f = l.get(u), b = (f == null ? void 0 : f.type) === "color" ? hi(p) : p;
    return `${u}:${b};`;
  }).join(""), h = a ? `--font-serif:${Qt(n)};--font-sans:${Qt(i)};` : "";
  return s += `
:root{${h}${c}}
`, s;
}
async function en(r) {
  const e = Hn(r.baseCssText, r.style);
  await Jr({
    path: "theme-assets/magazine.css",
    content: e,
    encoding: "utf-8"
  });
}
const jn = {
  mostReadCount: 4,
  sidebarTop: "most-read",
  sidebarBottom: "promo",
  promoImageUrl: "",
  promoImageAlt: "",
  promoEyebrow: "",
  promoTitle: "",
  promoHref: "",
  featuredLabel: "",
  latestHeading: "",
  mostReadHeading: ""
}, Tt = {
  brandPosition: "centered",
  showSearch: !0
}, pi = {
  logoEnabled: !1,
  logoUpdatedAt: 0,
  style: Se,
  cssUpdatedAt: 0,
  home: jn,
  header: Tt
};
function fi({ site: r }) {
  const { settings: e } = r, t = ee.getFixedT(te(e.language), "theme-magazine"), n = r.themeConfig, i = (n == null ? void 0 : n.header) ?? Tt, a = i.brandPosition !== "left", o = i.showSearch !== !1, s = /* @__PURE__ */ d(
    "button",
    {
      type: "button",
      className: "burger-toggle text-on-surface",
      "aria-controls": "burger-menu",
      "aria-expanded": "false",
      "aria-label": t("publicBaked.menu"),
      children: /* @__PURE__ */ d("span", { className: "material-symbols-outlined", children: "menu" })
    }
  ), l = /* @__PURE__ */ d(
    "a",
    {
      className: a ? "absolute left-1/2 -translate-x-1/2 font-serif text-2xl font-black text-on-surface tracking-tight" : "font-serif text-2xl font-black text-on-surface tracking-tight",
      href: r.homePath ?? "/index.html",
      "data-cms-brand": !0,
      children: e.title
    }
  ), c = o ? /* @__PURE__ */ d(
    "button",
    {
      type: "button",
      className: "text-on-surface",
      "aria-label": t("publicBaked.search"),
      "data-cms-search": !0,
      children: /* @__PURE__ */ d("span", { className: "material-symbols-outlined", children: "search" })
    }
  ) : /* @__PURE__ */ d("span", { "aria-hidden": "true" }), h = /* @__PURE__ */ d(
    "div",
    {
      className: "inline-flex items-center",
      "data-cms-langswitch": "header",
      "aria-hidden": "true"
    }
  );
  return /* @__PURE__ */ g(Je, { children: [
    /* @__PURE__ */ d("header", { className: "fixed top-0 left-0 right-0 z-50 bg-background border-b border-outline-variant", children: /* @__PURE__ */ d("div", { className: "max-w-container-max mx-auto flex items-center justify-between px-margin-mobile lg:px-gutter py-stack-md", children: a ? /* @__PURE__ */ g(Je, { children: [
      s,
      l,
      /* @__PURE__ */ g("div", { className: "flex items-center gap-stack-md", children: [
        h,
        c
      ] })
    ] }) : /* @__PURE__ */ g(Je, { children: [
      /* @__PURE__ */ g("div", { className: "flex items-center gap-stack-md", children: [
        s,
        l
      ] }),
      /* @__PURE__ */ g("div", { className: "flex items-center gap-stack-md", children: [
        h,
        c
      ] })
    ] }) }) }),
    /* @__PURE__ */ d(
      "nav",
      {
        id: "burger-menu",
        className: "burger-menu",
        "data-cms-menu": "header",
        "aria-label": "Primary",
        children: /* @__PURE__ */ d("ul", {})
      }
    )
  ] });
}
function mi({ site: r }) {
  const { settings: e } = r, t = (/* @__PURE__ */ new Date()).getFullYear();
  return /* @__PURE__ */ d("footer", { className: "mt-section-gap bg-surface-container-low border-t border-outline-variant", children: /* @__PURE__ */ g("div", { className: "max-w-container-max mx-auto px-margin-mobile lg:px-gutter py-stack-lg", children: [
    /* @__PURE__ */ g("div", { className: "flex flex-col md:flex-row md:items-start md:justify-between gap-stack-md", children: [
      /* @__PURE__ */ d("p", { className: "font-serif text-xl font-bold text-on-surface tracking-tight", children: e.title }),
      /* @__PURE__ */ d("nav", { "data-cms-menu": "footer", "aria-label": "Footer", className: "flex-1 md:flex md:justify-end", children: /* @__PURE__ */ d("ul", { className: "flex flex-wrap gap-stack-md text-sm text-on-surface-variant" }) })
    ] }),
    /* @__PURE__ */ g("div", { className: "mt-stack-md pt-stack-md border-t border-outline-variant flex flex-wrap items-center justify-between gap-stack-sm", children: [
      /* @__PURE__ */ g("p", { className: "text-xs text-on-surface-variant tracking-widest uppercase", children: [
        "© ",
        t,
        " ",
        e.title
      ] }),
      /* @__PURE__ */ d("div", { "data-cms-langswitch": "footer", "aria-hidden": "true" })
    ] })
  ] }) });
}
function gi({
  site: r,
  pageTitle: e,
  pageDescription: t,
  ogImage: n,
  currentPath: i,
  currentLocale: a,
  children: o
}) {
  var b;
  const s = (b = r.themeConfig) == null ? void 0 : b.cssUpdatedAt, l = s ? `/${r.themeCssPath}?v=${s}` : `/${r.themeCssPath}`, c = r.themeCssPath.replace(/^theme-assets\//, "").replace(/\.css$/, ""), h = `/theme-assets/${c}-menu.js`, u = `/theme-assets/${c}-posts.js`, p = r.settings.baseUrl && i ? Gr(r.settings.baseUrl, i) : void 0, f = e ? `${e} — ${r.settings.title}` : r.settings.title;
  return /* @__PURE__ */ g("html", { lang: a || r.settings.language || "en", children: [
    /* @__PURE__ */ g("head", { children: [
      /* @__PURE__ */ d("meta", { charSet: "UTF-8" }),
      /* @__PURE__ */ d("meta", { name: "viewport", content: "width=device-width, initial-scale=1" }),
      /* @__PURE__ */ d("title", { children: f }),
      t && /* @__PURE__ */ d("meta", { name: "description", content: t }),
      p && /* @__PURE__ */ d("link", { rel: "canonical", href: p }),
      /* @__PURE__ */ d("link", { rel: "preconnect", href: "https://fonts.googleapis.com" }),
      /* @__PURE__ */ d("link", { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "" }),
      /* @__PURE__ */ d("link", { rel: "stylesheet", href: l }),
      /* @__PURE__ */ d("meta", { property: "og:title", content: f }),
      t && /* @__PURE__ */ d("meta", { property: "og:description", content: t }),
      n && /* @__PURE__ */ d("meta", { property: "og:image", content: n }),
      p && /* @__PURE__ */ d("meta", { property: "og:url", content: p }),
      /* @__PURE__ */ d("meta", { property: "og:type", content: "website" }),
      /* @__PURE__ */ d("meta", { name: "x-cms-head-extra" })
    ] }),
    /* @__PURE__ */ g("body", { className: "bg-background text-on-surface font-sans", children: [
      /* @__PURE__ */ d(fi, { site: r }),
      /* @__PURE__ */ d("main", { className: "pt-24 pb-section-gap", children: o }),
      /* @__PURE__ */ d(mi, { site: r }),
      /* @__PURE__ */ d("script", { src: h, defer: !0 }),
      /* @__PURE__ */ d("script", { src: u, defer: !0 }),
      /* @__PURE__ */ d("script", { type: "application/x-cms-body-end" })
    ] })
  ] });
}
function bi({
  staticPage: r,
  archivesLink: e,
  heroHtml: t,
  listHtml: n,
  mostReadHtml: i,
  promoCardHtml: a,
  site: o
}) {
  var u, p, f;
  const s = ee.getFixedT(te(o.settings.language), "theme-magazine");
  if (r)
    return /* @__PURE__ */ g("article", { className: "max-w-container-max mx-auto px-margin-mobile lg:px-gutter", children: [
      /* @__PURE__ */ d("h1", { className: "font-serif text-4xl text-on-surface mb-stack-md", children: r.post.title }),
      /* @__PURE__ */ d(
        "div",
        {
          className: "prose max-w-none",
          dangerouslySetInnerHTML: { __html: r.bodyHtml }
        }
      )
    ] });
  if (!(t && t.length > 0 || n && n.length > 0))
    return /* @__PURE__ */ d("div", { className: "max-w-container-max mx-auto px-margin-mobile lg:px-gutter", children: /* @__PURE__ */ d("p", { className: "text-on-surface-variant", children: "No posts yet." }) });
  const c = !!i || !!a;
  return /* @__PURE__ */ g("div", { className: "max-w-container-max mx-auto px-margin-mobile lg:px-gutter", children: [
    t && /* @__PURE__ */ d("div", { dangerouslySetInnerHTML: { __html: t } }),
    n && /* @__PURE__ */ g("div", { className: "grid grid-cols-1 lg:grid-cols-12 gap-stack-lg", children: [
      /* @__PURE__ */ g("div", { className: c ? "lg:col-span-8" : "lg:col-span-12", children: [
        /* @__PURE__ */ d("div", { className: "flex items-center justify-between mb-stack-md pb-2 border-b border-on-surface", children: /* @__PURE__ */ d("h3", { className: "font-serif text-2xl italic text-on-surface", children: ((f = (p = (u = o.themeConfig) == null ? void 0 : u.home) == null ? void 0 : p.latestHeading) == null ? void 0 : f.trim()) || s("publicBaked.latestListHeading") }) }),
        /* @__PURE__ */ d("div", { dangerouslySetInnerHTML: { __html: n } }),
        e && /* @__PURE__ */ d("div", { className: "mt-stack-lg flex justify-center", children: /* @__PURE__ */ d(
          "a",
          {
            className: "border border-on-surface px-stack-lg py-stack-sm text-xs uppercase tracking-widest font-semibold hover:bg-on-surface hover:text-on-primary transition-colors",
            href: e.href,
            children: e.label
          }
        ) })
      ] }),
      c && /* @__PURE__ */ g("aside", { className: "lg:col-span-4 space-y-stack-lg", children: [
        i && /* @__PURE__ */ d(
          "div",
          {
            className: "bg-surface p-stack-md border border-outline-variant",
            dangerouslySetInnerHTML: { __html: i }
          }
        ),
        a && /* @__PURE__ */ d("div", { dangerouslySetInnerHTML: { __html: a } })
      ] })
    ] })
  ] });
}
function yi({
  post: r,
  bodyHtml: e,
  author: t,
  hero: n,
  primaryTerm: i,
  tags: a,
  site: o
}) {
  var u, p, f, b, m, y;
  const s = ee.getFixedT(te(o.settings.language), "theme-magazine"), l = ((p = (u = r.publishedAt) == null ? void 0 : u.toMillis) == null ? void 0 : p.call(u)) ?? ((b = (f = r.updatedAt) == null ? void 0 : f.toMillis) == null ? void 0 : b.call(f)) ?? ((y = (m = r.createdAt) == null ? void 0 : m.toMillis) == null ? void 0 : y.call(m));
  let c;
  if (l)
    try {
      c = new Intl.DateTimeFormat(o.settings.language || "en", {
        month: "long",
        day: "numeric",
        year: "numeric"
      }).format(new Date(l));
    } catch {
      c = new Date(l).toDateString();
    }
  const h = t != null && t.avatar ? Y(t.avatar, "small") : "";
  return /* @__PURE__ */ g("article", { className: "w-full", children: [
    /* @__PURE__ */ g("header", { className: "max-w-container-max mx-auto px-margin-mobile lg:px-gutter mb-stack-lg pt-stack-lg", children: [
      /* @__PURE__ */ g("div", { className: "max-w-3xl mx-auto text-center", children: [
        i && /* @__PURE__ */ d(
          "a",
          {
            href: `/${Et(i)}`,
            className: "inline-block text-secondary uppercase tracking-widest text-xs font-semibold mb-stack-sm",
            children: i.name
          }
        ),
        /* @__PURE__ */ d("h1", { className: "font-serif text-4xl md:text-6xl font-semibold text-primary leading-[1.05] mb-stack-md", children: r.title }),
        r.excerpt && /* @__PURE__ */ d("p", { className: "font-serif text-xl md:text-2xl text-on-surface-variant italic font-light", children: r.excerpt }),
        (t || c) && /* @__PURE__ */ g("div", { className: "flex items-center justify-center flex-wrap gap-stack-md py-stack-md mt-stack-md border-y border-outline-variant text-sm text-on-surface-variant", children: [
          t && /* @__PURE__ */ g("div", { className: "flex items-center gap-2", children: [
            /* @__PURE__ */ d("div", { className: "w-8 h-8 rounded-full bg-surface-container-high overflow-hidden shrink-0", children: h && /* @__PURE__ */ d(
              "img",
              {
                src: h,
                alt: t.displayName,
                className: "w-full h-full object-cover"
              }
            ) }),
            /* @__PURE__ */ d("span", { className: "font-semibold text-on-surface", children: t.displayName })
          ] }),
          t && c && /* @__PURE__ */ d("span", { className: "h-4 w-px bg-outline-variant", "aria-hidden": "true" }),
          c && /* @__PURE__ */ d("time", { children: c })
        ] })
      ] }),
      n && /* @__PURE__ */ g("figure", { className: "mt-stack-lg max-w-container-max mx-auto", children: [
        /* @__PURE__ */ d("div", { className: "aspect-video md:aspect-[21/9] overflow-hidden bg-surface-container-high rounded-lg", children: /* @__PURE__ */ d(
          "img",
          {
            src: Y(n, "large"),
            alt: n.alt ?? "",
            className: "w-full h-full object-cover",
            fetchPriority: "high"
          }
        ) }),
        n.caption && /* @__PURE__ */ d("figcaption", { className: "text-right text-sm text-on-surface-variant mt-stack-sm", children: n.caption })
      ] })
    ] }),
    /* @__PURE__ */ g("div", { className: "max-w-container-max mx-auto px-margin-mobile lg:px-gutter grid grid-cols-1 lg:grid-cols-12 gap-gutter items-start", children: [
      /* @__PURE__ */ g("div", { className: "lg:col-span-7 lg:col-start-2 max-w-2xl", children: [
        /* @__PURE__ */ d(
          "div",
          {
            className: "magazine-prose magazine-prose-drop-cap",
            dangerouslySetInnerHTML: { __html: e }
          }
        ),
        a.length > 0 && /* @__PURE__ */ d("ul", { className: "mt-stack-lg pt-stack-md border-t border-outline-variant flex flex-wrap gap-2", children: a.map((w) => /* @__PURE__ */ d(
          "li",
          {
            className: "px-3 py-1 bg-surface-container text-on-surface-variant text-xs uppercase tracking-wider rounded-full",
            children: w.name
          },
          w.id
        )) })
      ] }),
      /* @__PURE__ */ g("aside", { className: "lg:col-span-4 lg:col-start-9 space-y-section-gap pt-stack-sm", children: [
        r.authorId && /* @__PURE__ */ d(
          "section",
          {
            className: "p-6 bg-surface-container-low border border-outline-variant rounded-lg",
            "data-cms-author-bio": !0,
            "data-cms-author-id": r.authorId,
            hidden: !0
          }
        ),
        /* @__PURE__ */ d(
          "section",
          {
            "data-cms-related": !0,
            "data-cms-current-id": r.id,
            "data-cms-term-id": r.primaryTermId ?? "",
            "data-cms-limit": "3",
            "data-cms-label": s("publicBaked.relatedFromSite", { site: o.settings.title }),
            "data-cms-fallback-label": s("publicBaked.relatedFromSite", { site: o.settings.title })
          }
        )
      ] })
    ] })
  ] });
}
function wi({
  term: r,
  posts: e,
  categoryRssUrl: t,
  archivesLink: n,
  allCategories: i,
  popularTags: a,
  site: o
}) {
  const s = ee.getFixedT(te(o.settings.language), "theme-magazine");
  return /* @__PURE__ */ g("div", { className: "max-w-container-max mx-auto px-margin-mobile lg:px-gutter", children: [
    /* @__PURE__ */ g(
      "nav",
      {
        className: "flex items-center gap-2 mb-stack-sm text-on-surface-variant text-xs uppercase tracking-widest",
        "aria-label": "Breadcrumb",
        children: [
          /* @__PURE__ */ d("a", { className: "hover:text-primary transition-colors", href: o.homePath ?? "/index.html", children: s("publicBaked.home") }),
          /* @__PURE__ */ d("span", { className: "material-symbols-outlined text-base", "aria-hidden": "true", children: "chevron_right" }),
          /* @__PURE__ */ d("span", { children: s("publicBaked.categories") }),
          /* @__PURE__ */ d("span", { className: "material-symbols-outlined text-base", "aria-hidden": "true", children: "chevron_right" }),
          /* @__PURE__ */ d("span", { className: "text-primary font-bold", children: r.name })
        ]
      }
    ),
    /* @__PURE__ */ g("header", { className: "mb-stack-lg flex items-end justify-between gap-stack-md flex-wrap", children: [
      /* @__PURE__ */ g("div", { className: "border-l-4 border-primary pl-stack-md", children: [
        /* @__PURE__ */ d("h1", { className: "font-serif text-5xl md:text-6xl text-primary mb-stack-sm", children: r.name }),
        r.description && /* @__PURE__ */ d("p", { className: "text-lg text-on-surface-variant max-w-2xl", children: r.description })
      ] }),
      t && /* @__PURE__ */ g(
        "a",
        {
          href: t,
          className: "inline-flex items-center gap-2 px-stack-md py-2 border border-on-surface text-xs uppercase tracking-widest font-semibold hover:bg-on-surface hover:text-on-primary transition-colors",
          "aria-label": s("publicBaked.follow404", { name: r.name }),
          children: [
            /* @__PURE__ */ d("span", { className: "material-symbols-outlined text-base", children: "rss_feed" }),
            s("publicBaked.follow")
          ]
        }
      )
    ] }),
    /* @__PURE__ */ g("div", { className: "grid grid-cols-1 lg:grid-cols-12 gap-gutter", children: [
      /* @__PURE__ */ d("aside", { className: "lg:col-span-3", children: /* @__PURE__ */ g("div", { className: "sticky top-28 bg-surface border border-outline-variant rounded p-stack-md", children: [
        /* @__PURE__ */ d("h2", { className: "font-serif text-xl text-primary mb-stack-md", children: s("publicBaked.sections") }),
        i && i.length > 0 && /* @__PURE__ */ d("nav", { className: "flex flex-col gap-1", children: i.map((l) => {
          const c = l.id === r.id;
          return /* @__PURE__ */ d(
            "a",
            {
              href: `/${Et(l)}`,
              className: "block py-2 px-stack-md rounded text-base transition-colors " + (c ? "bg-surface-container text-primary font-bold" : "text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface"),
              children: l.name
            },
            l.id
          );
        }) }),
        a && a.length > 0 && /* @__PURE__ */ g("div", { className: "mt-stack-lg pt-stack-md border-t border-outline-variant", children: [
          /* @__PURE__ */ d("h3", { className: "text-xs uppercase tracking-widest text-on-surface-variant font-semibold mb-stack-sm", children: s("publicBaked.popularTags") }),
          /* @__PURE__ */ d("div", { className: "flex flex-wrap gap-2", children: a.map((l) => /* @__PURE__ */ d(
            "span",
            {
              className: "px-3 py-1 bg-surface-container text-on-surface-variant text-xs uppercase tracking-wider rounded-full",
              children: l.name
            },
            l.id
          )) })
        ] })
      ] }) }),
      /* @__PURE__ */ g("div", { className: "lg:col-span-9", children: [
        e.length === 0 ? /* @__PURE__ */ d("p", { className: "text-on-surface-variant", children: s("publicBaked.noPostsCategory") }) : /* @__PURE__ */ d("ul", { className: "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-gutter", children: e.map((l) => /* @__PURE__ */ d("li", { children: /* @__PURE__ */ g("a", { href: `/${l.url}`, className: "group block", children: [
          l.hero && /* @__PURE__ */ d("div", { className: "aspect-[4/3] overflow-hidden bg-surface-container mb-stack-md", children: /* @__PURE__ */ d(
            "img",
            {
              src: Y(l.hero, "medium"),
              alt: l.hero.alt ?? "",
              className: "w-full h-full object-cover transition-transform duration-700 group-hover:scale-105",
              loading: "lazy"
            }
          ) }),
          /* @__PURE__ */ g("div", { className: "space-y-2", children: [
            l.category && /* @__PURE__ */ d("span", { className: "block text-secondary uppercase tracking-widest text-xs font-semibold", children: l.category.name }),
            /* @__PURE__ */ d("h3", { className: "font-serif text-xl font-medium text-primary group-hover:text-secondary transition-colors", children: l.title }),
            l.excerpt && /* @__PURE__ */ d("p", { className: "text-base text-on-surface-variant line-clamp-3", children: l.excerpt })
          ] })
        ] }) }, l.id)) }),
        n && /* @__PURE__ */ d("p", { className: "mt-stack-lg", children: /* @__PURE__ */ d("a", { className: "text-secondary hover:underline", href: n.href, children: n.label }) })
      ] })
    ] })
  ] });
}
function xi({
  author: r,
  posts: e,
  site: t
}) {
  const n = ee.getFixedT(te(t.settings.language), "theme-magazine"), i = r.avatar ? Y(r.avatar, "small") : "", a = e.reduce((u, p) => {
    var b, m, y, w;
    const f = ((m = (b = p.publishedAt) == null ? void 0 : b.toMillis) == null ? void 0 : m.call(b)) ?? ((w = (y = p.createdAt) == null ? void 0 : y.toMillis) == null ? void 0 : w.call(y)) ?? null;
    return f == null ? u : u == null || f < u ? f : u;
  }, null);
  let o;
  if (a != null)
    try {
      o = new Intl.DateTimeFormat(t.settings.language || "en", {
        month: "short",
        year: "numeric"
      }).format(new Date(a));
    } catch {
      o = new Date(a).toDateString();
    }
  const [s, l, c, ...h] = e;
  return /* @__PURE__ */ g("div", { className: "max-w-container-max mx-auto px-margin-mobile lg:px-gutter", children: [
    /* @__PURE__ */ g("section", { className: "mb-stack-lg grid grid-cols-1 md:grid-cols-12 gap-stack-md items-start", children: [
      /* @__PURE__ */ g("div", { className: "md:col-span-8 space-y-stack-md", children: [
        /* @__PURE__ */ g("div", { className: "flex items-center gap-stack-md", children: [
          /* @__PURE__ */ d("div", { className: "w-24 h-24 md:w-32 md:h-32 rounded-full overflow-hidden border border-outline-variant bg-surface-container shrink-0", children: i && /* @__PURE__ */ d(
            "img",
            {
              src: i,
              alt: r.displayName,
              className: "w-full h-full object-cover"
            }
          ) }),
          /* @__PURE__ */ g("div", { children: [
            /* @__PURE__ */ d("span", { className: "block text-secondary uppercase tracking-widest text-xs font-semibold mb-1", children: n("publicBaked.author") }),
            /* @__PURE__ */ d("h1", { className: "font-serif text-4xl md:text-6xl text-primary", children: r.displayName }),
            r.title && /* @__PURE__ */ d("p", { className: "font-sans text-xs uppercase tracking-widest font-semibold text-secondary mt-stack-sm", children: r.title })
          ] })
        ] }),
        r.bio && /* @__PURE__ */ d("p", { className: "text-lg text-on-surface-variant max-w-2xl leading-relaxed", children: r.bio }),
        r.socials && r.socials.length > 0 && /* @__PURE__ */ d("div", { className: "flex gap-stack-md text-on-surface-variant", children: r.socials.map((u) => /* @__PURE__ */ d(
          "a",
          {
            href: u.url,
            target: "_blank",
            rel: "noopener noreferrer",
            "aria-label": Gt(u.network),
            title: Gt(u.network),
            className: "hover:text-primary transition-colors",
            children: /* @__PURE__ */ d(Kr, { network: u.network, size: 20 })
          },
          u.network
        )) })
      ] }),
      /* @__PURE__ */ g("div", { className: "md:col-span-4 grid grid-cols-2 gap-stack-sm", children: [
        /* @__PURE__ */ g("div", { className: "bg-surface-container-low p-stack-md flex flex-col justify-center border border-outline-variant", children: [
          /* @__PURE__ */ d("span", { className: "text-on-surface-variant uppercase tracking-widest text-xs font-semibold", children: n("publicBaked.recentPublications") }),
          /* @__PURE__ */ d("span", { className: "font-serif text-4xl text-primary", children: e.length })
        ] }),
        o && /* @__PURE__ */ g("div", { className: "bg-surface-container-low p-stack-md flex flex-col justify-center border border-outline-variant", children: [
          /* @__PURE__ */ d("span", { className: "text-on-surface-variant uppercase tracking-widest text-xs font-semibold", children: n("publicBaked.author") }),
          /* @__PURE__ */ d("span", { className: "font-serif text-xl text-primary", children: o })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ d("div", { className: "flex justify-between items-end border-b border-outline-variant pb-stack-sm mb-stack-lg", children: /* @__PURE__ */ d("h2", { className: "font-serif text-2xl text-primary", children: n("publicBaked.recentPublications") }) }),
    e.length === 0 ? /* @__PURE__ */ d("p", { className: "text-on-surface-variant", children: n("publicBaked.noPostsAuthor") }) : /* @__PURE__ */ g(Je, { children: [
      /* @__PURE__ */ g("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-stack-md mb-stack-lg", children: [
        s && /* @__PURE__ */ d("article", { className: "md:col-span-2 group", children: /* @__PURE__ */ g("a", { href: `/${s.url}`, className: "block space-y-stack-sm", children: [
          s.hero && /* @__PURE__ */ d("div", { className: "aspect-video overflow-hidden bg-surface-container", children: /* @__PURE__ */ d(
            "img",
            {
              src: Y(s.hero, "large"),
              alt: s.hero.alt ?? "",
              className: "w-full h-full object-cover transition-transform duration-500 group-hover:scale-105",
              loading: "lazy"
            }
          ) }),
          /* @__PURE__ */ g("div", { className: "space-y-2", children: [
            s.category && /* @__PURE__ */ d("span", { className: "block text-secondary uppercase tracking-widest text-xs font-semibold", children: s.category.name }),
            /* @__PURE__ */ d("h3", { className: "font-serif text-3xl md:text-4xl font-medium text-primary leading-tight group-hover:underline decoration-1", children: s.title }),
            s.excerpt && /* @__PURE__ */ d("p", { className: "text-base text-on-surface-variant line-clamp-2", children: s.excerpt })
          ] })
        ] }) }),
        [l, c].filter(Boolean).map((u) => /* @__PURE__ */ d("article", { className: "group", children: /* @__PURE__ */ g("a", { href: `/${u.url}`, className: "block space-y-stack-sm", children: [
          u.hero && /* @__PURE__ */ d("div", { className: "aspect-square overflow-hidden bg-surface-container", children: /* @__PURE__ */ d(
            "img",
            {
              src: Y(u.hero, "medium"),
              alt: u.hero.alt ?? "",
              className: "w-full h-full object-cover transition-transform duration-500 group-hover:scale-105",
              loading: "lazy"
            }
          ) }),
          /* @__PURE__ */ g("div", { className: "space-y-2", children: [
            u.category && /* @__PURE__ */ d("span", { className: "block text-secondary uppercase tracking-widest text-xs font-semibold", children: u.category.name }),
            /* @__PURE__ */ d("h3", { className: "font-serif text-xl font-medium text-primary group-hover:underline decoration-1", children: u.title })
          ] })
        ] }) }, u.id))
      ] }),
      h.length > 0 && /* @__PURE__ */ d("ul", { className: "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-gutter", children: h.map((u) => /* @__PURE__ */ d("li", { children: /* @__PURE__ */ g("a", { href: `/${u.url}`, className: "group block", children: [
        u.hero && /* @__PURE__ */ d("div", { className: "aspect-[4/3] overflow-hidden bg-surface-container mb-stack-md", children: /* @__PURE__ */ d(
          "img",
          {
            src: Y(u.hero, "medium"),
            alt: u.hero.alt ?? "",
            className: "w-full h-full object-cover transition-transform duration-700 group-hover:scale-105",
            loading: "lazy"
          }
        ) }),
        /* @__PURE__ */ g("div", { className: "space-y-2", children: [
          u.category && /* @__PURE__ */ d("span", { className: "block text-secondary uppercase tracking-widest text-xs font-semibold", children: u.category.name }),
          /* @__PURE__ */ d("h3", { className: "font-serif text-xl font-medium text-primary group-hover:text-secondary transition-colors", children: u.title })
        ] })
      ] }) }, u.id)) })
    ] })
  ] });
}
function vi({
  message: r,
  site: e
}) {
  const t = ee.getFixedT(te(e.settings.language), "theme-magazine");
  return /* @__PURE__ */ g("div", { className: "max-w-container-max mx-auto px-margin-mobile lg:px-gutter min-h-[60vh] flex flex-col items-center justify-center text-center py-stack-lg", children: [
    /* @__PURE__ */ d("p", { className: "text-secondary uppercase tracking-widest text-xs font-semibold mb-stack-sm", children: t("publicBaked.notFoundTitle") }),
    /* @__PURE__ */ d("h1", { className: "font-serif text-6xl md:text-7xl font-semibold text-primary leading-[1.05] mb-stack-md", children: t("publicBaked.notFoundMessage") }),
    r && /* @__PURE__ */ d("p", { className: "text-lg text-on-surface-variant max-w-2xl mb-stack-lg", children: r }),
    /* @__PURE__ */ d(
      "a",
      {
        href: "/index.html",
        className: "inline-block px-stack-lg py-stack-sm border border-on-surface text-xs uppercase tracking-widest font-semibold hover:bg-on-surface hover:text-on-primary transition-colors",
        children: t("publicBaked.backToHome")
      }
    )
  ] });
}
const tn = '@import"https://fonts.googleapis.com/css2?family=Newsreader:ital,wght@0,400;0,500;0,600;0,700;0,800;1,400&family=Work+Sans:wght@400;500;600;700&display=swap";@import"https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@24,400,0,0&display=swap";*,:after,:before{--tw-border-spacing-x:0;--tw-border-spacing-y:0;--tw-translate-x:0;--tw-translate-y:0;--tw-rotate:0;--tw-skew-x:0;--tw-skew-y:0;--tw-scale-x:1;--tw-scale-y:1;--tw-pan-x: ;--tw-pan-y: ;--tw-pinch-zoom: ;--tw-scroll-snap-strictness:proximity;--tw-gradient-from-position: ;--tw-gradient-via-position: ;--tw-gradient-to-position: ;--tw-ordinal: ;--tw-slashed-zero: ;--tw-numeric-figure: ;--tw-numeric-spacing: ;--tw-numeric-fraction: ;--tw-ring-inset: ;--tw-ring-offset-width:0px;--tw-ring-offset-color:#fff;--tw-ring-color:rgba(59,130,246,.5);--tw-ring-offset-shadow:0 0 #0000;--tw-ring-shadow:0 0 #0000;--tw-shadow:0 0 #0000;--tw-shadow-colored:0 0 #0000;--tw-blur: ;--tw-brightness: ;--tw-contrast: ;--tw-grayscale: ;--tw-hue-rotate: ;--tw-invert: ;--tw-saturate: ;--tw-sepia: ;--tw-drop-shadow: ;--tw-backdrop-blur: ;--tw-backdrop-brightness: ;--tw-backdrop-contrast: ;--tw-backdrop-grayscale: ;--tw-backdrop-hue-rotate: ;--tw-backdrop-invert: ;--tw-backdrop-opacity: ;--tw-backdrop-saturate: ;--tw-backdrop-sepia: ;--tw-contain-size: ;--tw-contain-layout: ;--tw-contain-paint: ;--tw-contain-style: }::backdrop{--tw-border-spacing-x:0;--tw-border-spacing-y:0;--tw-translate-x:0;--tw-translate-y:0;--tw-rotate:0;--tw-skew-x:0;--tw-skew-y:0;--tw-scale-x:1;--tw-scale-y:1;--tw-pan-x: ;--tw-pan-y: ;--tw-pinch-zoom: ;--tw-scroll-snap-strictness:proximity;--tw-gradient-from-position: ;--tw-gradient-via-position: ;--tw-gradient-to-position: ;--tw-ordinal: ;--tw-slashed-zero: ;--tw-numeric-figure: ;--tw-numeric-spacing: ;--tw-numeric-fraction: ;--tw-ring-inset: ;--tw-ring-offset-width:0px;--tw-ring-offset-color:#fff;--tw-ring-color:rgba(59,130,246,.5);--tw-ring-offset-shadow:0 0 #0000;--tw-ring-shadow:0 0 #0000;--tw-shadow:0 0 #0000;--tw-shadow-colored:0 0 #0000;--tw-blur: ;--tw-brightness: ;--tw-contrast: ;--tw-grayscale: ;--tw-hue-rotate: ;--tw-invert: ;--tw-saturate: ;--tw-sepia: ;--tw-drop-shadow: ;--tw-backdrop-blur: ;--tw-backdrop-brightness: ;--tw-backdrop-contrast: ;--tw-backdrop-grayscale: ;--tw-backdrop-hue-rotate: ;--tw-backdrop-invert: ;--tw-backdrop-opacity: ;--tw-backdrop-saturate: ;--tw-backdrop-sepia: ;--tw-contain-size: ;--tw-contain-layout: ;--tw-contain-paint: ;--tw-contain-style: }/*! tailwindcss v3.4.19 | MIT License | https://tailwindcss.com*/*,:after,:before{box-sizing:border-box;border:0 solid #e5e7eb}:after,:before{--tw-content:""}:host,html{line-height:1.5;-webkit-text-size-adjust:100%;-moz-tab-size:4;-o-tab-size:4;tab-size:4;font-family:var(--font-sans),Work Sans,system-ui,sans-serif;font-feature-settings:normal;font-variation-settings:normal;-webkit-tap-highlight-color:transparent}body{margin:0;line-height:inherit}hr{height:0;color:inherit;border-top-width:1px}abbr:where([title]){-webkit-text-decoration:underline dotted;text-decoration:underline dotted}h1,h2,h3,h4,h5,h6{font-size:inherit;font-weight:inherit}a{color:inherit;text-decoration:inherit}b,strong{font-weight:bolder}code,kbd,pre,samp{font-family:ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,Liberation Mono,Courier New,monospace;font-feature-settings:normal;font-variation-settings:normal;font-size:1em}small{font-size:80%}sub,sup{font-size:75%;line-height:0;position:relative;vertical-align:baseline}sub{bottom:-.25em}sup{top:-.5em}table{text-indent:0;border-color:inherit;border-collapse:collapse}button,input,optgroup,select,textarea{font-family:inherit;font-feature-settings:inherit;font-variation-settings:inherit;font-size:100%;font-weight:inherit;line-height:inherit;letter-spacing:inherit;color:inherit;margin:0;padding:0}button,select{text-transform:none}button,input:where([type=button]),input:where([type=reset]),input:where([type=submit]){-webkit-appearance:button;background-color:transparent;background-image:none}:-moz-focusring{outline:auto}:-moz-ui-invalid{box-shadow:none}progress{vertical-align:baseline}::-webkit-inner-spin-button,::-webkit-outer-spin-button{height:auto}[type=search]{-webkit-appearance:textfield;outline-offset:-2px}::-webkit-search-decoration{-webkit-appearance:none}::-webkit-file-upload-button{-webkit-appearance:button;font:inherit}summary{display:list-item}blockquote,dd,dl,figure,h1,h2,h3,h4,h5,h6,hr,p,pre{margin:0}fieldset{margin:0}fieldset,legend{padding:0}menu,ol,ul{list-style:none;margin:0;padding:0}dialog{padding:0}textarea{resize:vertical}input::-moz-placeholder,textarea::-moz-placeholder{opacity:1;color:#9ca3af}input::placeholder,textarea::placeholder{opacity:1;color:#9ca3af}[role=button],button{cursor:pointer}:disabled{cursor:default}audio,canvas,embed,iframe,img,object,svg,video{display:block;vertical-align:middle}img,video{max-width:100%;height:auto}[hidden]:where(:not([hidden=until-found])){display:none}:root{--color-primary:0 0 0;--color-on-primary:255 255 255;--color-primary-container:28 27 27;--color-on-primary-container:133 131 131;--color-secondary:67 97 124;--color-background:248 249 250;--color-surface:248 249 250;--color-surface-container-low:243 244 245;--color-surface-container:237 238 239;--color-surface-container-high:231 232 233;--color-on-surface:25 28 29;--color-on-surface-variant:68 71 72;--color-outline:116 120 120;--color-outline-variant:196 199 199;--font-serif:"Newsreader";--font-sans:"Work Sans"}body{background-color:rgb(var(--color-background));color:rgb(var(--color-on-surface));font-family:var(--font-sans),system-ui,sans-serif}.container{width:100%}@media(min-width:640px){.container{max-width:640px}}@media(min-width:768px){.container{max-width:768px}}@media(min-width:1024px){.container{max-width:1024px}}@media(min-width:1280px){.container{max-width:1280px}}@media(min-width:1536px){.container{max-width:1536px}}.drop-cap:first-letter,.magazine-prose-drop-cap>p:first-of-type:first-letter{float:left;font-family:var(--font-serif),Georgia,serif;font-size:5rem;line-height:.8;padding-top:.25rem;padding-right:.75rem;font-weight:800}.magazine-prose{font-size:1.125rem;line-height:1.7;color:rgb(var(--color-on-surface))}.magazine-prose>p{margin-bottom:1.5rem}.magazine-prose>h2{font-size:1.75rem;line-height:1.3;color:rgb(var(--color-primary));margin-top:2rem;margin-bottom:1rem}.magazine-prose>h2,.magazine-prose>h3{font-family:var(--font-serif),Georgia,serif;font-weight:500}.magazine-prose>h3{font-size:1.375rem;line-height:1.4;margin-top:1.5rem;margin-bottom:.75rem}.magazine-prose>blockquote{margin:2rem 0;border-left:4px solid rgb(var(--color-secondary));padding-left:2rem;font-style:italic;font-family:var(--font-serif),Georgia,serif;font-size:1.5rem;line-height:1.4;color:rgb(var(--color-primary))}.magazine-prose>ol,.magazine-prose>ul{padding-left:1.5rem;margin-bottom:1.5rem}.magazine-prose>ul{list-style-type:disc}.magazine-prose>ol{list-style-type:decimal}.magazine-prose>ol>li,.magazine-prose>ul>li{margin-bottom:.5rem}.magazine-prose figure img,.magazine-prose img{border-radius:.5rem;margin:1.5rem 0}.magazine-prose a{color:rgb(var(--color-secondary));text-decoration:underline;text-decoration-thickness:1px;text-underline-offset:2px}.burger-toggle{background:transparent;border:0;cursor:pointer;padding:.25rem;line-height:0}.burger-menu{position:fixed;top:0;left:0;height:100vh;width:min(360px,80vw);background:rgb(var(--color-background));border-right:1px solid rgb(var(--color-outline-variant));transform:translate(-100%);transition:transform .25s ease;z-index:60;padding:4rem 1.5rem 1.5rem;overflow-y:auto}.burger-menu.is-open{transform:translate(0)}.burger-menu ul{list-style:none;padding:0;margin:0;display:flex;flex-direction:column;gap:.5rem}.burger-menu a{display:block;padding:.5rem 0;color:rgb(var(--color-on-surface));font-family:var(--font-serif),Georgia,serif;font-size:1.5rem;text-decoration:none}.burger-menu a:hover{color:rgb(var(--color-secondary))}.burger-menu a[aria-current=page]{color:rgb(var(--color-primary));font-weight:600}.burger-menu .menu-children{margin-left:1rem;margin-top:.25rem}.burger-menu .menu-children a{font-size:1rem}.burger-close{position:absolute;top:1rem;right:1rem;background:transparent;border:0;color:rgb(var(--color-on-surface));cursor:pointer;padding:.5rem}.burger-backdrop{position:fixed;top:0;right:0;bottom:0;left:0;background:#0006;opacity:0;pointer-events:none;transition:opacity .25s ease;z-index:55}.burger-backdrop.is-open{opacity:1;pointer-events:auto}body.burger-open{overflow:hidden}.magazine-bio-head{display:flex;align-items:flex-start;gap:1rem;margin-bottom:1rem}.magazine-bio-avatar-wrap{width:4rem;height:4rem;flex-shrink:0;border-radius:.5rem;overflow:hidden;background:rgb(var(--color-surface-container-high));display:flex;align-items:center;justify-content:center}.magazine-bio-avatar-img{width:100%;height:100%;-o-object-fit:cover;object-fit:cover;display:block}.magazine-bio-avatar-initials{font-family:var(--font-sans),system-ui,sans-serif;font-weight:600;font-size:1rem;color:rgb(var(--color-on-surface));letter-spacing:.02em}.magazine-bio-name-wrap{min-width:0;padding-top:.125rem}.magazine-bio-name{font-family:var(--font-serif),Georgia,serif;font-size:1.125rem;font-weight:600;line-height:1.2;color:rgb(var(--color-primary));text-decoration:none;margin:0;display:block}.magazine-bio-role,a.magazine-bio-name:hover{color:rgb(var(--color-secondary))}.magazine-bio-role{font-family:var(--font-sans),system-ui,sans-serif;font-size:.625rem;font-weight:600;text-transform:uppercase;letter-spacing:.1em;margin:.25rem 0 0}.magazine-bio-text{font-size:.875rem;line-height:1.6;color:rgb(var(--color-on-surface-variant));margin:0 0 1rem}.magazine-bio-socials{display:flex;gap:.75rem}.magazine-bio-social-link{color:rgb(var(--color-on-surface-variant));line-height:0;transition:color .15s ease}.magazine-bio-social-link:hover{color:rgb(var(--color-primary))}.magazine-bio-social-link svg{width:18px;height:18px;display:block}.magazine-related-heading{font-family:var(--font-sans),system-ui,sans-serif;font-size:.6875rem;font-weight:600;text-transform:uppercase;letter-spacing:.2em;color:rgb(var(--color-on-surface-variant));margin:0 0 1.5rem}.magazine-related-list{display:flex;flex-direction:column}.magazine-related-link{display:block;padding:1.25rem 0;border-top:1px solid rgb(var(--color-outline-variant));text-decoration:none;color:inherit}.magazine-related-link:first-child{border-top:0;padding-top:0}.magazine-related-eyebrow,.magazine-related-link:hover .magazine-related-title{color:rgb(var(--color-secondary))}.magazine-related-eyebrow{display:block;font-family:var(--font-sans),system-ui,sans-serif;font-size:.625rem;font-weight:600;text-transform:uppercase;letter-spacing:.1em;margin-bottom:.5rem}.magazine-related-title{font-family:var(--font-serif),Georgia,serif;font-size:1rem;font-weight:500;line-height:1.3;color:rgb(var(--color-on-surface));margin:0;transition:color .15s ease}.magazine-related-date{display:block;font-family:var(--font-sans),system-ui,sans-serif;font-size:.6875rem;color:rgb(var(--color-on-surface-variant));margin-top:.5rem}.material-symbols-outlined{font-family:Material Symbols Outlined,sans-serif;font-weight:400;font-style:normal;line-height:1;letter-spacing:normal;text-transform:none;display:inline-block;white-space:nowrap;word-wrap:normal;direction:ltr;-webkit-font-feature-settings:"liga";font-variation-settings:"FILL" 0,"wght" 400,"GRAD" 0,"opsz" 24}.archives{max-width:1280px;margin:0 auto;padding:80px 24px}.archives__header{margin-bottom:2.5rem}.archives__back{margin:0 0 .75rem;font-family:var(--font-sans),system-ui,sans-serif;font-size:.6875rem;font-weight:600;text-transform:uppercase;letter-spacing:.1em}.archives__back a{color:rgb(var(--color-on-surface-variant));text-decoration:none}.archives__back a:hover{color:rgb(var(--color-secondary))}.archives__title{font-family:var(--font-serif),Georgia,serif;font-weight:600;font-size:clamp(2rem,5vw,3.75rem);line-height:1.05;margin:0 0 .5rem;color:rgb(var(--color-primary));letter-spacing:-.02em}.archives__subtitle{margin:0;font-size:1.125rem}.archives__empty,.archives__subtitle{color:rgb(var(--color-on-surface-variant))}.archives__empty{font-style:italic}.archives__years{list-style:none;margin:0;padding:0;display:flex;flex-direction:column}.archives__year{border-top:1px solid rgb(var(--color-outline-variant));padding:1.5rem 0}.archives__year:first-child{border-top:0;padding-top:0}.archives__year-heading{font-family:var(--font-serif),Georgia,serif;font-weight:500;font-size:1.75rem;line-height:1.3;margin:0 0 .75rem;display:flex;align-items:baseline;gap:.5rem;color:rgb(var(--color-on-surface))}.archives__drilldown-link,.archives__group-link,.archives__item-link,.archives__year-link{color:rgb(var(--color-on-surface));text-decoration:none;border-bottom:1px solid transparent;transition:border-color .15s ease,color .15s ease}.archives__drilldown-link:hover,.archives__group-link:hover,.archives__item-link:hover,.archives__year-link:hover{color:rgb(var(--color-secondary));border-bottom-color:currentColor}.archives__count{color:rgb(var(--color-on-surface-variant));font-family:var(--font-sans),system-ui,sans-serif;font-size:.875rem;font-weight:400}.archives__drilldown{list-style:none;margin:0;padding:0;display:flex;flex-wrap:wrap;gap:.5rem 1.5rem}.archives__drilldown-item{display:inline-flex;align-items:baseline;gap:.35rem;font-family:var(--font-sans),system-ui,sans-serif;font-size:.95rem}.archives__list{list-style:none;margin:0;padding:0;display:flex;flex-direction:column}.archives__item{display:flex;align-items:baseline;justify-content:space-between;gap:1.5rem;padding:.75rem 0;border-bottom:1px solid rgb(var(--color-outline-variant))}.archives__item:last-child{border-bottom:0}.archives__item-link{flex:1;font-family:var(--font-serif),Georgia,serif;font-size:1.0625rem;line-height:1.4}.archives__item-date{color:rgb(var(--color-on-surface-variant));font-family:var(--font-sans),system-ui,sans-serif;font-size:.75rem;text-transform:uppercase;letter-spacing:.05em;white-space:nowrap}.archives__groups{display:flex;flex-direction:column;gap:2.5rem}.archives__group-heading{font-family:var(--font-serif),Georgia,serif;font-weight:500;font-size:1.25rem;margin:0 0 .75rem;display:flex;align-items:baseline;gap:.5rem;color:rgb(var(--color-on-surface))}.archives-link{margin:3rem 0 0;text-align:right;font-family:var(--font-sans),system-ui,sans-serif;font-size:.95rem}.archives-link a{color:rgb(var(--color-secondary));text-decoration:none;border-bottom:1px solid;padding-bottom:.1rem}.archives-link a:hover{color:rgb(var(--color-on-surface))}.invisible{visibility:hidden}.static{position:static}.fixed{position:fixed}.absolute{position:absolute}.relative{position:relative}.sticky{position:sticky}.inset-0{top:0;right:0;bottom:0;left:0}.left-0{left:0}.left-1\\/2{left:50%}.left-4{left:1rem}.right-0{right:0}.top-0{top:0}.top-28{top:7rem}.top-4{top:1rem}.z-50{z-index:50}.col-span-2{grid-column:span 2/span 2}.mx-auto{margin-left:auto;margin-right:auto}.my-4{margin-top:1rem;margin-bottom:1rem}.-mb-px{margin-bottom:-1px}.mb-1{margin-bottom:.25rem}.mb-2{margin-bottom:.5rem}.mb-stack-lg{margin-bottom:48px}.mb-stack-md{margin-bottom:24px}.mb-stack-sm{margin-bottom:8px}.mt-1{margin-top:.25rem}.mt-2{margin-top:.5rem}.mt-section-gap{margin-top:80px}.mt-stack-lg{margin-top:48px}.mt-stack-md{margin-top:24px}.mt-stack-sm{margin-top:8px}.line-clamp-2{-webkit-line-clamp:2}.line-clamp-2,.line-clamp-3{overflow:hidden;display:-webkit-box;-webkit-box-orient:vertical}.line-clamp-3{-webkit-line-clamp:3}.block{display:block}.inline-block{display:inline-block}.inline{display:inline}.flex{display:flex}.inline-flex{display:inline-flex}.grid{display:grid}.hidden{display:none}.aspect-\\[16\\/9\\]{aspect-ratio:16/9}.aspect-\\[4\\/3\\]{aspect-ratio:4/3}.aspect-square{aspect-ratio:1/1}.aspect-video{aspect-ratio:16/9}.h-20{height:5rem}.h-24{height:6rem}.h-3{height:.75rem}.h-4{height:1rem}.h-5{height:1.25rem}.h-8{height:2rem}.h-full{height:100%}.min-h-\\[60vh\\]{min-height:60vh}.w-12{width:3rem}.w-24{width:6rem}.w-3{width:.75rem}.w-4{width:1rem}.w-40{width:10rem}.w-5{width:1.25rem}.w-8{width:2rem}.w-auto{width:auto}.w-full{width:100%}.w-px{width:1px}.min-w-0{min-width:0}.max-w-2xl{max-width:42rem}.max-w-3xl{max-width:48rem}.max-w-\\[240px\\]{max-width:240px}.max-w-container-max{max-width:1280px}.max-w-none{max-width:none}.max-w-xs{max-width:20rem}.flex-1{flex:1 1 0%}.shrink-0{flex-shrink:0}.-translate-x-1\\/2{--tw-translate-x:-50%}.-translate-x-1\\/2,.transform{transform:translate(var(--tw-translate-x),var(--tw-translate-y)) rotate(var(--tw-rotate)) skew(var(--tw-skew-x)) skewY(var(--tw-skew-y)) scaleX(var(--tw-scale-x)) scaleY(var(--tw-scale-y))}@keyframes spin{to{transform:rotate(1turn)}}.animate-spin{animation:spin 1s linear infinite}.cursor-pointer{cursor:pointer}.grid-cols-1{grid-template-columns:repeat(1,minmax(0,1fr))}.grid-cols-2{grid-template-columns:repeat(2,minmax(0,1fr))}.flex-col{flex-direction:column}.flex-wrap{flex-wrap:wrap}.items-start{align-items:flex-start}.items-end{align-items:flex-end}.items-center{align-items:center}.justify-end{justify-content:flex-end}.justify-center{justify-content:center}.justify-between{justify-content:space-between}.gap-1{gap:.25rem}.gap-2{gap:.5rem}.gap-3{gap:.75rem}.gap-4{gap:1rem}.gap-gutter{gap:24px}.gap-stack-lg{gap:48px}.gap-stack-md{gap:24px}.gap-stack-sm{gap:8px}.-space-x-1>:not([hidden])~:not([hidden]){--tw-space-x-reverse:0;margin-right:calc(-.25rem*var(--tw-space-x-reverse));margin-left:calc(-.25rem*(1 - var(--tw-space-x-reverse)))}.space-y-1>:not([hidden])~:not([hidden]){--tw-space-y-reverse:0;margin-top:calc(.25rem*(1 - var(--tw-space-y-reverse)));margin-bottom:calc(.25rem*var(--tw-space-y-reverse))}.space-y-2>:not([hidden])~:not([hidden]){--tw-space-y-reverse:0;margin-top:calc(.5rem*(1 - var(--tw-space-y-reverse)));margin-bottom:calc(.5rem*var(--tw-space-y-reverse))}.space-y-3>:not([hidden])~:not([hidden]){--tw-space-y-reverse:0;margin-top:calc(.75rem*(1 - var(--tw-space-y-reverse)));margin-bottom:calc(.75rem*var(--tw-space-y-reverse))}.space-y-4>:not([hidden])~:not([hidden]){--tw-space-y-reverse:0;margin-top:calc(1rem*(1 - var(--tw-space-y-reverse)));margin-bottom:calc(1rem*var(--tw-space-y-reverse))}.space-y-6>:not([hidden])~:not([hidden]){--tw-space-y-reverse:0;margin-top:calc(1.5rem*(1 - var(--tw-space-y-reverse)));margin-bottom:calc(1.5rem*var(--tw-space-y-reverse))}.space-y-section-gap>:not([hidden])~:not([hidden]){--tw-space-y-reverse:0;margin-top:calc(80px*(1 - var(--tw-space-y-reverse)));margin-bottom:calc(80px*var(--tw-space-y-reverse))}.space-y-stack-lg>:not([hidden])~:not([hidden]){--tw-space-y-reverse:0;margin-top:calc(48px*(1 - var(--tw-space-y-reverse)));margin-bottom:calc(48px*var(--tw-space-y-reverse))}.space-y-stack-md>:not([hidden])~:not([hidden]){--tw-space-y-reverse:0;margin-top:calc(24px*(1 - var(--tw-space-y-reverse)));margin-bottom:calc(24px*var(--tw-space-y-reverse))}.space-y-stack-sm>:not([hidden])~:not([hidden]){--tw-space-y-reverse:0;margin-top:calc(8px*(1 - var(--tw-space-y-reverse)));margin-bottom:calc(8px*var(--tw-space-y-reverse))}.overflow-hidden,.truncate{overflow:hidden}.truncate{text-overflow:ellipsis;white-space:nowrap}.rounded{border-radius:.125rem}.rounded-full{border-radius:9999px}.rounded-lg{border-radius:.25rem}.border{border-width:1px}.border-y{border-top-width:1px}.border-b,.border-y{border-bottom-width:1px}.border-b-2{border-bottom-width:2px}.border-l-4{border-left-width:4px}.border-t{border-top-width:1px}.border-dashed{border-style:dashed}.border-blue-600{--tw-border-opacity:1;border-color:rgb(37 99 235/var(--tw-border-opacity,1))}.border-on-surface{--tw-border-opacity:1;border-color:rgb(var(--color-on-surface)/var(--tw-border-opacity,1))}.border-outline-variant{--tw-border-opacity:1;border-color:rgb(var(--color-outline-variant)/var(--tw-border-opacity,1))}.border-primary{--tw-border-opacity:1;border-color:rgb(var(--color-primary)/var(--tw-border-opacity,1))}.border-transparent{border-color:transparent}.bg-background{--tw-bg-opacity:1;background-color:rgb(var(--color-background)/var(--tw-bg-opacity,1))}.bg-blue-50{--tw-bg-opacity:1;background-color:rgb(239 246 255/var(--tw-bg-opacity,1))}.bg-outline-variant{--tw-bg-opacity:1;background-color:rgb(var(--color-outline-variant)/var(--tw-bg-opacity,1))}.bg-primary{--tw-bg-opacity:1;background-color:rgb(var(--color-primary)/var(--tw-bg-opacity,1))}.bg-surface{--tw-bg-opacity:1;background-color:rgb(var(--color-surface)/var(--tw-bg-opacity,1))}.bg-surface-container{--tw-bg-opacity:1;background-color:rgb(var(--color-surface-container)/var(--tw-bg-opacity,1))}.bg-surface-container-high{--tw-bg-opacity:1;background-color:rgb(var(--color-surface-container-high)/var(--tw-bg-opacity,1))}.bg-surface-container-low{--tw-bg-opacity:1;background-color:rgb(var(--color-surface-container-low)/var(--tw-bg-opacity,1))}.bg-white{--tw-bg-opacity:1;background-color:rgb(255 255 255/var(--tw-bg-opacity,1))}.bg-gradient-to-t{background-image:linear-gradient(to top,var(--tw-gradient-stops))}.from-primary\\/80{--tw-gradient-from:rgb(var(--color-primary)/.8) var(--tw-gradient-from-position);--tw-gradient-to:rgb(var(--color-primary)/0) var(--tw-gradient-to-position);--tw-gradient-stops:var(--tw-gradient-from),var(--tw-gradient-to)}.via-primary\\/40{--tw-gradient-to:rgb(var(--color-primary)/0) var(--tw-gradient-to-position);--tw-gradient-stops:var(--tw-gradient-from),rgb(var(--color-primary)/.4) var(--tw-gradient-via-position),var(--tw-gradient-to)}.to-transparent{--tw-gradient-to:transparent var(--tw-gradient-to-position)}.object-contain{-o-object-fit:contain;object-fit:contain}.object-cover{-o-object-fit:cover;object-fit:cover}.p-2{padding:.5rem}.p-3{padding:.75rem}.p-4{padding:1rem}.p-6{padding:1.5rem}.p-stack-md{padding:24px}.px-3{padding-left:.75rem;padding-right:.75rem}.px-margin-mobile{padding-left:16px;padding-right:16px}.px-stack-lg{padding-left:48px;padding-right:48px}.px-stack-md{padding-left:24px;padding-right:24px}.py-1{padding-top:.25rem;padding-bottom:.25rem}.py-2{padding-top:.5rem;padding-bottom:.5rem}.py-stack-lg{padding-top:48px;padding-bottom:48px}.py-stack-md{padding-top:24px;padding-bottom:24px}.py-stack-sm{padding-top:8px;padding-bottom:8px}.pb-2{padding-bottom:.5rem}.pb-section-gap{padding-bottom:80px}.pb-stack-sm{padding-bottom:8px}.pl-stack-md{padding-left:24px}.pt-24{padding-top:6rem}.pt-stack-lg{padding-top:48px}.pt-stack-md{padding-top:24px}.pt-stack-sm{padding-top:8px}.text-left{text-align:left}.text-center{text-align:center}.text-right{text-align:right}.font-mono{font-family:ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,Liberation Mono,Courier New,monospace}.font-sans{font-family:var(--font-sans),Work Sans,system-ui,sans-serif}.font-serif{font-family:var(--font-serif),Newsreader,Georgia,serif}.text-2xl{font-size:1.5rem;line-height:2rem}.text-3xl{font-size:1.875rem;line-height:2.25rem}.text-4xl{font-size:2.25rem;line-height:2.5rem}.text-5xl{font-size:3rem;line-height:1}.text-6xl{font-size:3.75rem;line-height:1}.text-base{font-size:1rem;line-height:1.5rem}.text-lg{font-size:1.125rem;line-height:1.75rem}.text-sm{font-size:.875rem;line-height:1.25rem}.text-xl{font-size:1.25rem;line-height:1.75rem}.text-xs{font-size:.75rem;line-height:1rem}.font-black{font-weight:900}.font-bold{font-weight:700}.font-light{font-weight:300}.font-medium{font-weight:500}.font-semibold{font-weight:600}.uppercase{text-transform:uppercase}.italic{font-style:italic}.leading-\\[1\\.05\\]{line-height:1.05}.leading-none{line-height:1}.leading-relaxed{line-height:1.625}.leading-tight{line-height:1.25}.tracking-tight{letter-spacing:-.025em}.tracking-wide{letter-spacing:.025em}.tracking-wider{letter-spacing:.05em}.tracking-widest{letter-spacing:.1em}.text-blue-500{--tw-text-opacity:1;color:rgb(59 130 246/var(--tw-text-opacity,1))}.text-on-primary{--tw-text-opacity:1;color:rgb(var(--color-on-primary)/var(--tw-text-opacity,1))}.text-on-primary\\/70{color:rgb(var(--color-on-primary)/.7)}.text-on-surface{--tw-text-opacity:1;color:rgb(var(--color-on-surface)/var(--tw-text-opacity,1))}.text-on-surface-variant{--tw-text-opacity:1;color:rgb(var(--color-on-surface-variant)/var(--tw-text-opacity,1))}.text-outline-variant{--tw-text-opacity:1;color:rgb(var(--color-outline-variant)/var(--tw-text-opacity,1))}.text-primary{--tw-text-opacity:1;color:rgb(var(--color-primary)/var(--tw-text-opacity,1))}.text-secondary{--tw-text-opacity:1;color:rgb(var(--color-secondary)/var(--tw-text-opacity,1))}.decoration-1{text-decoration-thickness:1px}.outline{outline-style:solid}.ring-1{--tw-ring-offset-shadow:var(--tw-ring-inset) 0 0 0 var(--tw-ring-offset-width) var(--tw-ring-offset-color);--tw-ring-shadow:var(--tw-ring-inset) 0 0 0 calc(1px + var(--tw-ring-offset-width)) var(--tw-ring-color)}.ring-1,.ring-2{box-shadow:var(--tw-ring-offset-shadow),var(--tw-ring-shadow),var(--tw-shadow,0 0 #0000)}.ring-2{--tw-ring-offset-shadow:var(--tw-ring-inset) 0 0 0 var(--tw-ring-offset-width) var(--tw-ring-offset-color);--tw-ring-shadow:var(--tw-ring-inset) 0 0 0 calc(2px + var(--tw-ring-offset-width)) var(--tw-ring-color)}.ring-blue-500\\/60{--tw-ring-color:rgba(59,130,246,.6)}.filter{filter:var(--tw-blur) var(--tw-brightness) var(--tw-contrast) var(--tw-grayscale) var(--tw-hue-rotate) var(--tw-invert) var(--tw-saturate) var(--tw-sepia) var(--tw-drop-shadow)}.transition{transition-property:color,background-color,border-color,text-decoration-color,fill,stroke,opacity,box-shadow,transform,filter,backdrop-filter;transition-timing-function:cubic-bezier(.4,0,.2,1);transition-duration:.15s}.transition-colors{transition-property:color,background-color,border-color,text-decoration-color,fill,stroke;transition-timing-function:cubic-bezier(.4,0,.2,1);transition-duration:.15s}.transition-transform{transition-property:transform;transition-timing-function:cubic-bezier(.4,0,.2,1);transition-duration:.15s}.duration-500{transition-duration:.5s}.duration-700{transition-duration:.7s}.hover\\:bg-on-surface:hover{--tw-bg-opacity:1;background-color:rgb(var(--color-on-surface)/var(--tw-bg-opacity,1))}.hover\\:bg-surface-container-low:hover{--tw-bg-opacity:1;background-color:rgb(var(--color-surface-container-low)/var(--tw-bg-opacity,1))}.hover\\:text-on-primary:hover{--tw-text-opacity:1;color:rgb(var(--color-on-primary)/var(--tw-text-opacity,1))}.hover\\:text-on-surface:hover{--tw-text-opacity:1;color:rgb(var(--color-on-surface)/var(--tw-text-opacity,1))}.hover\\:text-on-surface-variant:hover{--tw-text-opacity:1;color:rgb(var(--color-on-surface-variant)/var(--tw-text-opacity,1))}.hover\\:text-primary:hover{--tw-text-opacity:1;color:rgb(var(--color-primary)/var(--tw-text-opacity,1))}.hover\\:underline:hover{text-decoration-line:underline}.focus\\:outline-none:focus{outline:2px solid transparent;outline-offset:2px}.focus\\:ring-2:focus{--tw-ring-offset-shadow:var(--tw-ring-inset) 0 0 0 var(--tw-ring-offset-width) var(--tw-ring-offset-color);--tw-ring-shadow:var(--tw-ring-inset) 0 0 0 calc(2px + var(--tw-ring-offset-width)) var(--tw-ring-color);box-shadow:var(--tw-ring-offset-shadow),var(--tw-ring-shadow),var(--tw-shadow,0 0 #0000)}.focus\\:ring-blue-500:focus{--tw-ring-opacity:1;--tw-ring-color:rgb(59 130 246/var(--tw-ring-opacity,1))}.group:hover .group-hover\\:scale-105{--tw-scale-x:1.05;--tw-scale-y:1.05;transform:translate(var(--tw-translate-x),var(--tw-translate-y)) rotate(var(--tw-rotate)) skew(var(--tw-skew-x)) skewY(var(--tw-skew-y)) scaleX(var(--tw-scale-x)) scaleY(var(--tw-scale-y))}.group:hover .group-hover\\:text-secondary{--tw-text-opacity:1;color:rgb(var(--color-secondary)/var(--tw-text-opacity,1))}.group:hover .group-hover\\:underline{text-decoration-line:underline}@media(min-width:640px){.sm\\:grid-cols-2{grid-template-columns:repeat(2,minmax(0,1fr))}.sm\\:grid-cols-3{grid-template-columns:repeat(3,minmax(0,1fr))}}@media(min-width:768px){.md\\:order-1{order:1}.md\\:order-2{order:2}.md\\:col-span-2{grid-column:span 2/span 2}.md\\:col-span-4{grid-column:span 4/span 4}.md\\:col-span-8{grid-column:span 8/span 8}.md\\:flex{display:flex}.md\\:aspect-\\[21\\/9\\]{aspect-ratio:21/9}.md\\:aspect-\\[4\\/3\\]{aspect-ratio:4/3}.md\\:aspect-square{aspect-ratio:1/1}.md\\:h-32{height:8rem}.md\\:w-32{width:8rem}.md\\:grid-cols-12{grid-template-columns:repeat(12,minmax(0,1fr))}.md\\:grid-cols-2{grid-template-columns:repeat(2,minmax(0,1fr))}.md\\:grid-cols-3{grid-template-columns:repeat(3,minmax(0,1fr))}.md\\:flex-row{flex-direction:row}.md\\:items-start{align-items:flex-start}.md\\:justify-end{justify-content:flex-end}.md\\:justify-between{justify-content:space-between}.md\\:text-2xl{font-size:1.5rem;line-height:2rem}.md\\:text-4xl{font-size:2.25rem;line-height:2.5rem}.md\\:text-5xl{font-size:3rem;line-height:1}.md\\:text-6xl{font-size:3.75rem;line-height:1}.md\\:text-7xl{font-size:4.5rem;line-height:1}}@media(min-width:1024px){.lg\\:col-span-12{grid-column:span 12/span 12}.lg\\:col-span-3{grid-column:span 3/span 3}.lg\\:col-span-4{grid-column:span 4/span 4}.lg\\:col-span-7{grid-column:span 7/span 7}.lg\\:col-span-8{grid-column:span 8/span 8}.lg\\:col-span-9{grid-column:span 9/span 9}.lg\\:col-start-2{grid-column-start:2}.lg\\:col-start-9{grid-column-start:9}.lg\\:grid-cols-12{grid-template-columns:repeat(12,minmax(0,1fr))}.lg\\:grid-cols-3{grid-template-columns:repeat(3,minmax(0,1fr))}.lg\\:px-gutter{padding-left:24px;padding-right:24px}}@media(min-width:1280px){.xl\\:grid-cols-3{grid-template-columns:repeat(3,minmax(0,1fr))}}@media(prefers-color-scheme:dark){.dark\\:border-blue-500{--tw-border-opacity:1;border-color:rgb(59 130 246/var(--tw-border-opacity,1))}.dark\\:bg-blue-950\\/30{background-color:#1725544d}}', ki = `/**
 * Magazine theme — runtime menu loader.
 *
 * Same contract as the default theme's menu-loader. Differences:
 *   - The injected logo \`<img>\` gets Tailwind utility classes
 *     (\`h-8 w-auto\`) so it sizes correctly inside the magazine
 *     header's flex layout without needing a theme-specific CSS rule.
 *   - The burger overlay uses \`[data-cms-menu="header"]\` containers
 *     and a separate \`#burger-menu\` overlay, both rendered by
 *     templates/BaseLayout.tsx.
 */
(function () {
  "use strict";

  // ─── Base path ────────────────────────────────────────────────────
  // Sites served from a sub-folder (e.g. GitHub Pages project sites)
  // carry <meta name="x-cms-base" content="/repo/"> in <head>; no meta
  // means the site lives at the domain root. URLs built at runtime from
  // JSON data go through withBase() so they land under that folder.
  var BASE = (function () {
    var meta = document.querySelector('meta[name="x-cms-base"]');
    var b = (meta && meta.getAttribute("content")) || "/";
    if (b.charAt(0) !== "/") b = "/" + b;
    if (b.charAt(b.length - 1) !== "/") b += "/";
    return b;
  })();

  function withBase(url) {
    if (BASE === "/" || !url) return url;
    // Absolute URLs (http:, mailto:, data:, …), protocol-relative and
    // fragment-only links pass through.
    if (/^([a-z][a-z0-9+.-]*:|\\/\\/|#)/i.test(url)) return url;
    if (url.indexOf(BASE) === 0 || url === BASE.slice(0, -1)) return url;
    return BASE + (url.charAt(0) === "/" ? url.slice(1) : url);
  }

  function fetchMenu() {
    return fetch(withBase("/data/menu.json"), { credentials: "omit" })
      .then(function (res) {
        if (!res.ok) throw new Error("HTTP " + res.status);
        return res.json();
      })
      .catch(function (err) {
        console.warn("[cms] menu.json load failed:", err);
        return null;
      });
  }

  // Picks the per-language label from item.labels (set by the admin
  // in the menu builder) based on <html lang>, with a region-stripped
  // fallback so "en-US" matches "en". Mono-lingual sites just return
  // item.label.
  function pickLabel(item) {
    var lang = (document.documentElement.getAttribute("lang") || "").trim();
    if (lang && item.labels && typeof item.labels[lang] === "string" && item.labels[lang]) {
      return item.labels[lang];
    }
    if (lang && lang.indexOf("-") > 0) {
      var base = lang.split("-")[0];
      if (item.labels && typeof item.labels[base] === "string" && item.labels[base]) {
        return item.labels[base];
      }
    }
    return item.label || "";
  }

  function renderItem(item) {
    var li = document.createElement("li");
    var a = document.createElement("a");
    a.href = withBase(item.href) || "#";
    a.textContent = pickLabel(item);
    if (samePath(a.href)) {
      a.setAttribute("aria-current", "page");
    }
    li.appendChild(a);
    if (item.children && item.children.length) {
      var sub = document.createElement("ul");
      sub.className = "menu-children";
      item.children.forEach(function (child) {
        sub.appendChild(renderItem(child));
      });
      li.appendChild(sub);
    }
    return li;
  }

  function samePath(href) {
    try {
      var url = new URL(href, window.location.origin);
      var here = window.location.pathname.replace(/\\/index\\.html$/, "/");
      var there = url.pathname.replace(/\\/index\\.html$/, "/");
      return here === there;
    } catch (e) {
      return false;
    }
  }

  function paint(menu) {
    if (!menu) return;
    document.querySelectorAll("[data-cms-menu]").forEach(function (host) {
      var key = host.getAttribute("data-cms-menu");
      var items = (menu && menu[key]) || [];
      var list = host.querySelector("ul");
      if (!list) return;
      list.innerHTML = "";
      items.forEach(function (item) {
        list.appendChild(renderItem(item));
      });
      // Hide empty INLINE menu hosts (footer nav) so they don't
      // reserve whitespace. Skip #burger-menu: it's \`position: fixed\`
      // (no layout impact) AND any \`hidden\` attribute would \`display:
      // none\` the panel, which the \`.burger-menu.is-open { transform:
      // translate(0) }\` rule can never override — the burger toggle
      // would open an invisible panel. Visibility of the burger UI is
      // gated by the burger TOGGLE button below instead.
      var isBurgerMenu = host.id === "burger-menu";
      if (items.length === 0 && !isBurgerMenu) {
        host.setAttribute("hidden", "");
      } else {
        host.removeAttribute("hidden");
      }
    });
    // Hide the burger TOGGLE button when the header menu has no
    // items — otherwise users see a button that opens an empty
    // off-canvas panel and conclude "the burger is broken".
    var headerItems = (menu && menu.header) || [];
    document.querySelectorAll(".burger-toggle").forEach(function (toggle) {
      if (headerItems.length === 0) {
        toggle.setAttribute("hidden", "");
      } else {
        toggle.removeAttribute("hidden");
      }
    });
    paintBranding(menu);
  }

  // Swap the wordmark for an <img> when the theme has a logo
  // configured. Falls back to the static text in every other case.
  function paintBranding(menu) {
    var branding = menu && menu.branding;
    var logoUrl = branding && branding.logoUrl;
    if (!logoUrl) return;
    document.querySelectorAll("[data-cms-brand]").forEach(function (host) {
      var alt = host.textContent || "";
      var img = document.createElement("img");
      img.src = withBase(logoUrl);
      img.alt = alt;
      // Tailwind utilities — keeps the logo a comfortable height
      // and proportional width without per-theme CSS rules.
      img.className = "h-8 w-auto";
      img.loading = "lazy";
      host.innerHTML = "";
      host.appendChild(img);
    });
  }

  function ensureCloseButton(menu) {
    if (menu.querySelector(".burger-close")) return menu.querySelector(".burger-close");
    var close = document.createElement("button");
    close.type = "button";
    close.className = "burger-close";
    close.setAttribute("aria-label", "Close menu");
    close.innerHTML =
      '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>';
    menu.insertBefore(close, menu.firstChild);
    return close;
  }

  function ensureBackdrop() {
    var existing = document.querySelector(".burger-backdrop");
    if (existing) return existing;
    var backdrop = document.createElement("div");
    backdrop.className = "burger-backdrop";
    backdrop.setAttribute("aria-hidden", "true");
    document.body.appendChild(backdrop);
    return backdrop;
  }

  function wireBurger() {
    var toggle = document.querySelector(".burger-toggle");
    var menu = document.getElementById("burger-menu");
    if (!toggle || !menu) return;

    var close = ensureCloseButton(menu);
    var backdrop = ensureBackdrop();

    function setOpen(open) {
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
      menu.classList.toggle("is-open", open);
      backdrop.classList.toggle("is-open", open);
      document.body.classList.toggle("burger-open", open);
    }

    toggle.addEventListener("click", function () {
      var isOpen = toggle.getAttribute("aria-expanded") === "true";
      setOpen(!isOpen);
    });
    close.addEventListener("click", function () {
      setOpen(false);
    });
    backdrop.addEventListener("click", function () {
      setOpen(false);
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") setOpen(false);
    });
    menu.addEventListener("click", function (e) {
      if (e.target.tagName === "A") setOpen(false);
    });
    document.addEventListener("pointerdown", function (e) {
      if (toggle.getAttribute("aria-expanded") !== "true") return;
      if (menu.contains(e.target)) return;
      if (toggle.contains(e.target)) return;
      setOpen(false);
    });
  }

  function ready(fn) {
    if (document.readyState !== "loading") fn();
    else document.addEventListener("DOMContentLoaded", fn);
  }

  ready(function () {
    wireBurger();
    fetchMenu().then(paint);
  });
})();
`, Si = `/**
 * Magazine theme — runtime sidebar loader.
 *
 * Populates \`[data-cms-related]\` and \`[data-cms-author-bio]\` hosts
 * from \`/data/posts.json\` and \`/data/authors.json\` respectively. Same
 * lifecycle as default's posts-loader: fetched once on
 * DOMContentLoaded, paint passes are independent and tolerate each
 * other's failure.
 *
 * The injected DOM uses magazine-specific class names
 * (\`magazine-related-*\`, \`magazine-bio-*\`) — matching CSS rules live
 * in \`theme.css\` under \`@layer components\`. The author-bio host
 * provides its own card chrome (background / border / padding /
 * radius) via Tailwind utilities in \`SingleTemplate.tsx\`; the
 * related host carries no chrome (just a section heading + bordered
 * list).
 *
 * Failure is silent: missing data leaves the host hidden (related)
 * or untouched (author-bio's host stays \`hidden\` from publish time).
 */
(function () {
  "use strict";

  // ─── Base path ────────────────────────────────────────────────────
  // Sites served from a sub-folder (e.g. GitHub Pages project sites)
  // carry <meta name="x-cms-base" content="/repo/"> in <head>; no meta
  // means the site lives at the domain root. URLs built at runtime from
  // JSON data go through withBase() so they land under that folder.
  var BASE = (function () {
    var meta = document.querySelector('meta[name="x-cms-base"]');
    var b = (meta && meta.getAttribute("content")) || "/";
    if (b.charAt(0) !== "/") b = "/" + b;
    if (b.charAt(b.length - 1) !== "/") b += "/";
    return b;
  })();

  function withBase(url) {
    if (BASE === "/" || !url) return url;
    // Absolute URLs (http:, mailto:, data:, …), protocol-relative and
    // fragment-only links pass through.
    if (/^([a-z][a-z0-9+.-]*:|\\/\\/|#)/i.test(url)) return url;
    if (url.indexOf(BASE) === 0 || url === BASE.slice(0, -1)) return url;
    return BASE + (url.charAt(0) === "/" ? url.slice(1) : url);
  }

  // "/repo/fr/x.html" → "/fr/x.html" so path parsing ignores the base.
  function stripBase(pathname) {
    if (BASE === "/") return pathname;
    if (pathname.indexOf(BASE) === 0) return "/" + pathname.slice(BASE.length);
    if (pathname === BASE.slice(0, -1)) return "/";
    return pathname;
  }

  // ─── Social icons ─────────────────────────────────────────────────
  // Brand SVG paths + display labels for the curated SocialNetwork
  // list. Mirror in core/socialIcons.tsx (and each other theme's
  // posts-loader.js) when adding a network.
  var SOCIAL_ICON_PATHS = {
    twitter: "M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z",
    linkedin: "M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z",
    instagram: "M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z",
    mastodon: "M23.193 7.88c0-5.207-3.411-6.733-3.411-6.733C18.062.357 15.108.025 12.041 0h-.076c-3.068.025-6.02.357-7.74 1.147 0 0-3.412 1.526-3.412 6.733 0 1.193-.023 2.619.015 4.13.124 5.092.934 10.11 5.641 11.355 2.17.574 4.034.695 5.535.612 2.722-.151 4.25-.972 4.25-.972l-.09-1.975s-1.945.613-4.129.539c-2.165-.074-4.449-.233-4.799-2.891a5.499 5.499 0 0 1-.048-.745s2.125.52 4.817.643c1.646.075 3.19-.097 4.758-.283 3.007-.359 5.625-2.212 5.954-3.905.52-2.667.477-6.508.477-6.508zm-4.024 6.709h-2.497V8.469c0-1.29-.543-1.944-1.628-1.944-1.2 0-1.802.776-1.802 2.312v3.349h-2.484v-3.35c0-1.536-.601-2.312-1.802-2.312-1.085 0-1.628.655-1.628 1.945v6.119H4.831V8.285c0-1.29.328-2.313.987-3.07.68-.756 1.57-1.144 2.674-1.144 1.278 0 2.246.491 2.886 1.474L12 6.585l.622-1.04c.64-.983 1.608-1.474 2.886-1.474 1.104 0 1.994.388 2.674 1.144.658.757.986 1.78.986 3.07v6.304z",
    bluesky: "M12 10.8c-1.087-2.114-4.046-6.053-6.798-7.995C2.566.944 1.561 1.266.902 1.565.139 1.908 0 3.08 0 3.768c0 .69.378 5.65.624 6.479.815 2.736 3.713 3.66 6.383 3.364.137-.02.275-.039.415-.056-.138.022-.276.04-.415.056-3.912.58-7.387 2.005-2.83 7.078 5.013 5.19 6.87-1.113 7.823-4.308.952 3.195 2.05 9.271 7.733 4.308 4.267-4.308 1.172-6.498-2.74-7.078a8.741 8.741 0 0 1-.415-.056c.14.017.279.036.415.056 2.67.297 5.568-.628 6.383-3.364.246-.828.624-5.79.624-6.478 0-.69-.139-1.861-.902-2.206-.659-.298-1.664-.62-4.3 1.24C16.046 4.748 13.087 8.687 12 10.8Z",
    github: "M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12",
    website: "M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zm6.93 6h-2.95a15.65 15.65 0 0 0-1.38-3.56A8.03 8.03 0 0 1 18.92 8zM12 4.04c.83 1.2 1.48 2.53 1.91 3.96h-3.82c.43-1.43 1.08-2.76 1.91-3.96zM4.26 14C4.1 13.36 4 12.69 4 12s.1-1.36.26-2h3.38c-.08.66-.14 1.32-.14 2 0 .68.06 1.34.14 2H4.26zm.82 2h2.95c.32 1.25.78 2.45 1.38 3.56A7.987 7.987 0 0 1 5.08 16zm2.95-8H5.08a7.987 7.987 0 0 1 4.33-3.56A15.65 15.65 0 0 0 8.03 8zM12 19.96c-.83-1.2-1.48-2.53-1.91-3.96h3.82c-.43 1.43-1.08 2.76-1.91 3.96zM14.34 14H9.66c-.09-.66-.16-1.32-.16-2 0-.68.07-1.35.16-2h4.68c.09.65.16 1.32.16 2 0 .68-.07 1.34-.16 2zm.25 5.56c.6-1.11 1.06-2.31 1.38-3.56h2.95a8.03 8.03 0 0 1-4.33 3.56zM16.36 14c.08-.66.14-1.32.14-2 0-.68-.06-1.34-.14-2h3.38c.16.64.26 1.31.26 2s-.1 1.36-.26 2h-3.38z",
  };
  var SOCIAL_ICON_LABELS = {
    twitter: "Twitter / X",
    linkedin: "LinkedIn",
    instagram: "Instagram",
    mastodon: "Mastodon",
    bluesky: "Bluesky",
    github: "GitHub",
    website: "Website",
  };
  function socialIconSvg(network) {
    var path = SOCIAL_ICON_PATHS[network];
    if (!path) return "";
    return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="18" height="18" fill="currentColor" aria-hidden="true"><path d="' + path + '"/></svg>';
  }
  function socialIconLabel(network) {
    return SOCIAL_ICON_LABELS[network] || network;
  }

  function fetchJson(path) {
    return fetch(withBase(path), { credentials: "omit" })
      .then(function (res) {
        if (!res.ok) throw new Error("HTTP " + res.status);
        return res.json();
      })
      .catch(function (err) {
        console.warn("[cms] " + path + " load failed:", err);
        return null;
      });
  }

  // ─── Related posts ────────────────────────────────────────────────
  //
  // DOM emitted (matches the editorial mockup — small-caps section
  // heading + flex-column list with top-bordered items):
  //
  //   <h4 class="magazine-related-heading">Latest from {{site}}</h4>
  //   <div class="magazine-related-list">
  //     <a class="magazine-related-link group" href="/...">
  //       <span class="magazine-related-eyebrow">Category</span>
  //       <h5 class="magazine-related-title">Title</h5>
  //       <time class="magazine-related-date">Nov 12, 2024</time>
  //     </a>
  //     ...
  //   </div>

  function renderRelatedItem(entry) {
    var a = document.createElement("a");
    a.href = withBase("/" + entry.url);
    a.className = "magazine-related-link";
    if (entry.category && entry.category.name) {
      var eyebrow = document.createElement("span");
      eyebrow.className = "magazine-related-eyebrow";
      eyebrow.textContent = entry.category.name;
      a.appendChild(eyebrow);
    }
    var title = document.createElement("h5");
    title.className = "magazine-related-title";
    title.textContent = entry.title || "";
    a.appendChild(title);
    if (entry.dateLabel) {
      var date = document.createElement("time");
      date.className = "magazine-related-date";
      date.textContent = entry.dateLabel;
      a.appendChild(date);
    }
    return a;
  }

  function renderRelated(host, posts) {
    var termId = host.getAttribute("data-cms-term-id") || "";
    var currentId = host.getAttribute("data-cms-current-id") || "";
    var limit = parseInt(host.getAttribute("data-cms-limit") || "3", 10);
    var label = host.getAttribute("data-cms-label") || "Continue reading";
    var fallbackLabel =
      host.getAttribute("data-cms-fallback-label") || "Latest articles";

    var matching = [];
    var heading = label;

    if (termId) {
      for (var i = 0; i < posts.length && matching.length < limit; i++) {
        var p = posts[i];
        if (p.id === currentId) continue;
        if (p.type !== "post") continue;
        if (p.primaryTermId !== termId) continue;
        matching.push(p);
      }
    }

    if (matching.length === 0) {
      heading = fallbackLabel;
      for (var j = 0; j < posts.length && matching.length < limit; j++) {
        var pp = posts[j];
        if (pp.id === currentId) continue;
        if (pp.type !== "post") continue;
        matching.push(pp);
      }
    }

    if (matching.length === 0) {
      host.setAttribute("hidden", "");
      return;
    }

    host.removeAttribute("hidden");
    host.innerHTML = "";
    var headingEl = document.createElement("h4");
    headingEl.className = "magazine-related-heading";
    headingEl.textContent = heading;
    host.appendChild(headingEl);
    var list = document.createElement("div");
    list.className = "magazine-related-list";
    matching.forEach(function (entry) {
      list.appendChild(renderRelatedItem(entry));
    });
    host.appendChild(list);
  }

  // ─── Author bio ───────────────────────────────────────────────────
  //
  // DOM emitted (matches the mockup — square rounded avatar, name in
  // serif headline, role-style eyebrow underneath, bio paragraph,
  // optional mailto icon link):
  //
  //   <div class="magazine-bio-head">
  //     <div class="magazine-bio-avatar-wrap">
  //       <img class="magazine-bio-avatar-img" />
  //       OR <span class="magazine-bio-avatar-initials">JV</span>
  //     </div>
  //     <div class="magazine-bio-name-wrap">
  //       <h4 class="magazine-bio-name">…</h4>
  //       <p class="magazine-bio-role">…</p>
  //     </div>
  //   </div>
  //   <p class="magazine-bio-text">…</p>
  //   <div class="magazine-bio-socials">
  //     <a href="mailto:…" class="magazine-bio-social-link">
  //       <span class="material-symbols-outlined">alternate_email</span>
  //     </a>
  //   </div>

  function authorInitials(name) {
    if (!name) return "?";
    var parts = name.trim().split(/\\s+/);
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    var first = parts[0][0] || "";
    var last = parts[parts.length - 1][0] || "";
    return (first + last).toUpperCase();
  }

  function authorAvatar(name, url) {
    var wrap = document.createElement("div");
    wrap.className = "magazine-bio-avatar-wrap";
    if (url) {
      var img = document.createElement("img");
      img.className = "magazine-bio-avatar-img";
      img.src = withBase(url);
      img.alt = name || "";
      img.loading = "lazy";
      wrap.appendChild(img);
    } else {
      var span = document.createElement("span");
      span.className = "magazine-bio-avatar-initials";
      span.setAttribute("aria-hidden", "true");
      span.textContent = authorInitials(name);
      wrap.appendChild(span);
    }
    return wrap;
  }

  function renderAuthorBio(host, authors) {
    var authorId = host.getAttribute("data-cms-author-id") || "";
    if (!authorId) return;
    var entry = authors[authorId];
    if (!entry) return;

    host.innerHTML = "";

    // Header row — avatar + name + role-style eyebrow.
    var head = document.createElement("div");
    head.className = "magazine-bio-head";
    head.appendChild(authorAvatar(entry.displayName, entry.avatar));

    var nameWrap = document.createElement("div");
    nameWrap.className = "magazine-bio-name-wrap";

    // Author name — clickable when /authors.json carries a profile URL,
    // otherwise a plain <h4>. Mirrors the default theme's behavior so
    // archive links keep working transparently.
    var nameEl;
    if (entry.url) {
      nameEl = document.createElement("a");
      nameEl.href = withBase("/" + entry.url);
    } else {
      nameEl = document.createElement("h4");
    }
    nameEl.className = "magazine-bio-name";
    nameEl.textContent = entry.displayName || "";
    nameWrap.appendChild(nameEl);

    // Title (e.g. "Journaliste") sits under the name as a label-caps
    // role line. Replaces the legacy email-as-role line — email is
    // admin-only data and never reaches the public site.
    if (entry.title) {
      var role = document.createElement("p");
      role.className = "magazine-bio-role";
      role.textContent = entry.title;
      nameWrap.appendChild(role);
    }
    head.appendChild(nameWrap);
    host.appendChild(head);

    if (entry.bio) {
      var bio = document.createElement("p");
      bio.className = "magazine-bio-text";
      bio.textContent = entry.bio;
      host.appendChild(bio);
    }

    // Visible socials — already filtered server-side. Each entry
    // produces an icon link to the user's external profile, opened in
    // a new tab with rel=noopener noreferrer.
    if (entry.socials && entry.socials.length) {
      var socials = document.createElement("div");
      socials.className = "magazine-bio-socials";
      for (var i = 0; i < entry.socials.length; i++) {
        var s = entry.socials[i];
        var a = document.createElement("a");
        a.className = "magazine-bio-social-link";
        a.href = s.url;
        a.target = "_blank";
        a.rel = "noopener noreferrer";
        a.setAttribute("aria-label", socialIconLabel(s.network));
        a.title = socialIconLabel(s.network);
        a.innerHTML = socialIconSvg(s.network);
        socials.appendChild(a);
      }
      host.appendChild(socials);
    }

    host.removeAttribute("hidden");
  }

  // ─── Paint passes ─────────────────────────────────────────────────

  function paintRelated(postsBlob) {
    if (!postsBlob || !Array.isArray(postsBlob.posts)) return;
    document.querySelectorAll("[data-cms-related]").forEach(function (host) {
      renderRelated(host, postsBlob.posts);
    });
  }

  function paintAuthorBios(authorsBlob) {
    if (!authorsBlob || !authorsBlob.authors) return;
    document.querySelectorAll("[data-cms-author-bio]").forEach(function (host) {
      renderAuthorBio(host, authorsBlob.authors);
    });
  }

  function ready(fn) {
    if (document.readyState !== "loading") fn();
    else document.addEventListener("DOMContentLoaded", fn);
  }

  // Multi-language helper — when the page lives under \`/<lang>/...\`,
  // fetch the localised data file first and fall back to the root on
  // 404. The multilang plugin generates \`<lang>/data/posts.json\` per
  // enabled language so sidebar widgets reflect translations on
  // non-primary pages. Sites without multilang stay on the root file.
  function detectLocalePrefix() {
    var path = stripBase(window.location.pathname).replace(/^\\/+/, "");
    var first = path.split("/")[0];
    if (!first) return null;
    if (/^[a-z]{2}(-[a-z]{2})?$/.test(first.toLowerCase())) return first.toLowerCase();
    return null;
  }
  function fetchWithLocaleFallback(filename) {
    var locale = detectLocalePrefix();
    if (!locale) return fetchJson("/data/" + filename);
    return fetchJson("/" + locale + "/data/" + filename).then(function (data) {
      if (data) return data;
      return fetchJson("/data/" + filename);
    });
  }

  ready(function () {
    Promise.all([
      fetchWithLocaleFallback("posts.json"),
      fetchWithLocaleFallback("authors.json"),
    ]).then(function (results) {
      paintRelated(results[0]);
      paintAuthorBios(results[1]);
    });
  });
})();
`, Ci = {
  description: "Customize the active theme. Changes affect every published page on the next load (browsers may cache the CSS — hard-refresh once to see the update).",
  tabs: { logo: "Logo", style: "Style", home: "Home", header: "Header" },
  logo: {
    help: "Upload a logo to replace the text wordmark in the header. Recommended dimensions: {{width}}×{{height}} px. Image is resized and stored as WebP.",
    none: "No logo set",
    upload: "Upload logo",
    uploading: "Uploading…",
    change: "Change logo",
    remove: "Remove logo",
    removing: "Removing…",
    saved: "Logo updated. Reload published pages to see the change.",
    removed: "Logo removed.",
    failed: "Logo upload failed.",
    invalidType: "Pick a JPG, PNG or WebP image."
  },
  style: {
    help: "Tweak design tokens to customize colors and typography. Save & apply pushes a regenerated theme CSS to your site.",
    save: "Save & apply",
    saving: "Applying…",
    saved: "Style applied. Hard-refresh published pages to see the changes.",
    failed: "Style update failed.",
    reset: "Reset to defaults",
    resetting: "Resetting…"
  },
  presets: {
    title: "Style preset",
    help: "Pick a graphic preset to fill every field below. You can fine-tune individual values afterwards.",
    editorial: {
      label: "Editorial",
      description: "Original editorial baseline — Newsreader over Work Sans, neutral surfaces."
    },
    news: {
      label: "News",
      description: "High-contrast newspaper look — Playfair Display + IBM Plex Sans on cream, deep red accent."
    },
    literary: {
      label: "Literary",
      description: "Warm cream surfaces and rich brown — EB Garamond + Manrope for longform reading."
    },
    modernist: {
      label: "Modernist",
      description: "Cool grays with indigo accent — Spectral + Outfit, contemporary editorial feel."
    },
    boutique: {
      label: "Boutique",
      description: "Cream surfaces with terracotta accent — Lora + Plus Jakarta Sans, refined boutique vibe."
    }
  },
  groups: {
    surfaces: "Surfaces",
    foreground: "Foreground",
    outlines: "Outlines",
    accent: "Accent",
    typography: "Typography"
  },
  vars: {
    background: "Page background",
    surface: "Surface",
    surfaceLow: "Surface — low",
    surfaceMid: "Surface — mid",
    surfaceHigh: "Surface — high",
    onSurface: "Body text",
    onSurfaceVariant: "Secondary text",
    outline: "Outline",
    outlineVariant: "Outline — subtle",
    primary: "Primary",
    onPrimary: "Text on primary",
    primaryContainer: "Primary container",
    onPrimaryContainer: "Text on primary container",
    secondary: "Accent (links, eyebrows)"
  },
  fonts: {
    serif: "Serif (titles & lede)",
    sans: "Sans-serif (body & UI)",
    help: "Fonts ship via Google Fonts. The CSS @import line is rewritten on save."
  },
  home: {
    help: "Choose how the home page is laid out. The publisher renders the chosen variants on the next publish.",
    save: "Save",
    saving: "Saving…",
    saved: "Home layout saved. Republish or wait for the next publish to apply.",
    failed: "Save failed.",
    mostReadCount: "Most read items",
    mostReadCountHelp: "Number of items in the Most Read sidebar widget. Range 1–10.",
    featuredLabel: "Featured badge text",
    latestHeading: "Latest posts heading",
    mostReadHeading: "Most read heading",
    textsHelp: "Leave empty to use the theme's default text in the site language.",
    sidebarTop: "Sidebar — top",
    sidebarBottom: "Sidebar — bottom",
    sidebarVariants: { mostRead: "Most read", promo: "Promo card", none: "Empty" },
    promoSection: "Promo card",
    promoSectionHelp: 'Used when a sidebar slot is set to "Promo card". Leave fields empty to hide the slot.',
    promoImage: "Image URL",
    promoImageHelp: "Paste the URL of an image hosted on your site (Media library) or anywhere else.",
    promoImageAlt: "Alt text",
    promoEyebrow: "Eyebrow label",
    promoTitle: "Heading",
    promoHref: "Click target URL"
  },
  header: {
    help: "Adjust the header silhouette.",
    save: "Save",
    saving: "Saving…",
    saved: "Header settings saved.",
    failed: "Save failed.",
    brandPosition: "Brand position",
    brandPositions: { centered: "Centered", left: "Left-aligned" },
    showSearch: "Show search trigger",
    showSearchHelp: "Activates a button in the header that opens the agentcms-search modal (when the plugin is enabled)."
  }
}, Ni = {
  description: "Personnalisez le thème actif. Les modifications s'appliquent à chaque page publiée au prochain chargement (le navigateur peut mettre en cache le CSS — un Cmd+Maj+R suffit à le rafraîchir).",
  tabs: { logo: "Logo", style: "Style", home: "Accueil", header: "En-tête" },
  logo: {
    help: "Téléversez un logo pour remplacer le wordmark texte dans l'en-tête. Dimensions recommandées : {{width}}×{{height}} px. L'image est redimensionnée et stockée en WebP.",
    none: "Aucun logo défini",
    upload: "Téléverser un logo",
    uploading: "Téléversement…",
    change: "Changer le logo",
    remove: "Supprimer le logo",
    removing: "Suppression…",
    saved: "Logo mis à jour. Rechargez les pages publiées pour voir le changement.",
    removed: "Logo supprimé.",
    failed: "Échec du téléversement du logo.",
    invalidType: "Choisissez une image JPG, PNG ou WebP."
  },
  style: {
    help: "Ajustez les tokens de design pour personnaliser couleurs et typographie. « Enregistrer & appliquer » envoie une CSS régénérée sur votre site.",
    save: "Enregistrer & appliquer",
    saving: "Application…",
    saved: "Style appliqué. Faites un hard-refresh sur les pages publiées pour voir les changements.",
    failed: "Échec de la mise à jour du style.",
    reset: "Réinitialiser aux valeurs par défaut",
    resetting: "Réinitialisation…"
  },
  presets: {
    title: "Préréglage de style",
    help: "Choisissez un préréglage graphique pour pré-remplir tous les champs ci-dessous. Vous pourrez ensuite affiner valeur par valeur.",
    editorial: {
      label: "Éditorial",
      description: "Look éditorial d'origine — Newsreader sur Work Sans, surfaces neutres."
    },
    news: {
      label: "Journal",
      description: "Look journal très contrasté — Playfair Display + IBM Plex Sans sur crème, accent rouge profond."
    },
    literary: {
      label: "Littéraire",
      description: "Surfaces crème chaudes et bruns profonds — EB Garamond + Manrope pour la lecture longue."
    },
    modernist: {
      label: "Moderniste",
      description: "Gris froids et accent indigo — Spectral + Outfit, look éditorial contemporain."
    },
    boutique: {
      label: "Boutique",
      description: "Surfaces crème et accent terracotta — Lora + Plus Jakarta Sans, look boutique raffiné."
    }
  },
  groups: {
    surfaces: "Surfaces",
    foreground: "Texte",
    outlines: "Contours",
    accent: "Accent",
    typography: "Typographie"
  },
  vars: {
    background: "Fond de page",
    surface: "Surface",
    surfaceLow: "Surface — basse",
    surfaceMid: "Surface — moyenne",
    surfaceHigh: "Surface — haute",
    onSurface: "Texte principal",
    onSurfaceVariant: "Texte secondaire",
    outline: "Contour",
    outlineVariant: "Contour — discret",
    primary: "Primaire",
    onPrimary: "Texte sur primaire",
    primaryContainer: "Conteneur primaire",
    onPrimaryContainer: "Texte sur conteneur primaire",
    secondary: "Accent (liens, étiquettes)"
  },
  fonts: {
    serif: "Serif (titres & chapôs)",
    sans: "Sans-serif (corps & UI)",
    help: "Les polices proviennent de Google Fonts. La ligne @import du CSS est réécrite à l'enregistrement."
  },
  home: {
    help: "Choisissez la mise en page de la page d'accueil. Le publisher applique les variantes à la prochaine publication.",
    save: "Enregistrer",
    saving: "Enregistrement…",
    saved: "Mise en page enregistrée. Republier ou attendre la prochaine publication pour l'appliquer.",
    failed: "Échec de l'enregistrement.",
    mostReadCount: "Articles les plus lus",
    mostReadCountHelp: "Nombre d'éléments dans le widget Most Read. De 1 à 10.",
    featuredLabel: "Texte du badge « À la une »",
    latestHeading: "Titre de la liste des derniers articles",
    mostReadHeading: "Titre du widget « Les plus lus »",
    textsHelp: "Laisser vide pour le texte par défaut du thème dans la langue du site.",
    sidebarTop: "Sidebar — haut",
    sidebarBottom: "Sidebar — bas",
    sidebarVariants: { mostRead: "Les plus lus", promo: "Carte promo", none: "Vide" },
    promoSection: "Carte promo",
    promoSectionHelp: "Utilisée quand un slot de sidebar est réglé sur « Carte promo ». Laissez les champs vides pour masquer le slot.",
    promoImage: "URL de l'image",
    promoImageHelp: "Collez l'URL d'une image hébergée sur votre site (Médiathèque) ou ailleurs.",
    promoImageAlt: "Texte alternatif",
    promoEyebrow: "Étiquette",
    promoTitle: "Titre",
    promoHref: "URL de destination"
  },
  header: {
    help: "Ajustez la silhouette de l'en-tête.",
    save: "Enregistrer",
    saving: "Enregistrement…",
    saved: "En-tête enregistré.",
    failed: "Échec de l'enregistrement.",
    brandPosition: "Position du wordmark",
    brandPositions: { centered: "Centré", left: "Aligné à gauche" },
    showSearch: "Afficher le bouton de recherche",
    showSearchHelp: "Active un bouton dans l'en-tête qui ouvre la modale agentcms-search (quand le plugin est activé)."
  }
}, Ei = {
  description: "Passen Sie das aktive Theme an. Änderungen wirken sich auf jede veröffentlichte Seite beim nächsten Laden aus (Browser können CSS zwischenspeichern — ein Hard-Refresh genügt).",
  tabs: { logo: "Logo", style: "Stil", home: "Startseite", header: "Kopfzeile" },
  logo: {
    help: "Laden Sie ein Logo hoch, um das Text-Wordmark in der Kopfzeile zu ersetzen. Empfohlene Maße: {{width}}×{{height}} px. Das Bild wird verkleinert und als WebP gespeichert.",
    none: "Kein Logo gesetzt",
    upload: "Logo hochladen",
    uploading: "Wird hochgeladen…",
    change: "Logo ändern",
    remove: "Logo entfernen",
    removing: "Wird entfernt…",
    saved: "Logo aktualisiert. Veröffentlichte Seiten neu laden, um die Änderung zu sehen.",
    removed: "Logo entfernt.",
    failed: "Logo-Upload fehlgeschlagen.",
    invalidType: "Bitte ein JPG-, PNG- oder WebP-Bild wählen."
  },
  style: {
    help: 'Optimieren Sie Design-Tokens, um Farben und Typografie anzupassen. „Speichern & anwenden" lädt regeneriertes Theme-CSS hoch.',
    save: "Speichern & anwenden",
    saving: "Wird angewendet…",
    saved: "Stil angewendet. Hard-Refresh auf veröffentlichten Seiten, um die Änderungen zu sehen.",
    failed: "Stil-Update fehlgeschlagen.",
    reset: "Auf Standard zurücksetzen",
    resetting: "Zurücksetzen…"
  },
  presets: {
    title: "Stil-Voreinstellung",
    help: "Wählen Sie eine grafische Voreinstellung, um alle Felder unten zu befüllen. Sie können Werte danach einzeln feinjustieren.",
    editorial: {
      label: "Editorial",
      description: "Originale Editorial-Basis — Newsreader auf Work Sans, neutrale Flächen."
    },
    news: {
      label: "News",
      description: "Kontrastreicher Zeitungs-Look — Playfair Display + IBM Plex Sans auf Creme, tiefroter Akzent."
    },
    literary: {
      label: "Literarisch",
      description: "Warme Creme-Flächen und satte Brauntöne — EB Garamond + Manrope für Longform-Lektüre."
    },
    modernist: {
      label: "Modernist",
      description: "Kühle Grautöne mit Indigo-Akzent — Spectral + Outfit, zeitgenössisches Editorial-Gefühl."
    },
    boutique: {
      label: "Boutique",
      description: "Creme-Flächen mit Terrakotta-Akzent — Lora + Plus Jakarta Sans, raffinierter Boutique-Vibe."
    }
  },
  groups: {
    surfaces: "Flächen",
    foreground: "Text",
    outlines: "Konturen",
    accent: "Akzent",
    typography: "Typografie"
  },
  vars: {
    background: "Seitenhintergrund",
    surface: "Fläche",
    surfaceLow: "Fläche — niedrig",
    surfaceMid: "Fläche — mittel",
    surfaceHigh: "Fläche — hoch",
    onSurface: "Fließtext",
    onSurfaceVariant: "Sekundärtext",
    outline: "Kontur",
    outlineVariant: "Kontur — dezent",
    primary: "Primär",
    onPrimary: "Text auf Primär",
    primaryContainer: "Primär-Container",
    onPrimaryContainer: "Text auf Primär-Container",
    secondary: "Akzent (Links, Eyebrows)"
  },
  fonts: {
    serif: "Serif (Titel & Vorspann)",
    sans: "Sans-Serif (Text & UI)",
    help: "Schriftarten werden von Google Fonts geladen. Die CSS-@import-Zeile wird beim Speichern neu geschrieben."
  },
  home: {
    help: "Wählen Sie das Layout der Startseite. Der Publisher rendert die Varianten bei der nächsten Veröffentlichung.",
    save: "Speichern",
    saving: "Wird gespeichert…",
    saved: "Startseiten-Layout gespeichert. Erneut veröffentlichen oder die nächste Publikation abwarten.",
    failed: "Speichern fehlgeschlagen.",
    mostReadCount: "Anzahl Most-Read-Elemente",
    mostReadCountHelp: "Anzahl der Elemente im Most-Read-Widget. 1–10.",
    featuredLabel: "Text des Hervorhebungs-Badges",
    latestHeading: "Überschrift der neuesten Beiträge",
    mostReadHeading: "Überschrift „Meistgelesen“",
    textsHelp: "Leer lassen für den Standardtext des Themes in der Sprache der Website.",
    sidebarTop: "Sidebar — oben",
    sidebarBottom: "Sidebar — unten",
    sidebarVariants: { mostRead: "Meistgelesen", promo: "Werbekarte", none: "Leer" },
    promoSection: "Werbekarte",
    promoSectionHelp: 'Wird verwendet, wenn ein Sidebar-Slot auf „Werbekarte" gesetzt ist. Felder leer lassen, um den Slot auszublenden.',
    promoImage: "Bild-URL",
    promoImageHelp: "Fügen Sie die URL eines Bildes ein, das auf Ihrer Website (Medienbibliothek) oder anderswo gehostet wird.",
    promoImageAlt: "Alt-Text",
    promoEyebrow: "Eyebrow-Label",
    promoTitle: "Überschrift",
    promoHref: "Ziel-URL"
  },
  header: {
    help: "Passen Sie die Silhouette der Kopfzeile an.",
    save: "Speichern",
    saving: "Wird gespeichert…",
    saved: "Kopfzeilen-Einstellungen gespeichert.",
    failed: "Speichern fehlgeschlagen.",
    brandPosition: "Wordmark-Position",
    brandPositions: { centered: "Zentriert", left: "Linksbündig" },
    showSearch: "Suchschaltfläche anzeigen",
    showSearchHelp: "Aktiviert eine Schaltfläche in der Kopfzeile, die das agentcms-search-Modal öffnet (wenn das Plugin aktiv ist)."
  }
}, Ai = {
  description: "Personaliza el tema activo. Los cambios afectan a cada página publicada en la próxima carga (el navegador puede cachear el CSS — un hard-refresh basta).",
  tabs: { logo: "Logo", style: "Estilo", home: "Inicio", header: "Encabezado" },
  logo: {
    help: "Sube un logo para reemplazar el wordmark de texto en el encabezado. Dimensiones recomendadas: {{width}}×{{height}} px. La imagen se redimensiona y se guarda como WebP.",
    none: "Sin logo",
    upload: "Subir logo",
    uploading: "Subiendo…",
    change: "Cambiar logo",
    remove: "Quitar logo",
    removing: "Quitando…",
    saved: "Logo actualizado. Recarga las páginas publicadas para ver el cambio.",
    removed: "Logo eliminado.",
    failed: "Error al subir el logo.",
    invalidType: "Elige una imagen JPG, PNG o WebP."
  },
  style: {
    help: "Ajusta los tokens de diseño para personalizar colores y tipografía. «Guardar y aplicar» sube un CSS regenerado a tu sitio.",
    save: "Guardar y aplicar",
    saving: "Aplicando…",
    saved: "Estilo aplicado. Haz un hard-refresh en las páginas publicadas para ver los cambios.",
    failed: "Error al actualizar el estilo.",
    reset: "Restablecer valores por defecto",
    resetting: "Restableciendo…"
  },
  presets: {
    title: "Preset de estilo",
    help: "Elige un preset gráfico para rellenar todos los campos. Puedes ajustar valor por valor después.",
    editorial: {
      label: "Editorial",
      description: "Look editorial original — Newsreader sobre Work Sans, superficies neutras."
    },
    news: {
      label: "Periódico",
      description: "Look de periódico de alto contraste — Playfair Display + IBM Plex Sans sobre crema, acento rojo profundo."
    },
    literary: {
      label: "Literario",
      description: "Superficies crema cálidas y marrones intensos — EB Garamond + Manrope para lectura larga."
    },
    modernist: {
      label: "Modernista",
      description: "Grises fríos con acento índigo — Spectral + Outfit, sensación editorial contemporánea."
    },
    boutique: {
      label: "Boutique",
      description: "Superficies crema con acento terracota — Lora + Plus Jakarta Sans, look boutique refinado."
    }
  },
  groups: {
    surfaces: "Superficies",
    foreground: "Texto",
    outlines: "Contornos",
    accent: "Acento",
    typography: "Tipografía"
  },
  vars: {
    background: "Fondo de página",
    surface: "Superficie",
    surfaceLow: "Superficie — baja",
    surfaceMid: "Superficie — media",
    surfaceHigh: "Superficie — alta",
    onSurface: "Texto principal",
    onSurfaceVariant: "Texto secundario",
    outline: "Contorno",
    outlineVariant: "Contorno — sutil",
    primary: "Primario",
    onPrimary: "Texto sobre primario",
    primaryContainer: "Contenedor primario",
    onPrimaryContainer: "Texto sobre contenedor primario",
    secondary: "Acento (enlaces, etiquetas)"
  },
  fonts: {
    serif: "Serif (títulos y entradillas)",
    sans: "Sans-serif (cuerpo y UI)",
    help: "Las fuentes vienen de Google Fonts. La línea @import del CSS se reescribe al guardar."
  },
  home: {
    help: "Elige cómo se distribuye la página de inicio. El publisher aplica las variantes en la próxima publicación.",
    save: "Guardar",
    saving: "Guardando…",
    saved: "Diseño guardado. Vuelve a publicar o espera a la próxima publicación.",
    failed: "Error al guardar.",
    mostReadCount: "Elementos en Más leídos",
    mostReadCountHelp: "Número de elementos en el widget Más leídos. De 1 a 10.",
    featuredLabel: "Texto de la etiqueta destacada",
    latestHeading: "Título de los últimos artículos",
    mostReadHeading: "Título de «Lo más leído»",
    textsHelp: "Déjelo vacío para usar el texto predeterminado del tema en el idioma del sitio.",
    sidebarTop: "Barra lateral — superior",
    sidebarBottom: "Barra lateral — inferior",
    sidebarVariants: { mostRead: "Más leídos", promo: "Tarjeta promo", none: "Vacío" },
    promoSection: "Tarjeta promo",
    promoSectionHelp: "Se usa cuando un slot de la barra lateral está en «Tarjeta promo». Deja los campos vacíos para ocultar el slot.",
    promoImage: "URL de la imagen",
    promoImageHelp: "Pega la URL de una imagen alojada en tu sitio (Biblioteca de medios) o en otro lugar.",
    promoImageAlt: "Texto alternativo",
    promoEyebrow: "Etiqueta",
    promoTitle: "Título",
    promoHref: "URL de destino"
  },
  header: {
    help: "Ajusta la silueta del encabezado.",
    save: "Guardar",
    saving: "Guardando…",
    saved: "Configuración del encabezado guardada.",
    failed: "Error al guardar.",
    brandPosition: "Posición del wordmark",
    brandPositions: { centered: "Centrado", left: "Alineado a la izquierda" },
    showSearch: "Mostrar botón de búsqueda",
    showSearchHelp: "Activa un botón en el encabezado que abre el modal agentcms-search (cuando el plugin está habilitado)."
  }
}, Ti = {
  description: "Pas het actieve thema aan. Wijzigingen beïnvloeden elke gepubliceerde pagina bij de volgende lading (browsers kunnen CSS cachen — een hard-refresh helpt).",
  tabs: { logo: "Logo", style: "Stijl", home: "Home", header: "Header" },
  logo: {
    help: "Upload een logo om het tekst-wordmark in de header te vervangen. Aanbevolen afmetingen: {{width}}×{{height}} px. De afbeelding wordt geschaald en als WebP opgeslagen.",
    none: "Geen logo ingesteld",
    upload: "Logo uploaden",
    uploading: "Uploaden…",
    change: "Logo wijzigen",
    remove: "Logo verwijderen",
    removing: "Verwijderen…",
    saved: "Logo bijgewerkt. Herlaad gepubliceerde pagina's om de wijziging te zien.",
    removed: "Logo verwijderd.",
    failed: "Logo-upload mislukt.",
    invalidType: "Kies een JPG-, PNG- of WebP-afbeelding."
  },
  style: {
    help: 'Tweak design-tokens om kleuren en typografie aan te passen. „Opslaan & toepassen" pusht een geregenereerde theme-CSS naar je site.',
    save: "Opslaan & toepassen",
    saving: "Toepassen…",
    saved: "Stijl toegepast. Hard-refresh op gepubliceerde pagina's om de wijzigingen te zien.",
    failed: "Stijl-update mislukt.",
    reset: "Standaardwaarden herstellen",
    resetting: "Herstellen…"
  },
  presets: {
    title: "Stijl-preset",
    help: "Kies een grafische preset om alle velden hieronder in te vullen. Je kunt waarden daarna individueel verfijnen.",
    editorial: {
      label: "Editorial",
      description: "Originele editorial baseline — Newsreader op Work Sans, neutrale vlakken."
    },
    news: {
      label: "Krant",
      description: "Krant-look met hoog contrast — Playfair Display + IBM Plex Sans op crème, dieprode accent."
    },
    literary: {
      label: "Literair",
      description: "Warme crème vlakken en rijke bruintinten — EB Garamond + Manrope voor longform lezen."
    },
    modernist: {
      label: "Modernistisch",
      description: "Koele grijzen met indigo-accent — Spectral + Outfit, hedendaags editorial gevoel."
    },
    boutique: {
      label: "Boutique",
      description: "Crème vlakken met terracotta-accent — Lora + Plus Jakarta Sans, verfijnde boutique vibe."
    }
  },
  groups: {
    surfaces: "Vlakken",
    foreground: "Tekst",
    outlines: "Contouren",
    accent: "Accent",
    typography: "Typografie"
  },
  vars: {
    background: "Pagina-achtergrond",
    surface: "Vlak",
    surfaceLow: "Vlak — laag",
    surfaceMid: "Vlak — midden",
    surfaceHigh: "Vlak — hoog",
    onSurface: "Hoofdtekst",
    onSurfaceVariant: "Secundaire tekst",
    outline: "Contour",
    outlineVariant: "Contour — subtiel",
    primary: "Primair",
    onPrimary: "Tekst op primair",
    primaryContainer: "Primair-container",
    onPrimaryContainer: "Tekst op primair-container",
    secondary: "Accent (links, eyebrows)"
  },
  fonts: {
    serif: "Serif (titels & inleiding)",
    sans: "Sans-serif (tekst & UI)",
    help: "Lettertypen komen van Google Fonts. De @import-regel in de CSS wordt bij het opslaan herschreven."
  },
  home: {
    help: "Kies hoe de homepage wordt opgebouwd. De publisher rendert de varianten bij de volgende publicatie.",
    save: "Opslaan",
    saving: "Opslaan…",
    saved: "Home-layout opgeslagen. Opnieuw publiceren of de volgende publicatie afwachten.",
    failed: "Opslaan mislukt.",
    mostReadCount: "Aantal Most Read-items",
    mostReadCountHelp: "Aantal items in het Most Read-widget. 1–10.",
    featuredLabel: "Tekst van het uitgelicht-label",
    latestHeading: "Kop van de nieuwste berichten",
    mostReadHeading: "Kop van „Meest gelezen”",
    textsHelp: "Leeg laten voor de standaardtekst van het thema in de taal van de site.",
    sidebarTop: "Sidebar — boven",
    sidebarBottom: "Sidebar — onder",
    sidebarVariants: { mostRead: "Meest gelezen", promo: "Promokaart", none: "Leeg" },
    promoSection: "Promokaart",
    promoSectionHelp: 'Wordt gebruikt wanneer een sidebar-slot is ingesteld op „Promokaart". Laat de velden leeg om de slot te verbergen.',
    promoImage: "Afbeeldings-URL",
    promoImageHelp: "Plak de URL van een afbeelding die op je site (Mediabibliotheek) of elders wordt gehost.",
    promoImageAlt: "Alt-tekst",
    promoEyebrow: "Eyebrow-label",
    promoTitle: "Titel",
    promoHref: "Bestemmings-URL"
  },
  header: {
    help: "Pas de silhouette van de header aan.",
    save: "Opslaan",
    saving: "Opslaan…",
    saved: "Header-instellingen opgeslagen.",
    failed: "Opslaan mislukt.",
    brandPosition: "Positie van het wordmark",
    brandPositions: { centered: "Gecentreerd", left: "Links uitgelijnd" },
    showSearch: "Zoekknop tonen",
    showSearchHelp: "Activeert een knop in de header die de agentcms-search-modal opent (als de plugin aan staat)."
  }
}, Mi = {
  description: "Personalize o tema ativo. As alterações afetam todas as páginas publicadas no próximo carregamento (o navegador pode armazenar em cache o CSS — um hard-refresh resolve).",
  tabs: { logo: "Logo", style: "Estilo", home: "Início", header: "Cabeçalho" },
  logo: {
    help: "Faça upload de um logo para substituir o wordmark de texto no cabeçalho. Dimensões recomendadas: {{width}}×{{height}} px. A imagem é redimensionada e salva como WebP.",
    none: "Nenhum logo definido",
    upload: "Enviar logo",
    uploading: "Enviando…",
    change: "Alterar logo",
    remove: "Remover logo",
    removing: "Removendo…",
    saved: "Logo atualizado. Recarregue as páginas publicadas para ver a mudança.",
    removed: "Logo removido.",
    failed: "Falha no upload do logo.",
    invalidType: "Escolha uma imagem JPG, PNG ou WebP."
  },
  style: {
    help: "Ajuste tokens de design para personalizar cores e tipografia. «Salvar e aplicar» envia um CSS regenerado para o seu site.",
    save: "Salvar e aplicar",
    saving: "Aplicando…",
    saved: "Estilo aplicado. Hard-refresh nas páginas publicadas para ver as mudanças.",
    failed: "Falha ao atualizar o estilo.",
    reset: "Restaurar valores padrão",
    resetting: "Restaurando…"
  },
  presets: {
    title: "Predefinição de estilo",
    help: "Escolha uma predefinição gráfica para preencher todos os campos abaixo. Pode ajustar valor a valor depois.",
    editorial: {
      label: "Editorial",
      description: "Look editorial original — Newsreader sobre Work Sans, superfícies neutras."
    },
    news: {
      label: "Jornal",
      description: "Look de jornal de alto contraste — Playfair Display + IBM Plex Sans sobre creme, acento vermelho profundo."
    },
    literary: {
      label: "Literário",
      description: "Superfícies creme quentes e castanhos ricos — EB Garamond + Manrope para leitura longa."
    },
    modernist: {
      label: "Modernista",
      description: "Cinzas frios com acento índigo — Spectral + Outfit, sensação editorial contemporânea."
    },
    boutique: {
      label: "Boutique",
      description: "Superfícies creme com acento terracota — Lora + Plus Jakarta Sans, look boutique refinado."
    }
  },
  groups: {
    surfaces: "Superfícies",
    foreground: "Texto",
    outlines: "Contornos",
    accent: "Acento",
    typography: "Tipografia"
  },
  vars: {
    background: "Fundo da página",
    surface: "Superfície",
    surfaceLow: "Superfície — baixa",
    surfaceMid: "Superfície — média",
    surfaceHigh: "Superfície — alta",
    onSurface: "Texto principal",
    onSurfaceVariant: "Texto secundário",
    outline: "Contorno",
    outlineVariant: "Contorno — sutil",
    primary: "Primário",
    onPrimary: "Texto sobre primário",
    primaryContainer: "Contêiner primário",
    onPrimaryContainer: "Texto sobre contêiner primário",
    secondary: "Acento (links, etiquetas)"
  },
  fonts: {
    serif: "Serif (títulos e linhas finas)",
    sans: "Sans-serif (corpo e UI)",
    help: "As fontes vêm do Google Fonts. A linha @import do CSS é reescrita ao salvar."
  },
  home: {
    help: "Escolha como a página inicial é montada. O publisher aplica as variantes na próxima publicação.",
    save: "Salvar",
    saving: "Salvando…",
    saved: "Layout salvo. Republique ou aguarde a próxima publicação para aplicar.",
    failed: "Falha ao salvar.",
    mostReadCount: "Itens em Mais lidos",
    mostReadCountHelp: "Número de itens no widget Mais lidos. De 1 a 10.",
    featuredLabel: "Texto do selo de destaque",
    latestHeading: "Título dos últimos artigos",
    mostReadHeading: "Título de «Mais lidos»",
    textsHelp: "Deixe vazio para usar o texto padrão do tema no idioma do site.",
    sidebarTop: "Barra lateral — topo",
    sidebarBottom: "Barra lateral — fundo",
    sidebarVariants: { mostRead: "Mais lidos", promo: "Cartão promo", none: "Vazio" },
    promoSection: "Cartão promo",
    promoSectionHelp: "Usado quando um slot da barra lateral está em «Cartão promo». Deixe os campos vazios para ocultar o slot.",
    promoImage: "URL da imagem",
    promoImageHelp: "Cole a URL de uma imagem hospedada no seu site (Biblioteca de mídia) ou em outro lugar.",
    promoImageAlt: "Texto alternativo",
    promoEyebrow: "Etiqueta",
    promoTitle: "Título",
    promoHref: "URL de destino"
  },
  header: {
    help: "Ajuste a silhueta do cabeçalho.",
    save: "Salvar",
    saving: "Salvando…",
    saved: "Configurações do cabeçalho salvas.",
    failed: "Falha ao salvar.",
    brandPosition: "Posição do wordmark",
    brandPositions: { centered: "Centralizado", left: "Alinhado à esquerda" },
    showSearch: "Mostrar botão de pesquisa",
    showSearchHelp: "Ativa um botão no cabeçalho que abre o modal agentcms-search (quando o plugin está habilitado)."
  }
}, zi = {
  description: "활성 테마를 사용자 지정합니다. 변경 사항은 게시된 모든 페이지의 다음 로드 시 적용됩니다 (브라우저가 CSS를 캐시할 수 있으니 한 번 하드 새로고침해 주세요).",
  tabs: { logo: "로고", style: "스타일", home: "홈", header: "헤더" },
  logo: {
    help: "헤더의 텍스트 워드마크를 대체할 로고를 업로드합니다. 권장 크기: {{width}}×{{height}} px. 이미지는 크기가 조정되어 WebP로 저장됩니다.",
    none: "로고가 설정되지 않음",
    upload: "로고 업로드",
    uploading: "업로드 중…",
    change: "로고 변경",
    remove: "로고 제거",
    removing: "제거 중…",
    saved: "로고가 업데이트되었습니다. 게시된 페이지를 다시 로드하여 변경 사항을 확인하세요.",
    removed: "로고가 제거되었습니다.",
    failed: "로고 업로드에 실패했습니다.",
    invalidType: "JPG, PNG 또는 WebP 이미지를 선택하세요."
  },
  style: {
    help: "디자인 토큰을 조정하여 색상과 타이포그래피를 사용자 지정합니다. 「저장 및 적용」은 재생성된 테마 CSS를 사이트에 푸시합니다.",
    save: "저장 및 적용",
    saving: "적용 중…",
    saved: "스타일이 적용되었습니다. 게시된 페이지에서 하드 새로고침하여 변경 사항을 확인하세요.",
    failed: "스타일 업데이트에 실패했습니다.",
    reset: "기본값으로 재설정",
    resetting: "재설정 중…"
  },
  presets: {
    title: "스타일 프리셋",
    help: "그래픽 프리셋을 선택하면 아래 모든 필드가 자동으로 채워집니다. 이후에 값을 개별적으로 조정할 수 있습니다.",
    editorial: {
      label: "에디토리얼",
      description: "원본 에디토리얼 기본 — Newsreader와 Work Sans, 중성 표면."
    },
    news: {
      label: "신문",
      description: "고대비 신문 룩 — 크림 위 Playfair Display와 IBM Plex Sans, 진한 빨강 강조색."
    },
    literary: {
      label: "문학",
      description: "따뜻한 크림 표면과 풍부한 갈색 — EB Garamond와 Manrope, 롱폼 독서에 어울립니다."
    },
    modernist: {
      label: "모더니스트",
      description: "차가운 회색과 인디고 강조색 — Spectral와 Outfit, 현대적 에디토리얼 감성."
    },
    boutique: {
      label: "부티크",
      description: "크림 표면과 테라코타 강조색 — Lora와 Plus Jakarta Sans, 세련된 부티크 분위기."
    }
  },
  groups: {
    surfaces: "표면",
    foreground: "텍스트",
    outlines: "외곽선",
    accent: "강조색",
    typography: "타이포그래피"
  },
  vars: {
    background: "페이지 배경",
    surface: "표면",
    surfaceLow: "표면 — 낮음",
    surfaceMid: "표면 — 중간",
    surfaceHigh: "표면 — 높음",
    onSurface: "본문",
    onSurfaceVariant: "보조 텍스트",
    outline: "외곽선",
    outlineVariant: "외곽선 — 미묘",
    primary: "기본",
    onPrimary: "기본 위 텍스트",
    primaryContainer: "기본 컨테이너",
    onPrimaryContainer: "기본 컨테이너 위 텍스트",
    secondary: "강조 (링크, 아이브로우)"
  },
  fonts: {
    serif: "Serif (제목 및 레드)",
    sans: "Sans-serif (본문 및 UI)",
    help: "글꼴은 Google Fonts에서 제공됩니다. CSS @import 줄은 저장 시 다시 작성됩니다."
  },
  home: {
    help: "홈페이지 레이아웃을 선택합니다. 다음 게시 시 변형이 적용됩니다.",
    save: "저장",
    saving: "저장 중…",
    saved: "홈 레이아웃이 저장되었습니다. 다시 게시하거나 다음 게시를 기다리세요.",
    failed: "저장에 실패했습니다.",
    mostReadCount: "Most Read 항목 수",
    mostReadCountHelp: "Most Read 위젯의 항목 수. 1–10.",
    featuredLabel: "추천 배지 문구",
    latestHeading: "최신 글 제목",
    mostReadHeading: "많이 읽은 글 제목",
    textsHelp: "비워 두면 사이트 언어의 테마 기본 문구를 사용합니다.",
    sidebarTop: "사이드바 — 상단",
    sidebarBottom: "사이드바 — 하단",
    sidebarVariants: { mostRead: "많이 읽은 글", promo: "프로모션 카드", none: "비어 있음" },
    promoSection: "프로모션 카드",
    promoSectionHelp: "사이드바 슬롯이 「프로모션 카드」로 설정되었을 때 사용됩니다. 슬롯을 숨기려면 필드를 비워 두세요.",
    promoImage: "이미지 URL",
    promoImageHelp: "사이트(미디어 라이브러리) 또는 다른 곳에 호스팅된 이미지의 URL을 붙여넣으세요.",
    promoImageAlt: "대체 텍스트",
    promoEyebrow: "아이브로우 레이블",
    promoTitle: "제목",
    promoHref: "이동할 URL"
  },
  header: {
    help: "헤더 실루엣을 조정합니다.",
    save: "저장",
    saving: "저장 중…",
    saved: "헤더 설정이 저장되었습니다.",
    failed: "저장에 실패했습니다.",
    brandPosition: "워드마크 위치",
    brandPositions: { centered: "중앙", left: "왼쪽 정렬" },
    showSearch: "검색 트리거 표시",
    showSearchHelp: "헤더에 agentcms-search 모달을 여는 버튼을 활성화합니다 (플러그인이 활성화된 경우)."
  }
}, Ii = {
  title: "Theme settings",
  settings: Ci,
  publicBaked: {
    home: "Home",
    backToHome: "Back to home",
    notFoundTitle: "404",
    notFoundMessage: "The page you are looking for does not exist.",
    section: "Section",
    author: "Author",
    noPostsCategory: "No posts in this category yet.",
    noPostsAuthor: "No posts by this author yet.",
    follow: "Follow",
    follow404: "RSS feed for {{name}}",
    search: "Search",
    menu: "Open menu",
    subscribe: "Subscribe",
    latestListHeading: "Latest Intelligence",
    loadMore: "Load more stories",
    categories: "Categories",
    sections: "Sections",
    popularTags: "Popular Tags",
    recentPublications: "Recent Publications",
    minRead: "{{minutes}} min read",
    relatedFromSite: "Latest from {{site}}"
  },
  blocks: {
    unknownPost: "Unknown post",
    magazineHero: {
      title: "Magazine hero",
      featured: "Featured post",
      secondary1: "Secondary post 1",
      secondary2: "Secondary post 2",
      latestLabel: "Latest article (auto)",
      autoLabel: "Next most recent (auto)",
      showCategory: "Show category eyebrow",
      showAuthor: "Show author byline (slot 2)",
      showFeaturedBadge: 'Show "Featured" badge',
      // Public-baked: overlay label on the big article image.
      featuredLabel: "FEATURED"
    },
    mostRead: {
      title: "Most read",
      preview: "{{count}} most recent posts",
      count: "Number of items",
      showHeading: "Show heading",
      // Public-baked: section heading rendered above the list.
      heading: "Most Read"
    },
    promoCard: {
      title: "Promo card",
      untitled: "(no title)",
      imageUrl: "Image URL",
      imageUrlHelp: "Paste the URL of an image hosted on your site (Media library) or anywhere else.",
      imageAlt: "Alt text",
      eyebrow: "Eyebrow label",
      heading: "Heading",
      href: "Click target URL",
      // Public-baked fallback when the eyebrow field is left empty.
      defaultEyebrow: "Promoted"
    }
  }
}, Ri = {
  title: "Paramètres du thème",
  settings: Ni,
  publicBaked: {
    home: "Accueil",
    backToHome: "Retour à l'accueil",
    notFoundTitle: "404",
    notFoundMessage: "La page que vous cherchez n'existe pas.",
    section: "Rubrique",
    author: "Auteur",
    noPostsCategory: "Aucun article dans cette rubrique pour l'instant.",
    noPostsAuthor: "Aucun article de cet auteur pour l'instant.",
    follow: "Suivre",
    follow404: "Flux RSS pour {{name}}",
    search: "Rechercher",
    menu: "Ouvrir le menu",
    subscribe: "S'abonner",
    latestListHeading: "Dernières analyses",
    loadMore: "Voir plus d'articles",
    categories: "Catégories",
    sections: "Rubriques",
    popularTags: "Tags populaires",
    recentPublications: "Publications récentes",
    minRead: "{{minutes}} min de lecture",
    relatedFromSite: "À lire sur {{site}}"
  },
  blocks: {
    unknownPost: "Article inconnu",
    magazineHero: {
      title: "Hero magazine",
      featured: "Article en une",
      secondary1: "Article secondaire 1",
      secondary2: "Article secondaire 2",
      latestLabel: "Dernier article (auto)",
      autoLabel: "Prochain plus récent (auto)",
      showCategory: "Afficher la rubrique",
      showAuthor: "Afficher l'auteur (slot 2)",
      showFeaturedBadge: "Afficher le badge « À la une »",
      featuredLabel: "À LA UNE"
    },
    mostRead: {
      title: "Les plus lus",
      preview: "{{count}} articles les plus récents",
      count: "Nombre d'éléments",
      showHeading: "Afficher le titre",
      heading: "Les plus lus"
    },
    promoCard: {
      title: "Carte sponsorisée",
      untitled: "(sans titre)",
      imageUrl: "URL de l'image",
      imageUrlHelp: "Collez l'URL d'une image hébergée sur votre site (Médiathèque) ou ailleurs.",
      imageAlt: "Texte alternatif",
      eyebrow: "Étiquette",
      heading: "Titre",
      href: "URL de destination",
      defaultEyebrow: "Sponsorisé"
    }
  }
}, Li = {
  title: "Theme-Einstellungen",
  settings: Ei,
  publicBaked: {
    home: "Startseite",
    backToHome: "Zurück zur Startseite",
    notFoundTitle: "404",
    notFoundMessage: "Die gesuchte Seite existiert nicht.",
    section: "Rubrik",
    author: "Autor",
    noPostsCategory: "Noch keine Artikel in dieser Rubrik.",
    noPostsAuthor: "Noch keine Artikel von diesem Autor.",
    follow: "Folgen",
    follow404: "RSS-Feed für {{name}}",
    search: "Suchen",
    menu: "Menü öffnen",
    subscribe: "Abonnieren",
    latestListHeading: "Neueste Analysen",
    loadMore: "Mehr Beiträge laden",
    categories: "Kategorien",
    sections: "Rubriken",
    popularTags: "Beliebte Tags",
    recentPublications: "Neueste Veröffentlichungen",
    minRead: "{{minutes}} Min. Lesezeit",
    relatedFromSite: "Neueste auf {{site}}"
  },
  blocks: {
    unknownPost: "Unbekannter Beitrag",
    magazineHero: {
      title: "Magazin-Hero",
      featured: "Hauptbeitrag",
      secondary1: "Sekundärbeitrag 1",
      secondary2: "Sekundärbeitrag 2",
      latestLabel: "Neuester Beitrag (auto)",
      autoLabel: "Nächster neuester (auto)",
      showCategory: "Kategorie anzeigen",
      showAuthor: "Autor anzeigen (Slot 2)",
      showFeaturedBadge: '"Featured"-Abzeichen anzeigen',
      featuredLabel: "FEATURED"
    },
    mostRead: {
      title: "Meistgelesen",
      preview: "{{count}} neueste Beiträge",
      count: "Anzahl der Elemente",
      showHeading: "Überschrift anzeigen",
      heading: "Meistgelesen"
    },
    promoCard: {
      title: "Werbekarte",
      untitled: "(kein Titel)",
      imageUrl: "Bild-URL",
      imageUrlHelp: "Fügen Sie die URL eines Bildes ein, das auf Ihrer Website (Medienbibliothek) oder anderswo gehostet wird.",
      imageAlt: "Alt-Text",
      eyebrow: "Eyebrow-Label",
      heading: "Überschrift",
      href: "Ziel-URL",
      defaultEyebrow: "Gesponsert"
    }
  }
}, Pi = {
  title: "Ajustes del tema",
  settings: Ai,
  publicBaked: {
    home: "Inicio",
    backToHome: "Volver al inicio",
    notFoundTitle: "404",
    notFoundMessage: "La página que buscas no existe.",
    section: "Sección",
    author: "Autor",
    noPostsCategory: "Todavía no hay artículos en esta sección.",
    noPostsAuthor: "Todavía no hay artículos de este autor.",
    follow: "Seguir",
    follow404: "Feed RSS para {{name}}",
    search: "Buscar",
    menu: "Abrir menú",
    subscribe: "Suscribirse",
    latestListHeading: "Últimos análisis",
    loadMore: "Cargar más artículos",
    categories: "Categorías",
    sections: "Secciones",
    popularTags: "Etiquetas populares",
    recentPublications: "Publicaciones recientes",
    minRead: "{{minutes}} min de lectura",
    relatedFromSite: "Lo último de {{site}}"
  },
  blocks: {
    unknownPost: "Artículo desconocido",
    magazineHero: {
      title: "Hero de revista",
      featured: "Artículo destacado",
      secondary1: "Artículo secundario 1",
      secondary2: "Artículo secundario 2",
      latestLabel: "Último artículo (auto)",
      autoLabel: "Siguiente más reciente (auto)",
      showCategory: "Mostrar categoría",
      showAuthor: "Mostrar autor (slot 2)",
      showFeaturedBadge: "Mostrar insignia «Destacado»",
      featuredLabel: "DESTACADO"
    },
    mostRead: {
      title: "Más leídos",
      preview: "{{count}} artículos más recientes",
      count: "Número de elementos",
      showHeading: "Mostrar título",
      heading: "Más leídos"
    },
    promoCard: {
      title: "Tarjeta promocional",
      untitled: "(sin título)",
      imageUrl: "URL de la imagen",
      imageUrlHelp: "Pega la URL de una imagen alojada en tu sitio (Biblioteca de medios) o en otro lugar.",
      imageAlt: "Texto alternativo",
      eyebrow: "Etiqueta",
      heading: "Título",
      href: "URL de destino",
      defaultEyebrow: "Patrocinado"
    }
  }
}, Oi = {
  title: "Thema-instellingen",
  settings: Ti,
  publicBaked: {
    home: "Home",
    backToHome: "Terug naar home",
    notFoundTitle: "404",
    notFoundMessage: "De pagina die je zoekt bestaat niet.",
    section: "Rubriek",
    author: "Auteur",
    noPostsCategory: "Nog geen artikelen in deze rubriek.",
    noPostsAuthor: "Nog geen artikelen van deze auteur.",
    follow: "Volgen",
    follow404: "RSS-feed voor {{name}}",
    search: "Zoeken",
    menu: "Menu openen",
    subscribe: "Abonneren",
    latestListHeading: "Laatste analyses",
    loadMore: "Meer berichten laden",
    categories: "Categorieën",
    sections: "Rubrieken",
    popularTags: "Populaire tags",
    recentPublications: "Recente publicaties",
    minRead: "{{minutes}} min leestijd",
    relatedFromSite: "Laatste van {{site}}"
  },
  blocks: {
    unknownPost: "Onbekend bericht",
    magazineHero: {
      title: "Magazine-hero",
      featured: "Hoofdbericht",
      secondary1: "Tweede bericht 1",
      secondary2: "Tweede bericht 2",
      latestLabel: "Nieuwste bericht (auto)",
      autoLabel: "Volgende nieuwste (auto)",
      showCategory: "Categorie tonen",
      showAuthor: "Auteur tonen (slot 2)",
      showFeaturedBadge: '"Uitgelicht"-badge tonen',
      featuredLabel: "UITGELICHT"
    },
    mostRead: {
      title: "Meest gelezen",
      preview: "{{count}} nieuwste berichten",
      count: "Aantal items",
      showHeading: "Kop tonen",
      heading: "Meest gelezen"
    },
    promoCard: {
      title: "Promokaart",
      untitled: "(geen titel)",
      imageUrl: "Afbeeldings-URL",
      imageUrlHelp: "Plak de URL van een afbeelding die op je site (Mediabibliotheek) of elders wordt gehost.",
      imageAlt: "Alt-tekst",
      eyebrow: "Eyebrow-label",
      heading: "Titel",
      href: "Bestemmings-URL",
      defaultEyebrow: "Gesponsord"
    }
  }
}, Bi = {
  title: "Configurações do tema",
  settings: Mi,
  publicBaked: {
    home: "Início",
    backToHome: "Voltar ao início",
    notFoundTitle: "404",
    notFoundMessage: "A página que você procura não existe.",
    section: "Seção",
    author: "Autor",
    noPostsCategory: "Ainda não há artigos nesta seção.",
    noPostsAuthor: "Ainda não há artigos deste autor.",
    follow: "Seguir",
    follow404: "Feed RSS para {{name}}",
    search: "Pesquisar",
    menu: "Abrir menu",
    subscribe: "Assinar",
    latestListHeading: "Últimas análises",
    loadMore: "Carregar mais artigos",
    categories: "Categorias",
    sections: "Seções",
    popularTags: "Tags populares",
    recentPublications: "Publicações recentes",
    minRead: "{{minutes}} min de leitura",
    relatedFromSite: "Mais recentes de {{site}}"
  },
  blocks: {
    unknownPost: "Post desconhecido",
    magazineHero: {
      title: "Hero de revista",
      featured: "Post em destaque",
      secondary1: "Post secundário 1",
      secondary2: "Post secundário 2",
      latestLabel: "Último post (auto)",
      autoLabel: "Próximo mais recente (auto)",
      showCategory: "Mostrar categoria",
      showAuthor: "Mostrar autor (slot 2)",
      showFeaturedBadge: "Mostrar selo «Em destaque»",
      featuredLabel: "EM DESTAQUE"
    },
    mostRead: {
      title: "Mais lidos",
      preview: "{{count}} posts mais recentes",
      count: "Número de itens",
      showHeading: "Mostrar título",
      heading: "Mais lidos"
    },
    promoCard: {
      title: "Cartão promocional",
      untitled: "(sem título)",
      imageUrl: "URL da imagem",
      imageUrlHelp: "Cole a URL de uma imagem hospedada no seu site (Biblioteca de mídia) ou em outro lugar.",
      imageAlt: "Texto alternativo",
      eyebrow: "Etiqueta",
      heading: "Título",
      href: "URL de destino",
      defaultEyebrow: "Patrocinado"
    }
  }
}, Fi = {
  title: "테마 설정",
  settings: zi,
  publicBaked: {
    home: "홈",
    backToHome: "홈으로 돌아가기",
    notFoundTitle: "404",
    notFoundMessage: "찾으시는 페이지가 존재하지 않습니다.",
    section: "섹션",
    author: "저자",
    noPostsCategory: "이 섹션에는 아직 게시물이 없습니다.",
    noPostsAuthor: "이 저자의 게시물이 아직 없습니다.",
    follow: "팔로우",
    follow404: "{{name}} RSS 피드",
    search: "검색",
    menu: "메뉴 열기",
    subscribe: "구독",
    latestListHeading: "최신 분석",
    loadMore: "기사 더 보기",
    categories: "카테고리",
    sections: "섹션",
    popularTags: "인기 태그",
    recentPublications: "최근 발행물",
    minRead: "{{minutes}}분 읽기",
    relatedFromSite: "{{site}} 최신 글"
  },
  blocks: {
    unknownPost: "알 수 없는 게시물",
    magazineHero: {
      title: "매거진 히어로",
      featured: "주요 게시물",
      secondary1: "보조 게시물 1",
      secondary2: "보조 게시물 2",
      latestLabel: "최신 게시물 (자동)",
      autoLabel: "다음 최신 (자동)",
      showCategory: "카테고리 표시",
      showAuthor: "저자 표시 (슬롯 2)",
      showFeaturedBadge: "「추천」 배지 표시",
      featuredLabel: "추천"
    },
    mostRead: {
      title: "많이 읽은 글",
      preview: "최근 게시물 {{count}}개",
      count: "항목 수",
      showHeading: "제목 표시",
      heading: "많이 읽은 글"
    },
    promoCard: {
      title: "프로모션 카드",
      untitled: "(제목 없음)",
      imageUrl: "이미지 URL",
      imageUrlHelp: "사이트(미디어 라이브러리) 또는 다른 곳에 호스팅된 이미지의 URL을 붙여넣으세요.",
      imageAlt: "대체 텍스트",
      eyebrow: "아이브로우 레이블",
      heading: "제목",
      href: "이동할 URL",
      defaultEyebrow: "프로모션"
    }
  }
};
/**
 * @license lucide-react v0.460.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const Hi = (r) => r.replace(/([a-z0-9])([A-Z])/g, "$1-$2").toLowerCase(), $n = (...r) => r.filter((e, t, n) => !!e && e.trim() !== "" && n.indexOf(e) === t).join(" ").trim();
/**
 * @license lucide-react v0.460.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
var ji = {
  xmlns: "http://www.w3.org/2000/svg",
  width: 24,
  height: 24,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2,
  strokeLinecap: "round",
  strokeLinejoin: "round"
};
/**
 * @license lucide-react v0.460.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const $i = At(
  ({
    color: r = "currentColor",
    size: e = 24,
    strokeWidth: t = 2,
    absoluteStrokeWidth: n,
    className: i = "",
    children: a,
    iconNode: o,
    ...s
  }, l) => Ze(
    "svg",
    {
      ref: l,
      ...ji,
      width: e,
      height: e,
      stroke: r,
      strokeWidth: n ? Number(t) * 24 / Number(e) : t,
      className: $n("lucide", i),
      ...s
    },
    [
      ...o.map(([c, h]) => Ze(c, h)),
      ...Array.isArray(a) ? a : [a]
    ]
  )
);
/**
 * @license lucide-react v0.460.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const Z = (r, e) => {
  const t = At(
    ({ className: n, ...i }, a) => Ze($i, {
      ref: a,
      iconNode: e,
      className: $n(`lucide-${Hi(r)}`, n),
      ...i
    })
  );
  return t.displayName = `${r}`, t;
};
/**
 * @license lucide-react v0.460.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const Di = Z("Image", [
  ["rect", { width: "18", height: "18", x: "3", y: "3", rx: "2", ry: "2", key: "1m3agn" }],
  ["circle", { cx: "9", cy: "9", r: "2", key: "af1f0g" }],
  ["path", { d: "m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21", key: "1xmnt7" }]
]);
/**
 * @license lucide-react v0.460.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const Dn = Z("ListOrdered", [
  ["path", { d: "M10 12h11", key: "6m4ad9" }],
  ["path", { d: "M10 18h11", key: "11hvi2" }],
  ["path", { d: "M10 6h11", key: "c7qv1k" }],
  ["path", { d: "M4 10h2", key: "16xx2s" }],
  ["path", { d: "M4 6h1v4", key: "cnovpq" }],
  ["path", { d: "M6 18H4c0-1 2-2 2-3s-1-1.5-2-1", key: "m9a95d" }]
]);
/**
 * @license lucide-react v0.460.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const we = Z("LoaderCircle", [
  ["path", { d: "M21 12a9 9 0 1 1-6.219-8.56", key: "13zald" }]
]);
/**
 * @license lucide-react v0.460.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const Un = Z("Megaphone", [
  ["path", { d: "m3 11 18-5v12L3 14v-3z", key: "n962bs" }],
  ["path", { d: "M11.6 16.8a3 3 0 1 1-5.8-1.6", key: "1yl0tm" }]
]);
/**
 * @license lucide-react v0.460.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const Vn = Z("Newspaper", [
  [
    "path",
    {
      d: "M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 1-2 2Zm0 0a2 2 0 0 1-2-2v-9c0-1.1.9-2 2-2h2",
      key: "7pis2x"
    }
  ],
  ["path", { d: "M18 14h-8", key: "sponae" }],
  ["path", { d: "M15 18h-5", key: "95g1m2" }],
  ["path", { d: "M10 6h8v4h-8V6Z", key: "smlsk5" }]
]);
/**
 * @license lucide-react v0.460.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const Ui = Z("Palette", [
  ["circle", { cx: "13.5", cy: "6.5", r: ".5", fill: "currentColor", key: "1okk4w" }],
  ["circle", { cx: "17.5", cy: "10.5", r: ".5", fill: "currentColor", key: "f64h9f" }],
  ["circle", { cx: "8.5", cy: "7.5", r: ".5", fill: "currentColor", key: "fotxhn" }],
  ["circle", { cx: "6.5", cy: "12.5", r: ".5", fill: "currentColor", key: "qy21gx" }],
  [
    "path",
    {
      d: "M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.554C21.965 6.012 17.461 2 12 2z",
      key: "12rzf8"
    }
  ]
]);
/**
 * @license lucide-react v0.460.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const qn = Z("RotateCcw", [
  ["path", { d: "M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8", key: "1357e3" }],
  ["path", { d: "M3 3v5h5", key: "1xhq8a" }]
]);
/**
 * @license lucide-react v0.460.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const Mt = Z("Save", [
  [
    "path",
    {
      d: "M15.2 3a2 2 0 0 1 1.4.6l3.8 3.8a2 2 0 0 1 .6 1.4V19a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z",
      key: "1c8476"
    }
  ],
  ["path", { d: "M17 21v-7a1 1 0 0 0-1-1H8a1 1 0 0 0-1 1v7", key: "1ydtos" }],
  ["path", { d: "M7 3v4a1 1 0 0 0 1 1h7", key: "t51u73" }]
]);
/**
 * @license lucide-react v0.460.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const Vi = Z("Trash2", [
  ["path", { d: "M3 6h18", key: "d0wm0j" }],
  ["path", { d: "M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6", key: "4alrt4" }],
  ["path", { d: "M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2", key: "v07s0e" }],
  ["line", { x1: "10", x2: "10", y1: "11", y2: "17", key: "1uufr5" }],
  ["line", { x1: "14", x2: "14", y1: "11", y2: "17", key: "xtxkd" }]
]);
/**
 * @license lucide-react v0.460.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const qi = Z("Upload", [
  ["path", { d: "M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4", key: "ih7n3h" }],
  ["polyline", { points: "17 8 12 3 7 8", key: "t8dd8p" }],
  ["line", { x1: "12", x2: "12", y1: "3", y2: "15", key: "widbto" }]
]), $e = "magazine", nn = 480, rn = 144, _i = "contain", an = ["image/jpeg", "image/png", "image/webp"];
function Wi({
  config: r,
  save: e
}) {
  const { t } = q("theme-magazine"), [n, i] = K("logo");
  return /* @__PURE__ */ g("div", { className: "space-y-6", children: [
    /* @__PURE__ */ d("p", { className: "text-sm text-surface-600 dark:text-surface-300", children: t("settings.description") }),
    /* @__PURE__ */ g(
      "nav",
      {
        className: "flex flex-wrap gap-1 border-b border-surface-200 dark:border-surface-800",
        "aria-label": t("title"),
        children: [
          /* @__PURE__ */ d(De, { active: n === "logo", onClick: () => i("logo"), label: t("settings.tabs.logo") }),
          /* @__PURE__ */ d(De, { active: n === "style", onClick: () => i("style"), label: t("settings.tabs.style") }),
          /* @__PURE__ */ d(De, { active: n === "home", onClick: () => i("home"), label: t("settings.tabs.home") }),
          /* @__PURE__ */ d(De, { active: n === "header", onClick: () => i("header"), label: t("settings.tabs.header") })
        ]
      }
    ),
    n === "logo" && /* @__PURE__ */ d(Ji, { config: r, save: e }),
    n === "style" && /* @__PURE__ */ d(Gi, { config: r, save: e }),
    n === "home" && /* @__PURE__ */ d(Zi, { config: r, save: e }),
    n === "header" && /* @__PURE__ */ d(Yi, { config: r, save: e })
  ] });
}
function De({
  active: r,
  onClick: e,
  label: t
}) {
  return /* @__PURE__ */ d(
    "button",
    {
      type: "button",
      onClick: e,
      className: r ? "px-3 py-2 text-sm font-medium -mb-px border-b-2 border-blue-600 text-surface-900 dark:text-surface-50" : "px-3 py-2 text-sm font-medium -mb-px border-b-2 border-transparent text-surface-500 hover:text-surface-900 dark:text-surface-400 dark:hover:text-surface-100",
      children: t
    }
  );
}
function Ji({
  config: r,
  save: e
}) {
  const { t } = q("theme-magazine"), { settings: n, terms: i } = Zr(), [a, o] = K(!1), [s, l] = K(!1), c = ni(null), h = r.logoEnabled && n.baseUrl ? `${n.baseUrl.replace(/\/+$/, "")}/${Yr($e)}?v=${r.logoUpdatedAt}` : "";
  async function u(b) {
    const m = {
      ...n,
      themeConfigs: { ...n.themeConfigs, [$e]: b }
    };
    try {
      const [y, w] = await Promise.all([
        Zt({ type: "post" }),
        Zt({ type: "page" })
      ]);
      await ei(m, y, w, i);
    } catch (y) {
      console.error("[theme-magazine] menu.json refresh failed:", y);
    }
  }
  async function p(b) {
    if (!an.includes(b.type)) {
      D.error(t("settings.logo.invalidType"));
      return;
    }
    o(!0);
    try {
      await Xr({
        themeId: $e,
        file: b,
        width: nn,
        height: rn,
        fit: _i
      });
      const m = {
        ...r,
        logoEnabled: !0,
        logoUpdatedAt: Date.now()
      };
      await e(m), await u(m), D.success(t("settings.logo.saved"));
    } catch (m) {
      console.error("[theme-magazine] logo upload failed:", m), D.error(t("settings.logo.failed"));
    } finally {
      o(!1), c.current && (c.current.value = "");
    }
  }
  async function f() {
    l(!0);
    try {
      await Qr($e);
      const b = {
        ...r,
        logoEnabled: !1,
        logoUpdatedAt: 0
      };
      await e(b), await u(b), D.success(t("settings.logo.removed"));
    } catch (b) {
      console.error("[theme-magazine] logo remove failed:", b), D.error(t("settings.logo.failed"));
    } finally {
      l(!1);
    }
  }
  return /* @__PURE__ */ g("section", { className: "card p-4 space-y-4", children: [
    /* @__PURE__ */ d("p", { className: "text-xs text-surface-500 dark:text-surface-400", children: t("settings.logo.help", { width: nn, height: rn }) }),
    /* @__PURE__ */ g("div", { className: "flex items-center gap-4", children: [
      h ? /* @__PURE__ */ d(
        "img",
        {
          src: h,
          alt: "",
          className: "h-20 w-auto max-w-[240px] rounded bg-white p-2 ring-1 ring-surface-200 object-contain dark:ring-surface-700"
        }
      ) : /* @__PURE__ */ d("div", { className: "h-20 w-40 rounded bg-surface-100 flex items-center justify-center text-surface-400 text-xs dark:bg-surface-800", children: t("settings.logo.none") }),
      /* @__PURE__ */ g("div", { className: "flex flex-col gap-2", children: [
        /* @__PURE__ */ d(
          "input",
          {
            ref: c,
            type: "file",
            accept: an.join(","),
            className: "hidden",
            onChange: (b) => {
              var y;
              const m = (y = b.target.files) == null ? void 0 : y[0];
              m && p(m);
            }
          }
        ),
        /* @__PURE__ */ g(
          "button",
          {
            type: "button",
            className: "btn-secondary",
            onClick: () => {
              var b;
              return (b = c.current) == null ? void 0 : b.click();
            },
            disabled: a || s,
            children: [
              a ? /* @__PURE__ */ d(we, { className: "h-4 w-4 animate-spin" }) : r.logoEnabled ? /* @__PURE__ */ d(Di, { className: "h-4 w-4" }) : /* @__PURE__ */ d(qi, { className: "h-4 w-4" }),
              a ? t("settings.logo.uploading") : r.logoEnabled ? t("settings.logo.change") : t("settings.logo.upload")
            ]
          }
        ),
        r.logoEnabled && /* @__PURE__ */ g(
          "button",
          {
            type: "button",
            className: "btn-ghost",
            onClick: f,
            disabled: a || s,
            children: [
              s ? /* @__PURE__ */ d(we, { className: "h-4 w-4 animate-spin" }) : /* @__PURE__ */ d(Vi, { className: "h-4 w-4" }),
              t(s ? "settings.logo.removing" : "settings.logo.remove")
            ]
          }
        )
      ] })
    ] })
  ] });
}
function Gi({
  config: r,
  save: e
}) {
  const { t } = q("theme-magazine"), [n, i] = K(r.style ?? Se), [a, o] = K(!1), [s, l] = K(!1);
  function c(w, k) {
    i((S) => ({ ...S, vars: { ...S.vars, [w]: k } }));
  }
  function h(w) {
    i((k) => {
      const S = { ...k.vars };
      return delete S[w], { ...k, vars: S };
    });
  }
  async function u() {
    o(!0);
    try {
      await en({
        baseCssText: Rn.cssText,
        style: n
      });
      const w = {
        ...r,
        style: n,
        cssUpdatedAt: Date.now()
      };
      await e(w), D.success(t("settings.style.saved"));
    } catch (w) {
      console.error("[theme-magazine] style save failed:", w), D.error(t("settings.style.failed"));
    } finally {
      o(!1);
    }
  }
  async function p() {
    l(!0);
    try {
      await en({
        baseCssText: Rn.cssText,
        style: Se
      });
      const w = {
        ...r,
        style: Se,
        cssUpdatedAt: Date.now()
      };
      await e(w), i(Se), D.success(t("settings.style.saved"));
    } catch (w) {
      console.error("[theme-magazine] style reset failed:", w), D.error(t("settings.style.failed"));
    } finally {
      l(!1);
    }
  }
  const f = /* @__PURE__ */ new Map();
  for (const w of st) {
    const k = f.get(w.group) ?? [];
    k.push(w), f.set(w.group, k);
  }
  const b = ui(), m = Object.keys(W.serif).map((w) => ({
    name: w,
    fallback: Xt(w)
  })), y = Object.keys(W.sans).map((w) => ({
    name: w,
    fallback: Xt(w)
  }));
  return /* @__PURE__ */ g("div", { className: "space-y-6", children: [
    /* @__PURE__ */ d("p", { className: "text-xs text-surface-500 dark:text-surface-400", children: t("settings.style.help") }),
    /* @__PURE__ */ d(Xi, { draft: n, setDraft: i }),
    /* @__PURE__ */ g("section", { className: "card p-4 space-y-4", children: [
      /* @__PURE__ */ d("h2", { className: "font-semibold", children: t("settings.groups.typography") }),
      /* @__PURE__ */ d("p", { className: "text-xs text-surface-500 dark:text-surface-400", children: t("settings.fonts.help") }),
      /* @__PURE__ */ d("link", { rel: "stylesheet", href: b }),
      /* @__PURE__ */ g("div", { className: "grid sm:grid-cols-2 gap-4", children: [
        /* @__PURE__ */ g("div", { children: [
          /* @__PURE__ */ d("label", { className: "label", children: t("settings.fonts.serif") }),
          /* @__PURE__ */ d(
            Kt,
            {
              options: m,
              value: n.fontSerif || be,
              onChange: (w) => i((k) => ({ ...k, fontSerif: w }))
            }
          )
        ] }),
        /* @__PURE__ */ g("div", { children: [
          /* @__PURE__ */ d("label", { className: "label", children: t("settings.fonts.sans") }),
          /* @__PURE__ */ d(
            Kt,
            {
              options: y,
              value: n.fontSans || ye,
              onChange: (w) => i((k) => ({ ...k, fontSans: w }))
            }
          )
        ] })
      ] })
    ] }),
    li.map((w) => {
      const k = f.get(w) ?? [];
      return k.length === 0 ? null : /* @__PURE__ */ g("section", { className: "card p-4 space-y-3", children: [
        /* @__PURE__ */ d("h2", { className: "font-semibold", children: t(`settings.groups.${w}`) }),
        /* @__PURE__ */ d("div", { className: "grid sm:grid-cols-2 gap-3", children: k.map((S) => /* @__PURE__ */ d(
          Ki,
          {
            spec: S,
            value: n.vars[S.name] ?? "",
            onChange: (M) => c(S.name, M),
            onClear: () => h(S.name),
            label: t(`settings.${S.labelKey}`)
          },
          S.name
        )) })
      ] }, w);
    }),
    /* @__PURE__ */ g("div", { className: "card p-4 flex flex-wrap gap-3 justify-end", children: [
      /* @__PURE__ */ g(
        "button",
        {
          type: "button",
          className: "btn-ghost",
          onClick: p,
          disabled: a || s,
          children: [
            /* @__PURE__ */ d(we, { className: s ? "h-4 w-4 animate-spin" : "hidden" }),
            /* @__PURE__ */ d(qn, { className: s ? "hidden" : "h-4 w-4" }),
            /* @__PURE__ */ d("span", { children: t(s ? "settings.style.resetting" : "settings.style.reset") })
          ]
        }
      ),
      /* @__PURE__ */ g(
        "button",
        {
          type: "button",
          className: "btn-primary",
          onClick: u,
          disabled: a || s,
          children: [
            /* @__PURE__ */ d(we, { className: a ? "h-4 w-4 animate-spin" : "hidden" }),
            /* @__PURE__ */ d(Mt, { className: a ? "hidden" : "h-4 w-4" }),
            /* @__PURE__ */ d("span", { children: t(a ? "settings.style.saving" : "settings.style.save") })
          ]
        }
      )
    ] })
  ] });
}
function Ki({
  spec: r,
  value: e,
  onChange: t,
  onClear: n,
  label: i
}) {
  const a = e || r.defaultValue;
  return /* @__PURE__ */ g("div", { children: [
    /* @__PURE__ */ g("label", { className: "label flex items-center justify-between gap-2", children: [
      /* @__PURE__ */ d("span", { children: i }),
      e && /* @__PURE__ */ d(
        "button",
        {
          type: "button",
          className: "text-xs text-surface-500 hover:text-surface-900 dark:text-surface-400 dark:hover:text-surface-100",
          onClick: n,
          title: "Reset to default",
          children: /* @__PURE__ */ d(qn, { className: "h-3 w-3" })
        }
      )
    ] }),
    r.type === "color" ? /* @__PURE__ */ g("div", { className: "flex gap-2 items-center", children: [
      /* @__PURE__ */ d(
        "input",
        {
          type: "color",
          value: a,
          onChange: (o) => t(o.target.value),
          className: "h-8 w-12 cursor-pointer rounded border border-surface-200 dark:border-surface-700"
        }
      ),
      /* @__PURE__ */ d(
        "input",
        {
          type: "text",
          value: e,
          placeholder: r.defaultValue,
          onChange: (o) => t(o.target.value),
          className: "input flex-1 font-mono text-xs"
        }
      )
    ] }) : /* @__PURE__ */ d(
      "input",
      {
        type: "text",
        value: e,
        placeholder: r.defaultValue,
        onChange: (o) => t(o.target.value),
        className: "input font-mono text-xs"
      }
    )
  ] });
}
function Zi({
  config: r,
  save: e
}) {
  const { t } = q("theme-magazine"), [n, i] = K(r.home ?? jn), [a, o] = K(!1);
  function s(u) {
    i((p) => ({ ...p, ...u }));
  }
  async function l() {
    o(!0);
    try {
      const u = { ...r, home: n };
      await e(u), D.success(t("settings.home.saved"));
    } catch (u) {
      console.error("[theme-magazine] home save failed:", u), D.error(t("settings.home.failed"));
    } finally {
      o(!1);
    }
  }
  const c = ["most-read", "promo", "none"];
  function h(u) {
    return t(`settings.home.sidebarVariants.${u === "most-read" ? "mostRead" : u}`);
  }
  return /* @__PURE__ */ g("div", { className: "space-y-6", children: [
    /* @__PURE__ */ d("p", { className: "text-xs text-surface-500 dark:text-surface-400", children: t("settings.home.help") }),
    /* @__PURE__ */ g("section", { className: "card p-4 space-y-2", children: [
      /* @__PURE__ */ g("div", { className: "grid sm:grid-cols-3 gap-4", children: [
        /* @__PURE__ */ g("div", { children: [
          /* @__PURE__ */ d("label", { className: "label", children: t("settings.home.featuredLabel") }),
          /* @__PURE__ */ d(
            "input",
            {
              type: "text",
              className: "input",
              value: n.featuredLabel ?? "",
              onChange: (u) => s({ featuredLabel: u.target.value })
            }
          )
        ] }),
        /* @__PURE__ */ g("div", { children: [
          /* @__PURE__ */ d("label", { className: "label", children: t("settings.home.latestHeading") }),
          /* @__PURE__ */ d(
            "input",
            {
              type: "text",
              className: "input",
              value: n.latestHeading ?? "",
              onChange: (u) => s({ latestHeading: u.target.value })
            }
          )
        ] }),
        /* @__PURE__ */ g("div", { children: [
          /* @__PURE__ */ d("label", { className: "label", children: t("settings.home.mostReadHeading") }),
          /* @__PURE__ */ d(
            "input",
            {
              type: "text",
              className: "input",
              value: n.mostReadHeading ?? "",
              onChange: (u) => s({ mostReadHeading: u.target.value })
            }
          )
        ] })
      ] }),
      /* @__PURE__ */ d("p", { className: "text-xs text-surface-500 dark:text-surface-400", children: t("settings.home.textsHelp") })
    ] }),
    /* @__PURE__ */ d("section", { className: "card p-4 space-y-4", children: /* @__PURE__ */ g("div", { className: "grid sm:grid-cols-3 gap-4", children: [
      /* @__PURE__ */ g("div", { children: [
        /* @__PURE__ */ d("label", { className: "label", children: t("settings.home.mostReadCount") }),
        /* @__PURE__ */ d(
          "input",
          {
            type: "number",
            min: 1,
            max: 10,
            value: n.mostReadCount,
            onChange: (u) => s({
              mostReadCount: Math.max(1, Math.min(10, Number.parseInt(u.target.value, 10) || 4))
            }),
            className: "input"
          }
        ),
        /* @__PURE__ */ d("p", { className: "text-xs text-surface-500 mt-1 dark:text-surface-400", children: t("settings.home.mostReadCountHelp") })
      ] }),
      /* @__PURE__ */ g("div", { children: [
        /* @__PURE__ */ d("label", { className: "label", children: t("settings.home.sidebarTop") }),
        /* @__PURE__ */ d(
          "select",
          {
            className: "input",
            value: n.sidebarTop,
            onChange: (u) => s({ sidebarTop: u.target.value }),
            children: c.map((u) => /* @__PURE__ */ d("option", { value: u, children: h(u) }, u))
          }
        )
      ] }),
      /* @__PURE__ */ g("div", { children: [
        /* @__PURE__ */ d("label", { className: "label", children: t("settings.home.sidebarBottom") }),
        /* @__PURE__ */ d(
          "select",
          {
            className: "input",
            value: n.sidebarBottom,
            onChange: (u) => s({ sidebarBottom: u.target.value }),
            children: c.map((u) => /* @__PURE__ */ d("option", { value: u, children: h(u) }, u))
          }
        )
      ] })
    ] }) }),
    (n.sidebarTop === "promo" || n.sidebarBottom === "promo") && /* @__PURE__ */ g("section", { className: "card p-4 space-y-3", children: [
      /* @__PURE__ */ g("header", { className: "space-y-1", children: [
        /* @__PURE__ */ d("h2", { className: "font-semibold", children: t("settings.home.promoSection") }),
        /* @__PURE__ */ d("p", { className: "text-xs text-surface-500 dark:text-surface-400", children: t("settings.home.promoSectionHelp") })
      ] }),
      /* @__PURE__ */ g("div", { children: [
        /* @__PURE__ */ d("label", { className: "label", children: t("settings.home.promoImage") }),
        /* @__PURE__ */ d(
          "input",
          {
            type: "url",
            className: "input",
            placeholder: "https://…",
            value: n.promoImageUrl,
            onChange: (u) => s({ promoImageUrl: u.target.value })
          }
        ),
        /* @__PURE__ */ d("p", { className: "text-xs text-surface-500 mt-1 dark:text-surface-400", children: t("settings.home.promoImageHelp") })
      ] }),
      /* @__PURE__ */ g("div", { children: [
        /* @__PURE__ */ d("label", { className: "label", children: t("settings.home.promoImageAlt") }),
        /* @__PURE__ */ d(
          "input",
          {
            type: "text",
            className: "input",
            value: n.promoImageAlt,
            onChange: (u) => s({ promoImageAlt: u.target.value })
          }
        )
      ] }),
      /* @__PURE__ */ g("div", { children: [
        /* @__PURE__ */ d("label", { className: "label", children: t("settings.home.promoEyebrow") }),
        /* @__PURE__ */ d(
          "input",
          {
            type: "text",
            className: "input",
            value: n.promoEyebrow,
            onChange: (u) => s({ promoEyebrow: u.target.value })
          }
        )
      ] }),
      /* @__PURE__ */ g("div", { children: [
        /* @__PURE__ */ d("label", { className: "label", children: t("settings.home.promoTitle") }),
        /* @__PURE__ */ d(
          "input",
          {
            type: "text",
            className: "input",
            value: n.promoTitle,
            onChange: (u) => s({ promoTitle: u.target.value })
          }
        )
      ] }),
      /* @__PURE__ */ g("div", { children: [
        /* @__PURE__ */ d("label", { className: "label", children: t("settings.home.promoHref") }),
        /* @__PURE__ */ d(
          "input",
          {
            type: "url",
            className: "input",
            placeholder: "https://…",
            value: n.promoHref,
            onChange: (u) => s({ promoHref: u.target.value })
          }
        )
      ] })
    ] }),
    /* @__PURE__ */ d("div", { className: "card p-4 flex justify-end", children: /* @__PURE__ */ g(
      "button",
      {
        type: "button",
        className: "btn-primary",
        onClick: l,
        disabled: a,
        children: [
          /* @__PURE__ */ d(we, { className: a ? "h-4 w-4 animate-spin" : "hidden" }),
          /* @__PURE__ */ d(Mt, { className: a ? "hidden" : "h-4 w-4" }),
          /* @__PURE__ */ d("span", { children: t(a ? "settings.home.saving" : "settings.home.save") })
        ]
      }
    ) })
  ] });
}
function Yi({
  config: r,
  save: e
}) {
  const { t } = q("theme-magazine"), [n, i] = K(r.header ?? Tt), [a, o] = K(!1);
  async function s() {
    o(!0);
    try {
      const l = { ...r, header: n };
      await e(l), D.success(t("settings.header.saved"));
    } catch (l) {
      console.error("[theme-magazine] header save failed:", l), D.error(t("settings.header.failed"));
    } finally {
      o(!1);
    }
  }
  return /* @__PURE__ */ g("div", { className: "space-y-6", children: [
    /* @__PURE__ */ d("p", { className: "text-xs text-surface-500 dark:text-surface-400", children: t("settings.header.help") }),
    /* @__PURE__ */ g("section", { className: "card p-4 space-y-4", children: [
      /* @__PURE__ */ g("div", { children: [
        /* @__PURE__ */ d("label", { className: "label", children: t("settings.header.brandPosition") }),
        /* @__PURE__ */ g(
          "select",
          {
            className: "input max-w-xs",
            value: n.brandPosition,
            onChange: (l) => i((c) => ({ ...c, brandPosition: l.target.value })),
            children: [
              /* @__PURE__ */ d("option", { value: "centered", children: t("settings.header.brandPositions.centered") }),
              /* @__PURE__ */ d("option", { value: "left", children: t("settings.header.brandPositions.left") })
            ]
          }
        )
      ] }),
      /* @__PURE__ */ g("label", { className: "flex items-start gap-2", children: [
        /* @__PURE__ */ d(
          "input",
          {
            type: "checkbox",
            className: "mt-1",
            checked: n.showSearch,
            onChange: (l) => i((c) => ({ ...c, showSearch: l.target.checked }))
          }
        ),
        /* @__PURE__ */ g("span", { children: [
          /* @__PURE__ */ d("span", { className: "text-sm font-medium block", children: t("settings.header.showSearch") }),
          /* @__PURE__ */ d("span", { className: "text-xs text-surface-500 dark:text-surface-400", children: t("settings.header.showSearchHelp") })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ d("div", { className: "card p-4 flex justify-end", children: /* @__PURE__ */ g(
      "button",
      {
        type: "button",
        className: "btn-primary",
        onClick: s,
        disabled: a,
        children: [
          /* @__PURE__ */ d(we, { className: a ? "h-4 w-4 animate-spin" : "hidden" }),
          /* @__PURE__ */ d(Mt, { className: a ? "hidden" : "h-4 w-4" }),
          /* @__PURE__ */ d("span", { children: t(a ? "settings.header.saving" : "settings.header.save") })
        ]
      }
    ) })
  ] });
}
function Xi({
  draft: r,
  setDraft: e
}) {
  const { t } = q("theme-magazine"), n = ci(r);
  function i(a) {
    e({
      vars: { ...a.vars },
      fontSerif: a.fontSerif,
      fontSans: a.fontSans
    });
  }
  return /* @__PURE__ */ g("section", { className: "card p-4 space-y-3", children: [
    /* @__PURE__ */ g("header", { className: "space-y-1", children: [
      /* @__PURE__ */ g("h2", { className: "font-semibold flex items-center gap-2", children: [
        /* @__PURE__ */ d(Ui, { className: "h-4 w-4 text-surface-400" }),
        t("settings.presets.title")
      ] }),
      /* @__PURE__ */ d("p", { className: "text-xs text-surface-500 dark:text-surface-400", children: t("settings.presets.help") })
    ] }),
    /* @__PURE__ */ d("div", { className: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2", children: Bn.map((a) => {
      const o = a.id === n, s = {
        vars: a.vars,
        fontSerif: a.fontSerif,
        fontSans: a.fontSans
      }, l = a.swatch.map(
        (c) => Fn(s, c)
      );
      return /* @__PURE__ */ g(
        "button",
        {
          type: "button",
          onClick: () => i(a),
          className: "text-left p-3 rounded border transition focus:outline-none focus:ring-2 focus:ring-blue-500 " + (o ? "border-blue-600 bg-blue-50 dark:border-blue-500 dark:bg-blue-950/30" : "border-surface-200 hover:border-surface-400 dark:border-surface-700 dark:hover:border-surface-500"),
          "aria-pressed": o,
          children: [
            /* @__PURE__ */ g("div", { className: "flex items-center justify-between gap-2 mb-2", children: [
              /* @__PURE__ */ d("span", { className: "text-sm font-medium", children: t(`settings.presets.${a.id}.label`) }),
              /* @__PURE__ */ d("div", { className: "flex -space-x-1", "aria-hidden": "true", children: l.map((c, h) => /* @__PURE__ */ d(
                "span",
                {
                  className: "h-4 w-4 rounded-full ring-1 ring-surface-200 dark:ring-surface-700",
                  style: { background: c }
                },
                h
              )) })
            ] }),
            /* @__PURE__ */ d("p", { className: "text-xs text-surface-500 dark:text-surface-400 line-clamp-2", children: t(`settings.presets.${a.id}.description`) })
          ]
        },
        a.id
      );
    }) })
  ] });
}
const on = ["most-read", "promo", "none"], ke = 'Promo card of the home sidebar (shown when sidebarTop or sidebarBottom is "promo"; the slot is hidden when both promoImageUrl and promoTitle are empty):', Qi = {
  logoEnabled: {
    description: "Managed by the theme — don't set: use `themes logo magazine <image>` (or --remove). True once a logo is uploaded; the header then shows it instead of the text wordmark."
  },
  logoUpdatedAt: {
    description: "Managed by the theme — don't set. Cache-busting ?v= value of the logo URL in data/menu.json."
  },
  cssUpdatedAt: {
    description: "Managed by the theme — don't set. Cache-busting ?v= value of the theme CSS link; existing pages keep the old one until they are regenerated."
  },
  "style.vars": {
    description: `Overrides of the theme's Material 3 color variables, baked into theme-assets/magazine.css, e.g. {"--color-primary":"#1a1a1a"}; keys are the --color-* entries of cssVariables in --schema. Give hex colors (#rgb or #rrggbb): they are converted to the RGB triplets the CSS uses. An empty value reverts to the default.`,
    format: "map of CSS variable → hex color"
  },
  "style.fontSerif": {
    description: "Google Font for headlines and article text (--font-serif).",
    values: Object.keys(W.serif)
  },
  "style.fontSans": {
    description: "Google Font for navigation, labels and metadata (--font-sans).",
    values: Object.keys(W.sans)
  },
  "home.mostReadCount": {
    description: 'Number of posts in the "Most read" sidebar widget of the home page (the newest online posts).',
    min: 1,
    max: 10
  },
  "home.sidebarTop": {
    description: "Widget in the top slot of the home sidebar: the most-read list, the promo card, or nothing. Ignored when the home is a static page.",
    values: on
  },
  "home.sidebarBottom": {
    description: "Widget in the bottom slot of the home sidebar (not rendered twice when it equals sidebarTop). Ignored when the home is a static page.",
    values: on
  },
  "home.promoImageUrl": { description: `${ke} image URL (Media library or external).`, format: "URL" },
  "home.promoImageAlt": { description: `${ke} alt text of the image.` },
  "home.promoEyebrow": { description: `${ke} small label above the heading.` },
  "home.promoTitle": { description: `${ke} heading.` },
  "home.promoHref": { description: `${ke} link target when the card is clicked.`, format: "URL or site path" },
  "home.featuredLabel": {
    description: "Text of the badge on the home hero's featured post. Empty = the theme's default in the site language."
  },
  "home.latestHeading": {
    description: "Heading of the latest-posts list on the home page. Empty = the theme's default in the site language."
  },
  "home.mostReadHeading": {
    description: `Heading of the "Most read" widget. Empty = the theme's default in the site language.`
  },
  "header.brandPosition": {
    description: "Header layout on every page: wordmark centered (burger left, search right) or left-aligned next to the burger. Needs a full regeneration.",
    values: ["centered", "left"]
  },
  "header.showSearch": {
    description: "Show the search button in the header of every page (opens the agentcms-search modal; inert without that plugin). Needs a full regeneration."
  }
};
function I(r) {
  this.content = r;
}
I.prototype = {
  constructor: I,
  find: function(r) {
    for (var e = 0; e < this.content.length; e += 2)
      if (this.content[e] === r) return e;
    return -1;
  },
  // :: (string) → ?any
  // Retrieve the value stored under `key`, or return undefined when
  // no such key exists.
  get: function(r) {
    var e = this.find(r);
    return e == -1 ? void 0 : this.content[e + 1];
  },
  // :: (string, any, ?string) → OrderedMap
  // Create a new map by replacing the value of `key` with a new
  // value, or adding a binding to the end of the map. If `newKey` is
  // given, the key of the binding will be replaced with that key.
  update: function(r, e, t) {
    var n = t && t != r ? this.remove(t) : this, i = n.find(r), a = n.content.slice();
    return i == -1 ? a.push(t || r, e) : (a[i + 1] = e, t && (a[i] = t)), new I(a);
  },
  // :: (string) → OrderedMap
  // Return a map with the given key removed, if it existed.
  remove: function(r) {
    var e = this.find(r);
    if (e == -1) return this;
    var t = this.content.slice();
    return t.splice(e, 2), new I(t);
  },
  // :: (string, any) → OrderedMap
  // Add a new key to the start of the map.
  addToStart: function(r, e) {
    return new I([r, e].concat(this.remove(r).content));
  },
  // :: (string, any) → OrderedMap
  // Add a new key to the end of the map.
  addToEnd: function(r, e) {
    var t = this.remove(r).content.slice();
    return t.push(r, e), new I(t);
  },
  // :: (string, string, any) → OrderedMap
  // Add a key after the given key. If `place` is not found, the new
  // key is added to the end.
  addBefore: function(r, e, t) {
    var n = this.remove(e), i = n.content.slice(), a = n.find(r);
    return i.splice(a == -1 ? i.length : a, 0, e, t), new I(i);
  },
  // :: ((key: string, value: any))
  // Call the given function for each key/value pair in the map, in
  // order.
  forEach: function(r) {
    for (var e = 0; e < this.content.length; e += 2)
      r(this.content[e], this.content[e + 1]);
  },
  // :: (union<Object, OrderedMap>) → OrderedMap
  // Create a new map by prepending the keys in this map that don't
  // appear in `map` before the keys in `map`.
  prepend: function(r) {
    return r = I.from(r), r.size ? new I(r.content.concat(this.subtract(r).content)) : this;
  },
  // :: (union<Object, OrderedMap>) → OrderedMap
  // Create a new map by appending the keys in this map that don't
  // appear in `map` after the keys in `map`.
  append: function(r) {
    return r = I.from(r), r.size ? new I(this.subtract(r).content.concat(r.content)) : this;
  },
  // :: (union<Object, OrderedMap>) → OrderedMap
  // Create a map containing all the keys in this map that don't
  // appear in `map`.
  subtract: function(r) {
    var e = this;
    r = I.from(r);
    for (var t = 0; t < r.content.length; t += 2)
      e = e.remove(r.content[t]);
    return e;
  },
  // :: () → Object
  // Turn ordered map into a plain object.
  toObject: function() {
    var r = {};
    return this.forEach(function(e, t) {
      r[e] = t;
    }), r;
  },
  // :: number
  // The amount of keys in this map.
  get size() {
    return this.content.length >> 1;
  }
};
I.from = function(r) {
  if (r instanceof I) return r;
  var e = [];
  if (r) for (var t in r) e.push(t, r[t]);
  return new I(e);
};
function _n(r, e, t) {
  for (let n = 0; ; n++) {
    if (n == r.childCount || n == e.childCount)
      return r.childCount == e.childCount ? null : t;
    let i = r.child(n), a = e.child(n);
    if (i == a) {
      t += i.nodeSize;
      continue;
    }
    if (!i.sameMarkup(a))
      return t;
    if (i.isText && i.text != a.text) {
      for (let o = 0; i.text[o] == a.text[o]; o++)
        t++;
      return t;
    }
    if (i.content.size || a.content.size) {
      let o = _n(i.content, a.content, t + 1);
      if (o != null)
        return o;
    }
    t += i.nodeSize;
  }
}
function Wn(r, e, t, n) {
  for (let i = r.childCount, a = e.childCount; ; ) {
    if (i == 0 || a == 0)
      return i == a ? null : { a: t, b: n };
    let o = r.child(--i), s = e.child(--a), l = o.nodeSize;
    if (o == s) {
      t -= l, n -= l;
      continue;
    }
    if (!o.sameMarkup(s))
      return { a: t, b: n };
    if (o.isText && o.text != s.text) {
      let c = 0, h = Math.min(o.text.length, s.text.length);
      for (; c < h && o.text[o.text.length - c - 1] == s.text[s.text.length - c - 1]; )
        c++, t--, n--;
      return { a: t, b: n };
    }
    if (o.content.size || s.content.size) {
      let c = Wn(o.content, s.content, t - 1, n - 1);
      if (c)
        return c;
    }
    t -= l, n -= l;
  }
}
class x {
  /**
  @internal
  */
  constructor(e, t) {
    if (this.content = e, this.size = t || 0, t == null)
      for (let n = 0; n < e.length; n++)
        this.size += e[n].nodeSize;
  }
  /**
  Invoke a callback for all descendant nodes between the given two
  positions (relative to start of this fragment). Doesn't descend
  into a node when the callback returns `false`.
  */
  nodesBetween(e, t, n, i = 0, a) {
    for (let o = 0, s = 0; s < t; o++) {
      let l = this.content[o], c = s + l.nodeSize;
      if (c > e && n(l, i + s, a || null, o) !== !1 && l.content.size) {
        let h = s + 1;
        l.nodesBetween(Math.max(0, e - h), Math.min(l.content.size, t - h), n, i + h);
      }
      s = c;
    }
  }
  /**
  Call the given callback for every descendant node. `pos` will be
  relative to the start of the fragment. The callback may return
  `false` to prevent traversal of a given node's children.
  */
  descendants(e) {
    this.nodesBetween(0, this.size, e);
  }
  /**
  Extract the text between `from` and `to`. See the same method on
  [`Node`](https://prosemirror.net/docs/ref/#model.Node.textBetween).
  */
  textBetween(e, t, n, i) {
    let a = "", o = !0;
    return this.nodesBetween(e, t, (s, l) => {
      let c = s.isText ? s.text.slice(Math.max(e, l) - l, t - l) : s.isLeaf ? i ? typeof i == "function" ? i(s) : i : s.type.spec.leafText ? s.type.spec.leafText(s) : "" : "";
      s.isBlock && (s.isLeaf && c || s.isTextblock) && n && (o ? o = !1 : a += n), a += c;
    }, 0), a;
  }
  /**
  Create a new fragment containing the combined content of this
  fragment and the other.
  */
  append(e) {
    if (!e.size)
      return this;
    if (!this.size)
      return e;
    let t = this.lastChild, n = e.firstChild, i = this.content.slice(), a = 0;
    for (t.isText && t.sameMarkup(n) && (i[i.length - 1] = t.withText(t.text + n.text), a = 1); a < e.content.length; a++)
      i.push(e.content[a]);
    return new x(i, this.size + e.size);
  }
  /**
  Cut out the sub-fragment between the two given positions.
  */
  cut(e, t = this.size) {
    if (e == 0 && t == this.size)
      return this;
    let n = [], i = 0;
    if (t > e)
      for (let a = 0, o = 0; o < t; a++) {
        let s = this.content[a], l = o + s.nodeSize;
        l > e && ((o < e || l > t) && (s.isText ? s = s.cut(Math.max(0, e - o), Math.min(s.text.length, t - o)) : s = s.cut(Math.max(0, e - o - 1), Math.min(s.content.size, t - o - 1))), n.push(s), i += s.nodeSize), o = l;
      }
    return new x(n, i);
  }
  /**
  @internal
  */
  cutByIndex(e, t) {
    return e == t ? x.empty : e == 0 && t == this.content.length ? this : new x(this.content.slice(e, t));
  }
  /**
  Create a new fragment in which the node at the given index is
  replaced by the given node.
  */
  replaceChild(e, t) {
    let n = this.content[e];
    if (n == t)
      return this;
    let i = this.content.slice(), a = this.size + t.nodeSize - n.nodeSize;
    return i[e] = t, new x(i, a);
  }
  /**
  Create a new fragment by prepending the given node to this
  fragment.
  */
  addToStart(e) {
    return new x([e].concat(this.content), this.size + e.nodeSize);
  }
  /**
  Create a new fragment by appending the given node to this
  fragment.
  */
  addToEnd(e) {
    return new x(this.content.concat(e), this.size + e.nodeSize);
  }
  /**
  Compare this fragment to another one.
  */
  eq(e) {
    if (this.content.length != e.content.length)
      return !1;
    for (let t = 0; t < this.content.length; t++)
      if (!this.content[t].eq(e.content[t]))
        return !1;
    return !0;
  }
  /**
  The first child of the fragment, or `null` if it is empty.
  */
  get firstChild() {
    return this.content.length ? this.content[0] : null;
  }
  /**
  The last child of the fragment, or `null` if it is empty.
  */
  get lastChild() {
    return this.content.length ? this.content[this.content.length - 1] : null;
  }
  /**
  The number of child nodes in this fragment.
  */
  get childCount() {
    return this.content.length;
  }
  /**
  Get the child node at the given index. Raise an error when the
  index is out of range.
  */
  child(e) {
    let t = this.content[e];
    if (!t)
      throw new RangeError("Index " + e + " out of range for " + this);
    return t;
  }
  /**
  Get the child node at the given index, if it exists.
  */
  maybeChild(e) {
    return this.content[e] || null;
  }
  /**
  Call `f` for every child node, passing the node, its offset
  into this parent node, and its index.
  */
  forEach(e) {
    for (let t = 0, n = 0; t < this.content.length; t++) {
      let i = this.content[t];
      e(i, n, t), n += i.nodeSize;
    }
  }
  /**
  Find the first position at which this fragment and another
  fragment differ, or `null` if they are the same.
  */
  findDiffStart(e, t = 0) {
    return _n(this, e, t);
  }
  /**
  Find the first position, searching from the end, at which this
  fragment and the given fragment differ, or `null` if they are
  the same. Since this position will not be the same in both
  nodes, an object with two separate positions is returned.
  */
  findDiffEnd(e, t = this.size, n = e.size) {
    return Wn(this, e, t, n);
  }
  /**
  Find the index and inner offset corresponding to a given relative
  position in this fragment. The result object will be reused
  (overwritten) the next time the function is called. @internal
  */
  findIndex(e) {
    if (e == 0)
      return Ue(0, e);
    if (e == this.size)
      return Ue(this.content.length, e);
    if (e > this.size || e < 0)
      throw new RangeError(`Position ${e} outside of fragment (${this})`);
    for (let t = 0, n = 0; ; t++) {
      let i = this.child(t), a = n + i.nodeSize;
      if (a >= e)
        return a == e ? Ue(t + 1, a) : Ue(t, n);
      n = a;
    }
  }
  /**
  Return a debugging string that describes this fragment.
  */
  toString() {
    return "<" + this.toStringInner() + ">";
  }
  /**
  @internal
  */
  toStringInner() {
    return this.content.join(", ");
  }
  /**
  Create a JSON-serializeable representation of this fragment.
  */
  toJSON() {
    return this.content.length ? this.content.map((e) => e.toJSON()) : null;
  }
  /**
  Deserialize a fragment from its JSON representation.
  */
  static fromJSON(e, t) {
    if (!t)
      return x.empty;
    if (!Array.isArray(t))
      throw new RangeError("Invalid input for Fragment.fromJSON");
    return new x(t.map(e.nodeFromJSON));
  }
  /**
  Build a fragment from an array of nodes. Ensures that adjacent
  text nodes with the same marks are joined together.
  */
  static fromArray(e) {
    if (!e.length)
      return x.empty;
    let t, n = 0;
    for (let i = 0; i < e.length; i++) {
      let a = e[i];
      n += a.nodeSize, i && a.isText && e[i - 1].sameMarkup(a) ? (t || (t = e.slice(0, i)), t[t.length - 1] = a.withText(t[t.length - 1].text + a.text)) : t && t.push(a);
    }
    return new x(t || e, n);
  }
  /**
  Create a fragment from something that can be interpreted as a
  set of nodes. For `null`, it returns the empty fragment. For a
  fragment, the fragment itself. For a node or array of nodes, a
  fragment containing those nodes.
  */
  static from(e) {
    if (!e)
      return x.empty;
    if (e instanceof x)
      return e;
    if (Array.isArray(e))
      return this.fromArray(e);
    if (e.attrs)
      return new x([e], e.nodeSize);
    throw new RangeError("Can not convert " + e + " to a Fragment" + (e.nodesBetween ? " (looks like multiple versions of prosemirror-model were loaded)" : ""));
  }
}
x.empty = new x([], 0);
const dt = { index: 0, offset: 0 };
function Ue(r, e) {
  return dt.index = r, dt.offset = e, dt;
}
function Ye(r, e) {
  if (r === e)
    return !0;
  if (!(r && typeof r == "object") || !(e && typeof e == "object"))
    return !1;
  let t = Array.isArray(r);
  if (Array.isArray(e) != t)
    return !1;
  if (t) {
    if (r.length != e.length)
      return !1;
    for (let n = 0; n < r.length; n++)
      if (!Ye(r[n], e[n]))
        return !1;
  } else {
    for (let n in r)
      if (!(n in e) || !Ye(r[n], e[n]))
        return !1;
    for (let n in e)
      if (!(n in r))
        return !1;
  }
  return !0;
}
class E {
  /**
  @internal
  */
  constructor(e, t) {
    this.type = e, this.attrs = t;
  }
  /**
  Given a set of marks, create a new set which contains this one as
  well, in the right position. If this mark is already in the set,
  the set itself is returned. If any marks that are set to be
  [exclusive](https://prosemirror.net/docs/ref/#model.MarkSpec.excludes) with this mark are present,
  those are replaced by this one.
  */
  addToSet(e) {
    let t, n = !1;
    for (let i = 0; i < e.length; i++) {
      let a = e[i];
      if (this.eq(a))
        return e;
      if (this.type.excludes(a.type))
        t || (t = e.slice(0, i));
      else {
        if (a.type.excludes(this.type))
          return e;
        !n && a.type.rank > this.type.rank && (t || (t = e.slice(0, i)), t.push(this), n = !0), t && t.push(a);
      }
    }
    return t || (t = e.slice()), n || t.push(this), t;
  }
  /**
  Remove this mark from the given set, returning a new set. If this
  mark is not in the set, the set itself is returned.
  */
  removeFromSet(e) {
    for (let t = 0; t < e.length; t++)
      if (this.eq(e[t]))
        return e.slice(0, t).concat(e.slice(t + 1));
    return e;
  }
  /**
  Test whether this mark is in the given set of marks.
  */
  isInSet(e) {
    for (let t = 0; t < e.length; t++)
      if (this.eq(e[t]))
        return !0;
    return !1;
  }
  /**
  Test whether this mark has the same type and attributes as
  another mark.
  */
  eq(e) {
    return this == e || this.type == e.type && Ye(this.attrs, e.attrs);
  }
  /**
  Convert this mark to a JSON-serializeable representation.
  */
  toJSON() {
    let e = { type: this.type.name };
    for (let t in this.attrs) {
      e.attrs = this.attrs;
      break;
    }
    return e;
  }
  /**
  Deserialize a mark from JSON.
  */
  static fromJSON(e, t) {
    if (!t)
      throw new RangeError("Invalid input for Mark.fromJSON");
    let n = e.marks[t.type];
    if (!n)
      throw new RangeError(`There is no mark type ${t.type} in this schema`);
    let i = n.create(t.attrs);
    return n.checkAttrs(i.attrs), i;
  }
  /**
  Test whether two sets of marks are identical.
  */
  static sameSet(e, t) {
    if (e == t)
      return !0;
    if (e.length != t.length)
      return !1;
    for (let n = 0; n < e.length; n++)
      if (!e[n].eq(t[n]))
        return !1;
    return !0;
  }
  /**
  Create a properly sorted mark set from null, a single mark, or an
  unsorted array of marks.
  */
  static setFrom(e) {
    if (!e || Array.isArray(e) && e.length == 0)
      return E.none;
    if (e instanceof E)
      return [e];
    let t = e.slice();
    return t.sort((n, i) => n.type.rank - i.type.rank), t;
  }
}
E.none = [];
class Xe extends Error {
}
class v {
  /**
  Create a slice. When specifying a non-zero open depth, you must
  make sure that there are nodes of at least that depth at the
  appropriate side of the fragment—i.e. if the fragment is an
  empty paragraph node, `openStart` and `openEnd` can't be greater
  than 1.
  
  It is not necessary for the content of open nodes to conform to
  the schema's content constraints, though it should be a valid
  start/end/middle for such a node, depending on which sides are
  open.
  */
  constructor(e, t, n) {
    this.content = e, this.openStart = t, this.openEnd = n;
  }
  /**
  The size this slice would add when inserted into a document.
  */
  get size() {
    return this.content.size - this.openStart - this.openEnd;
  }
  /**
  @internal
  */
  insertAt(e, t) {
    let n = Gn(this.content, e + this.openStart, t);
    return n && new v(n, this.openStart, this.openEnd);
  }
  /**
  @internal
  */
  removeBetween(e, t) {
    return new v(Jn(this.content, e + this.openStart, t + this.openStart), this.openStart, this.openEnd);
  }
  /**
  Tests whether this slice is equal to another slice.
  */
  eq(e) {
    return this.content.eq(e.content) && this.openStart == e.openStart && this.openEnd == e.openEnd;
  }
  /**
  @internal
  */
  toString() {
    return this.content + "(" + this.openStart + "," + this.openEnd + ")";
  }
  /**
  Convert a slice to a JSON-serializable representation.
  */
  toJSON() {
    if (!this.content.size)
      return null;
    let e = { content: this.content.toJSON() };
    return this.openStart > 0 && (e.openStart = this.openStart), this.openEnd > 0 && (e.openEnd = this.openEnd), e;
  }
  /**
  Deserialize a slice from its JSON representation.
  */
  static fromJSON(e, t) {
    if (!t)
      return v.empty;
    let n = t.openStart || 0, i = t.openEnd || 0;
    if (typeof n != "number" || typeof i != "number")
      throw new RangeError("Invalid input for Slice.fromJSON");
    return new v(x.fromJSON(e, t.content), n, i);
  }
  /**
  Create a slice from a fragment by taking the maximum possible
  open value on both side of the fragment.
  */
  static maxOpen(e, t = !0) {
    let n = 0, i = 0;
    for (let a = e.firstChild; a && !a.isLeaf && (t || !a.type.spec.isolating); a = a.firstChild)
      n++;
    for (let a = e.lastChild; a && !a.isLeaf && (t || !a.type.spec.isolating); a = a.lastChild)
      i++;
    return new v(e, n, i);
  }
}
v.empty = new v(x.empty, 0, 0);
function Jn(r, e, t) {
  let { index: n, offset: i } = r.findIndex(e), a = r.maybeChild(n), { index: o, offset: s } = r.findIndex(t);
  if (i == e || a.isText) {
    if (s != t && !r.child(o).isText)
      throw new RangeError("Removing non-flat range");
    return r.cut(0, e).append(r.cut(t));
  }
  if (n != o)
    throw new RangeError("Removing non-flat range");
  return r.replaceChild(n, a.copy(Jn(a.content, e - i - 1, t - i - 1)));
}
function Gn(r, e, t, n) {
  let { index: i, offset: a } = r.findIndex(e), o = r.maybeChild(i);
  if (a == e || o.isText)
    return n && !n.canReplace(i, i, t) ? null : r.cut(0, e).append(t).append(r.cut(e));
  let s = Gn(o.content, e - a - 1, t, o);
  return s && r.replaceChild(i, o.copy(s));
}
function ea(r, e, t) {
  if (t.openStart > r.depth)
    throw new Xe("Inserted content deeper than insertion position");
  if (r.depth - t.openStart != e.depth - t.openEnd)
    throw new Xe("Inconsistent open depths");
  return Kn(r, e, t, 0);
}
function Kn(r, e, t, n) {
  let i = r.index(n), a = r.node(n);
  if (i == e.index(n) && n < r.depth - t.openStart) {
    let o = Kn(r, e, t, n + 1);
    return a.copy(a.content.replaceChild(i, o));
  } else if (t.content.size)
    if (!t.openStart && !t.openEnd && r.depth == n && e.depth == n) {
      let o = r.parent, s = o.content;
      return ce(o, s.cut(0, r.parentOffset).append(t.content).append(s.cut(e.parentOffset)));
    } else {
      let { start: o, end: s } = ta(t, r);
      return ce(a, Yn(r, o, s, e, n));
    }
  else return ce(a, Qe(r, e, n));
}
function Zn(r, e) {
  if (!e.type.compatibleContent(r.type))
    throw new Xe("Cannot join " + e.type.name + " onto " + r.type.name);
}
function vt(r, e, t) {
  let n = r.node(t);
  return Zn(n, e.node(t)), n;
}
function le(r, e) {
  let t = e.length - 1;
  t >= 0 && r.isText && r.sameMarkup(e[t]) ? e[t] = r.withText(e[t].text + r.text) : e.push(r);
}
function Ee(r, e, t, n) {
  let i = (e || r).node(t), a = 0, o = e ? e.index(t) : i.childCount;
  r && (a = r.index(t), r.depth > t ? a++ : r.textOffset && (le(r.nodeAfter, n), a++));
  for (let s = a; s < o; s++)
    le(i.child(s), n);
  e && e.depth == t && e.textOffset && le(e.nodeBefore, n);
}
function ce(r, e) {
  return r.type.checkContent(e), r.copy(e);
}
function Yn(r, e, t, n, i) {
  let a = r.depth > i && vt(r, e, i + 1), o = n.depth > i && vt(t, n, i + 1), s = [];
  return Ee(null, r, i, s), a && o && e.index(i) == t.index(i) ? (Zn(a, o), le(ce(a, Yn(r, e, t, n, i + 1)), s)) : (a && le(ce(a, Qe(r, e, i + 1)), s), Ee(e, t, i, s), o && le(ce(o, Qe(t, n, i + 1)), s)), Ee(n, null, i, s), new x(s);
}
function Qe(r, e, t) {
  let n = [];
  if (Ee(null, r, t, n), r.depth > t) {
    let i = vt(r, e, t + 1);
    le(ce(i, Qe(r, e, t + 1)), n);
  }
  return Ee(e, null, t, n), new x(n);
}
function ta(r, e) {
  let t = e.depth - r.openStart, i = e.node(t).copy(r.content);
  for (let a = t - 1; a >= 0; a--)
    i = e.node(a).copy(x.from(i));
  return {
    start: i.resolveNoCache(r.openStart + t),
    end: i.resolveNoCache(i.content.size - r.openEnd - t)
  };
}
class Pe {
  /**
  @internal
  */
  constructor(e, t, n) {
    this.pos = e, this.path = t, this.parentOffset = n, this.depth = t.length / 3 - 1;
  }
  /**
  @internal
  */
  resolveDepth(e) {
    return e == null ? this.depth : e < 0 ? this.depth + e : e;
  }
  /**
  The parent node that the position points into. Note that even if
  a position points into a text node, that node is not considered
  the parent—text nodes are ‘flat’ in this model, and have no content.
  */
  get parent() {
    return this.node(this.depth);
  }
  /**
  The root node in which the position was resolved.
  */
  get doc() {
    return this.node(0);
  }
  /**
  The ancestor node at the given level. `p.node(p.depth)` is the
  same as `p.parent`.
  */
  node(e) {
    return this.path[this.resolveDepth(e) * 3];
  }
  /**
  The index into the ancestor at the given level. If this points
  at the 3rd node in the 2nd paragraph on the top level, for
  example, `p.index(0)` is 1 and `p.index(1)` is 2.
  */
  index(e) {
    return this.path[this.resolveDepth(e) * 3 + 1];
  }
  /**
  The index pointing after this position into the ancestor at the
  given level.
  */
  indexAfter(e) {
    return e = this.resolveDepth(e), this.index(e) + (e == this.depth && !this.textOffset ? 0 : 1);
  }
  /**
  The (absolute) position at the start of the node at the given
  level.
  */
  start(e) {
    return e = this.resolveDepth(e), e == 0 ? 0 : this.path[e * 3 - 1] + 1;
  }
  /**
  The (absolute) position at the end of the node at the given
  level.
  */
  end(e) {
    return e = this.resolveDepth(e), this.start(e) + this.node(e).content.size;
  }
  /**
  The (absolute) position directly before the wrapping node at the
  given level, or, when `depth` is `this.depth + 1`, the original
  position.
  */
  before(e) {
    if (e = this.resolveDepth(e), !e)
      throw new RangeError("There is no position before the top-level node");
    return e == this.depth + 1 ? this.pos : this.path[e * 3 - 1];
  }
  /**
  The (absolute) position directly after the wrapping node at the
  given level, or the original position when `depth` is `this.depth + 1`.
  */
  after(e) {
    if (e = this.resolveDepth(e), !e)
      throw new RangeError("There is no position after the top-level node");
    return e == this.depth + 1 ? this.pos : this.path[e * 3 - 1] + this.path[e * 3].nodeSize;
  }
  /**
  When this position points into a text node, this returns the
  distance between the position and the start of the text node.
  Will be zero for positions that point between nodes.
  */
  get textOffset() {
    return this.pos - this.path[this.path.length - 1];
  }
  /**
  Get the node directly after the position, if any. If the position
  points into a text node, only the part of that node after the
  position is returned.
  */
  get nodeAfter() {
    let e = this.parent, t = this.index(this.depth);
    if (t == e.childCount)
      return null;
    let n = this.pos - this.path[this.path.length - 1], i = e.child(t);
    return n ? e.child(t).cut(n) : i;
  }
  /**
  Get the node directly before the position, if any. If the
  position points into a text node, only the part of that node
  before the position is returned.
  */
  get nodeBefore() {
    let e = this.index(this.depth), t = this.pos - this.path[this.path.length - 1];
    return t ? this.parent.child(e).cut(0, t) : e == 0 ? null : this.parent.child(e - 1);
  }
  /**
  Get the position at the given index in the parent node at the
  given depth (which defaults to `this.depth`).
  */
  posAtIndex(e, t) {
    t = this.resolveDepth(t);
    let n = this.path[t * 3], i = t == 0 ? 0 : this.path[t * 3 - 1] + 1;
    for (let a = 0; a < e; a++)
      i += n.child(a).nodeSize;
    return i;
  }
  /**
  Get the marks at this position, factoring in the surrounding
  marks' [`inclusive`](https://prosemirror.net/docs/ref/#model.MarkSpec.inclusive) property. If the
  position is at the start of a non-empty node, the marks of the
  node after it (if any) are returned.
  */
  marks() {
    let e = this.parent, t = this.index();
    if (e.content.size == 0)
      return E.none;
    if (this.textOffset)
      return e.child(t).marks;
    let n = e.maybeChild(t - 1), i = e.maybeChild(t);
    if (!n) {
      let s = n;
      n = i, i = s;
    }
    let a = n.marks;
    for (var o = 0; o < a.length; o++)
      a[o].type.spec.inclusive === !1 && (!i || !a[o].isInSet(i.marks)) && (a = a[o--].removeFromSet(a));
    return a;
  }
  /**
  Get the marks after the current position, if any, except those
  that are non-inclusive and not present at position `$end`. This
  is mostly useful for getting the set of marks to preserve after a
  deletion. Will return `null` if this position is at the end of
  its parent node or its parent node isn't a textblock (in which
  case no marks should be preserved).
  */
  marksAcross(e) {
    let t = this.parent.maybeChild(this.index());
    if (!t || !t.isInline)
      return null;
    let n = t.marks, i = e.parent.maybeChild(e.index());
    for (var a = 0; a < n.length; a++)
      n[a].type.spec.inclusive === !1 && (!i || !n[a].isInSet(i.marks)) && (n = n[a--].removeFromSet(n));
    return n;
  }
  /**
  The depth up to which this position and the given (non-resolved)
  position share the same parent nodes.
  */
  sharedDepth(e) {
    for (let t = this.depth; t > 0; t--)
      if (this.start(t) <= e && this.end(t) >= e)
        return t;
    return 0;
  }
  /**
  Returns a range based on the place where this position and the
  given position diverge around block content. If both point into
  the same textblock, for example, a range around that textblock
  will be returned. If they point into different blocks, the range
  around those blocks in their shared ancestor is returned. You can
  pass in an optional predicate that will be called with a parent
  node to see if a range into that parent is acceptable.
  */
  blockRange(e = this, t) {
    if (e.pos < this.pos)
      return e.blockRange(this);
    for (let n = this.depth - (this.parent.inlineContent || this.pos == e.pos ? 1 : 0); n >= 0; n--)
      if (e.pos <= this.end(n) && (!t || t(this.node(n))))
        return new et(this, e, n);
    return null;
  }
  /**
  Query whether the given position shares the same parent node.
  */
  sameParent(e) {
    return this.pos - this.parentOffset == e.pos - e.parentOffset;
  }
  /**
  Return the greater of this and the given position.
  */
  max(e) {
    return e.pos > this.pos ? e : this;
  }
  /**
  Return the smaller of this and the given position.
  */
  min(e) {
    return e.pos < this.pos ? e : this;
  }
  /**
  @internal
  */
  toString() {
    let e = "";
    for (let t = 1; t <= this.depth; t++)
      e += (e ? "/" : "") + this.node(t).type.name + "_" + this.index(t - 1);
    return e + ":" + this.parentOffset;
  }
  /**
  @internal
  */
  static resolve(e, t) {
    if (!(t >= 0 && t <= e.content.size))
      throw new RangeError("Position " + t + " out of range");
    let n = [], i = 0, a = t;
    for (let o = e; ; ) {
      let { index: s, offset: l } = o.content.findIndex(a), c = a - l;
      if (n.push(o, s, i + l), !c || (o = o.child(s), o.isText))
        break;
      a = c - 1, i += l + 1;
    }
    return new Pe(t, n, a);
  }
  /**
  @internal
  */
  static resolveCached(e, t) {
    let n = sn.get(e);
    if (n)
      for (let a = 0; a < n.elts.length; a++) {
        let o = n.elts[a];
        if (o.pos == t)
          return o;
      }
    else
      sn.set(e, n = new na());
    let i = n.elts[n.i] = Pe.resolve(e, t);
    return n.i = (n.i + 1) % ra, i;
  }
}
class na {
  constructor() {
    this.elts = [], this.i = 0;
  }
}
const ra = 12, sn = /* @__PURE__ */ new WeakMap();
class et {
  /**
  Construct a node range. `$from` and `$to` should point into the
  same node until at least the given `depth`, since a node range
  denotes an adjacent set of nodes in a single parent node.
  */
  constructor(e, t, n) {
    this.$from = e, this.$to = t, this.depth = n;
  }
  /**
  The position at the start of the range.
  */
  get start() {
    return this.$from.before(this.depth + 1);
  }
  /**
  The position at the end of the range.
  */
  get end() {
    return this.$to.after(this.depth + 1);
  }
  /**
  The parent node that the range points into.
  */
  get parent() {
    return this.$from.node(this.depth);
  }
  /**
  The start index of the range in the parent node.
  */
  get startIndex() {
    return this.$from.index(this.depth);
  }
  /**
  The end index of the range in the parent node.
  */
  get endIndex() {
    return this.$to.indexAfter(this.depth);
  }
}
const ia = /* @__PURE__ */ Object.create(null);
let de = class kt {
  /**
  @internal
  */
  constructor(e, t, n, i = E.none) {
    this.type = e, this.attrs = t, this.marks = i, this.content = n || x.empty;
  }
  /**
  The array of this node's child nodes.
  */
  get children() {
    return this.content.content;
  }
  /**
  The size of this node, as defined by the integer-based [indexing
  scheme](https://prosemirror.net/docs/guide/#doc.indexing). For text nodes, this is the
  amount of characters. For other leaf nodes, it is one. For
  non-leaf nodes, it is the size of the content plus two (the
  start and end token).
  */
  get nodeSize() {
    return this.isLeaf ? 1 : 2 + this.content.size;
  }
  /**
  The number of children that the node has.
  */
  get childCount() {
    return this.content.childCount;
  }
  /**
  Get the child node at the given index. Raises an error when the
  index is out of range.
  */
  child(e) {
    return this.content.child(e);
  }
  /**
  Get the child node at the given index, if it exists.
  */
  maybeChild(e) {
    return this.content.maybeChild(e);
  }
  /**
  Call `f` for every child node, passing the node, its offset
  into this parent node, and its index.
  */
  forEach(e) {
    this.content.forEach(e);
  }
  /**
  Invoke a callback for all descendant nodes recursively between
  the given two positions that are relative to start of this
  node's content. The callback is invoked with the node, its
  position relative to the original node (method receiver),
  its parent node, and its child index. When the callback returns
  false for a given node, that node's children will not be
  recursed over. The last parameter can be used to specify a
  starting position to count from.
  */
  nodesBetween(e, t, n, i = 0) {
    this.content.nodesBetween(e, t, n, i, this);
  }
  /**
  Call the given callback for every descendant node. Doesn't
  descend into a node when the callback returns `false`.
  */
  descendants(e) {
    this.nodesBetween(0, this.content.size, e);
  }
  /**
  Concatenates all the text nodes found in this fragment and its
  children.
  */
  get textContent() {
    return this.isLeaf && this.type.spec.leafText ? this.type.spec.leafText(this) : this.textBetween(0, this.content.size, "");
  }
  /**
  Get all text between positions `from` and `to`. When
  `blockSeparator` is given, it will be inserted to separate text
  from different block nodes. If `leafText` is given, it'll be
  inserted for every non-text leaf node encountered, otherwise
  [`leafText`](https://prosemirror.net/docs/ref/#model.NodeSpec.leafText) will be used.
  */
  textBetween(e, t, n, i) {
    return this.content.textBetween(e, t, n, i);
  }
  /**
  Returns this node's first child, or `null` if there are no
  children.
  */
  get firstChild() {
    return this.content.firstChild;
  }
  /**
  Returns this node's last child, or `null` if there are no
  children.
  */
  get lastChild() {
    return this.content.lastChild;
  }
  /**
  Test whether two nodes represent the same piece of document.
  */
  eq(e) {
    return this == e || this.sameMarkup(e) && this.content.eq(e.content);
  }
  /**
  Compare the markup (type, attributes, and marks) of this node to
  those of another. Returns `true` if both have the same markup.
  */
  sameMarkup(e) {
    return this.hasMarkup(e.type, e.attrs, e.marks);
  }
  /**
  Check whether this node's markup correspond to the given type,
  attributes, and marks.
  */
  hasMarkup(e, t, n) {
    return this.type == e && Ye(this.attrs, t || e.defaultAttrs || ia) && E.sameSet(this.marks, n || E.none);
  }
  /**
  Create a new node with the same markup as this node, containing
  the given content (or empty, if no content is given).
  */
  copy(e = null) {
    return e == this.content ? this : new kt(this.type, this.attrs, e, this.marks);
  }
  /**
  Create a copy of this node, with the given set of marks instead
  of the node's own marks.
  */
  mark(e) {
    return e == this.marks ? this : new kt(this.type, this.attrs, this.content, e);
  }
  /**
  Create a copy of this node with only the content between the
  given positions. If `to` is not given, it defaults to the end of
  the node.
  */
  cut(e, t = this.content.size) {
    return e == 0 && t == this.content.size ? this : this.copy(this.content.cut(e, t));
  }
  /**
  Cut out the part of the document between the given positions, and
  return it as a `Slice` object.
  */
  slice(e, t = this.content.size, n = !1) {
    if (e == t)
      return v.empty;
    let i = this.resolve(e), a = this.resolve(t), o = n ? 0 : i.sharedDepth(t), s = i.start(o), c = i.node(o).content.cut(i.pos - s, a.pos - s);
    return new v(c, i.depth - o, a.depth - o);
  }
  /**
  Replace the part of the document between the given positions with
  the given slice. The slice must 'fit', meaning its open sides
  must be able to connect to the surrounding content, and its
  content nodes must be valid children for the node they are placed
  into. If any of this is violated, an error of type
  [`ReplaceError`](https://prosemirror.net/docs/ref/#model.ReplaceError) is thrown.
  */
  replace(e, t, n) {
    return ea(this.resolve(e), this.resolve(t), n);
  }
  /**
  Find the node directly after the given position.
  */
  nodeAt(e) {
    for (let t = this; ; ) {
      let { index: n, offset: i } = t.content.findIndex(e);
      if (t = t.maybeChild(n), !t)
        return null;
      if (i == e || t.isText)
        return t;
      e -= i + 1;
    }
  }
  /**
  Find the (direct) child node after the given offset, if any,
  and return it along with its index and offset relative to this
  node.
  */
  childAfter(e) {
    let { index: t, offset: n } = this.content.findIndex(e);
    return { node: this.content.maybeChild(t), index: t, offset: n };
  }
  /**
  Find the (direct) child node before the given offset, if any,
  and return it along with its index and offset relative to this
  node.
  */
  childBefore(e) {
    if (e == 0)
      return { node: null, index: 0, offset: 0 };
    let { index: t, offset: n } = this.content.findIndex(e);
    if (n < e)
      return { node: this.content.child(t), index: t, offset: n };
    let i = this.content.child(t - 1);
    return { node: i, index: t - 1, offset: n - i.nodeSize };
  }
  /**
  Resolve the given position in the document, returning an
  [object](https://prosemirror.net/docs/ref/#model.ResolvedPos) with information about its context.
  */
  resolve(e) {
    return Pe.resolveCached(this, e);
  }
  /**
  @internal
  */
  resolveNoCache(e) {
    return Pe.resolve(this, e);
  }
  /**
  Test whether a given mark or mark type occurs in this document
  between the two given positions.
  */
  rangeHasMark(e, t, n) {
    let i = !1;
    return t > e && this.nodesBetween(e, t, (a) => (n.isInSet(a.marks) && (i = !0), !i)), i;
  }
  /**
  True when this is a block (non-inline node)
  */
  get isBlock() {
    return this.type.isBlock;
  }
  /**
  True when this is a textblock node, a block node with inline
  content.
  */
  get isTextblock() {
    return this.type.isTextblock;
  }
  /**
  True when this node allows inline content.
  */
  get inlineContent() {
    return this.type.inlineContent;
  }
  /**
  True when this is an inline node (a text node or a node that can
  appear among text).
  */
  get isInline() {
    return this.type.isInline;
  }
  /**
  True when this is a text node.
  */
  get isText() {
    return this.type.isText;
  }
  /**
  True when this is a leaf node.
  */
  get isLeaf() {
    return this.type.isLeaf;
  }
  /**
  True when this is an atom, i.e. when it does not have directly
  editable content. This is usually the same as `isLeaf`, but can
  be configured with the [`atom` property](https://prosemirror.net/docs/ref/#model.NodeSpec.atom)
  on a node's spec (typically used when the node is displayed as
  an uneditable [node view](https://prosemirror.net/docs/ref/#view.NodeView)).
  */
  get isAtom() {
    return this.type.isAtom;
  }
  /**
  Return a string representation of this node for debugging
  purposes.
  */
  toString() {
    if (this.type.spec.toDebugString)
      return this.type.spec.toDebugString(this);
    let e = this.type.name;
    return this.content.size && (e += "(" + this.content.toStringInner() + ")"), Xn(this.marks, e);
  }
  /**
  Get the content match in this node at the given index.
  */
  contentMatchAt(e) {
    let t = this.type.contentMatch.matchFragment(this.content, 0, e);
    if (!t)
      throw new Error("Called contentMatchAt on a node with invalid content");
    return t;
  }
  /**
  Test whether replacing the range between `from` and `to` (by
  child index) with the given replacement fragment (which defaults
  to the empty fragment) would leave the node's content valid. You
  can optionally pass `start` and `end` indices into the
  replacement fragment.
  */
  canReplace(e, t, n = x.empty, i = 0, a = n.childCount) {
    let o = this.contentMatchAt(e).matchFragment(n, i, a), s = o && o.matchFragment(this.content, t);
    if (!s || !s.validEnd)
      return !1;
    for (let l = i; l < a; l++)
      if (!this.type.allowsMarks(n.child(l).marks))
        return !1;
    return !0;
  }
  /**
  Test whether replacing the range `from` to `to` (by index) with
  a node of the given type would leave the node's content valid.
  */
  canReplaceWith(e, t, n, i) {
    if (i && !this.type.allowsMarks(i))
      return !1;
    let a = this.contentMatchAt(e).matchType(n), o = a && a.matchFragment(this.content, t);
    return o ? o.validEnd : !1;
  }
  /**
  Test whether the given node's content could be appended to this
  node. If that node is empty, this will only return true if there
  is at least one node type that can appear in both nodes (to avoid
  merging completely incompatible nodes).
  */
  canAppend(e) {
    return e.content.size ? this.canReplace(this.childCount, this.childCount, e.content) : this.type.compatibleContent(e.type);
  }
  /**
  Check whether this node and its descendants conform to the
  schema, and raise an exception when they do not.
  */
  check() {
    this.type.checkContent(this.content), this.type.checkAttrs(this.attrs);
    let e = E.none;
    for (let t = 0; t < this.marks.length; t++) {
      let n = this.marks[t];
      n.type.checkAttrs(n.attrs), e = n.addToSet(e);
    }
    if (!E.sameSet(e, this.marks))
      throw new RangeError(`Invalid collection of marks for node ${this.type.name}: ${this.marks.map((t) => t.type.name)}`);
    this.content.forEach((t) => t.check());
  }
  /**
  Return a JSON-serializeable representation of this node.
  */
  toJSON() {
    let e = { type: this.type.name };
    for (let t in this.attrs) {
      e.attrs = this.attrs;
      break;
    }
    return this.content.size && (e.content = this.content.toJSON()), this.marks.length && (e.marks = this.marks.map((t) => t.toJSON())), e;
  }
  /**
  Deserialize a node from its JSON representation.
  */
  static fromJSON(e, t) {
    if (!t)
      throw new RangeError("Invalid input for Node.fromJSON");
    let n;
    if (t.marks) {
      if (!Array.isArray(t.marks))
        throw new RangeError("Invalid mark data for Node.fromJSON");
      n = t.marks.map(e.markFromJSON);
    }
    if (t.type == "text") {
      if (typeof t.text != "string")
        throw new RangeError("Invalid text node in JSON");
      return e.text(t.text, n);
    }
    let i = x.fromJSON(e, t.content), a = e.nodeType(t.type).create(t.attrs, i, n);
    return a.type.checkAttrs(a.attrs), a;
  }
};
de.prototype.text = void 0;
class tt extends de {
  /**
  @internal
  */
  constructor(e, t, n, i) {
    if (super(e, t, null, i), !n)
      throw new RangeError("Empty text nodes are not allowed");
    this.text = n;
  }
  toString() {
    return this.type.spec.toDebugString ? this.type.spec.toDebugString(this) : Xn(this.marks, JSON.stringify(this.text));
  }
  get textContent() {
    return this.text;
  }
  textBetween(e, t) {
    return this.text.slice(e, t);
  }
  get nodeSize() {
    return this.text.length;
  }
  mark(e) {
    return e == this.marks ? this : new tt(this.type, this.attrs, this.text, e);
  }
  withText(e) {
    return e == this.text ? this : new tt(this.type, this.attrs, e, this.marks);
  }
  cut(e = 0, t = this.text.length) {
    return e == 0 && t == this.text.length ? this : this.withText(this.text.slice(e, t));
  }
  eq(e) {
    return this.sameMarkup(e) && this.text == e.text;
  }
  toJSON() {
    let e = super.toJSON();
    return e.text = this.text, e;
  }
}
function Xn(r, e) {
  for (let t = r.length - 1; t >= 0; t--)
    e = r[t].type.name + "(" + e + ")";
  return e;
}
class ue {
  /**
  @internal
  */
  constructor(e) {
    this.validEnd = e, this.next = [], this.wrapCache = [];
  }
  /**
  @internal
  */
  static parse(e, t) {
    let n = new aa(e, t);
    if (n.next == null)
      return ue.empty;
    let i = Qn(n);
    n.next && n.err("Unexpected trailing text");
    let a = ha(ua(i));
    return pa(a, n), a;
  }
  /**
  Match a node type, returning a match after that node if
  successful.
  */
  matchType(e) {
    for (let t = 0; t < this.next.length; t++)
      if (this.next[t].type == e)
        return this.next[t].next;
    return null;
  }
  /**
  Try to match a fragment. Returns the resulting match when
  successful.
  */
  matchFragment(e, t = 0, n = e.childCount) {
    let i = this;
    for (let a = t; i && a < n; a++)
      i = i.matchType(e.child(a).type);
    return i;
  }
  /**
  @internal
  */
  get inlineContent() {
    return this.next.length != 0 && this.next[0].type.isInline;
  }
  /**
  Get the first matching node type at this match position that can
  be generated.
  */
  get defaultType() {
    for (let e = 0; e < this.next.length; e++) {
      let { type: t } = this.next[e];
      if (!(t.isText || t.hasRequiredAttrs()))
        return t;
    }
    return null;
  }
  /**
  @internal
  */
  compatible(e) {
    for (let t = 0; t < this.next.length; t++)
      for (let n = 0; n < e.next.length; n++)
        if (this.next[t].type == e.next[n].type)
          return !0;
    return !1;
  }
  /**
  Try to match the given fragment, and if that fails, see if it can
  be made to match by inserting nodes in front of it. When
  successful, return a fragment of inserted nodes (which may be
  empty if nothing had to be inserted). When `toEnd` is true, only
  return a fragment if the resulting match goes to the end of the
  content expression.
  */
  fillBefore(e, t = !1, n = 0) {
    let i = [this];
    function a(o, s) {
      let l = o.matchFragment(e, n);
      if (l && (!t || l.validEnd))
        return x.from(s.map((c) => c.createAndFill()));
      for (let c = 0; c < o.next.length; c++) {
        let { type: h, next: u } = o.next[c];
        if (!(h.isText || h.hasRequiredAttrs()) && i.indexOf(u) == -1) {
          i.push(u);
          let p = a(u, s.concat(h));
          if (p)
            return p;
        }
      }
      return null;
    }
    return a(this, []);
  }
  /**
  Find a set of wrapping node types that would allow a node of the
  given type to appear at this position. The result may be empty
  (when it fits directly) and will be null when no such wrapping
  exists.
  */
  findWrapping(e) {
    for (let n = 0; n < this.wrapCache.length; n += 2)
      if (this.wrapCache[n] == e)
        return this.wrapCache[n + 1];
    let t = this.computeWrapping(e);
    return this.wrapCache.push(e, t), t;
  }
  /**
  @internal
  */
  computeWrapping(e) {
    let t = /* @__PURE__ */ Object.create(null), n = [{ match: this, type: null, via: null }];
    for (; n.length; ) {
      let i = n.shift(), a = i.match;
      if (a.matchType(e)) {
        let o = [];
        for (let s = i; s.type; s = s.via)
          o.push(s.type);
        return o.reverse();
      }
      for (let o = 0; o < a.next.length; o++) {
        let { type: s, next: l } = a.next[o];
        !s.isLeaf && !s.hasRequiredAttrs() && !(s.name in t) && (!i.type || l.validEnd) && (n.push({ match: s.contentMatch, type: s, via: i }), t[s.name] = !0);
      }
    }
    return null;
  }
  /**
  The number of outgoing edges this node has in the finite
  automaton that describes the content expression.
  */
  get edgeCount() {
    return this.next.length;
  }
  /**
  Get the _n_​th outgoing edge from this node in the finite
  automaton that describes the content expression.
  */
  edge(e) {
    if (e >= this.next.length)
      throw new RangeError(`There's no ${e}th edge in this content match`);
    return this.next[e];
  }
  /**
  @internal
  */
  toString() {
    let e = [];
    function t(n) {
      e.push(n);
      for (let i = 0; i < n.next.length; i++)
        e.indexOf(n.next[i].next) == -1 && t(n.next[i].next);
    }
    return t(this), e.map((n, i) => {
      let a = i + (n.validEnd ? "*" : " ") + " ";
      for (let o = 0; o < n.next.length; o++)
        a += (o ? ", " : "") + n.next[o].type.name + "->" + e.indexOf(n.next[o].next);
      return a;
    }).join(`
`);
  }
}
ue.empty = new ue(!0);
class aa {
  constructor(e, t) {
    this.string = e, this.nodeTypes = t, this.inline = null, this.pos = 0, this.tokens = e.split(/\s*(?=\b|\W|$)/), this.tokens[this.tokens.length - 1] == "" && this.tokens.pop(), this.tokens[0] == "" && this.tokens.shift();
  }
  get next() {
    return this.tokens[this.pos];
  }
  eat(e) {
    return this.next == e && (this.pos++ || !0);
  }
  err(e) {
    throw new SyntaxError(e + " (in content expression '" + this.string + "')");
  }
}
function Qn(r) {
  let e = [];
  do
    e.push(oa(r));
  while (r.eat("|"));
  return e.length == 1 ? e[0] : { type: "choice", exprs: e };
}
function oa(r) {
  let e = [];
  do
    e.push(sa(r));
  while (r.next && r.next != ")" && r.next != "|");
  return e.length == 1 ? e[0] : { type: "seq", exprs: e };
}
function sa(r) {
  let e = da(r);
  for (; ; )
    if (r.eat("+"))
      e = { type: "plus", expr: e };
    else if (r.eat("*"))
      e = { type: "star", expr: e };
    else if (r.eat("?"))
      e = { type: "opt", expr: e };
    else if (r.eat("{"))
      e = la(r, e);
    else
      break;
  return e;
}
function ln(r) {
  /\D/.test(r.next) && r.err("Expected number, got '" + r.next + "'");
  let e = Number(r.next);
  return r.pos++, e;
}
function la(r, e) {
  let t = ln(r), n = t;
  return r.eat(",") && (r.next != "}" ? n = ln(r) : n = -1), r.eat("}") || r.err("Unclosed braced range"), { type: "range", min: t, max: n, expr: e };
}
function ca(r, e) {
  let t = r.nodeTypes, n = t[e];
  if (n)
    return [n];
  let i = [];
  for (let a in t) {
    let o = t[a];
    o.isInGroup(e) && i.push(o);
  }
  return i.length == 0 && r.err("No node type or group '" + e + "' found"), i;
}
function da(r) {
  if (r.eat("(")) {
    let e = Qn(r);
    return r.eat(")") || r.err("Missing closing paren"), e;
  } else if (/\W/.test(r.next))
    r.err("Unexpected token '" + r.next + "'");
  else {
    let e = ca(r, r.next).map((t) => (r.inline == null ? r.inline = t.isInline : r.inline != t.isInline && r.err("Mixing inline and block content"), { type: "name", value: t }));
    return r.pos++, e.length == 1 ? e[0] : { type: "choice", exprs: e };
  }
}
function ua(r) {
  let e = [[]];
  return i(a(r, 0), t()), e;
  function t() {
    return e.push([]) - 1;
  }
  function n(o, s, l) {
    let c = { term: l, to: s };
    return e[o].push(c), c;
  }
  function i(o, s) {
    o.forEach((l) => l.to = s);
  }
  function a(o, s) {
    if (o.type == "choice")
      return o.exprs.reduce((l, c) => l.concat(a(c, s)), []);
    if (o.type == "seq")
      for (let l = 0; ; l++) {
        let c = a(o.exprs[l], s);
        if (l == o.exprs.length - 1)
          return c;
        i(c, s = t());
      }
    else if (o.type == "star") {
      let l = t();
      return n(s, l), i(a(o.expr, l), l), [n(l)];
    } else if (o.type == "plus") {
      let l = t();
      return i(a(o.expr, s), l), i(a(o.expr, l), l), [n(l)];
    } else {
      if (o.type == "opt")
        return [n(s)].concat(a(o.expr, s));
      if (o.type == "range") {
        let l = s;
        for (let c = 0; c < o.min; c++) {
          let h = t();
          i(a(o.expr, l), h), l = h;
        }
        if (o.max == -1)
          i(a(o.expr, l), l);
        else
          for (let c = o.min; c < o.max; c++) {
            let h = t();
            n(l, h), i(a(o.expr, l), h), l = h;
          }
        return [n(l)];
      } else {
        if (o.type == "name")
          return [n(s, void 0, o.value)];
        throw new Error("Unknown expr type");
      }
    }
  }
}
function er(r, e) {
  return e - r;
}
function cn(r, e) {
  let t = [];
  return n(e), t.sort(er);
  function n(i) {
    let a = r[i];
    if (a.length == 1 && !a[0].term)
      return n(a[0].to);
    t.push(i);
    for (let o = 0; o < a.length; o++) {
      let { term: s, to: l } = a[o];
      !s && t.indexOf(l) == -1 && n(l);
    }
  }
}
function ha(r) {
  let e = /* @__PURE__ */ Object.create(null);
  return t(cn(r, 0));
  function t(n) {
    let i = [];
    n.forEach((o) => {
      r[o].forEach(({ term: s, to: l }) => {
        if (!s)
          return;
        let c;
        for (let h = 0; h < i.length; h++)
          i[h][0] == s && (c = i[h][1]);
        cn(r, l).forEach((h) => {
          c || i.push([s, c = []]), c.indexOf(h) == -1 && c.push(h);
        });
      });
    });
    let a = e[n.join(",")] = new ue(n.indexOf(r.length - 1) > -1);
    for (let o = 0; o < i.length; o++) {
      let s = i[o][1].sort(er);
      a.next.push({ type: i[o][0], next: e[s.join(",")] || t(s) });
    }
    return a;
  }
}
function pa(r, e) {
  for (let t = 0, n = [r]; t < n.length; t++) {
    let i = n[t], a = !i.validEnd, o = [];
    for (let s = 0; s < i.next.length; s++) {
      let { type: l, next: c } = i.next[s];
      o.push(l.name), a && !(l.isText || l.hasRequiredAttrs()) && (a = !1), n.indexOf(c) == -1 && n.push(c);
    }
    a && e.err("Only non-generatable nodes (" + o.join(", ") + ") in a required position (see https://prosemirror.net/docs/guide/#generatable)");
  }
}
function tr(r) {
  let e = /* @__PURE__ */ Object.create(null);
  for (let t in r) {
    let n = r[t];
    if (!n.hasDefault)
      return null;
    e[t] = n.default;
  }
  return e;
}
function nr(r, e) {
  let t = /* @__PURE__ */ Object.create(null);
  for (let n in r) {
    let i = e && e[n];
    if (i === void 0) {
      let a = r[n];
      if (a.hasDefault)
        i = a.default;
      else
        throw new RangeError("No value supplied for attribute " + n);
    }
    t[n] = i;
  }
  return t;
}
function rr(r, e, t, n) {
  for (let i in e)
    if (!(i in r))
      throw new RangeError(`Unsupported attribute ${i} for ${t} of type ${i}`);
  for (let i in r) {
    let a = r[i];
    a.validate && a.validate(e[i]);
  }
}
function ir(r, e) {
  let t = /* @__PURE__ */ Object.create(null);
  if (e)
    for (let n in e)
      t[n] = new ma(r, n, e[n]);
  return t;
}
class nt {
  /**
  @internal
  */
  constructor(e, t, n) {
    this.name = e, this.schema = t, this.spec = n, this.markSet = null, this.groups = n.group ? n.group.split(" ") : [], this.attrs = ir(e, n.attrs), this.defaultAttrs = tr(this.attrs), this.contentMatch = null, this.inlineContent = null, this.isBlock = !(n.inline || e == "text"), this.isText = e == "text";
  }
  /**
  True if this is an inline type.
  */
  get isInline() {
    return !this.isBlock;
  }
  /**
  True if this is a textblock type, a block that contains inline
  content.
  */
  get isTextblock() {
    return this.isBlock && this.inlineContent;
  }
  /**
  True for node types that allow no content.
  */
  get isLeaf() {
    return this.contentMatch == ue.empty;
  }
  /**
  True when this node is an atom, i.e. when it does not have
  directly editable content.
  */
  get isAtom() {
    return this.isLeaf || !!this.spec.atom;
  }
  /**
  Return true when this node type is part of the given
  [group](https://prosemirror.net/docs/ref/#model.NodeSpec.group).
  */
  isInGroup(e) {
    return this.groups.indexOf(e) > -1;
  }
  /**
  The node type's [whitespace](https://prosemirror.net/docs/ref/#model.NodeSpec.whitespace) option.
  */
  get whitespace() {
    return this.spec.whitespace || (this.spec.code ? "pre" : "normal");
  }
  /**
  Tells you whether this node type has any required attributes.
  */
  hasRequiredAttrs() {
    for (let e in this.attrs)
      if (this.attrs[e].isRequired)
        return !0;
    return !1;
  }
  /**
  Indicates whether this node allows some of the same content as
  the given node type.
  */
  compatibleContent(e) {
    return this == e || this.contentMatch.compatible(e.contentMatch);
  }
  /**
  @internal
  */
  computeAttrs(e) {
    return !e && this.defaultAttrs ? this.defaultAttrs : nr(this.attrs, e);
  }
  /**
  Create a `Node` of this type. The given attributes are
  checked and defaulted (you can pass `null` to use the type's
  defaults entirely, if no required attributes exist). `content`
  may be a `Fragment`, a node, an array of nodes, or
  `null`. Similarly `marks` may be `null` to default to the empty
  set of marks.
  */
  create(e = null, t, n) {
    if (this.isText)
      throw new Error("NodeType.create can't construct text nodes");
    return new de(this, this.computeAttrs(e), x.from(t), E.setFrom(n));
  }
  /**
  Like [`create`](https://prosemirror.net/docs/ref/#model.NodeType.create), but check the given content
  against the node type's content restrictions, and throw an error
  if it doesn't match.
  */
  createChecked(e = null, t, n) {
    return t = x.from(t), this.checkContent(t), new de(this, this.computeAttrs(e), t, E.setFrom(n));
  }
  /**
  Like [`create`](https://prosemirror.net/docs/ref/#model.NodeType.create), but see if it is
  necessary to add nodes to the start or end of the given fragment
  to make it fit the node. If no fitting wrapping can be found,
  return null. Note that, due to the fact that required nodes can
  always be created, this will always succeed if you pass null or
  `Fragment.empty` as content.
  */
  createAndFill(e = null, t, n) {
    if (e = this.computeAttrs(e), t = x.from(t), t.size) {
      let o = this.contentMatch.fillBefore(t);
      if (!o)
        return null;
      t = o.append(t);
    }
    let i = this.contentMatch.matchFragment(t), a = i && i.fillBefore(x.empty, !0);
    return a ? new de(this, e, t.append(a), E.setFrom(n)) : null;
  }
  /**
  Returns true if the given fragment is valid content for this node
  type.
  */
  validContent(e) {
    let t = this.contentMatch.matchFragment(e);
    if (!t || !t.validEnd)
      return !1;
    for (let n = 0; n < e.childCount; n++)
      if (!this.allowsMarks(e.child(n).marks))
        return !1;
    return !0;
  }
  /**
  Throws a RangeError if the given fragment is not valid content for this
  node type.
  @internal
  */
  checkContent(e) {
    if (!this.validContent(e))
      throw new RangeError(`Invalid content for node ${this.name}: ${e.toString().slice(0, 50)}`);
  }
  /**
  @internal
  */
  checkAttrs(e) {
    rr(this.attrs, e, "node", this.name);
  }
  /**
  Check whether the given mark type is allowed in this node.
  */
  allowsMarkType(e) {
    return this.markSet == null || this.markSet.indexOf(e) > -1;
  }
  /**
  Test whether the given set of marks are allowed in this node.
  */
  allowsMarks(e) {
    if (this.markSet == null)
      return !0;
    for (let t = 0; t < e.length; t++)
      if (!this.allowsMarkType(e[t].type))
        return !1;
    return !0;
  }
  /**
  Removes the marks that are not allowed in this node from the given set.
  */
  allowedMarks(e) {
    if (this.markSet == null)
      return e;
    let t;
    for (let n = 0; n < e.length; n++)
      this.allowsMarkType(e[n].type) ? t && t.push(e[n]) : t || (t = e.slice(0, n));
    return t ? t.length ? t : E.none : e;
  }
  /**
  @internal
  */
  static compile(e, t) {
    let n = /* @__PURE__ */ Object.create(null);
    e.forEach((a, o) => n[a] = new nt(a, t, o));
    let i = t.spec.topNode || "doc";
    if (!n[i])
      throw new RangeError("Schema is missing its top node type ('" + i + "')");
    if (!n.text)
      throw new RangeError("Every schema needs a 'text' type");
    for (let a in n.text.attrs)
      throw new RangeError("The text node type should not have attributes");
    return n;
  }
}
function fa(r, e, t) {
  let n = t.split("|");
  return (i) => {
    let a = i === null ? "null" : typeof i;
    if (n.indexOf(a) < 0)
      throw new RangeError(`Expected value of type ${n} for attribute ${e} on type ${r}, got ${a}`);
  };
}
class ma {
  constructor(e, t, n) {
    this.hasDefault = Object.prototype.hasOwnProperty.call(n, "default"), this.default = n.default, this.validate = typeof n.validate == "string" ? fa(e, t, n.validate) : n.validate;
  }
  get isRequired() {
    return !this.hasDefault;
  }
}
class zt {
  /**
  @internal
  */
  constructor(e, t, n, i) {
    this.name = e, this.rank = t, this.schema = n, this.spec = i, this.attrs = ir(e, i.attrs), this.excluded = null;
    let a = tr(this.attrs);
    this.instance = a ? new E(this, a) : null;
  }
  /**
  Create a mark of this type. `attrs` may be `null` or an object
  containing only some of the mark's attributes. The others, if
  they have defaults, will be added.
  */
  create(e = null) {
    return !e && this.instance ? this.instance : new E(this, nr(this.attrs, e));
  }
  /**
  @internal
  */
  static compile(e, t) {
    let n = /* @__PURE__ */ Object.create(null), i = 0;
    return e.forEach((a, o) => n[a] = new zt(a, i++, t, o)), n;
  }
  /**
  When there is a mark of this type in the given set, a new set
  without it is returned. Otherwise, the input set is returned.
  */
  removeFromSet(e) {
    for (var t = 0; t < e.length; t++)
      e[t].type == this && (e = e.slice(0, t).concat(e.slice(t + 1)), t--);
    return e;
  }
  /**
  Tests whether there is a mark of this type in the given set.
  */
  isInSet(e) {
    for (let t = 0; t < e.length; t++)
      if (e[t].type == this)
        return e[t];
  }
  /**
  @internal
  */
  checkAttrs(e) {
    rr(this.attrs, e, "mark", this.name);
  }
  /**
  Queries whether a given mark type is
  [excluded](https://prosemirror.net/docs/ref/#model.MarkSpec.excludes) by this one.
  */
  excludes(e) {
    return this.excluded.indexOf(e) > -1;
  }
}
class ga {
  /**
  Construct a schema from a schema [specification](https://prosemirror.net/docs/ref/#model.SchemaSpec).
  */
  constructor(e) {
    this.linebreakReplacement = null, this.cached = /* @__PURE__ */ Object.create(null);
    let t = this.spec = {};
    for (let i in e)
      t[i] = e[i];
    t.nodes = I.from(e.nodes), t.marks = I.from(e.marks || {}), this.nodes = nt.compile(this.spec.nodes, this), this.marks = zt.compile(this.spec.marks, this);
    let n = /* @__PURE__ */ Object.create(null);
    for (let i in this.nodes) {
      if (i in this.marks)
        throw new RangeError(i + " can not be both a node and a mark");
      let a = this.nodes[i], o = a.spec.content || "", s = a.spec.marks;
      if (a.contentMatch = n[o] || (n[o] = ue.parse(o, this.nodes)), a.inlineContent = a.contentMatch.inlineContent, a.spec.linebreakReplacement) {
        if (this.linebreakReplacement)
          throw new RangeError("Multiple linebreak nodes defined");
        if (!a.isInline || !a.isLeaf)
          throw new RangeError("Linebreak replacement nodes must be inline leaf nodes");
        this.linebreakReplacement = a;
      }
      a.markSet = s == "_" ? null : s ? dn(this, s.split(" ")) : s == "" || !a.inlineContent ? [] : null;
    }
    for (let i in this.marks) {
      let a = this.marks[i], o = a.spec.excludes;
      a.excluded = o == null ? [a] : o == "" ? [] : dn(this, o.split(" "));
    }
    this.nodeFromJSON = (i) => de.fromJSON(this, i), this.markFromJSON = (i) => E.fromJSON(this, i), this.topNodeType = this.nodes[this.spec.topNode || "doc"], this.cached.wrappings = /* @__PURE__ */ Object.create(null);
  }
  /**
  Create a node in this schema. The `type` may be a string or a
  `NodeType` instance. Attributes will be extended with defaults,
  `content` may be a `Fragment`, `null`, a `Node`, or an array of
  nodes.
  */
  node(e, t = null, n, i) {
    if (typeof e == "string")
      e = this.nodeType(e);
    else if (e instanceof nt) {
      if (e.schema != this)
        throw new RangeError("Node type from different schema used (" + e.name + ")");
    } else throw new RangeError("Invalid node type: " + e);
    return e.createChecked(t, n, i);
  }
  /**
  Create a text node in the schema. Empty text nodes are not
  allowed.
  */
  text(e, t) {
    let n = this.nodes.text;
    return new tt(n, n.defaultAttrs, e, E.setFrom(t));
  }
  /**
  Create a mark with the given type and attributes.
  */
  mark(e, t) {
    return typeof e == "string" && (e = this.marks[e]), e.create(t);
  }
  /**
  @internal
  */
  nodeType(e) {
    let t = this.nodes[e];
    if (!t)
      throw new RangeError("Unknown node type: " + e);
    return t;
  }
}
function dn(r, e) {
  let t = [];
  for (let n = 0; n < e.length; n++) {
    let i = e[n], a = r.marks[i], o = a;
    if (a)
      t.push(a);
    else
      for (let s in r.marks) {
        let l = r.marks[s];
        (i == "_" || l.spec.group && l.spec.group.split(" ").indexOf(i) > -1) && t.push(o = l);
      }
    if (!o)
      throw new SyntaxError("Unknown mark type: '" + e[n] + "'");
  }
  return t;
}
function ba(r) {
  return r.tag != null;
}
function ya(r) {
  return r.style != null;
}
class ge {
  /**
  Create a parser that targets the given schema, using the given
  parsing rules.
  */
  constructor(e, t) {
    this.schema = e, this.rules = t, this.tags = [], this.styles = [];
    let n = this.matchedStyles = [];
    t.forEach((i) => {
      if (ba(i))
        this.tags.push(i);
      else if (ya(i)) {
        let a = /[^=]*/.exec(i.style)[0];
        n.indexOf(a) < 0 && n.push(a), this.styles.push(i);
      }
    }), this.normalizeLists = !this.tags.some((i) => {
      if (!/^(ul|ol)\b/.test(i.tag) || !i.node)
        return !1;
      let a = e.nodes[i.node];
      return a.contentMatch.matchType(a);
    });
  }
  /**
  Parse a document from the content of a DOM node.
  */
  parse(e, t = {}) {
    let n = new hn(this, t, !1);
    return n.addAll(e, E.none, t.from, t.to), n.finish();
  }
  /**
  Parses the content of the given DOM node, like
  [`parse`](https://prosemirror.net/docs/ref/#model.DOMParser.parse), and takes the same set of
  options. But unlike that method, which produces a whole node,
  this one returns a slice that is open at the sides, meaning that
  the schema constraints aren't applied to the start of nodes to
  the left of the input and the end of nodes at the end.
  */
  parseSlice(e, t = {}) {
    let n = new hn(this, t, !0);
    return n.addAll(e, E.none, t.from, t.to), v.maxOpen(n.finish());
  }
  /**
  @internal
  */
  matchTag(e, t, n) {
    for (let i = n ? this.tags.indexOf(n) + 1 : 0; i < this.tags.length; i++) {
      let a = this.tags[i];
      if (va(e, a.tag) && (a.namespace === void 0 || e.namespaceURI == a.namespace) && (!a.context || t.matchesContext(a.context))) {
        if (a.getAttrs) {
          let o = a.getAttrs(e);
          if (o === !1)
            continue;
          a.attrs = o || void 0;
        }
        return a;
      }
    }
  }
  /**
  @internal
  */
  matchStyle(e, t, n, i) {
    for (let a = i ? this.styles.indexOf(i) + 1 : 0; a < this.styles.length; a++) {
      let o = this.styles[a], s = o.style;
      if (!(s.indexOf(e) != 0 || o.context && !n.matchesContext(o.context) || // Test that the style string either precisely matches the prop,
      // or has an '=' sign after the prop, followed by the given
      // value.
      s.length > e.length && (s.charCodeAt(e.length) != 61 || s.slice(e.length + 1) != t))) {
        if (o.getAttrs) {
          let l = o.getAttrs(t);
          if (l === !1)
            continue;
          o.attrs = l || void 0;
        }
        return o;
      }
    }
  }
  /**
  @internal
  */
  static schemaRules(e) {
    let t = [];
    function n(i) {
      let a = i.priority == null ? 50 : i.priority, o = 0;
      for (; o < t.length; o++) {
        let s = t[o];
        if ((s.priority == null ? 50 : s.priority) < a)
          break;
      }
      t.splice(o, 0, i);
    }
    for (let i in e.marks) {
      let a = e.marks[i].spec.parseDOM;
      a && a.forEach((o) => {
        n(o = pn(o)), o.mark || o.ignore || o.clearMark || (o.mark = i);
      });
    }
    for (let i in e.nodes) {
      let a = e.nodes[i].spec.parseDOM;
      a && a.forEach((o) => {
        n(o = pn(o)), o.node || o.ignore || o.mark || (o.node = i);
      });
    }
    return t;
  }
  /**
  Construct a DOM parser using the parsing rules listed in a
  schema's [node specs](https://prosemirror.net/docs/ref/#model.NodeSpec.parseDOM), reordered by
  [priority](https://prosemirror.net/docs/ref/#model.GenericParseRule.priority).
  */
  static fromSchema(e) {
    return e.cached.domParser || (e.cached.domParser = new ge(e, ge.schemaRules(e)));
  }
}
const ar = {
  address: !0,
  article: !0,
  aside: !0,
  blockquote: !0,
  canvas: !0,
  dd: !0,
  div: !0,
  dl: !0,
  fieldset: !0,
  figcaption: !0,
  figure: !0,
  footer: !0,
  form: !0,
  h1: !0,
  h2: !0,
  h3: !0,
  h4: !0,
  h5: !0,
  h6: !0,
  header: !0,
  hgroup: !0,
  hr: !0,
  li: !0,
  noscript: !0,
  ol: !0,
  output: !0,
  p: !0,
  pre: !0,
  section: !0,
  table: !0,
  tfoot: !0,
  ul: !0
}, wa = {
  head: !0,
  noscript: !0,
  object: !0,
  script: !0,
  style: !0,
  title: !0
}, or = { ol: !0, ul: !0 }, Oe = 1, St = 2, Ae = 4;
function un(r, e, t) {
  return e != null ? (e ? Oe : 0) | (e === "full" ? St : 0) : r && r.whitespace == "pre" ? Oe | St : t & ~Ae;
}
class Ve {
  constructor(e, t, n, i, a, o) {
    this.type = e, this.attrs = t, this.marks = n, this.solid = i, this.options = o, this.content = [], this.activeMarks = E.none, this.match = a || (o & Ae ? null : e.contentMatch);
  }
  findWrapping(e) {
    if (!this.match) {
      if (!this.type)
        return [];
      let t = this.type.contentMatch.fillBefore(x.from(e));
      if (t)
        this.match = this.type.contentMatch.matchFragment(t);
      else {
        let n = this.type.contentMatch, i;
        return (i = n.findWrapping(e.type)) ? (this.match = n, i) : null;
      }
    }
    return this.match.findWrapping(e.type);
  }
  finish(e) {
    if (!(this.options & Oe)) {
      let n = this.content[this.content.length - 1], i;
      if (n && n.isText && (i = /[ \t\r\n\u000c]+$/.exec(n.text))) {
        let a = n;
        n.text.length == i[0].length ? this.content.pop() : this.content[this.content.length - 1] = a.withText(a.text.slice(0, a.text.length - i[0].length));
      }
    }
    let t = x.from(this.content);
    return !e && this.match && (t = t.append(this.match.fillBefore(x.empty, !0))), this.type ? this.type.create(this.attrs, t, this.marks) : t;
  }
  inlineContext(e) {
    return this.type ? this.type.inlineContent : this.content.length ? this.content[0].isInline : e.parentNode && !ar.hasOwnProperty(e.parentNode.nodeName.toLowerCase());
  }
}
class hn {
  constructor(e, t, n) {
    this.parser = e, this.options = t, this.isOpen = n, this.open = 0, this.localPreserveWS = !1;
    let i = t.topNode, a, o = un(null, t.preserveWhitespace, 0) | (n ? Ae : 0);
    i ? a = new Ve(i.type, i.attrs, E.none, !0, t.topMatch || i.type.contentMatch, o) : n ? a = new Ve(null, null, E.none, !0, null, o) : a = new Ve(e.schema.topNodeType, null, E.none, !0, null, o), this.nodes = [a], this.find = t.findPositions, this.needsBlock = !1;
  }
  get top() {
    return this.nodes[this.open];
  }
  // Add a DOM node to the content. Text is inserted as text node,
  // otherwise, the node is passed to `addElement` or, if it has a
  // `style` attribute, `addElementWithStyles`.
  addDOM(e, t) {
    e.nodeType == 3 ? this.addTextNode(e, t) : e.nodeType == 1 && this.addElement(e, t);
  }
  addTextNode(e, t) {
    let n = e.nodeValue, i = this.top, a = i.options & St ? "full" : this.localPreserveWS || (i.options & Oe) > 0, { schema: o } = this.parser;
    if (a === "full" || i.inlineContext(e) || /[^ \t\r\n\u000c]/.test(n)) {
      if (a)
        if (a === "full")
          n = n.replace(/\r\n?/g, `
`);
        else if (o.linebreakReplacement && /[\r\n]/.test(n) && this.top.findWrapping(o.linebreakReplacement.create())) {
          let s = n.split(/\r?\n|\r/);
          for (let l = 0; l < s.length; l++)
            l && this.insertNode(o.linebreakReplacement.create(), t, !0), s[l] && this.insertNode(o.text(s[l]), t, !/\S/.test(s[l]));
          n = "";
        } else
          n = n.replace(/\r?\n|\r/g, " ");
      else if (n = n.replace(/[ \t\r\n\u000c]+/g, " "), /^[ \t\r\n\u000c]/.test(n) && this.open == this.nodes.length - 1) {
        let s = i.content[i.content.length - 1], l = e.previousSibling;
        (!s || l && l.nodeName == "BR" || s.isText && /[ \t\r\n\u000c]$/.test(s.text)) && (n = n.slice(1));
      }
      n && this.insertNode(o.text(n), t, !/\S/.test(n)), this.findInText(e);
    } else
      this.findInside(e);
  }
  // Try to find a handler for the given tag and use that to parse. If
  // none is found, the element's content nodes are added directly.
  addElement(e, t, n) {
    let i = this.localPreserveWS, a = this.top;
    (e.tagName == "PRE" || /pre/.test(e.style && e.style.whiteSpace)) && (this.localPreserveWS = !0);
    let o = e.nodeName.toLowerCase(), s;
    or.hasOwnProperty(o) && this.parser.normalizeLists && xa(e);
    let l = this.options.ruleFromNode && this.options.ruleFromNode(e) || (s = this.parser.matchTag(e, this, n));
    e: if (l ? l.ignore : wa.hasOwnProperty(o))
      this.findInside(e), this.ignoreFallback(e, t);
    else if (!l || l.skip || l.closeParent) {
      l && l.closeParent ? this.open = Math.max(0, this.open - 1) : l && l.skip.nodeType && (e = l.skip);
      let c, h = this.needsBlock;
      if (ar.hasOwnProperty(o))
        a.content.length && a.content[0].isInline && this.open && (this.open--, a = this.top), c = !0, a.type || (this.needsBlock = !0);
      else if (!e.firstChild) {
        this.leafFallback(e, t);
        break e;
      }
      let u = l && l.skip ? t : this.readStyles(e, t);
      u && this.addAll(e, u), c && this.sync(a), this.needsBlock = h;
    } else {
      let c = this.readStyles(e, t);
      c && this.addElementByRule(e, l, c, l.consuming === !1 ? s : void 0);
    }
    this.localPreserveWS = i;
  }
  // Called for leaf DOM nodes that would otherwise be ignored
  leafFallback(e, t) {
    e.nodeName == "BR" && this.top.type && this.top.type.inlineContent && this.addTextNode(e.ownerDocument.createTextNode(`
`), t);
  }
  // Called for ignored nodes
  ignoreFallback(e, t) {
    e.nodeName == "BR" && (!this.top.type || !this.top.type.inlineContent) && this.findPlace(this.parser.schema.text("-"), t, !0);
  }
  // Run any style parser associated with the node's styles. Either
  // return an updated array of marks, or null to indicate some of the
  // styles had a rule with `ignore` set.
  readStyles(e, t) {
    let n = e.style;
    if (n && n.length)
      for (let i = 0; i < this.parser.matchedStyles.length; i++) {
        let a = this.parser.matchedStyles[i], o = n.getPropertyValue(a);
        if (o)
          for (let s = void 0; ; ) {
            let l = this.parser.matchStyle(a, o, this, s);
            if (!l)
              break;
            if (l.ignore)
              return null;
            if (l.clearMark ? t = t.filter((c) => !l.clearMark(c)) : t = t.concat(this.parser.schema.marks[l.mark].create(l.attrs)), l.consuming === !1)
              s = l;
            else
              break;
          }
      }
    return t;
  }
  // Look up a handler for the given node. If none are found, return
  // false. Otherwise, apply it, use its return value to drive the way
  // the node's content is wrapped, and return true.
  addElementByRule(e, t, n, i) {
    let a, o;
    if (t.node)
      if (o = this.parser.schema.nodes[t.node], o.isLeaf)
        this.insertNode(o.create(t.attrs), n, e.nodeName == "BR") || this.leafFallback(e, n);
      else {
        let l = this.enter(o, t.attrs || null, n, t.preserveWhitespace);
        l && (a = !0, n = l);
      }
    else {
      let l = this.parser.schema.marks[t.mark];
      n = n.concat(l.create(t.attrs));
    }
    let s = this.top;
    if (o && o.isLeaf)
      this.findInside(e);
    else if (i)
      this.addElement(e, n, i);
    else if (t.getContent)
      this.findInside(e), t.getContent(e, this.parser.schema).forEach((l) => this.insertNode(l, n, !1));
    else {
      let l = e;
      typeof t.contentElement == "string" ? l = e.querySelector(t.contentElement) : typeof t.contentElement == "function" ? l = t.contentElement(e) : t.contentElement && (l = t.contentElement), this.findAround(e, l, !0), this.addAll(l, n), this.findAround(e, l, !1);
    }
    a && this.sync(s) && this.open--;
  }
  // Add all child nodes between `startIndex` and `endIndex` (or the
  // whole node, if not given). If `sync` is passed, use it to
  // synchronize after every block element.
  addAll(e, t, n, i) {
    let a = n || 0;
    for (let o = n ? e.childNodes[n] : e.firstChild, s = i == null ? null : e.childNodes[i]; o != s; o = o.nextSibling, ++a)
      this.findAtPoint(e, a), this.addDOM(o, t);
    this.findAtPoint(e, a);
  }
  // Try to find a way to fit the given node type into the current
  // context. May add intermediate wrappers and/or leave non-solid
  // nodes that we're in.
  findPlace(e, t, n) {
    let i, a;
    for (let o = this.open, s = 0; o >= 0; o--) {
      let l = this.nodes[o], c = l.findWrapping(e);
      if (c && (!i || i.length > c.length + s) && (i = c, a = l, !c.length))
        break;
      if (l.solid) {
        if (n)
          break;
        s += 2;
      }
    }
    if (!i)
      return null;
    this.sync(a);
    for (let o = 0; o < i.length; o++)
      t = this.enterInner(i[o], null, t, !1);
    return t;
  }
  // Try to insert the given node, adjusting the context when needed.
  insertNode(e, t, n) {
    if (e.isInline && this.needsBlock && !this.top.type) {
      let a = this.textblockFromContext();
      a && (t = this.enterInner(a, null, t));
    }
    let i = this.findPlace(e, t, n);
    if (i) {
      this.closeExtra();
      let a = this.top;
      a.match && (a.match = a.match.matchType(e.type));
      let o = E.none;
      for (let s of i.concat(e.marks))
        (a.type ? a.type.allowsMarkType(s.type) : fn(s.type, e.type)) && (o = s.addToSet(o));
      return a.content.push(e.mark(o)), !0;
    }
    return !1;
  }
  // Try to start a node of the given type, adjusting the context when
  // necessary.
  enter(e, t, n, i) {
    let a = this.findPlace(e.create(t), n, !1);
    return a && (a = this.enterInner(e, t, n, !0, i)), a;
  }
  // Open a node of the given type
  enterInner(e, t, n, i = !1, a) {
    this.closeExtra();
    let o = this.top;
    o.match = o.match && o.match.matchType(e);
    let s = un(e, a, o.options);
    o.options & Ae && o.content.length == 0 && (s |= Ae);
    let l = E.none;
    return n = n.filter((c) => (o.type ? o.type.allowsMarkType(c.type) : fn(c.type, e)) ? (l = c.addToSet(l), !1) : !0), this.nodes.push(new Ve(e, t, l, i, null, s)), this.open++, n;
  }
  // Make sure all nodes above this.open are finished and added to
  // their parents
  closeExtra(e = !1) {
    let t = this.nodes.length - 1;
    if (t > this.open) {
      for (; t > this.open; t--)
        this.nodes[t - 1].content.push(this.nodes[t].finish(e));
      this.nodes.length = this.open + 1;
    }
  }
  finish() {
    return this.open = 0, this.closeExtra(this.isOpen), this.nodes[0].finish(!!(this.isOpen || this.options.topOpen));
  }
  sync(e) {
    for (let t = this.open; t >= 0; t--) {
      if (this.nodes[t] == e)
        return this.open = t, !0;
      this.localPreserveWS && (this.nodes[t].options |= Oe);
    }
    return !1;
  }
  get currentPos() {
    this.closeExtra();
    let e = 0;
    for (let t = this.open; t >= 0; t--) {
      let n = this.nodes[t].content;
      for (let i = n.length - 1; i >= 0; i--)
        e += n[i].nodeSize;
      t && e++;
    }
    return e;
  }
  findAtPoint(e, t) {
    if (this.find)
      for (let n = 0; n < this.find.length; n++)
        this.find[n].node == e && this.find[n].offset == t && (this.find[n].pos = this.currentPos);
  }
  findInside(e) {
    if (this.find)
      for (let t = 0; t < this.find.length; t++)
        this.find[t].pos == null && e.nodeType == 1 && e.contains(this.find[t].node) && (this.find[t].pos = this.currentPos);
  }
  findAround(e, t, n) {
    if (e != t && this.find)
      for (let i = 0; i < this.find.length; i++)
        this.find[i].pos == null && e.nodeType == 1 && e.contains(this.find[i].node) && t.compareDocumentPosition(this.find[i].node) & (n ? 2 : 4) && (this.find[i].pos = this.currentPos);
  }
  findInText(e) {
    if (this.find)
      for (let t = 0; t < this.find.length; t++)
        this.find[t].node == e && (this.find[t].pos = this.currentPos - (e.nodeValue.length - this.find[t].offset));
  }
  // Determines whether the given context string matches this context.
  matchesContext(e) {
    if (e.indexOf("|") > -1)
      return e.split(/\s*\|\s*/).some(this.matchesContext, this);
    let t = e.split("/"), n = this.options.context, i = !this.isOpen && (!n || n.parent.type == this.nodes[0].type), a = -(n ? n.depth + 1 : 0) + (i ? 0 : 1), o = (s, l) => {
      for (; s >= 0; s--) {
        let c = t[s];
        if (c == "") {
          if (s == t.length - 1 || s == 0)
            continue;
          for (; l >= a; l--)
            if (o(s - 1, l))
              return !0;
          return !1;
        } else {
          let h = l > 0 || l == 0 && i ? this.nodes[l].type : n && l >= a ? n.node(l - a).type : null;
          if (!h || h.name != c && !h.isInGroup(c))
            return !1;
          l--;
        }
      }
      return !0;
    };
    return o(t.length - 1, this.open);
  }
  textblockFromContext() {
    let e = this.options.context;
    if (e)
      for (let t = e.depth; t >= 0; t--) {
        let n = e.node(t).contentMatchAt(e.indexAfter(t)).defaultType;
        if (n && n.isTextblock && n.defaultAttrs)
          return n;
      }
    for (let t in this.parser.schema.nodes) {
      let n = this.parser.schema.nodes[t];
      if (n.isTextblock && n.defaultAttrs)
        return n;
    }
  }
}
function xa(r) {
  for (let e = r.firstChild, t = null; e; e = e.nextSibling) {
    let n = e.nodeType == 1 ? e.nodeName.toLowerCase() : null;
    n && or.hasOwnProperty(n) && t ? (t.appendChild(e), e = t) : n == "li" ? t = e : n && (t = null);
  }
}
function va(r, e) {
  return (r.matches || r.msMatchesSelector || r.webkitMatchesSelector || r.mozMatchesSelector).call(r, e);
}
function pn(r) {
  let e = {};
  for (let t in r)
    e[t] = r[t];
  return e;
}
function fn(r, e) {
  let t = e.schema.nodes;
  for (let n in t) {
    let i = t[n];
    if (!i.allowsMarkType(r))
      continue;
    let a = [], o = (s) => {
      a.push(s);
      for (let l = 0; l < s.edgeCount; l++) {
        let { type: c, next: h } = s.edge(l);
        if (c == e || a.indexOf(h) < 0 && o(h))
          return !0;
      }
    };
    if (o(i.contentMatch))
      return !0;
  }
}
const sr = 65535, lr = Math.pow(2, 16);
function ka(r, e) {
  return r + e * lr;
}
function mn(r) {
  return r & sr;
}
function Sa(r) {
  return (r - (r & sr)) / lr;
}
const cr = 1, dr = 2, Ge = 4, ur = 8;
class gn {
  /**
  @internal
  */
  constructor(e, t, n) {
    this.pos = e, this.delInfo = t, this.recover = n;
  }
  /**
  Tells you whether the position was deleted, that is, whether the
  step removed the token on the side queried (via the `assoc`)
  argument from the document.
  */
  get deleted() {
    return (this.delInfo & ur) > 0;
  }
  /**
  Tells you whether the token before the mapped position was deleted.
  */
  get deletedBefore() {
    return (this.delInfo & (cr | Ge)) > 0;
  }
  /**
  True when the token after the mapped position was deleted.
  */
  get deletedAfter() {
    return (this.delInfo & (dr | Ge)) > 0;
  }
  /**
  Tells whether any of the steps mapped through deletes across the
  position (including both the token before and after the
  position).
  */
  get deletedAcross() {
    return (this.delInfo & Ge) > 0;
  }
}
class U {
  /**
  Create a position map. The modifications to the document are
  represented as an array of numbers, in which each group of three
  represents a modified chunk as `[start, oldSize, newSize]`.
  */
  constructor(e, t = !1) {
    if (this.ranges = e, this.inverted = t, !e.length && U.empty)
      return U.empty;
  }
  /**
  @internal
  */
  recover(e) {
    let t = 0, n = mn(e);
    if (!this.inverted)
      for (let i = 0; i < n; i++)
        t += this.ranges[i * 3 + 2] - this.ranges[i * 3 + 1];
    return this.ranges[n * 3] + t + Sa(e);
  }
  mapResult(e, t = 1) {
    return this._map(e, t, !1);
  }
  map(e, t = 1) {
    return this._map(e, t, !0);
  }
  /**
  @internal
  */
  _map(e, t, n) {
    let i = 0, a = this.inverted ? 2 : 1, o = this.inverted ? 1 : 2;
    for (let s = 0; s < this.ranges.length; s += 3) {
      let l = this.ranges[s] - (this.inverted ? i : 0);
      if (l > e)
        break;
      let c = this.ranges[s + a], h = this.ranges[s + o], u = l + c;
      if (e <= u) {
        let p = c ? e == l ? -1 : e == u ? 1 : t : t, f = l + i + (p < 0 ? 0 : h);
        if (n)
          return f;
        let b = e == (t < 0 ? l : u) ? null : ka(s / 3, e - l), m = e == l ? dr : e == u ? cr : Ge;
        return (t < 0 ? e != l : e != u) && (m |= ur), new gn(f, m, b);
      }
      i += h - c;
    }
    return n ? e + i : new gn(e + i, 0, null);
  }
  /**
  @internal
  */
  touches(e, t) {
    let n = 0, i = mn(t), a = this.inverted ? 2 : 1, o = this.inverted ? 1 : 2;
    for (let s = 0; s < this.ranges.length; s += 3) {
      let l = this.ranges[s] - (this.inverted ? n : 0);
      if (l > e)
        break;
      let c = this.ranges[s + a], h = l + c;
      if (e <= h && s == i * 3)
        return !0;
      n += this.ranges[s + o] - c;
    }
    return !1;
  }
  /**
  Calls the given function on each of the changed ranges included in
  this map.
  */
  forEach(e) {
    let t = this.inverted ? 2 : 1, n = this.inverted ? 1 : 2;
    for (let i = 0, a = 0; i < this.ranges.length; i += 3) {
      let o = this.ranges[i], s = o - (this.inverted ? a : 0), l = o + (this.inverted ? 0 : a), c = this.ranges[i + t], h = this.ranges[i + n];
      e(s, s + c, l, l + h), a += h - c;
    }
  }
  /**
  Create an inverted version of this map. The result can be used to
  map positions in the post-step document to the pre-step document.
  */
  invert() {
    return new U(this.ranges, !this.inverted);
  }
  /**
  @internal
  */
  toString() {
    return (this.inverted ? "-" : "") + JSON.stringify(this.ranges);
  }
  /**
  Create a map that moves all positions by offset `n` (which may be
  negative). This can be useful when applying steps meant for a
  sub-document to a larger document, or vice-versa.
  */
  static offset(e) {
    return e == 0 ? U.empty : new U(e < 0 ? [0, -e, 0] : [0, 0, e]);
  }
}
U.empty = new U([]);
const ut = /* @__PURE__ */ Object.create(null);
class P {
  /**
  Get the step map that represents the changes made by this step,
  and which can be used to transform between positions in the old
  and the new document.
  */
  getMap() {
    return U.empty;
  }
  /**
  Try to merge this step with another one, to be applied directly
  after it. Returns the merged step when possible, null if the
  steps can't be merged.
  */
  merge(e) {
    return null;
  }
  /**
  Deserialize a step from its JSON representation. Will call
  through to the step class' own implementation of this method.
  */
  static fromJSON(e, t) {
    if (!t || !t.stepType)
      throw new RangeError("Invalid input for Step.fromJSON");
    let n = ut[t.stepType];
    if (!n)
      throw new RangeError(`No step type ${t.stepType} defined`);
    return n.fromJSON(e, t);
  }
  /**
  To be able to serialize steps to JSON, each step needs a string
  ID to attach to its JSON representation. Use this method to
  register an ID for your step classes. Try to pick something
  that's unlikely to clash with steps from other modules.
  */
  static jsonID(e, t) {
    if (e in ut)
      throw new RangeError("Duplicate use of step JSON ID " + e);
    return ut[e] = t, t.prototype.jsonID = e, t;
  }
}
class T {
  /**
  @internal
  */
  constructor(e, t) {
    this.doc = e, this.failed = t;
  }
  /**
  Create a successful step result.
  */
  static ok(e) {
    return new T(e, null);
  }
  /**
  Create a failed step result.
  */
  static fail(e) {
    return new T(null, e);
  }
  /**
  Call [`Node.replace`](https://prosemirror.net/docs/ref/#model.Node.replace) with the given
  arguments. Create a successful result if it succeeds, and a
  failed one if it throws a `ReplaceError`.
  */
  static fromReplace(e, t, n, i) {
    try {
      return T.ok(e.replace(t, n, i));
    } catch (a) {
      if (a instanceof Xe)
        return T.fail(a.message);
      throw a;
    }
  }
}
function It(r, e, t) {
  let n = [];
  for (let i = 0; i < r.childCount; i++) {
    let a = r.child(i);
    a.content.size && (a = a.copy(It(a.content, e, a))), a.isInline && (a = e(a, t, i)), n.push(a);
  }
  return x.fromArray(n);
}
class ie extends P {
  /**
  Create a mark step.
  */
  constructor(e, t, n) {
    super(), this.from = e, this.to = t, this.mark = n;
  }
  apply(e) {
    let t = e.slice(this.from, this.to), n = e.resolve(this.from), i = n.node(n.sharedDepth(this.to)), a = new v(It(t.content, (o, s) => !o.isAtom || !s.type.allowsMarkType(this.mark.type) ? o : o.mark(this.mark.addToSet(o.marks)), i), t.openStart, t.openEnd);
    return T.fromReplace(e, this.from, this.to, a);
  }
  invert() {
    return new ae(this.from, this.to, this.mark);
  }
  map(e) {
    let t = e.mapResult(this.from, 1), n = e.mapResult(this.to, -1);
    return t.deleted && n.deleted || t.pos >= n.pos ? null : new ie(t.pos, n.pos, this.mark);
  }
  merge(e) {
    return e instanceof ie && e.mark.eq(this.mark) && this.from <= e.to && this.to >= e.from ? new ie(Math.min(this.from, e.from), Math.max(this.to, e.to), this.mark) : null;
  }
  toJSON() {
    return {
      stepType: "addMark",
      mark: this.mark.toJSON(),
      from: this.from,
      to: this.to
    };
  }
  /**
  @internal
  */
  static fromJSON(e, t) {
    if (typeof t.from != "number" || typeof t.to != "number")
      throw new RangeError("Invalid input for AddMarkStep.fromJSON");
    return new ie(t.from, t.to, e.markFromJSON(t.mark));
  }
}
P.jsonID("addMark", ie);
class ae extends P {
  /**
  Create a mark-removing step.
  */
  constructor(e, t, n) {
    super(), this.from = e, this.to = t, this.mark = n;
  }
  apply(e) {
    let t = e.slice(this.from, this.to), n = new v(It(t.content, (i) => i.mark(this.mark.removeFromSet(i.marks)), e), t.openStart, t.openEnd);
    return T.fromReplace(e, this.from, this.to, n);
  }
  invert() {
    return new ie(this.from, this.to, this.mark);
  }
  map(e) {
    let t = e.mapResult(this.from, 1), n = e.mapResult(this.to, -1);
    return t.deleted && n.deleted || t.pos >= n.pos ? null : new ae(t.pos, n.pos, this.mark);
  }
  merge(e) {
    return e instanceof ae && e.mark.eq(this.mark) && this.from <= e.to && this.to >= e.from ? new ae(Math.min(this.from, e.from), Math.max(this.to, e.to), this.mark) : null;
  }
  toJSON() {
    return {
      stepType: "removeMark",
      mark: this.mark.toJSON(),
      from: this.from,
      to: this.to
    };
  }
  /**
  @internal
  */
  static fromJSON(e, t) {
    if (typeof t.from != "number" || typeof t.to != "number")
      throw new RangeError("Invalid input for RemoveMarkStep.fromJSON");
    return new ae(t.from, t.to, e.markFromJSON(t.mark));
  }
}
P.jsonID("removeMark", ae);
class oe extends P {
  /**
  Create a node mark step.
  */
  constructor(e, t) {
    super(), this.pos = e, this.mark = t;
  }
  apply(e) {
    let t = e.nodeAt(this.pos);
    if (!t)
      return T.fail("No node at mark step's position");
    let n = t.type.create(t.attrs, null, this.mark.addToSet(t.marks));
    return T.fromReplace(e, this.pos, this.pos + 1, new v(x.from(n), 0, t.isLeaf ? 0 : 1));
  }
  invert(e) {
    let t = e.nodeAt(this.pos);
    if (t) {
      let n = this.mark.addToSet(t.marks);
      if (n.length == t.marks.length) {
        for (let i = 0; i < t.marks.length; i++)
          if (!t.marks[i].isInSet(n))
            return new oe(this.pos, t.marks[i]);
        return new oe(this.pos, this.mark);
      }
    }
    return new Be(this.pos, this.mark);
  }
  map(e) {
    let t = e.mapResult(this.pos, 1);
    return t.deletedAfter ? null : new oe(t.pos, this.mark);
  }
  toJSON() {
    return { stepType: "addNodeMark", pos: this.pos, mark: this.mark.toJSON() };
  }
  /**
  @internal
  */
  static fromJSON(e, t) {
    if (typeof t.pos != "number")
      throw new RangeError("Invalid input for AddNodeMarkStep.fromJSON");
    return new oe(t.pos, e.markFromJSON(t.mark));
  }
}
P.jsonID("addNodeMark", oe);
class Be extends P {
  /**
  Create a mark-removing step.
  */
  constructor(e, t) {
    super(), this.pos = e, this.mark = t;
  }
  apply(e) {
    let t = e.nodeAt(this.pos);
    if (!t)
      return T.fail("No node at mark step's position");
    let n = t.type.create(t.attrs, null, this.mark.removeFromSet(t.marks));
    return T.fromReplace(e, this.pos, this.pos + 1, new v(x.from(n), 0, t.isLeaf ? 0 : 1));
  }
  invert(e) {
    let t = e.nodeAt(this.pos);
    return !t || !this.mark.isInSet(t.marks) ? this : new oe(this.pos, this.mark);
  }
  map(e) {
    let t = e.mapResult(this.pos, 1);
    return t.deletedAfter ? null : new Be(t.pos, this.mark);
  }
  toJSON() {
    return { stepType: "removeNodeMark", pos: this.pos, mark: this.mark.toJSON() };
  }
  /**
  @internal
  */
  static fromJSON(e, t) {
    if (typeof t.pos != "number")
      throw new RangeError("Invalid input for RemoveNodeMarkStep.fromJSON");
    return new Be(t.pos, e.markFromJSON(t.mark));
  }
}
P.jsonID("removeNodeMark", Be);
class B extends P {
  /**
  The given `slice` should fit the 'gap' between `from` and
  `to`—the depths must line up, and the surrounding nodes must be
  able to be joined with the open sides of the slice. When
  `structure` is true, the step will fail if the content between
  from and to is not just a sequence of closing and then opening
  tokens (this is to guard against rebased replace steps
  overwriting something they weren't supposed to).
  */
  constructor(e, t, n, i = !1) {
    super(), this.from = e, this.to = t, this.slice = n, this.structure = i;
  }
  apply(e) {
    return this.structure && Ct(e, this.from, this.to) ? T.fail("Structure replace would overwrite content") : T.fromReplace(e, this.from, this.to, this.slice);
  }
  getMap() {
    return new U([this.from, this.to - this.from, this.slice.size]);
  }
  invert(e) {
    return new B(this.from, this.from + this.slice.size, e.slice(this.from, this.to));
  }
  map(e) {
    let t = e.mapResult(this.to, -1), n = this.from == this.to && B.MAP_BIAS < 0 ? t : e.mapResult(this.from, 1);
    return n.deletedAcross && t.deletedAcross ? null : new B(n.pos, Math.max(n.pos, t.pos), this.slice, this.structure);
  }
  merge(e) {
    if (!(e instanceof B) || e.structure || this.structure)
      return null;
    if (this.from + this.slice.size == e.from && !this.slice.openEnd && !e.slice.openStart) {
      let t = this.slice.size + e.slice.size == 0 ? v.empty : new v(this.slice.content.append(e.slice.content), this.slice.openStart, e.slice.openEnd);
      return new B(this.from, this.to + (e.to - e.from), t, this.structure);
    } else if (e.to == this.from && !this.slice.openStart && !e.slice.openEnd) {
      let t = this.slice.size + e.slice.size == 0 ? v.empty : new v(e.slice.content.append(this.slice.content), e.slice.openStart, this.slice.openEnd);
      return new B(e.from, this.to, t, this.structure);
    } else
      return null;
  }
  toJSON() {
    let e = { stepType: "replace", from: this.from, to: this.to };
    return this.slice.size && (e.slice = this.slice.toJSON()), this.structure && (e.structure = !0), e;
  }
  /**
  @internal
  */
  static fromJSON(e, t) {
    if (typeof t.from != "number" || typeof t.to != "number")
      throw new RangeError("Invalid input for ReplaceStep.fromJSON");
    return new B(t.from, t.to, v.fromJSON(e, t.slice), !!t.structure);
  }
}
B.MAP_BIAS = 1;
P.jsonID("replace", B);
class j extends P {
  /**
  Create a replace-around step with the given range and gap.
  `insert` should be the point in the slice into which the content
  of the gap should be moved. `structure` has the same meaning as
  it has in the [`ReplaceStep`](https://prosemirror.net/docs/ref/#transform.ReplaceStep) class.
  */
  constructor(e, t, n, i, a, o, s = !1) {
    super(), this.from = e, this.to = t, this.gapFrom = n, this.gapTo = i, this.slice = a, this.insert = o, this.structure = s;
  }
  apply(e) {
    if (this.structure && (Ct(e, this.from, this.gapFrom) || Ct(e, this.gapTo, this.to)))
      return T.fail("Structure gap-replace would overwrite content");
    let t = e.slice(this.gapFrom, this.gapTo);
    if (t.openStart || t.openEnd)
      return T.fail("Gap is not a flat range");
    let n = this.slice.insertAt(this.insert, t.content);
    return n ? T.fromReplace(e, this.from, this.to, n) : T.fail("Content does not fit in gap");
  }
  getMap() {
    return new U([
      this.from,
      this.gapFrom - this.from,
      this.insert,
      this.gapTo,
      this.to - this.gapTo,
      this.slice.size - this.insert
    ]);
  }
  invert(e) {
    let t = this.gapTo - this.gapFrom;
    return new j(this.from, this.from + this.slice.size + t, this.from + this.insert, this.from + this.insert + t, e.slice(this.from, this.to).removeBetween(this.gapFrom - this.from, this.gapTo - this.from), this.gapFrom - this.from, this.structure);
  }
  map(e) {
    let t = e.mapResult(this.from, 1), n = e.mapResult(this.to, -1), i = this.from == this.gapFrom ? t.pos : e.map(this.gapFrom, -1), a = this.to == this.gapTo ? n.pos : e.map(this.gapTo, 1);
    return t.deletedAcross && n.deletedAcross || i < t.pos || a > n.pos ? null : new j(t.pos, n.pos, i, a, this.slice, this.insert, this.structure);
  }
  toJSON() {
    let e = {
      stepType: "replaceAround",
      from: this.from,
      to: this.to,
      gapFrom: this.gapFrom,
      gapTo: this.gapTo,
      insert: this.insert
    };
    return this.slice.size && (e.slice = this.slice.toJSON()), this.structure && (e.structure = !0), e;
  }
  /**
  @internal
  */
  static fromJSON(e, t) {
    if (typeof t.from != "number" || typeof t.to != "number" || typeof t.gapFrom != "number" || typeof t.gapTo != "number" || typeof t.insert != "number")
      throw new RangeError("Invalid input for ReplaceAroundStep.fromJSON");
    return new j(t.from, t.to, t.gapFrom, t.gapTo, v.fromJSON(e, t.slice), t.insert, !!t.structure);
  }
}
P.jsonID("replaceAround", j);
function Ct(r, e, t) {
  let n = r.resolve(e), i = t - e, a = n.depth;
  for (; i > 0 && a > 0 && n.indexAfter(a) == n.node(a).childCount; )
    a--, i--;
  if (i > 0) {
    let o = n.node(a).maybeChild(n.indexAfter(a));
    for (; i > 0; ) {
      if (!o || o.isLeaf)
        return !0;
      o = o.firstChild, i--;
    }
  }
  return !1;
}
function Ca(r, e, t) {
  return (e == 0 || r.canReplace(e, r.childCount)) && (t == r.childCount || r.canReplace(0, t));
}
function ve(r) {
  let t = r.parent.content.cutByIndex(r.startIndex, r.endIndex);
  for (let n = r.depth, i = 0, a = 0; ; --n) {
    let o = r.$from.node(n), s = r.$from.index(n) + i, l = r.$to.indexAfter(n) - a;
    if (n < r.depth && o.canReplace(s, l, t))
      return n;
    if (n == 0 || o.type.spec.isolating || !Ca(o, s, l))
      break;
    s && (i = 1), l < o.childCount && (a = 1);
  }
  return null;
}
function hr(r, e, t = null, n = r) {
  let i = Na(r, e), a = i && Ea(n, e);
  return a ? i.map(bn).concat({ type: e, attrs: t }).concat(a.map(bn)) : null;
}
function bn(r) {
  return { type: r, attrs: null };
}
function Na(r, e) {
  let { parent: t, startIndex: n, endIndex: i } = r, a = t.contentMatchAt(n).findWrapping(e);
  if (!a)
    return null;
  let o = a.length ? a[0] : e;
  return t.canReplaceWith(n, i, o) ? a : null;
}
function Ea(r, e) {
  let { parent: t, startIndex: n, endIndex: i } = r, a = t.child(n), o = e.contentMatch.findWrapping(a.type);
  if (!o)
    return null;
  let l = (o.length ? o[o.length - 1] : e).contentMatch;
  for (let c = n; l && c < i; c++)
    l = l.matchType(t.child(c).type);
  return !l || !l.validEnd ? null : o;
}
function Q(r, e, t = 1, n) {
  let i = r.resolve(e), a = i.depth - t, o = n && n[n.length - 1] || i.parent;
  if (a < 0 || i.parent.type.spec.isolating || !i.parent.canReplace(i.index(), i.parent.childCount) || !o.type.validContent(i.parent.content.cutByIndex(i.index(), i.parent.childCount)))
    return !1;
  for (let c = i.depth - 1, h = t - 2; c > a; c--, h--) {
    let u = i.node(c), p = i.index(c);
    if (u.type.spec.isolating)
      return !1;
    let f = u.content.cutByIndex(p, u.childCount), b = n && n[h + 1];
    b && (f = f.replaceChild(0, b.type.create(b.attrs)));
    let m = n && n[h] || u;
    if (!u.canReplace(p + 1, u.childCount) || !m.type.validContent(f))
      return !1;
  }
  let s = i.indexAfter(a), l = n && n[0];
  return i.node(a).canReplaceWith(s, s, l ? l.type : i.node(a + 1).type);
}
function he(r, e) {
  let t = r.resolve(e), n = t.index();
  return pr(t.nodeBefore, t.nodeAfter) && t.parent.canReplace(n, n + 1);
}
function Aa(r, e) {
  e.content.size || r.type.compatibleContent(e.type);
  let t = r.contentMatchAt(r.childCount), { linebreakReplacement: n } = r.type.schema;
  for (let i = 0; i < e.childCount; i++) {
    let a = e.child(i), o = a.type == n ? r.type.schema.nodes.text : a.type;
    if (t = t.matchType(o), !t || !r.type.allowsMarks(a.marks))
      return !1;
  }
  return t.validEnd;
}
function pr(r, e) {
  return !!(r && e && !r.isLeaf && Aa(r, e));
}
function lt(r, e, t = -1) {
  let n = r.resolve(e);
  for (let i = n.depth; ; i--) {
    let a, o, s = n.index(i);
    if (i == n.depth ? (a = n.nodeBefore, o = n.nodeAfter) : t > 0 ? (a = n.node(i + 1), s++, o = n.node(i).maybeChild(s)) : (a = n.node(i).maybeChild(s - 1), o = n.node(i + 1)), a && !a.isTextblock && pr(a, o) && n.node(i).canReplace(s, s + 1))
      return e;
    if (i == 0)
      break;
    e = t < 0 ? n.before(i) : n.after(i);
  }
}
function Rt(r, e, t = e, n = v.empty) {
  if (e == t && !n.size)
    return null;
  let i = r.resolve(e), a = r.resolve(t);
  return Ta(i, a, n) ? new B(e, t, n) : new Ma(i, a, n).fit();
}
function Ta(r, e, t) {
  return !t.openStart && !t.openEnd && r.start() == e.start() && r.parent.canReplace(r.index(), e.index(), t.content);
}
class Ma {
  constructor(e, t, n) {
    this.$from = e, this.$to = t, this.unplaced = n, this.frontier = [], this.placed = x.empty;
    for (let i = 0; i <= e.depth; i++) {
      let a = e.node(i);
      this.frontier.push({
        type: a.type,
        match: a.contentMatchAt(e.indexAfter(i))
      });
    }
    for (let i = e.depth; i > 0; i--)
      this.placed = x.from(e.node(i).copy(this.placed));
  }
  get depth() {
    return this.frontier.length - 1;
  }
  fit() {
    for (; this.unplaced.size; ) {
      let c = this.findFittable();
      c ? this.placeNodes(c) : this.openMore() || this.dropNode();
    }
    let e = this.mustMoveInline(), t = this.placed.size - this.depth - this.$from.depth, n = this.$from, i = this.close(e < 0 ? this.$to : n.doc.resolve(e));
    if (!i)
      return null;
    let a = this.placed, o = n.depth, s = i.depth;
    for (; o && s && a.childCount == 1; )
      a = a.firstChild.content, o--, s--;
    let l = new v(a, o, s);
    return e > -1 ? new j(n.pos, e, this.$to.pos, this.$to.end(), l, t) : l.size || n.pos != this.$to.pos ? new B(n.pos, i.pos, l) : null;
  }
  // Find a position on the start spine of `this.unplaced` that has
  // content that can be moved somewhere on the frontier. Returns two
  // depths, one for the slice and one for the frontier.
  findFittable() {
    let e = this.unplaced.openStart;
    for (let t = this.unplaced.content, n = 0, i = this.unplaced.openEnd; n < e; n++) {
      let a = t.firstChild;
      if (t.childCount > 1 && (i = 0), a.type.spec.isolating && i <= n) {
        e = n;
        break;
      }
      t = a.content;
    }
    for (let t = 1; t <= 2; t++)
      for (let n = t == 1 ? e : this.unplaced.openStart; n >= 0; n--) {
        let i, a = null;
        n ? (a = ht(this.unplaced.content, n - 1).firstChild, i = a.content) : i = this.unplaced.content;
        let o = i.firstChild;
        for (let s = this.depth; s >= 0; s--) {
          let { type: l, match: c } = this.frontier[s], h, u = null;
          if (t == 1 && (o ? c.matchType(o.type) || (u = c.fillBefore(x.from(o), !1)) : a && l.compatibleContent(a.type)))
            return { sliceDepth: n, frontierDepth: s, parent: a, inject: u };
          if (t == 2 && o && (h = c.findWrapping(o.type)))
            return { sliceDepth: n, frontierDepth: s, parent: a, wrap: h };
          if (a && c.matchType(a.type))
            break;
        }
      }
  }
  openMore() {
    let { content: e, openStart: t, openEnd: n } = this.unplaced, i = ht(e, t);
    return !i.childCount || i.firstChild.isLeaf ? !1 : (this.unplaced = new v(e, t + 1, Math.max(n, i.size + t >= e.size - n ? t + 1 : 0)), !0);
  }
  dropNode() {
    let { content: e, openStart: t, openEnd: n } = this.unplaced, i = ht(e, t);
    if (i.childCount <= 1 && t > 0) {
      let a = e.size - t <= t + i.size;
      this.unplaced = new v(Ce(e, t - 1, 1), t - 1, a ? t - 1 : n);
    } else
      this.unplaced = new v(Ce(e, t, 1), t, n);
  }
  // Move content from the unplaced slice at `sliceDepth` to the
  // frontier node at `frontierDepth`. Close that frontier node when
  // applicable.
  placeNodes({ sliceDepth: e, frontierDepth: t, parent: n, inject: i, wrap: a }) {
    for (; this.depth > t; )
      this.closeFrontierNode();
    if (a)
      for (let m = 0; m < a.length; m++)
        this.openFrontierNode(a[m]);
    let o = this.unplaced, s = n ? n.content : o.content, l = o.openStart - e, c = 0, h = [], { match: u, type: p } = this.frontier[t];
    if (i) {
      for (let m = 0; m < i.childCount; m++)
        h.push(i.child(m));
      u = u.matchFragment(i);
    }
    let f = s.size + e - (o.content.size - o.openEnd);
    for (; c < s.childCount; ) {
      let m = s.child(c), y = u.matchType(m.type);
      if (!y)
        break;
      c++, (c > 1 || l == 0 || m.content.size) && (u = y, h.push(fr(m.mark(p.allowedMarks(m.marks)), c == 1 ? l : 0, c == s.childCount ? f : -1)));
    }
    let b = c == s.childCount;
    b || (f = -1), this.placed = Ne(this.placed, t, x.from(h)), this.frontier[t].match = u, b && f < 0 && n && n.type == this.frontier[this.depth].type && this.frontier.length > 1 && this.closeFrontierNode();
    for (let m = 0, y = s; m < f; m++) {
      let w = y.lastChild;
      this.frontier.push({ type: w.type, match: w.contentMatchAt(w.childCount) }), y = w.content;
    }
    this.unplaced = b ? e == 0 ? v.empty : new v(Ce(o.content, e - 1, 1), e - 1, f < 0 ? o.openEnd : e - 1) : new v(Ce(o.content, e, c), o.openStart, o.openEnd);
  }
  mustMoveInline() {
    if (!this.$to.parent.isTextblock)
      return -1;
    let e = this.frontier[this.depth], t;
    if (!e.type.isTextblock || !pt(this.$to, this.$to.depth, e.type, e.match, !1) || this.$to.depth == this.depth && (t = this.findCloseLevel(this.$to)) && t.depth == this.depth)
      return -1;
    let { depth: n } = this.$to, i = this.$to.after(n);
    for (; n > 1 && i == this.$to.end(--n); )
      ++i;
    return i;
  }
  findCloseLevel(e) {
    e: for (let t = Math.min(this.depth, e.depth); t >= 0; t--) {
      let { match: n, type: i } = this.frontier[t], a = t < e.depth && e.end(t + 1) == e.pos + (e.depth - (t + 1)), o = pt(e, t, i, n, a);
      if (o) {
        for (let s = t - 1; s >= 0; s--) {
          let { match: l, type: c } = this.frontier[s], h = pt(e, s, c, l, !0);
          if (!h || h.childCount)
            continue e;
        }
        return { depth: t, fit: o, move: a ? e.doc.resolve(e.after(t + 1)) : e };
      }
    }
  }
  close(e) {
    let t = this.findCloseLevel(e);
    if (!t)
      return null;
    for (; this.depth > t.depth; )
      this.closeFrontierNode();
    t.fit.childCount && (this.placed = Ne(this.placed, t.depth, t.fit)), e = t.move;
    for (let n = t.depth + 1; n <= e.depth; n++) {
      let i = e.node(n), a = i.type.contentMatch.fillBefore(i.content, !0, e.index(n));
      this.openFrontierNode(i.type, i.attrs, a);
    }
    return e;
  }
  openFrontierNode(e, t = null, n) {
    let i = this.frontier[this.depth];
    i.match = i.match.matchType(e), this.placed = Ne(this.placed, this.depth, x.from(e.create(t, n))), this.frontier.push({ type: e, match: e.contentMatch });
  }
  closeFrontierNode() {
    let t = this.frontier.pop().match.fillBefore(x.empty, !0);
    t.childCount && (this.placed = Ne(this.placed, this.frontier.length, t));
  }
}
function Ce(r, e, t) {
  return e == 0 ? r.cutByIndex(t, r.childCount) : r.replaceChild(0, r.firstChild.copy(Ce(r.firstChild.content, e - 1, t)));
}
function Ne(r, e, t) {
  return e == 0 ? r.append(t) : r.replaceChild(r.childCount - 1, r.lastChild.copy(Ne(r.lastChild.content, e - 1, t)));
}
function ht(r, e) {
  for (let t = 0; t < e; t++)
    r = r.firstChild.content;
  return r;
}
function fr(r, e, t) {
  if (e <= 0)
    return r;
  let n = r.content;
  return e > 1 && (n = n.replaceChild(0, fr(n.firstChild, e - 1, n.childCount == 1 ? t - 1 : 0))), e > 0 && (n = r.type.contentMatch.fillBefore(n).append(n), t <= 0 && (n = n.append(r.type.contentMatch.matchFragment(n).fillBefore(x.empty, !0)))), r.copy(n);
}
function pt(r, e, t, n, i) {
  let a = r.node(e), o = i ? r.indexAfter(e) : r.index(e);
  if (o == a.childCount && !t.compatibleContent(a.type))
    return null;
  let s = n.fillBefore(a.content, !0, o);
  return s && !za(t, a.content, o) ? s : null;
}
function za(r, e, t) {
  for (let n = t; n < e.childCount; n++)
    if (!r.allowsMarks(e.child(n).marks))
      return !0;
  return !1;
}
class Te extends P {
  /**
  Construct an attribute step.
  */
  constructor(e, t, n) {
    super(), this.pos = e, this.attr = t, this.value = n;
  }
  apply(e) {
    let t = e.nodeAt(this.pos);
    if (!t)
      return T.fail("No node at attribute step's position");
    let n = /* @__PURE__ */ Object.create(null);
    for (let a in t.attrs)
      n[a] = t.attrs[a];
    n[this.attr] = this.value;
    let i = t.type.create(n, null, t.marks);
    return T.fromReplace(e, this.pos, this.pos + 1, new v(x.from(i), 0, t.isLeaf ? 0 : 1));
  }
  getMap() {
    return U.empty;
  }
  invert(e) {
    return new Te(this.pos, this.attr, e.nodeAt(this.pos).attrs[this.attr]);
  }
  map(e) {
    let t = e.mapResult(this.pos, 1);
    return t.deletedAfter ? null : new Te(t.pos, this.attr, this.value);
  }
  toJSON() {
    return { stepType: "attr", pos: this.pos, attr: this.attr, value: this.value };
  }
  static fromJSON(e, t) {
    if (typeof t.pos != "number" || typeof t.attr != "string")
      throw new RangeError("Invalid input for AttrStep.fromJSON");
    return new Te(t.pos, t.attr, t.value);
  }
}
P.jsonID("attr", Te);
class rt extends P {
  /**
  Construct an attribute step.
  */
  constructor(e, t) {
    super(), this.attr = e, this.value = t;
  }
  apply(e) {
    let t = /* @__PURE__ */ Object.create(null);
    for (let i in e.attrs)
      t[i] = e.attrs[i];
    t[this.attr] = this.value;
    let n = e.type.create(t, e.content, e.marks);
    return T.ok(n);
  }
  getMap() {
    return U.empty;
  }
  invert(e) {
    return new rt(this.attr, e.attrs[this.attr]);
  }
  map(e) {
    return this;
  }
  toJSON() {
    return { stepType: "docAttr", attr: this.attr, value: this.value };
  }
  static fromJSON(e, t) {
    if (typeof t.attr != "string")
      throw new RangeError("Invalid input for DocAttrStep.fromJSON");
    return new rt(t.attr, t.value);
  }
}
P.jsonID("docAttr", rt);
let Fe = class extends Error {
};
Fe = function r(e) {
  let t = Error.call(this, e);
  return t.__proto__ = r.prototype, t;
};
Fe.prototype = Object.create(Error.prototype);
Fe.prototype.constructor = Fe;
Fe.prototype.name = "TransformError";
const ft = /* @__PURE__ */ Object.create(null);
class C {
  /**
  Initialize a selection with the head and anchor and ranges. If no
  ranges are given, constructs a single range across `$anchor` and
  `$head`.
  */
  constructor(e, t, n) {
    this.$anchor = e, this.$head = t, this.ranges = n || [new Ia(e.min(t), e.max(t))];
  }
  /**
  The selection's anchor, as an unresolved position.
  */
  get anchor() {
    return this.$anchor.pos;
  }
  /**
  The selection's head.
  */
  get head() {
    return this.$head.pos;
  }
  /**
  The lower bound of the selection's main range.
  */
  get from() {
    return this.$from.pos;
  }
  /**
  The upper bound of the selection's main range.
  */
  get to() {
    return this.$to.pos;
  }
  /**
  The resolved lower  bound of the selection's main range.
  */
  get $from() {
    return this.ranges[0].$from;
  }
  /**
  The resolved upper bound of the selection's main range.
  */
  get $to() {
    return this.ranges[0].$to;
  }
  /**
  Indicates whether the selection contains any content.
  */
  get empty() {
    let e = this.ranges;
    for (let t = 0; t < e.length; t++)
      if (e[t].$from.pos != e[t].$to.pos)
        return !1;
    return !0;
  }
  /**
  Get the content of this selection as a slice.
  */
  content() {
    return this.$from.doc.slice(this.from, this.to, !0);
  }
  /**
  Replace the selection with a slice or, if no slice is given,
  delete the selection. Will append to the given transaction.
  */
  replace(e, t = v.empty) {
    let n = t.content.lastChild, i = null;
    for (let s = 0; s < t.openEnd; s++)
      i = n, n = n.lastChild;
    let a = e.steps.length, o = this.ranges;
    for (let s = 0; s < o.length; s++) {
      let { $from: l, $to: c } = o[s], h = e.mapping.slice(a);
      e.replaceRange(h.map(l.pos), h.map(c.pos), s ? v.empty : t), s == 0 && xn(e, a, (n ? n.isInline : i && i.isTextblock) ? -1 : 1);
    }
  }
  /**
  Replace the selection with the given node, appending the changes
  to the given transaction.
  */
  replaceWith(e, t) {
    let n = e.steps.length, i = this.ranges;
    for (let a = 0; a < i.length; a++) {
      let { $from: o, $to: s } = i[a], l = e.mapping.slice(n), c = l.map(o.pos), h = l.map(s.pos);
      a ? e.deleteRange(c, h) : (e.replaceRangeWith(c, h, t), xn(e, n, t.isInline ? -1 : 1));
    }
  }
  /**
  Find a valid cursor or leaf node selection starting at the given
  position and searching back if `dir` is negative, and forward if
  positive. When `textOnly` is true, only consider cursor
  selections. Will return null when no valid selection position is
  found.
  */
  static findFrom(e, t, n = !1) {
    let i = e.parent.inlineContent ? new A(e) : me(e.node(0), e.parent, e.pos, e.index(), t, n);
    if (i)
      return i;
    for (let a = e.depth - 1; a >= 0; a--) {
      let o = t < 0 ? me(e.node(0), e.node(a), e.before(a + 1), e.index(a), t, n) : me(e.node(0), e.node(a), e.after(a + 1), e.index(a) + 1, t, n);
      if (o)
        return o;
    }
    return null;
  }
  /**
  Find a valid cursor or leaf node selection near the given
  position. Searches forward first by default, but if `bias` is
  negative, it will search backwards first.
  */
  static near(e, t = 1) {
    return this.findFrom(e, t) || this.findFrom(e, -t) || new V(e.node(0));
  }
  /**
  Find the cursor or leaf node selection closest to the start of
  the given document. Will return an
  [`AllSelection`](https://prosemirror.net/docs/ref/#state.AllSelection) if no valid position
  exists.
  */
  static atStart(e) {
    return me(e, e, 0, 0, 1) || new V(e);
  }
  /**
  Find the cursor or leaf node selection closest to the end of the
  given document.
  */
  static atEnd(e) {
    return me(e, e, e.content.size, e.childCount, -1) || new V(e);
  }
  /**
  Deserialize the JSON representation of a selection. Must be
  implemented for custom classes (as a static class method).
  */
  static fromJSON(e, t) {
    if (!t || !t.type)
      throw new RangeError("Invalid input for Selection.fromJSON");
    let n = ft[t.type];
    if (!n)
      throw new RangeError(`No selection type ${t.type} defined`);
    return n.fromJSON(e, t);
  }
  /**
  To be able to deserialize selections from JSON, custom selection
  classes must register themselves with an ID string, so that they
  can be disambiguated. Try to pick something that's unlikely to
  clash with classes from other modules.
  */
  static jsonID(e, t) {
    if (e in ft)
      throw new RangeError("Duplicate use of selection JSON ID " + e);
    return ft[e] = t, t.prototype.jsonID = e, t;
  }
  /**
  Get a [bookmark](https://prosemirror.net/docs/ref/#state.SelectionBookmark) for this selection,
  which is a value that can be mapped without having access to a
  current document, and later resolved to a real selection for a
  given document again. (This is used mostly by the history to
  track and restore old selections.) The default implementation of
  this method just converts the selection to a text selection and
  returns the bookmark for that.
  */
  getBookmark() {
    return A.between(this.$anchor, this.$head).getBookmark();
  }
}
C.prototype.visible = !0;
class Ia {
  /**
  Create a range.
  */
  constructor(e, t) {
    this.$from = e, this.$to = t;
  }
}
let yn = !1;
function wn(r) {
  !yn && !r.parent.inlineContent && (yn = !0, console.warn("TextSelection endpoint not pointing into a node with inline content (" + r.parent.type.name + ")"));
}
class A extends C {
  /**
  Construct a text selection between the given points.
  */
  constructor(e, t = e) {
    wn(e), wn(t), super(e, t);
  }
  /**
  Returns a resolved position if this is a cursor selection (an
  empty text selection), and null otherwise.
  */
  get $cursor() {
    return this.$anchor.pos == this.$head.pos ? this.$head : null;
  }
  map(e, t) {
    let n = e.resolve(t.map(this.head));
    if (!n.parent.inlineContent)
      return C.near(n);
    let i = e.resolve(t.map(this.anchor));
    return new A(i.parent.inlineContent ? i : n, n);
  }
  replace(e, t = v.empty) {
    if (super.replace(e, t), t == v.empty) {
      let n = this.$from.marksAcross(this.$to);
      n && e.ensureMarks(n);
    }
  }
  eq(e) {
    return e instanceof A && e.anchor == this.anchor && e.head == this.head;
  }
  getBookmark() {
    return new ct(this.anchor, this.head);
  }
  toJSON() {
    return { type: "text", anchor: this.anchor, head: this.head };
  }
  /**
  @internal
  */
  static fromJSON(e, t) {
    if (typeof t.anchor != "number" || typeof t.head != "number")
      throw new RangeError("Invalid input for TextSelection.fromJSON");
    return new A(e.resolve(t.anchor), e.resolve(t.head));
  }
  /**
  Create a text selection from non-resolved positions.
  */
  static create(e, t, n = t) {
    let i = e.resolve(t);
    return new this(i, n == t ? i : e.resolve(n));
  }
  /**
  Return a text selection that spans the given positions or, if
  they aren't text positions, find a text selection near them.
  `bias` determines whether the method searches forward (default)
  or backwards (negative number) first. Will fall back to calling
  [`Selection.near`](https://prosemirror.net/docs/ref/#state.Selection^near) when the document
  doesn't contain a valid text position.
  */
  static between(e, t, n) {
    let i = e.pos - t.pos;
    if ((!n || i) && (n = i >= 0 ? 1 : -1), !t.parent.inlineContent) {
      let a = C.findFrom(t, n, !0) || C.findFrom(t, -n, !0);
      if (a)
        t = a.$head;
      else
        return C.near(t, n);
    }
    return e.parent.inlineContent || (i == 0 ? e = t : (e = (C.findFrom(e, -n, !0) || C.findFrom(e, n, !0)).$anchor, e.pos < t.pos != i < 0 && (e = t))), new A(e, t);
  }
}
C.jsonID("text", A);
class ct {
  constructor(e, t) {
    this.anchor = e, this.head = t;
  }
  map(e) {
    return new ct(e.map(this.anchor), e.map(this.head));
  }
  resolve(e) {
    return A.between(e.resolve(this.anchor), e.resolve(this.head));
  }
}
class N extends C {
  /**
  Create a node selection. Does not verify the validity of its
  argument.
  */
  constructor(e) {
    let t = e.nodeAfter, n = e.node(0).resolve(e.pos + t.nodeSize);
    super(e, n), this.node = t;
  }
  map(e, t) {
    let { deleted: n, pos: i } = t.mapResult(this.anchor), a = e.resolve(i);
    return n ? C.near(a) : new N(a);
  }
  content() {
    return new v(x.from(this.node), 0, 0);
  }
  eq(e) {
    return e instanceof N && e.anchor == this.anchor;
  }
  toJSON() {
    return { type: "node", anchor: this.anchor };
  }
  getBookmark() {
    return new Lt(this.anchor);
  }
  /**
  @internal
  */
  static fromJSON(e, t) {
    if (typeof t.anchor != "number")
      throw new RangeError("Invalid input for NodeSelection.fromJSON");
    return new N(e.resolve(t.anchor));
  }
  /**
  Create a node selection from non-resolved positions.
  */
  static create(e, t) {
    return new N(e.resolve(t));
  }
  /**
  Determines whether the given node may be selected as a node
  selection.
  */
  static isSelectable(e) {
    return !e.isText && e.type.spec.selectable !== !1;
  }
}
N.prototype.visible = !1;
C.jsonID("node", N);
class Lt {
  constructor(e) {
    this.anchor = e;
  }
  map(e) {
    let { deleted: t, pos: n } = e.mapResult(this.anchor);
    return t ? new ct(n, n) : new Lt(n);
  }
  resolve(e) {
    let t = e.resolve(this.anchor), n = t.nodeAfter;
    return n && N.isSelectable(n) ? new N(t) : C.near(t);
  }
}
class V extends C {
  /**
  Create an all-selection over the given document.
  */
  constructor(e) {
    super(e.resolve(0), e.resolve(e.content.size));
  }
  replace(e, t = v.empty) {
    if (t == v.empty) {
      e.delete(0, e.doc.content.size);
      let n = C.atStart(e.doc);
      n.eq(e.selection) || e.setSelection(n);
    } else
      super.replace(e, t);
  }
  toJSON() {
    return { type: "all" };
  }
  /**
  @internal
  */
  static fromJSON(e) {
    return new V(e);
  }
  map(e) {
    return new V(e);
  }
  eq(e) {
    return e instanceof V;
  }
  getBookmark() {
    return Ra;
  }
}
C.jsonID("all", V);
const Ra = {
  map() {
    return this;
  },
  resolve(r) {
    return new V(r);
  }
};
function me(r, e, t, n, i, a = !1) {
  if (e.inlineContent)
    return A.create(r, t);
  for (let o = n - (i > 0 ? 0 : 1); i > 0 ? o < e.childCount : o >= 0; o += i) {
    let s = e.child(o);
    if (s.isAtom) {
      if (!a && N.isSelectable(s))
        return N.create(r, t - (i < 0 ? s.nodeSize : 0));
    } else {
      let l = me(r, s, t + i, i < 0 ? s.childCount : 0, i, a);
      if (l)
        return l;
    }
    t += s.nodeSize * i;
  }
  return null;
}
function xn(r, e, t) {
  let n = r.steps.length - 1;
  if (n < e)
    return;
  let i = r.steps[n];
  if (!(i instanceof B || i instanceof j))
    return;
  let a = r.mapping.maps[n], o;
  a.forEach((s, l, c, h) => {
    o == null && (o = h);
  }), r.setSelection(C.near(r.doc.resolve(o), t));
}
function vn(r, e) {
  return !e || !r ? r : r.bind(e);
}
class qe {
  constructor(e, t, n) {
    this.name = e, this.init = vn(t.init, n), this.apply = vn(t.apply, n);
  }
}
new qe("doc", {
  init(r) {
    return r.doc || r.schema.topNodeType.createAndFill();
  },
  apply(r) {
    return r.doc;
  }
}), new qe("selection", {
  init(r, e) {
    return r.selection || C.atStart(e.doc);
  },
  apply(r) {
    return r.selection;
  }
}), new qe("storedMarks", {
  init(r) {
    return r.storedMarks || null;
  },
  apply(r, e, t, n) {
    return n.selection.$cursor ? r.storedMarks : null;
  }
}), new qe("scrollToSelection", {
  init() {
    return 0;
  },
  apply(r, e) {
    return r.scrolledIntoView ? e + 1 : e;
  }
});
function mr(r, e, t) {
  for (let n in r) {
    let i = r[n];
    i instanceof Function ? i = i.bind(e) : n == "handleDOMEvents" && (i = mr(i, e, {})), t[n] = i;
  }
  return t;
}
class pe {
  /**
  Create a plugin.
  */
  constructor(e) {
    this.spec = e, this.props = {}, e.props && mr(e.props, this, this.props), this.key = e.key ? e.key.key : gr("plugin");
  }
  /**
  Extract the plugin's state field from an editor state.
  */
  getState(e) {
    return e[this.key];
  }
}
const mt = /* @__PURE__ */ Object.create(null);
function gr(r) {
  return r in mt ? r + "$" + ++mt[r] : (mt[r] = 0, r + "$");
}
class fe {
  /**
  Create a plugin key.
  */
  constructor(e = "key") {
    this.key = gr(e);
  }
  /**
  Get the active plugin with this key, if any, from an editor
  state.
  */
  get(e) {
    return e.config.pluginsByKey[this.key];
  }
  /**
  Get the plugin's state from an editor state.
  */
  getState(e) {
    return e[this.key];
  }
}
const Pt = (r, e) => r.selection.empty ? !1 : (e && e(r.tr.deleteSelection().scrollIntoView()), !0);
function br(r, e) {
  let { $cursor: t } = r.selection;
  return !t || (e ? !e.endOfTextblock("backward", r) : t.parentOffset > 0) ? null : t;
}
const yr = (r, e, t) => {
  let n = br(r, t);
  if (!n)
    return !1;
  let i = Ot(n);
  if (!i) {
    let o = n.blockRange(), s = o && ve(o);
    return s == null ? !1 : (e && e(r.tr.lift(o, s).scrollIntoView()), !0);
  }
  let a = i.nodeBefore;
  if (Ar(r, i, e, -1))
    return !0;
  if (n.parent.content.size == 0 && (xe(a, "end") || N.isSelectable(a)))
    for (let o = n.depth; ; o--) {
      let s = Rt(r.doc, n.before(o), n.after(o), v.empty);
      if (s && s.slice.size < s.to - s.from) {
        if (e) {
          let l = r.tr.step(s);
          l.setSelection(xe(a, "end") ? C.findFrom(l.doc.resolve(l.mapping.map(i.pos, -1)), -1) : N.create(l.doc, i.pos - a.nodeSize)), e(l.scrollIntoView());
        }
        return !0;
      }
      if (o == 1 || n.node(o - 1).childCount > 1)
        break;
    }
  return a.isAtom && i.depth == n.depth - 1 ? (e && e(r.tr.delete(i.pos - a.nodeSize, i.pos).scrollIntoView()), !0) : !1;
}, La = (r, e, t) => {
  let n = br(r, t);
  if (!n)
    return !1;
  let i = Ot(n);
  return i ? wr(r, i, e) : !1;
}, Pa = (r, e, t) => {
  let n = vr(r, t);
  if (!n)
    return !1;
  let i = Bt(n);
  return i ? wr(r, i, e) : !1;
};
function wr(r, e, t) {
  let n = e.nodeBefore, i = n, a = e.pos - 1;
  for (; !i.isTextblock; a--) {
    if (i.type.spec.isolating)
      return !1;
    let h = i.lastChild;
    if (!h)
      return !1;
    i = h;
  }
  let o = e.nodeAfter, s = o, l = e.pos + 1;
  for (; !s.isTextblock; l++) {
    if (s.type.spec.isolating)
      return !1;
    let h = s.firstChild;
    if (!h)
      return !1;
    s = h;
  }
  let c = Rt(r.doc, a, l, v.empty);
  if (!c || c.from != a || c instanceof B && c.slice.size >= l - a)
    return !1;
  if (t) {
    let h = r.tr.step(c);
    h.setSelection(A.create(h.doc, a)), t(h.scrollIntoView());
  }
  return !0;
}
function xe(r, e, t = !1) {
  for (let n = r; n; n = e == "start" ? n.firstChild : n.lastChild) {
    if (n.isTextblock)
      return !0;
    if (t && n.childCount != 1)
      return !1;
  }
  return !1;
}
const xr = (r, e, t) => {
  let { $head: n, empty: i } = r.selection, a = n;
  if (!i)
    return !1;
  if (n.parent.isTextblock) {
    if (t ? !t.endOfTextblock("backward", r) : n.parentOffset > 0)
      return !1;
    a = Ot(n);
  }
  let o = a && a.nodeBefore;
  return !o || !N.isSelectable(o) ? !1 : (e && e(r.tr.setSelection(N.create(r.doc, a.pos - o.nodeSize)).scrollIntoView()), !0);
};
function Ot(r) {
  if (!r.parent.type.spec.isolating)
    for (let e = r.depth - 1; e >= 0; e--) {
      if (r.index(e) > 0)
        return r.doc.resolve(r.before(e + 1));
      if (r.node(e).type.spec.isolating)
        break;
    }
  return null;
}
function vr(r, e) {
  let { $cursor: t } = r.selection;
  return !t || (e ? !e.endOfTextblock("forward", r) : t.parentOffset < t.parent.content.size) ? null : t;
}
const kr = (r, e, t) => {
  let n = vr(r, t);
  if (!n)
    return !1;
  let i = Bt(n);
  if (!i)
    return !1;
  let a = i.nodeAfter;
  if (Ar(r, i, e, 1))
    return !0;
  if (n.parent.content.size == 0 && (xe(a, "start") || N.isSelectable(a))) {
    let o = Rt(r.doc, n.before(), n.after(), v.empty);
    if (o && o.slice.size < o.to - o.from) {
      if (e) {
        let s = r.tr.step(o);
        s.setSelection(xe(a, "start") ? C.findFrom(s.doc.resolve(s.mapping.map(i.pos)), 1) : N.create(s.doc, s.mapping.map(i.pos))), e(s.scrollIntoView());
      }
      return !0;
    }
  }
  return a.isAtom && i.depth == n.depth - 1 ? (e && e(r.tr.delete(i.pos, i.pos + a.nodeSize).scrollIntoView()), !0) : !1;
}, Sr = (r, e, t) => {
  let { $head: n, empty: i } = r.selection, a = n;
  if (!i)
    return !1;
  if (n.parent.isTextblock) {
    if (t ? !t.endOfTextblock("forward", r) : n.parentOffset < n.parent.content.size)
      return !1;
    a = Bt(n);
  }
  let o = a && a.nodeAfter;
  return !o || !N.isSelectable(o) ? !1 : (e && e(r.tr.setSelection(N.create(r.doc, a.pos)).scrollIntoView()), !0);
};
function Bt(r) {
  if (!r.parent.type.spec.isolating)
    for (let e = r.depth - 1; e >= 0; e--) {
      let t = r.node(e);
      if (r.index(e) + 1 < t.childCount)
        return r.doc.resolve(r.after(e + 1));
      if (t.type.spec.isolating)
        break;
    }
  return null;
}
const Oa = (r, e) => {
  let t = r.selection, n = t instanceof N, i;
  if (n) {
    if (t.node.isTextblock || !he(r.doc, t.from))
      return !1;
    i = t.from;
  } else if (i = lt(r.doc, t.from, -1), i == null)
    return !1;
  if (e) {
    let a = r.tr.join(i);
    n && a.setSelection(N.create(a.doc, i - r.doc.resolve(i).nodeBefore.nodeSize)), e(a.scrollIntoView());
  }
  return !0;
}, Ba = (r, e) => {
  let t = r.selection, n;
  if (t instanceof N) {
    if (t.node.isTextblock || !he(r.doc, t.to))
      return !1;
    n = t.to;
  } else if (n = lt(r.doc, t.to, 1), n == null)
    return !1;
  return e && e(r.tr.join(n).scrollIntoView()), !0;
}, Fa = (r, e) => {
  let { $from: t, $to: n } = r.selection, i = t.blockRange(n), a = i && ve(i);
  return a == null ? !1 : (e && e(r.tr.lift(i, a).scrollIntoView()), !0);
}, Cr = (r, e) => {
  let { $head: t, $anchor: n } = r.selection;
  return !t.parent.type.spec.code || !t.sameParent(n) ? !1 : (e && e(r.tr.insertText(`
`).scrollIntoView()), !0);
};
function Ft(r) {
  for (let e = 0; e < r.edgeCount; e++) {
    let { type: t } = r.edge(e);
    if (t.isTextblock && !t.hasRequiredAttrs())
      return t;
  }
  return null;
}
const Ha = (r, e) => {
  let { $head: t, $anchor: n } = r.selection;
  if (!t.parent.type.spec.code || !t.sameParent(n))
    return !1;
  let i = t.node(-1), a = t.indexAfter(-1), o = Ft(i.contentMatchAt(a));
  if (!o || !i.canReplaceWith(a, a, o))
    return !1;
  if (e) {
    let s = t.after(), l = r.tr.replaceWith(s, s, o.createAndFill());
    l.setSelection(C.near(l.doc.resolve(s), 1)), e(l.scrollIntoView());
  }
  return !0;
}, Nr = (r, e) => {
  let t = r.selection, { $from: n, $to: i } = t;
  if (t instanceof V || n.parent.inlineContent || i.parent.inlineContent)
    return !1;
  let a = Ft(i.parent.contentMatchAt(i.indexAfter()));
  if (!a || !a.isTextblock)
    return !1;
  if (e) {
    let o = (!n.parentOffset && i.index() < i.parent.childCount ? n : i).pos, s = r.tr.insert(o, a.createAndFill());
    s.setSelection(A.create(s.doc, o + 1)), e(s.scrollIntoView());
  }
  return !0;
}, Er = (r, e) => {
  let { $cursor: t } = r.selection;
  if (!t || t.parent.content.size)
    return !1;
  if (t.depth > 1 && t.after() != t.end(-1)) {
    let a = t.before();
    if (Q(r.doc, a))
      return e && e(r.tr.split(a).scrollIntoView()), !0;
  }
  let n = t.blockRange(), i = n && ve(n);
  return i == null ? !1 : (e && e(r.tr.lift(n, i).scrollIntoView()), !0);
};
function ja(r) {
  return (e, t) => {
    let { $from: n, $to: i } = e.selection;
    if (e.selection instanceof N && e.selection.node.isBlock)
      return !n.parentOffset || !Q(e.doc, n.pos) ? !1 : (t && t(e.tr.split(n.pos).scrollIntoView()), !0);
    if (!n.depth)
      return !1;
    let a = [], o, s, l = !1, c = !1;
    for (let f = n.depth; ; f--)
      if (n.node(f).isBlock) {
        l = n.end(f) == n.pos + (n.depth - f), c = n.start(f) == n.pos - (n.depth - f), s = Ft(n.node(f - 1).contentMatchAt(n.indexAfter(f - 1))), a.unshift(l && s ? { type: s } : null), o = f;
        break;
      } else {
        if (f == 1)
          return !1;
        a.unshift(null);
      }
    let h = e.tr;
    (e.selection instanceof A || e.selection instanceof V) && h.deleteSelection();
    let u = h.mapping.map(n.pos), p = Q(h.doc, u, a.length, a);
    if (p || (a[0] = s ? { type: s } : null, p = Q(h.doc, u, a.length, a)), !p)
      return !1;
    if (h.split(u, a.length, a), !l && c && n.node(o).type != s) {
      let f = h.mapping.map(n.before(o)), b = h.doc.resolve(f);
      s && n.node(o - 1).canReplaceWith(b.index(), b.index() + 1, s) && h.setNodeMarkup(h.mapping.map(n.before(o)), s);
    }
    return t && t(h.scrollIntoView()), !0;
  };
}
const $a = ja(), Da = (r, e) => {
  let { $from: t, to: n } = r.selection, i, a = t.sharedDepth(n);
  return a == 0 ? !1 : (i = t.before(a), e && e(r.tr.setSelection(N.create(r.doc, i))), !0);
};
function Ua(r, e, t) {
  let n = e.nodeBefore, i = e.nodeAfter, a = e.index();
  return !n || !i || !n.type.compatibleContent(i.type) ? !1 : !n.content.size && e.parent.canReplace(a - 1, a) ? (t && t(r.tr.delete(e.pos - n.nodeSize, e.pos).scrollIntoView()), !0) : !e.parent.canReplace(a, a + 1) || !(i.isTextblock || he(r.doc, e.pos)) ? !1 : (t && t(r.tr.join(e.pos).scrollIntoView()), !0);
}
function Ar(r, e, t, n) {
  let i = e.nodeBefore, a = e.nodeAfter, o, s, l = i.type.spec.isolating || a.type.spec.isolating;
  if (!l && Ua(r, e, t))
    return !0;
  let c = !l && e.parent.canReplace(e.index(), e.index() + 1);
  if (c && (o = (s = i.contentMatchAt(i.childCount)).findWrapping(a.type)) && s.matchType(o[0] || a.type).validEnd) {
    if (t) {
      let f = e.pos + a.nodeSize, b = x.empty;
      for (let w = o.length - 1; w >= 0; w--)
        b = x.from(o[w].create(null, b));
      b = x.from(i.copy(b));
      let m = r.tr.step(new j(e.pos - 1, f, e.pos, f, new v(b, 1, 0), o.length, !0)), y = m.doc.resolve(f + 2 * o.length);
      y.nodeAfter && y.nodeAfter.type == i.type && he(m.doc, y.pos) && m.join(y.pos), t(m.scrollIntoView());
    }
    return !0;
  }
  let h = a.type.spec.isolating || n > 0 && l ? null : C.findFrom(e, 1), u = h && h.$from.blockRange(h.$to), p = u && ve(u);
  if (p != null && p >= e.depth)
    return t && t(r.tr.lift(u, p).scrollIntoView()), !0;
  if (c && xe(a, "start", !0) && xe(i, "end")) {
    let f = i, b = [];
    for (; b.push(f), !f.isTextblock; )
      f = f.lastChild;
    let m = a, y = 1;
    for (; !m.isTextblock; m = m.firstChild)
      y++;
    if (f.canReplace(f.childCount, f.childCount, m.content)) {
      if (t) {
        let w = x.empty;
        for (let S = b.length - 1; S >= 0; S--)
          w = x.from(b[S].copy(w));
        let k = r.tr.step(new j(e.pos - b.length, e.pos + a.nodeSize, e.pos + y, e.pos + a.nodeSize - y, new v(w, b.length, 0), 0, !0));
        t(k.scrollIntoView());
      }
      return !0;
    }
  }
  return !1;
}
function Tr(r) {
  return function(e, t) {
    let n = e.selection, i = r < 0 ? n.$from : n.$to, a = i.depth;
    for (; i.node(a).isInline; ) {
      if (!a)
        return !1;
      a--;
    }
    return i.node(a).isTextblock ? (t && t(e.tr.setSelection(A.create(e.doc, r < 0 ? i.start(a) : i.end(a)))), !0) : !1;
  };
}
const Va = Tr(-1), qa = Tr(1);
function _a(r, e = null) {
  return function(t, n) {
    let { $from: i, $to: a } = t.selection, o = i.blockRange(a), s = o && hr(o, r, e);
    return s ? (n && n(t.tr.wrap(o, s).scrollIntoView()), !0) : !1;
  };
}
function kn(r, e = null) {
  return function(t, n) {
    let i = !1;
    for (let a = 0; a < t.selection.ranges.length && !i; a++) {
      let { $from: { pos: o }, $to: { pos: s } } = t.selection.ranges[a];
      t.doc.nodesBetween(o, s, (l, c) => {
        if (i)
          return !1;
        if (!(!l.isTextblock || l.hasMarkup(r, e)))
          if (l.type == r)
            i = !0;
          else {
            let h = t.doc.resolve(c), u = h.index();
            i = h.parent.canReplaceWith(u, u + 1, r);
          }
      });
    }
    if (!i)
      return !1;
    if (n) {
      let a = t.tr;
      for (let o = 0; o < t.selection.ranges.length; o++) {
        let { $from: { pos: s }, $to: { pos: l } } = t.selection.ranges[o];
        a.setBlockType(s, l, r, e);
      }
      n(a.scrollIntoView());
    }
    return !0;
  };
}
function Ht(...r) {
  return function(e, t, n) {
    for (let i = 0; i < r.length; i++)
      if (r[i](e, t, n))
        return !0;
    return !1;
  };
}
Ht(Pt, yr, xr);
Ht(Pt, kr, Sr);
Ht(Cr, Nr, Er, $a);
typeof navigator < "u" ? /Mac|iP(hone|[oa]d)/.test(navigator.platform) : typeof os < "u" && os.platform && os.platform() == "darwin";
function Wa(r, e = null) {
  return function(t, n) {
    let { $from: i, $to: a } = t.selection, o = i.blockRange(a);
    if (!o)
      return !1;
    let s = n ? t.tr : null;
    return Ja(s, o, r, e) ? (n && n(s.scrollIntoView()), !0) : !1;
  };
}
function Ja(r, e, t, n = null) {
  let i = !1, a = e, o = e.$from.doc;
  if (e.depth >= 2 && e.$from.node(e.depth - 1).type.compatibleContent(t) && e.startIndex == 0) {
    if (e.$from.index(e.depth - 1) == 0)
      return !1;
    let l = o.resolve(e.start - 2);
    a = new et(l, l, e.depth), e.endIndex < e.parent.childCount && (e = new et(e.$from, o.resolve(e.$to.end(e.depth)), e.depth)), i = !0;
  }
  let s = hr(a, t, n, e);
  return s ? (r && Ga(r, e, s, i, t), !0) : !1;
}
function Ga(r, e, t, n, i) {
  let a = x.empty;
  for (let h = t.length - 1; h >= 0; h--)
    a = x.from(t[h].type.create(t[h].attrs, a));
  r.step(new j(e.start - (n ? 2 : 0), e.end, e.start, e.end, new v(a, 0, 0), t.length, !0));
  let o = 0;
  for (let h = 0; h < t.length; h++)
    t[h].type == i && (o = h + 1);
  let s = t.length - o, l = e.start + t.length - (n ? 2 : 0), c = e.parent;
  for (let h = e.startIndex, u = e.endIndex, p = !0; h < u; h++, p = !1)
    !p && Q(r.doc, l, s) && (r.split(l, s), l += 2 * s), l += c.child(h).nodeSize;
  return r;
}
function Ka(r) {
  return function(e, t) {
    let { $from: n, $to: i } = e.selection, a = n.blockRange(i, (o) => o.childCount > 0 && o.firstChild.type == r);
    return a ? t ? n.node(a.depth - 1).type == r ? Za(e, t, r, a) : Ya(e, t, a) : !0 : !1;
  };
}
function Za(r, e, t, n) {
  let i = r.tr, a = n.end, o = n.$to.end(n.depth);
  a < o && (i.step(new j(a - 1, o, a, o, new v(x.from(t.create(null, n.parent.copy())), 1, 0), 1, !0)), n = new et(i.doc.resolve(n.$from.pos), i.doc.resolve(o), n.depth));
  const s = ve(n);
  if (s == null)
    return !1;
  i.lift(n, s);
  let l = i.doc.resolve(i.mapping.map(a, -1) - 1);
  return he(i.doc, l.pos) && l.nodeBefore.type == l.nodeAfter.type && i.join(l.pos), e(i.scrollIntoView()), !0;
}
function Ya(r, e, t) {
  let n = r.tr, i = t.parent;
  for (let f = t.end, b = t.endIndex - 1, m = t.startIndex; b > m; b--)
    f -= i.child(b).nodeSize, n.delete(f - 1, f + 1);
  let a = n.doc.resolve(t.start), o = a.nodeAfter;
  if (n.mapping.map(t.end) != t.start + a.nodeAfter.nodeSize)
    return !1;
  let s = t.startIndex == 0, l = t.endIndex == i.childCount, c = a.node(-1), h = a.index(-1);
  if (!c.canReplace(h + (s ? 0 : 1), h + 1, o.content.append(l ? x.empty : x.from(i))))
    return !1;
  let u = a.pos, p = u + o.nodeSize;
  return n.step(new j(u - (s ? 1 : 0), p + (l ? 1 : 0), u + 1, p - 1, new v((s ? x.empty : x.from(i.copy(x.empty))).append(l ? x.empty : x.from(i.copy(x.empty))), s ? 0 : 1, l ? 0 : 1), s ? 0 : 1)), e(n.scrollIntoView()), !0;
}
function Xa(r) {
  return function(e, t) {
    let { $from: n, $to: i } = e.selection, a = n.blockRange(i, (c) => c.childCount > 0 && c.firstChild.type == r);
    if (!a)
      return !1;
    let o = a.startIndex;
    if (o == 0)
      return !1;
    let s = a.parent, l = s.child(o - 1);
    if (l.type != r)
      return !1;
    if (t) {
      let c = l.lastChild && l.lastChild.type == s.type, h = x.from(c ? r.create() : null), u = new v(x.from(r.create(null, x.from(s.type.create(null, h)))), c ? 3 : 1, 0), p = a.start, f = a.end;
      t(e.tr.step(new j(p - (c ? 3 : 1), f, p, f, u, 1, !0)).scrollIntoView());
    }
    return !0;
  };
}
function Mr(r) {
  const { state: e, transaction: t } = r;
  let { selection: n } = t, { doc: i } = t, { storedMarks: a } = t;
  return {
    ...e,
    apply: e.apply.bind(e),
    applyTransaction: e.applyTransaction.bind(e),
    plugins: e.plugins,
    schema: e.schema,
    reconfigure: e.reconfigure.bind(e),
    toJSON: e.toJSON.bind(e),
    get storedMarks() {
      return a;
    },
    get selection() {
      return n;
    },
    get doc() {
      return i;
    },
    get tr() {
      return n = t.selection, i = t.doc, a = t.storedMarks, t;
    }
  };
}
class Qa {
  constructor(e) {
    this.editor = e.editor, this.rawCommands = this.editor.extensionManager.commands, this.customState = e.state;
  }
  get hasCustomState() {
    return !!this.customState;
  }
  get state() {
    return this.customState || this.editor.state;
  }
  get commands() {
    const { rawCommands: e, editor: t, state: n } = this, { view: i } = t, { tr: a } = n, o = this.buildProps(a);
    return Object.fromEntries(Object.entries(e).map(([s, l]) => [s, (...h) => {
      const u = l(...h)(o);
      return !a.getMeta("preventDispatch") && !this.hasCustomState && i.dispatch(a), u;
    }]));
  }
  get chain() {
    return () => this.createChain();
  }
  get can() {
    return () => this.createCan();
  }
  createChain(e, t = !0) {
    const { rawCommands: n, editor: i, state: a } = this, { view: o } = i, s = [], l = !!e, c = e || a.tr, h = () => (!l && t && !c.getMeta("preventDispatch") && !this.hasCustomState && o.dispatch(c), s.every((p) => p === !0)), u = {
      ...Object.fromEntries(Object.entries(n).map(([p, f]) => [p, (...m) => {
        const y = this.buildProps(c, t), w = f(...m)(y);
        return s.push(w), u;
      }])),
      run: h
    };
    return u;
  }
  createCan(e) {
    const { rawCommands: t, state: n } = this, i = !1, a = e || n.tr, o = this.buildProps(a, i);
    return {
      ...Object.fromEntries(Object.entries(t).map(([l, c]) => [l, (...h) => c(...h)({ ...o, dispatch: void 0 })])),
      chain: () => this.createChain(a, i)
    };
  }
  buildProps(e, t = !0) {
    const { rawCommands: n, editor: i, state: a } = this, { view: o } = i, s = {
      tr: e,
      editor: i,
      view: o,
      state: Mr({
        state: a,
        transaction: e
      }),
      dispatch: t ? () => {
      } : void 0,
      chain: () => this.createChain(e, t),
      can: () => this.createCan(e),
      get commands() {
        return Object.fromEntries(Object.entries(n).map(([l, c]) => [l, (...h) => c(...h)(s)]));
      }
    };
    return s;
  }
}
function J(r, e, t) {
  return r.config[e] === void 0 && r.parent ? J(r.parent, e, t) : typeof r.config[e] == "function" ? r.config[e].bind({
    ...t,
    parent: r.parent ? J(r.parent, e, t) : null
  }) : r.config[e];
}
function eo(r) {
  const e = r.filter((i) => i.type === "extension"), t = r.filter((i) => i.type === "node"), n = r.filter((i) => i.type === "mark");
  return {
    baseExtensions: e,
    nodeExtensions: t,
    markExtensions: n
  };
}
function L(r, e) {
  if (typeof r == "string") {
    if (!e.nodes[r])
      throw Error(`There is no node type named '${r}'. Maybe you forgot to add the extension?`);
    return e.nodes[r];
  }
  return r;
}
function zr(...r) {
  return r.filter((e) => !!e).reduce((e, t) => {
    const n = { ...e };
    return Object.entries(t).forEach(([i, a]) => {
      if (!n[i]) {
        n[i] = a;
        return;
      }
      if (i === "class") {
        const s = a ? String(a).split(" ") : [], l = n[i] ? n[i].split(" ") : [], c = s.filter((h) => !l.includes(h));
        n[i] = [...l, ...c].join(" ");
      } else if (i === "style") {
        const s = a ? a.split(";").map((h) => h.trim()).filter(Boolean) : [], l = n[i] ? n[i].split(";").map((h) => h.trim()).filter(Boolean) : [], c = /* @__PURE__ */ new Map();
        l.forEach((h) => {
          const [u, p] = h.split(":").map((f) => f.trim());
          c.set(u, p);
        }), s.forEach((h) => {
          const [u, p] = h.split(":").map((f) => f.trim());
          c.set(u, p);
        }), n[i] = Array.from(c.entries()).map(([h, u]) => `${h}: ${u}`).join("; ");
      } else
        n[i] = a;
    }), n;
  }, {});
}
function to(r, e) {
  return e.filter((t) => t.type === r.type.name).filter((t) => t.attribute.rendered).map((t) => t.attribute.renderHTML ? t.attribute.renderHTML(r.attrs) || {} : {
    [t.name]: r.attrs[t.name]
  }).reduce((t, n) => zr(t, n), {});
}
function no(r) {
  return typeof r == "function";
}
function X(r, e = void 0, ...t) {
  return no(r) ? e ? r.bind(e)(...t) : r(...t) : r;
}
function ro(r) {
  return Object.prototype.toString.call(r) === "[object RegExp]";
}
function io(r) {
  return Object.prototype.toString.call(r).slice(8, -1);
}
function _e(r) {
  return io(r) !== "Object" ? !1 : r.constructor === Object && Object.getPrototypeOf(r) === Object.prototype;
}
function jt(r, e) {
  const t = { ...r };
  return _e(r) && _e(e) && Object.keys(e).forEach((n) => {
    _e(e[n]) && _e(r[n]) ? t[n] = jt(r[n], e[n]) : t[n] = e[n];
  }), t;
}
class G {
  constructor(e = {}) {
    this.type = "extension", this.name = "extension", this.parent = null, this.child = null, this.config = {
      name: this.name,
      defaultOptions: {}
    }, this.config = {
      ...this.config,
      ...e
    }, this.name = this.config.name, e.defaultOptions && Object.keys(e.defaultOptions).length > 0 && console.warn(`[tiptap warn]: BREAKING CHANGE: "defaultOptions" is deprecated. Please use "addOptions" instead. Found in extension: "${this.name}".`), this.options = this.config.defaultOptions, this.config.addOptions && (this.options = X(J(this, "addOptions", {
      name: this.name
    }))), this.storage = X(J(this, "addStorage", {
      name: this.name,
      options: this.options
    })) || {};
  }
  static create(e = {}) {
    return new G(e);
  }
  configure(e = {}) {
    const t = this.extend({
      ...this.config,
      addOptions: () => jt(this.options, e)
    });
    return t.name = this.name, t.parent = this.parent, t;
  }
  extend(e = {}) {
    const t = new G({ ...this.config, ...e });
    return t.parent = this, this.child = t, t.name = e.name ? e.name : t.parent.name, e.defaultOptions && Object.keys(e.defaultOptions).length > 0 && console.warn(`[tiptap warn]: BREAKING CHANGE: "defaultOptions" is deprecated. Please use "addOptions" instead. Found in extension: "${t.name}".`), t.options = X(J(t, "addOptions", {
      name: t.name
    })), t.storage = X(J(t, "addStorage", {
      name: t.name,
      options: t.options
    })), t;
  }
}
function ao(r, e, t) {
  const { from: n, to: i } = e, { blockSeparator: a = `

`, textSerializers: o = {} } = t || {};
  let s = "";
  return r.nodesBetween(n, i, (l, c, h, u) => {
    var p;
    l.isBlock && c > n && (s += a);
    const f = o == null ? void 0 : o[l.type.name];
    if (f)
      return h && (s += f({
        node: l,
        pos: c,
        parent: h,
        index: u,
        range: e
      })), !1;
    l.isText && (s += (p = l == null ? void 0 : l.text) === null || p === void 0 ? void 0 : p.slice(Math.max(n, c) - c, i - c));
  }), s;
}
function oo(r) {
  return Object.fromEntries(Object.entries(r.nodes).filter(([, e]) => e.spec.toText).map(([e, t]) => [e, t.spec.toText]));
}
G.create({
  name: "clipboardTextSerializer",
  addOptions() {
    return {
      blockSeparator: void 0
    };
  },
  addProseMirrorPlugins() {
    return [
      new pe({
        key: new fe("clipboardTextSerializer"),
        props: {
          clipboardTextSerializer: () => {
            const { editor: r } = this, { state: e, schema: t } = r, { doc: n, selection: i } = e, { ranges: a } = i, o = Math.min(...a.map((h) => h.$from.pos)), s = Math.max(...a.map((h) => h.$to.pos)), l = oo(t);
            return ao(n, { from: o, to: s }, {
              ...this.options.blockSeparator !== void 0 ? { blockSeparator: this.options.blockSeparator } : {},
              textSerializers: l
            });
          }
        }
      })
    ];
  }
});
const so = () => ({ editor: r, view: e }) => (requestAnimationFrame(() => {
  var t;
  r.isDestroyed || (e.dom.blur(), (t = window == null ? void 0 : window.getSelection()) === null || t === void 0 || t.removeAllRanges());
}), !0), lo = (r = !1) => ({ commands: e }) => e.setContent("", r), co = () => ({ state: r, tr: e, dispatch: t }) => {
  const { selection: n } = e, { ranges: i } = n;
  return t && i.forEach(({ $from: a, $to: o }) => {
    r.doc.nodesBetween(a.pos, o.pos, (s, l) => {
      if (s.type.isText)
        return;
      const { doc: c, mapping: h } = e, u = c.resolve(h.map(l)), p = c.resolve(h.map(l + s.nodeSize)), f = u.blockRange(p);
      if (!f)
        return;
      const b = ve(f);
      if (s.type.isTextblock) {
        const { defaultType: m } = u.parent.contentMatchAt(u.index());
        e.setNodeMarkup(f.start, m);
      }
      (b || b === 0) && e.lift(f, b);
    });
  }), !0;
}, uo = (r) => (e) => r(e), ho = () => ({ state: r, dispatch: e }) => Nr(r, e), po = (r, e) => ({ editor: t, tr: n }) => {
  const { state: i } = t, a = i.doc.slice(r.from, r.to);
  n.deleteRange(r.from, r.to);
  const o = n.mapping.map(e);
  return n.insert(o, a.content), n.setSelection(new A(n.doc.resolve(Math.max(o - 1, 0)))), !0;
}, fo = () => ({ tr: r, dispatch: e }) => {
  const { selection: t } = r, n = t.$anchor.node();
  if (n.content.size > 0)
    return !1;
  const i = r.selection.$anchor;
  for (let a = i.depth; a > 0; a -= 1)
    if (i.node(a).type === n.type) {
      if (e) {
        const s = i.before(a), l = i.after(a);
        r.delete(s, l).scrollIntoView();
      }
      return !0;
    }
  return !1;
}, mo = (r) => ({ tr: e, state: t, dispatch: n }) => {
  const i = L(r, t.schema), a = e.selection.$anchor;
  for (let o = a.depth; o > 0; o -= 1)
    if (a.node(o).type === i) {
      if (n) {
        const l = a.before(o), c = a.after(o);
        e.delete(l, c).scrollIntoView();
      }
      return !0;
    }
  return !1;
}, go = (r) => ({ tr: e, dispatch: t }) => {
  const { from: n, to: i } = r;
  return t && e.delete(n, i), !0;
}, bo = () => ({ state: r, dispatch: e }) => Pt(r, e), yo = () => ({ commands: r }) => r.keyboardShortcut("Enter"), wo = () => ({ state: r, dispatch: e }) => Ha(r, e);
function it(r, e, t = { strict: !0 }) {
  const n = Object.keys(e);
  return n.length ? n.every((i) => t.strict ? e[i] === r[i] : ro(e[i]) ? e[i].test(r[i]) : e[i] === r[i]) : !0;
}
function Ir(r, e, t = {}) {
  return r.find((n) => n.type === e && it(
    // Only check equality for the attributes that are provided
    Object.fromEntries(Object.keys(t).map((i) => [i, n.attrs[i]])),
    t
  ));
}
function Sn(r, e, t = {}) {
  return !!Ir(r, e, t);
}
function Rr(r, e, t) {
  var n;
  if (!r || !e)
    return;
  let i = r.parent.childAfter(r.parentOffset);
  if ((!i.node || !i.node.marks.some((h) => h.type === e)) && (i = r.parent.childBefore(r.parentOffset)), !i.node || !i.node.marks.some((h) => h.type === e) || (t = t || ((n = i.node.marks[0]) === null || n === void 0 ? void 0 : n.attrs), !Ir([...i.node.marks], e, t)))
    return;
  let o = i.index, s = r.start() + i.offset, l = o + 1, c = s + i.node.nodeSize;
  for (; o > 0 && Sn([...r.parent.child(o - 1).marks], e, t); )
    o -= 1, s -= r.parent.child(o).nodeSize;
  for (; l < r.parent.childCount && Sn([...r.parent.child(l).marks], e, t); )
    c += r.parent.child(l).nodeSize, l += 1;
  return {
    from: s,
    to: c
  };
}
function re(r, e) {
  if (typeof r == "string") {
    if (!e.marks[r])
      throw Error(`There is no mark type named '${r}'. Maybe you forgot to add the extension?`);
    return e.marks[r];
  }
  return r;
}
const xo = (r, e = {}) => ({ tr: t, state: n, dispatch: i }) => {
  const a = re(r, n.schema), { doc: o, selection: s } = t, { $from: l, from: c, to: h } = s;
  if (i) {
    const u = Rr(l, a, e);
    if (u && u.from <= c && u.to >= h) {
      const p = A.create(o, u.from, u.to);
      t.setSelection(p);
    }
  }
  return !0;
}, vo = (r) => (e) => {
  const t = typeof r == "function" ? r(e) : r;
  for (let n = 0; n < t.length; n += 1)
    if (t[n](e))
      return !0;
  return !1;
};
function Lr(r) {
  return r instanceof A;
}
function se(r = 0, e = 0, t = 0) {
  return Math.min(Math.max(r, e), t);
}
function ko(r, e = null) {
  if (!e)
    return null;
  const t = C.atStart(r), n = C.atEnd(r);
  if (e === "start" || e === !0)
    return t;
  if (e === "end")
    return n;
  const i = t.from, a = n.to;
  return e === "all" ? A.create(r, se(0, i, a), se(r.content.size, i, a)) : A.create(r, se(e, i, a), se(e, i, a));
}
function Nt() {
  return navigator.platform === "Android" || /android/i.test(navigator.userAgent);
}
function He() {
  return [
    "iPad Simulator",
    "iPhone Simulator",
    "iPod Simulator",
    "iPad",
    "iPhone",
    "iPod"
  ].includes(navigator.platform) || navigator.userAgent.includes("Mac") && "ontouchend" in document;
}
function So() {
  return typeof navigator < "u" ? /^((?!chrome|android).)*safari/i.test(navigator.userAgent) : !1;
}
const Co = (r = null, e = {}) => ({ editor: t, view: n, tr: i, dispatch: a }) => {
  e = {
    scrollIntoView: !0,
    ...e
  };
  const o = () => {
    (He() || Nt()) && n.dom.focus(), requestAnimationFrame(() => {
      t.isDestroyed || (n.focus(), So() && !He() && !Nt() && n.dom.focus({ preventScroll: !0 }));
    });
  };
  if (n.hasFocus() && r === null || r === !1)
    return !0;
  if (a && r === null && !Lr(t.state.selection))
    return o(), !0;
  const s = ko(i.doc, r) || t.state.selection, l = t.state.selection.eq(s);
  return a && (l || i.setSelection(s), l && i.storedMarks && i.setStoredMarks(i.storedMarks), o()), !0;
}, No = (r, e) => (t) => r.every((n, i) => e(n, { ...t, index: i })), Eo = (r, e) => ({ tr: t, commands: n }) => n.insertContentAt({ from: t.selection.from, to: t.selection.to }, r, e), Pr = (r) => {
  const e = r.childNodes;
  for (let t = e.length - 1; t >= 0; t -= 1) {
    const n = e[t];
    n.nodeType === 3 && n.nodeValue && /^(\n\s\s|\n)$/.test(n.nodeValue) ? r.removeChild(n) : n.nodeType === 1 && Pr(n);
  }
  return r;
};
function We(r) {
  const e = `<body>${r}</body>`, t = new window.DOMParser().parseFromString(e, "text/html").body;
  return Pr(t);
}
function je(r, e, t) {
  if (r instanceof de || r instanceof x)
    return r;
  t = {
    slice: !0,
    parseOptions: {},
    ...t
  };
  const n = typeof r == "object" && r !== null, i = typeof r == "string";
  if (n)
    try {
      if (Array.isArray(r) && r.length > 0)
        return x.fromArray(r.map((s) => e.nodeFromJSON(s)));
      const o = e.nodeFromJSON(r);
      return t.errorOnInvalidContent && o.check(), o;
    } catch (a) {
      if (t.errorOnInvalidContent)
        throw new Error("[tiptap error]: Invalid JSON content", { cause: a });
      return console.warn("[tiptap warn]: Invalid content.", "Passed value:", r, "Error:", a), je("", e, t);
    }
  if (i) {
    if (t.errorOnInvalidContent) {
      let o = !1, s = "";
      const l = new ga({
        topNode: e.spec.topNode,
        marks: e.spec.marks,
        // Prosemirror's schemas are executed such that: the last to execute, matches last
        // This means that we can add a catch-all node at the end of the schema to catch any content that we don't know how to handle
        nodes: e.spec.nodes.append({
          __tiptap__private__unknown__catch__all__node: {
            content: "inline*",
            group: "block",
            parseDOM: [
              {
                tag: "*",
                getAttrs: (c) => (o = !0, s = typeof c == "string" ? c : c.outerHTML, null)
              }
            ]
          }
        })
      });
      if (t.slice ? ge.fromSchema(l).parseSlice(We(r), t.parseOptions) : ge.fromSchema(l).parse(We(r), t.parseOptions), t.errorOnInvalidContent && o)
        throw new Error("[tiptap error]: Invalid HTML content", { cause: new Error(`Invalid element found: ${s}`) });
    }
    const a = ge.fromSchema(e);
    return t.slice ? a.parseSlice(We(r), t.parseOptions).content : a.parse(We(r), t.parseOptions);
  }
  return je("", e, t);
}
function Ao(r, e, t) {
  const n = r.steps.length - 1;
  if (n < e)
    return;
  const i = r.steps[n];
  if (!(i instanceof B || i instanceof j))
    return;
  const a = r.mapping.maps[n];
  let o = 0;
  a.forEach((s, l, c, h) => {
    o === 0 && (o = h);
  }), r.setSelection(C.near(r.doc.resolve(o), t));
}
const To = (r) => !("type" in r), Mo = (r, e, t) => ({ tr: n, dispatch: i, editor: a }) => {
  var o;
  if (i) {
    t = {
      parseOptions: a.options.parseOptions,
      updateSelection: !0,
      applyInputRules: !1,
      applyPasteRules: !1,
      ...t
    };
    let s;
    const l = (y) => {
      a.emit("contentError", {
        editor: a,
        error: y,
        disableCollaboration: () => {
          a.storage.collaboration && (a.storage.collaboration.isDisabled = !0);
        }
      });
    }, c = {
      preserveWhitespace: "full",
      ...t.parseOptions
    };
    if (!t.errorOnInvalidContent && !a.options.enableContentCheck && a.options.emitContentError)
      try {
        je(e, a.schema, {
          parseOptions: c,
          errorOnInvalidContent: !0
        });
      } catch (y) {
        l(y);
      }
    try {
      s = je(e, a.schema, {
        parseOptions: c,
        errorOnInvalidContent: (o = t.errorOnInvalidContent) !== null && o !== void 0 ? o : a.options.enableContentCheck
      });
    } catch (y) {
      return l(y), !1;
    }
    let { from: h, to: u } = typeof r == "number" ? { from: r, to: r } : { from: r.from, to: r.to }, p = !0, f = !0;
    if ((To(s) ? s : [s]).forEach((y) => {
      y.check(), p = p ? y.isText && y.marks.length === 0 : !1, f = f ? y.isBlock : !1;
    }), h === u && f) {
      const { parent: y } = n.doc.resolve(h);
      y.isTextblock && !y.type.spec.code && !y.childCount && (h -= 1, u += 1);
    }
    let m;
    if (p) {
      if (Array.isArray(e))
        m = e.map((y) => y.text || "").join("");
      else if (e instanceof x) {
        let y = "";
        e.forEach((w) => {
          w.text && (y += w.text);
        }), m = y;
      } else typeof e == "object" && e && e.text ? m = e.text : m = e;
      n.insertText(m, h, u);
    } else
      m = s, n.replaceWith(h, u, m);
    t.updateSelection && Ao(n, n.steps.length - 1, -1), t.applyInputRules && n.setMeta("applyInputRules", { from: h, text: m }), t.applyPasteRules && n.setMeta("applyPasteRules", { from: h, text: m });
  }
  return !0;
}, zo = () => ({ state: r, dispatch: e }) => Oa(r, e), Io = () => ({ state: r, dispatch: e }) => Ba(r, e), Ro = () => ({ state: r, dispatch: e }) => yr(r, e), Lo = () => ({ state: r, dispatch: e }) => kr(r, e), Po = () => ({ state: r, dispatch: e, tr: t }) => {
  try {
    const n = lt(r.doc, r.selection.$from.pos, -1);
    return n == null ? !1 : (t.join(n, 2), e && e(t), !0);
  } catch {
    return !1;
  }
}, Oo = () => ({ state: r, dispatch: e, tr: t }) => {
  try {
    const n = lt(r.doc, r.selection.$from.pos, 1);
    return n == null ? !1 : (t.join(n, 2), e && e(t), !0);
  } catch {
    return !1;
  }
}, Bo = () => ({ state: r, dispatch: e }) => La(r, e), Fo = () => ({ state: r, dispatch: e }) => Pa(r, e);
function Or() {
  return typeof navigator < "u" ? /Mac/.test(navigator.platform) : !1;
}
function Ho(r) {
  const e = r.split(/-(?!$)/);
  let t = e[e.length - 1];
  t === "Space" && (t = " ");
  let n, i, a, o;
  for (let s = 0; s < e.length - 1; s += 1) {
    const l = e[s];
    if (/^(cmd|meta|m)$/i.test(l))
      o = !0;
    else if (/^a(lt)?$/i.test(l))
      n = !0;
    else if (/^(c|ctrl|control)$/i.test(l))
      i = !0;
    else if (/^s(hift)?$/i.test(l))
      a = !0;
    else if (/^mod$/i.test(l))
      He() || Or() ? o = !0 : i = !0;
    else
      throw new Error(`Unrecognized modifier name: ${l}`);
  }
  return n && (t = `Alt-${t}`), i && (t = `Ctrl-${t}`), o && (t = `Meta-${t}`), a && (t = `Shift-${t}`), t;
}
const jo = (r) => ({ editor: e, view: t, tr: n, dispatch: i }) => {
  const a = Ho(r).split(/-(?!$)/), o = a.find((c) => !["Alt", "Ctrl", "Meta", "Shift"].includes(c)), s = new KeyboardEvent("keydown", {
    key: o === "Space" ? " " : o,
    altKey: a.includes("Alt"),
    ctrlKey: a.includes("Ctrl"),
    metaKey: a.includes("Meta"),
    shiftKey: a.includes("Shift"),
    bubbles: !0,
    cancelable: !0
  }), l = e.captureTransaction(() => {
    t.someProp("handleKeyDown", (c) => c(t, s));
  });
  return l == null || l.steps.forEach((c) => {
    const h = c.map(n.mapping);
    h && i && n.maybeStep(h);
  }), !0;
};
function $t(r, e, t = {}) {
  const { from: n, to: i, empty: a } = r.selection, o = e ? L(e, r.schema) : null, s = [];
  r.doc.nodesBetween(n, i, (u, p) => {
    if (u.isText)
      return;
    const f = Math.max(n, p), b = Math.min(i, p + u.nodeSize);
    s.push({
      node: u,
      from: f,
      to: b
    });
  });
  const l = i - n, c = s.filter((u) => o ? o.name === u.node.type.name : !0).filter((u) => it(u.node.attrs, t, { strict: !1 }));
  return a ? !!c.length : c.reduce((u, p) => u + p.to - p.from, 0) >= l;
}
const $o = (r, e = {}) => ({ state: t, dispatch: n }) => {
  const i = L(r, t.schema);
  return $t(t, i, e) ? Fa(t, n) : !1;
}, Do = () => ({ state: r, dispatch: e }) => Er(r, e), Uo = (r) => ({ state: e, dispatch: t }) => {
  const n = L(r, e.schema);
  return Ka(n)(e, t);
}, Vo = () => ({ state: r, dispatch: e }) => Cr(r, e);
function Br(r, e) {
  return e.nodes[r] ? "node" : e.marks[r] ? "mark" : null;
}
function Cn(r, e) {
  const t = typeof e == "string" ? [e] : e;
  return Object.keys(r).reduce((n, i) => (t.includes(i) || (n[i] = r[i]), n), {});
}
const qo = (r, e) => ({ tr: t, state: n, dispatch: i }) => {
  let a = null, o = null;
  const s = Br(typeof r == "string" ? r : r.name, n.schema);
  return s ? (s === "node" && (a = L(r, n.schema)), s === "mark" && (o = re(r, n.schema)), i && t.selection.ranges.forEach((l) => {
    n.doc.nodesBetween(l.$from.pos, l.$to.pos, (c, h) => {
      a && a === c.type && t.setNodeMarkup(h, void 0, Cn(c.attrs, e)), o && c.marks.length && c.marks.forEach((u) => {
        o === u.type && t.addMark(h, h + c.nodeSize, o.create(Cn(u.attrs, e)));
      });
    });
  }), !0) : !1;
}, _o = () => ({ tr: r, dispatch: e }) => (e && r.scrollIntoView(), !0), Wo = () => ({ tr: r, dispatch: e }) => {
  if (e) {
    const t = new V(r.doc);
    r.setSelection(t);
  }
  return !0;
}, Jo = () => ({ state: r, dispatch: e }) => xr(r, e), Go = () => ({ state: r, dispatch: e }) => Sr(r, e), Ko = () => ({ state: r, dispatch: e }) => Da(r, e), Zo = () => ({ state: r, dispatch: e }) => qa(r, e), Yo = () => ({ state: r, dispatch: e }) => Va(r, e);
function Xo(r, e, t = {}, n = {}) {
  return je(r, e, {
    slice: !1,
    parseOptions: t,
    errorOnInvalidContent: n.errorOnInvalidContent
  });
}
const Qo = (r, e = !1, t = {}, n = {}) => ({ editor: i, tr: a, dispatch: o, commands: s }) => {
  var l, c;
  const { doc: h } = a;
  if (t.preserveWhitespace !== "full") {
    const u = Xo(r, i.schema, t, {
      errorOnInvalidContent: (l = n.errorOnInvalidContent) !== null && l !== void 0 ? l : i.options.enableContentCheck
    });
    return o && a.replaceWith(0, h.content.size, u).setMeta("preventUpdate", !e), !0;
  }
  return o && a.setMeta("preventUpdate", !e), s.insertContentAt({ from: 0, to: h.content.size }, r, {
    parseOptions: t,
    errorOnInvalidContent: (c = n.errorOnInvalidContent) !== null && c !== void 0 ? c : i.options.enableContentCheck
  });
};
function es(r, e) {
  const t = re(e, r.schema), { from: n, to: i, empty: a } = r.selection, o = [];
  a ? (r.storedMarks && o.push(...r.storedMarks), o.push(...r.selection.$head.marks())) : r.doc.nodesBetween(n, i, (l) => {
    o.push(...l.marks);
  });
  const s = o.find((l) => l.type.name === t.name);
  return s ? { ...s.attrs } : {};
}
function ts(r) {
  for (let e = 0; e < r.edgeCount; e += 1) {
    const { type: t } = r.edge(e);
    if (t.isTextblock && !t.hasRequiredAttrs())
      return t;
  }
  return null;
}
function ns(r, e) {
  for (let t = r.depth; t > 0; t -= 1) {
    const n = r.node(t);
    if (e(n))
      return {
        pos: t > 0 ? r.before(t) : 0,
        start: r.start(t),
        depth: t,
        node: n
      };
  }
}
function Dt(r) {
  return (e) => ns(e.$from, r);
}
function Ke(r, e, t) {
  return Object.fromEntries(Object.entries(t).filter(([n]) => {
    const i = r.find((a) => a.type === e && a.name === n);
    return i ? i.attribute.keepOnSplit : !1;
  }));
}
function rs(r, e, t = {}) {
  const { empty: n, ranges: i } = r.selection, a = e ? re(e, r.schema) : null;
  if (n)
    return !!(r.storedMarks || r.selection.$from.marks()).filter((u) => a ? a.name === u.type.name : !0).find((u) => it(u.attrs, t, { strict: !1 }));
  let o = 0;
  const s = [];
  if (i.forEach(({ $from: u, $to: p }) => {
    const f = u.pos, b = p.pos;
    r.doc.nodesBetween(f, b, (m, y) => {
      if (!m.isText && !m.marks.length)
        return;
      const w = Math.max(f, y), k = Math.min(b, y + m.nodeSize), S = k - w;
      o += S, s.push(...m.marks.map((M) => ({
        mark: M,
        from: w,
        to: k
      })));
    });
  }), o === 0)
    return !1;
  const l = s.filter((u) => a ? a.name === u.mark.type.name : !0).filter((u) => it(u.mark.attrs, t, { strict: !1 })).reduce((u, p) => u + p.to - p.from, 0), c = s.filter((u) => a ? u.mark.type !== a && u.mark.type.excludes(a) : !0).reduce((u, p) => u + p.to - p.from, 0);
  return (l > 0 ? l + c : l) >= o;
}
function Nn(r, e) {
  const { nodeExtensions: t } = eo(e), n = t.find((o) => o.name === r);
  if (!n)
    return !1;
  const i = {
    name: n.name,
    options: n.options,
    storage: n.storage
  }, a = X(J(n, "group", i));
  return typeof a != "string" ? !1 : a.split(" ").includes("list");
}
function Fr(r, { checkChildren: e = !0, ignoreWhitespace: t = !1 } = {}) {
  var n;
  if (t) {
    if (r.type.name === "hardBreak")
      return !0;
    if (r.isText)
      return /^\s*$/m.test((n = r.text) !== null && n !== void 0 ? n : "");
  }
  if (r.isText)
    return !r.text;
  if (r.isAtom || r.isLeaf)
    return !1;
  if (r.content.childCount === 0)
    return !0;
  if (e) {
    let i = !0;
    return r.content.forEach((a) => {
      i !== !1 && (Fr(a, { ignoreWhitespace: t, checkChildren: e }) || (i = !1));
    }), i;
  }
  return !1;
}
function is(r, e, t) {
  var n;
  const { selection: i } = e;
  let a = null;
  if (Lr(i) && (a = i.$cursor), a) {
    const s = (n = r.storedMarks) !== null && n !== void 0 ? n : a.marks();
    return !!t.isInSet(s) || !s.some((l) => l.type.excludes(t));
  }
  const { ranges: o } = i;
  return o.some(({ $from: s, $to: l }) => {
    let c = s.depth === 0 ? r.doc.inlineContent && r.doc.type.allowsMarkType(t) : !1;
    return r.doc.nodesBetween(s.pos, l.pos, (h, u, p) => {
      if (c)
        return !1;
      if (h.isInline) {
        const f = !p || p.type.allowsMarkType(t), b = !!t.isInSet(h.marks) || !h.marks.some((m) => m.type.excludes(t));
        c = f && b;
      }
      return !c;
    }), c;
  });
}
const as = (r, e = {}) => ({ tr: t, state: n, dispatch: i }) => {
  const { selection: a } = t, { empty: o, ranges: s } = a, l = re(r, n.schema);
  if (i)
    if (o) {
      const c = es(n, l);
      t.addStoredMark(l.create({
        ...c,
        ...e
      }));
    } else
      s.forEach((c) => {
        const h = c.$from.pos, u = c.$to.pos;
        n.doc.nodesBetween(h, u, (p, f) => {
          const b = Math.max(f, h), m = Math.min(f + p.nodeSize, u);
          p.marks.find((w) => w.type === l) ? p.marks.forEach((w) => {
            l === w.type && t.addMark(b, m, l.create({
              ...w.attrs,
              ...e
            }));
          }) : t.addMark(b, m, l.create(e));
        });
      });
  return is(n, t, l);
}, ss = (r, e) => ({ tr: t }) => (t.setMeta(r, e), !0), ls = (r, e = {}) => ({ state: t, dispatch: n, chain: i }) => {
  const a = L(r, t.schema);
  let o;
  return t.selection.$anchor.sameParent(t.selection.$head) && (o = t.selection.$anchor.parent.attrs), a.isTextblock ? i().command(({ commands: s }) => kn(a, { ...o, ...e })(t) ? !0 : s.clearNodes()).command(({ state: s }) => kn(a, { ...o, ...e })(s, n)).run() : (console.warn('[tiptap warn]: Currently "setNode()" only supports text block nodes.'), !1);
}, cs = (r) => ({ tr: e, dispatch: t }) => {
  if (t) {
    const { doc: n } = e, i = se(r, 0, n.content.size), a = N.create(n, i);
    e.setSelection(a);
  }
  return !0;
}, ds = (r) => ({ tr: e, dispatch: t }) => {
  if (t) {
    const { doc: n } = e, { from: i, to: a } = typeof r == "number" ? { from: r, to: r } : r, o = A.atStart(n).from, s = A.atEnd(n).to, l = se(i, o, s), c = se(a, o, s), h = A.create(n, l, c);
    e.setSelection(h);
  }
  return !0;
}, us = (r) => ({ state: e, dispatch: t }) => {
  const n = L(r, e.schema);
  return Xa(n)(e, t);
};
function En(r, e) {
  const t = r.storedMarks || r.selection.$to.parentOffset && r.selection.$from.marks();
  if (t) {
    const n = t.filter((i) => e == null ? void 0 : e.includes(i.type.name));
    r.tr.ensureMarks(n);
  }
}
const hs = ({ keepMarks: r = !0 } = {}) => ({ tr: e, state: t, dispatch: n, editor: i }) => {
  const { selection: a, doc: o } = e, { $from: s, $to: l } = a, c = i.extensionManager.attributes, h = Ke(c, s.node().type.name, s.node().attrs);
  if (a instanceof N && a.node.isBlock)
    return !s.parentOffset || !Q(o, s.pos) ? !1 : (n && (r && En(t, i.extensionManager.splittableMarks), e.split(s.pos).scrollIntoView()), !0);
  if (!s.parent.isBlock)
    return !1;
  const u = l.parentOffset === l.parent.content.size, p = s.depth === 0 ? void 0 : ts(s.node(-1).contentMatchAt(s.indexAfter(-1)));
  let f = u && p ? [
    {
      type: p,
      attrs: h
    }
  ] : void 0, b = Q(e.doc, e.mapping.map(s.pos), 1, f);
  if (!f && !b && Q(e.doc, e.mapping.map(s.pos), 1, p ? [{ type: p }] : void 0) && (b = !0, f = p ? [
    {
      type: p,
      attrs: h
    }
  ] : void 0), n) {
    if (b && (a instanceof A && e.deleteSelection(), e.split(e.mapping.map(s.pos), 1, f), p && !u && !s.parentOffset && s.parent.type !== p)) {
      const m = e.mapping.map(s.before()), y = e.doc.resolve(m);
      s.node(-1).canReplaceWith(y.index(), y.index() + 1, p) && e.setNodeMarkup(e.mapping.map(s.before()), p);
    }
    r && En(t, i.extensionManager.splittableMarks), e.scrollIntoView();
  }
  return b;
}, ps = (r, e = {}) => ({ tr: t, state: n, dispatch: i, editor: a }) => {
  var o;
  const s = L(r, n.schema), { $from: l, $to: c } = n.selection, h = n.selection.node;
  if (h && h.isBlock || l.depth < 2 || !l.sameParent(c))
    return !1;
  const u = l.node(-1);
  if (u.type !== s)
    return !1;
  const p = a.extensionManager.attributes;
  if (l.parent.content.size === 0 && l.node(-1).childCount === l.indexAfter(-1)) {
    if (l.depth === 2 || l.node(-3).type !== s || l.index(-2) !== l.node(-2).childCount - 1)
      return !1;
    if (i) {
      let w = x.empty;
      const k = l.index(-1) ? 1 : l.index(-2) ? 2 : 3;
      for (let _ = l.depth - k; _ >= l.depth - 3; _ -= 1)
        w = x.from(l.node(_).copy(w));
      const S = l.indexAfter(-1) < l.node(-2).childCount ? 1 : l.indexAfter(-2) < l.node(-3).childCount ? 2 : 3, M = {
        ...Ke(p, l.node().type.name, l.node().attrs),
        ...e
      }, O = ((o = s.contentMatch.defaultType) === null || o === void 0 ? void 0 : o.createAndFill(M)) || void 0;
      w = w.append(x.from(s.createAndFill(null, O) || void 0));
      const z = l.before(l.depth - (k - 1));
      t.replace(z, l.after(-S), new v(w, 4 - k, 0));
      let $ = -1;
      t.doc.nodesBetween(z, t.doc.content.size, (_, Wr) => {
        if ($ > -1)
          return !1;
        _.isTextblock && _.content.size === 0 && ($ = Wr + 1);
      }), $ > -1 && t.setSelection(A.near(t.doc.resolve($))), t.scrollIntoView();
    }
    return !0;
  }
  const f = c.pos === l.end() ? u.contentMatchAt(0).defaultType : null, b = {
    ...Ke(p, u.type.name, u.attrs),
    ...e
  }, m = {
    ...Ke(p, l.node().type.name, l.node().attrs),
    ...e
  };
  t.delete(l.pos, c.pos);
  const y = f ? [
    { type: s, attrs: b },
    { type: f, attrs: m }
  ] : [{ type: s, attrs: b }];
  if (!Q(t.doc, l.pos, 2))
    return !1;
  if (i) {
    const { selection: w, storedMarks: k } = n, { splittableMarks: S } = a.extensionManager, M = k || w.$to.parentOffset && w.$from.marks();
    if (t.split(l.pos, 2, y).scrollIntoView(), !M || !i)
      return !0;
    const O = M.filter((z) => S.includes(z.type.name));
    t.ensureMarks(O);
  }
  return !0;
}, gt = (r, e) => {
  const t = Dt((o) => o.type === e)(r.selection);
  if (!t)
    return !0;
  const n = r.doc.resolve(Math.max(0, t.pos - 1)).before(t.depth);
  if (n === void 0)
    return !0;
  const i = r.doc.nodeAt(n);
  return t.node.type === (i == null ? void 0 : i.type) && he(r.doc, t.pos) && r.join(t.pos), !0;
}, bt = (r, e) => {
  const t = Dt((o) => o.type === e)(r.selection);
  if (!t)
    return !0;
  const n = r.doc.resolve(t.start).after(t.depth);
  if (n === void 0)
    return !0;
  const i = r.doc.nodeAt(n);
  return t.node.type === (i == null ? void 0 : i.type) && he(r.doc, n) && r.join(n), !0;
}, fs = (r, e, t, n = {}) => ({ editor: i, tr: a, state: o, dispatch: s, chain: l, commands: c, can: h }) => {
  const { extensions: u, splittableMarks: p } = i.extensionManager, f = L(r, o.schema), b = L(e, o.schema), { selection: m, storedMarks: y } = o, { $from: w, $to: k } = m, S = w.blockRange(k), M = y || m.$to.parentOffset && m.$from.marks();
  if (!S)
    return !1;
  const O = Dt((z) => Nn(z.type.name, u))(m);
  if (S.depth >= 1 && O && S.depth - O.depth <= 1) {
    if (O.node.type === f)
      return c.liftListItem(b);
    if (Nn(O.node.type.name, u) && f.validContent(O.node.content) && s)
      return l().command(() => (a.setNodeMarkup(O.pos, f), !0)).command(() => gt(a, f)).command(() => bt(a, f)).run();
  }
  return !t || !M || !s ? l().command(() => h().wrapInList(f, n) ? !0 : c.clearNodes()).wrapInList(f, n).command(() => gt(a, f)).command(() => bt(a, f)).run() : l().command(() => {
    const z = h().wrapInList(f, n), $ = M.filter((_) => p.includes(_.type.name));
    return a.ensureMarks($), z ? !0 : c.clearNodes();
  }).wrapInList(f, n).command(() => gt(a, f)).command(() => bt(a, f)).run();
}, ms = (r, e = {}, t = {}) => ({ state: n, commands: i }) => {
  const { extendEmptyMarkRange: a = !1 } = t, o = re(r, n.schema);
  return rs(n, o, e) ? i.unsetMark(o, { extendEmptyMarkRange: a }) : i.setMark(o, e);
}, gs = (r, e, t = {}) => ({ state: n, commands: i }) => {
  const a = L(r, n.schema), o = L(e, n.schema), s = $t(n, a, t);
  let l;
  return n.selection.$anchor.sameParent(n.selection.$head) && (l = n.selection.$anchor.parent.attrs), s ? i.setNode(o, l) : i.setNode(a, { ...l, ...t });
}, bs = (r, e = {}) => ({ state: t, commands: n }) => {
  const i = L(r, t.schema);
  return $t(t, i, e) ? n.lift(i) : n.wrapIn(i, e);
}, ys = () => ({ state: r, dispatch: e }) => {
  const t = r.plugins;
  for (let n = 0; n < t.length; n += 1) {
    const i = t[n];
    let a;
    if (i.spec.isInputRules && (a = i.getState(r))) {
      if (e) {
        const o = r.tr, s = a.transform;
        for (let l = s.steps.length - 1; l >= 0; l -= 1)
          o.step(s.steps[l].invert(s.docs[l]));
        if (a.text) {
          const l = o.doc.resolve(a.from).marks();
          o.replaceWith(a.from, a.to, r.schema.text(a.text, l));
        } else
          o.delete(a.from, a.to);
      }
      return !0;
    }
  }
  return !1;
}, ws = () => ({ tr: r, dispatch: e }) => {
  const { selection: t } = r, { empty: n, ranges: i } = t;
  return n || e && i.forEach((a) => {
    r.removeMark(a.$from.pos, a.$to.pos);
  }), !0;
}, xs = (r, e = {}) => ({ tr: t, state: n, dispatch: i }) => {
  var a;
  const { extendEmptyMarkRange: o = !1 } = e, { selection: s } = t, l = re(r, n.schema), { $from: c, empty: h, ranges: u } = s;
  if (!i)
    return !0;
  if (h && o) {
    let { from: p, to: f } = s;
    const b = (a = c.marks().find((y) => y.type === l)) === null || a === void 0 ? void 0 : a.attrs, m = Rr(c, l, b);
    m && (p = m.from, f = m.to), t.removeMark(p, f, l);
  } else
    u.forEach((p) => {
      t.removeMark(p.$from.pos, p.$to.pos, l);
    });
  return t.removeStoredMark(l), !0;
}, vs = (r, e = {}) => ({ tr: t, state: n, dispatch: i }) => {
  let a = null, o = null;
  const s = Br(typeof r == "string" ? r : r.name, n.schema);
  return s ? (s === "node" && (a = L(r, n.schema)), s === "mark" && (o = re(r, n.schema)), i && t.selection.ranges.forEach((l) => {
    const c = l.$from.pos, h = l.$to.pos;
    let u, p, f, b;
    t.selection.empty ? n.doc.nodesBetween(c, h, (m, y) => {
      a && a === m.type && (f = Math.max(y, c), b = Math.min(y + m.nodeSize, h), u = y, p = m);
    }) : n.doc.nodesBetween(c, h, (m, y) => {
      y < c && a && a === m.type && (f = Math.max(y, c), b = Math.min(y + m.nodeSize, h), u = y, p = m), y >= c && y <= h && (a && a === m.type && t.setNodeMarkup(y, void 0, {
        ...m.attrs,
        ...e
      }), o && m.marks.length && m.marks.forEach((w) => {
        if (o === w.type) {
          const k = Math.max(y, c), S = Math.min(y + m.nodeSize, h);
          t.addMark(k, S, o.create({
            ...w.attrs,
            ...e
          }));
        }
      }));
    }), p && (u !== void 0 && t.setNodeMarkup(u, void 0, {
      ...p.attrs,
      ...e
    }), o && p.marks.length && p.marks.forEach((m) => {
      o === m.type && t.addMark(f, b, o.create({
        ...m.attrs,
        ...e
      }));
    }));
  }), !0) : !1;
}, ks = (r, e = {}) => ({ state: t, dispatch: n }) => {
  const i = L(r, t.schema);
  return _a(i, e)(t, n);
}, Ss = (r, e = {}) => ({ state: t, dispatch: n }) => {
  const i = L(r, t.schema);
  return Wa(i, e)(t, n);
};
var Cs = /* @__PURE__ */ Object.freeze({
  __proto__: null,
  blur: so,
  clearContent: lo,
  clearNodes: co,
  command: uo,
  createParagraphNear: ho,
  cut: po,
  deleteCurrentNode: fo,
  deleteNode: mo,
  deleteRange: go,
  deleteSelection: bo,
  enter: yo,
  exitCode: wo,
  extendMarkRange: xo,
  first: vo,
  focus: Co,
  forEach: No,
  insertContent: Eo,
  insertContentAt: Mo,
  joinBackward: Ro,
  joinDown: Io,
  joinForward: Lo,
  joinItemBackward: Po,
  joinItemForward: Oo,
  joinTextblockBackward: Bo,
  joinTextblockForward: Fo,
  joinUp: zo,
  keyboardShortcut: jo,
  lift: $o,
  liftEmptyBlock: Do,
  liftListItem: Uo,
  newlineInCode: Vo,
  resetAttributes: qo,
  scrollIntoView: _o,
  selectAll: Wo,
  selectNodeBackward: Jo,
  selectNodeForward: Go,
  selectParentNode: Ko,
  selectTextblockEnd: Zo,
  selectTextblockStart: Yo,
  setContent: Qo,
  setMark: as,
  setMeta: ss,
  setNode: ls,
  setNodeSelection: cs,
  setTextSelection: ds,
  sinkListItem: us,
  splitBlock: hs,
  splitListItem: ps,
  toggleList: fs,
  toggleMark: ms,
  toggleNode: gs,
  toggleWrap: bs,
  undoInputRule: ys,
  unsetAllMarks: ws,
  unsetMark: xs,
  updateAttributes: vs,
  wrapIn: ks,
  wrapInList: Ss
});
G.create({
  name: "commands",
  addCommands() {
    return {
      ...Cs
    };
  }
});
G.create({
  name: "drop",
  addProseMirrorPlugins() {
    return [
      new pe({
        key: new fe("tiptapDrop"),
        props: {
          handleDrop: (r, e, t, n) => {
            this.editor.emit("drop", {
              editor: this.editor,
              event: e,
              slice: t,
              moved: n
            });
          }
        }
      })
    ];
  }
});
G.create({
  name: "editable",
  addProseMirrorPlugins() {
    return [
      new pe({
        key: new fe("editable"),
        props: {
          editable: () => this.editor.options.editable
        }
      })
    ];
  }
});
const Ns = new fe("focusEvents");
G.create({
  name: "focusEvents",
  addProseMirrorPlugins() {
    const { editor: r } = this;
    return [
      new pe({
        key: Ns,
        props: {
          handleDOMEvents: {
            focus: (e, t) => {
              r.isFocused = !0;
              const n = r.state.tr.setMeta("focus", { event: t }).setMeta("addToHistory", !1);
              return e.dispatch(n), !1;
            },
            blur: (e, t) => {
              r.isFocused = !1;
              const n = r.state.tr.setMeta("blur", { event: t }).setMeta("addToHistory", !1);
              return e.dispatch(n), !1;
            }
          }
        }
      })
    ];
  }
});
G.create({
  name: "keymap",
  addKeyboardShortcuts() {
    const r = () => this.editor.commands.first(({ commands: o }) => [
      () => o.undoInputRule(),
      // maybe convert first text block node to default node
      () => o.command(({ tr: s }) => {
        const { selection: l, doc: c } = s, { empty: h, $anchor: u } = l, { pos: p, parent: f } = u, b = u.parent.isTextblock && p > 0 ? s.doc.resolve(p - 1) : u, m = b.parent.type.spec.isolating, y = u.pos - u.parentOffset, w = m && b.parent.childCount === 1 ? y === u.pos : C.atStart(c).from === p;
        return !h || !f.type.isTextblock || f.textContent.length || !w || w && u.parent.type.name === "paragraph" ? !1 : o.clearNodes();
      }),
      () => o.deleteSelection(),
      () => o.joinBackward(),
      () => o.selectNodeBackward()
    ]), e = () => this.editor.commands.first(({ commands: o }) => [
      () => o.deleteSelection(),
      () => o.deleteCurrentNode(),
      () => o.joinForward(),
      () => o.selectNodeForward()
    ]), n = {
      Enter: () => this.editor.commands.first(({ commands: o }) => [
        () => o.newlineInCode(),
        () => o.createParagraphNear(),
        () => o.liftEmptyBlock(),
        () => o.splitBlock()
      ]),
      "Mod-Enter": () => this.editor.commands.exitCode(),
      Backspace: r,
      "Mod-Backspace": r,
      "Shift-Backspace": r,
      Delete: e,
      "Mod-Delete": e,
      "Mod-a": () => this.editor.commands.selectAll()
    }, i = {
      ...n
    }, a = {
      ...n,
      "Ctrl-h": r,
      "Alt-Backspace": r,
      "Ctrl-d": e,
      "Ctrl-Alt-Backspace": e,
      "Alt-Delete": e,
      "Alt-d": e,
      "Ctrl-a": () => this.editor.commands.selectTextblockStart(),
      "Ctrl-e": () => this.editor.commands.selectTextblockEnd()
    };
    return He() || Or() ? a : i;
  },
  addProseMirrorPlugins() {
    return [
      // With this plugin we check if the whole document was selected and deleted.
      // In this case we will additionally call `clearNodes()` to convert e.g. a heading
      // to a paragraph if necessary.
      // This is an alternative to ProseMirror's `AllSelection`, which doesn’t work well
      // with many other commands.
      new pe({
        key: new fe("clearDocument"),
        appendTransaction: (r, e, t) => {
          if (r.some((m) => m.getMeta("composition")))
            return;
          const n = r.some((m) => m.docChanged) && !e.doc.eq(t.doc), i = r.some((m) => m.getMeta("preventClearDocument"));
          if (!n || i)
            return;
          const { empty: a, from: o, to: s } = e.selection, l = C.atStart(e.doc).from, c = C.atEnd(e.doc).to;
          if (a || !(o === l && s === c) || !Fr(t.doc))
            return;
          const p = t.tr, f = Mr({
            state: t,
            transaction: p
          }), { commands: b } = new Qa({
            editor: this.editor,
            state: f
          });
          if (b.clearNodes(), !!p.steps.length)
            return p;
        }
      })
    ];
  }
});
G.create({
  name: "paste",
  addProseMirrorPlugins() {
    return [
      new pe({
        key: new fe("tiptapPaste"),
        props: {
          handlePaste: (r, e, t) => {
            this.editor.emit("paste", {
              editor: this.editor,
              event: e,
              slice: t
            });
          }
        }
      })
    ];
  }
});
G.create({
  name: "tabindex",
  addProseMirrorPlugins() {
    return [
      new pe({
        key: new fe("tabindex"),
        props: {
          attributes: () => this.editor.isEditable ? { tabindex: "0" } : {}
        }
      })
    ];
  }
});
class at {
  constructor(e = {}) {
    this.type = "node", this.name = "node", this.parent = null, this.child = null, this.config = {
      name: this.name,
      defaultOptions: {}
    }, this.config = {
      ...this.config,
      ...e
    }, this.name = this.config.name, e.defaultOptions && Object.keys(e.defaultOptions).length > 0 && console.warn(`[tiptap warn]: BREAKING CHANGE: "defaultOptions" is deprecated. Please use "addOptions" instead. Found in extension: "${this.name}".`), this.options = this.config.defaultOptions, this.config.addOptions && (this.options = X(J(this, "addOptions", {
      name: this.name
    }))), this.storage = X(J(this, "addStorage", {
      name: this.name,
      options: this.options
    })) || {};
  }
  static create(e = {}) {
    return new at(e);
  }
  configure(e = {}) {
    const t = this.extend({
      ...this.config,
      addOptions: () => jt(this.options, e)
    });
    return t.name = this.name, t.parent = this.parent, t;
  }
  extend(e = {}) {
    const t = new at(e);
    return t.parent = this, this.child = t, t.name = e.name ? e.name : t.parent.name, e.defaultOptions && Object.keys(e.defaultOptions).length > 0 && console.warn(`[tiptap warn]: BREAKING CHANGE: "defaultOptions" is deprecated. Please use "addOptions" instead. Found in extension: "${t.name}".`), t.options = X(J(t, "addOptions", {
      name: t.name
    })), t.storage = X(J(t, "addStorage", {
      name: t.name,
      options: t.options
    })), t;
  }
}
let Es = class {
  constructor(e, t, n) {
    this.isDragging = !1, this.component = e, this.editor = t.editor, this.options = {
      stopEvent: null,
      ignoreMutation: null,
      ...n
    }, this.extension = t.extension, this.node = t.node, this.decorations = t.decorations, this.innerDecorations = t.innerDecorations, this.view = t.view, this.HTMLAttributes = t.HTMLAttributes, this.getPos = t.getPos, this.mount();
  }
  mount() {
  }
  get dom() {
    return this.editor.view.dom;
  }
  get contentDOM() {
    return null;
  }
  onDragStart(e) {
    var t, n, i, a, o, s, l;
    const { view: c } = this.editor, h = e.target, u = h.nodeType === 3 ? (t = h.parentElement) === null || t === void 0 ? void 0 : t.closest("[data-drag-handle]") : h.closest("[data-drag-handle]");
    if (!this.dom || !((n = this.contentDOM) === null || n === void 0) && n.contains(h) || !u)
      return;
    let p = 0, f = 0;
    if (this.dom !== u) {
      const k = this.dom.getBoundingClientRect(), S = u.getBoundingClientRect(), M = (i = e.offsetX) !== null && i !== void 0 ? i : (a = e.nativeEvent) === null || a === void 0 ? void 0 : a.offsetX, O = (o = e.offsetY) !== null && o !== void 0 ? o : (s = e.nativeEvent) === null || s === void 0 ? void 0 : s.offsetY;
      p = S.x - k.x + M, f = S.y - k.y + O;
    }
    const b = this.dom.cloneNode(!0);
    (l = e.dataTransfer) === null || l === void 0 || l.setDragImage(b, p, f);
    const m = this.getPos();
    if (typeof m != "number")
      return;
    const y = N.create(c.state.doc, m), w = c.state.tr.setSelection(y);
    c.dispatch(w);
  }
  stopEvent(e) {
    var t;
    if (!this.dom)
      return !1;
    if (typeof this.options.stopEvent == "function")
      return this.options.stopEvent({ event: e });
    const n = e.target;
    if (!(this.dom.contains(n) && !(!((t = this.contentDOM) === null || t === void 0) && t.contains(n))))
      return !1;
    const a = e.type.startsWith("drag"), o = e.type === "drop";
    if ((["INPUT", "BUTTON", "SELECT", "TEXTAREA"].includes(n.tagName) || n.isContentEditable) && !o && !a)
      return !0;
    const { isEditable: l } = this.editor, { isDragging: c } = this, h = !!this.node.type.spec.draggable, u = N.isSelectable(this.node), p = e.type === "copy", f = e.type === "paste", b = e.type === "cut", m = e.type === "mousedown";
    if (!h && u && a && e.target === this.dom && e.preventDefault(), h && a && !c && e.target === this.dom)
      return e.preventDefault(), !1;
    if (h && l && !c && m) {
      const y = n.closest("[data-drag-handle]");
      y && (this.dom === y || this.dom.contains(y)) && (this.isDragging = !0, document.addEventListener("dragend", () => {
        this.isDragging = !1;
      }, { once: !0 }), document.addEventListener("drop", () => {
        this.isDragging = !1;
      }, { once: !0 }), document.addEventListener("mouseup", () => {
        this.isDragging = !1;
      }, { once: !0 }));
    }
    return !(c || o || p || f || b || m && u);
  }
  /**
   * Called when a DOM [mutation](https://developer.mozilla.org/en-US/docs/Web/API/MutationObserver) or a selection change happens within the view.
   * @return `false` if the editor should re-read the selection or re-parse the range around the mutation
   * @return `true` if it can safely be ignored.
   */
  ignoreMutation(e) {
    return !this.dom || !this.contentDOM ? !0 : typeof this.options.ignoreMutation == "function" ? this.options.ignoreMutation({ mutation: e }) : this.node.isLeaf || this.node.isAtom ? !0 : e.type === "selection" || this.dom.contains(e.target) && e.type === "childList" && (He() || Nt()) && this.editor.isFocused && [
      ...Array.from(e.addedNodes),
      ...Array.from(e.removedNodes)
    ].every((n) => n.isContentEditable) ? !1 : this.contentDOM === e.target && e.type === "attributes" ? !0 : !this.contentDOM.contains(e.target);
  }
  /**
   * Update the attributes of the prosemirror node.
   */
  updateAttributes(e) {
    this.editor.commands.command(({ tr: t }) => {
      const n = this.getPos();
      return typeof n != "number" ? !1 : (t.setNodeMarkup(n, void 0, {
        ...this.node.attrs,
        ...e
      }), !0);
    });
  }
  /**
   * Delete the node.
   */
  deleteNode() {
    const e = this.getPos();
    if (typeof e != "number")
      return;
    const t = e + this.node.nodeSize;
    this.editor.commands.deleteRange({ from: e, to: t });
  }
};
var Hr = { exports: {} }, yt = {};
/**
 * @license React
 * use-sync-external-store-shim.production.min.js
 *
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
var An;
function As() {
  if (An) return yt;
  An = 1;
  var r = R;
  function e(u, p) {
    return u === p && (u !== 0 || 1 / u === 1 / p) || u !== u && p !== p;
  }
  var t = typeof Object.is == "function" ? Object.is : e, n = r.useState, i = r.useEffect, a = r.useLayoutEffect, o = r.useDebugValue;
  function s(u, p) {
    var f = p(), b = n({ inst: { value: f, getSnapshot: p } }), m = b[0].inst, y = b[1];
    return a(function() {
      m.value = f, m.getSnapshot = p, l(m) && y({ inst: m });
    }, [u, f, p]), i(function() {
      return l(m) && y({ inst: m }), u(function() {
        l(m) && y({ inst: m });
      });
    }, [u]), o(f), f;
  }
  function l(u) {
    var p = u.getSnapshot;
    u = u.value;
    try {
      var f = p();
      return !t(u, f);
    } catch {
      return !0;
    }
  }
  function c(u, p) {
    return p();
  }
  var h = typeof window > "u" || typeof window.document > "u" || typeof window.document.createElement > "u" ? c : s;
  return yt.useSyncExternalStore = r.useSyncExternalStore !== void 0 ? r.useSyncExternalStore : h, yt;
}
Hr.exports = As();
var jr = Hr.exports;
const Ts = (...r) => (e) => {
  r.forEach((t) => {
    typeof t == "function" ? t(e) : t && (t.current = e);
  });
}, Ms = ({ contentComponent: r }) => {
  const e = jr.useSyncExternalStore(r.subscribe, r.getSnapshot, r.getServerSnapshot);
  return R.createElement(R.Fragment, null, Object.values(e));
};
function zs() {
  const r = /* @__PURE__ */ new Set();
  let e = {};
  return {
    /**
     * Subscribe to the editor instance's changes.
     */
    subscribe(t) {
      return r.add(t), () => {
        r.delete(t);
      };
    },
    getSnapshot() {
      return e;
    },
    getServerSnapshot() {
      return e;
    },
    /**
     * Adds a new NodeView Renderer to the editor.
     */
    setRenderer(t, n) {
      e = {
        ...e,
        [t]: oi.createPortal(n.reactElement, n.element, t)
      }, r.forEach((i) => i());
    },
    /**
     * Removes a NodeView Renderer from the editor.
     */
    removeRenderer(t) {
      const n = { ...e };
      delete n[t], e = n, r.forEach((i) => i());
    }
  };
}
class Is extends R.Component {
  constructor(e) {
    var t;
    super(e), this.editorContentRef = R.createRef(), this.initialized = !1, this.state = {
      hasContentComponentInitialized: !!(!((t = e.editor) === null || t === void 0) && t.contentComponent)
    };
  }
  componentDidMount() {
    this.init();
  }
  componentDidUpdate() {
    this.init();
  }
  init() {
    const e = this.props.editor;
    if (e && !e.isDestroyed && e.options.element) {
      if (e.contentComponent)
        return;
      const t = this.editorContentRef.current;
      t.append(...e.options.element.childNodes), e.setOptions({
        element: t
      }), e.contentComponent = zs(), this.state.hasContentComponentInitialized || (this.unsubscribeToContentComponent = e.contentComponent.subscribe(() => {
        this.setState((n) => n.hasContentComponentInitialized ? n : {
          hasContentComponentInitialized: !0
        }), this.unsubscribeToContentComponent && this.unsubscribeToContentComponent();
      })), e.createNodeViews(), this.initialized = !0;
    }
  }
  componentWillUnmount() {
    const e = this.props.editor;
    if (!e || (this.initialized = !1, e.isDestroyed || e.view.setProps({
      nodeViews: {}
    }), this.unsubscribeToContentComponent && this.unsubscribeToContentComponent(), e.contentComponent = null, !e.options.element.firstChild))
      return;
    const t = document.createElement("div");
    t.append(...e.options.element.childNodes), e.setOptions({
      element: t
    });
  }
  render() {
    const { editor: e, innerRef: t, ...n } = this.props;
    return R.createElement(
      R.Fragment,
      null,
      R.createElement("div", { ref: Ts(t, this.editorContentRef), ...n }),
      (e == null ? void 0 : e.contentComponent) && R.createElement(Ms, { contentComponent: e.contentComponent })
    );
  }
}
const Rs = At((r, e) => {
  const t = R.useMemo(() => Math.floor(Math.random() * 4294967295).toString(), [r.editor]);
  return R.createElement(Is, {
    key: t,
    innerRef: e,
    ...r
  });
});
R.memo(Rs);
var wt = {};
/**
 * @license React
 * use-sync-external-store-shim/with-selector.production.min.js
 *
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
var Tn;
function Ls() {
  if (Tn) return wt;
  Tn = 1;
  var r = R, e = jr;
  function t(c, h) {
    return c === h && (c !== 0 || 1 / c === 1 / h) || c !== c && h !== h;
  }
  var n = typeof Object.is == "function" ? Object.is : t, i = e.useSyncExternalStore, a = r.useRef, o = r.useEffect, s = r.useMemo, l = r.useDebugValue;
  return wt.useSyncExternalStoreWithSelector = function(c, h, u, p, f) {
    var b = a(null);
    if (b.current === null) {
      var m = { hasValue: !1, value: null };
      b.current = m;
    } else m = b.current;
    b = s(function() {
      function w(z) {
        if (!k) {
          if (k = !0, S = z, z = p(z), f !== void 0 && m.hasValue) {
            var $ = m.value;
            if (f($, z)) return M = $;
          }
          return M = z;
        }
        if ($ = M, n(S, z)) return $;
        var _ = p(z);
        return f !== void 0 && f($, _) ? $ : (S = z, M = _);
      }
      var k = !1, S, M, O = u === void 0 ? null : u;
      return [function() {
        return w(h());
      }, O === null ? void 0 : function() {
        return w(O());
      }];
    }, [h, u, p, f]);
    var y = i(c, b[0], b[1]);
    return o(function() {
      m.hasValue = !0, m.value = y;
    }, [y]), l(y), y;
  }, wt;
}
Ls();
const Ps = On({
  editor: null
});
Ps.Consumer;
const $r = On({
  onDragStart: void 0
}), Os = () => ai($r), Ut = R.forwardRef((r, e) => {
  const { onDragStart: t } = Os(), n = r.as || "div";
  return (
    // @ts-ignore
    R.createElement(n, { ...r, ref: e, "data-node-view-wrapper": "", onDragStart: t, style: {
      whiteSpace: "normal",
      ...r.style
    } })
  );
});
function Mn(r) {
  return !!(typeof r == "function" && r.prototype && r.prototype.isReactComponent);
}
function zn(r) {
  return !!(typeof r == "object" && r.$$typeof && (r.$$typeof.toString() === "Symbol(react.forward_ref)" || r.$$typeof.description === "react.forward_ref"));
}
function Bs(r) {
  return !!(typeof r == "object" && r.$$typeof && (r.$$typeof.toString() === "Symbol(react.memo)" || r.$$typeof.description === "react.memo"));
}
function Fs(r) {
  if (Mn(r) || zn(r))
    return !0;
  if (Bs(r)) {
    const e = r.type;
    if (e)
      return Mn(e) || zn(e);
  }
  return !1;
}
function Hs() {
  try {
    if (Yt)
      return parseInt(Yt.split(".")[0], 10) >= 19;
  } catch {
  }
  return !1;
}
class js {
  /**
   * Immediately creates element and renders the provided React component.
   */
  constructor(e, { editor: t, props: n = {}, as: i = "div", className: a = "" }) {
    this.ref = null, this.id = Math.floor(Math.random() * 4294967295).toString(), this.component = e, this.editor = t, this.props = n, this.element = document.createElement(i), this.element.classList.add("react-renderer"), a && this.element.classList.add(...a.split(" ")), this.editor.isInitialized ? si(() => {
      this.render();
    }) : queueMicrotask(() => {
      this.render();
    });
  }
  /**
   * Render the React component.
   */
  render() {
    var e;
    const t = this.component, n = this.props, i = this.editor, a = Hs(), o = Fs(t), s = { ...n };
    s.ref && !(a || o) && delete s.ref, !s.ref && (a || o) && (s.ref = (l) => {
      this.ref = l;
    }), this.reactElement = R.createElement(t, { ...s }), (e = i == null ? void 0 : i.contentComponent) === null || e === void 0 || e.setRenderer(this.id, this);
  }
  /**
   * Re-renders the React component with new props.
   */
  updateProps(e = {}) {
    this.props = {
      ...this.props,
      ...e
    }, this.render();
  }
  /**
   * Destroy the React component.
   */
  destroy() {
    var e;
    const t = this.editor;
    (e = t == null ? void 0 : t.contentComponent) === null || e === void 0 || e.removeRenderer(this.id);
  }
  /**
   * Update the attributes of the element that holds the React component.
   */
  updateAttributes(e) {
    Object.keys(e).forEach((t) => {
      this.element.setAttribute(t, e[t]);
    });
  }
}
class $s extends Es {
  constructor(e, t, n) {
    if (super(e, t, n), !this.node.isLeaf) {
      this.options.contentDOMElementTag ? this.contentDOMElement = document.createElement(this.options.contentDOMElementTag) : this.contentDOMElement = document.createElement(this.node.isInline ? "span" : "div"), this.contentDOMElement.dataset.nodeViewContentReact = "", this.contentDOMElement.dataset.nodeViewWrapper = "", this.contentDOMElement.style.whiteSpace = "inherit";
      const i = this.dom.querySelector("[data-node-view-content]");
      if (!i)
        return;
      i.appendChild(this.contentDOMElement);
    }
  }
  /**
   * Setup the React component.
   * Called on initialization.
   */
  mount() {
    const e = {
      editor: this.editor,
      node: this.node,
      decorations: this.decorations,
      innerDecorations: this.innerDecorations,
      view: this.view,
      selected: !1,
      extension: this.extension,
      HTMLAttributes: this.HTMLAttributes,
      getPos: () => this.getPos(),
      updateAttributes: (c = {}) => this.updateAttributes(c),
      deleteNode: () => this.deleteNode(),
      ref: ri()
    };
    if (!this.component.displayName) {
      const c = (h) => h.charAt(0).toUpperCase() + h.substring(1);
      this.component.displayName = c(this.extension.name);
    }
    const i = { onDragStart: this.onDragStart.bind(this), nodeViewContentRef: (c) => {
      c && this.contentDOMElement && c.firstChild !== this.contentDOMElement && (c.hasAttribute("data-node-view-wrapper") && c.removeAttribute("data-node-view-wrapper"), c.appendChild(this.contentDOMElement));
    } }, a = this.component, o = ii((c) => R.createElement($r.Provider, { value: i }, Ze(a, c)));
    o.displayName = "ReactNodeView";
    let s = this.node.isInline ? "span" : "div";
    this.options.as && (s = this.options.as);
    const { className: l = "" } = this.options;
    this.handleSelectionUpdate = this.handleSelectionUpdate.bind(this), this.renderer = new js(o, {
      editor: this.editor,
      props: e,
      as: s,
      className: `node-${this.node.type.name} ${l}`.trim()
    }), this.editor.on("selectionUpdate", this.handleSelectionUpdate), this.updateElementAttributes();
  }
  /**
   * Return the DOM element.
   * This is the element that will be used to display the node view.
   */
  get dom() {
    var e;
    if (this.renderer.element.firstElementChild && !(!((e = this.renderer.element.firstElementChild) === null || e === void 0) && e.hasAttribute("data-node-view-wrapper")))
      throw Error("Please use the NodeViewWrapper component for your node view.");
    return this.renderer.element;
  }
  /**
   * Return the content DOM element.
   * This is the element that will be used to display the rich-text content of the node.
   */
  get contentDOM() {
    return this.node.isLeaf ? null : this.contentDOMElement;
  }
  /**
   * On editor selection update, check if the node is selected.
   * If it is, call `selectNode`, otherwise call `deselectNode`.
   */
  handleSelectionUpdate() {
    const { from: e, to: t } = this.editor.state.selection, n = this.getPos();
    if (typeof n == "number")
      if (e <= n && t >= n + this.node.nodeSize) {
        if (this.renderer.props.selected)
          return;
        this.selectNode();
      } else {
        if (!this.renderer.props.selected)
          return;
        this.deselectNode();
      }
  }
  /**
   * On update, update the React component.
   * To prevent unnecessary updates, the `update` option can be used.
   */
  update(e, t, n) {
    const i = (a) => {
      this.renderer.updateProps(a), typeof this.options.attrs == "function" && this.updateElementAttributes();
    };
    if (e.type !== this.node.type)
      return !1;
    if (typeof this.options.update == "function") {
      const a = this.node, o = this.decorations, s = this.innerDecorations;
      return this.node = e, this.decorations = t, this.innerDecorations = n, this.options.update({
        oldNode: a,
        oldDecorations: o,
        newNode: e,
        newDecorations: t,
        oldInnerDecorations: s,
        innerDecorations: n,
        updateProps: () => i({ node: e, decorations: t, innerDecorations: n })
      });
    }
    return e === this.node && this.decorations === t && this.innerDecorations === n || (this.node = e, this.decorations = t, this.innerDecorations = n, i({ node: e, decorations: t, innerDecorations: n })), !0;
  }
  /**
   * Select the node.
   * Add the `selected` prop and the `ProseMirror-selectednode` class.
   */
  selectNode() {
    this.renderer.updateProps({
      selected: !0
    }), this.renderer.element.classList.add("ProseMirror-selectednode");
  }
  /**
   * Deselect the node.
   * Remove the `selected` prop and the `ProseMirror-selectednode` class.
   */
  deselectNode() {
    this.renderer.updateProps({
      selected: !1
    }), this.renderer.element.classList.remove("ProseMirror-selectednode");
  }
  /**
   * Destroy the React component instance.
   */
  destroy() {
    this.renderer.destroy(), this.editor.off("selectionUpdate", this.handleSelectionUpdate), this.contentDOMElement = null;
  }
  /**
   * Update the attributes of the top-level element that holds the React component.
   * Applying the attributes defined in the `attrs` option.
   */
  updateElementAttributes() {
    if (this.options.attrs) {
      let e = {};
      if (typeof this.options.attrs == "function") {
        const t = this.editor.extensionManager.attributes, n = to(this.node, t);
        e = this.options.attrs({ node: this.node, HTMLAttributes: n });
      } else
        e = this.options.attrs;
      this.renderer.updateAttributes(e);
    }
  }
}
function Ds(r, e) {
  return (t) => t.editor.contentComponent ? new $s(r, t, e) : {};
}
const Us = "magazine";
function Vs(r) {
  if (r == null) return "";
  try {
    const e = JSON.stringify(r);
    return typeof window > "u" ? Buffer.from(e, "utf-8").toString("base64") : window.btoa(unescape(encodeURIComponent(e)));
  } catch {
    return "";
  }
}
function Me(r, e) {
  if (!r || typeof r != "string") return e;
  try {
    let t;
    return typeof window > "u" ? t = Buffer.from(r, "base64").toString("utf-8") : t = decodeURIComponent(escape(window.atob(r))), JSON.parse(t);
  } catch {
    return e;
  }
}
function Dr(r) {
  return `magazine${r.charAt(0).toUpperCase()}${r.slice(1)}`;
}
function F(r) {
  return typeof r != "string" ? "" : r.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}
function H(r) {
  return typeof r != "string" ? "" : r.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}
function Vt({
  subId: r,
  defaultAttrs: e,
  view: t
}) {
  const n = `${Us}/${r}`, i = Dr(r.replace(/-([a-z])/g, (a, o) => o.toUpperCase()));
  return at.create({
    name: i,
    group: "block",
    atom: !0,
    selectable: !0,
    draggable: !0,
    addAttributes() {
      return {
        attrs: {
          default: e,
          parseHTML: (a) => Me(a.getAttribute("data-attrs") ?? "", e),
          renderHTML: (a) => ({
            "data-attrs": Vs(a.attrs ?? e)
          })
        }
      };
    },
    parseHTML() {
      return [{ tag: `div[data-cms-block="${n}"]` }];
    },
    renderHTML({ HTMLAttributes: a }) {
      return [
        "div",
        zr(a, { "data-cms-block": n })
      ];
    },
    addNodeView() {
      return Ds((a) => {
        const o = a.node.attrs.attrs ?? e;
        return /* @__PURE__ */ d(t, { attrs: o, updateAttrs: (l) => {
          a.updateAttributes({ attrs: { ...o, ...l } });
        }, selected: a.selected });
      });
    }
  });
}
function qt(r) {
  return Dr(r.replace(/-([a-z])/g, (e, t) => t.toUpperCase()));
}
const _t = "hero-split", ze = qt(_t), Ur = {
  featuredPostId: "latest",
  secondary1PostId: "auto",
  secondary2PostId: "auto",
  showCategory: !0,
  showAuthor: !0,
  showFeaturedBadge: !0
};
function qs({ attrs: r, selected: e }) {
  const { t } = q("theme-magazine"), { posts: n } = Ln("post");
  function i(a, o) {
    var s;
    return !a || a === "latest" || a === "auto" ? t(o) : ((s = n.find((l) => l.id === a)) == null ? void 0 : s.title) ?? t("blocks.unknownPost");
  }
  return /* @__PURE__ */ d(
    Ut,
    {
      contentEditable: !1,
      className: "my-4 rounded-lg border border-dashed border-surface-300 bg-surface-50 p-4 dark:border-surface-600 dark:bg-surface-900 " + (e ? "ring-2 ring-blue-500/60" : ""),
      children: /* @__PURE__ */ g("div", { className: "flex items-start gap-3", children: [
        /* @__PURE__ */ d(Vn, { className: "h-5 w-5 shrink-0 text-blue-500" }),
        /* @__PURE__ */ g("div", { className: "min-w-0 flex-1 space-y-1", children: [
          /* @__PURE__ */ d("p", { className: "text-xs font-semibold uppercase tracking-wide text-surface-500 dark:text-surface-400", children: t("blocks.magazineHero.title") }),
          /* @__PURE__ */ g("p", { className: "text-sm text-surface-900 dark:text-surface-50 truncate", children: [
            /* @__PURE__ */ d("span", { className: "font-medium", children: "1." }),
            " ",
            i(r.featuredPostId, "blocks.magazineHero.latestLabel")
          ] }),
          /* @__PURE__ */ g("p", { className: "text-xs text-surface-700 dark:text-surface-200 truncate", children: [
            /* @__PURE__ */ d("span", { className: "font-medium", children: "2." }),
            " ",
            i(r.secondary1PostId, "blocks.magazineHero.autoLabel")
          ] }),
          /* @__PURE__ */ g("p", { className: "text-xs text-surface-700 dark:text-surface-200 truncate", children: [
            /* @__PURE__ */ d("span", { className: "font-medium", children: "3." }),
            " ",
            i(r.secondary2PostId, "blocks.magazineHero.autoLabel")
          ] })
        ] })
      ] })
    }
  );
}
function _s({ editor: r }) {
  const { t: e } = q("theme-magazine"), { posts: t } = Ln("post"), n = r.getAttributes(ze), i = { ...Ur, ...n.attrs ?? {} };
  function a(s) {
    r.chain().updateAttributes(ze, { attrs: { ...i, ...s } }).run();
  }
  const o = t.filter((s) => s.status === "online").sort((s, l) => ne(l) - ne(s));
  return /* @__PURE__ */ g("div", { className: "space-y-3", children: [
    /* @__PURE__ */ g("div", { children: [
      /* @__PURE__ */ d("label", { className: "label", children: e("blocks.magazineHero.featured") }),
      /* @__PURE__ */ g(
        "select",
        {
          className: "input",
          value: i.featuredPostId ?? "latest",
          onChange: (s) => a({ featuredPostId: s.target.value }),
          children: [
            /* @__PURE__ */ d("option", { value: "latest", children: e("blocks.magazineHero.latestLabel") }),
            o.map((s) => /* @__PURE__ */ d("option", { value: s.id, children: s.title || "(untitled)" }, s.id))
          ]
        }
      )
    ] }),
    /* @__PURE__ */ g("div", { children: [
      /* @__PURE__ */ d("label", { className: "label", children: e("blocks.magazineHero.secondary1") }),
      /* @__PURE__ */ g(
        "select",
        {
          className: "input",
          value: i.secondary1PostId ?? "auto",
          onChange: (s) => a({ secondary1PostId: s.target.value }),
          children: [
            /* @__PURE__ */ d("option", { value: "auto", children: e("blocks.magazineHero.autoLabel") }),
            o.map((s) => /* @__PURE__ */ d("option", { value: s.id, children: s.title || "(untitled)" }, s.id))
          ]
        }
      )
    ] }),
    /* @__PURE__ */ g("div", { children: [
      /* @__PURE__ */ d("label", { className: "label", children: e("blocks.magazineHero.secondary2") }),
      /* @__PURE__ */ g(
        "select",
        {
          className: "input",
          value: i.secondary2PostId ?? "auto",
          onChange: (s) => a({ secondary2PostId: s.target.value }),
          children: [
            /* @__PURE__ */ d("option", { value: "auto", children: e("blocks.magazineHero.autoLabel") }),
            o.map((s) => /* @__PURE__ */ d("option", { value: s.id, children: s.title || "(untitled)" }, s.id))
          ]
        }
      )
    ] }),
    /* @__PURE__ */ g("label", { className: "flex items-center gap-2 text-sm", children: [
      /* @__PURE__ */ d(
        "input",
        {
          type: "checkbox",
          checked: i.showCategory ?? !0,
          onChange: (s) => a({ showCategory: s.target.checked })
        }
      ),
      /* @__PURE__ */ d("span", { children: e("blocks.magazineHero.showCategory") })
    ] }),
    /* @__PURE__ */ g("label", { className: "flex items-center gap-2 text-sm", children: [
      /* @__PURE__ */ d(
        "input",
        {
          type: "checkbox",
          checked: i.showAuthor ?? !0,
          onChange: (s) => a({ showAuthor: s.target.checked })
        }
      ),
      /* @__PURE__ */ d("span", { children: e("blocks.magazineHero.showAuthor") })
    ] }),
    /* @__PURE__ */ g("label", { className: "flex items-center gap-2 text-sm", children: [
      /* @__PURE__ */ d(
        "input",
        {
          type: "checkbox",
          checked: i.showFeaturedBadge ?? !0,
          onChange: (s) => a({ showFeaturedBadge: s.target.checked })
        }
      ),
      /* @__PURE__ */ d("span", { children: e("blocks.magazineHero.showFeaturedBadge") })
    ] })
  ] });
}
const Ws = Vt({
  subId: _t,
  defaultAttrs: Ur,
  view: qs
}), Js = {
  id: `magazine/${_t}`,
  nodeName: ze,
  titleKey: "blocks.magazineHero.title",
  namespace: "theme-magazine",
  icon: Vn,
  category: "layout",
  extensions: [Ws],
  insert: (r) => {
    r.focus().insertContent({ type: ze }).run();
  },
  isActive: (r) => r.isActive(ze),
  inspector: (r) => /* @__PURE__ */ d(_s, { editor: r.editor })
}, Wt = "most-read", Ie = qt(Wt), Vr = {
  count: 4,
  source: "latest",
  showHeading: !0
};
function Gs({ attrs: r, selected: e }) {
  const { t } = q("theme-magazine");
  return /* @__PURE__ */ d(
    Ut,
    {
      contentEditable: !1,
      className: "my-4 rounded-lg border border-dashed border-surface-300 bg-surface-50 p-4 dark:border-surface-600 dark:bg-surface-900 " + (e ? "ring-2 ring-blue-500/60" : ""),
      children: /* @__PURE__ */ g("div", { className: "flex items-start gap-3", children: [
        /* @__PURE__ */ d(Dn, { className: "h-5 w-5 shrink-0 text-blue-500" }),
        /* @__PURE__ */ g("div", { className: "min-w-0 flex-1", children: [
          /* @__PURE__ */ d("p", { className: "text-xs font-semibold uppercase tracking-wide text-surface-500 dark:text-surface-400", children: t("blocks.mostRead.title") }),
          /* @__PURE__ */ d("p", { className: "text-sm text-surface-900 dark:text-surface-50", children: t("blocks.mostRead.preview", { count: r.count ?? 4 }) })
        ] })
      ] })
    }
  );
}
function Ks({ editor: r }) {
  const { t: e } = q("theme-magazine"), t = r.getAttributes(Ie), n = { ...Vr, ...t.attrs ?? {} };
  function i(a) {
    r.chain().updateAttributes(Ie, { attrs: { ...n, ...a } }).run();
  }
  return /* @__PURE__ */ g("div", { className: "space-y-3", children: [
    /* @__PURE__ */ g("div", { children: [
      /* @__PURE__ */ d("label", { className: "label", children: e("blocks.mostRead.count") }),
      /* @__PURE__ */ d(
        "input",
        {
          type: "number",
          className: "input max-w-xs",
          min: 1,
          max: 10,
          value: n.count ?? 4,
          onChange: (a) => i({ count: Math.max(1, Math.min(10, Number.parseInt(a.target.value, 10) || 4)) })
        }
      )
    ] }),
    /* @__PURE__ */ g("label", { className: "flex items-center gap-2 text-sm", children: [
      /* @__PURE__ */ d(
        "input",
        {
          type: "checkbox",
          checked: n.showHeading ?? !0,
          onChange: (a) => i({ showHeading: a.target.checked })
        }
      ),
      /* @__PURE__ */ d("span", { children: e("blocks.mostRead.showHeading") })
    ] })
  ] });
}
const Zs = Vt({
  subId: Wt,
  defaultAttrs: Vr,
  view: Gs
}), Ys = {
  id: `magazine/${Wt}`,
  nodeName: Ie,
  titleKey: "blocks.mostRead.title",
  namespace: "theme-magazine",
  icon: Dn,
  category: "layout",
  extensions: [Zs],
  insert: (r) => {
    r.focus().insertContent({ type: Ie }).run();
  },
  isActive: (r) => r.isActive(Ie),
  inspector: (r) => /* @__PURE__ */ d(Ks, { editor: r.editor })
}, Jt = "promo-card", Re = qt(Jt), qr = {
  imageUrl: "",
  imageAlt: "",
  title: "",
  eyebrow: "",
  href: ""
};
function Xs({ attrs: r, selected: e }) {
  const { t } = q("theme-magazine");
  return /* @__PURE__ */ d(
    Ut,
    {
      contentEditable: !1,
      className: "my-4 rounded-lg border border-dashed border-surface-300 bg-surface-50 p-4 dark:border-surface-600 dark:bg-surface-900 " + (e ? "ring-2 ring-blue-500/60" : ""),
      children: /* @__PURE__ */ g("div", { className: "flex items-start gap-3", children: [
        /* @__PURE__ */ d(Un, { className: "h-5 w-5 shrink-0 text-blue-500" }),
        /* @__PURE__ */ g("div", { className: "min-w-0 flex-1", children: [
          /* @__PURE__ */ d("p", { className: "text-xs font-semibold uppercase tracking-wide text-surface-500 dark:text-surface-400", children: t("blocks.promoCard.title") }),
          /* @__PURE__ */ d("p", { className: "text-sm text-surface-900 dark:text-surface-50 truncate", children: r.title || t("blocks.promoCard.untitled") })
        ] })
      ] })
    }
  );
}
function Qs({ editor: r }) {
  const { t: e } = q("theme-magazine"), t = r.getAttributes(Re), n = { ...qr, ...t.attrs ?? {} };
  function i(a) {
    r.chain().updateAttributes(Re, { attrs: { ...n, ...a } }).run();
  }
  return /* @__PURE__ */ g("div", { className: "space-y-3", children: [
    /* @__PURE__ */ g("div", { children: [
      /* @__PURE__ */ d("label", { className: "label", children: e("blocks.promoCard.imageUrl") }),
      /* @__PURE__ */ d(
        "input",
        {
          type: "url",
          className: "input",
          placeholder: "https://…",
          value: n.imageUrl ?? "",
          onChange: (a) => i({ imageUrl: a.target.value })
        }
      ),
      /* @__PURE__ */ d("p", { className: "text-xs text-surface-500 mt-1 dark:text-surface-400", children: e("blocks.promoCard.imageUrlHelp") })
    ] }),
    /* @__PURE__ */ g("div", { children: [
      /* @__PURE__ */ d("label", { className: "label", children: e("blocks.promoCard.imageAlt") }),
      /* @__PURE__ */ d(
        "input",
        {
          type: "text",
          className: "input",
          value: n.imageAlt ?? "",
          onChange: (a) => i({ imageAlt: a.target.value })
        }
      )
    ] }),
    /* @__PURE__ */ g("div", { children: [
      /* @__PURE__ */ d("label", { className: "label", children: e("blocks.promoCard.eyebrow") }),
      /* @__PURE__ */ d(
        "input",
        {
          type: "text",
          className: "input",
          placeholder: e("blocks.promoCard.defaultEyebrow"),
          value: n.eyebrow ?? "",
          onChange: (a) => i({ eyebrow: a.target.value })
        }
      )
    ] }),
    /* @__PURE__ */ g("div", { children: [
      /* @__PURE__ */ d("label", { className: "label", children: e("blocks.promoCard.heading") }),
      /* @__PURE__ */ d(
        "input",
        {
          type: "text",
          className: "input",
          value: n.title ?? "",
          onChange: (a) => i({ title: a.target.value })
        }
      )
    ] }),
    /* @__PURE__ */ g("div", { children: [
      /* @__PURE__ */ d("label", { className: "label", children: e("blocks.promoCard.href") }),
      /* @__PURE__ */ d(
        "input",
        {
          type: "url",
          className: "input",
          placeholder: "https://…",
          value: n.href ?? "",
          onChange: (a) => i({ href: a.target.value })
        }
      )
    ] })
  ] });
}
const el = Vt({
  subId: Jt,
  defaultAttrs: qr,
  view: Xs
}), tl = {
  id: `magazine/${Jt}`,
  nodeName: Re,
  titleKey: "blocks.promoCard.title",
  namespace: "theme-magazine",
  icon: Un,
  category: "layout",
  extensions: [el],
  insert: (r) => {
    r.focus().insertContent({ type: Re }).run();
  },
  isActive: (r) => r.isActive(Re),
  inspector: (r) => /* @__PURE__ */ d(Qs, { editor: r.editor })
};
function _r(r) {
  return [...r].sort(
    (e, t) => ne(t) - ne(e)
  );
}
function xt(r, e) {
  return !r || r === "latest" || r === "auto" ? null : e.ctx.posts.find((n) => n.id === r && n.status === "online") ?? null;
}
function In(r, e) {
  return _r(
    r.ctx.posts.filter((n) => n.status === "online" && n.id !== r.current.id && !e.has(n.id))
  )[0] ?? null;
}
function nl(r, e, t) {
  const n = r.primaryTermId ? e.ctx.terms.find((p) => p.id === r.primaryTermId && p.type === "category") : void 0, i = `/${ot({ post: r, primaryTerm: n })}`, a = Pn(e.ctx.media.get(r.heroMediaId ?? "")), o = Y(a, "large"), s = e.showCategory && n ? `<a href="/${F(Et(n))}" class="block text-secondary uppercase tracking-widest text-xs font-semibold">${H(n.name)}</a>` : "", l = `<h2 class="font-serif text-4xl md:text-5xl font-semibold text-on-surface leading-tight"><a href="${F(i)}" class="hover:text-on-surface-variant transition-colors">${H(r.title)}</a></h2>`, c = r.excerpt ? `<p class="text-lg text-on-surface-variant max-w-2xl leading-relaxed">${H(r.excerpt)}</p>` : "", h = t.showBadge && o ? `<span class="absolute top-4 left-4 bg-primary text-on-primary px-3 py-1 text-xs uppercase tracking-widest font-semibold">${H(t.badgeLabel)}</span>` : "";
  return `<div class="lg:col-span-8">${o ? `<div class="relative overflow-hidden mb-stack-md aspect-[16/9]"><a href="${F(i)}" tabindex="-1" aria-hidden="true" class="block group"><img class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" src="${F(o)}" alt="${F((a == null ? void 0 : a.alt) ?? r.title)}" loading="eager" fetchpriority="high" />${h}</a></div>` : ""}<div class="space-y-stack-sm">${s}${l}${c}</div></div>`;
}
function rl(r, e) {
  const t = r.primaryTermId ? e.ctx.terms.find((c) => c.id === r.primaryTermId && c.type === "category") : void 0, n = `/${ot({ post: r, primaryTerm: t })}`, i = Pn(e.ctx.media.get(r.heroMediaId ?? "")), a = Y(i, "medium"), o = e.showCategory && t ? `<span class="block text-secondary uppercase tracking-widest text-xs font-semibold">${H(t.name)}</span>` : "", s = `<h3 class="font-serif text-xl font-medium text-on-surface"><a href="${F(n)}" class="hover:text-on-surface-variant transition-colors">${H(r.title)}</a></h3>`;
  return `<div>${a ? `<div class="aspect-[16/9] md:aspect-[4/3] overflow-hidden mb-stack-sm"><a href="${F(n)}" tabindex="-1" aria-hidden="true" class="block group"><img class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" src="${F(a)}" alt="${F((i == null ? void 0 : i.alt) ?? r.title)}" loading="lazy" /></a></div>` : ""}<div class="space-y-1">${o}${s}</div></div>`;
}
function il(r, e) {
  const t = r.primaryTermId ? e.ctx.terms.find((l) => l.id === r.primaryTermId && l.type === "category") : void 0, n = `/${ot({ post: r, primaryTerm: t })}`, i = r.authorId ? e.ctx.authorLookup(r.authorId) : void 0, a = e.showCategory && t ? `<span class="block text-secondary uppercase tracking-widest text-xs font-semibold">${H(t.name)}</span>` : "", o = `<h3 class="font-serif text-xl font-medium text-on-surface"><a href="${F(n)}" class="hover:text-on-surface-variant transition-colors">${H(r.title)}</a></h3>`, s = e.showAuthor && i ? `<p class="text-sm text-on-surface-variant mt-2">${H(i.displayName)}</p>` : "";
  return `<div class="border-t border-outline-variant pt-stack-md space-y-1">${a}${o}${s}</div>`;
}
function al(r, e) {
  var m, y, w, k;
  const t = new Set([e.current.id].filter((S) => S !== "__home__")), n = xt(r.featuredPostId, e) ?? _r(
    e.ctx.posts.filter((S) => S.status === "online" && !t.has(S.id))
  )[0] ?? null;
  if (!n) return { html: "", consumedPostIds: [] };
  t.add(n.id);
  const i = xt(r.secondary1PostId, e) ?? In(e, t);
  i && t.add(i.id);
  const a = xt(r.secondary2PostId, e) ?? In(e, t);
  a && t.add(a.id);
  const o = {
    ctx: e.ctx,
    showCategory: r.showCategory ?? !0,
    showAuthor: r.showAuthor ?? !0
  }, s = te(e.ctx.settings.language), c = ((k = (w = (y = (m = e.ctx.settings.themeConfigs) == null ? void 0 : m.magazine) == null ? void 0 : y.home) == null ? void 0 : w.featuredLabel) == null ? void 0 : k.trim()) || (ee.getResource(s, "theme-magazine", "blocks.magazineHero.featuredLabel") ?? "FEATURED"), h = nl(n, o, {
    showBadge: r.showFeaturedBadge ?? !0,
    badgeLabel: c
  }), u = i ? rl(i, o) : "", p = a ? il(a, o) : "", f = u || p ? `<div class="lg:col-span-4 flex flex-col gap-stack-md">${u}${p}</div>` : "", b = [n.id];
  return i && b.push(i.id), a && b.push(a.id), {
    html: `<section class="grid grid-cols-1 lg:grid-cols-12 gap-gutter mb-stack-lg">${h}${f}</section>`,
    consumedPostIds: b
  };
}
function ol(r) {
  return r < 10 ? `0${r}` : String(r);
}
function sl(r, e) {
  var c, h, u, p;
  const t = Math.max(1, Math.min(10, r.count ?? 4)), n = e.ctx.posts.filter((f) => f.status === "online" && f.id !== e.current.id).sort(
    (f, b) => ne(b) - ne(f)
  ).slice(0, t);
  if (!n.length) return { html: "", consumedPostIds: [] };
  const i = te(e.ctx.settings.language), o = ((p = (u = (h = (c = e.ctx.settings.themeConfigs) == null ? void 0 : c.magazine) == null ? void 0 : h.home) == null ? void 0 : u.mostReadHeading) == null ? void 0 : p.trim()) || (ee.getResource(i, "theme-magazine", "blocks.mostRead.heading") ?? "Most Read"), s = n.map((f, b) => {
    const m = f.primaryTermId ? e.ctx.terms.find((k) => k.id === f.primaryTermId && k.type === "category") : void 0, y = `/${ot({ post: f, primaryTerm: m })}`, w = [];
    return m && w.push(H(m.name)), `<li class="flex gap-stack-md group"><span class="font-serif text-4xl text-outline-variant leading-none shrink-0">${ol(b + 1)}</span><div class="min-w-0"><h4 class="font-serif text-base font-medium text-on-surface group-hover:text-secondary transition-colors leading-tight"><a href="${F(y)}">${H(f.title)}</a></h4>` + (w.length ? `<span class="text-xs text-on-surface-variant uppercase tracking-wider mt-1 block">${w.join(" • ")}</span>` : "") + "</div></li>";
  }).join("");
  return {
    html: `<div class="cms-magazine-most-read">${r.showHeading ?? !1 ? `<h3 class="text-xs uppercase tracking-widest font-semibold pb-2 mb-stack-md border-b border-on-surface">${H(o)}</h3>` : ""}<ul class="space-y-stack-md">${s}</ul></div>`,
    consumedPostIds: []
  };
}
function ll(r, e) {
  if (!r.imageUrl && !r.title) return { html: "" };
  const t = te(e.ctx.settings.language), n = ee.getResource(t, "theme-magazine", "blocks.promoCard.defaultEyebrow") ?? "Promoted", i = r.eyebrow ?? n, a = i ? `<span class="block text-on-primary/70 uppercase tracking-widest text-xs font-semibold mb-2">${H(i)}</span>` : "", o = r.title ? `<h3 class="font-serif text-xl font-medium text-on-primary leading-tight">${H(r.title)}</h3>` : "", l = `<div class="relative aspect-square overflow-hidden">${r.imageUrl ? `<img class="w-full h-full object-cover" src="${F(r.imageUrl)}" alt="${F(r.imageAlt ?? r.title ?? "")}" loading="lazy" />` : ""}<div class="absolute inset-0 bg-gradient-to-t from-primary/80 via-primary/40 to-transparent flex flex-col justify-end p-stack-md">${a}${o}</div></div>`;
  return {
    html: `<div class="cms-magazine-promo-card border border-outline-variant">${r.href ? `<a href="${F(r.href)}" class="block group">${l}</a>` : l}</div>`
  };
}
const Le = /<div\s+([^>]*data-cms-block="magazine\/([\w-]+)"[^>]*)>\s*<\/div>/g;
function cl(r, e) {
  const t = r.match(
    new RegExp(`${e}=(?:"([^"]*)"|'([^']*)'|([^\\s>]+))`)
  );
  return t ? t[1] ?? t[2] ?? t[3] ?? "" : "";
}
function dl(r) {
  const e = [];
  Le.lastIndex = 0;
  let t;
  for (; (t = Le.exec(r)) !== null; )
    e.push({
      match: t[0],
      blockId: t[2],
      attrsRaw: cl(t[1], "data-attrs"),
      index: t.index
    });
  return e;
}
function ul(r, e) {
  switch (r.blockId) {
    case "hero-split": {
      const t = Me(r.attrsRaw, {}), n = al(t, e);
      for (const i of n.consumedPostIds) e.used.add(i);
      return n.html;
    }
    case "most-read": {
      const t = Me(r.attrsRaw, {});
      return sl(t, e).html;
    }
    case "promo-card": {
      const t = Me(r.attrsRaw, {});
      return ll(t, { ctx: e.ctx }).html;
    }
    default:
      return "";
  }
}
function hl(r, e) {
  for (const t of r) {
    if (t.blockId !== "hero-split") continue;
    const n = Me(t.attrsRaw, {}), i = pl(n, e);
    i && e.used.add(i);
  }
}
function pl(r, e) {
  var n;
  return r.featuredPostId && r.featuredPostId !== "latest" && r.featuredPostId !== "auto" ? r.featuredPostId : ((n = e.ctx.posts.filter((i) => i.status === "online" && i.id !== e.current.id).sort((i, a) => ne(a) - ne(i))[0]) == null ? void 0 : n.id) ?? null;
}
function fl(r, e) {
  if (!r.includes('data-cms-block="magazine/')) return r;
  const t = ti();
  if (!t)
    return r.replace(Le, "");
  const n = dl(r);
  if (n.length === 0) return r;
  const i = { ctx: t, current: e, used: /* @__PURE__ */ new Set() };
  hl(n, i);
  const a = /* @__PURE__ */ new Map();
  for (const c of n)
    a.set(c.index, ul(c, i));
  let o = "", s = 0;
  Le.lastIndex = 0;
  let l;
  for (; (l = Le.exec(r)) !== null; )
    o += r.slice(s, l.index), o += a.get(l.index) ?? "", s = l.index + l[0].length;
  return o += r.slice(s), o;
}
const Rn = {
  id: "magazine",
  name: "Magazine",
  version: "1.1.1",
  description: "Editorial magazine theme inspired by long-form journalism — Tailwind-based, with an editable Material 3 palette.",
  // Convention name used by build-themes.mjs only as a fallback when
  // `theme.compiled.css` is missing. The magazine theme uses Tailwind
  // (compiled by build-theme-tailwind.mjs), so this entry is never
  // reached in practice.
  scssEntry: "theme.css",
  cssText: tn,
  jsText: ki,
  jsTextPosts: Si,
  i18n: { en: Ii, fr: Ri, de: Li, es: Pi, nl: Oi, pt: Bi, ko: Fi },
  settings: {
    navLabelKey: "title",
    defaultConfig: pi,
    component: Wi,
    schema: Qi
  },
  // Bakes the user's Style overrides (color palette, fonts) into the
  // CSS uploaded by `Sync theme assets`. Without this hook, syncing
  // would push the bundled CSS verbatim and erase the customizations
  // until the next Save & apply from Theme Settings.
  compileCss: (r) => Hn(tn, r.style),
  // Image catalog used by the upload pipeline. Mirrors the default
  // theme so a site switching from default → magazine doesn't have to
  // re-process its media library.
  imageFormats: {
    inputFormats: [".jpg", ".jpeg", ".png", ".webp", ".gif"],
    outputFormat: "webp",
    quality: 80,
    formats: {
      small: { width: 480, height: 480, fit: "cover" },
      medium: { width: 800, height: 800, fit: "cover" },
      large: { width: 1600, height: 900, fit: "cover" }
    },
    defaultFormat: "medium"
  },
  templates: {
    base: gi,
    home: bi,
    single: yi,
    category: wi,
    author: xi,
    notFound: vi
  },
  // Editor blocks contributed by the magazine theme. Each ships a
  // Tiptap node + inspector + render.ts producer. The post.html.body
  // filter below glues them together at publish time — see
  // blocks/transforms.ts for the two-pass dedup pipeline (mirrors
  // the default theme's pattern).
  blocks: [
    Js,
    Ys,
    tl
  ],
  register(r) {
    r.addFilter(
      "post.html.body",
      (e, ...t) => fl(e, t[0])
    );
  }
  // Settings page + compileCss hook land in phase 6.
};
export {
  Rn as manifest
};
