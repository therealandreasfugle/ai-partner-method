# Build Interactive Lead Magnet (SOP)

> **Source:** Adapted from Ronin Socials' "AI Lead Magnet Builder" PDF (Nov 2026). The 4-prompt sequence that generates a complete interactive micro-tool + launch copy for any client. Pair with [manychat_follow_gate.md](./manychat_follow_gate.md) for distribution.
>
> **Purpose:** Replace dead PDF lead magnets with interactive Lovable/Bolt tools that deliver a personalized outcome in under 5 minutes and bridge directly to a paid offer.
>
> **When to use:** Any time a client needs a top-of-funnel lead magnet. Replaces all PDF/checklist/ebook lead magnets going forward.

---

## The Core Principles (Hormozi Principle)

A lead magnet has one job: **deliver a specific outcome to a specific person in under 5 minutes.** The output is the proof of expertise. If the free thing is this good, what would paying feel like? That gap is the sales machine.

Stop giving information. Start giving outcomes.

| Principle | Rule |
|---|---|
| Hyper-specific | Not "for business owners." Service businesses at a specific revenue level with a specific problem. Narrow beats broad. |
| Deliver fast | Under 5 minutes to value. Every extra minute of friction loses completions. |
| Bridge to paid | The result must make the user feel the gap between where they are and where they could be with help. That gap is the CTA moment. |
| Gate after value | Let them use the tool first. Capture email on the *results* screen — never before they see a partial result. |

**Tool types only:** calculators, scorecards, generators, diagnostic quizzes, analyzers, planners, graders.
**Banned:** PDFs, checklists, ebooks, "guides."

---

## Step 1 — Foundation (5 min, no prompt)

Before touching Claude, lock these three answers. Vague inputs produce vague outputs — be ruthlessly specific.

```
Specific audience:   [Not "business owners." e.g. "UK independent used car dealers doing £200k–£2M/year who can't source consistent stock"]
Their #1 urgent pain: [What keeps them up at night. e.g. "AutoTrader fees eating margins, can't find good stock at auction"]
Your paid offer:      [What this lead magnet sells toward. e.g. "Dealer Playbook £297 → £1,997 group mentorship"]
```

**North star sentence:** "I help [specific audience] solve [specific problem] through [your paid offer]."

This sentence drives every prompt below. If it's vague, restart.

---

## Step 2 — Generate 10 Ideas (Prompt 1 of 4)

Paste into Claude. Swap the bracketed placeholders for Step 1 answers.

```
You are a conversion strategist who builds micro-tools for [SPECIFIC AUDIENCE]
— not PDFs people download and forget, but interactive tools that hand someone
a real result in under 5 minutes.

My context:
- Niche: [YOUR NICHE]
- Target audience: [BE SPECIFIC — e.g. "HVAC companies doing $40k+/month who rely on referrals"]
- Their #1 problem: [WHAT KEEPS THEM UP AT NIGHT]
- My paid offer: [WHAT I SELL]

Generate 10 lead magnet ideas. Each one must:
1. Solve a single, specific problem my audience already knows they have
2. Deliver one concrete, usable result in under 5 minutes
3. Be describable in a single sentence
4. Make me look like the obvious person to hire for the bigger version of that problem
5. Open a natural door to my paid offer above

Format as a table with five columns:
| Tool Name | Problem It Solves | Exact Target User | Result They Walk Away With | Paid Offer It Feeds |

Format variety required — use a mix of: calculators, scorecards, generators,
diagnostic quizzes, analyzers, planners, graders.
No two ideas should solve the same underlying problem. No PDFs, no
checklists, no ebooks. Interactive tools only.

The bar for each idea: someone uses it, gets a real answer, and thinks
"I need more of wherever that came from."
```

---

## Step 3 — Score and Pick Winner (Prompt 2 of 4)

Same Claude conversation. It already has the 10 ideas in context.

```
You are a direct response specialist who has launched hundreds of lead magnets.
You know the difference between a tool that gets downloads and one that
generates clients.

From the 10 ideas above, score every single one across these six criteria
(each out of 10):

1. Pain Specificity — How urgent and specific is the problem it solves?
2. Speed to Value — How fast does the user get a useful result?
3. Curiosity Pull — Would someone stop scrolling to try this?
4. Ease of Use — Can a non-technical person complete it in under 5 minutes?
5. Perceived Value — Does this feel worth paying for?
6. Qualifier Strength — Does it attract buyers, not just browsers?

Show a complete scoring table for all 10 first. Then give me:

Top 3 Picks — for each one include:
- Why it wins: what specifically makes it stand out
- Best headline: a one-liner someone would DM a friend about
- Build it simple: the leanest possible version to ship first
- Watch out for: one execution risk to avoid

Final call: tell me which single one to build first and exactly why.
Remember: 200 downloads and 5 clients beats 10,000 downloads and no revenue.
```

**How to pick:** From the top 3, go with the one where all three are true — you're excited to build it, it connects directly to the paid offer, and you'd use it yourself. You can always build the others later.

---

## Step 4 — Lovable Build Spec (Prompt 3 of 4)

Same Claude conversation. Outputs a copy-paste-ready spec for Lovable / Bolt / Replit / Cursor.

```
You are a builder who turns lead magnet concepts into working apps using
Lovable, Bolt, or Replit — no code required.

Take my #1 ranked lead magnet idea from above and write a complete, copy-
paste-ready build specification I can paste directly into Lovable.

Output the prompt only. No explanation outside of it.

Structure the build prompt with these exact sections:

CORE FUNCTION
One sentence: what the tool does and the single result it delivers.

USER FLOW
List every screen in order. For each screen describe:
- What the user sees
- What action they take
- Where and how email capture is introduced (must appear after the user
  sees a partial result — never before)

INPUTS
A structured list of every input field. For each: field name, input type
(dropdown / text / slider / multiple choice), and example values.

OUTPUT
Exactly what the user receives: the result, how it is displayed, and what
makes it feel personalised to their specific inputs.

EMAIL GATE
Trigger: after the user completes all inputs and sees a blurred or partial
preview of their result.
Ask for: first name and email address only.
Message to display: "Your [result name] is ready — drop your email to
unlock it."

VISUAL DESIGN
Clean, modern, mobile-first. Maximum 5 input fields. One accent colour.
Progress bar if the flow is multi-step. The result screen must feel like a
real deliverable, not a form confirmation page.

CTA ON RESULTS SCREEN
A clear next step button: "Want this done for you?" — clicking it opens
[YOUR BOOKING LINK OR IG DM LINK].

Keep the build as minimal as possible. One input flow, one output. Working
prototype in under 30 minutes.
```

### QA Before You Go Live

- [ ] Works on mobile without horizontal scrolling
- [ ] Email gate comes after a partial result — not before any value
- [ ] 5 inputs or fewer — more friction means fewer completions
- [ ] The output feels genuinely personalised, not generic
- [ ] Your CTA tells them exactly who to contact and how

---

## Step 5 — Launch Copy (Prompt 4 of 4)

Same Claude conversation, once the tool is live.

```
My lead magnet tool is now live. Write three pieces of launch content to
drive traffic to it.

1. HOOK POST (Instagram or LinkedIn)
   - Open with a bold claim or a pattern-interrupt stat relevant to my
     audience
   - Name the specific problem the tool solves in one line
   - Show the outcome they get in under 5 minutes
   - End with: "Comment [YOUR KEYWORD] and I'll send it to you"
   - Tone: direct, confident, no hype, no filler

2. SHORT VIDEO SCRIPT (15–30 seconds)
   - Hook in the first 2 seconds — something that stops mid-scroll
   - Show or describe the tool being used and the result appearing
   - Close with: "Comment [YOUR KEYWORD] below and I'll send it straight
     to your DMs"

3. BIO LINK DESCRIPTION (20 words or fewer)
   - What the tool does, what they get, and what action to take

Use my handle [@YOURHANDLE] where relevant.
Tone across all three: expert who delivers results, not a marketer running
a promo.
```

**Pin the post immediately.** It keeps collecting comments and triggering the ManyChat flow for weeks — one post, compounding followers and leads.

---

## Build Stack (Pick One)

| Tool | Use When |
|---|---|
| [lovable.dev](https://lovable.dev) | Default — fastest path, AI-native, supports Claude/OpenAI API calls natively |
| [bolt.new](https://bolt.new) | Backup if Lovable is down |
| [replit.com](https://replit.com) | If you need a backend or database |
| [cursor.sh](https://cursor.sh) | If you want local control + Claude Code |

Lovable is the default unless there's a reason not to.

---

## File Structure for Each Client Build

When you run this SOP for a client, save the output as:
`directives/clients/{client_name}_lead_magnet.md`

That file should contain:
1. Foundation (audience + pain + offer + north star — filled in)
2. The 10 ideas table
3. Scoring table + chosen winner + rationale
4. Lovable build spec (copy-paste-ready)
5. Launch copy (hook post + reel script + bio link)

---

## Distribution

Every interactive lead magnet ships with a ManyChat comment-trigger flow that uses a 3x follow-gate so the lead magnet doubles as a follower growth engine. See [manychat_follow_gate.md](./manychat_follow_gate.md).

---

## Why This Beats PDFs (Memo to Self)

PDFs deliver information. Interactive tools deliver outcomes. The user's inputs ARE the personalization — they get a result that feels custom because it literally is. That's how "hyper-personalized" lead magnets actually work. No PDF can do this.

The bar: someone uses the tool, gets a real answer, and thinks "I need more of wherever that came from." If the tool doesn't trigger that thought, restart from Step 2.
