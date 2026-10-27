import { writeFileSync } from "node:fs";
import { join } from "node:path";
import { main } from "../cli";
import type { Io } from "../output";

// Shared helpers of the site-administration e2e tests (content,
// regenerate, terms, menus, settings): run the CLI in-process with
// --json, and write an install plan.

export interface CliRun {
  code: number;
  body: { ok: boolean; data?: any; error?: { code: string; message: string; hint?: string } };
}

export async function cli(args: string[]): Promise<CliRun> {
  const stdout: string[] = [];
  const io: Io = { json: true, out: (t) => stdout.push(t), err: () => {} };
  const code = await main([...args, "--json"], io);
  return { code, body: JSON.parse(stdout.at(-1) ?? "{}") };
}

// `cli` bound to one site; fails loudly with the CLI error when a step
// that should succeed doesn't.
export function siteCli(alias: string) {
  const run = (args: string[]) => cli([...args, "--site", alias]);
  const ok = async (args: string[]) => {
    const r = await run(args);
    if (r.code !== 0 || !r.body.ok) throw new Error(`agentcms ${args.join(" ")} → ${r.code}: ${JSON.stringify(r.body.error ?? r.body.data)}`);
    return r.body.data;
  };
  return { run, ok };
}

export function writePlan(dir: string, name: string, plan: unknown): string {
  const file = join(dir, `${name}.json`);
  writeFileSync(file, JSON.stringify(plan));
  return file;
}
