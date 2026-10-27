import { describe, expect, it } from "vitest";
import { isStaticHomePage } from "./slug";

describe("isStaticHomePage", () => {
  const page = { id: "home", type: "page" as const };
  it("is true only for the page bound to a static-page home", () => {
    expect(isStaticHomePage(page, { homeMode: "static-page", homePageId: "home" })).toBe(true);
    expect(isStaticHomePage(page, { homeMode: "latest-posts", homePageId: "home" })).toBe(false);
    expect(isStaticHomePage(page, { homeMode: "static-page", homePageId: "other" })).toBe(false);
    expect(isStaticHomePage(page, { homeMode: "static-page" })).toBe(false);
    expect(isStaticHomePage(page, undefined)).toBe(false);
  });
  it("never matches a post", () => {
    expect(
      isStaticHomePage({ id: "home", type: "post" }, { homeMode: "static-page", homePageId: "home" }),
    ).toBe(false);
  });
});
