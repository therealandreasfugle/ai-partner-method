# Cold email templates

Fifteen emails. Four opening angles, a three step follow up, a break up, and the
two you send after a call.

## Before you send a single one

Read `02-outreach/email-warmup.md` first. A brand new domain that sends fifty
emails on day one goes straight to spam and stays there. Warming up takes two to
three weeks and it is the difference between this working and this not working.

## The placeholders

These four are filled in automatically by the CRM sequence engine:

| Placeholder | Becomes |
|---|---|
| `{{business}}` | Bloor Street Plumbing |
| `{{town}}` | Birmingham |
| `{{site}}` | the demo site you built them |
| `{{proposal}}` | their personalised proposal |

These two you set yourself, once, in your sequence settings:

| Placeholder | Becomes |
|---|---|
| `{{your_name}}` | your first name |
| `{{your_phone}}` | the number you actually answer |

`{{first_name}}` is only filled in when the scrape found an owner name. Most
Google Maps listings do not have one, so **every template below reads correctly
without it**. Never send an email that opens "Hi ," because the merge failed.

## The rules these were written to

1. **Short wins.** The winners here are under 90 words. An owner reads email on a
   phone, between jobs, with dirty hands. Long emails do not get read, they get
   archived.
2. **Lead with them, never with you.** No "I'm a web designer who". Open on
   something true about their business.
3. **No price, ever, in a cold email.** Price with no context sounds expensive
   whatever the number is. Price belongs on the call.
4. **One ask.** Every email asks for exactly one thing. Two asks gets you zero.
5. **Never promise a reply, a result, or a timeline you have not earned.** No "I
   guarantee", no "this will double your calls".
6. **Never invent anything about their business.** Do not say you counted their
   reviews unless you counted them. Do not say you "noticed" something you did
   not look at. Owners can tell, and it is the fastest way to burn a name.
7. **No emoji. No dashes.** Commas, full stops and brackets only.

## Which angle to use

The scraper tells you which one fits. Match the angle to what is actually wrong,
and if nothing is obviously wrong use angle D.

| Angle | Use when the scrape says | Emails |
|---|---|---|
| A | No website at all | 1, 2, 3 |
| B | Website exists but is old or broken on a phone | 4, 5, 6 |
| C | Few reviews, or reviews they never reply to | 7, 8 |
| D | Nothing obviously wrong, they just are not ranking | 9, 10 |

Then everyone gets the follow up sequence (11, 12, 13), then the break up (14).

Files: `angle-a-no-website.md`, `angle-b-outdated-site.md`,
`angle-c-reviews.md`, `angle-d-not-ranking.md`, `follow-ups.md`,
`after-the-call.md`.
