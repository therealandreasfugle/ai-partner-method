# `public/` (per-client assets get dropped here at build time)

This directory is intentionally empty in the repo. Stage 10.1 of the factory
pipeline (`tools/build-from-template.py`) clones this template per client and
populates the slots below by copying from the client's `Assets/` directory.

## Required slots

| File | Source pool | Notes |
|---|---|---|
| `logo.svg` (or `logo.png`) | `[Client] Assets/logo/` | Primary client logo. SVG preferred. |
| `hero-image.webp` | Stage 9 hero output | 1920×1080 desktop hero. |
| `hero-image-mobile.webp` | Stage 9 hero output | 828×1200 mobile variant. |
| `owner.webp` | `[Client] Assets/photos/owner.*` | Founder portrait, 640×800. |
| `favicon.svg` | derived from logo | optional; falls back to logo. |

## Optional asset directories

- `work/` — project gallery photos (`project-1.webp` through `project-N.webp` + optional `action-*.webp`)
- `badges/` — trust badges per `templates/{niche-slug}/niche-playbook/trust-signals.json`
- `team/` — additional team photos when the template renders a Team section

These directories ship empty. The student never drops files directly into
this template — files are written into the client's `Assets/` folder during
Stages 0-9, then copied here by Stage 10.1.
