# Subject Lines

The single biggest lever after expectation and sender recognition. Get this right and the rest of the email gets a chance.

---

## The non-negotiable rules

| Rule                          | Why                                                      |
|-------------------------------|----------------------------------------------------------|
| **6–10 words**                | Highest open rate. Fewer = ignored. More = truncated.    |
| **60 characters max**         | Mobile inbox cutoff.                                     |
| **Lowercase often beats Title Case** | Looks personal, not promotional.                  |
| **Max 3 punctuation marks**   | More feels desperate / spammy.                           |
| **Max 1 emoji** (usually 0)   | More than one = filtered to Promotions.                  |
| **No spam triggers**          | Full list below — these send you to spam regardless.     |
| **Personalize when you can**  | First name in subject = ~26% higher open rate.           |

---

## The three working models

Most subject lines fit one of these. Pick based on the email's job.

### 1. Curiosity model

**Pattern:** *"[Timeframe] to [specific outcome]"*

**Examples:**
- *"3 days to your next promotion"*
- *"15 minutes from now you'll know if this works"*
- *"Tomorrow morning, before your coffee"*

**Use when:** the email body delivers a clear payoff. If the body doesn't deliver, this becomes clickbait and burns trust fast.

### 2. Benefit model

**Pattern:** *"[Specific result] without [common obstacle]"*

**Examples:**
- *"Double your sales without hiring"*
- *"Lose 15 lbs without giving up bread"*
- *"Book 10 calls/week without paid ads"*

**Use when:** you have a concrete, specific result and a known objection to remove.

### 3. Urgency model

**Pattern:** *"[Deadline] — [consequence]"*

**Examples:**
- *"By Friday — or miss 50% off"*
- *"3 spots left this month"*
- *"Doors close Sunday at midnight"*

**Use when:** the urgency is real. Fake urgency works once, then your list never trusts you again. Don't say "doors close" if doors don't actually close.

---

## Subject line by sequence type

What works empirically for each sequence in `templates/`:

| Sequence              | Best-performing subject pattern                              | Example                                            |
|-----------------------|--------------------------------------------------------------|----------------------------------------------------|
| Pre-call confirmation | `[Name], you're confirmed for [Day]`                         | `Mike, you're confirmed for Thursday`              |
| Pre-call social proof | `[Specific result] — [Client]'s story`                       | `From 0 to 12 clients — Sarah's story`             |
| Pre-call value-add    | `Before your call`                                           | `Before your call tomorrow`                        |
| Pre-call reminder     | `Re: your call`                                              | `Re: your 2pm`                                     |
| Post-call closed      | `Welcome to [Program]`                                       | `Welcome to Apex Method`                           |
| Post-call not closed  | `Thanks for your time today, [Name]`                         | `Thanks for your time today, Mike`                 |
| No-show — immediate   | `We missed you`                                              | `We missed you at 2pm`                             |
| No-show — final       | `Last chance to [outcome]`                                   | `Last chance to grab a spot`                       |
| Welcome day 1         | `Hey`                                                        | `Hey` (literal — high open rates from curiosity)   |
| Welcome day 2         | `How [Name] made $Xk/mo after [timeframe]`                   | `How Sarah made $11k/mo after 90 days`             |
| Welcome day 3         | `Re: your call`                                              | `Re: your call` (even if no call yet — works)      |
| HT booked-call #1     | `Your [Program] call is locked in`                           | `Your Apex Method call is locked in`               |
| HT booked-call #2     | `What separates the top 1%`                                  | `What separates the top 1% of coaches`             |
| HT booked-call #3     | `Exactly how [Program] works`                                | `Exactly how Apex Method works`                    |
| HT booked-call #4     | `[X] spots left this month`                                  | `3 spots left this month`                          |
| Marketing — case study| `What would [result] do for you?`                            | `What would $11k/mo do for you?`                   |
| Marketing — objection | `It's time to fire these b*stards`                           | (verbatim — high CTR for the right audience)       |
| Marketing — social proof | `Fwd: $[Amount] in [Timeframe]`                           | `Fwd: $11k in 90 days`                             |

---

## Spam-trigger words — never use in subject lines

Including any of these will likely send you to Promotions or Spam tab regardless of how good the rest of the email is:

```
100% free          Big bucks         Cash bonus         Clearance
Click here         Credit card       Deal               Dear friend
Discount           Double your       Earn extra cash    Eliminate debt
Fast cash          Financial freedom Free access        Free gift
Free money         Free trial        Get paid           Get rich
Guaranteed         Income            Increase sales     Limited time
Lower rates        Make money        Million dollars    Miracle
Money back         Money making      No catch           No credit check
No fees            No purchase       Now only           Opportunity
Order now          Prize             Pure profit        Risk-free
Save big           Save big money    Special offer      Special promotion
Trial              Urgent            What are you waiting for
Why pay more       Winner            You have been selected
```

This list isn't exhaustive — it's the worst offenders. When in doubt, run your subject through a deliverability checker like Mail-Tester before sending.

---

## Subject lines that consistently underperform

Avoid these patterns even though they look "professional":

| Pattern                            | Why it fails                                              |
|------------------------------------|-----------------------------------------------------------|
| `Newsletter — January 2026`        | Generic. Tells the reader "skip me."                       |
| `Important update from [company]`  | Self-important. No benefit, no curiosity.                  |
| `🚀🚀🚀 New offer 🚀🚀🚀`             | Filtered to Promotions before a human sees it.            |
| `READ THIS BEFORE [DEADLINE]`       | All caps + urgency = spam filter trigger + reader irritation. |
| `Hi`                               | Indistinguishable from real personal mail. *Some* ESPs flag, but more importantly: the body usually doesn't deliver, which trains readers to ignore future "Hi" subjects from you. |

Note: `Hey` (3-letter, lowercase) tested as a working subject line — see Welcome Day 1 above. The difference is the **expected context**: if a subscriber knows the welcome sequence opens with `Hey`, it works. If you randomly send `Hey` to a cold list, it doesn't.

---

## Personalization — what actually works

| Token                          | Lift                | Notes                                                |
|--------------------------------|---------------------|------------------------------------------------------|
| `{{first_name}}` in subject    | ~26% higher opens   | Position at the start: *"Mike, you're confirmed."*   |
| `{{first_name}}` in body only  | ~5% higher          | Less impact than subject — but still positive.       |
| Location reference             | ~20% higher opens   | *"Coaches in Austin"* if you have geo data.          |
| Lead source / behavior         | Highest             | *"You watched the Q2 webinar — here's the follow-up."* |

**Don't** personalize for the sake of personalizing. *"Mike, you won't believe this!"* feels like a fake intimacy and underperforms a clean *"You won't believe this."* Pair personalization with **context**: it should feel earned.

---

## Length tested across 1M+ emails

| Length         | Relative open rate vs. average |
|----------------|--------------------------------|
| 1–5 words      | -8%                            |
| **6–10 words** | **+12%**                       |
| 11–15 words    | -3%                            |
| 16+ words      | -19% (truncated on mobile)     |

The 6–10 word sweet spot is consistent across consumer and B2B lists. Stick to it unless you have a specific reason not to.

---

## Subject line generation workflow

When writing a sequence, do subjects **last**, not first.

1. Write the body.
2. Read the body. Identify the single most compelling line or idea.
3. Write 5 subject line variants based on that line, using one of the 3 models above.
4. Cut to the strongest one.
5. Run it through this list:
   - 6–10 words?
   - No spam triggers?
   - ≤60 characters?
   - Personalized if appropriate?
   - Curious / benefit-driven / urgent (one of the three)?
6. Send.
