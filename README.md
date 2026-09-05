# AI Partner Method: the local business operator

Everything you need to find a local business, sign them, and deliver what you
sold. The tools are built. Your job is to connect them to your own accounts and
then run the process.

## New here?

Open **[WHAT-YOU-GET.md](WHAT-YOU-GET.md)** first. It has live links to everything
you are selling, so you can see it before you set anything up, plus a plain list of
what you must customise.

## How to use this repo

Work top to bottom, once. After that you live in folders 01 to 05 on repeat.

```
00-setup                 connect the tools to your accounts (do this once)
01-find-leads            get a list of local businesses worth calling
02-outreach              email, DM and phone until you have calls booked
03-sell                  run the call, send the proposal, get paid
04-deliver               build and launch what you sold (10 folders, one per line item)
05-keep-the-client       reporting, edits, and keeping the monthly fee alive
06-your-own-credibility  your own site and proof, so you look like what you sell
scripts                  every word you will ever need to send or say
tools                    the code: scraper, CRM, site builder, proposal builder, dashboard
.claude                  the commands. Type these and the AI does the work
```

### What lives where, after the repos were merged

Everything that used to be a separate repo now sits inside this one. Nothing to
clone twice.

| Folder | Was its own repo |
|---|---|
| `01-find-leads/client-research` | aipm-client-research |
| `01-find-leads/youtube-creator-scraper` | youtube-creator-scraper |
| `02-outreach/email-toolkit` | ai-partner-method-email-toolkit |
| `02-outreach/marketing-sops` | aipm-marketing-sops |
| `04-deliver/client-onboarding` | ai-partner-method-onboarding |
| `04-deliver/form-templates` | aipm-student-form-templates |
| `04-deliver/reel-editor` | aipm-reel-editor |
| `tools/lead-scraper` | local-lead-finder |
| `tools/dashboard` | settoku-os, the Next.js pipeline dashboard you deploy yourself |

Two things are deliberately still separate, because they are their own products
rather than folders in this one:

- **[aipm-operator-stack](https://github.com/BrettZuke/aipm-operator-stack)** is the
  Claude Code toolkit: 255 skills, a Playwright browser so Claude can check the
  sites you ship, subagents and task templates. Install it once and it applies to
  every project on your machine, not just this repo.
- **[aipm-local-website-builder](https://github.com/BrettZuke/aipm-local-website-builder)**
  is the full website factory. It is 84MB on its own and you only need it when you
  outgrow the 20 templates in `tools/website-templates`.

## What you are selling

Ten things, for a one time build fee plus a monthly fee. Each has a folder in
`04-deliver` with the setup steps and the video that walks it.

| # | Line item | Where it lives |
|---|---|---|
| 01 | Custom website build | `04-deliver/01-website` |
| 02 | Lead and customer CRM with power dialler | `04-deliver/02-crm` |
| 03 | Automated follow up to every lead | `04-deliver/03-lead-followup` |
| 04 | SEO foundation, schema and AEO | `04-deliver/04-seo` |
| 05 | Referral program | `04-deliver/05-referral` |
| 06 | Automatic review engine | `04-deliver/06-reviews` |
| 07 | AI chatbot | `04-deliver/07-chatbot` |
| 08 | Launch package, domain, hosting, SSL | `04-deliver/08-launch` |
| 09 | Owner and sales team lead notifications | `04-deliver/09-notifications` |
| 10 | GA4 analytics | `04-deliver/10-analytics` |

**You do not build these ten things per client.** They are already built. Per
client you fill in their details and connect their accounts, which is what the
folders above walk you through.

## The accounts you need

All free to start. Nothing in this repo requires a paid API key, and nothing here
will ever charge you without you choosing to upgrade.

| Tool | What it does for you | Cost |
|---|---|---|
| GitHub | Holds your copy of this repo | Free |
| Vercel | Hosts every site you build | Free tier |
| Claude Code | Runs the commands in this repo | Your existing plan |
| Apify | Scrapes the lead lists | Free monthly credit |
| Groq | Powers the AI chatbot on client sites | Free |
| Resend | Sends contracts, lead alerts, review requests | Free tier |
| Google account | Sheets for the CRM, GA4, Business Profile | Free |
| Slack | Lead notifications into your client's team | Free |
| Stripe | Takes the money | Per transaction |
| A domain | Your own, and later your clients' | About 10 a year |

Full walkthrough with signup links in `00-setup`.

## Build status

Honest state of this repo, updated as it fills in.

**In and working now:**

| Area | Where |
|---|---|
| Lead scraper, Google Maps, multi key rotation | `tools/lead-scraper` |
| Automated cold email sender and sequences | `tools/lead-scraper/send_emails.py`, `tools/crm/api/sequences.js` |
| CRM, pipeline, power dialler | `tools/crm` |
| Referral program, payout ledger, customer thank you page | `tools/crm/referrals.html`, `tools/crm/thanks.html` |
| Review engine, fires when you mark a lead Won | `tools/crm/api/_thankyou.js` |
| Instant site and proposal builder, one per lead | `tools/instant-builder` |
| 20 finished premium website templates | `tools/website-templates` |
| The website template you build clients on | `tools/website-template` |
| Lead capture, owner alerts, Slack, auto reply | `tools/website-template/api/lead.mjs` |
| AI chatbot endpoint and setup guide | `tools/website-template/api/chat.mjs` |
| Proposal builder and contract e-sign | `tools/proposal-builder` |
| Evergreen VSL page you send instead of a call | `tools/vsl-page` |
| The sales call proposal, with contract e-sign | `tools/sales-proposal` |
| High end websites playbook, the premium track | `04-deliver/01-website` |
| Marketing SOPs, frameworks and case studies | `02-outreach/marketing-sops` |
| 38 Claude skills, copy, design, SEO, video | `skills` |
| Client onboarding form, sent after they pay | `04-deliver/client-onboarding` |
| Account setup, ten guides plus a check script | `00-setup` |
| Email warmup and domain authentication | `02-outreach/email-warmup.md` |
| Claude commands, so you prompt instead of read | `.claude/commands` |
| 16 cold emails, 4 angles plus follow ups | `scripts/cold-email` |
| DM scripts and objection handling | `scripts/dm` |
| Cold call, voicemail, discovery and closing call | `scripts/phone` |

⚠️ **We never ask a prospect to fill in a form.** Every outreach path, the
proposal with their site embedded, the video, or both together, pushes to one
thing: book a call. The only form anybody fills in is the onboarding form, and
that goes out after they have paid.

⚠️ **Everything you deploy goes on YOUR OWN accounts.** Every tool in here is
set up to be deployed by you, to your own Vercel, with your own keys. Placeholders
like `YOUR_SUPABASE_PROJECT_REF` and `{{YOUR_BOOKING_LINK}}` mark the spots you
fill in. Nothing here points at anybody else's account, and nothing you build
touches anybody else's client data.

**Still being written:**

| Area | Notes |
|---|---|
| Troubleshooting guide | When something breaks, run `/check` first. A written guide is coming |

## Start here

```bash
python3 00-setup/setup_check.py
```

It tells you what is connected and what is missing. Then open
[`00-setup/README.md`](00-setup/README.md) and work down it once.

Once Claude Code is running in this folder you can also just type `/setup` and it
will walk you through connecting everything one step at a time. The other commands
are `/check`, `/find-leads`, `/build-site` and `/onboard-client`.

## A rule worth reading twice

**Never promise a result you cannot control.** Not in an email, not on a call,
not in a proposal. You are selling a system and a standard of work, not a number
of leads. Promise the mechanism, deliver it properly, and keep working until the
client is happy. That is what the agreement says and it is what keeps you out of
trouble.
