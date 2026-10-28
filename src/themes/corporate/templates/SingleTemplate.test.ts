import { describe, expect, it, vi } from "vitest";

vi.mock("@agent-cms/runtime", () => ({
  pickFormat: vi.fn(),
  buildTermUrl: vi.fn(),
  i18n: {},
  pickPublicLocale: vi.fn(),
}));

import { pageBodyLayout } from "./SingleTemplate";

const marker = (id: string) => `<div data-cms-block="corporate/${id}" data-attrs="e30="></div>`;

describe("corporate pageBodyLayout", () => {
  it("plain Markdown → markdown", () => {
    expect(pageBodyLayout("# Pricing\n\n| a | b |\n|---|---|\n| 1 | 2 |")).toBe("markdown");
    expect(pageBodyLayout('<div data-cms-block="agentcms-blocks/columns"></div>')).toBe("markdown");
  });

  it("opens with a full-width corporate block → blocks", () => {
    expect(pageBodyLayout(`${marker("hero-overlay")}\n\n${marker("services-grid")}`)).toBe("blocks");
    expect(pageBodyLayout(`\n  ${marker("services-grid")}\n\nText after.`)).toBe("blocks");
  });

  it("Markdown before a block, or an inline card first → mixed", () => {
    expect(pageBodyLayout(`Intro text.\n\n${marker("hero-split")}`)).toBe("mixed");
    expect(pageBodyLayout(`${marker("contact-form")}\n\nMore.`)).toBe("mixed");
  });
});
