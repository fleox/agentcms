#!/usr/bin/env python3
"""Publish a Markdown file (with front matter) to an AgentCMS site.

    python3 publish_markdown.py article.md --site blog [--draft] [--dry-run]

Front matter (YAML subset: `key: value`, `[a, b]` lists, quoted strings) or a
JSON object between `---` lines:

    ---
    title: Dawn at the base camp          # required
    slug: dawn-base-camp                  # default: from the title
    type: post                            # post (default) | page
    category: Mountains                   # posts: name or slug (created if missing)
    tags: [dawn, snow]                    # names as readers see them
    excerpt: Ten minutes of light.
    hero: ./images/camp.jpg               # local image (uploaded) or a media id
    hero_alt: Yellow tent below the peaks   # in a translation: that language's alt
    hero_caption: Photo: Ana Lind           # optional (e.g. the credit)
    seo_title: …
    seo_description: …
    author: editor@example.com
    created_at: 2026-10-20T08:00:00Z
    published_at: 2026-10-20T08:00:00Z
    translation_of: dawn-base-camp        # this file is a translation…
    lang: fr                              # …in this language (agentcms-multilang)
    ---
    Body in Markdown. Local images ![alt](./images/x.jpg) are uploaded and
    replaced by their published URL.

What it does, with the CLI's own commands (one commit per step on git sites):
1. uploads every local image (hero + body) in ONE `media upload --data`
   (images already in the media library under the same file name are
   reused, so re-running the script doesn't duplicate them; --reupload);
2. creates the entry (`content create --create-terms`) or, when the slug
   already exists, updates it (`content update`); a translation goes to
   `content update <ref> --lang <code>`, after its hero_alt / hero_caption
   went to the featured image's texts in that language (`media update --lang`);
3. publishes it unless --draft (`content publish`; an online entry is
   republished by the update itself).

Prints one JSON object: {"ok": true, "data": {"id", "slug", "status", "path",
"uploaded": [...], "action": "created"|"updated"|"translated"}}.
"""

from __future__ import annotations

import argparse
import json
import os
import re
import sys
import tempfile
from typing import Any, Dict, List, Optional, Tuple

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from agentcms import AgentcmsError, result, run  # noqa: E402

IMAGE_EXT = {".jpg", ".jpeg", ".png", ".webp", ".gif"}
MD_IMAGE = re.compile(r"!\[([^\]]*)\]\(\s*([^)\s]+)(\s+\"[^\"]*\")?\s*\)")


def parse_scalar(raw: str) -> Any:
    v = raw.strip()
    if not v:
        return ""
    if v[0] in "\"'" and v[-1] == v[0] and len(v) >= 2:
        return v[1:-1].replace('\\"', '"') if v[0] == '"' else v[1:-1]
    if v.startswith("[") and v.endswith("]"):
        inner = v[1:-1].strip()
        return [parse_scalar(x) for x in split_list(inner)] if inner else []
    if v.lower() in ("true", "false"):
        return v.lower() == "true"
    if v.lower() in ("null", "~"):
        return None
    if re.fullmatch(r"-?\d+", v):
        return int(v)
    return v


def split_list(inner: str) -> List[str]:
    out, cur, quote = [], "", ""
    for ch in inner:
        if quote:
            cur += ch
            if ch == quote:
                quote = ""
        elif ch in "\"'":
            quote = ch
            cur += ch
        elif ch == ",":
            out.append(cur)
            cur = ""
        else:
            cur += ch
    out.append(cur)
    return [x.strip() for x in out if x.strip()]


def strip_comment(line: str) -> str:
    # `key: value  # comment` (not inside quotes).
    quote = ""
    for i, ch in enumerate(line):
        if quote:
            if ch == quote:
                quote = ""
        elif ch in "\"'":
            quote = ch
        elif ch == "#" and (i == 0 or line[i - 1].isspace()):
            return line[:i].rstrip()
    return line


def parse_front_matter(text: str) -> Tuple[Dict[str, Any], str]:
    """(fields, body). No front matter → ({}, text)."""
    if not text.startswith("---"):
        return {}, text
    lines = text.splitlines()
    try:
        end = next(i for i in range(1, len(lines)) if lines[i].strip() == "---")
    except StopIteration:
        raise ValueError("Front matter starts with --- but never ends.")
    block = "\n".join(lines[1:end]).strip()
    body = "".join(text.splitlines(keepends=True)[end + 1 :]).lstrip("\n")
    if block.startswith("{"):
        return json.loads(block), body
    fields: Dict[str, Any] = {}
    key: Optional[str] = None
    for raw in lines[1:end]:
        line = strip_comment(raw)
        if not line.strip():
            continue
        m = re.match(r"^([A-Za-z_][\w-]*)\s*:\s*(.*)$", line)
        if m and not raw.startswith((" ", "\t")):
            key = m.group(1).replace("-", "_")
            fields[key] = parse_scalar(m.group(2)) if m.group(2).strip() else []
        elif key and line.strip().startswith("- "):
            if not isinstance(fields.get(key), list):
                fields[key] = []
            fields[key].append(parse_scalar(line.strip()[2:]))
        else:
            raise ValueError(f"Unsupported front matter line: {raw!r} (use `key: value`, or a JSON object).")
    return fields, body


def local_image(path: str, base: str) -> Optional[str]:
    if re.match(r"^[a-z][a-z0-9+.-]*:", path, re.I) or path.startswith("/"):
        return None
    full = os.path.normpath(os.path.join(base, path))
    return full if os.path.isfile(full) and os.path.splitext(full)[1].lower() in IMAGE_EXT else None


def best_url(media: Dict[str, Any]) -> str:
    formats = media.get("formats") or {}
    for name in ("large", "wide", "hero", "medium"):
        f = formats.get(name)
        if f and not f.get("adminOnly"):
            return f["url"]
    return media.get("url") or ""


def find_entry(site: str, slug: str, kind: str) -> Optional[Dict[str, Any]]:
    try:
        return result(run("content", "get", slug, "--type", kind, site=site))
    except AgentcmsError as err:
        if err.code in ("not-found", "unknown-entry"):
            return None
        raise


def publish(path: str, site: str, draft: bool = False, dry_run: bool = False, reupload: bool = False) -> Dict[str, Any]:
    with open(path, encoding="utf-8") as fh:
        fm, body = parse_front_matter(fh.read())
    base = os.path.dirname(os.path.abspath(path))
    title = str(fm.get("title") or "").strip()
    if not title:
        raise AgentcmsError("usage", f"{path}: the front matter needs a title.", None, 2)
    kind = str(fm.get("type") or "post")
    lang = fm.get("lang")
    translation_of = fm.get("translation_of")

    # 1. Local images → one upload.
    uploads: List[Dict[str, str]] = []
    hero = fm.get("hero")
    hero_path = local_image(str(hero), base) if hero else None
    if hero_path:
        u = {"file": hero_path, "alt": str(fm.get("hero_alt") or title)}
        if fm.get("hero_caption"):
            u["caption"] = str(fm["hero_caption"])
        uploads.append(u)
    body_images = {}
    for m in MD_IMAGE.finditer(body):
        p = local_image(m.group(2), base)
        if p and p not in body_images and p != hero_path:
            body_images[p] = m.group(1)
            uploads.append({"file": p, "alt": m.group(1) or title})
    by_file: Dict[str, Dict[str, Any]] = {}
    # Re-running on the same file must not upload its images again: reuse a
    # media of the same file name (the media library keeps the original
    # name), unless --reupload.
    if uploads and not reupload:
        library = result(run("media", "list", site=site)) or []
        by_name: Dict[str, Dict[str, Any]] = {}
        for m in library:
            by_name.setdefault(m.get("name", ""), m)
        for u in list(uploads):
            known = by_name.get(os.path.basename(u["file"]))
            if known:
                by_file[u["file"]] = {**known, "ok": True, "reused": True}
                uploads.remove(u)
    plan = {"entry": {"title": title, "type": kind, "lang": lang, "translation_of": translation_of}, "uploads": [u["file"] for u in uploads], "reused": [f for f, r in by_file.items() if r.get("reused")]}
    if dry_run:
        return {"dryRun": True, **plan}
    if uploads:
        with tempfile.NamedTemporaryFile("w", suffix=".json", delete=False, encoding="utf-8") as tmp:
            json.dump(uploads, tmp)
        try:
            rows = result(run("media", "upload", "--data", f"@{tmp.name}", site=site))
        finally:
            os.unlink(tmp.name)
        for u, row in zip(uploads, rows):
            if not row.get("ok"):
                raise AgentcmsError("upload-failed", f"{u['file']}: {row.get('error')}", None)
            by_file[u["file"]] = row
    for p, row in by_file.items():
        if p in body_images:
            url = best_url(row)
            body = MD_IMAGE.sub(lambda m: f"![{m.group(1)}]({url}{m.group(3) or ''})" if local_image(m.group(2), base) == p else m.group(0), body)
    hero_id = by_file[hero_path]["id"] if hero_path else (str(hero) if hero else None)

    with tempfile.NamedTemporaryFile("w", suffix=".md", delete=False, encoding="utf-8") as tmp:
        tmp.write(body)
    body_arg = f"@{tmp.name}"
    try:
        common: List[str] = ["--title", title, "--body", body_arg]
        for key, flag in (("slug", "--slug"), ("excerpt", "--excerpt"), ("seo_title", "--seo-title"), ("seo_description", "--seo-description")):
            if fm.get(key) not in (None, ""):
                common += [flag, str(fm[key])]

        # 2a. A translation of an existing entry.
        if translation_of:
            if not lang:
                raise AgentcmsError("usage", "translation_of needs lang (the language of this file).", None, 2)
            # The featured image's alt text / caption in this language, set
            # before the update so its republish already shows them.
            if fm.get("hero_alt") or fm.get("hero_caption"):
                entry = result(run("content", "get", str(translation_of), "--type", kind, site=site))
                media_id = (entry or {}).get("heroMediaId")
                if media_id:
                    texts: List[str] = []
                    if fm.get("hero_alt"):
                        texts += ["--alt", str(fm["hero_alt"])]
                    if fm.get("hero_caption"):
                        texts += ["--caption", str(fm["hero_caption"])]
                    run("media", "update", str(media_id), "--lang", str(lang), *texts, site=site)
            out = result(run("content", "update", str(translation_of), "--type", kind, "--lang", str(lang), *common, site=site))
            return {**plan, "action": "translated", "id": out.get("id"), "status": out.get("status"), "localePaths": out.get("localePaths"), "uploaded": [f for f, r in by_file.items() if not r.get("reused")]}

        fields: List[str] = list(common)
        if kind == "post":
            if fm.get("category") not in (None, ""):
                fields += ["--category", str(fm["category"])]
            tags = fm.get("tags")
            if isinstance(tags, str):
                tags = [t.strip() for t in tags.split(",") if t.strip()]
            if tags:
                fields += ["--tags", ",".join(str(t) for t in tags)]
        if hero_id:
            fields += ["--hero", hero_id]
        for key, flag in (("author", "--author"), ("created_at", "--created-at"), ("published_at", "--published-at")):
            if fm.get(key):
                fields += [flag, str(fm[key])]

        # 2b. Create, or update the entry that already has this slug.
        slug = fm.get("slug")
        existing = find_entry(site, str(slug), kind) if slug else None
        if existing:
            out = result(run("content", "update", existing["id"], "--type", kind, *fields, "--create-terms", site=site))
            action, entry_id, status = "updated", existing["id"], out.get("status")
        else:
            out = result(run("content", "create", "--type", kind, *fields, "--create-terms", site=site))
            action, entry_id, status = "created", out.get("id"), out.get("status")

        # 3. Publish (an online entry was republished by the update).
        path_out = out.get("path")
        if not draft and status != "online":
            pub = result(run("content", "publish", entry_id, "--type", kind, site=site))
            first = pub[0] if isinstance(pub, list) and pub else {}
            status, path_out = first.get("status", "online"), first.get("path")
        return {**plan, "action": action, "id": entry_id, "slug": out.get("slug", slug), "status": status, "path": path_out, "createdTerms": out.get("createdTerms", []), "uploaded": [f for f, r in by_file.items() if not r.get("reused")]}
    finally:
        os.unlink(tmp.name)


def main() -> int:
    ap = argparse.ArgumentParser(description="Publish a Markdown file with front matter to an AgentCMS site.")
    ap.add_argument("file")
    ap.add_argument("--site", required=True, help="Site alias (always pass it).")
    ap.add_argument("--draft", action="store_true", help="Save without publishing.")
    ap.add_argument("--dry-run", action="store_true", help="Parse and list what would be uploaded; change nothing.")
    ap.add_argument("--reupload", action="store_true", help="Upload local images even when a media with the same file name exists.")
    a = ap.parse_args()
    try:
        data = publish(a.file, a.site, draft=a.draft, dry_run=a.dry_run, reupload=a.reupload)
    except (AgentcmsError, ValueError, OSError) as err:
        e = err if isinstance(err, AgentcmsError) else AgentcmsError("usage", str(err), None, 2)
        print(json.dumps(e.as_json(), indent=2, ensure_ascii=False))
        return e.exit_code or 1
    print(json.dumps({"ok": True, "data": data}, indent=2, ensure_ascii=False))
    return 0


if __name__ == "__main__":
    sys.exit(main())
