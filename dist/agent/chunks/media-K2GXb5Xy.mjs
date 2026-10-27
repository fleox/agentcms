import { createRequire as __acmsRequire } from "node:module";
import { fileURLToPath as __acmsPath } from "node:url";
import { dirname as __acmsDirname } from "node:path";
const require2 = __acmsRequire(import.meta.url);
const __filename = __acmsPath(import.meta.url);
const __dirname = __acmsDirname(__filename);
function pickFormat(view, name) {
  if (!view) return "";
  const formats = view.formats;
  if (name && formats[name]) return formats[name].url;
  if (view.default && formats[view.default]) return formats[view.default].url;
  const largest = Object.values(formats).reduce(
    (acc, f) => {
      const area = (f.width || 0) * (f.height || 0);
      if (!acc || area > acc.area) return { url: f.url, area };
      return acc;
    },
    null
  );
  return largest?.url ?? "";
}
function mediaToView(media) {
  if (!media) return void 0;
  if (media.formats && Object.keys(media.formats).length > 0) {
    return {
      alt: media.alt,
      caption: media.caption,
      default: media.defaultFormat ?? Object.keys(media.formats)[0],
      formats: Object.fromEntries(
        Object.entries(media.formats).map(([k, v]) => [
          k,
          { url: v.url, width: v.width, height: v.height }
        ])
      )
    };
  }
  if (media.url) {
    return {
      alt: media.alt,
      caption: media.caption,
      default: "legacy",
      formats: { legacy: { url: media.url, width: 0, height: 0 } }
    };
  }
  return void 0;
}
function pickMediaUrl(media, name) {
  return pickFormat(mediaToView(media), name);
}
export {
  mediaToView,
  pickFormat,
  pickMediaUrl
};
