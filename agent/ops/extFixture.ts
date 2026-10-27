import type { StoredDoc } from "../../src/services/docstore/types";

// Demo content used by `ext preview` / `ext check` when no site is
// given: enough variety to exercise every template (home, single post,
// page, category and tag archives, author archive, 404) and the usual
// Markdown constructs (headings, lists, quote, code, table, image,
// raw HTML). Dates are fixed so previews are reproducible.

const DAY = 86_400_000;
const T0 = Date.UTC(2026, 0, 15, 9, 0, 0);

export const FIXTURE_AUTHOR_ID = "author-ada";

export interface FixtureMediaSpec {
  id: string;
  slug: string;
  alt: string;
  caption?: string;
  // Hue of the placeholder image.
  hue: number;
  // Source image size (aspect ratio of every "contain" variant).
  width: number;
  height: number;
}

export const FIXTURE_MEDIA: FixtureMediaSpec[] = [
  // Mixed aspect ratios on purpose: landscape, portrait, panorama, square.
  { id: "media-harbor", slug: "harbor", alt: "Boats in a harbor at sunrise", caption: "Morning in the harbor.", hue: 205, width: 3000, height: 2000 },
  { id: "media-forest", slug: "forest", alt: "A path through a pine forest", hue: 130, width: 2000, height: 3000 },
  { id: "media-city", slug: "city", alt: "City skyline at night", caption: "The city after dark.", hue: 265, width: 4200, height: 1400 },
  { id: "media-desk", slug: "desk", alt: "A desk with a notebook and a laptop", hue: 30, width: 2400, height: 2400 },
  { id: "media-avatar", slug: "ada", alt: "Portrait of Ada Writer", hue: 340, width: 800, height: 800 },
];

const LONG_BODY = `Static sites are fast, cheap to host and hard to break. This article walks through the ideas behind a CMS that publishes **plain HTML** and nothing else.

## Why static

A page that is already rendered needs no database, no server-side runtime and no cache warm-up. It is just a file.

- Faster first byte
- Nothing to patch on the server
- Any host works: GitHub Pages, an S3 bucket, a USB stick

### A numbered list

1. Write in the editor
2. Click **Publish**
3. The admin renders the page *in your browser* and uploads it

> "The best server is the one you don't run."
> — Someone who was paged at 3 a.m.

![Boats in a harbor at sunrise](MEDIA:media-harbor:large)

## Some code

Inline \`code\` and a fenced block:

\`\`\`ts
export function greet(name: string): string {
  return \`Hello, \${name}!\`;
}
\`\`\`

## A table

| Host | Price | Custom domain |
| --- | --- | --- |
| GitHub Pages | Free | Yes |
| S3 + CDN | Pay as you go | Yes |

Read more on [the project page](https://github.com/fleox/agentcms) or go back to the [about page](/about.html).

---

That's all for now.`;

function post(
  id: string,
  title: string,
  slug: string,
  day: number,
  body: string,
  extra: Partial<StoredDoc> = {},
): StoredDoc {
  return {
    id,
    type: "post",
    title,
    slug,
    contentMarkdown: body,
    authorId: FIXTURE_AUTHOR_ID,
    termIds: [],
    status: "online",
    createdAt: T0 + day * DAY,
    updatedAt: T0 + day * DAY + 3_600_000,
    publishedAt: T0 + day * DAY,
    ...extra,
  };
}

export function fixtureDocs(): {
  posts: StoredDoc[];
  terms: StoredDoc[];
  users: StoredDoc[];
} {
  const terms: StoredDoc[] = [
    { id: "cat-guides", type: "category", name: "Guides", slug: "guides", description: "Step-by-step guides.", createdAt: T0 },
    { id: "cat-news", type: "category", name: "News", slug: "news", description: "What changed recently.", createdAt: T0 },
    { id: "tag-static", type: "tag", name: "Static sites", slug: "static-sites", createdAt: T0 },
    { id: "tag-hosting", type: "tag", name: "Hosting", slug: "hosting", createdAt: T0 },
    { id: "tag-design", type: "tag", name: "Design", slug: "design", createdAt: T0 },
  ];
  const posts: StoredDoc[] = [
    post("post-why-static", "Why a static CMS?", "why-a-static-cms", 9, LONG_BODY, {
      excerpt: "Plain HTML, any host, nothing to patch: the case for publishing static files.",
      heroMediaId: "media-harbor",
      termIds: ["cat-guides", "tag-static", "tag-hosting"],
      primaryTermId: "cat-guides",
      seo: { title: "Why a static CMS? A practical answer", description: "The case for publishing plain HTML." },
    }),
    post("post-hosting", "Choosing where to host", "choosing-where-to-host", 7, "Every host that serves files works.\n\n## GitHub Pages\n\nFree, with a custom domain.\n\n## S3-compatible buckets\n\nCheap and fast behind a CDN.", {
      heroMediaId: "media-city",
      termIds: ["cat-guides", "tag-hosting"],
      primaryTermId: "cat-guides",
    }),
    post("post-release", "Version 2 is out", "version-2-is-out", 5, "A short news item with **bold** text and a [link](https://example.com).", {
      heroMediaId: "media-forest",
      termIds: ["cat-news", "tag-static"],
      primaryTermId: "cat-news",
      excerpt: "What's new in this release.",
    }),
    post("post-design", "Designing a readable article page", "designing-a-readable-article-page", 3, "Line length, contrast and rhythm matter more than fonts.\n\n- Keep lines under 75 characters\n- Use real headings\n\n<div class=\"note\"><p>Raw HTML in Markdown is kept (and sanitised).</p></div>", {
      heroMediaId: "media-desk",
      termIds: ["cat-news", "tag-design"],
      primaryTermId: "cat-news",
    }),
    post("post-no-image", "A post without an image or category", "a-post-without-an-image", 1, "Themes must handle posts with no hero image, no category and no excerpt."),
    {
      ...post("post-draft", "An unpublished draft", "an-unpublished-draft", 0, "Drafts are never rendered."),
      status: "draft",
      termIds: ["cat-news"],
      primaryTermId: "cat-news",
    },
    {
      ...post("page-about", "About", "about", 0, "This site is a preview generated by **agentcms ext preview**.\n\n## Contact\n\nWrite to hello@example.com."),
      type: "page",
    },
  ];
  const users: StoredDoc[] = [
    {
      id: FIXTURE_AUTHOR_ID,
      email: "ada@example.com",
      firstName: "Ada",
      lastName: "Writer",
      title: "Editor",
      bio: "Writes about the web, static sites and typography.",
      avatarMediaId: "media-avatar",
      socials: { github: { url: "https://github.com/fleox/agentcms", visible: true } },
      role: "admin",
      disabled: false,
      createdAt: T0,
    },
  ];
  return { posts, terms, users };
}

export const FIXTURE_MENUS = {
  header: [
    { id: "m-home", label: "Home", ref: { kind: "home" } },
    { id: "m-guides", label: "Guides", ref: { kind: "term", id: "cat-guides" } },
    { id: "m-news", label: "News", ref: { kind: "term", id: "cat-news" } },
    { id: "m-about", label: "About", ref: { kind: "post", id: "page-about" } },
  ],
  footer: [
    { id: "f-about", label: "About", ref: { kind: "post", id: "page-about" } },
    { id: "f-src", label: "Source", externalUrl: "https://github.com/fleox/agentcms" },
  ],
};

// A photo-like placeholder (sky gradient, sun, two hill layers) with its
// name and size in a corner — stands in for the WebP variants the
// admin's image pipeline would generate, so layouts can be judged.
export function placeholderSvg(width: number, height: number, hue: number, label: string): string {
  const w = Math.max(1, Math.round(width));
  const h = Math.max(1, Math.round(height));
  const font = Math.max(9, Math.round(Math.min(w, h) / 22));
  const r = Math.round(Math.min(w, h) * 0.09);
  const id = `g${hue}${w}x${h}`;
  return (
    `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">` +
    `<defs><linearGradient id="${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="hsl(${hue} 55% 72%)"/><stop offset="1" stop-color="hsl(${(hue + 30) % 360} 45% 38%)"/></linearGradient></defs>` +
    `<rect width="${w}" height="${h}" fill="url(#${id})"/>` +
    `<circle cx="${Math.round(w * 0.72)}" cy="${Math.round(h * 0.3)}" r="${r}" fill="hsl(${(hue + 180) % 360} 80% 88%)" opacity=".85"/>` +
    `<path d="M0 ${Math.round(h * 0.68)} Q ${Math.round(w * 0.25)} ${Math.round(h * 0.5)} ${Math.round(w * 0.5)} ${Math.round(h * 0.66)} T ${w} ${Math.round(h * 0.6)} V ${h} H 0 Z" fill="hsl(${hue} 30% 30%)" opacity=".8"/>` +
    `<path d="M0 ${Math.round(h * 0.82)} Q ${Math.round(w * 0.35)} ${Math.round(h * 0.7)} ${Math.round(w * 0.7)} ${Math.round(h * 0.84)} T ${w} ${Math.round(h * 0.78)} V ${h} H 0 Z" fill="hsl(${hue} 30% 18%)"/>` +
    `<text x="${Math.round(font * 0.8)}" y="${h - Math.round(font * 0.8)}" fill="#fff" fill-opacity=".85" font-family="sans-serif" font-size="${font}">${label} ${w}×${h}</text></svg>`
  );
}
