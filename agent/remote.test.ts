import { buildConfigJsSource } from "../src/lib/runtimeConfig";
import { changesBetween, fetchHostedAdmin, findSecretKeys, parseConfigJs, type ChangelogEntry } from "./remote";

describe("config.js", () => {
  it("round-trips what the admin generates", () => {
    const runtime = { backend: "sqlite-file", sqlite: { connectorId: "s3", settings: { bucket: "b" }, path: "data/site.sqlite" } };
    expect(parseConfigJs(buildConfigJsSource(runtime as never))).toEqual(runtime);
    expect(parseConfigJs("window.__AGENTCMS_CONFIG__ = null;")).toBeNull();
    expect(() => parseConfigJs("var x = 1;")).toThrow();
  });

  it("flags published secrets but not the public Firebase key", () => {
    expect(findSecretKeys({ backend: "firebase", firebase: { apiKey: "AIza" } })).toEqual([]);
    expect(findSecretKeys({ sqlite: { settings: { secretAccessKey: "x", token: "" } } })).toEqual(["sqlite.settings.secretAccessKey"]);
  });
});

describe("changesBetween", () => {
  const log: ChangelogEntry[] = [
    { version: "0.3.0", date: "", breaking: true, changes: ["c"], actions: ["deploy-admin", "regenerate-all"] },
    { version: "0.2.0", date: "", breaking: false, changes: ["b"], actions: ["deploy-admin"] },
    { version: "0.1.0", date: "", breaking: false, changes: ["a"], actions: [] },
  ];
  it("collects entries after `from` up to `to`", () => {
    expect(changesBetween(log, "0.1.0", "0.3.0")).toEqual({
      versions: ["0.3.0", "0.2.0"],
      breaking: true,
      changes: ["0.3.0: c", "0.2.0: b"],
      actions: ["deploy-admin", "regenerate-all"],
    });
    expect(changesBetween(log, "0.2.0", "0.2.0").versions).toEqual([]);
  });
});

describe("fetchHostedAdmin", () => {
  it("reads version + data schema + extension API, reports errors", async () => {
    const ok = (async () => new Response(JSON.stringify({ version: "0.2.0", dataSchema: 1, apiVersion: "1.4.0", apiMinVersion: "1.0.0", files: ["index.html"] }))) as unknown as typeof fetch;
    expect(await fetchHostedAdmin("https://x.test/admin/", ok)).toEqual({ version: "0.2.0", dataSchema: 1, apiVersion: "1.4.0", apiMinVersion: "1.0.0", files: ["index.html"] });
    const older = (async () => new Response(JSON.stringify({ version: "0.1.1", dataSchema: 2, files: [] }))) as unknown as typeof fetch;
    expect((await fetchHostedAdmin("https://x.test/admin/", older)).apiVersion).toBeNull();
    const missing = (async () => new Response("nope", { status: 404 })) as unknown as typeof fetch;
    expect((await fetchHostedAdmin("https://x.test/admin/", missing)).error).toBe("HTTP 404");
  });
});
