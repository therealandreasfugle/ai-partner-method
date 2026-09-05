#!/usr/bin/env python3
"""Generate a coherent photo set for an Editorial Luxury site (one batch = one light).

Usage:
    python3 gen_photos.py <site-dir>        # writes into <site-dir>/assets/

Needs OPENAI_API_KEY in the environment, or in a .env file next to this script
or in the current directory. gpt-image-1 first, dall-e-3 fallback.
Cost: roughly 5 to 10 cents per image. Edit STYLE and SHOTS per client.
"""
import base64, json, os, re, sys, urllib.request, urllib.error

# ---- EDIT PER CLIENT --------------------------------------------------------
STYLE = ("Professional architectural photography for a luxury real estate brand, "
         "Mediterranean coast, golden hour, warm amber and honey light, "
         "photorealistic, medium format look, soft long shadows, serene, "
         "no people, no text, no watermark.")

SHOTS = [
    ("hero.jpg", 1920, "Low modern minimalist villa with floor-to-ceiling glass, warm interior lights glowing, calm infinity pool in the foreground reflecting the sunset, olive trees, sea on the horizon at dusk."),
    ("editorial.jpg", 1920, "Wide establishing shot of a single-story modern stone and glass villa on a manicured lawn, late golden afternoon, long soft shadows, cypress trees in the distance."),
    ("villa-1.jpg", 1200, "White cubic modern villa with a palm tree and a clean turquoise pool, warm evening sun on the facade."),
    ("villa-2.jpg", 1200, "Timber and glass hillside villa overlooking the sea at dusk, interior lights on, terraced garden."),
    ("villa-3.jpg", 1200, "Modern Mediterranean courtyard with a sculptural olive tree, travertine stone walls and a slim water feature, warm side light."),
    ("villa-4.jpg", 1200, "Rooftop terrace with an infinity edge pool at sunset, lounge chairs, sea view, amber sky."),
    ("interior.jpg", 1920, "Moody luxury living room at night: curved warm plaster walls with hidden cove lighting, a lit fireplace, sculptural floor lamp, deep earth-tone sofa, an indoor olive tree, dark intimate atmosphere."),
]
# -----------------------------------------------------------------------------

def get_key():
    if os.environ.get("OPENAI_API_KEY"):
        return os.environ["OPENAI_API_KEY"]
    here = os.path.dirname(os.path.abspath(__file__))
    for env_path in (os.path.join(here, ".env"), os.path.join(os.getcwd(), ".env")):
        if os.path.exists(env_path):
            m = re.search(r'^OPENAI_API_KEY=(.+)$', open(env_path).read(), re.M)
            if m:
                return m.group(1).strip().strip('"\'')
    sys.exit("Set OPENAI_API_KEY in the environment or a .env file first.")

def call(key, model, prompt):
    body = {"model": model, "prompt": prompt, "n": 1}
    if model == "gpt-image-1":
        body.update({"size": "1536x1024", "quality": "medium"})
    else:
        body.update({"size": "1792x1024", "quality": "hd", "response_format": "b64_json"})
    req = urllib.request.Request("https://api.openai.com/v1/images/generations",
        data=json.dumps(body).encode(),
        headers={"Content-Type": "application/json", "Authorization": f"Bearer {key}"})
    with urllib.request.urlopen(req, timeout=300) as r:
        item = json.load(r)["data"][0]
    if item.get("b64_json"):
        return base64.b64decode(item["b64_json"])
    if item.get("url"):
        with urllib.request.urlopen(item["url"], timeout=120) as r:
            return r.read()
    return None

def compress(path, width):
    try:
        from PIL import Image
    except ImportError:
        return  # PIL optional; images just stay larger
    im = Image.open(path).convert("RGB")
    if im.width > width:
        im = im.resize((width, int(im.height * width / im.width)), Image.LANCZOS)
    im.save(path, quality=78, optimize=True, progressive=True)

def main():
    if len(sys.argv) < 2:
        sys.exit(__doc__)
    out = os.path.join(sys.argv[1], "assets")
    os.makedirs(out, exist_ok=True)
    key = get_key()
    fails = []
    for fname, width, shot in SHOTS:
        dest = os.path.join(out, fname)
        blob = None
        for model in ("gpt-image-1", "dall-e-3"):
            try:
                blob = call(key, model, f"{STYLE} {shot}")
                if blob:
                    break
            except urllib.error.HTTPError as e:
                print(f"{fname}: {model} HTTP {e.code} {e.read().decode()[:120]}")
            except Exception as e:
                print(f"{fname}: {model} ERR {str(e)[:100]}")
        if not blob:
            fails.append(fname)
            print(f"{fname}: FAILED")
            continue
        open(dest, "wb").write(blob)
        compress(dest, width)
        print(f"{fname}: OK {os.path.getsize(dest)//1024}KB")
    if fails:
        sys.exit(f"failed: {fails}")

if __name__ == "__main__":
    main()
