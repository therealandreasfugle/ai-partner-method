# Video 12: Deliver line 07, the AI chatbot

**Length:** 4 minutes. **Value on the proposal:** $600.
**Source:** `04-deliver/07-chatbot`. **System:**
`tools/website-template/api/chat.mjs`.

---

## OPEN

**SAY THIS:**

> Something answering visitors at eleven at night and pushing them towards
> enquiring. This is the cheapest line item to deliver in the whole stack. It is
> one key, and that one key covers every website you will ever build.

---

## SCREEN: already done for you

Open a live built site and use the chat bubble. Ask it something specific, like
whether they cover a particular town.

TALK ABOUT:
- It already knows the business. Services, area, hours and phone got written in at
  build time, so you never write anything for it.
- It is free. It uses Groq first, and falls back to Google Gemini.
- It is rate limited per visitor, so one bot cannot burn the daily quota.
- It answers short, stays on topic, never invents a price, and pushes people to
  the quote form or the phone.

---

## SCREEN: the one setting

On their Vercel project, environment variables:

```
GROQ_API_KEY=gsk_your_key
```

Get it at https://console.groq.com/keys. Free, no card.

---

## CHECK IT

**SAY THIS:**

> Open the live site, click the bubble, and ask something only their business
> would know, like whether they cover a town they actually serve. If it answers
> with their real service area, it is reading their business facts properly and
> you are done.

---

## THE ONE THING

**SAY THIS:**

> The key goes in Vercel's environment settings, never in a file on the website.
> Visitors talk to your endpoint, and only that endpoint ever sees the key. If you
> put it in the site itself, anybody can open the page source and take it.

---

## WHEN TO SWITCH IT OFF

**SAY THIS:**

> If a client does not want it, turn it off rather than shipping one nobody
> watches. There is a setting in their brand file. A chatbot the owner never reads
> is worse than no chatbot.

---

## CLOSE

> Next, getting it actually live on their own address.
