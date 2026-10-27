import { cssVariablesOf } from "./themes";

describe("cssVariablesOf", () => {
  it("reads the first :root block, compressed or expanded", () => {
    expect(cssVariablesOf(`@import"x";:root{--color-bg:#fbf9f9;--space-4:1rem}.a{--x:1}`)).toEqual({ "--color-bg": "#fbf9f9", "--space-4": "1rem" });
    expect(cssVariablesOf(":root {\n  --radius: 4px;\n  --font: \"Inter\", sans-serif;\n}")).toEqual({ "--radius": "4px", "--font": '"Inter", sans-serif' });
  });

  it("shows Tailwind RGB triplets as hex (what compileCss takes)", () => {
    expect(cssVariablesOf(":root{--color-primary:0 0 0;--color-secondary:67 97 124}")).toEqual({ "--color-primary": "#000000", "--color-secondary": "#43617c" });
  });

  it("is empty without CSS", () => {
    expect(cssVariablesOf("")).toEqual({});
  });
});
