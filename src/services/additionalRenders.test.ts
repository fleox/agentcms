import { beforeEach, describe, expect, it, vi } from "vitest";

const uploadFile = vi.fn<(args: { path: string; content: string }) => Promise<void>>();
const deleteFile = vi.fn<(path: string) => Promise<void>>();
vi.mock("./siteFiles", () => ({
  uploadFile: (args: { path: string; content: string }) => uploadFile(args),
  deleteFile: (path: string) => deleteFile(path),
}));

import { uploadAdditionalRenders } from "./additionalRenders";

const log = vi.fn();

beforeEach(() => {
  uploadFile.mockReset().mockResolvedValue(undefined);
  deleteFile.mockReset().mockResolvedValue(undefined);
  log.mockReset();
});

describe("uploadAdditionalRenders", () => {
  it("uploads every variant except the primary path and empty paths", async () => {
    const res = await uploadAdditionalRenders({
      additional: [
        { path: "fr/a-propos.html", html: "<fr>" },
        { path: "about.html", html: "<dup>" },
        { path: "", html: "<none>" },
      ],
      primaryPath: "about.html",
      previousByLocale: { fr: "fr/a-propos.html" },
      log,
    });
    expect(uploadFile.mock.calls.map((c) => c[0].path)).toEqual(["fr/a-propos.html"]);
    expect(deleteFile).not.toHaveBeenCalled();
    expect(res).toEqual({ uploaded: ["fr/a-propos.html"], failedDeletions: [] });
  });

  it("deletes variants the plugin no longer returns (e.g. a page that became the FR home)", async () => {
    const res = await uploadAdditionalRenders({
      additional: [],
      primaryPath: "index.html",
      previousByLocale: { fr: "fr/accueil.html" },
      log,
    });
    expect(deleteFile.mock.calls.map((c) => c[0])).toEqual(["fr/accueil.html"]);
    expect(res.failedDeletions).toEqual([]);
  });

  it("never deletes the primary path and reports failed deletions for retry", async () => {
    deleteFile.mockRejectedValueOnce(new Error("boom"));
    const res = await uploadAdditionalRenders({
      additional: [],
      primaryPath: "index.html",
      previousByLocale: { en: "index.html", fr: "fr/accueil.html" },
      log,
    });
    expect(deleteFile.mock.calls.map((c) => c[0])).toEqual(["fr/accueil.html"]);
    expect(res.failedDeletions).toEqual(["fr/accueil.html"]);
  });
});
