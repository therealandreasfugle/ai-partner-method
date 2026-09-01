# the website template Template (per-client base for the website-factory pipeline)

This directory holds the default template that Stage 10.1 clones per client.
The pipeline is "clone this template + overlay brand-dna + swap assets"
rather than "generate fresh per client". Layout, composition, and components
are LOCKED. Per-client variance is limited to:

- **paint**, palette CSS variables (rewritten by `scripts/inject-theme.mjs` at prebuild time)
- **copy**, every visible string (sourced from `Pipeline Data/copy/copy-deck.md`)
- **photos**, logo, hero (desktop + mobile), owner, projects, team, per-section (see PHOTO-MANIFEST.md)
- **trust badges**, looked up from `templates/{niche-slug}/niche-playbook/trust-signals.json` against `brandDNA.trust_badges[].filename`
- **palette + typography**, driven by `brandDNA.palette` + `brandDNA.typography`
- **theme mode**, `brandDNA.theme_mode` ("light" | "dark", single mode, no toggle)
- **background SVG pattern**, `brandDNA.shape_motif` selects from 11 patterns in `src/assets/bg-patterns/`

Nothing else varies.

## Stack

- Vite 8 + React 19.2 + React Router v7
- Tailwind CSS 3.4 (palette mapped to CSS variables in `src/index.css`)
- Plain JavaScript, no TypeScript

## File contract

```
templates/website-template/
├── BRAND-INVENTORY.md           # field-by-field map: every visible value in the template
├── PHOTO-MANIFEST.md            # asset path contract + source pool categorisation
├── README.md                    # this file
├── package.json                 # vite + react + tailwind, prebuild hook wired
├── tailwind.config.js           # palette references CSS variables
├── vite.config.js               # standard vite + react plugin
├── index.html                   # sentinel-driven head + JSON-LD
├── public/                      # per-client assets — ships EMPTY (Stage 10.1 fills)
│                                # see public/README.md for the file-name contract
├── scripts/
│   └── inject-theme.mjs         # vite prebuild hook: rewrites :root + font imports + html theme attribute
└── src/
    ├── App.jsx                  # router (11 routes)
    ├── main.jsx                 # React DOM entrypoint
    ├── index.css                # tailwind + :root palette (rewritten by prebuild)
    ├── assets/
    │   ├── bg-patterns/         # 11 SVG background patterns (polygon, triangle, wave, arc, ...)
    │   ├── corner-overlays/     # corner-decoration SVGs matching the bg-patterns
    │   └── platforms/           # public Google / Facebook / BBB brand logos for review pills
    ├── components/              # 19 components (Hero, Navbar, Footer, Reviews, Founder, etc.)
    ├── config/
    │   ├── brand-dna.js                  # per-client config (sentinel placeholders by default)
    │   ├── brand-dna.example.js # reference shape with sentinels for smoke test
    │   └── brand-dna.schema.json         # JSON Schema validator (Stage 10.1 enforces)
    └── pages/                   # 11 page-level components (HomePage, ContactPage, BlogPage, ...)
```

## Per-client build flow (Stage 10.1)

`tools/build-from-template.py --client "[Client Name]"`:

1. `cp -R templates/website-template/. clients/[X]/[X] Website/` (no node_modules, no dist)
2. Compose `src/config/brand-dna.js` from the client's pipeline outputs:
   - `Pipeline Data/intake/intake-form.json`
   - `Pipeline Data/research/research.json`
   - `Pipeline Data/strategy/strategy.json`
   - `Pipeline Data/copy/copy-deck.md`
   - `Pipeline Data/brand/brand-dna.json` (palette + typography + theme_mode + shape_motif + voice_register)
   - `Pipeline Data/brand-resonance/resonance.json` (optional, when Stage 7.5 has run)
3. Copy + optimise per-client assets to `public/` (see PHOTO-MANIFEST.md). Hero/owner/project/team/blog covers all WebP-ised via `tools/optimise-image.py`. Trust badges looked up from `templates/{niche-slug}/niche-playbook/trust-signals.json`. Platform logos copied verbatim from `references/assets/platforms/`. Selected pattern SVG copied from `src/assets/bg-patterns/{shape_motif}.svg` to `public/patterns/{shape_motif}.svg`.
4. `cd clients/[X]/[X] Website/ && npm install --silent && npm run build`. Vite's `prebuild` hook (`scripts/inject-theme.mjs`) regenerates `:root` palette + Google Fonts imports + `<html data-theme-mode="...">` from `brand-dna.js` BEFORE `vite build` reads them.
5. Validate `dist/`:
   - `index.html` exists and contains the client's company name
   - `assets/*.css` contains the client's palette hex values
   - **Zero forbidden strings** (any FORBIDDEN_STRINGS entry from build-from-template.py)
   - **Zero `__REQUIRED__` sentinels** in `src/config/brand-dna.js`

## Smoke test

The template ships with sentinel-only data. To smoke-test the build pipeline
against a fake client, copy `brand-dna.example.js` to `brand-dna.js`,
fill every sentinel with real values, then build:

```sh
cd templates/website-template
cp src/config/brand-dna.example.js src/config/brand-dna.js
# edit src/config/brand-dna.js, replace every __REQUIRED__*__ with a real value
npm install
npm run build
npm run preview
```

The template renders the locked layout with whatever values you filled in.
This confirms the build pipeline runs without breaking. Restore the placeholder
version with `git checkout src/config/brand-dna.js` when done.

## Background pattern library

11 SVG tile patterns at `src/assets/bg-patterns/{motif}.svg`. Each is a 200x200
viewBox, uses `currentColor` so the parent's `color` prop tints it, and tiles
via `<pattern patternUnits="userSpaceOnUse">`. The `<BackgroundPattern>` component
mounts them as absolutely-positioned overlays.

| Motif | Best for |
|-------|----------|
| polygon | Generic fallback, low-poly geometric |
| triangle | Sharp triangle grid, commercial / industrial |
| wave | Sine-wave ripples, family / organic |
| arc | Concentric arc segments, premium / heritage |
| dot-grid | Clean grid of dots, tech / minimal |
| hexagon | Honeycomb, industrial / precision |
| chevron | Forward-pointing chevrons, action / momentum |
| diamond | Diamond tile, precision / premium |
| cross-hatch | Diagonal cross, craft / heritage |
| mountain | Mountain peaks, rugged / outdoors |
| topographic | Concentric organic curves, mapped / geographic |

To add a new motif: drop `{name}.svg` into `bg-patterns/`, add `name` to the
`enum` in `brand-dna.schema.json`, and to `VALID_MOTIFS` in `BackgroundPattern.jsx`.

## Architecture notes

This template is the SHELL only. No real client assets or content ship with
the repo. Everything is sentinel-driven so a fresh clone produces a blank
build that the pipeline fills with per-client data at Stage 10.1.

Per-niche variants are built by Module 2D (`/build-niche-template`) which
scaffolds `templates/{niche-slug}/` inheriting from this baseline + a
niche-specific playbook at `templates/{niche-slug}/niche-playbook/`.
