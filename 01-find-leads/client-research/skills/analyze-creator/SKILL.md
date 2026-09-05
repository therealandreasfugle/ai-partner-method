---
name: analyze-creator
description: >
  Quick creator analysis — scrape a creator's recent content from one platform
  and extract what's working: hooks, formats, engagement patterns, content themes.
  Use for fast competitor research or initial client prospecting.
  For a full client dossier, use /client-dossier instead.
---

# /analyze-creator — Quick Creator Analysis

Scrapes one platform and returns a structured breakdown of what's working for a creator.

## Workflow

1. Ask: creator's username/handle, platform (Instagram or YouTube), what to focus on (hooks / formats / engagement / themes / all)
2. Run the appropriate scraper from `scripts/`:
   - YouTube: `python scripts/youtube_scrape.py @handle`
   - Instagram: `python scripts/instagram_scrape.py @handle`
3. Read the saved JSON output from `./dossiers/<handle>/`
4. Analyze and deliver a structured breakdown

## Analysis Framework

- **Top posts by engagement** — which posts won and why
- **Hook patterns** — opening lines or visual hooks on best content
- **Content formats** — talking head / B-roll / POV / split-screen ratio
- **Topic clusters** — recurring themes that consistently perform
- **Posting cadence** — frequency, best days/times
- **Comment themes** — what the audience is asking/reacting to

## Output (in chat, no file)

- Top 5 posts with one-line "why it worked"
- 3 hook formulas they use repeatedly
- Format breakdown (%)
- 3 angles you could steal for your own channel
- One obvious gap they're not filling

## Cost warning

Always warn user with estimated cost before running:
- YouTube: free (uses yt-dlp + free auto-captions)
- Instagram: ~$0.10–$0.50 per analysis (Apify)
