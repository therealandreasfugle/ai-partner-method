#!/usr/bin/env python3
"""
routing_traps.py

Regression tests for the trade routing table.

    python3 tools/routing_traps.py

TRADE_PATTERNS is an ordered list where the first match wins, which makes it
quietly fragile: adding one word high up can silently steal every business that
mentions it. Each case below is a trap that was actually hit, or that the
ordering is deliberately arranged to avoid. They cost nothing to run and they
catch the failure that is otherwise invisible until a lawn care company gets a
photo of a courtroom.

The same list lives twice, in generator/generate_site.py and in
api-service/api/build.js, so this checks BOTH and that they agree.
"""

import json
import re
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT / "generator"))
import generate_site as G  # noqa: E402

# (what a lead's category says, which photo set it must get, why it is a trap)
TRAPS = [
    ("lawn care service",        "grounds",      '"law" would match "lawn"'),
    ("law firm",                 "professional", "the bounded \\blaw\\b still has to match a real law firm"),
    ("carpet cleaning service",  "cleaning",     '"pet" would match "carpet"'),
    ("pet groomer",              "pet",          "the bounded \\bpet\\b still has to match a real pet business"),
    ("barber shop",              "beauty",       '"\\bbar\\b" for pubs must not catch "barber"'),
    ("sports bar",               "food",         "and a real bar must still reach the food set"),
    ("tree removal service",     "grounds",      '"removal" would send a tree surgeon to the movers'),
    ("laser hair removal",       "beauty",       '"removal" would send a salon to the movers'),
    ("junk removal service",     "removals",     "a real removals firm must still get there"),
    ("dry cleaners",             "laundry",      '"clean" would send a dry cleaner to house cleaning'),
    ("house cleaning service",   "cleaning",     "and a real cleaner must still reach cleaning"),
    ("window cleaning service",  "cleaning",     '"window" would send a cleaner to the glaziers'),
    ("window installation service", "glass",     "and a real glazier must still reach glass"),
    ("pool hall",                "leisure",      '"pool" would send a snooker hall to pool maintenance'),
    ("swimming pool service",    "pool",         "and a real pool company must still reach pool"),
    ("garage door supplier",     "trades",       '"garage" would send a door supplier to the car photos'),
    ("auto repair shop",         "auto",         "and a real garage must still reach auto"),
    ("motorcycle dealer",        "motorcycle",   '"mechanic" under auto would take the bike shops'),
    ("general contractor",       "trades",       "and a real contractor must still reach trades"),
    ("electrician",              "trades",       '"electric" under plumbing would put them in a bathroom'),
    ("washing machine repair",   "repair",       "appliance repair must not need the word appliance"),
    ("dentist",                  "dental",       '"dent" would match "independent", so it needs the word'),
    ("massage therapist",        "wellness",     "shared a photo set with dentists until 2026-08-12, so a dentist got a massage photo"),
    ("pharmacy",                 "health",       "general medical keeps the health set, dental and wellness split off"),
    ("hvac contractor",           "hvac",         "split from plumbing 2026-08-12: it has its own template"),
    ("air conditioning repair",   "hvac",         "must not fall into plumbing"),
    ("boiler repair",             "plumbing",     "boilers stay with plumbing, not hvac"),
    ("dance school",             "arts",         '"dance studio" under fitness would take the dance schools'),
    ("music lesson",             "arts",         "music teaching belongs with the arts, not with tutoring"),
    ("driving school",           "education",    "and driving schools must still reach education"),
    ("bicycle shop",             "retail",       "a bike shop is a shop, not a motorbike dealer"),
    ("scrap metal dealer",       "removals",     '"metal" would send a scrap yard to the fabricators'),
    ("metal fabricator",         "metalwork",    "and a real fabricator must still reach metalwork"),
    ("granite supplier",         "stone",        "worktops belong with stone, not with kitchens"),
    ("kitchen fitter",           "interiors",    "and kitchen fitting belongs with interiors"),
    ("towing service",           "auto",         "a tow truck firm is a vehicle business"),
    ("art gallery",              "arts",         "galleries are arts, not retail"),
    ("funeral home",             "funeral",      "must not fall through to a shop counter"),
    ("dairy farm",               "farm",         "must not fall through to retail"),
    ("boat dealer",              "marine",       "must not fall through to retail"),
    ("taxi service",             "transport",    "must not fall through to retail"),
    ("travel agency",            "travel",       "must not be taken by hospitality"),
    ("roofing contractor",       "roofing",      "the single most common category must never drift"),
]

# The routing reads the business NAME as well as the category, and a name can
# smuggle in a word the category never would. Every one of these was a live bug:
# a general contractor was getting art gallery photos because "contrACTING"
# contains "acting". (category, business name, expected set)
NAME_TRAPS = [
    ("General contractor", "Summit General Contracting",  "trades"),
    ("Contractor",         "Ashworth Subcontractors",     "trades"),
    ("Accountant",         "Chartered Accountants Ltd",   "professional"),
    ("Marketing agency",   "Bright Digital Marketing",    "tech"),
    ("Gift shop",          "The Scrapbook Store",         "retail"),
    ("Roofing contractor", "Liverpool Roofing",           "roofing"),
    ("Cleaning service",   "Clean Cut Lawn Care",         "grounds"),
    ("Plumber",            "Independent Plumbing",        "plumbing"),
    ("Horse trainer",      "Okanagan Equestrian Centre",  "farm"),
    ("Builder",            "Precision Construction",      "trades"),
]


def cases():
    """Every case as (category, business name, expected set, why)."""
    for category, expected, why in TRAPS:
        yield category, "", expected, why
    for category, name, expected in NAME_TRAPS:
        yield category, name, expected, "the business name must not smuggle in a word"


def check_python():
    failures = []
    for category, name, expected, why in cases():
        got = G.pick_trade_set(category, name)
        if got != expected:
            label = f"{category} / {name}" if name else category
            failures.append(f"  {label:<48} -> {got:<12} expected {expected}   ({why})")
    return failures


def check_javascript():
    """Runs the SAME cases through build.js so the two lists cannot drift apart."""
    script = r"""
const fs = require("fs");
const src = fs.readFileSync(process.argv[1], "utf8");
const block = src.match(/const TRADE_PATTERNS = \[([\s\S]*?)\n\];/);
const patterns = eval("[" + block[1] + "]");
const fallback = (src.match(/const FALLBACK_TRADE_SET = "([a-z]+)"/) || [])[1] || "local";
const cases = JSON.parse(process.argv[2]);
const out = [];
for (const [category, name, expected] of cases) {
  const text = (String(category) + " " + String(name)).toLowerCase();
  let got = fallback;
  for (const [key, pattern] of patterns) if (pattern.test(text)) { got = key; break; }
  if (got !== expected) out.push(`  ${category} ${name} -> ${got} expected ${expected}`);
}
console.log(JSON.stringify(out));
"""
    result = subprocess.run(
        ["node", "-e", script, str(ROOT / "api-service" / "api" / "build.js"),
         json.dumps([[c, n, e] for c, n, e, _ in cases()])],
        capture_output=True, text=True,
    )
    if result.returncode != 0:
        return ["  could not run build.js: " + result.stderr.strip()[:200]]
    return json.loads(result.stdout)


def main():
    py_failures = check_python()
    js_failures = check_javascript()

    total = len(list(cases()))
    print(f"{total - len(py_failures)}/{total} pass in generate_site.py")
    for line in py_failures:
        print(line)
    print(f"{total - len(js_failures)}/{total} pass in build.js")
    for line in js_failures:
        print(line)

    if py_failures or js_failures:
        print("\nThe two pattern lists must stay identical. Change both together.")
        return 1
    print("\nboth lists agree, no trap is open")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
