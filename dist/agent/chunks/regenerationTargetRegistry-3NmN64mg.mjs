import { createRequire as __acmsRequire } from "node:module";
import { fileURLToPath as __acmsPath } from "node:url";
import { dirname as __acmsDirname } from "node:path";
const require2 = __acmsRequire(import.meta.url);
const __filename = __acmsPath(import.meta.url);
const __dirname = __acmsDirname(__filename);
const targets = /* @__PURE__ */ new Map();
const subscribers = /* @__PURE__ */ new Set();
function notify() {
  for (const cb of subscribers) cb();
}
function subscribeRegenerationTargets(cb) {
  subscribers.add(cb);
  return () => {
    subscribers.delete(cb);
  };
}
function registerRegenerationTarget(target) {
  if (targets.has(target.id)) {
    console.warn(`Regeneration target "${target.id}" already registered. Overwriting.`);
  }
  targets.set(target.id, target);
  notify();
}
function listRegenerationTargets() {
  return Array.from(targets.values()).sort(
    (a, b) => (a.priority ?? 100) - (b.priority ?? 100)
  );
}
function resetRegenerationTargets() {
  targets.clear();
  notify();
}
export {
  listRegenerationTargets,
  registerRegenerationTarget,
  resetRegenerationTargets,
  subscribeRegenerationTargets
};
