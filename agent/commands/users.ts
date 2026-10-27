import type { AdminLocale, SocialEntry, SocialNetwork, UserRecord } from "../../src/core/types";
import type { UserProfilePatch } from "../../src/services/users";
import type { SiteSession } from "../ops/session";
import { CliError } from "../output";
import type { Command, CommandContext } from "./types";

// `agentcms users …` — the admin's Users page (+ the profile's admin
// language): list / get, update a public author profile (then the same
// cascade as the profile modal: data/authors.json, and the author's
// archive page when they have online entries), role, disable / enable,
// delete the record (plan first), locale (the signed-in user's admin
// language).
//
// Backends: Firebase accounts live in Firebase Auth (records appear at
// first sign-in, deleting a record leaves the account); Markdown in git
// accounts are repository collaborators (the stored role of others is
// informational, their repo permission decides); a SQLite file / local
// store has no accounts (one implicit admin) — role / disable don't
// apply there.

const LOCALES: AdminLocale[] = ["en", "fr", "de", "es", "nl", "pt", "ko"];
const NETWORKS: SocialNetwork[] = ["twitter", "linkedin", "instagram", "mastodon", "bluesky", "github", "website"];

async function backend(): Promise<string> {
  const { getBackendKind } = await import("../../src/lib/runtimeConfig");
  return getBackendKind() ?? "unknown";
}

function summarize(u: UserRecord, entries: Array<{ authorId: string; status: string }>) {
  const own = entries.filter((p) => p.authorId === u.id);
  return {
    id: u.id,
    email: u.email,
    firstName: u.firstName ?? null,
    lastName: u.lastName ?? null,
    title: u.title ?? null,
    // The name shown on posts and the author page: first + last name,
    // else the account's display name. Empty = posts show no byline.
    publicName: [u.firstName, u.lastName].filter((x) => x && x.trim()).join(" ").trim() || u.displayName?.trim() || null,
    role: u.role,
    disabled: !!u.disabled,
    posts: own.length,
    onlinePosts: own.filter((p) => p.status === "online").length,
  };
}

function detail(u: UserRecord, entries: Array<{ authorId: string; status: string }>) {
  return {
    ...summarize(u, entries),
    displayName: u.displayName ?? null,
    bio: u.bio ?? null,
    avatarMediaId: u.avatarMediaId ?? null,
    socials: u.socials ?? {},
    adminLocale: u.preferences?.adminLocale ?? null,
  };
}

async function allEntries() {
  const { fetchAllPosts, invalidateAllPostsCache } = await import("../../src/services/posts");
  invalidateAllPostsCache();
  const [posts, pages] = await Promise.all([fetchAllPosts({ type: "post" }), fetchAllPosts({ type: "page" })]);
  return { posts, pages, all: [...posts, ...pages] };
}

// The signed-in identity as the Firebase-shaped user AuthContext hands
// to ensureSelfUserRecord.
async function selfAuthUser(): Promise<{ uid: string; email: string | null; displayName: string | null }> {
  const { isDocStoreBackend, getBackendKind } = await import("../../src/lib/runtimeConfig");
  if (isDocStoreBackend(getBackendKind())) {
    const { getDocStore } = await import("../../src/services/docstore");
    const id = await getDocStore().identity();
    if (!id) throw new CliError("not-signed-in", "The site's content store did not identify a user.");
    return { uid: id.uid, email: id.email, displayName: id.displayName };
  }
  const { getAuthClient } = await import("../../src/services/firebaseClient");
  const u = getAuthClient().currentUser;
  if (!u) throw new CliError("not-signed-in", "Not signed in to Firebase.");
  return { uid: u.uid, email: u.email, displayName: u.displayName };
}

// What the admin's sign-in does: create / refresh the signed-in user's
// own record (writes nothing when it is current).
async function ensureSelf(): Promise<string> {
  const me = await selfAuthUser();
  const { ensureSelfUserRecord } = await import("../../src/services/users");
  await ensureSelfUserRecord(me as unknown as Parameters<typeof ensureSelfUserRecord>[0]);
  return me.uid;
}

function findUser(users: UserRecord[], ref: string, selfId: string | null): UserRecord {
  const id = ref === "me" ? selfId : ref;
  const u = users.find((x) => x.id === id) ?? users.find((x) => x.email && x.email.toLowerCase() === ref.toLowerCase());
  if (!u) {
    throw new CliError(
      "not-found",
      ref === "me" ? "The signed-in user has no record on this site yet." : `No user "${ref}".`,
      ref === "me" ? "Any write command (e.g. `users update me …` or `users locale <code>`) creates it, like the admin's first sign-in." : "List them with `agentcms users list`.",
      2,
    );
  }
  return u;
}

function parseSocials(value: string): Partial<Record<SocialNetwork, SocialEntry | null>> {
  const out: Partial<Record<SocialNetwork, SocialEntry | null>> = {};
  for (const item of value.split(/\s+/).filter(Boolean)) {
    const eq = item.indexOf("=");
    const network = (eq < 0 ? item : item.slice(0, eq)) as SocialNetwork;
    if (!NETWORKS.includes(network)) throw new CliError("usage", `--social: unknown network "${network}".`, `Networks: ${NETWORKS.join(", ")}.`, 2);
    let rest = eq < 0 ? "" : item.slice(eq + 1);
    let visible = true;
    const flag = /,(visible|hidden)$/.exec(rest);
    if (flag) {
      visible = flag[1] === "visible";
      rest = rest.slice(0, -flag[0].length);
    }
    out[network] = rest ? { url: rest, visible } : null;
  }
  return out;
}

// Profile fields from flags and/or --data (flags win). Only the fields
// given are changed.
async function readProfile(options: CommandContext["options"], current: UserRecord): Promise<UserProfilePatch> {
  const { readJsonOption, readTextOption } = await import("../ops/adminCommon");
  const data = (readJsonOption(options.data, "data") ?? {}) as Record<string, unknown>;
  if (typeof data !== "object" || Array.isArray(data)) throw new CliError("usage", "--data must be a JSON object.", undefined, 2);
  const patch: UserProfilePatch = {};
  const pick = (flag: string, key: "firstName" | "lastName" | "title" | "bio" | "avatarMediaId", text = false) => {
    const v = options[flag] !== undefined ? (text ? readTextOption(options[flag], flag) : String(options[flag])) : data[key];
    if (v === undefined) return;
    patch[key] = v === null || v === "" ? null : String(v).trim() || null;
  };
  pick("first-name", "firstName");
  pick("last-name", "lastName");
  pick("title", "title");
  pick("bio", "bio", true);
  pick("avatar", "avatarMediaId");
  if (data.socials !== undefined) {
    // --data socials: the full map, like the profile form.
    if (data.socials !== null && (typeof data.socials !== "object" || Array.isArray(data.socials))) throw new CliError("usage", "--data socials must be an object { network: { url, visible } }.", undefined, 2);
    patch.socials = (data.socials ?? null) as UserProfilePatch["socials"];
  }
  if (options.social !== undefined) {
    // --social: merged into the current map ("network=" removes one).
    const base: Partial<Record<SocialNetwork, SocialEntry>> = { ...((patch.socials ?? current.socials) ?? {}) };
    for (const [network, entry] of Object.entries(parseSocials(String(options.social))) as Array<[SocialNetwork, SocialEntry | null]>) {
      if (entry) base[network] = entry;
      else delete base[network];
    }
    patch.socials = base;
  }
  return patch;
}

function refuseNoAccounts(kind: string, what: string): void {
  if (kind === "sqlite-file" || kind === "local") {
    throw new CliError(
      "unsupported-backend",
      `${what} doesn't apply to this site: its ${kind === "sqlite-file" ? "SQLite file" : "local store"} has no accounts — whoever can open it is the admin.`,
      kind === "sqlite-file" ? "Control access through who holds the hosting credentials (and the passphrase)." : undefined,
      2,
    );
  }
}

async function run({ io, options, positionals }: CommandContext): Promise<number | void> {
  const [action, ...refs] = positionals;
  const { runAdmin } = await import("../ops/adminCommon");
  const alias = options.site as string | undefined;
  const writeOpen = { write: true, lock: true };

  const loadUsers = async (s: SiteSession) => s.users();

  switch (action) {
    case "list":
      return runAdmin(io, alias, {}, async (s) => {
        const [users, { all }, me, kind] = await Promise.all([loadUsers(s), allEntries(), selfAuthUser(), backend()]);
        return {
          backend: kind,
          you: { id: me.uid, email: me.email, hasRecord: users.some((u) => u.id === me.uid) },
          users: users.map((u) => summarize(u, all)),
        };
      }, (r) =>
        [
          ...(r.users.length
            ? r.users.map((u) => `${u.id}  ${u.email.padEnd(28)} ${u.role.padEnd(6)}${u.disabled ? " disabled" : ""}  ${[u.firstName, u.lastName].filter(Boolean).join(" ")}  (${u.posts} entries)`)
            : ["No user records."]),
          `Signed in as ${r.you.email ?? r.you.id}${r.you.hasRecord ? "" : " (no record yet — created by the first write, like the admin's first sign-in)"}.`,
        ].join("\n"));

    case "get": {
      const ref = refs[0] ?? "me";
      return runAdmin(io, alias, {}, async (s) => {
        const [users, { all }, me] = await Promise.all([loadUsers(s), allEntries(), selfAuthUser()]);
        if (ref === "me" && !users.some((u) => u.id === me.uid)) {
          // A fresh site: the profile is created at the first write (the
          // admin creates it at sign-in). Reading must not fail.
          const own = all.filter((p) => p.authorId === me.uid);
          return {
            id: me.uid,
            email: me.email ?? "",
            hasRecord: false,
            firstName: null,
            lastName: null,
            title: null,
            publicName: me.displayName ?? null,
            role: null,
            disabled: false,
            posts: own.length,
            onlinePosts: own.filter((p) => p.status === "online").length,
            bio: null,
            avatarMediaId: null,
            socials: {},
            note: "No profile stored yet. `agentcms users update me --first-name … --last-name … --bio …` creates it.",
          };
        }
        return { ...detail(findUser(users, ref, me.uid), all), hasRecord: true };
      }, (u) => `${u.email} (${u.id})${u.role ? ` — ${u.role}` : ""}${u.disabled ? ", disabled" : ""}\n${[u.firstName, u.lastName].filter(Boolean).join(" ")}${u.title ? `, ${u.title}` : ""}${u.bio ? `\n${u.bio}` : ""}${"note" in u && u.note ? `\n${u.note}` : ""}`);
    }

    case "update": {
      const ref = refs[0];
      if (!ref) throw new CliError("usage", "users update needs a user id, email or \"me\".", undefined, 2);
      return runAdmin(io, alias, { write: true, hosting: true, extensions: true, lock: true }, async (s) => {
        const selfId = await ensureSelf();
        const users = await loadUsers(s);
        const user = findUser(users, ref, selfId);
        const patch = await readProfile(options, user);
        if (!Object.keys(patch).length) throw new CliError("usage", "Nothing to change.", "Pass --first-name, --last-name, --title, --bio, --avatar, --social or --data.", 2);
        const media = await s.media();
        if (patch.avatarMediaId && !media.some((m) => m.id === patch.avatarMediaId)) {
          throw new CliError("not-found", `No media "${patch.avatarMediaId}".`, "Upload it with `agentcms media upload` and pass its id (\"\" removes the avatar).", 2);
        }
        const { setUserProfile, getUserRecord, buildAuthorLookup } = await import("../../src/services/users");
        await setUserProfile(user.id, patch);
        // The profile modal's cascade, on the fresh record.
        const fresh = (await getUserRecord(user.id)) ?? user;
        const nextUsers = users.map((u) => (u.id === user.id ? fresh : u));
        const { posts, pages, all } = await allEntries();
        const published: string[] = [];
        const { withStorageBatch } = await import("../../src/services/siteFiles");
        await withStorageBatch(async () => {
          const { publishAuthorsJson, AUTHORS_JSON_PATH } = await import("../../src/services/authorsJsonPublisher");
          try {
            await publishAuthorsJson(nextUsers, media, posts, pages);
            published.push(AUTHORS_JSON_PATH);
          } catch (err) {
            s.log({ level: "error", message: `authors.json refresh failed: ${(err as Error).message}` });
          }
          if (all.some((p) => p.status === "online" && p.authorId === user.id)) {
            try {
              const ctx = await s.host.publisher.buildPublishContext({
                terms: await s.terms(),
                settings: s.settings(),
                users: nextUsers,
                authorLookup: buildAuthorLookup(nextUsers, media),
              });
              await s.host.publisher.publishAuthorArchive(user.id, ctx, s.log);
              const { buildAuthorUrl } = await import("../../src/core/slug");
              published.push(buildAuthorUrl(fresh, nextUsers));
            } catch (err) {
              s.log({ level: "error", message: `Author archive refresh failed: ${(err as Error).message}` });
            }
          }
        });
        // Like the admin's profile modal: the author page and authors.json
        // are refreshed, but names baked into other pages (bylines, home
        // cards) and links to the author page wait for a regeneration.
        const named = ["firstName", "lastName"].some((k) => k in patch) && all.some((p) => p.status === "online" && p.authorId === user.id);
        return { ...detail(fresh, all), changed: Object.keys(patch), published, next: named ? [`agentcms regenerate all --site ${s.site.alias}`] : [] };
      }, (r) => `Updated ${r.email}: ${r.changed.join(", ")}${r.published.length ? ` — republished ${r.published.join(", ")}` : ""}`);
    }

    case "role": {
      const [ref, role] = refs;
      if (!ref || (role !== "admin" && role !== "editor")) throw new CliError("usage", "users role <id|email> admin|editor", undefined, 2);
      return runAdmin(io, alias, writeOpen, async (s) => {
        const kind = await backend();
        refuseNoAccounts(kind, "A role");
        const selfId = await ensureSelf();
        const user = findUser(await loadUsers(s), ref, selfId);
        const { setUserRole } = await import("../../src/services/users");
        await setUserRole(user.id, role);
        return {
          id: user.id,
          email: user.email,
          role,
          note: kind === "markdown-git" ? "Informational on Markdown-in-git sites: the effective role follows the account's repository permission (admin = repo admin) at its next sign-in." : null,
        };
      }, (r) => `${r.email} is now ${r.role}.${r.note ? `\n${r.note}` : ""}`);
    }

    case "disable":
    case "enable": {
      const ref = refs[0];
      if (!ref) throw new CliError("usage", `users ${action} needs a user id or email.`, undefined, 2);
      return runAdmin(io, alias, writeOpen, async (s) => {
        const kind = await backend();
        refuseNoAccounts(kind, "Disabling an account");
        const selfId = await ensureSelf();
        const user = findUser(await loadUsers(s), ref, selfId);
        const { setUserDisabled } = await import("../../src/services/users");
        await setUserDisabled(user.id, action === "disable");
        return {
          id: user.id,
          email: user.email,
          disabled: action === "disable",
          note: kind === "markdown-git" ? "The admin refuses a disabled user; their repository access is unchanged (remove them from the repo to revoke it)." : null,
        };
      }, (r) => `${r.email} ${r.disabled ? "disabled" : "enabled"}.${r.note ? `\n${r.note}` : ""}`);
    }

    case "delete": {
      const ref = refs[0];
      if (!ref) throw new CliError("usage", "users delete needs a user id or email.", undefined, 2);
      const noteFor = (kind: string) =>
        kind === "firebase"
          ? "Only the user record is removed: the Firebase Auth account stays (delete it in the Firebase Console), and signing in again recreates the record."
          : kind === "markdown-git"
            ? "Only the user record is removed: the account keeps its repository access, and signing in again recreates the record."
            : "Only the user record is removed (this site has no accounts).";
      if (!options.yes) {
        return runAdmin(io, alias, {}, async (s) => {
          const [users, { all }, me, kind] = await Promise.all([loadUsers(s), allEntries(), selfAuthUser(), backend()]);
          const user = findUser(users, ref, me.uid);
          return { needsConfirmation: true, delete: summarize(user, all), note: noteFor(kind) };
        }, (r) => `Would delete the record of ${r.delete.email} (${r.delete.posts} entries keep them as author). ${r.note}\nNothing changed — re-run with --yes once the user agrees.`);
      }
      return runAdmin(io, alias, writeOpen, async (s) => {
        const kind = await backend();
        const me = await selfAuthUser();
        const user = findUser(await loadUsers(s), ref, me.uid);
        const { deleteUserRecord } = await import("../../src/services/users");
        await deleteUserRecord(user.id);
        return { id: user.id, email: user.email, deleted: true, note: noteFor(kind) };
      }, (r) => `Deleted the record of ${r.email}. ${r.note}`);
    }

    case "locale": {
      const code = refs[0] as AdminLocale | undefined;
      if (!code || !LOCALES.includes(code)) throw new CliError("usage", "users locale <code>", `The admin's languages: ${LOCALES.join(", ")}.`, 2);
      return runAdmin(io, alias, writeOpen, async () => {
        const selfId = await ensureSelf();
        const { setUserPreferences, getUserRecord } = await import("../../src/services/users");
        await setUserPreferences(selfId, { adminLocale: code });
        const rec = await getUserRecord(selfId);
        return { id: selfId, email: rec?.email ?? null, adminLocale: rec?.preferences?.adminLocale ?? code };
      }, (r) => `Admin language of ${r.email ?? r.id}: ${r.adminLocale} (applies at the next admin load).`);
    }

    default:
      throw new CliError("usage", action ? `Unknown users action "${action}".` : "users needs an action.", "Actions: list, get, update, role, disable, enable, delete, locale.", 2);
  }
}

export const usersCommand: Command = {
  name: "users",
  summary:
    "The Users page: list, get [<id|email|me>], update <id|email|me> (public author profile; republishes data/authors.json and the author's archive), role <id|email> admin|editor, disable / enable <id|email>, delete <id|email> (the record only; plan first, --yes), locale <code> (the signed-in user's admin language).",
  usage:
    "users <list|get|update|role|disable|enable|delete|locale> [<id|email|me>] [admin|editor|<locale>] --site <alias> [--first-name <t>] [--last-name <t>] [--title <t>] [--bio <text>|@file|-] [--avatar <media id>|\"\"] [--social \"<network>=<url>[,hidden] …\"] [--data <json>|@file] [--yes]",
  options: [
    { name: "site", type: "string", description: "Site alias." },
    { name: "first-name", type: "string", description: "update: first name (\"\" clears)." },
    { name: "last-name", type: "string", description: "update: last name (\"\" clears)." },
    { name: "title", type: "string", description: "update: job title shown under the name (\"\" clears)." },
    { name: "bio", type: "string", description: "update: bio — text, @file, or - for stdin (\"\" clears)." },
    { name: "avatar", type: "string", description: "update: avatar media id (\"\" removes it)." },
    {
      name: "social",
      type: "string",
      description: `update: space-separated network=url entries merged into the profile (",hidden" keeps it off the public page, "network=" removes it). Networks: ${NETWORKS.join(", ")}. Repeatable.`,
      multiple: true,
    },
    { name: "data", type: "string", description: "update: fields as JSON (or @file.json): firstName, lastName, title, bio, avatarMediaId, socials { network: { url, visible } } (replaces all). Flags override it." },
    { name: "yes", type: "boolean", description: "delete: apply (otherwise only the plan)." },
  ],
  run,
};
