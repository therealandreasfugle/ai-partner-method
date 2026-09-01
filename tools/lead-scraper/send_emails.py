#!/usr/bin/env python3
"""
Send the outreach emails through Resend, and run the follow-up sequence.

This is the preferred outreach path (see RESEND-SETUP.md). You bring your own
Resend API key and your own domain; the tool emails each lead one of six rotating
first-touch templates, then follows up to five more times if they do not reply (a
bigger gap each time), and after that a gentle email once a month to stay top of mind.

Every email carries ONE link, your video demo, and the whole message is built to
get the lead to book a call.

How it decides what to send, each time it runs, per lead:
  - never emailed (blank status)      -> a first-touch template, tag "Contacted"
  - "Contacted" and 3+ days old       -> follow-up 1, tag "Follow-up 1"
  - "Follow-up 1" and 7+ days old     -> follow-up 2, tag "Follow-up 2"
  - "Follow-up 2" and 14+ days old    -> follow-up 3, tag "Follow-up 3"
  - "Follow-up 3" and 21+ days old    -> follow-up 4, tag "Follow-up 4"
  - "Follow-up 4" and 30+ days old    -> follow-up 5, tag "Follow-up 5"
  - "Follow-up 5"/"Nurturing", 30+ days -> a monthly nurture email, tag "Nurturing"
  - anything else (Replied, Removed, ...) -> nothing (the sequence stops)
So mark a lead "Replied" or "Removed" (by hand, or via the Google Sheet reply-watcher,
which now also removes anyone who asks to be taken off) and they drop out for good.

Warm-up is automatic and slow, following cold-email best practice: a new domain looks
like spam if it blasts, so the daily cap starts at 5 and adds about 2 a day, reaching
about 40 a day in roughly two and a half weeks. Kept in .outreach_warmup.json.

Run it right after a scrape via find_leads.py --email, or on its own, and re-run it
every day (or on a schedule) so the follow-ups go out on time:

    python3 send_emails.py leads/local-clients-manchester-2026-07-15.csv
    python3 send_emails.py leads/....csv --dry-run     # show, do not send
    python3 send_emails.py leads/....csv --limit 40    # override today's cap
"""
from __future__ import annotations

import argparse
import csv
import json
import os
import sys
import time
import urllib.error
import urllib.request
from datetime import date, datetime
from typing import Any, Callable, Optional

try:
    from dotenv import load_dotenv
except ImportError:  # optional, so the tool still runs from real env vars
    def load_dotenv(*_a: Any, **_k: Any) -> None:
        return None

load_dotenv()

HERE = os.path.dirname(os.path.abspath(__file__))
RESEND_ENDPOINT = "https://api.resend.com/emails"
STATE_FILE = os.path.join(HERE, ".outreach_warmup.json")

# api.resend.com sits behind Cloudflare, which returns "error code: 1010" to the
# default Python-urllib User-Agent (it reads as a bot). A normal browser UA gets
# through. Same fix the site checks and the Make API need.
BROWSER_UA = (
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 "
    "(KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36"
)

# Automatic warm-up, following cold-email best practice: start low and add a little
# each day so a new domain earns a good reputation instead of looking like spam. The
# cap begins at WARMUP_START on day 1 and rises WARMUP_STEP a day up to WARMUP_CEILING,
# which it reaches in about two and a half weeks. To send more than that, warm a second
# domain rather than push one harder.
WARMUP_START = 5      # emails allowed on day 1
WARMUP_STEP = 2       # extra emails allowed each day after that
DAILY_CEILING = 100   # Resend free plan hard limit: 100 a day, 3000 a month


def _warmup_ceiling() -> int:
    """Most a single warmed domain sends per day. Defaults to 40; once the
    dashboard shows healthy stats at 40 (low bounces, no spam complaints), raise
    it gradually with OUTREACH_DAILY_MAX in .env. Hard-capped at Resend's 100."""
    try:
        value = int(os.getenv("OUTREACH_DAILY_MAX", "40"))
    except ValueError:
        value = 40
    return max(1, min(value, DAILY_CEILING))

# Seconds between sends, so a run trickles out instead of bursting.
SEND_DELAY_DEFAULT = 2.0

# The follow-up sequence: (status a lead must currently have, days that must have
# passed since its last email, status to move it to, which follow-up template).
# The gaps grow (3, 7, 14, 21, 30) so each nudge is spaced further out.
INITIAL_STATUS = "Contacted"
FOLLOWUP_STAGES = [
    ("Contacted", 3, "Follow-up 1", 0),
    ("Follow-up 1", 7, "Follow-up 2", 1),
    ("Follow-up 2", 14, "Follow-up 3", 2),
    ("Follow-up 3", 21, "Follow-up 4", 3),
    ("Follow-up 4", 30, "Follow-up 5", 4),
]

# Statuses that end the sequence for good (never email them again). "Removed" is set
# automatically when a lead replies asking to be taken off (see the reply-watcher).
_STOP_STATUSES = {"replied", "removed", "unsubscribed", "not interested", "won"}

# The six first-touch templates. Copy mirrors EMAIL-TEMPLATES.md; edit both
# together. Keep at least six so consecutive leads never get the same message.
# Placeholders [video link] [name] [phone] are filled from your .env.
TEMPLATES: list[dict[str, str]] = [
    {
        "subject": "did u take a look at this yet?",
        "body": """Hi there,

Made you a website, and recorded a quick video walking you through it. Here it is:
[video link]

It loads fast, works on mobile, and looks like somewhere people trust, so more of your visitors turn into calls. It can also text and email every new lead the second they enquire, so you are first to reply and win the job. No monthly hosting fees either.

If you like what you see, there is a link under the video to book a quick call, or just hit reply.

[name]
[phone]""",
    },
    {
        "subject": "made you something",
        "body": """Hi there,

I put a website together for your business and did a short video showing you around it:
[video link]

It is quick on any phone and built to look the part, so more of the people who find you actually get in touch. Every new enquiry gets an instant text and email back too, so you reply first while they are still keen. No ongoing hosting fees to worry about.

If it looks good, grab a time using the link under the video, or reply here.

[name]
[phone]""",
    },
    {
        "subject": "this could be making you money",
        "body": """Hi there,

Built you a sample website and recorded a quick walkthrough. Take a look:
[video link]

It loads fast, looks great on mobile, and builds instant trust, so visitors turn into calls instead of leaving. It also replies to every new lead by text and email the moment they come in, so you beat the competition to the phone. No monthly hosting fees either.

Want it live? Book a quick call from the link under the video, or just reply.

[name]
[phone]""",
    },
    {
        "subject": "your new website (quick video)",
        "body": """Hi there,

Made you a website. Here is a two minute video showing it off:
[video link]

It is fast, mobile-friendly, and looks trustworthy, so more visitors pick up the phone. Better still, every new lead gets an automatic text and email the moment they reach out, so you respond first and win the job. Plus no crazy hosting fees.

Like what you see? There is a booking link right under the video, or reply and I will send you a time.

[name]
[phone]""",
    },
    {
        "subject": "thought this would be of interest",
        "body": """Hi there,

I built a website for your business and put together a short video tour:
[video link]

Quick to load, easy on a phone, and built to look trustworthy, so more people who land on it get in touch. It also fires an instant text and email to every new lead, so you follow up in seconds and beat slower competitors. And no ongoing hosting fees.

If you like it, book a quick call from the link under the video, or just reply.

[name]
[phone]""",
    },
    {
        "subject": "made you a website",
        "body": """Hi there,

Put this together for you and recorded a quick video so you can see it in action:
[video link]

It loads fast, works on mobile, and looks like a business people trust, so more visitors become customers. Every new lead also gets an instant text and email, so you reply first while they are still deciding. No crazy monthly hosting fees, either.

Want it? Book a quick call using the link under the video, or hit reply.

[name]
[phone]""",
    },
]

# The five follow-ups, sent on the growing schedule above. One link each: the video.
FOLLOWUPS: list[dict[str, str]] = [
    {
        "subject": "quick one about the video",
        "body": """Hi there,

Just checking you got the video I sent of the website I made you:
[video link]

No pressure at all. If it is useful, the quickest way to get it live is a short call, the booking link is under the video, or just reply here.

[name]
[phone]""",
    },
    {
        "subject": "did the video make sense?",
        "body": """Hi there,

Wanted to make sure the walkthrough I sent came through okay:
[video link]

If you have two minutes, book a quick call from the link under it and I will get it live for you. Or reply with any questions.

[name]
[phone]""",
    },
    {
        "subject": "should I close this off?",
        "body": """Hi there,

I have not heard back, so I will assume the timing is not right and leave it here.

If you did still want it, the video of your site is ready to watch:
[video link]

A quick call is the easiest way to get it live, the link is under the video.

[name]
[phone]""",
    },
    {
        "subject": "still thinking it over?",
        "body": """Hi there,

No rush on my end, I just did not want you to miss it. The website I made you is still ready to see in the video:
[video link]

If it is helpful, book a two minute call from the link under it and I will take it from there.

[name]
[phone]""",
    },
    {
        "subject": "closing your file",
        "body": """Hi there,

I am tidying up my list and about to close this out.

If you ever want it, the website is still built and the video is here:
[video link]

A quick call gets it live whenever suits you, the booking link is under the video. All the best with the business.

[name]
[phone]""",
    },
]

# After the five follow-ups, one gentle email a month to stay top of mind, until the
# lead replies or asks to be removed. Rotated so it is not the same note every month.
NURTURE_STATUS = "Nurturing"
NURTURE_GAP = 30
NURTURES: list[dict[str, str]] = [
    {
        "subject": "still here if you want it",
        "body": """Hi there,

Not chasing, just keeping you on my radar. The website I built for you is still ready whenever the timing is right:
[video link]

If it is ever useful, a quick call gets it live. All the best.

[name]
[phone]""",
    },
    {
        "subject": "quick thought for your business",
        "body": """Hi there,

Every month I watch local businesses win jobs just by replying faster than the competition. The site I made you does that on its own, an instant text and email to every new lead:
[video link]

Happy to walk you through it on a quick call whenever suits.

[name]
[phone]""",
    },
    {
        "subject": "your website is still ready",
        "body": """Hi there,

Just a friendly note that the website I put together for you is still here:
[video link]

No rush at all. If you want it live, a two minute call does it.

[name]
[phone]""",
    },
]


class ConfigError(Exception):
    """Raised when the Resend settings in .env are missing or incomplete."""


def load_config() -> dict[str, str]:
    """Read Resend settings from the environment, or raise ConfigError listing
    exactly what is missing and where to fix it."""
    key = os.getenv("RESEND_API_KEY", "").strip()
    sender = os.getenv("RESEND_FROM", "").strip()
    video = os.getenv("OUTREACH_VIDEO_LINK", "").strip()
    name = os.getenv("OUTREACH_SENDER_NAME", "").strip()
    phone = os.getenv("OUTREACH_SENDER_PHONE", "").strip()
    reply_to = os.getenv("RESEND_REPLY_TO", "").strip()

    missing = []
    if not key:
        missing.append("RESEND_API_KEY (your key from resend.com)")
    if not sender:
        missing.append('RESEND_FROM (e.g. "Your Name <you@yourdomain.com>")')
    if not video:
        missing.append("OUTREACH_VIDEO_LINK (the one link in every email: your video demo)")
    if not name:
        missing.append("OUTREACH_SENDER_NAME (the name you sign off with)")
    if missing:
        raise ConfigError(
            "these email settings are missing from your .env: "
            + "; ".join(missing)
            + ". See RESEND-SETUP.md."
        )
    if "@" not in sender:
        raise ConfigError(
            'RESEND_FROM must include your email on your verified domain, '
            'e.g. "Your Name <you@yourdomain.com>". See RESEND-SETUP.md.'
        )

    return {
        "key": key,
        "from": sender,
        "reply_to": reply_to or sender,
        "video": video,
        "name": name,
        "phone": phone,
    }


def _fill(body: str, cfg: dict[str, str]) -> str:
    # An empty phone leaves a blank line where [phone] was; render_text collapses it.
    return (
        body.replace("[video link]", cfg["video"])
        .replace("[name]", cfg["name"])
        .replace("[phone]", cfg["phone"])
    )


def render_text(body: str, cfg: dict[str, str]) -> str:
    filled = _fill(body, cfg)
    out: list[str] = []
    for ln in filled.split("\n"):
        if ln.strip() == "" and out and out[-1].strip() == "":
            continue
        out.append(ln)
    return "\n".join(out).strip()


def render_html(body: str, cfg: dict[str, str]) -> str:
    """Turn a filled template into clean HTML: blank lines become paragraphs, and
    the one video link becomes a clickable anchor."""
    text = render_text(body, cfg)
    paras = [blk.strip() for blk in text.split("\n\n") if blk.strip()]
    html_parts = []
    for para in paras:
        lines = []
        for line in para.split("\n"):
            if line == cfg["video"]:
                lines.append(f'<a href="{line}">{line}</a>')
            else:
                lines.append(line)
        html_parts.append("<p>" + "<br>".join(lines) + "</p>")
    return (
        '<div style="font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,'
        'sans-serif;font-size:15px;line-height:1.5;color:#222;">'
        + "".join(html_parts)
        + "</div>"
    )


# --------------------------------------------------------------------------- #
# What to send a given lead today
# --------------------------------------------------------------------------- #

def _parse_day(value: str) -> Optional[date]:
    value = (value or "").strip()
    if not value:
        return None
    try:
        return datetime.strptime(value[:10], "%Y-%m-%d").date()
    except ValueError:
        return None


def due_action(lead: dict[str, Any], today: date) -> Optional[tuple[str, int, str]]:
    """Decide what (if anything) this lead is due for right now.

    Returns (kind, template_index, next_status), where kind is "initial" or
    "followup", or None if the lead should get nothing today. For "initial" the
    template_index is -1 (the caller rotates the six first-touch templates).
    """
    if not lead.get("email", "").strip():
        return None
    status = (lead.get("status") or "").strip()
    if not status:
        return ("initial", -1, INITIAL_STATUS)
    if status.lower() in _STOP_STATUSES:
        return None
    for cur, gap, nxt, idx in FOLLOWUP_STAGES:
        if status.lower() == cur.lower():
            last = _parse_day(lead.get("contacted_on", ""))
            if last is None:
                return None
            if (today - last).days >= gap:
                return ("followup", idx, nxt)
            return None
    # After the last follow-up, one nurture email a month, indefinitely.
    if status.lower() in ("follow-up 5", NURTURE_STATUS.lower()):
        last = _parse_day(lead.get("contacted_on", ""))
        if last is not None and (today - last).days >= NURTURE_GAP:
            return ("nurture", -1, NURTURE_STATUS)
        return None
    return None  # unknown/custom status -> leave it alone


# --------------------------------------------------------------------------- #
# Automatic warm-up state (how many we may still send today)
# --------------------------------------------------------------------------- #

def _load_state(path: str) -> dict[str, Any]:
    try:
        with open(path, encoding="utf-8") as fh:
            data = json.load(fh)
            return data if isinstance(data, dict) else {}
    except (OSError, ValueError):
        return {}


def _save_state(path: str, state: dict[str, Any]) -> None:
    try:
        with open(path, "w", encoding="utf-8") as fh:
            json.dump(state, fh)
    except OSError:
        pass  # a warm-up file we cannot write is not worth crashing a send over


def _cap_for_day(day_number: int) -> int:
    day = max(1, day_number)
    return min(WARMUP_START + WARMUP_STEP * (day - 1), _warmup_ceiling())


def warmup_status(state: dict[str, Any], today: date) -> tuple[int, int, int]:
    """Returns (day_number, cap_today, already_sent_today)."""
    first = _parse_day(state.get("first_send", ""))
    day_number = ((today - first).days + 1) if first else 1
    sent_today = int(state.get("daily", {}).get(today.isoformat(), 0))
    return day_number, _cap_for_day(day_number), sent_today


def _record_send(state: dict[str, Any], today: date) -> None:
    today_str = today.isoformat()
    state.setdefault("first_send", today_str)
    daily = state.setdefault("daily", {})
    daily[today_str] = int(daily.get(today_str, 0)) + 1


def send_one(cfg: dict[str, str], to: str, subject: str, html: str, text: str) -> str:
    """Send one email through Resend. Returns the Resend message id on success;
    raises RuntimeError with a readable reason on failure."""
    payload = json.dumps({
        "from": cfg["from"],
        "to": [to],
        "reply_to": cfg["reply_to"],
        "subject": subject,
        "html": html,
        "text": text,
    }).encode("utf-8")
    request = urllib.request.Request(
        RESEND_ENDPOINT,
        data=payload,
        headers={
            "Authorization": f"Bearer {cfg['key']}",
            "Content-Type": "application/json",
            "User-Agent": BROWSER_UA,
        },
        method="POST",
    )
    try:
        with urllib.request.urlopen(request, timeout=30) as resp:
            out = json.loads(resp.read().decode("utf-8"))
            return out.get("id", "")
    except urllib.error.HTTPError as exc:
        detail = exc.read().decode("utf-8", errors="ignore")
        raise RuntimeError(f"Resend returned HTTP {exc.code}: {detail}") from exc
    except (urllib.error.URLError, TimeoutError, OSError) as exc:
        raise RuntimeError(f"could not reach Resend ({exc})") from exc


def send_outreach(
    leads: list[dict[str, Any]],
    *,
    today: Optional[date] = None,
    limit: Optional[int] = None,
    delay: float = SEND_DELAY_DEFAULT,
    dry_run: bool = False,
    state_file: str = STATE_FILE,
    log: Callable[[str], None] = print,
) -> int:
    """Send every email due today (first touches and follow-ups), newest-cold
    first, up to the automatic warm-up cap.

    Mutates each emailed lead in place: status and contacted_on move forward.
    Returns the number actually sent (0 on a dry run). Raises ConfigError if the
    Resend settings are not filled in.
    """
    cfg = load_config()
    today = today or date.today()

    # Work out what everyone is due for.
    initial_seen = 0
    plan: list[tuple[dict[str, Any], str, str]] = []  # (lead, subject, next_status) with body chosen below
    bodies: list[str] = []
    for lead in leads:
        action = due_action(lead, today)
        if action is None:
            continue
        kind, idx, nxt = action
        if kind == "initial":
            tpl = TEMPLATES[initial_seen % len(TEMPLATES)]
            initial_seen += 1
        elif kind == "nurture":
            tpl = NURTURES[today.month % len(NURTURES)]
        else:
            tpl = FOLLOWUPS[idx]
        plan.append((lead, tpl["subject"], nxt))
        bodies.append(tpl["body"])

    if not plan:
        log("Nothing due to send right now (no new leads, and no follow-ups are due yet).")
        return 0

    state = _load_state(state_file)
    day_number, cap_today, sent_today = warmup_status(state, today)
    if limit is not None:
        room = max(0, min(limit, DAILY_CEILING - sent_today))
    else:
        room = max(0, cap_today - sent_today)

    send_now = min(len(plan), room)
    held = len(plan) - send_now

    if dry_run:
        log(f"[dry run] {len(plan)} email(s) are due; warm-up day {day_number} allows "
            f"{cap_today} today ({sent_today} already sent), so {send_now} would go now:")
        for i in range(send_now):
            lead, subject, nxt = plan[i]
            log(f"  - {lead.get('business_name','(no name)')} <{lead['email']}>  -> {nxt}  subject: {subject!r}")
        if held:
            log(f"[dry run] {held} more would wait for a later run (daily cap).")
        return 0

    if send_now == 0:
        log(f"Warm-up day {day_number}: today's cap of {cap_today} is already used up "
            f"({sent_today} sent). {len(plan)} due; try again tomorrow or pass --limit.")
        return 0

    log(f"Warm-up day {day_number}: sending up to {cap_today} today "
        f"({sent_today} already sent). {len(plan)} due, sending {send_now} now, holding {held}.")
    now_stamp = today.strftime("%Y-%m-%d") + datetime.now().strftime(" %H:%M")
    sent = 0
    for i in range(send_now):
        lead, subject, nxt = plan[i]
        html = render_html(bodies[i], cfg)
        text = render_text(bodies[i], cfg)
        try:
            msg_id = send_one(cfg, lead["email"].strip(), subject, html, text)
        except RuntimeError as exc:
            log(f"  FAILED  {lead.get('business_name','(no name)')} <{lead['email']}>: {exc}")
            continue
        lead["status"] = nxt
        lead["contacted_on"] = now_stamp
        _record_send(state, today)
        sent += 1
        log(f"  sent    {lead.get('business_name','(no name)')} <{lead['email']}>  -> {nxt}  (id {msg_id})")
        if delay and i < send_now - 1:
            time.sleep(delay)

    _save_state(state_file, state)
    log(f"Done: {sent} sent, {send_now - sent} failed, {held} held for a later run.")
    return sent


def _run_cli(argv: Optional[list[str]] = None) -> int:
    parser = argparse.ArgumentParser(description="Send Resend outreach + follow-ups for a leads CSV.")
    parser.add_argument("csv_path", help="A leads CSV written by find_leads.py")
    parser.add_argument("--limit", type=int, default=None, help="Override today's automatic warm-up cap for this run")
    parser.add_argument("--delay", type=float, default=SEND_DELAY_DEFAULT, help=f"Seconds between sends (default {SEND_DELAY_DEFAULT})")
    parser.add_argument("--dry-run", action="store_true", help="Show what would send without sending")
    args = parser.parse_args(argv)

    try:
        with open(args.csv_path, newline="", encoding="utf-8") as fh:
            reader = csv.DictReader(fh)
            fieldnames = reader.fieldnames or []
            leads = list(reader)
    except OSError as exc:
        print(f"Could not read {args.csv_path}: {exc}", file=sys.stderr)
        return 1

    try:
        sent = send_outreach(leads, limit=args.limit, delay=args.delay, dry_run=args.dry_run)
    except ConfigError as exc:
        print(f"Email step skipped: {exc}", file=sys.stderr)
        return 1

    if sent and not args.dry_run:
        with open(args.csv_path, "w", newline="", encoding="utf-8") as fh:
            writer = csv.DictWriter(fh, fieldnames=fieldnames, extrasaction="ignore")
            writer.writeheader()
            writer.writerows(leads)
        print(f"Updated {args.csv_path}: {sent} row(s) advanced.")
    return 0


if __name__ == "__main__":
    raise SystemExit(_run_cli())
