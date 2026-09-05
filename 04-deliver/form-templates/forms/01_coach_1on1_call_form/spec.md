# [Coach] 1-on-1 Call Form

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
  "enrichment_in_renderer": {
    "toggle": false,
    "active": true
  },
  "auto_translate": true,
  "partial_responses_to_all_integrations": true
}
```

## Hidden fields
_None._

## Variables
_None._

## Welcome screens
- **📞 Log a 1-on-1 call recording**  _(ref: `01KR53QJH2MRJ3ZJTVNTFXAACK`)_
  - description: Fill this after every coaching call. Takes 30 seconds.
  - button: `Start`

## Fields
- **[email]** Student email  _(ref: `email`)_
  - validations: required=True
- **[multiple_choice]** Coach who took the call  _(ref: `coach`)_
  - choices:
    - `Coach Name 1`
    - `Coach Name 2`
    - `Coach Name 3`
  - validations: required=True
- **[multiple_choice]** Call type  _(ref: `call_type`)_
  - choices:
    - `1-on-1 coaching`
    - `Onboarding`
    - `Content review`
    - `Sales call review`
    - `Q&A`
    - `Other`
  - validations: required=True
- **[date]** Date of call  _(ref: `call_date`)_
  - validations: required=True
- **[website]** Recording link (Fathom / Zoom / Loom)  _(ref: `recording_url`)_
  - validations: required=True
- **[long_text]** Brief note on what was covered  _(ref: `notes`)_
  - validations: required=False

## Logic jumps
_No logic jumps._

## Thank-you screens
- **✓ Logged. Recording added to student card.**  _(ref: `01KR53QJH2YNXAKRJGHTSYSW67`)_
  - button: `again` → `default_redirect` ``
  - share_icons: True
- **Thanks for completing this typeform
Now *create your own* — it's free, easy, & beautiful**  _(ref: `default_tys`)_
  - button: `Create a *typeform*` → `default_redirect` ``

## Webhooks
- **tag:** `n8n-call-recording`
  - url: `<REPLACE_WITH_YOUR_WEBHOOK_URL>`
  - enabled: `True`
  - verify_ssl: `True`
