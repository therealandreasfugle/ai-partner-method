# Outreach dashboard + autopilot

This one small app is both your **dashboard** and your **sender**. Once it is set
up, Vercel runs the sending for you **once a day, automatically**: it reads your
leads sheet, emails whoever is due (first touches, follow-ups, monthly nurtures),
skips anyone who replied or asked to be removed, respects the warm-up, and writes
the new statuses back to your sheet. There is also a **Send now** button on the
dashboard if you ever want to run it on the spot. No commands, ever.

The dashboard part shows how your cold email is really doing, visually:

- **The verdict**: one plain-English call (keep going, throttle down, or pause and
  fix) with the reasons, and reminders like "7 leads replied, answer them today".
- **Where your emails end up**: a funnel from sent to delivered to opened to
  clicked.
- **Stay under these lines**: bounce and spam meters with the danger limit marked.
- **Warm-up**: a ring showing today's sends against today's allowance, and what day
  of the warm-up you are on.
- **Replies and pipeline** (once your sheet is connected): who replied, your reply
  rate, and a colored bar of where every lead sits, plus an "answer these first"
  list.
- **Emails per day**, **domain health**, **which template wins**, and the **latest
  emails** with each one's status.

It runs entirely in YOUR Vercel account and reads YOUR Resend account and YOUR
leads sheet. Your API key stays on the server; the page only ever sees totals.

## Put it live (about 3 minutes, one time)

You need your free Vercel account and your Resend API key (the same one in `.env`).
The easiest way is to ask Claude: "deploy my outreach dashboard". To do it yourself:

1. In a terminal, from this `dashboard` folder, run `npx vercel deploy --prod` and
   follow the prompts (first time: it asks you to log in and to accept the defaults).
2. In the Vercel dashboard open the new project: Settings, then Environment
   Variables, and add `RESEND_API_KEY` with your key. Redeploy (Deployments, three
   dots on the latest, Redeploy).
3. Open the project URL. That page is your dashboard; bookmark it.

Optional: to lock the page, also add an environment variable `DASH_KEY` set to any
password. Then the dashboard only opens as `your-url/?k=that-password`.

### Lock it with a login

Prefer a proper username and password over the `?k=` link? Add four environment
variables in Vercel instead. Your password is never stored anywhere; only a
scrambled version of it is.

- `CRM_USERS`: who can sign in, comma separated, e.g. `alice,sam`.
- `CRM_PASS_SALT` and `CRM_PASS_HASH`: the scrambled password (generate both below).
- `AUTH_SECRET`: any long random string; it signs the login so nobody can fake it.

To make the salt and hash from your chosen password, run this once (it also prints
a ready-made `AUTH_SECRET`), then paste the three lines into Vercel:

```
node -e "const c=require('crypto');const s=c.randomBytes(16);console.log('CRM_PASS_SALT='+s.toString('hex'));console.log('CRM_PASS_HASH='+c.pbkdf2Sync(process.argv[1],s,600000,32,'sha256').toString('hex'));console.log('AUTH_SECRET='+c.randomBytes(32).toString('hex'))" "your-password-here"
```

The old `DASH_KEY` still works if you want the simpler option; use one or the other.
**If you lock the dashboard, also set `CRON_SECRET`** (any random string), or the
daily autopilot gets locked out and stops sending.

## Show replies (connect your leads sheet)

Resend cannot see replies; your leads Google Sheet can (the reply watcher marks
leads Replied or Removed there). To light up the "Replies and pipeline" panel:

1. Set up the sheet web app once if you have not (google-sheet/SETUP.md). Copy its
   `/exec` link, the same one that goes in `.env` as `SHEETS_WEBHOOK_URL`.
2. In Vercel add an environment variable `LEADS_SHEET_URL` set to that link (and
   `LEADS_SHEET_TOKEN` if you set a password in the sheet script), then redeploy.

## The mini CRM (calls, emails, and every lead in one place)

The dashboard has a **Lead CRM** button (top right). It opens a mini CRM that runs
on your leads sheet: every lead in one table, who has been contacted, when, on which
channel, and what happened, with the people who replied floated to the top. Click a
lead and you get its full story: a timeline of every email sent to it (with opens
and clicks, read from Resend) and every call you logged, plus everything the scraper
found (phone, email, website, address, rating, socials, notes).

From a lead you can **Call**, **Email**, change its **Status**, or add a dated
**note**.

**The power dialler is built for the desk.** Sit at your computer, click Call,
and the call rings out on your own number through the phone beside you: you talk
on the computer's mic or a headset, click what happened, and the next lead is
already on screen. Nobody ever types a number, and calls cost nothing extra.
It takes one pairing setup per computer, using the phone you already have:

- **Mac + iPhone**: open the **Phone app** on the Mac (macOS 26 or newer; on older
  Macs it is FaceTime > Settings > Calls from iPhone) and finish its setup, and on
  the iPhone turn on Settings > Phone > **Calls on Other Devices** and allow your
  Mac. Same Apple account on both, same Wi-Fi. The "iPhone calls are not
  available" error means one of those two switches is off.
- **Windows + Android**: install Microsoft's free **Phone Link** app (comes with
  Windows 11), pair your phone once, and clicking Call dials through your phone.
- **Windows + iPhone**: Phone Link also pairs with iPhones over Bluetooth for
  basic calling.
- **If clicking Call opens Zoom or Teams** instead of dialing, those apps grabbed
  phone links; pick the phone option when asked, or turn it off in that app.

The same steps live inside the CRM: open **How it works** (top right), "Call
from this computer".

**No computer around, or pairing fights you?** Open the CRM in your phone's
browser and tap Call: the phone's dialer opens with the number already filled.
That path needs zero setup and works for everyone.
Every change saves straight back to your Google Sheet, so the sheet, the dashboard,
and the CRM always agree.

**Your call scripts are editable in the CRM**: open any lead, and next to the
script hit **Edit**. Three plain-text boxes (no website, old site, voicemail),
placeholders like [business] and [owner] fill themselves per lead, and blanking a
box returns it to the default. Each box has a **"Start from a template"** menu
with ready scripts for every common situation (social media only, no email on
file, gatekeeper answered, callback, second call after the video, and more), so
you can pick one and tweak it instead of writing from scratch. During a call, the
script panel's **More** tab shows the situational scripts filled in for that
lead. Saves are stored quietly in your sheet's Scripts tab; you never need to
open it.

**Power dial** works through everyone still worth calling, hottest first: it shows
the phone script (filled in with your name and their details), you tap Call, then
tap what happened (Interested, Call back, Voicemail, No answer, Not interested, Bad
number) and it logs it and moves to the next lead. Voicemails, no-answers and
call-backs come round again next session; the rest drop out.

Setup is the same sheet connection as the replies panel:

1. Connect your leads sheet (set `LEADS_SHEET_URL`, above).
2. **Paste the latest `google-sheet/Code.gs`** into your sheet's Apps Script and
   redeploy the web app; that adds the full-lead feed the CRM reads. If the CRM says
   it cannot read the sheet, this is the step that was missed.
3. Optional: `OUTREACH_SENDER_NAME` puts your name in the phone script, and
   `RESEND_API_KEY` (already set for the dashboard) turns on the email history.

## Turn on the autopilot

The daily schedule ships with the app (`vercel.json`), so there is nothing to
enable. It just needs the same details your emails use, added once as Vercel
environment variables (Settings, Environment Variables, then redeploy). The easiest
way is to ask Claude to "set up my dashboard env vars".

## All the settings (Vercel environment variables)

Required for the dashboard:

- `RESEND_API_KEY`: your Resend key.

Required for the autopilot (sending):

- `RESEND_FROM`: e.g. `Your Name <you@yourdomain.com>` (your verified domain).
- `OUTREACH_VIDEO_LINK`: the one link in every email, your video demo.
- `OUTREACH_SENDER_NAME`: how you sign off.
- `LEADS_SHEET_URL`: your sheet web app link (also turns on the replies panel).

Optional:

- `RESEND_REPLY_TO`: where replies land (defaults to RESEND_FROM).
- `OUTREACH_SENDER_PHONE`: shown under your name; leave unset to drop it.
- `LEADS_SHEET_TOKEN`: only if your sheet script has a SHARED_TOKEN.
- `OUTREACH_DAILY_MAX`: raise the 40-a-day ceiling once the verdict stays green.
- `DASH_KEY`: locks the page behind `?k=`. If you set it, also set `CRON_SECRET`
  (any random string) so the daily schedule can still run.

The schedule runs once a day (some time within the hour after 16:00 UTC). If
nothing is due, it sends nothing. Anyone marked **Replied** or **Removed** in the
sheet is never emailed again; the sheet is checked at the moment of sending.

## One switch that matters

In Resend, open **Domains**, click your domain, and turn on **open tracking** and
**click tracking**. Without that, Resend cannot see opens and clicks, and the
dashboard will show zeros for both. Turn it on before you start sending.

## Reading the verdict

- **Healthy**: bounces under 2 percent, spam complaints under 0.1 percent. Keep
  going. If you are steady at your daily cap, raise `OUTREACH_DAILY_MAX` in your
  `.env` a little at a time.
- **Throttle down**: something is drifting. Hold or lower your pace for a few days
  and watch this page.
- **Pause and fix**: bounces or spam complaints are at damaging levels. Stop
  sending on this domain, fix the cause (bad list, too much volume, copy that reads
  like spam), or start a fresh domain.
