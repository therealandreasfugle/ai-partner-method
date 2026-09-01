#!/usr/bin/env python3
"""
Offline test suite for find_leads.py.

Runs with no Apify key and no network: the Apify client is replaced with a fake
so key rotation can be proven by forcing a "monthly limit exceeded" error on the
first key and checking the tool rolls to the next one.

Run it:  python3 run_tests.py
"""

import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import find_leads as f  # noqa: E402


PASS = 0
FAIL = 0


def check(name: str, condition: bool) -> None:
    global PASS, FAIL
    if condition:
        PASS += 1
        print(f"  ok    {name}")
    else:
        FAIL += 1
        print(f"  FAIL  {name}")


def section(title: str) -> None:
    print(f"\n{title}")


# --------------------------------------------------------------------------- #
# Fake Apify client (no network, no credit) for the rotation tests
# --------------------------------------------------------------------------- #

FAKE_BEHAVIOR: dict = {}   # token -> Exception to raise, or a run dict to return
FAKE_DATASETS: dict = {}   # datasetId -> list of place records


class FakeActor:
    def __init__(self, token):
        self.token = token

    def call(self, run_input=None):
        behavior = FAKE_BEHAVIOR[self.token]
        if isinstance(behavior, Exception):
            raise behavior
        return behavior


class FakeDatasetClient:
    def __init__(self, dataset_id):
        self.dataset_id = dataset_id

    def iterate_items(self):
        return iter(FAKE_DATASETS.get(self.dataset_id, []))


class FakeApifyClient:
    def __init__(self, token):
        self.token = token

    def actor(self, actor_id):
        return FakeActor(self.token)

    def dataset(self, dataset_id):
        return FakeDatasetClient(dataset_id)


def set_apify_env(**kw) -> None:
    """Clear every APIFY_API_TOKEN* var, then set the given ones."""
    for key in list(os.environ):
        if key.startswith("APIFY_API_TOKEN"):
            del os.environ[key]
    for key, value in kw.items():
        os.environ[key] = value


# --------------------------------------------------------------------------- #
# Tests
# --------------------------------------------------------------------------- #

def test_get_tokens():
    section("Loading keys (get_tokens)")
    set_apify_env(APIFY_API_TOKEN="t1")
    check("one key", f.get_tokens() == ["t1"])

    set_apify_env(APIFY_API_TOKEN="t1", APIFY_API_TOKEN_2="t2", APIFY_API_TOKEN_3="t3")
    check("primary + numbered keys, in order", f.get_tokens() == ["t1", "t2", "t3"])

    set_apify_env(APIFY_API_TOKENS="a, b  c")
    check("bulk comma/space list", f.get_tokens() == ["a", "b", "c"])

    set_apify_env(APIFY_API_TOKEN="dup", APIFY_API_TOKEN_2="dup")
    check("duplicates removed", f.get_tokens() == ["dup"])

    set_apify_env(APIFY_API_TOKEN_1="only1")
    check("numbered-only (no bare key)", f.get_tokens() == ["only1"])


def test_is_exhausted_error():
    section("Classifying errors (is_exhausted_error)")
    check("monthly hard limit -> rotate", f.is_exhausted_error(Exception("Monthly usage hard limit exceeded")))
    check("invalid token -> rotate", f.is_exhausted_error(Exception("Authentication token is not valid")))
    check("rate limited -> rotate", f.is_exhausted_error(Exception("Too many requests")))
    check(
        "nearly-empty key (remaining usage / paid plan) -> rotate",
        f.is_exhausted_error(Exception(
            "By launching this job you will exceed your remaining usage of $0.09. "
            "Consider upgrading to a paid plan at https://console.apify.com/billing"
        )),
    )
    check("bad input -> do NOT rotate", not f.is_exhausted_error(Exception("Actor input is invalid: missing field")))
    check("network blip -> do NOT rotate", not f.is_exhausted_error(Exception("Connection reset by peer")))


def test_token_pool():
    section("Key pool mechanics (TokenPool)")
    pool = f.TokenPool(["k1", "k2", "k3"])
    check("starts on key 1", pool.active() == "k1" and pool.label() == "key 1 of 3")
    pool.retire_active()
    check("rolls to key 2", pool.active() == "k2")
    pool.retire_active()
    pool.retire_active()
    check("runs out after last key", pool.active() is None and not pool.has_key())


def test_rotation_end_to_end():
    section("Key rotation, end to end (fake Apify)")
    real_client = f.ApifyClient
    f.ApifyClient = FakeApifyClient
    try:
        global FAKE_BEHAVIOR, FAKE_DATASETS

        # Case A: first key is spent, second key works -> rotate once, get data.
        FAKE_BEHAVIOR = {
            "spent": Exception("Monthly usage hard limit exceeded"),
            "good": {"defaultDatasetId": "ds1"},
        }
        FAKE_DATASETS = {"ds1": [{"title": "Biz A"}, {"title": "Biz B"}]}
        pool = f.TokenPool(["spent", "good"])
        records = f.run_scrape(pool, {})
        check("rotated past the spent key", pool.idx == 1)
        check("returned the working key's data", [r["title"] for r in records] == ["Biz A", "Biz B"])

        # Case B: every key is spent -> no data, pool fully drained.
        FAKE_BEHAVIOR = {
            "s1": Exception("monthly usage limit reached"),
            "s2": Exception("usage hard limit exceeded"),
        }
        pool = f.TokenPool(["s1", "s2"])
        records = f.run_scrape(pool, {})
        check("all keys spent -> empty result", records == [])
        check("all keys spent -> pool drained", not pool.has_key())

        # Case C: single working key -> no rotation.
        FAKE_BEHAVIOR = {"g": {"defaultDatasetId": "ds1"}}
        FAKE_DATASETS = {"ds1": [{"title": "Solo"}]}
        pool = f.TokenPool(["g"])
        records = f.run_scrape(pool, {})
        check("single good key returns data", len(records) == 1 and pool.idx == 0)

        # Case D: a non-credit error must NOT burn through keys.
        FAKE_BEHAVIOR = {
            "g1": Exception("Actor input is invalid"),
            "g2": {"defaultDatasetId": "ds1"},
        }
        pool = f.TokenPool(["g1", "g2"])
        records = f.run_scrape(pool, {})
        check("real error fails fast, keeps the key", records == [] and pool.idx == 0)

        # Case E: a nearly-empty key ("remaining usage") rotates just like a spent one.
        FAKE_BEHAVIOR = {
            "spent1": Exception("Monthly usage hard limit exceeded"),
            "low2": Exception(
                "By launching this job you will exceed your remaining usage of $0.09. "
                "Consider upgrading to a paid plan."
            ),
            "good3": {"defaultDatasetId": "ds1"},
        }
        FAKE_DATASETS = {"ds1": [{"title": "Deep"}]}
        pool = f.TokenPool(["spent1", "low2", "good3"])
        records = f.run_scrape(pool, {})
        check("rolls past a nearly-empty key too", pool.idx == 2 and len(records) == 1)

        # Case F: apify-client 3.x returns a typed run object, not a dict. A fresh
        # install pulls 3.x, so the scrape must survive it. (It crashed here once,
        # after the run had already been paid for.)
        class TypedRun:
            defaultDatasetId = "ds1"

        FAKE_BEHAVIOR = {"newlib": TypedRun()}
        FAKE_DATASETS = {"ds1": [{"title": "Typed"}, {"title": "Run"}]}
        pool = f.TokenPool(["newlib"])
        records = f.run_scrape(pool, {})
        check("apify-client 3.x run object still yields places", len(records) == 2)

        # Case G: a key that runs dry MID-scrape does not raise. Apify stops the
        # run and returns it marked ABORTED with a part-filled dataset. That has
        # to look like an exhausted key, not like a small town, and the
        # businesses already paid for must survive the rotation.
        class AbortedRun:
            default_dataset_id = "half"
            status = "ABORTED"

        class GoodRun:
            default_dataset_id = "rest"
            status = "SUCCEEDED"

        FAKE_BEHAVIOR = {"dries": AbortedRun(), "fresh": GoodRun()}
        FAKE_DATASETS = {
            "half": [{"title": "Paid A"}, {"title": "Paid B"}],
            "rest": [{"title": "Rest C"}],
        }
        pool = f.TokenPool(["dries", "fresh"])
        records = f.run_scrape(pool, {})
        check("mid-scrape abort rotates to the next key", pool.idx == 1)
        check("businesses already paid for are carried forward, not lost",
              [r["title"] for r in records] == ["Paid A", "Paid B", "Rest C"])

        # Case H: same abort, but no key left. Keep what was paid for.
        FAKE_BEHAVIOR = {"lastone": AbortedRun()}
        pool = f.TokenPool(["lastone"])
        records = f.run_scrape(pool, {})
        check("abort on the last key still keeps what was paid for", len(records) == 2)
    finally:
        f.ApifyClient = real_client


def test_run_field():
    section("Apify run field reader (run_field, works on 2.x and 3.x)")

    class TypedRun:
        defaultDatasetId = "abc123"

    class SnakeRun:
        default_dataset_id = "abc123"
        status = "SUCCEEDED"

    check("dict run", f.run_field({"defaultDatasetId": "abc123"}, "defaultDatasetId") == "abc123")
    check("typed run", f.run_field(TypedRun(), "defaultDatasetId") == "abc123")
    check("snake_case run (apify-client 3.x)", f.run_field(SnakeRun(), "defaultDatasetId") == "abc123")
    check("single-word field still works", f.run_field(SnakeRun(), "status") == "SUCCEEDED")
    check("missing field on dict", f.run_field({}, "defaultDatasetId") == "")
    check("missing field on object", f.run_field(TypedRun(), "nope") == "")
    check("run is None", f.run_field(None, "defaultDatasetId") == "")

    # Against the REAL installed client, not a stand-in. A hand-written fake is
    # what let the snake_case rename through: it agreed with the assumption
    # instead of testing it, and three paid scrapes came back empty.
    try:
        from apify_client._models import Run as RealRun
    except Exception:
        RealRun = None
    if RealRun is not None:
        real = RealRun.model_construct(default_dataset_id="ds-real", status="SUCCEEDED")
        check("REAL apify-client Run object yields its dataset id",
              f.run_field(real, "defaultDatasetId") == "ds-real")
    else:
        check("real apify-client Run model importable (skipped, 2.x installed)", True)


def test_regions():
    section("Region and multi-town sweep (resolve_sweep_locations)")
    check("region keyword fans out", f.resolve_sweep_locations("Okanagan, BC") == f.REGIONS["okanagan"])
    check("single town stays single", f.resolve_sweep_locations("Kelowna, BC") == ["Kelowna, BC"])
    check("semicolon list splits", f.resolve_sweep_locations("Kelowna, BC; Vernon, BC") == ["Kelowna, BC", "Vernon, BC"])


def test_skip_list():
    section("Chain skip-list (should_skip)")
    check("skips a hotel chain", f.should_skip("Hilton Garden Inn", "Hotel"))
    check("skips Great Clips", f.should_skip("Great Clips", "Hair salon"))
    check("skips a charity ReStore", f.should_skip("Habitat for Humanity ReStore", "Thrift store"))
    check("keeps Veronica's Nails", not f.should_skip("Veronica's Nails", "Nail salon"))
    check("keeps Restore Physiotherapy", not f.should_skip("Restore Physiotherapy", "Physical therapist"))
    check("keeps a real local plumber", not f.should_skip("Phillips Plumbing", "Plumber"))
    check("skips a bank by category", f.should_skip("Community Trust", "Bank"))
    check("skips a gas station by category", f.should_skip("Bob's Corner Stop", "Gas station"))
    # Word-boundary matching: a chain term must be a whole token, never buried in a
    # longer word, so real locals that merely contain one are kept (recall).
    check("keeps Chilton's Auto (contains 'hilton', not the chain)", not f.should_skip("Chilton's Auto Repair", "Auto repair shop"))
    check("keeps Marlowes Cafe (contains 'lowes', not the chain)", not f.should_skip("Marlowes Cafe", "Cafe"))
    check("keeps City Office Supplies (contains 'city of', not a government)", not f.should_skip("City Office Supplies", "Office supply store"))
    # Newly covered national chains and non-prospect categories (precision).
    check("skips KFC", f.should_skip("KFC", "Fast food restaurant"))
    check("skips The UPS Store", f.should_skip("The UPS Store", "Shipping and mailing service"))
    check("skips Walgreens", f.should_skip("Walgreens Pharmacy", "Drug store"))
    check("skips Sport Clips", f.should_skip("Sport Clips Haircuts", "Hair salon"))
    check("skips a post office by category", f.should_skip("Kelowna Downtown", "Post office"))
    check("keeps a real local salon named after a person", not f.should_skip("Regina's Hair Studio", "Hair salon"))
    # In-niche national franchises the sweep targets, which must not reach the list.
    check("skips Massage Envy", f.should_skip("Massage Envy", "Massage spa"))
    check("skips Aspen Dental", f.should_skip("Aspen Dental", "Dentist"))
    check("skips TruGreen", f.should_skip("TruGreen Lawn Care", "Lawn care service"))
    check("skips AAMCO", f.should_skip("AAMCO Transmissions & Total Car Care", "Auto repair shop"))
    check("skips Les Schwab", f.should_skip("Les Schwab Tire Center", "Tire shop"))
    check("skips The Joint Chiropractic", f.should_skip("The Joint Chiropractic", "Chiropractor"))
    check("skips FASTSIGNS", f.should_skip("FASTSIGNS of Bend, OR", "Sign shop"))
    check("skips Batteries Plus", f.should_skip("Batteries Plus", "Car battery store"))
    # "the joint chiropractic" is specific, so a local "The Joint Cafe" is NOT dropped.
    check("keeps a local 'The Joint Cafe' (specific chain term, no false drop)", not f.should_skip("The Joint Cafe", "Cafe"))


def test_email_picking():
    section("Email cleaning (_first_email)")
    check("rejects a maps-URL fragment", f._first_email({"emails": ["//maps.google.com/place@30.1"]}) == "")
    check("prefers info@ over marketing@", f._first_email({"emails": ["marketing@x.com", "info@x.com"]}) == "info@x.com")
    check("no emails -> empty", f._first_email({"emails": []}) == "")


def test_email_verification():
    section("Email verification (drops dead domains before they bounce)")
    saved = f.domain_resolves
    try:
        f.domain_resolves = lambda d: d != "deadbiz.example"
        leads = [
            {"business_name": "Live", "email": "hi@goodbiz.com"},
            {"business_name": "Dead", "email": "info@deadbiz.example"},
            {"business_name": "NoEmail", "email": ""},
            {"business_name": "Dead2", "email": "sales@deadbiz.example"},
        ]
        dropped = f.verify_email_domains(leads)
        check("blanks both emails on the dead domain", dropped == 2)
        check("keeps the email on a live domain", leads[0]["email"] == "hi@goodbiz.com")
        check("blanks the dead-domain email", leads[1]["email"] == "")
        check("blanks the second dead-domain email", leads[3]["email"] == "")
        check("leaves a lead that had no email alone", leads[2]["email"] == "")
        off = [{"business_name": "Dead", "email": "info@deadbiz.example"}]
        check("disabled leaves every email in place",
              f.verify_email_domains(off, enabled=False) == 0 and off[0]["email"] == "info@deadbiz.example")
    finally:
        f.domain_resolves = saved


def test_website_offline_branches():
    section("Website scoring (offline branches)")
    check("no website -> none", f.assess_website("") == ("none", []))
    check("facebook-only -> social", f.assess_website("https://facebook.com/somebiz")[0] == "social")


def test_website_quality_mock():
    section("Website quality: parked, placeholder, http-only (local mock server)")
    import threading
    from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer

    state = {"html": "", "ctype": "text/html"}

    class Handler(BaseHTTPRequestHandler):
        def log_message(self, *args):
            pass

        def do_GET(self):
            self.send_response(200)
            self.send_header("Content-Type", state.get("ctype", "text/html"))
            self.end_headers()
            self.wfile.write(state["html"].encode("utf-8"))

    server = ThreadingHTTPServer(("127.0.0.1", 0), Handler)
    port = server.server_address[1]
    threading.Thread(target=server.serve_forever, daemon=True).start()
    base = f"http://127.0.0.1:{port}/"
    try:
        state["html"] = "<html><head><title>x</title></head><body>This domain is for sale. Buy this domain.</body></html>"
        check("parked / for-sale page -> broken", f.assess_website(base)[0] == "broken")

        state["html"] = "<html><body>Welcome to nginx!</body></html>"
        check("default server page -> broken", f.assess_website(base)[0] == "broken")

        state["html"] = "<html><body>Coming soon</body></html>"
        check("tiny coming-soon page -> broken", f.assess_website(base)[0] == "broken")

        big = ("<html><head><meta name=\"viewport\" content=\"width=device-width\"></head><body>"
               + ("we do great work for local customers. " * 300)
               + "new location coming soon</body></html>")
        state["html"] = big
        check("long real page mentioning 'coming soon' is NOT flagged", f.assess_website(base)[0] != "broken")

        state["html"] = ("<html><head><meta name=\"viewport\" content=\"x\"></head><body>"
                         + ("used cars for sale and homes for sale nearby. " * 80) + "</body></html>")
        check("a real page that says 'for sale' is NOT flagged as parked", f.assess_website(base)[0] != "broken")

        # http-only site: the https attempt fails, we fall back to http and judge it
        state["html"] = "<html><head><meta name=\"viewport\" content=\"width=device-width\"></head><body>real modern site</body></html>"
        q, reasons = f.assess_website(f"127.0.0.1:{port}")
        check("http-only site is judged, not called broken", q != "broken")
        check("http-only site flags the missing SSL padlock", any("ssl" in r.lower() for r in reasons))

        state["html"] = "<html><head><meta name=\"viewport\" content=\"x\"></head><body>&copy; 2014 Old Co</body></html>"
        q2, reasons2 = f.assess_website(base)
        check("stale copyright -> outdated with the year", q2 == "outdated" and any("2014" in r for r in reasons2))

        heat, why = f.score_lead("broken", 5.0, 40, ["the domain only shows a parked or for-sale page, not a real website"])
        check("broken opener uses the specific reason", heat == "HOT" and "parked or for-sale" in why)

        state["html"] = "<html><body>site built with wixstatic.com assets</body></html>"
        qb, reasonsb = f.assess_website(base)
        check("a dated Wix site names the builder", qb == "outdated" and any("Wix" in r for r in reasonsb))
        check("_detect_builder finds Squarespace", f._detect_builder("x static1.squarespace.com y") == "Squarespace")
        check("_detect_builder blank on a custom site", f._detect_builder("<html>hand built</html>") == "")

        state["html"] = "%PDF-1.4 not a web page"
        state["ctype"] = "application/pdf"
        check("a file link (pdf) -> unknown, not judged as a site", f.assess_website(base)[0] == "unknown")
        state["ctype"] = "text/html"
    finally:
        server.shutdown()


def test_website_http_status_branches():
    section("Website HTTP status handling (403/429 blocked -> unknown, 404 -> broken)")
    import threading
    from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer

    state = {"code": 200}

    class Handler(BaseHTTPRequestHandler):
        def log_message(self, *args):
            pass

        def do_GET(self):
            self.send_response(state["code"])
            self.send_header("Content-Type", "text/html")
            self.end_headers()
            if state["code"] == 200:
                self.wfile.write(b"<html><head><meta name=\"viewport\"></head><body>ok</body></html>")

    server = ThreadingHTTPServer(("127.0.0.1", 0), Handler)
    port = server.server_address[1]
    threading.Thread(target=server.serve_forever, daemon=True).start()
    base = f"http://127.0.0.1:{port}/"
    try:
        state["code"] = 403
        check("403 bot-block -> unknown/WARM (not a false HOT)", f.assess_website(base)[0] == "unknown")
        state["code"] = 429
        check("429 rate-limit -> unknown/WARM", f.assess_website(base)[0] == "unknown")
        state["code"] = 404
        check("404 homepage -> broken (a real rebuild lead)", f.assess_website(base)[0] == "broken")
    finally:
        server.shutdown()


def test_scoring_units():
    section("Lead scoring branches (score_lead)")
    check("no website + many reviews -> HOT", f.score_lead("none", 4.8, 25, [])[0] == "HOT")
    check("no website + no reviews -> HOT", f.score_lead("none", None, 0, [])[0] == "HOT")
    check("social only -> HOT", f.score_lead("social", 4.5, 30, [])[0] == "HOT")
    check("broken -> HOT", f.score_lead("broken", 4.0, 10, ["would not load"])[0] == "HOT")
    check("outdated -> HOT with the exact flaw in the opener", f.score_lead("outdated", 4.0, 10, ["not mobile-friendly"]) == ("HOT", "Dated site: not mobile-friendly. Strong redesign angle, you can show them what is wrong."))
    check("unknown -> WARM", f.score_lead("unknown", 4.0, 5, [])[0] == "WARM")
    check("modern + weak rating -> WARM", f.score_lead("modern", 3.5, 5, [])[0] == "WARM")
    check("modern + strong -> COOL", f.score_lead("modern", 4.8, 100, [])[0] == "COOL")


def test_to_lead():
    section("Flattening a raw record (to_lead)")
    raw_none = {"title": "Joe Plumbing", "categoryName": "Plumber", "phone": "555-1",
                "reviewsCount": 50, "totalScore": 4.7, "placeId": "p1", "emails": ["info@joe.com"]}
    lead = f.to_lead(raw_none, {})
    check("no-website record -> HOT / NONE", lead["lead_heat"] == "HOT" and lead["website_status"] == "NONE")
    check("business name flattened", lead["business_name"] == "Joe Plumbing")
    check("email picked", lead["email"] == "info@joe.com")
    check("reviews carried through", lead["reviews"] == 50 and lead["_reviews"] == 50)
    check("place id kept for dedupe", lead["_place_id"] == "p1")

    raw_modern = {"title": "Modern Co", "categoryName": "Dentist", "website": "https://modern.co",
                  "reviewsCount": 120, "totalScore": 4.9, "placeId": "p2"}
    lead2 = f.to_lead(raw_modern, {"https://modern.co": ("modern", [])})
    check("modern site -> COOL", lead2["lead_heat"] == "COOL" and lead2["website_status"] == "modern")


def test_dedupe_and_sort():
    section("Dedupe and sort (dedupe, sort_leads)")
    a = {"business_name": "A", "phone": "1", "address": "x", "_place_id": "pid1"}
    a_dup = {"business_name": "A", "phone": "1", "address": "x", "_place_id": "pid1"}
    b = {"business_name": "B", "phone": "2", "address": "y", "_place_id": ""}
    b_dup = {"business_name": "B", "phone": "2", "address": "y", "_place_id": ""}
    out = f.dedupe([a, a_dup, b, b_dup])
    check("place-id and name+phone dupes removed", len(out) == 2)

    leads = [
        {"_heat_rank": 2, "_reviews": 300, "lead_heat": "COOL"},
        {"_heat_rank": 0, "_reviews": 5, "lead_heat": "HOT"},
        {"_heat_rank": 0, "_reviews": 90, "lead_heat": "HOT"},
        {"_heat_rank": 1, "_reviews": 10, "lead_heat": "WARM"},
    ]
    ordered = f.sort_leads(leads)
    check("HOT first, WARM, then COOL", [l["lead_heat"] for l in ordered] == ["HOT", "HOT", "WARM", "COOL"])
    check("within HOT, more reviews first", ordered[0]["_reviews"] == 90 and ordered[1]["_reviews"] == 5)

    # Within HOT, a business that already has a website (even an old or broken one)
    # is the stronger lead than a no-website business, even with fewer reviews.
    hot_leads = [
        {"_heat_rank": 0, "_reviews": 500, "lead_heat": "HOT", "website_status": "NONE"},
        {"_heat_rank": 0, "_reviews": 10, "lead_heat": "HOT", "website_status": "OUTDATED"},
        {"_heat_rank": 0, "_reviews": 50, "lead_heat": "HOT", "website_status": "BROKEN"},
    ]
    ordered2 = f.sort_leads(hot_leads)
    check("within HOT, an old/broken site outranks a no-website lead with more reviews",
          [l["website_status"] for l in ordered2] == ["OUTDATED", "BROKEN", "NONE"])

    # An email is the channel you can work at volume today, so inside a tier the
    # emailable leads come first. Nobody scrolling the top of the sheet should be
    # able to say "half of these have no email".
    mixed = [
        {"_heat_rank": 0, "_reviews": 900, "lead_heat": "HOT", "website_status": "OUTDATED", "email": "", "business_name": "no-email"},
        {"_heat_rank": 0, "_reviews": 3, "lead_heat": "HOT", "website_status": "NONE", "email": "a@b.com", "business_name": "has-email"},
        {"_heat_rank": 1, "_reviews": 900, "lead_heat": "WARM", "website_status": "OUTDATED", "email": "c@d.com", "business_name": "warm-email"},
    ]
    ordered3 = f.sort_leads(mixed)
    check("within a tier, emailable leads come first",
          [l["business_name"] for l in ordered3] == ["has-email", "no-email", "warm-email"])
    check("email priority never jumps a lead above a hotter tier",
          ordered3[2]["lead_heat"] == "WARM")


def test_reachability():
    section("Reachability (drop_unreachable keeps social-only leads)")
    leads = [
        {"business_name": "phone only", "phone": "+44 1", "email": "", "facebook": "", "instagram": ""},
        {"business_name": "email only", "phone": "", "email": "a@b.com", "facebook": "", "instagram": ""},
        {"business_name": "facebook only", "phone": "", "email": "", "facebook": "facebook.com/x", "instagram": ""},
        {"business_name": "instagram only", "phone": "", "email": "", "facebook": "", "instagram": "instagram.com/y"},
        {"business_name": "nothing at all", "phone": "", "email": "", "facebook": "", "instagram": ""},
    ]
    kept, dropped = f.drop_unreachable(leads)
    names = [l["business_name"] for l in kept]
    check("a Facebook page is a real channel, so it is kept", "facebook only" in names)
    check("an Instagram profile is kept too", "instagram only" in names)
    check("phone-only and email-only still kept", "phone only" in names and "email only" in names)
    check("only the truly uncontactable lead is dropped", dropped == 1 and "nothing at all" not in names)
    check("whitespace does not count as a channel",
          f.drop_unreachable([{"phone": "  ", "email": "", "facebook": " ", "instagram": ""}])[1] == 1)
    kept_all, dropped_all = f.drop_unreachable(leads, enabled=False)
    check("disabled keeps everything", len(kept_all) == 5 and dropped_all == 0)


def test_build_actor_input():
    section("Actor input assembly (build_actor_input)")
    a = f.build_actor_input(["dentists"], "Miami, FL", 50, "withoutWebsite", False, "US", "en")
    check("website filter set", a["website"] == "withoutWebsite")
    check("no-email run omits scrapeContacts", "scrapeContacts" not in a)
    check("country lowercased", a["countryCode"] == "us")
    check("location + limit + terms", a["locationQuery"] == "Miami, FL" and a["maxCrawledPlacesPerSearch"] == 50 and a["searchStringsArray"] == ["dentists"])
    b = f.build_actor_input(["x"], "", 10, "allPlaces", True, None, "en")
    check("email run sets scrapeContacts", b.get("scrapeContacts") is True)
    check("no country -> no countryCode", "countryCode" not in b)
    check("no location -> no locationQuery", "locationQuery" not in b)
    # Google Maps only accepts ISO codes, so "uk" has to become "gb" or the
    # whole run is rejected before a single business is scraped.
    uk = f.build_actor_input(["x"], "Birmingham, UK", 12, "allPlaces", True, "uk", "en")
    check("uk -> gb", uk["countryCode"] == "gb")
    check("UK uppercase -> gb", f.build_actor_input(["x"], "", 1, "allPlaces", False, "UK", "en")["countryCode"] == "gb")
    check("usa -> us", f.normalise_country("USA") == "us")
    check("real code passes through", f.normalise_country("ca") == "ca")
    check("blank country -> blank", f.normalise_country(None) == "" and f.normalise_country("  ") == "")


def test_slug_and_output():
    section("Filenames (slugify, default_output_path)")
    check("slugify cleans punctuation", f.slugify("Dentists & Co!") == "dentists-co")
    check("slugify empty -> leads", f.slugify("") == "leads")
    p = f.default_output_path("plumbers", "Austin, TX")
    check("output path shape", p.startswith("leads/plumbers-austin-tx-") and p.endswith(".csv"))


def test_min_reviews_filter():
    section("Minimum-reviews filter (filter_min_reviews)")
    leads = [{"_reviews": 0}, {"_reviews": 5}, {"_reviews": 25}]
    check("0 keeps all", len(f.filter_min_reviews(leads, 0)) == 3)
    check("negative keeps all", len(f.filter_min_reviews(leads, -1)) == 3)
    check("threshold drops below N", [l["_reviews"] for l in f.filter_min_reviews(leads, 5)] == [5, 25])
    check("high threshold can empty the list", f.filter_min_reviews(leads, 100) == [])


def test_write_csv_roundtrip():
    section("Writing the CSV (write_csv)")
    import tempfile
    import csv as _csv

    leads = [
        f.to_lead({"title": "Alpha Plumbing", "categoryName": "Plumber", "reviewsCount": 10,
                   "totalScore": 4.5, "placeId": "a", "phone": "555-1"}, {}),
        f.to_lead({"title": "Beta Dental", "categoryName": "Dentist", "website": "https://beta.co",
                   "reviewsCount": 80, "totalScore": 4.9, "placeId": "b"},
                  {"https://beta.co": ("modern", [])}),
    ]
    leads = f.sort_leads(f.dedupe(leads))
    path = os.path.join(tempfile.mkdtemp(), "out.csv")
    f.write_csv(leads, path)
    with open(path, newline="", encoding="utf-8") as fh:
        rows = list(_csv.reader(fh))
    check("header matches the 24-column schema", rows[0] == f.CSV_COLUMNS and len(rows[0]) == 24)
    check("one row per lead", len(rows) == 1 + len(leads))
    check("internal underscore fields never leak to the CSV", not any(h.startswith("_") for h in rows[0]))
    check("HOT no-website lead sorts above the modern one", rows[1][0] == "HOT")


def test_owner_and_socials():
    section("Owner name and social links")
    # owner_name is intentionally left blank: a name guessed from an email local
    # part was an employee or a license suffix more often than the real owner, so
    # the tool never asserts a person's name it merely inferred.
    lead = f.to_lead({"title": "Dynamic Auto", "categoryName": "Auto repair",
                      "reviewsCount": 10, "totalScore": 4.5, "placeId": "o1",
                      "emails": ["kerry.jones@dynamicauto.com"]}, {})
    check("owner_name is left blank, never a guessed name", lead["owner_name"] == "")
    check("first social link picked", f._first_link({"facebooks": ["https://facebook.com/a", "b"]}, ("facebooks",)) == "https://facebook.com/a")
    check("no socials -> empty", f._first_link({}, ("facebooks",)) == "")
    check("owner_name column still in the schema", all(c in f.CSV_COLUMNS for c in ("owner_name", "facebook", "instagram")))
    check("map coordinates are kept", all(c in f.CSV_COLUMNS for c in ("lat", "lng")))


def test_sheet_dedupe():
    section("Cross-scrape dedupe against the sheet")
    import find_leads as fl

    # Keys: phone digits win; name+city is the fallback.
    check("key uses phone digits", fl._lead_key("Joe's", "(512) 555-0100", "Austin") == "5125550100")
    check("key falls back to name|city", fl._lead_key("Joe's", "", "Austin") == "joe's|austin")

    leads = [
        {"business_name": "Old Phone Lead", "phone": "+1 512-555-0100", "city": "Austin"},
        {"business_name": "Old Nameonly Lead", "phone": "", "city": "Austin"},
        {"business_name": "Brand New Lead", "phone": "555-9999", "city": "Austin"},
    ]
    existing = {"5125550100", "old nameonly lead|austin"}

    real = fl.fetch_sheet_keys
    fl.fetch_sheet_keys = lambda url, token="": existing
    try:
        fresh, skipped, note = fl.drop_already_in_sheet(leads, "https://x/exec")
        check("phone match skipped despite formatting", all(l["business_name"] != "Old Phone Lead" for l in fresh))
        check("name+city match skipped", all(l["business_name"] != "Old Nameonly Lead" for l in fresh))
        check("new lead kept", any(l["business_name"] == "Brand New Lead" for l in fresh))
        check("skip count is 2", skipped == 2)
        check("no note on success", note == "")

        fl.fetch_sheet_keys = lambda url, token="": None
        fresh2, skipped2, note2 = fl.drop_already_in_sheet(leads, "https://x/exec")
        check("fail-open keeps everything", len(fresh2) == 3 and skipped2 == 0)
        check("fail-open says so", "could not check" in note2)
    finally:
        fl.fetch_sheet_keys = real


def test_publish_to_sheet():
    section("Publishing to Google Sheets (local mock server)")
    import json as _json
    import threading
    from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer

    captured: dict = {}

    class Handler(BaseHTTPRequestHandler):
        def log_message(self, *args):
            pass

        def do_POST(self):
            length = int(self.headers.get("Content-Length", 0))
            captured["body"] = _json.loads(self.rfile.read(length).decode("utf-8"))
            reply = _json.dumps({"ok": True, "added": len(captured["body"].get("rows", []))}).encode()
            self.send_response(200)
            self.send_header("Content-Type", "application/json")
            self.end_headers()
            self.wfile.write(reply)

    server = ThreadingHTTPServer(("127.0.0.1", 0), Handler)
    port = server.server_address[1]
    thread = threading.Thread(target=server.serve_forever, daemon=True)
    thread.start()
    try:
        url = f"http://127.0.0.1:{port}/exec"
        leads = [{"lead_heat": "HOT", "business_name": "Test Co", "phone": "123", "email": "info@test.co"}]
        ok, detail = f.publish_to_sheet(leads, url, token="secret")
        check("publish reports success", ok)
        check("sends the shared token", captured["body"].get("token") == "secret")
        check("sends the CSV headers", captured["body"].get("headers") == f.CSV_COLUMNS)
        row0 = captured["body"]["rows"][0]
        check("row has one cell per column", len(row0) == len(f.CSV_COLUMNS))
        check("business name lands in the row", "Test Co" in row0)
        ok2, _ = f.publish_to_sheet(leads, "http://127.0.0.1:1/exec", token="")
        check("unreachable URL fails cleanly (no crash)", ok2 is False)
    finally:
        server.shutdown()


def test_publish_follows_redirect():
    section("Publishing handles the Apps Script redirect (302 -> JSON)")
    import json as _json
    import threading
    from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer

    state: dict = {}

    class Handler(BaseHTTPRequestHandler):
        def log_message(self, *args):
            pass

        def do_POST(self):
            length = int(self.headers.get("Content-Length", 0))
            state["body"] = _json.loads(self.rfile.read(length).decode("utf-8"))
            # Apps Script answers a POST with a 302 to a googleusercontent URL.
            self.send_response(302)
            self.send_header("Location", "/result")
            self.end_headers()

        def do_GET(self):
            reply = _json.dumps({"ok": True, "added": len(state.get("body", {}).get("rows", []))}).encode()
            self.send_response(200)
            self.send_header("Content-Type", "application/json")
            self.end_headers()
            self.wfile.write(reply)

    server = ThreadingHTTPServer(("127.0.0.1", 0), Handler)
    port = server.server_address[1]
    threading.Thread(target=server.serve_forever, daemon=True).start()
    try:
        ok, detail = f.publish_to_sheet([{"business_name": "Redir Co"}], f"http://127.0.0.1:{port}/exec")
        check("follows the 302 and reads the JSON confirmation", ok)
    finally:
        server.shutdown()


def test_dead_domain_vs_slow_site():
    section("Dead domain vs slow site (broken/HOT only when the domain is truly dead)")
    saved = f.domain_resolves
    try:
        f.domain_resolves = lambda h: False
        q, _ = f._dead_or_unknown("expired-domain.example")
        check("domain does not resolve -> broken (a real HOT rebuild lead)", q == "broken")
        f.domain_resolves = lambda h: True
        q2, _ = f._dead_or_unknown("slowbutalive.com")
        check("domain resolves but would not load -> unknown/WARM (not a false HOT)", q2 == "unknown")
    finally:
        f.domain_resolves = saved

    # Real connection failure to a resolving host (a closed local port) -> unknown.
    import socket as _sock
    s = _sock.socket()
    s.bind(("127.0.0.1", 0))
    closed_port = s.getsockname()[1]
    s.close()
    q3, _ = f.assess_website(f"http://127.0.0.1:{closed_port}/")
    check("closed port on a live host -> unknown, not a false HOT", q3 == "unknown")

    # A domain that cannot resolve at all (.invalid is reserved, never resolves).
    q4, _ = f.assess_website("https://no-such-lead-finder-xyz.invalid/")
    check("a non-resolving domain -> broken (HOT rebuild lead)", q4 == "broken")


def test_drop_unreachable():
    section("Dropping unworkable leads (no phone AND no email)")
    leads = [
        {"business_name": "Callable", "phone": "555-1", "email": ""},
        {"business_name": "Emailable", "phone": "", "email": "info@x.com"},
        {"business_name": "Both", "phone": "555-2", "email": "hi@y.com"},
        {"business_name": "Unworkable", "phone": "", "email": ""},
    ]
    kept, dropped = f.drop_unreachable(leads)
    check("drops the one with no phone and no email", dropped == 1)
    check("keeps phone-only, email-only, and both",
          [l["business_name"] for l in kept] == ["Callable", "Emailable", "Both"])
    kept2, dropped2 = f.drop_unreachable(leads, enabled=False)
    check("disabled keeps everything", dropped2 == 0 and len(kept2) == 4)


def test_end_to_end_quality_pipeline():
    section("End to end: junk out, real leads in (full pipeline, no network)")
    saved = f.domain_resolves
    try:
        # goodmail.com "resolves"; any .invalid domain does not.
        f.domain_resolves = lambda h: not h.endswith(".invalid")
        raw = [
            # HOT no-site lead with a phone -> keep
            {"title": "Ace Plumbing", "categoryName": "Plumber", "phone": "555-1",
             "reviewsCount": 30, "totalScore": 4.8, "placeId": "p1"},
            # national chain -> dropped at the skip stage
            {"title": "Hilton Garden Inn", "categoryName": "Hotel", "phone": "555-2", "placeId": "p2"},
            # contains "hilton" but is a real local -> must survive (boundary match)
            {"title": "Chilton's Auto Repair", "categoryName": "Auto repair shop", "phone": "555-3",
             "reviewsCount": 12, "totalScore": 4.6, "placeId": "p3"},
            # no phone, no email -> unworkable, dropped
            {"title": "Ghost Business", "categoryName": "Consultant", "placeId": "p4"},
            # only handle is an email on a dead domain -> blanked, then dropped as unreachable
            {"title": "Deadmail Cafe", "categoryName": "Cafe", "reviewsCount": 5, "totalScore": 4.1,
             "placeId": "p5", "emails": ["info@deadmail.invalid"]},
            # email-only lead on a live domain -> keep (proves email-only leads survive)
            {"title": "Emailonly Roofing", "categoryName": "Roofer", "reviewsCount": 8, "totalScore": 4.4,
             "placeId": "p6", "emails": ["hi@goodmail.com"]},
            # modern site, an "ok" COOL lead -> keep
            {"title": "Modern Dental", "categoryName": "Dentist", "website": "https://modern.co", "phone": "555-7",
             "reviewsCount": 200, "totalScore": 4.9, "placeId": "p7"},
        ]
        records = [r for r in raw if not f.should_skip(r.get("title", ""), r.get("categoryName", ""))]
        names_after_skip = [r["title"] for r in records]
        check("chain dropped at the skip stage", "Hilton Garden Inn" not in names_after_skip)
        check("boundary-saved local kept at the skip stage", "Chilton's Auto Repair" in names_after_skip)

        leads = [f.to_lead(r, {"https://modern.co": ("modern", [])}) for r in records]
        leads = f.dedupe(leads)
        leads = f.sort_leads(leads)
        f.verify_email_domains(leads)
        leads, unreachable = f.drop_unreachable(leads)
        names = [l["business_name"] for l in leads]

        check("no-contact business dropped as unworkable", "Ghost Business" not in names)
        check("dead-domain-only lead dropped as unreachable", "Deadmail Cafe" not in names)
        check("real HOT lead survives", "Ace Plumbing" in names)
        check("boundary-saved local survives end to end", "Chilton's Auto Repair" in names)
        check("email-only lead on a live domain survives", "Emailonly Roofing" in names)
        check("modern site kept as an 'ok' COOL lead", "Modern Dental" in names)
        check("HOT sorts to the top", leads[0]["lead_heat"] == "HOT")
        check("exactly the four real leads remain", len(leads) == 4)
    finally:
        f.domain_resolves = saved


def test_send_emails():
    section("Email sending + follow-ups + warm-up (send_emails.py, offline)")
    import tempfile
    from datetime import date
    import send_emails as se

    cfg = {
        "key": "re_test", "from": "Tester <me@example.com>", "reply_to": "me@example.com",
        "video": "https://video.example.com/demo", "name": "Tester", "phone": "",
    }
    html = se.render_html(se.TEMPLATES[0]["body"], cfg)
    text = se.render_text(se.TEMPLATES[0]["body"], cfg)
    check("six first-touch templates exist", len(se.TEMPLATES) == 6)
    check("five follow-ups exist", len(se.FOLLOWUPS) == 5)
    check("the one video link is a clickable anchor", '<a href="https://video.example.com/demo">' in html)
    check("exactly one link in the email", html.count("<a ") == 1)
    check("no placeholders left in html", not any(p in html for p in ("[video link]", "[name]", "[phone]")))
    check("empty phone leaves no [phone] and no trailing blank", "[phone]" not in text and not text.endswith("\n"))

    check("five monthly nurtures exist", len(se.NURTURES) >= 1)
    check("warm-up starts slow: day 1 cap is 5", se._cap_for_day(1) == 5)
    check("warm-up adds ~2 a day: day 6 cap is 15", se._cap_for_day(6) == 15)
    check("warm-up day 15 cap is 33", se._cap_for_day(15) == 33)
    check("warm-up reaches 40 by ~day 19", se._cap_for_day(19) == 40)
    check("warm-up tops out at 40 for one domain", se._cap_for_day(999) == 40)
    os.environ["OUTREACH_DAILY_MAX"] = "60"
    check("OUTREACH_DAILY_MAX raises the ceiling deliberately", se._cap_for_day(999) == 60)
    os.environ["OUTREACH_DAILY_MAX"] = "500"
    check("ceiling never exceeds Resend's 100/day", se._cap_for_day(999) == 100)
    os.environ["OUTREACH_DAILY_MAX"] = "nonsense"
    check("bad OUTREACH_DAILY_MAX falls back to 40", se._cap_for_day(999) == 40)
    os.environ.pop("OUTREACH_DAILY_MAX", None)

    T = date(2026, 1, 20)

    def da(status, contacted_on, email="a@x.com"):
        return se.due_action({"email": email, "status": status, "contacted_on": contacted_on}, T)

    check("blank status + email -> initial", da("", "")[0] == "initial")
    check("no email -> nothing", da("", "", email="") is None)
    check("replied -> sequence stops", da("Replied", "2026-01-01 09:00") is None)
    check("removed -> sequence stops", da("Removed", "2026-01-01 09:00") is None)
    check("unsubscribed -> sequence stops", da("Unsubscribed", "2026-01-01 09:00") is None)
    check("Contacted 3+ days -> follow-up 1", da("Contacted", "2026-01-10 09:00") == ("followup", 0, "Follow-up 1"))
    check("Contacted too recent -> nothing", da("Contacted", "2026-01-19 09:00") is None)
    check("Follow-up 4 aged 30+ days -> follow-up 5", da("Follow-up 4", "2025-12-01 09:00") == ("followup", 4, "Follow-up 5"))
    check("Follow-up 5 aged 30+ days -> monthly nurture", da("Follow-up 5", "2025-12-01 09:00") == ("nurture", -1, "Nurturing"))
    check("Nurturing 30+ days -> another monthly nurture", da("Nurturing", "2025-12-15 09:00") == ("nurture", -1, "Nurturing"))
    check("Nurturing too recent -> nothing", da("Nurturing", "2026-01-05 09:00") is None)

    temps: list = []

    def fresh_state():
        fh = tempfile.NamedTemporaryFile("w", suffix=".json", delete=False)
        fh.write("{}")
        fh.close()
        temps.append(fh.name)
        return fh.name

    saved_send, saved_cfg = se.send_one, se.load_config
    sent: list = []
    se.load_config = lambda: cfg
    se.send_one = lambda c, to, subject, html, text: sent.append((to, subject)) or "fake-id"
    try:
        leads = [
            {"business_name": "A", "email": "a@x.com", "status": "", "contacted_on": ""},
            {"business_name": "B", "email": "b@x.com", "status": "", "contacted_on": ""},
            {"business_name": "C", "email": "", "status": "", "contacted_on": ""},
            {"business_name": "D", "email": "d@x.com", "status": "Contacted", "contacted_on": "2026-01-10 09:00"},
            {"business_name": "E", "email": "e@x.com", "status": "Replied", "contacted_on": "2026-01-10 09:00"},
            {"business_name": "F", "email": "f@x.com", "status": "Follow-up 5", "contacted_on": "2025-12-01 09:00"},
        ]
        n = se.send_outreach([dict(x) for x in leads], today=T, dry_run=True, delay=0, state_file=fresh_state(), log=lambda *_: None)
        check("dry run sends nothing", n == 0 and sent == [])

        work = [dict(x) for x in leads]
        n = se.send_outreach(work, today=T, delay=0, state_file=fresh_state(), log=lambda *_: None)
        check("sends A,B (initial), D (follow-up), F (nurture) = 4", n == 4)
        check("skips the no-email lead", "" not in [t[0] for t in sent])
        check("skips the replied lead", "e@x.com" not in [t[0] for t in sent])
        check("first-touch rotates onto different templates", sent[0][1] != sent[1][1])
        check("A tagged Contacted", work[0]["status"] == "Contacted")
        check("D advanced to Follow-up 1", work[3]["status"] == "Follow-up 1")
        check("F advanced to Nurturing (monthly)", work[5]["status"] == "Nurturing")
        check("emailed lead gets today's timestamp", work[0]["contacted_on"].startswith("2026-01-20"))
        check("replied lead left untouched", work[4]["status"] == "Replied")

        many = [{"business_name": f"L{i}", "email": f"l{i}@x.com", "status": "", "contacted_on": ""} for i in range(25)]
        shared = fresh_state()
        sent.clear()
        n = se.send_outreach([dict(x) for x in many], today=T, delay=0, state_file=shared, log=lambda *_: None)
        check("warm-up day 1 caps the run at 5", n == 5)
        sent.clear()
        n2 = se.send_outreach([dict(x) for x in many], today=T, delay=0, state_file=shared, log=lambda *_: None)
        check("same-day cap is remembered across runs (0 left)", n2 == 0)

        sent.clear()
        n = se.send_outreach([dict(x) for x in many], today=T, limit=10, delay=0, state_file=fresh_state(), log=lambda *_: None)
        check("--limit overrides the warm-up cap (above the auto 5)", n == 10)

        se.load_config = saved_cfg  # restore so missing-config raises
        os.environ.pop("RESEND_API_KEY", None)
        raised = False
        try:
            se.send_outreach([dict(x) for x in leads], today=T, state_file=fresh_state(), log=lambda *_: None)
        except se.ConfigError:
            raised = True
        check("missing Resend config raises ConfigError", raised)
    finally:
        se.send_one, se.load_config = saved_send, saved_cfg
        for p in temps:
            try:
                os.unlink(p)
            except OSError:
                pass


def main() -> int:
    print("Running find_leads offline tests (no Apify key, no network) ...")
    test_get_tokens()
    test_is_exhausted_error()
    test_token_pool()
    test_rotation_end_to_end()
    test_regions()
    test_skip_list()
    test_email_picking()
    test_email_verification()
    test_drop_unreachable()
    test_dead_domain_vs_slow_site()
    test_owner_and_socials()
    test_website_offline_branches()
    test_website_quality_mock()
    test_website_http_status_branches()
    test_scoring_units()
    test_to_lead()
    test_dedupe_and_sort()
    test_reachability()
    test_build_actor_input()
    test_run_field()
    test_slug_and_output()
    test_min_reviews_filter()
    test_write_csv_roundtrip()
    test_sheet_dedupe()
    test_publish_to_sheet()
    test_publish_follows_redirect()
    test_end_to_end_quality_pipeline()
    test_send_emails()

    print(f"\n{'=' * 44}")
    total = PASS + FAIL
    if FAIL == 0:
        print(f"All {total} checks passed.")
        return 0
    print(f"{PASS}/{total} passed, {FAIL} FAILED.")
    return 1


if __name__ == "__main__":
    raise SystemExit(main())
