# Content: posts, pages, Markdown, blocks, media

## Posts and pages

- **Posts** have a category (one) and tags (several). They are published at `<category-slug>/<slug>.html`, or `<slug>.html` without a category, and listed on the home page, their category archive and their author's page.
- **Pages** (`--type page`) have neither. They are published at `<slug>.html` and can be the static home page (`settings set --home-mode static-page --home-page <page>`).

| Field | Flag | Notes |
|---|---|---|
| title | `--title` | Required on create |
| slug | `--slug` | Lower-case ASCII, digits, dashes (accented letters lose their accent). Default: from the title, made unique. An invalid or taken slug fails with `invalid-slug` / `slug-taken`. Changing the slug of an online entry moves its URL; the old file is deleted when it is republished. |
| body | `--body @file.md` (or text, or `-` for stdin) | Markdown, see below |
| excerpt | `--excerpt` | Shown on listings, and used in feeds and as the meta description fallback. `""` clears it. |
| category | `--category <slug\|name\|id>` | Posts only. `""` removes it. Missing → `--create-terms` |
| tags | `--tags a,b` | Tag **names** as readers see them, with accents (`--tags "Grèce,États-Unis"`, not slugs). Replaces the tags. Missing ones are created with `--create-terms`, the given text becoming their name. |
| featured image | `--hero <media id>` | From `media upload` / `media list`. `""` removes it. |
| author | `--author <user id\|email>` | Default on create: the signed-in user |
| SEO | `--seo-title`, `--seo-description`, `--seo-image <url>` | `<title>`, meta description, og:image. Themes append " — <site title>" to `<title>` (unless the SEO title already contains it): don't add the brand yourself. |
| dates | `--created-at`, `--published-at` (ISO 8601) | Listings are ordered by creation date. The publication date is set by the first publish (now, or `--published-at`) and kept by later republishes and regenerations. |
| all at once | `--data @entry.json` | `{ title, slug, body, excerpt, category, tags[], hero, author, seo{…}, createdAt, publishedAt }`. Flags override it. |

### Lifecycle

| Command | What happens on the public site |
|---|---|
| `content create …` | Nothing: creates a draft. Add `--publish` to publish it at once. |
| `content publish <ref…>` | Page rendered and uploaded; home, archives, menus JSON, sitemaps, feeds and search refreshed. Several refs use bulk mode: one refresh at the end. |
| `content update <ref> …` | Draft: data only. Online: republished, like the admin's Save; `--no-publish` skips that. |
| `content unpublish <ref…>` | Page files deleted; listings refreshed; back to draft. |
| `content delete <ref…> --yes` | Unpublished, then deleted; `removedPaths` lists the files taken off the site. Without `--yes` only the plan is shown, with the menu items that point to the entry (`menuItems`). |
| `content preview <ref> [--title/--body …] [--out file.html] [--screenshots]` | Nothing published: writes the page as it would look (unsaved changes included) to an HTML file (default: the system temp folder), plus PNGs in `.screenshots/` next to it (absolute paths in `result.screenshots`). Styles and images load from the live site; menus and other runtime widgets can stay empty in a preview. Check the published page with `site screenshot <path>`. |

`<ref>` is an id, a slug, or a published path (`news/my-post`). Add `--type page` when a post and a page share a slug.

`content list [--type] [--status draft|online] [--search …] [--category …]` and `content get <ref>`: `get` returns the Markdown body and the translations.

## Markdown

Standard Markdown, GitHub flavour:
- headings `##` / `###`. Don't repeat the title as a `#` heading in the body: most themes render it (check with `content preview`; a few page layouts, e.g. portfolio pages, show no title, so start those with your own heading if the page needs one);
- **bold**, *italic*, lists, `> quotes`, code fences, tables, links, `---`.

**Images in the body:** `![alt text](<url of a variant>)`. Use the URLs from `media upload` / `media get`. The format names come from the active theme (e.g. `small`, `medium`, `large` on the default theme; `portrait`, `square`, `wide`, `hero` on portfolio).
- Read them from the result and pick a wide one; prefer `fit: "contain"` when the whole image must show.
- `url` is the default size.
- The absolute URLs are fine: published pages load the site's own images from the address the visitor uses (http or https, custom domain), so they keep working.
- Don't repeat the featured image (`--hero`) in the body: themes already show it at the top.

There is no gallery block: put several images one after the other, or in a `columns` block.

**Raw HTML** is allowed and sanitised on publish. Scripts, iframes, inline event handlers and `<style>` are removed. Use the embed and HTML blocks below for those.

**Links to other entries:** root-absolute paths, `[read this](/news/other-post.html)`. They are adapted automatically for sites hosted in a sub-folder.

## Editor blocks (rich layouts)

Blocks are stored in the Markdown as HTML markers: empty `<div>`s turned into real HTML when the page is published. The available blocks depend on the site's plugins and active theme:

```bash
npx -y @agent-cms/agentcms@0.3.11 content blocks --site <alias> --json
```

It returns, for each block, the exact `markdown` to paste in a body and its default `attrs` (decoded). To fill a block with your own values:

```bash
npx -y @agent-cms/agentcms@0.3.11 content blocks <block id> --attrs '{"headline":"…","body":"…"}' --site <alias> --json
```

This prints the marker with your attributes encoded (base64 JSON in `data-attrs`). Your attrs are merged over the block's sample values: **pass every field**, or the sample text stays. Put each marker on its own lines, with a blank line before and after. A block of an installed theme that isn't active yet works too (to prepare content before switching); it renders once that theme is active.

Always available (must-use plugins):

- **YouTube / Vimeo / X (Twitter) / Spotify.** Use `<div data-cms-embed="youtube" data-id="VIDEO_ID" data-url="https://www.youtube.com/watch?v=VIDEO_ID"></div>`. Provider ids are `youtube`, `vimeo`, `twitter`, `spotify`. `data-id` is:
  - YouTube: the 11-character video id;
  - Vimeo: the numeric id;
  - X: the status id;
  - Spotify: `track/<id>`, `album/<id>`, `playlist/<id>` or `episode/<id>`.

  Some videos can't be embedded: their owner turned embedding off, or they are age-restricted. The player then shows an error. Use videos the user picked, and check the published page.
- **Columns.** `content blocks agentcms-blocks/columns` gives the markup: a `data-cols` count, then one `<div data-cms-column>` per column holding HTML paragraphs.
- **Raw HTML block.** For trusted HTML, iframes and widgets: `content blocks agentcms-blocks/html --attrs '{"code":"<iframe …></iframe>"}'`. It is published as is, so only use code the user trusts.

Theme blocks (heroes, call-to-action banners…) exist only while their theme is active. After a theme switch they render as nothing until the original theme returns.

After writing a body with blocks, run `content preview <ref> --screenshots` to check the result.

`content blocks <id>` also prints `attrsSchema`: what each attribute does, the accepted values and formats, and the shape of list items (e.g. the `socials` of a contact block). A value outside a closed list is refused (`invalid-value`). Look at the preview after changing a block: a block can duplicate what the theme already shows (e.g. portfolio's project sidebar shows the category and the year).

## Media

- **Upload:** `media upload <file…> --alt "…" [--caption "…"]`. Use descriptive file names (`halden-museum-facade.jpg`, not `1.jpg`): the name becomes the media name and its URL.
  - Accepts JPEG, PNG, WebP and GIF (first frame).
  - The site resizes to the active theme's formats plus admin thumbnails, encodes WebP or the theme's format, and stores the record.
  - Phone photos are rotated correctly.
  - Returns `id`, the default `url`, and `formats.<name>` = `{ url, width, height, bytes, fit, adminOnly }` for every size, as in `media list`.
    - `fit: "cover"`: cropped to exactly `width`×`height` (e.g. a square). `fit: "contain"`: the whole image, proportions kept.
    - Formats with `adminOnly: true` (`admin-thumb`, `admin-preview`, `admin-original`) are the media library's own: don't use them in content.
  - `--alt` and `--caption` apply to every file of the command. For a different text per file, use `--data @media.json` with `[{"file": "fjord.jpg", "alt": "…", "caption": "…"}, …]` (paths relative to the JSON file).
  - One command = one commit on git hostings: upload all images in one command rather than one per image (each commit starts a Pages build).
- **Other commands:**
  - `media list [--search]` / `media get <id>`: `get` shows where the media is used.
  - `media update <id> --alt … --caption …`. On a multilang site add `--lang <code>` for another language's texts (see Translations).
  - `media delete <id…> --yes`. Pages that still show it keep a broken image until they are edited and republished; check `usages` first.
- **After a theme switch:** `media regenerate` (plan) then `--yes` re-crops existing media to the active theme's formats; then `regenerate all`.
- **Featured image of a post:** `content update <ref> --hero <id>`.
- **Author avatar:** `users update me --avatar <id>`.
- **Theme logo and favicon** aren't media: use `themes logo` and `plugins action agentcms-favicon set`.

## Translations (agentcms-multilang)

When the multilang plugin is enabled and languages are configured (`plugins config agentcms-multilang --get`):

- `primaryLanguage` must be the site language (`settings get site` → `language`). The main content is in that language and is published at the root.
- `enabledLanguages` lists the **other** languages (don't repeat the primary one), each published under `/<lang>/`.
- Set both together, e.g. `settings set --language en` and `plugins config agentcms-multilang --merge '{"primaryLanguage":"en","enabledLanguages":["fr"]}'`, then `regenerate everything`.
- `homePages{lang: pageId}` (optional): the page shown as `/<lang>/`. Without it, a static home page (`settings set --home-mode static-page`) is used in every language, with its translation.
- Sitemaps: one file per year listing every language, with `hreflang` alternates (no per-language sitemap files, except News sitemaps). Search uses a per-language index.
- Published paths per language are in `localePaths` (`content get` / `content publish`). Before publishing, a translation's path is `<lang>/<translated category slug>/<translated slug>.html` (`<lang>/<slug>.html` for pages).

- **Edit a translation:**
  ```bash
  content update <ref> --lang fr --title "…" --slug "…" --body @fr.md --excerpt "…" --seo-title "…"
  ```
  This edits the French version, published at `/fr/…`. An online entry is republished with all its languages.
- A post's translation is published only when its **category is translated** in that language (`terms update <category> --lang fr --name … --slug …`); `content update --lang` warns otherwise. Pages have no category.
- **Remove a translation:** `content update <ref> --lang fr --remove` (an online entry is republished, which deletes the translated page).
- Unpublishing or deleting an entry also deletes its translated pages.
- **Category names per language:** `terms update <ref> --lang fr --name "…" --slug "…"`.
- **Menu labels per language:** `translations: { "fr": { "label": "…" } }` on menu items (`menus set`).
- **Image alt text and caption per language:** `media update <id> --lang fr --alt "…" [--caption "…"]`, or `"translations": {"fr": {"alt": "…", "caption": "…"}}` per file in `media upload --data`. `--alt` / `--caption` without `--lang` are the primary language's; a language without its own text shows them. Translate the alt text of every featured image; a caption that is only a credit can stay shared. Then republish the posts that use the image (`regenerate all`). Images inside a body (`![alt](url)`) take their alt text from each translation's Markdown.
