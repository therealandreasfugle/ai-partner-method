# Start here

New here? The fastest path is to open this folder in Claude Code and say:

> set me up

Claude will check your machine, help you get the accounts you need (Apify for
scraping, Resend plus a cheap domain for sending, Vercel for your dashboard), wire
your keys into `.env`, and walk you through your first scrape, your first test
email to yourself, and putting your dashboard live. You never have to figure out a
step alone.

Prefer to drive yourself? Three steps.

**1. Check your setup (free, about 10 seconds):**

```bash
python3 setup_check.py
```

It checks your Python, the packages, and your Apify key, then tells you exactly
what to fix, or that you are ready. It runs no search and spends nothing.

**2. When it says you are ready, find your first leads:**

```bash
python3 find_leads.py --sweep "Your Town, ST"
```

**3. Turn on the outreach (the part that gets you calls):**

Follow **RESEND-SETUP.md** top to bottom: Resend account, your own domain, one
test email to yourself, then deploy the dashboard app. After that the sending runs
**by itself once a day** (first emails, follow-ups, monthly reminders), skips
anyone who replies or asks to be removed, stays inside safe limits, and your
dashboard shows exactly how it is going, with a Send now button when you want it.

Want to know what the columns mean or how the phone scripts work? See
**README.md** and **OUTREACH.md**.
