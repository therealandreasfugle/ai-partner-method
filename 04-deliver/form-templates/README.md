# AIPM Student Form Templates

Six battle-tested Typeform templates you can deploy on day one of running your
agency. Saved as platform-agnostic JSON + markdown specs so you can either
recreate them on Typeform with one API call or rebuild them on Tally / Jotform
/ native HTML if you prefer something else.

## What's in here

| # | Form | Use it for |
|---|------|------------|
| 01 | `coach_1on1_call_form` | Log every 1-on-1 coaching call recording — pushes Fathom/Zoom/Loom URL to your CRM/Notion |
| 02 | `client_onboarding_survey` | Deep customer research after a sale — what made them buy, what almost stopped them, would they have paid more |
| 03 | `community_onboarding` | Light post-purchase research for community members |
| 04 | `closer_post_call_form` | Your closer's post-call report — outcome, cash collected, contract value, objections, payment plan |
| 05 | `setter_eod_form` | End-of-day stats for setters (inbound/outbound DMs, calls booked) |
| 06 | `dialler_eod_form` | End-of-day stats for diallers (dials, pickups, qualified leads, calls booked) |
| 07 | `program_application` | Front-of-funnel application form — income goals, blocker, why now, budget, contact info + 8 hidden UTM fields for attribution |

## Each form folder contains

- `form.json` — full Typeform definition, ready to POST to the Typeform API
- `webhooks.json` — webhook templates (URLs are placeholders for you to fill in)
- `spec.md` — human-readable spec (every field, validation, logic jump,
  thank-you screen) — read this if you're rebuilding on a non-Typeform
  platform
- `customize.md` — what you need to swap before deploying (coach names,
  closer names, webhook URLs)
- `recreate.md` — copy-paste shell commands to deploy

## Quick start (5 minutes per form)

You need a [Typeform personal access token](https://admin.typeform.com/account#/section/tokens).

```bash
git clone https://github.com/BrettZuke/aipm-student-form-templates.git
cd aipm-student-form-templates/forms/04_closer_post_call_form

# 1. Open customize.md, do the swaps (e.g. replace "Closer Name 1" with your
#    actual closer's name across form.json + webhooks.json)

# 2. Deploy the form
export TYPEFORM_TOKEN=tfp_xxx
curl -s -X POST https://api.typeform.com/forms \
  -H "Authorization: Bearer $TYPEFORM_TOKEN" \
  -H "Content-Type: application/json" \
  --data-binary @form.json | tee /tmp/new_form.json

NEW_FORM_ID=$(python3 -c 'import json; print(json.load(open("/tmp/new_form.json"))["id"])')
echo "Form admin URL: https://admin.typeform.com/form/$NEW_FORM_ID"

# 3. Wire up the webhook(s)
python3 ../../scripts/recreate_webhooks.py "$TYPEFORM_TOKEN" "$NEW_FORM_ID" webhooks.json
```

The public form URL is in the API response under `_links.display` — drop it
in your funnel, onboarding email, or coaching dashboard.

## Webhook setup

Each form's `webhooks.json` has URL placeholders. Wire them at whichever
automation platform you use:

- **[Make.com](https://www.make.com/)** — easiest if you're not a dev. Create
  a scenario with a "Custom webhook" trigger, copy the webhook URL, paste
  into `webhooks.json`. From there you can push to Slack, Google Sheets,
  Notion, Airtable, your CRM, etc.
- **[n8n](https://n8n.io/)** — self-hostable on Railway / Fly. Same pattern.
- **[Zapier](https://zapier.com/)** — works the same way; create a Zap with
  a "Webhooks by Zapier" trigger.

## Rebuilding on a non-Typeform platform

Don't want to pay for Typeform? Open `spec.md` in any form's folder. It
documents every field, validation rule, logic jump, and thank-you screen in
plain English. Hand it to whoever's building the form on Tally / Jotform /
native HTML. No API access needed.

## Credit

These templates were originally built and refined inside [Dan Bennett's AI
Partner Method](https://danbennettz.com/) program. Scrubbed of all
personal/account-specific data and released for AIPM students to run their
own agencies with the same operational backbone.
