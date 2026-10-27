import { pickPublicLocale as ge, uploadFile as N, pathToPublicUrl as y, deleteFile as R, buildRssFeedXml as H, applyFilters as pe, buildTermUrl as q, buildPostUrl as he, markdownToPlainText as fe, useCmsData as me, EntityCombobox as be, fetchAllPosts as U, publishMenuJson as z, toast as x, updatePluginConfig as V, i18n as G } from "@agent-cms/runtime";
import { jsxs as g, jsx as l, Fragment as ye } from "react/jsx-runtime";
import { forwardRef as _, createElement as E, useState as T, useEffect as Se, useMemo as xe } from "react";
import { useTranslation as Fe } from "react-i18next";
const J = {
  title: "RSS feeds",
  description: "Generates an RSS 2.0 feed at /rss.xml plus optional per-category feeds. Each feed can be added to the site footer.",
  regenerationTarget: {
    label: "RSS feeds",
    description: "Site feed + per-category feeds + XSL stylesheet + footer menu refresh"
  },
  sections: {
    site: "Site feed",
    categoryFeeds: "Category feeds",
    actions: "Actions"
  },
  site: {
    enabled: "Generate /rss.xml",
    enabledHelp: "When enabled, an RSS file is published at the site root listing the most recent online posts.",
    itemCount: "Items in feed",
    itemCountHelp: "Number of most-recent posts to include (1–100).",
    excluded: "Excluded categories",
    excludedHelp: "Posts in checked categories are skipped from the site feed. Leave empty to include everything.",
    addToFooter: "Show in footer"
  },
  category: {
    addLabel: "Add a category feed",
    placeholder: "Search a category…",
    add: "Add",
    itemCount: "Items",
    addToFooter: "Show in footer",
    remove: "Remove",
    pathHint: "Published at /{{path}}",
    none: "No category feeds yet."
  },
  actions: {
    save: "Save settings",
    saving: "Saving…",
    saved: "Settings saved.",
    uploadXsl: "Upload stylesheet",
    uploadingXsl: "Uploading…",
    xslUploaded: "Stylesheet uploaded.",
    xslFailed: "Stylesheet upload failed.",
    forceRegenerate: "Force regenerate all feeds",
    forceRegenerating: "Regenerating…",
    regenerated: "Feeds regenerated ({{count}} files).",
    regenerateFailed: "Feed regeneration failed."
  },
  footerLabels: {
    site: "RSS",
    // Used as "RSS — <category>"; rendered with `name` interpolated.
    category: "RSS — {{name}}"
  },
  baseUrlMissing: "Set the public site URL in Settings → General before regenerating feeds."
}, ve = {
  title: "Flux RSS",
  description: "Génère un flux RSS 2.0 à /rss.xml ainsi que des flux par catégorie optionnels. Chaque flux peut être ajouté au pied de page du site.",
  regenerationTarget: {
    label: "Flux RSS",
    description: "Flux site + flux par catégorie + feuille XSL + rafraîchissement du menu pied de page"
  },
  sections: {
    site: "Flux du site",
    categoryFeeds: "Flux par catégorie",
    actions: "Actions"
  },
  site: {
    enabled: "Générer /rss.xml",
    enabledHelp: "Quand activé, un fichier RSS est publié à la racine du site listant les derniers articles en ligne.",
    itemCount: "Éléments dans le flux",
    itemCountHelp: "Nombre d'articles récents à inclure (1–100).",
    excluded: "Catégories à exclure",
    excludedHelp: "Les articles des catégories cochées sont écartés du flux du site. Laissez vide pour tout inclure.",
    addToFooter: "Afficher dans le pied de page"
  },
  category: {
    addLabel: "Ajouter un flux de catégorie",
    placeholder: "Rechercher une catégorie…",
    add: "Ajouter",
    itemCount: "Éléments",
    addToFooter: "Afficher dans le pied de page",
    remove: "Retirer",
    pathHint: "Publié à /{{path}}",
    none: "Aucun flux de catégorie."
  },
  actions: {
    save: "Enregistrer les réglages",
    saving: "Enregistrement…",
    saved: "Réglages enregistrés.",
    uploadXsl: "Envoyer la feuille de style",
    uploadingXsl: "Envoi…",
    xslUploaded: "Feuille de style envoyée.",
    xslFailed: "Échec de l'envoi de la feuille de style.",
    forceRegenerate: "Forcer la régénération",
    forceRegenerating: "Régénération…",
    regenerated: "Flux régénérés ({{count}} fichiers).",
    regenerateFailed: "Échec de la régénération."
  },
  footerLabels: {
    site: "RSS",
    category: "RSS — {{name}}"
  },
  baseUrlMissing: "Définissez l'URL publique du site dans Réglages → Général avant de régénérer les flux."
}, Re = {
  title: "RSS-Feeds",
  description: "Erzeugt einen RSS-2.0-Feed unter /rss.xml sowie optionale Feeds pro Kategorie. Jeder Feed kann zur Fußzeile der Website hinzugefügt werden.",
  regenerationTarget: {
    label: "RSS-Feeds",
    description: "Site-Feed + Kategorie-Feeds + XSL-Stylesheet + Footer-Menü-Refresh"
  },
  sections: {
    site: "Website-Feed",
    categoryFeeds: "Kategorie-Feeds",
    actions: "Aktionen"
  },
  site: {
    enabled: "/rss.xml erzeugen",
    enabledHelp: "Wenn aktiviert, wird im Stammverzeichnis der Website eine RSS-Datei mit den neuesten Online-Artikeln veröffentlicht.",
    itemCount: "Einträge im Feed",
    itemCountHelp: "Anzahl der jüngsten Artikel, die einbezogen werden (1–100).",
    excluded: "Ausgeschlossene Kategorien",
    excludedHelp: "Artikel in markierten Kategorien werden vom Website-Feed übersprungen. Leer lassen, um alle einzubeziehen.",
    addToFooter: "In Fußzeile anzeigen"
  },
  category: {
    addLabel: "Einen Kategorie-Feed hinzufügen",
    placeholder: "Kategorie suchen…",
    add: "Hinzufügen",
    itemCount: "Einträge",
    addToFooter: "In Fußzeile anzeigen",
    remove: "Entfernen",
    pathHint: "Veröffentlicht unter /{{path}}",
    none: "Noch keine Kategorie-Feeds."
  },
  actions: {
    save: "Einstellungen speichern",
    saving: "Speichert…",
    saved: "Einstellungen gespeichert.",
    uploadXsl: "Stylesheet hochladen",
    uploadingXsl: "Lädt hoch…",
    xslUploaded: "Stylesheet hochgeladen.",
    xslFailed: "Stylesheet-Upload fehlgeschlagen.",
    forceRegenerate: "Alle Feeds zwangsweise neu erzeugen",
    forceRegenerating: "Neu erzeugen…",
    regenerated: "Feeds neu erzeugt ({{count}} Dateien).",
    regenerateFailed: "Feed-Neuerzeugung fehlgeschlagen."
  },
  footerLabels: {
    site: "RSS",
    category: "RSS — {{name}}"
  },
  baseUrlMissing: "Legen Sie die öffentliche Website-URL unter Einstellungen → Allgemein fest, bevor Sie Feeds neu erzeugen."
}, we = {
  title: "Feeds RSS",
  description: "Genera un feed RSS 2.0 en /rss.xml más feeds opcionales por categoría. Cada feed se puede añadir al pie del sitio.",
  regenerationTarget: {
    label: "Feeds RSS",
    description: "Feed del sitio + feeds por categoría + hoja XSL + actualización del menú del pie"
  },
  sections: {
    site: "Feed del sitio",
    categoryFeeds: "Feeds de categoría",
    actions: "Acciones"
  },
  site: {
    enabled: "Generar /rss.xml",
    enabledHelp: "Cuando está activado, se publica un archivo RSS en la raíz del sitio con las entradas más recientes en línea.",
    itemCount: "Elementos en el feed",
    itemCountHelp: "Número de entradas más recientes a incluir (1–100).",
    excluded: "Categorías excluidas",
    excludedHelp: "Las entradas de las categorías marcadas se omiten del feed del sitio. Déjalo vacío para incluir todo.",
    addToFooter: "Mostrar en el pie"
  },
  category: {
    addLabel: "Añadir un feed de categoría",
    placeholder: "Buscar una categoría…",
    add: "Añadir",
    itemCount: "Elementos",
    addToFooter: "Mostrar en el pie",
    remove: "Eliminar",
    pathHint: "Publicado en /{{path}}",
    none: "Aún no hay feeds de categoría."
  },
  actions: {
    save: "Guardar ajustes",
    saving: "Guardando…",
    saved: "Ajustes guardados.",
    uploadXsl: "Subir hoja de estilo",
    uploadingXsl: "Subiendo…",
    xslUploaded: "Hoja de estilo subida.",
    xslFailed: "Error al subir la hoja de estilo.",
    forceRegenerate: "Forzar regeneración de todos los feeds",
    forceRegenerating: "Regenerando…",
    regenerated: "Feeds regenerados ({{count}} archivos).",
    regenerateFailed: "La regeneración de feeds falló."
  },
  footerLabels: {
    site: "RSS",
    category: "RSS — {{name}}"
  },
  baseUrlMissing: "Define la URL pública del sitio en Ajustes → General antes de regenerar los feeds."
}, Ce = {
  title: "RSS-feeds",
  description: "Genereert een RSS 2.0-feed op /rss.xml plus optionele feeds per categorie. Elke feed kan aan de footer van de site worden toegevoegd.",
  regenerationTarget: {
    label: "RSS-feeds",
    description: "Site-feed + categorie-feeds + XSL-stylesheet + footermenu-vernieuwing"
  },
  sections: {
    site: "Site-feed",
    categoryFeeds: "Categoriefeeds",
    actions: "Acties"
  },
  site: {
    enabled: "/rss.xml genereren",
    enabledHelp: "Wanneer ingeschakeld wordt op de root van de site een RSS-bestand gepubliceerd met de meest recente online berichten.",
    itemCount: "Items in feed",
    itemCountHelp: "Aantal meest recente berichten om op te nemen (1–100).",
    excluded: "Uitgesloten categorieën",
    excludedHelp: "Berichten in aangevinkte categorieën worden overgeslagen in de site-feed. Laat leeg om alles op te nemen.",
    addToFooter: "Tonen in footer"
  },
  category: {
    addLabel: "Een categoriefeed toevoegen",
    placeholder: "Een categorie zoeken…",
    add: "Toevoegen",
    itemCount: "Items",
    addToFooter: "Tonen in footer",
    remove: "Verwijderen",
    pathHint: "Gepubliceerd op /{{path}}",
    none: "Nog geen categoriefeeds."
  },
  actions: {
    save: "Instellingen opslaan",
    saving: "Opslaan…",
    saved: "Instellingen opgeslagen.",
    uploadXsl: "Stylesheet uploaden",
    uploadingXsl: "Uploaden…",
    xslUploaded: "Stylesheet geüpload.",
    xslFailed: "Stylesheet-upload mislukt.",
    forceRegenerate: "Alle feeds geforceerd regenereren",
    forceRegenerating: "Regenereren…",
    regenerated: "Feeds geregenereerd ({{count}} bestanden).",
    regenerateFailed: "Feed-regeneratie mislukt."
  },
  footerLabels: {
    site: "RSS",
    category: "RSS — {{name}}"
  },
  baseUrlMissing: "Stel de publieke site-URL in via Instellingen → Algemeen voordat je feeds regenereert."
}, ke = {
  title: "Feeds RSS",
  description: "Gera um feed RSS 2.0 em /rss.xml mais feeds opcionais por categoria. Cada feed pode ser adicionado ao rodapé do site.",
  regenerationTarget: {
    label: "Feeds RSS",
    description: "Feed do site + feeds por categoria + folha XSL + atualização do menu do rodapé"
  },
  sections: {
    site: "Feed do site",
    categoryFeeds: "Feeds de categoria",
    actions: "Ações"
  },
  site: {
    enabled: "Gerar /rss.xml",
    enabledHelp: "Quando ativo, é publicado um ficheiro RSS na raiz do site com os artigos online mais recentes.",
    itemCount: "Itens no feed",
    itemCountHelp: "Número de artigos mais recentes a incluir (1–100).",
    excluded: "Categorias excluídas",
    excludedHelp: "Os artigos das categorias marcadas são ignorados no feed do site. Deixa vazio para incluir tudo.",
    addToFooter: "Mostrar no rodapé"
  },
  category: {
    addLabel: "Adicionar um feed de categoria",
    placeholder: "Pesquisar uma categoria…",
    add: "Adicionar",
    itemCount: "Itens",
    addToFooter: "Mostrar no rodapé",
    remove: "Remover",
    pathHint: "Publicado em /{{path}}",
    none: "Ainda não há feeds de categoria."
  },
  actions: {
    save: "Guardar definições",
    saving: "A guardar…",
    saved: "Definições guardadas.",
    uploadXsl: "Enviar folha de estilo",
    uploadingXsl: "A enviar…",
    xslUploaded: "Folha de estilo enviada.",
    xslFailed: "Falha ao enviar folha de estilo.",
    forceRegenerate: "Forçar regeneração de todos os feeds",
    forceRegenerating: "A regenerar…",
    regenerated: "Feeds regenerados ({{count}} ficheiros).",
    regenerateFailed: "Falha na regeneração de feeds."
  },
  footerLabels: {
    site: "RSS",
    category: "RSS — {{name}}"
  },
  baseUrlMissing: "Define o URL público do site em Definições → Geral antes de regenerar feeds."
}, Te = {
  title: "RSS 피드",
  description: "/rss.xml에 RSS 2.0 피드와 선택적 카테고리별 피드를 생성합니다. 각 피드는 사이트 푸터에 추가할 수 있습니다.",
  regenerationTarget: {
    label: "RSS 피드",
    description: "사이트 피드 + 카테고리별 피드 + XSL 스타일시트 + 푸터 메뉴 새로고침"
  },
  sections: {
    site: "사이트 피드",
    categoryFeeds: "카테고리 피드",
    actions: "작업"
  },
  site: {
    enabled: "/rss.xml 생성",
    enabledHelp: "활성화하면 사이트 루트에 가장 최근의 온라인 게시물을 나열하는 RSS 파일이 게시됩니다.",
    itemCount: "피드 항목 수",
    itemCountHelp: "포함할 최신 게시물 수 (1–100).",
    excluded: "제외할 카테고리",
    excludedHelp: "체크된 카테고리의 게시물은 사이트 피드에서 제외됩니다. 모두 포함하려면 비워 두세요.",
    addToFooter: "푸터에 표시"
  },
  category: {
    addLabel: "카테고리 피드 추가",
    placeholder: "카테고리 검색…",
    add: "추가",
    itemCount: "항목 수",
    addToFooter: "푸터에 표시",
    remove: "제거",
    pathHint: "/{{path}}에 게시됨",
    none: "아직 카테고리 피드가 없습니다."
  },
  actions: {
    save: "설정 저장",
    saving: "저장 중…",
    saved: "설정이 저장되었습니다.",
    uploadXsl: "스타일시트 업로드",
    uploadingXsl: "업로드 중…",
    xslUploaded: "스타일시트가 업로드되었습니다.",
    xslFailed: "스타일시트 업로드에 실패했습니다.",
    forceRegenerate: "모든 피드 강제 재생성",
    forceRegenerating: "재생성 중…",
    regenerated: "피드가 재생성되었습니다 ({{count}}개 파일).",
    regenerateFailed: "피드 재생성에 실패했습니다."
  },
  footerLabels: {
    site: "RSS",
    category: "RSS — {{name}}"
  },
  baseUrlMissing: "피드를 재생성하기 전에 설정 → 일반에서 공개 사이트 URL을 설정하세요."
}, Q = "rss.xsl", Pe = {
  en: {
    pageTitle: "RSS feed",
    heading: "RSS feed",
    meta: "This RSS feed is meant for RSS readers. Subscribe by copying this page's URL into your reader.",
    countBefore: "This feed contains ",
    countAfter: " articles.",
    columnTitle: "Title",
    columnPubdate: "Published",
    columnDescription: "Description"
  },
  fr: {
    pageTitle: "Flux RSS",
    heading: "Flux RSS",
    meta: "Ce flux RSS est destiné aux lecteurs RSS. Abonnez-vous en copiant l'URL de cette page dans votre lecteur.",
    countBefore: "Ce flux contient ",
    countAfter: " articles.",
    columnTitle: "Titre",
    columnPubdate: "Publié",
    columnDescription: "Description"
  },
  de: {
    pageTitle: "RSS-Feed",
    heading: "RSS-Feed",
    meta: "Dieser RSS-Feed ist für RSS-Reader gedacht. Abonnieren Sie ihn, indem Sie die URL dieser Seite in Ihren Reader kopieren.",
    countBefore: "Dieser Feed enthält ",
    countAfter: " Artikel.",
    columnTitle: "Titel",
    columnPubdate: "Veröffentlicht",
    columnDescription: "Beschreibung"
  },
  es: {
    pageTitle: "Feed RSS",
    heading: "Feed RSS",
    meta: "Este feed RSS está destinado a los lectores RSS. Suscríbete copiando la URL de esta página en tu lector.",
    countBefore: "Este feed contiene ",
    countAfter: " artículos.",
    columnTitle: "Título",
    columnPubdate: "Publicado",
    columnDescription: "Descripción"
  },
  nl: {
    pageTitle: "RSS-feed",
    heading: "RSS-feed",
    meta: "Deze RSS-feed is bedoeld voor RSS-lezers. Abonneer door de URL van deze pagina in je lezer te kopiëren.",
    countBefore: "Deze feed bevat ",
    countAfter: " artikelen.",
    columnTitle: "Titel",
    columnPubdate: "Gepubliceerd",
    columnDescription: "Beschrijving"
  },
  pt: {
    pageTitle: "Feed RSS",
    heading: "Feed RSS",
    meta: "Este feed RSS destina-se a leitores RSS. Subscreve copiando o URL desta página para o teu leitor.",
    countBefore: "Este feed contém ",
    countAfter: " artigos.",
    columnTitle: "Título",
    columnPubdate: "Publicado",
    columnDescription: "Descrição"
  },
  ko: {
    pageTitle: "RSS 피드",
    heading: "RSS 피드",
    meta: "이 RSS 피드는 RSS 리더를 위한 것입니다. 이 페이지의 URL을 리더에 복사하여 구독하세요.",
    countBefore: "이 피드에는 ",
    countAfter: "개의 기사가 포함되어 있습니다.",
    columnTitle: "제목",
    columnPubdate: "게시일",
    columnDescription: "설명"
  }
};
function Le(e) {
  return ge(e);
}
const Ue = `
body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif; color: #1f2937; margin: 0; padding: 32px 16px; background: #ffffff; }
main { max-width: 1024px; margin: 0 auto; }
h1 { font-size: 22px; margin: 0 0 8px; font-weight: 600; }
.meta { color: #6b7280; font-size: 13px; margin: 0 0 24px; }
.count { color: #6b7280; font-size: 13px; margin: 0 0 16px; }
table { width: 100%; border-collapse: collapse; font-size: 13px; }
th { text-align: left; padding: 10px 12px; background: #f3f4f6; border-bottom: 1px solid #e5e7eb; font-weight: 600; color: #1f2937; }
td { padding: 10px 12px; border-bottom: 1px solid #f3f4f6; vertical-align: top; }
tr:nth-child(even) td { background: #fafafa; }
tr:hover td { background: #f3f4f6; }
a { color: #2563eb; text-decoration: none; }
a:hover { text-decoration: underline; }
.title { width: 40%; }
.pubdate { white-space: nowrap; color: #4b5563; width: 200px; }
.description { color: #4b5563; }
`;
function Ne(e) {
  const a = Le(e), t = Pe[a];
  return `<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="1.0"
  xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
  xmlns:atom="http://www.w3.org/2005/Atom">
  <xsl:output method="html" version="1.0" encoding="UTF-8" indent="yes"
              doctype-system="about:legacy-compat"/>
  <xsl:template match="/">
    <html lang="${a}">
      <head>
        <title>${t.pageTitle} — <xsl:value-of select="/rss/channel/title"/></title>
        <meta charset="utf-8"/>
        <meta name="robots" content="noindex,follow"/>
        <meta name="viewport" content="width=device-width, initial-scale=1"/>
        <style type="text/css">${Ue}</style>
      </head>
      <body>
        <main>
          <h1>${t.heading} — <xsl:value-of select="/rss/channel/title"/></h1>
          <p class="meta">${t.meta}</p>
          <p class="count">${t.countBefore}<xsl:value-of select="count(/rss/channel/item)"/>${t.countAfter}</p>
          <table>
            <thead>
              <tr>
                <th class="title">${t.columnTitle}</th>
                <th class="pubdate">${t.columnPubdate}</th>
                <th class="description">${t.columnDescription}</th>
              </tr>
            </thead>
            <tbody>
              <xsl:for-each select="/rss/channel/item">
                <tr>
                  <td class="title"><a href="{link}"><xsl:value-of select="title"/></a></td>
                  <td class="pubdate"><xsl:value-of select="pubDate"/></td>
                  <td class="description"><xsl:value-of select="description"/></td>
                </tr>
              </xsl:for-each>
            </tbody>
          </table>
        </main>
      </body>
    </html>
  </xsl:template>
</xsl:stylesheet>`;
}
const F = "rss.xml", j = {
  site: {
    enabled: !1,
    itemCount: 20,
    excludedTermIds: [],
    addToFooter: !1
  },
  categoryFeeds: []
};
function A(e) {
  return `${e}/${e}.xml`;
}
function Ae(e, a) {
  if (!e.heroMediaId) return null;
  const t = a.get(e.heroMediaId);
  if (!t) return null;
  if (t.formats && Object.keys(t.formats).length > 0) {
    const n = t.formats.large ?? (t.defaultFormat ? t.formats[t.defaultFormat] : void 0) ?? Object.values(t.formats)[0];
    if (n != null && n.url)
      return {
        url: n.url,
        length: n.bytes ?? 0,
        type: t.contentType || W(n.url)
      };
  }
  return t.url ? {
    url: t.url,
    length: t.size ?? 0,
    type: t.contentType || W(t.url)
  } : null;
}
function W(e) {
  const a = e.toLowerCase();
  return a.endsWith(".webp") ? "image/webp" : a.endsWith(".png") ? "image/png" : a.endsWith(".gif") ? "image/gif" : a.endsWith(".avif") ? "image/avif" : (a.endsWith(".jpg") || a.endsWith(".jpeg"), "image/jpeg");
}
function Z(e, a, t, n) {
  var c, f, m, C, S, k;
  const s = e.primaryTermId ? a.find((P) => P.id === e.primaryTermId && P.type === "category") : void 0;
  let r;
  try {
    r = he({ post: e, primaryTerm: s });
  } catch {
    return null;
  }
  const d = y(n, r), i = (e.excerpt && e.excerpt.trim().length > 0 ? e.excerpt : fe(e.contentMarkdown, 300)).trim(), p = ((f = (c = e.publishedAt) == null ? void 0 : c.toMillis) == null ? void 0 : f.call(c)) ?? ((C = (m = e.updatedAt) == null ? void 0 : m.toMillis) == null ? void 0 : C.call(m)) ?? ((k = (S = e.createdAt) == null ? void 0 : S.toMillis) == null ? void 0 : k.call(S)) ?? Date.now();
  return {
    title: e.title || e.slug,
    link: d,
    guid: d,
    description: i,
    pubDateMs: p,
    category: s == null ? void 0 : s.name,
    enclosure: Ae(e, t) ?? void 0
  };
}
function Me(e, a, t, n, s) {
  const r = new Set(n.site.excludedTermIds);
  return e.filter((d) => d.status === "online").filter((d) => !d.primaryTermId || !r.has(d.primaryTermId)).map((d) => Z(d, a, t, s)).filter((d) => d !== null).sort((d, i) => i.pubDateMs - d.pubDateMs).slice(0, Math.max(1, Math.min(100, n.site.itemCount)));
}
function Ie(e, a, t, n, s) {
  return e.filter((r) => r.status === "online" && r.primaryTermId === n.termId).map((r) => Z(r, a, t, s)).filter((r) => r !== null).sort((r, d) => d.pubDateMs - r.pubDateMs).slice(0, Math.max(1, Math.min(100, n.itemCount)));
}
function He(e) {
  return e instanceof Map ? e : new Map(e.map((a) => [a.id, a]));
}
function Y(e) {
  const a = (e.settings.baseUrl || "").replace(/\/+$/, "");
  if (!a) throw new Error("baseUrl is empty — cannot build feed URLs.");
  return {
    posts: e.posts,
    terms: e.terms,
    mediaMap: He(e.media),
    settings: e.settings,
    baseUrl: a,
    xslHref: y(a, Q)
  };
}
async function ee(e, a) {
  const t = [], n = [];
  if (!a.site.enabled) {
    if (a.site.lastPublishedPath)
      try {
        await R(a.site.lastPublishedPath), n.push(a.site.lastPublishedPath);
      } catch {
      }
    for (const c of a.site.lastLocalePaths ?? [])
      try {
        await R(c), n.push(c);
      } catch {
      }
    return {
      uploaded: t,
      deleted: n,
      nextSite: { ...a.site, lastPublishedPath: void 0, lastLocalePaths: [] }
    };
  }
  const s = Me(e.posts, e.terms, e.mediaMap, a, e.baseUrl), r = H({
    title: e.settings.title || "Site",
    link: y(e.baseUrl, ""),
    description: e.settings.description || e.settings.title || "",
    feedUrl: y(e.baseUrl, F),
    language: e.settings.language || "en",
    items: s,
    xslHref: e.xslHref
  });
  await N({ path: F, content: r }), t.push(F);
  const d = await pe(
    "rss.site.locales",
    [],
    {
      posts: e.posts,
      terms: e.terms,
      mediaMap: e.mediaMap,
      settings: e.settings,
      config: a,
      baseUrl: e.baseUrl,
      xslHref: e.xslHref
    }
  ), i = [];
  for (const c of d) {
    if (!c.path || !c.language) continue;
    const f = H({
      title: c.channelTitle,
      link: c.channelLink,
      description: c.channelDescription,
      feedUrl: y(e.baseUrl, c.path),
      language: c.language,
      items: c.items,
      xslHref: e.xslHref
    });
    await N({ path: c.path, content: f }), t.push(c.path), i.push(c.path);
  }
  const p = new Set(i);
  for (const c of a.site.lastLocalePaths ?? [])
    if (!p.has(c))
      try {
        await R(c), n.push(c);
      } catch {
      }
  return {
    uploaded: t,
    deleted: n,
    nextSite: {
      ...a.site,
      lastPublishedPath: F,
      lastLocalePaths: i
    }
  };
}
async function te(e, a) {
  const t = [], n = [], s = e.terms.find((f) => f.id === a.termId && f.type === "category");
  if (!s) {
    if (a.lastPublishedPath)
      try {
        await R(a.lastPublishedPath), n.push(a.lastPublishedPath);
      } catch {
      }
    return { uploaded: t, deleted: n, nextFeed: null };
  }
  const r = A(s.slug);
  if (a.lastPublishedPath && a.lastPublishedPath !== r)
    try {
      await R(a.lastPublishedPath), n.push(a.lastPublishedPath);
    } catch {
    }
  const d = Ie(e.posts, e.terms, e.mediaMap, a, e.baseUrl), i = y(e.baseUrl, q(s)), p = `${e.settings.title || "Site"} — ${s.name}`, c = H({
    title: p,
    link: i,
    description: s.description || s.name,
    feedUrl: y(e.baseUrl, r),
    language: e.settings.language || "en",
    items: d,
    xslHref: e.xslHref
  });
  return await N({ path: r, content: c }), t.push(r), {
    uploaded: t,
    deleted: n,
    nextFeed: { ...a, lastPublishedPath: r }
  };
}
async function ae(e) {
  const a = Y(e), t = [], n = [], s = await ee(a, e.config);
  t.push(...s.uploaded), n.push(...s.deleted);
  const r = [];
  for (const d of e.config.categoryFeeds) {
    const i = await te(a, d);
    t.push(...i.uploaded), n.push(...i.deleted), i.nextFeed && r.push(i.nextFeed);
  }
  return {
    result: { uploaded: t, deleted: n },
    nextConfig: { site: s.nextSite, categoryFeeds: r }
  };
}
async function ze(e) {
  const a = Y(e), t = [], n = [];
  let s = e.config.site;
  const r = [...e.config.categoryFeeds];
  if (e.config.site.enabled) {
    const d = new Set(e.config.site.excludedTermIds);
    if (!e.post.primaryTermId || !d.has(e.post.primaryTermId)) {
      const i = await ee(a, e.config);
      t.push(...i.uploaded), n.push(...i.deleted), s = i.nextSite;
    }
  }
  if (e.post.primaryTermId) {
    const d = r.findIndex((i) => i.termId === e.post.primaryTermId);
    if (d >= 0) {
      const i = await te(a, r[d]);
      t.push(...i.uploaded), n.push(...i.deleted), i.nextFeed ? r[d] = i.nextFeed : r.splice(d, 1);
    }
  }
  return {
    result: { uploaded: t, deleted: n },
    nextConfig: { site: s, categoryFeeds: r }
  };
}
async function D(e) {
  await N({
    path: Q,
    content: Ne(e.settings.language)
  });
}
async function O(e) {
  const a = [];
  let t = e.nextConfig.site;
  if (!e.nextConfig.site.enabled) {
    const s = e.prevConfig.site.lastPublishedPath ?? F;
    try {
      await R(s), a.push(s);
    } catch {
    }
    t = { ...t, lastPublishedPath: void 0 };
  }
  const n = new Set(e.nextConfig.categoryFeeds.map((s) => s.termId));
  for (const s of e.prevConfig.categoryFeeds)
    if (!n.has(s.termId) && s.lastPublishedPath)
      try {
        await R(s.lastPublishedPath), a.push(s.lastPublishedPath);
      } catch {
      }
  return {
    deleted: a,
    nextConfig: { site: t, categoryFeeds: e.nextConfig.categoryFeeds }
  };
}
const Ee = "agentcms-rss";
function B(e) {
  return e.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}
function K(e, a) {
  return `<link rel="alternate" type="application/rss+xml" title="${B(e)}" href="${B(a)}" />`;
}
function De(e) {
  var p;
  const a = e.site.settings, t = (a.baseUrl || "").replace(/\/+$/, "");
  if (!t) return "";
  const n = (a.pluginConfigs ?? {})[Ee], s = { ...j, ...n ?? {} }, r = a.title || "Site", d = [];
  (p = s.site) != null && p.enabled && d.push(K(r, y(t, F)));
  const i = /^([a-z0-9-]+)\/index\.html$/.exec(e.currentPath || "");
  if (i) {
    const c = A(i[1]);
    if ((s.categoryFeeds ?? []).some((m) => m.lastPublishedPath === c)) {
      const m = e.pageTitle || i[1];
      d.push(K(`${r} — ${m}`, y(t, c)));
    }
  }
  return d.join(`
`);
}
/**
 * @license lucide-react v0.460.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const je = (e) => e.replace(/([a-z0-9])([A-Z])/g, "$1-$2").toLowerCase(), ne = (...e) => e.filter((a, t, n) => !!a && a.trim() !== "" && n.indexOf(a) === t).join(" ").trim();
/**
 * @license lucide-react v0.460.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
var $e = {
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
const Xe = _(
  ({
    color: e = "currentColor",
    size: a = 24,
    strokeWidth: t = 2,
    absoluteStrokeWidth: n,
    className: s = "",
    children: r,
    iconNode: d,
    ...i
  }, p) => E(
    "svg",
    {
      ref: p,
      ...$e,
      width: a,
      height: a,
      stroke: e,
      strokeWidth: n ? Number(t) * 24 / Number(a) : t,
      className: ne("lucide", s),
      ...i
    },
    [
      ...d.map(([c, f]) => E(c, f)),
      ...Array.isArray(r) ? r : [r]
    ]
  )
);
/**
 * @license lucide-react v0.460.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const w = (e, a) => {
  const t = _(
    ({ className: n, ...s }, r) => E(Xe, {
      ref: r,
      iconNode: a,
      className: ne(`lucide-${je(e)}`, n),
      ...s
    })
  );
  return t.displayName = `${e}`, t;
};
/**
 * @license lucide-react v0.460.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const Ge = w("FileCode2", [
  ["path", { d: "M4 22h14a2 2 0 0 0 2-2V7l-5-5H6a2 2 0 0 0-2 2v4", key: "1pf5j1" }],
  ["path", { d: "M14 2v4a2 2 0 0 0 2 2h4", key: "tnqrlb" }],
  ["path", { d: "m5 12-3 3 3 3", key: "oke12k" }],
  ["path", { d: "m9 18 3-3-3-3", key: "112psh" }]
]);
/**
 * @license lucide-react v0.460.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const M = w("LoaderCircle", [
  ["path", { d: "M21 12a9 9 0 1 1-6.219-8.56", key: "13zald" }]
]);
/**
 * @license lucide-react v0.460.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const We = w("Plus", [
  ["path", { d: "M5 12h14", key: "1ays0h" }],
  ["path", { d: "M12 5v14", key: "s699le" }]
]);
/**
 * @license lucide-react v0.460.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const Oe = w("RefreshCw", [
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
const Be = w("Save", [
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
const Ke = w("Trash2", [
  ["path", { d: "M3 6h18", key: "d0wm0j" }],
  ["path", { d: "M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6", key: "4alrt4" }],
  ["path", { d: "M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2", key: "v07s0e" }],
  ["line", { x1: "10", x2: "10", y1: "11", y2: "17", key: "1uufr5" }],
  ["line", { x1: "14", x2: "14", y1: "11", y2: "17", key: "xtxkd" }]
]);
function qe({ config: e, save: a }) {
  const { t } = Fe("agentcms-rss"), { settings: n, terms: s, categories: r, media: d } = me(), [i, p] = T(e);
  Se(() => p(e), [e]);
  const [c, f] = T(!1), [m, C] = T(!1), [S, k] = T(!1), P = xe(() => {
    const o = new Set(i.categoryFeeds.map((u) => u.termId));
    return r.filter((u) => !o.has(u.id)).map((u) => ({ id: u.id, label: u.name, subtitle: `/${u.slug}` }));
  }, [r, i.categoryFeeds]);
  function L(o) {
    p((u) => ({ ...u, site: { ...u.site, ...o } }));
  }
  function X(o, u) {
    p((b) => ({
      ...b,
      categoryFeeds: b.categoryFeeds.map((h) => h.termId === o ? { ...h, ...u } : h)
    }));
  }
  function se(o) {
    p((u) => ({
      ...u,
      categoryFeeds: u.categoryFeeds.filter((b) => b.termId !== o)
    }));
  }
  function ie(o) {
    o && (i.categoryFeeds.some((u) => u.termId === o) || p((u) => ({
      ...u,
      categoryFeeds: [...u.categoryFeeds, { termId: o, itemCount: 20, addToFooter: !1 }]
    })));
  }
  function re(o) {
    const u = new Set(i.site.excludedTermIds);
    u.has(o) ? u.delete(o) : u.add(o), L({ excludedTermIds: [...u] });
  }
  async function oe() {
    f(!0);
    try {
      const o = await O({ prevConfig: e, nextConfig: i });
      await a(o.nextConfig);
      const u = {
        ...n,
        pluginConfigs: { ...n.pluginConfigs, "agentcms-rss": o.nextConfig }
      };
      try {
        const [b, h] = await Promise.all([
          U({ type: "post" }),
          U({ type: "page" })
        ]);
        await z(u, b, h, s);
      } catch (b) {
        console.error("[agentcms-rss] menu.json republish failed:", b);
      }
      x.success(t("actions.saved"));
    } finally {
      f(!1);
    }
  }
  async function le() {
    if (!n.baseUrl) {
      x.error(t("baseUrlMissing"));
      return;
    }
    C(!0);
    try {
      await D({ settings: n }), x.success(t("actions.xslUploaded"));
    } catch (o) {
      console.error("[agentcms-rss] xsl upload failed:", o), x.error(t("actions.xslFailed"));
    } finally {
      C(!1);
    }
  }
  async function de() {
    if (!n.baseUrl) {
      x.error(t("baseUrlMissing"));
      return;
    }
    k(!0);
    try {
      const o = await O({ prevConfig: e, nextConfig: i });
      await a(o.nextConfig), await D({ settings: n });
      const [u, b] = await Promise.all([
        U({ type: "post" }),
        U({ type: "page" })
      ]), h = await ae({
        posts: u,
        terms: s,
        media: d,
        settings: n,
        config: o.nextConfig
      });
      await a(h.nextConfig);
      const ce = {
        ...n,
        pluginConfigs: { ...n.pluginConfigs, "agentcms-rss": h.nextConfig }
      };
      try {
        await z(ce, u, b, s);
      } catch (ue) {
        console.error("[agentcms-rss] menu.json republish failed:", ue);
      }
      x.success(
        t("actions.regenerated", { count: h.result.uploaded.length + 1 })
      );
    } catch (o) {
      console.error("[agentcms-rss] regeneration failed:", o), x.error(t("actions.regenerateFailed"));
    } finally {
      k(!1);
    }
  }
  return /* @__PURE__ */ g("div", { className: "space-y-6", children: [
    /* @__PURE__ */ l("p", { className: "text-sm text-surface-600 dark:text-surface-300", children: t("description") }),
    /* @__PURE__ */ g("section", { className: "card p-4 space-y-4", children: [
      /* @__PURE__ */ l("h2", { className: "font-semibold", children: t("sections.site") }),
      /* @__PURE__ */ g("label", { className: "flex items-center gap-2", children: [
        /* @__PURE__ */ l(
          "input",
          {
            type: "checkbox",
            checked: i.site.enabled,
            onChange: (o) => L({ enabled: o.target.checked })
          }
        ),
        /* @__PURE__ */ l("span", { className: "text-sm font-medium", children: t("site.enabled") })
      ] }),
      /* @__PURE__ */ l("p", { className: "text-xs text-surface-500 dark:text-surface-400", children: t("site.enabledHelp") }),
      i.site.enabled && /* @__PURE__ */ g(ye, { children: [
        /* @__PURE__ */ g("div", { children: [
          /* @__PURE__ */ l("label", { className: "label", children: t("site.itemCount") }),
          /* @__PURE__ */ l(
            "input",
            {
              type: "number",
              className: "input max-w-xs",
              min: 1,
              max: 100,
              value: i.site.itemCount,
              onChange: (o) => L({
                itemCount: Math.max(1, Math.min(100, Number.parseInt(o.target.value, 10) || 20))
              })
            }
          ),
          /* @__PURE__ */ l("p", { className: "text-xs text-surface-500 mt-1 dark:text-surface-400", children: t("site.itemCountHelp") })
        ] }),
        /* @__PURE__ */ g("div", { children: [
          /* @__PURE__ */ l("p", { className: "label", children: t("site.excluded") }),
          /* @__PURE__ */ l("p", { className: "text-xs text-surface-500 mb-2 dark:text-surface-400", children: t("site.excludedHelp") }),
          r.length === 0 ? /* @__PURE__ */ l("p", { className: "text-xs italic text-surface-500 dark:text-surface-400", children: t("category.none") }) : /* @__PURE__ */ l("ul", { className: "space-y-1", children: r.map((o) => /* @__PURE__ */ l("li", { children: /* @__PURE__ */ g("label", { className: "flex items-center gap-2", children: [
            /* @__PURE__ */ l(
              "input",
              {
                type: "checkbox",
                checked: i.site.excludedTermIds.includes(o.id),
                onChange: () => re(o.id)
              }
            ),
            /* @__PURE__ */ l("span", { className: "text-sm", children: o.name }),
            /* @__PURE__ */ g("span", { className: "text-xs text-surface-400", children: [
              "/",
              o.slug
            ] })
          ] }) }, o.id)) })
        ] }),
        /* @__PURE__ */ g("label", { className: "flex items-center gap-2 pt-2 border-t border-surface-200 dark:border-surface-700", children: [
          /* @__PURE__ */ l(
            "input",
            {
              type: "checkbox",
              checked: i.site.addToFooter,
              onChange: (o) => L({ addToFooter: o.target.checked })
            }
          ),
          /* @__PURE__ */ l("span", { className: "text-sm font-medium", children: t("site.addToFooter") })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ g("section", { className: "card p-4 space-y-4", children: [
      /* @__PURE__ */ l("h2", { className: "font-semibold", children: t("sections.categoryFeeds") }),
      i.categoryFeeds.length === 0 ? /* @__PURE__ */ l("p", { className: "text-sm italic text-surface-500 dark:text-surface-400", children: t("category.none") }) : /* @__PURE__ */ l("ul", { className: "space-y-3", children: i.categoryFeeds.map((o) => {
        const u = r.find((h) => h.id === o.termId), b = u ? A(u.slug) : o.lastPublishedPath ?? "";
        return /* @__PURE__ */ g(
          "li",
          {
            className: "border border-surface-200 dark:border-surface-700 rounded-lg p-3 space-y-2",
            children: [
              /* @__PURE__ */ g("div", { className: "flex items-center justify-between gap-2", children: [
                /* @__PURE__ */ g("div", { className: "min-w-0", children: [
                  /* @__PURE__ */ l("p", { className: "font-medium", children: u ? u.name : `(missing: ${o.termId})` }),
                  b && /* @__PURE__ */ l("p", { className: "text-xs text-surface-500 dark:text-surface-400", children: t("category.pathHint", { path: b }) })
                ] }),
                /* @__PURE__ */ g(
                  "button",
                  {
                    type: "button",
                    className: "btn-ghost",
                    onClick: () => se(o.termId),
                    children: [
                      /* @__PURE__ */ l(Ke, { className: "h-4 w-4" }),
                      t("category.remove")
                    ]
                  }
                )
              ] }),
              /* @__PURE__ */ g("div", { className: "flex flex-wrap items-center gap-3", children: [
                /* @__PURE__ */ g("label", { className: "flex items-center gap-2 text-sm", children: [
                  /* @__PURE__ */ l("span", { children: t("category.itemCount") }),
                  /* @__PURE__ */ l(
                    "input",
                    {
                      type: "number",
                      className: "input w-24",
                      min: 1,
                      max: 100,
                      value: o.itemCount,
                      onChange: (h) => X(o.termId, {
                        itemCount: Math.max(
                          1,
                          Math.min(100, Number.parseInt(h.target.value, 10) || 20)
                        )
                      })
                    }
                  )
                ] }),
                /* @__PURE__ */ g("label", { className: "flex items-center gap-2 text-sm", children: [
                  /* @__PURE__ */ l(
                    "input",
                    {
                      type: "checkbox",
                      checked: o.addToFooter,
                      onChange: (h) => X(o.termId, { addToFooter: h.target.checked })
                    }
                  ),
                  /* @__PURE__ */ l("span", { children: t("category.addToFooter") })
                ] })
              ] })
            ]
          },
          o.termId
        );
      }) }),
      /* @__PURE__ */ g("div", { className: "pt-2 border-t border-surface-200 dark:border-surface-700", children: [
        /* @__PURE__ */ l("p", { className: "label", children: t("category.addLabel") }),
        /* @__PURE__ */ l(
          Ve,
          {
            options: P,
            placeholder: t("category.placeholder"),
            addLabel: t("category.add"),
            onAdd: ie
          }
        )
      ] })
    ] }),
    /* @__PURE__ */ g("section", { className: "card p-4 space-y-3", children: [
      /* @__PURE__ */ l("h2", { className: "font-semibold", children: t("sections.actions") }),
      /* @__PURE__ */ g("div", { className: "flex flex-wrap gap-2", children: [
        /* @__PURE__ */ g("button", { type: "button", className: "btn-primary", onClick: oe, disabled: c, children: [
          /* @__PURE__ */ l(M, { className: c ? "h-4 w-4 animate-spin" : "hidden" }),
          /* @__PURE__ */ l(Be, { className: c ? "hidden" : "h-4 w-4" }),
          /* @__PURE__ */ l("span", { children: t(c ? "actions.saving" : "actions.save") })
        ] }),
        /* @__PURE__ */ l(
          "button",
          {
            type: "button",
            className: "btn-ghost",
            onClick: le,
            disabled: m,
            children: /* @__PURE__ */ g("span", { className: "inline-flex items-center justify-center gap-1.5", children: [
              /* @__PURE__ */ l(M, { className: "h-4 w-4 animate-spin " + (m ? "" : "hidden") }),
              /* @__PURE__ */ l(Ge, { className: "h-4 w-4 " + (m ? "hidden" : "") }),
              /* @__PURE__ */ l("span", { children: t(m ? "actions.uploadingXsl" : "actions.uploadXsl") })
            ] })
          }
        ),
        /* @__PURE__ */ l(
          "button",
          {
            type: "button",
            className: "btn-secondary",
            onClick: de,
            disabled: S,
            children: /* @__PURE__ */ g("span", { className: "inline-flex items-center justify-center gap-1.5", children: [
              /* @__PURE__ */ l(M, { className: "h-4 w-4 animate-spin " + (S ? "" : "hidden") }),
              /* @__PURE__ */ l(Oe, { className: "h-4 w-4 " + (S ? "hidden" : "") }),
              /* @__PURE__ */ l("span", { children: t(S ? "actions.forceRegenerating" : "actions.forceRegenerate") })
            ] })
          }
        )
      ] })
    ] })
  ] });
}
function Ve({
  options: e,
  placeholder: a,
  addLabel: t,
  onAdd: n
}) {
  const [s, r] = T(null);
  return /* @__PURE__ */ g("div", { className: "flex flex-wrap items-start gap-2", children: [
    /* @__PURE__ */ l(
      be,
      {
        className: "flex-1 min-w-[260px]",
        options: e,
        value: s,
        onSelect: r,
        placeholder: a
      }
    ),
    /* @__PURE__ */ g(
      "button",
      {
        type: "button",
        className: "btn-secondary",
        disabled: !s,
        onClick: () => {
          s && (n(s), r(null));
        },
        children: [
          /* @__PURE__ */ l(We, { className: "h-4 w-4" }),
          t
        ]
      }
    )
  ] });
}
const _e = `# RSS

Publishes RSS 2.0 feeds so readers can follow your site in any feed reader (Feedly, NetNewsWire, Inoreader, …).

## What it does

Generates and maintains:

- **A site-wide feed** at \`/rss.xml\` — every published post in reverse chronological order, capped at the most recent 50 entries.
- **Optional per-category feeds** at \`/<category-slug>/<category-slug>.xml\` — each contains only posts whose primary category matches.

Each feed is served alongside an XSL stylesheet so opening the URL in a browser shows a friendly preview rather than raw XML. Posts with a hero image get an \`<enclosure>\` element so feed readers display the artwork.

Every published page also gets a \`<link rel="alternate" type="application/rss+xml">\` tag in its \`<head>\` pointing at the site feed (when enabled), so browsers and feed readers can discover it from any page URL. A category archive additionally advertises its own category feed once that feed has been uploaded. The links are absolute and follow the public site URL, sub-folder included — republish (Regenerate → All HTML) after enabling a feed so existing pages pick them up.

Item descriptions use the post's excerpt when set, otherwise an automatic plain-text summary truncated to ~300 characters.

The feeds re-publish only when an affected post changes — not on every publish action elsewhere on the site. A category feed only regenerates when one of its own posts is added/removed/edited.

## Settings

Reachable via **Plugins → Configure**.

- **Excluded categories** — pick categories whose posts shouldn't appear in the **site-wide** feed (they still appear in their own category feed). Useful for "drafts in public" or admin-only categories.
- **Per-category feeds** — pick which categories get their own feed. Each entry has an *Add to footer menu* checkbox: when enabled, the footer auto-grows a link to the feed (no MenusPage edit needed).
- **Force regenerate** — rebuilds every active feed from scratch. Run this after a bulk content reorganization or when a feed seems out of sync.

## Footer integration

Feeds with *Add to footer* checked appear at the end of the existing footer menu items. Each entry's label comes from the plugin (RSS for the site feed, "RSS — &lt;category&gt;" for category feeds). To use a custom label or a different position, leave the checkbox unchecked and add the URL by hand in **Menus** → Footer.

## Requirements

\`Settings → Site → Public site URL\` must be set — RSS feed URLs require an absolute origin. Empty base URL = silent no-op, same as the sitemap plugin.

## When to disable it

Disable if your site doesn't have a blog cadence (RSS only makes sense for chronologically updated content), or if you're publishing through a separate platform (Substack, Medium, …) that already provides feeds.
`, v = "agentcms-rss";
function $(e) {
  const a = (e.pluginConfigs ?? {})[v];
  return { ...j, ...a ?? {} };
}
async function I(e, a) {
  if (!a.settings.baseUrl) {
    console.warn("[agentcms-rss] skipping regeneration — baseUrl not configured");
    return;
  }
  const t = $(a.settings);
  if (!(!t.site.enabled && t.categoryFeeds.length === 0))
    try {
      const n = await ze({
        post: e,
        posts: a.posts,
        terms: a.terms,
        media: a.media,
        settings: a.settings,
        config: t
      });
      JSON.stringify(n.nextConfig) !== JSON.stringify(t) && await V(v, n.nextConfig);
    } catch (n) {
      console.error("[agentcms-rss] regeneration failed:", n);
    }
}
function Je(e, a) {
  const t = $(a.settings), n = (a.settings.baseUrl || "").replace(/\/+$/, "");
  if (!n) return e;
  const s = [], r = G.getResource(G.language, v, "footerLabels") ?? J.footerLabels;
  t.site.enabled && t.site.addToFooter && s.push({
    id: "rss-site",
    label: r.site,
    href: y(n, F)
  });
  for (const d of t.categoryFeeds) {
    if (!d.addToFooter) continue;
    const i = a.terms.find((c) => c.id === d.termId && c.type === "category");
    if (!i) continue;
    const p = y(n, A(i.slug));
    q(i), s.push({
      id: `rss-cat-${i.id}`,
      // i18next interpolation is only available through t(), and at this
      // point we don't hold a t() instance — so a tiny manual replace
      // keeps the dependency footprint flat.
      label: r.category.replace("{{name}}", i.name),
      href: p
    });
  }
  return s.length === 0 ? e : { ...e, footer: [...e.footer, ...s] };
}
const tt = {
  id: v,
  name: "RSS",
  version: "1.1.0",
  author: "AgentCMS",
  description: "Generates an RSS 2.0 feed at /rss.xml plus optional per-category feeds, and can list them in the site footer.",
  readme: _e,
  i18n: { en: J, fr: ve, de: Re, es: we, nl: Ce, pt: ke, ko: Te },
  settings: {
    navLabelKey: "title",
    defaultConfig: j,
    component: qe
  },
  register(e) {
    e.addAction("publish.complete", async (a, t) => {
      await I(a, t);
    }), e.addAction("post.unpublished", async (a, t) => {
      await I(a, t);
    }), e.addAction("post.deleted", async (a, t) => {
      await I(a, t);
    }), e.addFilter("menu.json.resolved", (a, ...t) => {
      const n = t[0];
      return n ? Je(a, n) : a;
    }), e.addFilter("page.head.extra", (a, ...t) => {
      const n = t[0];
      if (!(n != null && n.site)) return a;
      const s = De(n);
      return s ? a ? `${a}
${s}` : s : a;
    }), e.registerRegenerationTarget({
      id: v,
      labelKey: "regenerationTarget.label",
      descriptionKey: "regenerationTarget.description",
      priority: 210,
      run: async (a, t) => {
        if (!a.settings.baseUrl) {
          t({ level: "warn", message: "[agentcms-rss] skipped — site URL not set." });
          return;
        }
        const n = $(a.settings);
        t({ level: "info", message: "Regenerating RSS stylesheet…" }), await D({ settings: a.settings }), t({ level: "info", message: "Regenerating RSS feeds…" });
        const s = await ae({
          posts: a.posts,
          terms: a.terms,
          media: a.media,
          settings: a.settings,
          config: n
        });
        JSON.stringify(s.nextConfig) !== JSON.stringify(n) && await V(v, s.nextConfig);
        try {
          const i = {
            ...a.settings,
            pluginConfigs: { ...a.settings.pluginConfigs, [v]: s.nextConfig }
          };
          await z(i, a.posts, a.pages, a.terms);
        } catch (i) {
          t({ level: "warn", message: `menu.json republish failed: ${i.message}` });
        }
        const r = s.result.uploaded.length, d = s.result.deleted.length;
        t({
          level: "success",
          message: (r ? `RSS: stylesheet + ${r} feed(s) uploaded` : "RSS: stylesheet uploaded; no feed is enabled") + (d ? `, ${d} disabled feed(s) removed.` : ".")
        });
      }
    });
  }
};
export {
  tt as manifest
};
