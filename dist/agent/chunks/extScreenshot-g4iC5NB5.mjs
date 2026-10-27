import { createRequire as __acmsRequire } from "node:module";
import { fileURLToPath as __acmsPath } from "node:url";
import { dirname as __acmsDirname } from "node:path";
const require2 = __acmsRequire(import.meta.url);
const __filename = __acmsPath(import.meta.url);
const __dirname = __acmsDirname(__filename);
import { spawn } from "node:child_process";
import { existsSync, mkdirSync, rmSync, mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
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
  "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe"
];
function findChrome() {
  for (const c of CANDIDATES) if (c && existsSync(c)) return c;
  return null;
}
const VIEWPORTS = {
  desktop: { width: 1280, height: 800, mobile: false, scale: 1 },
  mobile: { width: 390, height: 844, mobile: true, scale: 2 }
};
class Cdp {
  constructor(ws) {
    this.ws = ws;
    ws.addEventListener("message", (ev) => {
      const msg = JSON.parse(String(ev.data));
      if (msg.id !== void 0) {
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
  id = 0;
  pending = /* @__PURE__ */ new Map();
  waiters = [];
  send(method, params = {}, sessionId) {
    const id = ++this.id;
    this.ws.send(JSON.stringify({ id, method, params, ...sessionId ? { sessionId } : {} }));
    return new Promise((resolve, reject) => this.pending.set(id, { resolve, reject }));
  }
  once(method, sessionId, timeoutMs) {
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
async function launch(chrome) {
  const profile = mkdtempSync(join(tmpdir(), "agentcms-chrome-"));
  const proc = spawn(
    chrome,
    ["--headless=new", "--disable-gpu", "--no-first-run", "--no-default-browser-check", "--hide-scrollbars", "--remote-debugging-port=0", `--user-data-dir=${profile}`, "about:blank"],
    { stdio: "ignore" }
  );
  const portFile = join(profile, "DevToolsActivePort");
  const started = Date.now();
  while (!existsSync(portFile) || readFileSync(portFile, "utf8").split("\n").length < 2) {
    if (Date.now() - started > 2e4 || proc.exitCode !== null) {
      proc.kill();
      throw new Error("the browser did not start");
    }
    await new Promise((r) => setTimeout(r, 100));
  }
  const [port, path] = readFileSync(portFile, "utf8").split("\n");
  const ws = new WebSocket(`ws://127.0.0.1:${port.trim()}${path.trim()}`);
  await new Promise((resolve, reject) => {
    ws.addEventListener("open", () => resolve(), { once: true });
    ws.addEventListener("error", () => reject(new Error("could not connect to the browser")), { once: true });
  });
  return { proc, cdp: new Cdp(ws), ws, profile };
}
async function capture(cdp, url, vp, file, script, maxHeight) {
  const { targetId } = await cdp.send("Target.createTarget", { url: "about:blank" });
  const { sessionId } = await cdp.send("Target.attachToTarget", { targetId, flatten: true });
  try {
    await cdp.send("Page.enable", {}, sessionId);
    await cdp.send("Emulation.setDeviceMetricsOverride", { width: vp.width, height: vp.height, deviceScaleFactor: vp.scale, mobile: vp.mobile }, sessionId);
    if (vp.mobile) await cdp.send("Emulation.setTouchEmulationEnabled", { enabled: true }, sessionId);
    const loaded = cdp.once("Page.loadEventFired", sessionId, 15e3);
    await cdp.send("Page.navigate", { url }, sessionId);
    await loaded;
    await cdp.send(
      "Runtime.evaluate",
      {
        expression: `(async () => { for (const i of document.querySelectorAll('img[loading="lazy"]')) i.loading = "eager"; for (const f of document.querySelectorAll('iframe[loading="lazy"]')) { f.loading = "eager"; f.src = f.src; } await Promise.all([...document.images].map((i) => i.complete ? 0 : new Promise((r) => { i.onload = i.onerror = r; setTimeout(r, 3000); }))); })()`,
        awaitPromise: true
      },
      sessionId
    );
    const { result: frames } = await cdp.send("Runtime.evaluate", { expression: "document.querySelectorAll('iframe').length", returnByValue: true }, sessionId);
    await new Promise((r) => setTimeout(r, frames.value ? 2500 : 600));
    if (script) {
      const expression = "(async () => { " + script + "\n})()";
      const res = await cdp.send(
        "Runtime.evaluate",
        { expression, awaitPromise: true },
        sessionId
      );
      if (res.exceptionDetails) throw new Error(`--screenshot-js failed: ${res.exceptionDetails.exception?.description ?? res.exceptionDetails.text}`);
      await new Promise((r) => setTimeout(r, 600));
    }
    const { cssContentSize } = await cdp.send("Page.getLayoutMetrics", {}, sessionId);
    const height = Math.min(Math.ceil(cssContentSize.height), maxHeight);
    const { data } = await cdp.send(
      "Page.captureScreenshot",
      { format: "png", captureBeyondViewport: true, clip: { x: 0, y: 0, width: vp.width, height: Math.max(height, vp.height), scale: 1 } },
      sessionId
    );
    writeFileSync(file, Buffer.from(data, "base64"));
  } finally {
    await cdp.send("Target.closeTarget", { targetId }).catch(() => {
    });
  }
}
async function screenshotPages(baseUrl, pages, outDir, script, maxHeight) {
  return shoot(baseUrl, pages, outDir, script, maxHeight);
}
async function shoot(baseUrl, pages, outDir, script, maxHeight) {
  const cap = maxHeight && maxHeight > 0 ? maxHeight : 6e3;
  const chrome = findChrome();
  if (!chrome) return { browser: null, shots: [], errors: [] };
  if (typeof WebSocket === "undefined") return { browser: chrome, shots: [], errors: ["Screenshots need Node.js 22 or newer (global WebSocket)."] };
  mkdirSync(outDir, { recursive: true });
  const shots = [];
  const errors = [];
  let session = null;
  try {
    session = await launch(chrome);
    for (const [label, path] of Object.entries(pages)) {
      if (!path) continue;
      for (const [name, vp] of Object.entries(VIEWPORTS)) {
        const file = join(outDir, `${label}-${name}.png`);
        try {
          await capture(session.cdp, `${baseUrl}/${path}`, vp, file, script, cap);
          shots.push({ page: label, viewport: name, file });
        } catch (err) {
          errors.push(`${label} (${name}): ${err.message}`);
        }
      }
    }
  } catch (err) {
    errors.push(err.message);
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
async function screenshotFile(file, script) {
  const { dirname, basename, join: join2 } = await import("node:path");
  const { pathToFileURL } = await import("node:url");
  const dir = dirname(file);
  const base = pathToFileURL(dir).href.replace(/\/$/, "");
  return shoot(base, { [basename(file).replace(/\.html?$/, "")]: basename(file) }, join2(dir, ".screenshots"), script);
}
export {
  VIEWPORTS,
  findChrome,
  screenshotFile,
  screenshotPages
};
