import { describe, expect, it } from "vitest";
import { parseFrontmatter, stringifyFrontmatter } from "./frontmatter";

describe("frontmatter", () => {
  it("round-trips every value shape losslessly", () => {
    const data = {
      id: "AbC123xyz",
      title: "Hello world",
      tricky: 'Colon: here # and "quotes"',
      numericString: "2024",
      boolString: "yes",
      slug: "01-intro",
      count: 3,
      flag: false,
      nothing: null,
      termIds: ["a", "b"],
      seo: { title: "SEO", description: "Desc: with colon" },
      accents: "Été à Paris",
      empty: "",
    };
    const body = "\n# Title\n\nBody with --- inside\n---\nand a fence-like line.";
    const text = stringifyFrontmatter(data, body);
    const parsed = parseFrontmatter(text);
    expect(parsed.data).toEqual(data);
    expect(parsed.body).toBe(body);
  });

  it("keeps simple strings readable", () => {
    const text = stringifyFrontmatter({ title: "Hello world", status: "online" }, "x");
    expect(text).toBe("---\ntitle: Hello world\nstatus: online\n---\n\nx");
  });

  it("reads hand-written YAML", () => {
    const text = [
      "---",
      "title: 'It''s mine'   # comment",
      "tags: [pasta, italian]",
      "categories:",
      "  - News",
      "  - Tech",
      "seo:",
      "  title: Custom",
      "  description: \"Quoted\"",
      "draft: true",
      "order: 12",
      "---",
      "Body",
    ].join("\n");
    const { data, body } = parseFrontmatter(text);
    expect(data).toEqual({
      title: "It's mine",
      tags: ["pasta", "italian"],
      categories: ["News", "Tech"],
      seo: { title: "Custom", description: "Quoted" },
      draft: true,
      order: 12,
    });
    expect(body).toBe("Body");
  });

  it("treats files without frontmatter as body only", () => {
    expect(parseFrontmatter("# Just markdown")).toEqual({ data: {}, body: "# Just markdown" });
  });
});
