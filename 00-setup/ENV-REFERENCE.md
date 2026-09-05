# Environment variables

Every key and setting, what it does, and which project it belongs to.

**Two places these live.** Local tools read a `.env` file in their own folder.
Anything deployed to Vercel reads that project's environment settings instead.
Never put a key in a file you commit.

---

## Local: `tools/lead-scraper/.env`

| Variable | Required | What it is |
|---|---|---|
| `APIFY_API_TOKEN` | Yes | Your Apify key. Add `_2`, `_3` for more, rotated automatically |
| `SHEETS_WEBHOOK_URL` | Yes | Your Apps Script `/exec` URL |
| `SHEETS_WEBHOOK_TOKEN` | Yes | The password you set in `Code.gs` |
| `RESEND_API_KEY` | For outreach | Sends the cold email |
| `RESEND_FROM` | For outreach | `You <you@youroutreachdomain.com>` |
| `RESEND_REPLY_TO` | Optional | Where replies go, if different |
| `OUTREACH_DAILY_MAX` | Optional | Hard cap per day. Start low. See email warmup |
| `OUTREACH_SENDER_NAME` | For outreach | Your name, used in the templates |
| `OUTREACH_SENDER_PHONE` | For outreach | Your number, used in the templates |
| `OUTREACH_VIDEO_LINK` | Optional | Your VSL page, if you send one |

---

## Vercel project: your CRM

| Variable | Required | What it is |
|---|---|---|
| `LEADS_SHEET_URL` | Yes | Same `/exec` URL as the scraper. **These must match** |
| `LEADS_SHEET_TOKEN` | Yes | Same token as the scraper |
| `CRM_USERS` | Yes | Comma separated logins, usually just your email |
| `CRM_PASS_SALT` | Yes | Generated, see below |
| `CRM_PASS_HASH` | Yes | Generated, see below |
| `AUTH_SECRET` | Yes | Generated, see below |
| `RESEND_API_KEY` | For sequences | |
| `RESEND_FROM` | For sequences | |
| `THANKYOU_URL` | For reviews | Your deployed customer thank you page |
| `REFERRAL_REWARD` | For referrals | What a referrer gets |
| `REFERRAL_CASH_CAP` | For referrals | Yearly cash cap per person |
| `REFERRAL_KEYWORD` | For referrals | The word customers quote |

Generate the three secrets in one go:

```bash
node -e "const c=require('crypto');const s=c.randomBytes(16);console.log('CRM_PASS_SALT='+s.toString('hex'));console.log('CRM_PASS_HASH='+c.pbkdf2Sync(process.argv[1],s,600000,32,'sha256').toString('hex'));console.log('AUTH_SECRET='+c.randomBytes(32).toString('hex'))" "your-password-here"
```

⚠️ Environment changes only take effect on a **new deployment**. Change a variable,
then redeploy, or nothing happens.

---

## Vercel project: each client website

One project per client. This is the set that makes their leads actually reach them.

| Variable | Required | What it is |
|---|---|---|
| `GROQ_API_KEY` | Yes | The AI chatbot. Free |
| `RESEND_API_KEY` | Yes | Sends the lead alert |
| `LEAD_FROM` | Yes | A verified sender on **your** domain |
| `LEAD_TO` | Yes | **The client's** email. Comma separate for their team |
| `SLACK_WEBHOOK_URL` | Optional | Their Slack channel |
| `LEAD_SHEET_URL` | Optional | Logs the enquiry to a Sheet as well |
| `CHAT_MODEL` | Optional | Override the chatbot model |

⚠️ `LEAD_TO` is the client's address, `LEAD_FROM` is yours. Getting these the wrong
way round means the client never hears about their own leads.

---

## Vercel project: your proposal

| Variable | Required | What it is |
|---|---|---|
| `RESEND_API_KEY` | Yes | |
| `RESEND_FROM` | Yes | A verified sender |
| `AGENCY_EMAIL` | Yes | Where the signed contract copy goes |
| `SIGNING_SECRET` | Yes | Any long random string. Without it the sign button says signing is not configured |

---

## Vercel project: your onboarding form

| Variable | Required | What it is |
|---|---|---|
| `RESEND_API_KEY` | Yes | |
| `ONBOARDING_FROM` | Yes | A verified sender |
| `ONBOARDING_TO` | Yes | Where the answers land |

---

## Vercel project: the instant builder, if you run your own

| Variable | Required | What it is |
|---|---|---|
| `BUILD_SECRET` | Yes | Any long random string. **Must match** `INSTANT_BUILD_SECRET` on your CRM |
| `GROQ_API_KEY` | Yes | Writes the site copy, free |
| `GEMINI_API_KEY` | Optional | Fallback when Groq is busy |
| `TEMPLATE_BASE` | Yes | Where your templates gallery is deployed |
| `SUPABASE_URL` | Yes | Your own Supabase project |
| `SUPABASE_SERVICE_ROLE_KEY` | Yes | Your own. Server side only, never in a page |

⚠️ `BUILD_SECRET` and `INSTANT_BUILD_SECRET` are a pair. Rotate one, rotate both,
or the builder returns 401 and the Build button stops working.

⚠️ **Never use a paid key here.** The builder is written to use free providers
only. `OPENAI_API_KEY` is supported by some code paths and costs real money.

---

## Checking it

```bash
python3 00-setup/setup_check.py
```

Reports what is set, what is missing, and whether your Apify key actually works.
It never sends an email and never spends credit.
