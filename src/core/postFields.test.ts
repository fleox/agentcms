import { describe, expect, it } from "vitest";
import { fieldValueToText, isValidFieldKey, mergeFields, parseFieldAssignment, validateFields } from "./postFields";

describe("custom fields", () => {
  it("accepts lower-case names only", () => {
    expect(isValidFieldKey("header-photo")).toBe(true);
    expect(isValidFieldKey("prep_time2")).toBe(true);
    for (const bad of ["Header", "2col", "-x", "a b", "été", ""]) expect(isValidFieldKey(bad)).toBe(false);
  });

  it("types only exact literals from key=value", () => {
    expect(parseFieldAssignment("header-photo=true")).toEqual({ key: "header-photo", value: true });
    expect(parseFieldAssignment("on=false")).toEqual({ key: "on", value: false });
    expect(parseFieldAssignment("price=4.5")).toEqual({ key: "price", value: 4.5 });
    expect(parseFieldAssignment("code=007")).toEqual({ key: "code", value: "007" });
    expect(parseFieldAssignment("big=1e3")).toEqual({ key: "big", value: "1e3" });
    expect(parseFieldAssignment("label=a=b")).toEqual({ key: "label", value: "a=b" });
    expect(parseFieldAssignment("label=")).toEqual({ key: "label", value: null });
    expect(() => parseFieldAssignment("label")).toThrow(/key=value/);
    expect(() => parseFieldAssignment("Bad=1")).toThrow(/Invalid field name/);
  });

  it("validates maps and drops nulls", () => {
    expect(validateFields({ a: "x", b: 2, c: true, d: ["x", "y"], e: null })).toEqual({ fields: { a: "x", b: 2, c: true, d: ["x", "y"] }, errors: [] });
    expect(validateFields({ a: { nested: 1 } }).errors).toHaveLength(1);
    expect(validateFields({ a: Number.NaN }).errors).toHaveLength(1);
    expect(validateFields({ "Bad Key": 1 }).errors[0]).toMatch(/Invalid field name/);
    expect(validateFields([1]).errors).toHaveLength(1);
    const many = Object.fromEntries(Array.from({ length: 51 }, (_, i) => [`f${i}`, i]));
    expect(validateFields(many).errors[0]).toMatch(/At most 50/);
  });

  it("merges a patch and clears an emptied map", () => {
    expect(mergeFields({ a: 1, b: "x" }, { b: null, c: true })).toEqual({ a: 1, c: true });
    expect(mergeFields({ a: 1 }, { a: null })).toBeNull();
    expect(mergeFields(undefined, { a: "x" })).toEqual({ a: "x" });
    expect(fieldValueToText(["a", "b"])).toBe("a, b");
  });
});
