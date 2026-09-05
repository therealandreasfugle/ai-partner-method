# 7. The Google Sheet

**What it does for you:** this is the database behind your CRM. The scraper writes
leads into it, the CRM reads them out, and your pipeline lives in it. It is free
and you already own it.

**Cost:** free.

**This is the fiddliest step in the whole setup.** Twenty minutes, once. Take it
slowly and it works first time.

## The steps

The click by click instructions already exist and are accurate:
[`tools/lead-scraper/google-sheet/SETUP.md`](../tools/lead-scraper/google-sheet/SETUP.md)

In short: make a Sheet, open **Extensions > Apps Script**, paste in `Code.gs` from
that same folder, deploy it as a Web app with **Execute as: Me** and **Who has
access: Anyone**, authorise it, and copy the URL that ends in `/exec`.

## ⚠️ Do the optional password. It is not optional.

The setup guide calls `SHARED_TOKEN` optional. For a personal test it is. For a
real business holding real people's contact details it is not.

Left blank, that web app URL accepts a write from anyone on the internet who has
the link. It is a long random URL, which is not the same as being protected.

So set it. At the top of `Code.gs`:

```javascript
var SHARED_TOKEN = 'pick-something-long-and-random';
```

Redeploy, then put the same value in your `.env`:

```
SHEETS_WEBHOOK_TOKEN=pick-something-long-and-random
```

## Wire it to both sides

The scraper and the CRM both need to know about the Sheet.

**The scraper**, in `tools/lead-scraper/.env`:

```
SHEETS_WEBHOOK_URL=https://script.google.com/macros/s/xxxx/exec
SHEETS_WEBHOOK_TOKEN=your-token
```

**The CRM**, as environment variables on its Vercel project:

```
LEADS_SHEET_URL=https://script.google.com/macros/s/xxxx/exec
LEADS_SHEET_TOKEN=your-token
```

⚠️ **These must be the same URL.** The most confusing failure in this whole stack
is a scraper writing to one Sheet while the CRM reads another. Everything looks
like it works, and your leads never appear. If leads are missing, check these two
values match before you check anything else.

## Things that will confuse you later

**The formatting stops at row 2000.** `LAST_FMT_ROW` in `Code.gs` controls how far
the colours, the banner and the Status dropdown reach. Past 2,000 rows the sheet
looks half finished. Nothing is broken, and you can raise the number and redeploy.

**Keep a demo under about 800 leads.** The CRM pulls roughly 590 bytes per lead,
so a few thousand rows makes the table sluggish, which matters if you are showing
someone your screen.

**The sheet is 24 columns wide.** If you ever clear it by hand, clear the full
width. Clearing only the visible columns leaves data in the last two, Google still
counts those rows as used, and your next run appends below a screen of blanks.

**Re-running the same town gives you nothing.** The tool skips businesses already
in the Sheet, which is correct behaviour and looks like a failure. Use a different
town, or clear the tab first.

## Check it worked

```bash
curl "https://script.google.com/macros/s/xxxx/exec?stats=1"
```

That returns a count. If it returns HTML or an error, the deployment is not public
or the URL is wrong.
