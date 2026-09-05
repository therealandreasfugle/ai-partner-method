# Video 3: Find leads worth calling

**Length:** 10 minutes. **Source:** `01-find-leads`, `tools/lead-scraper`.
**Goal:** they run a real scrape on camera with you and end with leads in their
CRM.

Run this live. A recorded scrape that actually returns businesses is worth more
than any explanation of how the scraper works.

---

## OPEN

**SAY THIS:**

> Before you email anybody, you need a list worth emailing. This is about ten
> minutes and it costs you pennies. And the trade you pick matters more than
> anything else you do today, so we start there.

---

## SCREEN: the trade table in `01-find-leads/README.md`

Put it on screen. This is the highest value thirty seconds in the video.

TALK ABOUT, straight off the table:
- Plumbers are the best. About half of them list an email, and nearly a third
  have no website or a weak one.
- Electricians are second.
- Dentists, lawyers and accountants: avoid. Every single one in the sample already
  had a decent site. They have agencies already.
- Barbers and nail salons: avoid. Only about eight percent list an email, so you
  have nothing to send to.

**SAY THIS:**

> That is measured across two hundred and twenty four real businesses, not a
> guess. Most people pick a niche because they like the idea of it and then
> wonder why nobody replies. Pick from the table.

TALK ABOUT:
- Take the town from wherever you live, or wherever you have any kind of
  connection. A connection to the place beats a bigger city every time.

---

## SCREEN: Claude Code

```
/find-leads
```

Give it a trade and a town when it asks. Use the same fictional town and trade you
will use for the rest of the course.

TALK ABOUT while it asks:
- It checks you are set up before it spends anything.
- It tells you the cost and how many leads to expect, and waits for you to say
  yes. It will never spend your credit without asking.

---

## SCREEN: the run

Let it run. Do not cut this. Students need to see how long it actually takes.

TALK ABOUT while it runs:
- It is searching Google Maps, then opening each business's website to judge how
  old it is.
- Cost is about six tenths of a cent per business. A whole town of one trade is
  pennies.
- Keep any single run under about four dollars. If you want more, add another free
  Apify account rather than one huge run.

---

## SCREEN: the results in the sheet

Open the CRM or the sheet and scroll the rows.

TALK ABOUT, pointing at the columns:
- Phone, email, website status, rating, and a one line reason to reach out.
- It sorts the strongest to the top. Two kinds of hot lead.
- No website at all: you are selling them their first site.
- Old or broken website: these are your best leads, because they have already paid
  for a website once. They value one, they just need a better one, and you can
  show them exactly what is wrong with what they have.

---

## THE ONE THING

Say both of these. The second one gets reported as a bug every week.

**SAY THIS:**

> Two things that will waste your afternoon. First, the country code is the two
> letter one. The United Kingdom is g b, not u k. Get that wrong and you get
> nothing back.
>
> Second, if you run the same town twice, it comes back empty. That is not
> broken. It is skipping every business already in your sheet so you never email
> the same person twice. If you want more leads, use a new town.

---

## CLOSE

**SAY THIS:**

> Work them top down. Hottest first, and inside that, the ones with an email
> first, because those you can contact tonight. Next video we turn this list into
> booked calls.
