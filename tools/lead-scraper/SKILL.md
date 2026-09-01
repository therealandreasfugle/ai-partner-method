---
name: local-lead-finder
description: >
  Find local businesses to sell websites to. Scrapes Google Maps for a niche in a
  city, opens each website to judge how old it is, and writes a sales-ready CSV.
  Two kinds of HOT lead: businesses with an old or broken website (redesign pitch,
  and the strongest leads since they already pay for a site) and businesses with no
  website (first-site pitch). Each lead carries
  phone, email, website status, rating, and a "why reach out" opener. Use when
  the user wants to build a prospect list, find local businesses, scrape Google
  Maps, or get leads to cold call or email. Triggers: "find leads", "scrape
  google maps", "local businesses", "prospect list", "who can I sell a website to".
---

# local-lead-finder

Turn a niche plus a city into a ranked call sheet of local businesses to sell
websites to. One Apify call in, one CSV out.

## Guided setup (run this when a student is new or says "set me up")

The student is not technical. Walk them through the whole thing, one step at a
time, doing every step you can do for them and asking only for the things only
they can do (create accounts, buy the domain, click Verify). The sequence:

1. **Machine check**: run `python3 setup_check.py`; fix whatever it flags.
2. **Scraping**: get their Apify key into `.env` (step 1 below) and run their
   first small scrape so they see leads land.
3. **Sending (RESEND-SETUP.md)**: have them create a free Resend account and give
   you the API key; put it in `.env`. Have them buy a cheap domain (Porkbun,
   Namecheap, Cloudflare, GoDaddy); walk them through pasting Resend's DNS records
   at the registrar, clicking Verify, and switching ON open and click tracking.
   Collect their video demo link, name, and phone; write the OUTREACH_* values
   into `.env`. Send a test to THEIR OWN inbox first (`send_emails.py <csv>
   --limit 1` on a one-row CSV with their email, or `--email-dry-run`), have them
   confirm it arrived and looks right, THEN let `--email` loose on real leads.
4. **Dashboard + autopilot**: deploy `dashboard/` to their own Vercel (free
   account; `npx vercel deploy --prod` from that folder). Then set the project's
   environment variables and redeploy: `RESEND_API_KEY`, `RESEND_FROM`,
   `OUTREACH_VIDEO_LINK`, `OUTREACH_SENDER_NAME` (+ optional `RESEND_REPLY_TO`,
   `OUTREACH_SENDER_PHONE`), and `LEADS_SHEET_URL` (their sheet web app link).
   That one app is the dashboard AND the daily sender: a Vercel cron (already in
   `vercel.json`) runs `/api/send` once a day, reading the sheet, skipping
   Replied/Removed, respecting warm-up, and writing statuses back. Mirror any
   `OUTREACH_DAILY_MAX` they set. Send them their URL to bookmark.
5. **Daily habit**: nothing to run. The autopilot sends daily on its own, and the
   dashboard has a Send now button. Tell them: scrape when you want more leads,
   glance at the dashboard, do what the verdict says, and answer replies fast.
   (Only CSV-only students with no Google Sheet still run `python3 send_emails.py
   leads/<file>.csv` daily; offer to set up cron / Task Scheduler for those.)

## What you do (the orchestration)

1. **Make sure they are set up. Run `python3 setup_check.py` first.** It checks
   their Python, packages, and Apify key (a free check that runs no scrape) and
   prints exactly what to fix, or confirms they are ready. Run it again whenever a
   run errors on setup, before touching anything else. The tool needs
   `APIFY_API_TOKEN` in a `.env` file in this folder. If it is missing, do not try
   to run anything. Walk
   them through it: make a free account at https://console.apify.com/sign-up, copy
   the token from https://console.apify.com/settings/integrations, paste it into a
   `.env` file. Point them to README.md. If they want to pull a lot of leads,
   suggest adding more free keys as `APIFY_API_TOKEN_2`, `APIFY_API_TOKEN_3`, and
   so on; the tool rotates to the next key automatically when one runs out of
   monthly credit, so a run never dies halfway. If a run reports all keys spent,
   tell them to add another free key or wait for the monthly reset.

2. **Get the inputs.**
   - Location is always needed (e.g. "West Kelowna, BC", "Miami, FL").
   - If the student does NOT name a niche, or says something like "find me
     clients" or "I don't know who to target", use **sweep mode** (`--sweep`),
     which pulls a basket of ~40 website-needing local business types at once
     (home services, auto, beauty, health, fitness, professional, pet, events).
     This is the easiest path and the right default for a beginner.
   - To cover a whole area, pass a region keyword the tool knows (e.g.
     "Okanagan") or several towns separated by semicolons
     ("Kelowna, BC; Vernon, BC"). It sweeps each town and merges the results.
   - If they do name a niche or trade, search just that.

   By default pull both with and without websites, because old sites are good
   redesign leads. Only use `--no-website-only` or `--has-website-only` if they ask.

3. **Estimate cost and confirm before running.** Roughly $0.005 to $0.007 per
   business. So 50 leads is about $0.25 to $0.35, 200 is about $1.00 to $1.40.
   The website age check is free. Confirm before a large run.

4. **Run it:**
   ```bash
   # Whole-town sweep (the easy default when they have no niche)
   python3 find_leads.py --sweep "<location>" --country <cc>

   # Whole-region sweep (several towns at once, merged and de-duplicated)
   python3 find_leads.py --sweep "Kelowna, BC; Vernon, BC" --country ca

   # One specific niche
   python3 find_leads.py "<niche>" "<location>" --limit <N> [flags]
   ```
   Flags: `--sweep`, `--no-website-only`, `--has-website-only`,
   `--country us|uk|ca`, `--no-emails`, `--fast` (skip the website age check),
   `--min-reviews N` (skip businesses under N reviews, default 0),
   `--no-verify-emails` (skip the quick DNS check that blanks emails on dead
   domains; verification is on by default so the email drip does not bounce),
   `--keep-unreachable` (keep leads that have no phone and no email; by default
   those unworkable leads are dropped).
   A single-town sweep is ~40 business types, about $2.50 to $4 for ~250 to 400
   leads. A region sweep multiplies that by the number of towns, so confirm the
   cost before running. National chains, franchises, businesses with no phone and
   no email, and dead-domain sites are cleaned out automatically, so the list
   stays workable.

5. **Report back like a sales coach.** After it runs:
   - Say how many HOT leads, split by no-website / outdated / broken.
   - Read the top 5 rows and say who to call first and why.
   - Tell them the `why_reach_out` column is their opener.
   - Point them to the tracker (`outreach-tracker-template.xlsx`) and to
     `OUTREACH.md` for the scripts. Offer to pull the relevant script for them.

## How leads are scored

The tool opens each website and checks for mobile-friendliness, an SSL padlock,
and a stale copyright year.

- **HOT**: a clearly dated website, a broken site, a social-only page, or no
  website at all. Easy pitches. The strongest HOT leads are the ones with an old
  or broken site: they already paid for a website once, so they value one and just
  need a better version. No-website businesses (especially with lots of reviews)
  come next: proven demand, nothing to compete with. "Broken" means a site that
  will not load AND whose domain is actually dead (does not resolve), so it is a
  genuine rebuild lead, not just a slow server.
- **WARM**: a site it could not fully judge, one that was too slow or blocked the
  check, or a modern site with weak reviews.
- **COOL**: modern, established site. Hardest sell.

The CSV is sorted best first: HOT, then WARM, then COOL; within HOT the old or
broken sites (proven buyers) rank above no-website leads, then more reviews first.
Before scoring, the tool also
removes national chains and franchises, and after scoring it sets aside any lead
with no phone and no email (nothing to reach them on), so students only ever see
businesses they can actually contact and sell to.

## The tracker

`outreach-tracker-template.xlsx` is a ready-made outreach sheet (status dropdowns,
colour-coded lead heat and site status, live dashboard). Students drag it into
Google Drive and save it as a Google Sheet, then paste their CSV into the Leads
tab starting at cell A3 (row 1 is a title bar, row 2 the headings). See README.md.

## Publishing to Google Sheets

If `SHEETS_WEBHOOK_URL` is set in `.env`, every run also appends the leads to the
student's own Google Sheet automatically, and the run prints a "Published ..."
line. If a student wants this and has not set it up, walk them through
`google-sheet/SETUP.md` (copy the template Sheet, deploy it as a web app, paste
the URL into `.env`). If a run says it could not publish, the CSV is still saved;
check the deployment is set to "Anyone" and the URL ends in `/exec`.

## Outreach

`OUTREACH.md` has the phone scripts, email templates, follow-ups, and objection
handling, split by lead type. When a student asks how to reach out, pull the
relevant section and tailor it to their niche and town.

## Email outreach

Two ways to send the six-template outreach (copy in `EMAIL-TEMPLATES.md`). **Resend
is the preferred path; Make.com + Gmail is the alternative.** Present it that way.

**Resend (preferred, `send_emails.py`).** The student adds `--email` to any scrape and
the tool emails each new lead one of six rotating first-touch templates right after
writing the CSV, tags it Contacted (so it is never emailed twice), and on later runs
sends up to five follow-ups on a widening schedule (3, 7, 14, 21, 30 days) until the
lead replies. Every email has ONE link, their video demo (`OUTREACH_VIDEO_LINK`); the
goal is to book a call. Needs `RESEND_API_KEY`, `RESEND_FROM` (their own verified
domain), `OUTREACH_VIDEO_LINK`, and `OUTREACH_SENDER_NAME`/`_PHONE` in `.env`; full
setup in `RESEND-SETUP.md` (Resend key, buy a domain about $12 a year, connect it,
record a video demo). Follow-ups only go out when the outreach is re-run over the
list, so tell students to re-run `send_emails.py <csv>` daily or schedule it (cron /
Task Scheduler). Warm-up is automatic and best-practice slow (starts ~5/day, adds ~2/
day up to ~40/day). To scale past 40 once the dashboard shows green, set
`OUTREACH_DAILY_MAX` in `.env` (raise ~5 at a time, hard max 100) or warm a second
domain; `--email-limit` overrides a single run, `--email-dry-run` previews. Reply-
stop is manual: mark a lead Replied (or use the Google Sheet reply-watcher) and they
drop out. Resend polices cold email harder than Gmail, so if an account is flagged the
student can open a new one.

**Make.com + Gmail (alternative).** Two optional Make automations that send from the
student's own Gmail and read their Google Sheet Leads tab; setup is a manual
blueprint import in `make/SETUP.md` (free plan).

1. **Outreach Engine** (`make/blueprint.json`): emails each new lead (six rotating
   templates in `EMAIL-TEMPLATES.md`), marks it Contacted, then follows up three
   times if there is no reply, day 3, day 7, and day 14, moving the status to
   Follow-up 1/2/3. One scheduled scenario handles the first email and every
   follow-up; the wait is timed from each lead's contacted date in the sheet.
   `make/install_scenario.py` can build the Engine via the Make API in one command,
   but the API needs a paid Make plan, so only suggest it to paid students; free
   students import by hand.
2. **Reply Watcher** (`google-sheet/reply-watcher.gs`): a small Google Apps Script
   the student pastes into their Leads sheet (Extensions > Apps Script, then run
   installReplyWatcher). It scans their Gmail every 15 minutes and, when a lead
   emails back, sets that lead's status to Replied automatically, removing them from
   the follow-ups. It runs in the student's own Google account, not Make, so it uses
   no Make scenario. Marking Replied by hand is the backstop. (An earlier Make-based
   watcher was dropped because Make's Gmail OAuth connection cannot watch an inbox.)

The Engine is the only Make scenario, so the free plan is plenty. The Sheet
auto-publish (`google-sheet/SETUP.md`) is only needed if they want leads to land in
the Sheet automatically; the Reply Watcher just needs the Leads tab to be a Google
Sheet. For hands-off email, point students here; for calling and manual sends, use
`OUTREACH.md`.

## Outreach dashboard

`dashboard/` is a self-contained one-page Vercel project (static `index.html` + one
edge function `api/stats.js`) that reads the student's Resend account and shows
sent/delivered/opened/clicked/bounced/spam, a 30-day volume chart, per-domain
health, and a plain-English verdict (healthy, throttle down, or pause and fix).
When a student asks to "deploy my outreach dashboard" (or after their Resend setup),
deploy it FOR them: from `dashboard/` run `npx vercel deploy --prod` (they log in on
first use), then set the `RESEND_API_KEY` environment variable on the Vercel project
and redeploy. Remind them to enable open and click tracking on their domain in
Resend, or opens show zero. Use the dashboard's verdict to advise on raising
`OUTREACH_DAILY_MAX` or adding a second sending domain.

**Offer to lock their dashboard** once real leads are in it (it is on a public URL
otherwise). Two options; set the env vars FOR them on their Vercel project, then
redeploy:

- Simple: `DASH_KEY` env var locks every page behind `?k=<value>`.
- Better, a real sign-in screen: ask the student for the username(s) and a
  password, run the generator one-liner in `dashboard/README.md` ("Lock it with a
  login") to turn the password into `CRM_PASS_SALT` + `CRM_PASS_HASH` (never store
  or echo the password itself), then set those plus `CRM_USERS` and `AUTH_SECRET`.
  **Always also set `CRON_SECRET`** (any random string) or the daily autopilot
  gets locked out. Verify after deploy: the page must show the sign-in card when
  signed out, and their username + password must open it.

## The mini CRM (crm.html)

The dashboard's **Lead CRM** button opens `crm.html`, a mini CRM over the student's
sheet (`api/crm.js`; the sheet feed is `?crm=1`, all leads, all columns). The table
ranks by attention (replied first, then untouched by heat, then in-motion, then
closed), and each lead's drawer merges its Resend email history (sends, opens,
clicks, joined by recipient) with calls parsed from the Notes column into one
timeline, over the full scraped record. Actions save through POST `api/crm`: a call
outcome (Interested / Call back / Voicemail / No answer / Not interested / Bad
number; stamps status + contacted_on + a dated "Called ..." note), a direct status
change, or a free note; all land in the sheet via `op:"mark"`. **Power dial** walks
every callable lead (has phone, not replied/closed) with the OUTREACH.md phone
script filled in; `tel:` links dial through the student's own phone, so calling
costs nothing. The intended workflow is desk-first: help the student pair their
computer with their phone once (Mac + iPhone via the Phone app, Windows via Phone
Link; steps in dashboard/README "power dialler is built for the desk" and in the
CRM's How-it-works modal) so they click through calls at their computer; the
phone-browser tap-to-call path is the zero-setup fallback. Needs `LEADS_SHEET_URL` plus the latest `google-sheet/Code.gs` pasted into
the sheet; `RESEND_API_KEY` lights up email history and `OUTREACH_SENDER_NAME`
fills the script. The CRM's script editor (Edit next to the script in any lead)
includes a template menu with situational scripts (social-only, no email,
gatekeeper, callback, after-video, voicemail variants); the drawer's More tab
shows the situational ones mid-call. If the CRM cannot read the sheet, the student is on an old
Code.gs: re-paste and redeploy the web app.

## Notes

- Output is a plain CSV in `leads/`. No Google login needed to generate leads.
- Phone comes from Google Maps and is almost always present. Email is scraped from
  the website, so no-website leads usually have a phone but no email. Call those.
- Run different niches and cities into separate CSVs and stack them up.
