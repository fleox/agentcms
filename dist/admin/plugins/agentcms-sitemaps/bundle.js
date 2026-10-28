import { pickPublicLocale as pe, deleteFile as U, uploadFile as T, pathToPublicUrl as A, applyFiltersSync as X, applyFilters as ce, basePathFromBaseUrl as Z, buildPostUrl as me, canonicalUrl as ue, useCmsData as ge, toast as S, fetchAllPosts as Y } from "@agent-cms/runtime";
import { jsxs as g, jsx as p } from "react/jsx-runtime";
import { forwardRef as Q, createElement as z, useState as C, useEffect as he } from "react";
import { useTranslation as fe } from "react-i18next";
const we = {
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
}, be = {
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
}, xe = {
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
}, ye = {
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
}, ve = {
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
}, Se = {
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
}, Le = {
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
}, j = "sitemaps/sitemap.xsl", M = "sitemaps/sitemap-news.xsl", ee = {
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
function te(t) {
  return pe(t);
}
const se = `
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
function Te(t) {
  const s = te(t), e = ee[s];
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
        <style type="text/css">${se}</style>
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
function Ae(t) {
  const s = te(t), e = ee[s];
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
        <style type="text/css">${se}</style>
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
const ae = {
  newsEnabled: !1,
  newsWindowDays: 2,
  contentTypes: "posts-pages",
  robotsTxt: ""
}, O = "sitemaps", H = `${O}/sitemap-index.xml`, N = `${O}/sitemap-news.xml`, Ne = "robots.txt";
function ne(t) {
  return `${O}/sitemap-${t}.xml`;
}
const ie = [
  "sitemap-index.xml",
  "sitemap-news.xml",
  "sitemap.xsl",
  "sitemap-news.xsl"
];
function Re(t) {
  return `sitemap-${t}.xml`;
}
function k(t, s) {
  const e = ["User-agent: *", "Allow: /", `Disallow: ${Z(t)}/admin/`, ""];
  return t && (e.push(`Sitemap: ${A(t, H)}`), s && e.push(`Sitemap: ${A(t, N)}`)), e.join(`
`) + `
`;
}
const Ce = "index.html";
function Me(t, s) {
  return t.type === "page" && s.homeMode === "static-page" && !!s.homePageId && s.homePageId === t.id;
}
function F(t, s) {
  return ue(t, s);
}
function V(t, s, e) {
  var i, r, o, d, c, m;
  let a;
  try {
    const w = t.primaryTermId ? s.find((y) => y.id === t.primaryTermId) : void 0;
    a = Me(t, e) ? Ce : me({ post: t, primaryTerm: w });
  } catch {
    return null;
  }
  const l = ((r = (i = t.createdAt) == null ? void 0 : i.toMillis) == null ? void 0 : r.call(i)) ?? ((d = (o = t.publishedAt) == null ? void 0 : o.toMillis) == null ? void 0 : d.call(o)) ?? Date.now(), n = ((m = (c = t.updatedAt) == null ? void 0 : c.toMillis) == null ? void 0 : m.call(c)) ?? l;
  return {
    path: a,
    createdAtMs: l,
    updatedAtMs: n,
    title: t.title || t.slug,
    sourcePost: t
  };
}
function Ue(t, s, e, a, l) {
  const n = [];
  for (const i of t) {
    if (i.status !== "online") continue;
    const r = V(i, e, a);
    r && n.push(r);
  }
  if (l.contentTypes === "posts-pages")
    for (const i of s) {
      if (i.status !== "online") continue;
      const r = V(i, e, a);
      r && n.push(r);
    }
  return n;
}
function De(t) {
  const s = /* @__PURE__ */ new Map();
  for (const e of t) {
    const a = new Date(e.createdAtMs).getUTCFullYear(), l = s.get(a) ?? [];
    l.push(e), s.set(a, l);
  }
  return s;
}
function x(t) {
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
function Xe(t) {
  return new Date(t).toISOString();
}
function P(t) {
  return new Date(t).toISOString().slice(0, 10);
}
function q(t) {
  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    `<?xml-stylesheet type="text/xsl" href="${x(t)}"?>`
  ].join(`
`);
}
function ke(t, s, e, a, l, n) {
  const i = X(
    "sitemap.urlset.namespaces",
    {},
    { kind: "year", baseUrl: a }
  ), r = Object.entries(i).map(([d, c]) => ` ${x(d)}="${x(c)}"`).join(""), o = [
    q(l),
    `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"${r}>`
  ];
  for (const d of t) {
    const c = X(
      "sitemap.url.entry",
      "",
      // `terms` + `settings` let handlers (multilang alternates) resolve
      // localised paths without relying on module-level snapshots.
      { entity: d.sourcePost, baseUrl: a, path: d.path, lastmodMs: d.updatedAtMs, terms: s, settings: e }
    );
    o.push("  <url>"), o.push(`    <loc>${x(F(a, d.path))}</loc>`), o.push(`    <lastmod>${P(d.updatedAtMs)}</lastmod>`), c && o.push(c), o.push("  </url>");
  }
  for (const d of n) {
    const c = d.lastmodMs ?? Date.now();
    o.push("  <url>"), o.push(`    <loc>${x(F(a, d.path))}</loc>`), o.push(`    <lastmod>${P(c)}</lastmod>`), d.extraInnerXml && o.push(d.extraInnerXml), o.push("  </url>");
  }
  return o.push("</urlset>"), o.join(`
`);
}
function Pe(t, s, e, a, l, n) {
  const i = [
    q(l),
    '<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">'
  ], r = P(a);
  for (const o of [...t].sort((d, c) => d - c))
    i.push("  <sitemap>"), i.push(`    <loc>${x(A(e, ne(o)))}</loc>`), i.push(`    <lastmod>${r}</lastmod>`), i.push("  </sitemap>");
  s && (i.push("  <sitemap>"), i.push(`    <loc>${x(A(e, N))}</loc>`), i.push(`    <lastmod>${r}</lastmod>`), i.push("  </sitemap>"));
  for (const o of n) {
    const d = o.lastmodMs ?? a;
    i.push("  <sitemap>"), i.push(`    <loc>${x(A(e, o.path))}</loc>`), i.push(`    <lastmod>${P(d)}</lastmod>`), i.push("  </sitemap>");
  }
  return i.push("</sitemapindex>"), i.join(`
`);
}
function J(t, s, e, a, l, n) {
  const i = Date.now() - l * 24 * 60 * 60 * 1e3, r = t.filter((m) => m.updatedAtMs >= i).sort((m, w) => w.updatedAtMs - m.updatedAtMs), o = [
    q(n),
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"',
    '        xmlns:news="http://www.google.com/schemas/sitemap-news/0.9">'
  ], d = x(s || "Site"), c = x((e || "en").split("-")[0] || "en");
  for (const m of r)
    o.push("  <url>"), o.push(`    <loc>${x(F(a, m.path))}</loc>`), o.push("    <news:news>"), o.push("      <news:publication>"), o.push(`        <news:name>${d}</news:name>`), o.push(`        <news:language>${c}</news:language>`), o.push("      </news:publication>"), o.push(`      <news:publication_date>${Xe(m.updatedAtMs)}</news:publication_date>`), o.push(`      <news:title>${x(m.title)}</news:title>`), o.push("    </news:news>"), o.push("  </url>");
  return o.push("</urlset>"), o.join(`
`);
}
async function W(t) {
  const { posts: s, pages: e, terms: a, settings: l, config: n, scope: i } = t, r = (l.baseUrl || "").replace(/\/+$/, "");
  if (!r) throw new Error("baseUrl is empty — cannot build sitemap URLs.");
  const o = Ue(s, e, a, l, n), d = De(o), c = [...d.keys()], m = (i == null ? void 0 : i.years) ?? c, w = [], y = [];
  if (!i) {
    const v = [
      ...ie,
      ...c.map((h) => Re(h))
    ];
    for (const h of v)
      try {
        await U(h), y.push(h);
      } catch {
      }
  }
  const R = A(r, j), L = A(r, M);
  for (const v of m) {
    const h = d.get(v) ?? [], f = X(
      "sitemap.urls.extra",
      [],
      { posts: s, pages: e, terms: a, settings: l, year: v, scope: "year" }
    ), b = ne(v);
    if (h.length === 0 && f.length === 0) {
      try {
        await U(b), y.push(b);
      } catch {
      }
      continue;
    }
    const $ = ke(h, a, l, r, R, f);
    await T({ path: b, content: $ }), w.push(b);
  }
  if ((i == null ? void 0 : i.index) !== !1) {
    const v = [...d.entries()].filter(([, b]) => b.length > 0).map(([b]) => b), h = X(
      "sitemap.index.extra",
      [],
      { settings: l }
    ), f = Pe(
      v,
      n.newsEnabled,
      r,
      Date.now(),
      R,
      h
    );
    await T({ path: H, content: f }), w.push(H);
  }
  if ((i == null ? void 0 : i.news) !== !1)
    if (n.newsEnabled) {
      const v = J(
        o,
        l.title,
        l.language,
        r,
        n.newsWindowDays,
        L
      );
      await T({ path: N, content: v }), w.push(N);
      const h = await ce(
        "sitemap.news.locales",
        [],
        { posts: s, pages: e, terms: a, settings: l, config: n }
      );
      for (const f of h) {
        if (!f.path || !f.language) continue;
        const b = J(
          f.entities,
          l.title,
          f.language,
          r,
          n.newsWindowDays,
          L
        );
        await T({ path: f.path, content: b }), w.push(f.path);
      }
    } else
      try {
        await U(N), y.push(N);
      } catch {
      }
  return { uploaded: w, deleted: y };
}
async function B(t) {
  const s = (t.baseUrl || "").replace(/\/+$/, "");
  let e;
  t.discourageIndexing ? e = `User-agent: *
Disallow: /
` : t.config.robotsTxt && t.config.robotsTxt.trim().length > 0 && !Ee(t.config.robotsTxt, s, t.config.newsEnabled) ? e = t.config.robotsTxt : e = k(s, t.config.newsEnabled), await T({ path: Ne, content: e });
}
function Ee(t, s, e) {
  const a = Z(s);
  if (!a) return !1;
  const n = k(s, e).replace(`Disallow: ${a}/admin/`, "Disallow: /admin/");
  return t.trim() === n.trim();
}
async function _(t) {
  const s = [], e = [];
  for (const a of ie)
    try {
      await U(a), e.push(a);
    } catch {
    }
  if (await T({
    path: j,
    content: Te(t.settings.language)
  }), s.push(j), t.config.newsEnabled)
    await T({
      path: M,
      content: Ae(t.settings.language)
    }), s.push(M);
  else
    try {
      await U(M), e.push(M);
    } catch {
    }
  return { uploaded: s, deleted: e };
}
async function $e(t) {
  var a, l, n, i, r, o;
  const s = ((l = (a = t.post.createdAt) == null ? void 0 : a.toMillis) == null ? void 0 : l.call(a)) ?? ((i = (n = t.post.publishedAt) == null ? void 0 : n.toMillis) == null ? void 0 : i.call(n)) ?? ((o = (r = t.post.updatedAt) == null ? void 0 : r.toMillis) == null ? void 0 : o.call(r)) ?? Date.now(), e = new Date(s).getUTCFullYear();
  return W({
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
const Ie = (t) => t.replace(/([a-z0-9])([A-Z])/g, "$1-$2").toLowerCase(), oe = (...t) => t.filter((s, e, a) => !!s && s.trim() !== "" && a.indexOf(s) === e).join(" ").trim();
/**
 * @license lucide-react v0.460.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
var Ge = {
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
const ze = Q(
  ({
    color: t = "currentColor",
    size: s = 24,
    strokeWidth: e = 2,
    absoluteStrokeWidth: a,
    className: l = "",
    children: n,
    iconNode: i,
    ...r
  }, o) => z(
    "svg",
    {
      ref: o,
      ...Ge,
      width: s,
      height: s,
      stroke: t,
      strokeWidth: a ? Number(e) * 24 / Number(s) : e,
      className: oe("lucide", l),
      ...r
    },
    [
      ...i.map(([d, c]) => z(d, c)),
      ...Array.isArray(n) ? n : [n]
    ]
  )
);
/**
 * @license lucide-react v0.460.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const E = (t, s) => {
  const e = Q(
    ({ className: a, ...l }, n) => z(ze, {
      ref: n,
      iconNode: s,
      className: oe(`lucide-${Ie(t)}`, a),
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
const je = E("FileCode2", [
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
const D = E("LoaderCircle", [
  ["path", { d: "M21 12a9 9 0 1 1-6.219-8.56", key: "13zald" }]
]);
/**
 * @license lucide-react v0.460.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const He = E("RefreshCw", [
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
const K = E("Save", [
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
function Fe({ config: t, save: s }) {
  const { t: e } = fe("agentcms-sitemaps"), { settings: a, terms: l } = ge(), [n, i] = C(t);
  he(() => i(t), [t]);
  const [r, o] = C(!1), [d, c] = C(!1), [m, w] = C(!1), [y, R] = C(!1);
  function L(u) {
    i((I) => ({ ...I, ...u }));
  }
  async function v() {
    o(!0);
    try {
      await s(n), S.success(e("saved"));
    } finally {
      o(!1);
    }
  }
  async function h() {
    if (!a.baseUrl) {
      S.error(e("baseUrlMissing"));
      return;
    }
    c(!0);
    try {
      await s(n), await B({
        config: n,
        baseUrl: a.baseUrl,
        discourageIndexing: a.discourageIndexing === !0
      }), S.success(e("robots.saved"));
    } finally {
      c(!1);
    }
  }
  async function f() {
    if (!a.baseUrl) {
      S.error(e("baseUrlMissing"));
      return;
    }
    w(!0);
    try {
      await s(n);
      const u = await _({ settings: a, config: n }), [I, re] = await Promise.all([
        Y({ type: "post" }),
        Y({ type: "page" })
      ]), de = await W({
        posts: I,
        pages: re,
        terms: l,
        settings: a,
        config: n
      });
      await B({
        config: n,
        baseUrl: a.baseUrl,
        discourageIndexing: a.discourageIndexing === !0
      }), S.success(
        e("uploaded", { count: u.uploaded.length + de.uploaded.length + 1 })
      );
    } catch (u) {
      console.error("[agentcms-sitemaps] regeneration failed:", u), S.error(e("regenerateFailed"));
    } finally {
      w(!1);
    }
  }
  async function b() {
    if (!a.baseUrl) {
      S.error(e("baseUrlMissing"));
      return;
    }
    R(!0);
    try {
      await s(n);
      const u = await _({ settings: a, config: n });
      S.success(e("xsl.uploaded", { count: u.uploaded.length }));
    } catch (u) {
      console.error("[agentcms-sitemaps] xsl upload failed:", u), S.error(e("xsl.failed"));
    } finally {
      R(!1);
    }
  }
  function $() {
    L({ robotsTxt: k(a.baseUrl, n.newsEnabled) });
  }
  return /* @__PURE__ */ g("div", { className: "space-y-6", children: [
    /* @__PURE__ */ p("p", { className: "text-sm text-surface-600 dark:text-surface-300", children: e("description") }),
    /* @__PURE__ */ g("section", { className: "card p-4 space-y-4", children: [
      /* @__PURE__ */ p("h2", { className: "font-semibold", children: e("sections.general") }),
      /* @__PURE__ */ g("div", { children: [
        /* @__PURE__ */ p("label", { className: "label", children: e("contentTypes.label") }),
        /* @__PURE__ */ g(
          "select",
          {
            className: "input max-w-xs",
            value: n.contentTypes,
            onChange: (u) => L({ contentTypes: u.target.value }),
            children: [
              /* @__PURE__ */ p("option", { value: "posts", children: e("contentTypes.posts") }),
              /* @__PURE__ */ p("option", { value: "posts-pages", children: e("contentTypes.postsPages") })
            ]
          }
        )
      ] }),
      /* @__PURE__ */ g("div", { children: [
        /* @__PURE__ */ g("label", { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ p(
            "input",
            {
              type: "checkbox",
              checked: n.newsEnabled,
              onChange: (u) => L({ newsEnabled: u.target.checked })
            }
          ),
          /* @__PURE__ */ p("span", { className: "text-sm font-medium", children: e("news.enabled") })
        ] }),
        /* @__PURE__ */ p("p", { className: "text-xs text-surface-500 mt-1 dark:text-surface-400", children: e("news.enabledHelp") })
      ] }),
      n.newsEnabled && /* @__PURE__ */ g("div", { children: [
        /* @__PURE__ */ p("label", { className: "label", children: e("news.windowDays") }),
        /* @__PURE__ */ p(
          "input",
          {
            className: "input max-w-xs",
            type: "number",
            min: 1,
            max: 30,
            value: n.newsWindowDays,
            onChange: (u) => L({
              newsWindowDays: Math.max(1, Math.min(30, Number.parseInt(u.target.value, 10) || 2))
            })
          }
        ),
        /* @__PURE__ */ p("p", { className: "text-xs text-surface-500 mt-1 dark:text-surface-400", children: e("news.windowDaysHelp") })
      ] }),
      /* @__PURE__ */ g(
        "button",
        {
          type: "button",
          className: "btn-primary",
          onClick: v,
          disabled: r,
          children: [
            /* @__PURE__ */ p(D, { className: r ? "h-4 w-4 animate-spin" : "hidden" }),
            /* @__PURE__ */ p(K, { className: r ? "hidden" : "h-4 w-4" }),
            /* @__PURE__ */ p("span", { children: e(r ? "robots.saving" : "saveSettings") })
          ]
        }
      )
    ] }),
    /* @__PURE__ */ g("section", { className: "card p-4 space-y-3", children: [
      /* @__PURE__ */ g("div", { className: "flex items-center justify-between gap-3", children: [
        /* @__PURE__ */ p("h2", { className: "font-semibold", children: e("sections.robots") }),
        /* @__PURE__ */ p("button", { type: "button", className: "btn-ghost", onClick: $, children: e("robots.resetDefault") })
      ] }),
      /* @__PURE__ */ p("p", { className: "text-xs text-surface-500 dark:text-surface-400", children: e("robots.help") }),
      /* @__PURE__ */ p(
        "textarea",
        {
          className: "input font-mono text-xs min-h-[180px]",
          value: n.robotsTxt,
          onChange: (u) => L({ robotsTxt: u.target.value }),
          placeholder: k(a.baseUrl, n.newsEnabled)
        }
      ),
      /* @__PURE__ */ g(
        "button",
        {
          type: "button",
          className: "btn-primary",
          onClick: h,
          disabled: d,
          children: [
            /* @__PURE__ */ p(D, { className: d ? "h-4 w-4 animate-spin" : "hidden" }),
            /* @__PURE__ */ p(K, { className: d ? "hidden" : "h-4 w-4" }),
            /* @__PURE__ */ p("span", { children: e(d ? "robots.saving" : "robots.saveAndRegenerate") })
          ]
        }
      )
    ] }),
    /* @__PURE__ */ g("section", { className: "card p-4 space-y-3", children: [
      /* @__PURE__ */ p("h2", { className: "font-semibold", children: e("sections.actions") }),
      /* @__PURE__ */ p("p", { className: "text-xs text-surface-500 dark:text-surface-400", children: e("xsl.help") }),
      /* @__PURE__ */ g("div", { className: "flex flex-wrap gap-2", children: [
        /* @__PURE__ */ p(
          "button",
          {
            type: "button",
            className: "btn-ghost",
            onClick: b,
            disabled: y,
            children: /* @__PURE__ */ g("span", { className: "inline-flex items-center justify-center gap-1.5", children: [
              /* @__PURE__ */ p(D, { className: "h-4 w-4 animate-spin " + (y ? "" : "hidden") }),
              /* @__PURE__ */ p(je, { className: "h-4 w-4 " + (y ? "hidden" : "") }),
              /* @__PURE__ */ p("span", { children: e(y ? "xsl.uploading" : "xsl.upload") })
            ] })
          }
        ),
        /* @__PURE__ */ p(
          "button",
          {
            type: "button",
            className: "btn-secondary",
            onClick: f,
            disabled: m,
            children: /* @__PURE__ */ g("span", { className: "inline-flex items-center justify-center gap-1.5", children: [
              /* @__PURE__ */ p(D, { className: "h-4 w-4 animate-spin " + (m ? "" : "hidden") }),
              /* @__PURE__ */ p(He, { className: "h-4 w-4 " + (m ? "hidden" : "") }),
              /* @__PURE__ */ p("span", { children: e(m ? "forceRegenerating" : "forceRegenerate") })
            ] })
          }
        )
      ] })
    ] })
  ] });
}
const Be = {
  contentTypes: {
    description: "What the yearly sitemaps (/sitemaps/sitemap-<year>.xml) list: online posts only, or posts and pages.",
    values: ["posts", "posts-pages"]
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
}, _e = `# Sitemaps

Generates and maintains XML sitemaps for search engine discovery. Also produces a customizable \`robots.txt\` so crawlers know what they can index.

## What it does

Every time a post or page is published, unpublished or deleted, the plugin **incrementally** regenerates only the sitemap files affected by the change — never the whole catalog. Output files (uploaded to your site, all sitemap XML/XSL files grouped under \`/sitemaps/\` for tidiness; \`robots.txt\` stays at the site root because that's where crawlers expect it):

- **\`sitemaps/sitemap-<year>.xml\`** — one per year, listing every published URL whose \`createdAt\` falls in that year.
- **\`sitemaps/sitemap-index.xml\`** — top-level index referencing every yearly sitemap. This is the URL you submit to Google Search Console.
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
function le(t) {
  var e;
  const s = (e = t.settings.pluginConfigs) == null ? void 0 : e["agentcms-sitemaps"];
  return { ...ae, ...s ?? {} };
}
async function G(t, s) {
  if (!s.settings.baseUrl) {
    console.warn("[agentcms-sitemaps] skipping regeneration — baseUrl not configured");
    return;
  }
  try {
    await $e({
      post: t,
      posts: s.posts,
      pages: s.pages,
      terms: s.terms,
      settings: s.settings,
      config: le(s)
    });
  } catch (e) {
    console.error("[agentcms-sitemaps] regeneration failed:", e);
  }
}
const Ve = {
  id: "agentcms-sitemaps",
  name: "Sitemaps",
  version: "1.0.3",
  author: "AgentCMS",
  description: "Generates sitemap-index.xml, per-year sitemaps, an optional Google News sitemap, and a robots.txt that points to them.",
  readme: _e,
  i18n: { en: we, fr: be, de: xe, es: ye, nl: ve, pt: Se, ko: Le },
  settings: {
    navLabelKey: "title",
    defaultConfig: ae,
    component: Fe,
    schema: Be
  },
  register(t) {
    t.addAction("publish.complete", async (s, e) => {
      await G(s, e);
    }), t.addAction("post.unpublished", async (s, e) => {
      await G(s, e);
    }), t.addAction("post.deleted", async (s, e) => {
      await G(s, e);
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
        const a = le(s);
        e({ level: "info", message: "Regenerating sitemap stylesheets…" });
        const l = await _({ settings: s.settings, config: a });
        e({ level: "info", message: "Regenerating sitemaps…" });
        const n = await W({
          posts: s.posts,
          pages: s.pages,
          terms: s.terms,
          settings: s.settings,
          config: a
        });
        e({ level: "info", message: "Regenerating robots.txt…" }), await B({
          config: a,
          baseUrl: s.settings.baseUrl,
          discourageIndexing: s.settings.discourageIndexing === !0
        }), e({
          level: "success",
          message: `Sitemaps: ${l.uploaded.length + n.uploaded.length + 1} file(s) uploaded.`
        });
      }
    });
  }
};
export {
  Ve as manifest
};
