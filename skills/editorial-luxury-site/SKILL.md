---
name: editorial-luxury-site
description: Build a premium "Editorial Luxury" one-page site, the fancy showpiece kind (sticky photo hero the page scrolls over, island glass nav, frosted-glass contact card, smooth scroll). Use when the user wants a luxury, high-end, expensive-feeling, or fancy site for a client, a premium landing page, or says "build one like the example". Fits real estate, boutique hotels, wellness, clinics, interiors, and any high-ticket local business.
---

# Editorial Luxury Site

A complete design language for premium one-page sites. It is not a template to recolor: it is a system of tokens, section grammar, and motion rules you re-execute with new copy and new photos for each client. A finished example lives in `example/` (open `example/index.html`, it runs with no build step). Live reference: https://apm-realestate.vercel.app

Use the website factory for standard client builds. Use THIS skill when the client is high-ticket and the site needs to feel expensive.

## Why it reads expensive (do not skip these)

1. Photography-first. Every section either is a photo or sits on one. UI chrome stays minimal.
2. Warm neutrals, never pure white or black. Canvas #FAF8F5, ink #1A1A1A, sand #F0ECE6.
3. ONE display font at ONE weight. No bold shouting anywhere on the page.
4. One radius (12px) for buttons, cards, and images. Pills only for badges and icon CTAs.
5. Scroll choreography instead of decoration: sticky hero curtain, staggered reveals, smooth scroll.
6. A dark immersive section as the emotional close.

## Tokens

```css
--bone: #FAF8F5;   /* canvas */
--ink:  #1A1A1A;   /* text, primary buttons */
--sand: #F0ECE6;   /* secondary buttons, warm surfaces */
/* glass: white at 10-30% alpha + backdrop-blur; hairlines at 8-16% alpha */
--r: 12px;
--ease: cubic-bezier(0.625, 0.05, 0, 1);        /* reveals */
--ease-soft: cubic-bezier(0.32, 0.72, 0, 1);    /* hovers */
```

Type: display = Varela Round at weight 400 only (all headings). Body = Plus Jakarta Sans 400/500/600. Never Inter, Roboto, Arial, or Open Sans. H1 `clamp(2.7rem, 6.2vw, 4.6rem)`.

For a different vertical you may shift the warmth (a spa can go slightly green-warm, a clinic slightly cooler) but keep the same structure: one warm canvas, one ink, one secondary surface.

## Section grammar (4 sections + footer, keep the count low)

1. **Sticky hero.** `position: sticky; top: 0; height: 100svh`, full-bleed golden-hour photo, soft dark scrim, pill badge, H1, one-line sub, dark + sand button pair, uppercase micro-caption bottom right. The rest of the page wraps in `.page { position: relative; z-index: 2; background: var(--bone) }` with a soft top shadow, so it slides OVER the pinned hero like a curtain.
2. **Editorial statement.** One huge display line, then one full-width photo with the 12px radius. The whitespace is the section.
3. **Showcase grid.** Centered pill label, H2, one-line sub, then a 2-column photo grid (1 column on mobile) with a meta row under each image and hover `scale(1.03)` over 600ms.
4. **Dark contact.** `min-height: 90svh` moody warm interior photo, frosted-glass form card (blur 20px, translucent inputs, warm-white submit), hairline divider, then a "prefer to talk" line with a pill CTA that has a nested icon circle.
5. **Footer.** Back to light. Four link columns (two on mobile), uppercase micro headings, hairline top bar.

Navigation is an island glass pill detached from the top: brand, links (hidden on mobile), and a dark pill CTA with the arrow in its own small circle.

## Motion rules

- Lenis smooth scroll from CDN, `lerp: 0.09`. Route anchor clicks through `lenis.scrollTo` so easing matches.
- Reveals via IntersectionObserver ONLY: elements start `opacity 0 / translateY(30px) / blur(8px)` and resolve over 1s with `--ease`, staggered 90ms. Never use scroll event listeners.
- Animate transform and opacity only. `backdrop-filter` only on fixed elements and the static contact card. Never animate blur on scrolling content: it kills mobile frame rate.
- Respect `prefers-reduced-motion`: reveals become visible, Lenis off.

## Photos: generate the set in ONE batch

Consistent light across every image is most of the luxury effect. Free stock cannot deliver a coherent luxury set. Generate all images in one run so they share the same golden-hour grade:

```bash
export OPENAI_API_KEY=sk-...        # or put it in a .env next to the script
python3 .claude/skills/editorial-luxury-site/scripts/gen_photos.py <your-site-dir>
```

Edit `STYLE` and `SHOTS` at the top of the script for the client's subject first. You need: 1 hero (dusk exterior with glowing interior light), 1 editorial wide, 4 showcase shots, 1 dark warm interior. Roughly 5 to 10 cents per image. Keep the style prefix identical for every shot.

## Build process

1. Copy `example/` to a new folder. Read all three files once so you know the moving parts.
2. Rewrite every line of copy for the client. Keep line lengths similar so the layout holds. Real business name, real locations, real offer. The example's "Terramar Estates" is fictional.
3. Edit the shot list in `gen_photos.py`, generate the client's photo set into `assets/`.
4. Adjust tokens only if the vertical demands different warmth.
5. QA (below), then deploy the folder to the student's Vercel as usual.

## QA checklist before handoff

- [ ] No emojis and no em or en dashes anywhere: `python3 -c "t=open('index.html').read(); assert chr(0x2014) not in t and chr(0x2013) not in t"` (repeat for css/js)
- [ ] Zero console errors on load
- [ ] Mobile pass at 390px: nav pill fits, grid is 1 column, form rows stack, hero text clears the buttons
- [ ] Scroll the full page once: every reveal fires, nothing stays invisible
- [ ] Images total under 1MB, hero has `fetchpriority="high"`, below-fold images `loading="lazy"`
- [ ] The curtain effect works: hero stays pinned while the page slides over it
