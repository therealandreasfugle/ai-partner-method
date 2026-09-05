# Setup

Two kinds of setup exist in this business, and mixing them up is what makes it
feel overwhelming.

**Your accounts.** Done once, ever. About ninety minutes. After this you never
touch it again.

**Per client.** Done each time you close somebody. About twenty minutes, and most
of it is pasting things they gave you on the onboarding form.

This folder is the first kind. Work down it in order. Nothing here costs money.

---

## Do these in order

Each one has its own file with the exact steps.

| # | Account | What it does for you | Time |
|---|---|---|---|
| 1 | [GitHub](01-github.md) | Holds your copy of everything in this repo | 5 min |
| 2 | [Claude Code](02-claude-code.md) | Runs the work. This is the thing that builds sites | 10 min |
| 3 | [Vercel](03-vercel.md) | Hosts every site you build, free | 10 min |
| 4 | [Apify](04-apify.md) | Finds the leads | 5 min |
| 5 | [Groq](05-groq.md) | Runs the AI chatbot on client sites, free forever | 2 min |
| 6 | [Resend](06-resend.md) | Sends contracts, lead alerts and review requests | 10 min |
| 7 | [Google Sheet](07-google-sheet.md) | The database behind your CRM. **The fiddliest step** | 20 min |
| 8 | [Your domain](08-domain.md) | Your own web address, and your sending reputation | 15 min |
| 9 | [Cal.com](09-booking.md) | Where prospects book the call | 5 min |
| 10 | [Stripe](10-stripe.md) | Takes the money | 15 min |

Slack is per client, not per you, so it lives in
[`04-deliver/09-notifications`](../04-deliver/09-notifications).

When you are done, run the check:

```bash
python3 00-setup/setup_check.py
```

It tells you what is connected, what is missing, and what to do about each one.
It never spends any credit.

---

## The one decision already made for you

There are three ways to build a client a website in this repo. You do not need to
choose, because there is a default and it is the right one for your first ten
clients.

**To sell: the instant builder.** Before you ever speak to a business, it builds
them a real site from their Google listing in about forty five seconds. That is
what you put in the cold email. You are not pitching an idea, you are showing them
their own website.

**To deliver: the template gallery.** Twenty finished premium templates. You pick
the closest one, drop in their details from the onboarding form, and deploy. This
is what the client actually pays for and keeps.

**Later, if you want it: the website factory.** A thirteen stage pipeline that
builds a fully bespoke site with per-client research. It is better, and it is
slower and more to learn. Leave it until you have money coming in.

⚠️ Do not try to learn all three at once. The instant builder and the gallery are
the whole business. The factory is an upgrade you grow into.

---

## What things actually cost

Everything below is free to start, and most of it stays free.

| Tool | Free tier | When you would ever pay |
|---|---|---|
| GitHub | Unlimited private repos | Never, for this |
| Vercel | 100GB bandwidth a month | Dozens of busy client sites |
| Apify | About 5 dollars of credit a month | Heavy scraping, and you can add more free accounts |
| Groq | Generous daily limit | A very busy client chatbot |
| Resend | 3,000 emails a month, 100 a day | Sending at real volume |
| Google | Free | Never |
| Cal.com | Free | Never, for one person |
| Stripe | No monthly fee | They take a cut per payment |
| A domain | Not free | About 10 a year |

**Your only guaranteed cost to start is a domain.** Roughly ten a year.

⚠️ Never put a paid API key anywhere in this repo. Everything here is built to
run on free keys. If something asks you to add a card to make it work, stop and
check, because you almost certainly do not need to.

---

## The order things happen in, once you are set up

1. Scrape a town and a trade, leads land in your CRM
2. The instant builder makes each promising lead a real site and a proposal
3. Cold email, DM or call them, every one pushing to book a call
4. Run the call, send the proposal, they sign and pay on the page
5. Send the onboarding form, they fill it in
6. Build and launch their real site
7. Their leads, reviews and referrals run themselves from there

Folders `01-find-leads` through `05-keep-the-client` follow that order.
