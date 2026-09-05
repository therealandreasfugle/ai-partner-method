---
name: apple-scroll-hero
description: Build an Apple-style scroll-scrub hero section where a video plays forward frame by frame as the user scrolls, like Apple product pages. Use when the user wants a scroll-driven video hero, a "scrolly-telling" product intro, or asks for a hero that scrubs video on scroll.
---

# Apple-Style Scroll-Scrub Hero

A hero section where scrolling drives the video playhead. The page loads, the user scrolls, and the hero video scrubs forward frame by frame in sync with scroll position. Looks expensive; it is two pieces of work.

Source: technique shared by Mark (newsletter, July 2026). Pairs well with the `higgsfield` MCP for generating the clip without leaving the chat, or Palmier Pro for editing one.

## The two pieces

1. **A video to scrub.** Short and high frame-rate: 3 to 6 seconds of smooth footage beats a long clip, because scrubbing exposes every frame. Generate with the Higgsfield MCP, render from Palmier Pro, or use client footage.
2. **A component that maps scroll position to `video.currentTime`.**

## Component spec

Place the video at `/public/hero.mp4` (or the project's static asset path). Create `ScrollHero.tsx` (adapt path to the project: `app/components/` or `src/components/`).

The component must:

- Render a tall container, 300vh, so there is scroll distance to drive the video
- Inside it, sticky-position a `<video>` element that fills the viewport, muted, paused, loading the hero clip
- On mount, set up a scroll listener computing progress through the container (0 to 1)
- Map that progress to `video.currentTime` (progress times `video.duration`)
- Drive the playhead through a `requestAnimationFrame` loop with lerp smoothing, factor 0.22, so the playhead glides instead of snapping frame to frame
- Clean up both the listener and the rAF loop on unmount
- Set `playsInline`, `preload="auto"`, and `muted` on the video element so it works on mobile
- Fade the video in over the first 200ms after mount so it does not pop in cold

Mount it as the first section of the home page. After building, run the dev server and have the user scroll the hero to test.

## Tuning notes

- **Stutters on first scroll:** the video is still buffering; `preload="auto"` exists for exactly this. Keep the file small.
- **Floatier vs snappier:** adjust the 0.22 lerp factor. Lower = more glide, higher = tighter tracking.
- **Frame stepping visible:** the source clip's frame rate is too low or the clip is too long for the scroll distance. Shorten the clip or raise the FPS.
- Works in any stack; the original recipe assumed Next.js 14+ App Router with TypeScript and Tailwind, but the technique is plain DOM APIs and ports anywhere.

## Quality bar

Load the `high-end-visual-design` skill for everything surrounding the hero (type, spacing, the sections below it). No emojis, no em or en dashes in any copy.
