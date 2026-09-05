#!/usr/bin/env python3
"""
generate_site.py

Turns one filled-in mini form into a complete, ready-to-serve site config for
the preview app. This is the FREE-API lane, built to be compared against the
Claude Code lane (see builder-lane/).

    python3 generator/generate_site.py --answers path/to/answers.json
    python3 generator/generate_site.py --demo          # built-in sample lead

Division of labour:
  LLM           the words. Copy that answers what THIS owner said is blocking
                them, in their trade, for their town.
  Deterministic everything that must not be improvised: contact details, photo
                set, palette, fonts, layout, service areas.

Nothing here fabricates social proof. Reviews stay empty unless real numbers are
passed in, because inventing a testimonial from a stranger's customer is both
dishonest and the fastest way to lose the deal when they ask who "Sarah M." is.

Output:
  preview-app/public/configs/<slug>.json   the merged config
  preview-app/public/sites/<slug>/         the client's photo set and wordmark
"""

import argparse
import json
import re
import shutil
import subprocess
import sys
import unicodedata
from concurrent.futures import ThreadPoolExecutor
from datetime import date
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))
from form_schema import SECTION_MAPPING, validate_answers  # noqa: E402
from llm import generate_json, LLMError  # noqa: E402

ROOT = Path(__file__).resolve().parent.parent
APP = ROOT / "preview-app"
CONFIGS = APP / "public" / "configs"
SITES = APP / "public" / "sites"
TRADES = APP / "public" / "trades"

# Identity of the baseline config, scrubbed from any generated site so no
# client ever sees the demo client's name bleeding through a secondary page.
BASELINE_TOKENS = {
    "Ashworth Roofing": "{{COMPANY}}",
    "Ashworth": "{{SHORTNAME}}",
    "Greater Manchester": "{{REGION}}",
    "Manchester": "{{TOWN}}",
    "0161 496 0142": "{{PHONE}}",
    "ashworthroofing.co.uk": "{{DOMAIN}}",
}

# Order is load-bearing: the first pattern that matches wins, so the narrow
# trades sit above the broad ones. Written against the 68 real categories in
# the lead sheet, and every one of them was checked by hand against this list.
# Traps that are deliberately avoided:
#   "garage" would send a garage door supplier to the car photos
#   "electric" under plumbing would put an electrician in a bathroom
#   "contractor" above plumbing would send an HVAC contractor to a building site
#   "law" would match "lawn care", so it is bounded
#   "pet" would match "carpet", so cleaning is tested first and pet is bounded
#   "dent" would match "independent", so it needs the whole word
# This list is mirrored in api-service/api/build.js. Change both together.
TRADE_PATTERNS = [
    ("roofing", r"roof|slate|gutter|chimney|fascia|soffit|cladding|shingle"),
    ("motorcycle", r"motorcycle|motorbike|scooter|moped|\batv\b|quad bike|powersport"),
    ("auto", r"auto|car detail|vehicle|mechanic|body ?shop|tyre|tire|windscreen|windshield|\btruck\b|trailer|towing|car leasing|\brv\b|diesel engine|motor ?home|caravan dealer"),
    # HVAC first and separate: it has its own template and photo set.
    ("hvac", r"hvac|air ?condition|\bac repair\b|ventilat|furnace|ductwork|climate control|refrigerat|chiller"),
    ("plumbing", r"plumb|boiler|heating|drain|bathroom|septic|water heater|gas engineer|central heating"),
    ("energy", r"solar|photovoltaic|ev charg|heat pump|insulation|renewable|energy efficien|battery storage|energy suppl|gas compan|\\bcoal\\b|solid fuel|fuel suppl|oil suppl"),
    ("tattoo", r"tattoo|piercing|body art"),
    ("care", r"home care|senior care|elderly care|caregiv|care home|assisted living|nursing home|in.home care|home health|live.in care|mobility (aid|equipment)|hearing aid"),
    # Split out of "health" on 2026-08-12: one shared photo set put a massage
    # photo on a dentist's page. Dental first, then hands-on wellness.
    ("dental", r"dentist|dental|orthodont|denture|endodont|periodont|hygienist|implant|invisalign|braces|teeth whit"),
    ("wellness", r"chiroprac|physio|massage|osteopath|acupunc|podiat|reflexolog|sports therap|wellness|\bspa\b|beauty clinic|aesthetic"),
    ("health", r"medical|clinic|optic|health|therapist|therapy|pharmac|mammograph|nursing agency|contact lens|x.?ray|radiolog|doctor|\bgp\b|veterinar|\bvet\b"),
    ("beauty", r"salon|barber|hairdress|\bhair\b|nail|beauty|lash|brow|aesthetic|tanning|makeup|waxing"),
    ("arts", r"music (school|lesson|instructor|teacher|college|conservator)|dance (school|class|studio|instructor|company|hall)|art (school|studio|gallery|class|centre|center|dealer|museum)|musical instrument|drama school|\bacting\b|choir|ballet|pottery|craft (school|workshop)"),
    ("fitness", r"\bgym\b|fitness|martial|jiu|karate|boxing|yoga|pilates|crossfit|self defen|parkour|personal train"),
    ("laundry", r"laundr|dry clean|launderette|tailor|alteration|seamstress|garment|ironing"),
    ("professional", r"\blaw\b|law firm|lawyer|legal|solicitor|attorney|account|\btax\b|bookkeep|financial|insurance|notary|architect|surveyor|life coach|business coach|recruit|consultant|consulting|logistics|currency exchange|money transfer|telecom|bureau de change"),
    ("property", r"estate agent|real estate|realtor|letting agent|lettings|property management|mortgage|conveyanc|apartment rental|holiday rental|property rental"),
    ("education", r"tutor|tuition|driving (school|instructor|test)|nursery|childcare|child care|day ?care|preschool|kindergarten|academy|language school|training cent"),
    ("photography", r"photograph|photo studio|videograph|photo ?booth|video production|video editing|film production|portrait studio|photo agency"),
    ("food", r"restaurant|cafe|coffee|bakery|baker\b|\bbar\b|\bpub\b|takeaway|take.?out|food truck|\bdeli\b|pizzer|pizza|diner|bistro|cater|brewery|winery|distiller|butcher|grocer"),
    ("events", r"wedding|event plan|party hire|party rental|party plan|\bdj\b|banquet|venue hire|marquee|balloon|event manage|costume"),
    ("hospitality", r"hotel|motel|hostel|bed and breakfast|guest ?house|holiday let|campsite|caravan park|\binn\b|resort"),
    ("travel", r"travel agen|tour agen|tour operator|sightseeing|excursion|safari|cruise|whale watching|tourist inform|\btours?\b"),
    ("transport", r"taxi|minicab|private hire|chauffeur|limousine|\blimo\b|coach (company|hire|charter)|bus (company|charter|service|tour)|airport transfer|shuttle|school bus|ambulance"),
    ("funeral", r"funeral|crematori|undertaker|cremation|memorial service|casket|coffin"),
    ("farm", r"\bfarm|agricultur|equestrian|stable|livestock|dairy|poultry|orchard|vineyard|apiar|horse (riding|boarding|breed|train|rental)|\btractor\b|egg suppl|agistment|bonsai|plant nursery"),
    ("grounds", r"landscap|lawn|garden|\btree\b|arborist|hedge|turf|paving|patio|pressure wash|power wash|grounds"),
    ("leisure", r"golf|bowling|arcade|escape room|climbing|paintball|laser tag|shooting range|archery|ski (school|rental|club|repair)|surf school|trampoline|adventure park|go.?kart|amusement|snooker|pool hall|karaoke|casino|nightclub"),
    ("marine", r"\bboat|marine|yacht|marina|sailing|kayak|canoe|scuba|dive (shop|club|centre|center)|fishing charter|jet ski|watercraft"),
    ("pool", r"\bpool\b|swimming pool|hot tub|jacuzzi"),
    ("cleaning", r"clean|janitor|\bmaid\b|pest control|hygiene|sanit|housekeep"),
    ("pet", r"\bpet\b|groom|\bdog\b|\bcat\b|veterin|kennel|cattery|animal"),
    ("removals", r"removal|moving company|movers|man and van|junk|rubbish|waste|skip hire|hauling|courier|self storage|storage unit|relocat|recycl|\bscrap\b"),
    ("security", r"locksmith|alarm|cctv|surveillance|security system|access control|fire protection|fire extinguisher"),
    ("repair", r"appliance|computer repair|laptop repair|phone repair|mobile repair|screen repair|electronics repair|printer repair|small engine|mower repair|watch repair|shoe repair|luggage repair|clock|washing machine|dishwasher|fridge|freezer|oven repair|tumble dryer|white goods|sewing machine|lamp repair|vacuum repair"),
    ("metalwork", r"weld|metal fabricat|fabricat|machining|machinist|\bsteel\b|foundry|blacksmith|sheet metal|\bcnc\b|metal work|metal suppl|metal finish|metal polish|engineering works"),
    ("stone", r"stonemason|stone mason|\bstone\b|granite|marble|quartz|worktop|monument|headstone|stone carv|stone cut"),
    ("interiors", r"furniture|upholster|interior design|fitted wardrobe|kitchen fitter|kitchen showroom|curtain|blinds\b|carpet (suppl|fitter|install|manufactur|wholesal)|\brug\b|mattress|sofa|cabinet maker|awning"),
    ("glass", r"glazier|glazing|\bglass\b|window install|window suppl|window tint|window film|conservatory|double glaz"),
    ("signage", r"sign shop|signage|sign ?writer|printing|print shop|printer|embroidery|banner|vinyl wrap|screen print|engraving"),
    ("tech", r"it support|it services|computer|software|web design|web develop|marketing|digital agency|\bseo\b|managed service|network|cyber|app develop"),
    ("trades", r"contractor|construct|builder|building|handy|paint|carpent|joiner|electric|fenc|excavat|renovat|remodel|garage ?door|home improvement|materials|gravel|restoration|utility|flooring|tiler|scaffold|driveway|decking|tool (rental|hire)|plant hire|equipment suppl|industrial|machinery|abrasive|bearing suppl|pipe suppl|packaging|concrete|sandblast|retaining wall|welding suppl"),
    ("retail", r"florist|flower|boutique|\bshop\b|\bstore\b|\bmarket\b|gift|jewel|antique|\bbook|\btoy|bicycle|\bbike\b"),
]
# Neutral catch-all. Falling back to roofing put roof photos on a pet groomer.
DEFAULT_TRADE_SET = "local"

# Trades that travel to the customer need the job address. Everyone else needs
# to know roughly where the customer is, and nothing more.
ADDRESS_LABEL = {
    "motorcycle": "Town or area",
    "marine": "Town or area",
    "farm": "Property address",
    "glass": "Property address",
    "interiors": "Property address",
    "stone": "Property address",
    "arts": "Town or area",
    "leisure": "Town or area",
    "travel": "Town or area",
    "transport": "Pick-up address",
    "funeral": "Town or area",
    "metalwork": "Town or area",
    "roofing": "Property address",
    "plumbing": "Property address",
    "trades": "Property address",
    "grounds": "Property address",
    "cleaning": "Property address",
    "energy": "Property address",
    "pool": "Property address",
    "removals": "Property address",
    "security": "Property address",
    "repair": "Property address",
    "care": "Property address",
    "events": "Event address",
    "auto": "Town or area",
    "dental": "Town or area",
    "wellness": "Town or area",
    "health": "Town or area",
    "fitness": "Town or area",
    "beauty": "Town or area",
    "professional": "Town or area",
    "pet": "Town or area",
    "retail": "Town or area",
    "food": "Town or area",
    "tattoo": "Town or area",
    "laundry": "Town or area",
    "property": "Town or area",
    "education": "Town or area",
    "photography": "Town or area",
    "hospitality": "Town or area",
    "signage": "Town or area",
    "tech": "Town or area",
    "local": "Town or area",
}

# Inter and Roboto are banned. Every pairing below leads with a distinctive
# display face over Plus Jakarta Sans, the body font that has held up across
# these builds.
FONT_PRESETS = {
    "Solid and trustworthy": ("Oswald", "500;600;700"),
    "Modern and premium": ("Sora", "500;600;700"),
    "Friendly and local": ("Bricolage Grotesque", "500;600;700"),
    "Bold and hard to ignore": ("Archivo", "600;700;800"),
}
DEFAULT_FONT = "Solid and trustworthy"
BODY_FONT = "Plus Jakarta Sans"

PALETTE_PRESETS = {
    "Solid and trustworthy": {
        "primary": "#1E3A5F", "primary_dark": "#15293F", "primary_slate": "#2C4660",
        "accent": "#E8821E", "accent_light": "#F4A94C", "accent_dark": "#C26A12",
        "neutral": "#F5F3EF", "neutral_dim": "#E4E0D8", "silver": "#9AA3AD", "ink": "#1A1F26",
    },
    "Modern and premium": {
        "primary": "#14212B", "primary_dark": "#0B1319", "primary_slate": "#283A47",
        "accent": "#C9A227", "accent_light": "#E0C05A", "accent_dark": "#9C7B18",
        "neutral": "#F7F5F0", "neutral_dim": "#E6E2D9", "silver": "#A2A8AE", "ink": "#15191D",
    },
    "Friendly and local": {
        "primary": "#0E7C4A", "primary_dark": "#08492B", "primary_slate": "#2A6B4F",
        "accent": "#F2B705", "accent_light": "#FFD34D", "accent_dark": "#C29200",
        "neutral": "#F6F5F0", "neutral_dim": "#E5E3DA", "silver": "#9BA5A0", "ink": "#18201C",
    },
    "Bold and hard to ignore": {
        "primary": "#161616", "primary_dark": "#000000", "primary_slate": "#2E2E2E",
        "accent": "#FF4A1C", "accent_light": "#FF7A55", "accent_dark": "#CC3510",
        "neutral": "#F4F4F2", "neutral_dim": "#E2E2DE", "silver": "#9C9C9C", "ink": "#101010",
    },
}

BANNED_CHARS = {"—": "em dash", "–": "en dash", "‘": "curly quote",
                "’": "curly quote", "“": "curly quote", "”": "curly quote"}


def deep_merge(base, incoming):
    """Merges the second generation pass onto the first. Incoming wins."""
    for key, value in (incoming or {}).items():
        if isinstance(value, dict) and isinstance(base.get(key), dict):
            deep_merge(base[key], value)
        else:
            base[key] = value
    return base


# Legal suffixes nobody says out loud. "Summit Roofing Incorporated" is written
# on the paperwork; every human calls them Summit Roofing.
LEGAL_SUFFIXES = [
    "incorporated", "corporation", "limited", "ltd", "ltd.", "inc", "inc.",
    "llc", "l.l.c.", "llp", "plc", "pty", "pty.", "co.", "company",
    "gmbh", "bv", "nv", "srl", "sa", "ag",
]


def display_name(raw):
    """
    The name to actually print. Strips trailing legal suffixes and tidy-ups so
    copy reads the way a person would say it.

    Deliberately conservative: it only removes a suffix from the END, and never
    reduces the name to nothing. "Co" without a full stop is left alone because
    it is a real word in names like "Bloom Co Flowers".
    """
    # Trailing punctuation is kept during matching so "Co." (an abbreviation of
    # Company) is stripped while a bare "Co" survives, because plenty of brands
    # genuinely end in it, as in "The Roofing Co".
    name = re.sub(r"\s+", " ", str(raw or "").strip()).strip(" ,-&")
    if not name:
        return ""
    changed = True
    while changed:
        changed = False
        for suffix in LEGAL_SUFFIXES:
            pattern = rf"[\s,]+{re.escape(suffix)}$"
            candidate = re.sub(pattern, "", name, flags=re.I).strip(" ,-&")
            # Never strip away the whole name, and never leave a stub.
            if candidate and candidate.lower() != name.lower() and len(candidate) > 2:
                name = candidate
                changed = True
                break
    return name.strip(" ,.-&") or re.sub(r"\s+", " ", str(raw or "").strip())


def slugify(value):
    value = unicodedata.normalize("NFKD", str(value)).encode("ascii", "ignore").decode()
    value = re.sub(r"[^a-zA-Z0-9]+", "-", value).strip("-").lower()
    return re.sub(r"-{2,}", "-", value) or "site"


def pick_trade_set(trade_text, business_name=""):
    """The business name is evidence too: "Summit Roofing" filed as
    "Contractor" is still a roofer."""
    text = (str(trade_text or "") + " " + str(business_name or "")).lower()
    for key, pattern in TRADE_PATTERNS:
        if re.search(pattern, text):
            return key
    return DEFAULT_TRADE_SET


def owner_block(answers):
    """
    The section of the prompt describing what the owner wants.

    Two modes. If they filled the form, quote them, because their own words are
    what makes the copy land. If this came from a scrape, say so plainly and let
    the model reason from the trade instead. It must never be told to invent a
    quote from an owner nobody has spoken to.
    """
    told = [answers.get(k) for k in
            ("bottleneck", "ninety_day_win", "work_wanted", "customer_worry", "edge")]
    if any(told):
        return f"""WHAT THE OWNER TOLD US, IN THEIR OWN WORDS
  What is holding them back: {answers.get('bottleneck') or 'not said'}
  What they want to change in 90 days: {answers.get('ninety_day_win') or 'not said'}
  The work they want more of: {answers.get('work_wanted') or 'not said'}
  What customers worry about before booking: {answers.get('customer_worry') or 'not said'}
  What they do better than competitors: {answers.get('edge') or 'not said'}"""

    status = (answers.get("website_status") or "").strip()
    return f"""WE HAVE NOT SPOKEN TO THIS OWNER. Everything below came from their
public Google listing, so do NOT write anything as if they said it, and do not
invent quotes, opinions or history.

  Their current web presence: {status or 'unknown'}

Work from what is typically true for a {answers.get('trade')} in
{answers.get('town')}: the jobs of that trade that are worth the most, the
things customers of that trade normally worry about before booking, and the
reasons people pick one over another. Write it as our confident view of what
this business should be saying, not as a report of what they told us."""


def build_prompt(answers, trade_set):
    mapping = "\n".join(f"  {k}: {v}" for k, v in SECTION_MAPPING.items())
    return f"""You are writing the copy for a local business website. Return ONLY valid JSON.

THE BUSINESS
  Name: {answers['business_name']}
  Trade: {answers['trade']}
  Main town: {answers['town']}
  Owner: {answers['owner_name']}

{owner_block(answers)}

FACTS YOU MAY STATE AS TRUE (they told us these, so they are not invented).
Only use the ones that are filled in. Never round them up or embellish them.
  Years trading: {answers.get('years_trading') or 'not given, do not mention'}
  Team size: {answers.get('team_size') or 'not given, do not mention'}
  Accreditations: {answers.get('accreditations') or 'not given, do not mention'}
  Position on price: {answers.get('price_position') or 'not given'}

VOICE: if the team size is "Just me", write in the first person, "I". Anything
larger, write "we". Never mix the two.
PRICE: if they are premium, the copy defends value and never competes on being
cheap. If they are the cheapest, say so plainly. If middle, avoid price talk.

THIS IS THE WHOLE POINT: the copy must obviously answer the owner's own words
above. Someone reading it should recognise their situation immediately. Lead on
the work they want more of. Handle the customer worry directly and early. Build
the difference they named into the story rather than listing generic benefits.
How each answer should show up:
{mapping}

HARD RULES
  - Never invent reviews, testimonials, customer names, ratings, years in
    business, number of jobs, awards or statistics. You do not know them.
  - No em dashes, no en dashes, no emoji, no curly quotes. Plain ASCII only.
    Use commas, full stops or brackets instead.
  - British plain English, how a tradesperson actually speaks. Short sentences.
    No corporate filler, no "unparalleled", no "we pride ourselves".
  - Speak to the customer as "you". Talk about their problem, not the company's
    greatness.
  - Every headline must be specific to this trade and town, never generic.

RETURN EXACTLY THIS JSON SHAPE, no extra keys, no commentary:
{{
  "meta": {{ "title": "under 60 chars, business name plus trade plus town",
             "description": "under 155 chars" }},
  "company": {{ "name": "{answers['business_name']}",
                "shortName": "one or two words",
                "tagline": "under 8 words, concrete not fluffy",
                "description": "2 sentences about what they do and who for",
                "serviceRegion": "the area covered" }},
  "copy": {{
    "hero": {{ "eyebrow": "SHORT UPPERCASE AREA LINE",
               "headline": "under 12 words, the promise, ALL CAPS",
               "subheadline": "1 sentence under 25 words",
               "imageAlt": "describes the hero photo" }},
    "heroTrustChips": ["3 short proof chips, 2 to 4 words each"],
    "trustClaims": ["3 short claims, 3 to 6 words each"],
    "formHeader": "under 6 words",
    "formSubtext": "1 short sentence",
    "buttonText": "under 4 words",
    "footerCta": "1 sentence",
    "cta": {{ "label": "SHORT UPPERCASE", "heading": "under 10 words",
              "body": "1 sentence" }},
    "founder": {{ "label": "SHORT UPPERCASE", "heading": "under 10 words",
                  "para1": "2 to 3 sentences in the owner's voice, first person",
                  "para2": "2 to 3 sentences, covers what they do better",
                  "vision": "1 sentence", "mission": "1 sentence" }}
  }},
  "services": [
    {{ "slug": "kebab-case", "name": "2 to 4 words",
       "body": "2 sentences" }}
  ],
  "why_choose_us": ["6 items, each one short sentence answering the owner's stated problem"],
  "process_steps": [
    {{ "n": 1, "title": "2 to 3 words", "body": "1 sentence" }}
  ],
  "faq": [
    {{ "q": "a real question this trade gets asked",
       "a": "2 to 3 sentences, direct and honest" }}
  ],
  "special_offers": [
    {{ "label": "under 5 words", "description": "1 sentence, no invented discounts" }}
  ],
  "previous_projects": [
    {{ "alt": "describes a typical job photo for this trade", "category": "1 to 2 words" }}
  ]
}}

If they gave accreditations, work them into "trustClaims" and "heroTrustChips"
as plain text, exactly as stated and never embellished. Do not output a
trust_badges key: those are association logo images we do not have files for,
and inventing them is not an option.

COUNTS: exactly 4 services, 6 why_choose_us, 4 process_steps, 6 faq,
2 special_offers, 4 previous_projects, 3 heroTrustChips, 3 trustClaims.
"""


def build_sections_prompt(answers):
    """
    Second pass: the section headings and secondary pages.

    These live in the template's baseline config, so anything left ungenerated
    renders the demo client's roofing copy on a plumber's site. Splitting them
    from the core pass keeps each response small enough to come back reliably,
    and the two run concurrently so it costs no extra wall clock.
    """
    return f"""You are writing section headings and secondary page copy for a local
business website. Return ONLY valid JSON.

  Business: {answers['business_name']}
  Trade: {answers['trade']}
  Town: {answers['town']}
  Areas covered: {answers.get('areas') or answers['town']}
  The work they want more of: {answers.get('work_wanted') or 'infer what is most valuable for this trade'}
  What customers worry about: {answers.get('customer_worry') or 'infer what customers of this trade normally worry about'}
  What they do better: {answers.get('edge') or 'infer a credible strength for this kind of business, stated as our view not their quote'}

HARD RULES
  - Every heading must be specific to THIS trade and town. Never mention any
    other trade. If this business is not a roofer, the words roof, slate,
    gutter and chimney must not appear anywhere.
  - Never invent statistics, years in business, numbers of jobs, or reviews.
    Where a number would normally go, write something true and general instead.
  - No em dashes, no en dashes, no emoji, no curly quotes. Plain ASCII only.
  - British plain English. Short. No corporate filler.

RETURN EXACTLY THIS SHAPE:
{{
  "copy": {{
    "submitButton": "under 4 words, includes the business short name",
    "privacyLine": "1 short reassurance sentence about their details",
    "mobileCallLabel": "under 3 words",
    "copyright": "the business name",
    "services": {{ "heading": "under 8 words", "body": "1 sentence listing what they do" }},
    "whyChoose": {{ "label": "SHORT UPPERCASE", "heading": "under 9 words" }},
    "gallery": {{ "heading": "under 9 words", "body": "1 sentence" }},
    "process": {{ "body": "1 sentence", "badgeText": "2 to 3 words" }},
    "offers": {{ "heading": "under 8 words", "detail": "1 sentence, no invented discount" }},
    "reviews": {{ "heading": "under 7 words" }},
    "faq": {{ "label": "SHORT UPPERCASE", "heading": "under 8 words" }},
    "blog": {{ "label": "SHORT UPPERCASE", "heading": "under 8 words", "body": "1 sentence" }},
    "serviceAreas": {{ "heading": "trade plus area, under 8 words", "body": "1 sentence" }},
    "serviceAreaCard": {{ "heading": "under 7 words", "body": "1 sentence naming nearby areas" }}
  }},
  "blog_posts": [
    {{ "slug": "kebab-case", "title": "a genuinely useful article title for this trade",
       "category": "1 to 2 words", "excerpt": "1 sentence",
       "body": "3 short paragraphs of real practical advice, separated by \\n\\n" }}
  ],
  "pages": {{
    "about": {{
      "heroLabel": "About plus business name", "heroHeadline": "under 10 words",
      "storyHeading": "under 7 words", "storyClosing": "1 sentence",
      "crewHeading": "under 7 words", "crewBody": "2 sentences",
      "crewCaption": "1 short caption", "valuesIntro": "1 sentence",
      "values": [ {{ "title": "2 to 3 words", "text": "1 sentence" }} ]
    }},
    "serviceAreas": {{
      "mapHeading": "under 7 words", "mapBody": "1 sentence",
      "citiesFallback": "1 short sentence", "readyHeading": "under 7 words",
      "readyBody": "1 sentence",
      "coverageHighlights": [ {{ "title": "an area name", "body": "1 sentence" }} ]
    }}
  }}
}}

COUNTS: exactly 2 blog_posts, 3 pages.about.values, 3 pages.serviceAreas.coverageHighlights.
"""


def normalise_answers(answers):
    """
    Cleans the scraped values BEFORE anything sees them, so the model writes
    "Halloway Roofing" everywhere rather than us find-and-replacing "Ltd" out of
    finished copy afterwards. Keeps the legal name for the record.
    """
    raw = answers.get("business_name") or ""
    clean = display_name(raw)
    if clean and clean != raw:
        answers["legal_name"] = raw
        answers["business_name"] = clean
    return answers


def add_display_fields(config, answers):
    """
    Writes a `_display` block: the ONLY values any page should print about the
    business. Computed once here so the site, the proposal and the email can
    never disagree, and so a missing or awkward field degrades in one place
    rather than in three.

    Anything absent becomes an empty string. Every consumer must treat empty as
    "hide this element" rather than printing a gap or the word "undefined".
    """
    raw_name = (config.get("company") or {}).get("name") or answers.get("business_name") or ""
    phone = str(answers.get("phone") or "").strip()
    street = str(answers.get("address") or "").strip()
    town = str(answers.get("town") or "").strip()
    postcode = str(answers.get("postal_code") or "").strip()

    rating = (config.get("reviews") or {}).get("rating") or 0
    count = (config.get("reviews") or {}).get("totalReviewCount") or 0

    # Google Maps usually returns the FULL address in one field, already
    # containing the town and postcode. Appending them again produced
    # "88 Duncan Ave W, Penticton, BC V2A 7J7, Canada, Penticton, V2A 7J7".
    parts = [street] if street else []
    for extra in (town, postcode):
        if extra and extra.lower() not in street.lower():
            parts.append(extra)
    one_line = ", ".join(parts)

    config["_display"] = {
        # Spoken form, no legal suffix.
        "name": display_name(raw_name),
        "town": town,
        "phone": phone,
        # One-line address, deduplicated, only the parts we actually have.
        "address": one_line,
        "streetOnly": street,
        "postcode": postcode,
        "mapsUrl": str(answers.get("google_maps_url") or "").strip(),
        # Drives which observation the proposal leads with. Scraper-derived, so
        # it decides an angle and is never printed on the page verbatim.
        "websiteStatus": str(answers.get("website_status") or "").strip(),
        "website": str(answers.get("website") or "").strip(),
        "facebook": str(answers.get("facebook") or "").strip(),
        "instagram": str(answers.get("instagram") or "").strip(),
        # Only present when both halves are real, so no "0.0 from 0 reviews".
        "reviewLine": f"{rating:.1f} from {count} Google reviews" if rating and count else "",
    }
    return config


def scrub_banned(value):
    """Replaces the banned characters. Applied to every string."""
    if isinstance(value, str):
        # Absorb the spaces around a dash so "a — b" becomes "a, b" and never
        # "a , b". Models emit dashes despite being told not to, so this pass is
        # load-bearing, not belt and braces.
        out = re.sub(r"\s*[—–]\s*", ", ", value)
        out = re.sub(r"\s+([,.;:!?])", r"\1", out)
        out = out.replace("‘", "'").replace("’", "'")
        out = out.replace("“", '"').replace("”", '"')
        # Strip emoji and other symbol/pictograph codepoints.
        out = "".join(c for c in out if unicodedata.category(c) not in ("So", "Cs"))
        return out
    if isinstance(value, list):
        return [scrub_banned(v) for v in value]
    if isinstance(value, dict):
        return {k: scrub_banned(v) for k, v in value.items()}
    return value


def deleak(value, replacements):
    """Swaps any surviving baseline identity for this client's."""
    if isinstance(value, str):
        out = value
        for token, placeholder in BASELINE_TOKENS.items():
            if token in out:
                out = out.replace(token, replacements.get(placeholder, placeholder))
        return out
    if isinstance(value, list):
        return [deleak(v, replacements) for v in value]
    if isinstance(value, dict):
        return {k: deleak(v, replacements) for k, v in value.items()}
    return value


WORDMARK_FONT = "/System/Library/Fonts/Supplemental/Arial Bold.ttf"


def make_wordmark(name, palette, destination_dir):
    """
    Text wordmark for clients with no logo, written as BOTH logo.webp and
    logo.svg. The template requests logo.webp first and only falls back to the
    svg via an onError handler, so shipping the webp keeps the browser console
    clean instead of logging a 404 on every page load.
    """
    label = name.upper()[:26]
    hex_colour = palette["primary"].lstrip("#")
    rgb = tuple(int(hex_colour[i:i + 2], 16) for i in (0, 2, 4))

    from PIL import Image, ImageDraw, ImageFont

    scale = 3  # render large, downscale for a crisp result on retina
    font = ImageFont.truetype(WORDMARK_FONT, 26 * scale)
    probe = ImageDraw.Draw(Image.new("RGBA", (1, 1)))
    box = probe.textbbox((0, 0), label, font=font)
    width, height = box[2] - box[0] + 8 * scale, 44 * scale

    image = Image.new("RGBA", (width, height), (0, 0, 0, 0))
    draw = ImageDraw.Draw(image)
    draw.text((4 * scale - box[0], (height - (box[3] - box[1])) // 2 - box[1]),
              label, font=font, fill=rgb + (255,))
    image.resize((width // scale, height // scale), Image.LANCZOS).save(
        destination_dir / "logo.webp", "WEBP", quality=92, method=6
    )

    svg_width = max(160, len(label) * 15)
    (destination_dir / "logo.svg").write_text(
        f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {svg_width} 44" '
        f'width="{svg_width}" height="44" role="img" aria-label="{name}">'
        f'<text x="0" y="31" font-family="Helvetica, Arial, sans-serif" '
        f'font-size="26" font-weight="800" letter-spacing="-0.5" '
        f'fill="{palette["primary"]}">{label}</text></svg>'
    )


def compose_config(answers, generated, trade_set):
    vibe = answers.get("vibe") or DEFAULT_FONT
    if vibe not in PALETTE_PRESETS:
        vibe = DEFAULT_FONT
    palette = PALETTE_PRESETS[vibe]
    heading_font, heading_weights = FONT_PRESETS[vibe]
    slug = slugify(answers["business_name"])

    areas = [a.strip() for a in re.split(r"[,\n/]+", answers.get("areas") or answers["town"]) if a.strip()]

    config = dict(generated)
    config["assets"] = {"base": f"/sites/{slug}"}
    # Whose address the enquiry form should ask for. A roofer needs to know which
    # house to go to; a gym asking a new member for their "property address"
    # reads as a form built for somebody else's business. Decided here rather
    # than by the model, because it is a fact about the trade, not a judgement.
    config["copy"] = {
        **(config.get("copy") or {}),
        "addressLabel": ADDRESS_LABEL.get(trade_set, "Town or area"),
    }
    config["palette"] = palette
    config["typography"] = {
        "heading": heading_font,
        "body": BODY_FONT,
        "headingFontUrl": f"https://fonts.googleapis.com/css2?family={heading_font.replace(' ', '+')}:wght@{heading_weights}&display=swap",
        "bodyFontUrl": f"https://fonts.googleapis.com/css2?family={BODY_FONT.replace(' ', '+')}:wght@400;500;600;700&display=swap",
    }
    # Anything the Google Maps scraper already knows is used verbatim. Their real
    # address in the footer and a working Maps link is most of what makes a demo
    # feel genuinely built for them rather than generated at them.
    # 3% of scraped listings have no phone and some have no email. Both must
    # degrade to empty rather than producing a dead "tel:" link.
    phone = (answers.get("phone") or "").strip()
    config["contact"] = {
        "phone": phone,
        "phoneTelLink": ("tel:" + re.sub(r"[^\d+]", "", phone)) if phone else "",
        "email": (answers.get("email") or "").strip(),
        "googleMapsUrl": answers.get("google_maps_url") or None,
        "mapsEmbedUrl": answers.get("maps_embed_url") or None,
    }
    street = (answers.get("address") or "").strip()
    postcode = (answers.get("postal_code") or "").strip()
    region = (answers.get("region") or "").strip()
    config["address"] = {
        "street": street,
        "city": answers["town"],
        "state": region,
        "zip": postcode,
        "full": ", ".join([p for p in (street, answers["town"], postcode) if p])
                or answers["town"],
        "lat": answers.get("lat"), "lng": answers.get("lng"),
    }
    if answers.get("facebook") or answers.get("instagram"):
        config["social"] = {
            "facebook": answers.get("facebook") or None,
            "facebookReviews": None,
        }
    config["serviceAreas"] = areas
    # team.founder is an OBJECT in the template, not a string. Assigning a bare
    # name here would replace the object and leave components reading
    # founder.displayName undefined, which renders as a blank founder section.
    # Most scraped leads have NO owner name on the listing, so every use of it
    # must survive an empty string. Falling back to the business name keeps the
    # founder section reading naturally instead of showing a blank or crashing.
    owner_name = (answers.get("owner_name") or "").strip()
    short_name = config["company"].get("shortName") or config["company"]["name"]
    first_name = owner_name.split()[0] if owner_name else ""
    config["team"] = {
        "founder": {
            "name": owner_name or short_name,
            "displayName": first_name or short_name,
            "title": f"Owner, {short_name}" if owner_name else short_name,
            "yearsExp": "",
            "expLabel": f"{(answers.get('trade') or 'work').lower()} in {answers.get('town') or 'your area'}",
        },
        "founders": [],
    }
    config["credit"] = {"agency": answers.get("agency_name") or "", "url": None}

    # Their REAL Google rating and review count, straight off the Maps listing
    # the scraper already read. Those are public facts about their own business,
    # so stating them is honest. The review TEXT is never invented, so items
    # stays empty and the placeholder section explains why.
    def _number(value):
        try:
            return float(str(value).strip() or 0)
        except (TypeError, ValueError):
            return 0

    rating = _number(answers.get("rating") or answers.get("review_rating"))
    review_count = int(_number(answers.get("reviews") or answers.get("review_count")))
    config["reviews"] = {
        "rating": rating if 0 < rating <= 5 else 0,
        "googleCount": review_count,
        "facebookCount": 0,
        "totalReviewCount": review_count,
        "googleLabel": "Google", "facebookLabel": "Facebook",
        "googleStat": f"{rating:.1f} from {review_count} reviews" if rating and review_count else "",
        "facebookStat": "",
        "items": [],
    }

    # Photo filenames are fixed by the library; the LLM only writes their alt
    # text. The list is trimmed to the four images each set ships: asked for four
    # the model has returned six, and the extras arrived with no filename, which
    # rendered as a request for "work/undefined" and a 404 on the page.
    projects = list(config.get("previous_projects") or [])[:4]
    for index, project in enumerate(projects):
        project["filename"] = f"project-{index + 1}.webp"
    config["previous_projects"] = projects

    # trust_badges are IMAGE files under /badges, and we ship none, so any value
    # here renders as a broken image. Accreditations live in trustClaims as text
    # instead. Forced empty rather than trusted, because the model volunteered
    # string entries here even when told not to.
    config["trust_badges"] = []
    config["press_logos"] = []

    return config, slug, trade_set


def stage_assets(slug, trade_set, company_name, palette):
    source = TRADES / trade_set
    if not source.is_dir():
        raise SystemExit(f"error: no photo set for '{trade_set}' at {source}")
    destination = SITES / slug
    if destination.exists():
        shutil.rmtree(destination)
    shutil.copytree(source, destination)
    make_wordmark(company_name, palette, destination)
    return destination


def check_output(config, answers):
    """Fails the build rather than emailing a lead something broken."""
    problems = []
    blob = json.dumps(config, ensure_ascii=False)

    for char, label in BANNED_CHARS.items():
        if char in blob:
            problems.append(f"banned character present ({label})")

    for token in BASELINE_TOKENS:
        if token.lower() in blob.lower():
            problems.append(f"baseline identity leaked into config: {token}")

    # The baseline client is a roofer. Any roofing vocabulary surviving on a
    # non-roofing site means a field was never generated and is still showing
    # the demo client's copy.
    if pick_trade_set(answers.get("trade"), answers.get("business_name")) != "roofing":
        own_name = str(answers.get("business_name") or "").lower()
        for word in ("roofing", "roofer", "re-roof", "slate", "chimney", "gutter"):
            # A roofing word in the business's own name is not a leak.
            if word in own_name:
                continue
            if re.search(rf"\b{re.escape(word)}", blob, re.I):
                problems.append(
                    f"baseline trade language leaked into a {answers['trade']} site: '{word}'"
                )
                break

    for count_key, expected in (("services", 4), ("why_choose_us", 6),
                                ("faq", 6), ("process_steps", 4)):
        actual = len(config.get(count_key) or [])
        if actual < expected:
            problems.append(f"{count_key}: expected {expected}, got {actual}")

    if not (config.get("company") or {}).get("name"):
        problems.append("company.name missing")
    if (answers.get("business_name") or "").lower() not in blob.lower():
        problems.append("business name never appears in the generated copy")

    if config.get("reviews", {}).get("items"):
        problems.append("reviews were fabricated, they must stay empty")

    # Every badge resolves to an image file we do not ship, so a non-empty list
    # is guaranteed broken images on the page.
    for key in ("trust_badges", "press_logos"):
        if config.get(key):
            problems.append(f"{key} must be empty, there are no badge image files")

    return problems


DEMO_ANSWERS = {
    "business_name": "Fenwick Plumbing & Heating",
    "trade": "Plumber and heating engineer",
    "town": "Harrogate",
    "areas": "Harrogate, Knaresborough, Wetherby, Ripon",
    "owner_name": "Dave Fenwick",
    "email": "dave@fenwickplumbing.example",
    "phone": "01423 555 0198",
    "bottleneck": "Enquiries come in but they do not turn into jobs",
    "ninety_day_win": "Better quality jobs, fewer time wasters",
    "work_wanted": "Full bathroom installs and boiler replacements, not dripping taps",
    "customer_worry": "That the price will jump halfway through, or nobody turns up when they said",
    "edge": "I do every job myself, same day quotes, and I clean up properly after",
    "vibe": "Solid and trustworthy",
    "agency_name": "{{YOUR_BUSINESS}}",
}


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--answers", type=Path, help="JSON file of form answers")
    parser.add_argument("--demo", action="store_true", help="use the built-in sample lead")
    parser.add_argument("--out", type=Path, help="also write the config here")
    args = parser.parse_args()

    if args.demo:
        answers = dict(DEMO_ANSWERS)
    elif args.answers:
        answers = json.loads(args.answers.read_text())
    else:
        parser.error("pass --answers <file> or --demo")

    problems = validate_answers(answers)
    if problems:
        raise SystemExit("form answers rejected:\n  " + "\n  ".join(problems))

    normalise_answers(answers)

    trade_set = pick_trade_set(answers["trade"], answers.get("business_name"))
    print(f"building '{answers['business_name']}' ({answers['trade']}) -> photo set: {trade_set}")

    # Both passes are independent, so run them together: the build is as slow as
    # the slower call rather than the sum of the two.
    with ThreadPoolExecutor(max_workers=2) as pool:
        core_future = pool.submit(generate_json, build_prompt(answers, trade_set))
        sections_future = pool.submit(generate_json, build_sections_prompt(answers))
        try:
            core, core_model = core_future.result()
            sections, sections_model = sections_future.result()
        except LLMError as error:
            raise SystemExit(f"generation failed:\n{error}")

    generated = deep_merge(scrub_banned(core), scrub_banned(sections))
    model = f"{core_model} + {sections_model}"
    config, slug, trade_set = compose_config(answers, generated, trade_set)

    config = deleak(config, {
        "{{COMPANY}}": config["company"]["name"],
        "{{SHORTNAME}}": config["company"].get("shortName", config["company"]["name"]),
        "{{REGION}}": config["company"].get("serviceRegion", answers.get("town") or ""),
        "{{TOWN}}": answers.get("town") or "",
        "{{PHONE}}": answers.get("phone") or "",
        "{{DOMAIN}}": f"{slug}.example",
    })

    problems = check_output(config, answers)
    if problems:
        print("\nGENERATED CONFIG REJECTED:")
        for problem in problems:
            print("  -", problem)
        raise SystemExit(1)

    CONFIGS.mkdir(parents=True, exist_ok=True)
    SITES.mkdir(parents=True, exist_ok=True)
    stage_assets(slug, trade_set, config["company"]["name"], config["palette"])

    config["_generated"] = {
        "model": model, "lane": "free-api", "date": date.today().isoformat(),
        "trade_set": trade_set,
    }
    config["_demo"] = {"proposalUrl": answers.get("proposal_url") or ""}
    add_display_fields(config, answers)
    target = CONFIGS / f"{slug}.json"
    target.write_text(json.dumps(config, indent=2, ensure_ascii=False))
    if args.out:
        args.out.write_text(json.dumps(config, indent=2, ensure_ascii=False))

    print(f"\nconfig written: {target}")
    print(f"assets staged:  {SITES / slug}")
    print(f"preview at:     /?site={slug}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
