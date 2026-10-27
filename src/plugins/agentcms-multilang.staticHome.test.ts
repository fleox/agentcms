// Static-page home handling of the bundled agentcms-multilang plugin
// (source under external/plugins/agentcms-multilang, built by
// scripts/build-bundled-externals.mjs). Lives here because vitest only
// collects src/ and agent/.
import { describe, expect, it, vi } from "vitest";
import type { Post, PublishContext, SiteSettings, Term } from "../core/cmsRuntime";

const { updatePost } = vi.hoisted(() => ({ updatePost: vi.fn(async (..._args: unknown[]) => undefined) }));
vi.mock("@agent-cms/runtime", async () => {
  const slug = await import("../core/slug");
  return { ...slug, updatePost };
});
vi.mock("../../external/plugins/agentcms-multilang/src/publisher/render", () => ({
  renderLocalizedSingle: async (args: { language: string; trans: { slug: string } }) =>
    `<html lang="${args.language}">${args.trans.slug}</html>`,
}));

import {
  isLocaleHomePage,
  localeHomePageId,
} from "../../external/plugins/agentcms-multilang/src/core/urls";
import { postAlternates } from "../../external/plugins/agentcms-multilang/src/core/hreflang";
// Loaded through a computed specifier: its type imports target the
// published `types/agentcms-runtime.d.ts` (the plugin's own tsconfig),
// which the root tsconfig maps to cmsRuntime.ts — keep tsc out of it.
const SITEMAP_MODULE = "../../external/plugins/agentcms-multilang/src/publisher/sitemap";
type UrlsExtra = (
  existing: unknown[],
  args: { posts: Post[]; pages: Post[]; terms: Term[]; settings: SiteSettings; year: number },
) => Array<{ path: string; extraInnerXml?: string }>;
import { computeAdditional } from "../../external/plugins/agentcms-multilang/src/publisher/computeAdditional";
import type { MultilangConfig } from "../../external/plugins/agentcms-multilang/src/types";

const ts = (iso: string) => ({ toMillis: () => Date.parse(iso) });
const page = (id: string, slug: string, frSlug: string): Post =>
  ({
    id,
    type: "page",
    slug,
    title: slug,
    contentMarkdown: "",
    status: "online",
    termIds: [],
    createdAt: ts("2026-03-01T00:00:00Z"),
    updatedAt: ts("2026-03-02T00:00:00Z"),
    translations: { fr: { slug: frSlug, title: frSlug, contentMarkdown: "" } },
  }) as unknown as Post;

const home = page("home", "home", "accueil");
const about = page("about", "about", "a-propos");

const mlConfig = (homePages: Record<string, string> = {}): MultilangConfig => ({
  primaryLanguage: "en",
  enabledLanguages: ["fr"],
  homePages,
});

const settingsFor = (ml: MultilangConfig, extra: Partial<SiteSettings> = {}): SiteSettings =>
  ({
    baseUrl: "https://example.com",
    language: "en",
    homeMode: "static-page",
    homePageId: "home",
    pluginConfigs: { "agentcms-multilang": ml },
    ...extra,
  }) as SiteSettings;

describe("multilang — locale home page", () => {
  it("resolves the page driving each language's home", () => {
    const s = settingsFor(mlConfig());
    expect(localeHomePageId(s, mlConfig(), "en")).toBe("home");
    // No per-language override: FR home renders the global home page.
    expect(localeHomePageId(s, mlConfig(), "fr")).toBe("home");
    expect(localeHomePageId(s, mlConfig({ fr: "about" }), "fr")).toBe("about");
    expect(localeHomePageId(s, mlConfig({ fr: "" }), "fr")).toBe("home");
    expect(localeHomePageId({ homeMode: "latest-posts" }, mlConfig(), "fr")).toBeUndefined();
    expect(isLocaleHomePage(home, s, mlConfig(), "fr")).toBe(true);
    expect(isLocaleHomePage(about, s, mlConfig(), "fr")).toBe(false);
  });

  it("maps a home page's alternates to the home paths", () => {
    const ml = mlConfig({ fr: "home" });
    expect(postAlternates(home, [], ml, settingsFor(ml))).toEqual([
      { language: "en", path: "index.html" },
      { language: "fr", path: "fr/index.html" },
    ]);
    expect(postAlternates(about, [], ml, settingsFor(ml))).toEqual([
      { language: "en", path: "about.html" },
      { language: "fr", path: "fr/a-propos.html" },
    ]);
    // Without settings (legacy callers): unchanged.
    expect(postAlternates(home, [], ml)).toEqual([
      { language: "en", path: "home.html" },
      { language: "fr", path: "fr/accueil.html" },
    ]);
  });

  it("sitemap extras list the FR home as /fr/, never /fr/<slug>.html", async () => {
    const { urlsExtra } = (await import(/* @vite-ignore */ SITEMAP_MODULE)) as { urlsExtra: UrlsExtra };
    const ml = mlConfig({ fr: "home" });
    const extras = urlsExtra([], {
      posts: [],
      pages: [home, about],
      terms: [] as Term[],
      settings: settingsFor(ml),
      year: 2026,
    });
    expect(extras.map((e) => e.path)).toEqual(["fr/index.html", "fr/a-propos.html"]);
    expect(extras[0].extraInnerXml).toContain('hreflang="fr" href="https://example.com/fr/"');
    expect(extras[0].extraInnerXml).toContain('hreflang="en" href="https://example.com/"');
    expect(extras[0].extraInnerXml).not.toContain("accueil");
  });

  it("does not publish the locale home page as a standalone <lang>/<slug>.html", async () => {
    const ml = mlConfig({ fr: "home" });
    const ctx = {
      settings: settingsFor(ml),
      posts: [],
      pages: [home, about],
      terms: [],
    } as unknown as PublishContext;
    expect(await computeAdditional([], home, ctx)).toEqual([]);
    expect(updatePost).toHaveBeenLastCalledWith("home", { lastPublishedPathsByLocale: {} });
    const aboutOut = await computeAdditional([], about, ctx);
    expect(aboutOut.map((r) => r.path)).toEqual(["fr/a-propos.html"]);
  });

  it("still publishes the translation when the home is a latest-posts listing", async () => {
    const ml = mlConfig();
    const ctx = {
      settings: settingsFor(ml, { homeMode: "latest-posts" }),
      posts: [],
      pages: [home],
      terms: [],
    } as unknown as PublishContext;
    expect((await computeAdditional([], home, ctx)).map((r) => r.path)).toEqual(["fr/accueil.html"]);
  });
});
