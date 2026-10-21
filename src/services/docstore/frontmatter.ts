// Frontmatter for the Markdown content files.
//
// Written form: one `key: value` line per field. Strings that are safe
// as YAML plain scalars stay unquoted for readability; everything else
// (special characters, numbers-as-strings, objects, arrays) is emitted
// as JSON, which is valid YAML flow syntax. So the output is valid YAML
// any tool can read, and parsing what we wrote is lossless.
//
// Read form is more tolerant, so hand-edited files keep working:
// single-quoted strings, block lists (`- item`), one level of nested
// mappings, and inline lists without quotes.

const FENCE = "---";

const RESERVED = /^(?:true|false|null|yes|no|on|off|~|y|n)$/i;
const NUMERIC = /^[-+]?(?:\d[\d_]*)?(?:\.\d+)?(?:e[-+]?\d+)?$|^0x[0-9a-f]+$|^\.(?:inf|nan)$/i;
// Conservative plain-scalar charset: no leading indicator characters,
// no ": " or " #" sequences, no leading/trailing spaces.
const PLAIN = /^[\p{L}\p{N}][\p{L}\p{N} _.,!?()&'/+-]*$/u;

function isPlainSafe(s: string): boolean {
  return (
    s.length > 0 &&
    s.trim() === s &&
    PLAIN.test(s) &&
    !RESERVED.test(s) &&
    !NUMERIC.test(s) &&
    !s.includes(": ") &&
    !s.includes(" #")
  );
}

function stringifyValue(value: unknown): string {
  if (typeof value === "string") return isPlainSafe(value) ? value : JSON.stringify(value);
  if (value === null) return "null";
  return JSON.stringify(value);
}

export function stringifyFrontmatter(data: Record<string, unknown>, body: string): string {
  const lines = [FENCE];
  for (const [key, value] of Object.entries(data)) {
    if (value === undefined) continue;
    lines.push(`${key}: ${stringifyValue(value)}`);
  }
  lines.push(FENCE, "");
  return lines.join("\n") + "\n" + body;
}

function parseScalar(raw: string): unknown {
  const v = raw.trim();
  if (v === "") return "";
  if (v.startsWith('"')) {
    try {
      return JSON.parse(v);
    } catch {
      return v.replace(/^"|"$/g, "");
    }
  }
  if (v.startsWith("'") && v.endsWith("'") && v.length >= 2) return v.slice(1, -1).replace(/''/g, "'");
  if (v.startsWith("{") || v.startsWith("[")) {
    try {
      return JSON.parse(v);
    } catch {
      if (v.startsWith("[") && v.endsWith("]")) {
        const inner = v.slice(1, -1).trim();
        return inner ? inner.split(",").map((part) => parseScalar(part)) : [];
      }
      return v;
    }
  }
  if (/^(?:true|yes|on)$/i.test(v)) return true;
  if (/^(?:false|no|off)$/i.test(v)) return false;
  if (/^(?:null|~)$/i.test(v)) return null;
  // Numbers only in the unambiguous decimal form — "01-intro" stays a string.
  if (/^-?(?:0|[1-9]\d*)(?:\.\d+)?$/.test(v)) return Number(v);
  return v;
}

function stripComment(line: string): string {
  let single = false;
  let double = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === "\\" && double) {
      i++;
      continue;
    }
    if (ch === "'" && !double) single = !single;
    else if (ch === '"' && !single) double = !double;
    else if (ch === "#" && !single && !double && (i === 0 || /\s/.test(line[i - 1]))) return line.slice(0, i);
  }
  return line;
}

function parseYaml(text: string): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  const lines = text.split(/\r?\n/);
  for (let i = 0; i < lines.length; i++) {
    const line = stripComment(lines[i]).replace(/\s+$/, "");
    if (!line.trim() || /^\s/.test(line)) continue;
    const colon = line.indexOf(":");
    if (colon === -1) continue;
    const key = line.slice(0, colon).trim().replace(/^["']|["']$/g, "");
    const rest = line.slice(colon + 1).trim();
    if (rest !== "") {
      out[key] = parseScalar(rest);
      continue;
    }
    // Block list or one-level nested mapping on the following indented lines.
    const items: unknown[] = [];
    const map: Record<string, unknown> = {};
    let kind: "list" | "map" | null = null;
    while (i + 1 < lines.length) {
      const next = stripComment(lines[i + 1]).replace(/\s+$/, "");
      if (!next.trim()) {
        i++;
        continue;
      }
      if (!/^\s/.test(next)) break;
      const trimmed = next.trim();
      if (trimmed.startsWith("- ") || trimmed === "-") {
        kind = kind ?? "list";
        items.push(parseScalar(trimmed.slice(1)));
      } else {
        const c = trimmed.indexOf(":");
        if (c > 0) {
          kind = kind ?? "map";
          map[trimmed.slice(0, c).trim()] = parseScalar(trimmed.slice(c + 1));
        }
      }
      i++;
    }
    out[key] = kind === "list" ? items : kind === "map" ? map : null;
  }
  return out;
}

export function parseFrontmatter(text: string): { data: Record<string, unknown>; body: string } {
  const normalized = text.replace(/^﻿/, "");
  if (!/^---\r?\n/.test(normalized)) return { data: {}, body: normalized };
  const afterOpen = normalized.replace(/^---\r?\n/, "");
  const end = /(?:^|\r?\n)---[ \t]*(?:\r?\n|$)/.exec(afterOpen);
  if (!end) return { data: {}, body: normalized };
  const yaml = afterOpen.slice(0, end.index);
  let body = afterOpen.slice(end.index + end[0].length);
  // stringifyFrontmatter separates fence and body with one blank line.
  body = body.replace(/^\r?\n/, "");
  return { data: parseYaml(yaml), body };
}
