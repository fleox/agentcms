// Custom fields: free key/value options on a post or page
// (`Post.fields`), set by editors in the Document panel or by agents
// (`agentcms content update --field key=value`), and read by themes and
// plugins at publish time (`post.fields["header-photo"]`). Kept flat and
// JSON-safe so every backend stores it as-is (Firestore map, JSON column,
// one front-matter line).

import type { PostFields, PostFieldValue } from "./types";

// Lower-case ASCII, starting with a letter: safe as a front-matter key, a
// CSS class suffix or a data attribute, and identical across backends.
export const FIELD_KEY_PATTERN = /^[a-z][a-z0-9_-]{0,63}$/;
export const MAX_FIELDS = 50;
export const MAX_FIELD_TEXT = 10_000;

export function isValidFieldKey(key: string): boolean {
  return FIELD_KEY_PATTERN.test(key);
}

export function isFieldValue(v: unknown): v is PostFieldValue {
  if (typeof v === "string") return v.length <= MAX_FIELD_TEXT;
  if (typeof v === "number") return Number.isFinite(v);
  if (typeof v === "boolean") return true;
  return Array.isArray(v) && v.length <= 200 && v.every((x) => typeof x === "string" && x.length <= MAX_FIELD_TEXT);
}

// Checks a whole map. Returns the copy to store, or the problems found
// (one sentence each, ready for a CLI error or a toast).
export function validateFields(input: unknown): { fields: PostFields; errors: string[] } {
  const errors: string[] = [];
  const fields: PostFields = {};
  if (input == null) return { fields, errors };
  if (typeof input !== "object" || Array.isArray(input)) {
    return { fields, errors: ["Custom fields must be an object of key → value."] };
  }
  for (const [key, value] of Object.entries(input as Record<string, unknown>)) {
    if (value === null || value === undefined) continue;
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

// "key=value" from the CLI. The value is typed only when it is an exact
// literal (true, false, a plain number); anything else stays text, so
// "007" or "1e3" are not silently converted. "key=" removes the field.
export function parseFieldAssignment(raw: string): { key: string; value: PostFieldValue | null } {
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

// Applies a patch (null = remove the key) onto the current map. Returns
// null when nothing is left, the value updatePost uses to clear it.
export function mergeFields(
  current: PostFields | undefined,
  patch: Record<string, PostFieldValue | null>,
): PostFields | null {
  const next: PostFields = { ...(current ?? {}) };
  for (const [key, value] of Object.entries(patch)) {
    if (value === null) delete next[key];
    else next[key] = value;
  }
  return Object.keys(next).length ? next : null;
}

// How a value reads in a form or a summary: lists as "a, b".
export function fieldValueToText(v: PostFieldValue): string {
  return Array.isArray(v) ? v.join(", ") : String(v);
}
