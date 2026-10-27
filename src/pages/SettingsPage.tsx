import { useEffect, useState } from "react";
import {
  AlertTriangle,
  Database,
  Download,
  Flame,
  GitBranch,
  HardDrive,
  Loader2,
  RefreshCw,
  Upload,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { useAuth } from "../context/AuthContext";
import { useCmsData } from "../context/CmsDataContext";
import { useAllPosts } from "../hooks/useAllPosts";
import { setActiveLocale, SUPPORTED_LOCALES, LOCALE_LABELS, pickPublicLocale } from "../i18n";
import { PublishTargetForm } from "../components/connectors/PublishTargetForm";
import { hostingOptionFor } from "../components/connectors/hostingOptions";
import { readPublishTarget, savePublishTarget, targetSiteUrl, type PublishTarget } from "../services/storage/target";
import { canImportContent, exportContent, importContent, isContentExport } from "../services/contentTransfer";
import {
  adminUrlOn,
  currentAdminFolderOn,
  DEFAULT_ADMIN_FOLDER,
  deployAdmin,
  readAdminManifest,
  uploadConfigJsTo,
} from "../services/adminDeploy";
import { getDocStore } from "../services/docstore";
import { generatePassphrase } from "../services/docstore/sqliteCrypto";
import type { SqliteFileDocStore } from "../services/docstore/sqliteFileStore";
import { updateSettings } from "../services/settings";
import { setUserPreferences } from "../services/users";
import { invalidateCachedReady } from "../services/firestoreSetup";
import { toast } from "../lib/toast";
import {
  getBackendKind,
  getRuntimeConfig,
  LOCAL_RUNTIME_CONFIG_KEY,
  resetRuntimeConfigCache,
  saveLocalRuntimeConfig,
} from "../lib/runtimeConfig";
import { EDITOR_FONT_OPTIONS, DEFAULT_EDITOR_SIZES, SYSTEM_FONT_NAME } from "../core/editorFonts";
import { FontSelect } from "../components/ui/FontSelect";
import type { AdminLocale, EditorStyle, PaginationMode } from "../core/types";

// Renders the "General" tab inside <SettingsLayout />. Outer page chrome
// (title + tab strip) lives in the layout, so this component is just the
// content sections.
export function SettingsPage() {
  const { t } = useTranslation();
  const { user, record, isAdmin } = useAuth();
  const { settings } = useCmsData();
  const backend = getBackendKind();
  // The home-page picker needs the full pages list. Loaded on mount
  // — the picker is the only place this list is needed on this page.
  const { posts: pages } = useAllPosts("page");

  // Site
  const [title, setTitle] = useState(settings.title);
  const [description, setDescription] = useState(settings.description);
  const [language, setLanguage] = useState(settings.language);
  const [baseUrl, setBaseUrl] = useState(settings.baseUrl);
  const [postsPerPage, setPostsPerPage] = useState(settings.postsPerPage);
  const [homeMode, setHomeMode] = useState(settings.homeMode);
  const [homePageId, setHomePageId] = useState(settings.homePageId ?? "");
  const [discourageIndexing, setDiscourageIndexing] = useState(
    settings.discourageIndexing === true,
  );
  const [savingSite, setSavingSite] = useState(false);

  // Sync local edits when the underlying doc changes (other admins editing,
  // first load, etc.).
  useEffect(() => {
    setTitle(settings.title);
    setDescription(settings.description);
    setLanguage(settings.language);
    setBaseUrl(settings.baseUrl);
    setPostsPerPage(settings.postsPerPage);
    setHomeMode(settings.homeMode);
    setHomePageId(settings.homePageId ?? "");
    setDiscourageIndexing(settings.discourageIndexing === true);
  }, [settings]);

  async function saveSite() {
    setSavingSite(true);
    const indexingChanged = (settings.discourageIndexing === true) !== discourageIndexing;
    try {
      await updateSettings({
        title,
        description,
        language,
        baseUrl,
        postsPerPage,
        homeMode,
        homePageId: homeMode === "static-page" ? homePageId || undefined : undefined,
        discourageIndexing,
      });
      // Toggling the indexing gate requires re-rendering every
      // online page (the `<meta name="robots">` is baked at publish
      // time) AND the robots.txt. Surface a strong call-to-action
      // toast so the user knows to run "Regenerate all" in
      // /admin/#/themes — auto-triggering it here would be a heavy
      // side effect of a settings save and is undesirable on big
      // sites without an explicit user click.
      if (indexingChanged) {
        toast.info(t("settings.site.discourageRegenerateHint"));
      }
    } finally {
      setSavingSite(false);
    }
  }

  // Publish target — loaded separately from the settings doc (it lives
  // in config/storage).
  const [target, setTarget] = useState<PublishTarget | null>(null);
  const [savingTarget, setSavingTarget] = useState(false);

  useEffect(() => {
    void readPublishTarget().then(setTarget);
  }, []);

  async function saveTarget() {
    if (!target) return;
    setSavingTarget(true);
    try {
      await savePublishTarget(target);
      toast.success(t("connectors.saved"));
    } finally {
      setSavingTarget(false);
    }
  }

  // Profile (admin language for *this* user)
  async function changeAdminLocale(locale: AdminLocale) {
    await setActiveLocale(locale);
    if (user && record) await setUserPreferences(user.uid, { adminLocale: locale });
  }

  // Performance — choose how the admin loads posts / pages. The
  // default "global" requires NO Firestore composite indexes; the
  // "paginated" opt-in requires the (type, createdAt) and (type,
  // status, createdAt) indexes documented in the README.
  const [paginationMode, setPaginationMode] = useState<PaginationMode>(
    settings.paginationMode ?? "global",
  );
  const [savingPagination, setSavingPagination] = useState(false);

  useEffect(() => {
    setPaginationMode(settings.paginationMode ?? "global");
  }, [settings.paginationMode]);

  async function savePagination() {
    setSavingPagination(true);
    try {
      // The cached "indexes ready" flag is only meaningful for paginated
      // mode. Wipe it on every save so the gate re-pings with fresh
      // truth — particularly important when the user flips to paginated
      // for the first time.
      invalidateCachedReady();
      await updateSettings({ paginationMode });
      toast.info(t("settings.performance.savedReload"));
    } finally {
      setSavingPagination(false);
    }
  }

  // Editor typography. Stored alongside other site settings so the
  // hook that injects the styles into the post editor reads them
  // through the same Firestore subscription that drives CmsDataContext
  // — changes propagate without needing a refresh.
  const [editorStyle, setEditorStyle] = useState<EditorStyle>(settings.editorStyle ?? {});
  const [savingEditor, setSavingEditor] = useState(false);

  useEffect(() => {
    setEditorStyle(settings.editorStyle ?? {});
  }, [settings.editorStyle]);

  function patchEditorStyle(patch: Partial<EditorStyle>) {
    setEditorStyle((prev) => ({ ...prev, ...patch }));
  }

  async function saveEditorStyle() {
    setSavingEditor(true);
    try {
      // Trim empties to undefined so the doc stays clean (no
      // "fontFamily: ''" leftovers). Defaults kick in via the hook.
      const clean: EditorStyle = {};
      if (editorStyle.fontFamily) clean.fontFamily = editorStyle.fontFamily;
      if (editorStyle.bodySize?.trim()) clean.bodySize = editorStyle.bodySize.trim();
      if (editorStyle.h1Size?.trim()) clean.h1Size = editorStyle.h1Size.trim();
      if (editorStyle.h2Size?.trim()) clean.h2Size = editorStyle.h2Size.trim();
      if (editorStyle.h3Size?.trim()) clean.h3Size = editorStyle.h3Size.trim();
      await updateSettings({
        editorStyle: Object.keys(clean).length > 0 ? clean : undefined,
      });
    } finally {
      setSavingEditor(false);
    }
  }

  function resetEditorStyle() {
    setEditorStyle({});
  }

  return (
    <div className="space-y-6">
      {/* Profile section is intentionally minimal — name / bio / avatar
          live on /users (per-row Edit modal), where admins can manage
          any user and non-admins manage their own. The admin language
          stays here because it's a per-user *UI* preference, not a
          public profile field. */}
      <section className="card p-4 space-y-3">
        <h2 className="font-semibold">{t("settings.profile.title")}</h2>
        <div>
          <label className="label">{t("settings.profile.adminLocale")}</label>
          <select
            className="input max-w-xs"
            value={record?.preferences?.adminLocale ?? "en"}
            onChange={(e) => changeAdminLocale(e.target.value as AdminLocale)}
          >
            {SUPPORTED_LOCALES.map((locale) => (
              <option key={locale} value={locale}>
                {LOCALE_LABELS[locale]}
              </option>
            ))}
          </select>
          <p className="text-xs text-surface-500 mt-1 dark:text-surface-400">
            {t("settings.profile.adminLocaleHelp")}
          </p>
        </div>
      </section>

      <section className="card p-4 space-y-3">
        <h2 className="font-semibold">{t("settings.site.title")}</h2>
        <div>
          <label className="label">{t("settings.site.siteTitle")}</label>
          <input className="input" value={title} onChange={(e) => setTitle(e.target.value)} />
        </div>
        <div>
          <label className="label">{t("settings.site.siteDescription")}</label>
          <textarea
            className="input min-h-[60px]"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>
        <div>
          <label className="label">{t("settings.site.siteLanguage")}</label>
          <input
            className="input max-w-xs"
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            placeholder="en, fr, fr-FR…"
          />
          <p className="text-xs text-surface-500 mt-1 dark:text-surface-400">
            {t("settings.site.siteLanguageHelp")}
          </p>
          {/* Live preview: shows which translation bundle the public-side
              labels (sitemap viewer, RSS viewer, theme baked-in strings)
              will resolve to. Helps the user understand that `fr-CA`
              picks the `fr` bundle, while an unsupported locale falls
              back to `en`. */}
          <p className="text-xs text-surface-500 mt-1 dark:text-surface-400">
            {t("settings.site.siteLanguageResolved", {
              label: LOCALE_LABELS[pickPublicLocale(language)],
            })}
          </p>
        </div>
        <div>
          <label className="label">{t("settings.site.baseUrl")}</label>
          <input
            className="input"
            value={baseUrl}
            onChange={(e) => setBaseUrl(e.target.value)}
            placeholder="https://www.example.com"
          />
        </div>
        <div>
          <label className="label">{t("settings.site.postsPerPage")}</label>
          <input
            className="input max-w-xs"
            type="number"
            min={1}
            value={postsPerPage}
            onChange={(e) => setPostsPerPage(Number.parseInt(e.target.value, 10) || 1)}
          />
        </div>
        <div>
          <label className="label">{t("settings.site.homeMode")}</label>
          <select className="input max-w-xs" value={homeMode} onChange={(e) => setHomeMode(e.target.value as typeof homeMode)}>
            <option value="latest-posts">{t("settings.site.homeLatest")}</option>
            <option value="static-page">{t("settings.site.homeStatic")}</option>
          </select>
        </div>
        {homeMode === "static-page" && (
          <div>
            <label className="label">{t("settings.site.homePage")}</label>
            <select
              className="input max-w-xs"
              value={homePageId}
              onChange={(e) => setHomePageId(e.target.value)}
            >
              <option value="">—</option>
              {pages.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.title}
                </option>
              ))}
            </select>
          </div>
        )}
        <div className="border-t border-surface-200 dark:border-surface-700 pt-3 mt-2">
          <label className="flex items-start gap-2 text-sm cursor-pointer">
            <input
              type="checkbox"
              className="mt-0.5"
              checked={discourageIndexing}
              onChange={(e) => setDiscourageIndexing(e.target.checked)}
            />
            <span>
              <span className="font-medium">
                {t("settings.site.discourageIndexing")}
              </span>
              <span className="block text-xs text-surface-500 dark:text-surface-400 mt-0.5">
                {t("settings.site.discourageIndexingHelp")}
              </span>
            </span>
          </label>
        </div>
        <button type="button" className="btn-primary" onClick={saveSite} disabled={savingSite}>
          <span className="inline-flex items-center justify-center gap-1.5">
            <Loader2 className={"h-4 w-4 animate-spin " + (savingSite ? "" : "hidden")} />
            <span>{savingSite ? t("common.saving") : t("common.save")}</span>
          </span>
        </button>
      </section>

      {/* Performance / pagination toggle is Firestore-specific —
          it controls whether posts/pages lists run live `onSnapshot`
          subscriptions on the whole collection (global) or cursor-
          paginated queries with composite indexes (paginated). The
          document-store backends hold everything in memory, so the
          choice has no effect there. */}
      {backend === "firebase" && (
        <section className="card p-4 space-y-3">
          <h2 className="font-semibold">{t("settings.performance.title")}</h2>
          <p className="text-xs text-surface-500 dark:text-surface-400">
            {t("settings.performance.help")}
          </p>
          <div>
            <label className="label">{t("settings.performance.mode")}</label>
            <select
              className="input max-w-md"
              value={paginationMode}
              onChange={(e) => setPaginationMode(e.target.value as PaginationMode)}
            >
              <option value="global">{t("settings.performance.modeGlobal")}</option>
              <option value="paginated">{t("settings.performance.modePaginated")}</option>
            </select>
            <p className="text-xs text-surface-500 mt-1 dark:text-surface-400">
              {paginationMode === "global"
                ? t("settings.performance.globalHelp")
                : t("settings.performance.paginatedHelp")}
            </p>
          </div>
          <button
            type="button"
            className="btn-primary"
            onClick={savePagination}
            disabled={savingPagination || paginationMode === (settings.paginationMode ?? "global")}
          >
            <span className="inline-flex items-center justify-center gap-1.5">
              <Loader2 className={"h-4 w-4 animate-spin " + (savingPagination ? "" : "hidden")} />
              <span>{savingPagination ? t("common.saving") : t("common.save")}</span>
            </span>
          </button>
        </section>
      )}

      <section className="card p-4 space-y-3">
        <h2 className="font-semibold">{t("settings.editor.title")}</h2>
        <p className="text-xs text-surface-500 dark:text-surface-400">
          {t("settings.editor.help")}
        </p>
        <div className="max-w-xs">
          <label className="label">{t("settings.editor.fontFamily")}</label>
          <FontSelect
            value={editorStyle.fontFamily ?? SYSTEM_FONT_NAME}
            onChange={(name) =>
              patchEditorStyle({
                // Storing SYSTEM_FONT_NAME explicitly is fine but we
                // prefer leaving the field undefined when on default
                // — keeps the doc clean and lets the hook short-
                // circuit to its own fallback path.
                fontFamily: name === SYSTEM_FONT_NAME ? undefined : name,
              })
            }
            options={EDITOR_FONT_OPTIONS}
            ariaLabel={t("settings.editor.fontFamily")}
          />
        </div>
        <div className="grid grid-cols-2 gap-3 max-w-md">
          <div>
            <label className="label">{t("settings.editor.bodySize")}</label>
            <input
              className="input"
              value={editorStyle.bodySize ?? ""}
              onChange={(e) => patchEditorStyle({ bodySize: e.target.value })}
              placeholder={DEFAULT_EDITOR_SIZES.body}
            />
          </div>
          <div>
            <label className="label">{t("settings.editor.h1Size")}</label>
            <input
              className="input"
              value={editorStyle.h1Size ?? ""}
              onChange={(e) => patchEditorStyle({ h1Size: e.target.value })}
              placeholder={DEFAULT_EDITOR_SIZES.h1}
            />
          </div>
          <div>
            <label className="label">{t("settings.editor.h2Size")}</label>
            <input
              className="input"
              value={editorStyle.h2Size ?? ""}
              onChange={(e) => patchEditorStyle({ h2Size: e.target.value })}
              placeholder={DEFAULT_EDITOR_SIZES.h2}
            />
          </div>
          <div>
            <label className="label">{t("settings.editor.h3Size")}</label>
            <input
              className="input"
              value={editorStyle.h3Size ?? ""}
              onChange={(e) => patchEditorStyle({ h3Size: e.target.value })}
              placeholder={DEFAULT_EDITOR_SIZES.h3}
            />
          </div>
        </div>
        <p className="text-xs text-surface-500 dark:text-surface-400">
          {t("settings.editor.sizeHelp")}
        </p>
        <div className="flex gap-2">
          <button
            type="button"
            className="btn-primary"
            onClick={saveEditorStyle}
            disabled={savingEditor}
          >
            <span className="inline-flex items-center justify-center gap-1.5">
              <Loader2 className={"h-4 w-4 animate-spin " + (savingEditor ? "" : "hidden")} />
              <span>{savingEditor ? t("common.saving") : t("common.save")}</span>
            </span>
          </button>
          <button type="button" className="btn-ghost" onClick={resetEditorStyle}>
            {t("settings.editor.reset")}
          </button>
        </div>
      </section>

      {isAdmin && (
        <section className="card p-4 space-y-3">
          <h2 className="font-semibold">{t("connectors.settingsTitle")}</h2>
          <p className="text-xs text-surface-500 dark:text-surface-400">{t("connectors.settingsHelp")}</p>
          {target ? (
            <form data-form-type="other" className="space-y-3" onSubmit={(e) => e.preventDefault()}>
              <PublishTargetForm value={target} onChange={setTarget} showMaintenance />
              <SiteUrlMismatch target={target} baseUrl={settings.baseUrl} />
              <AdminHostingTool target={target} />
              <button type="button" className="btn-primary" onClick={saveTarget} disabled={savingTarget}>
                <span className="inline-flex items-center justify-center gap-1.5">
                  <Loader2 className={"h-4 w-4 animate-spin " + (savingTarget ? "" : "hidden")} />
                  <span>{savingTarget ? t("common.saving") : t("common.save")}</span>
                </span>
              </button>
            </form>
          ) : (
            <Loader2 className="h-4 w-4 animate-spin text-surface-400" />
          )}
        </section>
      )}

      {isAdmin && <BackendSettings backend={backend} />}
    </div>
  );
}

// Backend switcher (admin-only). Surfaces the active backend and a
// "Switch backend…" button that wipes the in-browser runtime config +
// reloads so the SetupForm shows up and the user can pick another one.
//
// **Data is NOT migrated** by the switch itself — the previous
// backend's data stays where it was; ContentTransfer below moves it.
function BackendSettings({ backend }: { backend: ReturnType<typeof getBackendKind> }) {
  const { t } = useTranslation();
  const [confirming, setConfirming] = useState(false);
  const config = getRuntimeConfig();
  const isFirebase = backend === "firebase";

  function switchBackend() {
    if (typeof window !== "undefined") {
      window.__AGENTCMS_CONFIG__ = null;
      // Admins without a writable config.js keep the config here.
      saveLocalRuntimeConfig(null);
      resetRuntimeConfigCache();
      window.location.reload();
    }
  }

  return (
    <section className="card p-4 space-y-3">
      <div className="flex items-center gap-2">
        <RefreshCw className="h-4 w-4 text-surface-500 dark:text-surface-400" />
        <h2 className="font-semibold">{t("settings.backend.title")}</h2>
      </div>

      <p className="text-sm text-surface-600 dark:text-surface-300">
        {t("settings.backend.active")}{" "}
        <span className="inline-flex items-center gap-1.5 font-medium text-surface-900 dark:text-surface-50">
          {isFirebase ? (
            <>
              <Flame className="h-3.5 w-3.5 text-amber-500" />
              Firebase
            </>
          ) : config?.backend === "markdown-git" ? (
            <>
              <GitBranch className="h-3.5 w-3.5 text-violet-500" />
              {t("settings.backend.markdownGit", {
                source:
                  config.git.provider === "github"
                    ? `GitHub ${config.git.owner}/${config.git.repo}@${config.git.branch}`
                    : config.git.provider === "gitlab"
                      ? `GitLab ${config.git.project}@${config.git.branch}`
                      : t("settings.backend.localFolder"),
              })}
            </>
          ) : config?.backend === "sqlite-file" ? (
            <>
              <Database className="h-3.5 w-3.5 text-emerald-500" />
              {t("settings.backend.sqliteFile", {
                location: `${t(`hosting.${hostingOptionFor(config.sqlite.connectorId, config.sqlite.settings).id}.title`)} — ${config.sqlite.path}`,
              })}
            </>
          ) : config?.backend === "local" ? (
            <>
              <HardDrive className="h-3.5 w-3.5 text-sky-500" />
              {t("settings.backend.localBrowser")}
            </>
          ) : (
            "—"
          )}
        </span>
      </p>

      {config?.backend === "sqlite-file" && <SqliteEncryptionSettings />}

      <ContentTransfer />

      {!confirming ? (
        <button
          type="button"
          className="btn-secondary"
          onClick={() => setConfirming(true)}
        >
          {t("settings.backend.switchButton")}
        </button>
      ) : (
        <div className="rounded-lg bg-amber-50 ring-1 ring-amber-200 p-4 dark:bg-amber-900/20 dark:ring-amber-700/40">
          <div className="flex gap-3">
            <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
            <div className="text-sm text-amber-800 dark:text-amber-200">
              <p className="font-medium">{t("settings.backend.confirmTitle")}</p>
              <p className="mt-1 text-xs leading-relaxed">
                {t("settings.backend.confirmBody")}
              </p>
              <div className="mt-3 flex gap-2">
                <button
                  type="button"
                  className="btn-danger text-xs"
                  onClick={switchBackend}
                >
                  {t("settings.backend.confirmYes")}
                </button>
                <button
                  type="button"
                  className="btn-ghost text-xs"
                  onClick={() => setConfirming(false)}
                >
                  {t("common.cancel")}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

// Export everything to one JSON file (any backend) / import such a file
// into a document-store backend with ids preserved. The way to move a
// site from Firebase or SQLite to Markdown-in-git (or back up a local
// install).
// SQLite file: turn encryption on for a plain database, or change the
// passphrase. The file is re-saved with a fresh key; other browsers are
// asked for the new passphrase on their next load.
function SqliteEncryptionSettings() {
  const { t } = useTranslation();
  const store = getDocStore() as SqliteFileDocStore;
  const [encrypted, setEncrypted] = useState(() => store.isEncrypted());
  const [open, setOpen] = useState(false);
  const [passphrase, setPassphrase] = useState(generatePassphrase);
  const [saved, setSaved] = useState(false);
  const [busy, setBusy] = useState(false);
  const [copied, setCopied] = useState(false);

  async function apply() {
    setBusy(true);
    try {
      await store.rekey(passphrase);
      // Record the flag where this admin's config lives (an encrypted
      // file is detected without it, but the access page asks earlier).
      const config = getRuntimeConfig();
      if (config?.backend === "sqlite-file") {
        const next = { ...config, sqlite: { ...config.sqlite, encrypted: true } };
        window.__AGENTCMS_CONFIG__ = next;
        if (window.localStorage.getItem(LOCAL_RUNTIME_CONFIG_KEY)) saveLocalRuntimeConfig(next);
        const folder = currentAdminFolderOn(await readPublishTarget());
        if (folder) await uploadConfigJsTo(folder, next).catch(() => {});
        resetRuntimeConfigCache();
      }
      setEncrypted(true);
      setOpen(false);
      setSaved(false);
      toast.success(t("settings.encryption.done"));
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="rounded-lg ring-1 ring-surface-200 p-3 space-y-2 dark:ring-surface-700">
      <p className="text-sm font-medium">
        {t("settings.encryption.title")}{" "}
        <span className={encrypted ? "text-emerald-600 dark:text-emerald-400" : "text-amber-600 dark:text-amber-400"}>
          {t(encrypted ? "settings.encryption.on" : "settings.encryption.off")}
        </span>
      </p>
      <p className="text-xs text-surface-500 dark:text-surface-400">
        {t(encrypted ? "settings.encryption.onHelp" : "settings.encryption.offHelp")}
      </p>
      {!open ? (
        <button type="button" className="btn-secondary text-xs" onClick={() => setOpen(true)}>
          {t(encrypted ? "settings.encryption.change" : "settings.encryption.enable")}
        </button>
      ) : (
        <form
          className="space-y-2"
          data-form-type="other"
          onSubmit={(e) => {
            e.preventDefault();
            if (!busy && saved) void apply();
          }}
        >
          <label className="label" htmlFor="sqlite-new-passphrase">
            {t("setup.sqliteFile.passphrase")}
          </label>
          <div className="flex gap-2">
            <input
              id="sqlite-new-passphrase"
              className="input font-mono text-xs"
              autoComplete="off"
              spellCheck={false}
              value={passphrase}
              onChange={(e) => {
                setPassphrase(e.target.value);
                setCopied(false);
              }}
            />
            <button
              type="button"
              className="btn-secondary shrink-0"
              onClick={() => void navigator.clipboard?.writeText(passphrase).then(() => setCopied(true))}
            >
              <span>{t(copied ? "setup.sqliteFile.copied" : "setup.sqliteFile.copy")}</span>
            </button>
            <button
              type="button"
              className="btn-secondary shrink-0"
              onClick={() => {
                setPassphrase(generatePassphrase());
                setCopied(false);
              }}
            >
              <span>{t("setup.sqliteFile.generate")}</span>
            </button>
          </div>
          <label className="flex items-start gap-2 text-xs text-amber-700 dark:text-amber-300">
            <input type="checkbox" className="mt-0.5" checked={saved} onChange={(e) => setSaved(e.target.checked)} />
            <span>{t("settings.encryption.savedConfirm")}</span>
          </label>
          <div className="flex gap-2">
            <button type="submit" className="btn-primary text-xs" disabled={busy || !saved || passphrase.trim().length < 12}>
              <span className="inline-flex items-center gap-1.5">
                <Loader2 className={"h-3.5 w-3.5 animate-spin " + (busy ? "" : "hidden")} />
                <span>{t(encrypted ? "settings.encryption.changeConfirm" : "settings.encryption.enableConfirm")}</span>
              </span>
            </button>
            <button type="button" className="btn-ghost text-xs" onClick={() => setOpen(false)}>
              {t("common.cancel")}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}

function ContentTransfer() {
  const { t } = useTranslation();
  const [busy, setBusy] = useState(false);
  const [mode, setMode] = useState<"merge" | "replace">("merge");

  async function runExport() {
    setBusy(true);
    try {
      const data = await exportContent();
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `agentcms-content-${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      setTimeout(() => URL.revokeObjectURL(url), 10_000);
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setBusy(false);
    }
  }

  async function runImport(file: File) {
    if (mode === "replace" && !window.confirm(t("settings.transfer.replaceConfirm"))) return;
    setBusy(true);
    try {
      const data: unknown = JSON.parse(await file.text());
      if (!isContentExport(data)) throw new Error(t("settings.transfer.invalidFile"));
      const counts = await importContent(data, mode);
      toast.success(t("settings.transfer.imported", { posts: counts.posts ?? 0, terms: counts.terms ?? 0, media: counts.media ?? 0 }));
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="rounded-lg ring-1 ring-surface-200 dark:ring-surface-700 p-3 space-y-2">
      <p className="text-sm font-medium">{t("settings.transfer.title")}</p>
      <p className="text-xs text-surface-500 dark:text-surface-400">{t("settings.transfer.help")}</p>
      <div className="flex flex-wrap items-center gap-2">
        <button type="button" className="btn-secondary text-xs" onClick={runExport} disabled={busy}>
          <span className="inline-flex items-center gap-1.5">
            <Loader2 className={"h-3.5 w-3.5 animate-spin " + (busy ? "" : "hidden")} />
            <Download className={"h-3.5 w-3.5 " + (busy ? "hidden" : "")} />
            <span>{t("settings.transfer.export")}</span>
          </span>
        </button>
        {canImportContent() && (
          <>
            <select className="input w-auto text-xs" value={mode} onChange={(e) => setMode(e.target.value as "merge" | "replace")}>
              <option value="merge">{t("settings.transfer.modeMerge")}</option>
              <option value="replace">{t("settings.transfer.modeReplace")}</option>
            </select>
            <label className={"btn-secondary text-xs cursor-pointer " + (busy ? "pointer-events-none opacity-50" : "")}>
              <span className="inline-flex items-center gap-1.5">
                <Upload className="h-3.5 w-3.5" />
                <span>{t("settings.transfer.import")}</span>
              </span>
              <input
                type="file"
                accept="application/json,.json"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  e.target.value = "";
                  if (file) void runImport(file);
                }}
              />
            </label>
          </>
        )}
      </div>
    </div>
  );
}

// Copies this admin (build manifest + files + config.js) onto the saved
// publish target — first deployment, or update after a new admin build.
function AdminHostingTool({ target }: { target: PublishTarget }) {
  const { t } = useTranslation();
  const [folder, setFolder] = useState(() => currentAdminFolderOn(target) ?? DEFAULT_ADMIN_FOLDER);
  const [available, setAvailable] = useState(false);
  const [busy, setBusy] = useState<string | null>(null);

  useEffect(() => {
    void readAdminManifest().then((m) => setAvailable(!!m));
  }, []);

  if (!available || target.connectorId === "browser-mirror") return null;
  const runtime = getRuntimeConfig();
  if (!runtime) return null;
  const url = adminUrlOn(target, folder);

  async function deploy() {
    if (!runtime) return;
    setBusy(t("setup.adminHosting.deploying"));
    try {
      const res = await deployAdmin(folder, runtime, (done, total) => setBusy(`${t("setup.adminHosting.deploying")} ${done}/${total}`));
      toast.success(t("connectors.adminHosting.deployed", { count: res.files, url: url ?? folder }));
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="rounded-lg ring-1 ring-surface-200 dark:ring-surface-700 p-3 space-y-2">
      <p className="text-sm font-medium">{t("connectors.adminHosting.title")}</p>
      <p className="text-xs text-surface-500 dark:text-surface-400">{t("connectors.adminHosting.help")}</p>
      <div className="flex flex-wrap items-end gap-2">
        <div>
          <label className="label">{t("setup.adminHosting.folder")}</label>
          <input className="input w-40" value={folder} onChange={(e) => setFolder(e.target.value)} />
        </div>
        <button type="button" className="btn-secondary text-xs" onClick={deploy} disabled={!!busy}>
          <span className="inline-flex items-center gap-1.5">
            <Loader2 className={"h-3.5 w-3.5 animate-spin " + (busy ? "" : "hidden")} />
            <span>{busy ?? t("connectors.adminHosting.deploy")}</span>
          </span>
        </button>
      </div>
      {url && <p className="text-xs text-surface-500 dark:text-surface-400 break-all">{url}</p>}
    </div>
  );
}

// Warns when the publish target serves the site at another URL than
// Settings → Site → Public site URL — links, sitemaps and the sub-folder
// rewrite follow the latter, so a leftover URL (previous hosting)
// breaks CSS / JS paths on the new one.
function SiteUrlMismatch({ target, baseUrl }: { target: PublishTarget; baseUrl: string }) {
  const { t } = useTranslation();
  const [busy, setBusy] = useState(false);
  const targetUrl = targetSiteUrl(target);
  const current = (baseUrl ?? "").replace(/\/+$/, "");
  if (!targetUrl || !current || targetUrl === current) return null;

  async function align() {
    setBusy(true);
    try {
      await updateSettings({ baseUrl: targetUrl });
      toast.success(t("connectors.siteUrl.updated"));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="rounded-lg bg-amber-50 text-amber-800 ring-1 ring-amber-200 px-3 py-2 text-xs space-y-2 dark:bg-amber-900/30 dark:text-amber-200 dark:ring-amber-700/50">
      <p className="flex gap-2">
        <AlertTriangle className="h-4 w-4 shrink-0" />
        <span>{t("connectors.siteUrl.mismatch", { site: current, target: targetUrl })}</span>
      </p>
      <button type="button" className="btn-secondary text-xs" onClick={align} disabled={busy}>
        <span className="inline-flex items-center gap-1.5">
          <Loader2 className={"h-3.5 w-3.5 animate-spin " + (busy ? "" : "hidden")} />
          <span>{t("connectors.siteUrl.use", { url: targetUrl })}</span>
        </span>
      </button>
    </div>
  );
}
