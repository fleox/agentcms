import JSZip from "jszip";

// The ZIP the admin's "Install plugin / theme" button takes: files at
// the root (no wrapping folder), fixed entry dates so the same files
// always give the same bytes.

const ZIP_DATE = new Date(Date.UTC(2026, 0, 1));

export async function writeExtensionZip(files: Map<string, Buffer>): Promise<Buffer> {
  const zip = new JSZip();
  const names = [...files.keys()].sort((a, b) => (a === "manifest.json" ? -1 : b === "manifest.json" ? 1 : a.localeCompare(b)));
  for (const name of names) zip.file(name, files.get(name)!, { date: ZIP_DATE, binary: true });
  return zip.generateAsync({ type: "nodebuffer", compression: "DEFLATE", compressionOptions: { level: 9 } });
}
