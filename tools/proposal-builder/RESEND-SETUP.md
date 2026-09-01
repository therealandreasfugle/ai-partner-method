# Connect your email sender (Resend) — one-time, about 10 minutes

Your proposals can email the contract to a client to sign, and email the signed
PDF to both of you. That sending is done through a free service called **Resend**.
You do this once. After that every proposal you build just works.

You do not need to understand any of it. Follow the steps and paste what Claude
asks for.

## What you need first

A **domain you own** (like `youragency.com`). You cannot send professional
contract emails from a personal Gmail. If you do not have a domain yet, buy one
at any registrar (Namecheap, GoDaddy, Cloudflare, roughly $10/year). Then come
back here.

## Step 1 — Make a free Resend account

Go to **https://resend.com/signup** and sign up. The free plan sends thousands of
emails a month and needs no card.

## Step 2 — Verify your domain

1. In Resend, click **Domains**, then **Add Domain**, and type your domain (e.g.
   `youragency.com`).
2. Resend shows you a few **DNS records** (some TXT and CNAME lines).
3. Log in to wherever you bought your domain, find its **DNS settings**, and add
   each record exactly as Resend shows it (copy, paste, save).
4. Back in Resend, click **Verify**. It can take a few minutes to a couple of
   hours for the records to go live. When every record shows a green check, you
   are done. (Stuck? Tell Claude "help me verify my Resend domain" and paste what
   you see.)

## Step 3 — Create an API key

In Resend click **API Keys**, then **Create API Key**, give it any name, and copy
the key it shows you (it starts with `re_`). You only see it once, so copy it now.

## Step 4 — Give it to Claude

Run **`/setup-agency`** (or tell Claude "connect my Resend"). Claude will ask for
three things and wire the rest itself:

- the **API key** you just copied,
- the **from address** on your verified domain (e.g. `Your Agency <hello@youragency.com>`),
- the **inbox** where you want your copy of signed contracts to land.

That is it. Claude stores these safely (never committed to any repo), generates
the security secret for you, and pushes them to your proposal's hosting
automatically when you deploy. You never touch a dashboard of settings.

## How you know it worked

After your next proposal deploys, open it, scroll to the signing section, put your
own email in the client email box, and click **Send contract to sign**. You should
get the signing link in your inbox within a minute. Open it, sign, and confirm the
signed PDF lands in both inboxes.

## Staying out of the spam folder

Two things keep your contract emails landing in the inbox, not spam:

1. **Verify your domain (Step 2 above).** This is the big one. A verified domain
   lets your email carry the trust signatures (SPF, DKIM, DMARC) that inboxes
   check. Sending from an unverified or generic address is what gets flagged.
2. **Use a from-name that matches your domain.** Set your from address to your own
   agency on your own domain, e.g. `Your Agency <hello@youragency.com>`. A
   from-name unrelated to the sending domain (for example a client's business name
   on your domain) reads like impersonation to Gmail and is more likely to be
   filtered. The contract emails already send in both plain text and HTML, which
   also lowers the spam score.

If a first test still lands in spam, open it and click **Not spam** once. That
teaches your inbox; later sends from the same verified domain settle into the
inbox.
