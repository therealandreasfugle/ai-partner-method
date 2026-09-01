#!/usr/bin/env python3
"""
prepare_deploy.py

Stages both sites for Vercel with production URLs, leaving the working copies
pointed at localhost so local development keeps working.

    python3 tools/prepare_deploy.py

Writes two folders under .deploy/:
    .deploy/site/       the preview app bundle (built dist + configs + photos)
    .deploy/proposal/   the pitch page and proposal

The two are separate Vercel projects because the preview app is a Vite build
that must be served from a domain root, and they cross-link: the proposal reads
each client's config from the site's domain, and the site's draft banner links
back to the proposal.
"""

import json
import re
import shutil
import subprocess
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
DIST = ROOT / "preview-app" / "dist"
PITCH = ROOT / "pitch-page"
OUT = ROOT / ".deploy"

SITE_URL = "https://aipm-instant-site.vercel.app"
PROPOSAL_URL = "https://aipm-instant-proposal.vercel.app"


def main():
    # Always rebuild. dist/ is what gets deployed, and configs live in public/,
    # so staging without building ships whatever was in dist last time. That
    # silently published a batch missing its new client sites once already.
    build = subprocess.run(["npm", "run", "build"], cwd=ROOT / "preview-app",
                           capture_output=True, text=True)
    if build.returncode != 0:
        raise SystemExit("preview-app build failed:\n" + (build.stderr or build.stdout)[-800:])
    if not (DIST / "index.html").is_file():
        raise SystemExit("build produced no dist/index.html")

    if OUT.exists():
        shutil.rmtree(OUT)
    OUT.mkdir()

    # --- site bundle -------------------------------------------------------
    site = OUT / "site"
    shutil.copytree(DIST, site)
    shutil.copy(ROOT / "preview-app" / "vercel.json", site / "vercel.json")

    # Point every generated config's draft banner at the deployed proposal.
    rewritten = 0
    for config_path in (site / "configs").glob("*.json"):
        config = json.loads(config_path.read_text())
        if "_generated" not in config:
            continue
        config.setdefault("_demo", {})["proposalUrl"] = \
            f"{PROPOSAL_URL}/proposal.html?site={config_path.stem}"
        config_path.write_text(json.dumps(config, indent=2, ensure_ascii=False))
        rewritten += 1

    # --- proposal bundle ---------------------------------------------------
    proposal = OUT / "proposal"
    proposal.mkdir()
    for name in ("index.html", "proposal.html"):
        source = PITCH / name
        if not source.is_file():
            continue
        html = source.read_text()
        # The only environment-specific value in either page.
        html = html.replace('previewOrigin: "http://localhost:4500"',
                            f'previewOrigin: "{SITE_URL}"')
        (proposal / name).write_text(html)

    # The founder section references these by relative path, so a bundle without
    # them ships a broken portrait and four broken avatars.
    assets = PITCH / "agency-assets"
    if assets.is_dir():
        shutil.copytree(assets, proposal / "agency-assets")

    missing = []
    for html_path in proposal.glob("*.html"):
        html = html_path.read_text()
        for ref in set(re.findall(r'["\'(](agency-assets/[^"\')\s]+)', html)):
            if not (proposal / ref).is_file():
                missing.append(ref)
    if missing:
        raise SystemExit("proposal references assets that are not in the bundle: " +
                         ", ".join(sorted(set(missing))))

    remaining = [p.name for p in proposal.glob("*.html")
                 if "localhost" in (p).read_text()]

    print(f"staged {rewritten} client configs -> {PROPOSAL_URL}")
    print(f"site:     {site}")
    print(f"proposal: {proposal}")
    if remaining:
        print(f"NOTE: localhost still referenced in {remaining} "
              f"(the form's build endpoint stays local until the API is deployed)")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
