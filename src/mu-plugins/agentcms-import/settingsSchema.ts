// Documents the settings of the import plugin for
// `agentcms plugins config agentcms-import --schema` (descriptions read by
// agents; `values` and min/max are enforced by the CLI on --set / --merge).
// These are the defaults of `plugins action agentcms-import scan|run`.

import type { SettingsSchema } from "../../core/types";

export const SETTINGS_SCHEMA: SettingsSchema = {
  "options.statusMode": {
    description:
      "Status of imported entries: draft (always, safest), online (publish every entry — runs the publish pipeline per item) or from-source (Markdown `status:` front matter / WordPress publish → online, anything else → draft). `--status` overrides it per run.",
    values: ["draft", "online", "from-source"],
  },
  "options.defaultCategory": {
    description:
      "Category NAME given to entries that don't specify one (created if it doesn't exist). Empty = such entries stay without category. `--category` overrides it per run.",
    format: "category name",
  },
  "options.moveProcessedFiles": {
    description:
      "When importing from the hosting's _cms-import/ folder (--from-hosting), move the imported files to a processed-<timestamp>/ subfolder so they aren't imported twice. `--keep-files` overrides it per run.",
  },
  "options.imageFetchConcurrency": {
    description: "Maximum parallel image downloads from the source WordPress site; lower it if the source is slow or rate-limited.",
    min: 1,
    max: 16,
  },
};
