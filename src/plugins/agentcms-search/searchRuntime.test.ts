// Behavioural tests for the public search runtime (search-runtime.js)
// evaluated in jsdom: single modal / single close button, native search
// clear button hidden, and the category accent borrowed from the theme.
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
// @ts-ignore -- jsdom ships no types and @types/jsdom isn't installed.
import { JSDOM } from "jsdom";
import { describe, expect, it } from "vitest";

const SRC = readFileSync(resolve(__dirname, "search-runtime.js"), "utf8");
const INDEX = {
  meta: { minQueryLength: 1 },
  items: [{ id: "a", url: "news/a.html", title: "Alpha", category: "News" }],
};

async function tick() {
  for (let i = 0; i < 10; i++) await new Promise((r) => setTimeout(r, 0));
}

async function setup(rootStyle = "", evalTwice = false) {
  const dom = new JSDOM(
    `<!doctype html><html style="${rootStyle}"><head></head><body><button data-cms-search>Search</button></body></html>`,
    { url: "https://site.com/", runScripts: "outside-only", pretendToBeVisual: true },
  );
  const win = dom.window as unknown as Window & { eval(src: string): void };
  (win as unknown as { fetch: unknown }).fetch = () =>
    Promise.resolve({ ok: true, status: 200, json: () => Promise.resolve(INDEX) });
  win.eval(SRC);
  if (evalTwice) win.eval(SRC);
  await tick();
  return dom.window.document as Document;
}

describe("agentcms-search runtime modal", () => {
  it("opens a single modal with a single close button, even on double click / double include", async () => {
    const doc = await setup("", true);
    const btn = doc.querySelector("[data-cms-search]") as HTMLElement;
    btn.click();
    btn.click();
    await tick();
    expect(doc.querySelectorAll(".cms-search-modal")).toHaveLength(1);
    expect(doc.querySelectorAll(".cms-search-header button")).toHaveLength(1);
  });

  it("hides the native search-input clear button", async () => {
    const doc = await setup();
    (doc.querySelector("[data-cms-search]") as HTMLElement).click();
    await tick();
    const css = doc.querySelector("style[data-cms-search-styles]")?.textContent ?? "";
    expect(css).toContain("::-webkit-search-cancel-button");
    expect(css).toMatch(/::-webkit-search-cancel-button[^{]*\{[^}]*display:none/);
  });

  it("colours the category label with the theme accent", async () => {
    const doc = await setup();
    (doc.querySelector("[data-cms-search]") as HTMLElement).click();
    await tick();
    const css = doc.querySelector("style[data-cms-search-styles]")?.textContent ?? "";
    expect(css).toContain("color:var(--cms-search-accent,#64748b)");
  });

  it.each([
    ["--color-secondary: 67 97 124", "rgb(67 97 124)"], // Tailwind themes: RGB channels
    ["--color-secondary: #476558", "#476558"], // default theme: hex
    ["--color-primary: 9 20 38", "rgb(9 20 38)"], // no secondary → primary
    ["--cms-search-accent: tomato; --color-secondary: #476558", "tomato"], // explicit override wins
  ])("resolves %s → %s", async (rootStyle, expected) => {
    const doc = await setup(rootStyle);
    (doc.querySelector("[data-cms-search]") as HTMLElement).click();
    await tick();
    const modal = doc.querySelector(".cms-search-modal") as HTMLElement;
    expect(modal.style.getPropertyValue("--cms-search-accent")).toBe(expected);
  });

  it("keeps the fallback colour when the theme defines no accent", async () => {
    const doc = await setup();
    (doc.querySelector("[data-cms-search]") as HTMLElement).click();
    await tick();
    const modal = doc.querySelector(".cms-search-modal") as HTMLElement;
    expect(modal.style.getPropertyValue("--cms-search-accent")).toBe("");
  });
});
