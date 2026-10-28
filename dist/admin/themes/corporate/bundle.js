import { jsxs as p, Fragment as Ee, jsx as l } from "react/jsx-runtime";
import { i18n as He, pickPublicLocale as Re, canonicalUrl as Hn, uploadFile as Rn, pickFormat as rt, buildTermUrl as sa, SocialIcon as Pn, socialLabel as Er, useCmsData as la, MediaPicker as On, pickMediaUrl as Bn, logoPath as zn, FontSelect as $n, toast as J, uploadThemeLogo as Un, removeThemeLogo as Fn, fetchAllPosts as Lr, publishMenuJson as jn } from "@agent-cms/runtime";
import j, { forwardRef as ar, createElement as St, useState as Q, useRef as Dn, createRef as Vn, memo as qn, createContext as ca, version as Mr, useContext as _n } from "react";
import { useTranslation as H } from "react-i18next";
import Gn, { flushSync as Jn } from "react-dom";
function Wn({ site: r }) {
  const { settings: e } = r, t = He.getFixedT(Re(e.language), "theme-corporate");
  return /* @__PURE__ */ p(Ee, { children: [
    /* @__PURE__ */ l(
      "header",
      {
        className: "fixed top-0 left-0 right-0 z-50 bg-surface/80 backdrop-blur-md border-b border-outline-variant/30 shadow-sm h-20",
        children: /* @__PURE__ */ p("div", { className: "flex justify-between items-center w-full px-gutter max-w-container-max mx-auto h-full", children: [
          /* @__PURE__ */ p("div", { className: "flex items-center gap-4", children: [
            /* @__PURE__ */ l(
              "button",
              {
                type: "button",
                className: "burger-toggle text-primary",
                "aria-controls": "burger-menu",
                "aria-expanded": "false",
                "aria-label": t("publicBaked.menu"),
                children: /* @__PURE__ */ l("span", { className: "material-symbols-outlined", children: "menu" })
              }
            ),
            /* @__PURE__ */ l(
              "a",
              {
                className: "text-h3 font-bold text-primary tracking-tight",
                href: r.homePath ?? "/index.html",
                "data-cms-brand": !0,
                children: e.title
              }
            )
          ] }),
          /* @__PURE__ */ l(
            "nav",
            {
              className: "hidden md:flex items-center gap-8",
              "data-cms-menu": "header",
              "data-cms-menu-inline": !0,
              "aria-label": "Primary"
            }
          ),
          /* @__PURE__ */ p("div", { className: "flex items-center gap-4", children: [
            /* @__PURE__ */ l("div", { "data-cms-langswitch": "header", "aria-hidden": "true" }),
            /* @__PURE__ */ l(
              "a",
              {
                href: "/contact.html",
                className: "bg-secondary text-on-secondary px-6 py-2 rounded-lg text-button font-semibold hover:opacity-90 active:opacity-80 transition-all",
                children: t("publicBaked.getStarted")
              }
            )
          ] })
        ] })
      }
    ),
    /* @__PURE__ */ l(
      "nav",
      {
        id: "burger-menu",
        className: "burger-menu",
        "data-cms-menu": "header",
        "aria-label": "Primary mobile",
        children: /* @__PURE__ */ l("ul", {})
      }
    )
  ] });
}
function Kn({ site: r }) {
  const { settings: e } = r, t = (/* @__PURE__ */ new Date()).getFullYear();
  return /* @__PURE__ */ p("footer", { className: "bg-primary text-on-primary border-t border-on-primary-fixed-variant/20", children: [
    /* @__PURE__ */ p("div", { className: "w-full px-gutter py-section-padding max-w-container-max mx-auto flex flex-col md:flex-row md:items-start md:justify-between gap-stack-lg", children: [
      /* @__PURE__ */ p("div", { className: "max-w-sm", children: [
        /* @__PURE__ */ l("span", { className: "text-h3 font-bold text-secondary-fixed block mb-stack-md", children: e.title }),
        e.description && /* @__PURE__ */ l("p", { className: "text-body-md text-on-primary-container/80", children: e.description })
      ] }),
      /* @__PURE__ */ l(
        "nav",
        {
          "data-cms-menu": "footer",
          "aria-label": "Footer",
          className: "flex-1 md:max-w-md",
          children: /* @__PURE__ */ l("ul", { className: "flex flex-wrap gap-x-8 gap-y-3 text-body-md text-on-primary-container/80" })
        }
      )
    ] }),
    /* @__PURE__ */ l("div", { className: "max-w-container-max mx-auto px-gutter pb-8", children: /* @__PURE__ */ p("div", { className: "flex flex-wrap items-center justify-between gap-stack-sm border-t border-on-primary-fixed-variant/10 pt-8", children: [
      /* @__PURE__ */ p("p", { className: "text-on-primary-container/60 text-label-caps font-semibold uppercase tracking-wider", children: [
        "© ",
        t,
        " ",
        e.title
      ] }),
      /* @__PURE__ */ l("div", { "data-cms-langswitch": "footer", "aria-hidden": "true" })
    ] }) })
  ] });
}
function Yn({
  site: r,
  pageTitle: e,
  pageDescription: t,
  ogImage: a,
  currentPath: n,
  currentLocale: o,
  children: i
}) {
  var b;
  const s = (b = r.themeConfig) == null ? void 0 : b.cssUpdatedAt, c = s ? `/${r.themeCssPath}?v=${s}` : `/${r.themeCssPath}`, u = r.themeCssPath.replace(/^theme-assets\//, "").replace(/\.css$/, ""), d = `/theme-assets/${u}-menu.js`, h = `/theme-assets/${u}-posts.js`, m = r.settings.baseUrl && n ? Hn(r.settings.baseUrl, n) : void 0, f = e ? `${e} — ${r.settings.title}` : r.settings.title;
  return /* @__PURE__ */ p("html", { lang: o || r.settings.language || "en", children: [
    /* @__PURE__ */ p("head", { children: [
      /* @__PURE__ */ l("meta", { charSet: "UTF-8" }),
      /* @__PURE__ */ l("meta", { name: "viewport", content: "width=device-width, initial-scale=1" }),
      /* @__PURE__ */ l("title", { children: f }),
      t && /* @__PURE__ */ l("meta", { name: "description", content: t }),
      m && /* @__PURE__ */ l("link", { rel: "canonical", href: m }),
      /* @__PURE__ */ l("link", { rel: "preconnect", href: "https://fonts.googleapis.com" }),
      /* @__PURE__ */ l("link", { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "" }),
      /* @__PURE__ */ l("link", { rel: "stylesheet", href: c }),
      /* @__PURE__ */ l("meta", { property: "og:title", content: f }),
      t && /* @__PURE__ */ l("meta", { property: "og:description", content: t }),
      a && /* @__PURE__ */ l("meta", { property: "og:image", content: a }),
      m && /* @__PURE__ */ l("meta", { property: "og:url", content: m }),
      /* @__PURE__ */ l("meta", { property: "og:type", content: "website" }),
      /* @__PURE__ */ l("meta", { name: "x-cms-head-extra" })
    ] }),
    /* @__PURE__ */ p("body", { className: "bg-background text-on-surface", children: [
      /* @__PURE__ */ l(Wn, { site: r }),
      /* @__PURE__ */ l("main", { className: "pt-20", children: i }),
      /* @__PURE__ */ l(Kn, { site: r }),
      /* @__PURE__ */ l(
        "button",
        {
          type: "button",
          "data-cms-search": !0,
          "aria-label": "Search",
          className: "fixed bottom-8 right-8 w-14 h-14 bg-secondary text-on-secondary rounded-full shadow-xl flex items-center justify-center hover:scale-110 active:scale-95 transition-all z-40",
          children: /* @__PURE__ */ l("span", { className: "material-symbols-outlined", children: "search" })
        }
      ),
      /* @__PURE__ */ l("script", { src: d, defer: !0 }),
      /* @__PURE__ */ l("script", { src: h, defer: !0 }),
      /* @__PURE__ */ l("script", { type: "application/x-cms-body-end" })
    ] })
  ] });
}
const Zn = "corporate";
function Qn(r) {
  if (r == null) return "";
  try {
    const e = JSON.stringify(r);
    return typeof window > "u" ? Buffer.from(e, "utf-8").toString("base64") : window.btoa(unescape(encodeURIComponent(e)));
  } catch {
    return "";
  }
}
function Y(r, e) {
  if (!r || typeof r != "string") return e;
  try {
    let t;
    return typeof window > "u" ? t = Buffer.from(r, "base64").toString("utf-8") : t = decodeURIComponent(escape(window.atob(r))), JSON.parse(t);
  } catch {
    return e;
  }
}
function da(r) {
  return `corporate${r.charAt(0).toUpperCase()}${r.slice(1)}`;
}
function N(r) {
  return typeof r != "string" ? "" : r.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}
function k(r) {
  return typeof r != "string" ? "" : r.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}
function ua(r) {
  if (!r.title && !r.subtitle && !r.imageUrl)
    return { html: "" };
  const e = r.imageUrl ? `<img class="w-full h-full object-cover" src="${N(r.imageUrl)}" alt="${N(r.imageAlt ?? "")}" loading="eager" fetchpriority="high" />` : "", t = r.imageUrl ? "absolute inset-0 bg-gradient-to-r from-primary/95 via-primary/80 to-primary/30 md:to-transparent" : "absolute inset-0 bg-gradient-to-r from-primary via-primary to-primary-container", a = r.eyebrow ? `<span class="inline-block px-4 py-1 rounded-full bg-secondary/20 text-secondary-fixed text-label-caps font-semibold uppercase tracking-wider mb-6 border border-secondary/30">${k(r.eyebrow)}</span>` : "", n = r.title ? `<h1 class="text-h1 font-bold mb-stack-lg leading-tight">${k(r.title)}</h1>` : "", o = r.subtitle ? `<p class="text-body-lg mb-10 text-on-primary-container">${k(r.subtitle)}</p>` : "", i = r.primaryCtaLabel && r.primaryCtaHref ? `<a href="${N(r.primaryCtaHref)}" class="bg-secondary text-on-secondary px-8 py-4 rounded-xl text-button font-semibold hover:scale-105 transition-transform inline-flex items-center gap-2">${k(r.primaryCtaLabel)}<span class="material-symbols-outlined">arrow_forward</span></a>` : "", s = r.secondaryCtaLabel && r.secondaryCtaHref ? `<a href="${N(r.secondaryCtaHref)}" class="border border-on-primary/30 text-on-primary px-8 py-4 rounded-xl text-button font-semibold hover:bg-white/10 transition-colors">${k(r.secondaryCtaLabel)}</a>` : "", c = i || s ? `<div class="flex flex-wrap gap-4">${i}${s}</div>` : "";
  return {
    html: `<section class="relative min-h-[600px] md:min-h-[760px] flex items-center overflow-hidden">
<div class="absolute inset-0 z-0">${e}<div class="${t}"></div></div>
<div class="relative z-10 w-full px-gutter max-w-container-max mx-auto py-section-padding"><div class="max-w-2xl text-on-primary">${a}${n}${o}${c}</div></div>
</section>`
  };
}
const Xn = {
  rating: 5,
  quote: "",
  authorName: "",
  authorTitle: "",
  authorAvatarUrl: "",
  authorAvatarAlt: ""
};
function eo(r, e) {
  const t = Math.max(0, Math.min(5, Math.round(r))), a = e ? "text-secondary-fixed" : "text-secondary";
  let n = "";
  for (let o = 0; o < 5; o++) {
    const i = o < t;
    n += `<span class="material-symbols-outlined text-[18px] ${a}" style="font-variation-settings: 'FILL' ${i ? 1 : 0};">star</span>`;
  }
  return `<div class="flex gap-1 mb-stack-md">${n}</div>`;
}
function to(r) {
  if (!r) return "?";
  const e = r.trim().split(/\s+/);
  return e.length === 1 ? e[0].slice(0, 2).toUpperCase() : `${e[0][0] ?? ""}${e[e.length - 1][0] ?? ""}`.toUpperCase();
}
function ro(r, e) {
  const t = { ...Xn, ...r };
  if (!t.quote && !t.authorName) return "";
  const a = e ? "bg-primary-container p-8 rounded-xl border border-on-primary-fixed-variant/20" : "glass-card p-8 rounded-xl shadow-sm relative", n = e ? "material-symbols-outlined text-secondary-fixed text-4xl mb-stack-md" : "material-symbols-outlined text-secondary/20 text-[64px] absolute top-4 right-4", o = e ? "text-body-lg mb-stack-lg italic" : "text-on-surface mb-stack-lg italic", i = e ? "font-bold text-on-primary" : "font-bold text-primary", s = e ? "text-label-caps font-semibold text-on-primary-container uppercase tracking-wider" : "text-label-caps font-semibold text-on-surface-variant uppercase tracking-wider", c = t.authorAvatarUrl ? `<img class="w-12 h-12 rounded-full object-cover" src="${N(t.authorAvatarUrl)}" alt="${N(t.authorAvatarAlt ?? t.authorName)}" loading="lazy" />` : `<span class="w-12 h-12 rounded-full inline-flex items-center justify-center bg-secondary-fixed text-secondary font-bold" aria-hidden="true">${k(to(t.authorName))}</span>`;
  return `<div class="${a}">
<span class="${n}" style="font-variation-settings: 'FILL' 1;">format_quote</span>
${eo(t.rating ?? 5, e)}
<p class="${o}">${k(t.quote)}</p>
<div class="flex items-center gap-stack-md">${c}<div><p class="${i}">${k(t.authorName)}</p>${t.authorTitle ? `<p class="${s}">${k(t.authorTitle)}</p>` : ""}</div></div>
</div>`;
}
function pa(r) {
  const e = (r.testimonials ?? []).filter((f) => f && (f.quote || f.authorName));
  if (e.length === 0 && !r.title) return { html: "" };
  const t = r.variant === "navy", a = t ? "px-gutter py-section-padding bg-primary text-on-primary overflow-hidden relative" : "bg-surface-container-low py-section-padding overflow-hidden", n = r.eyebrow ? `<span class="text-label-caps font-semibold text-secondary uppercase tracking-wider mb-2 block ${t ? "text-secondary-fixed" : "text-secondary"}">${k(r.eyebrow)}</span>` : "", o = t ? "text-h2 font-bold mb-4" : "text-h2 font-bold text-primary", i = t ? "text-on-primary-container text-body-lg mt-4" : "text-on-surface-variant text-body-md mt-4", s = r.title ? `<h2 class="${o}">${k(r.title)}</h2>` : "", c = r.subtitle ? `<p class="${i}">${k(r.subtitle)}</p>` : "", u = n || s || c ? `<div class="text-center mb-section-padding max-w-2xl mx-auto">${n}${s}${c}</div>` : "", d = e.length >= 3 ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3" : e.length === 2 ? "grid-cols-1 md:grid-cols-2" : "grid-cols-1", h = e.map((f) => ro(f, t)).join("");
  return {
    html: `<section class="${a}">
<div class="px-gutter max-w-container-max mx-auto relative z-10">
${u}
<div class="grid ${d} gap-stack-lg">${h}</div>
</div>
${t ? '<div class="absolute -bottom-20 -right-20 w-96 h-96 bg-secondary/10 rounded-full blur-3xl"></div>' : ""}
</section>`
  };
}
const Bt = [
  // Surfaces
  { name: "--color-background", type: "color", group: "surfaces", labelKey: "vars.background", defaultValue: "#f7f9fb" },
  { name: "--color-surface", type: "color", group: "surfaces", labelKey: "vars.surface", defaultValue: "#f7f9fb" },
  { name: "--color-surface-container-lowest", type: "color", group: "surfaces", labelKey: "vars.surfaceLowest", defaultValue: "#ffffff" },
  { name: "--color-surface-container-low", type: "color", group: "surfaces", labelKey: "vars.surfaceLow", defaultValue: "#f2f4f6" },
  { name: "--color-surface-container", type: "color", group: "surfaces", labelKey: "vars.surfaceMid", defaultValue: "#eceef0" },
  { name: "--color-surface-container-high", type: "color", group: "surfaces", labelKey: "vars.surfaceHigh", defaultValue: "#e6e8ea" },
  // Foreground
  { name: "--color-on-surface", type: "color", group: "foreground", labelKey: "vars.onSurface", defaultValue: "#191c1e" },
  { name: "--color-on-surface-variant", type: "color", group: "foreground", labelKey: "vars.onSurfaceVariant", defaultValue: "#45474c" },
  // Outlines
  { name: "--color-outline", type: "color", group: "outlines", labelKey: "vars.outline", defaultValue: "#75777d" },
  { name: "--color-outline-variant", type: "color", group: "outlines", labelKey: "vars.outlineVariant", defaultValue: "#c5c6cd" },
  // Accent — the navy primary + indigo secondary + sky tertiary triple
  // is the heart of the corporate identity. Defaults match
  // DESIGN.md / Stitch mockup exactly.
  { name: "--color-primary", type: "color", group: "accent", labelKey: "vars.primary", defaultValue: "#091426" },
  { name: "--color-on-primary", type: "color", group: "accent", labelKey: "vars.onPrimary", defaultValue: "#ffffff" },
  { name: "--color-primary-container", type: "color", group: "accent", labelKey: "vars.primaryContainer", defaultValue: "#1e293b" },
  { name: "--color-on-primary-container", type: "color", group: "accent", labelKey: "vars.onPrimaryContainer", defaultValue: "#8590a6" },
  { name: "--color-secondary", type: "color", group: "accent", labelKey: "vars.secondary", defaultValue: "#4b41e1" },
  { name: "--color-on-secondary", type: "color", group: "accent", labelKey: "vars.onSecondary", defaultValue: "#ffffff" },
  { name: "--color-tertiary", type: "color", group: "accent", labelKey: "vars.tertiary", defaultValue: "#001624" },
  { name: "--color-tertiary-container", type: "color", group: "accent", labelKey: "vars.tertiaryContainer", defaultValue: "#002c42" }
], ao = [
  "surfaces",
  "foreground",
  "outlines",
  "accent"
], at = {
  sans: {
    Inter: "Inter:wght@400;500;600;700",
    Manrope: "Manrope:wght@400;500;600;700",
    "IBM Plex Sans": "IBM+Plex+Sans:wght@400;500;600;700",
    "Plus Jakarta Sans": "Plus+Jakarta+Sans:wght@400;500;600;700",
    "DM Sans": "DM+Sans:wght@400;500;600;700",
    "Work Sans": "Work+Sans:wght@400;500;600;700"
  }
}, Le = "Inter", $e = {
  vars: {},
  fontSans: Le
}, ha = [
  {
    id: "classic",
    swatch: ["--color-background", "--color-surface-container", "--color-primary", "--color-secondary"],
    vars: {},
    fontSans: Le
  },
  {
    id: "tech",
    swatch: ["--color-background", "--color-surface-container", "--color-primary", "--color-secondary"],
    vars: {
      "--color-background": "#fafafa",
      "--color-surface": "#fafafa",
      "--color-surface-container-lowest": "#ffffff",
      "--color-surface-container-low": "#f4f4f5",
      "--color-surface-container": "#e9e9eb",
      "--color-surface-container-high": "#dededf",
      "--color-on-surface": "#0a0a0a",
      "--color-on-surface-variant": "#3f3f46",
      "--color-outline": "#71717a",
      "--color-outline-variant": "#d4d4d8",
      "--color-primary": "#0a0a0a",
      "--color-on-primary": "#ffffff",
      "--color-primary-container": "#262626",
      "--color-on-primary-container": "#a1a1aa",
      "--color-secondary": "#06b6d4",
      "--color-on-secondary": "#ffffff",
      "--color-tertiary": "#000000",
      "--color-tertiary-container": "#1a1a1a"
    },
    fontSans: "Plus Jakarta Sans"
  },
  {
    id: "trust",
    swatch: ["--color-background", "--color-surface-container", "--color-primary", "--color-secondary"],
    vars: {
      "--color-background": "#f7f4ed",
      "--color-surface": "#f7f4ed",
      "--color-surface-container-lowest": "#ffffff",
      "--color-surface-container-low": "#efebe1",
      "--color-surface-container": "#e6e1d4",
      "--color-surface-container-high": "#ddd7c8",
      "--color-on-surface": "#1a1612",
      "--color-on-surface-variant": "#46403a",
      "--color-outline": "#8a8478",
      "--color-outline-variant": "#cfc8b8",
      "--color-primary": "#1e3a5f",
      "--color-on-primary": "#ffffff",
      "--color-primary-container": "#2d4d7a",
      "--color-on-primary-container": "#a8bcd4",
      "--color-secondary": "#c4882d",
      "--color-on-secondary": "#ffffff",
      "--color-tertiary": "#172a45",
      "--color-tertiary-container": "#1e3a5f"
    },
    fontSans: "IBM Plex Sans"
  },
  {
    id: "vibrant",
    swatch: ["--color-background", "--color-surface-container", "--color-primary", "--color-secondary"],
    vars: {
      "--color-background": "#fdfcfb",
      "--color-surface": "#fdfcfb",
      "--color-surface-container-lowest": "#ffffff",
      "--color-surface-container-low": "#f7f3f1",
      "--color-surface-container": "#f0eae7",
      "--color-surface-container-high": "#e8e0dc",
      "--color-on-surface": "#1a0a0a",
      "--color-on-surface-variant": "#3a2828",
      "--color-outline": "#7a5a5a",
      "--color-outline-variant": "#cdb5b5",
      "--color-primary": "#e91e63",
      "--color-on-primary": "#ffffff",
      "--color-primary-container": "#c2185b",
      "--color-on-primary-container": "#ffd4e3",
      "--color-secondary": "#f97316",
      "--color-on-secondary": "#ffffff",
      "--color-tertiary": "#9c1a4a",
      "--color-tertiary-container": "#c2185b"
    },
    fontSans: "DM Sans"
  },
  {
    id: "executive",
    swatch: ["--color-background", "--color-surface-container", "--color-primary", "--color-secondary"],
    vars: {
      "--color-background": "#fbf9f6",
      "--color-surface": "#fbf9f6",
      "--color-surface-container-lowest": "#ffffff",
      "--color-surface-container-low": "#f3f0ea",
      "--color-surface-container": "#ebe7df",
      "--color-surface-container-high": "#e3ddd3",
      "--color-on-surface": "#1c1626",
      "--color-on-surface-variant": "#3f3a4d",
      "--color-outline": "#7c7790",
      "--color-outline-variant": "#cac4d8",
      "--color-primary": "#3b1f5b",
      "--color-on-primary": "#fbf9f6",
      "--color-primary-container": "#5a3b87",
      "--color-on-primary-container": "#d4c4ec",
      "--color-secondary": "#a87c2c",
      "--color-on-secondary": "#ffffff",
      "--color-tertiary": "#2a1846",
      "--color-tertiary-container": "#3b1f5b"
    },
    fontSans: "Manrope"
  }
];
function ma(r, e) {
  var n;
  const t = (n = r.vars) == null ? void 0 : n[e];
  if (t && t.trim()) return t.trim();
  const a = Bt.find((o) => o.name === e);
  return a ? a.defaultValue : "";
}
function no(r) {
  var e;
  for (const t of ha) {
    if (t.fontSans !== r.fontSans) continue;
    let a = !0;
    for (const n of Bt) {
      const o = ((e = t.vars[n.name]) == null ? void 0 : e.trim()) || n.defaultValue, i = ma(r, n.name);
      if (o !== i) {
        a = !1;
        break;
      }
    }
    if (a) return t.id;
  }
  return null;
}
function oo(r) {
  return `https://fonts.googleapis.com/css2?family=${at.sans[r] ?? at.sans[Le]}&display=swap`;
}
function io() {
  return `https://fonts.googleapis.com/css2?${Object.keys(at.sans).map((t) => `family=${t.replace(/ /g, "+")}`).join("&")}&display=swap`;
}
function so(r) {
  const e = r.trim(), t = /^#([0-9a-fA-F]{3,4}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/.exec(e);
  if (!t) return e;
  let a = t[1];
  a.length <= 4 && (a = a.split("").map((s) => s + s).join(""));
  const n = parseInt(a.slice(0, 2), 16), o = parseInt(a.slice(2, 4), 16), i = parseInt(a.slice(4, 6), 16);
  return `${n} ${o} ${i}`;
}
function lo(r) {
  return r.startsWith("--color-") ? !0 : Bt.some((e) => e.name === r && e.type === "color");
}
function co(r) {
  return `"${r.replace(/"/g, '\\"')}"`;
}
function fa(r, e) {
  const t = {};
  for (const [u, d] of Object.entries(e.vars ?? {}))
    d && d.trim() && (t[u] = d.trim());
  const a = e.fontSans || Le, n = a !== Le, o = Object.keys(t).length > 0;
  if (!n && !o) return r;
  let i = r;
  if (n) {
    const u = oo(a);
    i = i.replace(
      /@import\s*(?:url\(\s*)?"https:\/\/fonts\.googleapis\.com[^"]*"(?:\s*\))?\s*;/,
      `@import url("${u}");`
    );
  }
  const s = Object.entries(t).map(([u, d]) => {
    const h = lo(u) ? so(d) : d;
    return `${u}:${h};`;
  }).join(""), c = n ? `--font-sans:${co(a)};` : "";
  return i += `
:root{${c}${s}}
`, i;
}
async function Ir(r) {
  const e = fa(r.baseCssText, r.style);
  await Rn({
    path: "theme-assets/corporate.css",
    content: e,
    encoding: "utf-8"
  });
}
const uo = "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1920&q=80", ee = {
  showHero: !0,
  hero: {
    imageUrl: uo,
    imageAlt: "Modern corporate office",
    eyebrow: "Innovation & reliability",
    title: "Propel your business toward the future",
    subtitle: "Strategic, tailor-made solutions for SMEs seeking digital growth and operational excellence.",
    primaryCtaLabel: "Get started",
    primaryCtaHref: "/contact.html",
    secondaryCtaLabel: "See our solutions",
    secondaryCtaHref: "#services"
  },
  featuredPosts: {
    enabled: !0,
    title: "Our latest insights",
    subtitle: "Stay ahead of the curve with strategic perspectives from our team of experts.",
    mode: "all",
    categoryId: "",
    count: 3
  },
  testimonials: {
    enabled: !0,
    eyebrow: "",
    title: "Trusted by industry leaders",
    subtitle: "More than 500 businesses accelerate their growth with us.",
    variant: "glass",
    // Placeholder content — editor replaces or removes from the
    // Home tab. The first publish reads as credible social proof
    // even before the editor curates real testimonials.
    items: [
      {
        rating: 5,
        quote: "Their platform completely changed our customer-service approach. We cut operational costs by 30% in six months.",
        authorName: "Jean-Pierre Dubois",
        authorTitle: "Operations Director, LogisTech",
        authorAvatarUrl: "",
        authorAvatarAlt: ""
      },
      {
        rating: 5,
        quote: "Exceptional strategic guidance — they truly understand the challenges modern SMEs face. An indispensable partner.",
        authorName: "Marie Leroux",
        authorTitle: "Founder, GreenPulse",
        authorAvatarUrl: "",
        authorAvatarAlt: ""
      },
      {
        rating: 5,
        quote: "The cloud transition was surprisingly fluid. They handled the technical complexity, letting us focus on our core business.",
        authorName: "Thomas Martin",
        authorTitle: "CTO, DataSecure",
        authorAvatarUrl: "",
        authorAvatarAlt: ""
      }
    ]
  }
}, nr = {
  // Off by default — many corporate / vitrine sites don't surface
  // per-author bylines individually. Flip on when authors have full
  // profiles (display name + bio + socials) worth showing.
  showAuthorBio: !1,
  showPopularArticles: !0,
  // Empty = SingleTemplate falls back to the localised default
  // (`publicBaked.popularArticles`).
  popularArticlesTitle: "",
  showCta: !0,
  // Empty = the template falls back to either site.settings.title or
  // the localised "Get Started" (depending on whether
  // settings.description is set).
  ctaTitle: "",
  ctaButtonLabel: "",
  ctaButtonHref: ""
}, po = {
  logoEnabled: !1,
  logoUpdatedAt: 0,
  style: $e,
  cssUpdatedAt: 0,
  home: ee,
  single: nr
};
function ho({
  posts: r,
  staticPage: e,
  archivesLink: t,
  site: a
}) {
  var h, m, f;
  const n = He.getFixedT(Re(a.settings.language), "theme-corporate");
  if (e)
    return /* @__PURE__ */ l(
      "div",
      {
        className: "corporate-static-home",
        dangerouslySetInnerHTML: { __html: e.bodyHtml }
      }
    );
  const o = a.themeConfig, i = {
    ...ee,
    ...(o == null ? void 0 : o.home) ?? {},
    hero: { ...ee.hero, ...((h = o == null ? void 0 : o.home) == null ? void 0 : h.hero) ?? {} },
    featuredPosts: {
      ...ee.featuredPosts,
      ...((m = o == null ? void 0 : o.home) == null ? void 0 : m.featuredPosts) ?? {}
    },
    testimonials: {
      ...ee.testimonials,
      ...((f = o == null ? void 0 : o.home) == null ? void 0 : f.testimonials) ?? {}
    }
  }, s = i.showHero ? ua(i.hero).html : "", c = i.featuredPosts;
  let u = r;
  if (c.enabled && c.mode === "category" && c.categoryId) {
    const b = r.filter((g) => g.primaryTermId === c.categoryId);
    b.length > 0 && (u = b);
  }
  u = u.slice(0, Math.max(1, c.count));
  const d = i.testimonials.enabled ? pa({
    eyebrow: i.testimonials.eyebrow,
    title: i.testimonials.title,
    subtitle: i.testimonials.subtitle,
    variant: i.testimonials.variant,
    testimonials: i.testimonials.items
  }).html : "";
  return /* @__PURE__ */ p(Ee, { children: [
    s && /* @__PURE__ */ l("div", { dangerouslySetInnerHTML: { __html: s } }),
    c.enabled && u.length > 0 && /* @__PURE__ */ l("section", { className: "px-gutter py-section-padding", id: "featured", children: /* @__PURE__ */ p("div", { className: "max-w-container-max mx-auto", children: [
      /* @__PURE__ */ p("div", { className: "flex flex-col md:flex-row md:items-end md:justify-between mb-stack-lg gap-stack-md", children: [
        /* @__PURE__ */ p("div", { className: "max-w-xl", children: [
          c.title && /* @__PURE__ */ l("h2", { className: "text-h2 font-bold text-primary mb-2", children: c.title }),
          c.subtitle && /* @__PURE__ */ l("p", { className: "text-on-surface-variant text-body-md", children: c.subtitle })
        ] }),
        /* @__PURE__ */ p("div", { className: "flex gap-2 shrink-0", children: [
          /* @__PURE__ */ l(
            "button",
            {
              type: "button",
              "data-cms-featured-prev": !0,
              "aria-label": n("publicBaked.previous"),
              className: "p-3 rounded-full border border-outline hover:bg-surface-container transition-colors",
              children: /* @__PURE__ */ l("span", { className: "material-symbols-outlined", children: "chevron_left" })
            }
          ),
          /* @__PURE__ */ l(
            "button",
            {
              type: "button",
              "data-cms-featured-next": !0,
              "aria-label": n("publicBaked.next"),
              className: "p-3 rounded-full border border-outline hover:bg-surface-container transition-colors",
              children: /* @__PURE__ */ l("span", { className: "material-symbols-outlined", children: "chevron_right" })
            }
          )
        ] })
      ] }),
      /* @__PURE__ */ l(
        "div",
        {
          "data-cms-featured-track": !0,
          className: "flex overflow-x-auto snap-x snap-mandatory scroll-smooth gap-stack-lg corporate-no-scrollbar",
          children: u.map((b) => /* @__PURE__ */ p(
            "article",
            {
              className: "snap-start corporate-slide bg-surface-container-lowest rounded-xl shadow-sm border border-outline-variant/30 overflow-hidden flex flex-col group",
              children: [
                b.hero && /* @__PURE__ */ l("a", { href: `/${b.url}`, className: "block aspect-video overflow-hidden", children: /* @__PURE__ */ l(
                  "img",
                  {
                    src: rt(b.hero, "medium"),
                    alt: b.hero.alt ?? b.title,
                    className: "w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  }
                ) }),
                /* @__PURE__ */ p("div", { className: "p-6 flex flex-col flex-1", children: [
                  b.category && /* @__PURE__ */ l("p", { className: "text-label-caps font-semibold text-secondary uppercase tracking-wider mb-2", children: b.category.name }),
                  b.dateLabel && /* @__PURE__ */ l("p", { className: "text-label-caps font-semibold text-on-surface-variant mb-2", children: b.dateLabel }),
                  /* @__PURE__ */ l("h3", { className: "text-h3 font-semibold text-primary mb-3 group-hover:text-secondary transition-colors", children: /* @__PURE__ */ l("a", { href: `/${b.url}`, children: b.title }) }),
                  b.excerpt && /* @__PURE__ */ l("p", { className: "text-body-md text-on-surface-variant mb-6 flex-1", children: b.excerpt }),
                  /* @__PURE__ */ p(
                    "a",
                    {
                      href: `/${b.url}`,
                      className: "inline-flex items-center gap-2 text-button font-semibold text-secondary",
                      children: [
                        n("publicBaked.readMore"),
                        /* @__PURE__ */ l("span", { className: "material-symbols-outlined text-[18px]", children: "arrow_forward" })
                      ]
                    }
                  )
                ] })
              ]
            },
            b.id
          ))
        }
      ),
      t && /* @__PURE__ */ l("div", { className: "mt-stack-lg", children: /* @__PURE__ */ l("a", { className: "archives-link", href: t.href, children: t.label }) })
    ] }) }),
    d && /* @__PURE__ */ l("div", { dangerouslySetInnerHTML: { __html: d } })
  ] });
}
const mo = /* @__PURE__ */ new Set(["contact-info", "contact-form"]), fo = /<div\s[^>]*data-cms-block="corporate\/([\w-]+)"/;
function go(r) {
  const e = fo.exec(r);
  return e ? r.slice(0, e.index).trim() === "" && !mo.has(e[1]) ? "blocks" : "mixed" : "markdown";
}
function bo({
  post: r,
  bodyHtml: e,
  author: t,
  hero: a,
  primaryTerm: n,
  tags: o,
  site: i
}) {
  var w, C, A, B, R, M;
  const s = He.getFixedT(Re(i.settings.language), "theme-corporate"), c = r.type === "page", u = i.themeConfig, d = {
    ...nr,
    ...(u == null ? void 0 : u.single) ?? {}
  }, h = d.popularArticlesTitle.trim() || s("publicBaked.popularArticles"), m = d.ctaTitle.trim() || (i.settings.description ? i.settings.title : s("publicBaked.getStarted")), f = d.ctaButtonLabel.trim() || s("publicBaked.getStarted"), b = d.ctaButtonHref.trim() || "/contact.html", g = ((C = (w = r.publishedAt) == null ? void 0 : w.toMillis) == null ? void 0 : C.call(w)) ?? ((B = (A = r.updatedAt) == null ? void 0 : A.toMillis) == null ? void 0 : B.call(A)) ?? ((M = (R = r.createdAt) == null ? void 0 : R.toMillis) == null ? void 0 : M.call(R));
  let y;
  if (g)
    try {
      y = new Intl.DateTimeFormat(i.settings.language || "en", {
        month: "short",
        day: "numeric",
        year: "numeric"
      }).format(new Date(g));
    } catch {
      y = new Date(g).toDateString();
    }
  if (c) {
    const P = go(r.contentMarkdown ?? "");
    return P === "blocks" ? /* @__PURE__ */ l("article", { className: "pt-stack-md pb-section-padding", children: /* @__PURE__ */ l(
      "div",
      {
        className: "corporate-page-body",
        dangerouslySetInnerHTML: { __html: e }
      }
    ) }) : /* @__PURE__ */ p("article", { className: "pt-stack-lg md:pt-section-padding pb-section-padding", children: [
      /* @__PURE__ */ l("header", { className: "px-gutter mb-stack-lg", children: /* @__PURE__ */ l("h1", { className: "max-w-3xl mx-auto text-h2 md:text-h1 font-bold text-primary leading-tight", children: r.title }) }),
      P === "markdown" ? /* @__PURE__ */ l("div", { className: "px-gutter", children: /* @__PURE__ */ l(
        "div",
        {
          className: "corporate-prose max-w-3xl mx-auto",
          dangerouslySetInnerHTML: { __html: e }
        }
      ) }) : /* @__PURE__ */ l(
        "div",
        {
          className: "corporate-page-body corporate-page-body--flow",
          dangerouslySetInnerHTML: { __html: e }
        }
      )
    ] });
  }
  return /* @__PURE__ */ p("article", { children: [
    a && /* @__PURE__ */ l("div", { className: "relative w-full aspect-[16/10] md:aspect-[21/9] overflow-hidden", children: /* @__PURE__ */ l(
      "img",
      {
        src: rt(a, "large"),
        alt: a.alt ?? "",
        className: "w-full h-full object-cover",
        fetchPriority: "high"
      }
    ) }),
    /* @__PURE__ */ l("div", { className: "px-gutter mt-stack-lg pb-stack-lg max-w-container-max mx-auto", children: /* @__PURE__ */ l("div", { className: "lg:grid lg:grid-cols-12 lg:gap-stack-lg", children: /* @__PURE__ */ p("header", { className: "lg:col-span-8 max-w-3xl", children: [
      /* @__PURE__ */ p("div", { className: "flex flex-wrap items-center gap-stack-md mb-stack-md", children: [
        n && /* @__PURE__ */ l(
          "a",
          {
            href: `/${sa(n)}`,
            className: "bg-secondary-container text-on-secondary-container px-3 py-1 rounded-full text-label-caps font-semibold uppercase tracking-wider hover:opacity-90 transition-opacity",
            children: n.name
          }
        ),
        y && /* @__PURE__ */ p("div", { className: "flex items-center text-on-surface-variant text-body-md", children: [
          /* @__PURE__ */ l("span", { className: "material-symbols-outlined text-[18px] mr-1", children: "calendar_today" }),
          /* @__PURE__ */ l("span", { children: y })
        ] }),
        t && /* @__PURE__ */ p("div", { className: "flex items-center text-on-surface-variant text-body-md", children: [
          /* @__PURE__ */ l("span", { className: "material-symbols-outlined text-[18px] mr-1", children: "person" }),
          /* @__PURE__ */ l("span", { children: t.displayName })
        ] })
      ] }),
      /* @__PURE__ */ l("h1", { className: "text-h2 md:text-h1 font-bold text-primary leading-tight", children: r.title })
    ] }) }) }),
    /* @__PURE__ */ p("div", { className: "px-gutter pb-section-padding max-w-container-max mx-auto grid grid-cols-1 lg:grid-cols-12 gap-stack-lg", children: [
      /* @__PURE__ */ p("div", { className: "lg:col-span-8 max-w-3xl", children: [
        /* @__PURE__ */ l(
          "div",
          {
            className: "corporate-prose",
            dangerouslySetInnerHTML: { __html: e }
          }
        ),
        o.length > 0 && /* @__PURE__ */ l("div", { className: "mt-stack-lg pt-stack-md border-t border-outline-variant/30 flex flex-wrap gap-2", children: o.map((P) => /* @__PURE__ */ p(
          "span",
          {
            className: "px-3 py-1 bg-surface-container-high rounded-full text-label-caps font-semibold text-primary",
            children: [
              "#",
              P.name
            ]
          },
          P.id
        )) }),
        /* @__PURE__ */ p("div", { className: "mt-section-padding pt-stack-lg border-t border-outline-variant/50", children: [
          /* @__PURE__ */ l("h4", { className: "text-label-caps font-semibold text-on-surface-variant uppercase tracking-wider mb-stack-md", children: s("publicBaked.shareThisArticle") }),
          /* @__PURE__ */ p("div", { className: "flex gap-4", children: [
            /* @__PURE__ */ l(
              "button",
              {
                type: "button",
                "data-cms-share": "native",
                className: "w-12 h-12 rounded-full bg-surface-container flex items-center justify-center text-primary transition-all hover:bg-secondary hover:text-on-secondary",
                children: /* @__PURE__ */ l("span", { className: "material-symbols-outlined", children: "share" })
              }
            ),
            /* @__PURE__ */ l(
              "button",
              {
                type: "button",
                "data-cms-share": "copy",
                className: "w-12 h-12 rounded-full bg-surface-container flex items-center justify-center text-primary transition-all hover:bg-secondary hover:text-on-secondary",
                children: /* @__PURE__ */ l("span", { className: "material-symbols-outlined", children: "link" })
              }
            )
          ] })
        ] })
      ] }),
      /* @__PURE__ */ p("aside", { className: "lg:col-span-4 space-y-stack-lg", children: [
        d.showAuthorBio && r.authorId && /* @__PURE__ */ l(
          "section",
          {
            className: "corporate-bio-card",
            "data-cms-author-bio": !0,
            "data-cms-author-id": r.authorId,
            "data-cms-bio-label": s("publicBaked.author"),
            hidden: !0
          }
        ),
        d.showPopularArticles && /* @__PURE__ */ l(
          "section",
          {
            className: "corporate-related-card",
            "data-cms-related": !0,
            "data-cms-current-id": r.id,
            "data-cms-term-id": r.primaryTermId ?? "",
            "data-cms-limit": "3",
            "data-cms-label": h,
            "data-cms-fallback-label": h
          }
        ),
        d.showCta && /* @__PURE__ */ l("div", { className: "corporate-cta-card", children: /* @__PURE__ */ p("div", { className: "relative z-10", children: [
          /* @__PURE__ */ l("h4", { className: "text-h2 font-bold mb-stack-sm", children: m }),
          i.settings.description && /* @__PURE__ */ l("p", { className: "text-body-md opacity-80 mb-stack-lg", children: i.settings.description }),
          /* @__PURE__ */ l(
            "a",
            {
              href: b,
              className: "block w-full text-center bg-secondary text-on-secondary py-3 rounded-lg text-button font-semibold hover:bg-secondary/90 transition-all shadow-lg",
              children: f
            }
          )
        ] }) })
      ] })
    ] })
  ] });
}
function yo({
  term: r,
  posts: e,
  categoryRssUrl: t,
  archivesLink: a,
  allCategories: n,
  site: o
}) {
  const i = He.getFixedT(Re(o.settings.language), "theme-corporate");
  return /* @__PURE__ */ p(Ee, { children: [
    /* @__PURE__ */ p("section", { className: "relative overflow-hidden bg-primary py-section-padding", children: [
      /* @__PURE__ */ l("div", { className: "absolute inset-0 opacity-20", children: /* @__PURE__ */ l("div", { className: "absolute inset-0 bg-gradient-to-br from-secondary to-transparent" }) }),
      /* @__PURE__ */ p("div", { className: "max-w-container-max mx-auto px-gutter relative z-10", children: [
        /* @__PURE__ */ p("nav", { className: "flex items-center gap-2 mb-6 text-on-primary-container text-label-caps font-semibold uppercase tracking-wider", children: [
          /* @__PURE__ */ l("a", { className: "hover:text-secondary-fixed", href: o.homePath ?? "/index.html", children: i("publicBaked.home") }),
          /* @__PURE__ */ l("span", { className: "material-symbols-outlined text-[14px]", children: "chevron_right" }),
          /* @__PURE__ */ l("span", { className: "text-secondary-fixed", children: r.name })
        ] }),
        /* @__PURE__ */ p("div", { className: "max-w-3xl", children: [
          /* @__PURE__ */ l("h1", { className: "text-h1 font-bold text-on-primary mb-6", children: r.name }),
          r.description && /* @__PURE__ */ l("p", { className: "text-body-lg text-on-primary-container leading-relaxed", children: r.description }),
          t && /* @__PURE__ */ p(
            "a",
            {
              href: t,
              className: "inline-flex items-center gap-2 mt-stack-md text-secondary-fixed hover:text-on-primary",
              children: [
                /* @__PURE__ */ l("span", { className: "material-symbols-outlined", children: "rss_feed" }),
                i("publicBaked.follow")
              ]
            }
          )
        ] })
      ] })
    ] }),
    /* @__PURE__ */ l("section", { className: "max-w-container-max mx-auto px-gutter py-16", children: /* @__PURE__ */ p("div", { className: "flex flex-col lg:flex-row gap-12", children: [
      /* @__PURE__ */ p("div", { className: "flex-1", children: [
        e.length === 0 ? /* @__PURE__ */ l("p", { className: "text-on-surface-variant", children: i("publicBaked.noPostsCategory") }) : /* @__PURE__ */ l("div", { className: "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-stack-lg", children: e.map((s) => /* @__PURE__ */ p(
          "article",
          {
            className: "bg-surface-container-lowest rounded-xl shadow-sm border border-outline-variant/30 overflow-hidden flex flex-col group",
            children: [
              s.hero && /* @__PURE__ */ p(
                "a",
                {
                  href: `/${s.url}`,
                  className: "relative aspect-video overflow-hidden block",
                  children: [
                    /* @__PURE__ */ l(
                      "img",
                      {
                        src: rt(s.hero, "medium"),
                        alt: s.hero.alt ?? s.title,
                        className: "w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      }
                    ),
                    /* @__PURE__ */ l("div", { className: "absolute top-4 left-4", children: /* @__PURE__ */ l("span", { className: "bg-secondary/90 text-on-secondary text-label-caps font-semibold px-3 py-1 rounded-full backdrop-blur", children: r.name }) })
                  ]
                }
              ),
              /* @__PURE__ */ p("div", { className: "p-6 flex flex-col flex-1", children: [
                s.dateLabel && /* @__PURE__ */ l("span", { className: "text-label-caps font-semibold text-on-primary-container mb-2", children: s.dateLabel }),
                /* @__PURE__ */ l("h3", { className: "text-h3 font-semibold text-primary mb-3 group-hover:text-secondary transition-colors", children: /* @__PURE__ */ l("a", { href: `/${s.url}`, children: s.title }) }),
                s.excerpt && /* @__PURE__ */ l("p", { className: "text-body-md text-on-surface-variant mb-6 flex-1", children: s.excerpt }),
                /* @__PURE__ */ p(
                  "a",
                  {
                    href: `/${s.url}`,
                    className: "inline-flex items-center gap-2 text-button font-semibold text-secondary group-hover:gap-3 transition-all",
                    children: [
                      i("publicBaked.readMore"),
                      /* @__PURE__ */ l("span", { className: "material-symbols-outlined text-[18px]", children: "arrow_forward" })
                    ]
                  }
                )
              ] })
            ]
          },
          s.id
        )) }),
        a && /* @__PURE__ */ l("div", { className: "mt-stack-lg flex justify-center", children: /* @__PURE__ */ l("a", { className: "archives-link", href: a.href, children: a.label }) })
      ] }),
      /* @__PURE__ */ l("aside", { className: "w-full lg:w-80 shrink-0 space-y-stack-lg", children: n && n.length > 0 && /* @__PURE__ */ p("div", { className: "bg-surface-container-lowest p-6 rounded-xl border border-outline-variant/30 shadow-sm", children: [
        /* @__PURE__ */ l("h4", { className: "text-h3 font-semibold text-primary mb-stack-md", children: i("publicBaked.section") }),
        /* @__PURE__ */ l("ul", { className: "space-y-3", children: n.map((s) => {
          const c = s.id === r.id;
          return /* @__PURE__ */ l("li", { children: /* @__PURE__ */ l(
            "a",
            {
              href: `/${sa(s)}`,
              className: "flex justify-between items-center group",
              children: /* @__PURE__ */ l(
                "span",
                {
                  className: c ? "text-secondary font-bold" : "text-on-surface-variant group-hover:text-secondary transition-colors",
                  children: s.name
                }
              )
            }
          ) }, s.id);
        }) })
      ] }) })
    ] }) })
  ] });
}
function vo({
  author: r,
  posts: e,
  site: t
}) {
  const a = He.getFixedT(Re(t.settings.language), "theme-corporate"), n = r.avatar ? rt(r.avatar, "medium") : "";
  return /* @__PURE__ */ p(Ee, { children: [
    /* @__PURE__ */ l("header", { className: "bg-surface-container-low py-section-padding", children: /* @__PURE__ */ l("div", { className: "max-w-container-max mx-auto px-gutter", children: /* @__PURE__ */ p("div", { className: "flex flex-col md:flex-row items-center md:items-start gap-stack-lg", children: [
      /* @__PURE__ */ l("div", { className: "w-48 h-48 rounded-xl overflow-hidden shadow-xl flex-shrink-0 bg-surface-container-high", children: n && /* @__PURE__ */ l(
        "img",
        {
          src: n,
          alt: r.displayName,
          className: "w-full h-full object-cover"
        }
      ) }),
      /* @__PURE__ */ p("div", { className: "flex-grow text-center md:text-left", children: [
        /* @__PURE__ */ p("div", { className: "flex flex-col md:flex-row md:items-center gap-4 mb-4", children: [
          /* @__PURE__ */ l("h1", { className: "text-h1 font-bold text-primary", children: r.displayName }),
          r.title && /* @__PURE__ */ l("span", { className: "bg-secondary-container text-on-secondary-container px-3 py-1 rounded-full text-label-caps font-semibold inline-block self-center md:self-auto", children: r.title })
        ] }),
        r.bio && /* @__PURE__ */ l("p", { className: "text-body-lg text-on-surface-variant max-w-3xl mb-stack-lg", children: r.bio }),
        r.socials && r.socials.length > 0 && /* @__PURE__ */ l("div", { className: "flex justify-center md:justify-start gap-stack-md", children: r.socials.map((o) => /* @__PURE__ */ l(
          "a",
          {
            href: o.url,
            target: "_blank",
            rel: "noopener noreferrer",
            "aria-label": Er(o.network),
            title: Er(o.network),
            className: "w-10 h-10 rounded-full bg-surface-container-high flex items-center justify-center text-primary hover:bg-secondary hover:text-on-secondary transition-all",
            children: /* @__PURE__ */ l(Pn, { network: o.network })
          },
          o.network
        )) })
      ] }),
      /* @__PURE__ */ p("div", { className: "bg-surface-container-lowest p-6 rounded-xl shadow-sm border border-outline-variant/30 flex flex-col items-center justify-center min-w-[200px]", children: [
        /* @__PURE__ */ l("span", { className: "text-h2 font-bold text-secondary", children: e.length }),
        /* @__PURE__ */ l("span", { className: "text-label-caps font-semibold text-on-surface-variant uppercase tracking-wider", children: a("publicBaked.articlesPublished") })
      ] })
    ] }) }) }),
    /* @__PURE__ */ l("section", { className: "max-w-container-max mx-auto px-gutter py-section-padding", children: e.length === 0 ? /* @__PURE__ */ l("p", { className: "text-on-surface-variant", children: a("publicBaked.noPostsAuthor") }) : /* @__PURE__ */ l("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-stack-md", children: e.map((o) => /* @__PURE__ */ p(
      "article",
      {
        className: "bg-surface-container-lowest rounded-xl overflow-hidden shadow-sm border border-outline-variant/10 hover:shadow-lg transition-all group",
        children: [
          o.hero && /* @__PURE__ */ l("a", { href: `/${o.url}`, className: "block h-48 overflow-hidden", children: /* @__PURE__ */ l(
            "img",
            {
              src: rt(o.hero, "medium"),
              alt: o.hero.alt ?? o.title,
              className: "w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            }
          ) }),
          /* @__PURE__ */ p("div", { className: "p-6", children: [
            /* @__PURE__ */ p("div", { className: "flex items-center gap-2 mb-3", children: [
              o.category && /* @__PURE__ */ l("span", { className: "text-label-caps font-semibold text-secondary", children: o.category.name }),
              o.dateLabel && /* @__PURE__ */ p(Ee, { children: [
                /* @__PURE__ */ l("span", { className: "text-on-surface-variant", children: "•" }),
                /* @__PURE__ */ l("span", { className: "text-label-caps font-semibold text-on-surface-variant", children: o.dateLabel })
              ] })
            ] }),
            /* @__PURE__ */ l("h3", { className: "text-h3 font-semibold text-primary mb-3 group-hover:text-secondary transition-colors", children: /* @__PURE__ */ l("a", { href: `/${o.url}`, children: o.title }) }),
            o.excerpt && /* @__PURE__ */ l("p", { className: "text-body-md text-on-surface-variant mb-stack-md line-clamp-3", children: o.excerpt }),
            /* @__PURE__ */ p(
              "a",
              {
                href: `/${o.url}`,
                className: "inline-flex items-center gap-2 text-button font-semibold text-secondary group-hover:underline",
                children: [
                  a("publicBaked.readArticle"),
                  /* @__PURE__ */ l("span", { className: "material-symbols-outlined text-[18px]", children: "arrow_forward" })
                ]
              }
            )
          ] })
        ]
      },
      o.id
    )) }) })
  ] });
}
function wo({
  message: r,
  site: e
}) {
  const t = He.getFixedT(Re(e.settings.language), "theme-corporate");
  return /* @__PURE__ */ l("section", { className: "max-w-container-max mx-auto px-gutter py-section-padding", children: /* @__PURE__ */ p("div", { className: "max-w-2xl mx-auto text-center", children: [
    /* @__PURE__ */ l("p", { className: "text-label-caps font-semibold text-secondary uppercase tracking-wider mb-stack-md", children: t("publicBaked.notFoundTitle") }),
    /* @__PURE__ */ l("h1", { className: "text-h1 font-bold text-primary mb-stack-md", children: r ?? t("publicBaked.notFoundMessage") }),
    /* @__PURE__ */ p(
      "a",
      {
        href: "/index.html",
        className: "inline-flex items-center gap-2 bg-secondary text-on-secondary px-8 py-4 rounded-xl text-button font-semibold hover:bg-secondary/90 transition-all shadow-lg",
        children: [
          t("publicBaked.backToHome"),
          /* @__PURE__ */ l("span", { className: "material-symbols-outlined", children: "arrow_forward" })
        ]
      }
    )
  ] }) });
}
const Hr = '@import"https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap";@import"https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@24,400,0,0&display=swap";*,:after,:before{--tw-border-spacing-x:0;--tw-border-spacing-y:0;--tw-translate-x:0;--tw-translate-y:0;--tw-rotate:0;--tw-skew-x:0;--tw-skew-y:0;--tw-scale-x:1;--tw-scale-y:1;--tw-pan-x: ;--tw-pan-y: ;--tw-pinch-zoom: ;--tw-scroll-snap-strictness:proximity;--tw-gradient-from-position: ;--tw-gradient-via-position: ;--tw-gradient-to-position: ;--tw-ordinal: ;--tw-slashed-zero: ;--tw-numeric-figure: ;--tw-numeric-spacing: ;--tw-numeric-fraction: ;--tw-ring-inset: ;--tw-ring-offset-width:0px;--tw-ring-offset-color:#fff;--tw-ring-color:rgba(59,130,246,.5);--tw-ring-offset-shadow:0 0 #0000;--tw-ring-shadow:0 0 #0000;--tw-shadow:0 0 #0000;--tw-shadow-colored:0 0 #0000;--tw-blur: ;--tw-brightness: ;--tw-contrast: ;--tw-grayscale: ;--tw-hue-rotate: ;--tw-invert: ;--tw-saturate: ;--tw-sepia: ;--tw-drop-shadow: ;--tw-backdrop-blur: ;--tw-backdrop-brightness: ;--tw-backdrop-contrast: ;--tw-backdrop-grayscale: ;--tw-backdrop-hue-rotate: ;--tw-backdrop-invert: ;--tw-backdrop-opacity: ;--tw-backdrop-saturate: ;--tw-backdrop-sepia: ;--tw-contain-size: ;--tw-contain-layout: ;--tw-contain-paint: ;--tw-contain-style: }::backdrop{--tw-border-spacing-x:0;--tw-border-spacing-y:0;--tw-translate-x:0;--tw-translate-y:0;--tw-rotate:0;--tw-skew-x:0;--tw-skew-y:0;--tw-scale-x:1;--tw-scale-y:1;--tw-pan-x: ;--tw-pan-y: ;--tw-pinch-zoom: ;--tw-scroll-snap-strictness:proximity;--tw-gradient-from-position: ;--tw-gradient-via-position: ;--tw-gradient-to-position: ;--tw-ordinal: ;--tw-slashed-zero: ;--tw-numeric-figure: ;--tw-numeric-spacing: ;--tw-numeric-fraction: ;--tw-ring-inset: ;--tw-ring-offset-width:0px;--tw-ring-offset-color:#fff;--tw-ring-color:rgba(59,130,246,.5);--tw-ring-offset-shadow:0 0 #0000;--tw-ring-shadow:0 0 #0000;--tw-shadow:0 0 #0000;--tw-shadow-colored:0 0 #0000;--tw-blur: ;--tw-brightness: ;--tw-contrast: ;--tw-grayscale: ;--tw-hue-rotate: ;--tw-invert: ;--tw-saturate: ;--tw-sepia: ;--tw-drop-shadow: ;--tw-backdrop-blur: ;--tw-backdrop-brightness: ;--tw-backdrop-contrast: ;--tw-backdrop-grayscale: ;--tw-backdrop-hue-rotate: ;--tw-backdrop-invert: ;--tw-backdrop-opacity: ;--tw-backdrop-saturate: ;--tw-backdrop-sepia: ;--tw-contain-size: ;--tw-contain-layout: ;--tw-contain-paint: ;--tw-contain-style: }/*! tailwindcss v3.4.19 | MIT License | https://tailwindcss.com*/*,:after,:before{box-sizing:border-box;border:0 solid #e5e7eb}:after,:before{--tw-content:""}:host,html{line-height:1.5;-webkit-text-size-adjust:100%;-moz-tab-size:4;-o-tab-size:4;tab-size:4;font-family:var(--font-sans),Inter,system-ui,sans-serif;font-feature-settings:normal;font-variation-settings:normal;-webkit-tap-highlight-color:transparent}body{margin:0;line-height:inherit}hr{height:0;color:inherit;border-top-width:1px}abbr:where([title]){-webkit-text-decoration:underline dotted;text-decoration:underline dotted}h1,h2,h3,h4,h5,h6{font-size:inherit;font-weight:inherit}a{color:inherit;text-decoration:inherit}b,strong{font-weight:bolder}code,kbd,pre,samp{font-family:ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,Liberation Mono,Courier New,monospace;font-feature-settings:normal;font-variation-settings:normal;font-size:1em}small{font-size:80%}sub,sup{font-size:75%;line-height:0;position:relative;vertical-align:baseline}sub{bottom:-.25em}sup{top:-.5em}table{text-indent:0;border-color:inherit;border-collapse:collapse}button,input,optgroup,select,textarea{font-family:inherit;font-feature-settings:inherit;font-variation-settings:inherit;font-size:100%;font-weight:inherit;line-height:inherit;letter-spacing:inherit;color:inherit;margin:0;padding:0}button,select{text-transform:none}button,input:where([type=button]),input:where([type=reset]),input:where([type=submit]){-webkit-appearance:button;background-color:transparent;background-image:none}:-moz-focusring{outline:auto}:-moz-ui-invalid{box-shadow:none}progress{vertical-align:baseline}::-webkit-inner-spin-button,::-webkit-outer-spin-button{height:auto}[type=search]{-webkit-appearance:textfield;outline-offset:-2px}::-webkit-search-decoration{-webkit-appearance:none}::-webkit-file-upload-button{-webkit-appearance:button;font:inherit}summary{display:list-item}blockquote,dd,dl,figure,h1,h2,h3,h4,h5,h6,hr,p,pre{margin:0}fieldset{margin:0}fieldset,legend{padding:0}menu,ol,ul{list-style:none;margin:0;padding:0}dialog{padding:0}textarea{resize:vertical}input::-moz-placeholder,textarea::-moz-placeholder{opacity:1;color:#9ca3af}input::placeholder,textarea::placeholder{opacity:1;color:#9ca3af}[role=button],button{cursor:pointer}:disabled{cursor:default}audio,canvas,embed,iframe,img,object,svg,video{display:block;vertical-align:middle}img,video{max-width:100%;height:auto}[hidden]:where(:not([hidden=until-found])){display:none}:root{--color-primary:9 20 38;--color-on-primary:255 255 255;--color-primary-container:30 41 59;--color-on-primary-container:133 144 166;--color-primary-fixed:216 227 251;--color-primary-fixed-dim:188 199 222;--color-on-primary-fixed:17 28 45;--color-on-primary-fixed-variant:60 71 90;--color-secondary:75 65 225;--color-on-secondary:255 255 255;--color-secondary-container:100 94 251;--color-on-secondary-container:255 251 255;--color-secondary-fixed:226 223 255;--color-secondary-fixed-dim:195 192 255;--color-tertiary:0 22 36;--color-on-tertiary:255 255 255;--color-tertiary-container:0 44 66;--color-on-tertiary-container:0 153 217;--color-tertiary-fixed:201 230 255;--color-tertiary-fixed-dim:137 206 255;--color-background:247 249 251;--color-surface:247 249 251;--color-surface-bright:247 249 251;--color-surface-container-lowest:255 255 255;--color-surface-container-low:242 244 246;--color-surface-container:236 238 240;--color-surface-container-high:230 232 234;--color-surface-container-highest:224 227 229;--color-on-surface:25 28 30;--color-on-surface-variant:69 71 76;--color-outline:117 119 125;--color-outline-variant:197 198 205;--color-error:186 26 26;--color-on-error:255 255 255;--font-sans:"Inter"}body{background-color:rgb(var(--color-background));color:rgb(var(--color-on-surface));font-family:var(--font-sans),system-ui,sans-serif;-webkit-font-smoothing:antialiased}.container{width:100%}@media(min-width:640px){.container{max-width:640px}}@media(min-width:768px){.container{max-width:768px}}@media(min-width:1024px){.container{max-width:1024px}}@media(min-width:1280px){.container{max-width:1280px}}@media(min-width:1536px){.container{max-width:1536px}}.corporate-prose{font-size:1.125rem;line-height:1.75;color:rgb(var(--color-on-surface-variant))}.corporate-page-body--flow>:is(p,ul,ol,dl,blockquote,table,figure,pre,.cms-columns){font-size:1.125rem;line-height:1.75;color:rgb(var(--color-on-surface-variant))}.corporate-page-body--flow>:not(section){box-sizing:border-box;width:min(100% - 3rem,48rem);margin-left:auto;margin-right:auto}.corporate-page-body--flow>:is(.cms-columns,table){width:min(100% - 3rem,64rem)}.corporate-page-body--flow>section+:not(section){margin-top:3rem}:is(.corporate-prose,.corporate-page-body--flow,.corporate-prose .cms-column,.corporate-page-body--flow .cms-column)>:first-child{margin-top:0}:is(.corporate-prose,.corporate-page-body--flow,.corporate-prose .cms-column,.corporate-page-body--flow .cms-column)>p{margin-bottom:1.5rem}:is(.corporate-prose,.corporate-page-body--flow,.corporate-prose .cms-column,.corporate-page-body--flow .cms-column)>:is(h1,h2){font-size:2.25rem;font-weight:700;line-height:1.3;letter-spacing:-.01em;color:rgb(var(--color-primary));margin-top:2.5rem;margin-bottom:1rem}@media(max-width:640px){:is(.corporate-prose,.corporate-page-body--flow,.corporate-prose .cms-column,.corporate-page-body--flow .cms-column)>:is(h1,h2){font-size:1.75rem}}:is(.corporate-prose,.corporate-page-body--flow,.corporate-prose .cms-column,.corporate-page-body--flow .cms-column)>:is(h1,h2,h3,h4,h5,h6){overflow-wrap:break-word}:is(.corporate-prose,.corporate-page-body--flow,.corporate-prose .cms-column,.corporate-page-body--flow .cms-column)>h3{font-size:1.5rem;font-weight:600;line-height:1.4;color:rgb(var(--color-primary));margin-top:2rem;margin-bottom:.75rem}:is(.corporate-prose,.corporate-page-body--flow,.corporate-prose .cms-column,.corporate-page-body--flow .cms-column)>:is(h4,h5,h6){font-size:1.25rem;font-weight:600;line-height:1.4;color:rgb(var(--color-primary));margin-top:1.75rem;margin-bottom:.5rem}:is(.corporate-prose,.corporate-page-body--flow,.corporate-prose .cms-column,.corporate-page-body--flow .cms-column)>:is(h5,h6){font-size:1.0625rem}:is(.corporate-prose,.corporate-page-body--flow,.corporate-prose .cms-column,.corporate-page-body--flow .cms-column)>blockquote{margin:2rem auto;border-left:4px solid rgb(var(--color-secondary));padding:1rem 1.5rem;font-style:italic;color:rgb(var(--color-primary));background:rgb(var(--color-surface-container-low));border-radius:0 .5rem .5rem 0}:is(.corporate-prose,.corporate-page-body--flow,.corporate-prose .cms-column,.corporate-page-body--flow .cms-column)>blockquote>p:last-child{margin-bottom:0}:is(.corporate-prose,.corporate-page-body--flow,.corporate-prose .cms-column,.corporate-page-body--flow .cms-column)>:is(ul,ol){padding-left:1.5rem;margin-bottom:1.5rem}:is(.corporate-prose,.corporate-page-body--flow,.corporate-prose .cms-column,.corporate-page-body--flow .cms-column) :is(ul,ol) :is(ul,ol){padding-left:1.5rem;margin-top:.5rem}:is(.corporate-prose,.corporate-page-body--flow)>ul ul,:is(.corporate-prose,.corporate-page-body--flow,.corporate-prose .cms-column,.corporate-page-body--flow .cms-column)>ul{list-style-type:disc}:is(.corporate-prose,.corporate-page-body--flow)>ol ol,:is(.corporate-prose,.corporate-page-body--flow,.corporate-prose .cms-column,.corporate-page-body--flow .cms-column)>ol{list-style-type:decimal}:is(.corporate-prose,.corporate-page-body--flow,.corporate-prose .cms-column,.corporate-page-body--flow .cms-column)>:is(ul,ol) li{margin-bottom:.5rem}:is(.corporate-prose,.corporate-page-body--flow,.corporate-prose .cms-column,.corporate-page-body--flow .cms-column)>:is(ul,ol) li>p{margin-bottom:.5rem}:is(.corporate-prose,.corporate-page-body--flow,.corporate-prose .cms-column,.corporate-page-body--flow .cms-column)>:is(ul,ol) li::marker{color:rgb(var(--color-secondary))}:is(.corporate-prose,.corporate-page-body--flow,.corporate-prose .cms-column,.corporate-page-body--flow .cms-column)>hr{border:0;border-top:1px solid rgb(var(--color-outline-variant));margin:2.5rem auto}:is(.corporate-prose,.corporate-page-body--flow,.corporate-prose .cms-column,.corporate-page-body--flow .cms-column)>table{width:100%;border-collapse:collapse;margin:2rem auto;font-size:1rem;line-height:1.5;background:rgb(var(--color-surface-container-lowest));border:1px solid rgb(var(--color-outline-variant)/.6);border-radius:.75rem;border-spacing:0;overflow:hidden}:is(.corporate-prose,.corporate-page-body--flow,.corporate-prose .cms-column,.corporate-page-body--flow .cms-column)>table :is(th,td){padding:.75rem 1rem;text-align:left;vertical-align:top;border-bottom:1px solid rgb(var(--color-outline-variant)/.5)}:is(.corporate-prose,.corporate-page-body--flow,.corporate-prose .cms-column,.corporate-page-body--flow .cms-column)>table th{font-weight:600;color:rgb(var(--color-primary));background:rgb(var(--color-surface-container-low))}:is(.corporate-prose,.corporate-page-body--flow,.corporate-prose .cms-column,.corporate-page-body--flow .cms-column)>table tbody tr:last-child>*{border-bottom:0}@media(max-width:640px){:is(.corporate-prose,.corporate-page-body--flow,.corporate-prose .cms-column,.corporate-page-body--flow .cms-column)>table{display:block;overflow-x:auto}}:is(.corporate-prose,.corporate-page-body--flow,.corporate-prose .cms-column,.corporate-page-body--flow .cms-column)>dl dt{font-weight:600;color:rgb(var(--color-primary))}:is(.corporate-prose,.corporate-page-body--flow,.corporate-prose .cms-column,.corporate-page-body--flow .cms-column)>dl dd{margin:0 0 1rem 1rem}:is(.corporate-prose,.corporate-page-body--flow,.corporate-prose .cms-column,.corporate-page-body--flow .cms-column)>figure{margin:2rem auto}:is(.corporate-prose,.corporate-page-body--flow,.corporate-prose .cms-column,.corporate-page-body--flow .cms-column)>figure figcaption{font-size:.875rem;color:rgb(var(--color-on-surface-variant));text-align:center;margin-top:-.75rem}.corporate-prose figure img,.corporate-prose img,:is(.corporate-page-body--flow,.corporate-page-body--flow .cms-column)>:is(p,figure) img{max-width:100%;height:auto;border-radius:.75rem;margin:1.5rem 0;box-shadow:0 4px 6px -1px #00000014}.corporate-prose a,:is(.corporate-page-body--flow,.corporate-page-body--flow .cms-column)>:is(p,ul,ol,dl,blockquote,table,figure,h1,h2,h3,h4,h5,h6) a{color:rgb(var(--color-secondary));font-weight:500;text-decoration:underline;text-decoration-thickness:1px;text-underline-offset:3px}.corporate-prose a:hover,:is(.corporate-page-body--flow,.corporate-page-body--flow .cms-column)>:is(p,ul,ol,dl,blockquote,table,figure,h1,h2,h3,h4,h5,h6) a:hover{text-decoration-thickness:2px}:is(.corporate-prose,.corporate-page-body--flow>:is(p,ul,ol,dl,blockquote,table,h1,h2,h3,h4,h5,h6,.cms-columns)) code{background:rgb(var(--color-surface-container));padding:.125rem .375rem;border-radius:.25rem;font-size:.95em;font-family:ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,monospace}:is(.corporate-prose,.corporate-page-body--flow,.corporate-prose .cms-column,.corporate-page-body--flow .cms-column)>pre{background:rgb(var(--color-primary));color:rgb(var(--color-on-primary));padding:1rem 1.25rem;border-radius:.75rem;overflow-x:auto;margin:1.5rem auto;font-size:.95rem;line-height:1.6;font-family:ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,monospace}:is(.corporate-prose,.corporate-page-body--flow,.corporate-prose .cms-column,.corporate-page-body--flow .cms-column)>pre code{background:transparent;padding:0;color:inherit}:is(.corporate-prose,.corporate-page-body--flow)>.cms-columns{gap:2rem;margin-top:2rem;margin-bottom:2rem}.corporate-no-scrollbar{scrollbar-width:none;-ms-overflow-style:none}.corporate-no-scrollbar::-webkit-scrollbar{display:none}.corporate-slide{flex:0 0 100%;min-width:0}@media(min-width:768px){.corporate-slide{flex:0 0 calc(33.33333% - 1.33333rem)}}.glass-card{background:#ffffffb3;backdrop-filter:blur(10px);-webkit-backdrop-filter:blur(10px);border:1px solid rgba(226,232,240,.5)}.burger-toggle{background:transparent;border:0;cursor:pointer;padding:.25rem;line-height:0}.burger-menu{position:fixed;top:0;left:0;height:100vh;width:min(360px,80vw);background:rgb(var(--color-background));border-right:1px solid rgb(var(--color-outline-variant));transform:translate(-100%);transition:transform .25s ease;z-index:60;padding:4rem 1.5rem 1.5rem;overflow-y:auto}.burger-menu.is-open{transform:translate(0)}.burger-menu ul{list-style:none;padding:0;margin:0;display:flex;flex-direction:column;gap:.25rem}.burger-menu a{display:block;padding:.625rem 0;color:rgb(var(--color-on-surface));font-size:1.125rem;font-weight:500;text-decoration:none}.burger-menu a:hover{color:rgb(var(--color-secondary))}.burger-menu a[aria-current=page]{color:rgb(var(--color-secondary));font-weight:700}.burger-menu .menu-children{margin-left:1rem;margin-top:.25rem}.burger-menu .menu-children a{font-size:1rem;font-weight:400}.burger-close{position:absolute;top:1rem;right:1rem;background:transparent;border:0;color:rgb(var(--color-on-surface));cursor:pointer;padding:.5rem}.burger-backdrop{position:fixed;top:0;right:0;bottom:0;left:0;background:#0006;opacity:0;pointer-events:none;transition:opacity .25s ease;z-index:55}.burger-backdrop.is-open{opacity:1;pointer-events:auto}body.burger-open{overflow:hidden}.material-symbols-outlined{font-variation-settings:"FILL" 0,"wght" 400,"GRAD" 0,"opsz" 24;vertical-align:middle;line-height:1}.floating-label-group{position:relative}.floating-label-group input,.floating-label-group label,.floating-label-group select,.floating-label-group textarea{background:rgb(var(--color-surface-container-lowest))}.floating-label-group label{position:absolute;top:1rem;left:1rem;pointer-events:none;transition:all .2s ease;color:rgb(var(--color-outline));padding:0 .25rem}.floating-label-group input:not(:-moz-placeholder)~label,.floating-label-group textarea:not(:-moz-placeholder)~label{top:-.5rem;left:.75rem;font-size:.75rem;color:rgb(var(--color-secondary))}.floating-label-group input:focus~label,.floating-label-group input:not(:placeholder-shown)~label,.floating-label-group textarea:focus~label,.floating-label-group textarea:not(:placeholder-shown)~label,.floating-label-group.is-filled label{top:-.5rem;left:.75rem;font-size:.75rem;color:rgb(var(--color-secondary))}.corporate-bio-card{background:rgb(var(--color-surface-container-lowest));border:1px solid rgb(var(--color-outline-variant)/.4);border-radius:.75rem;padding:2rem;box-shadow:0 1px 3px #0000000f}.corporate-bio-eyebrow{font-size:.75rem;font-weight:600;letter-spacing:.05em;color:rgb(var(--color-secondary));text-transform:uppercase;margin-bottom:1rem}.corporate-bio-row{display:flex;align-items:center;gap:1rem;margin-bottom:1rem}.corporate-bio-avatar{width:4rem;height:4rem;border-radius:9999px;-o-object-fit:cover;object-fit:cover}.corporate-bio-name{font-size:1.5rem;font-weight:600;line-height:1.3;color:rgb(var(--color-primary))}.corporate-bio-title{font-size:.75rem;font-weight:600;letter-spacing:.05em;text-transform:uppercase}.corporate-bio-bio,.corporate-bio-title{color:rgb(var(--color-on-surface-variant))}.corporate-bio-bio{font-size:1rem;line-height:1.6;margin-bottom:1rem}.corporate-bio-socials{display:flex;gap:.5rem}.corporate-bio-social{display:inline-flex;align-items:center;justify-content:center;width:2.25rem;height:2.25rem;border-radius:9999px;color:rgb(var(--color-on-surface-variant));transition:color .15s ease,background-color .15s ease}.corporate-bio-social:hover{color:rgb(var(--color-secondary));background:rgb(var(--color-secondary-fixed))}.corporate-related-card{background:rgb(var(--color-surface-container-lowest));border:1px solid rgb(var(--color-outline-variant)/.3);border-radius:.75rem;padding:1.5rem}.corporate-related-heading{font-size:1.5rem;font-weight:600;color:rgb(var(--color-primary));margin-bottom:1.5rem}.corporate-related-list{display:flex;flex-direction:column;gap:1rem}.corporate-related-item{display:block;padding:.75rem 0}.corporate-related-item+.corporate-related-item{border-top:1px solid rgb(var(--color-outline-variant)/.2)}.corporate-related-eyebrow{font-size:.75rem;font-weight:600;letter-spacing:.05em;color:rgb(var(--color-secondary));text-transform:uppercase;margin-bottom:.25rem}.corporate-related-title{font-size:.875rem;font-weight:600;line-height:1.4;color:rgb(var(--color-primary));transition:color .15s ease;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}.corporate-related-item:hover .corporate-related-title{color:rgb(var(--color-secondary))}.corporate-related-meta{font-size:.75rem;font-weight:600;letter-spacing:.05em;color:rgb(var(--color-on-surface-variant));margin-top:.25rem}.corporate-cta-card{background:rgb(var(--color-primary));color:rgb(var(--color-on-primary));border-radius:.75rem;padding:2rem;position:relative;overflow:hidden;box-shadow:0 10px 25px -5px #0003}.corporate-cta-card:after{content:"";position:absolute;bottom:-2.5rem;right:-2.5rem;width:10rem;height:10rem;background:rgb(var(--color-secondary));border-radius:9999px;filter:blur(80px);opacity:.2;pointer-events:none}.archives{max-width:56rem;margin:0 auto;padding:2.5rem 0}.archives__header{margin-bottom:2.5rem;padding-bottom:1.5rem;border-bottom:1px solid rgb(var(--color-outline-variant)/.5)}.archives__title{font-size:3rem;font-weight:700;line-height:1.2;letter-spacing:-.02em;color:rgb(var(--color-primary))}.archives__subtitle{font-size:1.125rem;color:rgb(var(--color-on-surface-variant));margin-top:.75rem}.archives__groups,.archives__years{display:flex;flex-direction:column;gap:2.5rem}.archives__year{border-radius:.75rem;background:rgb(var(--color-surface-container-lowest));border:1px solid rgb(var(--color-outline-variant)/.3);padding:1.5rem 2rem;box-shadow:0 1px 3px #0000000a}.archives__group-heading,.archives__year-heading{font-size:1.5rem;font-weight:600;color:rgb(var(--color-primary));margin-bottom:1rem;padding-bottom:.5rem;border-bottom:1px solid rgb(var(--color-outline-variant)/.4)}.archives__group-link,.archives__year-link{color:inherit;text-decoration:none}.archives__group-link:hover,.archives__year-link:hover{color:rgb(var(--color-secondary))}.archives__list{list-style:none;padding:0;margin:0;display:flex;flex-direction:column;gap:.5rem}.archives__item{display:flex;align-items:baseline;gap:.75rem;padding:.5rem 0}.archives__item+.archives__item{border-top:1px solid rgb(var(--color-outline-variant)/.2)}.archives__item-date{flex-shrink:0;font-size:.75rem;font-weight:600;letter-spacing:.05em;color:rgb(var(--color-on-surface-variant));text-transform:uppercase;min-width:5rem}.archives__item-link{color:rgb(var(--color-on-surface));text-decoration:none;font-weight:500;transition:color .15s ease}.archives__item-link:hover{color:rgb(var(--color-secondary))}.archives__count{color:rgb(var(--color-on-surface-variant));font-size:.875rem;font-weight:400;margin-left:.5rem}.archives__drilldown{list-style:none;padding:0;margin:1rem 0 0;display:flex;flex-wrap:wrap;gap:.5rem}.archives__drilldown-item{list-style:none}.archives__drilldown-link{display:inline-block;padding:.375rem .875rem;background:rgb(var(--color-surface-container-low));border:1px solid rgb(var(--color-outline-variant)/.4);border-radius:9999px;color:rgb(var(--color-on-surface));text-decoration:none;font-size:.875rem;font-weight:500;transition:background-color .15s ease,color .15s ease}.archives__drilldown-link:hover{background:rgb(var(--color-secondary));color:rgb(var(--color-on-secondary))}.archives__back{display:inline-flex;align-items:center;gap:.375rem;color:rgb(var(--color-secondary));text-decoration:none;font-size:.875rem;font-weight:600;margin-bottom:1rem}.archives__back:hover{text-decoration:underline}.archives__empty{color:rgb(var(--color-on-surface-variant));font-style:italic;padding:2rem 0;text-align:center}.archives-link{display:inline-flex;align-items:center;gap:.375rem;margin-top:1.5rem;color:rgb(var(--color-secondary));text-decoration:none;font-weight:600}.archives-link:hover{text-decoration:underline}.pointer-events-none{pointer-events:none}.visible{visibility:visible}.invisible{visibility:hidden}.static{position:static}.fixed{position:fixed}.absolute{position:absolute}.relative{position:relative}.sticky{position:sticky}.inset-0{top:0;right:0;bottom:0;left:0}.-bottom-20{bottom:-5rem}.-right-20{right:-5rem}.bottom-0{bottom:0}.bottom-8{bottom:2rem}.left-0{left:0}.left-4{left:1rem}.right-0{right:0}.right-4{right:1rem}.right-8{right:2rem}.top-0{top:0}.top-1\\/2{top:50%}.top-4{top:1rem}.-z-0,.z-0{z-index:0}.z-10{z-index:10}.z-40{z-index:40}.z-50{z-index:50}.col-span-2{grid-column:span 2/span 2}.mx-auto{margin-left:auto;margin-right:auto}.my-4{margin-top:1rem;margin-bottom:1rem}.-mb-px{margin-bottom:-1px}.mb-10{margin-bottom:2.5rem}.mb-2{margin-bottom:.5rem}.mb-3{margin-bottom:.75rem}.mb-4{margin-bottom:1rem}.mb-6{margin-bottom:1.5rem}.mb-8{margin-bottom:2rem}.mb-section-padding{margin-bottom:5rem}.mb-stack-lg{margin-bottom:2rem}.mb-stack-md{margin-bottom:1rem}.mb-stack-sm{margin-bottom:.5rem}.ml-6{margin-left:1.5rem}.mr-1{margin-right:.25rem}.mt-0\\.5{margin-top:.125rem}.mt-1{margin-top:.25rem}.mt-2{margin-top:.5rem}.mt-3{margin-top:.75rem}.mt-4{margin-top:1rem}.mt-section-padding{margin-top:5rem}.mt-stack-lg{margin-top:2rem}.mt-stack-md{margin-top:1rem}.line-clamp-2{-webkit-line-clamp:2}.line-clamp-2,.line-clamp-3{overflow:hidden;display:-webkit-box;-webkit-box-orient:vertical}.line-clamp-3{-webkit-line-clamp:3}.block{display:block}.inline-block{display:inline-block}.inline{display:inline}.flex{display:flex}.inline-flex{display:inline-flex}.grid{display:grid}.hidden{display:none}.aspect-\\[16\\/10\\]{aspect-ratio:16/10}.aspect-\\[21\\/9\\]{aspect-ratio:21/9}.aspect-video{aspect-ratio:16/9}.h-10{height:2.5rem}.h-12{height:3rem}.h-14{height:3.5rem}.h-16{height:4rem}.h-20{height:5rem}.h-3{height:.75rem}.h-4{height:1rem}.h-48{height:12rem}.h-5{height:1.25rem}.h-64{height:16rem}.h-8{height:2rem}.h-96{height:24rem}.h-full{height:100%}.min-h-\\[600px\\]{min-height:600px}.w-10{width:2.5rem}.w-12{width:3rem}.w-14{width:3.5rem}.w-24{width:6rem}.w-3{width:.75rem}.w-4{width:1rem}.w-40{width:10rem}.w-48{width:12rem}.w-5{width:1.25rem}.w-64{width:16rem}.w-96{width:24rem}.w-auto{width:auto}.w-full{width:100%}.min-w-0{min-width:0}.min-w-\\[200px\\]{min-width:200px}.max-w-2xl{max-width:42rem}.max-w-3xl{max-width:48rem}.max-w-4xl{max-width:56rem}.max-w-\\[240px\\]{max-width:240px}.max-w-container-max{max-width:1280px}.max-w-sm{max-width:24rem}.max-w-xl{max-width:36rem}.flex-1{flex:1 1 0%}.flex-shrink-0,.shrink-0{flex-shrink:0}.flex-grow{flex-grow:1}.-translate-x-1\\/2{--tw-translate-x:-50%}.-translate-x-1\\/2,.-translate-y-1\\/2{transform:translate(var(--tw-translate-x),var(--tw-translate-y)) rotate(var(--tw-rotate)) skew(var(--tw-skew-x)) skewY(var(--tw-skew-y)) scaleX(var(--tw-scale-x)) scaleY(var(--tw-scale-y))}.-translate-y-1\\/2{--tw-translate-y:-50%}.translate-x-1\\/2{--tw-translate-x:50%}.translate-x-1\\/2,.translate-y-1\\/2{transform:translate(var(--tw-translate-x),var(--tw-translate-y)) rotate(var(--tw-rotate)) skew(var(--tw-skew-x)) skewY(var(--tw-skew-y)) scaleX(var(--tw-scale-x)) scaleY(var(--tw-scale-y))}.translate-y-1\\/2{--tw-translate-y:50%}.transform{transform:translate(var(--tw-translate-x),var(--tw-translate-y)) rotate(var(--tw-rotate)) skew(var(--tw-skew-x)) skewY(var(--tw-skew-y)) scaleX(var(--tw-scale-x)) scaleY(var(--tw-scale-y))}@keyframes spin{to{transform:rotate(1turn)}}.animate-spin{animation:spin 1s linear infinite}.cursor-pointer{cursor:pointer}.resize-none{resize:none}.snap-x{scroll-snap-type:x var(--tw-scroll-snap-strictness)}.snap-mandatory{--tw-scroll-snap-strictness:mandatory}.snap-start{scroll-snap-align:start}.appearance-none{-webkit-appearance:none;-moz-appearance:none;appearance:none}.grid-cols-1{grid-template-columns:repeat(1,minmax(0,1fr))}.grid-cols-2{grid-template-columns:repeat(2,minmax(0,1fr))}.grid-cols-\\[1fr_2fr_auto\\]{grid-template-columns:1fr 2fr auto}.flex-col{flex-direction:column}.flex-wrap{flex-wrap:wrap}.items-start{align-items:flex-start}.items-end{align-items:flex-end}.items-center{align-items:center}.justify-end{justify-content:flex-end}.justify-center{justify-content:center}.justify-between{justify-content:space-between}.gap-1{gap:.25rem}.gap-1\\.5{gap:.375rem}.gap-12{gap:3rem}.gap-2{gap:.5rem}.gap-3{gap:.75rem}.gap-4{gap:1rem}.gap-8,.gap-stack-lg{gap:2rem}.gap-stack-md{gap:1rem}.gap-stack-sm{gap:.5rem}.gap-x-8{-moz-column-gap:2rem;column-gap:2rem}.gap-y-3{row-gap:.75rem}.-space-x-1>:not([hidden])~:not([hidden]){--tw-space-x-reverse:0;margin-right:calc(-.25rem*var(--tw-space-x-reverse));margin-left:calc(-.25rem*(1 - var(--tw-space-x-reverse)))}.space-y-1>:not([hidden])~:not([hidden]){--tw-space-y-reverse:0;margin-top:calc(.25rem*(1 - var(--tw-space-y-reverse)));margin-bottom:calc(.25rem*var(--tw-space-y-reverse))}.space-y-2>:not([hidden])~:not([hidden]){--tw-space-y-reverse:0;margin-top:calc(.5rem*(1 - var(--tw-space-y-reverse)));margin-bottom:calc(.5rem*var(--tw-space-y-reverse))}.space-y-3>:not([hidden])~:not([hidden]){--tw-space-y-reverse:0;margin-top:calc(.75rem*(1 - var(--tw-space-y-reverse)));margin-bottom:calc(.75rem*var(--tw-space-y-reverse))}.space-y-4>:not([hidden])~:not([hidden]){--tw-space-y-reverse:0;margin-top:calc(1rem*(1 - var(--tw-space-y-reverse)));margin-bottom:calc(1rem*var(--tw-space-y-reverse))}.space-y-6>:not([hidden])~:not([hidden]){--tw-space-y-reverse:0;margin-top:calc(1.5rem*(1 - var(--tw-space-y-reverse)));margin-bottom:calc(1.5rem*var(--tw-space-y-reverse))}.space-y-section-padding>:not([hidden])~:not([hidden]){--tw-space-y-reverse:0;margin-top:calc(5rem*(1 - var(--tw-space-y-reverse)));margin-bottom:calc(5rem*var(--tw-space-y-reverse))}.space-y-stack-lg>:not([hidden])~:not([hidden]){--tw-space-y-reverse:0;margin-top:calc(2rem*(1 - var(--tw-space-y-reverse)));margin-bottom:calc(2rem*var(--tw-space-y-reverse))}.space-y-stack-md>:not([hidden])~:not([hidden]){--tw-space-y-reverse:0;margin-top:calc(1rem*(1 - var(--tw-space-y-reverse)));margin-bottom:calc(1rem*var(--tw-space-y-reverse))}.self-center{align-self:center}.overflow-hidden{overflow:hidden}.overflow-x-auto{overflow-x:auto}.scroll-smooth{scroll-behavior:smooth}.truncate{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.rounded{border-radius:.25rem}.rounded-2xl{border-radius:1rem}.rounded-3xl{border-radius:1.5rem}.rounded-full{border-radius:9999px}.rounded-lg{border-radius:.5rem}.rounded-md{border-radius:.375rem}.rounded-xl{border-radius:.75rem}.border{border-width:1px}.border-b{border-bottom-width:1px}.border-b-2{border-bottom-width:2px}.border-t{border-top-width:1px}.border-dashed{border-style:dashed}.border-blue-600{--tw-border-opacity:1;border-color:rgb(37 99 235/var(--tw-border-opacity,1))}.border-on-primary-fixed-variant\\/10{border-color:rgb(var(--color-on-primary-fixed-variant)/.1)}.border-on-primary-fixed-variant\\/20{border-color:rgb(var(--color-on-primary-fixed-variant)/.2)}.border-on-primary\\/30{border-color:rgb(var(--color-on-primary)/.3)}.border-outline{--tw-border-opacity:1;border-color:rgb(var(--color-outline)/var(--tw-border-opacity,1))}.border-outline-variant\\/10{border-color:rgb(var(--color-outline-variant)/.1)}.border-outline-variant\\/20{border-color:rgb(var(--color-outline-variant)/.2)}.border-outline-variant\\/30{border-color:rgb(var(--color-outline-variant)/.3)}.border-outline-variant\\/50{border-color:rgb(var(--color-outline-variant)/.5)}.border-secondary\\/30{border-color:rgb(var(--color-secondary)/.3)}.border-transparent{border-color:transparent}.border-white\\/30{border-color:#ffffff4d}.bg-background{--tw-bg-opacity:1;background-color:rgb(var(--color-background)/var(--tw-bg-opacity,1))}.bg-blue-50{--tw-bg-opacity:1;background-color:rgb(239 246 255/var(--tw-bg-opacity,1))}.bg-primary{--tw-bg-opacity:1;background-color:rgb(var(--color-primary)/var(--tw-bg-opacity,1))}.bg-primary-container{--tw-bg-opacity:1;background-color:rgb(var(--color-primary-container)/var(--tw-bg-opacity,1))}.bg-primary\\/50{background-color:rgb(var(--color-primary)/.5)}.bg-secondary{--tw-bg-opacity:1;background-color:rgb(var(--color-secondary)/var(--tw-bg-opacity,1))}.bg-secondary-container{--tw-bg-opacity:1;background-color:rgb(var(--color-secondary-container)/var(--tw-bg-opacity,1))}.bg-secondary-fixed{--tw-bg-opacity:1;background-color:rgb(var(--color-secondary-fixed)/var(--tw-bg-opacity,1))}.bg-secondary\\/10{background-color:rgb(var(--color-secondary)/.1)}.bg-secondary\\/20{background-color:rgb(var(--color-secondary)/.2)}.bg-secondary\\/90{background-color:rgb(var(--color-secondary)/.9)}.bg-surface-bright{--tw-bg-opacity:1;background-color:rgb(var(--color-surface-bright)/var(--tw-bg-opacity,1))}.bg-surface-container{--tw-bg-opacity:1;background-color:rgb(var(--color-surface-container)/var(--tw-bg-opacity,1))}.bg-surface-container-high{--tw-bg-opacity:1;background-color:rgb(var(--color-surface-container-high)/var(--tw-bg-opacity,1))}.bg-surface-container-low{--tw-bg-opacity:1;background-color:rgb(var(--color-surface-container-low)/var(--tw-bg-opacity,1))}.bg-surface-container-lowest{--tw-bg-opacity:1;background-color:rgb(var(--color-surface-container-lowest)/var(--tw-bg-opacity,1))}.bg-surface\\/80{background-color:rgb(var(--color-surface)/.8)}.bg-tertiary-fixed-dim\\/5{background-color:rgb(var(--color-tertiary-fixed-dim)/.05)}.bg-white{--tw-bg-opacity:1;background-color:rgb(255 255 255/var(--tw-bg-opacity,1))}.bg-white\\/10{background-color:#ffffff1a}.bg-gradient-to-br{background-image:linear-gradient(to bottom right,var(--tw-gradient-stops))}.bg-gradient-to-r{background-image:linear-gradient(to right,var(--tw-gradient-stops))}.from-primary{--tw-gradient-from:rgb(var(--color-primary)/1) var(--tw-gradient-from-position);--tw-gradient-to:rgb(var(--color-primary)/0) var(--tw-gradient-to-position);--tw-gradient-stops:var(--tw-gradient-from),var(--tw-gradient-to)}.from-primary\\/95{--tw-gradient-from:rgb(var(--color-primary)/.95) var(--tw-gradient-from-position);--tw-gradient-to:rgb(var(--color-primary)/0) var(--tw-gradient-to-position);--tw-gradient-stops:var(--tw-gradient-from),var(--tw-gradient-to)}.from-secondary{--tw-gradient-from:rgb(var(--color-secondary)/1) var(--tw-gradient-from-position);--tw-gradient-to:rgb(var(--color-secondary)/0) var(--tw-gradient-to-position);--tw-gradient-stops:var(--tw-gradient-from),var(--tw-gradient-to)}.via-primary{--tw-gradient-to:rgb(var(--color-primary)/0) var(--tw-gradient-to-position);--tw-gradient-stops:var(--tw-gradient-from),rgb(var(--color-primary)/1) var(--tw-gradient-via-position),var(--tw-gradient-to)}.via-primary\\/80{--tw-gradient-to:rgb(var(--color-primary)/0) var(--tw-gradient-to-position);--tw-gradient-stops:var(--tw-gradient-from),rgb(var(--color-primary)/.8) var(--tw-gradient-via-position),var(--tw-gradient-to)}.to-primary-container{--tw-gradient-to:rgb(var(--color-primary-container)/1) var(--tw-gradient-to-position)}.to-primary\\/30{--tw-gradient-to:rgb(var(--color-primary)/.3) var(--tw-gradient-to-position)}.to-transparent{--tw-gradient-to:transparent var(--tw-gradient-to-position)}.object-contain{-o-object-fit:contain;object-fit:contain}.object-cover{-o-object-fit:cover;object-fit:cover}.p-12{padding:3rem}.p-2{padding:.5rem}.p-3{padding:.75rem}.p-4{padding:1rem}.p-6{padding:1.5rem}.p-8,.p-stack-lg{padding:2rem}.px-10{padding-left:2.5rem;padding-right:2.5rem}.px-3{padding-left:.75rem;padding-right:.75rem}.px-4{padding-left:1rem;padding-right:1rem}.px-6{padding-left:1.5rem;padding-right:1.5rem}.px-8{padding-left:2rem;padding-right:2rem}.px-gutter{padding-left:1.5rem;padding-right:1.5rem}.py-1{padding-top:.25rem;padding-bottom:.25rem}.py-16{padding-top:4rem;padding-bottom:4rem}.py-2{padding-top:.5rem;padding-bottom:.5rem}.py-3{padding-top:.75rem;padding-bottom:.75rem}.py-4{padding-top:1rem;padding-bottom:1rem}.py-5{padding-top:1.25rem;padding-bottom:1.25rem}.py-section-padding{padding-top:5rem;padding-bottom:5rem}.pb-8{padding-bottom:2rem}.pb-section-padding{padding-bottom:5rem}.pb-stack-lg{padding-bottom:2rem}.pr-10{padding-right:2.5rem}.pt-2{padding-top:.5rem}.pt-20{padding-top:5rem}.pt-3{padding-top:.75rem}.pt-6{padding-top:1.5rem}.pt-8,.pt-stack-lg{padding-top:2rem}.pt-stack-md{padding-top:1rem}.text-left{text-align:left}.text-center{text-align:center}.font-mono{font-family:ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,Liberation Mono,Courier New,monospace}.text-4xl{font-size:2.25rem;line-height:2.5rem}.text-\\[1\\.25rem\\]{font-size:1.25rem}.text-\\[120px\\]{font-size:120px}.text-\\[14px\\]{font-size:14px}.text-\\[18px\\]{font-size:18px}.text-\\[64px\\]{font-size:64px}.text-body-lg{font-size:1.125rem;line-height:1.75}.text-body-lg,.text-body-md{letter-spacing:0;font-weight:400}.text-body-md{font-size:1rem;line-height:1.6}.text-button{font-size:.875rem;line-height:1.25;letter-spacing:0;font-weight:600}.text-h1{font-size:3rem;line-height:1.2;letter-spacing:-.02em;font-weight:700}.text-h2{font-size:2.25rem;line-height:1.3;letter-spacing:-.01em;font-weight:700}.text-h3{font-size:1.5rem;line-height:1.4;letter-spacing:0;font-weight:600}.text-label-caps{font-size:.75rem;line-height:1;letter-spacing:.05em;font-weight:600}.text-sm{font-size:.875rem;line-height:1.25rem}.text-xs{font-size:.75rem;line-height:1rem}.font-bold{font-weight:700}.font-medium{font-weight:500}.font-semibold{font-weight:600}.uppercase{text-transform:uppercase}.italic{font-style:italic}.leading-relaxed{line-height:1.625}.leading-tight{line-height:1.25}.tracking-tight{letter-spacing:-.025em}.tracking-wide{letter-spacing:.025em}.tracking-wider{letter-spacing:.05em}.text-blue-500{--tw-text-opacity:1;color:rgb(59 130 246/var(--tw-text-opacity,1))}.text-error{--tw-text-opacity:1;color:rgb(var(--color-error)/var(--tw-text-opacity,1))}.text-on-primary{--tw-text-opacity:1;color:rgb(var(--color-on-primary)/var(--tw-text-opacity,1))}.text-on-primary-container{--tw-text-opacity:1;color:rgb(var(--color-on-primary-container)/var(--tw-text-opacity,1))}.text-on-primary-container\\/60{color:rgb(var(--color-on-primary-container)/.6)}.text-on-primary-container\\/80{color:rgb(var(--color-on-primary-container)/.8)}.text-on-secondary{--tw-text-opacity:1;color:rgb(var(--color-on-secondary)/var(--tw-text-opacity,1))}.text-on-secondary-container{--tw-text-opacity:1;color:rgb(var(--color-on-secondary-container)/var(--tw-text-opacity,1))}.text-on-surface{--tw-text-opacity:1;color:rgb(var(--color-on-surface)/var(--tw-text-opacity,1))}.text-on-surface-variant{--tw-text-opacity:1;color:rgb(var(--color-on-surface-variant)/var(--tw-text-opacity,1))}.text-outline{--tw-text-opacity:1;color:rgb(var(--color-outline)/var(--tw-text-opacity,1))}.text-primary{--tw-text-opacity:1;color:rgb(var(--color-primary)/var(--tw-text-opacity,1))}.text-red-600{--tw-text-opacity:1;color:rgb(220 38 38/var(--tw-text-opacity,1))}.text-secondary{--tw-text-opacity:1;color:rgb(var(--color-secondary)/var(--tw-text-opacity,1))}.text-secondary-fixed{--tw-text-opacity:1;color:rgb(var(--color-secondary-fixed)/var(--tw-text-opacity,1))}.text-secondary\\/20{color:rgb(var(--color-secondary)/.2)}.text-white{--tw-text-opacity:1;color:rgb(255 255 255/var(--tw-text-opacity,1))}.underline{text-decoration-line:underline}.opacity-10{opacity:.1}.opacity-20{opacity:.2}.opacity-60{opacity:.6}.opacity-80{opacity:.8}.opacity-90{opacity:.9}.shadow{--tw-shadow:0 1px 3px 0 rgba(0,0,0,.1),0 1px 2px -1px rgba(0,0,0,.1);--tw-shadow-colored:0 1px 3px 0 var(--tw-shadow-color),0 1px 2px -1px var(--tw-shadow-color)}.shadow,.shadow-2xl{box-shadow:var(--tw-ring-offset-shadow,0 0 #0000),var(--tw-ring-shadow,0 0 #0000),var(--tw-shadow)}.shadow-2xl{--tw-shadow:0 25px 50px -12px rgba(0,0,0,.25);--tw-shadow-colored:0 25px 50px -12px var(--tw-shadow-color)}.shadow-lg{--tw-shadow:0 10px 15px -3px rgba(0,0,0,.1),0 4px 6px -4px rgba(0,0,0,.1);--tw-shadow-colored:0 10px 15px -3px var(--tw-shadow-color),0 4px 6px -4px var(--tw-shadow-color)}.shadow-lg,.shadow-sm{box-shadow:var(--tw-ring-offset-shadow,0 0 #0000),var(--tw-ring-shadow,0 0 #0000),var(--tw-shadow)}.shadow-sm{--tw-shadow:0 1px 2px 0 rgba(0,0,0,.05);--tw-shadow-colored:0 1px 2px 0 var(--tw-shadow-color)}.shadow-xl{--tw-shadow:0 20px 25px -5px rgba(0,0,0,.1),0 8px 10px -6px rgba(0,0,0,.1);--tw-shadow-colored:0 20px 25px -5px var(--tw-shadow-color),0 8px 10px -6px var(--tw-shadow-color);box-shadow:var(--tw-ring-offset-shadow,0 0 #0000),var(--tw-ring-shadow,0 0 #0000),var(--tw-shadow)}.shadow-secondary\\/20{--tw-shadow-color:rgb(var(--color-secondary)/.2);--tw-shadow:var(--tw-shadow-colored)}.outline-none{outline:2px solid transparent;outline-offset:2px}.outline{outline-style:solid}.ring{--tw-ring-offset-shadow:var(--tw-ring-inset) 0 0 0 var(--tw-ring-offset-width) var(--tw-ring-offset-color);--tw-ring-shadow:var(--tw-ring-inset) 0 0 0 calc(3px + var(--tw-ring-offset-width)) var(--tw-ring-color)}.ring,.ring-1{box-shadow:var(--tw-ring-offset-shadow),var(--tw-ring-shadow),var(--tw-shadow,0 0 #0000)}.ring-1{--tw-ring-offset-shadow:var(--tw-ring-inset) 0 0 0 var(--tw-ring-offset-width) var(--tw-ring-offset-color);--tw-ring-shadow:var(--tw-ring-inset) 0 0 0 calc(1px + var(--tw-ring-offset-width)) var(--tw-ring-color)}.ring-2{--tw-ring-offset-shadow:var(--tw-ring-inset) 0 0 0 var(--tw-ring-offset-width) var(--tw-ring-offset-color);--tw-ring-shadow:var(--tw-ring-inset) 0 0 0 calc(2px + var(--tw-ring-offset-width)) var(--tw-ring-color);box-shadow:var(--tw-ring-offset-shadow),var(--tw-ring-shadow),var(--tw-shadow,0 0 #0000)}.ring-blue-500\\/60{--tw-ring-color:rgba(59,130,246,.6)}.blur{--tw-blur:blur(8px)}.blur,.blur-3xl{filter:var(--tw-blur) var(--tw-brightness) var(--tw-contrast) var(--tw-grayscale) var(--tw-hue-rotate) var(--tw-invert) var(--tw-saturate) var(--tw-sepia) var(--tw-drop-shadow)}.blur-3xl{--tw-blur:blur(64px)}.grayscale{--tw-grayscale:grayscale(100%)}.filter,.grayscale{filter:var(--tw-blur) var(--tw-brightness) var(--tw-contrast) var(--tw-grayscale) var(--tw-hue-rotate) var(--tw-invert) var(--tw-saturate) var(--tw-sepia) var(--tw-drop-shadow)}.backdrop-blur{--tw-backdrop-blur:blur(8px)}.backdrop-blur,.backdrop-blur-md{-webkit-backdrop-filter:var(--tw-backdrop-blur) var(--tw-backdrop-brightness) var(--tw-backdrop-contrast) var(--tw-backdrop-grayscale) var(--tw-backdrop-hue-rotate) var(--tw-backdrop-invert) var(--tw-backdrop-opacity) var(--tw-backdrop-saturate) var(--tw-backdrop-sepia);backdrop-filter:var(--tw-backdrop-blur) var(--tw-backdrop-brightness) var(--tw-backdrop-contrast) var(--tw-backdrop-grayscale) var(--tw-backdrop-hue-rotate) var(--tw-backdrop-invert) var(--tw-backdrop-opacity) var(--tw-backdrop-saturate) var(--tw-backdrop-sepia)}.backdrop-blur-md{--tw-backdrop-blur:blur(12px)}.transition{transition-property:color,background-color,border-color,text-decoration-color,fill,stroke,opacity,box-shadow,transform,filter,backdrop-filter;transition-timing-function:cubic-bezier(.4,0,.2,1);transition-duration:.15s}.transition-all{transition-property:all;transition-timing-function:cubic-bezier(.4,0,.2,1);transition-duration:.15s}.transition-colors{transition-property:color,background-color,border-color,text-decoration-color,fill,stroke;transition-timing-function:cubic-bezier(.4,0,.2,1);transition-duration:.15s}.transition-opacity{transition-property:opacity;transition-timing-function:cubic-bezier(.4,0,.2,1);transition-duration:.15s}.transition-transform{transition-property:transform;transition-timing-function:cubic-bezier(.4,0,.2,1);transition-duration:.15s}.duration-500{transition-duration:.5s}.hover\\:-translate-y-1:hover{--tw-translate-y:-.25rem}.hover\\:-translate-y-1:hover,.hover\\:translate-y-\\[-2px\\]:hover{transform:translate(var(--tw-translate-x),var(--tw-translate-y)) rotate(var(--tw-rotate)) skew(var(--tw-skew-x)) skewY(var(--tw-skew-y)) scaleX(var(--tw-scale-x)) scaleY(var(--tw-scale-y))}.hover\\:translate-y-\\[-2px\\]:hover{--tw-translate-y:-2px}.hover\\:scale-105:hover{--tw-scale-x:1.05;--tw-scale-y:1.05}.hover\\:scale-105:hover,.hover\\:scale-110:hover{transform:translate(var(--tw-translate-x),var(--tw-translate-y)) rotate(var(--tw-rotate)) skew(var(--tw-skew-x)) skewY(var(--tw-skew-y)) scaleX(var(--tw-scale-x)) scaleY(var(--tw-scale-y))}.hover\\:scale-110:hover{--tw-scale-x:1.1;--tw-scale-y:1.1}.hover\\:gap-3:hover{gap:.75rem}.hover\\:bg-secondary:hover{--tw-bg-opacity:1;background-color:rgb(var(--color-secondary)/var(--tw-bg-opacity,1))}.hover\\:bg-secondary-fixed:hover{--tw-bg-opacity:1;background-color:rgb(var(--color-secondary-fixed)/var(--tw-bg-opacity,1))}.hover\\:bg-secondary\\/90:hover{background-color:rgb(var(--color-secondary)/.9)}.hover\\:bg-surface-container:hover{--tw-bg-opacity:1;background-color:rgb(var(--color-surface-container)/var(--tw-bg-opacity,1))}.hover\\:bg-surface-container-low:hover{--tw-bg-opacity:1;background-color:rgb(var(--color-surface-container-low)/var(--tw-bg-opacity,1))}.hover\\:bg-white\\/10:hover{background-color:#ffffff1a}.hover\\:bg-white\\/20:hover{background-color:#fff3}.hover\\:text-on-primary:hover{--tw-text-opacity:1;color:rgb(var(--color-on-primary)/var(--tw-text-opacity,1))}.hover\\:text-on-secondary:hover{--tw-text-opacity:1;color:rgb(var(--color-on-secondary)/var(--tw-text-opacity,1))}.hover\\:text-secondary:hover{--tw-text-opacity:1;color:rgb(var(--color-secondary)/var(--tw-text-opacity,1))}.hover\\:text-secondary-fixed:hover{--tw-text-opacity:1;color:rgb(var(--color-secondary-fixed)/var(--tw-text-opacity,1))}.hover\\:opacity-100:hover{opacity:1}.hover\\:opacity-90:hover{opacity:.9}.hover\\:shadow-lg:hover{--tw-shadow:0 10px 15px -3px rgba(0,0,0,.1),0 4px 6px -4px rgba(0,0,0,.1);--tw-shadow-colored:0 10px 15px -3px var(--tw-shadow-color),0 4px 6px -4px var(--tw-shadow-color)}.hover\\:shadow-lg:hover,.hover\\:shadow-xl:hover{box-shadow:var(--tw-ring-offset-shadow,0 0 #0000),var(--tw-ring-shadow,0 0 #0000),var(--tw-shadow)}.hover\\:shadow-xl:hover{--tw-shadow:0 20px 25px -5px rgba(0,0,0,.1),0 8px 10px -6px rgba(0,0,0,.1);--tw-shadow-colored:0 20px 25px -5px var(--tw-shadow-color),0 8px 10px -6px var(--tw-shadow-color)}.hover\\:grayscale-0:hover{--tw-grayscale:grayscale(0);filter:var(--tw-blur) var(--tw-brightness) var(--tw-contrast) var(--tw-grayscale) var(--tw-hue-rotate) var(--tw-invert) var(--tw-saturate) var(--tw-sepia) var(--tw-drop-shadow)}.focus\\:border-secondary:focus{--tw-border-opacity:1;border-color:rgb(var(--color-secondary)/var(--tw-border-opacity,1))}.focus\\:outline-none:focus{outline:2px solid transparent;outline-offset:2px}.focus\\:ring-2:focus{--tw-ring-offset-shadow:var(--tw-ring-inset) 0 0 0 var(--tw-ring-offset-width) var(--tw-ring-offset-color);--tw-ring-shadow:var(--tw-ring-inset) 0 0 0 calc(2px + var(--tw-ring-offset-width)) var(--tw-ring-color);box-shadow:var(--tw-ring-offset-shadow),var(--tw-ring-shadow),var(--tw-shadow,0 0 #0000)}.focus\\:ring-blue-500:focus{--tw-ring-opacity:1;--tw-ring-color:rgb(59 130 246/var(--tw-ring-opacity,1))}.focus\\:ring-secondary:focus{--tw-ring-opacity:1;--tw-ring-color:rgb(var(--color-secondary)/var(--tw-ring-opacity,1))}.active\\:scale-95:active{--tw-scale-x:.95;--tw-scale-y:.95}.active\\:scale-95:active,.active\\:scale-\\[0\\.98\\]:active{transform:translate(var(--tw-translate-x),var(--tw-translate-y)) rotate(var(--tw-rotate)) skew(var(--tw-skew-x)) skewY(var(--tw-skew-y)) scaleX(var(--tw-scale-x)) scaleY(var(--tw-scale-y))}.active\\:scale-\\[0\\.98\\]:active{--tw-scale-x:.98;--tw-scale-y:.98}.active\\:opacity-80:active{opacity:.8}.group:hover .group-hover\\:translate-x-1{--tw-translate-x:.25rem}.group:hover .group-hover\\:scale-105,.group:hover .group-hover\\:translate-x-1{transform:translate(var(--tw-translate-x),var(--tw-translate-y)) rotate(var(--tw-rotate)) skew(var(--tw-skew-x)) skewY(var(--tw-skew-y)) scaleX(var(--tw-scale-x)) scaleY(var(--tw-scale-y))}.group:hover .group-hover\\:scale-105{--tw-scale-x:1.05;--tw-scale-y:1.05}.group:hover .group-hover\\:gap-3{gap:.75rem}.group:hover .group-hover\\:text-secondary{--tw-text-opacity:1;color:rgb(var(--color-secondary)/var(--tw-text-opacity,1))}.group:hover .group-hover\\:underline{text-decoration-line:underline}@media(min-width:640px){.sm\\:grid-cols-2{grid-template-columns:repeat(2,minmax(0,1fr))}.sm\\:flex-row{flex-direction:row}}@media(min-width:768px){.md\\:flex{display:flex}.md\\:aspect-\\[21\\/9\\]{aspect-ratio:21/9}.md\\:h-10{height:2.5rem}.md\\:min-h-\\[760px\\]{min-height:760px}.md\\:w-1\\/2{width:50%}.md\\:w-auto{width:auto}.md\\:max-w-md{max-width:28rem}.md\\:grid-cols-2{grid-template-columns:repeat(2,minmax(0,1fr))}.md\\:grid-cols-3{grid-template-columns:repeat(3,minmax(0,1fr))}.md\\:grid-cols-4{grid-template-columns:repeat(4,minmax(0,1fr))}.md\\:flex-row{flex-direction:row}.md\\:items-start{align-items:flex-start}.md\\:items-end{align-items:flex-end}.md\\:items-center{align-items:center}.md\\:justify-start{justify-content:flex-start}.md\\:justify-between{justify-content:space-between}.md\\:self-auto{align-self:auto}.md\\:to-transparent{--tw-gradient-to:transparent var(--tw-gradient-to-position)}.md\\:p-16{padding:4rem}.md\\:p-20{padding:5rem}.md\\:pt-section-padding{padding-top:5rem}.md\\:text-left{text-align:left}.md\\:text-h1{font-size:3rem;line-height:1.2;letter-spacing:-.02em;font-weight:700}}@media(min-width:1024px){.lg\\:col-span-4{grid-column:span 4/span 4}.lg\\:col-span-8{grid-column:span 8/span 8}.lg\\:grid{display:grid}.lg\\:w-80{width:20rem}.lg\\:grid-cols-12{grid-template-columns:repeat(12,minmax(0,1fr))}.lg\\:grid-cols-3{grid-template-columns:repeat(3,minmax(0,1fr))}.lg\\:flex-row{flex-direction:row}.lg\\:gap-stack-lg{gap:2rem}.lg\\:p-12{padding:3rem}}@media(min-width:1280px){.xl\\:grid-cols-3{grid-template-columns:repeat(3,minmax(0,1fr))}}@media(prefers-color-scheme:dark){.dark\\:border-blue-500{--tw-border-opacity:1;border-color:rgb(59 130 246/var(--tw-border-opacity,1))}.dark\\:bg-blue-950\\/30{background-color:#1725544d}}@media(min-width:768px){.md\\:\\[\\&\\>\\:first-child\\]\\:order-2>:first-child{order:2}}', xo = `/**
 * Corporate theme — runtime menu loader.
 *
 * Same contract as the default + magazine themes: fetches /data/menu.json
 * and paints every \`[data-cms-menu]\` container on the page. The corporate
 * header ships TWO such containers — the inline horizontal nav (visible
 * md+) and the off-canvas burger overlay (always present, opens on
 * burger-toggle click). Both get populated from the same menu data,
 * styled differently by their parent classes.
 *
 * Differences vs magazine:
 *   - The injected logo \`<img>\` gets utility classes that fit the
 *     corporate header height (\`h-8 w-auto\`).
 *   - Inline nav links carry the corporate hover styling via
 *     \`data-cms-menu-inline\` rendering — see the \`paint\` function
 *     branch below.
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

  // Burger / off-canvas list item: simple <a> with optional nested <ul>
  // for children. Kept identical to the magazine theme so the styling
  // in \`.burger-menu\` works without extra branches.
  function renderBurgerItem(item) {
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
        sub.appendChild(renderBurgerItem(child));
      });
      li.appendChild(sub);
    }
    return li;
  }

  // Inline header nav: horizontal flex of <a> elements. The active
  // page gets \`text-secondary font-bold\`; siblings get the default
  // \`text-on-surface-variant\` + hover-to-secondary state. We don't
  // render children (a corporate top nav stays one level deep).
  function renderInlineItem(item) {
    var a = document.createElement("a");
    a.href = withBase(item.href) || "#";
    a.textContent = pickLabel(item);
    var active = samePath(a.href);
    if (active) {
      a.setAttribute("aria-current", "page");
      a.className = "text-secondary font-bold transition-colors";
    } else {
      a.className =
        "text-on-surface-variant font-medium hover:text-secondary transition-colors";
    }
    return a;
  }

  function paint(menu) {
    if (!menu) return;
    document.querySelectorAll("[data-cms-menu]").forEach(function (host) {
      var key = host.getAttribute("data-cms-menu");
      var items = (menu && menu[key]) || [];
      var inline = host.hasAttribute("data-cms-menu-inline");

      if (inline) {
        // Replace direct children with horizontal links. The host
        // itself is the \`<nav>\` flex container.
        host.innerHTML = "";
        items.forEach(function (item) {
          host.appendChild(renderInlineItem(item));
        });
      } else {
        var list = host.querySelector("ul");
        if (!list) return;
        list.innerHTML = "";
        items.forEach(function (item) {
          list.appendChild(renderBurgerItem(item));
        });
      }

      // Hide empty inline / footer hosts so they don't reserve
      // whitespace. Skip #burger-menu: it's \`position: fixed\` (no
      // layout impact) AND any \`hidden\` attribute would \`display:
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
      // Comfortable height for the corporate header bar (h-20 / 5rem).
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
`, ko = `/**
 * Corporate theme — runtime sidebar loader.
 *
 * Populates \`[data-cms-related]\` and \`[data-cms-author-bio]\` hosts
 * from \`/data/posts.json\` and \`/data/authors.json\`. Same lifecycle as
 * the magazine + default themes: fetched once on DOMContentLoaded;
 * paint passes are independent and tolerate each other's failure.
 *
 * The injected DOM uses corporate-specific class names
 * (\`corporate-bio-*\`, \`corporate-related-*\`) — matching CSS rules
 * live in \`theme.css\` under \`@layer components\`.
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

  // ─── Related / popular articles ───────────────────────────────────
  //
  // DOM emitted matches the corporate single-post mockup — a card with
  // a heading and a list of items; each item is an <a> with a colored
  // category eyebrow, line-clamped title, and a small date meta line.
  //
  //   <div class="corporate-related-card">
  //     <h4 class="corporate-related-heading">Articles populaires</h4>
  //     <div class="corporate-related-list">
  //       <a class="corporate-related-item" href="/...">
  //         <p class="corporate-related-eyebrow">Category</p>
  //         <p class="corporate-related-title">Title</p>
  //         <p class="corporate-related-meta">Jan 12 • 5 min read</p>
  //       </a>
  //       …
  //     </div>
  //   </div>
  //
  // The card chrome (background/border/padding) lives in the host
  // element itself via \`.corporate-related-card\` — see the
  // SingleTemplate sidebar markup.

  function renderRelatedItem(entry) {
    var a = document.createElement("a");
    a.href = withBase("/" + entry.url);
    a.className = "corporate-related-item";
    if (entry.category && entry.category.name) {
      var eyebrow = document.createElement("p");
      eyebrow.className = "corporate-related-eyebrow";
      eyebrow.textContent = entry.category.name;
      a.appendChild(eyebrow);
    }
    var title = document.createElement("p");
    title.className = "corporate-related-title";
    title.textContent = entry.title || "";
    a.appendChild(title);
    if (entry.dateLabel) {
      var meta = document.createElement("p");
      meta.className = "corporate-related-meta";
      meta.textContent = entry.dateLabel;
      a.appendChild(meta);
    }
    return a;
  }

  function renderRelated(host, posts) {
    var termId = host.getAttribute("data-cms-term-id") || "";
    var currentId = host.getAttribute("data-cms-current-id") || "";
    var limit = parseInt(host.getAttribute("data-cms-limit") || "3", 10);
    var label = host.getAttribute("data-cms-label") || "Popular articles";
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
    headingEl.className = "corporate-related-heading";
    headingEl.textContent = heading;
    host.appendChild(headingEl);
    var list = document.createElement("div");
    list.className = "corporate-related-list";
    matching.forEach(function (entry) {
      list.appendChild(renderRelatedItem(entry));
    });
    host.appendChild(list);
  }

  // ─── Author bio ───────────────────────────────────────────────────
  //
  // DOM emitted (matches the corporate single-post sidebar mockup —
  // round avatar + name in headline weight + label-caps title +
  // bio paragraph + circular social icon row):
  //
  //   <h4 class="corporate-bio-eyebrow">Author</h4>
  //   <div class="corporate-bio-row">
  //     <img class="corporate-bio-avatar" />
  //     <div>
  //       <p class="corporate-bio-name">…</p>
  //       <p class="corporate-bio-title">Senior Strategist</p>
  //     </div>
  //   </div>
  //   <p class="corporate-bio-bio">…</p>
  //   <div class="corporate-bio-socials">
  //     <a href="…" class="corporate-bio-social"> [icon] </a>
  //   </div>

  function authorAvatar(name, url) {
    if (!url) {
      // Fallback initials box — same color tokens as the avatar
      // when the author hasn't uploaded an image.
      var span = document.createElement("span");
      span.className = "corporate-bio-avatar";
      span.style.display = "inline-flex";
      span.style.alignItems = "center";
      span.style.justifyContent = "center";
      span.style.background = "rgb(var(--color-secondary-fixed))";
      span.style.color = "rgb(var(--color-secondary))";
      span.style.fontWeight = "700";
      span.setAttribute("aria-hidden", "true");
      span.textContent = (function () {
        if (!name) return "?";
        var parts = name.trim().split(/\\s+/);
        if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
        return ((parts[0][0] || "") + (parts[parts.length - 1][0] || "")).toUpperCase();
      })();
      return span;
    }
    var img = document.createElement("img");
    img.className = "corporate-bio-avatar";
    img.src = withBase(url);
    img.alt = name || "";
    img.loading = "lazy";
    return img;
  }

  function renderAuthorBio(host, authors) {
    var authorId = host.getAttribute("data-cms-author-id") || "";
    if (!authorId) return;
    var entry = authors[authorId];
    if (!entry) return;

    host.innerHTML = "";

    // Eyebrow label — "Author" or whatever the host configured. The
    // host can override it via data-cms-bio-label for i18n.
    var eyebrow = document.createElement("h4");
    eyebrow.className = "corporate-bio-eyebrow";
    eyebrow.textContent = host.getAttribute("data-cms-bio-label") || "Author";
    host.appendChild(eyebrow);

    var row = document.createElement("div");
    row.className = "corporate-bio-row";
    row.appendChild(authorAvatar(entry.displayName, entry.avatar));

    var nameWrap = document.createElement("div");
    var nameEl;
    if (entry.url) {
      nameEl = document.createElement("a");
      nameEl.href = withBase("/" + entry.url);
    } else {
      nameEl = document.createElement("p");
    }
    nameEl.className = "corporate-bio-name";
    nameEl.textContent = entry.displayName || "";
    nameWrap.appendChild(nameEl);

    if (entry.title) {
      var role = document.createElement("p");
      role.className = "corporate-bio-title";
      role.textContent = entry.title;
      nameWrap.appendChild(role);
    }
    row.appendChild(nameWrap);
    host.appendChild(row);

    if (entry.bio) {
      var bio = document.createElement("p");
      bio.className = "corporate-bio-bio";
      bio.textContent = entry.bio;
      host.appendChild(bio);
    }

    // Visible socials — already filtered server-side. Each entry
    // produces an icon link to the user's external profile, opened in
    // a new tab with rel=noopener noreferrer.
    if (entry.socials && entry.socials.length) {
      var socials = document.createElement("div");
      socials.className = "corporate-bio-socials";
      for (var i = 0; i < entry.socials.length; i++) {
        var s = entry.socials[i];
        var a = document.createElement("a");
        a.className = "corporate-bio-social";
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

  // ─── Share buttons ────────────────────────────────────────────────
  //
  // Wires up \`[data-cms-share]\` buttons in the body. The single-post
  // template emits two: \`data-cms-share="native"\` (Web Share API
  // fallback to copy-link when unsupported) and \`data-cms-share="copy"\`
  // (clipboard write of the page URL). Visual feedback is a brief
  // text/title swap so the user knows the click registered without
  // needing a toast library.

  function showFlash(button, glyphName) {
    var icon = button.querySelector(".material-symbols-outlined");
    if (!icon) return;
    var original = icon.textContent;
    icon.textContent = glyphName;
    setTimeout(function () {
      icon.textContent = original;
    }, 1400);
  }

  function copyLink(button) {
    var url = window.location.href;
    var done = function () { showFlash(button, "check"); };
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(url).then(done, function () {
        // Fallback when the clipboard write is denied (e.g. insecure
        // context) — select-and-copy the URL via a temporary textarea.
        legacyCopy(url);
        done();
      });
    } else {
      legacyCopy(url);
      done();
    }
  }

  function legacyCopy(text) {
    try {
      var ta = document.createElement("textarea");
      ta.value = text;
      ta.setAttribute("readonly", "");
      ta.style.position = "absolute";
      ta.style.left = "-9999px";
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
    } catch (e) {
      console.warn("[cms] clipboard copy failed:", e);
    }
  }

  function shareNative(button) {
    var url = window.location.href;
    var title = document.title || "";
    if (navigator.share) {
      navigator.share({ title: title, url: url }).catch(function () {
        // User cancelled or the share sheet failed — silent.
      });
    } else {
      copyLink(button);
    }
  }

  function wireShareButtons() {
    document.querySelectorAll("[data-cms-share]").forEach(function (button) {
      var mode = button.getAttribute("data-cms-share");
      button.addEventListener("click", function () {
        if (mode === "copy") copyLink(button);
        else shareNative(button);
      });
    });
  }

  // ─── Contact form ─────────────────────────────────────────────────
  //
  // Intercepts submit on every \`[data-cms-form]\` form. Two modes are
  // surfaced in the contact-form block's inspector:
  //   - "endpoint" (default) → POST a JSON body to a third-party
  //     form service (Formspree, Web3Forms, etc.). Success / error
  //     messages from \`[data-cms-form-success]\` / \`[data-cms-form-error]\`
  //     toggle visibility based on the response status.
  //   - "mailto" → build a \`mailto:\` URL with the subject + body
  //     pre-filled, then \`window.location.href\` to it. No JS-only
  //     state to manage.
  // When the form has neither a configured endpoint nor a mailto
  // address (most likely during initial setup), submit is left to
  // the browser's default behavior so the user notices the missing
  // configuration.

  function asUrlEncoded(formData) {
    var pairs = [];
    formData.forEach(function (value, key) {
      pairs.push(encodeURIComponent(key) + "=" + encodeURIComponent(value));
    });
    return pairs.join("&");
  }

  function showFormStatus(form, kind) {
    ["success", "error"].forEach(function (k) {
      var el = form.querySelector("[data-cms-form-" + k + "]");
      if (el) {
        if (k === kind) el.removeAttribute("hidden");
        else el.setAttribute("hidden", "");
      }
    });
  }

  function buildMailto(form, address) {
    var data = new FormData(form);
    var subject = data.get("subject") || "Contact form submission";
    var lines = [];
    data.forEach(function (value, key) {
      if (key === "subject" || key === "consent") return;
      lines.push(key + ": " + value);
    });
    return (
      "mailto:" +
      encodeURIComponent(address) +
      "?subject=" +
      encodeURIComponent(String(subject)) +
      "&body=" +
      encodeURIComponent(lines.join("\\n\\n"))
    );
  }

  function handleFormSubmit(form, mode, endpoint, mailtoAddress, event) {
    if (mode === "mailto") {
      if (!mailtoAddress) return; // No config — let the browser handle.
      event.preventDefault();
      window.location.href = buildMailto(form, mailtoAddress);
      return;
    }
    if (!endpoint) return; // No endpoint configured — fall through.
    event.preventDefault();
    var data = new FormData(form);
    var submitButton = form.querySelector("button[type='submit']");
    if (submitButton) submitButton.disabled = true;
    fetch(withBase(endpoint), {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Accept: "application/json",
      },
      body: asUrlEncoded(data),
    })
      .then(function (res) {
        if (!res.ok) throw new Error("HTTP " + res.status);
        showFormStatus(form, "success");
        form.reset();
      })
      .catch(function (err) {
        console.warn("[cms] contact form submit failed:", err);
        showFormStatus(form, "error");
      })
      .finally(function () {
        if (submitButton) submitButton.disabled = false;
      });
  }

  // ─── Featured posts chevrons ──────────────────────────────────────
  //
  // The home's featured-posts section ships decorative prev/next
  // chevrons (matching the mockup). On md+ the layout is a static
  // 3-col grid — the chevrons scroll smoothly to the next/previous
  // card slot. On mobile (single column with horizontal overflow if
  // the grid is repurposed as a slider in a future iteration), they
  // page through one card width at a time.
  function wireFeaturedChevrons() {
    var track = document.querySelector("[data-cms-featured-track]");
    if (!track) return;
    var prev = document.querySelector("[data-cms-featured-prev]");
    var next = document.querySelector("[data-cms-featured-next]");
    function step(dir) {
      var cards = track.children;
      if (!cards || cards.length === 0) return;
      var card = cards[0];
      var width = card.getBoundingClientRect().width;
      // Read the actual computed gap from the flex container so the
      // scroll step matches the visual rhythm. The \`gap\` shorthand
      // resolves to a px value in the computed style (e.g. "32px"
      // when Tailwind's gap-stack-lg = 2rem at 16px root font-size).
      var styles = window.getComputedStyle(track);
      var gap = parseFloat(styles.columnGap || styles.gap || "0") || 0;
      track.scrollBy({ left: dir * (width + gap), behavior: "smooth" });
    }
    if (prev) prev.addEventListener("click", function () { step(-1); });
    if (next) next.addEventListener("click", function () { step(1); });
  }

  function wireContactForms() {
    document.querySelectorAll("[data-cms-form]").forEach(function (form) {
      var mode = form.getAttribute("data-cms-form") || "endpoint";
      var endpoint = form.getAttribute("data-cms-form-endpoint") || "";
      var mailtoAddress = form.getAttribute("data-cms-form-mailto") || "";
      form.addEventListener("submit", function (event) {
        handleFormSubmit(form, mode, endpoint, mailtoAddress, event);
      });
      // Marks each input as filled so the floating-label CSS keeps
      // the label in its raised position even when the field has a
      // pre-filled value (browser autofill, back-button restore).
      form.querySelectorAll("input, textarea, select").forEach(function (input) {
        function update() {
          var group = input.closest(".floating-label-group");
          if (!group) return;
          if (input.value && input.value.length > 0) group.classList.add("is-filled");
          else group.classList.remove("is-filled");
        }
        input.addEventListener("input", update);
        input.addEventListener("change", update);
        update();
      });
    });
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

  // Multi-language helper — same locale prefix detection as the
  // other themes (see default/posts-loader.js for the rationale).
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
    wireShareButtons();
    wireContactForms();
    wireFeaturedChevrons();
    Promise.all([
      fetchWithLocaleFallback("posts.json"),
      fetchWithLocaleFallback("authors.json"),
    ]).then(function (results) {
      paintRelated(results[0]);
      paintAuthorBios(results[1]);
    });
  });
})();
`, So = {
  description: "Customize the active theme. Changes affect every published page on the next load (browsers may cache the CSS — hard-refresh once to see the update).",
  tabs: { logo: "Logo", style: "Style", home: "Home", single: "Single post" },
  single: {
    help: "Configure the single-post page sidebar. Changes apply to every post on the next regeneration.",
    save: "Save",
    saving: "Saving…",
    saved: "Single-post settings saved. Republish posts to apply.",
    failed: "Save failed.",
    sidebarHeading: "Sidebar",
    showAuthorBio: "Show author bio card",
    showAuthorBioHelp: "Renders the author's avatar, name, role, bio and social links. Off by default — many corporate sites prefer to keep posts free of per-author bylines.",
    showPopular: "Show popular articles card",
    showPopularHelp: "Lists 3 related posts (same category first, then latest as fallback). Populated at runtime from /data/posts.json.",
    popularTitle: "Popular articles title",
    popularTitleHelp: "Customize the heading shown above the list. Empty falls back to the localised default.",
    showCta: 'Show "Get started" CTA card',
    showCtaHelp: "Dark navy lead-gen card at the bottom of the sidebar. Useful on lead-gen sites; turn off for content-only blogs.",
    ctaTitle: "CTA title",
    ctaTitleHelp: 'Heading shown at the top of the card. Empty falls back to the site title or "Get started".',
    ctaButtonLabel: "Button label",
    ctaButtonHref: "Button link"
  },
  home: {
    help: 'Configure the home hero section. Out-of-the-box, the home renders this hero followed by a latest-posts grid. Switch to a fully custom layout by setting Settings → General → Home mode to "Static page" and pointing it at a page composed of theme blocks.',
    save: "Save",
    saving: "Saving…",
    saved: "Home saved. Republish or wait for the next publish to apply.",
    failed: "Save failed.",
    showHero: "Show hero on home",
    showHeroHelp: "When off, the home opens directly with the latest-posts grid (useful for a more austere editorial feel).",
    heroHeading: "Hero content",
    heroImage: "Background image URL",
    heroImageHelp: "Pick from your Media library, paste any external URL, or leave empty for a solid navy hero. Default points at an Unsplash corporate-office photo.",
    heroImagePick: "Choose from media library",
    heroImageClear: "Clear",
    heroImageAlt: "Image alt text",
    heroEyebrow: "Eyebrow label",
    heroTitle: "Headline",
    heroSubtitle: "Lede / subtitle",
    primaryCtaLabel: "Primary CTA label",
    primaryCtaHref: "Primary CTA link",
    secondaryCtaLabel: "Secondary CTA label",
    secondaryCtaHref: "Secondary CTA link",
    featuredHeading: "Featured posts section",
    featuredEnabled: "Show the featured posts section on home",
    featuredHelp: "A grid of post cards below the hero. Pick a category or pull from every post — order is most-recent first.",
    featuredTitle: "Section title",
    featuredSubtitle: "Section subtitle",
    featuredMode: "Source",
    featuredModes: { all: "All posts (newest first)", category: "Single category" },
    featuredCount: "Number of cards",
    featuredCategory: "Category",
    featuredCategoryPlaceholder: "— Pick a category —",
    featuredCategoryEmpty: "No categories yet. Create one in Categories first.",
    testimonialsHeading: "Testimonials section",
    testimonialsEnabled: "Show the testimonials section on home",
    testimonialsHelp: "Customer quotes with star rating + author. Each is a card; the layout adapts to 1 / 2 / 3+ items.",
    testimonialsVariant: "Visual variant",
    testimonialsVariants: { glass: "Glass cards on light surface", navy: "Navy section" },
    testimonialsEyebrow: "Eyebrow label (optional)",
    testimonialsTitle: "Section title",
    testimonialsSubtitle: "Section subtitle",
    testimonialsItemsHeading: "Testimonials",
    testimonialsAdd: "Add testimonial",
    testimonialsItemIndex: "Testimonial {{index}}",
    testimonialsQuote: "Quote",
    testimonialsAuthorName: "Author name",
    testimonialsAuthorTitle: "Author title (e.g. CEO, Acme)",
    testimonialsAvatarUrl: "Avatar URL",
    testimonialsRating: "Rating (1–5)"
  },
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
    classic: {
      label: "Classic",
      description: "Original corporate baseline — Inter on slate-blue surfaces, navy primary."
    },
    tech: {
      label: "Tech",
      description: "Crisp neutral surfaces with electric cyan accent — Plus Jakarta Sans, modern SaaS feel."
    },
    trust: {
      label: "Trust",
      description: "Warm cream and deep navy with amber accent — IBM Plex Sans, banking / advisory vibe."
    },
    vibrant: {
      label: "Vibrant",
      description: "Pink and orange punch — DM Sans, energetic startup feel."
    },
    executive: {
      label: "Executive",
      description: "Deep purple and gold on cream — Manrope, premium consulting / luxury services."
    }
  },
  groups: {
    surfaces: "Surfaces",
    foreground: "Foreground",
    outlines: "Outlines",
    accent: "Brand & Accent",
    typography: "Typography"
  },
  vars: {
    background: "Page background",
    surface: "Surface",
    surfaceLow: "Surface — low",
    surfaceMid: "Surface — mid",
    surfaceHigh: "Surface — high",
    surfaceLowest: "Card surface",
    onSurface: "Body text",
    onSurfaceVariant: "Secondary text",
    outline: "Outline",
    outlineVariant: "Outline — subtle",
    primary: "Primary (navy)",
    onPrimary: "Text on primary",
    primaryContainer: "Primary container",
    onPrimaryContainer: "Text on primary container",
    secondary: "Secondary (CTA / links)",
    onSecondary: "Text on secondary",
    tertiary: "Tertiary",
    tertiaryContainer: "Tertiary container"
  },
  fonts: {
    sans: "Sans-serif (entire UI)",
    help: "The corporate theme uses one font for everything. Loaded via Google Fonts; the CSS @import line is rewritten on save."
  }
}, Co = {
  description: "Personnalisez le thème actif. Les modifications s'appliquent à chaque page publiée au prochain chargement (le navigateur peut mettre en cache le CSS — un Cmd+Maj+R suffit).",
  tabs: { logo: "Logo", style: "Style", home: "Accueil", single: "Article" },
  single: {
    help: "Configurez la barre latérale des pages d'article. Les changements s'appliquent à chaque article à la prochaine régénération.",
    save: "Enregistrer",
    saving: "Enregistrement…",
    saved: "Réglages article enregistrés. Republiez les articles pour les appliquer.",
    failed: "Échec de l'enregistrement.",
    sidebarHeading: "Barre latérale",
    showAuthorBio: "Afficher la carte auteur",
    showAuthorBioHelp: "Affiche l'avatar, le nom, le rôle, la bio et les liens sociaux de l'auteur. Désactivé par défaut — beaucoup de sites corporate préfèrent ne pas afficher l'auteur sur chaque article.",
    showPopular: "Afficher la carte « Articles populaires »",
    showPopularHelp: "Liste 3 articles liés (même catégorie d'abord, puis les plus récents en fallback). Rempli au runtime depuis /data/posts.json.",
    popularTitle: "Titre « Articles populaires »",
    popularTitleHelp: "Personnalisez le titre affiché au-dessus de la liste. Vide = libellé localisé par défaut.",
    showCta: "Afficher la carte CTA « Démarrer »",
    showCtaHelp: "Carte navy de lead-gen en bas de la sidebar. Utile pour les sites lead-gen ; désactivez pour un blog purement éditorial.",
    ctaTitle: "Titre du CTA",
    ctaTitleHelp: "En-tête affiché en haut de la carte. Vide = titre du site ou « Démarrer ».",
    ctaButtonLabel: "Libellé du bouton",
    ctaButtonHref: "Lien du bouton"
  },
  home: {
    help: "Configurez le hero de la page d'accueil. Par défaut, l'accueil affiche ce hero suivi d'une grille des derniers articles. Pour un layout entièrement personnalisé, passez en mode « Page statique » dans Réglages → Général et pointez vers une page composée de blocs.",
    save: "Enregistrer",
    saving: "Enregistrement…",
    saved: "Accueil enregistré. Republiez ou attendez la prochaine publication pour l'appliquer.",
    failed: "Échec de l'enregistrement.",
    showHero: "Afficher le hero en accueil",
    showHeroHelp: "Désactivé, l'accueil s'ouvre directement sur la grille des derniers articles (utile pour un rendu plus sobre).",
    heroHeading: "Contenu du hero",
    heroImage: "URL de l'image de fond",
    heroImageHelp: "Choisissez depuis la médiathèque, collez une URL externe, ou laissez vide pour un hero navy uni. Par défaut : photo de bureau corporate sur Unsplash.",
    heroImagePick: "Choisir dans la médiathèque",
    heroImageClear: "Effacer",
    heroImageAlt: "Texte alternatif",
    heroEyebrow: "Étiquette",
    heroTitle: "Titre",
    heroSubtitle: "Accroche / sous-titre",
    primaryCtaLabel: "Libellé CTA principal",
    primaryCtaHref: "Lien CTA principal",
    secondaryCtaLabel: "Libellé CTA secondaire",
    secondaryCtaHref: "Lien CTA secondaire",
    featuredHeading: "Section articles à la une",
    featuredEnabled: "Afficher la section articles à la une",
    featuredHelp: "Grille de cartes d'articles sous le hero. Choisissez une catégorie ou tirez depuis tous les articles — ordre du plus récent au plus ancien.",
    featuredTitle: "Titre de la section",
    featuredSubtitle: "Sous-titre de la section",
    featuredMode: "Source",
    featuredModes: { all: "Tous les articles (plus récents d'abord)", category: "Une seule catégorie" },
    featuredCount: "Nombre de cartes",
    featuredCategory: "Catégorie",
    featuredCategoryPlaceholder: "— Choisir une catégorie —",
    featuredCategoryEmpty: "Aucune catégorie. Créez-en une dans Catégories d'abord.",
    testimonialsHeading: "Section témoignages",
    testimonialsEnabled: "Afficher la section témoignages",
    testimonialsHelp: "Citations clients avec note d'étoiles + auteur. Chaque entrée est une carte ; le layout s'adapte à 1 / 2 / 3+ éléments.",
    testimonialsVariant: "Variante visuelle",
    testimonialsVariants: { glass: "Cartes glass sur fond clair", navy: "Section navy" },
    testimonialsEyebrow: "Étiquette (optionnel)",
    testimonialsTitle: "Titre de la section",
    testimonialsSubtitle: "Sous-titre de la section",
    testimonialsItemsHeading: "Témoignages",
    testimonialsAdd: "Ajouter un témoignage",
    testimonialsItemIndex: "Témoignage {{index}}",
    testimonialsQuote: "Citation",
    testimonialsAuthorName: "Nom de l'auteur",
    testimonialsAuthorTitle: "Titre de l'auteur (ex. CEO, Acme)",
    testimonialsAvatarUrl: "URL de l'avatar",
    testimonialsRating: "Note (1–5)"
  },
  logo: {
    help: "Uploadez un logo pour remplacer le wordmark texte dans l'en-tête. Dimensions recommandées : {{width}}×{{height}} px. L'image est redimensionnée et stockée en WebP.",
    none: "Pas de logo",
    upload: "Uploader un logo",
    uploading: "Envoi en cours…",
    change: "Changer le logo",
    remove: "Supprimer le logo",
    removing: "Suppression…",
    saved: "Logo mis à jour. Rechargez les pages publiées pour voir le changement.",
    removed: "Logo supprimé.",
    failed: "Échec de l'upload du logo.",
    invalidType: "Choisissez une image JPG, PNG ou WebP."
  },
  style: {
    help: "Personnalisez les jetons design pour ajuster les couleurs et la typographie. « Enregistrer & appliquer » envoie un CSS régénéré sur votre site.",
    save: "Enregistrer & appliquer",
    saving: "Application…",
    saved: "Style appliqué. Faites Cmd+Maj+R sur les pages publiées pour voir les changements.",
    failed: "Échec de la mise à jour du style.",
    reset: "Réinitialiser",
    resetting: "Réinitialisation…"
  },
  presets: {
    title: "Préréglage de style",
    help: "Choisissez un préréglage graphique pour pré-remplir tous les champs ci-dessous. Vous pourrez ensuite affiner valeur par valeur.",
    classic: {
      label: "Classique",
      description: "Look corporate d'origine — Inter sur surfaces bleu ardoise, primaire navy."
    },
    tech: {
      label: "Tech",
      description: "Surfaces neutres nettes avec accent cyan électrique — Plus Jakarta Sans, look SaaS moderne."
    },
    trust: {
      label: "Confiance",
      description: "Crème chaud et navy profond avec accent ambre — IBM Plex Sans, vibe banque / conseil."
    },
    vibrant: {
      label: "Vibrant",
      description: "Punch rose et orange — DM Sans, look startup énergique."
    },
    executive: {
      label: "Executive",
      description: "Violet profond et or sur crème — Manrope, conseil premium / services de luxe."
    }
  },
  groups: {
    surfaces: "Surfaces",
    foreground: "Texte",
    outlines: "Bordures",
    accent: "Marque & accent",
    typography: "Typographie"
  },
  vars: {
    background: "Fond de page",
    surface: "Surface",
    surfaceLow: "Surface — basse",
    surfaceMid: "Surface — moyenne",
    surfaceHigh: "Surface — haute",
    surfaceLowest: "Surface des cartes",
    onSurface: "Texte du corps",
    onSurfaceVariant: "Texte secondaire",
    outline: "Bordure",
    outlineVariant: "Bordure — subtile",
    primary: "Primaire (navy)",
    onPrimary: "Texte sur primaire",
    primaryContainer: "Conteneur primaire",
    onPrimaryContainer: "Texte sur conteneur primaire",
    secondary: "Secondaire (CTA / liens)",
    onSecondary: "Texte sur secondaire",
    tertiary: "Tertiaire",
    tertiaryContainer: "Conteneur tertiaire"
  },
  fonts: {
    sans: "Sans-serif (toute l'interface)",
    help: "Le thème corporate utilise une seule police pour tout. Chargée via Google Fonts ; la ligne @import est régénérée à l'enregistrement."
  }
}, No = {
  description: "Passen Sie das aktive Theme an. Änderungen wirken sich beim nächsten Laden auf alle veröffentlichten Seiten aus (Browser können das CSS cachen — einmal hart neu laden).",
  tabs: { logo: "Logo", style: "Stil", home: "Startseite", single: "Beitrag" },
  single: {
    help: "Konfigurieren Sie die Seitenleiste der Beitragsseiten. Änderungen werden bei der nächsten Regenerierung auf jeden Beitrag angewendet.",
    save: "Speichern",
    saving: "Speichern…",
    saved: "Beitrags-Einstellungen gespeichert. Beiträge erneut veröffentlichen.",
    failed: "Speichern fehlgeschlagen.",
    sidebarHeading: "Seitenleiste",
    showAuthorBio: "Autor-Karte anzeigen",
    showAuthorBioHelp: "Zeigt Avatar, Name, Rolle, Bio und Social-Links des Autors. Standardmäßig aus — viele Corporate-Seiten bevorzugen es, Beiträge ohne pro-Autor-Bylines zu halten.",
    showPopular: 'Karte „Beliebte Beiträge" anzeigen',
    showPopularHelp: "Listet 3 verwandte Beiträge (gleiche Kategorie zuerst, dann neueste als Fallback). Zur Laufzeit aus /data/posts.json befüllt.",
    popularTitle: 'Titel „Beliebte Beiträge"',
    popularTitleHelp: "Passen Sie die Überschrift über der Liste an. Leer = lokalisierter Standardtext.",
    showCta: 'CTA-Karte „Loslegen" anzeigen',
    showCtaHelp: "Dunkle Navy-Lead-Gen-Karte unten in der Seitenleiste. Nützlich für Lead-Gen-Seiten; ausschalten für rein redaktionelle Blogs.",
    ctaTitle: "CTA-Titel",
    ctaTitleHelp: 'Überschrift oben auf der Karte. Leer = Seitentitel oder „Loslegen".',
    ctaButtonLabel: "Button-Text",
    ctaButtonHref: "Button-Link"
  },
  home: {
    help: 'Konfigurieren Sie den Hero-Bereich der Startseite. Standardmäßig zeigt die Startseite diesen Hero gefolgt von einem Raster der neuesten Beiträge. Wechseln Sie zu einem vollständig benutzerdefinierten Layout, indem Sie Einstellungen → Allgemein → Startseiten-Modus auf „Statische Seite" setzen.',
    save: "Speichern",
    saving: "Speichern…",
    saved: "Startseite gespeichert. Erneut veröffentlichen oder auf die nächste Veröffentlichung warten.",
    failed: "Speichern fehlgeschlagen.",
    showHero: "Hero auf Startseite anzeigen",
    showHeroHelp: "Wenn aus, beginnt die Startseite direkt mit dem Beitragsraster (nützlich für einen redaktionelleren Eindruck).",
    heroHeading: "Hero-Inhalt",
    heroImage: "Hintergrundbild-URL",
    heroImageHelp: "Wählen Sie aus Ihrer Medienbibliothek, fügen Sie eine externe URL ein oder lassen Sie es leer für einen einfarbigen Navy-Hero. Standardmäßig: Unsplash-Büro-Foto.",
    heroImagePick: "Aus Medienbibliothek wählen",
    heroImageClear: "Löschen",
    heroImageAlt: "Bild-Alt-Text",
    heroEyebrow: "Eyebrow-Label",
    heroTitle: "Überschrift",
    heroSubtitle: "Untertitel",
    primaryCtaLabel: "Primärer CTA-Text",
    primaryCtaHref: "Primärer CTA-Link",
    secondaryCtaLabel: "Sekundärer CTA-Text",
    secondaryCtaHref: "Sekundärer CTA-Link",
    featuredHeading: "Featured-Posts-Sektion",
    featuredEnabled: "Featured-Posts-Sektion auf Startseite anzeigen",
    featuredHelp: "Raster mit Beitragskarten unter dem Hero. Wählen Sie eine Kategorie oder ziehen Sie aus allen Beiträgen — neueste zuerst.",
    featuredTitle: "Sektionstitel",
    featuredSubtitle: "Sektion-Untertitel",
    featuredMode: "Quelle",
    featuredModes: { all: "Alle Beiträge (neueste zuerst)", category: "Einzelne Kategorie" },
    featuredCount: "Anzahl der Karten",
    featuredCategory: "Kategorie",
    featuredCategoryPlaceholder: "— Kategorie auswählen —",
    featuredCategoryEmpty: "Noch keine Kategorien. Erstellen Sie zuerst eine in Kategorien.",
    testimonialsHeading: "Testimonials-Sektion",
    testimonialsEnabled: "Testimonials-Sektion auf Startseite anzeigen",
    testimonialsHelp: "Kundenzitate mit Sternebewertung + Autor. Jeder Eintrag ist eine Karte; das Layout passt sich an 1 / 2 / 3+ Elemente an.",
    testimonialsVariant: "Visuelle Variante",
    testimonialsVariants: { glass: "Glas-Karten auf hellem Hintergrund", navy: "Navy-Sektion" },
    testimonialsEyebrow: "Eyebrow-Label (optional)",
    testimonialsTitle: "Sektionstitel",
    testimonialsSubtitle: "Sektion-Untertitel",
    testimonialsItemsHeading: "Testimonials",
    testimonialsAdd: "Testimonial hinzufügen",
    testimonialsItemIndex: "Testimonial {{index}}",
    testimonialsQuote: "Zitat",
    testimonialsAuthorName: "Name des Autors",
    testimonialsAuthorTitle: "Titel des Autors (z. B. CEO, Acme)",
    testimonialsAvatarUrl: "Avatar-URL",
    testimonialsRating: "Bewertung (1–5)"
  },
  logo: {
    help: "Laden Sie ein Logo hoch, um den Text-Wordmark im Header zu ersetzen. Empfohlene Maße: {{width}}×{{height}} px. Bild wird verkleinert und als WebP gespeichert.",
    none: "Kein Logo",
    upload: "Logo hochladen",
    uploading: "Wird hochgeladen…",
    change: "Logo ändern",
    remove: "Logo entfernen",
    removing: "Wird entfernt…",
    saved: "Logo aktualisiert. Veröffentlichte Seiten neu laden, um die Änderung zu sehen.",
    removed: "Logo entfernt.",
    failed: "Logo-Upload fehlgeschlagen.",
    invalidType: "Wählen Sie ein JPG-, PNG- oder WebP-Bild."
  },
  style: {
    help: 'Passen Sie Design-Tokens an, um Farben und Typografie zu personalisieren. „Speichern & anwenden" lädt ein neu generiertes Theme-CSS auf Ihre Seite hoch.',
    save: "Speichern & anwenden",
    saving: "Wird angewendet…",
    saved: "Stil angewendet. Hart-Refresh auf veröffentlichten Seiten, um die Änderungen zu sehen.",
    failed: "Stil-Aktualisierung fehlgeschlagen.",
    reset: "Auf Standards zurücksetzen",
    resetting: "Wird zurückgesetzt…"
  },
  presets: {
    title: "Stil-Voreinstellung",
    help: "Wählen Sie eine grafische Voreinstellung, um alle Felder unten zu befüllen. Sie können Werte danach einzeln feinjustieren.",
    classic: {
      label: "Klassisch",
      description: "Originale Corporate-Basis — Inter auf schieferblauen Flächen, marineblaue Primärfarbe."
    },
    tech: {
      label: "Tech",
      description: "Knackige neutrale Flächen mit elektrischem Cyan-Akzent — Plus Jakarta Sans, moderner SaaS-Look."
    },
    trust: {
      label: "Vertrauen",
      description: "Warmes Creme und tiefes Marineblau mit Amber-Akzent — IBM Plex Sans, Banking-/Beratungs-Vibe."
    },
    vibrant: {
      label: "Vibrant",
      description: "Rosa und Orange mit Punch — DM Sans, energiegeladenes Startup-Gefühl."
    },
    executive: {
      label: "Executive",
      description: "Tiefes Lila und Gold auf Creme — Manrope, Premium-Consulting / Luxusdienstleistungen."
    }
  },
  groups: {
    surfaces: "Oberflächen",
    foreground: "Vordergrund",
    outlines: "Konturen",
    accent: "Marke & Akzent",
    typography: "Typografie"
  },
  vars: {
    background: "Seitenhintergrund",
    surface: "Oberfläche",
    surfaceLow: "Oberfläche — niedrig",
    surfaceMid: "Oberfläche — mittel",
    surfaceHigh: "Oberfläche — hoch",
    surfaceLowest: "Karten-Oberfläche",
    onSurface: "Fließtext",
    onSurfaceVariant: "Sekundärtext",
    outline: "Kontur",
    outlineVariant: "Kontur — subtil",
    primary: "Primär (Navy)",
    onPrimary: "Text auf Primär",
    primaryContainer: "Primär-Container",
    onPrimaryContainer: "Text auf Primär-Container",
    secondary: "Sekundär (CTA / Links)",
    onSecondary: "Text auf Sekundär",
    tertiary: "Tertiär",
    tertiaryContainer: "Tertiär-Container"
  },
  fonts: {
    sans: "Sans-Serif (gesamte Oberfläche)",
    help: "Das Corporate-Theme verwendet eine Schriftart für alles. Über Google Fonts geladen; die @import-Zeile wird beim Speichern neu generiert."
  }
}, Ao = {
  description: "Personaliza el tema activo. Los cambios afectan a todas las páginas publicadas en la próxima carga (los navegadores pueden cachear el CSS — recarga forzada una vez).",
  tabs: { logo: "Logo", style: "Estilo", home: "Inicio", single: "Artículo" },
  single: {
    help: "Configura la barra lateral de las páginas de artículo. Los cambios se aplican a cada artículo en la próxima regeneración.",
    save: "Guardar",
    saving: "Guardando…",
    saved: "Ajustes de artículo guardados. Republica los artículos para aplicarlos.",
    failed: "Error al guardar.",
    sidebarHeading: "Barra lateral",
    showAuthorBio: "Mostrar tarjeta de autor",
    showAuthorBioHelp: "Muestra el avatar, nombre, rol, biografía y enlaces sociales del autor. Desactivado por defecto — muchos sitios corporativos prefieren no mostrar el autor en cada artículo.",
    showPopular: "Mostrar la tarjeta «Artículos populares»",
    showPopularHelp: "Lista 3 artículos relacionados (misma categoría primero, luego los más recientes como fallback). Rellenado en runtime desde /data/posts.json.",
    popularTitle: "Título «Artículos populares»",
    popularTitleHelp: "Personaliza el título mostrado encima de la lista. Vacío = etiqueta localizada por defecto.",
    showCta: "Mostrar tarjeta CTA «Empezar»",
    showCtaHelp: "Tarjeta navy de lead-gen al final de la barra lateral. Útil en sitios lead-gen; desactívala para blogs solo editoriales.",
    ctaTitle: "Título del CTA",
    ctaTitleHelp: "Encabezado mostrado en la parte superior de la tarjeta. Vacío = título del sitio o «Empezar».",
    ctaButtonLabel: "Texto del botón",
    ctaButtonHref: "Enlace del botón"
  },
  home: {
    help: "Configura la sección hero de la página de inicio. Por defecto, el inicio muestra este hero seguido de una cuadrícula de últimas entradas. Para un layout totalmente personalizado, pasa a modo «Página estática» en Ajustes → General y apunta a una página compuesta de bloques.",
    save: "Guardar",
    saving: "Guardando…",
    saved: "Inicio guardado. Vuelve a publicar o espera la próxima publicación para aplicarlo.",
    failed: "Error al guardar.",
    showHero: "Mostrar hero en inicio",
    showHeroHelp: "Desactivado, el inicio se abre directamente con la cuadrícula de últimas entradas (útil para un aspecto más sobrio).",
    heroHeading: "Contenido del hero",
    heroImage: "URL de la imagen de fondo",
    heroImageHelp: "Elige desde tu biblioteca de medios, pega una URL externa, o déjalo vacío para un hero navy sólido. Por defecto: foto de oficina corporativa en Unsplash.",
    heroImagePick: "Elegir desde la biblioteca",
    heroImageClear: "Borrar",
    heroImageAlt: "Texto alternativo",
    heroEyebrow: "Etiqueta",
    heroTitle: "Titular",
    heroSubtitle: "Subtítulo / lede",
    primaryCtaLabel: "Texto del CTA principal",
    primaryCtaHref: "Enlace del CTA principal",
    secondaryCtaLabel: "Texto del CTA secundario",
    secondaryCtaHref: "Enlace del CTA secundario",
    featuredHeading: "Sección de artículos destacados",
    featuredEnabled: "Mostrar la sección de artículos destacados en el inicio",
    featuredHelp: "Cuadrícula de tarjetas de artículos bajo el hero. Elige una categoría o extrae de todos los artículos — orden más reciente primero.",
    featuredTitle: "Título de sección",
    featuredSubtitle: "Subtítulo de sección",
    featuredMode: "Fuente",
    featuredModes: { all: "Todos los artículos (más recientes primero)", category: "Una sola categoría" },
    featuredCount: "Número de tarjetas",
    featuredCategory: "Categoría",
    featuredCategoryPlaceholder: "— Elegir una categoría —",
    featuredCategoryEmpty: "Aún no hay categorías. Crea una en Categorías primero.",
    testimonialsHeading: "Sección de testimonios",
    testimonialsEnabled: "Mostrar la sección de testimonios en el inicio",
    testimonialsHelp: "Citas de clientes con calificación + autor. Cada entrada es una tarjeta; el layout se adapta a 1 / 2 / 3+ elementos.",
    testimonialsVariant: "Variante visual",
    testimonialsVariants: { glass: "Tarjetas glass sobre fondo claro", navy: "Sección navy" },
    testimonialsEyebrow: "Etiqueta (opcional)",
    testimonialsTitle: "Título de sección",
    testimonialsSubtitle: "Subtítulo de sección",
    testimonialsItemsHeading: "Testimonios",
    testimonialsAdd: "Añadir testimonio",
    testimonialsItemIndex: "Testimonio {{index}}",
    testimonialsQuote: "Cita",
    testimonialsAuthorName: "Nombre del autor",
    testimonialsAuthorTitle: "Cargo del autor (p. ej. CEO, Acme)",
    testimonialsAvatarUrl: "URL del avatar",
    testimonialsRating: "Calificación (1–5)"
  },
  logo: {
    help: "Sube un logo para reemplazar la marca textual en el encabezado. Dimensiones recomendadas: {{width}}×{{height}} px. La imagen se redimensiona y se guarda como WebP.",
    none: "Sin logo",
    upload: "Subir logo",
    uploading: "Subiendo…",
    change: "Cambiar logo",
    remove: "Eliminar logo",
    removing: "Eliminando…",
    saved: "Logo actualizado. Recarga las páginas publicadas para ver el cambio.",
    removed: "Logo eliminado.",
    failed: "Error al subir el logo.",
    invalidType: "Elige una imagen JPG, PNG o WebP."
  },
  style: {
    help: "Ajusta los tokens de diseño para personalizar colores y tipografía. «Guardar y aplicar» envía un CSS de tema regenerado a tu sitio.",
    save: "Guardar y aplicar",
    saving: "Aplicando…",
    saved: "Estilo aplicado. Recarga forzada en las páginas publicadas para ver los cambios.",
    failed: "Error al actualizar el estilo.",
    reset: "Restablecer valores predeterminados",
    resetting: "Restableciendo…"
  },
  presets: {
    title: "Preset de estilo",
    help: "Elige un preset gráfico para rellenar todos los campos. Puedes ajustar valor por valor después.",
    classic: {
      label: "Clásico",
      description: "Look corporate original — Inter sobre superficies azul pizarra, primario azul marino."
    },
    tech: {
      label: "Tech",
      description: "Superficies neutras nítidas con acento cian eléctrico — Plus Jakarta Sans, look SaaS moderno."
    },
    trust: {
      label: "Confianza",
      description: "Crema cálido y azul marino profundo con acento ámbar — IBM Plex Sans, banca / asesoría."
    },
    vibrant: {
      label: "Vibrante",
      description: "Toque rosa y naranja — DM Sans, look startup enérgico."
    },
    executive: {
      label: "Executive",
      description: "Púrpura profundo y oro sobre crema — Manrope, consultoría premium / servicios de lujo."
    }
  },
  groups: {
    surfaces: "Superficies",
    foreground: "Texto",
    outlines: "Bordes",
    accent: "Marca y acento",
    typography: "Tipografía"
  },
  vars: {
    background: "Fondo de página",
    surface: "Superficie",
    surfaceLow: "Superficie — baja",
    surfaceMid: "Superficie — media",
    surfaceHigh: "Superficie — alta",
    surfaceLowest: "Superficie de tarjetas",
    onSurface: "Texto del cuerpo",
    onSurfaceVariant: "Texto secundario",
    outline: "Borde",
    outlineVariant: "Borde — sutil",
    primary: "Primario (navy)",
    onPrimary: "Texto sobre primario",
    primaryContainer: "Contenedor primario",
    onPrimaryContainer: "Texto sobre contenedor primario",
    secondary: "Secundario (CTA / enlaces)",
    onSecondary: "Texto sobre secundario",
    tertiary: "Terciario",
    tertiaryContainer: "Contenedor terciario"
  },
  fonts: {
    sans: "Sans-serif (toda la interfaz)",
    help: "El tema corporativo usa una sola fuente para todo. Cargada vía Google Fonts; la línea @import se regenera al guardar."
  }
}, To = {
  description: "Pas het actieve thema aan. Wijzigingen gelden voor elke gepubliceerde pagina bij de volgende keer laden (browsers kunnen CSS cachen — eenmaal hard verversen).",
  tabs: { logo: "Logo", style: "Stijl", home: "Home", single: "Post" },
  single: {
    help: "Configureer de zijbalk van post-pagina's. Wijzigingen worden toegepast op elke post bij de volgende regeneratie.",
    save: "Opslaan",
    saving: "Opslaan…",
    saved: "Post-instellingen opgeslagen. Posts opnieuw publiceren om toe te passen.",
    failed: "Opslaan mislukt.",
    sidebarHeading: "Zijbalk",
    showAuthorBio: "Auteurskaart tonen",
    showAuthorBioHelp: "Toont avatar, naam, rol, biografie en sociale links van de auteur. Standaard uit — veel corporate sites tonen liever geen auteur per post.",
    showPopular: 'Kaart "Populaire artikelen" tonen',
    showPopularHelp: "Toont 3 gerelateerde posts (zelfde categorie eerst, dan nieuwste als fallback). Runtime gevuld vanuit /data/posts.json.",
    popularTitle: 'Titel "Populaire artikelen"',
    popularTitleHelp: "Pas de kop boven de lijst aan. Leeg = gelokaliseerde standaardtekst.",
    showCta: 'CTA-kaart "Aan de slag" tonen',
    showCtaHelp: "Donkere navy lead-gen kaart onderaan de zijbalk. Nuttig voor lead-gen sites; uitschakelen voor puur editoriale blogs.",
    ctaTitle: "CTA-titel",
    ctaTitleHelp: 'Kop bovenaan de kaart. Leeg = sitetitel of "Aan de slag".',
    ctaButtonLabel: "Knop-tekst",
    ctaButtonHref: "Knop-link"
  },
  home: {
    help: 'Configureer de hero-sectie van de homepage. Standaard toont de home deze hero gevolgd door een raster met laatste posts. Schakel over naar een volledig aangepaste layout door Instellingen → Algemeen → Home-modus op "Statische pagina" te zetten.',
    save: "Opslaan",
    saving: "Opslaan…",
    saved: "Home opgeslagen. Publiceer opnieuw of wacht op de volgende publicatie.",
    failed: "Opslaan mislukt.",
    showHero: "Hero op home tonen",
    showHeroHelp: "Uit, opent de home direct met het posts-raster (nuttig voor een soberder uiterlijk).",
    heroHeading: "Hero-inhoud",
    heroImage: "Achtergrondafbeelding URL",
    heroImageHelp: "Kies uit je Mediabibliotheek, plak een externe URL of laat leeg voor een effen navy hero. Standaard: Unsplash kantoorfoto.",
    heroImagePick: "Kies uit mediabibliotheek",
    heroImageClear: "Wissen",
    heroImageAlt: "Alt-tekst",
    heroEyebrow: "Eyebrow-label",
    heroTitle: "Kop",
    heroSubtitle: "Subtitel / lede",
    primaryCtaLabel: "Primaire CTA-tekst",
    primaryCtaHref: "Primaire CTA-link",
    secondaryCtaLabel: "Secundaire CTA-tekst",
    secondaryCtaHref: "Secundaire CTA-link",
    featuredHeading: "Uitgelichte posts-sectie",
    featuredEnabled: "Uitgelichte posts-sectie op home tonen",
    featuredHelp: "Raster van post-kaarten onder de hero. Kies een categorie of trek uit alle posts — nieuwste eerst.",
    featuredTitle: "Sectietitel",
    featuredSubtitle: "Sectie-ondertitel",
    featuredMode: "Bron",
    featuredModes: { all: "Alle posts (nieuwste eerst)", category: "Eén categorie" },
    featuredCount: "Aantal kaarten",
    featuredCategory: "Categorie",
    featuredCategoryPlaceholder: "— Kies een categorie —",
    featuredCategoryEmpty: "Nog geen categorieën. Maak er eerst een aan in Categorieën.",
    testimonialsHeading: "Testimonials-sectie",
    testimonialsEnabled: "Testimonials-sectie op home tonen",
    testimonialsHelp: "Klantcitaten met sterbeoordeling + auteur. Elke entry is een kaart; de layout past zich aan 1 / 2 / 3+ items aan.",
    testimonialsVariant: "Visuele variant",
    testimonialsVariants: { glass: "Glaskaarten op lichte achtergrond", navy: "Navy-sectie" },
    testimonialsEyebrow: "Eyebrow-label (optioneel)",
    testimonialsTitle: "Sectietitel",
    testimonialsSubtitle: "Sectie-ondertitel",
    testimonialsItemsHeading: "Testimonials",
    testimonialsAdd: "Testimonial toevoegen",
    testimonialsItemIndex: "Testimonial {{index}}",
    testimonialsQuote: "Citaat",
    testimonialsAuthorName: "Naam van auteur",
    testimonialsAuthorTitle: "Titel van auteur (bv. CEO, Acme)",
    testimonialsAvatarUrl: "Avatar-URL",
    testimonialsRating: "Beoordeling (1–5)"
  },
  logo: {
    help: "Upload een logo om het tekstwordmark in de header te vervangen. Aanbevolen afmetingen: {{width}}×{{height}} px. Afbeelding wordt verkleind en opgeslagen als WebP.",
    none: "Geen logo ingesteld",
    upload: "Logo uploaden",
    uploading: "Uploaden…",
    change: "Logo wijzigen",
    remove: "Logo verwijderen",
    removing: "Verwijderen…",
    saved: "Logo bijgewerkt. Herlaad gepubliceerde pagina's om de wijziging te zien.",
    removed: "Logo verwijderd.",
    failed: "Logo upload mislukt.",
    invalidType: "Kies een JPG-, PNG- of WebP-afbeelding."
  },
  style: {
    help: 'Pas design-tokens aan om kleuren en typografie te personaliseren. "Opslaan & toepassen" stuurt een opnieuw gegenereerde theme-CSS naar je site.',
    save: "Opslaan & toepassen",
    saving: "Toepassen…",
    saved: "Stijl toegepast. Hard verversen op gepubliceerde pagina's om de wijzigingen te zien.",
    failed: "Stijl bijwerken mislukt.",
    reset: "Terug naar standaard",
    resetting: "Resetten…"
  },
  presets: {
    title: "Stijl-preset",
    help: "Kies een grafische preset om alle velden hieronder in te vullen. Je kunt waarden daarna individueel verfijnen.",
    classic: {
      label: "Klassiek",
      description: "Originele corporate baseline — Inter op leiblauwe oppervlakken, marineblauwe primaire."
    },
    tech: {
      label: "Tech",
      description: "Krachtige neutrale oppervlakken met elektrisch cyaan-accent — Plus Jakarta Sans, moderne SaaS-look."
    },
    trust: {
      label: "Vertrouwen",
      description: "Warm crème en diep marineblauw met amber-accent — IBM Plex Sans, banking / advies vibe."
    },
    vibrant: {
      label: "Vibrant",
      description: "Roze en oranje punch — DM Sans, energiek startup-gevoel."
    },
    executive: {
      label: "Executive",
      description: "Diep paars en goud op crème — Manrope, premium consulting / luxe diensten."
    }
  },
  groups: {
    surfaces: "Oppervlakken",
    foreground: "Tekst",
    outlines: "Randen",
    accent: "Merk & accent",
    typography: "Typografie"
  },
  vars: {
    background: "Pagina-achtergrond",
    surface: "Oppervlak",
    surfaceLow: "Oppervlak — laag",
    surfaceMid: "Oppervlak — midden",
    surfaceHigh: "Oppervlak — hoog",
    surfaceLowest: "Kaartoppervlak",
    onSurface: "Bodytekst",
    onSurfaceVariant: "Secundaire tekst",
    outline: "Rand",
    outlineVariant: "Rand — subtiel",
    primary: "Primair (navy)",
    onPrimary: "Tekst op primair",
    primaryContainer: "Primaire container",
    onPrimaryContainer: "Tekst op primaire container",
    secondary: "Secundair (CTA / links)",
    onSecondary: "Tekst op secundair",
    tertiary: "Tertiair",
    tertiaryContainer: "Tertiaire container"
  },
  fonts: {
    sans: "Sans-serif (volledige interface)",
    help: "Het corporate-thema gebruikt één lettertype voor alles. Geladen via Google Fonts; de @import-regel wordt opnieuw gegenereerd bij opslaan."
  }
}, Eo = {
  description: "Personalize o tema ativo. As alterações afetam todas as páginas publicadas no próximo carregamento (os navegadores podem fazer cache do CSS — recarregue forçado uma vez).",
  tabs: { logo: "Logo", style: "Estilo", home: "Início", single: "Artigo" },
  single: {
    help: "Configure a barra lateral das páginas de artigo. As alterações são aplicadas a cada artigo na próxima regeneração.",
    save: "Salvar",
    saving: "Salvando…",
    saved: "Configurações de artigo salvas. Republique os artigos para aplicar.",
    failed: "Falha ao salvar.",
    sidebarHeading: "Barra lateral",
    showAuthorBio: "Mostrar cartão do autor",
    showAuthorBioHelp: "Mostra avatar, nome, cargo, biografia e links sociais do autor. Desativado por padrão — muitos sites corporativos preferem não mostrar o autor em cada artigo.",
    showPopular: "Mostrar cartão «Artigos populares»",
    showPopularHelp: "Lista 3 artigos relacionados (mesma categoria primeiro, depois os mais recentes como fallback). Preenchido em runtime de /data/posts.json.",
    popularTitle: "Título «Artigos populares»",
    popularTitleHelp: "Personalize o título mostrado acima da lista. Vazio = rótulo localizado padrão.",
    showCta: "Mostrar cartão CTA «Começar»",
    showCtaHelp: "Cartão navy de lead-gen no final da barra lateral. Útil para sites lead-gen; desative para blogs apenas editoriais.",
    ctaTitle: "Título do CTA",
    ctaTitleHelp: "Cabeçalho mostrado no topo do cartão. Vazio = título do site ou «Começar».",
    ctaButtonLabel: "Texto do botão",
    ctaButtonHref: "Link do botão"
  },
  home: {
    help: "Configure a seção hero da página inicial. Por padrão, a página inicial exibe este hero seguido de uma grade dos últimos artigos. Para um layout totalmente personalizado, mude para o modo «Página estática» em Configurações → Geral.",
    save: "Salvar",
    saving: "Salvando…",
    saved: "Início salvo. Republique ou aguarde a próxima publicação.",
    failed: "Falha ao salvar.",
    showHero: "Mostrar hero na página inicial",
    showHeroHelp: "Quando desativado, a página inicial abre diretamente com a grade dos últimos artigos (útil para uma apresentação mais sóbria).",
    heroHeading: "Conteúdo do hero",
    heroImage: "URL da imagem de fundo",
    heroImageHelp: "Escolha da sua Biblioteca de mídia, cole uma URL externa ou deixe vazio para um hero navy sólido. Por padrão: foto de escritório corporativo do Unsplash.",
    heroImagePick: "Escolher da biblioteca",
    heroImageClear: "Limpar",
    heroImageAlt: "Texto alternativo",
    heroEyebrow: "Etiqueta",
    heroTitle: "Manchete",
    heroSubtitle: "Lede / subtítulo",
    primaryCtaLabel: "Texto do CTA principal",
    primaryCtaHref: "Link do CTA principal",
    secondaryCtaLabel: "Texto do CTA secundário",
    secondaryCtaHref: "Link do CTA secundário",
    featuredHeading: "Seção de artigos em destaque",
    featuredEnabled: "Mostrar a seção de artigos em destaque na página inicial",
    featuredHelp: "Grade de cartões de artigos abaixo do hero. Escolha uma categoria ou puxe de todos os artigos — mais recentes primeiro.",
    featuredTitle: "Título da seção",
    featuredSubtitle: "Subtítulo da seção",
    featuredMode: "Fonte",
    featuredModes: { all: "Todos os artigos (mais recentes primeiro)", category: "Uma única categoria" },
    featuredCount: "Número de cartões",
    featuredCategory: "Categoria",
    featuredCategoryPlaceholder: "— Escolher uma categoria —",
    featuredCategoryEmpty: "Ainda não há categorias. Crie uma em Categorias primeiro.",
    testimonialsHeading: "Seção de depoimentos",
    testimonialsEnabled: "Mostrar a seção de depoimentos na página inicial",
    testimonialsHelp: "Citações de clientes com classificação + autor. Cada entrada é um cartão; o layout adapta-se a 1 / 2 / 3+ itens.",
    testimonialsVariant: "Variante visual",
    testimonialsVariants: { glass: "Cartões glass sobre fundo claro", navy: "Seção navy" },
    testimonialsEyebrow: "Etiqueta (opcional)",
    testimonialsTitle: "Título da seção",
    testimonialsSubtitle: "Subtítulo da seção",
    testimonialsItemsHeading: "Depoimentos",
    testimonialsAdd: "Adicionar depoimento",
    testimonialsItemIndex: "Depoimento {{index}}",
    testimonialsQuote: "Citação",
    testimonialsAuthorName: "Nome do autor",
    testimonialsAuthorTitle: "Cargo do autor (ex. CEO, Acme)",
    testimonialsAvatarUrl: "URL do avatar",
    testimonialsRating: "Classificação (1–5)"
  },
  logo: {
    help: "Envie um logo para substituir a marca textual no cabeçalho. Dimensões recomendadas: {{width}}×{{height}} px. A imagem é redimensionada e armazenada como WebP.",
    none: "Sem logo",
    upload: "Enviar logo",
    uploading: "Enviando…",
    change: "Alterar logo",
    remove: "Remover logo",
    removing: "Removendo…",
    saved: "Logo atualizado. Recarregue as páginas publicadas para ver a alteração.",
    removed: "Logo removido.",
    failed: "Falha no envio do logo.",
    invalidType: "Escolha uma imagem JPG, PNG ou WebP."
  },
  style: {
    help: "Ajuste os tokens de design para personalizar cores e tipografia. «Salvar e aplicar» envia um CSS de tema regenerado para seu site.",
    save: "Salvar e aplicar",
    saving: "Aplicando…",
    saved: "Estilo aplicado. Recarga forçada nas páginas publicadas para ver as alterações.",
    failed: "Falha na atualização do estilo.",
    reset: "Restaurar padrões",
    resetting: "Restaurando…"
  },
  presets: {
    title: "Predefinição de estilo",
    help: "Escolha uma predefinição gráfica para preencher todos os campos abaixo. Pode ajustar valor a valor depois.",
    classic: {
      label: "Clássico",
      description: "Look corporate original — Inter sobre superfícies azul-ardósia, primária navy."
    },
    tech: {
      label: "Tech",
      description: "Superfícies neutras nítidas com acento ciano elétrico — Plus Jakarta Sans, look SaaS moderno."
    },
    trust: {
      label: "Confiança",
      description: "Creme quente e navy profundo com acento âmbar — IBM Plex Sans, banca / consultoria."
    },
    vibrant: {
      label: "Vibrante",
      description: "Toque rosa e laranja — DM Sans, look startup enérgico."
    },
    executive: {
      label: "Executive",
      description: "Roxo profundo e ouro sobre creme — Manrope, consultoria premium / serviços de luxo."
    }
  },
  groups: {
    surfaces: "Superfícies",
    foreground: "Texto",
    outlines: "Bordas",
    accent: "Marca e acento",
    typography: "Tipografia"
  },
  vars: {
    background: "Fundo da página",
    surface: "Superfície",
    surfaceLow: "Superfície — baixa",
    surfaceMid: "Superfície — média",
    surfaceHigh: "Superfície — alta",
    surfaceLowest: "Superfície dos cards",
    onSurface: "Texto do corpo",
    onSurfaceVariant: "Texto secundário",
    outline: "Borda",
    outlineVariant: "Borda — sutil",
    primary: "Primário (navy)",
    onPrimary: "Texto sobre primário",
    primaryContainer: "Container primário",
    onPrimaryContainer: "Texto sobre container primário",
    secondary: "Secundário (CTA / links)",
    onSecondary: "Texto sobre secundário",
    tertiary: "Terciário",
    tertiaryContainer: "Container terciário"
  },
  fonts: {
    sans: "Sans-serif (toda a interface)",
    help: "O tema corporate usa uma única fonte para tudo. Carregada via Google Fonts; a linha @import é regenerada ao salvar."
  }
}, Lo = {
  description: "활성 테마를 사용자 정의합니다. 변경사항은 다음 로드 시 모든 게시된 페이지에 적용됩니다 (브라우저가 CSS를 캐시할 수 있습니다 — 한 번 강제 새로고침).",
  tabs: { logo: "로고", style: "스타일", home: "홈", single: "게시물" },
  single: {
    help: "단일 게시물 페이지 사이드바를 구성합니다. 변경사항은 다음 재생성 시 모든 게시물에 적용됩니다.",
    save: "저장",
    saving: "저장 중…",
    saved: "단일 게시물 설정이 저장되었습니다. 적용하려면 게시물을 다시 게시하세요.",
    failed: "저장 실패.",
    sidebarHeading: "사이드바",
    showAuthorBio: "작성자 약력 카드 표시",
    showAuthorBioHelp: "작성자의 아바타, 이름, 역할, 약력 및 소셜 링크를 표시합니다. 기본적으로 꺼짐 — 많은 기업 사이트는 게시물별 작성자 표시를 선호하지 않습니다.",
    showPopular: "「인기 기사」 카드 표시",
    showPopularHelp: "3개의 관련 게시물을 나열합니다 (같은 카테고리 우선, 그 다음 최신순). 런타임에 /data/posts.json에서 채워집니다.",
    popularTitle: "「인기 기사」 제목",
    popularTitleHelp: "목록 위에 표시되는 제목을 사용자 정의하세요. 비어있음 = 현지화된 기본값.",
    showCta: "「시작하기」 CTA 카드 표시",
    showCtaHelp: "사이드바 하단의 어두운 네이비 리드-젠 카드. 리드-젠 사이트에 유용; 순수 편집 블로그의 경우 끄세요.",
    ctaTitle: "CTA 제목",
    ctaTitleHelp: "카드 상단에 표시되는 헤더. 비어있음 = 사이트 제목 또는 「시작하기」.",
    ctaButtonLabel: "버튼 텍스트",
    ctaButtonHref: "버튼 링크"
  },
  home: {
    help: '홈 히어로 섹션을 구성합니다. 기본적으로 홈은 이 히어로와 최신 글 그리드를 표시합니다. 완전히 사용자 정의된 레이아웃으로 전환하려면 설정 → 일반 → 홈 모드를 "정적 페이지"로 설정하세요.',
    save: "저장",
    saving: "저장 중…",
    saved: "홈이 저장되었습니다. 다시 게시하거나 다음 게시를 기다리세요.",
    failed: "저장 실패.",
    showHero: "홈에 히어로 표시",
    showHeroHelp: "꺼지면 홈이 최신 글 그리드로 바로 열립니다 (더 차분한 표현에 유용).",
    heroHeading: "히어로 콘텐츠",
    heroImage: "배경 이미지 URL",
    heroImageHelp: "미디어 라이브러리에서 선택하거나 외부 URL을 붙여넣거나 단색 네이비 히어로를 위해 비워 두세요. 기본값: Unsplash 기업 사무실 사진.",
    heroImagePick: "미디어 라이브러리에서 선택",
    heroImageClear: "지우기",
    heroImageAlt: "이미지 대체 텍스트",
    heroEyebrow: "아이브로 라벨",
    heroTitle: "헤드라인",
    heroSubtitle: "서브타이틀",
    primaryCtaLabel: "기본 CTA 텍스트",
    primaryCtaHref: "기본 CTA 링크",
    secondaryCtaLabel: "보조 CTA 텍스트",
    secondaryCtaHref: "보조 CTA 링크",
    featuredHeading: "추천 게시물 섹션",
    featuredEnabled: "홈에 추천 게시물 섹션 표시",
    featuredHelp: "히어로 아래의 게시물 카드 그리드. 카테고리를 선택하거나 모든 게시물에서 가져옵니다 — 가장 최근 순.",
    featuredTitle: "섹션 제목",
    featuredSubtitle: "섹션 부제",
    featuredMode: "출처",
    featuredModes: { all: "모든 게시물 (최신순)", category: "단일 카테고리" },
    featuredCount: "카드 수",
    featuredCategory: "카테고리",
    featuredCategoryPlaceholder: "— 카테고리 선택 —",
    featuredCategoryEmpty: "카테고리가 아직 없습니다. 카테고리에서 먼저 만드세요.",
    testimonialsHeading: "추천사 섹션",
    testimonialsEnabled: "홈에 추천사 섹션 표시",
    testimonialsHelp: "별점 평가 + 작성자가 있는 고객 인용문. 각 항목은 카드입니다; 레이아웃은 1 / 2 / 3+ 항목에 맞춰집니다.",
    testimonialsVariant: "시각적 변형",
    testimonialsVariants: { glass: "밝은 배경 위 글래스 카드", navy: "네이비 섹션" },
    testimonialsEyebrow: "아이브로 라벨 (선택사항)",
    testimonialsTitle: "섹션 제목",
    testimonialsSubtitle: "섹션 부제",
    testimonialsItemsHeading: "추천사",
    testimonialsAdd: "추천사 추가",
    testimonialsItemIndex: "추천사 {{index}}",
    testimonialsQuote: "인용문",
    testimonialsAuthorName: "작성자 이름",
    testimonialsAuthorTitle: "작성자 직함 (예: CEO, Acme)",
    testimonialsAvatarUrl: "아바타 URL",
    testimonialsRating: "평점 (1–5)"
  },
  logo: {
    help: "헤더의 텍스트 워드마크를 대체할 로고를 업로드하세요. 권장 크기: {{width}}×{{height}} px. 이미지는 크기 조정되어 WebP로 저장됩니다.",
    none: "로고 없음",
    upload: "로고 업로드",
    uploading: "업로드 중…",
    change: "로고 변경",
    remove: "로고 제거",
    removing: "제거 중…",
    saved: "로고가 업데이트되었습니다. 변경사항을 보려면 게시된 페이지를 다시 로드하세요.",
    removed: "로고가 제거되었습니다.",
    failed: "로고 업로드 실패.",
    invalidType: "JPG, PNG 또는 WebP 이미지를 선택하세요."
  },
  style: {
    help: '디자인 토큰을 조정하여 색상과 타이포그래피를 사용자 정의합니다. "저장 및 적용"은 재생성된 테마 CSS를 사이트에 푸시합니다.',
    save: "저장 및 적용",
    saving: "적용 중…",
    saved: "스타일이 적용되었습니다. 게시된 페이지에서 강제 새로고침하여 변경사항을 확인하세요.",
    failed: "스타일 업데이트 실패.",
    reset: "기본값으로 재설정",
    resetting: "재설정 중…"
  },
  presets: {
    title: "스타일 프리셋",
    help: "그래픽 프리셋을 선택하면 아래 모든 필드가 자동으로 채워집니다. 이후에 값을 개별적으로 조정할 수 있습니다.",
    classic: {
      label: "클래식",
      description: "원본 코퍼레이트 기본 — 슬레이트 블루 표면 위 Inter, 네이비 프라이머리."
    },
    tech: {
      label: "테크",
      description: "선명한 중성 표면과 일렉트릭 시안 강조색 — Plus Jakarta Sans, 모던 SaaS 룩."
    },
    trust: {
      label: "신뢰",
      description: "따뜻한 크림과 진한 네이비, 앰버 강조색 — IBM Plex Sans, 금융 / 컨설팅 분위기."
    },
    vibrant: {
      label: "비비드",
      description: "핑크와 오렌지의 펀치 — DM Sans, 에너지 넘치는 스타트업 룩."
    },
    executive: {
      label: "이그제큐티브",
      description: "딥 퍼플과 골드, 크림 베이스 — Manrope, 프리미엄 컨설팅 / 럭셔리 서비스."
    }
  },
  groups: {
    surfaces: "표면",
    foreground: "텍스트",
    outlines: "외곽선",
    accent: "브랜드 및 강조",
    typography: "타이포그래피"
  },
  vars: {
    background: "페이지 배경",
    surface: "표면",
    surfaceLow: "표면 — 낮음",
    surfaceMid: "표면 — 중간",
    surfaceHigh: "표면 — 높음",
    surfaceLowest: "카드 표면",
    onSurface: "본문 텍스트",
    onSurfaceVariant: "보조 텍스트",
    outline: "외곽선",
    outlineVariant: "외곽선 — 부드러움",
    primary: "기본 (네이비)",
    onPrimary: "기본 위 텍스트",
    primaryContainer: "기본 컨테이너",
    onPrimaryContainer: "기본 컨테이너 위 텍스트",
    secondary: "보조 (CTA / 링크)",
    onSecondary: "보조 위 텍스트",
    tertiary: "3차",
    tertiaryContainer: "3차 컨테이너"
  },
  fonts: {
    sans: "산세리프 (전체 인터페이스)",
    help: "코퍼레이트 테마는 모든 것에 하나의 글꼴을 사용합니다. Google Fonts를 통해 로드되며 저장 시 @import 라인이 재생성됩니다."
  }
}, Mo = {
  title: "Theme settings",
  settings: So,
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
    getStarted: "Get Started",
    readMore: "Read more",
    readArticle: "Read article",
    learnMore: "Learn more",
    minRead: "{{minutes}} min read",
    popularArticles: "Popular articles",
    relatedFromSite: "Latest from {{site}}",
    shareThisArticle: "Share this article",
    backToInsights: "Back to {{name}}",
    pageOf: "Page {{current}} of {{total}}",
    previous: "Previous",
    next: "Next",
    articlesPublished: "Articles published",
    monthlyReaders: "Monthly readers"
  },
  blocks: {
    unknownPost: "Unknown post",
    heroOverlay: {
      title: "Hero — overlay",
      untitled: "(no title)",
      imageUrl: "Background image URL",
      imageUrlHelp: "Paste the URL of an image hosted on your site (Media library) or anywhere else.",
      imageAlt: "Alt text",
      eyebrow: "Eyebrow label",
      heading: "Headline",
      subtitle: "Lede / subtitle",
      primaryCtaLabel: "Primary CTA label",
      primaryCtaHref: "Primary CTA link",
      secondaryCtaLabel: "Secondary CTA label",
      secondaryCtaHref: "Secondary CTA link"
    },
    heroSplit: {
      title: "Hero — split",
      untitled: "(no title)",
      eyebrow: "Eyebrow label",
      heading: "Headline",
      subtitle: "Lede / subtitle",
      decorImageUrl: "Decorative image URL",
      decorImageHelp: "Faded into the right half of the hero. Optional — leave empty for a clean text-only variant."
    },
    servicesGrid: {
      title: "Services grid",
      preview: "{{count}} services",
      eyebrow: "Eyebrow label",
      heading: "Section heading",
      subtitle: "Section subtitle",
      servicesHeading: "Service cards",
      addService: "Add service",
      removeService: "Remove",
      moveUp: "Move up",
      moveDown: "Move down",
      serviceIndex: "Service {{index}}",
      icon: "Icon",
      iconHelp: "Use any Material Symbols Outlined glyph name — e.g. analytics, cloud_sync, security.",
      accent: "Accent (dark navy)",
      serviceTitle: "Title",
      serviceDescription: "Description",
      ctaLabel: "CTA label",
      ctaHref: "CTA link"
    },
    ctaBanner: {
      title: "CTA banner",
      untitled: "(no title)",
      variant: "Variant",
      variants: {
        navy: "Navy with accent glows",
        indigo: "Solid indigo card"
      },
      heading: "Headline",
      subtitle: "Subtitle"
    },
    testimonials: {
      title: "Testimonials",
      preview: "{{count}} testimonials",
      variant: "Variant",
      variants: { glass: "Glass cards on light surface", navy: "Navy section" },
      eyebrow: "Eyebrow label",
      heading: "Section heading",
      subtitle: "Section subtitle",
      itemsHeading: "Testimonials",
      addItem: "Add testimonial",
      itemIndex: "Testimonial {{index}}",
      quote: "Quote",
      authorName: "Author name",
      authorTitle: "Author title (e.g. CEO, Acme)",
      avatarUrl: "Avatar URL",
      rating: "Rating (1–5)"
    },
    trustBar: {
      title: "Trust bar (logos)",
      preview: "{{count}} logos",
      label: "Section label",
      labelPlaceholder: "Trusted by industry leaders",
      logosHeading: "Logos",
      addLogo: "Add logo",
      logoIndex: "Logo {{index}}",
      imageUrl: "Logo image URL",
      imageAlt: "Alt text",
      href: "Click target (optional)"
    },
    statsGrid: {
      title: "Stats grid",
      preview: "{{count}} stats",
      eyebrow: "Eyebrow label",
      heading: "Section heading",
      subtitle: "Section subtitle",
      statsHeading: "Stat items",
      addItem: "Add stat",
      itemIndex: "Stat {{index}}",
      value: "Value (e.g. 500+, 30%)",
      itemLabel: "Label (e.g. Clients)"
    },
    featureStack: {
      title: "Feature stack",
      preview: "{{count}} features",
      eyebrow: "Eyebrow label",
      heading: "Section heading",
      subtitle: "Section subtitle",
      alternate: "Alternate image side per row",
      featuresHeading: "Features",
      addFeature: "Add feature",
      itemIndex: "Feature {{index}}",
      icon: "Icon (Material Symbols)",
      eyebrowField: "Row eyebrow",
      featureTitle: "Title",
      featureDescription: "Description",
      ctaLabel: "CTA label",
      ctaHref: "CTA link",
      imageUrl: "Image URL",
      imagePosition: "Image side (override)",
      imagePositions: { auto: "Auto (alternates)", left: "Left", right: "Right" }
    },
    contactInfo: {
      title: "Contact info",
      preview: "{{lines}} info lines",
      heading: "Card heading",
      headingPlaceholder: "Contact information",
      address: "Address",
      phone: "Phone",
      email: "Email",
      multilineHelp: "Use new lines to break onto multiple display lines.",
      socialsLabel: "Socials section label",
      socials: "Social links",
      addSocial: "Add social link",
      socialIcon: "Material Symbol icon",
      socialHref: "Link target"
    },
    contactForm: {
      title: "Contact form",
      preview: "Form ({{mode}})",
      heading: "Form heading",
      subtitle: "Form subtitle",
      mode: "Submit mode",
      modes: {
        endpoint: "Third-party endpoint (Formspree, Web3Forms, …)",
        mailto: "Mailto: link (no JS)"
      },
      modeHelp: "Endpoint mode posts a JSON body to the URL you configure. Mailto opens the visitor's mail client with the form pre-filled.",
      endpointUrl: "Endpoint URL",
      endpointHelp: `Paste the endpoint from your form provider (e.g. Formspree's "forms/abcdefg" URL).`,
      mailtoAddress: "Recipient email address",
      fieldLabels: "Field labels",
      labelName: "Name",
      labelEmail: "Email",
      labelCompany: "Company",
      labelSubject: "Subject",
      labelMessage: "Message",
      subjectOptions: "Subject dropdown options",
      subjectOptionsHelp: "One option per line. Empty = no subject dropdown.",
      submitLabel: "Submit button label",
      privacyHeading: "Consent",
      privacyText: "Consent line",
      privacyHelp: "Wrap any portion of the text with [link]…[/link] to turn it into a hyperlink (target set below).",
      privacyHref: "Privacy page URL",
      feedback: "Submission feedback",
      successMessage: "Success message",
      errorMessage: "Error message"
    }
  }
}, Io = {
  title: "Paramètres du thème",
  settings: Co,
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
    getStarted: "Démarrer",
    readMore: "Lire la suite",
    readArticle: "Lire l'article",
    learnMore: "En savoir plus",
    minRead: "{{minutes}} min de lecture",
    popularArticles: "Articles populaires",
    relatedFromSite: "À lire sur {{site}}",
    shareThisArticle: "Partager cet article",
    backToInsights: "Retour à {{name}}",
    pageOf: "Page {{current}} sur {{total}}",
    previous: "Précédent",
    next: "Suivant",
    articlesPublished: "Articles publiés",
    monthlyReaders: "Lecteurs mensuels"
  },
  blocks: {
    unknownPost: "Article inconnu",
    heroOverlay: {
      title: "Hero — superposition",
      untitled: "(sans titre)",
      imageUrl: "URL de l'image de fond",
      imageUrlHelp: "Collez l'URL d'une image hébergée sur votre site (Médiathèque) ou ailleurs.",
      imageAlt: "Texte alternatif",
      eyebrow: "Étiquette",
      heading: "Titre",
      subtitle: "Accroche / sous-titre",
      primaryCtaLabel: "Libellé CTA principal",
      primaryCtaHref: "Lien CTA principal",
      secondaryCtaLabel: "Libellé CTA secondaire",
      secondaryCtaHref: "Lien CTA secondaire"
    },
    heroSplit: {
      title: "Hero — split",
      untitled: "(sans titre)",
      eyebrow: "Étiquette",
      heading: "Titre",
      subtitle: "Accroche / sous-titre",
      decorImageUrl: "URL de l'image décorative",
      decorImageHelp: "Estompée dans la moitié droite du hero. Optionnelle — laissez vide pour une variante texte uniquement."
    },
    servicesGrid: {
      title: "Grille de services",
      preview: "{{count}} services",
      eyebrow: "Étiquette",
      heading: "Titre de section",
      subtitle: "Sous-titre de section",
      servicesHeading: "Cartes services",
      addService: "Ajouter un service",
      removeService: "Supprimer",
      moveUp: "Monter",
      moveDown: "Descendre",
      serviceIndex: "Service {{index}}",
      icon: "Icône",
      iconHelp: "Utilisez n'importe quel nom de glyphe Material Symbols Outlined — ex. analytics, cloud_sync, security.",
      accent: "Accent (navy foncé)",
      serviceTitle: "Titre",
      serviceDescription: "Description",
      ctaLabel: "Libellé CTA",
      ctaHref: "Lien CTA"
    },
    ctaBanner: {
      title: "Bannière CTA",
      untitled: "(sans titre)",
      variant: "Variante",
      variants: {
        navy: "Navy avec lumières d'accent",
        indigo: "Carte indigo pleine"
      },
      heading: "Titre",
      subtitle: "Sous-titre"
    },
    testimonials: {
      title: "Témoignages",
      preview: "{{count}} témoignages",
      variant: "Variante",
      variants: { glass: "Cartes glass sur fond clair", navy: "Section navy" },
      eyebrow: "Étiquette",
      heading: "Titre de section",
      subtitle: "Sous-titre de section",
      itemsHeading: "Témoignages",
      addItem: "Ajouter un témoignage",
      itemIndex: "Témoignage {{index}}",
      quote: "Citation",
      authorName: "Nom de l'auteur",
      authorTitle: "Titre de l'auteur (ex. CEO, Acme)",
      avatarUrl: "URL de l'avatar",
      rating: "Note (1–5)"
    },
    trustBar: {
      title: "Bandeau de confiance (logos)",
      preview: "{{count}} logos",
      label: "Libellé de section",
      labelPlaceholder: "Ils nous font confiance",
      logosHeading: "Logos",
      addLogo: "Ajouter un logo",
      logoIndex: "Logo {{index}}",
      imageUrl: "URL de l'image du logo",
      imageAlt: "Texte alternatif",
      href: "Lien (optionnel)"
    },
    statsGrid: {
      title: "Grille de stats",
      preview: "{{count}} stats",
      eyebrow: "Étiquette",
      heading: "Titre de section",
      subtitle: "Sous-titre de section",
      statsHeading: "Statistiques",
      addItem: "Ajouter une statistique",
      itemIndex: "Stat {{index}}",
      value: "Valeur (ex. 500+, 30%)",
      itemLabel: "Libellé (ex. Clients)"
    },
    featureStack: {
      title: "Pile de fonctionnalités",
      preview: "{{count}} fonctionnalités",
      eyebrow: "Étiquette",
      heading: "Titre de section",
      subtitle: "Sous-titre de section",
      alternate: "Alterner le côté image à chaque ligne",
      featuresHeading: "Fonctionnalités",
      addFeature: "Ajouter une fonctionnalité",
      itemIndex: "Fonctionnalité {{index}}",
      icon: "Icône (Material Symbols)",
      eyebrowField: "Étiquette de la ligne",
      featureTitle: "Titre",
      featureDescription: "Description",
      ctaLabel: "Libellé CTA",
      ctaHref: "Lien CTA",
      imageUrl: "URL de l'image",
      imagePosition: "Côté image (forcé)",
      imagePositions: { auto: "Auto (alterne)", left: "Gauche", right: "Droite" }
    },
    contactInfo: {
      title: "Coordonnées",
      preview: "{{lines}} lignes d'info",
      heading: "Titre de la carte",
      headingPlaceholder: "Coordonnées",
      address: "Adresse",
      phone: "Téléphone",
      email: "E-mail",
      multilineHelp: "Utilisez des sauts de ligne pour afficher sur plusieurs lignes.",
      socialsLabel: "Libellé section sociale",
      socials: "Liens sociaux",
      addSocial: "Ajouter un lien social",
      socialIcon: "Icône Material Symbol",
      socialHref: "Lien cible"
    },
    contactForm: {
      title: "Formulaire de contact",
      preview: "Formulaire ({{mode}})",
      heading: "Titre du formulaire",
      subtitle: "Sous-titre du formulaire",
      mode: "Mode d'envoi",
      modes: {
        endpoint: "Endpoint tiers (Formspree, Web3Forms, …)",
        mailto: "Lien mailto: (sans JS)"
      },
      modeHelp: "Le mode endpoint envoie un POST JSON à l'URL configurée. Mailto ouvre le client mail du visiteur avec le formulaire pré-rempli.",
      endpointUrl: "URL de l'endpoint",
      endpointHelp: "Collez l'endpoint de votre prestataire (ex. URL « forms/abcdefg » de Formspree).",
      mailtoAddress: "Adresse e-mail destinataire",
      fieldLabels: "Libellés des champs",
      labelName: "Nom",
      labelEmail: "E-mail",
      labelCompany: "Entreprise",
      labelSubject: "Sujet",
      labelMessage: "Message",
      subjectOptions: "Options du menu Sujet",
      subjectOptionsHelp: "Une option par ligne. Vide = pas de menu Sujet.",
      submitLabel: "Libellé du bouton d'envoi",
      privacyHeading: "Consentement",
      privacyText: "Ligne de consentement",
      privacyHelp: "Encadrez une portion du texte avec [link]…[/link] pour en faire un lien hypertexte (URL ci-dessous).",
      privacyHref: "URL de la page Confidentialité",
      feedback: "Retour utilisateur",
      successMessage: "Message de succès",
      errorMessage: "Message d'erreur"
    }
  }
}, Ho = {
  title: "Theme-Einstellungen",
  settings: No,
  publicBaked: {
    home: "Startseite",
    backToHome: "Zurück zur Startseite",
    notFoundTitle: "404",
    notFoundMessage: "Die gesuchte Seite existiert nicht.",
    section: "Bereich",
    author: "Autor",
    noPostsCategory: "Noch keine Beiträge in dieser Kategorie.",
    noPostsAuthor: "Noch keine Beiträge von diesem Autor.",
    follow: "Folgen",
    follow404: "RSS-Feed für {{name}}",
    search: "Suchen",
    menu: "Menü öffnen",
    getStarted: "Loslegen",
    readMore: "Mehr lesen",
    readArticle: "Artikel lesen",
    learnMore: "Mehr erfahren",
    minRead: "{{minutes}} Min. Lesezeit",
    popularArticles: "Beliebte Artikel",
    relatedFromSite: "Neueste auf {{site}}",
    shareThisArticle: "Diesen Artikel teilen",
    backToInsights: "Zurück zu {{name}}",
    pageOf: "Seite {{current}} von {{total}}",
    previous: "Zurück",
    next: "Weiter",
    articlesPublished: "Veröffentlichte Artikel",
    monthlyReaders: "Monatliche Leser"
  },
  blocks: {
    unknownPost: "Unbekannter Beitrag",
    heroOverlay: {
      title: "Hero — Overlay",
      untitled: "(ohne Titel)",
      imageUrl: "URL des Hintergrundbilds",
      imageUrlHelp: "Fügen Sie die URL eines Bildes ein, das auf Ihrer Seite (Medienbibliothek) oder anderswo gehostet wird.",
      imageAlt: "Alternativtext",
      eyebrow: "Eyebrow-Label",
      heading: "Überschrift",
      subtitle: "Untertitel",
      primaryCtaLabel: "Primärer CTA-Text",
      primaryCtaHref: "Primärer CTA-Link",
      secondaryCtaLabel: "Sekundärer CTA-Text",
      secondaryCtaHref: "Sekundärer CTA-Link"
    },
    heroSplit: {
      title: "Hero — Split",
      untitled: "(ohne Titel)",
      eyebrow: "Eyebrow-Label",
      heading: "Überschrift",
      subtitle: "Untertitel",
      decorImageUrl: "URL des Dekorationsbilds",
      decorImageHelp: "In die rechte Hero-Hälfte eingeblendet. Optional — leer lassen für eine reine Textvariante."
    },
    servicesGrid: {
      title: "Service-Raster",
      preview: "{{count}} Leistungen",
      eyebrow: "Eyebrow-Label",
      heading: "Abschnittsüberschrift",
      subtitle: "Abschnittsuntertitel",
      servicesHeading: "Service-Karten",
      addService: "Service hinzufügen",
      removeService: "Entfernen",
      moveUp: "Nach oben",
      moveDown: "Nach unten",
      serviceIndex: "Service {{index}}",
      icon: "Symbol",
      iconHelp: "Verwenden Sie einen beliebigen Material-Symbols-Outlined-Glyphnamen — z. B. analytics, cloud_sync, security.",
      accent: "Akzent (dunkles Navy)",
      serviceTitle: "Titel",
      serviceDescription: "Beschreibung",
      ctaLabel: "CTA-Text",
      ctaHref: "CTA-Link"
    },
    ctaBanner: {
      title: "CTA-Banner",
      untitled: "(ohne Titel)",
      variant: "Variante",
      variants: {
        navy: "Navy mit Akzent-Glows",
        indigo: "Vollflächige Indigo-Karte"
      },
      heading: "Überschrift",
      subtitle: "Untertitel"
    },
    testimonials: {
      title: "Testimonials",
      preview: "{{count}} Testimonials",
      variant: "Variante",
      variants: { glass: "Glas-Karten auf hellem Hintergrund", navy: "Navy-Sektion" },
      eyebrow: "Eyebrow-Label",
      heading: "Abschnittsüberschrift",
      subtitle: "Abschnittsuntertitel",
      itemsHeading: "Testimonials",
      addItem: "Testimonial hinzufügen",
      itemIndex: "Testimonial {{index}}",
      quote: "Zitat",
      authorName: "Name des Autors",
      authorTitle: "Titel des Autors (z. B. CEO, Acme)",
      avatarUrl: "Avatar-URL",
      rating: "Bewertung (1–5)"
    },
    trustBar: {
      title: "Trust-Bar (Logos)",
      preview: "{{count}} Logos",
      label: "Abschnittslabel",
      labelPlaceholder: "Vertrauensvolle Branchenführer",
      logosHeading: "Logos",
      addLogo: "Logo hinzufügen",
      logoIndex: "Logo {{index}}",
      imageUrl: "Logo-URL",
      imageAlt: "Alternativtext",
      href: "Klickziel (optional)"
    },
    statsGrid: {
      title: "Statistik-Raster",
      preview: "{{count}} Statistiken",
      eyebrow: "Eyebrow-Label",
      heading: "Abschnittsüberschrift",
      subtitle: "Abschnittsuntertitel",
      statsHeading: "Statistik-Einträge",
      addItem: "Statistik hinzufügen",
      itemIndex: "Statistik {{index}}",
      value: "Wert (z. B. 500+, 30%)",
      itemLabel: "Label (z. B. Kunden)"
    },
    featureStack: {
      title: "Feature-Stack",
      preview: "{{count}} Features",
      eyebrow: "Eyebrow-Label",
      heading: "Abschnittsüberschrift",
      subtitle: "Abschnittsuntertitel",
      alternate: "Bildseite pro Reihe abwechseln",
      featuresHeading: "Features",
      addFeature: "Feature hinzufügen",
      itemIndex: "Feature {{index}}",
      icon: "Symbol (Material Symbols)",
      eyebrowField: "Reihen-Eyebrow",
      featureTitle: "Titel",
      featureDescription: "Beschreibung",
      ctaLabel: "CTA-Text",
      ctaHref: "CTA-Link",
      imageUrl: "Bild-URL",
      imagePosition: "Bildseite (Override)",
      imagePositions: { auto: "Auto (wechselnd)", left: "Links", right: "Rechts" }
    },
    contactInfo: {
      title: "Kontaktinformationen",
      preview: "{{lines}} Info-Zeilen",
      heading: "Karten-Überschrift",
      headingPlaceholder: "Kontaktinformationen",
      address: "Adresse",
      phone: "Telefon",
      email: "E-Mail",
      multilineHelp: "Verwenden Sie Zeilenumbrüche, um auf mehreren Zeilen anzuzeigen.",
      socialsLabel: "Label für Social-Sektion",
      socials: "Soziale Links",
      addSocial: "Sozialen Link hinzufügen",
      socialIcon: "Material-Symbol-Icon",
      socialHref: "Linkziel"
    },
    contactForm: {
      title: "Kontaktformular",
      preview: "Formular ({{mode}})",
      heading: "Formular-Überschrift",
      subtitle: "Formular-Untertitel",
      mode: "Senden-Modus",
      modes: {
        endpoint: "Drittanbieter-Endpunkt (Formspree, Web3Forms, …)",
        mailto: "Mailto:-Link (ohne JS)"
      },
      modeHelp: "Endpoint-Modus sendet einen JSON-Body an die konfigurierte URL. Mailto öffnet den E-Mail-Client des Besuchers mit vorausgefülltem Formular.",
      endpointUrl: "Endpoint-URL",
      endpointHelp: `Fügen Sie den Endpoint Ihres Form-Providers ein (z. B. Formspree's „forms/abcdefg"-URL).`,
      mailtoAddress: "Empfänger-E-Mail-Adresse",
      fieldLabels: "Feldbeschriftungen",
      labelName: "Name",
      labelEmail: "E-Mail",
      labelCompany: "Firma",
      labelSubject: "Betreff",
      labelMessage: "Nachricht",
      subjectOptions: "Betreff-Dropdown-Optionen",
      subjectOptionsHelp: "Eine Option pro Zeile. Leer = kein Betreff-Dropdown.",
      submitLabel: "Senden-Button-Text",
      privacyHeading: "Einwilligung",
      privacyText: "Einwilligungstext",
      privacyHelp: "Umschließen Sie einen Textteil mit [link]…[/link], um daraus einen Hyperlink zu machen (URL unten).",
      privacyHref: "URL der Datenschutzseite",
      feedback: "Einreich-Feedback",
      successMessage: "Erfolgsnachricht",
      errorMessage: "Fehlermeldung"
    }
  }
}, Ro = {
  title: "Configuración del tema",
  settings: Ao,
  publicBaked: {
    home: "Inicio",
    backToHome: "Volver al inicio",
    notFoundTitle: "404",
    notFoundMessage: "La página que buscas no existe.",
    section: "Sección",
    author: "Autor",
    noPostsCategory: "Aún no hay artículos en esta categoría.",
    noPostsAuthor: "Aún no hay artículos de este autor.",
    follow: "Seguir",
    follow404: "Feed RSS para {{name}}",
    search: "Buscar",
    menu: "Abrir menú",
    getStarted: "Comenzar",
    readMore: "Leer más",
    readArticle: "Leer artículo",
    learnMore: "Saber más",
    minRead: "{{minutes}} min de lectura",
    popularArticles: "Artículos populares",
    relatedFromSite: "Lo último de {{site}}",
    shareThisArticle: "Compartir este artículo",
    backToInsights: "Volver a {{name}}",
    pageOf: "Página {{current}} de {{total}}",
    previous: "Anterior",
    next: "Siguiente",
    articlesPublished: "Artículos publicados",
    monthlyReaders: "Lectores mensuales"
  },
  blocks: {
    unknownPost: "Artículo desconocido",
    heroOverlay: {
      title: "Hero — superposición",
      untitled: "(sin título)",
      imageUrl: "URL de la imagen de fondo",
      imageUrlHelp: "Pega la URL de una imagen alojada en tu sitio (Biblioteca de medios) o en otro lugar.",
      imageAlt: "Texto alternativo",
      eyebrow: "Etiqueta",
      heading: "Titular",
      subtitle: "Subtítulo / lede",
      primaryCtaLabel: "Texto del CTA principal",
      primaryCtaHref: "Enlace del CTA principal",
      secondaryCtaLabel: "Texto del CTA secundario",
      secondaryCtaHref: "Enlace del CTA secundario"
    },
    heroSplit: {
      title: "Hero — split",
      untitled: "(sin título)",
      eyebrow: "Etiqueta",
      heading: "Titular",
      subtitle: "Subtítulo / lede",
      decorImageUrl: "URL de la imagen decorativa",
      decorImageHelp: "Difuminada en la mitad derecha del hero. Opcional — déjalo vacío para una variante solo de texto."
    },
    servicesGrid: {
      title: "Cuadrícula de servicios",
      preview: "{{count}} servicios",
      eyebrow: "Etiqueta",
      heading: "Título de sección",
      subtitle: "Subtítulo de sección",
      servicesHeading: "Tarjetas de servicio",
      addService: "Añadir servicio",
      removeService: "Eliminar",
      moveUp: "Mover arriba",
      moveDown: "Mover abajo",
      serviceIndex: "Servicio {{index}}",
      icon: "Icono",
      iconHelp: "Usa cualquier nombre de glifo Material Symbols Outlined — p. ej. analytics, cloud_sync, security.",
      accent: "Acento (navy oscuro)",
      serviceTitle: "Título",
      serviceDescription: "Descripción",
      ctaLabel: "Texto del CTA",
      ctaHref: "Enlace del CTA"
    },
    ctaBanner: {
      title: "Banner CTA",
      untitled: "(sin título)",
      variant: "Variante",
      variants: {
        navy: "Navy con destellos de acento",
        indigo: "Tarjeta indigo sólida"
      },
      heading: "Titular",
      subtitle: "Subtítulo"
    },
    testimonials: {
      title: "Testimonios",
      preview: "{{count}} testimonios",
      variant: "Variante",
      variants: { glass: "Tarjetas glass sobre fondo claro", navy: "Sección navy" },
      eyebrow: "Etiqueta",
      heading: "Título de sección",
      subtitle: "Subtítulo de sección",
      itemsHeading: "Testimonios",
      addItem: "Añadir testimonio",
      itemIndex: "Testimonio {{index}}",
      quote: "Cita",
      authorName: "Nombre del autor",
      authorTitle: "Cargo del autor (p. ej. CEO, Acme)",
      avatarUrl: "URL del avatar",
      rating: "Calificación (1–5)"
    },
    trustBar: {
      title: "Barra de confianza (logos)",
      preview: "{{count}} logos",
      label: "Etiqueta de sección",
      labelPlaceholder: "Confían en nosotros",
      logosHeading: "Logos",
      addLogo: "Añadir logo",
      logoIndex: "Logo {{index}}",
      imageUrl: "URL del logo",
      imageAlt: "Texto alternativo",
      href: "Enlace (opcional)"
    },
    statsGrid: {
      title: "Cuadrícula de estadísticas",
      preview: "{{count}} estadísticas",
      eyebrow: "Etiqueta",
      heading: "Título de sección",
      subtitle: "Subtítulo de sección",
      statsHeading: "Estadísticas",
      addItem: "Añadir estadística",
      itemIndex: "Estadística {{index}}",
      value: "Valor (p. ej. 500+, 30%)",
      itemLabel: "Etiqueta (p. ej. Clientes)"
    },
    featureStack: {
      title: "Pila de características",
      preview: "{{count}} características",
      eyebrow: "Etiqueta",
      heading: "Título de sección",
      subtitle: "Subtítulo de sección",
      alternate: "Alternar lado de imagen por fila",
      featuresHeading: "Características",
      addFeature: "Añadir característica",
      itemIndex: "Característica {{index}}",
      icon: "Icono (Material Symbols)",
      eyebrowField: "Etiqueta de la fila",
      featureTitle: "Título",
      featureDescription: "Descripción",
      ctaLabel: "Texto del CTA",
      ctaHref: "Enlace del CTA",
      imageUrl: "URL de la imagen",
      imagePosition: "Lado de imagen (forzar)",
      imagePositions: { auto: "Auto (alterna)", left: "Izquierda", right: "Derecha" }
    },
    contactInfo: {
      title: "Información de contacto",
      preview: "{{lines}} líneas de info",
      heading: "Título de la tarjeta",
      headingPlaceholder: "Información de contacto",
      address: "Dirección",
      phone: "Teléfono",
      email: "Email",
      multilineHelp: "Usa saltos de línea para mostrar en varias líneas.",
      socialsLabel: "Etiqueta de la sección social",
      socials: "Enlaces sociales",
      addSocial: "Añadir enlace social",
      socialIcon: "Icono Material Symbol",
      socialHref: "Enlace destino"
    },
    contactForm: {
      title: "Formulario de contacto",
      preview: "Formulario ({{mode}})",
      heading: "Título del formulario",
      subtitle: "Subtítulo del formulario",
      mode: "Modo de envío",
      modes: {
        endpoint: "Endpoint de terceros (Formspree, Web3Forms, …)",
        mailto: "Enlace mailto: (sin JS)"
      },
      modeHelp: "El modo endpoint envía un POST JSON a la URL configurada. Mailto abre el cliente de correo del visitante con el formulario rellenado.",
      endpointUrl: "URL del endpoint",
      endpointHelp: "Pega el endpoint de tu proveedor (p. ej. URL «forms/abcdefg» de Formspree).",
      mailtoAddress: "Dirección de email destinataria",
      fieldLabels: "Etiquetas de campos",
      labelName: "Nombre",
      labelEmail: "Email",
      labelCompany: "Empresa",
      labelSubject: "Asunto",
      labelMessage: "Mensaje",
      subjectOptions: "Opciones del menú Asunto",
      subjectOptionsHelp: "Una opción por línea. Vacío = sin menú Asunto.",
      submitLabel: "Texto del botón de envío",
      privacyHeading: "Consentimiento",
      privacyText: "Línea de consentimiento",
      privacyHelp: "Envuelve una parte del texto con [link]…[/link] para convertirla en un enlace (URL abajo).",
      privacyHref: "URL de la página de privacidad",
      feedback: "Feedback del envío",
      successMessage: "Mensaje de éxito",
      errorMessage: "Mensaje de error"
    }
  }
}, Po = {
  title: "Thema-instellingen",
  settings: To,
  publicBaked: {
    home: "Home",
    backToHome: "Terug naar home",
    notFoundTitle: "404",
    notFoundMessage: "De pagina die je zoekt bestaat niet.",
    section: "Sectie",
    author: "Auteur",
    noPostsCategory: "Nog geen artikelen in deze categorie.",
    noPostsAuthor: "Nog geen artikelen van deze auteur.",
    follow: "Volgen",
    follow404: "RSS-feed voor {{name}}",
    search: "Zoeken",
    menu: "Menu openen",
    getStarted: "Aan de slag",
    readMore: "Lees meer",
    readArticle: "Artikel lezen",
    learnMore: "Meer info",
    minRead: "{{minutes}} min leestijd",
    popularArticles: "Populaire artikelen",
    relatedFromSite: "Nieuwste van {{site}}",
    shareThisArticle: "Deel dit artikel",
    backToInsights: "Terug naar {{name}}",
    pageOf: "Pagina {{current}} van {{total}}",
    previous: "Vorige",
    next: "Volgende",
    articlesPublished: "Gepubliceerde artikelen",
    monthlyReaders: "Maandelijkse lezers"
  },
  blocks: {
    unknownPost: "Onbekende post",
    heroOverlay: {
      title: "Hero — overlay",
      untitled: "(geen titel)",
      imageUrl: "URL achtergrondafbeelding",
      imageUrlHelp: "Plak de URL van een afbeelding die op je site (Mediabibliotheek) of elders gehost wordt.",
      imageAlt: "Alt-tekst",
      eyebrow: "Eyebrow-label",
      heading: "Kop",
      subtitle: "Subtitel / lede",
      primaryCtaLabel: "Primaire CTA-tekst",
      primaryCtaHref: "Primaire CTA-link",
      secondaryCtaLabel: "Secundaire CTA-tekst",
      secondaryCtaHref: "Secundaire CTA-link"
    },
    heroSplit: {
      title: "Hero — split",
      untitled: "(geen titel)",
      eyebrow: "Eyebrow-label",
      heading: "Kop",
      subtitle: "Subtitel / lede",
      decorImageUrl: "URL decoratieve afbeelding",
      decorImageHelp: "Verzacht in de rechterhelft van de hero. Optioneel — leeg laten voor alleen-tekst variant."
    },
    servicesGrid: {
      title: "Diensten-raster",
      preview: "{{count}} diensten",
      eyebrow: "Eyebrow-label",
      heading: "Sectiekop",
      subtitle: "Sectie-ondertitel",
      servicesHeading: "Dienstkaarten",
      addService: "Dienst toevoegen",
      removeService: "Verwijderen",
      moveUp: "Omhoog",
      moveDown: "Omlaag",
      serviceIndex: "Dienst {{index}}",
      icon: "Icoon",
      iconHelp: "Gebruik elke Material Symbols Outlined glyph-naam — bv. analytics, cloud_sync, security.",
      accent: "Accent (donker navy)",
      serviceTitle: "Titel",
      serviceDescription: "Beschrijving",
      ctaLabel: "CTA-tekst",
      ctaHref: "CTA-link"
    },
    ctaBanner: {
      title: "CTA-banner",
      untitled: "(geen titel)",
      variant: "Variant",
      variants: {
        navy: "Navy met accent-glows",
        indigo: "Effen indigo kaart"
      },
      heading: "Kop",
      subtitle: "Subtitel"
    },
    testimonials: {
      title: "Testimonials",
      preview: "{{count}} testimonials",
      variant: "Variant",
      variants: { glass: "Glaskaarten op lichte achtergrond", navy: "Navy-sectie" },
      eyebrow: "Eyebrow-label",
      heading: "Sectiekop",
      subtitle: "Sectie-ondertitel",
      itemsHeading: "Testimonials",
      addItem: "Testimonial toevoegen",
      itemIndex: "Testimonial {{index}}",
      quote: "Citaat",
      authorName: "Naam van auteur",
      authorTitle: "Titel van auteur (bv. CEO, Acme)",
      avatarUrl: "Avatar-URL",
      rating: "Beoordeling (1–5)"
    },
    trustBar: {
      title: "Trust-bar (logo's)",
      preview: "{{count}} logo's",
      label: "Sectielabel",
      labelPlaceholder: "Vertrouwd door industrieleiders",
      logosHeading: "Logo's",
      addLogo: "Logo toevoegen",
      logoIndex: "Logo {{index}}",
      imageUrl: "Logo-URL",
      imageAlt: "Alt-tekst",
      href: "Klikdoel (optioneel)"
    },
    statsGrid: {
      title: "Statistieken-raster",
      preview: "{{count}} statistieken",
      eyebrow: "Eyebrow-label",
      heading: "Sectiekop",
      subtitle: "Sectie-ondertitel",
      statsHeading: "Statistieken",
      addItem: "Statistiek toevoegen",
      itemIndex: "Statistiek {{index}}",
      value: "Waarde (bv. 500+, 30%)",
      itemLabel: "Label (bv. Klanten)"
    },
    featureStack: {
      title: "Feature-stack",
      preview: "{{count}} features",
      eyebrow: "Eyebrow-label",
      heading: "Sectiekop",
      subtitle: "Sectie-ondertitel",
      alternate: "Beeldzijde per rij afwisselen",
      featuresHeading: "Features",
      addFeature: "Feature toevoegen",
      itemIndex: "Feature {{index}}",
      icon: "Icoon (Material Symbols)",
      eyebrowField: "Rij-eyebrow",
      featureTitle: "Titel",
      featureDescription: "Beschrijving",
      ctaLabel: "CTA-tekst",
      ctaHref: "CTA-link",
      imageUrl: "Afbeeldings-URL",
      imagePosition: "Beeldzijde (forceer)",
      imagePositions: { auto: "Auto (wisselt af)", left: "Links", right: "Rechts" }
    },
    contactInfo: {
      title: "Contactgegevens",
      preview: "{{lines}} info-regels",
      heading: "Kaarttitel",
      headingPlaceholder: "Contactgegevens",
      address: "Adres",
      phone: "Telefoon",
      email: "E-mail",
      multilineHelp: "Gebruik regeleinden om over meerdere regels weer te geven.",
      socialsLabel: "Label sociale sectie",
      socials: "Sociale links",
      addSocial: "Sociale link toevoegen",
      socialIcon: "Material Symbol-icoon",
      socialHref: "Linkdoel"
    },
    contactForm: {
      title: "Contactformulier",
      preview: "Formulier ({{mode}})",
      heading: "Formuliertitel",
      subtitle: "Formulier-ondertitel",
      mode: "Verzendmodus",
      modes: {
        endpoint: "Endpoint van derden (Formspree, Web3Forms, …)",
        mailto: "Mailto:-link (zonder JS)"
      },
      modeHelp: "Endpoint-modus verzendt een JSON-body naar de geconfigureerde URL. Mailto opent de e-mailclient van de bezoeker met het formulier vooringevuld.",
      endpointUrl: "Endpoint-URL",
      endpointHelp: `Plak de endpoint van je formulierprovider (bv. Formspree's "forms/abcdefg"-URL).`,
      mailtoAddress: "E-mailadres van ontvanger",
      fieldLabels: "Veldlabels",
      labelName: "Naam",
      labelEmail: "E-mail",
      labelCompany: "Bedrijf",
      labelSubject: "Onderwerp",
      labelMessage: "Bericht",
      subjectOptions: "Onderwerp-dropdown opties",
      subjectOptionsHelp: "Eén optie per regel. Leeg = geen onderwerp-dropdown.",
      submitLabel: "Tekst van verzendknop",
      privacyHeading: "Toestemming",
      privacyText: "Toestemmingsregel",
      privacyHelp: "Wikkel een deel van de tekst met [link]…[/link] om er een hyperlink van te maken (URL hieronder).",
      privacyHref: "URL van privacypagina",
      feedback: "Verzend-feedback",
      successMessage: "Succesbericht",
      errorMessage: "Foutbericht"
    }
  }
}, Oo = {
  title: "Configurações do tema",
  settings: Eo,
  publicBaked: {
    home: "Início",
    backToHome: "Voltar ao início",
    notFoundTitle: "404",
    notFoundMessage: "A página que você procura não existe.",
    section: "Seção",
    author: "Autor",
    noPostsCategory: "Ainda não há artigos nesta categoria.",
    noPostsAuthor: "Ainda não há artigos deste autor.",
    follow: "Seguir",
    follow404: "Feed RSS para {{name}}",
    search: "Pesquisar",
    menu: "Abrir menu",
    getStarted: "Começar",
    readMore: "Leia mais",
    readArticle: "Ler artigo",
    learnMore: "Saiba mais",
    minRead: "{{minutes}} min de leitura",
    popularArticles: "Artigos populares",
    relatedFromSite: "Mais recentes em {{site}}",
    shareThisArticle: "Compartilhar este artigo",
    backToInsights: "Voltar para {{name}}",
    pageOf: "Página {{current}} de {{total}}",
    previous: "Anterior",
    next: "Próximo",
    articlesPublished: "Artigos publicados",
    monthlyReaders: "Leitores mensais"
  },
  blocks: {
    unknownPost: "Artigo desconhecido",
    heroOverlay: {
      title: "Hero — sobreposição",
      untitled: "(sem título)",
      imageUrl: "URL da imagem de fundo",
      imageUrlHelp: "Cole a URL de uma imagem hospedada no seu site (Biblioteca de mídia) ou em outro lugar.",
      imageAlt: "Texto alternativo",
      eyebrow: "Etiqueta",
      heading: "Manchete",
      subtitle: "Lede / subtítulo",
      primaryCtaLabel: "Texto do CTA principal",
      primaryCtaHref: "Link do CTA principal",
      secondaryCtaLabel: "Texto do CTA secundário",
      secondaryCtaHref: "Link do CTA secundário"
    },
    heroSplit: {
      title: "Hero — split",
      untitled: "(sem título)",
      eyebrow: "Etiqueta",
      heading: "Manchete",
      subtitle: "Lede / subtítulo",
      decorImageUrl: "URL da imagem decorativa",
      decorImageHelp: "Esmaecida na metade direita do hero. Opcional — deixe vazio para uma variante apenas de texto."
    },
    servicesGrid: {
      title: "Grade de serviços",
      preview: "{{count}} serviços",
      eyebrow: "Etiqueta",
      heading: "Título da seção",
      subtitle: "Subtítulo da seção",
      servicesHeading: "Cartões de serviço",
      addService: "Adicionar serviço",
      removeService: "Remover",
      moveUp: "Mover para cima",
      moveDown: "Mover para baixo",
      serviceIndex: "Serviço {{index}}",
      icon: "Ícone",
      iconHelp: "Use qualquer nome de glifo Material Symbols Outlined — ex. analytics, cloud_sync, security.",
      accent: "Acento (navy escuro)",
      serviceTitle: "Título",
      serviceDescription: "Descrição",
      ctaLabel: "Texto do CTA",
      ctaHref: "Link do CTA"
    },
    ctaBanner: {
      title: "Banner CTA",
      untitled: "(sem título)",
      variant: "Variante",
      variants: {
        navy: "Navy com brilhos de acento",
        indigo: "Cartão indigo sólido"
      },
      heading: "Manchete",
      subtitle: "Subtítulo"
    },
    testimonials: {
      title: "Depoimentos",
      preview: "{{count}} depoimentos",
      variant: "Variante",
      variants: { glass: "Cartões glass sobre fundo claro", navy: "Seção navy" },
      eyebrow: "Etiqueta",
      heading: "Título da seção",
      subtitle: "Subtítulo da seção",
      itemsHeading: "Depoimentos",
      addItem: "Adicionar depoimento",
      itemIndex: "Depoimento {{index}}",
      quote: "Citação",
      authorName: "Nome do autor",
      authorTitle: "Cargo do autor (ex. CEO, Acme)",
      avatarUrl: "URL do avatar",
      rating: "Classificação (1–5)"
    },
    trustBar: {
      title: "Barra de confiança (logos)",
      preview: "{{count}} logos",
      label: "Etiqueta da seção",
      labelPlaceholder: "Confiado por líderes do setor",
      logosHeading: "Logos",
      addLogo: "Adicionar logo",
      logoIndex: "Logo {{index}}",
      imageUrl: "URL do logo",
      imageAlt: "Texto alternativo",
      href: "Link (opcional)"
    },
    statsGrid: {
      title: "Grade de estatísticas",
      preview: "{{count}} estatísticas",
      eyebrow: "Etiqueta",
      heading: "Título da seção",
      subtitle: "Subtítulo da seção",
      statsHeading: "Estatísticas",
      addItem: "Adicionar estatística",
      itemIndex: "Estatística {{index}}",
      value: "Valor (ex. 500+, 30%)",
      itemLabel: "Etiqueta (ex. Clientes)"
    },
    featureStack: {
      title: "Pilha de recursos",
      preview: "{{count}} recursos",
      eyebrow: "Etiqueta",
      heading: "Título da seção",
      subtitle: "Subtítulo da seção",
      alternate: "Alternar lado da imagem por linha",
      featuresHeading: "Recursos",
      addFeature: "Adicionar recurso",
      itemIndex: "Recurso {{index}}",
      icon: "Ícone (Material Symbols)",
      eyebrowField: "Etiqueta da linha",
      featureTitle: "Título",
      featureDescription: "Descrição",
      ctaLabel: "Texto do CTA",
      ctaHref: "Link do CTA",
      imageUrl: "URL da imagem",
      imagePosition: "Lado da imagem (forçar)",
      imagePositions: { auto: "Auto (alterna)", left: "Esquerda", right: "Direita" }
    },
    contactInfo: {
      title: "Informações de contato",
      preview: "{{lines}} linhas de info",
      heading: "Título do cartão",
      headingPlaceholder: "Informações de contato",
      address: "Endereço",
      phone: "Telefone",
      email: "E-mail",
      multilineHelp: "Use quebras de linha para exibir em várias linhas.",
      socialsLabel: "Etiqueta da seção social",
      socials: "Links sociais",
      addSocial: "Adicionar link social",
      socialIcon: "Ícone Material Symbol",
      socialHref: "Link de destino"
    },
    contactForm: {
      title: "Formulário de contato",
      preview: "Formulário ({{mode}})",
      heading: "Título do formulário",
      subtitle: "Subtítulo do formulário",
      mode: "Modo de envio",
      modes: {
        endpoint: "Endpoint de terceiros (Formspree, Web3Forms, …)",
        mailto: "Link mailto: (sem JS)"
      },
      modeHelp: "O modo endpoint envia um POST JSON para a URL configurada. Mailto abre o cliente de e-mail do visitante com o formulário pré-preenchido.",
      endpointUrl: "URL do endpoint",
      endpointHelp: "Cole o endpoint do seu provedor (ex. URL «forms/abcdefg» do Formspree).",
      mailtoAddress: "Endereço de e-mail destinatário",
      fieldLabels: "Etiquetas dos campos",
      labelName: "Nome",
      labelEmail: "E-mail",
      labelCompany: "Empresa",
      labelSubject: "Assunto",
      labelMessage: "Mensagem",
      subjectOptions: "Opções do menu Assunto",
      subjectOptionsHelp: "Uma opção por linha. Vazio = sem menu Assunto.",
      submitLabel: "Texto do botão de envio",
      privacyHeading: "Consentimento",
      privacyText: "Linha de consentimento",
      privacyHelp: "Envolva uma parte do texto com [link]…[/link] para transformá-la em um hyperlink (URL abaixo).",
      privacyHref: "URL da página de privacidade",
      feedback: "Feedback do envio",
      successMessage: "Mensagem de sucesso",
      errorMessage: "Mensagem de erro"
    }
  }
}, Bo = {
  title: "테마 설정",
  settings: Lo,
  publicBaked: {
    home: "홈",
    backToHome: "홈으로 돌아가기",
    notFoundTitle: "404",
    notFoundMessage: "찾으시는 페이지가 존재하지 않습니다.",
    section: "섹션",
    author: "작성자",
    noPostsCategory: "이 카테고리에 아직 게시물이 없습니다.",
    noPostsAuthor: "이 작성자의 게시물이 아직 없습니다.",
    follow: "팔로우",
    follow404: "{{name}}의 RSS 피드",
    search: "검색",
    menu: "메뉴 열기",
    getStarted: "시작하기",
    readMore: "더 읽기",
    readArticle: "기사 읽기",
    learnMore: "자세히 알아보기",
    minRead: "{{minutes}}분 읽기",
    popularArticles: "인기 기사",
    relatedFromSite: "{{site}}의 최신 글",
    shareThisArticle: "이 글 공유하기",
    backToInsights: "{{name}}(으)로 돌아가기",
    pageOf: "{{total}} 중 {{current}} 페이지",
    previous: "이전",
    next: "다음",
    articlesPublished: "게시된 기사",
    monthlyReaders: "월간 독자"
  },
  blocks: {
    unknownPost: "알 수 없는 게시물",
    heroOverlay: {
      title: "히어로 — 오버레이",
      untitled: "(제목 없음)",
      imageUrl: "배경 이미지 URL",
      imageUrlHelp: "사이트 (미디어 라이브러리) 또는 다른 곳에 호스팅된 이미지의 URL을 붙여넣으세요.",
      imageAlt: "대체 텍스트",
      eyebrow: "아이브로 라벨",
      heading: "헤드라인",
      subtitle: "서브타이틀",
      primaryCtaLabel: "기본 CTA 텍스트",
      primaryCtaHref: "기본 CTA 링크",
      secondaryCtaLabel: "보조 CTA 텍스트",
      secondaryCtaHref: "보조 CTA 링크"
    },
    heroSplit: {
      title: "히어로 — 분할",
      untitled: "(제목 없음)",
      eyebrow: "아이브로 라벨",
      heading: "헤드라인",
      subtitle: "서브타이틀",
      decorImageUrl: "장식 이미지 URL",
      decorImageHelp: "히어로의 오른쪽 절반에 페이드인. 선택사항 — 텍스트 전용 변형은 비워두세요."
    },
    servicesGrid: {
      title: "서비스 그리드",
      preview: "서비스 {{count}}개",
      eyebrow: "아이브로 라벨",
      heading: "섹션 제목",
      subtitle: "섹션 부제",
      servicesHeading: "서비스 카드",
      addService: "서비스 추가",
      removeService: "제거",
      moveUp: "위로",
      moveDown: "아래로",
      serviceIndex: "서비스 {{index}}",
      icon: "아이콘",
      iconHelp: "Material Symbols Outlined 글리프 이름을 사용하세요 — 예: analytics, cloud_sync, security.",
      accent: "강조 (어두운 네이비)",
      serviceTitle: "제목",
      serviceDescription: "설명",
      ctaLabel: "CTA 텍스트",
      ctaHref: "CTA 링크"
    },
    ctaBanner: {
      title: "CTA 배너",
      untitled: "(제목 없음)",
      variant: "변형",
      variants: {
        navy: "강조 글로우가 있는 네이비",
        indigo: "단색 인디고 카드"
      },
      heading: "헤드라인",
      subtitle: "서브타이틀"
    },
    testimonials: {
      title: "추천사",
      preview: "추천사 {{count}}개",
      variant: "변형",
      variants: { glass: "밝은 배경 위 글래스 카드", navy: "네이비 섹션" },
      eyebrow: "아이브로 라벨",
      heading: "섹션 제목",
      subtitle: "섹션 부제",
      itemsHeading: "추천사",
      addItem: "추천사 추가",
      itemIndex: "추천사 {{index}}",
      quote: "인용문",
      authorName: "작성자 이름",
      authorTitle: "작성자 직함 (예: CEO, Acme)",
      avatarUrl: "아바타 URL",
      rating: "평점 (1–5)"
    },
    trustBar: {
      title: "신뢰 바 (로고)",
      preview: "로고 {{count}}개",
      label: "섹션 라벨",
      labelPlaceholder: "업계 리더들이 신뢰함",
      logosHeading: "로고",
      addLogo: "로고 추가",
      logoIndex: "로고 {{index}}",
      imageUrl: "로고 이미지 URL",
      imageAlt: "대체 텍스트",
      href: "클릭 대상 (선택사항)"
    },
    statsGrid: {
      title: "통계 그리드",
      preview: "통계 {{count}}개",
      eyebrow: "아이브로 라벨",
      heading: "섹션 제목",
      subtitle: "섹션 부제",
      statsHeading: "통계 항목",
      addItem: "통계 추가",
      itemIndex: "통계 {{index}}",
      value: "값 (예: 500+, 30%)",
      itemLabel: "라벨 (예: 고객)"
    },
    featureStack: {
      title: "기능 스택",
      preview: "기능 {{count}}개",
      eyebrow: "아이브로 라벨",
      heading: "섹션 제목",
      subtitle: "섹션 부제",
      alternate: "행마다 이미지 측면 교차",
      featuresHeading: "기능",
      addFeature: "기능 추가",
      itemIndex: "기능 {{index}}",
      icon: "아이콘 (Material Symbols)",
      eyebrowField: "행 아이브로",
      featureTitle: "제목",
      featureDescription: "설명",
      ctaLabel: "CTA 텍스트",
      ctaHref: "CTA 링크",
      imageUrl: "이미지 URL",
      imagePosition: "이미지 측면 (강제)",
      imagePositions: { auto: "자동 (교차)", left: "왼쪽", right: "오른쪽" }
    },
    contactInfo: {
      title: "연락처 정보",
      preview: "정보 줄 {{lines}}개",
      heading: "카드 제목",
      headingPlaceholder: "연락처 정보",
      address: "주소",
      phone: "전화",
      email: "이메일",
      multilineHelp: "여러 줄로 표시하려면 줄바꿈을 사용하세요.",
      socialsLabel: "소셜 섹션 라벨",
      socials: "소셜 링크",
      addSocial: "소셜 링크 추가",
      socialIcon: "Material Symbol 아이콘",
      socialHref: "링크 대상"
    },
    contactForm: {
      title: "연락 양식",
      preview: "양식 ({{mode}})",
      heading: "양식 제목",
      subtitle: "양식 부제",
      mode: "전송 모드",
      modes: {
        endpoint: "타사 엔드포인트 (Formspree, Web3Forms, …)",
        mailto: "Mailto: 링크 (JS 없음)"
      },
      modeHelp: "엔드포인트 모드는 구성된 URL로 JSON 본문을 POST합니다. Mailto는 양식이 미리 채워진 상태로 방문자의 메일 클라이언트를 엽니다.",
      endpointUrl: "엔드포인트 URL",
      endpointHelp: '양식 제공업체의 엔드포인트를 붙여넣으세요 (예: Formspree의 "forms/abcdefg" URL).',
      mailtoAddress: "수신자 이메일 주소",
      fieldLabels: "필드 라벨",
      labelName: "이름",
      labelEmail: "이메일",
      labelCompany: "회사",
      labelSubject: "제목",
      labelMessage: "메시지",
      subjectOptions: "제목 드롭다운 옵션",
      subjectOptionsHelp: "한 줄에 하나의 옵션. 비어있음 = 제목 드롭다운 없음.",
      submitLabel: "전송 버튼 텍스트",
      privacyHeading: "동의",
      privacyText: "동의 텍스트",
      privacyHelp: "텍스트 일부를 [link]…[/link]로 감싸면 하이퍼링크가 됩니다 (URL은 아래에 설정).",
      privacyHref: "개인정보 처리방침 페이지 URL",
      feedback: "제출 피드백",
      successMessage: "성공 메시지",
      errorMessage: "오류 메시지"
    }
  }
};
/**
 * @license lucide-react v0.460.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const zo = (r) => r.replace(/([a-z0-9])([A-Z])/g, "$1-$2").toLowerCase(), ga = (...r) => r.filter((e, t, a) => !!e && e.trim() !== "" && a.indexOf(e) === t).join(" ").trim();
/**
 * @license lucide-react v0.460.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
var $o = {
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
const Uo = ar(
  ({
    color: r = "currentColor",
    size: e = 24,
    strokeWidth: t = 2,
    absoluteStrokeWidth: a,
    className: n = "",
    children: o,
    iconNode: i,
    ...s
  }, c) => St(
    "svg",
    {
      ref: c,
      ...$o,
      width: e,
      height: e,
      stroke: r,
      strokeWidth: a ? Number(t) * 24 / Number(e) : t,
      className: ga("lucide", n),
      ...s
    },
    [
      ...i.map(([u, d]) => St(u, d)),
      ...Array.isArray(o) ? o : [o]
    ]
  )
);
/**
 * @license lucide-react v0.460.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const U = (r, e) => {
  const t = ar(
    ({ className: a, ...n }, o) => St(Uo, {
      ref: o,
      iconNode: e,
      className: ga(`lucide-${zo(r)}`, a),
      ...n
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
const Pe = U("ArrowDown", [
  ["path", { d: "M12 5v14", key: "s699le" }],
  ["path", { d: "m19 12-7 7-7-7", key: "1idqje" }]
]);
/**
 * @license lucide-react v0.460.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const Oe = U("ArrowUp", [
  ["path", { d: "m5 12 7-7 7 7", key: "hav0vg" }],
  ["path", { d: "M12 19V5", key: "x0mq9r" }]
]);
/**
 * @license lucide-react v0.460.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const ba = U("ChartColumn", [
  ["path", { d: "M3 3v16a2 2 0 0 0 2 2h16", key: "c24i48" }],
  ["path", { d: "M18 17V9", key: "2bz60n" }],
  ["path", { d: "M13 17V5", key: "1frdt8" }],
  ["path", { d: "M8 17v-3", key: "17ska0" }]
]);
/**
 * @license lucide-react v0.460.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const ya = U("Grid3x3", [
  ["rect", { width: "18", height: "18", x: "3", y: "3", rx: "2", key: "afitv7" }],
  ["path", { d: "M3 9h18", key: "1pudct" }],
  ["path", { d: "M3 15h18", key: "5xshup" }],
  ["path", { d: "M9 3v18", key: "fh3hqa" }],
  ["path", { d: "M15 3v18", key: "14nvp0" }]
]);
/**
 * @license lucide-react v0.460.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const nt = U("Image", [
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
const va = U("Layers", [
  [
    "path",
    {
      d: "m12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83Z",
      key: "8b97xw"
    }
  ],
  ["path", { d: "m22 17.65-9.17 4.16a2 2 0 0 1-1.66 0L2 17.65", key: "dd6zsq" }],
  ["path", { d: "m22 12.65-9.17 4.16a2 2 0 0 1-1.66 0L2 12.65", key: "ep9fru" }]
]);
/**
 * @license lucide-react v0.460.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const wa = U("LayoutPanelLeft", [
  ["rect", { width: "7", height: "18", x: "3", y: "3", rx: "1", key: "2obqm" }],
  ["rect", { width: "7", height: "7", x: "14", y: "3", rx: "1", key: "6d4xhi" }],
  ["rect", { width: "7", height: "7", x: "14", y: "14", rx: "1", key: "nxv5o0" }]
]);
/**
 * @license lucide-react v0.460.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const Me = U("LoaderCircle", [
  ["path", { d: "M21 12a9 9 0 1 1-6.219-8.56", key: "13zald" }]
]);
/**
 * @license lucide-react v0.460.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const xa = U("Mail", [
  ["rect", { width: "20", height: "16", x: "2", y: "4", rx: "2", key: "18n3k1" }],
  ["path", { d: "m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7", key: "1ocrg3" }]
]);
/**
 * @license lucide-react v0.460.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const ka = U("MapPin", [
  [
    "path",
    {
      d: "M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0",
      key: "1r0f0z"
    }
  ],
  ["circle", { cx: "12", cy: "10", r: "3", key: "ilqhr7" }]
]);
/**
 * @license lucide-react v0.460.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const Sa = U("Megaphone", [
  ["path", { d: "m3 11 18-5v12L3 14v-3z", key: "n962bs" }],
  ["path", { d: "M11.6 16.8a3 3 0 1 1-5.8-1.6", key: "1yl0tm" }]
]);
/**
 * @license lucide-react v0.460.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const Fo = U("Palette", [
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
const we = U("Plus", [
  ["path", { d: "M5 12h14", key: "1ays0h" }],
  ["path", { d: "M12 5v14", key: "s699le" }]
]);
/**
 * @license lucide-react v0.460.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const Ca = U("Quote", [
  [
    "path",
    {
      d: "M16 3a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2 1 1 0 0 1 1 1v1a2 2 0 0 1-2 2 1 1 0 0 0-1 1v2a1 1 0 0 0 1 1 6 6 0 0 0 6-6V5a2 2 0 0 0-2-2z",
      key: "rib7q0"
    }
  ],
  [
    "path",
    {
      d: "M5 3a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2 1 1 0 0 1 1 1v1a2 2 0 0 1-2 2 1 1 0 0 0-1 1v2a1 1 0 0 0 1 1 6 6 0 0 0 6-6V5a2 2 0 0 0-2-2z",
      key: "1ymkrd"
    }
  ]
]);
/**
 * @license lucide-react v0.460.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const Na = U("RotateCcw", [
  ["path", { d: "M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8", key: "1357e3" }],
  ["path", { d: "M3 3v5h5", key: "1xhq8a" }]
]);
/**
 * @license lucide-react v0.460.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const or = U("Save", [
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
const Aa = U("ShieldCheck", [
  [
    "path",
    {
      d: "M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z",
      key: "oel41y"
    }
  ],
  ["path", { d: "m9 12 2 2 4-4", key: "dzmm74" }]
]);
/**
 * @license lucide-react v0.460.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const se = U("Trash2", [
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
const jo = U("Upload", [
  ["path", { d: "M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4", key: "ih7n3h" }],
  ["polyline", { points: "17 8 12 3 7 8", key: "t8dd8p" }],
  ["line", { x1: "12", x2: "12", y1: "3", y2: "15", key: "widbto" }]
]), pt = "corporate", Rr = 480, Pr = 144, Do = "contain", Or = ["image/jpeg", "image/png", "image/webp"];
function Vo({
  config: r,
  save: e
}) {
  const { t } = H("theme-corporate"), [a, n] = Q("home");
  return /* @__PURE__ */ p("div", { className: "space-y-6", children: [
    /* @__PURE__ */ l("p", { className: "text-sm text-surface-600 dark:text-surface-300", children: t("settings.description") }),
    /* @__PURE__ */ p(
      "nav",
      {
        className: "flex flex-wrap gap-1 border-b border-surface-200 dark:border-surface-800",
        "aria-label": t("title"),
        children: [
          /* @__PURE__ */ l(
            ht,
            {
              active: a === "home",
              onClick: () => n("home"),
              label: t("settings.tabs.home")
            }
          ),
          /* @__PURE__ */ l(
            ht,
            {
              active: a === "single",
              onClick: () => n("single"),
              label: t("settings.tabs.single")
            }
          ),
          /* @__PURE__ */ l(
            ht,
            {
              active: a === "logo",
              onClick: () => n("logo"),
              label: t("settings.tabs.logo")
            }
          ),
          /* @__PURE__ */ l(
            ht,
            {
              active: a === "style",
              onClick: () => n("style"),
              label: t("settings.tabs.style")
            }
          )
        ]
      }
    ),
    a === "home" && /* @__PURE__ */ l(Jo, { config: r, save: e }),
    a === "single" && /* @__PURE__ */ l(Wo, { config: r, save: e }),
    a === "logo" && /* @__PURE__ */ l(qo, { config: r, save: e }),
    a === "style" && /* @__PURE__ */ l(_o, { config: r, save: e })
  ] });
}
function ht({
  active: r,
  onClick: e,
  label: t
}) {
  return /* @__PURE__ */ l(
    "button",
    {
      type: "button",
      onClick: e,
      className: r ? "px-3 py-2 text-sm font-medium -mb-px border-b-2 border-blue-600 text-surface-900 dark:text-surface-50" : "px-3 py-2 text-sm font-medium -mb-px border-b-2 border-transparent text-surface-500 hover:text-surface-900 dark:text-surface-400 dark:hover:text-surface-100",
      children: t
    }
  );
}
function qo({
  config: r,
  save: e
}) {
  const { t } = H("theme-corporate"), { settings: a, terms: n } = la(), [o, i] = Q(!1), [s, c] = Q(!1), u = Dn(null), d = r.logoEnabled && a.baseUrl ? `${a.baseUrl.replace(/\/+$/, "")}/${zn(pt)}?v=${r.logoUpdatedAt}` : "";
  async function h(b) {
    const g = {
      ...a,
      themeConfigs: { ...a.themeConfigs, [pt]: b }
    };
    try {
      const [y, w] = await Promise.all([
        Lr({ type: "post" }),
        Lr({ type: "page" })
      ]);
      await jn(g, y, w, n);
    } catch (y) {
      console.error("[theme-corporate] menu.json refresh failed:", y);
    }
  }
  async function m(b) {
    if (!Or.includes(b.type)) {
      J.error(t("settings.logo.invalidType"));
      return;
    }
    i(!0);
    try {
      await Un({
        themeId: pt,
        file: b,
        width: Rr,
        height: Pr,
        fit: Do
      });
      const g = {
        ...r,
        logoEnabled: !0,
        logoUpdatedAt: Date.now()
      };
      await e(g), await h(g), J.success(t("settings.logo.saved"));
    } catch (g) {
      console.error("[theme-corporate] logo upload failed:", g), J.error(t("settings.logo.failed"));
    } finally {
      i(!1), u.current && (u.current.value = "");
    }
  }
  async function f() {
    c(!0);
    try {
      await Fn(pt);
      const b = {
        ...r,
        logoEnabled: !1,
        logoUpdatedAt: 0
      };
      await e(b), await h(b), J.success(t("settings.logo.removed"));
    } catch (b) {
      console.error("[theme-corporate] logo remove failed:", b), J.error(t("settings.logo.failed"));
    } finally {
      c(!1);
    }
  }
  return /* @__PURE__ */ p("section", { className: "card p-4 space-y-4", children: [
    /* @__PURE__ */ l("p", { className: "text-xs text-surface-500 dark:text-surface-400", children: t("settings.logo.help", { width: Rr, height: Pr }) }),
    /* @__PURE__ */ p("div", { className: "flex items-center gap-4", children: [
      d ? /* @__PURE__ */ l(
        "img",
        {
          src: d,
          alt: "",
          className: "h-20 w-auto max-w-[240px] rounded bg-white p-2 ring-1 ring-surface-200 object-contain dark:ring-surface-700"
        }
      ) : /* @__PURE__ */ l("div", { className: "h-20 w-40 rounded bg-surface-100 flex items-center justify-center text-surface-400 text-xs dark:bg-surface-800", children: t("settings.logo.none") }),
      /* @__PURE__ */ p("div", { className: "flex flex-col gap-2", children: [
        /* @__PURE__ */ l(
          "input",
          {
            ref: u,
            type: "file",
            accept: Or.join(","),
            className: "hidden",
            onChange: (b) => {
              var y;
              const g = (y = b.target.files) == null ? void 0 : y[0];
              g && m(g);
            }
          }
        ),
        /* @__PURE__ */ l(
          "button",
          {
            type: "button",
            className: "btn-secondary",
            onClick: () => {
              var b;
              return (b = u.current) == null ? void 0 : b.click();
            },
            disabled: o || s,
            children: /* @__PURE__ */ p("span", { className: "inline-flex items-center justify-center gap-1.5", children: [
              /* @__PURE__ */ l(Me, { className: "h-4 w-4 animate-spin " + (o ? "" : "hidden") }),
              /* @__PURE__ */ l(nt, { className: "h-4 w-4 " + (!o && r.logoEnabled ? "" : "hidden") }),
              /* @__PURE__ */ l(jo, { className: "h-4 w-4 " + (!o && !r.logoEnabled ? "" : "hidden") }),
              /* @__PURE__ */ l("span", { children: o ? t("settings.logo.uploading") : r.logoEnabled ? t("settings.logo.change") : t("settings.logo.upload") })
            ] })
          }
        ),
        r.logoEnabled && /* @__PURE__ */ l(
          "button",
          {
            type: "button",
            className: "btn-ghost",
            onClick: f,
            disabled: o || s,
            children: /* @__PURE__ */ p("span", { className: "inline-flex items-center justify-center gap-1.5", children: [
              /* @__PURE__ */ l(Me, { className: "h-4 w-4 animate-spin " + (s ? "" : "hidden") }),
              /* @__PURE__ */ l(se, { className: "h-4 w-4 " + (s ? "hidden" : "") }),
              /* @__PURE__ */ l("span", { children: t(s ? "settings.logo.removing" : "settings.logo.remove") })
            ] })
          }
        )
      ] })
    ] })
  ] });
}
function _o({
  config: r,
  save: e
}) {
  const { t } = H("theme-corporate"), [a, n] = Q(r.style ?? $e), [o, i] = Q(!1), [s, c] = Q(!1);
  function u(y, w) {
    n((C) => ({ ...C, vars: { ...C.vars, [y]: w } }));
  }
  function d(y) {
    n((w) => {
      const C = { ...w.vars };
      return delete C[y], { ...w, vars: C };
    });
  }
  async function h() {
    i(!0);
    try {
      await Ir({
        baseCssText: ia.cssText,
        style: a
      });
      const y = {
        ...r,
        style: a,
        cssUpdatedAt: Date.now()
      };
      await e(y), J.success(t("settings.style.saved"));
    } catch (y) {
      console.error("[theme-corporate] style save failed:", y), J.error(t("settings.style.failed"));
    } finally {
      i(!1);
    }
  }
  async function m() {
    c(!0);
    try {
      await Ir({
        baseCssText: ia.cssText,
        style: $e
      });
      const y = {
        ...r,
        style: $e,
        cssUpdatedAt: Date.now()
      };
      await e(y), n($e), J.success(t("settings.style.saved"));
    } catch (y) {
      console.error("[theme-corporate] style reset failed:", y), J.error(t("settings.style.failed"));
    } finally {
      c(!1);
    }
  }
  const f = /* @__PURE__ */ new Map();
  for (const y of Bt) {
    const w = f.get(y.group) ?? [];
    w.push(y), f.set(y.group, w);
  }
  const b = io(), g = Object.keys(at.sans).map((y) => ({
    name: y,
    fallback: "sans-serif"
  }));
  return /* @__PURE__ */ p("div", { className: "space-y-6", children: [
    /* @__PURE__ */ l("p", { className: "text-xs text-surface-500 dark:text-surface-400", children: t("settings.style.help") }),
    /* @__PURE__ */ l(Ko, { draft: a, setDraft: n }),
    /* @__PURE__ */ p("section", { className: "card p-4 space-y-4", children: [
      /* @__PURE__ */ l("h2", { className: "font-semibold", children: t("settings.groups.typography") }),
      /* @__PURE__ */ l("p", { className: "text-xs text-surface-500 dark:text-surface-400", children: t("settings.fonts.help") }),
      /* @__PURE__ */ l("link", { rel: "stylesheet", href: b }),
      /* @__PURE__ */ p("div", { children: [
        /* @__PURE__ */ l("label", { className: "label", children: t("settings.fonts.sans") }),
        /* @__PURE__ */ l(
          $n,
          {
            options: g,
            value: a.fontSans || Le,
            onChange: (y) => n((w) => ({ ...w, fontSans: y }))
          }
        )
      ] })
    ] }),
    ao.map((y) => {
      const w = f.get(y) ?? [];
      return w.length === 0 ? null : /* @__PURE__ */ p("section", { className: "card p-4 space-y-3", children: [
        /* @__PURE__ */ l("h2", { className: "font-semibold", children: t(`settings.groups.${y}`) }),
        /* @__PURE__ */ l("div", { className: "grid sm:grid-cols-2 gap-3", children: w.map((C) => /* @__PURE__ */ l(
          Go,
          {
            spec: C,
            value: a.vars[C.name] ?? "",
            onChange: (A) => u(C.name, A),
            onClear: () => d(C.name),
            label: t(`settings.${C.labelKey}`)
          },
          C.name
        )) })
      ] }, y);
    }),
    /* @__PURE__ */ p("div", { className: "card p-4 flex flex-wrap gap-3 justify-end", children: [
      /* @__PURE__ */ p(
        "button",
        {
          type: "button",
          className: "btn-ghost",
          onClick: m,
          disabled: o || s,
          children: [
            /* @__PURE__ */ l(Me, { className: s ? "h-4 w-4 animate-spin" : "hidden" }),
            /* @__PURE__ */ l(Na, { className: s ? "hidden" : "h-4 w-4" }),
            /* @__PURE__ */ l("span", { children: t(s ? "settings.style.resetting" : "settings.style.reset") })
          ]
        }
      ),
      /* @__PURE__ */ p(
        "button",
        {
          type: "button",
          className: "btn-primary",
          onClick: h,
          disabled: o || s,
          children: [
            /* @__PURE__ */ l(Me, { className: o ? "h-4 w-4 animate-spin" : "hidden" }),
            /* @__PURE__ */ l(or, { className: o ? "hidden" : "h-4 w-4" }),
            /* @__PURE__ */ l("span", { children: t(o ? "settings.style.saving" : "settings.style.save") })
          ]
        }
      )
    ] })
  ] });
}
function Go({
  spec: r,
  value: e,
  onChange: t,
  onClear: a,
  label: n
}) {
  const o = e || r.defaultValue;
  return /* @__PURE__ */ p("div", { children: [
    /* @__PURE__ */ p("label", { className: "label flex items-center justify-between gap-2", children: [
      /* @__PURE__ */ l("span", { children: n }),
      e && /* @__PURE__ */ l(
        "button",
        {
          type: "button",
          className: "text-xs text-surface-500 hover:text-surface-900 dark:text-surface-400 dark:hover:text-surface-100",
          onClick: a,
          title: "Reset to default",
          children: /* @__PURE__ */ l(Na, { className: "h-3 w-3" })
        }
      )
    ] }),
    r.type === "color" ? /* @__PURE__ */ p("div", { className: "flex gap-2 items-center", children: [
      /* @__PURE__ */ l(
        "input",
        {
          type: "color",
          value: o,
          onChange: (i) => t(i.target.value),
          className: "h-8 w-12 cursor-pointer rounded border border-surface-200 dark:border-surface-700"
        }
      ),
      /* @__PURE__ */ l(
        "input",
        {
          type: "text",
          value: e,
          placeholder: r.defaultValue,
          onChange: (i) => t(i.target.value),
          className: "input flex-1 font-mono text-xs"
        }
      )
    ] }) : /* @__PURE__ */ l(
      "input",
      {
        type: "text",
        value: e,
        placeholder: r.defaultValue,
        onChange: (i) => t(i.target.value),
        className: "input font-mono text-xs"
      }
    )
  ] });
}
function Jo({
  config: r,
  save: e
}) {
  var R, M, P, _, ut;
  const { t } = H("theme-corporate"), { terms: a } = la(), n = a.filter((v) => v.type === "category"), o = {
    ...ee,
    ...r.home ?? {},
    hero: { ...ee.hero, ...((R = r.home) == null ? void 0 : R.hero) ?? {} },
    featuredPosts: {
      ...ee.featuredPosts,
      ...((M = r.home) == null ? void 0 : M.featuredPosts) ?? {}
    },
    testimonials: {
      ...ee.testimonials,
      ...((P = r.home) == null ? void 0 : P.testimonials) ?? {},
      // Items are an array — explicitly fall back to defaults when
      // the stored config has none (rather than spreading undefined).
      items: ((ut = (_ = r.home) == null ? void 0 : _.testimonials) == null ? void 0 : ut.items) ?? ee.testimonials.items
    }
  }, [i, s] = Q(o), [c, u] = Q(!1), [d, h] = Q(!1);
  function m(v) {
    s((T) => ({ ...T, ...v }));
  }
  function f(v) {
    s((T) => ({ ...T, hero: { ...T.hero, ...v } }));
  }
  function b(v) {
    s((T) => ({ ...T, featuredPosts: { ...T.featuredPosts, ...v } }));
  }
  function g(v) {
    s((T) => ({ ...T, testimonials: { ...T.testimonials, ...v } }));
  }
  function y(v, T) {
    s(($) => ({
      ...$,
      testimonials: {
        ...$.testimonials,
        items: $.testimonials.items.map(
          (le, de) => de === v ? { ...le, ...T } : le
        )
      }
    }));
  }
  function w() {
    s((v) => ({
      ...v,
      testimonials: {
        ...v.testimonials,
        items: [
          ...v.testimonials.items,
          {
            rating: 5,
            quote: "",
            authorName: "",
            authorTitle: "",
            authorAvatarUrl: "",
            authorAvatarAlt: ""
          }
        ]
      }
    }));
  }
  function C(v) {
    s((T) => ({
      ...T,
      testimonials: {
        ...T.testimonials,
        items: T.testimonials.items.filter(($, le) => le !== v)
      }
    }));
  }
  function A(v, T) {
    const $ = v + T;
    $ < 0 || $ >= i.testimonials.items.length || s((le) => {
      const de = [...le.testimonials.items];
      return [de[v], de[$]] = [de[$], de[v]], { ...le, testimonials: { ...le.testimonials, items: de } };
    });
  }
  async function B() {
    u(!0);
    try {
      const v = { ...r, home: i };
      await e(v), J.success(t("settings.home.saved"));
    } catch (v) {
      console.error("[theme-corporate] home save failed:", v), J.error(t("settings.home.failed"));
    } finally {
      u(!1);
    }
  }
  return /* @__PURE__ */ p(Ee, { children: [
    /* @__PURE__ */ p("div", { className: "space-y-6", children: [
      /* @__PURE__ */ l("p", { className: "text-xs text-surface-500 dark:text-surface-400", children: t("settings.home.help") }),
      /* @__PURE__ */ p("section", { className: "card p-4 space-y-3", children: [
        /* @__PURE__ */ p("label", { className: "flex items-center gap-2 text-sm text-surface-700 dark:text-surface-200", children: [
          /* @__PURE__ */ l(
            "input",
            {
              type: "checkbox",
              checked: i.showHero,
              onChange: (v) => m({ showHero: v.target.checked })
            }
          ),
          t("settings.home.showHero")
        ] }),
        /* @__PURE__ */ l("p", { className: "text-xs text-surface-500 dark:text-surface-400", children: t("settings.home.showHeroHelp") })
      ] }),
      /* @__PURE__ */ p("section", { className: "card p-4 space-y-3", children: [
        /* @__PURE__ */ l("h2", { className: "font-semibold", children: t("settings.home.heroHeading") }),
        /* @__PURE__ */ p("div", { children: [
          /* @__PURE__ */ l("label", { className: "label", children: t("settings.home.heroImage") }),
          /* @__PURE__ */ p("div", { className: "flex items-start gap-3", children: [
            i.hero.imageUrl ? /* @__PURE__ */ l(
              "img",
              {
                src: i.hero.imageUrl,
                alt: "",
                className: "h-16 w-24 rounded object-cover ring-1 ring-surface-200 shrink-0 dark:ring-surface-700",
                onError: (v) => {
                  v.currentTarget.style.display = "none";
                }
              }
            ) : /* @__PURE__ */ l("div", { className: "h-16 w-24 rounded bg-surface-100 flex items-center justify-center text-surface-400 shrink-0 dark:bg-surface-800", children: /* @__PURE__ */ l(nt, { className: "h-5 w-5" }) }),
            /* @__PURE__ */ p("div", { className: "flex-1 space-y-2", children: [
              /* @__PURE__ */ l(
                "input",
                {
                  type: "url",
                  className: "input",
                  placeholder: "https://…",
                  value: i.hero.imageUrl ?? "",
                  onChange: (v) => f({ imageUrl: v.target.value })
                }
              ),
              /* @__PURE__ */ p("div", { className: "flex flex-wrap gap-2", children: [
                /* @__PURE__ */ p(
                  "button",
                  {
                    type: "button",
                    className: "btn-ghost btn-sm flex items-center gap-1",
                    onClick: () => h(!0),
                    children: [
                      /* @__PURE__ */ l(nt, { className: "h-3 w-3" }),
                      t("settings.home.heroImagePick")
                    ]
                  }
                ),
                i.hero.imageUrl && /* @__PURE__ */ p(
                  "button",
                  {
                    type: "button",
                    className: "btn-ghost btn-sm flex items-center gap-1 text-red-600",
                    onClick: () => f({ imageUrl: "" }),
                    children: [
                      /* @__PURE__ */ l(se, { className: "h-3 w-3" }),
                      t("settings.home.heroImageClear")
                    ]
                  }
                )
              ] })
            ] })
          ] }),
          /* @__PURE__ */ l("p", { className: "text-xs text-surface-500 mt-2 dark:text-surface-400", children: t("settings.home.heroImageHelp") })
        ] }),
        /* @__PURE__ */ p("div", { children: [
          /* @__PURE__ */ l("label", { className: "label", children: t("settings.home.heroImageAlt") }),
          /* @__PURE__ */ l(
            "input",
            {
              type: "text",
              className: "input",
              value: i.hero.imageAlt ?? "",
              onChange: (v) => f({ imageAlt: v.target.value })
            }
          )
        ] }),
        /* @__PURE__ */ p("div", { children: [
          /* @__PURE__ */ l("label", { className: "label", children: t("settings.home.heroEyebrow") }),
          /* @__PURE__ */ l(
            "input",
            {
              type: "text",
              className: "input",
              value: i.hero.eyebrow ?? "",
              onChange: (v) => f({ eyebrow: v.target.value })
            }
          )
        ] }),
        /* @__PURE__ */ p("div", { children: [
          /* @__PURE__ */ l("label", { className: "label", children: t("settings.home.heroTitle") }),
          /* @__PURE__ */ l(
            "input",
            {
              type: "text",
              className: "input",
              value: i.hero.title ?? "",
              onChange: (v) => f({ title: v.target.value })
            }
          )
        ] }),
        /* @__PURE__ */ p("div", { children: [
          /* @__PURE__ */ l("label", { className: "label", children: t("settings.home.heroSubtitle") }),
          /* @__PURE__ */ l(
            "textarea",
            {
              className: "input",
              rows: 3,
              value: i.hero.subtitle ?? "",
              onChange: (v) => f({ subtitle: v.target.value })
            }
          )
        ] }),
        /* @__PURE__ */ p("div", { className: "grid grid-cols-2 gap-3", children: [
          /* @__PURE__ */ p("div", { children: [
            /* @__PURE__ */ l("label", { className: "label", children: t("settings.home.primaryCtaLabel") }),
            /* @__PURE__ */ l(
              "input",
              {
                type: "text",
                className: "input",
                value: i.hero.primaryCtaLabel ?? "",
                onChange: (v) => f({ primaryCtaLabel: v.target.value })
              }
            )
          ] }),
          /* @__PURE__ */ p("div", { children: [
            /* @__PURE__ */ l("label", { className: "label", children: t("settings.home.primaryCtaHref") }),
            /* @__PURE__ */ l(
              "input",
              {
                type: "text",
                className: "input",
                placeholder: "/contact.html",
                value: i.hero.primaryCtaHref ?? "",
                onChange: (v) => f({ primaryCtaHref: v.target.value })
              }
            )
          ] }),
          /* @__PURE__ */ p("div", { children: [
            /* @__PURE__ */ l("label", { className: "label", children: t("settings.home.secondaryCtaLabel") }),
            /* @__PURE__ */ l(
              "input",
              {
                type: "text",
                className: "input",
                value: i.hero.secondaryCtaLabel ?? "",
                onChange: (v) => f({ secondaryCtaLabel: v.target.value })
              }
            )
          ] }),
          /* @__PURE__ */ p("div", { children: [
            /* @__PURE__ */ l("label", { className: "label", children: t("settings.home.secondaryCtaHref") }),
            /* @__PURE__ */ l(
              "input",
              {
                type: "text",
                className: "input",
                value: i.hero.secondaryCtaHref ?? "",
                onChange: (v) => f({ secondaryCtaHref: v.target.value })
              }
            )
          ] })
        ] })
      ] }),
      /* @__PURE__ */ p("section", { className: "card p-4 space-y-3", children: [
        /* @__PURE__ */ l("h2", { className: "font-semibold", children: t("settings.home.featuredHeading") }),
        /* @__PURE__ */ p("label", { className: "flex items-center gap-2 text-sm text-surface-700 dark:text-surface-200", children: [
          /* @__PURE__ */ l(
            "input",
            {
              type: "checkbox",
              checked: i.featuredPosts.enabled,
              onChange: (v) => b({ enabled: v.target.checked })
            }
          ),
          t("settings.home.featuredEnabled")
        ] }),
        /* @__PURE__ */ l("p", { className: "text-xs text-surface-500 dark:text-surface-400", children: t("settings.home.featuredHelp") }),
        /* @__PURE__ */ p("div", { children: [
          /* @__PURE__ */ l("label", { className: "label", children: t("settings.home.featuredTitle") }),
          /* @__PURE__ */ l(
            "input",
            {
              type: "text",
              className: "input",
              value: i.featuredPosts.title,
              onChange: (v) => b({ title: v.target.value })
            }
          )
        ] }),
        /* @__PURE__ */ p("div", { children: [
          /* @__PURE__ */ l("label", { className: "label", children: t("settings.home.featuredSubtitle") }),
          /* @__PURE__ */ l(
            "textarea",
            {
              className: "input",
              rows: 2,
              value: i.featuredPosts.subtitle,
              onChange: (v) => b({ subtitle: v.target.value })
            }
          )
        ] }),
        /* @__PURE__ */ p("div", { className: "grid grid-cols-2 gap-3", children: [
          /* @__PURE__ */ p("div", { children: [
            /* @__PURE__ */ l("label", { className: "label", children: t("settings.home.featuredMode") }),
            /* @__PURE__ */ p(
              "select",
              {
                className: "input",
                value: i.featuredPosts.mode,
                onChange: (v) => b({ mode: v.target.value }),
                children: [
                  /* @__PURE__ */ l("option", { value: "all", children: t("settings.home.featuredModes.all") }),
                  /* @__PURE__ */ l("option", { value: "category", children: t("settings.home.featuredModes.category") })
                ]
              }
            )
          ] }),
          /* @__PURE__ */ p("div", { children: [
            /* @__PURE__ */ l("label", { className: "label", children: t("settings.home.featuredCount") }),
            /* @__PURE__ */ l(
              "input",
              {
                type: "number",
                min: 1,
                max: 12,
                className: "input",
                value: i.featuredPosts.count,
                onChange: (v) => b({ count: Math.max(1, Number(v.target.value) || 3) })
              }
            )
          ] })
        ] }),
        i.featuredPosts.mode === "category" && /* @__PURE__ */ p("div", { children: [
          /* @__PURE__ */ l("label", { className: "label", children: t("settings.home.featuredCategory") }),
          /* @__PURE__ */ p(
            "select",
            {
              className: "input",
              value: i.featuredPosts.categoryId,
              onChange: (v) => b({ categoryId: v.target.value }),
              children: [
                /* @__PURE__ */ l("option", { value: "", children: t("settings.home.featuredCategoryPlaceholder") }),
                n.map((v) => /* @__PURE__ */ l("option", { value: v.id, children: v.name }, v.id))
              ]
            }
          ),
          n.length === 0 && /* @__PURE__ */ l("p", { className: "text-xs text-surface-500 mt-1 dark:text-surface-400", children: t("settings.home.featuredCategoryEmpty") })
        ] })
      ] }),
      /* @__PURE__ */ p("section", { className: "card p-4 space-y-3", children: [
        /* @__PURE__ */ l("h2", { className: "font-semibold", children: t("settings.home.testimonialsHeading") }),
        /* @__PURE__ */ p("label", { className: "flex items-center gap-2 text-sm text-surface-700 dark:text-surface-200", children: [
          /* @__PURE__ */ l(
            "input",
            {
              type: "checkbox",
              checked: i.testimonials.enabled,
              onChange: (v) => g({ enabled: v.target.checked })
            }
          ),
          t("settings.home.testimonialsEnabled")
        ] }),
        /* @__PURE__ */ l("p", { className: "text-xs text-surface-500 dark:text-surface-400", children: t("settings.home.testimonialsHelp") }),
        /* @__PURE__ */ p("div", { children: [
          /* @__PURE__ */ l("label", { className: "label", children: t("settings.home.testimonialsVariant") }),
          /* @__PURE__ */ p(
            "select",
            {
              className: "input",
              value: i.testimonials.variant,
              onChange: (v) => g({ variant: v.target.value }),
              children: [
                /* @__PURE__ */ l("option", { value: "glass", children: t("settings.home.testimonialsVariants.glass") }),
                /* @__PURE__ */ l("option", { value: "navy", children: t("settings.home.testimonialsVariants.navy") })
              ]
            }
          )
        ] }),
        /* @__PURE__ */ p("div", { children: [
          /* @__PURE__ */ l("label", { className: "label", children: t("settings.home.testimonialsEyebrow") }),
          /* @__PURE__ */ l(
            "input",
            {
              type: "text",
              className: "input",
              value: i.testimonials.eyebrow,
              onChange: (v) => g({ eyebrow: v.target.value })
            }
          )
        ] }),
        /* @__PURE__ */ p("div", { children: [
          /* @__PURE__ */ l("label", { className: "label", children: t("settings.home.testimonialsTitle") }),
          /* @__PURE__ */ l(
            "input",
            {
              type: "text",
              className: "input",
              value: i.testimonials.title,
              onChange: (v) => g({ title: v.target.value })
            }
          )
        ] }),
        /* @__PURE__ */ p("div", { children: [
          /* @__PURE__ */ l("label", { className: "label", children: t("settings.home.testimonialsSubtitle") }),
          /* @__PURE__ */ l(
            "textarea",
            {
              className: "input",
              rows: 2,
              value: i.testimonials.subtitle,
              onChange: (v) => g({ subtitle: v.target.value })
            }
          )
        ] }),
        /* @__PURE__ */ p("div", { className: "space-y-3 pt-3 border-t border-surface-200 dark:border-surface-700", children: [
          /* @__PURE__ */ p("div", { className: "flex items-center justify-between", children: [
            /* @__PURE__ */ l("p", { className: "text-xs font-semibold uppercase tracking-wide text-surface-500 dark:text-surface-400", children: t("settings.home.testimonialsItemsHeading") }),
            /* @__PURE__ */ p(
              "button",
              {
                type: "button",
                className: "btn-ghost btn-sm flex items-center gap-1",
                onClick: w,
                children: [
                  /* @__PURE__ */ l(we, { className: "h-3 w-3" }),
                  t("settings.home.testimonialsAdd")
                ]
              }
            )
          ] }),
          i.testimonials.items.map((v, T) => /* @__PURE__ */ p(
            "div",
            {
              className: "rounded-md border border-surface-200 bg-surface-50 p-3 space-y-2 dark:border-surface-700 dark:bg-surface-800",
              children: [
                /* @__PURE__ */ p("div", { className: "flex items-center justify-between", children: [
                  /* @__PURE__ */ l("p", { className: "text-xs font-semibold text-surface-600 dark:text-surface-300", children: t("settings.home.testimonialsItemIndex", { index: T + 1 }) }),
                  /* @__PURE__ */ p("div", { className: "flex items-center gap-1", children: [
                    /* @__PURE__ */ l(
                      "button",
                      {
                        type: "button",
                        className: "btn-ghost btn-icon",
                        onClick: () => A(T, -1),
                        disabled: T === 0,
                        children: /* @__PURE__ */ l(Oe, { className: "h-3 w-3" })
                      }
                    ),
                    /* @__PURE__ */ l(
                      "button",
                      {
                        type: "button",
                        className: "btn-ghost btn-icon",
                        onClick: () => A(T, 1),
                        disabled: T === i.testimonials.items.length - 1,
                        children: /* @__PURE__ */ l(Pe, { className: "h-3 w-3" })
                      }
                    ),
                    /* @__PURE__ */ l(
                      "button",
                      {
                        type: "button",
                        className: "btn-ghost btn-icon text-red-600",
                        onClick: () => C(T),
                        children: /* @__PURE__ */ l(se, { className: "h-3 w-3" })
                      }
                    )
                  ] })
                ] }),
                /* @__PURE__ */ p("div", { children: [
                  /* @__PURE__ */ l("label", { className: "label text-xs", children: t("settings.home.testimonialsQuote") }),
                  /* @__PURE__ */ l(
                    "textarea",
                    {
                      className: "input",
                      rows: 3,
                      value: v.quote,
                      onChange: ($) => y(T, { quote: $.target.value })
                    }
                  )
                ] }),
                /* @__PURE__ */ p("div", { className: "grid grid-cols-2 gap-2", children: [
                  /* @__PURE__ */ p("div", { children: [
                    /* @__PURE__ */ l("label", { className: "label text-xs", children: t("settings.home.testimonialsAuthorName") }),
                    /* @__PURE__ */ l(
                      "input",
                      {
                        type: "text",
                        className: "input",
                        value: v.authorName,
                        onChange: ($) => y(T, { authorName: $.target.value })
                      }
                    )
                  ] }),
                  /* @__PURE__ */ p("div", { children: [
                    /* @__PURE__ */ l("label", { className: "label text-xs", children: t("settings.home.testimonialsAuthorTitle") }),
                    /* @__PURE__ */ l(
                      "input",
                      {
                        type: "text",
                        className: "input",
                        value: v.authorTitle ?? "",
                        onChange: ($) => y(T, { authorTitle: $.target.value })
                      }
                    )
                  ] }),
                  /* @__PURE__ */ p("div", { children: [
                    /* @__PURE__ */ l("label", { className: "label text-xs", children: t("settings.home.testimonialsAvatarUrl") }),
                    /* @__PURE__ */ l(
                      "input",
                      {
                        type: "url",
                        className: "input",
                        placeholder: "https://…",
                        value: v.authorAvatarUrl ?? "",
                        onChange: ($) => y(T, { authorAvatarUrl: $.target.value })
                      }
                    )
                  ] }),
                  /* @__PURE__ */ p("div", { children: [
                    /* @__PURE__ */ l("label", { className: "label text-xs", children: t("settings.home.testimonialsRating") }),
                    /* @__PURE__ */ l(
                      "input",
                      {
                        type: "number",
                        min: 1,
                        max: 5,
                        className: "input",
                        value: v.rating ?? 5,
                        onChange: ($) => y(T, { rating: Number($.target.value) || 5 })
                      }
                    )
                  ] })
                ] })
              ]
            },
            T
          ))
        ] })
      ] }),
      /* @__PURE__ */ l("div", { className: "card p-4 flex flex-wrap gap-3 justify-end", children: /* @__PURE__ */ p(
        "button",
        {
          type: "button",
          className: "btn-primary",
          onClick: B,
          disabled: c,
          children: [
            /* @__PURE__ */ l(Me, { className: c ? "h-4 w-4 animate-spin" : "hidden" }),
            /* @__PURE__ */ l(or, { className: c ? "hidden" : "h-4 w-4" }),
            /* @__PURE__ */ l("span", { children: t(c ? "settings.home.saving" : "settings.home.save") })
          ]
        }
      ) })
    ] }),
    d && /* @__PURE__ */ l(
      On,
      {
        onPick: (v) => {
          const T = Bn(v, "large");
          f({ imageUrl: T, imageAlt: v.alt ?? "" }), h(!1);
        },
        onClose: () => h(!1)
      }
    )
  ] });
}
function Wo({
  config: r,
  save: e
}) {
  const { t } = H("theme-corporate"), a = {
    ...nr,
    ...r.single ?? {}
  }, [n, o] = Q(a), [i, s] = Q(!1);
  function c(d) {
    o((h) => ({ ...h, ...d }));
  }
  async function u() {
    s(!0);
    try {
      const d = { ...r, single: n };
      await e(d), J.success(t("settings.single.saved"));
    } catch (d) {
      console.error("[theme-corporate] single save failed:", d), J.error(t("settings.single.failed"));
    } finally {
      s(!1);
    }
  }
  return /* @__PURE__ */ p("div", { className: "space-y-6", children: [
    /* @__PURE__ */ l("p", { className: "text-xs text-surface-500 dark:text-surface-400", children: t("settings.single.help") }),
    /* @__PURE__ */ p("section", { className: "card p-4 space-y-3", children: [
      /* @__PURE__ */ l("h2", { className: "font-semibold", children: t("settings.single.sidebarHeading") }),
      /* @__PURE__ */ p("div", { className: "space-y-1", children: [
        /* @__PURE__ */ p("label", { className: "flex items-center gap-2 text-sm text-surface-700 dark:text-surface-200", children: [
          /* @__PURE__ */ l(
            "input",
            {
              type: "checkbox",
              checked: n.showAuthorBio,
              onChange: (d) => c({ showAuthorBio: d.target.checked })
            }
          ),
          t("settings.single.showAuthorBio")
        ] }),
        /* @__PURE__ */ l("p", { className: "text-xs text-surface-500 ml-6 dark:text-surface-400", children: t("settings.single.showAuthorBioHelp") })
      ] }),
      /* @__PURE__ */ p("div", { className: "space-y-1 pt-2 border-t border-surface-200 dark:border-surface-700", children: [
        /* @__PURE__ */ p("label", { className: "flex items-center gap-2 text-sm text-surface-700 dark:text-surface-200 mt-3", children: [
          /* @__PURE__ */ l(
            "input",
            {
              type: "checkbox",
              checked: n.showPopularArticles,
              onChange: (d) => c({ showPopularArticles: d.target.checked })
            }
          ),
          t("settings.single.showPopular")
        ] }),
        /* @__PURE__ */ l("p", { className: "text-xs text-surface-500 ml-6 dark:text-surface-400", children: t("settings.single.showPopularHelp") })
      ] }),
      n.showPopularArticles && /* @__PURE__ */ p("div", { className: "ml-6 mt-2", children: [
        /* @__PURE__ */ l("label", { className: "label", children: t("settings.single.popularTitle") }),
        /* @__PURE__ */ l(
          "input",
          {
            type: "text",
            className: "input",
            placeholder: t("publicBaked.popularArticles"),
            value: n.popularArticlesTitle,
            onChange: (d) => c({ popularArticlesTitle: d.target.value })
          }
        ),
        /* @__PURE__ */ l("p", { className: "text-xs text-surface-500 mt-1 dark:text-surface-400", children: t("settings.single.popularTitleHelp") })
      ] }),
      /* @__PURE__ */ p("div", { className: "space-y-1 pt-2 border-t border-surface-200 dark:border-surface-700", children: [
        /* @__PURE__ */ p("label", { className: "flex items-center gap-2 text-sm text-surface-700 dark:text-surface-200 mt-3", children: [
          /* @__PURE__ */ l(
            "input",
            {
              type: "checkbox",
              checked: n.showCta,
              onChange: (d) => c({ showCta: d.target.checked })
            }
          ),
          t("settings.single.showCta")
        ] }),
        /* @__PURE__ */ l("p", { className: "text-xs text-surface-500 ml-6 dark:text-surface-400", children: t("settings.single.showCtaHelp") })
      ] }),
      n.showCta && /* @__PURE__ */ p("div", { className: "ml-6 mt-2 space-y-3", children: [
        /* @__PURE__ */ p("div", { children: [
          /* @__PURE__ */ l("label", { className: "label", children: t("settings.single.ctaTitle") }),
          /* @__PURE__ */ l(
            "input",
            {
              type: "text",
              className: "input",
              placeholder: t("publicBaked.getStarted"),
              value: n.ctaTitle,
              onChange: (d) => c({ ctaTitle: d.target.value })
            }
          ),
          /* @__PURE__ */ l("p", { className: "text-xs text-surface-500 mt-1 dark:text-surface-400", children: t("settings.single.ctaTitleHelp") })
        ] }),
        /* @__PURE__ */ p("div", { className: "grid grid-cols-2 gap-3", children: [
          /* @__PURE__ */ p("div", { children: [
            /* @__PURE__ */ l("label", { className: "label", children: t("settings.single.ctaButtonLabel") }),
            /* @__PURE__ */ l(
              "input",
              {
                type: "text",
                className: "input",
                placeholder: t("publicBaked.getStarted"),
                value: n.ctaButtonLabel,
                onChange: (d) => c({ ctaButtonLabel: d.target.value })
              }
            )
          ] }),
          /* @__PURE__ */ p("div", { children: [
            /* @__PURE__ */ l("label", { className: "label", children: t("settings.single.ctaButtonHref") }),
            /* @__PURE__ */ l(
              "input",
              {
                type: "text",
                className: "input",
                placeholder: "/contact.html",
                value: n.ctaButtonHref,
                onChange: (d) => c({ ctaButtonHref: d.target.value })
              }
            )
          ] })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ l("div", { className: "card p-4 flex flex-wrap gap-3 justify-end", children: /* @__PURE__ */ p(
      "button",
      {
        type: "button",
        className: "btn-primary",
        onClick: u,
        disabled: i,
        children: [
          /* @__PURE__ */ l(Me, { className: i ? "h-4 w-4 animate-spin" : "hidden" }),
          /* @__PURE__ */ l(or, { className: i ? "hidden" : "h-4 w-4" }),
          /* @__PURE__ */ l("span", { children: t(i ? "settings.single.saving" : "settings.single.save") })
        ]
      }
    ) })
  ] });
}
function Ko({
  draft: r,
  setDraft: e
}) {
  const { t } = H("theme-corporate"), a = no(r);
  function n(o) {
    e({
      vars: { ...o.vars },
      fontSans: o.fontSans
    });
  }
  return /* @__PURE__ */ p("section", { className: "card p-4 space-y-3", children: [
    /* @__PURE__ */ p("header", { className: "space-y-1", children: [
      /* @__PURE__ */ p("h2", { className: "font-semibold flex items-center gap-2", children: [
        /* @__PURE__ */ l(Fo, { className: "h-4 w-4 text-surface-400" }),
        t("settings.presets.title")
      ] }),
      /* @__PURE__ */ l("p", { className: "text-xs text-surface-500 dark:text-surface-400", children: t("settings.presets.help") })
    ] }),
    /* @__PURE__ */ l("div", { className: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2", children: ha.map((o) => {
      const i = o.id === a, s = {
        vars: o.vars,
        fontSans: o.fontSans
      }, c = o.swatch.map(
        (u) => ma(s, u)
      );
      return /* @__PURE__ */ p(
        "button",
        {
          type: "button",
          onClick: () => n(o),
          className: "text-left p-3 rounded border transition focus:outline-none focus:ring-2 focus:ring-blue-500 " + (i ? "border-blue-600 bg-blue-50 dark:border-blue-500 dark:bg-blue-950/30" : "border-surface-200 hover:border-surface-400 dark:border-surface-700 dark:hover:border-surface-500"),
          "aria-pressed": i,
          children: [
            /* @__PURE__ */ p("div", { className: "flex items-center justify-between gap-2 mb-2", children: [
              /* @__PURE__ */ l("span", { className: "text-sm font-medium", children: t(`settings.presets.${o.id}.label`) }),
              /* @__PURE__ */ l("div", { className: "flex -space-x-1", "aria-hidden": "true", children: c.map((u, d) => /* @__PURE__ */ l(
                "span",
                {
                  className: "h-4 w-4 rounded-full ring-1 ring-surface-200 dark:ring-surface-700",
                  style: { background: u }
                },
                d
              )) })
            ] }),
            /* @__PURE__ */ l("p", { className: "text-xs text-surface-500 dark:text-surface-400 line-clamp-2", children: t(`settings.presets.${o.id}.description`) })
          ]
        },
        o.id
      );
    }) })
  ] });
}
const ne = "Home hero (full-width image with a navy gradient):", Ce = "Featured posts grid of the home page:", Ne = "Testimonials section of the home page:", ue = "Sidebar of every single-post page:", Yo = {
  logoEnabled: {
    description: "Managed by the theme — don't set: use `themes logo corporate <image>` (or --remove). True once a logo is uploaded; the header then shows it instead of the text wordmark."
  },
  logoUpdatedAt: {
    description: "Managed by the theme — don't set. Cache-busting ?v= value of the logo URL in data/menu.json."
  },
  cssUpdatedAt: {
    description: "Managed by the theme — don't set. Cache-busting ?v= value of the theme CSS link; existing pages keep the old one until they are regenerated."
  },
  "style.vars": {
    description: `Overrides of the theme's Material 3 color variables, baked into theme-assets/corporate.css, e.g. {"--color-primary":"#0b1f3a"}; keys are the --color-* entries of cssVariables in --schema. Give hex colors (#rgb or #rrggbb): they are converted to the RGB triplets the CSS uses. An empty value reverts to the default.`,
    format: "map of CSS variable → hex color"
  },
  "style.fontSans": {
    description: "The theme's single Google Font, used for every text (--font-sans).",
    values: Object.keys(at.sans)
  },
  "home.showHero": {
    description: "Show the hero at the top of the home page. All home.* settings are ignored when Settings → Home mode is a static page (its body is the home)."
  },
  "home.hero.imageUrl": {
    description: `${ne} background image URL (Media library or external). Empty = a solid navy hero.`,
    format: "URL"
  },
  "home.hero.imageAlt": { description: `${ne} alt text of the background image.` },
  "home.hero.eyebrow": { description: `${ne} small uppercase label above the headline.` },
  "home.hero.title": { description: `${ne} headline.` },
  "home.hero.subtitle": { description: `${ne} paragraph under the headline.` },
  "home.hero.primaryCtaLabel": { description: `${ne} label of the primary button (empty hides it).` },
  "home.hero.primaryCtaHref": { description: `${ne} link of the primary button.`, format: "URL, site path or #anchor" },
  "home.hero.secondaryCtaLabel": { description: `${ne} label of the secondary button (empty hides it).` },
  "home.hero.secondaryCtaHref": { description: `${ne} link of the secondary button.`, format: "URL, site path or #anchor" },
  "home.featuredPosts.enabled": { description: `${Ce} show the section below the hero.` },
  "home.featuredPosts.title": { description: `${Ce} section heading.` },
  "home.featuredPosts.subtitle": { description: `${Ce} lede under the heading.` },
  "home.featuredPosts.mode": {
    description: `${Ce} newest online posts of the whole site ("all") or of one category ("category", see categoryId).`,
    values: ["all", "category"]
  },
  "home.featuredPosts.categoryId": {
    description: `${Ce} category term id used when mode is "category". Empty or without posts = falls back to all posts.`,
    format: "category term id"
  },
  "home.featuredPosts.count": {
    description: `${Ce} number of post cards (the settings page offers 1 to 12).`,
    min: 1
  },
  "home.testimonials.enabled": { description: `${Ne} show the section below the featured posts.` },
  "home.testimonials.eyebrow": { description: `${Ne} optional small label above the heading.` },
  "home.testimonials.title": { description: `${Ne} section heading.` },
  "home.testimonials.subtitle": { description: `${Ne} lede under the heading.` },
  "home.testimonials.variant": {
    description: `${Ne} frosted cards on a light surface ("glass") or a navy section ("navy").`,
    values: ["glass", "navy"]
  },
  "home.testimonials.items": {
    description: `${Ne} the quotes, an array of { quote, authorName, authorTitle?, rating? (1-5 stars, default 5), authorAvatarUrl? (URL; empty = initials), authorAvatarAlt? }. Replaces the three placeholder testimonials.`,
    format: "array of { quote, authorName, authorTitle, rating, authorAvatarUrl, authorAvatarAlt }"
  },
  "single.showAuthorBio": { description: `${ue} author card (avatar, name, role, bio, social links).` },
  "single.showPopularArticles": {
    description: `${ue} popular articles card (3 related posts, filled at runtime from data/posts.json).`
  },
  "single.popularArticlesTitle": {
    description: `${ue} heading of the popular articles card. Empty = the theme's default in the site language.`
  },
  "single.showCta": { description: `${ue} navy call-to-action card at the bottom.` },
  "single.ctaTitle": {
    description: `${ue} heading of the CTA card. Empty = the site title (when the site has a description) or "Get started".`
  },
  "single.ctaButtonLabel": { description: `${ue} button label of the CTA card. Empty = "Get started".` },
  "single.ctaButtonHref": {
    description: `${ue} button link of the CTA card. Empty = /contact.html.`,
    format: "URL or site path"
  }
};
function F(r) {
  this.content = r;
}
F.prototype = {
  constructor: F,
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
    var a = t && t != r ? this.remove(t) : this, n = a.find(r), o = a.content.slice();
    return n == -1 ? o.push(t || r, e) : (o[n + 1] = e, t && (o[n] = t)), new F(o);
  },
  // :: (string) → OrderedMap
  // Return a map with the given key removed, if it existed.
  remove: function(r) {
    var e = this.find(r);
    if (e == -1) return this;
    var t = this.content.slice();
    return t.splice(e, 2), new F(t);
  },
  // :: (string, any) → OrderedMap
  // Add a new key to the start of the map.
  addToStart: function(r, e) {
    return new F([r, e].concat(this.remove(r).content));
  },
  // :: (string, any) → OrderedMap
  // Add a new key to the end of the map.
  addToEnd: function(r, e) {
    var t = this.remove(r).content.slice();
    return t.push(r, e), new F(t);
  },
  // :: (string, string, any) → OrderedMap
  // Add a key after the given key. If `place` is not found, the new
  // key is added to the end.
  addBefore: function(r, e, t) {
    var a = this.remove(e), n = a.content.slice(), o = a.find(r);
    return n.splice(o == -1 ? n.length : o, 0, e, t), new F(n);
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
    return r = F.from(r), r.size ? new F(r.content.concat(this.subtract(r).content)) : this;
  },
  // :: (union<Object, OrderedMap>) → OrderedMap
  // Create a new map by appending the keys in this map that don't
  // appear in `map` after the keys in `map`.
  append: function(r) {
    return r = F.from(r), r.size ? new F(this.subtract(r).content.concat(r.content)) : this;
  },
  // :: (union<Object, OrderedMap>) → OrderedMap
  // Create a map containing all the keys in this map that don't
  // appear in `map`.
  subtract: function(r) {
    var e = this;
    r = F.from(r);
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
F.from = function(r) {
  if (r instanceof F) return r;
  var e = [];
  if (r) for (var t in r) e.push(t, r[t]);
  return new F(e);
};
function Ta(r, e, t) {
  for (let a = 0; ; a++) {
    if (a == r.childCount || a == e.childCount)
      return r.childCount == e.childCount ? null : t;
    let n = r.child(a), o = e.child(a);
    if (n == o) {
      t += n.nodeSize;
      continue;
    }
    if (!n.sameMarkup(o))
      return t;
    if (n.isText && n.text != o.text) {
      for (let i = 0; n.text[i] == o.text[i]; i++)
        t++;
      return t;
    }
    if (n.content.size || o.content.size) {
      let i = Ta(n.content, o.content, t + 1);
      if (i != null)
        return i;
    }
    t += n.nodeSize;
  }
}
function Ea(r, e, t, a) {
  for (let n = r.childCount, o = e.childCount; ; ) {
    if (n == 0 || o == 0)
      return n == o ? null : { a: t, b: a };
    let i = r.child(--n), s = e.child(--o), c = i.nodeSize;
    if (i == s) {
      t -= c, a -= c;
      continue;
    }
    if (!i.sameMarkup(s))
      return { a: t, b: a };
    if (i.isText && i.text != s.text) {
      let u = 0, d = Math.min(i.text.length, s.text.length);
      for (; u < d && i.text[i.text.length - u - 1] == s.text[s.text.length - u - 1]; )
        u++, t--, a--;
      return { a: t, b: a };
    }
    if (i.content.size || s.content.size) {
      let u = Ea(i.content, s.content, t - 1, a - 1);
      if (u)
        return u;
    }
    t -= c, a -= c;
  }
}
class x {
  /**
  @internal
  */
  constructor(e, t) {
    if (this.content = e, this.size = t || 0, t == null)
      for (let a = 0; a < e.length; a++)
        this.size += e[a].nodeSize;
  }
  /**
  Invoke a callback for all descendant nodes between the given two
  positions (relative to start of this fragment). Doesn't descend
  into a node when the callback returns `false`.
  */
  nodesBetween(e, t, a, n = 0, o) {
    for (let i = 0, s = 0; s < t; i++) {
      let c = this.content[i], u = s + c.nodeSize;
      if (u > e && a(c, n + s, o || null, i) !== !1 && c.content.size) {
        let d = s + 1;
        c.nodesBetween(Math.max(0, e - d), Math.min(c.content.size, t - d), a, n + d);
      }
      s = u;
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
  textBetween(e, t, a, n) {
    let o = "", i = !0;
    return this.nodesBetween(e, t, (s, c) => {
      let u = s.isText ? s.text.slice(Math.max(e, c) - c, t - c) : s.isLeaf ? n ? typeof n == "function" ? n(s) : n : s.type.spec.leafText ? s.type.spec.leafText(s) : "" : "";
      s.isBlock && (s.isLeaf && u || s.isTextblock) && a && (i ? i = !1 : o += a), o += u;
    }, 0), o;
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
    let t = this.lastChild, a = e.firstChild, n = this.content.slice(), o = 0;
    for (t.isText && t.sameMarkup(a) && (n[n.length - 1] = t.withText(t.text + a.text), o = 1); o < e.content.length; o++)
      n.push(e.content[o]);
    return new x(n, this.size + e.size);
  }
  /**
  Cut out the sub-fragment between the two given positions.
  */
  cut(e, t = this.size) {
    if (e == 0 && t == this.size)
      return this;
    let a = [], n = 0;
    if (t > e)
      for (let o = 0, i = 0; i < t; o++) {
        let s = this.content[o], c = i + s.nodeSize;
        c > e && ((i < e || c > t) && (s.isText ? s = s.cut(Math.max(0, e - i), Math.min(s.text.length, t - i)) : s = s.cut(Math.max(0, e - i - 1), Math.min(s.content.size, t - i - 1))), a.push(s), n += s.nodeSize), i = c;
      }
    return new x(a, n);
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
    let a = this.content[e];
    if (a == t)
      return this;
    let n = this.content.slice(), o = this.size + t.nodeSize - a.nodeSize;
    return n[e] = t, new x(n, o);
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
    for (let t = 0, a = 0; t < this.content.length; t++) {
      let n = this.content[t];
      e(n, a, t), a += n.nodeSize;
    }
  }
  /**
  Find the first position at which this fragment and another
  fragment differ, or `null` if they are the same.
  */
  findDiffStart(e, t = 0) {
    return Ta(this, e, t);
  }
  /**
  Find the first position, searching from the end, at which this
  fragment and the given fragment differ, or `null` if they are
  the same. Since this position will not be the same in both
  nodes, an object with two separate positions is returned.
  */
  findDiffEnd(e, t = this.size, a = e.size) {
    return Ea(this, e, t, a);
  }
  /**
  Find the index and inner offset corresponding to a given relative
  position in this fragment. The result object will be reused
  (overwritten) the next time the function is called. @internal
  */
  findIndex(e) {
    if (e == 0)
      return mt(0, e);
    if (e == this.size)
      return mt(this.content.length, e);
    if (e > this.size || e < 0)
      throw new RangeError(`Position ${e} outside of fragment (${this})`);
    for (let t = 0, a = 0; ; t++) {
      let n = this.child(t), o = a + n.nodeSize;
      if (o >= e)
        return o == e ? mt(t + 1, o) : mt(t, a);
      a = o;
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
    let t, a = 0;
    for (let n = 0; n < e.length; n++) {
      let o = e[n];
      a += o.nodeSize, n && o.isText && e[n - 1].sameMarkup(o) ? (t || (t = e.slice(0, n)), t[t.length - 1] = o.withText(t[t.length - 1].text + o.text)) : t && t.push(o);
    }
    return new x(t || e, a);
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
const Ut = { index: 0, offset: 0 };
function mt(r, e) {
  return Ut.index = r, Ut.offset = e, Ut;
}
function Ct(r, e) {
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
    for (let a = 0; a < r.length; a++)
      if (!Ct(r[a], e[a]))
        return !1;
  } else {
    for (let a in r)
      if (!(a in e) || !Ct(r[a], e[a]))
        return !1;
    for (let a in e)
      if (!(a in r))
        return !1;
  }
  return !0;
}
class I {
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
    let t, a = !1;
    for (let n = 0; n < e.length; n++) {
      let o = e[n];
      if (this.eq(o))
        return e;
      if (this.type.excludes(o.type))
        t || (t = e.slice(0, n));
      else {
        if (o.type.excludes(this.type))
          return e;
        !a && o.type.rank > this.type.rank && (t || (t = e.slice(0, n)), t.push(this), a = !0), t && t.push(o);
      }
    }
    return t || (t = e.slice()), a || t.push(this), t;
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
    return this == e || this.type == e.type && Ct(this.attrs, e.attrs);
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
    let a = e.marks[t.type];
    if (!a)
      throw new RangeError(`There is no mark type ${t.type} in this schema`);
    let n = a.create(t.attrs);
    return a.checkAttrs(n.attrs), n;
  }
  /**
  Test whether two sets of marks are identical.
  */
  static sameSet(e, t) {
    if (e == t)
      return !0;
    if (e.length != t.length)
      return !1;
    for (let a = 0; a < e.length; a++)
      if (!e[a].eq(t[a]))
        return !1;
    return !0;
  }
  /**
  Create a properly sorted mark set from null, a single mark, or an
  unsorted array of marks.
  */
  static setFrom(e) {
    if (!e || Array.isArray(e) && e.length == 0)
      return I.none;
    if (e instanceof I)
      return [e];
    let t = e.slice();
    return t.sort((a, n) => a.type.rank - n.type.rank), t;
  }
}
I.none = [];
class Nt extends Error {
}
class S {
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
  constructor(e, t, a) {
    this.content = e, this.openStart = t, this.openEnd = a;
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
    let a = Ma(this.content, e + this.openStart, t);
    return a && new S(a, this.openStart, this.openEnd);
  }
  /**
  @internal
  */
  removeBetween(e, t) {
    return new S(La(this.content, e + this.openStart, t + this.openStart), this.openStart, this.openEnd);
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
      return S.empty;
    let a = t.openStart || 0, n = t.openEnd || 0;
    if (typeof a != "number" || typeof n != "number")
      throw new RangeError("Invalid input for Slice.fromJSON");
    return new S(x.fromJSON(e, t.content), a, n);
  }
  /**
  Create a slice from a fragment by taking the maximum possible
  open value on both side of the fragment.
  */
  static maxOpen(e, t = !0) {
    let a = 0, n = 0;
    for (let o = e.firstChild; o && !o.isLeaf && (t || !o.type.spec.isolating); o = o.firstChild)
      a++;
    for (let o = e.lastChild; o && !o.isLeaf && (t || !o.type.spec.isolating); o = o.lastChild)
      n++;
    return new S(e, a, n);
  }
}
S.empty = new S(x.empty, 0, 0);
function La(r, e, t) {
  let { index: a, offset: n } = r.findIndex(e), o = r.maybeChild(a), { index: i, offset: s } = r.findIndex(t);
  if (n == e || o.isText) {
    if (s != t && !r.child(i).isText)
      throw new RangeError("Removing non-flat range");
    return r.cut(0, e).append(r.cut(t));
  }
  if (a != i)
    throw new RangeError("Removing non-flat range");
  return r.replaceChild(a, o.copy(La(o.content, e - n - 1, t - n - 1)));
}
function Ma(r, e, t, a) {
  let { index: n, offset: o } = r.findIndex(e), i = r.maybeChild(n);
  if (o == e || i.isText)
    return a && !a.canReplace(n, n, t) ? null : r.cut(0, e).append(t).append(r.cut(e));
  let s = Ma(i.content, e - o - 1, t, i);
  return s && r.replaceChild(n, i.copy(s));
}
function Zo(r, e, t) {
  if (t.openStart > r.depth)
    throw new Nt("Inserted content deeper than insertion position");
  if (r.depth - t.openStart != e.depth - t.openEnd)
    throw new Nt("Inconsistent open depths");
  return Ia(r, e, t, 0);
}
function Ia(r, e, t, a) {
  let n = r.index(a), o = r.node(a);
  if (n == e.index(a) && a < r.depth - t.openStart) {
    let i = Ia(r, e, t, a + 1);
    return o.copy(o.content.replaceChild(n, i));
  } else if (t.content.size)
    if (!t.openStart && !t.openEnd && r.depth == a && e.depth == a) {
      let i = r.parent, s = i.content;
      return be(i, s.cut(0, r.parentOffset).append(t.content).append(s.cut(e.parentOffset)));
    } else {
      let { start: i, end: s } = Qo(t, r);
      return be(o, Ra(r, i, s, e, a));
    }
  else return be(o, At(r, e, a));
}
function Ha(r, e) {
  if (!e.type.compatibleContent(r.type))
    throw new Nt("Cannot join " + e.type.name + " onto " + r.type.name);
}
function Zt(r, e, t) {
  let a = r.node(t);
  return Ha(a, e.node(t)), a;
}
function ge(r, e) {
  let t = e.length - 1;
  t >= 0 && r.isText && r.sameMarkup(e[t]) ? e[t] = r.withText(e[t].text + r.text) : e.push(r);
}
function Ve(r, e, t, a) {
  let n = (e || r).node(t), o = 0, i = e ? e.index(t) : n.childCount;
  r && (o = r.index(t), r.depth > t ? o++ : r.textOffset && (ge(r.nodeAfter, a), o++));
  for (let s = o; s < i; s++)
    ge(n.child(s), a);
  e && e.depth == t && e.textOffset && ge(e.nodeBefore, a);
}
function be(r, e) {
  return r.type.checkContent(e), r.copy(e);
}
function Ra(r, e, t, a, n) {
  let o = r.depth > n && Zt(r, e, n + 1), i = a.depth > n && Zt(t, a, n + 1), s = [];
  return Ve(null, r, n, s), o && i && e.index(n) == t.index(n) ? (Ha(o, i), ge(be(o, Ra(r, e, t, a, n + 1)), s)) : (o && ge(be(o, At(r, e, n + 1)), s), Ve(e, t, n, s), i && ge(be(i, At(t, a, n + 1)), s)), Ve(a, null, n, s), new x(s);
}
function At(r, e, t) {
  let a = [];
  if (Ve(null, r, t, a), r.depth > t) {
    let n = Zt(r, e, t + 1);
    ge(be(n, At(r, e, t + 1)), a);
  }
  return Ve(e, null, t, a), new x(a);
}
function Qo(r, e) {
  let t = e.depth - r.openStart, n = e.node(t).copy(r.content);
  for (let o = t - 1; o >= 0; o--)
    n = e.node(o).copy(x.from(n));
  return {
    start: n.resolveNoCache(r.openStart + t),
    end: n.resolveNoCache(n.content.size - r.openEnd - t)
  };
}
class ot {
  /**
  @internal
  */
  constructor(e, t, a) {
    this.pos = e, this.path = t, this.parentOffset = a, this.depth = t.length / 3 - 1;
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
    let a = this.pos - this.path[this.path.length - 1], n = e.child(t);
    return a ? e.child(t).cut(a) : n;
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
    let a = this.path[t * 3], n = t == 0 ? 0 : this.path[t * 3 - 1] + 1;
    for (let o = 0; o < e; o++)
      n += a.child(o).nodeSize;
    return n;
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
      return I.none;
    if (this.textOffset)
      return e.child(t).marks;
    let a = e.maybeChild(t - 1), n = e.maybeChild(t);
    if (!a) {
      let s = a;
      a = n, n = s;
    }
    let o = a.marks;
    for (var i = 0; i < o.length; i++)
      o[i].type.spec.inclusive === !1 && (!n || !o[i].isInSet(n.marks)) && (o = o[i--].removeFromSet(o));
    return o;
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
    let a = t.marks, n = e.parent.maybeChild(e.index());
    for (var o = 0; o < a.length; o++)
      a[o].type.spec.inclusive === !1 && (!n || !a[o].isInSet(n.marks)) && (a = a[o--].removeFromSet(a));
    return a;
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
    for (let a = this.depth - (this.parent.inlineContent || this.pos == e.pos ? 1 : 0); a >= 0; a--)
      if (e.pos <= this.end(a) && (!t || t(this.node(a))))
        return new Tt(this, e, a);
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
    let a = [], n = 0, o = t;
    for (let i = e; ; ) {
      let { index: s, offset: c } = i.content.findIndex(o), u = o - c;
      if (a.push(i, s, n + c), !u || (i = i.child(s), i.isText))
        break;
      o = u - 1, n += c + 1;
    }
    return new ot(t, a, o);
  }
  /**
  @internal
  */
  static resolveCached(e, t) {
    let a = Br.get(e);
    if (a)
      for (let o = 0; o < a.elts.length; o++) {
        let i = a.elts[o];
        if (i.pos == t)
          return i;
      }
    else
      Br.set(e, a = new Xo());
    let n = a.elts[a.i] = ot.resolve(e, t);
    return a.i = (a.i + 1) % ei, n;
  }
}
class Xo {
  constructor() {
    this.elts = [], this.i = 0;
  }
}
const ei = 12, Br = /* @__PURE__ */ new WeakMap();
class Tt {
  /**
  Construct a node range. `$from` and `$to` should point into the
  same node until at least the given `depth`, since a node range
  denotes an adjacent set of nodes in a single parent node.
  */
  constructor(e, t, a) {
    this.$from = e, this.$to = t, this.depth = a;
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
const ti = /* @__PURE__ */ Object.create(null);
let ye = class Qt {
  /**
  @internal
  */
  constructor(e, t, a, n = I.none) {
    this.type = e, this.attrs = t, this.marks = n, this.content = a || x.empty;
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
  nodesBetween(e, t, a, n = 0) {
    this.content.nodesBetween(e, t, a, n, this);
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
  textBetween(e, t, a, n) {
    return this.content.textBetween(e, t, a, n);
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
  hasMarkup(e, t, a) {
    return this.type == e && Ct(this.attrs, t || e.defaultAttrs || ti) && I.sameSet(this.marks, a || I.none);
  }
  /**
  Create a new node with the same markup as this node, containing
  the given content (or empty, if no content is given).
  */
  copy(e = null) {
    return e == this.content ? this : new Qt(this.type, this.attrs, e, this.marks);
  }
  /**
  Create a copy of this node, with the given set of marks instead
  of the node's own marks.
  */
  mark(e) {
    return e == this.marks ? this : new Qt(this.type, this.attrs, this.content, e);
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
  slice(e, t = this.content.size, a = !1) {
    if (e == t)
      return S.empty;
    let n = this.resolve(e), o = this.resolve(t), i = a ? 0 : n.sharedDepth(t), s = n.start(i), u = n.node(i).content.cut(n.pos - s, o.pos - s);
    return new S(u, n.depth - i, o.depth - i);
  }
  /**
  Replace the part of the document between the given positions with
  the given slice. The slice must 'fit', meaning its open sides
  must be able to connect to the surrounding content, and its
  content nodes must be valid children for the node they are placed
  into. If any of this is violated, an error of type
  [`ReplaceError`](https://prosemirror.net/docs/ref/#model.ReplaceError) is thrown.
  */
  replace(e, t, a) {
    return Zo(this.resolve(e), this.resolve(t), a);
  }
  /**
  Find the node directly after the given position.
  */
  nodeAt(e) {
    for (let t = this; ; ) {
      let { index: a, offset: n } = t.content.findIndex(e);
      if (t = t.maybeChild(a), !t)
        return null;
      if (n == e || t.isText)
        return t;
      e -= n + 1;
    }
  }
  /**
  Find the (direct) child node after the given offset, if any,
  and return it along with its index and offset relative to this
  node.
  */
  childAfter(e) {
    let { index: t, offset: a } = this.content.findIndex(e);
    return { node: this.content.maybeChild(t), index: t, offset: a };
  }
  /**
  Find the (direct) child node before the given offset, if any,
  and return it along with its index and offset relative to this
  node.
  */
  childBefore(e) {
    if (e == 0)
      return { node: null, index: 0, offset: 0 };
    let { index: t, offset: a } = this.content.findIndex(e);
    if (a < e)
      return { node: this.content.child(t), index: t, offset: a };
    let n = this.content.child(t - 1);
    return { node: n, index: t - 1, offset: a - n.nodeSize };
  }
  /**
  Resolve the given position in the document, returning an
  [object](https://prosemirror.net/docs/ref/#model.ResolvedPos) with information about its context.
  */
  resolve(e) {
    return ot.resolveCached(this, e);
  }
  /**
  @internal
  */
  resolveNoCache(e) {
    return ot.resolve(this, e);
  }
  /**
  Test whether a given mark or mark type occurs in this document
  between the two given positions.
  */
  rangeHasMark(e, t, a) {
    let n = !1;
    return t > e && this.nodesBetween(e, t, (o) => (a.isInSet(o.marks) && (n = !0), !n)), n;
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
    return this.content.size && (e += "(" + this.content.toStringInner() + ")"), Pa(this.marks, e);
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
  canReplace(e, t, a = x.empty, n = 0, o = a.childCount) {
    let i = this.contentMatchAt(e).matchFragment(a, n, o), s = i && i.matchFragment(this.content, t);
    if (!s || !s.validEnd)
      return !1;
    for (let c = n; c < o; c++)
      if (!this.type.allowsMarks(a.child(c).marks))
        return !1;
    return !0;
  }
  /**
  Test whether replacing the range `from` to `to` (by index) with
  a node of the given type would leave the node's content valid.
  */
  canReplaceWith(e, t, a, n) {
    if (n && !this.type.allowsMarks(n))
      return !1;
    let o = this.contentMatchAt(e).matchType(a), i = o && o.matchFragment(this.content, t);
    return i ? i.validEnd : !1;
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
    let e = I.none;
    for (let t = 0; t < this.marks.length; t++) {
      let a = this.marks[t];
      a.type.checkAttrs(a.attrs), e = a.addToSet(e);
    }
    if (!I.sameSet(e, this.marks))
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
    let a;
    if (t.marks) {
      if (!Array.isArray(t.marks))
        throw new RangeError("Invalid mark data for Node.fromJSON");
      a = t.marks.map(e.markFromJSON);
    }
    if (t.type == "text") {
      if (typeof t.text != "string")
        throw new RangeError("Invalid text node in JSON");
      return e.text(t.text, a);
    }
    let n = x.fromJSON(e, t.content), o = e.nodeType(t.type).create(t.attrs, n, a);
    return o.type.checkAttrs(o.attrs), o;
  }
};
ye.prototype.text = void 0;
class Et extends ye {
  /**
  @internal
  */
  constructor(e, t, a, n) {
    if (super(e, t, null, n), !a)
      throw new RangeError("Empty text nodes are not allowed");
    this.text = a;
  }
  toString() {
    return this.type.spec.toDebugString ? this.type.spec.toDebugString(this) : Pa(this.marks, JSON.stringify(this.text));
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
    return e == this.marks ? this : new Et(this.type, this.attrs, this.text, e);
  }
  withText(e) {
    return e == this.text ? this : new Et(this.type, this.attrs, e, this.marks);
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
function Pa(r, e) {
  for (let t = r.length - 1; t >= 0; t--)
    e = r[t].type.name + "(" + e + ")";
  return e;
}
class ve {
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
    let a = new ri(e, t);
    if (a.next == null)
      return ve.empty;
    let n = Oa(a);
    a.next && a.err("Unexpected trailing text");
    let o = ci(li(n));
    return di(o, a), o;
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
  matchFragment(e, t = 0, a = e.childCount) {
    let n = this;
    for (let o = t; n && o < a; o++)
      n = n.matchType(e.child(o).type);
    return n;
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
      for (let a = 0; a < e.next.length; a++)
        if (this.next[t].type == e.next[a].type)
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
  fillBefore(e, t = !1, a = 0) {
    let n = [this];
    function o(i, s) {
      let c = i.matchFragment(e, a);
      if (c && (!t || c.validEnd))
        return x.from(s.map((u) => u.createAndFill()));
      for (let u = 0; u < i.next.length; u++) {
        let { type: d, next: h } = i.next[u];
        if (!(d.isText || d.hasRequiredAttrs()) && n.indexOf(h) == -1) {
          n.push(h);
          let m = o(h, s.concat(d));
          if (m)
            return m;
        }
      }
      return null;
    }
    return o(this, []);
  }
  /**
  Find a set of wrapping node types that would allow a node of the
  given type to appear at this position. The result may be empty
  (when it fits directly) and will be null when no such wrapping
  exists.
  */
  findWrapping(e) {
    for (let a = 0; a < this.wrapCache.length; a += 2)
      if (this.wrapCache[a] == e)
        return this.wrapCache[a + 1];
    let t = this.computeWrapping(e);
    return this.wrapCache.push(e, t), t;
  }
  /**
  @internal
  */
  computeWrapping(e) {
    let t = /* @__PURE__ */ Object.create(null), a = [{ match: this, type: null, via: null }];
    for (; a.length; ) {
      let n = a.shift(), o = n.match;
      if (o.matchType(e)) {
        let i = [];
        for (let s = n; s.type; s = s.via)
          i.push(s.type);
        return i.reverse();
      }
      for (let i = 0; i < o.next.length; i++) {
        let { type: s, next: c } = o.next[i];
        !s.isLeaf && !s.hasRequiredAttrs() && !(s.name in t) && (!n.type || c.validEnd) && (a.push({ match: s.contentMatch, type: s, via: n }), t[s.name] = !0);
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
    function t(a) {
      e.push(a);
      for (let n = 0; n < a.next.length; n++)
        e.indexOf(a.next[n].next) == -1 && t(a.next[n].next);
    }
    return t(this), e.map((a, n) => {
      let o = n + (a.validEnd ? "*" : " ") + " ";
      for (let i = 0; i < a.next.length; i++)
        o += (i ? ", " : "") + a.next[i].type.name + "->" + e.indexOf(a.next[i].next);
      return o;
    }).join(`
`);
  }
}
ve.empty = new ve(!0);
class ri {
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
function Oa(r) {
  let e = [];
  do
    e.push(ai(r));
  while (r.eat("|"));
  return e.length == 1 ? e[0] : { type: "choice", exprs: e };
}
function ai(r) {
  let e = [];
  do
    e.push(ni(r));
  while (r.next && r.next != ")" && r.next != "|");
  return e.length == 1 ? e[0] : { type: "seq", exprs: e };
}
function ni(r) {
  let e = si(r);
  for (; ; )
    if (r.eat("+"))
      e = { type: "plus", expr: e };
    else if (r.eat("*"))
      e = { type: "star", expr: e };
    else if (r.eat("?"))
      e = { type: "opt", expr: e };
    else if (r.eat("{"))
      e = oi(r, e);
    else
      break;
  return e;
}
function zr(r) {
  /\D/.test(r.next) && r.err("Expected number, got '" + r.next + "'");
  let e = Number(r.next);
  return r.pos++, e;
}
function oi(r, e) {
  let t = zr(r), a = t;
  return r.eat(",") && (r.next != "}" ? a = zr(r) : a = -1), r.eat("}") || r.err("Unclosed braced range"), { type: "range", min: t, max: a, expr: e };
}
function ii(r, e) {
  let t = r.nodeTypes, a = t[e];
  if (a)
    return [a];
  let n = [];
  for (let o in t) {
    let i = t[o];
    i.isInGroup(e) && n.push(i);
  }
  return n.length == 0 && r.err("No node type or group '" + e + "' found"), n;
}
function si(r) {
  if (r.eat("(")) {
    let e = Oa(r);
    return r.eat(")") || r.err("Missing closing paren"), e;
  } else if (/\W/.test(r.next))
    r.err("Unexpected token '" + r.next + "'");
  else {
    let e = ii(r, r.next).map((t) => (r.inline == null ? r.inline = t.isInline : r.inline != t.isInline && r.err("Mixing inline and block content"), { type: "name", value: t }));
    return r.pos++, e.length == 1 ? e[0] : { type: "choice", exprs: e };
  }
}
function li(r) {
  let e = [[]];
  return n(o(r, 0), t()), e;
  function t() {
    return e.push([]) - 1;
  }
  function a(i, s, c) {
    let u = { term: c, to: s };
    return e[i].push(u), u;
  }
  function n(i, s) {
    i.forEach((c) => c.to = s);
  }
  function o(i, s) {
    if (i.type == "choice")
      return i.exprs.reduce((c, u) => c.concat(o(u, s)), []);
    if (i.type == "seq")
      for (let c = 0; ; c++) {
        let u = o(i.exprs[c], s);
        if (c == i.exprs.length - 1)
          return u;
        n(u, s = t());
      }
    else if (i.type == "star") {
      let c = t();
      return a(s, c), n(o(i.expr, c), c), [a(c)];
    } else if (i.type == "plus") {
      let c = t();
      return n(o(i.expr, s), c), n(o(i.expr, c), c), [a(c)];
    } else {
      if (i.type == "opt")
        return [a(s)].concat(o(i.expr, s));
      if (i.type == "range") {
        let c = s;
        for (let u = 0; u < i.min; u++) {
          let d = t();
          n(o(i.expr, c), d), c = d;
        }
        if (i.max == -1)
          n(o(i.expr, c), c);
        else
          for (let u = i.min; u < i.max; u++) {
            let d = t();
            a(c, d), n(o(i.expr, c), d), c = d;
          }
        return [a(c)];
      } else {
        if (i.type == "name")
          return [a(s, void 0, i.value)];
        throw new Error("Unknown expr type");
      }
    }
  }
}
function Ba(r, e) {
  return e - r;
}
function $r(r, e) {
  let t = [];
  return a(e), t.sort(Ba);
  function a(n) {
    let o = r[n];
    if (o.length == 1 && !o[0].term)
      return a(o[0].to);
    t.push(n);
    for (let i = 0; i < o.length; i++) {
      let { term: s, to: c } = o[i];
      !s && t.indexOf(c) == -1 && a(c);
    }
  }
}
function ci(r) {
  let e = /* @__PURE__ */ Object.create(null);
  return t($r(r, 0));
  function t(a) {
    let n = [];
    a.forEach((i) => {
      r[i].forEach(({ term: s, to: c }) => {
        if (!s)
          return;
        let u;
        for (let d = 0; d < n.length; d++)
          n[d][0] == s && (u = n[d][1]);
        $r(r, c).forEach((d) => {
          u || n.push([s, u = []]), u.indexOf(d) == -1 && u.push(d);
        });
      });
    });
    let o = e[a.join(",")] = new ve(a.indexOf(r.length - 1) > -1);
    for (let i = 0; i < n.length; i++) {
      let s = n[i][1].sort(Ba);
      o.next.push({ type: n[i][0], next: e[s.join(",")] || t(s) });
    }
    return o;
  }
}
function di(r, e) {
  for (let t = 0, a = [r]; t < a.length; t++) {
    let n = a[t], o = !n.validEnd, i = [];
    for (let s = 0; s < n.next.length; s++) {
      let { type: c, next: u } = n.next[s];
      i.push(c.name), o && !(c.isText || c.hasRequiredAttrs()) && (o = !1), a.indexOf(u) == -1 && a.push(u);
    }
    o && e.err("Only non-generatable nodes (" + i.join(", ") + ") in a required position (see https://prosemirror.net/docs/guide/#generatable)");
  }
}
function za(r) {
  let e = /* @__PURE__ */ Object.create(null);
  for (let t in r) {
    let a = r[t];
    if (!a.hasDefault)
      return null;
    e[t] = a.default;
  }
  return e;
}
function $a(r, e) {
  let t = /* @__PURE__ */ Object.create(null);
  for (let a in r) {
    let n = e && e[a];
    if (n === void 0) {
      let o = r[a];
      if (o.hasDefault)
        n = o.default;
      else
        throw new RangeError("No value supplied for attribute " + a);
    }
    t[a] = n;
  }
  return t;
}
function Ua(r, e, t, a) {
  for (let n in e)
    if (!(n in r))
      throw new RangeError(`Unsupported attribute ${n} for ${t} of type ${n}`);
  for (let n in r) {
    let o = r[n];
    o.validate && o.validate(e[n]);
  }
}
function Fa(r, e) {
  let t = /* @__PURE__ */ Object.create(null);
  if (e)
    for (let a in e)
      t[a] = new pi(r, a, e[a]);
  return t;
}
class Lt {
  /**
  @internal
  */
  constructor(e, t, a) {
    this.name = e, this.schema = t, this.spec = a, this.markSet = null, this.groups = a.group ? a.group.split(" ") : [], this.attrs = Fa(e, a.attrs), this.defaultAttrs = za(this.attrs), this.contentMatch = null, this.inlineContent = null, this.isBlock = !(a.inline || e == "text"), this.isText = e == "text";
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
    return this.contentMatch == ve.empty;
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
    return !e && this.defaultAttrs ? this.defaultAttrs : $a(this.attrs, e);
  }
  /**
  Create a `Node` of this type. The given attributes are
  checked and defaulted (you can pass `null` to use the type's
  defaults entirely, if no required attributes exist). `content`
  may be a `Fragment`, a node, an array of nodes, or
  `null`. Similarly `marks` may be `null` to default to the empty
  set of marks.
  */
  create(e = null, t, a) {
    if (this.isText)
      throw new Error("NodeType.create can't construct text nodes");
    return new ye(this, this.computeAttrs(e), x.from(t), I.setFrom(a));
  }
  /**
  Like [`create`](https://prosemirror.net/docs/ref/#model.NodeType.create), but check the given content
  against the node type's content restrictions, and throw an error
  if it doesn't match.
  */
  createChecked(e = null, t, a) {
    return t = x.from(t), this.checkContent(t), new ye(this, this.computeAttrs(e), t, I.setFrom(a));
  }
  /**
  Like [`create`](https://prosemirror.net/docs/ref/#model.NodeType.create), but see if it is
  necessary to add nodes to the start or end of the given fragment
  to make it fit the node. If no fitting wrapping can be found,
  return null. Note that, due to the fact that required nodes can
  always be created, this will always succeed if you pass null or
  `Fragment.empty` as content.
  */
  createAndFill(e = null, t, a) {
    if (e = this.computeAttrs(e), t = x.from(t), t.size) {
      let i = this.contentMatch.fillBefore(t);
      if (!i)
        return null;
      t = i.append(t);
    }
    let n = this.contentMatch.matchFragment(t), o = n && n.fillBefore(x.empty, !0);
    return o ? new ye(this, e, t.append(o), I.setFrom(a)) : null;
  }
  /**
  Returns true if the given fragment is valid content for this node
  type.
  */
  validContent(e) {
    let t = this.contentMatch.matchFragment(e);
    if (!t || !t.validEnd)
      return !1;
    for (let a = 0; a < e.childCount; a++)
      if (!this.allowsMarks(e.child(a).marks))
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
    Ua(this.attrs, e, "node", this.name);
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
    for (let a = 0; a < e.length; a++)
      this.allowsMarkType(e[a].type) ? t && t.push(e[a]) : t || (t = e.slice(0, a));
    return t ? t.length ? t : I.none : e;
  }
  /**
  @internal
  */
  static compile(e, t) {
    let a = /* @__PURE__ */ Object.create(null);
    e.forEach((o, i) => a[o] = new Lt(o, t, i));
    let n = t.spec.topNode || "doc";
    if (!a[n])
      throw new RangeError("Schema is missing its top node type ('" + n + "')");
    if (!a.text)
      throw new RangeError("Every schema needs a 'text' type");
    for (let o in a.text.attrs)
      throw new RangeError("The text node type should not have attributes");
    return a;
  }
}
function ui(r, e, t) {
  let a = t.split("|");
  return (n) => {
    let o = n === null ? "null" : typeof n;
    if (a.indexOf(o) < 0)
      throw new RangeError(`Expected value of type ${a} for attribute ${e} on type ${r}, got ${o}`);
  };
}
class pi {
  constructor(e, t, a) {
    this.hasDefault = Object.prototype.hasOwnProperty.call(a, "default"), this.default = a.default, this.validate = typeof a.validate == "string" ? ui(e, t, a.validate) : a.validate;
  }
  get isRequired() {
    return !this.hasDefault;
  }
}
class ir {
  /**
  @internal
  */
  constructor(e, t, a, n) {
    this.name = e, this.rank = t, this.schema = a, this.spec = n, this.attrs = Fa(e, n.attrs), this.excluded = null;
    let o = za(this.attrs);
    this.instance = o ? new I(this, o) : null;
  }
  /**
  Create a mark of this type. `attrs` may be `null` or an object
  containing only some of the mark's attributes. The others, if
  they have defaults, will be added.
  */
  create(e = null) {
    return !e && this.instance ? this.instance : new I(this, $a(this.attrs, e));
  }
  /**
  @internal
  */
  static compile(e, t) {
    let a = /* @__PURE__ */ Object.create(null), n = 0;
    return e.forEach((o, i) => a[o] = new ir(o, n++, t, i)), a;
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
    Ua(this.attrs, e, "mark", this.name);
  }
  /**
  Queries whether a given mark type is
  [excluded](https://prosemirror.net/docs/ref/#model.MarkSpec.excludes) by this one.
  */
  excludes(e) {
    return this.excluded.indexOf(e) > -1;
  }
}
class hi {
  /**
  Construct a schema from a schema [specification](https://prosemirror.net/docs/ref/#model.SchemaSpec).
  */
  constructor(e) {
    this.linebreakReplacement = null, this.cached = /* @__PURE__ */ Object.create(null);
    let t = this.spec = {};
    for (let n in e)
      t[n] = e[n];
    t.nodes = F.from(e.nodes), t.marks = F.from(e.marks || {}), this.nodes = Lt.compile(this.spec.nodes, this), this.marks = ir.compile(this.spec.marks, this);
    let a = /* @__PURE__ */ Object.create(null);
    for (let n in this.nodes) {
      if (n in this.marks)
        throw new RangeError(n + " can not be both a node and a mark");
      let o = this.nodes[n], i = o.spec.content || "", s = o.spec.marks;
      if (o.contentMatch = a[i] || (a[i] = ve.parse(i, this.nodes)), o.inlineContent = o.contentMatch.inlineContent, o.spec.linebreakReplacement) {
        if (this.linebreakReplacement)
          throw new RangeError("Multiple linebreak nodes defined");
        if (!o.isInline || !o.isLeaf)
          throw new RangeError("Linebreak replacement nodes must be inline leaf nodes");
        this.linebreakReplacement = o;
      }
      o.markSet = s == "_" ? null : s ? Ur(this, s.split(" ")) : s == "" || !o.inlineContent ? [] : null;
    }
    for (let n in this.marks) {
      let o = this.marks[n], i = o.spec.excludes;
      o.excluded = i == null ? [o] : i == "" ? [] : Ur(this, i.split(" "));
    }
    this.nodeFromJSON = (n) => ye.fromJSON(this, n), this.markFromJSON = (n) => I.fromJSON(this, n), this.topNodeType = this.nodes[this.spec.topNode || "doc"], this.cached.wrappings = /* @__PURE__ */ Object.create(null);
  }
  /**
  Create a node in this schema. The `type` may be a string or a
  `NodeType` instance. Attributes will be extended with defaults,
  `content` may be a `Fragment`, `null`, a `Node`, or an array of
  nodes.
  */
  node(e, t = null, a, n) {
    if (typeof e == "string")
      e = this.nodeType(e);
    else if (e instanceof Lt) {
      if (e.schema != this)
        throw new RangeError("Node type from different schema used (" + e.name + ")");
    } else throw new RangeError("Invalid node type: " + e);
    return e.createChecked(t, a, n);
  }
  /**
  Create a text node in the schema. Empty text nodes are not
  allowed.
  */
  text(e, t) {
    let a = this.nodes.text;
    return new Et(a, a.defaultAttrs, e, I.setFrom(t));
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
function Ur(r, e) {
  let t = [];
  for (let a = 0; a < e.length; a++) {
    let n = e[a], o = r.marks[n], i = o;
    if (o)
      t.push(o);
    else
      for (let s in r.marks) {
        let c = r.marks[s];
        (n == "_" || c.spec.group && c.spec.group.split(" ").indexOf(n) > -1) && t.push(i = c);
      }
    if (!i)
      throw new SyntaxError("Unknown mark type: '" + e[a] + "'");
  }
  return t;
}
function mi(r) {
  return r.tag != null;
}
function fi(r) {
  return r.style != null;
}
class Te {
  /**
  Create a parser that targets the given schema, using the given
  parsing rules.
  */
  constructor(e, t) {
    this.schema = e, this.rules = t, this.tags = [], this.styles = [];
    let a = this.matchedStyles = [];
    t.forEach((n) => {
      if (mi(n))
        this.tags.push(n);
      else if (fi(n)) {
        let o = /[^=]*/.exec(n.style)[0];
        a.indexOf(o) < 0 && a.push(o), this.styles.push(n);
      }
    }), this.normalizeLists = !this.tags.some((n) => {
      if (!/^(ul|ol)\b/.test(n.tag) || !n.node)
        return !1;
      let o = e.nodes[n.node];
      return o.contentMatch.matchType(o);
    });
  }
  /**
  Parse a document from the content of a DOM node.
  */
  parse(e, t = {}) {
    let a = new jr(this, t, !1);
    return a.addAll(e, I.none, t.from, t.to), a.finish();
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
    let a = new jr(this, t, !0);
    return a.addAll(e, I.none, t.from, t.to), S.maxOpen(a.finish());
  }
  /**
  @internal
  */
  matchTag(e, t, a) {
    for (let n = a ? this.tags.indexOf(a) + 1 : 0; n < this.tags.length; n++) {
      let o = this.tags[n];
      if (yi(e, o.tag) && (o.namespace === void 0 || e.namespaceURI == o.namespace) && (!o.context || t.matchesContext(o.context))) {
        if (o.getAttrs) {
          let i = o.getAttrs(e);
          if (i === !1)
            continue;
          o.attrs = i || void 0;
        }
        return o;
      }
    }
  }
  /**
  @internal
  */
  matchStyle(e, t, a, n) {
    for (let o = n ? this.styles.indexOf(n) + 1 : 0; o < this.styles.length; o++) {
      let i = this.styles[o], s = i.style;
      if (!(s.indexOf(e) != 0 || i.context && !a.matchesContext(i.context) || // Test that the style string either precisely matches the prop,
      // or has an '=' sign after the prop, followed by the given
      // value.
      s.length > e.length && (s.charCodeAt(e.length) != 61 || s.slice(e.length + 1) != t))) {
        if (i.getAttrs) {
          let c = i.getAttrs(t);
          if (c === !1)
            continue;
          i.attrs = c || void 0;
        }
        return i;
      }
    }
  }
  /**
  @internal
  */
  static schemaRules(e) {
    let t = [];
    function a(n) {
      let o = n.priority == null ? 50 : n.priority, i = 0;
      for (; i < t.length; i++) {
        let s = t[i];
        if ((s.priority == null ? 50 : s.priority) < o)
          break;
      }
      t.splice(i, 0, n);
    }
    for (let n in e.marks) {
      let o = e.marks[n].spec.parseDOM;
      o && o.forEach((i) => {
        a(i = Dr(i)), i.mark || i.ignore || i.clearMark || (i.mark = n);
      });
    }
    for (let n in e.nodes) {
      let o = e.nodes[n].spec.parseDOM;
      o && o.forEach((i) => {
        a(i = Dr(i)), i.node || i.ignore || i.mark || (i.node = n);
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
    return e.cached.domParser || (e.cached.domParser = new Te(e, Te.schemaRules(e)));
  }
}
const ja = {
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
}, gi = {
  head: !0,
  noscript: !0,
  object: !0,
  script: !0,
  style: !0,
  title: !0
}, Da = { ol: !0, ul: !0 }, it = 1, Xt = 2, qe = 4;
function Fr(r, e, t) {
  return e != null ? (e ? it : 0) | (e === "full" ? Xt : 0) : r && r.whitespace == "pre" ? it | Xt : t & ~qe;
}
class ft {
  constructor(e, t, a, n, o, i) {
    this.type = e, this.attrs = t, this.marks = a, this.solid = n, this.options = i, this.content = [], this.activeMarks = I.none, this.match = o || (i & qe ? null : e.contentMatch);
  }
  findWrapping(e) {
    if (!this.match) {
      if (!this.type)
        return [];
      let t = this.type.contentMatch.fillBefore(x.from(e));
      if (t)
        this.match = this.type.contentMatch.matchFragment(t);
      else {
        let a = this.type.contentMatch, n;
        return (n = a.findWrapping(e.type)) ? (this.match = a, n) : null;
      }
    }
    return this.match.findWrapping(e.type);
  }
  finish(e) {
    if (!(this.options & it)) {
      let a = this.content[this.content.length - 1], n;
      if (a && a.isText && (n = /[ \t\r\n\u000c]+$/.exec(a.text))) {
        let o = a;
        a.text.length == n[0].length ? this.content.pop() : this.content[this.content.length - 1] = o.withText(o.text.slice(0, o.text.length - n[0].length));
      }
    }
    let t = x.from(this.content);
    return !e && this.match && (t = t.append(this.match.fillBefore(x.empty, !0))), this.type ? this.type.create(this.attrs, t, this.marks) : t;
  }
  inlineContext(e) {
    return this.type ? this.type.inlineContent : this.content.length ? this.content[0].isInline : e.parentNode && !ja.hasOwnProperty(e.parentNode.nodeName.toLowerCase());
  }
}
class jr {
  constructor(e, t, a) {
    this.parser = e, this.options = t, this.isOpen = a, this.open = 0, this.localPreserveWS = !1;
    let n = t.topNode, o, i = Fr(null, t.preserveWhitespace, 0) | (a ? qe : 0);
    n ? o = new ft(n.type, n.attrs, I.none, !0, t.topMatch || n.type.contentMatch, i) : a ? o = new ft(null, null, I.none, !0, null, i) : o = new ft(e.schema.topNodeType, null, I.none, !0, null, i), this.nodes = [o], this.find = t.findPositions, this.needsBlock = !1;
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
    let a = e.nodeValue, n = this.top, o = n.options & Xt ? "full" : this.localPreserveWS || (n.options & it) > 0, { schema: i } = this.parser;
    if (o === "full" || n.inlineContext(e) || /[^ \t\r\n\u000c]/.test(a)) {
      if (o)
        if (o === "full")
          a = a.replace(/\r\n?/g, `
`);
        else if (i.linebreakReplacement && /[\r\n]/.test(a) && this.top.findWrapping(i.linebreakReplacement.create())) {
          let s = a.split(/\r?\n|\r/);
          for (let c = 0; c < s.length; c++)
            c && this.insertNode(i.linebreakReplacement.create(), t, !0), s[c] && this.insertNode(i.text(s[c]), t, !/\S/.test(s[c]));
          a = "";
        } else
          a = a.replace(/\r?\n|\r/g, " ");
      else if (a = a.replace(/[ \t\r\n\u000c]+/g, " "), /^[ \t\r\n\u000c]/.test(a) && this.open == this.nodes.length - 1) {
        let s = n.content[n.content.length - 1], c = e.previousSibling;
        (!s || c && c.nodeName == "BR" || s.isText && /[ \t\r\n\u000c]$/.test(s.text)) && (a = a.slice(1));
      }
      a && this.insertNode(i.text(a), t, !/\S/.test(a)), this.findInText(e);
    } else
      this.findInside(e);
  }
  // Try to find a handler for the given tag and use that to parse. If
  // none is found, the element's content nodes are added directly.
  addElement(e, t, a) {
    let n = this.localPreserveWS, o = this.top;
    (e.tagName == "PRE" || /pre/.test(e.style && e.style.whiteSpace)) && (this.localPreserveWS = !0);
    let i = e.nodeName.toLowerCase(), s;
    Da.hasOwnProperty(i) && this.parser.normalizeLists && bi(e);
    let c = this.options.ruleFromNode && this.options.ruleFromNode(e) || (s = this.parser.matchTag(e, this, a));
    e: if (c ? c.ignore : gi.hasOwnProperty(i))
      this.findInside(e), this.ignoreFallback(e, t);
    else if (!c || c.skip || c.closeParent) {
      c && c.closeParent ? this.open = Math.max(0, this.open - 1) : c && c.skip.nodeType && (e = c.skip);
      let u, d = this.needsBlock;
      if (ja.hasOwnProperty(i))
        o.content.length && o.content[0].isInline && this.open && (this.open--, o = this.top), u = !0, o.type || (this.needsBlock = !0);
      else if (!e.firstChild) {
        this.leafFallback(e, t);
        break e;
      }
      let h = c && c.skip ? t : this.readStyles(e, t);
      h && this.addAll(e, h), u && this.sync(o), this.needsBlock = d;
    } else {
      let u = this.readStyles(e, t);
      u && this.addElementByRule(e, c, u, c.consuming === !1 ? s : void 0);
    }
    this.localPreserveWS = n;
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
    let a = e.style;
    if (a && a.length)
      for (let n = 0; n < this.parser.matchedStyles.length; n++) {
        let o = this.parser.matchedStyles[n], i = a.getPropertyValue(o);
        if (i)
          for (let s = void 0; ; ) {
            let c = this.parser.matchStyle(o, i, this, s);
            if (!c)
              break;
            if (c.ignore)
              return null;
            if (c.clearMark ? t = t.filter((u) => !c.clearMark(u)) : t = t.concat(this.parser.schema.marks[c.mark].create(c.attrs)), c.consuming === !1)
              s = c;
            else
              break;
          }
      }
    return t;
  }
  // Look up a handler for the given node. If none are found, return
  // false. Otherwise, apply it, use its return value to drive the way
  // the node's content is wrapped, and return true.
  addElementByRule(e, t, a, n) {
    let o, i;
    if (t.node)
      if (i = this.parser.schema.nodes[t.node], i.isLeaf)
        this.insertNode(i.create(t.attrs), a, e.nodeName == "BR") || this.leafFallback(e, a);
      else {
        let c = this.enter(i, t.attrs || null, a, t.preserveWhitespace);
        c && (o = !0, a = c);
      }
    else {
      let c = this.parser.schema.marks[t.mark];
      a = a.concat(c.create(t.attrs));
    }
    let s = this.top;
    if (i && i.isLeaf)
      this.findInside(e);
    else if (n)
      this.addElement(e, a, n);
    else if (t.getContent)
      this.findInside(e), t.getContent(e, this.parser.schema).forEach((c) => this.insertNode(c, a, !1));
    else {
      let c = e;
      typeof t.contentElement == "string" ? c = e.querySelector(t.contentElement) : typeof t.contentElement == "function" ? c = t.contentElement(e) : t.contentElement && (c = t.contentElement), this.findAround(e, c, !0), this.addAll(c, a), this.findAround(e, c, !1);
    }
    o && this.sync(s) && this.open--;
  }
  // Add all child nodes between `startIndex` and `endIndex` (or the
  // whole node, if not given). If `sync` is passed, use it to
  // synchronize after every block element.
  addAll(e, t, a, n) {
    let o = a || 0;
    for (let i = a ? e.childNodes[a] : e.firstChild, s = n == null ? null : e.childNodes[n]; i != s; i = i.nextSibling, ++o)
      this.findAtPoint(e, o), this.addDOM(i, t);
    this.findAtPoint(e, o);
  }
  // Try to find a way to fit the given node type into the current
  // context. May add intermediate wrappers and/or leave non-solid
  // nodes that we're in.
  findPlace(e, t, a) {
    let n, o;
    for (let i = this.open, s = 0; i >= 0; i--) {
      let c = this.nodes[i], u = c.findWrapping(e);
      if (u && (!n || n.length > u.length + s) && (n = u, o = c, !u.length))
        break;
      if (c.solid) {
        if (a)
          break;
        s += 2;
      }
    }
    if (!n)
      return null;
    this.sync(o);
    for (let i = 0; i < n.length; i++)
      t = this.enterInner(n[i], null, t, !1);
    return t;
  }
  // Try to insert the given node, adjusting the context when needed.
  insertNode(e, t, a) {
    if (e.isInline && this.needsBlock && !this.top.type) {
      let o = this.textblockFromContext();
      o && (t = this.enterInner(o, null, t));
    }
    let n = this.findPlace(e, t, a);
    if (n) {
      this.closeExtra();
      let o = this.top;
      o.match && (o.match = o.match.matchType(e.type));
      let i = I.none;
      for (let s of n.concat(e.marks))
        (o.type ? o.type.allowsMarkType(s.type) : Vr(s.type, e.type)) && (i = s.addToSet(i));
      return o.content.push(e.mark(i)), !0;
    }
    return !1;
  }
  // Try to start a node of the given type, adjusting the context when
  // necessary.
  enter(e, t, a, n) {
    let o = this.findPlace(e.create(t), a, !1);
    return o && (o = this.enterInner(e, t, a, !0, n)), o;
  }
  // Open a node of the given type
  enterInner(e, t, a, n = !1, o) {
    this.closeExtra();
    let i = this.top;
    i.match = i.match && i.match.matchType(e);
    let s = Fr(e, o, i.options);
    i.options & qe && i.content.length == 0 && (s |= qe);
    let c = I.none;
    return a = a.filter((u) => (i.type ? i.type.allowsMarkType(u.type) : Vr(u.type, e)) ? (c = u.addToSet(c), !1) : !0), this.nodes.push(new ft(e, t, c, n, null, s)), this.open++, a;
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
      this.localPreserveWS && (this.nodes[t].options |= it);
    }
    return !1;
  }
  get currentPos() {
    this.closeExtra();
    let e = 0;
    for (let t = this.open; t >= 0; t--) {
      let a = this.nodes[t].content;
      for (let n = a.length - 1; n >= 0; n--)
        e += a[n].nodeSize;
      t && e++;
    }
    return e;
  }
  findAtPoint(e, t) {
    if (this.find)
      for (let a = 0; a < this.find.length; a++)
        this.find[a].node == e && this.find[a].offset == t && (this.find[a].pos = this.currentPos);
  }
  findInside(e) {
    if (this.find)
      for (let t = 0; t < this.find.length; t++)
        this.find[t].pos == null && e.nodeType == 1 && e.contains(this.find[t].node) && (this.find[t].pos = this.currentPos);
  }
  findAround(e, t, a) {
    if (e != t && this.find)
      for (let n = 0; n < this.find.length; n++)
        this.find[n].pos == null && e.nodeType == 1 && e.contains(this.find[n].node) && t.compareDocumentPosition(this.find[n].node) & (a ? 2 : 4) && (this.find[n].pos = this.currentPos);
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
    let t = e.split("/"), a = this.options.context, n = !this.isOpen && (!a || a.parent.type == this.nodes[0].type), o = -(a ? a.depth + 1 : 0) + (n ? 0 : 1), i = (s, c) => {
      for (; s >= 0; s--) {
        let u = t[s];
        if (u == "") {
          if (s == t.length - 1 || s == 0)
            continue;
          for (; c >= o; c--)
            if (i(s - 1, c))
              return !0;
          return !1;
        } else {
          let d = c > 0 || c == 0 && n ? this.nodes[c].type : a && c >= o ? a.node(c - o).type : null;
          if (!d || d.name != u && !d.isInGroup(u))
            return !1;
          c--;
        }
      }
      return !0;
    };
    return i(t.length - 1, this.open);
  }
  textblockFromContext() {
    let e = this.options.context;
    if (e)
      for (let t = e.depth; t >= 0; t--) {
        let a = e.node(t).contentMatchAt(e.indexAfter(t)).defaultType;
        if (a && a.isTextblock && a.defaultAttrs)
          return a;
      }
    for (let t in this.parser.schema.nodes) {
      let a = this.parser.schema.nodes[t];
      if (a.isTextblock && a.defaultAttrs)
        return a;
    }
  }
}
function bi(r) {
  for (let e = r.firstChild, t = null; e; e = e.nextSibling) {
    let a = e.nodeType == 1 ? e.nodeName.toLowerCase() : null;
    a && Da.hasOwnProperty(a) && t ? (t.appendChild(e), e = t) : a == "li" ? t = e : a && (t = null);
  }
}
function yi(r, e) {
  return (r.matches || r.msMatchesSelector || r.webkitMatchesSelector || r.mozMatchesSelector).call(r, e);
}
function Dr(r) {
  let e = {};
  for (let t in r)
    e[t] = r[t];
  return e;
}
function Vr(r, e) {
  let t = e.schema.nodes;
  for (let a in t) {
    let n = t[a];
    if (!n.allowsMarkType(r))
      continue;
    let o = [], i = (s) => {
      o.push(s);
      for (let c = 0; c < s.edgeCount; c++) {
        let { type: u, next: d } = s.edge(c);
        if (u == e || o.indexOf(d) < 0 && i(d))
          return !0;
      }
    };
    if (i(n.contentMatch))
      return !0;
  }
}
const Va = 65535, qa = Math.pow(2, 16);
function vi(r, e) {
  return r + e * qa;
}
function qr(r) {
  return r & Va;
}
function wi(r) {
  return (r - (r & Va)) / qa;
}
const _a = 1, Ga = 2, vt = 4, Ja = 8;
class _r {
  /**
  @internal
  */
  constructor(e, t, a) {
    this.pos = e, this.delInfo = t, this.recover = a;
  }
  /**
  Tells you whether the position was deleted, that is, whether the
  step removed the token on the side queried (via the `assoc`)
  argument from the document.
  */
  get deleted() {
    return (this.delInfo & Ja) > 0;
  }
  /**
  Tells you whether the token before the mapped position was deleted.
  */
  get deletedBefore() {
    return (this.delInfo & (_a | vt)) > 0;
  }
  /**
  True when the token after the mapped position was deleted.
  */
  get deletedAfter() {
    return (this.delInfo & (Ga | vt)) > 0;
  }
  /**
  Tells whether any of the steps mapped through deletes across the
  position (including both the token before and after the
  position).
  */
  get deletedAcross() {
    return (this.delInfo & vt) > 0;
  }
}
class W {
  /**
  Create a position map. The modifications to the document are
  represented as an array of numbers, in which each group of three
  represents a modified chunk as `[start, oldSize, newSize]`.
  */
  constructor(e, t = !1) {
    if (this.ranges = e, this.inverted = t, !e.length && W.empty)
      return W.empty;
  }
  /**
  @internal
  */
  recover(e) {
    let t = 0, a = qr(e);
    if (!this.inverted)
      for (let n = 0; n < a; n++)
        t += this.ranges[n * 3 + 2] - this.ranges[n * 3 + 1];
    return this.ranges[a * 3] + t + wi(e);
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
  _map(e, t, a) {
    let n = 0, o = this.inverted ? 2 : 1, i = this.inverted ? 1 : 2;
    for (let s = 0; s < this.ranges.length; s += 3) {
      let c = this.ranges[s] - (this.inverted ? n : 0);
      if (c > e)
        break;
      let u = this.ranges[s + o], d = this.ranges[s + i], h = c + u;
      if (e <= h) {
        let m = u ? e == c ? -1 : e == h ? 1 : t : t, f = c + n + (m < 0 ? 0 : d);
        if (a)
          return f;
        let b = e == (t < 0 ? c : h) ? null : vi(s / 3, e - c), g = e == c ? Ga : e == h ? _a : vt;
        return (t < 0 ? e != c : e != h) && (g |= Ja), new _r(f, g, b);
      }
      n += d - u;
    }
    return a ? e + n : new _r(e + n, 0, null);
  }
  /**
  @internal
  */
  touches(e, t) {
    let a = 0, n = qr(t), o = this.inverted ? 2 : 1, i = this.inverted ? 1 : 2;
    for (let s = 0; s < this.ranges.length; s += 3) {
      let c = this.ranges[s] - (this.inverted ? a : 0);
      if (c > e)
        break;
      let u = this.ranges[s + o], d = c + u;
      if (e <= d && s == n * 3)
        return !0;
      a += this.ranges[s + i] - u;
    }
    return !1;
  }
  /**
  Calls the given function on each of the changed ranges included in
  this map.
  */
  forEach(e) {
    let t = this.inverted ? 2 : 1, a = this.inverted ? 1 : 2;
    for (let n = 0, o = 0; n < this.ranges.length; n += 3) {
      let i = this.ranges[n], s = i - (this.inverted ? o : 0), c = i + (this.inverted ? 0 : o), u = this.ranges[n + t], d = this.ranges[n + a];
      e(s, s + u, c, c + d), o += d - u;
    }
  }
  /**
  Create an inverted version of this map. The result can be used to
  map positions in the post-step document to the pre-step document.
  */
  invert() {
    return new W(this.ranges, !this.inverted);
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
    return e == 0 ? W.empty : new W(e < 0 ? [0, -e, 0] : [0, 0, e]);
  }
}
W.empty = new W([]);
const Ft = /* @__PURE__ */ Object.create(null);
class V {
  /**
  Get the step map that represents the changes made by this step,
  and which can be used to transform between positions in the old
  and the new document.
  */
  getMap() {
    return W.empty;
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
    let a = Ft[t.stepType];
    if (!a)
      throw new RangeError(`No step type ${t.stepType} defined`);
    return a.fromJSON(e, t);
  }
  /**
  To be able to serialize steps to JSON, each step needs a string
  ID to attach to its JSON representation. Use this method to
  register an ID for your step classes. Try to pick something
  that's unlikely to clash with steps from other modules.
  */
  static jsonID(e, t) {
    if (e in Ft)
      throw new RangeError("Duplicate use of step JSON ID " + e);
    return Ft[e] = t, t.prototype.jsonID = e, t;
  }
}
class z {
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
    return new z(e, null);
  }
  /**
  Create a failed step result.
  */
  static fail(e) {
    return new z(null, e);
  }
  /**
  Call [`Node.replace`](https://prosemirror.net/docs/ref/#model.Node.replace) with the given
  arguments. Create a successful result if it succeeds, and a
  failed one if it throws a `ReplaceError`.
  */
  static fromReplace(e, t, a, n) {
    try {
      return z.ok(e.replace(t, a, n));
    } catch (o) {
      if (o instanceof Nt)
        return z.fail(o.message);
      throw o;
    }
  }
}
function sr(r, e, t) {
  let a = [];
  for (let n = 0; n < r.childCount; n++) {
    let o = r.child(n);
    o.content.size && (o = o.copy(sr(o.content, e, o))), o.isInline && (o = e(o, t, n)), a.push(o);
  }
  return x.fromArray(a);
}
class pe extends V {
  /**
  Create a mark step.
  */
  constructor(e, t, a) {
    super(), this.from = e, this.to = t, this.mark = a;
  }
  apply(e) {
    let t = e.slice(this.from, this.to), a = e.resolve(this.from), n = a.node(a.sharedDepth(this.to)), o = new S(sr(t.content, (i, s) => !i.isAtom || !s.type.allowsMarkType(this.mark.type) ? i : i.mark(this.mark.addToSet(i.marks)), n), t.openStart, t.openEnd);
    return z.fromReplace(e, this.from, this.to, o);
  }
  invert() {
    return new he(this.from, this.to, this.mark);
  }
  map(e) {
    let t = e.mapResult(this.from, 1), a = e.mapResult(this.to, -1);
    return t.deleted && a.deleted || t.pos >= a.pos ? null : new pe(t.pos, a.pos, this.mark);
  }
  merge(e) {
    return e instanceof pe && e.mark.eq(this.mark) && this.from <= e.to && this.to >= e.from ? new pe(Math.min(this.from, e.from), Math.max(this.to, e.to), this.mark) : null;
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
    return new pe(t.from, t.to, e.markFromJSON(t.mark));
  }
}
V.jsonID("addMark", pe);
class he extends V {
  /**
  Create a mark-removing step.
  */
  constructor(e, t, a) {
    super(), this.from = e, this.to = t, this.mark = a;
  }
  apply(e) {
    let t = e.slice(this.from, this.to), a = new S(sr(t.content, (n) => n.mark(this.mark.removeFromSet(n.marks)), e), t.openStart, t.openEnd);
    return z.fromReplace(e, this.from, this.to, a);
  }
  invert() {
    return new pe(this.from, this.to, this.mark);
  }
  map(e) {
    let t = e.mapResult(this.from, 1), a = e.mapResult(this.to, -1);
    return t.deleted && a.deleted || t.pos >= a.pos ? null : new he(t.pos, a.pos, this.mark);
  }
  merge(e) {
    return e instanceof he && e.mark.eq(this.mark) && this.from <= e.to && this.to >= e.from ? new he(Math.min(this.from, e.from), Math.max(this.to, e.to), this.mark) : null;
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
    return new he(t.from, t.to, e.markFromJSON(t.mark));
  }
}
V.jsonID("removeMark", he);
class me extends V {
  /**
  Create a node mark step.
  */
  constructor(e, t) {
    super(), this.pos = e, this.mark = t;
  }
  apply(e) {
    let t = e.nodeAt(this.pos);
    if (!t)
      return z.fail("No node at mark step's position");
    let a = t.type.create(t.attrs, null, this.mark.addToSet(t.marks));
    return z.fromReplace(e, this.pos, this.pos + 1, new S(x.from(a), 0, t.isLeaf ? 0 : 1));
  }
  invert(e) {
    let t = e.nodeAt(this.pos);
    if (t) {
      let a = this.mark.addToSet(t.marks);
      if (a.length == t.marks.length) {
        for (let n = 0; n < t.marks.length; n++)
          if (!t.marks[n].isInSet(a))
            return new me(this.pos, t.marks[n]);
        return new me(this.pos, this.mark);
      }
    }
    return new st(this.pos, this.mark);
  }
  map(e) {
    let t = e.mapResult(this.pos, 1);
    return t.deletedAfter ? null : new me(t.pos, this.mark);
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
    return new me(t.pos, e.markFromJSON(t.mark));
  }
}
V.jsonID("addNodeMark", me);
class st extends V {
  /**
  Create a mark-removing step.
  */
  constructor(e, t) {
    super(), this.pos = e, this.mark = t;
  }
  apply(e) {
    let t = e.nodeAt(this.pos);
    if (!t)
      return z.fail("No node at mark step's position");
    let a = t.type.create(t.attrs, null, this.mark.removeFromSet(t.marks));
    return z.fromReplace(e, this.pos, this.pos + 1, new S(x.from(a), 0, t.isLeaf ? 0 : 1));
  }
  invert(e) {
    let t = e.nodeAt(this.pos);
    return !t || !this.mark.isInSet(t.marks) ? this : new me(this.pos, this.mark);
  }
  map(e) {
    let t = e.mapResult(this.pos, 1);
    return t.deletedAfter ? null : new st(t.pos, this.mark);
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
    return new st(t.pos, e.markFromJSON(t.mark));
  }
}
V.jsonID("removeNodeMark", st);
class q extends V {
  /**
  The given `slice` should fit the 'gap' between `from` and
  `to`—the depths must line up, and the surrounding nodes must be
  able to be joined with the open sides of the slice. When
  `structure` is true, the step will fail if the content between
  from and to is not just a sequence of closing and then opening
  tokens (this is to guard against rebased replace steps
  overwriting something they weren't supposed to).
  */
  constructor(e, t, a, n = !1) {
    super(), this.from = e, this.to = t, this.slice = a, this.structure = n;
  }
  apply(e) {
    return this.structure && er(e, this.from, this.to) ? z.fail("Structure replace would overwrite content") : z.fromReplace(e, this.from, this.to, this.slice);
  }
  getMap() {
    return new W([this.from, this.to - this.from, this.slice.size]);
  }
  invert(e) {
    return new q(this.from, this.from + this.slice.size, e.slice(this.from, this.to));
  }
  map(e) {
    let t = e.mapResult(this.to, -1), a = this.from == this.to && q.MAP_BIAS < 0 ? t : e.mapResult(this.from, 1);
    return a.deletedAcross && t.deletedAcross ? null : new q(a.pos, Math.max(a.pos, t.pos), this.slice, this.structure);
  }
  merge(e) {
    if (!(e instanceof q) || e.structure || this.structure)
      return null;
    if (this.from + this.slice.size == e.from && !this.slice.openEnd && !e.slice.openStart) {
      let t = this.slice.size + e.slice.size == 0 ? S.empty : new S(this.slice.content.append(e.slice.content), this.slice.openStart, e.slice.openEnd);
      return new q(this.from, this.to + (e.to - e.from), t, this.structure);
    } else if (e.to == this.from && !this.slice.openStart && !e.slice.openEnd) {
      let t = this.slice.size + e.slice.size == 0 ? S.empty : new S(e.slice.content.append(this.slice.content), e.slice.openStart, this.slice.openEnd);
      return new q(e.from, this.to, t, this.structure);
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
    return new q(t.from, t.to, S.fromJSON(e, t.slice), !!t.structure);
  }
}
q.MAP_BIAS = 1;
V.jsonID("replace", q);
class G extends V {
  /**
  Create a replace-around step with the given range and gap.
  `insert` should be the point in the slice into which the content
  of the gap should be moved. `structure` has the same meaning as
  it has in the [`ReplaceStep`](https://prosemirror.net/docs/ref/#transform.ReplaceStep) class.
  */
  constructor(e, t, a, n, o, i, s = !1) {
    super(), this.from = e, this.to = t, this.gapFrom = a, this.gapTo = n, this.slice = o, this.insert = i, this.structure = s;
  }
  apply(e) {
    if (this.structure && (er(e, this.from, this.gapFrom) || er(e, this.gapTo, this.to)))
      return z.fail("Structure gap-replace would overwrite content");
    let t = e.slice(this.gapFrom, this.gapTo);
    if (t.openStart || t.openEnd)
      return z.fail("Gap is not a flat range");
    let a = this.slice.insertAt(this.insert, t.content);
    return a ? z.fromReplace(e, this.from, this.to, a) : z.fail("Content does not fit in gap");
  }
  getMap() {
    return new W([
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
    return new G(this.from, this.from + this.slice.size + t, this.from + this.insert, this.from + this.insert + t, e.slice(this.from, this.to).removeBetween(this.gapFrom - this.from, this.gapTo - this.from), this.gapFrom - this.from, this.structure);
  }
  map(e) {
    let t = e.mapResult(this.from, 1), a = e.mapResult(this.to, -1), n = this.from == this.gapFrom ? t.pos : e.map(this.gapFrom, -1), o = this.to == this.gapTo ? a.pos : e.map(this.gapTo, 1);
    return t.deletedAcross && a.deletedAcross || n < t.pos || o > a.pos ? null : new G(t.pos, a.pos, n, o, this.slice, this.insert, this.structure);
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
    return new G(t.from, t.to, t.gapFrom, t.gapTo, S.fromJSON(e, t.slice), t.insert, !!t.structure);
  }
}
V.jsonID("replaceAround", G);
function er(r, e, t) {
  let a = r.resolve(e), n = t - e, o = a.depth;
  for (; n > 0 && o > 0 && a.indexAfter(o) == a.node(o).childCount; )
    o--, n--;
  if (n > 0) {
    let i = a.node(o).maybeChild(a.indexAfter(o));
    for (; n > 0; ) {
      if (!i || i.isLeaf)
        return !0;
      i = i.firstChild, n--;
    }
  }
  return !1;
}
function xi(r, e, t) {
  return (e == 0 || r.canReplace(e, r.childCount)) && (t == r.childCount || r.canReplace(0, t));
}
function Be(r) {
  let t = r.parent.content.cutByIndex(r.startIndex, r.endIndex);
  for (let a = r.depth, n = 0, o = 0; ; --a) {
    let i = r.$from.node(a), s = r.$from.index(a) + n, c = r.$to.indexAfter(a) - o;
    if (a < r.depth && i.canReplace(s, c, t))
      return a;
    if (a == 0 || i.type.spec.isolating || !xi(i, s, c))
      break;
    s && (n = 1), c < i.childCount && (o = 1);
  }
  return null;
}
function Wa(r, e, t = null, a = r) {
  let n = ki(r, e), o = n && Si(a, e);
  return o ? n.map(Gr).concat({ type: e, attrs: t }).concat(o.map(Gr)) : null;
}
function Gr(r) {
  return { type: r, attrs: null };
}
function ki(r, e) {
  let { parent: t, startIndex: a, endIndex: n } = r, o = t.contentMatchAt(a).findWrapping(e);
  if (!o)
    return null;
  let i = o.length ? o[0] : e;
  return t.canReplaceWith(a, n, i) ? o : null;
}
function Si(r, e) {
  let { parent: t, startIndex: a, endIndex: n } = r, o = t.child(a), i = e.contentMatch.findWrapping(o.type);
  if (!i)
    return null;
  let c = (i.length ? i[i.length - 1] : e).contentMatch;
  for (let u = a; c && u < n; u++)
    c = c.matchType(t.child(u).type);
  return !c || !c.validEnd ? null : i;
}
function ie(r, e, t = 1, a) {
  let n = r.resolve(e), o = n.depth - t, i = a && a[a.length - 1] || n.parent;
  if (o < 0 || n.parent.type.spec.isolating || !n.parent.canReplace(n.index(), n.parent.childCount) || !i.type.validContent(n.parent.content.cutByIndex(n.index(), n.parent.childCount)))
    return !1;
  for (let u = n.depth - 1, d = t - 2; u > o; u--, d--) {
    let h = n.node(u), m = n.index(u);
    if (h.type.spec.isolating)
      return !1;
    let f = h.content.cutByIndex(m, h.childCount), b = a && a[d + 1];
    b && (f = f.replaceChild(0, b.type.create(b.attrs)));
    let g = a && a[d] || h;
    if (!h.canReplace(m + 1, h.childCount) || !g.type.validContent(f))
      return !1;
  }
  let s = n.indexAfter(o), c = a && a[0];
  return n.node(o).canReplaceWith(s, s, c ? c.type : n.node(o + 1).type);
}
function xe(r, e) {
  let t = r.resolve(e), a = t.index();
  return Ka(t.nodeBefore, t.nodeAfter) && t.parent.canReplace(a, a + 1);
}
function Ci(r, e) {
  e.content.size || r.type.compatibleContent(e.type);
  let t = r.contentMatchAt(r.childCount), { linebreakReplacement: a } = r.type.schema;
  for (let n = 0; n < e.childCount; n++) {
    let o = e.child(n), i = o.type == a ? r.type.schema.nodes.text : o.type;
    if (t = t.matchType(i), !t || !r.type.allowsMarks(o.marks))
      return !1;
  }
  return t.validEnd;
}
function Ka(r, e) {
  return !!(r && e && !r.isLeaf && Ci(r, e));
}
function zt(r, e, t = -1) {
  let a = r.resolve(e);
  for (let n = a.depth; ; n--) {
    let o, i, s = a.index(n);
    if (n == a.depth ? (o = a.nodeBefore, i = a.nodeAfter) : t > 0 ? (o = a.node(n + 1), s++, i = a.node(n).maybeChild(s)) : (o = a.node(n).maybeChild(s - 1), i = a.node(n + 1)), o && !o.isTextblock && Ka(o, i) && a.node(n).canReplace(s, s + 1))
      return e;
    if (n == 0)
      break;
    e = t < 0 ? a.before(n) : a.after(n);
  }
}
function lr(r, e, t = e, a = S.empty) {
  if (e == t && !a.size)
    return null;
  let n = r.resolve(e), o = r.resolve(t);
  return Ni(n, o, a) ? new q(e, t, a) : new Ai(n, o, a).fit();
}
function Ni(r, e, t) {
  return !t.openStart && !t.openEnd && r.start() == e.start() && r.parent.canReplace(r.index(), e.index(), t.content);
}
class Ai {
  constructor(e, t, a) {
    this.$from = e, this.$to = t, this.unplaced = a, this.frontier = [], this.placed = x.empty;
    for (let n = 0; n <= e.depth; n++) {
      let o = e.node(n);
      this.frontier.push({
        type: o.type,
        match: o.contentMatchAt(e.indexAfter(n))
      });
    }
    for (let n = e.depth; n > 0; n--)
      this.placed = x.from(e.node(n).copy(this.placed));
  }
  get depth() {
    return this.frontier.length - 1;
  }
  fit() {
    for (; this.unplaced.size; ) {
      let u = this.findFittable();
      u ? this.placeNodes(u) : this.openMore() || this.dropNode();
    }
    let e = this.mustMoveInline(), t = this.placed.size - this.depth - this.$from.depth, a = this.$from, n = this.close(e < 0 ? this.$to : a.doc.resolve(e));
    if (!n)
      return null;
    let o = this.placed, i = a.depth, s = n.depth;
    for (; i && s && o.childCount == 1; )
      o = o.firstChild.content, i--, s--;
    let c = new S(o, i, s);
    return e > -1 ? new G(a.pos, e, this.$to.pos, this.$to.end(), c, t) : c.size || a.pos != this.$to.pos ? new q(a.pos, n.pos, c) : null;
  }
  // Find a position on the start spine of `this.unplaced` that has
  // content that can be moved somewhere on the frontier. Returns two
  // depths, one for the slice and one for the frontier.
  findFittable() {
    let e = this.unplaced.openStart;
    for (let t = this.unplaced.content, a = 0, n = this.unplaced.openEnd; a < e; a++) {
      let o = t.firstChild;
      if (t.childCount > 1 && (n = 0), o.type.spec.isolating && n <= a) {
        e = a;
        break;
      }
      t = o.content;
    }
    for (let t = 1; t <= 2; t++)
      for (let a = t == 1 ? e : this.unplaced.openStart; a >= 0; a--) {
        let n, o = null;
        a ? (o = jt(this.unplaced.content, a - 1).firstChild, n = o.content) : n = this.unplaced.content;
        let i = n.firstChild;
        for (let s = this.depth; s >= 0; s--) {
          let { type: c, match: u } = this.frontier[s], d, h = null;
          if (t == 1 && (i ? u.matchType(i.type) || (h = u.fillBefore(x.from(i), !1)) : o && c.compatibleContent(o.type)))
            return { sliceDepth: a, frontierDepth: s, parent: o, inject: h };
          if (t == 2 && i && (d = u.findWrapping(i.type)))
            return { sliceDepth: a, frontierDepth: s, parent: o, wrap: d };
          if (o && u.matchType(o.type))
            break;
        }
      }
  }
  openMore() {
    let { content: e, openStart: t, openEnd: a } = this.unplaced, n = jt(e, t);
    return !n.childCount || n.firstChild.isLeaf ? !1 : (this.unplaced = new S(e, t + 1, Math.max(a, n.size + t >= e.size - a ? t + 1 : 0)), !0);
  }
  dropNode() {
    let { content: e, openStart: t, openEnd: a } = this.unplaced, n = jt(e, t);
    if (n.childCount <= 1 && t > 0) {
      let o = e.size - t <= t + n.size;
      this.unplaced = new S(Ue(e, t - 1, 1), t - 1, o ? t - 1 : a);
    } else
      this.unplaced = new S(Ue(e, t, 1), t, a);
  }
  // Move content from the unplaced slice at `sliceDepth` to the
  // frontier node at `frontierDepth`. Close that frontier node when
  // applicable.
  placeNodes({ sliceDepth: e, frontierDepth: t, parent: a, inject: n, wrap: o }) {
    for (; this.depth > t; )
      this.closeFrontierNode();
    if (o)
      for (let g = 0; g < o.length; g++)
        this.openFrontierNode(o[g]);
    let i = this.unplaced, s = a ? a.content : i.content, c = i.openStart - e, u = 0, d = [], { match: h, type: m } = this.frontier[t];
    if (n) {
      for (let g = 0; g < n.childCount; g++)
        d.push(n.child(g));
      h = h.matchFragment(n);
    }
    let f = s.size + e - (i.content.size - i.openEnd);
    for (; u < s.childCount; ) {
      let g = s.child(u), y = h.matchType(g.type);
      if (!y)
        break;
      u++, (u > 1 || c == 0 || g.content.size) && (h = y, d.push(Ya(g.mark(m.allowedMarks(g.marks)), u == 1 ? c : 0, u == s.childCount ? f : -1)));
    }
    let b = u == s.childCount;
    b || (f = -1), this.placed = Fe(this.placed, t, x.from(d)), this.frontier[t].match = h, b && f < 0 && a && a.type == this.frontier[this.depth].type && this.frontier.length > 1 && this.closeFrontierNode();
    for (let g = 0, y = s; g < f; g++) {
      let w = y.lastChild;
      this.frontier.push({ type: w.type, match: w.contentMatchAt(w.childCount) }), y = w.content;
    }
    this.unplaced = b ? e == 0 ? S.empty : new S(Ue(i.content, e - 1, 1), e - 1, f < 0 ? i.openEnd : e - 1) : new S(Ue(i.content, e, u), i.openStart, i.openEnd);
  }
  mustMoveInline() {
    if (!this.$to.parent.isTextblock)
      return -1;
    let e = this.frontier[this.depth], t;
    if (!e.type.isTextblock || !Dt(this.$to, this.$to.depth, e.type, e.match, !1) || this.$to.depth == this.depth && (t = this.findCloseLevel(this.$to)) && t.depth == this.depth)
      return -1;
    let { depth: a } = this.$to, n = this.$to.after(a);
    for (; a > 1 && n == this.$to.end(--a); )
      ++n;
    return n;
  }
  findCloseLevel(e) {
    e: for (let t = Math.min(this.depth, e.depth); t >= 0; t--) {
      let { match: a, type: n } = this.frontier[t], o = t < e.depth && e.end(t + 1) == e.pos + (e.depth - (t + 1)), i = Dt(e, t, n, a, o);
      if (i) {
        for (let s = t - 1; s >= 0; s--) {
          let { match: c, type: u } = this.frontier[s], d = Dt(e, s, u, c, !0);
          if (!d || d.childCount)
            continue e;
        }
        return { depth: t, fit: i, move: o ? e.doc.resolve(e.after(t + 1)) : e };
      }
    }
  }
  close(e) {
    let t = this.findCloseLevel(e);
    if (!t)
      return null;
    for (; this.depth > t.depth; )
      this.closeFrontierNode();
    t.fit.childCount && (this.placed = Fe(this.placed, t.depth, t.fit)), e = t.move;
    for (let a = t.depth + 1; a <= e.depth; a++) {
      let n = e.node(a), o = n.type.contentMatch.fillBefore(n.content, !0, e.index(a));
      this.openFrontierNode(n.type, n.attrs, o);
    }
    return e;
  }
  openFrontierNode(e, t = null, a) {
    let n = this.frontier[this.depth];
    n.match = n.match.matchType(e), this.placed = Fe(this.placed, this.depth, x.from(e.create(t, a))), this.frontier.push({ type: e, match: e.contentMatch });
  }
  closeFrontierNode() {
    let t = this.frontier.pop().match.fillBefore(x.empty, !0);
    t.childCount && (this.placed = Fe(this.placed, this.frontier.length, t));
  }
}
function Ue(r, e, t) {
  return e == 0 ? r.cutByIndex(t, r.childCount) : r.replaceChild(0, r.firstChild.copy(Ue(r.firstChild.content, e - 1, t)));
}
function Fe(r, e, t) {
  return e == 0 ? r.append(t) : r.replaceChild(r.childCount - 1, r.lastChild.copy(Fe(r.lastChild.content, e - 1, t)));
}
function jt(r, e) {
  for (let t = 0; t < e; t++)
    r = r.firstChild.content;
  return r;
}
function Ya(r, e, t) {
  if (e <= 0)
    return r;
  let a = r.content;
  return e > 1 && (a = a.replaceChild(0, Ya(a.firstChild, e - 1, a.childCount == 1 ? t - 1 : 0))), e > 0 && (a = r.type.contentMatch.fillBefore(a).append(a), t <= 0 && (a = a.append(r.type.contentMatch.matchFragment(a).fillBefore(x.empty, !0)))), r.copy(a);
}
function Dt(r, e, t, a, n) {
  let o = r.node(e), i = n ? r.indexAfter(e) : r.index(e);
  if (i == o.childCount && !t.compatibleContent(o.type))
    return null;
  let s = a.fillBefore(o.content, !0, i);
  return s && !Ti(t, o.content, i) ? s : null;
}
function Ti(r, e, t) {
  for (let a = t; a < e.childCount; a++)
    if (!r.allowsMarks(e.child(a).marks))
      return !0;
  return !1;
}
class _e extends V {
  /**
  Construct an attribute step.
  */
  constructor(e, t, a) {
    super(), this.pos = e, this.attr = t, this.value = a;
  }
  apply(e) {
    let t = e.nodeAt(this.pos);
    if (!t)
      return z.fail("No node at attribute step's position");
    let a = /* @__PURE__ */ Object.create(null);
    for (let o in t.attrs)
      a[o] = t.attrs[o];
    a[this.attr] = this.value;
    let n = t.type.create(a, null, t.marks);
    return z.fromReplace(e, this.pos, this.pos + 1, new S(x.from(n), 0, t.isLeaf ? 0 : 1));
  }
  getMap() {
    return W.empty;
  }
  invert(e) {
    return new _e(this.pos, this.attr, e.nodeAt(this.pos).attrs[this.attr]);
  }
  map(e) {
    let t = e.mapResult(this.pos, 1);
    return t.deletedAfter ? null : new _e(t.pos, this.attr, this.value);
  }
  toJSON() {
    return { stepType: "attr", pos: this.pos, attr: this.attr, value: this.value };
  }
  static fromJSON(e, t) {
    if (typeof t.pos != "number" || typeof t.attr != "string")
      throw new RangeError("Invalid input for AttrStep.fromJSON");
    return new _e(t.pos, t.attr, t.value);
  }
}
V.jsonID("attr", _e);
class Mt extends V {
  /**
  Construct an attribute step.
  */
  constructor(e, t) {
    super(), this.attr = e, this.value = t;
  }
  apply(e) {
    let t = /* @__PURE__ */ Object.create(null);
    for (let n in e.attrs)
      t[n] = e.attrs[n];
    t[this.attr] = this.value;
    let a = e.type.create(t, e.content, e.marks);
    return z.ok(a);
  }
  getMap() {
    return W.empty;
  }
  invert(e) {
    return new Mt(this.attr, e.attrs[this.attr]);
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
    return new Mt(t.attr, t.value);
  }
}
V.jsonID("docAttr", Mt);
let lt = class extends Error {
};
lt = function r(e) {
  let t = Error.call(this, e);
  return t.__proto__ = r.prototype, t;
};
lt.prototype = Object.create(Error.prototype);
lt.prototype.constructor = lt;
lt.prototype.name = "TransformError";
const Vt = /* @__PURE__ */ Object.create(null);
class E {
  /**
  Initialize a selection with the head and anchor and ranges. If no
  ranges are given, constructs a single range across `$anchor` and
  `$head`.
  */
  constructor(e, t, a) {
    this.$anchor = e, this.$head = t, this.ranges = a || [new Ei(e.min(t), e.max(t))];
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
  replace(e, t = S.empty) {
    let a = t.content.lastChild, n = null;
    for (let s = 0; s < t.openEnd; s++)
      n = a, a = a.lastChild;
    let o = e.steps.length, i = this.ranges;
    for (let s = 0; s < i.length; s++) {
      let { $from: c, $to: u } = i[s], d = e.mapping.slice(o);
      e.replaceRange(d.map(c.pos), d.map(u.pos), s ? S.empty : t), s == 0 && Kr(e, o, (a ? a.isInline : n && n.isTextblock) ? -1 : 1);
    }
  }
  /**
  Replace the selection with the given node, appending the changes
  to the given transaction.
  */
  replaceWith(e, t) {
    let a = e.steps.length, n = this.ranges;
    for (let o = 0; o < n.length; o++) {
      let { $from: i, $to: s } = n[o], c = e.mapping.slice(a), u = c.map(i.pos), d = c.map(s.pos);
      o ? e.deleteRange(u, d) : (e.replaceRangeWith(u, d, t), Kr(e, a, t.isInline ? -1 : 1));
    }
  }
  /**
  Find a valid cursor or leaf node selection starting at the given
  position and searching back if `dir` is negative, and forward if
  positive. When `textOnly` is true, only consider cursor
  selections. Will return null when no valid selection position is
  found.
  */
  static findFrom(e, t, a = !1) {
    let n = e.parent.inlineContent ? new O(e) : Ae(e.node(0), e.parent, e.pos, e.index(), t, a);
    if (n)
      return n;
    for (let o = e.depth - 1; o >= 0; o--) {
      let i = t < 0 ? Ae(e.node(0), e.node(o), e.before(o + 1), e.index(o), t, a) : Ae(e.node(0), e.node(o), e.after(o + 1), e.index(o) + 1, t, a);
      if (i)
        return i;
    }
    return null;
  }
  /**
  Find a valid cursor or leaf node selection near the given
  position. Searches forward first by default, but if `bias` is
  negative, it will search backwards first.
  */
  static near(e, t = 1) {
    return this.findFrom(e, t) || this.findFrom(e, -t) || new K(e.node(0));
  }
  /**
  Find the cursor or leaf node selection closest to the start of
  the given document. Will return an
  [`AllSelection`](https://prosemirror.net/docs/ref/#state.AllSelection) if no valid position
  exists.
  */
  static atStart(e) {
    return Ae(e, e, 0, 0, 1) || new K(e);
  }
  /**
  Find the cursor or leaf node selection closest to the end of the
  given document.
  */
  static atEnd(e) {
    return Ae(e, e, e.content.size, e.childCount, -1) || new K(e);
  }
  /**
  Deserialize the JSON representation of a selection. Must be
  implemented for custom classes (as a static class method).
  */
  static fromJSON(e, t) {
    if (!t || !t.type)
      throw new RangeError("Invalid input for Selection.fromJSON");
    let a = Vt[t.type];
    if (!a)
      throw new RangeError(`No selection type ${t.type} defined`);
    return a.fromJSON(e, t);
  }
  /**
  To be able to deserialize selections from JSON, custom selection
  classes must register themselves with an ID string, so that they
  can be disambiguated. Try to pick something that's unlikely to
  clash with classes from other modules.
  */
  static jsonID(e, t) {
    if (e in Vt)
      throw new RangeError("Duplicate use of selection JSON ID " + e);
    return Vt[e] = t, t.prototype.jsonID = e, t;
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
    return O.between(this.$anchor, this.$head).getBookmark();
  }
}
E.prototype.visible = !0;
class Ei {
  /**
  Create a range.
  */
  constructor(e, t) {
    this.$from = e, this.$to = t;
  }
}
let Jr = !1;
function Wr(r) {
  !Jr && !r.parent.inlineContent && (Jr = !0, console.warn("TextSelection endpoint not pointing into a node with inline content (" + r.parent.type.name + ")"));
}
class O extends E {
  /**
  Construct a text selection between the given points.
  */
  constructor(e, t = e) {
    Wr(e), Wr(t), super(e, t);
  }
  /**
  Returns a resolved position if this is a cursor selection (an
  empty text selection), and null otherwise.
  */
  get $cursor() {
    return this.$anchor.pos == this.$head.pos ? this.$head : null;
  }
  map(e, t) {
    let a = e.resolve(t.map(this.head));
    if (!a.parent.inlineContent)
      return E.near(a);
    let n = e.resolve(t.map(this.anchor));
    return new O(n.parent.inlineContent ? n : a, a);
  }
  replace(e, t = S.empty) {
    if (super.replace(e, t), t == S.empty) {
      let a = this.$from.marksAcross(this.$to);
      a && e.ensureMarks(a);
    }
  }
  eq(e) {
    return e instanceof O && e.anchor == this.anchor && e.head == this.head;
  }
  getBookmark() {
    return new $t(this.anchor, this.head);
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
    return new O(e.resolve(t.anchor), e.resolve(t.head));
  }
  /**
  Create a text selection from non-resolved positions.
  */
  static create(e, t, a = t) {
    let n = e.resolve(t);
    return new this(n, a == t ? n : e.resolve(a));
  }
  /**
  Return a text selection that spans the given positions or, if
  they aren't text positions, find a text selection near them.
  `bias` determines whether the method searches forward (default)
  or backwards (negative number) first. Will fall back to calling
  [`Selection.near`](https://prosemirror.net/docs/ref/#state.Selection^near) when the document
  doesn't contain a valid text position.
  */
  static between(e, t, a) {
    let n = e.pos - t.pos;
    if ((!a || n) && (a = n >= 0 ? 1 : -1), !t.parent.inlineContent) {
      let o = E.findFrom(t, a, !0) || E.findFrom(t, -a, !0);
      if (o)
        t = o.$head;
      else
        return E.near(t, a);
    }
    return e.parent.inlineContent || (n == 0 ? e = t : (e = (E.findFrom(e, -a, !0) || E.findFrom(e, a, !0)).$anchor, e.pos < t.pos != n < 0 && (e = t))), new O(e, t);
  }
}
E.jsonID("text", O);
class $t {
  constructor(e, t) {
    this.anchor = e, this.head = t;
  }
  map(e) {
    return new $t(e.map(this.anchor), e.map(this.head));
  }
  resolve(e) {
    return O.between(e.resolve(this.anchor), e.resolve(this.head));
  }
}
class L extends E {
  /**
  Create a node selection. Does not verify the validity of its
  argument.
  */
  constructor(e) {
    let t = e.nodeAfter, a = e.node(0).resolve(e.pos + t.nodeSize);
    super(e, a), this.node = t;
  }
  map(e, t) {
    let { deleted: a, pos: n } = t.mapResult(this.anchor), o = e.resolve(n);
    return a ? E.near(o) : new L(o);
  }
  content() {
    return new S(x.from(this.node), 0, 0);
  }
  eq(e) {
    return e instanceof L && e.anchor == this.anchor;
  }
  toJSON() {
    return { type: "node", anchor: this.anchor };
  }
  getBookmark() {
    return new cr(this.anchor);
  }
  /**
  @internal
  */
  static fromJSON(e, t) {
    if (typeof t.anchor != "number")
      throw new RangeError("Invalid input for NodeSelection.fromJSON");
    return new L(e.resolve(t.anchor));
  }
  /**
  Create a node selection from non-resolved positions.
  */
  static create(e, t) {
    return new L(e.resolve(t));
  }
  /**
  Determines whether the given node may be selected as a node
  selection.
  */
  static isSelectable(e) {
    return !e.isText && e.type.spec.selectable !== !1;
  }
}
L.prototype.visible = !1;
E.jsonID("node", L);
class cr {
  constructor(e) {
    this.anchor = e;
  }
  map(e) {
    let { deleted: t, pos: a } = e.mapResult(this.anchor);
    return t ? new $t(a, a) : new cr(a);
  }
  resolve(e) {
    let t = e.resolve(this.anchor), a = t.nodeAfter;
    return a && L.isSelectable(a) ? new L(t) : E.near(t);
  }
}
class K extends E {
  /**
  Create an all-selection over the given document.
  */
  constructor(e) {
    super(e.resolve(0), e.resolve(e.content.size));
  }
  replace(e, t = S.empty) {
    if (t == S.empty) {
      e.delete(0, e.doc.content.size);
      let a = E.atStart(e.doc);
      a.eq(e.selection) || e.setSelection(a);
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
    return new K(e);
  }
  map(e) {
    return new K(e);
  }
  eq(e) {
    return e instanceof K;
  }
  getBookmark() {
    return Li;
  }
}
E.jsonID("all", K);
const Li = {
  map() {
    return this;
  },
  resolve(r) {
    return new K(r);
  }
};
function Ae(r, e, t, a, n, o = !1) {
  if (e.inlineContent)
    return O.create(r, t);
  for (let i = a - (n > 0 ? 0 : 1); n > 0 ? i < e.childCount : i >= 0; i += n) {
    let s = e.child(i);
    if (s.isAtom) {
      if (!o && L.isSelectable(s))
        return L.create(r, t - (n < 0 ? s.nodeSize : 0));
    } else {
      let c = Ae(r, s, t + n, n < 0 ? s.childCount : 0, n, o);
      if (c)
        return c;
    }
    t += s.nodeSize * n;
  }
  return null;
}
function Kr(r, e, t) {
  let a = r.steps.length - 1;
  if (a < e)
    return;
  let n = r.steps[a];
  if (!(n instanceof q || n instanceof G))
    return;
  let o = r.mapping.maps[a], i;
  o.forEach((s, c, u, d) => {
    i == null && (i = d);
  }), r.setSelection(E.near(r.doc.resolve(i), t));
}
function Yr(r, e) {
  return !e || !r ? r : r.bind(e);
}
class gt {
  constructor(e, t, a) {
    this.name = e, this.init = Yr(t.init, a), this.apply = Yr(t.apply, a);
  }
}
new gt("doc", {
  init(r) {
    return r.doc || r.schema.topNodeType.createAndFill();
  },
  apply(r) {
    return r.doc;
  }
}), new gt("selection", {
  init(r, e) {
    return r.selection || E.atStart(e.doc);
  },
  apply(r) {
    return r.selection;
  }
}), new gt("storedMarks", {
  init(r) {
    return r.storedMarks || null;
  },
  apply(r, e, t, a) {
    return a.selection.$cursor ? r.storedMarks : null;
  }
}), new gt("scrollToSelection", {
  init() {
    return 0;
  },
  apply(r, e) {
    return r.scrolledIntoView ? e + 1 : e;
  }
});
function Za(r, e, t) {
  for (let a in r) {
    let n = r[a];
    n instanceof Function ? n = n.bind(e) : a == "handleDOMEvents" && (n = Za(n, e, {})), t[a] = n;
  }
  return t;
}
class ke {
  /**
  Create a plugin.
  */
  constructor(e) {
    this.spec = e, this.props = {}, e.props && Za(e.props, this, this.props), this.key = e.key ? e.key.key : Qa("plugin");
  }
  /**
  Extract the plugin's state field from an editor state.
  */
  getState(e) {
    return e[this.key];
  }
}
const qt = /* @__PURE__ */ Object.create(null);
function Qa(r) {
  return r in qt ? r + "$" + ++qt[r] : (qt[r] = 0, r + "$");
}
class Se {
  /**
  Create a plugin key.
  */
  constructor(e = "key") {
    this.key = Qa(e);
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
const dr = (r, e) => r.selection.empty ? !1 : (e && e(r.tr.deleteSelection().scrollIntoView()), !0);
function Xa(r, e) {
  let { $cursor: t } = r.selection;
  return !t || (e ? !e.endOfTextblock("backward", r) : t.parentOffset > 0) ? null : t;
}
const en = (r, e, t) => {
  let a = Xa(r, t);
  if (!a)
    return !1;
  let n = ur(a);
  if (!n) {
    let i = a.blockRange(), s = i && Be(i);
    return s == null ? !1 : (e && e(r.tr.lift(i, s).scrollIntoView()), !0);
  }
  let o = n.nodeBefore;
  if (dn(r, n, e, -1))
    return !0;
  if (a.parent.content.size == 0 && (Ie(o, "end") || L.isSelectable(o)))
    for (let i = a.depth; ; i--) {
      let s = lr(r.doc, a.before(i), a.after(i), S.empty);
      if (s && s.slice.size < s.to - s.from) {
        if (e) {
          let c = r.tr.step(s);
          c.setSelection(Ie(o, "end") ? E.findFrom(c.doc.resolve(c.mapping.map(n.pos, -1)), -1) : L.create(c.doc, n.pos - o.nodeSize)), e(c.scrollIntoView());
        }
        return !0;
      }
      if (i == 1 || a.node(i - 1).childCount > 1)
        break;
    }
  return o.isAtom && n.depth == a.depth - 1 ? (e && e(r.tr.delete(n.pos - o.nodeSize, n.pos).scrollIntoView()), !0) : !1;
}, Mi = (r, e, t) => {
  let a = Xa(r, t);
  if (!a)
    return !1;
  let n = ur(a);
  return n ? tn(r, n, e) : !1;
}, Ii = (r, e, t) => {
  let a = an(r, t);
  if (!a)
    return !1;
  let n = pr(a);
  return n ? tn(r, n, e) : !1;
};
function tn(r, e, t) {
  let a = e.nodeBefore, n = a, o = e.pos - 1;
  for (; !n.isTextblock; o--) {
    if (n.type.spec.isolating)
      return !1;
    let d = n.lastChild;
    if (!d)
      return !1;
    n = d;
  }
  let i = e.nodeAfter, s = i, c = e.pos + 1;
  for (; !s.isTextblock; c++) {
    if (s.type.spec.isolating)
      return !1;
    let d = s.firstChild;
    if (!d)
      return !1;
    s = d;
  }
  let u = lr(r.doc, o, c, S.empty);
  if (!u || u.from != o || u instanceof q && u.slice.size >= c - o)
    return !1;
  if (t) {
    let d = r.tr.step(u);
    d.setSelection(O.create(d.doc, o)), t(d.scrollIntoView());
  }
  return !0;
}
function Ie(r, e, t = !1) {
  for (let a = r; a; a = e == "start" ? a.firstChild : a.lastChild) {
    if (a.isTextblock)
      return !0;
    if (t && a.childCount != 1)
      return !1;
  }
  return !1;
}
const rn = (r, e, t) => {
  let { $head: a, empty: n } = r.selection, o = a;
  if (!n)
    return !1;
  if (a.parent.isTextblock) {
    if (t ? !t.endOfTextblock("backward", r) : a.parentOffset > 0)
      return !1;
    o = ur(a);
  }
  let i = o && o.nodeBefore;
  return !i || !L.isSelectable(i) ? !1 : (e && e(r.tr.setSelection(L.create(r.doc, o.pos - i.nodeSize)).scrollIntoView()), !0);
};
function ur(r) {
  if (!r.parent.type.spec.isolating)
    for (let e = r.depth - 1; e >= 0; e--) {
      if (r.index(e) > 0)
        return r.doc.resolve(r.before(e + 1));
      if (r.node(e).type.spec.isolating)
        break;
    }
  return null;
}
function an(r, e) {
  let { $cursor: t } = r.selection;
  return !t || (e ? !e.endOfTextblock("forward", r) : t.parentOffset < t.parent.content.size) ? null : t;
}
const nn = (r, e, t) => {
  let a = an(r, t);
  if (!a)
    return !1;
  let n = pr(a);
  if (!n)
    return !1;
  let o = n.nodeAfter;
  if (dn(r, n, e, 1))
    return !0;
  if (a.parent.content.size == 0 && (Ie(o, "start") || L.isSelectable(o))) {
    let i = lr(r.doc, a.before(), a.after(), S.empty);
    if (i && i.slice.size < i.to - i.from) {
      if (e) {
        let s = r.tr.step(i);
        s.setSelection(Ie(o, "start") ? E.findFrom(s.doc.resolve(s.mapping.map(n.pos)), 1) : L.create(s.doc, s.mapping.map(n.pos))), e(s.scrollIntoView());
      }
      return !0;
    }
  }
  return o.isAtom && n.depth == a.depth - 1 ? (e && e(r.tr.delete(n.pos, n.pos + o.nodeSize).scrollIntoView()), !0) : !1;
}, on = (r, e, t) => {
  let { $head: a, empty: n } = r.selection, o = a;
  if (!n)
    return !1;
  if (a.parent.isTextblock) {
    if (t ? !t.endOfTextblock("forward", r) : a.parentOffset < a.parent.content.size)
      return !1;
    o = pr(a);
  }
  let i = o && o.nodeAfter;
  return !i || !L.isSelectable(i) ? !1 : (e && e(r.tr.setSelection(L.create(r.doc, o.pos)).scrollIntoView()), !0);
};
function pr(r) {
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
const Hi = (r, e) => {
  let t = r.selection, a = t instanceof L, n;
  if (a) {
    if (t.node.isTextblock || !xe(r.doc, t.from))
      return !1;
    n = t.from;
  } else if (n = zt(r.doc, t.from, -1), n == null)
    return !1;
  if (e) {
    let o = r.tr.join(n);
    a && o.setSelection(L.create(o.doc, n - r.doc.resolve(n).nodeBefore.nodeSize)), e(o.scrollIntoView());
  }
  return !0;
}, Ri = (r, e) => {
  let t = r.selection, a;
  if (t instanceof L) {
    if (t.node.isTextblock || !xe(r.doc, t.to))
      return !1;
    a = t.to;
  } else if (a = zt(r.doc, t.to, 1), a == null)
    return !1;
  return e && e(r.tr.join(a).scrollIntoView()), !0;
}, Pi = (r, e) => {
  let { $from: t, $to: a } = r.selection, n = t.blockRange(a), o = n && Be(n);
  return o == null ? !1 : (e && e(r.tr.lift(n, o).scrollIntoView()), !0);
}, sn = (r, e) => {
  let { $head: t, $anchor: a } = r.selection;
  return !t.parent.type.spec.code || !t.sameParent(a) ? !1 : (e && e(r.tr.insertText(`
`).scrollIntoView()), !0);
};
function hr(r) {
  for (let e = 0; e < r.edgeCount; e++) {
    let { type: t } = r.edge(e);
    if (t.isTextblock && !t.hasRequiredAttrs())
      return t;
  }
  return null;
}
const Oi = (r, e) => {
  let { $head: t, $anchor: a } = r.selection;
  if (!t.parent.type.spec.code || !t.sameParent(a))
    return !1;
  let n = t.node(-1), o = t.indexAfter(-1), i = hr(n.contentMatchAt(o));
  if (!i || !n.canReplaceWith(o, o, i))
    return !1;
  if (e) {
    let s = t.after(), c = r.tr.replaceWith(s, s, i.createAndFill());
    c.setSelection(E.near(c.doc.resolve(s), 1)), e(c.scrollIntoView());
  }
  return !0;
}, ln = (r, e) => {
  let t = r.selection, { $from: a, $to: n } = t;
  if (t instanceof K || a.parent.inlineContent || n.parent.inlineContent)
    return !1;
  let o = hr(n.parent.contentMatchAt(n.indexAfter()));
  if (!o || !o.isTextblock)
    return !1;
  if (e) {
    let i = (!a.parentOffset && n.index() < n.parent.childCount ? a : n).pos, s = r.tr.insert(i, o.createAndFill());
    s.setSelection(O.create(s.doc, i + 1)), e(s.scrollIntoView());
  }
  return !0;
}, cn = (r, e) => {
  let { $cursor: t } = r.selection;
  if (!t || t.parent.content.size)
    return !1;
  if (t.depth > 1 && t.after() != t.end(-1)) {
    let o = t.before();
    if (ie(r.doc, o))
      return e && e(r.tr.split(o).scrollIntoView()), !0;
  }
  let a = t.blockRange(), n = a && Be(a);
  return n == null ? !1 : (e && e(r.tr.lift(a, n).scrollIntoView()), !0);
};
function Bi(r) {
  return (e, t) => {
    let { $from: a, $to: n } = e.selection;
    if (e.selection instanceof L && e.selection.node.isBlock)
      return !a.parentOffset || !ie(e.doc, a.pos) ? !1 : (t && t(e.tr.split(a.pos).scrollIntoView()), !0);
    if (!a.depth)
      return !1;
    let o = [], i, s, c = !1, u = !1;
    for (let f = a.depth; ; f--)
      if (a.node(f).isBlock) {
        c = a.end(f) == a.pos + (a.depth - f), u = a.start(f) == a.pos - (a.depth - f), s = hr(a.node(f - 1).contentMatchAt(a.indexAfter(f - 1))), o.unshift(c && s ? { type: s } : null), i = f;
        break;
      } else {
        if (f == 1)
          return !1;
        o.unshift(null);
      }
    let d = e.tr;
    (e.selection instanceof O || e.selection instanceof K) && d.deleteSelection();
    let h = d.mapping.map(a.pos), m = ie(d.doc, h, o.length, o);
    if (m || (o[0] = s ? { type: s } : null, m = ie(d.doc, h, o.length, o)), !m)
      return !1;
    if (d.split(h, o.length, o), !c && u && a.node(i).type != s) {
      let f = d.mapping.map(a.before(i)), b = d.doc.resolve(f);
      s && a.node(i - 1).canReplaceWith(b.index(), b.index() + 1, s) && d.setNodeMarkup(d.mapping.map(a.before(i)), s);
    }
    return t && t(d.scrollIntoView()), !0;
  };
}
const zi = Bi(), $i = (r, e) => {
  let { $from: t, to: a } = r.selection, n, o = t.sharedDepth(a);
  return o == 0 ? !1 : (n = t.before(o), e && e(r.tr.setSelection(L.create(r.doc, n))), !0);
};
function Ui(r, e, t) {
  let a = e.nodeBefore, n = e.nodeAfter, o = e.index();
  return !a || !n || !a.type.compatibleContent(n.type) ? !1 : !a.content.size && e.parent.canReplace(o - 1, o) ? (t && t(r.tr.delete(e.pos - a.nodeSize, e.pos).scrollIntoView()), !0) : !e.parent.canReplace(o, o + 1) || !(n.isTextblock || xe(r.doc, e.pos)) ? !1 : (t && t(r.tr.join(e.pos).scrollIntoView()), !0);
}
function dn(r, e, t, a) {
  let n = e.nodeBefore, o = e.nodeAfter, i, s, c = n.type.spec.isolating || o.type.spec.isolating;
  if (!c && Ui(r, e, t))
    return !0;
  let u = !c && e.parent.canReplace(e.index(), e.index() + 1);
  if (u && (i = (s = n.contentMatchAt(n.childCount)).findWrapping(o.type)) && s.matchType(i[0] || o.type).validEnd) {
    if (t) {
      let f = e.pos + o.nodeSize, b = x.empty;
      for (let w = i.length - 1; w >= 0; w--)
        b = x.from(i[w].create(null, b));
      b = x.from(n.copy(b));
      let g = r.tr.step(new G(e.pos - 1, f, e.pos, f, new S(b, 1, 0), i.length, !0)), y = g.doc.resolve(f + 2 * i.length);
      y.nodeAfter && y.nodeAfter.type == n.type && xe(g.doc, y.pos) && g.join(y.pos), t(g.scrollIntoView());
    }
    return !0;
  }
  let d = o.type.spec.isolating || a > 0 && c ? null : E.findFrom(e, 1), h = d && d.$from.blockRange(d.$to), m = h && Be(h);
  if (m != null && m >= e.depth)
    return t && t(r.tr.lift(h, m).scrollIntoView()), !0;
  if (u && Ie(o, "start", !0) && Ie(n, "end")) {
    let f = n, b = [];
    for (; b.push(f), !f.isTextblock; )
      f = f.lastChild;
    let g = o, y = 1;
    for (; !g.isTextblock; g = g.firstChild)
      y++;
    if (f.canReplace(f.childCount, f.childCount, g.content)) {
      if (t) {
        let w = x.empty;
        for (let A = b.length - 1; A >= 0; A--)
          w = x.from(b[A].copy(w));
        let C = r.tr.step(new G(e.pos - b.length, e.pos + o.nodeSize, e.pos + y, e.pos + o.nodeSize - y, new S(w, b.length, 0), 0, !0));
        t(C.scrollIntoView());
      }
      return !0;
    }
  }
  return !1;
}
function un(r) {
  return function(e, t) {
    let a = e.selection, n = r < 0 ? a.$from : a.$to, o = n.depth;
    for (; n.node(o).isInline; ) {
      if (!o)
        return !1;
      o--;
    }
    return n.node(o).isTextblock ? (t && t(e.tr.setSelection(O.create(e.doc, r < 0 ? n.start(o) : n.end(o)))), !0) : !1;
  };
}
const Fi = un(-1), ji = un(1);
function Di(r, e = null) {
  return function(t, a) {
    let { $from: n, $to: o } = t.selection, i = n.blockRange(o), s = i && Wa(i, r, e);
    return s ? (a && a(t.tr.wrap(i, s).scrollIntoView()), !0) : !1;
  };
}
function Zr(r, e = null) {
  return function(t, a) {
    let n = !1;
    for (let o = 0; o < t.selection.ranges.length && !n; o++) {
      let { $from: { pos: i }, $to: { pos: s } } = t.selection.ranges[o];
      t.doc.nodesBetween(i, s, (c, u) => {
        if (n)
          return !1;
        if (!(!c.isTextblock || c.hasMarkup(r, e)))
          if (c.type == r)
            n = !0;
          else {
            let d = t.doc.resolve(u), h = d.index();
            n = d.parent.canReplaceWith(h, h + 1, r);
          }
      });
    }
    if (!n)
      return !1;
    if (a) {
      let o = t.tr;
      for (let i = 0; i < t.selection.ranges.length; i++) {
        let { $from: { pos: s }, $to: { pos: c } } = t.selection.ranges[i];
        o.setBlockType(s, c, r, e);
      }
      a(o.scrollIntoView());
    }
    return !0;
  };
}
function mr(...r) {
  return function(e, t, a) {
    for (let n = 0; n < r.length; n++)
      if (r[n](e, t, a))
        return !0;
    return !1;
  };
}
mr(dr, en, rn);
mr(dr, nn, on);
mr(sn, ln, cn, zi);
typeof navigator < "u" ? /Mac|iP(hone|[oa]d)/.test(navigator.platform) : typeof os < "u" && os.platform && os.platform() == "darwin";
function Vi(r, e = null) {
  return function(t, a) {
    let { $from: n, $to: o } = t.selection, i = n.blockRange(o);
    if (!i)
      return !1;
    let s = a ? t.tr : null;
    return qi(s, i, r, e) ? (a && a(s.scrollIntoView()), !0) : !1;
  };
}
function qi(r, e, t, a = null) {
  let n = !1, o = e, i = e.$from.doc;
  if (e.depth >= 2 && e.$from.node(e.depth - 1).type.compatibleContent(t) && e.startIndex == 0) {
    if (e.$from.index(e.depth - 1) == 0)
      return !1;
    let c = i.resolve(e.start - 2);
    o = new Tt(c, c, e.depth), e.endIndex < e.parent.childCount && (e = new Tt(e.$from, i.resolve(e.$to.end(e.depth)), e.depth)), n = !0;
  }
  let s = Wa(o, t, a, e);
  return s ? (r && _i(r, e, s, n, t), !0) : !1;
}
function _i(r, e, t, a, n) {
  let o = x.empty;
  for (let d = t.length - 1; d >= 0; d--)
    o = x.from(t[d].type.create(t[d].attrs, o));
  r.step(new G(e.start - (a ? 2 : 0), e.end, e.start, e.end, new S(o, 0, 0), t.length, !0));
  let i = 0;
  for (let d = 0; d < t.length; d++)
    t[d].type == n && (i = d + 1);
  let s = t.length - i, c = e.start + t.length - (a ? 2 : 0), u = e.parent;
  for (let d = e.startIndex, h = e.endIndex, m = !0; d < h; d++, m = !1)
    !m && ie(r.doc, c, s) && (r.split(c, s), c += 2 * s), c += u.child(d).nodeSize;
  return r;
}
function Gi(r) {
  return function(e, t) {
    let { $from: a, $to: n } = e.selection, o = a.blockRange(n, (i) => i.childCount > 0 && i.firstChild.type == r);
    return o ? t ? a.node(o.depth - 1).type == r ? Ji(e, t, r, o) : Wi(e, t, o) : !0 : !1;
  };
}
function Ji(r, e, t, a) {
  let n = r.tr, o = a.end, i = a.$to.end(a.depth);
  o < i && (n.step(new G(o - 1, i, o, i, new S(x.from(t.create(null, a.parent.copy())), 1, 0), 1, !0)), a = new Tt(n.doc.resolve(a.$from.pos), n.doc.resolve(i), a.depth));
  const s = Be(a);
  if (s == null)
    return !1;
  n.lift(a, s);
  let c = n.doc.resolve(n.mapping.map(o, -1) - 1);
  return xe(n.doc, c.pos) && c.nodeBefore.type == c.nodeAfter.type && n.join(c.pos), e(n.scrollIntoView()), !0;
}
function Wi(r, e, t) {
  let a = r.tr, n = t.parent;
  for (let f = t.end, b = t.endIndex - 1, g = t.startIndex; b > g; b--)
    f -= n.child(b).nodeSize, a.delete(f - 1, f + 1);
  let o = a.doc.resolve(t.start), i = o.nodeAfter;
  if (a.mapping.map(t.end) != t.start + o.nodeAfter.nodeSize)
    return !1;
  let s = t.startIndex == 0, c = t.endIndex == n.childCount, u = o.node(-1), d = o.index(-1);
  if (!u.canReplace(d + (s ? 0 : 1), d + 1, i.content.append(c ? x.empty : x.from(n))))
    return !1;
  let h = o.pos, m = h + i.nodeSize;
  return a.step(new G(h - (s ? 1 : 0), m + (c ? 1 : 0), h + 1, m - 1, new S((s ? x.empty : x.from(n.copy(x.empty))).append(c ? x.empty : x.from(n.copy(x.empty))), s ? 0 : 1, c ? 0 : 1), s ? 0 : 1)), e(a.scrollIntoView()), !0;
}
function Ki(r) {
  return function(e, t) {
    let { $from: a, $to: n } = e.selection, o = a.blockRange(n, (u) => u.childCount > 0 && u.firstChild.type == r);
    if (!o)
      return !1;
    let i = o.startIndex;
    if (i == 0)
      return !1;
    let s = o.parent, c = s.child(i - 1);
    if (c.type != r)
      return !1;
    if (t) {
      let u = c.lastChild && c.lastChild.type == s.type, d = x.from(u ? r.create() : null), h = new S(x.from(r.create(null, x.from(s.type.create(null, d)))), u ? 3 : 1, 0), m = o.start, f = o.end;
      t(e.tr.step(new G(m - (u ? 3 : 1), f, m, f, h, 1, !0)).scrollIntoView());
    }
    return !0;
  };
}
function pn(r) {
  const { state: e, transaction: t } = r;
  let { selection: a } = t, { doc: n } = t, { storedMarks: o } = t;
  return {
    ...e,
    apply: e.apply.bind(e),
    applyTransaction: e.applyTransaction.bind(e),
    plugins: e.plugins,
    schema: e.schema,
    reconfigure: e.reconfigure.bind(e),
    toJSON: e.toJSON.bind(e),
    get storedMarks() {
      return o;
    },
    get selection() {
      return a;
    },
    get doc() {
      return n;
    },
    get tr() {
      return a = t.selection, n = t.doc, o = t.storedMarks, t;
    }
  };
}
class Yi {
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
    const { rawCommands: e, editor: t, state: a } = this, { view: n } = t, { tr: o } = a, i = this.buildProps(o);
    return Object.fromEntries(Object.entries(e).map(([s, c]) => [s, (...d) => {
      const h = c(...d)(i);
      return !o.getMeta("preventDispatch") && !this.hasCustomState && n.dispatch(o), h;
    }]));
  }
  get chain() {
    return () => this.createChain();
  }
  get can() {
    return () => this.createCan();
  }
  createChain(e, t = !0) {
    const { rawCommands: a, editor: n, state: o } = this, { view: i } = n, s = [], c = !!e, u = e || o.tr, d = () => (!c && t && !u.getMeta("preventDispatch") && !this.hasCustomState && i.dispatch(u), s.every((m) => m === !0)), h = {
      ...Object.fromEntries(Object.entries(a).map(([m, f]) => [m, (...g) => {
        const y = this.buildProps(u, t), w = f(...g)(y);
        return s.push(w), h;
      }])),
      run: d
    };
    return h;
  }
  createCan(e) {
    const { rawCommands: t, state: a } = this, n = !1, o = e || a.tr, i = this.buildProps(o, n);
    return {
      ...Object.fromEntries(Object.entries(t).map(([c, u]) => [c, (...d) => u(...d)({ ...i, dispatch: void 0 })])),
      chain: () => this.createChain(o, n)
    };
  }
  buildProps(e, t = !0) {
    const { rawCommands: a, editor: n, state: o } = this, { view: i } = n, s = {
      tr: e,
      editor: n,
      view: i,
      state: pn({
        state: o,
        transaction: e
      }),
      dispatch: t ? () => {
      } : void 0,
      chain: () => this.createChain(e, t),
      can: () => this.createCan(e),
      get commands() {
        return Object.fromEntries(Object.entries(a).map(([c, u]) => [c, (...d) => u(...d)(s)]));
      }
    };
    return s;
  }
}
function Z(r, e, t) {
  return r.config[e] === void 0 && r.parent ? Z(r.parent, e, t) : typeof r.config[e] == "function" ? r.config[e].bind({
    ...t,
    parent: r.parent ? Z(r.parent, e, t) : null
  }) : r.config[e];
}
function Zi(r) {
  const e = r.filter((n) => n.type === "extension"), t = r.filter((n) => n.type === "node"), a = r.filter((n) => n.type === "mark");
  return {
    baseExtensions: e,
    nodeExtensions: t,
    markExtensions: a
  };
}
function D(r, e) {
  if (typeof r == "string") {
    if (!e.nodes[r])
      throw Error(`There is no node type named '${r}'. Maybe you forgot to add the extension?`);
    return e.nodes[r];
  }
  return r;
}
function hn(...r) {
  return r.filter((e) => !!e).reduce((e, t) => {
    const a = { ...e };
    return Object.entries(t).forEach(([n, o]) => {
      if (!a[n]) {
        a[n] = o;
        return;
      }
      if (n === "class") {
        const s = o ? String(o).split(" ") : [], c = a[n] ? a[n].split(" ") : [], u = s.filter((d) => !c.includes(d));
        a[n] = [...c, ...u].join(" ");
      } else if (n === "style") {
        const s = o ? o.split(";").map((d) => d.trim()).filter(Boolean) : [], c = a[n] ? a[n].split(";").map((d) => d.trim()).filter(Boolean) : [], u = /* @__PURE__ */ new Map();
        c.forEach((d) => {
          const [h, m] = d.split(":").map((f) => f.trim());
          u.set(h, m);
        }), s.forEach((d) => {
          const [h, m] = d.split(":").map((f) => f.trim());
          u.set(h, m);
        }), a[n] = Array.from(u.entries()).map(([d, h]) => `${d}: ${h}`).join("; ");
      } else
        a[n] = o;
    }), a;
  }, {});
}
function Qi(r, e) {
  return e.filter((t) => t.type === r.type.name).filter((t) => t.attribute.rendered).map((t) => t.attribute.renderHTML ? t.attribute.renderHTML(r.attrs) || {} : {
    [t.name]: r.attrs[t.name]
  }).reduce((t, a) => hn(t, a), {});
}
function Xi(r) {
  return typeof r == "function";
}
function oe(r, e = void 0, ...t) {
  return Xi(r) ? e ? r.bind(e)(...t) : r(...t) : r;
}
function es(r) {
  return Object.prototype.toString.call(r) === "[object RegExp]";
}
function ts(r) {
  return Object.prototype.toString.call(r).slice(8, -1);
}
function bt(r) {
  return ts(r) !== "Object" ? !1 : r.constructor === Object && Object.getPrototypeOf(r) === Object.prototype;
}
function fr(r, e) {
  const t = { ...r };
  return bt(r) && bt(e) && Object.keys(e).forEach((a) => {
    bt(e[a]) && bt(r[a]) ? t[a] = fr(r[a], e[a]) : t[a] = e[a];
  }), t;
}
class X {
  constructor(e = {}) {
    this.type = "extension", this.name = "extension", this.parent = null, this.child = null, this.config = {
      name: this.name,
      defaultOptions: {}
    }, this.config = {
      ...this.config,
      ...e
    }, this.name = this.config.name, e.defaultOptions && Object.keys(e.defaultOptions).length > 0 && console.warn(`[tiptap warn]: BREAKING CHANGE: "defaultOptions" is deprecated. Please use "addOptions" instead. Found in extension: "${this.name}".`), this.options = this.config.defaultOptions, this.config.addOptions && (this.options = oe(Z(this, "addOptions", {
      name: this.name
    }))), this.storage = oe(Z(this, "addStorage", {
      name: this.name,
      options: this.options
    })) || {};
  }
  static create(e = {}) {
    return new X(e);
  }
  configure(e = {}) {
    const t = this.extend({
      ...this.config,
      addOptions: () => fr(this.options, e)
    });
    return t.name = this.name, t.parent = this.parent, t;
  }
  extend(e = {}) {
    const t = new X({ ...this.config, ...e });
    return t.parent = this, this.child = t, t.name = e.name ? e.name : t.parent.name, e.defaultOptions && Object.keys(e.defaultOptions).length > 0 && console.warn(`[tiptap warn]: BREAKING CHANGE: "defaultOptions" is deprecated. Please use "addOptions" instead. Found in extension: "${t.name}".`), t.options = oe(Z(t, "addOptions", {
      name: t.name
    })), t.storage = oe(Z(t, "addStorage", {
      name: t.name,
      options: t.options
    })), t;
  }
}
function rs(r, e, t) {
  const { from: a, to: n } = e, { blockSeparator: o = `

`, textSerializers: i = {} } = t || {};
  let s = "";
  return r.nodesBetween(a, n, (c, u, d, h) => {
    var m;
    c.isBlock && u > a && (s += o);
    const f = i == null ? void 0 : i[c.type.name];
    if (f)
      return d && (s += f({
        node: c,
        pos: u,
        parent: d,
        index: h,
        range: e
      })), !1;
    c.isText && (s += (m = c == null ? void 0 : c.text) === null || m === void 0 ? void 0 : m.slice(Math.max(a, u) - u, n - u));
  }), s;
}
function as(r) {
  return Object.fromEntries(Object.entries(r.nodes).filter(([, e]) => e.spec.toText).map(([e, t]) => [e, t.spec.toText]));
}
X.create({
  name: "clipboardTextSerializer",
  addOptions() {
    return {
      blockSeparator: void 0
    };
  },
  addProseMirrorPlugins() {
    return [
      new ke({
        key: new Se("clipboardTextSerializer"),
        props: {
          clipboardTextSerializer: () => {
            const { editor: r } = this, { state: e, schema: t } = r, { doc: a, selection: n } = e, { ranges: o } = n, i = Math.min(...o.map((d) => d.$from.pos)), s = Math.max(...o.map((d) => d.$to.pos)), c = as(t);
            return rs(a, { from: i, to: s }, {
              ...this.options.blockSeparator !== void 0 ? { blockSeparator: this.options.blockSeparator } : {},
              textSerializers: c
            });
          }
        }
      })
    ];
  }
});
const ns = () => ({ editor: r, view: e }) => (requestAnimationFrame(() => {
  var t;
  r.isDestroyed || (e.dom.blur(), (t = window == null ? void 0 : window.getSelection()) === null || t === void 0 || t.removeAllRanges());
}), !0), is = (r = !1) => ({ commands: e }) => e.setContent("", r), ss = () => ({ state: r, tr: e, dispatch: t }) => {
  const { selection: a } = e, { ranges: n } = a;
  return t && n.forEach(({ $from: o, $to: i }) => {
    r.doc.nodesBetween(o.pos, i.pos, (s, c) => {
      if (s.type.isText)
        return;
      const { doc: u, mapping: d } = e, h = u.resolve(d.map(c)), m = u.resolve(d.map(c + s.nodeSize)), f = h.blockRange(m);
      if (!f)
        return;
      const b = Be(f);
      if (s.type.isTextblock) {
        const { defaultType: g } = h.parent.contentMatchAt(h.index());
        e.setNodeMarkup(f.start, g);
      }
      (b || b === 0) && e.lift(f, b);
    });
  }), !0;
}, ls = (r) => (e) => r(e), cs = () => ({ state: r, dispatch: e }) => ln(r, e), ds = (r, e) => ({ editor: t, tr: a }) => {
  const { state: n } = t, o = n.doc.slice(r.from, r.to);
  a.deleteRange(r.from, r.to);
  const i = a.mapping.map(e);
  return a.insert(i, o.content), a.setSelection(new O(a.doc.resolve(Math.max(i - 1, 0)))), !0;
}, us = () => ({ tr: r, dispatch: e }) => {
  const { selection: t } = r, a = t.$anchor.node();
  if (a.content.size > 0)
    return !1;
  const n = r.selection.$anchor;
  for (let o = n.depth; o > 0; o -= 1)
    if (n.node(o).type === a.type) {
      if (e) {
        const s = n.before(o), c = n.after(o);
        r.delete(s, c).scrollIntoView();
      }
      return !0;
    }
  return !1;
}, ps = (r) => ({ tr: e, state: t, dispatch: a }) => {
  const n = D(r, t.schema), o = e.selection.$anchor;
  for (let i = o.depth; i > 0; i -= 1)
    if (o.node(i).type === n) {
      if (a) {
        const c = o.before(i), u = o.after(i);
        e.delete(c, u).scrollIntoView();
      }
      return !0;
    }
  return !1;
}, hs = (r) => ({ tr: e, dispatch: t }) => {
  const { from: a, to: n } = r;
  return t && e.delete(a, n), !0;
}, ms = () => ({ state: r, dispatch: e }) => dr(r, e), fs = () => ({ commands: r }) => r.keyboardShortcut("Enter"), gs = () => ({ state: r, dispatch: e }) => Oi(r, e);
function It(r, e, t = { strict: !0 }) {
  const a = Object.keys(e);
  return a.length ? a.every((n) => t.strict ? e[n] === r[n] : es(e[n]) ? e[n].test(r[n]) : e[n] === r[n]) : !0;
}
function mn(r, e, t = {}) {
  return r.find((a) => a.type === e && It(
    // Only check equality for the attributes that are provided
    Object.fromEntries(Object.keys(t).map((n) => [n, a.attrs[n]])),
    t
  ));
}
function Qr(r, e, t = {}) {
  return !!mn(r, e, t);
}
function fn(r, e, t) {
  var a;
  if (!r || !e)
    return;
  let n = r.parent.childAfter(r.parentOffset);
  if ((!n.node || !n.node.marks.some((d) => d.type === e)) && (n = r.parent.childBefore(r.parentOffset)), !n.node || !n.node.marks.some((d) => d.type === e) || (t = t || ((a = n.node.marks[0]) === null || a === void 0 ? void 0 : a.attrs), !mn([...n.node.marks], e, t)))
    return;
  let i = n.index, s = r.start() + n.offset, c = i + 1, u = s + n.node.nodeSize;
  for (; i > 0 && Qr([...r.parent.child(i - 1).marks], e, t); )
    i -= 1, s -= r.parent.child(i).nodeSize;
  for (; c < r.parent.childCount && Qr([...r.parent.child(c).marks], e, t); )
    u += r.parent.child(c).nodeSize, c += 1;
  return {
    from: s,
    to: u
  };
}
function ce(r, e) {
  if (typeof r == "string") {
    if (!e.marks[r])
      throw Error(`There is no mark type named '${r}'. Maybe you forgot to add the extension?`);
    return e.marks[r];
  }
  return r;
}
const bs = (r, e = {}) => ({ tr: t, state: a, dispatch: n }) => {
  const o = ce(r, a.schema), { doc: i, selection: s } = t, { $from: c, from: u, to: d } = s;
  if (n) {
    const h = fn(c, o, e);
    if (h && h.from <= u && h.to >= d) {
      const m = O.create(i, h.from, h.to);
      t.setSelection(m);
    }
  }
  return !0;
}, ys = (r) => (e) => {
  const t = typeof r == "function" ? r(e) : r;
  for (let a = 0; a < t.length; a += 1)
    if (t[a](e))
      return !0;
  return !1;
};
function gn(r) {
  return r instanceof O;
}
function fe(r = 0, e = 0, t = 0) {
  return Math.min(Math.max(r, e), t);
}
function vs(r, e = null) {
  if (!e)
    return null;
  const t = E.atStart(r), a = E.atEnd(r);
  if (e === "start" || e === !0)
    return t;
  if (e === "end")
    return a;
  const n = t.from, o = a.to;
  return e === "all" ? O.create(r, fe(0, n, o), fe(r.content.size, n, o)) : O.create(r, fe(e, n, o), fe(e, n, o));
}
function tr() {
  return navigator.platform === "Android" || /android/i.test(navigator.userAgent);
}
function ct() {
  return [
    "iPad Simulator",
    "iPhone Simulator",
    "iPod Simulator",
    "iPad",
    "iPhone",
    "iPod"
  ].includes(navigator.platform) || navigator.userAgent.includes("Mac") && "ontouchend" in document;
}
function ws() {
  return typeof navigator < "u" ? /^((?!chrome|android).)*safari/i.test(navigator.userAgent) : !1;
}
const xs = (r = null, e = {}) => ({ editor: t, view: a, tr: n, dispatch: o }) => {
  e = {
    scrollIntoView: !0,
    ...e
  };
  const i = () => {
    (ct() || tr()) && a.dom.focus(), requestAnimationFrame(() => {
      t.isDestroyed || (a.focus(), ws() && !ct() && !tr() && a.dom.focus({ preventScroll: !0 }));
    });
  };
  if (a.hasFocus() && r === null || r === !1)
    return !0;
  if (o && r === null && !gn(t.state.selection))
    return i(), !0;
  const s = vs(n.doc, r) || t.state.selection, c = t.state.selection.eq(s);
  return o && (c || n.setSelection(s), c && n.storedMarks && n.setStoredMarks(n.storedMarks), i()), !0;
}, ks = (r, e) => (t) => r.every((a, n) => e(a, { ...t, index: n })), Ss = (r, e) => ({ tr: t, commands: a }) => a.insertContentAt({ from: t.selection.from, to: t.selection.to }, r, e), bn = (r) => {
  const e = r.childNodes;
  for (let t = e.length - 1; t >= 0; t -= 1) {
    const a = e[t];
    a.nodeType === 3 && a.nodeValue && /^(\n\s\s|\n)$/.test(a.nodeValue) ? r.removeChild(a) : a.nodeType === 1 && bn(a);
  }
  return r;
};
function yt(r) {
  const e = `<body>${r}</body>`, t = new window.DOMParser().parseFromString(e, "text/html").body;
  return bn(t);
}
function dt(r, e, t) {
  if (r instanceof ye || r instanceof x)
    return r;
  t = {
    slice: !0,
    parseOptions: {},
    ...t
  };
  const a = typeof r == "object" && r !== null, n = typeof r == "string";
  if (a)
    try {
      if (Array.isArray(r) && r.length > 0)
        return x.fromArray(r.map((s) => e.nodeFromJSON(s)));
      const i = e.nodeFromJSON(r);
      return t.errorOnInvalidContent && i.check(), i;
    } catch (o) {
      if (t.errorOnInvalidContent)
        throw new Error("[tiptap error]: Invalid JSON content", { cause: o });
      return console.warn("[tiptap warn]: Invalid content.", "Passed value:", r, "Error:", o), dt("", e, t);
    }
  if (n) {
    if (t.errorOnInvalidContent) {
      let i = !1, s = "";
      const c = new hi({
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
                getAttrs: (u) => (i = !0, s = typeof u == "string" ? u : u.outerHTML, null)
              }
            ]
          }
        })
      });
      if (t.slice ? Te.fromSchema(c).parseSlice(yt(r), t.parseOptions) : Te.fromSchema(c).parse(yt(r), t.parseOptions), t.errorOnInvalidContent && i)
        throw new Error("[tiptap error]: Invalid HTML content", { cause: new Error(`Invalid element found: ${s}`) });
    }
    const o = Te.fromSchema(e);
    return t.slice ? o.parseSlice(yt(r), t.parseOptions).content : o.parse(yt(r), t.parseOptions);
  }
  return dt("", e, t);
}
function Cs(r, e, t) {
  const a = r.steps.length - 1;
  if (a < e)
    return;
  const n = r.steps[a];
  if (!(n instanceof q || n instanceof G))
    return;
  const o = r.mapping.maps[a];
  let i = 0;
  o.forEach((s, c, u, d) => {
    i === 0 && (i = d);
  }), r.setSelection(E.near(r.doc.resolve(i), t));
}
const Ns = (r) => !("type" in r), As = (r, e, t) => ({ tr: a, dispatch: n, editor: o }) => {
  var i;
  if (n) {
    t = {
      parseOptions: o.options.parseOptions,
      updateSelection: !0,
      applyInputRules: !1,
      applyPasteRules: !1,
      ...t
    };
    let s;
    const c = (y) => {
      o.emit("contentError", {
        editor: o,
        error: y,
        disableCollaboration: () => {
          o.storage.collaboration && (o.storage.collaboration.isDisabled = !0);
        }
      });
    }, u = {
      preserveWhitespace: "full",
      ...t.parseOptions
    };
    if (!t.errorOnInvalidContent && !o.options.enableContentCheck && o.options.emitContentError)
      try {
        dt(e, o.schema, {
          parseOptions: u,
          errorOnInvalidContent: !0
        });
      } catch (y) {
        c(y);
      }
    try {
      s = dt(e, o.schema, {
        parseOptions: u,
        errorOnInvalidContent: (i = t.errorOnInvalidContent) !== null && i !== void 0 ? i : o.options.enableContentCheck
      });
    } catch (y) {
      return c(y), !1;
    }
    let { from: d, to: h } = typeof r == "number" ? { from: r, to: r } : { from: r.from, to: r.to }, m = !0, f = !0;
    if ((Ns(s) ? s : [s]).forEach((y) => {
      y.check(), m = m ? y.isText && y.marks.length === 0 : !1, f = f ? y.isBlock : !1;
    }), d === h && f) {
      const { parent: y } = a.doc.resolve(d);
      y.isTextblock && !y.type.spec.code && !y.childCount && (d -= 1, h += 1);
    }
    let g;
    if (m) {
      if (Array.isArray(e))
        g = e.map((y) => y.text || "").join("");
      else if (e instanceof x) {
        let y = "";
        e.forEach((w) => {
          w.text && (y += w.text);
        }), g = y;
      } else typeof e == "object" && e && e.text ? g = e.text : g = e;
      a.insertText(g, d, h);
    } else
      g = s, a.replaceWith(d, h, g);
    t.updateSelection && Cs(a, a.steps.length - 1, -1), t.applyInputRules && a.setMeta("applyInputRules", { from: d, text: g }), t.applyPasteRules && a.setMeta("applyPasteRules", { from: d, text: g });
  }
  return !0;
}, Ts = () => ({ state: r, dispatch: e }) => Hi(r, e), Es = () => ({ state: r, dispatch: e }) => Ri(r, e), Ls = () => ({ state: r, dispatch: e }) => en(r, e), Ms = () => ({ state: r, dispatch: e }) => nn(r, e), Is = () => ({ state: r, dispatch: e, tr: t }) => {
  try {
    const a = zt(r.doc, r.selection.$from.pos, -1);
    return a == null ? !1 : (t.join(a, 2), e && e(t), !0);
  } catch {
    return !1;
  }
}, Hs = () => ({ state: r, dispatch: e, tr: t }) => {
  try {
    const a = zt(r.doc, r.selection.$from.pos, 1);
    return a == null ? !1 : (t.join(a, 2), e && e(t), !0);
  } catch {
    return !1;
  }
}, Rs = () => ({ state: r, dispatch: e }) => Mi(r, e), Ps = () => ({ state: r, dispatch: e }) => Ii(r, e);
function yn() {
  return typeof navigator < "u" ? /Mac/.test(navigator.platform) : !1;
}
function Os(r) {
  const e = r.split(/-(?!$)/);
  let t = e[e.length - 1];
  t === "Space" && (t = " ");
  let a, n, o, i;
  for (let s = 0; s < e.length - 1; s += 1) {
    const c = e[s];
    if (/^(cmd|meta|m)$/i.test(c))
      i = !0;
    else if (/^a(lt)?$/i.test(c))
      a = !0;
    else if (/^(c|ctrl|control)$/i.test(c))
      n = !0;
    else if (/^s(hift)?$/i.test(c))
      o = !0;
    else if (/^mod$/i.test(c))
      ct() || yn() ? i = !0 : n = !0;
    else
      throw new Error(`Unrecognized modifier name: ${c}`);
  }
  return a && (t = `Alt-${t}`), n && (t = `Ctrl-${t}`), i && (t = `Meta-${t}`), o && (t = `Shift-${t}`), t;
}
const Bs = (r) => ({ editor: e, view: t, tr: a, dispatch: n }) => {
  const o = Os(r).split(/-(?!$)/), i = o.find((u) => !["Alt", "Ctrl", "Meta", "Shift"].includes(u)), s = new KeyboardEvent("keydown", {
    key: i === "Space" ? " " : i,
    altKey: o.includes("Alt"),
    ctrlKey: o.includes("Ctrl"),
    metaKey: o.includes("Meta"),
    shiftKey: o.includes("Shift"),
    bubbles: !0,
    cancelable: !0
  }), c = e.captureTransaction(() => {
    t.someProp("handleKeyDown", (u) => u(t, s));
  });
  return c == null || c.steps.forEach((u) => {
    const d = u.map(a.mapping);
    d && n && a.maybeStep(d);
  }), !0;
};
function gr(r, e, t = {}) {
  const { from: a, to: n, empty: o } = r.selection, i = e ? D(e, r.schema) : null, s = [];
  r.doc.nodesBetween(a, n, (h, m) => {
    if (h.isText)
      return;
    const f = Math.max(a, m), b = Math.min(n, m + h.nodeSize);
    s.push({
      node: h,
      from: f,
      to: b
    });
  });
  const c = n - a, u = s.filter((h) => i ? i.name === h.node.type.name : !0).filter((h) => It(h.node.attrs, t, { strict: !1 }));
  return o ? !!u.length : u.reduce((h, m) => h + m.to - m.from, 0) >= c;
}
const zs = (r, e = {}) => ({ state: t, dispatch: a }) => {
  const n = D(r, t.schema);
  return gr(t, n, e) ? Pi(t, a) : !1;
}, $s = () => ({ state: r, dispatch: e }) => cn(r, e), Us = (r) => ({ state: e, dispatch: t }) => {
  const a = D(r, e.schema);
  return Gi(a)(e, t);
}, Fs = () => ({ state: r, dispatch: e }) => sn(r, e);
function vn(r, e) {
  return e.nodes[r] ? "node" : e.marks[r] ? "mark" : null;
}
function Xr(r, e) {
  const t = typeof e == "string" ? [e] : e;
  return Object.keys(r).reduce((a, n) => (t.includes(n) || (a[n] = r[n]), a), {});
}
const js = (r, e) => ({ tr: t, state: a, dispatch: n }) => {
  let o = null, i = null;
  const s = vn(typeof r == "string" ? r : r.name, a.schema);
  return s ? (s === "node" && (o = D(r, a.schema)), s === "mark" && (i = ce(r, a.schema)), n && t.selection.ranges.forEach((c) => {
    a.doc.nodesBetween(c.$from.pos, c.$to.pos, (u, d) => {
      o && o === u.type && t.setNodeMarkup(d, void 0, Xr(u.attrs, e)), i && u.marks.length && u.marks.forEach((h) => {
        i === h.type && t.addMark(d, d + u.nodeSize, i.create(Xr(h.attrs, e)));
      });
    });
  }), !0) : !1;
}, Ds = () => ({ tr: r, dispatch: e }) => (e && r.scrollIntoView(), !0), Vs = () => ({ tr: r, dispatch: e }) => {
  if (e) {
    const t = new K(r.doc);
    r.setSelection(t);
  }
  return !0;
}, qs = () => ({ state: r, dispatch: e }) => rn(r, e), _s = () => ({ state: r, dispatch: e }) => on(r, e), Gs = () => ({ state: r, dispatch: e }) => $i(r, e), Js = () => ({ state: r, dispatch: e }) => ji(r, e), Ws = () => ({ state: r, dispatch: e }) => Fi(r, e);
function Ks(r, e, t = {}, a = {}) {
  return dt(r, e, {
    slice: !1,
    parseOptions: t,
    errorOnInvalidContent: a.errorOnInvalidContent
  });
}
const Ys = (r, e = !1, t = {}, a = {}) => ({ editor: n, tr: o, dispatch: i, commands: s }) => {
  var c, u;
  const { doc: d } = o;
  if (t.preserveWhitespace !== "full") {
    const h = Ks(r, n.schema, t, {
      errorOnInvalidContent: (c = a.errorOnInvalidContent) !== null && c !== void 0 ? c : n.options.enableContentCheck
    });
    return i && o.replaceWith(0, d.content.size, h).setMeta("preventUpdate", !e), !0;
  }
  return i && o.setMeta("preventUpdate", !e), s.insertContentAt({ from: 0, to: d.content.size }, r, {
    parseOptions: t,
    errorOnInvalidContent: (u = a.errorOnInvalidContent) !== null && u !== void 0 ? u : n.options.enableContentCheck
  });
};
function Zs(r, e) {
  const t = ce(e, r.schema), { from: a, to: n, empty: o } = r.selection, i = [];
  o ? (r.storedMarks && i.push(...r.storedMarks), i.push(...r.selection.$head.marks())) : r.doc.nodesBetween(a, n, (c) => {
    i.push(...c.marks);
  });
  const s = i.find((c) => c.type.name === t.name);
  return s ? { ...s.attrs } : {};
}
function Qs(r) {
  for (let e = 0; e < r.edgeCount; e += 1) {
    const { type: t } = r.edge(e);
    if (t.isTextblock && !t.hasRequiredAttrs())
      return t;
  }
  return null;
}
function Xs(r, e) {
  for (let t = r.depth; t > 0; t -= 1) {
    const a = r.node(t);
    if (e(a))
      return {
        pos: t > 0 ? r.before(t) : 0,
        start: r.start(t),
        depth: t,
        node: a
      };
  }
}
function br(r) {
  return (e) => Xs(e.$from, r);
}
function wt(r, e, t) {
  return Object.fromEntries(Object.entries(t).filter(([a]) => {
    const n = r.find((o) => o.type === e && o.name === a);
    return n ? n.attribute.keepOnSplit : !1;
  }));
}
function el(r, e, t = {}) {
  const { empty: a, ranges: n } = r.selection, o = e ? ce(e, r.schema) : null;
  if (a)
    return !!(r.storedMarks || r.selection.$from.marks()).filter((h) => o ? o.name === h.type.name : !0).find((h) => It(h.attrs, t, { strict: !1 }));
  let i = 0;
  const s = [];
  if (n.forEach(({ $from: h, $to: m }) => {
    const f = h.pos, b = m.pos;
    r.doc.nodesBetween(f, b, (g, y) => {
      if (!g.isText && !g.marks.length)
        return;
      const w = Math.max(f, y), C = Math.min(b, y + g.nodeSize), A = C - w;
      i += A, s.push(...g.marks.map((B) => ({
        mark: B,
        from: w,
        to: C
      })));
    });
  }), i === 0)
    return !1;
  const c = s.filter((h) => o ? o.name === h.mark.type.name : !0).filter((h) => It(h.mark.attrs, t, { strict: !1 })).reduce((h, m) => h + m.to - m.from, 0), u = s.filter((h) => o ? h.mark.type !== o && h.mark.type.excludes(o) : !0).reduce((h, m) => h + m.to - m.from, 0);
  return (c > 0 ? c + u : c) >= i;
}
function ea(r, e) {
  const { nodeExtensions: t } = Zi(e), a = t.find((i) => i.name === r);
  if (!a)
    return !1;
  const n = {
    name: a.name,
    options: a.options,
    storage: a.storage
  }, o = oe(Z(a, "group", n));
  return typeof o != "string" ? !1 : o.split(" ").includes("list");
}
function wn(r, { checkChildren: e = !0, ignoreWhitespace: t = !1 } = {}) {
  var a;
  if (t) {
    if (r.type.name === "hardBreak")
      return !0;
    if (r.isText)
      return /^\s*$/m.test((a = r.text) !== null && a !== void 0 ? a : "");
  }
  if (r.isText)
    return !r.text;
  if (r.isAtom || r.isLeaf)
    return !1;
  if (r.content.childCount === 0)
    return !0;
  if (e) {
    let n = !0;
    return r.content.forEach((o) => {
      n !== !1 && (wn(o, { ignoreWhitespace: t, checkChildren: e }) || (n = !1));
    }), n;
  }
  return !1;
}
function tl(r, e, t) {
  var a;
  const { selection: n } = e;
  let o = null;
  if (gn(n) && (o = n.$cursor), o) {
    const s = (a = r.storedMarks) !== null && a !== void 0 ? a : o.marks();
    return !!t.isInSet(s) || !s.some((c) => c.type.excludes(t));
  }
  const { ranges: i } = n;
  return i.some(({ $from: s, $to: c }) => {
    let u = s.depth === 0 ? r.doc.inlineContent && r.doc.type.allowsMarkType(t) : !1;
    return r.doc.nodesBetween(s.pos, c.pos, (d, h, m) => {
      if (u)
        return !1;
      if (d.isInline) {
        const f = !m || m.type.allowsMarkType(t), b = !!t.isInSet(d.marks) || !d.marks.some((g) => g.type.excludes(t));
        u = f && b;
      }
      return !u;
    }), u;
  });
}
const rl = (r, e = {}) => ({ tr: t, state: a, dispatch: n }) => {
  const { selection: o } = t, { empty: i, ranges: s } = o, c = ce(r, a.schema);
  if (n)
    if (i) {
      const u = Zs(a, c);
      t.addStoredMark(c.create({
        ...u,
        ...e
      }));
    } else
      s.forEach((u) => {
        const d = u.$from.pos, h = u.$to.pos;
        a.doc.nodesBetween(d, h, (m, f) => {
          const b = Math.max(f, d), g = Math.min(f + m.nodeSize, h);
          m.marks.find((w) => w.type === c) ? m.marks.forEach((w) => {
            c === w.type && t.addMark(b, g, c.create({
              ...w.attrs,
              ...e
            }));
          }) : t.addMark(b, g, c.create(e));
        });
      });
  return tl(a, t, c);
}, al = (r, e) => ({ tr: t }) => (t.setMeta(r, e), !0), nl = (r, e = {}) => ({ state: t, dispatch: a, chain: n }) => {
  const o = D(r, t.schema);
  let i;
  return t.selection.$anchor.sameParent(t.selection.$head) && (i = t.selection.$anchor.parent.attrs), o.isTextblock ? n().command(({ commands: s }) => Zr(o, { ...i, ...e })(t) ? !0 : s.clearNodes()).command(({ state: s }) => Zr(o, { ...i, ...e })(s, a)).run() : (console.warn('[tiptap warn]: Currently "setNode()" only supports text block nodes.'), !1);
}, ol = (r) => ({ tr: e, dispatch: t }) => {
  if (t) {
    const { doc: a } = e, n = fe(r, 0, a.content.size), o = L.create(a, n);
    e.setSelection(o);
  }
  return !0;
}, il = (r) => ({ tr: e, dispatch: t }) => {
  if (t) {
    const { doc: a } = e, { from: n, to: o } = typeof r == "number" ? { from: r, to: r } : r, i = O.atStart(a).from, s = O.atEnd(a).to, c = fe(n, i, s), u = fe(o, i, s), d = O.create(a, c, u);
    e.setSelection(d);
  }
  return !0;
}, sl = (r) => ({ state: e, dispatch: t }) => {
  const a = D(r, e.schema);
  return Ki(a)(e, t);
};
function ta(r, e) {
  const t = r.storedMarks || r.selection.$to.parentOffset && r.selection.$from.marks();
  if (t) {
    const a = t.filter((n) => e == null ? void 0 : e.includes(n.type.name));
    r.tr.ensureMarks(a);
  }
}
const ll = ({ keepMarks: r = !0 } = {}) => ({ tr: e, state: t, dispatch: a, editor: n }) => {
  const { selection: o, doc: i } = e, { $from: s, $to: c } = o, u = n.extensionManager.attributes, d = wt(u, s.node().type.name, s.node().attrs);
  if (o instanceof L && o.node.isBlock)
    return !s.parentOffset || !ie(i, s.pos) ? !1 : (a && (r && ta(t, n.extensionManager.splittableMarks), e.split(s.pos).scrollIntoView()), !0);
  if (!s.parent.isBlock)
    return !1;
  const h = c.parentOffset === c.parent.content.size, m = s.depth === 0 ? void 0 : Qs(s.node(-1).contentMatchAt(s.indexAfter(-1)));
  let f = h && m ? [
    {
      type: m,
      attrs: d
    }
  ] : void 0, b = ie(e.doc, e.mapping.map(s.pos), 1, f);
  if (!f && !b && ie(e.doc, e.mapping.map(s.pos), 1, m ? [{ type: m }] : void 0) && (b = !0, f = m ? [
    {
      type: m,
      attrs: d
    }
  ] : void 0), a) {
    if (b && (o instanceof O && e.deleteSelection(), e.split(e.mapping.map(s.pos), 1, f), m && !h && !s.parentOffset && s.parent.type !== m)) {
      const g = e.mapping.map(s.before()), y = e.doc.resolve(g);
      s.node(-1).canReplaceWith(y.index(), y.index() + 1, m) && e.setNodeMarkup(e.mapping.map(s.before()), m);
    }
    r && ta(t, n.extensionManager.splittableMarks), e.scrollIntoView();
  }
  return b;
}, cl = (r, e = {}) => ({ tr: t, state: a, dispatch: n, editor: o }) => {
  var i;
  const s = D(r, a.schema), { $from: c, $to: u } = a.selection, d = a.selection.node;
  if (d && d.isBlock || c.depth < 2 || !c.sameParent(u))
    return !1;
  const h = c.node(-1);
  if (h.type !== s)
    return !1;
  const m = o.extensionManager.attributes;
  if (c.parent.content.size === 0 && c.node(-1).childCount === c.indexAfter(-1)) {
    if (c.depth === 2 || c.node(-3).type !== s || c.index(-2) !== c.node(-2).childCount - 1)
      return !1;
    if (n) {
      let w = x.empty;
      const C = c.index(-1) ? 1 : c.index(-2) ? 2 : 3;
      for (let _ = c.depth - C; _ >= c.depth - 3; _ -= 1)
        w = x.from(c.node(_).copy(w));
      const A = c.indexAfter(-1) < c.node(-2).childCount ? 1 : c.indexAfter(-2) < c.node(-3).childCount ? 2 : 3, B = {
        ...wt(m, c.node().type.name, c.node().attrs),
        ...e
      }, R = ((i = s.contentMatch.defaultType) === null || i === void 0 ? void 0 : i.createAndFill(B)) || void 0;
      w = w.append(x.from(s.createAndFill(null, R) || void 0));
      const M = c.before(c.depth - (C - 1));
      t.replace(M, c.after(-A), new S(w, 4 - C, 0));
      let P = -1;
      t.doc.nodesBetween(M, t.doc.content.size, (_, ut) => {
        if (P > -1)
          return !1;
        _.isTextblock && _.content.size === 0 && (P = ut + 1);
      }), P > -1 && t.setSelection(O.near(t.doc.resolve(P))), t.scrollIntoView();
    }
    return !0;
  }
  const f = u.pos === c.end() ? h.contentMatchAt(0).defaultType : null, b = {
    ...wt(m, h.type.name, h.attrs),
    ...e
  }, g = {
    ...wt(m, c.node().type.name, c.node().attrs),
    ...e
  };
  t.delete(c.pos, u.pos);
  const y = f ? [
    { type: s, attrs: b },
    { type: f, attrs: g }
  ] : [{ type: s, attrs: b }];
  if (!ie(t.doc, c.pos, 2))
    return !1;
  if (n) {
    const { selection: w, storedMarks: C } = a, { splittableMarks: A } = o.extensionManager, B = C || w.$to.parentOffset && w.$from.marks();
    if (t.split(c.pos, 2, y).scrollIntoView(), !B || !n)
      return !0;
    const R = B.filter((M) => A.includes(M.type.name));
    t.ensureMarks(R);
  }
  return !0;
}, _t = (r, e) => {
  const t = br((i) => i.type === e)(r.selection);
  if (!t)
    return !0;
  const a = r.doc.resolve(Math.max(0, t.pos - 1)).before(t.depth);
  if (a === void 0)
    return !0;
  const n = r.doc.nodeAt(a);
  return t.node.type === (n == null ? void 0 : n.type) && xe(r.doc, t.pos) && r.join(t.pos), !0;
}, Gt = (r, e) => {
  const t = br((i) => i.type === e)(r.selection);
  if (!t)
    return !0;
  const a = r.doc.resolve(t.start).after(t.depth);
  if (a === void 0)
    return !0;
  const n = r.doc.nodeAt(a);
  return t.node.type === (n == null ? void 0 : n.type) && xe(r.doc, a) && r.join(a), !0;
}, dl = (r, e, t, a = {}) => ({ editor: n, tr: o, state: i, dispatch: s, chain: c, commands: u, can: d }) => {
  const { extensions: h, splittableMarks: m } = n.extensionManager, f = D(r, i.schema), b = D(e, i.schema), { selection: g, storedMarks: y } = i, { $from: w, $to: C } = g, A = w.blockRange(C), B = y || g.$to.parentOffset && g.$from.marks();
  if (!A)
    return !1;
  const R = br((M) => ea(M.type.name, h))(g);
  if (A.depth >= 1 && R && A.depth - R.depth <= 1) {
    if (R.node.type === f)
      return u.liftListItem(b);
    if (ea(R.node.type.name, h) && f.validContent(R.node.content) && s)
      return c().command(() => (o.setNodeMarkup(R.pos, f), !0)).command(() => _t(o, f)).command(() => Gt(o, f)).run();
  }
  return !t || !B || !s ? c().command(() => d().wrapInList(f, a) ? !0 : u.clearNodes()).wrapInList(f, a).command(() => _t(o, f)).command(() => Gt(o, f)).run() : c().command(() => {
    const M = d().wrapInList(f, a), P = B.filter((_) => m.includes(_.type.name));
    return o.ensureMarks(P), M ? !0 : u.clearNodes();
  }).wrapInList(f, a).command(() => _t(o, f)).command(() => Gt(o, f)).run();
}, ul = (r, e = {}, t = {}) => ({ state: a, commands: n }) => {
  const { extendEmptyMarkRange: o = !1 } = t, i = ce(r, a.schema);
  return el(a, i, e) ? n.unsetMark(i, { extendEmptyMarkRange: o }) : n.setMark(i, e);
}, pl = (r, e, t = {}) => ({ state: a, commands: n }) => {
  const o = D(r, a.schema), i = D(e, a.schema), s = gr(a, o, t);
  let c;
  return a.selection.$anchor.sameParent(a.selection.$head) && (c = a.selection.$anchor.parent.attrs), s ? n.setNode(i, c) : n.setNode(o, { ...c, ...t });
}, hl = (r, e = {}) => ({ state: t, commands: a }) => {
  const n = D(r, t.schema);
  return gr(t, n, e) ? a.lift(n) : a.wrapIn(n, e);
}, ml = () => ({ state: r, dispatch: e }) => {
  const t = r.plugins;
  for (let a = 0; a < t.length; a += 1) {
    const n = t[a];
    let o;
    if (n.spec.isInputRules && (o = n.getState(r))) {
      if (e) {
        const i = r.tr, s = o.transform;
        for (let c = s.steps.length - 1; c >= 0; c -= 1)
          i.step(s.steps[c].invert(s.docs[c]));
        if (o.text) {
          const c = i.doc.resolve(o.from).marks();
          i.replaceWith(o.from, o.to, r.schema.text(o.text, c));
        } else
          i.delete(o.from, o.to);
      }
      return !0;
    }
  }
  return !1;
}, fl = () => ({ tr: r, dispatch: e }) => {
  const { selection: t } = r, { empty: a, ranges: n } = t;
  return a || e && n.forEach((o) => {
    r.removeMark(o.$from.pos, o.$to.pos);
  }), !0;
}, gl = (r, e = {}) => ({ tr: t, state: a, dispatch: n }) => {
  var o;
  const { extendEmptyMarkRange: i = !1 } = e, { selection: s } = t, c = ce(r, a.schema), { $from: u, empty: d, ranges: h } = s;
  if (!n)
    return !0;
  if (d && i) {
    let { from: m, to: f } = s;
    const b = (o = u.marks().find((y) => y.type === c)) === null || o === void 0 ? void 0 : o.attrs, g = fn(u, c, b);
    g && (m = g.from, f = g.to), t.removeMark(m, f, c);
  } else
    h.forEach((m) => {
      t.removeMark(m.$from.pos, m.$to.pos, c);
    });
  return t.removeStoredMark(c), !0;
}, bl = (r, e = {}) => ({ tr: t, state: a, dispatch: n }) => {
  let o = null, i = null;
  const s = vn(typeof r == "string" ? r : r.name, a.schema);
  return s ? (s === "node" && (o = D(r, a.schema)), s === "mark" && (i = ce(r, a.schema)), n && t.selection.ranges.forEach((c) => {
    const u = c.$from.pos, d = c.$to.pos;
    let h, m, f, b;
    t.selection.empty ? a.doc.nodesBetween(u, d, (g, y) => {
      o && o === g.type && (f = Math.max(y, u), b = Math.min(y + g.nodeSize, d), h = y, m = g);
    }) : a.doc.nodesBetween(u, d, (g, y) => {
      y < u && o && o === g.type && (f = Math.max(y, u), b = Math.min(y + g.nodeSize, d), h = y, m = g), y >= u && y <= d && (o && o === g.type && t.setNodeMarkup(y, void 0, {
        ...g.attrs,
        ...e
      }), i && g.marks.length && g.marks.forEach((w) => {
        if (i === w.type) {
          const C = Math.max(y, u), A = Math.min(y + g.nodeSize, d);
          t.addMark(C, A, i.create({
            ...w.attrs,
            ...e
          }));
        }
      }));
    }), m && (h !== void 0 && t.setNodeMarkup(h, void 0, {
      ...m.attrs,
      ...e
    }), i && m.marks.length && m.marks.forEach((g) => {
      i === g.type && t.addMark(f, b, i.create({
        ...g.attrs,
        ...e
      }));
    }));
  }), !0) : !1;
}, yl = (r, e = {}) => ({ state: t, dispatch: a }) => {
  const n = D(r, t.schema);
  return Di(n, e)(t, a);
}, vl = (r, e = {}) => ({ state: t, dispatch: a }) => {
  const n = D(r, t.schema);
  return Vi(n, e)(t, a);
};
var wl = /* @__PURE__ */ Object.freeze({
  __proto__: null,
  blur: ns,
  clearContent: is,
  clearNodes: ss,
  command: ls,
  createParagraphNear: cs,
  cut: ds,
  deleteCurrentNode: us,
  deleteNode: ps,
  deleteRange: hs,
  deleteSelection: ms,
  enter: fs,
  exitCode: gs,
  extendMarkRange: bs,
  first: ys,
  focus: xs,
  forEach: ks,
  insertContent: Ss,
  insertContentAt: As,
  joinBackward: Ls,
  joinDown: Es,
  joinForward: Ms,
  joinItemBackward: Is,
  joinItemForward: Hs,
  joinTextblockBackward: Rs,
  joinTextblockForward: Ps,
  joinUp: Ts,
  keyboardShortcut: Bs,
  lift: zs,
  liftEmptyBlock: $s,
  liftListItem: Us,
  newlineInCode: Fs,
  resetAttributes: js,
  scrollIntoView: Ds,
  selectAll: Vs,
  selectNodeBackward: qs,
  selectNodeForward: _s,
  selectParentNode: Gs,
  selectTextblockEnd: Js,
  selectTextblockStart: Ws,
  setContent: Ys,
  setMark: rl,
  setMeta: al,
  setNode: nl,
  setNodeSelection: ol,
  setTextSelection: il,
  sinkListItem: sl,
  splitBlock: ll,
  splitListItem: cl,
  toggleList: dl,
  toggleMark: ul,
  toggleNode: pl,
  toggleWrap: hl,
  undoInputRule: ml,
  unsetAllMarks: fl,
  unsetMark: gl,
  updateAttributes: bl,
  wrapIn: yl,
  wrapInList: vl
});
X.create({
  name: "commands",
  addCommands() {
    return {
      ...wl
    };
  }
});
X.create({
  name: "drop",
  addProseMirrorPlugins() {
    return [
      new ke({
        key: new Se("tiptapDrop"),
        props: {
          handleDrop: (r, e, t, a) => {
            this.editor.emit("drop", {
              editor: this.editor,
              event: e,
              slice: t,
              moved: a
            });
          }
        }
      })
    ];
  }
});
X.create({
  name: "editable",
  addProseMirrorPlugins() {
    return [
      new ke({
        key: new Se("editable"),
        props: {
          editable: () => this.editor.options.editable
        }
      })
    ];
  }
});
const xl = new Se("focusEvents");
X.create({
  name: "focusEvents",
  addProseMirrorPlugins() {
    const { editor: r } = this;
    return [
      new ke({
        key: xl,
        props: {
          handleDOMEvents: {
            focus: (e, t) => {
              r.isFocused = !0;
              const a = r.state.tr.setMeta("focus", { event: t }).setMeta("addToHistory", !1);
              return e.dispatch(a), !1;
            },
            blur: (e, t) => {
              r.isFocused = !1;
              const a = r.state.tr.setMeta("blur", { event: t }).setMeta("addToHistory", !1);
              return e.dispatch(a), !1;
            }
          }
        }
      })
    ];
  }
});
X.create({
  name: "keymap",
  addKeyboardShortcuts() {
    const r = () => this.editor.commands.first(({ commands: i }) => [
      () => i.undoInputRule(),
      // maybe convert first text block node to default node
      () => i.command(({ tr: s }) => {
        const { selection: c, doc: u } = s, { empty: d, $anchor: h } = c, { pos: m, parent: f } = h, b = h.parent.isTextblock && m > 0 ? s.doc.resolve(m - 1) : h, g = b.parent.type.spec.isolating, y = h.pos - h.parentOffset, w = g && b.parent.childCount === 1 ? y === h.pos : E.atStart(u).from === m;
        return !d || !f.type.isTextblock || f.textContent.length || !w || w && h.parent.type.name === "paragraph" ? !1 : i.clearNodes();
      }),
      () => i.deleteSelection(),
      () => i.joinBackward(),
      () => i.selectNodeBackward()
    ]), e = () => this.editor.commands.first(({ commands: i }) => [
      () => i.deleteSelection(),
      () => i.deleteCurrentNode(),
      () => i.joinForward(),
      () => i.selectNodeForward()
    ]), a = {
      Enter: () => this.editor.commands.first(({ commands: i }) => [
        () => i.newlineInCode(),
        () => i.createParagraphNear(),
        () => i.liftEmptyBlock(),
        () => i.splitBlock()
      ]),
      "Mod-Enter": () => this.editor.commands.exitCode(),
      Backspace: r,
      "Mod-Backspace": r,
      "Shift-Backspace": r,
      Delete: e,
      "Mod-Delete": e,
      "Mod-a": () => this.editor.commands.selectAll()
    }, n = {
      ...a
    }, o = {
      ...a,
      "Ctrl-h": r,
      "Alt-Backspace": r,
      "Ctrl-d": e,
      "Ctrl-Alt-Backspace": e,
      "Alt-Delete": e,
      "Alt-d": e,
      "Ctrl-a": () => this.editor.commands.selectTextblockStart(),
      "Ctrl-e": () => this.editor.commands.selectTextblockEnd()
    };
    return ct() || yn() ? o : n;
  },
  addProseMirrorPlugins() {
    return [
      // With this plugin we check if the whole document was selected and deleted.
      // In this case we will additionally call `clearNodes()` to convert e.g. a heading
      // to a paragraph if necessary.
      // This is an alternative to ProseMirror's `AllSelection`, which doesn’t work well
      // with many other commands.
      new ke({
        key: new Se("clearDocument"),
        appendTransaction: (r, e, t) => {
          if (r.some((g) => g.getMeta("composition")))
            return;
          const a = r.some((g) => g.docChanged) && !e.doc.eq(t.doc), n = r.some((g) => g.getMeta("preventClearDocument"));
          if (!a || n)
            return;
          const { empty: o, from: i, to: s } = e.selection, c = E.atStart(e.doc).from, u = E.atEnd(e.doc).to;
          if (o || !(i === c && s === u) || !wn(t.doc))
            return;
          const m = t.tr, f = pn({
            state: t,
            transaction: m
          }), { commands: b } = new Yi({
            editor: this.editor,
            state: f
          });
          if (b.clearNodes(), !!m.steps.length)
            return m;
        }
      })
    ];
  }
});
X.create({
  name: "paste",
  addProseMirrorPlugins() {
    return [
      new ke({
        key: new Se("tiptapPaste"),
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
X.create({
  name: "tabindex",
  addProseMirrorPlugins() {
    return [
      new ke({
        key: new Se("tabindex"),
        props: {
          attributes: () => this.editor.isEditable ? { tabindex: "0" } : {}
        }
      })
    ];
  }
});
class Ht {
  constructor(e = {}) {
    this.type = "node", this.name = "node", this.parent = null, this.child = null, this.config = {
      name: this.name,
      defaultOptions: {}
    }, this.config = {
      ...this.config,
      ...e
    }, this.name = this.config.name, e.defaultOptions && Object.keys(e.defaultOptions).length > 0 && console.warn(`[tiptap warn]: BREAKING CHANGE: "defaultOptions" is deprecated. Please use "addOptions" instead. Found in extension: "${this.name}".`), this.options = this.config.defaultOptions, this.config.addOptions && (this.options = oe(Z(this, "addOptions", {
      name: this.name
    }))), this.storage = oe(Z(this, "addStorage", {
      name: this.name,
      options: this.options
    })) || {};
  }
  static create(e = {}) {
    return new Ht(e);
  }
  configure(e = {}) {
    const t = this.extend({
      ...this.config,
      addOptions: () => fr(this.options, e)
    });
    return t.name = this.name, t.parent = this.parent, t;
  }
  extend(e = {}) {
    const t = new Ht(e);
    return t.parent = this, this.child = t, t.name = e.name ? e.name : t.parent.name, e.defaultOptions && Object.keys(e.defaultOptions).length > 0 && console.warn(`[tiptap warn]: BREAKING CHANGE: "defaultOptions" is deprecated. Please use "addOptions" instead. Found in extension: "${t.name}".`), t.options = oe(Z(t, "addOptions", {
      name: t.name
    })), t.storage = oe(Z(t, "addStorage", {
      name: t.name,
      options: t.options
    })), t;
  }
}
let kl = class {
  constructor(e, t, a) {
    this.isDragging = !1, this.component = e, this.editor = t.editor, this.options = {
      stopEvent: null,
      ignoreMutation: null,
      ...a
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
    var t, a, n, o, i, s, c;
    const { view: u } = this.editor, d = e.target, h = d.nodeType === 3 ? (t = d.parentElement) === null || t === void 0 ? void 0 : t.closest("[data-drag-handle]") : d.closest("[data-drag-handle]");
    if (!this.dom || !((a = this.contentDOM) === null || a === void 0) && a.contains(d) || !h)
      return;
    let m = 0, f = 0;
    if (this.dom !== h) {
      const C = this.dom.getBoundingClientRect(), A = h.getBoundingClientRect(), B = (n = e.offsetX) !== null && n !== void 0 ? n : (o = e.nativeEvent) === null || o === void 0 ? void 0 : o.offsetX, R = (i = e.offsetY) !== null && i !== void 0 ? i : (s = e.nativeEvent) === null || s === void 0 ? void 0 : s.offsetY;
      m = A.x - C.x + B, f = A.y - C.y + R;
    }
    const b = this.dom.cloneNode(!0);
    (c = e.dataTransfer) === null || c === void 0 || c.setDragImage(b, m, f);
    const g = this.getPos();
    if (typeof g != "number")
      return;
    const y = L.create(u.state.doc, g), w = u.state.tr.setSelection(y);
    u.dispatch(w);
  }
  stopEvent(e) {
    var t;
    if (!this.dom)
      return !1;
    if (typeof this.options.stopEvent == "function")
      return this.options.stopEvent({ event: e });
    const a = e.target;
    if (!(this.dom.contains(a) && !(!((t = this.contentDOM) === null || t === void 0) && t.contains(a))))
      return !1;
    const o = e.type.startsWith("drag"), i = e.type === "drop";
    if ((["INPUT", "BUTTON", "SELECT", "TEXTAREA"].includes(a.tagName) || a.isContentEditable) && !i && !o)
      return !0;
    const { isEditable: c } = this.editor, { isDragging: u } = this, d = !!this.node.type.spec.draggable, h = L.isSelectable(this.node), m = e.type === "copy", f = e.type === "paste", b = e.type === "cut", g = e.type === "mousedown";
    if (!d && h && o && e.target === this.dom && e.preventDefault(), d && o && !u && e.target === this.dom)
      return e.preventDefault(), !1;
    if (d && c && !u && g) {
      const y = a.closest("[data-drag-handle]");
      y && (this.dom === y || this.dom.contains(y)) && (this.isDragging = !0, document.addEventListener("dragend", () => {
        this.isDragging = !1;
      }, { once: !0 }), document.addEventListener("drop", () => {
        this.isDragging = !1;
      }, { once: !0 }), document.addEventListener("mouseup", () => {
        this.isDragging = !1;
      }, { once: !0 }));
    }
    return !(u || i || m || f || b || g && h);
  }
  /**
   * Called when a DOM [mutation](https://developer.mozilla.org/en-US/docs/Web/API/MutationObserver) or a selection change happens within the view.
   * @return `false` if the editor should re-read the selection or re-parse the range around the mutation
   * @return `true` if it can safely be ignored.
   */
  ignoreMutation(e) {
    return !this.dom || !this.contentDOM ? !0 : typeof this.options.ignoreMutation == "function" ? this.options.ignoreMutation({ mutation: e }) : this.node.isLeaf || this.node.isAtom ? !0 : e.type === "selection" || this.dom.contains(e.target) && e.type === "childList" && (ct() || tr()) && this.editor.isFocused && [
      ...Array.from(e.addedNodes),
      ...Array.from(e.removedNodes)
    ].every((a) => a.isContentEditable) ? !1 : this.contentDOM === e.target && e.type === "attributes" ? !0 : !this.contentDOM.contains(e.target);
  }
  /**
   * Update the attributes of the prosemirror node.
   */
  updateAttributes(e) {
    this.editor.commands.command(({ tr: t }) => {
      const a = this.getPos();
      return typeof a != "number" ? !1 : (t.setNodeMarkup(a, void 0, {
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
var xn = { exports: {} }, Jt = {};
/**
 * @license React
 * use-sync-external-store-shim.production.min.js
 *
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
var ra;
function Sl() {
  if (ra) return Jt;
  ra = 1;
  var r = j;
  function e(h, m) {
    return h === m && (h !== 0 || 1 / h === 1 / m) || h !== h && m !== m;
  }
  var t = typeof Object.is == "function" ? Object.is : e, a = r.useState, n = r.useEffect, o = r.useLayoutEffect, i = r.useDebugValue;
  function s(h, m) {
    var f = m(), b = a({ inst: { value: f, getSnapshot: m } }), g = b[0].inst, y = b[1];
    return o(function() {
      g.value = f, g.getSnapshot = m, c(g) && y({ inst: g });
    }, [h, f, m]), n(function() {
      return c(g) && y({ inst: g }), h(function() {
        c(g) && y({ inst: g });
      });
    }, [h]), i(f), f;
  }
  function c(h) {
    var m = h.getSnapshot;
    h = h.value;
    try {
      var f = m();
      return !t(h, f);
    } catch {
      return !0;
    }
  }
  function u(h, m) {
    return m();
  }
  var d = typeof window > "u" || typeof window.document > "u" || typeof window.document.createElement > "u" ? u : s;
  return Jt.useSyncExternalStore = r.useSyncExternalStore !== void 0 ? r.useSyncExternalStore : d, Jt;
}
xn.exports = Sl();
var kn = xn.exports;
const Cl = (...r) => (e) => {
  r.forEach((t) => {
    typeof t == "function" ? t(e) : t && (t.current = e);
  });
}, Nl = ({ contentComponent: r }) => {
  const e = kn.useSyncExternalStore(r.subscribe, r.getSnapshot, r.getServerSnapshot);
  return j.createElement(j.Fragment, null, Object.values(e));
};
function Al() {
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
    setRenderer(t, a) {
      e = {
        ...e,
        [t]: Gn.createPortal(a.reactElement, a.element, t)
      }, r.forEach((n) => n());
    },
    /**
     * Removes a NodeView Renderer from the editor.
     */
    removeRenderer(t) {
      const a = { ...e };
      delete a[t], e = a, r.forEach((n) => n());
    }
  };
}
class Tl extends j.Component {
  constructor(e) {
    var t;
    super(e), this.editorContentRef = j.createRef(), this.initialized = !1, this.state = {
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
      }), e.contentComponent = Al(), this.state.hasContentComponentInitialized || (this.unsubscribeToContentComponent = e.contentComponent.subscribe(() => {
        this.setState((a) => a.hasContentComponentInitialized ? a : {
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
    const { editor: e, innerRef: t, ...a } = this.props;
    return j.createElement(
      j.Fragment,
      null,
      j.createElement("div", { ref: Cl(t, this.editorContentRef), ...a }),
      (e == null ? void 0 : e.contentComponent) && j.createElement(Nl, { contentComponent: e.contentComponent })
    );
  }
}
const El = ar((r, e) => {
  const t = j.useMemo(() => Math.floor(Math.random() * 4294967295).toString(), [r.editor]);
  return j.createElement(Tl, {
    key: t,
    innerRef: e,
    ...r
  });
});
j.memo(El);
var Wt = {};
/**
 * @license React
 * use-sync-external-store-shim/with-selector.production.min.js
 *
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
var aa;
function Ll() {
  if (aa) return Wt;
  aa = 1;
  var r = j, e = kn;
  function t(u, d) {
    return u === d && (u !== 0 || 1 / u === 1 / d) || u !== u && d !== d;
  }
  var a = typeof Object.is == "function" ? Object.is : t, n = e.useSyncExternalStore, o = r.useRef, i = r.useEffect, s = r.useMemo, c = r.useDebugValue;
  return Wt.useSyncExternalStoreWithSelector = function(u, d, h, m, f) {
    var b = o(null);
    if (b.current === null) {
      var g = { hasValue: !1, value: null };
      b.current = g;
    } else g = b.current;
    b = s(function() {
      function w(M) {
        if (!C) {
          if (C = !0, A = M, M = m(M), f !== void 0 && g.hasValue) {
            var P = g.value;
            if (f(P, M)) return B = P;
          }
          return B = M;
        }
        if (P = B, a(A, M)) return P;
        var _ = m(M);
        return f !== void 0 && f(P, _) ? P : (A = M, B = _);
      }
      var C = !1, A, B, R = h === void 0 ? null : h;
      return [function() {
        return w(d());
      }, R === null ? void 0 : function() {
        return w(R());
      }];
    }, [d, h, m, f]);
    var y = n(u, b[0], b[1]);
    return i(function() {
      g.hasValue = !0, g.value = y;
    }, [y]), c(y), y;
  }, Wt;
}
Ll();
const Ml = ca({
  editor: null
});
Ml.Consumer;
const Sn = ca({
  onDragStart: void 0
}), Il = () => _n(Sn), te = j.forwardRef((r, e) => {
  const { onDragStart: t } = Il(), a = r.as || "div";
  return (
    // @ts-ignore
    j.createElement(a, { ...r, ref: e, "data-node-view-wrapper": "", onDragStart: t, style: {
      whiteSpace: "normal",
      ...r.style
    } })
  );
});
function na(r) {
  return !!(typeof r == "function" && r.prototype && r.prototype.isReactComponent);
}
function oa(r) {
  return !!(typeof r == "object" && r.$$typeof && (r.$$typeof.toString() === "Symbol(react.forward_ref)" || r.$$typeof.description === "react.forward_ref"));
}
function Hl(r) {
  return !!(typeof r == "object" && r.$$typeof && (r.$$typeof.toString() === "Symbol(react.memo)" || r.$$typeof.description === "react.memo"));
}
function Rl(r) {
  if (na(r) || oa(r))
    return !0;
  if (Hl(r)) {
    const e = r.type;
    if (e)
      return na(e) || oa(e);
  }
  return !1;
}
function Pl() {
  try {
    if (Mr)
      return parseInt(Mr.split(".")[0], 10) >= 19;
  } catch {
  }
  return !1;
}
class Ol {
  /**
   * Immediately creates element and renders the provided React component.
   */
  constructor(e, { editor: t, props: a = {}, as: n = "div", className: o = "" }) {
    this.ref = null, this.id = Math.floor(Math.random() * 4294967295).toString(), this.component = e, this.editor = t, this.props = a, this.element = document.createElement(n), this.element.classList.add("react-renderer"), o && this.element.classList.add(...o.split(" ")), this.editor.isInitialized ? Jn(() => {
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
    const t = this.component, a = this.props, n = this.editor, o = Pl(), i = Rl(t), s = { ...a };
    s.ref && !(o || i) && delete s.ref, !s.ref && (o || i) && (s.ref = (c) => {
      this.ref = c;
    }), this.reactElement = j.createElement(t, { ...s }), (e = n == null ? void 0 : n.contentComponent) === null || e === void 0 || e.setRenderer(this.id, this);
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
class Bl extends kl {
  constructor(e, t, a) {
    if (super(e, t, a), !this.node.isLeaf) {
      this.options.contentDOMElementTag ? this.contentDOMElement = document.createElement(this.options.contentDOMElementTag) : this.contentDOMElement = document.createElement(this.node.isInline ? "span" : "div"), this.contentDOMElement.dataset.nodeViewContentReact = "", this.contentDOMElement.dataset.nodeViewWrapper = "", this.contentDOMElement.style.whiteSpace = "inherit";
      const n = this.dom.querySelector("[data-node-view-content]");
      if (!n)
        return;
      n.appendChild(this.contentDOMElement);
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
      updateAttributes: (u = {}) => this.updateAttributes(u),
      deleteNode: () => this.deleteNode(),
      ref: Vn()
    };
    if (!this.component.displayName) {
      const u = (d) => d.charAt(0).toUpperCase() + d.substring(1);
      this.component.displayName = u(this.extension.name);
    }
    const n = { onDragStart: this.onDragStart.bind(this), nodeViewContentRef: (u) => {
      u && this.contentDOMElement && u.firstChild !== this.contentDOMElement && (u.hasAttribute("data-node-view-wrapper") && u.removeAttribute("data-node-view-wrapper"), u.appendChild(this.contentDOMElement));
    } }, o = this.component, i = qn((u) => j.createElement(Sn.Provider, { value: n }, St(o, u)));
    i.displayName = "ReactNodeView";
    let s = this.node.isInline ? "span" : "div";
    this.options.as && (s = this.options.as);
    const { className: c = "" } = this.options;
    this.handleSelectionUpdate = this.handleSelectionUpdate.bind(this), this.renderer = new Ol(i, {
      editor: this.editor,
      props: e,
      as: s,
      className: `node-${this.node.type.name} ${c}`.trim()
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
    const { from: e, to: t } = this.editor.state.selection, a = this.getPos();
    if (typeof a == "number")
      if (e <= a && t >= a + this.node.nodeSize) {
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
  update(e, t, a) {
    const n = (o) => {
      this.renderer.updateProps(o), typeof this.options.attrs == "function" && this.updateElementAttributes();
    };
    if (e.type !== this.node.type)
      return !1;
    if (typeof this.options.update == "function") {
      const o = this.node, i = this.decorations, s = this.innerDecorations;
      return this.node = e, this.decorations = t, this.innerDecorations = a, this.options.update({
        oldNode: o,
        oldDecorations: i,
        newNode: e,
        newDecorations: t,
        oldInnerDecorations: s,
        innerDecorations: a,
        updateProps: () => n({ node: e, decorations: t, innerDecorations: a })
      });
    }
    return e === this.node && this.decorations === t && this.innerDecorations === a || (this.node = e, this.decorations = t, this.innerDecorations = a, n({ node: e, decorations: t, innerDecorations: a })), !0;
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
        const t = this.editor.extensionManager.attributes, a = Qi(this.node, t);
        e = this.options.attrs({ node: this.node, HTMLAttributes: a });
      } else
        e = this.options.attrs;
      this.renderer.updateAttributes(e);
    }
  }
}
function zl(r, e) {
  return (t) => t.editor.contentComponent ? new Bl(r, t, e) : {};
}
function re({
  subId: r,
  defaultAttrs: e,
  view: t
}) {
  const a = `${Zn}/${r}`, n = da(r.replace(/-([a-z])/g, (o, i) => i.toUpperCase()));
  return Ht.create({
    name: n,
    group: "block",
    atom: !0,
    selectable: !0,
    draggable: !0,
    addAttributes() {
      return {
        attrs: {
          default: e,
          parseHTML: (o) => Y(o.getAttribute("data-attrs") ?? "", e),
          renderHTML: (o) => ({
            "data-attrs": Qn(o.attrs ?? e)
          })
        }
      };
    },
    parseHTML() {
      return [{ tag: `div[data-cms-block="${a}"]` }];
    },
    renderHTML({ HTMLAttributes: o }) {
      return [
        "div",
        hn(o, { "data-cms-block": a })
      ];
    },
    addNodeView() {
      return zl((o) => {
        const i = o.node.attrs.attrs ?? e;
        return /* @__PURE__ */ l(t, { attrs: i, updateAttrs: (c) => {
          o.updateAttributes({ attrs: { ...i, ...c } });
        }, selected: o.selected });
      });
    }
  });
}
function ae(r) {
  return da(r.replace(/-([a-z])/g, (e, t) => t.toUpperCase()));
}
const $l = {
  imageUrl: {
    description: "Full-width background image behind a navy gradient. Absolute URL or site path (e.g. a media variant URL from `media upload` → formats.<name>.url). Empty = solid navy gradient. The block renders nothing when imageUrl, title and subtitle are all empty.",
    format: "URL"
  },
  imageAlt: { description: "Alt text of the background image." },
  eyebrow: { description: "Small uppercase pill label above the headline. Empty = hidden." },
  title: { description: "Main headline (the page's <h1>). Empty = hidden." },
  subtitle: { description: "Lede paragraph under the headline. Empty = hidden." },
  primaryCtaLabel: { description: "Primary (filled) button text. The button shows only when both label and link are set." },
  primaryCtaHref: { description: "Primary button link: site path (/contact.html) or absolute URL.", format: "URL" },
  secondaryCtaLabel: { description: "Secondary (outlined) button text. The button shows only when both label and link are set." },
  secondaryCtaHref: { description: "Secondary button link: site path or absolute URL.", format: "URL" }
}, yr = "hero-overlay", Ge = ae(yr), Rt = {
  imageUrl: "",
  imageAlt: "",
  eyebrow: "",
  title: "",
  subtitle: "",
  primaryCtaLabel: "",
  primaryCtaHref: "",
  secondaryCtaLabel: "",
  secondaryCtaHref: ""
};
function Ul({ attrs: r, selected: e }) {
  const { t } = H("theme-corporate");
  return /* @__PURE__ */ l(
    te,
    {
      contentEditable: !1,
      className: "my-4 rounded-lg border border-dashed border-surface-300 bg-surface-50 p-4 dark:border-surface-600 dark:bg-surface-900 " + (e ? "ring-2 ring-blue-500/60" : ""),
      children: /* @__PURE__ */ p("div", { className: "flex items-start gap-3", children: [
        /* @__PURE__ */ l(nt, { className: "h-5 w-5 shrink-0 text-blue-500" }),
        /* @__PURE__ */ p("div", { className: "min-w-0 flex-1", children: [
          /* @__PURE__ */ l("p", { className: "text-xs font-semibold uppercase tracking-wide text-surface-500 dark:text-surface-400", children: t("blocks.heroOverlay.title") }),
          /* @__PURE__ */ l("p", { className: "text-sm text-surface-900 dark:text-surface-50 truncate", children: r.title || t("blocks.heroOverlay.untitled") })
        ] })
      ] })
    }
  );
}
function Fl({ editor: r }) {
  const { t: e } = H("theme-corporate"), t = r.getAttributes(Ge), a = { ...Rt, ...t.attrs ?? {} };
  function n(o) {
    r.chain().updateAttributes(Ge, { attrs: { ...a, ...o } }).run();
  }
  return /* @__PURE__ */ p("div", { className: "space-y-3", children: [
    /* @__PURE__ */ p("div", { children: [
      /* @__PURE__ */ l("label", { className: "label", children: e("blocks.heroOverlay.imageUrl") }),
      /* @__PURE__ */ l(
        "input",
        {
          type: "url",
          className: "input",
          placeholder: "https://…",
          value: a.imageUrl ?? "",
          onChange: (o) => n({ imageUrl: o.target.value })
        }
      ),
      /* @__PURE__ */ l("p", { className: "text-xs text-surface-500 mt-1 dark:text-surface-400", children: e("blocks.heroOverlay.imageUrlHelp") })
    ] }),
    /* @__PURE__ */ p("div", { children: [
      /* @__PURE__ */ l("label", { className: "label", children: e("blocks.heroOverlay.imageAlt") }),
      /* @__PURE__ */ l(
        "input",
        {
          type: "text",
          className: "input",
          value: a.imageAlt ?? "",
          onChange: (o) => n({ imageAlt: o.target.value })
        }
      )
    ] }),
    /* @__PURE__ */ p("div", { children: [
      /* @__PURE__ */ l("label", { className: "label", children: e("blocks.heroOverlay.eyebrow") }),
      /* @__PURE__ */ l(
        "input",
        {
          type: "text",
          className: "input",
          value: a.eyebrow ?? "",
          onChange: (o) => n({ eyebrow: o.target.value })
        }
      )
    ] }),
    /* @__PURE__ */ p("div", { children: [
      /* @__PURE__ */ l("label", { className: "label", children: e("blocks.heroOverlay.heading") }),
      /* @__PURE__ */ l(
        "input",
        {
          type: "text",
          className: "input",
          value: a.title ?? "",
          onChange: (o) => n({ title: o.target.value })
        }
      )
    ] }),
    /* @__PURE__ */ p("div", { children: [
      /* @__PURE__ */ l("label", { className: "label", children: e("blocks.heroOverlay.subtitle") }),
      /* @__PURE__ */ l(
        "textarea",
        {
          className: "input",
          rows: 3,
          value: a.subtitle ?? "",
          onChange: (o) => n({ subtitle: o.target.value })
        }
      )
    ] }),
    /* @__PURE__ */ p("div", { className: "grid grid-cols-2 gap-3", children: [
      /* @__PURE__ */ p("div", { children: [
        /* @__PURE__ */ l("label", { className: "label", children: e("blocks.heroOverlay.primaryCtaLabel") }),
        /* @__PURE__ */ l(
          "input",
          {
            type: "text",
            className: "input",
            value: a.primaryCtaLabel ?? "",
            onChange: (o) => n({ primaryCtaLabel: o.target.value })
          }
        )
      ] }),
      /* @__PURE__ */ p("div", { children: [
        /* @__PURE__ */ l("label", { className: "label", children: e("blocks.heroOverlay.primaryCtaHref") }),
        /* @__PURE__ */ l(
          "input",
          {
            type: "text",
            className: "input",
            placeholder: "/contact.html",
            value: a.primaryCtaHref ?? "",
            onChange: (o) => n({ primaryCtaHref: o.target.value })
          }
        )
      ] }),
      /* @__PURE__ */ p("div", { children: [
        /* @__PURE__ */ l("label", { className: "label", children: e("blocks.heroOverlay.secondaryCtaLabel") }),
        /* @__PURE__ */ l(
          "input",
          {
            type: "text",
            className: "input",
            value: a.secondaryCtaLabel ?? "",
            onChange: (o) => n({ secondaryCtaLabel: o.target.value })
          }
        )
      ] }),
      /* @__PURE__ */ p("div", { children: [
        /* @__PURE__ */ l("label", { className: "label", children: e("blocks.heroOverlay.secondaryCtaHref") }),
        /* @__PURE__ */ l(
          "input",
          {
            type: "text",
            className: "input",
            value: a.secondaryCtaHref ?? "",
            onChange: (o) => n({ secondaryCtaHref: o.target.value })
          }
        )
      ] })
    ] })
  ] });
}
const jl = re({
  subId: yr,
  defaultAttrs: Rt,
  view: Ul
}), Dl = {
  id: `corporate/${yr}`,
  nodeName: Ge,
  titleKey: "blocks.heroOverlay.title",
  namespace: "theme-corporate",
  icon: nt,
  category: "layout",
  attrsSchema: $l,
  extensions: [jl],
  // Insert with a media-picker prompt when one is wired (the post
  // editor provides it). The user can still skip and paste a URL by
  // hand from the inspector.
  insert: async (r, e) => {
    const t = e.pickMedia ? await e.pickMedia() : null;
    r.focus().insertContent({
      type: Ge,
      attrs: {
        attrs: t ? { ...Rt, imageUrl: t.url, imageAlt: t.alt ?? "" } : Rt
      }
    }).run();
  },
  isActive: (r) => r.isActive(Ge),
  inspector: (r) => /* @__PURE__ */ l(Fl, { editor: r.editor })
}, Vl = {
  eyebrow: { description: "Small uppercase label above the headline. Empty = hidden." },
  title: {
    description: "Main headline (the page's <h1>, navy on the light background). The block renders nothing when title and subtitle are both empty."
  },
  subtitle: { description: "Lede paragraph under the headline. Empty = hidden." },
  primaryCtaLabel: { description: "Primary (filled) button text. The button shows only when both label and link are set." },
  primaryCtaHref: { description: "Primary button link: site path (/contact.html) or absolute URL.", format: "URL" },
  secondaryCtaLabel: { description: "Secondary (outlined) button text. The button shows only when both label and link are set." },
  secondaryCtaHref: { description: "Secondary button link: site path or absolute URL.", format: "URL" },
  imageUrl: {
    description: "Decorative image faded (10% opacity) into the right half. Absolute URL or site path (e.g. a media variant URL from `media upload` → formats.<name>.url). Empty = text-only hero.",
    format: "URL"
  },
  imageAlt: { description: "Alt text of the decorative image." }
}, vr = "hero-split", Je = ae(vr), Pt = {
  eyebrow: "",
  title: "",
  subtitle: "",
  primaryCtaLabel: "",
  primaryCtaHref: "",
  secondaryCtaLabel: "",
  secondaryCtaHref: "",
  imageUrl: "",
  imageAlt: ""
};
function ql({ attrs: r, selected: e }) {
  const { t } = H("theme-corporate");
  return /* @__PURE__ */ l(
    te,
    {
      contentEditable: !1,
      className: "my-4 rounded-lg border border-dashed border-surface-300 bg-surface-50 p-4 dark:border-surface-600 dark:bg-surface-900 " + (e ? "ring-2 ring-blue-500/60" : ""),
      children: /* @__PURE__ */ p("div", { className: "flex items-start gap-3", children: [
        /* @__PURE__ */ l(wa, { className: "h-5 w-5 shrink-0 text-blue-500" }),
        /* @__PURE__ */ p("div", { className: "min-w-0 flex-1", children: [
          /* @__PURE__ */ l("p", { className: "text-xs font-semibold uppercase tracking-wide text-surface-500 dark:text-surface-400", children: t("blocks.heroSplit.title") }),
          /* @__PURE__ */ l("p", { className: "text-sm text-surface-900 dark:text-surface-50 truncate", children: r.title || t("blocks.heroSplit.untitled") })
        ] })
      ] })
    }
  );
}
function _l({ editor: r }) {
  const { t: e } = H("theme-corporate"), t = r.getAttributes(Je), a = { ...Pt, ...t.attrs ?? {} };
  function n(o) {
    r.chain().updateAttributes(Je, { attrs: { ...a, ...o } }).run();
  }
  return /* @__PURE__ */ p("div", { className: "space-y-3", children: [
    /* @__PURE__ */ p("div", { children: [
      /* @__PURE__ */ l("label", { className: "label", children: e("blocks.heroSplit.eyebrow") }),
      /* @__PURE__ */ l(
        "input",
        {
          type: "text",
          className: "input",
          value: a.eyebrow ?? "",
          onChange: (o) => n({ eyebrow: o.target.value })
        }
      )
    ] }),
    /* @__PURE__ */ p("div", { children: [
      /* @__PURE__ */ l("label", { className: "label", children: e("blocks.heroSplit.heading") }),
      /* @__PURE__ */ l(
        "input",
        {
          type: "text",
          className: "input",
          value: a.title ?? "",
          onChange: (o) => n({ title: o.target.value })
        }
      )
    ] }),
    /* @__PURE__ */ p("div", { children: [
      /* @__PURE__ */ l("label", { className: "label", children: e("blocks.heroSplit.subtitle") }),
      /* @__PURE__ */ l(
        "textarea",
        {
          className: "input",
          rows: 3,
          value: a.subtitle ?? "",
          onChange: (o) => n({ subtitle: o.target.value })
        }
      )
    ] }),
    /* @__PURE__ */ p("div", { className: "grid grid-cols-2 gap-3", children: [
      /* @__PURE__ */ p("div", { children: [
        /* @__PURE__ */ l("label", { className: "label", children: e("blocks.heroOverlay.primaryCtaLabel") }),
        /* @__PURE__ */ l(
          "input",
          {
            type: "text",
            className: "input",
            value: a.primaryCtaLabel ?? "",
            onChange: (o) => n({ primaryCtaLabel: o.target.value })
          }
        )
      ] }),
      /* @__PURE__ */ p("div", { children: [
        /* @__PURE__ */ l("label", { className: "label", children: e("blocks.heroOverlay.primaryCtaHref") }),
        /* @__PURE__ */ l(
          "input",
          {
            type: "text",
            className: "input",
            value: a.primaryCtaHref ?? "",
            onChange: (o) => n({ primaryCtaHref: o.target.value })
          }
        )
      ] }),
      /* @__PURE__ */ p("div", { children: [
        /* @__PURE__ */ l("label", { className: "label", children: e("blocks.heroOverlay.secondaryCtaLabel") }),
        /* @__PURE__ */ l(
          "input",
          {
            type: "text",
            className: "input",
            value: a.secondaryCtaLabel ?? "",
            onChange: (o) => n({ secondaryCtaLabel: o.target.value })
          }
        )
      ] }),
      /* @__PURE__ */ p("div", { children: [
        /* @__PURE__ */ l("label", { className: "label", children: e("blocks.heroOverlay.secondaryCtaHref") }),
        /* @__PURE__ */ l(
          "input",
          {
            type: "text",
            className: "input",
            value: a.secondaryCtaHref ?? "",
            onChange: (o) => n({ secondaryCtaHref: o.target.value })
          }
        )
      ] })
    ] }),
    /* @__PURE__ */ p("div", { children: [
      /* @__PURE__ */ l("label", { className: "label", children: e("blocks.heroSplit.decorImageUrl") }),
      /* @__PURE__ */ l(
        "input",
        {
          type: "url",
          className: "input",
          placeholder: "https://…",
          value: a.imageUrl ?? "",
          onChange: (o) => n({ imageUrl: o.target.value })
        }
      ),
      /* @__PURE__ */ l("p", { className: "text-xs text-surface-500 mt-1 dark:text-surface-400", children: e("blocks.heroSplit.decorImageHelp") })
    ] }),
    /* @__PURE__ */ p("div", { children: [
      /* @__PURE__ */ l("label", { className: "label", children: e("blocks.heroOverlay.imageAlt") }),
      /* @__PURE__ */ l(
        "input",
        {
          type: "text",
          className: "input",
          value: a.imageAlt ?? "",
          onChange: (o) => n({ imageAlt: o.target.value })
        }
      )
    ] })
  ] });
}
const Gl = re({
  subId: vr,
  defaultAttrs: Pt,
  view: ql
}), Jl = {
  id: `corporate/${vr}`,
  nodeName: Je,
  titleKey: "blocks.heroSplit.title",
  namespace: "theme-corporate",
  icon: wa,
  category: "layout",
  attrsSchema: Vl,
  extensions: [Gl],
  insert: async (r, e) => {
    const t = e.pickMedia ? await e.pickMedia() : null;
    r.focus().insertContent({
      type: Je,
      attrs: {
        attrs: t ? { ...Pt, imageUrl: t.url, imageAlt: t.alt ?? "" } : Pt
      }
    }).run();
  },
  isActive: (r) => r.isActive(Je),
  inspector: (r) => /* @__PURE__ */ l(_l, { editor: r.editor })
}, Wl = {
  eyebrow: { description: "Small uppercase label above the section heading. Empty = hidden." },
  title: {
    description: "Section heading (<h2>). The block renders nothing when it is empty and no service has a title or description."
  },
  subtitle: { description: "Paragraph under the section heading. Empty = hidden." },
  services: {
    description: "Service cards in a 3-column grid (wraps after 3): [{ icon, title, description, ctaLabel, ctaHref, accent }]. icon = a Material Symbols Outlined glyph name (analytics, cloud_sync, security…; default auto_awesome, empty = no icon); title / description = card text (cards with neither are skipped); ctaLabel + ctaHref = link at the bottom of the card (both needed; href = site path or absolute URL); accent = true for the dark navy highlighted card (the sample flags the middle one).",
    format: "array of objects"
  }
}, wr = "services-grid", We = ae(wr), xt = {
  icon: "auto_awesome",
  title: "",
  description: "",
  ctaLabel: "",
  ctaHref: "",
  accent: !1
}, Cn = {
  eyebrow: "",
  title: "",
  subtitle: "",
  // Seed with 3 empty cards mirroring the mockup's bento layout. The
  // middle card carries the accent flag by convention; users can flip
  // it on any other card if they want a different rhythm.
  services: [
    { ...xt },
    { ...xt, accent: !0 },
    { ...xt }
  ]
};
function Kl({ attrs: r, selected: e }) {
  var n;
  const { t } = H("theme-corporate"), a = ((n = r.services) == null ? void 0 : n.length) ?? 0;
  return /* @__PURE__ */ l(
    te,
    {
      contentEditable: !1,
      className: "my-4 rounded-lg border border-dashed border-surface-300 bg-surface-50 p-4 dark:border-surface-600 dark:bg-surface-900 " + (e ? "ring-2 ring-blue-500/60" : ""),
      children: /* @__PURE__ */ p("div", { className: "flex items-start gap-3", children: [
        /* @__PURE__ */ l(ya, { className: "h-5 w-5 shrink-0 text-blue-500" }),
        /* @__PURE__ */ p("div", { className: "min-w-0 flex-1", children: [
          /* @__PURE__ */ l("p", { className: "text-xs font-semibold uppercase tracking-wide text-surface-500 dark:text-surface-400", children: t("blocks.servicesGrid.title") }),
          /* @__PURE__ */ l("p", { className: "text-sm text-surface-900 dark:text-surface-50 truncate", children: r.title || t("blocks.servicesGrid.preview", { count: a }) })
        ] })
      ] })
    }
  );
}
function Yl({ editor: r }) {
  const { t: e } = H("theme-corporate"), t = r.getAttributes(We), a = { ...Cn, ...t.attrs ?? {} }, n = a.services ?? [];
  function o(d) {
    r.chain().updateAttributes(We, { attrs: { ...a, ...d } }).run();
  }
  function i(d, h) {
    const m = n.map((f, b) => b === d ? { ...f, ...h } : f);
    o({ services: m });
  }
  function s() {
    o({ services: [...n, { ...xt }] });
  }
  function c(d) {
    o({ services: n.filter((h, m) => m !== d) });
  }
  function u(d, h) {
    const m = d + h;
    if (m < 0 || m >= n.length) return;
    const f = [...n];
    [f[d], f[m]] = [f[m], f[d]], o({ services: f });
  }
  return /* @__PURE__ */ p("div", { className: "space-y-3", children: [
    /* @__PURE__ */ p("div", { children: [
      /* @__PURE__ */ l("label", { className: "label", children: e("blocks.servicesGrid.eyebrow") }),
      /* @__PURE__ */ l(
        "input",
        {
          type: "text",
          className: "input",
          value: a.eyebrow ?? "",
          onChange: (d) => o({ eyebrow: d.target.value })
        }
      )
    ] }),
    /* @__PURE__ */ p("div", { children: [
      /* @__PURE__ */ l("label", { className: "label", children: e("blocks.servicesGrid.heading") }),
      /* @__PURE__ */ l(
        "input",
        {
          type: "text",
          className: "input",
          value: a.title ?? "",
          onChange: (d) => o({ title: d.target.value })
        }
      )
    ] }),
    /* @__PURE__ */ p("div", { children: [
      /* @__PURE__ */ l("label", { className: "label", children: e("blocks.servicesGrid.subtitle") }),
      /* @__PURE__ */ l(
        "textarea",
        {
          className: "input",
          rows: 2,
          value: a.subtitle ?? "",
          onChange: (d) => o({ subtitle: d.target.value })
        }
      )
    ] }),
    /* @__PURE__ */ p("div", { className: "space-y-3 pt-3 border-t border-surface-200 dark:border-surface-700", children: [
      /* @__PURE__ */ p("div", { className: "flex items-center justify-between", children: [
        /* @__PURE__ */ l("p", { className: "text-xs font-semibold uppercase tracking-wide text-surface-500 dark:text-surface-400", children: e("blocks.servicesGrid.servicesHeading") }),
        /* @__PURE__ */ p(
          "button",
          {
            type: "button",
            className: "btn-ghost btn-sm flex items-center gap-1",
            onClick: s,
            children: [
              /* @__PURE__ */ l(we, { className: "h-3 w-3" }),
              e("blocks.servicesGrid.addService")
            ]
          }
        )
      ] }),
      n.map((d, h) => /* @__PURE__ */ p(
        "div",
        {
          className: "rounded-md border border-surface-200 bg-surface-50 p-3 space-y-2 dark:border-surface-700 dark:bg-surface-800",
          children: [
            /* @__PURE__ */ p("div", { className: "flex items-center justify-between", children: [
              /* @__PURE__ */ l("p", { className: "text-xs font-semibold text-surface-600 dark:text-surface-300", children: e("blocks.servicesGrid.serviceIndex", { index: h + 1 }) }),
              /* @__PURE__ */ p("div", { className: "flex items-center gap-1", children: [
                /* @__PURE__ */ l(
                  "button",
                  {
                    type: "button",
                    className: "btn-ghost btn-icon",
                    onClick: () => u(h, -1),
                    disabled: h === 0,
                    title: e("blocks.servicesGrid.moveUp"),
                    children: /* @__PURE__ */ l(Oe, { className: "h-3 w-3" })
                  }
                ),
                /* @__PURE__ */ l(
                  "button",
                  {
                    type: "button",
                    className: "btn-ghost btn-icon",
                    onClick: () => u(h, 1),
                    disabled: h === n.length - 1,
                    title: e("blocks.servicesGrid.moveDown"),
                    children: /* @__PURE__ */ l(Pe, { className: "h-3 w-3" })
                  }
                ),
                /* @__PURE__ */ l(
                  "button",
                  {
                    type: "button",
                    className: "btn-ghost btn-icon text-red-600",
                    onClick: () => c(h),
                    title: e("blocks.servicesGrid.removeService"),
                    children: /* @__PURE__ */ l(se, { className: "h-3 w-3" })
                  }
                )
              ] })
            ] }),
            /* @__PURE__ */ p("div", { className: "grid grid-cols-2 gap-2", children: [
              /* @__PURE__ */ p("div", { children: [
                /* @__PURE__ */ l("label", { className: "label text-xs", children: e("blocks.servicesGrid.icon") }),
                /* @__PURE__ */ l(
                  "input",
                  {
                    type: "text",
                    className: "input",
                    placeholder: "analytics",
                    value: d.icon ?? "",
                    onChange: (m) => i(h, { icon: m.target.value })
                  }
                )
              ] }),
              /* @__PURE__ */ l("div", { className: "flex items-end", children: /* @__PURE__ */ p("label", { className: "flex items-center gap-2 text-xs text-surface-700 dark:text-surface-200", children: [
                /* @__PURE__ */ l(
                  "input",
                  {
                    type: "checkbox",
                    checked: !!d.accent,
                    onChange: (m) => i(h, { accent: m.target.checked })
                  }
                ),
                e("blocks.servicesGrid.accent")
              ] }) })
            ] }),
            /* @__PURE__ */ p("div", { children: [
              /* @__PURE__ */ l("label", { className: "label text-xs", children: e("blocks.servicesGrid.serviceTitle") }),
              /* @__PURE__ */ l(
                "input",
                {
                  type: "text",
                  className: "input",
                  value: d.title ?? "",
                  onChange: (m) => i(h, { title: m.target.value })
                }
              )
            ] }),
            /* @__PURE__ */ p("div", { children: [
              /* @__PURE__ */ l("label", { className: "label text-xs", children: e("blocks.servicesGrid.serviceDescription") }),
              /* @__PURE__ */ l(
                "textarea",
                {
                  className: "input",
                  rows: 2,
                  value: d.description ?? "",
                  onChange: (m) => i(h, { description: m.target.value })
                }
              )
            ] }),
            /* @__PURE__ */ p("div", { className: "grid grid-cols-2 gap-2", children: [
              /* @__PURE__ */ p("div", { children: [
                /* @__PURE__ */ l("label", { className: "label text-xs", children: e("blocks.servicesGrid.ctaLabel") }),
                /* @__PURE__ */ l(
                  "input",
                  {
                    type: "text",
                    className: "input",
                    value: d.ctaLabel ?? "",
                    onChange: (m) => i(h, { ctaLabel: m.target.value })
                  }
                )
              ] }),
              /* @__PURE__ */ p("div", { children: [
                /* @__PURE__ */ l("label", { className: "label text-xs", children: e("blocks.servicesGrid.ctaHref") }),
                /* @__PURE__ */ l(
                  "input",
                  {
                    type: "text",
                    className: "input",
                    value: d.ctaHref ?? "",
                    onChange: (m) => i(h, { ctaHref: m.target.value })
                  }
                )
              ] })
            ] })
          ]
        },
        h
      ))
    ] }),
    /* @__PURE__ */ l("p", { className: "text-xs text-surface-500 dark:text-surface-400", children: e("blocks.servicesGrid.iconHelp") })
  ] });
}
const Zl = re({
  subId: wr,
  defaultAttrs: Cn,
  view: Kl
}), Ql = {
  id: `corporate/${wr}`,
  nodeName: We,
  titleKey: "blocks.servicesGrid.title",
  namespace: "theme-corporate",
  icon: ya,
  category: "layout",
  attrsSchema: Wl,
  extensions: [Zl],
  insert: (r) => {
    r.focus().insertContent({ type: We }).run();
  },
  isActive: (r) => r.isActive(We),
  inspector: (r) => /* @__PURE__ */ l(Yl, { editor: r.editor })
}, Xl = {
  variant: {
    description: "Look of the banner: navy = wide navy card with accent glows (default, also used for any unknown value), indigo = narrower solid indigo card.",
    values: ["navy", "indigo"]
  },
  title: {
    description: "Banner headline (<h2>). The block renders nothing when title and subtitle are both empty."
  },
  subtitle: { description: "Paragraph under the headline. Empty = hidden." },
  primaryCtaLabel: { description: "Primary button text. The button shows only when both label and link are set." },
  primaryCtaHref: { description: "Primary button link: site path (/contact.html) or absolute URL.", format: "URL" },
  secondaryCtaLabel: { description: "Secondary button text. The button shows only when both label and link are set." },
  secondaryCtaHref: { description: "Secondary button link: site path or absolute URL.", format: "URL" }
}, xr = "cta-banner", Ke = ae(xr), Nn = {
  variant: "navy",
  title: "",
  subtitle: "",
  primaryCtaLabel: "",
  primaryCtaHref: "",
  secondaryCtaLabel: "",
  secondaryCtaHref: ""
};
function ec({ attrs: r, selected: e }) {
  const { t } = H("theme-corporate");
  return /* @__PURE__ */ l(
    te,
    {
      contentEditable: !1,
      className: "my-4 rounded-lg border border-dashed border-surface-300 bg-surface-50 p-4 dark:border-surface-600 dark:bg-surface-900 " + (e ? "ring-2 ring-blue-500/60" : ""),
      children: /* @__PURE__ */ p("div", { className: "flex items-start gap-3", children: [
        /* @__PURE__ */ l(Sa, { className: "h-5 w-5 shrink-0 text-blue-500" }),
        /* @__PURE__ */ p("div", { className: "min-w-0 flex-1", children: [
          /* @__PURE__ */ l("p", { className: "text-xs font-semibold uppercase tracking-wide text-surface-500 dark:text-surface-400", children: t("blocks.ctaBanner.title") }),
          /* @__PURE__ */ l("p", { className: "text-sm text-surface-900 dark:text-surface-50 truncate", children: r.title || t("blocks.ctaBanner.untitled") })
        ] })
      ] })
    }
  );
}
function tc({ editor: r }) {
  const { t: e } = H("theme-corporate"), t = r.getAttributes(Ke), a = { ...Nn, ...t.attrs ?? {} };
  function n(o) {
    r.chain().updateAttributes(Ke, { attrs: { ...a, ...o } }).run();
  }
  return /* @__PURE__ */ p("div", { className: "space-y-3", children: [
    /* @__PURE__ */ p("div", { children: [
      /* @__PURE__ */ l("label", { className: "label", children: e("blocks.ctaBanner.variant") }),
      /* @__PURE__ */ p(
        "select",
        {
          className: "input",
          value: a.variant ?? "navy",
          onChange: (o) => n({ variant: o.target.value }),
          children: [
            /* @__PURE__ */ l("option", { value: "navy", children: e("blocks.ctaBanner.variants.navy") }),
            /* @__PURE__ */ l("option", { value: "indigo", children: e("blocks.ctaBanner.variants.indigo") })
          ]
        }
      )
    ] }),
    /* @__PURE__ */ p("div", { children: [
      /* @__PURE__ */ l("label", { className: "label", children: e("blocks.ctaBanner.heading") }),
      /* @__PURE__ */ l(
        "input",
        {
          type: "text",
          className: "input",
          value: a.title ?? "",
          onChange: (o) => n({ title: o.target.value })
        }
      )
    ] }),
    /* @__PURE__ */ p("div", { children: [
      /* @__PURE__ */ l("label", { className: "label", children: e("blocks.ctaBanner.subtitle") }),
      /* @__PURE__ */ l(
        "textarea",
        {
          className: "input",
          rows: 3,
          value: a.subtitle ?? "",
          onChange: (o) => n({ subtitle: o.target.value })
        }
      )
    ] }),
    /* @__PURE__ */ p("div", { className: "grid grid-cols-2 gap-3", children: [
      /* @__PURE__ */ p("div", { children: [
        /* @__PURE__ */ l("label", { className: "label", children: e("blocks.heroOverlay.primaryCtaLabel") }),
        /* @__PURE__ */ l(
          "input",
          {
            type: "text",
            className: "input",
            value: a.primaryCtaLabel ?? "",
            onChange: (o) => n({ primaryCtaLabel: o.target.value })
          }
        )
      ] }),
      /* @__PURE__ */ p("div", { children: [
        /* @__PURE__ */ l("label", { className: "label", children: e("blocks.heroOverlay.primaryCtaHref") }),
        /* @__PURE__ */ l(
          "input",
          {
            type: "text",
            className: "input",
            value: a.primaryCtaHref ?? "",
            onChange: (o) => n({ primaryCtaHref: o.target.value })
          }
        )
      ] }),
      /* @__PURE__ */ p("div", { children: [
        /* @__PURE__ */ l("label", { className: "label", children: e("blocks.heroOverlay.secondaryCtaLabel") }),
        /* @__PURE__ */ l(
          "input",
          {
            type: "text",
            className: "input",
            value: a.secondaryCtaLabel ?? "",
            onChange: (o) => n({ secondaryCtaLabel: o.target.value })
          }
        )
      ] }),
      /* @__PURE__ */ p("div", { children: [
        /* @__PURE__ */ l("label", { className: "label", children: e("blocks.heroOverlay.secondaryCtaHref") }),
        /* @__PURE__ */ l(
          "input",
          {
            type: "text",
            className: "input",
            value: a.secondaryCtaHref ?? "",
            onChange: (o) => n({ secondaryCtaHref: o.target.value })
          }
        )
      ] })
    ] })
  ] });
}
const rc = re({
  subId: xr,
  defaultAttrs: Nn,
  view: ec
}), ac = {
  id: `corporate/${xr}`,
  nodeName: Ke,
  titleKey: "blocks.ctaBanner.title",
  namespace: "theme-corporate",
  icon: Sa,
  category: "layout",
  attrsSchema: Xl,
  extensions: [rc],
  insert: (r) => {
    r.focus().insertContent({ type: Ke }).run();
  },
  isActive: (r) => r.isActive(Ke),
  inspector: (r) => /* @__PURE__ */ l(tc, { editor: r.editor })
}, nc = {
  variant: {
    description: "Look of the section: glass = frosted cards on a light surface (default, also used for any unknown value), navy = navy section with darker cards.",
    values: ["glass", "navy"]
  },
  eyebrow: { description: "Small uppercase label above the section heading. Empty = hidden." },
  title: {
    description: "Section heading (<h2>). The block renders nothing when it is empty and no testimonial has a quote or author name."
  },
  subtitle: { description: "Paragraph under the section heading. Empty = hidden." },
  testimonials: {
    description: "Testimonial cards (1–3 columns depending on count): [{ quote, authorName, authorTitle, authorAvatarUrl, authorAvatarAlt, rating }]. quote = text without quote marks; authorName = name (cards with neither quote nor name are skipped); authorTitle = role / company line (empty = hidden); authorAvatarUrl = avatar image URL (absolute or site path, e.g. a media variant URL; empty = initials of the name); authorAvatarAlt = avatar alt text (defaults to the name); rating = number of filled stars 1–5 (rounded and clamped to 0–5, default 5).",
    format: "array of objects"
  }
}, kr = "testimonials", Ye = ae(kr), kt = {
  rating: 5,
  quote: "",
  authorName: "",
  authorTitle: "",
  authorAvatarUrl: "",
  authorAvatarAlt: ""
}, An = {
  eyebrow: "",
  title: "",
  subtitle: "",
  variant: "glass",
  testimonials: [{ ...kt }, { ...kt }, { ...kt }]
};
function oc({ attrs: r, selected: e }) {
  var n;
  const { t } = H("theme-corporate"), a = ((n = r.testimonials) == null ? void 0 : n.length) ?? 0;
  return /* @__PURE__ */ l(
    te,
    {
      contentEditable: !1,
      className: "my-4 rounded-lg border border-dashed border-surface-300 bg-surface-50 p-4 dark:border-surface-600 dark:bg-surface-900 " + (e ? "ring-2 ring-blue-500/60" : ""),
      children: /* @__PURE__ */ p("div", { className: "flex items-start gap-3", children: [
        /* @__PURE__ */ l(Ca, { className: "h-5 w-5 shrink-0 text-blue-500" }),
        /* @__PURE__ */ p("div", { className: "min-w-0 flex-1", children: [
          /* @__PURE__ */ l("p", { className: "text-xs font-semibold uppercase tracking-wide text-surface-500 dark:text-surface-400", children: t("blocks.testimonials.title") }),
          /* @__PURE__ */ l("p", { className: "text-sm text-surface-900 dark:text-surface-50 truncate", children: r.title || t("blocks.testimonials.preview", { count: a }) })
        ] })
      ] })
    }
  );
}
function ic({ editor: r }) {
  const { t: e } = H("theme-corporate"), t = r.getAttributes(Ye), a = { ...An, ...t.attrs ?? {} }, n = a.testimonials ?? [];
  function o(d) {
    r.chain().updateAttributes(Ye, { attrs: { ...a, ...d } }).run();
  }
  function i(d, h) {
    o({ testimonials: n.map((m, f) => f === d ? { ...m, ...h } : m) });
  }
  function s() {
    o({ testimonials: [...n, { ...kt }] });
  }
  function c(d) {
    o({ testimonials: n.filter((h, m) => m !== d) });
  }
  function u(d, h) {
    const m = d + h;
    if (m < 0 || m >= n.length) return;
    const f = [...n];
    [f[d], f[m]] = [f[m], f[d]], o({ testimonials: f });
  }
  return /* @__PURE__ */ p("div", { className: "space-y-3", children: [
    /* @__PURE__ */ p("div", { children: [
      /* @__PURE__ */ l("label", { className: "label", children: e("blocks.testimonials.variant") }),
      /* @__PURE__ */ p(
        "select",
        {
          className: "input",
          value: a.variant ?? "glass",
          onChange: (d) => o({ variant: d.target.value }),
          children: [
            /* @__PURE__ */ l("option", { value: "glass", children: e("blocks.testimonials.variants.glass") }),
            /* @__PURE__ */ l("option", { value: "navy", children: e("blocks.testimonials.variants.navy") })
          ]
        }
      )
    ] }),
    /* @__PURE__ */ p("div", { children: [
      /* @__PURE__ */ l("label", { className: "label", children: e("blocks.testimonials.eyebrow") }),
      /* @__PURE__ */ l(
        "input",
        {
          type: "text",
          className: "input",
          value: a.eyebrow ?? "",
          onChange: (d) => o({ eyebrow: d.target.value })
        }
      )
    ] }),
    /* @__PURE__ */ p("div", { children: [
      /* @__PURE__ */ l("label", { className: "label", children: e("blocks.testimonials.heading") }),
      /* @__PURE__ */ l(
        "input",
        {
          type: "text",
          className: "input",
          value: a.title ?? "",
          onChange: (d) => o({ title: d.target.value })
        }
      )
    ] }),
    /* @__PURE__ */ p("div", { children: [
      /* @__PURE__ */ l("label", { className: "label", children: e("blocks.testimonials.subtitle") }),
      /* @__PURE__ */ l(
        "textarea",
        {
          className: "input",
          rows: 2,
          value: a.subtitle ?? "",
          onChange: (d) => o({ subtitle: d.target.value })
        }
      )
    ] }),
    /* @__PURE__ */ p("div", { className: "space-y-3 pt-3 border-t border-surface-200 dark:border-surface-700", children: [
      /* @__PURE__ */ p("div", { className: "flex items-center justify-between", children: [
        /* @__PURE__ */ l("p", { className: "text-xs font-semibold uppercase tracking-wide text-surface-500 dark:text-surface-400", children: e("blocks.testimonials.itemsHeading") }),
        /* @__PURE__ */ p(
          "button",
          {
            type: "button",
            className: "btn-ghost btn-sm flex items-center gap-1",
            onClick: s,
            children: [
              /* @__PURE__ */ l(we, { className: "h-3 w-3" }),
              e("blocks.testimonials.addItem")
            ]
          }
        )
      ] }),
      n.map((d, h) => /* @__PURE__ */ p(
        "div",
        {
          className: "rounded-md border border-surface-200 bg-surface-50 p-3 space-y-2 dark:border-surface-700 dark:bg-surface-800",
          children: [
            /* @__PURE__ */ p("div", { className: "flex items-center justify-between", children: [
              /* @__PURE__ */ l("p", { className: "text-xs font-semibold text-surface-600 dark:text-surface-300", children: e("blocks.testimonials.itemIndex", { index: h + 1 }) }),
              /* @__PURE__ */ p("div", { className: "flex items-center gap-1", children: [
                /* @__PURE__ */ l(
                  "button",
                  {
                    type: "button",
                    className: "btn-ghost btn-icon",
                    onClick: () => u(h, -1),
                    disabled: h === 0,
                    children: /* @__PURE__ */ l(Oe, { className: "h-3 w-3" })
                  }
                ),
                /* @__PURE__ */ l(
                  "button",
                  {
                    type: "button",
                    className: "btn-ghost btn-icon",
                    onClick: () => u(h, 1),
                    disabled: h === n.length - 1,
                    children: /* @__PURE__ */ l(Pe, { className: "h-3 w-3" })
                  }
                ),
                /* @__PURE__ */ l(
                  "button",
                  {
                    type: "button",
                    className: "btn-ghost btn-icon text-red-600",
                    onClick: () => c(h),
                    children: /* @__PURE__ */ l(se, { className: "h-3 w-3" })
                  }
                )
              ] })
            ] }),
            /* @__PURE__ */ p("div", { children: [
              /* @__PURE__ */ l("label", { className: "label text-xs", children: e("blocks.testimonials.quote") }),
              /* @__PURE__ */ l(
                "textarea",
                {
                  className: "input",
                  rows: 3,
                  value: d.quote ?? "",
                  onChange: (m) => i(h, { quote: m.target.value })
                }
              )
            ] }),
            /* @__PURE__ */ p("div", { className: "grid grid-cols-2 gap-2", children: [
              /* @__PURE__ */ p("div", { children: [
                /* @__PURE__ */ l("label", { className: "label text-xs", children: e("blocks.testimonials.authorName") }),
                /* @__PURE__ */ l(
                  "input",
                  {
                    type: "text",
                    className: "input",
                    value: d.authorName ?? "",
                    onChange: (m) => i(h, { authorName: m.target.value })
                  }
                )
              ] }),
              /* @__PURE__ */ p("div", { children: [
                /* @__PURE__ */ l("label", { className: "label text-xs", children: e("blocks.testimonials.authorTitle") }),
                /* @__PURE__ */ l(
                  "input",
                  {
                    type: "text",
                    className: "input",
                    value: d.authorTitle ?? "",
                    onChange: (m) => i(h, { authorTitle: m.target.value })
                  }
                )
              ] }),
              /* @__PURE__ */ p("div", { children: [
                /* @__PURE__ */ l("label", { className: "label text-xs", children: e("blocks.testimonials.avatarUrl") }),
                /* @__PURE__ */ l(
                  "input",
                  {
                    type: "url",
                    className: "input",
                    placeholder: "https://…",
                    value: d.authorAvatarUrl ?? "",
                    onChange: (m) => i(h, { authorAvatarUrl: m.target.value })
                  }
                )
              ] }),
              /* @__PURE__ */ p("div", { children: [
                /* @__PURE__ */ l("label", { className: "label text-xs", children: e("blocks.testimonials.rating") }),
                /* @__PURE__ */ l(
                  "input",
                  {
                    type: "number",
                    min: 1,
                    max: 5,
                    className: "input",
                    value: d.rating ?? 5,
                    onChange: (m) => i(h, { rating: Number(m.target.value) })
                  }
                )
              ] })
            ] })
          ]
        },
        h
      ))
    ] })
  ] });
}
const sc = re({
  subId: kr,
  defaultAttrs: An,
  view: oc
}), lc = {
  id: `corporate/${kr}`,
  nodeName: Ye,
  titleKey: "blocks.testimonials.title",
  namespace: "theme-corporate",
  icon: Ca,
  category: "layout",
  attrsSchema: nc,
  extensions: [sc],
  insert: (r) => {
    r.focus().insertContent({ type: Ye }).run();
  },
  isActive: (r) => r.isActive(Ye),
  inspector: (r) => /* @__PURE__ */ l(ic, { editor: r.editor })
}, cc = {
  label: { description: 'Small uppercase label above the logo row (e.g. "Trusted by industry leaders"). Empty = no label.' },
  logos: {
    description: "Logo row, shown greyscale and faded until hovered: [{ imageUrl, imageAlt, href }]. imageUrl = logo image URL (absolute or site path, e.g. a media variant URL from `media upload` → formats.<name>.url; logos without it are skipped, and the block renders nothing when none has one); imageAlt = alt text (the company name); href = optional link opened in a new tab (empty = static logo).",
    format: "array of objects"
  }
}, Sr = "trust-bar", Ze = ae(Sr), je = { imageUrl: "", imageAlt: "", href: "" }, Tn = {
  label: "",
  logos: [{ ...je }, { ...je }, { ...je }, { ...je }]
};
function dc({ attrs: r, selected: e }) {
  var n;
  const { t } = H("theme-corporate"), a = ((n = r.logos) == null ? void 0 : n.filter((o) => o.imageUrl).length) ?? 0;
  return /* @__PURE__ */ l(
    te,
    {
      contentEditable: !1,
      className: "my-4 rounded-lg border border-dashed border-surface-300 bg-surface-50 p-4 dark:border-surface-600 dark:bg-surface-900 " + (e ? "ring-2 ring-blue-500/60" : ""),
      children: /* @__PURE__ */ p("div", { className: "flex items-start gap-3", children: [
        /* @__PURE__ */ l(Aa, { className: "h-5 w-5 shrink-0 text-blue-500" }),
        /* @__PURE__ */ p("div", { className: "min-w-0 flex-1", children: [
          /* @__PURE__ */ l("p", { className: "text-xs font-semibold uppercase tracking-wide text-surface-500 dark:text-surface-400", children: t("blocks.trustBar.title") }),
          /* @__PURE__ */ l("p", { className: "text-sm text-surface-900 dark:text-surface-50 truncate", children: t("blocks.trustBar.preview", { count: a }) })
        ] })
      ] })
    }
  );
}
function uc({ editor: r }) {
  const { t: e } = H("theme-corporate"), t = r.getAttributes(Ze), a = { ...Tn, ...t.attrs ?? {} }, n = a.logos ?? [];
  function o(d) {
    r.chain().updateAttributes(Ze, { attrs: { ...a, ...d } }).run();
  }
  function i(d, h) {
    o({ logos: n.map((m, f) => f === d ? { ...m, ...h } : m) });
  }
  function s() {
    o({ logos: [...n, { ...je }] });
  }
  function c(d) {
    o({ logos: n.filter((h, m) => m !== d) });
  }
  function u(d, h) {
    const m = d + h;
    if (m < 0 || m >= n.length) return;
    const f = [...n];
    [f[d], f[m]] = [f[m], f[d]], o({ logos: f });
  }
  return /* @__PURE__ */ p("div", { className: "space-y-3", children: [
    /* @__PURE__ */ p("div", { children: [
      /* @__PURE__ */ l("label", { className: "label", children: e("blocks.trustBar.label") }),
      /* @__PURE__ */ l(
        "input",
        {
          type: "text",
          className: "input",
          placeholder: e("blocks.trustBar.labelPlaceholder"),
          value: a.label ?? "",
          onChange: (d) => o({ label: d.target.value })
        }
      )
    ] }),
    /* @__PURE__ */ p("div", { className: "space-y-3 pt-3 border-t border-surface-200 dark:border-surface-700", children: [
      /* @__PURE__ */ p("div", { className: "flex items-center justify-between", children: [
        /* @__PURE__ */ l("p", { className: "text-xs font-semibold uppercase tracking-wide text-surface-500 dark:text-surface-400", children: e("blocks.trustBar.logosHeading") }),
        /* @__PURE__ */ p(
          "button",
          {
            type: "button",
            className: "btn-ghost btn-sm flex items-center gap-1",
            onClick: s,
            children: [
              /* @__PURE__ */ l(we, { className: "h-3 w-3" }),
              e("blocks.trustBar.addLogo")
            ]
          }
        )
      ] }),
      n.map((d, h) => /* @__PURE__ */ p(
        "div",
        {
          className: "rounded-md border border-surface-200 bg-surface-50 p-3 space-y-2 dark:border-surface-700 dark:bg-surface-800",
          children: [
            /* @__PURE__ */ p("div", { className: "flex items-center justify-between", children: [
              /* @__PURE__ */ l("p", { className: "text-xs font-semibold text-surface-600 dark:text-surface-300", children: e("blocks.trustBar.logoIndex", { index: h + 1 }) }),
              /* @__PURE__ */ p("div", { className: "flex items-center gap-1", children: [
                /* @__PURE__ */ l(
                  "button",
                  {
                    type: "button",
                    className: "btn-ghost btn-icon",
                    onClick: () => u(h, -1),
                    disabled: h === 0,
                    children: /* @__PURE__ */ l(Oe, { className: "h-3 w-3" })
                  }
                ),
                /* @__PURE__ */ l(
                  "button",
                  {
                    type: "button",
                    className: "btn-ghost btn-icon",
                    onClick: () => u(h, 1),
                    disabled: h === n.length - 1,
                    children: /* @__PURE__ */ l(Pe, { className: "h-3 w-3" })
                  }
                ),
                /* @__PURE__ */ l(
                  "button",
                  {
                    type: "button",
                    className: "btn-ghost btn-icon text-red-600",
                    onClick: () => c(h),
                    children: /* @__PURE__ */ l(se, { className: "h-3 w-3" })
                  }
                )
              ] })
            ] }),
            /* @__PURE__ */ p("div", { children: [
              /* @__PURE__ */ l("label", { className: "label text-xs", children: e("blocks.trustBar.imageUrl") }),
              /* @__PURE__ */ l(
                "input",
                {
                  type: "url",
                  className: "input",
                  placeholder: "https://…",
                  value: d.imageUrl ?? "",
                  onChange: (m) => i(h, { imageUrl: m.target.value })
                }
              )
            ] }),
            /* @__PURE__ */ p("div", { className: "grid grid-cols-2 gap-2", children: [
              /* @__PURE__ */ p("div", { children: [
                /* @__PURE__ */ l("label", { className: "label text-xs", children: e("blocks.trustBar.imageAlt") }),
                /* @__PURE__ */ l(
                  "input",
                  {
                    type: "text",
                    className: "input",
                    value: d.imageAlt ?? "",
                    onChange: (m) => i(h, { imageAlt: m.target.value })
                  }
                )
              ] }),
              /* @__PURE__ */ p("div", { children: [
                /* @__PURE__ */ l("label", { className: "label text-xs", children: e("blocks.trustBar.href") }),
                /* @__PURE__ */ l(
                  "input",
                  {
                    type: "url",
                    className: "input",
                    placeholder: "https://…",
                    value: d.href ?? "",
                    onChange: (m) => i(h, { href: m.target.value })
                  }
                )
              ] })
            ] })
          ]
        },
        h
      ))
    ] })
  ] });
}
const pc = re({
  subId: Sr,
  defaultAttrs: Tn,
  view: dc
}), hc = {
  id: `corporate/${Sr}`,
  nodeName: Ze,
  titleKey: "blocks.trustBar.title",
  namespace: "theme-corporate",
  icon: Aa,
  category: "layout",
  attrsSchema: cc,
  extensions: [pc],
  insert: (r) => {
    r.focus().insertContent({ type: Ze }).run();
  },
  isActive: (r) => r.isActive(Ze),
  inspector: (r) => /* @__PURE__ */ l(uc, { editor: r.editor })
}, mc = {
  eyebrow: { description: "Small uppercase label above the section heading. Empty = hidden." },
  title: {
    description: "Section heading (<h2>). The block renders nothing when it is empty and no stat has a value or label."
  },
  subtitle: { description: "Paragraph under the section heading. Empty = hidden." },
  stats: {
    description: 'Key figures in a 1–4 column grid (4+ items = 4 columns): [{ value, label }]. value = the big figure as text ("500+", "30%", "24/7"); label = the caption under it. Items with neither are skipped.',
    format: "array of objects"
  }
}, Cr = "stats-grid", Qe = ae(Cr), De = { value: "", label: "" }, En = {
  eyebrow: "",
  title: "",
  subtitle: "",
  stats: [{ ...De }, { ...De }, { ...De }, { ...De }]
};
function fc({ attrs: r, selected: e }) {
  var n;
  const { t } = H("theme-corporate"), a = ((n = r.stats) == null ? void 0 : n.length) ?? 0;
  return /* @__PURE__ */ l(
    te,
    {
      contentEditable: !1,
      className: "my-4 rounded-lg border border-dashed border-surface-300 bg-surface-50 p-4 dark:border-surface-600 dark:bg-surface-900 " + (e ? "ring-2 ring-blue-500/60" : ""),
      children: /* @__PURE__ */ p("div", { className: "flex items-start gap-3", children: [
        /* @__PURE__ */ l(ba, { className: "h-5 w-5 shrink-0 text-blue-500" }),
        /* @__PURE__ */ p("div", { className: "min-w-0 flex-1", children: [
          /* @__PURE__ */ l("p", { className: "text-xs font-semibold uppercase tracking-wide text-surface-500 dark:text-surface-400", children: t("blocks.statsGrid.title") }),
          /* @__PURE__ */ l("p", { className: "text-sm text-surface-900 dark:text-surface-50 truncate", children: r.title || t("blocks.statsGrid.preview", { count: a }) })
        ] })
      ] })
    }
  );
}
function gc({ editor: r }) {
  const { t: e } = H("theme-corporate"), t = r.getAttributes(Qe), a = { ...En, ...t.attrs ?? {} }, n = a.stats ?? [];
  function o(d) {
    r.chain().updateAttributes(Qe, { attrs: { ...a, ...d } }).run();
  }
  function i(d, h) {
    o({ stats: n.map((m, f) => f === d ? { ...m, ...h } : m) });
  }
  function s() {
    o({ stats: [...n, { ...De }] });
  }
  function c(d) {
    o({ stats: n.filter((h, m) => m !== d) });
  }
  function u(d, h) {
    const m = d + h;
    if (m < 0 || m >= n.length) return;
    const f = [...n];
    [f[d], f[m]] = [f[m], f[d]], o({ stats: f });
  }
  return /* @__PURE__ */ p("div", { className: "space-y-3", children: [
    /* @__PURE__ */ p("div", { children: [
      /* @__PURE__ */ l("label", { className: "label", children: e("blocks.statsGrid.eyebrow") }),
      /* @__PURE__ */ l(
        "input",
        {
          type: "text",
          className: "input",
          value: a.eyebrow ?? "",
          onChange: (d) => o({ eyebrow: d.target.value })
        }
      )
    ] }),
    /* @__PURE__ */ p("div", { children: [
      /* @__PURE__ */ l("label", { className: "label", children: e("blocks.statsGrid.heading") }),
      /* @__PURE__ */ l(
        "input",
        {
          type: "text",
          className: "input",
          value: a.title ?? "",
          onChange: (d) => o({ title: d.target.value })
        }
      )
    ] }),
    /* @__PURE__ */ p("div", { children: [
      /* @__PURE__ */ l("label", { className: "label", children: e("blocks.statsGrid.subtitle") }),
      /* @__PURE__ */ l(
        "textarea",
        {
          className: "input",
          rows: 2,
          value: a.subtitle ?? "",
          onChange: (d) => o({ subtitle: d.target.value })
        }
      )
    ] }),
    /* @__PURE__ */ p("div", { className: "space-y-3 pt-3 border-t border-surface-200 dark:border-surface-700", children: [
      /* @__PURE__ */ p("div", { className: "flex items-center justify-between", children: [
        /* @__PURE__ */ l("p", { className: "text-xs font-semibold uppercase tracking-wide text-surface-500 dark:text-surface-400", children: e("blocks.statsGrid.statsHeading") }),
        /* @__PURE__ */ p(
          "button",
          {
            type: "button",
            className: "btn-ghost btn-sm flex items-center gap-1",
            onClick: s,
            children: [
              /* @__PURE__ */ l(we, { className: "h-3 w-3" }),
              e("blocks.statsGrid.addItem")
            ]
          }
        )
      ] }),
      n.map((d, h) => /* @__PURE__ */ p(
        "div",
        {
          className: "rounded-md border border-surface-200 bg-surface-50 p-3 space-y-2 dark:border-surface-700 dark:bg-surface-800",
          children: [
            /* @__PURE__ */ p("div", { className: "flex items-center justify-between", children: [
              /* @__PURE__ */ l("p", { className: "text-xs font-semibold text-surface-600 dark:text-surface-300", children: e("blocks.statsGrid.itemIndex", { index: h + 1 }) }),
              /* @__PURE__ */ p("div", { className: "flex items-center gap-1", children: [
                /* @__PURE__ */ l(
                  "button",
                  {
                    type: "button",
                    className: "btn-ghost btn-icon",
                    onClick: () => u(h, -1),
                    disabled: h === 0,
                    children: /* @__PURE__ */ l(Oe, { className: "h-3 w-3" })
                  }
                ),
                /* @__PURE__ */ l(
                  "button",
                  {
                    type: "button",
                    className: "btn-ghost btn-icon",
                    onClick: () => u(h, 1),
                    disabled: h === n.length - 1,
                    children: /* @__PURE__ */ l(Pe, { className: "h-3 w-3" })
                  }
                ),
                /* @__PURE__ */ l(
                  "button",
                  {
                    type: "button",
                    className: "btn-ghost btn-icon text-red-600",
                    onClick: () => c(h),
                    children: /* @__PURE__ */ l(se, { className: "h-3 w-3" })
                  }
                )
              ] })
            ] }),
            /* @__PURE__ */ p("div", { className: "grid grid-cols-2 gap-2", children: [
              /* @__PURE__ */ p("div", { children: [
                /* @__PURE__ */ l("label", { className: "label text-xs", children: e("blocks.statsGrid.value") }),
                /* @__PURE__ */ l(
                  "input",
                  {
                    type: "text",
                    className: "input",
                    placeholder: "500+",
                    value: d.value ?? "",
                    onChange: (m) => i(h, { value: m.target.value })
                  }
                )
              ] }),
              /* @__PURE__ */ p("div", { children: [
                /* @__PURE__ */ l("label", { className: "label text-xs", children: e("blocks.statsGrid.itemLabel") }),
                /* @__PURE__ */ l(
                  "input",
                  {
                    type: "text",
                    className: "input",
                    placeholder: "Clients",
                    value: d.label ?? "",
                    onChange: (m) => i(h, { label: m.target.value })
                  }
                )
              ] })
            ] })
          ]
        },
        h
      ))
    ] })
  ] });
}
const bc = re({
  subId: Cr,
  defaultAttrs: En,
  view: fc
}), yc = {
  id: `corporate/${Cr}`,
  nodeName: Qe,
  titleKey: "blocks.statsGrid.title",
  namespace: "theme-corporate",
  icon: ba,
  category: "layout",
  attrsSchema: mc,
  extensions: [bc],
  insert: (r) => {
    r.focus().insertContent({ type: Qe }).run();
  },
  isActive: (r) => r.isActive(Qe),
  inspector: (r) => /* @__PURE__ */ l(gc, { editor: r.editor })
}, vc = {
  eyebrow: { description: "Small uppercase label above the section heading. Empty = hidden." },
  title: {
    description: "Section heading (<h2>). The block renders nothing when it is empty and no feature has a title or description."
  },
  subtitle: { description: "Paragraph under the section heading. Empty = hidden." },
  alternate: {
    description: "true (default) = the image switches side on every other row (right, left, right…); false = image always on the right. A row's imagePosition overrides it.",
    values: [!0, !1]
  },
  features: {
    description: 'Image + text rows: [{ icon, eyebrow, title, description, ctaLabel, ctaHref, imageUrl, imageAlt, imagePosition }]. icon = a Material Symbols Outlined glyph name (rocket_launch, insights…; default auto_awesome, empty = no icon); eyebrow = small label above the row title; title / description = row text (rows with neither are skipped); ctaLabel + ctaHref = text link (both needed; href = site path or absolute URL); imageUrl = 16:9 image URL (absolute or site path, e.g. a media variant URL from `media upload` → formats.<name>.url; empty = text only); imageAlt = alt text (defaults to the title); imagePosition = "left" or "right" to pin the image side, omit for the alternate rule.',
    format: "array of objects"
  }
}, Nr = "feature-stack", Xe = ae(Nr), rr = {
  icon: "auto_awesome",
  eyebrow: "",
  title: "",
  description: "",
  ctaLabel: "",
  ctaHref: "",
  imageUrl: "",
  imageAlt: "",
  imagePosition: void 0
}, Ln = {
  eyebrow: "",
  title: "",
  subtitle: "",
  alternate: !0,
  features: [{ ...rr }, { ...rr }]
};
function wc({ attrs: r, selected: e }) {
  var n;
  const { t } = H("theme-corporate"), a = ((n = r.features) == null ? void 0 : n.length) ?? 0;
  return /* @__PURE__ */ l(
    te,
    {
      contentEditable: !1,
      className: "my-4 rounded-lg border border-dashed border-surface-300 bg-surface-50 p-4 dark:border-surface-600 dark:bg-surface-900 " + (e ? "ring-2 ring-blue-500/60" : ""),
      children: /* @__PURE__ */ p("div", { className: "flex items-start gap-3", children: [
        /* @__PURE__ */ l(va, { className: "h-5 w-5 shrink-0 text-blue-500" }),
        /* @__PURE__ */ p("div", { className: "min-w-0 flex-1", children: [
          /* @__PURE__ */ l("p", { className: "text-xs font-semibold uppercase tracking-wide text-surface-500 dark:text-surface-400", children: t("blocks.featureStack.title") }),
          /* @__PURE__ */ l("p", { className: "text-sm text-surface-900 dark:text-surface-50 truncate", children: r.title || t("blocks.featureStack.preview", { count: a }) })
        ] })
      ] })
    }
  );
}
function xc({ editor: r }) {
  const { t: e } = H("theme-corporate"), t = r.getAttributes(Xe), a = { ...Ln, ...t.attrs ?? {} }, n = a.features ?? [];
  function o(d) {
    r.chain().updateAttributes(Xe, { attrs: { ...a, ...d } }).run();
  }
  function i(d, h) {
    o({ features: n.map((m, f) => f === d ? { ...m, ...h } : m) });
  }
  function s() {
    o({ features: [...n, { ...rr }] });
  }
  function c(d) {
    o({ features: n.filter((h, m) => m !== d) });
  }
  function u(d, h) {
    const m = d + h;
    if (m < 0 || m >= n.length) return;
    const f = [...n];
    [f[d], f[m]] = [f[m], f[d]], o({ features: f });
  }
  return /* @__PURE__ */ p("div", { className: "space-y-3", children: [
    /* @__PURE__ */ p("div", { children: [
      /* @__PURE__ */ l("label", { className: "label", children: e("blocks.featureStack.eyebrow") }),
      /* @__PURE__ */ l(
        "input",
        {
          type: "text",
          className: "input",
          value: a.eyebrow ?? "",
          onChange: (d) => o({ eyebrow: d.target.value })
        }
      )
    ] }),
    /* @__PURE__ */ p("div", { children: [
      /* @__PURE__ */ l("label", { className: "label", children: e("blocks.featureStack.heading") }),
      /* @__PURE__ */ l(
        "input",
        {
          type: "text",
          className: "input",
          value: a.title ?? "",
          onChange: (d) => o({ title: d.target.value })
        }
      )
    ] }),
    /* @__PURE__ */ p("div", { children: [
      /* @__PURE__ */ l("label", { className: "label", children: e("blocks.featureStack.subtitle") }),
      /* @__PURE__ */ l(
        "textarea",
        {
          className: "input",
          rows: 2,
          value: a.subtitle ?? "",
          onChange: (d) => o({ subtitle: d.target.value })
        }
      )
    ] }),
    /* @__PURE__ */ p("label", { className: "flex items-center gap-2 text-sm text-surface-700 dark:text-surface-200", children: [
      /* @__PURE__ */ l(
        "input",
        {
          type: "checkbox",
          checked: a.alternate !== !1,
          onChange: (d) => o({ alternate: d.target.checked })
        }
      ),
      e("blocks.featureStack.alternate")
    ] }),
    /* @__PURE__ */ p("div", { className: "space-y-3 pt-3 border-t border-surface-200 dark:border-surface-700", children: [
      /* @__PURE__ */ p("div", { className: "flex items-center justify-between", children: [
        /* @__PURE__ */ l("p", { className: "text-xs font-semibold uppercase tracking-wide text-surface-500 dark:text-surface-400", children: e("blocks.featureStack.featuresHeading") }),
        /* @__PURE__ */ p(
          "button",
          {
            type: "button",
            className: "btn-ghost btn-sm flex items-center gap-1",
            onClick: s,
            children: [
              /* @__PURE__ */ l(we, { className: "h-3 w-3" }),
              e("blocks.featureStack.addFeature")
            ]
          }
        )
      ] }),
      n.map((d, h) => /* @__PURE__ */ p(
        "div",
        {
          className: "rounded-md border border-surface-200 bg-surface-50 p-3 space-y-2 dark:border-surface-700 dark:bg-surface-800",
          children: [
            /* @__PURE__ */ p("div", { className: "flex items-center justify-between", children: [
              /* @__PURE__ */ l("p", { className: "text-xs font-semibold text-surface-600 dark:text-surface-300", children: e("blocks.featureStack.itemIndex", { index: h + 1 }) }),
              /* @__PURE__ */ p("div", { className: "flex items-center gap-1", children: [
                /* @__PURE__ */ l(
                  "button",
                  {
                    type: "button",
                    className: "btn-ghost btn-icon",
                    onClick: () => u(h, -1),
                    disabled: h === 0,
                    children: /* @__PURE__ */ l(Oe, { className: "h-3 w-3" })
                  }
                ),
                /* @__PURE__ */ l(
                  "button",
                  {
                    type: "button",
                    className: "btn-ghost btn-icon",
                    onClick: () => u(h, 1),
                    disabled: h === n.length - 1,
                    children: /* @__PURE__ */ l(Pe, { className: "h-3 w-3" })
                  }
                ),
                /* @__PURE__ */ l(
                  "button",
                  {
                    type: "button",
                    className: "btn-ghost btn-icon text-red-600",
                    onClick: () => c(h),
                    children: /* @__PURE__ */ l(se, { className: "h-3 w-3" })
                  }
                )
              ] })
            ] }),
            /* @__PURE__ */ p("div", { className: "grid grid-cols-2 gap-2", children: [
              /* @__PURE__ */ p("div", { children: [
                /* @__PURE__ */ l("label", { className: "label text-xs", children: e("blocks.featureStack.icon") }),
                /* @__PURE__ */ l(
                  "input",
                  {
                    type: "text",
                    className: "input",
                    placeholder: "rocket_launch",
                    value: d.icon ?? "",
                    onChange: (m) => i(h, { icon: m.target.value })
                  }
                )
              ] }),
              /* @__PURE__ */ p("div", { children: [
                /* @__PURE__ */ l("label", { className: "label text-xs", children: e("blocks.featureStack.eyebrowField") }),
                /* @__PURE__ */ l(
                  "input",
                  {
                    type: "text",
                    className: "input",
                    value: d.eyebrow ?? "",
                    onChange: (m) => i(h, { eyebrow: m.target.value })
                  }
                )
              ] })
            ] }),
            /* @__PURE__ */ p("div", { children: [
              /* @__PURE__ */ l("label", { className: "label text-xs", children: e("blocks.featureStack.featureTitle") }),
              /* @__PURE__ */ l(
                "input",
                {
                  type: "text",
                  className: "input",
                  value: d.title ?? "",
                  onChange: (m) => i(h, { title: m.target.value })
                }
              )
            ] }),
            /* @__PURE__ */ p("div", { children: [
              /* @__PURE__ */ l("label", { className: "label text-xs", children: e("blocks.featureStack.featureDescription") }),
              /* @__PURE__ */ l(
                "textarea",
                {
                  className: "input",
                  rows: 2,
                  value: d.description ?? "",
                  onChange: (m) => i(h, { description: m.target.value })
                }
              )
            ] }),
            /* @__PURE__ */ p("div", { children: [
              /* @__PURE__ */ l("label", { className: "label text-xs", children: e("blocks.featureStack.imageUrl") }),
              /* @__PURE__ */ l(
                "input",
                {
                  type: "url",
                  className: "input",
                  placeholder: "https://…",
                  value: d.imageUrl ?? "",
                  onChange: (m) => i(h, { imageUrl: m.target.value })
                }
              )
            ] }),
            /* @__PURE__ */ p("div", { className: "grid grid-cols-2 gap-2", children: [
              /* @__PURE__ */ p("div", { children: [
                /* @__PURE__ */ l("label", { className: "label text-xs", children: e("blocks.featureStack.ctaLabel") }),
                /* @__PURE__ */ l(
                  "input",
                  {
                    type: "text",
                    className: "input",
                    value: d.ctaLabel ?? "",
                    onChange: (m) => i(h, { ctaLabel: m.target.value })
                  }
                )
              ] }),
              /* @__PURE__ */ p("div", { children: [
                /* @__PURE__ */ l("label", { className: "label text-xs", children: e("blocks.featureStack.ctaHref") }),
                /* @__PURE__ */ l(
                  "input",
                  {
                    type: "text",
                    className: "input",
                    value: d.ctaHref ?? "",
                    onChange: (m) => i(h, { ctaHref: m.target.value })
                  }
                )
              ] })
            ] }),
            /* @__PURE__ */ p("div", { children: [
              /* @__PURE__ */ l("label", { className: "label text-xs", children: e("blocks.featureStack.imagePosition") }),
              /* @__PURE__ */ p(
                "select",
                {
                  className: "input",
                  value: d.imagePosition ?? "",
                  onChange: (m) => i(h, {
                    imagePosition: m.target.value || void 0
                  }),
                  children: [
                    /* @__PURE__ */ l("option", { value: "", children: e("blocks.featureStack.imagePositions.auto") }),
                    /* @__PURE__ */ l("option", { value: "left", children: e("blocks.featureStack.imagePositions.left") }),
                    /* @__PURE__ */ l("option", { value: "right", children: e("blocks.featureStack.imagePositions.right") })
                  ]
                }
              )
            ] })
          ]
        },
        h
      ))
    ] })
  ] });
}
const kc = re({
  subId: Nr,
  defaultAttrs: Ln,
  view: wc
}), Sc = {
  id: `corporate/${Nr}`,
  nodeName: Xe,
  titleKey: "blocks.featureStack.title",
  namespace: "theme-corporate",
  icon: va,
  category: "layout",
  attrsSchema: vc,
  extensions: [kc],
  insert: (r) => {
    r.focus().insertContent({ type: Xe }).run();
  },
  isActive: (r) => r.isActive(Xe),
  inspector: (r) => /* @__PURE__ */ l(xc, { editor: r.editor })
}, Cc = {
  heading: { description: 'Card heading (e.g. "Contact information"). Empty = hidden.' },
  addressLines: {
    description: 'Address row (location icon, titled "Address"). Plain text, \\n = line break. Empty = row hidden. The block renders nothing when address, phone, email and socials are all empty.'
  },
  phoneLines: { description: 'Phone row (titled "Phone"). Plain text, \\n = line break (not a tel: link). Empty = row hidden.' },
  emailLines: { description: 'Email row (titled "Email"). Plain text, \\n = line break (not a mailto: link). Empty = row hidden.' },
  socialsLabel: { description: "Small uppercase label above the social icons. Empty = hidden." },
  socials: {
    description: 'Round social icon links under the card: [{ icon, href, ariaLabel }]. icon = a Material Symbols Outlined glyph name (share, language, hub, mail…; brand logos are not in that font; default share); href = link opened in a new tab (absolute URL; default #); ariaLabel = accessible name (e.g. "LinkedIn"). Entries with neither icon nor href are skipped; empty array = no socials strip.',
    format: "array of objects"
  }
}, Ar = "contact-info", et = ae(Ar), Nc = { icon: "share", href: "", ariaLabel: "" }, Mn = {
  heading: "",
  addressLines: "",
  phoneLines: "",
  emailLines: "",
  socialsLabel: "",
  socials: []
};
function Ac({ attrs: r, selected: e }) {
  const { t } = H("theme-corporate"), a = [r.addressLines, r.phoneLines, r.emailLines].filter(Boolean).length;
  return /* @__PURE__ */ l(
    te,
    {
      contentEditable: !1,
      className: "my-4 rounded-lg border border-dashed border-surface-300 bg-surface-50 p-4 dark:border-surface-600 dark:bg-surface-900 " + (e ? "ring-2 ring-blue-500/60" : ""),
      children: /* @__PURE__ */ p("div", { className: "flex items-start gap-3", children: [
        /* @__PURE__ */ l(ka, { className: "h-5 w-5 shrink-0 text-blue-500" }),
        /* @__PURE__ */ p("div", { className: "min-w-0 flex-1", children: [
          /* @__PURE__ */ l("p", { className: "text-xs font-semibold uppercase tracking-wide text-surface-500 dark:text-surface-400", children: t("blocks.contactInfo.title") }),
          /* @__PURE__ */ l("p", { className: "text-sm text-surface-900 dark:text-surface-50 truncate", children: r.heading || t("blocks.contactInfo.preview", { lines: a }) })
        ] })
      ] })
    }
  );
}
function Tc({ editor: r }) {
  const { t: e } = H("theme-corporate"), t = r.getAttributes(et), a = { ...Mn, ...t.attrs ?? {} }, n = a.socials ?? [];
  function o(s) {
    r.chain().updateAttributes(et, { attrs: { ...a, ...s } }).run();
  }
  function i(s, c) {
    o({ socials: n.map((u, d) => d === s ? { ...u, ...c } : u) });
  }
  return /* @__PURE__ */ p("div", { className: "space-y-3", children: [
    /* @__PURE__ */ p("div", { children: [
      /* @__PURE__ */ l("label", { className: "label", children: e("blocks.contactInfo.heading") }),
      /* @__PURE__ */ l(
        "input",
        {
          type: "text",
          className: "input",
          placeholder: e("blocks.contactInfo.headingPlaceholder"),
          value: a.heading ?? "",
          onChange: (s) => o({ heading: s.target.value })
        }
      )
    ] }),
    /* @__PURE__ */ p("div", { children: [
      /* @__PURE__ */ l("label", { className: "label", children: e("blocks.contactInfo.address") }),
      /* @__PURE__ */ l(
        "textarea",
        {
          className: "input",
          rows: 2,
          value: a.addressLines ?? "",
          onChange: (s) => o({ addressLines: s.target.value })
        }
      ),
      /* @__PURE__ */ l("p", { className: "text-xs text-surface-500 mt-1 dark:text-surface-400", children: e("blocks.contactInfo.multilineHelp") })
    ] }),
    /* @__PURE__ */ p("div", { children: [
      /* @__PURE__ */ l("label", { className: "label", children: e("blocks.contactInfo.phone") }),
      /* @__PURE__ */ l(
        "textarea",
        {
          className: "input",
          rows: 2,
          value: a.phoneLines ?? "",
          onChange: (s) => o({ phoneLines: s.target.value })
        }
      )
    ] }),
    /* @__PURE__ */ p("div", { children: [
      /* @__PURE__ */ l("label", { className: "label", children: e("blocks.contactInfo.email") }),
      /* @__PURE__ */ l(
        "textarea",
        {
          className: "input",
          rows: 2,
          value: a.emailLines ?? "",
          onChange: (s) => o({ emailLines: s.target.value })
        }
      )
    ] }),
    /* @__PURE__ */ p("div", { className: "pt-3 border-t border-surface-200 dark:border-surface-700 space-y-3", children: [
      /* @__PURE__ */ p("div", { children: [
        /* @__PURE__ */ l("label", { className: "label", children: e("blocks.contactInfo.socialsLabel") }),
        /* @__PURE__ */ l(
          "input",
          {
            type: "text",
            className: "input",
            value: a.socialsLabel ?? "",
            onChange: (s) => o({ socialsLabel: s.target.value })
          }
        )
      ] }),
      /* @__PURE__ */ p("div", { className: "flex items-center justify-between", children: [
        /* @__PURE__ */ l("p", { className: "text-xs font-semibold uppercase tracking-wide text-surface-500 dark:text-surface-400", children: e("blocks.contactInfo.socials") }),
        /* @__PURE__ */ p(
          "button",
          {
            type: "button",
            className: "btn-ghost btn-sm flex items-center gap-1",
            onClick: () => o({ socials: [...n, { ...Nc }] }),
            children: [
              /* @__PURE__ */ l(we, { className: "h-3 w-3" }),
              e("blocks.contactInfo.addSocial")
            ]
          }
        )
      ] }),
      n.map((s, c) => /* @__PURE__ */ p(
        "div",
        {
          className: "rounded-md border border-surface-200 bg-surface-50 p-2 grid grid-cols-[1fr_2fr_auto] gap-2 items-end dark:border-surface-700 dark:bg-surface-800",
          children: [
            /* @__PURE__ */ p("div", { children: [
              /* @__PURE__ */ l("label", { className: "label text-xs", children: e("blocks.contactInfo.socialIcon") }),
              /* @__PURE__ */ l(
                "input",
                {
                  type: "text",
                  className: "input",
                  placeholder: "share",
                  value: s.icon ?? "",
                  onChange: (u) => i(c, { icon: u.target.value })
                }
              )
            ] }),
            /* @__PURE__ */ p("div", { children: [
              /* @__PURE__ */ l("label", { className: "label text-xs", children: e("blocks.contactInfo.socialHref") }),
              /* @__PURE__ */ l(
                "input",
                {
                  type: "url",
                  className: "input",
                  placeholder: "https://…",
                  value: s.href ?? "",
                  onChange: (u) => i(c, { href: u.target.value })
                }
              )
            ] }),
            /* @__PURE__ */ l(
              "button",
              {
                type: "button",
                className: "btn-ghost btn-icon text-red-600",
                onClick: () => o({ socials: n.filter((u, d) => d !== c) }),
                children: /* @__PURE__ */ l(se, { className: "h-3 w-3" })
              }
            )
          ]
        },
        c
      ))
    ] })
  ] });
}
const Ec = re({
  subId: Ar,
  defaultAttrs: Mn,
  view: Ac
}), Lc = {
  id: `corporate/${Ar}`,
  nodeName: et,
  titleKey: "blocks.contactInfo.title",
  namespace: "theme-corporate",
  icon: ka,
  category: "layout",
  attrsSchema: Cc,
  extensions: [Ec],
  insert: (r) => {
    r.focus().insertContent({ type: et }).run();
  },
  isActive: (r) => r.isActive(et),
  inspector: (r) => /* @__PURE__ */ l(Tc, { editor: r.editor })
}, Mc = {
  heading: { description: "Form card heading. Empty = hidden." },
  subtitle: { description: "Paragraph under the heading. Empty = hidden." },
  mode: {
    description: "Submit destination: endpoint = POST to endpointUrl from the theme script (Formspree-compatible; default, also used for any unknown value), mailto = open the visitor's mail client addressed to mailtoAddress with the fields pre-filled.",
    values: ["endpoint", "mailto"]
  },
  endpointUrl: {
    description: "Form service URL used in endpoint mode (e.g. https://formspree.io/f/abcdefg). Empty = the form is not intercepted and does nothing useful.",
    format: "URL"
  },
  mailtoAddress: { description: "Recipient address used in mailto mode.", format: "email" },
  labelName: { description: 'Label of the required name field (sample: "Full name").' },
  labelEmail: { description: 'Label of the required email field (sample: "Work email").' },
  labelCompany: { description: 'Label of the optional company field (sample: "Company").' },
  labelSubject: { description: 'Label of the subject dropdown (sample: "Subject"); only shown when subjectOptions is set.' },
  labelMessage: { description: 'Label of the required message textarea (sample: "Message").' },
  subjectOptions: {
    description: "Options of a required subject dropdown, one per line (\\n-separated). Empty = no subject field."
  },
  submitLabel: { description: 'Submit button text (sample: "Send inquiry").' },
  privacyText: {
    description: "Text of a required consent checkbox; wrap part of it in [link]…[/link] to link it to privacyHref. Empty = no checkbox."
  },
  privacyHref: { description: "Target of the [link]…[/link] part of privacyText (site path or absolute URL, opens in a new tab). Empty = plain text.", format: "URL" },
  successMessage: {
    description: "Message shown after a successful endpoint submission. Empty = a default thank-you line."
  },
  errorMessage: {
    description: "Message shown when the endpoint answers with an error. Empty = a default error line."
  }
}, Tr = "contact-form", tt = ae(Tr), In = {
  heading: "",
  subtitle: "",
  mode: "endpoint",
  endpointUrl: "",
  mailtoAddress: "",
  labelName: "Full name",
  labelEmail: "Work email",
  labelCompany: "Company",
  labelSubject: "Subject",
  labelMessage: "Message",
  subjectOptions: "",
  submitLabel: "Send inquiry",
  privacyText: "",
  privacyHref: "",
  successMessage: "",
  errorMessage: ""
};
function Ic({ attrs: r, selected: e }) {
  const { t } = H("theme-corporate");
  return /* @__PURE__ */ l(
    te,
    {
      contentEditable: !1,
      className: "my-4 rounded-lg border border-dashed border-surface-300 bg-surface-50 p-4 dark:border-surface-600 dark:bg-surface-900 " + (e ? "ring-2 ring-blue-500/60" : ""),
      children: /* @__PURE__ */ p("div", { className: "flex items-start gap-3", children: [
        /* @__PURE__ */ l(xa, { className: "h-5 w-5 shrink-0 text-blue-500" }),
        /* @__PURE__ */ p("div", { className: "min-w-0 flex-1", children: [
          /* @__PURE__ */ l("p", { className: "text-xs font-semibold uppercase tracking-wide text-surface-500 dark:text-surface-400", children: t("blocks.contactForm.title") }),
          /* @__PURE__ */ l("p", { className: "text-sm text-surface-900 dark:text-surface-50 truncate", children: r.heading || t("blocks.contactForm.preview", { mode: r.mode ?? "endpoint" }) })
        ] })
      ] })
    }
  );
}
function Hc({ editor: r }) {
  const { t: e } = H("theme-corporate"), t = r.getAttributes(tt), a = { ...In, ...t.attrs ?? {} };
  function n(o) {
    r.chain().updateAttributes(tt, { attrs: { ...a, ...o } }).run();
  }
  return /* @__PURE__ */ p("div", { className: "space-y-3", children: [
    /* @__PURE__ */ p("div", { children: [
      /* @__PURE__ */ l("label", { className: "label", children: e("blocks.contactForm.heading") }),
      /* @__PURE__ */ l(
        "input",
        {
          type: "text",
          className: "input",
          value: a.heading ?? "",
          onChange: (o) => n({ heading: o.target.value })
        }
      )
    ] }),
    /* @__PURE__ */ p("div", { children: [
      /* @__PURE__ */ l("label", { className: "label", children: e("blocks.contactForm.subtitle") }),
      /* @__PURE__ */ l(
        "textarea",
        {
          className: "input",
          rows: 2,
          value: a.subtitle ?? "",
          onChange: (o) => n({ subtitle: o.target.value })
        }
      )
    ] }),
    /* @__PURE__ */ p("div", { className: "pt-3 border-t border-surface-200 dark:border-surface-700 space-y-3", children: [
      /* @__PURE__ */ p("div", { children: [
        /* @__PURE__ */ l("label", { className: "label", children: e("blocks.contactForm.mode") }),
        /* @__PURE__ */ p(
          "select",
          {
            className: "input",
            value: a.mode ?? "endpoint",
            onChange: (o) => n({ mode: o.target.value }),
            children: [
              /* @__PURE__ */ l("option", { value: "endpoint", children: e("blocks.contactForm.modes.endpoint") }),
              /* @__PURE__ */ l("option", { value: "mailto", children: e("blocks.contactForm.modes.mailto") })
            ]
          }
        ),
        /* @__PURE__ */ l("p", { className: "text-xs text-surface-500 mt-1 dark:text-surface-400", children: e("blocks.contactForm.modeHelp") })
      ] }),
      a.mode !== "mailto" ? /* @__PURE__ */ p("div", { children: [
        /* @__PURE__ */ l("label", { className: "label", children: e("blocks.contactForm.endpointUrl") }),
        /* @__PURE__ */ l(
          "input",
          {
            type: "url",
            className: "input",
            placeholder: "https://formspree.io/f/abcdefg",
            value: a.endpointUrl ?? "",
            onChange: (o) => n({ endpointUrl: o.target.value })
          }
        ),
        /* @__PURE__ */ l("p", { className: "text-xs text-surface-500 mt-1 dark:text-surface-400", children: e("blocks.contactForm.endpointHelp") })
      ] }) : /* @__PURE__ */ p("div", { children: [
        /* @__PURE__ */ l("label", { className: "label", children: e("blocks.contactForm.mailtoAddress") }),
        /* @__PURE__ */ l(
          "input",
          {
            type: "email",
            className: "input",
            placeholder: "hello@example.com",
            value: a.mailtoAddress ?? "",
            onChange: (o) => n({ mailtoAddress: o.target.value })
          }
        )
      ] })
    ] }),
    /* @__PURE__ */ p("div", { className: "pt-3 border-t border-surface-200 dark:border-surface-700 space-y-2", children: [
      /* @__PURE__ */ l("p", { className: "text-xs font-semibold uppercase tracking-wide text-surface-500 dark:text-surface-400", children: e("blocks.contactForm.fieldLabels") }),
      /* @__PURE__ */ p("div", { className: "grid grid-cols-2 gap-2", children: [
        /* @__PURE__ */ p("div", { children: [
          /* @__PURE__ */ l("label", { className: "label text-xs", children: e("blocks.contactForm.labelName") }),
          /* @__PURE__ */ l(
            "input",
            {
              type: "text",
              className: "input",
              value: a.labelName ?? "",
              onChange: (o) => n({ labelName: o.target.value })
            }
          )
        ] }),
        /* @__PURE__ */ p("div", { children: [
          /* @__PURE__ */ l("label", { className: "label text-xs", children: e("blocks.contactForm.labelEmail") }),
          /* @__PURE__ */ l(
            "input",
            {
              type: "text",
              className: "input",
              value: a.labelEmail ?? "",
              onChange: (o) => n({ labelEmail: o.target.value })
            }
          )
        ] }),
        /* @__PURE__ */ p("div", { children: [
          /* @__PURE__ */ l("label", { className: "label text-xs", children: e("blocks.contactForm.labelCompany") }),
          /* @__PURE__ */ l(
            "input",
            {
              type: "text",
              className: "input",
              value: a.labelCompany ?? "",
              onChange: (o) => n({ labelCompany: o.target.value })
            }
          )
        ] }),
        /* @__PURE__ */ p("div", { children: [
          /* @__PURE__ */ l("label", { className: "label text-xs", children: e("blocks.contactForm.labelSubject") }),
          /* @__PURE__ */ l(
            "input",
            {
              type: "text",
              className: "input",
              value: a.labelSubject ?? "",
              onChange: (o) => n({ labelSubject: o.target.value })
            }
          )
        ] }),
        /* @__PURE__ */ p("div", { className: "col-span-2", children: [
          /* @__PURE__ */ l("label", { className: "label text-xs", children: e("blocks.contactForm.labelMessage") }),
          /* @__PURE__ */ l(
            "input",
            {
              type: "text",
              className: "input",
              value: a.labelMessage ?? "",
              onChange: (o) => n({ labelMessage: o.target.value })
            }
          )
        ] })
      ] }),
      /* @__PURE__ */ p("div", { children: [
        /* @__PURE__ */ l("label", { className: "label text-xs", children: e("blocks.contactForm.subjectOptions") }),
        /* @__PURE__ */ l(
          "textarea",
          {
            className: "input",
            rows: 4,
            value: a.subjectOptions ?? "",
            onChange: (o) => n({ subjectOptions: o.target.value })
          }
        ),
        /* @__PURE__ */ l("p", { className: "text-xs text-surface-500 mt-1 dark:text-surface-400", children: e("blocks.contactForm.subjectOptionsHelp") })
      ] }),
      /* @__PURE__ */ p("div", { children: [
        /* @__PURE__ */ l("label", { className: "label text-xs", children: e("blocks.contactForm.submitLabel") }),
        /* @__PURE__ */ l(
          "input",
          {
            type: "text",
            className: "input",
            value: a.submitLabel ?? "",
            onChange: (o) => n({ submitLabel: o.target.value })
          }
        )
      ] })
    ] }),
    /* @__PURE__ */ p("div", { className: "pt-3 border-t border-surface-200 dark:border-surface-700 space-y-2", children: [
      /* @__PURE__ */ l("p", { className: "text-xs font-semibold uppercase tracking-wide text-surface-500 dark:text-surface-400", children: e("blocks.contactForm.privacyHeading") }),
      /* @__PURE__ */ p("div", { children: [
        /* @__PURE__ */ l("label", { className: "label text-xs", children: e("blocks.contactForm.privacyText") }),
        /* @__PURE__ */ l(
          "textarea",
          {
            className: "input",
            rows: 2,
            value: a.privacyText ?? "",
            onChange: (o) => n({ privacyText: o.target.value })
          }
        ),
        /* @__PURE__ */ l("p", { className: "text-xs text-surface-500 mt-1 dark:text-surface-400", children: e("blocks.contactForm.privacyHelp") })
      ] }),
      /* @__PURE__ */ p("div", { children: [
        /* @__PURE__ */ l("label", { className: "label text-xs", children: e("blocks.contactForm.privacyHref") }),
        /* @__PURE__ */ l(
          "input",
          {
            type: "url",
            className: "input",
            placeholder: "/privacy.html",
            value: a.privacyHref ?? "",
            onChange: (o) => n({ privacyHref: o.target.value })
          }
        )
      ] })
    ] }),
    /* @__PURE__ */ p("div", { className: "pt-3 border-t border-surface-200 dark:border-surface-700 space-y-2", children: [
      /* @__PURE__ */ l("p", { className: "text-xs font-semibold uppercase tracking-wide text-surface-500 dark:text-surface-400", children: e("blocks.contactForm.feedback") }),
      /* @__PURE__ */ p("div", { children: [
        /* @__PURE__ */ l("label", { className: "label text-xs", children: e("blocks.contactForm.successMessage") }),
        /* @__PURE__ */ l(
          "input",
          {
            type: "text",
            className: "input",
            value: a.successMessage ?? "",
            onChange: (o) => n({ successMessage: o.target.value })
          }
        )
      ] }),
      /* @__PURE__ */ p("div", { children: [
        /* @__PURE__ */ l("label", { className: "label text-xs", children: e("blocks.contactForm.errorMessage") }),
        /* @__PURE__ */ l(
          "input",
          {
            type: "text",
            className: "input",
            value: a.errorMessage ?? "",
            onChange: (o) => n({ errorMessage: o.target.value })
          }
        )
      ] })
    ] })
  ] });
}
const Rc = re({
  subId: Tr,
  defaultAttrs: In,
  view: Ic
}), Pc = {
  id: `corporate/${Tr}`,
  nodeName: tt,
  titleKey: "blocks.contactForm.title",
  namespace: "theme-corporate",
  icon: xa,
  category: "layout",
  attrsSchema: Mc,
  extensions: [Rc],
  insert: (r) => {
    r.focus().insertContent({ type: tt }).run();
  },
  isActive: (r) => r.isActive(tt),
  inspector: (r) => /* @__PURE__ */ l(Hc, { editor: r.editor })
};
function Oc(r) {
  if (!r.title && !r.subtitle) return { html: "" };
  const e = r.eyebrow ? `<span class="text-label-caps font-semibold text-secondary uppercase tracking-wider">${k(r.eyebrow)}</span>` : "", t = r.title ? `<h1 class="text-h1 font-bold text-primary max-w-2xl leading-tight">${k(r.title)}</h1>` : "", a = r.subtitle ? `<p class="text-body-lg text-on-surface-variant max-w-xl">${k(r.subtitle)}</p>` : "", n = r.primaryCtaLabel && r.primaryCtaHref ? `<a href="${N(r.primaryCtaHref)}" class="text-button font-semibold bg-secondary text-on-secondary px-8 py-4 rounded-xl shadow-lg shadow-secondary/20 hover:translate-y-[-2px] transition-all inline-flex items-center gap-2">${k(r.primaryCtaLabel)}</a>` : "", o = r.secondaryCtaLabel && r.secondaryCtaHref ? `<a href="${N(r.secondaryCtaHref)}" class="text-button font-semibold border border-outline text-primary px-8 py-4 rounded-xl hover:bg-surface-container-low transition-all">${k(r.secondaryCtaLabel)}</a>` : "", i = n || o ? `<div class="flex flex-wrap gap-4">${n}${o}</div>` : "", s = r.imageUrl ? `<div class="absolute top-0 right-0 w-full md:w-1/2 h-full -z-0 opacity-10 pointer-events-none"><img class="w-full h-full object-cover" src="${N(r.imageUrl)}" alt="${N(r.imageAlt ?? "")}" loading="lazy" /></div>` : "";
  return {
    html: `<section class="relative px-gutter py-section-padding overflow-hidden">
<div class="max-w-container-max mx-auto flex flex-col gap-stack-lg relative z-10">
<div class="flex flex-col gap-stack-sm">${e}${t}${a}</div>
${i}
</div>
${s}
</section>`
  };
}
const Bc = {
  icon: "auto_awesome",
  title: "",
  description: "",
  ctaLabel: "",
  ctaHref: "",
  accent: !1
};
function zc(r) {
  const e = { ...Bc, ...r }, t = !!e.accent, a = t ? "bg-primary p-8 rounded-xl shadow-xl hover:-translate-y-1 transition-all flex flex-col h-full text-on-primary" : "bg-surface-container-lowest p-8 rounded-xl shadow-sm border border-outline-variant/30 hover:shadow-xl hover:-translate-y-1 transition-all flex flex-col h-full", n = t ? "w-14 h-14 rounded-lg bg-secondary flex items-center justify-center mb-6" : "w-14 h-14 rounded-lg bg-secondary/10 flex items-center justify-center mb-6", o = t ? "text-on-secondary text-h3" : "text-secondary text-h3", i = t ? "text-h3 font-semibold mb-4" : "text-h3 font-semibold text-primary mb-4", s = t ? "text-on-primary-container mb-8 flex-grow" : "text-on-surface-variant mb-8 flex-grow", c = t ? "text-secondary-fixed font-semibold text-button flex items-center gap-2 group" : "text-secondary font-semibold text-button flex items-center gap-2 group", u = e.icon ? `<div class="${n}"><span class="material-symbols-outlined ${o}">${k(e.icon)}</span></div>` : "", d = e.ctaLabel && e.ctaHref ? `<a class="${c}" href="${N(e.ctaHref)}">${k(e.ctaLabel)}<span class="material-symbols-outlined group-hover:translate-x-1 transition-transform">trending_flat</span></a>` : "";
  return `<div class="${a}">${u}<h3 class="${i}">${k(e.title)}</h3><p class="${s}">${k(e.description)}</p>${d}</div>`;
}
function $c(r) {
  const e = (r.services ?? []).filter((s) => s && (s.title || s.description));
  if (e.length === 0 && !r.title) return { html: "" };
  const t = r.eyebrow ? `<span class="text-label-caps font-semibold text-secondary uppercase tracking-wider mb-2 block">${k(r.eyebrow)}</span>` : "", a = r.title ? `<h2 class="text-h2 font-bold text-primary mb-4">${k(r.title)}</h2>` : "", n = r.subtitle ? `<p class="text-on-surface-variant text-body-md max-w-xl">${k(r.subtitle)}</p>` : "", o = t || a || n ? `<div class="mb-stack-lg max-w-xl">${t}${a}${n}</div>` : "", i = e.map(zc).join("");
  return {
    html: `<section class="py-section-padding px-gutter max-w-container-max mx-auto">
${o}
<div class="grid grid-cols-1 md:grid-cols-3 gap-stack-lg">${i}</div>
</section>`
  };
}
function Uc(r) {
  if (!r.title && !r.subtitle) return { html: "" };
  const e = r.variant === "indigo" ? "indigo" : "navy", t = r.title ? `<h2 class="text-h2 font-bold mb-stack-md">${k(r.title)}</h2>` : "", a = r.subtitle ? `<p class="text-body-lg mb-stack-lg ${e === "navy" ? "text-on-primary-container" : "opacity-90"} max-w-2xl mx-auto">${k(r.subtitle)}</p>` : "", n = "bg-secondary text-on-secondary px-10 py-5 rounded-xl text-button font-semibold hover:scale-105 transition-transform", o = "bg-white/10 text-on-primary px-10 py-5 rounded-xl text-button font-semibold hover:bg-white/20 transition-colors", i = "bg-white text-secondary px-10 py-4 rounded-xl text-button font-semibold hover:bg-secondary-fixed transition-colors", s = "border border-white/30 text-white px-10 py-4 rounded-xl text-button font-semibold hover:bg-white/10 transition-colors", c = e === "navy" ? n : i, u = e === "navy" ? o : s, d = r.primaryCtaLabel && r.primaryCtaHref ? `<a href="${N(r.primaryCtaHref)}" class="${c}">${k(r.primaryCtaLabel)}</a>` : "", h = r.secondaryCtaLabel && r.secondaryCtaHref ? `<a href="${N(r.secondaryCtaHref)}" class="${u}">${k(r.secondaryCtaLabel)}</a>` : "", m = d || h ? `<div class="flex flex-col sm:flex-row gap-4 justify-center">${d}${h}</div>` : "";
  return e === "indigo" ? {
    html: `<section class="px-gutter py-section-padding bg-surface-bright">
<div class="max-w-4xl mx-auto bg-secondary rounded-2xl p-12 md:p-16 text-center text-on-secondary shadow-2xl relative overflow-hidden">
<div class="relative z-10">${t}${a}${m}</div>
<div class="absolute top-0 right-0 p-4 opacity-10"><span class="material-symbols-outlined text-[120px]">bolt</span></div>
</div>
</section>`
  } : {
    html: `<section class="py-section-padding px-gutter">
<div class="max-w-container-max mx-auto bg-primary rounded-3xl p-12 md:p-20 relative overflow-hidden text-center text-on-primary">
<div class="absolute top-0 right-0 w-64 h-64 bg-secondary/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
<div class="absolute bottom-0 left-0 w-96 h-96 bg-tertiary-fixed-dim/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2"></div>
<div class="relative z-10 max-w-2xl mx-auto">${t}${a}${m}</div>
</div>
</section>`
  };
}
function Fc(r) {
  const e = (r.logos ?? []).filter((n) => n && n.imageUrl);
  if (e.length === 0) return { html: "" };
  const t = r.label ? `<p class="text-label-caps font-semibold text-on-surface-variant uppercase tracking-wider w-full text-center mb-stack-md">${k(r.label)}</p>` : "", a = e.map((n) => {
    const o = `<img src="${N(n.imageUrl)}" alt="${N(n.imageAlt ?? "")}" class="h-8 md:h-10 w-auto object-contain grayscale opacity-60 hover:opacity-100 hover:grayscale-0 transition-all" loading="lazy" />`;
    return n.href ? `<a href="${N(n.href)}" class="inline-flex items-center justify-center" target="_blank" rel="noopener noreferrer">${o}</a>` : o;
  }).join("");
  return {
    html: `<section class="px-gutter py-section-padding">
<div class="max-w-container-max mx-auto p-stack-lg flex flex-wrap items-center justify-center gap-stack-lg">${t}${a}</div>
</section>`
  };
}
function jc(r) {
  const e = (r.stats ?? []).filter((c) => c && (c.value || c.label));
  if (e.length === 0 && !r.title) return { html: "" };
  const t = r.eyebrow ? `<span class="text-label-caps font-semibold text-secondary uppercase tracking-wider mb-2 block">${k(r.eyebrow)}</span>` : "", a = r.title ? `<h2 class="text-h2 font-bold text-primary mb-4">${k(r.title)}</h2>` : "", n = r.subtitle ? `<p class="text-on-surface-variant text-body-md max-w-xl mx-auto">${k(r.subtitle)}</p>` : "", o = t || a || n ? `<div class="text-center max-w-2xl mx-auto mb-stack-lg">${t}${a}${n}</div>` : "", i = e.length >= 4 ? "grid-cols-2 md:grid-cols-4" : e.length === 3 ? "grid-cols-1 md:grid-cols-3" : e.length === 2 ? "grid-cols-2" : "grid-cols-1", s = e.map(
    (c) => `<div class="text-center"><span class="text-h1 font-bold text-secondary block">${k(c.value)}</span><span class="text-label-caps font-semibold text-on-surface-variant uppercase tracking-wider mt-2 block">${k(c.label)}</span></div>`
  ).join("");
  return {
    html: `<section class="py-section-padding px-gutter">
<div class="max-w-container-max mx-auto">
${o}
<div class="grid ${i} gap-stack-lg bg-surface-container-lowest border border-outline-variant/30 rounded-2xl p-stack-lg shadow-sm">${s}</div>
</div>
</section>`
  };
}
const Dc = {
  icon: "auto_awesome",
  eyebrow: "",
  title: "",
  description: "",
  ctaLabel: "",
  ctaHref: "",
  imageUrl: "",
  imageAlt: ""
};
function Vc(r, e, t) {
  const a = { ...Dc, ...r };
  if (!a.title && !a.description) return "";
  const n = t ? e % 2 === 1 : !1, o = a.imagePosition === "left" || a.imagePosition !== "right" && n, i = a.icon ? `<div class="w-14 h-14 rounded-lg bg-secondary/10 flex items-center justify-center mb-stack-md"><span class="material-symbols-outlined text-secondary text-h3">${k(a.icon)}</span></div>` : "", s = a.eyebrow ? `<span class="text-label-caps font-semibold text-secondary uppercase tracking-wider mb-2 block">${k(a.eyebrow)}</span>` : "", c = `<h3 class="text-h2 font-bold text-primary mb-stack-md">${k(a.title)}</h3>`, u = `<p class="text-body-lg text-on-surface-variant mb-stack-md">${k(a.description)}</p>`, d = a.ctaLabel && a.ctaHref ? `<a href="${N(a.ctaHref)}" class="inline-flex items-center gap-2 text-button font-semibold text-secondary hover:gap-3 transition-all">${k(a.ctaLabel)}<span class="material-symbols-outlined text-[18px]">trending_flat</span></a>` : "", h = `<div class="flex flex-col justify-center">${i}${s}${c}${u}${d}</div>`, m = a.imageUrl ? `<div class="rounded-2xl overflow-hidden shadow-xl aspect-video bg-surface-container-low"><img src="${N(a.imageUrl)}" alt="${N(a.imageAlt ?? a.title)}" class="w-full h-full object-cover" loading="lazy" /></div>` : "";
  return `<div class="grid grid-cols-1 md:grid-cols-2 gap-stack-lg ${o ? "md:[&>:first-child]:order-2" : ""}">${h}${m}</div>`;
}
function qc(r) {
  const e = (r.features ?? []).filter((c) => c && (c.title || c.description));
  if (e.length === 0 && !r.title) return { html: "" };
  const t = r.eyebrow ? `<span class="text-label-caps font-semibold text-secondary uppercase tracking-wider mb-2 block">${k(r.eyebrow)}</span>` : "", a = r.title ? `<h2 class="text-h2 font-bold text-primary mb-4">${k(r.title)}</h2>` : "", n = r.subtitle ? `<p class="text-on-surface-variant text-body-md max-w-xl mx-auto">${k(r.subtitle)}</p>` : "", o = t || a || n ? `<div class="text-center max-w-2xl mx-auto mb-section-padding">${t}${a}${n}</div>` : "", i = r.alternate !== !1, s = e.map((c, u) => Vc(c, u, i)).join("");
  return {
    html: `<section class="py-section-padding px-gutter">
<div class="max-w-container-max mx-auto">
${o}
<div class="space-y-section-padding">${s}</div>
</div>
</section>`
  };
}
function Kt(r, e, t) {
  return `<div class="flex items-start gap-4">
<div class="bg-secondary-fixed p-3 rounded-lg shrink-0">
<span class="material-symbols-outlined text-secondary">${k(r)}</span>
</div>
<div><p class="font-bold text-primary">${k(e)}</p><p class="text-on-surface-variant">${t}</p></div>
</div>`;
}
function Yt(r) {
  return r ? k(r).replace(/\n/g, "<br/>") : "";
}
function _c(r) {
  const e = !!r.addressLines, t = !!r.phoneLines, a = !!r.emailLines, n = (r.socials ?? []).filter((c) => c && (c.icon || c.href));
  if (!e && !t && !a && n.length === 0)
    return { html: "" };
  const o = r.heading ? `<h3 class="text-h3 font-semibold text-primary mb-stack-md">${k(r.heading)}</h3>` : "", i = [];
  e && i.push(Kt("location_on", "Address", Yt(r.addressLines))), t && i.push(Kt("call", "Phone", Yt(r.phoneLines))), a && i.push(Kt("mail", "Email", Yt(r.emailLines)));
  const s = n.length > 0 ? `<div class="mt-stack-lg pt-stack-lg border-t border-outline-variant/20">
${r.socialsLabel ? `<p class="text-label-caps font-semibold text-on-surface-variant uppercase tracking-wider mb-stack-md">${k(r.socialsLabel)}</p>` : ""}
<div class="flex gap-4">
${n.map(
    (c) => `<a class="w-10 h-10 rounded-full bg-surface-container flex items-center justify-center hover:bg-secondary hover:text-on-secondary transition-colors" href="${N(c.href ?? "#")}" target="_blank" rel="noopener noreferrer" aria-label="${N(c.ariaLabel ?? "")}"><span class="material-symbols-outlined text-[1.25rem]">${k(c.icon ?? "share")}</span></a>`
  ).join("")}
</div>
</div>` : "";
  return {
    html: `<div class="bg-surface-container-lowest p-8 rounded-xl shadow-sm border border-outline-variant/20">
${o}
<div class="space-y-stack-lg">${i.join("")}</div>
${s}
</div>`
  };
}
function ze(r, e, t, a = !0, n) {
  const o = 'class="w-full h-14 px-4 pt-2 border border-outline rounded-lg focus:ring-2 focus:ring-secondary focus:border-secondary outline-none transition-all bg-surface-container-lowest"';
  if (t === "textarea")
    return `<div class="floating-label-group">
<textarea id="${N(r)}" name="${N(r)}" rows="5" placeholder=" "${a ? " required" : ""} class="w-full px-4 pt-6 border border-outline rounded-lg focus:ring-2 focus:ring-secondary focus:border-secondary outline-none transition-all resize-none bg-surface-container-lowest"></textarea>
<label for="${N(r)}">${k(e)}</label>
</div>`;
  if (t === "select") {
    const i = (n ?? []).map((s) => `<option value="${N(s)}">${k(s)}</option>`).join("");
    return `<div class="floating-label-group">
<select id="${N(r)}" name="${N(r)}"${a ? " required" : ""} class="w-full h-14 px-4 pt-2 pr-10 border border-outline rounded-lg focus:ring-2 focus:ring-secondary focus:border-secondary outline-none transition-all appearance-none bg-surface-container-lowest">
<option value="" disabled selected hidden></option>
${i}
</select>
<label for="${N(r)}">${k(e)}</label>
<div class="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
<span class="material-symbols-outlined text-outline">expand_more</span>
</div>
</div>`;
  }
  return `<div class="floating-label-group">
<input type="${N(t)}" id="${N(r)}" name="${N(r)}" placeholder=" "${a ? " required" : ""} ${o} />
<label for="${N(r)}">${k(e)}</label>
</div>`;
}
function Gc(r, e) {
  if (!r) return "";
  const t = k(r);
  return `<div class="flex items-start gap-3 py-2">
<input class="w-5 h-5 mt-0.5 text-secondary border-outline rounded focus:ring-secondary" id="cms-form-consent" name="consent" type="checkbox" required />
<label class="text-body-md text-on-surface-variant" for="cms-form-consent">${e ? t.replace(
    /\[link\](.*?)\[\/link\]/g,
    `<a class="text-secondary font-medium underline" href="${N(e)}" target="_blank" rel="noopener noreferrer">$1</a>`
  ) : t.replace(/\[link\](.*?)\[\/link\]/g, "$1")}</label>
</div>`;
}
function Jc(r) {
  const e = r.heading ?? "", t = r.subtitle ?? "", a = r.mode === "mailto" ? "mailto" : "endpoint", n = r.labelName ?? "Full name", o = r.labelEmail ?? "Email", i = r.labelCompany ?? "Company", s = r.labelSubject ?? "Subject", c = r.labelMessage ?? "Message", u = r.submitLabel ?? "Send inquiry", d = r.successMessage || "Thanks — we'll get back to you within 24 business hours.", h = r.errorMessage || "Something went wrong. Please try again or email us directly.", m = (r.subjectOptions ?? "").split(`
`).map((P) => P.trim()).filter(Boolean), f = m.length > 0, b = e ? `<h3 class="text-h3 font-semibold text-primary mb-2">${k(e)}</h3>` : "", g = t ? `<p class="text-body-md text-on-surface-variant mb-stack-lg">${k(t)}</p>` : "", y = `<div class="grid grid-cols-1 md:grid-cols-2 gap-stack-md">${ze("name", n, "text")}${ze("email", o, "email")}</div>`, w = [ze("company", i, "text", !1)];
  f && w.push(ze("subject", s, "select", !0, m));
  const C = `<div class="grid grid-cols-1 md:grid-cols-2 gap-stack-md">${w.join("")}</div>`, A = ze("message", c, "textarea"), B = Gc(r.privacyText ?? "", r.privacyHref), R = `<button type="submit" class="w-full md:w-auto px-10 py-4 bg-secondary text-on-secondary rounded-lg text-button font-semibold shadow-lg shadow-secondary/20 hover:bg-secondary/90 hover:shadow-xl transition-all active:scale-[0.98] inline-flex items-center gap-2">${k(u)}<span class="material-symbols-outlined">send</span></button>`, M = `<div class="cms-form-status mt-stack-md text-body-md" data-cms-form-success hidden>${k(d)}</div>
<div class="cms-form-status mt-stack-md text-body-md text-error" data-cms-form-error hidden>${k(h)}</div>`;
  return {
    html: `<div class="bg-surface-container-lowest p-8 lg:p-12 rounded-xl shadow-xl border border-outline-variant/10">
${b}${g}
<form data-cms-form="${N(a)}" data-cms-form-endpoint="${N(r.endpointUrl ?? "")}" data-cms-form-mailto="${N(r.mailtoAddress ?? "")}" class="space-y-stack-md" action="${a === "mailto" && r.mailtoAddress ? `mailto:${N(r.mailtoAddress)}` : "#"}" method="post" novalidate>
${y}
${C}
${A}
${B}
${R}
${M}
</form>
</div>`
  };
}
const Ot = /<div\s+([^>]*data-cms-block="corporate\/([\w-]+)"[^>]*)>\s*<\/div>/g;
function Wc(r, e) {
  const t = r.match(
    new RegExp(`${e}=(?:"([^"]*)"|'([^']*)'|([^\\s>]+))`)
  );
  return t ? t[1] ?? t[2] ?? t[3] ?? "" : "";
}
function Kc(r) {
  const e = [];
  Ot.lastIndex = 0;
  let t;
  for (; (t = Ot.exec(r)) !== null; )
    e.push({
      match: t[0],
      blockId: t[2],
      attrsRaw: Wc(t[1], "data-attrs"),
      index: t.index
    });
  return e;
}
function Yc(r) {
  switch (r.blockId) {
    case "hero-overlay": {
      const e = Y(r.attrsRaw, {});
      return ua(e).html;
    }
    case "hero-split": {
      const e = Y(r.attrsRaw, {});
      return Oc(e).html;
    }
    case "services-grid": {
      const e = Y(r.attrsRaw, {});
      return $c(e).html;
    }
    case "cta-banner": {
      const e = Y(r.attrsRaw, {});
      return Uc(e).html;
    }
    case "testimonials": {
      const e = Y(r.attrsRaw, {});
      return pa(e).html;
    }
    case "trust-bar": {
      const e = Y(r.attrsRaw, {});
      return Fc(e).html;
    }
    case "stats-grid": {
      const e = Y(r.attrsRaw, {});
      return jc(e).html;
    }
    case "feature-stack": {
      const e = Y(r.attrsRaw, {});
      return qc(e).html;
    }
    case "contact-info": {
      const e = Y(r.attrsRaw, {});
      return _c(e).html;
    }
    case "contact-form": {
      const e = Y(r.attrsRaw, {});
      return Jc(e).html;
    }
    default:
      return "";
  }
}
function Zc(r, e) {
  if (!r.includes('data-cms-block="corporate/')) return r;
  const t = Kc(r);
  if (t.length === 0) return r;
  const a = /* @__PURE__ */ new Map();
  for (const s of t)
    a.set(s.index, Yc(s));
  let n = "", o = 0;
  Ot.lastIndex = 0;
  let i;
  for (; (i = Ot.exec(r)) !== null; )
    n += r.slice(o, i.index), n += a.get(i.index) ?? "", o = i.index + i[0].length;
  return n += r.slice(o), n;
}
const ia = {
  id: "corporate",
  name: "Corporate",
  version: "1.0.2",
  description: "Modern corporate / SaaS showcase theme — Tailwind-based, navy + indigo Material 3 palette, Inter typography. Built for vitrine sites, lead-gen, and content marketing.",
  // Convention name used by build-themes.mjs only as a fallback when
  // `theme.compiled.css` is missing. The corporate theme uses
  // Tailwind (compiled by build-theme-tailwind.mjs), so this entry is
  // never reached in practice.
  scssEntry: "theme.css",
  cssText: Hr,
  jsText: xo,
  jsTextPosts: ko,
  i18n: { en: Mo, fr: Io, de: Ho, es: Ro, nl: Po, pt: Oo, ko: Bo },
  settings: {
    navLabelKey: "title",
    defaultConfig: po,
    component: Vo,
    schema: Yo
  },
  // Bakes the user's Style overrides (color palette, font) into the
  // CSS uploaded by `Sync theme assets`. Without this hook, syncing
  // would push the bundled CSS verbatim and erase the customizations
  // until the next Save & apply from Theme Settings.
  compileCss: (r) => fa(Hr, r.style),
  // Image catalog used by the upload pipeline. Mirrors the magazine
  // theme so a site switching between corporate and magazine doesn't
  // have to re-process its media library.
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
    base: Yn,
    home: ho,
    single: bo,
    category: yo,
    author: vo,
    notFound: wo
  },
  // Editor blocks contributed by the corporate theme. Each ships a
  // Tiptap node + inspector + render.ts producer. The post.html.body
  // filter below glues them together at publish time — see
  // blocks/transforms.ts for the marker → HTML pipeline.
  // Phase 4 (testimonials, trust-bar, stats-grid, feature-stack) and
  // phase 5 (contact-info, contact-form) will append to this list.
  blocks: [
    Dl,
    Jl,
    Ql,
    ac,
    lc,
    hc,
    yc,
    Sc,
    Lc,
    Pc
  ],
  register(r) {
    r.addFilter(
      "post.html.body",
      (e, ...t) => Zc(e, t[0])
    );
  }
};
export {
  ia as manifest
};
