import type { AuthorTemplateProps, SiteContext } from "@agent-cms/runtime";
import { i18n, pickFormat, pickPublicLocale } from "@agent-cms/runtime";
import { ProjectCard } from "../components/ProjectCard";
import type { PortfolioThemeConfig } from "../config";
import { DEFAULT_PORTFOLIO_AUTHOR } from "../config";

// Author archive — 4-col avatar / 8-col bio split, then optional
// experience + recognition lists, then a uniform grid of the
// author's projects. The experience / recognition sections only
// render when they have items (no content source yet).
export function AuthorTemplate({
  author,
  posts,
  site,
}: AuthorTemplateProps & { site: SiteContext }) {
  const { settings } = site;
  const t = i18n.getFixedT(pickPublicLocale(settings.language), "theme-portfolio");
  const themeConfig = site.themeConfig as PortfolioThemeConfig | undefined;
  const config = { ...DEFAULT_PORTFOLIO_AUTHOR, ...(themeConfig?.author ?? {}) };
  // No content source yet — kept as empty lists so the sections stay
  // hidden until one exists.
  const experience: string[] = [];
  const recognition: string[] = [];
  const avatarUrl = author.avatar
    ? pickFormat(author.avatar, "portrait") || pickFormat(author.avatar)
    : "";

  return (
    <article className="max-w-container-max mx-auto px-margin-edge-mobile md:px-margin-edge py-section-gap-mobile md:py-section-gap">
      <section className="grid grid-cols-12 gap-gutter mb-section-gap-mobile md:mb-section-gap">
        <aside className="col-span-12 md:col-span-4">
          {avatarUrl && (
            <img
              src={avatarUrl}
              alt={author.displayName}
              className="w-full aspect-[4/5] object-cover"
              loading="lazy"
            />
          )}
        </aside>

        <div className="col-span-12 md:col-span-8 flex flex-col">
          <h1 className="font-serif text-display-lg-mobile md:text-display-lg text-on-surface mb-12 display-serif">
            {author.displayName}
          </h1>
          {author.title && (
            <p className="font-sans text-label-sm uppercase tracking-widest text-secondary mb-6">
              {author.title}
            </p>
          )}
          {author.bio && (
            <div className="portfolio-prose">
              <p>{author.bio}</p>
            </div>
          )}

          {/* "Select Experience" / "Recognition" sections: there is no
              content source for them yet (no author field, no block), so
              they render only once they have items — never an empty
              heading. */}
          {config.showExperience && experience.length > 0 && (
            <section className="mt-16">
              <h2 className="font-sans text-label-sm uppercase tracking-widest text-secondary mb-6">
                {t("publicBaked.selectExperience")}
              </h2>
              <ul className="flex flex-col gap-3 font-sans text-body-md text-on-surface">
                {experience.map((item, i) => (
                  <li key={i}>{item}</li>
                ))}
              </ul>
            </section>
          )}

          {config.showRecognition && recognition.length > 0 && (
            <section className="mt-16">
              <h2 className="font-sans text-label-sm uppercase tracking-widest text-secondary mb-6">
                {t("publicBaked.recognition")}
              </h2>
              <ul className="flex flex-col gap-3 font-sans text-body-md text-on-surface">
                {recognition.map((item, i) => (
                  <li key={i}>{item}</li>
                ))}
              </ul>
            </section>
          )}
        </div>
      </section>

      {posts.length > 0 && (
        <section className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-gutter">
          {posts.map((card) => (
            <ProjectCard key={card.id} card={card} />
          ))}
        </section>
      )}
    </article>
  );
}
