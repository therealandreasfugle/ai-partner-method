# What you get

Everything below is built and working. You are not building any of it. You are
connecting it to your own accounts and then running the process.

## See it before you set anything up

These are live right now. Open them, click around, and get a picture of what you
are selling before you touch a single setting.

| Open this | What you are looking at |
|---|---|
| [The template gallery](https://aipm-templates.vercel.app) | The 20 premium websites you build clients on. Every one is yours to use |
| [A finished client site](https://summit-roofing-site.vercel.app) | What a client actually receives. Try the enquiry form and the chat bubble |
| [The sales call proposal](https://aipm-client-proposal.vercel.app) | What you put on screen during a call. Scroll the whole thing, it closes the sale for you |
| [An auto-built proposal](https://aipm-instant-proposal.vercel.app/proposal.html?site=integrity-plumbing-heating) | Generated for one scraped lead, with their site embedded. This is what goes in a cold email |
| [An auto-built site](https://aipm-instant-site.vercel.app) | Built from a Google Maps listing in about 45 seconds, before you ever speak to them |
| [An evergreen video page](https://settoku-watch.vercel.app) | Send this instead of doing a live call for every lead |

⚠️ Those are demonstrations running on our accounts. **You deploy your own copies**
from this repo, on your own Vercel, with your own keys. Nothing you build ever
touches anyone else's client data.

---

## The systems, and where they are

| System | Folder | What it does |
|---|---|---|
| Lead scraper | `tools/lead-scraper` | Scrapes Google Maps for local businesses with phone, email, site status and rating |
| CRM and power dialler | `tools/crm` | Pipeline, lead drawer, call outcomes, sequences, referrals, customers |
| 20 website templates | `tools/website-templates` | One shared core, 20 finished skins |
| The client site template | `tools/website-template` | What the factory builds on, including lead capture and the chatbot |
| Instant site and proposal builder | `tools/instant-builder` | A real site and proposal per lead, in about 45 seconds |
| The sales proposal | `tools/sales-proposal` | The on-a-call proposal, with a contract signed on the page |
| Proposal generator | `tools/proposal-builder` | Generates a proposal per client from their build |
| Evergreen VSL page | `tools/vsl-page` | Video landing page that pushes to book a call |
| Client onboarding form | `04-deliver/client-onboarding` | The one form anyone fills in, sent after they pay |

## The words, all written for you

| What | Folder |
|---|---|
| 16 cold emails, four angles plus follow-ups and a break-up | `scripts/cold-email` |
| DM scripts for social-only leads, plus objection handling | `scripts/dm` |
| Cold call script and voicemail | `scripts/phone/cold-call.md` |
| The discovery and closing call, including the four objections | `scripts/phone/discovery-call.md` |
| Email warmup and domain authentication | `02-outreach/email-warmup.md` |
| Marketing SOPs, frameworks and case studies | `02-outreach/marketing-sops` |
| 10 client emails, payment through to win-back | `scripts/client-emails` |
| The video your client records for their thank-you page | `04-deliver/06-reviews/CLIENT-VIDEO-SCRIPT.md` |
| Google Business Profile, the whole setup | `04-deliver/01-website/GOOGLE-BUSINESS-PROFILE.md` |
| Launch QA checklist | `04-deliver/08-launch/LAUNCH-QA.md` |
| Reusing a template for any trade | `04-deliver/01-website/REUSING-A-TEMPLATE.md` |
| Course video outline, 17 videos | `scripts/video-scripts/OUTLINE.md` |

## 38 Claude skills

In `skills`. Copywriting and anti-slop, the design set, SEO, and video. Install
them once with `cp -R skills/* ~/.claude/skills/`.

---

## What you MUST customise

Nothing here works until it is yours. These are the things that are deliberately
left blank or set to a placeholder.

**Once, for you:**

- Every account and key in [`00-setup`](00-setup/README.md). Run
  `python3 00-setup/setup_check.py` and it tells you exactly what is missing
- Your booking link, in the VSL page, the pitch page and your email signature
- Your business name, your photo and your signature on the proposal
- Your prices in the proposal's seller panel
- **The contract clauses.** They are a starting point, not legal advice. Have your
  own solicitor look at them before you sign anything real

**Per client:**

- Their services, service areas, hours, phone, photos and real reviews
- `LEAD_TO`, their email, so their enquiries reach them and not you
- Their Google review link, or the review engine cannot run
- Their Slack webhook, if they want team alerts
- A GA4 property of their own

Search for `{{YOUR_BUSINESS}}`, `{{YOUR_BOOKING_LINK}}`, `{{YOUR_NAME}}`,
`YOUR_SUPABASE_PROJECT_REF` and `yourdomain.com` to find every spot.

---

## What is not here yet

Being straight with you rather than letting you find out later.

| Missing | What it means for you |
|---|---|
| Troubleshooting guide | Run `/check` first, it catches most of it. A written guide is coming |

---

## The order it all happens in

1. Set up your accounts, once. `00-setup`
2. Scrape a town and a trade. Leads land in your CRM
3. The builder makes each good lead a real site and a proposal
4. Email, DM or call them. Every one pushes to **book a call**
5. Run the call, they sign and pay on the proposal
6. Send the onboarding form
7. Build and launch their site
8. Their leads, reviews and referrals run themselves

⚠️ **We never ask a prospect to fill in a form.** Outreach is a proposal, a video,
or both, and all of them end in one ask: book a call. The only form anyone fills
in is onboarding, and that goes out after they have paid.
