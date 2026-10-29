#!/usr/bin/env python3
"""AgentCMS from Python — a thin, dependency-free wrapper of the `agentcms` CLI.

The AgentCMS engine (rendering, publishing, data backends) is the
`@agent-cms/agentcms` npm package and runs on Node.js 20+. This module runs
it for Python agents and scripts, always in JSON mode, and turns its output
into Python values:

    from agentcms import run, AgentcmsError
    sites = run("site", "list")["sites"]
    post = run("content", "create", "--title", "Hello", "--body", "@hello.md", site="blog")

Command line (same arguments as the CLI; --json is added for you):

    python3 agentcms.py status
    python3 agentcms.py content list --site blog --status online

Output: the CLI's JSON object, pretty-printed: {"ok": true, "data": …} or
{"ok": false, "error": {"code", "message", "hint"}}. Progress lines go to
stderr. The exit code is the CLI's (0 ok, 1 failure, 2 usage error).

Engine selection: $AGENTCMS_CMD when set (e.g. "node /path/to/agentcms.mjs"),
else `npx -y @agent-cms/agentcms@<pinned version>`. Python 3.9+, stdlib only.
"""

from __future__ import annotations

import json
import os
import re
import shlex
import shutil
import subprocess
import sys
from typing import Any, Dict, List, Optional, Sequence

# Pinned to the release these skills were written for (kept in step by the
# repository's release script).
VERSION = "0.3.5"
PACKAGE = "@agent-cms/agentcms"
MIN_NODE = (20, 6)

__all__ = ["run", "run_raw", "AgentcmsError", "engine_command", "VERSION"]


class AgentcmsError(Exception):
    """A failed command: `code`, `message` and the CLI's `hint` (what to do)."""

    def __init__(self, code: str, message: str, hint: Optional[str] = None, exit_code: int = 1):
        super().__init__(f"{code}: {message}" + (f" — {hint}" if hint else ""))
        self.code = code
        self.message = message
        self.hint = hint
        self.exit_code = exit_code

    def as_json(self) -> Dict[str, Any]:
        err: Dict[str, Any] = {"code": self.code, "message": self.message}
        if self.hint:
            err["hint"] = self.hint
        return {"ok": False, "error": err}


def _node_version() -> Optional[tuple]:
    node = shutil.which("node")
    if not node:
        return None
    try:
        out = subprocess.run([node, "--version"], capture_output=True, text=True, timeout=20).stdout.strip()
    except (OSError, subprocess.SubprocessError):
        return None
    m = re.match(r"v(\d+)\.(\d+)", out)
    return (int(m.group(1)), int(m.group(2))) if m else None


def engine_command() -> List[str]:
    """The command that runs the AgentCMS engine (raises when Node.js is missing)."""
    custom = os.environ.get("AGENTCMS_CMD", "").strip()
    if custom:
        return shlex.split(custom)
    version = _node_version()
    if version is None:
        raise AgentcmsError(
            "node-missing",
            "Node.js is not installed: the AgentCMS engine runs on Node.js 20.6 or newer.",
            "Install Node.js LTS (https://nodejs.org, or `brew install node` / your package manager), then retry.",
        )
    if version < MIN_NODE:
        raise AgentcmsError(
            "node-too-old",
            f"Node.js {version[0]}.{version[1]} is too old: AgentCMS needs 20.6 or newer (22+ for screenshots).",
            "Update Node.js (https://nodejs.org), then retry.",
        )
    npx = shutil.which("npx")
    if not npx:
        raise AgentcmsError("npx-missing", "npx was not found next to Node.js.", "Reinstall Node.js with npm included.")
    pinned = VERSION if not VERSION.startswith("__") else "latest"
    return [npx, "-y", f"{PACKAGE}@{pinned}"]


# Commands that read a secret from the user at a hidden prompt: they need
# the terminal, never JSON capture.
def _interactive(args: Sequence[str]) -> bool:
    if len(args) >= 2 and args[0] == "credentials" and args[1] == "set":
        return not any(a.startswith("--from-") for a in args)
    return False


def run_raw(*args: str, site: Optional[str] = None, timeout: Optional[float] = None, echo_progress: bool = False) -> Dict[str, Any]:
    """Runs a command and returns the CLI's whole JSON object ({"ok": …})."""
    argv = [str(a) for a in args]
    if site and "--site" not in argv:
        argv += ["--site", site]
    if "--json" not in argv:
        argv.append("--json")
    cmd = engine_command() + argv
    try:
        proc = subprocess.run(
            cmd,
            stdout=subprocess.PIPE,
            stderr=None if echo_progress else subprocess.PIPE,
            text=True,
            timeout=timeout,
            # Never let a stray prompt wait forever on a captured run.
            stdin=subprocess.DEVNULL,
        )
    except subprocess.TimeoutExpired as exc:
        raise AgentcmsError("timeout", f"`agentcms {' '.join(argv[:2])}` took longer than {timeout}s.", "Retry with a longer timeout.") from exc
    except FileNotFoundError as exc:
        raise AgentcmsError("engine-missing", f"Could not start {cmd[0]}.", "Check Node.js / $AGENTCMS_CMD.") from exc
    lines = [l for l in proc.stdout.splitlines() if l.strip()]
    for line in reversed(lines):
        try:
            value = json.loads(line)
        except json.JSONDecodeError:
            continue
        if isinstance(value, dict) and "ok" in value:
            value.setdefault("exitCode", proc.returncode)
            return value
    stderr = (proc.stderr or "").strip().splitlines()[-5:] if not echo_progress else []
    raise AgentcmsError(
        "no-output",
        f"`agentcms {' '.join(argv[:2])}` printed no JSON result (exit {proc.returncode}).",
        ("Last messages: " + " | ".join(stderr)) if stderr else "Retry once; if it persists, run it in a terminal to see the error.",
        proc.returncode or 1,
    )


def run(*args: str, site: Optional[str] = None, timeout: Optional[float] = None, echo_progress: bool = False) -> Any:
    """Runs a command; returns its `data`, raises AgentcmsError when ok is false."""
    out = run_raw(*args, site=site, timeout=timeout, echo_progress=echo_progress)
    if not out.get("ok"):
        err = out.get("error") or {}
        raise AgentcmsError(err.get("code", "failed"), err.get("message", "Command failed."), err.get("hint"), int(out.get("exitCode") or 1))
    return out.get("data")


def result(data: Any) -> Any:
    """Admin commands wrap their answer as {site, result, log, notices, warnings}: the result."""
    if isinstance(data, dict) and "result" in data and "site" in data:
        return data["result"]
    return data


def needs_confirmation(data: Any) -> bool:
    """True when the command only printed a plan and wrote nothing: re-run it
    with --yes once the user agreed. The JSON marker is `needsConfirmation`
    (on `data`, or on `data.result` for admin commands); the "re-run with
    --yes" sentence is only in the human output, never rely on it."""
    if not isinstance(data, dict):
        return False
    if data.get("needsConfirmation") is True:
        return True
    inner = result(data)
    return inner is not data and isinstance(inner, dict) and inner.get("needsConfirmation") is True


def main(argv: Sequence[str]) -> int:
    args = list(argv)
    if not args or args[0] in ("-h", "--help"):
        print(__doc__.strip())
        return 0
    try:
        if _interactive(args) or args[0] == "serve":
            # Hidden prompts / long-running server: the user's own terminal.
            return subprocess.call(engine_command() + args)
        out = run_raw(*args, echo_progress=True)
    except AgentcmsError as err:
        print(json.dumps(err.as_json(), indent=2, ensure_ascii=False))
        return err.exit_code if err.exit_code else 1
    code = int(out.pop("exitCode", 0) or 0)
    print(json.dumps(out, indent=2, ensure_ascii=False))
    return code if code else (0 if out.get("ok") else 1)


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
