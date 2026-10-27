import { jsx as e, jsxs as i } from "react/jsx-runtime";
import { canonicalUrl as f } from "@agent-cms/runtime";
const g = `/* Minimal theme stylesheet. Hand-written so the example stays
   buildable without Tailwind or SCSS. The bundle embeds it as
   manifest.cssText (?raw import); "Sync theme assets" uploads that
   string to /theme-assets/minimal-theme.css. */

:root {
  --mt-bg: #ffffff;
  --mt-fg: #1a1a1a;
  --mt-muted: #6b7280;
  --mt-accent: #2563eb;
  --mt-max-w: 720px;
  font-family: system-ui, -apple-system, "Segoe UI", Roboto, sans-serif;
}

body {
  margin: 0;
  background: var(--mt-bg);
  color: var(--mt-fg);
  line-height: 1.6;
}

main {
  max-width: var(--mt-max-w);
  margin: 0 auto;
  padding: 2rem 1rem;
}

a {
  color: var(--mt-accent);
}

h1,
h2,
h3 {
  margin-top: 1.5em;
  margin-bottom: 0.5em;
  line-height: 1.25;
}

article header h1 {
  margin-top: 0;
  font-size: 2rem;
}

.mt-meta {
  color: var(--mt-muted);
  font-size: 0.85rem;
  margin-bottom: 1.5rem;
}

.mt-list {
  list-style: none;
  padding: 0;
}

.mt-list li {
  border-top: 1px solid #e5e7eb;
  padding: 1rem 0;
}

.mt-list li:first-child {
  border-top: 0;
}

.mt-header,
footer {
  max-width: var(--mt-max-w);
  margin: 0 auto;
  padding: 1rem;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem 1.5rem;
}

[data-cms-brand] a {
  font-weight: 700;
  color: var(--mt-fg);
  text-decoration: none;
}

[data-cms-menu] ul {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-wrap: wrap;
  gap: 0.25rem 1rem;
}

[data-cms-menu] ul ul {
  display: none;
}

[data-cms-menu] a[aria-current="page"] {
  font-weight: 600;
}

footer {
  border-top: 1px solid #e5e7eb;
  color: var(--mt-muted);
  font-size: 0.85rem;
}
`, b = `// Minimal Theme — runtime menu loader, uploaded as
// /theme-assets/minimal-theme-menu.js by "Sync theme assets" (the
// manifest's jsText) and loaded by BaseLayout with <script defer>.
//
// The published HTML already contains the menus as they were at
// publish time; this script refreshes them from /data/menu.json so a
// menu edit in the admin shows up without republishing every page.
// Sub-folder sites (e.g. GitHub project Pages) are handled through the
// <meta name="x-cms-base"> tag the publisher injects.
(function () {
  var meta = document.querySelector('meta[name="x-cms-base"]');
  var base = (meta && meta.getAttribute("content")) || "/";
  if (base.charAt(0) !== "/") base = "/" + base;
  if (base.charAt(base.length - 1) !== "/") base += "/";

  function withBase(url) {
    if (!url || base === "/") return url;
    if (/^([a-z][a-z0-9+.-]*:|\\/\\/|#)/i.test(url)) return url;
    if (url.indexOf(base) === 0) return url;
    return base + (url.charAt(0) === "/" ? url.slice(1) : url);
  }

  var lang = (document.documentElement.getAttribute("lang") || "").toLowerCase().split("-")[0];
  var here = location.pathname.replace(/\\/$/, "/index.html");

  function fill(ul, items) {
    ul.innerHTML = "";
    items.forEach(function (item) {
      var li = document.createElement("li");
      var a = document.createElement("a");
      var href = withBase(item.href);
      a.href = href;
      a.textContent = (item.labels && item.labels[lang]) || item.label;
      if (href === here) a.setAttribute("aria-current", "page");
      li.appendChild(a);
      if (item.children && item.children.length) {
        var sub = document.createElement("ul");
        fill(sub, item.children);
        li.appendChild(sub);
      }
      ul.appendChild(li);
    });
  }

  fetch(withBase("/data/menu.json"), { cache: "no-cache" })
    .then(function (r) { return r.ok ? r.json() : null; })
    .then(function (menu) {
      if (!menu) return;
      ["header", "footer"].forEach(function (slot) {
        var host = document.querySelector('[data-cms-menu="' + slot + '"] > ul');
        if (host && Array.isArray(menu[slot])) fill(host, menu[slot]);
      });
    })
    .catch(function () { /* keep the menus rendered at publish time */ });
})();
`, y = '# Minimal Theme — AgentCMS external theme example\n\nA deliberately small theme that shows the contract every AgentCMS theme follows. It is compiled into one ES module (`bundle.js`) and installed from the admin (**Themes → Install theme**) — no admin rebuild.\n\n## What it shows\n\n- The six required templates: `base`, `home`, `single`, `category`, `author`, `notFound`, typed with the shared `@agent-cms/runtime` types.\n- `BaseLayout` essentials: a `<title>` that falls back to the site title (the latest-posts home passes an empty `pageTitle`), `<html lang>` from `currentLocale`, a canonical URL via `canonicalUrl()`, the stylesheet from `site.themeCssPath`, home links through `site.homePath`, and the two plugin sentinels (`<meta name="x-cms-head-extra" />`, `<script type="application/x-cms-body-end" />`).\n- A home that renders either the static page chosen in Settings (`staticPage`) or the latest posts.\n- Menus rendered at publish time from `site.resolvedMenus`, refreshed in the browser from `/data/menu.json` by a tiny runtime loader (`src/runtime/menu-loader.js`, shipped as `jsText` → `/theme-assets/minimal-theme-menu.js`). The loader honours `<meta name="x-cms-base">`, so sub-folder sites work.\n- A hand-written stylesheet (`src/theme.css`) imported with `?raw` as `cssText`.\n\n## Build and test\n\n```bash\nnpm install\nnpm run build     # type-check + dist/bundle.js + minimal-theme.zip\n```\n\nFrom the AgentCMS repo root you can validate it and render a demo site:\n\n```bash\nnode dist/agent/agentcms.mjs ext check external/themes/minimal-theme\nnode dist/agent/agentcms.mjs ext preview external/themes/minimal-theme --screenshots\n```\n\n## Install\n\n1. Admin → **Themes** → **Install theme** → pick `minimal-theme.zip`.\n2. After the reload, **Activate** it. Activation syncs theme assets (CSS + menu loader) and regenerates every page.\n\nRe-uploading a ZIP with a higher `version` upgrades in place.\n\n## Package layout\n\n```\nminimal-theme.zip\n├── manifest.json   ← id, name, version, apiVersion, entry\n├── bundle.js       ← ESM, default-exports the ThemeManifest (CSS embedded as cssText)\n└── README.md\n```\n\nSee `docs/creating-a-theme.md` in the AgentCMS repo for the full guide.\n';
function l({ items: n }) {
  return /* @__PURE__ */ e("ul", { children: n.map((t) => /* @__PURE__ */ i("li", { children: [
    /* @__PURE__ */ e("a", { href: t.href, children: t.label }),
    t.children && t.children.length > 0 && /* @__PURE__ */ e(l, { items: t.children })
  ] }, t.id)) });
}
function x({
  site: n,
  pageTitle: t,
  pageDescription: a,
  ogImage: h,
  currentPath: d,
  currentLocale: c,
  children: u
}) {
  const s = n.settings.title || "Site", o = t ? `${t} — ${s}` : s, r = f(n.settings.baseUrl, d), p = n.homePath ?? "/index.html";
  return /* @__PURE__ */ i("html", { lang: c || n.settings.language || "en", children: [
    /* @__PURE__ */ i("head", { children: [
      /* @__PURE__ */ e("meta", { charSet: "utf-8" }),
      /* @__PURE__ */ e("meta", { name: "viewport", content: "width=device-width, initial-scale=1" }),
      /* @__PURE__ */ e("title", { children: o }),
      a && /* @__PURE__ */ e("meta", { name: "description", content: a }),
      r && /* @__PURE__ */ e("link", { rel: "canonical", href: r }),
      /* @__PURE__ */ e("meta", { property: "og:title", content: o }),
      r && /* @__PURE__ */ e("meta", { property: "og:url", content: r }),
      h && /* @__PURE__ */ e("meta", { property: "og:image", content: h }),
      /* @__PURE__ */ e("link", { rel: "stylesheet", href: `/${n.themeCssPath}` }),
      /* @__PURE__ */ e("script", { defer: !0, src: "/theme-assets/minimal-theme-menu.js" }),
      /* @__PURE__ */ e("meta", { name: "x-cms-head-extra" })
    ] }),
    /* @__PURE__ */ i("body", { children: [
      /* @__PURE__ */ i("header", { className: "mt-header", children: [
        /* @__PURE__ */ e("div", { "data-cms-brand": !0, children: /* @__PURE__ */ e("a", { href: p, children: s }) }),
        /* @__PURE__ */ e("nav", { "data-cms-menu": "header", children: /* @__PURE__ */ e(l, { items: n.resolvedMenus.header }) })
      ] }),
      /* @__PURE__ */ e("main", { children: u }),
      /* @__PURE__ */ e("footer", { children: /* @__PURE__ */ e("nav", { "data-cms-menu": "footer", children: /* @__PURE__ */ e(l, { items: n.resolvedMenus.footer }) }) }),
      /* @__PURE__ */ e("script", { type: "application/x-cms-body-end" })
    ] })
  ] });
}
function m({ posts: n, excerpts: t = !0 }) {
  return n.length === 0 ? /* @__PURE__ */ e("p", { className: "mt-meta", children: "Nothing published yet." }) : /* @__PURE__ */ e("ul", { className: "mt-list", children: n.map((a) => /* @__PURE__ */ i("li", { children: [
    /* @__PURE__ */ e("h2", { children: /* @__PURE__ */ e("a", { href: `/${a.url}`, children: a.title }) }),
    a.dateLabel && /* @__PURE__ */ e("p", { className: "mt-meta", children: a.dateLabel }),
    t && a.excerpt && /* @__PURE__ */ e("p", { children: a.excerpt })
  ] }, a.id)) });
}
function w({ site: n, posts: t, staticPage: a }) {
  return a ? /* @__PURE__ */ i("article", { children: [
    /* @__PURE__ */ e("h1", { children: a.post.title }),
    /* @__PURE__ */ e("div", { dangerouslySetInnerHTML: { __html: a.bodyHtml } })
  ] }) : /* @__PURE__ */ i("article", { children: [
    /* @__PURE__ */ e("h1", { children: n.settings.title || "Latest posts" }),
    n.settings.description && /* @__PURE__ */ e("p", { className: "mt-meta", children: n.settings.description }),
    /* @__PURE__ */ e(m, { posts: t })
  ] });
}
function v({ post: n, bodyHtml: t, author: a }) {
  return /* @__PURE__ */ i("article", { children: [
    /* @__PURE__ */ i("header", { children: [
      /* @__PURE__ */ e("h1", { children: n.title }),
      n.type === "post" && a && /* @__PURE__ */ i("p", { className: "mt-meta", children: [
        "By ",
        a.displayName
      ] })
    ] }),
    /* @__PURE__ */ e("div", { dangerouslySetInnerHTML: { __html: t } })
  ] });
}
function T({ term: n, posts: t }) {
  return /* @__PURE__ */ i("article", { children: [
    /* @__PURE__ */ i("header", { children: [
      /* @__PURE__ */ e("h1", { children: n.name }),
      n.description && /* @__PURE__ */ e("p", { className: "mt-meta", children: n.description })
    ] }),
    /* @__PURE__ */ e(m, { posts: t })
  ] });
}
function S({ author: n, posts: t }) {
  return /* @__PURE__ */ i("article", { children: [
    /* @__PURE__ */ i("header", { children: [
      /* @__PURE__ */ e("h1", { children: n.displayName }),
      n.bio && /* @__PURE__ */ e("p", { children: n.bio })
    ] }),
    /* @__PURE__ */ e("h2", { children: "Posts" }),
    /* @__PURE__ */ e(m, { posts: t, excerpts: !1 })
  ] });
}
function j({ site: n }) {
  return /* @__PURE__ */ i("article", { children: [
    /* @__PURE__ */ e("h1", { children: "404 — Not found" }),
    /* @__PURE__ */ e("p", { children: "The page you're looking for doesn't exist." }),
    /* @__PURE__ */ e("p", { children: /* @__PURE__ */ e("a", { href: n.homePath ?? "/index.html", children: "Back to home" }) })
  ] });
}
const L = {
  id: "minimal-theme",
  name: "Minimal Theme",
  version: "1.1.0",
  description: "Minimal external theme — single column, system fonts.",
  readme: y,
  scssEntry: "theme.css",
  cssText: g,
  // Uploaded as theme-assets/minimal-theme-menu.js; BaseLayout loads it.
  jsText: b,
  templates: {
    base: x,
    home: w,
    single: v,
    category: T,
    author: S,
    notFound: j
  }
};
export {
  L as default
};
