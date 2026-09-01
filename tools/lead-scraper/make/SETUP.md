# Automate your outreach emails (optional, about 20 minutes)

Once your leads are in a Google Sheet, this sets up your outreach to run for you:

1. **Outreach Engine** (a Make.com scenario) - emails each new lead, then follows
   up three times if they do not reply (day 3, day 7, day 14), and marks each stage
   in your sheet.
2. **Reply Watcher** (a small Google Apps Script on your sheet) - the moment a lead
   emails you back, it marks them **Replied**, so anyone who responds automatically
   stops getting follow-ups.

Together that is up to **four emails** per lead, sent for you, that stop themselves
the instant someone replies. The Engine runs in Make (free plan); the Reply Watcher
runs in your own Google account, so it does not use a second Make scenario.

You need your leads in a Google Sheet first. Follow `../google-sheet/SETUP.md` so
the scraper publishes to a sheet with a tab called **Leads**. Both automations
read and update that tab.

There are two ways to set up the Engine. The **manual steps below work on Make's
free plan**. If you are on a paid Make plan, there is a one-command shortcut for
the Engine at the end (see **Faster setup**). The Reply Watcher is a separate
two-minute Apps Script setup (see "The Reply Watcher" below).

---

## What you will connect

- A free **Make.com** account (the automations run here).
- Your **Gmail** (emails send from your own address, and replies are read from it).
- Your **Google Sheet** of leads (new leads are emailed, statuses are updated).

---

## Scenario 1: the Outreach Engine

### 1. Make a free Make account
Go to **https://www.make.com** and sign up. The free plan is enough to start.

### 2. Import the Engine
1. Click **Create a new scenario** (top right).
2. In the editor, click the **three dots** at the bottom of the screen.
3. Click **Import Blueprint**.
4. Choose the file **`make/blueprint.json`** from this folder. Click **Save**.

You will see the whole flow: a "Scan the leads" step, a "Set the details" step, and
a set of email steps (the first email has six rotating versions, then the three
follow-ups) that each update the lead's status.

### 3. Connect your Gmail
Click any **email step**. Where it asks for a connection, click **Add**, sign in
with the Gmail you want to send from, and allow access. You sign in once; every
email step reuses the same connection.

### 4. Connect your Google Sheet
1. Click the first step, **Scan the leads**. Click **Add** on the connection and
   sign in with the Google account that owns your leads sheet.
2. Choose your **spreadsheet**, then the tab called **Leads**.
3. If it asks which row your headings are on, choose **Row 2** (row 1 is a title
   bar, row 2 the headings).
4. Click each **Mark** step (Mark Contacted, Mark Follow-up 1, 2, 3) and pick the
   **same** spreadsheet and **Leads** tab.

### 5. Fill in your details (once)
Click **Set the details** and replace the four values with yours:

- **demo_link** - a link to a sample site you built (their sneak peek).
- **booking_link** - your Calendly or booking page.
- **sender_name** - your name.
- **sender_phone** - your phone.

That is the only place you type these. Every email uses them automatically.

### 6. Schedule it and turn it on
Bottom left, set the **schedule** to run **once or twice a day**. Because the
follow-ups are timed from the date each lead was first contacted, it does not need
to run more often. Flip the **ON** switch.

From now on, every new lead with an email gets the first message and is marked
**Contacted**, and anyone who has not replied gets the day 3, day 7, and day 14
notes on their own.

---

## The Reply Watcher (stops chasing people who reply)

The Reply Watcher is a small Google Apps Script that lives on your Leads sheet, not
a Make scenario, so it does not use up a Make slot. It watches your Gmail and, when
a lead emails you back, sets their Status to **Replied** so the Engine stops
following up.

Setup is about two minutes and lives with the sheet tools: see
**`../google-sheet/SETUP.md`** under "Stop chasing people who reply", or the
instructions at the top of **`../google-sheet/reply-watcher.gs`**. In short: open
your Leads sheet, **Extensions > Apps Script**, paste `reply-watcher.gs`, and run
**installReplyWatcher** once.

Marking a lead **Replied** by hand from the Status dropdown always works too, as a
backup.

---

## Warm up your sending (protect your inbox reputation)

Cold email only works if it reaches the inbox. A brand-new Gmail that suddenly
sends a hundred messages a day looks like spam to Google, and your emails start
landing in junk. The Engine emails every new lead in your sheet each run, so
**control your pace by how many leads you add at once**:

- Days 1 to 3: add about **15 to 20** leads to the sheet per day.
- Days 4 to 7: about **30** a day.
- Week 2 onward: **50** or so a day.

Paste new leads in small batches during warm-up rather than your whole list at
once. After a couple of weeks of steady sending you can add larger batches. A
normal Gmail tops out around 500 emails a day, and a new one much less, so there
is no rush.

The lead finder already drops emails on dead or mistyped domains before they reach
your sheet, so you are not firing at addresses that bounce (bounces are one of the
fastest ways to get flagged). Leads with no email are meant to be called.

---

## Keep an eye on the free plan

Make's free plan includes **1,000 operations a month**. The Engine uses about
three per lead it emails (read, send, mark), plus about two more over the lead's
life for the follow-ups. A few hundred leads a month still fits comfortably. If you
run low, run the Engine less often, or upgrade Make. The Reply Watcher runs in your
own Google account (Apps Script), not Make, so it uses none of these operations.

---

## Faster setup for the Engine (paid Make plans only)

If you are on a **paid** Make plan (Core, about $9 a month, or higher), you can let
a script build the Engine for you. Make's API is not on the free plan, so this only
works once you have upgraded. On free, use the manual import above.

1. **Get a Make API token.** Profile picture (bottom left) > **Profile** > **API**
   tab > **Add token**. Tick the scopes, copy the token.
2. **Find your zone.** Your Make URL starts with something like
   `https://eu2.make.com`. The part before `.make.com` (here `eu2`) is your zone.
3. **Put both in your `.env`:**
   ```
   MAKE_API_TOKEN=your_token_here
   MAKE_ZONE=eu2
   ```
4. **Run it:**
   ```
   python3 make/install_scenario.py
   ```
   It builds the Engine on your account and prints a link. Running it twice does
   not create a duplicate. Then open the link and do **steps 3 to 6** above.

The Reply Watcher is separate and is not a Make scenario at all (see "The Reply
Watcher" above).

---

## Change the wording
The exact text of every email is in `../EMAIL-TEMPLATES.md`. To change what sends,
open the matching **email step** in Make and edit the subject or body (keep the
body type set to **HTML** so the spacing stays clean).

## Troubleshooting
- **Nothing sends** - check the Engine is **ON**, and that new leads have something
  in the **email** column. Leads with no email are skipped on purpose (call those).
- **Replies are not auto-marking Replied** - open the Reply Watcher on your sheet
  (**Extensions > Apps Script**) and run **checkReplies** to surface any error, or
  redo its 30-second confirmation in `../google-sheet/SETUP.md`. You can always mark
  a lead **Replied** by hand from the Status dropdown as a backstop.
- **It emailed a lead twice** - make sure only **one** copy of the Engine is ON.
- **Sending stopped after a lot of emails** - Gmail's daily limit. Wait a day, or
  add leads in smaller batches.
- **A business name looks odd in an email** - the emails do not use the business
  name, so this will not happen; if a link looks wrong, fix demo_link/booking_link
  in **Set the details**.
