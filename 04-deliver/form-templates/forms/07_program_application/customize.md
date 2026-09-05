# Customizing `Program Application`

The standard agency / coaching program application. Lead lands on the form,
answers income goals + blocker + why now + budget, and submits their contact
info. You review applications and reach out to qualified leads.

## What to swap before deploying

1. **Welcome screen** — open `form.json`, find the welcome screen, and
   replace `{{Program Name}}` with your actual program name (e.g.
   `Acme Growth Method`, `Founder Accelerator`).
2. **"With limited spots available"** — the why-you question references
   limited spots. Edit `form.json` to specify the number (e.g.
   `With only 10 spots per cohort`) or rephrase to fit your model.
3. **Budget choices** — the budget brackets are in `$USD` from $120 up to
   $1,500+. Change the currency or the bracket amounts to match your
   pricing.
4. **Hidden fields** — `fn`, `ln`, `source`, `ref`, plus 4 UTM fields are
   pre-configured for attribution. Keep them as-is; they get populated by
   your funnel via URL params (e.g. `?fn=John&utm_source=ig_story`).
5. **Webhook** — wire `webhooks.json` to your CRM, Slack notification, or
   automated qualification flow.

## Hidden field reference (for your funnel)

Append to the form URL when sending traffic:
```
?fn=FirstName&ln=LastName&source=youtube&utm_source=ig&utm_campaign=launch
```
