// Documents the attributes of portfolio/project-meta for
// `agentcms content blocks portfolio/project-meta`.

import type { SettingsSchema } from "@agent-cms/runtime";

export const ATTRS_SCHEMA: SettingsSchema = {
  rows: {
    description:
      "Label / value columns of the project facts grid (up to 4 columns on desktop, stacked on mobile): [{ label, value }]. label is shown uppercase (SERVICES, YEAR, CLIENT…); value supports several lines separated by \\n. Rows with both fields empty are skipped; no rows = the block is hidden. A row labelled YEAR (or ANNÉE, JAHR, AÑO, ANO, JAAR, DATE, AN, 연도) sets the year shown in the post's header instead of the publication year.",
    format: "array of objects",
  },
};
