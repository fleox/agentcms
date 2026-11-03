import type { Io } from "../output";

export interface OptionSpec {
  name: string;
  type: "string" | "boolean";
  description: string;
  default?: string | boolean;
  // Can be given several times: true = values joined with a space in
  // `options`; "list" = each value kept apart in `lists` (values that may
  // contain spaces, e.g. --field label="New today").
  multiple?: boolean | "list";
}

export interface CommandContext {
  io: Io;
  options: Record<string, string | boolean | undefined>;
  // Every value of the `multiple: "list"` options, in order.
  lists?: Record<string, string[]>;
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
