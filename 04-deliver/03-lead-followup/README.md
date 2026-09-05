# 03. Automated follow-up to every lead

**What the client is paying for:** the enquiry reaching them in seconds, and the
customer hearing back immediately. Value on the proposal: $1,200.

**Where the system lives:** `tools/website-template/api/lead.mjs`.

## Why this is the most important thing you deliver

Before this existed, every site built by the factory threw the lead away. The
form showed a thank-you page and did nothing else, so the customer believed they
had made contact and stopped calling around.

Speed to lead decides who wins the job. This is the line item that actually earns
the monthly fee.

## What one form submission now does, in parallel

1. Emails the owner instantly, with reply-to set to the customer so they just hit
   reply
2. Posts to their Slack channel, if set up (see `09-notifications`)
3. Sends the customer an instant reply so they know a human is coming
4. Logs the enquiry to a sheet, if set up

If every channel fails, the visitor is told plainly and given the phone number. It
never shows a thank-you page for a lead nobody received.

## You MUST customise, per client

| Variable | Set it to |
|---|---|
| `RESEND_API_KEY` | Your Resend key |
| `LEAD_FROM` | A verified sender on **your** domain |
| `LEAD_TO` | **The client's** email. Comma separate for their team |

⚠️ `LEAD_TO` is theirs, `LEAD_FROM` is yours. Swapped, the client never hears
about their own leads.

## Check it

Submit the form on the live site yourself and watch the email arrive. Do not read
the code and assume. This is the one thing you cannot afford to get wrong.
