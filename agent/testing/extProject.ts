import { execFile } from "node:child_process";
import { mkdirSync, readdirSync, readFileSync, rmSync, symlinkSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { promisify } from "node:util";
import { main } from "../cli";
import type { Io } from "../output";

// Test helpers for `agentcms ext …`: run the CLI in-process, scaffold a
// project, wire its node_modules to this repo's packages (offline, no
// npm install) and build it with Vite's API.

export const REPO = resolve(__dirname, "..", "..");

export interface CliResult {
  code: number;
  body: { ok: boolean; data?: any; error?: { code: string; message: string; hint?: string } };
  stderr: string[];
}

export async function cli(args: string[]): Promise<CliResult> {
  const stdout: string[] = [];
  const stderr: string[] = [];
  const io: Io = { json: true, out: (t) => stdout.push(t), err: (t) => stderr.push(t) };
  const code = await main([...args, "--json"], io);
  return { code, body: JSON.parse(stdout.at(-1) ?? "{}"), stderr };
}

// node_modules/<pkg> → the repo's packages; @agent-cms/agentcms → the repo.
export function linkDeps(project: string): void {
  const nm = join(project, "node_modules");
  mkdirSync(join(nm, "@agent-cms"), { recursive: true });
  for (const name of readdirSync(join(REPO, "node_modules"))) {
    if (name === ".bin" || name === "@agent-cms" || name.startsWith(".")) continue;
    symlinkSync(join(REPO, "node_modules", name), join(nm, name));
  }
  symlinkSync(REPO, join(nm, "@agent-cms", "agentcms"));
}

export async function scaffold(dir: string, kind: "plugin" | "theme", id: string, features: string[] = []): Promise<string> {
  const project = join(dir, id);
  const res = await cli(["ext", "new", kind, id, "--dir", project, ...(features.length ? ["--with", features.join(",")] : [])]);
  if (!res.body.ok) throw new Error(`ext new failed: ${JSON.stringify(res.body.error)}`);
  linkDeps(project);
  return project;
}

export async function buildProject(project: string): Promise<void> {
  const { build } = await import("vite");
  await build({ root: project, configFile: join(project, "vite.config.ts"), logLevel: "silent" });
}

const run = promisify(execFile);

export async function typecheck(project: string): Promise<{ ok: boolean; output: string }> {
  try {
    await run(join(REPO, "node_modules", ".bin", "tsc"), ["--noEmit", "-p", join(project, "tsconfig.json")], { cwd: project });
    return { ok: true, output: "" };
  } catch (err) {
    const e = err as { stdout?: string; stderr?: string; message: string };
    return { ok: false, output: `${e.stdout ?? ""}${e.stderr ?? ""}` || e.message };
  }
}

export function cleanup(dir: string): void {
  rmSync(dir, { recursive: true, force: true });
}

export const errorCodes = (r: CliResult) => ((r.body.data?.errors ?? []) as Array<{ code: string }>).map((e) => e.code);
export const warningCodes = (r: CliResult) => ((r.body.data?.warnings ?? []) as Array<{ code: string }>).map((e) => e.code);

// Applies text edits to a project's files; each `from` must be present
// (so a scaffold change makes the mutation test fail loudly, not pass).
export function edit(project: string, file: string, from: string | RegExp, to: string): void {
  const abs = join(project, file);
  const text = readFileSync(abs, "utf8");
  const hit = typeof from === "string" ? text.includes(from) : from.test(text);
  if (!hit) throw new Error(`${file}: ${String(from)} not found`);
  writeFileSync(abs, text.replace(from, to));
}

// `ext check` / `ext preview` share process-wide state (registries, the
// in-memory store, console interception): concurrent tests build in
// parallel but check one at a time.
let queue: Promise<unknown> = Promise.resolve();
export function serially<T>(fn: () => Promise<T>): Promise<T> {
  const next = queue.then(fn, fn);
  queue = next.catch(() => {});
  return next;
}
