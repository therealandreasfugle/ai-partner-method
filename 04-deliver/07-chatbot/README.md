# 07. The AI chatbot

**What the client is paying for:** something answering visitors around the clock
and pushing them to enquire. Value on the proposal: $600.

**Where the system lives:** `tools/website-template/api/chat.mjs` and
`CHATBOT-SETUP.md` in the same folder.

## Already done for you

- Knows the business. Services, area, hours and phone are written into
  `api/_business.json` at build time, so you never write anything for it
- Free. Groq first, Google Gemini as a fallback
- Rate limited per visitor, so one bot cannot burn the daily quota
- Answers short, stays on topic, never invents a price, and pushes people to the
  quote form or the phone

## You MUST set, per client

Exactly one key on their Vercel project:

```
GROQ_API_KEY=gsk_your_key
```

One key powers every website you ever build. Get it at
https://console.groq.com/keys, free, no card.

## Check it

Open the live site, click the bubble, and ask something specific like "do you
cover [a town they serve]". If it answers with their real area, it is reading
their business facts correctly.

⚠️ The key goes in Vercel's environment settings, never in a website file.
Visitors talk to your endpoint, and only that endpoint knows the key.

⚠️ Turn it off for a client who does not want it with `chatbot: { enabled: false }`
in their `brand-dna.js`. Better to switch it off than ship one nobody monitors.
