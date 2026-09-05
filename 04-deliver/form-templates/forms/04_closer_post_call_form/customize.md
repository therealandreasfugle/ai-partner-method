# Customizing `[Closer] Post Call Form`

The form your closers fill out after every sales call. Tracks outcome, cash
collected, contract value, objections, and the data you need to send a
follow-up email to the lead.

## What to swap before deploying

1. **Closer names** — open `form.json`, find the field with title
   `Closer Name`, and replace `Closer Name 1..4` with your actual closer names.
2. **Setter names** — same — replace `Setter Name 1..2` with your setters.
   Keep `No Setter` and `Unsure of Setter` as fallbacks.
3. **Tier names** — fields with `Tier 1 / 2 / 3` choices. Rename if your
   program uses different tier labels.
4. **Webhook URLs** — `webhooks.json` has two placeholders. Wire them up to
   your sales tracker (one for student/CRM updates, one for revenue logging
   to a Google Sheet via Make).
