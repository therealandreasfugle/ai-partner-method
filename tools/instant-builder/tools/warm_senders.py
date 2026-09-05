#!/usr/bin/env python3
"""
warm_senders.py

Sends a small, varied batch of real-looking mail from the sending domains to
your own inboxes, so the new domains build a history before they are pointed
at strangers.

    python3 tools/warm_senders.py                 # show the plan, send nothing
    python3 tools/warm_senders.py --send          # actually send today's batch
    python3 tools/warm_senders.py --send --count 3

Nothing sends without --send.

WHY THIS AND NOT A WARMUP TOOL
Automated warmup pools work by trading mail with strangers' inboxes and having
them auto-open and auto-reply. Google now recognises that pattern and discounts
the signals, so the pool traffic buys little and the shared reputation of the
pool can hurt. Sending to inboxes that are genuinely yours, from domains that
are genuinely yours, is smaller but real.

WHAT THIS DOES NOT COUNT AGAINST
These sends go straight through Resend, not through the builder, so they do not
appear in the emails table and the daily allowance does not know about them.
Three warmup sends on a day the builder is allowed nine means twelve left the
domain. Keep that in mind before raising either number.

THE HALF THIS CANNOT DO
Delivery is not the signal that matters. What teaches a mailbox provider to
trust a domain is what the RECIPIENT does: opening, replying, dragging out of
spam, adding the sender to contacts. This script sends. You still have to open
them and reply, and replying is worth more than everything else combined. It
prints a checklist each run so that takes a minute.

Variation is deliberate. Identical mail on a fixed schedule reads as automation,
which is the thing being avoided. Subjects, bodies, senders and recipients all
rotate, and the batch is a different shape each day.
"""

import argparse
import hashlib
import json
import random
import sys
import time
import urllib.error
import urllib.request
from datetime import date
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
ENV = ROOT.parent / "Agentic Workflows" / ".env"

BROWSER_UA = ("Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 "
              "(KHTML, like Gecko) Chrome/126.0 Safari/537.36")

# YOUR OWN inboxes. Spread across providers on purpose: Gmail, iCloud and a
# custom domain each judge a sender differently, and a domain that only ever
# reaches Gmail has only ever been judged by Gmail.
#
# Fill these in with inboxes YOU control. Never put a client's address here:
# "Re: the invoice" arriving out of nowhere is a strange thing for them to get.
SEED_INBOXES = [
    "you@gmail.com",
    "you.second@gmail.com",
    "you@icloud.com",
    "you@outlook.com",
    "you@yourdomain.com",
]

# Short, ordinary, and worth replying to. A warmup message that obviously exists
# to be warmup teaches the filter nothing; these read like the working mail that
# actually moves between colleagues.
DRAFTS = [
    ("quick one about Thursday",
     "Are we still good for Thursday? I can move it to the morning if that suits you better.\n\nLet me know either way."),
    ("the numbers from last week",
     "Had a look back at last week and the second half was noticeably stronger.\n\nWorth going through it properly when you get a minute."),
    ("that thing you mentioned",
     "I have been thinking about what you said and I reckon you are right.\n\nGoing to try it that way and see how it goes."),
    ("sending this over before I forget",
     "Wanted to get this to you while it was fresh.\n\nNothing urgent, have a look whenever."),
    ("can you check something for me",
     "When you have a spare minute, can you double check the dates on your end?\n\nI want to be sure before I confirm anything."),
    ("short update",
     "Made progress on it today, further along than I expected.\n\nWill send the rest tomorrow."),
    ("re: the invoice",
     "Think this one is settled now but flag it if you see otherwise.\n\nCheers."),
    ("does next week work",
     "Is next week any easier for you? This week has filled up more than I planned.\n\nHappy to work around you."),
    ("one more thing",
     "Forgot to mention it earlier. It is not urgent but I did not want it to slip.\n\nTalk soon."),
    ("had a thought",
     "Something occurred to me on the drive back and I think it is worth trying.\n\nWill explain properly when we speak."),
    ("all sorted",
     "That is done now, no action needed on your side.\n\nJust closing the loop."),
    ("checking you got this",
     "Sent this earlier but I am not certain it went through.\n\nA one word reply is plenty."),
]


def env():
    values = {}
    if ENV.is_file():
        for line in ENV.read_text().splitlines():
            if "=" in line and not line.strip().startswith("#"):
                key, value = line.split("=", 1)
                values[key.strip()] = value.strip().strip('"').strip("'")
    return values


def senders(values):
    """Every configured sending account, as (label, key, from address)."""
    found = []
    for index in range(1, 9):
        key = values.get(f"RESEND_KEY_{index}")
        sender = values.get(f"RESEND_FROM_{index}")
        if key and sender:
            found.append((f"pool-{index}", key, sender))
    return found


def todays_plan(pool, count, seed_text):
    """
    A different shape every day, but the same shape for a given day, so a rerun
    does not double up. Seeded by the date rather than the clock.
    """
    rng = random.Random(int(hashlib.sha256(seed_text.encode()).hexdigest()[:8], 16))
    plan = []
    inboxes = SEED_INBOXES[:]
    drafts = DRAFTS[:]
    rng.shuffle(inboxes)
    rng.shuffle(drafts)
    for index in range(count):
        label, key, sender = pool[index % len(pool)]
        to = inboxes[index % len(inboxes)]
        # Never mail an address from itself.
        if to in sender:
            to = inboxes[(index + 1) % len(inboxes)]
        subject, body = drafts[index % len(drafts)]
        plan.append({"label": label, "key": key, "from": sender, "to": to,
                     "subject": subject, "body": body})
    return plan


def send(item):
    payload = {"from": item["from"], "to": [item["to"]],
               "subject": item["subject"], "text": item["body"] + "\n\nBrett\n"}
    request = urllib.request.Request(
        "https://api.resend.com/emails", data=json.dumps(payload).encode(),
        headers={"Authorization": "Bearer " + item["key"],
                 "Content-Type": "application/json", "User-Agent": BROWSER_UA})
    try:
        with urllib.request.urlopen(request, timeout=30) as response:
            return True, json.loads(response.read()).get("id", "")
    except urllib.error.HTTPError as error:
        return False, f"HTTP {error.code}: {error.read().decode(errors='replace')[:110]}"
    except Exception as error:
        return False, str(error)[:110]


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--send", action="store_true", help="actually send; off by default")
    parser.add_argument("--count", type=int, default=3, help="messages today (default 3)")
    args = parser.parse_args()

    values = env()
    pool = senders(values)
    if not pool:
        raise SystemExit("no RESEND_KEY_n / RESEND_FROM_n pairs found in the .env")

    plan = todays_plan(pool, args.count, str(date.today()))
    print(f"{len(pool)} sending accounts, {args.count} messages planned for {date.today()}\n")
    for item in plan:
        print(f"  {item['from'][:34]:<36} -> {item['to']:<34} {item['subject']}")

    if not args.send:
        print("\nNothing was sent. Add --send when you want it to go out.")
        return 0

    print()
    sent = 0
    for index, item in enumerate(plan):
        ok, detail = send(item)
        print(f"  {'sent  ' if ok else 'FAILED'} {item['to']:<34} {detail[:60]}")
        sent += 1 if ok else 0
        # Real mail does not leave in a burst. Space it out.
        if index < len(plan) - 1:
            time.sleep(random.uniform(20, 90))

    print(f"\n{sent} of {len(plan)} sent.")
    print("\nNow the half that actually counts, and it takes a minute:")
    print("  1. Open them. Every one.")
    print("  2. Reply to at least half. Any real sentence will do.")
    print("  3. Anything in spam: mark Not Spam and drag it to the inbox.")
    print("  4. First time you see a new sender, add it to your contacts.")
    print("Delivery teaches the filter nothing. Those four things are the whole point.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
