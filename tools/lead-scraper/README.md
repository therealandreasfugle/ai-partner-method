# Local Lead Finder

Find local businesses to sell websites to. It searches Google Maps for a type of
business in a city, opens each one's website to see how old it is, and hands you a
ready-to-work spreadsheet of leads with **phone, email, website status, rating,
and a one-line reason to reach out**.

It scores two kinds of HOT lead and sorts the strongest to the top:

1. **Old or broken website** - sell them a redesign, and you can show them exactly
   what is wrong. These are your best leads: they have already paid for a website
   once, so they value one and just need a better version.
2. **No website** - sell them their first site. Proven demand, no site to beat.

One search in, one spreadsheet out. No Google login, no database.

---

## First: get your free Apify key (2 minutes, required)

This tool reads Google Maps through a service called Apify. You need a free key.

1. Make a free account at **https://console.apify.com/sign-up** (no card needed).
2. Copy your API token from **https://console.apify.com/settings/integrations**.
3. In this folder, copy the file `.env.example` to a new file named `.env`, and
   paste your token in:
   ```
   APIFY_API_TOKEN=apify_api_your_real_token_here
   ```

New accounts come with free monthly credit, so your first lead lists are usually
free. Without this key the tool will not run, it will just remind you to set it up.

### Never run out: add more free keys (optional, recommended)

Each free Apify account includes monthly credit. If you plan to pull a lot of
leads, make two or three free accounts and paste each token into `.env`, numbered
in order:

```
APIFY_API_TOKEN=apify_api_first_key
APIFY_API_TOKEN_2=apify_api_second_key
APIFY_API_TOKEN_3=apify_api_third_key
```

The tool uses the first key until it runs out of monthly credit, then rolls to
the next one automatically, mid-run, without missing a business. Stack enough
free keys and you can pull leads all month for nothing.

---

## Then install (one time)

```bash
pip install -r requirements.txt
```

### Check you are ready (10 seconds, free)

Run the setup check. It confirms your Python, your packages, and your Apify key,
and tells you exactly what to fix, or that you are ready. It runs no search and
costs nothing:

```bash
python3 setup_check.py
```

When every line says OK, you are ready to find leads.

---

## How to use it

### Fastest: fill your pipeline in one command (sweep)
Not sure what to target? Sweep your whole town. This pulls a basket of about 40
local business types that usually need a website (home services like plumbers,
roofers, and landscapers, plus barbers, salons, med spas, gyms, chiropractors,
dentists, auto shops, law firms, photographers, florists, and more) into one
ranked call sheet:

```bash
python3 find_leads.py --sweep "West Kelowna, BC" --country ca
```

Or just tell Claude: **"find me clients in West Kelowna"**. That is your week of
outreach in one command, sorted best-first.

Want a whole area? Pass several towns separated by semicolons and it sweeps them
all, then merges and de-duplicates:

```bash
python3 find_leads.py --sweep "Kelowna, BC; Vernon, BC; Penticton, BC" --country ca
```

National chains, banks, and franchises (the Hiltons and Great Clips of the world)
are filtered out automatically, so the list stays full of businesses you can
actually sell to.

### Target one niche
```bash
# 50 dentists in Miami (with and without websites)
python3 find_leads.py "dentists" "Miami, FL"

# 80 plumbers in Austin, only the ones with NO website
python3 find_leads.py "plumbers" "Austin, TX" --limit 80 --no-website-only

# Law firms in Leeds UK that already have a site (redesign pitch)
python3 find_leads.py "law firms" "Leeds, UK" --country uk --has-website-only
```

### Inside Claude Code
Drop this folder into your project and just talk to it:

> "Find me clients in West Kelowna"  (runs a sweep)

> "Get 80 plumbers in Austin with no website"

Claude confirms the cost, runs it, and tells you who to call first.

Your CSV lands in the `leads/` folder, named by niche, city, and date.

### Flags
| Flag | Does |
|---|---|
| `--sweep` | Find clients fast: sweep ~40 website-needing local business types at once. Pass only the location, or several towns separated by semicolons. |
| `--limit N` | How many businesses to pull (default 50, or 12 per type for a sweep). |
| `--min-reviews N` | Skip businesses with fewer than N Google reviews (default 0, keep all). Use it when you only want established businesses. |
| `--no-website-only` | Only businesses with NO website. |
| `--has-website-only` | Only businesses that already have a site (redesign pitch). |
| `--country us` | Pin the search to a country if the city name is ambiguous. |
| `--no-emails` | Skip email scraping to save a little money. |
| `--fast` | Skip the website age check (faster, but you lose redesign scoring). |

---

## What you get

A CSV with one row per business, sorted with your best leads at the top:

| Column | What it is |
|---|---|
| `lead_heat` | HOT / WARM / COOL. HOT = no site, outdated site, or broken site. |
| `why_reach_out` | Your opening line for that business. |
| `business_name`, `category` | Who they are. |
| `owner_name` | The owner's name when an email reveals it (often blank, small businesses rarely publish it). |
| `phone`, `email` | How to reach them. Phone is almost always there. |
| `website`, `facebook`, `instagram` | Their site and socials, so you can see what they already have. |
| `website_status` | NONE / SOCIAL / OUTDATED / BROKEN / modern. NONE and OUTDATED are gold. |
| `address`, `city`, `region`, `postal_code`, `country` | Where they are. |
| `rating`, `reviews` | Proof they are a real, active business. |
| `google_maps_url` | The listing, for a quick look. |
| `status`, `contacted_on`, `notes` | Blank for you. Fill these as you work the list. |

### What the heat levels mean
- **HOT**: a clearly dated website (not mobile-friendly, no SSL padlock, old
  copyright year, or a template Wix, Squarespace, GoDaddy, or Weebly site), a
  broken, parked, "for sale", or coming-soon site, a social-only page, or no
  website at all. The easy pitches, and the list ranks them in that order:
  **an old or broken site is your strongest lead**, because that business already
  paid for a website once, so it values one and just needs a better version.
  No-website businesses (especially with lots of reviews) come next: proven
  demand, no site to compete with.
- **WARM**: has a site we could not fully judge (it was slow or blocked our
  check), or a modern site with weak reviews.
- **COOL**: modern, established site. Hardest sell.

The list is also cleaned before it reaches you: national chains and franchises
are removed, businesses with no phone and no email are set aside (there is no way
to contact them anyway), and a site that will not load is only marked broken when
its domain is actually dead, not merely slow. So the sheet stays full of
businesses you can genuinely reach and sell to.

---

## Auto-publish to a Google Sheet (optional)

Want leads to land in a live Google Sheet automatically instead of a CSV? Set it
up once (about two minutes, no Google sign-in inside the tool, no cloud console):

1. Follow **google-sheet/SETUP.md** to copy the template Sheet and deploy it.
2. Paste the web app URL into your `.env`:
   ```
   SHEETS_WEBHOOK_URL=https://script.google.com/macros/s/xxxxxxxx/exec
   ```
3. Run the tool as normal. Every run now appends its leads to your Sheet, on a
   tab called **Leads**, sorted best first. The CSV is still saved as a backup.

The Sheet styles itself on the first run: a title banner, a bold frozen header,
alternating row shades, colour-coded lead heat and site status, and a **Status**
dropdown to work your pipeline. It looks like a professionally built sheet.

Skip this and the tool just writes a CSV, which you can open or import yourself.

---

## Automate your outreach emails (optional)

After a scrape, the tool can email every lead for you, one of six rotating
templates so no two in a row match. There are two ways to send, and **Resend is the
preferred one.**

**Resend (recommended).** You bring a free Resend API key and your own domain (about
$10 to $12 a year), so you send from `your-name@your-domain`. Set it up once
(**RESEND-SETUP.md**), then add `--email` to any scrape:

    python3 find_leads.py --sweep "Manchester, UK" --country uk --email

Every email carries one link, your video demo, and is built to get a call booked.
Each new lead gets one of the six templates and is tagged **Contacted**, so it is
never emailed twice. Then it **follows up to five more times** on a widening
schedule (3, 7, 14, 21, 30 days), and after that one gentle email a month, until
they reply. **The daily sending runs itself**: the dashboard app you deploy in
RESEND-SETUP.md doubles as an autopilot that Vercel runs once a day (with a Send
now button on the dashboard), reading your leads sheet, skipping anyone who replied
or asked to be removed, and staying inside the automatic warm-up (about 5 a day at
first, climbing to about 40, so a new domain does not get flagged). Use
`--email-dry-run` to preview before your first send.

**Your outreach dashboard.** So you are never guessing, the `dashboard/` folder
deploys a one-page site to your own free Vercel account that reads your Resend data:
sent, delivered, opened, clicked, bounced, marked spam, a day-by-day chart, and a
plain-English verdict (keep going, throttle down, or pause and fix). It is how you
decide when to raise your daily limit (`OUTREACH_DAILY_MAX`) or add a second domain.
See **dashboard/README.md**.

**The mini CRM.** The dashboard's **Lead CRM** button opens your whole pipeline in
one table, run from your Google Sheet: who has been contacted, when, by email or
phone, and what happened, with repliers floated to the top. Click a lead for its
full story (every email with opens and clicks, every call you logged, and every
detail the scraper found), then call, email, change status, or add a note; it all
saves back to the sheet. **Power dial** works through your call list one lead at a
time with the phone script on screen; your phone dials from your own number, so
there is no phone service to pay for. Needs your leads sheet connected and the
latest `google-sheet/Code.gs` pasted in. See **dashboard/README.md**.

**Make.com + Gmail (alternative).** Prefer to send from your own Gmail with no domain
to buy? A free Make automation does a similar rotating drip plus follow-ups and an
automatic reply-stop. Click-by-click setup is in **make/SETUP.md**.

Either way, the exact wording that sends lives in **EMAIL-TEMPLATES.md**, and the
scraper drops emails on dead or mistyped domains before they send, so you do not
bounce. Prefer to send by hand? Use the scripts in **OUTREACH.md**.

---

## The outreach tracker (your Google Sheet)

The repo includes **`outreach-tracker-template.xlsx`**, a ready-made tracker with
status dropdowns, colour-coded lead heat and site status, and a live dashboard
that counts your leads and tracks your outreach progress.

To turn it into a live Google Sheet:
1. Go to https://drive.google.com and drag `outreach-tracker-template.xlsx` in.
2. Double-click it, then choose **File > Save as Google Sheets**.
3. Paste your CSV rows into the **Leads** tab starting at cell **A3** (row 1 is a
   title bar and row 2 holds the headings), delete the three example rows, and
   start working.

Prefer Excel or Numbers? Just open the file directly, it works there too.

---

## How to actually reach out

Having leads is not the same as closing them. **Read `OUTREACH.md`** in this
folder. It has the full phone scripts, email templates, follow-up sequences, and
objection handling, split by lead type (no website vs outdated site). The
`why_reach_out` column gives you the opener, OUTREACH.md gives you the rest.

Quick version:
1. Work the HOT rows first, top of the list.
2. No-website and broken-site leads: call them. They have a phone, not an email.
3. Outdated-site leads: open the site, confirm the flaw, then call or email using it.
4. Track every touch in the status, contacted_on, and notes columns.

---

## What it costs

Pennies. Apify charges per business, roughly:

| Pull size | Rough cost |
|---|---|
| 50 leads | $0.25 to $0.35 |
| 200 leads | $1.00 to $1.40 |
| 1,000 leads | $5 to $7 |

The website age check is free, it uses your own connection. New Apify accounts
include free monthly credit, so early lists are usually free.

---

## Troubleshooting

- **"No Apify key found"** - you skipped the `.env` setup at the top. Make the
  `.env` file and paste your token.
- **"All Apify keys are spent"** - every key you added is out of monthly credit.
  Add another free key (see "Never run out" above) or wait for the monthly reset.
- **"Missing dependency 'apify-client'"** - run `pip install -r requirements.txt`.
- **"No businesses found"** - your niche or city was too narrow. Try a broader
  term or a bigger city.
- **A site is marked BROKEN but looks fine** - it may have been slow or blocked
  the check. Open it yourself before you pitch. Worth a look either way.
- **Few emails found** - normal. No-website businesses have no site to pull an
  email from. Call them.
