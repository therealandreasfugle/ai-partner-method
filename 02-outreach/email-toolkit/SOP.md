# SOP — Email Copywriting

The deep reference. Day-to-day workflow is in [ONBOARDING.md](ONBOARDING.md). For framework details see [frameworks.md](frameworks.md). For subject line rules see [subject-lines.md](subject-lines.md).

---

## Table of contents

1. [Why people open emails](#why-people-open)
2. [Segmentation — the multiplier](#segmentation)
3. [Timing — when to send](#timing)
4. [Email structure](#structure)
5. [Sequence types](#sequence-types)
6. [Credibility & deliverability](#credibility)
7. [ESP best practices](#esp)
8. [Quality checklist](#checklist)
9. [Engagement tactics](#engagement)

---

## Why people open <a name="why-people-open"></a>

Ranked by importance, based on direct-response data:

1. **They expected it.** They opted in, they know who you are, they're waiting.
2. **Known sender.** Brand or person they recognize.
3. **Subject line.** *Third*, not first.
4. **Preview text.** Compounds with the subject.
5. **The offer itself.** Last.

**Strategic implication:** the highest-leverage move isn't writing better subject lines — it's making your emails **expected**. That happens at the opt-in moment (clear promise + cadence + immediate first email) and through consistency.

---

## Segmentation <a name="segmentation"></a>

The single biggest revenue multiplier in email. Same list, segmented well, can pull 4–6x revenue versus a generic broadcast.

### 15 ways to segment

1. **Demographic** — age, income, job title.
2. **Geographic** — location, weather, local events.
3. **Behavioral** — clicks, purchases, page views.
4. **Engagement** — active opener vs skimmer.
5. **Past purchases** — recommend related products.
6. **Journey stage** — newbies → 101; veterans → advanced offers.
7. **Loyalty level** — VIPs get exclusive deals.
8. **Abandoned cart** — different sequence than browsers.
9. **Email cadence preference** — daily, weekly, monthly.
10. **Lead magnet** — segment by what they downloaded.
11. **Survey responses** — tailor by stated need.
12. **Membership tier** — different content for free vs paid.
13. **Seasonal** — right offer at the right time of year.
14. **Event attendance** — webinar attendees, ad clickers, etc.
15. **Device** — mobile vs desktop optimization.

### Implementation

- Use **tags** in the ESP to mark segment membership.
- Every lead form should ask **at least one** segmentation question. Even a newsletter opt-in.
- Tag aggressively at first; you can always merge tags later, but you can't backfill data you didn't collect.

---

## Timing <a name="timing"></a>

### Best time of day

- **Winner: 3 pm in the recipient's timezone.**
- Acceptable window: noon–6 pm.
- Worst: 9 pm–11 am.
- Exception: **order/transactional emails** are best in the morning.

### Best days of the week

- **Tuesday and Friday** — 9% higher open rates than the average.
- Monday and Wednesday: acceptable.
- Thursday: lags.
- **Saturday and Sunday: worst** open rates for sales emails.

### Application

- **Sales sequences:** Tuesday and Friday at 3 pm local.
- **Content / newsletter:** weekends are fine — readers have time, expectations are different.
- **Pre-call reminders:** ignore the timing rules; send by trigger (24h before, 2h before, etc.).

---

## Email structure <a name="structure"></a>

### Paragraph rules

- **Max 3 sentences per paragraph.**
- **Max 4 lines per paragraph on mobile** (assume narrow screens).
- Use single-sentence paragraphs for emphasis. They land harder.
- Subhead every 150–200 words.

### Bold rules

- Bold key benefits, deadlines, or specific numbers.
- **Max 10% of body text bolded.** More than that and the eye stops registering bold = important.

### CTA rules

- **One CTA per email.** Period.
- Button + text link to the *same* destination is fine.
- Two CTAs to two destinations splits attention and crashes conversions.
- CTA text should be action-oriented: *"Book my call"*, *"Reserve my seat"*, *"Get instant access"*. Never *"Submit"* or *"Learn more"*.

### Mobile

- 60%+ of emails are opened on mobile. Design for it.
- Tappable CTA buttons — minimum 44px tall, finger-sized.
- Preview text optimized — it shows after the subject in inboxes.

---

## Sequence types <a name="sequence-types"></a>

Each of these has a ready template in `templates/`. Use them.

### Pre-call sequence (4 emails)

**Goal:** warm up booked leads so they show up + are primed to buy.

| # | Send                | Purpose             | Template file                            |
|---|---------------------|---------------------|------------------------------------------|
| 1 | Immediately         | Confirmation        | `templates/pre_call_sequence.md` (#1)    |
| 2 | 24h before          | Social proof        | `templates/pre_call_sequence.md` (#2)    |
| 3 | 12h before          | Value add / educate | `templates/pre_call_sequence.md` (#3)    |
| 4 | 2h before           | Final reminder      | `templates/pre_call_sequence.md` (#4)    |

### Post-call: closed (2 emails)

**Goal:** onboard new clients smoothly so they don't refund.

| # | Send       | Purpose            | Template file                               |
|---|------------|--------------------|---------------------------------------------|
| 1 | Immediately | Welcome           | `templates/post_call_closed.md` (#1)        |
| 2 | Day 1       | Onboarding & access | `templates/post_call_closed.md` (#2)      |

### Post-call: not closed (3 emails)

**Goal:** handle objections and re-engage on-the-fence prospects.

| # | Send     | Purpose             | Template file                                  |
|---|----------|---------------------|------------------------------------------------|
| 1 | Same day | Recap + thanks      | `templates/post_call_not_closed.md` (#1)       |
| 2 | Day 2    | Objection handling  | `templates/post_call_not_closed.md` (#2)       |
| 3 | Day 5    | Final offer         | `templates/post_call_not_closed.md` (#3)       |

### No-show recovery (3 emails)

**Goal:** reschedule the missed appointment.

| # | Send       | Purpose          | Template file                          |
|---|------------|------------------|----------------------------------------|
| 1 | Immediately | "We missed you" | `templates/no_show_recovery.md` (#1)   |
| 2 | Day 2       | Value add       | `templates/no_show_recovery.md` (#2)   |
| 3 | Day 5       | Final attempt   | `templates/no_show_recovery.md` (#3)   |

### Welcome sequence (3 emails)

**Goal:** introduce the brand and move them to the first action.

| # | Send  | Purpose          | Template file                          |
|---|-------|------------------|----------------------------------------|
| 1 | Day 1 | Hey / introduction | `templates/welcome_sequence.md` (#1) |
| 2 | Day 2 | Success story    | `templates/welcome_sequence.md` (#2)   |
| 3 | Day 3 | Direct ask       | `templates/welcome_sequence.md` (#3)   |

### Booked-call high-ticket (4 emails)

**Goal:** reinforce the call commitment for $5k+ programs.

| # | Send         | Purpose                 | Template file                                  |
|---|--------------|-------------------------|------------------------------------------------|
| 1 | Immediately  | Confirmation + framing  | `templates/booked_call_high_ticket.md` (#1)    |
| 2 | 24h before   | Value education         | `templates/booked_call_high_ticket.md` (#2)    |
| 3 | Pre-call     | How program works       | `templates/booked_call_high_ticket.md` (#3)    |
| 4 | Day of call  | Urgency / scarcity      | `templates/booked_call_high_ticket.md` (#4)    |

### One-off marketing emails

For broadcast / newsletter / promotional sends. Templates in `templates/marketing_email_swipes.md`:

- **Structure email** — problem → solution.
- **Case study email** — client result, single CTA.
- **Objection handling email** — address the #1 reason they haven't bought.
- **Social proof email** — numbers + testimonial.

---

## Credibility & deliverability <a name="credibility"></a>

### The "keep it simple and remind them" email

Send right after lead form submission, or before any scheduled call:

- Screenshot of the ad they responded to.
- Screenshot of the sales page or lead form.
- Their submitted application data, repeated back.
- Links to where they originated.

Result: dramatically increases trust and call show rates. They feel known.

### Always-include credibility assets

- Third-party verified testimonials (TrustPilot, real video, screenshots).
- Real company name, real address, real phone.
- Team photos (real people, not stock).
- Links to active social channels.
- Specific numbers, not vague claims.

### Deliverability principles

- Authenticate your domain (SPF, DKIM, DMARC). Without this, you go to spam regardless of copy quality.
- Warm up new sending domains gradually — start with engaged subscribers, scale up.
- Match the **From name** to what subscribers expect. Switching from "Mike from Apex" to "Apex Performance" mid-list will tank opens.

---

## ESP best practices <a name="esp"></a>

What every email service provider rewards:

- **Deliverability proof:** consistent opens and clicks tell their algorithms you're wanted.
- **Quality > quantity:** sending less to engaged people beats blasting the whole list.
- **Engagement:** opens, clicks, replies all count.
- **Authenticity:** clear sender identity, easy unsubscribe, real reply-to.
- **Consistency:** regular sending pattern teaches algorithms to deliver.
- **List hygiene:**
  - Remove subscribers with 90+ days no opens.
  - Correct misspelled addresses on signup.
  - Manage bounce rate aggressively (over 2% = problem).
  - Run re-engagement campaigns before mass-unsubscribing.

---

## Quality checklist <a name="checklist"></a>

Run before every send. Don't skip.

- [ ] Subject line is 6–10 words.
- [ ] Subject line contains no spam-trigger words (check `subject-lines.md`).
- [ ] Preview text is optimized (not auto-pulled from body).
- [ ] Personalization token (e.g. `{{first_name}}`) is in the first 1–2 lines.
- [ ] Every paragraph is ≤3 sentences.
- [ ] No paragraph is more than 4 lines on mobile.
- [ ] Bold text is ≤10% of body.
- [ ] **One** CTA. Not two.
- [ ] CTA text is action-oriented (not "submit" or "click here").
- [ ] At least one credibility element (real testimonial, specific number, named client, link to proof).
- [ ] Send time scheduled for 3 pm recipient's timezone (or appropriate trigger).
- [ ] Day of week is Tuesday or Friday for sales (skip if trigger-based).
- [ ] Read out loud — sounds like the client, not generic AI.
- [ ] No fabricated results or testimonials. All proof points are real or marked `[INSERT REAL TESTIMONIAL]`.
- [ ] All links tested. Calendar link goes to the right calendar; sales page URL is live.
- [ ] Unsubscribe link present and working.

---

## Engagement tactics <a name="engagement"></a>

### The "sent from iPhone" trick

A short email that looks like the sender typed it on their phone in 30 seconds.

**Format:**
- 2–3 sentences.
- No formatting, no images, no buttons.
- Lowercase first letters okay.
- "Sent from my iPhone" signature.

**Why it works:**
- Feels personal and authentic.
- Low barrier to reply.
- Often hits a 50%+ open rate compared to formatted broadcasts.

Use for: re-engagement, asking a question, breaking through a slow week.

### The "fwd:" subject line

Subject: `Fwd: $12k month for [Client]`

Pretends to be a forward of an internal email. High open rates. **Use sparingly** — works once or twice per quarter, not weekly. Burns trust if overused.

### Engagement bait — what to avoid

- "RE:" prefixes when there's no actual reply context.
- Emoji rows.
- ALL CAPS shouting.
- Fake urgency ("only 3 hours left!" then sending the same email next week).

These all work *once*, then burn the list. The toolkit's templates are built for long-term sender reputation, not one-time tricks.

---

## Nurture deposit framework

For programs with deposit → full payment structures (high-ticket coaching, courses):

**Goal:** prevent dropouts during the deposit period by making them feel "already in."

### Phase 1 — Deposit call positioning

> *"This deposit isn't just holding your spot — it's unlocking access to what's already working."*

### Phase 2 — Immediate post-deposit (within 1 hour)

Give access to:
- All bootcamp / intro videos.
- Community thread or private chat.
- Personalized roadmap based on stated goals.

### Phase 3 — Midway through deposit period

Send 2–3 case studies with the framing: *"Some recent wins from students ^"*. Builds momentum and FOMO.

### Phase 4 — Payment closing

> *"You've already started building momentum — let's lock in the full program."*

Reduces dropouts because they don't feel like they're "deciding again" — they feel like they're continuing.

---

## Common mistakes to avoid

| Mistake                                        | Why it hurts                                            |
|------------------------------------------------|---------------------------------------------------------|
| Multiple CTAs per email                        | Splits attention. Conversions drop ~50%.                |
| Generic broadcast to whole list                | 4–6x lower revenue than segmented sends.                |
| Subject line written before body               | Body should drive subject, not the reverse.             |
| No personalization token                       | Subscribers feel like they're on a list, not in a 1:1.  |
| Sending Saturday or Sunday                     | Worst open rates of the week.                           |
| 7-paragraph block of text                      | Mobile users bounce.                                    |
| Spam-trigger words in subject                  | Promotions tab = invisible.                             |
| Fabricated testimonials                        | One detection = full list trust collapse.               |
| "RE:" / "Fwd:" overuse                         | Burns the trick for everyone.                           |
| Switching sender names                         | Confuses ESP algorithms, kills opens.                   |
