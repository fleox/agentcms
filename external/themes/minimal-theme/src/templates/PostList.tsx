import type { CardPost } from "@agent-cms/runtime";

// CardPost.url has NO leading slash ("news/hello.html"): prefix it.
export function PostList({ posts, excerpts = true }: { posts: CardPost[]; excerpts?: boolean }) {
  if (posts.length === 0) return <p className="mt-meta">Nothing published yet.</p>;
  return (
    <ul className="mt-list">
      {posts.map((post) => (
        <li key={post.id}>
          <h2>
            <a href={`/${post.url}`}>{post.title}</a>
          </h2>
          {post.dateLabel && <p className="mt-meta">{post.dateLabel}</p>}
          {excerpts && post.excerpt && <p>{post.excerpt}</p>}
        </li>
      ))}
    </ul>
  );
}
