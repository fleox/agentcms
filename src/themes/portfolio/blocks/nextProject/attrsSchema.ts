// Documents the attributes of portfolio/next-project for
// `agentcms content blocks portfolio/next-project`.

import type { SettingsSchema } from "@agent-cms/runtime";

export const ATTRS_SCHEMA: SettingsSchema = {
  eyebrow: { description: "Small uppercase label above the title (sample \"NEXT PROJECT\"; empty = blank label)." },
  title: {
    description: "Big serif title of the full-width banner (usually the next project's name). Empty = the block is hidden.",
  },
  href: {
    description: "Link of the whole banner: a site path to the next project (\"/category/project.html\") or a URL. Empty = \"#\".",
    format: "site path or URL",
  },
  ctaLabel: { description: "Uppercase call-to-action text next to the arrow (sample \"VIEW CASE STUDY\")." },
};
