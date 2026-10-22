import { mkdtempSync, statSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { HOSTING_OPTIONS } from "../src/components/connectors/hostingOptions";
import { HOSTINGS } from "./catalog";
import { parseIni } from "./credentialSources";
import { getCredential, listCredentials, parseAccount, removeCredential, requireCredential, setCredential } from "./credentials";
import { findProjectSite, getSite, listSites, lockSite, putSite, removeSite, renameSite, resolveSite, setDefaultSite, type SiteRecord } from "./sites";

process.env.AGENTCMS_HOME = mkdtempSync(join(tmpdir(), "agentcms-home-"));

const site = (alias: string): SiteRecord => ({
  alias,
  siteUrl: `https://${alias}.example.com`,
  adminFolder: "admin",
  runtime: { backend: "local" },
  hosting: { connectorId: "s3", settings: { bucket: alias } },
  credentials: { hosting: "s3:main" },
  installedAt: "2026-10-22T00:00:00.000Z",
  updatedAt: "2026-10-22T00:00:00.000Z",
});

describe("credentials", () => {
  it("stores per account in a 0600 file and never lists values", () => {
    setCredential("github:me", { token: "ghp_secret" });
    expect(getCredential("github:me")?.values.token).toBe("ghp_secret");
    expect(JSON.stringify(listCredentials())).not.toContain("ghp_secret");
    expect(listCredentials()).toEqual([expect.objectContaining({ account: "github:me", type: "github", fields: ["token"] })]);
    if (process.platform !== "win32") {
      expect(statSync(join(process.env.AGENTCMS_HOME!, "credentials.json")).mode & 0o777).toBe(0o600);
    }
    expect(removeCredential("github:me")).toBe(true);
    expect(getCredential("github:me")).toBeNull();
  });

  it("validates account ids and required fields", () => {
    expect(() => parseAccount("nope")).toThrow(/Invalid account/);
    expect(() => parseAccount("ftp:me")).toThrow(/Invalid account/);
    expect(parseAccount("s3:ovh-prod")).toEqual({ type: "s3", name: "ovh-prod" });
    expect(() => setCredential("s3:x", { accessKeyId: "AK" })).toThrow(/secretAccessKey/);
  });

  it("explains how to create a missing credential", () => {
    expect(() => requireCredential("gitlab:team")).toThrow(/No stored credential/);
    try {
      requireCredential("gitlab:team");
    } catch (e) {
      expect((e as { hint: string }).hint).toContain("agentcms credentials set gitlab:team");
    }
  });

  it("reads aws CLI profiles", () => {
    const ini = parseIni("[default]\naws_access_key_id = AK\naws_secret_access_key=SK\n\n# c\n[other]\nx=1\n");
    expect(ini.default).toEqual({ aws_access_key_id: "AK", aws_secret_access_key: "SK" });
    expect(ini.other.x).toBe("1");
  });
});

describe("sites", () => {
  beforeEach(() => {
    for (const s of listSites().sites) removeSite(s.alias);
  });

  it("resolves the only site, refuses to guess between several", () => {
    putSite(site("blog"));
    expect(resolveSite().alias).toBe("blog");
    putSite(site("shop"));
    expect(() => resolveSite()).toThrow(/Several sites/);
    expect(resolveSite("shop").alias).toBe("shop");
    setDefaultSite("shop");
    expect(resolveSite().alias).toBe("shop");
    expect(() => resolveSite("nope")).toThrow(/No site named "nope"/);
  });

  it("renames and forgets", () => {
    putSite(site("blog"));
    setDefaultSite("blog");
    renameSite("blog", "journal");
    expect(getSite("blog")).toBeNull();
    expect(listSites().default).toBe("journal");
    expect(() => renameSite("journal", "Bad Alias")).toThrow(/Invalid site alias/);
    expect(removeSite("journal")).toBe(true);
    expect(listSites().default).toBeNull();
  });

  it("finds agentcms.json in a parent folder", () => {
    const dir = mkdtempSync(join(tmpdir(), "agentcms-proj-"));
    writeFileSync(join(dir, "agentcms.json"), JSON.stringify({ site: "client-x" }));
    expect(findProjectSite(dir)?.alias).toBe("client-x");
  });

  it("locks a site against concurrent writers", () => {
    const unlock = lockSite("blog");
    expect(() => lockSite("blog")).toThrow(/Another agentcms process/);
    unlock();
    lockSite("blog")();
  });
});

describe("catalog", () => {
  it("covers every hosting card of the setup wizard", () => {
    expect(HOSTINGS.map((h) => h.id).sort()).toEqual(HOSTING_OPTIONS.map((o) => o.id).sort());
    for (const h of HOSTINGS) expect(h.connectorId).toBe(HOSTING_OPTIONS.find((o) => o.id === h.id)!.connectorId);
  });
});
