import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Archive,
  CheckCircle2,
  Cloud,
  Database,
  Download,
  FolderOpen,
  GitBranch,
  Loader2,
  PlugZap,
  Server,
  XCircle,
  type LucideIcon,
} from "lucide-react";
import { getHostingOption, hostingOptionFor, HOSTING_OPTIONS } from "./hostingOptions";
import {
  ensureFolderPermission,
  isLocalFolderSupported,
  loadFolderHandle,
  pickLocalFolder,
  saveFolderHandle,
} from "../../services/git";
import { exportMirrorZip, mirrorFileCount } from "../../services/storage/connectors/browserMirror";
import { LOCAL_PUBLISH_HANDLE_KEY } from "../../services/storage/connectors/localFolder";
import type { PublishTarget } from "../../services/storage/target";
import { testStorageConnection, type ConnectionTestResult } from "../../services/storage/testConnection";

// Hosting picker + per-connector fields, shared by the setup wizard
// (cards) and Settings → Publish target (select). The user picks WHERE
// the site is hosted (GitHub Pages, Cloudflare Pages, S3…); the option
// maps to a connector + preset (hostingOptions.ts). Controlled: the
// parent owns the value and decides when to save.

const HOSTING_ICONS: Record<string, LucideIcon> = {
  "github-pages": GitBranch,
  "cloudflare-pages": Cloud,
  "gitlab-pages": GitBranch,
  "git-other": GitBranch,
  s3: Database,
  "local-folder": FolderOpen,
  zip: Archive,
};

interface Field {
  key: string;
  type: "text" | "password" | "select" | "checkbox";
  options?: string[];
  placeholder?: string;
  help?: boolean;
  show?: (s: Record<string, unknown>) => boolean;
}

const CONNECTORS = ["git-pages", "s3", "browser-mirror", "local-folder"] as const;

const FIELDS: Record<(typeof CONNECTORS)[number], Field[]> = {
  "git-pages": [
    { key: "host", type: "select", options: ["github-pages", "cloudflare-pages", "gitlab-pages", "other"], help: true },
    { key: "provider", type: "select", options: ["github", "gitlab"] },
    { key: "owner", type: "text", placeholder: "my-user", show: (s) => s.provider !== "gitlab" },
    { key: "repo", type: "text", placeholder: "my-site", show: (s) => s.provider !== "gitlab" },
    { key: "project", type: "text", placeholder: "group/my-site", show: (s) => s.provider === "gitlab" },
    { key: "branch", type: "text", placeholder: "main" },
    { key: "dir", type: "text", placeholder: "", help: true },
    { key: "token", type: "password", help: true },
    { key: "siteUrl", type: "text", placeholder: "https://my-user.github.io/my-site", help: true },
    { key: "apiBaseUrl", type: "text", placeholder: "https://api.github.com" },
  ],
  s3: [
    { key: "endpoint", type: "text", placeholder: "https://<account>.r2.cloudflarestorage.com", help: true },
    { key: "region", type: "text", placeholder: "auto" },
    { key: "bucket", type: "text" },
    { key: "prefix", type: "text" },
    { key: "accessKeyId", type: "text" },
    { key: "secretAccessKey", type: "password" },
    { key: "siteUrl", type: "text", placeholder: "https://www.example.com", help: true },
    { key: "forcePathStyle", type: "checkbox" },
    { key: "publicRead", type: "checkbox" },
  ],
  "browser-mirror": [{ key: "siteUrl", type: "text", placeholder: "https://www.example.com", help: true }],
  "local-folder": [{ key: "siteUrl", type: "text", placeholder: "http://localhost:8080", help: true }],
};

// Sensible starting values when switching connector.
const DEFAULTS: Record<string, Record<string, unknown>> = {
  "git-pages": { host: "github-pages", provider: "github", branch: "main" },
  s3: { region: "auto" },
};

interface Props {
  value: PublishTarget;
  onChange: (next: PublishTarget) => void;
  // Settings shows maintenance actions (ZIP download, folder reconnect).
  showMaintenance?: boolean;
  // "cards" for the setup wizard, "select" for Settings.
  picker?: "cards" | "select";
  // Hosting option ids not offered (e.g. ZIP as a database location).
  exclude?: string[];
  // Extra fields to hide (e.g. siteUrl for a database location).
  hideFields?: string[];
  // Test options forwarded to testStorageConnection.
  testIgnore?: string[];
  // Hide the hosting picker (the hosting is fixed, only fields change).
  lockHosting?: boolean;
  // Label of the "select" picker (default "Publish target").
  pickerLabel?: string;
}

export function PublishTargetForm({
  value,
  onChange,
  showMaintenance,
  picker = "select",
  exclude = [],
  hideFields = [],
  testIgnore,
  lockHosting = false,
  pickerLabel,
}: Props) {
  const options = HOSTING_OPTIONS.filter((o) => !exclude.includes(o.id));
  const { t } = useTranslation();
  const [testing, setTesting] = useState(false);
  const [result, setResult] = useState<ConnectionTestResult | null>(null);
  const [folderName, setFolderName] = useState<string | null>(null);
  const [mirrorCount, setMirrorCount] = useState<number | null>(null);
  const [exporting, setExporting] = useState(false);

  const id = (CONNECTORS as readonly string[]).includes(value.connectorId)
    ? (value.connectorId as (typeof CONNECTORS)[number])
    : "browser-mirror";
  const settings = value.settings;
  const hosting = hostingOptionFor(id, settings);

  useEffect(() => {
    setResult(null);
    if (id === "local-folder") {
      void loadFolderHandle(LOCAL_PUBLISH_HANDLE_KEY).then((h) => setFolderName(h?.name ?? null));
    }
    if (id === "browser-mirror" && showMaintenance) void mirrorFileCount().then(setMirrorCount);
  }, [id, showMaintenance]);

  function patch(key: string, v: unknown) {
    setResult(null);
    onChange({ connectorId: id, settings: { ...settings, [key]: v } });
  }

  function selectHosting(optionId: string) {
    setResult(null);
    const option = getHostingOption(optionId);
    onChange({
      connectorId: option.connectorId,
      settings: { ...(DEFAULTS[option.connectorId] ?? {}), ...option.preset },
    });
  }

  async function runTest() {
    setTesting(true);
    try {
      setResult(await testStorageConnection(id, settings, { ignore: testIgnore }));
    } finally {
      setTesting(false);
    }
  }

  async function chooseFolder() {
    const handle = await pickLocalFolder();
    await saveFolderHandle(LOCAL_PUBLISH_HANDLE_KEY, handle);
    setFolderName(handle.name);
    setResult(null);
  }

  async function reconnectFolder() {
    const handle = await loadFolderHandle(LOCAL_PUBLISH_HANDLE_KEY);
    if (handle) await ensureFolderPermission(handle, true);
  }

  async function downloadZip() {
    setExporting(true);
    try {
      const blob = await exportMirrorZip();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "site.zip";
      a.click();
      setTimeout(() => URL.revokeObjectURL(url), 10_000);
    } finally {
      setExporting(false);
    }
  }

  const localUnsupported = id === "local-folder" && !isLocalFolderSupported();

  return (
    <div className="space-y-3">
      {lockHosting ? null : picker === "cards" ? (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          {options.map((o) => {
            const Icon = HOSTING_ICONS[o.id] ?? Server;
            const active = o.id === hosting.id;
            return (
              <button
                key={o.id}
                type="button"
                onClick={() => selectHosting(o.id)}
                className={
                  "text-left p-3 rounded-lg ring-1 ring-inset transition-colors " +
                  (active
                    ? "ring-blue-500 bg-blue-50/60 dark:ring-blue-400 dark:bg-blue-900/20"
                    : "ring-surface-200 hover:bg-surface-50 dark:ring-surface-700 dark:hover:bg-surface-800/60")
                }
              >
                <span className="flex items-center gap-1.5 text-sm font-semibold">
                  <Icon className="h-4 w-4 text-surface-500 shrink-0" />
                  {t(`hosting.${o.id}.title`)}
                </span>
                <span className="block text-[11px] text-surface-500 dark:text-surface-400 mt-1 leading-snug">
                  {t(`hosting.${o.id}.short`)}
                </span>
              </button>
            );
          })}
        </div>
      ) : (
        <div>
          <label className="label">{pickerLabel ?? t("connectors.target")}</label>
          <select className="input" value={hosting.id} onChange={(e) => selectHosting(e.target.value)}>
            {options.map((o) => (
              <option key={o.id} value={o.id}>
                {t(`hosting.${o.id}.title`)}
              </option>
            ))}
          </select>
        </div>
      )}
      <p className="text-xs text-surface-500 dark:text-surface-400">{t(`hosting.${hosting.id}.hint`)}</p>

      {FIELDS[id]
        .filter((f) => !hosting.hiddenFields.includes(f.key) && !hideFields.includes(f.key))
        .filter((f) => !f.show || f.show(settings))
        .map((f) => {
          const label = t(`connectors.fields.${id}.${f.key}`);
          const help = f.help ? t(`connectors.help.${id}.${f.key}`) : null;
          if (f.type === "checkbox") {
            return (
              <label key={f.key} className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={settings[f.key] === true} onChange={(e) => patch(f.key, e.target.checked)} />
                {label}
              </label>
            );
          }
          return (
            <div key={f.key}>
              <label className="label">{label}</label>
              {f.type === "select" ? (
                <select className="input" value={String(settings[f.key] ?? f.options![0])} onChange={(e) => patch(f.key, e.target.value)}>
                  {f.options!.map((o) => (
                    <option key={o} value={o}>
                      {t(`connectors.options.${o}`)}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  className={"input" + (f.type === "password" ? " font-mono" : "")}
                  type={f.type === "password" ? "password" : "text"}
                  autoComplete="off"
                  value={String(settings[f.key] ?? "")}
                  placeholder={f.placeholder}
                  onChange={(e) => patch(f.key, e.target.value)}
                />
              )}
              {help && <p className="text-xs text-surface-500 mt-1 dark:text-surface-400">{help}</p>}
            </div>
          );
        })}

      {id === "local-folder" && (
        <div className="flex flex-wrap items-center gap-2">
          <button type="button" className="btn-secondary" onClick={chooseFolder} disabled={localUnsupported}>
            <span className="inline-flex items-center gap-1.5">
              <FolderOpen className="h-4 w-4" />
              <span>{folderName ? t("connectors.folder.change") : t("connectors.folder.choose")}</span>
            </span>
          </button>
          {folderName && <span className="text-xs font-mono text-surface-500">{folderName}</span>}
          {showMaintenance && folderName && (
            <button type="button" className="btn-ghost" onClick={reconnectFolder}>
              {t("connectors.folder.reconnect")}
            </button>
          )}
          {localUnsupported && <p className="text-xs text-amber-600 w-full">{t("connectors.folder.unsupported")}</p>}
        </div>
      )}

      {id === "browser-mirror" && showMaintenance && (
        <div className="flex flex-wrap items-center gap-2">
          <button type="button" className="btn-secondary" onClick={downloadZip} disabled={exporting || mirrorCount === 0}>
            <span className="inline-flex items-center gap-1.5">
              <Loader2 className={"h-4 w-4 animate-spin " + (exporting ? "" : "hidden")} />
              <Download className={"h-4 w-4 " + (exporting ? "hidden" : "")} />
              <span>{t("connectors.mirror.download")}</span>
            </span>
          </button>
          {mirrorCount !== null && (
            <span className="text-xs text-surface-500">{t("connectors.mirror.count", { count: mirrorCount })}</span>
          )}
        </div>
      )}

      <div className="flex flex-wrap items-center gap-2">
        <button type="button" className="btn-secondary" onClick={runTest} disabled={testing || localUnsupported}>
          <span className="inline-flex items-center gap-1.5">
            <Loader2 className={"h-4 w-4 animate-spin " + (testing ? "" : "hidden")} />
            <PlugZap className={"h-4 w-4 " + (testing ? "hidden" : "")} />
            <span>{t("connectors.test")}</span>
          </span>
        </button>
        {result && (
          <span className={"inline-flex items-center gap-1 text-xs " + (result.ok ? "text-emerald-600" : "text-red-600")}>
            {result.ok ? <CheckCircle2 className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
            <span className="break-all">
              {result.ok ? t("connectors.testOk") : t("connectors.testFailed")} — {result.detail}
            </span>
          </span>
        )}
      </div>
    </div>
  );
}
