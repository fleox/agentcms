import { currentId, migrateLegacyIds, migrateRegistry, migrateSettings } from "./legacyIds";
import type { ExternalManifest } from "./externalRegistry";
import type { SiteSettings } from "../core/types";

const defaults: ExternalManifest = {
  plugins: [
    { id: "agentcms-rss", version: "1.0.0", apiVersion: "1.4.0", entryPath: "plugins/agentcms-rss/bundle.js" },
    { id: "agentcms-search", version: "1.0.0", apiVersion: "1.4.0", entryPath: "plugins/agentcms-search/bundle.js" },
  ],
  themes: [{ id: "magazine", version: "1.0.0", apiVersion: "1.4.0", entryPath: "themes/magazine/bundle.js" }],
};

describe("legacy flexweg-* ids", () => {
  it("aligns bundled entries with the deployed admin's versions (cache-busting)", () => {
    const registry: ExternalManifest = {
      plugins: [
        { id: "agentcms-rss", version: "0.9.0", apiVersion: "1.3.0", entryPath: "plugins/agentcms-rss/bundle.js" },
        { id: "agentcms-search", version: "1.0.0", apiVersion: "1.4.0" },
        { id: "my-own", version: "2.0.0", apiVersion: "1.4.0" },
      ],
      themes: [{ id: "magazine", version: "1.0.0", apiVersion: "1.4.0", entryPath: "elsewhere/bundle.js" }],
    };
    const next = migrateRegistry(registry, defaults)!;
    expect(next.plugins).toEqual([
      { id: "agentcms-rss", version: "1.0.0", apiVersion: "1.4.0", entryPath: "plugins/agentcms-rss/bundle.js" },
      { id: "agentcms-search", version: "1.0.0", apiVersion: "1.4.0" },
      { id: "my-own", version: "2.0.0", apiVersion: "1.4.0" },
    ]);
    // Same id from another location: not the bundled copy.
    expect(next.themes[0].entryPath).toBe("elsewhere/bundle.js");
    expect(migrateRegistry(next, defaults)).toBeNull();
  });

  it("maps ids", () => {
    expect(currentId("flexweg-rss")).toBe("agentcms-rss");
    expect(currentId("core-seo")).toBe("core-seo");
  });

  it("replaces legacy registry entries with the bundled ones, keeps unknown ones, dedupes", () => {
    const registry: ExternalManifest = {
      plugins: [
        { id: "flexweg-rss", version: "0.9.0", apiVersion: "1.3.0", entryPath: "plugins/flexweg-rss/bundle.js" },
        { id: "agentcms-search", version: "1.0.0", apiVersion: "1.4.0" },
        { id: "flexweg-search", version: "0.9.0", apiVersion: "1.3.0" },
        { id: "flexweg-custom-thing", version: "1.0.0", apiVersion: "1.3.0" },
      ],
      themes: [{ id: "magazine", version: "1.0.0", apiVersion: "1.4.0" }],
    };
    const next = migrateRegistry(registry, defaults)!;
    expect(next.plugins.map((p) => p.id)).toEqual(["agentcms-rss", "agentcms-search", "flexweg-custom-thing"]);
    expect(next.plugins[0]).toEqual(defaults.plugins[0]);
    expect(migrateRegistry(next, defaults)).toBeNull();
  });

  it("renames settings keys without overriding current ones", () => {
    const patch = migrateSettings({
      enabledPlugins: { "flexweg-rss": false, "agentcms-search": true, "flexweg-search": false },
      pluginConfigs: { "flexweg-favicon": { enabled: true } },
    } as unknown as SiteSettings)!;
    expect(patch.enabledPlugins).toEqual({ "agentcms-rss": false, "agentcms-search": true });
    expect(patch.pluginConfigs).toEqual({ "agentcms-favicon": { enabled: true } });
    expect(migrateSettings({ enabledPlugins: { "agentcms-rss": true }, pluginConfigs: {} } as unknown as SiteSettings)).toBeNull();
  });

  it("writes only when something changed", async () => {
    const writes: string[] = [];
    const io = {
      readRegistry: async () => ({ plugins: [{ id: "agentcms-rss", version: "1.0.0", apiVersion: "1.4.0" }], themes: [] }),
      writeRegistry: async () => void writes.push("registry"),
      defaults,
      getSettings: async () => ({ enabledPlugins: {}, pluginConfigs: {} }) as unknown as SiteSettings,
      updateSettings: async () => void writes.push("settings"),
    };
    expect(await migrateLegacyIds(io)).toEqual({ registry: false, settings: false });
    expect(writes).toEqual([]);
  });
});
