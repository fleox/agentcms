import { describeSettings, schemaErrors } from "./settingsSchema";

const defaults = {
  home: { variant: "staggered", cardLimit: 12, showFilters: false },
  style: { vars: {}, fontSans: "inter" },
  logoUpdatedAt: 0,
};
const schema = {
  "home.variant": { description: "Grid layout of the home page.", values: ["staggered", "standard"] },
  "home.cardLimit": { description: "Cards on the home page (0 = all).", min: 0, max: 48 },
  "style.vars": { description: "CSS variable overrides.", format: "map of CSS variable → hex color" },
  "style.fontSans": { description: "Body font.", values: ["inter", "system"] },
  "single.extra": { description: "Documented but absent from the defaults." },
};

describe("settings schema (--schema)", () => {
  it("lists every leaf of the defaults with its documentation", () => {
    const rows = describeSettings(defaults, schema);
    expect(rows.map((r) => r.path)).toEqual(["home.variant", "home.cardLimit", "home.showFilters", "style.vars", "style.fontSans", "logoUpdatedAt", "single.extra"]);
    expect(rows[0]).toEqual({ path: "home.variant", type: "string", default: "staggered", description: "Grid layout of the home page.", values: ["staggered", "standard"] });
    expect(rows[1]).toMatchObject({ min: 0, max: 48 });
    // A documented object is one row, not walked into.
    expect(rows[3]).toEqual({ path: "style.vars", type: "object", default: {}, description: "CSS variable overrides.", format: "map of CSS variable → hex color" });
    expect(rows[2]).toEqual({ path: "home.showFilters", type: "boolean", default: false });
    expect(rows[6]).toMatchObject({ path: "single.extra", type: "unknown", default: undefined });
  });

  it("works without a schema", () => {
    expect(describeSettings(defaults, undefined).map((r) => r.description)).toEqual(new Array(6).fill(undefined));
  });

  it("refuses values outside a closed list or range", () => {
    expect(schemaErrors(schema, defaults)).toEqual([]);
    const errors = schemaErrors(schema, { ...defaults, home: { variant: "masonry", cardLimit: 99 } });
    expect(errors).toEqual([
      '"home.variant" is "masonry"; accepted: "staggered", "standard".',
      '"home.cardLimit" is 99; accepted: 0 to 48.',
    ]);
    expect(schemaErrors(undefined, { anything: 1 })).toEqual([]);
    // A stored out-of-list value doesn't block another change.
    const stored = { ...defaults, home: { ...defaults.home, variant: "legacy" } };
    expect(schemaErrors(schema, { ...stored, home: { ...stored.home, cardLimit: 6 } }, stored)).toEqual([]);
  });
});

describe("hex colors and managed settings", () => {
  it("refuses named colors where the schema asks for hex", () => {
    const sch = { "style.vars": { description: "CSS vars", format: "map of CSS variable → hex color" }, accent: { description: "Accent", format: "hex color" } };
    expect(schemaErrors(sch, { style: { vars: { "--color-secondary": "teal", "--space": "2rem" } }, accent: "#fff" })).toEqual(['"style.vars.--color-secondary" is "teal"; expected a hex color like "#1a2b3c".']);
    expect(schemaErrors(sch, { accent: "red" })).toEqual(['"accent" is "red"; expected a hex color like "#1a2b3c".']);
  });
});

describe("config edits", () => {
  it("warns about unknown nested keys, not inside maps", async () => {
    const { shapeWarnings } = await import("./configEdit");
    const defaults = { home: { sidebarTop: "most-read" }, style: { vars: {} } };
    expect(shapeWarnings(defaults, { home: { sidebarTopp: "promo" }, style: { vars: { "--x": "#000" } } }, "magazine")).toEqual([
      'magazine: "home.sidebarTopp" is not a setting of its default config (kept as is) — see --schema.',
    ]);
  });

  it("--set keeps the settings the extension manages", async () => {
    const { keepManaged } = await import("./configEdit");
    const schema = { cssUpdatedAt: { description: "Managed by the theme — don't set." }, accent: { description: "Accent." } };
    expect(keepManaged({ cssUpdatedAt: 42, accent: "#000" }, { accent: "#fff" }, schema)).toEqual({ accent: "#fff", cssUpdatedAt: 42 });
  });
});
