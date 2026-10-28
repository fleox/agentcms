// Builds the Hermes Agent skills (hermes/skills/) from the agent skills
// (plugin/skills/) and the Python helpers (hermes/python/):
//
//   hermes/skills/<name>/SKILL.md        Hermes frontmatter + the same body,
//                                        commands run through scripts/agentcms.py
//   hermes/skills/<name>/references/     same files, same rewrite
//   hermes/skills/<name>/scripts/*.py    agentcms.py (+ the skill's helpers),
//                                        version-pinned
//
// plugin/skills stays the single source of truth: never edit hermes/skills
// by hand. `--check` fails when the committed output is stale (CI).

import { existsSync, mkdirSync, readdirSync, readFileSync, rmSync, statSync, writeFileSync } from "node:fs";
import { dirname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const { version } = JSON.parse(readFileSync(join(root, "package.json"), "utf8"));
const check = process.argv.includes("--check");

const SOURCE = join(root, "plugin", "skills");
const PY = join(root, "hermes", "python");
const OUT = join(root, "hermes", "skills");

// Python helpers shipped with each skill (agentcms.py always).
const HELPERS = {
  "agentcms-install": ["site_report.py"],
  "agentcms-manage": ["site_report.py", "update_sites.py"],
  "agentcms-admin": ["publish_markdown.py", "upload_media.py"],
  "agentcms-extensions": [],
};
const TAGS = {
  "agentcms-install": ["AgentCMS", "CMS", "Static site", "Install", "Hosting"],
  "agentcms-manage": ["AgentCMS", "CMS", "Static site", "Maintenance", "Updates"],
  "agentcms-admin": ["AgentCMS", "CMS", "Static site", "Publishing", "Content"],
  "agentcms-extensions": ["AgentCMS", "CMS", "Plugins", "Themes", "React"],
};

const RUN_SKILL = "python3 ${HERMES_SKILL_DIR}/scripts/agentcms.py";
const RUN_REF = "python3 <skill dir>/scripts/agentcms.py";

function frontmatter(md) {
  const m = /^---\n([\s\S]*?)\n---\n/.exec(md);
  if (!m) throw new Error("no frontmatter");
  const get = (key) => new RegExp(`^${key}:\\s*(.*)$`, "m").exec(m[1])?.[1]?.trim() ?? "";
  return { name: get("name"), description: get("description"), license: get("license"), body: md.slice(m[0].length) };
}

// Commands and Claude Code specifics → the Hermes wrapper.
function rewrite(text, run) {
  return text
    // The user stores a secret in their own terminal (hidden prompt).
    .replace(/in Claude Code they type `! npx -y @agent-cms\/agentcms@[^ `]+ /g, `in their own terminal they run \`${run} `)
    .replace(/`! npx -y @agent-cms\/agentcms@[^ `]+ /g, `\`${run} `)
    .replace(/^! npx -y @agent-cms\/agentcms@\S+ /gm, `${run} `)
    .replace(/npx -y @agent-cms\/agentcms@\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)? /g, `${run} `)
    // Without npm: the wrapper runs a clone's build instead.
    .replace(/use `node agentcms\/dist\/agent\/agentcms\.mjs`( from a clone of the repository instead| the same way)/g, "set `AGENTCMS_CMD=\"node <clone>/dist/agent/agentcms.mjs\"` (the wrapper then runs that build)")
    .replace(/Fallback without npm: `node agentcms\/dist\/agent\/agentcms\.mjs` from a clone of (\S+)\./g, "Fallback without npm: clone $1, build it, and set `AGENTCMS_CMD=\"node <clone>/dist/agent/agentcms.mjs\"`.")
    .replace(/\(Claude Code: `\/plugin marketplace update agentcms`, then `\/reload-plugins`\)/g, "(Hermes: `hermes skills update`, or re-install them from the repository's `hermes/skills`)")
    .replace(/Claude Code `\/plugin marketplace update agentcms` then `\/reload-plugins`; other agents re-read the skills from the repository\./g, "Hermes: `hermes skills update` (or re-install them from the repository's `hermes/skills`).");
}

function hermesHeader(name) {
  const helpers = HELPERS[name] ?? [];
  return [
    "## Running the commands (Hermes)",
    "",
    `Every \`agentcms <command>\` below runs through this skill's Python wrapper: \`${RUN_SKILL} <command> …\`. It adds \`--json\`, prints the CLI's JSON object (\`{"ok": true, "data": …}\` or \`{"ok": false, "error": {code, message, hint}}\`) and exits with the CLI's code. In the reference files, \`${RUN_REF}\` means the same command with this skill's directory.`,
    "",
    "- **Requirements:** Python 3.9+ (stdlib only) and **Node.js 20.6+**: the AgentCMS engine is the `@agent-cms/agentcms` npm package, fetched by `npx` on first use and pinned to the version of these skills. Without Node.js the wrapper answers `node-missing` with how to install it. `AGENTCMS_CMD` overrides the engine command (e.g. `node /path/to/agentcms.mjs` from a clone).",
    "- **From Python:** `sys.path.insert(0, \"${HERMES_SKILL_DIR}/scripts\")`, then `from agentcms import run, AgentcmsError` — `run(\"content\", \"list\", site=\"blog\")` returns `data` and raises `AgentcmsError(code, message, hint)` when `ok` is false.",
    "- **Secrets** never go through the chat. The user either types them in their own terminal (`" + RUN_SKILL + " credentials set <account>` asks at a hidden prompt), or puts them in environment variables (e.g. in `~/.hermes/.env`) that you pass by name: `credentials set <account> --from-env VAR` (`--from-env KEY_ID,SECRET` for S3).",
    ...(helpers.length
      ? ["- **Helpers** in `${HERMES_SKILL_DIR}/scripts/` (each prints one JSON object; `--help` for options):", ...helpers.map((h) => `  - \`${h}\`: ${helperSummary(h)}`)]
      : []),
    "",
  ].join("\n");
}

function helperSummary(file) {
  const src = readFileSync(join(PY, file), "utf8");
  const doc = /"""([\s\S]*?)"""/.exec(src)?.[1]?.trim().split("\n")[0] ?? "";
  return doc.replace(/\.$/, "") + ".";
}

function yamlString(s) {
  return JSON.stringify(s);
}

function buildSkill(name) {
  const src = join(SOURCE, name);
  const fm = frontmatter(readFileSync(join(src, "SKILL.md"), "utf8"));
  const others = Object.keys(HELPERS).filter((n) => n !== name);
  const header = [
    "---",
    `name: ${fm.name}`,
    `description: ${yamlString(fm.description.replace(/^"|"$/g, ""))}`,
    `version: ${version}`,
    "author: AgentCMS",
    `license: ${fm.license}`,
    "platforms: [macos, linux, windows]",
    "metadata:",
    "  hermes:",
    `    tags: [${TAGS[name].join(", ")}]`,
    `    related_skills: [${others.join(", ")}]`,
    "---",
    "",
  ].join("\n");
  // Insert the Hermes section right after the first heading's intro line.
  const body = rewrite(fm.body, RUN_SKILL);
  const firstSection = body.indexOf("\n## ");
  const merged = firstSection >= 0 ? body.slice(0, firstSection + 1) + hermesHeader(name) + "\n" + body.slice(firstSection + 1) : body + "\n" + hermesHeader(name);
  const files = new Map([["SKILL.md", header + merged]]);
  const refs = join(src, "references");
  if (existsSync(refs)) {
    for (const f of readdirSync(refs)) files.set(`references/${f}`, rewrite(readFileSync(join(refs, f), "utf8"), RUN_REF));
  }
  for (const py of ["agentcms.py", ...(HELPERS[name] ?? [])]) {
    files.set(`scripts/${py}`, readFileSync(join(PY, py), "utf8").replace(/__AGENTCMS_VERSION__/g, version));
  }
  return files;
}

function walk(dir) {
  if (!existsSync(dir)) return [];
  return readdirSync(dir).flatMap((n) => {
    const p = join(dir, n);
    return statSync(p).isDirectory() ? walk(p) : [p];
  });
}

const expected = new Map();
for (const name of readdirSync(SOURCE)) {
  if (!existsSync(join(SOURCE, name, "SKILL.md"))) continue;
  for (const [rel, content] of buildSkill(name)) expected.set(join(OUT, name, rel), content);
}

if (check) {
  const problems = [];
  for (const [file, content] of expected) {
    if (!existsSync(file)) problems.push(`missing ${relative(root, file)}`);
    else if (readFileSync(file, "utf8") !== content) problems.push(`stale ${relative(root, file)}`);
  }
  for (const file of walk(OUT)) if (!expected.has(file)) problems.push(`extra ${relative(root, file)}`);
  if (problems.length) {
    console.error(`[hermes] hermes/skills is out of date (run \`npm run hermes:build\`):\n  ${problems.join("\n  ")}`);
    process.exit(1);
  }
  console.log(`[hermes] ${expected.size} file(s) up to date for agentcms ${version}`);
} else {
  rmSync(OUT, { recursive: true, force: true });
  for (const [file, content] of expected) {
    mkdirSync(dirname(file), { recursive: true });
    writeFileSync(file, content, { mode: file.endsWith(".py") ? 0o755 : 0o644 });
  }
  console.log(`[hermes] wrote ${expected.size} file(s) to hermes/skills for agentcms ${version}`);
}
