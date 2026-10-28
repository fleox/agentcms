#!/usr/bin/env python3
"""Upload images to an AgentCMS site's media library in ONE command (one commit).

    python3 upload_media.py photos/ fjord.jpg --site blog --alts alts.json

Each image needs its own alternative text describing what it SHOWS (look at
it first). Give them in a JSON file mapping file name → alt (or → {"alt",
"caption"}); images without one get a placeholder from the file name and are
listed under "needsAlt" so you can fix them with `media update <id> --alt …`.

Prints {"ok": true, "data": {"media": [{"file", "id", "url", "formats"}], "needsAlt": [...]}}.
"""

from __future__ import annotations

import argparse
import json
import os
import sys
import tempfile
from typing import Any, Dict, List

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from agentcms import AgentcmsError, result, run  # noqa: E402

IMAGE_EXT = {".jpg", ".jpeg", ".png", ".webp", ".gif"}


def collect(paths: List[str]) -> List[str]:
    files: List[str] = []
    for p in paths:
        if os.path.isdir(p):
            for name in sorted(os.listdir(p)):
                full = os.path.join(p, name)
                if os.path.isfile(full) and os.path.splitext(name)[1].lower() in IMAGE_EXT:
                    files.append(os.path.abspath(full))
        elif os.path.isfile(p):
            files.append(os.path.abspath(p))
        else:
            raise AgentcmsError("not-found", f"{p} does not exist.", None, 2)
    return files


def upload(paths: List[str], site: str, alts: Dict[str, Any]) -> Dict[str, Any]:
    files = collect(paths)
    if not files:
        raise AgentcmsError("usage", "No image to upload (.jpg, .jpeg, .png, .webp, .gif).", None, 2)
    items, needs_alt = [], []
    for f in files:
        given = alts.get(os.path.basename(f)) or alts.get(f)
        entry: Dict[str, Any] = {"file": f}
        if isinstance(given, dict):
            entry.update({k: v for k, v in given.items() if k in ("alt", "caption")})
        elif isinstance(given, str):
            entry["alt"] = given
        if not entry.get("alt"):
            entry["alt"] = os.path.splitext(os.path.basename(f))[0].replace("-", " ").replace("_", " ")
            needs_alt.append(os.path.basename(f))
        items.append(entry)
    with tempfile.NamedTemporaryFile("w", suffix=".json", delete=False, encoding="utf-8") as tmp:
        json.dump(items, tmp)
    try:
        rows = result(run("media", "upload", "--data", f"@{tmp.name}", site=site))
    finally:
        os.unlink(tmp.name)
    media = [{"file": r.get("file"), "ok": r.get("ok"), "id": r.get("id"), "url": r.get("url"), "formats": r.get("formats"), **({"error": r["error"]} if r.get("error") else {})} for r in rows]
    return {"media": media, "needsAlt": needs_alt}


def main() -> int:
    ap = argparse.ArgumentParser(description="Upload images (files or folders) in one command.")
    ap.add_argument("paths", nargs="+")
    ap.add_argument("--site", required=True)
    ap.add_argument("--alts", help="JSON file: file name → alt text (or {alt, caption}).")
    a = ap.parse_args()
    try:
        alts = json.load(open(a.alts, encoding="utf-8")) if a.alts else {}
        data = upload(a.paths, a.site, alts)
    except (AgentcmsError, ValueError, OSError) as err:
        e = err if isinstance(err, AgentcmsError) else AgentcmsError("usage", str(err), None, 2)
        print(json.dumps(e.as_json(), indent=2, ensure_ascii=False))
        return e.exit_code or 1
    print(json.dumps({"ok": True, "data": data}, indent=2, ensure_ascii=False))
    return 0 if all(m["ok"] for m in data["media"]) else 1


if __name__ == "__main__":
    sys.exit(main())
