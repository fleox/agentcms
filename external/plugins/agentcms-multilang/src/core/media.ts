import type { Media } from "@agent-cms/runtime";
import type { MultilangConfig } from "../types";
import { isPrimaryLanguage } from "./config";

// Alt text / caption of one media in a language: `media.translations[lang]`
// over the primary language's `alt` / `caption` (an empty or missing field
// falls back to them). The primary language keeps the media as is.
export function localizeMedia(media: Media, language: string, config: MultilangConfig): Media {
  if (isPrimaryLanguage(config, language)) return media;
  const tr = media.translations?.[language];
  if (!tr) return media;
  return { ...media, alt: tr.alt || media.alt, caption: tr.caption || media.caption };
}

// The whole media map in a language — what themes read through
// `ctx.media` (hero images, cards, home blocks, data/posts.json).
export function localizeMediaMap(
  media: Map<string, Media>,
  language: string,
  config: MultilangConfig,
): Map<string, Media> {
  if (isPrimaryLanguage(config, language)) return media;
  let changed = false;
  const out = new Map<string, Media>();
  for (const [id, m] of media) {
    const l = localizeMedia(m, language, config);
    if (l !== m) changed = true;
    out.set(id, l);
  }
  return changed ? out : media;
}
