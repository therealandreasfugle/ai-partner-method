# AIPM Template Library

Twenty premium website templates built on one shared design system. Plain HTML, CSS, and
JavaScript. No build step, no framework, no npm install. Open a file and start editing.

All twenty are complete. Every one is verified at 1440px and 390px with a clean console,
no failed requests, no horizontal overflow, and every in-page link resolving.

Live gallery: https://aipm-templates.vercel.app

## Why it is built this way

Every template shares one core. A template is not a separate website, it is a set of token
values plus its own layout. That means:

- Reskinning a template to a client's brand is ten CSS variables, not a rewrite.
- A component built for one template is available to all of them.
- Students learn one system, not eighteen.

## Structure

```
core/
  tokens.css     the ten-variable contract and the fluid type scale
  core.css       reset, layout, and every shared component
  core.js        shared behaviours, all opt-in via data attributes
shared/
  avatars/       stock people used across templates
  thumbs/        gallery screenshots
templates/
  <slug>/
    index.html   the page
    theme.css    token overrides plus anything unique to this template
    assets/      this template's images and video
index.html       the gallery
```

## Reskinning a template for a client

Open the template's `theme.css` and change the `:root` block. That is the whole job for
colour. Everything reads from these:

| Variable | What it controls |
|---|---|
| `--background` | Page background |
| `--card` | Card fill and border |
| `--foreground` | Body text and headings |
| `--primary-cta` | Primary button fill |
| `--primary-cta-text` | Primary button label |
| `--secondary-cta` | Secondary button fill |
| `--secondary-cta-text` | Secondary button label |
| `--accent` | Highlights, stars, small accents |
| `--background-accent` | The soft ambient glow behind the page |
| `--radius` | Every rounded corner on the site |

Two more worth knowing: `--font-heading` swaps the display face, and `--section-head-size`
sets how big section headings run.

Type never needs per-breakpoint sizes. The scale (`--text-sm` through `--text-9xl`) is
fluid and switches to viewport units below 768px so headlines stay proportional on phones.

## Behaviours

`core.js` wires everything from data attributes, so a template only gets what its markup
asks for.

| Attribute | Effect |
|---|---|
| `data-letters` | Splits a button label so each glyph rolls up on hover |
| `data-fit` | Sizes display text to span its container exactly |
| `data-trail` | Cursor image trail across a section |
| `data-accordion` | Click-to-open panels (`data-accordion="multi"` allows several open) |
| `data-filter` + `data-cat` | Filter chips paired with filterable items |
| `data-carousel` | Horizontal scroller with prev/next buttons |
| `data-marquee` | Duplicates a track so it scrolls seamlessly |
| `.reveal` | Fades up on scroll |
| `.reveal-stagger` | Fades up children in sequence |

## Three things that will bite you

1. **`aspect-ratio` loses to the `width`/`height` HTML attributes** unless `height: auto`
   is also set. The core reset handles it; do not remove that line.
2. **`scrollWidth` clamps to the element's box.** Measuring text to fit it to a container
   needs a `Range`, which is what `data-fit` uses.
3. **The nine-stop button shadow is the thing that makes buttons look expensive.** It is
   not decoration you can flatten to a single shadow without the whole page looking cheap.

## Regenerating the gallery

The index page is generated from `shared/templates.json`. A template counts as live as soon
as `templates/<slug>/index.html` exists, so after adding one:

```
python3 shared/build-gallery.py
```

Templates without a screenshot in `shared/thumbs/` fall back to a swatch of their palette.

## Forms

Every template ships with no backend. Rather than silently swallowing a lead, an unwired
form says so when submitted. To start collecting, add an endpoint to the form tag:

```html
<form class="form" data-form data-endpoint="https://your-endpoint">
```

The fields POST as JSON. A silent form that looks like it worked is worse than no form.

## Deploying

The whole folder is static. Point any host at it. For Vercel:

```
vercel deploy --prod
```

Individual templates can also be lifted out and deployed alone. Copy the template folder
plus `core/` and `shared/`, then fix the two relative paths at the top of its `index.html`.

## Swapping the imagery

Every template ships with placeholder photography. Replace the files in the template's
`assets/` folder, keeping the same filenames, and the site updates with no code changes.
Free sources that do not require attribution: Pexels, Unsplash, Pixabay. For video:
Coverr and Mixkit are built for website hero clips.
