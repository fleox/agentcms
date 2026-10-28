#!/usr/bin/env python3
"""Update hosted admins to this release, then run what the release asks.

    python3 update_sites.py [--site blog | --all]          # plan only
    python3 update_sites.py [--site blog | --all] --yes    # apply

Plan: `status` + `deploy-admin` without --yes (versions, files, breaking
changes, release notes). Show it to the user and get their go first.

Apply: `deploy-admin --yes`, then per site the `pendingActions` the release
lists (regenerate-all → `regenerate everything`, sync-theme-assets →
`regenerate assets`), then `doctor`. A run interrupted by a concurrent
write (`conflict`) is retried once.
"""

from __future__ import annotations

import argparse
import json
import os
import sys
from typing import Any, Dict, List

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from agentcms import AgentcmsError, result, run  # noqa: E402

ACTIONS = {"regenerate-all": ["regenerate", "everything"], "sync-theme-assets": ["regenerate", "assets"]}


def run_retry(*args: str, site: str) -> Any:
    try:
        return run(*args, site=site)
    except AgentcmsError as err:
        if err.code != "conflict":
            raise
        return run(*args, site=site)


def update(target: List[str], yes: bool) -> Dict[str, Any]:
    if not yes:
        plan = run("deploy-admin", *target)
        status = run("status", *([t for t in target if t != "--all"]))
        return {"needsConfirmation": True, "plans": plan.get("plans", []), "releaseNotes": status.get("releaseNotes", {})}
    deployed = run("deploy-admin", *target, "--yes")
    out = []
    for r in deployed.get("results", []):
        alias = r.get("alias")
        row: Dict[str, Any] = {"alias": alias, "deployed": r.get("deployed"), "from": r.get("from"), "to": r.get("to"), "actions": []}
        if r.get("deployed"):
            for action in [a for a in (r.get("pendingActions") or []) if a != "deploy-admin"]:
                cmd = ACTIONS.get(action)
                if not cmd:
                    row["actions"].append({"action": action, "skipped": "unknown action — read the release notes"})
                    continue
                try:
                    res = result(run_retry(*cmd, site=alias))
                    row["actions"].append({"action": action, "ok": True, "seconds": (res or {}).get("seconds")})
                except AgentcmsError as err:
                    row["actions"].append({"action": action, "ok": False, "error": err.code, "message": err.message, "hint": err.hint})
            try:
                doc = run("doctor", "--site", alias)
                row["healthy"] = doc.get("healthy")
                row["problems"] = [c for c in doc.get("checks", []) if c.get("status") in ("fail", "warn")]
            except AgentcmsError as err:
                row["healthy"] = False
                row["problems"] = [{"id": "doctor", "message": err.message}]
        out.append(row)
    return {"results": out}


def main() -> int:
    ap = argparse.ArgumentParser(description="Update hosted admins (plan first, --yes to apply).")
    g = ap.add_mutually_exclusive_group(required=True)
    g.add_argument("--site")
    g.add_argument("--all", action="store_true")
    ap.add_argument("--yes", action="store_true", help="Apply — only after the user agreed to the plan.")
    a = ap.parse_args()
    target = ["--all"] if a.all else ["--site", a.site]
    try:
        data = update(target, a.yes)
    except AgentcmsError as err:
        print(json.dumps(err.as_json(), indent=2, ensure_ascii=False))
        return err.exit_code or 1
    print(json.dumps({"ok": True, "data": data}, indent=2, ensure_ascii=False))
    return 0


if __name__ == "__main__":
    sys.exit(main())
