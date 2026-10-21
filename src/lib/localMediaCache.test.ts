import { describe, expect, it } from "vitest";
import { localImageFor, rememberUploadedImage } from "./localMediaCache";

describe("localMediaCache", () => {
  it("serves a just-uploaded image from a local blob URL, whatever the site base URL", () => {
    rememberUploadedImage("media/2026/10/abc-123/small.webp", btoa("fake-webp"));
    const local = localImageFor("https://user.github.io/my-site/media/2026/10/abc-123/small.webp?v=1");
    expect(local).toMatch(/^blob:/);
    expect(localImageFor("/media/2026/10/abc-123/small.webp")).toBe(local);
  });

  it("ignores other files and non-images", () => {
    rememberUploadedImage("data/posts.json", btoa("{}"));
    expect(localImageFor("https://x/data/posts.json")).toBeNull();
    expect(localImageFor("https://x/media/2026/10/other/small.webp")).toBeNull();
    expect(localImageFor(undefined)).toBeNull();
  });
});
