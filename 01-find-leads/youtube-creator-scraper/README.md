# YouTube Creator Scraper

Find qualified YouTube creators in your niche and export them to a CSV
ready for outreach.

For each niche you define, the scraper:

1. Runs your search queries on YouTube via Apify
2. Aggregates the channels that appear in the results
3. Filters by subscriber count and recency (skips dead channels)
4. Extracts emails and Instagram handles from video descriptions
5. Writes a CSV to `leads/<niche-id>-<date>.csv`

You can open the CSV in Sheets, Excel, or import it directly into your CRM.

---

## Quick start (10 minutes)

### 1. Sign up for Apify (free)

Go to https://console.apify.com/sign-up and create an account.  Apify gives
you **$5 of credit per month free**, which is enough to scrape ~15–40
search queries depending on result size.

Once logged in, grab your API token from
https://console.apify.com/account/integrations and copy it somewhere safe.

### 2. Install Node.js

If you don't already have it, download Node.js 20+ from https://nodejs.org.

Check it works:
```bash
node --version    # should print v20 or higher
```

### 3. Install this scraper

```bash
git clone <this-repo>
cd youtube-scraper-starter
npm install
```

### 4. Add your Apify token

```bash
cp .env.example .env
```

Open `.env` and paste your token after `APIFY_TOKEN=`.

### 5. Edit your niches

Open `scripts/niches.ts` and replace the example niches with your own.
Each niche needs an `id`, a `name`, and a list of `youtube_queries`.

**Good queries are specific.**  Imagine what your *ideal lead* would type
into YouTube — mix "how to" educational queries with "I made $X doing Y"
success queries.

### 6. Run your first scrape

```bash
npm run scrape
```

This runs every niche in `niches.ts`.  To run just one:

```bash
npm run scrape -- --niche=ai-automation-agency
```

You'll see live progress in the terminal.  When it's done, your CSVs are
in the `leads/` folder.

---

## Tuning the quality filters

The defaults are sensible for "coachable creator who probably isn't
already huge":

| Setting             | Default | What it does                              |
|---------------------|---------|-------------------------------------------|
| `MIN_SUBS`          | 500     | Skip channels smaller than this           |
| `MAX_SUBS`          | 500,000 | Skip mega-channels (out of your league)   |
| `RECENCY_DAYS`      | 30      | Skip channels with no recent uploads      |
| `RESULTS_PER_QUERY` | 30      | How many videos to pull per search query  |

Set them in `.env` to override.  Example for a B2B niche:

```bash
MIN_SUBS=2000
MAX_SUBS=100000
RECENCY_DAYS=14
```

---

## CSV output

Each CSV has these columns:

- `niche` — which niche the lead came from
- `channel_name` — display name on YouTube
- `channel_handle` — the `@handle` (or channel ID if no handle)
- `channel_url` — direct link to the channel
- `subscribers` — subscriber count at scrape time
- `email` — first business email found in their video descriptions (often null)
- `instagram` — `@handle` if they linked Instagram (often null)
- `last_video_date` — most recent upload picked up by the search
- `description_excerpt` — first 200 chars of a recent video description

---

## Tips for using the leads

1. **Open the CSV in Sheets**, sort by `subscribers` descending
2. **Dedupe** if you've scraped overlapping niches (sort by `channel_url`)
3. **Manually qualify the top 20–50** — open their channel, watch 30
   seconds of a recent video, check whether they fit your offer
4. **Outreach** via email if present, otherwise comment-then-DM on
   Instagram, otherwise channel "About" page contact

A scrape of ~200 channels will typically yield 50–100 qualified leads
after manual review.  That's a week of outbound work.

---

## Troubleshooting

**`Missing APIFY_TOKEN`** — you skipped step 4.  Copy `.env.example` to
`.env` and paste your token.

**`Actor start failed`** — your Apify token is wrong, or your account is
out of monthly credit.  Check https://console.apify.com/billing.

**Zero results returned** — your queries are too narrow or use language
nobody searches for.  Test the query in YouTube manually first — if it
returns nothing there either, rephrase it.

**CSV is empty** — your filters were too strict.  Try lowering `MIN_SUBS`
or raising `RECENCY_DAYS` in `.env`.

---

## What this scraper is *not*

It's a starter, not a SaaS:

- **No persistent storage.**  Run it again next month and you'll re-scrape
  the same channels.  If you want dedup across runs, sort the CSV by
  `channel_url` and remove rows you've already worked.
- **No automatic outreach.**  This finds leads — you still have to send
  the message.
- **No live monitoring.**  YouTube channels change.  A scrape is a
  snapshot.

The whole script is one file (`scripts/scrape.ts`, ~250 lines) — read it,
extend it, swap actors, add Supabase, build whatever you need.
