#!/usr/bin/env python3
"""
local_server.py

Runs the whole flow on one machine so it can be demonstrated end to end without
deploying anything. Nothing here touches the internet except the free LLM calls.

    python3 tools/local_server.py            then open http://localhost:4400

Routes:
    GET  /                     the pitch page with its mini form
    POST /api/build            runs the generator, composes the email, returns {url}
    GET  /site/...             the preview app (built bundle)
    GET  /site/configs/...     generated configs, served from public/ so a new
    GET  /site/sites/...       site appears with no rebuild
    GET  /out/...              composed email previews

The configs and per-client assets are served straight from preview-app/public
rather than dist, which is what lets a site generated ten seconds ago load
immediately. Everything else comes from the built bundle.
"""

import json
import sys
import threading
import traceback
from http.server import ThreadingHTTPServer, SimpleHTTPRequestHandler
from pathlib import Path
from urllib.parse import urlparse

ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT / "generator"))

from delivery_email import compose, send  # noqa: E402
from form_schema import validate_answers  # noqa: E402
import generate_site  # noqa: E402

PORT = 4400        # pitch page and the build endpoint
SITE_PORT = 4500   # the preview app, served at ITS OWN root
PITCH = ROOT / "pitch-page"
DIST = ROOT / "preview-app" / "dist"
PUBLIC = ROOT / "preview-app" / "public"
OUT = ROOT / "out"

# The preview app is a Vite build with absolute asset paths (/assets/...), so it
# only works when served from a root. Giving it its own port keeps that true and
# mirrors how it would be deployed: two separate projects, each at a domain root.

# One build at a time. Two concurrent generations would race on the shared
# assets directory for the same slug.
BUILD_LOCK = threading.Lock()


class Handler(SimpleHTTPRequestHandler):
    def log_message(self, fmt, *args):
        sys.stderr.write("  %s\n" % (fmt % args))

    def translate_path(self, path):
        clean = urlparse(path).path
        if clean.startswith("/out/"):
            return str(OUT / clean[len("/out/"):])
        rest = clean.lstrip("/")
        return str(PITCH / (rest or "index.html"))

    def _json(self, status, payload):
        body = json.dumps(payload).encode()
        self.send_response(status)
        self.send_header("Content-Type", "application/json")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def do_POST(self):
        if urlparse(self.path).path != "/api/build":
            return self._json(404, {"error": "unknown endpoint"})

        try:
            length = int(self.headers.get("Content-Length") or 0)
            answers = json.loads(self.rfile.read(length) or b"{}")
        except (ValueError, json.JSONDecodeError):
            return self._json(400, {"error": "could not read the form"})

        problems = validate_answers(answers)
        if problems:
            return self._json(400, {"error": "; ".join(problems)})

        with BUILD_LOCK:
            try:
                result = build(answers)
            except SystemExit as stop:
                return self._json(502, {"error": str(stop) or "the build was rejected"})
            except Exception:
                traceback.print_exc()
                return self._json(500, {"error": "the build failed, nothing was sent"})

        return self._json(200, result)


class SiteHandler(SimpleHTTPRequestHandler):
    """Serves the built preview app at a root, with live configs and photos."""

    def log_message(self, fmt, *args):
        pass

    def end_headers(self):
        # The proposal page is served from a different port (and would be a
        # different domain once hosted), so it needs permission to read the
        # client config. These files are public static JSON either way.
        self.send_header("Access-Control-Allow-Origin", "*")
        super().end_headers()

    def translate_path(self, path):
        clean = urlparse(path).path
        # Generated configs and per-client photos come from public/, not dist/,
        # so a site generated seconds ago serves without rebuilding the bundle.
        for prefix in ("/configs/", "/sites/", "/trades/"):
            if clean.startswith(prefix):
                return str(PUBLIC / clean.lstrip("/"))
        rest = clean.lstrip("/")
        candidate = DIST / rest
        # Single page app: unknown paths are client routes, not missing files.
        if not rest or not candidate.is_file():
            return str(DIST / "index.html")
        return str(candidate)


def build(answers):
    """Generate, validate, stage assets, compose the email. Never sends."""
    # Strip the legal suffix before generation so the copy never says "Ltd".
    generate_site.normalise_answers(answers)
    trade_set = generate_site.pick_trade_set(answers["trade"], answers.get("business_name"))
    print(f"\nbuilding {answers['business_name']} ({answers['trade']}) -> {trade_set}")

    from concurrent.futures import ThreadPoolExecutor
    with ThreadPoolExecutor(max_workers=2) as pool:
        core_future = pool.submit(generate_site.generate_json,
                                  generate_site.build_prompt(answers, trade_set))
        sections_future = pool.submit(generate_site.generate_json,
                                      generate_site.build_sections_prompt(answers))
        core, core_model = core_future.result()
        sections, sections_model = sections_future.result()

    generated = generate_site.deep_merge(
        generate_site.scrub_banned(core), generate_site.scrub_banned(sections)
    )
    config, slug, trade_set = generate_site.compose_config(answers, generated, trade_set)
    config = generate_site.deleak(config, {
        "{{COMPANY}}": config["company"]["name"],
        "{{SHORTNAME}}": config["company"].get("shortName", config["company"]["name"]),
        "{{REGION}}": config["company"].get("serviceRegion", answers["town"]),
        "{{TOWN}}": answers["town"],
        "{{PHONE}}": answers["phone"],
        "{{DOMAIN}}": f"{slug}.example",
    })

    problems = generate_site.check_output(config, answers)
    if problems:
        raise SystemExit("generated site rejected: " + "; ".join(problems))

    generate_site.CONFIGS.mkdir(parents=True, exist_ok=True)
    generate_site.SITES.mkdir(parents=True, exist_ok=True)
    generate_site.stage_assets(slug, trade_set, config["company"]["name"], config["palette"])

    site_url = f"http://localhost:{SITE_PORT}/?site={slug}"
    proposal_url = f"http://localhost:{PORT}/proposal.html?site={slug}"

    config["_generated"] = {"model": f"{core_model} + {sections_model}", "lane": "free-api"}
    # Drives the "this is a demo" banner on the generated site and points it at
    # the proposal, so the lead always has a route to what the real build adds.
    config["_demo"] = {"proposalUrl": proposal_url}
    generate_site.add_display_fields(config, answers)
    (generate_site.CONFIGS / f"{slug}.json").write_text(
        json.dumps(config, indent=2, ensure_ascii=False)
    )
    message = compose(answers, site_url, proposal_url)
    delivery = send(message, answers["email"])

    print(f"  site ready:     {site_url}")
    print(f"  email composed: {message['preview_path']}")
    print(f"  email sending:  {delivery['reason']}")

    return {"url": site_url, "slug": slug, "email_preview":
            f"http://localhost:{PORT}/out/{Path(message['preview_path']).name}"}


def main():
    if not (DIST / "index.html").is_file():
        raise SystemExit(f"build the preview app first: cd preview-app && npm run build")
    site_server = ThreadingHTTPServer(("127.0.0.1", SITE_PORT), SiteHandler)
    threading.Thread(target=site_server.serve_forever, daemon=True).start()
    server = ThreadingHTTPServer(("127.0.0.1", PORT), Handler)
    print(f"pitch page   http://localhost:{PORT}/")
    print(f"preview app  http://localhost:{SITE_PORT}/?site=<slug>")
    print("nothing is deployed and no email is sent. ctrl-c to stop.\n")
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\nstopped")


if __name__ == "__main__":
    main()
