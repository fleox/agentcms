import { useState } from "react";
import { Loader2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import flexwegLogo from "../assets/flexweg-logo.png";
import { PublishTargetForm } from "../components/connectors/PublishTargetForm";
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
import type { PublishTarget } from "../services/storage/target";
import { testStorageConnection } from "../services/storage/testConnection";

// Shown by the "sqlite-file" backend when this browser lacks the
// credentials of the database location (token, secret key…) or the
// passphrase of an encrypted database: they are never in config.js, so
// each new browser enters them once. There are no user accounts.
export function SqliteFileAccessPage() {
  const { t } = useTranslation();
  const config = getRuntimeConfig();
  const sqlite = config?.backend === "sqlite-file" ? config.sqlite : null;
  const [location, setLocation] = useState<PublishTarget>(() =>
    sqlite ? { connectorId: sqlite.connectorId, settings: connectorSettingsWithSecrets(sqlite) } : { connectorId: "", settings: {} },
  );
  const store = getDocStore() as SqliteFileDocStore;
  const [passphrase, setPassphrase] = useState(() => getSqlitePassphrase() ?? "");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(() =>
    store.passphraseProblem?.() === "wrong" ? t("sqliteAccess.passphraseWrong") : null,
  );

  if (!sqlite) return null;
  const askPassphrase = !!sqlite.encrypted || store.passphraseProblem?.() != null;

  async function connect() {
    setBusy(true);
    setError(null);
    try {
      const res = await testStorageConnection(location.connectorId, location.settings, { ignore: ["siteUrl"] });
      if (!res.ok) {
        setError(`${t("connectors.testFailed")} — ${res.detail}`);
        return;
      }
      saveSqliteConnectorSecrets(splitConnectorSettings(location.settings).secrets);
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
      <div className="flexweg-blobs" aria-hidden="true">
        <div className="flexweg-blob flexweg-blob-1"></div>
        <div className="flexweg-blob flexweg-blob-2"></div>
        <div className="flexweg-blob flexweg-blob-3"></div>
      </div>
      <div className="absolute top-4 right-4 z-10">
        <LocaleSwitcher />
      </div>
      <div className="w-full max-w-md relative z-10">
        <div className="flex items-center gap-2.5 justify-center mb-6">
          <img src={flexwegLogo} alt="Flexweg" className="h-10 w-10 rounded-xl shadow-card object-cover" />
          <div>
            <p className="text-base font-semibold leading-none">{t("identity.brandTitle")}</p>
            <p className="text-[11px] text-surface-500 mt-0.5 dark:text-surface-400">{t("identity.brandSubtitle")}</p>
          </div>
        </div>
        <div className="card p-6">
          <h1 className="text-base font-semibold text-surface-900 dark:text-surface-50">{t("sqliteAccess.heading")}</h1>
          <p className="text-sm text-surface-500 mt-1 dark:text-surface-400">
            {t("sqliteAccess.intro", { path: sqlite.path })}
          </p>
          <form
            className="mt-5 space-y-4"
            data-form-type="other"
            onSubmit={(e) => {
              e.preventDefault();
              if (!busy) void connect();
            }}
          >
            <PublishTargetForm
              value={location}
              onChange={setLocation}
              lockHosting
              hideFields={["siteUrl"]}
              testIgnore={["siteUrl"]}
            />
            {askPassphrase && (
              <div>
                <label className="label" htmlFor="sqlite-passphrase">
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
