# Program Application

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
  "show_typeform_branding": false,
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
    "active": false
  },
  "auto_translate": true,
  "partial_responses_to_all_integrations": true
}
```

## Hidden fields
- `fn`
- `ln`
- `source`
- `utm_source`
- `utm_medium`
- `utm_campaign`
- `utm_content`
- `ref`

## Variables
_None._

## Welcome screens
- **{{Program Name}} — Application**  _(ref: `01KRCRWGFKAHSRDMV1HJ1ZTN3W`)_
  - description: Quick 2-minute application. We review every submission and reply within 48 hours.
  - button: `Start application`

## Fields
- **[multiple_choice]** What's the goal monthly income you're chasing in the next 6 months?  _(ref: `goal_income`)_
  - choices:
    - `$3k–$6k/mo: A bit extra on the side`
    - `$6k–$10k/mo: Replace my job income, work for myself`
    - `$10k–$20k/mo: Real money — freedom, travel, the works`
    - `$20k+/mo: I want to go big with this`
  - validations: required=True
- **[multiple_choice]** Where are you right now?  _(ref: `current_income`)_
  - choices:
    - `Unemployed or scraping by (under $2k/mo)`
    - `Stuck in a job that's not paying enough ($2k–$4k/mo)`
    - `Earning okay but plateaued ($4k–$8k/mo)`
    - `Already in the $8k+/mo bracket and want to scale`
  - validations: required=True
- **[multiple_choice]** What's been the actual thing stopping you hitting that goal?  _(ref: `main_blocker`)_
  - choices:
    - `No one's shown me the way. Don't know where to start.`
    - `Tried before. Didn't work. Burned out on it.`
    - `I have the time but no real system to follow`
    - `Scared to commit. Don't trust myself to follow through.`
    - `Skeptical. Been sold dreams before.`
  - validations: required=True
- **[multiple_choice]** Why now? What's pushing you to do something about it?  _(ref: `why_now`)_
  - choices:
    - `Sick of being stuck. Something has to change.`
    - `Life's just pushed me into it recently`
    - `I've been thinking about this for a long time. Ready to commit.`
    - `I see others succeeding with AI. I don't want to miss the window.`
  - validations: required=True
- **[long_text]** We're selective with who we work with. With limited spots available, *briefly tell us why you'd be a great fit for the program.*  _(ref: `why_you`)_
  - validations: required=True
- **[multiple_choice]** If we showed you a clear path that's already working for people in your exact situation, what's the plan?  _(ref: `intent`)_
  - choices:
    - `I'm ready to start immediately`
    - `I'd start within the next month if it's the right fit`
    - `I need more information before committing`
    - `I'm just exploring at this point`
  - validations: required=True
- **[multiple_choice]** What's your budget for this right now?  _(ref: `budget`)_
  - choices:
    - `$120: Tight on cash, but want something I can actually use`
    - `$250: I have a bit to invest. Want something practical to start with.`
    - `$360: Ready to invest in a real foundation`
    - `$500: I'm serious. Want something solid I can run with.`
    - `$750: Want the strongest setup I can get on my own`
    - `$1,500+: I'm ready to invest in proper coaching. Won't think twice.`
  - validations: required=True
- **[short_text]** First name?  _(ref: `first_name`)_
  - validations: required=True
- **[email]** Best email?  _(ref: `email`)_
  - validations: required=True
- **[phone_number]** Phone number?  _(ref: `phone`)_
  - validations: required=True

## Logic jumps
_No logic jumps._

## Thank-you screens
- **Application received.**  _(ref: `01KRCRWGFKT6S4R7HJ8Q37D79K`)_
  - description: We'll review your application and get back to you within 48 hours.
  - button: `again` → `default_redirect` ``
  - share_icons: True
- **All done! Thanks for your time.**  _(ref: `default_tys`)_

## Webhooks
_None._
