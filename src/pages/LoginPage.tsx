import { useEffect, useRef, useState, type FormEvent, type ReactNode } from "react";
import { Loader2, LogOut, Mail, MailCheck, RefreshCw, UserX } from "lucide-react";
import { useTranslation } from "react-i18next";
import {
  authErrorKey,
  completeEmailLinkSignIn,
  emailForSignInLink,
  isEmailSignInLink,
  sendResetEmail,
  sendSignInLink,
  sendVerificationEmail,
  signIn,
  signInWithGoogle,
  signOut,
} from "../services/auth";
import { useAuth } from "../context/AuthContext";
import { getSignInMethods } from "../lib/runtimeConfig";
import { LocaleSwitcher } from "../components/ui/LocaleSwitcher";
import agentcmsLogo from "../assets/agentcms-logo.svg";

// Firebase sign-in. The site picks its methods (config.js
// `signInMethods`, default password only): email + password, a one-time
// link sent by email, and/or a Google account. Whatever the method, only
// the bootstrap admin and addresses an admin invited get access (rules).

function Shell({ children }: { children: ReactNode }) {
  const { t } = useTranslation();
  return (
    <div className="relative min-h-full flex items-center justify-center p-6 bg-surface-50 dark:bg-surface-950">
      <div className="absolute top-4 right-4 z-10">
        <LocaleSwitcher />
      </div>
      <div className="w-full max-w-sm">
        <div className="flex items-center gap-2.5 justify-center mb-6">
          <img src={agentcmsLogo} alt="AgentCMS" className="h-10 w-10 rounded-xl shadow-card object-cover" />
          <div>
            <p className="text-base font-semibold leading-none">{t("common.appName")}</p>
            <p className="text-[11px] text-surface-500 mt-0.5 dark:text-surface-400">Static publisher</p>
          </div>
        </div>
        <div className="card p-6">{children}</div>
        <p className="text-[11px] text-surface-400 text-center mt-4 dark:text-surface-500">{t("auth.footer")}</p>
      </div>
    </div>
  );
}

function Messages({ errorKey, info }: { errorKey: string | null; info: string | null }) {
  const { t } = useTranslation();
  return (
    <>
      {errorKey && (
        <div className="rounded-lg bg-red-50 text-red-700 ring-1 ring-red-200 px-3 py-2 text-sm dark:bg-red-900/30 dark:text-red-300 dark:ring-red-700/50">
          {t(errorKey)}
        </div>
      )}
      {info && (
        <div className="rounded-lg bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200 px-3 py-2 text-sm dark:bg-emerald-900/30 dark:text-emerald-300 dark:ring-emerald-700/50">
          {info}
        </div>
      )}
    </>
  );
}

// The "G" mark, drawn inline (no external asset).
function GoogleMark() {
  return (
    <svg viewBox="0 0 48 48" className="h-4 w-4" aria-hidden="true">
      <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z" />
      <path fill="#FF3D00" d="m6.3 14.7 6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z" />
      <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-7.9l-6.5 5C9.5 39.6 16.2 44 24 44z" />
      <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.3-.1-2.4-.4-3.5z" />
    </svg>
  );
}

export function LoginPage() {
  const { t } = useTranslation();
  const methods = getSignInMethods();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState<null | "password" | "link" | "google" | "complete">(null);
  const [errorKey, setErrorKey] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  // Opened from the email link: finish the sign-in (asks for the address
  // when the link is opened in another browser).
  const [linkPending, setLinkPending] = useState(() => isEmailSignInLink());
  const autoCompleted = useRef(false);

  async function run(kind: NonNullable<typeof busy>, fn: () => Promise<void>) {
    setBusy(kind);
    setErrorKey(null);
    setInfo(null);
    try {
      await fn();
    } catch (err) {
      setErrorKey(authErrorKey(err));
    } finally {
      setBusy(null);
    }
  }

  const completeLink = (address: string) =>
    run("complete", async () => {
      await completeEmailLinkSignIn(address);
      setLinkPending(false);
    });

  useEffect(() => {
    if (!linkPending || autoCompleted.current) return;
    const saved = emailForSignInLink();
    if (saved) {
      autoCompleted.current = true;
      void completeLink(saved);
    }
    // completeLink is recreated each render; run once on mount.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [linkPending]);

  function handlePassword(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!email.trim() || !password) {
      setErrorKey("auth.emailPasswordRequired");
      return;
    }
    void run("password", async () => {
      await signIn(email, password);
    });
  }

  function handleLink() {
    if (!email.trim()) {
      setErrorKey("auth.enterEmailFirst");
      return;
    }
    void run("link", async () => {
      await sendSignInLink(email);
      setInfo(t("auth.linkSent", { email: email.trim() }));
    });
  }

  function handleReset() {
    if (!email.trim()) {
      setErrorKey("auth.enterEmailFirst");
      return;
    }
    void run("password", async () => {
      await sendResetEmail(email);
      setInfo(t("auth.resetEmailSent", { email: email.trim() }));
    });
  }

  if (linkPending) {
    return (
      <Shell>
        <h1 className="text-base font-semibold text-surface-900 dark:text-surface-50">{t("auth.linkConfirmTitle")}</h1>
        <p className="text-sm text-surface-500 mt-1 dark:text-surface-400">{t("auth.linkConfirmText")}</p>
        <form
          className="mt-5 space-y-4"
          data-form-type="other"
          onSubmit={(e) => {
            e.preventDefault();
            if (email.trim()) void completeLink(email);
          }}
        >
          <input
            type="email"
            autoComplete="email"
            className="input"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={t("auth.emailPlaceholder")}
            autoFocus
          />
          <Messages errorKey={errorKey} info={info} />
          <button type="submit" className="btn-primary w-full" disabled={busy !== null}>
            <span className="inline-flex items-center justify-center gap-1.5">
              <Loader2 className={"h-4 w-4 animate-spin " + (busy ? "" : "hidden")} />
              <span>{t("auth.signIn")}</span>
            </span>
          </button>
        </form>
      </Shell>
    );
  }

  const usesEmail = methods.includes("password") || methods.includes("emailLink");

  return (
    <Shell>
      <h1 className="text-base font-semibold text-surface-900 dark:text-surface-50">{t("auth.signIn")}</h1>
      <p className="text-sm text-surface-500 mt-1 dark:text-surface-400">{t("auth.signInSubtitle")}</p>

      <div className="mt-5 space-y-4">
        {methods.includes("google") && (
          <button
            type="button"
            className="btn-secondary w-full justify-center"
            disabled={busy !== null}
            onClick={() =>
              void run("google", async () => {
                await signInWithGoogle();
              })
            }
          >
            <span className="inline-flex items-center justify-center gap-2">
              <Loader2 className={"h-4 w-4 animate-spin " + (busy === "google" ? "" : "hidden")} />
              <span className={busy === "google" ? "hidden" : "inline-flex"}>
                <GoogleMark />
              </span>
              <span>{t("auth.continueWithGoogle")}</span>
            </span>
          </button>
        )}

        {methods.includes("google") && usesEmail && (
          <div className="flex items-center gap-3 text-[11px] uppercase tracking-wide text-surface-400">
            <span className="h-px flex-1 bg-surface-200 dark:bg-surface-700" />
            {t("auth.or")}
            <span className="h-px flex-1 bg-surface-200 dark:bg-surface-700" />
          </div>
        )}

        {usesEmail && (
          // data-form-type="other": keeps password managers from injecting
          // DOM into the form (Node.insertBefore crashes on re-render).
          <form onSubmit={handlePassword} className="space-y-4" data-form-type="other">
            <div>
              <label className="label" htmlFor="login-email">
                {t("auth.email")}
              </label>
              <input
                id="login-email"
                type="email"
                autoComplete="email"
                className="input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t("auth.emailPlaceholder")}
                autoFocus={!methods.includes("google")}
              />
            </div>
            {methods.includes("password") && (
              <div>
                <label className="label" htmlFor="login-password">
                  {t("auth.password")}
                </label>
                <input
                  id="login-password"
                  type="password"
                  autoComplete="current-password"
                  className="input"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={t("auth.passwordPlaceholder")}
                />
              </div>
            )}

            <Messages errorKey={errorKey} info={info} />

            {methods.includes("password") && (
              <button type="submit" className="btn-primary w-full" disabled={busy !== null}>
                <span className="inline-flex items-center justify-center gap-1.5">
                  <Loader2 className={"h-4 w-4 animate-spin " + (busy === "password" ? "" : "hidden")} />
                  <span>{busy === "password" ? t("auth.signingIn") : t("auth.signIn")}</span>
                </span>
              </button>
            )}
            {methods.includes("emailLink") && (
              <button
                type="button"
                className={(methods.includes("password") ? "btn-secondary" : "btn-primary") + " w-full justify-center"}
                onClick={handleLink}
                disabled={busy !== null}
              >
                <span className="inline-flex items-center justify-center gap-1.5">
                  <Loader2 className={"h-4 w-4 animate-spin " + (busy === "link" ? "" : "hidden")} />
                  <Mail className={"h-4 w-4 " + (busy === "link" ? "hidden" : "")} />
                  <span>{t("auth.sendLink")}</span>
                </span>
              </button>
            )}
            {methods.includes("password") && (
              <button type="button" className="btn-ghost w-full text-sm" onClick={handleReset} disabled={busy !== null}>
                {t("auth.forgotPassword")}
              </button>
            )}
          </form>
        )}

        {!usesEmail && <Messages errorKey={errorKey} info={info} />}
      </div>
    </Shell>
  );
}

// Signed in to Firebase, but no access: the address isn't verified yet
// (password accounts) or no admin invited it.
export function AccountAccessPage({ reason }: { reason: "unverified" | "not-invited" }) {
  const { t } = useTranslation();
  const { user, retryAccess } = useAuth();
  const [busy, setBusy] = useState<null | "send" | "retry">(null);
  const [errorKey, setErrorKey] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const email = user?.email ?? "";

  async function run(kind: "send" | "retry", fn: () => Promise<void>) {
    setBusy(kind);
    setErrorKey(null);
    setInfo(null);
    try {
      await fn();
    } catch (err) {
      setErrorKey(authErrorKey(err));
    } finally {
      setBusy(null);
    }
  }

  const Icon = reason === "unverified" ? MailCheck : UserX;
  return (
    <Shell>
      <div className="flex items-center gap-2">
        <Icon className="h-5 w-5 text-amber-500" />
        <h1 className="text-base font-semibold text-surface-900 dark:text-surface-50">
          {t(reason === "unverified" ? "auth.access.unverifiedTitle" : "auth.access.notInvitedTitle")}
        </h1>
      </div>
      <p className="text-sm text-surface-500 mt-2 dark:text-surface-400">
        {t(reason === "unverified" ? "auth.access.unverifiedText" : "auth.access.notInvitedText", { email })}
      </p>
      <div className="mt-5 space-y-3">
        <Messages errorKey={errorKey} info={info} />
        {reason === "unverified" && (
          <button
            type="button"
            className="btn-secondary w-full justify-center"
            disabled={busy !== null}
            onClick={() =>
              void run("send", async () => {
                await sendVerificationEmail();
                setInfo(t("auth.access.verificationSent", { email }));
              })
            }
          >
            <span className="inline-flex items-center justify-center gap-1.5">
              <Loader2 className={"h-4 w-4 animate-spin " + (busy === "send" ? "" : "hidden")} />
              <Mail className={"h-4 w-4 " + (busy === "send" ? "hidden" : "")} />
              <span>{t("auth.access.sendVerification")}</span>
            </span>
          </button>
        )}
        <button type="button" className="btn-primary w-full justify-center" disabled={busy !== null} onClick={() => void run("retry", retryAccess)}>
          <span className="inline-flex items-center justify-center gap-1.5">
            <Loader2 className={"h-4 w-4 animate-spin " + (busy === "retry" ? "" : "hidden")} />
            <RefreshCw className={"h-4 w-4 " + (busy === "retry" ? "hidden" : "")} />
            <span>{t("auth.access.retry")}</span>
          </span>
        </button>
        <button type="button" className="btn-ghost w-full justify-center text-sm" onClick={() => void signOut()}>
          <span className="inline-flex items-center justify-center gap-1.5">
            <LogOut className="h-4 w-4" />
            <span>{t("auth.access.useAnother")}</span>
          </span>
        </button>
      </div>
    </Shell>
  );
}
