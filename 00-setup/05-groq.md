# 5. Groq

**What it does for you:** powers the AI chatbot that sits on every client website
answering questions around the clock. It is one of the ten things you sell.

**Cost:** free. There is no card on the account, so it cannot charge you.

## Steps

1. Open https://console.groq.com/keys
2. Sign in. The "Continue with Google" button is just Groq's login.
3. Click **Create API Key**, name it anything, copy the key. It starts with `gsk_`.
4. You add it to each client's Vercel project when you deploy their site. Claude
   does this for you if you give it the key once.

That is it. One key powers every website you ever build.

## If Groq is unavailable

The chatbot falls back to Google's free Gemini tier automatically. Get a key at
https://aistudio.google.com/apikey and set `GEMINI_API_KEY` instead. Same free
terms, same behaviour.

⚠️ Never put this key in a website file. It goes in Vercel's environment settings
where visitors cannot see it. The chatbot talks to your own endpoint, and only
that endpoint knows the key.

⚠️ There is a per visitor rate limit built in, so one bot hammering a client's
chat widget cannot burn your daily quota.
