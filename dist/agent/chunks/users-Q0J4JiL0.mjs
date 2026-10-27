import { createRequire as __acmsRequire } from "node:module";
import { fileURLToPath as __acmsPath } from "node:url";
import { dirname as __acmsDirname } from "node:path";
const require2 = __acmsRequire(import.meta.url);
const __filename = __acmsPath(import.meta.url);
const __dirname = __acmsDirname(__filename);
import { getBackendKind, isDocStoreBackend } from "./runtimeConfig-DyVDQuHr.mjs";
import { d as deleteDoc, j as getDoc, s as setDoc, u as updateDoc, k as deleteField, a as onSnapshot, q as query, o as orderBy, c as doc, e as collections, f as getDb, b as serverTimestamp, h as collection } from "./firebaseClient-BTpUMbPI.mjs";
import { g as getDocStore, k as toTimestamp, p as toMillis } from "./registry-DClFwwHa.mjs";
function slugify(input) {
  return input.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 96);
}
function isValidSlug(slug) {
  return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug);
}
function buildPostUrl({ post, primaryTerm }) {
  const postSlug = post.slug.trim();
  if (!postSlug) throw new Error("Post slug is required to build its URL.");
  if (post.type === "page") {
    return `${postSlug}.html`;
  }
  if (primaryTerm && primaryTerm.type === "category") {
    const termSlug = primaryTerm.slug.trim();
    if (!termSlug) throw new Error("Primary category slug is required to build the post URL.");
    return `${termSlug}/${postSlug}.html`;
  }
  return `${postSlug}.html`;
}
function authorBaseSlug(user) {
  const fullName = [user.firstName, user.lastName].filter(Boolean).join(" ").trim();
  const candidate = fullName || user.displayName?.trim() || user.email?.split("@")[0] || user.id;
  return slugify(candidate) || user.id.slice(0, 8);
}
function buildAuthorUrl(user, others) {
  const base = authorBaseSlug(user);
  const collision = others.some((u) => u.id !== user.id && authorBaseSlug(u) === base);
  const slug = collision ? `${base}-${user.id.slice(0, 6)}` : base;
  return `author/${slug}.html`;
}
function buildTermUrl(term) {
  const slug = term.slug.trim();
  if (!slug) throw new Error("Term slug is required to build its URL.");
  if (term.type !== "category") {
    throw new Error("Only categories produce a public archive URL.");
  }
  return `${slug}/index.html`;
}
const HOME_PATH = "index.html";
const NOT_FOUND_PATH = "404.html";
function pathToPublicUrl(baseUrl, path) {
  const cleanBase = baseUrl.replace(/\/+$/, "");
  const cleanPath = path.replace(/^\/+/, "");
  return `${cleanBase}/${cleanPath}`;
}
function canonicalPath(path) {
  return path.replace(/(^|\/)index\.html$/i, (_, sep) => sep);
}
function canonicalUrl(baseUrl, path) {
  if (!baseUrl) return "";
  const cleanBase = baseUrl.replace(/\/+$/, "");
  const cleanPath = canonicalPath(path.replace(/^\/+/, ""));
  return `${cleanBase}/${cleanPath}`;
}
function findAvailableSlug(base, isUsed) {
  if (!base) base = "untitled";
  if (!isUsed(base)) return base;
  for (let i = 2; i < 1e3; i++) {
    const candidate = `${base}-${i}`;
    if (!isUsed(candidate)) return candidate;
  }
  return `${base}-${Date.now()}`;
}
function detectPathCollision(candidatePath, posts, pages, terms, ignoreId) {
  for (const post of posts) {
    if (post.id === ignoreId) continue;
    const term = post.primaryTermId ? terms.find((t) => t.id === post.primaryTermId) : void 0;
    let p;
    try {
      p = buildPostUrl({ post, primaryTerm: term });
    } catch {
      continue;
    }
    if (p === candidatePath) {
      return { kind: "post", id: post.id, label: post.title || post.slug, path: p };
    }
  }
  for (const page of pages) {
    if (page.id === ignoreId) continue;
    let p;
    try {
      p = buildPostUrl({ post: page });
    } catch {
      continue;
    }
    if (p === candidatePath) {
      return { kind: "page", id: page.id, label: page.title || page.slug, path: p };
    }
  }
  for (const term of terms) {
    if (term.id === ignoreId) continue;
    if (term.type !== "category") continue;
    let p;
    try {
      p = buildTermUrl(term);
    } catch {
      continue;
    }
    if (p === candidatePath) {
      return { kind: "category", id: term.id, label: term.name || term.slug, path: p };
    }
  }
  return null;
}
function detectTermSlugCollision(candidate, terms, ignoreId) {
  for (const term of terms) {
    if (term.id === ignoreId) continue;
    if (term.type !== candidate.type) continue;
    if (term.slug !== candidate.slug) continue;
    return {
      kind: "category",
      id: term.id,
      label: term.name || term.slug,
      path: term.slug
    };
  }
  return null;
}
function normalizeMediaSlug(filename) {
  const lastDot = filename.lastIndexOf(".");
  const stem = lastDot > 0 ? filename.slice(0, lastDot) : filename;
  const base = slugify(stem) || "media";
  return `${base}-${randomHexSuffix(6)}`;
}
function randomHexSuffix(length) {
  if (typeof crypto !== "undefined" && typeof crypto.getRandomValues === "function") {
    const bytes = new Uint8Array(Math.ceil(length / 2));
    crypto.getRandomValues(bytes);
    return Array.from(bytes).map((b) => b.toString(16).padStart(2, "0")).join("").slice(0, length);
  }
  return Math.random().toString(16).slice(2, 2 + length);
}
function pickFormat(view, name) {
  if (!view) return "";
  const formats = view.formats;
  if (name && formats[name]) return formats[name].url;
  if (view.default && formats[view.default]) return formats[view.default].url;
  const largest = Object.values(formats).reduce(
    (acc, f) => {
      const area = (f.width || 0) * (f.height || 0);
      if (!acc || area > acc.area) return { url: f.url, area };
      return acc;
    },
    null
  );
  return largest?.url ?? "";
}
function mediaToView(media) {
  if (!media) return void 0;
  if (media.formats && Object.keys(media.formats).length > 0) {
    return {
      alt: media.alt,
      caption: media.caption,
      default: media.defaultFormat ?? Object.keys(media.formats)[0],
      formats: Object.fromEntries(
        Object.entries(media.formats).map(([k, v]) => [
          k,
          { url: v.url, width: v.width, height: v.height }
        ])
      )
    };
  }
  if (media.url) {
    return {
      alt: media.alt,
      caption: media.caption,
      default: "legacy",
      formats: { legacy: { url: media.url, width: 0, height: 0 } }
    };
  }
  return void 0;
}
function pickMediaUrl(media, name) {
  return pickFormat(mediaToView(media), name);
}
const SOCIAL_NETWORKS = [
  "twitter",
  "linkedin",
  "instagram",
  "mastodon",
  "bluesky",
  "github",
  "website"
];
const USER_ROLES = {
  admin: "admin",
  editor: "editor"
};
const usersCollection = () => collection(getDb(), collections.users);
const userDoc = (uid) => doc(getDb(), collections.users, uid);
function subscribeToUsers$2(onChange, onError) {
  const q = query(usersCollection(), orderBy("email", "asc"));
  return onSnapshot(
    q,
    (snap) => {
      const users2 = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      onChange(users2);
    },
    onError
  );
}
async function getUserRecord$2(uid) {
  const snap = await getDoc(userDoc(uid));
  return snap.exists() ? { id: snap.id, ...snap.data() } : null;
}
function subscribeToUserRecord$2(uid, onChange, onError) {
  return onSnapshot(
    userDoc(uid),
    (snap) => {
      onChange(snap.exists() ? { id: snap.id, ...snap.data() } : null);
    },
    onError
  );
}
async function ensureSelfUserRecord$2(authUser) {
  const ref = userDoc(authUser.uid);
  const snap = await getDoc(ref);
  if (snap.exists()) return { id: snap.id, ...snap.data() };
  const baseData = {
    email: (authUser.email ?? "").toLowerCase(),
    disabled: false,
    preferences: { adminLocale: "en" },
    createdAt: serverTimestamp(),
    createdBy: authUser.uid
  };
  const adminData = { ...baseData, role: USER_ROLES.admin };
  try {
    await setDoc(ref, adminData);
    return { id: authUser.uid, ...adminData };
  } catch (err) {
    const code = err?.code ?? "";
    if (code !== "permission-denied") throw err;
    const editorData = { ...baseData, role: USER_ROLES.editor };
    await setDoc(ref, editorData);
    return { id: authUser.uid, ...editorData };
  }
}
async function setUserRole$2(uid, role) {
  if (role !== USER_ROLES.admin && role !== USER_ROLES.editor) {
    throw new Error("Invalid role.");
  }
  return updateDoc(userDoc(uid), { role });
}
async function setUserDisabled$2(uid, disabled) {
  return updateDoc(userDoc(uid), { disabled: Boolean(disabled) });
}
async function setUserPreferences$2(uid, prefs) {
  const update = {};
  if (prefs.adminLocale) update["preferences.adminLocale"] = prefs.adminLocale;
  if (Object.keys(update).length === 0) return;
  return updateDoc(userDoc(uid), update);
}
async function setUserProfile$2(uid, patch) {
  const update = {};
  for (const key of ["firstName", "lastName", "title", "bio", "avatarMediaId"]) {
    if (!(key in patch)) continue;
    const value = patch[key];
    if (value === null || value === void 0 || value === "") {
      update[key] = deleteField();
    } else {
      update[key] = value;
    }
  }
  if ("socials" in patch) {
    const value = patch.socials;
    if (value === null || value === void 0) {
      update.socials = deleteField();
    } else {
      const cleaned = {};
      for (const [network, entry] of Object.entries(value)) {
        if (entry && typeof entry.url === "string" && entry.url.trim().length > 0) {
          cleaned[network] = { url: entry.url.trim(), visible: !!entry.visible };
        }
      }
      update.socials = Object.keys(cleaned).length > 0 ? cleaned : deleteField();
    }
  }
  if (Object.keys(update).length === 0) return;
  return updateDoc(userDoc(uid), update);
}
function resolveDisplayName$1(record) {
  const full = [record.firstName, record.lastName].filter(Boolean).join(" ").trim();
  if (full) return full;
  if (record.displayName && record.displayName.trim()) return record.displayName.trim();
  if (record.email) return record.email;
  return record.id;
}
function resolvePublicDisplayName$1(record) {
  const full = [record.firstName, record.lastName].filter(Boolean).join(" ").trim();
  if (full) return full;
  if (record.displayName && record.displayName.trim()) return record.displayName.trim();
  return "";
}
async function deleteUserRecord$2(uid) {
  return deleteDoc(userDoc(uid));
}
function visibleSocials(record) {
  const stored = record.socials;
  if (!stored) return [];
  const out = [];
  for (const network of SOCIAL_NETWORKS) {
    const entry = stored[network];
    if (!entry || !entry.visible) continue;
    if (typeof entry.url !== "string" || !entry.url.trim()) continue;
    out.push({ network, url: entry.url.trim() });
  }
  return out;
}
function buildAuthorLookup$1(users2, media) {
  const userMap = new Map(users2.map((u) => [u.id, u]));
  const mediaMap = media instanceof Map ? media : new Map(media.map((m) => [m.id, m]));
  return (id) => {
    const record = userMap.get(id);
    if (!record) return void 0;
    const displayName = resolvePublicDisplayName$1(record);
    if (!displayName) return void 0;
    const avatar = record.avatarMediaId ? mediaToView(mediaMap.get(record.avatarMediaId)) : void 0;
    const socials = visibleSocials(record);
    return {
      id: record.id,
      displayName,
      url: `/${buildAuthorUrl(record, users2)}`,
      title: record.title,
      bio: record.bio,
      avatar,
      socials: socials.length > 0 ? socials : void 0
    };
  };
}
const firebase = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  USER_ROLES,
  buildAuthorLookup: buildAuthorLookup$1,
  deleteUserRecord: deleteUserRecord$2,
  ensureSelfUserRecord: ensureSelfUserRecord$2,
  getUserRecord: getUserRecord$2,
  resolveDisplayName: resolveDisplayName$1,
  resolvePublicDisplayName: resolvePublicDisplayName$1,
  setUserDisabled: setUserDisabled$2,
  setUserPreferences: setUserPreferences$2,
  setUserProfile: setUserProfile$2,
  setUserRole: setUserRole$2,
  subscribeToUserRecord: subscribeToUserRecord$2,
  subscribeToUsers: subscribeToUsers$2
}, Symbol.toStringTag, { value: "Module" }));
function docToUser(doc2) {
  const data = structuredClone(doc2);
  const record = { ...data };
  record.role = data.role ?? USER_ROLES.editor;
  record.disabled = !!data.disabled;
  const createdAt = toTimestamp(data.createdAt);
  if (createdAt) record.createdAt = createdAt;
  else delete record.createdAt;
  return record;
}
function userToDoc(record) {
  const { createdAt, ...rest } = record;
  return { ...rest, createdAt: toMillis(createdAt) };
}
function readUser(uid) {
  const doc2 = getDocStore().get("users", uid);
  return doc2 ? docToUser(doc2) : null;
}
function listUsers() {
  return getDocStore().list("users").map(docToUser).sort((a, b) => (a.email ?? "").localeCompare(b.email ?? ""));
}
async function writeUser(record, message) {
  await getDocStore().write([{ op: "set", collection: "users", doc: userToDoc(record) }], { message });
}
function watchUsers(read, onChange, onError) {
  const store = getDocStore();
  let active = true;
  let loaded = false;
  const emit = () => {
    if (!active || !loaded) return;
    try {
      onChange(read());
    } catch (err) {
      onError?.(err);
    }
  };
  const unsub = store.subscribe((changed) => {
    if (changed.has("users")) emit();
  });
  store.ready().then(
    () => {
      loaded = true;
      emit();
    },
    (err) => {
      if (active) onError?.(err);
    }
  );
  return () => {
    active = false;
    unsub();
  };
}
function subscribeToUsers$1(onChange, onError) {
  return watchUsers(listUsers, onChange, onError);
}
async function getUserRecord$1(uid) {
  await getDocStore().ready();
  return readUser(uid);
}
function subscribeToUserRecord$1(uid, onChange, onError) {
  return watchUsers(() => readUser(uid), onChange, onError);
}
const ensuring = /* @__PURE__ */ new Map();
function ensureSelfUserRecord$1(authUser) {
  const pending = ensuring.get(authUser.uid);
  if (pending) return pending;
  const run = ensureSelfUserRecordNow(authUser).finally(() => ensuring.delete(authUser.uid));
  ensuring.set(authUser.uid, run);
  return run;
}
async function ensureSelfUserRecordNow(authUser) {
  const store = getDocStore();
  await store.ready();
  const identity = await store.identity();
  const existing = readUser(authUser.uid);
  const role = identity && identity.uid === authUser.uid ? identity.role : existing?.role ?? USER_ROLES.editor;
  const email = (authUser.email ?? "").toLowerCase();
  if (existing) {
    if (existing.email === email && existing.role === role) return existing;
    const next = { ...existing, email, role };
    await writeUser(next, `Update user ${email || authUser.uid}`);
    return readUser(authUser.uid) ?? next;
  }
  const created = {
    id: authUser.uid,
    email,
    role,
    disabled: false,
    preferences: { adminLocale: "en" },
    createdAt: toTimestamp(Date.now()),
    createdBy: authUser.uid
  };
  if (authUser.displayName) created.displayName = authUser.displayName;
  await writeUser(created, `Add user ${email || authUser.uid}`);
  return readUser(authUser.uid) ?? created;
}
async function setUserRole$1(uid, role) {
  if (role !== USER_ROLES.admin && role !== USER_ROLES.editor) {
    throw new Error("Invalid role.");
  }
  await getDocStore().ready();
  const current = readUser(uid);
  if (!current) throw new Error(`User ${uid} not found.`);
  if (current.role === role) return;
  await writeUser({ ...current, role }, `Set role of ${current.email || uid} to ${role}`);
}
async function setUserDisabled$1(uid, disabled) {
  await getDocStore().ready();
  const current = readUser(uid);
  if (!current) throw new Error(`User ${uid} not found.`);
  if (current.disabled === Boolean(disabled)) return;
  await writeUser(
    { ...current, disabled: Boolean(disabled) },
    `${disabled ? "Disable" : "Enable"} user ${current.email || uid}`
  );
}
async function setUserPreferences$1(uid, prefs) {
  if (!prefs.adminLocale) return;
  await getDocStore().ready();
  const current = readUser(uid);
  if (!current) return;
  const base = current.preferences ?? { adminLocale: "en" };
  if (base.adminLocale === prefs.adminLocale && current.preferences) return;
  await writeUser(
    { ...current, preferences: { ...base, adminLocale: prefs.adminLocale } },
    `Update preferences of ${current.email || uid}`
  );
}
async function setUserProfile$1(uid, patch) {
  await getDocStore().ready();
  const current = readUser(uid);
  if (!current) throw new Error(`User ${uid} not found.`);
  const next = { ...current };
  let touched = false;
  for (const key of ["firstName", "lastName", "title", "bio", "avatarMediaId"]) {
    if (!(key in patch)) continue;
    touched = true;
    const value = patch[key];
    if (value === null || value === void 0 || value === "") delete next[key];
    else next[key] = value;
  }
  if ("socials" in patch) {
    touched = true;
    const value = patch.socials;
    const cleaned = {};
    for (const [network, entry] of Object.entries(value ?? {})) {
      if (entry && typeof entry.url === "string" && entry.url.trim().length > 0) {
        cleaned[network] = { url: entry.url.trim(), visible: !!entry.visible };
      }
    }
    if (Object.keys(cleaned).length > 0) next.socials = cleaned;
    else delete next.socials;
  }
  if (!touched) return;
  await writeUser(next, `Update profile of ${current.email || uid}`);
}
async function deleteUserRecord$1(uid) {
  await getDocStore().ready();
  const current = readUser(uid);
  if (!current) return;
  await getDocStore().write([{ op: "delete", collection: "users", id: uid }], {
    message: `Remove user ${current.email || uid}`
  });
}
async function syncUsersFromApi() {
  await getDocStore().ready();
  return listUsers();
}
const docstore = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  USER_ROLES,
  buildAuthorLookup: buildAuthorLookup$1,
  deleteUserRecord: deleteUserRecord$1,
  ensureSelfUserRecord: ensureSelfUserRecord$1,
  getUserRecord: getUserRecord$1,
  resolveDisplayName: resolveDisplayName$1,
  resolvePublicDisplayName: resolvePublicDisplayName$1,
  setUserDisabled: setUserDisabled$1,
  setUserPreferences: setUserPreferences$1,
  setUserProfile: setUserProfile$1,
  setUserRole: setUserRole$1,
  subscribeToUserRecord: subscribeToUserRecord$1,
  subscribeToUsers: subscribeToUsers$1,
  syncUsersFromApi
}, Symbol.toStringTag, { value: "Module" }));
let _impl = null;
function impl() {
  if (!_impl) {
    const kind = getBackendKind();
    _impl = isDocStoreBackend(kind) ? docstore : firebase;
  }
  return _impl;
}
function subscribeToUsers(...args) {
  return impl().subscribeToUsers(...args);
}
function getUserRecord(...args) {
  return impl().getUserRecord(...args);
}
function subscribeToUserRecord(...args) {
  return impl().subscribeToUserRecord(...args);
}
function ensureSelfUserRecord(...args) {
  return impl().ensureSelfUserRecord(...args);
}
function setUserRole(...args) {
  return impl().setUserRole(...args);
}
function setUserDisabled(...args) {
  return impl().setUserDisabled(...args);
}
function setUserPreferences(...args) {
  return impl().setUserPreferences(...args);
}
function setUserProfile(...args) {
  return impl().setUserProfile(...args);
}
function resolveDisplayName(...args) {
  return impl().resolveDisplayName(...args);
}
function resolvePublicDisplayName(...args) {
  return impl().resolvePublicDisplayName(...args);
}
function deleteUserRecord(...args) {
  return impl().deleteUserRecord(...args);
}
function buildAuthorLookup(...args) {
  return impl().buildAuthorLookup(...args);
}
const users = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  USER_ROLES,
  buildAuthorLookup,
  deleteUserRecord,
  ensureSelfUserRecord,
  getUserRecord,
  resolveDisplayName,
  resolvePublicDisplayName,
  setUserDisabled,
  setUserPreferences,
  setUserProfile,
  setUserRole,
  subscribeToUserRecord,
  subscribeToUsers
}, Symbol.toStringTag, { value: "Module" }));
export {
  HOME_PATH as H,
  NOT_FOUND_PATH as N,
  SOCIAL_NETWORKS as S,
  buildPostUrl as a,
  buildTermUrl as b,
  canonicalUrl as c,
  buildAuthorUrl as d,
  pathToPublicUrl as e,
  slugify as f,
  findAvailableSlug as g,
  buildAuthorLookup as h,
  isValidSlug as i,
  pickMediaUrl as j,
  detectTermSlugCollision as k,
  detectPathCollision as l,
  mediaToView as m,
  normalizeMediaSlug as n,
  canonicalPath as o,
  pickFormat as p,
  resolvePublicDisplayName as r,
  subscribeToUsers as s,
  users as u
};
