import { describe, expect, it, vi } from "vitest";

// style.ts only needs uploadFile from the runtime (for the upload
// helper, not exercised here) — keep the real runtime out of the test.
vi.mock("@agent-cms/runtime", () => ({ uploadFile: vi.fn() }));

import { buildCustomCss, normalizeColor, DEFAULT_FONT_SANS } from "./style";

const BASE = ":root{--color-primary:9 20 38}";

function overrideBlock(css: string): string {
  const m = /\n:root\{([^}]*)\}\n$/.exec(css);
  if (!m) throw new Error("no override block");
  return m[1];
}

describe("corporate normalizeColor", () => {
  it("converts 3, 4, 6 and 8-digit hex to an RGB triplet", () => {
    expect(normalizeColor("#fff")).toBe("255 255 255");
    expect(normalizeColor("#f008")).toBe("255 0 0");
    expect(normalizeColor("#C4734F")).toBe("196 115 79");
    expect(normalizeColor("#c4734f80")).toBe("196 115 79");
  });

  it("leaves triplets and other values untouched", () => {
    expect(normalizeColor("196 115 79")).toBe("196 115 79");
    expect(normalizeColor("rgb(1 2 3)")).toBe("rgb(1 2 3)");
    expect(normalizeColor("#12")).toBe("#12");
  });
});

describe("corporate buildCustomCss", () => {
  it("returns the base CSS when nothing is overridden", () => {
    expect(buildCustomCss(BASE, { vars: {}, fontSans: DEFAULT_FONT_SANS })).toBe(BASE);
  });

  it("converts every --color-* hex override, listed in the Style tab or not", () => {
    const css = buildCustomCss(BASE, {
      fontSans: DEFAULT_FONT_SANS,
      vars: {
        "--color-primary": "#091426",
        "--color-secondary-container": "#c4734f",
        "--color-secondary-fixed": "#abc",
        "--color-secondary-fixed-dim": "#aabbccdd",
        "--color-surface-bright": "#F7F9FB",
        "--color-on-secondary-container": "255 251 255",
        "--some-length": "#notacolor",
      },
    });
    const block = overrideBlock(css);
    expect(block).toContain("--color-primary:9 20 38;");
    expect(block).toContain("--color-secondary-container:196 115 79;");
    expect(block).toContain("--color-secondary-fixed:170 187 204;");
    expect(block).toContain("--color-secondary-fixed-dim:170 187 204;");
    expect(block).toContain("--color-surface-bright:247 249 251;");
    expect(block).toContain("--color-on-secondary-container:255 251 255;");
    expect(block).toContain("--some-length:#notacolor;");
    expect(block).not.toMatch(/--color-[\w-]+:#/);
  });
});
