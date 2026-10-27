import type { AuthorTemplateProps, SiteContext } from "@agent-cms/runtime";
import { PostList } from "./PostList";

export function AuthorTemplate({ author, posts }: AuthorTemplateProps & { site: SiteContext }) {
  return (
    <article>
      <header>
        <h1>{author.displayName}</h1>
        {author.bio && <p>{author.bio}</p>}
      </header>
      <h2>Posts</h2>
      <PostList posts={posts} excerpts={false} />
    </article>
  );
}
