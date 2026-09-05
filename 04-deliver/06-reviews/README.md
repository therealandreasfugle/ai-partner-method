# 06. The automatic review engine

**What the client is paying for:** a Google review asked for after every finished
job, without them remembering to ask. Value on the proposal: $700.

**Where the system lives:** `tools/crm/api/_thankyou.js`, fired from
`tools/crm/api/crm.js`, landing on `tools/crm/thanks.html`.

## It is already wired

The moment a lead is marked **Won** in the CRM, the thank-you email fires. It runs
once per customer, and only after the sheet write succeeds, so a customer can
never be emailed twice or emailed about a job that did not save.

It stays completely silent until you set three things, which is why it may look
broken when it is simply not switched on yet.

## You MUST set, per client

| Variable | What it is |
|---|---|
| `THANKYOU_URL` | Your deployed copy of `thanks.html` |
| `RESEND_API_KEY` | Your Resend key |
| `RESEND_FROM` | A verified sender |

Then edit `thanks.html` for that client and set `reviewUrl` to **their Google
review link**. If you leave it blank the button becomes a "needs setup"
placeholder rather than a dead link, which is safe but useless.

## Why the order on that page matters

Thank you and the video, then the discount **unconditionally**, then the review
ask, then the referral. The discount is never conditional on leaving a review.
Paying for reviews, or making a reward contingent on one, breaks Google's rules
and can get the client's listing penalised. Give the discount either way and ask
for the review separately.

## The video the owner records

Script for them is in [CLIENT-VIDEO-SCRIPT.md](CLIENT-VIDEO-SCRIPT.md). Send it
during onboarding, in the same message as the photos.

⚠️ Get the client's Google review link during onboarding. It is the single most
commonly skipped field and this whole line item cannot run without it.
