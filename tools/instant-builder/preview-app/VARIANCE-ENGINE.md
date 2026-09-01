# The Variance Engine

Every site this factory builds shares one proven, conversion-first structure,
but no two have to look the same. Three dials in each client's
`brand-dna.layout` (plus palette, fonts, and photos) decide the look. The
factory sets them automatically per niche, and you can override any of them per
client.

## Why this exists

A fully locked template ships fast and converts, but if every client gets the
identical layout your portfolio looks templated and your prices stay low. The
variance engine keeps the determinism and the QA gates while letting each brand
read like a different studio built it. It never drops a conversion element: the
hero lead form, sticky call bar, trust strip, reviews, process risk-reversal,
FAQ, service areas, CTA banner, and local-business schema are present in every
combination.

## The three dials

### 1. Blueprint, the section order

`brand-dna.layout.blueprint`. Orders are defined in `src/config/blueprints.js`.

| Blueprint | Leads with | Use for |
|---|---|---|
| `trust-first` | reviews and founder right after the hero | urgent trades where the buyer wants proof fast: roofer, plumber, HVAC, restoration |
| `showcase-first` | services and work | visual jobs where the work sells: auto, remodel, landscaping, detailing, fencing |
| `story-first` | the founder's story | personal or boutique brands where the person is the brand: florist, salon, photographer, clinic |

All three render the same 13 sections, only resequenced. The conversion and
local-SEO SPINE (hero, trust strip, reviews, process, FAQ, service areas, CTA
banner) appears in every one.

### 2. Hero, the first screen

`brand-dna.layout.hero`. All three carry the same lead form (`HeroForm.jsx`).

| Hero | Looks like | Use for |
|---|---|---|
| `split-form` | headline left, lead form right | direct, high-intent trades. The default. |
| `full-bleed` | headline centered over the photo, form below | bold, image-led brands |
| `editorial-split` | airier headline left, form right, lighter overlay | a calmer, more premium first screen |

### 3. Vibe, the feel

`brand-dna.layout.vibe`. Sets `<html data-vibe>`, which drives corner radius,
card edge treatment, button shape, and eyebrow rhythm (see the VIBE LAYER block
in `src/index.css`).

| Vibe | Feel | Pairs with |
|---|---|---|
| `signal` | bold, industrial, sharp corners, hard island buttons, layered shadows | trades, dark themes. The default. |
| `editorial` | premium, calm, generous radii, hairline edges, pill buttons, wide eyebrows | boutique brands, serif type |
| `structural` | clean, modern, medium radii, soft diffused shadows | modern service brands, light themes |

### Optional, per-section variant overrides

`brand-dna.layout.sections` (object). Omit a key to use the blueprint default.
This is the extension point where per-section layout variants (for example a
bento vs grid Services section) are added over time.

## How it gets set

- **Automatic.** `tools/build-from-template.py` derives a default from
  `voice_register`:
  - `premium` -> story-first / editorial-split / editorial
  - `commercial` -> showcase-first / full-bleed / structural
  - `family` -> trust-first / split-form / signal
- **Override.** Stage 7 (the brand-dna agent) may write an explicit `layout`
  block into `brand-dna.json`, and you can edit `brand-dna.js` directly for a
  single client.

## The rule that keeps it safe

You can add new blueprints, but every blueprint must be a permutation of the
same 13 section ids and must still contain the full SPINE. Never edit a
component to drop a conversion element. The fidelity gates (Stage 10.4a / 10.4b
/ 10.4c) build their reference from the same `brand-dna`, so any allowed
archetype passes and only unauthorized component edits fail.

## Three reference builds

The bundled examples show the range from one engine:

| Niche | Blueprint | Hero | Vibe | Theme |
|---|---|---|---|---|
| Roofer | trust-first | split-form | signal | dark, copper |
| Car garage | showcase-first | full-bleed | structural | dark steel, red |
| Plumber | trust-first | editorial-split | structural | light, blue |
