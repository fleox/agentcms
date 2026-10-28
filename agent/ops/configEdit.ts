import { CliError } from "../output";
import { readJsonOption } from "./adminCommon";

// Shared by `plugins config` and `themes config`: what the agent asked
// for (--get / --schema / --set / --merge), the merged result, and a
// loose shape check against the extension's defaultConfig.

export type ConfigRequest =
  | { mode: "get" }
  | { mode: "schema" }
  | { mode: "set"; value: Record<string, unknown> }
  | { mode: "merge"; value: Record<string, unknown> };

function isPlainObject(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null && !Array.isArray(v);
}

export function readConfigRequest(options: Record<string, string | boolean | undefined>): ConfigRequest {
  const modes = (["get", "schema", "set", "merge"] as const).filter((m) => options[m] !== undefined && options[m] !== false);
  if (modes.length > 1) throw new CliError("usage", `Use only one of --${modes.join(", --")}.`, undefined, 2);
  const mode = modes[0] ?? "get";
  if (mode === "get" || mode === "schema") return { mode };
  if (options[mode] === true) throw new CliError("usage", `--${mode} needs a JSON object (or @file.json).`, `Example: --${mode} '{"key":"value"}'`, 2);
  const value = readJsonOption(options[mode], mode);
  if (!isPlainObject(value)) throw new CliError("usage", `--${mode} must be a JSON object.`, undefined, 2);
  return { mode, value };
}

// Objects merge key by key (recursively); arrays, scalars and null
// replace what was there.
export function deepMerge<T>(base: T, patch: unknown): T {
  if (!isPlainObject(base) || !isPlainObject(patch)) return (patch === undefined ? base : patch) as T;
  const out: Record<string, unknown> = { ...base };
  for (const [k, v] of Object.entries(patch)) {
    out[k] = isPlainObject(out[k]) && isPlainObject(v) ? deepMerge(out[k], v) : v;
  }
  return out as T;
}

function kind(v: unknown): string {
  if (v === null) return "null";
  if (Array.isArray(v)) return "array";
  return typeof v;
}

// Unknown keys and type changes become warnings (never errors: configs
// written by newer versions may carry more), at every level whose
// default is an object with known keys — not inside maps (an empty
// default object, or a path the schema documents as a whole).
export function shapeWarnings(defaults: unknown, value: Record<string, unknown>, label: string, schema?: Record<string, unknown>, prefix = ""): string[] {
  if (!isPlainObject(defaults)) return [];
  const out: string[] = [];
  for (const [k, v] of Object.entries(value)) {
    const path = prefix ? `${prefix}.${k}` : k;
    if (!(k in defaults)) {
      if (!schema?.[path]) out.push(`${label}: "${path}" is not a setting of its default config (kept as is) — see --schema.`);
      continue;
    }
    const d = defaults[k];
    if (d === null || d === undefined || v === null) continue;
    if (kind(d) !== kind(v)) {
      out.push(`${label}: "${path}" is ${kind(v)}, the default is ${kind(d)}.`);
      continue;
    }
    if (isPlainObject(d) && isPlainObject(v) && Object.keys(d).length > 0 && !schema?.[path]) {
      out.push(...shapeWarnings(d, v, label, schema, path));
    }
  }
  return out;
}

export function changedKeys(before: unknown, after: unknown): string[] {
  const a = isPlainObject(before) ? before : {};
  const b = isPlainObject(after) ? after : {};
  return [...new Set([...Object.keys(a), ...Object.keys(b)])].filter((k) => JSON.stringify(a[k]) !== JSON.stringify(b[k]));
}

// --schema rows and value checks live in settingsSchema.ts (also used by
// ext check, without this module's CLI dependencies).
export { describeSettings, schemaErrors, type SettingField } from "./settingsSchema";

// `--set` replaces the whole config, but settings the extension manages
// itself (schema description "Managed by …": timestamps, logo flags,
// published paths) are kept from the stored config unless given.
export function keepManaged(prev: Record<string, unknown>, next: Record<string, unknown>, schema: Record<string, { description?: string }> | undefined): Record<string, unknown> {
  const out = { ...next };
  for (const [path, d] of Object.entries(schema ?? {})) {
    if (!/^Managed by/i.test(d.description ?? "") || path.includes(".")) continue;
    if (!(path in out) && path in prev) out[path] = prev[path];
  }
  return out;
}
