import { spawn, type ChildProcess } from "node:child_process";
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

// Screenshots of a previewed site with a locally installed Chrome /
// Chromium / Edge, driven over the DevTools protocol: real device
// emulation (a phone viewport, which window sizes can't give — desktop
// windows have a minimum width) and full-page captures. Optional:
// callers get `browser: null` when no browser is found.

const CANDIDATES = [
  process.env.CHROME_PATH,
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  "/Applications/Chromium.app/Contents/MacOS/Chromium",
  "/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge",
  "/Applications/Brave Browser.app/Contents/MacOS/Brave Browser",
  "/usr/bin/google-chrome",
  "/usr/bin/google-chrome-stable",
  "/usr/bin/chromium",
  "/usr/bin/chromium-browser",
  "/usr/bin/microsoft-edge",
  "/snap/bin/chromium",
  "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
  "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe",
  "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe",
];

export function findChrome(): string | null {
  for (const c of CANDIDATES) if (c && existsSync(c)) return c;
  return null;
}

export const VIEWPORTS = {
  desktop: { width: 1280, height: 800, mobile: false, scale: 1 },
  mobile: { width: 390, height: 844, mobile: true, scale: 2 },
} as const;

export interface Screenshot {
  page: string;
  viewport: keyof typeof VIEWPORTS;
  file: string;
}

// Minimal DevTools-protocol client over the browser websocket.
class Cdp {
  private id = 0;
  private pending = new Map<number, { resolve: (v: unknown) => void; reject: (e: Error) => void }>();
  private waiters: Array<{ method: string; sessionId?: string; resolve: (p: unknown) => void }> = [];
  constructor(private ws: WebSocket) {
    ws.addEventListener("message", (ev) => {
      const msg = JSON.parse(String(ev.data)) as { id?: number; method?: string; sessionId?: string; result?: unknown; error?: { message: string }; params?: unknown };
      if (msg.id !== undefined) {
        const p = this.pending.get(msg.id);
        if (!p) return;
        this.pending.delete(msg.id);
        if (msg.error) p.reject(new Error(msg.error.message));
        else p.resolve(msg.result);
      } else if (msg.method) {
        this.waiters = this.waiters.filter((w) => {
          if (w.method === msg.method && (!w.sessionId || w.sessionId === msg.sessionId)) {
            w.resolve(msg.params);
            return false;
          }
          return true;
        });
      }
    });
  }
  send<T = Record<string, unknown>>(method: string, params: Record<string, unknown> = {}, sessionId?: string): Promise<T> {
    const id = ++this.id;
    this.ws.send(JSON.stringify({ id, method, params, ...(sessionId ? { sessionId } : {}) }));
    return new Promise<T>((resolve, reject) => this.pending.set(id, { resolve: resolve as (v: unknown) => void, reject }));
  }
  once(method: string, sessionId: string, timeoutMs: number): Promise<unknown> {
    return new Promise((resolve) => {
      const w = { method, sessionId, resolve };
      this.waiters.push(w);
      setTimeout(() => {
        this.waiters = this.waiters.filter((x) => x !== w);
        resolve(null);
      }, timeoutMs);
    });
  }
}

async function launch(chrome: string): Promise<{ proc: ChildProcess; cdp: Cdp; ws: WebSocket; profile: string }> {
  const profile = mkdtempSync(join(tmpdir(), "agentcms-chrome-"));
  const proc = spawn(
    chrome,
    ["--headless=new", "--disable-gpu", "--no-first-run", "--no-default-browser-check", "--hide-scrollbars", "--remote-debugging-port=0", `--user-data-dir=${profile}`, "about:blank"],
    { stdio: "ignore" },
  );
  const portFile = join(profile, "DevToolsActivePort");
  const started = Date.now();
  while (!existsSync(portFile) || readFileSync(portFile, "utf8").split("\n").length < 2) {
    if (Date.now() - started > 20_000 || proc.exitCode !== null) {
      proc.kill();
      throw new Error("the browser did not start");
    }
    await new Promise((r) => setTimeout(r, 100));
  }
  const [port, path] = readFileSync(portFile, "utf8").split("\n");
  const ws = new WebSocket(`ws://127.0.0.1:${port.trim()}${path.trim()}`);
  await new Promise<void>((resolve, reject) => {
    ws.addEventListener("open", () => resolve(), { once: true });
    ws.addEventListener("error", () => reject(new Error("could not connect to the browser")), { once: true });
  });
  return { proc, cdp: new Cdp(ws), ws, profile };
}

// prefers-color-scheme of the captures: light unless asked otherwise, so
// screenshots don't depend on this computer's appearance setting.
let colorScheme: "light" | "dark" = "light";
export function setScreenshotColorScheme(value: unknown): void {
  if (value === undefined || value === false) return;
  if (value !== "light" && value !== "dark") throw new Error(`--color-scheme is light or dark, not "${String(value)}".`);
  colorScheme = value;
}

async function capture(cdp: Cdp, url: string, vp: (typeof VIEWPORTS)[keyof typeof VIEWPORTS], file: string, script: string | undefined, maxHeight: number): Promise<void> {
  const { targetId } = await cdp.send<{ targetId: string }>("Target.createTarget", { url: "about:blank" });
  const { sessionId } = await cdp.send<{ sessionId: string }>("Target.attachToTarget", { targetId, flatten: true });
  try {
    await cdp.send("Page.enable", {}, sessionId);
    await cdp.send("Emulation.setDeviceMetricsOverride", { width: vp.width, height: vp.height, deviceScaleFactor: vp.scale, mobile: vp.mobile }, sessionId);
    if (vp.mobile) await cdp.send("Emulation.setTouchEmulationEnabled", { enabled: true }, sessionId);
    await cdp.send("Emulation.setEmulatedMedia", { features: [{ name: "prefers-color-scheme", value: colorScheme }] }, sessionId);
    const loaded = cdp.once("Page.loadEventFired", sessionId, 15_000);
    await cdp.send("Page.navigate", { url }, sessionId);
    await loaded;
    // Lazy images and iframes (embeds) below the fold would stay blank in
    // a full-page capture.
    await cdp.send(
      "Runtime.evaluate",
      {
        expression: `(async () => { for (const i of document.querySelectorAll('img[loading="lazy"]')) i.loading = "eager"; for (const f of document.querySelectorAll('iframe[loading="lazy"]')) { f.loading = "eager"; f.src = f.src; } await Promise.all([...document.images].map((i) => i.complete ? 0 : new Promise((r) => { i.onload = i.onerror = r; setTimeout(r, 3000); }))); })()`,
        awaitPromise: true,
      },
      sessionId,
    );
    // Scroll-triggered reveals (IntersectionObserver fade-ins) leave
    // everything below the fold hidden in a full-page capture: scroll
    // through the page once, give the transitions time to end, back to
    // the top.
    await cdp.send(
      "Runtime.evaluate",
      {
        expression: `(async () => { const wait = (ms) => new Promise((r) => setTimeout(r, ms)); const step = Math.max(200, Math.floor(innerHeight * 0.8)); for (let y = 0; y < document.documentElement.scrollHeight; y += step) { scrollTo(0, y); await wait(120); } scrollTo(0, document.documentElement.scrollHeight); await wait(900); scrollTo(0, 0); await wait(300); })()`,
        awaitPromise: true,
      },
      sessionId,
    );
    // Fonts, runtime loaders (menus from data/menu.json…), embeds.
    const { result: frames } = await cdp.send<{ result: { value?: number } }>("Runtime.evaluate", { expression: "document.querySelectorAll('iframe').length", returnByValue: true }, sessionId);
    await new Promise((r) => setTimeout(r, frames.value ? 2500 : 600));
    if (script) {
      // Put the page in a given state first (click a button, open a menu…).
      // The newline lets the script end with a line comment.
      const expression = "(async () => { " + script + "\n})()";
      const res = await cdp.send<{ exceptionDetails?: { text: string; exception?: { description?: string } } }>(
        "Runtime.evaluate",
        { expression, awaitPromise: true },
        sessionId,
      );
      if (res.exceptionDetails) throw new Error(`--screenshot-js failed: ${res.exceptionDetails.exception?.description ?? res.exceptionDetails.text}`);
      await new Promise((r) => setTimeout(r, 600));
    }
    const { cssContentSize } = await cdp.send<{ cssContentSize: { width: number; height: number } }>("Page.getLayoutMetrics", {}, sessionId);
    const height = Math.min(Math.ceil(cssContentSize.height), maxHeight);
    const { data } = await cdp.send<{ data: string }>(
      "Page.captureScreenshot",
      { format: "png", captureBeyondViewport: true, clip: { x: 0, y: 0, width: vp.width, height: Math.max(height, vp.height), scale: 1 } },
      sessionId,
    );
    writeFileSync(file, Buffer.from(data, "base64"));
  } finally {
    await cdp.send("Target.closeTarget", { targetId }).catch(() => {});
  }
}

export async function screenshotPages(
  baseUrl: string,
  pages: Record<string, string | undefined>,
  outDir: string,
  script?: string,
  maxHeight?: number,
): Promise<{ browser: string | null; shots: Screenshot[]; errors: string[] }> {
  return shoot(baseUrl, pages, outDir, script, maxHeight);
}

// Separate from the exported screenshotPages on purpose: its callers
// reach it through dynamic import(), which Rollup's parameter-value
// tracking doesn't see. With screenshotFile as the only static caller
// (no script), the build removed the --screenshot-js branch.
async function shoot(
  baseUrl: string,
  pages: Record<string, string | undefined>,
  outDir: string,
  script: string | undefined,
  maxHeight?: number,
): Promise<{ browser: string | null; shots: Screenshot[]; errors: string[] }> {
  // Full page, capped (CSS px; the viewport height at least).
  const cap = maxHeight && maxHeight > 0 ? maxHeight : 6000;
  const chrome = findChrome();
  if (!chrome) return { browser: null, shots: [], errors: [] };
  if (typeof WebSocket === "undefined") return { browser: chrome, shots: [], errors: ["Screenshots need Node.js 22 or newer (global WebSocket)."] };
  mkdirSync(outDir, { recursive: true });
  const shots: Screenshot[] = [];
  const errors: string[] = [];
  let session: Awaited<ReturnType<typeof launch>> | null = null;
  try {
    session = await launch(chrome);
    for (const [label, path] of Object.entries(pages)) {
      if (!path) continue;
      for (const [name, vp] of Object.entries(VIEWPORTS) as Array<[keyof typeof VIEWPORTS, (typeof VIEWPORTS)[keyof typeof VIEWPORTS]]>) {
        const file = join(outDir, `${label}-${name}.png`);
        try {
          // Live sites: a query string skips the CDN's cached copy (Pages
          // hosts keep serving the previous page for a while after a deploy).
          const url = `${baseUrl}/${path}`;
          const fresh = /^https?:\/\//.test(url) && !/^https?:\/\/(127\.0\.0\.1|localhost)[:/]/.test(url) && !url.includes("?") ? `${url}${url.includes("#") ? "" : `?agentcms-shot=${Date.now()}`}` : url;
          await capture(session.cdp, fresh, vp, file, script, cap);
          shots.push({ page: label, viewport: name, file });
        } catch (err) {
          errors.push(`${label} (${name}): ${(err as Error).message}`);
        }
      }
    }
  } catch (err) {
    errors.push((err as Error).message);
  } finally {
    if (session) {
      session.ws.close();
      session.proc.kill();
      await new Promise((r) => setTimeout(r, 200));
      rmSync(session.profile, { recursive: true, force: true });
    }
  }
  return { browser: chrome, shots, errors };
}

// Screenshots of one self-contained HTML file (e.g. a post preview).
export async function screenshotFile(file: string, script?: string): Promise<{ browser: string | null; shots: Screenshot[]; errors: string[] }> {
  const { dirname, basename, join } = await import("node:path");
  const { pathToFileURL } = await import("node:url");
  const dir = dirname(file);
  const base = pathToFileURL(dir).href.replace(/\/$/, "");
  return shoot(base, { [basename(file).replace(/\.html?$/, "")]: basename(file) }, join(dir, ".screenshots"), script);
}
