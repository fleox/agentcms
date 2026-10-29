# Site configuration: settings, menus, terms, plugins, themes, users

Each command below is `npx -y @agent-cms/agentcms@0.3.12 <command> … --site <alias> --json`. Results carry `next`: the regeneration that makes the change visible.

## What to regenerate after a change

| You changed | Run |
|---|---|
| Content via `content` | nothing (publishing does it) |
| Menus (`menus set/add/remove/move`) | nothing (`data/menu.json` is published at once) |
| Theme colors / fonts / custom CSS (`themes config`) | nothing (CSS re-uploaded); browsers may need a hard refresh |
| Theme logo (`themes logo`) | nothing (logo + `data/menu.json`) |
| Theme layout options (home layout, header, single…) | `regenerate all` (`home` when only the home layout changed) |
| Site title / description / posts per page | `regenerate all` (`regenerate agentcms-rss` too when feeds are on) |
| Site language / base URL / indexing | `regenerate everything` (pages + robots.txt, sitemaps, feeds, search) |
| Home mode or home page | `regenerate repair` then `regenerate all` |
| Category / tag names, slugs, descriptions, SEO | `regenerate everything` (`repair` first if a category slug changed) |
| Plugin enabled / disabled | `regenerate everything` |
| Plugin config (head / body output: custom code, search, favicon, multilang…) | `regenerate all`, plus the plugin's own target (`regenerate <plugin-id>`) |
| Theme switch (`themes activate --yes`) | nothing (it regenerates everything itself); `media regenerate --yes` + `regenerate all` if media were uploaded under another theme |
| Content imported (`transfer import`, `agentcms-import run`) | `regenerate everything` |

Regeneration commands:
- `regenerate home` / `all` / `repair` / `assets` / `everything`;
- `regenerate targets` lists the plugin targets, and `regenerate <target-id>` runs one: `agentcms-sitemaps`, `agentcms-rss`, `agentcms-search`, `agentcms-archives`, `agentcms-favicon`, `storefront/catalog`.

## Settings (`settings`)

- `settings get [site|editor|performance|target|all]`
- `settings set` with any of:
  - `--title`, `--description`, `--language <bcp47>`, `--base-url <https://…>`, `--posts-per-page <n>`;
  - `--home-mode latest-posts|static-page` with `--home-page <page>`;
  - `--discourage-indexing true|false` (noindex + robots.txt);
  - editor typography (`--editor-font`, `--editor-body-size`… — admin only);
  - `--pagination-mode global|paginated` (Firebase only, for very large sites; needs composite indexes);
  - `--data @settings.json` for several at once.
- `settings target show` shows the publish target (secrets hidden). `settings target test` is the admin's "Test connection".
- The **base URL** must be the public address of the site (`site list` → `publicUrl`, the hosting's site URL). Canonical links, sitemaps, RSS and sub-folder links depend on it. The admin can be reached at another address (e.g. an S3 bucket's HTTPS endpoint): that is `siteUrl` / `adminUrl` in the registry.

## Menus (`menus`)

- `menus get` shows each item with what it points to and its link, and flags broken targets (missing, draft, tag).
- `menus set --data '{ "header": [...], "footer": [...] }'`. A menu left out is kept. Items:
  - `{ "label": "Home", "home": true }`
  - `{ "label": "News", "category": "news" }` — slug, name or id
  - `{ "label": "About", "post": "about" }` — post or page id or slug
  - `{ "label": "GitHub", "url": "https://github.com/…" }`
  - optional `"children": [ … ]` and `"translations": { "fr": { "label": "…" } }`.

  `menus get` output can be edited and passed back as is.
- One item at a time:
  - `menus add --menu header --label "…" --post <ref>|--category <ref>|--url <url>|--home [--position n]` (positions start at 1);
  - `menus remove <id|label|position> --menu …`;
  - `menus move <id|label|position> --position n --menu …`;
  - `menus update <id|label|position> --menu … [--label "…"] [--lang <code> --label "…"] [--post <ref>|--category <ref>|--url <url>|--home]` edits one item in place. With `--lang`, `--label ""` removes the translated label. Address nested items by id.

## Categories and tags (`terms`)

- **list / get:** `terms list [--type category|tag]`, `terms get <ref>` (shows the posts using it).
- **create:** `terms create --type category --name "…" [--slug] [--description] [--parent <category>] [--seo-title] [--seo-description] [--seo-image]`.
- **update:**
  - `terms update <ref> …` changes the same fields; `--lang <code>` (+ `--name/--slug/--description/--seo-*`) edits a multilang translation, and `--remove` drops it.
  - Renaming a category's slug moves its archive and its posts' URLs: run `regenerate repair`, then `regenerate everything` (`all` doesn't rebuild sitemaps, feeds or the search index).
  - Add `--remove-archive` to the same `--slug` call to delete the old `<old-slug>/index.html`. Afterwards: `terms update <new-slug> --type category --remove-archive --old-slug <old-slug>`.
  - Menu items keep their own label. After a rename, `next` lists the items whose label no longer matches, with the `menus update … --label` command. Ask before changing a label the user may have chosen.
- **delete:** `terms delete <ref>` prints the plan: the posts using it, its archive page and the menu items pointing to it (`menuItems`). Then `--yes`, optionally with:
  - `--move-to <category>`: its posts go to that category. The online ones are republished in one go and the listings and plugin files are rebuilt, so nothing is left to regenerate. The plan lists what moves; a URL conflict blocks it (`slug-taken`). Categories only, not with `--detach`.
  - `--detach`: remove it from those posts;
  - `--remove-archive`: delete its published archive page.

  Fix or remove its menu items (`menus update … --category <other>` / `menus remove`), and run the `next` regenerations.

## Links that don't follow moves

Links typed into theme or plugin settings (promo links, call-to-action URLs…) and menu items with a URL keep pointing to a page that moved or went offline. After a slug or category change, `content unpublish` / `delete`, `terms update --slug`, `terms delete` and `regenerate repair`, read `warnings` (and `result.staleLinks`). Each one names the setting or menu item, the new URL when known, and the command that fixes it. Run it once the user agrees.

## Plugins (`plugins`)

- `plugins list` shows every plugin with enabled / loaded / settings and its actions.
  - Must-use plugins are always on: favicon, blocks, custom code, embeds, metrics, import.
  - Install new plugins from a ZIP with `ext install` (see `agentcms-extensions`).
- `plugins enable <id>` / `plugins disable <id>`, then `regenerate everything`.
- Some plugins need the theme's help. The search only opens from a `[data-cms-search]` button of the theme: `plugins enable agentcms-search` warns when the theme has none and gives a custom-code snippet to add one.
- **Configuration:**
  - `plugins config <id> --schema` lists every setting (`settings[]`: `path`, `type`, `default`, and when the plugin documents it `description`, accepted `values`, `min` / `max`, `format`). Read it before changing a setting you don't know. A value outside `values` / `min`–`max` is refused (`invalid-value`, nothing saved).
  - `--get` (the default) prints the current config.
  - **Use `--merge '{…}'` for any change**: it changes only the keys you give. `--set '{…}'` resets the whole config to its defaults, then applies your object — every other setting the user made is lost (only what the extension manages itself — timestamps, logo flags — is kept); use it only to start over. Both accept `@file.json`. Unknown keys are kept but reported in `warnings`: fix typos (check the real names with `--schema` first).
  - Each runs the settings page's side effects.
- `plugins action <id> <action>` runs a settings-page button.

| Plugin | Config keys | Actions |
|---|---|---|
| `agentcms-sitemaps` | `newsEnabled`, `newsWindowDays`, `contentTypes` (`posts`/`posts-pages`), `robotsTxt` | `robots [--default-robots]`, `stylesheets`, `regenerate` |
| `agentcms-rss` | `site{enabled,itemCount,excludedTermIds[],addToFooter}`, `categoryFeeds[{termId,itemCount,addToFooter}]` (category slugs accepted) | `stylesheet`, `regenerate` |
| `agentcms-search` | `indexExcerpt`, `indexCategory`, `indexTags`, `includePages`, `excludedTermIds`, `minQueryLength`, `maxResults` | `regenerate` |
| `agentcms-archives` | `drillDown` (`year`/`month`/`week`), `includePages`, `addArchivesLinkToHome`, `addArchivesLinkToCategory`, `showCounts` | `regenerate` |
| `agentcms-favicon` | `pwaName`, `pwaShortName`, `pwaThemeColor`, `pwaBackgroundColor`, `pwaDisplay` | `set <image.png> [--pwa {…}]`, `remove`, `manifest [--pwa {…}]` |
| `agentcms-custom-code` | `head`, `bodyEnd` (HTML injected in every page) | — |
| `agentcms-import` | `options{statusMode,defaultCategory,moveProcessedFiles,imageFetchConcurrency}` | `scan <folder\|wordpress.xml>`, `run <same> [--status draft\|online\|from-source] [--category] --yes`, `init`, `list` (folder `_cms-import/` on the hosting, `--from-hosting`) |
| `agentcms-multilang` | `primaryLanguage`, `enabledLanguages[]`, `homePages{lang:pageId}`, `showHeaderSwitcher`, `showFooterSwitcher` | — |
| `core-seo` | — (Twitter cards, generator meta) | — |

**Import folders.** The importer takes `.md` files with YAML front matter: `title` (required), `type` (`post`/`page`), `status` (`draft`/`online`), `slug`, `excerpt`, `seoTitle`, `seoDescription`, `heroImage` (a relative image path), `category`, `parentCategory`, `tags` (list), `author` (email or name), `publishedAt`. Images sit next to the `.md` files; `<name>.<lang>.md` files are translations. It also takes a WordPress export `.xml`. `scan` reports what will be created, which slugs get fixed, and warnings.

## Themes (`themes`)

- `themes list` shows the bundled and installed themes and which is active.
- `themes activate <id>` prints the plan. `--yes` switches theme and regenerates the whole site (several minutes on big sites).
- Each theme has its own image formats. Media uploaded under another theme lack them, and pages fall back to another size (wrong crop, empty bands). After a switch, run `media regenerate` (plan), then `media regenerate --yes` and `regenerate all`.
- **Configuration:** `themes config <id> --schema`, `--get`, `--merge '{…}'` or `--set`. Typical keys:
  - `style{vars{…},fontSerif,fontSans}`: colors and fonts. The CSS is recompiled and uploaded at once, and `next` stays empty.
    - `--schema` lists every setting (`settings[]` with `description`, accepted `values`, `format` when the theme documents them; a value outside `values` is refused with `invalid-value`) and `cssVariables`, the theme's custom properties with their current default values.
    - Give colors in hex: `{"style":{"vars":{"--color-secondary":"#b00020"}}}`.
    - On magazine the accent color (links, labels) is `--color-secondary`. Other themes name it differently: check `--schema`.
  - `home{…}`, `single{…}`, `header{…}`, `footer{…}`: layout. Run `regenerate all`.
    - Magazine home: `home.sidebarTop` / `home.sidebarBottom` are `most-read`, `promo` or `none`, with `home.mostReadCount` (1–10).
    - A promo shows `promoImageUrl` (+ `promoImageAlt`), `promoEyebrow`, `promoTitle` and its link `promoHref`. It stays hidden while both the image and the title are empty.
      - Use root paths for links and images on the same site (`/recipes/x.html`, `/media/…/large.webp`), not absolute URLs: they survive a change of domain.
      - The promo link doesn't follow content moves: re-check it after changing a slug or category (the CLI warns when a stored link points to a moved page).
    - Home texts: `home.featuredLabel` (badge on the top story), `home.latestHeading` (latest-posts list, default "Latest Intelligence"), `home.mostReadHeading` (the "Most read" widget, which lists the latest posts). Empty = the theme's text in the site language; set them when the defaults don't fit the site (e.g. a travel blog). They apply to every language of a multilingual site. Run `regenerate home`. Don't repeat the badge text in `promoEyebrow`.
  - storefront `catalog{…}`: run `regenerate storefront/catalog`.
- `themes logo <id> logo.png` or `themes logo <id> --remove` (the site title is shown instead). The logo is fitted into 480×144.
- Themes may hard-code links: corporate and portfolio's header button always goes to `/contact.html`, in every language. Create a `contact` page, or tell the user.
- `themes sync-assets` re-uploads every theme's CSS/JS.

The admin only shows the active theme's settings. The CLI can prepare an inactive theme's config too, with a warning.

## Users and authors (`users`)

- `users list` / `users get <id|email|me>`. On a new site, `users get me` returns `hasRecord: false` until the first `users update me`.
- **Public author profile:** `users update me --first-name … --last-name … --title … --bio @bio.md --avatar <media id> --social "github=https://github.com/… website=https://…"`. `--social` can be repeated; `network=` removes one; append `,hidden` to keep one off the public page. This republishes the author page and `data/authors.json`; after a name change, run the `regenerate all` given in `next` so bylines and author links on other pages follow. Set the name before writing content when you can.
- **Firebase sites:** `users role <user> admin|editor`, `users disable|enable <user>`, `users delete <user> --yes` (removes the record only; the login is deleted in the Firebase console). `users role` refuses to demote the last active admin, and demoting the account the CLI signs in with needs `--force`. New editors need an **invitation**: `users invite <email> --role editor|admin`, `users invites` (pending / joined), `users uninvite <email>`. They then sign in with any method the site offers (password accounts are also created in Firebase console → Authentication → Add user, and verify their email at first sign-in). Their record, with the invited role, appears at first sign-in. `rules-outdated`: the site's Firestore rules predate invitations - see the agentcms-manage skill.
- **Git sites:** the repository permission decides the real role.
- **SQLite-file sites** have no accounts. There is one profile, `admin` (`users update me`), the author of every post. Its public name is the first + last name (`publicName` in `users get me`); the `displayName` "Admin" is never shown when a name is set.
- `users locale <en|fr|de|es|nl|pt|ko>` sets the admin language of the signed-in user.

## Export / import (`transfer`)

- `transfer export --out site.json` writes all content and settings as JSON, on every backend. It has no secrets and no media files; media records point to the hosted files.
- `transfer import site.json --mode merge|replace [--keep-target]` prints the plan; add `--yes` to apply. Markdown-in-git and SQLite-file sites only. The file also carries the installed plugins / themes list (`config/externalRegistry`): check `plugins list` and `themes list` before `regenerate everything`, since regenerating renders every page with what is listed there.

## Files on the hosting (`files`)

Paths are relative to the site's folder (with an S3 `prefix`, inside it).
- `files list [prefix]` lists them.
- `files put <local file> [site path]` uploads one, e.g. a search-engine verification file.
- `files delete <path…>` prints the plan; add `--yes` to delete, e.g. an old page nothing regenerates any more.

The CMS's own files (admin, theme assets, `data/*.json`, the database) are protected. Pages, feeds and sitemaps are rewritten by the next regeneration, so change them through their commands.

## Dashboard (`stats`)

`stats` gives posts and pages (total / online / draft), categories, tags, media and users.
