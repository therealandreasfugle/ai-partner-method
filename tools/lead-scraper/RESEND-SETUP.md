# Send your outreach with Resend (preferred)

This is the recommended way to email your leads. Once it is set up, every scrape can
email your leads automatically: you add `--email` to your search and the tool sends
each new lead one of six short templates, then follows up to five more times until
they reply. Every email carries one link, your video demo, and the whole message is
built to get the lead to book a call.

You set this up once. It takes about 20 minutes, most of it waiting for your domain
to connect. You need three accounts, all free to open:

1. A **Resend** account at https://resend.com (free: 100 emails a day, 3,000 a
   month). This is what actually sends your emails.
2. Your **own domain** (about $10 to $12 a year), so your emails come from
   `your-name@your-domain.com` and land in inboxes instead of spam.
3. A **Vercel** account at https://vercel.com (free), used to put your outreach
   dashboard live so you can watch how the emails are doing (Step 7).

> Why your own domain? Cold emails from a plain Gmail address get filtered fast. A
> real domain you have verified is what keeps you in the inbox. It is the single most
> important part of this, so do not skip it.

---

## Step 1: Get your Resend API key

1. Go to **https://resend.com** and sign up (free).
2. In the left menu click **API Keys**, then **Create API Key**.
3. Name it anything, leave permission on **Full access**, and click **Add**.
4. Copy the key (it starts with `re_`). You only see it once.

Then hand it to Claude and say **"put this Resend key in my .env"** and paste it. (Or
add the line `RESEND_API_KEY=re_your_key_here` to your `.env` yourself.)

---

## Step 2: Buy a domain (about $12 a year)

Any registrar works. Good cheap ones: **Porkbun**, **Namecheap**, **Cloudflare**,
**GoDaddy**. Pick a short, sensible name (it does not have to be your business name;
`yourname-sites.com` is fine).

> Tip: buy a separate, cheap domain just for outreach and keep it away from any domain
> you use for real business. If the outreach domain ever picks up a bad reputation, it
> does not touch anything important.

---

## Step 3: Connect your domain to Resend

This is what makes your emails trusted. You copy a few settings from Resend into your
registrar, one time.

1. In Resend, click **Domains**, then **Add Domain**, type your domain, click **Add**.
2. Resend shows a list of **DNS records** (a few rows: TXT, MX, CNAME). Keep it open.
3. In another tab, log in to your registrar and open the **DNS** settings for your
   domain.
4. For each row Resend shows, add a matching record at your registrar: copy the
   **Type**, **Name/Host**, and **Value** exactly. Save each one.
5. Back in Resend, click **Verify**. It can take a few minutes up to a couple of hours
   to show **Verified** (green). You do not have to watch it.
6. While you are on your domain's page in Resend, turn on **open tracking** and
   **click tracking**. Without this, Resend cannot see who opens or clicks, and your
   dashboard (Step 7) will show zeros for both.

   - **Open tracking** works the moment you switch it on, nothing else needed.
   - **Click tracking** asks you to set up a tracking subdomain (Resend suggests a
     name like `links.yourdomain.com`). This is normal: every link in your emails
     gets counted by briefly passing through that subdomain before landing on the
     real page, and using your own domain for it keeps your emails trusted. Resend
     shows you ONE more DNS record (a CNAME); add it at your registrar exactly like
     the records in step 5, wait a few minutes, and it goes green. It does not
     affect your website or anything else on your domain.
   - Only emails sent AFTER you switch these on get counted. Emails sent before
     have no tracking in them and will always show as unopened.

> Stuck on the records? Screenshot the Resend records page and your registrar's DNS
> page and ask Claude exactly what to type where. This is the one fiddly step.

---

## Step 4: Make your video demo, then fill in your details

The one link in every email is your **video demo**. Record a short (1 to 2 minute)
video, for example a walkthrough of a sample site you would build them, and put it
somewhere with a **"book a call" button on the page** (Loom lets you add a call to
action button; a simple landing page works too). That way the single link both sells
and books. If there is no button, people can still just reply.

Tell Claude **"set up my Resend sending details in .env"** with your video link, your
name, and your phone. Or edit `.env` so it has these lines (see `.env.example`):

```
RESEND_API_KEY=re_your_key_here
RESEND_FROM=Your Name <you@yourname-sites.com>
RESEND_REPLY_TO=your-normal-email@gmail.com

OUTREACH_VIDEO_LINK=https://www.loom.com/share/your-demo
OUTREACH_SENDER_NAME=Your Name
OUTREACH_SENDER_PHONE=+1 555 123 4567
```

- **RESEND_FROM** must use your verified domain (the part after the `@`). The name in
  front of the `<` is what recipients see as the sender.
- **RESEND_REPLY_TO** is where replies land: use your normal everyday email.
- **OUTREACH_VIDEO_LINK** is your video demo (the only link in the email).
- Phone is optional; leave it blank and it drops off the signature.

The exact wording that sends is in `EMAIL-TEMPLATES.md`. You can edit it, just keep at
least six rotating first-touch versions and one link each.

---

## Step 5: Test on yourself first

Before emailing real businesses, preview and send to your own inbox.

Preview who would be contacted, without sending anything:

```
python3 find_leads.py "dentists" "your town" --email-dry-run
```

Then send for real but tiny, and check your own inbox (including Spam) to confirm it
looks good:

```
python3 send_emails.py leads/your-file.csv --limit 2
```

`send_emails.py` also runs on a CSV you already have, with `--dry-run` to preview or
`--limit N` to override the daily cap.

---

## Step 6: Go live

Add `--email` to any search and it scrapes, then emails:

```
python3 find_leads.py --sweep "Manchester, UK" --country uk --email
```

**What happens on that run:** every new lead with an email gets one of the six
templates (rotated), and is tagged **Contacted** with the date in your CSV, so it is
never emailed twice.

### The follow-ups (this is the important part)

The tool does not just send once. Each time you run the outreach, it looks at your CSV
and sends whatever is **due**:

- 3 days after the first email, a lead that has not replied gets Follow-up 1.
- 7 days after that, Follow-up 2. Then 14, then 21, then 30 days for Follow-ups 3, 4,
  and 5. Each gap is bigger, so you never look like a nag.
- After the fifth follow-up, they get one gentle email a month to stay top of mind,
  until they reply or ask to be removed.
- A lead who replies drops out of the rest. If they reply asking to be taken off
  ("remove me", "unsubscribe", "stop"), the Google Sheet reply-watcher marks them
  **Removed** automatically, so they get nothing further (see `google-sheet/SETUP.md`
  to switch it on). You can also mark any lead Replied or Removed by hand.

### The autopilot sends these for you (nothing to run)

You do not run anything day to day. Your dashboard app (Step 7) doubles as the
sender: once it is deployed with your details and your leads sheet connected,
**Vercel runs it once a day by itself**. Each run it reads your sheet, emails
whoever is due, skips anyone marked Replied or Removed, stays inside the warm-up
allowance, and updates the sheet. If nothing is due, it sends nothing. Want to run
it right now instead of waiting? There is a **Send now** button on the dashboard.

So the daily routine is: scrape when you want fresh leads, glance at the dashboard,
answer replies. That is it.

(No Google Sheet? The fallback is running `python3 send_emails.py leads/your-file.csv`
once a day yourself against the CSV. The sheet plus autopilot is the recommended
path, and it is what makes removals bulletproof.)

### Warm-up is automatic (and slow, on purpose)

You do not manage the daily number. Following cold-email best practice, a brand-new
domain starts at just **5 emails a day** and adds about **2 more each day**, reaching
about **40 a day in roughly two and a half weeks**, so it earns a good reputation
instead of getting flagged. The autopilot counts what has really gone out today by
asking Resend itself, so it can never double-spend the allowance (the local command
keeps its own count in `.outreach_warmup.json`). To send more than about 40 a day,
warm a **second domain** rather than pushing one harder (that is how the pros
scale). The dashboard's warm-up ring shows exactly where you are.

---

## Step 7: Put your dashboard live (it is also your autopilot)

The `dashboard` folder in this repo is one small app that does two jobs in your own
free Vercel account: it **shows** how the outreach is doing (a plain-English
verdict, a funnel of sent to clicked, bounce and spam meters, your warm-up ring,
replies and pipeline, which template wins) and it **runs the daily sending for
you** on a schedule, with a Send now button for whenever you want. Deploying takes
about 3 minutes; the easiest way is to ask Claude to "deploy my outreach dashboard
and set up its env vars". Full steps are in `dashboard/README.md`. Connect your
Google Sheet (one environment variable) and you get replies on screen plus
bulletproof removals.

Check it every day or two. It is how you decide, with real numbers, when to speed
up, slow down, or move to a fresh domain.

### Scaling past 40 a day

The warm-up tops out at 40 a day on purpose; one domain pushed harder than that
starts looking like a spammer. When your dashboard has shown green (bounces under 2
percent, spam under 0.1 percent) for a week or two at 40 a day, you have two good
ways to grow:

- Raise the cap a little at a time: add `OUTREACH_DAILY_MAX=45` to your `.env`,
  watch the dashboard for a few days, then 50, and so on (never above Resend's 100
  a day free limit).
- Or better, add a second cheap domain and warm it up the same way. Two healthy
  domains at 40 beat one strained domain at 80.

---

## If something goes wrong

- **Resend says the domain is not verified.** The DNS records are not fully in place.
  Recheck Step 3, make sure each record's Type, Name, and Value match exactly, then
  wait and hit Verify again (new domains can take an hour or two).
- **Emails land in spam.** Usually too much too soon, or a very new domain. The
  automatic warm-up already paces you; keep sending a little each day and it improves.
- **Resend warns about or blocks your account.** Resend is stricter about cold
  outreach than Gmail. If an account gets flagged, open a fresh Resend account (and,
  if needed, a different domain) and carry on.
- **A send fails with a "403" or "1010".** The tool already handles the common
  Cloudflare block automatically. If you still see a 403, your key is wrong or the
  domain is not verified yet.

---

## Prefer not to buy a domain? Use Make.com + Gmail instead

Resend is preferred because it is fully automatic and inbox-friendly. But if you would
rather send from your own Gmail with nothing to buy, there is a free **Make.com**
alternative that runs the same six templates plus follow-ups and an automatic
reply-stop. It is a bit more setup and sends from Gmail. See **make/SETUP.md**.
