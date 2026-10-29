import { useState } from "react";
import { Database, KeyRound, Loader2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import agentcmsLogo from "../assets/agentcms-logo.svg";
import { secretFieldsOf } from "../components/connectors/PublishTargetForm";
import { hostingOptionFor } from "../components/connectors/hostingOptions";
import { LocaleSwitcher } from "../components/ui/LocaleSwitcher";
import { getRuntimeConfig } from "../lib/runtimeConfig";
import { getDocStore } from "../services/docstore";
import { notifyAuthChanged } from "../services/docstore/auth";
import {
  connectorSettingsWithSecrets,
  getSqlitePassphrase,
  saveSqliteConnectorSecrets,
  saveSqlitePassphrase,
  splitConnectorSettings,
  type SqliteFileDocStore,
} from "../services/docstore/sqliteFileStore";
import { testStorageConnection } from "../services/storage/testConnection";

// Shown by the "sqlite-file" backend when this browser lacks the
// credentials of the database location (token, secret key…) or the
// passphrase of an encrypted database: they are never in config.js, so
// each new browser enters them once. There are no user accounts.
export function SqliteFileAccessPage() {
  const { t } = useTranslation();
  const config = getRuntimeConfig();
  const sqlite = config?.backend === "sqlite-file" ? config.sqlite : null;
  // Everything public about the location is in config.js already: the
  // page only asks for its secrets (token, secret key) and the passphrase.
  const [settings, setSettings] = useState<Record<string, unknown>>(() => (sqlite ? connectorSettingsWithSecrets(sqlite) : {}));
  const store = getDocStore() as SqliteFileDocStore;
  const [passphrase, setPassphrase] = useState(() => getSqlitePassphrase() ?? "");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(() =>
    store.passphraseProblem?.() === "wrong" ? t("sqliteAccess.passphraseWrong") : null,
  );

  if (!sqlite) return null;
  const askPassphrase = !!sqlite.encrypted || store.passphraseProblem?.() != null;
  const connectorId = sqlite.connectorId;
  const secretKeys = secretFieldsOf(connectorId);
  const s = sqlite.settings as Record<string, unknown>;
  const where =
    connectorId === "git-pages"
      ? `${s.provider === "gitlab" ? String(s.project ?? "") : `${String(s.owner ?? "")}/${String(s.repo ?? "")}`}${s.branch ? ` · ${t("sqliteAccess.branch")} ${String(s.branch)}` : ""}`
      : connectorId === "s3"
        ? `${String(s.bucket ?? "")}${s.prefix ? `/${String(s.prefix)}` : ""}`
        : "";

  async function connect() {
    setBusy(true);
    setError(null);
    try {
      const res = await testStorageConnection(connectorId, settings, { ignore: ["siteUrl"] });
      if (!res.ok) {
        setError(`${t("connectors.testFailed")} — ${res.detail}`);
        return;
      }
      saveSqliteConnectorSecrets(splitConnectorSettings(settings).secrets);
      if (askPassphrase) saveSqlitePassphrase(passphrase.trim() || null);
      store.resetSession();
      await notifyAuthChanged();
      const problem = store.passphraseProblem();
      if (problem) setError(t(problem === "wrong" ? "sqliteAccess.passphraseWrong" : "sqliteAccess.passphraseMissing"));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="relative min-h-full flex items-center justify-center p-6 bg-surface-50 dark:bg-surface-950 overflow-hidden">
      <div className="agentcms-blobs" aria-hidden="true">
        <div className="agentcms-blob agentcms-blob-1"></div>
        <div className="agentcms-blob agentcms-blob-2"></div>
        <div className="agentcms-blob agentcms-blob-3"></div>
      </div>
      <div className="absolute top-4 right-4 z-10">
        <LocaleSwitcher />
      </div>
      <div className="w-full max-w-md relative z-10">
        <div className="flex items-center gap-2.5 justify-center mb-6">
          <img src={agentcmsLogo} alt="AgentCMS" className="h-10 w-10 rounded-xl shadow-card object-cover" />
          <div>
            <p className="text-base font-semibold leading-none">{t("identity.brandTitle")}</p>
            <p className="text-[11px] text-surface-500 mt-0.5 dark:text-surface-400">{t("identity.brandSubtitle")}</p>
          </div>
        </div>
        <div className="card p-6">
          <h1 className="text-base font-semibold text-surface-900 dark:text-surface-50">{t("sqliteAccess.heading")}</h1>
          <p className="text-sm text-surface-500 mt-1 dark:text-surface-400">
            {t("sqliteAccess.intro")}
          </p>
          <form
            className="mt-5 space-y-4"
            data-form-type="other"
            onSubmit={(e) => {
              e.preventDefault();
              if (!busy) void connect();
            }}
          >
            <div className="flex items-start gap-2.5 rounded-lg bg-surface-100 px-3 py-2.5 text-sm dark:bg-surface-800/60">
              <Database className="h-4 w-4 mt-0.5 shrink-0 text-surface-500" />
              <div className="min-w-0">
                <p className="font-medium">{t(`hosting.${hostingOptionFor(connectorId, s).id}.title`)}</p>
                {where && <p className="text-xs font-mono text-surface-500 break-all dark:text-surface-400">{where}</p>}
                <p className="text-xs font-mono text-surface-500 break-all dark:text-surface-400">{sqlite.path}</p>
              </div>
            </div>
            {secretKeys.map((key) => (
              <div key={key}>
                <label className="label" htmlFor={`sqlite-${key}`}>
                  {t(`connectors.fields.${connectorId}.${key}`)}
                </label>
                <input
                  id={`sqlite-${key}`}
                  type="password"
                  className="input font-mono"
                  autoComplete="off"
                  value={String(settings[key] ?? "")}
                  onChange={(e) => setSettings({ ...settings, [key]: e.target.value })}
                  required
                />
                <p className="text-[11px] text-surface-500 dark:text-surface-400 mt-1">
                  {t(connectorId === "s3" ? "sqliteAccess.secretKeyHint" : "sqliteAccess.tokenHint")}
                </p>
              </div>
            ))}
            {askPassphrase && (
              <div>
                <label className="label inline-flex items-center gap-1.5" htmlFor="sqlite-passphrase">
                  <KeyRound className="h-3.5 w-3.5" />
                  {t("sqliteAccess.passphrase")}
                </label>
                <input
                  id="sqlite-passphrase"
                  type="password"
                  className="input"
                  autoComplete="current-password"
                  value={passphrase}
                  onChange={(e) => setPassphrase(e.target.value)}
                  required
                />
                <p className="text-[11px] text-surface-500 dark:text-surface-400 mt-1">{t("sqliteAccess.passphraseHint")}</p>
              </div>
            )}
            {error && (
              <div className="rounded-lg bg-red-50 text-red-700 ring-1 ring-red-200 px-3 py-2 text-sm break-words dark:bg-red-900/30 dark:text-red-300 dark:ring-red-700/50">
                {error}
              </div>
            )}
            <button type="submit" className="btn-primary w-full justify-center" disabled={busy}>
              <span className="inline-flex items-center justify-center gap-1.5">
                <Loader2 className={"h-4 w-4 animate-spin " + (busy ? "" : "hidden")} />
                <span>{t("gitAccess.connect")}</span>
              </span>
            </button>
            <p className="text-[11px] text-surface-500 dark:text-surface-400">{t("sqliteAccess.storage")}</p>
          </form>
        </div>
      </div>
    </div>
  );
}
