import { createRequire as __acmsRequire } from "node:module";
import { fileURLToPath as __acmsPath } from "node:url";
import { dirname as __acmsDirname } from "node:path";
const require2 = __acmsRequire(import.meta.url);
const __filename = __acmsPath(import.meta.url);
const __dirname = __acmsDirname(__filename);
import { a as buildRssFeedXml } from "./media-DXyPyMZf.mjs";
import { p as pickPublicLocale } from "./index-DCzLoAau.mjs";
import { u as uploadFile, d as deleteFile } from "./siteFiles-D207OaeL.mjs";
import { pathToPublicUrl, buildTermUrl, buildPostUrl } from "./slug-CZzRNKy4.mjs";
import { a as applyFilters } from "./pluginRegistry-D4QLSYaL.mjs";
import { markdownToPlainText } from "./markdown-74eSpmsS.mjs";
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
import "./themeLogo-DZLpUhvn.mjs";
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
import "./registry-B41SEnnT.mjs";
import "./gitStore-ueM10Bby.mjs";
import "./index-K8rfbNOg.mjs";
import "buffer";
import "./batch-BGzHdUjc.mjs";
import "./blockRegistry-BotpJ4Ww.mjs";
import "./index--QpyX5Bx.mjs";
import "./dashboardCardRegistry-2rhwfBuU.mjs";
import "./externalRegistry-DuO0IV8e.mjs";
import "./authorsJsonPublisher-OsQuYFnl.mjs";
import "./users-D6P4Wv2E.mjs";
import "./posts-BwMIoSkg.mjs";
import "./taxonomies-CjlJL2MS.mjs";
import "./menuResolver-BEzafl_Y.mjs";
import "./menuPublisher-Bi2lvz6b.mjs";
import "./regenerationTargetRegistry-3NmN64mg.mjs";
import "./settings-DZuDcOE5.mjs";
import "./settings-DlkdUVwn.mjs";
import "./generator-DePwKO9n.mjs";
import "./index-D5aHWd8R.mjs";
const RSS_XSL_PATH = "rss.xsl";
const LABELS = {
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
.title { width: 40%; }
.pubdate { white-space: nowrap; color: #4b5563; width: 200px; }
.description { color: #4b5563; }
`;
function buildRssXsl(language) {
  const locale = pickLocale(language);
  const L = LABELS[locale];
  return `<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="1.0"
  xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
  xmlns:atom="http://www.w3.org/2005/Atom">
  <xsl:output method="html" version="1.0" encoding="UTF-8" indent="yes"
              doctype-system="about:legacy-compat"/>
  <xsl:template match="/">
    <html lang="${locale}">
      <head>
        <title>${L.pageTitle} — <xsl:value-of select="/rss/channel/title"/></title>
        <meta charset="utf-8"/>
        <meta name="robots" content="noindex,follow"/>
        <meta name="viewport" content="width=device-width, initial-scale=1"/>
        <style type="text/css">${COMMON_CSS}</style>
      </head>
      <body>
        <main>
          <h1>${L.heading} — <xsl:value-of select="/rss/channel/title"/></h1>
          <p class="meta">${L.meta}</p>
          <p class="count">${L.countBefore}<xsl:value-of select="count(/rss/channel/item)"/>${L.countAfter}</p>
          <table>
            <thead>
              <tr>
                <th class="title">${L.columnTitle}</th>
                <th class="pubdate">${L.columnPubdate}</th>
                <th class="description">${L.columnDescription}</th>
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
const SITE_RSS_PATH = "rss.xml";
const DEFAULT_RSS_CONFIG = {
  site: {
    enabled: false,
    itemCount: 20,
    excludedTermIds: [],
    addToFooter: false
  },
  categoryFeeds: []
};
function categoryFeedPath(slug) {
  return `${slug}/${slug}.xml`;
}
function postEnclosure(post, mediaMap) {
  if (!post.heroMediaId) return null;
  const media = mediaMap.get(post.heroMediaId);
  if (!media) return null;
  if (media.formats && Object.keys(media.formats).length > 0) {
    const variant = media.formats["large"] ?? (media.defaultFormat ? media.formats[media.defaultFormat] : void 0) ?? Object.values(media.formats)[0];
    if (variant?.url) {
      return {
        url: variant.url,
        length: variant.bytes ?? 0,
        type: media.contentType || guessImageType(variant.url)
      };
    }
  }
  if (media.url) {
    return {
      url: media.url,
      length: media.size ?? 0,
      type: media.contentType || guessImageType(media.url)
    };
  }
  return null;
}
function guessImageType(url) {
  const lower = url.toLowerCase();
  if (lower.endsWith(".webp")) return "image/webp";
  if (lower.endsWith(".png")) return "image/png";
  if (lower.endsWith(".gif")) return "image/gif";
  if (lower.endsWith(".avif")) return "image/avif";
  if (lower.endsWith(".jpg") || lower.endsWith(".jpeg")) return "image/jpeg";
  return "image/jpeg";
}
function postToRssItem(post, terms, mediaMap, baseUrl) {
  const term = post.primaryTermId ? terms.find((t) => t.id === post.primaryTermId && t.type === "category") : void 0;
  let path;
  try {
    path = buildPostUrl({ post, primaryTerm: term });
  } catch {
    return null;
  }
  const url = pathToPublicUrl(baseUrl, path);
  const description = (post.excerpt && post.excerpt.trim().length > 0 ? post.excerpt : markdownToPlainText(post.contentMarkdown, 300)).trim();
  const pubDateMs = post.publishedAt?.toMillis?.() ?? post.updatedAt?.toMillis?.() ?? post.createdAt?.toMillis?.() ?? Date.now();
  return {
    title: post.title || post.slug,
    link: url,
    guid: url,
    description,
    pubDateMs,
    category: term?.name,
    enclosure: postEnclosure(post, mediaMap) ?? void 0
  };
}
function gatherSiteItems(posts, terms, mediaMap, config, baseUrl) {
  const excluded = new Set(config.site.excludedTermIds);
  return posts.filter((p) => p.status === "online").filter((p) => !p.primaryTermId || !excluded.has(p.primaryTermId)).map((p) => postToRssItem(p, terms, mediaMap, baseUrl)).filter((i) => i !== null).sort((a, b) => b.pubDateMs - a.pubDateMs).slice(0, Math.max(1, Math.min(100, config.site.itemCount)));
}
function gatherCategoryItems(posts, terms, mediaMap, feed, baseUrl) {
  return posts.filter((p) => p.status === "online" && p.primaryTermId === feed.termId).map((p) => postToRssItem(p, terms, mediaMap, baseUrl)).filter((i) => i !== null).sort((a, b) => b.pubDateMs - a.pubDateMs).slice(0, Math.max(1, Math.min(100, feed.itemCount)));
}
function buildMediaMap(media) {
  if (media instanceof Map) return media;
  return new Map(media.map((m) => [m.id, m]));
}
function buildRegenerateContext(args) {
  const baseUrl = (args.settings.baseUrl || "").replace(/\/+$/, "");
  if (!baseUrl) throw new Error("baseUrl is empty — cannot build feed URLs.");
  return {
    posts: args.posts,
    terms: args.terms,
    mediaMap: buildMediaMap(args.media),
    settings: args.settings,
    baseUrl,
    xslHref: pathToPublicUrl(baseUrl, RSS_XSL_PATH)
  };
}
async function regenerateSiteFeed(ctx, config) {
  const uploaded = [];
  const deleted = [];
  if (!config.site.enabled) {
    if (config.site.lastPublishedPath) {
      try {
        await deleteFile(config.site.lastPublishedPath);
        deleted.push(config.site.lastPublishedPath);
      } catch {
      }
    }
    for (const localePath of config.site.lastLocalePaths ?? []) {
      try {
        await deleteFile(localePath);
        deleted.push(localePath);
      } catch {
      }
    }
    return {
      uploaded,
      deleted,
      nextSite: { ...config.site, lastPublishedPath: void 0, lastLocalePaths: [] }
    };
  }
  const items = gatherSiteItems(ctx.posts, ctx.terms, ctx.mediaMap, config, ctx.baseUrl);
  const xml = buildRssFeedXml({
    title: ctx.settings.title || "Site",
    link: pathToPublicUrl(ctx.baseUrl, ""),
    description: ctx.settings.description || ctx.settings.title || "",
    feedUrl: pathToPublicUrl(ctx.baseUrl, SITE_RSS_PATH),
    language: ctx.settings.language || "en",
    items,
    xslHref: ctx.xslHref
  });
  await uploadFile({ path: SITE_RSS_PATH, content: xml });
  uploaded.push(SITE_RSS_PATH);
  const localeEntries = await applyFilters(
    "rss.site.locales",
    [],
    {
      posts: ctx.posts,
      terms: ctx.terms,
      mediaMap: ctx.mediaMap,
      settings: ctx.settings,
      config,
      baseUrl: ctx.baseUrl,
      xslHref: ctx.xslHref
    }
  );
  const nextLocalePaths = [];
  for (const entry of localeEntries) {
    if (!entry.path || !entry.language) continue;
    const localeXml = buildRssFeedXml({
      title: entry.channelTitle,
      link: entry.channelLink,
      description: entry.channelDescription,
      feedUrl: pathToPublicUrl(ctx.baseUrl, entry.path),
      language: entry.language,
      items: entry.items,
      xslHref: ctx.xslHref
    });
    await uploadFile({ path: entry.path, content: localeXml });
    uploaded.push(entry.path);
    nextLocalePaths.push(entry.path);
  }
  const nextSet = new Set(nextLocalePaths);
  for (const stale of config.site.lastLocalePaths ?? []) {
    if (nextSet.has(stale)) continue;
    try {
      await deleteFile(stale);
      deleted.push(stale);
    } catch {
    }
  }
  return {
    uploaded,
    deleted,
    nextSite: {
      ...config.site,
      lastPublishedPath: SITE_RSS_PATH,
      lastLocalePaths: nextLocalePaths
    }
  };
}
async function regenerateCategoryFeed(ctx, feed) {
  const uploaded = [];
  const deleted = [];
  const term = ctx.terms.find((t) => t.id === feed.termId && t.type === "category");
  if (!term) {
    if (feed.lastPublishedPath) {
      try {
        await deleteFile(feed.lastPublishedPath);
        deleted.push(feed.lastPublishedPath);
      } catch {
      }
    }
    return { uploaded, deleted, nextFeed: null };
  }
  const newPath = categoryFeedPath(term.slug);
  if (feed.lastPublishedPath && feed.lastPublishedPath !== newPath) {
    try {
      await deleteFile(feed.lastPublishedPath);
      deleted.push(feed.lastPublishedPath);
    } catch {
    }
  }
  const items = gatherCategoryItems(ctx.posts, ctx.terms, ctx.mediaMap, feed, ctx.baseUrl);
  const archiveLink = pathToPublicUrl(ctx.baseUrl, buildTermUrl(term));
  const channelTitle = `${ctx.settings.title || "Site"} — ${term.name}`;
  const xml = buildRssFeedXml({
    title: channelTitle,
    link: archiveLink,
    description: term.description || term.name,
    feedUrl: pathToPublicUrl(ctx.baseUrl, newPath),
    language: ctx.settings.language || "en",
    items,
    xslHref: ctx.xslHref
  });
  await uploadFile({ path: newPath, content: xml });
  uploaded.push(newPath);
  return {
    uploaded,
    deleted,
    nextFeed: { ...feed, lastPublishedPath: newPath }
  };
}
async function regenerateAllFeeds(args) {
  const ctx = buildRegenerateContext(args);
  const uploaded = [];
  const deleted = [];
  const siteOut = await regenerateSiteFeed(ctx, args.config);
  uploaded.push(...siteOut.uploaded);
  deleted.push(...siteOut.deleted);
  const nextCategory = [];
  for (const feed of args.config.categoryFeeds) {
    const out = await regenerateCategoryFeed(ctx, feed);
    uploaded.push(...out.uploaded);
    deleted.push(...out.deleted);
    if (out.nextFeed) nextCategory.push(out.nextFeed);
  }
  return {
    result: { uploaded, deleted },
    nextConfig: { site: siteOut.nextSite, categoryFeeds: nextCategory }
  };
}
async function regenerateForPost(args) {
  const ctx = buildRegenerateContext(args);
  const uploaded = [];
  const deleted = [];
  let nextSite = args.config.site;
  const nextCategory = [...args.config.categoryFeeds];
  if (args.config.site.enabled) {
    const excluded = new Set(args.config.site.excludedTermIds);
    if (!args.post.primaryTermId || !excluded.has(args.post.primaryTermId)) {
      const siteOut = await regenerateSiteFeed(ctx, args.config);
      uploaded.push(...siteOut.uploaded);
      deleted.push(...siteOut.deleted);
      nextSite = siteOut.nextSite;
    }
  }
  if (args.post.primaryTermId) {
    const idx = nextCategory.findIndex((f) => f.termId === args.post.primaryTermId);
    if (idx >= 0) {
      const out = await regenerateCategoryFeed(ctx, nextCategory[idx]);
      uploaded.push(...out.uploaded);
      deleted.push(...out.deleted);
      if (out.nextFeed) {
        nextCategory[idx] = out.nextFeed;
      } else {
        nextCategory.splice(idx, 1);
      }
    }
  }
  return {
    result: { uploaded, deleted },
    nextConfig: { site: nextSite, categoryFeeds: nextCategory }
  };
}
async function regenerateStylesheet(args) {
  await uploadFile({
    path: RSS_XSL_PATH,
    content: buildRssXsl(args.settings.language)
  });
}
async function cleanupRemovedFeeds(args) {
  const deleted = [];
  let nextSite = args.nextConfig.site;
  if (!args.nextConfig.site.enabled) {
    const stale = args.prevConfig.site.lastPublishedPath ?? SITE_RSS_PATH;
    try {
      await deleteFile(stale);
      deleted.push(stale);
    } catch {
    }
    nextSite = { ...nextSite, lastPublishedPath: void 0 };
  }
  const nextIds = new Set(args.nextConfig.categoryFeeds.map((f) => f.termId));
  for (const prev of args.prevConfig.categoryFeeds) {
    if (nextIds.has(prev.termId)) continue;
    if (prev.lastPublishedPath) {
      try {
        await deleteFile(prev.lastPublishedPath);
        deleted.push(prev.lastPublishedPath);
      } catch {
      }
    }
  }
  return {
    deleted,
    nextConfig: { site: nextSite, categoryFeeds: args.nextConfig.categoryFeeds }
  };
}
export {
  DEFAULT_RSS_CONFIG,
  SITE_RSS_PATH,
  categoryFeedPath,
  cleanupRemovedFeeds,
  regenerateAllFeeds,
  regenerateForPost,
  regenerateStylesheet
};
