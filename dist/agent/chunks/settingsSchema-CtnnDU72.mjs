import { createRequire as __acmsRequire } from "node:module";
import { fileURLToPath as __acmsPath } from "node:url";
import { dirname as __acmsDirname } from "node:path";
const require2 = __acmsRequire(import.meta.url);
const __filename = __acmsPath(import.meta.url);
const __dirname = __acmsDirname(__filename);
function isPlainObject(v) {
  return typeof v === "object" && v !== null && !Array.isArray(v);
}
function kind(v) {
  if (v === null) return "null";
  if (Array.isArray(v)) return "array";
  return typeof v;
}
function describeSettings(defaults, schema) {
  const out = [];
  const doc = (path) => {
    const d = schema?.[path];
    return d ? { description: d.description, ...d.values ? { values: d.values } : {}, ...d.min !== void 0 ? { min: d.min } : {}, ...d.max !== void 0 ? { max: d.max } : {}, ...d.format ? { format: d.format } : {} } : {};
  };
  const walk = (value, path) => {
    if (isPlainObject(value) && !(path && schema?.[path]) && Object.keys(value).length > 0) {
      for (const [k, v] of Object.entries(value)) walk(v, path ? `${path}.${k}` : k);
      return;
    }
    if (!path) return;
    out.push({ path, type: kind(value), default: value, ...doc(path) });
  };
  walk(defaults, "");
  for (const path of Object.keys(schema ?? {})) {
    if (!out.some((f) => f.path === path)) out.push({ path, type: "unknown", default: void 0, ...doc(path) });
  }
  return out;
}
function valueAt(obj, path) {
  let cur = obj;
  for (const k of path.split(".")) {
    if (!isPlainObject(cur)) return void 0;
    cur = cur[k];
  }
  return cur;
}
function schemaErrors(schema, config, previous) {
  const out = [];
  for (const [path, d] of Object.entries(schema ?? {})) {
    const v = valueAt(config, path);
    if (v === void 0 || v === null) continue;
    if (previous !== void 0 && JSON.stringify(valueAt(previous, path)) === JSON.stringify(v)) continue;
    if (d.values && !d.values.includes(v)) {
      out.push(`"${path}" is ${JSON.stringify(v)}; accepted: ${d.values.map((x) => JSON.stringify(x)).join(", ")}.`);
    }
    if (typeof v === "number" && (d.min !== void 0 && v < d.min || d.max !== void 0 && v > d.max)) {
      out.push(`"${path}" is ${v}; accepted: ${d.min ?? "…"} to ${d.max ?? "…"}.`);
    }
  }
  return out;
}
export {
  describeSettings as d,
  schemaErrors as s
};
