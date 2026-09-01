#!/usr/bin/env python3
"""
build_photo_library.py

Builds the per-industry photo sets the generated sites use.

    python3 tools/build_photo_library.py            # all sets
    python3 tools/build_photo_library.py --only grounds trades

Every set needs the same filenames, because the website template requests them
by fixed path:

    hero-image.webp  hero-image-mobile.webp  owner.webp
    work/project-1..4.webp
    sections/services-bg.webp  sections/why-choose-bg.webp
    sections/process-illustration.webp  sections/blog-cover-1..2.webp

Photos come from Pexels: free for commercial use, no attribution required.
Search terms describe the ACTION rather than the industry, which is the advice
on the AIPM resources page and gives far better results ("technician repairing"
beats "HVAC").

Nothing here overwrites an existing set unless --force is passed, so a set that
has been hand-curated is never clobbered by a rerun.
"""

import argparse
import io
import json
import os
import sys
import time
import urllib.parse
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
TRADES = ROOT / "preview-app" / "public" / "trades"

# The eight sets, mapped to the categories actually present in the lead sheet.
# Each entry: hero search, owner/portrait search, work searches, section searches.
SETS = {
    "roofing": {
        "hero": "roofer working on roof",
        "owner": "tradesman portrait smiling",
        "work": ["new roof house", "roof shingles close up", "roof repair worker", "house exterior roof"],
    },
    "plumbing": {
        "hero": "plumber fixing pipes",
        "owner": "plumber portrait",
        "work": ["modern bathroom", "boiler installation", "pipe repair hands", "kitchen sink plumbing"],
    },
    "auto": {
        "hero": "mechanic working on car",
        "owner": "mechanic portrait",
        "work": ["car engine repair", "clean car detailing", "car workshop garage", "tyre change"],
    },
    "grounds": {
        "hero": "landscaper mowing lawn",
        "owner": "gardener man portrait garden",
        "work": ["landscaped garden", "tree surgeon working", "garden patio paving", "hedge trimming"],
    },
    "trades": {
        "hero": "builder working on site",
        "owner": "builder portrait helmet",
        "work": ["painter painting wall", "carpenter working wood", "construction site work", "electrician working on wiring"],
    },
    # Split out of "plumbing" on 2026-08-12, because HVAC has its own template
    # and a plumber's photos sell the wrong trade.
    "hvac": {
        "hero": "air conditioning unit installation",
        "owner": "hvac technician portrait",
        "work": ["air conditioning outdoor unit", "hvac technician servicing unit",
                 "ventilation ductwork ceiling", "engineer checking air con filter"],
    },
    # "health" used to cover dentists, massage therapists and pharmacies at
    # once, so a dentist's page shipped a photo of a massage room. Three sets
    # now, and none of them borrows another's imagery.
    "dental": {
        "hero": "modern dental clinic interior",
        "owner": "dentist portrait smiling",
        "work": ["dental chair treatment room", "dentist examining patient teeth",
                 "dental hygienist cleaning teeth", "bright dental practice reception"],
    },
    "wellness": {
        "hero": "massage therapy treatment room",
        "owner": "massage therapist portrait",
        "work": ["physiotherapy session", "chiropractor adjustment",
                 "spa treatment room candles", "acupuncture treatment"],
    },
    "health": {
        "hero": "modern medical clinic waiting room",
        "owner": "doctor portrait friendly",
        "work": ["doctor consulting patient", "pharmacy interior shelves",
                 "optician eye test", "medical reception desk"],
    },
    "fitness": {
        "hero": "gym training workout",
        "owner": "fitness trainer portrait",
        "work": ["gym equipment interior", "martial arts training", "personal trainer coaching", "fitness class group"],
    },
    "beauty": {
        "hero": "hairdresser cutting hair salon",
        "owner": "hairdresser portrait",
        "work": ["nail salon manicure", "barber shop interior", "beauty salon treatment", "woman blow dry hair salon"],
    },
    "professional": {
        "hero": "modern office meeting",
        "owner": "businessman smiling portrait office",
        "work": ["accountant calculator documents", "handshake business", "accountant working laptop", "bright office workspace desks"],
    },
    "cleaning": {
        "hero": "cleaner cleaning home",
        "owner": "cleaning lady smiling portrait",
        "work": ["clean modern kitchen", "housekeeper cleaning glass door indoor", "vacuum carpet cleaning", "tidy living room"],
    },
    "pet": {
        "hero": "dog groomer grooming dog",
        "owner": "vet portrait with dog",
        "work": ["happy dog groomed", "pet grooming salon", "cat brushing grooming indoor", "dog bath wash"],
    },
    "retail": {
        "hero": "florist arranging flowers",
        "owner": "shop owner portrait",
        "work": ["flower shop interior", "bakery display", "boutique shop interior", "gift shop counter"],
    },
    # Added after routing the scraper's own 42 target niches and finding seven
    # with no set at all: junk removal, movers, locksmiths, appliance repair,
    # pool service, catering and sign shops were all landing on florist photos.
    "food": {
        "hero": "chef cooking in restaurant kitchen",
        "owner": "chef portrait smiling",
        "work": ["restaurant interior dining", "catering buffet food", "plated gourmet dish", "coffee and pastry cafe"],
    },
    "removals": {
        "hero": "movers carrying boxes to van",
        "owner": "delivery man portrait uniform",
        "work": ["moving boxes empty room", "removal van loading", "storage warehouse units", "wrapped furniture moving"],
    },
    "security": {
        "hero": "locksmith fixing door lock",
        "owner": "handyman portrait smiling tools",
        "work": ["man fixing door handle with screwdriver", "security camera on wall", "house keys hand", "alarm keypad panel"],
    },
    "repair": {
        "hero": "technician repairing appliance",
        "owner": "repair technician portrait",
        "work": ["washing machine repair", "repairing electronics circuit board", "repairman fixing oven", "tools on repair bench"],
    },
    "pool": {
        "hero": "swimming pool backyard sunny",
        "owner": "pool technician portrait",
        "work": ["clean backyard swimming pool", "pool cleaning equipment", "outdoor hot tub", "luxury backyard pool house"],
    },
    "signage": {
        "hero": "large format printer print shop",
        "owner": "print shop worker portrait",
        "work": ["storefront sign lettering", "printing press machine close up", "modern storefront sign business", "shop window graphics"],
    },
    "photography": {
        "hero": "photographer taking photo with camera",
        "owner": "photographer portrait with camera",
        "work": ["photo studio softbox lights", "wedding photography couple", "camera lens equipment", "editing photos computer"],
    },
    "property": {
        "hero": "estate agent showing house to couple",
        "owner": "estate agent woman portrait suit",
        "work": ["modern house exterior for sale", "for sale sign outside house", "staged living room interior", "house keys handover"],
    },
    "education": {
        "hero": "tutor teaching student at desk",
        "owner": "teacher smiling portrait school",
        "work": ["children learning in classroom", "driving instructor lesson car", "guitar music lesson", "students studying together"],
    },
    "events": {
        "hero": "decorated wedding reception venue",
        "owner": "woman organiser portrait smiling indoors",
        "work": ["party celebration people", "dj mixing at event", "elegant event table setting", "birthday party decorations"],
    },
    "tech": {
        "hero": "it technician working on computers",
        "owner": "it consultant portrait office",
        "work": ["server room network cables", "laptop repair technician", "web designer working on screen", "modern office computer setup"],
    },
    "laundry": {
        "hero": "laundromat washing machines row",
        "owner": "dry cleaner shop worker portrait",
        "work": ["clean folded laundry stack", "dry cleaning clothes rack", "tailor sewing alterations", "ironing shirts"],
    },
    "care": {
        "hero": "caregiver helping elderly person",
        "owner": "nurse portrait smiling",
        "work": ["nurse with elderly woman smiling", "caregiver holding hands", "home nursing visit", "senior smiling at home"],
    },
    "energy": {
        "hero": "solar panel installation on roof",
        "owner": "engineer portrait hard hat smiling",
        "work": ["solar panels on house roof", "electric car charging", "attic insulation installation", "solar panel field sunny"],
    },
    "tattoo": {
        "hero": "tattoo artist tattooing client",
        "owner": "tattoo artist portrait",
        "work": ["tattoo studio interior", "tattoo machine close up", "finished arm tattoo", "tattoo artist sketching design"],
    },
    "hospitality": {
        "hero": "hotel reception lobby",
        "owner": "hotel concierge portrait smiling",
        "work": ["comfortable hotel bedroom", "bed and breakfast interior", "hotel breakfast table", "guest house exterior"],
    },
    # Added after routing all 3,968 Google business categories through the table.
    # These twelve were the real clusters still landing on the neutral set: not
    # embassies and national parks, but businesses a student would actually pitch.
    "motorcycle": {
        "hero": "motorcycle mechanic workshop",
        "owner": "biker portrait leather jacket",
        "work": ["motorcycle showroom", "motorbike engine repair", "custom motorcycle close up", "motorcycle on open road"],
    },
    "marine": {
        "hero": "boats moored in marina",
        "owner": "boat captain portrait",
        "work": ["yacht sailing on sea", "boat engine maintenance", "harbour boats sunset", "fishing boat deck"],
    },
    "farm": {
        "hero": "tractor in green field countryside",
        "owner": "farmer portrait smiling",
        "work": ["cows in green field", "farm shop fresh produce", "horse riding stable", "tractor harvesting field"],
    },
    "glass": {
        "hero": "man installing new window frame",
        "owner": "tradesman portrait smiling outdoors",
        "work": ["modern windows house exterior", "large glass patio doors", "sliding glass door", "double glazed window fitting"],
    },
    "interiors": {
        "hero": "modern living room interior design",
        "owner": "interior designer woman portrait",
        "work": ["fitted wardrobe bedroom", "carpet flooring in room", "curtains living room window", "handmade wooden furniture"],
    },
    "stone": {
        "hero": "stonemason cutting stone",
        "owner": "craftsman portrait workshop apron",
        "work": ["granite kitchen worktop", "marble slab texture", "stone wall masonry", "engraved memorial stone"],
    },
    "arts": {
        "hero": "music teacher giving lesson",
        "owner": "music teacher portrait",
        "work": ["dance class in studio", "artist painting in studio", "piano lesson hands", "art gallery wall paintings"],
    },
    "leisure": {
        "hero": "golf course green players",
        "owner": "golf instructor portrait smiling",
        "work": ["bright bowling alley lanes", "indoor climbing wall", "golf driving range", "arcade games neon"],
    },
    "travel": {
        "hero": "tourists on sightseeing tour",
        "owner": "tour guide portrait smiling",
        "work": ["scenic travel destination", "travel agent helping customer office", "tour bus mountain road", "packed suitcase travel"],
    },
    "transport": {
        "hero": "taxi driver in car",
        "owner": "chauffeur portrait suit",
        "work": ["yellow taxi cab street", "minibus coach parked", "car interior passenger seats", "driver loading luggage into car"],
    },
    "funeral": {
        "hero": "white lilies memorial flowers",
        "owner": "man in suit portrait respectful",
        "work": ["memorial candles lit", "peaceful cemetery headstone", "white funeral flower arrangement", "quiet chapel interior"],
    },
    "metalwork": {
        "hero": "welder welding metal sparks",
        "owner": "welder portrait workshop",
        "work": ["metal fabrication workshop", "cnc machine cutting metal", "steel beams fabrication", "metal grinding sparks"],
    },
    # The universal fallback. Anything the routing cannot place lands here, so it
    # must not look like any one trade: friendly people, a counter, a handshake.
    # Falling back to the florist set put flowers on junk removal companies.
    "local": {
        "hero": "shop owner serving customer counter",
        "owner": "small business owner portrait smiling",
        "work": ["local shop storefront", "business handshake customer", "small team working together", "person answering phone at desk"],
    },
}

SECTION_QUERIES = {
    "services-bg": "abstract texture background",
    "why-choose-bg": "workshop tools background",
    "process-illustration": "team working together",
    "blog-cover-1": "notebook desk flat lay",
    "blog-cover-2": "tools on workbench",
}


def pexels_key():
    env = ROOT.parent / "Agentic Workflows" / ".env"
    if env.is_file():
        for line in env.read_text().splitlines():
            if line.startswith("PEXELS_API_KEY="):
                return line.split("=", 1)[1].strip()
    return os.environ.get("PEXELS_API_KEY", "")


# Pexels sits behind Cloudflare, which rejects the default Python user agent
# with "error code: 1010" before the request ever reaches the API. A browser
# UA is required on every call, search and download alike.
BROWSER_UA = ("Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 "
              "(KHTML, like Gecko) Chrome/126.0 Safari/537.36")


def search(query, key, orientation="landscape", size="large", rank=0):
    """One Pexels result. Returns the direct image URL or None."""
    url = ("https://api.pexels.com/v1/search?"
           + urllib.parse.urlencode({"query": query, "per_page": rank + 3,
                                     "orientation": orientation, "size": size}))
    request = urllib.request.Request(url, headers={
        "Authorization": key, "User-Agent": BROWSER_UA, "Accept": "application/json"})
    try:
        with urllib.request.urlopen(request, timeout=30) as response:
            data = json.loads(response.read())
    except Exception as error:
        print(f"      search failed: {str(error)[:80]}")
        return None
    photos = data.get("photos") or []
    if len(photos) <= rank:
        return None
    # "large" is ~1880px wide, enough for a hero without being enormous.
    # rank lets the same query serve several slots without repeating a photo.
    chosen = photos[rank]
    return chosen["src"].get("large") or chosen["src"].get("original")


def fetch_image(url, destination, width, height):
    """Downloads, crops to the aspect the template expects, saves as webp."""
    from PIL import Image
    try:
        request = urllib.request.Request(url, headers={"User-Agent": BROWSER_UA})
        with urllib.request.urlopen(request, timeout=60) as response:
            raw = response.read()
    except Exception as error:
        print(f"      download failed: {str(error)[:80]}")
        return False

    image = Image.open(io.BytesIO(raw)).convert("RGB")
    target = width / height
    source = image.width / image.height
    # Centre crop to the target aspect, then resize. Squashing a photo to fit is
    # the fastest way to make a site look cheap.
    if source > target:
        new_width = int(image.height * target)
        left = (image.width - new_width) // 2
        image = image.crop((left, 0, left + new_width, image.height))
    else:
        new_height = int(image.width / target)
        top = (image.height - new_height) // 3   # bias up: faces and roofs sit high
        image = image.crop((0, top, image.width, top + new_height))

    image = image.resize((width, height), Image.LANCZOS)
    destination.parent.mkdir(parents=True, exist_ok=True)
    image.save(destination, "WEBP", quality=82, method=6)
    return True


# filename -> (query source, width, height, orientation)
# The two hero entries share a query AND an orientation on purpose: that makes
# them the same photograph, cropped wide for desktop and tall for mobile. Two
# different photos in the same hero slot reads as a template.
LAYOUT = [
    ("hero-image.webp", "hero", 1600, 1000, "landscape"),
    ("hero-image-mobile.webp", "hero", 800, 1000, "landscape"),
    ("owner.webp", "owner", 800, 1000, "portrait"),
    ("work/project-1.webp", "work0", 1000, 750, "landscape"),
    ("work/project-2.webp", "work1", 1000, 750, "landscape"),
    ("work/project-3.webp", "work2", 1000, 750, "landscape"),
    ("work/project-4.webp", "work3", 1000, 750, "landscape"),
    ("sections/services-bg.webp", "sec:services-bg", 1400, 900, "landscape"),
    ("sections/why-choose-bg.webp", "sec:why-choose-bg", 1400, 900, "landscape"),
    ("sections/process-illustration.webp", "sec:process-illustration", 1000, 750, "landscape"),
    ("sections/blog-cover-1.webp", "sec:blog-cover-1", 1000, 600, "landscape"),
    ("sections/blog-cover-2.webp", "sec:blog-cover-2", 1000, 600, "landscape"),
]


def build_set(name, spec, key, force=False, slots=None):
    folder = TRADES / name
    print(f"\n{name}")
    made = 0
    resolved = {}   # (query, orientation) -> url, so shared slots share a photo
    for filename, source, width, height, orientation in LAYOUT:
        if slots and filename not in slots:
            continue
        destination = folder / filename
        if destination.exists() and not (force or slots):
            continue
        if source == "hero":
            query = spec["hero"]
        elif source == "owner":
            query = spec["owner"]
        elif source.startswith("work"):
            query = spec["work"][int(source[-1])]
        else:
            query = SECTION_QUERIES[source.split(":", 1)[1]]

        cache_key = (query, orientation)
        if cache_key in resolved:
            url = resolved[cache_key]
        else:
            url = search(query, key, orientation=orientation)
            resolved[cache_key] = url
            time.sleep(0.4)   # stay well inside the free rate limit

        if not url:
            print(f"   {filename:44} no result for '{query}'")
            continue
        if fetch_image(url, destination, width, height):
            print(f"   {filename:44} {query}")
            made += 1
    print(f"   {made} images written")
    return made


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--only", nargs="*", help="build only these sets")
    parser.add_argument("--slot", nargs="*", help="rebuild only these filenames, e.g. owner.webp work/project-3.webp")
    parser.add_argument("--force", action="store_true", help="replace existing images")
    args = parser.parse_args()

    key = pexels_key()
    if not key:
        raise SystemExit("no PEXELS_API_KEY found")

    names = args.only or list(SETS)
    total = 0
    for name in names:
        if name not in SETS:
            print(f"unknown set: {name}")
            continue
        total += build_set(name, SETS[name], key, force=args.force, slots=args.slot)
    print(f"\n{total} images written across {len(names)} sets")
    print(f"library: {TRADES}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
