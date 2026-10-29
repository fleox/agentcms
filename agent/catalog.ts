// What `agentcms options` tells an agent: the data backends and hosting
// targets, in the order to ask (data first, then hosting), with every
// field an install plan needs. Hosting ids are the setup wizard's own
// hosting cards (src/components/connectors/hostingOptions.ts).

export interface FieldSpec {
  key: string;
  required: boolean;
  description: string;
  example?: string;
  default?: string | boolean;
}

export interface DataBackendSpec {
  id: string;
  summary: string;
  goodFor: string;
  cli: boolean;
  fields: FieldSpec[];
  credentialTypes: string[];
  notes: string[];
}

export interface HostingSpec {
  id: string;
  connectorId: string;
  summary: string;
  cli: boolean;
  fields: FieldSpec[];
  credentialTypes: string[];
  notes: string[];
}

export const DATA_BACKENDS: DataBackendSpec[] = [
  {
    id: "sqlite-file",
    summary: "One SQLite file stored on the site's own hosting.",
    goodFor: "One owner, simplest setup, no other account.",
    cli: true,
    fields: [
      { key: "path", required: true, description: "File path on the hosting (or in the separate location).", example: "data/site.sqlite" },
      {
        key: "encryption",
        required: false,
        description: "Default: encrypted with a passphrase generated at install, stored as passphrase:<alias>. { credential: \"passphrase:<name>\" } to use an existing one, false for a plain file.",
      },
      {
        key: "location",
        required: false,
        description: "Separate PRIVATE place for the database: { type, settings, credential } like hosting (e.g. a private S3 / R2 bucket, a private GitHub repo via git-other). Default: the hosting itself — for git hostings, the dedicated branch agentcms-data of the same repo (never published, no site rebuild on save).",
      },
    ],
    credentialTypes: ["passphrase"],
    notes: [
      "A static host serves the database file like any page: keep it encrypted (default) and/or in a separate private location.",
      "No login screen: anyone who can open the admin and has the passphrase can edit; each browser asks for the keys + passphrase once.",
      "Losing the passphrase means losing the content: right after install, have the user save it (`agentcms credentials copy passphrase:<alias>`) and prove it (`agentcms credentials verify passphrase:<alias>`, typed by the user from their password manager).",
    ],
  },
  {
    id: "markdown-git",
    summary: "Posts as Markdown files in a GitHub or GitLab repository; every change is a commit.",
    goodFor: "Several editors or computers, full history.",
    cli: true,
    fields: [
      { key: "git.provider", required: true, description: "github | gitlab", example: "github" },
      { key: "git.owner", required: false, description: "GitHub user or organisation (github).", example: "my-login" },
      { key: "git.repo", required: false, description: "GitHub repository name (github).", example: "my-site-content" },
      { key: "git.project", required: false, description: "GitLab project path (gitlab).", example: "group/my-site-content" },
      { key: "git.branch", required: false, description: "Branch.", default: "main" },
      { key: "git.contentDir", required: false, description: "Folder inside the repo (\"\" = root).", default: "" },
      { key: "git.apiBaseUrl", required: false, description: "Self-hosted GitHub Enterprise / GitLab API URL." },
    ],
    credentialTypes: ["github", "gitlab"],
    notes: ["Each editor signs in to the admin with their own token; repository permission = role."],
  },
  {
    id: "firebase",
    summary: "Firestore + Firebase Auth.",
    goodFor: "Real-time multi-editor with email/password logins.",
    cli: true,
    fields: [
      { key: "firebase.apiKey", required: true, description: "Web app config apiKey (public — Firebase console → Project settings → Your apps)." },
      { key: "firebase.authDomain", required: true, description: "e.g. <project>.firebaseapp.com" },
      { key: "firebase.projectId", required: true, description: "Project id." },
      { key: "firebase.appId", required: true, description: "Web app id." },
      { key: "firebase.storageBucket", required: false, description: "From the web app config." },
      { key: "firebase.messagingSenderId", required: false, description: "From the web app config." },
      { key: "credential", required: true, description: "firebase:<name> account (email + password of the bootstrap admin)." },
      { key: "signInMethods", required: false, description: "Sign-in methods the admin offers: [\"password\", \"emailLink\", \"google\"] (password is always on — the CLI uses it). Enable the same in Firebase console → Authentication → Sign-in method and add the site's domain to Authorized domains." },
    ],
    credentialTypes: ["firebase"],
    notes: [
      "The project needs Authentication → Email/Password enabled, a user for the admin, Firestore created, and the AgentCMS Firestore rules published with that email pinned (`agentcms options --firebase-rules <email>`; illustrated console guide: docs/firebase.md). The CLI checks all of it before installing.",
      "Like the setup wizard, the publish target's keys are stored in Firestore config/storage (readable by the site's editors).",
      "Only invited addresses get access (whatever the sign-in method): `agentcms users invite <email> --role editor|admin --site <alias>`.",
    ],
  },
  {
    id: "local",
    summary: "Data kept in one browser (IndexedDB).",
    goodFor: "Trying it out on one computer.",
    cli: false,
    fields: [],
    credentialTypes: [],
    notes: ["Browser-only by nature: run `agentcms serve` and use the setup wizard."],
  },
];

const SITE_URL: FieldSpec = {
  key: "siteUrl",
  required: true,
  description: "Public URL the site is served at.",
  example: "https://my-login.github.io/my-site",
};

const gitFields = (provider: "github" | "gitlab"): FieldSpec[] => [
  ...(provider === "github"
    ? [
        { key: "owner", required: true, description: "GitHub user or organisation.", example: "my-login" },
        { key: "repo", required: true, description: "Repository holding the published site.", example: "my-site" },
      ]
    : [{ key: "project", required: true, description: "GitLab project path.", example: "group/my-site" }]),
  { key: "branch", required: false, description: "Branch the host publishes.", default: "main" },
  { key: "dir", required: false, description: "Repo folder holding the site.", default: provider === "gitlab" ? "public" : "" },
  { key: "apiBaseUrl", required: false, description: "Self-hosted API URL." },
  SITE_URL,
];

export const HOSTINGS: HostingSpec[] = [
  {
    id: "github-pages",
    connectorId: "git-pages",
    summary: "GitHub Pages — free hosting from a GitHub repository.",
    cli: true,
    fields: gitFields("github"),
    credentialTypes: ["github"],
    notes: [
      "siteUrl is https://<owner>.github.io/<repo> (or https://<owner>.github.io for a <owner>.github.io repo).",
      "GitHub Pages is enabled automatically when the token has the Pages permission; otherwise Settings → Pages → Deploy from a branch → main / root.",
      "Free plans need a public repository for Pages.",
    ],
  },
  {
    id: "cloudflare-pages",
    connectorId: "git-pages",
    summary: "Cloudflare Pages connected to a GitHub repository.",
    cli: true,
    fields: gitFields("github"),
    credentialTypes: ["github"],
    notes: ["Connect the repo once in the Cloudflare dashboard (Workers & Pages → Create → Pages → Connect to Git), no build command, output directory = repo root."],
  },
  {
    id: "gitlab-pages",
    connectorId: "git-pages",
    summary: "GitLab Pages.",
    cli: true,
    fields: gitFields("gitlab"),
    credentialTypes: ["gitlab"],
    notes: ["A minimal .gitlab-ci.yml is committed with the first publish."],
  },
  {
    id: "git-other",
    connectorId: "git-pages",
    summary: "Any host that deploys a GitHub repository (Netlify, Vercel…).",
    cli: true,
    fields: gitFields("github"),
    credentialTypes: ["github"],
    notes: [],
  },
  {
    id: "s3",
    connectorId: "s3",
    summary: "S3-compatible bucket (AWS, OVHcloud, Scaleway, Cloudflare R2, MinIO…).",
    cli: true,
    fields: [
      { key: "endpoint", required: false, description: "S3 API endpoint (empty = AWS).", example: "https://s3.eu-west-par.io.cloud.ovh.net" },
      { key: "region", required: true, description: "Region.", example: "eu-west-par" },
      { key: "bucket", required: true, description: "Bucket name.", example: "my-site" },
      { key: "prefix", required: false, description: "Key prefix inside the bucket.", default: "" },
      { key: "publicRead", required: false, description: "Send the public-read ACL (OVHcloud / Scaleway buckets without a bucket policy).", default: false },
      { key: "forcePathStyle", required: false, description: "Path-style URLs (default: off on AWS, on elsewhere)." },
      SITE_URL,
    ],
    credentialTypes: ["s3"],
    notes: [
      "The bucket needs CORS allowing GET/PUT/DELETE/HEAD from the admin's origin(s) and static website hosting with index.html.",
      "Host the admin on the bucket's HTTPS endpoint — signing requests needs a secure context.",
    ],
  },
  {
    id: "local-folder",
    connectorId: "local-folder",
    summary: "A folder on this computer (browser File System Access).",
    cli: false,
    fields: [],
    credentialTypes: [],
    notes: ["Browser-only: use `agentcms serve` and the setup wizard."],
  },
  {
    id: "zip",
    connectorId: "browser-mirror",
    summary: "ZIP download to upload by hand.",
    cli: false,
    fields: [],
    credentialTypes: [],
    notes: ["Browser-only: use `agentcms serve` and the setup wizard."],
  },
];

export function findHosting(id: string): HostingSpec | undefined {
  return HOSTINGS.find((h) => h.id === id);
}

export function findDataBackend(id: string): DataBackendSpec | undefined {
  return DATA_BACKENDS.find((d) => d.id === id);
}
