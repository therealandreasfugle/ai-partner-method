# 8. Your domain, and why email lands

**What it does for you:** your own web address, and the reputation that decides
whether your emails reach an inbox or a spam folder.

**Cost:** about 10 a year per domain. This is your only guaranteed cost.

## Buy two domains, not one

| Domain | Used for | Example |
|---|---|---|
| **Your main one** | Your site, your contracts, client email | `yourbusiness.com` |
| **An outreach one** | Cold email only | `yourbusinesshq.com` |

Ten pounds saves you the single most expensive mistake in this business, which is
burning the reputation of the domain your paying clients email you on.

Buy from anywhere sensible. Namecheap, Cloudflare and Porkbun are all fine.
Cloudflare sells at cost.

⚠️ **Do not buy a brand new domain and cold email from it the same week.** A
domain with no history sending fifty emails on day one is the textbook spam
signal. Buy the outreach domain now so it has aged by the time you use it.

---

## The three DNS records

Resend gives you these when you add a domain. Add all three at your registrar.
They are what proves your email is really from you.

**SPF** says which servers are allowed to send as your domain.
**DKIM** signs each message so it cannot be tampered with.
**DMARC** tells inboxes what to do when something fails the first two.

Resend gives you the exact SPF and DKIM values. DMARC you add yourself:

| Type | Name | Value |
|---|---|---|
| TXT | `_dmarc` | `v=DMARC1; p=none; rua=mailto:you@yourdomain.com` |

`p=none` means "watch and report, do not block". That is the right setting to
start on. Tighten it later once you can see reports coming in cleanly.

## Check it actually worked

Do not trust the dashboard alone. Send a real email to a Gmail address you own,
open it, and use "Show original". You want to see three passes:

```
SPF:   PASS
DKIM:  PASS
DMARC: PASS
```

Anything else and your outreach is going to spam, no matter how good the copy is.

⚠️ **DNS changes take time.** Usually minutes, occasionally a few hours. If a
record does not verify straight away, wait before you start changing things.

⚠️ **A common trap: two SPF records.** A domain may only have one. If your
registrar already added one, merge them into a single record rather than adding a
second, or both stop working.

---

## Pointing a domain at a site

Once a client site is deployed on Vercel:

1. In the Vercel project, open **Settings**, then **Domains**
2. Add the client's domain
3. Vercel shows the DNS records to add. Add them at whoever the domain is
   registered with.
4. Wait. The SSL padlock turns itself on, you do nothing.

⚠️ **Never take ownership of a client's domain into your own account without
saying so.** If they leave, the domain is theirs. Add yourself as a user on their
registrar account instead, or have them add the records while you are on the phone
with them. This is the sort of thing that turns a quiet exit into a bad review.
