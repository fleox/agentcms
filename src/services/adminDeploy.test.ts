import { describe, expect, it } from "vitest";
import { missingIndexReferences } from "./adminDeploy";

describe("missingIndexReferences", () => {
  const html =
    '<script src="./config.js"></script><script type="module" crossorigin src="./assets/index-NEW.js"></script>' +
    '<link rel="stylesheet" crossorigin href="./assets/index-A.css"><link rel="icon" href="./favicon.svg">';

  it("flags bundles index.html loads that the copy doesn't contain", () => {
    expect(missingIndexReferences(html, ["assets/index-OLD.js", "assets/index-A.css", "favicon.svg"])).toEqual([
      "assets/index-NEW.js",
    ]);
  });

  it("passes when index.html and the manifest come from the same build", () => {
    expect(missingIndexReferences(html, ["assets/index-NEW.js", "assets/index-A.css", "favicon.svg"])).toEqual([]);
  });
});
