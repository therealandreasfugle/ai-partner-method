#!/usr/bin/env python3
"""
Local Lead Finder - setup check ("is everything ready?").

Run this once before your first search:

    python3 setup_check.py

It checks your Python, the packages the tool needs, your .env file, and whether
your Apify key actually works. It does NOT run a scrape and does NOT spend any
credit. When every line says OK, you are ready to find leads.

This script uses only the Python standard library on purpose, so it still runs
(and can tell you what to install) before you have installed anything.
"""

import importlib.util
import json
import os
import re
import sys
import urllib.request
import urllib.error

HERE = os.path.dirname(os.path.abspath(__file__))
ENV_PATH = os.path.join(HERE, ".env")
APIFY_ME = "https://api.apify.com/v2/users/me?token="

OK = "[ OK ]"
FIX = "[FIX ]"
INFO = "[info]"


def read_env_file(path):
    """Parse a .env file into a dict. Ignores comments and blank lines. Never
    raises: a missing file just returns an empty dict."""
    values = {}
    if not os.path.isfile(path):
        return values
    with open(path, encoding="utf-8") as fh:
        for line in fh:
            line = line.strip()
            if not line or line.startswith("#") or "=" not in line:
                continue
            k, v = line.split("=", 1)
            values[k.strip()] = v.strip().strip('"').strip("'")
    return values


def gather_tokens(env):
    """Same scheme find_leads.py uses: APIFY_API_TOKENS (list), APIFY_API_TOKEN,
    then APIFY_API_TOKEN_1..20. Reads the .env map first, then real environment
    variables. Drops duplicates and the example placeholder, keeps order."""
    def get(k):
        return (env.get(k) or os.getenv(k) or "").strip()

    found = []
    for part in re.split(r"[,\s]+", get("APIFY_API_TOKENS")):
        if part.strip():
            found.append(part.strip())
    if get("APIFY_API_TOKEN"):
        found.append(get("APIFY_API_TOKEN"))
    for i in range(1, 21):
        if get(f"APIFY_API_TOKEN_{i}"):
            found.append(get(f"APIFY_API_TOKEN_{i}"))

    tokens, seen = [], set()
    for tok in found:
        if tok and tok not in seen and "xxxx" not in tok.lower():
            seen.add(tok)
            tokens.append(tok)
    return tokens


def has_placeholder(env):
    """True if a token line is still the example 'apify_api_xxxx...' value."""
    for k, v in env.items():
        if k.startswith("APIFY_API_TOKEN") and "xxxx" in v.lower():
            return True
    return False


def validate_token(token):
    """Ask Apify (for free) whether the key works. Returns (state, detail):
    state is 'ok', 'bad', or 'unreachable'."""
    req = urllib.request.Request(APIFY_ME + token, headers={"User-Agent": "local-lead-finder-setup-check"})
    try:
        with urllib.request.urlopen(req, timeout=20) as resp:
            data = json.loads(resp.read().decode() or "{}").get("data", {})
        name = data.get("username") or data.get("email") or "your account"
        plan = data.get("plan")
        plan = plan.get("id") if isinstance(plan, dict) else plan
        return "ok", f'account "{name}"' + (f" ({plan} plan)" if plan else "")
    except urllib.error.HTTPError as e:
        if e.code in (401, 403):
            return "bad", "key was rejected (401), so it is wrong or was deleted"
        return "bad", f"Apify returned an error ({e.code})"
    except (urllib.error.URLError, TimeoutError, ValueError):
        return "unreachable", "could not reach Apify (check your internet, then rerun)"


def check_python(lines):
    v = sys.version_info
    if v >= (3, 8):
        lines.append(f"{OK} Python {v.major}.{v.minor} (need 3.8 or newer)")
        return True
    lines.append(f"{FIX} Python {v.major}.{v.minor} is too old. Install Python 3.8 or newer from https://python.org")
    return False


def check_deps(lines):
    missing = [name for mod, name in (("apify_client", "apify-client"), ("dotenv", "python-dotenv"))
               if importlib.util.find_spec(mod) is None]
    if not missing:
        lines.append(f"{OK} Required packages are installed (apify-client, python-dotenv)")
        return True
    lines.append(f"{FIX} Missing package(s): {', '.join(missing)}")
    lines.append("       Install them once with:  pip install -r requirements.txt")
    return False


def check_env_and_keys(lines):
    env = read_env_file(ENV_PATH)
    env_exists = os.path.isfile(ENV_PATH)
    tokens = gather_tokens(env)

    if env_exists:
        lines.append(f"{OK} Found your .env file")
    elif tokens:
        lines.append(f"{INFO} No .env file, but an Apify key is set in your environment")
    else:
        lines.append(f"{FIX} No .env file yet.")
        lines.append("       Copy the example next to this script:  cp .env.example .env")
        lines.append("       Then open .env and paste your Apify key after APIFY_API_TOKEN=")
        return False

    if not tokens:
        if has_placeholder(env):
            lines.append(f"{FIX} Your .env still has the example key (the one with xxxx).")
            lines.append("       Get a free key at https://console.apify.com/settings/integrations")
            lines.append("       and paste it after APIFY_API_TOKEN= in your .env, replacing the xxxx line.")
        else:
            lines.append(f"{FIX} No Apify key found in .env.")
            lines.append("       Add a line:  APIFY_API_TOKEN=apify_api_your_real_key")
            lines.append("       Get a free key at https://console.apify.com/settings/integrations")
        return False

    good = 0
    for i, tok in enumerate(tokens, start=1):
        label = "Apify key" if len(tokens) == 1 else f"Apify key {i} of {len(tokens)}"
        state, detail = validate_token(tok)
        if state == "ok":
            lines.append(f"{OK} {label} works: {detail}")
            good += 1
        elif state == "unreachable":
            lines.append(f"{INFO} {label}: {detail}")
        else:
            lines.append(f"{FIX} {label} does not work: {detail}")
    return good > 0


def check_optional(lines):
    env = read_env_file(ENV_PATH)
    url = (env.get("SHEETS_WEBHOOK_URL") or os.getenv("SHEETS_WEBHOOK_URL") or "").strip()
    if url and "xxxx" not in url.lower():
        lines.append(f"{INFO} Google Sheet auto-publish is set up (runs will also fill your Sheet)")
    else:
        lines.append(f"{INFO} Google Sheet auto-publish is off (optional). Every run still saves a CSV. See google-sheet/SETUP.md to turn it on.")

    key = (env.get("RESEND_API_KEY") or os.getenv("RESEND_API_KEY") or "").strip()
    sender = (env.get("RESEND_FROM") or os.getenv("RESEND_FROM") or "").strip()
    if key and "xxxx" not in key.lower() and sender and "yourdomain" not in sender.lower():
        lines.append(f"{INFO} Resend email outreach is set up (add --email to a scrape to send)")
    else:
        lines.append(f"{INFO} Resend email outreach is off (optional). See RESEND-SETUP.md to email leads automatically.")


def main():
    print("Local Lead Finder - setup check")
    print("===============================\n")

    lines = []
    ok_python = check_python(lines)
    ok_deps = check_deps(lines)
    ok_keys = check_env_and_keys(lines) if (ok_python and ok_deps) else False
    if ok_python and ok_deps:
        check_optional(lines)

    print("\n".join(lines))
    print()

    if ok_python and ok_deps and ok_keys:
        print("You are ready. Your first search, for example:")
        print('    python3 find_leads.py --sweep "West Kelowna, BC" --country ca')
        print("\nA full town is about $2 to $3 of Apify credit. Free accounts include monthly credit.")
        return 0

    print("Not ready yet. Fix the [FIX] line(s) above, then run this check again:")
    print("    python3 setup_check.py")
    return 1


if __name__ == "__main__":
    sys.exit(main())
