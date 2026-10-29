import { copyFileSync, mkdtempSync, readFileSync, realpathSync, rmSync, writeFileSync } from "node:fs";
import { register } from "node:module";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { pathToFileURL } from "node:url";
import { installBrowserEnv } from "../browserEnv";
import { CliError } from "../output";
import { distRoot } from "../paths";

// Runs extension bundles (plugins / themes) in Node exactly like the
// admin does in the browser: the six bare specifiers of the admin's
// import-map resolve to the same stub files (dist/admin/runtime/*.js),
// which read the live instances off window.__AGENTCMS_RUNTIME__ —
// populated here by importing the admin's own src/core/cmsRuntime.ts.
//
// Only imports made BY an extension bundle are redirected (the resolve
// hook checks the importing file), so the CLI's own modules are never
// affected.

export const IMPORT_MAP_SPECIFIERS: Record<string, string> = {
  react: "react.js",
  "react/jsx-runtime": "react-jsx-runtime.js",
  "react-dom": "react-dom.js",
  "react-dom/client": "react-dom-client.js",
  "react-i18next": "react-i18next.js",
  "@agent-cms/runtime": "cms-runtime.js",
};

let booted: Promise<HostModules> | null = null;
let bundleDir: string | null = null;

export type HostModules = Awaited<ReturnType<typeof loadModules>>;

async function loadModules() {
  const cmsRuntime = await import("../../src/core/cmsRuntime");
  const [plugins, themes, registry, publisher, themeSync, docstore, storageRegistry, users, markdown, pluginRegistry, blocks, cards] =
    await Promise.all([
      import("../../src/plugins"),
      import("../../src/themes"),
      import("../../src/services/externalRegistry"),
      import("../../src/services/publisher"),
      import("../../src/services/themeSync"),
      import("../../src/services/docstore"),
      import("../../src/services/storage/registry"),
      import("../../src/services/users"),
      import("../../src/core/markdown"),
      import("../../src/core/pluginRegistry"),
      import("../../src/core/blockRegistry"),
      import("../../src/core/dashboardCardRegistry"),
    ]);
  const { DEFAULT_SITE_SETTINGS: defaultSettings } = await import("../../src/services/firebase/settings");
  return { defaultSettings, cmsRuntime, plugins, themes, registry, publisher, themeSync, docstore, storageRegistry, users, markdown, pluginRegistry, blocks, cards };
}

// Boots the admin runtime once per process. The data backend is an
// in-memory document store (never persisted) — callers seed it.
export function bootExtensionHost(): Promise<HostModules> {
  if (booted) return booted;
  booted = (async () => {
    const [major, minor] = process.versions.node.split(".").map(Number);
    if (major < 20 || (major === 20 && minor < 6)) {
      throw new CliError("node-too-old", `Node ${process.versions.node} can't load extension bundles.`, "Use Node.js 20.6 or newer.");
    }
    installBrowserEnv();
    const g = globalThis as Record<string, unknown>;
    // The admin reads its runtime config from window.__AGENTCMS_CONFIG__.
    g.__AGENTCMS_CONFIG__ = { backend: "local" };
    const runtimeDir = join(distRoot(), "admin", "runtime");
    const map: Record<string, string> = {};
    for (const [spec, file] of Object.entries(IMPORT_MAP_SPECIFIERS)) {
      map[spec] = pathToFileURL(join(runtimeDir, file)).href;
    }
    // realpath: module URLs use resolved paths (/var → /private/var on macOS).
    bundleDir = realpathSync(mkdtempSync(join(tmpdir(), "agentcms-ext-")));
    process.once("exit", () => {
      if (bundleDir) rmSync(bundleDir, { recursive: true, force: true });
    });
    const scope = pathToFileURL(bundleDir).href + "/";
    const hook = `
      const MAP = ${JSON.stringify(map)};
      const SCOPE = ${JSON.stringify(scope)};
      export async function resolve(specifier, context, next) {
        if (context.parentURL && context.parentURL.startsWith(SCOPE) && Object.prototype.hasOwnProperty.call(MAP, specifier)) {
          return { url: MAP[specifier], shortCircuit: true };
        }
        return next(specifier, context);
      }`;
    register("data:text/javascript," + encodeURIComponent(hook));
    const { Window } = await import("happy-dom");
    const win = new Window({
      url: "http://localhost/",
      settings: { disableJavaScriptEvaluation: true, disableJavaScriptFileLoading: true, disableCSSFileLoading: true, disableIframePageLoading: true },
    });
    // Parsers some plugins use at publish / import time (e.g. the
    // WordPress importer's DOMParser on the export XML). Node has none;
    // the admin's own window globals stay untouched otherwise.
    const globals = globalThis as Record<string, unknown>;
    const W = win as unknown as { DOMParser: new () => { parseFromString(s: string, type: string): unknown }; XMLSerializer: unknown };
    if (typeof globals.DOMParser === "undefined") {
      // happy-dom's XML parser rejects CDATA sections (WordPress exports
      // are full of them): turn them into the equivalent escaped text.
      globals.DOMParser = class {
        parseFromString(source: string, type: string): unknown {
          const xml = /xml/.test(type)
            ? source.replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, (_m, t: string) => t.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;"))
            : source;
          return new W.DOMParser().parseFromString(xml, type);
        }
      };
    }
    if (typeof globals.XMLSerializer === "undefined") globals.XMLSerializer = W.XMLSerializer;
    const mods = await loadModules();
    mods.markdown.setSanitizerWindow(win);
    return mods;
  })();
  return booted;
}

let counter = 0;



export interface LoadedBundle {
  // The module's default export, or its named `manifest` export (in-tree convention).
  manifest: unknown;
  exportName: "default" | "manifest" | null;
}

// Imports one bundle.js (its source text) through the import-map
// emulation. Each load gets a fresh file URL, so a rebuilt bundle is
// re-evaluated rather than served from the module cache.
export async function importExtensionBundle(source: string): Promise<LoadedBundle> {
  await bootExtensionHost();
  const file = join(bundleDir!, `bundle-${++counter}.mjs`);
  writeFileSync(file, source);
  let mod: { default?: unknown; manifest?: unknown };
  try {
    mod = (await import(/* @vite-ignore */ pathToFileURL(file).href)) as typeof mod;
  } finally {
    // The module stays in memory once evaluated (bundles are single files):
    // the copy is only needed to import it.
    rmSync(file, { force: true });
  }
  if (mod.default != null) return { manifest: mod.default, exportName: "default" };
  if (mod.manifest != null) return { manifest: mod.manifest, exportName: "manifest" };
  return { manifest: null, exportName: null };
}

export function copyIntoBundleDir(from: string, name: string): string {
  const to = join(bundleDir!, name);
  copyFileSync(from, to);
  return to;
}

export function readText(path: string): string {
  return readFileSync(path, "utf8");
}
