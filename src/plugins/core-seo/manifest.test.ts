import { describe, expect, it } from "vitest";
import type { BaseLayoutProps } from "@agent-cms/runtime";
import { manifest } from "./manifest";

function headFor(props: Partial<BaseLayoutProps>): string {
  let filter: ((current: string, ...rest: unknown[]) => string) | undefined;
  const api = { addFilter: (_name: string, fn: typeof filter) => (filter = fn) };
  manifest.register?.(api as never);
  return filter!("", { site: { settings: { title: "My site" } }, pageTitle: "", ...props });
}

describe("core-seo", () => {
  it("falls back to the site title on the latest-posts home", () => {
    expect(headFor({})).toContain('<meta name="twitter:title" content="My site" />');
  });

  it("uses a large card only when the page has an image", () => {
    expect(headFor({ pageTitle: "Post" })).toContain('content="summary"');
    const withImage = headFor({ pageTitle: "Post", ogImage: "https://x/i.jpg" });
    expect(withImage).toContain('content="summary_large_image"');
    expect(withImage).toContain('<meta name="twitter:title" content="Post" />');
  });
});
