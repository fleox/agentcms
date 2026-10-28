// Documents the settings of the favicon plugin for
// `agentcms plugins config agentcms-favicon --schema` (descriptions read by
// agents; `values` are enforced by the CLI on --set / --merge).

import type { SettingsSchema } from "../../core/types";

const MANAGED = "Managed by the plugin — don't set: use `plugins action agentcms-favicon set <image>` (or `remove`).";

export const SETTINGS_SCHEMA: SettingsSchema = {
  enabled: {
    description: `${MANAGED} True once favicons are generated; the <link> tags are then added to every page (after a regeneration).`,
  },
  uploadedAt: { description: `${MANAGED} Cache-busting ?v= value of the favicon URLs.` },
  hasIco: { description: `${MANAGED} /favicon/favicon.ico exists.` },
  hasSvg: { description: `${MANAGED} /favicon/favicon.svg exists (SVG source only).` },
  hasPng96: { description: `${MANAGED} /favicon/favicon-96x96.png exists.` },
  hasAppleTouch: { description: `${MANAGED} /favicon/apple-touch-icon.png exists.` },
  hasManifest192: { description: `${MANAGED} /favicon/web-app-manifest-192x192.png exists.` },
  hasManifest512: { description: `${MANAGED} /favicon/web-app-manifest-512x512.png exists.` },
  hasManifest: { description: `${MANAGED} /favicon/site.webmanifest exists.` },
  pwaName: {
    description:
      "App name in the PWA manifest (/favicon/site.webmanifest). Empty = the site title. Saving re-uploads the manifest when favicons exist.",
  },
  pwaShortName: {
    description: "Short app name (home-screen label) in the PWA manifest. Empty = the first 12 characters of the site title.",
  },
  pwaThemeColor: {
    description: "PWA theme color: theme_color of the manifest and the <meta name=\"theme-color\"> of every page.",
    format: "hex color",
  },
  pwaBackgroundColor: {
    description: "Splash-screen background color (background_color) of the PWA manifest.",
    format: "hex color",
  },
  pwaDisplay: {
    description: "How the site opens once installed as an app (display of the PWA manifest).",
    values: ["standalone", "browser", "fullscreen", "minimal-ui"],
  },
};
