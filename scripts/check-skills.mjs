// Release guard for the agent skills (run in CI after `npm run build`).
// Fails when skills drift from the code they drive:
//   - plugin / skill / package versions differ, or a skill pins another
//     agentcms version than the one being released
//   - a skill calls an `agentcms <command>` the CLI doesn't have
//   - SKILL.md frontmatter uses non-portable keys, or name ≠ folder
//   - skill text is not English (skills must be 100% English; agents
//     translate for the user at runtime)
//   - changelog.json has no entry for this version
// Usage: node scripts/check-skills.mjs

import { execFileSync } from "node:child_process";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join, relative, resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const read = (p) => readFileSync(join(root, p), "utf8");
const pkg = JSON.parse(read("package.json"));
const version = pkg.version;
const problems = [];
const fail = (file, msg) => problems.push(`${file}: ${msg}`);

// --- versions ---------------------------------------------------------
const plugin = JSON.parse(read("plugin/.claude-plugin/plugin.json"));
const market = JSON.parse(read(".claude-plugin/marketplace.json"));
if (plugin.version !== version) fail("plugin/.claude-plugin/plugin.json", `version ${plugin.version} ≠ package.json ${version} (run \`node scripts/sync-version.mjs\`)`);
const entry = market.plugins?.find((p) => p.name === plugin.name);
if (!entry) fail(".claude-plugin/marketplace.json", `no plugin entry named "${plugin.name}"`);
else if (entry.version) fail(".claude-plugin/marketplace.json", "set the version in plugin.json only (it silently wins over the entry's)");

const versionInfo = JSON.parse(read("dist/version.json"));
if (versionInfo.version !== version) fail("dist/version.json", `version ${versionInfo.version} ≠ ${version} — rebuild`);
if (cmp(versionInfo.minSkillsVersion, version) > 0) fail("package.json", `agentcms.minSkillsVersion ${versionInfo.minSkillsVersion} is newer than the release ${version}`);

const changelog = JSON.parse(read("changelog.json"));
const current = changelog.versions?.find((v) => v.version === version);
if (!current) fail("changelog.json", `no entry for ${version}`);
for (const v of changelog.versions ?? []) {
  if (typeof v.version !== "string" || typeof v.date !== "string" || typeof v.breaking !== "boolean" || !Array.isArray(v.changes) || !Array.isArray(v.actions)) {
    fail("changelog.json", `entry ${v.version ?? "?"} needs version, date, breaking (boolean), changes[] and actions[]`);
  }
}
const order = (changelog.versions ?? []).map((v) => v.version);
if (order.join() !== [...order].sort((a, b) => cmp(b, a)).join()) fail("changelog.json", "entries must be sorted newest first");

// --- CLI commands -----------------------------------------------------
const cli = join(root, "dist", "agent", "agentcms.mjs");
const help = JSON.parse(execFileSync(process.execPath, [cli, "help", "--json"], { encoding: "utf8" }));
const commands = new Set(help.data.commands.map((c) => c.name));

// --- skills -----------------------------------------------------------
const PORTABLE_KEYS = new Set(["name", "description", "license", "compatibility", "metadata", "allowed-tools"]);
const FRENCH = /\b(les|des|une|est|pour|avec|dans|vous|votre|vos|nous|sont|cette|mais|aussi|donc|être|faire|fichier|dossier|hébergement|données|jeton|clé|ici|puis|déjà)\b/i;
const ACCENTED = /[À-ÖØ-öø-ÿŒœ]/;

const skillsDir = join(root, "plugin", "skills");
const skills = readdirSync(skillsDir).filter((n) => existsSync(join(skillsDir, n, "SKILL.md")));
if (skills.length === 0) fail("plugin/skills", "no skills found");
for (const name of skills) {
  const skillMd = join(skillsDir, name, "SKILL.md");
  const fm = frontmatter(readFileSync(skillMd, "utf8"));
  const rel = relative(root, skillMd);
  if (!fm) {
    fail(rel, "missing YAML frontmatter");
    continue;
  }
  for (const key of fm.keys) if (!PORTABLE_KEYS.has(key)) fail(rel, `frontmatter key "${key}" is not portable (allowed: ${[...PORTABLE_KEYS].join(", ")})`);
  if (fm.values.name !== name) fail(rel, `name "${fm.values.name}" must equal its folder "${name}"`);
  if (!fm.values.description) fail(rel, "description is required");
  if (fm.values["metadata.version"] !== version) fail(rel, `metadata.version ${fm.values["metadata.version"]} ≠ ${version}`);

  for (const file of walk(join(skillsDir, name))) {
    const r = relative(root, file);
    const text = readFileSync(file, "utf8");
    for (const m of text.matchAll(/npx(?:\s+-y)?\s+agentcms(@[0-9][\w.-]*)?(?:[ \t]+([a-z][a-z-]*))?/g)) {
      if (!m[1]) fail(r, `unpinned "${m[0]}" — always call npx -y agentcms@${version}`);
      else if (m[1] !== `@${version}`) fail(r, `pins agentcms${m[1]} instead of @${version}`);
      if (m[2] && !commands.has(m[2])) fail(r, `calls unknown command "${m[2]}" (have: ${[...commands].join(", ")})`);
    }
    const prose = text.replace(/```[\s\S]*?```/g, "").replace(/`[^`\n]*`/g, "");
    prose.split("\n").forEach((line, i) => {
      if (ACCENTED.test(line) || FRENCH.test(line)) fail(`${r}:${i + 1}`, `not English: ${line.trim().slice(0, 80)}`);
    });
  }
}

if (problems.length) {
  console.error(`[check-skills] ${problems.length} problem(s):\n  - ${problems.join("\n  - ")}`);
  process.exit(1);
}
console.log(`[check-skills] ${skills.length} skill(s) OK for agentcms ${version} (commands: ${[...commands].join(", ")})`);

// --- helpers ----------------------------------------------------------
function walk(dir) {
  return readdirSync(dir, { withFileTypes: true }).flatMap((e) =>
    e.isDirectory() ? walk(join(dir, e.name)) : /\.(md|txt)$/.test(e.name) ? [join(dir, e.name)] : [],
  );
}

// Tiny YAML-frontmatter reader: top-level keys + one level of nesting
// (enough for name / description / metadata.version).
function frontmatter(text) {
  const m = /^---\n([\s\S]*?)\n---\n/.exec(text);
  if (!m) return null;
  const keys = [];
  const values = {};
  let parent = null;
  for (const line of m[1].split("\n")) {
    const top = /^([A-Za-z][\w-]*):\s*(.*)$/.exec(line);
    const nested = /^\s+([A-Za-z][\w-]*):\s*(.*)$/.exec(line);
    if (top) {
      keys.push(top[1]);
      parent = top[2] === "" ? top[1] : null;
      values[top[1]] = unquote(top[2]);
    } else if (nested && parent) {
      values[`${parent}.${nested[1]}`] = unquote(nested[2]);
    }
  }
  return { keys, values };
}

function unquote(v) {
  return v.trim().replace(/^(["'])(.*)\1$/, "$2");
}

function cmp(a, b) {
  const pa = a.split(/[.-]/).map((x) => (/^\d+$/.test(x) ? Number(x) : x));
  const pb = b.split(/[.-]/).map((x) => (/^\d+$/.test(x) ? Number(x) : x));
  for (let i = 0; i < 3; i++) if (pa[i] !== pb[i]) return pa[i] < pb[i] ? -1 : 1;
  return 0;
}
