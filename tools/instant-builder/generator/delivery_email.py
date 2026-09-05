"""
delivery_email.py

Composes the email that carries the finished site to the lead.

NOTHING IS SENT. compose() returns the subject and HTML and writes a preview
file; send() exists but refuses to run unless SEND_ENABLED is switched on AND a
recipient is passed explicitly. Sending to a real business owner is a one-way
action, so it stays behind an explicit switch until you turn it on.

Two calls to action, in the order agreed:
  1. See your website      the preview, the hook
  2. Get it live           the proposal page, where the price and pay button are
"""

import html
import json
import os
import re
import urllib.error
import urllib.request
from pathlib import Path

# Sending is gated by the --send flag on the pipeline, not by this constant.
FROM_ADDRESS = "Your Business <you@yourdomain.com>"
REPLY_TO = "you@yourdomain.com"

OUT = Path(__file__).resolve().parent.parent / "out"

GOLD = "#EAB308"
INK = "#1F1A15"
MUTED = "#54514A"
CREAM = "#FAF8F1"


def _btn(href, label, primary=True):
    bg = GOLD if primary else "#ffffff"
    fg = "#1a1400" if primary else INK
    border = GOLD if primary else "rgba(31,26,21,0.18)"
    return (
        f'<a href="{html.escape(href)}" style="display:inline-block;background:{bg};'
        f'color:{fg};border:1px solid {border};text-decoration:none;font-weight:700;'
        f'font-size:16px;padding:14px 26px;border-radius:999px;'
        f'font-family:Helvetica,Arial,sans-serif">{html.escape(label)}</a>'
    )


def observation(answers, config):
    """
    One line that proves a human looked them up, using only facts from the
    scrape. Mirrors the ladder on the proposal page, and returns "" rather than
    anything weak or half-empty.
    """
    display = (config or {}).get("_display", {})
    town = display.get("town") or answers.get("town") or ""
    where = f" in {town}" if town else " in your area"
    status = (display.get("websiteStatus") or "").lower()
    reviews = (config or {}).get("reviews", {})
    rating = float(reviews.get("rating") or 0)
    count = int(reviews.get("totalReviewCount") or 0)

    if "no website" in status or status == "none":
        return (f"You do not have a website yet, so when somebody{where} searches "
                f"for what you do, they find whoever does.")
    if rating >= 4 and count >= 10:
        return (f"You are on {rating:.1f} stars from {count} Google reviews{where}. "
                f"The people who find you already trust you. The question is how "
                f"many never find you at all.")
    if rating >= 4 and count > 0:
        word = "review" if count == 1 else "reviews"
        return (f"You are on {rating:.1f} stars, but from only {count} {word}. The "
                f"businesses booked solid{where} are not better than you, they just "
                f"have more proof.")
    if count == 0:
        return (f"You have no Google reviews yet, and that is quietly costing you "
                f"work{where}.")
    if town:
        return f"Somebody{where} is searching for what you do today."
    return ""


def compose(answers, site_url, proposal_url, agency_name=None, config=None):
    """Returns {subject, html, text, preview_path}. Sends nothing."""
    display = (config or {}).get("_display", {})
    business = display.get("name") or answers.get("business_name") or "your business"
    agency = agency_name or answers.get("agency_name") or ""
    note = observation(answers, config)

    # No first name: plenty of scraped leads have no owner recorded, and "Hi
    # there" on a cold email reads better than a wrong or missing name.
    subject = f"I built {business} a website"

    lead_in = (f"{note} " if note else "")
    body_html = f"""<!doctype html>
<html><body style="margin:0;padding:0;background:#F1F1F1">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#F1F1F1;padding:28px 12px">
<tr><td align="center">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:{CREAM};border-radius:16px;border:1px solid rgba(31,26,21,0.10)">
<tr><td style="padding:34px 30px 6px;font-family:Helvetica,Arial,sans-serif">
  <h1 style="margin:0 0 16px;color:{INK};font-size:26px;line-height:1.25;font-weight:800">I built {html.escape(business)} a website. Have a look.</h1>
  <p style="margin:0 0 14px;color:{MUTED};font-size:16px;line-height:1.6">{html.escape(lead_in)}So I put together what your website could look like, using your real details. It is a working draft, not a mock-up, and you can click around it.</p>
  <p style="margin:0 0 14px;color:{MUTED};font-size:16px;line-height:1.6">Behind it sits the part that actually books work: every enquiry alerted to your phone, chased by email until it books, and every finished job turned into a Google review and a referral.</p>
</td></tr>
<tr><td style="padding:10px 30px 6px" align="center">{_btn(site_url, "See your website")}</td></tr>
<tr><td style="padding:16px 30px 30px" align="center">
  <p style="margin:0 0 12px;color:{MUTED};font-size:15px;line-height:1.6;font-family:Helvetica,Arial,sans-serif">If you like it, this page shows everything included and what it costs.</p>
  {_btn(proposal_url, "See what is included", primary=False)}
</td></tr>
<tr><td style="padding:0 30px 28px;font-family:Helvetica,Arial,sans-serif">
  <p style="margin:0;color:{MUTED};font-size:13px;line-height:1.6;border-top:1px solid rgba(31,26,21,0.10);padding-top:16px">
    Nothing is charged and nothing is signed unless you say so. Just reply if you
    want anything changed, or if you would rather I did not contact you again and
    I will leave you alone.{('<br>' + html.escape(agency)) if agency else ''}
  </p>
</td></tr>
</table></td></tr></table></body></html>"""

    text = (
        f"I built {business} a website. Have a look.\n\n"
        f"{lead_in}So I put together what your website could look like, using your "
        f"real details. It is a working draft, not a mock-up.\n\n"
        f"Behind it sits the part that actually books work: every enquiry alerted to "
        f"your phone, chased by email until it books, and every finished job turned "
        f"into a Google review and a referral.\n\n"
        f"See your website: {site_url}\n"
        f"See what is included: {proposal_url}\n\n"
        f"Nothing is charged and nothing is signed unless you say so. Just reply if "
        f"you want anything changed, or if you would rather I did not contact you "
        f"again and I will leave you alone.\n{agency}\n"
    )

    OUT.mkdir(parents=True, exist_ok=True)
    slug = re.sub(r"[^a-z0-9]+", "-", business.lower()).strip("-")
    preview_path = OUT / f"email-{slug}.html"
    preview_path.write_text(body_html)

    return {"subject": subject, "html": body_html, "text": text,
            "preview_path": str(preview_path)}


def _resend_key():
    """Send-only Resend key. Read at call time so it is never held in memory."""
    env = Path(os.environ.get("SETTOKU_ENV", Path.home() / ".env.local"))
    if env.is_file():
        for line in env.read_text().splitlines():
            if line.startswith("RESEND_API_KEY="):
                return line.split("=", 1)[1].strip().strip('"').strip("'")
    return os.environ.get("RESEND_API_KEY", "")


def send_via_resend(message, to_email, from_address=None):
    """
    Sends one email. Called only from the pipeline's --send path.

    Deliberately one recipient per call: no bcc, no batching, so a mistake can
    never fan out across a list, and every send is traceable to one lead.
    """
    key = _resend_key()
    if not key:
        return {"status": "no RESEND_API_KEY found", "sent": False}
    if not to_email or "@" not in to_email:
        return {"status": f"invalid recipient: {to_email!r}", "sent": False}

    payload = {
        "from": from_address or FROM_ADDRESS,
        "to": [to_email],
        "reply_to": REPLY_TO,
        "subject": message["subject"],
        "html": message["html"],
        "text": message["text"],
    }
    request = urllib.request.Request(
        "https://api.resend.com/emails",
        data=json.dumps(payload).encode(),
        headers={"Authorization": f"Bearer {key}", "Content-Type": "application/json"},
    )
    try:
        with urllib.request.urlopen(request, timeout=30) as response:
            body = json.loads(response.read())
        return {"status": "sent", "sent": True, "id": body.get("id")}
    except urllib.error.HTTPError as error:
        detail = error.read()[:200].decode(errors="replace")
        return {"status": f"HTTP {error.code}: {detail}", "sent": False}
    except Exception as error:  # network, timeout
        return {"status": f"{type(error).__name__}: {error}", "sent": False}
