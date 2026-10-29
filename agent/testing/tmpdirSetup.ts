// Vitest global setup: every temporary folder of the run (test roots,
// fake sites, the extension host's bundle copies, Chrome profiles…) goes
// under one folder that is removed at the end. Workers are killed without
// running their own "exit" cleanups, which used to leave gigabytes of
// agentcms-* folders behind in the system temp directory.
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

export default function setup(): () => void {
  const dir = mkdtempSync(join(tmpdir(), "agentcms-vitest-"));
  // os.tmpdir() reads these on every call; workers inherit them.
  process.env.TMPDIR = dir;
  process.env.TMP = dir;
  process.env.TEMP = dir;
  return () => rmSync(dir, { recursive: true, force: true });
}
