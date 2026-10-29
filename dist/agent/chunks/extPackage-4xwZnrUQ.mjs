import { createRequire as __acmsRequire } from "node:module";
import { fileURLToPath as __acmsPath } from "node:url";
import { dirname as __acmsDirname } from "node:path";
const require2 = __acmsRequire(import.meta.url);
const __filename = __acmsPath(import.meta.url);
const __dirname = __acmsDirname(__filename);
import { existsSync, statSync, readFileSync, readdirSync } from "node:fs";
import { resolve, basename, join, relative } from "node:path";
import { J as JSZip } from "./index-K8rfbNOg.mjs";
import { C as CliError } from "../agentcms.mjs";
import "./_commonjsHelpers-DtUDk_0l.mjs";
import "stream";
import "events";
import "buffer";
import "util";
import "node:util";
import "node:url";
import "node:os";
import "node:child_process";
import "node:crypto";
import "node:http";
const IGNORED = /(^|\/)(\.DS_Store|__MACOSX|Thumbs\.db)(\/|$)/;
async function readExtensionPackage(input) {
  const source = resolve(input);
  if (!existsSync(source)) throw new CliError("not-found", `${input} does not exist.`, void 0, 2);
  const stat = statSync(source);
  if (stat.isFile()) {
    if (!/\.zip$/i.test(source)) {
      throw new CliError("usage", `${input} is not a .zip.`, "Pass the extension's .zip, its project folder or an unpacked folder.", 2);
    }
    return readZip(source);
  }
  return readFolder(source);
}
async function readZip(source) {
  let zip;
  try {
    zip = await JSZip.loadAsync(readFileSync(source));
  } catch (err) {
    throw new CliError("invalid-zip", `${basename(source)} is not a readable ZIP: ${err.message}`);
  }
  const top = /* @__PURE__ */ new Set();
  zip.forEach((p) => {
    const seg = p.split("/")[0];
    if (seg) top.add(seg);
  });
  let prefix = "";
  if (top.size === 1 && !zip.file("manifest.json")) {
    const candidate = [...top][0] + "/";
    if (zip.file(candidate + "manifest.json")) prefix = candidate;
  }
  const files = /* @__PURE__ */ new Map();
  const ignored = [];
  const entries = [];
  zip.forEach((p, f) => {
    if (!f.dir) entries.push([p, f]);
  });
  for (const [p, f] of entries) {
    if (!p.startsWith(prefix)) {
      ignored.push(p);
      continue;
    }
    const rel = p.slice(prefix.length);
    if (IGNORED.test(rel)) {
      ignored.push(p);
      continue;
    }
    files.set(rel, Buffer.from(await f.async("uint8array")));
  }
  return finish(source, "zip", files, ignored);
}
function walk(dir, root, out, skip) {
  for (const name of readdirSync(dir)) {
    const abs = join(dir, name);
    const rel = relative(root, abs).split("\\").join("/");
    if (skip(rel)) continue;
    if (statSync(abs).isDirectory()) walk(abs, root, out, skip);
    else out.set(rel, readFileSync(abs));
  }
}
function readFolder(source) {
  const manifestPath = join(source, "manifest.json");
  if (!existsSync(manifestPath)) {
    throw new CliError("no-manifest", `No manifest.json in ${source}.`, "Point at the extension's project folder (manifest.json at its root), an unpacked package or its .zip.", 2);
  }
  const manifestText = readFileSync(manifestPath, "utf8");
  const manifest = parseManifest(manifestText);
  const entry = typeof manifest?.entry === "string" && manifest.entry ? manifest.entry : "bundle.js";
  const isProject = existsSync(join(source, "package.json")) || !existsSync(join(source, entry));
  const files = /* @__PURE__ */ new Map();
  if (!isProject) {
    walk(source, source, files, (rel) => IGNORED.test(rel) || rel.endsWith(".zip"));
    return finish(source, "folder", files, []);
  }
  files.set("manifest.json", Buffer.from(manifestText));
  const dist = join(source, "dist");
  if (existsSync(dist)) walk(dist, dist, files, (rel) => IGNORED.test(rel));
  const readme = join(source, "README.md");
  if (existsSync(readme) && !files.has("README.md")) files.set("README.md", readFileSync(readme));
  const assets = join(source, "assets");
  if (existsSync(assets)) {
    const extra = /* @__PURE__ */ new Map();
    walk(assets, assets, extra, (rel) => IGNORED.test(rel));
    for (const [rel, buf] of extra) files.set(`assets/${rel}`, buf);
  }
  return finish(source, "project", files, []);
}
function parseManifest(text) {
  if (text == null) return null;
  try {
    const value = JSON.parse(text.replace(/^\uFEFF/, ""));
    return value && typeof value === "object" && !Array.isArray(value) ? value : null;
  } catch {
    return null;
  }
}
function finish(source, sourceType, files, ignored) {
  const raw = files.get("manifest.json");
  const manifestText = raw ? raw.toString("utf8") : null;
  const manifest = parseManifest(manifestText);
  const entry = typeof manifest?.entry === "string" && manifest.entry ? manifest.entry.replace(/^\.?\/+/, "") : "bundle.js";
  return { source, sourceType, manifestText, manifest, files, entry, ignored };
}
function bundleSource(pkg) {
  const buf = pkg.files.get(pkg.entry);
  return buf ? buf.toString("utf8") : null;
}
export {
  bundleSource,
  readExtensionPackage
};
