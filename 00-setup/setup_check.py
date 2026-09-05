#!/usr/bin/env python3
"""
AIPM setup check: "is everything connected?"

    python3 00-setup/setup_check.py

Checks the programs you need, the keys in your .env, and whether those keys
actually work. It never sends an email, never runs a scrape, and never spends
any credit: every check is either local or a free read-only call.

Standard library only, on purpose, so it still runs and can tell you what to
install before you have installed anything.
"""

import json
import os
import shutil
import subprocess
import sys
import urllib.error
import urllib.request

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)
SCRAPER_ENV = os.path.join(ROOT, "tools", "lead-scraper", ".env")

OK, FIX, INFO = "[ OK ]", "[FIX ]", "[info]"
problems = []


def say(mark, text, fix=None):
    print(f"{mark} {text}")
    if mark == FIX:
        problems.append(fix or text)


def read_env(path):
    """Parse a .env into a dict. A missing file is not an error, it is a finding."""
    values = {}
    if not os.path.isfile(path):
        return values
    with open(path, encoding="utf-8", errors="replace") as fh:
        for line in fh:
            line = line.strip()
            if not line or line.startswith("#") or "=" not in line:
                continue
            k, v = line.split("=", 1)
            values[k.strip()] = v.strip().strip('"').strip("'")
    return values


# Several of these APIs sit behind Cloudflare, which rejects Python's default
# urllib User-Agent with an opaque 403/1010 - not an auth failure, but this
# script would otherwise misreport it as "your key was rejected". Every
# request here sends a browser UA instead, same fix already used in
# tools/instant-builder/generator/llm.py for the same reason.
BROWSER_UA = (
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 "
    "(KHTML, like Gecko) Chrome/125.0 Safari/537.36"
)


def get(url, timeout=12, headers=None):
    req = urllib.request.Request(url, headers={"User-Agent": BROWSER_UA, **(headers or {})})
    with urllib.request.urlopen(req, timeout=timeout) as r:
        return r.status, r.read().decode("utf-8", "replace")


def section(title):
    print(f"\n{title}\n" + "-" * len(title))


# --------------------------------------------------------------------------
section("Programs")

if sys.version_info >= (3, 9):
    say(OK, f"Python {sys.version_info.major}.{sys.version_info.minor}")
else:
    say(FIX, f"Python {sys.version_info.major}.{sys.version_info.minor} is too old, you need 3.9 or newer",
        "Install a newer Python from python.org")

for prog, why, where in [
    ("git", "saving and updating your copy of this repo", "https://git-scm.com/downloads"),
    ("node", "running the CRM and the website builds", "https://nodejs.org"),
    ("claude", "the thing that does the work", "https://docs.claude.com/en/docs/claude-code/overview"),
    ("vercel", "deploying sites", "npm i -g vercel"),
]:
    if shutil.which(prog):
        say(OK, f"{prog} is installed")
    else:
        say(FIX, f"{prog} is missing, needed for {why}", f"Install {prog}: {where}")

# --------------------------------------------------------------------------
section("Your keys")

env = read_env(SCRAPER_ENV)
if not env:
    say(FIX, f"No .env found at tools/lead-scraper/.env",
        "Create tools/lead-scraper/.env and add your keys. See 00-setup/ENV-REFERENCE.md")
else:
    say(OK, "Found tools/lead-scraper/.env")


def env_or_os(name):
    return env.get(name) or os.environ.get(name, "")


# Apify
apify_keys = [v for k, v in env.items() if k.startswith("APIFY_API_TOKEN") and v]
if not apify_keys:
    say(FIX, "No Apify key set", "Add APIFY_API_TOKEN to tools/lead-scraper/.env. See 00-setup/04-apify.md")
else:
    say(OK, f"{len(apify_keys)} Apify key{'s' if len(apify_keys) > 1 else ''} set")
    for i, key in enumerate(apify_keys, 1):
        try:
            status, body = get(f"https://api.apify.com/v2/users/me?token={key}")
            name = json.loads(body).get("data", {}).get("username", "?")
            say(OK, f"  key {i} works (account {name})")
        except urllib.error.HTTPError as e:
            say(FIX, f"  key {i} was rejected ({e.code})", "Check the Apify key is copied in full")
        except Exception as e:
            say(INFO, f"  key {i} could not be checked ({type(e).__name__}), probably no internet")

# Google Sheet
sheet_url = env_or_os("SHEETS_WEBHOOK_URL")
if not sheet_url:
    say(FIX, "No Google Sheet webhook set",
        "Add SHEETS_WEBHOOK_URL to tools/lead-scraper/.env. See 00-setup/07-google-sheet.md")
elif not sheet_url.endswith("/exec"):
    say(FIX, "SHEETS_WEBHOOK_URL does not end in /exec",
        "Copy the Web app URL from Apps Script, not the editor URL")
else:
    try:
        status, body = get(sheet_url + "?stats=1")
        if body.lstrip().startswith("<"):
            say(FIX, "The Sheet URL returned a web page, not data",
                "Redeploy the Apps Script with 'Who has access: Anyone'")
        else:
            say(OK, "Google Sheet webhook responds")
    except Exception as e:
        say(FIX, f"Could not reach the Sheet webhook ({type(e).__name__})",
            "Check the URL, and that the Apps Script deployment is public")

if not env_or_os("SHEETS_WEBHOOK_TOKEN"):
    say(FIX, "Your Sheet webhook has no password set",
        "Set SHARED_TOKEN in Code.gs and SHEETS_WEBHOOK_TOKEN in .env. Without it anyone "
        "with the URL can write to your leads. See 00-setup/07-google-sheet.md")

# Resend
resend = env_or_os("RESEND_API_KEY")
if not resend:
    say(INFO, "No Resend key set yet, needed before you send anything")
else:
    try:
        status, body = get("https://api.resend.com/domains",
                           headers={"Authorization": f"Bearer {resend}"})
        data = json.loads(body).get("data", [])
        domains = data if isinstance(data, list) else []
        verified = [d for d in domains if d.get("status") == "verified"]
        if verified:
            say(OK, f"Resend key works, {len(verified)} verified domain: "
                    + ", ".join(d.get("name", "?") for d in verified))
        elif domains:
            say(FIX, f"Resend key works but no domain is verified yet",
                "Finish the DNS records at resend.com/domains. Until then your email goes to spam. "
                "See 00-setup/08-domain.md")
        else:
            say(FIX, "Resend key works but you have added no domain",
                "Add and verify your domain at resend.com/domains before sending. See 00-setup/06-resend.md")
    except urllib.error.HTTPError as e:
        if e.code in (401, 403):
            say(FIX, "Resend rejected your key", "Check RESEND_API_KEY is copied in full")
        else:
            say(INFO, f"Resend key could not be checked ({e.code})")
    except Exception as e:
        say(INFO, f"Resend key could not be checked ({type(e).__name__})")

# Groq
groq = env_or_os("GROQ_API_KEY")
if not groq:
    say(INFO, "No Groq key set yet, needed for the chatbot on client sites")
else:
    try:
        get("https://api.groq.com/openai/v1/models", headers={"Authorization": f"Bearer {groq}"})
        say(OK, "Groq key works")
    except urllib.error.HTTPError as e:
        say(FIX, f"Groq rejected your key ({e.code})", "Get a fresh one at console.groq.com/keys")
    except Exception as e:
        say(INFO, f"Groq key could not be checked ({type(e).__name__})")

# Sending caps
cap = env_or_os("OUTREACH_DAILY_MAX")
if cap:
    try:
        n = int(cap)
        if n > 50:
            say(FIX, f"OUTREACH_DAILY_MAX is {n}, which is high for a new domain",
                "Start at 5 and ramp over a month. See 02-outreach/email-warmup.md")
        else:
            say(OK, f"Daily sending cap is {n}")
    except ValueError:
        say(FIX, "OUTREACH_DAILY_MAX is not a number", "Set it to a number, for example 5")
else:
    say(INFO, "No OUTREACH_DAILY_MAX set. Set it to 5 before your first send")

# --------------------------------------------------------------------------
section("Safety")

paid = [k for k in ("OPENAI_API_KEY", "ANTHROPIC_API_KEY") if env_or_os(k)]
if paid:
    say(FIX, f"A paid API key is set ({', '.join(paid)})",
        "Nothing in this repo needs one. Remove it so a script cannot spend your money by accident")
else:
    say(OK, "No paid API keys set, everything runs free")

gitignore = os.path.join(ROOT, ".gitignore")
if os.path.isfile(gitignore):
    with open(gitignore, encoding="utf-8") as fh:
        body = fh.read()
    if ".env" in body:
        say(OK, ".env files are excluded from git")
    else:
        say(FIX, ".gitignore does not exclude .env", "Add a line reading .env to .gitignore")
else:
    say(FIX, "No .gitignore", "Your keys could be committed. Add one")

# --------------------------------------------------------------------------
print()
if problems:
    print(f"{len(problems)} thing{'s' if len(problems) > 1 else ''} to fix:\n")
    for i, p in enumerate(problems, 1):
        print(f"  {i}. {p}")
    print("\nFix those and run this again.")
    sys.exit(1)

print("Everything is connected. You are ready to find leads.")
sys.exit(0)
