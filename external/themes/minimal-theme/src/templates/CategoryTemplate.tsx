import type { CategoryTemplateProps, SiteContext } from "@agent-cms/runtime";
import { PostList } from "./PostList";

export function CategoryTemplate({ term, posts }: CategoryTemplateProps & { site: SiteContext }) {
  return (
    <article>
      <header>
        <h1>{term.name}</h1>
        {term.description && <p className="mt-meta">{term.description}</p>}
      </header>
      <PostList posts={posts} />
    </article>
  );
}
