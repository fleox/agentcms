#!/usr/bin/env python3
"""Health report of one or every registered AgentCMS site, in one call.

    python3 site_report.py [--site blog] [--deep]

Runs `status` (versions, pending updates), then `doctor` (and `stats` for
content counts) per site, and condenses the result:

    {"ok": true, "data": {"tool": {...}, "sites": [{"alias", "siteUrl", "adminVersion",
      "state", "healthy", "problems": [{"id", "status", "message", "fix"}], "counts": {...}}],
      "advice": [...]}}

`problems` holds only failing / warning checks, each with the fix to propose.
"""

from __future__ import annotations

import argparse
import json
import os
import sys
from typing import Any, Dict, List, Optional

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from agentcms import AgentcmsError, result, run  # noqa: E402


def report(site: Optional[str] = None, deep: bool = False) -> Dict[str, Any]:
    status = run("status", *(["--site", site] if site else []))
    sites: List[Dict[str, Any]] = []
    for s in status.get("sites", []):
        row: Dict[str, Any] = {k: s.get(k) for k in ("alias", "siteUrl", "adminUrl", "adminVersion", "state")}
        if s.get("update"):
            row["update"] = s["update"]
        try:
            doc = run("doctor", "--site", s["alias"], *(["--deep"] if deep else []))
            row["healthy"] = doc.get("healthy")
            row["problems"] = [c for c in doc.get("checks", []) if c.get("status") in ("fail", "warn")]
        except AgentcmsError as err:
            row["healthy"] = False
            row["problems"] = [{"id": "doctor", "status": "fail", "message": err.message, "fix": err.hint}]
        try:
            row["counts"] = result(run("stats", site=s["alias"]))
        except AgentcmsError as err:
            row["counts"] = {"error": f"{err.code}: {err.message}"}
        sites.append(row)
    return {"tool": status.get("tool"), "sites": sites, "advice": status.get("advice", []), "releaseNotes": status.get("releaseNotes", {})}


def main() -> int:
    ap = argparse.ArgumentParser(description="Status + doctor + stats for one or every site.")
    ap.add_argument("--site")
    ap.add_argument("--deep", action="store_true", help="Also open the content and test write access.")
    a = ap.parse_args()
    try:
        data = report(a.site, a.deep)
    except AgentcmsError as err:
        print(json.dumps(err.as_json(), indent=2, ensure_ascii=False))
        return err.exit_code or 1
    print(json.dumps({"ok": True, "data": data}, indent=2, ensure_ascii=False))
    return 0 if all(s.get("healthy") for s in data["sites"]) else 1


if __name__ == "__main__":
    sys.exit(main())
