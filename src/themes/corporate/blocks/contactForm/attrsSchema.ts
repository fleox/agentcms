// Documents the attributes of the corporate/contact-form block for
// `agentcms content blocks corporate/contact-form` (read by agents).

import type { SettingsSchema } from "@agent-cms/runtime";

export const ATTRS_SCHEMA: SettingsSchema = {
  heading: { description: "Form card heading. Empty = hidden." },
  subtitle: { description: "Paragraph under the heading. Empty = hidden." },
  mode: {
    description:
      "Submit destination: endpoint = POST to endpointUrl from the theme script (Formspree-compatible; default, also used for any unknown value), mailto = open the visitor's mail client addressed to mailtoAddress with the fields pre-filled.",
    values: ["endpoint", "mailto"],
  },
  endpointUrl: {
    description: "Form service URL used in endpoint mode (e.g. https://formspree.io/f/abcdefg). Empty = the form is not intercepted and does nothing useful.",
    format: "URL",
  },
  mailtoAddress: { description: "Recipient address used in mailto mode.", format: "email" },
  labelName: { description: "Label of the required name field (sample: \"Full name\")." },
  labelEmail: { description: "Label of the required email field (sample: \"Work email\")." },
  labelCompany: { description: "Label of the optional company field (sample: \"Company\")." },
  labelSubject: { description: "Label of the subject dropdown (sample: \"Subject\"); only shown when subjectOptions is set." },
  labelMessage: { description: "Label of the required message textarea (sample: \"Message\")." },
  subjectOptions: {
    description: "Options of a required subject dropdown, one per line (\\n-separated). Empty = no subject field.",
  },
  submitLabel: { description: "Submit button text (sample: \"Send inquiry\")." },
  privacyText: {
    description:
      "Text of a required consent checkbox; wrap part of it in [link]…[/link] to link it to privacyHref. Empty = no checkbox.",
  },
  privacyHref: { description: "Target of the [link]…[/link] part of privacyText (site path or absolute URL, opens in a new tab). Empty = plain text.", format: "URL" },
  successMessage: {
    description: "Message shown after a successful endpoint submission. Empty = a default thank-you line.",
  },
  errorMessage: {
    description: "Message shown when the endpoint answers with an error. Empty = a default error line.",
  },
};
