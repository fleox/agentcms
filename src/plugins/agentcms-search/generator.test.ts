import { beforeEach, describe, expect, it, vi } from "vitest";
import type { Post, SiteSettings, Term } from "../../core/types";

const io = vi.hoisted(() => ({
  uploads: [] as Array<{ path: string; content: string }>,
  deletes: [] as string[],
  locales: [] as unknown[],
  filterArgs: [] as unknown[],
}));

vi.mock("@agent-cms/runtime", async () => {
  const slug = await import("../../core/slug");
  return {
    ...slug,
    i18n: {
      getResource: (locale: string, _ns: string, key: string) =>
        locale === "fr" && key === "runtime.placeholder" ? "Rechercher…" : undefined,
    },
    pickPublicLocale: (lang?: string) => ((lang ?? "en").startsWith("fr") ? "fr" : "en"),
    markdownToPlainText: (md: string) => md,
    sha256Hex: async (s: string) => (await import("node:crypto")).createHash("sha256").update(s).digest("hex"),
    uploadFile: async (o: { path: string; content: string }) => {
      io.uploads.push({ path: o.path, content: o.content });
    },
    deleteFile: async (path: string) => {
      io.deletes.push(path);
    },
    applyFilters: async (hook: string, initial: unknown[], args: unknown) => {
      if (hook !== "search.index.locales") return initial;
      io.filterArgs.push(args);
      return [...initial, ...io.locales];
    },
  };
});

import { buildIndex, regenerateAll, regenerateIndex, type SearchIndexFile } from "./generator";
import { DEFAULT_SEARCH_CONFIG, localeIndexPathFor } from "./config";

const page = (id: string, slug: string): Post =>
  ({ id, type: "page", slug, title: slug, contentMarkdown: "", status: "online", termIds: [] }) as unknown as Post;
const post = (id: string, slug: string, title: string, primaryTermId?: string): Post =>
  ({ id, type: "post", slug, title, contentMarkdown: "", status: "online", termIds: [], primaryTermId }) as unknown as Post;
const category = (id: string, slug: string, name: string): Term =>
  ({ id, type: "category", slug, name }) as unknown as Term;

const pages = [page("home", "home"), page("about", "about")];
const config = { ...DEFAULT_SEARCH_CONFIG, includePages: true };

beforeEach(() => {
  io.uploads = [];
  io.deletes = [];
  io.locales = [];
  io.filterArgs = [];
});

describe("agentcms-search buildIndex — static-page home", () => {
  it("links the static home page to the home (the runtime renders href=\"/\")", () => {
    const settings = { language: "en", homeMode: "static-page", homePageId: "home" } as SiteSettings;
    const index = buildIndex({ posts: [], pages, terms: [], settings, config });
    const urls = Object.fromEntries(index.items.map((i) => [i.id, i.url]));
    expect(urls).toEqual({ home: "", about: "about.html" });
  });

  it("keeps the page URL on a latest-posts home", () => {
    const settings = { language: "en", homeMode: "latest-posts", homePageId: "home" } as SiteSettings;
    const index = buildIndex({ posts: [], pages, terms: [], settings, config });
    expect(index.items.map((i) => i.url).sort()).toEqual(["about.html", "home.html"]);
  });

  it("links a localised home page (slug <lang>/index) to <lang>/", () => {
    const settings = { language: "en", homeMode: "latest-posts" } as SiteSettings;
    const index = buildIndex({ posts: [], pages: [page("home", "en/index")], terms: [], settings, config });
    expect(index.items[0].url).toBe("en/");
  });
});

describe("agentcms-search per-language indexes (search.index.locales)", () => {
  const settings = { title: "Site", language: "fr", baseUrl: "https://s.com" } as SiteSettings;
  const terms = [category("c", "actualites", "Actualités")];
  const input = {
    posts: [post("p", "bonjour", "Bonjour", "c")],
    pages: [],
    terms,
    settings,
    config,
  };
  const enEntry = {
    language: "en",
    path: "en/search-index.json",
    posts: [post("p", "hello", "Hello", "c")],
    pages: [],
    terms: [category("c", "en/news", "News")],
  };
  const parse = (path: string): SearchIndexFile =>
    JSON.parse(io.uploads.find((u) => u.path === path)!.content);

  it("writes <lang>/search-index.json with the translated entries and that language's UI strings", async () => {
    io.locales = [enEntry];
    const result = await regenerateIndex(input);
    expect(io.uploads.map((u) => u.path)).toEqual(["search-index.json", "en/search-index.json"]);
    const fr = parse("search-index.json");
    const en = parse("en/search-index.json");
    expect(fr.items[0]).toMatchObject({ title: "Bonjour", url: "actualites/bonjour.html", category: "Actualités" });
    expect(fr.meta.placeholder).toBe("Rechercher…");
    expect(en.items[0]).toMatchObject({ title: "Hello", url: "en/news/hello.html", category: "News" });
    expect(en.meta.placeholder).toBe("Search…");
    expect(result.nextConfig.lastLocalePaths).toEqual(["en/search-index.json"]);
    // The filter receives the corpus + config.
    expect(io.filterArgs[0]).toMatchObject({ settings, config });
  });

  it("skips the upload when nothing changed, rewrites when a language index changes", async () => {
    io.locales = [enEntry];
    const first = await regenerateIndex(input);
    io.uploads = [];
    const again = await regenerateIndex({ ...input, config: first.nextConfig });
    expect(again.uploaded).toBe(false);
    expect(io.uploads).toEqual([]);
    io.locales = [{ ...enEntry, posts: [post("p", "hello", "Hello world", "c")] }];
    const changed = await regenerateIndex({ ...input, config: first.nextConfig });
    expect(changed.uploaded).toBe(true);
    expect(io.uploads.map((u) => u.path)).toContain("en/search-index.json");
  });

  it("deletes the index of a language that is no longer returned, never the root index", async () => {
    io.locales = [enEntry];
    const first = await regenerateIndex(input);
    io.locales = [];
    const next = await regenerateIndex({ ...input, config: first.nextConfig });
    expect(next.uploaded).toBe(true);
    expect(io.deletes).toEqual(["en/search-index.json"]);
    expect(next.nextConfig.lastLocalePaths).toEqual([]);
  });

  it("force regenerate writes every language index and cleans stale ones", async () => {
    io.locales = [enEntry];
    const res = await regenerateAll({
      ...input,
      config: { ...config, lastLocalePaths: ["de/search-index.json", "en/search-index.json", "search-index.json"] },
    });
    expect(io.uploads.map((u) => u.path)).toEqual(["search-index.json", "en/search-index.json", "search.js"]);
    expect(io.deletes).toEqual(["de/search-index.json"]);
    expect(res.nextConfig.lastLocalePaths).toEqual(["en/search-index.json"]);
  });

  it("ignores entries without a path or repeating the root path", async () => {
    io.locales = [{ ...enEntry, path: "" }, { ...enEntry, path: "/search-index.json" }];
    await regenerateIndex(input);
    expect(io.uploads.map((u) => u.path)).toEqual(["search-index.json"]);
  });
});

describe("agentcms-search localeIndexPathFor", () => {
  it("points secondary-language pages at their index", () => {
    expect(localeIndexPathFor({ currentLocale: "en", currentPath: "en/news/hello.html" })).toBe("en/search-index.json");
    expect(localeIndexPathFor({ currentLocale: "en", currentPath: "en/index.html" })).toBe("en/search-index.json");
  });

  it("returns null for primary / unilingual pages and unsafe locales", () => {
    expect(localeIndexPathFor({ currentPath: "news/hello.html" })).toBeNull();
    expect(localeIndexPathFor({ currentLocale: "fr", currentPath: "actualites/a.html" })).toBeNull();
    expect(localeIndexPathFor({ currentLocale: 'en"x', currentPath: 'en"x/a.html' })).toBeNull();
    expect(localeIndexPathFor(undefined)).toBeNull();
  });
});
