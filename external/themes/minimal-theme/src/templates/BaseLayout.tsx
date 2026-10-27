// Theme BaseLayout — wraps every page. Receives `site`, the page title,
// optional description / OG image, the page path, the page language
// and the rendered template as `children`.
//
// IMPORTANT: keep the two sentinels below, unmodified. The publisher
// string-replaces them after renderToStaticMarkup:
//   <meta name="x-cms-head-extra" />            → plugins' <head> markup
//                                                 (favicon, SEO, hreflang,
//                                                 noindex meta, …)
//   <script type="application/x-cms-body-end" /> → plugins' body scripts
// Without them those plugins silently do nothing on this theme.

import { canonicalUrl, type BaseLayoutProps } from "@agent-cms/runtime";
import { MenuList } from "./MenuList";

export function BaseLayout({
  site,
  pageTitle,
  pageDescription,
  ogImage,
  currentPath,
  currentLocale,
  children,
}: BaseLayoutProps) {
  const siteTitle = site.settings.title || "Site";
  // The latest-posts home passes an empty pageTitle.
  const title = pageTitle ? `${pageTitle} — ${siteTitle}` : siteTitle;
  // Empty when the site URL isn't set yet (canonical needs an origin).
  const canonical = canonicalUrl(site.settings.baseUrl, currentPath);
  // Localized homes (multilang) set site.homePath.
  const homeHref = site.homePath ?? "/index.html";
  return (
    <html lang={currentLocale || site.settings.language || "en"}>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>{title}</title>
        {pageDescription && <meta name="description" content={pageDescription} />}
        {canonical && <link rel="canonical" href={canonical} />}
        <meta property="og:title" content={title} />
        {canonical && <meta property="og:url" content={canonical} />}
        {ogImage && <meta property="og:image" content={ogImage} />}
        {/* rel before href: the admin preview inlines this stylesheet. */}
        <link rel="stylesheet" href={`/${site.themeCssPath}`} />
        <script defer src="/theme-assets/minimal-theme-menu.js" />
        <meta name="x-cms-head-extra" />
      </head>
      <body>
        <header className="mt-header">
          <div data-cms-brand>
            <a href={homeHref}>{siteTitle}</a>
          </div>
          <nav data-cms-menu="header">
            <MenuList items={site.resolvedMenus.header} />
          </nav>
        </header>
        <main>{children}</main>
        <footer>
          <nav data-cms-menu="footer">
            <MenuList items={site.resolvedMenus.footer} />
          </nav>
        </footer>
        <script type="application/x-cms-body-end" />
      </body>
    </html>
  );
}
