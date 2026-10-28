// `plugins|themes config <id> --schema` rows and the value checks of
// --set / --merge, from an extension's settings.schema (API 1.5). Also
// used by `ext check` to make sure the defaults pass their own schema.

function isPlainObject(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null && !Array.isArray(v);
}

function kind(v: unknown): string {
  if (v === null) return "null";
  if (Array.isArray(v)) return "array";
  return typeof v;
}

export interface SettingField {
  path: string;
  type: string;
  default: unknown;
  description?: string;
  values?: ReadonlyArray<string | number | boolean>;
  min?: number;
  max?: number;
  format?: string;
}

type SchemaDoc = { description: string; values?: ReadonlyArray<string | number | boolean>; min?: number; max?: number; format?: string };

// One row per setting for `--schema`: every leaf of the default config
// (objects are walked, unless the schema documents the object as a
// whole, e.g. a map of CSS variables), with the extension's description
// and accepted values when it ships a `settings.schema`; documented
// settings absent from the defaults come last.
export function describeSettings(defaults: unknown, schema: Record<string, SchemaDoc> | undefined): SettingField[] {
  const out: SettingField[] = [];
  const doc = (path: string) => {
    const d = schema?.[path];
    return d ? { description: d.description, ...(d.values ? { values: d.values } : {}), ...(d.min !== undefined ? { min: d.min } : {}), ...(d.max !== undefined ? { max: d.max } : {}), ...(d.format ? { format: d.format } : {}) } : {};
  };
  const walk = (value: unknown, path: string) => {
    if (isPlainObject(value) && !(path && schema?.[path]) && Object.keys(value).length > 0) {
      for (const [k, v] of Object.entries(value)) walk(v, path ? `${path}.${k}` : k);
      return;
    }
    if (!path) return;
    out.push({ path, type: kind(value), default: value, ...doc(path) });
  };
  walk(defaults, "");
  for (const path of Object.keys(schema ?? {})) {
    if (!out.some((f) => f.path === path)) out.push({ path, type: "unknown", default: undefined, ...doc(path) });
  }
  return out;
}

function valueAt(obj: unknown, path: string): unknown {
  let cur: unknown = obj;
  for (const k of path.split(".")) {
    if (!isPlainObject(cur)) return undefined;
    cur = cur[k];
  }
  return cur;
}

// Values outside a documented closed list or range: refused before
// anything is saved (the settings page would never produce them). With
// `previous`, only changed values are checked — a stored value from an
// older version never blocks an unrelated change.
export function schemaErrors(schema: Record<string, SchemaDoc> | undefined, config: unknown, previous?: unknown): string[] {
  const out: string[] = [];
  for (const [path, d] of Object.entries(schema ?? {})) {
    const v = valueAt(config, path);
    if (v === undefined || v === null) continue;
    if (previous !== undefined && JSON.stringify(valueAt(previous, path)) === JSON.stringify(v)) continue;
    if (d.values && !d.values.includes(v as string | number | boolean)) {
      out.push(`"${path}" is ${JSON.stringify(v)}; accepted: ${d.values.map((x) => JSON.stringify(x)).join(", ")}.`);
    }
    if (typeof v === "number" && ((d.min !== undefined && v < d.min) || (d.max !== undefined && v > d.max))) {
      out.push(`"${path}" is ${v}; accepted: ${d.min ?? "…"} to ${d.max ?? "…"}.`);
    }
  }
  return out;
}
