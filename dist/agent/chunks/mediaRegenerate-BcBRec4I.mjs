import { createRequire as __acmsRequire } from "node:module";
import { fileURLToPath as __acmsPath } from "node:url";
import { dirname as __acmsDirname } from "node:path";
const require2 = __acmsRequire(import.meta.url);
const __filename = __acmsPath(import.meta.url);
const __dirname = __acmsDirname(__filename);
import { ADMIN_FORMATS } from "./imageFormats-C1E7toWk.mjs";
import { e as extensionForMime, p as processImage, b as blobToBase64, m as mergeFormats } from "./themeLogo-DZLpUhvn.mjs";
import { u as uploadFile, p as publicUrlFor } from "./siteFiles-D207OaeL.mjs";
import { c as getActiveStorageConnector } from "./registry-B41SEnnT.mjs";
import { s as setMediaFormats, g as getActiveTheme } from "./media-x49mFUWY.mjs";
import "./index-BA9sR5p-.mjs";
import "./index-DCzLoAau.mjs";
import "./toast-CYyyaSAW.mjs";
import "./types-DAD44Ttj.mjs";
import "./batch-BGzHdUjc.mjs";
import "./runtimeConfig-2M2d2Pbu.mjs";
import "./firebaseClient-D3fvED27.mjs";
import "./index-B4MbpTF6.mjs";
import "./index.esm2017-C4mMOVmK.mjs";
import "util";
import "crypto";
import "process";
import "tls";
import "fs";
import "os";
import "net";
import "events";
import "stream";
import "./_commonjsHelpers-DtUDk_0l.mjs";
import "path";
import "http2";
import "http";
import "url";
import "dns";
import "zlib";
import "./index-BzGlTM6h.mjs";
import "./gitStore-ueM10Bby.mjs";
import "../agentcms.mjs";
import "node:util";
import "node:fs";
import "node:path";
import "node:url";
import "node:os";
import "node:child_process";
import "node:http";
import "./index-K8rfbNOg.mjs";
import "buffer";
import "./slug-CZzRNKy4.mjs";
import "./media-K2GXb5Xy.mjs";
import "./pluginRegistry-D4QLSYaL.mjs";
import "./blockRegistry-BotpJ4Ww.mjs";
import "./index--QpyX5Bx.mjs";
import "./dashboardCardRegistry-2rhwfBuU.mjs";
import "./regenerationTargetRegistry-3NmN64mg.mjs";
import "./externalRegistry-DuO0IV8e.mjs";
import "./authorsJsonPublisher-OsQuYFnl.mjs";
import "./users-D6P4Wv2E.mjs";
import "./markdown-74eSpmsS.mjs";
import "./posts-BwMIoSkg.mjs";
import "./taxonomies-CjlJL2MS.mjs";
import "./menuResolver-BEzafl_Y.mjs";
import "./menuPublisher-Bi2lvz6b.mjs";
import "./settings-DZuDcOE5.mjs";
import "./settings-DlkdUVwn.mjs";
import "./generator-DePwKO9n.mjs";
import "./index-D5aHWd8R.mjs";
function themeFormats(settings) {
  let config;
  try {
    config = getActiveTheme(settings?.activeThemeId ?? "default").imageFormats;
  } catch {
    config = void 0;
  }
  const merged = mergeFormats(ADMIN_FORMATS, config);
  const own = Object.keys(config?.formats ?? {});
  return { merged, own };
}
function isStale(variant, spec) {
  if (!variant) return true;
  if ((spec.fit ?? "cover") === "cover" && variant.width && variant.height) {
    return variant.width !== spec.width || variant.height !== spec.height;
  }
  return false;
}
function sourceVariant(media) {
  const formats = media.formats ?? {};
  if (formats["admin-original"]) return "admin-original";
  let best = null;
  let area = 0;
  for (const [name, v] of Object.entries(formats)) {
    const a = (v.width ?? 0) * (v.height ?? 0);
    if (a > area) {
      area = a;
      best = name;
    }
  }
  return best;
}
function planMediaRegeneration(media, settings, opts = {}) {
  const { merged, own } = themeFormats(settings);
  return media.map((m) => {
    if (!m.storageBase || !m.formats) return { id: m.id, name: m.name, formats: [], skipped: "legacy single-file media (no variants to re-crop from)" };
    if (!sourceVariant(m)) return { id: m.id, name: m.name, formats: [], skipped: "no source variant" };
    const formats = own.filter((name) => opts.all || isStale(m.formats?.[name], merged.formats[name]));
    return { id: m.id, name: m.name, formats };
  });
}
async function readVariantBytes(media, name) {
  const variant = media.formats[name];
  const ext = variant.url.split("?")[0].split(".").pop() ?? "webp";
  const path = `${media.storageBase}/${name}.${ext}`;
  const connector = await getActiveStorageConnector();
  if (connector.getBytes) {
    const bytes = await connector.getBytes(path);
    if (bytes) return bytes;
  }
  const res = await fetch(variant.url, { cache: "no-store" });
  if (!res.ok) throw new Error(`could not read ${name} (HTTP ${res.status})`);
  return new Uint8Array(await res.arrayBuffer());
}
async function regenerateMediaFormats(media, formatNames, settings) {
  if (!formatNames.length || !media.storageBase) return [];
  const { merged } = themeFormats(settings);
  const source = sourceVariant(media);
  if (!source) throw new Error("no source variant");
  const bytes = await readVariantBytes(media, source);
  const sourceMime = media.contentType || "image/webp";
  const file = new File([bytes], `${source}.${extensionForMime(sourceMime)}`, { type: sourceMime });
  const wanted = {};
  for (const name of formatNames) if (merged.formats[name]) wanted[name] = merged.formats[name];
  const variants = await processImage(file, { formats: wanted, outputMime: merged.outputMime, quality: merged.quality });
  const ext = extensionForMime(merged.outputMime);
  const out = {};
  for (const v of variants) {
    const path = `${media.storageBase}/${v.name}.${ext}`;
    await uploadFile({ path, content: await blobToBase64(v.blob), encoding: "base64" });
    out[v.name] = { url: await publicUrlFor(path), width: v.width, height: v.height, bytes: v.bytes };
  }
  const all = { ...media.formats ?? {}, ...out };
  const size = Object.values(all).reduce((n, v) => n + (v.bytes ?? 0), 0);
  await setMediaFormats(media.id, out, size);
  return Object.keys(out);
}
export {
  planMediaRegeneration,
  regenerateMediaFormats
};
