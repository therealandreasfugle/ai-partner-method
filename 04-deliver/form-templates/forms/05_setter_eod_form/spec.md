# Setter EOD Form

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
- **[number]** How many inbound DMs did you handle?  _(ref: `a7ba3b89-b588-4588-a969-1fe6ff3a1c9e`)_
  - validations: required=False
- **[number]** How many inbound booked calls did you have?  _(ref: `c0c0d62e-7c05-4d48-9e1d-5688e06c38f9`)_
  - validations: required=False
- **[number]** How many outbound messages did you send?  _(ref: `dc82870f-6737-413e-a892-f206cd58e358`)_
  - validations: required=False
- **[number]** How many outbound responses did you receive?  _(ref: `8b09c3e7-87cf-48ce-b0a9-a9d9ef7b3c93`)_
  - validations: required=False
- **[number]** How many outbound booked calls did you achieve?  _(ref: `038ec600-5964-4f38-941c-214b8f76416b`)_
  - validations: required=False
- **[number]** What is the total number of qualified leads (inbound + outbound)?  _(ref: `df3cf1dc-4425-4d4e-9600-fee049b873a7`)_
  - validations: required=False
- **[dropdown]** Which was your primary communication channel?  _(ref: `842540f9-33c8-419c-bd6f-590667bd1301`)_
  - choices:
    - `Instagram DM`
    - `Telegram`
    - `WhatsApp`
  - validations: required=False
- **[long_text]** What was the top barrier to booking calls?  _(ref: `083f3bbb-6c3c-4a9c-ac44-4f78d039fa21`)_
  - description: For example: 'Price/Early Bird too high,' 'Masterclass not watched,' or 'Timezone conflict.'
  - validations: required=False

## Logic jumps
_No logic jumps._

## Thank-you screens
- **Thanks for completing this typeform
Now *create your own* — it's free, easy, & beautiful**  _(ref: `default_tys`)_
  - button: `Create a *typeform*` → `default_redirect` ``

## Webhooks
- **tag:** `WHTP2864306`
  - url: `<REPLACE_WITH_YOUR_WEBHOOK_URL>`
  - enabled: `True`
  - verify_ssl: `True`
