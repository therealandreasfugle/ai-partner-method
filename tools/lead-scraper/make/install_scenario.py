#!/usr/bin/env python3
"""
Set up the Local Lead Finder email drip on YOUR Make.com account, automatically.

You do NOT build anything by hand. This creates the whole scenario for you. All you
do afterwards is connect your Gmail and your Google Sheet (a couple of clicks) and
turn it on.

Before running, put two things in the .env file in the main folder:

    MAKE_API_TOKEN=your_make_api_token     (make/SETUP.md shows where to get it)
    MAKE_ZONE=eu2                          (the bit before .make.com in your browser)

Then run:

    python3 make/install_scenario.py

It prints a link to your new scenario. Open it, connect Gmail + your sheet, fill in
the "Set the details" step, and switch it on. Full walkthrough: make/SETUP.md
"""
import json
import os
import sys
import urllib.request
import urllib.error

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)
BLUEPRINT = os.path.join(HERE, "blueprint.json")
SCENARIO_NAME = "Local Lead Finder - Outreach Engine"
# A browser User-Agent is required or Make's Cloudflare returns "error code: 1010".
UA = ("Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 "
      "(KHTML, like Gecko) Chrome/126.0 Safari/537.36")


def load_env():
    env = {}
    for path in (os.path.join(ROOT, ".env"), os.path.join(HERE, ".env")):
        if os.path.exists(path):
            for line in open(path):
                line = line.strip()
                if line and not line.startswith("#") and "=" in line:
                    k, v = line.split("=", 1)
                    env[k.strip()] = v.strip().strip('"').strip("'")
    # real environment variables win over the file
    for k, v in os.environ.items():
        if k.startswith("MAKE_"):
            env[k] = v
    return env


def die(msg):
    print("\nERROR: " + msg + "\n")
    sys.exit(1)


def main():
    env = load_env()
    token = env.get("MAKE_API_TOKEN")
    zone = env.get("MAKE_ZONE", "").strip().lower().rstrip(".")
    team_override = env.get("MAKE_TEAM_ID")

    if not token:
        die("MAKE_API_TOKEN is not set in your .env. See make/SETUP.md for how to get it.")
    if not zone:
        die("MAKE_ZONE is not set in your .env. It is the part before .make.com in your "
            "browser address bar, for example eu2. See make/SETUP.md.")
    if not os.path.exists(BLUEPRINT):
        die("Cannot find make/blueprint.json next to this script.")

    base = "https://%s.make.com/api/v2" % zone
    hdrs = {"Authorization": "Token %s" % token, "User-Agent": UA,
            "Content-Type": "application/json"}

    def req(method, path, payload=None):
        data = json.dumps(payload).encode() if payload is not None else None
        r = urllib.request.Request(base + path, data=data, method=method, headers=hdrs)
        try:
            with urllib.request.urlopen(r, timeout=45) as resp:
                return resp.status, resp.read().decode()
        except urllib.error.HTTPError as e:
            return e.code, e.read().decode()
        except urllib.error.URLError as e:
            die("Could not reach %s. Check your MAKE_ZONE (eu1, eu2, us1 or us2). (%s)"
                % (base, e))

    # --- find the team to create the scenario in ---------------------------------
    team_id = team_override
    if not team_id:
        s, b = req("GET", "/organizations")
        if s == 401:
            die("Make rejected your token (401). Double-check MAKE_API_TOKEN, and that "
                "MAKE_ZONE matches the account the token is from.")
        if s == 403:
            die("Your token cannot list organizations. Either give it the read scopes, or "
                "find your team id in your Make URL (make.com/NNNNNN/...) and add "
                "MAKE_TEAM_ID=NNNNNN to your .env, then run again.")
        if s != 200:
            die("Could not list organizations (HTTP %s). %s" % (s, b[:200]))
        orgs = json.loads(b).get("organizations", [])
        if not orgs:
            die("No organizations found on this account.")
        org_id = orgs[0]["id"]

        s, b = req("GET", "/teams?organizationId=%s" % org_id)
        if s != 200:
            die("Could not list teams (HTTP %s). %s" % (s, b[:200]))
        teams = json.loads(b).get("teams", [])
        if not teams:
            die("No teams found on this account.")
        if len(teams) > 1:
            print("You have more than one team. Pick one, then add its id to your .env as "
                  "MAKE_TEAM_ID=... and run again:")
            for t in teams:
                print("  %s   %s" % (t["id"], t.get("name")))
            sys.exit(1)
        team_id = teams[0]["id"]

    # --- do not create a duplicate ----------------------------------------------
    s, b = req("GET", "/scenarios?teamId=%s" % team_id)
    if s == 200:
        for sc in json.loads(b).get("scenarios", []):
            if sc.get("name") == SCENARIO_NAME:
                url = "https://%s.make.com/%s/scenarios/%s/edit" % (zone, team_id, sc["id"])
                print("\nYou already have this scenario. Nothing to create.\n  " + url + "\n")
                sys.exit(0)

    # --- create the scenario from the blueprint (no connections yet) -------------
    blueprint = open(BLUEPRINT).read()
    payload = {
        "blueprint": blueprint,
        "scheduling": json.dumps({"type": "indefinitely", "interval": 3600}),
        "teamId": int(team_id),
    }
    s, b = req("POST", "/scenarios", payload)
    if s not in (200, 201):
        j = {}
        try:
            j = json.loads(b)
        except Exception:
            pass
        die("Make could not create the scenario (HTTP %s). %s" % (s, j.get("detail", b[:200])))

    sid = json.loads(b)["scenario"]["id"]
    url = "https://%s.make.com/%s/scenarios/%s/edit" % (zone, team_id, sid)

    print("\nDone. Your email automation is created (it is OFF, nothing sends yet).")
    print("\nOpen it here:\n  " + url)
    print("""
Then, in that screen:
  1. Click an email step and connect your Gmail (sign in once; the rest reuse it).
  2. Click "Watch new leads" and each "Mark Contacted" step, connect your Google
     account, and pick your leads spreadsheet and the "Leads" tab. If it asks which
     row the headings are on, choose Row 2.
  3. Open "Set the details" and enter your demo link, booking link, name, and phone.
  4. Turn the scenario ON (bottom left).

Full walkthrough: make/SETUP.md
""")


if __name__ == "__main__":
    main()
