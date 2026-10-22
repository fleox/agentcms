# Flexweg hosting

- The user creates (or opens) a site on https://www.flexweg.com, then copies an **API key** from the site's API section. They store it: `! npx -y agentcms@0.1.0 credentials set flexweg:<site-name>`.
- Site URL: the site's public URL shown in the Flexweg dashboard.
- Data: SQLite file on Flexweg works out of the box. Flexweg's own SQLite service (with real logins) is only available through the setup wizard (`serve`), via the "Use Flexweg's SQLite service" checkbox.

Plan fragment:

```json
"hosting": { "type": "flexweg", "settings": { "siteUrl": "<public site URL>" }, "credential": "flexweg:<site-name>" }
```
