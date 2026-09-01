#!/usr/bin/env python3
"""
local-lead-finder

Find local businesses to sell websites to. Scrapes Google Maps through Apify,
opens each business's website to judge how old it is, scores every business as a
website-sales lead, and writes a sales-ready CSV you can work straight down.

Two kinds of HOT lead:
  1. No website (or only a Facebook page) -> sell them their first site
  2. Old, broken, or outdated website      -> sell them a redesign

One API key. One CSV out. No Google login, no database.

Examples:
    python3 find_leads.py "dentists" "Miami, FL"
    python3 find_leads.py "plumbers" "Austin, TX" --limit 80 --no-website-only
    python3 find_leads.py --sweep "West Kelowna, BC" --country ca
"""

import os
import re
import sys
import csv
import json
import socket
import argparse
import urllib.request
from urllib.parse import urlparse, quote
from urllib.error import HTTPError, URLError
from datetime import datetime
from concurrent.futures import ThreadPoolExecutor, as_completed
from typing import Any, Optional

try:
    from apify_client import ApifyClient
except ImportError:
    print(
        "Missing dependency 'apify-client'.\n"
        "Run this once:  pip install -r requirements.txt",
        file=sys.stderr,
    )
    sys.exit(1)

try:
    from dotenv import load_dotenv

    load_dotenv()
except ImportError:
    # dotenv is optional; the token can be a normal environment variable.
    pass


ACTOR_ID = "compass/crawler-google-places"

# The "find me clients" basket: local business types that commonly have no
# website or a dated one, can afford a site, and book appointments or quotes (so
# a website plus fast email/SMS follow-up converts). Used by --sweep. Spans home
# services, auto, beauty, health, fitness, professional, pet, and events so a
# beginner sees the whole local market, not just construction trades.
NICHE_BASKET = [
    # Home and property services
    "landscaping", "lawn care", "painters", "plumbers", "electricians",
    "roofing", "general contractor", "handyman", "fencing", "tree service",
    "hvac", "pest control", "pressure washing", "garage door repair",
    "cleaning service",
    # Auto
    "auto repair", "auto detailing", "auto body shop",
    # Beauty and personal care
    "barber shop", "hair salon", "nail salon", "med spa",
    # Health and wellness
    "chiropractor", "dentist", "massage therapy",
    # Fitness
    "gym", "martial arts",
    # Professional services
    "law firm", "accountant",
    # Pet
    "dog grooming",
    # Events and creative
    "photographer", "florist",
    # Other local services that commonly have no site or a dated one
    "window cleaning", "junk removal", "moving company", "locksmith",
    "appliance repair", "flooring", "concrete contractor", "pool service",
    "catering", "sign shop",
    # Building trades that quote per job. Kept separate from the headline trades
    # above because a town usually has a different set of firms doing these.
    "kitchen fitter", "bathroom fitter", "plastering", "scaffolding",
    "driveways", "gutter cleaning", "carpet cleaning", "double glazing",
    "loft conversion", "damp proofing", "upholstery", "blinds and curtains",
    # More auto
    "tyre shop", "mot testing", "mobile mechanic",
    # More beauty, health and wellbeing
    "beauty salon", "tattoo studio", "eyelash extensions", "physiotherapy",
    "podiatrist", "dry cleaning",
    # More fitness and teaching
    "personal trainer", "yoga studio", "dance school", "driving school",
    "tutoring",
    # More professional services
    "mortgage broker", "insurance broker", "estate agent", "recruitment agency",
    # More pet
    "veterinary clinic", "dog walker", "pet boarding",
    # More events, trade and repair
    "wedding planner", "dj service", "party rental", "printing service",
    "bakery", "butcher", "phone repair", "computer repair",
    "security systems", "solar panel installer",
]

# Known multi-town regions. A sweep of a region keyword fans out to its main
# towns. Students anywhere can also pass several towns separated by semicolons:
#   --sweep "Boulder, CO; Longmont, CO; Loveland, CO"
REGIONS: dict[str, list[str]] = {
    "okanagan": [
        "Kelowna, BC", "West Kelowna, BC", "Vernon, BC",
        "Penticton, BC", "Lake Country, BC",
    ],
}

# National chains, franchises, banks, government, and charities. A student
# cannot sell a website to a Hilton or a thrift store, so the sweep drops them.
# Matched on whole tokens (see _mentions), so a term never knocks out a local
# business that merely contains it inside a longer word.
SKIP_NAME_TERMS = (
    # hotels / lodging
    "hilton", "marriott", "holiday inn", "best western", "ramada", "super 8",
    "days inn", "sandman hotel", "travelodge", "comfort inn", "hampton inn",
    "fairfield inn", "delta hotels", "accent inn", "coast hotel",
    # food / coffee chains
    "mcdonald", "starbucks", "tim hortons", "subway", "a&w", "wendy's",
    "burger king", "taco bell", "pizza hut", "domino's", "dominos",
    "dairy queen", "dunkin", "chipotle",
    # big box / national retail
    "walmart", "costco", "home depot", "lowe's", "lowes", "canadian tire",
    "best buy", "staples", "shoppers drug mart", "london drugs",
    "save-on-foods", "safeway", "real canadian superstore", "loblaws",
    "dollarama",
    # auto franchises
    "jiffy lube", "midas", "mr. lube", "mr lube", "kal tire", "fountain tire",
    "stanley steemer",
    # home-service franchises
    "molly maid", "merry maids", "servpro", "orkin", "terminix", "abell pest",
    "1-800-got-junk", "two men and a truck",
    # hair / fitness franchises
    "great clips", "supercuts", "first choice haircutters", "anytime fitness",
    "orangetheory", "snap fitness", "planet fitness",
    # banks / charities / government / non-prospects
    "habitat for humanity", "salvation army", "value village", "goodwill",
    "food bank", "city of", "regional district", "school district",
    "credit union", "h&r block",
    # More national chains and franchises. Safe to keep specific because names are
    # now matched on whole words (see _mentions), so none of these knocks out a
    # local whose name merely contains one (e.g. "Chilton's Auto" keeps "hilton").
    "quality inn", "sleep inn", "econo lodge", "howard johnson", "la quinta",
    "red roof inn", "motel 6", "sheraton", "hyatt", "wyndham", "extended stay",
    "kfc", "popeyes", "little caesar", "papa john", "wingstop", "five guys",
    "panera", "chick-fil-a", "whataburger", "jimmy john", "jack in the box",
    "panda express", "quiznos", "arby", "carl's jr", "papa murphy",
    "jersey mike", "firehouse subs", "del taco", "in-n-out", "raising cane",
    "culver's", "sonic drive", "cvs", "walgreens", "rite aid", "dollar tree",
    "dollar general", "family dollar", "petsmart", "petco", "autozone",
    "o'reilly auto", "advance auto", "napa auto", "harbor freight",
    "tractor supply", "hobby lobby", "sephora", "ulta beauty",
    "at&t store", "verizon", "t-mobile", "ups store", "fedex office",
    "u-haul", "enterprise rent", "budget car rental", "la fitness",
    "gold's gym", "crunch fitness", "club pilates", "pure barre",
    "sport clips", "fantastic sams", "cost cutters", "regis salon",
    "european wax", "roto-rooter", "mr. rooter", "mr rooter", "the maids",
    "chem-dry", "mister sparky", "benjamin franklin plumbing",
    "one hour heating", "college hunks", "servicemaster",
    # In-niche franchises the sweep targets (auto, beauty, dental, chiro, lawn,
    # massage, signs, fitness). Added after a live sweep showed franchise names can
    # otherwise slip through and score as leads a student cannot sell a site to.
    "massage envy", "massage heights", "elements massage", "hand and stone",
    "amazing lash", "drybar", "sola salon", "the woodhouse",
    "aspen dental", "western dental", "gentle dental", "comfort dental",
    "pacific dental", "heartland dental", "bright now dental",
    "the joint chiropractic",
    "aamco", "maaco", "meineke", "valvoline", "caliber collision",
    "gerber collision", "christian brothers automotive", "grease monkey",
    "take 5 oil", "les schwab", "firestone complete", "big o tires",
    "tires plus", "discount tire", "brakes plus", "ziebart", "line-x",
    "trugreen", "weed man", "lawn doctor", "mosquito joe", "mosquito squad",
    "the grounds guys", "junk king", "junk luggers",
    "f45 training", "9round", "burn boot camp", "title boxing",
    "fastsigns", "signarama", "minuteman press", "postnet", "alphagraphics",
    "batteries plus",
)

# Google Maps categories that are not website-sales prospects.
SKIP_CATEGORIES = (
    "hotel", "motel", "resort", "lodging", "bank", "atm",
    "charity", "non-profit", "non profit", "nonprofit", "government",
    "city hall", "courthouse", "post office", "police", "fire station",
    "public library", "airport",
    "elementary school", "high school", "university", "college",
    "shopping mall", "supermarket", "grocery store", "department store",
    "gas station", "tourist attraction",
)

# CSV columns. The last three are blank on purpose so the file doubles as your
# outreach tracker: fill them in as you work the list.
CSV_COLUMNS = [
    "lead_heat",
    "business_name",
    "category",
    "owner_name",
    "phone",
    "email",
    "why_reach_out",
    "website",
    "facebook",
    "instagram",
    "website_status",
    "rating",
    "reviews",
    "address",
    "city",
    "region",
    "postal_code",
    "country",
    "google_maps_url",
    "status",
    "contacted_on",
    "notes",
    "lat",
    "lng",
]

HEAT_ORDER = {"HOT": 0, "WARM": 1, "COOL": 2}

# Within a heat tier, rank by how much a business has already shown it will pay for
# a website. One that has (or had) a real site has proven it values one, so it is a
# warmer lead than one that never had a site. Order: outdated (live but dated, the
# easiest redesign pitch and clearly still paying for hosting) first, then broken
# (had a site, now down), then social-only, then no web presence at all. Ties break
# on review count. modern/unknown sit last (those leads are WARM or COOL anyway).
SITE_PRIORITY = {"OUTDATED": 0, "BROKEN": 1, "SOCIAL": 2, "NONE": 3, "modern": 4, "unknown": 4}

# Looks like a real browser so sites do not instantly block the quality check.
BROWSER_UA = (
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 "
    "(KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36"
)
SITE_TIMEOUT = 8
CURRENT_YEAR = datetime.now().year

# A "website" that is really just a social or directory page means no real site.
SOCIAL_HOSTS = (
    "facebook.com", "instagram.com", "linktr.ee", "linktree.",
    "tiktok.com", "linkedin.com", "yelp.com", "yellowpages.",
    "business.site", "wixsite.com/blank",
)

# A domain that only serves a parked, for-sale, or default placeholder page is not
# a real website. High-precision markers, so a genuine site never trips these.
PARKED_MARKERS = (
    "this domain is for sale", "buy this domain", "the domain is for sale",
    "parked free", "sedoparking", "hugedomains.com", "parkingcrew",
    "domain is parked", "godaddy.com/domainsearch",
    "this webpage was generated by the domain owner",
)
# Blank hosting / unpublished-site defaults. Unambiguous, so no length guard.
DEFAULT_PAGE_MARKERS = (
    "welcome to nginx", "apache2 debian default page", "apache2 ubuntu default page",
    "future home of something quaint", "this site is currently unpublished",
    "site not published", "your new website is ready",
)
# Only a placeholder when the page is also tiny (a real site that merely mentions
# "coming soon" in its content has plenty of other markup, so it will not trip).
SOFT_PLACEHOLDER_MARKERS = ("coming soon", "under construction")

# DIY website builders. When a site is ALREADY dated, naming the builder gives the
# student a sharper pitch: a template site you can beat with a fast custom build.
# Only ever used to enrich an already-outdated site, never to flag a working one.
DIY_BUILDERS = (
    ("Wix", ("wixstatic.com", "static.wixstatic", "x-wix-", "wix.com/website")),
    ("Squarespace", ("static1.squarespace.com", "squarespace.com/universal", "sqs-block")),
    ("GoDaddy", ("img1.wsimg.com", "godaddy.com/websites", "websitebuilder.godaddy")),
    ("Weebly", ("weeblycloud.com", "editmysite.com", "cdn2.editmysite")),
)


def _detect_builder(html: str) -> str:
    """Name the DIY builder a page is built on, if any (blank when none matches)."""
    for name, signs in DIY_BUILDERS:
        if any(s in html for s in signs):
            return name
    return ""


def get_tokens() -> list[str]:
    """
    Collect every Apify key the student has set, in order. Supports:
      APIFY_API_TOKEN                    one key, the common case
      APIFY_API_TOKEN_2, _3, ...         extra keys, rotated as each runs dry
      APIFY_API_TOKENS = "keyA, keyB"    a comma or space separated list
    Duplicates are dropped and order is kept. The tool burns through the first
    key and, when it hits its monthly limit, rolls to the next one.
    """
    found: list[str] = []

    bulk = os.getenv("APIFY_API_TOKENS", "")
    for part in re.split(r"[,\s]+", bulk):
        part = part.strip()
        if part:
            found.append(part)

    primary = os.getenv("APIFY_API_TOKEN", "").strip()
    if primary:
        found.append(primary)
    for i in range(1, 21):
        extra = os.getenv(f"APIFY_API_TOKEN_{i}", "").strip()
        if extra:
            found.append(extra)

    tokens: list[str] = []
    seen: set[str] = set()
    for tok in found:
        if tok not in seen:
            seen.add(tok)
            tokens.append(tok)

    if not tokens:
        print(
            "No Apify key found.\n\n"
            "This tool needs a free Apify key to read Google Maps.\n"
            "One-time setup (about 2 minutes):\n"
            "  1. Make a free account at https://console.apify.com/sign-up\n"
            "  2. Copy your token from https://console.apify.com/settings/integrations\n"
            "  3. Put it in a file named .env next to this script:\n"
            "       APIFY_API_TOKEN=apify_api_xxxxxxxxxxxxxxxxx\n\n"
            "Got more than one free account? Add them and the tool rotates through\n"
            "them as each month's credit runs out:\n"
            "       APIFY_API_TOKEN_2=apify_api_yyyyyyyyyyyyyyyyy\n"
            "       APIFY_API_TOKEN_3=apify_api_zzzzzzzzzzzzzzzzz\n",
            file=sys.stderr,
        )
        sys.exit(1)
    return tokens


# Google Maps wants ISO 3166-1 codes, where the United Kingdom is "gb". Everyone
# writes "uk", so translate the everyday spellings rather than fail the run.
COUNTRY_ALIASES = {
    "uk": "gb", "gbr": "gb", "england": "gb", "scotland": "gb", "wales": "gb",
    "usa": "us", "u.s.": "us", "u.s.a.": "us", "america": "us",
    "uae": "ae", "can": "ca", "aus": "au", "nz": "nz", "eire": "ie",
}


def normalise_country(country: Optional[str]) -> str:
    """Turn what a person types into the two-letter code the actor accepts."""
    code = (country or "").strip().lower().lstrip("-")
    return COUNTRY_ALIASES.get(code, code)


def build_actor_input(
    search_terms: list[str],
    location: str,
    limit: int,
    website_filter: str,
    scrape_emails: bool,
    country: Optional[str],
    language: str,
) -> dict[str, Any]:
    """Assemble the input for the Google Maps actor."""
    run_input: dict[str, Any] = {
        "searchStringsArray": search_terms,
        "maxCrawledPlacesPerSearch": limit,
        "language": language,
        "skipClosedPlaces": True,
        "website": website_filter,  # withWebsite / withoutWebsite / allPlaces
    }
    if location:
        run_input["locationQuery"] = location
    code = normalise_country(country)
    if code:
        run_input["countryCode"] = code
    if scrape_emails:
        run_input["scrapeContacts"] = True
    return run_input


# Error text that means "this key is spent or unusable" -> roll to the next key.
# Apify phrases free-tier exhaustion several ways, so match them all. The most
# common on a nearly-empty key is "you will exceed your remaining usage ...
# consider upgrading to a paid plan".
_EXHAUSTED_MARKERS = (
    "hard limit", "monthly usage", "usage limit", "limit exceeded",
    "monthly limit", "remaining usage", "paid plan", "exceed your remaining",
    "quota", "payment required", "insufficient", "not enough",
    "token is not valid", "authentication", "user was not found",
    "account was blocked", "too many requests",
)


def is_exhausted_error(exc: Exception) -> bool:
    """True when the error means the current key is out of credit or invalid."""
    message = str(exc).lower()
    return any(marker in message for marker in _EXHAUSTED_MARKERS)


class TokenPool:
    """Apify keys used one at a time, rolling forward as each one runs dry."""

    def __init__(self, tokens: list[str]) -> None:
        self.tokens = tokens
        self.idx = 0

    def active(self) -> Optional[str]:
        return self.tokens[self.idx] if self.idx < len(self.tokens) else None

    def label(self) -> str:
        return f"key {self.idx + 1} of {len(self.tokens)}"

    def retire_active(self) -> None:
        """Mark the current key spent and move to the next one."""
        self.idx += 1

    def has_key(self) -> bool:
        return self.idx < len(self.tokens)

    def has_next(self) -> bool:
        """True when retiring the current key would still leave one to use."""
        return self.idx < len(self.tokens) - 1


def run_field(run: Any, field: str) -> str:
    """
    Read a field off a finished Apify run.

    apify-client 2.x hands back a plain dict keyed "defaultDatasetId". 3.x hands
    back a typed object whose attribute is the snake_case "default_dataset_id".
    Students install whatever is current, so read both rather than crash (or,
    worse, quietly return nothing) after the scrape has already been paid for.
    """
    if run is None:
        return ""
    if isinstance(run, dict):
        return str(run.get(field) or "")
    snake = re.sub(r"(?<!^)(?=[A-Z])", "_", field).lower()
    for name in (field, snake):
        value = getattr(run, name, None)
        if value:
            return str(value)
    return ""


def run_scrape(pool: TokenPool, run_input: dict[str, Any]) -> list[dict[str, Any]]:
    """
    Run the actor and return raw place records, rotating Apify keys as they run
    dry. Tries the active key; if it is out of monthly credit (or invalid), that
    key is retired and the same search is retried on the next key, until one
    works or every key is spent. Businesses already paid for on a key that ran
    out part-way are carried forward, never thrown away.
    """
    partial: list[dict[str, Any]] = []
    while pool.has_key():
        token = pool.active()
        client = ApifyClient(token)
        try:
            run = client.actor(ACTOR_ID).call(run_input=run_input)
        except Exception as exc:  # noqa: BLE001 - surface any Apify error plainly
            if not is_exhausted_error(exc):
                print(f"Apify run failed: {exc}", file=sys.stderr)
                return partial
            if not pool.has_next():
                print(f"  Apify {pool.label()} is spent, and it was the last key.", file=sys.stderr)
                pool.retire_active()
                return partial
            print(f"  Apify {pool.label()} is out of credit, rolling to the next key ...")
            pool.retire_active()
            continue

        dataset_id = run_field(run, "defaultDatasetId")
        if not dataset_id:
            print("Apify returned no dataset. Try again or widen your search.", file=sys.stderr)
            return partial

        records: list[dict[str, Any]] = []
        for item in client.dataset(dataset_id).iterate_items():
            records.append(item)

        # A key that runs dry mid-scrape does not raise: Apify stops the run and
        # hands back a normal result marked ABORTED, with only the businesses it
        # managed before the money ran out. Left alone that reads as "this town
        # is small", and the rest of the town is silently lost. Keep what was
        # paid for, then finish the town on the next key.
        if run_field(run, "status") == "ABORTED":
            kept = len(records)
            if not pool.has_next():
                print(f"  Apify {pool.label()} ran out mid-scrape and it was the last key; "
                      f"keeping the {kept} found so far.", file=sys.stderr)
                pool.retire_active()
                return records
            print(f"  Apify {pool.label()} ran out mid-scrape after {kept} businesses, "
                  f"finishing this town on the next key ...")
            pool.retire_active()
            partial.extend(records)
            continue

        return partial + records

    return []


# --------------------------------------------------------------------------- #
# Email picking
# --------------------------------------------------------------------------- #

# A real email, not a maps-URL fragment that happens to contain an "@".
EMAIL_RE = re.compile(r"^[A-Za-z0-9._%+\-]+@[A-Za-z0-9.\-]+\.[A-Za-z]{2,}$")

GOOD_PREFIXES = (
    "info", "hello", "contact", "hi", "sales", "office",
    "admin", "bookings", "reception", "enquiries", "inquiries",
)
ROLE_NOISE = (
    "noreply", "no-reply", "donotreply", "recruiting", "careers",
    "jobs", "hr", "press", "marketing", "privacy", "abuse",
    "postmaster", "webmaster",
)


def _email_rank(email: str) -> int:
    """Lower is better: a real inbox beats a role account."""
    local = email.split("@", 1)[0].lower()
    if any(local.startswith(p) for p in ROLE_NOISE):
        return 2
    if any(local.startswith(p) for p in GOOD_PREFIXES):
        return 0
    return 1


def _first_email(raw: dict[str, Any]) -> str:
    """Pick the best single valid email the actor scraped from the website."""
    emails = raw.get("emails")
    if not isinstance(emails, list):
        return ""
    seen: set[str] = set()
    valid: list[str] = []
    for item in emails:
        email = str(item).strip().rstrip(".")
        low = email.lower()
        if not EMAIL_RE.fullmatch(email) or low in seen:
            continue
        seen.add(low)
        valid.append(email)
    if not valid:
        return ""
    valid.sort(key=_email_rank)  # stable sort keeps original order within a rank
    return valid[0]


# owner_name is deliberately NOT inferred from the email. On real data a guessed
# first.last local part was an employee or a license suffix (e.g. "...lmt@") more
# often than the actual owner, and a lead sheet that states a wrong name outright
# makes the student look bad on the call. The column stays in the schema, but the
# tool leaves it blank rather than assert a guess.


def _first_link(raw: dict[str, Any], keys: tuple[str, ...]) -> str:
    """First social/contact URL from the actor's list fields (facebooks, etc.)."""
    for key in keys:
        value = raw.get(key)
        if isinstance(value, list) and value:
            first = str(value[0]).strip()
            if first:
                return first
        elif isinstance(value, str) and value.strip():
            return value.strip()
    return ""


# --------------------------------------------------------------------------- #
# Website quality check (this is what makes "has a website" a real lead)
# --------------------------------------------------------------------------- #

def _dead_or_unknown(netloc: str) -> tuple[str, list[str]]:
    """Classify a homepage that would not load.

    If the domain does not resolve in DNS it is genuinely dead or expired, which
    is a clean first-site or rebuild pitch, so it is a real HOT "broken" lead. If
    the domain does resolve, the site is up but slow or blocking our automated
    check, so we say "unknown" (WARM) rather than post a false HOT the student
    would waste a call on. Errs toward "unknown" on any doubt.
    """
    host = netloc.split("@")[-1].split(":")[0]
    if host and not domain_resolves(host):
        return ("broken", ["the domain does not resolve, it looks dead or expired (a clean rebuild or first-site pitch)"])
    return ("unknown", ["the site would not load for our check (slow or blocking bots), open it yourself before pitching"])


def assess_website(url: str) -> tuple[str, list[str]]:
    """
    Open a homepage and judge how old it is.

    Returns one of: none, social, modern, outdated, broken, unknown, plus a list
    of plain-English reasons you can use as your opening line.
    """
    if not url:
        return ("none", [])

    target = url if url.startswith(("http://", "https://")) else "https://" + url
    low = target.lower()
    if any(host in low for host in SOCIAL_HOSTS):
        return ("social", ["only a social or directory page, no real website"])

    # Check the homepage (root domain), not a deep tracking URL that may 404.
    parsed = urlparse(target)
    root = f"{parsed.scheme}://{parsed.netloc}/" if parsed.netloc else target
    def _open(u: str) -> tuple[str, bytes, str]:
        req = urllib.request.Request(u, headers={"User-Agent": BROWSER_UA, "Accept": "text/html,*/*"})
        with urllib.request.urlopen(req, timeout=SITE_TIMEOUT) as resp:
            return resp.geturl(), resp.read(250_000), resp.headers.get("Content-Type", "")

    try:
        final_url, body, ctype = _open(root)
    except HTTPError as exc:
        if exc.code in (401, 403, 429):
            return ("unknown", ["site blocked an automated check, look at it yourself"])
        if exc.code in (404, 410):
            return ("broken", ["homepage returns a not-found error"])
        return ("unknown", [f"site returned HTTP {exc.code}"])
    except (URLError, socket.timeout, TimeoutError, ConnectionError, OSError):
        # An https attempt can fail only because the site is http-only. Retry http
        # once before judging it, so an http-only site is still assessed (it then
        # correctly flags "no SSL" instead of looking dead).
        if root.startswith("https://"):
            try:
                final_url, body, ctype = _open("http://" + root[len("https://"):])
            except Exception:  # noqa: BLE001
                return _dead_or_unknown(parsed.netloc)
        else:
            return _dead_or_unknown(parsed.netloc)
    except Exception:  # noqa: BLE001 - never let one bad site stop the run
        return ("unknown", [])

    # If the link is a file (PDF, image, ...) and not a web page, do not judge it.
    if ctype and "html" not in ctype.lower():
        return ("unknown", ["the link is a file or document, not a web page, look yourself"])

    html = body.decode("utf-8", errors="ignore").lower()

    # A parked, for-sale, or unfinished placeholder page is not a real website.
    # Score it as a first-build or rebuild lead, never as a modern site.
    if any(m in html for m in PARKED_MARKERS):
        return ("broken", ["the domain only shows a parked or for-sale page, not a real website"])
    if any(m in html for m in DEFAULT_PAGE_MARKERS):
        return ("broken", ["the site shows a blank default or unpublished page, not a real website"])
    if len(html) < 4000 and any(m in html for m in SOFT_PLACEHOLDER_MARKERS):
        return ("broken", ["the site is only a coming-soon placeholder, not a finished website"])

    reasons: list[str] = []

    # 1. Mobile friendly. The single biggest tell of an old site.
    if not re.search(r'name\s*=\s*["\']?viewport', html):
        reasons.append("not mobile-friendly (no responsive layout)")

    # 2. SSL. An http-only site has no padlock and looks unsafe to customers.
    if final_url.startswith("http://"):
        reasons.append("no SSL padlock (insecure http)")

    # 3. Stale copyright year in the footer (4+ years old, to avoid false flags).
    years = [int(y) for y in re.findall(r"(?:©|&copy;|copyright)[^0-9]{0,12}(20[0-2]\d)", html)]
    if years:
        newest = max(years)
        if newest <= CURRENT_YEAR - 4:
            reasons.append(f"copyright still says {newest}")

    # 4. Genuinely ancient web code.
    if ".swf" in html or "shockwave-flash" in html:
        reasons.append("uses Flash (long dead)")
    elif "<marquee" in html or "<font " in html or "/jquery-1." in html or "jquery/1." in html:
        reasons.append("built on very old web code")

    if reasons:
        builder = _detect_builder(html)
        if builder:
            reasons.insert(1, f"it is a template {builder} site you can beat with a fast custom build")
        return ("outdated", reasons)
    return ("modern", [])


def assess_many(urls: list[str], workers: int = 10) -> dict[str, tuple[str, list[str]]]:
    """Check many websites in parallel. Returns {url: (quality, reasons)}."""
    out: dict[str, tuple[str, list[str]]] = {}
    unique = [u for u in dict.fromkeys(urls) if u]
    if not unique:
        return out
    with ThreadPoolExecutor(max_workers=workers) as executor:
        futures = {executor.submit(assess_website, u): u for u in unique}
        for future in as_completed(futures):
            url = futures[future]
            try:
                out[url] = future.result()
            except Exception:  # noqa: BLE001
                out[url] = ("unknown", [])
    return out


def domain_resolves(domain: str) -> bool:
    """True if the domain resolves in DNS. A domain that does not resolve at all is
    dead or mistyped, so mail to it would bounce. Any resolver error other than
    'not found' is treated as resolvable, so a transient DNS hiccup never drops a
    good lead."""
    domain = domain.strip().rstrip(".")
    if not domain or "." not in domain:
        return False
    try:
        socket.getaddrinfo(domain, None)
        return True
    except socket.gaierror:
        return False
    except (UnicodeError, ValueError):
        return False
    except OSError:
        return True


def verify_email_domains(leads: list[dict[str, Any]], enabled: bool = True, workers: int = 10) -> int:
    """Blank the email on any lead whose email domain does not resolve, so the drip
    never emails a dead address (bounces hurt a new sender's reputation). Conservative
    by design: it only drops domains that fail DNS entirely and keeps anything that
    resolves. Returns how many emails were blanked; those leads stay as call-only."""
    if not enabled:
        return 0
    domains = set()
    for lead in leads:
        email = str(lead.get("email", "")).strip()
        if "@" in email:
            domains.add(email.rsplit("@", 1)[1].lower())
    if not domains:
        return 0
    resolves: dict[str, bool] = {}
    with ThreadPoolExecutor(max_workers=workers) as executor:
        futures = {executor.submit(domain_resolves, d): d for d in domains}
        for future in as_completed(futures):
            d = futures[future]
            try:
                resolves[d] = future.result(timeout=10)
            except Exception:  # noqa: BLE001
                resolves[d] = True
    dropped = 0
    for lead in leads:
        email = str(lead.get("email", "")).strip()
        if "@" in email and not resolves.get(email.rsplit("@", 1)[1].lower(), True):
            lead["email"] = ""
            dropped += 1
    return dropped


def drop_unreachable(leads: list[dict[str, Any]], enabled: bool = True) -> tuple[list[dict[str, Any]], int]:
    """Remove only the leads there is genuinely no way to contact.

    A business is keepable if it has any one of a phone, an email, a Facebook
    page or an Instagram profile: a Facebook message is a real outreach channel,
    so a social-only business is a lead, not dead weight. Only a business with
    none of the four is dropped, because nothing could be sent to it. Run this
    AFTER verify_email_domains, so a lead whose only handle was an email on a
    dead domain is judged on what is actually left.
    Returns (kept, dropped_count); keeps everything when disabled.
    """
    if not enabled:
        return leads, 0
    kept: list[dict[str, Any]] = []
    dropped = 0
    for lead in leads:
        if any(str(lead.get(field, "")).strip()
               for field in ("phone", "email", "facebook", "instagram")):
            kept.append(lead)
        else:
            dropped += 1
    return kept, dropped


# --------------------------------------------------------------------------- #
# Scoring
# --------------------------------------------------------------------------- #

STATUS_LABEL = {
    "none": "NONE",
    "social": "SOCIAL",
    "broken": "BROKEN",
    "outdated": "OUTDATED",
    "modern": "modern",
    "unknown": "unknown",
}


def score_lead(quality: str, rating: Optional[float], reviews: int, reasons: list[str]) -> tuple[str, str]:
    """
    Rank a business as a website-sales prospect.

    HOT  = no website, only a social page, a broken site, or a clearly dated site.
    WARM = a site we could not fully judge, or a modern site with weak reviews.
    COOL = a modern, solid website. Hardest sell.
    """
    stars = f"{rating:.1f}" if rating is not None else "no"

    if quality == "none":
        if reviews >= 20:
            return ("HOT", f"No website, yet {reviews} reviews at {stars} stars. Real demand, zero web presence. Call first.")
        if reviews >= 1:
            return ("HOT", f"No website. {reviews} reviews at {stars} stars. Prime first-site candidate.")
        return ("HOT", "No website. A clean first-site pitch.")

    if quality == "social":
        if reviews >= 1:
            return ("HOT", f"Only a social or Facebook page, no real website. {reviews} reviews at {stars} stars. First-site pitch.")
        return ("HOT", "Only a social or Facebook page, no real website. First-site pitch.")

    if quality == "broken":
        detail = reasons[0] if reasons else "the website would not load (broken or parked)"
        detail = detail[0].upper() + detail[1:]
        return ("HOT", f"{detail}. {reviews} reviews. Easy first-site or rebuild pitch.")

    if quality == "outdated":
        flaw = reasons[0] if reasons else "the site looks dated"
        extra = f" Also: {reasons[1]}." if len(reasons) > 1 else ""
        return ("HOT", f"Dated site: {flaw}.{extra} Strong redesign angle, you can show them what is wrong.")

    if quality == "unknown":
        return ("WARM", "Has a site we could not fully check. Worth a look for a redesign pitch.")

    # modern
    if rating is not None and rating < 4.0:
        return ("WARM", f"Modern site but only {stars} stars. Reputation plus refresh angle.")
    return ("COOL", "Modern, established site. Hardest sell. Pitch a faster, better-converting refresh.")


def _to_int(value: Any) -> int:
    try:
        return int(value)
    except (TypeError, ValueError):
        return 0


def _coord(raw, key):
    """Latitude or longitude from the Google Maps record, blank if absent."""
    location = raw.get("location") or {}
    value = location.get(key)
    if value is None:
        value = raw.get(key)
    try:
        return float(value)
    except (TypeError, ValueError):
        return ""


def _to_float(value: Any) -> Optional[float]:
    try:
        return float(value)
    except (TypeError, ValueError):
        return None


def _mentions(text: str, term: str) -> bool:
    """True when `term` occurs in `text` as a whole token, not buried inside a
    longer word. So the chain term "hilton" flags "Hilton Inn" but never a local
    like "Chilton's Auto", and "lowes" never knocks out "Marlowes Cafe". Both
    arguments must already be lowercased. Punctuation and digits count as token
    edges, so "a&w", "super 8", and "mr. lube" all still match cleanly.
    """
    n = len(term)
    start = 0
    while True:
        i = text.find(term, start)
        if i == -1:
            return False
        before = text[i - 1] if i > 0 else ""
        after = text[i + n] if i + n < len(text) else ""
        if not before.isalpha() and not after.isalpha():
            return True
        start = i + 1


def should_skip(name: str, category: str) -> bool:
    """True for national chains, banks, government, and other non-prospects.

    Name and category are matched on whole tokens (see _mentions), so a chain
    term never knocks out a local business that merely contains it inside a
    longer word: "Chilton's Auto Repair" is kept, "Hilton Inn" is dropped.
    """
    n = (name or "").lower()
    c = (category or "").lower()
    if any(_mentions(n, term) for term in SKIP_NAME_TERMS):
        return True
    if any(_mentions(c, term) for term in SKIP_CATEGORIES):
        return True
    return False


def to_lead(raw: dict[str, Any], site_quality: dict[str, tuple[str, list[str]]]) -> dict[str, Any]:
    """Flatten one raw place record into a sales-ready lead row."""
    website = (raw.get("website") or "").strip()
    if not website:
        quality, reasons = "none", []
    else:
        quality, reasons = site_quality.get(website, ("unknown", []))

    rating = _to_float(raw.get("totalScore"))
    reviews = _to_int(raw.get("reviewsCount"))
    heat, why = score_lead(quality, rating, reviews, reasons)

    name = raw.get("title", "")
    category = raw.get("categoryName", "")
    email = _first_email(raw)

    return {
        "lead_heat": heat,
        "business_name": name,
        "category": category,
        "owner_name": "",
        "phone": raw.get("phone") or raw.get("phoneUnformatted") or "",
        "email": email,
        "why_reach_out": why,
        "website": website,
        "facebook": _first_link(raw, ("facebooks", "facebook")),
        "instagram": _first_link(raw, ("instagrams", "instagram")),
        "website_status": STATUS_LABEL.get(quality, "unknown"),
        "address": raw.get("address", ""),
        "city": raw.get("city", ""),
        "region": raw.get("state", "") or raw.get("countyName", ""),
        "postal_code": raw.get("postalCode", ""),
        "country": raw.get("countryCode", "") or raw.get("countryName", ""),
        "rating": rating if rating is not None else "",
        "reviews": reviews,
        "google_maps_url": raw.get("url", ""),
        "status": "",
        "contacted_on": "",
        "notes": "",
        # Google already hands these back with every business, at no extra
        # cost. Keeping them means a map can place the lead straight away
        # instead of looking the address up again.
        "lat": _coord(raw, "lat"),
        "lng": _coord(raw, "lng"),
        # internal, not written to CSV
        "_reviews": reviews,
        "_heat_rank": HEAT_ORDER.get(heat, 9),
        "_place_id": raw.get("placeId", ""),
    }


def dedupe(leads: list[dict[str, Any]]) -> list[dict[str, Any]]:
    """Drop duplicate businesses: same place id, or same name plus phone/address.

    Matters most for a multi-town sweep, where one business can surface under two
    nearby towns or two related searches.
    """
    seen: set[str] = set()
    out: list[dict[str, Any]] = []
    for lead in leads:
        pid = lead.get("_place_id")
        if pid:
            key = f"id:{pid}"
        else:
            key_source = f"{lead['business_name']}|{lead['phone'] or lead['address']}".lower()
            key = re.sub(r"\s+", " ", key_source).strip()
        if key in seen:
            continue
        seen.add(key)
        out.append(lead)
    return out


def sort_leads(leads: list[dict[str, Any]]) -> list[dict[str, Any]]:
    """Best first: HOT, then WARM, then COOL. Inside a tier, the ones you can
    email come first, because an email address is the channel you can work at
    volume the same day; then the businesses that already have a website (an old
    or broken one, so a proven buyer) ahead of those that never had one; then by
    review count (more reviews = more real demand)."""
    return sorted(leads, key=lambda l: (
        l["_heat_rank"],
        0 if str(l.get("email", "")).strip() else 1,
        SITE_PRIORITY.get(l.get("website_status", ""), 4),
        -l["_reviews"],
    ))


def filter_min_reviews(leads: list[dict[str, Any]], minimum: int) -> list[dict[str, Any]]:
    """Drop leads below a review count. A minimum of 0 or less keeps everything."""
    if minimum <= 0:
        return leads
    return [l for l in leads if l.get("_reviews", 0) >= minimum]


def write_csv(leads: list[dict[str, Any]], path: str) -> None:
    os.makedirs(os.path.dirname(path) or ".", exist_ok=True)
    with open(path, "w", newline="", encoding="utf-8") as fh:
        writer = csv.DictWriter(fh, fieldnames=CSV_COLUMNS, extrasaction="ignore")
        writer.writeheader()
        for lead in leads:
            writer.writerow(lead)


def _lead_key(business: str, phone: str, city: str) -> str:
    """One lead, one key: the phone digits when there are any, else name plus city."""
    digits = re.sub(r"\D", "", str(phone or ""))
    # "+1 512-555-0100" and "(512) 555-0100" are the same number: drop the
    # North American country code so formatting never hides a duplicate.
    if len(digits) == 11 and digits.startswith("1"):
        digits = digits[1:]
    if digits:
        return digits
    return f"{str(business or '').strip().lower()}|{str(city or '').strip().lower()}"


def fetch_sheet_keys(url: str, token: str = "") -> set[str] | None:
    """
    The keys of every lead already in the Google Sheet, via the web app's
    ?crm=1 feed. Returns None when the sheet cannot be checked (old script,
    network trouble), so the caller can fail open and publish everything.
    """
    sep = "&" if "?" in url else "?"
    target = url + sep + "crm=1" + (f"&token={quote(token)}" if token else "")
    request = urllib.request.Request(target, headers={"User-Agent": "Mozilla/5.0"})
    try:
        with urllib.request.urlopen(request, timeout=30) as resp:
            body = resp.read(5_000_000).decode("utf-8", errors="ignore")
        data = json.loads(body)
    except Exception:  # noqa: BLE001  (fail open: dedupe is best-effort)
        return None
    if not data.get("ok"):
        return None
    return {
        _lead_key(l.get("business", ""), l.get("phone", ""), l.get("city", ""))
        for l in data.get("leads", [])
    }


def drop_already_in_sheet(
    leads: list[dict[str, Any]], url: str, token: str = ""
) -> tuple[list[dict[str, Any]], int, str]:
    """
    Keep only leads not already in the sheet, so scraping the same town twice
    never publishes duplicates (and nobody cold-calls the same business twice).
    Returns (fresh_leads, skipped_count, note). Fails open: if the sheet cannot
    be checked, everything is kept and the note says so.
    """
    existing = fetch_sheet_keys(url, token)
    if existing is None:
        return (leads, 0, "could not check the sheet for duplicates, publishing all")
    fresh = [
        l for l in leads
        if _lead_key(l.get("business_name", ""), l.get("phone", ""), l.get("city", "")) not in existing
    ]
    return (fresh, len(leads) - len(fresh), "")


def publish_to_sheet(leads: list[dict[str, Any]], url: str, token: str = "") -> tuple[bool, str]:
    """
    Append the leads to a Google Sheet via its Apps Script web app URL.

    Never raises: returns (ok, detail). The CSV is the source of truth, so a
    failed publish is only a warning. Only a real JSON confirmation from our own
    Apps Script counts as success, so a Google login wall never reads as a win.
    """
    rows = [[lead.get(col, "") for col in CSV_COLUMNS] for lead in leads]
    payload = {"token": token, "headers": CSV_COLUMNS, "rows": rows}
    data = json.dumps(payload).encode("utf-8")
    request = urllib.request.Request(
        url, data=data, headers={"Content-Type": "application/json"}, method="POST"
    )
    try:
        with urllib.request.urlopen(request, timeout=60) as resp:
            body = resp.read(20_000).decode("utf-8", errors="ignore")
    except HTTPError as exc:
        return (False, f"the sheet URL returned HTTP {exc.code}")
    except (URLError, socket.timeout, TimeoutError, OSError) as exc:
        return (False, f"could not reach the sheet URL ({exc})")
    except Exception as exc:  # noqa: BLE001
        return (False, str(exc))

    try:
        result = json.loads(body)
    except ValueError:
        return (False, "unexpected response (is the web app deployed so 'Anyone' can access it?)")
    if result.get("ok"):
        return (True, f"added {result.get('added', len(rows))} rows")
    return (False, str(result.get("error", "the sheet rejected the data")))


def slugify(text: str) -> str:
    return re.sub(r"[^a-z0-9]+", "-", text.lower()).strip("-") or "leads"


def default_output_path(label: str, location: str) -> str:
    stamp = datetime.now().strftime("%Y-%m-%d")
    name = f"{slugify(label)}-{slugify(location)}-{stamp}.csv"
    return os.path.join("leads", name)


def resolve_sweep_locations(raw: str) -> list[str]:
    """
    Turn a sweep location into one or more towns.
      - a known region keyword (e.g. "Okanagan") fans out to its main towns
      - a semicolon list ("Kelowna, BC; Vernon, BC") becomes several towns
      - anything else stays a single town
    """
    low = raw.lower()
    for key, cities in REGIONS.items():
        if re.search(rf"\b{re.escape(key)}\b", low):
            return list(cities)
    parts = [p.strip() for p in raw.split(";") if p.strip()]
    return parts or [raw.strip()]


def parse_args(argv: Optional[list[str]] = None) -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Find local businesses to sell websites to (Google Maps via Apify).",
        formatter_class=argparse.RawDescriptionHelpFormatter,
    )
    parser.add_argument("niche", nargs="?", help='What to search, e.g. "dentists". Omit when using --sweep.')
    parser.add_argument("location", nargs="?", help='Where, e.g. "Miami, FL" or "Leeds, UK"')
    parser.add_argument(
        "--sweep",
        action="store_true",
        help=(
            "Find clients fast: sweep a basket of ~40 website-needing local business "
            'types at once. Pass only the location. A region keyword like "Okanagan" '
            'or a semicolon list ("Kelowna, BC; Vernon, BC") sweeps several towns.'
        ),
    )
    parser.add_argument("--limit", type=int, default=None, help="Max businesses per search (default 50, or 12 per type for --sweep)")
    parser.add_argument("--min-reviews", type=int, default=0, help="Skip businesses with fewer than N Google reviews (default 0, keep all)")
    parser.add_argument(
        "--no-website-only",
        action="store_true",
        help="Only businesses with NO website (first-site pitch)",
    )
    parser.add_argument(
        "--has-website-only",
        action="store_true",
        help="Only businesses that already have a website (redesign pitch)",
    )
    parser.add_argument(
        "--no-emails",
        action="store_true",
        help="Skip website email scraping to save a little money (phone is always included)",
    )
    parser.add_argument(
        "--fast",
        action="store_true",
        help="Skip the website age check (faster, but you lose the redesign scoring)",
    )
    parser.add_argument(
        "--no-verify-emails",
        action="store_true",
        help="Skip the quick DNS check that blanks emails on dead domains (on by default so the email drip does not bounce)",
    )
    parser.add_argument(
        "--keep-unreachable",
        action="store_true",
        help="Keep leads that have no phone and no email (by default these unworkable leads are dropped)",
    )
    parser.add_argument("--country", help="Two-letter country code to pin the search, e.g. us, uk, ca")
    parser.add_argument("--language", default="en", help="Result language (default en)")
    parser.add_argument("--output", help="CSV path (default: leads/<niche>-<location>-<date>.csv)")
    parser.add_argument("--json", action="store_true", help="Also print a JSON summary to stdout")
    parser.add_argument("--sheet-url", help="Google Apps Script web app URL to publish leads to (overrides SHEETS_WEBHOOK_URL)")
    parser.add_argument("--no-sheet", action="store_true", help="Do not publish to Google Sheets even if a URL is set")
    parser.add_argument("--email", action="store_true", help="After scraping, email new leads (and send any due follow-ups) via Resend (needs RESEND_* in .env; see RESEND-SETUP.md)")
    parser.add_argument("--email-dry-run", action="store_true", help="Show which leads --email would contact, without sending")
    parser.add_argument("--email-limit", type=int, default=None, help="Override today's automatic warm-up cap (by default it ramps from 20 up to 100 a day as your domain ages)")
    return parser.parse_args(argv)


def main(argv: Optional[list[str]] = None) -> int:
    args = parse_args(argv)
    pool = TokenPool(get_tokens())

    if args.no_website_only and args.has_website_only:
        print("Pick one of --no-website-only or --has-website-only, not both.", file=sys.stderr)
        return 1

    website_filter = "allPlaces"
    if args.no_website_only:
        website_filter = "withoutWebsite"
    elif args.has_website_only:
        website_filter = "withWebsite"

    # Resolve what to search and where.
    if args.sweep:
        raw_loc = args.location or args.niche
        if not raw_loc:
            print('Use:  find_leads.py --sweep "West Kelowna, BC" --country ca', file=sys.stderr)
            return 1
        locations = resolve_sweep_locations(raw_loc)
        search_terms = NICHE_BASKET
        location = raw_loc  # used for filenames and messages
        label = "local-clients"
    else:
        if not (args.niche and args.location):
            print('Use:  find_leads.py "dentists" "Miami, FL"   (or --sweep for a whole town)', file=sys.stderr)
            return 1
        search_terms = [args.niche]
        location = args.location
        locations = [args.location]
        label = args.niche

    limit = args.limit if args.limit is not None else (12 if args.sweep else 50)

    # No website means no site to scrape an email from, so skip the paid
    # contact step on no-website-only runs.
    scrape_emails = (not args.no_emails) and website_filter != "withoutWebsite"

    # Rough cost estimate so there are no surprises (free Apify tier rates).
    # The website age check costs nothing, it just uses your own connection.
    per_place = 0.004 + (0.002 if scrape_emails else 0) + (0.001 if website_filter != "allPlaces" else 0)
    est = per_place * limit * len(search_terms) * len(locations)
    if args.sweep and len(locations) > 1:
        print(f"Sweeping {len(search_terms)} local business types across {len(locations)} towns in '{location}' (up to {limit} each).")
    elif args.sweep:
        print(f"Sweeping {len(search_terms)} local business types in '{location}' (up to {limit} each).")
    else:
        print(f"Searching Google Maps for '{label}' in '{location}' (up to {limit}).")
    print(f"Estimated Apify cost: about ${est:.2f} (max, if every search returns the full {limit}).")
    if len(pool.tokens) > 1:
        print(f"{len(pool.tokens)} Apify keys loaded. The tool rotates to the next one as each runs out of credit.")

    records: list[dict[str, Any]] = []
    for loc in locations:
        if len(locations) > 1:
            print(f"  scanning {loc} ...")
        run_input = build_actor_input(
            search_terms=search_terms,
            location=loc,
            limit=limit,
            website_filter=website_filter,
            scrape_emails=scrape_emails,
            country=args.country,
            language=args.language,
        )
        records.extend(run_scrape(pool, run_input))
        if not pool.has_key():
            print("  All Apify keys are spent. Stopping here with what we have so far.", file=sys.stderr)
            break

    if not records:
        print("No businesses found. Try a broader niche or a bigger city.", file=sys.stderr)
        return 1

    # Drop national chains, banks, government, and charities before anything else.
    before_skip = len(records)
    records = [r for r in records if not should_skip(r.get("title", ""), r.get("categoryName", ""))]
    skipped = before_skip - len(records)

    site_quality: dict[str, tuple[str, list[str]]] = {}
    check_sites = not args.fast and website_filter != "withoutWebsite"
    if check_sites:
        # Strip so these keys match the stripped website used in to_lead's lookup.
        site_urls = [r.get("website", "").strip() for r in records if r.get("website", "").strip()]
        if site_urls:
            print(f"Checking {len(site_urls)} websites for age and quality (free)...")
            site_quality = assess_many(site_urls)

    leads = [to_lead(raw, site_quality) for raw in records]
    leads = dedupe(leads)
    leads = filter_min_reviews(leads, args.min_reviews)

    if not args.no_verify_emails:
        dead = verify_email_domains(leads)
        if dead:
            print(f"Set aside {dead} email(s) on dead or mistyped domains (they would bounce); those leads are call-only.")

    leads, unreachable = drop_unreachable(leads, enabled=not args.keep_unreachable)
    if unreachable:
        print(f"Set aside {unreachable} lead(s) with nothing to reach them on (no phone, email, Facebook or Instagram).")

    # Sort last, once the data is final. Sorting earlier put leads at the top for
    # having an email, and then the dead-domain check blanked that email and left
    # them sitting there: the first screen is the one people judge the list on.
    leads = sort_leads(leads)

    output_path = args.output or default_output_path(label, location)
    write_csv(leads, output_path)

    # Preferred outreach: email each fresh lead one rotating template via Resend
    # (see RESEND-SETUP.md). The CSV is written above first, so a failed send never
    # loses data; on a successful send we rewrite it with the Contacted status.
    if args.email or args.email_dry_run:
        import send_emails
        try:
            sent = send_emails.send_outreach(leads, limit=args.email_limit, dry_run=args.email_dry_run)
        except send_emails.ConfigError as exc:
            print(f"Email step skipped: {exc}", file=sys.stderr)
        else:
            if sent and not args.email_dry_run:
                write_csv(leads, output_path)

    # Optionally publish to a Google Sheet (Apps Script web app). The CSV is
    # always written first, so a failed publish never loses data.
    sheet_url = (args.sheet_url or os.getenv("SHEETS_WEBHOOK_URL", "")).strip()
    if sheet_url and not args.no_sheet:
        sheet_token = os.getenv("SHEETS_WEBHOOK_TOKEN", "").strip()
        to_publish, already, dedupe_note = drop_already_in_sheet(leads, sheet_url, sheet_token)
        if dedupe_note:
            print(f"Note: {dedupe_note}.")
        if already:
            print(f"Skipped {already} lead(s) already in your Google Sheet.")
        if not to_publish:
            print("Nothing new to publish; every lead from this run is already in your Google Sheet.")
        else:
            ok, detail = publish_to_sheet(to_publish, sheet_url, sheet_token)
            if ok:
                print(f"Published {len(to_publish)} leads to your Google Sheet ({detail}).")
            else:
                print(f"Could not publish to your Google Sheet: {detail}.", file=sys.stderr)
                print("Your CSV is saved, so nothing is lost. Check SHEETS_WEBHOOK_URL in .env.", file=sys.stderr)
    elif not sheet_url and not args.no_sheet:
        print("Tip: connect a Google Sheet to auto-publish these. See google-sheet/SETUP.md.")

    hot = sum(1 for l in leads if l["lead_heat"] == "HOT")
    warm = sum(1 for l in leads if l["lead_heat"] == "WARM")
    n_none = sum(1 for l in leads if l["website_status"] == "NONE")
    n_social = sum(1 for l in leads if l["website_status"] == "SOCIAL")
    n_outdated = sum(1 for l in leads if l["website_status"] == "OUTDATED")
    n_broken = sum(1 for l in leads if l["website_status"] == "BROKEN")
    with_email = sum(1 for l in leads if l["email"])

    print("")
    print(f"Done. {len(leads)} leads written to {output_path}")
    if skipped:
        print(f"  (skipped {skipped} chains, banks, and non-prospects)")
    print(f"  HOT (your best leads): {hot}")
    print(f"      no website: {n_none}   social only: {n_social}   outdated: {n_outdated}   broken: {n_broken}")
    print(f"  WARM: {warm}")
    print(f"  Emails found: {with_email}")
    print("")
    if hot:
        print("Top of the list to work today:")
        for lead in leads[:8]:
            tag = lead["website_status"]
            print(f"  [{lead['lead_heat']}] {lead['business_name']} | {lead['phone'] or 'no phone'} | site: {tag}")

    if args.json:
        print(json.dumps({
            "leads": len(leads),
            "hot": hot,
            "warm": warm,
            "no_website": n_none,
            "social_only": n_social,
            "outdated": n_outdated,
            "broken": n_broken,
            "with_email": with_email,
            "output": output_path,
        }, indent=2))

    return 0


if __name__ == "__main__":
    raise SystemExit(main())
