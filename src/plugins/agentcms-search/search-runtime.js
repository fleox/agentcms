/*
 * agentcms-search runtime — public-site code.
 *
 * Auto-attaches to every `[data-cms-search]` element at DOMContentLoaded.
 * On click: lazy-fetches `/search-index.json` (cached), opens a modal
 * with an input + results list. Multi-token substring search across the
 * fields the indexer chose to include (title always, optionally
 * excerpt / category / tags). Title hits are weighted higher.
 *
 * Runtime UI strings (placeholder, "no results", aria labels) and
 * thresholds (minQueryLength, maxResults) live in the index file's
 * `meta` block — the indexer bakes them in at build time so the
 * runtime doesn't need an i18n library.
 *
 * Default styles are injected on first open via a single <style> tag.
 * Themes can override anything by targeting `.cms-search-*` classes
 * with higher specificity (or wrapping rules in `:where()`).
 */

(function () {
  if (typeof document === "undefined") return;
  // Load once: a page that ends up with two <script src="/search.js">
  // tags (theme + plugin, hand-edited custom code…) must not attach two
  // click handlers — each would open its own modal on top of the other.
  if (window.__agentcmsSearchRuntime) return;
  window.__agentcmsSearchRuntime = true;

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
    if (/^([a-z][a-z0-9+.-]*:|\/\/|#)/i.test(url)) return url;
    if (url.indexOf(BASE) === 0 || url === BASE.slice(0, -1)) return url;
    return BASE + (url.charAt(0) === "/" ? url.slice(1) : url);
  }

  var INDEX_URL = withBase("/search-index.json");
  var STYLES = [
    ".cms-search-modal{position:fixed;inset:0;z-index:9999;display:flex;align-items:flex-start;justify-content:center;padding:8vh 16px 16px;opacity:0;transition:opacity .15s ease}",
    ".cms-search-modal.open{opacity:1}",
    ".cms-search-backdrop{position:absolute;inset:0;background:rgba(15,23,42,.55);backdrop-filter:blur(4px)}",
    ".cms-search-panel{position:relative;width:100%;max-width:640px;background:#fff;color:#0f172a;border-radius:8px;box-shadow:0 25px 50px -12px rgba(0,0,0,.25);display:flex;flex-direction:column;max-height:80vh;overflow:hidden;font-family:inherit}",
    ".cms-search-header{display:flex;gap:8px;padding:12px 14px;border-bottom:1px solid #e2e8f0;align-items:center}",
    ".cms-search-header input{flex:1;min-width:0;border:0;outline:0;font-size:18px;background:transparent;color:inherit;padding:8px 4px;-webkit-appearance:none;appearance:none}",
    // type="search" gets a native clear "×" in WebKit/Blink (and ::-ms-clear
    // in old Edge) — next to our close button that showed two "×" side
    // by side. Hide the native one; Escape / the close button remain.
    ".cms-search-header input::-webkit-search-cancel-button,.cms-search-header input::-webkit-search-decoration{-webkit-appearance:none;appearance:none;display:none}",
    ".cms-search-header input::-ms-clear{display:none;width:0;height:0}",
    ".cms-search-header button{border:0;background:transparent;color:#64748b;font-size:24px;line-height:1;width:32px;height:32px;border-radius:4px;cursor:pointer}",
    ".cms-search-header button:hover{background:#f1f5f9;color:#0f172a}",
    ".cms-search-results{flex:1;overflow-y:auto;padding:4px 0}",
    ".cms-search-result{display:block;padding:12px 14px;border-bottom:1px solid #f1f5f9;text-decoration:none;color:inherit}",
    ".cms-search-result:hover,.cms-search-result.is-active{background:#f8fafc}",
    ".cms-search-result-title{display:block;font-weight:600;font-size:15px;line-height:1.4;margin-bottom:2px}",
    ".cms-search-result-excerpt{display:block;font-size:13px;line-height:1.5;color:#475569}",
    ".cms-search-result-category{display:inline-block;margin-top:6px;font-size:11px;letter-spacing:.05em;text-transform:uppercase;color:var(--cms-search-accent,#64748b)}",
    ".cms-search-result mark{background:#fef08a;color:inherit;padding:0 1px;border-radius:2px}",
    ".cms-search-empty{padding:24px;text-align:center;color:#64748b;font-size:14px}",
  ].join("");

  // Accent colour of the active theme, applied to the result's category
  // label through --cms-search-accent. A theme can set that property
  // itself; otherwise we borrow its --color-secondary (the colour every
  // bundled theme uses for category eyebrows), then --color-primary.
  // Tailwind themes store colours as bare RGB channels ("67 97 124") for
  // their `rgb(var(--x) / <alpha>)` utilities, so those are wrapped in
  // rgb(); hex / rgb() / named values pass through. "" = keep fallback.
  var ACCENT_VARS = ["--cms-search-accent", "--color-secondary", "--color-primary"];
  var RGB_CHANNELS = /^\d+(\.\d+)?%?(\s*,\s*|\s+)\d+(\.\d+)?%?(\s*,\s*|\s+)\d+(\.\d+)?%?(\s*\/\s*[\d.]+%?)?$/;
  function themeAccent() {
    try {
      var cs = window.getComputedStyle(document.documentElement);
      for (var i = 0; i < ACCENT_VARS.length; i++) {
        var v = (cs.getPropertyValue(ACCENT_VARS[i]) || "").trim();
        if (!v) continue;
        return RGB_CHANNELS.test(v) ? "rgb(" + v + ")" : v;
      }
    } catch (e) {
      // getComputedStyle unavailable — keep the fallback colour.
    }
    return "";
  }

  var stylesInjected = false;
  function injectStyles() {
    if (stylesInjected) return;
    stylesInjected = true;
    var s = document.createElement("style");
    s.setAttribute("data-cms-search-styles", "");
    s.appendChild(document.createTextNode(STYLES));
    document.head.appendChild(s);
  }

  // The fetched index is cached after the first open so reopening is
  // instantaneous. A null `data` field means we already attempted and
  // failed (network / parse error); we render an empty modal in that
  // case rather than hammering the server on every reopen.
  var indexCache = null;
  async function loadIndex() {
    if (indexCache) return indexCache;
    try {
      var res = await fetch(INDEX_URL, { credentials: "same-origin" });
      if (!res.ok) throw new Error("HTTP " + res.status);
      var data = await res.json();
      indexCache = data && Array.isArray(data.items) ? data : { meta: {}, items: [] };
    } catch (e) {
      console.warn("[agentcms-search] failed to load index:", e);
      indexCache = { meta: {}, items: [] };
    }
    return indexCache;
  }

  function tokenize(q) {
    return q.toLowerCase().trim().split(/\s+/).filter(Boolean);
  }

  function buildHaystack(item) {
    var parts = [item.title];
    if (item.excerpt) parts.push(item.excerpt);
    if (item.category) parts.push(item.category);
    if (item.tags && item.tags.length) parts.push(item.tags.join(" "));
    return parts.join(" ").toLowerCase();
  }

  function score(item, tokens) {
    var titleLower = item.title.toLowerCase();
    var s = 0;
    for (var i = 0; i < tokens.length; i++) {
      var t = tokens[i];
      if (titleLower.indexOf(t) !== -1) s += 10;
      if (titleLower.indexOf(t) === 0) s += 5;
    }
    return s;
  }

  function search(items, tokens, max) {
    var matched = [];
    for (var i = 0; i < items.length; i++) {
      var hay = buildHaystack(items[i]);
      var ok = true;
      for (var j = 0; j < tokens.length; j++) {
        if (hay.indexOf(tokens[j]) === -1) { ok = false; break; }
      }
      if (ok) matched.push(items[i]);
    }
    matched.sort(function (a, b) { return score(b, tokens) - score(a, tokens); });
    return matched.slice(0, max);
  }

  function escapeHtml(s) {
    return String(s).replace(/[&<>"]/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c];
    });
  }

  function escapeRegex(s) {
    return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  }

  function highlight(text, tokens) {
    var out = escapeHtml(text);
    for (var i = 0; i < tokens.length; i++) {
      var re = new RegExp("(" + escapeRegex(tokens[i]) + ")", "gi");
      out = out.replace(re, "<mark>$1</mark>");
    }
    return out;
  }

  function renderResults(container, items, tokens) {
    if (!items.length) {
      container.innerHTML = "";
      return 0;
    }
    var html = "";
    for (var i = 0; i < items.length; i++) {
      var it = items[i];
      var titleHtml = highlight(it.title, tokens);
      var excerptHtml = it.excerpt ? '<span class="cms-search-result-excerpt">' + highlight(it.excerpt, tokens) + "</span>" : "";
      var categoryHtml = it.category ? '<span class="cms-search-result-category">' + escapeHtml(it.category) + "</span>" : "";
      html += '<a class="cms-search-result" href="' + escapeHtml(withBase("/" + it.url)) + '" data-cms-search-result>'
        + '<span class="cms-search-result-title">' + titleHtml + "</span>"
        + excerptHtml
        + categoryHtml
        + "</a>";
    }
    container.innerHTML = html;
    return items.length;
  }

  var modal = null;
  // True while open() awaits the index: a second click in that window
  // would otherwise build a second modal.
  var opening = false;
  function close() {
    if (!modal) return;
    var m = modal;
    modal = null;
    m.classList.remove("open");
    m.addEventListener("transitionend", function () {
      if (m.parentNode) m.parentNode.removeChild(m);
    }, { once: true });
    document.removeEventListener("keydown", onKeydown);
  }

  function onKeydown(e) {
    if (!modal) return;
    if (e.key === "Escape") {
      e.preventDefault();
      close();
    }
  }

  async function open() {
    if (modal || opening) return;
    opening = true;
    injectStyles();
    var data;
    try {
      data = await loadIndex();
    } finally {
      opening = false;
    }
    if (modal) return;
    var meta = data.meta || {};
    var minQuery = typeof meta.minQueryLength === "number" ? meta.minQueryLength : 2;
    var maxResults = typeof meta.maxResults === "number" ? meta.maxResults : 20;
    var placeholder = meta.placeholder || "Search…";
    var closeLabel = meta.close || "Close";
    var noResults = meta.noResults || "No results";
    var dialogLabel = meta.dialogLabel || "Search";

    var m = document.createElement("div");
    m.className = "cms-search-modal";
    m.setAttribute("role", "dialog");
    m.setAttribute("aria-modal", "true");
    m.setAttribute("aria-label", dialogLabel);
    var accent = themeAccent();
    if (accent) m.style.setProperty("--cms-search-accent", accent);

    m.innerHTML = ''
      + '<div class="cms-search-backdrop" data-cms-search-close></div>'
      + '<div class="cms-search-panel">'
      +   '<div class="cms-search-header">'
      +     '<input type="search" autocomplete="off" placeholder="' + escapeHtml(placeholder) + '" aria-label="' + escapeHtml(placeholder) + '" />'
      +     '<button type="button" data-cms-search-close aria-label="' + escapeHtml(closeLabel) + '">×</button>'
      +   '</div>'
      +   '<div class="cms-search-results" role="listbox"></div>'
      +   '<div class="cms-search-empty" hidden>' + escapeHtml(noResults) + '</div>'
      + '</div>';

    document.body.appendChild(m);
    modal = m;

    var closers = m.querySelectorAll("[data-cms-search-close]");
    for (var i = 0; i < closers.length; i++) closers[i].addEventListener("click", close);

    var input = m.querySelector("input");
    var results = m.querySelector(".cms-search-results");
    var empty = m.querySelector(".cms-search-empty");

    input.addEventListener("input", function () {
      var q = input.value;
      if (q.length < minQuery) {
        results.innerHTML = "";
        empty.hidden = true;
        return;
      }
      var tokens = tokenize(q);
      if (!tokens.length) {
        results.innerHTML = "";
        empty.hidden = true;
        return;
      }
      var hits = search(data.items, tokens, maxResults);
      var n = renderResults(results, hits, tokens);
      empty.hidden = n > 0;
    });

    document.addEventListener("keydown", onKeydown);

    // Trigger CSS transition on the next frame so opacity:0 → 1 plays.
    requestAnimationFrame(function () {
      m.classList.add("open");
      input.focus();
    });
  }

  function attachTriggers() {
    var triggers = document.querySelectorAll("[data-cms-search]");
    for (var i = 0; i < triggers.length; i++) {
      triggers[i].addEventListener("click", function (e) {
        e.preventDefault();
        open();
      });
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", attachTriggers);
  } else {
    attachTriggers();
  }
})();
