import { CliError } from "../output";
import type { Command, CommandContext } from "./types";

// `agentcms regenerate <what>` — the admin's Regenerate menu, entry by
// entry, with the same calls:
//   home        Home page only (regenerateHomeOnly)
//   all         All HTML pages (regenerateAll, fresh terms)
//   repair      Repair URLs (repairPublishPaths, fresh terms)
//   assets      Theme assets (syncThemeAssets of every installed theme)
//   everything  assets + all + every plugin regeneration target
//   <target>    one plugin / theme regeneration target (e.g. agentcms-sitemaps)
//   targets     list the targets this site has

async function run({ io, options, positionals }: CommandContext): Promise<number | void> {
  const what = positionals[0];
  if (!what) throw new CliError("usage", "regenerate needs what to regenerate.", "home, all, repair, assets, everything, targets, or a target id (see `regenerate targets`).", 2);
  const { runAdmin } = await import("../ops/adminCommon");
  const alias = options.site as string | undefined;
  const readOnly = what === "targets";
  return runAdmin(io, alias, readOnly ? { extensions: true } : { write: true, hosting: true, extensions: true, lock: true }, async (s) =>
    // One storage batch: one commit on git hostings, everything written
    // before the command returns.
    (await import("../../src/services/siteFiles")).withStorageBatch(async () => {
    const { listRegenerationTargets } = await import("../../src/core/regenerationTargetRegistry");
    const targets = listRegenerationTargets();
    const pub = s.host.publisher;
    const started = Date.now();
    const runTargets = async (list: typeof targets, ctx: Awaited<ReturnType<typeof s.context>>) => {
      for (const t of list) {
        try {
          await t.run(ctx, s.log);
        } catch (err) {
          s.log({ level: "error", message: `Plugin "${t.id}" regen failed: ${(err as Error).message}` });
        }
      }
    };
    const syncAssets = async () => {
      const { syncThemeAssets } = await import("../../src/services/themeSync");
      await syncThemeAssets(s.host.themes.listThemes(), s.settings().themeConfigs, s.log);
    };
    switch (what) {
      case "targets":
        return { targets: targets.map((t) => ({ id: t.id, priority: t.priority ?? 100 })) };
      case "home": {
        await pub.regenerateHomeOnly(await s.context(), s.log);
        break;
      }
      case "all": {
        await pub.regenerateAll(await s.context({ refreshTerms: true }), s.log);
        break;
      }
      case "repair": {
        const ctx = await s.context({ refreshTerms: true });
        const before = [...ctx.posts, ...ctx.pages].map((p) => ({ ...p }));
        const res = await pub.repairPublishPaths(ctx, s.log);
        const { fetchAllPosts, invalidateAllPostsCache } = await import("../../src/services/posts");
        invalidateAllPostsCache();
        const after = [...(await fetchAllPosts({ type: "post" })), ...(await fetchAllPosts({ type: "page" }))];
        // Links typed into theme / plugin settings and menu URLs don't
        // follow the moved pages.
        const m = await import("../ops/adminCommon");
        const staleLinks = m.reportStaleLinks(s, m.pathMoves(before, after));
        return { what, ...res, staleLinks, seconds: Math.round((Date.now() - started) / 1000) };
      }
      case "assets": {
        await syncAssets();
        break;
      }
      case "everything": {
        await syncAssets();
        const ctx = await s.context({ refreshTerms: true });
        await pub.regenerateAll(ctx, s.log);
        await runTargets(targets, ctx);
        break;
      }
      default: {
        const t = targets.find((x) => x.id === what);
        if (!t) {
          throw new CliError("unknown-target", `"${what}" is not a regeneration of this site.`, `Use home, all, repair, assets, everything${targets.length ? ` or one of: ${targets.map((x) => x.id).join(", ")}` : ""}.`, 2);
        }
        await runTargets([t], await s.context());
      }
    }
    return { what, seconds: Math.round((Date.now() - started) / 1000) };
  }), (r) => ("targets" in r && r.targets ? (r.targets.length ? r.targets.map((t) => `${t.id}`).join("\n") : "No plugin regeneration target.") : `Regenerated ${"what" in r ? r.what : ""} in ${"seconds" in r ? r.seconds : 0}s.`));
}

export const regenerateCommand: Command = {
  name: "regenerate",
  summary:
    "The admin's Regenerate menu: home (home page), all (every HTML page), repair (fix moved URLs), assets (theme CSS/JS), everything (assets + all pages + every plugin target), <target-id> (one plugin's files, e.g. agentcms-sitemaps), targets (list them). Needed after changing settings, menus, terms, plugins or themes — saving those doesn't republish pages.",
  usage: "regenerate <home|all|repair|assets|everything|targets|<target-id>> --site <alias>",
  options: [{ name: "site", type: "string", description: "Site alias." }],
  run,
};
