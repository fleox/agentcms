import type { Io } from "../output";

export interface OptionSpec {
  name: string;
  type: "string" | "boolean";
  description: string;
  default?: string | boolean;
}

export interface CommandContext {
  io: Io;
  options: Record<string, string | boolean | undefined>;
  positionals: string[];
}

export interface Command {
  name: string;
  summary: string;
  // Usage line after `agentcms`, e.g. "serve [--port <n>]".
  usage: string;
  options: OptionSpec[];
  run(ctx: CommandContext): Promise<number | void>;
}
