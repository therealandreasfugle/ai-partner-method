#!/usr/bin/env python3
"""
APM Client Onboarding — Create Notion Client Workspace

Builds the complete client workspace in Notion. Run once per new creator client.

Usage:
    python3 execution/create_notion_workspace.py "Client Name"

Example:
    python3 execution/create_notion_workspace.py "Client Name"

Output:
    Notion workspace URL — share with the client and your team.

Requires in .env:
    NOTION_API_KEY       — from notion.so/my-integrations
    NOTION_PARENT_PAGE_ID — the page ID where client workspaces are created
                            (copy from your Notion page URL — the 32-char ID after the last /)
"""

import os
import sys

import requests
from dotenv import load_dotenv

load_dotenv()

API_KEY = os.getenv("NOTION_API_KEY")
PARENT_PAGE_ID = os.getenv("NOTION_PARENT_PAGE_ID")
BASE_URL = "https://api.notion.com/v1"
VERSION = "2022-06-28"


def _headers() -> dict:
    return {
        "Authorization": f"Bearer {API_KEY}",
        "Content-Type": "application/json",
        "Notion-Version": VERSION,
    }


def create_page(parent_id: str, title: str, emoji: str, children: list | None = None) -> dict:
    payload = {
        "parent": {"page_id": parent_id},
        "icon": {"type": "emoji", "emoji": emoji},
        "properties": {
            "title": {"title": [{"type": "text", "text": {"content": title}}]}
        },
    }
    if children:
        payload["children"] = children[:100]
    resp = requests.post(f"{BASE_URL}/pages", headers=_headers(), json=payload, timeout=30)
    resp.raise_for_status()
    return resp.json()


def create_database(parent_id: str, title: str, emoji: str, properties: dict) -> dict:
    payload = {
        "parent": {"page_id": parent_id},
        "icon": {"type": "emoji", "emoji": emoji},
        "title": [{"type": "text", "text": {"content": title}}],
        "properties": properties,
    }
    resp = requests.post(f"{BASE_URL}/databases", headers=_headers(), json=payload, timeout=30)
    resp.raise_for_status()
    return resp.json()


# ── Block helpers ──────────────────────────────────────────────────────────────

def h2(text: str) -> dict:
    return {"type": "heading_2", "heading_2": {"rich_text": [{"type": "text", "text": {"content": text}}]}}


def h3(text: str) -> dict:
    return {"type": "heading_3", "heading_3": {"rich_text": [{"type": "text", "text": {"content": text}}]}}


def p(text: str) -> dict:
    return {"type": "paragraph", "paragraph": {"rich_text": [{"type": "text", "text": {"content": text}}]}}


def todo(text: str) -> dict:
    return {"type": "to_do", "to_do": {"rich_text": [{"type": "text", "text": {"content": text}}], "checked": False}}


def bullet(text: str) -> dict:
    return {"type": "bulleted_list_item", "bulleted_list_item": {"rich_text": [{"type": "text", "text": {"content": text}}]}}


def callout(text: str, emoji: str = "💡") -> dict:
    return {"type": "callout", "callout": {"rich_text": [{"type": "text", "text": {"content": text}}], "icon": {"type": "emoji", "emoji": emoji}}}


def divider() -> dict:
    return {"type": "divider", "divider": {}}


# ── Workspace builder ──────────────────────────────────────────────────────────

def build(client_name: str) -> str:
    print(f"\nBuilding workspace for: {client_name}")

    # ── Main workspace page ────────────────────────────────────────────────
    workspace = create_page(
        PARENT_PAGE_ID,
        f"{client_name} — Workspace",
        "🏢",
        children=[
            callout(f"Everything about {client_name} lives here. Keep it updated.", "📌"),
            divider(),
            h2("Navigation"),
            bullet("📋 Onboarding To-Do — client's setup checklist"),
            bullet("✅ Direct To-Do — ongoing tasks"),
            bullet("🚀 Onboarding — brand sheet, logins, roadmap, fulfillment"),
            bullet("📣 Marketing Ecosystem — avatar, positioning"),
            bullet("🎥 Content Strategy — IG, YouTube, editing SOPs"),
            bullet("📖 SOP Database — video SOPs for the operation"),
            bullet("🔗 Resources — live links to every tool"),
            bullet("🗓️ Content Kanban — content pipeline"),
        ],
    )
    wid = workspace["id"]
    print("  ✓ Main workspace")

    # ── 1. Onboarding To-Do List ───────────────────────────────────────────
    create_page(
        wid, "Onboarding To-Do List", "📋",
        children=[
            callout("Complete these in order. Everything else waits until this is done.", "⚡"),
            divider(),
            todo("Complete the intake form → [ADD TYPEFORM LINK]"),
            todo("Share software logins → [ADD SECURE FORM LINK]"),
            todo("Book kickoff call → [ADD BOOKING LINK]"),
            todo("Review your Client Roadmap in this workspace"),
            todo("Film and send 5 content examples (raw is fine)"),
            todo("Confirm Instagram access has been shared"),
        ],
    )
    print("  ✓ Onboarding To-Do List")

    # ── 2. Direct To-Do List ──────────────────────────────────────────────
    create_page(
        wid, "Direct To-Do List", "✅",
        children=[
            p("Ongoing tasks outside of onboarding. Add items here as they come up."),
            divider(),
            todo("Example: review this week's DM conversations"),
        ],
    )
    print("  ✓ Direct To-Do List")

    # ── 3. Onboarding Section ─────────────────────────────────────────────
    ob = create_page(wid, "Onboarding", "🚀", children=[p("All onboarding reference docs. Populate from the intake form.")])
    ob_id = ob["id"]

    # Software Logins — database
    create_database(
        ob_id, "Software Logins", "🔑",
        properties={
            "Platform": {"title": {}},
            "Username": {"rich_text": {}},
            "Password": {"rich_text": {}},
            "Notes": {"rich_text": {}},
            "Access Confirmed": {"checkbox": {}},
        },
    )

    # Brand Sheet
    create_page(
        ob_id, "Brand Sheet", "📝",
        children=[
            callout("Populate this from the Typeform intake answers.", "📋"),
            divider(),
            h2("Identity"),
            p("Full name:\nInstagram handle:\nEmail:\nTimezone:"),
            divider(),
            h2("Business"),
            p("Offer:\nOffer price:\nCurrent monthly revenue:\n90-day revenue goal:"),
            divider(),
            h2("Ideal Client"),
            p("Who they are:\n#1 problem:\nCommon objections:\nCompetitors they follow:"),
            divider(),
            h2("Brand Voice"),
            p("Unique angle:\nBrand voice (1-2 sentences):\nOff-brand tone (never use):\nAdmired creators + why:"),
            divider(),
            h2("Brand Examples"),
            p("Paste their best captions, DMs, or scripts here — direct writing reference."),
            divider(),
            h2("Story & Authority"),
            p("Origin story:\nDefining moment:\nStruggles overcome:\nBiggest credibility proof:"),
            divider(),
            h2("Content"),
            p("Platforms + handles:\nContent format preference:\nContent volume per week:\nBest-performing content link:"),
        ],
    )

    # D1 Fulfillment
    create_page(
        ob_id, "D1 Fulfillment (A-Z)", "🎯",
        children=[
            p("How this creator delivers results to their own clients/students."),
            divider(),
            h2("Program Structure"),
            p("What does a student go through week by week?"),
            h2("Delivery Method"),
            p("Calls, community, async, course content — what and how?"),
            h2("Successful Student Outcome"),
            p("What does a win look like for their student?"),
            h2("Current Onboarding (theirs)"),
            p("How do they onboard their own students right now?"),
            h2("Fulfillment Pain Points"),
            p("What's breaking in their delivery right now?"),
        ],
    )

    # How to Craft Their Offer
    create_page(
        ob_id, "How to Craft Their Offer", "💎",
        children=[
            h2("Current Offer Breakdown"),
            p("What's included:"),
            h2("Positioning Language"),
            p("Exact phrases that land for their audience:"),
            h2("What Makes It Different"),
            p("The genuine differentiator:"),
            h2("Price Justification"),
            p("Why it's worth the number:"),
            h2("Upsells / Next Steps"),
            p("What comes after:"),
        ],
    )

    # Client Roadmap
    create_page(
        ob_id, "Client Roadmap", "🗺️",
        children=[
            callout("Fill this in during the kickoff call. Review and update monthly.", "📅"),
            divider(),
            h2("30-Day Targets"),
            p("Revenue: £\nNew clients:\nDMs sent/day:\nContent pieces live:"),
            h2("60-Day Targets"),
            p("Revenue: £\nNew clients:\nSystems running:"),
            h2("90-Day Targets"),
            p("Revenue: £\nNew clients:\nWhat the operation looks like:"),
            h2("6-Month Vision"),
            p("Where do they want to be? Write it in their words."),
        ],
    )

    # Funnel Info
    create_page(
        ob_id, "Funnel Info", "🔽",
        children=[
            h2("Current Funnel"),
            p("Where leads come from → how they become clients:"),
            h2("Entry Point"),
            p("IG DM / call / application / other:"),
            h2("Current Metrics"),
            p("DM → booked call rate:\nCall → close rate:"),
            h2("Biggest Gap"),
            p("Where they're losing people:"),
            h2("What We're Building"),
            p("The fix:"),
        ],
    )
    print("  ✓ Onboarding section (6 sub-pages + Software Logins database)")

    # ── 4. Marketing Ecosystem ────────────────────────────────────────────
    mkt = create_page(wid, "Marketing Ecosystem", "📣", children=[p("Who this creator serves and what they're really offering.")])
    mkt_id = mkt["id"]

    create_page(
        mkt_id, "Customer Avatar", "👤",
        children=[
            callout("Give them a real name. The more specific, the better the copy.", "✍️"),
            divider(),
            p("Name:\nAge + gender:\nWhat they do for work:\nDay in their life:\nWhat they watch/read/listen to:\nWhat they're afraid of:\nWhat they want to tell their friends:\nWords they use to describe their problem:\nWhat they've already tried (and why it didn't work):"),
        ],
    )

    create_page(
        mkt_id, "New Opportunity", "🚪",
        children=[
            h2("The Old Way"),
            p("What clients have tried before and why it failed:"),
            h2("The New Opportunity"),
            p("What this creator does differently:"),
            h2("The Mechanism"),
            p("The specific thing that makes it work:"),
            h2("Why Now"),
            p("Why this is the right time for this opportunity:"),
        ],
    )
    print("  ✓ Marketing Ecosystem (Customer Avatar + New Opportunity)")

    # ── 5. Content Strategy ───────────────────────────────────────────────
    cs = create_page(wid, "Content Strategy", "🎥", children=[p("The full content playbook for this creator.")])
    cs_id = cs["id"]

    create_page(
        cs_id, "Instagram Game Plan", "📱",
        children=[
            h2("Content Pillars"),
            p("1.\n2.\n3.\n4.\n5."),
            h2("Posting Frequency"),
            p("Target: X posts/week"),
            h2("Format Mix"),
            p("Reels: %\nCarousels: %\nStories: daily\nLives: monthly"),
            h2("Hook Bank"),
            p("Add 10+ proven hooks in their voice here."),
            h2("30-Day Calendar"),
            p("Week 1:\nWeek 2:\nWeek 3:\nWeek 4:"),
        ],
    )

    create_page(
        cs_id, "YouTube Game Plan", "▶️",
        children=[
            h2("Channel Positioning"),
            p("What this channel is known for:"),
            h2("Video Cadence"),
            p("Target: X videos/month"),
            h2("Series Ideas"),
            p("1.\n2.\n3."),
            h2("SEO Keywords"),
            p("Target terms to rank for:"),
            h2("First 5 Videos"),
            p("1.\n2.\n3.\n4.\n5."),
        ],
    )

    create_page(
        cs_id, "Google Drive Links", "📁",
        children=[
            bullet("Raw footage: [ADD LINK]"),
            bullet("Approved content: [ADD LINK]"),
            bullet("Brand assets (logos, fonts, colours): [ADD LINK]"),
            bullet("Content briefs: [ADD LINK]"),
            bullet("Scripts: [ADD LINK]"),
        ],
    )

    create_page(
        cs_id, "Editing SOPs", "✂️",
        children=[
            h2("Caption Style"),
            p("Length, line breaks, emoji usage:"),
            h2("Music"),
            p("Preferred genres / tracks:"),
            h2("Colour Grade"),
            p("Filter / LUT preference:"),
            h2("Pacing"),
            p("Cut style, pace preference:"),
            h2("On-Screen Text"),
            p("Font, size, colour:"),
            h2("Thumbnail Style"),
            p("For YouTube — colours, face, text style:"),
        ],
    )

    create_page(
        cs_id, "Amazon Storefront / Gear", "🎙️",
        children=[
            bullet("Camera:"),
            bullet("Microphone:"),
            bullet("Lighting:"),
            bullet("Tripod / stabiliser:"),
            bullet("Other gear:"),
            bullet("Amazon Storefront link:"),
        ],
    )
    print("  ✓ Content Strategy (5 sub-pages)")

    # ── 6. SOP Database ───────────────────────────────────────────────────
    create_database(
        wid, "SOP Database", "📖",
        properties={
            "SOP": {"title": {}},
            "Loom Link": {"url": {}},
            "Last Updated": {"date": {}},
            "Owner": {
                "select": {
                    "options": [
                        {"name": "You", "color": "blue"},
                        {"name": "Client", "color": "green"},
                        {"name": "VA", "color": "yellow"},
                    ]
                }
            },
            "Status": {
                "select": {
                    "options": [
                        {"name": "To Record", "color": "red"},
                        {"name": "Live", "color": "green"},
                        {"name": "Needs Update", "color": "orange"},
                    ]
                }
            },
        },
    )
    print("  ✓ SOP Database")

    # ── 7. Resources ──────────────────────────────────────────────────────
    create_page(
        wid, "Resources", "🔗",
        children=[
            callout("Update these as you build each system.", "🔧"),
            divider(),
            bullet("DM setter dashboard: [ADD LINK]"),
            bullet("Analytics dashboard: [ADD LINK]"),
            bullet("Booking link: [ADD LINK]"),
            bullet("Payment link: [ADD LINK]"),
            bullet("Community platform: [ADD LINK]"),
            bullet("Course platform: [ADD LINK]"),
            bullet("Content calendar: [ADD LINK]"),
            bullet("Dialer hub: [ADD LINK]"),
            bullet("Closer hub: [ADD LINK]"),
        ],
    )
    print("  ✓ Resources")

    # ── 8. Content Kanban ─────────────────────────────────────────────────
    create_database(
        wid, "Content Kanban", "🗓️",
        properties={
            "Content": {"title": {}},
            "Status": {
                "select": {
                    "options": [
                        {"name": "💡 Idea", "color": "gray"},
                        {"name": "✍️ Needs Script", "color": "yellow"},
                        {"name": "✅ Ready to Film", "color": "blue"},
                        {"name": "🎬 Ready for Editing", "color": "orange"},
                        {"name": "📅 Scheduled", "color": "purple"},
                        {"name": "✔️ Posted", "color": "green"},
                    ]
                }
            },
            "Platform": {
                "multi_select": {
                    "options": [
                        {"name": "Instagram", "color": "pink"},
                        {"name": "TikTok", "color": "red"},
                        {"name": "YouTube", "color": "red"},
                        {"name": "Twitter/X", "color": "blue"},
                    ]
                }
            },
            "Format": {
                "select": {
                    "options": [
                        {"name": "Reel", "color": "blue"},
                        {"name": "Carousel", "color": "orange"},
                        {"name": "Talking Head", "color": "green"},
                        {"name": "Story", "color": "pink"},
                        {"name": "Long-form", "color": "purple"},
                    ]
                }
            },
            "Post Date": {"date": {}},
            "Script": {"url": {}},
            "Raw Footage": {"url": {}},
            "Final Edit": {"url": {}},
            "Post Link": {"url": {}},
        },
    )
    print("  ✓ Content Kanban (with all columns)")

    workspace_url = f"https://notion.so/{wid.replace('-', '')}"
    return workspace_url


def main() -> None:
    if len(sys.argv) < 2:
        print("Usage: python3 execution/create_notion_workspace.py 'Client Name'", file=sys.stderr)
        sys.exit(1)

    if not API_KEY:
        print("\nERROR: NOTION_API_KEY not found in .env", file=sys.stderr)
        print("Steps to fix:", file=sys.stderr)
        print("  1. Go to notion.so/my-integrations", file=sys.stderr)
        print("  2. Click 'New integration' → give it a name → Submit", file=sys.stderr)
        print("  3. Copy the 'Internal Integration Secret'", file=sys.stderr)
        print("  4. Paste it into .env as NOTION_API_KEY=secret_...", file=sys.stderr)
        sys.exit(1)

    if not PARENT_PAGE_ID:
        print("\nERROR: NOTION_PARENT_PAGE_ID not found in .env", file=sys.stderr)
        print("Steps to fix:", file=sys.stderr)
        print("  1. Create a page in Notion called 'Client Workspaces'", file=sys.stderr)
        print("  2. Share it with your integration (Share → Invite → your integration name)", file=sys.stderr)
        print("  3. Copy the page ID from the URL (32-char string after the last /)", file=sys.stderr)
        print("  4. Paste into .env as NOTION_PARENT_PAGE_ID=...", file=sys.stderr)
        sys.exit(1)

    client_name = " ".join(sys.argv[1:])

    try:
        url = build(client_name)
    except requests.HTTPError as e:
        print(f"\nERROR: Notion API returned {e.response.status_code}", file=sys.stderr)
        print(e.response.text, file=sys.stderr)
        sys.exit(1)

    print(f"\n  Workspace ready: {url}")
    print(f"\n  Next: populate the Brand Sheet from their Typeform answers.")


if __name__ == "__main__":
    main()
