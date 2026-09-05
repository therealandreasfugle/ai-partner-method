# Video 2: Set up your accounts

**Length:** 20 minutes. **Source:** `00-setup`.
**Goal:** they finish with a green check and every account connected.

This is the video with the highest drop off in any course like this. Two rules
while recording: never skip a step because it is boring, and never say "and then
just". Every "just" is where somebody quits.

---

## OPEN

**SAY THIS:**

> Ten accounts. Nine of them are free. The whole thing is about ninety minutes
> and you do it once. I am going to do it with you, in order, and there is one
> step in the middle that is genuinely fiddly. I will tell you when we get to it
> so you can slow down.

Show the cost table from `00-setup/README.md` on screen while you say the next
part.

TALK ABOUT:
- GitHub, Vercel, Groq, Resend, Google and Cal.com are free and stay free at your
  volume.
- Apify gives you free credit every month, and you can add more free accounts.
- Stripe takes a cut per payment and nothing monthly.
- The only thing you actually pay for is a domain, about ten a year.

---

## SCREEN: Claude Code, in the repo folder

Type it slowly enough to read:

```
/setup
```

TALK ABOUT while it starts:
- It runs a check first, so it knows what you already have.
- It then walks you through one account at a time. It will not dump ten things at
  you.
- It writes every key into the right file for you. You never edit a file by hand.

---

## SCREEN: work the ten, in order

Do not record all ten in full. Record these four properly and speed through the
rest, because these four are where people get stuck.

**GitHub and Claude Code.** Fast. Say what each is for in one sentence.

**Vercel.** Show the sign in with GitHub. Say plainly: this is where every site
you build lives, and the free tier covers dozens of busy client sites.

**Apify.** Show `https://console.apify.com/settings/integrations` and the token.

TALK ABOUT:
- This is what finds the leads.
- Free credit monthly. You can make two or three free accounts and paste each
  token in, numbered, and it rolls to the next one when the first runs dry.

**Google Sheet.** Slow right down. Say out loud that this is the fiddly one and it
is about twenty minutes.

TALK ABOUT:
- This sheet is the database behind your CRM.
- You are deploying a small script that lets your tools write to it.
- Follow `00-setup/07-google-sheet.md` exactly. Do not improvise this one.

---

## THE ONE THING

This is the most important sentence in the whole setup video.

**SAY THIS:**

> When you get to the shared token on the Google Sheet step, an older guide in
> this repo calls it optional. It is not optional. If you leave it blank, anybody
> who ever gets that web app address can write straight into your CRM. Generate a
> long random one, put it in, and make sure the scraper and the CRM both have the
> exact same value.

Put the words "SHARED_TOKEN is not optional" on screen.

---

## SCREEN: the rest, at speed

**Groq.** `https://console.groq.com/keys`. Free, no card. One key powers the
chatbot on every website you ever build.

**Resend.** Sign up, add your domain, add the DNS records it gives you.

TALK ABOUT:
- This sends your contracts, your lead alerts and your review requests.
- Verifying the domain is what keeps you out of spam. Do not skip it and then
  wonder why nothing arrives.

**Your domain.** About ten a year. You need one before outreach.

**Cal.com.** Free. This is where every email, DM and call you make sends people.

**Stripe.** This is how you get paid on the call.

---

## SCREEN: the check

```
/check
```

Let it run on camera. If yours is all green, that is a boring thirty seconds and
that is fine, they need to see what finished looks like.

TALK ABOUT:
- Run this any time something stops working. It is the first thing to try.
- It also flags two things nobody thinks to check: a paid OpenAI or Anthropic key
  sitting in your file, which nothing here needs, and a blank sheet token.

---

## CLOSE

**SAY THIS:**

> That is the only setup in this whole business. From here on it is find a lead,
> book a call, sell, build, keep them. Next video we get you a list of businesses
> worth calling.
