#!/usr/bin/env python3
"""
APM Client Onboarding — Creator Client Intake Form

Creates the full creator client intake form in your Typeform account.
Run once when you set up. Share the live URL with every new creator client.

Usage:
    python3 execution/create_typeform.py

Output:
    Live form URL to send to creator clients.
    Edit URL to customise the form in Typeform.

Requires:
    TYPEFORM_API_KEY in .env
    (typeform.com → Account Settings → Personal tokens)
"""

import os
import sys

import requests
from dotenv import load_dotenv

load_dotenv()

API_KEY = os.getenv("TYPEFORM_API_KEY")
BASE_URL = "https://api.typeform.com"


def statement(title: str, ref: str, description: str, button: str = "Continue") -> dict:
    return {
        "type": "statement",
        "title": title,
        "ref": ref,
        "properties": {
            "description": description,
            "button_text": button,
            "hide_marks": True,
        },
    }


def short(title: str, ref: str, required: bool = True) -> dict:
    return {"type": "short_text", "title": title, "ref": ref, "validations": {"required": required}}


def long(title: str, ref: str, required: bool = True) -> dict:
    return {"type": "long_text", "title": title, "ref": ref, "validations": {"required": required}}


def email_field(title: str, ref: str) -> dict:
    return {"type": "email", "title": title, "ref": ref, "validations": {"required": True}}


def dropdown(title: str, ref: str, choices: list[str]) -> dict:
    return {
        "type": "dropdown",
        "title": title,
        "ref": ref,
        "properties": {"choices": [{"label": c} for c in choices]},
        "validations": {"required": True},
    }


def multichoice(title: str, ref: str, choices: list[str], required: bool = True) -> dict:
    return {
        "type": "multiple_choice",
        "title": title,
        "ref": ref,
        "properties": {
            "choices": [{"label": c} for c in choices],
            "allow_multiple_selection": False,
        },
        "validations": {"required": required},
    }


def rating(title: str, ref: str, steps: int = 10) -> dict:
    return {
        "type": "rating",
        "title": title,
        "ref": ref,
        "properties": {"steps": steps, "shape": "star"},
        "validations": {"required": True},
    }


def build_form_payload() -> dict:
    fields = [
        # ── Section 1: Your Business ──────────────────────────────────────
        statement(
            "Section 1 of 8: Your Business",
            "section_business",
            "Basic info about you, your offer, and where you're headed.",
        ),
        email_field("What's your email address?", "email"),
        short("What's your full name?", "full_name"),
        short("What's your primary Instagram handle? (e.g. @yourhandle)", "instagram_handle"),
        long("What do you sell? Describe your offer in 1–2 sentences.", "offer_description"),
        short("What's the price of your main offer? (e.g. £2,500 or £997/month)", "offer_price"),
        dropdown(
            "What's your current monthly revenue?",
            "current_revenue",
            ["£0 – £1k", "£1k – £3k", "£3k – £5k", "£5k – £10k", "£10k – £20k", "£20k+"],
        ),
        short("What do you want your monthly revenue to be in 90 days?", "revenue_goal_90d"),

        # ── Section 2: Your Ideal Client ──────────────────────────────────
        statement(
            "Section 2 of 8: Your Ideal Client",
            "section_icp",
            "This is the most important section. Your DM setter, content, and positioning all depend on getting this right.",
        ),
        long(
            "Who is your ideal client? Describe them in detail — age, gender, situation, what they've tried, what keeps them up at night.",
            "ideal_client",
        ),
        long("What is the #1 problem they're trying to solve when they find you?", "client_main_problem"),
        long(
            "What objections do they typically raise before buying? (e.g. 'I can't afford it', 'I need to think about it')",
            "client_objections",
        ),
        long(
            "List 10–15 competitors or creators your ideal client would also follow. Include their platform links.",
            "competitors",
        ),

        # ── Section 3: Brand & Positioning ───────────────────────────────
        statement(
            "Section 3 of 8: Your Brand & Positioning",
            "section_brand",
            "This shapes every piece of content and every DM we write in your voice.",
        ),
        long("What's your unique angle in the market? What do you say or do that no one else does?", "unique_angle"),
        long("How would you describe your brand voice in 1–2 sentences?", "brand_voice"),
        long(
            "What tone should your content and DMs NEVER use? What would feel completely off-brand?",
            "off_brand_tone",
        ),
        long(
            "Name 2–3 creators whose content style you admire or want to model. Explain what you like about each.",
            "admired_creators",
        ),
        long(
            "Paste 2–3 examples of your own content, captions, or DMs that best represent your brand at its strongest.",
            "brand_examples",
            required=False,
        ),
        short(
            "Link to your single best-performing piece of content. (optional — paste the URL)",
            "best_content_link",
            required=False,
        ),

        # ── Section 4: Your Story & Authority ────────────────────────────
        statement(
            "Section 4 of 8: Your Story & Authority",
            "section_story",
            "People buy from people. Your story is one of your most powerful sales assets.",
        ),
        long(
            "What's your origin story? Why did you start this, what were you doing before, and what changed?",
            "origin_story",
        ),
        long("What was the single turning point or defining moment that led you to where you are now?", "defining_moment"),
        long("What have you failed at, struggled with, or had to overcome to get here? What did it cost you?", "struggles_overcome"),
        long(
            "What is your single biggest credibility proof point or win? (results, revenue, recognition, media...)",
            "credibility_proof",
        ),

        # ── Section 5: Content ────────────────────────────────────────────
        statement(
            "Section 5 of 8: Your Content Operation",
            "section_content",
            "We need to know how you create and where you show up.",
        ),
        long(
            "List every platform you currently post on with your handle or link for each.",
            "platforms_handles",
        ),
        multichoice(
            "What content format feels most natural and authentic for you right now?",
            "content_format",
            [
                "Talking head / face to camera",
                "Voiceover with B-roll",
                "Text-based / slides",
                "Podcast / long-form audio",
                "Written posts / captions only",
                "Mix of the above",
            ],
        ),
        multichoice(
            "How many pieces of content can you realistically commit to filming per week?",
            "content_volume_weekly",
            ["1–2 pieces", "3–5 pieces", "6–10 pieces", "10+ pieces"],
        ),

        # ── Section 6: Your Tech Stack ────────────────────────────────────
        statement(
            "Section 6 of 8: Your Tech Stack",
            "section_tech",
            "We need to know what tools you're already using so we can build around them — or replace them.",
        ),
        long(
            "What tools do you currently use? List by category: CRM, Email, Booking, Payments, Community.",
            "current_tools",
        ),
        rating("How comfortable are you with technology and software? (1 = barely use it, 10 = very comfortable)", "tech_comfort_level"),
        long("How are your DMs currently being managed? (yourself, VA, automation tool, not at all)", "dm_management_current"),
        long("What is your single biggest bottleneck in your business right now?", "biggest_bottleneck"),

        # ── Section 7: Logins Note ────────────────────────────────────────
        statement(
            "Section 7 of 8: Software logins — we'll collect these separately.",
            "section_logins_note",
            (
                "After this form you'll receive a secure link to share your software logins "
                "(Instagram, CRM, email platform, etc.) so we can build everything without chasing you.\n\n"
                "Do NOT share passwords in this form."
            ),
            button="Got it",
        ),

        # ── Section 8: Availability ───────────────────────────────────────
        statement(
            "Section 8 of 8: Availability",
            "section_availability",
            "Almost done. We'll be in touch within 24 hours to book your kickoff call.",
        ),
        short("What timezone are you in? (e.g. GMT, EST, PST, AEST)", "timezone"),
        long("What days and times generally work best for a 45-minute kickoff call?", "call_availability"),
        long("Is there anything else we should know before we get started?", "anything_else", required=False),
    ]

    return {
        "title": "Creator Client Intake",
        "settings": {
            "language": "en",
            "progress_bar": "proportion",
            "show_progress_bar": True,
            "show_typeform_branding": False,
            "meta": {"allow_indexing": False},
        },
        "welcome_screens": [
            {
                "title": "Let's build your system.",
                "properties": {
                    "description": (
                        "This form takes 20–30 minutes to complete properly.\n\n"
                        "Set aside focused time — the quality of your answers determines "
                        "the quality of everything we build for you.\n\n"
                        "Be specific. Vague answers produce vague results."
                    ),
                    "show_button": True,
                    "button_text": "Let's go",
                },
            }
        ],
        "thankyou_screens": [
            {
                "title": "You're all set.",
                "properties": {
                    "description": (
                        "We'll review your answers and be in touch within 24 hours "
                        "to book your kickoff call. Check your inbox."
                    ),
                    "show_button": False,
                },
            }
        ],
        "fields": fields,
    }


def main() -> None:
    if not API_KEY:
        print("ERROR: TYPEFORM_API_KEY not found in .env", file=sys.stderr)
        print("Get yours at: typeform.com → Account Settings → Personal tokens", file=sys.stderr)
        sys.exit(1)

    print("Creating form via Typeform API...")

    try:
        resp = requests.post(
            f"{BASE_URL}/forms",
            headers={"Authorization": f"Bearer {API_KEY}", "Content-Type": "application/json"},
            json=build_form_payload(),
            timeout=30,
        )
        resp.raise_for_status()
    except requests.HTTPError as e:
        print(f"ERROR: Typeform API returned {e.response.status_code}", file=sys.stderr)
        print(e.response.text, file=sys.stderr)
        sys.exit(1)

    result = resp.json()
    form_id = result.get("id")

    print("\n  Form created successfully")
    print(f"\n  Live URL : https://form.typeform.com/to/{form_id}")
    print(f"  Edit URL : https://admin.typeform.com/form/{form_id}/create")
    print("\n  Send the Live URL to every new creator client.")


if __name__ == "__main__":
    main()
