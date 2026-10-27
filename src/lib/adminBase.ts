// Resolves the admin SPA's folder name on the deployment by inspecting
// the URL the page was loaded from. Used to prefix upload paths on the
// publish target (plugins/<id>/, themes/<id>/) so the
// admin can be deployed under any folder name — not just the
// conventional /admin/ — for security-through-obscurity.
//
// The runtime loader (services/externalLoader.ts) doesn't need this
// helper because it uses URLs relative to document.baseURI which
// auto-resolve against whatever folder the admin is in. Only the
// upload side does — publish-target paths are absolute from the site
// root, not relative to the admin SPA's location.
//
// Conventions:
//   /erf34f654GH3/index.html  → "erf34f654GH3"
//   /admin/                    → "admin"
//   /sites/c1/admin/index.html → "sites/c1/admin"
//   /                          → ""  (root deployment)

const INDEX_FILE_RE = /^index\.[a-z0-9]+$/i;

export function getAdminFolder(): string {
  if (typeof window === "undefined") return "";
  const path = window.location.pathname;
  // Split on /, drop empty segments produced by leading/trailing /,
  // then drop a trailing index.html-like file if present (Vite preview
  // / dev server / static hosts all serve directory URLs with or without
  // the explicit file).
  const segments = path.split("/").filter(Boolean);
  const last = segments[segments.length - 1];
  if (last && INDEX_FILE_RE.test(last)) segments.pop();
  return segments.join("/");
}

// Prefixes a path with the admin folder. Pass paths WITHOUT a leading
// slash (`config.js`, `plugins/foo/bundle.js`). Returns the path from
// the site root (e.g. `admin/config.js` or `erf34f654GH3/config.js`),
// unchanged when the admin is at the root.
export function withAdminBase(relativePath: string): string {
  const folder = getAdminFolder();
  const clean = relativePath.replace(/^\/+/, "");
  return folder ? `${folder}/${clean}` : clean;
}
