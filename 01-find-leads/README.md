# 1. Find leads

**The tool:** `tools/lead-scraper`. **The command:** `/find-leads` in Claude Code.

It searches Google Maps for a trade in a town, opens each business's website to
judge how old it is, and writes a sales-ready list into your CRM with phone,
email, site status, rating and a one-line reason to reach out.

## Pick the niche on evidence, not a hunch

Measured across 224 real leads:

| Trade | Verdict |
|---|---|
| **Plumbers** | Best. About half list an email, and nearly a third have no site or a weak one |
| **Electricians** | Second best |
| Dentists, lawyers, accountants | **Avoid.** Every one had a decent site already. They have agencies |
| Barbers, nail salons | **Avoid.** Only about 8 percent list an email |

Take the town from wherever you are or wherever you have a connection. Pick the
trade yourself using the table.

## What a run costs

About 0.0064 per business. A city sweep of one trade is pennies. A 42-trade sweep
runs about 3.20 and takes 7 minutes for roughly 470 usable leads.

⚠️ Keep a single run under about 4 dollars. Add more free Apify keys rather than
running one huge sweep. See `00-setup/04-apify.md`.

⚠️ The country code is the two letter ISO one. The UK is `gb`, not `uk`.

⚠️ Re-running the same town returns nothing, because it skips businesses already
in your sheet. That is correct behaviour and it looks like a bug. Use a new town.

## Then

Work them in order in [`02-outreach`](../02-outreach). Hottest first, and within
that, the ones with an email first.
