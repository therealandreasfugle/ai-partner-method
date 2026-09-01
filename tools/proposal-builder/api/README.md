# Contract signing (`/api/send-contract` + `/api/complete-signature`)

Your proposal has a built-in **send-to-sign** flow. On the sales call you fill in
the client's name, location, date, and email and click **Send contract to sign**.
The client gets a private link in their own inbox, reviews the full agreement,
draws their signature, and the moment they sign a signed PDF is emailed to **both**
of you.

Two serverless functions run this (plus shared helpers in `_lib.js` and the
canonical contract in `contract.json`, both of which Vercel treats as private
because their names are not public routes):

- **`send-contract.js`** validates your input and emails the client a signed,
  expiring link. It never trusts the client's browser: the price and terms are
  sealed into the link so they cannot be changed.
- **`complete-signature.js`** verifies the link, stamps your on-file signature and
  the client's signature into the PDF with an audit trail (date, time, IP,
  agreement ID), and emails the executed copy to both parties.

It only works once you connect your own email and set a signing secret. Until
then the buttons return a clear "not configured" message. Nothing is hardcoded.

## What you need

1. A free **Resend** account: https://resend.com
2. A **verified sending domain** in Resend (a few DNS records on a domain you own).
3. Your proposal deployed on **Vercel**.

## Connect it (4 environment variables on your Vercel project)

In your Vercel project, go to **Settings, Environment Variables**, and add:

| Variable | What it is | Example |
|---|---|---|
| `RESEND_API_KEY` | Your API key from the Resend dashboard | `re_xxx...` |
| `RESEND_FROM` | Your verified sender, `Name <you@yourdomain.com>` | `Your Agency <hello@youragency.com>` |
| `AGENCY_EMAIL` | Where the signed copy is emailed to you | `you@youragency.com` |
| `SIGNING_SECRET` | Any long random string; it signs the link so the client cannot alter the deal. Keep it secret. | (generate one, e.g. `openssl rand -hex 32`) |

Then set **`contract_email`** in `clients/_agency/agency-brand.json` to the same
address as `RESEND_FROM` (shown to the client as "from ...").

Redeploy after adding the variables. Send a test to your own email address from
the live page, open the link, sign, and confirm the executed PDF lands in both
inboxes.

## Your signature (set once)

Your signature is applied automatically when you send, so you do not redraw it
each deal. By default it is your founder name rendered in a script font. To use a
real drawn signature, save a PNG of it and point `founder.signature_path` in
`agency-brand.json` at it (e.g. `assets/founder-signature.png`).

## The contract wording

The agreement text lives in `contract.json` (a single source that feeds the
on-page review, the signing page, and the PDF). It ships as a plain, protective
service agreement: non-refundable setup fee, delivery guarantee, a limitation of
liability capped at fees paid, an indemnity, and an as-is availability clause.
Governing law comes from `jurisdiction` in `agency-brand.json` (defaults to
England and Wales). **Have your own solicitor review it once before using it for
real deals.** The payment clause is filled from the **Contract payment terms** box
in the proposal's seller panel, so you can set price and retainer per deal.

## Security

- Both endpoints reject requests that do not come from your own deployment
  (same-origin), which stops outsiders and bots from poking the API.
- Every text field is length-capped, control-stripped, and HTML-escaped before it
  goes into an email or a PDF.
- The signing link is HMAC-signed and expires in 14 days.
- Do not commit real API keys or the signing secret. They belong only in Vercel's
  environment settings.
