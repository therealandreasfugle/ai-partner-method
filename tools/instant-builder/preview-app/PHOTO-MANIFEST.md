# Photo Manifest (website template)

Every `<img src=` and `style={{ backgroundImage }}` reference in the template
is catalogued here, categorised by source pool. Stage 10.1
(`tools/build-from-template.py`) reads this manifest to know which per-client
asset to swap into each slot.

The template ships with NO real asset files. Every `public/` slot is empty
until Stage 10.1 fills it from per-client `Pipeline Data/` outputs.

## Source pools

| Pool | Definition | Per-client source |
|------|------------|-------------------|
| `hero` | The big above-the-fold hero image (desktop + mobile variants) | `Pipeline Data/hero-image/hero-final-{desktop,mobile}.png` (Stage 9 output) |
| `owner` | Founder portrait | `[Client Name] Assets/photos/owner.{jpg,png,webp}` |
| `previous-projects` | In-section photos pulled from the client's project gallery (WhyChooseUs bg, blog covers, OurProcess illustration, OurWork tiles, hero secondary) | `[Client Name] Assets/photos/projects/*` |
| `team` | Optional Team section photos | `[Client Name] Assets/photos/team/*` |
| `badges` | Manufacturer / certification badges | `templates/{niche-slug}/niche-playbook/trust-badges/{name}.{png,svg}` looked up via `templates/{niche-slug}/niche-playbook/trust-signals.json` against `brandDNA.trust_badges[].filename` |
| `platforms` | Google / Facebook / BBB review pill logos | `references/assets/platforms/{google,facebook,bbb}-logo.svg` (verbatim, never per-client) |
| `pattern` | Background SVG pattern | `templates/website-template/src/assets/bg-patterns/{shape_motif}.svg` selected by `brandDNA.shape_motif` |
| `none` | Section has no photo (SVG/icon only) | n/a |

## Slots (the asset path contract)

Every per-client build writes files at these EXACT paths so component code never changes:

| Path | Pool | Dimension cap | WebP quality | Notes |
|------|------|---------------|--------------|-------|
| `public/logo.svg` (or `.png`) | (logo, special) | n/a | passthrough | SVG preferred. PNG fallback compressed via cwebp. |
| `public/hero-image.webp` | hero | 1920×1080 | 92 | Desktop hero. Set as Schema.org `image`. |
| `public/hero-image-mobile.webp` | hero | 828×1200 | 92 | Mobile hero. Picked via `<picture>` element. |
| `public/owner.webp` | owner | 640×800 | 88 | Founder portrait. |
| `public/badges/{name}.{png,svg}` | badges | passthrough | passthrough (q=92 if rasterised) | Filenames from `brandDNA.trust_badges[].filename`. Files copied from `templates/{niche-slug}/niche-playbook/trust-badges/`. Cleaned via `tools/clean-transparent-jpeg.py` if source JPEG had a checker pattern baked in. |
| `public/work/project-{n}.webp` | previous-projects | 1200×800 | 92 | OurWork gallery tiles. n = 1..6 typical. |
| `public/work/action-{n}.webp` | previous-projects | 1200×800 | 92 | Action shots (optional). |
| `public/work/action-video.mp4` | previous-projects (video) | 1280×720 | n/a | Optional video. Skip if client has no video. |
| `public/sections/why-choose-bg.webp` | previous-projects | 1600×900 | 92 | WhyChooseUs background photo. |
| `public/sections/services-bg.webp` | previous-projects | 1600×900 | 92 | Services section background. |
| `public/sections/process-illustration.webp` | previous-projects | 1200×800 | 92 | OurProcess section illustration. |
| `public/sections/blog-cover-{n}.webp` | previous-projects | 800×500 | 92 | Blog post covers (n = 1..6). |
| `public/team/{slug}.webp` | team | 480×600 | 88 | Optional team photos. Slug from `brandDNA.team[].photo_slug`. |
| `public/platforms/google-logo.svg` | platforms | passthrough | passthrough | Verbatim from `references/assets/platforms/`. |
| `public/platforms/facebook-logo.svg` | platforms | passthrough | passthrough | Verbatim. |
| `public/platforms/bbb-logo.svg` | platforms | passthrough | passthrough | Verbatim. |
| `public/patterns/{motif}.svg` | pattern | passthrough | n/a | Selected by `brandDNA.shape_motif` from `templates/website-template/src/assets/bg-patterns/`. |
| `public/favicon.{png,svg}` | (favicon) | 32×32 / 192×192 | passthrough | Generated from logo if missing. |

## Section-by-section slot reference

| Section | Image slots | Pool | Dimension hint |
|---------|-----------|------|----------------|
| `Hero.jsx` | `/hero-image.webp` + `/hero-image-mobile.webp` | hero | landscape, full-width |
| `TopBar.jsx` | (none) | none | |
| `Navbar.jsx` | `/logo.svg` | logo | square or wide-rect, height ~40px |
| `Layout.jsx` | (none, wraps everything) | none | |
| `TrustStrip.jsx` | `/badges/{name}.{png,svg}` per brandDNA.trust_badges[] | badges | mixed sizes, height ~64-96px |
| `Reviews.jsx` | (text + platform logos only) | platforms | platform logos at ~14-16px |
| `Founder.jsx` | `/owner.webp` | owner | portrait 4:5 |
| `Services.jsx` | `/sections/services-bg.webp` | previous-projects | landscape 16:9 |
| `WhyChooseUs.jsx` | `/sections/why-choose-bg.webp` | previous-projects | landscape 16:9 |
| `OurWork.jsx` | `/work/project-{n}.webp`, optional `/work/action-{n}.webp` + `/work/action-video.mp4` | previous-projects + video | mixed; project tiles 4:3, action shots 16:9 |
| `OurProcess.jsx` | `/sections/process-illustration.webp` | previous-projects | landscape 16:9 |
| `SpecialOffers.jsx` | (none, icon SVG inline) | none | |
| `Blog.jsx` | `/sections/blog-cover-{n}.webp` per post | previous-projects | landscape 16:9 |
| `FAQ.jsx` | `/logo.svg` | logo | |
| `ServiceAreas.jsx` | (Google Maps embed iframe, no img) | none | |
| `CTABanner.jsx` | `/logo.svg` | logo | |
| `Footer.jsx` | `/logo.svg` | logo | |
| `MobileCtaBar.jsx` | (none) | none | |
| `Ticker.jsx` | (none, text scroll) | none | |

## Page-level refs

| Page | Image slots | Pool |
|------|-----------|------|
| `pages/HomePage.jsx` | (composes the components above) | n/a |
| `pages/ContactPage.jsx` | `/hero-image.webp` | hero |
| `pages/GalleryPage.jsx` | full `/work/` pool | previous-projects |
| `pages/BlogPage.jsx` | `/sections/blog-cover-{n}.webp` | previous-projects |
| `pages/BlogPostPage.jsx` | per-post cover | previous-projects |
| `pages/FinancingPage.jsx` | (none) | none |

## Pattern selection

Background SVG patterns mount via `<BackgroundPattern motif={brandDNA.shape_motif} />` in
sections that need a backdrop pattern. Sections affected:

- Hero (subtle backdrop pattern)
- TrustStrip (top hairline pattern)
- WhyChooseUs (column-divider pattern)
- OurProcess (timeline rail pattern)
- CTABanner (corner accent pattern)

Pattern files at `templates/website-template/src/assets/bg-patterns/{polygon,triangle,wave,arc,dot-grid,hexagon,chevron,diamond,cross-hatch,mountain,topographic}.svg`.
