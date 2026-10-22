import { DATA_BACKENDS, HOSTINGS } from "../catalog";
import { CREDENTIAL_TYPES } from "../credentials";
import { printResult } from "../output";
import type { Command } from "./types";

const PLAN_EXAMPLE = {
  alias: "my-blog",
  data: { backend: "markdown-git", git: { provider: "github", owner: "my-login", repo: "my-blog-content", branch: "main" }, credential: "github:my-login" },
  hosting: { type: "github-pages", settings: { owner: "my-login", repo: "my-blog", siteUrl: "https://my-login.github.io/my-blog" } },
  admin: { folder: "admin" },
};

export const optionsCommand: Command = {
  name: "options",
  summary: "List data backends, hostings, credential types and the install plan format — ask the user about data first, then hosting.",
  usage: "options",
  options: [],
  async run({ io }) {
    const data = {
      order: ["data", "hosting"],
      dataBackends: DATA_BACKENDS,
      hostings: HOSTINGS,
      credentialTypes: CREDENTIAL_TYPES,
      planExample: PLAN_EXAMPLE,
      planNotes: [
        "Secrets never go in the plan: store them first with `agentcms credentials set <type>:<name>` and reference the account id.",
        "hosting.credential may be omitted for git hostings on the same provider as markdown-git content (the content token is reused).",
        "admin: false skips copying the admin onto the hosting.",
        "SQLite is encrypted by default (passphrase generated and stored as passphrase:<alias>); data.location keeps the file in a separate private place.",
        "Entries with cli: false need the setup wizard: `agentcms serve`.",
      ],
    };
    printResult(io, data, () =>
      [
        "1. Where is the content stored?",
        ...DATA_BACKENDS.map((d) => `   ${d.id.padEnd(14)} ${d.summary}${d.cli ? "" : "  (wizard only)"}`),
        "",
        "2. Where is the site hosted?",
        ...HOSTINGS.map((h) => `   ${h.id.padEnd(17)} ${h.summary}${h.cli ? "" : "  (wizard only)"}`),
        "",
        "Plan example (agentcms install --plan plan.json):",
        JSON.stringify(PLAN_EXAMPLE, null, 2),
      ].join("\n"),
    );
  },
};
