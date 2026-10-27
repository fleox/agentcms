import { createRequire as __acmsRequire } from "node:module";
import { fileURLToPath as __acmsPath } from "node:url";
import { dirname as __acmsDirname } from "node:path";
const require2 = __acmsRequire(import.meta.url);
const __filename = __acmsPath(import.meta.url);
const __dirname = __acmsDirname(__filename);
const cards = /* @__PURE__ */ new Map();
const subscribers = /* @__PURE__ */ new Set();
function notify() {
  for (const cb of subscribers) cb();
}
function subscribeDashboardCards(cb) {
  subscribers.add(cb);
  return () => {
    subscribers.delete(cb);
  };
}
function registerDashboardCard(manifest) {
  if (cards.has(manifest.id)) {
    console.warn(`Dashboard card "${manifest.id}" already registered. Overwriting.`);
  }
  cards.set(manifest.id, manifest);
  notify();
}
function listDashboardCards() {
  return Array.from(cards.values()).sort(
    (a, b) => (a.priority ?? 100) - (b.priority ?? 100)
  );
}
function resetDashboardCards() {
  cards.clear();
  notify();
}
export {
  listDashboardCards,
  registerDashboardCard,
  resetDashboardCards,
  subscribeDashboardCards
};
