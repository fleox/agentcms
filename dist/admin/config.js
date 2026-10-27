// Runtime config bootstrap. Loaded synchronously by /admin/index.html
// before the main JS bundle, so the resolver in src/lib/runtimeConfig.ts
// can read window.__AGENTCMS_CONFIG__ during module init.
//
// In a fresh deployment with no values baked in via .env, this file ships
// with __AGENTCMS_CONFIG__ === null, which makes the admin render the
// first-run setup form. When the setup wizard (or the agentcms CLI) hosts
// the admin on the publish target, it writes this file there with the
// actual config — subsequent reloads behave exactly like a build that had
// .env values inlined at compile time.
window.__AGENTCMS_CONFIG__ = null;
