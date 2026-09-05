# Customizing `[Coach] 1-on-1 Call Form`

Use this form for your coaches to log every 1-on-1 call recording.

## What to swap before deploying

1. **Coach names** — open `form.json`, find the field with `ref: "coach"`, and
   replace `Coach Name 1`, `Coach Name 2`, `Coach Name 3` with your actual
   coach names (add or remove choices as needed).
2. **Webhook URL** — edit `webhooks.json` and replace
   `<REPLACE_WITH_YOUR_WEBHOOK_URL>` with the Make / n8n / Zapier endpoint that
   stores the call recording (e.g. push to Notion, Airtable, or your CRM).
