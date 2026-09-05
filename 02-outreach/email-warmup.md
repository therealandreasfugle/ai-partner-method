# Email warmup

**Read this before you send a single cold email.** It is the difference between
outreach that works and outreach that quietly goes nowhere.

## What goes wrong

You buy a domain on Monday, set up Resend on Tuesday, and send fifty cold emails
on Wednesday. None of them get replies.

They did not get ignored. They went to spam, and because you can see them arrive
when you email yourself, you assume the system works and the copy is wrong. You
rewrite the copy. It still does not work.

**A brand new domain sending at volume is the clearest spam signal there is.**
Gmail and Outlook have no history for you, so they assume the worst, and once
they have decided, it takes months to undo.

## The fix, in order

**1. Get the DNS right first.** SPF, DKIM and DMARC all passing. See
[`00-setup/08-domain.md`](../00-setup/08-domain.md). Nothing below matters until
this is done.

**2. Let the domain sit for two weeks.** Buy your outreach domain early so it is
ageing while you set everything else up. A domain registered three weeks ago is
treated very differently from one registered yesterday.

**3. Use the domain like a person before you use it like a machine.** Send real
emails from it. Reply to things. Email friends and have them reply. Twenty or
thirty real back and forth conversations over two weeks builds more reputation
than any paid tool.

**4. Ramp slowly.** This is the part people skip.

| Days | Emails per day |
|---|---|
| 1 to 3 | 5 |
| 4 to 7 | 10 |
| 8 to 14 | 20 |
| 15 to 21 | 35 |
| 22 to 30 | 50 |
| After 30 | Up to your plan's cap |

Set the ceiling so you cannot get it wrong, in `tools/lead-scraper/.env`:

```
OUTREACH_DAILY_MAX=5
```

Raise it as you move down the table. Leaving it low costs you a few days. Getting
it wrong costs you the domain.

⚠️ **Never send in one big burst.** Fifty emails at 9am looks like a machine.
Spread them across the working day.

---

## What actually gets you marked as spam

In rough order of how much damage each does.

1. **Sending too much too soon from a new domain.** The big one.
2. **A high bounce rate.** Every dead address you send to counts against you. The
   scraper already checks whether a domain resolves and blanks the email if it
   does not. Do not defeat that by importing an unverified list.
3. **Nobody replying.** Reply rate is a positive signal. This is a real reason to
   send fewer, better, more personal emails.
4. **Links, images and attachments in a first email.** One link is fine. Three
   links, a tracking pixel and a logo in a cold first touch is not.
5. **Spam trigger words.** "Guaranteed", "risk free", "act now", "limited time",
   anything in all capitals, and exclamation marks.
6. **No plain text version.** Every email should have both. The templates in this
   repo do.

---

## The warm Gmail route

If you already have a Gmail account with years of history, that reputation is
worth more than any new domain you can buy.

It is slower and it does not scale, but for your first ten clients it does not
need to. Send from Gmail, keep it genuinely personal, cap it at twenty a day, and
use the Make scenario in `02-outreach` to pull scraped leads through it.

**Start here if you have the option.** Move to a dedicated outreach domain when
twenty a day stops being enough.

⚠️ Google will suspend a personal Gmail used for bulk sending. Twenty a day, one
at a time, written like a person. Not two hundred.

---

## Checking your reputation

- Send to a Gmail you own, open it, and use **Show original**. SPF, DKIM and DMARC
  should all say PASS.
- https://www.mail-tester.com gives you a score out of ten from one email. Aim for
  9 or better before you scale up.
- Watch your Resend dashboard for bounces. Anything above about 3 percent means
  stop and fix the list before sending more.

⚠️ **If your emails start landing in spam, stop sending.** Do not push through it.
Every additional send makes recovery harder. Pause for a week, fix the cause, and
restart at 5 a day.
