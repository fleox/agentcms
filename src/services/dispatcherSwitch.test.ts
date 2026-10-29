import { afterEach, describe, expect, it, vi } from "vitest";

// The agentcms CLI can change backend inside one process (ext install
// renders a demo on an in-memory docstore, then writes to a Firebase
// site): dispatchers must follow the active backend, not the first one.

vi.mock("./firebase/settings", async (orig) => ({
  ...(await orig<typeof import("./firebase/settings")>()),
  getSettings: async () => ({ title: "from firebase" }),
}));
vi.mock("./docstore/settings", async (orig) => ({
  ...(await orig<typeof import("./docstore/settings")>()),
  getSettings: async () => ({ title: "from docstore" }),
}));

const win = vi.hoisted(() => {
  const mem = new Map<string, string>();
  const localStorage = { getItem: (k: string) => mem.get(k) ?? null, setItem: (k: string, v: string) => void mem.set(k, v), removeItem: (k: string) => void mem.delete(k) };
  const w = { __AGENTCMS_CONFIG__: null as unknown, localStorage };
  (globalThis as Record<string, unknown>).window = w;
  (globalThis as Record<string, unknown>).localStorage = localStorage;
  return w;
});

afterEach(async () => {
  win.__AGENTCMS_CONFIG__ = null;
  (await import("../lib/runtimeConfig")).resetRuntimeConfigCache();
});

describe("dispatchers", () => {
  it("re-resolve the implementation when the backend changes", async () => {
    const { resetRuntimeConfigCache } = await import("../lib/runtimeConfig");
    const { getSettings } = await import("./settings");
    win.__AGENTCMS_CONFIG__ = { backend: "local" };
    resetRuntimeConfigCache();
    expect((await getSettings()).title).toBe("from docstore");
    win.__AGENTCMS_CONFIG__ = { backend: "firebase", firebase: { apiKey: "k", authDomain: "a", projectId: "p", storageBucket: "b", messagingSenderId: "m", appId: "i" } };
    resetRuntimeConfigCache();
    expect((await getSettings()).title).toBe("from firebase");
  });
});
