---
description: Find local businesses to sell to in a town and trade
---

Find leads for the user. Arguments may include a town, a trade, and a count.
If any are missing, ask for them in one message, then go.

**Before running anything**, check they are set up:

```bash
python3 00-setup/setup_check.py
```

If the Apify key or the Sheet webhook is missing, stop and fix that first.

**Then run the scraper** from `tools/lead-scraper`, using its own virtual
environment, never a bare `python3`.

⚠️ **Costs real credit.** Roughly 0.0064 per business. Before you run anything,
tell them the estimated cost and how many leads to expect, and wait for a yes.
Keep a single run under about 4 dollars.

⚠️ **The country code is the two letter ISO one.** The UK is `gb`, not `uk`.

**When it finishes, reply with only this:**
1. How many leads, the hot/warm/cool split, and how many have an email
2. A link to their CRM
3. A link to their sheet

Keep it short. No preamble, no explanation of what you just did, no next steps
list.

**If they have not picked a niche**, the measured advice is: plumbers first, half
list an email and about a third have a weak site. Electricians second. Avoid
dentists, lawyers and accountants, they all have agencies already. Avoid barbers
and nail salons, only about 8 percent list an email. Take the city from them and
suggest the trade yourself.
