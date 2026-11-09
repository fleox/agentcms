import { pickPublicLocale as me, deleteFile as M, uploadFile as T, pathToPublicUrl as N, applyFiltersSync as E, applyFilters as ue, basePathFromBaseUrl as ee, buildTermUrl as he, buildPostUrl as ge, canonicalUrl as fe, useCmsData as be, toast as A, fetchAllPosts as K } from "@agent-cms/runtime";
import { jsxs as f, jsx as p } from "react/jsx-runtime";
import { forwardRef as te, createElement as B, useState as U, useEffect as we } from "react";
import { useTranslation as xe } from "react-i18next";
const ye = {
  title: "Sitemaps",
  description: "Generates sitemaps/sitemap-<year>.xml files, a sitemaps/sitemap-index.xml referencing them, an optional sitemaps/sitemap-news.xml, and a customizable robots.txt at the site root.",
  regenerationTarget: {
    label: "Sitemaps",
    description: "Yearly + index sitemaps under /sitemaps/, robots.txt, XSL stylesheets"
  },
  sections: {
    general: "General",
    robots: "robots.txt",
    actions: "Regeneration"
  },
  xsl: {
    help: "XSL stylesheets style the sitemaps when opened in a browser. Re-upload after changing the public site language.",
    upload: "Upload stylesheets",
    uploading: "Uploading…",
    uploaded: "Uploaded {{count}} stylesheet(s).",
    failed: "Stylesheet upload failed."
  },
  contentTypes: {
    label: "Content types in sitemaps",
    posts: "Posts only",
    postsPages: "Posts and pages"
  },
  archives: {
    enabled: "List the home page and categories",
    enabledHelp: "Publishes sitemap-archives.xml with the home page and every category archive that has online posts."
  },
  news: {
    enabled: "Generate sitemap-news.xml",
    enabledHelp: "Enable to publish a Google News sitemap alongside the index.",
    windowDays: "News window (days)",
    windowDaysHelp: "Articles modified within this many days appear in sitemap-news.xml. Google recommends 2."
  },
  robots: {
    label: "robots.txt content",
    help: "Leave empty to use a generated default that points to your sitemaps/sitemap-index.xml (and sitemaps/sitemap-news.xml when News is enabled).",
    resetDefault: "Insert default",
    saveAndRegenerate: "Save & regenerate robots.txt",
    saving: "Saving…",
    saved: "robots.txt saved and regenerated."
  },
  saveSettings: "Save settings",
  saved: "Settings saved.",
  forceRegenerate: "Force regenerate sitemaps",
  forceRegenerating: "Regenerating…",
  regenerated: "Sitemaps regenerated.",
  regenerateFailed: "Sitemap regeneration failed.",
  baseUrlMissing: "Set the public site URL in Settings → General before regenerating sitemaps.",
  uploaded: "Uploaded {{count}} files."
}, ve = {
  title: "Sitemaps",
  description: "Génère les fichiers sitemaps/sitemap-<année>.xml, un sitemaps/sitemap-index.xml qui les référence, un sitemaps/sitemap-news.xml optionnel, et un robots.txt personnalisable à la racine du site.",
  regenerationTarget: {
    label: "Sitemaps",
    description: "Sitemaps annuels + index sous /sitemaps/, robots.txt, feuilles XSL"
  },
  sections: {
    general: "Général",
    robots: "robots.txt",
    actions: "Régénération"
  },
  xsl: {
    help: "Les feuilles de style XSL habillent les sitemaps quand on les ouvre dans un navigateur. À ré-envoyer après un changement de langue du site public.",
    upload: "Envoyer les feuilles de style",
    uploading: "Envoi…",
    uploaded: "{{count}} feuille(s) de style envoyée(s).",
    failed: "Échec de l'envoi des feuilles de style."
  },
  contentTypes: {
    label: "Types de contenu dans les sitemaps",
    posts: "Articles uniquement",
    postsPages: "Articles et pages"
  },
  archives: {
    enabled: "Lister l'accueil et les catégories",
    enabledHelp: "Publie sitemap-archives.xml avec la page d'accueil et chaque archive de catégorie contenant des articles en ligne."
  },
  news: {
    enabled: "Générer sitemap-news.xml",
    enabledHelp: "Activez pour publier un sitemap Google News à côté de l'index.",
    windowDays: "Fenêtre News (jours)",
    windowDaysHelp: "Les articles modifiés dans cet intervalle apparaissent dans sitemap-news.xml. Google recommande 2."
  },
  robots: {
    label: "Contenu de robots.txt",
    help: "Laissez vide pour utiliser un robots.txt par défaut généré, qui pointe vers votre sitemaps/sitemap-index.xml (et sitemaps/sitemap-news.xml si News est activé).",
    resetDefault: "Insérer le défaut",
    saveAndRegenerate: "Enregistrer & régénérer robots.txt",
    saving: "Enregistrement…",
    saved: "robots.txt enregistré et régénéré."
  },
  saveSettings: "Enregistrer les réglages",
  saved: "Réglages enregistrés.",
  forceRegenerate: "Forcer la régénération",
  forceRegenerating: "Régénération…",
  regenerated: "Sitemaps régénérés.",
  regenerateFailed: "Échec de la régénération des sitemaps.",
  baseUrlMissing: "Définissez l'URL publique du site dans Réglages → Général avant de régénérer les sitemaps.",
  uploaded: "{{count}} fichiers envoyés."
}, Se = {
  title: "Sitemaps",
  description: "Erzeugt sitemaps/sitemap-<Jahr>.xml-Dateien, eine sitemaps/sitemap-index.xml, die darauf verweist, eine optionale sitemaps/sitemap-news.xml und eine anpassbare robots.txt im Site-Root.",
  regenerationTarget: {
    label: "Sitemaps",
    description: "Jährliche + Index-Sitemaps unter /sitemaps/, robots.txt, XSL-Stylesheets"
  },
  sections: {
    general: "Allgemein",
    robots: "robots.txt",
    actions: "Neuerzeugung"
  },
  xsl: {
    help: "XSL-Stylesheets stylen die Sitemaps, wenn sie im Browser geöffnet werden. Nach Änderung der öffentlichen Website-Sprache erneut hochladen.",
    upload: "Stylesheets hochladen",
    uploading: "Lädt hoch…",
    uploaded: "{{count}} Stylesheet(s) hochgeladen.",
    failed: "Stylesheet-Upload fehlgeschlagen."
  },
  contentTypes: {
    label: "Inhaltstypen in Sitemaps",
    posts: "Nur Artikel",
    postsPages: "Artikel und Seiten"
  },
  archives: {
    enabled: "Startseite und Kategorien aufnehmen",
    enabledHelp: "Veröffentlicht sitemap-archives.xml mit der Startseite und jedem Kategoriearchiv, das online Beiträge enthält."
  },
  news: {
    enabled: "sitemap-news.xml erzeugen",
    enabledHelp: "Aktivieren, um eine Google-News-Sitemap neben dem Index zu veröffentlichen.",
    windowDays: "News-Fenster (Tage)",
    windowDaysHelp: "Artikel, die innerhalb dieser Anzahl von Tagen geändert wurden, erscheinen in sitemap-news.xml. Google empfiehlt 2."
  },
  robots: {
    label: "Inhalt der robots.txt",
    help: "Leer lassen, um eine erzeugte Standard-Datei zu verwenden, die auf Ihre sitemaps/sitemap-index.xml (und sitemaps/sitemap-news.xml bei aktivierter News-Sitemap) verweist.",
    resetDefault: "Standard einfügen",
    saveAndRegenerate: "Speichern & robots.txt neu erzeugen",
    saving: "Speichert…",
    saved: "robots.txt gespeichert und neu erzeugt."
  },
  saveSettings: "Einstellungen speichern",
  saved: "Einstellungen gespeichert.",
  forceRegenerate: "Sitemaps zwangsweise neu erzeugen",
  forceRegenerating: "Neu erzeugen…",
  regenerated: "Sitemaps neu erzeugt.",
  regenerateFailed: "Sitemap-Neuerzeugung fehlgeschlagen.",
  baseUrlMissing: "Legen Sie die öffentliche Website-URL unter Einstellungen → Allgemein fest, bevor Sie Sitemaps neu erzeugen.",
  uploaded: "{{count}} Dateien hochgeladen."
}, Le = {
  title: "Sitemaps",
  description: "Genera archivos sitemaps/sitemap-<año>.xml, un sitemaps/sitemap-index.xml que los referencia, un sitemaps/sitemap-news.xml opcional y un robots.txt personalizable en la raíz del sitio.",
  regenerationTarget: {
    label: "Sitemaps",
    description: "Sitemaps anuales + índice bajo /sitemaps/, robots.txt, hojas XSL"
  },
  sections: {
    general: "General",
    robots: "robots.txt",
    actions: "Regeneración"
  },
  xsl: {
    help: "Las hojas de estilo XSL dan formato a los sitemaps cuando se abren en un navegador. Vuelve a subirlas tras cambiar el idioma del sitio público.",
    upload: "Subir hojas de estilo",
    uploading: "Subiendo…",
    uploaded: "Subidas {{count}} hoja(s) de estilo.",
    failed: "Error al subir las hojas de estilo."
  },
  contentTypes: {
    label: "Tipos de contenido en sitemaps",
    posts: "Solo entradas",
    postsPages: "Entradas y páginas"
  },
  archives: {
    enabled: "Incluir la portada y las categorías",
    enabledHelp: "Publica sitemap-archives.xml con la portada y cada archivo de categoría que tenga entradas publicadas."
  },
  news: {
    enabled: "Generar sitemap-news.xml",
    enabledHelp: "Actívalo para publicar un sitemap de Google News junto al índice.",
    windowDays: "Ventana News (días)",
    windowDaysHelp: "Los artículos modificados en este número de días aparecen en sitemap-news.xml. Google recomienda 2."
  },
  robots: {
    label: "Contenido de robots.txt",
    help: "Déjalo vacío para usar un valor por defecto generado que apunta a tu sitemaps/sitemap-index.xml (y a sitemaps/sitemap-news.xml si News está activado).",
    resetDefault: "Insertar por defecto",
    saveAndRegenerate: "Guardar y regenerar robots.txt",
    saving: "Guardando…",
    saved: "robots.txt guardado y regenerado."
  },
  saveSettings: "Guardar ajustes",
  saved: "Ajustes guardados.",
  forceRegenerate: "Forzar regeneración",
  forceRegenerating: "Regenerando…",
  regenerated: "Sitemaps regenerados.",
  regenerateFailed: "La regeneración de sitemaps falló.",
  baseUrlMissing: "Define la URL pública del sitio en Ajustes → General antes de regenerar los sitemaps.",
  uploaded: "{{count}} archivos subidos."
}, Ae = {
  title: "Sitemaps",
  description: "Genereert sitemaps/sitemap-<jaar>.xml-bestanden, een sitemaps/sitemap-index.xml die ernaar verwijst, een optionele sitemaps/sitemap-news.xml en een aanpasbare robots.txt in de site-root.",
  regenerationTarget: {
    label: "Sitemaps",
    description: "Jaarlijkse + index-sitemaps onder /sitemaps/, robots.txt, XSL-stylesheets"
  },
  sections: {
    general: "Algemeen",
    robots: "robots.txt",
    actions: "Regeneratie"
  },
  xsl: {
    help: "XSL-stylesheets geven sitemaps stijl wanneer ze in een browser worden geopend. Upload opnieuw na het wijzigen van de publieke sitetaal.",
    upload: "Stylesheets uploaden",
    uploading: "Uploaden…",
    uploaded: "{{count}} stylesheet(s) geüpload.",
    failed: "Stylesheet-upload mislukt."
  },
  contentTypes: {
    label: "Inhoudstypes in sitemaps",
    posts: "Alleen berichten",
    postsPages: "Berichten en pagina's"
  },
  archives: {
    enabled: "Startpagina en categorieën opnemen",
    enabledHelp: "Publiceert sitemap-archives.xml met de startpagina en elk categoriearchief met online berichten."
  },
  news: {
    enabled: "sitemap-news.xml genereren",
    enabledHelp: "Inschakelen om een Google News-sitemap naast de index te publiceren.",
    windowDays: "News-venster (dagen)",
    windowDaysHelp: "Artikelen die binnen dit aantal dagen zijn gewijzigd verschijnen in sitemap-news.xml. Google adviseert 2."
  },
  robots: {
    label: "Inhoud van robots.txt",
    help: "Laat leeg om een gegenereerde standaard te gebruiken die wijst naar je sitemaps/sitemap-index.xml (en sitemaps/sitemap-news.xml wanneer News is ingeschakeld).",
    resetDefault: "Standaard invoegen",
    saveAndRegenerate: "Opslaan & robots.txt opnieuw genereren",
    saving: "Opslaan…",
    saved: "robots.txt opgeslagen en opnieuw gegenereerd."
  },
  saveSettings: "Instellingen opslaan",
  saved: "Instellingen opgeslagen.",
  forceRegenerate: "Sitemaps forceren te regenereren",
  forceRegenerating: "Regenereren…",
  regenerated: "Sitemaps geregenereerd.",
  regenerateFailed: "Sitemap-regeneratie mislukt.",
  baseUrlMissing: "Stel de publieke site-URL in via Instellingen → Algemeen voordat je sitemaps regenereert.",
  uploaded: "{{count}} bestanden geüpload."
}, Te = {
  title: "Sitemaps",
  description: "Gera ficheiros sitemaps/sitemap-<ano>.xml, um sitemaps/sitemap-index.xml que os referencia, um sitemaps/sitemap-news.xml opcional e um robots.txt personalizável na raiz do site.",
  regenerationTarget: {
    label: "Sitemaps",
    description: "Sitemaps anuais + índice em /sitemaps/, robots.txt, folhas XSL"
  },
  sections: {
    general: "Geral",
    robots: "robots.txt",
    actions: "Regeneração"
  },
  xsl: {
    help: "As folhas de estilo XSL formatam os sitemaps quando abertos num browser. Reenviar após alterar o idioma do site público.",
    upload: "Enviar folhas de estilo",
    uploading: "A enviar…",
    uploaded: "Enviadas {{count}} folha(s) de estilo.",
    failed: "Falha ao enviar folhas de estilo."
  },
  contentTypes: {
    label: "Tipos de conteúdo nos sitemaps",
    posts: "Apenas artigos",
    postsPages: "Artigos e páginas"
  },
  archives: {
    enabled: "Incluir a página inicial e as categorias",
    enabledHelp: "Publica sitemap-archives.xml com a página inicial e cada arquivo de categoria que tenha artigos publicados."
  },
  news: {
    enabled: "Gerar sitemap-news.xml",
    enabledHelp: "Ativa para publicar um sitemap Google News ao lado do índice.",
    windowDays: "Janela News (dias)",
    windowDaysHelp: "Os artigos modificados neste número de dias aparecem em sitemap-news.xml. O Google recomenda 2."
  },
  robots: {
    label: "Conteúdo do robots.txt",
    help: "Deixa vazio para usar um valor predefinido gerado que aponta para o teu sitemaps/sitemap-index.xml (e sitemaps/sitemap-news.xml quando o News está ativo).",
    resetDefault: "Inserir predefinido",
    saveAndRegenerate: "Guardar e regenerar robots.txt",
    saving: "A guardar…",
    saved: "robots.txt guardado e regenerado."
  },
  saveSettings: "Guardar definições",
  saved: "Definições guardadas.",
  forceRegenerate: "Forçar regeneração",
  forceRegenerating: "A regenerar…",
  regenerated: "Sitemaps regenerados.",
  regenerateFailed: "Falha na regeneração de sitemaps.",
  baseUrlMissing: "Define o URL público do site em Definições → Geral antes de regenerar sitemaps.",
  uploaded: "{{count}} ficheiros enviados."
}, Ne = {
  title: "사이트맵",
  description: "sitemaps/sitemap-<연도>.xml 파일, 이를 참조하는 sitemaps/sitemap-index.xml, 선택적 sitemaps/sitemap-news.xml 및 사이트 루트의 사용자 정의 가능한 robots.txt를 생성합니다.",
  regenerationTarget: {
    label: "사이트맵",
    description: "/sitemaps/ 아래의 연도별 + 인덱스 사이트맵, robots.txt, XSL 스타일시트"
  },
  sections: {
    general: "일반",
    robots: "robots.txt",
    actions: "재생성"
  },
  xsl: {
    help: "XSL 스타일시트는 브라우저에서 사이트맵을 열 때 스타일을 적용합니다. 공개 사이트 언어를 변경한 후 다시 업로드하세요.",
    upload: "스타일시트 업로드",
    uploading: "업로드 중…",
    uploaded: "{{count}}개의 스타일시트를 업로드했습니다.",
    failed: "스타일시트 업로드에 실패했습니다."
  },
  contentTypes: {
    label: "사이트맵에 포함할 콘텐츠 유형",
    posts: "게시물만",
    postsPages: "게시물 및 페이지"
  },
  archives: {
    enabled: "홈과 카테고리 포함",
    enabledHelp: "홈 페이지와 게시된 글이 있는 모든 카테고리 아카이브를 담은 sitemap-archives.xml을 게시합니다."
  },
  news: {
    enabled: "sitemap-news.xml 생성",
    enabledHelp: "활성화하면 인덱스 옆에 Google News 사이트맵을 게시합니다.",
    windowDays: "News 기간 (일)",
    windowDaysHelp: "지정한 일수 내에 수정된 기사는 sitemap-news.xml에 포함됩니다. Google은 2일을 권장합니다."
  },
  robots: {
    label: "robots.txt 내용",
    help: "비워 두면 sitemaps/sitemap-index.xml(및 News가 활성화된 경우 sitemaps/sitemap-news.xml)을 가리키는 기본값이 사용됩니다.",
    resetDefault: "기본값 삽입",
    saveAndRegenerate: "저장 및 robots.txt 재생성",
    saving: "저장 중…",
    saved: "robots.txt가 저장되고 재생성되었습니다."
  },
  saveSettings: "설정 저장",
  saved: "설정이 저장되었습니다.",
  forceRegenerate: "사이트맵 강제 재생성",
  forceRegenerating: "재생성 중…",
  regenerated: "사이트맵이 재생성되었습니다.",
  regenerateFailed: "사이트맵 재생성에 실패했습니다.",
  baseUrlMissing: "사이트맵을 재생성하기 전에 설정 → 일반에서 공개 사이트 URL을 설정하세요.",
  uploaded: "{{count}}개의 파일을 업로드했습니다."
}, _ = "sitemaps/sitemap.xsl", D = "sitemaps/sitemap-news.xsl", se = {
  en: {
    pageTitle: "XML Sitemap",
    heading: "XML Sitemap",
    meta: "This XML sitemap is meant for consumption by search engines.",
    indexCountBefore: "This index references ",
    indexCountAfter: " sitemaps.",
    urlCountBefore: "This sitemap contains ",
    urlCountAfter: " URLs.",
    newsCountBefore: "This News sitemap contains ",
    newsCountAfter: " articles.",
    newsHeading: "XML News Sitemap",
    newsPageTitle: "XML News Sitemap",
    columnSitemap: "Sitemap URL",
    columnUrl: "URL",
    columnLastmod: "Last modified",
    columnTitle: "Title",
    columnPubdate: "Publication date"
  },
  fr: {
    pageTitle: "Plan du site XML",
    heading: "Plan du site XML",
    meta: "Ce sitemap XML est destiné aux moteurs de recherche.",
    indexCountBefore: "Cet index référence ",
    indexCountAfter: " sitemaps.",
    urlCountBefore: "Ce sitemap contient ",
    urlCountAfter: " URLs.",
    newsCountBefore: "Ce sitemap News contient ",
    newsCountAfter: " articles.",
    newsHeading: "Plan du site XML News",
    newsPageTitle: "Plan du site XML News",
    columnSitemap: "URL du sitemap",
    columnUrl: "URL",
    columnLastmod: "Dernière modification",
    columnTitle: "Titre",
    columnPubdate: "Date de publication"
  },
  de: {
    pageTitle: "XML-Sitemap",
    heading: "XML-Sitemap",
    meta: "Diese XML-Sitemap ist für Suchmaschinen bestimmt.",
    indexCountBefore: "Dieser Index verweist auf ",
    indexCountAfter: " Sitemaps.",
    urlCountBefore: "Diese Sitemap enthält ",
    urlCountAfter: " URLs.",
    newsCountBefore: "Diese News-Sitemap enthält ",
    newsCountAfter: " Artikel.",
    newsHeading: "XML News-Sitemap",
    newsPageTitle: "XML News-Sitemap",
    columnSitemap: "Sitemap-URL",
    columnUrl: "URL",
    columnLastmod: "Zuletzt geändert",
    columnTitle: "Titel",
    columnPubdate: "Veröffentlichungsdatum"
  },
  es: {
    pageTitle: "Sitemap XML",
    heading: "Sitemap XML",
    meta: "Este sitemap XML está destinado a los motores de búsqueda.",
    indexCountBefore: "Este índice referencia ",
    indexCountAfter: " sitemaps.",
    urlCountBefore: "Este sitemap contiene ",
    urlCountAfter: " URLs.",
    newsCountBefore: "Este sitemap News contiene ",
    newsCountAfter: " artículos.",
    newsHeading: "Sitemap XML News",
    newsPageTitle: "Sitemap XML News",
    columnSitemap: "URL del sitemap",
    columnUrl: "URL",
    columnLastmod: "Última modificación",
    columnTitle: "Título",
    columnPubdate: "Fecha de publicación"
  },
  nl: {
    pageTitle: "XML-sitemap",
    heading: "XML-sitemap",
    meta: "Deze XML-sitemap is bedoeld voor gebruik door zoekmachines.",
    indexCountBefore: "Deze index verwijst naar ",
    indexCountAfter: " sitemaps.",
    urlCountBefore: "Deze sitemap bevat ",
    urlCountAfter: " URLs.",
    newsCountBefore: "Deze News-sitemap bevat ",
    newsCountAfter: " artikelen.",
    newsHeading: "XML News-sitemap",
    newsPageTitle: "XML News-sitemap",
    columnSitemap: "Sitemap-URL",
    columnUrl: "URL",
    columnLastmod: "Laatst gewijzigd",
    columnTitle: "Titel",
    columnPubdate: "Publicatiedatum"
  },
  pt: {
    pageTitle: "Sitemap XML",
    heading: "Sitemap XML",
    meta: "Este sitemap XML destina-se aos motores de busca.",
    indexCountBefore: "Este índice referencia ",
    indexCountAfter: " sitemaps.",
    urlCountBefore: "Este sitemap contém ",
    urlCountAfter: " URLs.",
    newsCountBefore: "Este sitemap News contém ",
    newsCountAfter: " artigos.",
    newsHeading: "Sitemap XML News",
    newsPageTitle: "Sitemap XML News",
    columnSitemap: "URL do sitemap",
    columnUrl: "URL",
    columnLastmod: "Última modificação",
    columnTitle: "Título",
    columnPubdate: "Data de publicação"
  },
  ko: {
    pageTitle: "XML 사이트맵",
    heading: "XML 사이트맵",
    meta: "이 XML 사이트맵은 검색 엔진을 위한 것입니다.",
    indexCountBefore: "이 인덱스는 ",
    indexCountAfter: "개의 사이트맵을 참조합니다.",
    urlCountBefore: "이 사이트맵에는 ",
    urlCountAfter: "개의 URL이 포함되어 있습니다.",
    newsCountBefore: "이 News 사이트맵에는 ",
    newsCountAfter: "개의 기사가 포함되어 있습니다.",
    newsHeading: "XML News 사이트맵",
    newsPageTitle: "XML News 사이트맵",
    columnSitemap: "사이트맵 URL",
    columnUrl: "URL",
    columnLastmod: "마지막 수정일",
    columnTitle: "제목",
    columnPubdate: "게시일"
  }
};
function ae(t) {
  return me(t);
}
const ne = `
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
.url { word-break: break-all; }
.lastmod, .pubdate { white-space: nowrap; color: #4b5563; width: 220px; }
`;
function Me(t) {
  const s = ae(t), e = se[s];
  return `<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="1.0"
  xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
  xmlns:s="http://www.sitemaps.org/schemas/sitemap/0.9"
  exclude-result-prefixes="s">
  <xsl:output method="html" version="1.0" encoding="UTF-8" indent="yes"
              doctype-system="about:legacy-compat"/>
  <xsl:template match="/">
    <html lang="${s}">
      <head>
        <title>${e.pageTitle}</title>
        <meta charset="utf-8"/>
        <meta name="robots" content="noindex,follow"/>
        <meta name="viewport" content="width=device-width, initial-scale=1"/>
        <style type="text/css">${ne}</style>
      </head>
      <body>
        <main>
          <h1>${e.heading}</h1>
          <p class="meta">${e.meta}</p>
          <xsl:choose>
            <xsl:when test="s:sitemapindex">
              <p class="count">${e.indexCountBefore}<xsl:value-of select="count(s:sitemapindex/s:sitemap)"/>${e.indexCountAfter}</p>
              <table>
                <thead><tr><th>${e.columnSitemap}</th><th>${e.columnLastmod}</th></tr></thead>
                <tbody>
                  <xsl:for-each select="s:sitemapindex/s:sitemap">
                    <tr>
                      <td class="url"><a href="{s:loc}"><xsl:value-of select="s:loc"/></a></td>
                      <td class="lastmod"><xsl:value-of select="s:lastmod"/></td>
                    </tr>
                  </xsl:for-each>
                </tbody>
              </table>
            </xsl:when>
            <xsl:when test="s:urlset">
              <p class="count">${e.urlCountBefore}<xsl:value-of select="count(s:urlset/s:url)"/>${e.urlCountAfter}</p>
              <table>
                <thead><tr><th>${e.columnUrl}</th><th>${e.columnLastmod}</th></tr></thead>
                <tbody>
                  <xsl:for-each select="s:urlset/s:url">
                    <tr>
                      <td class="url"><a href="{s:loc}"><xsl:value-of select="s:loc"/></a></td>
                      <td class="lastmod"><xsl:value-of select="s:lastmod"/></td>
                    </tr>
                  </xsl:for-each>
                </tbody>
              </table>
            </xsl:when>
          </xsl:choose>
        </main>
      </body>
    </html>
  </xsl:template>
</xsl:stylesheet>`;
}
function Re(t) {
  const s = ae(t), e = se[s];
  return `<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="1.0"
  xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
  xmlns:s="http://www.sitemaps.org/schemas/sitemap/0.9"
  xmlns:n="http://www.google.com/schemas/sitemap-news/0.9"
  exclude-result-prefixes="s n">
  <xsl:output method="html" version="1.0" encoding="UTF-8" indent="yes"
              doctype-system="about:legacy-compat"/>
  <xsl:template match="/">
    <html lang="${s}">
      <head>
        <title>${e.newsPageTitle}</title>
        <meta charset="utf-8"/>
        <meta name="robots" content="noindex,follow"/>
        <meta name="viewport" content="width=device-width, initial-scale=1"/>
        <style type="text/css">${ne}</style>
      </head>
      <body>
        <main>
          <h1>${e.newsHeading}</h1>
          <p class="meta">${e.meta}</p>
          <p class="count">${e.newsCountBefore}<xsl:value-of select="count(s:urlset/s:url)"/>${e.newsCountAfter}</p>
          <table>
            <thead><tr><th>${e.columnTitle}</th><th>${e.columnPubdate}</th></tr></thead>
            <tbody>
              <xsl:for-each select="s:urlset/s:url">
                <tr>
                  <td class="url"><a href="{s:loc}"><xsl:value-of select="n:news/n:title"/></a></td>
                  <td class="pubdate"><xsl:value-of select="n:news/n:publication_date"/></td>
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
const ie = {
  newsEnabled: !1,
  newsWindowDays: 2,
  contentTypes: "posts-pages",
  archivesEnabled: !0,
  robotsTxt: ""
}, H = "sitemaps", q = `${H}/sitemap-index.xml`, R = `${H}/sitemap-news.xml`, k = `${H}/sitemap-archives.xml`, Ce = "robots.txt";
function oe(t) {
  return `${H}/sitemap-${t}.xml`;
}
const le = [
  "sitemap-index.xml",
  "sitemap-news.xml",
  "sitemap.xsl",
  "sitemap-news.xsl"
];
function Ue(t) {
  return `sitemap-${t}.xml`;
}
function $(t, s) {
  const e = ["User-agent: *", "Allow: /", `Disallow: ${ee(t)}/admin/`, ""];
  return t && (e.push(`Sitemap: ${N(t, q)}`), s && e.push(`Sitemap: ${N(t, R)}`)), e.join(`
`) + `
`;
}
const O = "index.html";
function De(t, s) {
  return t.type === "page" && s.homeMode === "static-page" && !!s.homePageId && s.homePageId === t.id;
}
function I(t, s) {
  return fe(t, s);
}
function J(t, s, e) {
  var r, i, n, d, c, m;
  let a;
  try {
    const g = t.primaryTermId ? s.find((h) => h.id === t.primaryTermId) : void 0;
    a = De(t, e) ? O : ge({ post: t, primaryTerm: g });
  } catch {
    return null;
  }
  const l = ((i = (r = t.createdAt) == null ? void 0 : r.toMillis) == null ? void 0 : i.call(r)) ?? ((d = (n = t.publishedAt) == null ? void 0 : n.toMillis) == null ? void 0 : d.call(n)) ?? Date.now(), o = ((m = (c = t.updatedAt) == null ? void 0 : c.toMillis) == null ? void 0 : m.call(c)) ?? l;
  return {
    path: a,
    createdAtMs: l,
    updatedAtMs: o,
    title: t.title || t.slug,
    sourcePost: t
  };
}
function ke(t, s, e, a, l) {
  const o = [];
  for (const r of t) {
    if (r.status !== "online") continue;
    const i = J(r, e, a);
    i && o.push(i);
  }
  if (l.contentTypes === "posts-pages")
    for (const r of s) {
      if (r.status !== "online") continue;
      const i = J(r, e, a);
      i && o.push(i);
    }
  return o;
}
function Pe(t, s, e, a) {
  const l = t.filter((n) => n.status === "online");
  if (l.length === 0) return [];
  const o = (n) => {
    var d, c, m, g, h, S;
    return ((c = (d = n.updatedAt) == null ? void 0 : d.toMillis) == null ? void 0 : c.call(d)) ?? ((g = (m = n.publishedAt) == null ? void 0 : m.toMillis) == null ? void 0 : g.call(m)) ?? ((S = (h = n.createdAt) == null ? void 0 : h.toMillis) == null ? void 0 : S.call(h)) ?? 0;
  }, r = (n) => Math.max(...n.map(o)), i = [];
  if (!a.some((n) => n.path === O)) {
    const n = r(l);
    i.push({ path: O, createdAtMs: n, updatedAtMs: n, title: e.title || "" });
  }
  for (const n of s) {
    if (n.type !== "category") continue;
    const d = l.filter((g) => {
      var h;
      return g.primaryTermId === n.id || ((h = g.termIds) == null ? void 0 : h.includes(n.id));
    });
    if (d.length === 0) continue;
    let c;
    try {
      c = he(n);
    } catch {
      continue;
    }
    const m = r(d);
    i.push({ path: c, createdAtMs: m, updatedAtMs: m, title: n.name });
  }
  return i;
}
function Xe(t, s, e) {
  const a = [G(e), '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">'];
  for (const l of t)
    a.push("  <url>"), a.push(`    <loc>${b(I(s, l.path))}</loc>`), a.push(`    <lastmod>${P(l.updatedAtMs)}</lastmod>`), a.push("  </url>");
  return a.push("</urlset>"), a.join(`
`);
}
function Ee(t) {
  const s = /* @__PURE__ */ new Map();
  for (const e of t) {
    const a = new Date(e.createdAtMs).getUTCFullYear(), l = s.get(a) ?? [];
    l.push(e), s.set(a, l);
  }
  return s;
}
function b(t) {
  return t.replace(/[&<>"']/g, (s) => {
    switch (s) {
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
function $e(t) {
  return new Date(t).toISOString();
}
function P(t) {
  return new Date(t).toISOString().slice(0, 10);
}
function G(t) {
  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    `<?xml-stylesheet type="text/xsl" href="${b(t)}"?>`
  ].join(`
`);
}
function Ie(t, s, e, a, l, o) {
  const r = E(
    "sitemap.urlset.namespaces",
    {},
    { kind: "year", baseUrl: a }
  ), i = Object.entries(r).map(([d, c]) => ` ${b(d)}="${b(c)}"`).join(""), n = [
    G(l),
    `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"${i}>`
  ];
  for (const d of t) {
    const c = E(
      "sitemap.url.entry",
      "",
      // `terms` + `settings` let handlers (multilang alternates) resolve
      // localised paths without relying on module-level snapshots.
      { entity: d.sourcePost, baseUrl: a, path: d.path, lastmodMs: d.updatedAtMs, terms: s, settings: e }
    );
    n.push("  <url>"), n.push(`    <loc>${b(I(a, d.path))}</loc>`), n.push(`    <lastmod>${P(d.updatedAtMs)}</lastmod>`), c && n.push(c), n.push("  </url>");
  }
  for (const d of o) {
    const c = d.lastmodMs ?? Date.now();
    n.push("  <url>"), n.push(`    <loc>${b(I(a, d.path))}</loc>`), n.push(`    <lastmod>${P(c)}</lastmod>`), d.extraInnerXml && n.push(d.extraInnerXml), n.push("  </url>");
  }
  return n.push("</urlset>"), n.join(`
`);
}
function He(t, s, e, a, l, o, r) {
  const i = [
    G(o),
    '<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">'
  ], n = P(l);
  for (const d of [...t].sort((c, m) => c - m))
    i.push("  <sitemap>"), i.push(`    <loc>${b(N(a, oe(d)))}</loc>`), i.push(`    <lastmod>${n}</lastmod>`), i.push("  </sitemap>");
  s && (i.push("  <sitemap>"), i.push(`    <loc>${b(N(a, k))}</loc>`), i.push(`    <lastmod>${n}</lastmod>`), i.push("  </sitemap>")), e && (i.push("  <sitemap>"), i.push(`    <loc>${b(N(a, R))}</loc>`), i.push(`    <lastmod>${n}</lastmod>`), i.push("  </sitemap>"));
  for (const d of r) {
    const c = d.lastmodMs ?? l;
    i.push("  <sitemap>"), i.push(`    <loc>${b(N(a, d.path))}</loc>`), i.push(`    <lastmod>${P(c)}</lastmod>`), i.push("  </sitemap>");
  }
  return i.push("</sitemapindex>"), i.join(`
`);
}
function Z(t, s, e, a, l, o) {
  const r = Date.now() - l * 24 * 60 * 60 * 1e3, i = t.filter((m) => m.updatedAtMs >= r).sort((m, g) => g.updatedAtMs - m.updatedAtMs), n = [
    G(o),
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"',
    '        xmlns:news="http://www.google.com/schemas/sitemap-news/0.9">'
  ], d = b(s || "Site"), c = b((e || "en").split("-")[0] || "en");
  for (const m of i)
    n.push("  <url>"), n.push(`    <loc>${b(I(a, m.path))}</loc>`), n.push("    <news:news>"), n.push("      <news:publication>"), n.push(`        <news:name>${d}</news:name>`), n.push(`        <news:language>${c}</news:language>`), n.push("      </news:publication>"), n.push(`      <news:publication_date>${$e(m.updatedAtMs)}</news:publication_date>`), n.push(`      <news:title>${b(m.title)}</news:title>`), n.push("    </news:news>"), n.push("  </url>");
  return n.push("</urlset>"), n.join(`
`);
}
async function V(t) {
  const { posts: s, pages: e, terms: a, settings: l, config: o, scope: r } = t, i = (l.baseUrl || "").replace(/\/+$/, "");
  if (!i) throw new Error("baseUrl is empty — cannot build sitemap URLs.");
  const n = ke(s, e, a, l, o), d = Ee(n), c = [...d.keys()], m = (r == null ? void 0 : r.years) ?? c, g = [], h = [];
  if (!r) {
    const v = [
      ...le,
      ...c.map((w) => Ue(w))
    ];
    for (const w of v)
      try {
        await M(w), h.push(w);
      } catch {
      }
  }
  const S = N(i, _), L = N(i, D);
  for (const v of m) {
    const w = d.get(v) ?? [], x = E(
      "sitemap.urls.extra",
      [],
      { posts: s, pages: e, terms: a, settings: l, year: v, scope: "year" }
    ), y = oe(v);
    if (w.length === 0 && x.length === 0) {
      try {
        await M(y), h.push(y);
      } catch {
      }
      continue;
    }
    const u = Ie(w, a, l, i, S, x);
    await T({ path: y, content: u }), g.push(y);
  }
  const C = o.archivesEnabled ? Pe(s, a, l, n) : [];
  if ((r == null ? void 0 : r.index) !== !1)
    if (C.length > 0)
      await T({ path: k, content: Xe(C, i, S) }), g.push(k);
    else
      try {
        await M(k), h.push(k);
      } catch {
      }
  if ((r == null ? void 0 : r.index) !== !1) {
    const v = [...d.entries()].filter(([, y]) => y.length > 0).map(([y]) => y), w = E(
      "sitemap.index.extra",
      [],
      { settings: l }
    ), x = He(
      v,
      C.length > 0,
      o.newsEnabled,
      i,
      Date.now(),
      S,
      w
    );
    await T({ path: q, content: x }), g.push(q);
  }
  if ((r == null ? void 0 : r.news) !== !1)
    if (o.newsEnabled) {
      const v = Z(
        n,
        l.title,
        l.language,
        i,
        o.newsWindowDays,
        L
      );
      await T({ path: R, content: v }), g.push(R);
      const w = await ue(
        "sitemap.news.locales",
        [],
        { posts: s, pages: e, terms: a, settings: l, config: o }
      );
      for (const x of w) {
        if (!x.path || !x.language) continue;
        const y = Z(
          x.entities,
          l.title,
          x.language,
          i,
          o.newsWindowDays,
          L
        );
        await T({ path: x.path, content: y }), g.push(x.path);
      }
    } else
      try {
        await M(R), h.push(R);
      } catch {
      }
  return { uploaded: g, deleted: h };
}
async function W(t) {
  const s = (t.baseUrl || "").replace(/\/+$/, "");
  let e;
  t.discourageIndexing ? e = `User-agent: *
Disallow: /
` : t.config.robotsTxt && t.config.robotsTxt.trim().length > 0 && !Ge(t.config.robotsTxt, s, t.config.newsEnabled) ? e = t.config.robotsTxt : e = $(s, t.config.newsEnabled), await T({ path: Ce, content: e });
}
function Ge(t, s, e) {
  const a = ee(s);
  if (!a) return !1;
  const o = $(s, e).replace(`Disallow: ${a}/admin/`, "Disallow: /admin/");
  return t.trim() === o.trim();
}
async function Y(t) {
  const s = [], e = [];
  for (const a of le)
    try {
      await M(a), e.push(a);
    } catch {
    }
  if (await T({
    path: _,
    content: Me(t.settings.language)
  }), s.push(_), t.config.newsEnabled)
    await T({
      path: D,
      content: Re(t.settings.language)
    }), s.push(D);
  else
    try {
      await M(D), e.push(D);
    } catch {
    }
  return { uploaded: s, deleted: e };
}
async function je(t) {
  var a, l, o, r, i, n;
  const s = ((l = (a = t.post.createdAt) == null ? void 0 : a.toMillis) == null ? void 0 : l.call(a)) ?? ((r = (o = t.post.publishedAt) == null ? void 0 : o.toMillis) == null ? void 0 : r.call(o)) ?? ((n = (i = t.post.updatedAt) == null ? void 0 : i.toMillis) == null ? void 0 : n.call(i)) ?? Date.now(), e = new Date(s).getUTCFullYear();
  return V({
    posts: t.posts,
    pages: t.pages,
    terms: t.terms,
    settings: t.settings,
    config: t.config,
    scope: { years: [e] }
  });
}
/**
 * @license lucide-react v0.460.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const ze = (t) => t.replace(/([a-z0-9])([A-Z])/g, "$1-$2").toLowerCase(), re = (...t) => t.filter((s, e, a) => !!s && s.trim() !== "" && a.indexOf(s) === e).join(" ").trim();
/**
 * @license lucide-react v0.460.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
var Fe = {
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
const Be = te(
  ({
    color: t = "currentColor",
    size: s = 24,
    strokeWidth: e = 2,
    absoluteStrokeWidth: a,
    className: l = "",
    children: o,
    iconNode: r,
    ...i
  }, n) => B(
    "svg",
    {
      ref: n,
      ...Fe,
      width: s,
      height: s,
      stroke: t,
      strokeWidth: a ? Number(e) * 24 / Number(s) : e,
      className: re("lucide", l),
      ...i
    },
    [
      ...r.map(([d, c]) => B(d, c)),
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
const j = (t, s) => {
  const e = te(
    ({ className: a, ...l }, o) => B(Be, {
      ref: o,
      iconNode: s,
      className: re(`lucide-${ze(t)}`, a),
      ...l
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
const _e = j("FileCode2", [
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
const X = j("LoaderCircle", [
  ["path", { d: "M21 12a9 9 0 1 1-6.219-8.56", key: "13zald" }]
]);
/**
 * @license lucide-react v0.460.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const qe = j("RefreshCw", [
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
const Q = j("Save", [
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
function Oe({ config: t, save: s }) {
  const { t: e } = xe("agentcms-sitemaps"), { settings: a, terms: l } = be(), [o, r] = U(t);
  we(() => r(t), [t]);
  const [i, n] = U(!1), [d, c] = U(!1), [m, g] = U(!1), [h, S] = U(!1);
  function L(u) {
    r((z) => ({ ...z, ...u }));
  }
  async function C() {
    n(!0);
    try {
      await s(o), A.success(e("saved"));
    } finally {
      n(!1);
    }
  }
  async function v() {
    if (!a.baseUrl) {
      A.error(e("baseUrlMissing"));
      return;
    }
    c(!0);
    try {
      await s(o), await W({
        config: o,
        baseUrl: a.baseUrl,
        discourageIndexing: a.discourageIndexing === !0
      }), A.success(e("robots.saved"));
    } finally {
      c(!1);
    }
  }
  async function w() {
    if (!a.baseUrl) {
      A.error(e("baseUrlMissing"));
      return;
    }
    g(!0);
    try {
      await s(o);
      const u = await Y({ settings: a, config: o }), [z, pe] = await Promise.all([
        K({ type: "post" }),
        K({ type: "page" })
      ]), ce = await V({
        posts: z,
        pages: pe,
        terms: l,
        settings: a,
        config: o
      });
      await W({
        config: o,
        baseUrl: a.baseUrl,
        discourageIndexing: a.discourageIndexing === !0
      }), A.success(
        e("uploaded", { count: u.uploaded.length + ce.uploaded.length + 1 })
      );
    } catch (u) {
      console.error("[agentcms-sitemaps] regeneration failed:", u), A.error(e("regenerateFailed"));
    } finally {
      g(!1);
    }
  }
  async function x() {
    if (!a.baseUrl) {
      A.error(e("baseUrlMissing"));
      return;
    }
    S(!0);
    try {
      await s(o);
      const u = await Y({ settings: a, config: o });
      A.success(e("xsl.uploaded", { count: u.uploaded.length }));
    } catch (u) {
      console.error("[agentcms-sitemaps] xsl upload failed:", u), A.error(e("xsl.failed"));
    } finally {
      S(!1);
    }
  }
  function y() {
    L({ robotsTxt: $(a.baseUrl, o.newsEnabled) });
  }
  return /* @__PURE__ */ f("div", { className: "space-y-6", children: [
    /* @__PURE__ */ p("p", { className: "text-sm text-surface-600 dark:text-surface-300", children: e("description") }),
    /* @__PURE__ */ f("section", { className: "card p-4 space-y-4", children: [
      /* @__PURE__ */ p("h2", { className: "font-semibold", children: e("sections.general") }),
      /* @__PURE__ */ f("div", { children: [
        /* @__PURE__ */ p("label", { className: "label", children: e("contentTypes.label") }),
        /* @__PURE__ */ f(
          "select",
          {
            className: "input max-w-xs",
            value: o.contentTypes,
            onChange: (u) => L({ contentTypes: u.target.value }),
            children: [
              /* @__PURE__ */ p("option", { value: "posts", children: e("contentTypes.posts") }),
              /* @__PURE__ */ p("option", { value: "posts-pages", children: e("contentTypes.postsPages") })
            ]
          }
        )
      ] }),
      /* @__PURE__ */ f("div", { children: [
        /* @__PURE__ */ f("label", { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ p(
            "input",
            {
              type: "checkbox",
              checked: o.archivesEnabled,
              onChange: (u) => L({ archivesEnabled: u.target.checked })
            }
          ),
          /* @__PURE__ */ p("span", { className: "text-sm font-medium", children: e("archives.enabled") })
        ] }),
        /* @__PURE__ */ p("p", { className: "text-xs text-surface-500 mt-1 dark:text-surface-400", children: e("archives.enabledHelp") })
      ] }),
      /* @__PURE__ */ f("div", { children: [
        /* @__PURE__ */ f("label", { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ p(
            "input",
            {
              type: "checkbox",
              checked: o.newsEnabled,
              onChange: (u) => L({ newsEnabled: u.target.checked })
            }
          ),
          /* @__PURE__ */ p("span", { className: "text-sm font-medium", children: e("news.enabled") })
        ] }),
        /* @__PURE__ */ p("p", { className: "text-xs text-surface-500 mt-1 dark:text-surface-400", children: e("news.enabledHelp") })
      ] }),
      o.newsEnabled && /* @__PURE__ */ f("div", { children: [
        /* @__PURE__ */ p("label", { className: "label", children: e("news.windowDays") }),
        /* @__PURE__ */ p(
          "input",
          {
            className: "input max-w-xs",
            type: "number",
            min: 1,
            max: 30,
            value: o.newsWindowDays,
            onChange: (u) => L({
              newsWindowDays: Math.max(1, Math.min(30, Number.parseInt(u.target.value, 10) || 2))
            })
          }
        ),
        /* @__PURE__ */ p("p", { className: "text-xs text-surface-500 mt-1 dark:text-surface-400", children: e("news.windowDaysHelp") })
      ] }),
      /* @__PURE__ */ f(
        "button",
        {
          type: "button",
          className: "btn-primary",
          onClick: C,
          disabled: i,
          children: [
            /* @__PURE__ */ p(X, { className: i ? "h-4 w-4 animate-spin" : "hidden" }),
            /* @__PURE__ */ p(Q, { className: i ? "hidden" : "h-4 w-4" }),
            /* @__PURE__ */ p("span", { children: e(i ? "robots.saving" : "saveSettings") })
          ]
        }
      )
    ] }),
    /* @__PURE__ */ f("section", { className: "card p-4 space-y-3", children: [
      /* @__PURE__ */ f("div", { className: "flex items-center justify-between gap-3", children: [
        /* @__PURE__ */ p("h2", { className: "font-semibold", children: e("sections.robots") }),
        /* @__PURE__ */ p("button", { type: "button", className: "btn-ghost", onClick: y, children: e("robots.resetDefault") })
      ] }),
      /* @__PURE__ */ p("p", { className: "text-xs text-surface-500 dark:text-surface-400", children: e("robots.help") }),
      /* @__PURE__ */ p(
        "textarea",
        {
          className: "input font-mono text-xs min-h-[180px]",
          value: o.robotsTxt,
          onChange: (u) => L({ robotsTxt: u.target.value }),
          placeholder: $(a.baseUrl, o.newsEnabled)
        }
      ),
      /* @__PURE__ */ f(
        "button",
        {
          type: "button",
          className: "btn-primary",
          onClick: v,
          disabled: d,
          children: [
            /* @__PURE__ */ p(X, { className: d ? "h-4 w-4 animate-spin" : "hidden" }),
            /* @__PURE__ */ p(Q, { className: d ? "hidden" : "h-4 w-4" }),
            /* @__PURE__ */ p("span", { children: e(d ? "robots.saving" : "robots.saveAndRegenerate") })
          ]
        }
      )
    ] }),
    /* @__PURE__ */ f("section", { className: "card p-4 space-y-3", children: [
      /* @__PURE__ */ p("h2", { className: "font-semibold", children: e("sections.actions") }),
      /* @__PURE__ */ p("p", { className: "text-xs text-surface-500 dark:text-surface-400", children: e("xsl.help") }),
      /* @__PURE__ */ f("div", { className: "flex flex-wrap gap-2", children: [
        /* @__PURE__ */ p(
          "button",
          {
            type: "button",
            className: "btn-ghost",
            onClick: x,
            disabled: h,
            children: /* @__PURE__ */ f("span", { className: "inline-flex items-center justify-center gap-1.5", children: [
              /* @__PURE__ */ p(X, { className: "h-4 w-4 animate-spin " + (h ? "" : "hidden") }),
              /* @__PURE__ */ p(_e, { className: "h-4 w-4 " + (h ? "hidden" : "") }),
              /* @__PURE__ */ p("span", { children: e(h ? "xsl.uploading" : "xsl.upload") })
            ] })
          }
        ),
        /* @__PURE__ */ p(
          "button",
          {
            type: "button",
            className: "btn-secondary",
            onClick: w,
            disabled: m,
            children: /* @__PURE__ */ f("span", { className: "inline-flex items-center justify-center gap-1.5", children: [
              /* @__PURE__ */ p(X, { className: "h-4 w-4 animate-spin " + (m ? "" : "hidden") }),
              /* @__PURE__ */ p(qe, { className: "h-4 w-4 " + (m ? "hidden" : "") }),
              /* @__PURE__ */ p("span", { children: e(m ? "forceRegenerating" : "forceRegenerate") })
            ] })
          }
        )
      ] })
    ] })
  ] });
}
const We = {
  contentTypes: {
    description: "What the yearly sitemaps (/sitemaps/sitemap-<year>.xml) list: online posts only, or posts and pages.",
    values: ["posts", "posts-pages"]
  },
  archivesEnabled: {
    description: "Also publish /sitemaps/sitemap-archives.xml, referenced from the index: the home page and every category archive listing at least one online post."
  },
  newsEnabled: {
    description: "Also publish a Google News sitemap (/sitemaps/sitemap-news.xml, posts only) referenced from the index. The default robots.txt then lists it too; re-run the robots and stylesheets actions after toggling."
  },
  newsWindowDays: {
    description: "News sitemap window: posts modified within this many days are listed. Google recommends 2.",
    min: 1,
    max: 30
  },
  robotsTxt: {
    description: "Full text of /robots.txt. Empty = a generated default pointing at /sitemaps/sitemap-index.xml (and the News sitemap when enabled). Ignored while settings.discourageIndexing is on (robots.txt then disallows everything). Upload it with `plugins action agentcms-sitemaps robots`.",
    format: "robots.txt text"
  }
}, Ye = `# Sitemaps

Generates and maintains XML sitemaps for search engine discovery. Also produces a customizable \`robots.txt\` so crawlers know what they can index.

## What it does

Every time a post or page is published, unpublished or deleted, the plugin **incrementally** regenerates only the sitemap files affected by the change — never the whole catalog. Output files (uploaded to your site, all sitemap XML/XSL files grouped under \`/sitemaps/\` for tidiness; \`robots.txt\` stays at the site root because that's where crawlers expect it):

- **\`sitemaps/sitemap-<year>.xml\`** — one per year, listing every published URL whose \`createdAt\` falls in that year.
- **\`sitemaps/sitemap-index.xml\`** — top-level index referencing every yearly sitemap. This is the URL you submit to Google Search Console.
- **\`sitemaps/sitemap-archives.xml\`** — the home page and every category archive that lists at least one online post (lastmod = newest post in it). On by default; turn it off with *List the home page and categories* (\`archivesEnabled\`). Not written when a static home page is the only listing and no category has posts.
- **\`sitemaps/sitemap-news.xml\`** — optional Google News sitemap, scoped to posts published in a configurable rolling window (default: last 2 days).
- **\`robots.txt\`** (at site root) — editable text file pointing crawlers at the sitemap index.
- **\`sitemaps/sitemap.xsl\` / \`sitemaps/sitemap-news.xsl\`** — XSLT stylesheets that turn the raw XML into a styled HTML table when a human opens the URL directly. Invisible to crawlers.

When a yearly sitemap empties out (every post in that year gets deleted or unpublished), the file is removed from your site so the index never points at a 404.

### Migration from the previous root-level layout

Earlier versions of this plugin uploaded every sitemap file to the site root (\`sitemap-index.xml\`, \`sitemap-<year>.xml\`, …). On the next **Force regenerate** the plugin sweeps those legacy paths and deletes them silently — old files are removed, new ones land under \`/sitemaps/\`. The sweep is idempotent (404 is treated as already-gone). After migration, re-submit \`https://your-site.com/sitemaps/sitemap-index.xml\` in Google Search Console; the old URL will deindex naturally as Google sees the 404.

## Settings

Reachable via **Plugins → Configure** when the plugin is enabled.

- **Content scope** — choose between *Posts only* (default) or *Posts and pages*. Pages-as-content sites usually want both; blogs typically just posts.
- **News sitemap** — enable / disable. When enabled, set the rolling window (in days). A 2–3 day window matches Google News' own crawl horizon.
- **\`robots.txt\`** — free-form text editor with an *Insert default* button that generates a sensible starting point referencing your sitemap index.
- **Upload stylesheets** — manual button to push the XSL files. Run this once per site setup; the lifecycle hooks deliberately don't re-upload XSL on every publish to save bandwidth.
- **Force regenerate** — rebuilds every sitemap, the index and the robots.txt from scratch. Useful after a bulk content move, a base URL change, or when the auto-incremental state drifts.

## Requirements

The plugin needs \`Settings → Site → Public site URL\` to be set — sitemap entries require an absolute origin. With the field empty, the plugin no-ops silently rather than upload sitemaps with relative URLs.

## When to disable it

Disable if you maintain sitemaps externally (e.g. a separate static-site generator running alongside the CMS) or if your site is private and you don't want it indexed. Disabling stops new generation but does **not** delete already-uploaded sitemap files — clean those up by hand on your hosting if needed.
`;
function de(t) {
  var e;
  const s = (e = t.settings.pluginConfigs) == null ? void 0 : e["agentcms-sitemaps"];
  return { ...ie, ...s ?? {} };
}
async function F(t, s) {
  if (!s.settings.baseUrl) {
    console.warn("[agentcms-sitemaps] skipping regeneration — baseUrl not configured");
    return;
  }
  try {
    await je({
      post: t,
      posts: s.posts,
      pages: s.pages,
      terms: s.terms,
      settings: s.settings,
      config: de(s)
    });
  } catch (e) {
    console.error("[agentcms-sitemaps] regeneration failed:", e);
  }
}
const Qe = {
  id: "agentcms-sitemaps",
  name: "Sitemaps",
  version: "1.0.4",
  author: "AgentCMS",
  description: "Generates sitemap-index.xml, per-year sitemaps, an optional Google News sitemap, and a robots.txt that points to them.",
  readme: Ye,
  i18n: { en: ye, fr: ve, de: Se, es: Le, nl: Ae, pt: Te, ko: Ne },
  settings: {
    navLabelKey: "title",
    defaultConfig: ie,
    component: Oe,
    schema: We
  },
  register(t) {
    t.addAction("publish.complete", async (s, e) => {
      await F(s, e);
    }), t.addAction("post.unpublished", async (s, e) => {
      await F(s, e);
    }), t.addAction("post.deleted", async (s, e) => {
      await F(s, e);
    }), t.registerRegenerationTarget({
      id: "agentcms-sitemaps",
      labelKey: "regenerationTarget.label",
      descriptionKey: "regenerationTarget.description",
      priority: 200,
      run: async (s, e) => {
        if (!s.settings.baseUrl) {
          e({ level: "warn", message: "[agentcms-sitemaps] skipped — site URL not set." });
          return;
        }
        const a = de(s);
        e({ level: "info", message: "Regenerating sitemap stylesheets…" });
        const l = await Y({ settings: s.settings, config: a });
        e({ level: "info", message: "Regenerating sitemaps…" });
        const o = await V({
          posts: s.posts,
          pages: s.pages,
          terms: s.terms,
          settings: s.settings,
          config: a
        });
        e({ level: "info", message: "Regenerating robots.txt…" }), await W({
          config: a,
          baseUrl: s.settings.baseUrl,
          discourageIndexing: s.settings.discourageIndexing === !0
        }), e({
          level: "success",
          message: `Sitemaps: ${l.uploaded.length + o.uploaded.length + 1} file(s) uploaded.`
        });
      }
    });
  }
};
export {
  Qe as manifest
};
