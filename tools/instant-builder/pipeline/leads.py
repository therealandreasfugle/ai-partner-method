"""
leads.py

Reads leads straight from the Google Sheet the scraper and CRM already use, and
maps them into the shape the generator expects.

There is deliberately no form in this path. Everything comes from the scrape, so
a lead needs nothing from the business owner before we can build their site.
Fields the form used to supply (what work they want, what customers worry about)
are left blank and the generator infers sensible ones from the trade.
"""

import json
import os
import re
import urllib.request
from pathlib import Path

BROWSER_UA = (
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 "
    "(KHTML, like Gecko) Chrome/125.0 Safari/537.36"
)


def sheet_url():
    """The Apps Script web app the CRM already talks to."""
    env = Path(os.environ.get("LEAD_SCRAPER_ENV", Path.home() / ".env"))
    if env.is_file():
        for line in env.read_text().splitlines():
            if line.startswith("SHEETS_WEBHOOK_URL="):
                return line.split("=", 1)[1].strip().strip('"').strip("'")
    return os.environ.get("SHEETS_WEBHOOK_URL", "")


def fetch_leads(timeout=45):
    """Every lead in the sheet, as the CRM sees them."""
    url = sheet_url()
    if not url:
        raise SystemExit("no SHEETS_WEBHOOK_URL found in local-lead-finder/.env")
    request = urllib.request.Request(url + "?crm=1", headers={"User-Agent": BROWSER_UA})
    # The Apps Script endpoint 302s to a googleusercontent URL; urllib follows it.
    with urllib.request.urlopen(request, timeout=timeout) as response:
        payload = json.loads(response.read())
    return payload.get("leads", [])


def _clean(value):
    return re.sub(r"\s+", " ", str(value or "")).strip()


def to_answers(lead, agency_name=""):
    """
    Maps one sheet row into the generator's answers shape.

    Only scraped facts are passed. The opinion fields stay empty on purpose: the
    generator treats an empty value as "infer something sensible for this trade"
    rather than inventing a quote from an owner we have never spoken to.
    """
    town = _clean(lead.get("city"))
    areas = town
    return {
        # Facts, printed on the page.
        "business_name": _clean(lead.get("business")),
        "trade": _clean(lead.get("category")) or "local business",
        "town": town,
        "areas": areas,
        "owner_name": _clean(lead.get("owner_name")),
        "email": _clean(lead.get("email")),
        "phone": _clean(lead.get("phone")),
        "address": _clean(lead.get("address")),
        "postal_code": _clean(lead.get("postal_code")),
        "region": _clean(lead.get("region")),
        "google_maps_url": _clean(lead.get("google_maps_url")),
        "rating": _clean(lead.get("rating")),
        "reviews": _clean(lead.get("reviews")),
        "facebook": _clean(lead.get("facebook")),
        "instagram": _clean(lead.get("instagram")),
        # Angle-setting only, never printed verbatim.
        "website": _clean(lead.get("website")),
        "website_status": _clean(lead.get("website_status")),
        "why_reach_out": _clean(lead.get("why")),
        # Bookkeeping so we can write back to the right row.
        "_row": lead.get("row"),
        "agency_name": agency_name,
    }


def is_sendable(answers):
    """A lead we can actually build and email. Everything else needs another route."""
    return bool(answers.get("business_name")) and bool(answers.get("email"))


def summarise(leads):
    total = len(leads)
    with_email = sum(1 for l in leads if _clean(l.get("email")))
    return {
        "total": total,
        "with_email": with_email,
        "without_email": total - with_email,
    }
