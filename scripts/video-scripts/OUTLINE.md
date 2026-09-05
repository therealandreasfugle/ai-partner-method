# Course outline: 17 videos

What to show and what to cover. No dialogue. The detailed versions in this folder
have the exact warnings written out if you want them, but this page is the one to
have open while you record.

Videos 1 to 5 are a complete module. You can publish after five recordings.

---

## 1. What you actually get
**8 min. Nothing set up yet, just look at the finished thing.**

SHOW, six tabs:
- aipm-templates.vercel.app, scroll the gallery, open two
- summit-roofing-site.vercel.app, submit the form, use the chat bubble
- aipm-client-proposal.vercel.app, scroll the whole thing
- aipm-instant-site.vercel.app
- aipm-instant-proposal.vercel.app/proposal.html?site=integrity-plumbing-heating
- settoku-watch.vercel.app
- then the repo, top level folders only, no code

COVER:
- You are not building any of this, you are connecting it to your accounts
- The five commands that run the whole business: /setup /check /find-leads
  /build-site /onboard-client
- What each top level folder is for

WARN: those demos run on our accounts, they deploy their own copies.

---

## 2. Set up your accounts
**20 min. The highest drop-off video in the course.**

SHOW:
- The cost table
- `/setup` running in Claude Code
- Four accounts properly: Vercel, Apify, Google Sheet, Resend
- The other six at speed
- `/check` finishing green

COVER:
- Nine of ten are free, only the domain costs anything, about 10 a year
- It writes every key into the right file, they never edit a file by hand
- The Google Sheet is the fiddly one, 20 minutes, slow down there
- Run /check any time something stops working

WARN: the sheet SHARED_TOKEN is not optional. Blank means anyone with that
address can write into their CRM.

---

## 3. Find leads worth calling
**10 min. Run a real scrape on camera.**

SHOW:
- The trade evidence table
- `/find-leads`, give it a trade and a town
- The run, uncut, so they see how long it takes
- The results in the sheet, scroll the columns

COVER:
- Plumbers best, electricians second, avoid dentists lawyers accountants
  (they have agencies), avoid barbers and nail salons (no email listed)
- Measured on 224 real businesses, not a hunch
- About 0.0064 per business, keep a run under 4 dollars
- Two kinds of hot lead: no site, or an old site. Old site is the better lead
  because they have already paid for one once

WARN: country code is the two letter one, gb not uk. And re-running the same
town returns nothing on purpose, it is skipping businesses already in the sheet.

---

## 4. Outreach that books calls
**15 min.**

SHOW:
- The instant builder running against one lead from video 3
- `scripts/cold-email`, the four angles
- One angle file, read the first two lines only
- `scripts/dm` and `scripts/phone/cold-call.md`
- `02-outreach/email-warmup.md`

COVER:
- Every message ends in book a call. Not a reply, not a quote
- Three shapes: proposal, video, or both
- The angle is already in the lead row, match it to what the scraper found
- Most replies come from the follow-ups, not the first send
- The dialler runs through their own phone, nothing to buy

WARN, and this is the one that decides whether any of it works: the failure is
deliverability, not copy. New domain plus 50 sends on day one lands in spam
permanently and looks exactly like a copy problem. Ramp 5 a day to 50 over a
month, and use a second domain so cold email never touches the address clients
reply to.

---

## 5. The call, the proposal, the money
**15 min. Last video of module one.**

SHOW:
- aipm-client-proposal.vercel.app, scroll it all, then the seller price panel
  and the signature block
- The seven steps from `scripts/phone/discovery-call.md`
- `/onboard-client`

COVER:
- The proposal does the closing, their job is six questions then silence
- Step five is where everyone fails: say the price, then say nothing
- Handle the real objection, not the wrapper
- Take payment and signature on the call
- Build fee is once, monthly fee is the business, never discount the monthly to
  win the build

WARN, both halves: never promise a result, you sell a mechanism and a standard
of work. And work starts after the money clears, because the non-refundable
clause only holds if that order is kept.

---

# The ten delivery videos

Short, about 4 minutes each, so a student can jump straight to the one they are
stuck on. Same shape every time: what the client is paying for, where it lives,
the clicks, what must be customised, how to check it.

## 6. Website build, $4,500
SHOW: their form answers next to the gallery, pick a template, `/build-site`,
the deploy.
COVER: one Vercel project per client, everything comes from their form, blank
fields stay blank.
WARN: their own photos, never stock. Never invent a review, rating, year founded
or accreditation.
CHECK ON CAMERA: desktop and phone width, submit the form, click every link.

## 7. CRM and power dialler, $1,500
SHOW: deploy the CRM, the sheet behind it, the env vars, generate a login, then
the pipeline and the dialler running with arrow keys.
COVER: two modes, you run it or they get a login. Dialler uses their own phone,
nothing billed.
WARN: env changes only apply on a new deployment. Change, redeploy, then test.

## 8. Automated lead follow-up, $1,200 (give this one 5 min)
SHOW: one form submission doing four things at once, email with reply-to set to
the customer, Slack, instant customer reply, sheet log.
COVER: this is the line item that earns the monthly fee. Speed to lead decides
who gets the job. Before this existed the form threw the lead away.
WARN: LEAD_TO is theirs, LEAD_FROM is yours. Backwards and the client never
hears about a single lead, and everything looks fine from your side.
CHECK ON CAMERA: submit the form as a customer, watch the email land.

## 9. SEO, schema and AEO, $1,200
SHOW: the built output, the structured data, a service area page, sitemap.
COVER: none of this is built by hand, it comes out of the build. A page per
service area is the biggest part of ranking locally. FAQ schema is what makes
them quotable to an AI, and it works without JavaScript, the accordion does not.
Be honest about the known gap: page titles inherit the homepage right now.
WARN: do not pad service areas with towns they do not cover. Never promise an AI
will recommend them.

## 10. Referral program, $900
SHOW: the referrals page, the payout ledger, the cap setting, the three emails.
COVER: already built past what the proposal promises. Yearly cash cap per person
is enforced server side so nobody creates a tax problem.
WARN: the client funds the payout, say it out loud on the sales call. Set numbers
that work for their margin, and if they do not, do not run it for them.

## 11. Review engine, $700
SHOW: mark a lead Won in the CRM and let the email fire. Then the thank-you page
in order: thanks and video, discount, review ask, referral.
COVER: already wired, fires on Won, runs once per customer, only after the save
succeeds. Silent until three variables are set, which is why it looks broken.
WARN: the discount is unconditional, never tied to leaving a review, that breaks
Google's rules and can penalise the client's listing. And get their Google review
link at onboarding, the whole line item dies without it.

## 12. AI chatbot, $600
SHOW: the bubble on a live site, ask it something only that business would know.
Then the single env var on Vercel.
COVER: knows the business from build time, free via Groq then Gemini, rate
limited, never invents a price. One key covers every site they ever build.
WARN: the key goes in Vercel env, never in a site file.

## 13. Launch, domain, hosting, SSL, $500
SHOW: add the domain in Vercel Settings, the DNS records, the padlock appearing.
COVER: four steps and a wait. Buy them a domain and bill it on if they have none.
WARN: never move a client's domain into your own account quietly. Get added to
their registrar, or stay on the phone while they add the records. And a
successful deploy message is not proof, open the real address and look.

## 14. Lead notifications, $400
SHOW: the Slack app flow live, it genuinely takes two minutes.
COVER: email half already done in video 8. Comma separate for the team.
WARN: give them a dedicated leads channel, not their general one, or the team
mutes it in a week. And do not promise their customers SMS, every client needs
their own number and a carrier registration that is slow and gets rejected.

## 15. GA4, $300
SHOW: create the property, the measurement ID, add it, then see yourself in
Realtime.
COVER: the only four numbers an owner cares about, found, enquired, where from,
what they read. Never send them a GA4 dashboard.
WARN: set it up day one, the first month is the baseline. And put the property in
their Google account or make them admin, same rule as the domain.

---

## 16. Keeping the client
**8 min.**

SHOW: the four numbers, an example month's email.

COVER:
- Build fee pays once, monthly fee is the business
- Do the maths out loud on ten clients on a monthly
- Number four, what you changed and what is next, is what keeps you paid
- Answer small edits same day, it buys more loyalty than any report
- Seasonal: roofer before storm season, plumber before the freeze, garage before
  MOT season. Put the dates in a calendar the day they sign

WARN: send something every month whether they ask or not. That is the whole
retention strategy.

---

## 17. Your own credibility
**8 min. The most skipped part of the business.**

SHOW: a template being used for their own site, the four things it needs.

COVER:
- You are selling websites, not having one is the loudest thing about you
- Own site in an afternoon: what you do, who for, examples, book a call
- Proof: they may show the demo builds until they have real clients
- Somewhere to be checked: a Google Business Profile, one social they post on,
  an email on their own domain
- The honest first pitch: you built them a site before you called them, nobody
  else who contacts that business this year will have

WARN: never invent a testimonial, a client count, or a case study result.
