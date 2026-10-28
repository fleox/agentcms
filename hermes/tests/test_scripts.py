"""Tests of the Hermes Python helpers against a fake agentcms engine.

    python3 -m unittest discover -s hermes/tests
"""

import json
import os
import sys
import tempfile
import unittest

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(HERE, "..", "python"))

import agentcms  # noqa: E402
import publish_markdown  # noqa: E402
import upload_media  # noqa: E402
import update_sites  # noqa: E402


def ok(data):
    return {"ok": True, "data": data}


def admin(result):
    return ok({"site": "blog", "result": result, "log": [], "notices": [], "warnings": []})


class FakeEngine(unittest.TestCase):
    def setUp(self):
        self.dir = tempfile.mkdtemp()
        self.log = os.path.join(self.dir, "calls.jsonl")
        self.script = os.path.join(self.dir, "script.json")
        os.environ["AGENTCMS_CMD"] = f'"{sys.executable}" "{os.path.join(HERE, "fake_engine.py")}"'
        os.environ["FAKE_LOG"] = self.log
        os.environ["FAKE_SCRIPT"] = self.script

    def answer(self, *pairs):
        with open(self.script, "w", encoding="utf-8") as fh:
            json.dump([[list(p), r] for p, r in pairs], fh)

    def calls(self):
        if not os.path.exists(self.log):
            return []
        with open(self.log, encoding="utf-8") as fh:
            return [json.loads(l) for l in fh if l.strip()]

    def commands(self):
        return [c for c in self.calls() if isinstance(c, list)]


class WrapperTest(FakeEngine):
    def test_run_returns_data_and_adds_json_and_site(self):
        self.answer((["content", "list"], admin([{"id": "a"}])))
        data = agentcms.run("content", "list", site="blog")
        self.assertEqual(agentcms.result(data), [{"id": "a"}])
        self.assertEqual(self.commands()[0], ["content", "list", "--site", "blog", "--json"])

    def test_errors_carry_code_and_hint(self):
        self.answer((["content", "get"], {"ok": False, "error": {"code": "not-found", "message": "No post", "hint": "List them"}, "__exit__": 2}))
        with self.assertRaises(agentcms.AgentcmsError) as ctx:
            agentcms.run("content", "get", "x", site="blog")
        self.assertEqual((ctx.exception.code, ctx.exception.hint, ctx.exception.exit_code), ("not-found", "List them", 2))

    def test_no_json_output(self):
        self.answer((["status"], {"__raw__": "boom", "__exit__": 1}))
        with self.assertRaises(agentcms.AgentcmsError) as ctx:
            agentcms.run("status")
        self.assertEqual(ctx.exception.code, "no-output")

    def test_node_missing_is_explained(self):
        del os.environ["AGENTCMS_CMD"]
        path = os.environ.get("PATH", "")
        os.environ["PATH"] = self.dir  # no node here
        try:
            with self.assertRaises(agentcms.AgentcmsError) as ctx:
                agentcms.engine_command()
            self.assertEqual(ctx.exception.code, "node-missing")
            self.assertIn("nodejs.org", ctx.exception.hint)
        finally:
            os.environ["PATH"] = path

    def test_interactive_credentials_are_not_captured(self):
        self.assertTrue(agentcms._interactive(["credentials", "set", "s3:x"]))
        self.assertFalse(agentcms._interactive(["credentials", "set", "s3:x", "--from-env", "A,B"]))


class PublishMarkdownTest(FakeEngine):
    def write(self, name, text):
        path = os.path.join(self.dir, name)
        os.makedirs(os.path.dirname(path), exist_ok=True)
        with open(path, "w", encoding="utf-8") as fh:
            fh.write(text)
        return path

    def test_front_matter(self):
        fm, body = publish_markdown.parse_front_matter('---\ntitle: "Hello: world"  # comment\ntags: [a, "b, c"]\nlist:\n  - x\n  - y\ndraft: false\n---\nBody\n')
        self.assertEqual(fm, {"title": "Hello: world", "tags": ["a", "b, c"], "list": ["x", "y"], "draft": False})
        self.assertEqual(body, "Body\n")
        self.assertEqual(publish_markdown.parse_front_matter('---\n{"title": "J"}\n---\nB')[0], {"title": "J"})

    def test_creates_uploads_images_rewrites_body_and_publishes(self):
        self.write("img/hero.jpg", "x")
        self.write("img/inline.png", "x")
        md = self.write("post.md", "---\ntitle: Dawn\nslug: dawn\ncategory: Mountains\ntags: [snow, dawn]\nhero: ./img/hero.jpg\nhero_alt: A tent\n---\nText ![The view](img/inline.png) end.\n")
        self.answer(
            (["content", "get"], {"ok": False, "error": {"code": "not-found", "message": "none"}, "__exit__": 2}),
            (["media", "list"], admin([])),
            (["media", "upload"], admin([
                {"file": "hero", "ok": True, "id": "m1", "url": "https://s/m1/medium.webp", "formats": {"large": {"url": "https://s/m1/large.webp"}}},
                {"file": "inline", "ok": True, "id": "m2", "url": "https://s/m2/medium.webp", "formats": {"large": {"url": "https://s/m2/large.webp"}, "admin-original": {"url": "x", "adminOnly": True}}},
            ])),
            (["content", "create"], admin({"id": "p1", "slug": "dawn", "status": "draft", "createdTerms": [{"name": "Mountains"}]})),
            (["content", "publish"], admin([{"id": "p1", "ok": True, "status": "online", "path": "mountains/dawn.html"}])),
        )
        out = publish_markdown.publish(md, "blog")
        self.assertEqual((out["action"], out["status"], out["path"]), ("created", "online", "mountains/dawn.html"))
        calls = self.calls()
        manifest = next(c["manifest"] for c in calls if isinstance(c, dict) and "manifest" in c)
        self.assertEqual([m["alt"] for m in manifest], ["A tent", "The view"])
        body = next(c["body"] for c in calls if isinstance(c, dict) and "body" in c)
        self.assertIn("![The view](https://s/m2/large.webp)", body)
        create = next(c for c in self.commands() if c[:2] == ["content", "create"])
        for flag, value in (("--category", "Mountains"), ("--tags", "snow,dawn"), ("--hero", "m1"), ("--slug", "dawn")):
            self.assertEqual(create[create.index(flag) + 1], value)
        self.assertIn("--create-terms", create)
        # One upload command for both images.
        self.assertEqual(sum(1 for c in self.commands() if c[:2] == ["media", "upload"]), 1)

    def test_reuses_images_already_in_the_library(self):
        self.write("img/hero.jpg", "x")
        md = self.write("r.md", "---\ntitle: Again\nslug: again\nhero: ./img/hero.jpg\n---\nB\n")
        self.answer(
            (["content", "get"], admin({"id": "p9", "slug": "again", "status": "online"})),
            (["media", "list"], admin([{"id": "m1", "name": "hero.jpg", "url": "u", "formats": {}}])),
            (["content", "update"], admin({"id": "p9", "status": "online"})),
        )
        out = publish_markdown.publish(md, "blog")
        self.assertEqual((out["uploaded"], len(out["reused"])), ([], 1))
        self.assertFalse(any(c[:2] == ["media", "upload"] for c in self.commands()))
        update = next(c for c in self.commands() if c[:2] == ["content", "update"])
        self.assertEqual(update[update.index("--hero") + 1], "m1")

    def test_updates_existing_slug_and_skips_publish_when_online(self):
        md = self.write("p.md", "---\ntitle: Dawn 2\nslug: dawn\n---\nNew text\n")
        self.answer(
            (["content", "get"], admin({"id": "p1", "slug": "dawn", "status": "online"})),
            (["content", "update"], admin({"id": "p1", "status": "online", "republished": True, "path": "dawn.html"})),
        )
        out = publish_markdown.publish(md, "blog")
        self.assertEqual(out["action"], "updated")
        self.assertFalse(any(c[:2] == ["content", "publish"] for c in self.commands()))

    def test_translation(self):
        md = self.write("fr.md", "---\ntitle: Aube\nslug: aube\ntranslation_of: dawn\nlang: fr\n---\nTexte\n")
        self.answer((["content", "update"], admin({"id": "p1", "status": "online", "localePaths": {"fr": "fr/aube.html"}})))
        out = publish_markdown.publish(md, "blog")
        self.assertEqual(out["action"], "translated")
        update = self.commands()[0]
        self.assertEqual(update[:3], ["content", "update", "dawn"])
        self.assertEqual(update[update.index("--lang") + 1], "fr")

    def test_requires_title(self):
        md = self.write("x.md", "---\nslug: x\n---\nB")
        with self.assertRaises(agentcms.AgentcmsError):
            publish_markdown.publish(md, "blog")


class UploadAndUpdateTest(FakeEngine):
    def test_upload_reports_missing_alts(self):
        d = os.path.join(self.dir, "imgs")
        os.makedirs(d)
        for n in ("fjord-view.jpg", "dune.png", "notes.txt"):
            open(os.path.join(d, n), "w").close()
        self.answer((["media", "upload"], admin([{"file": "a", "ok": True, "id": "1", "url": "u"}, {"file": "b", "ok": True, "id": "2", "url": "u"}])))
        out = upload_media.upload([d], "blog", {"dune.png": {"alt": "A dune at night", "caption": "Erg Chebbi"}})
        self.assertEqual(out["needsAlt"], ["fjord-view.jpg"])
        manifest = next(c["manifest"] for c in self.calls() if isinstance(c, dict) and "manifest" in c)
        self.assertEqual(manifest[0]["alt"], "A dune at night")
        self.assertEqual(manifest[1]["alt"], "fjord view")

    def test_update_runs_pending_actions_with_one_retry_on_conflict(self):
        self.answer(
            (["deploy-admin"], ok({"results": [{"alias": "blog", "deployed": True, "from": "0.3.1", "to": "0.3.2", "pendingActions": ["deploy-admin", "regenerate-all"]}]})),
            (["regenerate", "everything"], admin({"what": "everything", "seconds": 3})),
            (["doctor"], ok({"healthy": True, "checks": [{"id": "site", "status": "ok"}]})),
        )
        out = update_sites.update(["--site", "blog"], yes=True)
        row = out["results"][0]
        self.assertEqual(row["actions"][-1], {"action": "regenerate-all", "ok": True, "seconds": 3})
        self.assertTrue(row["healthy"])


if __name__ == "__main__":
    unittest.main()
