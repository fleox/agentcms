// Minimal Theme — AgentCMS external theme example: the six required
// templates (base, home, single, category, author, notFound), a small
// hand-written stylesheet and a runtime menu loader.
//
// Build: `npm run build` → dist/bundle.js + minimal-theme.zip (install
// it from the admin: Themes → Install theme).

import type { ThemeManifest } from "@agent-cms/runtime";
// ?raw: the file content as a string. The published CSS is cssText,
// uploaded to theme-assets/minimal-theme.css by "Sync theme assets".
import cssText from "./theme.css?raw";
import menuLoader from "./runtime/menu-loader.js?raw";
import readme from "../README.md?raw";
import { BaseLayout } from "./templates/BaseLayout";
import { HomeTemplate } from "./templates/HomeTemplate";
import { SingleTemplate } from "./templates/SingleTemplate";
import { CategoryTemplate } from "./templates/CategoryTemplate";
import { AuthorTemplate } from "./templates/AuthorTemplate";
import { NotFoundTemplate } from "./templates/NotFoundTemplate";

const manifest: ThemeManifest & { readme?: string } = {
  id: "minimal-theme",
  name: "Minimal Theme",
  version: "1.1.0",
  description: "Minimal external theme — single column, system fonts.",
  readme,
  scssEntry: "theme.css",
  cssText,
  // Uploaded as theme-assets/minimal-theme-menu.js; BaseLayout loads it.
  jsText: menuLoader,
  templates: {
    base: BaseLayout,
    home: HomeTemplate,
    single: SingleTemplate,
    category: CategoryTemplate,
    author: AuthorTemplate,
    notFound: NotFoundTemplate,
  },
};

export default manifest;
