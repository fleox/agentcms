import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createMemoryDocStore, setDocStoreForTests, type DocStore } from "./index";
import * as docstoreSettings from "./settings";
import * as docstoreStorage from "./storageConfig";
import * as docstoreRegistry from "./externalRegistryStore";
import type { SiteSettings } from "../../core/types";

// Type-level drift checks against the Firebase impls the dispatchers
// type themselves on.
const _s: typeof import("../firebase/settings") = docstoreSettings;
const _st: typeof import("../firebase/storageConfig") = docstoreStorage;
const _r: typeof import("../firebase/externalRegistryStore") = docstoreRegistry;
void _s;
void _st;
void _r;

let store: DocStore;

function install(seed?: Parameters<typeof createMemoryDocStore>[0]) {
  store = createMemoryDocStore(seed);
  setDocStoreForTests(store);
}

beforeEach(() => install());
afterEach(() => setDocStoreForTests(null));

describe("docstore settings", () => {
  it("returns defaults on an empty store and merges stored values over them", async () => {
    expect(await docstoreSettings.getSettings()).toEqual(docstoreSettings.DEFAULT_SITE_SETTINGS);
    install({ settings: [{ id: "site", title: "Blog", postsPerPage: 5 }] });
    const s = await docstoreSettings.getSettings();
    expect(s.title).toBe("Blog");
    expect(s.postsPerPage).toBe(5);
    expect(s.activeThemeId).toBe("default");
    expect((s as unknown as { id?: string }).id).toBeUndefined();
  });

  it("updateSettings merges at the root and drops undefined keys", async () => {
    install({ settings: [{ id: "site", title: "Blog", description: "d", homePageId: "P1" }] });
    await docstoreSettings.updateSettings({ description: "new", homePageId: undefined } as Partial<SiteSettings>);
    const raw = store.get("settings", "site");
    expect(raw).toMatchObject({ title: "Blog", description: "new" });
    expect(raw && "homePageId" in raw).toBe(false);
  });

  it("plugin / theme configs: named entry replaced wholesale, siblings kept", async () => {
    install({
      settings: [
        {
          id: "site",
          pluginConfigs: { a: { x: 1, y: 2 }, b: { keep: true } },
          themeConfigs: { default: { logoEnabled: true } },
        },
      ],
    });
    await docstoreSettings.updatePluginConfig("a", { x: 3 });
    await docstoreSettings.updateThemeConfig("magazine", { home: {} });
    const s = await docstoreSettings.getSettings();
    expect(s.pluginConfigs).toEqual({ a: { x: 3 }, b: { keep: true } });
    expect(s.themeConfigs).toEqual({ default: { logoEnabled: true }, magazine: { home: {} } });
  });

  it("returned settings are mutable copies", async () => {
    install({ settings: [{ id: "site", menus: { header: [], footer: [] } }] });
    const s = await docstoreSettings.getSettings();
    expect(() => s.menus.header.push({} as never)).not.toThrow();
    expect((store.get("settings", "site")?.menus as { header: unknown[] }).header).toHaveLength(0);
  });

  it("one write per action with a commit message; subscription streams updates", async () => {
    const seen: string[] = [];
    const unsub = docstoreSettings.subscribeToSettings((s) => seen.push(s.title));
    await new Promise((r) => setTimeout(r, 5));
    const spy = vi.spyOn(store, "write");
    await docstoreSettings.updateSettings({ title: "Renamed" });
    unsub();
    expect(spy).toHaveBeenCalledOnce();
    expect(spy.mock.calls[0][1]?.message).toBeTruthy();
    expect(seen).toEqual(["My site", "Renamed"]);
  });
});

describe("docstore config docs", () => {
  it("storage config round-trips", async () => {
    expect(await docstoreStorage.getStorageConfig()).toBeNull();
    await docstoreStorage.setStorageConfig({ connectorId: "s3", settings: { bucket: "b" } });
    expect(await docstoreStorage.getStorageConfig()).toEqual({ connectorId: "s3", settings: { bucket: "b" } });
    expect(store.get("config", "storage")).toBeTruthy();
  });

  it("external registry round-trips and normalises", async () => {
    expect(await docstoreRegistry.readBackendRegistry()).toBeNull();
    const entry = { id: "p", version: "1.0.0", apiVersion: "1.0.0", entry: "bundle.js" } as never;
    await docstoreRegistry.writeBackendRegistry({ plugins: [entry], themes: [] });
    expect(await docstoreRegistry.readBackendRegistry()).toEqual({ plugins: [entry], themes: [] });
    expect(store.get("config", "externalRegistry")).toBeTruthy();

    install({ config: [{ id: "externalRegistry", themes: [entry] }] });
    expect(await docstoreRegistry.readBackendRegistry()).toEqual({ plugins: [], themes: [entry] });
    install({ config: [{ id: "externalRegistry", foo: 1 }] });
    expect(await docstoreRegistry.readBackendRegistry()).toBeNull();
  });
});
