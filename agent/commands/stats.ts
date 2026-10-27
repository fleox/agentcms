import type { Command, CommandContext } from "./types";

// `agentcms stats` — the dashboard: posts / pages (total, online,
// draft) and the agentcms-metrics card (terms, media, users). Counted
// from the same services as the admin, on every backend.

async function run({ io, options }: CommandContext): Promise<number | void> {
  const { runAdmin } = await import("../ops/adminCommon");
  return runAdmin(io, options.site as string | undefined, {}, async (s) => {
    const { fetchAllPosts, invalidateAllPostsCache } = await import("../../src/services/posts");
    invalidateAllPostsCache();
    const [posts, pages, terms, media, users] = await Promise.all([
      fetchAllPosts({ type: "post" }),
      fetchAllPosts({ type: "page" }),
      s.terms(),
      s.media(),
      s.users(),
    ]);
    const split = (list: typeof posts) => ({
      total: list.length,
      online: list.filter((p) => p.status === "online").length,
      draft: list.filter((p) => p.status !== "online").length,
    });
    return {
      posts: split(posts),
      pages: split(pages),
      terms: { total: terms.length, categories: terms.filter((t) => t.type === "category").length, tags: terms.filter((t) => t.type === "tag").length },
      media: media.length,
      users: users.length,
    };
  }, (r) =>
    [
      `Posts  ${r.posts.total} (${r.posts.online} online, ${r.posts.draft} draft)`,
      `Pages  ${r.pages.total} (${r.pages.online} online, ${r.pages.draft} draft)`,
      `Terms  ${r.terms.total} (${r.terms.categories} categories, ${r.terms.tags} tags)`,
      `Media  ${r.media}`,
      `Users  ${r.users}`,
    ].join("\n"));
}

export const statsCommand: Command = {
  name: "stats",
  summary: "The dashboard's numbers: posts and pages (total / online / draft), terms (categories / tags), media, users.",
  usage: "stats --site <alias>",
  options: [{ name: "site", type: "string", description: "Site alias." }],
  run,
};
