// Behavioural tests for the base-path handling of the public runtime
// scripts (theme loaders + flexweg-search). Each script is evaluated
// in a jsdom window, with or without the `x-cms-base` meta, against a
// stubbed fetch — we assert the fetched URLs and the rendered hrefs.
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
// @ts-ignore -- jsdom ships no types and @types/jsdom isn't installed.
import { JSDOM } from "jsdom";
import { describe, expect, it } from "vitest";

const ROOT = resolve(__dirname, "../..");

function load(rel: string): string {
  return readFileSync(resolve(ROOT, rel), "utf8");
}

const MENU = {
  header: [
    { label: "News", href: "/news/index.html" },
    { label: "Rel", href: "about.html" },
    { label: "Ext", href: "https://example.com/" },
    { label: "Done", href: "/repo/already.html" },
  ],
  footer: [],
  branding: { logoUrl: "/theme-assets/default-logo.webp?v=1" },
};

const POSTS = {
  posts: [
    { id: "a", type: "post", url: "news/a.html", title: "A", primaryTermId: "t" },
  ],
};

async function run(opts: {
  script: string;
  url: string;
  base?: string;
  body: string;
  json: Record<string, unknown>;
}) {
  const meta = opts.base ? `<meta name="x-cms-base" content="${opts.base}">` : "";
  const dom = new JSDOM(
    `<!doctype html><html lang="en"><head>${meta}</head><body>${opts.body}</body></html>`,
    { url: opts.url, runScripts: "outside-only", pretendToBeVisual: true },
  );
  const fetched: string[] = [];
  const win = dom.window as unknown as Window & { eval(src: string): void };
  (win as unknown as { fetch: unknown }).fetch = (u: string) => {
    fetched.push(u);
    const key = Object.keys(opts.json).find((k) => u.endsWith(k));
    const body = key ? opts.json[key] : null;
    return Promise.resolve({
      ok: !!body,
      status: body ? 200 : 404,
      json: () => Promise.resolve(body),
    });
  };
  win.eval(opts.script);
  for (let i = 0; i < 10; i++) await new Promise((r) => setTimeout(r, 0));
  return { doc: dom.window.document as Document, fetched };
}

const MENU_BODY =
  '<nav data-cms-menu="header"><ul></ul></nav><a data-cms-brand>Site</a>';

describe("theme menu-loader base path", () => {
  const themes = ["default", "magazine", "corporate", "portfolio", "storefront"];

  it.each(themes)("%s: root site keeps today's URLs", async (theme) => {
    const { doc, fetched } = await run({
      script: load(`src/themes/${theme}/menu-loader.js`),
      url: "https://site.com/news/index.html",
      body: MENU_BODY,
      json: { "data/menu.json": MENU },
    });
    expect(fetched).toEqual(["/data/menu.json"]);
    const hrefs = Array.from(doc.querySelectorAll('[data-cms-menu="header"] a')).map((a) =>
      a.getAttribute("href"),
    );
    expect(hrefs).toEqual(["/news/index.html", "about.html", "https://example.com/", "/repo/already.html"]);
    expect(doc.querySelector("[data-cms-brand] img")?.getAttribute("src")).toBe(
      "/theme-assets/default-logo.webp?v=1",
    );
  });

  it.each(themes)("%s: sub-folder site prefixes URLs once", async (theme) => {
    const { doc, fetched } = await run({
      script: load(`src/themes/${theme}/menu-loader.js`),
      url: "https://u.github.io/repo/news/",
      base: "/repo/",
      body: MENU_BODY,
      json: { "data/menu.json": MENU },
    });
    expect(fetched).toEqual(["/repo/data/menu.json"]);
    const links = Array.from(doc.querySelectorAll('[data-cms-menu="header"] a'));
    expect(links.map((a) => a.getAttribute("href"))).toEqual([
      "/repo/news/index.html",
      "/repo/about.html",
      "https://example.com/",
      "/repo/already.html",
    ]);
    // aria-current matching works with the base on both sides.
    expect(links[0].getAttribute("aria-current")).toBe("page");
    expect(doc.querySelector("[data-cms-brand] img")?.getAttribute("src")).toBe(
      "/repo/theme-assets/default-logo.webp?v=1",
    );
  });
});

describe("theme posts-loader base path", () => {
  const themes = ["default", "magazine", "corporate", "portfolio", "storefront"];
  const RELATED =
    '<div data-cms-related data-cms-term-id="t" data-cms-current-id="z"></div>';

  it.each(themes)("%s: root site, locale page", async (theme) => {
    const { doc, fetched } = await run({
      script: load(`src/themes/${theme}/posts-loader.js`),
      url: "https://site.com/fr/news/x.html",
      body: RELATED,
      json: { "fr/data/posts.json": POSTS },
    });
    expect(fetched).toContain("/fr/data/posts.json");
    expect(fetched).toContain("/fr/data/authors.json");
    expect(fetched).toContain("/data/authors.json");
    expect(doc.querySelector("[data-cms-related] a")?.getAttribute("href")).toBe("/news/a.html");
  });

  it.each(themes)("%s: sub-folder site strips base before locale detection", async (theme) => {
    const { doc, fetched } = await run({
      script: load(`src/themes/${theme}/posts-loader.js`),
      url: "https://u.github.io/repo/fr/news/x.html",
      base: "/repo/",
      body: RELATED,
      json: { "fr/data/posts.json": POSTS },
    });
    expect(fetched).toContain("/repo/fr/data/posts.json");
    expect(fetched).toContain("/repo/data/authors.json");
    expect(fetched.every((u) => u.startsWith("/repo/"))).toBe(true);
    expect(doc.querySelector("[data-cms-related] a")?.getAttribute("href")).toBe(
      "/repo/news/a.html",
    );
  });

  it("does not treat the base folder itself as a locale", async () => {
    const { fetched } = await run({
      script: load("src/themes/default/posts-loader.js"),
      url: "https://u.github.io/ab/news/x.html",
      base: "/ab/",
      body: RELATED,
      json: {},
    });
    expect(fetched.sort()).toEqual(["/ab/data/authors.json", "/ab/data/posts.json"]);
  });
});

describe("storefront catalog-loader + search runtime base path", () => {
  it("catalog-loader fetches products and links cards under the base", async () => {
    const { doc, fetched } = await run({
      script: load("src/themes/storefront/catalog-loader.js"),
      url: "https://u.github.io/repo/shop.html",
      // Base missing its trailing slash gets normalised.
      base: "/repo",
      body: "<div data-cms-catalog-grid></div>",
      json: {
        "data/products.json": {
          currency: "EUR",
          facets: {},
          products: [
            { id: "p", url: "shop/p.html", title: "P", imageUrl: "/media/p.webp", price: 1 },
          ],
        },
      },
    });
    expect(fetched).toEqual(["/repo/data/products.json"]);
    const hrefs = Array.from(doc.querySelectorAll("[data-cms-catalog-grid] a")).map((a) =>
      a.getAttribute("href"),
    );
    expect(hrefs.length).toBeGreaterThan(0);
    expect(hrefs.every((h) => h === "/repo/shop/p.html")).toBe(true);
    expect(doc.querySelector("[data-cms-catalog-grid] img")?.getAttribute("src")).toBe(
      "/repo/media/p.webp",
    );
  });

  it("search runtime resolves the index URL under the base", async () => {
    const src = load("src/plugins/flexweg-search/search-runtime.js");
    const { doc, fetched } = await run({
      script: src,
      url: "https://u.github.io/repo/",
      base: "/repo/",
      body: '<button data-cms-search>Search</button>',
      json: { "search-index.json": { meta: {}, items: [] } },
    });
    (doc.querySelector("[data-cms-search]") as HTMLElement).click();
    for (let i = 0; i < 10; i++) await new Promise((r) => setTimeout(r, 0));
    expect(fetched).toEqual(["/repo/search-index.json"]);
  });
});
