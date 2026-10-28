import { createRequire as __acmsRequire } from "node:module";
import { fileURLToPath as __acmsPath } from "node:url";
import { dirname as __acmsDirname } from "node:path";
const require2 = __acmsRequire(import.meta.url);
const __filename = __acmsPath(import.meta.url);
const __dirname = __acmsDirname(__filename);
import "./media-CLjYCc_a.mjs";
import { p as pickPublicLocale } from "./index-DCzLoAau.mjs";
import { c as basePathFromBaseUrl } from "./authorsJsonPublisher-C54IzCxb.mjs";
import { pathToPublicUrl, buildPostUrl, canonicalUrl } from "./slug-CZzRNKy4.mjs";
import { u as uploadFile, d as deleteFile } from "./siteFiles-DJqhBc65.mjs";
import { b as applyFiltersSync, a as applyFilters } from "./pluginRegistry-D4QLSYaL.mjs";
import "./runtimeConfig-2M2d2Pbu.mjs";
import "./firebaseClient-D3fvED27.mjs";
import "./index-B4MbpTF6.mjs";
import "./index.esm2017-C4mMOVmK.mjs";
import "util";
import "crypto";
import "process";
import "tls";
import "fs";
import "os";
import "net";
import "events";
import "stream";
import "./_commonjsHelpers-DtUDk_0l.mjs";
import "path";
import "http2";
import "http";
import "url";
import "dns";
import "zlib";
import "./index-BzGlTM6h.mjs";
import "./imageFormats-C1E7toWk.mjs";
import "./themeLogo-ASG0LCVF.mjs";
import "./index-BA9sR5p-.mjs";
import "./toast-CYyyaSAW.mjs";
import "./types-DAD44Ttj.mjs";
import "./media-K2GXb5Xy.mjs";
import "../agentcms.mjs";
import "node:util";
import "node:fs";
import "node:path";
import "node:url";
import "node:os";
import "node:child_process";
import "node:http";
import "./registry-CqDse1x2.mjs";
import "./gitStore-JGTWtX_B.mjs";
import "./index-K8rfbNOg.mjs";
import "buffer";
import "./batch-686_kLtP.mjs";
import "./blockRegistry-BotpJ4Ww.mjs";
import "./index--QpyX5Bx.mjs";
import "./dashboardCardRegistry-2rhwfBuU.mjs";
import "./externalRegistry-DuO0IV8e.mjs";
import "./markdown-74eSpmsS.mjs";
import "./posts-9fdjvKu4.mjs";
import "./taxonomies-BeUbd-6P.mjs";
import "./users-B96x6_1o.mjs";
import "./menuResolver-BEzafl_Y.mjs";
import "./menuPublisher-DrGXU1DZ.mjs";
import "./regenerationTargetRegistry-3NmN64mg.mjs";
import "./settings-9I4hJAEM.mjs";
import "./settings-DlkdUVwn.mjs";
import "./generator-CZk03Fie.mjs";
import "./index-D5aHWd8R.mjs";
const SITEMAP_XSL_PATH = "sitemaps/sitemap.xsl";
const SITEMAP_NEWS_XSL_PATH = "sitemaps/sitemap-news.xsl";
const LABELS = {
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
function pickLocale(language) {
  return pickPublicLocale(language);
}
const COMMON_CSS = `
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
function buildSitemapXsl(language) {
  const locale = pickLocale(language);
  const L = LABELS[locale];
  return `<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="1.0"
  xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
  xmlns:s="http://www.sitemaps.org/schemas/sitemap/0.9"
  exclude-result-prefixes="s">
  <xsl:output method="html" version="1.0" encoding="UTF-8" indent="yes"
              doctype-system="about:legacy-compat"/>
  <xsl:template match="/">
    <html lang="${locale}">
      <head>
        <title>${L.pageTitle}</title>
        <meta charset="utf-8"/>
        <meta name="robots" content="noindex,follow"/>
        <meta name="viewport" content="width=device-width, initial-scale=1"/>
        <style type="text/css">${COMMON_CSS}</style>
      </head>
      <body>
        <main>
          <h1>${L.heading}</h1>
          <p class="meta">${L.meta}</p>
          <xsl:choose>
            <xsl:when test="s:sitemapindex">
              <p class="count">${L.indexCountBefore}<xsl:value-of select="count(s:sitemapindex/s:sitemap)"/>${L.indexCountAfter}</p>
              <table>
                <thead><tr><th>${L.columnSitemap}</th><th>${L.columnLastmod}</th></tr></thead>
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
              <p class="count">${L.urlCountBefore}<xsl:value-of select="count(s:urlset/s:url)"/>${L.urlCountAfter}</p>
              <table>
                <thead><tr><th>${L.columnUrl}</th><th>${L.columnLastmod}</th></tr></thead>
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
function buildNewsSitemapXsl(language) {
  const locale = pickLocale(language);
  const L = LABELS[locale];
  return `<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="1.0"
  xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
  xmlns:s="http://www.sitemaps.org/schemas/sitemap/0.9"
  xmlns:n="http://www.google.com/schemas/sitemap-news/0.9"
  exclude-result-prefixes="s n">
  <xsl:output method="html" version="1.0" encoding="UTF-8" indent="yes"
              doctype-system="about:legacy-compat"/>
  <xsl:template match="/">
    <html lang="${locale}">
      <head>
        <title>${L.newsPageTitle}</title>
        <meta charset="utf-8"/>
        <meta name="robots" content="noindex,follow"/>
        <meta name="viewport" content="width=device-width, initial-scale=1"/>
        <style type="text/css">${COMMON_CSS}</style>
      </head>
      <body>
        <main>
          <h1>${L.newsHeading}</h1>
          <p class="meta">${L.meta}</p>
          <p class="count">${L.newsCountBefore}<xsl:value-of select="count(s:urlset/s:url)"/>${L.newsCountAfter}</p>
          <table>
            <thead><tr><th>${L.columnTitle}</th><th>${L.columnPubdate}</th></tr></thead>
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
const DEFAULT_SITEMAPS_CONFIG = {
  newsEnabled: false,
  newsWindowDays: 2,
  contentTypes: "posts-pages",
  robotsTxt: ""
};
const SITEMAPS_FOLDER = "sitemaps";
const SITEMAP_INDEX_PATH = `${SITEMAPS_FOLDER}/sitemap-index.xml`;
const SITEMAP_NEWS_PATH = `${SITEMAPS_FOLDER}/sitemap-news.xml`;
const ROBOTS_PATH = "robots.txt";
function yearlySitemapPath(year) {
  return `${SITEMAPS_FOLDER}/sitemap-${year}.xml`;
}
const LEGACY_ROOT_STATIC = [
  "sitemap-index.xml",
  "sitemap-news.xml",
  "sitemap.xsl",
  "sitemap-news.xsl"
];
function legacyYearlyPath(year) {
  return `sitemap-${year}.xml`;
}
function defaultRobotsTxt(baseUrl, newsEnabled) {
  const lines = ["User-agent: *", "Allow: /", `Disallow: ${basePathFromBaseUrl(baseUrl)}/admin/`, ""];
  if (baseUrl) {
    lines.push(`Sitemap: ${pathToPublicUrl(baseUrl, SITEMAP_INDEX_PATH)}`);
    if (newsEnabled) lines.push(`Sitemap: ${pathToPublicUrl(baseUrl, SITEMAP_NEWS_PATH)}`);
  }
  return lines.join("\n") + "\n";
}
const STATIC_HOME_PATH = "index.html";
function isStaticHomePage(post, settings) {
  return post.type === "page" && settings.homeMode === "static-page" && !!settings.homePageId && settings.homePageId === post.id;
}
function locUrl(baseUrl, path) {
  return canonicalUrl(baseUrl, path);
}
function entityFromPost(post, terms, settings) {
  let path;
  try {
    const term = post.primaryTermId ? terms.find((t) => t.id === post.primaryTermId) : void 0;
    path = isStaticHomePage(post, settings) ? STATIC_HOME_PATH : buildPostUrl({ post, primaryTerm: term });
  } catch {
    return null;
  }
  const created = post.createdAt?.toMillis?.() ?? post.publishedAt?.toMillis?.() ?? Date.now();
  const updated = post.updatedAt?.toMillis?.() ?? created;
  return {
    path,
    createdAtMs: created,
    updatedAtMs: updated,
    title: post.title || post.slug,
    sourcePost: post
  };
}
function gatherEntities(posts, pages, terms, settings, config) {
  const out = [];
  for (const p of posts) {
    if (p.status !== "online") continue;
    const e = entityFromPost(p, terms, settings);
    if (e) out.push(e);
  }
  if (config.contentTypes === "posts-pages") {
    for (const p of pages) {
      if (p.status !== "online") continue;
      const e = entityFromPost(p, terms, settings);
      if (e) out.push(e);
    }
  }
  return out;
}
function groupByYear(entities) {
  const map = /* @__PURE__ */ new Map();
  for (const e of entities) {
    const year = new Date(e.createdAtMs).getUTCFullYear();
    const list = map.get(year) ?? [];
    list.push(e);
    map.set(year, list);
  }
  return map;
}
function escapeXml(value) {
  return value.replace(/[&<>"']/g, (c) => {
    switch (c) {
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
function isoDate(ms) {
  return new Date(ms).toISOString();
}
function isoDateOnly(ms) {
  return new Date(ms).toISOString().slice(0, 10);
}
function preamble(xslHref) {
  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    `<?xml-stylesheet type="text/xsl" href="${escapeXml(xslHref)}"?>`
  ].join("\n");
}
function buildYearSitemap(entities, terms, settings, baseUrl, xslHref, extraUrls) {
  const extraNamespaces = applyFiltersSync(
    "sitemap.urlset.namespaces",
    {},
    { kind: "year", baseUrl }
  );
  const nsAttrs = Object.entries(extraNamespaces).map(([k, v]) => ` ${escapeXml(k)}="${escapeXml(v)}"`).join("");
  const lines = [
    preamble(xslHref),
    `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"${nsAttrs}>`
  ];
  for (const e of entities) {
    const extraInner = applyFiltersSync(
      "sitemap.url.entry",
      "",
      // `terms` + `settings` let handlers (multilang alternates) resolve
      // localised paths without relying on module-level snapshots.
      { entity: e.sourcePost, baseUrl, path: e.path, lastmodMs: e.updatedAtMs, terms, settings }
    );
    lines.push("  <url>");
    lines.push(`    <loc>${escapeXml(locUrl(baseUrl, e.path))}</loc>`);
    lines.push(`    <lastmod>${isoDateOnly(e.updatedAtMs)}</lastmod>`);
    if (extraInner) lines.push(extraInner);
    lines.push("  </url>");
  }
  for (const extra of extraUrls) {
    const lastmod = extra.lastmodMs ?? Date.now();
    lines.push("  <url>");
    lines.push(`    <loc>${escapeXml(locUrl(baseUrl, extra.path))}</loc>`);
    lines.push(`    <lastmod>${isoDateOnly(lastmod)}</lastmod>`);
    if (extra.extraInnerXml) lines.push(extra.extraInnerXml);
    lines.push("  </url>");
  }
  lines.push("</urlset>");
  return lines.join("\n");
}
function buildSitemapIndex(years, includeNews, baseUrl, lastmodMs, xslHref, extraEntries) {
  const lines = [
    preamble(xslHref),
    '<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">'
  ];
  const date = isoDateOnly(lastmodMs);
  for (const year of [...years].sort((a, b) => a - b)) {
    lines.push("  <sitemap>");
    lines.push(`    <loc>${escapeXml(pathToPublicUrl(baseUrl, yearlySitemapPath(year)))}</loc>`);
    lines.push(`    <lastmod>${date}</lastmod>`);
    lines.push("  </sitemap>");
  }
  if (includeNews) {
    lines.push("  <sitemap>");
    lines.push(`    <loc>${escapeXml(pathToPublicUrl(baseUrl, SITEMAP_NEWS_PATH))}</loc>`);
    lines.push(`    <lastmod>${date}</lastmod>`);
    lines.push("  </sitemap>");
  }
  for (const extra of extraEntries) {
    const lastmod = extra.lastmodMs ?? lastmodMs;
    lines.push("  <sitemap>");
    lines.push(`    <loc>${escapeXml(pathToPublicUrl(baseUrl, extra.path))}</loc>`);
    lines.push(`    <lastmod>${isoDateOnly(lastmod)}</lastmod>`);
    lines.push("  </sitemap>");
  }
  lines.push("</sitemapindex>");
  return lines.join("\n");
}
function buildNewsSitemap(entities, siteName, siteLanguage, baseUrl, windowDays, xslHref) {
  const cutoff = Date.now() - windowDays * 24 * 60 * 60 * 1e3;
  const recent = entities.filter((e) => e.updatedAtMs >= cutoff).sort((a, b) => b.updatedAtMs - a.updatedAtMs);
  const lines = [
    preamble(xslHref),
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"',
    '        xmlns:news="http://www.google.com/schemas/sitemap-news/0.9">'
  ];
  const safeSiteName = escapeXml(siteName || "Site");
  const safeLanguage = escapeXml((siteLanguage || "en").split("-")[0] || "en");
  for (const e of recent) {
    lines.push("  <url>");
    lines.push(`    <loc>${escapeXml(locUrl(baseUrl, e.path))}</loc>`);
    lines.push("    <news:news>");
    lines.push("      <news:publication>");
    lines.push(`        <news:name>${safeSiteName}</news:name>`);
    lines.push(`        <news:language>${safeLanguage}</news:language>`);
    lines.push("      </news:publication>");
    lines.push(`      <news:publication_date>${isoDate(e.updatedAtMs)}</news:publication_date>`);
    lines.push(`      <news:title>${escapeXml(e.title)}</news:title>`);
    lines.push("    </news:news>");
    lines.push("  </url>");
  }
  lines.push("</urlset>");
  return lines.join("\n");
}
async function regenerateSitemaps(args) {
  const { posts, pages, terms, settings, config, scope } = args;
  const baseUrl = (settings.baseUrl || "").replace(/\/+$/, "");
  if (!baseUrl) throw new Error("baseUrl is empty — cannot build sitemap URLs.");
  const entities = gatherEntities(posts, pages, terms, settings, config);
  const yearMap = groupByYear(entities);
  const allYears = [...yearMap.keys()];
  const targetYears = scope?.years ?? allYears;
  const uploaded = [];
  const deleted = [];
  if (!scope) {
    const legacyPaths = [
      ...LEGACY_ROOT_STATIC,
      ...allYears.map((y) => legacyYearlyPath(y))
    ];
    for (const path of legacyPaths) {
      try {
        await deleteFile(path);
        deleted.push(path);
      } catch {
      }
    }
  }
  const xslHref = pathToPublicUrl(baseUrl, SITEMAP_XSL_PATH);
  const newsXslHref = pathToPublicUrl(baseUrl, SITEMAP_NEWS_XSL_PATH);
  for (const year of targetYears) {
    const list = yearMap.get(year) ?? [];
    const extraUrls = applyFiltersSync(
      "sitemap.urls.extra",
      [],
      { posts, pages, terms, settings, year, scope: "year" }
    );
    const path = yearlySitemapPath(year);
    if (list.length === 0 && extraUrls.length === 0) {
      try {
        await deleteFile(path);
        deleted.push(path);
      } catch {
      }
      continue;
    }
    const xml = buildYearSitemap(list, terms, settings, baseUrl, xslHref, extraUrls);
    await uploadFile({ path, content: xml });
    uploaded.push(path);
  }
  if (scope?.index !== false) {
    const livingYears = [...yearMap.entries()].filter(([, list]) => list.length > 0).map(([year]) => year);
    const extraIndexEntries = applyFiltersSync(
      "sitemap.index.extra",
      [],
      { settings }
    );
    const xml = buildSitemapIndex(
      livingYears,
      config.newsEnabled,
      baseUrl,
      Date.now(),
      xslHref,
      extraIndexEntries
    );
    await uploadFile({ path: SITEMAP_INDEX_PATH, content: xml });
    uploaded.push(SITEMAP_INDEX_PATH);
  }
  if (scope?.news !== false) {
    if (config.newsEnabled) {
      const xml = buildNewsSitemap(
        entities,
        settings.title,
        settings.language,
        baseUrl,
        config.newsWindowDays,
        newsXslHref
      );
      await uploadFile({ path: SITEMAP_NEWS_PATH, content: xml });
      uploaded.push(SITEMAP_NEWS_PATH);
      const localeEntries = await applyFilters(
        "sitemap.news.locales",
        [],
        { posts, pages, terms, settings, config }
      );
      for (const entry of localeEntries) {
        if (!entry.path || !entry.language) continue;
        const localeXml = buildNewsSitemap(
          entry.entities,
          settings.title,
          entry.language,
          baseUrl,
          config.newsWindowDays,
          newsXslHref
        );
        await uploadFile({ path: entry.path, content: localeXml });
        uploaded.push(entry.path);
      }
    } else {
      try {
        await deleteFile(SITEMAP_NEWS_PATH);
        deleted.push(SITEMAP_NEWS_PATH);
      } catch {
      }
    }
  }
  return { uploaded, deleted };
}
async function regenerateRobotsTxt(args) {
  const baseUrl = (args.baseUrl || "").replace(/\/+$/, "");
  let content;
  if (args.discourageIndexing) {
    content = "User-agent: *\nDisallow: /\n";
  } else if (args.config.robotsTxt && args.config.robotsTxt.trim().length > 0 && !isStaleDefaultRobots(args.config.robotsTxt, baseUrl, args.config.newsEnabled)) {
    content = args.config.robotsTxt;
  } else {
    content = defaultRobotsTxt(baseUrl, args.config.newsEnabled);
  }
  await uploadFile({ path: ROBOTS_PATH, content });
}
function isStaleDefaultRobots(stored, baseUrl, newsEnabled) {
  const base = basePathFromBaseUrl(baseUrl);
  if (!base) return false;
  const current = defaultRobotsTxt(baseUrl, newsEnabled);
  const legacy = current.replace(`Disallow: ${base}/admin/`, "Disallow: /admin/");
  return stored.trim() === legacy.trim();
}
async function regenerateStylesheets(args) {
  const uploaded = [];
  const deleted = [];
  for (const path of LEGACY_ROOT_STATIC) {
    try {
      await deleteFile(path);
      deleted.push(path);
    } catch {
    }
  }
  await uploadFile({
    path: SITEMAP_XSL_PATH,
    content: buildSitemapXsl(args.settings.language)
  });
  uploaded.push(SITEMAP_XSL_PATH);
  if (args.config.newsEnabled) {
    await uploadFile({
      path: SITEMAP_NEWS_XSL_PATH,
      content: buildNewsSitemapXsl(args.settings.language)
    });
    uploaded.push(SITEMAP_NEWS_XSL_PATH);
  } else {
    try {
      await deleteFile(SITEMAP_NEWS_XSL_PATH);
      deleted.push(SITEMAP_NEWS_XSL_PATH);
    } catch {
    }
  }
  return { uploaded, deleted };
}
async function regenerateForPost(args) {
  const created = args.post.createdAt?.toMillis?.() ?? args.post.publishedAt?.toMillis?.() ?? args.post.updatedAt?.toMillis?.() ?? Date.now();
  const year = new Date(created).getUTCFullYear();
  return regenerateSitemaps({
    posts: args.posts,
    pages: args.pages,
    terms: args.terms,
    settings: args.settings,
    config: args.config,
    scope: { years: [year] }
  });
}
export {
  DEFAULT_SITEMAPS_CONFIG,
  ROBOTS_PATH,
  SITEMAP_INDEX_PATH,
  SITEMAP_NEWS_PATH,
  defaultRobotsTxt,
  isStaticHomePage,
  regenerateForPost,
  regenerateRobotsTxt,
  regenerateSitemaps,
  regenerateStylesheets
};
