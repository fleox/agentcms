import { describe, expect, it } from "vitest";
import { applyBasePathToHtml, basePathFromBaseUrl, withBasePath } from "./basePath";

describe("basePathFromBaseUrl", () => {
  it("is empty for domain-root sites", () => {
    expect(basePathFromBaseUrl("https://site.com")).toBe("");
    expect(basePathFromBaseUrl("https://site.com/")).toBe("");
    expect(basePathFromBaseUrl("")).toBe("");
    expect(basePathFromBaseUrl(undefined)).toBe("");
    expect(basePathFromBaseUrl("not a url")).toBe("");
  });

  it("extracts the sub-folder without trailing slash", () => {
    expect(basePathFromBaseUrl("https://user.github.io/repo")).toBe("/repo");
    expect(basePathFromBaseUrl("https://user.github.io/repo/")).toBe("/repo");
    expect(basePathFromBaseUrl("https://site.com/a/b//")).toBe("/a/b");
  });
});

describe("withBasePath", () => {
  it("prefixes root-absolute paths only", () => {
    expect(withBasePath("/news/a.html", "/repo")).toBe("/repo/news/a.html");
    expect(withBasePath("news/a.html", "/repo")).toBe("news/a.html");
    expect(withBasePath("https://x.com/a", "/repo")).toBe("https://x.com/a");
    expect(withBasePath("//cdn.x.com/a.js", "/repo")).toBe("//cdn.x.com/a.js");
  });

  it("never double-prefixes", () => {
    expect(withBasePath("/repo/news/a.html", "/repo")).toBe("/repo/news/a.html");
    expect(withBasePath("/repo", "/repo")).toBe("/repo");
    expect(withBasePath("/repository/a.html", "/repo")).toBe("/repo/repository/a.html");
  });

  it("is a no-op without base path", () => {
    expect(withBasePath("/news/a.html", "")).toBe("/news/a.html");
  });
});

describe("applyBasePathToHtml", () => {
  const page =
    '<html lang="en"><head><link rel="stylesheet" href="/theme-assets/default.css"/>' +
    '<link rel="canonical" href="https://user.github.io/repo/news/a.html"/></head>' +
    '<body><a href="/index.html">Home</a><a href="#top">Top</a>' +
    '<img src="/media/a.webp" srcset="/media/a-small.webp 480w, /media/a.webp 1200w"/>' +
    '<form action="/search.html"></form><script src="//cdn.x.com/a.js"></script></body></html>';

  it("leaves root-served pages byte-identical", () => {
    expect(applyBasePathToHtml(page, "")).toBe(page);
  });

  it("rewrites root-absolute URLs and injects the base meta", () => {
    const out = applyBasePathToHtml(page, "/repo");
    expect(out).toContain('<head><meta name="x-cms-base" content="/repo/"/>');
    expect(out).toContain('href="/repo/theme-assets/default.css"');
    expect(out).toContain('href="/repo/index.html"');
    expect(out).toContain('src="/repo/media/a.webp"');
    expect(out).toContain('srcset="/repo/media/a-small.webp 480w, /repo/media/a.webp 1200w"');
    expect(out).toContain('action="/repo/search.html"');
    // Untouched: absolute, protocol-relative, fragment.
    expect(out).toContain('href="https://user.github.io/repo/news/a.html"');
    expect(out).toContain('src="//cdn.x.com/a.js"');
    expect(out).toContain('href="#top"');
  });

  it("is idempotent", () => {
    const once = applyBasePathToHtml(page, "/repo");
    const body = once.replace('<meta name="x-cms-base" content="/repo/"/>', "");
    expect(applyBasePathToHtml(body, "/repo")).toBe(once);
  });
});
