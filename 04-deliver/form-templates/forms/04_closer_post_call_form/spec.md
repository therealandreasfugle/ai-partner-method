# [Closer] Post Call Form

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
```json
{
  "utm_campaign": "",
  "utm_content": "",
  "utm_medium": "",
  "utm_source": ""
}
```

## Welcome screens
_None._

## Fields
- **[contact_info]** *Enter Leads Info*  _(ref: `9ebb86a6-f5fd-4335-8f21-74a6deae7658`)_
  - description: make sure it's correct *(phone number is on Iclosed)*
- **[multiple_choice]** *Closer Name*  _(ref: `76cd2ea7-496b-4f46-b5e1-22fa09e1cb47`)_
  - choices:
    - `Closer Name 1`
    - `Closer Name 2`
    - `Closer Name 3`
    - `Closer Name 4`
  - validations: required=True
- **[multiple_choice]** *Setter Name*  _(ref: `8cbd31ce-5198-45ac-a840-d99b79a54b63`)_
  - choices:
    - `Setter Name 1`
    - `Setter Name 2`
    - `No Setter`
    - `Unsure of Setter`
  - validations: required=True
- **[multiple_choice]** *Outcome of Sales Call?*  _(ref: `815d1168-1dff-416e-bc7c-5c9f10f7271b`)_
  - choices:
    - `PIF`
    - `Financed via Fanbasis`
    - `Financed In House`
    - `Put Deposit`
    - `Booked Follow Up`
    - `No Close`
    - `Financially DQ'd`
    - `No Show`
    - `Cancelled`
  - validations: required=True
- **[long_text]** *What was the ONE specific technical or mental 'gap' they believed was stopping them?*  _(ref: `9741738e-020c-4057-91af-6f1bc1def773`)_
  - validations: required=False
- **[long_text]** *If they did NOT close:*  *List the biggest objection(s) they had that stopped them from buying*  _(ref: `48af8791-276a-49dc-8246-76e363be564c`)_
  - validations: required=False
- **[long_text]** *What objections of theirs did you struggle to overcome?*  _(ref: `546ea979-1900-4c62-adc8-2e96e312a628`)_
  - description: leave blank if truly nothing but take a minute to self reflect
  - validations: required=False
- **[long_text]** *What could you have done to improve the chances of them closing? *  _(ref: `66f657eb-e305-46c4-8e3f-ab527f3f6699`)_
  - description: leave blank if truly nothing but take a minute to self reflect
  - validations: required=False
- **[short_text]** *What could we improve in our marketing & post-call booking process to help you close?*  _(ref: `f80d303e-08c9-48aa-9d54-aad6294828c7`)_
  - validations: required=False
- **[yes_no]** *Did you present the offer?*  _(ref: `a90693cb-3642-470d-ba10-3576641eb6b0`)_
  - validations: required=False
- **[number]** *What's the cash COLLECTED*  _(ref: `7a2f86a8-abcc-4e69-b801-db07d50d93e2`)_
  - validations: required=False
- **[number]** *What is the closed deal/contract value?*  _(ref: `d99999eb-dfe0-4ebb-8bbf-508eeace1f27`)_
  - validations: required=False
- **[multiple_choice]** *What tier did you get them in on?*  _(ref: `9a8de7c5-53e9-43da-b288-4f6f82b2945b`)_
  - choices:
    - `Tier 1`
    - `Tier 2`
    - `Tier 3`
  - validations: required=False
- **[multiple_choice]** *Payment Plan*  _(ref: `068b0b90-5983-4718-a36c-daadd270408d`)_
  - description: Select NA this if PIF or no close
  - choices:
    - `2 monthly payments`
    - `3 monthly payments`
    - `4 monthly payments`
    - `6 monthly payments`
    - `Custom (specify at end of typeform)`
    - `NA`
  - validations: required=True
- **[number]** *Amount per upcoming recurring payment ($USD)*  _(ref: `c093306f-7868-4052-9352-de6959698562`)_
  - description: What they will pay each month after todays CC
  - validations: required=False
- **[date]** Date of first recurring payment  _(ref: `2123ae4a-107a-452b-8e09-16f25eca32c3`)_
  - validations: required=True
- **[short_text]** Insert the Call Link  _(ref: `29995e03-7ce4-4378-b206-c95f36aac283`)_
  - validations: required=False
- **[statement]** * 🔴 I M P O R T A N T 🔴*   The *next answer you give* is going straight into an* email being sent *to the lead* *in 10 minutes.  *Write your answer lowercase & informal so they flow naturally into the template*  _(ref: `b85ade31-4f4e-498d-940b-ab175ee8f36e`)_
  - layout: {'type': 'stack', 'attachment': {'type': 'image', 'href': 'https://images.typeform.com/images/dLscAfRyiLVL', 'properties': {'brightness': 0, 'focal_point': {'x': 0, 'y': 0}, 'description': 'IMG_7702'}}, 'viewport_overrides': {'small': {'type': 'float'}, 'large': {'type': 'float', 'placement': 'right'}}}
- **[long_text]** *Start of Template*: hey [Name], [CloserName] said yous just got off the phone...   he said you were looking to *[ANSWER A]* with the help of my program   *(I need you to fill in Answer A)*  *What was the #1 goal they wanted to achieve?*  _(ref: `7127d0f7-6275-4c62-8fb7-c315b569e04b`)_
  - description: If they PIF / Financed leave blank
  - validations: required=False
- **[long_text]** *add any other info you think is useful*  _(ref: `fef4acf3-ce65-45da-af59-bf7535e5f101`)_
  - validations: required=False

## Logic jumps

**On field `a90693cb-3642-470d-ba10-3576641eb6b0` (field)**
  - IF is(field:815d1168-1dff-416e-bc7c-5c9f10f7271b, choice:761df4ea-760f-4f7e-9295-2058c52aeb9d) → jump → field:29995e03-7ce4-4378-b206-c95f36aac283
  - IF is(field:815d1168-1dff-416e-bc7c-5c9f10f7271b, choice:a3e88122-37d6-4e01-99ad-779fdc9c5718) → jump → field:29995e03-7ce4-4378-b206-c95f36aac283
  - IF is(field:815d1168-1dff-416e-bc7c-5c9f10f7271b, choice:3efaca12-569d-41c8-8a3d-f477887cae33) → jump → field:29995e03-7ce4-4378-b206-c95f36aac283
  - IF is(field:815d1168-1dff-416e-bc7c-5c9f10f7271b, choice:e996fdc7-b326-4e86-b109-510b92cfc1cd) → jump → field:29995e03-7ce4-4378-b206-c95f36aac283

**On field `d99999eb-dfe0-4ebb-8bbf-508eeace1f27` (field)**
  - IF is(field:815d1168-1dff-416e-bc7c-5c9f10f7271b, choice:aa7e27af-d01d-4df1-9a79-0c1b9e02bd52) → jump → field:29995e03-7ce4-4378-b206-c95f36aac283
  - IF is(field:815d1168-1dff-416e-bc7c-5c9f10f7271b, choice:761df4ea-760f-4f7e-9295-2058c52aeb9d) → jump → field:29995e03-7ce4-4378-b206-c95f36aac283
  - IF is(field:815d1168-1dff-416e-bc7c-5c9f10f7271b, choice:a3e88122-37d6-4e01-99ad-779fdc9c5718) → jump → field:29995e03-7ce4-4378-b206-c95f36aac283
  - IF is(field:815d1168-1dff-416e-bc7c-5c9f10f7271b, choice:3efaca12-569d-41c8-8a3d-f477887cae33) → jump → field:29995e03-7ce4-4378-b206-c95f36aac283
  - IF is(field:815d1168-1dff-416e-bc7c-5c9f10f7271b, choice:e996fdc7-b326-4e86-b109-510b92cfc1cd) → jump → field:29995e03-7ce4-4378-b206-c95f36aac283

## Thank-you screens
- **Logged. On to the next call.

Don't forget to confirm your upcoming calls and make any needed dials.**  _(ref: `0418f0b1-947e-4c74-bb9d-a30184c89947`)_
  - button: `again` → `default_redirect` ``
- **Thanks for completing this typeform
Now *create your own* — it's free, easy, & beautiful**  _(ref: `default_tys`)_
  - button: `Create a *typeform*` → `default_redirect` ``

## Webhooks
- **tag:** `phoenix:1778283207206`
  - url: `<REPLACE_WITH_YOUR_WEBHOOK_URL>`
  - enabled: `True`
  - verify_ssl: `True`
- **tag:** `phoenix:1775263818541`
  - url: `<REPLACE_WITH_YOUR_WEBHOOK_URL>`
  - enabled: `True`
  - verify_ssl: `True`
