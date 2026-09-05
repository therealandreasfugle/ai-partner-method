# Client Onboarding Survey

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
- **[contact_info]** *What's your name?*  _(ref: `f9c11625-bbe0-4382-af92-57e076a22cb3`)_
- **[phone_number]** *whats your phone number?*  _(ref: `0a0f2cee-eec2-4d56-8cd2-ef15c56d52da`)_
  - validations: required=False
- **[email]** *whats your prefered email?*  _(ref: `c077e9e0-98ac-45f8-9323-86e0bd969631`)_
  - validations: required=True
- **[short_text]** *what country do you reside in legally?*  _(ref: `7b1e308f-2aa0-46f3-adb1-6e0cc6351284`)_
  - validations: required=False
- **[multiple_choice]** *What was your first touch point with me?*  _(ref: `17855a4f-4667-4cab-9612-e591fc1989ff`)_
  - description: as in, where did u first come in contact with me/my content?
  - choices:
    - `Youtube`
    - `Reels`
    - `Referral`
    - `Dms`
    - `Email`
    - `Ads`
  - validations: required=True
- **[long_text]** *What made you choose me?*  _(ref: `faaf27c5-8038-428c-9abb-4dc341416da1`)_
  - description: please be ultra specific
  - validations: required=True
- **[long_text]** *How long did it take you to start working with me? *  _(ref: `3384a0e3-1544-4ed2-bce1-3d02b5cc4c48`)_
  - description: (from first touch point to onboarding)
  - validations: required=True
- **[long_text]** *At what point were you sold?*  _(ref: `8806f2d0-34de-4ea4-8b84-b6f240ba3401`)_
  - validations: required=True
- **[long_text]** *There are lots of other people offering the same thing.. What made you want to work with ME specifically? *  _(ref: `56f7caa9-1017-4ca9-9483-e16c3549315c`)_
  - validations: required=True
- **[long_text]** *What could I have improved or done to make you join earlier?*  _(ref: `d627f480-d10a-4196-82d1-80a1109a88bd`)_
  - validations: required=True
- **[long_text]** *What was the final decision that put you over the line?*  _(ref: `a33ae4c3-fdbd-41cd-b54a-43a8193d23d8`)_
  - validations: required=True
- **[long_text]** *Were there any specific content pieces (yt videos, stories etc) that pushed you over the edge?*  _(ref: `4edc8e7f-5263-4931-a6f5-e7ab682573e8`)_
  - description: if not just say no
  - validations: required=True
- **[opinion_scale]** *Before the call, how convinced were you that you would join?*  _(ref: `cc91cab9-67c1-4899-92d5-71179fedd929`)_
  - start_at_one: False
  - steps: 11
  - validations: required=True
- **[long_text]** *Any fears of going with me?*  _(ref: `f0d6d305-e39d-4bac-9080-7eae448795b1`)_
  - validations: required=True
- **[long_text]** *What were your biggest hesitations before joining?*  _(ref: `94ed67d3-28e0-4f09-a238-872c9decd53d`)_
  - validations: required=True
- **[long_text]** *What would of made you join sooner?*  _(ref: `b8d12b00-33a0-44b6-bf9d-0c35ee7ec507`)_
  - validations: required=True
- **[multiple_choice]** *Would you have paid more to join? If so, how much more?*  _(ref: `9429cc9c-dab0-431b-8f9c-e7ee240aadc7`)_
  - choices:
    - `No`
    - `Yes $100-$500 more`
    - `Yes $500 - $1000 more`
    - `Yes $1000 - $2000 more`
    - `Yes $2000 - $4000 more`
    - `Yes $4000+ more`
  - validations: required=True
- **[long_text]** *What would make you WANT to pay more?*  _(ref: `4d8cc90b-2d4b-4a27-9976-50513584997b`)_
  - validations: required=True
- **[long_text]** *Which of my traits as a human being spoke to you? Why did you buy from me as a person*  _(ref: `5ab21664-212d-44c1-ae87-696a390e50e3`)_
  - validations: required=True
- **[long_text]** *Anything else?*  _(ref: `070425da-7049-41cf-a603-858875d8ef73`)_
  - validations: required=True

## Logic jumps
_No logic jumps._

## Thank-you screens
- **Thanks for taking the time to fill this out — really appreciate the thorough answers. You're all set.**  _(ref: `fc2a428e-fda0-431b-beee-b00f235a4127`)_
  - button: `again` → `default_redirect` ``
- **Thanks for completing this typeform
Now *create your own* — it's free, easy, & beautiful**  _(ref: `default_tys`)_
  - button: `Create a *typeform*` → `default_redirect` ``

## Webhooks
- **tag:** `n8n-onboarding`
  - url: `<REPLACE_WITH_YOUR_WEBHOOK_URL>`
  - enabled: `True`
  - verify_ssl: `True`
