#!/usr/bin/env python3
"""A stand-in for the agentcms CLI in tests (AGENTCMS_CMD="python3 fake_engine.py").

Appends every call (argv) as one JSON line to $FAKE_LOG and answers from the
JSON file $FAKE_SCRIPT: a list of [args prefix, response] pairs; the first
prefix that matches the call wins. A response is the CLI's JSON object, or
{"__raw__": "text"} to print raw text, plus an optional "__exit__" code.
"""

import json
import os
import sys

args = sys.argv[1:]
with open(os.environ["FAKE_LOG"], "a", encoding="utf-8") as fh:
    fh.write(json.dumps(args) + "\n")
    # Media manifests are temporary files: keep what they said.
    for i, a in enumerate(args):
        if a == "--data" and i + 1 < len(args) and args[i + 1].startswith("@"):
            fh.write(json.dumps({"manifest": json.load(open(args[i + 1][1:], encoding="utf-8"))}) + "\n")
        if a == "--body" and i + 1 < len(args) and args[i + 1].startswith("@"):
            fh.write(json.dumps({"body": open(args[i + 1][1:], encoding="utf-8").read()}) + "\n")
print("progress line", file=sys.stderr)
for prefix, response in json.load(open(os.environ["FAKE_SCRIPT"], encoding="utf-8")):
    if args[: len(prefix)] == prefix:
        code = response.pop("__exit__", 0) if isinstance(response, dict) else 0
        if isinstance(response, dict) and "__raw__" in response:
            print(response["__raw__"])
        else:
            print("some log line")
            print(json.dumps(response))
        sys.exit(code)
print(json.dumps({"ok": False, "error": {"code": "unexpected", "message": f"fake engine: no answer for {args}"}}))
sys.exit(1)
