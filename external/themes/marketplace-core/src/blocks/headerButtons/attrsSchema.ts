import type { SettingsSchema } from "@agent-cms/runtime";

// What each attribute of marketplace-core/header-buttons does (shown by
// `agentcms content blocks`). Keep in sync with render.ts.
export const ATTRS_SCHEMA: SettingsSchema = {
  creator: { description: "Creator name in the byline moved under the product title (\"by <creator>\"). Empty = no byline." },
  creatorPrefix: { description: "Word before the creator name. Empty = \"by\"." },
  downloadUrl: { description: "Download button target (opens in a new tab). Empty = no Download button.", format: "URL" },
  previewUrl: { description: "Live Preview button target (opens in a new tab). Empty = no Preview button.", format: "URL" },
  downloadLabel: { description: "Download button text." },
  previewLabel: { description: "Live Preview button text." },
  freeLabel: { description: "Badge shown before the buttons (when at least one URL is set)." },
};
