// Documents the attributes of storefront/product-features for
// `agentcms content blocks storefront/product-features` (values are enforced on --attrs).

import type { SettingsSchema } from "@agent-cms/runtime";

export const ATTRS_SCHEMA: SettingsSchema = {
  features: {
    description:
      "Icon + label row under the product hero (1–3 columns; a 4th item wraps): [{ icon, label }]. icon = a Material Symbols Outlined glyph name (e.g. \"local_shipping\", \"eco\", \"loyalty\", \"verified\", \"spa\"); label = short uppercase caption. Items with both empty are skipped; no items = the block is hidden.",
    format: "array of objects",
  },
};
