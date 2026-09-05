# Community Onboarding

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
- **[contact_info]** *what's your name?*  _(ref: `b5af5a93-91c2-420b-b41a-d81a7484eb69`)_
- **[multiple_choice]** *Where did you first see my content?*  _(ref: `ef90e7d7-b646-47b9-940c-b111ce7d2460`)_
  - choices:
    - `Youtube`
    - `Reels`
    - `IG Stories`
    - `Emails`
  - validations: required=True
- **[long_text]** *Which specific piece of content (video/story/email) finally made you join?*  _(ref: `68531bcb-7c69-4640-86ab-133bfe5284cf`)_
  - validations: required=True
- **[long_text]** *What was the*_* *_*#1 thing that almost stopped you from joining?*  _(ref: `48f6d4fe-c8e2-419b-85f7-6b7a38d4decb`)_
  - validations: required=True
- **[long_text]** *How long have you been watching and thinking of joining before finally pulling the trigger?*  _(ref: `1c61b951-a34b-40ba-a1c6-a8ad7a4e1bc7`)_
  - validations: required=True
- **[short_text]** *Before you saw the price, what did you honestly expect this to cost (in $USD)*  _(ref: `0591f1a0-bc79-4b44-a861-99e80ddd934c`)_
  - validations: required=True
- **[long_text]** *What is the one result you need to see in the next 30 days to feel like joining was a win?*  _(ref: `e94b69d4-29a9-47ce-b673-09bafc073d41`)_
  - validations: required=True
- **[long_text]** *What sort of value do you need to see every month to make it worth it?*  _(ref: `4c1f1204-2ce6-45d5-8e6a-e2dbdfdd16d6`)_
  - validations: required=True
- **[long_text]** *What would make you want to cancel?*  _(ref: `36b101d2-5580-4baa-b3f2-443bd7211f79`)_
  - validations: required=True
- **[long_text]** *Any other communities you thought of joining? If so, who and why?*  _(ref: `6d1f5b38-8867-4ea0-846e-19ed01d12633`)_
  - validations: required=True
- **[long_text]** *What were the top 3 hesitations or "risks" you felt before hitting the buy button*  _(ref: `6670f0de-b7fb-46ce-8333-6998332c2e7d`)_
  - validations: required=True
- **[long_text]** *What’s the #1 lie you were telling yourself that kept you from joining 3 months ago?*  _(ref: `19a5afff-f016-4ba2-bfdb-2e00ec404fe2`)_
  - validations: required=True
- **[long_text]** *What’s one thing I could have done to make you join sooner?*  _(ref: `e6e39f88-fea5-4870-ba31-356f3f446b12`)_
  - validations: required=True

## Logic jumps
_No logic jumps._

## Thank-you screens
- **Thanks for completing this typeform
Now *create your own* — it's free, easy, & beautiful**  _(ref: `default_tys`)_
  - button: `Create a *typeform*` → `default_redirect` ``

## Webhooks
_None._
