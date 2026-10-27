// User-facing hosting choices. Several map to the same connector with a
// preset (GitHub Pages / Cloudflare Pages / GitLab Pages are all the
// "git-pages" connector) — the user picks where the site is hosted,
// not which API the admin talks to.

export interface HostingOption {
  id: string;
  connectorId: string;
  // Settings applied when the option is picked.
  preset: Record<string, unknown>;
  // Fields fixed by the preset, hidden from the form.
  hiddenFields: string[];
  // Matches a stored target back to its option.
  matches: (connectorId: string, settings: Record<string, unknown>) => boolean;
}

const gitHost = (host: string) => (connectorId: string, s: Record<string, unknown>) =>
  connectorId === "git-pages" && (s.host ?? "github-pages") === host;

export const HOSTING_OPTIONS: HostingOption[] = [
  {
    id: "github-pages",
    connectorId: "git-pages",
    preset: { host: "github-pages", provider: "github", branch: "main" },
    hiddenFields: ["host", "provider"],
    matches: gitHost("github-pages"),
  },
  {
    id: "cloudflare-pages",
    connectorId: "git-pages",
    preset: { host: "cloudflare-pages", provider: "github", branch: "main" },
    hiddenFields: ["host"],
    matches: gitHost("cloudflare-pages"),
  },
  {
    id: "gitlab-pages",
    connectorId: "git-pages",
    preset: { host: "gitlab-pages", provider: "gitlab", branch: "main", dir: "public" },
    hiddenFields: ["host", "provider"],
    matches: gitHost("gitlab-pages"),
  },
  {
    id: "git-other",
    connectorId: "git-pages",
    preset: { host: "other", provider: "github", branch: "main" },
    hiddenFields: ["host"],
    matches: gitHost("other"),
  },
  {
    id: "s3",
    connectorId: "s3",
    preset: { region: "auto" },
    hiddenFields: [],
    matches: (c) => c === "s3",
  },
  {
    id: "local-folder",
    connectorId: "local-folder",
    preset: {},
    hiddenFields: [],
    matches: (c) => c === "local-folder",
  },
  {
    id: "zip",
    connectorId: "browser-mirror",
    preset: {},
    hiddenFields: [],
    matches: (c) => c === "browser-mirror",
  },
];

export function hostingOptionFor(connectorId: string, settings: Record<string, unknown>): HostingOption {
  return HOSTING_OPTIONS.find((o) => o.matches(connectorId, settings)) ?? HOSTING_OPTIONS[0];
}

export function getHostingOption(id: string): HostingOption {
  return HOSTING_OPTIONS.find((o) => o.id === id) ?? HOSTING_OPTIONS[0];
}
