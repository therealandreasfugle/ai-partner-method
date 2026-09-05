# 6. Resend

**What it does for you:** every email your systems send. Contracts, instant lead
alerts to your clients, review requests, referral payouts, onboarding
confirmations, and your cold outreach.

**Cost:** free tier is 3,000 emails a month and 100 a day. That is plenty until
you have several clients.

## Steps

1. Sign up at https://resend.com/signup
2. **Add your domain**, do not skip to the API key. https://resend.com/domains
3. Resend gives you three DNS records to add at your registrar. Add all three.
   They are explained in [08-domain.md](08-domain.md), and this is the single
   most important thing on this page.
4. Wait for the domain to show **Verified**. Usually minutes, sometimes a few
   hours.
5. Now get your key: https://resend.com/api-keys. It starts with `re_`.

## Where the key goes

The same key is used by several projects. Each one is a separate Vercel project,
so you add it to each.

| Project | Variables it needs |
|---|---|
| Each client website | `RESEND_API_KEY`, `LEAD_FROM`, `LEAD_TO` |
| Your proposal | `RESEND_API_KEY`, `RESEND_FROM`, `AGENCY_EMAIL`, `SIGNING_SECRET` |
| Your onboarding form | `RESEND_API_KEY`, `ONBOARDING_FROM`, `ONBOARDING_TO` |
| Your CRM | `RESEND_API_KEY`, `RESEND_FROM` |

Full list in [ENV-REFERENCE.md](ENV-REFERENCE.md).

## Why the domain matters more than the key

You can technically send from Resend's shared testing address without verifying
anything. Do not.

An email from an unverified domain lands in spam, or does not arrive at all. Worse,
it arrives for you when you test it, and silently fails for the business owner you
are trying to reach. You will think your outreach is working and wonder why nobody
replies.

**Verify the domain first. Everything else in this business depends on your email
actually arriving.**

## Two addresses, not one

Set up two sending identities:

- **Your real address**, on your real domain. Used for contracts, client
  onboarding, and anything a paying client sees.
- **A separate outreach domain** for cold email. Explained in
  [08-domain.md](08-domain.md).

If cold outreach ever damages your sending reputation, it damages the throwaway
domain and your client email keeps working.

⚠️ **Never send cold email from the domain your clients rely on.** One spam
complaint run can take down the address your contracts go out from.

⚠️ The free tier caps at 100 a day. Do not try to raise this by sending faster.
Read [`02-outreach/email-warmup.md`](../02-outreach/email-warmup.md) before your
first send.
