// Documents the attributes of the agentcms-blocks/columns block for
// `agentcms content blocks agentcms-blocks/columns` (read by agents).
//
// Unlike most blocks, columns carries no base64 `data-attrs`: its
// settings are plain HTML attributes on the container marker and its
// content is ordinary Markdown/HTML inside each column, so --attrs
// doesn't apply — agents write the markup shown by `content blocks`.

import type { SettingsSchema } from "../../../core/types";

export const ATTRS_SCHEMA: SettingsSchema = {
  cols: {
    description:
      "Number of columns, written as data-cols=\"N\" on the <div data-cms-block=\"agentcms-blocks/columns\"> container (not in data-attrs). Put one <div data-cms-column> child per column, each holding the column's content (paragraphs, headings, images, other blocks). Default 2; the editor accepts 2–4. Columns stack on phones.",
    min: 2,
    max: 4,
  },
  widths: {
    description:
      "Optional relative column widths, written as data-widths=\"2,1\" (comma-separated numbers, one per column, used as CSS fr units: 2,1 = two thirds / one third) together with style=\"--cms-columns-template: 2fr 1fr;\" on the container. Omit both for equal columns.",
    format: "comma-separated numbers",
  },
};
