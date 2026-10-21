import { useEffect, useState, type FormEvent, type ReactNode } from "react";
import { createPortal } from "react-dom";
import {
  ArrowRight,
  CheckCircle2,
  Database,
  Download,
  Flame,
  FolderOpen,
  GitBranch,
  HardDrive,
  Loader2,
  type LucideIcon,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import flexwegLogo from "../assets/flexweg-logo.png";
import { LocaleSwitcher } from "../components/ui/LocaleSwitcher";
import { PublishTargetForm } from "../components/connectors/PublishTargetForm";
import { getHostingOption, hostingOptionFor } from "../components/connectors/hostingOptions";
import { getAdminFolder } from "../lib/adminBase";
import { DEFAULT_FLEXWEG_API_BASE_URL } from "../services/flexwegConfig";
import { LOCAL_CONTENT_HANDLE_KEY } from "../services/docstore/gitStore";
import { isLocalFolderSupported, pickLocalFolder, saveFolderHandle } from "../services/git";
import type { PublishTarget } from "../services/storage/target";
import { testStorageConnection } from "../services/storage/testConnection";
import { adminUrlOn, currentAdminFolderOn, DEFAULT_ADMIN_FOLDER, readAdminManifest } from "../services/adminDeploy";
import {
  downloadConfigJs,
  installDocStore,
  installFirebase,
  installSqlite,
  SetupError,
  verifyFirebase,
  verifyGitContent,
  verifySqlite,
  verifySqliteFile,
  type GitContent,
  type InstallResult,
  type SetupErrorKind,
  type SetupForm as SetupFormState,
} from "./setup/installers";

// First-run setup wizard: Terms → 1. Data backend → 2. Hosting →
// 3. Install. The logic lives in setup/installers.ts; this file is UI.

// Pre-fills the Flexweg site URL with the page's current origin AND
// the detected admin folder — the CMS is conventionally deployed at
// `<site>/admin/`, so the URL the user wants is the full path they
// loaded the setup form from. Skipped on localhost where the origin is
// never a useful default.
function defaultSiteUrl(): string {
  if (typeof window === "undefined") return "";
  const h = window.location.hostname;
  if (
    h === "localhost" ||
    h === "127.0.0.1" ||
    h === "[::1]" ||
    h === "::1" ||
    h === "0.0.0.0" ||
    h.endsWith(".localhost")
  ) {
    return "";
  }
  const folder = getAdminFolder();
  return folder ? `${window.location.origin}/${folder}` : window.location.origin;
}

// Suggests an initial value for the SQLite path. Uses the detected
// admin folder + `cms.sqlite`. Falls back to `admin/cms.sqlite` when
// the folder cannot be detected (root deployment / SSR).
function defaultSqlitePath(): string {
  if (typeof window === "undefined") return "admin/cms.sqlite";
  const folder = getAdminFolder();
  return folder ? `${folder}/cms.sqlite` : "admin/cms.sqlite";
}

// Reads `?apikey=...` from the page URL so deployments triggered from
// the Flexweg dashboard can pre-fill the key and skip the copy/paste
// step. The query string is wiped by the post-install reload (see
// `reloadAfterSetup`) so the sensitive value never sticks around in
// browser history / bookmarks / referer headers.
function defaultFlexwegApiKey(): string {
  if (typeof window === "undefined") return "";
  try {
    const v = new URL(window.location.href).searchParams.get("apikey");
    return v?.trim() ?? "";
  } catch {
    return "";
  }
}

// Reloads after a successful setup. Strips ALL query params (including
// the sensitive `?apikey=...` that the user may have arrived with) so
// nothing leaks into history / bookmarks / referer.
function reloadAfterSetup(): void {
  if (typeof window === "undefined") return;
  const url = new URL(window.location.href);
  url.search = "";
  window.location.replace(url.toString());
}

const INITIAL_STATE: SetupFormState = {
  apiKey: "",
  authDomain: "",
  projectId: "",
  storageBucket: "",
  messagingSenderId: "",
  appId: "",
  adminEmail: "",
  adminPassword: "",
  flexwegApiKey: defaultFlexwegApiKey(),
  flexwegSiteUrl: defaultSiteUrl(),
  flexwegApiBaseUrl: DEFAULT_FLEXWEG_API_BASE_URL,
  sqlitePath: defaultSqlitePath(),
};

const INITIAL_GIT: GitContent = {
  provider: "github",
  owner: "",
  repo: "",
  project: "",
  branch: "main",
  contentDir: "content",
};

type ErrorState = { kind: SetupErrorKind; detail?: string };

// Wizard: Terms → 1. Data (where content lives + its credentials) →
// 2. Hosting (where the generated site is published) → 3. Install.
type WizardStep = "terms" | "data" | "hosting" | "install";

// Data model only — where it is stored is decided by the hosting step
// (a SQLite file lives on the chosen hosting; on Flexweg it can also be
// Flexweg's SQLite service with built-in accounts).
type BackendChoice = "sqlite-file" | "markdown-git" | "firebase" | "local";

const isDocStoreChoice = (b: BackendChoice) => b === "sqlite-file" || b === "markdown-git" || b === "local";

// Where a new SQLite database file goes by default: next to the admin,
// so protecting the admin folder protects the data too.
function defaultSqlitePathOnHost(): string {
  return `${getAdminFolder() || "admin"}/data/cms.sqlite`;
}

function toErrorState(err: unknown): ErrorState {
  if (err instanceof SetupError) return { kind: err.kind, detail: err.detail };
  return { kind: "generic", detail: err instanceof Error ? err.message : String(err) };
}

// First hosting suggestion for a data backend — the user can pick any
// other card. SQLite and Firebase installs historically published to
// Flexweg; Markdown on GitHub pairs naturally with GitHub Pages; local
// content stays local (ZIP) until the user decides otherwise.
function defaultTarget(backend: BackendChoice, form: SetupFormState, git: GitContent): PublishTarget {
  const fromOption = (id: string, extra: Record<string, unknown> = {}): PublishTarget => {
    const option = getHostingOption(id);
    return { connectorId: option.connectorId, settings: { ...option.preset, ...extra } };
  };
  if (backend === "sqlite-file" || backend === "firebase") {
    return fromOption("flexweg", {
      apiKey: form.flexwegApiKey,
      siteUrl: form.flexwegSiteUrl,
      apiBaseUrl: form.flexwegApiBaseUrl || DEFAULT_FLEXWEG_API_BASE_URL,
    });
  }
  if (backend === "markdown-git" && git.provider === "github") return fromOption("github-pages", { owner: git.owner });
  if (backend === "markdown-git" && git.provider === "gitlab") return fromOption("gitlab-pages");
  return fromOption("zip");
}

export function SetupForm() {
  const { t } = useTranslation();
  const [wizardStep, setWizardStep] = useState<WizardStep>("terms");
  const [backend, setBackend] = useState<BackendChoice>("sqlite-file");
  // SQLite: the database file goes on the hosting chosen in step 2…
  const [sqlitePathOnHost, setSqlitePathOnHost] = useState(defaultSqlitePathOnHost);
  // …or, when that hosting is Flexweg, optionally in Flexweg's SQLite
  // service (built-in user accounts).
  const [flexwegService, setFlexwegService] = useState(false);
  // Host the admin on the publish target too (copied into this folder).
  const [hostAdmin, setHostAdmin] = useState(true);
  const [adminFolder, setAdminFolder] = useState(DEFAULT_ADMIN_FOLDER);
  // The copy needs the build manifest (absent under npm run dev).
  const [canHostAdmin, setCanHostAdmin] = useState(false);
  useEffect(() => {
    void readAdminManifest().then((m) => setCanHostAdmin(!!m));
  }, []);
  const [sqliteExisting, setSqliteExisting] = useState(false);
  const [form, setForm] = useState<SetupFormState>(INITIAL_STATE);
  const [git, setGit] = useState<GitContent>(INITIAL_GIT);
  const [gitToken, setGitTokenInput] = useState("");
  const [target, setTarget] = useState<PublishTarget | null>(null);
  const [targetBackend, setTargetBackend] = useState<BackendChoice | null>(null);
  // Publish target found in an already-initialised content repo.
  const [existingTarget, setExistingTarget] = useState<PublishTarget | null>(null);
  const [busy, setBusy] = useState(false);
  const [step, setStep] = useState<string | null>(null);
  const [progressLog, setProgressLog] = useState<string[]>([]);
  const [error, setError] = useState<ErrorState | null>(null);
  const [result, setResult] = useState<InstallResult | null>(null);

  function patch<K extends keyof SetupFormState>(key: K, value: SetupFormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function trimmed(): SetupFormState {
    return {
      ...form,
      apiKey: form.apiKey.trim(),
      authDomain: form.authDomain.trim(),
      projectId: form.projectId.trim(),
      storageBucket: form.storageBucket.trim(),
      messagingSenderId: form.messagingSenderId.trim(),
      appId: form.appId.trim(),
      adminEmail: form.adminEmail.trim().toLowerCase(),
      flexwegApiKey: form.flexwegApiKey.trim(),
      flexwegSiteUrl: form.flexwegSiteUrl.trim().replace(/\/+$/, ""),
      flexwegApiBaseUrl: form.flexwegApiBaseUrl.trim().replace(/\/+$/, "") || DEFAULT_FLEXWEG_API_BASE_URL,
      sqlitePath: form.sqlitePath.trim().replace(/^\/+|\/+$/g, ""),
    };
  }

  const progress = {
    step: (label: string) => setStep(label),
    done: (label: string) => setProgressLog((prev) => [...prev, label]),
  };

  async function run(task: () => Promise<void>) {
    setBusy(true);
    setError(null);
    try {
      await task();
    } catch (err) {
      setError(toErrorState(err));
    } finally {
      setBusy(false);
      setStep(null);
    }
  }

  // Step 1 → 2: verify the data backend's credentials (no writes yet).
  function continueFromData() {
    void run(async () => {
      const f = trimmed();
      let found: PublishTarget | null = null;
      if (backend === "firebase") {
        setStep(t("setup.steps.signInFirebase"));
        await verifyFirebase(f, t);
      } else if (backend === "markdown-git") {
        setStep(t("setup.docstore.checking"));
        found = await verifyGitContent(git, gitToken, t);
      }
      setExistingTarget(found);
      if (found) {
        setTarget(found);
        setTargetBackend(backend);
      } else if (!target || targetBackend !== backend) {
        setTarget(defaultTarget(backend, f, git));
        setTargetBackend(backend);
      }
      setWizardStep("hosting");
    });
  }

  // Step 2 → 3: the target must answer before anything is installed.
  function continueFromHosting() {
    if (!target) return;
    void run(async () => {
      if (target.connectorId !== "browser-mirror") {
        setStep(t("setup.docstore.steps.testTarget"));
        // An empty git token means "reuse each editor's own token" — not
        // stored yet at this point of the wizard, so test with the one
        // typed in step 1.
        const sameProvider =
          backend === "markdown-git" && target.connectorId === "git-pages" && target.settings.provider === git.provider;
        const settings =
          sameProvider && !target.settings.token ? { ...target.settings, token: gitToken } : target.settings;
        const res = await testStorageConnection(target.connectorId, settings);
        if (!res.ok) throw new SetupError("generic", `${t("connectors.testFailed")} — ${res.detail}`);
      }
      if (useFlexwegService) {
        await verifySqlite(flexwegServiceForm(), t);
      } else if (backend === "sqlite-file") {
        setSqliteExisting(await verifySqliteFile(target, sqlitePathOnHost, t));
      }
      setWizardStep("install");
    });
  }

  function install() {
    if (!target) return;
    setProgressLog([]);
    void run(async () => {
      const f = trimmed();
      // Reusing the repo's stored target: nothing to save.
      const toSave = existingTarget && target === existingTarget ? null : target;
      const opts = { hostAdminFolder: offerAdminHosting && hostAdmin ? adminFolder : null };
      const res =
        backend === "firebase"
          ? await installFirebase(f, target, progress, t, opts)
          : useFlexwegService
            ? await installSqlite(flexwegServiceForm(), target, progress, t, opts)
            : await installDocStore(
                backend === "sqlite-file"
                  ? { backend, location: target, path: sqlitePathOnHost }
                  : backend === "markdown-git"
                    ? { backend, git, token: gitToken }
                    : { backend: "local" },
                toSave,
                progress,
                t,
                { ...opts, reusedTarget: target },
              );
      setResult(res);
      // config.js next to this admin → the next load boots it directly.
      // When the admin was copied elsewhere, the done card links to it.
      if (res.configUploaded && !res.adminUrl) window.setTimeout(reloadAfterSetup, 2000);
    });
  }

  const useFlexwegService = backend === "sqlite-file" && flexwegService && target?.connectorId === "flexweg";

  // Flexweg SQLite service: its credentials are the Flexweg hosting ones.
  function flexwegServiceForm(): SetupFormState {
    const s = target?.settings ?? {};
    return {
      ...trimmed(),
      flexwegApiKey: String(s.apiKey ?? "").trim(),
      flexwegSiteUrl: String(s.siteUrl ?? "").trim().replace(/\/+$/, ""),
      flexwegApiBaseUrl: String(s.apiBaseUrl ?? "").trim().replace(/\/+$/, "") || DEFAULT_FLEXWEG_API_BASE_URL,
    };
  }

  // Admin self-hosting: any real web host except Flexweg (where the
  // admin is uploaded by hand / already lives) and the ZIP mirror; not
  // offered when this admin already runs from the target.
  const alreadyOnTarget = target ? currentAdminFolderOn(target) : null;
  const offerAdminHosting =
    canHostAdmin &&
    !!target &&
    target.connectorId !== "flexweg" &&
    target.connectorId !== "browser-mirror" &&
    !alreadyOnTarget;

  const showOverlay = busy && wizardStep === "install";
  const done = !!result;

  return (
    <div className="relative min-h-full flex items-center justify-center p-6 bg-surface-50 dark:bg-surface-950 overflow-hidden">
      {/* Floating colour blobs — branding accent reused from
          flexweg.com's home. Lives behind the form (z-index: 0) and
          ignores pointer events. CSS in src/index.css. */}
      <div className="flexweg-blobs" aria-hidden="true">
        <div className="flexweg-blob flexweg-blob-1"></div>
        <div className="flexweg-blob flexweg-blob-2"></div>
        <div className="flexweg-blob flexweg-blob-3"></div>
      </div>
      <div className="absolute top-4 right-4 z-10">
        <LocaleSwitcher />
      </div>
      {/* Render the overlay through a portal on <body> so its mount /
          unmount doesn't shuffle siblings inside the form tree. */}
      {(showOverlay || (result?.configUploaded && !result.adminUrl)) &&
        createPortal(
          <SetupProgressOverlay step={step} progressLog={progressLog} done={!!result?.configUploaded} />,
          document.body,
        )}
      <div className="w-full max-w-2xl relative z-10">
        <div className="flex items-center gap-2.5 justify-center mb-6">
          <img src={flexwegLogo} alt="Flexweg" className="h-10 w-10 rounded-xl shadow-card object-cover" />
          <div className="text-center">
            <p className="text-base font-semibold leading-none">{t("setup.title")}</p>
            <p className="text-[11px] text-surface-500 mt-0.5 dark:text-surface-400">{t("setup.subtitle")}</p>
          </div>
        </div>

        <Stepper currentStep={wizardStep} />

        {wizardStep === "terms" ? (
          <TermsStep onAccept={() => setWizardStep("data")} />
        ) : wizardStep === "data" ? (
          <WizardCard
            title={t("setup.data.title")}
            intro={t("setup.data.intro")}
            error={error}
            busy={busy}
            busyLabel={step}
            onBack={() => {
              setError(null);
              setWizardStep("terms");
            }}
            onContinue={continueFromData}
          >
            <BackendChoice value={backend} onChange={(b) => { setError(null); setBackend(b); }} />
            <div className="border-t border-surface-200 pt-5 dark:border-surface-700">
              {backend === "firebase" ? (
                <FirebaseFields form={form} patch={patch} />
              ) : backend === "sqlite-file" ? (
                <p className="text-sm text-surface-600 dark:text-surface-300">{t("setup.sqliteFile.dataNote")}</p>
              ) : backend === "markdown-git" ? (
                <GitContentFields git={git} setGit={setGit} token={gitToken} setToken={setGitTokenInput} />
              ) : (
                <p className="text-sm text-surface-600 dark:text-surface-300">{t("setup.data.localNote")}</p>
              )}
            </div>
          </WizardCard>
        ) : wizardStep === "hosting" ? (
          <WizardCard
            title={t("setup.hosting.title")}
            intro={t("setup.hosting.intro")}
            error={error}
            busy={busy}
            busyLabel={step}
            onBack={() => {
              setError(null);
              setWizardStep("data");
            }}
            onContinue={continueFromHosting}
          >
            {existingTarget && target === existingTarget && (
              <p className="rounded-lg bg-emerald-50 ring-1 ring-emerald-200 px-3 py-2 text-sm text-emerald-800 dark:bg-emerald-900/20 dark:ring-emerald-700/40 dark:text-emerald-200">
                {t("setup.hosting.existing")}
              </p>
            )}
            {target && (
              <PublishTargetForm
                value={target}
                onChange={setTarget}
                picker="cards"
                // A database file can't live in the in-browser ZIP mirror.
                exclude={backend === "sqlite-file" ? ["zip"] : []}
              />
            )}
            {backend === "sqlite-file" && target && (
              <SqliteHostingFields
                onFlexweg={target.connectorId === "flexweg"}
                useService={useFlexwegService}
                setUseService={setFlexwegService}
                path={sqlitePathOnHost}
                setPath={setSqlitePathOnHost}
                form={form}
                patch={patch}
              />
            )}
          </WizardCard>
        ) : result ? (
          <DoneCard result={result} />
        ) : (
          <WizardCard
            title={t("setup.install.title")}
            intro={t("setup.install.intro")}
            error={error}
            busy={busy}
            busyLabel={null}
            onBack={() => {
              setError(null);
              setWizardStep("hosting");
            }}
            onContinue={install}
            continueLabel={t("setup.docstore.install")}
          >
            <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 text-sm">
              <dt className="text-surface-500">{t("setup.install.data")}</dt>
              <dd className="font-medium">
                {t(`setup.data.options.${backend}.title`)}
                {backend === "sqlite-file" && (
                  <span className="block text-xs font-normal text-surface-500 break-all">
                    {useFlexwegService
                      ? t("setup.sqliteFile.summaryService", { path: form.sqlitePath })
                      : `${t("setup.sqliteFile.summaryFile", { path: sqlitePathOnHost })} · ${t(
                          sqliteExisting ? "setup.sqliteFile.existing" : "setup.sqliteFile.new",
                        )}`}
                  </span>
                )}
              </dd>
              <dt className="text-surface-500">{t("setup.install.hosting")}</dt>
              <dd className="font-medium">
                {target ? t(`hosting.${hostingOptionFor(target.connectorId, target.settings).id}.title`) : "—"}
                {typeof target?.settings.siteUrl === "string" && target.settings.siteUrl && (
                  <span className="block text-xs font-normal text-surface-500 break-all">{target.settings.siteUrl}</span>
                )}
              </dd>
            </dl>
            {offerAdminHosting && target && (
              <fieldset className="space-y-2 border-t border-surface-200 pt-4 dark:border-surface-700">
                <label className="flex items-start gap-2 text-sm">
                  <input type="checkbox" className="mt-1" checked={hostAdmin} onChange={(e) => setHostAdmin(e.target.checked)} />
                  <span>
                    <span className="font-medium">{t("setup.adminHosting.label")}</span>
                    <span className="block text-xs text-surface-500 dark:text-surface-400">
                      {t("setup.adminHosting.hint", { url: adminUrlOn(target, adminFolder) ?? `…/${adminFolder}/` })}
                    </span>
                  </span>
                </label>
                {hostAdmin && (
                  <Field label={t("setup.adminHosting.folder")} value={adminFolder} onChange={setAdminFolder} required />
                )}
              </fieldset>
            )}
            {alreadyOnTarget ? (
              <p className="text-xs text-surface-500 dark:text-surface-400">{t("setup.adminHosting.alreadyHere")}</p>
            ) : !(offerAdminHosting && hostAdmin) && (
              <p className="text-xs text-surface-500 dark:text-surface-400">
                {t(isDocStoreChoice(backend) ? "setup.install.noteLocalConfig" : "setup.install.noteConfigJs")}
              </p>
            )}
          </WizardCard>
        )}

        {!done && (
          <p className="text-[11px] text-surface-400 text-center mt-4 dark:text-surface-500">
            {t(isDocStoreChoice(backend) ? "setup.docstore.footer" : "setup.footer")}
          </p>
        )}
      </div>
    </div>
  );
}

// ─── Layout pieces ───────────────────────────────────────────────────────

function Stepper({ currentStep }: { currentStep: WizardStep }) {
  const { t } = useTranslation();
  const steps: Array<{ id: WizardStep; label: string }> = [
    { id: "terms", label: t("setup.stepper.terms") },
    { id: "data", label: t("setup.stepper.data") },
    { id: "hosting", label: t("setup.stepper.hosting") },
    { id: "install", label: t("setup.stepper.install") },
  ];
  const activeIndex = steps.findIndex((s) => s.id === currentStep);
  return (
    <div className="flex items-center justify-center gap-3 mb-6 flex-wrap">
      {steps.map((s, idx) => {
        const isActive = idx === activeIndex;
        const isDone = idx < activeIndex;
        return (
          <div key={s.id} className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <div
                className={
                  "h-6 w-6 rounded-full flex items-center justify-center text-[11px] font-semibold transition-colors " +
                  (isDone
                    ? "bg-emerald-500 text-white"
                    : isActive
                      ? "bg-blue-600 text-white"
                      : "bg-surface-200 text-surface-500 dark:bg-surface-800 dark:text-surface-400")
                }
              >
                {isDone ? <CheckCircle2 className="h-3.5 w-3.5" /> : idx + 1}
              </div>
              <span
                className={
                  "text-xs font-medium " +
                  (isActive ? "text-surface-900 dark:text-surface-50" : "text-surface-500 dark:text-surface-400")
                }
              >
                {s.label}
              </span>
            </div>
            {idx < steps.length - 1 && (
              <div className={"h-px w-8 transition-colors " + (isDone ? "bg-emerald-500" : "bg-surface-300 dark:bg-surface-700")} />
            )}
          </div>
        );
      })}
    </div>
  );
}

interface WizardCardProps {
  title: string;
  intro: string;
  error: ErrorState | null;
  busy: boolean;
  busyLabel: string | null;
  onBack: () => void;
  onContinue: () => void;
  continueLabel?: string;
  children: ReactNode;
}

function WizardCard({ title, intro, error, busy, busyLabel, onBack, onContinue, continueLabel, children }: WizardCardProps) {
  const { t } = useTranslation();
  return (
    <div className="card p-6">
      <h2 className="text-lg font-semibold text-surface-900 dark:text-surface-50">{title}</h2>
      <p className="text-sm text-surface-600 dark:text-surface-300 mt-2">{intro}</p>
      <form
        className="mt-5 space-y-5"
        data-form-type="other"
        onSubmit={(e: FormEvent<HTMLFormElement>) => {
          e.preventDefault();
          if (!busy) onContinue();
        }}
      >
        {children}
        <div aria-live="polite" aria-atomic="true">
          {error ? (
            <div className="rounded-lg bg-red-50 text-red-700 ring-1 ring-red-200 px-3 py-2 text-sm break-words dark:bg-red-900/30 dark:text-red-300 dark:ring-red-700/50">
              <ErrorMessage error={error} />
            </div>
          ) : busy && busyLabel ? (
            <p className="flex items-center gap-2 text-sm text-surface-600 dark:text-surface-300">
              <Loader2 className="h-4 w-4 animate-spin" />
              {busyLabel}
            </p>
          ) : null}
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <button type="button" onClick={onBack} className="btn-secondary flex-1 justify-center" disabled={busy}>
            {t("common.back")}
          </button>
          <button type="submit" className="btn-primary flex-1 justify-center" disabled={busy}>
            <span className="inline-flex items-center justify-center gap-1.5">
              <Loader2 className={"h-4 w-4 animate-spin " + (busy ? "" : "hidden")} />
              <span>{continueLabel ?? t("setup.backend.continue")}</span>
              <ArrowRight className={"h-4 w-4 " + (busy || continueLabel ? "hidden" : "")} />
            </span>
          </button>
        </div>
      </form>
    </div>
  );
}

const BACKENDS: Array<{ id: BackendChoice; icon: LucideIcon }> = [
  { id: "sqlite-file", icon: Database },
  { id: "markdown-git", icon: GitBranch },
  { id: "firebase", icon: Flame },
  { id: "local", icon: HardDrive },
];

function BackendChoice({ value, onChange }: { value: BackendChoice; onChange: (b: BackendChoice) => void }) {
  const { t } = useTranslation();
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
      {BACKENDS.map(({ id, icon: Icon }) => (
        <label
          key={id}
          className={
            "flex items-start gap-3 p-3 rounded-lg ring-1 ring-inset cursor-pointer transition-colors " +
            (value === id
              ? "ring-blue-500 bg-blue-50/60 dark:ring-blue-400 dark:bg-blue-900/20"
              : "ring-surface-200 hover:bg-surface-50 dark:ring-surface-700 dark:hover:bg-surface-800/60")
          }
        >
          <input type="radio" name="backend" checked={value === id} onChange={() => onChange(id)} className="mt-1" />
          <span className="flex-1 min-w-0">
            <span className="text-sm font-semibold flex items-center gap-1.5">
              <Icon className="h-4 w-4 text-surface-500" />
              {t(`setup.data.options.${id}.title`)}
            </span>
            <span className="block text-xs text-surface-500 dark:text-surface-400 mt-1 leading-relaxed">
              {t(`setup.data.options.${id}.hint`)}
            </span>
          </span>
        </label>
      ))}
    </div>
  );
}

type Patch = <K extends keyof SetupFormState>(key: K, value: SetupFormState[K]) => void;

function FirebaseFields({ form, patch }: { form: SetupFormState; patch: Patch }) {
  const { t } = useTranslation();
  return (
    <div className="space-y-6">
      <fieldset className="space-y-4">
        <legend className="text-sm font-semibold text-surface-900 dark:text-surface-50">{t("setup.sections.firebase")}</legend>
        <p className="text-xs text-surface-500 dark:text-surface-400">{t("setup.help.firebase")}</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Field label={t("setup.fields.apiKey")} value={form.apiKey} onChange={(v) => patch("apiKey", v)} required />
          <Field label={t("setup.fields.authDomain")} placeholder="your-project.firebaseapp.com" value={form.authDomain} onChange={(v) => patch("authDomain", v)} required />
          <Field label={t("setup.fields.projectId")} placeholder="your-project" value={form.projectId} onChange={(v) => patch("projectId", v)} required />
          <Field label={t("setup.fields.storageBucket")} placeholder="your-project.appspot.com" value={form.storageBucket} onChange={(v) => patch("storageBucket", v)} required />
          <Field label={t("setup.fields.messagingSenderId")} value={form.messagingSenderId} onChange={(v) => patch("messagingSenderId", v)} required />
          <Field label={t("setup.fields.appId")} value={form.appId} onChange={(v) => patch("appId", v)} required />
        </div>
      </fieldset>
      <fieldset className="space-y-4">
        <legend className="text-sm font-semibold text-surface-900 dark:text-surface-50">{t("setup.sections.admin")}</legend>
        <p className="text-xs text-surface-500 dark:text-surface-400">{t("setup.help.admin")}</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Field type="email" label={t("setup.fields.adminEmail")} placeholder="you@company.com" value={form.adminEmail} onChange={(v) => patch("adminEmail", v)} required autoComplete="email" />
          <Field type="password" label={t("setup.fields.adminPassword")} placeholder="••••••••" value={form.adminPassword} onChange={(v) => patch("adminPassword", v)} required autoComplete="current-password" />
        </div>
      </fieldset>
    </div>
  );
}

interface SqliteHostingFieldsProps {
  onFlexweg: boolean;
  useService: boolean;
  setUseService: (v: boolean) => void;
  path: string;
  setPath: (path: string) => void;
  form: SetupFormState;
  patch: Patch;
}

// SQLite storage on the chosen hosting: a database file (path below), or
// — on Flexweg only — Flexweg's SQLite service with user accounts.
function SqliteHostingFields({ onFlexweg, useService, setUseService, path, setPath, form, patch }: SqliteHostingFieldsProps) {
  const { t } = useTranslation();
  return (
    <fieldset className="space-y-3 border-t border-surface-200 pt-5 dark:border-surface-700">
      <legend className="text-sm font-semibold text-surface-900 dark:text-surface-50">{t("setup.sqliteFile.heading")}</legend>
      {onFlexweg && (
        <label className="flex items-start gap-2 text-sm">
          <input type="checkbox" className="mt-1" checked={useService} onChange={(e) => setUseService(e.target.checked)} />
          <span>
            <span className="font-medium">{t("setup.sqliteFile.flexwegService")}</span>
            <span className="block text-xs text-surface-500 dark:text-surface-400">{t("setup.sqliteFile.flexwegServiceHint")}</span>
          </span>
        </label>
      )}
      {useService ? (
        <>
          <div>
            <Field label={t("setup.fields.sqlitePath")} placeholder="admin/cms.sqlite" value={form.sqlitePath} onChange={(v) => patch("sqlitePath", v)} required />
            <p className="text-[11px] text-surface-500 dark:text-surface-400 mt-1">{t("setup.sqlite.pathHint")}</p>
          </div>
          <p className="text-xs text-surface-500 dark:text-surface-400">{t("setup.sqlite.adminIntro")}</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Field type="email" label={t("setup.fields.adminEmail")} placeholder="you@company.com" value={form.adminEmail} onChange={(v) => patch("adminEmail", v)} required autoComplete="email" />
            <Field type="password" label={t("setup.fields.adminPassword")} placeholder="••••••••" value={form.adminPassword} onChange={(v) => patch("adminPassword", v)} required autoComplete="new-password" />
          </div>
          <p className="text-[11px] text-surface-500 dark:text-surface-400">{t("setup.sqlite.passwordHint")}</p>
        </>
      ) : (
        <>
          <div className="rounded-lg bg-amber-50 text-amber-800 ring-1 ring-amber-200 px-3 py-2 text-xs leading-relaxed dark:bg-amber-900/30 dark:text-amber-200 dark:ring-amber-700/50">
            {t("setup.sqliteFile.security")}
          </div>
          <div>
            <Field label={t("setup.sqliteFile.path")} value={path} onChange={setPath} required placeholder="admin/data/cms.sqlite" />
            <p className="text-[11px] text-surface-500 dark:text-surface-400 mt-1">{t("setup.sqliteFile.pathHint")}</p>
          </div>
        </>
      )}
    </fieldset>
  );
}

interface GitContentFieldsProps {
  git: GitContent;
  setGit: (next: GitContent) => void;
  token: string;
  setToken: (token: string) => void;
}

function GitContentFields({ git, setGit, token, setToken }: GitContentFieldsProps) {
  const { t } = useTranslation();
  const [folderName, setFolderName] = useState<string | null>(null);
  const patchGit = (p: Partial<GitContent>) => setGit({ ...git, ...p });

  async function chooseFolder() {
    const handle = await pickLocalFolder();
    await saveFolderHandle(LOCAL_CONTENT_HANDLE_KEY, handle);
    setFolderName(handle.name);
  }

  return (
    <div className="space-y-3">
      <p className="text-xs text-surface-500 dark:text-surface-400">{t("setup.docstore.contentIntro")}</p>
      <div>
        <label className="label">{t("connectors.fields.git-pages.provider")}</label>
        <select className="input" value={git.provider} onChange={(e) => patchGit({ provider: e.target.value as GitContent["provider"] })}>
          <option value="github">GitHub</option>
          <option value="gitlab">GitLab</option>
          <option value="local" disabled={!isLocalFolderSupported()}>
            {t("setup.docstore.localClone")}
          </option>
        </select>
      </div>
      {git.provider === "github" && (
        <div className="grid grid-cols-2 gap-3">
          <Field label={t("connectors.fields.git-pages.owner")} value={git.owner ?? ""} onChange={(v) => patchGit({ owner: v })} required />
          <Field label={t("connectors.fields.git-pages.repo")} value={git.repo ?? ""} onChange={(v) => patchGit({ repo: v })} required />
        </div>
      )}
      {git.provider === "gitlab" && (
        <Field label={t("connectors.fields.git-pages.project")} placeholder="group/my-content" value={git.project ?? ""} onChange={(v) => patchGit({ project: v })} required />
      )}
      {git.provider !== "local" ? (
        <>
          <div className="grid grid-cols-2 gap-3">
            <Field label={t("connectors.fields.git-pages.branch")} value={git.branch} onChange={(v) => patchGit({ branch: v })} required />
            <Field label={t("setup.docstore.contentDir")} value={git.contentDir} onChange={(v) => patchGit({ contentDir: v })} />
          </div>
          <div>
            <Field label={t("gitAccess.token")} type="password" value={token} onChange={setToken} required autoComplete="off" />
            <p className="text-xs text-surface-500 mt-1 dark:text-surface-400">
              {t(git.provider === "github" ? "gitAccess.tokenHelpGithub" : "gitAccess.tokenHelpGitlab")} {t("setup.docstore.privateRepo")}
            </p>
          </div>
          <Field label={t("connectors.fields.git-pages.apiBaseUrl")} value={git.apiBaseUrl ?? ""} onChange={(v) => patchGit({ apiBaseUrl: v })} />
        </>
      ) : (
        <div className="space-y-2">
          <Field label={t("setup.docstore.contentDir")} value={git.contentDir} onChange={(v) => patchGit({ contentDir: v })} />
          <button type="button" className="btn-secondary" onClick={chooseFolder}>
            <span className="inline-flex items-center gap-1.5">
              <FolderOpen className="h-4 w-4" />
              <span>{folderName ?? t("connectors.folder.choose")}</span>
            </span>
          </button>
          <p className="text-xs text-surface-500 dark:text-surface-400">{t("setup.docstore.localCloneHint")}</p>
        </div>
      )}
    </div>
  );
}

// Shown when config.js could NOT be written next to the admin (non-
// Flexweg hosting, local dev): the config lives in this browser and is
// offered as a download for the admin folder.
function DoneCard({ result }: { result: InstallResult }) {
  const { t } = useTranslation();
  if (result.adminUrl) {
    return (
      <div className="card p-6 space-y-4">
        <p className="flex items-center gap-2 text-base font-semibold text-emerald-700 dark:text-emerald-400">
          <CheckCircle2 className="h-5 w-5" />
          {t("setup.docstore.doneTitle")}
        </p>
        <p className="text-sm text-surface-600 dark:text-surface-300">{t("setup.adminHosting.doneBody")}</p>
        <a className="btn-primary w-full justify-center" href={result.adminUrl} target="_blank" rel="noopener noreferrer">
          {t("setup.adminHosting.open", { url: result.adminUrl })}
        </a>
        <button type="button" className="btn-secondary w-full justify-center" onClick={reloadAfterSetup}>
          {t("setup.adminHosting.continueHere")}
        </button>
      </div>
    );
  }
  if (result.configUploaded) return null;
  return (
    <div className="card p-6 space-y-4">
      <p className="flex items-center gap-2 text-base font-semibold text-emerald-700 dark:text-emerald-400">
        <CheckCircle2 className="h-5 w-5" />
        {t("setup.docstore.doneTitle")}
      </p>
      <p className="text-sm text-surface-600 dark:text-surface-300">{t("setup.docstore.doneBody")}</p>
      <button type="button" className="btn-secondary w-full justify-center" onClick={() => downloadConfigJs(result.runtime)}>
        <span className="inline-flex items-center gap-1.5">
          <Download className="h-4 w-4" />
          <span>{t("setup.docstore.downloadConfig")}</span>
        </span>
      </button>
      <button type="button" className="btn-primary w-full justify-center" onClick={reloadAfterSetup}>
        {t("setup.docstore.open")}
      </button>
    </div>
  );
}


interface TermsStepProps {
  onAccept: () => void;
}

// 7-section terms wall. Each section's title + body is i18n'd under
// setup.terms.section{N}.{title,body} so we map over a fixed range
// without changing this component when the text is edited.
const TERMS_SECTION_COUNT = 7;

function TermsStep({ onAccept }: TermsStepProps) {
  const { t } = useTranslation();
  const [accepted, setAccepted] = useState(false);
  return (
    <div className="card p-6">
      <h2 className="text-lg font-semibold text-surface-900 dark:text-surface-50">
        {t("setup.terms.title")}
      </h2>
      <p className="text-sm text-surface-600 dark:text-surface-300 mt-3">
        {t("setup.terms.intro")}
      </p>

      <div className="mt-5 max-h-80 overflow-y-auto pr-2 space-y-4 rounded-lg border border-surface-200 bg-surface-50 p-4 dark:border-surface-700 dark:bg-surface-900/40">
        {Array.from({ length: TERMS_SECTION_COUNT }, (_, i) => i + 1).map(
          (n) => (
            <section key={n}>
              <h3 className="text-sm font-semibold text-surface-900 dark:text-surface-50">
                {t(`setup.terms.section${n}.title`)}
              </h3>
              <p className="text-xs text-surface-600 dark:text-surface-300 mt-1.5 leading-relaxed">
                {t(`setup.terms.section${n}.body`)}
              </p>
            </section>
          ),
        )}
      </div>

      <label className="mt-5 flex items-start gap-2.5 cursor-pointer">
        <input
          type="checkbox"
          className="mt-0.5 h-4 w-4 rounded border-surface-300 text-blue-600 focus:ring-blue-500 dark:border-surface-600 dark:bg-surface-800"
          checked={accepted}
          onChange={(e) => setAccepted(e.target.checked)}
        />
        <span className="text-sm text-surface-700 dark:text-surface-200">
          {t("setup.terms.accept")}
        </span>
      </label>

      {/* Terms is the first step now (Welcome was dropped). No back
          button — the wizard begins here. */}
      <div className="mt-6 flex justify-end">
        <button
          type="button"
          onClick={onAccept}
          disabled={!accepted}
          className="btn-primary justify-center"
        >
          <span className="inline-flex items-center justify-center gap-1.5">
            <span>{t("setup.terms.continue")}</span>
            <ArrowRight className="h-4 w-4" />
          </span>
        </button>
      </div>
    </div>
  );
}


interface FieldProps {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  required?: boolean;
  type?: string;
  autoComplete?: string;
  autoFocus?: boolean;
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  required,
  type = "text",
  autoComplete,
  autoFocus,
}: FieldProps) {
  return (
    <div>
      <label className="label">{label}</label>
      <input
        type={type}
        className="input"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        required={required}
        autoComplete={autoComplete}
        autoFocus={autoFocus}
      />
    </div>
  );
}

function ErrorMessage({ error }: { error: ErrorState }) {
  const { t } = useTranslation();
  switch (error.kind) {
    case "missingFields":
      return <span>{t("setup.errors.missingFields")}</span>;
    case "rootDeployment":
      return (
        <div className="space-y-1.5">
          <p>{t("setup.errors.rootDeploymentTitle")}</p>
          <p className="text-xs">{t("setup.errors.rootDeploymentHint")}</p>
        </div>
      );
    case "firebaseAuth":
      return <span>{error.detail ?? t("setup.errors.firebaseAuthGeneric")}</span>;
    case "firebaseAuthInvalidCredential":
      return (
        <div className="space-y-1.5">
          <p>{t("setup.errors.firebaseAuthInvalidCredential")}</p>
          <p className="text-xs whitespace-pre-line leading-relaxed">
            {t("setup.errors.firebaseAuthInvalidCredentialHint")}
          </p>
        </div>
      );
    case "wrongAdminEmail":
      return <span>{t("setup.errors.wrongAdminEmail")}</span>;
    case "rulesNotPinned":
      return (
        <div className="space-y-1.5">
          <p>{t("setup.errors.rulesNotPinnedTitle")}</p>
          <p className="text-xs leading-relaxed">
            {t("setup.errors.rulesNotPinnedHint", { email: error.detail ?? "" })}
          </p>
        </div>
      );
    case "flexwegAuth":
      return <span>{t("setup.errors.flexwegAuth")}</span>;
    case "flexwegNetwork":
      return <span>{t("setup.errors.flexwegNetwork")}</span>;
    case "firestoreRules":
      return (
        <div className="space-y-1.5">
          <p>{t("setup.errors.firestoreRulesTitle")}</p>
          <p className="text-xs">
            {t("setup.errors.firestoreRulesHint", { email: error.detail })}
          </p>
        </div>
      );
    case "firestoreOther":
      return (
        <span>
          {t("setup.errors.firestoreOther")}: {error.detail}
        </span>
      );
    case "uploadFailed":
      return (
        <span>
          {t("setup.errors.uploadFailed")}
          {error.detail ? `: ${error.detail}` : ""}
        </span>
      );
    case "generic":
    default:
      return <span>{error.detail ?? t("setup.errors.generic")}</span>;
  }
}

interface ProgressOverlayProps {
  step: string | null;
  progressLog: string[];
  done: boolean;
}

// Full-screen overlay rendered while the SetupForm submit handler is
// running. Without this the form looked frozen on slow networks.
function SetupProgressOverlay({
  step,
  progressLog,
  done,
}: ProgressOverlayProps) {
  const { t } = useTranslation();
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-surface-950/80 backdrop-blur-sm p-6">
      <div className="card w-full max-w-md p-6 text-center">
        {done ? (
          <CheckCircle2 className="h-10 w-10 text-emerald-500 mx-auto mb-4" />
        ) : (
          <Loader2 className="h-10 w-10 text-blue-500 mx-auto mb-4 animate-spin" />
        )}
        <h2 className="text-lg font-semibold text-surface-900 dark:text-surface-50">
          {done ? t("setup.success") : t("setup.submitting")}
        </h2>
        {!done && step && (
          <p className="text-sm text-surface-600 dark:text-surface-300 mt-2">
            {step}
          </p>
        )}
        {progressLog.length > 0 && (
          <ul className="mt-5 space-y-1.5 text-left">
            {progressLog.map((entry, idx) => (
              <li
                key={idx}
                className="flex items-start gap-2 text-xs text-surface-500 dark:text-surface-400"
              >
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0 mt-0.5" />
                <span>{entry}</span>
              </li>
            ))}
          </ul>
        )}
        {done && (
          <p className="text-xs text-surface-500 dark:text-surface-400 mt-4">
            {t("setup.reloadingHint")}
          </p>
        )}
      </div>
    </div>
  );
}
