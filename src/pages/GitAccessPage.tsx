import { useState, type FormEvent } from "react";
import { ExternalLink, FolderOpen, Loader2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import flexwegLogo from "../assets/flexweg-logo.png";
import { LocaleSwitcher } from "../components/ui/LocaleSwitcher";
import { getRuntimeConfig } from "../lib/runtimeConfig";
import { getDocStore } from "../services/docstore";
import { notifyAuthChanged, setDocStoreSignOutHandler } from "../services/docstore/auth";
import { getGitToken, isGitDocStore, LOCAL_CONTENT_HANDLE_KEY, setGitToken } from "../services/docstore/gitStore";
import { saveSqliteConnectorSecrets, type SqliteFileDocStore } from "../services/docstore/sqliteFileStore";
import {
  ensureFolderPermission,
  isLocalFolderSupported,
  loadFolderHandle,
  pickLocalFolder,
  saveFolderHandle,
} from "../services/git";

// Sign-in screen of the "markdown-git" backend. There are no accounts:
// an editor proves who they are with a personal access token on the
// content repository (GitHub / GitLab) — their repo permissions become
// their CMS role. For a local clone, "signing in" is granting the
// browser access to the folder (needed again after every reload).

const TOKEN_URLS = {
  github: "https://github.com/settings/personal-access-tokens/new",
  gitlab: "https://gitlab.com/-/user_settings/personal_access_tokens?scopes=api&name=Flexweg%20CMS",
};

function resetSession() {
  const store = getDocStore();
  if (isGitDocStore(store)) store.resetSession();
}

// Sign-out forgets the token in this browser. Installed once at boot by
// App so the Sidebar's sign-out works for this backend too.
export function installGitSignOut(): void {
  const config = getRuntimeConfig();
  if (config?.backend === "sqlite-file") {
    // No accounts: signing out forgets the location's credentials here.
    setDocStoreSignOutHandler(() => {
      saveSqliteConnectorSecrets({});
      (getDocStore() as SqliteFileDocStore).resetSession();
    });
    return;
  }
  if (config?.backend !== "markdown-git") return;
  setDocStoreSignOutHandler(() => {
    if (config.git.provider !== "local") setGitToken(config.git, null);
    resetSession();
  });
}

export function GitAccessPage() {
  const { t } = useTranslation();
  const config = getRuntimeConfig();
  const git = config?.backend === "markdown-git" ? config.git : null;
  const [token, setToken] = useState(() => (git ? getGitToken(git) ?? "" : ""));
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!git) return null;
  const repoLabel =
    git.provider === "github" ? `${git.owner}/${git.repo}` : git.provider === "gitlab" ? git.project : "";

  async function connect(): Promise<void> {
    resetSession();
    await notifyAuthChanged();
    const identity = await getDocStore().identity();
    if (!identity) setError(t("gitAccess.failed"));
  }

  async function handleToken(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!git || !token.trim()) return;
    setSubmitting(true);
    setError(null);
    try {
      setGitToken(git, token);
      await connect();
    } finally {
      setSubmitting(false);
    }
  }

  async function handleFolder() {
    setSubmitting(true);
    setError(null);
    try {
      let handle = await loadFolderHandle(LOCAL_CONTENT_HANDLE_KEY);
      if (!handle || !(await ensureFolderPermission(handle, true))) {
        handle = await pickLocalFolder();
        await saveFolderHandle(LOCAL_CONTENT_HANDLE_KEY, handle);
      }
      await connect();
    } catch (err) {
      if ((err as { name?: string }).name !== "AbortError") setError((err as Error).message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="relative min-h-full flex items-center justify-center p-6 bg-surface-50 dark:bg-surface-950 overflow-hidden">
      <div className="flexweg-blobs" aria-hidden="true">
        <div className="flexweg-blob flexweg-blob-1"></div>
        <div className="flexweg-blob flexweg-blob-2"></div>
        <div className="flexweg-blob flexweg-blob-3"></div>
      </div>
      <div className="absolute top-4 right-4 z-10">
        <LocaleSwitcher />
      </div>
      <div className="w-full max-w-sm relative z-10">
        <div className="flex items-center gap-2.5 justify-center mb-6">
          <img src={flexwegLogo} alt="Flexweg" className="h-10 w-10 rounded-xl shadow-card object-cover" />
          <div>
            <p className="text-base font-semibold leading-none">{t("identity.brandTitle")}</p>
            <p className="text-[11px] text-surface-500 mt-0.5 dark:text-surface-400">{t("identity.brandSubtitle")}</p>
          </div>
        </div>

        <div className="card p-6">
          <h1 className="text-base font-semibold text-surface-900 dark:text-surface-50">{t("gitAccess.heading")}</h1>

          {git.provider === "local" ? (
            <>
              <p className="text-sm text-surface-500 mt-1 dark:text-surface-400">{t("gitAccess.folderIntro")}</p>
              {!isLocalFolderSupported() && (
                <p className="text-xs text-amber-600 mt-3">{t("connectors.folder.unsupported")}</p>
              )}
              {error && (
                <div className="mt-4 rounded-lg bg-red-50 text-red-700 ring-1 ring-red-200 px-3 py-2 text-sm dark:bg-red-900/30 dark:text-red-300 dark:ring-red-700/50">
                  {error}
                </div>
              )}
              <button
                type="button"
                className="btn-primary w-full justify-center mt-5"
                onClick={handleFolder}
                disabled={submitting || !isLocalFolderSupported()}
              >
                <span className="inline-flex items-center justify-center gap-1.5">
                  <Loader2 className={"h-4 w-4 animate-spin " + (submitting ? "" : "hidden")} />
                  <FolderOpen className={"h-4 w-4 " + (submitting ? "hidden" : "")} />
                  <span>{t("gitAccess.openFolder")}</span>
                </span>
              </button>
            </>
          ) : (
            <>
              <p className="text-sm text-surface-500 mt-1 dark:text-surface-400">
                {t("gitAccess.tokenIntro", { repo: repoLabel, provider: git.provider === "github" ? "GitHub" : "GitLab" })}
              </p>
              <form onSubmit={handleToken} className="mt-5 space-y-4" data-form-type="other">
                <div>
                  <label className="label" htmlFor="git-token">
                    {t("gitAccess.token")}
                  </label>
                  <input
                    id="git-token"
                    type="password"
                    className="input font-mono"
                    value={token}
                    onChange={(e) => setToken(e.target.value)}
                    autoComplete="off"
                    autoFocus
                    required
                  />
                  <p className="text-xs text-surface-500 mt-1 dark:text-surface-400">
                    {t(git.provider === "github" ? "gitAccess.tokenHelpGithub" : "gitAccess.tokenHelpGitlab")}{" "}
                    <a
                      href={TOKEN_URLS[git.provider]}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-0.5 text-blue-600 hover:underline dark:text-blue-400"
                    >
                      {t("gitAccess.createToken")}
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </p>
                </div>
                {error && (
                  <div className="rounded-lg bg-red-50 text-red-700 ring-1 ring-red-200 px-3 py-2 text-sm dark:bg-red-900/30 dark:text-red-300 dark:ring-red-700/50">
                    {error}
                  </div>
                )}
                <button type="submit" className="btn-primary w-full justify-center" disabled={submitting || !token.trim()}>
                  <span className="inline-flex items-center justify-center gap-1.5">
                    <Loader2 className={"h-4 w-4 animate-spin " + (submitting ? "" : "hidden")} />
                    <span>{t("gitAccess.connect")}</span>
                  </span>
                </button>
                <p className="text-[11px] text-surface-500 dark:text-surface-400">{t("gitAccess.tokenStorage")}</p>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
