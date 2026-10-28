// Documents the attributes of storefront/product-info for
// `agentcms content blocks storefront/product-info` (values are enforced on --attrs).

import type { SettingsSchema } from "@agent-cms/runtime";

export const ATTRS_SCHEMA: SettingsSchema = {
  priceTTC: {
    description: "Price incl. tax, in currency units (e.g. 49.9). 0 = no price shown. Also feeds listing cards and data/products.json (catalog filters). Prices are hidden everywhere when the theme setting productDefaults.inquiryOnly is on.",
    format: "number",
  },
  promoTTC: {
    description: "Discounted price incl. tax. Shown (with priceTTC struck through, and on cards) only when > 0 and lower than priceTTC; 0 = no promotion.",
    format: "number",
  },
  priceHT: { description: "Price excl. tax. Stored with the product but not displayed by the theme today.", format: "number" },
  currency: {
    description: "ISO 4217 currency code of the prices (\"EUR\", \"USD\", \"GBP\"…). Empty = the theme setting productDefaults.currency, else EUR.",
    format: "ISO 4217 code",
  },
  stockStatus: {
    description: "Stock pill under the price (localised label), also a catalog filter facet. Empty = no pill.",
    values: ["", "in-stock", "low-stock", "out-of-stock", "on-order"],
  },
  variants: {
    description:
      "Option selects in the product card (one <select> per item, 2 columns when several): [{ label, options }], label = field name (\"Size\"), options = array of option texts (add \"+ 10 €\" to a text to show an upcharge; informational only, there is no cart).",
    format: "array of objects",
  },
  badges: {
    description: "Uppercase pills above the price (e.g. [\"New\", \"Limited Edition\"]); the first one is also shown on listing cards and used as a catalog facet.",
    format: "array of strings",
  },
  ctaPrimaryLabel: { description: "Main button text (empty = the theme setting productDefaults.ctaLabel). Shown only when a label and a link resolve." },
  ctaPrimaryHref: {
    description: "Main button target: a site path (\"/shop.html\") or a URL, \"mailto:…\" works too (empty = productDefaults.ctaHref).",
    format: "site path or URL",
  },
  ctaSecondaryLabel: { description: "Outlined secondary button text. Shown only when ctaSecondaryHref is also set." },
  ctaSecondaryHref: { description: "Secondary button target: a site path (\"/shop.html\") or a URL.", format: "site path or URL" },
};
