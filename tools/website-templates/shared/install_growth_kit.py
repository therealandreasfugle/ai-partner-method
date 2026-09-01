#!/usr/bin/env python3
"""
install_growth_kit.py

Adds the growth kit (hero form, chat bubble, reviews slot, schema) to every
template, and writes each one a demo config so the library preview shows the
whole thing working rather than an empty shell.

    python3 shared/install_growth_kit.py            # do it
    python3 shared/install_growth_kit.py --check    # report, change nothing

Running it twice is safe: a template that already has the kit is left alone.

WHY A SCRIPT AND NOT TWENTY EDITS
Every template lands the form in the same place relative to its own markup,
directly under the hero's buttons, so the change is identical in shape across
all of them and can be re-run when a template is redesigned. Three templates
have no button row in the hero (the two creator ones and the UGC one); they get
the form after the hero copy instead, which is named explicitly below rather
than guessed at.
"""

import argparse
import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
TEMPLATES = ROOT / "templates"

CSS_LINK = '<link rel="stylesheet" href="../../core/growth-kit.css">'
SCRIPTS = ('<script src="demo-site.js"></script>\n'
           '<script src="../../core/growth-kit.js" defer></script>')
FORM_SLOT = ("\n\n        <!-- Enquiry form. The growth kit fills this from window.SITE;\n"
             "             with no config the template renders exactly as designed. -->\n"
             "        <div data-growth-form></div>")

# Templates whose hero has no button row. The anchor is the last element of the
# hero copy, named per template so nothing is guessed.
NO_ACTION_ANCHOR = {
    "ai-ugc-creator": "hero__lede",
    "creative-portfolio": "hero__lede",
    "personal-blogger": "hero__lede",
}

# What each template's demo form and chat should say. Written per industry so
# the library preview reads as that business, not as a generic placeholder.
DEMOS = {
    "auto-detailing": ("Elite Detail", "Manchester", "Book a detail",
        ["Full detail", "Ceramic coating", "Paint correction", "Interior only"],
        "How long does a ceramic coating take?"),
    "boutique-hotel": ("Aurion", "Bath", "Check availability",
        ["Room booking", "Spa day", "Private event", "Restaurant"],
        "Do you have parking?"),
    "coffee-shop": ("Joe's Coffee", "Leeds", "Reserve a table",
        ["Table booking", "Catering order", "Private hire", "Wholesale beans"],
        "Are you dog friendly?"),
    "dental-practice": ("Jesmond Dental Care", "Newcastle upon Tyne", "Book a check-up",
        ["Check-up", "Hygienist", "Emergency appointment", "Cosmetic consultation"],
        "What are your opening hours?"),
    "hvac-management": ("AirPro HVAC", "Birmingham", "Get a quote",
        ["New installation", "Service and maintenance", "Repair", "Commercial contract"],
        "How much is a service?"),
    "landscaping-services": ("GreenScape", "Bristol", "Get a quote",
        ["Garden design", "Regular maintenance", "Patio and paving", "Tree work"],
        "Do you do one-off tidy ups?"),
    "med-spa": ("Lumiere Med Spa", "London", "Book a consultation",
        ["Consultation", "Skin treatment", "Injectables", "Laser"],
        "Is the consultation free?"),
    "natural-skincare": ("Lumine", "Brighton", "Join the list",
        ["Order enquiry", "Wholesale", "Press", "Something else"],
        "Are your products vegan?"),
    "perfume-brand": ("UMBRA", "London", "Enquire",
        ["Order enquiry", "Wholesale", "Press", "Something else"],
        "Do you offer samples?"),
    "plumbing-services": ("FlowRight Plumbing", "Sheffield", "Get a quote",
        ["Emergency callout", "Boiler service", "Bathroom fitting", "Leak or blockage"],
        "Do you charge a callout fee?"),
    "product-showcase": ("Monoblock", "London", "Enquire",
        ["Order enquiry", "Trade account", "Press", "Something else"],
        "What is the lead time?"),
    "real-estate-agency": ("Luxe Properties", "Manchester", "Book a valuation",
        ["Sell my property", "Let my property", "Buying", "Renting"],
        "What is my house worth?"),
    "travel-agency": ("Luxuria", "London", "Plan my trip",
        ["Bespoke itinerary", "Honeymoon", "Family holiday", "Group travel"],
        "Do you handle flights too?"),
    "web-agency": ("Webild", "Manchester", "Start a project",
        ["New website", "Redesign", "Ongoing support", "Something else"],
        "How long does a site take?"),
    "wellness-center": ("SuperHealth", "Edinburgh", "Book an assessment",
        ["Initial assessment", "Physiotherapy", "Programme", "Something else"],
        "Do I need a referral?"),
    "ai-consulting": ("Merydian", "London", "Book a discovery call",
        ["Discovery call", "Pilot project", "Security review", "Something else"],
        "Do you work with regulated firms?"),
    "ai-email-platform": ("Flashly", "London", "Get a demo",
        ["Product demo", "Pricing", "Migration", "Something else"],
        "Is there a free trial?"),
    "ai-ugc-creator": ("UGCIFY", "London", "Get started",
        ["See examples", "Pricing", "Bulk orders", "Something else"],
        "How fast is delivery?"),
    "creative-portfolio": ("Joseph Alexander", "London", "Start a project",
        ["Brand identity", "Web design", "Art direction", "Something else"],
        "What is your rate?"),
    "personal-blogger": ("Anya", "Lisbon", "Say hello",
        ["Collaboration", "Press", "Speaking", "Something else"],
        "Do you take sponsorships?"),
}


def demo_config(slug):
    """The window.SITE a template shows in the library preview."""
    name, town, cta, services, question = DEMOS[slug]
    return {
        "business": {
            "name": name, "town": town, "country": "GB",
            "phone": "0161 555 0142",
            "description": f"{name} in {town}.",
            "services": services,
            "areasServed": [town],
        },
        "form": {
            "heading": cta,
            "sub": "Tell us what you need and we will come straight back to you.",
            "services": services,
            # Asked because the answer changes the quote. Generic on the demo,
            # written per trade when the builder generates a real site.
            "questions": [
                {"label": "How soon do you need it?",
                 "options": ["As soon as possible", "This week", "This month", "Just planning"]},
                {"label": "Best time to call you",
                 "options": ["Morning", "Afternoon", "Evening", "Any time"]},
            ],
            "button": cta,
            "thanks": "Thanks. We will be in touch shortly.",
        },
        "chat": {
            "greeting": f"Hi, you have reached {name}. What can I help with?",
            # Each answer carries the question a visitor taps to get it, so the
            # chips can only ever ask things the assistant can actually answer.
            "answers": [
                {"ask": "What are your opening hours?",
                 "match": ["open", "hours", "time"],
                 "answer": "We are open 8:30 to 5:30 on weekdays, and Saturday mornings."},
                {"ask": "How much does it cost?",
                 "match": ["price", "cost", "how much", "quote", "worth", "rate", "fee"],
                 "answer": "It depends on the job. Leave your number and we will give you a straight figure, no obligation."},
                {"ask": "Where are you based?",
                 "match": ["where", "address", "find", "parking", "park"],
                 "answer": f"We are in {town}. Ask me for directions and I will send them over."},
                {"ask": question,
                 "match": [question.split()[0].lower()],
                 "answer": "Good question. Leave your number and we will answer it properly."},
            ],
        },
        "reviews": {},
    }


def close_of(html, start):
    """Index just past the </div> that closes the div opened at `start`."""
    depth = 0
    i = start
    while i < len(html):
        if html.startswith("<div", i):
            depth += 1
            i += 4
        elif html.startswith("</div>", i):
            depth -= 1
            i += 6
            if depth == 0:
                return i
        else:
            i += 1
    raise ValueError("unbalanced markup")


def install(slug, check=False):
    folder = TEMPLATES / slug
    page = folder / "index.html"
    html = page.read_text()

    if "growth-kit.js" in html:
        return "already installed"
    if slug not in DEMOS:
        return "SKIPPED, no demo copy written for it"

    # 1. stylesheet, next to the template's own
    if 'href="theme.css"' not in html:
        return "SKIPPED, no theme.css link to anchor to"
    html = html.replace('<link rel="stylesheet" href="theme.css">',
                        '<link rel="stylesheet" href="theme.css">\n' + CSS_LINK, 1)

    # 2. the form slot, under the hero's buttons where there are some
    anchor = NO_ACTION_ANCHOR.get(slug, "hero__actions")
    match = re.search(r'<div class="[^"]*' + anchor + r'[^"]*"', html)
    if match:
        end = close_of(html, match.start())
        html = html[:end] + FORM_SLOT + html[end:]
    else:
        match = re.search(r'<p class="[^"]*' + anchor + r'[^"]*">.*?</p>', html, re.S)
        if not match:
            return f"SKIPPED, could not find {anchor} to place the form"
        html = html[:match.end()] + FORM_SLOT + html[match.end():]

    # 3. the kit, last
    html = html.replace("</body>", SCRIPTS + "\n</body>", 1)

    if check:
        return "would install"

    page.write_text(html)
    config = "window.SITE = " + json.dumps(demo_config(slug), indent=2) + ";\n"
    (folder / "demo-site.js").write_text(
        "/* Demo content for the library preview. The builder replaces this file\n"
        "   with the real business when it generates a site. */\n" + config)
    return "installed"


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--check", action="store_true", help="report only")
    parser.add_argument("--only", nargs="*", help="just these templates")
    args = parser.parse_args()

    names = args.only or sorted(d.name for d in TEMPLATES.iterdir() if d.is_dir())
    done = 0
    for slug in names:
        result = install(slug, check=args.check)
        print(f"  {slug:<24} {result}")
        done += result in ("installed", "would install")
    print(f"\n{done} of {len(names)} templates")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
