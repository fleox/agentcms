const s = `# Core SEO

Adds the basic SEO meta tags every published page needs to look right when shared on social platforms and identified by crawlers.

## What it does

Injects the following into every page's \`<head>\` at publish time:

- **Twitter Card** meta tags — large summary card with image when the post has a hero, plain summary card otherwise.
- **\`<meta name="generator">\`** — identifies pages as built with AgentCMS. Helpful for analytics; harmless for SEO.

The page's primary \`<title>\`, \`<meta name="description">\`, Open Graph tags and canonical URL are emitted by the active theme's BaseLayout — Core SEO complements them, it doesn't replace them.

## Configuration

None. The plugin is intentionally zero-config. Per-post SEO overrides (title, description, OG image) live on the post itself in the editor's **Document** sidebar — they propagate to both the theme's tags and the Core SEO tags automatically.

## When to disable it

Disable Core SEO if your theme already emits Twitter Card tags itself, or if you want to handle social meta entirely through a different plugin (e.g. a future Yoast-style SEO plugin). Disabling has no impact on the rest of the publish pipeline — page titles, descriptions and Open Graph tags survive because they come from the theme.
`;
function g() {
  return '<meta name="generator" content="AgentCMS" />';
}
function l(e) {
  var r, o;
  const t = e.pageDescription ? `<meta name="twitter:description" content="${i(e.pageDescription)}" />` : "", n = e.ogImage ? `<meta name="twitter:image" content="${i(e.ogImage)}" />` : "", a = e.pageTitle || ((o = (r = e.site) == null ? void 0 : r.settings) == null ? void 0 : o.title) || "";
  return [
    `<meta name="twitter:card" content="${e.ogImage ? "summary_large_image" : "summary"}" />`,
    `<meta name="twitter:title" content="${i(a)}" />`,
    t,
    n
  ].filter(Boolean).join(`
`);
}
function i(e) {
  return e.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}
const m = {
  id: "core-seo",
  name: "SEO",
  version: "1.0.1",
  author: "AgentCMS",
  description: "Adds Twitter card meta tags and a generator hint to every published page.",
  readme: s,
  register(e) {
    e.addFilter("page.head.extra", (t, ...n) => {
      const a = n[0];
      return a ? [t, g(), l(a)].filter(Boolean).join(`
`) : t;
    });
  }
};
export {
  m as manifest
};
