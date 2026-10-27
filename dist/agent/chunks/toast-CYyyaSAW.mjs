import { createRequire as __acmsRequire } from "node:module";
import { fileURLToPath as __acmsPath } from "node:url";
import { dirname as __acmsDirname } from "node:path";
const require2 = __acmsRequire(import.meta.url);
const __filename = __acmsPath(import.meta.url);
const __dirname = __acmsDirname(__filename);
const subscribers = /* @__PURE__ */ new Set();
function newToastId() {
  if (typeof crypto !== "undefined" && crypto.randomUUID) return crypto.randomUUID();
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}
function showToast(input) {
  const toast2 = { ...input, id: newToastId(), createdAt: Date.now() };
  subscribers.forEach((fn) => {
    try {
      fn(toast2);
    } catch (err) {
      console.error("Toast subscriber threw:", err);
    }
  });
  return toast2;
}
const toast = {
  info: (message, durationMs) => showToast({ level: "info", message, durationMs }),
  success: (message, durationMs) => showToast({ level: "success", message, durationMs }),
  warn: (message, durationMs) => showToast({ level: "warn", message, durationMs }),
  error: (message, durationMs) => showToast({ level: "error", message, durationMs })
};
function subscribeToToasts(fn) {
  subscribers.add(fn);
  return () => subscribers.delete(fn);
}
function defaultDurationFor(level) {
  switch (level) {
    case "error":
      return 6e3;
    case "warn":
      return 5e3;
    default:
      return 3500;
  }
}
export {
  defaultDurationFor,
  showToast,
  subscribeToToasts,
  toast
};
