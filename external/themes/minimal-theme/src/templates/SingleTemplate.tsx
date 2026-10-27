import type { SingleTemplateProps, SiteContext } from "@agent-cms/runtime";

// Used for posts AND pages (post.type). bodyHtml is already sanitized
// and transformed by the post.html.body filters.
export function SingleTemplate({ post, bodyHtml, author }: SingleTemplateProps & { site: SiteContext }) {
  return (
    <article>
      <header>
        <h1>{post.title}</h1>
        {post.type === "post" && author && <p className="mt-meta">By {author.displayName}</p>}
      </header>
      <div dangerouslySetInnerHTML={{ __html: bodyHtml }} />
    </article>
  );
}
