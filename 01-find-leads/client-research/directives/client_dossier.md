# Client Dossier — Directive

This is the instruction set Claude follows when building a market research dossier on a creator.

> **Note for the agent reading this:** Don't skim. Read this whole file before you touch anything. This is the template AND the rules. The output is judged against both.

---

## Goal

Produce a complete, evidence-backed market research dossier on any creator (Instagram + YouTube) that answers:

1. **Who is this creator and who follows them?**
2. **What does their audience actually want?** (in their own words)
3. **What are they currently selling, and what's missing?**
4. **What should they sell next, and how should it be marketed?**

The output is a single markdown file at `./dossiers/<handle>/dossier.md` with 13 sections.

---

## Inputs (what you have to work with)

After the scrapers run, you'll have:

- `./dossiers/<handle>/youtube.json` — channel info, last ~20 videos, top videos with transcripts + top comments
- `./dossiers/<handle>/instagram.json` — profile, last ~20 posts, captions, likes, comments, transcripts of top reels

You should also:

- **Visit their bio link / LinkTree** (the URL is in `instagram.json` under `profile.external_url`). Note every product, free thing, affiliate link.
- **Visit any sales page** they have. Note pricing, structure, what's promised, what's missing.
- **Note their affiliate brands** (prop firms, software, supplements, courses they push) — this reveals their revenue model.
- **Note their collab network** — who they appear with regularly. Often reveals niche positioning and warm-intro paths.

---

## The 13 sections (use these exact headings)

Write the dossier in this order with these exact `##` headings.

### 1. The Numbers at a Glance

Quick stats table. Pull from the scrape data.

- Followers per platform
- Verified status
- Average engagement rate on recent posts (likes + comments / followers)
- Top post by views
- Posting cadence (posts per week)

### 2. Who Is [Creator Name]

Short paragraph (4-6 sentences): age (if known), location (if known), backstory, signature angle, what they're known for.

**Source everything.** If you can't verify their age from public content, say "age not publicly stated." Do not guess.

### 3. What Their Content Is Actually About

Three sub-sections:

**Top performing posts/videos** — list top 5 with one-line analysis of why each won.

**Recurring themes** — 3-5 themes they hit repeatedly, with example post titles.

**Format mix** — % breakdown: talking head / B-roll / POV / vlog / interview / other.

**Language & tone** — how they speak. Use 3-4 direct quotes from their captions or transcripts.

### 4. Who Their Audience Is

**Demographics** — pull from comments and visible context (age, gender skew, geography, likely income bracket). Mark inferred fields as such.

**Psychographic profile** — what they believe, what they fear, what they aspire to, how they want to be seen.

### 5. Pain Points

What the audience hurts about, **in their own words**. Pull 5-8 direct quotes from comments on top posts. Cluster them into 3-4 pain themes.

This section is the heart of the dossier. Do not invent pains. The comments tell you everything.

### 6. Dream State

What the audience secretly wants. Again, pull from comments — but also from the engagement pattern (what kind of post gets the most "this is the dream" / aspirational replies).

3-4 dream-state themes with quotes.

### 7. What They Already Sell

Layered breakdown of their current funnel:

- **Free** (lead magnets, free Discord/Telegram, free training)
- **Mid-ticket** (anything $50-$500: ebooks, courses, communities)
- **High-ticket** (anything $500+: mentorship, 1:1, masterminds)
- **Affiliate / passive** (brands they push, prop firms, software referrals)

Include pricing where visible. Mark "pricing not publicly visible" otherwise.

### 8. Monetisation Gap Analysis

Where the funnel is broken or thin:

- Is there a missing middle tier?
- Is the offer mismatched to the audience's stated pain?
- Is the high-ticket overpriced for the audience income bracket?
- Are they leaving affiliate revenue on the table?
- Is there a clear ascension path or is it a flat menu?

Be specific. "The funnel has a missing middle" is weak. "There's nothing between a free 8-week Discord and a $5k mentorship — a $297 self-paced ebook would convert the 60% of comments asking 'how do I start without spending thousands'" is the right level.

### 9. Offer Recommendations

2-3 distinct angles for a new offer. For each:

- One-line summary
- Why it fits the audience (cite a pain/dream point from sections 5-6)
- Format (ebook / course / coaching / SaaS / community)
- Price point with reasoning
- Risk / why it might not work

End with **"Which to lead with"** and a one-paragraph recommendation.

### 10. Ascension Funnel Design

Concrete funnel proposal:

- **Lead magnet** (what + why)
- **Tripwire** ($7-$47)
- **Core offer** ($97-$497)
- **High-ticket** ($1k+)
- **Continuity** (subscription, community, or rev share)

Walk through how a buyer flows from one to the next.

### 11. Messaging Rules

What language to use and avoid when writing copy for this audience:

- **Use** — 5 words/phrases that resonate (pull from comments)
- **Avoid** — 5 words/phrases that will repel them (jargon, condescension, market-mismatched terms)
- **Tone** — formal / casual / aggressive / soft / etc., with a 1-sentence justification

### 12. Watch Outs / Risks

- Fragility: any platform-dependence, ban risk, controversy risk
- Audience mismatch risks: where you might be tempted to position something that won't land
- Pricing risk: signs the audience can't actually afford your top recommendation
- Reputation risk: anything in their history that makes a partnership awkward

### 13. One-Page Summary

The dossier in 5 bullets:

- Who: [one line]
- Audience: [one line]
- Biggest pain: [one line]
- Biggest opportunity: [one line]
- Recommended next move: [one line]

---

## Hard rules

1. **No fabrication.** Every concrete claim (age, location, revenue, client story, audience income bracket) must trace to scraped content or visible public info. If you can't source it, mark as "inferred" or omit.

2. **Audience language comes from comments.** Don't write what you think their audience says. Quote them.

3. **Flag uncertainty.** Use "appears to," "based on comment data," "pricing not publicly visible." Better to be honestly uncertain than confidently wrong.

4. **No client-specific frameworks** unless you're inside one. This template is universal — don't bake in industry-specific assumptions.

5. **One file out.** Don't sprawl across 10 markdown files. One `dossier.md`, 13 sections, no more.

6. **Keep raw data local.** The `dossiers/` directory is gitignored. Never commit it. Never share it without the client's permission.

---

## Tips for the synthesis step

- **Read comments before you write anything.** That's where the audience lives. Pull a list of 20-30 of the highest-engagement comments across both platforms before you start drafting.
- **Look at low-performing posts too.** Sometimes the gap is more obvious in what doesn't land than in what does.
- **Triangulate.** If a pain shows up in both IG and YouTube comments, it's real. If it only shows up once, it might be noise.
- **Be useful, not flattering.** The dossier is a tool for action, not a tribute. If the creator's funnel is broken, say so plainly.
