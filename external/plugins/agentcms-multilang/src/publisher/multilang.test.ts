// Unit tests for the per-language site texts, search indexes and the
// cleanup of removed languages. @agent-cms/runtime is mocked: only the
// storage + config calls these modules make are recorded.
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { Post, PublishContext, SiteSettings, Term } from "@agent-cms/runtime";

const io = vi.hoisted(() => ({
  deletes: [] as string[],
  folders: [] as string[],
  configs: [] as Array<{ id: string; config: unknown }>,
  caps: { model: "files", deletePrefix: false, list: true } as { model: string; deletePrefix: boolean; list: boolean },
  folderFails: false,
}));

vi.mock("@agent-cms/runtime", () => ({
  deleteFile: async (path: string) => {
    io.deletes.push(path);
  },
  deleteFolder: async (path: string) => {
    if (io.folderFails) throw new Error("501");
    io.folders.push(path);
  },
  getStorageCapabilities: async () => ({ ...io.caps, rename: false, renameFolder: false, folders: false, connectorId: "x" }),
  updatePluginConfig: async (id: string, config: unknown) => {
    io.configs.push({ id, config });
  },
  markdownToPlainText: (md: string) => md,
  pathToPublicUrl: (base: string, path: string) => `${base}/${path}`,
  publishPostsJson: async () => undefined,
  publishAuthorsJson: async () => undefined,
}));

import { getMultilangConfig, localizeSettings } from "../core/config";
import { cleanupRemovedLanguages, knownLanguagePaths, languagesToRemove } from "./languageCleanup";
import { buildSearchLocales } from "./search";
import { localizedChannelTexts } from "./feeds";

const PID = "agentcms-multilang";

function settingsWith(ml: Record<string, unknown>, extra: Partial<SiteSettings> = {}): SiteSettings {
  return {
    title: "Mon site",
    description: "Le meilleur site",
    language: "fr",
    baseUrl: "https://s.com",
    pluginConfigs: { [PID]: { primaryLanguage: "fr", ...ml } },
    ...extra,
  } as unknown as SiteSettings;
}

const category = (id: string, slug: string, name: string, translations?: Record<string, unknown>): Term =>
  ({ id, type: "category", slug, name, translations }) as unknown as Term;
const post = (p: Partial<Post> & { id: string; slug: string; title: string }): Post =>
  ({ type: "post", contentMarkdown: "", status: "online", termIds: [], ...p }) as unknown as Post;

function ctxFor(settings: SiteSettings, posts: Post[] = [], terms: Term[] = [], pages: Post[] = []): PublishContext {
  return { settings, posts, pages, terms } as unknown as PublishContext;
}

beforeEach(() => {
  io.deletes = [];
  io.folders = [];
  io.configs = [];
  io.caps = { model: "files", deletePrefix: false, list: true };
  io.folderFails = false;
});

describe("siteTexts — translated site title / description", () => {
  const settings = settingsWith({
    enabledLanguages: ["en", "de"],
    siteTexts: { en: { title: "My site", description: "The best site" }, de: { title: "  " }, fr: { title: "Ignored" } },
  });
  const config = getMultilangConfig(settings);

  it("overrides title + description for a secondary language", () => {
    const s = localizeSettings(settings, "en", config);
    expect(s).toMatchObject({ language: "en", title: "My site", description: "The best site" });
  });

  it("keeps the primary texts when empty, missing, or for the primary language", () => {
    expect(localizeSettings(settings, "de", config)).toMatchObject({ language: "de", title: "Mon site", description: "Le meilleur site" });
    expect(localizeSettings(settings, "fr", config)).toMatchObject({ title: "Mon site" });
  });

  it("uses the translated title as the RSS channel title, else '<title> (Language)'", () => {
    expect(localizedChannelTexts(settings, "en", config)).toEqual({ channelTitle: "My site", channelDescription: "The best site" });
    const de = localizedChannelTexts(settings, "de", config);
    expect(de.channelTitle).toMatch(/^Mon site \(.+\)$/);
    expect(de.channelDescription).toBe("Le meilleur site");
  });
});

describe("search.index.locales — per-language search corpus", () => {
  const terms = [
    category("news", "actualites", "Actualités", { en: { slug: "news", name: "News" } }),
    category("misc", "divers", "Divers"),
  ];
  const posts = [
    post({ id: "a", slug: "bonjour", title: "Bonjour", primaryTermId: "news", translations: { en: { slug: "hello", title: "Hello", contentMarkdown: "" } } }),
    // Category without an EN translation: the EN variant isn't published.
    post({ id: "b", slug: "autre", title: "Autre", primaryTermId: "misc", translations: { en: { slug: "other", title: "Other", contentMarkdown: "" } } }),
    post({ id: "c", slug: "seul", title: "Seul", primaryTermId: "news" }),
  ];
  const pages = [
    post({ id: "home", type: "page", slug: "accueil", title: "Accueil", translations: { en: { slug: "home", title: "Home", contentMarkdown: "" } } }),
    post({ id: "about", type: "page", slug: "a-propos", title: "À propos", translations: { en: { slug: "about", title: "About", contentMarkdown: "" } } }),
  ];

  it("returns one entry per secondary language with the translated, published corpus", () => {
    const settings = settingsWith(
      { enabledLanguages: ["en", "fr"], siteTexts: { en: { title: "My site" } } },
      { homeMode: "static-page", homePageId: "home" } as Partial<SiteSettings>,
    );
    const [en, ...rest] = buildSearchLocales({ posts, pages, terms, settings });
    expect(rest).toEqual([]);
    expect(en.language).toBe("en");
    expect(en.path).toBe("en/search-index.json");
    expect(en.posts.map((p) => [p.id, p.title, p.slug])).toEqual([["a", "Hello", "hello"]]);
    expect(en.terms.find((t) => t.id === "news")).toMatchObject({ slug: "en/news", name: "News" });
    // The home page is linked through its `<lang>/index` slug.
    expect(en.pages.map((p) => [p.id, p.slug])).toEqual([["home", "en/index"], ["about", "en/about"]]);
    expect(en.settings).toMatchObject({ language: "en", title: "My site", homePageId: undefined });
  });

  it("returns nothing without secondary languages", () => {
    expect(buildSearchLocales({ posts, pages, terms, settings: settingsWith({ enabledLanguages: [] }) })).toEqual([]);
  });
});

describe("removed languages — cleanup of the <lang>/ tree", () => {
  const terms = [category("news", "actualites", "Actualités", { en: { slug: "news", name: "News" } })];

  it("lists recorded languages no longer enabled, never the primary or a category-slug collision", () => {
    const config = getMultilangConfig(
      settingsWith({ enabledLanguages: ["de"], lastPublishedLanguages: ["en", "de", "fr", "tv", "../x"] }),
    );
    const ctx = ctxFor(settingsWith({}), [], [...terms, category("tv", "tv", "TV")]);
    expect(languagesToRemove(config, ctx)).toEqual(["en"]);
  });

  it("bootstraps from the posts' per-locale paths when nothing is recorded yet", () => {
    const config = getMultilangConfig(settingsWith({ enabledLanguages: [] }));
    const posts = [post({ id: "a", slug: "x", title: "X", lastPublishedPathsByLocale: { en: "en/news/x.html" } })];
    expect(languagesToRemove(config, ctxFor(settingsWith({}), posts, terms))).toEqual(["en"]);
    const recorded = getMultilangConfig(settingsWith({ enabledLanguages: [], lastPublishedLanguages: [] }));
    expect(languagesToRemove(recorded, ctxFor(settingsWith({}), posts, terms))).toEqual([]);
  });

  it("deletes the whole folder of a removed language and records the published ones", async () => {
    const settings = settingsWith({ enabledLanguages: ["de"], lastPublishedLanguages: ["en", "de"] });
    const ctx = ctxFor(settings, [], terms);
    const removed = await cleanupRemovedLanguages(ctx, getMultilangConfig(settings));
    expect(removed).toEqual(["en"]);
    expect(io.folders).toEqual(["en"]);
    expect(io.deletes).toEqual(["sitemaps/sitemap-news-en.xml"]);
    expect(io.configs).toEqual([
      { id: PID, config: { primaryLanguage: "fr", enabledLanguages: ["de"], lastPublishedLanguages: ["de"] } },
    ]);
    // ctx patched: a second listing pass in the same action is a no-op.
    expect(await cleanupRemovedLanguages(ctx, getMultilangConfig(ctx.settings))).toEqual([]);
    expect(io.folders).toEqual(["en"]);
    expect(io.configs).toHaveLength(1);
  });

  it("deletes the known paths when the target can't delete a folder", async () => {
    io.caps = { model: "files", deletePrefix: false, list: false };
    const posts = [post({ id: "a", slug: "x", title: "X", lastPublishedPathsByLocale: { en: "en/news/x.html" } })];
    const settings = settingsWith({ enabledLanguages: [], lastPublishedLanguages: ["en"] });
    await cleanupRemovedLanguages(ctxFor(settings, posts, terms), getMultilangConfig(settings));
    expect(io.folders).toEqual([]);
    expect(io.deletes).toEqual(expect.arrayContaining([
      "en/index.html",
      "en/news/index.html",
      "en/news/x.html",
      "en/data/posts.json",
      "en/search-index.json",
      "en/rss.xml",
      "en/archives/index.html",
      "sitemaps/sitemap-news-en.xml",
    ]));
  });

  it("falls back to the known paths when deleteFolder throws", async () => {
    io.folderFails = true;
    const settings = settingsWith({ enabledLanguages: [], lastPublishedLanguages: ["en"] });
    await cleanupRemovedLanguages(ctxFor(settings, [], terms), getMultilangConfig(settings));
    expect(io.deletes).toContain("en/index.html");
  });

  it("only records the languages when nothing was removed, and stays quiet once recorded", async () => {
    const settings = settingsWith({ enabledLanguages: ["en"] });
    const ctx = ctxFor(settings, [], terms);
    expect(await cleanupRemovedLanguages(ctx, getMultilangConfig(settings))).toEqual([]);
    expect(io.folders).toEqual([]);
    expect(io.configs.map((c) => (c.config as { lastPublishedLanguages: string[] }).lastPublishedLanguages)).toEqual([["en"]]);
    io.configs = [];
    await cleanupRemovedLanguages(ctx, getMultilangConfig(ctx.settings));
    expect(io.configs).toEqual([]);
  });

  it("knownLanguagePaths covers translated category archives and post variants", () => {
    const posts = [post({ id: "a", slug: "x", title: "X", lastPublishedPathsByLocale: { en: "en/news/x.html", de: "de/n/x.html" } })];
    const paths = knownLanguagePaths("en", ctxFor(settingsWith({}), posts, terms));
    expect(paths).toContain("en/news/index.html");
    expect(paths).toContain("en/news/x.html");
    expect(paths).not.toContain("de/n/x.html");
  });
});
