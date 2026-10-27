// Publish-time transforms of agentcms-blocks. Runs in the plain Node
// environment on purpose: no global DOMParser / document, exactly like
// the headless agentcms CLI — the previous DOMParser-based transforms
// were silent no-ops there (markers published as-is, no CSS).
import { afterEach, describe, expect, it } from "vitest";
import {
  _resetForTests,
  consumeColumnsDetection,
  getDetectedColumnsStyles,
  transformColumnsHtml,
} from "./columns/transforms";
import { transformHtmlBlocks } from "./html/transforms";
import { scanTags, findMatchingClose } from "./htmlScan";
import { COLUMNS_BASELINE_STYLE_TAG } from "./styles";

afterEach(() => _resetForTests());

const b64 = (code: string) => Buffer.from(JSON.stringify({ code }), "utf-8").toString("base64");

describe("transformColumnsHtml (no DOM)", () => {
  it("runs without a DOMParser", () => {
    expect(typeof (globalThis as { DOMParser?: unknown }).DOMParser).toBe("undefined");
  });

  it("rewrites container + direct columns and flags the page", () => {
    const html =
      '<p>before</p><div data-cols="3" data-cms-block="agentcms-blocks/columns">' +
      '<div data-cms-column=""><p>A</p></div><div data-cms-column=""><p>B</p></div>' +
      '<div data-cms-column=""><p>C</p></div></div><p>after</p>';
    const out = transformColumnsHtml(html);
    expect(out).not.toContain("data-cms-block");
    expect(out).not.toContain("data-cms-column");
    expect(out).toContain('<div class="cms-columns cms-columns-cols-3">');
    expect(out.match(/<div class="cms-column">/g)).toHaveLength(3);
    expect(out.startsWith("<p>before</p>")).toBe(true);
    expect(out.endsWith("<p>after</p>")).toBe(true);
    expect(getDetectedColumnsStyles()).toBe(COLUMNS_BASELINE_STYLE_TAG);
  });

  it("keeps custom widths (inline CSS variable) and existing classes", () => {
    const html =
      '<div class="x" data-cms-block="agentcms-blocks/columns" data-cols="2" data-widths="80,20" style="--cms-columns-template: 80fr 20fr;">' +
      "<div data-cms-column><p>A</p></div><div data-cms-column><p>B</p></div></div>";
    const out = transformColumnsHtml(html);
    expect(out).toContain('class="x cms-columns cms-columns-cols-2"');
    expect(out).toContain('style="--cms-columns-template: 80fr 20fr;"');
    expect(out).toContain('data-widths="80,20"');
  });

  it("clamps the column count", () => {
    expect(transformColumnsHtml('<div data-cms-block="agentcms-blocks/columns" data-cols="9"></div>')).toContain(
      "cms-columns-cols-4",
    );
    expect(transformColumnsHtml('<div data-cms-block="agentcms-blocks/columns" data-cols="abc"></div>')).toContain(
      "cms-columns-cols-2",
    );
  });

  it("only touches direct column children; nested columns are processed on their own", () => {
    const html =
      '<div data-cms-block="agentcms-blocks/columns" data-cols="2">' +
      '<div data-cms-column=""><section><div data-cms-column="">stray</div></section>' +
      '<div data-cms-block="agentcms-blocks/columns" data-cols="2"><div data-cms-column="">n1</div><div data-cms-column="">n2</div></div>' +
      '</div><div data-cms-column=""><p>R</p></div></div>';
    const out = transformColumnsHtml(html);
    expect(out.match(/class="cms-columns /g)).toHaveLength(2);
    expect(out.match(/class="cms-column"/g)).toHaveLength(4);
    // The column nested in a <section> is not a direct child of a container.
    expect(out).toContain('<section><div data-cms-column="">stray</div></section>');
  });

  it("ignores marker-like text inside attributes, comments and scripts", () => {
    const html =
      '<!-- <div data-cms-block="agentcms-blocks/columns"> -->' +
      '<script>var s = \'<div data-cms-block="agentcms-blocks/columns">\';</script>' +
      '<a title="agentcms-blocks/columns">x</a>';
    expect(transformColumnsHtml(html)).toBe(html);
    expect(getDetectedColumnsStyles()).toBe("");
  });

  it("detection resets on the next body and when the page is consumed", () => {
    transformColumnsHtml('<div data-cms-block="agentcms-blocks/columns"></div>');
    expect(getDetectedColumnsStyles()).not.toBe("");
    consumeColumnsDetection();
    expect(getDetectedColumnsStyles()).toBe("");
    transformColumnsHtml('<div data-cms-block="agentcms-blocks/columns"></div>');
    transformColumnsHtml("<p>plain</p>");
    expect(getDetectedColumnsStyles()).toBe("");
  });
});

describe("transformHtmlBlocks (no DOM)", () => {
  it("replaces the marker with the raw code, unicode included", () => {
    const code = '<script>console.log("héllo </div>")</script><style>.a{}</style>';
    const html = `<p>x</p><div data-cms-block="agentcms-blocks/html" data-attrs="${b64(code)}"></div><p>y</p>`;
    expect(transformHtmlBlocks(html)).toBe(`<p>x</p>${code}<p>y</p>`);
  });

  it("strips empty markers and works inside columns", () => {
    const inner = `<div data-cms-block="agentcms-blocks/html" data-attrs="${b64("<b>hi</b>")}"></div>`;
    const html =
      `<div data-cms-block="agentcms-blocks/columns" data-cols="2"><div data-cms-column="">${inner}</div>` +
      '<div data-cms-column=""><div data-cms-block="agentcms-blocks/html" data-attrs=""></div></div></div>';
    const out = transformHtmlBlocks(transformColumnsHtml(html));
    expect(out).toBe(
      '<div class="cms-columns cms-columns-cols-2"><div class="cms-column"><b>hi</b></div><div class="cms-column"></div></div>',
    );
  });
});

describe("htmlScan", () => {
  it("honours quoted '>' and finds matching closes", () => {
    const html = '<div title="a>b"><div></div></div><img src="x">';
    const tokens = scanTags(html);
    expect(tokens.map((t) => `${t.kind}:${t.name}`)).toEqual([
      "open:div",
      "open:div",
      "close:div",
      "close:div",
      "open:img",
    ]);
    expect(findMatchingClose(tokens, 0)).toBe(3);
    expect(findMatchingClose(tokens, 4)).toBe(-1);
  });
});
