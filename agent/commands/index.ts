import { printResult } from "../output";
import { readVersionInfo } from "../paths";
import { compactDataCommand } from "./compactData";
import { credentialsCommand } from "./credentials";
import { deployAdminCommand } from "./deployAdmin";
import { doctorCommand } from "./doctor";
import { installCommand } from "./install";
import { optionsCommand } from "./options";
import { serveCommand } from "./serve";
import { siteCommand } from "./site";
import { statusCommand } from "./status";
import type { Command } from "./types";
import { versionCommand } from "./version";

// Every command the CLI exposes. `help --json` lists them, and
// scripts/check-skills.mjs fails the build when a skill mentions a
// command that is not here — keep skills and commands in sync.

const helpCommand: Command = {
  name: "help",
  summary: "List commands and their options (--json gives a machine-readable list).",
  usage: "help [<command>]",
  options: [],
  async run({ io, positionals }) {
    const wanted = positionals[0];
    const list = wanted ? COMMANDS.filter((c) => c.name === wanted) : COMMANDS;
    const { version } = readVersionInfo();
    const data = {
      name: "agentcms",
      version,
      globalOptions: GLOBAL_OPTIONS,
      commands: list.map(({ name, summary, usage, options }) => ({ name, summary, usage, options })),
    };
    printResult(io, data, () =>
      [
        `agentcms ${version} — install and manage AgentCMS sites from a terminal or an AI agent.`,
        "",
        "Usage: agentcms <command> [options] [--json]",
        "",
        ...list.flatMap((c) => [
          `  ${c.usage}`,
          `      ${c.summary}`,
          ...c.options.map((o) => `      --${o.name}${o.type === "string" ? " <value>" : ""}  ${o.description}`),
        ]),
        "",
        "Global options:",
        ...GLOBAL_OPTIONS.map((o) => `  --${o.name}  ${o.description}`),
      ].join("\n"),
    );
  },
};

export const GLOBAL_OPTIONS = [
  { name: "json", type: "boolean" as const, description: "Print one JSON object on stdout: { ok, data } or { ok: false, error }." },
];

export const COMMANDS: Command[] = [
  helpCommand,
  versionCommand,
  statusCommand,
  optionsCommand,
  credentialsCommand,
  siteCommand,
  installCommand,
  deployAdminCommand,
  doctorCommand,
  compactDataCommand,
  serveCommand,
];

export function findCommand(name: string): Command | undefined {
  return COMMANDS.find((c) => c.name === name);
}
