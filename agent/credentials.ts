import { chmodSync } from "node:fs";
import { CliError } from "./output";
import { homePath, isWorldReadable, readJsonFile, writeJsonFile } from "./home";

// Credentials are stored per ACCOUNT ("github:fleox", "s3:ovh-prod"),
// not per site: ten sites on one GitHub account share one token, and
// revoking it is one edit. Sites only reference account ids.

export interface CredentialType {
  // Connector settings keys this credential fills.
  fields: string[];
  label: string;
  // Where the user creates it — shown by `credentials types` and in errors.
  howTo: string;
}

export const CREDENTIAL_TYPES: Record<string, CredentialType> = {
  github: {
    fields: ["token"],
    label: "GitHub personal access token",
    howTo:
      "https://github.com/settings/personal-access-tokens/new — fine-grained, 'Only select repositories' (content + site repos), Repository permissions: Contents Read and write, Pages Read and write (optional, lets the site be published automatically), Metadata Read-only.",
  },
  gitlab: {
    fields: ["token"],
    label: "GitLab access token",
    howTo: "GitLab project → Settings → Access tokens (or user Preferences → Access tokens): scope `api`, role Developer or higher.",
  },
  s3: {
    fields: ["accessKeyId", "secretAccessKey"],
    label: "S3 access key pair",
    howTo:
      "AWS IAM user with s3:GetObject/PutObject/DeleteObject/ListBucket on the bucket, or OVHcloud Public Cloud → Object Storage → S3 users. Import an existing aws CLI profile with --from-aws-profile.",
  },
  flexweg: {
    fields: ["apiKey"],
    label: "Flexweg API key",
    howTo: "Flexweg dashboard → your site → API keys.",
  },
  "php-bridge": {
    fields: ["apiKey"],
    label: "PHP bridge key",
    howTo: "The FLEXWEG_BRIDGE_KEY value from flexweg-bridge.config.php on your server.",
  },
};

export interface StoredCredential {
  type: string;
  values: Record<string, string>;
  updatedAt: string;
}

interface CredentialFile {
  version: 1;
  accounts: Record<string, StoredCredential>;
}

const ACCOUNT_RE = /^([a-z0-9-]+):([A-Za-z0-9._@-]{1,100})$/;

function file(): string {
  return homePath("credentials.json");
}

function load(): CredentialFile {
  return readJsonFile<CredentialFile>(file(), { version: 1, accounts: {} });
}

function save(data: CredentialFile): void {
  writeJsonFile(file(), data, 0o600);
}

export function parseAccount(account: string): { type: string; name: string } {
  const m = ACCOUNT_RE.exec(account);
  if (!m || !CREDENTIAL_TYPES[m[1]]) {
    throw new CliError(
      "invalid-account",
      `Invalid account "${account}".`,
      `Use <type>:<name> with type one of ${Object.keys(CREDENTIAL_TYPES).join(", ")} — e.g. github:my-login.`,
      2,
    );
  }
  return { type: m[1], name: m[2] };
}

export function setCredential(account: string, values: Record<string, string>): StoredCredential {
  const { type } = parseAccount(account);
  const missing = CREDENTIAL_TYPES[type].fields.filter((f) => !values[f]?.trim());
  if (missing.length) throw new CliError("missing-fields", `Missing ${missing.join(", ")} for ${account}.`);
  const data = load();
  const entry: StoredCredential = {
    type,
    values: Object.fromEntries(CREDENTIAL_TYPES[type].fields.map((f) => [f, values[f].trim()])),
    updatedAt: new Date().toISOString(),
  };
  data.accounts[account] = entry;
  save(data);
  return entry;
}

export function removeCredential(account: string): boolean {
  const data = load();
  if (!data.accounts[account]) return false;
  delete data.accounts[account];
  save(data);
  return true;
}

export function getCredential(account: string): StoredCredential | null {
  parseAccount(account);
  const path = file();
  // Tighten permissions if someone loosened them.
  if (isWorldReadable(path)) chmodSync(path, 0o600);
  return load().accounts[account] ?? null;
}

// Throws an actionable error when the account is missing.
export function requireCredential(account: string): StoredCredential {
  const cred = getCredential(account);
  if (!cred) {
    const { type } = parseAccount(account);
    throw new CliError(
      "credential-missing",
      `No stored credential for ${account}.`,
      `Ask the user to run \`agentcms credentials set ${account}\` in their own terminal (input is hidden). ${CREDENTIAL_TYPES[type].howTo}`,
    );
  }
  return cred;
}

// Public view — field names only, never values.
export function listCredentials(): { account: string; type: string; fields: string[]; updatedAt: string }[] {
  return Object.entries(load().accounts).map(([account, c]) => ({
    account,
    type: c.type,
    fields: Object.keys(c.values),
    updatedAt: c.updatedAt,
  }));
}
