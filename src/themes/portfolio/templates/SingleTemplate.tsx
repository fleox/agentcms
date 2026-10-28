import type { SingleTemplateProps, SiteContext } from "@agent-cms/runtime";
import { i18n, pickFormat, pickPublicLocale } from "@agent-cms/runtime";
import type { PortfolioThemeConfig } from "../config";
import { DEFAULT_PORTFOLIO_SINGLE, customLabel } from "../config";
import { extractProjectMetaYear } from "../blocks/projectMeta/render";

// Rendered portfolio/next-project banners (see blocks/nextProject/render.ts
// — the section has no nested <section>, so a lazy match is exact).
const NEXT_PROJECT_SECTION_REGEX =
  /<section class="portfolio-next-project[^"]*">[\s\S]*?<\/section>/g;

// Portfolio single — full-bleed hero (grayscale unless turned off), 4-col meta + 8-col
// intro, body markdown below in `portfolio-prose`. Pages
// (`post.type === "page"`) bypass the hero / meta and render in a
// constrained `portfolio-page-body` container.
//
// The left meta column shows the primary category (label: translated
// "Category", overridable via `single.defaultServicesLabel`) and the
// year (a project-meta block's Year row, else the publication year).
export function SingleTemplate({
  post,
  bodyHtml,
  hero,
  primaryTerm,
  site,
}: SingleTemplateProps & { site: SiteContext }) {
  const { settings } = site;
  const t = i18n.getFixedT(pickPublicLocale(settings.language), "theme-portfolio");
  const themeConfig = site.themeConfig as PortfolioThemeConfig | undefined;
  const single = { ...DEFAULT_PORTFOLIO_SINGLE, ...(themeConfig?.single ?? {}) };
  const isPage = post.type === "page";
  // `single.showNextProject: false` hides every next-project teaser
  // (portfolio/next-project block) from project pages and static pages.
  const body = single.showNextProject
    ? bodyHtml
    : bodyHtml.replace(NEXT_PROJECT_SECTION_REGEX, "");

  if (isPage) {
    return (
      <article className="pt-section-gap-mobile md:pt-section-gap pb-section-gap-mobile md:pb-section-gap">
        <div
          className="portfolio-page-body"
          dangerouslySetInnerHTML={{ __html: body }}
        />
      </article>
    );
  }

  const heroUrl = hero ? pickFormat(hero, "hero") || pickFormat(hero) : "";
  const ms =
    (post.publishedAt as { toMillis?: () => number } | undefined)?.toMillis?.() ??
    (post.createdAt as { toMillis?: () => number } | undefined)?.toMillis?.() ??
    null;
  // A portfolio/project-meta block's "Year" row wins over the
  // publication year (a project's year is rarely the day it was posted).
  const year =
    extractProjectMetaYear(bodyHtml, post.contentMarkdown) ||
    (ms ? String(new Date(ms).getUTCFullYear()) : "");
  const categoryLabel =
    customLabel(single.defaultServicesLabel) || t("publicBaked.categoryLabel");
  const yearLabel = customLabel(single.defaultYearLabel) || t("publicBaked.yearLabel");
  const eyebrow = [primaryTerm?.name?.toUpperCase(), year]
    .filter(Boolean)
    .join(" / ");

  return (
    <article>
      {single.showHero && heroUrl && (
        <section className="w-full relative h-[60vh] md:h-[80vh] overflow-hidden">
          <img
            src={heroUrl}
            alt={hero?.alt ?? post.title}
            className={`w-full h-full object-cover${single.heroGrayscale ? " grayscale" : ""}`}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent flex flex-col justify-end px-margin-edge-mobile md:px-margin-edge pb-section-gap-mobile md:pb-section-gap">
            <div className="max-w-container-max mx-auto w-full">
              {eyebrow && (
                <p className="font-sans text-label-sm uppercase tracking-[0.2em] text-on-primary/80 mb-4">
                  {eyebrow}
                </p>
              )}
              <h1 className="font-serif text-display-lg-mobile md:text-display-lg text-on-primary max-w-4xl display-serif">
                {post.title}
              </h1>
            </div>
          </div>
        </section>
      )}

      <section className="max-w-container-max mx-auto px-margin-edge-mobile md:px-margin-edge py-section-gap-mobile md:py-section-gap grid grid-cols-12 gap-gutter">
        <aside className="col-span-12 md:col-span-4 flex flex-col gap-8">
          {primaryTerm && (
            <div className="flex flex-col gap-2">
              <span className="font-sans text-label-sm uppercase text-secondary">
                {categoryLabel}
              </span>
              <p className="font-sans text-body-md text-on-surface">
                {primaryTerm.name}
              </p>
            </div>
          )}
          {year && (
            <div className="flex flex-col gap-2">
              <span className="font-sans text-label-sm uppercase text-secondary">
                {yearLabel}
              </span>
              <p className="font-sans text-body-md text-on-surface">{year}</p>
            </div>
          )}
        </aside>

        <div className="col-span-12 md:col-span-8">
          {post.excerpt && (
            <h2 className="font-serif text-headline-lg-mobile md:text-headline-lg text-on-surface mb-8">
              {post.excerpt}
            </h2>
          )}
          <div
            className="portfolio-prose"
            dangerouslySetInnerHTML={{ __html: body }}
          />
        </div>
      </section>

      {/* Related projects — filled by posts-loader.js from
          data/posts.json (same category first, else the latest ones).
          Stays hidden when there is nothing to show. */}
      <section
        className="portfolio-related max-w-container-max mx-auto px-margin-edge-mobile md:px-margin-edge pb-section-gap-mobile md:pb-section-gap"
        data-cms-related
        data-cms-current-id={post.id}
        data-cms-term-id={primaryTerm?.id ?? ""}
        data-cms-limit="3"
        data-cms-label={t("publicBaked.relatedHeading")}
        data-cms-fallback-label={t("publicBaked.relatedFallback")}
        hidden
      />
    </article>
  );
}
