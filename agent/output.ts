// Output protocol shared by every command. Agents parse --json output, so
// it is one JSON object per invocation on stdout:
//   success → { "ok": true, "data": … }
//   failure → { "ok": false, "error": { "code", "message", "hint"? } }
// Human mode prints plain text. Logs and progress always go to stderr so
// they never corrupt the JSON on stdout.

export class CliError extends Error {
  constructor(
    readonly code: string,
    message: string,
    readonly hint?: string,
    readonly exitCode = 1,
  ) {
    super(message);
  }
}

export interface Io {
  json: boolean;
  out(text: string): void;
  err(text: string): void;
}

export function createIo(json: boolean): Io {
  return {
    json,
    out: (text) => process.stdout.write(text.endsWith("\n") ? text : text + "\n"),
    err: (text) => process.stderr.write(text.endsWith("\n") ? text : text + "\n"),
  };
}

export function printResult(io: Io, data: unknown, human: () => string): void {
  if (io.json) io.out(JSON.stringify({ ok: true, data }));
  else io.out(human());
}

export function printError(io: Io, error: unknown): number {
  const e =
    error instanceof CliError
      ? error
      : new CliError("internal", error instanceof Error ? error.message : String(error));
  if (io.json) {
    io.out(JSON.stringify({ ok: false, error: { code: e.code, message: e.message, ...(e.hint ? { hint: e.hint } : {}) } }));
  } else {
    io.err(`Error: ${e.message}${e.hint ? `\nHint: ${e.hint}` : ""}`);
  }
  return e.exitCode;
}
