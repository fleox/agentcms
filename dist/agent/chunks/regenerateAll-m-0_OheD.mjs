import { createRequire as __acmsRequire } from "node:module";
import { fileURLToPath as __acmsPath } from "node:url";
import { dirname as __acmsDirname } from "node:path";
const require2 = __acmsRequire(import.meta.url);
const __filename = __acmsPath(import.meta.url);
const __dirname = __acmsDirname(__filename);
async function regenerateEverything(s) {
  const started = Date.now();
  const { withStorageBatch } = await import("./siteFiles-DJqhBc65.mjs").then((n) => n.s);
  await withStorageBatch(async () => {
    const { syncThemeAssets } = await import("./themeSync-BUhXnKL4.mjs");
    await syncThemeAssets(s.host.themes.listThemes(), s.settings().themeConfigs, s.log);
    const ctx = await s.context({ refreshTerms: true });
    await s.host.publisher.regenerateAll(ctx, s.log);
    const { listRegenerationTargets } = await import("./regenerationTargetRegistry-3NmN64mg.mjs");
    for (const t of listRegenerationTargets()) {
      try {
        await t.run(ctx, s.log);
      } catch (err) {
        s.log({ level: "error", message: `Plugin "${t.id}" regen failed: ${err.message}` });
      }
    }
  });
  return { seconds: Math.round((Date.now() - started) / 1e3) };
}
export {
  regenerateEverything
};
