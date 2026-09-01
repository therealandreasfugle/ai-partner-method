---
name: distinctive-frontend
description: Create visually distinctive, high-impact frontend interfaces that avoid generic AI aesthetics. Applies four-vector approach: typography extremes, cohesive color themes, orchestrated motion, and atmospheric backgrounds.
---

# Distinctive Frontend Design

Create visually distinctive, high-impact frontend interfaces that avoid generic "AI slop" aesthetics. This skill applies the four-vector approach: typography, color/theme, motion, and backgrounds.

## Core Principles

**Avoid distributional convergence**: Reject default choices (Inter/Roboto fonts, purple gradients, minimal animations). Instead, make bold, cohesive design decisions that create memorable interfaces.

**Think in systems**: Use CSS variables, design tokens, and coordinated choices across all four dimensions rather than isolated tweaks.

## 1. Typography - Use Extremes

- **Go to extremes**: Use 100-200 (thin) vs 800-900 (black), not safe 400 vs 600
- **Create hierarchy through weight contrast**, not just size
- Avoid generic system fonts — use distinctive pairings like Space Grotesk + JetBrains Mono, Playfair Display + Source Sans, Bebas Neue + DM Sans

## 2. Color & Theme - Commit to Cohesion

- **Draw from cultural references**: Movies, art movements, IDE themes, nature
- **Use CSS variables** for systematic color application
- **Avoid**: Safe blues/purples, low-contrast pastels
- Themes: Cyberpunk, Brutalist, Nordic Minimalism, Vaporwave — pick one and commit

## 3. Motion - Orchestrated Page Load

- **Prioritize page-load choreography** over scattered micro-interactions
- **Use staggered reveals** (0.1s, 0.2s, 0.3s delays) to guide attention
- Use `cubic-bezier(0.16, 1, 0.3, 1)` easing
- Respect `prefers-reduced-motion`

## 4. Backgrounds - Atmospheric Depth

- **Layer gradients and patterns** instead of flat colors
- Radial gradients, mesh gradients, noise/grain overlays
- Subtle grid patterns add depth without noise

## Anti-AI-Slop Checklist

❌ Avoid:
- Inter or Roboto as primary font
- Font weights 400, 500, 600 (too safe)
- Purple-blue gradient backgrounds
- No page-load animation
- Flat white/gray backgrounds

✅ Aim for:
- Distinctive font pairing
- Extreme weight contrast (100-200 vs 800-900)
- Cohesive color theme with clear reference point
- Orchestrated entrance animation
- Layered/textured backgrounds
