---
name: client-dossier
description: >
  Builds a complete 13-section market research dossier on any creator from their
  Instagram + YouTube. Scrapes posts, transcribes top videos, analyzes audience
  pain points and dream state from comments, identifies monetisation gaps, and
  recommends an offer + funnel. Use when onboarding a new client or evaluating
  a prospect.
---

# /client-dossier — Full Market Research Dossier

Produces a 13-section dossier matching the format in `directives/client_dossier.md`.

## Workflow

1. **Ask the user:**
   - Creator's handle (e.g. `@username`)
   - Which platforms they're active on (Instagram, YouTube, both)
   - Anything specific to dig into (optional)

2. **Read the directive first:**
   - Open `directives/client_dossier.md` (in this repo)
   - This is your instruction set — follow it exactly

3. **Warn about cost** before running anything:
   - YouTube scrape: free
   - Instagram scrape: ~$0.50–$2 via Apify
   - Whisper transcription fallback (if needed): ~$0.006/min
   - Total expected: $1–$3 per dossier

4. **Run scrapers:**
   ```bash
   python scripts/youtube_scrape.py @handle
   python scripts/instagram_scrape.py @handle
   ```

5. **Transcribe top videos** (the 3–5 with highest engagement):
   ```bash
   python scripts/youtube_transcribe.py @handle --top 5
   python scripts/instagram_transcribe.py @handle --top 5
   ```

6. **Read everything from `./dossiers/<handle>/`:**
   - `youtube.json` — channel data, video list, transcripts, top comments
   - `instagram.json` — profile, posts, captions, top comments
   - Their bio, LinkTree, pinned links, any visible product pages

7. **Synthesize into the 13 sections** per the directive.

8. **Write the dossier** to `./dossiers/<handle>/dossier.md`.

9. **Confirm to the user** with a one-line summary + the file path.

## Critical rules

- **Never invent data.** Every concrete claim must trace to scraped content or visible public info. No made-up ages, locations, revenue, client stories.
- **Pull audience language from comments**, not your imagination. The audience reveals their pain in their own words — quote them.
- **Flag uncertainty.** If you can't find their pricing, say "pricing not publicly visible." Don't guess.
- **Keep client data local.** The `dossiers/` directory is gitignored. Never push it.

## Output

A single markdown file: `./dossiers/<handle>/dossier.md` following the 13-section template in `directives/client_dossier.md`.
