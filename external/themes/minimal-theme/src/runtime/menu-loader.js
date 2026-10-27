// Minimal Theme — runtime menu loader, uploaded as
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
    if (/^([a-z][a-z0-9+.-]*:|\/\/|#)/i.test(url)) return url;
    if (url.indexOf(base) === 0) return url;
    return base + (url.charAt(0) === "/" ? url.slice(1) : url);
  }

  var lang = (document.documentElement.getAttribute("lang") || "").toLowerCase().split("-")[0];
  var here = location.pathname.replace(/\/$/, "/index.html");

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
