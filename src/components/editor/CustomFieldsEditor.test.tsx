import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { CustomFieldsEditor, fieldsToRows, rowsToFields } from "./CustomFieldsEditor";

describe("CustomFieldsEditor", () => {
  it("round-trips every value type through the form rows", () => {
    const fields = { "header-photo": true, price: 4.5, label: "New", tags: ["a", "b"] };
    const rows = fieldsToRows(fields);
    expect(rows.map((r) => r.kind)).toEqual(["boolean", "number", "text", "list"]);
    expect(rowsToFields(rows)).toEqual({ fields });
  });

  it("ignores unnamed rows and reports bad names, numbers and duplicates", () => {
    const [row] = fieldsToRows({ a: "x" });
    expect(rowsToFields([{ ...row, key: "" }])).toEqual({ fields: null });
    expect(rowsToFields([{ ...row, key: "Bad Name" }])).toMatchObject({ error: "invalidName", field: "Bad Name" });
    expect(rowsToFields([{ ...row, kind: "number", value: "abc" }])).toMatchObject({ error: "invalidNumber", field: "a" });
    expect(rowsToFields([row, { ...row, id: "other" }])).toMatchObject({ error: "duplicate", field: "a" });
    expect(rowsToFields([{ ...row, kind: "list", value: " x , ,y " }])).toEqual({ fields: { a: ["x", "y"] } });
  });

  it("renders one editable row per field and an add button", () => {
    const html = renderToStaticMarkup(<CustomFieldsEditor rows={fieldsToRows({ "header-photo": true, label: "New" })} onChange={() => {}} />);
    expect(html).toContain('value="header-photo"');
    expect(html).toContain('type="checkbox"');
    expect(html).toContain('value="New"');
    expect(html).toContain("posts.customFields.add");
  });
});
