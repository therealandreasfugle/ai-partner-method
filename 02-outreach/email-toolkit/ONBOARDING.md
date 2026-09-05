# Onboarding — How to think about email

Five minutes here saves you a hundred hours of writing emails that don't get opened.

---

## The biggest myth in email copy

> *"If I just write a clever enough subject line, my opens will go up."*

Wrong. The #1 reason people open emails is **expectation** — they opted in, they know who you are, they're waiting to hear from you. Subject lines are *third* on the list, behind expectation and sender recognition.

Translation: spend less time agonizing over subject lines, and more time on the things that actually move the needle:

1. **Get them to expect your emails** (welcome sequence, intro promise, regular cadence).
2. **Become a recognized sender** (consistent name, consistent voice, consistent value).
3. *Then* worry about subject lines.

---

## Context = More money

The single most important concept in modern email copy:

> The more you know about a subscriber, the more tailored your email — and the more revenue per email.

A generic broadcast email to 10,000 people pulls maybe a 2% click. The same email **segmented** by what they bought, where they live, what they're interested in — pulls 8–12%. Same list. Same effort. 4–6x revenue.

This is why the brief you fill out (`examples/brief.example.json`) asks about audience, segment, and trigger. Skipping those = leaving money on the table.

---

## The mental model: three layers

Same pattern as the funnel builder. Once you see it, you can't unsee it.

| Layer        | What it is                                       | Touch how often            |
|--------------|--------------------------------------------------|----------------------------|
| **Frameworks** | The structural patterns (PAS, AIDA, BAB, Email Matrix). | Rarely — these don't change. |
| **Templates**  | Sequence skeletons (4-email pre-call, 3-email no-show, etc.). | Per project — pick the right one. |
| **Brief**      | This client, this audience, this offer, right now. | Every email job.          |

99% of your work is at the **brief** layer. The frameworks and templates do the heavy lifting.

---

## Your first sequence — the actual workflow

1. **Pick the sequence type.** Look in `templates/` and pick the one that matches your goal:
   - Booked a call → `pre_call_sequence.md`
   - Subscribed but didn't buy yet → `welcome_sequence.md`
   - Was on a call, didn't close → `post_call_not_closed.md`
   - Booked but didn't show → `no_show_recovery.md`

2. **Fill out the brief.**
   ```bash
   cp examples/brief.example.json my-brief.json
   ```
   Open it. Replace every field with your actual client info. Be specific — *"fitness coaches who target busy professionals"* beats *"fitness coaches"*.

3. **Generate the sequence.** In Claude Code:
   > *"Write me a pre-call sequence using my-brief.json."*

   Claude reads the brief, follows the SOP, and writes 4 emails using the framework. Don't have Claude Code? Copy the template manually and replace `[bracketed]` placeholders.

4. **Edit for voice.** AI gets you 80% there in 30 seconds. The last 20% is making it sound like *your client*, not a generic guru. Read every line out loud — if it sounds like a robot, rewrite it shorter.

5. **Run the QA checklist.** Open `SOP.md` → "Quality Checklist" — make sure every email passes before you load it into the ESP.

6. **Send at the right time.** 3pm in the recipient's timezone. Tuesday or Friday for sales. Saturday/Sunday is the worst.

---

## The four core frameworks (quick reference)

You'll use these in 95% of emails.

| Framework | When to use                                       | Structure                                       |
|-----------|---------------------------------------------------|-------------------------------------------------|
| **PAS**   | They're already aware of the pain                 | **P**roblem → **A**gitate → **S**olution        |
| **AIDA**  | Cold audience needs to be hooked                  | **A**ttention → **I**nterest → **D**esire → **A**ction |
| **BAB**   | Selling a transformation                          | **B**efore → **A**fter → **B**ridge             |
| **Matrix**| You have segmentation data                        | Tailor copy by segment, not by guess            |

Full breakdown in `frameworks.md`.

---

## Subject lines — the 80/20

You'll get most of the value just from these rules:

- **6–10 words.** Fewer = ignored. More = truncated on mobile.
- **Lowercase often outperforms Title Case** (looks personal).
- **Personalization beats cleverness.** *"Mike, your call is locked in"* > *"Lock it in or lose it!"*
- **Avoid spam triggers** — full list in `subject-lines.md`. Words like "FREE", "GUARANTEED", "URGENT" send you straight to Promotions tab.
- **Max 1 emoji.** Usually zero.

When in doubt: write the subject line *after* the email is done. The body tells you what the subject should be.

---

## What's next

- [`SETUP.md`](SETUP.md) — get Claude Code installed.
- [`SOP.md`](SOP.md) — the deep reference. Read it once, refer back forever.
- [`frameworks.md`](frameworks.md) — when to use which structure.
- [`templates/`](templates/) — pick a sequence and start writing.

The fastest way to learn this is to ship one sequence. Pick the easiest scenario you have right now and go.
