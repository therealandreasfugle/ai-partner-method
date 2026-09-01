# Publish leads straight into a Google Sheet (optional, about 2 minutes)

By default the tool saves a CSV. If you want every run to drop leads into a live
Google Sheet automatically, do this once. No Google sign-in inside the tool, no
cloud console, no key files. You are just wiring the tool to your own Sheet.

## The fast way: copy the ready-made template

If you were given a template link, open it and click **File > Make a copy**. The
copy already has the script inside, so skip to **Step 4 (Deploy)** below.

## The manual way: set it up from scratch

### 1. Make a new Google Sheet
Go to https://sheets.new. Name it anything, for example "My Leads".

### 2. Open the script editor
In the Sheet, click **Extensions > Apps Script**. A code editor opens in a new
tab.

### 3. Paste the script
Delete whatever is in the editor, then open `Code.gs` from this folder, copy all
of it, and paste it in. Click the **Save** icon.

### 4. Deploy it as a web app
1. Top right, click **Deploy > New deployment**.
2. Click the gear icon and choose **Web app**.
3. Set **Execute as: Me**.
4. Set **Who has access: Anyone**. (This lets the tool post to it. The URL is
   long and random, so treat it like a password.)
5. Click **Deploy**.

### 5. Authorize it (first time only)
Google will ask you to authorize. Choose your account, click **Advanced**, then
**Go to (your project) (unsafe)**, then **Allow**. This is your own script
writing to your own Sheet, so it is safe.

### 6. Copy the web app URL
After deploying you get a **Web app URL** that ends in `/exec`. Copy it.

### 7. Paste it into your .env
Open the `.env` file in the main folder and add:

```
SHEETS_WEBHOOK_URL=https://script.google.com/macros/s/xxxxxxxx/exec
```

That is it. From now on every run appends its leads to your Sheet, on a tab
called **Leads**. The CSV is still saved too, as a backup.

## Optional: add a password
If you want to lock the endpoint down, set a value for `SHARED_TOKEN` at the top
of `Code.gs`, redeploy, and put the same value in your `.env`:

```
SHEETS_WEBHOOK_TOKEN=your-secret-word
```

## Notes
- Each run **appends**, it does not overwrite. Over time your Sheet becomes your
  full lead history.
- To confirm the endpoint is live, paste the URL into a browser. You should see
  `{"ok":true,"message":"local-lead-finder sheet endpoint is live"}`.
- If a run says it could not publish, check that the deployment is set to
  **Anyone** and that the URL in `.env` ends in `/exec`. Your CSV is safe either
  way.

## Stop chasing people who reply (the Reply Watcher)

`reply-watcher.gs` is a small script that watches your Gmail and, when a lead emails
you back, sets their Status to **Replied** in your Leads tab automatically, so the
follow-ups stop for anyone who responds. It runs in your own Google account. No
Make, no extra service.

1. Open your **Leads** Google Sheet.
2. **Extensions > Apps Script**.
3. Delete anything in the editor, paste the whole of **`reply-watcher.gs`**, Save.
4. In the function dropdown pick **installReplyWatcher**, click **Run**, and approve
   the permissions (it needs to read your Gmail and edit this sheet). It checks your
   replies now and keeps checking every 15 minutes.

Confirm it works (30 seconds): add a test row with a spare email of yours and the
Status **Contacted**, send yourself an email from that address, and within 15
minutes (or run **checkReplies** by hand from the editor) the row flips to
**Replied**. Delete the test row after. You can always set a lead to **Replied** by
hand from the Status dropdown as a backup.

The watcher also spots when a reply is really a "take me off your list" message
("unsubscribe", "remove me", "not interested", and the like) and sets that lead to
**Removed** instead, so they never hear from you again.

## Feed your dashboard

The same web app link from step 1 also powers the **Replies and pipeline** panel on
your outreach dashboard. In your dashboard's Vercel project, add an environment
variable **LEADS_SHEET_URL** set to that `/exec` link and redeploy. Full steps:
`dashboard/README.md`.

## The mini CRM

That same link also powers the **Lead CRM** (the dashboard's "Lead CRM" button):
every lead in one table with its email and call history, and a power-dial mode that
walks your call list. If you set your sheet up before the CRM existed, **re-paste
the latest `Code.gs`** here (Extensions > Apps Script, select all, paste, Save) and
redeploy the web app (Deploy > Manage deployments > edit > Deploy). That adds the
full-lead feed and the call statuses (Voicemail, No answer, Callback, Bad number).
Without it, the CRM will say it cannot read the sheet.
