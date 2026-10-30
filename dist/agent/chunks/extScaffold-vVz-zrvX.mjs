import { createRequire as __acmsRequire } from "node:module";
import { fileURLToPath as __acmsPath } from "node:url";
import { dirname as __acmsDirname } from "node:path";
const require2 = __acmsRequire(import.meta.url);
const __filename = __acmsPath(import.meta.url);
const __dirname = __acmsDirname(__filename);
import { mkdirSync, writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { C as CliError, c as readVersionInfo } from "../agentcms.mjs";
import { ID_PATTERN } from "./extCheck-BDOl0ucT.mjs";
import "node:util";
import "node:url";
import "node:os";
import "node:child_process";
import "node:crypto";
import "node:http";
import "node:vm";
import "./extBlocks-BM6tQ2F9.mjs";
import "./extHost-C7Tq3n8o.mjs";
import "node:module";
import "./extPackage-4xwZnrUQ.mjs";
import "./index-K8rfbNOg.mjs";
import "./_commonjsHelpers-DtUDk_0l.mjs";
import "stream";
import "events";
import "buffer";
import "util";
import "./extPreview-DxG_skCz.mjs";
import "./settingsSchema-DP7hBiko.mjs";
const PLUGIN_FEATURES = ["settings", "block", "i18n", "dashboard-card"];
const THEME_FEATURES = ["settings", "block"];
const DEV_DEPS = {
  typescript: "^6.0.3",
  vite: "^6.4.3",
  "@types/react": "^18.3.28",
  "react-i18next": "^15.2.0",
  i18next: "^23.16.8"
};
const TIPTAP = "^2.27.2";
function titleCase(id) {
  return id.split("-").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
}
function camel(id) {
  return id.replace(/-([a-z0-9])/g, (_, c) => c.toUpperCase());
}
function scaffoldExtension(opts) {
  const { kind, id, dir } = opts;
  if (!ID_PATTERN.test(id)) throw new CliError("usage", `Invalid id "${id}".`, "Lower-case letters, digits and single dashes, e.g. my-theme.", 2);
  if (["default", "core", "agentcms"].includes(id) || id.startsWith("core-") || id.startsWith("agentcms-")) {
    throw new CliError("usage", `"${id}" is reserved for built-in extensions.`, "Pick your own prefix, e.g. acme-blog.", 2);
  }
  const allowed = kind === "plugin" ? PLUGIN_FEATURES : THEME_FEATURES;
  for (const f of opts.features) {
    if (!allowed.includes(f)) throw new CliError("usage", `Unknown --with feature "${f}" for a ${kind}.`, `Available: ${allowed.join(", ")}.`, 2);
  }
  const has = (f) => opts.features.includes(f);
  const info = readVersionInfo();
  const name = opts.name ?? titleCase(id);
  const description = opts.description ?? (kind === "plugin" ? `${name} plugin for AgentCMS.` : `${name} theme for AgentCMS.`);
  const author = opts.author ?? "";
  const ctx = { id, name, description, author, api: info.apiVersion, cliVersion: info.version, has };
  const files = kind === "plugin" ? pluginFiles(ctx) : themeFiles(ctx);
  Object.assign(files, commonFiles(ctx, kind));
  const written = [];
  for (const [rel, content] of Object.entries(files).sort(([a], [b]) => a.localeCompare(b))) {
    const abs = join(dir, rel);
    mkdirSync(dirname(abs), { recursive: true });
    writeFileSync(abs, content);
    written.push(rel);
  }
  return {
    kind,
    id,
    dir,
    files: written,
    next: [
      `cd ${dir}`,
      "npm install",
      `npm run build      # vite build + pack → ${id}.zip`,
      "npm run check      # validates the package and renders a demo site",
      "npm run preview    # full demo site + screenshots (see the printed paths)"
    ]
  };
}
function commonFiles(c, kind) {
  const devDependencies = {
    "@agent-cms/agentcms": c.cliVersion,
    ...DEV_DEPS
  };
  if (c.has("block")) {
    devDependencies["@tiptap/core"] = TIPTAP;
    devDependencies["@tiptap/pm"] = TIPTAP;
  }
  const pkg = {
    name: c.id,
    private: true,
    version: "1.0.0",
    description: c.description,
    type: "module",
    scripts: {
      build: "tsc --noEmit && vite build && agentcms ext pack .",
      check: "agentcms ext check .",
      preview: "agentcms ext preview . --screenshots",
      serve: "agentcms ext preview . --serve",
      typecheck: "tsc --noEmit"
    },
    devDependencies: Object.fromEntries(Object.entries(devDependencies).sort(([a], [b]) => a.localeCompare(b)))
  };
  return {
    "package.json": JSON.stringify(pkg, null, 2) + "\n",
    "manifest.json": JSON.stringify({ id: c.id, name: c.name, version: "1.0.0", apiVersion: c.api, entry: "bundle.js", kind }, null, 2) + "\n",
    "tsconfig.json": JSON.stringify(
      {
        compilerOptions: {
          target: "ES2022",
          module: "ESNext",
          moduleResolution: "Bundler",
          lib: ["ES2022", "DOM", "DOM.Iterable"],
          jsx: "react-jsx",
          strict: true,
          noEmit: true,
          skipLibCheck: true,
          isolatedModules: true,
          resolveJsonModule: true,
          types: ["vite/client"],
          paths: { "@agent-cms/runtime": ["./node_modules/@agent-cms/agentcms/types/agentcms-runtime.d.ts"] }
        },
        include: ["src"]
      },
      null,
      2
    ) + "\n",
    "vite.config.ts": VITE_CONFIG,
    ".gitignore": "node_modules/\ndist/\n*.zip\n.preview/\n",
    // react-i18next declares an optional peer on TypeScript 5; the
    // project uses TypeScript 6 (like AgentCMS itself).
    ".npmrc": "legacy-peer-deps=true\n",
    "README.md": readme(c, kind),
    "AGENTS.md": agentsMd(c, kind),
    "CLAUDE.md": "@AGENTS.md\n"
  };
}
const VITE_CONFIG = `import { defineConfig } from "vite";

// Builds ONE ES module, dist/bundle.js, that the AgentCMS admin imports
// at runtime. The admin provides React, react-dom, react-i18next and
// @agent-cms/runtime through an import-map: they MUST stay external
// (a bundled copy of React breaks every hook with "Invalid hook call").
// Anything else you import is bundled.
export default defineConfig({
  // JSX → react/jsx-runtime calls (external, provided by the admin).
  // jsxDev: false — when NODE_ENV is set to anything but "production"
  // in the shell, Vite would emit jsxDEV calls (react/jsx-dev-runtime),
  // which the admin does not provide.
  esbuild: { jsx: "automatic", jsxDev: false },
  // Library mode doesn't replace process.env.NODE_ENV; browsers have no
  // \`process\`, so bundled libraries that read it would crash.
  define: {
    "process.env.NODE_ENV": JSON.stringify("production"),
  },
  publicDir: false,
  build: {
    lib: {
      entry: "src/manifest.tsx",
      formats: ["es"],
      fileName: () => "bundle.js",
    },
    outDir: "dist",
    emptyOutDir: true,
    minify: true,
    sourcemap: false,
    rollupOptions: {
      external: [
        "react",
        "react/jsx-runtime",
        "react-dom",
        "react-dom/client",
        "react-i18next",
        "@agent-cms/runtime",
      ],
      // The admin loads one file: keep dynamic imports inline.
      output: { inlineDynamicImports: true },
    },
  },
});
`;
function readme(c, kind) {
  return `# ${c.name}

${c.description}

An AgentCMS ${kind}. Install the ZIP from the admin: **${kind === "plugin" ? "Plugins" : "Themes"} → Install ${kind}**.

## Develop

\`\`\`bash
npm install
npm run build     # type-check, build dist/bundle.js, pack ${c.id}.zip
npm run check     # validate the package + render a demo site with it
npm run preview   # render the demo site and take screenshots
npm run serve     # serve the demo site on http://localhost:4321/
\`\`\`

Bump \`version\` in \`manifest.json\`, \`src/manifest.tsx\` and \`package.json\` for each release: installing a newer ZIP upgrades the ${kind} in place.
`;
}
function agentsMd(c, kind) {
  return `# ${c.name} — notes for coding agents

This is an AgentCMS **${kind}** (id \`${c.id}\`), built into \`${c.id}.zip\` and installed from the admin (or \`agentcms ext install\`).

- The \`agentcms-extensions\` skill explains the whole extension API; the types in \`node_modules/@agent-cms/agentcms/types/agentcms-runtime.d.ts\` document every runtime export.
- After every change: \`npm run build && npm run check\` (\`npm run -s check -- --json\` for machine-readable output). Fix every error; read every warning.
- \`npm run preview\` renders a demo site through the real publisher and prints screenshot paths — look at them when you change markup or CSS.
- Keep \`id\` identical in \`manifest.json\` and \`src/manifest.tsx\`; keep \`version\` in sync in both.
- The admin provides \`react\`, \`react/jsx-runtime\`, \`react-dom\`, \`react-dom/client\`, \`react-i18next\` and \`@agent-cms/runtime\` (externals in vite.config.ts); everything else you import is bundled.
${kind === "theme" ? '- Templates are pure functions of their props: no hooks with side effects, no fetch, no window/document — they run once per page at publish time.\n- Keep the two sentinels in BaseLayout (`<meta name="x-cms-head-extra" />`, `<script type="application/x-cms-body-end" />`).\n' : "- Filters on `page.head.extra` / `page.body.end` must be synchronous.\n"}`;
}
function pluginFiles(c) {
  const files = {};
  const imports = [`import type { BaseLayoutProps, PluginManifest } from "@agent-cms/runtime";`, `import readme from "../README.md?raw";`];
  const fields = [];
  const register = [];
  const configType = `${camel(c.id).charAt(0).toUpperCase() + camel(c.id).slice(1)}Config`;
  if (c.has("settings")) {
    imports.push(`import { SettingsPage } from "./SettingsPage";`, `import { DEFAULT_CONFIG, SETTINGS_SCHEMA, type ${configType} } from "./config";`);
    fields.push(`  settings: {
    navLabelKey: "settings.navLabel",
    defaultConfig: DEFAULT_CONFIG,
    component: SettingsPage,
    schema: SETTINGS_SCHEMA,
  },`);
  }
  if (c.has("i18n") || c.has("settings") || c.has("block") || c.has("dashboard-card")) {
    imports.push(`import { i18n } from "./i18n";`);
    fields.push(`  i18n,`);
    files["src/i18n.ts"] = pluginI18n(c);
  }
  if (c.has("block")) {
    imports.push(`import { calloutBlock, renderCallouts } from "./callout";`);
    register.push(
      `    // Editor block + its publish-time rendering: the editor stores a`,
      `    // marker <div data-cms-block="${c.id}/callout" …>, replaced by the`,
      `    // real HTML when a page is published.`,
      `    api.registerBlock(calloutBlock);`,
      `    api.addFilter<string>("post.html.body", (html) => renderCallouts(html));`
    );
    files["src/callout.tsx"] = pluginCallout(c, c.id);
  }
  if (c.has("dashboard-card")) {
    imports.push(`import { StatsCard } from "./StatsCard";`);
    register.push(`    api.registerDashboardCard({ id: "${c.id}/stats", priority: 50, component: StatsCard });`);
    files["src/StatsCard.tsx"] = pluginCard(c);
  }
  const configRead = c.has("settings") ? `      const config = { ...DEFAULT_CONFIG, ...((site.settings.pluginConfigs?.["${c.id}"] as Partial<${configType}>) ?? {}) };
      if (!config.enabled || !config.message) return head;
      return \`\${head}<meta name="${c.id}" content="\${escapeAttr(config.message)}" />\\n\`;` : `      return \`\${head}<meta name="generator-extension" content="${c.id}" />\\n\`;`;
  const headFilter = c.has("settings") || !c.has("block") && !c.has("dashboard-card") ? `    // <head> of every published page. SYNC filter: never async.
    // Args: (html so far, baseProps) — baseProps.site.settings is the
    // live site settings, plugin configs included.
    api.addFilter<string>("page.head.extra", (head, ...args) => {
      const { site } = args[0] as Omit<BaseLayoutProps, "children">;
${configRead}
    });

` : "";
  if (!headFilter) imports[0] = `import type { PluginManifest } from "@agent-cms/runtime";`;
  files["src/manifest.tsx"] = `${imports.join("\n")}

// Plugin entry point. The admin imports dist/bundle.js and reads its
// default export. register(api) runs every time the admin (re)applies
// plugins — at boot and after any settings change — on a freshly reset
// registry, so it must only register things (no side effects, no I/O).

const PLUGIN_ID = "${c.id}";
${c.has("settings") ? `
function escapeAttr(value: string): string {
  return value.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;");
}
` : ""}
const manifest: PluginManifest${c.has("settings") ? `<${configType}>` : ""} = {
  id: PLUGIN_ID,
  name: ${JSON.stringify(c.name)},
  version: "1.0.0",
  description: ${JSON.stringify(c.description)},
  author: ${JSON.stringify(c.author)},
  readme,
${fields.join("\n")}${fields.length ? "\n" : ""}  register(api) {
${headFilter}    // To maintain files of your own (feeds, indexes…), react to
    // "publish.complete" / "post.unpublished" / "post.deleted" (args:
    // post, ctx) AND register the same rebuild as a regeneration target —
    // bulk publishing, imports and Regenerate don't fire those actions:
    //   api.registerRegenerationTarget({ id: PLUGIN_ID, labelKey: "…", run: async (ctx, log) => { … } });
${register.length ? "\n" + register.join("\n") + "\n" : ""}  },
};

export default manifest;
`;
  if (c.has("settings")) {
    files["src/config.ts"] = `// Stored by the admin under settings.pluginConfigs["${c.id}"].
import type { SettingsSchema } from "@agent-cms/runtime";

export interface ${configType} {
  enabled: boolean;
  message: string;
}

export const DEFAULT_CONFIG: ${configType} = {
  enabled: true,
  message: "Hello from ${c.name}",
};

// What each setting does, for agents: \`agentcms plugins config ${c.id} --schema\`
// (closed lists in \`values\` are enforced on --set / --merge).
export const SETTINGS_SCHEMA: SettingsSchema = {
  enabled: { description: 'Adds the <meta name="${c.id}"> tag to every published page.' },
  message: { description: "Content of the meta tag." },
};
`;
    files["src/SettingsPage.tsx"] = settingsPage(c, configType, "plugin");
  }
  return files;
}
function pluginI18n(c) {
  const en = [];
  const fr = [];
  if (c.has("settings")) {
    en.push(`    settings: {
      navLabel: ${JSON.stringify(c.name)},
      title: ${JSON.stringify(c.name)},
      enabled: "Add the meta tag to every page",
      message: "Message",
      save: "Save",
      saved: "Saved. Regenerate the site to apply it to existing pages.",
    },`);
    fr.push(`    settings: {
      navLabel: ${JSON.stringify(c.name)},
      title: ${JSON.stringify(c.name)},
      enabled: "Ajouter la balise meta à chaque page",
      message: "Message",
      save: "Enregistrer",
      saved: "Enregistré. Régénérez le site pour l'appliquer aux pages existantes.",
    },`);
  }
  if (c.has("block")) {
    en.push(`    callout: { title: "Callout", tone: "Tone", text: "Text", info: "Info", warning: "Warning", success: "Success" },`);
    fr.push(`    callout: { title: "Encadré", tone: "Ton", text: "Texte", info: "Info", warning: "Attention", success: "Succès" },`);
  }
  if (c.has("dashboard-card")) {
    en.push(`    card: { title: ${JSON.stringify(c.name)}, posts: "Published posts", pages: "Published pages" },`);
    fr.push(`    card: { title: ${JSON.stringify(c.name)}, posts: "Articles publiés", pages: "Pages publiées" },`);
  }
  if (!en.length) {
    en.push(`    // Your keys, e.g. greeting: "Hello",`);
    fr.push(`    // Vos clés, par ex. greeting: "Bonjour",`);
  }
  return `// Bundled translations, loaded into the i18next namespace "${c.id}".
// Components call useTranslation("${c.id}"). English is the fallback.
export const i18n = {
  en: {
${en.join("\n")}
  },
  fr: {
${fr.join("\n")}
  },
};
`;
}
function settingsPage(c, configType, kind) {
  const ns = kind === "plugin" ? c.id : `theme-${c.id}`;
  const isTheme = kind === "theme";
  return `import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "@agent-cms/runtime";
import type { ${isTheme ? "ThemeSettingsPageProps" : "PluginSettingsPageProps"} } from "@agent-cms/runtime";
import ${isTheme ? "{ type ThemeConfig }" : `{ type ${configType} }`} from "./config";

// Rendered by the admin at ${isTheme ? "/theme-settings (when this theme is active)" : `/settings/plugin/${c.id}`}.
// \`config\` = defaultConfig merged with what was saved; \`save(next)\`
// persists it in the site settings.
//
// Two defences against browser extensions (password managers, …) that
// inject DOM into forms and crash React: data-form-type="other" on the
// <form>, and a submit button whose children never change shape.
export function SettingsPage({ config, save }: ${isTheme ? "ThemeSettingsPageProps<ThemeConfig>" : `PluginSettingsPageProps<${configType}>`}) {
  const { t } = useTranslation("${ns}");
  const [draft, setDraft] = useState(config);
  const [saving, setSaving] = useState(false);
  useEffect(() => setDraft(config), [config]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
${isTheme ? "      // save() also re-uploads theme-assets/<id>.css through compileCss,\n      // so the new colors are live right away.\n" : ""}      await save(draft);
      toast.success(t("settings.saved"));
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={onSubmit} data-form-type="other" className="max-w-xl space-y-4">
      <h1 className="text-xl font-semibold">{t("settings.title")}</h1>
${isTheme ? `      {(["accent", "background", "text"] as const).map((key) => (
        <label key={key} className="flex items-center justify-between gap-4">
          <span className="text-sm">{t(\`settings.\${key}\`)}</span>
          <input
            type="color"
            value={draft.colors[key]}
            onChange={(e) => setDraft({ ...draft, colors: { ...draft.colors, [key]: e.target.value } })}
          />
        </label>
      ))}` : `      <label className="flex items-center gap-2">
        <input
          type="checkbox"
          checked={draft.enabled}
          onChange={(e) => setDraft({ ...draft, enabled: e.target.checked })}
        />
        <span className="text-sm">{t("settings.enabled")}</span>
      </label>
      <label className="block space-y-1">
        <span className="text-sm font-medium">{t("settings.message")}</span>
        <input
          className="input w-full"
          value={draft.message}
          onChange={(e) => setDraft({ ...draft, message: e.target.value })}
        />
      </label>`}
      <button type="submit" className="btn btn-primary" disabled={saving}>
        <span>{t("settings.save")}</span>
      </button>
    </form>
  );
}
`;
}
function pluginCallout(c, ns) {
  const node = `${camel(c.id)}Callout`;
  return `import { Node, mergeAttributes } from "@tiptap/core";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import type { BlockManifest, SettingsSchema } from "@agent-cms/runtime";

// A "callout" editor block.
//
// Storage: the editor saves Markdown; an atom node round-trips through
// it as raw HTML — an EMPTY marker <div data-cms-block="${c.id}/callout"
// data-attrs="<base64 JSON>"></div>. At publish time a post.html.body
// filter swaps each marker for the real HTML (renderCallouts below).
// Keeping the published HTML out of the stored Markdown means you can
// change the rendering later and simply regenerate the site.

export const BLOCK_ID = "${c.id}/callout";
const NODE_NAME = "${node}";
const NS = "${ns}"; // i18n namespace

export type Tone = "info" | "warning" | "success";
const TONES: Tone[] = ["info", "warning", "success"];
export interface CalloutAttrs {
  tone: Tone;
  text: string;
}
const DEFAULTS: CalloutAttrs = { tone: "info", text: "" };

// UTF-8 safe base64 (btoa alone only takes Latin-1).
export function encodeAttrs(a: CalloutAttrs): string {
  const bytes = new TextEncoder().encode(JSON.stringify(a));
  let bin = "";
  for (const b of bytes) bin += String.fromCharCode(b);
  return btoa(bin);
}

// Merges with DEFAULTS so fields added later get a value in old posts.
export function decodeAttrs(value: string | null | undefined): CalloutAttrs {
  if (!value) return { ...DEFAULTS };
  try {
    const bin = atob(value);
    const json = new TextDecoder().decode(Uint8Array.from(bin, (ch) => ch.charCodeAt(0)));
    const parsed = { ...DEFAULTS, ...(JSON.parse(json) as Partial<CalloutAttrs>) };
    return { tone: TONES.includes(parsed.tone) ? parsed.tone : "info", text: String(parsed.text ?? "") };
  } catch {
    return { ...DEFAULTS };
  }
}

// Output of post.html.body is NOT sanitised afterwards: escape everything.
function escapeHtml(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

export function calloutHtml(a: CalloutAttrs): string {
  return \`<aside class="${c.id}-callout ${c.id}-callout--\${a.tone}" role="note"><p>\${escapeHtml(a.text)}</p></aside>\`;
}

// Tiny CSS, prepended once per page that uses the block. (For bigger CSS
// or scripts, use the per-page flag pattern described in the skill's
// blocks reference; a theme block would put this in the theme's CSS.)
const STYLE = \`<style>.${c.id}-callout{border-left:4px solid;padding:.75rem 1rem;margin:1.5rem 0;border-radius:.375rem}.${c.id}-callout p{margin:0}.${c.id}-callout--info{border-color:#2563eb;background:#eff6ff;color:#1e3a8a}.${c.id}-callout--warning{border-color:#d97706;background:#fffbeb;color:#78350f}.${c.id}-callout--success{border-color:#16a34a;background:#f0fdf4;color:#14532d}</style>\`;

// Publish time: marker → HTML (+ the CSS once if the page uses it).
const MARKER = /<div\\s+([^>]*data-cms-block="${c.id}\\/callout"[^>]*)>\\s*<\\/div>/g;
export function renderCallouts(html: string): string {
  let found = false;
  const out = html.replace(MARKER, (_m, attrs: string) => {
    found = true;
    return calloutHtml(decodeAttrs(/data-attrs="([^"]*)"/.exec(attrs)?.[1]));
  });
  return found ? STYLE + out : out;
}

// Editor side: a Tiptap atom node + a plain-DOM node view (no React
// node view needed, which keeps @tiptap/react out of the bundle).
const CalloutNode = Node.create({
  name: NODE_NAME,
  group: "block",
  atom: true,
  selectable: true,
  draggable: true,
  addAttributes() {
    return {
      // ONE attribute holding every field, stored base64 in data-attrs.
      attrs: {
        default: DEFAULTS,
        parseHTML: (el: HTMLElement) => decodeAttrs(el.getAttribute("data-attrs")),
        renderHTML: (a: { attrs?: CalloutAttrs }) => ({ "data-attrs": encodeAttrs(a.attrs ?? DEFAULTS) }),
      },
    };
  },
  parseHTML() {
    return [{ tag: \`div[data-cms-block="\${BLOCK_ID}"]\` }];
  },
  renderHTML({ HTMLAttributes }) {
    return ["div", mergeAttributes(HTMLAttributes, { "data-cms-block": BLOCK_ID })];
  },
  addNodeView() {
    return ({ node }) => {
      const dom = document.createElement("div");
      const paint = (a: CalloutAttrs) => {
        dom.innerHTML = STYLE + calloutHtml({ ...a, text: a.text || "…" });
      };
      paint(node.attrs.attrs as CalloutAttrs);
      return {
        dom,
        update(next) {
          if (next.type.name !== NODE_NAME) return false;
          paint(next.attrs.attrs as CalloutAttrs);
          return true;
        },
      };
    };
  },
});

function CalloutIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" width={16} height={16} fill="none" stroke="currentColor" strokeWidth={2} className={className} aria-hidden="true">
      <path d="M12 8v4m0 4h.01M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
    </svg>
  );
}

// Block tab of the editor's inspector, shown while a callout is selected.
// updateAttrs() moves the focus back to the editor, so the text is kept
// in local state and committed on blur (the select commits at once).
function CalloutInspector({ attrs, updateAttrs }: { attrs: Record<string, unknown>; updateAttrs: (patch: Record<string, unknown>) => void }) {
  const { t } = useTranslation(NS);
  const a = { ...DEFAULTS, ...((attrs.attrs as Partial<CalloutAttrs>) ?? {}) };
  const [text, setText] = useState(a.text);
  useEffect(() => setText(a.text), [a.text]);
  const set = (patch: Partial<CalloutAttrs>) => updateAttrs({ attrs: { ...a, ...patch } });
  return (
    <div className="space-y-3">
      <label className="block space-y-1">
        <span className="label">{t("callout.tone")}</span>
        <select className="input w-full" value={a.tone} onChange={(e) => set({ tone: e.target.value as Tone })}>
          {TONES.map((tone) => (
            <option key={tone} value={tone}>
              {t(\`callout.\${tone}\`)}
            </option>
          ))}
        </select>
      </label>
      <label className="block space-y-1">
        <span className="label">{t("callout.text")}</span>
        <textarea
          className="input w-full"
          rows={4}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onBlur={() => text !== a.text && set({ text })}
        />
      </label>
    </div>
  );
}

export const calloutBlock: BlockManifest = {
  id: BLOCK_ID,
  // The Tiptap node name: required for ids containing "/", otherwise the
  // editor never recognises the block as active (no inspector).
  nodeName: NODE_NAME,
  titleKey: "callout.title",
  namespace: NS,
  icon: CalloutIcon,
  category: "text",
  extensions: [CalloutNode],
  insert: (chain) => chain.insertContent({ type: NODE_NAME, attrs: { attrs: { ...DEFAULTS, text: "Write something here" } } }).run(),
  isActive: (editor) => editor.isActive(NODE_NAME),
  inspector: CalloutInspector,
  // What each attribute does, for agents: \`agentcms content blocks ${c.id}/callout\`
  // (closed lists in \`values\` are enforced on --attrs).
  attrsSchema: {
    tone: { description: "Color and icon of the callout.", values: TONES },
    text: { description: "Text of the callout (plain text)." },
  } satisfies SettingsSchema,
};
`;
}
function pluginCard(c) {
  return `import { useTranslation } from "react-i18next";
import { useCmsData } from "@agent-cms/runtime";

// Dashboard card: no props, reads what it needs itself. Runs in the
// admin only (never on the public site).
export function StatsCard() {
  const { t } = useTranslation("${c.id}");
  const { posts, pages } = useCmsData();
  const online = (list: Array<{ status: string }>) => list.filter((p) => p.status === "online").length;
  return (
    <div className="card p-4 space-y-2">
      <h2 className="font-semibold">{t("card.title")}</h2>
      <p className="text-sm">{t("card.posts")}: {online(posts)}</p>
      <p className="text-sm">{t("card.pages")}: {online(pages)}</p>
    </div>
  );
}
`;
}
function themeFiles(c) {
  const p = c.id;
  const files = {};
  const settings = c.has("settings");
  const block = c.has("block");
  files["src/manifest.tsx"] = `import type { ThemeManifest } from "@agent-cms/runtime";
import cssText from "./theme.css?raw";
import menuLoader from "./menu-loader.js?raw";
import readme from "../README.md?raw";
import { BaseLayout } from "./templates/BaseLayout";
import { HomeTemplate } from "./templates/HomeTemplate";
import { SingleTemplate } from "./templates/SingleTemplate";
import { CategoryTemplate } from "./templates/CategoryTemplate";
import { AuthorTemplate } from "./templates/AuthorTemplate";
import { NotFoundTemplate } from "./templates/NotFoundTemplate";
${settings ? `import { SettingsPage } from "./SettingsPage";
import { DEFAULT_CONFIG, SETTINGS_SCHEMA, compileCss, type ThemeConfig } from "./config";
` : ""}import { i18n } from "./i18n";
${block ? `import { calloutBlock, renderCallouts } from "./callout";
` : ""}
// Theme entry point. The admin renders every public page with these
// templates (react-dom/server, in the browser, at publish time) and
// uploads cssText to theme-assets/${c.id}.css ("Sync theme assets").

const manifest: ThemeManifest${settings ? "<ThemeConfig>" : ""} & { readme?: string } = {
  id: "${c.id}",
  name: ${JSON.stringify(c.name)},
  version: "1.0.0",
  description: ${JSON.stringify(c.description)},
  readme,
  scssEntry: "theme.css",
  cssText,
  // Uploaded as theme-assets/${c.id}-menu.js; fills the menus from
  // data/menu.json so menu edits don't require regenerating every page.
  jsText: menuLoader,
  // Image variants generated for every upload while this theme is active.
  imageFormats: {
    inputFormats: [".jpg", ".jpeg", ".png", ".webp", ".gif"],
    outputFormat: "webp",
    quality: 80,
    defaultFormat: "medium",
    formats: {
      small: { width: 480, height: 320, fit: "cover" },
      medium: { width: 960, height: 640, fit: "cover" },
      large: { width: 1600, height: 900, fit: "cover" },
    },
  },
  templates: {
    base: BaseLayout,
    home: HomeTemplate,
    single: SingleTemplate,
    category: CategoryTemplate,
    author: AuthorTemplate,
    notFound: NotFoundTemplate,
  },
${settings ? `  // /theme-settings page; the saved config is baked into the uploaded CSS.
  settings: { navLabelKey: "settings.navLabel", defaultConfig: DEFAULT_CONFIG, component: SettingsPage, schema: SETTINGS_SCHEMA },
  compileCss: (config) => compileCss(cssText, config),
` : ""}  // Translations, namespace "theme-${c.id}" (admin UI + public labels).
  i18n,
${block ? `  // Editor blocks offered while this theme is active.
  blocks: [calloutBlock],
  // Called when the theme becomes active (after the plugins).
  register(api) {
    api.addFilter<string>("post.html.body", (html) => renderCallouts(html));
  },
` : ""}};

export default manifest;
`;
  files["src/templates/BaseLayout.tsx"] = `import { canonicalUrl, type BaseLayoutProps } from "@agent-cms/runtime";
import { Header } from "../components/Header";
import { Footer } from "../components/Footer";

// Wraps every page. The two sentinels are mandatory: the admin replaces
// them with what plugins add to <head> (SEO, favicons, analytics…) and
// before </body>. Without them those plugins silently do nothing.
export function BaseLayout({ site, pageTitle, pageDescription, ogImage, currentPath, currentLocale, children }: BaseLayoutProps) {
  const lang = currentLocale || site.settings.language || "en";
  const siteTitle = site.settings.title || "";
  // Avoid "Brand — Brand" when the page title already holds the site name.
  const title = !pageTitle ? siteTitle : pageTitle.includes(siteTitle) ? pageTitle : \`\${pageTitle} — \${siteTitle}\`;
  const canonical = site.settings.baseUrl && currentPath ? canonicalUrl(site.settings.baseUrl, currentPath) : undefined;
  return (
    <html lang={lang}>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>{title}</title>
        {pageDescription && <meta name="description" content={pageDescription} />}
        {canonical && <link rel="canonical" href={canonical} />}
        <meta property="og:title" content={title} />
        {pageDescription && <meta property="og:description" content={pageDescription} />}
        {ogImage && <meta property="og:image" content={ogImage} />}
        {canonical && <meta property="og:url" content={canonical} />}
        {/* Root-absolute URLs are rewritten for sites hosted in a sub-folder. */}
        <link rel="stylesheet" href={\`/\${site.themeCssPath}\`} />
        <script src="/theme-assets/${c.id}-menu.js" defer />
        <meta name="x-cms-head-extra" />
      </head>
      <body className="${p}">
        <Header site={site} currentPath={currentPath} locale={lang} />
        <main className="${p}-main">{children}</main>
        <Footer site={site} locale={lang} />
        <script type="application/x-cms-body-end" />
      </body>
    </html>
  );
}
`;
  files["src/components/Header.tsx"] = `import type { ResolvedMenuItem, SiteContext } from "@agent-cms/runtime";
import { publicT } from "../publicT";

// Menu items are rendered statically (works without JS) and refreshed
// at runtime by menu-loader.js from data/menu.json, so a menu edit in
// the admin shows up without regenerating every page.
export function MenuList({ items, currentPath }: { items: ResolvedMenuItem[]; currentPath?: string }) {
  return (
    <ul>
      {items.map((item) => {
        const current = currentPath !== undefined && item.href === \`/\${currentPath}\`;
        return (
          <li key={item.id}>
            <a href={item.href} aria-current={current ? "page" : undefined}>
              {item.label}
            </a>
            {item.children && item.children.length > 0 && <MenuList items={item.children} currentPath={currentPath} />}
          </li>
        );
      })}
    </ul>
  );
}

export function Header({ site, currentPath, locale }: { site: SiteContext; currentPath: string; locale?: string }) {
  const t = publicT(site, locale);
  return (
    <header className="${p}-header">
      <div className="${p}-container ${p}-header__inner">
        {/* homePath: set per language by multilingual plugins. */}
        <a className="${p}-brand" href={site.homePath ?? "/index.html"}>
          {site.settings.title}
        </a>
        <button className="${p}-burger" type="button" aria-expanded="false" aria-controls="${p}-nav" data-${p}-burger>
          <span className="${p}-sr-only">{t("menu")}</span>
          <span aria-hidden="true">☰</span>
        </button>
        <nav id="${p}-nav" className="${p}-nav" aria-label={t("mainNav")} data-cms-menu="header">
          <MenuList items={site.resolvedMenus.header} currentPath={currentPath} />
        </nav>
      </div>
    </header>
  );
}
`;
  files["src/components/Footer.tsx"] = `import type { SiteContext } from "@agent-cms/runtime";
import { MenuList } from "./Header";
import { publicT } from "../publicT";

export function Footer({ site, locale }: { site: SiteContext; locale?: string }) {
  const t = publicT(site, locale);
  return (
    <footer className="${p}-footer">
      <div className="${p}-container">
        <nav aria-label={t("footerNav")} data-cms-menu="footer">
          <MenuList items={site.resolvedMenus.footer} />
        </nav>
        <p className="${p}-muted">© {site.settings.title}</p>
      </div>
    </footer>
  );
}
`;
  files["src/components/PostCard.tsx"] = `import { pickFormat, type CardPost, type SiteContext } from "@agent-cms/runtime";
import { publicT } from "../publicT";

// CardPost.url is relative to the site root WITHOUT a leading slash
// ("news/hello.html"); category.url already starts with "/".
export function PostCard({ post }: { post: CardPost }) {
  const image = pickFormat(post.hero, "small");
  return (
    <article className="${p}-card">
      {image && (
        <a href={\`/\${post.url}\`} className="${p}-card__media" tabIndex={-1} aria-hidden="true">
          <img src={image} alt={post.hero?.alt ?? ""} loading="lazy" />
        </a>
      )}
      <div className="${p}-card__body">
        {post.category && (
          <a className="${p}-eyebrow" href={post.category.url}>
            {post.category.name}
          </a>
        )}
        <h2 className="${p}-card__title">
          <a href={\`/\${post.url}\`}>{post.title}</a>
        </h2>
        {post.excerpt && <p className="${p}-card__excerpt">{post.excerpt}</p>}
        {post.dateLabel && <p className="${p}-muted">{post.dateLabel}</p>}
      </div>
    </article>
  );
}

export function PostGrid({ posts, site }: { posts: CardPost[]; site: SiteContext }) {
  if (posts.length === 0) return <p className="${p}-muted">{publicT(site)("empty")}</p>;
  return (
    <div className="${p}-grid">
      {posts.map((post) => (
        <PostCard key={post.id} post={post} />
      ))}
    </div>
  );
}
`;
  files["src/templates/HomeTemplate.tsx"] = `import type { HomeTemplateProps, SiteContext } from "@agent-cms/runtime";
import { PostGrid } from "../components/PostCard";

// index.html. Either the latest posts, or — when Settings → Home shows a
// page — that page's rendered body (staticPage).
export function HomeTemplate({ site, posts, staticPage, archivesLink }: HomeTemplateProps & { site: SiteContext }) {
  if (staticPage) {
    return (
      <div className="${p}-container ${p}-prose" dangerouslySetInnerHTML={{ __html: staticPage.bodyHtml }} />
    );
  }
  return (
    <div className="${p}-container">
      <section className="${p}-hero">
        <h1>{site.settings.title}</h1>
        {site.settings.description && <p className="${p}-lead">{site.settings.description}</p>}
      </section>
      <PostGrid posts={posts} site={site} />
      {archivesLink && (
        <p className="${p}-more">
          <a href={archivesLink.href}>{archivesLink.label}</a>
        </p>
      )}
    </div>
  );
}
`;
  files["src/templates/SingleTemplate.tsx"] = `import { buildTermUrl, pickFormat, postSortMillis, type SingleTemplateProps, type SiteContext } from "@agent-cms/runtime";
import { publicT } from "../publicT";

// Every post (<category>/<slug>.html or <slug>.html) and every page
// (<slug>.html). bodyHtml is the sanitised Markdown, already transformed
// by the post.html.body filters (blocks, embeds…).
export function SingleTemplate({ site, post, bodyHtml, author, hero, primaryTerm, tags }: SingleTemplateProps & { site: SiteContext }) {
  const image = pickFormat(hero, "large");
  const isPost = post.type === "post";
  const date = new Date(postSortMillis(post));
  let dateLabel = "";
  try {
    dateLabel = new Intl.DateTimeFormat(site.settings.language || "en", { dateStyle: "long" }).format(date);
  } catch {
    dateLabel = date.toDateString();
  }
  return (
    <article className="${p}-container ${p}-article">
      <header className="${p}-article__header">
        {isPost && primaryTerm && (
          <a className="${p}-eyebrow" href={\`/\${buildTermUrl(primaryTerm)}\`}>
            {primaryTerm.name}
          </a>
        )}
        <h1>{post.title}</h1>
        {isPost && (
          <p className="${p}-muted">
            {author ? <>{author.url ? <a href={author.url}>{author.displayName}</a> : author.displayName} · </> : null}
            <time dateTime={date.toISOString()}>{dateLabel}</time>
          </p>
        )}
      </header>
      {image && (
        <figure className="${p}-article__hero">
          <img src={image} alt={hero?.alt ?? ""} />
          {hero?.caption && <figcaption>{hero.caption}</figcaption>}
        </figure>
      )}
      <div className="${p}-prose" dangerouslySetInnerHTML={{ __html: bodyHtml }} />
      {isPost && tags.length > 0 && (
        <ul className="${p}-tags" aria-label={publicT(site)("tags")}>
          {tags.map((tag) => (
            <li key={tag.id}>#{tag.name}</li>
          ))}
        </ul>
      )}
    </article>
  );
}
`;
  files["src/templates/CategoryTemplate.tsx"] = `import type { CategoryTemplateProps, SiteContext } from "@agent-cms/runtime";
import { PostGrid } from "../components/PostCard";

// <category-slug>/index.html — every online post of the category.
export function CategoryTemplate({ site, term, posts, archivesLink }: CategoryTemplateProps & { site: SiteContext }) {
  return (
    <div className="${p}-container">
      <header className="${p}-hero">
        <h1>{term.name}</h1>
        {term.description && <p className="${p}-lead">{term.description}</p>}
      </header>
      <PostGrid posts={posts} site={site} />
      {archivesLink && (
        <p className="${p}-more">
          <a href={archivesLink.href}>{archivesLink.label}</a>
        </p>
      )}
    </div>
  );
}
`;
  files["src/templates/AuthorTemplate.tsx"] = `import { pickFormat, type AuthorTemplateProps, type SiteContext } from "@agent-cms/runtime";
import { PostGrid } from "../components/PostCard";

// author/<slug>.html — an author's bio and posts.
export function AuthorTemplate({ site, author, posts }: AuthorTemplateProps & { site: SiteContext }) {
  const avatar = pickFormat(author.avatar, "small");
  return (
    <div className="${p}-container">
      <header className="${p}-author">
        {avatar && <img className="${p}-author__avatar" src={avatar} alt="" width={96} height={96} />}
        <div>
          <h1>{author.displayName}</h1>
          {author.title && <p className="${p}-muted">{author.title}</p>}
          {author.bio && <p>{author.bio}</p>}
          {author.socials && author.socials.length > 0 && (
            <ul className="${p}-socials">
              {author.socials.map((s) => (
                <li key={s.network}>
                  <a href={s.url} rel="me noopener">
                    {s.network}
                  </a>
                </li>
              ))}
            </ul>
          )}
        </div>
      </header>
      <PostGrid posts={posts} site={site} />
    </div>
  );
}
`;
  files["src/templates/NotFoundTemplate.tsx"] = `import type { NotFoundTemplateProps, SiteContext } from "@agent-cms/runtime";
import { publicT } from "../publicT";

// 404.html — most static hosts serve it for unknown URLs.
export function NotFoundTemplate({ site, message }: NotFoundTemplateProps & { site: SiteContext }) {
  const t = publicT(site);
  return (
    <div className="${p}-container ${p}-hero">
      <h1>{t("notFoundTitle")}</h1>
      <p className="${p}-lead">{message ?? t("notFoundText")}</p>
      <p>
        <a href={site.homePath ?? "/index.html"}>{t("backHome")}</a>
      </p>
    </div>
  );
}
`;
  files["src/menu-loader.js"] = `// ${c.name} — runtime menu loader, uploaded as theme-assets/${c.id}-menu.js.
// Refreshes [data-cms-menu="header|footer"] from data/menu.json (the
// admin rewrites it whenever menus, posts or categories change) and
// wires the mobile burger. Fails silently: the statically rendered
// menu stays in place.
(function () {
  "use strict";
  // Sites hosted in a sub-folder carry <meta name="x-cms-base" content="/repo/">.
  var meta = document.querySelector('meta[name="x-cms-base"]');
  var BASE = (meta && meta.getAttribute("content")) || "/";
  if (BASE.charAt(BASE.length - 1) !== "/") BASE += "/";
  function withBase(url) {
    if (!url || BASE === "/" || /^([a-z][a-z0-9+.-]*:|\\/\\/|#)/i.test(url) || url.indexOf(BASE) === 0) return url;
    return BASE + url.replace(/^\\//, "");
  }
  var here = location.pathname.replace(/\\/$/, "/index.html");

  function render(items) {
    var ul = document.createElement("ul");
    items.forEach(function (item) {
      var li = document.createElement("li");
      var a = document.createElement("a");
      a.href = withBase(item.href);
      a.textContent = item.label;
      // Anchors ("/index.html#menu") are sections, not the current page.
      if (a.pathname === here && !a.hash) a.setAttribute("aria-current", "page");
      li.appendChild(a);
      if (item.children && item.children.length) li.appendChild(render(item.children));
      ul.appendChild(li);
    });
    return ul;
  }

  function fill(menu) {
    ["header", "footer"].forEach(function (slot) {
      var host = document.querySelector('[data-cms-menu="' + slot + '"]');
      if (!host || !Array.isArray(menu[slot])) return;
      var old = host.querySelector("ul");
      var next = render(menu[slot]);
      if (old) host.replaceChild(next, old);
      else host.appendChild(next);
    });
  }

  function wireBurger() {
    var button = document.querySelector("[data-${p}-burger]");
    var nav = document.getElementById("${p}-nav");
    if (!button || !nav) return;
    button.addEventListener("click", function () {
      var open = button.getAttribute("aria-expanded") !== "true";
      button.setAttribute("aria-expanded", String(open));
      nav.classList.toggle("is-open", open);
    });
  }

  function start() {
    wireBurger();
    fetch(withBase("/data/menu.json"), { credentials: "omit" })
      .then(function (res) {
        if (!res.ok) throw new Error("HTTP " + res.status);
        return res.json();
      })
      .then(fill)
      .catch(function () {});
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start);
  else start();
})();
`;
  files["src/theme.css"] = themeCss(p);
  if (settings) {
    files["src/config.ts"] = `// Stored by the admin under settings.themeConfigs["${c.id}"].
import type { SettingsSchema } from "@agent-cms/runtime";

export interface ThemeConfig {
  colors: { accent: string; background: string; text: string };
}

export const DEFAULT_CONFIG: ThemeConfig = {
  colors: { accent: "#2563eb", background: "#ffffff", text: "#111827" },
};

// What each setting does, for agents: \`agentcms themes config ${c.id} --schema\`
// (closed lists in \`values\` are enforced on --set / --merge).
export const SETTINGS_SCHEMA: SettingsSchema = {
  "colors.accent": { description: "Links, buttons and highlights.", format: "hex color" },
  "colors.background": { description: "Page background.", format: "hex color" },
  "colors.text": { description: "Body text.", format: "hex color" },
};

// Called every time theme-assets/${c.id}.css is uploaded (Sync theme
// assets, saving the settings page): appends the user's values after
// the base CSS so they win the cascade. Unchanged config → base CSS.
export function compileCss(baseCss: string, config: ThemeConfig): string {
  const c = { ...DEFAULT_CONFIG.colors, ...(config?.colors ?? {}) };
  const same = (Object.keys(c) as Array<keyof ThemeConfig["colors"]>).every((k) => c[k] === DEFAULT_CONFIG.colors[k]);
  if (same) return baseCss;
  const safe = (v: string) => (/^#[0-9a-f]{3,8}$/i.test(v) ? v : "inherit");
  return \`\${baseCss}\\n:root{--${p}-accent:\${safe(c.accent)};--${p}-bg:\${safe(c.background)};--${p}-text:\${safe(c.text)}}\\n\`;
}
`;
    files["src/SettingsPage.tsx"] = settingsPage(c, "ThemeConfig", "theme");
  }
  {
    files["src/i18n.ts"] = `// Loaded into the i18next namespace "theme-${c.id}"; English is the fallback.
// "public.*" = labels printed on the published site (see publicT.ts).
export const i18n = {
  en: {
    public: { menu: "Menu", mainNav: "Main", footerNav: "Footer", tags: "Tags", empty: "Nothing published yet.", notFoundTitle: "Page not found", notFoundText: "The page you are looking for does not exist or has moved.", backHome: "Back to the home page", by: "By" },
${settings ? `    settings: { navLabel: ${JSON.stringify(c.name)}, title: ${JSON.stringify(c.name + " settings")}, accent: "Accent color", background: "Background", text: "Text color", save: "Save", saved: "Saved — the theme CSS was uploaded with your colors. Visitors may need a hard refresh." },
` : ""}${block ? `    callout: { title: "Callout", tone: "Tone", text: "Text", info: "Info", warning: "Warning", success: "Success" },
` : ""}  },
  fr: {
    public: { menu: "Menu", mainNav: "Principal", footerNav: "Pied de page", tags: "Étiquettes", empty: "Rien de publié pour le moment.", notFoundTitle: "Page introuvable", notFoundText: "La page que vous cherchez n'existe pas ou a été déplacée.", backHome: "Retour à l'accueil", by: "Par" },
${settings ? `    settings: { navLabel: ${JSON.stringify(c.name)}, title: ${JSON.stringify("Réglages " + c.name)}, accent: "Couleur d'accent", background: "Fond", text: "Couleur du texte", save: "Enregistrer", saved: "Enregistré — le CSS du thème a été envoyé avec vos couleurs. Un rechargement forcé peut être nécessaire." },
` : ""}${block ? `    callout: { title: "Encadré", tone: "Ton", text: "Texte", info: "Info", warning: "Attention", success: "Succès" },
` : ""}  },
};
`;
  }
  files["src/publicT.ts"] = `import { i18n, pickPublicLocale, type SiteContext } from "@agent-cms/runtime";

// Labels printed on the published site use the SITE's language (not the
// admin user's): i18n.getFixedT on the "public.*" keys of i18n.ts.
export function publicT(site: SiteContext, locale?: string) {
  const t = i18n.getFixedT(pickPublicLocale(locale || site.settings.language || "en"), "theme-${c.id}");
  return (key: string) => t(\`public.\${key}\`);
}
`;
  if (block) files["src/callout.tsx"] = pluginCallout(c, `theme-${c.id}`);
  return files;
}
function themeCss(p) {
  return `/* Plain CSS, uploaded verbatim as theme-assets/<id>.css. Classes are
   prefixed with "${p}-" so they never clash with markup from plugins. */
:root {
  --${p}-accent: #2563eb;
  --${p}-bg: #ffffff;
  --${p}-text: #111827;
  --${p}-muted: #6b7280;
  --${p}-border: #e5e7eb;
  --${p}-surface: #f9fafb;
  --${p}-radius: 12px;
  --${p}-max: 1120px;
  --${p}-font: system-ui, -apple-system, "Segoe UI", Roboto, sans-serif;
}
@media (prefers-color-scheme: dark) {
  :root {
    --${p}-bg: #0b0f17;
    --${p}-text: #e5e7eb;
    --${p}-muted: #9ca3af;
    --${p}-border: #1f2937;
    --${p}-surface: #111827;
  }
}
*, *::before, *::after { box-sizing: border-box; }
.${p} { margin: 0; background: var(--${p}-bg); color: var(--${p}-text); font: 17px/1.65 var(--${p}-font); }
.${p} a { color: var(--${p}-accent); }
.${p} img { max-width: 100%; height: auto; display: block; }
.${p}-container { width: min(100% - 2rem, var(--${p}-max)); margin-inline: auto; }
.${p}-sr-only { position: absolute; width: 1px; height: 1px; overflow: hidden; clip: rect(0 0 0 0); }
.${p}-muted { color: var(--${p}-muted); font-size: .9rem; }

.${p}-header { border-bottom: 1px solid var(--${p}-border); }
.${p}-header__inner { display: flex; align-items: center; justify-content: space-between; gap: 1rem; min-height: 64px; position: relative; }
.${p}-brand { font-weight: 700; font-size: 1.2rem; color: var(--${p}-text) !important; text-decoration: none; }
.${p}-nav ul { list-style: none; display: flex; gap: 1.25rem; margin: 0; padding: 0; }
.${p}-nav a { color: var(--${p}-text); text-decoration: none; }
.${p}-nav a[aria-current="page"] { color: var(--${p}-accent); font-weight: 600; }
.${p}-nav ul ul { display: none; }
.${p}-burger { display: none; background: none; border: 1px solid var(--${p}-border); border-radius: 8px; padding: .25rem .6rem; color: inherit; font-size: 1.1rem; }
@media (max-width: 720px) {
  .${p}-burger { display: block; }
  .${p}-nav { display: none; position: absolute; top: 100%; left: 0; right: 0; background: var(--${p}-bg); border-bottom: 1px solid var(--${p}-border); padding: 1rem; z-index: 10; }
  .${p}-nav.is-open { display: block; }
  .${p}-nav ul { flex-direction: column; gap: .75rem; }
}

.${p}-main { padding-block: 2.5rem 4rem; }
.${p}-hero { padding-block: 1rem 2rem; }
.${p}-hero h1 { font-size: clamp(2rem, 4vw, 3rem); line-height: 1.15; margin: 0 0 .5rem; }
.${p}-lead { font-size: 1.15rem; color: var(--${p}-muted); margin: 0; }
.${p}-eyebrow { text-transform: uppercase; letter-spacing: .06em; font-size: .75rem; font-weight: 700; text-decoration: none; }

.${p}-grid { display: grid; gap: 1.5rem; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); }
.${p}-card { background: var(--${p}-surface); border: 1px solid var(--${p}-border); border-radius: var(--${p}-radius); overflow: hidden; display: flex; flex-direction: column; }
.${p}-card__media img { aspect-ratio: 3 / 2; width: 100%; object-fit: cover; }
.${p}-card__body { padding: 1rem 1.25rem 1.25rem; }
.${p}-card__title { font-size: 1.2rem; line-height: 1.3; margin: .35rem 0; }
.${p}-card__title a { color: var(--${p}-text); text-decoration: none; }
.${p}-card__title a:hover { color: var(--${p}-accent); }
.${p}-card__excerpt { margin: 0 0 .5rem; color: var(--${p}-muted); }
.${p}-more { margin-top: 2rem; }

.${p}-article { max-width: 760px; }
.${p}-article__header h1 { font-size: clamp(2rem, 4.5vw, 2.8rem); line-height: 1.15; margin: .35rem 0 .75rem; }
.${p}-article__hero { margin: 2rem 0; }
.${p}-article__hero img { border-radius: var(--${p}-radius); width: 100%; }
.${p}-article__hero figcaption { color: var(--${p}-muted); font-size: .85rem; margin-top: .5rem; }
.${p}-prose h2 { margin-top: 2.2rem; line-height: 1.25; }
.${p}-prose h3 { margin-top: 1.8rem; }
.${p}-prose blockquote { margin: 1.5rem 0; padding: .25rem 1.25rem; border-left: 4px solid var(--${p}-accent); color: var(--${p}-muted); }
.${p}-prose pre { background: var(--${p}-surface); border: 1px solid var(--${p}-border); border-radius: 8px; padding: 1rem; overflow-x: auto; font-size: .9rem; }
.${p}-prose code { font-family: ui-monospace, SFMono-Regular, Menlo, monospace; font-size: .9em; }
.${p}-prose table { border-collapse: collapse; width: 100%; display: block; overflow-x: auto; }
.${p}-prose th, .${p}-prose td { border: 1px solid var(--${p}-border); padding: .5rem .75rem; text-align: left; }
.${p}-prose img { border-radius: 8px; margin: 1.5rem 0; }
.${p}-prose hr { border: 0; border-top: 1px solid var(--${p}-border); margin: 2.5rem 0; }
.${p}-tags { list-style: none; display: flex; flex-wrap: wrap; gap: .5rem; padding: 0; margin: 2rem 0 0; }
.${p}-tags li { background: var(--${p}-surface); border: 1px solid var(--${p}-border); border-radius: 999px; padding: .15rem .75rem; font-size: .85rem; }

.${p}-author { display: flex; gap: 1.5rem; align-items: flex-start; margin-bottom: 2.5rem; }
.${p}-author h1 { margin: 0; }
.${p} .${p}-author__avatar { border-radius: 50%; width: 96px; height: 96px; object-fit: cover; }
.${p}-socials { list-style: none; display: flex; gap: 1rem; padding: 0; }

.${p}-footer { border-top: 1px solid var(--${p}-border); padding-block: 2rem; }
.${p}-footer ul { list-style: none; display: flex; flex-wrap: wrap; gap: 1.25rem; padding: 0; margin: 0 0 1rem; }
`;
}
export {
  scaffoldExtension
};
