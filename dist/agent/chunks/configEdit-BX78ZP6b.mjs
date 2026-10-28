import { createRequire as __acmsRequire } from "node:module";
import { fileURLToPath as __acmsPath } from "node:url";
import { dirname as __acmsDirname } from "node:path";
const require2 = __acmsRequire(import.meta.url);
const __filename = __acmsPath(import.meta.url);
const __dirname = __acmsDirname(__filename);
import { C as CliError } from "../agentcms.mjs";
import { readJsonOption } from "./adminCommon-BosiodJN.mjs";
import { d as describeSettings, s as schemaErrors } from "./settingsSchema-CtnnDU72.mjs";
import "node:util";
import "node:fs";
import "node:path";
import "node:url";
import "node:os";
import "node:child_process";
import "node:http";
import "./session-C5Os0asS.mjs";
import "./extHost-CLSmPEu2.mjs";
import "node:module";
function isPlainObject(v) {
  return typeof v === "object" && v !== null && !Array.isArray(v);
}
function readConfigRequest(options) {
  const modes = ["get", "schema", "set", "merge"].filter((m) => options[m] !== void 0 && options[m] !== false);
  if (modes.length > 1) throw new CliError("usage", `Use only one of --${modes.join(", --")}.`, void 0, 2);
  const mode = modes[0] ?? "get";
  if (mode === "get" || mode === "schema") return { mode };
  if (options[mode] === true) throw new CliError("usage", `--${mode} needs a JSON object (or @file.json).`, `Example: --${mode} '{"key":"value"}'`, 2);
  const value = readJsonOption(options[mode], mode);
  if (!isPlainObject(value)) throw new CliError("usage", `--${mode} must be a JSON object.`, void 0, 2);
  return { mode, value };
}
function deepMerge(base, patch) {
  if (!isPlainObject(base) || !isPlainObject(patch)) return patch === void 0 ? base : patch;
  const out = { ...base };
  for (const [k, v] of Object.entries(patch)) {
    out[k] = isPlainObject(out[k]) && isPlainObject(v) ? deepMerge(out[k], v) : v;
  }
  return out;
}
function kind(v) {
  if (v === null) return "null";
  if (Array.isArray(v)) return "array";
  return typeof v;
}
function shapeWarnings(defaults, value, label) {
  if (!isPlainObject(defaults)) return [];
  const out = [];
  for (const [k, v] of Object.entries(value)) {
    if (!(k in defaults)) {
      out.push(`${label}: "${k}" is not a setting of its default config (kept as is) — see --schema.`);
      continue;
    }
    const d = defaults[k];
    if (d === null || d === void 0 || v === null) continue;
    if (kind(d) !== kind(v)) out.push(`${label}: "${k}" is ${kind(v)}, the default is ${kind(d)}.`);
  }
  return out;
}
function changedKeys(before, after) {
  const a = isPlainObject(before) ? before : {};
  const b = isPlainObject(after) ? after : {};
  return [.../* @__PURE__ */ new Set([...Object.keys(a), ...Object.keys(b)])].filter((k) => JSON.stringify(a[k]) !== JSON.stringify(b[k]));
}
export {
  changedKeys,
  deepMerge,
  describeSettings,
  readConfigRequest,
  schemaErrors,
  shapeWarnings
};
