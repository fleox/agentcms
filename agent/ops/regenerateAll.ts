import type { SiteSession } from "./session";

// Regenerate → Everything: theme assets of every installed theme, every
// HTML page (fresh terms), then every plugin regeneration target — in one
// storage batch (one commit on git hostings).
export async function regenerateEverything(s: SiteSession): Promise<{ seconds: number }> {
  const started = Date.now();
  const { withStorageBatch } = await import("../../src/services/siteFiles");
  await withStorageBatch(async () => {
    const { syncThemeAssets } = await import("../../src/services/themeSync");
    await syncThemeAssets(s.host.themes.listThemes(), s.settings().themeConfigs, s.log);
    const ctx = await s.context({ refreshTerms: true });
    await s.host.publisher.regenerateAll(ctx, s.log);
    const { listRegenerationTargets } = await import("../../src/core/regenerationTargetRegistry");
    for (const t of listRegenerationTargets()) {
      try {
        await t.run(ctx, s.log);
      } catch (err) {
        s.log({ level: "error", message: `Plugin "${t.id}" regen failed: ${(err as Error).message}` });
      }
    }
  });
  return { seconds: Math.round((Date.now() - started) / 1000) };
}
