// End-to-end check that agentcms-blocks renders on every bundled theme:
// markdown → renderMarkdown → post.html.body (blocks + theme filters) →
// renderPageToHtml with the theme's own BaseLayout + SingleTemplate.
// Node environment with a happy-dom window handed to DOMPurify only —
// the same setup as the agentcms CLI (no global DOMParser / document).
// Boot order like main.tsx: the runtime first (themes import it through
// @agent-cms/runtime and the theme registry has an import cycle).
import "../../core/cmsRuntime";
import { Window } from "happy-dom";
import { beforeAll, beforeEach, describe, expect, it } from "vitest";
import { pluginApi, applyFilters, resetRegistry } from "../../core/pluginRegistry";
import { renderMarkdown, setSanitizerWindow } from "../../core/markdown";
import { renderPageToHtml } from "../../core/render";
import type { Post, SiteSettings } from "../../core/types";
import type { ThemeManifest } from "../../themes/types";
import { manifest as blocksManifest } from "./manifest";
import { manifest as defaultTheme } from "../../themes/default/manifest";
import { manifest as magazineTheme } from "../../themes/magazine/manifest";
import { manifest as corporateTheme } from "../../themes/corporate/manifest";
import { manifest as portfolioTheme } from "../../themes/portfolio/manifest";
import { manifest as storefrontTheme } from "../../themes/storefront/manifest";

// The external example themes are type-checked by their own projects
// (against types/agentcms-runtime.d.ts), so they're imported through a
// non-literal specifier to keep them out of the admin's tsc program.
const EXTERNAL = "../../../external/themes";
const minimalTheme = (await import(/* @vite-ignore */ `${EXTERNAL}/minimal-theme/src/manifest`)).default;
const marketplaceTheme = (await import(/* @vite-ignore */ `${EXTERNAL}/marketplace-core/src/manifest`)).default;

const b64 = (code: string) => Buffer.from(JSON.stringify({ code }), "utf-8").toString("base64");

// What the Tiptap editor serialises for a 2-column block holding a
// Custom HTML block (tiptap-markdown with html: true).
const MARKDOWN =
  "Intro paragraph.\n\n" +
  '<div data-cols="2" data-cms-block="agentcms-blocks/columns">' +
  '<div data-cms-column=""><p>Left column</p></div>' +
  `<div data-cms-column=""><div data-cms-block="agentcms-blocks/html" data-attrs="${b64('<span class="custom">raw</span>')}"></div></div>` +
  "</div>\n\nOutro paragraph.";

const THEMES: Array<[string, ThemeManifest]> = [
  ["default", defaultTheme as unknown as ThemeManifest],
  ["magazine", magazineTheme as unknown as ThemeManifest],
  ["corporate", corporateTheme as unknown as ThemeManifest],
  ["portfolio", portfolioTheme as unknown as ThemeManifest],
  ["storefront", storefrontTheme as unknown as ThemeManifest],
  ["minimal-theme", minimalTheme as unknown as ThemeManifest],
  ["marketplace-core", marketplaceTheme as unknown as ThemeManifest],
];

function makePost(type: "post" | "page"): Post {
  const ts = { toMillis: () => 1_700_000_000_000, toDate: () => new Date(1_700_000_000_000) };
  return {
    id: "p1",
    type,
    title: "Hello",
    slug: "hello",
    contentMarkdown: MARKDOWN,
    excerpt: "",
    status: "online",
    authorId: "u1",
    termIds: [],
    createdAt: ts,
    updatedAt: ts,
    publishedAt: ts,
  } as unknown as Post;
}

async function render(theme: ThemeManifest, post: Post): Promise<string> {
  const settings = {
    title: "Site",
    description: "",
    language: "en",
    baseUrl: "https://example.com",
    activeThemeId: theme.id,
    enabledPlugins: {},
    pluginConfigs: {},
    themeConfigs: {},
  } as unknown as SiteSettings;
  const site = {
    settings,
    resolvedMenus: { header: [], footer: [] },
    themeCssPath: `theme-assets/${theme.id}.css`,
    themeConfig: (theme as { settings?: { defaultConfig?: unknown } }).settings?.defaultConfig,
  };
  let bodyHtml = renderMarkdown(post.contentMarkdown);
  bodyHtml = await applyFilters<string>("post.html.body", bodyHtml, post);
  return renderPageToHtml({
    base: theme.templates.base,
    baseProps: { site, pageTitle: post.title, currentPath: "hello.html" },
    template: theme.templates.single,
    templateProps: { site, post, bodyHtml, tags: [] } as never,
  });
}

beforeAll(() => {
  setSanitizerWindow(new Window({ url: "http://localhost/" }));
});

describe.each(THEMES)("agentcms-blocks on the %s theme", (_id, theme) => {
  beforeEach(() => {
    resetRegistry();
    blocksManifest.register(pluginApi);
    theme.register?.(pluginApi, { settings: {} as SiteSettings } as never);
  });

  it.each(["post", "page"] as const)("%s: columns + html blocks are rendered and styled", async (type) => {
    const html = await render(theme, makePost(type));
    expect(html).not.toContain("data-cms-block");
    expect(html).not.toMatch(/data-cms-column[\s=>]/);
    expect(html).toContain('<div class="cms-columns cms-columns-cols-2">');
    expect(html.match(/<div class="cms-column">/g)).toHaveLength(2);
    expect(html).toContain('<span class="custom">raw</span>');
    // Baseline CSS injected once, inside <head>.
    expect(html.match(/<style data-cms-columns-styles>/g)).toHaveLength(1);
    expect(html.indexOf("data-cms-columns-styles")).toBeLessThan(html.indexOf("</head>"));
    // Sentinels replaced.
    expect(html).not.toContain("x-cms-head-extra");
    expect(html).not.toContain("x-cms-body-end");
  });

  it("a page without columns rendered next gets no columns CSS", async () => {
    await render(theme, makePost("post"));
    const plain = { ...makePost("post"), contentMarkdown: "Just text." } as Post;
    const html = await render(theme, plain);
    expect(html).not.toContain("data-cms-columns-styles");
  });
});
