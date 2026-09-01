"""
form_schema.py

Single source of truth for the lead-facing mini form. The pitch page renders
its fields from here and the generator reads answers back in the same shape, so
the two can never drift apart.

The form deliberately asks about the OWNER, not just the business. Anyone can
generate "quality roofing since 1998". What makes a preview land is showing the
owner their own words: the thing that is actually blocking them, the work they
actually want more of, the objection they hear every week. Each answer below is
wired to a specific part of the generated site (see SECTION_MAPPING), which is
also what makes the demo explainable on a webinar.

Facts (business name, trade, town) arrive pre-filled from the outreach link, so
the owner only fills in what we cannot already know.
"""

# Fields prefilled from the outreach email link. The owner can correct them.
PREFILLED_FIELDS = [
    {
        "id": "business_name",
        "label": "Business name",
        "type": "text",
        "required": True,
        "url_param": "business",
    },
    {
        "id": "trade",
        "label": "What you do",
        "type": "text",
        "required": True,
        "url_param": "trade",
        "placeholder": "Roofer, plumber, electrician",
    },
    {
        "id": "town",
        "label": "Main town or city you serve",
        "type": "text",
        "required": True,
        "url_param": "town",
    },
]

# The owner-psychology questions. Choices keep completion high; the free-text
# boxes are where the genuinely useful material comes from, so they are short
# and specific rather than open-ended.
QUESTION_FIELDS = [
    {
        "id": "bottleneck",
        "label": "What is actually holding the business back right now?",
        "type": "choice",
        "required": True,
        "choices": [
            "Not enough enquiries coming in",
            "Enquiries come in but they do not turn into jobs",
            "Too much time chasing people and doing admin",
            "Always getting beaten on price",
            "Nobody in my area knows who we are",
            "Feast or famine, the work is not steady",
        ],
    },
    {
        "id": "ninety_day_win",
        "label": "If one thing changed in the next 90 days, what would it be?",
        "type": "choice",
        "required": True,
        "choices": [
            "More calls and enquiries",
            "Better quality jobs, fewer time wasters",
            "Being able to charge more",
            "Filling the quiet weeks",
            "Spending less time chasing people",
            "Looking more established than my competitors",
        ],
    },
    {
        "id": "work_wanted",
        "label": "What kind of work do you want more of?",
        "type": "text",
        "required": True,
        "placeholder": "Full re-roofs rather than small repairs",
    },
    {
        "id": "customer_worry",
        "label": "What do customers worry about before they book you?",
        "type": "text",
        "required": True,
        "placeholder": "Being overcharged, or someone not turning up",
    },
    {
        "id": "edge",
        "label": "What do you do better than the people you compete with?",
        "type": "text",
        "required": True,
        "placeholder": "I do every job myself, I do not use subcontractors",
    },
    {
        "id": "vibe",
        "label": "How should it feel?",
        "type": "choice",
        "required": False,
        "choices": [
            "Solid and trustworthy",
            "Modern and premium",
            "Friendly and local",
            "Bold and hard to ignore",
        ],
    },
    # The four below exist because the generator REFUSES to invent them. Years
    # trading, team size and accreditations are the strongest trust content on a
    # trade site, and making them up about a real business would be dangerous.
    # Asking costs one tap each and unlocks copy we otherwise have to leave out.
    {
        "id": "years_trading",
        "label": "How long have you been doing this?",
        "type": "choice",
        "required": False,
        "choices": ["Under 2 years", "2 to 5 years", "5 to 10 years",
                    "10 to 20 years", "Over 20 years"],
    },
    {
        "id": "team_size",
        "label": "Is it just you, or do you have a team?",
        "type": "choice",
        "required": False,
        "choices": ["Just me", "Me and one other", "A small team of 3 to 6",
                    "More than 6"],
    },
    {
        "id": "accreditations",
        "label": "Any qualifications, accreditations or insurance worth shouting about?",
        "type": "text",
        "required": False,
        "placeholder": "Gas Safe registered, fully insured, City and Guilds",
    },
    {
        "id": "price_position",
        "label": "Where do you sit on price?",
        "type": "choice",
        "required": False,
        "choices": ["I am the cheapest around", "Fair middle of the road",
                    "Premium, and worth it"],
    },
]

CONTACT_FIELDS = [
    {"id": "owner_name", "label": "Your name", "type": "text", "required": True},
    {"id": "email", "label": "Email", "type": "email", "required": True},
    {"id": "phone", "label": "Phone", "type": "tel", "required": True},
]

ALL_FIELDS = PREFILLED_FIELDS + QUESTION_FIELDS + CONTACT_FIELDS

# Why each answer earns its place on the form. Used in the generator prompt and
# worth having written down for the webinar explanation.
SECTION_MAPPING = {
    "bottleneck": "hero promise and why_choose_us, the site leads on the thing blocking them",
    "ninety_day_win": "primary call to action and special_offers",
    "work_wanted": "which services lead, and the headline emphasis",
    "customer_worry": "faq, trust badges and guarantee copy answer the objection head on",
    "edge": "founder story and the about page angle",
    "vibe": "palette and typography selection",
    "years_trading": "the founder story and the about page stats, stated as fact not invented",
    "team_size": "the voice throughout, one person says 'I', a team says 'we'",
    "accreditations": "trust badges and the reassurance line under the form",
    "price_position": "whether the copy defends value or leads on price",
}

REQUIRED_IDS = [f["id"] for f in ALL_FIELDS if f.get("required")]

# The scrape-only path asks the business owner for nothing. These are the only
# fields that must be present, and all of them come off a Google Maps listing.
SCRAPE_REQUIRED_IDS = ["business_name", "trade", "town"]


def validate_answers(answers, source="form"):
    """
    Returns a list of human-readable problems; empty list means valid.

    source="scrape" is the no-form path: a lead we found ourselves, where the
    opinion questions were never asked and must not be treated as missing.
    """
    problems = []
    required = SCRAPE_REQUIRED_IDS if source == "scrape" else REQUIRED_IDS
    for field_id in required:
        value = (answers or {}).get(field_id)
        if not value or not str(value).strip():
            problems.append(f"missing required answer: {field_id}")
    email = (answers or {}).get("email", "")
    if email and ("@" not in email or "." not in email.split("@")[-1]):
        problems.append(f"email does not look valid: {email}")
    return problems
