// Documents the attributes of storefront/newsletter for
// `agentcms content blocks storefront/newsletter` (values are enforced on --attrs).

import type { SettingsSchema } from "@agent-cms/runtime";

export const ATTRS_SCHEMA: SettingsSchema = {
  variant: {
    description: "\"card\" = centered card on a light surface (default); \"banner\" = full-width primary-colored band, text left and form right.",
    values: ["card", "banner"],
  },
  eyebrow: { description: "Small uppercase label above the title (empty = hidden)." },
  title: { description: "Serif headline (empty = hidden)." },
  subtitle: { description: "Paragraph under the title (empty = hidden)." },
  placeholder: { description: "Placeholder of the email field (empty = \"Email address\")." },
  ctaLabel: { description: "Submit button text (empty = \"Subscribe\")." },
  mode: {
    description:
      "How the form is sent by the theme's runtime: \"endpoint\" = POST urlencoded (email field) to endpoint (Formspree / Buttondown / Mailchimp-style); \"mailto\" = opens a mail to the mailto address.",
    values: ["endpoint", "mailto"],
  },
  endpoint: { description: "Form POST URL used in \"endpoint\" mode.", format: "URL" },
  mailto: { description: "Recipient email address used in \"mailto\" mode.", format: "email" },
  successMessage: {
    description: "Text shown after a successful submit. Empty = \"Thanks — you're on the list.\".",
  },
  errorMessage: {
    description: "Text shown when the submit fails. Empty = \"Something went wrong. Please try again.\".",
  },
};
