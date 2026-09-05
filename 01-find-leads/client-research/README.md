# AIPM Client Research Toolkit

The exact toolkit we use to build a complete market research dossier on any creator from their Instagram + YouTube.

Give it a creator's handle. It scrapes their content, transcribes their top videos, and writes a 13-section dossier covering audience, pain points, dream state, current offers, monetisation gaps, and recommended funnel.

Built for Claude Code. Your Claude does the work.

---

## What you get

- **Two skills** that drop into Claude Code (`/analyze-creator` and `/client-dossier`)
- **Python scripts** that do the heavy lifting (scraping, transcription)
- **A directive** (`directives/client_dossier.md`) — the 13-section template your Claude follows
- **An example dossier** so you know what good output looks like

---

## Setup (4 commands, ~5 minutes)

### 1. Clone this repo

```bash
git clone <your-fork-url> aipm-client-research
cd aipm-client-research
```

### 2. Install Python dependencies

```bash
pip install -r requirements.txt
```

You also need `ffmpeg` for audio transcription:

```bash
# macOS
brew install ffmpeg

# Ubuntu/Debian
sudo apt install ffmpeg

# Windows
# Download from https://ffmpeg.org/download.html
```

### 3. Add your API keys

```bash
cp .env.example .env
```

Then open `.env` and fill in:
- **`ANTHROPIC_API_KEY`** (required) — for Claude analysis
- **`OPENAI_API_KEY`** (optional) — only if you want Whisper transcription as a fallback
- **`APIFY_TOKEN`** (optional) — only for Instagram scraping

### 4. Install the skills into Claude Code

```bash
mkdir -p ~/.claude/skills
cp -r skills/* ~/.claude/skills/
```

Restart Claude Code so it picks up the new skills.

---

## Usage

In any Claude Code session, just type:

```
/client-dossier @creator_handle
```

Claude will:
1. Ask you which platforms to scrape (IG, YT, or both)
2. Run the scrapers
3. Transcribe their top-performing videos
4. Write a full 13-section dossier to `./dossiers/<handle>/dossier.md`

Or for a quicker analysis (one platform, no dossier):

```
/analyze-creator @creator_handle
```

---

## What's in the dossier

13 sections, every time:

1. Numbers at a Glance (followers, engagement)
2. Who They Are
3. What Their Content Is Actually About
4. Who Their Audience Is (demographics + psychographic)
5. Pain Points (in audience's own words from comments)
6. Dream State
7. What They Already Sell
8. Monetisation Gap Analysis
9. Offer Recommendations
10. Ascension Funnel Design
11. Messaging Rules
12. Watch Outs / Risks
13. One-Page Summary

See `examples/example_dossier.md` for a full sample.

---

## Cost

- **YouTube scraping**: Free (uses `yt-dlp` and YouTube's auto-captions)
- **YouTube transcription fallback** (Whisper): ~$0.006/min — a 10-min video = $0.06
- **Instagram scraping** (Apify): ~$0.50–$2 per creator depending on post volume
- **Claude analysis** (Anthropic): ~$0.10–$0.30 per dossier

**Total per dossier: roughly $1–$3 in API costs.**

---

## Security

This repo is safe to fork and share publicly:
- `.env` is gitignored — your keys stay on your machine
- No client data is included
- The example dossier is fully fictional

---

## Troubleshooting

**"yt-dlp not installed"** → Run `pip install -r requirements.txt` again, make sure you're in the right venv.

**"YouTube transcript unavailable"** → That video has captions disabled. The script will fall back to Whisper if `OPENAI_API_KEY` is set.

**"Apify rate limit"** → Free tier has a soft limit. Either wait an hour or upgrade.

**Claude doesn't see the skill** → Restart Claude Code after copying skills. Check they're at `~/.claude/skills/<skill-name>/SKILL.md`.

---

## Repo structure

```
aipm-client-research/
├── README.md                       ← you are here
├── .env.example                    ← API key template
├── .gitignore                      ← keeps secrets out of git
├── requirements.txt                ← Python deps
├── skills/                         ← copy into ~/.claude/skills/
│   ├── analyze-creator/SKILL.md    ← quick one-creator analysis
│   └── client-dossier/SKILL.md     ← full 13-section dossier
├── scripts/                        ← the deterministic execution layer
│   ├── youtube_scrape.py
│   ├── youtube_transcribe.py
│   ├── instagram_scrape.py
│   └── instagram_transcribe.py
├── directives/
│   └── client_dossier.md           ← the dossier template + instructions
└── examples/
    └── example_dossier.md          ← fictional sample output
```
