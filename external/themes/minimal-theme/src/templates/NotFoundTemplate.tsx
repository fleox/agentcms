import type { NotFoundTemplateProps, SiteContext } from "@agent-cms/runtime";

// Rendered to 404.html by "Regenerate all" only. Receives { site }.
export function NotFoundTemplate({ site }: NotFoundTemplateProps & { site: SiteContext }) {
  return (
    <article>
      <h1>404 — Not found</h1>
      <p>The page you're looking for doesn't exist.</p>
      <p>
        <a href={site.homePath ?? "/index.html"}>Back to home</a>
      </p>
    </article>
  );
}
