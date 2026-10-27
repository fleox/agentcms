import { createRequire as __acmsRequire } from "node:module";
import { fileURLToPath as __acmsPath } from "node:url";
import { dirname as __acmsDirname } from "node:path";
const require2 = __acmsRequire(import.meta.url);
const __filename = __acmsPath(import.meta.url);
const __dirname = __acmsDirname(__filename);
import { realpathSync, mkdtempSync, rmSync, copyFileSync, writeFileSync, readFileSync } from "node:fs";
import { register } from "node:module";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { pathToFileURL } from "node:url";
import { C as CliError, a as installBrowserEnv, d as distRoot } from "../agentcms.mjs";
import "node:util";
import "node:child_process";
import "node:http";
const IMPORT_MAP_SPECIFIERS = {
  react: "react.js",
  "react/jsx-runtime": "react-jsx-runtime.js",
  "react-dom": "react-dom.js",
  "react-dom/client": "react-dom-client.js",
  "react-i18next": "react-i18next.js",
  "@agent-cms/runtime": "cms-runtime.js"
};
let booted = null;
let bundleDir = null;
async function loadModules() {
  const cmsRuntime = await import("./cmsRuntime-BL6Hl-ad.mjs").then((n) => n.b);
  const [plugins, themes, registry, publisher, themeSync, docstore, storageRegistry, users, markdown, pluginRegistry, blocks, cards] = await Promise.all([
    import("./cmsRuntime-BL6Hl-ad.mjs").then((n) => n.i),
    import("./cmsRuntime-BL6Hl-ad.mjs").then((n) => n.a),
    import("./externalRegistry-DuO0IV8e.mjs"),
    import("./cmsRuntime-BL6Hl-ad.mjs").then((n) => n.p),
    import("./themeSync-B5ADxHiu.mjs"),
    import("./registry-DClFwwHa.mjs").then((n) => n.v),
    import("./registry-DClFwwHa.mjs").then((n) => n.w),
    import("./users-Q0J4JiL0.mjs").then((n) => n.u),
    import("./markdown-74eSpmsS.mjs"),
    import("./pluginRegistry-QJmy4wOS.mjs").then((n) => n.j),
    import("./blockRegistry-B2pxChw-.mjs"),
    import("./dashboardCardRegistry-2rhwfBuU.mjs")
  ]);
  const { DEFAULT_SITE_SETTINGS: defaultSettings } = await import("./settings-DMAjCSQM.mjs").then((n) => n.f);
  return { defaultSettings, cmsRuntime, plugins, themes, registry, publisher, themeSync, docstore, storageRegistry, users, markdown, pluginRegistry, blocks, cards };
}
function bootExtensionHost() {
  if (booted) return booted;
  booted = (async () => {
    const [major, minor] = process.versions.node.split(".").map(Number);
    if (major < 20 || major === 20 && minor < 6) {
      throw new CliError("node-too-old", `Node ${process.versions.node} can't load extension bundles.`, "Use Node.js 20.6 or newer.");
    }
    installBrowserEnv();
    const g = globalThis;
    g.__AGENTCMS_CONFIG__ = { backend: "local" };
    const runtimeDir = join(distRoot(), "admin", "runtime");
    const map = {};
    for (const [spec, file] of Object.entries(IMPORT_MAP_SPECIFIERS)) {
      map[spec] = pathToFileURL(join(runtimeDir, file)).href;
    }
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
    const { Window } = await import("./index-Dx5OJr2e.mjs");
    const win = new Window({
      url: "http://localhost/",
      settings: { disableJavaScriptEvaluation: true, disableJavaScriptFileLoading: true, disableCSSFileLoading: true, disableIframePageLoading: true }
    });
    const mods = await loadModules();
    mods.markdown.setSanitizerWindow(win);
    return mods;
  })();
  return booted;
}
let counter = 0;
async function importExtensionBundle(source) {
  await bootExtensionHost();
  const file = join(bundleDir, `bundle-${++counter}.mjs`);
  writeFileSync(file, source);
  const mod = await import(
    /* @vite-ignore */
    pathToFileURL(file).href
  );
  if (mod.default != null) return { manifest: mod.default, exportName: "default" };
  if (mod.manifest != null) return { manifest: mod.manifest, exportName: "manifest" };
  return { manifest: null, exportName: null };
}
function copyIntoBundleDir(from, name) {
  const to = join(bundleDir, name);
  copyFileSync(from, to);
  return to;
}
function readText(path) {
  return readFileSync(path, "utf8");
}
export {
  IMPORT_MAP_SPECIFIERS,
  bootExtensionHost,
  copyIntoBundleDir,
  importExtensionBundle,
  readText
};
