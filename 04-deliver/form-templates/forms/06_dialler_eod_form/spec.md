# Dialler EOD Form

- **Form ID:** `None`
- **Public URL:** 
- **Language:** en
- **Workspace:** ``
- **Theme:** ``

## Settings
```json
{
  "language": "en",
  "progress_bar": "proportion",
  "meta": {
    "allow_indexing": false
  },
  "hide_navigation": false,
  "is_public": true,
  "is_trial": false,
  "show_progress_bar": true,
  "show_typeform_branding": true,
  "are_uploads_public": false,
  "show_time_to_complete": true,
  "show_number_of_submissions": false,
  "show_cookie_consent": false,
  "show_question_number": true,
  "hide_required_indicator": false,
  "show_key_hint_on_choices": true,
  "autosave_progress": true,
  "free_form_navigation": false,
  "use_lead_qualification": false,
  "pro_subdomain_enabled": false,
  "auto_translate": true,
  "partial_responses_to_all_integrations": true
}
```

## Hidden fields
_None._

## Variables
_None._

## Welcome screens
_None._

## Fields
- **[number]** How many dials did you make today?  _(ref: `2ae496b8-e940-4311-a294-088617b7ee24`)_
  - validations: required=False
- **[number]** Total pickups  _(ref: `8b104938-9bb8-4cf3-8739-0c5374c8e6f0`)_
  - validations: required=False
- **[number]** Total pickups or conversations (lasting over 30 seconds):  _(ref: `0a57ebb9-b6c9-4e12-9276-cb050207d500`)_
  - validations: required=False
- **[number]** How many qualified leads did you find today?  _(ref: `d0018ec2-d11a-4890-b481-4e1e7d213a44`)_
  - validations: required=False
- **[number]** Number of calls you successfully booked:  _(ref: `ff8be14a-106f-434e-b6b3-4053df58de1f`)_
  - validations: required=False

## Logic jumps
_No logic jumps._

## Thank-you screens
- **Thanks for completing this typeform
Now *create your own* — it's free, easy, & beautiful**  _(ref: `default_tys`)_
  - button: `Create a *typeform*` → `default_redirect` ``

## Webhooks
- **tag:** `WHTP2864312`
  - url: `<REPLACE_WITH_YOUR_WEBHOOK_URL>`
  - enabled: `True`
  - verify_ssl: `True`
