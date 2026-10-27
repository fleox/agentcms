import type { HomeTemplateProps, SiteContext } from "@agent-cms/runtime";
import { PostList } from "./PostList";

// Two home modes: a static page chosen in Settings → General
// (`staticPage` is set) or the latest posts (`posts`).
export function HomeTemplate({ site, posts, staticPage }: HomeTemplateProps & { site: SiteContext }) {
  if (staticPage) {
    return (
      <article>
        <h1>{staticPage.post.title}</h1>
        <div dangerouslySetInnerHTML={{ __html: staticPage.bodyHtml }} />
      </article>
    );
  }
  return (
    <article>
      <h1>{site.settings.title || "Latest posts"}</h1>
      {site.settings.description && <p className="mt-meta">{site.settings.description}</p>}
      <PostList posts={posts} />
    </article>
  );
}
