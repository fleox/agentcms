import { createRequire as __acmsRequire } from "node:module";
import { fileURLToPath as __acmsPath } from "node:url";
import { dirname as __acmsDirname } from "node:path";
const require2 = __acmsRequire(import.meta.url);
const __filename = __acmsPath(import.meta.url);
const __dirname = __acmsDirname(__filename);
import { writeFileSync, rmSync, realpathSync, mkdtempSync, copyFileSync, readFileSync } from "node:fs";
import { register } from "node:module";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { pathToFileURL } from "node:url";
import { C as CliError, a as installBrowserEnv, j as distRoot } from "../agentcms.mjs";
import "node:util";
import "node:child_process";
import "node:crypto";
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
  const cmsRuntime = await import("./media-Sz4XoZVh.mjs").then((n) => n.f);
  const [plugins, themes, registry, publisher, themeSync, docstore, storageRegistry, users, markdown, pluginRegistry, blocks, cards] = await Promise.all([
    import("./media-Sz4XoZVh.mjs").then((n) => n.k),
    import("./media-Sz4XoZVh.mjs").then((n) => n.m),
    import("./externalRegistry-DuO0IV8e.mjs"),
    import("./media-Sz4XoZVh.mjs").then((n) => n.p),
    import("./themeSync-C4galcat.mjs"),
    import("./registry-Bhq3fghS.mjs").then((n) => n.B),
    import("./registry-Bhq3fghS.mjs").then((n) => n.D),
    import("./users-BHc41A-o.mjs").then((n) => n.u),
    import("./markdown-74eSpmsS.mjs"),
    import("./pluginRegistry-D4QLSYaL.mjs").then((n) => n.j),
    import("./blockRegistry-BotpJ4Ww.mjs"),
    import("./dashboardCardRegistry-2rhwfBuU.mjs")
  ]);
  const { DEFAULT_SITE_SETTINGS: defaultSettings } = await import("./settings-VHERPR8x.mjs").then((n) => n.f);
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
    const globals = globalThis;
    const W = win;
    if (typeof globals.DOMParser === "undefined") {
      globals.DOMParser = class {
        parseFromString(source, type) {
          const xml = /xml/.test(type) ? source.replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, (_m, t) => t.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")) : source;
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
async function importExtensionBundle(source) {
  await bootExtensionHost();
  const file = join(bundleDir, `bundle-${++counter}.mjs`);
  writeFileSync(file, source);
  let mod;
  try {
    mod = await import(
      /* @vite-ignore */
      pathToFileURL(file).href
    );
  } finally {
    rmSync(file, { force: true });
  }
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
