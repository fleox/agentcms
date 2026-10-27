import { createRequire as __acmsRequire } from "node:module";
import { fileURLToPath as __acmsPath } from "node:url";
import { dirname as __acmsDirname } from "node:path";
const require2 = __acmsRequire(import.meta.url);
const __filename = __acmsPath(import.meta.url);
const __dirname = __acmsDirname(__filename);
import { J as JSZip } from "./index-K8rfbNOg.mjs";
import "./_commonjsHelpers-DtUDk_0l.mjs";
import "stream";
import "events";
import "buffer";
import "util";
const ZIP_DATE = new Date(Date.UTC(2026, 0, 1));
async function writeExtensionZip(files) {
  const zip = new JSZip();
  const names = [...files.keys()].sort((a, b) => a === "manifest.json" ? -1 : b === "manifest.json" ? 1 : a.localeCompare(b));
  for (const name of names) zip.file(name, files.get(name), { date: ZIP_DATE, binary: true });
  return zip.generateAsync({ type: "nodebuffer", compression: "DEFLATE", compressionOptions: { level: 9 } });
}
export {
  writeExtensionZip
};
