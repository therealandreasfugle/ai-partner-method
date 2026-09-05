# Video 8: Deliver line 03, automated follow up to every lead

**Length:** 5 minutes. **Value on the proposal:** $1,200.
**Source:** `04-deliver/03-lead-followup`. **System:**
`tools/website-template/api/lead.mjs`.

Give this one an extra minute. It is the line item that earns the monthly fee.

---

## OPEN

**SAY THIS:**

> This is the most important thing you deliver and it is worth understanding why.
> Speed to lead decides who gets the job. A customer fills in three forms on three
> websites on a Tuesday night. Whoever replies first wins, and it is not close.

TALK ABOUT:
- Most local business websites show a thank you page and do nothing else. The
  customer believes they have made contact, so they stop calling around, and the
  business never hears about it.
- That is a lead thrown in the bin, and the owner never even knows it happened.

---

## SCREEN: what one form submission actually does

Show the four things happening, in parallel:

1. Emails the owner instantly, with reply-to set to the customer, so the owner
   just hits reply and they are talking.
2. Posts into their Slack channel.
3. Sends the customer an instant reply so they know a human is coming.
4. Logs it to a sheet.

TALK ABOUT:
- If every one of those fails, the visitor gets told plainly and given the phone
  number. It never shows a thank you page for a lead that nobody received.

---

## YOU MUST CUSTOMISE

Show the three variables on screen.

| Variable | Set it to |
|---|---|
| `RESEND_API_KEY` | Your Resend key |
| `LEAD_FROM` | A verified sender on **your** domain |
| `LEAD_TO` | **The client's** email |

---

## THE ONE THING

Put this on screen. It is the most expensive mistake in the whole repo.

**SAY THIS:**

> Lead to is theirs. Lead from is yours. Get those two the wrong way round and
> the client never hears about a single one of their own leads, and you will not
> find out for weeks, because from where you are sitting everything looks like it
> is working.

---

## CHECK IT

**SAY THIS:**

> Go to the live site and submit the form yourself, as if you were a customer, and
> watch the email land in their inbox. Do not read the code and assume. This is
> the one thing you genuinely cannot afford to get wrong.

---

## CLOSE

> Next, being found by people who do not know their name yet.
