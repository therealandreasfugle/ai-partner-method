#!/usr/bin/env python3
"""
build_with_claude.py

The CLAUDE CODE lane: builds the same site config as the free-API lane, but
through Claude Code on the Max plan instead of a free gateway model.

    python3 builder-lane/build_with_claude.py --demo
    python3 builder-lane/build_with_claude.py --answers answers.json

This runs `claude -p` headlessly. That uses the Max plan subscription, NOT the
paid Anthropic API key, so it costs nothing per run beyond normal plan usage.
No paid API key is read anywhere in this file.

Everything downstream of the copy is shared with the free lane: the same
compose_config, the same de-leak pass, the same validation, the same photo
staging. Only the words differ, which is what makes the two lanes a fair
comparison rather than two different products.

Output lands at a "-claude" slug so both versions can be opened side by side:
    free lane    /?site=kerrigan-roofing
    Claude lane  /?site=kerrigan-roofing-claude
"""

import os
import argparse
import json
import re
import subprocess
import sys
import time
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT / "generator"))

import generate_site as G  # noqa: E402
from form_schema import validate_answers  # noqa: E402

CLAUDE = "/opt/homebrew/bin/claude"

# Read-only reference. The factory's own copy conventions live here, and letting
# Claude read them is what makes this lane meaningfully better than a cold
# prompt. The repo is never written to.
BUILDER_REPO = Path(os.environ.get("BUILDER_REPO", Path.home() / "aipm-local-website-builder"))


def build_brief(answers, trade_set):
    core = G.build_prompt(answers, trade_set)
    sections = G.build_sections_prompt(answers)
    reference = ""
    if BUILDER_REPO.is_dir():
        reference = f"""
REFERENCE, READ ONLY, DO NOT EDIT ANYTHING:
The website factory this site will be built with lives at
  {BUILDER_REPO}/website-factory
Its per-client config contract is
  website-factory/templates/website-template/src/config/brand-dna.example.js
You may read those files to match house style. Never modify anything on disk.
"""

    return f"""You are writing the complete copy for a local business website.

{reference}

You must return ONE JSON object that merges the two shapes described below.
Return ONLY the JSON. No commentary, no markdown fences, no preamble.

Take real care with the copy. This is being shown to the business owner as a
demonstration of what their website could be, so it has to sound like a person
who understands their trade, not like generated filler. Read what the owner
actually said and let it drive the angle of every section.

=========================== PART ONE ===========================
{core}

=========================== PART TWO ===========================
{sections}

=========================== OUTPUT ===========================
Merge PART ONE and PART TWO into a single JSON object containing every key from
both. The "copy" object must contain the keys from both parts combined.
"""


def extract_json(text):
    """Pulls the JSON object out of whatever the CLI returned."""
    cleaned = text.strip()
    if cleaned.startswith("```"):
        cleaned = re.sub(r"^```[a-zA-Z]*\n", "", cleaned)
        cleaned = re.sub(r"\n```\s*$", "", cleaned)
    try:
        return json.loads(cleaned)
    except json.JSONDecodeError:
        pass
    start, depth = None, 0
    for index, char in enumerate(cleaned):
        if char == "{":
            if depth == 0:
                start = index
            depth += 1
        elif char == "}":
            depth -= 1
            if depth == 0 and start is not None:
                try:
                    return json.loads(cleaned[start:index + 1])
                except json.JSONDecodeError:
                    start = None
    raise ValueError("no JSON object found in the Claude Code response")


def run_claude(brief, model=None, timeout=600):
    command = [CLAUDE, "-p", brief, "--output-format", "json"]
    if model:
        command += ["--model", model]

    started = time.time()
    process = subprocess.run(command, capture_output=True, text=True, timeout=timeout)
    elapsed = time.time() - started

    if process.returncode != 0:
        raise SystemExit(
            f"claude exited {process.returncode}\n{(process.stderr or '')[:600]}"
        )

    raw = process.stdout.strip()
    # --output-format json wraps the answer in an envelope; older versions print
    # the text directly, so handle both rather than assuming.
    try:
        envelope = json.loads(raw)
        text = envelope.get("result") or envelope.get("text") or raw
        if isinstance(text, dict):
            return text, elapsed
    except json.JSONDecodeError:
        text = raw
    return extract_json(text), elapsed


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--answers", type=Path)
    parser.add_argument("--demo", action="store_true")
    parser.add_argument("--model", help="override the model, e.g. sonnet")
    parser.add_argument("--suffix", default="-claude", help="slug suffix for this lane")
    args = parser.parse_args()

    if args.demo:
        answers = dict(G.DEMO_ANSWERS)
    elif args.answers:
        answers = json.loads(args.answers.read_text())
    else:
        parser.error("pass --answers <file> or --demo")

    problems = validate_answers(answers)
    if problems:
        raise SystemExit("form answers rejected:\n  " + "\n  ".join(problems))

    trade_set = G.pick_trade_set(answers["trade"])
    print(f"building '{answers['business_name']}' via Claude Code (Max plan)")
    print(f"  photo set: {trade_set}")

    generated, elapsed = run_claude(build_brief(answers, trade_set), args.model)
    print(f"  claude returned in {elapsed:.1f}s")

    generated = G.scrub_banned(generated)
    config, slug, trade_set = G.compose_config(answers, generated, trade_set)
    slug = f"{slug}{args.suffix}"
    config["assets"] = {"base": f"/sites/{slug}"}

    config = G.deleak(config, {
        "{{COMPANY}}": config["company"]["name"],
        "{{SHORTNAME}}": config["company"].get("shortName", config["company"]["name"]),
        "{{REGION}}": config["company"].get("serviceRegion", answers["town"]),
        "{{TOWN}}": answers["town"],
        "{{PHONE}}": answers["phone"],
        "{{DOMAIN}}": f"{slug}.example",
    })

    problems = G.check_output(config, answers)
    if problems:
        print("\nCLAUDE CODE OUTPUT REJECTED:")
        for problem in problems:
            print("  -", problem)
        raise SystemExit(1)

    G.CONFIGS.mkdir(parents=True, exist_ok=True)
    G.SITES.mkdir(parents=True, exist_ok=True)
    G.stage_assets(slug, trade_set, config["company"]["name"], config["palette"])

    config["_generated"] = {"lane": "claude-code", "model": args.model or "session default",
                            "seconds": round(elapsed, 1)}
    (G.CONFIGS / f"{slug}.json").write_text(json.dumps(config, indent=2, ensure_ascii=False))

    print(f"\nconfig written: {G.CONFIGS / (slug + '.json')}")
    print(f"compare:        /?site={slug.removesuffix(args.suffix)}   (free lane)")
    print(f"                /?site={slug}   (Claude Code lane)")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
