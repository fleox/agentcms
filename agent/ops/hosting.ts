import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import { ADMIN_MANIFEST, missingIndexReferences, type AdminManifest } from "../../src/services/adminDeploy";
import { buildConfigJsSource, type CmsRuntimeConfig } from "../../src/lib/runtimeConfig";
import { instantiateStorageConnector } from "../../src/services/storage/registry";
import { browserMirrorFactory } from "../../src/services/storage/connectors/browserMirror";
import { gitPagesFactory } from "../../src/services/storage/connectors/gitPages";
import { localFolderFactory } from "../../src/services/storage/connectors/localFolder";
import { s3Factory } from "../../src/services/storage/connectors/s3";
import type { PublishTarget } from "../../src/services/storage/target";
import type { BatchOp, StorageConnector } from "../../src/services/storage/types";
import { setSqlJsWasmBinary } from "../../src/services/docstore/sqliteFileStore";
import { CliError } from "../output";
import { distRoot } from "../paths";
import { cleanFolder } from "./plan";

// Writes to a site's hosting straight through its connector, from files
// on disk (the admin build, theme assets). One batch = one commit on git
// hosts, so a whole admin update triggers a single Pages build.

// Built from the built-in factories, not through the registry: a session
// registers a ready instance (settings + secrets) in place of the
// factory, so a second site handled in the same process would otherwise
// get the first site's connector.
const BUILTIN_FACTORIES = new Map<string, { create(settings: never): StorageConnector }>(
  [gitPagesFactory, s3Factory, localFolderFactory, browserMirrorFactory].map((f) => [f.id, f as unknown as { create(settings: never): StorageConnector }]),
);

export function hostingConnector(target: PublishTarget): StorageConnector {
  const factory = BUILTIN_FACTORIES.get(target.connectorId);
  return factory ? factory.create(target.settings as never) : instantiateStorageConnector(target.connectorId, target.settings);
}

const putOp = (path: string, bytes: Uint8Array): BatchOp => ({
  type: "put",
  path,
  content: Buffer.from(bytes).toString("base64"),
  encoding: "base64",
});

export function readLocalAdminManifest(): AdminManifest {
  const file = join(distRoot(), "admin", ADMIN_MANIFEST);
  try {
    return JSON.parse(readFileSync(file, "utf8")) as AdminManifest;
  } catch {
    throw new CliError("admin-missing", `No admin build at ${file}.`, "Run `npm run build` in a clone, or use the npm package.");
  }
}

// The admin's files + its manifest + a config.js for this site, under
// `<folder>/`. index.html comes last for hosts that apply ops one by one.
export function adminOps(folder: string, runtime: CmsRuntimeConfig): { ops: BatchOp[]; manifest: AdminManifest } {
  const dir = cleanFolder(folder);
  const root = join(distRoot(), "admin");
  const manifest = readLocalAdminManifest();
  const index = readFileSync(join(root, "index.html"));
  const missing = missingIndexReferences(index.toString("utf8"), manifest.files);
  if (missing.length) {
    throw new CliError("admin-inconsistent", `dist/admin/index.html references files missing from the build: ${missing.join(", ")}.`, "Rebuild (`npm run build`).");
  }
  const files = [...manifest.files.filter((f) => f !== "index.html"), "index.html"];
  const ops = files.map((f) => putOp(`${dir}/${f}`, readFileSync(join(root, f))));
  ops.push({ type: "put", path: `${dir}/${ADMIN_MANIFEST}`, content: JSON.stringify(manifest, null, 2) + "\n" });
  ops.push({ type: "put", path: `${dir}/config.js`, content: buildConfigJsSource(runtime) });
  return { ops, manifest };
}

// Every theme's CSS + runtime loaders, as built (dist/theme-assets/).
export function themeAssetOps(): BatchOp[] {
  const root = join(distRoot(), "theme-assets");
  const walk = (dir: string): string[] =>
    readdirSync(dir).flatMap((name) => {
      const abs = join(dir, name);
      return statSync(abs).isDirectory() ? walk(abs) : [abs];
    });
  return walk(root)
    .filter((abs) => !abs.endsWith(".DS_Store"))
    .sort()
    .map((abs) => putOp(`theme-assets/${relative(root, abs).split("\\").join("/")}`, readFileSync(abs)));
}

export async function applyOps(
  connector: StorageConnector,
  ops: BatchOp[],
  onProgress?: (done: number, total: number) => void,
): Promise<void> {
  if (connector.commitBatch) {
    onProgress?.(0, ops.length);
    await connector.commitBatch(ops);
    onProgress?.(ops.length, ops.length);
    return;
  }
  let done = 0;
  for (const op of ops) {
    if (op.type === "put") await connector.put(op);
    else if (op.type === "delete") await connector.delete(op.path);
    else if (connector.deletePrefix) await connector.deletePrefix(op.path);
    onProgress?.(++done, ops.length);
  }
}

// sql.js needs its WASM: the CLI reuses the admin build's copy.
export function loadSqlWasm(): void {
  const assets = join(distRoot(), "admin", "assets");
  const wasm = readdirSync(assets).find((f) => /^sql-wasm.*\.wasm$/.test(f));
  if (!wasm) throw new CliError("admin-missing", `sql.js WASM not found in ${assets}.`);
  setSqlJsWasmBinary(new Uint8Array(readFileSync(join(assets, wasm))));
}
