import type { NotFoundTemplateProps, SiteContext } from "@agent-cms/runtime";
import { i18n, pickPublicLocale } from "@agent-cms/runtime";

// Minimalist 404 — giant charcoal numeral, single line of body, single
// outline back-to-home link. No illustration, no shadow, no radius —
// the whole point of the theme. Copy comes from the theme's public
// i18n bundle in the site language (unsupported locales fall back to
// English).
export function NotFoundTemplate({ site }: NotFoundTemplateProps & { site: SiteContext }) {
  const t = i18n.getFixedT(pickPublicLocale(site.settings.language), "theme-portfolio");
  return (
    <article className="max-w-container-max mx-auto px-margin-edge-mobile md:px-margin-edge py-section-gap-mobile md:py-section-gap min-h-[60vh] flex flex-col items-center justify-center text-center gap-12">
      <h1 className="font-serif text-[120px] md:text-[200px] text-on-surface leading-none display-serif">
        404
      </h1>
      <p className="font-sans text-body-lg text-secondary max-w-md">
        {t("publicBaked.notFoundBody")}
      </p>
      <a href={site.homePath ?? "/index.html"} className="portfolio-btn-outline">
        {t("publicBaked.notFoundCta")}
      </a>
    </article>
  );
}
