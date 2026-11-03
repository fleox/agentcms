import { createRequire as __acmsRequire } from "node:module";
import { fileURLToPath as __acmsPath } from "node:url";
import { dirname as __acmsDirname } from "node:path";
const require2 = __acmsRequire(import.meta.url);
const __filename = __acmsPath(import.meta.url);
const __dirname = __acmsDirname(__filename);
const FIELD_KEY_PATTERN = /^[a-z][a-z0-9_-]{0,63}$/;
const MAX_FIELDS = 50;
const MAX_FIELD_TEXT = 1e4;
function isValidFieldKey(key) {
  return FIELD_KEY_PATTERN.test(key);
}
function isFieldValue(v) {
  if (typeof v === "string") return v.length <= MAX_FIELD_TEXT;
  if (typeof v === "number") return Number.isFinite(v);
  if (typeof v === "boolean") return true;
  return Array.isArray(v) && v.length <= 200 && v.every((x) => typeof x === "string" && x.length <= MAX_FIELD_TEXT);
}
function validateFields(input) {
  const errors = [];
  const fields = {};
  if (input == null) return { fields, errors };
  if (typeof input !== "object" || Array.isArray(input)) {
    return { fields, errors: ["Custom fields must be an object of key → value."] };
  }
  for (const [key, value] of Object.entries(input)) {
    if (value === null || value === void 0) continue;
    if (!isValidFieldKey(key)) {
      errors.push(`Invalid field name "${key}": lower-case letters, digits, "-" or "_", starting with a letter.`);
    } else if (!isFieldValue(value)) {
      errors.push(`Invalid value for "${key}": text, a number, true / false, or a list of texts.`);
    } else {
      fields[key] = Array.isArray(value) ? [...value] : value;
    }
  }
  if (Object.keys(fields).length > MAX_FIELDS) errors.push(`At most ${MAX_FIELDS} custom fields per entry.`);
  return { fields, errors };
}
function parseFieldAssignment(raw) {
  const eq = raw.indexOf("=");
  if (eq <= 0) throw new Error(`"${raw}" is not key=value.`);
  const key = raw.slice(0, eq).trim();
  const text = raw.slice(eq + 1);
  if (!isValidFieldKey(key)) {
    throw new Error(`Invalid field name "${key}": lower-case letters, digits, "-" or "_", starting with a letter.`);
  }
  if (text === "") return { key, value: null };
  if (text === "true") return { key, value: true };
  if (text === "false") return { key, value: false };
  if (/^-?(0|[1-9]\d{0,14})(\.\d+)?$/.test(text)) return { key, value: Number(text) };
  return { key, value: text };
}
function mergeFields(current, patch) {
  const next = { ...current ?? {} };
  for (const [key, value] of Object.entries(patch)) {
    if (value === null) delete next[key];
    else next[key] = value;
  }
  return Object.keys(next).length ? next : null;
}
export {
  FIELD_KEY_PATTERN,
  MAX_FIELDS,
  MAX_FIELD_TEXT,
  isFieldValue,
  isValidFieldKey,
  mergeFields,
  parseFieldAssignment,
  validateFields
};
