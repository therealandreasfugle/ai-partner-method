# Stay protected when you sign a client

This is plain-English guidance, not legal advice. The contract in this proposal is
a strong starting template. Do these things once and you are in good shape.

## Before your first signed deal

1. **Trade through a limited company.** Sign contracts in the company's name, not
   your personal name. It keeps your personal assets separate from the business.
2. **Get one solicitor review.** Have a solicitor read `api/contract.json` once and
   adjust it for your country. Set your region in `agency-brand.json` under
   `jurisdiction`. A single review covers every future deal.
3. **Turn on two-factor authentication** on your Vercel account, your email, and
   your domain registrar. This is the single biggest thing that stops someone
   taking over a site and embarrassing you or your client.

## Why the "what if it gets hacked" worry is smaller than it looks

A proposal page like this is **static**: there is no login, no database, and no
admin panel behind it, so there is nothing to break into and deface the way you
might picture. The only live part is the contract API, and it is locked down:

- It only accepts requests from your own page (same-origin).
- Spam and bursts are throttled.
- Every typed field is cleaned, so junk or offensive text cannot ride into a PDF
  or an email.
- The signing link is sealed and expires, so a client cannot change the price or
  terms.

## The contract already limits your liability

The agreement your client signs includes:

- **Liability capped** at the fees they actually paid you.
- **No responsibility** for downtime of third-party platforms (hosting, email),
  or for someone else's unlawful acts such as hacking or defacement.
- **Non-refundable setup fee**, with a "we keep working until it's right" delivery
  guarantee as the client's only remedy.
- **Indemnity**: the client is responsible for the content and instructions they
  give you, and for securing their own accounts.

## Keep your records

Every signed deal emails you a PDF with both signatures and an audit trail (date,
time, IP, agreement ID). Keep those PDFs. They are your proof the client agreed.
