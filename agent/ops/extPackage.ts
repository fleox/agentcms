import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { basename, join, relative, resolve } from "node:path";
import JSZip from "jszip";
import { CliError } from "../output";

// An extension package = what the admin's "Install" button accepts: a
// ZIP whose root holds manifest.json + the bundle (+ any extra files,
// e.g. theme.css, README.md, images). The CLI reads the same thing from
// three places: the .zip itself, an unpacked folder, or an author's
// project folder (manifest.json at the root, the bundle under dist/).

export interface ExtensionJson {
  id: string;
  name: string;
  version: string;
  apiVersion: string;
  entry?: string;
  // Optional — "plugin" | "theme". The admin does not read it (the
  // install button picks the kind), the CLI uses it when present.
  kind?: string;
}

export interface ExtensionPackage {
  // Where it was read from (absolute path), and how.
  source: string;
  sourceType: "zip" | "folder" | "project";
  // Raw manifest.json text + its parsed value (null when unparsable).
  manifestText: string | null;
  manifest: Partial<ExtensionJson> | null;
  // Files that end up under /<admin>/<plugins|themes>/<id>/ once
  // installed, keyed by their path inside the package.
  files: Map<string, Buffer>;
  // Entry file name inside the package (manifest.entry ?? "bundle.js").
  entry: string;
  // Paths inside a ZIP the admin would ignore or that look accidental.
  ignored: string[];
}

const IGNORED = /(^|\/)(\.DS_Store|__MACOSX|Thumbs\.db)(\/|$)/;

export async function readExtensionPackage(input: string): Promise<ExtensionPackage> {
  const source = resolve(input);
  if (!existsSync(source)) throw new CliError("not-found", `${input} does not exist.`, undefined, 2);
  const stat = statSync(source);
  if (stat.isFile()) {
    if (!/\.zip$/i.test(source)) {
      throw new CliError("usage", `${input} is not a .zip.`, "Pass the extension's .zip, its project folder or an unpacked folder.", 2);
    }
    return readZip(source);
  }
  return readFolder(source);
}

async function readZip(source: string): Promise<ExtensionPackage> {
  let zip: JSZip;
  try {
    zip = await JSZip.loadAsync(readFileSync(source));
  } catch (err) {
    throw new CliError("invalid-zip", `${basename(source)} is not a readable ZIP: ${(err as Error).message}`);
  }
  // Same unwrapping as the admin (services/externalUpload.ts): a single
  // top-level folder holding manifest.json is peeled off.
  const top = new Set<string>();
  zip.forEach((p) => {
    const seg = p.split("/")[0];
    if (seg) top.add(seg);
  });
  let prefix = "";
  if (top.size === 1 && !zip.file("manifest.json")) {
    const candidate = [...top][0] + "/";
    if (zip.file(candidate + "manifest.json")) prefix = candidate;
  }
  const files = new Map<string, Buffer>();
  const ignored: string[] = [];
  const entries: Array<[string, JSZip.JSZipObject]> = [];
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

function walk(dir: string, root: string, out: Map<string, Buffer>, skip: (rel: string) => boolean): void {
  for (const name of readdirSync(dir)) {
    const abs = join(dir, name);
    const rel = relative(root, abs).split("\\").join("/");
    if (skip(rel)) continue;
    if (statSync(abs).isDirectory()) walk(abs, root, out, skip);
    else out.set(rel, readFileSync(abs));
  }
}

function readFolder(source: string): ExtensionPackage {
  const manifestPath = join(source, "manifest.json");
  if (!existsSync(manifestPath)) {
    throw new CliError("no-manifest", `No manifest.json in ${source}.`, "Point at the extension's project folder (manifest.json at its root), an unpacked package or its .zip.", 2);
  }
  const manifestText = readFileSync(manifestPath, "utf8");
  const manifest = parseManifest(manifestText);
  const entry = typeof manifest?.entry === "string" && manifest.entry ? manifest.entry : "bundle.js";
  const isProject = existsSync(join(source, "package.json")) || !existsSync(join(source, entry));
  const files = new Map<string, Buffer>();
  if (!isProject) {
    walk(source, source, files, (rel) => IGNORED.test(rel) || rel.endsWith(".zip"));
    return finish(source, "folder", files, []);
  }
  // Author project: what `npm run build` packs — manifest.json, the
  // built entry from dist/, README.md and assets/. (No theme.css: the
  // admin publishes the theme's CSS from manifest.cssText only.)
  files.set("manifest.json", Buffer.from(manifestText));
  const dist = join(source, "dist");
  if (existsSync(dist)) walk(dist, dist, files, (rel) => IGNORED.test(rel));
  const readme = join(source, "README.md");
  if (existsSync(readme) && !files.has("README.md")) files.set("README.md", readFileSync(readme));
  const assets = join(source, "assets");
  if (existsSync(assets)) {
    const extra = new Map<string, Buffer>();
    walk(assets, assets, extra, (rel) => IGNORED.test(rel));
    for (const [rel, buf] of extra) files.set(`assets/${rel}`, buf);
  }
  return finish(source, "project", files, []);
}

function parseManifest(text: string | null): Partial<ExtensionJson> | null {
  if (text == null) return null;
  try {
    const value = JSON.parse(text.replace(/^\uFEFF/, ""));
    return value && typeof value === "object" && !Array.isArray(value) ? (value as Partial<ExtensionJson>) : null;
  } catch {
    return null;
  }
}

function finish(
  source: string,
  sourceType: ExtensionPackage["sourceType"],
  files: Map<string, Buffer>,
  ignored: string[],
): ExtensionPackage {
  const raw = files.get("manifest.json");
  const manifestText = raw ? raw.toString("utf8") : null;
  const manifest = parseManifest(manifestText);
  const entry = typeof manifest?.entry === "string" && manifest.entry ? manifest.entry.replace(/^\.?\/+/, "") : "bundle.js";
  return { source, sourceType, manifestText, manifest, files, entry, ignored };
}

export function bundleSource(pkg: ExtensionPackage): string | null {
  const buf = pkg.files.get(pkg.entry);
  return buf ? buf.toString("utf8") : null;
}
