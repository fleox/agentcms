import { absoluteAssets, siteRelativeAssets, siteRelativeUrl } from "./basePath";

const base = "http://bucket.s3-website.example.net/blog";

describe("site-relative assets", () => {
  it("makes the site's own image URLs root-relative, keeps links and meta absolute", () => {
    const html =
      `<head><link rel="canonical" href="${base}/a.html"/><meta property="og:image" content="${base}/media/x/large.webp"/></head>` +
      `<img src="${base}/media/x/large.webp" srcset="${base}/media/x/small.webp 400w, ${base}/media/x/large.webp 1200w"/>` +
      `<img src="https://cdn.other.net/y.png"/><a href="${base}/media/x/large.webp">x</a>`;
    const out = siteRelativeAssets(html, base);
    expect(out).toContain(`<img src="/blog/media/x/large.webp" srcset="/blog/media/x/small.webp 400w, /blog/media/x/large.webp 1200w"/>`);
    expect(out).toContain(`href="${base}/a.html"`);
    expect(out).toContain(`content="${base}/media/x/large.webp"`);
    expect(out).toContain(`src="https://cdn.other.net/y.png"`);
    expect(out).toContain(`<a href="${base}/media/x/large.webp">`);
  });

  it("is a no-op without a site URL or foreign URLs", () => {
    const html = `<img src="http://elsewhere.net/a.png"/>`;
    expect(siteRelativeAssets(html, "")).toBe(html);
    expect(siteRelativeAssets(html, base)).toBe(html);
    expect(siteRelativeUrl("http://elsewhere.net/a.png", base)).toBe("http://elsewhere.net/a.png");
  });

  it("round-trips for the admin preview", () => {
    expect(absoluteAssets(`<img src="/blog/media/a.webp"/>`, base)).toBe(`<img src="http://bucket.s3-website.example.net/blog/media/a.webp"/>`);
  });
});
