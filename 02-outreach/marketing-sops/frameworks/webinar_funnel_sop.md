# Webinar Funnel SOP

Full-funnel operating procedure for running weekly book-a-call webinars for creators and coaches selling high-ticket info products. Covers everything from ad setup through closed deal.

**Tech stack:** Meta Ads · VS Code (landing pages) · ConvertKit · ManyChat + Boo Send · Typeform · Close CRM · [Webinar platform TBD]
**Team:** Setters + Closers
**Offer structure:** High-ticket main offer + $27/$47 VIP upsell on every webinar

---

## Prerequisites (Do These Before Anything Else)

**1. Brand Voice Intake**
Client fills out your brand voice intake form. You must have their answers before writing any copy. Every email, SMS, and script in this SOP has `[PLACEHOLDERS]` — swap them with brand voice answers before use.

Required inputs from intake:
- Creator name and program name
- Niche and target audience (who they help, what result)
- Tone of voice (formal/casual, words they use, words they avoid)
- Origin story summary (1–2 sentences)
- Core transformation promise (what the client achieves)
- 3–5 specific student result testimonials (name, result, timeframe)
- Instagram handle

**2. Offer Details**
Collect before building anything:
- High-ticket offer name, price, and what's included
- VIP upsell: $27 or $47? What's the guide/resource included?
- Implementation call format (1:1 with setter, group Q&A, or mini webinar?)
- Webinar topic/title
- Webinar date and time

**3. Asset Audit**
- Existing email list size and platform (should be on ConvertKit)
- Instagram following size and engagement rate
- Existing testimonials (screenshots, video, written)
- Existing long-form FAQ or testimonial videos

---

## Funnel Architecture Overview

```
Instagram Organic + Meta Ads
        ↓
Registration Page
        ↓
Thank You Page → VIP Upsell ($27/$47)
        ↓
Pre-Webinar Nurture (ConvertKit emails + ManyChat SMS)
        ↓
Live Webinar (45–60 min pitch → book a call CTA)
        ↓
        ├── Booked call → Pre-Call Nurture → Sales Call
        ├── Showed, didn't book → 7-day replay sequence
        ├── Partial show → Separate nurture + replay
        └── No-show → 7-day replay sequence
                          ↓
              Meta Retargeting (Call Funnel)
                          ↓
              Typeform Application → Close CRM → Sales Call
```

---

## Phase 1: Ad Strategy

### Webinar Cadence
- **4 webinars/month** (weekly)
- **3 cold traffic webinars** — exclude people who engage with the profile
- **1 warm audience webinar** — target existing followers, email list, past engagers
- Reason: prevents warm audience fatigue from seeing the same webinar repeatedly

### Budget Split
- **70% to webinar ads**
- **30% to call funnel retargeting**
- Example: $10K/mo ad spend → $7K webinar, $3K retargeting

### Promo Timeline
- **4–5 days** before the webinar (can compress to 3 days minimum)
- More spend closer to the webinar = higher show rate
- Do NOT run a 7–10 day promo unless it's your first webinar ever and you're testing

### Campaign Setup (Meta)

**Campaign 1: Cold Traffic Webinar (CBO)**
- Objective: Lead / Registration
- 3 adsets:
  1. Broad targeting
  2. Lookalike audience (past buyers, email list)
  3. Interest stack (niche-specific interests)
- Exclude: People who engage with the Instagram profile (for cold webinars)

**Campaign 2: Warm Audience Webinar (ABO)**
- Run once a month for the warm webinar
- 1 adset: warm audience (followers, email list, past engagers, video viewers)
- Separate budget — keep conservative so you don't over-fatigue

### Registration Page (Built in VS Code)
No VSL. Straight opt-in page structure:
1. **Call-out line** — "Attention [specific audience]..."
2. **Headline** — the core promise/result
3. **Sub-headline** — who it's for + urgency
4. **Registration form** (sticky — stays visible on scroll)
5. **What you'll learn** (3–5 bullet points)
6. **About the creator** (short credibility section)
7. **Testimonials** (specific results, real names/photos)

**Benchmark:** Target $10 cost per registrant for standard niches. Higher for financially-qualified audiences (real estate, business acquisitions, etc.)

---

## Phase 2: Thank You Page + VIP Upsell

### Immediately After Registration
Registrant lands on a **VIP upsell page** (not a standard thank you page).

### VIP Upsell Page Structure
1. **Headline:** "Congrats on registering — here's how to get 10x more out of [WEBINAR NAME]"
2. **Short VSL** (2–3 min): Pitch the VIP experience. Cover:
   - What the VIP package includes
   - How it makes the webinar more actionable
   - The implementation call (positioned as getting personalized help)
3. **What's included:**
   - [GUIDE NAME] — solve one specific pre-webinar problem
   - [BONUS RESOURCE] — e.g., template, swipe file, niche guide
   - VIP Implementation Call with [SETTER NAME] (this is a sales call)
4. **Price:** $[27 or 47]
5. **CTA:** "Yes, I want the VIP Experience — Add to My Registration"

**Key principle:** Do NOT include anything that contradicts or replaces the webinar. The VIP should make them more prepared for the webinar, not replace it. No full courses, no coaching call recordings.

**If they buy the VIP:** They are a high-priority lead. Flag in Close CRM. Setter guarantees they book the implementation call regardless of whether they show to the webinar.

### Standard Thank You Page (For Non-VIP Buyers)
After declining the upsell, or after VIP purchase, show the standard thank you page:
1. **Thank you video** (2–3 min): Creator on camera, breaks down:
   - What to expect on the webinar
   - Simple steps to prepare
   - Agenda overview
2. **Agenda document** (PDF or embedded Google Doc): Exactly what will happen on the webinar, timestamped. Great for older audiences who don't watch videos.
3. **FAQ section** with long-form FAQ videos if available
4. **Testimonials** — specific to the transformation promise
5. **Add to calendar** button

---

## Phase 3: Pre-Webinar Nurture

### ConvertKit Email Sequence
Send 2–4 emails per day from registration to webinar day. These are value-dense, not just reminders. Each email should do one of three jobs:
1. Sell them on **why this vehicle/method works**
2. Sell them on **why they specifically can do this**
3. Sell them on **why [CREATOR NAME] is the person to learn from**

**Email 1 — Immediate (Confirmation)**
Subject: `You're in — here's what to expect, [FIRST NAME]`
Body:
```
Hey [FIRST NAME],

You're registered for [WEBINAR NAME] on [DATE] at [TIME].

Here's exactly what we're covering:
[BULLET 1]
[BULLET 2]
[BULLET 3]

Quick heads up — I only do this [weekly/monthly], so I'm glad you locked in your spot.

Add it to your calendar now so life doesn't get in the way:
[CALENDAR LINK]

See you [DAY],
[CREATOR NAME]
```

**Email 2 — Day 1, Value**
Subject: `The thing nobody tells you about [NICHE/TOPIC]`
Body:
```
Hey [FIRST NAME],

Before [WEBINAR NAME] on [DATE], I want to share something.

[SHORT STORY OR INSIGHT — 3-4 sentences that relate to the core transformation. Use their brand voice. Something surprising or counterintuitive.]

The reason I'm telling you this is because on [DAY], I'm going to show you exactly how [SPECIFIC OUTCOME].

You don't want to miss this.

[CREATOR NAME]

P.S. We go live at [TIME]. Here's the link: [WEBINAR LINK]
```

**Email 3 — Day 2, Social Proof**
Subject: `[STUDENT NAME] went from [BEFORE] to [AFTER] in [TIMEFRAME]`
Body:
```
Hey [FIRST NAME],

I want you to meet [STUDENT NAME].

[2–3 sentence testimonial story. Before state → what they did → specific result with numbers.]

[STUDENT NAME] isn't special. They just had the right framework.

That's what I'm handing you on [WEBINAR NAME] — [DATE] at [TIME].

[CALENDAR LINK]

[CREATOR NAME]
```

**Email 4 — Day Before, Urgency**
Subject: `Tomorrow. [TIME]. Don't miss this.`
Body:
```
Hey [FIRST NAME],

Quick reminder — [WEBINAR NAME] is tomorrow at [TIME].

Here's what we're covering:
[BULLET 1 — specific and results-oriented]
[BULLET 2]
[BULLET 3]

I'm also setting aside time at the end to take your questions live.

This is [weekly/monthly] — but the people who show up tomorrow are going to leave with [SPECIFIC OUTCOME].

See you then.
[CREATOR NAME]

[CALENDAR LINK]
```

**Email 5 — Day Of, Morning**
Subject: `Today's the day, [FIRST NAME]`
Body:
```
Hey [FIRST NAME],

We go live today at [TIME].

One question before you join: what's the #1 thing you're hoping to walk away with today?

Hit reply and tell me — I read every response and I'll make sure we cover it.

[WEBINAR LINK]

[CREATOR NAME]
```

---

### ManyChat / Boo Send SMS Sequence

Set up via ManyChat (Meta DM) + Boo Send (SMS). Run both in parallel.

**Message 1 — Immediate (Question-Based)**
```
Hey [FIRST NAME]! You just registered for [WEBINAR NAME] 🎉

Quick question — what's the ONE thing you're most hoping to get out of it?

Reply back and I'll make sure we cover it. (Also, reply so I can send you the webinar link when we go live — iMessage won't deliver links unless you reply first!)
```
*Wait for reply before sending links. This is intentional — it primes the habit of opening messages from this number.*

**Message 2 — 24 Hours Before**
```
Hey [FIRST NAME], [CREATOR NAME] here.

[WEBINAR NAME] is tomorrow at [TIME].

You still good to make it? Reply YES to confirm your spot and I'll send you the link 🙌
```

**Message 3 — Morning Of**
```
Good morning [FIRST NAME]!

We're going live TODAY at [TIME] for [WEBINAR NAME].

What's one specific thing you're hoping to accomplish on today's webinar?

[WEBINAR LINK]
```

**Message 4 — 1 Hour Before**
```
[FIRST NAME] — we go live in ONE HOUR.

[WEBINAR NAME] starts at [TIME].

Get your notes ready. Here's your link: [WEBINAR LINK]
```

**Message 5 — 30 Minutes Before**
```
30 minutes! 🔥

[CREATOR NAME] is about to go live for [WEBINAR NAME].

Grab your coffee, open up your notes, and join here: [WEBINAR LINK]
```

**Message 6 — 15 Minutes Before**
```
15 min, [FIRST NAME].

[WEBINAR LINK]

See you in there.
```

**Message 7 — We're Live**
```
WE'RE LIVE 🔴

[CREATOR NAME] just went live for [WEBINAR NAME].

Join now — we're already [X] minutes in: [WEBINAR LINK]
```

**Message 8 — 15 Minutes After (For No-Shows)**
```
Hey [FIRST NAME] — we started 15 minutes ago and I don't see you in there yet.

Life happens, totally get it. Jump in late, you can still catch [KEY SECTION]:

[WEBINAR LINK]
```

**Message 9 — 30 Minutes After (For No-Shows)**
```
[FIRST NAME] — just checking in.

We're deep into [WEBINAR NAME] right now. [CREATOR NAME] is covering [TOPIC BEING COVERED].

You can still jump in: [WEBINAR LINK]

Or I'll send you the replay if you can't make it today. Just reply REPLAY.
```

**Show rate target with this sequence: 30%+ on cold traffic.**

---

### Optional: Promo Group (WhatsApp or Telegram)
Add all registrants to a broadcast group (no replies unless moderated).
- Send reminders in-group alongside SMS/email
- Multiple people reacting = social proof that others are showing up
- **Only run this if you have a moderator.** Without moderation, it will hurt more than it helps.

---

## Phase 4: Live Webinar

See `webinar_presentation_sop.md` for the full slide framework and content structure.

**Ops checklist for live day:**
- [ ] Test webinar platform link 1 hour before
- [ ] Confirm all SMS sequences are active and firing
- [ ] Send "We're Live" ManyChat blast the moment you go live
- [ ] Have setter monitoring chat/DMs during the webinar
- [ ] Track exact drop-off points (use platform analytics)
- [ ] Record the full session including Q&A

**Target: 25–30% show rate. 80% retention to pitch. 25% book rate from those who stay.**

---

## Phase 5: Post-Webinar Segmentation + Follow-Up

Immediately after the webinar ends, segment leads into 4 buckets in Close CRM:

| Bucket | Definition | Action |
|---|---|---|
| **Booked** | Showed + booked a call | Pre-call nurture sequence |
| **Showed — Pitched** | Stayed through the pitch, didn't book | Application page + retargeting |
| **Showed — Early Drop** | Showed but left before pitch | Replay with pitch intact + retargeting |
| **No-Show** | Registered, never showed | 7-day replay sequence |

Use webinar platform drop-off data + Zapier to auto-tag into Close CRM in real time.

---

### 7-Day Replay Sequence (No-Shows + Early Drops)

**SMS — Day 0 (Immediately After)**
```
Hey [FIRST NAME] — we missed you on [WEBINAR NAME] today.

[CREATOR NAME] covered some incredible stuff. I'm sending you the replay now — it's only up for a limited time.

Watch here: [REPLAY LINK]
```

**Email — Day 0**
Subject: `You missed it — but here's the replay [FIRST NAME]`
Body:
```
Hey [FIRST NAME],

[WEBINAR NAME] happened today and [CREATOR NAME] went deep on:
[BULLET 1]
[BULLET 2]
[BULLET 3]

I'm keeping the replay up for the next [X] days.

Watch it here: [REPLAY LINK]

As you're watching, if you want to talk about how this applies to your situation specifically, you can book a call directly from the replay page.

[CREATOR NAME]
```

**Email — Day 2**
Subject: `[STUDENT NAME]'s result after watching this`
Body: Testimonial-focused. Tie the result directly to what was covered in the webinar. Link to replay.

**Email — Day 3**
Subject: `The part most people skip (don't skip this)`
Body: Call out one specific section of the webinar. Tell them why it's the part that changes everything. Drive to replay.

**Email — Day 5**
Subject: `Replay comes down in 48 hours`
Body: Urgency. Recap the three biggest things covered. Drive to replay + book a call.

**Email — Day 7**
Subject: `Last chance — replay is coming down tonight`
Body: Final urgency. Drive to book a call.

**SMS — Day 7**
```
[FIRST NAME] — the [WEBINAR NAME] replay comes down tonight.

If you haven't watched yet, this is your last chance: [REPLAY LINK]

Or skip the replay and book a call directly with [CREATOR NAME]'s team: [BOOKING LINK]
```

After 7 days: Add to pipeline that nurtures them toward the **next webinar**.

---

### For People Who Showed + Were Pitched (Didn't Book)

Separate sequence. Skip the replay intro — they already watched. Focus on the offer:

**Email — Day 1**
Subject: `About what [CREATOR NAME] shared at the end...`
Body:
```
Hey [FIRST NAME],

You made it to [WEBINAR NAME] — and you stayed all the way through to the end.

[CREATOR NAME] shared something important at the end about [PROGRAM NAME]. I wanted to follow up personally because I think you're exactly who this is built for.

[2-3 sentences about the program and who it's for.]

If you want to talk about whether it's a fit for your situation, you can book a quick call here: [BOOKING LINK]

No pressure. Just here if you want to explore it.

[SETTER NAME]
```

**SMS — Day 1**
```
Hey [FIRST NAME]! This is [SETTER NAME] from [CREATOR NAME]'s team.

I saw you made it to the webinar yesterday — awesome. Did you get a chance to look into [PROGRAM NAME]?

[BOOKING LINK] if you want to chat.
```

Follow with Close CRM outbound (setter calls + DMs) over 3–5 days.

---

## Phase 6: Call Funnel Retargeting

For everyone who engaged with webinar ads, registered, or showed — they go into a Meta retargeting audience and see call funnel ads.

### Campaign Setup (Meta)

**Campaign 1: Retargeting (ABO)**
- 2 adsets:
  1. Webinar engagement stack (people who engaged with webinar ads)
  2. Webinar registration stack (people who registered) — *keep budget conservative on this one to avoid fatiguing people who just signed up*

**Campaign 2: Warm Audience (ABO)**
- 1 adset: full warm audience stack (followers, email list, video viewers, past engagers)

**Optional Campaign 3: Cold Traffic Call Funnel**
- Same structure as cold webinar campaign (broad, lookalike, interest stack)
- Harder to crack than cold webinar — test carefully

### Call Funnel VSSL
Do NOT run a standard VSL. Use a **mini webinar**:
- Cut the intro and the pitch from the full webinar recording
- Keep: the tactical content, the transformation, the proof
- Length: 20–30 minutes (not 45–60)
- Add chapters if targeting a financially qualified / older demographic

### Call Funnel Page (Built in VS Code)
- Mini webinar embed at top
- Application (Typeform) below
- Testimonials
- FAQ

**Budget target:** $100 cost per booked call
**Budget split reference:** 30% of total ad spend

---

## Phase 7: Typeform Application + Lead Routing

### Typeform Setup
- Calendar (Calendly) integrated directly inside the Typeform — do NOT send them to a separate page after submission. Self-book rate target: 70–80%.
- Lead scoring questions:
  - Current revenue / income
  - Biggest challenge
  - Are they ready to invest in solving it
  - Budget range
  - Timeline

### Lead Scoring in Close CRM
Tag and route based on Typeform answers:

| Score | Criteria | Route to |
|---|---|---|
| **High Priority** | Applied + booked, strong fit answers | Top closers |
| **Mid Priority** | Applied, partial fit | Mid-tier closers |
| **Finance** | Applied, needs payment plan | Finance-specialist closers |
| **DQ** | Applied, disqualified | Setter for low-ticket downell call ($500–$1K offer) |

**Do NOT discard DQs.** At $3–4K/day in ad spend, if 60% of applications are DQs, converting even a fraction to a low-ticket offer materially cuts your ad spend.

Assign setters in pods:
- Pod 1: People who booked from webinar
- Pod 2: People who showed + didn't book
- Pod 3: No-shows / nurture leads
- Pod 4: Application leads

---

## Phase 8: Pre-Call Nurture

### Marketing Automations (ConvertKit + ManyChat)

**Immediate — Confirmation**
```
SMS: Hey [FIRST NAME]! You just booked a call with [CREATOR NAME]'s team for [DATE] at [TIME].

Here's your confirmation page with everything you need to prepare: [CONFIRMATION LINK]

[SETTER NAME] from the team 👋
```

**24 Hours Before**
```
SMS: Hey [FIRST NAME], just a reminder — your call with [CLOSER NAME] is tomorrow at [TIME].

They're looking forward to it. Make sure you've watched the pre-call video: [CONFIRMATION LINK]
```

**1 Hour Before**
```
SMS: You're on with [CLOSER NAME] in 1 hour, [FIRST NAME].

Dial-in link: [CALL LINK]

If anything changes, reply here and we'll reschedule.
```

**10 Minutes Before**
```
SMS: 10 minutes, [FIRST NAME]! [CLOSER NAME] is ready for you.

[CALL LINK]
```

**If No-Show:**
```
SMS: Hey [FIRST NAME] — we missed you on your call with [CLOSER NAME] today.

Totally get it if something came up. Want to reschedule? Here's a new link: [BOOKING LINK]
```

### Email Sequence (6–12 emails, send 2–3/day)
Focus is different from webinar emails — these are **selling them on why they should buy**, not just showing up.

Each email should cover one of:
- A specific student transformation story
- A common objection + reframe
- What happens if they do nothing (cost of inaction)
- What the program specifically does that nothing else does
- FAQ about the program

### Setter Outreach Protocol
1. **Immediate:** Setter calls the lead as soon as they book. Use Dialer/Alaware with local area code. Leave voicemail if no answer.
2. **Group Chat:** Setter creates a 3-person group chat (setter + closer + lead) on WhatsApp/iMessage. Closer sends a 15–30 second voice note introducing themselves.
3. **Personalized Resources:** Setter identifies lead's situation from Typeform answers and sends 1–2 specific testimonials that match their situation. NOT the generic thank you page — actual personalized content.
4. **Triage the lead:** Ask "What were you specifically hoping to accomplish on the call?" Get them talking before they even show up.

**Key:** Closer must respond in the group chat before the call. If the closer is unresponsive, the group chat will hurt show rate, not help it.

### Phone Number Hygiene
- Run all phone numbers through the free call registry every single week
- No setter makes more than 70 calls/day per phone number
- Prevents calls going to spam

---

## Phase 9: Metrics Benchmarks

Use these to diagnose where the funnel is leaking.

| Metric | Target |
|---|---|
| Cost per registrant | ~$10 (higher for financially qualified audiences) |
| Show rate (live webinar) | 30%+ |
| Retention to pitch | 80% |
| Book rate (of those who see pitch) | 25% |
| Booked call show rate | 80% (vs. 55–60% cold callunnel average) |
| Close rate | 30% |
| Self-book rate (Typeform) | 70–80% |
| Return on ad spend (webinar) | 5–6x |

---

## Notes + Edge Cases

- **Webinar platform TBD.** When selected, update this SOP with platform-specific drop-off tracking and Zapier integration instructions.
- **Instagram is primary traffic source.** ManyChat flows should be set up for Instagram DM automation (not just SMS). Every ad and organic post should have a ManyChat keyword trigger to capture leads into the webinar funnel.
- **Warm audience webinar (1x/month):** Use this to re-engage people who registered but didn't show, or showed but didn't book. This is your highest-converting webinar every month.
- **Low-ticket path:** Anyone who is a DQ from the high-ticket offer should be offered a $27/$47 product (same VIP guide from the thank you page, or a standalone resource). Setters handle this — not closers.
- **Do not run more than 4 webinars/month.** Going beyond this without a strong ops infrastructure leads to fatigue, lower show rates, and setter/closer burnout.
