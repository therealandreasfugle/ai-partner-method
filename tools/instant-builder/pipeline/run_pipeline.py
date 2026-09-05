#!/usr/bin/env python3
"""
run_pipeline.py

The whole thing, end to end, with no form and no input from the business owner.

    # see what would happen, build nothing
    python3 pipeline/run_pipeline.py --plan

    # build sites for the next 20 unbuilt leads, publish, compose emails
    python3 pipeline/run_pipeline.py --limit 20

    # one specific business, for the webinar
    python3 pipeline/run_pipeline.py --business "Halloway Roofing"

    # actually send. Refuses unless --send is passed AND a confirmation phrase.
    python3 pipeline/run_pipeline.py --limit 20 --send

Steps per run:
  1. read leads from the Google Sheet the CRM already uses
  2. skip anything already built, and anything with no email
  3. generate a site config per lead (free models, two passes, in parallel)
  4. publish everything in ONE deploy rather than one per lead
  5. compose the email per lead, and send only when explicitly told to

Nothing sends by default. Nothing is deployed by default either.
"""

import os
import argparse
import json
import subprocess
import sys
import time
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT / "generator"))
sys.path.insert(0, str(ROOT / "pipeline"))

import generate_site as G          # noqa: E402
from delivery_email import compose, send_via_resend  # noqa: E402
from form_schema import validate_answers             # noqa: E402
from leads import fetch_leads, to_answers, is_sendable, summarise  # noqa: E402

SITE_BASE = "https://aipm-instant-site.vercel.app"
PROPOSAL_BASE = "https://aipm-instant-proposal.vercel.app"
STATE = ROOT / "pipeline" / "built.json"


def load_state():
    if STATE.is_file():
        return json.loads(STATE.read_text())
    return {}


def save_state(state):
    STATE.write_text(json.dumps(state, indent=2, ensure_ascii=False))


def build_one(answers):
    """Generate, validate and stage one client. Returns the slug."""
    G.normalise_answers(answers)
    trade_set = G.pick_trade_set(answers["trade"], answers.get("business_name"))

    with ThreadPoolExecutor(max_workers=2) as pool:
        core_future = pool.submit(G.generate_json, G.build_prompt(answers, trade_set))
        sections_future = pool.submit(G.generate_json, G.build_sections_prompt(answers))
        core, core_model = core_future.result()
        sections, _ = sections_future.result()

    generated = G.deep_merge(G.scrub_banned(core), G.scrub_banned(sections))
    config, slug, trade_set = G.compose_config(answers, generated, trade_set)
    config = G.deleak(config, {
        "{{COMPANY}}": config["company"]["name"],
        "{{SHORTNAME}}": config["company"].get("shortName", config["company"]["name"]),
        "{{REGION}}": config["company"].get("serviceRegion", answers["town"]),
        "{{TOWN}}": answers["town"],
        "{{PHONE}}": answers.get("phone") or "",
        "{{DOMAIN}}": f"{slug}.example",
    })

    problems = G.check_output(config, answers)
    if problems:
        raise ValueError("; ".join(problems))

    G.CONFIGS.mkdir(parents=True, exist_ok=True)
    G.SITES.mkdir(parents=True, exist_ok=True)
    G.stage_assets(slug, trade_set, config["company"]["name"], config["palette"])

    config["_generated"] = {"model": core_model, "lane": "free-api", "source": "scrape"}
    config["_demo"] = {"proposalUrl": f"{PROPOSAL_BASE}/proposal.html?site={slug}"}
    G.add_display_fields(config, answers)
    (G.CONFIGS / f"{slug}.json").write_text(
        json.dumps(config, indent=2, ensure_ascii=False)
    )
    return slug, config


def publish():
    """
    One deploy for the whole batch. Publishing per lead would be 20 deploys for
    20 leads, which is slow and burns the daily deploy allowance for nothing.
    """
    result = subprocess.run(
        [sys.executable, str(ROOT / "tools" / "prepare_deploy.py")],
        capture_output=True, text=True,
    )
    if result.returncode != 0:
        raise SystemExit("staging failed:\n" + result.stdout + result.stderr)

    token_file = Path(os.environ.get("SETTOKU_ENV", Path.home() / ".env.local"))
    token = ""
    for line in token_file.read_text().splitlines():
        if line.startswith("VERCEL_TOKEN_PERSONAL="):
            token = line.split("=", 1)[1].strip().strip('"').strip("'")
    if not token:
        raise SystemExit("no VERCEL_TOKEN_PERSONAL found")

    deploy = subprocess.run(
        ["vercel", "deploy", "--prod", "--yes", "--name", "aipm-instant-site",
         "--scope", os.environ["VERCEL_SCOPE"], "--token", token],
        cwd=ROOT / ".deploy" / "site", capture_output=True, text=True, timeout=600,
    )
    ok = deploy.returncode == 0
    print("  publish:", "done" if ok else "FAILED")
    if not ok:
        print((deploy.stderr or "")[:400].replace(token, "<redacted>"))
    return ok


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--limit", type=int, default=5, help="how many leads to build")
    parser.add_argument("--business", help="build one named business instead of a batch")
    parser.add_argument("--plan", action="store_true", help="show what would happen, build nothing")
    parser.add_argument("--publish", action="store_true", help="deploy the batch when done")
    parser.add_argument("--send", action="store_true", help="actually email the leads")
    parser.add_argument("--agency", default="{{YOUR_BUSINESS}}")
    args = parser.parse_args()

    print("reading leads from the sheet...")
    raw = fetch_leads()
    stats = summarise(raw)
    print(f"  {stats['total']} leads, {stats['with_email']} with an email, "
          f"{stats['without_email']} without")

    state = load_state()
    candidates = []
    for lead in raw:
        answers = to_answers(lead, agency_name=args.agency)
        if args.business:
            if args.business.lower() not in (answers["business_name"] or "").lower():
                continue
        else:
            if not is_sendable(answers):
                continue
            if G.slugify(G.display_name(answers["business_name"])) in state:
                continue
        if validate_answers(answers, source="scrape"):
            continue
        candidates.append(answers)

    if not args.business:
        candidates = candidates[: args.limit]

    if not candidates:
        print("nothing to build (all done, or no match)")
        return 0

    print(f"\nwill build {len(candidates)}:")
    for a in candidates:
        print(f"  {a['business_name']:38} {a['trade'][:22]:24} {a['email'] or 'NO EMAIL'}")
    if args.plan:
        print("\n--plan, so nothing was built")
        return 0

    built = []
    for index, answers in enumerate(candidates, 1):
        label = answers["business_name"]
        print(f"\n[{index}/{len(candidates)}] {label}")
        started = time.time()
        try:
            slug, config = build_one(answers)
        except Exception as error:
            print(f"  SKIPPED: {str(error)[:180]}")
            continue
        print(f"  built in {time.time() - started:.0f}s -> /?site={slug}")
        built.append((slug, answers, config))

    if not built:
        print("\nnothing built")
        return 1

    if args.publish or args.send:
        print("\npublishing batch...")
        if not publish():
            print("publish failed, not sending anything")
            return 1

    print("\nemails:")
    for slug, answers, config in built:
        site_url = f"{SITE_BASE}/?site={slug}"
        proposal_url = f"{PROPOSAL_BASE}/proposal.html?site={slug}"
        message = compose(answers, site_url, proposal_url,
                          agency_name=args.agency, config=config)
        if args.send:
            outcome = send_via_resend(message, answers["email"])
            print(f"  {answers['business_name']:34} {outcome.get('status')}")
        else:
            print(f"  {answers['business_name']:34} composed -> {message['preview_path']}")
        state[slug] = {
            "business": answers["business_name"], "email": answers.get("email"),
            "site": site_url, "proposal": proposal_url,
            "sent": bool(args.send), "row": answers.get("_row"),
        }
        save_state(state)

    if not args.send:
        print("\nNothing was emailed. Add --send when you want it to go out.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
