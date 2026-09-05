# Video 11: Deliver line 06, the automatic review engine

**Length:** 4 minutes. **Value on the proposal:** $700.
**Source:** `04-deliver/06-reviews`. **System:** `tools/crm/api/_thankyou.js`,
`tools/crm/thanks.html`.

---

## OPEN

**SAY THIS:**

> A Google review asked for after every finished job, without the owner ever
> remembering to ask. This one is already wired up. You are switching it on, not
> building it.

---

## SCREEN: it is already wired

Mark a lead as Won in the CRM on camera and let the email fire.

TALK ABOUT:
- The moment a lead is marked Won, the thank you email goes out.
- It runs once per customer, so nobody ever gets it twice.
- It only fires after the save actually succeeds, so a customer never gets emailed
  about a job that did not save.

**SAY THIS:**

> It stays completely silent until you set three things. So if you look at it
> before you have set them and nothing happens, it is not broken, it is just not
> switched on.

---

## YOU MUST SET, per client

| Variable | What it is |
|---|---|
| `THANKYOU_URL` | Your deployed copy of the thank you page |
| `RESEND_API_KEY` | Your Resend key |
| `RESEND_FROM` | A verified sender |

Then edit the thank you page for that client and set the review URL to their own
Google review link.

---

## SCREEN: why the order on that page matters

Scroll the thank you page in order and name each block as you pass it: thank you
and the video, then the discount, then the review ask, then the referral.

---

## THE ONE THING

**SAY THIS:**

> The discount is given unconditionally. It is never conditional on them leaving a
> review. Paying for reviews, or making a reward depend on one, breaks Google's
> rules and can get your client's listing penalised. Give the discount either way,
> and ask for the review separately. It also works better, which is convenient.

---

## THE THING THAT GETS SKIPPED

**SAY THIS:**

> Get their Google review link during onboarding. It is the single most commonly
> missed field on the whole form, and this entire line item cannot run without it.
> If you leave it blank the button turns into a needs setup placeholder, which is
> safe but useless.

---

## CLOSE

> Next, something answering their visitors at eleven at night.
