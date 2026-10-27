import { sha256Hex as j, uploadFile as N, markdownToPlainText as W, canonicalPath as Z, buildPostUrl as $, pickPublicLocale as V, i18n as C, useCmsData as X, formatDateTime as Y, toast as S, fetchAllPosts as z, updatePluginConfig as U } from "@agent-cms/runtime";
import { jsxs as l, jsx as s } from "react/jsx-runtime";
import { forwardRef as O, createElement as E, useState as A, useEffect as ee } from "react";
import { useTranslation as ne } from "react-i18next";
const Q = {
  title: "Search",
  description: "Builds a public search-index.json over your posts (and optionally pages) and ships a runtime that opens a search modal anywhere a [data-cms-search] trigger appears in your theme.",
  regenerationTarget: {
    label: "Search index",
    description: "Force-rebuild /search-index.json + /search.js runtime"
  },
  tabs: {
    index: "Index",
    behavior: "Behavior"
  },
  index: {
    title: "What to index",
    indexExcerpt: "Excerpts",
    indexExcerptHelp: "When the post has no excerpt, we fall back to the first 200 characters of the body.",
    indexCategory: "Category names",
    indexTags: "Tag names",
    includePages: "Include static pages",
    excludedTerms: "Excluded categories",
    excludedTermsHelp: "Posts whose primary category is selected here are skipped at indexing time.",
    none: "None"
  },
  behavior: {
    title: "Runtime behavior",
    minQueryLength: "Minimum query length",
    minQueryLengthHelp: "Below this number of characters, the modal shows nothing.",
    maxResults: "Maximum results",
    maxResultsHelp: "Hard cap on the number of results displayed at once."
  },
  status: {
    notIndexed: "Not indexed yet",
    lastIndexed: "Last indexed: {{date}}",
    items: "{{count}} item",
    items_plural: "{{count}} items"
  },
  actions: {
    save: "Save",
    saving: "Saving…",
    saved: "Saved.",
    forceRegenerate: "Force regenerate",
    regenerating: "Regenerating…",
    regenerated: "Search index regenerated.",
    failed: "Save failed."
  },
  baseUrlMissing: "Site URL is empty in Settings → General. Search files cannot be uploaded until that's set.",
  // Strings baked into search-index.json's `meta` block. The runtime JS
  // reads them verbatim — no i18n library on the public side.
  runtime: {
    placeholder: "Search…",
    close: "Close",
    noResults: "No results",
    dialogLabel: "Search"
  }
}, te = {
  title: "Recherche",
  description: "Génère un fichier search-index.json public à partir de vos articles (et optionnellement pages) et installe un runtime qui ouvre une modale de recherche partout où un déclencheur [data-cms-search] est présent dans votre thème.",
  regenerationTarget: {
    label: "Index de recherche",
    description: "Reconstruit /search-index.json + le runtime /search.js"
  },
  tabs: {
    index: "Index",
    behavior: "Comportement"
  },
  index: {
    title: "Ce qui est indexé",
    indexExcerpt: "Extraits",
    indexExcerptHelp: "Si l'article n'a pas d'extrait, on retombe sur les 200 premiers caractères du corps.",
    indexCategory: "Noms des catégories",
    indexTags: "Noms des tags",
    includePages: "Inclure les pages statiques",
    excludedTerms: "Catégories exclues",
    excludedTermsHelp: "Les articles dont la catégorie principale est cochée ici sont ignorés à l'indexation.",
    none: "Aucune"
  },
  behavior: {
    title: "Comportement runtime",
    minQueryLength: "Longueur minimale de requête",
    minQueryLengthHelp: "En dessous de ce nombre de caractères, la modale n'affiche rien.",
    maxResults: "Nombre maximum de résultats",
    maxResultsHelp: "Plafond du nombre de résultats affichés simultanément."
  },
  status: {
    notIndexed: "Pas encore indexé",
    lastIndexed: "Dernière indexation : {{date}}",
    items: "{{count}} élément",
    items_plural: "{{count}} éléments"
  },
  actions: {
    save: "Enregistrer",
    saving: "Enregistrement…",
    saved: "Enregistré.",
    forceRegenerate: "Régénérer manuellement",
    regenerating: "Régénération…",
    regenerated: "Index de recherche régénéré.",
    failed: "Échec de l'enregistrement."
  },
  baseUrlMissing: "L'URL du site est vide dans Réglages → Général. Les fichiers de recherche ne peuvent pas être uploadés tant qu'elle n'est pas renseignée.",
  runtime: {
    placeholder: "Rechercher…",
    close: "Fermer",
    noResults: "Aucun résultat",
    dialogLabel: "Recherche"
  }
}, ae = {
  title: "Suche",
  description: "Erstellt eine öffentliche search-index.json über Ihre Beiträge (und optional Seiten) und liefert eine Laufzeit, die ein Suchfenster überall dort öffnet, wo ein [data-cms-search]-Trigger im Theme vorhanden ist.",
  regenerationTarget: {
    label: "Suchindex",
    description: "/search-index.json + /search.js erzwungen neu erzeugen"
  },
  tabs: {
    index: "Index",
    behavior: "Verhalten"
  },
  index: {
    title: "Was indexiert wird",
    indexExcerpt: "Auszüge",
    indexExcerptHelp: "Wenn der Beitrag keinen Auszug hat, verwenden wir die ersten 200 Zeichen des Inhalts.",
    indexCategory: "Kategorienamen",
    indexTags: "Tag-Namen",
    includePages: "Statische Seiten einbeziehen",
    excludedTerms: "Ausgeschlossene Kategorien",
    excludedTermsHelp: "Beiträge, deren Hauptkategorie hier ausgewählt ist, werden bei der Indexierung übersprungen.",
    none: "Keine"
  },
  behavior: {
    title: "Laufzeitverhalten",
    minQueryLength: "Mindestlänge der Anfrage",
    minQueryLengthHelp: "Unterhalb dieser Zeichenanzahl zeigt das Suchfenster nichts an.",
    maxResults: "Maximale Ergebnisse",
    maxResultsHelp: "Hartes Limit für die Anzahl der gleichzeitig angezeigten Ergebnisse."
  },
  status: {
    notIndexed: "Noch nicht indexiert",
    lastIndexed: "Zuletzt indexiert: {{date}}",
    items: "{{count}} Element",
    items_plural: "{{count}} Elemente"
  },
  actions: {
    save: "Speichern",
    saving: "Speichern…",
    saved: "Gespeichert.",
    forceRegenerate: "Manuell neu generieren",
    regenerating: "Neu generieren…",
    regenerated: "Suchindex neu generiert.",
    failed: "Speichern fehlgeschlagen."
  },
  baseUrlMissing: "Die Website-URL ist in Einstellungen → Allgemein leer. Die Suchdateien können nicht hochgeladen werden, bis das eingetragen ist.",
  runtime: {
    placeholder: "Suchen…",
    close: "Schließen",
    noResults: "Keine Ergebnisse",
    dialogLabel: "Suche"
  }
}, se = {
  title: "Búsqueda",
  description: "Genera un archivo público search-index.json sobre tus artículos (y opcionalmente páginas) y entrega un runtime que abre una modal de búsqueda en cualquier disparador [data-cms-search] presente en tu tema.",
  regenerationTarget: {
    label: "Índice de búsqueda",
    description: "Reconstruye /search-index.json + el runtime /search.js"
  },
  tabs: {
    index: "Índice",
    behavior: "Comportamiento"
  },
  index: {
    title: "Qué se indexa",
    indexExcerpt: "Extractos",
    indexExcerptHelp: "Si el artículo no tiene extracto, usamos los primeros 200 caracteres del cuerpo.",
    indexCategory: "Nombres de categorías",
    indexTags: "Nombres de etiquetas",
    includePages: "Incluir páginas estáticas",
    excludedTerms: "Categorías excluidas",
    excludedTermsHelp: "Los artículos cuya categoría principal esté seleccionada aquí se omiten en la indexación.",
    none: "Ninguna"
  },
  behavior: {
    title: "Comportamiento del runtime",
    minQueryLength: "Longitud mínima de consulta",
    minQueryLengthHelp: "Por debajo de esta cantidad de caracteres, la modal no muestra nada.",
    maxResults: "Resultados máximos",
    maxResultsHelp: "Límite estricto del número de resultados mostrados a la vez."
  },
  status: {
    notIndexed: "Aún no indexado",
    lastIndexed: "Última indexación: {{date}}",
    items: "{{count}} elemento",
    items_plural: "{{count}} elementos"
  },
  actions: {
    save: "Guardar",
    saving: "Guardando…",
    saved: "Guardado.",
    forceRegenerate: "Regenerar manualmente",
    regenerating: "Regenerando…",
    regenerated: "Índice de búsqueda regenerado.",
    failed: "Error al guardar."
  },
  baseUrlMissing: "La URL del sitio está vacía en Ajustes → General. Los archivos de búsqueda no se pueden subir hasta que se rellene.",
  runtime: {
    placeholder: "Buscar…",
    close: "Cerrar",
    noResults: "Sin resultados",
    dialogLabel: "Búsqueda"
  }
}, re = {
  title: "Zoeken",
  description: "Bouwt een openbare search-index.json over je berichten (en optioneel pagina's) en levert een runtime die een zoekvenster opent overal waar een [data-cms-search]-trigger in je thema staat.",
  regenerationTarget: {
    label: "Zoekindex",
    description: "Bouwt /search-index.json + de /search.js runtime opnieuw"
  },
  tabs: {
    index: "Index",
    behavior: "Gedrag"
  },
  index: {
    title: "Wat geïndexeerd wordt",
    indexExcerpt: "Samenvattingen",
    indexExcerptHelp: "Als het bericht geen samenvatting heeft, vallen we terug op de eerste 200 tekens van de tekst.",
    indexCategory: "Categorienamen",
    indexTags: "Tag-namen",
    includePages: "Statische pagina's meenemen",
    excludedTerms: "Uitgesloten categorieën",
    excludedTermsHelp: "Berichten waarvan de hoofdcategorie hier is geselecteerd, worden overgeslagen bij het indexeren.",
    none: "Geen"
  },
  behavior: {
    title: "Runtime-gedrag",
    minQueryLength: "Minimale lengte zoekterm",
    minQueryLengthHelp: "Onder dit aantal tekens toont het zoekvenster niets.",
    maxResults: "Maximaal aantal resultaten",
    maxResultsHelp: "Harde limiet op het aantal gelijktijdig getoonde resultaten."
  },
  status: {
    notIndexed: "Nog niet geïndexeerd",
    lastIndexed: "Laatst geïndexeerd: {{date}}",
    items: "{{count}} item",
    items_plural: "{{count}} items"
  },
  actions: {
    save: "Opslaan",
    saving: "Opslaan…",
    saved: "Opgeslagen.",
    forceRegenerate: "Handmatig regenereren",
    regenerating: "Regenereren…",
    regenerated: "Zoekindex geregenereerd.",
    failed: "Opslaan mislukt."
  },
  baseUrlMissing: "De site-URL is leeg in Instellingen → Algemeen. Zoekbestanden kunnen pas worden geüpload als die ingevuld is.",
  runtime: {
    placeholder: "Zoeken…",
    close: "Sluiten",
    noResults: "Geen resultaten",
    dialogLabel: "Zoeken"
  }
}, ie = {
  title: "Pesquisa",
  description: "Gera um arquivo público search-index.json sobre seus posts (e opcionalmente páginas) e entrega um runtime que abre um modal de pesquisa em qualquer gatilho [data-cms-search] do seu tema.",
  regenerationTarget: {
    label: "Índice de pesquisa",
    description: "Reconstrói /search-index.json + o runtime /search.js"
  },
  tabs: {
    index: "Índice",
    behavior: "Comportamento"
  },
  index: {
    title: "O que é indexado",
    indexExcerpt: "Resumos",
    indexExcerptHelp: "Se o post não tem resumo, usamos os primeiros 200 caracteres do conteúdo.",
    indexCategory: "Nomes das categorias",
    indexTags: "Nomes das tags",
    includePages: "Incluir páginas estáticas",
    excludedTerms: "Categorias excluídas",
    excludedTermsHelp: "Posts cuja categoria principal esteja selecionada aqui são ignorados na indexação.",
    none: "Nenhuma"
  },
  behavior: {
    title: "Comportamento de runtime",
    minQueryLength: "Comprimento mínimo da consulta",
    minQueryLengthHelp: "Abaixo deste número de caracteres, o modal não mostra nada.",
    maxResults: "Resultados máximos",
    maxResultsHelp: "Limite rígido do número de resultados exibidos por vez."
  },
  status: {
    notIndexed: "Ainda não indexado",
    lastIndexed: "Última indexação: {{date}}",
    items: "{{count}} item",
    items_plural: "{{count}} itens"
  },
  actions: {
    save: "Salvar",
    saving: "Salvando…",
    saved: "Salvo.",
    forceRegenerate: "Regenerar manualmente",
    regenerating: "Regenerando…",
    regenerated: "Índice de pesquisa regenerado.",
    failed: "Falha ao salvar."
  },
  baseUrlMissing: "A URL do site está vazia em Configurações → Geral. Os arquivos de pesquisa não podem ser enviados até que ela esteja preenchida.",
  runtime: {
    placeholder: "Pesquisar…",
    close: "Fechar",
    noResults: "Sem resultados",
    dialogLabel: "Pesquisa"
  }
}, oe = {
  title: "검색",
  description: "게시물(선택적으로 페이지 포함)에 대한 공개 search-index.json을 빌드하고 테마의 [data-cms-search] 트리거가 있는 곳에서 검색 모달을 여는 런타임을 제공합니다.",
  regenerationTarget: {
    label: "검색 인덱스",
    description: "/search-index.json + /search.js 런타임 강제 재빌드"
  },
  tabs: {
    index: "인덱스",
    behavior: "동작"
  },
  index: {
    title: "인덱싱 대상",
    indexExcerpt: "요약",
    indexExcerptHelp: "게시물에 요약이 없으면 본문의 첫 200자를 사용합니다.",
    indexCategory: "카테고리 이름",
    indexTags: "태그 이름",
    includePages: "정적 페이지 포함",
    excludedTerms: "제외할 카테고리",
    excludedTermsHelp: "기본 카테고리가 여기에서 선택된 게시물은 인덱싱 시 건너뜁니다.",
    none: "없음"
  },
  behavior: {
    title: "런타임 동작",
    minQueryLength: "최소 쿼리 길이",
    minQueryLengthHelp: "이 글자 수 미만이면 모달이 아무것도 표시하지 않습니다.",
    maxResults: "최대 결과 수",
    maxResultsHelp: "한 번에 표시되는 결과 수의 절대 상한."
  },
  status: {
    notIndexed: "아직 인덱싱되지 않음",
    lastIndexed: "마지막 인덱싱: {{date}}",
    items: "{{count}}개 항목",
    items_plural: "{{count}}개 항목"
  },
  actions: {
    save: "저장",
    saving: "저장 중…",
    saved: "저장됨.",
    forceRegenerate: "수동으로 재생성",
    regenerating: "재생성 중…",
    regenerated: "검색 인덱스가 재생성되었습니다.",
    failed: "저장 실패."
  },
  baseUrlMissing: "설정 → 일반에서 사이트 URL이 비어 있습니다. URL이 설정될 때까지 검색 파일을 업로드할 수 없습니다.",
  runtime: {
    placeholder: "검색…",
    close: "닫기",
    noResults: "결과 없음",
    dialogLabel: "검색"
  }
}, T = {
  indexExcerpt: !0,
  indexCategory: !0,
  indexTags: !1,
  includePages: !1,
  excludedTermIds: [],
  minQueryLength: 2,
  maxResults: 20
}, R = "agentcms-search", _ = "search-index.json", q = "search.js", H = `/*
 * agentcms-search runtime — public-site code.
 *
 * Auto-attaches to every \`[data-cms-search]\` element at DOMContentLoaded.
 * On click: lazy-fetches \`/search-index.json\` (cached), opens a modal
 * with an input + results list. Multi-token substring search across the
 * fields the indexer chose to include (title always, optionally
 * excerpt / category / tags). Title hits are weighted higher.
 *
 * Runtime UI strings (placeholder, "no results", aria labels) and
 * thresholds (minQueryLength, maxResults) live in the index file's
 * \`meta\` block — the indexer bakes them in at build time so the
 * runtime doesn't need an i18n library.
 *
 * Default styles are injected on first open via a single <style> tag.
 * Themes can override anything by targeting \`.cms-search-*\` classes
 * with higher specificity (or wrapping rules in \`:where()\`).
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
    if (/^([a-z][a-z0-9+.-]*:|\\/\\/|#)/i.test(url)) return url;
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
  // their \`rgb(var(--x) / <alpha>)\` utilities, so those are wrapped in
  // rgb(); hex / rgb() / named values pass through. "" = keep fallback.
  var ACCENT_VARS = ["--cms-search-accent", "--color-secondary", "--color-primary"];
  var RGB_CHANNELS = /^\\d+(\\.\\d+)?%?(\\s*,\\s*|\\s+)\\d+(\\.\\d+)?%?(\\s*,\\s*|\\s+)\\d+(\\.\\d+)?%?(\\s*\\/\\s*[\\d.]+%?)?$/;
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
  // instantaneous. A null \`data\` field means we already attempted and
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
    return q.toLowerCase().trim().split(/\\s+/).filter(Boolean);
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
    return s.replace(/[.*+?^\${}()|[\\]\\\\]/g, "\\\\$&");
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
`;
function ce(t) {
  const n = V(t), e = R, r = Q.runtime;
  return {
    placeholder: C.getResource(n, e, "runtime.placeholder") ?? r.placeholder,
    close: C.getResource(n, e, "runtime.close") ?? r.close,
    noResults: C.getResource(n, e, "runtime.noResults") ?? r.noResults,
    dialogLabel: C.getResource(n, e, "runtime.dialogLabel") ?? r.dialogLabel
  };
}
function le(t, n, e) {
  return t.type === "page" && e.homeMode === "static-page" && e.homePageId && e.homePageId === t.id ? Z("index.html") : $({ post: t, primaryTerm: (n == null ? void 0 : n.type) === "category" ? n : void 0 });
}
function G(t) {
  const { posts: n, pages: e, terms: r, settings: d, config: u } = t, k = new Set(u.excludedTermIds), b = [];
  for (const i of n)
    i.status === "online" && (i.primaryTermId && k.has(i.primaryTermId) || b.push(i));
  if (u.includePages)
    for (const i of e)
      i.status === "online" && b.push(i);
  b.sort((i, h) => {
    var g, w, p, a, o, L, x, P;
    const f = ((w = (g = h.publishedAt) == null ? void 0 : g.toMillis) == null ? void 0 : w.call(g)) ?? ((a = (p = h.updatedAt) == null ? void 0 : p.toMillis) == null ? void 0 : a.call(p)) ?? 0, m = ((L = (o = i.publishedAt) == null ? void 0 : o.toMillis) == null ? void 0 : L.call(o)) ?? ((P = (x = i.updatedAt) == null ? void 0 : x.toMillis) == null ? void 0 : P.call(x)) ?? 0;
    return f - m;
  });
  const c = /* @__PURE__ */ new Map();
  for (const i of r) c.set(i.id, i);
  const v = b.map((i) => {
    var g, w, p, a;
    const h = i.primaryTermId ? c.get(i.primaryTermId) : void 0, f = {
      id: i.id,
      title: i.title,
      url: le(i, h, d)
    };
    if (u.indexExcerpt) {
      const o = i.excerpt && i.excerpt.trim() || W(i.contentMarkdown ?? "", 200);
      o && (f.excerpt = o);
    }
    if (u.indexCategory && (h == null ? void 0 : h.type) === "category" && (f.category = h.name), u.indexTags && i.termIds && i.termIds.length) {
      const o = [];
      for (const L of i.termIds) {
        const x = c.get(L);
        x && x.type === "tag" && o.push(x.name);
      }
      o.length && (f.tags = o);
    }
    const m = ((w = (g = i.publishedAt) == null ? void 0 : g.toMillis) == null ? void 0 : w.call(g)) ?? ((a = (p = i.updatedAt) == null ? void 0 : p.toMillis) == null ? void 0 : a.call(p));
    return typeof m == "number" && (f.publishedAt = m), f;
  });
  return { meta: {
    minQueryLength: u.minQueryLength,
    maxResults: u.maxResults,
    ...ce(d.language),
    generatedAt: Date.now()
  }, items: v };
}
function D(t) {
  const n = {
    meta: { ...t.meta, generatedAt: 0 },
    items: t.items
  };
  return j(JSON.stringify(n));
}
async function de(t) {
  const n = G({
    posts: t.posts,
    pages: t.pages,
    terms: t.terms,
    settings: t.settings,
    config: t.config
  }), e = await D(n), r = { ...T, ...t.config };
  return r.lastIndexHash === e ? { nextConfig: r, uploaded: !1 } : (await N({
    path: _,
    content: JSON.stringify(n),
    encoding: "utf-8"
  }), {
    nextConfig: { ...r, lastIndexHash: e, lastIndexedAt: Date.now() },
    uploaded: !0
  });
}
async function ue(t) {
  const n = await j(H), e = { ...T, ...t };
  return e.lastRuntimeHash === n ? { nextConfig: e, uploaded: !1 } : (await N({
    path: q,
    content: H,
    encoding: "utf-8"
  }), { nextConfig: { ...e, lastRuntimeHash: n }, uploaded: !0 });
}
async function F(t) {
  const n = G({
    posts: t.posts,
    pages: t.pages,
    terms: t.terms,
    settings: t.settings,
    config: t.config
  }), e = await D(n), r = await j(H);
  return await N({
    path: _,
    content: JSON.stringify(n),
    encoding: "utf-8"
  }), await N({
    path: q,
    content: H,
    encoding: "utf-8"
  }), {
    nextConfig: {
      ...T,
      ...t.config,
      lastIndexHash: e,
      lastRuntimeHash: r,
      lastIndexedAt: Date.now()
    },
    uploaded: !0
  };
}
/**
 * @license lucide-react v0.460.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const he = (t) => t.replace(/([a-z0-9])([A-Z])/g, "$1-$2").toLowerCase(), K = (...t) => t.filter((n, e, r) => !!n && n.trim() !== "" && r.indexOf(n) === e).join(" ").trim();
/**
 * @license lucide-react v0.460.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
var me = {
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
const ge = O(
  ({
    color: t = "currentColor",
    size: n = 24,
    strokeWidth: e = 2,
    absoluteStrokeWidth: r,
    className: d = "",
    children: u,
    iconNode: k,
    ...b
  }, c) => E(
    "svg",
    {
      ref: c,
      ...me,
      width: n,
      height: n,
      stroke: t,
      strokeWidth: r ? Number(e) * 24 / Number(n) : e,
      className: K("lucide", d),
      ...b
    },
    [
      ...k.map(([v, y]) => E(v, y)),
      ...Array.isArray(u) ? u : [u]
    ]
  )
);
/**
 * @license lucide-react v0.460.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const M = (t, n) => {
  const e = O(
    ({ className: r, ...d }, u) => E(ge, {
      ref: u,
      iconNode: n,
      className: K(`lucide-${he(t)}`, r),
      ...d
    })
  );
  return e.displayName = `${t}`, e;
};
/**
 * @license lucide-react v0.460.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const B = M("LoaderCircle", [
  ["path", { d: "M21 12a9 9 0 1 1-6.219-8.56", key: "13zald" }]
]);
/**
 * @license lucide-react v0.460.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const pe = M("RefreshCw", [
  ["path", { d: "M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8", key: "v9h5vc" }],
  ["path", { d: "M21 3v5h-5", key: "1q7to0" }],
  ["path", { d: "M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16", key: "3uifl3" }],
  ["path", { d: "M8 16H3v5", key: "1cv678" }]
]);
/**
 * @license lucide-react v0.460.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const xe = M("Save", [
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
function fe({
  config: t,
  save: n
}) {
  const { t: e, i18n: r } = ne("agentcms-search"), { settings: d, terms: u, categories: k } = X(), b = r.resolvedLanguage ?? r.language, [c, v] = A(t);
  ee(() => v(t), [t]);
  const [y, i] = A(!1), [h, f] = A(!1);
  function m(a) {
    v((o) => ({ ...o, ...a }));
  }
  function g(a) {
    const o = new Set(c.excludedTermIds);
    o.has(a) ? o.delete(a) : o.add(a), m({ excludedTermIds: [...o] });
  }
  async function w() {
    i(!0);
    try {
      await n(c), S.success(e("actions.saved"));
    } catch (a) {
      console.error("[agentcms-search] save failed:", a), S.error(e("actions.failed"));
    } finally {
      i(!1);
    }
  }
  async function p() {
    if (!d.baseUrl) {
      S.error(e("baseUrlMissing"));
      return;
    }
    f(!0);
    try {
      const [a, o] = await Promise.all([
        z({ type: "post" }),
        z({ type: "page" })
      ]), x = await F({
        posts: a,
        pages: o,
        terms: u,
        settings: d,
        config: c
      });
      await n(x.nextConfig), v(x.nextConfig), S.success(e("actions.regenerated"));
    } catch (a) {
      console.error("[agentcms-search] regeneration failed:", a), S.error(e("actions.failed"));
    } finally {
      f(!1);
    }
  }
  return /* @__PURE__ */ l("div", { className: "space-y-6", children: [
    /* @__PURE__ */ s("p", { className: "text-sm text-surface-600 dark:text-surface-300", children: e("description") }),
    /* @__PURE__ */ l("section", { className: "card p-4 space-y-4", children: [
      /* @__PURE__ */ s("h2", { className: "font-semibold", children: e("index.title") }),
      /* @__PURE__ */ l("label", { className: "flex items-start gap-2", children: [
        /* @__PURE__ */ s(
          "input",
          {
            type: "checkbox",
            className: "mt-1",
            checked: c.indexExcerpt,
            onChange: (a) => m({ indexExcerpt: a.target.checked })
          }
        ),
        /* @__PURE__ */ l("span", { children: [
          /* @__PURE__ */ s("span", { className: "text-sm font-medium block", children: e("index.indexExcerpt") }),
          /* @__PURE__ */ s("span", { className: "text-xs text-surface-500 dark:text-surface-400", children: e("index.indexExcerptHelp") })
        ] })
      ] }),
      /* @__PURE__ */ l("label", { className: "flex items-center gap-2", children: [
        /* @__PURE__ */ s(
          "input",
          {
            type: "checkbox",
            checked: c.indexCategory,
            onChange: (a) => m({ indexCategory: a.target.checked })
          }
        ),
        /* @__PURE__ */ s("span", { className: "text-sm font-medium", children: e("index.indexCategory") })
      ] }),
      /* @__PURE__ */ l("label", { className: "flex items-center gap-2", children: [
        /* @__PURE__ */ s(
          "input",
          {
            type: "checkbox",
            checked: c.indexTags,
            onChange: (a) => m({ indexTags: a.target.checked })
          }
        ),
        /* @__PURE__ */ s("span", { className: "text-sm font-medium", children: e("index.indexTags") })
      ] }),
      /* @__PURE__ */ l("label", { className: "flex items-center gap-2 pt-2 border-t border-surface-200 dark:border-surface-700", children: [
        /* @__PURE__ */ s(
          "input",
          {
            type: "checkbox",
            checked: c.includePages,
            onChange: (a) => m({ includePages: a.target.checked })
          }
        ),
        /* @__PURE__ */ s("span", { className: "text-sm font-medium", children: e("index.includePages") })
      ] }),
      /* @__PURE__ */ l("div", { children: [
        /* @__PURE__ */ s("p", { className: "label", children: e("index.excludedTerms") }),
        /* @__PURE__ */ s("p", { className: "text-xs text-surface-500 mb-2 dark:text-surface-400", children: e("index.excludedTermsHelp") }),
        k.length === 0 ? /* @__PURE__ */ s("p", { className: "text-xs italic text-surface-500 dark:text-surface-400", children: e("index.none") }) : /* @__PURE__ */ s("ul", { className: "space-y-1", children: k.map((a) => /* @__PURE__ */ s("li", { children: /* @__PURE__ */ l("label", { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ s(
            "input",
            {
              type: "checkbox",
              checked: c.excludedTermIds.includes(a.id),
              onChange: () => g(a.id)
            }
          ),
          /* @__PURE__ */ s("span", { className: "text-sm", children: a.name }),
          /* @__PURE__ */ l("span", { className: "text-xs text-surface-400", children: [
            "/",
            a.slug
          ] })
        ] }) }, a.id)) })
      ] })
    ] }),
    /* @__PURE__ */ l("section", { className: "card p-4 space-y-4", children: [
      /* @__PURE__ */ s("h2", { className: "font-semibold", children: e("behavior.title") }),
      /* @__PURE__ */ l("div", { children: [
        /* @__PURE__ */ s("label", { className: "label", children: e("behavior.minQueryLength") }),
        /* @__PURE__ */ s(
          "input",
          {
            type: "number",
            className: "input max-w-xs",
            min: 1,
            max: 10,
            value: c.minQueryLength,
            onChange: (a) => m({
              minQueryLength: Math.max(
                1,
                Math.min(10, Number.parseInt(a.target.value, 10) || 2)
              )
            })
          }
        ),
        /* @__PURE__ */ s("p", { className: "text-xs text-surface-500 mt-1 dark:text-surface-400", children: e("behavior.minQueryLengthHelp") })
      ] }),
      /* @__PURE__ */ l("div", { children: [
        /* @__PURE__ */ s("label", { className: "label", children: e("behavior.maxResults") }),
        /* @__PURE__ */ s(
          "input",
          {
            type: "number",
            className: "input max-w-xs",
            min: 1,
            max: 100,
            value: c.maxResults,
            onChange: (a) => m({
              maxResults: Math.max(
                1,
                Math.min(100, Number.parseInt(a.target.value, 10) || 20)
              )
            })
          }
        ),
        /* @__PURE__ */ s("p", { className: "text-xs text-surface-500 mt-1 dark:text-surface-400", children: e("behavior.maxResultsHelp") })
      ] })
    ] }),
    /* @__PURE__ */ l("section", { className: "card p-4 flex flex-wrap items-center gap-3", children: [
      /* @__PURE__ */ s("p", { className: "text-xs text-surface-500 dark:text-surface-400 flex-1 min-w-0", children: c.lastIndexedAt ? e("status.lastIndexed", { date: Y(c.lastIndexedAt, b) }) : e("status.notIndexed") }),
      /* @__PURE__ */ s(
        "button",
        {
          type: "button",
          className: "btn btn-secondary",
          onClick: p,
          disabled: h || y,
          children: /* @__PURE__ */ l("span", { className: "inline-flex items-center justify-center gap-1.5", children: [
            /* @__PURE__ */ s(B, { className: "w-4 h-4 animate-spin " + (h ? "" : "hidden") }),
            /* @__PURE__ */ s(pe, { className: "w-4 h-4 " + (h ? "hidden" : "") }),
            /* @__PURE__ */ s("span", { children: e(h ? "actions.regenerating" : "actions.forceRegenerate") })
          ] })
        }
      ),
      /* @__PURE__ */ l(
        "button",
        {
          type: "button",
          className: "btn btn-primary",
          onClick: w,
          disabled: y || h,
          children: [
            /* @__PURE__ */ s(B, { className: y ? "w-4 h-4 animate-spin" : "hidden" }),
            /* @__PURE__ */ s(xe, { className: y ? "hidden" : "w-4 h-4" }),
            /* @__PURE__ */ s("span", { children: e(y ? "actions.saving" : "actions.save") })
          ]
        }
      )
    ] })
  ] });
}
const be = `# Search

A theme-agnostic search plugin for AgentCMS. Builds a static
\`/search-index.json\` over your published content and ships a tiny
runtime (\`/search.js\`) that opens a search modal anywhere a
\`[data-cms-search]\` trigger is present in your theme.

No backend, no dependencies, no third-party search service — pure
client-side substring matching against a static JSON.

## How it integrates with a theme

Themes expose a search trigger as plain HTML:

\`\`\`html
<button type="button" data-cms-search aria-label="Search">…</button>
\`\`\`

The plugin's runtime attaches click handlers to every such element on
\`DOMContentLoaded\` and opens its modal when the user clicks. Themes
don't need to know anything about the plugin's API.

If the plugin is disabled, the trigger stays inert (the runtime never
loads). The theme keeps a working button shape — just no behavior.

## What gets indexed

- **Title** — always.
- **Excerpt** — opt-in. When the post has no explicit excerpt, falls
  back to a 200-character plain-text rendering of the body.
- **Category name** — opt-in.
- **Tag names** — opt-in.

The body is **never** indexed in full — too heavy for client-side
fetch, and the title + excerpt path covers most search-by-title use
cases. If you need true full-text search, plug in an external service.

## Performance

- Index file is a single JSON, fetched **once** on the first modal
  open per page load and cached in memory.
- Token search runs in linear time (substring \`indexOf\`); fine up to
  a few thousand items.
- Title hits are weighted higher than excerpt / category / tag hits, so
  matching titles rise to the top.

## Lifecycle

The index is regenerated on every publish action that mutates the
corpus:

- \`publish.complete\` — a post just went online (or was edited).
- \`post.unpublished\` — a post moved back to draft.
- \`post.deleted\` — a post was removed entirely.

\`/search.js\` itself is uploaded once on first run, then again only
when its bundle hash changes (i.e. the admin was redeployed with a new
runtime). Subsequent publishes only rewrite the JSON.

A **Force regenerate** button in the settings page rebuilds and
re-uploads both files unconditionally — useful after switching
\`settings.language\` (the runtime UI strings come from there) or when
you suspect the public site is out of sync.

## Settings

- **Index** — toggles for excerpt / category / tags / static-pages
  inclusion + a checklist of categories to exclude.
- **Behavior** — minimum query length (default 2) and maximum results
  (default 20). These are baked into the index file's \`meta\` block, so
  a change requires a regeneration to take effect.

## Customizing the modal styles

The runtime injects its own minimal \`<style>\` block on first open
(\`.cms-search-modal\`, \`.cms-search-panel\`, \`.cms-search-result\`, …).
Themes override anything by writing rules with higher specificity, or
by wrapping their own rules in \`:where()\`.

The category label of each result takes the theme's accent colour: the
runtime reads \`--cms-search-accent\` from \`:root\` when the theme defines
it, else \`--color-secondary\`, else \`--color-primary\` (bare RGB channels
such as \`67 97 124\`, as Tailwind themes store them, are wrapped in
\`rgb()\`), and falls back to a neutral slate. The native clear button of
the search input is hidden so the modal shows a single close button.

## Files written to your site

- \`/search-index.json\` — the index. Re-uploaded on every corpus change.
- \`/search.js\` — the runtime. Re-uploaded only when its hash changes.

Both live at the site root. The plugin auto-injects
\`<script src="/search.js" defer><\/script>\` on every page through the
\`page.body.end\` hook, so themes never have to add the script tag
themselves.

## Limitations / known trade-offs

- **First-publish race window** — the page being published is uploaded
  before \`/search.js\`. A visitor opening the page during that brief
  window (typically <1s) gets a 404 on the script. Subsequent loads
  work fine.
- **No fuzzy match** — token-by-token substring only. Typos = no
  results. Acceptable for a CMS search; consider a hosted service if
  you need typo tolerance.
- **Single index per site** — no per-language splits. The runtime UI
  strings respect \`settings.language\`, but the index itself is one
  flat list; multilingual content sites should use one language per
  site for now.
`;
function J(t) {
  const n = (t.pluginConfigs ?? {})[R];
  return { ...T, ...n ?? {} };
}
async function I(t, n) {
  if (!n.settings.baseUrl) {
    console.warn("[agentcms-search] skipping regeneration — baseUrl not configured");
    return;
  }
  let e = J(n.settings);
  try {
    const r = await ue(e);
    e = r.nextConfig;
    const d = await de({
      posts: n.posts,
      pages: n.pages,
      terms: n.terms,
      settings: n.settings,
      config: e
    });
    e = d.nextConfig, (r.uploaded || d.uploaded) && await U(R, e);
  } catch (r) {
    console.error("[agentcms-search] regeneration failed:", r);
  }
}
const Re = {
  id: R,
  name: "Search",
  version: "1.0.1",
  author: "AgentCMS",
  description: "Generates /search-index.json + a search runtime that opens a modal anywhere a [data-cms-search] trigger is present in your theme.",
  readme: be,
  i18n: { en: Q, fr: te, de: ae, es: se, nl: re, pt: ie, ko: oe },
  settings: {
    navLabelKey: "title",
    defaultConfig: T,
    component: fe
  },
  register(t) {
    t.addAction("publish.complete", async (n, e) => {
      await I(n, e);
    }), t.addAction("post.unpublished", async (n, e) => {
      await I(n, e);
    }), t.addAction("post.deleted", async (n, e) => {
      await I(n, e);
    }), t.addFilter("page.body.end", (n, ...e) => {
      e[0];
      const r = `<script src="/${q}" defer><\/script>`;
      return [n, r].filter(Boolean).join("");
    }), t.registerRegenerationTarget({
      id: R,
      labelKey: "regenerationTarget.label",
      descriptionKey: "regenerationTarget.description",
      priority: 220,
      run: async (n, e) => {
        if (!n.settings.baseUrl) {
          e({ level: "warn", message: "[agentcms-search] skipped — site URL not set." });
          return;
        }
        const r = J(n.settings);
        e({ level: "info", message: "Regenerating search runtime + index…" });
        const d = await F({
          posts: n.posts,
          pages: n.pages,
          terms: n.terms,
          settings: n.settings,
          config: r
        });
        JSON.stringify(d.nextConfig) !== JSON.stringify(r) && await U(R, d.nextConfig), e({ level: "success", message: "Search: runtime + index uploaded." });
      }
    });
  }
};
export {
  Re as manifest
};
